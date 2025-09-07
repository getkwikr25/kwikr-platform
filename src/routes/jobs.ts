import { Hono } from 'hono'
import type { Context } from 'hono'

// Types for job management
interface Job {
  id: number
  client_id: number
  title: string
  description: string
  category_id: number
  budget_min: number
  budget_max: number
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  location_province: string
  location_city: string
  location_address?: string
  status: 'posted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
  assigned_worker_id?: number
  start_date?: string
  expected_completion?: string
  actual_completion?: string
  created_at: string
  updated_at: string
}

interface Bid {
  id: number
  job_id: number
  worker_id: number
  bid_amount: number
  cover_message?: string
  estimated_timeline?: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  submitted_at: string
  responded_at?: string
}

interface JobWithDetails extends Job {
  category_name?: string
  client_name?: string
  worker_name?: string
  bid_count?: number
  client_rating?: number
  worker_rating?: number
}

// Middleware to require authentication
const requireAuth = async (c: Context, next: Function) => {
  const sessionToken = c.req.header('Cookie')?.split('session_token=')[1]?.split(';')[0]
  
  if (!sessionToken) {
    return c.redirect('/login')
  }

  try {
    const db = c.env.DB
    const session = await db
      .prepare('SELECT user_sessions.*, users.role, users.first_name, users.last_name, users.email FROM user_sessions JOIN users ON user_sessions.user_id = users.id WHERE session_token = ? AND expires_at > datetime("now")')
      .bind(sessionToken)
      .first()

    if (!session) {
      return c.redirect('/login')
    }

    c.set('user', session)
    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return c.redirect('/login')
  }
}

// Middleware to require client role
const requireClient = async (c: Context, next: Function) => {
  const user = c.get('user')
  if (!user || user.role !== 'client') {
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p class="text-gray-600 mb-4">This feature is only available to clients.</p>
          <a href="/dashboard" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Return to Dashboard</a>
        </div>
      </div>
    `, 403)
  }
  await next()
}

// Middleware to require worker role
const requireWorker = async (c: Context, next: Function) => {
  const user = c.get('user')
  if (!user || user.role !== 'worker') {
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p class="text-gray-600 mb-4">This feature is only available to workers.</p>
          <a href="/dashboard" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Return to Dashboard</a>
        </div>
      </div>
    `, 403)
  }
  await next()
}

const jobsRoutes = new Hono()

// ============================================================================
// JOB POSTING SYSTEM - Clients post service requests
// ============================================================================

// Display job posting form
jobsRoutes.get('/post', requireAuth, requireClient, async (c) => {
  try {
    const db = c.env.DB
    const user = c.get('user')

    // Get job categories for dropdown
    const categories = await db
      .prepare('SELECT * FROM job_categories WHERE is_active = 1 ORDER BY name')
      .all()

    // Get Canadian provinces
    const provinces = [
      { code: 'AB', name: 'Alberta' },
      { code: 'BC', name: 'British Columbia' },
      { code: 'MB', name: 'Manitoba' },
      { code: 'NB', name: 'New Brunswick' },
      { code: 'NL', name: 'Newfoundland and Labrador' },
      { code: 'NS', name: 'Nova Scotia' },
      { code: 'NT', name: 'Northwest Territories' },
      { code: 'NU', name: 'Nunavut' },
      { code: 'ON', name: 'Ontario' },
      { code: 'PE', name: 'Prince Edward Island' },
      { code: 'QC', name: 'Quebec' },
      { code: 'SK', name: 'Saskatchewan' },
      { code: 'YT', name: 'Yukon' }
    ]

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Post a Job - getKwikr</title>
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
          <!-- Header -->
          <header class="bg-white shadow-sm border-b">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-4">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green">Kwikr</a>
                      </div>
                      <nav class="flex items-center space-x-4">
                          <a href="/dashboard" class="text-gray-700 hover:text-kwikr-green">Dashboard</a>
                          <span class="text-gray-500">|</span>
                          <span class="text-gray-700">Welcome, ${user.first_name}</span>
                          <a href="/logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</a>
                      </nav>
                  </div>
              </div>
          </header>

          <!-- Main Content -->
          <main class="max-w-4xl mx-auto py-8 px-4">
              <div class="bg-white rounded-lg shadow-md p-8">
                  <div class="mb-8">
                      <h1 class="text-3xl font-bold text-gray-800 mb-2">
                          <i class="fas fa-plus-circle text-kwikr-green mr-3"></i>
                          Post a New Job
                      </h1>
                      <p class="text-gray-600">Describe the service you need and connect with qualified workers in your area.</p>
                  </div>

                  <form action="/jobs/post" method="POST" class="space-y-6">
                      <!-- Job Title -->
                      <div>
                          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                          <input type="text" id="title" name="title" required
                                 class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent"
                                 placeholder="e.g., Fix leaky kitchen faucet, Install ceiling fan, Paint living room">
                      </div>

                      <!-- Category -->
                      <div>
                          <label for="category_id" class="block text-sm font-medium text-gray-700 mb-2">Service Category *</label>
                          <select id="category_id" name="category_id" required
                                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                              <option value="">Select a category...</option>
                              ${categories.results.map(cat => `
                                  <option value="${cat.id}">
                                      ${cat.name} ${cat.requires_license ? '(License Required)' : ''}
                                  </option>
                              `).join('')}
                          </select>
                      </div>

                      <!-- Description -->
                      <div>
                          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                          <textarea id="description" name="description" required rows="5"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent"
                                    placeholder="Provide detailed information about the work needed, including materials, timeline, and any special requirements..."></textarea>
                      </div>

                      <!-- Budget Range -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label for="budget_min" class="block text-sm font-medium text-gray-700 mb-2">Minimum Budget ($CAD)</label>
                              <input type="number" id="budget_min" name="budget_min" min="0" step="0.01"
                                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent"
                                     placeholder="e.g., 100">
                          </div>
                          <div>
                              <label for="budget_max" class="block text-sm font-medium text-gray-700 mb-2">Maximum Budget ($CAD)</label>
                              <input type="number" id="budget_max" name="budget_max" min="0" step="0.01"
                                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent"
                                     placeholder="e.g., 500">
                          </div>
                      </div>

                      <!-- Urgency -->
                      <div>
                          <label for="urgency" class="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                          <select id="urgency" name="urgency"
                                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                              <option value="low">Low - Flexible timeline</option>
                              <option value="normal" selected>Normal - Within a week</option>
                              <option value="high">High - Within 2-3 days</option>
                              <option value="urgent">Urgent - ASAP (same day)</option>
                          </select>
                      </div>

                      <!-- Location -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label for="location_province" class="block text-sm font-medium text-gray-700 mb-2">Province *</label>
                              <select id="location_province" name="location_province" required
                                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                                  <option value="">Select province...</option>
                                  ${provinces.map(prov => `
                                      <option value="${prov.code}" ${user.province === prov.code ? 'selected' : ''}>
                                          ${prov.name}
                                      </option>
                                  `).join('')}
                              </select>
                          </div>
                          <div>
                              <label for="location_city" class="block text-sm font-medium text-gray-700 mb-2">City *</label>
                              <input type="text" id="location_city" name="location_city" required
                                     value="${user.city || ''}"
                                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent"
                                     placeholder="e.g., Toronto">
                          </div>
                      </div>

                      <!-- Specific Address -->
                      <div>
                          <label for="location_address" class="block text-sm font-medium text-gray-700 mb-2">Specific Address (Optional)</label>
                          <input type="text" id="location_address" name="location_address"
                                 class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent"
                                 placeholder="e.g., 123 Main Street (will only be shared with selected worker)">
                      </div>

                      <!-- Timeline -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label for="start_date" class="block text-sm font-medium text-gray-700 mb-2">Preferred Start Date</label>
                              <input type="date" id="start_date" name="start_date"
                                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                          </div>
                          <div>
                              <label for="expected_completion" class="block text-sm font-medium text-gray-700 mb-2">Expected Completion</label>
                              <input type="date" id="expected_completion" name="expected_completion"
                                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                          </div>
                      </div>

                      <!-- Submit Button -->
                      <div class="flex justify-end space-x-4 pt-6">
                          <a href="/dashboard" class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
                              Cancel
                          </a>
                          <button type="submit" class="px-8 py-3 bg-kwikr-green text-white rounded-lg hover:bg-green-600 transition-colors">
                              <i class="fas fa-paper-plane mr-2"></i>
                              Post Job
                          </button>
                      </div>
                  </form>
              </div>
          </main>

          <script>
              // Auto-set minimum date to today
              document.getElementById('start_date').min = new Date().toISOString().split('T')[0];
              document.getElementById('expected_completion').min = new Date().toISOString().split('T')[0];

              // Validate budget range
              document.getElementById('budget_max').addEventListener('input', function() {
                  const minBudget = parseFloat(document.getElementById('budget_min').value) || 0;
                  const maxBudget = parseFloat(this.value) || 0;
                  
                  if (maxBudget > 0 && maxBudget < minBudget) {
                      this.setCustomValidity('Maximum budget must be greater than minimum budget');
                  } else {
                      this.setCustomValidity('');
                  }
              });
          </script>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading job posting form:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load job posting form.</p>
          <a href="/dashboard" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Return to Dashboard</a>
        </div>
      </div>
    `, 500)
  }
})

// Handle job posting form submission
jobsRoutes.post('/post', requireAuth, requireClient, async (c) => {
  try {
    const db = c.env.DB
    const user = c.get('user')
    const formData = await c.req.formData()

    // Validate required fields
    const title = formData.get('title')?.toString()
    const description = formData.get('description')?.toString()
    const category_id = parseInt(formData.get('category_id')?.toString() || '0')
    const location_province = formData.get('location_province')?.toString()
    const location_city = formData.get('location_city')?.toString()

    if (!title || !description || !category_id || !location_province || !location_city) {
      throw new Error('Missing required fields')
    }

    // Optional fields
    const budget_min = parseFloat(formData.get('budget_min')?.toString() || '0') || null
    const budget_max = parseFloat(formData.get('budget_max')?.toString() || '0') || null
    const urgency = formData.get('urgency')?.toString() || 'normal'
    const location_address = formData.get('location_address')?.toString() || null
    const start_date = formData.get('start_date')?.toString() || null
    const expected_completion = formData.get('expected_completion')?.toString() || null

    // Validate budget range
    if (budget_min && budget_max && budget_max < budget_min) {
      throw new Error('Maximum budget must be greater than minimum budget')
    }

    // Insert the job
    const result = await db
      .prepare(`
        INSERT INTO jobs (
          client_id, title, description, category_id, budget_min, budget_max, 
          urgency, location_province, location_city, location_address, 
          start_date, expected_completion, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'posted', datetime('now'), datetime('now'))
      `)
      .bind(
        user.user_id, title, description, category_id, budget_min, budget_max,
        urgency, location_province, location_city, location_address,
        start_date, expected_completion
      )
      .run()

    if (!result.success) {
      throw new Error('Failed to create job posting')
    }

    // Redirect to job details page
    return c.redirect(`/jobs/${result.meta.last_row_id}`)

  } catch (error) {
    console.error('Error creating job posting:', error)
    
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">${error instanceof Error ? error.message : 'Failed to create job posting'}</p>
          <a href="/jobs/post" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">Try Again</a>
          <a href="/dashboard" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Dashboard</a>
        </div>
      </div>
    `, 500)
  }
})

