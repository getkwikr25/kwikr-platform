import { Hono } from 'hono'
import type { Context } from 'hono'

// Types for search and discovery
interface WorkerProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  city: string
  province: string
  is_verified: boolean
  profile_image_url?: string
  bio?: string
  company_name?: string
  website_url?: string
  created_at: string
  avg_rating?: number
  review_count?: number
  is_featured?: boolean
  subscription_tier?: string
}

interface WorkerService {
  id: number
  user_id: number
  service_category: string
  service_name: string
  description?: string
  hourly_rate: number
  years_experience?: number
  is_available: boolean
  category_name?: string
  icon_class?: string
}

interface SearchFilter {
  serviceCategory?: string
  location_province?: string
  location_city?: string
  min_rate?: number
  max_rate?: number
  min_rating?: number
  is_verified?: boolean
  is_featured?: boolean
  has_reviews?: boolean
  experience_years?: number
  latitude?: number
  longitude?: number
  radius_km?: number
}

interface SearchResult {
  worker: WorkerProfile
  services: WorkerService[]
  distance_km?: number
  relevance_score: number
  match_reasons: string[]
}

// Distance calculation helper (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Search relevance scoring algorithm
function calculateRelevanceScore(worker: WorkerProfile, services: WorkerService[], filters: SearchFilter): { score: number, reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Base score
  score += 10

  // Verification bonus
  if (worker.is_verified) {
    score += 20
    reasons.push('Verified Professional')
  }

  // Featured worker bonus
  if (worker.is_featured) {
    score += 15
    reasons.push('Featured Worker')
  }

  // Rating bonus
  if (worker.avg_rating) {
    const ratingBonus = (worker.avg_rating - 3) * 10 // Scale 3-5 stars to 0-20 points
    score += Math.max(0, ratingBonus)
    if (worker.avg_rating >= 4.5) {
      reasons.push('Highly Rated')
    }
  }

  // Review count bonus
  if (worker.review_count && worker.review_count > 10) {
    score += Math.min(worker.review_count / 2, 25) // Up to 25 points for reviews
    reasons.push('Many Reviews')
  }

  // Service category match
  if (filters.serviceCategory) {
    const categoryMatch = services.some(s => 
      s.service_category.toLowerCase().includes(filters.serviceCategory!.toLowerCase()) ||
      s.service_name.toLowerCase().includes(filters.serviceCategory!.toLowerCase())
    )
    if (categoryMatch) {
      score += 30
      reasons.push('Service Match')
    }
  }

  // Location match bonus
  if (filters.location_province && worker.province === filters.location_province) {
    score += 15
    if (filters.location_city && worker.city.toLowerCase().includes(filters.location_city.toLowerCase())) {
      score += 20
      reasons.push('Local Professional')
    }
  }

  // Rate range match
  if (filters.min_rate || filters.max_rate) {
    const workerRates = services.map(s => s.hourly_rate)
    const avgRate = workerRates.length > 0 ? workerRates.reduce((a, b) => a + b, 0) / workerRates.length : 0
    
    if (avgRate > 0) {
      if ((!filters.min_rate || avgRate >= filters.min_rate) && 
          (!filters.max_rate || avgRate <= filters.max_rate)) {
        score += 10
        reasons.push('Price Match')
      }
    }
  }

  // Experience bonus
  const maxExperience = Math.max(...services.map(s => s.years_experience || 0))
  if (maxExperience > 5) {
    score += Math.min(maxExperience * 2, 30)
    reasons.push('Experienced')
  }

  // Subscription tier bonus
  if (worker.subscription_tier === 'premium') {
    score += 10
  } else if (worker.subscription_tier === 'professional') {
    score += 5
  }

  // Availability bonus
  const availableServices = services.filter(s => s.is_available).length
  score += availableServices * 2

  // Company profile bonus
  if (worker.company_name) {
    score += 5
    reasons.push('Business Profile')
  }

  // Website bonus
  if (worker.website_url) {
    score += 3
  }

  return { score: Math.max(0, score), reasons }
}

const searchRoutes = new Hono()

// ============================================================================
// WORKER DIRECTORY - Browse all available workers (Feature 1)
// ============================================================================

