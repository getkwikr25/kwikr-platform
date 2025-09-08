import { Hono } from 'hono'
import { Logger } from '../utils/logger'

type Bindings = {
  DB: D1Database;
}

export const universalProfileRoutes = new Hono<{ Bindings: Bindings }>()

// Universal Worker Profile Page - Combines best of both layouts
universalProfileRoutes.get('/:workerId', async (c) => {
  try {
    const workerId = c.req.param('workerId')
    
    console.log('Loading Universal Profile for worker ID:', workerId)
    
    // Fetch worker profile data from database
    const workerProfile = await c.env.DB.prepare(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.province, u.city,
             u.is_verified, u.created_at,
             up.bio, up.company_name, up.company_description, up.website_url, up.years_in_business
      FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ? AND u.role = 'worker' AND u.is_active = 1
    `).bind(workerId).first()
    
    if (!workerProfile) {
      console.log('Worker profile not found for ID:', workerId)
      return c.html(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Profile Not Found - Kwikr</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
            <div class="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
                <p class="text-gray-600 mb-4">The service provider profile you're looking for could not be found.</p>
                <a href="/" class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    Back to Directory
                </a>
            </div>
        </body>
        </html>
      `)
    }
    
    console.log('Worker profile loaded:', workerProfile)
    
    // Get worker services
    const workerServices = await c.env.DB.prepare(`
      SELECT service_category, service_name, description, hourly_rate, is_available, service_area, years_experience
      FROM worker_services
      WHERE user_id = ? AND is_available = 1
      ORDER BY service_category, service_name
    `).bind(workerId).all()
    
    // Get worker compliance info
    const workerCompliance = await c.env.DB.prepare(`
      SELECT wsib_number, wsib_valid_until, insurance_provider, insurance_policy_number, 
             insurance_valid_until, license_type, license_number, license_valid_until, 
             compliance_status, verified_at
      FROM worker_compliance
      WHERE user_id = ?
    `).bind(workerId).all()
    
    // Process profile data with fallbacks
    const profileData = {
      id: workerProfile.id,
      firstName: workerProfile.first_name || 'Professional',
      lastName: workerProfile.last_name || 'Service Provider', 
      email: workerProfile.email || '',
      phone: workerProfile.phone || '',
      province: workerProfile.province || '',
      city: workerProfile.city || '',
      isVerified: workerProfile.is_verified || 0,
      memberSince: workerProfile.created_at ? new Date(workerProfile.created_at).getFullYear() : new Date().getFullYear(),
      companyName: workerProfile.company_name || `${workerProfile.first_name} ${workerProfile.last_name}`,
      businessEmail: workerProfile.email,
      serviceType: 'Professional Services',
      bio: workerProfile.bio || 'Professional service provider committed to delivering high-quality work.',
      companyDescription: workerProfile.company_description || 'Experienced professional ready to serve your needs with reliable and quality service.',
      services: workerServices.results || [{
        service_category: 'Professional Services',
        service_name: 'Professional Services', 
        description: 'Quality professional service tailored to your needs',
        hourly_rate: 85,
        is_available: 1,
        service_area: `${workerProfile.city}, ${workerProfile.province}`,
        years_experience: null
      }],
      compliance: workerCompliance.results || []
    }
    
    console.log('Processed profile data:', profileData)
    
    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Service Provider Profile - Kwikr</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'kwikr-green': '#00C881',
                    'kwikr-dark': '#1a1a1a',
                    'kwikr-gray': '#f8f9fa'
                  }
                }
              }
            }
          </script>
          <style>
            .rating-stars {
              display: inline-flex;
              align-items: center;
            }
            .rating-star {
              color: #d1d5db;
              font-size: 1.25rem;
            }
            .rating-star.filled {
              color: #fbbf24;
            }
            .profile-card {
              background: white;
              border-radius: 1rem;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              margin-bottom: 1.5rem;
              overflow: hidden;
            }
            .profile-section {
              background: white;
              border-radius: 0.75rem;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
              margin-bottom: 1.5rem;
              padding: 1.5rem;
            }
            .hero-gradient {
              background: linear-gradient(135deg, #00C881 0%, #00A66F 100%);
            }
            .feature-badge {
              background: linear-gradient(135deg, #00C881, #00A66F);
              color: white;
              padding: 0.25rem 0.75rem;
              border-radius: 9999px;
              font-size: 0.75rem;
              font-weight: 600;
              display: inline-flex;
              align-items: center;
              margin-right: 0.5rem;
              margin-bottom: 0.5rem;
            }
            .service-card {
              border: 1px solid #e5e7eb;
              border-radius: 0.5rem;
              padding: 1rem;
              margin-bottom: 1rem;
              transition: all 0.3s ease;
            }
            .service-card:hover {
              border-color: #00C881;
              box-shadow: 0 4px 6px -1px rgba(0, 200, 129, 0.1);
              transform: translateY(-2px);
            }
            .contact-item {
              display: flex;
              align-items: center;
              padding: 0.75rem;
              border-radius: 0.5rem;
              margin-bottom: 0.5rem;
              transition: background-color 0.2s;
            }
            .contact-item:hover {
              background-color: #f9fafb;
            }
            .availability-indicator {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              display: inline-block;
              margin-right: 0.5rem;
            }
            .availability-indicator.available {
              background-color: #10b981;
            }
            .availability-indicator.busy {
              background-color: #f59e0b;
            }
            .availability-indicator.unavailable {
              background-color: #ef4444;
            }
            .map-placeholder {
              background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
              border-radius: 0.75rem;
              height: 300px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #6b7280;
              font-weight: 500;
              border: 2px dashed #d1d5db;
            }
            @media (max-width: 768px) {
              .profile-section {
                margin-bottom: 1rem;
                padding: 1rem;
              }
              .profile-card {
                margin-bottom: 1rem;
              }
            }
          </style>
      </head>
      <body class="bg-kwikr-gray min-h-screen">
          <!-- Navigation -->
          <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center h-16">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green hover:text-green-600 transition-colors">
                              <i class="fas fa-tools mr-2"></i>Kwikr
                          </a>
                      </div>
                      <div class="flex items-center space-x-4">
                          <a href="/" class="text-gray-700 hover:text-kwikr-green flex items-center transition-colors">
                              <i class="fas fa-arrow-left mr-2"></i>Back to Search
                          </a>
                          <a href="/signup" class="text-gray-700 hover:text-kwikr-green">Join as Worker</a>
                          <a href="/auth/login" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                              Sign In
                          </a>
                      </div>
                  </div>
              </div>
          </nav>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <!-- Loading State -->
              <div id="loading" class="text-center py-12">
                  <div class="inline-flex items-center px-6 py-3 font-semibold leading-6 text-sm shadow-lg rounded-lg text-white bg-kwikr-green">
                      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading Profile...
                  </div>
              </div>

              <!-- Error State -->
              <div id="error" class="hidden text-center py-12">
                  <div class="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                      <div class="flex items-center justify-center mb-4">
                          <i class="fas fa-exclamation-triangle text-red-400 text-3xl"></i>
                      </div>
                      <h3 class="text-lg font-medium text-red-800 mb-2">Profile Not Found</h3>
                      <p class="text-sm text-red-700 mb-4">
                          The service provider profile you're looking for could not be found.
                      </p>
                      <a href="/" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                          Back to Directory
                      </a>
                  </div>
              </div>

              <!-- Profile Content -->
              <div id="profile-content" class="hidden">
                  
                  <!-- Hero Section with Company Header -->
                  <div class="profile-card hero-gradient text-white mb-8">
                      <div class="p-8">
                          <div class="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                              <!-- Company Logo/Avatar -->
                              <div class="flex-shrink-0">
                                  <div id="company-avatar" class="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white border-opacity-30">
                                      <i class="fas fa-building text-white text-3xl"></i>
                                  </div>
                              </div>
                              
                              <!-- Company Information -->
                              <div class="flex-1 min-w-0">
                                  <div class="flex flex-wrap items-center gap-2 mb-3">
                                      <div id="verified-badge" class="${profileData.isVerified ? '' : 'hidden'} bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                          <i class="fas fa-check-circle mr-1"></i>Verified Business
                                      </div>
                                      <div id="years-badge" class="hidden bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">
                                          <i class="fas fa-calendar mr-1"></i><span id="years-text">Years in Business</span>
                                      </div>
                                      <div id="member-badge" class="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">
                                          <i class="fas fa-user-clock mr-1"></i>Member since <span id="member-date">${profileData.memberSince}</span>
                                      </div>
                                  </div>
                                  
                                  <h1 id="company-name" class="text-4xl font-bold mb-3">${profileData.companyName}</h1>
                                  
                                  <div class="flex flex-wrap items-center gap-4 mb-4">
                                      <div id="service-categories" class="flex flex-wrap gap-2">
                                          <!-- Service category badges will go here -->
                                      </div>
                                  </div>
                                  
                                  <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                                      <div id="location-display" class="flex items-center text-white text-opacity-90">
                                          <i class="fas fa-map-marker-alt mr-2"></i>
                                          <span>${profileData.city}${profileData.city && profileData.province ? ', ' : ''}${profileData.province}</span>
                                      </div>
                                      <div id="rating-display" class="flex items-center">
                                          <div id="rating-stars" class="rating-stars mr-2"></div>
                                          <span id="rating-text" class="text-white text-opacity-90"></span>
                                      </div>
                                      <div class="flex items-center">
                                          <span class="availability-indicator available"></span>
                                          <span id="availability-status" class="text-white text-opacity-90">Available Today</span>
                                      </div>
                                  </div>
                              </div>
                              
                              <!-- Price Range -->
                              <div class="text-right">
                                  <div class="text-3xl font-bold text-white mb-1" id="price-range">$85-125/hr</div>
                                  <div class="text-white text-opacity-75 text-sm">Starting Rate</div>
                              </div>
                          </div>
                          
                          <!-- Action Buttons -->
                          <div class="mt-8 flex flex-wrap gap-4">
                              <button id="invite-bid-btn" class="bg-white text-kwikr-green px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg flex items-center">
                                  <i class="fas fa-handshake mr-2"></i>Request Quote
                              </button>
                              <button id="contact-btn" class="bg-white bg-opacity-20 text-white border-2 border-white border-opacity-30 px-6 py-3 rounded-lg hover:bg-white hover:bg-opacity-30 transition-colors backdrop-blur-sm">
                                  <i class="fas fa-phone mr-2"></i>Contact Now
                              </button>
                              <button id="website-btn" class="hidden bg-white bg-opacity-20 text-white border-2 border-white border-opacity-30 px-6 py-3 rounded-lg hover:bg-white hover:bg-opacity-30 transition-colors backdrop-blur-sm">
                                  <i class="fas fa-globe mr-2"></i>Visit Website
                              </button>
                              <button id="save-btn" class="bg-white bg-opacity-20 text-white border-2 border-white border-opacity-30 p-3 rounded-lg hover:bg-white hover:bg-opacity-30 transition-colors backdrop-blur-sm">
                                  <i class="far fa-heart"></i>
                              </button>
                          </div>
                      </div>
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      <!-- Left Column - Main Content -->
                      <div class="lg:col-span-2 space-y-6">
                          
                          <!-- About Section -->
                          <div class="profile-section">
                              <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                  <i class="fas fa-info-circle text-kwikr-green mr-3"></i>
                                  About
                              </h2>
                              <div id="company-description" class="text-gray-700 leading-relaxed text-lg prose prose-lg max-w-none">
                                  ${profileData.companyDescription}
                              </div>
                          </div>

                          <!-- Services Offered -->
                          <div class="profile-section">
                              <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                  <i class="fas fa-tools text-kwikr-green mr-3"></i>
                                  Services Offered
                              </h2>
                              <div id="services-list" class="space-y-4">
                                  <!-- Services will be populated here -->
                              </div>
                          </div>

                          <!-- Reviews & Testimonials -->
                          <div class="profile-section">
                              <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                  <i class="fas fa-star text-kwikr-green mr-3"></i>
                                  Reviews & Testimonials
                              </h2>
                              <div id="reviews-section">
                                  <!-- Reviews will be populated here -->
                              </div>
                          </div>
                          
                          <!-- Service Area & Location (moved below Reviews) -->
                          <div class="profile-section">
                              <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                  <i class="fas fa-map-marked-alt text-kwikr-green mr-3"></i>
                                  Service Area
                              </h2>
                              
                              <!-- Map Container (full width, above address) -->
                              <div id="map-container" class="map-placeholder mb-6" style="height: 350px;">
                                  <div class="text-center">
                                      <i class="fas fa-map text-5xl mb-4"></i>
                                      <p class="font-semibold text-lg">Interactive Map</p>
                                      <p class="text-sm text-gray-600">Google Maps Integration - Showing Service Area</p>
                                  </div>
                              </div>
                              
                              <!-- Address and Service Details (below map) -->
                              <div id="full-address" class="text-gray-700">
                                  <!-- Address and service area details will be populated here -->
                              </div>
                          </div>
                      </div>

                      <!-- Right Column - Contact & Details -->
                      <div class="space-y-6">
                          
                          <!-- Quick Contact -->
                          <div class="profile-section">
                              <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                  <i class="fas fa-phone text-kwikr-green mr-2"></i>
                                  Quick Contact
                              </h3>
                              <div id="contact-info" class="space-y-2">
                                  <!-- Contact details will be populated here -->
                              </div>
                          </div>

                          <!-- Professional Features (moved above Hours) -->
                          <div class="profile-section">
                              <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                  <i class="fas fa-award text-kwikr-green mr-2"></i>
                                  Professional Features
                              </h3>
                              <div id="professional-features" class="space-y-3">
                                  <!-- Professional features will be populated here -->
                              </div>
                          </div>

                          <!-- Hours of Operation (moved below Professional Features) -->
                          <div class="profile-section">
                              <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                  <i class="fas fa-clock text-kwikr-green mr-2"></i>
                                  Hours of Operation
                              </h3>
                              <div id="operating-hours" class="space-y-3">
                                  <!-- Hours will be populated here -->
                              </div>
                          </div>

                          <!-- Social Links -->
                          <div class="profile-section hidden" id="social-section">
                              <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                  <i class="fas fa-share-alt text-kwikr-green mr-2"></i>
                                  Connect With Us
                              </h3>
                              <div class="flex space-x-4">
                                  <a href="#" class="text-gray-400 hover:text-blue-600 text-2xl transition-colors"><i class="fab fa-linkedin"></i></a>
                                  <a href="#" class="text-gray-400 hover:text-blue-500 text-2xl transition-colors"><i class="fab fa-facebook"></i></a>
                                  <a href="#" class="text-gray-400 hover:text-pink-500 text-2xl transition-colors"><i class="fab fa-instagram"></i></a>
                                  <a href="#" class="text-gray-400 hover:text-gray-900 text-2xl transition-colors"><i class="fab fa-twitter"></i></a>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <script>
            // Inject profile data for JavaScript
            try {
              window.profileData = ${JSON.stringify(profileData).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')};
              console.log('Universal Profile: Profile data loaded', window.profileData);
            } catch (error) {
              console.error('Failed to load profile data:', error);
              window.profileData = null;
            }
          </script>
          <script src="/static/universal-profile-display.js"></script>
      </body>
      </html>
    `)

  } catch (error) {
    console.error('Universal profile page error:', error)
    return c.json({ error: 'Failed to load profile page' }, 500)
  }
})