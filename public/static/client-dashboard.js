// Kwikr Directory - Client Dashboard JavaScript

let jobCategories = []
let currentUser = null

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
  await loadJobCategories()
  await loadUserStats()
  await loadMyJobs()
  await loadRecentActivity()
})

// Load job categories for form
async function loadJobCategories() {
  try {
    const response = await apiRequest('/jobs/categories')
    jobCategories = response.categories
    
    const categorySelect = document.getElementById('jobCategory')
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Select Category</option>'
      
      jobCategories.forEach(category => {
        const option = document.createElement('option')
        option.value = category.id
        option.textContent = category.name
        categorySelect.appendChild(option)
      })
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

// Load user statistics
async function loadUserStats() {
  try {
    const response = await apiRequest('/jobs/user/my-jobs')
    const jobs = response.jobs
    
    const totalJobs = jobs.length
    const activeJobs = jobs.filter(job => ['posted', 'assigned', 'in_progress'].includes(job.status)).length
    const completedJobs = jobs.filter(job => job.status === 'completed').length
    const pendingBids = jobs.filter(job => job.status === 'posted').reduce((sum, job) => sum + (job.bid_count || 0), 0)
    
    document.getElementById('totalJobs').textContent = totalJobs
    document.getElementById('activeJobs').textContent = activeJobs
    document.getElementById('completedJobs').textContent = completedJobs
    document.getElementById('pendingBids').textContent = pendingBids
    
  } catch (error) {
    console.error('Failed to load user stats:', error)
  }
}

// Load user's jobs
async function loadMyJobs() {
  try {
    const response = await apiRequest('/jobs/user/my-jobs')
    const jobs = response.jobs
    
    const jobsList = document.getElementById('jobsList')
    
    if (jobs.length === 0) {
      jobsList.innerHTML = `
        <div class="p-6 text-center text-gray-500">
          <i class="fas fa-briefcase text-4xl mb-4"></i>
          <p class="text-lg mb-2">No jobs posted yet</p>
          <p class="text-sm">Post your first job to get started!</p>
          <button onclick="showPostJobModal()" class="mt-4 bg-kwikr-green text-white px-6 py-2 rounded-lg hover:bg-green-600">
            <i class="fas fa-plus mr-2"></i>Post Your First Job
          </button>
        </div>
      `
      return
    }
    
    jobsList.innerHTML = jobs.map(job => `
      <div class="p-6">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">${job.title}</h3>
            <p class="text-sm text-gray-600 mb-2">
              <i class="fas fa-tag mr-1"></i>${job.category_name} • 
              <i class="fas fa-map-marker-alt mr-1"></i>${job.location_city}, ${job.location_province}
            </p>
            <p class="text-gray-700 mb-3">${job.description.length > 100 ? job.description.substring(0, 100) + '...' : job.description}</p>
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <span><i class="fas fa-dollar-sign mr-1"></i>${formatCurrency(job.budget_min)} - ${formatCurrency(job.budget_max)}</span>
              <span><i class="fas fa-calendar mr-1"></i>Posted ${formatDate(job.created_at)}</span>
            </div>
          </div>
          <div class="flex flex-col items-end space-y-2 ml-4">
            ${getStatusBadge(job.status)}
            ${job.status === 'posted' && job.bid_count > 0 ? `<span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">${job.bid_count} bid${job.bid_count !== 1 ? 's' : ''}</span>` : ''}
          </div>
        </div>
        
        ${job.worker_first_name ? `
          <div class="bg-gray-50 p-3 rounded-lg mb-3">
            <p class="text-sm text-gray-600">
              <i class="fas fa-user mr-1"></i>Assigned to: 
              <span class="font-medium">${job.worker_first_name} ${job.worker_last_name}</span>
            </p>
          </div>
        ` : ''}
        
        <div class="flex justify-between items-center">
          <div class="flex space-x-2">
            <button onclick="viewJobDetails(${job.id})" class="text-kwikr-green hover:text-green-600 text-sm font-medium">
              <i class="fas fa-eye mr-1"></i>View Details
            </button>
            ${job.status === 'posted' ? `
              <button onclick="editJob(${job.id})" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                <i class="fas fa-edit mr-1"></i>Edit
              </button>
            ` : ''}
            ${job.status === 'completed' ? `
              <button onclick="leaveReview(${job.id})" class="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                <i class="fas fa-star mr-1"></i>Leave Review
              </button>
            ` : ''}
          </div>
          <div class="text-xs text-gray-500">
            Updated ${formatDate(job.updated_at)}
          </div>
        </div>
      </div>
    `).join('')
    
  } catch (error) {
    console.error('Failed to load jobs:', error)
    document.getElementById('jobsList').innerHTML = `
      <div class="p-6 text-center text-red-500">
        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
        <p>Failed to load jobs. Please refresh the page.</p>
      </div>
    `
  }
}

// Load recent activity
async function loadRecentActivity() {
  try {
    const response = await apiRequest('/users/notifications?limit=5')
    const notifications = response.notifications
    
    const activityDiv = document.getElementById('recentActivity')
    
    if (notifications.length === 0) {
      activityDiv.innerHTML = `
        <div class="text-center text-gray-500 py-4">
          <p class="text-sm">No recent activity</p>
        </div>
      `
      return
    }
    
    activityDiv.innerHTML = notifications.map(notification => `
      <div class="flex items-start space-x-3 p-3 rounded-lg ${notification.is_read ? 'bg-white' : 'bg-blue-50'}">
        <div class="flex-shrink-0 mt-1">
          <div class="w-2 h-2 bg-kwikr-green rounded-full"></div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">${notification.title}</p>
          <p class="text-xs text-gray-600">${notification.message}</p>
          <p class="text-xs text-gray-500 mt-1">${formatDate(notification.created_at)}</p>
        </div>
      </div>
    `).join('')
    
  } catch (error) {
    console.error('Failed to load recent activity:', error)
  }
}

// Show post job modal
function showPostJobModal() {
  document.getElementById('postJobModal').classList.remove('hidden')
}

// Hide post job modal
function hidePostJobModal() {
  document.getElementById('postJobModal').classList.add('hidden')
  document.getElementById('postJobForm').reset()
}

// Handle job posting
async function handlePostJob(event) {
  event.preventDefault()
  
  const formData = {
    title: document.getElementById('jobTitle').value,
    description: document.getElementById('jobDescription').value,
    categoryId: parseInt(document.getElementById('jobCategory').value),
    budgetMin: parseFloat(document.getElementById('budgetMin').value),
    budgetMax: parseFloat(document.getElementById('budgetMax').value),
    urgency: document.getElementById('jobUrgency').value,
    locationAddress: document.getElementById('locationAddress').value,
    startDate: document.getElementById('startDate').value,
    expectedCompletion: document.getElementById('expectedCompletion').value
  }
  
  try {
    const response = await apiRequest('/jobs', {
      method: 'POST',
      body: formData
    })
    
    showNotification('Job posted successfully!', 'success')
    hidePostJobModal()
    
    // Reload jobs and stats
    await loadMyJobs()
    await loadUserStats()
    
  } catch (error) {
    showNotification(error.message, 'error')
  }
}

// View job details
function viewJobDetails(jobId) {
  // In a full implementation, this would open a detailed view modal
  showNotification('Job details view coming soon!', 'info')
}

// Edit job
function editJob(jobId) {
  // In a full implementation, this would open the edit modal
  showNotification('Job editing coming soon!', 'info')
}

// Leave review
function leaveReview(jobId) {
  // In a full implementation, this would open a review modal
  showNotification('Review system coming soon!', 'info')
}

// Browse workers
function browseWorkers() {
  // In a full implementation, this would navigate to worker search
  showNotification('Worker search coming soon!', 'info')
}

// View profile
function viewProfile() {
  // In a full implementation, this would open profile management
  showNotification('Profile management coming soon!', 'info')
}

// Global functions
window.showPostJobModal = showPostJobModal
window.hidePostJobModal = hidePostJobModal
window.handlePostJob = handlePostJob
window.viewJobDetails = viewJobDetails
window.editJob = editJob
window.leaveReview = leaveReview
window.browseWorkers = browseWorkers
window.viewProfile = viewProfile