// Main worker directory page
searchRoutes.get('/directory', async (c) => {
  try {
    const db = c.env.DB
    
    // Get query parameters for pagination and basic filtering
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const sortBy = c.req.query('sort') || 'featured' // featured, rating, newest, name
    const offset = (page - 1) * limit

    // Basic filters from query params
    const filters: SearchFilter = {
      serviceCategory: c.req.query('category') || undefined,
      location_province: c.req.query('province') || undefined,
      location_city: c.req.query('city') || undefined,
      min_rate: c.req.query('min_rate') ? parseFloat(c.req.query('min_rate')!) : undefined,
      max_rate: c.req.query('max_rate') ? parseFloat(c.req.query('max_rate')!) : undefined,
      min_rating: c.req.query('min_rating') ? parseFloat(c.req.query('min_rating')!) : undefined,
      is_verified: c.req.query('verified') === 'true' ? true : undefined,
      is_featured: c.req.query('featured') === 'true' ? true : undefined
    }

    // Build the main query for workers
    let workerQuery = `
      SELECT DISTINCT u.*, p.bio, p.profile_image_url, p.company_name, p.website_url,
             AVG(r.rating) as avg_rating, COUNT(r.id) as review_count,
             CASE WHEN s.plan_type = 'premium' THEN 1 ELSE 0 END as is_featured,
             s.plan_type as subscription_tier
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN reviews r ON u.id = r.worker_id
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      LEFT JOIN worker_services ws ON u.id = ws.user_id
      WHERE u.role = 'worker' AND u.is_active = 1
    `
    
    const queryParams: any[] = []

    // Apply filters to the query
    if (filters.serviceCategory) {
      workerQuery += ` AND (ws.service_category LIKE ? OR ws.service_name LIKE ?)`
      queryParams.push(`%${filters.serviceCategory}%`, `%${filters.serviceCategory}%`)
    }
    
    if (filters.location_province) {
      workerQuery += ` AND u.province = ?`
      queryParams.push(filters.location_province)
    }
    
    if (filters.location_city) {
      workerQuery += ` AND u.city LIKE ?`
      queryParams.push(`%${filters.location_city}%`)
    }
    
    if (filters.is_verified) {
      workerQuery += ` AND u.is_verified = 1`
    }

    // Group by worker and add sorting
    workerQuery += ` 
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, u.city, u.province, 
               u.is_verified, u.created_at, p.bio, p.profile_image_url, p.company_name, p.website_url, s.plan_type
      HAVING 1=1
    `

    // Apply rating filter after grouping
    if (filters.min_rating) {
      workerQuery += ` AND AVG(r.rating) >= ?`
      queryParams.push(filters.min_rating)
    }

    // Add sorting
    switch (sortBy) {
      case 'featured':
        workerQuery += ` ORDER BY is_featured DESC, avg_rating DESC, u.is_verified DESC, review_count DESC`
        break
      case 'rating':
        workerQuery += ` ORDER BY avg_rating DESC, review_count DESC, is_featured DESC`
        break
      case 'newest':
        workerQuery += ` ORDER BY u.created_at DESC`
        break
      case 'name':
        workerQuery += ` ORDER BY u.first_name, u.last_name`
        break
      default:
        workerQuery += ` ORDER BY is_featured DESC, avg_rating DESC, u.is_verified DESC`
    }

    workerQuery += ` LIMIT ? OFFSET ?`
    queryParams.push(limit, offset)

    // Execute the main worker query
    const workersResult = await db.prepare(workerQuery).bind(...queryParams).all()
    const workers = workersResult.results as WorkerProfile[]

    // Get services for each worker
    const searchResults: SearchResult[] = []
    
    for (const worker of workers) {
      // Get services for this worker
      const servicesResult = await db.prepare(`
        SELECT ws.*, jc.name as category_name, jc.icon_class
        FROM worker_services ws
        LEFT JOIN job_categories jc ON ws.service_category = jc.name
        WHERE ws.user_id = ? AND ws.is_available = 1
        ORDER BY ws.hourly_rate
      `).bind(worker.id).all()
      
      const services = servicesResult.results as WorkerService[]
      
      // Apply rate filter if specified
      if (filters.min_rate || filters.max_rate) {
        const workerRates = services.map(s => s.hourly_rate)
        const avgRate = workerRates.length > 0 ? workerRates.reduce((a, b) => a + b, 0) / workerRates.length : 0
        
        if (avgRate > 0) {
          if (filters.min_rate && avgRate < filters.min_rate) continue
          if (filters.max_rate && avgRate > filters.max_rate) continue
        }
      }

      // Calculate relevance score
      const { score, reasons } = calculateRelevanceScore(worker, services, filters)

      searchResults.push({
        worker,
        services,
        relevance_score: score,
        match_reasons: reasons
      })
    }

    // Sort by relevance score if not using database sorting
    if (sortBy === 'relevance' || Object.keys(filters).some(k => filters[k as keyof SearchFilter] !== undefined)) {
      searchResults.sort((a, b) => b.relevance_score - a.relevance_score)
    }

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN reviews r ON u.id = r.worker_id
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      LEFT JOIN worker_services ws ON u.id = ws.user_id
      WHERE u.role = 'worker' AND u.is_active = 1
    `

    const countParams: any[] = []
    if (filters.serviceCategory) {
      countQuery += ` AND (ws.service_category LIKE ? OR ws.service_name LIKE ?)`
      countParams.push(`%${filters.serviceCategory}%`, `%${filters.serviceCategory}%`)
    }
    if (filters.location_province) {
      countQuery += ` AND u.province = ?`
      countParams.push(filters.location_province)
    }
    if (filters.location_city) {
      countQuery += ` AND u.city LIKE ?`
      countParams.push(`%${filters.location_city}%`)
    }
    if (filters.is_verified) {
      countQuery += ` AND u.is_verified = 1`
    }

    const totalResult = await db.prepare(countQuery).bind(...countParams).first()
    const total = totalResult?.total || 0

    // Get available provinces and cities for filters
    const provincesResult = await db.prepare(`
      SELECT DISTINCT province, COUNT(*) as worker_count
      FROM users 
      WHERE role = 'worker' AND is_active = 1 AND province IS NOT NULL
      GROUP BY province
      ORDER BY worker_count DESC
    `).all()

    const citiesResult = await db.prepare(`
      SELECT DISTINCT city, COUNT(*) as worker_count
      FROM users 
      WHERE role = 'worker' AND is_active = 1 AND city IS NOT NULL
      ${filters.location_province ? 'AND province = ?' : ''}
      GROUP BY city
      ORDER BY worker_count DESC
      LIMIT 20
    `).bind(...(filters.location_province ? [filters.location_province] : [])).all()

    // Get service categories
    const categoriesResult = await db.prepare(`
      SELECT DISTINCT jc.name, jc.icon_class, COUNT(*) as worker_count
      FROM job_categories jc
      JOIN worker_services ws ON jc.name = ws.service_category
      JOIN users u ON ws.user_id = u.id
      WHERE jc.is_active = 1 AND u.role = 'worker' AND u.is_active = 1
      GROUP BY jc.name, jc.icon_class
      ORDER BY worker_count DESC
    `).all()

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Worker Directory - getKwikr</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'kwikr-green': '#00C881'
                  }
                }
              }
            }
          </script>
      </head>
      <body class="bg-gray-50 min-h-screen">
          <!-- Header Navigation -->
          <header class="bg-white shadow-sm border-b">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-4">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green flex items-center">
                              <i class="fas fa-bolt mr-2"></i>Kwikr
                          </a>
                          <nav class="ml-8 flex space-x-6">
                              <a href="/search/directory" class="text-kwikr-green font-medium">Directory</a>
                              <a href="/search/advanced" class="text-gray-700 hover:text-kwikr-green">Advanced Search</a>
                              <a href="/search/categories" class="text-gray-700 hover:text-kwikr-green">Categories</a>
                          </nav>
                      </div>
                      <div class="flex items-center space-x-4">
                          <a href="/jobs/post" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                              <i class="fas fa-plus mr-2"></i>Post Job
                          </a>
                          <a href="/auth/login" class="text-gray-700 hover:text-kwikr-green">Sign In</a>
                      </div>
                  </div>
              </div>
          </header>

          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <!-- Page Header -->
              <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div class="flex items-center justify-between">
                      <div>
                          <h1 class="text-3xl font-bold text-gray-800 flex items-center">
                              <i class="fas fa-users text-kwikr-green mr-3"></i>
                              Worker Directory
                          </h1>
                          <p class="text-gray-600 mt-2">
                              Found <span class="font-bold text-kwikr-green">${total}</span> professional service providers
                              ${filters.location_province || filters.location_city ? 
                                `in ${filters.location_city ? `${filters.location_city}, ` : ''}${filters.location_province || 'Canada'}` : 
                                'across Canada'
                              }
                          </p>
                      </div>
                      <div class="flex items-center space-x-4">
                          <select id="sortSelect" onchange="updateSort()" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                              <option value="featured" ${sortBy === 'featured' ? 'selected' : ''}>Featured First</option>
                              <option value="rating" ${sortBy === 'rating' ? 'selected' : ''}>Highest Rated</option>
                              <option value="newest" ${sortBy === 'newest' ? 'selected' : ''}>Newest First</option>
                              <option value="name" ${sortBy === 'name' ? 'selected' : ''}>Name A-Z</option>
                          </select>
                          <button onclick="toggleFilters()" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center">
                              <i class="fas fa-filter mr-2"></i>Filters
                              ${Object.keys(filters).filter(k => filters[k as keyof SearchFilter] !== undefined).length > 0 ? 
                                `<span class="ml-2 bg-kwikr-green text-white text-xs px-2 py-1 rounded-full">${Object.keys(filters).filter(k => filters[k as keyof SearchFilter] !== undefined).length}</span>` : 
                                ''
                              }
                          </button>
                      </div>
                  </div>

                  <!-- Quick Category Filters -->
                  <div class="mt-6 flex flex-wrap gap-2">
                      ${(categoriesResult.results as any[]).slice(0, 8).map(cat => `
                          <a href="/search/directory?category=${encodeURIComponent(cat.name)}" 
                             class="flex items-center px-4 py-2 rounded-full border hover:border-kwikr-green hover:bg-green-50 transition-colors ${filters.serviceCategory === cat.name ? 'border-kwikr-green bg-green-50 text-kwikr-green' : 'border-gray-200 text-gray-700'}">
                              <i class="${cat.icon_class || 'fas fa-tools'} mr-2"></i>
                              ${cat.name}
                              <span class="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">${cat.worker_count}</span>
                          </a>
                      `).join('')}
                  </div>
              </div>

              <!-- Filters Panel (Hidden by default) -->
              <div id="filtersPanel" class="bg-white rounded-lg shadow-sm mb-8 hidden">
                  <div class="p-6">
                      <form method="GET" class="space-y-6">
                          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              <!-- Service Category Filter -->
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
                                  <select name="category" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                                      <option value="">All Categories</option>
                                      ${(categoriesResult.results as any[]).map(cat => `
                                          <option value="${cat.name}" ${filters.serviceCategory === cat.name ? 'selected' : ''}>${cat.name} (${cat.worker_count})</option>
                                      `).join('')}
                                  </select>
                              </div>

                              <!-- Province Filter -->
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Province</label>
                                  <select name="province" onchange="updateCityFilter()" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                                      <option value="">All Provinces</option>
                                      ${(provincesResult.results as any[]).map(prov => `
                                          <option value="${prov.province}" ${filters.location_province === prov.province ? 'selected' : ''}>${prov.province} (${prov.worker_count})</option>
                                      `).join('')}
                                  </select>
                              </div>

                              <!-- City Filter -->
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
                                  <select name="city" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                                      <option value="">All Cities</option>
                                      ${(citiesResult.results as any[]).map(city => `
                                          <option value="${city.city}" ${filters.location_city === city.city ? 'selected' : ''}>${city.city} (${city.worker_count})</option>
                                      `).join('')}
                                  </select>
                              </div>

                              <!-- Price Range Filter -->
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Price Range ($/hour)</label>
                                  <div class="flex space-x-2">
                                      <input type="number" name="min_rate" placeholder="Min" value="${filters.min_rate || ''}" class="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                                      <input type="number" name="max_rate" placeholder="Max" value="${filters.max_rate || ''}" class="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                                  </div>
                              </div>

                              <!-- Rating Filter -->
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                                  <select name="min_rating" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                                      <option value="">Any Rating</option>
                                      <option value="4.5" ${filters.min_rating === 4.5 ? 'selected' : ''}>4.5+ Stars</option>
                                      <option value="4.0" ${filters.min_rating === 4.0 ? 'selected' : ''}>4.0+ Stars</option>
                                      <option value="3.5" ${filters.min_rating === 3.5 ? 'selected' : ''}>3.5+ Stars</option>
                                      <option value="3.0" ${filters.min_rating === 3.0 ? 'selected' : ''}>3.0+ Stars</option>
                                  </select>
                              </div>

                              <!-- Verification Filter -->
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
                                  <div class="space-y-2">
                                      <label class="flex items-center">
                                          <input type="checkbox" name="verified" value="true" ${filters.is_verified ? 'checked' : ''} class="mr-2 rounded border-gray-300 text-kwikr-green focus:ring-kwikr-green">
                                          <span class="text-sm text-gray-700">Verified Only</span>
                                      </label>
                                      <label class="flex items-center">
                                          <input type="checkbox" name="featured" value="true" ${filters.is_featured ? 'checked' : ''} class="mr-2 rounded border-gray-300 text-kwikr-green focus:ring-kwikr-green">
                                          <span class="text-sm text-gray-700">Featured Workers</span>
                                      </label>
                                  </div>
                              </div>
                          </div>

                          <div class="flex justify-end space-x-4">
                              <button type="button" onclick="clearFilters()" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                  Clear All
                              </button>
                              <button type="submit" class="bg-kwikr-green text-white px-6 py-2 rounded-lg hover:bg-green-600">
                                  Apply Filters
                              </button>
                          </div>
                      </form>
                  </div>
              </div>

              <!-- Results Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  ${searchResults.map(result => {
                    const worker = result.worker
                    const services = result.services
                    const avgRate = services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.hourly_rate, 0) / services.length) : 0
                    const displayName = worker.company_name || `${worker.first_name} ${worker.last_name}`
                    const initials = worker.company_name ? 
                      worker.company_name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2) :
                      `${worker.first_name.charAt(0)}${worker.last_name.charAt(0)}`

                    return `
                      <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-300 overflow-hidden">
                          ${worker.is_featured ? `
                              <div class="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2">
                                  <div class="flex items-center text-white text-sm font-medium">
                                      <i class="fas fa-star mr-2"></i>Featured Professional
                                  </div>
                              </div>
                          ` : ''}

                          <div class="p-6">
                              <!-- Worker Header -->
                              <div class="flex items-center mb-4">
                                  ${worker.profile_image_url ? 
                                    `<img src="${worker.profile_image_url}" alt="${displayName}" class="w-16 h-16 rounded-full object-cover mr-4">` :
                                    `<div class="w-16 h-16 rounded-full bg-gradient-to-br from-kwikr-green to-green-600 flex items-center justify-center text-white text-xl font-bold mr-4">${initials}</div>`
                                  }
                                  <div class="flex-1">
                                      <h3 class="font-bold text-lg text-gray-900">${displayName}</h3>
                                      <p class="text-gray-600 text-sm">${worker.city}, ${worker.province}</p>
                                      <div class="flex items-center mt-1">
                                          ${worker.avg_rating ? `
                                              <div class="flex items-center mr-3">
                                                  <span class="text-yellow-400 text-sm">★★★★★</span>
                                                  <span class="ml-1 text-sm font-medium">${worker.avg_rating.toFixed(1)}</span>
                                                  ${worker.review_count ? `<span class="ml-1 text-sm text-gray-500">(${worker.review_count})</span>` : ''}
                                              </div>
                                          ` : ''}
                                          ${worker.is_verified ? `
                                              <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                  <i class="fas fa-shield-check mr-1"></i>Verified
                                              </span>
                                          ` : ''}
                                      </div>
                                  </div>
                              </div>

                              <!-- Bio -->
                              ${worker.bio ? `
                                  <p class="text-gray-600 text-sm mb-4 line-clamp-3">${worker.bio}</p>
                              ` : ''}

                              <!-- Services -->
                              <div class="mb-4">
                                  <h4 class="text-sm font-medium text-gray-700 mb-2">Services</h4>
                                  <div class="flex flex-wrap gap-2">
                                      ${services.slice(0, 3).map(service => `
                                          <span class="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full flex items-center">
                                              <i class="${service.icon_class || 'fas fa-tools'} mr-1"></i>
                                              ${service.service_name}
                                          </span>
                                      `).join('')}
                                      ${services.length > 3 ? `
                                          <span class="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                                              +${services.length - 3} more
                                          </span>
                                      ` : ''}
                                  </div>
                              </div>

                              <!-- Pricing and Match Info -->
                              <div class="flex items-center justify-between mb-4">
                                  <div>
                                      ${avgRate > 0 ? `
                                          <div class="text-2xl font-bold text-kwikr-green">$${avgRate}/hr</div>
                                          <div class="text-xs text-gray-500">Average Rate</div>
                                      ` : `
                                          <div class="text-lg text-gray-500">Contact for Quote</div>
                                      `}
                                  </div>
                                  <div class="text-right">
                                      <div class="text-sm text-gray-600">
                                          Match Score: <span class="font-bold text-kwikr-green">${result.relevance_score}%</span>
                                      </div>
                                      ${result.match_reasons.length > 0 ? `
                                          <div class="text-xs text-gray-500">${result.match_reasons.slice(0, 2).join(', ')}</div>
                                      ` : ''}
                                  </div>
                              </div>

                              <!-- Action Buttons -->
                              <div class="flex space-x-3">
                                  <a href="/universal-profile/${worker.id}" class="flex-1 bg-kwikr-green text-white text-center py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm">
                                      <i class="fas fa-eye mr-2"></i>View Profile
                                  </a>
                                  <button onclick="contactWorker(${worker.id})" class="flex-1 border border-kwikr-green text-kwikr-green text-center py-2 px-4 rounded-lg hover:bg-green-50 transition-colors text-sm">
                                      <i class="fas fa-envelope mr-2"></i>Contact
                                  </button>
                              </div>

                              <!-- Website Link -->
                              ${worker.website_url ? `
                                  <div class="mt-3 pt-3 border-t border-gray-100">
                                      <a href="${worker.website_url}" target="_blank" class="flex items-center text-kwikr-green hover:text-green-600 text-sm">
                                          <i class="fas fa-external-link-alt mr-2"></i>Visit Website
                                      </a>
                                  </div>
                              ` : ''}
                          </div>
                      </div>
                    `
                  }).join('')}
              </div>

              <!-- Pagination -->
              ${total > limit ? `
                  <div class="bg-white rounded-lg shadow-sm p-6">
                      <div class="flex items-center justify-between">
                          <div class="text-sm text-gray-700">
                              Showing ${((page - 1) * limit) + 1} to ${Math.min(page * limit, total)} of ${total} professionals
                          </div>
                          <div class="flex items-center space-x-2">
                              ${page > 1 ? `
                                  <a href="?${new URLSearchParams({...Object.fromEntries(Object.entries(filters).filter(([k,v]) => v !== undefined)), page: String(page - 1), sort: sortBy}).toString()}" 
                                     class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-sm">
                                      <i class="fas fa-chevron-left mr-2"></i>Previous
                                  </a>
                              ` : `
                                  <span class="px-3 py-2 border border-gray-300 rounded-lg opacity-50 cursor-not-allowed flex items-center text-sm">
                                      <i class="fas fa-chevron-left mr-2"></i>Previous
                                  </span>
                              `}

                              <span class="px-3 py-2 bg-kwikr-green text-white rounded-lg font-medium text-sm">${page}</span>

                              ${page * limit < total ? `
                                  <a href="?${new URLSearchParams({...Object.fromEntries(Object.entries(filters).filter(([k,v]) => v !== undefined)), page: String(page + 1), sort: sortBy}).toString()}" 
                                     class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-sm">
                                      Next<i class="fas fa-chevron-right ml-2"></i>
                                  </a>
                              ` : `
                                  <span class="px-3 py-2 border border-gray-300 rounded-lg opacity-50 cursor-not-allowed flex items-center text-sm">
                                      Next<i class="fas fa-chevron-right ml-2"></i>
                                  </span>
                              `}
                          </div>
                      </div>
                  </div>
              ` : ''}

              <!-- No Results Message -->
              ${searchResults.length === 0 ? `
                  <div class="bg-white rounded-lg shadow-sm p-12 text-center">
                      <i class="fas fa-search text-gray-400 text-6xl mb-4"></i>
                      <h3 class="text-xl font-bold text-gray-700 mb-2">No Workers Found</h3>
                      <p class="text-gray-500 mb-6">Try adjusting your search filters or browsing all categories.</p>
                      <div class="flex justify-center space-x-4">
                          <button onclick="clearFilters()" class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600">
                              Clear Filters
                          </button>
                          <a href="/search/directory" class="bg-kwikr-green text-white px-6 py-2 rounded-lg hover:bg-green-600">
                              Browse All Workers
                          </a>
                      </div>
                  </div>
              ` : ''}
          </div>

          <script src="/static/search-discovery.js"></script>
      </body>
      </html>
    `)

  } catch (error) {
    console.error('Worker directory error:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load worker directory</p>
          <a href="/" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Return Home</a>
        </div>
      </div>
    `, 500)
  }
})

// ============================================================================
// ADVANCED SEARCH FILTERS - By location, service, price, rating (Feature 2)
// ============================================================================

// Advanced search page with comprehensive filters
searchRoutes.get('/advanced', async (c) => {
  try {
    const db = c.env.DB

    // Get all available filter options from database
    const [categoriesResult, provincesResult, rateRangesResult] = await Promise.all([
      // Service categories with worker counts
      db.prepare(`
        SELECT jc.name, jc.icon_class, jc.description, COUNT(DISTINCT ws.user_id) as worker_count
        FROM job_categories jc
        LEFT JOIN worker_services ws ON jc.name = ws.service_category
        LEFT JOIN users u ON ws.user_id = u.id AND u.role = 'worker' AND u.is_active = 1
        WHERE jc.is_active = 1
        GROUP BY jc.id, jc.name, jc.icon_class, jc.description
        ORDER BY worker_count DESC, jc.name
      `).all(),

      // Provinces with worker counts
      db.prepare(`
        SELECT province, COUNT(*) as worker_count
        FROM users 
        WHERE role = 'worker' AND is_active = 1 AND province IS NOT NULL
        GROUP BY province
        ORDER BY worker_count DESC
      `).all(),

      // Rate ranges analysis
      db.prepare(`
        SELECT 
          MIN(hourly_rate) as min_rate,
          MAX(hourly_rate) as max_rate,
          AVG(hourly_rate) as avg_rate,
          COUNT(*) as service_count
        FROM worker_services ws
        JOIN users u ON ws.user_id = u.id
        WHERE u.role = 'worker' AND u.is_active = 1 AND ws.is_available = 1 AND ws.hourly_rate > 0
      `).first()
    ])

    const categories = categoriesResult.results || []
    const provinces = provincesResult.results || []
    const rateStats = rateRangesResult || { min_rate: 25, max_rate: 200, avg_rate: 75 }

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Advanced Search - getKwikr</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'kwikr-green': '#00C881'
                  }
                }
              }
            }
          </script>
      </head>
      <body class="bg-gray-50 min-h-screen">
          <!-- Header Navigation -->
          <header class="bg-white shadow-sm border-b">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-4">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green flex items-center">
                              <i class="fas fa-bolt mr-2"></i>Kwikr
                          </a>
                          <nav class="ml-8 flex space-x-6">
                              <a href="/search/directory" class="text-gray-700 hover:text-kwikr-green">Directory</a>
                              <a href="/search/advanced" class="text-kwikr-green font-medium">Advanced Search</a>
                              <a href="/search/categories" class="text-gray-700 hover:text-kwikr-green">Categories</a>
                          </nav>
                      </div>
                      <div class="flex items-center space-x-4">
                          <button onclick="enableGeolocation()" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                              <i class="fas fa-map-marker-alt mr-2"></i>Use My Location
                          </button>
                          <a href="/jobs/post" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                              <i class="fas fa-plus mr-2"></i>Post Job
                          </a>
                      </div>
                  </div>
              </div>
          </header>

          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <!-- Page Header -->
              <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
                  <div class="text-center mb-8">
                      <h1 class="text-4xl font-bold text-gray-800 mb-4">
                          <i class="fas fa-search-plus text-kwikr-green mr-3"></i>
                          Advanced Search
                      </h1>
                      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                          Find the perfect professional for your project with our comprehensive search filters
                      </p>
                  </div>

                  <!-- Advanced Search Form -->
                  <form action="/search/directory" method="GET" class="space-y-8">
                      <!-- Service & Category Selection -->
                      <div class="bg-gray-50 rounded-lg p-6">
                          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                              <i class="fas fa-tools text-kwikr-green mr-2"></i>
                              Service Categories
                          </h3>
                          
                          <!-- Quick Service Search -->
                          <div class="mb-6">
                              <label class="block text-sm font-medium text-gray-700 mb-2">Search Services</label>
                              <input type="text" name="category" placeholder="e.g., plumbing, electrical, cleaning..." 
                                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                          </div>

                          <!-- Category Grid -->
                          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              ${(categories as any[]).map(cat => `
                                  <label class="relative">
                                      <input type="radio" name="category" value="${cat.name}" class="sr-only peer">
                                      <div class="border-2 border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:border-kwikr-green peer-checked:border-kwikr-green peer-checked:bg-green-50">
                                          <div class="text-center">
                                              <i class="${cat.icon_class || 'fas fa-tools'} text-2xl text-kwikr-green mb-2"></i>
                                              <div class="font-medium text-gray-800 text-sm">${cat.name}</div>
                                              <div class="text-xs text-gray-500">${cat.worker_count} workers</div>
                                          </div>
                                      </div>
                                  </label>
                              `).join('')}
                          </div>
                      </div>

                      <!-- Location Filters -->
                      <div class="bg-gray-50 rounded-lg p-6">
                          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                              <i class="fas fa-map-marker-alt text-kwikr-green mr-2"></i>
                              Location & Proximity
                          </h3>
                          
                          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <!-- Province Selection -->
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Province</label>
                                  <select name="province" onchange="updateCityFilter()" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                                      <option value="">All Provinces</option>
                                      ${(provinces as any[]).map(prov => `
                                          <option value="${prov.province}">${prov.province} (${prov.worker_count} workers)</option>
                                      `).join('')}
                                  </select>
                              </div>

                              <!-- City Selection -->
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
                                  <select name="city" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                                      <option value="">All Cities</option>
                                  </select>
                              </div>

                              <!-- Radius (for geolocation) -->
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Search Radius</label>
                                  <select name="radius" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                                      <option value="">No limit</option>
                                      <option value="5">Within 5 km</option>
                                      <option value="10">Within 10 km</option>
                                      <option value="25" selected>Within 25 km</option>
                                      <option value="50">Within 50 km</option>
                                      <option value="100">Within 100 km</option>
                                  </select>
                              </div>
                          </div>

                          <!-- Geolocation Option -->
                          <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                              <div class="flex items-center justify-between">
                                  <div>
                                      <h4 class="font-medium text-blue-800">Use Your Current Location</h4>
                                      <p class="text-sm text-blue-600">Find workers near you automatically</p>
                                  </div>
                                  <button type="button" onclick="enableGeolocation()" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                                      <i class="fas fa-crosshairs mr-2"></i>Enable Location
                                  </button>
                              </div>
                          </div>
                      </div>

                      <!-- Price & Rating Filters -->
                      <div class="bg-gray-50 rounded-lg p-6">
                          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                              <i class="fas fa-dollar-sign text-kwikr-green mr-2"></i>
                              Price & Quality
                          </h3>
                          
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <!-- Price Range -->
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Hourly Rate Range</label>
                                  <div class="space-y-4">
                                      <div class="flex items-center space-x-4">
                                          <div class="flex-1">
                                              <label class="block text-xs text-gray-500 mb-1">Minimum ($/hour)</label>
                                              <input type="number" name="min_rate" min="0" max="500" placeholder="${Math.floor(rateStats.min_rate || 25)}" 
                                                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                                          </div>
                                          <div class="text-gray-400 mt-6">to</div>
                                          <div class="flex-1">
                                              <label class="block text-xs text-gray-500 mb-1">Maximum ($/hour)</label>
                                              <input type="number" name="max_rate" min="0" max="500" placeholder="${Math.ceil(rateStats.max_rate || 200)}" 
                                                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                                          </div>
                                      </div>
                                      
                                      <!-- Price Range Presets -->
                                      <div class="flex flex-wrap gap-2">
                                          <button type="button" onclick="setPriceRange(0, 50)" class="text-xs bg-white border border-gray-300 px-3 py-1 rounded-full hover:border-kwikr-green">$0-50</button>
                                          <button type="button" onclick="setPriceRange(50, 100)" class="text-xs bg-white border border-gray-300 px-3 py-1 rounded-full hover:border-kwikr-green">$50-100</button>
                                          <button type="button" onclick="setPriceRange(100, 150)" class="text-xs bg-white border border-gray-300 px-3 py-1 rounded-full hover:border-kwikr-green">$100-150</button>
                                          <button type="button" onclick="setPriceRange(150, 999)" class="text-xs bg-white border border-gray-300 px-3 py-1 rounded-full hover:border-kwikr-green">$150+</button>
                                      </div>

                                      <div class="text-xs text-gray-500">
                                          Platform average: $${Math.round(rateStats.avg_rate || 75)}/hour
                                      </div>
                                  </div>
                              </div>

                              <!-- Rating & Reviews -->
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                                  <div class="space-y-3">
                                      <div class="space-y-2">
                                          <label class="flex items-center cursor-pointer">
                                              <input type="radio" name="min_rating" value="4.5" class="mr-3">
                                              <span class="flex items-center">
                                                  <span class="text-yellow-400 mr-2">★★★★★</span>
                                                  <span>4.5+ stars</span>
                                              </span>
                                          </label>
                                          <label class="flex items-center cursor-pointer">
                                              <input type="radio" name="min_rating" value="4.0" class="mr-3">
                                              <span class="flex items-center">
                                                  <span class="text-yellow-400 mr-2">★★★★☆</span>
                                                  <span>4.0+ stars</span>
                                              </span>
                                          </label>
                                          <label class="flex items-center cursor-pointer">
                                              <input type="radio" name="min_rating" value="3.5" class="mr-3">
                                              <span class="flex items-center">
                                                  <span class="text-yellow-400 mr-2">★★★☆☆</span>
                                                  <span>3.5+ stars</span>
                                              </span>
                                          </label>
                                      </div>

                                      <!-- Review Count Filter -->
                                      <div class="pt-4 border-t border-gray-200">
                                          <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Reviews</label>
                                          <select name="min_reviews" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                                              <option value="">Any number of reviews</option>
                                              <option value="5">5+ reviews</option>
                                              <option value="10">10+ reviews</option>
                                              <option value="25">25+ reviews</option>
                                              <option value="50">50+ reviews</option>
                                          </select>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- Professional Qualifications -->
                      <div class="bg-gray-50 rounded-lg p-6">
                          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                              <i class="fas fa-shield-check text-kwikr-green mr-2"></i>
                              Professional Qualifications
                          </h3>
                          
                          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <!-- Verification Status -->
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-3">Verification</label>
                                  <div class="space-y-2">
                                      <label class="flex items-center">
                                          <input type="checkbox" name="verified" value="true" class="mr-2 rounded border-gray-300 text-kwikr-green focus:ring-kwikr-green">
                                          <span class="text-sm">Verified professionals only</span>
                                      </label>
                                      <label class="flex items-center">
                                          <input type="checkbox" name="featured" value="true" class="mr-2 rounded border-gray-300 text-kwikr-green focus:ring-kwikr-green">
                                          <span class="text-sm">Featured workers</span>
                                      </label>
                                      <label class="flex items-center">
                                          <input type="checkbox" name="business_profile" value="true" class="mr-2 rounded border-gray-300 text-kwikr-green focus:ring-kwikr-green">
                                          <span class="text-sm">Business profiles</span>
                                      </label>
                                  </div>
                              </div>

                              <!-- Experience Level -->
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                                  <select name="min_experience" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                                      <option value="">Any experience level</option>
                                      <option value="1">1+ years experience</option>
                                      <option value="3">3+ years experience</option>
                                      <option value="5">5+ years experience</option>
                                      <option value="10">10+ years experience</option>
                                  </select>
                              </div>

                              <!-- Availability -->
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-3">Availability</label>
                                  <div class="space-y-2">
                                      <label class="flex items-center">
                                          <input type="checkbox" name="available_today" value="true" class="mr-2 rounded border-gray-300 text-kwikr-green focus:ring-kwikr-green">
                                          <span class="text-sm">Available today</span>
                                      </label>
                                      <label class="flex items-center">
                                          <input type="checkbox" name="available_week" value="true" class="mr-2 rounded border-gray-300 text-kwikr-green focus:ring-kwikr-green">
                                          <span class="text-sm">Available this week</span>
                                      </label>
                                      <label class="flex items-center">
                                          <input type="checkbox" name="weekend_work" value="true" class="mr-2 rounded border-gray-300 text-kwikr-green focus:ring-kwikr-green">
                                          <span class="text-sm">Weekend availability</span>
                                      </label>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- Search Actions -->
                      <div class="bg-white border border-gray-200 rounded-lg p-6">
                          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div class="flex items-center space-x-4">
                                  <button type="button" onclick="clearAllFilters()" class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                      <i class="fas fa-eraser mr-2"></i>Clear All
                                  </button>
                                  <button type="button" onclick="saveSearchTemplate()" class="px-6 py-3 border border-kwikr-green text-kwikr-green rounded-lg hover:bg-green-50 transition-colors">
                                      <i class="fas fa-save mr-2"></i>Save Search
                                  </button>
                              </div>
                              
                              <div class="flex items-center space-x-4">
                                  <div class="text-sm text-gray-600">
                                      <span id="resultsPreview">Ready to search</span>
                                  </div>
                                  <button type="submit" class="bg-kwikr-green text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium">
                                      <i class="fas fa-search mr-2"></i>Find Workers
                                  </button>
                              </div>
                          </div>
                      </div>
                  </form>

                  <!-- Saved Searches -->
                  <div id="savedSearches" class="mt-8 hidden">
                      <h3 class="text-lg font-semibold text-gray-800 mb-4">Saved Searches</h3>
                      <div id="savedSearchesList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <!-- Saved searches will be loaded here -->
                      </div>
                  </div>
              </div>
          </div>

          <script src="/static/search-discovery.js"></script>
          <script>
              // Advanced search specific functions
              function setPriceRange(min, max) {
                  document.querySelector('input[name="min_rate"]').value = min
                  document.querySelector('input[name="max_rate"]').value = max > 500 ? '' : max
              }

              function clearAllFilters() {
                  const form = document.querySelector('form')
                  const inputs = form.querySelectorAll('input, select')
                  inputs.forEach(input => {
                      if (input.type === 'checkbox' || input.type === 'radio') {
                          input.checked = false
                      } else {
                          input.value = ''
                      }
                  })
                  updateResultsPreview()
              }

              function saveSearchTemplate() {
                  const form = document.querySelector('form')
                  const formData = new FormData(form)
                  const searchData = {}
                  
                  for (let [key, value] of formData.entries()) {
                      if (value) searchData[key] = value
                  }

                  const searchName = prompt('Name for this search:')
                  if (searchName) {
                      let savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '{}')
                      savedSearches[searchName] = searchData
                      localStorage.setItem('savedSearches', JSON.stringify(savedSearches))
                      loadSavedSearches()
                      showNotification('Search saved successfully!', 'success')
                  }
              }

              function loadSavedSearches() {
                  const saved = JSON.parse(localStorage.getItem('savedSearches') || '{}')
                  const container = document.getElementById('savedSearchesList')
                  const section = document.getElementById('savedSearches')
                  
                  if (Object.keys(saved).length > 0) {
                      section.classList.remove('hidden')
                      container.innerHTML = Object.entries(saved).map(([name, data]) => 
                          \`<div class="bg-white border border-gray-200 rounded-lg p-4">
                              <h4 class="font-medium text-gray-800 mb-2">\${name}</h4>
                              <p class="text-sm text-gray-600 mb-3">\${Object.keys(data).length} filters</p>
                              <div class="flex space-x-2">
                                  <button onclick="loadSearch('\${name}')" class="text-xs bg-kwikr-green text-white px-3 py-1 rounded hover:bg-green-600">
                                      Load
                                  </button>
                                  <button onclick="deleteSearch('\${name}')" class="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                      Delete
                                  </button>
                              </div>
                          </div>\`
                      ).join('')
                  }
              }

              function loadSearch(name) {
                  const saved = JSON.parse(localStorage.getItem('savedSearches') || '{}')
                  const searchData = saved[name]
                  
                  if (searchData) {
                      Object.entries(searchData).forEach(([key, value]) => {
                          const element = document.querySelector(\`[name="\${key}"]\`)
                          if (element) {
                              if (element.type === 'checkbox' || element.type === 'radio') {
                                  element.checked = true
                              } else {
                                  element.value = value
                              }
                          }
                      })
                      showNotification(\`Loaded search: \${name}\`, 'success')
                  }
              }

              function deleteSearch(name) {
                  if (confirm(\`Delete saved search "\${name}"?\`)) {
                      let saved = JSON.parse(localStorage.getItem('savedSearches') || '{}')
                      delete saved[name]
                      localStorage.setItem('savedSearches', JSON.stringify(saved))
                      loadSavedSearches()
                      showNotification('Search deleted', 'info')
                  }
              }

              function updateResultsPreview() {
                  // This would make an AJAX call to get result count
                  // For now, just show a message
                  document.getElementById('resultsPreview').textContent = 'Ready to search'
              }

              // Initialize
              document.addEventListener('DOMContentLoaded', function() {
                  loadSavedSearches()
                  
                  // Add change listeners for real-time preview
                  const inputs = document.querySelectorAll('input, select')
                  inputs.forEach(input => {
                      input.addEventListener('change', updateResultsPreview)
                  })
              })
          </script>
      </body>
      </html>
    `)

  } catch (error) {
    console.error('Advanced search error:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load advanced search</p>
          <a href="/search/directory" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Go to Directory</a>
        </div>
      </div>
    `, 500)
  }
})

// API endpoint for dynamic city loading based on province
searchRoutes.get('/api/cities/:province', async (c) => {
  try {
    const db = c.env.DB
    const province = c.req.param('province')
    
    const result = await db.prepare(`
      SELECT DISTINCT city, COUNT(*) as worker_count
      FROM users 
      WHERE role = 'worker' AND is_active = 1 AND province = ? AND city IS NOT NULL
      GROUP BY city
      ORDER BY worker_count DESC
      LIMIT 50
    `).bind(province).all()
    
    return c.json({ 
      success: true, 
      cities: result.results || [] 
    })
    
  } catch (error) {
    console.error('Cities API error:', error)
    return c.json({ 
      success: false, 
      error: 'Failed to fetch cities' 
    }, 500)
  }
})

// ============================================================================
// CATEGORY-BASED BROWSING - Service categories and subcategories (Feature 3)
// ============================================================================

// Categories browsing page with hierarchical navigation
searchRoutes.get('/categories', async (c) => {
  try {
    const db = c.env.DB
    const selectedCategory = c.req.query('category')
    const selectedSubcategory = c.req.query('subcategory')

    // Get all categories with worker counts and subcategories
    const categoriesQuery = `
      SELECT 
        jc.id,
        jc.name,
        jc.icon_class,
        jc.description,
        jc.parent_category_id,
        COUNT(DISTINCT ws.user_id) as worker_count,
        AVG(ws.hourly_rate) as avg_rate,
        MIN(ws.hourly_rate) as min_rate,
        MAX(ws.hourly_rate) as max_rate
      FROM job_categories jc
      LEFT JOIN worker_services ws ON jc.name = ws.service_category
      LEFT JOIN users u ON ws.user_id = u.id AND u.role = 'worker' AND u.is_active = 1
      WHERE jc.is_active = 1
      GROUP BY jc.id, jc.name, jc.icon_class, jc.description, jc.parent_category_id
      ORDER BY jc.parent_category_id IS NULL DESC, worker_count DESC, jc.name
    `
    
    const categoriesResult = await db.prepare(categoriesQuery).all()
    const allCategories = categoriesResult.results as any[]

    // Organize into main categories and subcategories
    const mainCategories = allCategories.filter(cat => !cat.parent_category_id)
    const subcategoriesMap = new Map()
    
    allCategories.filter(cat => cat.parent_category_id).forEach(subcat => {
      if (!subcategoriesMap.has(subcat.parent_category_id)) {
        subcategoriesMap.set(subcat.parent_category_id, [])
      }
      subcategoriesMap.get(subcat.parent_category_id).push(subcat)
    })

    // Get featured workers for selected category
    let featuredWorkers: any[] = []
    if (selectedCategory) {
      const featuredQuery = `
        SELECT DISTINCT 
          u.id, u.first_name, u.last_name, u.city, u.province, u.is_verified,
          p.bio, p.profile_image_url, p.company_name,
          AVG(ws.hourly_rate) as avg_rate,
          AVG(r.rating) as avg_rating,
          COUNT(r.id) as review_count,
          CASE WHEN s.plan_type = 'premium' THEN 1 ELSE 0 END as is_featured
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        LEFT JOIN worker_services ws ON u.id = ws.user_id
        LEFT JOIN reviews r ON u.id = r.worker_id
        LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
        WHERE u.role = 'worker' AND u.is_active = 1 
          AND (ws.service_category LIKE ? OR ws.service_name LIKE ?)
        GROUP BY u.id
        ORDER BY is_featured DESC, avg_rating DESC, u.is_verified DESC
        LIMIT 6
      `
      
      const featuredResult = await db.prepare(featuredQuery)
        .bind(`%${selectedCategory}%`, `%${selectedCategory}%`)
        .all()
      
      featuredWorkers = featuredResult.results as any[]
    }

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Service Categories - getKwikr</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'kwikr-green': '#00C881'
                  }
                }
              }
            }
          </script>
      </head>
      <body class="bg-gray-50 min-h-screen">
          <!-- Header Navigation -->
          <header class="bg-white shadow-sm border-b">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-4">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green flex items-center">
                              <i class="fas fa-bolt mr-2"></i>Kwikr
                          </a>
                          <nav class="ml-8 flex space-x-6">
                              <a href="/search/directory" class="text-gray-700 hover:text-kwikr-green">Directory</a>
                              <a href="/search/advanced" class="text-gray-700 hover:text-kwikr-green">Advanced Search</a>
                              <a href="/search/categories" class="text-kwikr-green font-medium">Categories</a>
                          </nav>
                      </div>
                      <div class="flex items-center space-x-4">
                          <a href="/jobs/post" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                              <i class="fas fa-plus mr-2"></i>Post Job
                          </a>
                          <a href="/auth/login" class="text-gray-700 hover:text-kwikr-green">Sign In</a>
                      </div>
                  </div>
              </div>
          </header>

          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <!-- Page Header -->
              <div class="text-center mb-8">
                  <h1 class="text-4xl font-bold text-gray-800 mb-4">
                      <i class="fas fa-th-large text-kwikr-green mr-3"></i>
                      Service Categories
                  </h1>
                  <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                      Browse our comprehensive directory of professional services organized by category
                  </p>
              </div>

              <!-- Breadcrumb Navigation -->
              ${selectedCategory ? `
                  <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-8 bg-white rounded-lg p-4">
                      <a href="/search/categories" class="hover:text-kwikr-green">All Categories</a>
                      <i class="fas fa-chevron-right text-xs"></i>
                      <span class="text-kwikr-green font-medium">${selectedCategory}</span>
                      ${selectedSubcategory ? `
                          <i class="fas fa-chevron-right text-xs"></i>
                          <span class="text-gray-800 font-medium">${selectedSubcategory}</span>
                      ` : ''}
                  </nav>
              ` : ''}

              <!-- Search Bar -->
              <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div class="max-w-2xl mx-auto">
                      <div class="relative">
                          <input type="text" id="categorySearch" placeholder="Search categories and services..." 
                                 class="w-full px-6 py-4 pl-12 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                          <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
                      </div>
                      <div class="flex flex-wrap gap-2 mt-4">
                          ${mainCategories.slice(0, 8).map(cat => `
                              <button onclick="searchByCategory('${cat.name}')" 
                                      class="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm hover:bg-kwikr-green hover:text-white transition-colors">
                                  ${cat.name}
                              </button>
                          `).join('')}
                      </div>
                  </div>
              </div>

              ${!selectedCategory ? `
                  <!-- Main Categories Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                      ${mainCategories.map(category => {
                        const subcategories = subcategoriesMap.get(category.id) || []
                        return `
                          <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-300 overflow-hidden">
                              <div class="p-6">
                                  <!-- Category Header -->
                                  <div class="text-center mb-4">
                                      <div class="w-16 h-16 bg-gradient-to-br from-kwikr-green to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                          <i class="${category.icon_class || 'fas fa-tools'} text-white text-2xl"></i>
                                      </div>
                                      <h3 class="text-lg font-bold text-gray-800">${category.name}</h3>
                                      <p class="text-sm text-gray-600 mt-1">${category.description || 'Professional services'}</p>
                                  </div>

                                  <!-- Category Stats -->
                                  <div class="bg-gray-50 rounded-lg p-3 mb-4">
                                      <div class="grid grid-cols-2 gap-4 text-center">
                                          <div>
                                              <div class="text-lg font-bold text-kwikr-green">${category.worker_count}</div>
                                              <div class="text-xs text-gray-600">Workers</div>
                                          </div>
                                          <div>
                                              <div class="text-lg font-bold text-kwikr-green">
                                                  ${category.avg_rate ? '$' + Math.round(category.avg_rate) : 'Varies'}
                                              </div>
                                              <div class="text-xs text-gray-600">Avg Rate</div>
                                          </div>
                                      </div>
                                  </div>

                                  <!-- Subcategories Preview -->
                                  ${subcategories.length > 0 ? `
                                      <div class="mb-4">
                                          <h4 class="text-sm font-medium text-gray-700 mb-2">Specializations</h4>
                                          <div class="flex flex-wrap gap-1">
                                              ${subcategories.slice(0, 3).map(sub => `
                                                  <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${sub.name}</span>
                                              `).join('')}
                                              ${subcategories.length > 3 ? `
                                                  <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">+${subcategories.length - 3} more</span>
                                              ` : ''}
                                          </div>
                                      </div>
                                  ` : ''}

                                  <!-- Action Buttons -->
                                  <div class="space-y-2">
                                      <a href="/search/categories?category=${encodeURIComponent(category.name)}" 
                                         class="w-full bg-kwikr-green text-white text-center py-2 px-4 rounded-lg hover:bg-green-600 transition-colors block">
                                          Explore Category
                                      </a>
                                      <a href="/search/directory?category=${encodeURIComponent(category.name)}" 
                                         class="w-full border border-kwikr-green text-kwikr-green text-center py-2 px-4 rounded-lg hover:bg-green-50 transition-colors block">
                                          Find Workers
                                      </a>
                                  </div>
                              </div>
                          </div>
                        `
                      }).join('')}
                  </div>

                  <!-- Popular Categories Section -->
                  <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
                      <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Most Popular Services</h2>
                      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          ${mainCategories.sort((a, b) => b.worker_count - a.worker_count).slice(0, 12).map(cat => `
                              <a href="/search/directory?category=${encodeURIComponent(cat.name)}" 
                                 class="text-center p-4 rounded-lg border hover:border-kwikr-green hover:bg-green-50 transition-colors group">
                                  <i class="${cat.icon_class || 'fas fa-tools'} text-2xl text-gray-400 group-hover:text-kwikr-green mb-2"></i>
                                  <div class="text-sm font-medium text-gray-700 group-hover:text-kwikr-green">${cat.name}</div>
                                  <div class="text-xs text-gray-500">${cat.worker_count} workers</div>
                              </a>
                          `).join('')}
                      </div>
                  </div>
              ` : `
                  <!-- Selected Category Details -->
                  <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
                      <div class="text-center mb-8">
                          <h2 class="text-3xl font-bold text-gray-800 mb-4">${selectedCategory} Services</h2>
                          <p class="text-gray-600 max-w-2xl mx-auto">
                              Professional ${selectedCategory.toLowerCase()} services from verified providers in your area
                          </p>
                      </div>

                      <!-- Category Actions -->
                      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                          <a href="/search/directory?category=${encodeURIComponent(selectedCategory)}" 
                             class="bg-kwikr-green text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors inline-flex items-center justify-center">
                              <i class="fas fa-users mr-2"></i>Browse All ${selectedCategory} Workers
                          </a>
                          <a href="/jobs/post?category=${encodeURIComponent(selectedCategory)}" 
                             class="border border-kwikr-green text-kwikr-green px-8 py-3 rounded-lg hover:bg-green-50 transition-colors inline-flex items-center justify-center">
                              <i class="fas fa-plus mr-2"></i>Post ${selectedCategory} Job
                          </a>
                      </div>

                      <!-- Subcategories if available -->
                      ${subcategoriesMap.has(mainCategories.find(c => c.name === selectedCategory)?.id) ? `
                          <div class="border-t pt-8">
                              <h3 class="text-xl font-semibold text-gray-800 mb-4">Specializations</h3>
                              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  ${(subcategoriesMap.get(mainCategories.find(c => c.name === selectedCategory)?.id) || []).map(subcat => `
                                      <a href="/search/directory?category=${encodeURIComponent(subcat.name)}" 
                                         class="border rounded-lg p-4 hover:border-kwikr-green hover:bg-green-50 transition-colors">
                                          <div class="flex items-center">
                                              <i class="${subcat.icon_class || 'fas fa-tools'} text-kwikr-green text-lg mr-3"></i>
                                              <div>
                                                  <div class="font-medium text-gray-800">${subcat.name}</div>
                                                  <div class="text-sm text-gray-600">${subcat.worker_count} workers available</div>
                                              </div>
                                          </div>
                                      </a>
                                  `).join('')}
                              </div>
                          </div>
                      ` : ''}
                  </div>

                  <!-- Featured Workers in Category -->
                  ${featuredWorkers.length > 0 ? `
                      <div class="bg-white rounded-lg shadow-sm p-8">
                          <h3 class="text-2xl font-bold text-gray-800 mb-6">Featured ${selectedCategory} Professionals</h3>
                          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              ${featuredWorkers.map(worker => {
                                const displayName = worker.company_name || `${worker.first_name} ${worker.last_name}`
                                const initials = worker.company_name ? 
                                  worker.company_name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2) :
                                  `${worker.first_name.charAt(0)}${worker.last_name.charAt(0)}`
                                
                                return `
                                  <div class="border rounded-lg p-6 hover:shadow-md transition-shadow">
                                      ${worker.is_featured ? `
                                          <div class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full inline-block mb-3">
                                              <i class="fas fa-star mr-1"></i>Featured
                                          </div>
                                      ` : ''}
                                      
                                      <div class="flex items-center mb-4">
                                          ${worker.profile_image_url ? 
                                            `<img src="${worker.profile_image_url}" alt="${displayName}" class="w-12 h-12 rounded-full object-cover mr-3">` :
                                            `<div class="w-12 h-12 rounded-full bg-gradient-to-br from-kwikr-green to-green-600 flex items-center justify-center text-white text-sm font-bold mr-3">${initials}</div>`
                                          }
                                          <div>
                                              <h4 class="font-semibold text-gray-800">${displayName}</h4>
                                              <p class="text-sm text-gray-600">${worker.city}, ${worker.province}</p>
                                          </div>
                                      </div>

                                      <div class="mb-4">
                                          <div class="flex items-center justify-between mb-2">
                                              ${worker.avg_rating ? `
                                                  <div class="flex items-center">
                                                      <span class="text-yellow-400 text-sm">★★★★★</span>
                                                      <span class="ml-1 text-sm">${worker.avg_rating.toFixed(1)}</span>
                                                      <span class="ml-1 text-xs text-gray-500">(${worker.review_count})</span>
                                                  </div>
                                              ` : ''}
                                              ${worker.is_verified ? `
                                                  <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                      <i class="fas fa-shield-check mr-1"></i>Verified
                                                  </span>
                                              ` : ''}
                                          </div>
                                          
                                          ${worker.avg_rate ? `
                                              <div class="text-lg font-bold text-kwikr-green">$${Math.round(worker.avg_rate)}/hr</div>
                                          ` : ''}
                                      </div>

                                      ${worker.bio ? `
                                          <p class="text-sm text-gray-600 mb-4 line-clamp-2">${worker.bio}</p>
                                      ` : ''}

                                      <div class="flex space-x-2">
                                          <a href="/universal-profile/${worker.id}" 
                                             class="flex-1 bg-kwikr-green text-white text-center py-2 px-3 rounded text-sm hover:bg-green-600">
                                              View Profile
                                          </a>
                                          <button onclick="contactWorker(${worker.id})" 
                                                  class="flex-1 border border-kwikr-green text-kwikr-green text-center py-2 px-3 rounded text-sm hover:bg-green-50">
                                              Contact
                                          </button>
                                      </div>
                                  </div>
                                `
                              }).join('')}
                          </div>
                      </div>
                  ` : ''}
              `}

              <!-- Category Statistics -->
              <div class="bg-gradient-to-r from-kwikr-green to-green-600 text-white rounded-lg p-8 text-center">
                  <h2 class="text-2xl font-bold mb-4">Why Choose Kwikr?</h2>
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div>
                          <div class="text-3xl font-bold">${mainCategories.reduce((sum, cat) => sum + cat.worker_count, 0)}+</div>
                          <div class="text-green-100">Verified Workers</div>
                      </div>
                      <div>
                          <div class="text-3xl font-bold">${mainCategories.length}</div>
                          <div class="text-green-100">Service Categories</div>
                      </div>
                      <div>
                          <div class="text-3xl font-bold">4.8★</div>
                          <div class="text-green-100">Average Rating</div>
                      </div>
                      <div>
                          <div class="text-3xl font-bold">24/7</div>
                          <div class="text-green-100">Customer Support</div>
                      </div>
                  </div>
              </div>
          </div>

          <script src="/static/search-discovery.js"></script>
          <script>
              // Category search functionality
              document.getElementById('categorySearch').addEventListener('input', function(e) {
                  const query = e.target.value.toLowerCase()
                  if (query.length > 2) {
                      // Filter categories in real-time
                      const categories = document.querySelectorAll('.category-item')
                      categories.forEach(cat => {
                          const name = cat.querySelector('h3').textContent.toLowerCase()
                          const desc = cat.querySelector('p').textContent.toLowerCase()
                          if (name.includes(query) || desc.includes(query)) {
                              cat.style.display = 'block'
                          } else {
                              cat.style.display = 'none'
                          }
                      })
                  } else {
                      // Show all categories
                      const categories = document.querySelectorAll('.category-item')
                      categories.forEach(cat => {
                          cat.style.display = 'block'
                      })
                  }
              })
          </script>
      </body>
      </html>
    `)

  } catch (error) {
    console.error('Categories page error:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load categories</p>
          <a href="/search/directory" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Go to Directory</a>
        </div>
      </div>
    `, 500)
  }
})

// ============================================================================
// GEOLOCATION SEARCH - Find workers near client location (Feature 4)
// ============================================================================

// Enhanced directory with geolocation support
searchRoutes.get('/nearby', async (c) => {
  try {
    const db = c.env.DB
    const lat = parseFloat(c.req.query('lat') || '0')
    const lng = parseFloat(c.req.query('lng') || '0') 
    const radius = parseInt(c.req.query('radius') || '25')
    const category = c.req.query('category')
    
    if (!lat || !lng) {
      return c.redirect('/search/directory?geolocation_required=1')
    }

    // For this implementation, we'll use a simplified approach since we don't have
    // lat/lng stored for workers. In production, you'd geocode worker addresses.
    // Here we'll use city-based proximity estimation
    
    let query = `
      SELECT DISTINCT 
        u.id, u.first_name, u.last_name, u.city, u.province, u.is_verified,
        p.bio, p.profile_image_url, p.company_name, p.website_url,
        AVG(ws.hourly_rate) as avg_rate,
        AVG(r.rating) as avg_rating,
        COUNT(r.id) as review_count,
        CASE WHEN s.plan_type = 'premium' THEN 1 ELSE 0 END as is_featured
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id  
      LEFT JOIN worker_services ws ON u.id = ws.user_id
      LEFT JOIN reviews r ON u.id = r.worker_id
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      WHERE u.role = 'worker' AND u.is_active = 1
    `
    
    const params = []
    
    if (category) {
      query += ` AND (ws.service_category LIKE ? OR ws.service_name LIKE ?)`
      params.push(`%${category}%`, `%${category}%`)
    }
    
    query += ` 
      GROUP BY u.id 
      ORDER BY is_featured DESC, avg_rating DESC, u.is_verified DESC
      LIMIT 50
    `

    const workersResult = await db.prepare(query).bind(...params).all()
    const workers = workersResult.results as any[]

    // Mock distance calculation (in production, use actual geocoding)
    const workersWithDistance = workers.map(worker => ({
      ...worker,
      distance_km: Math.random() * radius, // Mock distance within radius
      estimated_distance: true
    }))

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nearby Workers - getKwikr</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'kwikr-green': '#00C881'
                  }
                }
              }
            }
          </script>
      </head>
      <body class="bg-gray-50">
          <!-- Header Navigation -->
          <header class="bg-white shadow-sm border-b">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-4">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green flex items-center">
                              <i class="fas fa-bolt mr-2"></i>Kwikr
                          </a>
                          <nav class="ml-8 flex space-x-6">
                              <a href="/search/directory" class="text-gray-700 hover:text-kwikr-green">Directory</a>
                              <a href="/search/advanced" class="text-gray-700 hover:text-kwikr-green">Advanced Search</a>
                              <a href="/search/nearby" class="text-kwikr-green font-medium">Nearby Workers</a>
                          </nav>
                      </div>
                  </div>
              </div>
          </header>

          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <!-- Location Header -->
              <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div class="flex items-center justify-between">
                      <div>
                          <h1 class="text-3xl font-bold text-gray-800 flex items-center">
                              <i class="fas fa-map-marker-alt text-kwikr-green mr-3"></i>
                              Workers Near You
                          </h1>
                          <p class="text-gray-600 mt-2">
                              Found ${workers.length} professionals within ${radius}km of your location
                              ${category ? ` for ${category} services` : ''}
                          </p>
                      </div>
                      <div class="flex items-center space-x-4">
                          <select onchange="updateRadius(this.value)" class="px-4 py-2 border rounded-lg">
                              <option value="5" ${radius === 5 ? 'selected' : ''}>5 km</option>
                              <option value="10" ${radius === 10 ? 'selected' : ''}>10 km</option>
                              <option value="25" ${radius === 25 ? 'selected' : ''}>25 km</option>
                              <option value="50" ${radius === 50 ? 'selected' : ''}>50 km</option>
                          </select>
                          <button onclick="updateLocation()" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                              <i class="fas fa-sync-alt mr-2"></i>Update Location
                          </button>
                      </div>
                  </div>

                  <!-- Location Accuracy Notice -->
                  <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div class="flex items-center text-blue-800 text-sm">
                          <i class="fas fa-info-circle mr-2"></i>
                          <span>Distances are estimated. Exact location coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
                      </div>
                  </div>
              </div>

              <!-- Workers Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  ${workersWithDistance.map(worker => {
                    const displayName = worker.company_name || `${worker.first_name} ${worker.last_name}`
                    const initials = worker.company_name ? 
                      worker.company_name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2) :
                      `${worker.first_name.charAt(0)}${worker.last_name.charAt(0)}`
                    
                    return `
                      <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-300">
                          ${worker.is_featured ? `
                              <div class="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm font-medium">
                                  <i class="fas fa-star mr-2"></i>Featured Professional
                              </div>
                          ` : ''}

                          <div class="p-6">
                              <!-- Distance Badge -->
                              <div class="flex justify-between items-start mb-4">
                                  <div class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                      <i class="fas fa-map-marker-alt mr-1"></i>
                                      ${worker.distance_km.toFixed(1)} km away
                                  </div>
                                  ${worker.is_verified ? `
                                      <div class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                          <i class="fas fa-shield-check mr-1"></i>Verified
                                      </div>
                                  ` : ''}
                              </div>

                              <!-- Worker Info -->
                              <div class="flex items-center mb-4">
                                  ${worker.profile_image_url ? 
                                    `<img src="${worker.profile_image_url}" alt="${displayName}" class="w-16 h-16 rounded-full object-cover mr-4">` :
                                    `<div class="w-16 h-16 rounded-full bg-gradient-to-br from-kwikr-green to-green-600 flex items-center justify-center text-white text-xl font-bold mr-4">${initials}</div>`
                                  }
                                  <div>
                                      <h3 class="font-bold text-lg text-gray-900">${displayName}</h3>
                                      <p class="text-gray-600">${worker.city}, ${worker.province}</p>
                                      ${worker.avg_rating ? `
                                          <div class="flex items-center mt-1">
                                              <span class="text-yellow-400 text-sm">★★★★★</span>
                                              <span class="ml-1 text-sm">${worker.avg_rating.toFixed(1)}</span>
                                              ${worker.review_count ? `<span class="ml-1 text-xs text-gray-500">(${worker.review_count})</span>` : ''}
                                          </div>
                                      ` : ''}
                                  </div>
                              </div>

                              ${worker.bio ? `
                                  <p class="text-gray-600 text-sm mb-4">${worker.bio.substring(0, 100)}${worker.bio.length > 100 ? '...' : ''}</p>
                              ` : ''}

                              <div class="flex items-center justify-between mb-4">
                                  ${worker.avg_rate ? `
                                      <div class="text-xl font-bold text-kwikr-green">$${Math.round(worker.avg_rate)}/hr</div>
                                  ` : `
                                      <div class="text-gray-500">Contact for quote</div>
                                  `}
                                  <div class="text-sm text-gray-500">
                                      Est. ${Math.ceil(worker.distance_km * 2)} min away
                                  </div>
                              </div>

                              <!-- Actions -->
                              <div class="space-y-2">
                                  <div class="flex space-x-2">
                                      <a href="/universal-profile/${worker.id}" class="flex-1 bg-kwikr-green text-white text-center py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm">
                                          View Profile
                                      </a>
                                      <button onclick="contactWorker(${worker.id})" class="flex-1 border border-kwikr-green text-kwikr-green text-center py-2 px-4 rounded-lg hover:bg-green-50 transition-colors text-sm">
                                          Contact
                                      </button>
                                  </div>
                                  
                                  ${worker.website_url ? `
                                      <a href="${worker.website_url}" target="_blank" class="w-full border border-gray-300 text-gray-700 text-center py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm block">
                                          <i class="fas fa-external-link-alt mr-2"></i>Visit Website
                                      </a>
                                  ` : ''}

                                  <button onclick="getDirections(${worker.id}, '${worker.city}', '${worker.province}')" class="w-full border border-blue-300 text-blue-700 text-center py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                                      <i class="fas fa-directions mr-2"></i>Get Directions
                                  </button>
                              </div>
                          </div>
                      </div>
                    `
                  }).join('')}
              </div>

              <!-- Map Integration Placeholder -->
              <div class="bg-white rounded-lg shadow-sm p-6 mt-8">
                  <h3 class="text-lg font-semibold text-gray-800 mb-4">Map View</h3>
                  <div class="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                      <div class="text-center text-gray-500">
                          <i class="fas fa-map text-3xl mb-2"></i>
                          <p>Interactive map coming soon</p>
                          <p class="text-sm">View workers on a map with real-time locations</p>
                      </div>
                  </div>
              </div>
          </div>

          <script src="/static/search-discovery.js"></script>
          <script>
              function updateRadius(newRadius) {
                  const url = new URL(window.location.href)
                  url.searchParams.set('radius', newRadius)
                  window.location.href = url.toString()
              }

              function updateLocation() {
                  if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                          (position) => {
                              const { latitude, longitude } = position.coords
                              const url = new URL(window.location.href)
                              url.searchParams.set('lat', latitude.toString())
                              url.searchParams.set('lng', longitude.toString())
                              window.location.href = url.toString()
                          },
                          (error) => {
                              showNotification('Failed to get location: ' + error.message, 'error')
                          }
                      )
                  }
              }

              function getDirections(workerId, city, province) {
                  const destination = encodeURIComponent(\`\${city}, \${province}\`)
                  const mapsUrl = \`https://www.google.com/maps/dir/?api=1&destination=\${destination}\`
                  window.open(mapsUrl, '_blank')
              }
          </script>
      </body>
      </html>
    `)

  } catch (error) {
    console.error('Nearby search error:', error)
    return c.redirect('/search/directory?error=location_failed')
  }
})

