import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

export const workerProfileRoutes = new Hono<{ Bindings: Bindings }>()

// Get comprehensive worker profile for public view (HYBRID: NEW + OLD SYSTEM SUPPORT)
workerProfileRoutes.get('/profile/:workerId', async (c) => {
  try {
    const workerId = c.req.param('workerId')
    
    if (!workerId) {
      return c.json({ error: 'Worker ID is required' }, 400)
    }

    // Try to get worker profile from new Excel-based structure first
    let worker = await c.env.DB.prepare(`
      SELECT 
        id,
        company,
        description,
        address,
        country,
        province,
        city,
        postal_code,
        email,
        filename,
        google_place_id,
        latitude,
        longitude,
        phone,
        profile_photo,
        category,
        subscription_type,
        user_id,
        website,
        hours_of_operation,
        hourly_rate,
        price_range,
        services_provided,
        created_at,
        updated_at
      FROM worker_profiles_new 
      WHERE id = ?
    `).bind(workerId).first()

    // If not found in new table, try old system (user_id lookup)
    if (!worker) {
      const oldWorker = await c.env.DB.prepare(`
        SELECT 
          u.id as user_id,
          u.email,
          u.phone, 
          u.city,
          u.province,
          up.company_name as company,
          up.company_description as description,
          up.address_line1 as address,
          up.postal_code,
          up.profile_image_url as profile_photo,
          up.website_url as website,
          COALESCE(ws.service_category, 'General Contractor') as category,
          'Pay-as-you-go' as subscription_type,
          u.created_at
        FROM users u 
        JOIN user_profiles up ON u.id = up.user_id 
        LEFT JOIN worker_services ws ON u.id = ws.user_id
        WHERE u.id = ? AND u.role = 'worker'
        LIMIT 1
      `).bind(workerId).first()

      if (oldWorker) {
        // Normalize category names to match new system standards
        const categoryMapping: { [key: string]: string } = {
          'Cleaning': 'Cleaning Services',
          'General Contracting': 'General Contractor',
          'Electrical': 'Electrical',
          'Plumbing': 'Plumbing',
          'HVAC': 'HVAC',
          'Flooring': 'Flooring',
          'Roofing': 'Roofing',
          'Landscaping': 'Landscaping'
        }
        
        const normalizedCategory = categoryMapping[oldWorker.category] || oldWorker.category || 'General Contractor'
        
        // Convert old data format to new format
        worker = {
          id: oldWorker.user_id,
          user_id: oldWorker.user_id,
          company: oldWorker.company || 'Professional Service Provider',
          description: oldWorker.description || 'Quality professional services',
          address: oldWorker.address,
          country: 'Canada',
          province: oldWorker.province,
          city: oldWorker.city,
          postal_code: oldWorker.postal_code,
          email: oldWorker.email,
          phone: oldWorker.phone,
          profile_photo: oldWorker.profile_photo,
          category: normalizedCategory,
          subscription_type: oldWorker.subscription_type,
          website: oldWorker.website,
          created_at: oldWorker.created_at,
          // Default values for missing fields
          filename: null,
          google_place_id: null,
          latitude: null,
          longitude: null,
          hours_of_operation: null,
          hourly_rate: 85, // Default rate
          price_range: '$75-100/hr',
          services_provided: null,
          updated_at: oldWorker.created_at
        }
      }
    }

    if (!worker) {
      return c.json({ error: 'Worker not found' }, 404)
    }

    // Parse services from Excel data (fallback to category if services_provided is null)
    let servicesData = []
    if (worker.services_provided && worker.services_provided.trim()) {
      // If services_provided exists, split by comma
      servicesData = worker.services_provided.split(',').map((service: string, index: number) => ({
        id: index + 1,
        category: worker.category,
        name: service.trim(),
        description: `Professional ${service.trim().toLowerCase()} services`,
        hourlyRate: worker.hourly_rate,
        serviceArea: `${worker.city}, ${worker.province}`,
        yearsExperience: 5, // Default
        isAvailable: true
      }))
    } else {
      // Default service based on category
      servicesData = [{
        id: 1,
        category: worker.category,
        name: worker.category,
        description: `Professional ${worker.category.toLowerCase()} services`,
        hourlyRate: worker.hourly_rate,
        serviceArea: `${worker.city}, ${worker.province}`,
        yearsExperience: 5,
        isAvailable: true
      }]
    }

    // Parse operating hours (default business hours if none provided)
    let operatingHours = []
    if (worker.hours_of_operation && worker.hours_of_operation.trim()) {
      // If hours are provided, try to parse them
      operatingHours = parseHoursString(worker.hours_of_operation)
    } else {
      // Default business hours (Monday-Friday 8 AM to 6 PM)
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      operatingHours = dayNames.map((day, index) => ({
        day,
        dayIndex: index,
        isOpen: index >= 1 && index <= 5, // Monday to Friday
        openTime: index >= 1 && index <= 5 ? '08:00' : null,
        closeTime: index >= 1 && index <= 5 ? '18:00' : null
      }))
    }

    // Generate sample reviews (since Excel doesn't have review data)
    const sampleReviews = generateSampleReviews(worker.company)
    const ratingStats = {
      avg_rating: 4.6,
      total_reviews: sampleReviews.length,
      five_star: Math.floor(sampleReviews.length * 0.6),
      four_star: Math.floor(sampleReviews.length * 0.3),
      three_star: Math.floor(sampleReviews.length * 0.1),
      two_star: 0,
      one_star: 0
    }

    // Calculate price ranges from hourly_rate and price_range fields
    let priceRange = { min: 0, max: 0 }
    if (worker.price_range && worker.price_range.includes('-')) {
      // Parse price range like "$85-125/hr"
      const matches = worker.price_range.match(/\$?(\d+)-(\d+)/)
      if (matches) {
        priceRange = {
          min: parseInt(matches[1]),
          max: parseInt(matches[2])
        }
      }
    } else if (worker.hourly_rate) {
      // Use single hourly rate
      priceRange = {
        min: worker.hourly_rate,
        max: worker.hourly_rate
      }
    } else {
      // Default price range based on category
      const defaultRates = {
        'Plumbing': { min: 85, max: 125 },
        'Electrical': { min: 90, max: 140 },
        'HVAC': { min: 80, max: 120 },
        'General Contractor': { min: 75, max: 110 }
      }
      priceRange = defaultRates[worker.category as keyof typeof defaultRates] || { min: 75, max: 100 }
    }

    // Prepare comprehensive profile response with Excel-based data
    const profileData = {
      // Basic Information (derived from company name)
      id: worker.id,
      firstName: worker.company.split(' ')[0],
      lastName: worker.company.split(' ').slice(1).join(' ') || 'Services',
      companyName: worker.company,
      companyLogo: worker.profile_photo,
      profileImage: worker.profile_photo,
      
      // Business Information  
      businessEmail: worker.email,
      phone: worker.phone,
      website: worker.website,
      
      // Location Information (with coordinates for map integration)
      location: {
        city: worker.city,
        province: worker.province,
        address1: worker.address,
        address2: null,
        postalCode: worker.postal_code,
        fullAddress: `${worker.address || ''}, ${worker.city}, ${worker.province} ${worker.postal_code || ''}`.trim(),
        coordinates: {
          latitude: worker.latitude,
          longitude: worker.longitude
        },
        googlePlaceId: worker.google_place_id
      },
      
      // Company Details
      companyDescription: worker.description,
      bio: worker.description, // Use description as bio
      yearsInBusiness: calculateYearsFromCategory(worker.category), // Estimate based on category
      memberSince: worker.created_at,
      isVerified: worker.subscription_type !== 'Pay-as-you-go', // Growth Plan and Pro Plan are "verified"
      
      // Services Information
      services: servicesData,
      
      // Service categories (from Excel category field)
      serviceCategories: [worker.category],
      
      // Pricing
      priceRange: priceRange,
      
      // Ratings & Reviews (generated sample data)
      ratings: {
        averageRating: ratingStats.avg_rating.toFixed(1),
        totalReviews: ratingStats.total_reviews,
        breakdown: {
          fiveStar: ratingStats.five_star,
          fourStar: ratingStats.four_star,
          threeStar: ratingStats.three_star,
          twoStar: ratingStats.two_star,
          oneStar: ratingStats.one_star
        }
      },
      
      // Recent Reviews (generated sample data)
      reviews: sampleReviews,
      
      // Operating Hours
      operatingHours: operatingHours,
      
      // Professional Features (based on subscription type)
      professionalFeatures: getProfessionalFeatures(worker.subscription_type),
      
      // Portfolio Information (placeholder)
      portfolio: null,
      
      // Contact & Social (placeholders for future implementation)
      social: {
        linkedin: null,
        facebook: null,
        instagram: null,
        twitter: null
      }
    }

    return c.json({
      success: true,
      worker: profileData
    })

  } catch (error) {
    console.error('Worker profile fetch error:', error)
    return c.json({ error: 'Failed to fetch worker profile' }, 500)
  }
})

