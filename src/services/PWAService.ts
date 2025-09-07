/**
 * Progressive Web App (PWA) Service
 * Manages PWA installations, push notifications, offline sync, and mobile app sessions
 */

export interface PWAInstallation {
  id?: number;
  user_id?: number;
  device_id: string;
  platform: 'android' | 'ios' | 'desktop' | 'other';
  browser?: string;
  version?: string;
  installed_at?: string;
  last_active_at?: string;
  uninstalled_at?: string;
}

export interface PWAPushSubscription {
  id?: number;
  user_id?: number;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent?: string;
  subscribed_at?: string;
  unsubscribed_at?: string;
}

export interface PWANotification {
  id?: number;
  user_id?: number;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: object;
  action_buttons?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  sent_at?: string;
  delivered_at?: string;
  clicked_at?: string;
  status?: 'pending' | 'sent' | 'delivered' | 'clicked' | 'failed';
}

export interface PWAOfflineSync {
  id?: number;
  user_id: number;
  entity_type: string;
  entity_id: number;
  action: 'create' | 'update' | 'delete';
  data: object;
  synced?: boolean;
  created_at?: string;
  synced_at?: string;
}

export interface MobileAppSession {
  id?: number;
  user_id?: number;
  device_id: string;
  session_id: string;
  platform: string;
  app_version?: string;
  started_at?: string;
  ended_at?: string;
  page_views?: number;
  actions_performed?: number;
}

export interface PWAManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  background_color: string;
  theme_color: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }>;
  categories?: string[];
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  orientation?: 'any' | 'natural' | 'landscape' | 'portrait';
  scope?: string;
}

export class PWAService {
  constructor(private db: D1Database) {}

  /**
   * PWA Installation Management
   */
  async trackPWAInstallation(installation: Omit<PWAInstallation, 'id' | 'installed_at' | 'last_active_at'>): Promise<PWAInstallation> {
    const query = `
      INSERT INTO pwa_installations (
        user_id, device_id, platform, browser, version
      ) VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `;

    const result = await this.db.prepare(query).bind(
      installation.user_id || null,
      installation.device_id,
      installation.platform,
      installation.browser || null,
      installation.version || null
    ).first();

    return result as PWAInstallation;
  }

  async updatePWAActivity(device_id: string): Promise<void> {
    await this.db.prepare(`
      UPDATE pwa_installations 
      SET last_active_at = CURRENT_TIMESTAMP 
      WHERE device_id = ?
    `).bind(device_id).run();
  }

  async trackPWAUninstallation(device_id: string): Promise<void> {
    await this.db.prepare(`
      UPDATE pwa_installations 
      SET uninstalled_at = CURRENT_TIMESTAMP 
      WHERE device_id = ? AND uninstalled_at IS NULL
    `).bind(device_id).run();
  }

  async getPWAInstallations(user_id?: number): Promise<PWAInstallation[]> {
    let query = 'SELECT * FROM pwa_installations WHERE uninstalled_at IS NULL';
    const values = [];

    if (user_id) {
      query += ' AND user_id = ?';
      values.push(user_id);
    }

    query += ' ORDER BY installed_at DESC';

    const result = await this.db.prepare(query).bind(...values).all();
    return result.results as PWAInstallation[];
  }

  async getPWAInstallationStats(): Promise<{
    total_installations: number;
    active_installations: number;
    installations_by_platform: Record<string, number>;
    daily_installs: Array<{ date: string; count: number }>;
  }> {
    // Total installations
    const totalResult = await this.db.prepare(`
      SELECT COUNT(*) as total FROM pwa_installations
    `).first();

    // Active installations (not uninstalled)
    const activeResult = await this.db.prepare(`
      SELECT COUNT(*) as active FROM pwa_installations WHERE uninstalled_at IS NULL
    `).first();

    // Installations by platform
    const platformResult = await this.db.prepare(`
      SELECT platform, COUNT(*) as count 
      FROM pwa_installations 
      WHERE uninstalled_at IS NULL
      GROUP BY platform
    `).all();

    const installations_by_platform = {};
    platformResult.results.forEach((row: any) => {
      installations_by_platform[row.platform] = row.count;
    });

    // Daily installs for last 30 days
    const dailyResult = await this.db.prepare(`
      SELECT 
        DATE(installed_at) as date,
        COUNT(*) as count
      FROM pwa_installations 
      WHERE installed_at >= date('now', '-30 days')
      GROUP BY DATE(installed_at)
      ORDER BY date DESC
    `).all();

    return {
      total_installations: totalResult?.total || 0,
      active_installations: activeResult?.active || 0,
      installations_by_platform,
      daily_installs: dailyResult.results as Array<{ date: string; count: number }>
    };
  }

