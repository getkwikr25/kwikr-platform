import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

export const dashboardRoutes = new Hono<{ Bindings: Bindings }>()

// Middleware to verify authentication and get user
const requireAuth = async (c: any, next: any) => {
  const sessionToken = c.req.header('Cookie')?.match(/session=([^;]+)/)?.[1] || 
                       c.req.query('token')
  
  if (!sessionToken) {
    return c.redirect('/?login=required')
  }
  
  const session = await c.env.DB.prepare(`
    SELECT s.user_id, u.role, u.first_name, u.last_name, u.email, u.is_verified
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = 1
  `).bind(sessionToken).first()
  
  if (!session) {
    return c.redirect('/?session=expired')
  }
  
  c.set('user', session)
  await next()
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
                            <p class="text-2xl font-bold text-gray-900" id="totalJobs">-</p>
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
                            <p class="text-2xl font-bold text-gray-900" id="activeJobs">-</p>
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
                            <p class="text-2xl font-bold text-gray-900" id="completedJobs">-</p>
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
                            <p class="text-2xl font-bold text-gray-900" id="pendingBids">-</p>
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
                                <button onclick="showPostJobModal()" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                    <i class="fas fa-plus mr-2"></i>Post New Job
                                </button>
                            </div>
                        </div>
                        
                        <div id="jobsList" class="divide-y divide-gray-200">
                            <!-- Jobs will be loaded here -->
                            <div class="p-6 text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin text-2xl mb-4"></i>
                                <p>Loading your jobs...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Quick Actions -->
                    <div class="bg-white rounded-lg shadow-sm p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div class="space-y-3">
                            <button onclick="showPostJobModal()" class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kwikr-green hover:bg-green-50">
                                <i class="fas fa-briefcase text-kwikr-green mr-3"></i>
                                Post a New Job
                            </button>
                            <button onclick="browseWorkers()" class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kwikr-green hover:bg-green-50">
                                <i class="fas fa-search text-kwikr-green mr-3"></i>
                                Browse Service Providers
                            </button>
                            <button onclick="viewProfile()" class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kwikr-green hover:bg-green-50">
                                <i class="fas fa-user text-kwikr-green mr-3"></i>
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white rounded-lg shadow-sm p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div id="recentActivity" class="space-y-3">
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
        <script src="/static/client-dashboard.js"></script>
    </body>
    </html>
  `)
})

// Worker Dashboard
dashboardRoutes.get('/worker', requireAuth, async (c) => {
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
                <p class="text-gray-600">Find jobs and manage your services</p>
            </div>

            <!-- Verification Alert (if not verified) -->
            <div id="verificationAlert" class="mb-6 hidden">
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div class="flex items-center">
                        <div class="text-yellow-400 mr-3">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div>
                            <h3 class="font-medium text-yellow-800">Complete Your Verification</h3>
                            <p class="text-sm text-yellow-700 mt-1">
                                Complete your compliance verification to start bidding on jobs.
                            </p>
                        </div>
                        <button onclick="showComplianceModal()" class="ml-auto bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium">
                            Start Verification
                        </button>
                    </div>
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
                            <p class="text-2xl font-bold text-gray-900" id="totalBids">-</p>
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
                            <p class="text-2xl font-bold text-gray-900" id="activeJobs">-</p>
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
                            <p class="text-2xl font-bold text-gray-900" id="avgRating">-</p>
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
                            <p class="text-2xl font-bold text-gray-900" id="totalEarnings">-</p>
                            <p class="text-sm text-gray-600">Total Earnings</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Available Jobs -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-lg shadow-sm">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex justify-between items-center">
                                <h2 class="text-xl font-semibold text-gray-900">Available Jobs</h2>
                                <div class="flex space-x-2">
                                    <select id="jobFilter" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                        <option value="">All Categories</option>
                                    </select>
                                    <button onclick="loadAvailableJobs()" class="text-kwikr-green hover:text-green-600">
                                        <i class="fas fa-refresh"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div id="jobsList" class="divide-y divide-gray-200">
                            <div class="p-6 text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin text-2xl mb-4"></i>
                                <p>Loading available jobs...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Quick Actions -->
                    <div class="bg-white rounded-lg shadow-sm p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div class="space-y-3">
                            <button onclick="showComplianceModal()" class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kwikr-green hover:bg-green-50">
                                <i class="fas fa-certificate text-kwikr-green mr-3"></i>
                                Manage Compliance
                            </button>
                            <button onclick="showServicesModal()" class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kwikr-green hover:bg-green-50">
                                <i class="fas fa-cog text-kwikr-green mr-3"></i>
                                Manage Services
                            </button>
                            <button onclick="viewMyBids()" class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kwikr-green hover:bg-green-50">
                                <i class="fas fa-eye text-kwikr-green mr-3"></i>
                                View My Bids
                            </button>
                            <button onclick="viewProfile()" class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kwikr-green hover:bg-green-50">
                                <i class="fas fa-user text-kwikr-green mr-3"></i>
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    <!-- My Services -->
                    <div class="bg-white rounded-lg shadow-sm p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">My Services</h3>
                        <div id="myServices">
                            <div class="text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p class="text-sm mt-2">Loading...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/worker-dashboard.js"></script>
    </body>
    </html>
  `)
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
        <title>Admin Dashboard - Kwikr Directory</title>
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

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p class="text-gray-600">Platform management and oversight</p>
            </div>

            <!-- Platform Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="text-blue-500 text-2xl mr-4">
                            <i class="fas fa-users"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="totalUsers">-</p>
                            <p class="text-sm text-gray-600">Total Users</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="text-kwikr-green text-2xl mr-4">
                            <i class="fas fa-briefcase"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="totalJobs">-</p>
                            <p class="text-sm text-gray-600">Total Jobs</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="text-yellow-500 text-2xl mr-4">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="pendingCompliance">-</p>
                            <p class="text-sm text-gray-600">Pending Reviews</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="text-red-500 text-2xl mr-4">
                            <i class="fas fa-flag"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-900" id="activeDisputes">-</p>
                            <p class="text-sm text-gray-600">Active Disputes</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content Tabs -->
            <div class="bg-white rounded-lg shadow-sm">
                <div class="border-b border-gray-200">
                    <nav class="flex">
                        <button onclick="showTab('overview')" class="admin-tab active px-6 py-3 border-b-2 border-kwikr-green text-kwikr-green font-medium">
                            Overview
                        </button>
                        <button onclick="showTab('users')" class="admin-tab px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                            Users
                        </button>
                        <button onclick="showTab('compliance')" class="admin-tab px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                            Compliance
                        </button>
                        <button onclick="showTab('disputes')" class="admin-tab px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                            Disputes
                        </button>
                        <button onclick="showTab('analytics')" class="admin-tab px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
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
        <script src="/static/admin-dashboard.js"></script>
    </body>
    </html>
  `)
})

