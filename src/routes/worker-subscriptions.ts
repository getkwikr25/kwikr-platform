import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

export const workerSubscriptionRoutes = new Hono<{ Bindings: Bindings }>()

// Worker Subscription Management Page
workerSubscriptionRoutes.get('/pricing', async (c) => {
  try {
    // Get all active subscription plans
    const plans = await c.env.DB.prepare(`
      SELECT * FROM subscription_plans 
      WHERE is_active = 1 
      ORDER BY display_order, monthly_price
    `).all()

    // Get plan features for each plan
    const planFeatures = new Map()
    for (const plan of (plans.results || [])) {
      const features = await c.env.DB.prepare(`
        SELECT feature_key, feature_name, feature_value, feature_type
        FROM subscription_plan_features
        WHERE plan_id = ? AND is_active = 1
        ORDER BY display_order
      `).bind(plan.id).all()
      planFeatures.set(plan.id, features.results || [])
    }

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Plans - getKwikr</title>
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
      <body class="bg-gray-50">
          <!-- Navigation -->
          <nav class="bg-white shadow-sm border-b border-gray-200">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center h-16">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green hover:text-green-600">
                              <img src="/getkwikr-logo.png" alt="getKwikr" class="h-8 w-8 mr-2 inline-block">getKwikr
                          </a>
                      </div>
                      <div class="flex items-center space-x-4">
                          <a href="/" class="text-gray-700 hover:text-kwikr-green">Home</a>
                          <button onclick="showLoginModal()" class="text-gray-700 hover:text-kwikr-green">
                              Sign In
                          </button>
                          <button onclick="showSignupModal()" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                              Get Started
                          </button>
                      </div>
                  </div>
              </div>
          </nav>

          <!-- Hero Section -->
          <div class="bg-gradient-to-br from-kwikr-green to-green-600 text-white py-16">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h1 class="text-4xl md:text-5xl font-bold mb-6">
                      Choose Your Growth Plan
                  </h1>
                  <p class="text-xl md:text-2xl mb-8 text-green-100">
                      Get more leads, grow your business, and dominate your local market
                  </p>
                  <div class="flex justify-center items-center space-x-4">
                      <span class="text-green-100">Monthly</span>
                      <button id="billingToggle" onclick="toggleBilling()" class="relative inline-flex h-6 w-11 items-center rounded-full bg-green-700 transition-colors focus:outline-none">
                          <span id="billingSlider" class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                      </button>
                      <span class="text-green-100">Annual <span class="text-yellow-300 font-medium">(Save 10%)</span></span>
                  </div>
              </div>
          </div>

          <!-- Pricing Cards -->
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                  ${(plans.results || []).map(plan => {
                    const features = planFeatures.get(plan.id) || []
                    const isRecommended = plan.plan_slug === 'growth-plan'
                    const isPro = plan.plan_slug === 'pro-plan'
                    
                    return `
                      <!-- ${plan.plan_name} -->
                      <div class="relative ${isRecommended ? 'transform scale-105' : ''} ${isPro ? 'bg-gradient-to-b from-yellow-50 to-yellow-100' : 'bg-white'} rounded-2xl shadow-xl border ${isRecommended ? 'border-kwikr-green ring-4 ring-kwikr-green ring-opacity-20' : isPro ? 'border-yellow-200' : 'border-gray-200'} overflow-hidden">
                          ${isRecommended ? `
                              <div class="absolute top-0 left-0 right-0 bg-kwikr-green text-white text-center py-2 text-sm font-medium">
                                  <i class="fas fa-star mr-2"></i>Most Popular
                              </div>
                          ` : ''}
                          
                          ${isPro ? `
                              <div class="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-center py-2 text-sm font-medium">
                                  <i class="fas fa-crown mr-2"></i>Premium Plan
                              </div>
                          ` : ''}
                          
                          <div class="p-8 ${isRecommended || isPro ? 'pt-16' : ''}">
                              <!-- Plan Header -->
                              <div class="text-center mb-8">
                                  <h3 class="text-2xl font-bold ${isPro ? 'text-yellow-800' : 'text-gray-900'} mb-2">
                                      ${plan.plan_name}
                                  </h3>
                                  <div class="mb-4">
                                      <span id="price-${plan.id}-monthly" class="text-5xl font-bold ${isPro ? 'text-yellow-600' : isRecommended ? 'text-kwikr-green' : 'text-gray-900'}">
                                          ${plan.monthly_price > 0 ? '$' + plan.monthly_price : 'FREE'}
                                      </span>
                                      ${plan.monthly_price > 0 ? '<span class="text-gray-600 text-lg">/month</span>' : ''}
                                      
                                      <div id="price-${plan.id}-annual" class="hidden">
                                          <span class="text-5xl font-bold ${isPro ? 'text-yellow-600' : isRecommended ? 'text-kwikr-green' : 'text-gray-900'}">
                                              ${plan.annual_price > 0 ? '$' + Math.round(plan.annual_price / 12) : 'FREE'}
                                          </span>
                                          ${plan.annual_price > 0 ? '<span class="text-gray-600 text-lg">/month</span>' : ''}
                                          ${plan.annual_price > 0 ? `<div class="text-sm text-gray-500">Billed annually ($${plan.annual_price})</div>` : ''}
                                      </div>
                                  </div>
                                  <p class="text-gray-600 text-sm leading-relaxed">
                                      ${plan.description}
                                  </p>
                              </div>

                              <!-- Features List -->
                              <div class="space-y-3 mb-8">
                                  ${features.map(feature => {
                                    let displayValue = feature.feature_value
                                    let icon = 'fas fa-check'
                                    let textColor = 'text-green-600'
                                    
                                    if (feature.feature_type === 'boolean' && feature.feature_value === '1') {
                                        displayValue = ''
                                    } else if (feature.feature_type === 'boolean' && feature.feature_value === '0') {
                                        displayValue = 'No'
                                        icon = 'fas fa-times'
                                        textColor = 'text-red-500'
                                    } else if (feature.feature_key === 'search_tier') {
                                        displayValue = 'Tier ' + feature.feature_value
                                    } else if (feature.feature_key === 'categories_limit') {
                                        displayValue = feature.feature_value + ' Categories'
                                    } else if (feature.feature_key === 'per_booking_fee') {
                                        displayValue = '$' + feature.feature_value + ' per booking'
                                    } else if (feature.feature_key === 'revenue_percentage') {
                                        displayValue = feature.feature_value + '%'
                                    }
                                    
                                    return '<div class="flex items-center">' +
                                        '<i class="' + icon + ' ' + textColor + ' mr-3 text-sm"></i>' +
                                        '<span class="text-gray-700 text-sm">' +
                                        feature.feature_name +
                                        (displayValue ? ' - ' + displayValue : '') +
                                        '</span>' +
                                        '</div>'
                                  }).join('')}
                              </div>

                              <!-- CTA Button -->
                              <div class="text-center">
                                  <a href="/signup/worker?plan=${
                                            plan.plan_slug === 'pay-as-you-go' ? 'payasyougo' :
                                            plan.plan_slug === 'growth-plan' ? 'growth' :
                                            plan.plan_slug === 'pro-plan' ? 'pro' : 'payasyougo'
                                          }" 
                                          class="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 block text-center ${
                                            plan.plan_slug === 'pay-as-you-go' ? 
                                              'bg-gray-800 text-white hover:bg-gray-900' :
                                            isRecommended ? 
                                              'bg-kwikr-green text-white hover:bg-green-600 transform hover:scale-105' :
                                            isPro ?
                                              'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 transform hover:scale-105' :
                                              'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                          }">
                                      ${plan.monthly_price === 0 ? 'GET STARTED FOR FREE' : 
                                        plan.plan_slug === 'growth-plan' ? 'GET THE GROWTH PLAN' : 
                                        'GET THE PRO PLAN'}
                                  </a>
                                  
                                  ${plan.monthly_price === 0 ? `
                                      <div class="mt-3 flex items-center justify-center text-sm text-green-600">
                                          <i class="fas fa-shield-check mr-1"></i>
                                          Risk-free entry with zero upfront cost
                                      </div>
                                  ` : ''}
                              </div>
                          </div>
                      </div>
                    `
                  }).join('')}
              </div>
          </div>

          <!-- Comparison Table -->
          <div class="bg-white py-16">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="text-center mb-12">
                      <h2 class="text-3xl font-bold text-gray-900 mb-4">
                          Compare All Features
                      </h2>
                      <p class="text-gray-600">
                          See exactly what's included in each plan
                      </p>
                  </div>

                  <div class="overflow-x-auto">
                      <table class="w-full border-collapse bg-white rounded-lg shadow-lg overflow-hidden">
                          <thead>
                              <tr class="bg-gray-50">
                                  <th class="px-6 py-4 text-left text-sm font-medium text-gray-900 border-b">Features</th>
                                  ${(plans.results || []).map(plan => `
                                      <th class="px-6 py-4 text-center text-sm font-medium ${
                                        plan.plan_slug === 'pro-plan' ? 'text-yellow-600' :
                                        plan.plan_slug === 'growth-plan' ? 'text-kwikr-green' : 'text-gray-900'
                                      } border-b">
                                          ${plan.plan_name}
                                          <div class="text-xs text-gray-500 mt-1">
                                              ${plan.monthly_price > 0 ? '$' + plan.monthly_price + '/mo' : 'FREE'}
                                          </div>
                                      </th>
                                  `).join('')}
                              </tr>
                          </thead>
                          <tbody>
                              <!-- Features will be populated here -->
                              <tr class="border-b border-gray-200">
                                  <td class="px-6 py-4 text-sm text-gray-900 font-medium">Search Results Ranking</td>
                                  <td class="px-6 py-4 text-center text-sm text-gray-600">Tier 3</td>
                                  <td class="px-6 py-4 text-center text-sm text-gray-600">Tier 2</td>
                                  <td class="px-6 py-4 text-center text-sm text-gray-600">
                                      <div class="flex items-center justify-center">
                                          <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Tier 1 + Featured</span>
                                      </div>
                                  </td>
                              </tr>
                              <tr class="border-b border-gray-200 bg-gray-50">
                                  <td class="px-6 py-4 text-sm text-gray-900 font-medium">Service Categories</td>
                                  <td class="px-6 py-4 text-center text-sm text-gray-600">1</td>
                                  <td class="px-6 py-4 text-center text-sm text-gray-600">5</td>
                                  <td class="px-6 py-4 text-center text-sm text-gray-600">10</td>
                              </tr>
                              <tr class="border-b border-gray-200">
                                  <td class="px-6 py-4 text-sm text-gray-900 font-medium">Lead Generation</td>
                                  <td class="px-6 py-4 text-center text-sm text-gray-600">$2 per booking</td>
                                  <td class="px-6 py-4 text-center text-sm text-green-600">Unlimited</td>
                                  <td class="px-6 py-4 text-center text-sm text-green-600">Unlimited</td>
                              </tr>
                              <tr class="border-b border-gray-200 bg-gray-50">
                                  <td class="px-6 py-4 text-sm text-gray-900 font-medium">Contact Information Display</td>
                                  <td class="px-6 py-4 text-center text-sm text-gray-600">
                                      <i class="fas fa-times text-red-500"></i>
                                  </td>
                                  <td class="px-6 py-4 text-center text-sm text-green-600">
                                      <i class="fas fa-check text-green-500"></i>
                                  </td>
                                  <td class="px-6 py-4 text-center text-sm text-green-600">
                                      <i class="fas fa-check text-green-500"></i>
                                  </td>
                              </tr>
                              <tr class="border-b border-gray-200">
                                  <td class="px-6 py-4 text-sm text-gray-900 font-medium">Advanced Features</td>
                                  <td class="px-6 py-4 text-center text-sm text-gray-600">Basic</td>
                                  <td class="px-6 py-4 text-center text-sm text-gray-600">Advanced</td>
                                  <td class="px-6 py-4 text-center text-sm text-yellow-600">
                                      <div class="text-xs">AI Chatbot + Video Reels + Magazine Spotlight</div>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>

          <!-- FAQ Section -->
          <div class="bg-gray-50 py-16">
              <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="text-center mb-12">
                      <h2 class="text-3xl font-bold text-gray-900 mb-4">
                          Frequently Asked Questions
                      </h2>
                  </div>

                  <div class="space-y-6">
                      <div class="bg-white rounded-lg shadow-sm p-6">
                          <h3 class="text-lg font-semibold text-gray-900 mb-2">
                              Can I change plans at any time?
                          </h3>
                          <p class="text-gray-600">
                              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.
                          </p>
                      </div>

                      <div class="bg-white rounded-lg shadow-sm p-6">
                          <h3 class="text-lg font-semibold text-gray-900 mb-2">
                              What happens if I cancel my subscription?
                          </h3>
                          <p class="text-gray-600">
                              You can cancel anytime and continue using your current plan until the end of your billing period. After that, you'll be moved to the Pay-as-you-go plan.
                          </p>
                      </div>

                      <div class="bg-white rounded-lg shadow-sm p-6">
                          <h3 class="text-lg font-semibent text-gray-900 mb-2">
                              Do you offer annual discounts?
                          </h3>
                          <p class="text-gray-600">
                              Yes! Save 10% when you choose annual billing. You can switch between monthly and annual billing at any time.
                          </p>
                      </div>
                  </div>
              </div>
          </div>

          <script>
              let isAnnual = false;

              function toggleBilling() {
                  isAnnual = !isAnnual;
                  const slider = document.getElementById('billingSlider');
                  
                  if (isAnnual) {
                      slider.classList.add('translate-x-6');
                      slider.classList.remove('translate-x-1');
                  } else {
                      slider.classList.add('translate-x-1');
                      slider.classList.remove('translate-x-6');
                  }

                  // Toggle price displays
                  const plans = ${JSON.stringify((plans.results || []).map(p => ({ id: p.id, monthly: p.monthly_price, annual: p.annual_price })))};
                  
                  plans.forEach(plan => {
                      const monthlyEl = document.getElementById(\`price-\${plan.id}-monthly\`);
                      const annualEl = document.getElementById(\`price-\${plan.id}-annual\`);
                      
                      if (isAnnual) {
                          monthlyEl.classList.add('hidden');
                          annualEl.classList.remove('hidden');
                      } else {
                          monthlyEl.classList.remove('hidden');
                          annualEl.classList.add('hidden');
                      }
                  });
              }

              // Plan selection now uses direct links to signup pages - no JavaScript function needed

              function showLoginModal() {
                  alert('Login modal coming soon!');
              }

              function showSignupModal() {
                  alert('Signup modal coming soon!');
              }
          </script>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading subscription pricing:', error)
    return c.html(`
      <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
              <h1 class="text-2xl font-bold text-red-600 mb-4">Error Loading Pricing</h1>
              <p class="text-gray-600">Please try again later</p>
              <a href="/" class="bg-blue-500 text-white px-4 py-2 rounded mt-4 inline-block">Back to Home</a>
          </div>
      </div>
    `)
  }
})