  /**
   * Push Notification Management
   */
  async subscribeToPushNotifications(subscription: Omit<PWAPushSubscription, 'id' | 'subscribed_at'>): Promise<PWAPushSubscription> {
    const query = `
      INSERT INTO pwa_push_subscriptions (
        user_id, endpoint, p256dh_key, auth_key, user_agent
      ) VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `;

    const result = await this.db.prepare(query).bind(
      subscription.user_id || null,
      subscription.endpoint,
      subscription.p256dh_key,
      subscription.auth_key,
      subscription.user_agent || null
    ).first();

    return result as PWAPushSubscription;
  }

  async unsubscribeFromPushNotifications(endpoint: string): Promise<void> {
    await this.db.prepare(`
      UPDATE pwa_push_subscriptions 
      SET unsubscribed_at = CURRENT_TIMESTAMP 
      WHERE endpoint = ? AND unsubscribed_at IS NULL
    `).bind(endpoint).run();
  }

  async getPushSubscriptions(user_id?: number): Promise<PWAPushSubscription[]> {
    let query = 'SELECT * FROM pwa_push_subscriptions WHERE unsubscribed_at IS NULL';
    const values = [];

    if (user_id) {
      query += ' AND user_id = ?';
      values.push(user_id);
    }

    query += ' ORDER BY subscribed_at DESC';

    const result = await this.db.prepare(query).bind(...values).all();
    return result.results as PWAPushSubscription[];
  }

  async sendPushNotification(notification: Omit<PWANotification, 'id' | 'sent_at' | 'status'>): Promise<PWANotification> {
    const query = `
      INSERT INTO pwa_notifications (
        user_id, title, body, icon, badge, data, action_buttons
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `;

    const result = await this.db.prepare(query).bind(
      notification.user_id || null,
      notification.title,
      notification.body,
      notification.icon || null,
      notification.badge || null,
      JSON.stringify(notification.data || {}),
      JSON.stringify(notification.action_buttons || [])
    ).first();

    const savedNotification = result as any;
    
    // In a real implementation, this would send to push service
    // For now, we'll mark as sent
    await this.updateNotificationStatus(savedNotification.id, 'sent');

    // Get active push subscriptions for the user
    const subscriptions = await this.getPushSubscriptions(notification.user_id);
    
    // Send to each subscription (simulated)
    for (const subscription of subscriptions) {
      await this.deliverPushNotification(savedNotification, subscription);
    }

    return {
      ...savedNotification,
      data: JSON.parse(savedNotification.data || '{}'),
      action_buttons: JSON.parse(savedNotification.action_buttons || '[]')
    };
  }

  private async deliverPushNotification(notification: any, subscription: PWAPushSubscription): Promise<void> {
    // In a real implementation, this would use web-push library
    // to send to the actual push service (FCM, Mozilla, etc.)
    
    const payload = {
      title: notification.title,
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      data: JSON.parse(notification.data || '{}'),
      actions: JSON.parse(notification.action_buttons || '[]')
    };

    try {
      // Simulate push delivery (90% success rate)
      const success = Math.random() > 0.1;
      
      if (success) {
        await this.updateNotificationStatus(notification.id, 'delivered');
      } else {
        await this.updateNotificationStatus(notification.id, 'failed');
      }
    } catch (error) {
      await this.updateNotificationStatus(notification.id, 'failed');
    }
  }

  async updateNotificationStatus(notification_id: number, status: 'sent' | 'delivered' | 'clicked' | 'failed'): Promise<void> {
    const timestamp_field = status === 'delivered' ? 'delivered_at' : 
                           status === 'clicked' ? 'clicked_at' : null;

    let query = `
      UPDATE pwa_notifications 
      SET status = ?
    `;

    const values = [status];

    if (timestamp_field) {
      query += `, ${timestamp_field} = CURRENT_TIMESTAMP`;
    }

    query += ' WHERE id = ?';
    values.push(notification_id);

    await this.db.prepare(query).bind(...values).run();
  }

  async getPushNotifications(user_id?: number, limit: number = 50): Promise<PWANotification[]> {
    let query = 'SELECT * FROM pwa_notifications WHERE 1=1';
    const values = [];

    if (user_id) {
      query += ' AND user_id = ?';
      values.push(user_id);
    }

    query += ' ORDER BY sent_at DESC LIMIT ?';
    values.push(limit);

    const result = await this.db.prepare(query).bind(...values).all();
    
    return result.results.map((notification: any) => ({
      ...notification,
      data: JSON.parse(notification.data || '{}'),
      action_buttons: JSON.parse(notification.action_buttons || '[]')
    }));
  }