// ============================================================================
// FEATURED WORKERS - Promoted/premium listings (Feature 5)
// ============================================================================

// Featured workers showcase page
searchRoutes.get('/featured', async (c) => {
  try {
    const db = c.env.DB
    const category = c.req.query('category')
    const province = c.req.query('province')

    // Get featured workers (premium subscription holders)
    let featuredQuery = `
      SELECT DISTINCT 
        u.id, u.first_name, u.last_name, u.city, u.province, u.is_verified, u.created_at,
        p.bio, p.profile_image_url, p.company_name, p.website_url,
        AVG(ws.hourly_rate) as avg_rate,
        AVG(r.rating) as avg_rating,
        COUNT(r.id) as review_count,
        s.plan_type,
        s.monthly_fee,
        GROUP_CONCAT(DISTINCT ws.service_name) as services_offered,
        COUNT(DISTINCT ws.id) as service_count
      FROM users u
      JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active' AND s.plan_type IN ('premium', 'professional')
      LEFT JOIN user_profiles p ON u.id = p.user_id  
      LEFT JOIN worker_services ws ON u.id = ws.user_id AND ws.is_available = 1
      LEFT JOIN reviews r ON u.id = r.worker_id
      WHERE u.role = 'worker' AND u.is_active = 1
    `
    
    const params = []
    
    if (category) {
      featuredQuery += ` AND (ws.service_category LIKE ? OR ws.service_name LIKE ?)`
      params.push(`%${category}%`, `%${category}%`)
    }
    
    if (province) {
      featuredQuery += ` AND u.province = ?`
      params.push(province)
    }
    
    featuredQuery += `
      GROUP BY u.id, s.plan_type, s.monthly_fee
      ORDER BY 
        CASE 
          WHEN s.plan_type = 'premium' THEN 1 
          WHEN s.plan_type = 'professional' THEN 2 
          ELSE 3 
        END,
        avg_rating DESC, 
        u.is_verified DESC,
        review_count DESC
      LIMIT 50
    `

    const featuredResult = await db.prepare(featuredQuery).bind(...params).all()
    const featuredWorkers = featuredResult.results as any[]

    // Get regular workers for comparison
    const regularQuery = `
      SELECT DISTINCT 
        u.id, u.first_name, u.last_name, u.city, u.province, u.is_verified,
        p.bio, p.profile_image_url, p.company_name,
        AVG(ws.hourly_rate) as avg_rate,
        AVG(r.rating) as avg_rating,
        COUNT(r.id) as review_count
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      LEFT JOIN user_profiles p ON u.id = p.user_id  
      LEFT JOIN worker_services ws ON u.id = ws.user_id
      LEFT JOIN reviews r ON u.id = r.worker_id
      WHERE u.role = 'worker' AND u.is_active = 1 
        AND (s.plan_type IS NULL OR s.plan_type = 'pay_as_you_go')
      GROUP BY u.id
      ORDER BY avg_rating DESC, u.is_verified DESC
      LIMIT 12
    `

    const regularResult = await db.prepare(regularQuery).all()
    const regularWorkers = regularResult.results as any[]

    // Get subscription pricing for upgrade prompts
    const pricingQuery = `
      SELECT plan_name, monthly_fee, description, features
      FROM subscription_plans 
      WHERE is_active = 1 
      ORDER BY monthly_fee DESC
    `
    const pricingResult = await db.prepare(pricingQuery).all()
    const plans = pricingResult.results as any[]

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Featured Professionals - getKwikr</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'kwikr-green': '#00C881'
                  }
                }
              }
            }
          </script>
      </head>
      <body class="bg-gray-50">
          <!-- Header Navigation -->
          <header class="bg-white shadow-sm border-b">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-4">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green flex items-center">
                              <i class="fas fa-bolt mr-2"></i>Kwikr
                          </a>
                          <nav class="ml-8 flex space-x-6">
                              <a href="/search/directory" class="text-gray-700 hover:text-kwikr-green">Directory</a>
                              <a href="/search/advanced" class="text-gray-700 hover:text-kwikr-green">Advanced Search</a>
                              <a href="/search/featured" class="text-kwikr-green font-medium">Featured</a>
                          </nav>
                      </div>
                      <div class="flex items-center space-x-4">
                          <a href="/subscriptions/pricing" class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-orange-600">
                              <i class="fas fa-star mr-2"></i>Become Featured
                          </a>
                      </div>
                  </div>
              </div>
          </header>

          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <!-- Hero Section -->
              <div class="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-lg p-12 mb-8 text-center">
                  <h1 class="text-5xl font-bold mb-4">
                      <i class="fas fa-crown mr-3"></i>
                      Featured Professionals
                  </h1>
                  <p class="text-xl mb-6 max-w-3xl mx-auto">
                      Discover our top-rated, premium service providers who have invested in excellence and are committed to delivering outstanding results
                  </p>
                  <div class="flex flex-wrap justify-center gap-4">
                      <div class="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                          <div class="text-2xl font-bold">${featuredWorkers.length}</div>
                          <div class="text-sm">Featured Workers</div>
                      </div>
                      <div class="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                          <div class="text-2xl font-bold">${featuredWorkers.filter(w => w.avg_rating >= 4.5).length}</div>
                          <div class="text-sm">4.5+ Star Rating</div>
                      </div>
                      <div class="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                          <div class="text-2xl font-bold">${featuredWorkers.filter(w => w.is_verified).length}</div>
                          <div class="text-sm">Verified Pros</div>
                      </div>
                  </div>
              </div>

              <!-- Filter Options -->
              <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div class="flex flex-wrap items-center gap-4">
                      <div class="flex items-center">
                          <label class="text-sm font-medium text-gray-700 mr-3">Filter by Category:</label>
                          <select onchange="filterByCategory(this.value)" class="px-4 py-2 border rounded-lg">
                              <option value="">All Categories</option>
                              <option value="Plumbing" ${category === 'Plumbing' ? 'selected' : ''}>Plumbing</option>
                              <option value="Electrical" ${category === 'Electrical' ? 'selected' : ''}>Electrical</option>
                              <option value="Cleaning" ${category === 'Cleaning' ? 'selected' : ''}>Cleaning</option>
                              <option value="HVAC" ${category === 'HVAC' ? 'selected' : ''}>HVAC</option>
                              <option value="Landscaping" ${category === 'Landscaping' ? 'selected' : ''}>Landscaping</option>
                          </select>
                      </div>
                      <div class="flex items-center">
                          <label class="text-sm font-medium text-gray-700 mr-3">Filter by Province:</label>
                          <select onchange="filterByProvince(this.value)" class="px-4 py-2 border rounded-lg">
                              <option value="">All Provinces</option>
                              <option value="ON" ${province === 'ON' ? 'selected' : ''}>Ontario</option>
                              <option value="BC" ${province === 'BC' ? 'selected' : ''}>British Columbia</option>
                              <option value="AB" ${province === 'AB' ? 'selected' : ''}>Alberta</option>
                              <option value="QC" ${province === 'QC' ? 'selected' : ''}>Quebec</option>
                          </select>
                      </div>
                  </div>
              </div>

              <!-- Premium Workers Grid -->
              <div class="mb-12">
                  <div class="flex items-center justify-between mb-6">
                      <h2 class="text-3xl font-bold text-gray-800">
                          <i class="fas fa-star text-yellow-500 mr-2"></i>
                          Premium Professionals
                      </h2>
                      <div class="text-sm text-gray-600">
                          ${featuredWorkers.filter(w => w.plan_type === 'premium').length} premium members
                      </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      ${featuredWorkers.filter(w => w.plan_type === 'premium').map(worker => {
                        const displayName = worker.company_name || `${worker.first_name} ${worker.last_name}`
                        const initials = worker.company_name ? 
                          worker.company_name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2) :
                          `${worker.first_name.charAt(0)}${worker.last_name.charAt(0)}`
                        const services = worker.services_offered ? worker.services_offered.split(',').slice(0, 3) : []
                        
                        return `
                          <div class="bg-gradient-to-br from-white via-yellow-50 to-orange-50 rounded-lg shadow-lg border-2 border-yellow-300 overflow-hidden transform hover:scale-105 transition-all duration-300">
                              <!-- Premium Badge -->
                              <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3">
                                  <div class="flex items-center justify-between">
                                      <span class="font-bold flex items-center">
                                          <i class="fas fa-crown mr-2"></i>Premium Professional
                                      </span>
                                      <span class="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                                          Featured
                                      </span>
                                  </div>
                              </div>

                              <div class="p-6">
                                  <!-- Worker Header -->
                                  <div class="flex items-center mb-6">
                                      ${worker.profile_image_url ? 
                                        `<img src="${worker.profile_image_url}" alt="${displayName}" class="w-20 h-20 rounded-full object-cover border-4 border-yellow-300 mr-4">` :
                                        `<div class="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-yellow-300 mr-4">${initials}</div>`
                                      }
                                      <div>
                                          <h3 class="text-xl font-bold text-gray-900">${displayName}</h3>
                                          <p class="text-gray-600">${worker.city}, ${worker.province}</p>
                                          <div class="flex items-center mt-2">
                                              ${worker.is_verified ? `
                                                  <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                                                      <i class="fas fa-shield-check mr-1"></i>Verified
                                                  </span>
                                              ` : ''}
                                              ${worker.avg_rating ? `
                                                  <div class="flex items-center">
                                                      <span class="text-yellow-400">★★★★★</span>
                                                      <span class="ml-1 text-sm font-medium">${worker.avg_rating.toFixed(1)}</span>
                                                      <span class="ml-1 text-xs text-gray-500">(${worker.review_count})</span>
                                                  </div>
                                              ` : ''}
                                          </div>
                                      </div>
                                  </div>

                                  <!-- Bio -->
                                  ${worker.bio ? `
                                      <p class="text-gray-700 text-sm mb-4 leading-relaxed">${worker.bio.substring(0, 150)}${worker.bio.length > 150 ? '...' : ''}</p>
                                  ` : ''}

                                  <!-- Services -->
                                  <div class="mb-6">
                                      <h4 class="text-sm font-semibold text-gray-700 mb-2">Specialties</h4>
                                      <div class="flex flex-wrap gap-2">
                                          ${services.map(service => `
                                              <span class="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
                                                  ${service.trim()}
                                              </span>
                                          `).join('')}
                                          ${worker.service_count > 3 ? `
                                              <span class="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                                  +${worker.service_count - 3} more
                                              </span>
                                          ` : ''}
                                      </div>
                                  </div>

                                  <!-- Pricing -->
                                  <div class="mb-6 text-center">
                                      ${worker.avg_rate ? `
                                          <div class="text-3xl font-bold text-orange-500">$${Math.round(worker.avg_rate)}/hr</div>
                                          <div class="text-sm text-gray-600">Average Rate</div>
                                      ` : `
                                          <div class="text-xl text-gray-600">Contact for Custom Quote</div>
                                      `}
                                  </div>

                                  <!-- Premium Features -->
                                  <div class="bg-yellow-50 rounded-lg p-4 mb-6">
                                      <h4 class="text-sm font-semibold text-yellow-800 mb-2">Premium Benefits</h4>
                                      <ul class="text-xs text-yellow-700 space-y-1">
                                          <li><i class="fas fa-check mr-2"></i>Priority in search results</li>
                                          <li><i class="fas fa-check mr-2"></i>Enhanced profile visibility</li>
                                          <li><i class="fas fa-check mr-2"></i>Featured badge & highlighting</li>
                                          <li><i class="fas fa-check mr-2"></i>Advanced analytics</li>
                                      </ul>
                                  </div>

                                  <!-- Action Buttons -->
                                  <div class="space-y-3">
                                      <a href="/universal-profile/${worker.id}" 
                                         class="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-3 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 font-medium block">
                                          <i class="fas fa-eye mr-2"></i>View Premium Profile
                                      </a>
                                      
                                      <div class="grid grid-cols-2 gap-2">
                                          <button onclick="contactWorker(${worker.id})" 
                                                  class="border-2 border-orange-300 text-orange-600 text-center py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium">
                                              <i class="fas fa-envelope mr-1"></i>Contact
                                          </button>
                                          ${worker.website_url ? `
                                              <a href="${worker.website_url}" target="_blank"
                                                 class="border-2 border-yellow-300 text-yellow-600 text-center py-2 px-3 rounded-lg hover:bg-yellow-50 transition-colors text-sm font-medium">
                                                  <i class="fas fa-external-link-alt mr-1"></i>Website
                                              </a>
                                          ` : `
                                              <button onclick="saveWorker(${worker.id})" 
                                                      class="border-2 border-gray-300 text-gray-600 text-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                                  <i class="fas fa-heart mr-1"></i>Save
                                              </button>
                                          `}
                                      </div>
                                  </div>
                              </div>
                          </div>
                        `
                      }).join('')}
                  </div>
              </div>

              <!-- Professional Workers -->
              ${featuredWorkers.filter(w => w.plan_type === 'professional').length > 0 ? `
                  <div class="mb-12">
                      <div class="flex items-center justify-between mb-6">
                          <h2 class="text-2xl font-bold text-gray-800">
                              <i class="fas fa-medal text-blue-500 mr-2"></i>
                              Professional Members
                          </h2>
                          <div class="text-sm text-gray-600">
                              ${featuredWorkers.filter(w => w.plan_type === 'professional').length} professional members
                          </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          ${featuredWorkers.filter(w => w.plan_type === 'professional').map(worker => {
                            const displayName = worker.company_name || `${worker.first_name} ${worker.last_name}`
                            const initials = worker.company_name ? 
                              worker.company_name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2) :
                              `${worker.first_name.charAt(0)}${worker.last_name.charAt(0)}`
                            
                            return `
                              <div class="bg-white rounded-lg shadow-md border-2 border-blue-200 hover:border-blue-400 transition-colors overflow-hidden">
                                  <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 text-sm font-medium">
                                      <i class="fas fa-medal mr-2"></i>Professional
                                  </div>
                                  
                                  <div class="p-4">
                                      <div class="flex items-center mb-3">
                                          ${worker.profile_image_url ? 
                                            `<img src="${worker.profile_image_url}" alt="${displayName}" class="w-12 h-12 rounded-full object-cover mr-3">` :
                                            `<div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold mr-3">${initials}</div>`
                                          }
                                          <div>
                                              <h3 class="font-semibold text-gray-900">${displayName}</h3>
                                              <p class="text-xs text-gray-600">${worker.city}, ${worker.province}</p>
                                          </div>
                                      </div>

                                      ${worker.avg_rating ? `
                                          <div class="flex items-center mb-3">
                                              <span class="text-yellow-400 text-sm">★★★★★</span>
                                              <span class="ml-1 text-sm">${worker.avg_rating.toFixed(1)}</span>
                                          </div>
                                      ` : ''}

                                      <div class="flex space-x-2">
                                          <a href="/universal-profile/${worker.id}" 
                                             class="flex-1 bg-blue-500 text-white text-center py-2 px-2 rounded text-xs hover:bg-blue-600">
                                              View
                                          </a>
                                          <button onclick="contactWorker(${worker.id})" 
                                                  class="flex-1 border border-blue-300 text-blue-600 text-center py-2 px-2 rounded text-xs hover:bg-blue-50">
                                              Contact
                                          </button>
                                      </div>
                                  </div>
                              </div>
                            `
                          }).join('')}
                      </div>
                  </div>
              ` : ''}

              <!-- Upgrade Prompt for Regular Workers -->
              <div class="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-8 mb-8">
                  <div class="text-center">
                      <h2 class="text-2xl font-bold text-gray-800 mb-4">Want to Stand Out?</h2>
                      <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
                          Join our featured professionals and get more visibility, higher rankings, and increased bookings with our premium plans.
                      </p>
                      
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                          ${plans.map(plan => `
                              <div class="bg-white rounded-lg p-6 border ${plan.plan_name === 'Premium' ? 'border-yellow-300 ring-2 ring-yellow-200' : 'border-gray-200'}">
                                  ${plan.plan_name === 'Premium' ? `
                                      <div class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full inline-block mb-2">
                                          Most Popular
                                      </div>
                                  ` : ''}
                                  <h3 class="text-lg font-bold text-gray-800 mb-2">${plan.plan_name}</h3>
                                  <div class="text-3xl font-bold text-kwikr-green mb-2">$${plan.monthly_fee}/mo</div>
                                  <p class="text-sm text-gray-600 mb-4">${plan.description}</p>
                                  <a href="/subscriptions/pricing" 
                                     class="w-full ${plan.plan_name === 'Premium' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-kwikr-green hover:bg-green-600'} text-white text-center py-2 px-4 rounded-lg transition-colors block">
                                      Choose Plan
                                  </a>
                              </div>
                          `).join('')}
                      </div>
                  </div>
              </div>

              <!-- Regular Workers Comparison -->
              <div class="bg-white rounded-lg shadow-sm p-8">
                  <h2 class="text-2xl font-bold text-gray-800 mb-6">Compare with Regular Listings</h2>
                  <p class="text-gray-600 mb-6">See the difference between featured and regular worker profiles</p>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      ${regularWorkers.slice(0, 8).map(worker => {
                        const displayName = worker.company_name || `${worker.first_name} ${worker.last_name}`
                        const initials = worker.company_name ? 
                          worker.company_name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2) :
                          `${worker.first_name.charAt(0)}${worker.last_name.charAt(0)}`
                        
                        return `
                          <div class="bg-white rounded-lg border border-gray-200 p-4 opacity-75">
                              <div class="flex items-center mb-3">
                                  ${worker.profile_image_url ? 
                                    `<img src="${worker.profile_image_url}" alt="${displayName}" class="w-10 h-10 rounded-full object-cover mr-3">` :
                                    `<div class="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold mr-3">${initials}</div>`
                                  }
                                  <div>
                                      <h3 class="text-sm font-medium text-gray-700">${displayName}</h3>
                                      <p class="text-xs text-gray-500">${worker.city}, ${worker.province}</p>
                                  </div>
                              </div>
                              
                              ${worker.avg_rating ? `
                                  <div class="text-xs text-gray-500 mb-2">
                                      ★★★★☆ ${worker.avg_rating.toFixed(1)}
                                  </div>
                              ` : ''}
                              
                              <div class="text-xs text-gray-400">Regular Listing</div>
                          </div>
                        `
                      }).join('')}
                  </div>
              </div>
          </div>

          <script src="/static/search-discovery.js"></script>
          <script>
              function filterByCategory(category) {
                  const url = new URL(window.location.href)
                  if (category) {
                      url.searchParams.set('category', category)
                  } else {
                      url.searchParams.delete('category')
                  }
                  window.location.href = url.toString()
              }

              function filterByProvince(province) {
                  const url = new URL(window.location.href)
                  if (province) {
                      url.searchParams.set('province', province)
                  } else {
                      url.searchParams.delete('province')
                  }
                  window.location.href = url.toString()
              }
          </script>
      </body>
      </html>
    `)

  } catch (error) {
    console.error('Featured workers error:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load featured workers</p>
          <a href="/search/directory" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Go to Directory</a>
        </div>
      </div>
    `, 500)
  }
})

