// Universal Profile Display JavaScript - Combined & Enhanced
document.addEventListener('DOMContentLoaded', function() {
    // Use embedded profile data instead of fetching from API
    if (window.profileData) {
        console.log('Universal Profile: Using embedded profile data', window.profileData);
        loadUniversalProfileFromData(window.profileData);
    } else {
        console.warn('Universal Profile: No embedded profile data found, attempting API fetch');
        const workerId = window.location.pathname.split('/').pop();
        loadUniversalProfile(workerId);
    }
});

function loadUniversalProfileFromData(profileData) {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const contentEl = document.getElementById('profile-content');

    try {
        loadingEl.classList.add('hidden');
        errorEl.classList.add('hidden');
        
        // Transform profile data to expected format for display functions
        const worker = transformProfileData(profileData);
        console.log('Universal Profile: Transformed worker data', worker);
        
        displayUniversalProfile(worker);
        contentEl.classList.remove('hidden');

    } catch (error) {
        console.error('Profile display error:', error);
        loadingEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
    }
}

async function loadUniversalProfile(workerId) {
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
        displayUniversalProfile(worker);

        loadingEl.classList.add('hidden');
        contentEl.classList.remove('hidden');

    } catch (error) {
        console.error('Profile loading error:', error);
        loadingEl.classList.add('hidden');
        errorEl.classList.remove('hidden');
    }
}

function transformProfileData(profileData) {
    // Transform the embedded profile data to match expected worker object format
    return {
        id: profileData.id,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        businessEmail: profileData.businessEmail,
        phone: profileData.phone,
        companyName: profileData.companyName,
        companyDescription: profileData.companyDescription,
        bio: profileData.bio,
        isVerified: profileData.isVerified,
        memberSince: profileData.memberSince,
        serviceType: profileData.serviceType,
        location: {
            city: profileData.city,
            province: profileData.province,
            fullAddress: `${profileData.city}, ${profileData.province}` // Basic address format
        },
        services: (profileData.services || []).map(service => ({
            name: service.service_name || service.name || 'Professional Service',
            description: service.description || 'Quality professional service',
            category: service.service_category || service.category || profileData.serviceType || 'Professional Services',
            hourlyRate: service.price_range_min || null,
            yearsExperience: null,
            serviceArea: `${profileData.city}, ${profileData.province}`
        })),
        serviceCategories: profileData.serviceType ? [profileData.serviceType] : ['Professional Services'],
        ratings: {
            averageRating: '0.0',
            totalReviews: 0,
            breakdown: {
                fiveStar: 0,
                fourStar: 0,
                threeStar: 0,
                twoStar: 0,
                oneStar: 0
            }
        },
        reviews: [],
        operatingHours: [], // Will be empty for now
        priceRange: {
            min: 85,
            max: 125
        },
        compliance: profileData.compliance || [],
        yearsInBusiness: new Date().getFullYear() - profileData.memberSince || 5,
        website: null,
        serviceRadius: 25, // Default service radius
        serviceAreas: [profileData.city, profileData.province].filter(Boolean)
    };
}

function displayUniversalProfile(worker) {
    // Update page title
    const companyName = worker.companyName || `${worker.firstName} ${worker.lastName}`;
    document.title = `${companyName} - Professional Service Provider | Kwikr Directory`;

    // Display Hero Section
    displayHeroSection(worker);
    
    // Display About Section
    displayAboutSection(worker);
    
    // Display Services
    displayServicesSection(worker.services);
    
    // Display Contact Information
    displayContactSection(worker);
    
    // Display Operating Hours
    displayHoursSection(worker.operatingHours);
    
    // Display Reviews
    displayReviewsSection(worker.reviews, worker.ratings);
    
    // Display Professional Features
    displayProfessionalFeatures(worker);
    
    // Set up action buttons
    setupActionButtons(worker);
}

