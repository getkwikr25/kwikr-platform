// Search & Discovery JavaScript
// Client-side functionality for worker directory and search features

// Global state
let currentFilters = {}
let searchTimeout = null

// ============================================================================
// Filter Management
// ============================================================================

function toggleFilters() {
    const panel = document.getElementById('filtersPanel')
    if (panel) {
        panel.classList.toggle('hidden')
    }
}

function clearFilters() {
    // Clear all form inputs
    const form = document.querySelector('#filtersPanel form')
    if (form) {
        const inputs = form.querySelectorAll('input, select')
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false
            } else {
                input.value = ''
            }
        })
    }
    
    // Redirect to clean directory page
    window.location.href = '/search/directory'
}

function updateSort() {
    const sortSelect = document.getElementById('sortSelect')
    if (sortSelect) {
        const currentUrl = new URL(window.location.href)
        currentUrl.searchParams.set('sort', sortSelect.value)
        window.location.href = currentUrl.toString()
    }
}

function updateCityFilter() {
    const provinceSelect = document.querySelector('select[name="province"]')
    const citySelect = document.querySelector('select[name="city"]')
    
    if (provinceSelect && citySelect && provinceSelect.value) {
        // Clear current city options
        citySelect.innerHTML = '<option value="">Loading cities...</option>'
        
        // Fetch cities for selected province
        fetch(`/api/search/cities/${encodeURIComponent(provinceSelect.value)}`)
            .then(response => response.json())
            .then(data => {
                citySelect.innerHTML = '<option value="">All Cities</option>'
                if (data.cities && data.cities.length > 0) {
                    data.cities.forEach(city => {
                        const option = document.createElement('option')
                        option.value = city.city
                        option.textContent = `${city.city} (${city.worker_count})`
                        citySelect.appendChild(option)
                    })
                } else {
                    citySelect.innerHTML = '<option value="">No cities found</option>'
                }
            })
            .catch(error => {
                console.error('Error loading cities:', error)
                citySelect.innerHTML = '<option value="">All Cities</option>'
            })
    } else if (citySelect) {
        // Reset to all cities if no province selected
        citySelect.innerHTML = '<option value="">All Cities</option>'
    }
}

// ============================================================================
// Worker Interaction Functions
// ============================================================================

function contactWorker(workerId) {
    // Check if user is logged in
    fetch('/api/auth/me')
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                // User is logged in, show contact modal or redirect to messaging
                showContactModal(workerId)
            } else {
                // User not logged in, redirect to login
                showNotification('Please log in to contact workers', 'info')
                setTimeout(() => {
                    window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.href)
                }, 1500)
            }
        })
        .catch(error => {
            console.error('Auth check error:', error)
            showNotification('Please log in to contact workers', 'info')
            setTimeout(() => {
                window.location.href = '/auth/login'
            }, 1500)
        })
}

