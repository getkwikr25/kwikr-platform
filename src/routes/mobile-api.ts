/**
 * Mobile & API Routes
 * Comprehensive API layer for API Documentation, Webhooks, SDK Development, and PWA features
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { APIDocumentationService } from '../services/APIDocumentationService';
import { WebhookService } from '../services/WebhookService';
import { SDKDevelopmentService } from '../services/SDKDevelopmentService';
import { PWAService } from '../services/PWAService';

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for API endpoints
app.use('/*', cors());

// Middleware to initialize services
app.use('/*', async (c, next) => {
  const { DB } = c.env;
  
  // Initialize all services and attach to context
  c.set('apiDocService', new APIDocumentationService(DB));
  c.set('webhookService', new WebhookService(DB));
  c.set('sdkService', new SDKDevelopmentService(DB));
  c.set('pwaService', new PWAService(DB));
  
  await next();
});

/**
 * API Documentation Routes
 */

// Get API documentation endpoints
app.get('/documentation/endpoints', async (c) => {
  try {
    const service: APIDocumentationService = c.get('apiDocService');
    const { method, version, tags, deprecated } = c.req.query();
    
    const filters = {
      method: method || undefined,
      version: version || undefined,
      tags: tags ? tags.split(',') : undefined,
      deprecated: deprecated === 'true' ? true : deprecated === 'false' ? false : undefined
    };

    const endpoints = await service.getAPIEndpoints(filters);
    return c.json({ success: true, data: endpoints });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create API documentation endpoint
app.post('/documentation/endpoints', async (c) => {
  try {
    const service: APIDocumentationService = c.get('apiDocService');
    const endpointData = await c.req.json();
    
    const endpoint = await service.createAPIEndpoint(endpointData);
    return c.json({ success: true, data: endpoint });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Update API documentation endpoint
app.put('/documentation/endpoints/:id', async (c) => {
  try {
    const service: APIDocumentationService = c.get('apiDocService');
    const id = parseInt(c.req.param('id'));
    const updates = await c.req.json();
    
    const endpoint = await service.updateAPIEndpoint(id, updates);
    return c.json({ success: true, data: endpoint });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Get single API documentation endpoint
app.get('/documentation/endpoints/:id', async (c) => {
  try {
    const service: APIDocumentationService = c.get('apiDocService');
    const id = parseInt(c.req.param('id'));
    
    const endpoint = await service.getAPIEndpoint(id);
    if (!endpoint) {
      return c.json({ success: false, error: 'API endpoint not found' }, 404);
    }
    
    return c.json({ success: true, data: endpoint });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete API documentation endpoint
app.delete('/documentation/endpoints/:id', async (c) => {
  try {
    const service: APIDocumentationService = c.get('apiDocService');
    const id = parseInt(c.req.param('id'));
    
    const deleted = await service.deleteAPIEndpoint(id);
    if (!deleted) {
      return c.json({ success: false, error: 'API endpoint not found' }, 404);
    }
    
    return c.json({ success: true, message: 'API endpoint deleted successfully' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Generate OpenAPI/Swagger specification
app.get('/documentation/openapi', async (c) => {
  try {
    const service: APIDocumentationService = c.get('apiDocService');
    const version = c.req.query('version') || 'v1';
    
    const openApiSpec = await service.generateOpenAPISpec(version);
    return c.json(openApiSpec);
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Track API documentation usage
app.post('/documentation/track/:id', async (c) => {
  try {
    const service: APIDocumentationService = c.get('apiDocService');
    const documentation_id = parseInt(c.req.param('id'));
    const { developer_id } = await c.req.json();
    
    const userAgent = c.req.header('User-Agent');
    const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For');
    
    await service.trackDocumentationUsage(documentation_id, developer_id, userAgent, ipAddress);
    return c.json({ success: true, message: 'Usage tracked' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Get documentation usage statistics
app.get('/documentation/stats', async (c) => {
  try {
    const service: APIDocumentationService = c.get('apiDocService');
    const documentation_id = c.req.query('documentation_id');
    
    const stats = await service.getDocumentationUsageStats(
      documentation_id ? parseInt(documentation_id) : undefined
    );
    return c.json({ success: true, data: stats });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Developer Portal Management
app.post('/developers', async (c) => {
  try {
    const service: APIDocumentationService = c.get('apiDocService');
    const developerData = await c.req.json();
    
    const developer = await service.createDeveloper(developerData);
    return c.json({ success: true, data: developer });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get('/developers', async (c) => {
  try {
    const service: APIDocumentationService = c.get('apiDocService');
    const developers = await service.getDevelopers();
    return c.json({ success: true, data: developers });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.put('/developers/:id/status', async (c) => {
  try {
    const service: APIDocumentationService = c.get('apiDocService');
    const developer_id = parseInt(c.req.param('id'));
    const { status } = await c.req.json();
    
    const developer = await service.updateDeveloperStatus(developer_id, status);
    return c.json({ success: true, data: developer });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.post('/developers/:id/regenerate-credentials', async (c) => {
  try {
    const service: APIDocumentationService = c.get('apiDocService');
    const developer_id = parseInt(c.req.param('id'));
    
    const credentials = await service.regenerateAPICredentials(developer_id);
    return c.json({ success: true, data: credentials });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.get('/developers/:id/usage', async (c) => {
  try {
    const service: APIDocumentationService = c.get('apiDocService');
    const developer_id = parseInt(c.req.param('id'));
    const days = parseInt(c.req.query('days') || '30');
    
    const usage = await service.getDeveloperAPIUsage(developer_id, days);
    return c.json({ success: true, data: usage });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Webhook Routes
 */

// Create webhook endpoint
app.post('/webhooks', async (c) => {
  try {
    const service: WebhookService = c.get('webhookService');
    const webhookData = await c.req.json();
    
    const webhook = await service.createWebhookEndpoint(webhookData);
    return c.json({ success: true, data: webhook });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Get webhook endpoints
app.get('/webhooks', async (c) => {
  try {
    const service: WebhookService = c.get('webhookService');
    const { developer_id, user_id } = c.req.query();
    
    const webhooks = await service.getWebhookEndpoints(
      developer_id ? parseInt(developer_id) : undefined,
      user_id ? parseInt(user_id) : undefined
    );
    return c.json({ success: true, data: webhooks });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update webhook endpoint
app.put('/webhooks/:id', async (c) => {
  try {
    const service: WebhookService = c.get('webhookService');
    const id = parseInt(c.req.param('id'));
    const updates = await c.req.json();
    
    const webhook = await service.updateWebhookEndpoint(id, updates);
    return c.json({ success: true, data: webhook });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Get single webhook endpoint
app.get('/webhooks/:id', async (c) => {
  try {
    const service: WebhookService = c.get('webhookService');
    const id = parseInt(c.req.param('id'));
    
    const webhook = await service.getWebhookEndpoint(id);
    if (!webhook) {
      return c.json({ success: false, error: 'Webhook endpoint not found' }, 404);
    }
    
    return c.json({ success: true, data: webhook });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete webhook endpoint
app.delete('/webhooks/:id', async (c) => {
  try {
    const service: WebhookService = c.get('webhookService');
    const id = parseInt(c.req.param('id'));
    
    const deleted = await service.deleteWebhookEndpoint(id);
    if (!deleted) {
      return c.json({ success: false, error: 'Webhook endpoint not found' }, 404);
    }
    
    return c.json({ success: true, message: 'Webhook endpoint deleted successfully' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Test webhook endpoint
app.post('/webhooks/:id/test', async (c) => {
  try {
    const service: WebhookService = c.get('webhookService');
    const id = parseInt(c.req.param('id'));
    
    const result = await service.testWebhookEndpoint(id);
    return c.json({ success: true, data: result });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Trigger webhook event
app.post('/webhooks/trigger', async (c) => {
  try {
    const service: WebhookService = c.get('webhookService');
    const { event_type, event_data, user_id, related_entity_type, related_entity_id } = await c.req.json();
    
    const result = await service.triggerWebhookEvent(
      event_type,
      event_data,
      user_id,
      related_entity_type,
      related_entity_id
    );
    return c.json({ success: true, data: result });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Get webhook events
app.get('/webhooks/events', async (c) => {
  try {
    const service: WebhookService = c.get('webhookService');
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');
    
    const events = await service.getWebhookEvents(limit, offset);
    return c.json({ success: true, data: events });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get webhook deliveries
app.get('/webhooks/:id/deliveries', async (c) => {
  try {
    const service: WebhookService = c.get('webhookService');
    const endpoint_id = parseInt(c.req.param('id'));
    const status = c.req.query('status');
    const limit = parseInt(c.req.query('limit') || '100');
    
    const deliveries = await service.getWebhookDeliveries(endpoint_id, status, limit);
    return c.json({ success: true, data: deliveries });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get webhook statistics
app.get('/webhooks/:id/stats', async (c) => {
  try {
    const service: WebhookService = c.get('webhookService');
    const endpoint_id = parseInt(c.req.param('id'));
    const days = parseInt(c.req.query('days') || '30');
    
    const stats = await service.getWebhookStats(endpoint_id, days);
    return c.json({ success: true, data: stats });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get available webhook event types
app.get('/webhooks/event-types', async (c) => {
  try {
    const service: WebhookService = c.get('webhookService');
    const eventTypes = service.getAvailableEventTypes();
    return c.json({ success: true, data: eventTypes });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Retry failed webhook deliveries
app.post('/webhooks/retry-failed', async (c) => {
  try {
    const service: WebhookService = c.get('webhookService');
    const retried = await service.retryFailedDeliveries();
    return c.json({ success: true, data: { retried_count: retried } });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * SDK Development Routes
 */

// Get SDK versions
app.get('/sdks/versions', async (c) => {
  try {
    const service: SDKDevelopmentService = c.get('sdkService');
    const { platform, status } = c.req.query();
    
    const versions = await service.getSDKVersions(platform, status);
    return c.json({ success: true, data: versions });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create SDK version
app.post('/sdks/versions', async (c) => {
  try {
    const service: SDKDevelopmentService = c.get('sdkService');
    const versionData = await c.req.json();
    
    const version = await service.createSDKVersion(versionData);
    return c.json({ success: true, data: version });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Update SDK version
app.put('/sdks/versions/:id', async (c) => {
  try {
    const service: SDKDevelopmentService = c.get('sdkService');
    const id = parseInt(c.req.param('id'));
    const updates = await c.req.json();
    
    const version = await service.updateSDKVersion(id, updates);
    return c.json({ success: true, data: version });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Get latest SDK version for platform
app.get('/sdks/latest/:platform', async (c) => {
  try {
    const service: SDKDevelopmentService = c.get('sdkService');
    const platform = c.req.param('platform');
    
    const version = await service.getLatestSDKVersion(platform);
    if (!version) {
      return c.json({ success: false, error: 'No SDK version found for platform' }, 404);
    }
    
    return c.json({ success: true, data: version });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Track SDK download
app.post('/sdks/download/:id', async (c) => {
  try {
    const service: SDKDevelopmentService = c.get('sdkService');
    const sdk_version_id = parseInt(c.req.param('id'));
    const { developer_id } = await c.req.json();
    
    const userAgent = c.req.header('User-Agent');
    const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For');
    
    const download = await service.trackSDKDownload(sdk_version_id, developer_id, ipAddress, userAgent);
    return c.json({ success: true, data: download });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Get SDK downloads
app.get('/sdks/downloads', async (c) => {
  try {
    const service: SDKDevelopmentService = c.get('sdkService');
    const { sdk_version_id, developer_id, limit } = c.req.query();
    
    const downloads = await service.getSDKDownloads(
      sdk_version_id ? parseInt(sdk_version_id) : undefined,
      developer_id ? parseInt(developer_id) : undefined,
      limit ? parseInt(limit) : 100
    );
    return c.json({ success: true, data: downloads });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Submit SDK feedback
app.post('/sdks/feedback', async (c) => {
  try {
    const service: SDKDevelopmentService = c.get('sdkService');
    const feedbackData = await c.req.json();
    
    const feedback = await service.submitSDKFeedback(feedbackData);
    return c.json({ success: true, data: feedback });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Get SDK feedback
app.get('/sdks/feedback', async (c) => {
  try {
    const service: SDKDevelopmentService = c.get('sdkService');
    const { sdk_version_id, developer_id, limit } = c.req.query();
    
    const feedback = await service.getSDKFeedback(
      sdk_version_id ? parseInt(sdk_version_id) : undefined,
      developer_id ? parseInt(developer_id) : undefined,
      limit ? parseInt(limit) : 100
    );
    return c.json({ success: true, data: feedback });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get SDK statistics
app.get('/sdks/stats', async (c) => {
  try {
    const service: SDKDevelopmentService = c.get('sdkService');
    const platform = c.req.query('platform');
    
    const stats = await service.getSDKStats(platform);
    return c.json({ success: true, data: stats });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Generate SDK code
app.post('/sdks/generate/:platform', async (c) => {
  try {
    const service: SDKDevelopmentService = c.get('sdkService');
    const platform = c.req.param('platform');
    const options = await c.req.json();
    
    const generatedCode = await service.generateSDKCode(platform, options);
    return c.json({ success: true, data: generatedCode });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Get supported platforms
app.get('/sdks/platforms', async (c) => {
  try {
    const service: SDKDevelopmentService = c.get('sdkService');
    const platforms = await service.getSupportedPlatforms();
    return c.json({ success: true, data: platforms });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Deprecate SDK version
app.post('/sdks/versions/:id/deprecate', async (c) => {
  try {
    const service: SDKDevelopmentService = c.get('sdkService');
    const id = parseInt(c.req.param('id'));
    const { reason } = await c.req.json();
    
    const version = await service.deprecateSDKVersion(id, reason);
    return c.json({ success: true, data: version });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

/**
 * PWA Routes
 */

// Track PWA installation
app.post('/pwa/install', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const installationData = await c.req.json();
    
    const installation = await service.trackPWAInstallation(installationData);
    return c.json({ success: true, data: installation });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Update PWA activity
app.post('/pwa/activity', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const { device_id } = await c.req.json();
    
    await service.updatePWAActivity(device_id);
    return c.json({ success: true, message: 'Activity updated' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Track PWA uninstallation
app.post('/pwa/uninstall', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const { device_id } = await c.req.json();
    
    await service.trackPWAUninstallation(device_id);
    return c.json({ success: true, message: 'Uninstallation tracked' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Get PWA installations
app.get('/pwa/installations', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const user_id = c.req.query('user_id');
    
    const installations = await service.getPWAInstallations(
      user_id ? parseInt(user_id) : undefined
    );
    return c.json({ success: true, data: installations });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get PWA installation statistics
app.get('/pwa/stats', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const stats = await service.getPWAInstallationStats();
    return c.json({ success: true, data: stats });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Subscribe to push notifications
app.post('/pwa/push/subscribe', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const subscriptionData = await c.req.json();
    
    const subscription = await service.subscribeToPushNotifications(subscriptionData);
    return c.json({ success: true, data: subscription });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Unsubscribe from push notifications
app.post('/pwa/push/unsubscribe', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const { endpoint } = await c.req.json();
    
    await service.unsubscribeFromPushNotifications(endpoint);
    return c.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Send push notification
app.post('/pwa/push/send', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const notificationData = await c.req.json();
    
    const notification = await service.sendPushNotification(notificationData);
    return c.json({ success: true, data: notification });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Get push notifications
app.get('/pwa/push/notifications', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const user_id = c.req.query('user_id');
    const limit = parseInt(c.req.query('limit') || '50');
    
    const notifications = await service.getPushNotifications(
      user_id ? parseInt(user_id) : undefined,
      limit
    );
    return c.json({ success: true, data: notifications });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Add offline action
app.post('/pwa/offline/actions', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const actionData = await c.req.json();
    
    const action = await service.addOfflineAction(actionData);
    return c.json({ success: true, data: action });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Get pending offline actions
app.get('/pwa/offline/actions/:user_id', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const user_id = parseInt(c.req.param('user_id'));
    
    const actions = await service.getPendingOfflineActions(user_id);
    return c.json({ success: true, data: actions });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Sync offline actions
app.post('/pwa/offline/sync/:user_id', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const user_id = parseInt(c.req.param('user_id'));
    
    const result = await service.syncOfflineActions(user_id);
    return c.json({ success: true, data: result });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Start mobile session
app.post('/pwa/sessions/start', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const sessionData = await c.req.json();
    
    const session = await service.startMobileSession(sessionData);
    return c.json({ success: true, data: session });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Update mobile session
app.post('/pwa/sessions/update/:session_id', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const session_id = c.req.param('session_id');
    const updates = await c.req.json();
    
    await service.updateMobileSession(session_id, updates);
    return c.json({ success: true, message: 'Session updated' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// End mobile session
app.post('/pwa/sessions/end/:session_id', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const session_id = c.req.param('session_id');
    
    await service.endMobileSession(session_id);
    return c.json({ success: true, message: 'Session ended' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// Get mobile session statistics
app.get('/pwa/sessions/stats', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const days = parseInt(c.req.query('days') || '30');
    
    const stats = await service.getMobileSessionStats(days);
    return c.json({ success: true, data: stats });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Generate PWA manifest
app.get('/pwa/manifest.json', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const manifest = service.generatePWAManifest();
    
    c.header('Content-Type', 'application/manifest+json');
    return c.json(manifest);
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get service worker
app.get('/pwa/sw.js', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const serviceWorker = service.generateServiceWorker();
    
    c.header('Content-Type', 'application/javascript');
    c.header('Service-Worker-Allowed', '/');
    return c.text(serviceWorker);
  } catch (error) {
    return c.text('// Service Worker generation failed', 500);
  }
});

// Check PWA compatibility
app.post('/pwa/compatibility', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const userAgent = c.req.header('User-Agent') || '';
    
    const compatibility = await service.checkPWACompatibility(userAgent);
    return c.json({ success: true, data: compatibility });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Generate VAPID keys
app.post('/pwa/vapid-keys', async (c) => {
  try {
    const service: PWAService = c.get('pwaService');
    const keys = await service.generateVAPIDKeys();
    return c.json({ success: true, data: keys });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * Dashboard Overview Routes
 */

// Get overall mobile & API dashboard overview
app.get('/dashboard/overview', async (c) => {
  try {
    const apiDocService: APIDocumentationService = c.get('apiDocService');
    const webhookService: WebhookService = c.get('webhookService');
    const sdkService: SDKDevelopmentService = c.get('sdkService');
    const pwaService: PWAService = c.get('pwaService');

    // Get API Documentation stats
    const apiEndpoints = await apiDocService.getAPIEndpoints();
    const developers = await apiDocService.getDevelopers();
    const docUsageStats = await apiDocService.getDocumentationUsageStats();

    // Get Webhook stats
    const webhooks = await webhookService.getWebhookEndpoints();
    const webhookStats = await webhookService.getWebhookStats();

    // Get SDK stats
    const sdkStats = await sdkService.getSDKStats();
    const platforms = await sdkService.getSupportedPlatforms();

    // Get PWA stats
    const pwaStats = await pwaService.getPWAInstallationStats();
    const sessionStats = await pwaService.getMobileSessionStats();

    const overview = {
      api_documentation: {
        total_endpoints: apiEndpoints.length,
        total_developers: developers.length,
        active_developers: developers.filter(d => d.status === 'active').length,
        total_usage_events: docUsageStats.reduce((sum, stat) => sum + stat.access_count, 0)
      },
      webhooks: {
        total_endpoints: webhooks.length,
        active_endpoints: webhooks.filter(w => w.status === 'active').length,
        total_deliveries: webhookStats.reduce((sum, stat) => sum + stat.total_events, 0),
        avg_success_rate: webhookStats.length > 0 
          ? Math.round(webhookStats.reduce((sum, stat) => sum + stat.success_rate, 0) / webhookStats.length)
          : 0
      },
      sdks: {
        supported_platforms: platforms.length,
        total_downloads: sdkStats.reduce((sum, stat) => sum + stat.total_downloads, 0),
        unique_developers: sdkStats.reduce((sum, stat) => sum + stat.unique_developers, 0),
        avg_rating: sdkStats.length > 0
          ? Math.round(sdkStats.reduce((sum, stat) => sum + stat.avg_rating, 0) / sdkStats.length * 10) / 10
          : 0
      },
      pwa: {
        total_installations: pwaStats.total_installations,
        active_installations: pwaStats.active_installations,
        total_sessions: sessionStats.total_sessions,
        unique_users: sessionStats.unique_users,
        avg_session_duration: Math.round(sessionStats.avg_session_duration / 1000) // Convert to seconds
      }
    };

    return c.json({ success: true, data: overview });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get mobile & API system alerts
app.get('/dashboard/alerts', async (c) => {
  try {
    const webhookService: WebhookService = c.get('webhookService');
    const sdkService: SDKDevelopmentService = c.get('sdkService');
    const pwaService: PWAService = c.get('pwaService');

    // Get failed webhook deliveries
    const failedDeliveries = await webhookService.getWebhookDeliveries(undefined, 'failed', 10);
    
    // Get SDK feedback with low ratings
    const poorFeedback = await sdkService.getSDKFeedback();
    const lowRatedFeedback = poorFeedback.filter(f => f.rating && f.rating <= 2);

    // Get push notification failures
    const failedNotifications = await pwaService.getPushNotifications();
    const failedPushes = failedNotifications.filter(n => n.status === 'failed');

    const alerts = {
      high_priority: [
        ...failedDeliveries.slice(0, 5).map(delivery => ({
          type: 'webhook_failure',
          message: `Webhook delivery failed for endpoint ${delivery.webhook_endpoint_id}`,
          severity: 'high',
          data: delivery
        })),
        ...failedPushes.slice(0, 3).map(notification => ({
          type: 'push_notification_failure',
          message: `Push notification "${notification.title}" failed to deliver`,
          severity: 'high',
          data: notification
        }))
      ],
      medium_priority: [
        ...lowRatedFeedback.slice(0, 3).map(feedback => ({
          type: 'poor_sdk_rating',
          message: `SDK received ${feedback.rating}-star rating with feedback`,
          severity: 'medium',
          data: feedback
        }))
      ],
      low_priority: [],
      total_alerts: failedDeliveries.length + lowRatedFeedback.length + failedPushes.length
    };

    return c.json({ success: true, data: alerts });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;