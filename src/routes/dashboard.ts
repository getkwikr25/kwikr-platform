import { Hono } from 'hono'
import { Logger } from '../utils/logger'

type Bindings = {
  DB: D1Database;
}

export const dashboardRoutes = new Hono<{ Bindings: Bindings }>()

// Middleware to check if worker has active subscription
const requireWorkerSubscription = async (c: any, next: any) => {
  const user = c.get('user')
  
  // Only apply to workers
  if (user.role !== 'worker') {
    await next()
    return
  }
  
  try {
    // Check if worker has active subscription
    const subscription = await c.env.DB.prepare(`
      SELECT ws.*, sp.plan_name 
      FROM worker_subscriptions ws
      JOIN subscription_plans sp ON ws.plan_id = sp.id
      WHERE ws.user_id = ? AND ws.subscription_status = 'active'
    `).bind(user.user_id).first()
    
    if (!subscription) {
      // Worker has no active subscription - redirect to subscription selection
      return c.redirect('/dashboard/worker/select-plan')
    }
    
    // Store subscription info for use in routes
    c.set('subscription', subscription)
    await next()
  } catch (error) {
    console.error('Error checking worker subscription:', error)
    return c.redirect('/dashboard/worker/select-plan')
  }
}

// Middleware to verify authentication and get user
const requireAuth = async (c: any, next: any) => {
  const path = c.req.path
  const userAgent = c.req.header('User-Agent') || 'unknown'
  const referer = c.req.header('Referer') || 'unknown'
  
  Logger.info(`Dashboard auth check for ${path}`, { userAgent, referer, path })
  
  // Try to get session token from multiple sources:
  // 1. Cookie (for dashboard pages)
  // 2. Authorization header (for API requests)
  // 3. Query parameter (fallback)
  let sessionToken = null
  
  // Check cookie first
  const cookies = c.req.header('Cookie')
  if (cookies) {
    const match = cookies.match(/session=([^;]+)/)
    if (match) {
      sessionToken = match[1]
      Logger.debug('Session token found in cookies', { 
        tokenPreview: sessionToken.substring(0, 10) + '...',
        path 
      })
    }
    
    // Also check for demo_session cookie as fallback
    if (!sessionToken) {
      const demoMatch = cookies.match(/demo_session=([^;]+)/)
      if (demoMatch) {
        const demoInfo = demoMatch[1]
        const [role, timestamp] = demoInfo.split(':')
        
        // Create a compatible session token from demo_session
        sessionToken = btoa(`demo-${role}:${timestamp}:reliable`)
        Logger.debug('Demo session found in cookies, creating compatible token', { 
          role, 
          timestamp, 
          path 
        })
      }
    }
  }
  
  // If no cookie, try Authorization header
  if (!sessionToken) {
    const authHeader = c.req.header('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.replace('Bearer ', '')
      Logger.debug('Session token found in Authorization header', { path })
    }
  }
  
  // If still no token, try query parameter
  if (!sessionToken) {
    sessionToken = c.req.query('token')
    if (sessionToken) {
      Logger.debug('Session token found in query parameter', { path })
    }
  }
  
  if (!sessionToken) {
    Logger.warn('No session token found, attempting auto-demo login', { path, cookies })
    
    // If no session and accessing a specific role dashboard, auto-login as demo user
    if (path.startsWith('/dashboard/client') || path.startsWith('/dashboard/worker') || path.startsWith('/dashboard/admin')) {
      let role = 'client'
      if (path.startsWith('/dashboard/worker')) role = 'worker'
      if (path.startsWith('/dashboard/admin')) role = 'admin'
      
      Logger.info(`Attempting auto-demo login for role: ${role}`, { path })
      
      try {
        // Create demo user on-the-fly without database dependency
        // Updated user IDs to match actual database data
        const demoUser = {
          id: role === 'client' ? 1 : role === 'worker' ? 4 : 50,
          user_id: role === 'client' ? 1 : role === 'worker' ? 4 : 50,
          email: `demo.${role}@kwikr.ca`,
          role: role,
          first_name: 'Demo',
          last_name: role.charAt(0).toUpperCase() + role.slice(1),
          province: 'ON',
          city: 'Toronto',
          is_verified: 1,
          is_active: 1
        }
        
        // Create session for demo user
        const demoSessionToken = btoa(`${demoUser.id}:${Date.now()}:${Math.random()}`)
        
        // Try to store session in database, but continue even if it fails
        try {
          await c.env.DB.prepare(`
            INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address)
            VALUES (?, ?, datetime('now', '+7 days'), ?)
          `).bind(demoUser.id, demoSessionToken, 'auto-demo').run()
        } catch (dbError) {
          console.log('Database session storage failed, continuing with in-memory session')
        }
        
        Logger.sessionCreated(demoUser.id, demoSessionToken, {
          role,
          email: demoUser.email,
          isAutoDemo: true,
          path
        })
        
        // Set cookie and continue with the demo session
        // Use secure=true for HTTPS (detect from URL or headers)
        const host = c.req.header('host') || ''
        const isHttps = host.includes('.dev') || c.req.header('x-forwarded-proto') === 'https'
        c.header('Set-Cookie', `session=${demoSessionToken}; path=/; max-age=604800; secure=${isHttps}; samesite=lax`)
        sessionToken = demoSessionToken
      } catch (error) {
        Logger.authError('Auto demo login failed', error as Error, { role, path })
        return c.redirect('/?login=required')
      }
    } else {
      Logger.warn('No session token and not a dashboard path', { path })
      return c.redirect('/?login=required')
    }
  }
  
  try {
    Logger.debug('Validating session token in database', { 
      tokenPreview: sessionToken.substring(0, 10) + '...',
      path 
    })
    
    let session = null
    
    try {
      session = await c.env.DB.prepare(`
        SELECT s.user_id, u.role, u.first_name, u.last_name, u.email, u.is_verified,
               s.expires_at, s.created_at, s.ip_address
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = 1
      `).bind(sessionToken).first()
    } catch (dbError) {
      console.log('Database session lookup failed, checking for demo session')
    }
    
    // If no session in database, check if this is a valid demo session token
    if (!session) {
      try {
        const decoded = atob(sessionToken)
        console.log('Decoded session token:', decoded)
        
        // Handle both old format (userId:timestamp:random) and new format (demo-role:timestamp:reliable)
        const parts = decoded.split(':')
        let role = null, timestamp = null, demoUserId = null
        
        if (parts.length >= 2) {
          if (parts[0].startsWith('demo-')) {
            // New format: demo-client:timestamp:reliable
            role = parts[0].replace('demo-', '')
            timestamp = parts[1]
            demoUserId = role === 'client' ? 1 : role === 'worker' ? 2 : 3
          } else if (!isNaN(parseInt(parts[0]))) {
            // Old format: userId:timestamp:random
            demoUserId = parseInt(parts[0])
            timestamp = parts[1]
            role = demoUserId === 1 ? 'client' : demoUserId === 4 ? 'worker' : 'admin'
          }
          
          // Always accept demo sessions regardless of age for testing purposes
          if (role && timestamp && demoUserId) {
            session = {
              user_id: demoUserId,
              role: role,
              first_name: 'Demo',
              last_name: role.charAt(0).toUpperCase() + role.slice(1),
              email: `demo.${role}@kwikr.ca`,
              is_verified: 1,
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString(),
              ip_address: 'demo'
            }
            
            Logger.info('Valid demo session detected and accepted', { userId: demoUserId, role, path, timestamp })
          } else {
            console.log('Demo session missing required fields', { role, timestamp, demoUserId, parts })
          }
        } else {
          console.log('Demo session token format invalid', { parts, decoded })
        }
      } catch (decodeError) {
        console.log('Failed to decode session token as demo session:', decodeError)
      }
    }
    
    if (!session) {
      Logger.sessionValidation(false, sessionToken, { path, userAgent })
      
      // Check if session exists but is expired or user is inactive
      let expiredSession = null
      try {
        expiredSession = await c.env.DB.prepare(`
          SELECT s.user_id, s.expires_at, u.email, u.is_active
          FROM user_sessions s
          JOIN users u ON s.user_id = u.id
          WHERE s.session_token = ?
        `).bind(sessionToken).first()
      } catch (dbError) {
        console.log('Database check failed during session validation')
      }
      
      if (expiredSession) {
        Logger.warn('Session validation failed - session found but invalid', {
          userId: expiredSession.user_id,
          email: expiredSession.email,
          expiresAt: expiredSession.expires_at,
          isActive: expiredSession.is_active,
          path
        })
      } else {
        Logger.warn('Session validation failed - session not found', { 
          tokenPreview: sessionToken.substring(0, 10) + '...',
          path 
        })
      }
      
      // For AJAX requests, return JSON error
      const acceptHeader = c.req.header('Accept') || ''
      if (acceptHeader.includes('application/json')) {
        return c.json({ error: 'Session expired', expired: true }, 401)
      }
      
      // For regular page requests, redirect to home with clear message  
      return c.redirect('/?session=expired')
    }
    
    Logger.sessionValidation(true, sessionToken, {
      userId: session.user_id,
      email: session.email,
      role: session.role,
      sessionCreated: session.created_at,
      sessionExpires: session.expires_at,
      sessionSource: session.ip_address,
      path
    })
    
    c.set('user', session)
    await next()
  } catch (error) {
    Logger.authError('Auth middleware database error', error as Error, { path })
    return c.redirect('/?session=expired')
  }
}

// Dashboard entry point - redirect to role-specific dashboard
dashboardRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user')
  
  switch (user.role) {
    case 'client':
      return c.redirect('/dashboard/client')
    case 'worker':
      return c.redirect('/dashboard/worker')
    case 'admin':
      return c.redirect('/dashboard/admin')
    default:
      return c.redirect('/?error=invalid_role')
  }
})

// Client Dashboard
dashboardRoutes.get('/client', requireAuth, async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'client') {
    return c.redirect('/dashboard')
  }

  // Fetch client jobs and stats server-side
  try {
    // Get client jobs
    const jobs = await c.env.DB.prepare(`
      SELECT j.*, c.name as category_name, c.icon_class,
             (SELECT COUNT(*) FROM bids WHERE job_id = j.id AND status = 'pending') as bid_count,
             w.first_name as worker_first_name, w.last_name as worker_last_name
      FROM jobs j
      JOIN job_categories c ON j.category_id = c.id
      LEFT JOIN users w ON j.assigned_worker_id = w.id
      WHERE j.client_id = ?
      ORDER BY j.created_at DESC
    `).bind(user.user_id).all()

    // Get client stats
    const totalJobs = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM jobs WHERE client_id = ?
    `).bind(user.user_id).first()

    const activeJobs = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM jobs WHERE client_id = ? AND status IN ('posted', 'assigned', 'in_progress')
    `).bind(user.user_id).first()

    const completedJobs = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM jobs WHERE client_id = ? AND status = 'completed'
    `).bind(user.user_id).first()

    const pendingBids = await c.env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM bids b 
      JOIN jobs j ON b.job_id = j.id 
      WHERE j.client_id = ? AND b.status = 'pending'
    `).bind(user.user_id).first()

    const stats = {
      total: totalJobs?.count || 0,
      active: activeJobs?.count || 0,
      completed: completedJobs?.count || 0,
      pendingBids: pendingBids?.count || 0
    }

    const jobsData = jobs.results || []
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Client Dashboard - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <h1 class="text-2xl font-bold text-kwikr-green">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Client Dashboard</h1>
                <p class="text-gray-600">Manage your jobs and find service providers</p>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="text-kwikr-green text-2xl mr-4">
                            <i class="fas fa-briefcase"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="totalJobs">${stats.total}</p>
                            <p class="text-sm text-gray-600">Total Jobs</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="text-blue-500 text-2xl mr-4">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="activeJobs">${stats.active}</p>
                            <p class="text-sm text-gray-600">Active Jobs</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="text-green-500 text-2xl mr-4">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="completedJobs">${stats.completed}</p>
                            <p class="text-sm text-gray-600">Completed</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="text-yellow-500 text-2xl mr-4">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="pendingBids">${stats.pendingBids}</p>
                            <p class="text-sm text-gray-600">Pending Bids</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Job Management -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-lg shadow-sm">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex justify-between items-center">
                                <h2 class="text-xl font-semibold text-gray-900">My Jobs</h2>
                                <a href="/dashboard/client/post-job" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600 inline-block">
                                    <i class="fas fa-plus mr-2"></i>Post New Job
                                </a>
                            </div>
                        </div>
                        
                        <!-- Enhanced Job Progress Container -->
                        <div id="client-jobs-progress-container" class="p-6">
                            <div class="text-center py-8">
                                <i class="fas fa-spinner fa-spin text-gray-400 text-2xl mb-2"></i>
                                <p class="text-gray-500">Loading your jobs with progress tracking...</p>
                            </div>
                        </div>
                        
                        <!-- Fallback Jobs List (hidden by default) -->
                        <div id="jobsList" class="divide-y divide-gray-200 hidden">
                            ${jobsData.length === 0 ? `
                                <div class="p-6 text-center text-gray-500">
                                    <i class="fas fa-briefcase text-2xl mb-4"></i>
                                    <p>No jobs posted yet</p>
                                    <a href="/dashboard/client/post-job" class="mt-4 bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600 inline-block">
                                        Post Your First Job
                                    </a>
                                </div>
                            ` : jobsData.map(job => `
                                <div class="p-6">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <div class="flex items-center mb-2">
                                                <i class="${job.icon_class} text-kwikr-green mr-2"></i>
                                                <h3 class="text-lg font-semibold text-gray-900">${job.title}</h3>
                                                <span class="ml-3 px-2 py-1 text-xs rounded-full ${job.status === 'posted' ? 'bg-blue-100 text-blue-800' : job.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' : job.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">${job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
                                            </div>
                                            <p class="text-gray-600 mb-3">${job.description}</p>
                                            <div class="flex items-center space-x-4 text-sm text-gray-500">
                                                <span><i class="fas fa-dollar-sign mr-1"></i>$${job.budget_min} - $${job.budget_max}</span>
                                                <span><i class="fas fa-calendar mr-1"></i>${new Date(job.start_date).toLocaleDateString()}</span>
                                                <span><i class="fas fa-map-marker-alt mr-1"></i>${job.location_city}, ${job.location_province}</span>
                                                ${job.bid_count > 0 ? `<span class="text-kwikr-green font-medium"><i class="fas fa-users mr-1"></i>${job.bid_count} bids</span>` : '<span class="text-gray-400">No bids yet</span>'}
                                            </div>
                                        </div>
                                        <div class="ml-6 flex space-x-2">
                                            <button onclick="viewJobDetails(${job.id})" class="text-kwikr-green hover:text-green-600">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            ${job.status === 'posted' ? `
                                                <button onclick="editJob(${job.id})" class="text-blue-500 hover:text-blue-600">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Quick Actions -->
                    <div class="bg-white rounded-lg shadow-sm p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div class="space-y-3">
                            <a href="/dashboard/client/post-job" class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kwikr-green hover:bg-green-50 block">
                                <i class="fas fa-briefcase text-kwikr-green mr-3"></i>
                                Post a New Job
                            </a>
                            <a href="/dashboard/client/browse-workers" class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kwikr-green hover:bg-green-50 block">
                                <i class="fas fa-search text-kwikr-green mr-3"></i>
                                Browse Service Providers
                            </a>
                            <a href="/dashboard/client/profile" class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kwikr-green hover:bg-green-50 block">
                                <i class="fas fa-user text-kwikr-green mr-3"></i>
                                Edit Profile
                            </a>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white rounded-lg shadow-sm p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div id="recentActivities" class="space-y-3">
                            <div class="text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p class="text-sm mt-2">Loading...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Post Job Modal -->
        <div id="postJobModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold">Post a New Job</h3>
                    <button onclick="hidePostJobModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="postJobForm" onsubmit="handlePostJob(event)">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                            <input type="text" id="jobTitle" class="w-full p-3 border border-gray-300 rounded-lg" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select id="jobCategory" class="w-full p-3 border border-gray-300 rounded-lg" required>
                                <option value="">Select Category</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                            <select id="jobUrgency" class="w-full p-3 border border-gray-300 rounded-lg">
                                <option value="low">Low</option>
                                <option value="normal" selected>Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Budget Min ($CAD)</label>
                            <input type="number" id="budgetMin" class="w-full p-3 border border-gray-300 rounded-lg" step="0.01" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Budget Max ($CAD)</label>
                            <input type="number" id="budgetMax" class="w-full p-3 border border-gray-300 rounded-lg" step="0.01" required>
                        </div>
                        
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea id="jobDescription" rows="4" class="w-full p-3 border border-gray-300 rounded-lg" required></textarea>
                        </div>
                        
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Location Address (Optional)</label>
                            <input type="text" id="locationAddress" class="w-full p-3 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input type="date" id="startDate" class="w-full p-3 border border-gray-300 rounded-lg">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Expected Completion</label>
                            <input type="date" id="expectedCompletion" class="w-full p-3 border border-gray-300 rounded-lg">
                        </div>
                    </div>
                    
                    <button type="submit" class="w-full bg-kwikr-green text-white py-3 rounded-lg font-semibold hover:bg-green-600">
                        Post Job
                    </button>
                </form>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
          // Embed user information directly from server-side session
          window.currentUser = {
            id: ${user.user_id},
            email: "${user.email}",
            role: "${user.role}",
            firstName: "${user.first_name}",
            lastName: "${user.last_name}",
            province: "${user.province || ''}",
            city: "${user.city || ''}",
            isVerified: ${user.is_verified || 0}
          };
          console.log('User information embedded from server:', window.currentUser);
          
          // Load recent activities after page loads
          document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
              if (typeof window.loadRecentActivities === 'function') {
                window.loadRecentActivities();
              }
            }, 1000);
          });
        </script>
        <script src="/static/client-dashboard.js"></script>
        <script src="/static/client-job-progress.js"></script>
        <script>
          // Load job progress visualization on page load
          document.addEventListener('DOMContentLoaded', function() {
            console.log('Loading client job progress visualization');
            setTimeout(() => {
              loadClientJobsWithProgress();
            }, 500);
          });
        </script>
    </body>
    </html>
  `)
  
  } catch (error) {
    console.error('Client dashboard error:', error)
    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error - Kwikr Directory</title>
          <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 flex items-center justify-center min-h-screen">
          <div class="text-center">
              <h1 class="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h1>
              <p class="text-gray-600 mb-4">There was an error loading your dashboard.</p>
              <a href="/" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Back to Home</a>
          </div>
      </body>
      </html>
    `)
  }
})

// Worker Dashboard
// Worker subscription selection page (for workers without active subscription)
dashboardRoutes.get('/worker/select-plan', requireAuth, async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'worker') {
    return c.redirect('/dashboard')
  }
  
  // Check if worker already has active subscription (redirect if they do)
  const existingSubscription = await c.env.DB.prepare(`
    SELECT ws.*, sp.plan_name 
    FROM worker_subscriptions ws
    JOIN subscription_plans sp ON ws.plan_id = sp.id
    WHERE ws.user_id = ? AND ws.subscription_status = 'active'
  `).bind(user.user_id).first()
  
  if (existingSubscription) {
    return c.redirect('/dashboard/worker')
  }
  
  // Get all available subscription plans
  const plans = await c.env.DB.prepare(`
    SELECT * FROM subscription_plans 
    WHERE is_active = 1 
    ORDER BY monthly_price ASC
  `).all()

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Choose Your Subscription Plan - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-kwikr-green to-green-600 min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <h1 class="text-2xl font-bold text-kwikr-green">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </h1>
                        <span class="ml-4 text-gray-400">|</span>
                        <span class="ml-4 text-lg text-gray-600">Subscription Required</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-gray-600">Welcome, ${user.firstName}</span>
                        <a href="/api/auth/logout" class="text-gray-600 hover:text-gray-900">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a>
                    </div>
                </div>
            </div>
        </nav>

        <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-4xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-12">
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        <div class="flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle mr-3"></i>
                            <span class="font-medium">Subscription Required</span>
                        </div>
                        <p class="mt-2 text-sm">To access jobs and start earning on Kwikr Directory, you need to select a subscription plan.</p>
                    </div>
                    
                    <h1 class="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
                    <p class="text-xl text-green-100 mb-8">Start building your service business today</p>
                </div>

                <!-- Subscription Plans -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${(plans.results || []).map(plan => `
                        <div class="bg-white rounded-2xl shadow-xl p-8 ${plan.plan_name === 'Growth Plan' ? 'border-4 border-blue-500 transform scale-105' : ''}">
                            ${plan.plan_name === 'Growth Plan' ? '<div class="absolute -top-4 left-1/2 transform -translate-x-1/2"><span class="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span></div>' : ''}
                            
                            <div class="text-center">
                                <div class="text-${plan.plan_name === 'Pro Plan' ? 'purple' : plan.plan_name === 'Growth Plan' ? 'blue' : 'kwikr-green'}-500 text-4xl mb-4">
                                    <i class="fas fa-${plan.plan_name === 'Pro Plan' ? 'crown' : plan.plan_name === 'Growth Plan' ? 'chart-line' : 'rocket'}"></i>
                                </div>
                                <h3 class="text-2xl font-bold mb-2">${plan.plan_name}</h3>
                                <p class="text-gray-600 mb-6">${plan.description}</p>
                                <div class="mb-6">
                                    <span class="text-4xl font-bold text-${plan.plan_name === 'Pro Plan' ? 'purple' : plan.plan_name === 'Growth Plan' ? 'blue' : 'kwikr-green'}-600">$${plan.monthly_price}</span>
                                    <span class="text-gray-600">/month</span>
                                </div>
                            </div>
                            
                            <button onclick="selectPlan(${plan.id}, '${plan.plan_name}')" class="w-full bg-${plan.plan_name === 'Pro Plan' ? 'purple' : plan.plan_name === 'Growth Plan' ? 'blue' : 'kwikr-green'}-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-${plan.plan_name === 'Pro Plan' ? 'purple' : plan.plan_name === 'Growth Plan' ? 'blue' : 'kwikr-green'}-600 transition-colors">
                                ${plan.monthly_price > 0 ? 'Select Plan' : 'Start Free'}
                            </button>
                        </div>
                    `).join('')}
                </div>

                <!-- Additional Info -->
                <div class="mt-12 bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm text-center">
                    <h3 class="text-xl font-semibold text-white mb-4">
                        <i class="fas fa-info-circle mr-2"></i>Why Do I Need a Subscription?
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-green-100">
                        <div>
                            <i class="fas fa-briefcase text-2xl mb-2"></i>
                            <p class="font-medium mb-1">Access to Jobs</p>
                            <p class="text-sm">Browse and bid on available jobs in your area</p>
                        </div>
                        <div>
                            <i class="fas fa-tools text-2xl mb-2"></i>
                            <p class="font-medium mb-1">Professional Tools</p>
                            <p class="text-sm">Use our booking, payment, and communication tools</p>
                        </div>
                        <div>
                            <i class="fas fa-star text-2xl mb-2"></i>
                            <p class="font-medium mb-1">Build Your Reputation</p>
                            <p class="text-sm">Earn reviews and grow your service business</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            async function selectPlan(planId, planName) {
                if (confirm(\`Are you sure you want to select the \${planName}?\`)) {
                    try {
                        const response = await fetch('/api/subscriptions/subscribe', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                plan_id: planId,
                                billing_cycle: 'monthly'
                            })
                        });
                        
                        if (response.ok) {
                            const result = await response.json();
                            alert('Subscription activated successfully! Welcome to Kwikr Directory.');
                            window.location.href = '/dashboard/worker';
                        } else {
                            const error = await response.json();
                            alert('Error: ' + (error.error || 'Failed to activate subscription'));
                        }
                    } catch (error) {
                        console.error('Subscription error:', error);
                        alert('Error activating subscription. Please try again.');
                    }
                }
            }
        </script>
    </body>
    </html>
  `)
})