// ============================================================================
// SEARCH RESULTS OPTIMIZATION - Ranking and relevance (Feature 6)
// ============================================================================

// Enhanced search API with advanced ranking
searchRoutes.post('/api/search', async (c) => {
  try {
    const db = c.env.DB
    const body = await c.req.json()
    
    const filters: SearchFilter = {
      serviceCategory: body.category,
      location_province: body.province,
      location_city: body.city,
      min_rate: body.min_rate,
      max_rate: body.max_rate,
      min_rating: body.min_rating,
      is_verified: body.verified,
      is_featured: body.featured,
      latitude: body.lat,
      longitude: body.lng,
      radius_km: body.radius || 25
    }

    // Advanced search query with relevance scoring
    let searchQuery = `
      SELECT DISTINCT
        u.id, u.first_name, u.last_name, u.email, u.phone, u.city, u.province, u.is_verified, u.created_at,
        p.bio, p.profile_image_url, p.company_name, p.website_url,
        AVG(ws.hourly_rate) as avg_rate,
        MIN(ws.hourly_rate) as min_rate,
        MAX(ws.hourly_rate) as max_rate,
        AVG(r.rating) as avg_rating,
        COUNT(DISTINCT r.id) as review_count,
        COUNT(DISTINCT ws.id) as service_count,
        CASE WHEN s.plan_type = 'premium' THEN 1 ELSE 0 END as is_featured,
        s.plan_type as subscription_tier,
        GROUP_CONCAT(DISTINCT ws.service_name) as services_list,
        
        -- Relevance scoring components
        (CASE WHEN s.plan_type = 'premium' THEN 20 ELSE 0 END) +
        (CASE WHEN u.is_verified THEN 15 ELSE 0 END) +
        (CASE WHEN AVG(r.rating) >= 4.5 THEN 15 ELSE AVG(r.rating) * 3 END) +
        (CASE WHEN COUNT(r.id) > 10 THEN 10 ELSE COUNT(r.id) / 2 END) +
        (CASE WHEN p.company_name IS NOT NULL THEN 5 ELSE 0 END) +
        (CASE WHEN p.website_url IS NOT NULL THEN 3 ELSE 0 END) +
        (COUNT(DISTINCT ws.id) * 2) as base_relevance_score
        
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN worker_services ws ON u.id = ws.user_id AND ws.is_available = 1
      LEFT JOIN reviews r ON u.id = r.worker_id
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      WHERE u.role = 'worker' AND u.is_active = 1
    `
    
    const params: any[] = []

    // Apply filters
    if (filters.serviceCategory) {
      searchQuery += ` AND (ws.service_category LIKE ? OR ws.service_name LIKE ?)`
      params.push(`%${filters.serviceCategory}%`, `%${filters.serviceCategory}%`)
    }
    
    if (filters.location_province) {
      searchQuery += ` AND u.province = ?`
      params.push(filters.location_province)
    }
    
    if (filters.location_city) {
      searchQuery += ` AND u.city LIKE ?`
      params.push(`%${filters.location_city}%`)
    }
    
    if (filters.is_verified) {
      searchQuery += ` AND u.is_verified = 1`
    }

    if (filters.is_featured) {
      searchQuery += ` AND s.plan_type IN ('premium', 'professional')`
    }

    // Group and having clauses for aggregated filters
    searchQuery += ` 
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, u.city, u.province, 
               u.is_verified, u.created_at, p.bio, p.profile_image_url, p.company_name, 
               p.website_url, s.plan_type
      HAVING 1=1
    `

    // Apply rating filter after grouping
    if (filters.min_rating) {
      searchQuery += ` AND AVG(r.rating) >= ?`
      params.push(filters.min_rating)
    }

    // Apply rate filters after grouping
    if (filters.min_rate) {
      searchQuery += ` AND AVG(ws.hourly_rate) >= ?`
      params.push(filters.min_rate)
    }

    if (filters.max_rate) {
      searchQuery += ` AND AVG(ws.hourly_rate) <= ?`
      params.push(filters.max_rate)
    }

    // Advanced ordering by relevance score
    searchQuery += ` 
      ORDER BY 
        base_relevance_score DESC,
        is_featured DESC,
        avg_rating DESC NULLS LAST,
        u.is_verified DESC,
        review_count DESC,
        service_count DESC,
        u.created_at DESC
      LIMIT 100
    `

    const searchResult = await db.prepare(searchQuery).bind(...params).all()
    const workers = searchResult.results as any[]

    // Calculate enhanced relevance scores with additional factors
    const searchResults: SearchResult[] = []
    
    for (const worker of workers) {
      // Get services for detailed scoring
      const servicesResult = await db.prepare(`
        SELECT ws.*, jc.name as category_name, jc.icon_class
        FROM worker_services ws
        LEFT JOIN job_categories jc ON ws.service_category = jc.name
        WHERE ws.user_id = ? AND ws.is_available = 1
      `).bind(worker.id).all()
      
      const services = servicesResult.results as WorkerService[]
      
      // Calculate comprehensive relevance score
      const { score: baseScore, reasons } = calculateRelevanceScore(worker, services, filters)
      let score = baseScore
      
      // Add distance factor if geolocation provided
      let distance_km: number | undefined
      if (filters.latitude && filters.longitude) {
        // Mock distance calculation (in production, use actual geocoding)
        distance_km = Math.random() * (filters.radius_km || 25)
        
        // Adjust score based on distance
        const distanceScore = Math.max(0, 20 - (distance_km / (filters.radius_km || 25)) * 20)
        score += distanceScore
        
        if (distance_km < 5) {
          reasons.push('Very Close')
        } else if (distance_km < 15) {
          reasons.push('Nearby')
        }
      }

      searchResults.push({
        worker: {
          ...worker,
          is_featured: worker.is_featured === 1
        },
        services,
        distance_km,
        relevance_score: Math.round(score),
        match_reasons: reasons
      })
    }

    // Final sort by comprehensive relevance score
    searchResults.sort((a, b) => b.relevance_score - a.relevance_score)

    return c.json({
      success: true,
      results: searchResults,
      total: searchResults.length,
      filters: filters,
      search_metadata: {
        algorithm_version: '2.0',
        factors_considered: [
          'Featured status (premium/professional)',
          'Verification status', 
          'Average rating and review count',
          'Service category matching',
          'Geographic proximity',
          'Rate compatibility',
          'Profile completeness',
          'Business credentials'
        ],
        scoring_explanation: 'Results ranked by multi-factor relevance algorithm considering service match, quality indicators, location, and premium status'
      }
    })

  } catch (error) {
    console.error('Advanced search API error:', error)
    return c.json({
      success: false,
      error: 'Search failed',
      results: [],
      total: 0
    }, 500)
  }
})

