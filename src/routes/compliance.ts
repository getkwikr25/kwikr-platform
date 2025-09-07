/**
 * Compliance & Security API Routes
 * Comprehensive API layer for all compliance and security services
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { BackgroundCheckService } from '../services/BackgroundCheckService';
import { InsuranceVerificationService } from '../services/InsuranceVerificationService';
import { LicenseVerificationService } from '../services/LicenseVerificationService';
import { GDPRComplianceService } from '../services/GDPRComplianceService';
import { SecurityAuditingService } from '../services/SecurityAuditingService';
import { RateLimitingService } from '../services/RateLimitingService';

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all compliance routes
app.use('/*', cors());

// Middleware to initialize services
app.use('/*', async (c, next) => {
  const { DB } = c.env;
  
  // Initialize all services and attach to context
  c.set('backgroundCheckService', new BackgroundCheckService(DB));
  c.set('insuranceService', new InsuranceVerificationService(DB));
  c.set('licenseService', new LicenseVerificationService(DB));
  c.set('gdprService', new GDPRComplianceService(DB));
  c.set('securityService', new SecurityAuditingService(DB));
  c.set('rateLimitService', new RateLimitingService(DB));
  
  await next();
});

// Security audit logging middleware for all compliance routes
app.use('/*', async (c, next) => {
  const securityService: SecurityAuditingService = c.get('securityService');
  const start_time = Date.now();
  
  // Log the API call
  const event = {
    event_type: 'api_call' as const,
    severity: 'info' as const,
    endpoint: c.req.path,
    method: c.req.method,
    user_agent: c.req.header('User-Agent'),
    ip_address: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown',
    request_data: c.req.method !== 'GET' ? await c.req.json().catch(() => ({})) : undefined
  };
  
  await next();
  
  // Log completion with response status
  const end_time = Date.now();
  await securityService.logSecurityEvent({
    ...event,
    response_status: c.res.status,
    event_details: {
      response_time: end_time - start_time,
      path: c.req.path,
      query: c.req.url.split('?')[1] || ''
    }
  });
});

/**
 * Background Check Routes
 */

