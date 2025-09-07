// Worker Profile Display JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const workerId = window.location.pathname.split('/').pop();
    loadWorkerProfile(workerId);
});

async function loadWorkerProfile(workerId) {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const contentEl = document.getElementById('profile-content');

    try {
        loadingEl.classList.remove('hidden');
        errorEl.classList.add('hidden');
        contentEl.classList.add('hidden');

        const response = await fetch(`/api/worker/profile/${workerId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to load profile');
        }

        const worker = data.worker;
        displayWorkerProfile(worker);

        loadingEl.classList.add('hidden');
        contentEl.classList.remove('hidden');

    } catch (error) {
        console.error('Profile loading error:', error);
        loadingEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
    }
}

function displayWorkerProfile(worker) {
    // Update page title
    document.title = `${worker.companyName || worker.firstName + ' ' + worker.lastName} - Kwikr Directory`;

    // Company Header Section
    displayCompanyHeader(worker);
    
    // Company Description
    displayCompanyDescription(worker);
    
    // Services
    displayServices(worker.services);
    
    // Contact Information
    displayContactInfo(worker);
    
    // Operating Hours
    displayOperatingHours(worker.operatingHours);
    
    // Reviews
    displayReviews(worker.reviews, worker.ratings);
    
    // Set up action buttons
    setupActionButtons(worker);
}

function displayCompanyHeader(worker) {
    // Company Logo
    const logoEl = document.getElementById('company-logo');
    if (worker.companyLogo) {
        logoEl.innerHTML = `<img src="${worker.companyLogo}" alt="Company Logo" class="w-full h-full object-cover rounded-lg">`;
    } else {
        logoEl.innerHTML = '<i class="fas fa-building text-gray-400 text-2xl"></i>';
    }

    // Company Name
    document.getElementById('company-name').textContent = worker.companyName || `${worker.firstName} ${worker.lastName}`;

    // Primary Service Category
    const categoryEl = document.getElementById('service-category');
    if (worker.serviceCategories && worker.serviceCategories.length > 0) {
        categoryEl.textContent = worker.serviceCategories[0];
    } else {
        categoryEl.textContent = 'General Services';
    }

    // Location
    document.getElementById('location').innerHTML = `<i class="fas fa-map-marker-alt mr-1"></i>${worker.location.city}, ${worker.location.province}`;

    // Years in Business
    const yearsEl = document.getElementById('years-business');
    if (worker.yearsInBusiness) {
        yearsEl.innerHTML = `<i class="fas fa-calendar mr-1"></i>${worker.yearsInBusiness} years in business`;
        yearsEl.classList.remove('hidden');
    }

    // Verified Badge
    const verifiedEl = document.getElementById('verified-badge');
    if (worker.isVerified) {
        verifiedEl.classList.remove('hidden');
    }

    // Rating Display
    displayRating(worker.ratings);

    // Price Range
    const priceEl = document.getElementById('price-range');
    if (worker.priceRange && worker.priceRange.min > 0) {
        priceEl.textContent = `$${worker.priceRange.min}-${worker.priceRange.max}/hr`;
    } else {
        priceEl.textContent = 'Contact for pricing';
    }
}

function displayRating(ratings) {
    const starsEl = document.getElementById('rating-stars');
    const textEl = document.getElementById('rating-text');

    if (ratings.totalReviews > 0) {
        const rating = parseFloat(ratings.averageRating);
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHTML += '<i class="fas fa-star rating-star filled"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                starsHTML += '<i class="fas fa-star-half-alt rating-star filled"></i>';
            } else {
                starsHTML += '<i class="far fa-star rating-star"></i>';
            }
        }
        starsEl.innerHTML = starsHTML;
        textEl.textContent = `${ratings.averageRating} (${ratings.totalReviews} reviews)`;
    } else {
        starsEl.innerHTML = '<span class="text-gray-400">No reviews yet</span>';
        textEl.textContent = '';
    }
}

function displayCompanyDescription(worker) {
    const descEl = document.getElementById('company-description');
    
    let description = '';
    if (worker.companyDescription) {
        description = worker.companyDescription;
    } else if (worker.bio) {
        description = worker.bio;
    } else {
        description = `${worker.companyName || worker.firstName + ' ' + worker.lastName} is a professional service provider in ${worker.location.city}, ${worker.location.province}.`;
    }
    
    descEl.textContent = description;
}

function displayServices(services) {
    const servicesEl = document.getElementById('services-list');
    
    if (!services || services.length === 0) {
        servicesEl.innerHTML = '<p class="text-gray-500">No services listed</p>';
        return;
    }

    // Group services by category
    const servicesByCategory = services.reduce((acc, service) => {
        if (!acc[service.category]) {
            acc[service.category] = [];
        }
        acc[service.category].push(service);
        return acc;
    }, {});

    let servicesHTML = '';
    Object.keys(servicesByCategory).forEach(category => {
        servicesHTML += `
            <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
                    <i class="fas fa-tools text-kwikr-green mr-2"></i>
                    ${category}
                </h3>
                <div class="space-y-3">
        `;
        
        servicesByCategory[category].forEach(service => {
            servicesHTML += `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-800">${service.name}</h4>
                        ${service.description ? `<p class="text-sm text-gray-600 mt-1">${service.description}</p>` : ''}
                        ${service.yearsExperience ? `<p class="text-xs text-gray-500 mt-1">${service.yearsExperience} years experience</p>` : ''}
                    </div>
                    <div class="text-right ml-4">
                        ${service.hourlyRate ? `<span class="text-lg font-semibold text-kwikr-green">$${service.hourlyRate}/hr</span>` : '<span class="text-sm text-gray-500">Contact for pricing</span>'}
                    </div>
                </div>
            `;
        });
        
        servicesHTML += `
                </div>
            </div>
        `;
    });

    servicesEl.innerHTML = servicesHTML;
}

function displayContactInfo(worker) {
    const contactEl = document.getElementById('contact-info');
    
    let contactHTML = '';
    
    // Business Email
    if (worker.businessEmail) {
        contactHTML += `
            <div class="flex items-center">
                <i class="fas fa-envelope text-gray-400 w-5 mr-3"></i>
                <a href="mailto:${worker.businessEmail}" class="text-kwikr-green hover:underline">${worker.businessEmail}</a>
            </div>
        `;
    }
    
    // Phone - Privacy Protected (No direct tel: links)
    if (worker.phone) {
        const phoneFormatted = formatPhoneNumber(worker.phone);
        contactHTML += `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i class="fas fa-phone text-gray-400 w-5 mr-3"></i>
                    <span class="text-gray-700">${phoneFormatted}</span>
                </div>
                <button onclick="requestContactInfo('${worker.id}')" class="ml-3 bg-kwikr-green text-white text-xs px-3 py-1 rounded hover:bg-green-600 transition-colors">
                    <i class="fas fa-unlock mr-1"></i>Request Contact
                </button>
            </div>
        `;
    }
    
    // Website
    if (worker.website) {
        contactHTML += `
            <div class="flex items-center">
                <i class="fas fa-globe text-gray-400 w-5 mr-3"></i>
                <a href="${worker.website}" target="_blank" class="text-kwikr-green hover:underline">Visit Website</a>
            </div>
        `;
        
        // Show website button
        const websiteBtn = document.getElementById('website-btn');
        websiteBtn.classList.remove('hidden');
        websiteBtn.onclick = () => window.open(worker.website, '_blank');
    }
    
    // Full Address
    if (worker.location.fullAddress) {
        contactHTML += `
            <div class="flex items-start">
                <i class="fas fa-map-marker-alt text-gray-400 w-5 mr-3 mt-1"></i>
                <span class="text-gray-700">${worker.location.fullAddress}</span>
            </div>
        `;
        
        // Update map address
        document.getElementById('full-address').textContent = worker.location.fullAddress;
    }
    
    if (!contactHTML) {
        contactHTML = '<p class="text-gray-500">Contact information not available</p>';
    }
    
    contactEl.innerHTML = contactHTML;
}

function displayOperatingHours(hours) {
    const hoursEl = document.getElementById('operating-hours');
    
    if (!hours || hours.length === 0) {
        hoursEl.innerHTML = '<p class="text-gray-500">Hours not specified</p>';
        return;
    }

    let hoursHTML = '';
    hours.forEach(day => {
        const isToday = new Date().getDay() === day.dayIndex;
        const dayClass = isToday ? 'font-semibold text-kwikr-green' : '';
        
        hoursHTML += `
            <div class="flex justify-between items-center ${dayClass}">
                <span>${day.day}</span>
                <span>
                    ${day.isOpen && day.openTime && day.closeTime 
                        ? `${formatTime(day.openTime)} - ${formatTime(day.closeTime)}`
                        : 'Closed'
                    }
                </span>
            </div>
        `;
    });
    
    hoursEl.innerHTML = hoursHTML;
}

function displayReviews(reviews, ratings) {
    const reviewsEl = document.getElementById('reviews-section');
    
    if (!reviews || reviews.length === 0) {
        reviewsEl.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-star text-gray-300 text-3xl mb-3"></i>
                <p class="text-gray-500">No reviews yet</p>
                <p class="text-sm text-gray-400 mt-1">Be the first to leave a review!</p>
            </div>
        `;
        return;
    }

    // Rating breakdown
    let reviewsHTML = `
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="text-center">
                    <div class="text-4xl font-bold text-kwikr-green">${ratings.averageRating}</div>
                    <div class="text-sm text-gray-600">${ratings.totalReviews} reviews</div>
                </div>
                <div class="space-y-1">
    `;
    
    for (let i = 5; i >= 1; i--) {
        const count = ratings.breakdown[`${getStarName(i)}Star`] || 0;
        const percentage = ratings.totalReviews > 0 ? (count / ratings.totalReviews) * 100 : 0;
        
        reviewsHTML += `
            <div class="flex items-center text-sm">
                <span class="w-3">${i}</span>
                <i class="fas fa-star text-yellow-400 mx-1"></i>
                <div class="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                    <div class="bg-yellow-400 h-2 rounded-full" style="width: ${percentage}%"></div>
                </div>
                <span class="w-8 text-right">${count}</span>
            </div>
        `;
    }
    
    reviewsHTML += `
                </div>
            </div>
        </div>
    `;
    
    // Individual reviews
    reviewsHTML += '<div class="space-y-4">';
    reviews.forEach(review => {
        reviewsHTML += `
            <div class="border-b border-gray-200 pb-4 last:border-b-0">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center">
                        <div class="rating-stars mr-2">
                            ${generateStars(review.rating)}
                        </div>
                        <span class="font-medium text-gray-900">${review.reviewerName}</span>
                    </div>
                    <span class="text-sm text-gray-500">${formatDate(review.date)}</span>
                </div>
                <p class="text-gray-700">${review.text}</p>
            </div>
        `;
    });
    reviewsHTML += '</div>';
    
    reviewsEl.innerHTML = reviewsHTML;
}

function setupActionButtons(worker) {
    // Invite to Bid button
    document.getElementById('invite-bid-btn').onclick = function() {
        alert('Invite to Bid functionality coming soon!');
    };
    
    // Contact button - Privacy Protected (No direct tel:/mailto: links)
    document.getElementById('contact-btn').onclick = function() {
        // Redirect to internal messaging system instead of direct contact
        requestContactInfo(worker.id);
    };
}

// Utility Functions
function formatPhoneNumber(phone) {
    // Phone number formatting with privacy protection - mask last 4 digits
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        // Format: (416) 555-**** - mask last 4 digits for privacy
        return `(${cleaned.substring(0,3)}) ${cleaned.substring(3,6)}-****`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
        // Format: +1 (416) 555-**** - mask last 4 digits for privacy
        return `+1 (${cleaned.substring(1,4)}) ${cleaned.substring(4,7)}-****`;
    }
    // For any other format, try to mask last 4 characters
    return phone.length > 4 ? phone.substring(0, phone.length - 4) + '****' : phone;
}

