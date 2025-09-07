// Booking System Frontend JavaScript

// Global booking state
window.BookingSystem = {
  selectedTimeSlot: null,
  selectedDuration: 0,
  selectedCost: 0,
  currentBooking: null
}

// Initialize booking system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Booking system initialized')
  
  // Auto-detect timezone
  if (document.getElementById('clientTimezone')) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const timezoneSelect = document.getElementById('clientTimezone')
    
    // Try to match detected timezone with available options
    for (let option of timezoneSelect.options) {
      if (option.value === timezone) {
        option.selected = true
        break
      }
    }
  }
})

// Calendar navigation functions
function navigateCalendar(direction) {
  const currentUrl = new URL(window.location.href)
  const currentMonth = currentUrl.searchParams.get('month') || new Date().toISOString().slice(0, 7)
  
  const [year, month] = currentMonth.split('-').map(Number)
  const newDate = new Date(year, month - 1 + direction, 1)
  const newMonth = newDate.toISOString().slice(0, 7)
  
  currentUrl.searchParams.set('month', newMonth)
  window.location.href = currentUrl.toString()
}

// Booking form validation
function validateBookingForm() {
  const requiredFields = [
    'serviceCategory',
    'serviceProvider', 
    'bookingDate',
    'clientName',
    'clientEmail'
  ]
  
  let isValid = true
  const errors = []
  
  for (const fieldId of requiredFields) {
    const field = document.getElementById(fieldId)
    if (!field || !field.value.trim()) {
      isValid = false
      errors.push(`${fieldId} is required`)
      
      if (field) {
        field.classList.add('border-red-500')
      }
    } else {
      if (field) {
        field.classList.remove('border-red-500')
      }
    }
  }
  
  // Check if time slot is selected
  if (!window.BookingSystem.selectedTimeSlot) {
    isValid = false
    errors.push('Please select a time slot')
  }
  
  // Email validation
  const email = document.getElementById('clientEmail')
  if (email && email.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      isValid = false
      errors.push('Please enter a valid email address')
      email.classList.add('border-red-500')
    }
  }
  
  return { isValid, errors }
}

// Show/hide loading state
function setLoadingState(element, isLoading) {
  if (isLoading) {
    element.disabled = true
    element.dataset.originalText = element.innerHTML
    element.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...'
  } else {
    element.disabled = false
    if (element.dataset.originalText) {
      element.innerHTML = element.dataset.originalText
    }
  }
}

// Display notification messages
function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    type === 'warning' ? 'bg-yellow-500 text-white' :
    'bg-blue-500 text-white'
  }`
  notification.innerHTML = `
    <div class="flex items-center">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `
  
  document.body.appendChild(notification)
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove()
    }
  }, 5000)
}

// Format time for display
function formatTime(timeString, format24h = false) {
  const [hours, minutes] = timeString.split(':').map(Number)
  
  if (format24h) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
  
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })
}

// Calculate duration display
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  } else {
    return `${mins} minutes`
  }
}

// Debounce function for API calls
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// API error handling
function handleApiError(error, fallbackMessage = 'An error occurred') {
  console.error('API Error:', error)
  
  if (error.message) {
    showNotification(error.message, 'error')
  } else if (typeof error === 'string') {
    showNotification(error, 'error')
  } else {
    showNotification(fallbackMessage, 'error')
  }
}

// Timezone conversion helper
function convertToUserTimezone(datetime, timezone) {
  try {
    const date = new Date(datetime)
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    console.error('Timezone conversion error:', error)
    return datetime
  }
}

// Local storage helpers for booking drafts
function saveBookingDraft(data) {
  try {
    localStorage.setItem('bookingDraft', JSON.stringify({
      ...data,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.warn('Could not save booking draft:', error)
  }
}

function loadBookingDraft() {
  try {
    const draft = localStorage.getItem('bookingDraft')
    if (draft) {
      const parsed = JSON.parse(draft)
      
      // Check if draft is less than 24 hours old
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed
      } else {
        localStorage.removeItem('bookingDraft')
      }
    }
  } catch (error) {
    console.warn('Could not load booking draft:', error)
  }
  return null
}

function clearBookingDraft() {
  try {
    localStorage.removeItem('bookingDraft')
  } catch (error) {
    console.warn('Could not clear booking draft:', error)
  }
}

// Booking conflict detection
function checkTimeSlotConflicts(selectedSlot, existingBookings) {
  const selectedStart = new Date(`2000-01-01T${selectedSlot.start_time}`)
  const selectedEnd = new Date(`2000-01-01T${selectedSlot.end_time}`)
  
  return existingBookings.some(booking => {
    const bookingStart = new Date(`2000-01-01T${booking.start_time}`)
    const bookingEnd = new Date(`2000-01-01T${booking.end_time}`)
    
    return !(selectedEnd <= bookingStart || selectedStart >= bookingEnd)
  })
}

// Recurring booking pattern helpers
function generateRecurringDates(pattern, startDate, endDate, maxOccurrences = 50) {
  const dates = []
  const start = new Date(startDate + 'T00:00:00')
  const end = endDate ? new Date(endDate + 'T00:00:00') : null
  
  let current = new Date(start)
  let count = 0
  
  while (count < maxOccurrences && (!end || current <= end)) {
    dates.push(current.toISOString().slice(0, 10))
    
    switch (pattern.type) {
      case 'daily':
        current.setDate(current.getDate() + (pattern.frequency || 1))
        break
      case 'weekly':
        current.setDate(current.getDate() + (7 * (pattern.frequency || 1)))
        break
      case 'monthly':
        current.setMonth(current.getMonth() + (pattern.frequency || 1))
        break
    }
    
    count++
  }
  
  return dates
}

// Export for global access
window.BookingSystem.utils = {
  validateBookingForm,
  setLoadingState,
  showNotification,
  formatTime,
  formatDate,
  formatDuration,
  debounce,
  handleApiError,
  convertToUserTimezone,
  saveBookingDraft,
  loadBookingDraft,
  clearBookingDraft,
  checkTimeSlotConflicts,
  generateRecurringDates
}