function showContactModal(workerId) {
    // Create and show contact modal
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Contact Worker</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form onsubmit="sendContactMessage(event, ${workerId})">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent" placeholder="Project inquiry">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                        <textarea required rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kwikr-green focus:border-transparent" placeholder="Describe your project and requirements..."></textarea>
                    </div>
                </div>
                <div class="flex justify-end space-x-3 mt-6">
                    <button type="button" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        <i class="fas fa-paper-plane mr-2"></i>Send Message
                    </button>
                </div>
            </form>
        </div>
    `
    document.body.appendChild(modal)
}

function sendContactMessage(event, workerId) {
    event.preventDefault()
    
    const form = event.target
    const formData = new FormData(form)
    const subject = formData.get('subject') || form.querySelector('input[type="text"]').value
    const message = formData.get('message') || form.querySelector('textarea').value
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...'
    submitBtn.disabled = true
    
    // Send message via API
    fetch('/api/messages/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            worker_id: workerId,
            subject: subject,
            message: message
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Message sent successfully!', 'success')
            form.closest('.fixed').remove() // Close modal
        } else {
            throw new Error(data.error || 'Failed to send message')
        }
    })
    .catch(error => {
        console.error('Message send error:', error)
        showNotification(error.message || 'Failed to send message', 'error')
        
        // Restore button
        submitBtn.innerHTML = originalText
        submitBtn.disabled = false
    })
}

function saveWorker(workerId) {
    fetch('/api/saved-workers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ worker_id: workerId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Worker saved to your list!', 'success')
            // Update save button if it exists
            const saveBtn = document.querySelector(`[onclick*="${workerId}"][onclick*="saveWorker"]`)
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-heart mr-2"></i>Saved'
                saveBtn.className = saveBtn.className.replace('border-kwikr-green text-kwikr-green', 'bg-red-100 border-red-300 text-red-700')
                saveBtn.onclick = null
            }
        } else {
            throw new Error(data.error || 'Failed to save worker')
        }
    })
    .catch(error => {
        console.error('Save worker error:', error)
        showNotification(error.message || 'Failed to save worker', 'error')
    })
}

// ============================================================================
// Geolocation Functions
// ============================================================================

function enableGeolocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by your browser', 'error')
        return
    }
    
    showNotification('Getting your location...', 'info')
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords
            
            // Update URL with geolocation parameters
            const currentUrl = new URL(window.location.href)
            currentUrl.searchParams.set('lat', latitude.toString())
            currentUrl.searchParams.set('lng', longitude.toString())
            currentUrl.searchParams.set('radius', '25') // 25km default radius
            
            window.location.href = currentUrl.toString()
        },
        (error) => {
            console.error('Geolocation error:', error)
            let message = 'Failed to get your location'
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Location access denied. Please enable location services.'
                    break
                case error.POSITION_UNAVAILABLE:
                    message = 'Location information unavailable.'
                    break
                case error.TIMEOUT:
                    message = 'Location request timed out.'
                    break
            }
            showNotification(message, 'error')
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        }
    )
}

// ============================================================================
// Search Functions
// ============================================================================

function performQuickSearch(query) {
    if (!query.trim()) return
    
    // Show loading state
    showNotification('Searching...', 'info')
    
    // Redirect to directory with search query
    const searchUrl = new URL('/search/directory', window.location.origin)
    searchUrl.searchParams.set('category', query)
    
    window.location.href = searchUrl.toString()
}

function searchByCategory(category) {
    const searchUrl = new URL('/search/directory', window.location.origin)
    searchUrl.searchParams.set('category', category)
    window.location.href = searchUrl.toString()
}

// Debounced search for real-time filtering
function debouncedSearch(query) {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        if (query.trim().length > 2) {
            performQuickSearch(query)
        }
    }, 500)
}

// ============================================================================
// Advanced Search Functions
// ============================================================================

function openAdvancedSearch() {
    window.location.href = '/search/advanced'
}

function saveSearchPreferences(preferences) {
    try {
        localStorage.setItem('searchPreferences', JSON.stringify(preferences))
        showNotification('Search preferences saved!', 'success')
    } catch (error) {
        console.error('Failed to save preferences:', error)
        showNotification('Failed to save preferences', 'error')
    }
}

function loadSearchPreferences() {
    try {
        const preferences = localStorage.getItem('searchPreferences')
        return preferences ? JSON.parse(preferences) : {}
    } catch (error) {
        console.error('Failed to load preferences:', error)
        return {}
    }
}

function applySearchPreferences() {
    const preferences = loadSearchPreferences()
    
    // Apply preferences to form fields
    Object.keys(preferences).forEach(key => {
        const element = document.querySelector(`[name="${key}"]`)
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = preferences[key]
            } else {
                element.value = preferences[key]
            }
        }
    })
}

// ============================================================================
// Utility Functions
// ============================================================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
    }`
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `
    
    document.body.appendChild(notification)
    
    // Animate in
    setTimeout(() => notification.classList.remove('translate-x-full'), 100)
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full')
        setTimeout(() => notification.remove(), 300)
    }, 5000)
}

function formatDistance(distanceKm) {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)}m away`
    } else if (distanceKm < 10) {
        return `${distanceKm.toFixed(1)}km away`
    } else {
        return `${Math.round(distanceKm)}km away`
    }
}