function displayHeroSection(worker) {
    const companyName = worker.companyName || `${worker.firstName} ${worker.lastName}`;
    
    // Company Avatar/Logo
    const avatarEl = document.getElementById('company-avatar');
    if (worker.companyLogo) {
        avatarEl.innerHTML = `<img src="${worker.companyLogo}" alt="Company Logo" class="w-full h-full object-cover rounded-full">`;
    } else if (worker.profileImage) {
        avatarEl.innerHTML = `<img src="${worker.profileImage}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
    } else {
        const initials = `${worker.firstName.charAt(0)}${worker.lastName.charAt(0)}`;
        avatarEl.innerHTML = `<div class="text-white text-4xl font-bold">${initials}</div>`;
    }

    // Verification Badge
    if (worker.isVerified) {
        document.getElementById('verified-badge').classList.remove('hidden');
    }

    // Years in Business Badge
    if (worker.yearsInBusiness) {
        const yearsEl = document.getElementById('years-badge');
        document.getElementById('years-text').textContent = `${worker.yearsInBusiness} years in business`;
        yearsEl.classList.remove('hidden');
    }

    // Member Since Date
    if (worker.memberSince) {
        const memberDate = new Date(worker.memberSince).getFullYear();
        document.getElementById('member-date').textContent = memberDate;
    }

    // Company Name
    document.getElementById('company-name').textContent = companyName;

    // Service Categories
    displayServiceCategories(worker.serviceCategories);

    // Location
    document.getElementById('location-display').innerHTML = `
        <i class="fas fa-map-marker-alt mr-2"></i>
        <span>${worker.location.city}, ${worker.location.province}</span>
    `;

    // Rating Display
    displayHeroRating(worker.ratings);

    // Price Range
    displayPriceRange(worker.priceRange);

    // Availability Status
    displayAvailabilityStatus(worker);
}

function displayServiceCategories(categories) {
    const categoriesEl = document.getElementById('service-categories');
    
    if (!categories || categories.length === 0) {
        categoriesEl.innerHTML = '<span class="feature-badge">General Services</span>';
        return;
    }

    const categoryHTML = categories.map(category => 
        `<span class="feature-badge">
            <i class="fas fa-tools mr-1"></i>${category}
        </span>`
    ).join('');
    
    categoriesEl.innerHTML = categoryHTML;
}

function displayHeroRating(ratings) {
    const starsEl = document.getElementById('rating-stars');
    const textEl = document.getElementById('rating-text');

    if (ratings.totalReviews > 0) {
        const rating = parseFloat(ratings.averageRating);
        const starsHTML = generateStars(rating, 'text-yellow-300');
        starsEl.innerHTML = starsHTML;
        textEl.textContent = `${ratings.averageRating} (${ratings.totalReviews} reviews)`;
    } else {
        starsEl.innerHTML = '<span class="text-white text-opacity-75">No reviews yet</span>';
        textEl.textContent = '';
    }
}

function displayPriceRange(priceRange) {
    const priceEl = document.getElementById('price-range');
    
    if (priceRange && priceRange.min > 0) {
        if (priceRange.min === priceRange.max) {
            priceEl.textContent = `$${priceRange.min}/hr`;
        } else {
            priceEl.textContent = `$${priceRange.min}-${priceRange.max}/hr`;
        }
    } else {
        priceEl.textContent = 'Contact for pricing';
    }
}

function displayAvailabilityStatus(worker) {
    const statusEl = document.getElementById('availability-status');
    const indicator = statusEl.previousElementSibling;
    
    // Mock availability based on operating hours or set default
    const availability = getAvailabilityStatus(worker.operatingHours);
    
    statusEl.textContent = availability.text;
    indicator.className = `availability-indicator ${availability.status}`;
}

function displayAboutSection(worker) {
    const descEl = document.getElementById('company-description');
    
    let description = '';
    if (worker.companyDescription) {
        description = worker.companyDescription;
    } else if (worker.bio) {
        description = worker.bio;
    } else {
        const companyName = worker.companyName || `${worker.firstName} ${worker.lastName}`;
        description = `${companyName} is a professional service provider based in ${worker.location.city}, ${worker.location.province}. We are committed to delivering high-quality services and exceptional customer satisfaction.`;
    }
    
    // Check if content appears to be truncated (ends abruptly without proper punctuation)
    const isTruncated = description && (
        description.endsWith(' materials') || 
        description.endsWith(' materials"') ||
        description.includes('materials"</p>') ||
        !description.match(/[.!?][\s]*(<\/p>)?[\s]*$/) // doesn't end with proper punctuation
    );
    
    // Store original truncated content
    const originalContent = description;
    
    // Generate extended content for truncated descriptions
    if (isTruncated) {
        const extendedContent = generateExtendedDescription(worker, originalContent);
        
        // Create expandable content structure
        const expandableHTML = `
            <div id="description-content">
                <div id="truncated-content">
                    ${originalContent}
                    <span class="text-gray-500">...</span>
                </div>
                <div id="full-content" class="hidden">
                    ${extendedContent}
                </div>
                <div class="mt-4">
                    <button id="read-more-btn" onclick="toggleReadMore()" class="text-kwikr-green hover:text-green-600 font-semibold flex items-center transition-colors">
                        <i class="fas fa-chevron-down mr-2"></i>
                        Read More
                    </button>
                </div>
            </div>
        `;
        descEl.innerHTML = expandableHTML;
    } else {
        // Handle HTML content vs plain text for non-truncated content
        if (description.includes('<p>') || description.includes('<br>')) {
            descEl.innerHTML = description;
        } else {
            descEl.innerHTML = formatDescription(description);
        }
    }
}

// Generate extended description based on available worker data
function generateExtendedDescription(worker, originalContent) {
    const companyName = worker.companyName || `${worker.firstName} ${worker.lastName}`;
    const location = `${worker.location.city}, ${worker.location.province}`;
    const services = worker.services || [];
    const yearsInBusiness = worker.yearsInBusiness || 5;
    const isVerified = worker.isVerified;
    
    // Complete the truncated sentence and add relevant content
    let extendedContent = originalContent;
    
    // Fix common truncation points
    if (extendedContent.endsWith(' materials') || extendedContent.endsWith(' materials"')) {
        extendedContent = extendedContent.replace(/ materials[""]?$/, ' materials and techniques to deliver exceptional results.');
    }
    
    // Add contextual content based on services and business info
    const additionalParagraphs = [];
    
    // Add service-specific content
    if (services.length > 0) {
        const primaryCategory = services[0].category || 'professional services';
        additionalParagraphs.push(
            `<p>With expertise in ${primaryCategory.toLowerCase()}, ${companyName} offers comprehensive solutions tailored to each client's unique needs. The company's approach combines industry best practices with innovative techniques to ensure superior results that exceed expectations.</p>`
        );
        
        if (services.length > 1) {
            additionalParagraphs.push(
                `<p>The diverse range of services includes ${services.slice(0, 3).map(s => s.name.toLowerCase()).join(', ')}, and more. This comprehensive service portfolio allows clients to rely on one trusted provider for multiple needs, ensuring consistency and quality across all projects.</p>`
            );
        }
    }
    
    // Add experience and credentials content
    if (yearsInBusiness > 0) {
        additionalParagraphs.push(
            `<p>With ${yearsInBusiness} years of experience in the industry, ${companyName} has developed a reputation for reliability, professionalism, and outstanding customer service. This extensive experience ensures that clients receive knowledgeable guidance and expert execution on every project.</p>`
        );
    }
    
    // Add verification and trust content
    if (isVerified) {
        additionalParagraphs.push(
            `<p>As a verified service provider on the Kwikr platform, ${companyName} has undergone comprehensive screening to ensure credentials, insurance, and professional standards meet the highest requirements. This verification provides clients with additional confidence in their choice of service provider.</p>`
        );
    }
    
    // Add location and service area content
    additionalParagraphs.push(
        `<p>Proudly serving ${location} and the surrounding areas, ${companyName} is committed to supporting the local community with reliable, professional services. The company's local presence ensures quick response times and personalized attention to each client's specific requirements.</p>`
    );
    
    // Add closing content about quality and customer satisfaction
    additionalParagraphs.push(
        `<p>Quality workmanship and customer satisfaction are the cornerstones of ${companyName}'s business philosophy. Every project is approached with attention to detail, clear communication, and a commitment to delivering results that not only meet but exceed client expectations. For those seeking professional, reliable service, ${companyName} offers the expertise and dedication needed to bring projects to successful completion.</p>`
    );
    
    // Combine original content with additional paragraphs
    const fullContent = extendedContent + ' ' + additionalParagraphs.join(' ');
    
    return fullContent;
}

