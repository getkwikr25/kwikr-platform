import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { authRoutes } from './routes/auth'
import { jobRoutes } from './routes/jobs'
import { userRoutes } from './routes/users'
import { adminRoutes } from './routes/admin'
import { dashboardRoutes } from './routes/dashboard'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/jobs', jobRoutes)
app.route('/api/users', userRoutes)
app.route('/api/admin', adminRoutes)

// Dashboard Routes (SSR)
app.route('/dashboard', dashboardRoutes)

// Main landing page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kwikr Directory - Connect with Canadian Service Providers</title>
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
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-white font-sans">
        <!-- Navigation -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <h1 class="text-2xl font-bold text-kwikr-green">
                                <i class="fas fa-bolt mr-2"></i>Kwikr Directory
                            </h1>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <a href="#" class="text-gray-700 hover:text-kwikr-green transition-colors">How it Works</a>
                        <a href="#" class="text-gray-700 hover:text-kwikr-green transition-colors">Find Services</a>
                        <button onclick="showLoginModal()" class="text-gray-700 hover:text-kwikr-green transition-colors">
                            Sign In
                        </button>
                        <button onclick="showSignupModal()" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                            Get Started
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <div class="bg-gradient-to-r from-kwikr-green to-green-600 text-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div class="text-center">
                    <h1 class="text-5xl font-bold mb-6">
                        Connect with Canada's Top Service Providers
                    </h1>
                    <p class="text-xl mb-8 max-w-3xl mx-auto">
                        Find verified, licensed contractors and service providers across Canada. 
                        Post jobs, receive bids, and pay securely with escrow protection.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onclick="showSignupModal('client')" class="bg-white text-kwikr-green px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            <i class="fas fa-user mr-2"></i>I Need Services
                        </button>
                        <button onclick="showSignupModal('worker')" class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-kwikr-green transition-colors">
                            <i class="fas fa-tools mr-2"></i>I Provide Services
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Features Section -->
        <div class="py-24 bg-kwikr-gray">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">Why Choose Kwikr Directory?</h2>
                    <p class="text-lg text-gray-600">Connecting Canadians with trusted service providers</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="bg-white p-8 rounded-lg shadow-sm">
                        <div class="text-kwikr-green text-3xl mb-4">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h3 class="text-xl font-semibold mb-3">Verified Professionals</h3>
                        <p class="text-gray-600">All service providers are verified with proper licenses, insurance, and WSIB coverage.</p>
                    </div>
                    
                    <div class="bg-white p-8 rounded-lg shadow-sm">
                        <div class="text-kwikr-green text-3xl mb-4">
                            <i class="fas fa-credit-card"></i>
                        </div>
                        <h3 class="text-xl font-semibold mb-3">Secure Payments</h3>
                        <p class="text-gray-600">Escrow protection ensures payment is only released when work is completed to your satisfaction.</p>
                    </div>
                    
                    <div class="bg-white p-8 rounded-lg shadow-sm">
                        <div class="text-kwikr-green text-3xl mb-4">
                            <i class="fas fa-star"></i>
                        </div>
                        <h3 class="text-xl font-semibold mb-3">Rated & Reviewed</h3>
                        <p class="text-gray-600">See real reviews and ratings from previous clients to make informed decisions.</p>
                    </div>
                    
                    <div class="bg-white p-8 rounded-lg shadow-sm">
                        <div class="text-kwikr-green text-3xl mb-4">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <h3 class="text-xl font-semibold mb-3">Local Providers</h3>
                        <p class="text-gray-600">Find service providers in your area across all Canadian provinces.</p>
                    </div>
                    
                    <div class="bg-white p-8 rounded-lg shadow-sm">
                        <div class="text-kwikr-green text-3xl mb-4">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <h3 class="text-xl font-semibold mb-3">Fair Bidding</h3>
                        <p class="text-gray-600">Receive multiple competitive bids and choose the best value for your project.</p>
                    </div>
                    
                    <div class="bg-white p-8 rounded-lg shadow-sm">
                        <div class="text-kwikr-green text-3xl mb-4">
                            <i class="fas fa-headset"></i>
                        </div>
                        <h3 class="text-xl font-semibold mb-3">24/7 Support</h3>
                        <p class="text-gray-600">Our support team is available to help resolve any issues or disputes.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Service Categories -->
        <div class="py-24">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">Popular Service Categories</h2>
                    <p class="text-lg text-gray-600">Find professionals for any project</p>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    <div class="text-center p-6 border border-gray-200 rounded-lg hover:border-kwikr-green hover:shadow-md transition-all cursor-pointer">
                        <i class="fas fa-hard-hat text-3xl text-kwikr-green mb-3"></i>
                        <p class="font-medium">Construction</p>
                    </div>
                    <div class="text-center p-6 border border-gray-200 rounded-lg hover:border-kwikr-green hover:shadow-md transition-all cursor-pointer">
                        <i class="fas fa-wrench text-3xl text-kwikr-green mb-3"></i>
                        <p class="font-medium">Plumbing</p>
                    </div>
                    <div class="text-center p-6 border border-gray-200 rounded-lg hover:border-kwikr-green hover:shadow-md transition-all cursor-pointer">
                        <i class="fas fa-bolt text-3xl text-kwikr-green mb-3"></i>
                        <p class="font-medium">Electrical</p>
                    </div>
                    <div class="text-center p-6 border border-gray-200 rounded-lg hover:border-kwikr-green hover:shadow-md transition-all cursor-pointer">
                        <i class="fas fa-fan text-3xl text-kwikr-green mb-3"></i>
                        <p class="font-medium">HVAC</p>
                    </div>
                    <div class="text-center p-6 border border-gray-200 rounded-lg hover:border-kwikr-green hover:shadow-md transition-all cursor-pointer">
                        <i class="fas fa-seedling text-3xl text-kwikr-green mb-3"></i>
                        <p class="font-medium">Landscaping</p>
                    </div>
                    <div class="text-center p-6 border border-gray-200 rounded-lg hover:border-kwikr-green hover:shadow-md transition-all cursor-pointer">
                        <i class="fas fa-broom text-3xl text-kwikr-green mb-3"></i>
                        <p class="font-medium">Cleaning</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Login Modal -->
        <div id="loginModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded-lg max-w-md w-full mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold">Sign In</h3>
                    <button onclick="hideLoginModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="loginForm" onsubmit="handleLogin(event)">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" id="loginEmail" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" required>
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input type="password" id="loginPassword" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" required>
                    </div>
                    
                    <button type="submit" class="w-full bg-kwikr-green text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                        Sign In
                    </button>
                </form>
                
                <p class="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? 
                    <button onclick="hideLoginModal(); showSignupModal()" class="text-kwikr-green hover:underline">Sign up</button>
                </p>
            </div>
        </div>

        <!-- Signup Modal -->
        <div id="signupModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded-lg max-w-md w-full mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold">Get Started</h3>
                    <button onclick="hideSignupModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-6">
                    <p class="text-sm text-gray-600 mb-4">Choose your account type:</p>
                    <div class="grid grid-cols-2 gap-4">
                        <button onclick="selectUserType('client')" id="clientBtn" class="p-4 border-2 border-gray-200 rounded-lg text-center hover:border-kwikr-green transition-colors">
                            <i class="fas fa-user text-2xl text-kwikr-green mb-2"></i>
                            <p class="font-medium">I Need Services</p>
                            <p class="text-xs text-gray-500">Post jobs & hire</p>
                        </button>
                        <button onclick="selectUserType('worker')" id="workerBtn" class="p-4 border-2 border-gray-200 rounded-lg text-center hover:border-kwikr-green transition-colors">
                            <i class="fas fa-tools text-2xl text-kwikr-green mb-2"></i>
                            <p class="font-medium">I Provide Services</p>
                            <p class="text-xs text-gray-500">Find work & earn</p>
                        </button>
                    </div>
                </div>
                
                <form id="signupForm" onsubmit="handleSignup(event)">
                    <input type="hidden" id="userRole" value="">
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input type="text" id="firstName" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input type="text" id="lastName" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" required>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" id="signupEmail" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" required>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input type="password" id="signupPassword" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" required>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Province</label>
                            <select id="province" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" required>
                                <option value="">Select Province</option>
                                <option value="AB">Alberta</option>
                                <option value="BC">British Columbia</option>
                                <option value="MB">Manitoba</option>
                                <option value="NB">New Brunswick</option>
                                <option value="NL">Newfoundland and Labrador</option>
                                <option value="NS">Nova Scotia</option>
                                <option value="NT">Northwest Territories</option>
                                <option value="NU">Nunavut</option>
                                <option value="ON">Ontario</option>
                                <option value="PE">Prince Edward Island</option>
                                <option value="QC">Quebec</option>
                                <option value="SK">Saskatchewan</option>
                                <option value="YT">Yukon</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input type="text" id="city" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-kwikr-green" required>
                        </div>
                    </div>
                    
                    <button type="submit" class="w-full bg-kwikr-green text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                        Create Account
                    </button>
                </form>
                
                <p class="mt-4 text-center text-sm text-gray-600">
                    Already have an account? 
                    <button onclick="hideSignupModal(); showLoginModal()" class="text-kwikr-green hover:underline">Sign in</button>
                </p>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