// Get background check providers
app.get('/background-checks/providers', async (c) => {
  try {
    const service: BackgroundCheckService = c.get('backgroundCheckService');
    const providers = await service.getProviders();
    return c.json({ success: true, data: providers });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create background check provider
app.post('/background-checks/providers', async (c) => {
  try {
    const service: BackgroundCheckService = c.get('backgroundCheckService');
    const data = await c.req.json();
    const provider = await service.createProvider(data);
    return c.json({ success: true, data: provider });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Request background checks
app.post('/background-checks/request', async (c) => {
  try {
    const service: BackgroundCheckService = c.get('backgroundCheckService');
    const data = await c.req.json();
    const checks = await service.requestBackgroundCheck(data);
    return c.json({ success: true, data: checks });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get user background checks
app.get('/background-checks/user/:user_id', async (c) => {
  try {
    const service: BackgroundCheckService = c.get('backgroundCheckService');
    const user_id = parseInt(c.req.param('user_id'));
    const checks = await service.getUserBackgroundChecks(user_id);
    return c.json({ success: true, data: checks });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get background check by ID
app.get('/background-checks/:id', async (c) => {
  try {
    const service: BackgroundCheckService = c.get('backgroundCheckService');
    const id = parseInt(c.req.param('id'));
    const check = await service.getBackgroundCheckById(id);
    return c.json({ success: true, data: check });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update background check status
app.put('/background-checks/:id/status', async (c) => {
  try {
    const service: BackgroundCheckService = c.get('backgroundCheckService');
    const id = parseInt(c.req.param('id'));
    const { status, result_data, external_check_id } = await c.req.json();
    const check = await service.updateCheckStatus(id, status, result_data, external_check_id);
    return c.json({ success: true, data: check });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get user compliance status
app.get('/background-checks/compliance/:user_id', async (c) => {
  try {
    const service: BackgroundCheckService = c.get('backgroundCheckService');
    const user_id = parseInt(c.req.param('user_id'));
    const status = await service.getUserComplianceStatus(user_id);
    return c.json({ success: true, data: status });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get background check compliance report
app.get('/background-checks/report', async (c) => {
  try {
    const service: BackgroundCheckService = c.get('backgroundCheckService');
    const start_date = c.req.query('start_date') || '2024-01-01';
    const end_date = c.req.query('end_date') || new Date().toISOString().split('T')[0];
    const report = await service.getComplianceReport(start_date, end_date);
    return c.json({ success: true, data: report });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Insurance Verification Routes
 */

// Get insurance providers
app.get('/insurance/providers', async (c) => {
  try {
    const service: InsuranceVerificationService = c.get('insuranceService');
    const providers = await service.getProviders();
    return c.json({ success: true, data: providers });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create insurance provider
app.post('/insurance/providers', async (c) => {
  try {
    const service: InsuranceVerificationService = c.get('insuranceService');
    const data = await c.req.json();
    const provider = await service.createProvider(data);
    return c.json({ success: true, data: provider });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Add insurance policy
app.post('/insurance/policies', async (c) => {
  try {
    const service: InsuranceVerificationService = c.get('insuranceService');
    const data = await c.req.json();
    const policy = await service.addPolicy(data);
    return c.json({ success: true, data: policy });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get user insurance policies
app.get('/insurance/policies/user/:user_id', async (c) => {
  try {
    const service: InsuranceVerificationService = c.get('insuranceService');
    const user_id = parseInt(c.req.param('user_id'));
    const active_only = c.req.query('active_only') !== 'false';
    const policies = await service.getUserPolicies(user_id, active_only);
    return c.json({ success: true, data: policies });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get insurance policy by ID
app.get('/insurance/policies/:id', async (c) => {
  try {
    const service: InsuranceVerificationService = c.get('insuranceService');
    const id = parseInt(c.req.param('id'));
    const policy = await service.getPolicyById(id);
    return c.json({ success: true, data: policy });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update insurance policy status
app.put('/insurance/policies/:id/status', async (c) => {
  try {
    const service: InsuranceVerificationService = c.get('insuranceService');
    const id = parseInt(c.req.param('id'));
    const { status, verification_status } = await c.req.json();
    const policy = await service.updatePolicyStatus(id, status, verification_status);
    return c.json({ success: true, data: policy });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Verify insurance policy
app.post('/insurance/policies/:id/verify', async (c) => {
  try {
    const service: InsuranceVerificationService = c.get('insuranceService');
    const id = parseInt(c.req.param('id'));
    const result = await service.verifyPolicy(id);
    return c.json({ success: true, data: result });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get expiring insurance policies
app.get('/insurance/expiring', async (c) => {
  try {
    const service: InsuranceVerificationService = c.get('insuranceService');
    const days_ahead = parseInt(c.req.query('days') || '30');
    const policies = await service.getExpiringPolicies(days_ahead);
    return c.json({ success: true, data: policies });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get user insurance compliance status
app.get('/insurance/compliance/:user_id', async (c) => {
  try {
    const service: InsuranceVerificationService = c.get('insuranceService');
    const user_id = parseInt(c.req.param('user_id'));
    const job_type = c.req.query('job_type');
    const status = await service.getUserComplianceStatus(user_id, job_type);
    return c.json({ success: true, data: status });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get insurance report
app.get('/insurance/report', async (c) => {
  try {
    const service: InsuranceVerificationService = c.get('insuranceService');
    const start_date = c.req.query('start_date') || '2024-01-01';
    const end_date = c.req.query('end_date') || new Date().toISOString().split('T')[0];
    const report = await service.getInsuranceReport(start_date, end_date);
    return c.json({ success: true, data: report });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * License Verification Routes
 */

// Get license authorities
app.get('/licenses/authorities', async (c) => {
  try {
    const service: LicenseVerificationService = c.get('licenseService');
    const authorities = await service.getAuthorities();
    return c.json({ success: true, data: authorities });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create license authority
app.post('/licenses/authorities', async (c) => {
  try {
    const service: LicenseVerificationService = c.get('licenseService');
    const data = await c.req.json();
    const authority = await service.createAuthority(data);
    return c.json({ success: true, data: authority });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get authorities by jurisdiction
app.get('/licenses/authorities/jurisdiction/:jurisdiction', async (c) => {
  try {
    const service: LicenseVerificationService = c.get('licenseService');
    const jurisdiction = c.req.param('jurisdiction');
    const authorities = await service.getAuthoritiesByJurisdiction(jurisdiction);
    return c.json({ success: true, data: authorities });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Add professional license
app.post('/licenses', async (c) => {
  try {
    const service: LicenseVerificationService = c.get('licenseService');
    const data = await c.req.json();
    const license = await service.addLicense(data);
    return c.json({ success: true, data: license });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get user licenses
app.get('/licenses/user/:user_id', async (c) => {
  try {
    const service: LicenseVerificationService = c.get('licenseService');
    const user_id = parseInt(c.req.param('user_id'));
    const active_only = c.req.query('active_only') !== 'false';
    const licenses = await service.getUserLicenses(user_id, active_only);
    return c.json({ success: true, data: licenses });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get license by ID
app.get('/licenses/:id', async (c) => {
  try {
    const service: LicenseVerificationService = c.get('licenseService');
    const id = parseInt(c.req.param('id'));
    const license = await service.getLicenseById(id);
    return c.json({ success: true, data: license });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update license status
app.put('/licenses/:id/status', async (c) => {
  try {
    const service: LicenseVerificationService = c.get('licenseService');
    const id = parseInt(c.req.param('id'));
    const { status, verification_status, verification_reference } = await c.req.json();
    const license = await service.updateLicenseStatus(id, status, verification_status, verification_reference);
    return c.json({ success: true, data: license });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Verify license
app.post('/licenses/:id/verify', async (c) => {
  try {
    const service: LicenseVerificationService = c.get('licenseService');
    const id = parseInt(c.req.param('id'));
    const result = await service.verifyLicense(id);
    return c.json({ success: true, data: result });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get expiring licenses
app.get('/licenses/expiring', async (c) => {
  try {
    const service: LicenseVerificationService = c.get('licenseService');
    const days_ahead = parseInt(c.req.query('days') || '30');
    const licenses = await service.getExpiringLicenses(days_ahead);
    return c.json({ success: true, data: licenses });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get user license compliance status
app.get('/licenses/compliance/:user_id', async (c) => {
  try {
    const service: LicenseVerificationService = c.get('licenseService');
    const user_id = parseInt(c.req.param('user_id'));
    const job_type = c.req.query('job_type');
    const jurisdiction = c.req.query('jurisdiction');
    const status = await service.getUserComplianceStatus(user_id, job_type, jurisdiction);
    return c.json({ success: true, data: status });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get license report
app.get('/licenses/report', async (c) => {
  try {
    const service: LicenseVerificationService = c.get('licenseService');
    const start_date = c.req.query('start_date') || '2024-01-01';
    const end_date = c.req.query('end_date') || new Date().toISOString().split('T')[0];
    const report = await service.getLicenseReport(start_date, end_date);
    return c.json({ success: true, data: report });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GDPR Compliance Routes
 */

// Record consent
app.post('/gdpr/consent', async (c) => {
  try {
    const service: GDPRComplianceService = c.get('gdprService');
    const data = await c.req.json();
    const consent = await service.recordConsent(data);
    return c.json({ success: true, data: consent });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Withdraw consent
app.post('/gdpr/consent/withdraw', async (c) => {
  try {
    const service: GDPRComplianceService = c.get('gdprService');
    const { user_id, consent_type, withdrawal_method } = await c.req.json();
    const consent = await service.withdrawConsent(user_id, consent_type, withdrawal_method);
    return c.json({ success: true, data: consent });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get user consents
app.get('/gdpr/consent/user/:user_id', async (c) => {
  try {
    const service: GDPRComplianceService = c.get('gdprService');
    const user_id = parseInt(c.req.param('user_id'));
    const consents = await service.getUserConsents(user_id);
    return c.json({ success: true, data: consents });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get active consents
app.get('/gdpr/consent/active', async (c) => {
  try {
    const service: GDPRComplianceService = c.get('gdprService');
    const user_id = c.req.query('user_id') ? parseInt(c.req.query('user_id')!) : undefined;
    const email = c.req.query('email');
    const consents = await service.getActiveConsents(user_id, email);
    return c.json({ success: true, data: consents });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Submit data subject request
app.post('/gdpr/data-request', async (c) => {
  try {
    const service: GDPRComplianceService = c.get('gdprService');
    const data = await c.req.json();
    const request = await service.submitDataRequest(data);
    return c.json({ success: true, data: request });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get data request by ID
app.get('/gdpr/data-request/:id', async (c) => {
  try {
    const service: GDPRComplianceService = c.get('gdprService');
    const id = parseInt(c.req.param('id'));
    const request = await service.getDataRequestById(id);
    return c.json({ success: true, data: request });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update data request status
app.put('/gdpr/data-request/:id/status', async (c) => {
  try {
    const service: GDPRComplianceService = c.get('gdprService');
    const id = parseInt(c.req.param('id'));
    const { status, processing_notes, response_data } = await c.req.json();
    const request = await service.updateDataRequestStatus(id, status, processing_notes, response_data);
    return c.json({ success: true, data: request });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Process access request
app.post('/gdpr/data-request/:id/process-access', async (c) => {
  try {
    const service: GDPRComplianceService = c.get('gdprService');
    const id = parseInt(c.req.param('id'));
    await service.processAccessRequest(id);
    return c.json({ success: true, message: 'Access request processing initiated' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Process erasure request
app.post('/gdpr/data-request/:id/process-erasure', async (c) => {
  try {
    const service: GDPRComplianceService = c.get('gdprService');
    const id = parseInt(c.req.param('id'));
    await service.processErasureRequest(id);
    return c.json({ success: true, message: 'Erasure request processing initiated' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Report data breach
app.post('/gdpr/breach/report', async (c) => {
  try {
    const service: GDPRComplianceService = c.get('gdprService');
    const data = await c.req.json();
    const breach = await service.reportDataBreach(data);
    return c.json({ success: true, data: breach });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get data breach by ID
app.get('/gdpr/breach/:id', async (c) => {
  try {
    const service: GDPRComplianceService = c.get('gdprService');
    const id = parseInt(c.req.param('id'));
    const breach = await service.getDataBreachById(id);
    return c.json({ success: true, data: breach });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update breach notification status
app.put('/gdpr/breach/:id/notification', async (c) => {
  try {
    const service: GDPRComplianceService = c.get('gdprService');
    const id = parseInt(c.req.param('id'));
    const { authority_notified, users_notified, impact_assessment } = await c.req.json();
    const breach = await service.updateBreachNotificationStatus(id, authority_notified, users_notified, impact_assessment);
    return c.json({ success: true, data: breach });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get GDPR compliance report
app.get('/gdpr/report', async (c) => {
  try {
    const service: GDPRComplianceService = c.get('gdprService');
    const start_date = c.req.query('start_date') || '2024-01-01';
    const end_date = c.req.query('end_date') || new Date().toISOString().split('T')[0];
    const report = await service.getComplianceReport(start_date, end_date);
    return c.json({ success: true, data: report });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Security Auditing Routes
 */

// Log security event
app.post('/security/events', async (c) => {
  try {
    const service: SecurityAuditingService = c.get('securityService');
    const data = await c.req.json();
    const event = await service.logSecurityEvent(data);
    return c.json({ success: true, data: event });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get security events
app.get('/security/events', async (c) => {
  try {
    const service: SecurityAuditingService = c.get('securityService');
    const start_date = c.req.query('start_date') || '2024-01-01';
    const end_date = c.req.query('end_date') || new Date().toISOString().split('T')[0];
    const event_type = c.req.query('event_type');
    const severity = c.req.query('severity');
    const limit = parseInt(c.req.query('limit') || '100');
    
    const events = await service.getSecurityEvents(start_date, end_date, event_type, severity, limit);
    return c.json({ success: true, data: events });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get security event by ID
app.get('/security/events/:id', async (c) => {
  try {
    const service: SecurityAuditingService = c.get('securityService');
    const id = parseInt(c.req.param('id'));
    const event = await service.getSecurityEventById(id);
    return c.json({ success: true, data: event });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get user security events
app.get('/security/events/user/:user_id', async (c) => {
  try {
    const service: SecurityAuditingService = c.get('securityService');
    const user_id = parseInt(c.req.param('user_id'));
    const limit = parseInt(c.req.query('limit') || '50');
    const events = await service.getUserSecurityEvents(user_id, limit);
    return c.json({ success: true, data: events });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Detect threat
app.post('/security/threats', async (c) => {
  try {
    const service: SecurityAuditingService = c.get('securityService');
    const data = await c.req.json();
    const threat = await service.detectThreat(data);
    return c.json({ success: true, data: threat });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get threat detection by ID
app.get('/security/threats/:id', async (c) => {
  try {
    const service: SecurityAuditingService = c.get('securityService');
    const id = parseInt(c.req.param('id'));
    const threat = await service.getThreatDetectionById(id);
    return c.json({ success: true, data: threat });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update threat status
app.put('/security/threats/:id/status', async (c) => {
  try {
    const service: SecurityAuditingService = c.get('securityService');
    const id = parseInt(c.req.param('id'));
    const { status, mitigation } = await c.req.json();
    const threat = await service.updateThreatStatus(id, status, mitigation);
    return c.json({ success: true, data: threat });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Analyze incoming request
app.post('/security/analyze-request', async (c) => {
  try {
    const service: SecurityAuditingService = c.get('securityService');
    const { ip_address, endpoint, method, headers, user_agent, user_id } = await c.req.json();
    const analysis = await service.analyzeIncomingRequest(ip_address, endpoint, method, headers, user_agent, user_id);
    return c.json({ success: true, data: analysis });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get security metrics
app.get('/security/metrics', async (c) => {
  try {
    const service: SecurityAuditingService = c.get('securityService');
    const start_date = c.req.query('start_date') || '2024-01-01';
    const end_date = c.req.query('end_date') || new Date().toISOString().split('T')[0];
    const metrics = await service.getSecurityMetrics(start_date, end_date);
    return c.json({ success: true, data: metrics });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Generate audit report
app.post('/security/reports', async (c) => {
  try {
    const service: SecurityAuditingService = c.get('securityService');
    const { report_type, period_start, period_end, generated_by } = await c.req.json();
    const report = await service.generateAuditReport(report_type, period_start, period_end, generated_by);
    return c.json({ success: true, data: report });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get audit report by ID
app.get('/security/reports/:id', async (c) => {
  try {
    const service: SecurityAuditingService = c.get('securityService');
    const id = parseInt(c.req.param('id'));
    const report = await service.getAuditReportById(id);
    return c.json({ success: true, data: report });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Rate Limiting Routes
 */

// Create rate limit rule
app.post('/rate-limit/rules', async (c) => {
  try {
    const service: RateLimitingService = c.get('rateLimitService');
    const data = await c.req.json();
    const rule = await service.createRule(data);
    return c.json({ success: true, data: rule });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get rate limit rules
app.get('/rate-limit/rules', async (c) => {
  try {
    const service: RateLimitingService = c.get('rateLimitService');
    const active_only = c.req.query('active_only') !== 'false';
    const rules = await service.getRules(active_only);
    return c.json({ success: true, data: rules });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get rate limit rule by ID
app.get('/rate-limit/rules/:id', async (c) => {
  try {
    const service: RateLimitingService = c.get('rateLimitService');
    const id = parseInt(c.req.param('id'));
    const rule = await service.getRuleById(id);
    return c.json({ success: true, data: rule });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update rate limit rule
app.put('/rate-limit/rules/:id', async (c) => {
  try {
    const service: RateLimitingService = c.get('rateLimitService');
    const id = parseInt(c.req.param('id'));
    const updates = await c.req.json();
    const rule = await service.updateRule(id, updates);
    return c.json({ success: true, data: rule });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Check rate limit
app.post('/rate-limit/check', async (c) => {
  try {
    const service: RateLimitingService = c.get('rateLimitService');
    const request = await c.req.json();
    const result = await service.checkRateLimit(request);
    return c.json({ success: true, data: result });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Reset rate limit counters
app.post('/rate-limit/reset', async (c) => {
  try {
    const service: RateLimitingService = c.get('rateLimitService');
    const { identifier, identifier_type } = await c.req.json();
    await service.resetCounters(identifier, identifier_type);
    return c.json({ success: true, message: 'Rate limit counters reset successfully' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Unblock identifier
app.post('/rate-limit/unblock', async (c) => {
  try {
    const service: RateLimitingService = c.get('rateLimitService');
    const { tracking_id } = await c.req.json();
    await service.unblockIdentifier(tracking_id);
    return c.json({ success: true, message: 'Identifier unblocked successfully' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get violation history
app.get('/rate-limit/violations/:identifier', async (c) => {
  try {
    const service: RateLimitingService = c.get('rateLimitService');
    const identifier = c.req.param('identifier');
    const limit = parseInt(c.req.query('limit') || '50');
    const violations = await service.getViolationHistory(identifier, limit);
    return c.json({ success: true, data: violations });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get rate limit metrics
app.get('/rate-limit/metrics', async (c) => {
  try {
    const service: RateLimitingService = c.get('rateLimitService');
    const start_date = c.req.query('start_date') || '2024-01-01';
    const end_date = c.req.query('end_date') || new Date().toISOString().split('T')[0];
    const metrics = await service.getRateLimitMetrics(start_date, end_date);
    return c.json({ success: true, data: metrics });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Unified Compliance Dashboard Routes
 */

// Get comprehensive compliance overview
app.get('/dashboard/overview', async (c) => {
  try {
    const user_id = c.req.query('user_id') ? parseInt(c.req.query('user_id')!) : undefined;
    const start_date = c.req.query('start_date') || '2024-01-01';
    const end_date = c.req.query('end_date') || new Date().toISOString().split('T')[0];

    // Get services
    const backgroundService: BackgroundCheckService = c.get('backgroundCheckService');
    const insuranceService: InsuranceVerificationService = c.get('insuranceService');
    const licenseService: LicenseVerificationService = c.get('licenseService');
    const gdprService: GDPRComplianceService = c.get('gdprService');
    const securityService: SecurityAuditingService = c.get('securityService');
    const rateLimitService: RateLimitingService = c.get('rateLimitService');

    // Gather all compliance data
    const [
      backgroundReport,
      insuranceReport,
      licenseReport,
      gdprReport,
      securityMetrics,
      rateLimitMetrics
    ] = await Promise.all([
      backgroundService.getComplianceReport(start_date, end_date),
      insuranceService.getInsuranceReport(start_date, end_date),
      licenseService.getLicenseReport(start_date, end_date),
      gdprService.getComplianceReport(start_date, end_date),
      securityService.getSecurityMetrics(start_date, end_date),
      rateLimitService.getRateLimitMetrics(start_date, end_date)
    ]);

    // Get user-specific compliance if user_id provided
    let userCompliance = null;
    if (user_id) {
      userCompliance = await Promise.all([
        backgroundService.getUserComplianceStatus(user_id),
        insuranceService.getUserComplianceStatus(user_id),
        licenseService.getUserComplianceStatus(user_id)
      ]);
    }

    const overview = {
      period: { start_date, end_date },
      summary: {
        background_checks: {
          total: backgroundReport.total_checks,
          completed: backgroundReport.completed_checks,
          success_rate: backgroundReport.total_checks > 0 ? 
            (backgroundReport.completed_checks / backgroundReport.total_checks) * 100 : 0
        },
        insurance: {
          total: insuranceReport.total_policies,
          active: insuranceReport.active_policies,
          verified: insuranceReport.verified_policies,
          success_rate: insuranceReport.verification_success_rate
        },
        licenses: {
          total: licenseReport.total_licenses,
          active: licenseReport.active_licenses,
          verified: licenseReport.verified_licenses,
          success_rate: licenseReport.verification_success_rate
        },
        gdpr: {
          compliance_score: gdprReport.compliance_score,
          data_requests: gdprReport.data_requests.total_requests,
          consent_records: gdprReport.consent_records.total_recorded,
          data_breaches: gdprReport.data_breaches.total_breaches
        },
        security: {
          total_events: securityMetrics.total_events,
          threat_detections: securityMetrics.threat_detections,
          critical_events: securityMetrics.events_by_severity.critical,
          risk_level: securityMetrics.risk_score_distribution.critical > 0 ? 'critical' :
                     securityMetrics.risk_score_distribution.high > 0 ? 'high' :
                     securityMetrics.risk_score_distribution.medium > 0 ? 'medium' : 'low'
        },
        rate_limiting: {
          total_requests: rateLimitMetrics.total_requests_tracked,
          violations: rateLimitMetrics.total_violations,
          blocked_identifiers: rateLimitMetrics.blocked_identifiers
        }
      },
      user_compliance: userCompliance ? {
        background_checks: userCompliance[0],
        insurance: userCompliance[1],
        licenses: userCompliance[2]
      } : null,
      reports: {
        background_checks: backgroundReport,
        insurance: insuranceReport,
        licenses: licenseReport,
        gdpr: gdprReport,
        security: securityMetrics,
        rate_limiting: rateLimitMetrics
      }
    };

    return c.json({ success: true, data: overview });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get compliance alerts and notifications
app.get('/dashboard/alerts', async (c) => {
  try {
    const insuranceService: InsuranceVerificationService = c.get('insuranceService');
    const licenseService: LicenseVerificationService = c.get('licenseService');

    // Get expiring items
    const [expiringInsurance, expiringLicenses] = await Promise.all([
      insuranceService.getExpiringPolicies(30),
      licenseService.getExpiringLicenses(30)
    ]);

    const alerts = {
      high_priority: [
        ...expiringInsurance.slice(0, 5).map(policy => ({
          type: 'insurance_expiring',
          message: `Insurance policy ${policy.policy_number} expires on ${policy.expiry_date}`,
          severity: 'high',
          data: policy
        })),
        ...expiringLicenses.slice(0, 5).map(license => ({
          type: 'license_expiring',
          message: `License ${license.license_number} expires on ${license.expiry_date}`,
          severity: 'high',
          data: license
        }))
      ],
      medium_priority: [],
      low_priority: [],
      total_alerts: expiringInsurance.length + expiringLicenses.length
    };

    return c.json({ success: true, data: alerts });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;