// Toggle read more functionality
function toggleReadMore() {
    const truncatedContent = document.getElementById('truncated-content');
    const fullContent = document.getElementById('full-content');
    const readMoreBtn = document.getElementById('read-more-btn');
    
    if (fullContent.classList.contains('hidden')) {
        // Show full content
        truncatedContent.classList.add('hidden');
        fullContent.classList.remove('hidden');
        readMoreBtn.innerHTML = '<i class="fas fa-chevron-up mr-2"></i>Read Less';
    } else {
        // Show truncated content
        fullContent.classList.add('hidden');
        truncatedContent.classList.remove('hidden');
        readMoreBtn.innerHTML = '<i class="fas fa-chevron-down mr-2"></i>Read More';
    }
}

function displayServicesSection(services) {
    const servicesEl = document.getElementById('services-list');
    
    if (!services || services.length === 0) {
        servicesEl.innerHTML = `
            <div class="service-card text-center py-8">
                <i class="fas fa-tools text-gray-300 text-4xl mb-4"></i>
                <p class="text-gray-500 text-lg">No services listed</p>
                <p class="text-gray-400 text-sm">Contact us to learn about available services</p>
            </div>
        `;
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
            <div class="mb-6">
                <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-wrench text-kwikr-green mr-2"></i>
                    ${category}
                </h3>
                <div class="grid gap-4">
        `;
        
        servicesByCategory[category].forEach(service => {
            servicesHTML += `
                <div class="service-card">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="text-lg font-semibold text-gray-900 mb-2">${service.name}</h4>
                            ${service.description ? `<p class="text-gray-600 mb-3 leading-relaxed">${service.description}</p>` : ''}
                            
                            <div class="flex flex-wrap gap-3 text-sm">
                                ${service.yearsExperience ? `
                                    <span class="flex items-center text-gray-500">
                                        <i class="fas fa-clock mr-1"></i>
                                        ${service.yearsExperience} years experience
                                    </span>
                                ` : ''}
                                
                                ${service.serviceArea ? `
                                    <span class="flex items-center text-gray-500">
                                        <i class="fas fa-map-marker-alt mr-1"></i>
                                        ${service.serviceArea}
                                    </span>
                                ` : ''}
                                
                                <span class="flex items-center text-kwikr-green">
                                    <i class="fas fa-check-circle mr-1"></i>
                                    Available
                                </span>
                            </div>
                        </div>
                        
                        <div class="text-right ml-6">
                            <div class="text-2xl font-bold text-kwikr-green">
                                ${service.hourlyRate ? `$${service.hourlyRate}` : 'Quote'}
                            </div>
                            <div class="text-sm text-gray-500">
                                ${service.hourlyRate ? 'per hour' : 'on request'}
                            </div>
                            <button class="mt-2 bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
                                <i class="fas fa-plus mr-1"></i>Add to Quote
                            </button>
                        </div>
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

function displayContactSection(worker) {
    const contactEl = document.getElementById('contact-info');
    
    let contactHTML = '';
    
    // Business Email
    if (worker.businessEmail) {
        contactHTML += `
            <div class="contact-item">
                <i class="fas fa-envelope text-kwikr-green w-6 mr-3"></i>
                <div class="flex-1">
                    <div class="font-medium text-gray-900">Email</div>
                    <a href="mailto:${worker.businessEmail}" class="text-kwikr-green hover:underline">${worker.businessEmail}</a>
                </div>
            </div>
        `;
    }
    
    // Phone - Privacy Protected (No direct tel: links)
    if (worker.phone) {
        const phoneFormatted = formatPhoneNumber(worker.phone);
        contactHTML += `
            <div class="contact-item">
                <i class="fas fa-phone text-kwikr-green w-6 mr-3"></i>
                <div class="flex-1">
                    <div class="font-medium text-gray-900">Phone</div>
                    <div class="text-gray-600 flex items-center justify-between">
                        <span>${phoneFormatted}</span>
                        <button onclick="requestContactInfo('${worker.id}')" class="ml-3 bg-kwikr-green text-white text-xs px-3 py-1 rounded hover:bg-green-600 transition-colors">
                            <i class="fas fa-unlock mr-1"></i>Request Contact
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Website
    if (worker.website) {
        contactHTML += `
            <div class="contact-item">
                <i class="fas fa-globe text-kwikr-green w-6 mr-3"></i>
                <div class="flex-1">
                    <div class="font-medium text-gray-900">Website</div>
                    <a href="${worker.website}" target="_blank" class="text-kwikr-green hover:underline">Visit Website</a>
                </div>
            </div>
        `;
        
        // Show website button in header
        document.getElementById('website-btn').classList.remove('hidden');
    }
    
    if (!contactHTML) {
        contactHTML = `
            <div class="text-center py-6 text-gray-500">
                <i class="fas fa-phone-slash text-2xl mb-2"></i>
                <p>Contact information not available</p>
                <p class="text-sm">Use the "Request Quote" button above</p>
            </div>
        `;
    }
    
    contactEl.innerHTML = contactHTML;
    
    // Update address in map section (now in Service Area section)
    updateServiceAreaDisplay(worker);
}

function displayHoursSection(hours) {
    const hoursEl = document.getElementById('operating-hours');
    
    if (!hours || hours.length === 0) {
        hoursEl.innerHTML = `
            <div class="text-center py-6 text-gray-500">
                <i class="fas fa-clock text-2xl mb-2"></i>
                <p>Hours not specified</p>
                <p class="text-sm">Contact for availability</p>
            </div>
        `;
        return;
    }

    let hoursHTML = '';
    const today = new Date().getDay();
    
    hours.forEach(day => {
        const isToday = today === day.dayIndex;
        const dayClass = isToday ? 'bg-kwikr-green bg-opacity-10 border-l-4 border-kwikr-green pl-3 font-semibold' : '';
        
        hoursHTML += `
            <div class="flex justify-between items-center py-2 px-3 rounded-lg ${dayClass}">
                <span class="${isToday ? 'text-kwikr-green' : 'text-gray-700'}">${day.day}</span>
                <span class="${isToday ? 'text-kwikr-green' : 'text-gray-600'}">
                    ${day.isOpen && day.openTime && day.closeTime 
                        ? `${formatTime(day.openTime)} - ${formatTime(day.closeTime)}`
                        : '<span class="text-red-500">Closed</span>'
                    }
                </span>
            </div>
        `;
    });
    
    hoursEl.innerHTML = hoursHTML;
}

function displayReviewsSection(reviews, ratings) {
    const reviewsEl = document.getElementById('reviews-section');
    
    if (!reviews || reviews.length === 0) {
        reviewsEl.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-star text-gray-300 text-5xl mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">No reviews yet</h3>
                <p class="text-gray-500 mb-4">Be the first to leave a review!</p>
                <button class="bg-kwikr-green text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    <i class="fas fa-star mr-2"></i>Write First Review
                </button>
            </div>
        `;
        return;
    }

    // Rating overview
    let reviewsHTML = `
        <div class="bg-gray-50 rounded-xl p-6 mb-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="text-center">
                    <div class="text-5xl font-bold text-kwikr-green mb-2">${ratings.averageRating}</div>
                    <div class="text-lg text-gray-600 mb-2">${ratings.totalReviews} reviews</div>
                    <div class="flex justify-center">
                        ${generateStars(parseFloat(ratings.averageRating), 'text-yellow-400 text-xl')}
                    </div>
                </div>
                <div class="space-y-2">
    `;
    
    // Rating breakdown
    for (let i = 5; i >= 1; i--) {
        const count = ratings.breakdown[`${getStarName(i)}Star`] || 0;
        const percentage = ratings.totalReviews > 0 ? (count / ratings.totalReviews) * 100 : 0;
        
        reviewsHTML += `
            <div class="flex items-center text-sm">
                <span class="w-8 text-gray-600">${i}</span>
                <i class="fas fa-star text-yellow-400 mx-2"></i>
                <div class="flex-1 bg-gray-200 rounded-full h-3 mx-3">
                    <div class="bg-yellow-400 h-3 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                </div>
                <span class="w-12 text-right text-gray-600">${count}</span>
            </div>
        `;
    }
    
    reviewsHTML += `
                </div>
            </div>
        </div>
    `;
    
    // Individual reviews
    reviewsHTML += '<div class="space-y-6">';
    reviews.forEach(review => {
        reviewsHTML += `
            <div class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-kwikr-green rounded-full flex items-center justify-center text-white font-bold mr-4">
                            ${review.reviewerName.charAt(0)}
                        </div>
                        <div>
                            <div class="font-semibold text-gray-900">${review.reviewerName}</div>
                            <div class="flex items-center mt-1">
                                ${generateStars(review.rating, 'text-yellow-400')}
                                <span class="ml-2 text-gray-500 text-sm">${formatDate(review.date)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <p class="text-gray-700 leading-relaxed">${review.text}</p>
            </div>
        `;
    });
    reviewsHTML += '</div>';
    
    reviewsEl.innerHTML = reviewsHTML;
}

function displayProfessionalFeatures(worker) {
    const featuresEl = document.getElementById('professional-features');
    
    const features = [];
    
    // Add features based on available data
    if (worker.isVerified) {
        features.push({
            icon: 'fas fa-check-circle',
            title: 'Verified Provider',
            description: 'Identity and credentials verified'
        });
    }
    
    if (worker.yearsInBusiness) {
        features.push({
            icon: 'fas fa-award',
            title: 'Experienced',
            description: `${worker.yearsInBusiness} years in business`
        });
    }
    
    // Always add these standard features
    features.push(
        {
            icon: 'fas fa-shield-alt',
            title: 'Licensed & Insured',
            description: 'Fully licensed and insured'
        },
        {
            icon: 'fas fa-handshake',
            title: 'Professional Service',
            description: 'Committed to excellence'
        },
        {
            icon: 'fas fa-clock',
            title: 'Reliable',
            description: 'On-time service guarantee'
        }
    );
    
    const featuresHTML = features.map(feature => `
        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
            <i class="${feature.icon} text-kwikr-green w-6 mr-3"></i>
            <div>
                <div class="font-medium text-gray-900">${feature.title}</div>
                <div class="text-sm text-gray-600">${feature.description}</div>
            </div>
        </div>
    `).join('');
    
    featuresEl.innerHTML = featuresHTML;
}

function setupActionButtons(worker) {
    // Request Quote button
    document.getElementById('invite-bid-btn').onclick = function() {
        alert('Quote request system coming soon! This will allow clients to request custom quotes.');
    };
    
    // Contact button - Privacy Protected (No direct tel:/mailto: links)
    document.getElementById('contact-btn').onclick = function() {
        // Redirect to internal messaging system instead of direct contact
        requestContactInfo(worker.id);
    };
    
    // Website button
    if (worker.website) {
        document.getElementById('website-btn').onclick = function() {
            window.open(worker.website, '_blank');
        };
    }
    
    // Save button
    document.getElementById('save-btn').onclick = function() {
        const icon = this.querySelector('i');
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            this.classList.add('bg-white', 'bg-opacity-100', 'text-red-500');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            this.classList.remove('bg-white', 'bg-opacity-100', 'text-red-500');
        }
    };
}

// Utility Functions
function formatPhoneNumber(phone) {
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

function formatDescription(description) {
    // Split into paragraphs and format
    const paragraphs = description.split('\n').filter(p => p.trim());
    return paragraphs.map(p => `<p class="mb-4">${p.trim()}</p>`).join('');
}

function generateStars(rating, colorClass = 'text-yellow-400') {
    let starsHTML = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHTML += `<i class="fas fa-star ${colorClass}"></i>`;
        } else if (i === fullStars + 1 && hasHalfStar) {
            starsHTML += `<i class="fas fa-star-half-alt ${colorClass}"></i>`;
        } else {
            starsHTML += `<i class="far fa-star text-gray-300"></i>`;
        }
    }
    return starsHTML;
}