  /**
   * Offline Sync Management
   */
  async addOfflineAction(sync: Omit<PWAOfflineSync, 'id' | 'synced' | 'created_at'>): Promise<PWAOfflineSync> {
    const query = `
      INSERT INTO pwa_offline_sync (
        user_id, entity_type, entity_id, action, data
      ) VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `;

    const result = await this.db.prepare(query).bind(
      sync.user_id,
      sync.entity_type,
      sync.entity_id,
      sync.action,
      JSON.stringify(sync.data)
    ).first();

    const offlineSync = result as any;
    offlineSync.data = JSON.parse(offlineSync.data);

    return offlineSync;
  }

  async getPendingOfflineActions(user_id: number): Promise<PWAOfflineSync[]> {
    const query = `
      SELECT * FROM pwa_offline_sync 
      WHERE user_id = ? AND synced = false 
      ORDER BY created_at ASC
    `;

    const result = await this.db.prepare(query).bind(user_id).all();
    
    return result.results.map((sync: any) => ({
      ...sync,
      data: JSON.parse(sync.data)
    }));
  }

  async markOfflineActionSynced(sync_id: number): Promise<void> {
    await this.db.prepare(`
      UPDATE pwa_offline_sync 
      SET synced = true, synced_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(sync_id).run();
  }

  async syncOfflineActions(user_id: number): Promise<{ synced: number; failed: number }> {
    const pendingActions = await this.getPendingOfflineActions(user_id);
    let synced = 0;
    let failed = 0;

    for (const action of pendingActions) {
      try {
        // In a real implementation, this would process the action
        // For now, we'll simulate success/failure
        const success = Math.random() > 0.1; // 90% success rate

        if (success) {
          await this.markOfflineActionSynced(action.id!);
          synced++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    return { synced, failed };
  }

  /**
   * Mobile App Session Tracking
   */
  async startMobileSession(session: Omit<MobileAppSession, 'id' | 'started_at' | 'page_views' | 'actions_performed'>): Promise<MobileAppSession> {
    const query = `
      INSERT INTO mobile_app_sessions (
        user_id, device_id, session_id, platform, app_version
      ) VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `;

    const result = await this.db.prepare(query).bind(
      session.user_id || null,
      session.device_id,
      session.session_id,
      session.platform,
      session.app_version || null
    ).first();

    return result as MobileAppSession;
  }

  async updateMobileSession(session_id: string, updates: {
    page_views?: number;
    actions_performed?: number;
  }): Promise<void> {
    const updateFields = [];
    const values = [];

    if (updates.page_views !== undefined) {
      updateFields.push('page_views = page_views + ?');
      values.push(updates.page_views);
    }

    if (updates.actions_performed !== undefined) {
      updateFields.push('actions_performed = actions_performed + ?');
      values.push(updates.actions_performed);
    }

    if (updateFields.length === 0) return;

    values.push(session_id);

    const query = `
      UPDATE mobile_app_sessions 
      SET ${updateFields.join(', ')}
      WHERE session_id = ? AND ended_at IS NULL
    `;

    await this.db.prepare(query).bind(...values).run();
  }

  async endMobileSession(session_id: string): Promise<void> {
    await this.db.prepare(`
      UPDATE mobile_app_sessions 
      SET ended_at = CURRENT_TIMESTAMP 
      WHERE session_id = ? AND ended_at IS NULL
    `).bind(session_id).run();
  }

  async getMobileSessionStats(days: number = 30): Promise<{
    total_sessions: number;
    unique_users: number;
    avg_session_duration: number;
    sessions_by_platform: Record<string, number>;
    daily_sessions: Array<{ date: string; count: number }>;
  }> {
    const date_from = new Date();
    date_from.setDate(date_from.getDate() - days);

    // Total sessions
    const totalResult = await this.db.prepare(`
      SELECT COUNT(*) as total FROM mobile_app_sessions 
      WHERE started_at >= ?
    `).bind(date_from.toISOString()).first();

    // Unique users
    const usersResult = await this.db.prepare(`
      SELECT COUNT(DISTINCT user_id) as unique_users FROM mobile_app_sessions 
      WHERE started_at >= ? AND user_id IS NOT NULL
    `).bind(date_from.toISOString()).first();

    // Average session duration
    const durationResult = await this.db.prepare(`
      SELECT AVG(
        CASE 
          WHEN ended_at IS NOT NULL THEN 
            (strftime('%s', ended_at) - strftime('%s', started_at)) * 1000
          ELSE NULL
        END
      ) as avg_duration
      FROM mobile_app_sessions 
      WHERE started_at >= ?
    `).bind(date_from.toISOString()).first();

    // Sessions by platform
    const platformResult = await this.db.prepare(`
      SELECT platform, COUNT(*) as count 
      FROM mobile_app_sessions 
      WHERE started_at >= ?
      GROUP BY platform
    `).bind(date_from.toISOString()).all();

    const sessions_by_platform = {};
    platformResult.results.forEach((row: any) => {
      sessions_by_platform[row.platform] = row.count;
    });

    // Daily sessions
    const dailyResult = await this.db.prepare(`
      SELECT 
        DATE(started_at) as date,
        COUNT(*) as count
      FROM mobile_app_sessions 
      WHERE started_at >= ?
      GROUP BY DATE(started_at)
      ORDER BY date DESC
    `).bind(date_from.toISOString()).all();

    return {
      total_sessions: totalResult?.total || 0,
      unique_users: usersResult?.unique_users || 0,
      avg_session_duration: Math.round(durationResult?.avg_duration || 0),
      sessions_by_platform,
      daily_sessions: dailyResult.results as Array<{ date: string; count: number }>
    };
  }

  /**
   * PWA Manifest Generation
   */
  generatePWAManifest(customizations?: Partial<PWAManifest>): PWAManifest {
    const defaultManifest: PWAManifest = {
      name: 'getKwikr',
      short_name: 'Kwikr',
      description: 'Connect with Canadian service providers for all your needs',
      start_url: '/?utm_source=pwa',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#00C881',
      icons: [
        {
          src: '/static/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/static/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/static/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/static/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/static/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/static/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/static/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/static/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable any'
        }
      ],
      categories: ['business', 'lifestyle', 'productivity'],
      lang: 'en',
      dir: 'ltr',
      orientation: 'any',
      scope: '/'
    };

    return { ...defaultManifest, ...customizations };
  }

  /**
   * Service Worker Management
   */
  generateServiceWorker(): string {
    return `
// getKwikr Service Worker
const CACHE_NAME = 'kwikr-directory-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache on install
const CACHE_RESOURCES = [
  '/',
  '/offline.html',
  '/static/styles.css',
  '/static/app.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        return cache.addAll(CACHE_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.open(CACHE_NAME)
            .then(cache => {
              return cache.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Push notification event
self.addEventListener('push', event => {
  console.log('Push message received');

  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = {
        title: 'getKwikr',
        body: event.data.text() || 'You have a new notification'
      };
    }
  }

  const options = {
    body: notificationData.body || 'You have a new notification',
    icon: notificationData.icon || '/static/icons/icon-192x192.png',
    badge: notificationData.badge || '/static/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: notificationData.data || {},
    actions: notificationData.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'getKwikr',
      options
    )
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked');
  
  event.notification.close();

  // Handle action button clicks
  if (event.action) {
    console.log('Action clicked:', event.action);
    // Handle specific actions
    return;
  }

  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clients => {
        // Check if app is already open
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          const url = event.notification.data?.url || '/';
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync event
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'offline-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB or localStorage
    // Send to server
    console.log('Syncing offline data...');
    
    // This would integrate with the PWA service
    const response = await fetch('/api/mobile-api/pwa/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // offline data
      })
    });

    if (response.ok) {
      console.log('Offline data synced successfully');
      // Clear synced data from local storage
    } else {
      throw new Error('Sync failed');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
    throw error; // This will retry the sync
  }
}

// Message event for communication with main thread
self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker script loaded');
    `.trim();
  }

  /**
   * Utility Methods
   */
  async generateVAPIDKeys(): Promise<{ publicKey: string; privateKey: string }> {
    // In a real implementation, this would generate actual VAPID keys
    // For demo purposes, returning mock keys
    return {
      publicKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HI80YmqRcSwRVjLOtdjHHy2Qy9J8k9dBqFc',
      privateKey: 'O2tNW3wlZxMB8uMz8QelrxHdKLj6VluO8SVDhzKlcxM'
    };
  }

  async checkPWACompatibility(userAgent: string): Promise<{
    compatible: boolean;
    features: {
      serviceWorker: boolean;
      pushNotifications: boolean;
      installPrompt: boolean;
      offline: boolean;
    };
    recommendations: string[];
  }> {
    // Simple user agent parsing for PWA compatibility
    const isChrome = /Chrome/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isEdge = /Edge/.test(userAgent);
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);

    const features = {
      serviceWorker: isChrome || isFirefox || isSafari || isEdge,
      pushNotifications: isChrome || isFirefox || isEdge,
      installPrompt: (isChrome || isEdge) && isMobile,
      offline: isChrome || isFirefox || isSafari || isEdge
    };

    const recommendations = [];
    
    if (!features.serviceWorker) {
      recommendations.push('Update your browser to support service workers');
    }
    
    if (!features.pushNotifications) {
      recommendations.push('Use Chrome, Firefox, or Edge for push notifications');
    }
    
    if (!features.installPrompt) {
      recommendations.push('Use Chrome or Edge on mobile for app installation');
    }

    return {
      compatible: Object.values(features).some(f => f),
      features,
      recommendations
    };
  }
}