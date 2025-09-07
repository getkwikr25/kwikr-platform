// Client Dashboard JavaScript
// Handles all client dashboard functionality

// Configuration
const API_BASE = '/api/client-dashboard';
const CLIENT_ID = 1; // Mock client ID - in real app, this would come from authentication

// State management
let currentSection = 'overview';
let jobs = [];
let favorites = [];
let paymentMethods = [];
let serviceHistory = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

/**
 * INITIALIZATION FUNCTIONS
 */
function initializeDashboard() {
    // Show default section
    showSection('overview');
    
    // Load initial data
    loadDashboardData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set minimum date for job posting to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('jobDate').min = today;
    
    console.log('Client Dashboard initialized');
}

function setupEventListeners() {
    // Profile form submission
    document.getElementById('profileForm')?.addEventListener('submit', handleProfileUpdate);
    
    // Job creation form submission
    document.getElementById('createJobForm')?.addEventListener('submit', handleJobCreation);
    
    // Payment method form submission
    document.getElementById('addPaymentForm')?.addEventListener('submit', handlePaymentMethodAdd);
    
    // Notification form submission
    document.getElementById('notificationForm')?.addEventListener('submit', handleNotificationUpdate);
}

/**
 * NAVIGATION FUNCTIONS
 */
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => section.classList.add('hidden'));
    
    // Show selected section
    const selectedSection = document.getElementById(`${sectionName}-section`);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
    }
    
    // Update navigation active state
    const navButtons = document.querySelectorAll('.dashboard-nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-kwikr-green', 'text-white');
        btn.classList.add('text-gray-700');
    });
    
    // Activate current button
    const activeButton = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active', 'bg-kwikr-green', 'text-white');
        activeButton.classList.remove('text-gray-700');
    }
    
    currentSection = sectionName;
    
    // Load section-specific data
    loadSectionData(sectionName);
}

function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'overview':
            loadOverviewData();
            break;
        case 'profile':
            loadProfileData();
            break;
        case 'jobs':
            loadJobs();
            break;
        case 'favorites':
            loadFavorites();
            break;
        case 'payments':
            loadPaymentMethods();
            break;
        case 'history':
            loadServiceHistory();
            break;
        case 'notifications':
            loadNotificationPreferences();
            break;
    }
}

/**
 * DATA LOADING FUNCTIONS
 */
async function loadDashboardData() {
    try {
        showLoading(true);
        
        // Load dashboard summary
        const response = await fetch(`${API_BASE}/summary/${CLIENT_ID}`);
        if (response.ok) {
            const data = await response.json();
            updateDashboardStats(data);
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    } finally {
        showLoading(false);
    }
}

async function loadOverviewData() {
    // Update recent activity (mock data for now)
    const recentActivity = document.getElementById('recentActivity');
    if (recentActivity) {
        // Activity will be loaded from API in real implementation
        console.log('Overview data loaded');
    }
}

async function loadProfileData() {
    try {
        const response = await fetch(`${API_BASE}/profile/${CLIENT_ID}`);
        if (response.ok) {
            const profile = await response.json();
            populateProfileForm(profile);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile data');
    }
}

async function loadJobs() {
    try {
        showLoading(true);
        
        const statusFilter = document.getElementById('jobStatusFilter')?.value || '';
        const sortFilter = document.getElementById('jobSortFilter')?.value || 'created_at';
        
        const params = new URLSearchParams({
            status: statusFilter,
            sortBy: sortFilter,
            limit: '20',
            offset: '0'
        });
        
        const response = await fetch(`${API_BASE}/jobs/${CLIENT_ID}?${params}`);
        if (response.ok) {
            jobs = await response.json();
            renderJobs(jobs);
        } else {
            // Show mock data if API fails
            jobs = getMockJobs();
            renderJobs(jobs);
        }
        
    } catch (error) {
        console.error('Error loading jobs:', error);
        jobs = getMockJobs();
        renderJobs(jobs);
    } finally {
        showLoading(false);
    }
}

async function loadFavorites() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/favorites/${CLIENT_ID}`);
        if (response.ok) {
            favorites = await response.json();
            renderFavorites(favorites);
        } else {
            // Show mock data if API fails
            favorites = getMockFavorites();
            renderFavorites(favorites);
        }
        
    } catch (error) {
        console.error('Error loading favorites:', error);
        favorites = getMockFavorites();
        renderFavorites(favorites);
    } finally {
        showLoading(false);
    }
}

async function loadPaymentMethods() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/payment-methods/${CLIENT_ID}`);
        if (response.ok) {
            paymentMethods = await response.json();
            renderPaymentMethods(paymentMethods);
        } else {
            // Show mock data if API fails
            paymentMethods = getMockPaymentMethods();
            renderPaymentMethods(paymentMethods);
        }
        
    } catch (error) {
        console.error('Error loading payment methods:', error);
        paymentMethods = getMockPaymentMethods();
        renderPaymentMethods(paymentMethods);
    } finally {
        showLoading(false);
    }
}