function formatTime(time) {
    if (!time) return '';
    
    // Convert 24-hour time to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minutes} ${ampm}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function generateStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHTML += '<i class="fas fa-star rating-star filled"></i>';
        } else {
            starsHTML += '<i class="far fa-star rating-star"></i>';
        }
    }
    return starsHTML;
}

function getStarName(num) {
    const names = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' };
    return names[num];
}

// Privacy-protected contact request function
function requestContactInfo(workerId) {
    // This function will eventually integrate with the internal messaging system
    // For now, show a modal explaining the contact protection policy
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-md w-full p-6">
            <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-kwikr-green bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                    <i class="fas fa-shield-alt text-kwikr-green text-xl"></i>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">Contact Protection</h3>
                    <p class="text-sm text-gray-600">Privacy-first approach</p>
                </div>
            </div>
            
            <div class="mb-6">
                <p class="text-gray-700 mb-4">
                    To protect both clients and service providers, all initial contact happens through our secure messaging system.
                </p>
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 class="font-semibold text-green-800 mb-2">Why we do this:</h4>
                    <ul class="text-sm text-green-700 space-y-1">
                        <li>• Prevents spam and unwanted calls</li>
                        <li>• Keeps communication history for your protection</li>
                        <li>• Enables dispute resolution if needed</li>
                        <li>• Direct contact info shared after quote acceptance</li>
                    </ul>
                </div>
            </div>
            
            <div class="flex space-x-3">
                <button onclick="startMessaging('${workerId}')" class="flex-1 bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    <i class="fas fa-comments mr-2"></i>Start Secure Message
                </button>
                <button onclick="closeContactModal()" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeContactModal();
        }
    };
    
    document.body.appendChild(modal);
}

// Start messaging function (will integrate with internal messaging system)
function startMessaging(workerId) {
    closeContactModal();
    
    // For now, redirect to quote request system
    // This will be replaced with internal messaging system
    alert('Internal messaging system coming soon! This will allow secure communication with service providers without exposing contact details.');
    
    // Future implementation will redirect to:
    // window.location.href = `/messaging/new?provider=${workerId}`;
}

// Close contact modal
function closeContactModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black');
    if (modal) {
        modal.remove();
    }
}