dashboardRoutes.get('/worker', requireAuth, requireWorkerSubscription, async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'worker') {
    return c.redirect('/dashboard')
  }

  // Fetch comprehensive worker profile data
  try {
    // Get worker profile information
    const worker = await c.env.DB.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(user.user_id).first()

    // Get worker services
    const services = await c.env.DB.prepare(`
      SELECT ws.*, jc.name as category_name, jc.icon_class
      FROM worker_services ws
      LEFT JOIN job_categories jc ON ws.category_id = jc.id
      WHERE ws.worker_id = ?
      ORDER BY ws.service_name
    `).bind(user.user_id).all()

    // Get worker stats
    const stats = {
      totalBids: Math.floor(Math.random() * 20) + 5,
      activeJobs: 0,
      avgRating: 4.7,
      totalEarnings: Math.floor(Math.random() * 20000) + 10000
    }

    const servicesData = services.results || []
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Worker Dashboard - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <h1 class="text-2xl font-bold text-kwikr-green">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <div id="verificationStatus" class="px-2 py-1 rounded-full text-xs font-medium">
                                <!-- Status will be loaded here -->
                            </div>
                        </div>
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
                <p class="text-gray-600">Manage your profile, services, compliance, and payments</p>
            </div>

            <!-- Tab Navigation -->
            <div class="bg-white rounded-lg shadow-sm mb-8">
                <div class="border-b border-gray-200">
                    <nav class="flex space-x-8 px-6" aria-label="Tabs">
                        <button id="viewTab" onclick="switchTab('view')" class="py-4 px-1 border-b-2 border-kwikr-green text-kwikr-green font-medium text-sm">
                            <i class="fas fa-user mr-2"></i>Profile View
                        </button>
                        <button id="editTab" onclick="switchTab('edit')" class="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                            <i class="fas fa-edit mr-2"></i>Edit Profile
                        </button>
                        <button id="paymentTab" onclick="switchTab('payment')" class="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                            <i class="fas fa-credit-card mr-2"></i>Payment Management
                        </button>
                        <button id="complianceTab" onclick="switchTab('compliance')" class="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                            <i class="fas fa-shield-check mr-2"></i>Manage Compliance
                        </button>
                        <button id="servicesTab" onclick="switchTab('services')" class="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                            <i class="fas fa-tools mr-2"></i>Manage Services
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="text-kwikr-green text-2xl mr-4">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="totalBids">${stats.totalBids}</p>
                            <p class="text-sm text-gray-600">Total Bids</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="text-blue-500 text-2xl mr-4">
                            <i class="fas fa-tools"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="activeJobs">${stats.activeJobs}</p>
                            <p class="text-sm text-gray-600">Active Jobs</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="text-yellow-500 text-2xl mr-4">
                            <i class="fas fa-star"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="avgRating">${stats.avgRating}</p>
                            <p class="text-sm text-gray-600">Avg Rating</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="text-green-500 text-2xl mr-4">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="totalEarnings">$${stats.totalEarnings.toLocaleString()}</p>
                            <p class="text-sm text-gray-600">Total Earnings</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Content Panels -->
            <!-- Profile View Tab (Default) -->
            <div id="profileViewPanel" class="tab-panel">
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <!-- Left Column - Services & About -->
                    <div class="lg:col-span-3 space-y-6">
                        <!-- Services Section -->
                        <div class="bg-white rounded-lg shadow-sm">
                            <div class="p-6 border-b border-gray-200">
                                <h2 class="text-xl font-semibold text-gray-900">Services Offered</h2>
                            </div>
                            <div class="p-6">
                                ${servicesData.length > 0 ? `
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        ${servicesData.map(service => `
                                            <div class="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-kwikr-green transition-all duration-300">
                                                <div class="flex items-center mb-4">
                                                    <div class="bg-kwikr-green bg-opacity-10 p-3 rounded-lg mr-4">
                                                        <i class="${service.icon_class || 'fas fa-tools'} text-kwikr-green text-xl"></i>
                                                    </div>
                                                    <div>
                                                        <h3 class="font-bold text-gray-900 text-lg">${service.service_name}</h3>
                                                        <p class="text-sm text-kwikr-green font-medium">${service.category_name || 'Professional Service'}</p>
                                                    </div>
                                                </div>
                                                <div class="mb-4">
                                                    <p class="text-gray-600 text-sm mb-2">${service.description || 'Professional service provided with attention to detail.'}</p>
                                                    <div class="flex justify-between items-center">
                                                        <span class="text-2xl font-bold text-kwikr-green">$${service.hourly_rate}/hr</span>
                                                        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Available</span>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div class="text-center py-12">
                                        <i class="fas fa-tools text-4xl text-gray-300 mb-4"></i>
                                        <h3 class="text-lg font-medium text-gray-900 mb-2">No Services Added Yet</h3>
                                        <p class="text-gray-500 mb-4">Add your services to start receiving job requests</p>
                                        <button onclick="switchTab('services')" class="bg-kwikr-green text-white px-6 py-2 rounded-lg hover:bg-green-600">
                                            <i class="fas fa-plus mr-2"></i>Add Your First Service
                                        </button>
                                    </div>
                                `}
                            </div>
                        </div>

                        <!-- About Section -->
                        <div class="bg-white rounded-lg shadow-sm">
                            <div class="p-6 border-b border-gray-200">
                                <h2 class="text-xl font-semibold text-gray-900">About ${worker?.first_name || user.first_name}</h2>
                            </div>
                            <div class="p-6">
                                <p class="text-gray-600 leading-relaxed mb-6">
                                    ${worker?.bio || 'Professional service provider committed to delivering high-quality work and excellent customer service.'}
                                </p>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 class="font-medium text-gray-900 mb-2">Contact Information</h4>
                                        <div class="space-y-2 text-sm">
                                            <div class="flex items-center text-gray-600">
                                                <i class="fas fa-envelope w-4 mr-2"></i>
                                                ${worker?.email || user.email}
                                            </div>
                                            <div class="flex items-center text-gray-600">
                                                <i class="fas fa-phone w-4 mr-2"></i>
                                                ${worker?.phone || 'Not provided'}
                                            </div>
                                            <div class="flex items-center text-gray-600">
                                                <i class="fas fa-map-marker-alt w-4 mr-2"></i>
                                                ${worker?.city || user.city}, ${worker?.province || user.province}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 class="font-medium text-gray-900 mb-2">Professional Info</h4>
                                        <div class="space-y-2 text-sm">
                                            <div class="flex items-center text-gray-600">
                                                <i class="fas fa-calendar w-4 mr-2"></i>
                                                Member since ${new Date(worker?.created_at || Date.now()).getFullYear()}
                                            </div>
                                            <div class="flex items-center text-gray-600">
                                                <i class="fas fa-star w-4 mr-2"></i>
                                                ${stats.avgRating} average rating
                                            </div>
                                            <div class="flex items-center text-gray-600">
                                                <i class="fas fa-handshake w-4 mr-2"></i>
                                                ${stats.totalBids} bids submitted
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column - Quick Actions -->
                    <div class="space-y-6">
                        <!-- Verification Status -->
                        <div class="bg-white rounded-lg shadow-sm p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-600">Identity Verified</span>
                                    <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        <i class="fas fa-check mr-1"></i>Verified
                                    </span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-600">Background Check</span>
                                    <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                        <i class="fas fa-clock mr-1"></i>Pending
                                    </span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-600">Insurance</span>
                                    <span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                        <i class="fas fa-times mr-1"></i>Required
                                    </span>
                                </div>
                                <button onclick="switchTab('compliance')" class="w-full mt-4 bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm">
                                    <i class="fas fa-shield-check mr-2"></i>Manage Compliance
                                </button>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="bg-white rounded-lg shadow-sm p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div class="space-y-3">
                                <button onclick="switchTab('edit')" class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kwikr-green hover:bg-green-50 block">
                                    <i class="fas fa-edit text-kwikr-green mr-3"></i>
                                    Edit Profile
                                </button>
                                <button onclick="switchTab('services')" class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kwikr-green hover:bg-green-50 block">
                                    <i class="fas fa-tools text-kwikr-green mr-3"></i>
                                    Manage Services
                                </button>
                                <button onclick="switchTab('payment')" class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kwikr-green hover:bg-green-50 block">
                                    <i class="fas fa-credit-card text-kwikr-green mr-3"></i>
                                    Payment Settings
                                </button>
                                <a href="/dashboard/worker/jobs" class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kwikr-green hover:bg-green-50 block">
                                    <i class="fas fa-briefcase text-kwikr-green mr-3"></i>
                                    Browse Jobs
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Profile Tab -->
            <div id="profileEditPanel" class="tab-panel hidden">
                <div class="bg-white rounded-lg shadow-sm">
                    <div class="p-6 border-b border-gray-200">
                        <h2 class="text-xl font-semibold text-gray-900">Edit Profile</h2>
                        <p class="text-gray-600">Update your professional information</p>
                    </div>
                    <div class="p-6">
                        <form id="profileEditForm" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <input type="text" id="firstName" value="${worker?.first_name || user.first_name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <input type="text" id="lastName" value="${worker?.last_name || user.last_name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input type="email" id="email" value="${worker?.email || user.email}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <input type="tel" id="phone" value="${worker?.phone || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <input type="text" id="city" value="${worker?.city || user.city}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Province</label>
                                    <select id="province" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green">
                                        <option value="ON" ${(worker?.province || user.province) === 'ON' ? 'selected' : ''}>Ontario</option>
                                        <option value="BC" ${(worker?.province || user.province) === 'BC' ? 'selected' : ''}>British Columbia</option>
                                        <option value="AB" ${(worker?.province || user.province) === 'AB' ? 'selected' : ''}>Alberta</option>
                                        <option value="MB" ${(worker?.province || user.province) === 'MB' ? 'selected' : ''}>Manitoba</option>
                                        <option value="SK" ${(worker?.province || user.province) === 'SK' ? 'selected' : ''}>Saskatchewan</option>
                                        <option value="QC" ${(worker?.province || user.province) === 'QC' ? 'selected' : ''}>Quebec</option>
                                        <option value="NB" ${(worker?.province || user.province) === 'NB' ? 'selected' : ''}>New Brunswick</option>
                                        <option value="NS" ${(worker?.province || user.province) === 'NS' ? 'selected' : ''}>Nova Scotia</option>
                                        <option value="PE" ${(worker?.province || user.province) === 'PE' ? 'selected' : ''}>Prince Edward Island</option>
                                        <option value="NL" ${(worker?.province || user.province) === 'NL' ? 'selected' : ''}>Newfoundland and Labrador</option>
                                        <option value="NT" ${(worker?.province || user.province) === 'NT' ? 'selected' : ''}>Northwest Territories</option>
                                        <option value="NU" ${(worker?.province || user.province) === 'NU' ? 'selected' : ''}>Nunavut</option>
                                        <option value="YT" ${(worker?.province || user.province) === 'YT' ? 'selected' : ''}>Yukon</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
                                <textarea id="bio" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" placeholder="Tell potential clients about your experience and expertise...">${worker?.bio || ''}</textarea>
                            </div>
                            
                            <div class="flex justify-end space-x-4">
                                <button type="button" onclick="switchTab('view')" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" class="bg-kwikr-green text-white px-6 py-2 rounded-lg hover:bg-green-600">
                                    <i class="fas fa-save mr-2"></i>Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Payment Management Tab -->
            <div id="paymentPanel" class="tab-panel hidden">
                <div class="space-y-6">
                    <!-- Payment Methods -->
                    <div class="bg-white rounded-lg shadow-sm">
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-xl font-semibold text-gray-900">Payment Methods</h2>
                            <p class="text-gray-600">Manage how you receive payments</p>
                        </div>
                        <div class="p-6">
                            <div class="space-y-4">
                                <div class="border border-gray-200 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center">
                                            <i class="fas fa-university text-kwikr-green text-xl mr-3"></i>
                                            <div>
                                                <h4 class="font-medium text-gray-900">Direct Bank Transfer</h4>
                                                <p class="text-sm text-gray-600">****1234 - Primary Account</p>
                                            </div>
                                        </div>
                                        <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Active</span>
                                    </div>
                                </div>
                                
                                <button class="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-kwikr-green hover:text-kwikr-green transition-colors">
                                    <i class="fas fa-plus mr-2"></i>Add Payment Method
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Earnings Overview -->
                    <div class="bg-white rounded-lg shadow-sm">
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-xl font-semibold text-gray-900">Earnings Overview</h2>
                        </div>
                        <div class="p-6">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-kwikr-green">$${stats.totalEarnings.toLocaleString()}</div>
                                    <div class="text-sm text-gray-600">Total Earnings</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-blue-600">$${Math.floor(stats.totalEarnings * 0.15).toLocaleString()}</div>
                                    <div class="text-sm text-gray-600">This Month</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-purple-600">$${Math.floor(stats.totalEarnings * 0.05).toLocaleString()}</div>
                                    <div class="text-sm text-gray-600">Pending</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Transactions -->
                    <div class="bg-white rounded-lg shadow-sm">
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                        </div>
                        <div class="p-6">
                            <div class="space-y-3">
                                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div>
                                        <div class="font-medium text-gray-900">Kitchen Cleaning - Job #12345</div>
                                        <div class="text-sm text-gray-600">March 15, 2024</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-bold text-green-600">+$150.00</div>
                                        <div class="text-xs text-green-600">Completed</div>
                                    </div>
                                </div>
                                
                                <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                    <div>
                                        <div class="font-medium text-gray-900">Bathroom Deep Clean - Job #12344</div>
                                        <div class="text-sm text-gray-600">March 12, 2024</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-bold text-yellow-600">$200.00</div>
                                        <div class="text-xs text-yellow-600">Pending</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Compliance Management Tab -->
            <div id="compliancePanel" class="tab-panel hidden">
                <div class="space-y-6">
                    <!-- Verification Status -->
                    <div class="bg-white rounded-lg shadow-sm">
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-xl font-semibold text-gray-900">Compliance Status</h2>
                            <p class="text-gray-600">Manage your verification documents and compliance requirements</p>
                        </div>
                        <div class="p-6">
                            <div class="space-y-4">
                                <!-- Identity Verification -->
                                <div class="border border-gray-200 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center">
                                            <i class="fas fa-id-card text-kwikr-green text-xl mr-3"></i>
                                            <div>
                                                <h4 class="font-medium text-gray-900">Identity Verification</h4>
                                                <p class="text-sm text-gray-600">Government-issued photo ID required</p>
                                            </div>
                                        </div>
                                        <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                            <i class="fas fa-check mr-1"></i>Verified
                                        </span>
                                    </div>
                                </div>

                                <!-- Background Check -->
                                <div class="border border-gray-200 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center">
                                            <i class="fas fa-shield-alt text-yellow-500 text-xl mr-3"></i>
                                            <div>
                                                <h4 class="font-medium text-gray-900">Background Check</h4>
                                                <p class="text-sm text-gray-600">Criminal background verification</p>
                                            </div>
                                        </div>
                                        <span class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                                            <i class="fas fa-clock mr-1"></i>In Review
                                        </span>
                                    </div>
                                    <div class="mt-3 text-sm text-gray-600">
                                        Background check submitted on March 10, 2024. Processing typically takes 3-5 business days.
                                    </div>
                                </div>

                                <!-- Insurance -->
                                <div class="border border-red-200 rounded-lg p-4 bg-red-50">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center">
                                            <i class="fas fa-shield-check text-red-500 text-xl mr-3"></i>
                                            <div>
                                                <h4 class="font-medium text-gray-900">Liability Insurance</h4>
                                                <p class="text-sm text-gray-600">Professional liability insurance certificate</p>
                                            </div>
                                        </div>
                                        <span class="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                                            <i class="fas fa-exclamation mr-1"></i>Required
                                        </span>
                                    </div>
                                    <div class="mt-3">
                                        <button class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">
                                            <i class="fas fa-upload mr-2"></i>Upload Insurance Certificate
                                        </button>
                                    </div>
                                </div>

                                <!-- Certifications -->
                                <div class="border border-gray-200 rounded-lg p-4">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center">
                                            <i class="fas fa-certificate text-purple-500 text-xl mr-3"></i>
                                            <div>
                                                <h4 class="font-medium text-gray-900">Professional Certifications</h4>
                                                <p class="text-sm text-gray-600">Industry-specific certifications (optional)</p>
                                            </div>
                                        </div>
                                        <button class="text-kwikr-green hover:text-green-700">
                                            <i class="fas fa-plus mr-1"></i>Add Certification
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Services Management Tab -->
            <div id="servicesPanel" class="tab-panel hidden">
                <div class="bg-white rounded-lg shadow-sm">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <div>
                                <h2 class="text-xl font-semibold text-gray-900">Manage Services</h2>
                                <p class="text-gray-600">Add and manage the services you offer</p>
                            </div>
                            <button onclick="showAddServiceForm()" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                <i class="fas fa-plus mr-2"></i>Add Service
                            </button>
                        </div>
                    </div>
                    <div class="p-6">
                        ${servicesData.length > 0 ? `
                            <div class="space-y-4">
                                ${servicesData.map(service => `
                                    <div class="border border-gray-200 rounded-lg p-4">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center">
                                                <i class="${service.icon_class || 'fas fa-tools'} text-kwikr-green text-xl mr-3"></i>
                                                <div>
                                                    <h4 class="font-medium text-gray-900">${service.service_name}</h4>
                                                    <p class="text-sm text-gray-600">${service.category_name || 'Professional Service'}</p>
                                                    <p class="text-sm text-kwikr-green font-medium">$${service.hourly_rate}/hr</p>
                                                </div>
                                            </div>
                                            <div class="flex items-center space-x-2">
                                                <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Active</span>
                                                <button onclick="editService(${service.id})" class="text-gray-500 hover:text-gray-700">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button onclick="deleteService(${service.id})" class="text-red-500 hover:text-red-700">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                        ${service.description ? `
                                            <div class="mt-3 text-sm text-gray-600">
                                                ${service.description}
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="text-center py-12">
                                <i class="fas fa-tools text-4xl text-gray-300 mb-4"></i>
                                <h3 class="text-lg font-medium text-gray-900 mb-2">No Services Added Yet</h3>
                                <p class="text-gray-500 mb-4">Add your first service to start receiving job requests</p>
                                <button onclick="showAddServiceForm()" class="bg-kwikr-green text-white px-6 py-2 rounded-lg hover:bg-green-600">
                                    <i class="fas fa-plus mr-2"></i>Add Your First Service
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Service Modal -->
        <div id="addServiceModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white rounded-lg max-w-lg w-full mx-4">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-bold text-gray-900">Add New Service</h3>
                        <button onclick="closeAddServiceModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                
                <form id="addServiceForm" onsubmit="submitAddService(event)">
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                            <input type="text" id="serviceName" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" 
                                   required placeholder="e.g., Deep Cleaning">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select id="serviceCategory" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" required>
                                <option value="">Select Category</option>
                                <option value="1">Cleaning Services</option>
                                <option value="2">Handyman Services</option>
                                <option value="3">Maintenance Services</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($)</label>
                            <input type="number" id="serviceRate" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" 
                                   required placeholder="35" min="10" step="5">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Service Description</label>
                            <textarea id="serviceDescription" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" 
                                      placeholder="Describe what this service includes..."></textarea>
                        </div>
                    </div>
                    
                    <div class="p-6 border-t border-gray-200 flex justify-end space-x-3">
                        <button type="button" onclick="closeAddServiceModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                            <i class="fas fa-plus mr-2"></i>Add Service
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
          // Embed user information directly from server-side session
          window.currentUser = {
            id: ${user.user_id},
            email: "${user.email}",
            role: "${user.role}",
            firstName: "${user.first_name}",
            lastName: "${user.last_name}",
            province: "${user.province || ''}",
            city: "${user.city || ''}",
            isVerified: ${user.is_verified || 0}
          };
          console.log('Worker Dashboard: User information embedded from server:', window.currentUser);
          
          // Tab switching functionality
          function switchTab(tabName) {
            console.log('Switching to tab:', tabName);
            
            // Hide all tab panels
            const panels = ['profileViewPanel', 'profileEditPanel', 'paymentPanel', 'compliancePanel', 'servicesPanel'];
            panels.forEach(panelId => {
              const panel = document.getElementById(panelId);
              if (panel) {
                panel.classList.add('hidden');
                panel.classList.remove('tab-panel');
              }
            });
            
            // Show selected panel
            const targetPanel = tabName === 'view' ? 'profileViewPanel' :
                              tabName === 'edit' ? 'profileEditPanel' :
                              tabName === 'payment' ? 'paymentPanel' :
                              tabName === 'compliance' ? 'compliancePanel' :
                              tabName === 'services' ? 'servicesPanel' : 'profileViewPanel';
            
            const panel = document.getElementById(targetPanel);
            if (panel) {
              panel.classList.remove('hidden');
              panel.classList.add('tab-panel');
            }
            
            // Update tab button styles
            const tabs = ['viewTab', 'editTab', 'paymentTab', 'complianceTab', 'servicesTab'];
            tabs.forEach(tabId => {
              const tab = document.getElementById(tabId);
              if (tab) {
                tab.className = 'py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm';
              }
            });
            
            // Activate selected tab
            const activeTabId = tabName === 'view' ? 'viewTab' :
                               tabName === 'edit' ? 'editTab' :
                               tabName === 'payment' ? 'paymentTab' :
                               tabName === 'compliance' ? 'complianceTab' :
                               tabName === 'services' ? 'servicesTab' : 'viewTab';
            
            const activeTab = document.getElementById(activeTabId);
            if (activeTab) {
              activeTab.className = 'py-4 px-1 border-b-2 border-kwikr-green text-kwikr-green font-medium text-sm';
            }
          }
          
          // Add Service Modal Functions
          function showAddServiceForm() {
            document.getElementById('addServiceModal').classList.remove('hidden');
          }
          
          function closeAddServiceModal() {
            document.getElementById('addServiceModal').classList.add('hidden');
            document.getElementById('addServiceForm').reset();
          }
          
          async function submitAddService(event) {
            event.preventDefault();
            
            const formData = {
              service_name: document.getElementById('serviceName').value,
              category_id: document.getElementById('serviceCategory').value,
              hourly_rate: document.getElementById('serviceRate').value,
              description: document.getElementById('serviceDescription').value
            };
            
            try {
              const response = await fetch('/api/worker/services', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
              });
              
              if (response.ok) {
                closeAddServiceModal();
                // Refresh the services panel
                window.location.reload();
              } else {
                alert('Error adding service. Please try again.');
              }
            } catch (error) {
              console.error('Error adding service:', error);
              alert('Error adding service. Please try again.');
            }
          }
          
          // Profile Edit Form Handler
          document.getElementById('profileEditForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
              first_name: document.getElementById('firstName').value,
              last_name: document.getElementById('lastName').value,
              email: document.getElementById('email').value,
              phone: document.getElementById('phone').value,
              city: document.getElementById('city').value,
              province: document.getElementById('province').value,
              bio: document.getElementById('bio').value
            };
            
            try {
              const response = await fetch('/api/worker/profile', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
              });
              
              if (response.ok) {
                alert('Profile updated successfully!');
                switchTab('view');
                // Optionally refresh the page to show updated data
                window.location.reload();
              } else {
                alert('Error updating profile. Please try again.');
              }
            } catch (error) {
              console.error('Error updating profile:', error);
              alert('Error updating profile. Please try again.');
            }
          });
          
          // Initialize dashboard - show profile view tab by default
          document.addEventListener('DOMContentLoaded', function() {
            switchTab('view');
          });
          
          console.log('Worker Dashboard: JavaScript setup complete');
        </script>
    </body>
    </html>
  `)
  
  } catch (error) {
    console.error('Worker dashboard error:', error)
    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error - Kwikr Directory</title>
          <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 flex items-center justify-center min-h-screen">
          <div class="text-center">
              <h1 class="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h1>
              <p class="text-gray-600 mb-4">There was an error loading your dashboard.</p>
              <a href="/" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Back to Home</a>
          </div>
      </body>
      </html>
    `)
  }
})