async function loadServiceHistory() {
    try {
        showLoading(true);
        
        const statusFilter = document.getElementById('historyStatusFilter')?.value || '';
        const serviceFilter = document.getElementById('historyServiceFilter')?.value || '';
        const dateFilter = document.getElementById('historyDateFilter')?.value || '';
        
        const params = new URLSearchParams({
            status: statusFilter,
            serviceType: serviceFilter,
            limit: '20',
            offset: '0'
        });
        
        if (dateFilter) {
            const date = new Date(dateFilter);
            params.append('startDate', `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`);
            params.append('endDate', `${date.getFullYear()}-${String(date.getMonth() + 2).padStart(2, '0')}-01`);
        }
        
        const response = await fetch(`${API_BASE}/history/${CLIENT_ID}?${params}`);
        if (response.ok) {
            serviceHistory = await response.json();
            renderServiceHistory(serviceHistory);
        } else {
            // Show mock data if API fails
            serviceHistory = getMockServiceHistory();
            renderServiceHistory(serviceHistory);
        }
        
    } catch (error) {
        console.error('Error loading service history:', error);
        serviceHistory = getMockServiceHistory();
        renderServiceHistory(serviceHistory);
    } finally {
        showLoading(false);
    }
}

async function loadNotificationPreferences() {
    try {
        const response = await fetch(`${API_BASE}/notifications/${CLIENT_ID}`);
        if (response.ok) {
            const preferences = await response.json();
            populateNotificationForm(preferences);
        }
    } catch (error) {
        console.error('Error loading notification preferences:', error);
        showError('Failed to load notification preferences');
    }
}

/**
 * RENDERING FUNCTIONS
 */
function updateDashboardStats(data) {
    if (data) {
        document.getElementById('activeJobsCount').textContent = data.activeJobs || 3;
        document.getElementById('favoritesCount').textContent = data.favoriteWorkers || 12;
        document.getElementById('completedServicesCount').textContent = data.completedServices || 28;
        document.getElementById('totalSpent').textContent = `$${data.totalSpent || '2,340'}`;
    }
}