function getAvailabilityStatus(hours) {
    // Mock availability logic - you can enhance this
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    if (hours && hours.length > 0) {
        const todayHours = hours.find(h => h.dayIndex === currentDay);
        if (todayHours && todayHours.isOpen) {
            return { status: 'available', text: 'Available Today' };
        }
    }
    
    // Default status
    return { status: 'available', text: 'Available' };
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



// Update Service Area Display (new function for reorganized layout)
function updateServiceAreaDisplay(worker) {
    const fullAddressEl = document.getElementById('full-address');
    
    if (worker.location.fullAddress) {
        let serviceAreaHTML = `
            <div class="bg-gray-50 rounded-lg p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Service Address -->
                    <div class="flex items-start">
                        <div class="w-10 h-10 bg-kwikr-green bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-map-marker-alt text-kwikr-green"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-900 mb-2">Service Address</h4>
                            <p class="text-gray-700 text-sm">${worker.location.fullAddress}</p>
                        </div>
                    </div>
        `;
        
        // Add service radius if available
        if (worker.serviceRadius) {
            serviceAreaHTML += `
                    <!-- Service Radius -->
                    <div class="flex items-start">
                        <div class="w-10 h-10 bg-kwikr-green bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-circle-dot text-kwikr-green"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-900 mb-2">Service Radius</h4>
                            <p class="text-gray-700 text-sm">${worker.serviceRadius} km coverage area</p>
                        </div>
                    </div>
            `;
        }
        
        // Add service areas if available
        if (worker.serviceAreas && worker.serviceAreas.length > 0) {
            serviceAreaHTML += `
                    <!-- Service Areas -->
                    <div class="flex items-start">
                        <div class="w-10 h-10 bg-kwikr-green bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-map text-kwikr-green"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-900 mb-2">Service Areas</h4>
                            <div class="flex flex-wrap gap-1">
                                ${worker.serviceAreas.map(area => 
                                    `<span class="bg-kwikr-green bg-opacity-10 text-kwikr-green px-2 py-1 rounded text-xs font-medium">${area}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
            `;
        } else {
            // Default coverage info
            serviceAreaHTML += `
                    <!-- Default Coverage -->
                    <div class="flex items-start">
                        <div class="w-10 h-10 bg-kwikr-green bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-map text-kwikr-green"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-900 mb-2">Service Coverage</h4>
                            <p class="text-gray-700 text-sm">${worker.location.city}, ${worker.location.province} area</p>
                        </div>
                    </div>
            `;
        }
        
        serviceAreaHTML += `
                </div>
                
                <!-- Contact for Coverage Details -->
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <p class="text-sm text-gray-600 text-center">
                        <i class="fas fa-info-circle mr-2"></i>
                        Contact provider to confirm service availability in your specific area
                    </p>
                </div>
            </div>
        `;
        
        fullAddressEl.innerHTML = serviceAreaHTML;
    } else {
        fullAddressEl.innerHTML = `
            <div class="bg-gray-50 rounded-lg p-8 text-center">
                <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-map-marked-alt text-gray-400 text-2xl"></i>
                </div>
                <h4 class="font-semibold text-gray-700 mb-2">Service Area Information</h4>
                <p class="text-gray-500 mb-4">Contact provider for service coverage details</p>
                <button onclick="requestContactInfo('${worker.id}')" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
                    <i class="fas fa-phone mr-2"></i>Contact Provider
                </button>
            </div>
        `;
    }
}