// ============================================================================
// JOB BROWSING & SEARCH - Workers browse and search for jobs
// ============================================================================

// Job marketplace - browse all available jobs
jobsRoutes.get('/browse', requireAuth, requireWorker, async (c) => {
  try {
    const db = c.env.DB
    const user = c.get('user')
    
    // Get search parameters
    const category = c.req.query('category') || ''
    const location = c.req.query('location') || ''
    const budget_min = c.req.query('budget_min') || ''
    const budget_max = c.req.query('budget_max') || ''
    const urgency = c.req.query('urgency') || ''
    const search = c.req.query('search') || ''

    // Build search query
    let whereClause = "WHERE j.status = 'posted'"
    const params: any[] = []

    if (category) {
      whereClause += " AND j.category_id = ?"
      params.push(parseInt(category))
    }

    if (location) {
      whereClause += " AND (j.location_province = ? OR j.location_city LIKE ?)"
      params.push(location, `%${location}%`)
    }

    if (budget_min) {
      whereClause += " AND (j.budget_max IS NULL OR j.budget_max >= ?)"
      params.push(parseFloat(budget_min))
    }

    if (budget_max) {
      whereClause += " AND (j.budget_min IS NULL OR j.budget_min <= ?)"
      params.push(parseFloat(budget_max))
    }

    if (urgency) {
      whereClause += " AND j.urgency = ?"
      params.push(urgency)
    }

    if (search) {
      whereClause += " AND (j.title LIKE ? OR j.description LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    // Get jobs with job matching algorithm considerations
    const jobs = await db
      .prepare(`
        SELECT 
          j.*,
          jc.name as category_name,
          jc.icon_class,
          u.first_name || ' ' || u.last_name as client_name,
          COUNT(b.id) as bid_count,
          -- Job matching score based on worker's services
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM worker_services ws 
              WHERE ws.user_id = ? AND ws.service_category = jc.name AND ws.is_available = 1
            ) THEN 100
            ELSE 50
          END as match_score
        FROM jobs j
        JOIN job_categories jc ON j.category_id = jc.id
        JOIN users u ON j.client_id = u.id
        LEFT JOIN bids b ON j.id = b.job_id
        ${whereClause}
        GROUP BY j.id
        ORDER BY match_score DESC, j.urgency DESC, j.created_at DESC
        LIMIT 50
      `)
      .bind(user.user_id, ...params)
      .all()

    // Get job categories for filter
    const categories = await db
      .prepare('SELECT * FROM job_categories WHERE is_active = 1 ORDER BY name')
      .all()

    // Get provinces for filter
    const provinces = [
      { code: 'AB', name: 'Alberta' },
      { code: 'BC', name: 'British Columbia' },
      { code: 'MB', name: 'Manitoba' },
      { code: 'NB', name: 'New Brunswick' },
      { code: 'NL', name: 'Newfoundland and Labrador' },
      { code: 'NS', name: 'Nova Scotia' },
      { code: 'NT', name: 'Northwest Territories' },
      { code: 'NU', name: 'Nunavut' },
      { code: 'ON', name: 'Ontario' },
      { code: 'PE', name: 'Prince Edward Island' },
      { code: 'QC', name: 'Quebec' },
      { code: 'SK', name: 'Saskatchewan' },
      { code: 'YT', name: 'Yukon' }
    ]

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Browse Jobs - getKwikr</title>
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
          <!-- Header -->
          <header class="bg-white shadow-sm border-b">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-4">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green">Kwikr</a>
                      </div>
                      <nav class="flex items-center space-x-4">
                          <a href="/dashboard" class="text-gray-700 hover:text-kwikr-green">Dashboard</a>
                          <a href="/jobs/my-applications" class="text-gray-700 hover:text-kwikr-green">My Applications</a>
                          <span class="text-gray-500">|</span>
                          <span class="text-gray-700">Welcome, ${user.first_name}</span>
                          <a href="/logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</a>
                      </nav>
                  </div>
              </div>
          </header>

          <!-- Main Content -->
          <main class="max-w-7xl mx-auto py-8 px-4">
              <!-- Header with Search -->
              <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                  <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                      <div>
                          <h1 class="text-3xl font-bold text-gray-800 mb-2">
                              <i class="fas fa-search text-kwikr-green mr-3"></i>
                              Browse Jobs
                          </h1>
                          <p class="text-gray-600">Find jobs that match your skills and availability.</p>
                      </div>
                      <div class="mt-4 lg:mt-0">
                          <span class="bg-kwikr-green text-white px-3 py-1 rounded-full text-sm">
                              ${jobs.results.length} jobs available
                          </span>
                      </div>
                  </div>

                  <!-- Search and Filters -->
                  <form method="GET" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                      <div class="lg:col-span-2">
                          <input type="text" name="search" placeholder="Search jobs..." 
                                 value="${search}"
                                 class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                      </div>
                      
                      <div>
                          <select name="category" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                              <option value="">All Categories</option>
                              ${categories.results.map(cat => `
                                  <option value="${cat.id}" ${category === cat.id.toString() ? 'selected' : ''}>
                                      ${cat.name}
                                  </option>
                              `).join('')}
                          </select>
                      </div>

                      <div>
                          <select name="location" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                              <option value="">All Locations</option>
                              ${provinces.map(prov => `
                                  <option value="${prov.code}" ${location === prov.code ? 'selected' : ''}>
                                      ${prov.name}
                                  </option>
                              `).join('')}
                          </select>
                      </div>

                      <div>
                          <select name="urgency" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent">
                              <option value="">All Urgency</option>
                              <option value="urgent" ${urgency === 'urgent' ? 'selected' : ''}>Urgent</option>
                              <option value="high" ${urgency === 'high' ? 'selected' : ''}>High</option>
                              <option value="normal" ${urgency === 'normal' ? 'selected' : ''}>Normal</option>
                              <option value="low" ${urgency === 'low' ? 'selected' : ''}>Low</option>
                          </select>
                      </div>

                      <div>
                          <button type="submit" class="w-full bg-kwikr-green text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                              <i class="fas fa-search mr-2"></i>Search
                          </button>
                      </div>
                  </form>
              </div>

              <!-- Jobs Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  ${jobs.results.length === 0 ? `
                      <div class="lg:col-span-2 xl:col-span-3 bg-white rounded-lg shadow-md p-8 text-center">
                          <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                          <h3 class="text-xl font-semibold text-gray-600 mb-2">No jobs found</h3>
                          <p class="text-gray-500">Try adjusting your search filters to find more opportunities.</p>
                      </div>
                  ` : jobs.results.map(job => `
                      <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                          <div class="p-6">
                              <!-- Job Header -->
                              <div class="flex items-start justify-between mb-4">
                                  <div class="flex items-center">
                                      <i class="${job.icon_class || 'fas fa-briefcase'} text-2xl text-kwikr-green mr-3"></i>
                                      <div>
                                          <h3 class="font-semibold text-lg text-gray-800 line-clamp-2">${job.title}</h3>
                                          <p class="text-sm text-gray-500">${job.category_name}</p>
                                      </div>
                                  </div>
                                  ${job.match_score === 100 ? `
                                      <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                          Perfect Match
                                      </span>
                                  ` : ''}
                              </div>

                              <!-- Description -->
                              <p class="text-gray-600 text-sm mb-4 line-clamp-3">${job.description}</p>

                              <!-- Details -->
                              <div class="space-y-2 mb-4">
                                  <div class="flex items-center text-sm text-gray-500">
                                      <i class="fas fa-map-marker-alt w-4 mr-2"></i>
                                      <span>${job.location_city}, ${job.location_province}</span>
                                  </div>
                                  
                                  ${job.budget_min || job.budget_max ? `
                                      <div class="flex items-center text-sm text-gray-500">
                                          <i class="fas fa-dollar-sign w-4 mr-2"></i>
                                          <span>
                                              ${job.budget_min && job.budget_max 
                                                ? `$${job.budget_min} - $${job.budget_max}`
                                                : job.budget_min 
                                                ? `From $${job.budget_min}`
                                                : `Up to $${job.budget_max}`}
                                          </span>
                                      </div>
                                  ` : ''}

                                  <div class="flex items-center text-sm text-gray-500">
                                      <i class="fas fa-clock w-4 mr-2"></i>
                                      <span class="capitalize">${job.urgency} priority</span>
                                  </div>

                                  <div class="flex items-center text-sm text-gray-500">
                                      <i class="fas fa-user w-4 mr-2"></i>
                                      <span>Posted by ${job.client_name}</span>
                                  </div>

                                  ${job.bid_count > 0 ? `
                                      <div class="flex items-center text-sm text-gray-500">
                                          <i class="fas fa-users w-4 mr-2"></i>
                                          <span>${job.bid_count} ${job.bid_count === 1 ? 'application' : 'applications'}</span>
                                      </div>
                                  ` : ''}
                              </div>

                              <!-- Posted Time -->
                              <div class="text-xs text-gray-400 mb-4">
                                  Posted ${new Date(job.created_at).toLocaleDateString()}
                              </div>

                              <!-- Actions -->
                              <div class="flex space-x-2">
                                  <a href="/jobs/${job.id}" 
                                     class="flex-1 bg-kwikr-green text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-center">
                                      <i class="fas fa-eye mr-2"></i>View Details
                                  </a>
                                  <a href="/jobs/${job.id}/apply" 
                                     class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                                      <i class="fas fa-paper-plane mr-2"></i>Apply
                                  </a>
                              </div>
                          </div>
                      </div>
                  `).join('')}
              </div>
          </main>

          <style>
              .line-clamp-2 {
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
              }
              .line-clamp-3 {
                  display: -webkit-box;
                  -webkit-line-clamp: 3;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
              }
          </style>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error browsing jobs:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load jobs.</p>
          <a href="/dashboard" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Return to Dashboard</a>
        </div>
      </div>
    `, 500)
  }
})

// ============================================================================
// JOB DETAILS & APPLICATION PROCESS - Workers view job details and apply
// ============================================================================

// View individual job details
jobsRoutes.get('/:id', requireAuth, async (c) => {
  try {
    const db = c.env.DB
    const user = c.get('user')
    const jobId = parseInt(c.req.param('id'))

    if (!jobId) {
      return c.notFound()
    }

    // Get job details with related information
    const job = await db
      .prepare(`
        SELECT 
          j.*,
          jc.name as category_name,
          jc.description as category_description,
          jc.requires_license,
          jc.requires_insurance,
          jc.icon_class,
          u.first_name || ' ' || u.last_name as client_name,
          u.email as client_email,
          up.bio as client_bio,
          COUNT(b.id) as bid_count
        FROM jobs j
        JOIN job_categories jc ON j.category_id = jc.id
        JOIN users u ON j.client_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN bids b ON j.id = b.job_id
        WHERE j.id = ?
        GROUP BY j.id
      `)
      .bind(jobId)
      .first()

    if (!job) {
      return c.notFound()
    }

    // Check if current user has already applied (for workers)
    let userBid = null
    if (user.role === 'worker') {
      userBid = await db
        .prepare('SELECT * FROM bids WHERE job_id = ? AND worker_id = ?')
        .bind(jobId, user.user_id)
        .first()
    }

    // Get recent bids if user is client or job owner
    let recentBids = []
    if (user.role === 'client' && job.client_id === user.user_id) {
      recentBids = await db
        .prepare(`
          SELECT 
            b.*,
            u.first_name || ' ' || u.last_name as worker_name,
            up.bio as worker_bio,
            AVG(r.rating) as worker_rating
          FROM bids b
          JOIN users u ON b.worker_id = u.id
          LEFT JOIN user_profiles up ON u.id = up.user_id
          LEFT JOIN reviews r ON u.id = r.reviewee_id
          WHERE b.job_id = ?
          GROUP BY b.id
          ORDER BY b.submitted_at DESC
          LIMIT 10
        `)
        .bind(jobId)
        .all()
    }

    const urgencyColors = {
      'urgent': 'bg-red-100 text-red-800',
      'high': 'bg-orange-100 text-orange-800',
      'normal': 'bg-blue-100 text-blue-800',
      'low': 'bg-gray-100 text-gray-800'
    }

    const statusColors = {
      'posted': 'bg-green-100 text-green-800',
      'assigned': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'disputed': 'bg-purple-100 text-purple-800'
    }

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${job.title} - getKwikr</title>
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
          <!-- Header -->
          <header class="bg-white shadow-sm border-b">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-4">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green">Kwikr</a>
                      </div>
                      <nav class="flex items-center space-x-4">
                          <a href="/dashboard" class="text-gray-700 hover:text-kwikr-green">Dashboard</a>
                          ${user.role === 'worker' ? `
                              <a href="/jobs/browse" class="text-gray-700 hover:text-kwikr-green">Browse Jobs</a>
                          ` : `
                              <a href="/jobs/post" class="text-gray-700 hover:text-kwikr-green">Post Job</a>
                          `}
                          <span class="text-gray-500">|</span>
                          <span class="text-gray-700">Welcome, ${user.first_name}</span>
                          <a href="/logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</a>
                      </nav>
                  </div>
              </div>
          </header>

          <!-- Main Content -->
          <main class="max-w-6xl mx-auto py-8 px-4">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <!-- Main Content -->
                  <div class="lg:col-span-2">
                      <!-- Job Header -->
                      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                          <div class="flex items-start justify-between mb-4">
                              <div class="flex items-center">
                                  <i class="${job.icon_class || 'fas fa-briefcase'} text-3xl text-kwikr-green mr-4"></i>
                                  <div>
                                      <h1 class="text-2xl font-bold text-gray-800">${job.title}</h1>
                                      <p class="text-lg text-gray-600">${job.category_name}</p>
                                  </div>
                              </div>
                              <div class="flex flex-col items-end space-y-2">
                                  <span class="px-3 py-1 rounded-full text-sm font-medium ${urgencyColors[job.urgency] || urgencyColors['normal']}">
                                      ${job.urgency} priority
                                  </span>
                                  <span class="px-3 py-1 rounded-full text-sm font-medium ${statusColors[job.status] || statusColors['posted']}">
                                      ${job.status.replace('_', ' ')}
                                  </span>
                              </div>
                          </div>

                          <!-- Job Meta -->
                          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm text-gray-600">
                              <div class="flex items-center">
                                  <i class="fas fa-map-marker-alt w-4 mr-2 text-kwikr-green"></i>
                                  <span>${job.location_city}, ${job.location_province}</span>
                              </div>
                              <div class="flex items-center">
                                  <i class="fas fa-calendar w-4 mr-2 text-kwikr-green"></i>
                                  <span>Posted ${new Date(job.created_at).toLocaleDateString()}</span>
                              </div>
                              <div class="flex items-center">
                                  <i class="fas fa-users w-4 mr-2 text-kwikr-green"></i>
                                  <span>${job.bid_count} ${job.bid_count === 1 ? 'application' : 'applications'}</span>
                              </div>
                          </div>

                          ${job.budget_min || job.budget_max ? `
                              <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                  <div class="flex items-center">
                                      <i class="fas fa-dollar-sign text-green-600 mr-2"></i>
                                      <span class="font-semibold text-green-800">Budget: </span>
                                      <span class="text-green-700 ml-2">
                                          ${job.budget_min && job.budget_max 
                                            ? `$${job.budget_min} - $${job.budget_max}`
                                            : job.budget_min 
                                            ? `From $${job.budget_min}`
                                            : `Up to $${job.budget_max}`}
                                      </span>
                                  </div>
                              </div>
                          ` : ''}

                          <!-- Requirements -->
                          ${job.requires_license || job.requires_insurance ? `
                              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                  <h3 class="font-semibold text-yellow-800 mb-2">Requirements</h3>
                                  <div class="space-y-1 text-sm text-yellow-700">
                                      ${job.requires_license ? `
                                          <div class="flex items-center">
                                              <i class="fas fa-certificate w-4 mr-2"></i>
                                              <span>Valid license required</span>
                                          </div>
                                      ` : ''}
                                      ${job.requires_insurance ? `
                                          <div class="flex items-center">
                                              <i class="fas fa-shield-alt w-4 mr-2"></i>
                                              <span>Insurance coverage required</span>
                                          </div>
                                      ` : ''}
                                  </div>
                              </div>
                          ` : ''}
                      </div>

                      <!-- Job Description -->
                      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                          <h2 class="text-xl font-bold text-gray-800 mb-4">Job Description</h2>
                          <div class="prose max-w-none">
                              ${job.description.split('\n').map(para => `<p class="mb-3 text-gray-700">${para}</p>`).join('')}
                          </div>
                      </div>

                      <!-- Timeline -->
                      ${job.start_date || job.expected_completion ? `
                          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                              <h2 class="text-xl font-bold text-gray-800 mb-4">Timeline</h2>
                              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  ${job.start_date ? `
                                      <div>
                                          <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Start Date</label>
                                          <p class="text-gray-900">${new Date(job.start_date).toLocaleDateString()}</p>
                                      </div>
                                  ` : ''}
                                  ${job.expected_completion ? `
                                      <div>
                                          <label class="block text-sm font-medium text-gray-700 mb-1">Expected Completion</label>
                                          <p class="text-gray-900">${new Date(job.expected_completion).toLocaleDateString()}</p>
                                      </div>
                                  ` : ''}
                              </div>
                          </div>
                      ` : ''}

                      <!-- Client's Recent Applications (if job owner) -->
                      ${user.role === 'client' && job.client_id === user.user_id && recentBids.results.length > 0 ? `
                          <div class="bg-white rounded-lg shadow-md p-6">
                              <h2 class="text-xl font-bold text-gray-800 mb-4">Applications Received</h2>
                              <div class="space-y-4">
                                  ${recentBids.results.map(bid => `
                                      <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                          <div class="flex justify-between items-start mb-3">
                                              <div>
                                                  <h4 class="font-semibold text-gray-800">${bid.worker_name}</h4>
                                                  ${bid.worker_rating ? `
                                                      <div class="flex items-center text-sm text-gray-600">
                                                          <div class="flex text-yellow-400 mr-1">
                                                              ${Array(5).fill().map((_, i) => `
                                                                  <i class="fas fa-star ${i < Math.floor(bid.worker_rating) ? '' : 'text-gray-300'}"></i>
                                                              `).join('')}
                                                          </div>
                                                          <span>(${bid.worker_rating.toFixed(1)})</span>
                                                      </div>
                                                  ` : ''}
                                              </div>
                                              <div class="text-right">
                                                  <div class="text-lg font-bold text-green-600">$${bid.bid_amount}</div>
                                                  <div class="text-sm text-gray-500">${new Date(bid.submitted_at).toLocaleDateString()}</div>
                                              </div>
                                          </div>
                                          
                                          ${bid.cover_message ? `
                                              <p class="text-gray-600 text-sm mb-3">${bid.cover_message}</p>
                                          ` : ''}
                                          
                                          ${bid.estimated_timeline ? `
                                              <div class="text-sm text-gray-600 mb-3">
                                                  <i class="fas fa-clock mr-1"></i>
                                                  <strong>Timeline:</strong> ${bid.estimated_timeline}
                                              </div>
                                          ` : ''}

                                          ${bid.status === 'pending' ? `
                                              <div class="flex space-x-2">
                                                  <button onclick="respondToBid(${bid.id}, 'accepted')" 
                                                          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm">
                                                      Accept
                                                  </button>
                                                  <button onclick="respondToBid(${bid.id}, 'rejected')" 
                                                          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">
                                                      Decline
                                                  </button>
                                              </div>
                                          ` : `
                                              <span class="inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                                bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                                bid.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                                'bg-gray-100 text-gray-800'
                                              }">
                                                  ${bid.status}
                                              </span>
                                          `}
                                      </div>
                                  `).join('')}
                              </div>
                          </div>
                      ` : ''}
                  </div>

                  <!-- Sidebar -->
                  <div class="lg:col-span-1">
                      <!-- Client Info -->
                      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                          <h3 class="text-lg font-bold text-gray-800 mb-4">Posted by</h3>
                          <div class="text-center">
                              <div class="w-16 h-16 bg-kwikr-green rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                                  ${job.client_name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <h4 class="font-semibold text-gray-800">${job.client_name}</h4>
                              ${job.client_bio ? `
                                  <p class="text-sm text-gray-600 mt-2">${job.client_bio}</p>
                              ` : ''}
                          </div>
                      </div>

                      <!-- Actions -->
                      ${user.role === 'worker' && job.status === 'posted' ? `
                          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                              <h3 class="text-lg font-bold text-gray-800 mb-4">Actions</h3>
                              ${userBid ? `
                                  <div class="text-center">
                                      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                          <i class="fas fa-check-circle text-blue-600 text-2xl mb-2"></i>
                                          <p class="text-blue-800 font-semibold">Application Submitted</p>
                                          <p class="text-blue-600 text-sm">Your bid: $${userBid.bid_amount}</p>
                                          <p class="text-blue-600 text-sm">Status: ${userBid.status}</p>
                                      </div>
                                      <a href="/jobs/${job.id}/edit-application" 
                                         class="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                                          <i class="fas fa-edit mr-2"></i>Edit Application
                                      </a>
                                  </div>
                              ` : `
                                  <a href="/jobs/${job.id}/apply" 
                                     class="w-full bg-kwikr-green text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors block text-center">
                                      <i class="fas fa-paper-plane mr-2"></i>Apply for this Job
                                  </a>
                              `}
                          </div>
                      ` : user.role === 'client' && job.client_id === user.user_id ? `
                          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                              <h3 class="text-lg font-bold text-gray-800 mb-4">Manage Job</h3>
                              <div class="space-y-2">
                                  <a href="/jobs/${job.id}/edit" 
                                     class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors block text-center">
                                      <i class="fas fa-edit mr-2"></i>Edit Job
                                  </a>
                                  ${job.status === 'posted' ? `
                                      <button onclick="cancelJob(${job.id})" 
                                              class="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                                          <i class="fas fa-times mr-2"></i>Cancel Job
                                      </button>
                                  ` : ''}
                              </div>
                          </div>
                      ` : ''}

                      <!-- Job Stats -->
                      <div class="bg-white rounded-lg shadow-md p-6">
                          <h3 class="text-lg font-bold text-gray-800 mb-4">Job Details</h3>
                          <div class="space-y-3 text-sm">
                              <div class="flex justify-between">
                                  <span class="text-gray-600">Job ID:</span>
                                  <span class="font-medium">#${job.id}</span>
                              </div>
                              <div class="flex justify-between">
                                  <span class="text-gray-600">Category:</span>
                                  <span class="font-medium">${job.category_name}</span>
                              </div>
                              <div class="flex justify-between">
                                  <span class="text-gray-600">Location:</span>
                                  <span class="font-medium">${job.location_city}, ${job.location_province}</span>
                              </div>
                              <div class="flex justify-between">
                                  <span class="text-gray-600">Status:</span>
                                  <span class="font-medium capitalize">${job.status.replace('_', ' ')}</span>
                              </div>
                              <div class="flex justify-between">
                                  <span class="text-gray-600">Applications:</span>
                                  <span class="font-medium">${job.bid_count}</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </main>

          <script>
              async function respondToBid(bidId, response) {
                  if (!confirm(\`Are you sure you want to \${response} this application?\`)) {
                      return;
                  }

                  try {
                      const res = await fetch(\`/jobs/bids/\${bidId}/respond\`, {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ response })
                      });

                      if (res.ok) {
                          location.reload();
                      } else {
                          alert('Failed to respond to application');
                      }
                  } catch (error) {
                      alert('Error responding to application');
                  }
              }

              async function cancelJob(jobId) {
                  if (!confirm('Are you sure you want to cancel this job?')) {
                      return;
                  }

                  try {
                      const res = await fetch(\`/jobs/\${jobId}/cancel\`, {
                          method: 'POST'
                      });

                      if (res.ok) {
                          location.reload();
                      } else {
                          alert('Failed to cancel job');
                      }
                  } catch (error) {
                      alert('Error cancelling job');
                  }
              }
          </script>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading job details:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load job details.</p>
          <a href="/jobs/browse" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Browse Jobs</a>
        </div>
      </div>
    `, 500)
  }
})