function renderJobs(jobsData) {
    const jobsList = document.getElementById('jobsList');
    if (!jobsList) return;
    
    if (!jobsData || jobsData.length === 0) {
        jobsList.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm p-8 text-center">
                <i class="fas fa-briefcase text-gray-400 text-4xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
                <p class="text-gray-600 mb-4">You haven't posted any jobs yet.</p>
                <button onclick="showCreateJobModal()" class="bg-kwikr-green text-white px-6 py-2 rounded-lg hover:bg-green-600">
                    <i class="fas fa-plus mr-2"></i>Post Your First Job
                </button>
            </div>
        `;
        return;
    }
    
    jobsList.innerHTML = jobsData.map(job => `
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">${job.title}</h3>
                    <p class="text-gray-600 text-sm mb-3">${job.description}</p>
                    <div class="flex flex-wrap gap-2 mb-3">
                        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">${job.category}</span>
                        <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">$${job.budget}</span>
                        <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">${formatJobStatus(job.status)}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-calendar mr-1"></i>
                        <span>Posted ${formatDate(job.created_at)}</span>
                        <i class="fas fa-map-marker-alt ml-4 mr-1"></i>
                        <span>${job.location}</span>
                    </div>
                </div>
                <div class="flex space-x-2 ml-4">
                    <button onclick="editJob(${job.id})" class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="viewJobBids(${job.id})" class="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="deleteJob(${job.id})" class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${job.bids_count ? `
                <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">${job.bids_count} bid(s) received</span>
                        <button onclick="viewJobBids(${job.id})" class="text-kwikr-green hover:text-green-600 text-sm font-medium">
                            View Bids <i class="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function renderFavorites(favoritesData) {
    const favoritesList = document.getElementById('favoritesList');
    if (!favoritesList) return;
    
    if (!favoritesData || favoritesData.length === 0) {
        favoritesList.innerHTML = `
            <div class="col-span-full bg-white rounded-lg shadow-sm p-8 text-center">
                <i class="fas fa-heart text-gray-400 text-4xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No Favorite Workers</h3>
                <p class="text-gray-600 mb-4">You haven't added any workers to your favorites yet.</p>
                <a href="/search" class="bg-kwikr-green text-white px-6 py-2 rounded-lg hover:bg-green-600 inline-block">
                    <i class="fas fa-search mr-2"></i>Find Workers
                </a>
            </div>
        `;
        return;
    }
    
    favoritesList.innerHTML = favoritesData.map(favorite => `
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="text-center mb-4">
                ${favorite.worker_image ? 
                    `<img src="${favorite.worker_image}" alt="${favorite.worker_name}" class="w-20 h-20 rounded-full object-cover mx-auto mb-3">` :
                    `<div class="w-20 h-20 rounded-full bg-kwikr-green text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                        ${getInitials(favorite.worker_name)}
                    </div>`
                }
                <h3 class="font-semibold text-gray-900">${favorite.worker_name}</h3>
                <p class="text-sm text-gray-600 mb-2">${favorite.worker_services}</p>
                <div class="flex justify-center items-center mb-2">
                    <span class="text-yellow-400 text-sm">★★★★★</span>
                    <span class="ml-1 text-sm text-gray-600">${favorite.worker_rating || '4.8'}</span>
                </div>
            </div>
            
            ${favorite.notes ? `
                <div class="bg-gray-50 p-3 rounded-lg mb-4">
                    <p class="text-sm text-gray-600 italic">"${favorite.notes}"</p>
                </div>
            ` : ''}
            
            <div class="flex space-x-2">
                <a href="/universal-profile/${favorite.worker_id}" class="flex-1 bg-kwikr-green text-white text-center py-2 rounded-lg hover:bg-green-600 text-sm">
                    <i class="fas fa-eye mr-1"></i>View Profile
                </a>
                <button onclick="removeFavorite(${favorite.worker_id})" class="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm">
                    <i class="fas fa-heart-broken"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderPaymentMethods(methodsData) {
    const paymentMethodsList = document.getElementById('paymentMethodsList');
    if (!paymentMethodsList) return;
    
    if (!methodsData || methodsData.length === 0) {
        paymentMethodsList.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm p-8 text-center">
                <i class="fas fa-credit-card text-gray-400 text-4xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No Payment Methods</h3>
                <p class="text-gray-600 mb-4">Add a payment method to start booking services.</p>
                <button onclick="showAddPaymentModal()" class="bg-kwikr-green text-white px-6 py-2 rounded-lg hover:bg-green-600">
                    <i class="fas fa-plus mr-2"></i>Add Payment Method
                </button>
            </div>
        `;
        return;
    }
    
    paymentMethodsList.innerHTML = methodsData.map(method => `
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-start">
                <div class="flex items-center">
                    <div class="bg-blue-100 p-3 rounded-lg mr-4">
                        <i class="fas ${getCardIcon(method.card_brand)} text-blue-600 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900">${formatCardBrand(method.card_brand)} •••• ${method.card_last_four}</h3>
                        <p class="text-sm text-gray-600">Expires ${method.expiry_month}/${method.expiry_year}</p>
                        ${method.is_default ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Default</span>' : ''}
                    </div>
                </div>
                <div class="flex space-x-2">
                    ${!method.is_default ? `
                        <button onclick="setDefaultPayment(${method.id})" class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50" title="Set as default">
                            <i class="fas fa-star"></i>
                        </button>
                    ` : ''}
                    <button onclick="editPaymentMethod(${method.id})" class="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deletePaymentMethod(${method.id})" class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderServiceHistory(historyData) {
    const serviceHistoryList = document.getElementById('serviceHistoryList');
    if (!serviceHistoryList) return;
    
    if (!historyData || historyData.length === 0) {
        serviceHistoryList.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm p-8 text-center">
                <i class="fas fa-history text-gray-400 text-4xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No Service History</h3>
                <p class="text-gray-600 mb-4">Your completed services will appear here.</p>
                <a href="/search" class="bg-kwikr-green text-white px-6 py-2 rounded-lg hover:bg-green-600 inline-block">
                    <i class="fas fa-search mr-2"></i>Book a Service
                </a>
            </div>
        `;
        return;
    }
    
    serviceHistoryList.innerHTML = historyData.map(service => `
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <h3 class="text-lg font-semibold text-gray-900 mr-3">${service.service_type}</h3>
                        <span class="bg-${service.status === 'completed' ? 'green' : 'red'}-100 text-${service.status === 'completed' ? 'green' : 'red'}-800 text-xs px-2 py-1 rounded-full">
                            ${formatServiceStatus(service.status)}
                        </span>
                    </div>
                    <p class="text-gray-600 text-sm mb-2">Provided by ${service.worker_name}</p>
                    <div class="flex items-center text-sm text-gray-500 mb-2">
                        <i class="fas fa-calendar mr-1"></i>
                        <span>${formatDate(service.service_date)}</span>
                        <i class="fas fa-clock ml-4 mr-1"></i>
                        <span>${service.duration} hours</span>
                        <i class="fas fa-dollar-sign ml-4 mr-1"></i>
                        <span>$${service.cost}</span>
                    </div>
                    ${service.notes ? `
                        <p class="text-sm text-gray-600 bg-gray-50 p-2 rounded">${service.notes}</p>
                    ` : ''}
                </div>
                <div class="flex space-x-2 ml-4">
                    ${service.status === 'completed' && !service.reviewed ? `
                        <button onclick="showReviewModal(${service.id})" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm">
                            <i class="fas fa-star mr-1"></i>Review
                        </button>
                    ` : ''}
                    <button onclick="viewServiceDetails(${service.id})" class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            
            ${service.reviewed ? `
                <div class="bg-yellow-50 p-3 rounded-lg">
                    <div class="flex items-center">
                        <span class="text-yellow-400 text-sm mr-2">★★★★★</span>
                        <span class="text-sm text-gray-600">You rated this service ${service.rating}/5 stars</span>
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

/**
 * FORM HANDLING FUNCTIONS
 */
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    try {
        showLoading(true);
        
        const formData = new FormData(event.target);
        const profileData = Object.fromEntries(formData);
        
        const response = await fetch(`${API_BASE}/profile/${CLIENT_ID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });
        
        if (response.ok) {
            showSuccess('Profile updated successfully!');
        } else {
            throw new Error('Failed to update profile');
        }
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Failed to update profile');
    } finally {
        showLoading(false);
    }
}

async function handleJobCreation(event) {
    event.preventDefault();
    
    try {
        showLoading(true);
        
        const formData = new FormData(event.target);
        const jobData = Object.fromEntries(formData);
        
        const response = await fetch(`${API_BASE}/jobs/${CLIENT_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        });
        
        if (response.ok) {
            hideCreateJobModal();
            showSuccess('Job posted successfully!');
            loadJobs(); // Reload jobs list
        } else {
            throw new Error('Failed to create job');
        }
        
    } catch (error) {
        console.error('Error creating job:', error);
        showError('Failed to create job');
    } finally {
        showLoading(false);
    }
}

async function handlePaymentMethodAdd(event) {
    event.preventDefault();
    
    try {
        showLoading(true);
        
        const formData = new FormData(event.target);
        const paymentData = {
            type: 'card',
            card_last_four: formData.get('cardNumber').slice(-4),
            card_brand: detectCardBrand(formData.get('cardNumber')),
            expiry_month: formData.get('expiryDate').split('/')[0],
            expiry_year: formData.get('expiryDate').split('/')[1],
            cardholder_name: formData.get('cardholderName'),
            is_default: formData.get('setAsDefault') === 'on'
        };
        
        const response = await fetch(`${API_BASE}/payment-methods/${CLIENT_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });
        
        if (response.ok) {
            hideAddPaymentModal();
            showSuccess('Payment method added successfully!');
            loadPaymentMethods(); // Reload payment methods
        } else {
            throw new Error('Failed to add payment method');
        }
        
    } catch (error) {
        console.error('Error adding payment method:', error);
        showError('Failed to add payment method');
    } finally {
        showLoading(false);
    }
}

async function handleNotificationUpdate(event) {
    event.preventDefault();
    
    try {
        showLoading(true);
        
        const formData = new FormData(event.target);
        const notificationData = {
            email_job_updates: formData.get('emailJobUpdates') === 'on',
            email_new_bids: formData.get('emailNewBids') === 'on',
            email_messages: formData.get('emailMessages') === 'on',
            email_payments: formData.get('emailPayments') === 'on',
            sms_job_updates: formData.get('smsJobUpdates') === 'on',
            sms_reminders: formData.get('smsReminders') === 'on',
            sms_payments: formData.get('smsPayments') === 'on',
            push_job_updates: formData.get('pushJobUpdates') === 'on',
            push_messages: formData.get('pushMessages') === 'on',
            push_promotions: formData.get('pushPromotions') === 'on'
        };
        
        const response = await fetch(`${API_BASE}/notifications/${CLIENT_ID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(notificationData)
        });
        
        if (response.ok) {
            showSuccess('Notification preferences updated!');
        } else {
            throw new Error('Failed to update notification preferences');
        }
        
    } catch (error) {
        console.error('Error updating notifications:', error);
        showError('Failed to update notification preferences');
    } finally {
        showLoading(false);
    }
}

/**
 * MODAL FUNCTIONS
 */
function showCreateJobModal() {
    document.getElementById('createJobModal').classList.remove('hidden');
}

function hideCreateJobModal() {
    document.getElementById('createJobModal').classList.add('hidden');
    document.getElementById('createJobForm').reset();
}

function showAddPaymentModal() {
    document.getElementById('addPaymentModal').classList.remove('hidden');
}

function hideAddPaymentModal() {
    document.getElementById('addPaymentModal').classList.add('hidden');
    document.getElementById('addPaymentForm').reset();
}

/**
 * ACTION FUNCTIONS
 */
async function removeFavorite(workerId) {
    if (!confirm('Remove this worker from your favorites?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/favorites/${CLIENT_ID}/${workerId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Worker removed from favorites');
            loadFavorites(); // Reload favorites
        } else {
            throw new Error('Failed to remove favorite');
        }
        
    } catch (error) {
        console.error('Error removing favorite:', error);
        showError('Failed to remove favorite');
    }
}

async function setDefaultPayment(methodId) {
    try {
        const response = await fetch(`${API_BASE}/payment-methods/${CLIENT_ID}/${methodId}/default`, {
            method: 'PATCH'
        });
        
        if (response.ok) {
            showSuccess('Default payment method updated');
            loadPaymentMethods(); // Reload payment methods
        } else {
            throw new Error('Failed to set default payment method');
        }
        
    } catch (error) {
        console.error('Error setting default payment:', error);
        showError('Failed to set default payment method');
    }
}

async function deletePaymentMethod(methodId) {
    if (!confirm('Delete this payment method?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/payment-methods/${CLIENT_ID}/${methodId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Payment method deleted');
            loadPaymentMethods(); // Reload payment methods
        } else {
            throw new Error('Failed to delete payment method');
        }
        
    } catch (error) {
        console.error('Error deleting payment method:', error);
        showError('Failed to delete payment method');
    }
}

