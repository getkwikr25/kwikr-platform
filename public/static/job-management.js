/**
 * Job Management JavaScript
 * Handles client-side interactions for the job management system
 */

// Job Application Functions
function applyForJob(jobId) {
    if (confirm('Apply for this job? You will be redirected to the application form.')) {
        window.location.href = `/jobs/${jobId}/apply`;
    }
}

function withdrawApplication(jobId) {
    if (confirm('Are you sure you want to withdraw your application?')) {
        fetch(`/jobs/${jobId}/withdraw-application`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Application withdrawn successfully', 'success');
                setTimeout(() => location.reload(), 1000);
            } else {
                showNotification('Failed to withdraw application', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error withdrawing application', 'error');
        });
    }
}

// Job Status Management
async function updateJobStatus(jobId, status, notes = '') {
    const confirmMessages = {
        'in_progress': 'Mark this job as started?',
        'completed': 'Mark this job as completed?',
        'cancelled': 'Cancel this job? This action cannot be undone.'
    };

    if (!confirm(confirmMessages[status] || 'Update job status?')) {
        return;
    }

    try {
        const response = await fetch(`/jobs/${jobId}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, completion_notes: notes })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Job status updated successfully', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showNotification(data.error || 'Failed to update job status', 'error');
        }
    } catch (error) {
        console.error('Error updating job status:', error);
        showNotification('Error updating job status', 'error');
    }
}

// Bid Response Functions
async function respondToBid(bidId, response) {
    const confirmMessage = response === 'accepted' 
        ? 'Accept this application? This will assign the job to the worker.' 
        : 'Reject this application?';
    
    if (!confirm(confirmMessage)) {
        return;
    }

    try {
        const res = await fetch(`/jobs/bids/${bidId}/respond`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ response })
        });

        const data = await res.json();

        if (data.success) {
            showNotification(`Application ${response} successfully`, 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showNotification(data.error || 'Failed to respond to application', 'error');
        }
    } catch (error) {
        console.error('Error responding to bid:', error);
        showNotification('Error responding to application', 'error');
    }
}

// Job Invitation Functions
async function inviteWorker(jobId, workerId) {
    try {
        const response = await fetch(`/jobs/${jobId}/invite/${workerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            showNotification(data.message, 'success');
        } else {
            showNotification(data.error || 'Failed to send invitation', 'error');
        }
    } catch (error) {
        console.error('Error sending invitation:', error);
        showNotification('Error sending invitation', 'error');
    }
}

// Job Matching - Load Suggested Workers
async function loadSuggestedWorkers(jobId) {
    try {
        const response = await fetch(`/jobs/${jobId}/suggested-workers`);
        const data = await response.json();

        if (data.suggested_workers && data.suggested_workers.length > 0) {
            displaySuggestedWorkers(data.suggested_workers);
        } else {
            showNotification('No matching workers found', 'info');
        }
    } catch (error) {
        console.error('Error loading suggested workers:', error);
        showNotification('Error loading worker suggestions', 'error');
    }
}

function displaySuggestedWorkers(workers) {
    const container = document.getElementById('suggestedWorkersContainer');
    if (!container) return;

    const workersHtml = workers.map(worker => `
        <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                    ${worker.profile_image_url ? 
                        `<img src="${worker.profile_image_url}" alt="${worker.name}" class="w-12 h-12 rounded-full object-cover mr-3">` :
                        `<div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mr-3">
                            ${worker.name.split(' ').map(n => n[0]).join('')}
                         </div>`
                    }
                    <div>
                        <h4 class="font-semibold text-gray-800">${worker.name}</h4>
                        <p class="text-sm text-gray-600">${worker.location}</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-lg font-bold text-green-600">$${worker.service.hourly_rate}/hr</div>
                    <div class="text-sm text-gray-500">Match: ${worker.match_score}%</div>
                </div>
            </div>
            
            <div class="flex items-center space-x-2 mb-3 text-sm">
                ${worker.avg_rating ? `
                    <div class="flex items-center">
                        <span class="text-yellow-400">★</span>
                        <span class="ml-1">${worker.avg_rating}</span>
                        <span class="text-gray-500 ml-1">(${worker.review_count})</span>
                    </div>
                ` : ''}
                ${worker.is_compliant ? 
                    '<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Verified</span>' : 
                    '<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending Verification</span>'
                }
            </div>
            
            <p class="text-gray-600 text-sm mb-3">${worker.bio || 'Professional service provider'}</p>
            
            <div class="flex space-x-2">
                <button onclick="inviteWorker(${getCurrentJobId()}, ${worker.id})" 
                        class="flex-1 bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600 text-sm">
                    <i class="fas fa-user-plus mr-1"></i>Invite
                </button>
                <a href="/universal-profile/${worker.id}" 
                   class="bg-gray-500 text-white py-2 px-3 rounded hover:bg-gray-600 text-sm">
                    <i class="fas fa-eye mr-1"></i>View
                </a>
            </div>
        </div>
    `).join('');

    container.innerHTML = workersHtml;
}

function getCurrentJobId() {
    // Extract job ID from current URL
    const pathParts = window.location.pathname.split('/');
    const jobIndex = pathParts.indexOf('jobs');
    return jobIndex !== -1 && pathParts[jobIndex + 1] ? parseInt(pathParts[jobIndex + 1]) : null;
}

// Search and Filter Functions
function filterJobs(filterType, value) {
    const currentUrl = new URL(window.location);
    if (value) {
        currentUrl.searchParams.set(filterType, value);
    } else {
        currentUrl.searchParams.delete(filterType);
    }
    window.location.href = currentUrl.toString();
}

function searchJobs(query) {
    if (query.trim().length > 0) {
        filterJobs('search', query.trim());
    } else {
        filterJobs('search', '');
    }
}

// Job Form Validation
function validateJobForm(form) {
    const title = form.querySelector('#title')?.value.trim();
    const description = form.querySelector('#description')?.value.trim();
    const category = form.querySelector('#category_id')?.value;
    const location_province = form.querySelector('#location_province')?.value;
    const location_city = form.querySelector('#location_city')?.value.trim();

    if (!title) {
        showNotification('Please enter a job title', 'error');
        return false;
    }

    if (!description || description.length < 20) {
        showNotification('Please provide a detailed job description (at least 20 characters)', 'error');
        return false;
    }

    if (!category) {
        showNotification('Please select a job category', 'error');
        return false;
    }

    if (!location_province) {
        showNotification('Please select a province', 'error');
        return false;
    }

    if (!location_city) {
        showNotification('Please enter a city', 'error');
        return false;
    }

    return true;
}

function validateBidForm(form) {
    const bidAmount = parseFloat(form.querySelector('#bid_amount')?.value || 0);
    const coverMessage = form.querySelector('#cover_message')?.value.trim();

    if (!bidAmount || bidAmount <= 0) {
        showNotification('Please enter a valid bid amount', 'error');
        return false;
    }

    if (!coverMessage || coverMessage.length < 10) {
        showNotification('Please provide a detailed cover message (at least 10 characters)', 'error');
        return false;
    }

    return true;
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        type === 'warning' ? 'bg-yellow-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                type === 'warning' ? 'fa-exclamation-triangle' :
                'fa-info-circle'
            } mr-2"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(dateString));
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(dateString);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add form validation to job forms
    const jobForm = document.querySelector('#jobPostForm');
    if (jobForm) {
        jobForm.addEventListener('submit', function(e) {
            if (!validateJobForm(this)) {
                e.preventDefault();
            }
        });
    }

    const bidForm = document.querySelector('#bidForm');
    if (bidForm) {
        bidForm.addEventListener('submit', function(e) {
            if (!validateBidForm(this)) {
                e.preventDefault();
            }
        });
    }

    // Load suggested workers if on job details page
    const jobId = getCurrentJobId();
    if (jobId && document.getElementById('suggestedWorkersContainer')) {
        loadSuggestedWorkers(jobId);
    }

    // Auto-refresh job lists every 30 seconds for real-time updates
    if (window.location.pathname.includes('/jobs/browse') || 
        window.location.pathname.includes('/jobs/my-')) {
        setInterval(() => {
            // Only auto-refresh if no forms are being filled
            const activeElement = document.activeElement;
            if (!activeElement || (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA')) {
                window.location.reload();
            }
        }, 30000);
    }
});

// Export functions for global access
window.jobManagement = {
    applyForJob,
    withdrawApplication,
    updateJobStatus,
    respondToBid,
    inviteWorker,
    loadSuggestedWorkers,
    filterJobs,
    searchJobs,
    showNotification,
    formatCurrency,
    formatDate,
    formatTimeAgo
};