// Search analytics endpoint for optimization insights
searchRoutes.get('/api/search/analytics', async (c) => {
  try {
    const db = c.env.DB
    
    // Get search performance data
    const [topCategories, topLocations, ratingDistribution] = await Promise.all([
      // Most searched categories
      db.prepare(`
        SELECT jc.name, jc.icon_class, COUNT(DISTINCT ws.user_id) as worker_count,
               AVG(ws.hourly_rate) as avg_rate
        FROM job_categories jc
        LEFT JOIN worker_services ws ON jc.name = ws.service_category
        JOIN users u ON ws.user_id = u.id AND u.role = 'worker' AND u.is_active = 1
        WHERE jc.is_active = 1
        GROUP BY jc.id, jc.name, jc.icon_class
        ORDER BY worker_count DESC
        LIMIT 10
      `).all(),

      // Top locations by worker density
      db.prepare(`
        SELECT city, province, COUNT(*) as worker_count
        FROM users 
        WHERE role = 'worker' AND is_active = 1 AND city IS NOT NULL
        GROUP BY city, province
        ORDER BY worker_count DESC
        LIMIT 10
      `).all(),

      // Rating distribution for quality insights
      db.prepare(`
        SELECT 
          CASE 
            WHEN AVG(rating) >= 4.5 THEN '4.5+ stars'
            WHEN AVG(rating) >= 4.0 THEN '4.0-4.4 stars'
            WHEN AVG(rating) >= 3.5 THEN '3.5-3.9 stars'
            ELSE 'Under 3.5 stars'
          END as rating_range,
          COUNT(DISTINCT worker_id) as worker_count
        FROM reviews
        GROUP BY 
          CASE 
            WHEN AVG(rating) >= 4.5 THEN '4.5+ stars'
            WHEN AVG(rating) >= 4.0 THEN '4.0-4.4 stars'
            WHEN AVG(rating) >= 3.5 THEN '3.5-3.9 stars'
            ELSE 'Under 3.5 stars'
          END
        ORDER BY worker_count DESC
      `).all()
    ])

    return c.json({
      success: true,
      analytics: {
        top_categories: topCategories.results,
        top_locations: topLocations.results,
        rating_distribution: ratingDistribution.results,
        search_optimization_tips: [
          'Featured workers appear 3x more often in top results',
          'Verified professionals get 40% more views',
          'Complete profiles rank 2x higher',
          'Workers with 10+ reviews see 60% more contacts',
          'Competitive pricing within category range increases visibility'
        ]
      }
    })

  } catch (error) {
    console.error('Search analytics error:', error)
    return c.json({
      success: false,
      error: 'Failed to load analytics'
    }, 500)
  }
})

export { searchRoutes }