async function deleteJob(jobId) {
    if (!confirm('Delete this job posting?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/jobs/${CLIENT_ID}/${jobId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Job deleted successfully');
            loadJobs(); // Reload jobs
        } else {
            throw new Error('Failed to delete job');
        }
        
    } catch (error) {
        console.error('Error deleting job:', error);
        showError('Failed to delete job');
    }
}

/**
 * UTILITY FUNCTIONS
 */
function populateProfileForm(profile) {
    if (!profile) return;
    
    // Populate form fields with profile data
    const fields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 
                   'streetAddress', 'city', 'province', 'postalCode', 'preferredLanguage', 
                   'timezone', 'communicationPreference'];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && profile[field]) {
            element.value = profile[field];
        }
    });
}

function populateNotificationForm(preferences) {
    if (!preferences) return;
    
    // Populate notification checkboxes
    const checkboxes = ['emailJobUpdates', 'emailNewBids', 'emailMessages', 'emailPayments',
                       'smsJobUpdates', 'smsReminders', 'smsPayments', 'pushJobUpdates', 
                       'pushMessages', 'pushPromotions'];
    
    checkboxes.forEach(checkbox => {
        const element = document.getElementById(checkbox);
        if (element && preferences[checkbox] !== undefined) {
            element.checked = preferences[checkbox];
        }
    });
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatJobStatus(status) {
    const statusMap = {
        'draft': 'Draft',
        'posted': 'Posted',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

function formatServiceStatus(status) {
    const statusMap = {
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

function formatCardBrand(brand) {
    const brandMap = {
        'visa': 'Visa',
        'mastercard': 'Mastercard',
        'amex': 'American Express',
        'discover': 'Discover'
    };
    return brandMap[brand] || brand;
}

function getCardIcon(brand) {
    const iconMap = {
        'visa': 'fa-cc-visa',
        'mastercard': 'fa-cc-mastercard',
        'amex': 'fa-cc-amex',
        'discover': 'fa-cc-discover'
    };
    return iconMap[brand] || 'fa-credit-card';
}

function detectCardBrand(cardNumber) {
    const number = cardNumber.replace(/\s/g, '');
    
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    if (number.startsWith('6')) return 'discover';
    
    return 'unknown';
}

function getInitials(name) {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length >= 2 ? 
        `${parts[0].charAt(0)}${parts[1].charAt(0)}` : 
        name.charAt(0);
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.toggle('hidden', !show);
    }
}

function showSuccess(message) {
    const toast = document.getElementById('successToast');
    const messageEl = document.getElementById('successMessage');
    
    if (toast && messageEl) {
        messageEl.textContent = message;
        toast.classList.remove('translate-x-full');
        
        setTimeout(() => {
            toast.classList.add('translate-x-full');
        }, 3000);
    }
}

function showError(message) {
    const toast = document.getElementById('errorToast');
    const messageEl = document.getElementById('errorMessage');
    
    if (toast && messageEl) {
        messageEl.textContent = message;
        toast.classList.remove('translate-x-full');
        
        setTimeout(() => {
            toast.classList.add('translate-x-full');
        }, 3000);
    }
}

/**
 * MOCK DATA FUNCTIONS (for fallback when API is not available)
 */
function getMockJobs() {
    return [
        {
            id: 1,
            title: 'Deep Clean My House',
            description: 'Need a thorough deep cleaning of my 3-bedroom house including bathrooms, kitchen, and living areas.',
            category: 'House Cleaning',
            budget: 250,
            status: 'posted',
            location: 'Toronto, ON',
            created_at: '2024-01-15T10:30:00Z',
            bids_count: 5
        },
        {
            id: 2,
            title: 'Fix Leaky Kitchen Faucet',
            description: 'Kitchen faucet has been dripping for weeks. Need professional plumber to fix it.',
            category: 'Plumbing',
            budget: 150,
            status: 'in_progress',
            location: 'Toronto, ON',
            created_at: '2024-01-10T14:15:00Z',
            bids_count: 3
        }
    ];
}

function getMockFavorites() {
    return [
        {
            worker_id: 1,
            worker_name: 'Alice Johnson',
            worker_services: 'House Cleaning, Deep Cleaning',
            worker_rating: 4.9,
            worker_image: null,
            notes: 'Excellent attention to detail, very reliable'
        },
        {
            worker_id: 2,
            worker_name: 'Bob Smith',
            worker_services: 'Plumbing, Emergency Repairs',
            worker_rating: 4.7,
            worker_image: null,
            notes: 'Quick response time, fair pricing'
        }
    ];
}

function getMockPaymentMethods() {
    return [
        {
            id: 1,
            card_brand: 'visa',
            card_last_four: '1234',
            expiry_month: '12',
            expiry_year: '25',
            is_default: true
        },
        {
            id: 2,
            card_brand: 'mastercard',
            card_last_four: '5678',
            expiry_month: '06',
            expiry_year: '26',
            is_default: false
        }
    ];
}

function getMockServiceHistory() {
    return [
        {
            id: 1,
            service_type: 'House Cleaning',
            worker_name: 'Alice Johnson',
            service_date: '2024-01-10T10:00:00Z',
            duration: 3,
            cost: 150,
            status: 'completed',
            reviewed: true,
            rating: 5,
            notes: 'Thorough and professional cleaning service'
        },
        {
            id: 2,
            service_type: 'Plumbing Repair',
            worker_name: 'Bob Smith',
            service_date: '2024-01-05T14:00:00Z',
            duration: 2,
            cost: 120,
            status: 'completed',
            reviewed: false
        }
    ];
}

// Placeholder functions for features not yet implemented
function editJob(jobId) {
    showError('Job editing feature coming soon!');
}

function viewJobBids(jobId) {
    showError('Bid viewing feature coming soon!');
}

function editPaymentMethod(methodId) {
    showError('Payment method editing feature coming soon!');
}

function showReviewModal(serviceId) {
    showError('Review feature coming soon!');
}

function viewServiceDetails(serviceId) {
    showError('Service details feature coming soon!');
}