// Admin Dashboard
dashboardRoutes.get('/admin', requireAuth, async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'admin') {
    return c.redirect('/dashboard')
  }
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Dashboard - Real-time Analytics & Management Portal</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          .loading-spinner { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .metric-card { transition: all 0.3s ease; }
          .metric-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
          .activity-item { transition: background-color 0.2s ease; }
          .realtime-indicator { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        </style>
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <h1 class="text-2xl font-bold text-kwikr-green">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory Admin
                        </h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Loading Indicator -->
        <div id="loading-indicator" class="fixed top-0 left-0 right-0 bg-kwikr-green text-white text-center py-2 z-50" style="display: none;">
            <i class="fas fa-spinner loading-spinner mr-2"></i>
            Updating dashboard...
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Enhanced Header with Real-time Controls -->
            <div class="mb-8">
                <div class="flex justify-between items-start">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 flex items-center">
                            Admin Dashboard
                            <div class="ml-4 flex items-center">
                                <div class="w-3 h-3 bg-green-400 rounded-full realtime-indicator mr-2"></div>
                                <span class="text-sm font-normal text-green-600">Live</span>
                            </div>
                        </h1>
                        <p class="text-gray-600 mt-2">Real-time platform management and comprehensive analytics</p>
                        <p class="text-xs text-gray-500 mt-1" id="last-refresh-time">Last updated: Loading...</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <div class="flex items-center">
                            <label class="text-sm text-gray-600 mr-2">Auto-refresh</label>
                            <input type="checkbox" id="autoRefreshToggle" checked class="w-4 h-4 text-kwikr-green border-gray-300 rounded focus:ring-kwikr-green">
                        </div>
                        <button id="refreshDashboard" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center">
                            <i class="fas fa-sync-alt mr-2"></i>Refresh
                        </button>
                        <div id="system-health" class="bg-white px-4 py-2 rounded-lg border">
                            <div class="flex items-center">
                                <div class="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                                <span class="text-xs text-gray-500">Checking...</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Today's Activity Summary -->
                <div class="mt-6 bg-gradient-to-r from-kwikr-green to-green-600 text-white rounded-lg p-4">
                    <h3 class="font-semibold mb-3 flex items-center">
                        <i class="fas fa-calendar-day mr-2"></i>Today's Activity
                    </h3>
                    <div id="today-activity" class="text-sm">
                        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <div class="text-center">
                                <div class="text-lg font-bold">-</div>
                                <div class="text-xs opacity-90">Loading...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Enhanced Platform Stats with Real-time Updates -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow-sm metric-card border-l-4 border-blue-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="active-users">-</p>
                            <p class="text-sm text-gray-600">Active Users</p>
                            <p class="text-xs text-blue-600 mt-1">↗ Real-time</p>
                        </div>
                        <div class="text-blue-500 text-3xl">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm metric-card border-l-4 border-kwikr-green">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="open-jobs">-</p>
                            <p class="text-sm text-gray-600">Open Jobs</p>
                            <p class="text-xs text-kwikr-green mt-1">↗ Live count</p>
                        </div>
                        <div class="text-kwikr-green text-3xl">
                            <i class="fas fa-briefcase"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm metric-card border-l-4 border-purple-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="total-revenue">-</p>
                            <p class="text-sm text-gray-600">Total Revenue</p>
                            <p class="text-xs text-purple-600 mt-1">↗ Platform earnings</p>
                        </div>
                        <div class="text-purple-500 text-3xl">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm metric-card border-l-4 border-red-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="active-disputes">-</p>
                            <p class="text-sm text-gray-600">Active Disputes</p>
                            <p class="text-xs text-red-600 mt-1">↗ Needs attention</p>
                        </div>
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                    </div>
                </div>
                
                <!-- Second row of metrics -->
                <div class="bg-white p-6 rounded-lg shadow-sm metric-card border-l-4 border-yellow-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="pending-documents">-</p>
                            <p class="text-sm text-gray-600">Pending Documents</p>
                            <p class="text-xs text-yellow-600 mt-1">↗ Awaiting review</p>
                        </div>
                        <div class="text-yellow-500 text-3xl">
                            <i class="fas fa-file-alt"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm metric-card border-l-4 border-indigo-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="active-workers">-</p>
                            <p class="text-sm text-gray-600">Active Workers</p>
                            <p class="text-xs text-indigo-600 mt-1">↗ Verified providers</p>
                        </div>
                        <div class="text-indigo-500 text-3xl">
                            <i class="fas fa-hard-hat"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm metric-card border-l-4 border-green-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="completed-jobs">-</p>
                            <p class="text-sm text-gray-600">Completed Jobs</p>
                            <p class="text-xs text-green-600 mt-1">↗ Platform success</p>
                        </div>
                        <div class="text-green-500 text-3xl">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm metric-card border-l-4 border-pink-500">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="verified-users">-</p>
                            <p class="text-sm text-gray-600">Verified Users</p>
                            <p class="text-xs text-pink-600 mt-1">↗ Quality assurance</p>
                        </div>
                        <div class="text-pink-500 text-3xl">
                            <i class="fas fa-shield-check"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Real-time Analytics & Performance Section -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <!-- Performance Metrics -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                            <i class="fas fa-tachometer-alt text-kwikr-green mr-2"></i>
                            Performance Metrics
                        </h3>
                        <div class="w-2 h-2 bg-green-400 rounded-full realtime-indicator"></div>
                    </div>
                    <div id="performance-metrics">
                        <div class="text-center py-4 text-gray-500">
                            <i class="fas fa-spinner loading-spinner text-lg mb-2"></i>
                            <p class="text-sm">Loading performance data...</p>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity Feed -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                            <i class="fas fa-stream text-blue-600 mr-2"></i>
                            Recent Activity
                        </h3>
                        <div class="w-2 h-2 bg-blue-400 rounded-full realtime-indicator"></div>
                    </div>
                    <div id="activity-feed" class="space-y-3 max-h-64 overflow-y-auto">
                        <div class="text-center py-4 text-gray-500">
                            <i class="fas fa-spinner loading-spinner text-lg mb-2"></i>
                            <p class="text-sm">Loading recent activity...</p>
                        </div>
                    </div>
                </div>

                <!-- Geographic Distribution -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                            <i class="fas fa-map-marked-alt text-purple-600 mr-2"></i>
                            Geographic Data
                        </h3>
                        <div class="w-2 h-2 bg-purple-400 rounded-full realtime-indicator"></div>
                    </div>
                    <div id="geographic-distribution" class="space-y-2 max-h-64 overflow-y-auto">
                        <div class="text-center py-4 text-gray-500">
                            <i class="fas fa-spinner loading-spinner text-lg mb-2"></i>
                            <p class="text-sm">Loading geographic data...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Interactive Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- User Growth Chart -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                            <i class="fas fa-chart-line text-green-600 mr-2"></i>
                            User Growth Trend
                        </h3>
                        <div class="text-xs text-gray-500">Last 7 days</div>
                    </div>
                    <div class="relative h-64">
                        <canvas id="userGrowthChart"></canvas>
                    </div>
                </div>

                <!-- Revenue Analytics Chart -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                            <i class="fas fa-chart-bar text-purple-600 mr-2"></i>
                            Revenue Analytics
                        </h3>
                        <div class="text-xs text-gray-500">Last 7 days</div>
                    </div>
                    <div class="relative h-64">
                        <canvas id="revenueChart"></canvas>
                    </div>
                </div>

                <!-- Performance Distribution Chart -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                            <i class="fas fa-chart-pie text-yellow-600 mr-2"></i>
                            Job Status Distribution
                        </h3>
                        <div class="text-xs text-gray-500">Current status</div>
                    </div>
                    <div class="relative h-64">
                        <canvas id="performanceChart"></canvas>
                    </div>
                </div>

                <!-- Geographic Chart -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                            <i class="fas fa-map-marker-alt text-red-600 mr-2"></i>
                            User Distribution by Province
                        </h3>
                        <div class="text-xs text-gray-500">Active users</div>
                    </div>
                    <div class="relative h-64">
                        <canvas id="geographicChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Business Intelligence Summary -->
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold flex items-center">
                        <i class="fas fa-brain mr-3"></i>
                        Business Intelligence Insights
                    </h3>
                    <button onclick="refreshBusinessIntelligence()" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors">
                        <i class="fas fa-refresh mr-2"></i>Refresh Insights
                    </button>
                </div>
                <div id="business-intelligence-summary" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold">-</div>
                        <div class="text-sm opacity-90">Growth Rate</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold">-</div>
                        <div class="text-sm opacity-90">Completion Rate</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold">-</div>
                        <div class="text-sm opacity-90">Customer Satisfaction</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold">-</div>
                        <div class="text-sm opacity-90">Market Health</div>
                    </div>
                </div>
            </div>

            <!-- Main Content Tabs -->
            <div class="bg-white rounded-lg shadow-sm">
                <div class="border-b border-gray-200">
                    <nav class="flex">
                        <button onclick="showTab('overview', this)" class="admin-tab active px-6 py-3 border-b-2 border-kwikr-green text-kwikr-green font-medium">
                            Overview
                        </button>
                        <button onclick="showTab('users', this)" class="admin-tab px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                            Users
                        </button>
                        <button onclick="showTab('compliance', this)" class="admin-tab px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                            Compliance
                        </button>
                        <button onclick="showTab('disputes', this)" class="admin-tab px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                            Disputes
                        </button>
                        <button onclick="showTab('analytics', this)" class="admin-tab px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                            Analytics
                        </button>
                    </nav>
                </div>

                <!-- Tab Content -->
                <div class="p-6">
                    <!-- Overview Tab -->
                    <div id="overviewTab" class="tab-content">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 class="font-medium text-gray-900 mb-3">Recent Jobs</h4>
                                <div id="recentJobs" class="space-y-3">
                                    <div class="text-center text-gray-500 py-8">
                                        <i class="fas fa-spinner fa-spin text-2xl mb-4"></i>
                                        <p>Loading recent jobs...</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 class="font-medium text-gray-900 mb-3">System Status</h4>
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span class="text-sm font-medium">Payment Processing</span>
                                        <span class="text-green-600"><i class="fas fa-check-circle"></i> Active</span>
                                    </div>
                                    <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span class="text-sm font-medium">New Registrations</span>
                                        <span class="text-green-600"><i class="fas fa-check-circle"></i> Active</span>
                                    </div>
                                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span class="text-sm font-medium">Maintenance Mode</span>
                                        <span class="text-gray-600"><i class="fas fa-times-circle"></i> Inactive</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Users Tab -->
                    <div id="usersTab" class="tab-content hidden">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">User Management</h3>
                            <div class="flex space-x-2">
                                <select id="userRoleFilter" class="border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="">All Roles</option>
                                    <option value="client">Clients</option>
                                    <option value="worker">Workers</option>
                                </select>
                                <button onclick="loadUsers()" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                    <i class="fas fa-refresh"></i>
                                </button>
                            </div>
                        </div>
                        <div id="usersList">
                            <div class="text-center text-gray-500 py-8">
                                <i class="fas fa-spinner fa-spin text-2xl mb-4"></i>
                                <p>Loading users...</p>
                            </div>
                        </div>
                    </div>

                    <!-- Compliance Tab -->
                    <div id="complianceTab" class="tab-content hidden">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">Worker Compliance Review</h3>
                            <button onclick="loadCompliance()" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                <i class="fas fa-refresh"></i>
                            </button>
                        </div>
                        <div id="complianceList">
                            <div class="text-center text-gray-500 py-8">
                                <i class="fas fa-spinner fa-spin text-2xl mb-4"></i>
                                <p>Loading compliance reviews...</p>
                            </div>
                        </div>
                    </div>

                    <!-- Disputes Tab -->
                    <div id="disputesTab" class="tab-content hidden">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">Dispute Management</h3>
                            <button onclick="loadDisputes()" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                <i class="fas fa-refresh"></i>
                            </button>
                        </div>
                        <div id="disputesList">
                            <div class="text-center text-gray-500 py-8">
                                <i class="fas fa-spinner fa-spin text-2xl mb-4"></i>
                                <p>Loading disputes...</p>
                            </div>
                        </div>
                    </div>

                    <!-- Analytics Tab -->
                    <div id="analyticsTab" class="tab-content hidden">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Analytics & Reports</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="border border-gray-200 rounded-lg p-6">
                                <h4 class="font-medium text-gray-900 mb-3">Export Data</h4>
                                <div class="space-y-3">
                                    <button onclick="exportJobs()" class="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                        <i class="fas fa-download text-kwikr-green mr-3"></i>
                                        Export Jobs Data (CSV)
                                    </button>
                                    <button onclick="exportUsers()" class="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                        <i class="fas fa-download text-kwikr-green mr-3"></i>
                                        Export Users Data (CSV)
                                    </button>
                                </div>
                            </div>
                            <div class="border border-gray-200 rounded-lg p-6">
                                <h4 class="font-medium text-gray-900 mb-3">Platform Statistics</h4>
                                <div id="platformStats" class="space-y-3">
                                    <div class="text-center text-gray-500">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        <p class="text-sm mt-2">Loading statistics...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
          // Embed user information directly from server-side session
          window.currentUser = {
            id: ${user.user_id || 3},
            email: "${user.email || 'demo.admin@kwikr.ca'}",
            role: "${user.role || 'admin'}",
            firstName: "${user.first_name || 'Demo'}",
            lastName: "${user.last_name || 'Admin'}",
            province: "${user.province || ''}",
            city: "${user.city || ''}",
            isVerified: ${user.is_verified || 1}
          };
          console.log('Admin user information embedded from server:', window.currentUser);
          
          // Test if JavaScript is executing at all
          console.log('ADMIN DASHBOARD: JavaScript is executing!');
          
          // Set proper page title
          document.title = 'Admin Dashboard - Kwikr Directory';
          
          // JavaScript working indicator removed to avoid obstructing the view
          
          // Set initial stats immediately to test
          setTimeout(function() {
            console.log('ADMIN DASHBOARD: Setting demo stats...');
            var totalUsersEl = document.getElementById('totalUsers');
            var totalJobsEl = document.getElementById('totalJobs');
            var pendingEl = document.getElementById('pendingCompliance');
            var disputesEl = document.getElementById('activeDisputes');
            
            if (totalUsersEl) {
              totalUsersEl.textContent = '2,847';
              console.log('Set total users');
            }
            if (totalJobsEl) {
              totalJobsEl.textContent = '1,356';
              console.log('Set total jobs');
            }
            if (pendingEl) {
              pendingEl.textContent = '12';
              console.log('Set pending compliance');
            }
            if (disputesEl) {
              disputesEl.textContent = '3';
              console.log('Set active disputes');
            }
            
            // Test recent jobs
            var recentJobsEl = document.getElementById('recentJobs');
            if (recentJobsEl) {
              recentJobsEl.innerHTML = \`
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div class="flex-1">
                      <h4 class="text-sm font-medium text-gray-900">Kitchen Deep Cleaning</h4>
                      <p class="text-xs text-gray-600">Cleaning Services</p>
                      <p class="text-xs text-gray-500">2 days ago</p>
                    </div>
                    <div class="text-right">
                      <span class="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">In Progress</span>
                      <div class="text-xs text-gray-600 mt-1">$120 - $180</div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div class="flex-1">
                      <h4 class="text-sm font-medium text-gray-900">Bathroom Renovation</h4>
                      <p class="text-xs text-gray-600">Handyman Services</p>
                      <p class="text-xs text-gray-500">5 days ago</p>
                    </div>
                    <div class="text-right">
                      <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Assigned</span>
                      <div class="text-xs text-gray-600 mt-1">$800 - $1,200</div>
                    </div>
                  </div>
                </div>
              \`;
              console.log('Set recent jobs');
            }
          }, 1000);
          
          // Global function for tab switching - embedded directly
          window.showTab = function(tabName, clickedElement) {
            console.log('ADMIN DASHBOARD: Switching to tab:', tabName);
            
            try {
              // Hide all tab contents
              var tabContents = document.querySelectorAll('.tab-content');
              console.log('Found tab contents:', tabContents.length);
              for (var i = 0; i < tabContents.length; i++) {
                tabContents[i].classList.add('hidden');
              }
              
              // Remove active class from all tabs
              var tabs = document.querySelectorAll('.admin-tab');
              console.log('Found admin tabs:', tabs.length);
              for (var i = 0; i < tabs.length; i++) {
                tabs[i].classList.remove('border-kwikr-green', 'text-kwikr-green');
                tabs[i].classList.add('border-transparent', 'text-gray-500');
              }
              
              // Show selected tab content
              var selectedTab = document.getElementById(tabName + 'Tab');
              if (selectedTab) {
                selectedTab.classList.remove('hidden');
                console.log('Showed tab:', tabName + 'Tab');
              } else {
                console.error('Tab not found:', tabName + 'Tab');
              }
              
              // Find and activate the clicked button
              var clickedButton = clickedElement || window.event?.target;
              if (!clickedButton) {
                // Fallback: find the button by its onclick content
                var allButtons = document.querySelectorAll('.admin-tab');
                for (var i = 0; i < allButtons.length; i++) {
                  if (allButtons[i].getAttribute('onclick')?.includes(tabName)) {
                    clickedButton = allButtons[i];
                    break;
                  }
                }
              }
              
              if (clickedButton) {
                clickedButton.classList.remove('border-transparent', 'text-gray-500');
                clickedButton.classList.add('border-kwikr-green', 'text-kwikr-green');
                console.log('Activated button for tab:', tabName);
              }
              
              // Load tab-specific demo data
              if (tabName === 'users') {
                setTimeout(function() {
                  var usersList = document.getElementById('usersList');
                  if (usersList) {
                    usersList.innerHTML = \`
                      <div class="space-y-3">
                        <div class="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                          <div class="flex-1">
                            <h4 class="text-sm font-medium text-gray-900">Jennifer Lopez</h4>
                            <p class="text-sm text-gray-600">jennifer.l@email.com</p>
                            <p class="text-xs text-gray-500">client • Toronto, ON</p>
                          </div>
                          <div class="text-right">
                            <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Verified</span>
                          </div>
                        </div>
                        <div class="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                          <div class="flex-1">
                            <h4 class="text-sm font-medium text-gray-900">Sarah Mitchell</h4>
                            <p class="text-sm text-gray-600">sarah.m@cleanpro.ca</p>
                            <p class="text-xs text-gray-500">worker • Calgary, AB</p>
                          </div>
                          <div class="text-right">
                            <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Verified</span>
                          </div>
                        </div>
                      </div>
                    \`;
                    console.log('Loaded users data');
                  }
                }, 500);
              } else if (tabName === 'compliance') {
                setTimeout(function() {
                  var complianceList = document.getElementById('complianceList');
                  if (complianceList) {
                    complianceList.innerHTML = \`
                      <div class="space-y-3">
                        <div class="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                          <div class="flex-1">
                            <h4 class="text-sm font-medium text-gray-900">Sarah Mitchell - Insurance Verification</h4>
                            <p class="text-sm text-gray-600">Submitted 2 days ago</p>
                          </div>
                          <div class="text-right">
                            <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending Review</span>
                          </div>
                        </div>
                        <div class="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                          <div class="flex-1">
                            <h4 class="text-sm font-medium text-gray-900">James Wilson - Background Check</h4>
                            <p class="text-sm text-gray-600">Submitted 5 days ago</p>
                          </div>
                          <div class="text-right">
                            <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Approved</span>
                          </div>
                        </div>
                      </div>
                    \`;
                    console.log('Loaded compliance data');
                  }
                }, 500);
              } else if (tabName === 'disputes') {
                setTimeout(function() {
                  var disputesList = document.getElementById('disputesList');
                  if (disputesList) {
                    disputesList.innerHTML = \`
                      <div class="space-y-3">
                        <div class="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                          <div class="flex-1">
                            <h4 class="text-sm font-medium text-gray-900">Kitchen Cleaning Service Dispute</h4>
                            <p class="text-sm text-gray-600">Jennifer L. vs Sarah M. • $150</p>
                            <p class="text-xs text-gray-500">Work quality dispute</p>
                          </div>
                          <div class="text-right">
                            <span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Open</span>
                          </div>
                        </div>
                        <div class="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                          <div class="flex-1">
                            <h4 class="text-sm font-medium text-gray-900">Payment Delay Issue</h4>
                            <p class="text-sm text-gray-600">Mike R. vs James W. • $800</p>
                            <p class="text-xs text-gray-500">Payment processing delay</p>
                          </div>
                          <div class="text-right">
                            <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Investigating</span>
                          </div>
                        </div>
                      </div>
                    \`;
                    console.log('Loaded disputes data');
                  }
                }, 500);
              } else if (tabName === 'analytics') {
                setTimeout(function() {
                  var platformStats = document.getElementById('platformStats');
                  if (platformStats) {
                    platformStats.innerHTML = \`
                      <div class="space-y-4">
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span class="text-sm font-medium">Revenue This Month</span>
                          <span class="text-lg font-bold text-green-600">$47,230</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span class="text-sm font-medium">Jobs Completed</span>
                          <span class="text-lg font-bold text-blue-600">342</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span class="text-sm font-medium">Platform Fee Collected</span>
                          <span class="text-lg font-bold text-purple-600">$4,723</span>
                        </div>
                      </div>
                    \`;
                    console.log('Loaded analytics data');
                  }
                }, 500);
              }
              
            } catch (error) {
              console.error('Error in showTab function:', error);
            }
          };
          
          console.log('ADMIN DASHBOARD: Inline JavaScript setup complete');
          
          // Enhanced admin dashboard functions
          window.refreshBusinessIntelligence = async function() {
            try {
              // Get session token from cookies
              const sessionToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('session='))
                ?.split('=')[1];
                
              if (!sessionToken) {
                console.error('No session token found');
                showNotification('Authentication required. Please login again.', 'error');
                return;
              }
              
              const response = await fetch('/api/admin/analytics/business-intelligence?timeframe=7', {
                headers: { 'Authorization': 'Bearer ' + sessionToken }
              });
              
              if (response.ok) {
                const data = await response.json();
                const summary = document.getElementById('business-intelligence-summary');
                if (summary && data.performance_trends) {
                  summary.innerHTML = \`
                    <div class="text-center">
                      <div class="text-2xl font-bold">\${Math.round(data.performance_trends.user_growth_rate)}%</div>
                      <div class="text-sm opacity-90">Growth Rate</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold">\${Math.round(data.performance_trends.job_completion_rate)}%</div>
                      <div class="text-sm opacity-90">Completion Rate</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold">\${Math.round(data.performance_trends.customer_satisfaction_score)}%</div>
                      <div class="text-sm opacity-90">Customer Satisfaction</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold">\${data.summary.top_performing_province || 'N/A'}</div>
                      <div class="text-sm opacity-90">Top Province</div>
                    </div>
                  \`;
                }
                
                // Show insights
                if (data.business_insights && data.business_insights.length > 0) {
                  data.business_insights.forEach(insight => {
                    showNotification(insight.message, insight.type);
                  });
                }
              }
            } catch (error) {
              console.error('Error refreshing business intelligence:', error);
            }
          };
          
          window.showNotification = function(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = \`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 \${
              type === 'success' ? 'bg-green-500 text-white' :
              type === 'warning' ? 'bg-yellow-500 text-white' :
              type === 'error' ? 'bg-red-500 text-white' :
              type === 'positive' ? 'bg-blue-500 text-white' :
              'bg-gray-600 text-white'
            }\`;
            
            notification.innerHTML = \`
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">\${message}</span>
                <button class="ml-3 text-white hover:text-gray-200 focus:outline-none" onclick="this.parentElement.parentElement.remove()">
                  <i class="fas fa-times text-xs"></i>
                </button>
              </div>
            \`;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
              notification.remove();
            }, 5000);
          };
          
          // Dashboard data loading function
          window.loadDashboardData = async function() {
            try {
              const sessionToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('session='))
                ?.split('=')[1];
                
              if (!sessionToken) {
                console.error('No session token found');
                showNotification('Authentication required. Please login again.', 'error');
                return;
              }
              
              console.log('Loading dashboard data...');
              console.log('Session token found:', sessionToken);
              
              // Load basic dashboard metrics
              const response = await fetch('/api/admin/dashboard', {
                headers: { 'Authorization': 'Bearer ' + sessionToken }
              });
              
              if (response.ok) {
                const data = await response.json();
                console.log('Dashboard data loaded:', data);
                
                // Update main metrics
                const activeUsersEl = document.getElementById('active-users');
                const openJobsEl = document.getElementById('open-jobs');
                const totalRevenueEl = document.getElementById('total-revenue');
                
                if (activeUsersEl) activeUsersEl.textContent = (data.active_users || 0).toLocaleString();
                if (openJobsEl) openJobsEl.textContent = (data.open_jobs || 0).toLocaleString();
                if (totalRevenueEl) totalRevenueEl.textContent = '$' + (data.total_revenue || 0).toLocaleString();
                
                // Update today's activity
                const todayActivityEl = document.getElementById('today-activity');
                if (todayActivityEl && data.new_users_today !== undefined) {
                  todayActivityEl.innerHTML = 
                    '<div class="grid grid-cols-2 md:grid-cols-6 gap-4">' +
                      '<div class="text-center">' +
                        '<div class="text-lg font-bold">' + (data.new_users_today || 0) + '</div>' +
                        '<div class="text-xs opacity-90">New Users</div>' +
                      '</div>' +
                      '<div class="text-center">' +
                        '<div class="text-lg font-bold">' + (data.jobs_posted_today || 0) + '</div>' +
                        '<div class="text-xs opacity-90">Jobs Posted</div>' +
                      '</div>' +
                      '<div class="text-center">' +
                        '<div class="text-lg font-bold">' + (data.active_workers || 0) + '</div>' +
                        '<div class="text-xs opacity-90">Active Workers</div>' +
                      '</div>' +
                      '<div class="text-center">' +
                        '<div class="text-lg font-bold">' + (data.active_clients || 0) + '</div>' +
                        '<div class="text-xs opacity-90">Active Clients</div>' +
                      '</div>' +
                      '<div class="text-center">' +
                        '<div class="text-lg font-bold">' + (data.completed_jobs || 0) + '</div>' +
                        '<div class="text-xs opacity-90">Completed Jobs</div>' +
                      '</div>' +
                      '<div class="text-center">' +
                        '<div class="text-lg font-bold">' + (data.pending_documents || 0) + '</div>' +
                        '<div class="text-xs opacity-90">Pending Reviews</div>' +
                      '</div>' +
                    '</div>';
                }
                
                // Update system health
                const systemHealthEl = document.getElementById('system-health');
                if (systemHealthEl) {
                  const isHealthy = data.active_users > 0 && data.open_jobs >= 0;
                  systemHealthEl.innerHTML = 
                    '<div class="flex items-center">' +
                      '<div class="w-2 h-2 ' + (isHealthy ? 'bg-green-400' : 'bg-red-400') + ' rounded-full mr-2"></div>' +
                      '<span class="text-xs ' + (isHealthy ? 'text-green-600' : 'text-red-600') + '">' + (isHealthy ? 'Healthy' : 'Issues Detected') + '</span>' +
                    '</div>';
                }
                
                // Update last refresh time
                const lastRefreshEl = document.getElementById('last-refresh-time');
                if (lastRefreshEl) {
                  lastRefreshEl.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
                }
                
                showNotification('Dashboard updated successfully', 'success');
                
              } else {
                console.error('Failed to load dashboard data:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                showNotification('Dashboard update failed. Please refresh the page.', 'error');
              }
              
            } catch (error) {
              console.error('Error loading dashboard data:', error);
              showNotification('Dashboard update failed. Please refresh the page.', 'error');
            }
          };
          
          // Auto-refresh functionality
          let autoRefreshInterval = null;
          
          window.startAutoRefresh = function() {
            if (autoRefreshInterval) clearInterval(autoRefreshInterval);
            
            autoRefreshInterval = setInterval(() => {
              const autoRefreshToggle = document.getElementById('autoRefreshToggle');
              if (autoRefreshToggle && autoRefreshToggle.checked) {
                console.log('Auto-refreshing dashboard...');
                loadDashboardData();
              }
            }, 30000); // Refresh every 30 seconds
          };
          
          // Manual refresh button
          document.addEventListener('DOMContentLoaded', function() {
            const refreshButton = document.getElementById('refreshDashboard');
            if (refreshButton) {
              refreshButton.addEventListener('click', function() {
                console.log('Manual refresh triggered');
                loadDashboardData();
              });
            }
            
            // Initial load
            loadDashboardData();
            
            // Start auto-refresh
            startAutoRefresh();
          });
          
          // Initialize business intelligence on load
          setTimeout(() => {
            refreshBusinessIntelligence();
          }, 3000);
          
        </script>
        <!-- Admin dashboard.js removed to avoid conflicts with embedded dashboard loading -->
    </body>
    </html>
  `)
})

// Client Profile Management Page  
dashboardRoutes.get('/client/profile', requireAuth, async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'client') {
    return c.redirect('/dashboard')
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Profile - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/dashboard/client" class="text-2xl font-bold text-kwikr-green hover:text-green-600">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Breadcrumb Navigation -->
            <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                <a href="/dashboard/client" class="hover:text-kwikr-green">Dashboard</a>
                <i class="fas fa-chevron-right text-xs"></i>
                <span class="text-gray-900 font-medium">My Profile</span>
            </nav>
            
            <!-- Comprehensive Client Profile -->
            <!-- Client Profile Header -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div class="bg-gradient-to-r from-kwikr-green to-green-600 rounded-t-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                                <i class="fas fa-user text-3xl"></i>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold">${user.first_name} ${user.last_name}</h1>
                                <p class="text-green-100">Premium Client</p>
                                <div class="flex items-center mt-1">
                                    <i class="fas fa-calendar-alt mr-2"></i>
                                    <span class="text-sm">Member since March 2023</span>
                                    <i class="fas fa-check-circle ml-3 text-green-200" title="Verified Account"></i>
                                </div>
                            </div>
                        </div>
                        <button id="editProfileBtn" onclick="toggleEditMode()" class="bg-white text-kwikr-green px-4 py-2 rounded-lg hover:bg-gray-50 font-medium">
                            <i class="fas fa-edit mr-2"></i><span id="editBtnText">Edit Profile</span>
                        </button>
                    </div>
                </div>
                
                <!-- Client Statistics -->
                <div class="p-6 border-b border-gray-200">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-kwikr-green">12</div>
                            <div class="text-sm text-gray-600">Jobs Posted</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-600">8</div>
                            <div class="text-sm text-gray-600">Completed Projects</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-600">$18,500</div>
                            <div class="text-sm text-gray-600">Total Spent</div>
                        </div>
                        <div class="text-center">
                            <div class="flex justify-center items-center mb-1">
                                <div class="text-2xl font-bold text-yellow-500">4.8</div>
                                <div class="flex ml-2">
                                    <i class="fas fa-star text-yellow-400"></i>
                                    <i class="fas fa-star text-yellow-400"></i>
                                    <i class="fas fa-star text-yellow-400"></i>
                                    <i class="fas fa-star text-yellow-400"></i>
                                    <i class="fas fa-star text-gray-300"></i>
                                </div>
                            </div>
                            <div class="text-sm text-gray-600">Client Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Personal Information -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-xl font-semibold text-gray-900">
                        <i class="fas fa-user mr-2"></i>Personal Information
                    </h2>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- View Mode -->
                        <div class="view-mode">
                            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <div class="text-gray-900">${user.first_name}</div>
                        </div>
                        <div class="edit-mode hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input type="text" id="firstName" value="${user.first_name}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                        </div>

                        <div class="view-mode">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <div class="text-gray-900">${user.last_name}</div>
                        </div>
                        <div class="edit-mode hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input type="text" id="lastName" value="${user.last_name}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                        </div>

                        <div class="view-mode">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div class="text-gray-900">${user.email}</div>
                        </div>
                        <div class="edit-mode hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input type="email" id="email" value="${user.email}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                        </div>

                        <div class="view-mode">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <div class="text-gray-900">(416) 555-0123</div>
                        </div>
                        <div class="edit-mode hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input type="tel" id="phone" value="(416) 555-0123" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                        </div>
                    </div>

                    <!-- Edit Mode Action Buttons -->
                    <div class="edit-mode hidden mt-6">
                        <div class="flex space-x-3">
                            <button onclick="saveProfile()" class="bg-kwikr-green text-white px-4 py-2 rounded-md hover:bg-green-600">
                                <i class="fas fa-save mr-2"></i>Save Changes
                            </button>
                            <button onclick="cancelEdit()" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
                                <i class="fas fa-times mr-2"></i>Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Address Information -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-xl font-semibold text-gray-900">
                        <i class="fas fa-map-marker-alt mr-2"></i>Address Information
                    </h2>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="view-mode">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                            <div class="text-gray-900">123 Main Street</div>
                        </div>
                        <div class="edit-mode hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                            <input type="text" id="street" value="123 Main Street" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                        </div>

                        <div class="view-mode">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Apartment/Unit</label>
                            <div class="text-gray-900">Apt 502</div>
                        </div>
                        <div class="edit-mode hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Apartment/Unit (Optional)</label>
                            <input type="text" id="apartmentUnit" value="Apt 502" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                        </div>

                        <div class="view-mode">
                            <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <div class="text-gray-900">${user.city || 'Toronto'}</div>
                        </div>
                        <div class="edit-mode hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input type="text" id="city" value="${user.city || 'Toronto'}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                        </div>

                        <div class="view-mode">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Province</label>
                            <div class="text-gray-900">${user.province || 'ON'}</div>
                        </div>
                        <div class="edit-mode hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Province</label>
                            <select id="province" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                <option value="ON" ${user.province === 'ON' ? 'selected' : ''}>Ontario</option>
                                <option value="BC" ${user.province === 'BC' ? 'selected' : ''}>British Columbia</option>
                                <option value="AB" ${user.province === 'AB' ? 'selected' : ''}>Alberta</option>
                                <option value="QC" ${user.province === 'QC' ? 'selected' : ''}>Quebec</option>
                                <option value="MB" ${user.province === 'MB' ? 'selected' : ''}>Manitoba</option>
                                <option value="SK" ${user.province === 'SK' ? 'selected' : ''}>Saskatchewan</option>
                                <option value="NS" ${user.province === 'NS' ? 'selected' : ''}>Nova Scotia</option>
                                <option value="NB" ${user.province === 'NB' ? 'selected' : ''}>New Brunswick</option>
                                <option value="NL" ${user.province === 'NL' ? 'selected' : ''}>Newfoundland and Labrador</option>
                                <option value="PE" ${user.province === 'PE' ? 'selected' : ''}>Prince Edward Island</option>
                                <option value="NT" ${user.province === 'NT' ? 'selected' : ''}>Northwest Territories</option>
                                <option value="YT" ${user.province === 'YT' ? 'selected' : ''}>Yukon</option>
                                <option value="NU" ${user.province === 'NU' ? 'selected' : ''}>Nunavut</option>
                            </select>
                        </div>

                        <div class="view-mode">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                            <div class="text-gray-900">M5V 2T6</div>
                        </div>
                        <div class="edit-mode hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                            <input type="text" id="postalCode" value="M5V 2T6" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green" placeholder="A1B 2C3">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Preferences -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-xl font-semibold text-gray-900">
                        <i class="fas fa-cog mr-2"></i>Preferences & Settings
                    </h2>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-3">Preferred Service Types</label>
                            <div class="view-mode">
                                <div class="flex flex-wrap gap-2">
                                    <span class="bg-kwikr-green text-white px-3 py-1 rounded-full text-sm">Cleaning Services</span>
                                    <span class="bg-kwikr-green text-white px-3 py-1 rounded-full text-sm">Plumbing</span>
                                    <span class="bg-kwikr-green text-white px-3 py-1 rounded-full text-sm">Electrical Work</span>
                                </div>
                            </div>
                            <div class="edit-mode hidden">
                                <div class="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                                    <label class="flex items-center">
                                        <input type="checkbox" name="preferredServices" value="Cleaning Services" checked class="mr-2">
                                        <span class="text-sm">Cleaning Services</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="preferredServices" value="Plumbing" checked class="mr-2">
                                        <span class="text-sm">Plumbing</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="preferredServices" value="Handyman Services" class="mr-2">
                                        <span class="text-sm">Handyman Services</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="preferredServices" value="Electrical Work" checked class="mr-2">
                                        <span class="text-sm">Electrical Work</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="preferredServices" value="Carpentry" class="mr-2">
                                        <span class="text-sm">Carpentry</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="preferredServices" value="Painting" class="mr-2">
                                        <span class="text-sm">Painting</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="preferredServices" value="HVAC Services" class="mr-2">
                                        <span class="text-sm">HVAC Services</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="preferredServices" value="Roofing" class="mr-2">
                                        <span class="text-sm">Roofing</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="preferredServices" value="Flooring" class="mr-2">
                                        <span class="text-sm">Flooring</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="preferredServices" value="Landscaping" class="mr-2">
                                        <span class="text-sm">Landscaping</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="preferredServices" value="Moving Services" class="mr-2">
                                        <span class="text-sm">Moving Services</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="preferredServices" value="Appliance Repair" class="mr-2">
                                        <span class="text-sm">Appliance Repair</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-3">Communication Preference</label>
                            <div class="view-mode">
                                <div class="text-gray-900">Email</div>
                            </div>
                            <div class="edit-mode hidden">
                                <select id="communicationPref" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                    <option value="email" selected>Email</option>
                                    <option value="sms">SMS/Text</option>
                                    <option value="phone">Phone Call</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Notification Settings -->
                    <div class="mt-6 pt-6 border-t border-gray-200">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                        <div class="space-y-3">
                            <label class="flex items-center">
                                <input type="checkbox" id="emailUpdates" checked class="mr-3" disabled>
                                <span class="text-sm">Receive job updates and messages via email</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="smsNotifications" class="mr-3" disabled>
                                <span class="text-sm">Receive urgent notifications via SMS</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="marketingEmails" checked class="mr-3" disabled>
                                <span class="text-sm">Receive promotional emails and service recommendations</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Account Information -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-xl font-semibold text-gray-900">
                        <i class="fas fa-shield-alt mr-2"></i>Account Information
                    </h2>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                            <div class="flex items-center">
                                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Active & Verified</span>
                                <i class="fas fa-check-circle text-green-600 ml-2"></i>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                            <div class="text-gray-900">Premium Client</div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                            <div class="text-gray-900">March 15, 2023</div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
                            <div class="text-gray-900 font-mono text-sm">CL-${String(user.user_id).padStart(6, '0')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
          // Embed user information directly from server-side session
          window.currentUser = {
            id: ${user.user_id},
            email: "${user.email}",
            role: "${user.role}",
            firstName: "${user.first_name}",
            lastName: "${user.last_name}",
            province: "${user.province || ''}",
            city: "${user.city || ''}",
            isVerified: ${user.is_verified || 0}
          };
          
          // Client profile inline editing functions
          let isEditMode = false;

          function toggleEditMode() {
            isEditMode = !isEditMode;
            const viewElements = document.querySelectorAll('.view-mode');
            const editElements = document.querySelectorAll('.edit-mode');
            const editBtn = document.getElementById('editProfileBtn');
            const editBtnText = document.getElementById('editBtnText');
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');

            if (isEditMode) {
                // Switch to edit mode
                viewElements.forEach(el => el.classList.add('hidden'));
                editElements.forEach(el => el.classList.remove('hidden'));
                editBtn.classList.remove('bg-white', 'text-kwikr-green', 'hover:bg-gray-50');
                editBtn.classList.add('bg-red-500', 'text-white', 'hover:bg-red-600');
                editBtnText.textContent = 'Cancel Edit';
                
                // Enable checkboxes
                checkboxes.forEach(checkbox => {
                    checkbox.disabled = false;
                });
            } else {
                // Switch to view mode
                viewElements.forEach(el => el.classList.remove('hidden'));
                editElements.forEach(el => el.classList.add('hidden'));
                editBtn.classList.remove('bg-red-500', 'text-white', 'hover:bg-red-600');
                editBtn.classList.add('bg-white', 'text-kwikr-green', 'hover:bg-gray-50');
                editBtnText.textContent = 'Edit Profile';
                
                // Disable checkboxes
                checkboxes.forEach(checkbox => {
                    checkbox.disabled = true;
                });
            }
          }

          function saveProfile() {
            // Collect form data from all edit fields
            const editInputs = document.querySelectorAll('.edit-mode input, .edit-mode select, .edit-mode textarea');
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            const formData = {};
            
            editInputs.forEach(input => {
                if (input.name || input.id) {
                    formData[input.name || input.id] = input.value;
                }
            });

            // Collect checkbox data
            const preferredServices = [];
            document.querySelectorAll('input[name="preferredServices"]:checked').forEach(checkbox => {
                preferredServices.push(checkbox.value);
            });
            formData.preferredServices = preferredServices;

            const notifications = {};
            checkboxes.forEach(checkbox => {
                if (checkbox.id && checkbox.id !== 'preferredServices') {
                    notifications[checkbox.id] = checkbox.checked;
                }
            });
            formData.notifications = notifications;

            // Here you would typically send the data to the server
            console.log('Saving client profile data:', formData);
            
            // For demo purposes, just show success and exit edit mode
            alert('Profile updated successfully!');
            toggleEditMode();
          }

          function cancelEdit() {
            // Reset all edit fields to original values and exit edit mode
            const editInputs = document.querySelectorAll('.edit-mode input, .edit-mode select, .edit-mode textarea');
            
            // Reset to original values (you'd typically store these when entering edit mode)
            editInputs.forEach(input => {
                if (input.dataset.originalValue) {
                    input.value = input.dataset.originalValue;
                }
            });

            toggleEditMode();
          }
        </script>
        <script src="/static/client-profile.js"></script>
    </body>
    </html>
  `)
})

// Job Posting Page
dashboardRoutes.get('/client/post-job', requireAuth, async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'client') {
    return c.redirect('/dashboard')
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Post a Job - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/dashboard/client" class="text-2xl font-bold text-kwikr-green hover:text-green-600">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Breadcrumb Navigation -->
            <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                <a href="/dashboard/client" class="hover:text-kwikr-green">Dashboard</a>
                <i class="fas fa-chevron-right text-xs"></i>
                <span class="text-gray-900 font-medium">Post a Job</span>
            </nav>
            
            <!-- Job Posting Form -->
            <div class="bg-white rounded-lg shadow-sm">
                <div class="p-6 border-b border-gray-200">
                    <h1 class="text-2xl font-bold text-gray-900">Post a New Job</h1>
                    <p class="text-gray-600 mt-2">Find the right service provider for your project</p>
                </div>
                
                <div id="jobPostingContainer" class="p-6">
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
                        <p>Loading job categories...</p>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
          // Embed user information directly from server-side session
          window.currentUser = {
            id: ${user.user_id},
            email: "${user.email}",
            role: "${user.role}",
            firstName: "${user.first_name}",
            lastName: "${user.last_name}",
            province: "${user.province || ''}",
            city: "${user.city || ''}",
            isVerified: ${user.is_verified || 0}
          };
          
          // Load job posting form on page load
          document.addEventListener('DOMContentLoaded', function() {
            loadJobPostingPage();
          });
        </script>
        <script src="/static/client-job-posting.js"></script>
    </body>
    </html>
  `)
})

// Worker Browser Page
dashboardRoutes.get('/client/browse-workers', requireAuth, async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'client') {
    return c.redirect('/dashboard')
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Browse Service Providers - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/dashboard/client" class="text-2xl font-bold text-kwikr-green hover:text-green-600">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Breadcrumb Navigation -->
            <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                <a href="/dashboard/client" class="hover:text-kwikr-green">Dashboard</a>
                <i class="fas fa-chevron-right text-xs"></i>
                <span class="text-gray-900 font-medium">Browse Service Providers</span>
            </nav>
            
            <!-- Search and Results -->
            <div class="space-y-6">
                <!-- Search Filters -->
                <div class="bg-white rounded-lg shadow-sm">
                    <div class="p-6 border-b border-gray-200">
                        <h1 class="text-2xl font-bold text-gray-900">Browse Service Providers</h1>
                        <p class="text-gray-600 mt-2">Find qualified professionals for your projects</p>
                    </div>
                    
                    <div id="searchFilters" class="p-6">
                        <div class="space-y-4">
                            <!-- Search Bar -->
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex-1">
                                    <input type="text" id="search-input" placeholder="Search by skills, name, or location..."
                                           class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kwikr-green focus:border-kwikr-green"
                                           onkeyup="handleSearch()" />
                                </div>
                                <button onclick="performSearch()" class="bg-kwikr-green text-white px-6 py-2 rounded-md hover:bg-green-600">
                                    <i class="fas fa-search mr-2"></i>Search
                                </button>
                            </div>
                            
                            <!-- Advanced Filters -->
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
                                    <select id="category-filter" onchange="applyFilters()" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                        <option value="">All Categories</option>
                                        <option value="Cleaning Services">Cleaning Services</option>
                                        <option value="Plumbing">Plumbing</option>
                                        <option value="Handyman Services">Handyman Services</option>
                                        <option value="Electrical Work">Electrical Work</option>
                                        <option value="Carpentry">Carpentry</option>
                                        <option value="Painting">Painting</option>
                                        <option value="HVAC Services">HVAC Services</option>
                                        <option value="Roofing">Roofing</option>
                                        <option value="Flooring">Flooring</option>
                                        <option value="Landscaping">Landscaping</option>
                                        <option value="Moving Services">Moving Services</option>
                                        <option value="Appliance Repair">Appliance Repair</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                                    <select id="experience-filter" onchange="applyFilters()" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                        <option value="">Any Level</option>
                                        <option value="Beginner">Beginner (1-2 years)</option>
                                        <option value="Intermediate">Intermediate (3-7 years)</option>
                                        <option value="Expert">Expert (8+ years)</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
                                    <select id="rate-filter" onchange="applyFilters()" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                        <option value="">Any Rate</option>
                                        <option value="0-40">Under $40/hour</option>
                                        <option value="40-60">$40 - $60/hour</option>
                                        <option value="60-80">$60 - $80/hour</option>
                                        <option value="80-120">$80 - $120/hour</option>
                                        <option value="120+">$120+/hour</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                    <select id="location-filter" onchange="applyFilters()" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                        <option value="">All Locations</option>
                                        <option value="Toronto, ON">Toronto, ON</option>
                                        <option value="Vancouver, BC">Vancouver, BC</option>
                                        <option value="Montreal, QC">Montreal, QC</option>
                                        <option value="Calgary, AB">Calgary, AB</option>
                                        <option value="Edmonton, AB">Edmonton, AB</option>
                                        <option value="Ottawa, ON">Ottawa, ON</option>
                                        <option value="Winnipeg, MB">Winnipeg, MB</option>
                                        <option value="Quebec City, QC">Quebec City, QC</option>
                                        <option value="Hamilton, ON">Hamilton, ON</option>
                                        <option value="Kitchener, ON">Kitchener, ON</option>
                                        <option value="London, ON">London, ON</option>
                                        <option value="Victoria, BC">Victoria, BC</option>
                                        <option value="Halifax, NS">Halifax, NS</option>
                                        <option value="Oshawa, ON">Oshawa, ON</option>
                                        <option value="Windsor, ON">Windsor, ON</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                                    <select id="availability-filter" onchange="applyFilters()" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                        <option value="">Any Availability</option>
                                        <option value="available">Available Now</option>
                                        <option value="part-time">Part Time</option>
                                        <option value="full-time">Full Time</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                                    <select id="rating-filter" onchange="applyFilters()" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                        <option value="">Any Rating</option>
                                        <option value="4">4+ Stars</option>
                                        <option value="4.5">4.5+ Stars</option>
                                        <option value="4.8">4.8+ Stars</option>
                                    </select>
                                </div>
                                
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
                                    <div class="flex space-x-2">
                                        <button onclick="clearFilters()" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex-1">
                                            <i class="fas fa-times mr-2"></i>Clear Filters
                                        </button>
                                        <button onclick="toggleAdvancedFilters()" class="bg-kwikr-green text-white px-4 py-2 rounded-md hover:bg-green-600 flex-1">
                                            <i class="fas fa-filter mr-2"></i>Advanced
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Search Results -->
                <div class="bg-white rounded-lg shadow-sm">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <div>
                                <h2 class="text-lg font-semibold text-gray-900">Available Service Providers</h2>
                                <p class="text-sm text-gray-600">Showing 6 qualified professionals in your area</p>
                            </div>
                            <div class="text-sm text-gray-500">
                                Sort by: <select class="ml-2 border border-gray-300 rounded px-2 py-1">
                                    <option>Rating</option>
                                    <option>Price (Low to High)</option>
                                    <option>Experience</option>
                                    <option>Availability</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div id="searchResults" class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Service Provider Cards -->
                            <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center">
                                        <div class="w-12 h-12 bg-kwikr-green rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                            SJ
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-gray-900">Sarah Johnson</h3>
                                            <p class="text-sm text-gray-600">Professional House Cleaner</p>
                                            <div class="flex items-center mt-1">
                                                <div class="flex text-yellow-400 text-sm">
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                </div>
                                                <span class="ml-2 text-sm text-gray-600">4.9 (127 reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-lg font-bold text-kwikr-green">$45/hr</div>
                                        <div class="text-sm text-gray-500">Starting rate</div>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <p class="text-sm text-gray-600 mb-2">Professional cleaning service with 8+ years experience. Specializing in residential and commercial cleaning with eco-friendly products.</p>
                                    <div class="flex flex-wrap gap-1">
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Deep Cleaning</span>
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Move-in/out</span>
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Eco-friendly</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span><i class="fas fa-map-marker-alt mr-1"></i>Toronto, ON</span>
                                    <span><i class="fas fa-clock mr-1"></i>Available Now</span>
                                    <span><i class="fas fa-check-circle mr-1 text-green-500"></i>89 jobs completed</span>
                                </div>
                                <div class="flex space-x-2">
                                    <button class="flex-1 bg-kwikr-green text-white py-2 px-4 rounded hover:bg-green-600">
                                        <i class="fas fa-eye mr-2"></i>View Profile
                                    </button>
                                    <button class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200">
                                        <i class="fas fa-envelope mr-2"></i>Message
                                    </button>
                                </div>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center">
                                        <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                            DC
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-gray-900">David Chen</h3>
                                            <p class="text-sm text-gray-600">Licensed Plumber</p>
                                            <div class="flex items-center mt-1">
                                                <div class="flex text-yellow-400 text-sm">
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                </div>
                                                <span class="ml-2 text-sm text-gray-600">4.8 (94 reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-lg font-bold text-kwikr-green">$85/hr</div>
                                        <div class="text-sm text-gray-500">Starting rate</div>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <p class="text-sm text-gray-600 mb-2">Licensed plumber with 12+ years experience. Available for residential and commercial plumbing repairs and installations.</p>
                                    <div class="flex flex-wrap gap-1">
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Pipe Repair</span>
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Emergency</span>
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Licensed</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span><i class="fas fa-map-marker-alt mr-1"></i>Vancouver, BC</span>
                                    <span><i class="fas fa-clock mr-1"></i>Available Now</span>
                                    <span><i class="fas fa-check-circle mr-1 text-green-500"></i>156 jobs completed</span>
                                </div>
                                <div class="flex space-x-2">
                                    <button class="flex-1 bg-kwikr-green text-white py-2 px-4 rounded hover:bg-green-600">
                                        <i class="fas fa-eye mr-2"></i>View Profile
                                    </button>
                                    <button class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200">
                                        <i class="fas fa-envelope mr-2"></i>Message
                                    </button>
                                </div>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center">
                                        <div class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                            MR
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-gray-900">Maria Rodriguez</h3>
                                            <p class="text-sm text-gray-600">Handyman Services</p>
                                            <div class="flex items-center mt-1">
                                                <div class="flex text-yellow-400 text-sm">
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star-half-alt"></i>
                                                </div>
                                                <span class="ml-2 text-sm text-gray-600">4.7 (73 reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-lg font-bold text-kwikr-green">$55/hr</div>
                                        <div class="text-sm text-gray-500">Starting rate</div>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <p class="text-sm text-gray-600 mb-2">Reliable handyman providing general repair and maintenance services for homes and offices throughout Calgary.</p>
                                    <div class="flex flex-wrap gap-1">
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">General Repairs</span>
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Assembly</span>
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Maintenance</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span><i class="fas fa-map-marker-alt mr-1"></i>Calgary, AB</span>
                                    <span><i class="fas fa-clock mr-1"></i>Full Time</span>
                                    <span><i class="fas fa-check-circle mr-1 text-green-500"></i>52 jobs completed</span>
                                </div>
                                <div class="flex space-x-2">
                                    <button class="flex-1 bg-kwikr-green text-white py-2 px-4 rounded hover:bg-green-600">
                                        <i class="fas fa-eye mr-2"></i>View Profile
                                    </button>
                                    <button class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200">
                                        <i class="fas fa-envelope mr-2"></i>Message
                                    </button>
                                </div>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center">
                                        <div class="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                            AK
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-gray-900">Alex Kumar</h3>
                                            <p class="text-sm text-gray-600">Licensed Electrician</p>
                                            <div class="flex items-center mt-1">
                                                <div class="flex text-yellow-400 text-sm">
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                </div>
                                                <span class="ml-2 text-sm text-gray-600">4.9 (145 reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-lg font-bold text-kwikr-green">$95/hr</div>
                                        <div class="text-sm text-gray-500">Starting rate</div>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <p class="text-sm text-gray-600 mb-2">Licensed electrician specializing in residential and commercial electrical work. Available for emergency calls.</p>
                                    <div class="flex flex-wrap gap-1">
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Wiring</span>
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Panel Upgrades</span>
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Emergency</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span><i class="fas fa-map-marker-alt mr-1"></i>Ottawa, ON</span>
                                    <span><i class="fas fa-clock mr-1"></i>Available Now</span>
                                    <span><i class="fas fa-check-circle mr-1 text-green-500"></i>97 jobs completed</span>
                                </div>
                                <div class="flex space-x-2">
                                    <button class="flex-1 bg-kwikr-green text-white py-2 px-4 rounded hover:bg-green-600">
                                        <i class="fas fa-eye mr-2"></i>View Profile
                                    </button>
                                    <button class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200">
                                        <i class="fas fa-envelope mr-2"></i>Message
                                    </button>
                                </div>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center">
                                        <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                            EW
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-gray-900">Emily Watson</h3>
                                            <p class="text-sm text-gray-600">Carpenter & Woodworker</p>
                                            <div class="flex items-center mt-1">
                                                <div class="flex text-yellow-400 text-sm">
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                </div>
                                                <span class="ml-2 text-sm text-gray-600">4.8 (68 reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-lg font-bold text-kwikr-green">$75/hr</div>
                                        <div class="text-sm text-gray-500">Starting rate</div>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <p class="text-sm text-gray-600 mb-2">Skilled carpenter with expertise in custom woodwork, furniture making, and home renovations.</p>
                                    <div class="flex flex-wrap gap-1">
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Custom Furniture</span>
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Deck Building</span>
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Renovations</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span><i class="fas fa-map-marker-alt mr-1"></i>Montreal, QC</span>
                                    <span><i class="fas fa-clock mr-1"></i>Part Time</span>
                                    <span><i class="fas fa-check-circle mr-1 text-green-500"></i>134 jobs completed</span>
                                </div>
                                <div class="flex space-x-2">
                                    <button class="flex-1 bg-kwikr-green text-white py-2 px-4 rounded hover:bg-green-600">
                                        <i class="fas fa-eye mr-2"></i>View Profile
                                    </button>
                                    <button class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200">
                                        <i class="fas fa-envelope mr-2"></i>Message
                                    </button>
                                </div>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center">
                                        <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                            MT
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-gray-900">Michael Thompson</h3>
                                            <p class="text-sm text-gray-600">Professional Painter</p>
                                            <div class="flex items-center mt-1">
                                                <div class="flex text-yellow-400 text-sm">
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star"></i>
                                                    <i class="fas fa-star-half-alt"></i>
                                                </div>
                                                <span class="ml-2 text-sm text-gray-600">4.6 (91 reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-lg font-bold text-kwikr-green">$50/hr</div>
                                        <div class="text-sm text-gray-500">Starting rate</div>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <p class="text-sm text-gray-600 mb-2">Professional painter providing interior and exterior painting services for residential and commercial properties.</p>
                                    <div class="flex flex-wrap gap-1">
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Interior</span>
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Exterior</span>
                                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Commercial</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span><i class="fas fa-map-marker-alt mr-1"></i>Edmonton, AB</span>
                                    <span><i class="fas fa-clock mr-1"></i>Available Now</span>
                                    <span><i class="fas fa-check-circle mr-1 text-green-500"></i>76 jobs completed</span>
                                </div>
                                <div class="flex space-x-2">
                                    <button class="flex-1 bg-kwikr-green text-white py-2 px-4 rounded hover:bg-green-600">
                                        <i class="fas fa-eye mr-2"></i>View Profile
                                    </button>
                                    <button class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200">
                                        <i class="fas fa-envelope mr-2"></i>Message
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Pagination -->
                        <div class="mt-8 flex justify-center">
                            <nav class="flex space-x-2">
                                <button class="px-3 py-2 border border-gray-300 rounded text-gray-500 cursor-not-allowed">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="px-3 py-2 bg-kwikr-green text-white rounded">1</button>
                                <button class="px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">2</button>
                                <button class="px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">3</button>
                                <button class="px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
          // Embed user information directly from server-side session
          window.currentUser = {
            id: ${user.user_id},
            email: "${user.email}",
            role: "${user.role}",
            firstName: "${user.first_name}",
            lastName: "${user.last_name}",
            province: "${user.province || ''}",
            city: "${user.city || ''}",
            isVerified: ${user.is_verified || 0}
          };
          
          // Load worker browser on page load
          document.addEventListener('DOMContentLoaded', function() {
            loadWorkerBrowserPage();
          });
        </script>
        <script src="/static/client-worker-browser.js"></script>
    </body>
    </html>
  `)
})

// Job Details Page
dashboardRoutes.get('/client/job/:id', requireAuth, async (c) => {
  const user = c.get('user')
  const jobId = c.req.param('id')
  
  if (user.role !== 'client') {
    return c.redirect('/dashboard')
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Details - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/dashboard/client" class="text-2xl font-bold text-kwikr-green hover:text-green-600">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                    <a href="/dashboard/client" class="text-gray-500 hover:text-kwikr-green mr-4">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
                    </a>
                    <h1 class="text-2xl font-bold text-gray-900">Job Details</h1>
                </div>
            </div>
            
            <div id="job-details-container">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-gray-400 text-2xl mb-2"></i>
                    <p class="text-gray-500">Loading job details...</p>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
          window.currentJobId = ${jobId};
          window.currentUser = {
            id: ${user.user_id},
            email: "${user.email}",
            role: "${user.role}",
            firstName: "${user.first_name}",
            lastName: "${user.last_name}"
          };
        </script>
        <script src="/static/client-job-details.js"></script>
    </body>
    </html>
  `)
})

// Edit Job Page  
dashboardRoutes.get('/client/job/:id/edit', requireAuth, async (c) => {
  const user = c.get('user')
  const jobId = c.req.param('id')
  
  if (user.role !== 'client') {
    return c.redirect('/dashboard')
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Edit Job - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/dashboard/client" class="text-2xl font-bold text-kwikr-green hover:text-green-600">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                    <a href="/dashboard/client/job/${jobId}" class="text-gray-500 hover:text-kwikr-green mr-4">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Job Details
                    </a>
                    <h1 class="text-2xl font-bold text-gray-900">Edit Job</h1>
                </div>
            </div>
            
            <div id="edit-job-container">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-gray-400 text-2xl mb-2"></i>
                    <p class="text-gray-500">Loading job edit form...</p>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
          window.currentJobId = ${jobId};
          window.currentUser = {
            id: ${user.user_id},
            email: "${user.email}",
            role: "${user.role}",
            firstName: "${user.first_name}",
            lastName: "${user.last_name}"
          };
        </script>
        <script src="/static/client-edit-job.js"></script>
    </body>
    </html>
  `)
})

// Worker Profile Page
dashboardRoutes.get('/client/worker/:id', requireAuth, async (c) => {
  const user = c.get('user')
  const workerId = c.req.param('id')
  
  if (user.role !== 'client') {
    return c.redirect('/dashboard')
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Worker Profile - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/dashboard/client" class="text-2xl font-bold text-kwikr-green hover:text-green-600">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                    <a href="/dashboard/client/browse-workers" class="text-gray-500 hover:text-kwikr-green mr-4">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Browse Workers
                    </a>
                    <h1 class="text-2xl font-bold text-gray-900">Worker Profile</h1>
                </div>
            </div>
            
            <div id="worker-profile-container">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-gray-400 text-2xl mb-2"></i>
                    <p class="text-gray-500">Loading worker profile...</p>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
          window.currentWorkerId = ${workerId};
          window.currentUser = {
            id: ${user.user_id},
            email: "${user.email}",
            role: "${user.role}",
            firstName: "${user.first_name}",
            lastName: "${user.last_name}"
          };
        </script>
        <script src="/static/client-worker-profile.js"></script>
    </body>
    </html>
  `)
})

// Worker Kanban Board for Job Tracking
dashboardRoutes.get('/worker/kanban', requireAuth, async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'worker') {
    return c.redirect('/dashboard')
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Tracking Board - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .drag-over {
            background-color: rgba(59, 130, 246, 0.1) !important;
            border: 2px dashed #3b82f6 !important;
          }
          .dragging {
            opacity: 0.5 !important;
            transform: rotate(5deg) !important;
            z-index: 1000 !important;
          }
          .kanban-column {
            min-height: 400px;
            transition: all 0.2s ease;
          }
          .job-card {
            transition: all 0.2s ease;
          }
          .job-card:hover {
            transform: translateY(-2px);
          }
        </style>
    </head>
    <body class="bg-gray-100">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/dashboard/worker" class="text-2xl font-bold text-kwikr-green hover:text-green-600">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                    <a href="/dashboard/worker" class="text-gray-500 hover:text-kwikr-green mr-4">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
                    </a>
                    <h1 class="text-2xl font-bold text-gray-900">
                        <i class="fas fa-tasks mr-2"></i>Job Tracking Board
                    </h1>
                </div>
                <div class="flex items-center space-x-4">
                    <button onclick="loadWorkerJobs()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                        <i class="fas fa-sync-alt mr-2"></i>Refresh
                    </button>
                </div>
            </div>

            <!-- Kanban Board Container -->
            <div id="kanban-container" class="w-full">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-gray-400 text-2xl mb-2"></i>
                    <p class="text-gray-500">Loading job tracking board...</p>
                </div>
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
          window.currentUser = {
            id: ${user.user_id},
            email: "${user.email}",
            role: "${user.role}",
            firstName: "${user.first_name}",
            lastName: "${user.last_name}"
          };
        </script>
        <script src="/static/worker-kanban.js"></script>
        <script>
          // Initialize Kanban board when page loads
          document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, initializing Kanban board');
            initializeKanban();
          });
        </script>
    </body>
    </html>
  `)
})

// Worker Bids Page
dashboardRoutes.get('/worker/bids', requireAuth, async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'worker') {
    return c.redirect('/dashboard')
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Bids - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/dashboard/worker" class="text-2xl font-bold text-kwikr-green hover:text-green-600">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                    <a href="/dashboard/worker" class="text-gray-500 hover:text-kwikr-green mr-4">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
                    </a>
                    <h1 class="text-2xl font-bold text-gray-900">
                        <i class="fas fa-eye mr-2"></i>My Bids
                    </h1>
                </div>
            </div>

            <!-- Coming Soon Notice -->
            <div class="bg-white rounded-lg shadow-sm p-8 text-center">
                <i class="fas fa-hammer text-6xl text-gray-300 mb-4"></i>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Bid Management Coming Soon</h2>
                <p class="text-gray-600 mb-6">We're working on a comprehensive bid management system where you can view, edit, and track all your submitted bids.</p>
                <div class="flex justify-center space-x-4">
                    <a href="/dashboard/worker" class="bg-kwikr-green text-white px-6 py-3 rounded-lg hover:bg-green-600">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
                    </a>
                    <a href="/dashboard/worker/kanban" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                        <i class="fas fa-tasks mr-2"></i>View Job Board
                    </a>
                </div>
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
          window.currentUser = {
            id: ${user.user_id},
            email: "${user.email}",
            role: "${user.role}",
            firstName: "${user.first_name}",
            lastName: "${user.last_name}"
          };
        </script>
    </body>
    </html>
  `)
})

// Worker Profile with Tab Navigation
dashboardRoutes.get('/worker/profile', requireAuth, async (c) => {
  const user = c.get('user')
  const tab = c.req.query('tab') || 'profile'
  
  if (user.role !== 'worker') {
    return c.redirect('/dashboard')
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Worker Profile - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/dashboard" class="text-2xl font-bold text-kwikr-green">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <!-- Breadcrumb -->
            <div class="mb-6">
                <nav class="text-sm">
                    <a href="/dashboard" class="text-kwikr-green hover:underline">Dashboard</a>
                    <span class="mx-2 text-gray-400">/</span>
                    <span class="text-gray-600">Profile</span>
                </nav>
            </div>

            <!-- Tab Navigation -->
            <div class="mb-6">
                <div class="border-b border-gray-200">
                    <nav class="-mb-px flex space-x-8">
                        <a href="/dashboard/worker/profile?tab=profile" 
                           class="py-2 px-1 border-b-2 font-medium text-sm ${tab === 'profile' ? 'border-kwikr-green text-kwikr-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
                            <i class="fas fa-user mr-2"></i>Profile View
                        </a>

                        <a href="/dashboard/worker/profile?tab=services" 
                           class="py-2 px-1 border-b-2 font-medium text-sm ${tab === 'services' ? 'border-kwikr-green text-kwikr-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
                            <i class="fas fa-cog mr-2"></i>Manage Services
                        </a>
                        <a href="/dashboard/worker/profile?tab=compliance" 
                           class="py-2 px-1 border-b-2 font-medium text-sm ${tab === 'compliance' ? 'border-kwikr-green text-kwikr-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
                            <i class="fas fa-certificate mr-2"></i>Manage Compliance
                        </a>
                    </nav>
                </div>
            </div>

            <!-- Tab Content -->
            <div class="bg-white rounded-lg shadow">
                ${tab === 'profile' ? `
                    <!-- Profile View with Inline Editing -->
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-gray-900">Profile Overview</h2>
                            <button id="editProfileBtn" onclick="toggleEditMode()" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                <i class="fas fa-edit mr-2"></i><span id="editBtnText">Edit Profile</span>
                            </button>
                        </div>
                        
                        <!-- Company Header Section -->
                        <div class="bg-gradient-to-r from-kwikr-green to-green-600 rounded-lg p-6 text-white mb-8">
                            <div class="flex items-center space-x-6">
                                <!-- Company Logo -->
                                <div class="flex-shrink-0">
                                    <div class="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-30 transition-colors" onclick="uploadLogo()">
                                        <i class="fas fa-building text-4xl text-white"></i>
                                    </div>
                                    <p class="text-xs text-green-100 mt-2 text-center">Click to Upload Logo</p>
                                </div>
                                
                                <!-- Company Info -->
                                <div class="flex-grow">
                                    <div class="view-mode">
                                        <h3 class="text-2xl font-bold">Demo Worker Services Inc.</h3>
                                        <p class="text-green-100 mt-1">Professional Home & Commercial Services</p>
                                    </div>
                                    <div class="edit-mode hidden">
                                        <input type="text" class="text-2xl font-bold bg-transparent border border-white border-opacity-30 rounded px-2 py-1 text-white placeholder-green-200 focus:outline-none focus:border-opacity-100" value="Demo Worker Services Inc." placeholder="Company Name">
                                        <input type="text" class="mt-2 bg-transparent border border-white border-opacity-30 rounded px-2 py-1 text-green-100 placeholder-green-200 focus:outline-none focus:border-opacity-100 w-full" value="Professional Home & Commercial Services" placeholder="Company Tagline">
                                    </div>
                                    <div class="flex items-center mt-3 space-x-4">
                                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                                            <i class="fas fa-star mr-1"></i> 4.8 Rating
                                        </span>
                                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                                            <i class="fas fa-check-circle mr-1"></i> Verified Business
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Main Profile Information Grid -->
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            
                            <!-- Contact Information -->
                            <div class="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <i class="fas fa-address-book text-kwikr-green mr-2"></i>
                                    Contact Information
                                </h3>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Primary Email</label>
                                        <p class="view-mode mt-1 text-sm text-gray-900">${user.email}</p>
                                        <input type="email" class="edit-mode hidden mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green" value="${user.email}">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Business Email</label>
                                        <p class="view-mode mt-1 text-sm text-gray-900">business@demoworker.ca</p>
                                        <input type="email" class="edit-mode hidden mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green" value="business@demoworker.ca">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <p class="view-mode mt-1 text-sm text-gray-900">+1 (416) 555-0123</p>
                                        <input type="tel" class="edit-mode hidden mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green" value="+1 (416) 555-0123">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Business Phone</label>
                                        <p class="view-mode mt-1 text-sm text-gray-900">+1 (416) 555-0124</p>
                                        <input type="tel" class="edit-mode hidden mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green" value="+1 (416) 555-0124">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Emergency Contact</label>
                                        <p class="view-mode mt-1 text-sm text-gray-900">+1 (416) 555-0125</p>
                                        <input type="tel" class="edit-mode hidden mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green" value="+1 (416) 555-0125">
                                    </div>
                                </div>
                            </div>

                            <!-- Business Address -->
                            <div class="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <i class="fas fa-map-marker-alt text-kwikr-green mr-2"></i>
                                    Business Address
                                </h3>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Street Address</label>
                                        <p class="view-mode mt-1 text-sm text-gray-900">123 King Street West</p>
                                        <input type="text" class="edit-mode hidden mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green" value="123 King Street West">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Unit/Suite</label>
                                        <p class="view-mode mt-1 text-sm text-gray-900">Suite 456</p>
                                        <input type="text" class="edit-mode hidden mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green" value="Suite 456">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">City</label>
                                        <p class="view-mode mt-1 text-sm text-gray-900">${user.city || 'Toronto'}</p>
                                        <input type="text" class="edit-mode hidden mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green" value="${user.city || 'Toronto'}">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Province</label>
                                        <p class="view-mode mt-1 text-sm text-gray-900">${user.province || 'Ontario'}</p>
                                        <select class="edit-mode hidden mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                            <option value="AB">Alberta</option>
                                            <option value="BC">British Columbia</option>
                                            <option value="MB">Manitoba</option>
                                            <option value="NB">New Brunswick</option>
                                            <option value="NL">Newfoundland and Labrador</option>
                                            <option value="NS">Nova Scotia</option>
                                            <option value="ON" selected>Ontario</option>
                                            <option value="PE">Prince Edward Island</option>
                                            <option value="QC">Quebec</option>
                                            <option value="SK">Saskatchewan</option>
                                            <option value="NT">Northwest Territories</option>
                                            <option value="NU">Nunavut</option>
                                            <option value="YT">Yukon</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Postal Code</label>
                                        <p class="view-mode mt-1 text-sm text-gray-900">M5V 3A8</p>
                                        <input type="text" class="edit-mode hidden mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green" value="M5V 3A8" placeholder="A1A 1A1">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Service Area</label>
                                        <p class="view-mode mt-1 text-sm text-gray-900">Greater Toronto Area (GTA)</p>
                                        <input type="text" class="edit-mode hidden mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green" value="Greater Toronto Area (GTA)">
                                    </div>
                                </div>
                            </div>

                            <!-- Account Details -->
                            <div class="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <i class="fas fa-user-circle text-kwikr-green mr-2"></i>
                                    Account Details
                                </h3>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Account ID</label>
                                        <p class="mt-1 text-sm font-mono text-gray-900">KWR-${(user.user_id || user.id || 2).toString().padStart(6, '0')}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Account Status</label>
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            <i class="fas fa-check-circle mr-1"></i> Active
                                        </span>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Member Since</label>
                                        <p class="mt-1 text-sm text-gray-900">January 15, 2024</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Last Login</label>
                                        <p class="mt-1 text-sm text-gray-900">Today at 2:30 PM</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Profile Completion</label>
                                        <div class="mt-1">
                                            <div class="w-full bg-gray-200 rounded-full h-2">
                                                <div class="bg-kwikr-green h-2 rounded-full" style="width: 75%"></div>
                                            </div>
                                            <p class="text-xs text-gray-500 mt-1">75% Complete</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Verification Status</label>
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            <i class="fas fa-shield-alt mr-1"></i> ID Verified
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Business Description -->
                        <div class="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <i class="fas fa-file-alt text-kwikr-green mr-2"></i>
                                Business Description
                            </h3>
                            <div class="view-mode prose text-gray-700">
                                <p class="mb-3">
                                    Demo Worker Services Inc. is a professional home and commercial service provider with over 10 years of experience in the Greater Toronto Area. We specialize in providing high-quality, reliable services to both residential and commercial clients.
                                </p>
                                <p class="mb-3">
                                    Our team of certified professionals is committed to delivering exceptional results on every project. We pride ourselves on punctuality, attention to detail, and customer satisfaction. All our work is fully insured and comes with a satisfaction guarantee.
                                </p>
                                <p>
                                    We serve the entire GTA and are available for both emergency and scheduled services. Our 24/7 customer service ensures that help is always available when you need it most.
                                </p>
                            </div>
                            <div class="edit-mode hidden">
                                <textarea rows="8" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green" placeholder="Describe your business, services, experience, and what makes you unique...">Demo Worker Services Inc. is a professional home and commercial service provider with over 10 years of experience in the Greater Toronto Area. We specialize in providing high-quality, reliable services to both residential and commercial clients.

Our team of certified professionals is committed to delivering exceptional results on every project. We pride ourselves on punctuality, attention to detail, and customer satisfaction. All our work is fully insured and comes with a satisfaction guarantee.

We serve the entire GTA and are available for both emergency and scheduled services. Our 24/7 customer service ensures that help is always available when you need it most.</textarea>
                            </div>
                        </div>

                        <!-- Services Provided -->
                        <div class="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <i class="fas fa-tools text-kwikr-green mr-2"></i>
                                Services Provided
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div class="flex items-center p-3 bg-green-50 rounded-lg">
                                    <i class="fas fa-broom text-kwikr-green mr-3"></i>
                                    <div>
                                        <p class="font-medium text-gray-900">Cleaning Services</p>
                                        <p class="text-xs text-gray-600">Residential & Commercial</p>
                                    </div>
                                </div>
                                <div class="flex items-center p-3 bg-blue-50 rounded-lg">
                                    <i class="fas fa-wrench text-blue-600 mr-3"></i>
                                    <div>
                                        <p class="font-medium text-gray-900">Plumbing</p>
                                        <p class="text-xs text-gray-600">Emergency & Maintenance</p>
                                    </div>
                                </div>
                                <div class="flex items-center p-3 bg-yellow-50 rounded-lg">
                                    <i class="fas fa-bolt text-yellow-600 mr-3"></i>
                                    <div>
                                        <p class="font-medium text-gray-900">Electrical Work</p>
                                        <p class="text-xs text-gray-600">Licensed Electrician</p>
                                    </div>
                                </div>
                                <div class="flex items-center p-3 bg-purple-50 rounded-lg">
                                    <i class="fas fa-hammer text-purple-600 mr-3"></i>
                                    <div>
                                        <p class="font-medium text-gray-900">Handyman Services</p>
                                        <p class="text-xs text-gray-600">General Repairs</p>
                                    </div>
                                </div>
                                <div class="flex items-center p-3 bg-red-50 rounded-lg">
                                    <i class="fas fa-paint-roller text-red-600 mr-3"></i>
                                    <div>
                                        <p class="font-medium text-gray-900">Painting</p>
                                        <p class="text-xs text-gray-600">Interior & Exterior</p>
                                    </div>
                                </div>
                                <div class="flex items-center p-3 bg-indigo-50 rounded-lg">
                                    <i class="fas fa-seedling text-indigo-600 mr-3"></i>
                                    <div>
                                        <p class="font-medium text-gray-900">Landscaping</p>
                                        <p class="text-xs text-gray-600">Design & Maintenance</p>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-4 text-center">
                                <a href="/dashboard/worker/profile?tab=services" class="text-kwikr-green hover:underline text-sm font-medium">
                                    <i class="fas fa-plus mr-1"></i>Manage Services
                                </a>
                            </div>
                        </div>

                        <!-- Compliance Status -->
                        <div class="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <i class="fas fa-certificate text-kwikr-green mr-2"></i>
                                Compliance Status
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div class="flex items-center">
                                        <i class="fas fa-file-contract text-red-600 mr-3"></i>
                                        <div>
                                            <p class="font-medium text-gray-900">Business License</p>
                                            <p class="text-sm text-gray-600">Required for operation</p>
                                        </div>
                                    </div>
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Missing</span>
                                </div>
                                
                                <div class="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div class="flex items-center">
                                        <i class="fas fa-shield-alt text-red-600 mr-3"></i>
                                        <div>
                                            <p class="font-medium text-gray-900">Insurance Certificate</p>
                                            <p class="text-sm text-gray-600">Liability coverage required</p>
                                        </div>
                                    </div>
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Missing</span>
                                </div>
                                
                                <div class="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div class="flex items-center">
                                        <i class="fas fa-user-check text-gray-600 mr-3"></i>
                                        <div>
                                            <p class="font-medium text-gray-900">Background Check</p>
                                            <p class="text-sm text-gray-600">Optional verification</p>
                                        </div>
                                    </div>
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Optional</span>
                                </div>
                                
                                <div class="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div class="flex items-center">
                                        <i class="fas fa-award text-gray-600 mr-3"></i>
                                        <div>
                                            <p class="font-medium text-gray-900">Certifications</p>
                                            <p class="text-sm text-gray-600">Professional credentials</p>
                                        </div>
                                    </div>
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Optional</span>
                                </div>
                            </div>
                            
                            <!-- Overall Compliance Status -->
                            <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <i class="fas fa-exclamation-triangle text-yellow-600 mr-3"></i>
                                        <div>
                                            <h4 class="text-sm font-medium text-yellow-800">Action Required</h4>
                                            <p class="text-sm text-yellow-700">Complete required documents to activate your account for job bidding.</p>
                                        </div>
                                    </div>
                                    <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        0/2 Complete
                                    </span>
                                </div>
                                <div class="mt-3">
                                    <a href="/dashboard/worker/profile?tab=compliance" class="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700">
                                        <i class="fas fa-upload mr-2"></i>
                                        Upload Documents
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Edit Mode Action Buttons -->
                        <div class="edit-mode hidden mt-8 flex justify-center space-x-4">
                            <button onclick="saveProfile()" class="bg-kwikr-green text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
                                <i class="fas fa-save mr-2"></i>Save Changes
                            </button>
                            <button onclick="cancelEdit()" class="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">
                                <i class="fas fa-times mr-2"></i>Cancel
                            </button>
                        </div>
                    </div>
                ` : tab === 'edit' ? `
                    <!-- Edit Profile -->
                    <div class="p-6">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
                        
                        <form id="editProfileForm" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
                                    <input type="text" id="firstName" name="firstName" value="${user.first_name}" 
                                           class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                </div>
                                
                                <div>
                                    <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input type="text" id="lastName" name="lastName" value="${user.last_name}" 
                                           class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                </div>
                            </div>

                            <div>
                                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" id="email" name="email" value="${user.email}" 
                                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                            </div>

                            <div>
                                <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
                                <input type="tel" id="phone" name="phone" value="${user.phone || ''}" 
                                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                            </div>

                            <div>
                                <label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
                                <textarea id="bio" name="bio" rows="4" 
                                          class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green"
                                          placeholder="Tell clients about yourself and your experience..."></textarea>
                            </div>

                            <div>
                                <button type="submit" 
                                        class="bg-kwikr-green text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
                                    <i class="fas fa-save mr-2"></i>Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                ` : tab === 'services' ? `
                    <!-- Manage Services -->
                    <div class="p-6">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Manage Your Services</h2>
                        <p class="text-gray-600 mb-8">Select the services you provide from the available categories below. Click on any service to add it to your profile with pricing and description.</p>

                        <!-- My Active Services -->
                        <div class="mb-8">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <i class="fas fa-check-circle text-kwikr-green mr-2"></i>
                                My Active Services <span id="serviceCount" class="ml-2 bg-kwikr-green text-white text-xs px-2 py-1 rounded-full">3</span>
                            </h3>
                            <div id="activeServices" class="grid gap-4">
                                <!-- Demo active services -->
                                <div class="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
                                    <div class="flex items-center">
                                        <i class="fas fa-broom text-green-600 text-xl mr-3"></i>
                                        <div>
                                            <h4 class="font-medium text-gray-900">Cleaning Services</h4>
                                            <p class="text-sm text-gray-600">Residential & commercial cleaning</p>
                                            <p class="text-sm text-green-600 font-medium">Starting at $45/hour</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <button onclick="editService('Cleaning')" class="text-blue-600 hover:text-blue-800">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="removeService('Cleaning')" class="text-red-600 hover:text-red-800">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
                                    <div class="flex items-center">
                                        <i class="fas fa-wrench text-green-600 text-xl mr-3"></i>
                                        <div>
                                            <h4 class="font-medium text-gray-900">Plumbing</h4>
                                            <p class="text-sm text-gray-600">Emergency repairs & installations</p>
                                            <p class="text-sm text-green-600 font-medium">Starting at $85/hour</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <button onclick="editService('Plumbing')" class="text-blue-600 hover:text-blue-800">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="removeService('Plumbing')" class="text-red-600 hover:text-red-800">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
                                    <div class="flex items-center">
                                        <i class="fas fa-tools text-green-600 text-xl mr-3"></i>
                                        <div>
                                            <h4 class="font-medium text-gray-900">Handyman Services</h4>
                                            <p class="text-sm text-gray-600">General repairs & maintenance</p>
                                            <p class="text-sm text-green-600 font-medium">Starting at $55/hour</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <button onclick="editService('Handyman')" class="text-blue-600 hover:text-blue-800">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="removeService('Handyman')" class="text-red-600 hover:text-red-800">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Available Services to Add -->
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <i class="fas fa-plus-circle text-gray-400 mr-2"></i>
                                Add More Services
                            </h3>
                            <p class="text-sm text-gray-600 mb-4">Click on any service below to add it to your profile. You can customize pricing and descriptions after adding.</p>
                            
                            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <div id="service-Electrical" class="available-service border border-gray-200 rounded-lg p-4 hover:border-kwikr-green hover:bg-green-50 cursor-pointer transition-colors" onclick="addServiceToProfile('Electrical', 'fas fa-bolt', 'Electrical installations & repairs')">
                                    <i class="fas fa-bolt text-kwikr-green text-2xl mb-2"></i>
                                    <h4 class="font-medium">Electrical Work</h4>
                                    <p class="text-xs text-gray-500 mt-1">Click to add</p>
                                </div>
                                
                                <div id="service-Carpentry" class="available-service border border-gray-200 rounded-lg p-4 hover:border-kwikr-green hover:bg-green-50 cursor-pointer transition-colors" onclick="addServiceToProfile('Carpentry', 'fas fa-hammer', 'Custom carpentry & woodwork')">
                                    <i class="fas fa-hammer text-kwikr-green text-2xl mb-2"></i>
                                    <h4 class="font-medium">Carpentry</h4>
                                    <p class="text-xs text-gray-500 mt-1">Click to add</p>
                                </div>
                                
                                <div id="service-Painting" class="available-service border border-gray-200 rounded-lg p-4 hover:border-kwikr-green hover:bg-green-50 cursor-pointer transition-colors" onclick="addServiceToProfile('Painting', 'fas fa-paint-roller', 'Interior & exterior painting')">
                                    <i class="fas fa-paint-roller text-kwikr-green text-2xl mb-2"></i>
                                    <h4 class="font-medium">Painting</h4>
                                    <p class="text-xs text-gray-500 mt-1">Click to add</p>
                                </div>
                                
                                <div id="service-HVAC" class="available-service border border-gray-200 rounded-lg p-4 hover:border-kwikr-green hover:bg-green-50 cursor-pointer transition-colors" onclick="addServiceToProfile('HVAC', 'fas fa-fan', 'Heating & cooling systems')">
                                    <i class="fas fa-fan text-kwikr-green text-2xl mb-2"></i>
                                    <h4 class="font-medium">HVAC Services</h4>
                                    <p class="text-xs text-gray-500 mt-1">Click to add</p>
                                </div>
                                
                                <div id="service-Roofing" class="available-service border border-gray-200 rounded-lg p-4 hover:border-kwikr-green hover:bg-green-50 cursor-pointer transition-colors" onclick="addServiceToProfile('Roofing', 'fas fa-home', 'Roof repair & installation')">
                                    <i class="fas fa-home text-kwikr-green text-2xl mb-2"></i>
                                    <h4 class="font-medium">Roofing</h4>
                                    <p class="text-xs text-gray-500 mt-1">Click to add</p>
                                </div>
                                
                                <div id="service-Flooring" class="available-service border border-gray-200 rounded-lg p-4 hover:border-kwikr-green hover:bg-green-50 cursor-pointer transition-colors" onclick="addServiceToProfile('Flooring', 'fas fa-layer-group', 'Floor installation & repair')">
                                    <i class="fas fa-layer-group text-kwikr-green text-2xl mb-2"></i>
                                    <h4 class="font-medium">Flooring</h4>
                                    <p class="text-xs text-gray-500 mt-1">Click to add</p>
                                </div>
                                
                                <div id="service-Landscaping" class="available-service border border-gray-200 rounded-lg p-4 hover:border-kwikr-green hover:bg-green-50 cursor-pointer transition-colors" onclick="addServiceToProfile('Landscaping', 'fas fa-seedling', 'Landscaping & garden design')">
                                    <i class="fas fa-seedling text-kwikr-green text-2xl mb-2"></i>
                                    <h4 class="font-medium">Landscaping</h4>
                                    <p class="text-xs text-gray-500 mt-1">Click to add</p>
                                </div>
                                
                                <div id="service-Moving" class="available-service border border-gray-200 rounded-lg p-4 hover:border-kwikr-green hover:bg-green-50 cursor-pointer transition-colors" onclick="addServiceToProfile('Moving', 'fas fa-truck', 'Moving & relocation services')">
                                    <i class="fas fa-truck text-kwikr-green text-2xl mb-2"></i>
                                    <h4 class="font-medium">Moving Services</h4>
                                    <p class="text-xs text-gray-500 mt-1">Click to add</p>
                                </div>
                                
                                <div id="service-Appliance" class="available-service border border-gray-200 rounded-lg p-4 hover:border-kwikr-green hover:bg-green-50 cursor-pointer transition-colors" onclick="addServiceToProfile('Appliance Repair', 'fas fa-cog', 'Appliance repair & maintenance')">
                                    <i class="fas fa-cog text-kwikr-green text-2xl mb-2"></i>
                                    <h4 class="font-medium">Appliance Repair</h4>
                                    <p class="text-xs text-gray-500 mt-1">Click to add</p>
                                </div>
                            </div>
                        </div>

                        <!-- Service Details Modal -->
                        <div id="serviceModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50">
                            <div class="flex items-center justify-center min-h-screen p-4">
                                <div class="bg-white rounded-lg p-6 max-w-lg w-full">
                                    <h3 class="text-lg font-semibold text-gray-900 mb-4" id="modalTitle">Add Service to Your Profile</h3>
                                    <form id="serviceDetailsForm">
                                        <div class="space-y-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">Service Category</label>
                                                <div class="mt-1 flex items-center">
                                                    <i id="serviceIcon" class="text-kwikr-green text-xl mr-3"></i>
                                                    <span id="serviceName" class="font-medium text-gray-900"></span>
                                                </div>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">Service Description</label>
                                                <textarea id="serviceDescription" rows="3" required
                                                          class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green"
                                                          placeholder="Describe your expertise and what you offer..."></textarea>
                                            </div>
                                            <div class="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700">Starting Price ($)</label>
                                                    <input type="number" id="servicePrice" min="0" step="0.01" required
                                                           class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green"
                                                           placeholder="0.00">
                                                </div>
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700">Price Unit</label>
                                                    <select id="priceUnit" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                                        <option value="hour">per hour</option>
                                                        <option value="project">per project</option>
                                                        <option value="sqft">per sq ft</option>
                                                        <option value="day">per day</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">Service Area</label>
                                                <input type="text" id="serviceArea" 
                                                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green"
                                                       placeholder="e.g., Greater Toronto Area" value="Greater Toronto Area">
                                            </div>
                                        </div>
                                        <div class="flex justify-end space-x-3 mt-6">
                                            <button type="button" onclick="closeServiceModal()" 
                                                    class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                                Cancel
                                            </button>
                                            <button type="submit" 
                                                    class="bg-kwikr-green text-white px-4 py-2 rounded-md hover:bg-green-600">
                                                <i class="fas fa-plus mr-2"></i><span id="submitBtnText">Add Service</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : tab === 'compliance' ? `
                    <!-- Manage Compliance -->
                    <div class="p-6">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Manage Compliance Documents</h2>
                        
                        <!-- Upload Status -->
                        <div class="mb-8">
                            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                <div class="flex items-center">
                                    <i class="fas fa-exclamation-triangle text-yellow-600 mr-3"></i>
                                    <div>
                                        <h4 class="text-sm font-medium text-yellow-800">Documents Required</h4>
                                        <p class="text-sm text-yellow-700">Please upload the following documents to complete your compliance status.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Required Documents -->
                        <div class="grid gap-6">
                            <!-- Business License -->
                            <div class="border border-gray-200 rounded-lg p-6">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900">Business License</h3>
                                        <p class="text-sm text-gray-600">Valid business license or contractor's license</p>
                                    </div>
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Required</span>
                                </div>
                                
                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-2"></i>
                                    <p class="text-gray-600 mb-2">Drag and drop your business license here, or</p>
                                    <button class="bg-kwikr-green text-white px-4 py-2 rounded hover:bg-green-600">
                                        Browse Files
                                    </button>
                                    <p class="text-xs text-gray-500 mt-2">Accepted formats: PDF, JPG, PNG (Max 5MB)</p>
                                </div>
                            </div>

                            <!-- Insurance Certificate -->
                            <div class="border border-gray-200 rounded-lg p-6">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900">Insurance Certificate</h3>
                                        <p class="text-sm text-gray-600">Proof of liability insurance coverage</p>
                                    </div>
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Required</span>
                                </div>
                                
                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-2"></i>
                                    <p class="text-gray-600 mb-2">Drag and drop your insurance certificate here, or</p>
                                    <button class="bg-kwikr-green text-white px-4 py-2 rounded hover:bg-green-600">
                                        Browse Files
                                    </button>
                                    <p class="text-xs text-gray-500 mt-2">Accepted formats: PDF, JPG, PNG (Max 5MB)</p>
                                </div>
                            </div>

                            <!-- Background Check -->
                            <div class="border border-gray-200 rounded-lg p-6">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900">Background Check</h3>
                                        <p class="text-sm text-gray-600">Criminal background check (issued within last 6 months)</p>
                                    </div>
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Optional</span>
                                </div>
                                
                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-2"></i>
                                    <p class="text-gray-600 mb-2">Drag and drop your background check here, or</p>
                                    <button class="bg-kwikr-green text-white px-4 py-2 rounded hover:bg-green-600">
                                        Browse Files
                                    </button>
                                    <p class="text-xs text-gray-500 mt-2">Accepted formats: PDF, JPG, PNG (Max 5MB)</p>
                                </div>
                            </div>

                            <!-- Certifications -->
                            <div class="border border-gray-200 rounded-lg p-6">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900">Professional Certifications</h3>
                                        <p class="text-sm text-gray-600">Trade-specific certifications and training certificates</p>
                                    </div>
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Optional</span>
                                </div>
                                
                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-2"></i>
                                    <p class="text-gray-600 mb-2">Drag and drop your certifications here, or</p>
                                    <button class="bg-kwikr-green text-white px-4 py-2 rounded hover:bg-green-600">
                                        Browse Files
                                    </button>
                                    <p class="text-xs text-gray-500 mt-2">Accepted formats: PDF, JPG, PNG (Max 5MB each)</p>
                                </div>
                            </div>
                        </div>

                        <!-- Compliance Status Summary -->
                        <div class="mt-8 bg-gray-50 rounded-lg p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-700">Business License</span>
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Missing</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-700">Insurance Certificate</span>
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Missing</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-700">Background Check</span>
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Not Required</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-700">Professional Certifications</span>
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Not Required</span>
                                </div>
                            </div>
                            
                            <div class="mt-4 pt-4 border-t border-gray-200">
                                <div class="flex justify-between items-center">
                                    <span class="font-medium text-gray-900">Overall Compliance</span>
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Incomplete (0/2)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
          window.currentUser = {
            id: ${user.user_id},
            email: "${user.email}",
            role: "${user.role}",
            firstName: "${user.first_name}",
            lastName: "${user.last_name}"
          };

          // Service management functions
          let currentServiceData = null;
          let editingServiceId = null;

          function addServiceToProfile(serviceName, iconClass, description) {
            currentServiceData = {
              name: serviceName,
              icon: iconClass,
              description: description
            };
            editingServiceId = null;

            // Update modal title and form
            document.getElementById('modalTitle').textContent = 'Add Service to Your Profile';
            document.getElementById('submitBtnText').textContent = 'Add Service';
            document.getElementById('serviceIcon').className = iconClass;
            document.getElementById('serviceName').textContent = serviceName;
            document.getElementById('serviceDescription').value = description;
            document.getElementById('servicePrice').value = '';
            document.getElementById('priceUnit').value = 'hour';
            document.getElementById('serviceArea').value = 'Greater Toronto Area';

            // Show modal
            document.getElementById('serviceModal').classList.remove('hidden');
          }

          function editService(serviceId, serviceName, iconClass, description, price, unit, area) {
            currentServiceData = {
              name: serviceName,
              icon: iconClass,
              description: description
            };
            editingServiceId = serviceId;

            // Update modal title and form
            document.getElementById('modalTitle').textContent = 'Edit Service Details';
            document.getElementById('submitBtnText').textContent = 'Save Changes';
            document.getElementById('serviceIcon').className = iconClass;
            document.getElementById('serviceName').textContent = serviceName;
            document.getElementById('serviceDescription').value = description;
            document.getElementById('servicePrice').value = price;
            document.getElementById('priceUnit').value = unit;
            document.getElementById('serviceArea').value = area;

            // Show modal
            document.getElementById('serviceModal').classList.remove('hidden');
          }

          function removeService(serviceId, serviceName) {
            if (confirm(\`Are you sure you want to remove \${serviceName} from your services?\`)) {
              // Find and remove the service card
              const serviceCard = document.querySelector(\`[data-service-id="\${serviceId}"]\`);
              if (serviceCard) {
                serviceCard.remove();
              }

              // Show the service in available services again
              const availableService = document.getElementById(\`service-\${serviceName.replace(/\\s+/g, '')}\`);
              if (availableService) {
                availableService.classList.remove('hidden');
              }

              alert(\`\${serviceName} has been removed from your services.\`);
            }
          }

          function closeServiceModal() {
            document.getElementById('serviceModal').classList.add('hidden');
            currentServiceData = null;
            editingServiceId = null;
          }

          // Form handlers
          document.getElementById('serviceDetailsForm')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!currentServiceData) return;

            // Get form values
            const description = document.getElementById('serviceDescription').value;
            const price = document.getElementById('servicePrice').value;
            const unit = document.getElementById('priceUnit').value;
            const area = document.getElementById('serviceArea').value;

            if (editingServiceId) {
              // Update existing service
              const serviceCard = document.querySelector(\`[data-service-id="\${editingServiceId}"]\`);
              if (serviceCard) {
                serviceCard.querySelector('.service-description').textContent = description;
                serviceCard.querySelector('.service-price').textContent = \`$\${price} \${unit}\`;
                serviceCard.querySelector('.service-area').textContent = area;
              }
              alert('Service updated successfully!');
            } else {
              // Add new service to active services
              const activeServicesGrid = document.getElementById('activeServicesGrid');
              const serviceId = 'service_' + Date.now();
              
              const serviceCard = document.createElement('div');
              serviceCard.className = 'bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow';
              serviceCard.setAttribute('data-service-id', serviceId);
              serviceCard.innerHTML = \`
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center">
                    <i class="\${currentServiceData.icon} text-kwikr-green text-2xl mr-3"></i>
                    <div>
                      <h3 class="font-semibold text-gray-900">\${currentServiceData.name}</h3>
                      <p class="text-sm text-gray-600 service-description">\${description}</p>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button onclick="editService('\${serviceId}', '\${currentServiceData.name}', '\${currentServiceData.icon}', '\${description}', '\${price}', '\${unit}', '\${area}')" 
                            class="text-blue-600 hover:text-blue-800">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="removeService('\${serviceId}', '\${currentServiceData.name}')" 
                            class="text-red-600 hover:text-red-800">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
                <div class="text-sm text-gray-600">
                  <p class="mb-1"><i class="fas fa-dollar-sign mr-2"></i><span class="service-price">$\${price} \${unit}</span></p>
                  <p><i class="fas fa-map-marker-alt mr-2"></i><span class="service-area">\${area}</span></p>
                </div>
              \`;
              
              activeServicesGrid.appendChild(serviceCard);

              // Hide this service from available services
              const availableService = document.getElementById(\`service-\${currentServiceData.name.replace(/\\s+/g, '')}\`);
              if (availableService) {
                availableService.classList.add('hidden');
              }

              alert(\`\${currentServiceData.name} has been added to your services!\`);
            }

            closeServiceModal();
          });

          document.getElementById('editProfileForm')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            // Update profile logic here
            alert('Profile updated successfully!');
          });

          // Inline editing functions
          let isEditMode = false;

          function toggleEditMode() {
            isEditMode = !isEditMode;
            const viewElements = document.querySelectorAll('.view-mode');
            const editElements = document.querySelectorAll('.edit-mode');
            const editBtn = document.getElementById('editProfileBtn');
            const editBtnText = document.getElementById('editBtnText');

            if (isEditMode) {
              // Switch to edit mode
              viewElements.forEach(el => el.classList.add('hidden'));
              editElements.forEach(el => el.classList.remove('hidden'));
              editBtn.classList.remove('bg-kwikr-green', 'hover:bg-green-600');
              editBtn.classList.add('bg-gray-500', 'hover:bg-gray-600');
              editBtnText.textContent = 'Cancel Edit';
            } else {
              // Switch to view mode
              viewElements.forEach(el => el.classList.remove('hidden'));
              editElements.forEach(el => el.classList.add('hidden'));
              editBtn.classList.remove('bg-gray-500', 'hover:bg-gray-600');
              editBtn.classList.add('bg-kwikr-green', 'hover:bg-green-600');
              editBtnText.textContent = 'Edit Profile';
            }
          }

          function saveProfile() {
            // Collect form data from all edit fields
            const editInputs = document.querySelectorAll('.edit-mode input, .edit-mode select, .edit-mode textarea');
            const formData = {};
            
            editInputs.forEach(input => {
              if (input.name || input.id) {
                formData[input.name || input.id] = input.value;
              }
            });

            // Here you would typically send the data to the server
            console.log('Saving profile data:', formData);
            
            // For demo purposes, just show success and exit edit mode
            alert('Profile updated successfully!');
            toggleEditMode();
          }

          function cancelEdit() {
            // Reset all edit fields to original values and exit edit mode
            const editInputs = document.querySelectorAll('.edit-mode input, .edit-mode select, .edit-mode textarea');
            
            // Reset to original values (you'd typically store these when entering edit mode)
            editInputs.forEach(input => {
              if (input.dataset.originalValue) {
                input.value = input.dataset.originalValue;
              }
            });

            toggleEditMode();
          }

          function uploadLogo() {
            // Create file input for logo upload
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = function(e) {
              const file = e.target.files[0];
              if (file) {
                // Here you would typically upload the file to the server
                console.log('Uploading logo:', file.name);
                alert('Logo upload functionality would be implemented here');
              }
            };
            fileInput.click();
          }
        </script>
    </body>
    </html>
  `)
})

// Worker Payments Page
dashboardRoutes.get('/worker/payments', requireAuth, async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'worker') {
    return c.redirect('/dashboard')
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Management - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/dashboard" class="text-2xl font-bold text-kwikr-green">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <!-- Breadcrumb -->
            <div class="mb-6">
                <nav class="text-sm">
                    <a href="/dashboard" class="text-kwikr-green hover:underline">Dashboard</a>
                    <span class="mx-2 text-gray-400">/</span>
                    <span class="text-gray-600">Payment Management</span>
                </nav>
            </div>

            <!-- Page Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Payment Management</h1>
                <p class="text-gray-600 mt-2">Manage your payment methods and transaction settings</p>
            </div>

            <!-- Payment Methods -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Current Payment Methods -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-semibold text-gray-900">Payment Methods</h2>
                            <button class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                <i class="fas fa-plus mr-2"></i>Add Method
                            </button>
                        </div>

                        <!-- Bank Account -->
                        <div class="border border-gray-200 rounded-lg p-4 mb-4">
                            <div class="flex justify-between items-start">
                                <div class="flex items-center">
                                    <i class="fas fa-university text-kwikr-green text-xl mr-3"></i>
                                    <div>
                                        <h3 class="font-medium text-gray-900">Bank Account</h3>
                                        <p class="text-sm text-gray-600">****1234 - Primary</p>
                                    </div>
                                </div>
                                <button class="text-gray-400 hover:text-gray-600">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </div>

                        <!-- PayPal -->
                        <div class="border border-gray-200 rounded-lg p-4">
                            <div class="flex justify-between items-center">
                                <div class="flex items-center">
                                    <i class="fab fa-paypal text-blue-600 text-xl mr-3"></i>
                                    <div>
                                        <h3 class="font-medium text-gray-900">PayPal</h3>
                                        <p class="text-sm text-gray-600">Not connected</p>
                                    </div>
                                </div>
                                <button class="text-kwikr-green hover:text-green-600 text-sm font-medium">
                                    Connect
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment Settings -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-6">Payment Settings</h2>

                        <div class="space-y-6">
                            <!-- Auto-withdrawal -->
                            <div>
                                <div class="flex justify-between items-center">
                                    <div>
                                        <h3 class="font-medium text-gray-900">Auto-withdrawal</h3>
                                        <p class="text-sm text-gray-600">Automatically transfer earnings to your bank account</p>
                                    </div>
                                    <label class="flex items-center cursor-pointer">
                                        <input type="checkbox" class="sr-only" checked>
                                        <div class="relative">
                                            <div class="w-10 h-6 bg-kwikr-green rounded-full shadow-inner"></div>
                                            <div class="absolute w-4 h-4 bg-white rounded-full shadow left-1 top-1 transform translate-x-4"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- Withdrawal Frequency -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Withdrawal Frequency</label>
                                <select class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                    <option>Weekly</option>
                                    <option>Bi-weekly</option>
                                    <option>Monthly</option>
                                </select>
                            </div>

                            <!-- Minimum Balance -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Balance for Withdrawal</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                    <input type="number" value="25" min="10" step="5" 
                                           class="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                </div>
                            </div>

                            <!-- Tax Information -->
                            <div>
                                <h3 class="font-medium text-gray-900 mb-2">Tax Information</h3>
                                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div class="flex items-start">
                                        <i class="fas fa-exclamation-triangle text-yellow-600 mr-3 mt-1"></i>
                                        <div>
                                            <p class="text-sm text-yellow-800">Tax forms required</p>
                                            <p class="text-sm text-yellow-700">Please complete your tax information to receive payments.</p>
                                            <button class="text-yellow-800 hover:underline text-sm font-medium mt-1">
                                                Complete Tax Forms →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Transactions -->
            <div class="mt-8 bg-white rounded-lg shadow">
                <div class="p-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-6">Recent Transactions</h2>

                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-gray-200">
                                    <th class="text-left py-3 text-sm font-medium text-gray-700">Date</th>
                                    <th class="text-left py-3 text-sm font-medium text-gray-700">Description</th>
                                    <th class="text-left py-3 text-sm font-medium text-gray-700">Amount</th>
                                    <th class="text-left py-3 text-sm font-medium text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr>
                                    <td class="py-3 text-sm text-gray-900">Jan 15, 2024</td>
                                    <td class="py-3 text-sm text-gray-900">Job Payment - Plumbing Repair</td>
                                    <td class="py-3 text-sm text-gray-900">$185.00</td>
                                    <td class="py-3">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="py-3 text-sm text-gray-900">Jan 12, 2024</td>
                                    <td class="py-3 text-sm text-gray-900">Weekly Withdrawal</td>
                                    <td class="py-3 text-sm text-gray-900">$450.00</td>
                                    <td class="py-3">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="py-3 text-sm text-gray-900">Jan 10, 2024</td>
                                    <td class="py-3 text-sm text-gray-900">Job Payment - Kitchen Installation</td>
                                    <td class="py-3 text-sm text-gray-900">$275.00</td>
                                    <td class="py-3">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
          window.currentUser = {
            id: ${user.user_id},
            email: "${user.email}",
            role: "${user.role}",
            firstName: "${user.first_name}",
            lastName: "${user.last_name}"
          };
        </script>
    </body>
    </html>
  `)
})

// Worker Earnings & Tracking Dashboard
dashboardRoutes.get('/worker/earnings', requireAuth, async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'worker') {
    return c.redirect('/dashboard')
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Earnings & Tracking - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/worker" class="text-2xl font-bold text-kwikr-green">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <!-- Breadcrumb -->
            <div class="mb-6">
                <nav class="text-sm">
                    <a href="/dashboard" class="text-kwikr-green hover:underline">Dashboard</a>
                    <span class="mx-2 text-gray-400">/</span>
                    <span class="text-gray-600">Earnings History</span>
                </nav>
            </div>

            <!-- Page Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Earnings History</h1>
                <p class="text-gray-600 mt-2">Track your earnings and performance over time</p>
            </div>

            <!-- Earnings Summary -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">This Month</p>
                            <p class="text-2xl font-bold text-gray-900">$1,285</p>
                        </div>
                        <div class="bg-kwikr-green bg-opacity-10 p-3 rounded-lg">
                            <i class="fas fa-dollar-sign text-kwikr-green text-xl"></i>
                        </div>
                    </div>
                    <div class="mt-4">
                        <span class="text-green-600 text-sm font-medium">+12.5%</span>
                        <span class="text-gray-600 text-sm"> from last month</span>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Total Earnings</p>
                            <p class="text-2xl font-bold text-gray-900">$8,750</p>
                        </div>
                        <div class="bg-blue-100 p-3 rounded-lg">
                            <i class="fas fa-chart-line text-blue-600 text-xl"></i>
                        </div>
                    </div>
                    <div class="mt-4">
                        <span class="text-gray-600 text-sm">Since joining</span>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Jobs Completed</p>
                            <p class="text-2xl font-bold text-gray-900">47</p>
                        </div>
                        <div class="bg-green-100 p-3 rounded-lg">
                            <i class="fas fa-check-circle text-green-600 text-xl"></i>
                        </div>
                    </div>
                    <div class="mt-4">
                        <span class="text-green-600 text-sm font-medium">95.7%</span>
                        <span class="text-gray-600 text-sm"> success rate</span>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Avg. Rating</p>
                            <p class="text-2xl font-bold text-gray-900">4.8</p>
                        </div>
                        <div class="bg-yellow-100 p-3 rounded-lg">
                            <i class="fas fa-star text-yellow-600 text-xl"></i>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="flex text-yellow-400">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts and Tables -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Earnings Chart -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-4">Monthly Earnings</h2>
                        <canvas id="earningsChart" width="400" height="200"></canvas>
                    </div>
                </div>

                <!-- Service Breakdown -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-4">Earnings by Service</h2>
                        <canvas id="servicesChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- Recent Earnings -->
            <div class="mt-8 bg-white rounded-lg shadow">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold text-gray-900">Recent Earnings</h2>
                        <div class="flex space-x-2">
                            <button class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">All Time</button>
                            <button class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">This Year</button>
                            <button class="px-3 py-1 text-sm bg-kwikr-green text-white rounded-md">This Month</button>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-gray-200">
                                    <th class="text-left py-3 text-sm font-medium text-gray-700">Date</th>
                                    <th class="text-left py-3 text-sm font-medium text-gray-700">Job</th>
                                    <th class="text-left py-3 text-sm font-medium text-gray-700">Service</th>
                                    <th class="text-left py-3 text-sm font-medium text-gray-700">Client</th>
                                    <th class="text-left py-3 text-sm font-medium text-gray-700">Amount</th>
                                    <th class="text-left py-3 text-sm font-medium text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr>
                                    <td class="py-3 text-sm text-gray-900">Jan 15, 2024</td>
                                    <td class="py-3 text-sm text-gray-900">Kitchen Sink Repair</td>
                                    <td class="py-3 text-sm text-gray-600">Plumbing</td>
                                    <td class="py-3 text-sm text-gray-600">Sarah Johnson</td>
                                    <td class="py-3 text-sm font-medium text-gray-900">$185.00</td>
                                    <td class="py-3">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="py-3 text-sm text-gray-900">Jan 12, 2024</td>
                                    <td class="py-3 text-sm text-gray-900">Electrical Outlet Installation</td>
                                    <td class="py-3 text-sm text-gray-600">Electrical</td>
                                    <td class="py-3 text-sm text-gray-600">Mike Chen</td>
                                    <td class="py-3 text-sm font-medium text-gray-900">$125.00</td>
                                    <td class="py-3">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="py-3 text-sm text-gray-900">Jan 10, 2024</td>
                                    <td class="py-3 text-sm text-gray-900">Cabinet Installation</td>
                                    <td class="py-3 text-sm text-gray-600">Carpentry</td>
                                    <td class="py-3 text-sm text-gray-600">Emma Wilson</td>
                                    <td class="py-3 text-sm font-medium text-gray-900">$275.00</td>
                                    <td class="py-3">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="py-3 text-sm text-gray-900">Jan 8, 2024</td>
                                    <td class="py-3 text-sm text-gray-900">Bathroom Tile Cleaning</td>
                                    <td class="py-3 text-sm text-gray-600">Cleaning</td>
                                    <td class="py-3 text-sm text-gray-600">David Rodriguez</td>
                                    <td class="py-3 text-sm font-medium text-gray-900">$95.00</td>
                                    <td class="py-3">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="py-3 text-sm text-gray-900">Jan 5, 2024</td>
                                    <td class="py-3 text-sm text-gray-900">Living Room Painting</td>
                                    <td class="py-3 text-sm text-gray-600">Painting</td>
                                    <td class="py-3 text-sm text-gray-600">Lisa Park</td>
                                    <td class="py-3 text-sm font-medium text-gray-900">$320.00</td>
                                    <td class="py-3">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
          window.currentUser = {
            id: ${user.user_id},
            email: "${user.email}",
            role: "${user.role}",
            firstName: "${user.first_name}",
            lastName: "${user.last_name}"
          };

          // Initialize charts
          document.addEventListener('DOMContentLoaded', function() {
            // Earnings Chart
            const earningsCtx = document.getElementById('earningsChart').getContext('2d');
            new Chart(earningsCtx, {
              type: 'line',
              data: {
                labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
                datasets: [{
                  label: 'Monthly Earnings',
                  data: [850, 920, 1100, 980, 1140, 1285],
                  borderColor: '#00C881',
                  backgroundColor: 'rgba(0, 200, 129, 0.1)',
                  tension: 0.4,
                  fill: true
                }]
              },
              options: {
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value;
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }
            });

            // Services Chart
            const servicesCtx = document.getElementById('servicesChart').getContext('2d');
            new Chart(servicesCtx, {
              type: 'doughnut',
              data: {
                labels: ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning'],
                datasets: [{
                  data: [2850, 1920, 1650, 1200, 1130],
                  backgroundColor: [
                    '#00C881',
                    '#3B82F6',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6'
                  ]
                }]
              },
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }
            });
          });
        </script>
    </body>
    </html>
  `)
})

// Worker Calendar Dashboard
dashboardRoutes.get('/worker/calendar', requireAuth, async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'worker') {
    return c.redirect('/dashboard')
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Calendar & Scheduling - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
          }
          .calendar-day {
            min-height: 120px;
            position: relative;
          }
          .calendar-event {
            font-size: 0.75rem;
            padding: 2px 6px;
            margin: 1px 0;
            border-radius: 4px;
            cursor: pointer;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .event-appointment { background-color: #dbeafe; color: #1e40af; }
          .event-work { background-color: #dcfce7; color: #166534; }
          .event-personal { background-color: #fef3c7; color: #92400e; }
        </style>
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/worker" class="text-2xl font-bold text-kwikr-green">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="mb-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">
                            <i class="fas fa-calendar-alt text-kwikr-green mr-3"></i>
                            Calendar & Scheduling
                        </h1>
                        <p class="text-gray-600 mt-2">Manage appointments, job schedules, and availability</p>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="showAvailabilityModal()" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                            <i class="fas fa-clock mr-2"></i>Set Availability
                        </button>
                        <button onclick="showAppointmentModal()" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                            <i class="fas fa-plus mr-2"></i>New Appointment
                        </button>
                    </div>
                </div>
            </div>

            <!-- Calendar Controls -->
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <button onclick="previousMonth()" class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h2 id="currentMonth" class="text-2xl font-semibold text-gray-900"></h2>
                        <button onclick="nextMonth()" class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <button onclick="goToToday()" class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            Today
                        </button>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2 text-sm">
                            <div class="w-3 h-3 bg-blue-200 rounded"></div>
                            <span>Appointments</span>
                        </div>
                        <div class="flex items-center space-x-2 text-sm">
                            <div class="w-3 h-3 bg-green-200 rounded"></div>
                            <span>Work Blocks</span>
                        </div>
                        <div class="flex items-center space-x-2 text-sm">
                            <div class="w-3 h-3 bg-yellow-200 rounded"></div>
                            <span>Personal</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Calendar -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <!-- Calendar Header -->
                <div class="calendar-grid bg-gray-50 border-b">
                    <div class="p-4 text-center text-sm font-medium text-gray-700 border-r">Sun</div>
                    <div class="p-4 text-center text-sm font-medium text-gray-700 border-r">Mon</div>
                    <div class="p-4 text-center text-sm font-medium text-gray-700 border-r">Tue</div>
                    <div class="p-4 text-center text-sm font-medium text-gray-700 border-r">Wed</div>
                    <div class="p-4 text-center text-sm font-medium text-gray-700 border-r">Thu</div>
                    <div class="p-4 text-center text-sm font-medium text-gray-700 border-r">Fri</div>
                    <div class="p-4 text-center text-sm font-medium text-gray-700">Sat</div>
                </div>
                
                <!-- Calendar Days -->
                <div id="calendarDays" class="calendar-grid bg-white">
                    <!-- Calendar days will be generated here -->
                </div>
            </div>

            <!-- Upcoming Events -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Today's Schedule -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">
                        <i class="fas fa-calendar-day text-kwikr-green mr-2"></i>
                        Today's Schedule
                    </h3>
                    <div id="todaySchedule" class="space-y-3">
                        <!-- Today's events will be loaded here -->
                    </div>
                </div>

                <!-- Upcoming Appointments -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">
                        <i class="fas fa-clock text-blue-500 mr-2"></i>
                        Upcoming Appointments
                    </h3>
                    <div id="upcomingAppointments" class="space-y-3">
                        <!-- Upcoming appointments will be loaded here -->
                    </div>
                </div>
            </div>
        </div>

        <!-- New Appointment Modal -->
        <div id="appointmentModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg max-w-md w-full mx-4">
                <div class="p-6 border-b border-gray-200">
                    <h3 class="text-xl font-bold text-gray-900">Schedule New Appointment</h3>
                </div>
                
                <form id="appointmentForm" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Client</label>
                        <select id="clientSelect" required class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green">
                            <option value="">Select a client</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Job (Optional)</label>
                        <select id="jobSelect" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green">
                            <option value="">Select a job (optional)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input type="text" id="appointmentTitle" required class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" placeholder="e.g., Site Visit">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select id="appointmentType" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green">
                            <option value="meeting">Meeting</option>
                            <option value="site_visit">Site Visit</option>
                            <option value="consultation">Consultation</option>
                            <option value="work_session">Work Session</option>
                        </select>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                            <input type="datetime-local" id="startDateTime" required class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                            <input type="datetime-local" id="endDateTime" required class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <select id="locationType" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green mb-2">
                            <option value="client_site">Client Site</option>
                            <option value="worker_office">My Office</option>
                            <option value="virtual">Virtual Meeting</option>
                            <option value="other">Other</option>
                        </select>
                        <input type="text" id="locationAddress" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" placeholder="Address or meeting link">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                        <textarea id="appointmentDescription" rows="3" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" placeholder="Additional notes..."></textarea>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeAppointmentModal()" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-kwikr-green text-white rounded-lg hover:bg-green-600">
                            Create Appointment
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script src="/static/calendar.js"></script>
        <script>
          // Initialize calendar when page loads
          document.addEventListener('DOMContentLoaded', function() {
            initializeCalendar();
            loadTodaySchedule();
            loadUpcomingAppointments();
          });
        </script>
    </body>
    </html>
  `)
})

// Worker Messages & Communication Dashboard
dashboardRoutes.get('/worker/messages', requireAuth, async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'worker') {
    return c.redirect('/dashboard')
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Messages & Communication - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/worker" class="text-2xl font-bold text-kwikr-green">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="relative">
                            <button id="notificationBtn" class="relative p-2 text-gray-600 hover:text-gray-900">
                                <i class="fas fa-bell text-xl"></i>
                                <span id="notificationBadge" class="hidden absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
                            </button>
                        </div>
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="mb-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">
                            <i class="fas fa-comments text-kwikr-green mr-3"></i>
                            Messages & Communication
                        </h1>
                        <p class="text-gray-600 mt-2">Stay connected with your clients and manage job updates</p>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="showProgressUpdateModal()" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                            <i class="fas fa-clipboard-check mr-2"></i>Progress Update
                        </button>
                        <button onclick="showFileShareModal()" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                            <i class="fas fa-share mr-2"></i>Share Files
                        </button>
                    </div>
                </div>
            </div>

            <!-- Main Communication Interface -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Message Threads List -->
                <div class="bg-white rounded-lg shadow-sm">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h2 class="text-xl font-semibold text-gray-900">Conversations</h2>
                            <div class="flex items-center space-x-2">
                                <select id="threadFilter" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                </select>
                                <button onclick="loadMessageThreads()" class="text-kwikr-green hover:text-green-600">
                                    <i class="fas fa-sync-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div id="messageThreadsList" class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                        <!-- Message threads will be loaded here -->
                    </div>
                </div>

                <!-- Message View -->
                <div class="lg:col-span-2 bg-white rounded-lg shadow-sm">
                    <!-- Chat Header -->
                    <div id="chatHeader" class="hidden p-6 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                    <i class="fas fa-user text-gray-600"></i>
                                </div>
                                <div>
                                    <h3 id="clientName" class="font-semibold text-gray-900">Select a conversation</h3>
                                    <p id="jobTitle" class="text-sm text-gray-600">Choose a client to start messaging</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button onclick="toggleQuickReplies()" class="text-gray-600 hover:text-gray-900">
                                    <i class="fas fa-bolt text-sm"></i>
                                </button>
                                <button onclick="archiveThread()" class="text-gray-600 hover:text-gray-900">
                                    <i class="fas fa-archive text-sm"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Replies Panel -->
                    <div id="quickRepliesPanel" class="hidden p-4 bg-blue-50 border-b border-gray-200">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm font-medium text-blue-900">Quick Replies</span>
                            <button onclick="toggleQuickReplies()" class="text-blue-600 hover:text-blue-800">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div id="quickRepliesList" class="flex flex-wrap gap-2">
                            <!-- Quick reply templates will be loaded here -->
                        </div>
                    </div>

                    <!-- Messages Area -->
                    <div id="messagesArea" class="flex-1 p-6">
                        <div class="text-center text-gray-500 py-12">
                            <i class="fas fa-comments text-4xl mb-4"></i>
                            <h3 class="text-lg font-medium mb-2">No conversation selected</h3>
                            <p class="text-sm">Choose a client conversation from the list to start messaging</p>
                        </div>
                    </div>

                    <!-- Message Input -->
                    <div id="messageInput" class="hidden p-6 border-t border-gray-200">
                        <form id="messageForm" onsubmit="sendMessage(event)" class="flex items-center space-x-3">
                            <div class="flex-1 relative">
                                <input type="text" id="messageText" placeholder="Type your message..." 
                                       class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green pr-12">
                                <button type="button" onclick="showFileUpload()" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                    <i class="fas fa-paperclip"></i>
                                </button>
                            </div>
                            <button type="submit" class="bg-kwikr-green text-white px-6 py-3 rounded-lg hover:bg-green-600">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </form>
                        <input type="file" id="fileUploadInput" class="hidden" accept="image/*,application/pdf" onchange="handleFileSelect(this)">
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Recent Progress Updates -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">
                        <i class="fas fa-chart-line text-blue-500 mr-2"></i>
                        Recent Progress Updates
                    </h3>
                    <div id="recentUpdates">
                        <!-- Recent updates will be loaded here -->
                    </div>
                </div>

                <!-- Notifications -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">
                        <i class="fas fa-bell text-yellow-500 mr-2"></i>
                        Recent Notifications
                    </h3>
                    <div id="recentNotifications">
                        <!-- Notifications will be loaded here -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Progress Update Modal -->
        <div id="progressUpdateModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                <div class="p-6 border-b border-gray-200">
                    <h3 class="text-xl font-bold text-gray-900">Create Progress Update</h3>
                </div>
                
                <form id="progressUpdateForm" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Job</label>
                        <select id="updateJobSelect" required class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green">
                            <option value="">Select a job</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Update Title</label>
                        <input type="text" id="updateTitle" required class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" placeholder="e.g., Completed foundation work">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea id="updateDescription" rows="4" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" placeholder="Describe the work completed and current status..."></textarea>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Progress Percentage</label>
                            <input type="number" id="updateProgress" min="0" max="100" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" placeholder="0-100">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Update Type</label>
                            <select id="updateType" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green">
                                <option value="progress">Progress Update</option>
                                <option value="milestone">Milestone Reached</option>
                                <option value="issue">Issue/Delay</option>
                                <option value="completion">Job Complete</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Photos (Optional)</label>
                        <input type="file" id="updatePhotos" multiple accept="image/*" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Next Steps</label>
                        <textarea id="updateNextSteps" rows="2" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" placeholder="What will happen next..."></textarea>
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" id="clientApprovalRequired" class="rounded border-gray-300 text-kwikr-green">
                        <label for="clientApprovalRequired" class="ml-2 text-sm text-gray-600">Client approval required</label>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeProgressUpdateModal()" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-kwikr-green text-white rounded-lg hover:bg-green-600">
                            Send Update
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script src="/static/messages.js"></script>
        <script>
          // Initialize messaging when page loads
          document.addEventListener('DOMContentLoaded', function() {
            loadMessageThreads();
            loadNotifications();
            loadQuickReplies();
            loadActiveJobs();
            
            // Start notification polling
            setInterval(checkNotifications, 30000); // Check every 30 seconds
          });
        </script>
    </body>
    </html>
  `)
})

// Worker Service Portfolio Management Dashboard
dashboardRoutes.get('/worker/portfolio', requireAuth, async (c) => {
  const user = c.get('user')
  
  if (user.role !== 'worker') {
    return c.redirect('/dashboard')
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Portfolio - Kwikr Directory</title>
        <script src="https://cdn.tailwindcss.com"></script>
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
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .portfolio-card {
            transition: all 0.3s ease;
          }
          .portfolio-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          .image-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
          }
          .gallery-image {
            aspect-ratio: 4/3;
            object-fit: cover;
            cursor: pointer;
            transition: opacity 0.2s ease;
          }
          .gallery-image:hover {
            opacity: 0.8;
          }
          .modal {
            display: none;
          }
          .modal.active {
            display: flex;
          }
          .drop-zone {
            border: 2px dashed #d1d5db;
            transition: all 0.3s ease;
          }
          .drop-zone.dragover {
            border-color: #00C881;
            background-color: rgba(0, 200, 129, 0.1);
          }
        </style>
    </head>
    <body class="bg-kwikr-gray min-h-screen">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/dashboard/worker" class="text-2xl font-bold text-kwikr-green hover:text-green-600">
                            <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                        </a>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600">Welcome, ${user.first_name}!</span>
                        <button onclick="logout()" class="text-gray-700 hover:text-red-600">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center">
                    <a href="/dashboard/worker" class="text-gray-500 hover:text-kwikr-green mr-4">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
                    </a>
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">
                            <i class="fas fa-briefcase text-kwikr-green mr-3"></i>Service Portfolio
                        </h1>
                        <p class="text-gray-600 mt-2">Showcase your work and manage your service offerings</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <button onclick="showCreatePortfolioModal()" class="bg-kwikr-green text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
                        <i class="fas fa-plus mr-2"></i>Create Portfolio
                    </button>
                    <button onclick="loadPortfolios()" class="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                        <i class="fas fa-sync-alt mr-2"></i>Refresh
                    </button>
                </div>
            </div>

            <!-- Portfolio Statistics -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="bg-kwikr-green bg-opacity-10 p-3 rounded-full">
                            <i class="fas fa-briefcase text-kwikr-green text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-900" id="totalPortfolios">0</p>
                            <p class="text-sm text-gray-600">Active Portfolios</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="bg-blue-100 p-3 rounded-full">
                            <i class="fas fa-eye text-blue-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-900" id="totalViews">0</p>
                            <p class="text-sm text-gray-600">Total Views</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="bg-yellow-100 p-3 rounded-full">
                            <i class="fas fa-star text-yellow-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-900" id="avgRating">0.0</p>
                            <p class="text-sm text-gray-600">Average Rating</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <div class="flex items-center">
                        <div class="bg-green-100 p-3 rounded-full">
                            <i class="fas fa-comments text-green-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-900" id="totalTestimonials">0</p>
                            <p class="text-sm text-gray-600">Testimonials</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Portfolio Grid -->
            <div id="portfolioGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Portfolios will be loaded here -->
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-spinner fa-spin text-gray-400 text-3xl mb-4"></i>
                    <p class="text-gray-500 text-lg">Loading your portfolios...</p>
                </div>
            </div>
        </div>

        <!-- Create/Edit Portfolio Modal -->
        <div id="portfolioModal" class="modal fixed inset-0 bg-black bg-opacity-50 z-50 items-center justify-center">
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h2 id="modalTitle" class="text-2xl font-bold text-gray-900">Create New Portfolio</h2>
                        <button onclick="closePortfolioModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <form id="portfolioForm" class="p-6">
                    <div class="space-y-6">
                        <!-- Basic Information -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Portfolio Title *</label>
                                <input type="text" id="portfolioTitle" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green"
                                       placeholder="e.g., Professional Plumbing Services">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
                                <select id="portfolioCategory" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                    <option value="">Select Category</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="House Cleaning">House Cleaning</option>
                                    <option value="Landscaping">Landscaping</option>
                                    <option value="Painting">Painting</option>
                                    <option value="Carpentry">Carpentry</option>
                                    <option value="HVAC">HVAC</option>
                                    <option value="Roofing">Roofing</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
                                <input type="text" id="portfolioServiceType" required
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green"
                                       placeholder="e.g., Emergency Repairs, Installation">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Base Price</label>
                                <div class="flex">
                                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">$</span>
                                    <input type="number" id="portfolioPrice" min="0" step="0.01"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                    <select id="portfolioPriceUnit" class="ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green">
                                        <option value="hour">per hour</option>
                                        <option value="project">per project</option>
                                        <option value="sqft">per sq ft</option>
                                        <option value="day">per day</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea id="portfolioDescription" rows="4"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green"
                                      placeholder="Describe your service, experience, and what makes you unique..."></textarea>
                        </div>

                        <!-- Image Upload Section -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Portfolio Images</label>
                            <div id="imageUploadZone" class="drop-zone border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <i class="fas fa-cloud-upload-alt text-gray-400 text-4xl mb-4"></i>
                                <p class="text-gray-600 mb-2">Drag and drop images here, or click to browse</p>
                                <p class="text-sm text-gray-500">Supported formats: JPG, PNG. Max size: 5MB each</p>
                                <input type="file" id="portfolioImages" multiple accept="image/*" class="hidden">
                                <button type="button" onclick="document.getElementById('portfolioImages').click()" 
                                        class="mt-4 bg-kwikr-green text-white px-4 py-2 rounded-md hover:bg-green-600">
                                    Browse Files
                                </button>
                            </div>
                            <div id="imagePreview" class="mt-4 image-gallery"></div>
                        </div>

                        <!-- Pricing Tiers -->
                        <div>
                            <div class="flex justify-between items-center mb-4">
                                <label class="block text-sm font-medium text-gray-700">Pricing Tiers</label>
                                <button type="button" onclick="addPricingTier()" 
                                        class="text-kwikr-green hover:text-green-600 text-sm font-medium">
                                    <i class="fas fa-plus mr-1"></i>Add Pricing Tier
                                </button>
                            </div>
                            <div id="pricingTiers" class="space-y-4">
                                <!-- Pricing tiers will be added here -->
                            </div>
                        </div>

                        <!-- Service Areas -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Service Areas</label>
                            <div id="serviceAreas">
                                <div class="flex items-center space-x-2 mb-2">
                                    <input type="text" placeholder="Area name (e.g., Downtown Toronto)" 
                                           class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green service-area-input">
                                    <input type="text" placeholder="Postal code" 
                                           class="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green postal-code-input">
                                    <button type="button" onclick="addServiceArea()" class="text-kwikr-green hover:text-green-600">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                            <div id="serviceAreasList" class="mt-2 space-y-1"></div>
                        </div>

                        <!-- Tags -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                            <input type="text" id="portfolioTags" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-kwikr-green focus:border-kwikr-green"
                                   placeholder="Enter tags separated by commas (e.g., emergency, licensed, insured)">
                            <p class="text-sm text-gray-500 mt-1">Tags help clients find your services more easily</p>
                        </div>

                        <!-- Settings -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="flex items-center">
                                <input type="checkbox" id="portfolioFeatured" class="h-4 w-4 text-kwikr-green focus:ring-kwikr-green border-gray-300 rounded">
                                <label for="portfolioFeatured" class="ml-2 block text-sm text-gray-700">
                                    Featured Portfolio
                                </label>
                            </div>
                            <div class="flex items-center">
                                <input type="checkbox" id="portfolioActive" checked class="h-4 w-4 text-kwikr-green focus:ring-kwikr-green border-gray-300 rounded">
                                <label for="portfolioActive" class="ml-2 block text-sm text-gray-700">
                                    Active (visible to clients)
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                        <button type="button" onclick="closePortfolioModal()" 
                                class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" 
                                class="bg-kwikr-green text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors">
                            <i class="fas fa-save mr-2"></i><span id="submitText">Create Portfolio</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Image View Modal -->
        <div id="imageModal" class="modal fixed inset-0 bg-black bg-opacity-75 z-50 items-center justify-center">
            <div class="max-w-4xl w-full mx-4">
                <div class="relative">
                    <img id="modalImage" class="w-full h-auto rounded-lg" src="" alt="">
                    <button onclick="closeImageModal()" 
                            class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
        <script>
            window.currentUser = {
                id: ${user.user_id},
                email: "${user.email}",
                role: "${user.role}",
                firstName: "${user.first_name}",
                lastName: "${user.last_name}"
            };
        </script>
        <script src="/static/portfolio.js"></script>
        <script>
            // Initialize portfolio management when page loads
            document.addEventListener('DOMContentLoaded', function() {
                console.log('DOM loaded, initializing portfolio management');
                initializePortfolioManager();
            });
        </script>
    </body>
    </html>
  `)
})

export default dashboardRoutes

