// Kwikr Directory - Main App JavaScript

// Global configuration
const API_BASE = '/api'
let currentUser = null

// Utility functions
function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  notification.className = `notification ${type}`
  notification.innerHTML = `
    <div class="flex items-center justify-between">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `
  
  document.body.appendChild(notification)
  
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove()
    }
  }, 5000)
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(amount)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getStatusBadge(status) {
  const statusClasses = {
    'posted': 'status-posted',
    'assigned': 'status-assigned',
    'in_progress': 'status-in-progress',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled',
    'verified': 'status-verified',
    'pending': 'status-pending',
    'rejected': 'status-rejected'
  }
  
  const statusLabels = {
    'posted': 'Posted',
    'assigned': 'Assigned',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'verified': 'Verified',
    'pending': 'Pending',
    'rejected': 'Rejected'
  }
  
  return `<span class="status-badge ${statusClasses[status] || 'status-pending'}">${statusLabels[status] || status}</span>`
}

function getUrgencyBadge(urgency) {
  const urgencyClasses = {
    'low': 'job-urgency-low',
    'normal': 'job-urgency-normal',
    'high': 'job-urgency-high',
    'urgent': 'job-urgency-urgent'
  }
  
  const urgencyLabels = {
    'low': 'Low',
    'normal': 'Normal',
    'high': 'High',
    'urgent': 'Urgent'
  }
  
  return `<span class="status-badge ${urgencyClasses[urgency] || 'job-urgency-normal'}">${urgencyLabels[urgency] || urgency}</span>`
}

// API helper functions
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('sessionToken')
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  }
  
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }
    
    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Modal functions
function showLoginModal() {
  document.getElementById('loginModal').classList.remove('hidden')
  document.getElementById('loginModal').classList.add('modal-enter')
}

function hideLoginModal() {
  document.getElementById('loginModal').classList.add('hidden')
  document.getElementById('loginModal').classList.remove('modal-enter')
}

function showSignupModal(userType = '') {
  document.getElementById('signupModal').classList.remove('hidden')
  document.getElementById('signupModal').classList.add('modal-enter')
  
  if (userType) {
    selectUserType(userType)
  }
}

function hideSignupModal() {
  document.getElementById('signupModal').classList.add('hidden')
  document.getElementById('signupModal').classList.remove('modal-enter')
}

function selectUserType(type) {
  document.getElementById('userRole').value = type
  
  // Update button styles
  const clientBtn = document.getElementById('clientBtn')
  const workerBtn = document.getElementById('workerBtn')
  
  clientBtn.className = clientBtn.className.replace('border-kwikr-green bg-green-50', 'border-gray-200')
  workerBtn.className = workerBtn.className.replace('border-kwikr-green bg-green-50', 'border-gray-200')
  
  if (type === 'client') {
    clientBtn.className = clientBtn.className.replace('border-gray-200', 'border-kwikr-green bg-green-50')
  } else if (type === 'worker') {
    workerBtn.className = workerBtn.className.replace('border-gray-200', 'border-kwikr-green bg-green-50')
  }
}

// Authentication functions
async function handleLogin(event) {
  event.preventDefault()
  
  const email = document.getElementById('loginEmail').value
  const password = document.getElementById('loginPassword').value
  
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    
    localStorage.setItem('sessionToken', response.sessionToken)
    currentUser = response.user
    
    showNotification('Login successful!', 'success')
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 1000)
    
  } catch (error) {
    showNotification(error.message, 'error')
  }
}

async function handleSignup(event) {
  event.preventDefault()
  
  const role = document.getElementById('userRole').value
  const firstName = document.getElementById('firstName').value
  const lastName = document.getElementById('lastName').value
  const email = document.getElementById('signupEmail').value
  const password = document.getElementById('signupPassword').value
  const province = document.getElementById('province').value
  const city = document.getElementById('city').value
  
  if (!role) {
    showNotification('Please select an account type', 'warning')
    return
  }
  
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        email,
        password,
        role,
        firstName,
        lastName,
        province,
        city
      }
    })
    
    showNotification('Account created successfully! Please log in.', 'success')
    
    hideSignupModal()
    showLoginModal()
    
    // Pre-fill login form
    document.getElementById('loginEmail').value = email
    
  } catch (error) {
    showNotification(error.message, 'error')
  }
}

async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' })
    
    localStorage.removeItem('sessionToken')
    currentUser = null
    
    showNotification('Logged out successfully', 'success')
    
    setTimeout(() => {
      window.location.href = '/'
    }, 1000)
    
  } catch (error) {
    // Even if logout fails, clear local storage
    localStorage.removeItem('sessionToken')
    currentUser = null
    window.location.href = '/'
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
  // Check for existing session
  const token = localStorage.getItem('sessionToken')
  if (token) {
    try {
      const response = await apiRequest('/auth/me')
      currentUser = response.user
      
      // If on main page and logged in, redirect to dashboard
      if (window.location.pathname === '/') {
        window.location.href = '/dashboard'
      }
    } catch (error) {
      // Invalid session, remove token
      localStorage.removeItem('sessionToken')
    }
  }
  
  // Check URL parameters for login prompts
  const params = new URLSearchParams(window.location.search)
  if (params.get('login') === 'required') {
    showNotification('Please log in to access this page', 'warning')
    showLoginModal()
  } else if (params.get('session') === 'expired') {
    showNotification('Your session has expired. Please log in again.', 'warning')
    showLoginModal()
  }
})

// Global error handler
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason)
  showNotification('An unexpected error occurred. Please try again.', 'error')
})

// Export functions for global use
window.showLoginModal = showLoginModal
window.hideLoginModal = hideLoginModal
window.showSignupModal = showSignupModal
window.hideSignupModal = hideSignupModal
window.selectUserType = selectUserType
window.handleLogin = handleLogin
window.handleSignup = handleSignup
window.logout = logout
window.apiRequest = apiRequest
window.showNotification = showNotification
window.formatCurrency = formatCurrency
window.formatDate = formatDate
window.getStatusBadge = getStatusBadge
window.getUrgencyBadge = getUrgencyBadge