// Job application form
jobsRoutes.get('/:id/apply', requireAuth, requireWorker, async (c) => {
  try {
    const db = c.env.DB
    const user = c.get('user')
    const jobId = parseInt(c.req.param('id'))

    if (!jobId) {
      return c.notFound()
    }

    // Get job details
    const job = await db
      .prepare(`
        SELECT 
          j.*,
          jc.name as category_name,
          jc.icon_class,
          u.first_name || ' ' || u.last_name as client_name
        FROM jobs j
        JOIN job_categories jc ON j.category_id = jc.id
        JOIN users u ON j.client_id = u.id
        WHERE j.id = ? AND j.status = 'posted'
      `)
      .bind(jobId)
      .first()

    if (!job) {
      return c.html(`
        <div class="min-h-screen bg-gray-100 flex items-center justify-center">
          <div class="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 class="text-2xl font-bold text-red-600 mb-4">Job Not Available</h2>
            <p class="text-gray-600 mb-4">This job is no longer available for applications.</p>
            <a href="/jobs/browse" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Browse Other Jobs</a>
          </div>
        </div>
      `, 404)
    }

    // Check if user already applied
    const existingBid = await db
      .prepare('SELECT * FROM bids WHERE job_id = ? AND worker_id = ?')
      .bind(jobId, user.user_id)
      .first()

    if (existingBid) {
      return c.redirect(`/jobs/${jobId}`)
    }

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Apply for ${job.title} - getKwikr</title>
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
          <!-- Header -->
          <header class="bg-white shadow-sm border-b">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-4">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green">Kwikr</a>
                      </div>
                      <nav class="flex items-center space-x-4">
                          <a href="/dashboard" class="text-gray-700 hover:text-kwikr-green">Dashboard</a>
                          <a href="/jobs/browse" class="text-gray-700 hover:text-kwikr-green">Browse Jobs</a>
                          <span class="text-gray-500">|</span>
                          <span class="text-gray-700">Welcome, ${user.first_name}</span>
                          <a href="/logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</a>
                      </nav>
                  </div>
              </div>
          </header>

          <!-- Main Content -->
          <main class="max-w-4xl mx-auto py-8 px-4">
              <!-- Job Summary -->
              <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                  <div class="flex items-center mb-4">
                      <i class="${job.icon_class || 'fas fa-briefcase'} text-2xl text-kwikr-green mr-3"></i>
                      <div>
                          <h1 class="text-2xl font-bold text-gray-800">${job.title}</h1>
                          <p class="text-gray-600">${job.category_name} • Posted by ${job.client_name}</p>
                      </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div class="flex items-center">
                          <i class="fas fa-map-marker-alt w-4 mr-2"></i>
                          <span>${job.location_city}, ${job.location_province}</span>
                      </div>
                      ${job.budget_min || job.budget_max ? `
                          <div class="flex items-center">
                              <i class="fas fa-dollar-sign w-4 mr-2"></i>
                              <span>
                                  ${job.budget_min && job.budget_max 
                                    ? `$${job.budget_min} - $${job.budget_max}`
                                    : job.budget_min 
                                    ? `From $${job.budget_min}`
                                    : `Up to $${job.budget_max}`}
                              </span>
                          </div>
                      ` : ''}
                      <div class="flex items-center">
                          <i class="fas fa-clock w-4 mr-2"></i>
                          <span class="capitalize">${job.urgency} priority</span>
                      </div>
                  </div>
              </div>

              <!-- Application Form -->
              <div class="bg-white rounded-lg shadow-md p-8">
                  <div class="mb-8">
                      <h2 class="text-3xl font-bold text-gray-800 mb-2">
                          <i class="fas fa-paper-plane text-kwikr-green mr-3"></i>
                          Submit Your Application
                      </h2>
                      <p class="text-gray-600">Provide your bid and details to apply for this job.</p>
                  </div>

                  <form action="/jobs/${jobId}/apply" method="POST" class="space-y-6">
                      <!-- Bid Amount -->
                      <div>
                          <label for="bid_amount" class="block text-sm font-medium text-gray-700 mb-2">
                              Your Bid Amount ($CAD) *
                          </label>
                          <div class="relative">
                              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span class="text-gray-500 sm:text-sm">$</span>
                              </div>
                              <input type="number" id="bid_amount" name="bid_amount" required min="1" step="0.01"
                                     class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent"
                                     placeholder="0.00">
                          </div>
                          <p class="mt-1 text-sm text-gray-500">
                              Enter your proposed price for completing this job.
                              ${job.budget_min && job.budget_max 
                                ? `Client's budget range: $${job.budget_min} - $${job.budget_max}`
                                : job.budget_min 
                                ? `Client's minimum budget: $${job.budget_min}`
                                : job.budget_max
                                ? `Client's maximum budget: $${job.budget_max}`
                                : ''}
                          </p>
                      </div>

                      <!-- Cover Message -->
                      <div>
                          <label for="cover_message" class="block text-sm font-medium text-gray-700 mb-2">
                              Cover Message *
                          </label>
                          <textarea id="cover_message" name="cover_message" required rows="6"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent"
                                    placeholder="Introduce yourself and explain why you're the right fit for this job. Include your experience, approach to the work, and any relevant qualifications..."></textarea>
                          <p class="mt-1 text-sm text-gray-500">
                              This is your chance to make a great first impression. Be specific about your experience and approach.
                          </p>
                      </div>

                      <!-- Estimated Timeline -->
                      <div>
                          <label for="estimated_timeline" class="block text-sm font-medium text-gray-700 mb-2">
                              Estimated Timeline
                          </label>
                          <input type="text" id="estimated_timeline" name="estimated_timeline"
                                 class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent"
                                 placeholder="e.g., 2-3 days, 1 week, Same day service available">
                          <p class="mt-1 text-sm text-gray-500">
                              Let the client know how long you expect the job to take.
                          </p>
                      </div>

                      <!-- Additional Information -->
                      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 class="font-semibold text-blue-800 mb-2">
                              <i class="fas fa-info-circle mr-2"></i>
                              Application Tips
                          </h3>
                          <ul class="text-sm text-blue-700 space-y-1">
                              <li>• Be competitive but fair with your pricing</li>
                              <li>• Highlight your relevant experience and qualifications</li>
                              <li>• Provide a realistic timeline for completion</li>
                              <li>• Ask questions if you need clarification</li>
                              <li>• Respond promptly to client messages</li>
                          </ul>
                      </div>

                      <!-- Submit Button -->
                      <div class="flex justify-end space-x-4 pt-6">
                          <a href="/jobs/${jobId}" class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
                              Cancel
                          </a>
                          <button type="submit" class="px-8 py-3 bg-kwikr-green text-white rounded-lg hover:bg-green-600 transition-colors">
                              <i class="fas fa-paper-plane mr-2"></i>
                              Submit Application
                          </button>
                      </div>
                  </form>
              </div>
          </main>

          <script>
              // Budget validation
              ${job.budget_max ? `
                  document.getElementById('bid_amount').addEventListener('input', function() {
                      const bidAmount = parseFloat(this.value);
                      const maxBudget = ${job.budget_max};
                      
                      if (bidAmount > maxBudget * 1.5) {
                          this.setCustomValidity('Your bid is significantly higher than the client\\'s budget. Consider adjusting.');
                      } else {
                          this.setCustomValidity('');
                      }
                  });
              ` : ''}
          </script>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading application form:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load application form.</p>
          <a href="/jobs/browse" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Browse Jobs</a>
        </div>
      </div>
    `, 500)
  }
})

// Handle job application submission
jobsRoutes.post('/:id/apply', requireAuth, requireWorker, async (c) => {
  try {
    const db = c.env.DB
    const user = c.get('user')
    const jobId = parseInt(c.req.param('id'))
    const formData = await c.req.formData()

    if (!jobId) {
      return c.notFound()
    }

    // Validate job exists and is available
    const job = await db
      .prepare('SELECT * FROM jobs WHERE id = ? AND status = ?')
      .bind(jobId, 'posted')
      .first()

    if (!job) {
      throw new Error('Job is not available for applications')
    }

    // Check if user already applied
    const existingBid = await db
      .prepare('SELECT * FROM bids WHERE job_id = ? AND worker_id = ?')
      .bind(jobId, user.user_id)
      .first()

    if (existingBid) {
      throw new Error('You have already applied for this job')
    }

    // Validate form data
    const bid_amount = parseFloat(formData.get('bid_amount')?.toString() || '0')
    const cover_message = formData.get('cover_message')?.toString()
    const estimated_timeline = formData.get('estimated_timeline')?.toString() || null

    if (!bid_amount || bid_amount <= 0) {
      throw new Error('Please enter a valid bid amount')
    }

    if (!cover_message || cover_message.trim().length < 10) {
      throw new Error('Please provide a detailed cover message')
    }

    // Insert the bid
    const result = await db
      .prepare(`
        INSERT INTO bids (
          job_id, worker_id, bid_amount, cover_message, estimated_timeline, 
          status, submitted_at
        ) VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))
      `)
      .bind(jobId, user.user_id, bid_amount, cover_message.trim(), estimated_timeline)
      .run()

    if (!result.success) {
      throw new Error('Failed to submit application')
    }

    // Create notification for job owner
    await db
      .prepare(`
        INSERT INTO notifications (
          user_id, type, title, message, related_entity_type, related_entity_id, created_at
        ) VALUES (?, 'new_bid', ?, ?, 'job', ?, datetime('now'))
      `)
      .bind(
        job.client_id,
        'New Job Application',
        `${user.first_name} ${user.last_name} applied for "${job.title}"`,
        jobId
      )
      .run()

    // Redirect to job details with success message
    return c.redirect(`/jobs/${jobId}?applied=1`)

  } catch (error) {
    console.error('Error submitting job application:', error)
    
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Application Failed</h2>
          <p class="text-gray-600 mb-4">${error instanceof Error ? error.message : 'Failed to submit application'}</p>
          <a href="/jobs/${c.req.param('id')}/apply" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">Try Again</a>
          <a href="/jobs/${c.req.param('id')}" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Back to Job</a>
        </div>
      </div>
    `, 500)
  }
})