function generateWorkerInitials(firstName, lastName, companyName) {
    if (companyName) {
        return companyName.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase()
    }
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function getAvatarColor(initials) {
    const colors = [
        'from-blue-500 to-purple-600',
        'from-green-500 to-teal-600', 
        'from-red-500 to-pink-600',
        'from-yellow-500 to-orange-600',
        'from-indigo-500 to-blue-600',
        'from-purple-500 to-indigo-600',
        'from-pink-500 to-rose-600',
        'from-teal-500 to-cyan-600'
    ]
    
    // Use the first character's ASCII code to pick a color
    const index = initials.charCodeAt(0) % colors.length
    return colors[index]
}

// ============================================================================
// Real-time Search Updates (Advanced Feature)
// ============================================================================

function setupRealTimeSearch() {
    const searchInput = document.getElementById('realTimeSearch')
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value)
        })
    }
}

function updateResultsCount() {
    // Update results count in real-time as filters change
    const form = document.querySelector('#filtersPanel form')
    if (form) {
        const formData = new FormData(form)
        const params = new URLSearchParams()
        
        for (let [key, value] of formData.entries()) {
            if (value) params.append(key, value)
        }
        
        // Add count=true to get only count
        params.append('count', 'true')
        
        fetch(`/search/directory?${params.toString()}`)
            .then(response => response.json())
            .then(data => {
                const countElement = document.getElementById('resultsCount')
                if (countElement && data.total !== undefined) {
                    countElement.textContent = data.total
                }
            })
            .catch(error => {
                console.error('Count update error:', error)
            })
    }
}

// ============================================================================
// Comparison Features
// ============================================================================

let comparisonList = []

function addToComparison(workerId, workerName) {
    if (comparisonList.length >= 3) {
        showNotification('Maximum 3 workers can be compared', 'error')
        return
    }
    
    if (!comparisonList.find(w => w.id === workerId)) {
        comparisonList.push({ id: workerId, name: workerName })
        updateComparisonUI()
        showNotification(`${workerName} added to comparison`, 'success')
    } else {
        showNotification('Worker already in comparison', 'info')
    }
}

function removeFromComparison(workerId) {
    comparisonList = comparisonList.filter(w => w.id !== workerId)
    updateComparisonUI()
    showNotification('Worker removed from comparison', 'info')
}

function updateComparisonUI() {
    const comparisonBtn = document.getElementById('comparisonBtn')
    if (comparisonBtn) {
        if (comparisonList.length > 0) {
            comparisonBtn.style.display = 'block'
            comparisonBtn.innerHTML = `
                <i class="fas fa-balance-scale mr-2"></i>
                Compare Workers (${comparisonList.length})
            `
        } else {
            comparisonBtn.style.display = 'none'
        }
    }
}

function viewComparison() {
    if (comparisonList.length < 2) {
        showNotification('Select at least 2 workers to compare', 'error')
        return
    }
    
    const workerIds = comparisonList.map(w => w.id).join(',')
    window.location.href = `/search/compare?workers=${workerIds}`
}

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize search preferences
    applySearchPreferences()
    
    // Setup real-time search
    setupRealTimeSearch()
    
    // Initialize geolocation button if present
    const geoBtn = document.getElementById('enableGeolocation')
    if (geoBtn) {
        geoBtn.addEventListener('click', enableGeolocation)
    }
    
    // Initialize filter change handlers for real-time count updates
    const filterInputs = document.querySelectorAll('#filtersPanel input, #filtersPanel select')
    filterInputs.forEach(input => {
        input.addEventListener('change', updateResultsCount)
    })
    
    // Check for URL parameters and auto-enable location if lat/lng present
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('lat') && urlParams.has('lng')) {
        const lat = parseFloat(urlParams.get('lat'))
        const lng = parseFloat(urlParams.get('lng'))
        
        // Add distance information to results if location is enabled
        // This would be handled server-side in a real implementation
        console.log('Location-based search active:', { lat, lng })
    }
    
    console.log('Search & Discovery system initialized')
})

// Export functions for global access
window.searchFunctions = {
    toggleFilters,
    clearFilters,
    updateSort,
    updateCityFilter,
    contactWorker,
    saveWorker,
    enableGeolocation,
    performQuickSearch,
    searchByCategory,
    openAdvancedSearch,
    addToComparison,
    removeFromComparison,
    viewComparison
}