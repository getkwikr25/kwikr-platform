/**
 * Mobile & API Dashboard JavaScript
 * Handles all frontend functionality for the Mobile & API management interface
 */

// Global state
let dashboardData = {
    overview: null,
    apiEndpoints: [],
    developers: [],
    webhooks: [],
    webhookEvents: [],
    sdkVersions: [],
    sdkStats: [],
    pwaStats: null,
    pushNotifications: []
};

let charts = {};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    switchTab('api-docs'); // Default tab
});

async function initializeDashboard() {
    showLoading();
    try {
        await loadDashboardOverview();
        await loadAllData();
        initializeCharts();
        updateUI();
        hideLoading();
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        showAlert('Failed to load dashboard data', 'error');
        hideLoading();
    }
}

async function refreshDashboard() {
    await initializeDashboard();
    showAlert('Dashboard refreshed successfully', 'success');
}

// API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await axios({
            url: `/api/mobile-api${endpoint}`,
            method: options.method || 'GET',
            data: options.data,
            ...options
        });
        return response.data;
    } catch (error) {
        console.error(`API call failed for ${endpoint}:`, error);
        throw error;
    }
}

async function loadDashboardOverview() {
    dashboardData.overview = await apiCall('/dashboard/overview');
}

async function loadAllData() {
    try {
        const [endpoints, developers, webhooks, events, versions, stats, pwaStats, notifications] = await Promise.all([
            apiCall('/documentation/endpoints'),
            apiCall('/developers'),
            apiCall('/webhooks'),
            apiCall('/webhooks/events'),
            apiCall('/sdks/versions'),
            apiCall('/sdks/stats'),
            apiCall('/pwa/stats'),
            apiCall('/pwa/push/notifications')
        ]);

        dashboardData.apiEndpoints = endpoints.data || [];
        dashboardData.developers = developers.data || [];
        dashboardData.webhooks = webhooks.data || [];
        dashboardData.webhookEvents = events.data || [];
        dashboardData.sdkVersions = versions.data || [];
        dashboardData.sdkStats = stats.data || [];
        dashboardData.pwaStats = pwaStats.data || {};
        dashboardData.pushNotifications = notifications.data || [];
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// UI Updates
function updateUI() {
    updateOverviewCards();
    updateAPIDocsTab();
    updateWebhooksTab();
    updateSDKTab();
    updatePWATab();
}

function updateOverviewCards() {
    const overview = dashboardData.overview;
    if (!overview) return;

    // API Documentation metrics
    document.getElementById('totalEndpoints').textContent = overview.data.api_documentation.total_endpoints;
    document.getElementById('activeDevelopers').textContent = overview.data.api_documentation.active_developers;

    // Webhooks metrics
    document.getElementById('totalWebhooks').textContent = overview.data.webhooks.total_endpoints;
    document.getElementById('webhookSuccessRate').textContent = overview.data.webhooks.avg_success_rate;

    // SDK metrics
    document.getElementById('totalDownloads').textContent = overview.data.sdks.total_downloads.toLocaleString();
    document.getElementById('supportedPlatforms').textContent = overview.data.sdks.supported_platforms;

    // PWA metrics
    document.getElementById('pwaInstalls').textContent = overview.data.pwa.total_installations;
    document.getElementById('activePWA').textContent = overview.data.pwa.active_installations;
}

function updateAPIDocsTab() {
    // Update API endpoints list
    const endpointsList = document.getElementById('apiEndpointsList');
    endpointsList.innerHTML = '';

    if (dashboardData.apiEndpoints.length === 0) {
        endpointsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-inbox text-3xl mb-2"></i>
                <p>No API endpoints found</p>
            </div>
        `;
        return;
    }

    dashboardData.apiEndpoints.forEach(endpoint => {
        const endpointCard = document.createElement('div');
        endpointCard.className = 'bg-white border rounded-lg p-3 hover:shadow-md transition-shadow';
        endpointCard.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center space-x-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getMethodColor(endpoint.http_method)}-100 text-${getMethodColor(endpoint.http_method)}-800">
                            ${endpoint.http_method}
                        </span>
                        <span class="text-sm font-medium">${endpoint.endpoint_path}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${endpoint.title}</p>
                    ${endpoint.deprecated ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Deprecated</span>' : ''}
                </div>
                <div class="flex items-center space-x-1">
                    <button onclick="editEndpoint(${endpoint.id})" class="text-blue-600 hover:text-blue-900 p-1">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteEndpoint(${endpoint.id})" class="text-red-600 hover:text-red-900 p-1">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        endpointsList.appendChild(endpointCard);
    });

    // Update developers list
    const developersList = document.getElementById('developersList');
    developersList.innerHTML = '';

    if (dashboardData.developers.length === 0) {
        developersList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-user-slash text-3xl mb-2"></i>
                <p>No developers registered</p>
            </div>
        `;
        return;
    }

    dashboardData.developers.forEach(developer => {
        const developerCard = document.createElement('div');
        developerCard.className = 'bg-white border rounded-lg p-3 hover:shadow-md transition-shadow';
        developerCard.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <p class="text-sm font-medium">${developer.name}</p>
                    <p class="text-xs text-gray-500">${developer.email}</p>
                    <div class="flex items-center space-x-2 mt-1">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${developer.status === 'active' ? 'green' : 'red'}-100 text-${developer.status === 'active' ? 'green' : 'red'}-800">
                            ${developer.status}
                        </span>
                        <span class="text-xs text-gray-400">${developer.rate_limit_tier}</span>
                    </div>
                </div>
                <div class="flex items-center space-x-1">
                    <button onclick="viewDeveloperUsage(${developer.id})" class="text-blue-600 hover:text-blue-900 p-1">
                        <i class="fas fa-chart-line"></i>
                    </button>
                    <button onclick="manageDeveloper(${developer.id})" class="text-green-600 hover:text-green-900 p-1">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
        `;
        developersList.appendChild(developerCard);
    });
}

function updateWebhooksTab() {
    // Update webhooks list
    const webhooksList = document.getElementById('webhooksList');
    webhooksList.innerHTML = '';

    if (dashboardData.webhooks.length === 0) {
        webhooksList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-webhook text-3xl mb-2"></i>
                <p>No webhooks configured</p>
            </div>
        `;
    } else {
        dashboardData.webhooks.forEach(webhook => {
            const webhookCard = document.createElement('div');
            webhookCard.className = 'bg-white border rounded-lg p-3 hover:shadow-md transition-shadow';
            webhookCard.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <p class="text-sm font-medium truncate">${webhook.url}</p>
                        <div class="flex items-center space-x-2 mt-1">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${webhook.status === 'active' ? 'green' : webhook.status === 'failed' ? 'red' : 'gray'}-100 text-${webhook.status === 'active' ? 'green' : webhook.status === 'failed' ? 'red' : 'gray'}-800">
                                ${webhook.status}
                            </span>
                            <span class="text-xs text-gray-400">${webhook.events.length} events</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-1">
                        <button onclick="testWebhook(${webhook.id})" class="text-blue-600 hover:text-blue-900 p-1">
                            <i class="fas fa-play"></i>
                        </button>
                        <button onclick="editWebhook(${webhook.id})" class="text-green-600 hover:text-green-900 p-1">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteWebhook(${webhook.id})" class="text-red-600 hover:text-red-900 p-1">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            webhooksList.appendChild(webhookCard);
        });
    }

    // Update webhook events list
    const eventsList = document.getElementById('webhookEventsList');
    eventsList.innerHTML = '';

    if (dashboardData.webhookEvents.length === 0) {
        eventsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-bolt text-3xl mb-2"></i>
                <p>No recent events</p>
            </div>
        `;
    } else {
        dashboardData.webhookEvents.slice(0, 10).forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'bg-white border rounded-lg p-3';
            eventCard.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <p class="text-sm font-medium">${event.event_type}</p>
                        <p class="text-xs text-gray-500">${new Date(event.triggered_at).toLocaleString()}</p>
                    </div>
                    <button onclick="viewEventDetails(${event.id})" class="text-blue-600 hover:text-blue-900 p-1">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            `;
            eventsList.appendChild(eventCard);
        });
    }
}

function updateSDKTab() {
    // Update SDK platforms filter
    const platformFilter = document.getElementById('sdkPlatformFilter');
    const platforms = [...new Set(dashboardData.sdkVersions.map(v => v.platform))];
    
    platforms.forEach(platform => {
        if (!platformFilter.querySelector(`option[value="${platform}"]`)) {
            const option = document.createElement('option');
            option.value = platform;
            option.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
            platformFilter.appendChild(option);
        }
    });

    // Update SDK versions list
    const versionsList = document.getElementById('sdkVersionsList');
    versionsList.innerHTML = '';

    if (dashboardData.sdkVersions.length === 0) {
        versionsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-code text-3xl mb-2"></i>
                <p>No SDK versions available</p>
            </div>
        `;
    } else {
        dashboardData.sdkVersions.forEach(version => {
            const versionCard = document.createElement('div');
            versionCard.className = 'bg-white border rounded-lg p-3 hover:shadow-md transition-shadow';
            versionCard.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2">
                            <span class="text-sm font-medium">${version.platform}</span>
                            <span class="text-xs text-gray-400">v${version.version}</span>
                        </div>
                        <div class="flex items-center space-x-2 mt-1">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(version.status)}-100 text-${getStatusColor(version.status)}-800">
                                ${version.status}
                            </span>
                            ${version.file_size ? `<span class="text-xs text-gray-400">${formatFileSize(version.file_size)}</span>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center space-x-1">
                        <button onclick="downloadSDK(${version.id})" class="text-blue-600 hover:text-blue-900 p-1">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="viewSDKStats(${version.id})" class="text-green-600 hover:text-green-900 p-1">
                            <i class="fas fa-chart-bar"></i>
                        </button>
                    </div>
                </div>
            `;
            versionsList.appendChild(versionCard);
        });
    }

    // Update SDK statistics
    const statsList = document.getElementById('sdkStatsList');
    statsList.innerHTML = '';

    if (dashboardData.sdkStats.length === 0) {
        statsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-chart-pie text-3xl mb-2"></i>
                <p>No SDK statistics available</p>
            </div>
        `;
    } else {
        dashboardData.sdkStats.forEach(stat => {
            const statCard = document.createElement('div');
            statCard.className = 'bg-white border rounded-lg p-4';
            statCard.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium">${stat.platform.charAt(0).toUpperCase() + stat.platform.slice(1)}</h4>
                    <span class="text-sm text-gray-500">${stat.avg_rating.toFixed(1)} ⭐</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p class="text-gray-500">Downloads</p>
                        <p class="font-semibold">${stat.total_downloads.toLocaleString()}</p>
                    </div>
                    <div>
                        <p class="text-gray-500">Developers</p>
                        <p class="font-semibold">${stat.unique_developers}</p>
                    </div>
                </div>
            `;
            statsList.appendChild(statCard);
        });
    }
}

function updatePWATab() {
    if (dashboardData.pwaStats) {
        document.getElementById('pwaTotal').textContent = dashboardData.pwaStats.total_installations;
        document.getElementById('pwaActive').textContent = dashboardData.pwaStats.active_installations;
    }

    // Update PWA installations list
    const installationsList = document.getElementById('pwaInstallationsList');
    installationsList.innerHTML = `
        <div class="grid grid-cols-2 gap-2 mb-4">
            ${Object.entries(dashboardData.pwaStats.installations_by_platform || {}).map(([platform, count]) => `
                <div class="bg-white p-3 rounded border text-center">
                    <i class="fas fa-${getPlatformIcon(platform)} text-lg mb-1"></i>
                    <p class="text-xs text-gray-500">${platform}</p>
                    <p class="font-semibold">${count}</p>
                </div>
            `).join('')}
        </div>
    `;

    // Update push notifications list
    const notificationsList = document.getElementById('pushNotificationsList');
    notificationsList.innerHTML = '';

    if (dashboardData.pushNotifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <i class="fas fa-bell-slash text-2xl mb-2"></i>
                <p class="text-sm">No notifications sent</p>
            </div>
        `;
    } else {
        dashboardData.pushNotifications.slice(0, 5).forEach(notification => {
            const notificationCard = document.createElement('div');
            notificationCard.className = 'bg-white border rounded-lg p-3';
            notificationCard.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <p class="text-sm font-medium truncate">${notification.title}</p>
                        <p class="text-xs text-gray-500 truncate">${notification.body}</p>
                        <div class="flex items-center space-x-2 mt-1">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getNotificationStatusColor(notification.status)}-100 text-${getNotificationStatusColor(notification.status)}-800">
                                ${notification.status}
                            </span>
                            <span class="text-xs text-gray-400">${new Date(notification.sent_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `;
            notificationsList.appendChild(notificationCard);
        });
    }
}

// Tab management
function switchTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Activate selected tab
    const activeButton = document.getElementById(`tab-${tabName}`);
    const activeContent = document.getElementById(`content-${tabName}`);
    
    if (activeButton && activeContent) {
        activeButton.classList.add('active', 'border-blue-500', 'text-blue-600');
        activeButton.classList.remove('border-transparent', 'text-gray-500');
        activeContent.classList.add('active');
    }
}

// Charts
function initializeCharts() {
    initializeAPIChart();
    initializeWebhookChart();
    initializeSDKChart();
    initializePWAChart();
}

function initializeAPIChart() {
    const ctx = document.getElementById('apiUsageChart').getContext('2d');
    charts.apiUsage = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'API Requests',
                data: [1200, 1900, 3000, 2800, 3200, 4100],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function initializeWebhookChart() {
    const ctx = document.getElementById('webhookChart').getContext('2d');
    charts.webhooks = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Delivered', 'Failed', 'Pending'],
            datasets: [{
                data: [85, 10, 5],
                backgroundColor: [
                    'rgb(34, 197, 94)',
                    'rgb(239, 68, 68)',
                    'rgb(251, 191, 36)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function initializeSDKChart() {
    const ctx = document.getElementById('sdkChart').getContext('2d');
    const platformData = dashboardData.sdkStats.map(stat => ({
        platform: stat.platform,
        downloads: stat.total_downloads
    }));

    charts.sdk = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: platformData.map(d => d.platform),
            datasets: [{
                label: 'Downloads',
                data: platformData.map(d => d.downloads),
                backgroundColor: 'rgba(147, 51, 234, 0.8)',
                borderColor: 'rgb(147, 51, 234)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function initializePWAChart() {
    const ctx = document.getElementById('pwaChart').getContext('2d');
    charts.pwa = new Chart(ctx, {
        type: 'area',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Active Sessions',
                data: [450, 680, 920, 1100],
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Modal functions
function showAddEndpointModal() {
    const modal = createModal('Add API Endpoint', `
        <form onsubmit="createAPIEndpoint(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Endpoint Path</label>
                <input type="text" name="endpoint_path" required 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                       placeholder="/api/example">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">HTTP Method</label>
                <select name="http_method" required 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" name="title" required 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                       placeholder="Get user information">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Detailed description of the endpoint"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input type="text" name="tags"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                       placeholder="users, authentication, public">
            </div>
            <div class="flex justify-end space-x-3 pt-4">
                <button type="button" onclick="closeModal()" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                    Cancel
                </button>
                <button type="submit" 
                        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                    Create Endpoint
                </button>
            </div>
        </form>
    `);
    showModal(modal);
}

async function createAPIEndpoint(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const endpointData = Object.fromEntries(formData.entries());
    
    try {
        await apiCall('/documentation/endpoints', {
            method: 'POST',
            data: endpointData
        });
        
        closeModal();
        await loadAllData();
        updateAPIDocsTab();
        showAlert('API endpoint created successfully', 'success');
    } catch (error) {
        showAlert('Failed to create API endpoint', 'error');
    }
}

function showAddWebhookModal() {
    const modal = createModal('Add Webhook', `
        <form onsubmit="createWebhook(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                <input type="url" name="url" required 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                       placeholder="https://your-app.com/webhook">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Events</label>
                <div class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    <label class="flex items-center"><input type="checkbox" name="events" value="user.created" class="mr-2"> User Created</label>
                    <label class="flex items-center"><input type="checkbox" name="events" value="user.updated" class="mr-2"> User Updated</label>
                    <label class="flex items-center"><input type="checkbox" name="events" value="job.created" class="mr-2"> Job Created</label>
                    <label class="flex items-center"><input type="checkbox" name="events" value="job.completed" class="mr-2"> Job Completed</label>
                    <label class="flex items-center"><input type="checkbox" name="events" value="payment.completed" class="mr-2"> Payment Completed</label>
                    <label class="flex items-center"><input type="checkbox" name="events" value="booking.confirmed" class="mr-2"> Booking Confirmed</label>
                </div>
            </div>
            <div class="flex justify-end space-x-3 pt-4">
                <button type="button" onclick="closeModal()" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                    Cancel
                </button>
                <button type="submit" 
                        class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md">
                    Create Webhook
                </button>
            </div>
        </form>
    `);
    showModal(modal);
}

async function createWebhook(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const selectedEvents = Array.from(formData.getAll('events'));
    
    const webhookData = {
        url: formData.get('url'),
        events: selectedEvents
    };
    
    try {
        await apiCall('/webhooks', {
            method: 'POST',
            data: webhookData
        });
        
        closeModal();
        await loadAllData();
        updateWebhooksTab();
        showAlert('Webhook created successfully', 'success');
    } catch (error) {
        showAlert('Failed to create webhook', 'error');
    }
}

function showGenerateSDKModal() {
    const modal = createModal('Generate SDK', `
        <form onsubmit="generateSDK(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select name="platform" required 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="javascript">JavaScript/Node.js</option>
                    <option value="python">Python</option>
                    <option value="php">PHP</option>
                    <option value="java">Java</option>
                    <option value="csharp">C#</option>
                    <option value="ruby">Ruby</option>
                    <option value="go">Go</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                <input type="text" name="package_name"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                       placeholder="kwikr-api-client">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                <input type="url" name="base_url"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                       placeholder="https://api.kwikr.directory">
            </div>
            <div class="flex items-center space-x-4">
                <label class="flex items-center">
                    <input type="checkbox" name="include_examples" class="mr-2">
                    Include Examples
                </label>
                <label class="flex items-center">
                    <input type="checkbox" name="include_tests" class="mr-2">
                    Include Tests
                </label>
            </div>
            <div class="flex justify-end space-x-3 pt-4">
                <button type="button" onclick="closeModal()" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                    Cancel
                </button>
                <button type="submit" 
                        class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md">
                    Generate SDK
                </button>
            </div>
        </form>
    `);
    showModal(modal);
}

async function generateSDK(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const sdkOptions = {
        package_name: formData.get('package_name'),
        base_url: formData.get('base_url'),
        include_examples: formData.has('include_examples'),
        include_tests: formData.has('include_tests')
    };
    
    const platform = formData.get('platform');
    
    try {
        showLoading();
        const result = await apiCall(`/sdks/generate/${platform}`, {
            method: 'POST',
            data: sdkOptions
        });
        
        // Display generated files
        const filesModal = createModal('Generated SDK Files', `
            <div class="space-y-4">
                <p class="text-sm text-gray-600">SDK files have been generated for ${platform}:</p>
                <div class="max-h-60 overflow-y-auto space-y-2">
                    ${result.data.files.map(file => `
                        <div class="bg-gray-50 rounded p-3">
                            <div class="flex items-center justify-between">
                                <span class="font-mono text-sm">${file.filename}</span>
                                <button onclick="downloadFile('${file.filename}', \`${file.content.replace(/`/g, '\\`')}\`)" 
                                        class="text-blue-600 hover:text-blue-900 text-sm">
                                    <i class="fas fa-download"></i> Download
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="flex justify-end">
                    <button onclick="closeModal()" 
                            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                        Close
                    </button>
                </div>
            </div>
        `);
        
        closeModal();
        showModal(filesModal);
        hideLoading();
    } catch (error) {
        hideLoading();
        showAlert('Failed to generate SDK', 'error');
    }
}

function showSendNotificationModal() {
    const modal = createModal('Send Push Notification', `
        <form onsubmit="sendPushNotification(event)" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" name="title" required 
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                       placeholder="Notification title">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea name="body" required rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Notification message"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Icon URL (optional)</label>
                <input type="url" name="icon"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                       placeholder="https://example.com/icon.png">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Target User ID (optional)</label>
                <input type="number" name="user_id"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                       placeholder="Leave empty to send to all users">
            </div>
            <div class="flex justify-end space-x-3 pt-4">
                <button type="button" onclick="closeModal()" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                    Cancel
                </button>
                <button type="submit" 
                        class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">
                    Send Notification
                </button>
            </div>
        </form>
    `);
    showModal(modal);
}

async function sendPushNotification(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const notificationData = Object.fromEntries(formData.entries());
    
    // Remove empty fields
    Object.keys(notificationData).forEach(key => {
        if (!notificationData[key]) {
            delete notificationData[key];
        }
    });
    
    try {
        await apiCall('/pwa/push/send', {
            method: 'POST',
            data: notificationData
        });
        
        closeModal();
        await loadAllData();
        updatePWATab();
        showAlert('Push notification sent successfully', 'success');
    } catch (error) {
        showAlert('Failed to send push notification', 'error');
    }
}

// Utility functions
function getMethodColor(method) {
    const colors = {
        'GET': 'blue',
        'POST': 'green',
        'PUT': 'yellow',
        'DELETE': 'red',
        'PATCH': 'purple'
    };
    return colors[method] || 'gray';
}

function getStatusColor(status) {
    const colors = {
        'stable': 'green',
        'beta': 'blue',
        'alpha': 'yellow',
        'deprecated': 'red'
    };
    return colors[status] || 'gray';
}

function getNotificationStatusColor(status) {
    const colors = {
        'sent': 'blue',
        'delivered': 'green',
        'clicked': 'purple',
        'failed': 'red',
        'pending': 'yellow'
    };
    return colors[status] || 'gray';
}

function getPlatformIcon(platform) {
    const icons = {
        'android': 'android',
        'ios': 'apple',
        'desktop': 'desktop',
        'other': 'mobile'
    };
    return icons[platform] || 'mobile';
}

function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Modal utilities
function createModal(title, content) {
    return `
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onclick="closeModal()">
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white" onclick="event.stopPropagation()">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-gray-900">${title}</h3>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="mt-2">
                    ${content}
                </div>
            </div>
        </div>
    `;
}

function showModal(modalHTML) {
    document.getElementById('modalContainer').innerHTML = modalHTML;
}

function closeModal() {
    document.getElementById('modalContainer').innerHTML = '';
}

function showAlert(message, type = 'info') {
    const alertBanner = document.getElementById('alertBanner');
    const alertMessage = document.getElementById('alertMessage');
    
    alertMessage.textContent = message;
    alertBanner.className = `mb-6 border-l-4 p-4 rounded-r-lg ${
        type === 'error' ? 'bg-red-50 border-red-400' :
        type === 'success' ? 'bg-green-50 border-green-400' :
        'bg-blue-50 border-blue-400'
    }`;
    
    alertBanner.classList.remove('hidden');
    
    setTimeout(() => {
        alertBanner.classList.add('hidden');
    }, 5000);
}

function showLoading() {
    // Add loading spinner or overlay
}

function hideLoading() {
    // Remove loading spinner or overlay
}

// Action handlers (implement these based on your needs)
async function editEndpoint(id) { /* Implementation */ }
async function deleteEndpoint(id) { /* Implementation */ }
async function testWebhook(id) { /* Implementation */ }
async function editWebhook(id) { /* Implementation */ }
async function deleteWebhook(id) { /* Implementation */ }
async function retryFailedWebhooks() { /* Implementation */ }
async function generateOpenAPISpec() { /* Implementation */ }
async function viewDeveloperUsage(id) { /* Implementation */ }
async function manageDeveloper(id) { /* Implementation */ }
async function downloadSDK(id) { /* Implementation */ }
async function viewSDKStats(id) { /* Implementation */ }
async function generateVAPIDKeys() { /* Implementation */ }
async function showPWACompatibilityModal() { /* Implementation */ }
async function viewEventDetails(id) { /* Implementation */ }
async function filterSDKVersions() { /* Implementation */ }
async function showAddDeveloperModal() { /* Implementation */ }
async function showTriggerEventModal() { /* Implementation */ }