// ============================================================================
// JOB STATUS TRACKING & BID MANAGEMENT
// ============================================================================

// Respond to job application (accept/reject bid)
jobsRoutes.post('/bids/:bidId/respond', requireAuth, requireClient, async (c) => {
  try {
    const db = c.env.DB
    const user = c.get('user')
    const bidId = parseInt(c.req.param('bidId'))
    const { response } = await c.req.json()

    if (!bidId || !['accepted', 'rejected'].includes(response)) {
      return c.json({ error: 'Invalid request' }, 400)
    }

    // Get bid details and verify ownership
    const bid = await db
      .prepare(`
        SELECT b.*, j.client_id, j.title, j.id as job_id
        FROM bids b
        JOIN jobs j ON b.job_id = j.id
        WHERE b.id = ? AND j.client_id = ? AND b.status = 'pending'
      `)
      .bind(bidId, user.user_id)
      .first()

    if (!bid) {
      return c.json({ error: 'Bid not found or access denied' }, 404)
    }

    if (response === 'accepted') {
      // Accept the bid - update job status and assign worker
      await db.batch([
        db.prepare('UPDATE bids SET status = ?, responded_at = datetime("now") WHERE id = ?')
          .bind('accepted', bidId),
        
        db.prepare('UPDATE jobs SET status = ?, assigned_worker_id = ?, updated_at = datetime("now") WHERE id = ?')
          .bind('assigned', bid.worker_id, bid.job_id),
        
        // Reject all other pending bids for this job
        db.prepare('UPDATE bids SET status = ?, responded_at = datetime("now") WHERE job_id = ? AND id != ? AND status = "pending"')
          .bind('rejected', bid.job_id, bidId),
        
        // Create notification for accepted worker
        db.prepare(`
          INSERT INTO notifications (
            user_id, type, title, message, related_entity_type, related_entity_id, created_at
          ) VALUES (?, 'bid_accepted', ?, ?, 'job', ?, datetime('now'))
        `).bind(
          bid.worker_id,
          'Application Accepted!',
          `Your application for "${bid.title}" has been accepted.`,
          bid.job_id
        )
      ])
    } else {
      // Reject the bid
      await db.batch([
        db.prepare('UPDATE bids SET status = ?, responded_at = datetime("now") WHERE id = ?')
          .bind('rejected', bidId),
        
        // Create notification for rejected worker
        db.prepare(`
          INSERT INTO notifications (
            user_id, type, title, message, related_entity_type, related_entity_id, created_at
          ) VALUES (?, 'bid_rejected', ?, ?, 'job', ?, datetime('now'))
        `).bind(
          bid.worker_id,
          'Application Status Update',
          `Your application for "${bid.title}" was not selected this time.`,
          bid.job_id
        )
      ])
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error responding to bid:', error)
    return c.json({ error: 'Failed to respond to application' }, 500)
  }
})

// Update job status (in_progress, completed, cancelled)
jobsRoutes.post('/:id/status', requireAuth, async (c) => {
  try {
    const db = c.env.DB
    const user = c.get('user')
    const jobId = parseInt(c.req.param('id'))
    const { status, completion_notes } = await c.req.json()

    if (!jobId) {
      return c.json({ error: 'Invalid job ID' }, 400)
    }

    const validStatuses = ['in_progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return c.json({ error: 'Invalid status' }, 400)
    }

    // Get job and verify permissions
    const job = await db
      .prepare('SELECT * FROM jobs WHERE id = ?')
      .bind(jobId)
      .first()

    if (!job) {
      return c.json({ error: 'Job not found' }, 404)
    }

    // Check permissions based on role and status
    const canUpdate = 
      (user.role === 'client' && job.client_id === user.user_id) ||
      (user.role === 'worker' && job.assigned_worker_id === user.user_id)

    if (!canUpdate) {
      return c.json({ error: 'Access denied' }, 403)
    }

    // Validate status transition
    const validTransitions = {
      'assigned': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'posted': ['cancelled']
    }

    if (!validTransitions[job.status]?.includes(status)) {
      return c.json({ error: 'Invalid status transition' }, 400)
    }

    // Update job status
    const updates = { status, updated_at: 'datetime("now")' }
    if (status === 'completed') {
      updates.actual_completion = 'datetime("now")'
    }

    const updateQuery = `
      UPDATE jobs SET 
        status = ?, 
        updated_at = datetime('now')
        ${status === 'completed' ? ', actual_completion = datetime("now")' : ''}
      WHERE id = ?
    `

    await db.prepare(updateQuery).bind(status, jobId).run()

    // Create notifications
    const notificationTitle = {
      'in_progress': 'Job Started',
      'completed': 'Job Completed',
      'cancelled': 'Job Cancelled'
    }[status]

    const notificationMessage = {
      'in_progress': `Work has started on "${job.title}".`,
      'completed': `"${job.title}" has been completed.${completion_notes ? ' Notes: ' + completion_notes : ''}`,
      'cancelled': `"${job.title}" has been cancelled.`
    }[status]

    // Notify the other party
    const notifyUserId = user.role === 'client' ? job.assigned_worker_id : job.client_id
    if (notifyUserId) {
      await db
        .prepare(`
          INSERT INTO notifications (
            user_id, type, title, message, related_entity_type, related_entity_id, created_at
          ) VALUES (?, ?, ?, ?, 'job', ?, datetime('now'))
        `)
        .bind(notifyUserId, `job_${status}`, notificationTitle, notificationMessage, jobId)
        .run()
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error updating job status:', error)
    return c.json({ error: 'Failed to update job status' }, 500)
  }
})

// Cancel job (client only)
jobsRoutes.post('/:id/cancel', requireAuth, requireClient, async (c) => {
  try {
    const db = c.env.DB
    const user = c.get('user')
    const jobId = parseInt(c.req.param('id'))

    if (!jobId) {
      return c.json({ error: 'Invalid job ID' }, 400)
    }

    // Get job and verify ownership
    const job = await db
      .prepare('SELECT * FROM jobs WHERE id = ? AND client_id = ?')
      .bind(jobId, user.user_id)
      .first()

    if (!job) {
      return c.json({ error: 'Job not found or access denied' }, 404)
    }

    if (!['posted', 'assigned'].includes(job.status)) {
      return c.json({ error: 'Job cannot be cancelled in current status' }, 400)
    }

    // Update job status to cancelled
    await db
      .prepare('UPDATE jobs SET status = ?, updated_at = datetime("now") WHERE id = ?')
      .bind('cancelled', jobId)
      .run()

    // Reject all pending bids
    await db
      .prepare('UPDATE bids SET status = ?, responded_at = datetime("now") WHERE job_id = ? AND status = "pending"')
      .bind('rejected', jobId)
      .run()

    // Notify assigned worker if any
    if (job.assigned_worker_id) {
      await db
        .prepare(`
          INSERT INTO notifications (
            user_id, type, title, message, related_entity_type, related_entity_id, created_at
          ) VALUES (?, 'job_cancelled', ?, ?, 'job', ?, datetime('now'))
        `)
        .bind(
          job.assigned_worker_id,
          'Job Cancelled',
          `The job "${job.title}" has been cancelled by the client.`,
          jobId
        )
        .run()
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error cancelling job:', error)
    return c.json({ error: 'Failed to cancel job' }, 500)
  }
})

// ============================================================================
// JOB HISTORY - Past jobs for clients and workers
// ============================================================================

// Worker's job applications history
jobsRoutes.get('/my-applications', requireAuth, requireWorker, async (c) => {
  try {
    const db = c.env.DB
    const user = c.get('user')
    
    const status = c.req.query('status') || ''
    
    let whereClause = 'WHERE b.worker_id = ?'
    const params = [user.user_id]
    
    if (status) {
      whereClause += ' AND b.status = ?'
      params.push(status)
    }

    // Get worker's job applications
    const applications = await db
      .prepare(`
        SELECT 
          b.*,
          j.title,
          j.description,
          j.status as job_status,
          j.location_city,
          j.location_province,
          j.budget_min,
          j.budget_max,
          jc.name as category_name,
          jc.icon_class,
          u.first_name || ' ' || u.last_name as client_name
        FROM bids b
        JOIN jobs j ON b.job_id = j.id
        JOIN job_categories jc ON j.category_id = jc.id
        JOIN users u ON j.client_id = u.id
        ${whereClause}
        ORDER BY b.submitted_at DESC
      `)
      .bind(...params)
      .all()

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>My Applications - getKwikr</title>
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
          <!-- Header -->
          <header class="bg-white shadow-sm border-b">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-4">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green">Kwikr</a>
                      </div>
                      <nav class="flex items-center space-x-4">
                          <a href="/dashboard" class="text-gray-700 hover:text-kwikr-green">Dashboard</a>
                          <a href="/jobs/browse" class="text-gray-700 hover:text-kwikr-green">Browse Jobs</a>
                          <span class="text-gray-500">|</span>
                          <span class="text-gray-700">Welcome, ${user.first_name}</span>
                          <a href="/logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</a>
                      </nav>
                  </div>
              </div>
          </header>

          <!-- Main Content -->
          <main class="max-w-6xl mx-auto py-8 px-4">
              <!-- Header -->
              <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                  <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                      <div>
                          <h1 class="text-3xl font-bold text-gray-800 mb-2">
                              <i class="fas fa-file-alt text-kwikr-green mr-3"></i>
                              My Job Applications
                          </h1>
                          <p class="text-gray-600">Track the status of your job applications and manage your work.</p>
                      </div>
                      <div class="mt-4 lg:mt-0">
                          <span class="bg-kwikr-green text-white px-3 py-1 rounded-full text-sm">
                              ${applications.results.length} applications
                          </span>
                      </div>
                  </div>

                  <!-- Status Filter -->
                  <div class="flex flex-wrap gap-2">
                      <a href="/jobs/my-applications" 
                         class="px-4 py-2 rounded-full text-sm ${status === '' ? 'bg-kwikr-green text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                          All Applications
                      </a>
                      <a href="/jobs/my-applications?status=pending" 
                         class="px-4 py-2 rounded-full text-sm ${status === 'pending' ? 'bg-kwikr-green text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                          Pending
                      </a>
                      <a href="/jobs/my-applications?status=accepted" 
                         class="px-4 py-2 rounded-full text-sm ${status === 'accepted' ? 'bg-kwikr-green text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                          Accepted
                      </a>
                      <a href="/jobs/my-applications?status=rejected" 
                         class="px-4 py-2 rounded-full text-sm ${status === 'rejected' ? 'bg-kwikr-green text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                          Rejected
                      </a>
                  </div>
              </div>

              <!-- Applications List -->
              <div class="space-y-6">
                  ${applications.results.length === 0 ? `
                      <div class="bg-white rounded-lg shadow-md p-8 text-center">
                          <i class="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
                          <h3 class="text-xl font-semibold text-gray-600 mb-2">No applications found</h3>
                          <p class="text-gray-500 mb-4">You haven't applied for any jobs yet.</p>
                          <a href="/jobs/browse" class="bg-kwikr-green text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
                              <i class="fas fa-search mr-2"></i>Browse Available Jobs
                          </a>
                      </div>
                  ` : applications.results.map(app => {
                      const bidStatusColors = {
                          'pending': 'bg-yellow-100 text-yellow-800',
                          'accepted': 'bg-green-100 text-green-800',
                          'rejected': 'bg-red-100 text-red-800',
                          'withdrawn': 'bg-gray-100 text-gray-800'
                      }

                      const jobStatusColors = {
                          'posted': 'bg-blue-100 text-blue-800',
                          'assigned': 'bg-purple-100 text-purple-800',
                          'in_progress': 'bg-orange-100 text-orange-800',
                          'completed': 'bg-green-100 text-green-800',
                          'cancelled': 'bg-red-100 text-red-800',
                          'disputed': 'bg-purple-100 text-purple-800'
                      }

                      return `
                          <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                              <div class="p-6">
                                  <!-- Header -->
                                  <div class="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
                                      <div class="flex items-center mb-4 lg:mb-0">
                                          <i class="${app.icon_class || 'fas fa-briefcase'} text-2xl text-kwikr-green mr-3"></i>
                                          <div>
                                              <h3 class="font-semibold text-lg text-gray-800">${app.title}</h3>
                                              <p class="text-sm text-gray-600">${app.category_name} • ${app.client_name}</p>
                                              <p class="text-sm text-gray-500">${app.location_city}, ${app.location_province}</p>
                                          </div>
                                      </div>
                                      <div class="flex flex-col items-end space-y-2">
                                          <span class="px-3 py-1 rounded-full text-sm font-medium ${bidStatusColors[app.status] || bidStatusColors['pending']}">
                                              Application ${app.status}
                                          </span>
                                          <span class="px-3 py-1 rounded-full text-sm font-medium ${jobStatusColors[app.job_status] || jobStatusColors['posted']}">
                                              Job ${app.job_status.replace('_', ' ')}
                                          </span>
                                      </div>
                                  </div>

                                  <!-- Application Details -->
                                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                      <div>
                                          <label class="block text-sm font-medium text-gray-700">Your Bid</label>
                                          <p class="text-lg font-bold text-green-600">$${app.bid_amount}</p>
                                      </div>
                                      <div>
                                          <label class="block text-sm font-medium text-gray-700">Applied</label>
                                          <p class="text-gray-900">${new Date(app.submitted_at).toLocaleDateString()}</p>
                                      </div>
                                      <div>
                                          <label class="block text-sm font-medium text-gray-700">Client Budget</label>
                                          <p class="text-gray-900">
                                              ${app.budget_min && app.budget_max 
                                                ? `$${app.budget_min} - $${app.budget_max}`
                                                : app.budget_min 
                                                ? `From $${app.budget_min}`
                                                : app.budget_max
                                                ? `Up to $${app.budget_max}`
                                                : 'Not specified'}
                                          </p>
                                      </div>
                                  </div>

                                  <!-- Cover Message -->
                                  ${app.cover_message ? `
                                      <div class="mb-4">
                                          <label class="block text-sm font-medium text-gray-700 mb-1">Your Cover Message</label>
                                          <p class="text-gray-600 text-sm line-clamp-2">${app.cover_message}</p>
                                      </div>
                                  ` : ''}

                                  <!-- Timeline -->
                                  ${app.estimated_timeline ? `
                                      <div class="mb-4">
                                          <label class="block text-sm font-medium text-gray-700 mb-1">Your Estimated Timeline</label>
                                          <p class="text-gray-600 text-sm">${app.estimated_timeline}</p>
                                      </div>
                                  ` : ''}

                                  <!-- Actions -->
                                  <div class="flex space-x-2 pt-4 border-t">
                                      <a href="/jobs/${app.job_id}" 
                                         class="bg-kwikr-green text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm">
                                          <i class="fas fa-eye mr-2"></i>View Job
                                      </a>
                                      
                                      ${app.status === 'accepted' && app.job_status === 'assigned' ? `
                                          <button onclick="updateJobStatus(${app.job_id}, 'in_progress')" 
                                                  class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                                              <i class="fas fa-play mr-2"></i>Start Work
                                          </button>
                                      ` : ''}
                                      
                                      ${app.status === 'accepted' && app.job_status === 'in_progress' ? `
                                          <button onclick="updateJobStatus(${app.job_id}, 'completed')" 
                                                  class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm">
                                              <i class="fas fa-check mr-2"></i>Mark Complete
                                          </button>
                                      ` : ''}
                                  </div>
                              </div>
                          </div>
                      `
                  }).join('')}
              </div>
          </main>

          <script>
              async function updateJobStatus(jobId, status) {
                  const confirmMessages = {
                      'in_progress': 'Mark this job as started?',
                      'completed': 'Mark this job as completed?'
                  };

                  if (!confirm(confirmMessages[status])) {
                      return;
                  }

                  try {
                      const res = await fetch(\`/jobs/\${jobId}/status\`, {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ status })
                      });

                      if (res.ok) {
                          location.reload();
                      } else {
                          alert('Failed to update job status');
                      }
                  } catch (error) {
                      alert('Error updating job status');
                  }
              }
          </script>

          <style>
              .line-clamp-2 {
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
              }
          </style>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading job applications:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load your applications.</p>
          <a href="/dashboard" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Return to Dashboard</a>
        </div>
      </div>
    `, 500)
  }
})

// Client's posted jobs history
jobsRoutes.get('/my-jobs', requireAuth, requireClient, async (c) => {
  try {
    const db = c.env.DB
    const user = c.get('user')
    
    const status = c.req.query('status') || ''
    
    let whereClause = 'WHERE j.client_id = ?'
    const params = [user.user_id]
    
    if (status) {
      whereClause += ' AND j.status = ?'
      params.push(status)
    }

    // Get client's posted jobs
    const jobs = await db
      .prepare(`
        SELECT 
          j.*,
          jc.name as category_name,
          jc.icon_class,
          u.first_name || ' ' || u.last_name as worker_name,
          COUNT(b.id) as bid_count,
          AVG(CASE WHEN b.status = 'pending' THEN b.bid_amount END) as avg_bid
        FROM jobs j
        JOIN job_categories jc ON j.category_id = jc.id
        LEFT JOIN users u ON j.assigned_worker_id = u.id
        LEFT JOIN bids b ON j.id = b.job_id
        ${whereClause}
        GROUP BY j.id
        ORDER BY j.created_at DESC
      `)
      .bind(...params)
      .all()

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>My Jobs - getKwikr</title>
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
          <!-- Header -->
          <header class="bg-white shadow-sm border-b">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center py-4">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green">Kwikr</a>
                      </div>
                      <nav class="flex items-center space-x-4">
                          <a href="/dashboard" class="text-gray-700 hover:text-kwikr-green">Dashboard</a>
                          <a href="/jobs/post" class="text-gray-700 hover:text-kwikr-green">Post New Job</a>
                          <span class="text-gray-500">|</span>
                          <span class="text-gray-700">Welcome, ${user.first_name}</span>
                          <a href="/logout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</a>
                      </nav>
                  </div>
              </div>
          </header>

          <!-- Main Content -->
          <main class="max-w-6xl mx-auto py-8 px-4">
              <!-- Header -->
              <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                  <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                      <div>
                          <h1 class="text-3xl font-bold text-gray-800 mb-2">
                              <i class="fas fa-briefcase text-kwikr-green mr-3"></i>
                              My Posted Jobs
                          </h1>
                          <p class="text-gray-600">Manage your job postings and track progress.</p>
                      </div>
                      <div class="mt-4 lg:mt-0 flex space-x-4">
                          <span class="bg-kwikr-green text-white px-3 py-1 rounded-full text-sm">
                              ${jobs.results.length} jobs posted
                          </span>
                          <a href="/jobs/post" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                              <i class="fas fa-plus mr-2"></i>Post New Job
                          </a>
                      </div>
                  </div>

                  <!-- Status Filter -->
                  <div class="flex flex-wrap gap-2">
                      <a href="/jobs/my-jobs" 
                         class="px-4 py-2 rounded-full text-sm ${status === '' ? 'bg-kwikr-green text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                          All Jobs
                      </a>
                      <a href="/jobs/my-jobs?status=posted" 
                         class="px-4 py-2 rounded-full text-sm ${status === 'posted' ? 'bg-kwikr-green text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                          Open
                      </a>
                      <a href="/jobs/my-jobs?status=assigned" 
                         class="px-4 py-2 rounded-full text-sm ${status === 'assigned' ? 'bg-kwikr-green text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                          Assigned
                      </a>
                      <a href="/jobs/my-jobs?status=in_progress" 
                         class="px-4 py-2 rounded-full text-sm ${status === 'in_progress' ? 'bg-kwikr-green text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                          In Progress
                      </a>
                      <a href="/jobs/my-jobs?status=completed" 
                         class="px-4 py-2 rounded-full text-sm ${status === 'completed' ? 'bg-kwikr-green text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                          Completed
                      </a>
                  </div>
              </div>

              <!-- Jobs List -->
              <div class="space-y-6">
                  ${jobs.results.length === 0 ? `
                      <div class="bg-white rounded-lg shadow-md p-8 text-center">
                          <i class="fas fa-briefcase text-4xl text-gray-400 mb-4"></i>
                          <h3 class="text-xl font-semibold text-gray-600 mb-2">No jobs posted yet</h3>
                          <p class="text-gray-500 mb-4">Post your first job to connect with skilled workers.</p>
                          <a href="/jobs/post" class="bg-kwikr-green text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
                              <i class="fas fa-plus mr-2"></i>Post Your First Job
                          </a>
                      </div>
                  ` : jobs.results.map(job => {
                      const statusColors = {
                          'posted': 'bg-blue-100 text-blue-800',
                          'assigned': 'bg-purple-100 text-purple-800',
                          'in_progress': 'bg-orange-100 text-orange-800',
                          'completed': 'bg-green-100 text-green-800',
                          'cancelled': 'bg-red-100 text-red-800',
                          'disputed': 'bg-purple-100 text-purple-800'
                      }

                      return `
                          <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                              <div class="p-6">
                                  <!-- Header -->
                                  <div class="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
                                      <div class="flex items-center mb-4 lg:mb-0">
                                          <i class="${job.icon_class || 'fas fa-briefcase'} text-2xl text-kwikr-green mr-3"></i>
                                          <div>
                                              <h3 class="font-semibold text-lg text-gray-800">${job.title}</h3>
                                              <p class="text-sm text-gray-600">${job.category_name}</p>
                                              <p class="text-sm text-gray-500">${job.location_city}, ${job.location_province}</p>
                                          </div>
                                      </div>
                                      <div class="flex flex-col items-end space-y-2">
                                          <span class="px-3 py-1 rounded-full text-sm font-medium ${statusColors[job.status] || statusColors['posted']}">
                                              ${job.status.replace('_', ' ')}
                                          </span>
                                          <div class="text-sm text-gray-500">
                                              Job #${job.id}
                                          </div>
                                      </div>
                                  </div>

                                  <!-- Job Details -->
                                  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                      <div>
                                          <label class="block text-sm font-medium text-gray-700">Budget Range</label>
                                          <p class="text-gray-900">
                                              ${job.budget_min && job.budget_max 
                                                ? `$${job.budget_min} - $${job.budget_max}`
                                                : job.budget_min 
                                                ? `From $${job.budget_min}`
                                                : job.budget_max
                                                ? `Up to $${job.budget_max}`
                                                : 'Not specified'}
                                          </p>
                                      </div>
                                      <div>
                                          <label class="block text-sm font-medium text-gray-700">Applications</label>
                                          <p class="text-lg font-bold text-blue-600">${job.bid_count}</p>
                                      </div>
                                      <div>
                                          <label class="block text-sm font-medium text-gray-700">Posted</label>
                                          <p class="text-gray-900">${new Date(job.created_at).toLocaleDateString()}</p>
                                      </div>
                                      <div>
                                          <label class="block text-sm font-medium text-gray-700">${job.status === 'posted' ? 'Avg Bid' : 'Assigned Worker'}</label>
                                          <p class="text-gray-900">
                                              ${job.status === 'posted' && job.avg_bid 
                                                ? `$${Math.round(job.avg_bid)}`
                                                : job.worker_name || 'None'}
                                          </p>
                                      </div>
                                  </div>

                                  <!-- Description -->
                                  <div class="mb-4">
                                      <p class="text-gray-600 text-sm line-clamp-2">${job.description}</p>
                                  </div>

                                  <!-- Timeline -->
                                  ${job.start_date || job.expected_completion ? `
                                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                                          ${job.start_date ? `
                                              <div>
                                                  <label class="block font-medium text-gray-700">Start Date</label>
                                                  <p class="text-gray-600">${new Date(job.start_date).toLocaleDateString()}</p>
                                              </div>
                                          ` : ''}
                                          ${job.expected_completion ? `
                                              <div>
                                                  <label class="block font-medium text-gray-700">Expected Completion</label>
                                                  <p class="text-gray-600">${new Date(job.expected_completion).toLocaleDateString()}</p>
                                              </div>
                                          ` : ''}
                                      </div>
                                  ` : ''}

                                  <!-- Actions -->
                                  <div class="flex flex-wrap gap-2 pt-4 border-t">
                                      <a href="/jobs/${job.id}" 
                                         class="bg-kwikr-green text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm">
                                          <i class="fas fa-eye mr-2"></i>View Details
                                      </a>
                                      
                                      ${job.status === 'posted' ? `
                                          <a href="/jobs/${job.id}/edit" 
                                             class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                                              <i class="fas fa-edit mr-2"></i>Edit Job
                                          </a>
                                          <button onclick="cancelJob(${job.id})" 
                                                  class="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm">
                                              <i class="fas fa-times mr-2"></i>Cancel
                                          </button>
                                      ` : ''}
                                      
                                      ${job.status === 'completed' ? `
                                          <a href="/jobs/${job.id}/review" 
                                             class="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors text-sm">
                                              <i class="fas fa-star mr-2"></i>Leave Review
                                          </a>
                                      ` : ''}
                                      
                                      ${job.bid_count > 0 && job.status === 'posted' ? `
                                          <span class="bg-green-100 text-green-800 py-2 px-3 rounded-lg text-sm">
                                              <i class="fas fa-users mr-1"></i>${job.bid_count} applications received
                                          </span>
                                      ` : ''}
                                  </div>
                              </div>
                          </div>
                      `
                  }).join('')}
              </div>
          </main>

          <script>
              async function cancelJob(jobId) {
                  if (!confirm('Are you sure you want to cancel this job?')) {
                      return;
                  }

                  try {
                      const res = await fetch(\`/jobs/\${jobId}/cancel\`, {
                          method: 'POST'
                      });

                      if (res.ok) {
                          location.reload();
                      } else {
                          alert('Failed to cancel job');
                      }
                  } catch (error) {
                      alert('Error cancelling job');
                  }
              }
          </script>

          <style>
              .line-clamp-2 {
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
              }
          </style>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading client jobs:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load your jobs.</p>
          <a href="/dashboard" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Return to Dashboard</a>
        </div>
      </div>
    `, 500)
  }
})

// ============================================================================
// JOB MATCHING ALGORITHM - Auto-suggest workers for jobs
// ============================================================================

// Get suggested workers for a specific job
jobsRoutes.get('/:id/suggested-workers', requireAuth, requireClient, async (c) => {
  try {
    const db = c.env.DB
    const user = c.get('user')
    const jobId = parseInt(c.req.param('id'))

    if (!jobId) {
      return c.json({ error: 'Invalid job ID' }, 400)
    }

    // Verify job ownership
    const job = await db
      .prepare('SELECT * FROM jobs WHERE id = ? AND client_id = ?')
      .bind(jobId, user.user_id)
      .first()

    if (!job) {
      return c.json({ error: 'Job not found or access denied' }, 404)
    }

    // Get job category
    const jobCategory = await db
      .prepare('SELECT * FROM job_categories WHERE id = ?')
      .bind(job.category_id)
      .first()

    if (!jobCategory) {
      return c.json({ error: 'Job category not found' }, 404)
    }

    // Job matching algorithm - find workers with matching services and location
    const suggestedWorkers = await db
      .prepare(`
        SELECT DISTINCT
          u.id,
          u.first_name || ' ' || u.last_name as name,
          u.email,
          u.province,
          u.city,
          up.bio,
          up.profile_image_url,
          ws.service_name,
          ws.description as service_description,
          ws.hourly_rate,
          ws.years_experience,
          ws.service_area,
          -- Matching score calculation
          (
            -- Exact service category match
            CASE WHEN ws.service_category = ? THEN 50 ELSE 0 END +
            
            -- Location proximity (same province)
            CASE WHEN u.province = ? THEN 30 ELSE 0 END +
            
            -- Location proximity (same city)
            CASE WHEN u.city = ? THEN 20 ELSE 0 END +
            
            -- Experience factor
            CASE 
              WHEN ws.years_experience >= 10 THEN 15
              WHEN ws.years_experience >= 5 THEN 10
              WHEN ws.years_experience >= 2 THEN 5
              ELSE 0 
            END +
            
            -- Rate compatibility (within budget range)
            CASE 
              WHEN ? IS NOT NULL AND ? IS NOT NULL AND ws.hourly_rate BETWEEN ? AND ? THEN 10
              WHEN ? IS NOT NULL AND ws.hourly_rate >= ? THEN 5
              WHEN ? IS NOT NULL AND ws.hourly_rate <= ? THEN 5
              ELSE 0 
            END +
            
            -- Active and verified worker bonus
            CASE WHEN u.is_active = 1 AND u.is_verified = 1 THEN 10 ELSE 0 END
          ) as match_score,
          
          -- Calculate average rating
          AVG(r.rating) as avg_rating,
          COUNT(r.id) as review_count,
          
          -- Check compliance status
          wc.compliance_status
        FROM users u
        JOIN worker_services ws ON u.id = ws.user_id
        JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN reviews r ON u.id = r.reviewee_id
        LEFT JOIN worker_compliance wc ON u.id = wc.user_id
        WHERE u.role = 'worker' 
          AND u.is_active = 1
          AND ws.is_available = 1
          AND (
            ws.service_category = ? OR 
            ws.service_name LIKE ? OR
            ws.description LIKE ?
          )
        GROUP BY u.id, ws.id
        HAVING match_score >= 30
        ORDER BY match_score DESC, avg_rating DESC NULLS LAST, review_count DESC
        LIMIT 20
      `)
      .bind(
        jobCategory.name,
        job.location_province,
        job.location_city,
        job.budget_min, job.budget_max, job.budget_min, job.budget_max,
        job.budget_min, job.budget_min,
        job.budget_max, job.budget_max,
        jobCategory.name,
        `%${jobCategory.name}%`,
        `%${jobCategory.name}%`
      )
      .all()

    return c.json({
      job_id: jobId,
      job_title: job.title,
      category: jobCategory.name,
      suggested_workers: suggestedWorkers.results.map(worker => ({
        id: worker.id,
        name: worker.name,
        email: worker.email,
        location: `${worker.city}, ${worker.province}`,
        bio: worker.bio,
        profile_image_url: worker.profile_image_url,
        service: {
          name: worker.service_name,
          description: worker.service_description,
          hourly_rate: worker.hourly_rate,
          years_experience: worker.years_experience
        },
        match_score: worker.match_score,
        avg_rating: worker.avg_rating ? parseFloat(worker.avg_rating.toFixed(1)) : null,
        review_count: worker.review_count || 0,
        compliance_status: worker.compliance_status,
        is_compliant: worker.compliance_status === 'verified'
      }))
    })
  } catch (error) {
    console.error('Error getting suggested workers:', error)
    return c.json({ error: 'Failed to get suggested workers' }, 500)
  }
})

// Invite specific worker to apply for job
jobsRoutes.post('/:id/invite/:workerId', requireAuth, requireClient, async (c) => {
  try {
    const db = c.env.DB
    const user = c.get('user')
    const jobId = parseInt(c.req.param('id'))
    const workerId = parseInt(c.req.param('workerId'))

    if (!jobId || !workerId) {
      return c.json({ error: 'Invalid parameters' }, 400)
    }

    // Verify job ownership
    const job = await db
      .prepare('SELECT * FROM jobs WHERE id = ? AND client_id = ? AND status = ?')
      .bind(jobId, user.user_id, 'posted')
      .first()

    if (!job) {
      return c.json({ error: 'Job not found or not available' }, 404)
    }

    // Verify worker exists
    const worker = await db
      .prepare('SELECT * FROM users WHERE id = ? AND role = ? AND is_active = ?')
      .bind(workerId, 'worker', 1)
      .first()

    if (!worker) {
      return c.json({ error: 'Worker not found' }, 404)
    }

    // Create invitation notification
    await db
      .prepare(`
        INSERT INTO notifications (
          user_id, type, title, message, related_entity_type, related_entity_id, created_at
        ) VALUES (?, 'job_invitation', ?, ?, 'job', ?, datetime('now'))
      `)
      .bind(
        workerId,
        'Job Invitation',
        `${user.first_name} ${user.last_name} invited you to apply for "${job.title}"`,
        jobId
      )
      .run()

    return c.json({ 
      success: true, 
      message: `Invitation sent to ${worker.first_name} ${worker.last_name}` 
    })
  } catch (error) {
    console.error('Error sending job invitation:', error)
    return c.json({ error: 'Failed to send invitation' }, 500)
  }
})

export { jobsRoutes }