// Get worker profile card (condensed version for listings)
workerProfileRoutes.get('/card/:workerId', async (c) => {
  try {
    const workerId = c.req.param('workerId')
    
    // Get condensed worker information for card display
    const worker = await c.env.DB.prepare(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.business_name,
        u.city,
        u.province,
        up.company_logo_url,
        up.profile_image_url
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ? AND u.role = 'worker' AND u.is_active = 1
    `).bind(workerId).first()

    if (!worker) {
      return c.json({ error: 'Worker not found' }, 404)
    }

    // Get primary service category and price range
    const serviceInfo = await c.env.DB.prepare(`
      SELECT 
        service_category,
        MIN(hourly_rate) as min_rate,
        MAX(hourly_rate) as max_rate,
        COUNT(*) as service_count
      FROM worker_services 
      WHERE user_id = ? AND is_available = 1
      GROUP BY service_category
      ORDER BY service_count DESC
      LIMIT 1
    `).bind(workerId).first()

    // Get rating info
    const ratingInfo = await c.env.DB.prepare(`
      SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_reviews
      FROM reviews 
      WHERE reviewee_id = ? AND is_public = 1
    `).bind(workerId).first()

    const cardData = {
      id: worker.id,
      companyName: worker.business_name || `${worker.first_name} ${worker.last_name}`,
      location: `${worker.city}, ${worker.province}`,
      primaryCategory: serviceInfo?.service_category || 'General Services',
      priceRange: serviceInfo ? `$${serviceInfo.min_rate}-${serviceInfo.max_rate}/hr` : 'Contact for pricing',
      logo: worker.company_logo_url || worker.profile_image_url,
      rating: ratingInfo?.avg_rating ? Number(ratingInfo.avg_rating).toFixed(1) : null,
      reviewCount: ratingInfo?.total_reviews || 0,
      serviceCount: serviceInfo?.service_count || 0
    }

    return c.json({
      success: true,
      card: cardData
    })

  } catch (error) {
    console.error('Worker card fetch error:', error)
    return c.json({ error: 'Failed to fetch worker card' }, 500)
  }
})

// Helper functions for Excel-based data structure

function parseHoursString(hoursStr: string) {
  // Parse hours string if provided (for future implementation)
  // For now, return default business hours
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return dayNames.map((day, index) => ({
    day,
    dayIndex: index,
    isOpen: index >= 1 && index <= 5, // Monday to Friday
    openTime: index >= 1 && index <= 5 ? '08:00' : null,
    closeTime: index >= 1 && index <= 5 ? '18:00' : null
  }))
}

function generateSampleReviews(companyName: string) {
  const reviewTemplates = [
    {
      rating: 5,
      text: `Excellent service from ${companyName}. Professional, on time, and quality work. Highly recommended!`,
      reviewerName: 'Sarah M.'
    },
    {
      rating: 5,
      text: `Great experience with ${companyName}. They went above and beyond to complete the job properly.`,
      reviewerName: 'Mike D.'
    },
    {
      rating: 4,
      text: `Good service from ${companyName}. Fair pricing and reliable work. Would use them again.`,
      reviewerName: 'Jennifer L.'
    },
    {
      rating: 5,
      text: `Outstanding professional service. ${companyName} delivered exactly what was promised.`,
      reviewerName: 'Robert K.'
    },
    {
      rating: 4,
      text: `Satisfied with the work quality from ${companyName}. Good communication throughout the project.`,
      reviewerName: 'Lisa W.'
    }
  ]
  
  return reviewTemplates.map((review, index) => ({
    ...review,
    date: new Date(Date.now() - (index * 7 * 24 * 60 * 60 * 1000)).toISOString() // Spread reviews over weeks
  }))
}

function calculateYearsFromCategory(category: string) {
  // Estimate years in business based on category (mock data)
  const categoryYears: {[key: string]: number} = {
    'Plumbing': 8,
    'Electrical': 12,
    'HVAC': 10,
    'General Contractor': 15,
    'Landscaping': 6
  }
  return categoryYears[category] || 7
}

function getProfessionalFeatures(subscriptionType: string) {
  const features = {
    'Pay-as-you-go': [
      'Basic Listing',
      'Contact Information',
      'Customer Reviews'
    ],
    'Growth Plan': [
      'Enhanced Listing',
      'Priority Search Results',
      'Advanced Analytics',
      'Customer Reviews',
      'Multiple Photos',
      'Service Area Map'
    ],
    'Pro Plan': [
      'Premium Listing',
      'Top Search Placement', 
      'Comprehensive Analytics',
      'Customer Reviews',
      'Unlimited Photos',
      'Service Area Map',
      'Featured Badge',
      'Priority Support'
    ]
  }
  
  return features[subscriptionType as keyof typeof features] || features['Pay-as-you-go']
}