/**
 * Compliance Dashboard JavaScript
 * Handles all frontend functionality for the compliance & security dashboard
 */

class ComplianceDashboard {
    constructor() {
        this.apiBase = '/api/compliance';
        this.data = {};
        this.charts = {};
        this.refreshInterval = 300000; // 5 minutes
        this.refreshTimer = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTabs();
        this.loadDashboard();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadDashboard();
        });

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    initializeTabs() {
        this.switchTab('overview');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('tab-active');
            btn.classList.add('border-transparent', 'text-gray-500');
            btn.classList.remove('border-blue-500', 'text-blue-600');
        });

        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('tab-active');
            activeBtn.classList.remove('border-transparent', 'text-gray-500');
            activeBtn.classList.add('border-blue-500', 'text-blue-600');
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        const activeContent = document.getElementById(`tab-${tabName}`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
        }

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    async loadDashboard() {
        this.showLoading();
        
        try {
            // Load overview data
            const response = await axios.get(`${this.apiBase}/dashboard/overview`);
            this.data.overview = response.data.data;
            
            // Load alerts
            const alertsResponse = await axios.get(`${this.apiBase}/dashboard/alerts`);
            this.data.alerts = alertsResponse.data.data;
            
            this.updateOverviewCards();
            this.updateAlerts();
            this.updateLastUpdated();
            
            this.hideLoading();
            
            this.showToast('Dashboard updated successfully', 'success');
        } catch (error) {
            console.error('Error loading dashboard:', error);
            
            // Load mock data when API fails
            this.data.overview = {
                backgroundChecks: {
                    total: 156,
                    completed: 142,
                    pending: 14,
                    failed: 0,
                    complianceRate: 91.0
                },
                insurance: {
                    total: 156,
                    verified: 134,
                    expired: 8,
                    pending: 14,
                    coverageRate: 85.9
                },
                licenses: {
                    total: 203,
                    valid: 189,
                    expired: 12,
                    pending: 2,
                    validityRate: 93.1
                },
                gdpr: {
                    consentRate: 98.5,
                    dataRequests: 12,
                    deletionRequests: 3,
                    dataBreaches: 0
                },
                security: {
                    threatLevel: 'Low',
                    blockedAttempts: 247,
                    securityScore: 94,
                    vulnerabilities: 2
                },
                rateLimiting: {
                    requestsPerMinute: 1247,
                    blockedRequests: 23,
                    successRate: 98.2,
                    topEndpoints: [
                        { endpoint: '/api/jobs', requests: 456 },
                        { endpoint: '/api/users', requests: 234 }
                    ]
                }
            };
            
            this.data.alerts = [
                {
                    id: 1,
                    type: 'license',
                    severity: 'medium',
                    title: 'License Expiry Alert',
                    message: '12 worker licenses expire within 30 days',
                    timestamp: new Date().toISOString(),
                    resolved: false
                },
                {
                    id: 2,
                    type: 'security',
                    severity: 'low',
                    title: 'Security Scan Complete',
                    message: 'Weekly security scan completed successfully',
                    timestamp: new Date().toISOString(),
                    resolved: true
                }
            ];
            
            this.updateOverviewCards();
            this.updateAlerts();
            this.updateLastUpdated();
            this.hideLoading();
            
            this.showToast('Using demo data - API connection failed', 'warning');
        }
    }

    async loadTabData(tabName) {
        if (!this.data.overview) return;

        switch (tabName) {
            case 'overview':
                this.updateOverviewCharts();
                this.updateRecentActivity();
                break;
            case 'background-checks':
                await this.loadBackgroundChecks();
                break;
            case 'insurance':
                await this.loadInsurance();
                break;
            case 'licenses':
                await this.loadLicenses();
                break;
            case 'gdpr':
                await this.loadGDPR();
                break;
            case 'security':
                await this.loadSecurity();
                break;
            case 'rate-limiting':
                await this.loadRateLimiting();
                break;
        }
    }

    updateOverviewCards() {
        const data = this.data.overview;
        if (!data) return;

        // Calculate overall compliance score
        const complianceScores = [
            data.summary.background_checks.success_rate,
            data.summary.insurance.success_rate,
            data.summary.licenses.success_rate,
            data.summary.gdpr.compliance_score
        ];
        const overallScore = Math.round(complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length);

        document.getElementById('overallScore').textContent = `${overallScore}%`;
        document.getElementById('complianceTrend').innerHTML = `
            <span class="text-gray-600">Trend: </span>
            <span class="font-medium text-green-600">
                <i class="fas fa-arrow-up"></i> Stable
            </span>
        `;

        // Security risk level
        const riskLevel = data.summary.security.risk_level;
        const riskColors = {
            low: 'text-green-600',
            medium: 'text-yellow-600',
            high: 'text-red-600',
            critical: 'text-red-800'
        };
        
        document.getElementById('securityRisk').textContent = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
        document.getElementById('securityRisk').className = `text-2xl font-bold ${riskColors[riskLevel]}`;
        document.getElementById('riskDetails').textContent = `${data.summary.security.threat_detections} threats detected`;

        // Active alerts
        document.getElementById('activeAlerts').textContent = this.data.alerts?.total_alerts || 0;
        document.getElementById('highPriorityAlerts').textContent = this.data.alerts?.high_priority?.length || 0;

        // System status
        const criticalIssues = data.summary.security.critical_events + data.summary.gdpr.data_breaches;
        const systemStatus = criticalIssues > 0 ? 'Critical' : 'Operational';
        const statusColor = criticalIssues > 0 ? 'text-red-600' : 'text-green-600';
        
        document.getElementById('systemStatus').textContent = systemStatus;
        document.getElementById('systemStatus').className = `text-2xl font-bold ${statusColor}`;
        document.getElementById('systemUptime').textContent = 'All systems operational';
    }

    updateAlerts() {
        const alertsList = document.getElementById('alertsList');
        const alerts = this.data.alerts;
        
        if (!alerts || alerts.total_alerts === 0) {
            alertsList.innerHTML = '<p class="text-gray-500 italic">No active alerts</p>';
            return;
        }

        const alertsHtml = alerts.high_priority.map(alert => `
            <div class="alert-card alert-${alert.severity} bg-white border rounded-lg p-4 mb-3">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-triangle text-${alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'yellow' : 'green'}-500"></i>
                    </div>
                    <div class="ml-3 flex-1">
                        <h4 class="text-sm font-medium text-gray-900">${alert.type.replace(/_/g, ' ').toUpperCase()}</h4>
                        <p class="text-sm text-gray-600 mt-1">${alert.message}</p>
                        <div class="mt-2 flex items-center space-x-2">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${alert.severity === 'high' ? 'red' : 'yellow'}-100 text-${alert.severity === 'high' ? 'red' : 'yellow'}-800">
                                ${alert.severity.toUpperCase()}
                            </span>
                            <button class="text-sm text-blue-600 hover:text-blue-800">View Details</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        alertsList.innerHTML = alertsHtml;
    }

    updateOverviewCharts() {
        // Compliance Status Doughnut Chart
        const complianceCtx = document.getElementById('complianceChart').getContext('2d');
        if (this.charts.compliance) this.charts.compliance.destroy();
        
        const data = this.data.overview;
        const complianceData = [
            data.summary.background_checks.completed,
            data.summary.insurance.verified,
            data.summary.licenses.verified,
            data.summary.gdpr.compliance_score
        ];

        this.charts.compliance = new Chart(complianceCtx, {
            type: 'doughnut',
            data: {
                labels: ['Background Checks', 'Insurance', 'Licenses', 'GDPR'],
                datasets: [{
                    data: complianceData,
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Security Trends Line Chart
        const securityCtx = document.getElementById('securityTrendsChart').getContext('2d');
        if (this.charts.securityTrends) this.charts.securityTrends.destroy();

        // Generate sample trend data
        const labels = [];
        const eventData = [];
        const threatData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = dayjs().subtract(i, 'day');
            labels.push(date.format('MMM DD'));
            eventData.push(Math.floor(Math.random() * 100) + 50);
            threatData.push(Math.floor(Math.random() * 10) + 1);
        }

        this.charts.securityTrends = new Chart(securityCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Security Events',
                    data: eventData,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Threats',
                    data: threatData,
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateRecentActivity() {
        const container = document.getElementById('recentActivity');
        const activities = [
            { icon: 'user-check', text: 'Background check completed for User #1234', time: '2 minutes ago', type: 'success' },
            { icon: 'shield-alt', text: 'Insurance policy verified for User #5678', time: '15 minutes ago', type: 'info' },
            { icon: 'exclamation-triangle', text: 'License expiring soon for User #9012', time: '1 hour ago', type: 'warning' },
            { icon: 'lock', text: 'Security event detected from IP 192.168.1.100', time: '2 hours ago', type: 'error' }
        ];

        const activityHtml = activities.map(activity => `
            <div class="flex items-center space-x-3 p-3 bg-white rounded border">
                <div class="flex-shrink-0">
                    <i class="fas fa-${activity.icon} text-${activity.type === 'success' ? 'green' : activity.type === 'warning' ? 'yellow' : activity.type === 'error' ? 'red' : 'blue'}-500"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm text-gray-900">${activity.text}</p>
                    <p class="text-xs text-gray-500">${activity.time}</p>
                </div>
            </div>
        `).join('');

        container.innerHTML = activityHtml;
    }

    async loadBackgroundChecks() {
        try {
            const response = await axios.get(`${this.apiBase}/background-checks/report`);
            const report = response.data.data;

            document.getElementById('bgCompleted').textContent = report.completed_checks;
            document.getElementById('bgPending').textContent = report.pending_checks;
            document.getElementById('bgFailed').textContent = report.failed_checks;

            // Load background checks table (mock data for now)
            this.updateBackgroundChecksTable([]);
        } catch (error) {
            console.error('Error loading background checks:', error);
        }
    }

    updateBackgroundChecksTable(checks) {
        const tbody = document.getElementById('backgroundChecksTable');
        
        if (checks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                        No background checks found
                    </td>
                </tr>
            `;
            return;
        }

        // This would display actual data in a real implementation
        const sampleRows = `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John Doe</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Criminal</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">85/100</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-01-15</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900">View</button>
                </td>
            </tr>
        `;
        
        tbody.innerHTML = sampleRows;
    }

    async loadInsurance() {
        try {
            const response = await axios.get(`${this.apiBase}/insurance/report`);
            const report = response.data.data;

            document.getElementById('insuranceActive').textContent = report.active_policies;
            document.getElementById('insuranceVerified').textContent = report.verified_policies;
            document.getElementById('insuranceExpiring').textContent = report.expiring_within_30_days;
            document.getElementById('insuranceCoverage').textContent = this.formatCurrency(report.total_coverage_value);

            this.updateInsuranceChart(report.coverage_by_type);
        } catch (error) {
            console.error('Error loading insurance:', error);
        }
    }

    updateInsuranceChart(coverageData) {
        const ctx = document.getElementById('insuranceChart').getContext('2d');
        if (this.charts.insurance) this.charts.insurance.destroy();

        const labels = Object.keys(coverageData);
        const data = Object.values(coverageData).map(item => item.total_value);

        this.charts.insurance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Coverage Amount',
                    data: data,
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    async loadLicenses() {
        try {
            const response = await axios.get(`${this.apiBase}/licenses/report`);
            const report = response.data.data;

            document.getElementById('licensesActive').textContent = report.active_licenses;
            document.getElementById('licensesVerified').textContent = report.verified_licenses;
            document.getElementById('licensesExpiring').textContent = report.expiring_within_30_days;
            document.getElementById('licensesJurisdictions').textContent = Object.keys(report.licenses_by_jurisdiction).length;

            this.updateLicensesChart(report.licenses_by_type);
        } catch (error) {
            console.error('Error loading licenses:', error);
        }
    }

    updateLicensesChart(licenseData) {
        const ctx = document.getElementById('licensesChart').getContext('2d');
        if (this.charts.licenses) this.charts.licenses.destroy();

        const labels = Object.keys(licenseData);
        const data = Object.values(licenseData);

        this.charts.licenses = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    async loadGDPR() {
        try {
            const response = await axios.get(`${this.apiBase}/gdpr/report`);
            const report = response.data.data;

            document.getElementById('gdprConsents').textContent = report.consent_records.total_recorded;
            document.getElementById('gdprRequests').textContent = report.data_requests.total_requests;
            document.getElementById('gdprBreaches').textContent = report.data_breaches.total_breaches;
            document.getElementById('gdprScore').textContent = `${report.compliance_score}%`;

            this.updateGDPRSummary(report);
        } catch (error) {
            console.error('Error loading GDPR:', error);
        }
    }

    updateGDPRSummary(report) {
        const container = document.getElementById('gdprSummary');
        
        const summaryItems = [
            { 
                label: 'Data Requests', 
                value: `${report.data_requests.completed_requests}/${report.data_requests.total_requests} completed`,
                status: report.data_requests.overdue_requests === 0 ? 'success' : 'warning'
            },
            { 
                label: 'Consent Management', 
                value: `${report.consent_records.total_withdrawn} withdrawals`,
                status: 'info'
            },
            { 
                label: 'Breach Response', 
                value: report.data_breaches.total_breaches === 0 ? 'No breaches' : `${report.data_breaches.total_breaches} breaches`,
                status: report.data_breaches.total_breaches === 0 ? 'success' : 'error'
            }
        ];

        const summaryHtml = summaryItems.map(item => `
            <div class="flex justify-between items-center p-3 bg-white rounded border">
                <span class="font-medium text-gray-900">${item.label}</span>
                <span class="text-sm text-${item.status === 'success' ? 'green' : item.status === 'warning' ? 'yellow' : item.status === 'error' ? 'red' : 'blue'}-600">
                    ${item.value}
                </span>
            </div>
        `).join('');

        container.innerHTML = summaryHtml;
    }

    async loadSecurity() {
        try {
            const response = await axios.get(`${this.apiBase}/security/metrics`);
            const metrics = response.data.data;

            document.getElementById('securityEvents').textContent = metrics.total_events;
            document.getElementById('securityThreats').textContent = metrics.threat_detections;
            document.getElementById('securityCritical').textContent = metrics.events_by_severity.critical;
            document.getElementById('securityIPs').textContent = metrics.unique_ips;

            this.updateSecurityCharts(metrics);
        } catch (error) {
            console.error('Error loading security metrics:', error);
        }
    }

    updateSecurityCharts(metrics) {
        // Security Events Chart
        const eventsCtx = document.getElementById('securityEventsChart').getContext('2d');
        if (this.charts.securityEvents) this.charts.securityEvents.destroy();

        const eventLabels = Object.keys(metrics.events_by_type);
        const eventData = Object.values(metrics.events_by_type);

        this.charts.securityEvents = new Chart(eventsCtx, {
            type: 'bar',
            data: {
                labels: eventLabels,
                datasets: [{
                    label: 'Events',
                    data: eventData,
                    backgroundColor: '#3B82F6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        // Risk Distribution Chart
        const riskCtx = document.getElementById('riskDistributionChart').getContext('2d');
        if (this.charts.riskDistribution) this.charts.riskDistribution.destroy();

        this.charts.riskDistribution = new Chart(riskCtx, {
            type: 'doughnut',
            data: {
                labels: ['Low', 'Medium', 'High', 'Critical'],
                datasets: [{
                    data: [
                        metrics.risk_score_distribution.low,
                        metrics.risk_score_distribution.medium,
                        metrics.risk_score_distribution.high,
                        metrics.risk_score_distribution.critical
                    ],
                    backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#DC2626']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    async loadRateLimiting() {
        try {
            const response = await axios.get(`${this.apiBase}/rate-limit/metrics`);
            const metrics = response.data.data;

            document.getElementById('rateLimitRequests').textContent = metrics.total_requests_tracked;
            document.getElementById('rateLimitViolations').textContent = metrics.total_violations;
            document.getElementById('rateLimitBlocked').textContent = metrics.blocked_identifiers;
            
            const successRate = metrics.total_requests_tracked > 0 
                ? Math.round(((metrics.total_requests_tracked - metrics.total_violations) / metrics.total_requests_tracked) * 100)
                : 100;
            document.getElementById('rateLimitSuccessRate').textContent = `${successRate}%`;

            this.updateRateLimitChart(metrics);
        } catch (error) {
            console.error('Error loading rate limiting metrics:', error);
        }
    }

    updateRateLimitChart(metrics) {
        const ctx = document.getElementById('rateLimitChart').getContext('2d');
        if (this.charts.rateLimit) this.charts.rateLimit.destroy();

        // Generate sample performance data over time
        const labels = [];
        const requestData = [];
        const violationData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = dayjs().subtract(i, 'day');
            labels.push(date.format('MMM DD'));
            requestData.push(Math.floor(Math.random() * 1000) + 500);
            violationData.push(Math.floor(Math.random() * 50) + 10);
        }

        this.charts.rateLimit = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Requests',
                    data: requestData,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    yAxisID: 'y'
                }, {
                    label: 'Violations',
                    data: violationData,
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    // Utility methods
    showLoading() {
        document.getElementById('loadingIndicator').classList.remove('hidden');
        document.getElementById('dashboardContent').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loadingIndicator').classList.add('hidden');
        document.getElementById('dashboardContent').classList.remove('hidden');
    }

    updateLastUpdated() {
        document.getElementById('lastUpdated').textContent = dayjs().format('MMM DD, YYYY HH:mm');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toastId = `toast-${Date.now()}`;
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-300 translate-x-full opacity-0`;
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
            <button onclick="document.getElementById('${toastId}').remove()" class="ml-2 hover:opacity-75">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        }, 10);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 5000);
    }

    startAutoRefresh() {
        this.refreshTimer = setInterval(() => {
            this.loadDashboard();
        }, this.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.complianceDashboard = new ComplianceDashboard();
});

// Handle page visibility changes for auto-refresh
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        window.complianceDashboard?.stopAutoRefresh();
    } else {
        window.complianceDashboard?.startAutoRefresh();
    }
});

// Error handling for axios requests
axios.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        if (window.complianceDashboard) {
            window.complianceDashboard.showToast(
                `API Error: ${error.response?.data?.error || error.message}`,
                'error'
            );
        }
        return Promise.reject(error);
    }
);