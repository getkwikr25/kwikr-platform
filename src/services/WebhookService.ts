/**
 * Webhook Service
 * Manages webhook endpoints, event triggering, and delivery tracking
 */

export interface WebhookEndpoint {
  id?: number;
  url: string;
  secret_key: string;
  events: string[]; // Array of subscribed events
  status?: 'active' | 'inactive' | 'failed';
  retry_count?: number;
  max_retries?: number;
  developer_id?: number;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  last_success_at?: string;
  last_failure_at?: string;
}

export interface WebhookEvent {
  id?: number;
  event_type: string;
  event_data: object;
  triggered_at?: string;
  user_id?: number;
  related_entity_type?: string;
  related_entity_id?: number;
}

export interface WebhookDelivery {
  id?: number;
  webhook_endpoint_id: number;
  webhook_event_id: number;
  status?: 'pending' | 'delivered' | 'failed' | 'cancelled';
  http_status_code?: number;
  response_body?: string;
  response_headers?: object;
  attempt_count?: number;
  next_retry_at?: string;
  delivered_at?: string;
  created_at?: string;
}

export interface WebhookStats {
  endpoint_id: number;
  total_events: number;
  successful_deliveries: number;
  failed_deliveries: number;
  success_rate: number;
  avg_response_time: number;
  last_delivery: string;
}

export class WebhookService {
  constructor(private db: D1Database) {}

  /**
   * Webhook Endpoint Management
   */
  async createWebhookEndpoint(endpoint: Omit<WebhookEndpoint, 'id' | 'created_at' | 'updated_at'>): Promise<WebhookEndpoint> {
    const secret_key = endpoint.secret_key || this.generateSecretKey();
    
    const query = `
      INSERT INTO webhook_endpoints (
        url, secret_key, events, status, retry_count, max_retries,
        developer_id, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `;

    const result = await this.db.prepare(query).bind(
      endpoint.url,
      secret_key,
      JSON.stringify(endpoint.events),
      endpoint.status || 'active',
      endpoint.retry_count || 0,
      endpoint.max_retries || 3,
      endpoint.developer_id || null,
      endpoint.user_id || null
    ).first();

    const webhookEndpoint = result as any;
    if (webhookEndpoint) {
      webhookEndpoint.events = JSON.parse(webhookEndpoint.events);
    }

    return webhookEndpoint;
  }

  async updateWebhookEndpoint(id: number, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    const updateFields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        if (key === 'events') {
          updateFields.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          updateFields.push(`${key} = ?`);
          values.push(value);
        }
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE webhook_endpoints 
      SET ${updateFields.join(', ')}
      WHERE id = ?
      RETURNING *
    `;

    const result = await this.db.prepare(query).bind(...values).first();
    if (!result) {
      throw new Error('Webhook endpoint not found');
    }

    const webhookEndpoint = result as any;
    webhookEndpoint.events = JSON.parse(webhookEndpoint.events);

    return webhookEndpoint;
  }

  async getWebhookEndpoints(developer_id?: number, user_id?: number): Promise<WebhookEndpoint[]> {
    let query = 'SELECT * FROM webhook_endpoints WHERE 1=1';
    const values = [];

    if (developer_id) {
      query += ' AND developer_id = ?';
      values.push(developer_id);
    }

    if (user_id) {
      query += ' AND user_id = ?';
      values.push(user_id);
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.db.prepare(query).bind(...values).all();
    
    return result.results.map((endpoint: any) => ({
      ...endpoint,
      events: JSON.parse(endpoint.events)
    }));
  }

  async getWebhookEndpoint(id: number): Promise<WebhookEndpoint | null> {
    const result = await this.db.prepare('SELECT * FROM webhook_endpoints WHERE id = ?').bind(id).first();
    
    if (!result) return null;

    const webhookEndpoint = result as any;
    webhookEndpoint.events = JSON.parse(webhookEndpoint.events);

    return webhookEndpoint;
  }

  async deleteWebhookEndpoint(id: number): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM webhook_endpoints WHERE id = ?').bind(id).run();
    return result.changes > 0;
  }

  async updateWebhookStatus(id: number, status: 'active' | 'inactive' | 'failed'): Promise<void> {
    const timestamp_field = status === 'failed' ? 'last_failure_at' : 
                           status === 'active' ? 'last_success_at' : null;

    let query = `
      UPDATE webhook_endpoints 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
    `;

    const values = [status];

    if (timestamp_field) {
      query += `, ${timestamp_field} = CURRENT_TIMESTAMP`;
    }

    query += ' WHERE id = ?';
    values.push(id);

    await this.db.prepare(query).bind(...values).run();
  }

  /**
   * Event Management
   */
  async createWebhookEvent(event: Omit<WebhookEvent, 'id' | 'triggered_at'>): Promise<WebhookEvent> {
    const query = `
      INSERT INTO webhook_events (
        event_type, event_data, user_id, related_entity_type, related_entity_id
      ) VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `;

    const result = await this.db.prepare(query).bind(
      event.event_type,
      JSON.stringify(event.event_data),
      event.user_id || null,
      event.related_entity_type || null,
      event.related_entity_id || null
    ).first();

    const webhookEvent = result as any;
    if (webhookEvent) {
      webhookEvent.event_data = JSON.parse(webhookEvent.event_data);
    }

    return webhookEvent;
  }

  async getWebhookEvents(limit: number = 100, offset: number = 0): Promise<WebhookEvent[]> {
    const query = `
      SELECT * FROM webhook_events 
      ORDER BY triggered_at DESC 
      LIMIT ? OFFSET ?
    `;

    const result = await this.db.prepare(query).bind(limit, offset).all();
    
    return result.results.map((event: any) => ({
      ...event,
      event_data: JSON.parse(event.event_data)
    }));
  }

  /**
   * Event Triggering and Delivery
   */
  async triggerWebhookEvent(
    event_type: string,
    event_data: object,
    user_id?: number,
    related_entity_type?: string,
    related_entity_id?: number
  ): Promise<{ event_id: number; deliveries_created: number }> {
    // Create the event
    const event = await this.createWebhookEvent({
      event_type,
      event_data,
      user_id,
      related_entity_type,
      related_entity_id
    });

    // Find all webhook endpoints subscribed to this event type
    const endpoints = await this.getSubscribedEndpoints(event_type, user_id);

    let deliveries_created = 0;

    // Create delivery records for each subscribed endpoint
    for (const endpoint of endpoints) {
      await this.createWebhookDelivery(endpoint.id!, event.id!);
      deliveries_created++;
    }

    // Process deliveries asynchronously (in a real implementation, this would be queued)
    // For now, we'll just mark them as pending
    this.processWebhookDeliveries(event.id!);

    return {
      event_id: event.id!,
      deliveries_created
    };
  }

  private async getSubscribedEndpoints(event_type: string, user_id?: number): Promise<WebhookEndpoint[]> {
    let query = `
      SELECT * FROM webhook_endpoints 
      WHERE status = 'active' 
      AND (events LIKE ? OR events LIKE ? OR events LIKE ?)
    `;
    const values = [`%"${event_type}"%`, `%"*"%`, `%"all"%`];

    if (user_id) {
      query += ' AND (user_id = ? OR user_id IS NULL)';
      values.push(user_id);
    }

    const result = await this.db.prepare(query).bind(...values).all();
    
    return result.results
      .map((endpoint: any) => ({
        ...endpoint,
        events: JSON.parse(endpoint.events)
      }))
      .filter((endpoint: WebhookEndpoint) => 
        endpoint.events.includes(event_type) || 
        endpoint.events.includes('*') || 
        endpoint.events.includes('all')
      );
  }

  private async createWebhookDelivery(endpoint_id: number, event_id: number): Promise<WebhookDelivery> {
    const query = `
      INSERT INTO webhook_deliveries (
        webhook_endpoint_id, webhook_event_id, status, attempt_count
      ) VALUES (?, ?, 'pending', 0)
      RETURNING *
    `;

    const result = await this.db.prepare(query).bind(endpoint_id, event_id).first();
    return result as WebhookDelivery;
  }

  private async processWebhookDeliveries(event_id: number): Promise<void> {
    // Get pending deliveries for this event
    const pendingDeliveries = await this.db.prepare(`
      SELECT wd.*, we.event_type, we.event_data, wep.url, wep.secret_key, wep.max_retries
      FROM webhook_deliveries wd
      JOIN webhook_events we ON wd.webhook_event_id = we.id
      JOIN webhook_endpoints wep ON wd.webhook_endpoint_id = wep.id
      WHERE we.id = ? AND wd.status = 'pending'
    `).bind(event_id).all();

    // Process each delivery (in a real implementation, this would be done in background workers)
    for (const delivery of pendingDeliveries.results) {
      await this.deliverWebhook(delivery as any);
    }
  }

  async deliverWebhook(delivery: any): Promise<boolean> {
    try {
      const payload = {
        id: delivery.webhook_event_id,
        event_type: delivery.event_type,
        data: JSON.parse(delivery.event_data),
        timestamp: new Date().toISOString()
      };

      const signature = this.generateWebhookSignature(JSON.stringify(payload), delivery.secret_key);

      // In a real implementation, this would make an HTTP request
      // For now, we'll simulate success/failure
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        await this.updateDeliveryStatus(delivery.id, 'delivered', 200, { success: true }, {});
        await this.updateWebhookStatus(delivery.webhook_endpoint_id, 'active');
        return true;
      } else {
        const attempt_count = delivery.attempt_count + 1;
        
        if (attempt_count >= delivery.max_retries) {
          await this.updateDeliveryStatus(delivery.id, 'failed', 500, { error: 'Max retries exceeded' }, {});
          await this.updateWebhookStatus(delivery.webhook_endpoint_id, 'failed');
        } else {
          // Schedule retry
          const next_retry = new Date();
          next_retry.setMinutes(next_retry.getMinutes() + Math.pow(2, attempt_count) * 5); // Exponential backoff

          await this.db.prepare(`
            UPDATE webhook_deliveries 
            SET attempt_count = ?, next_retry_at = ?
            WHERE id = ?
          `).bind(attempt_count, next_retry.toISOString(), delivery.id).run();
        }
        return false;
      }
    } catch (error) {
      await this.updateDeliveryStatus(delivery.id, 'failed', 0, { error: error.message }, {});
      return false;
    }
  }

  private async updateDeliveryStatus(
    delivery_id: number,
    status: 'delivered' | 'failed',
    http_status_code: number,
    response_body: object,
    response_headers: object
  ): Promise<void> {
    const query = `
      UPDATE webhook_deliveries 
      SET status = ?, http_status_code = ?, response_body = ?, response_headers = ?, 
          delivered_at = CURRENT_TIMESTAMP, attempt_count = attempt_count + 1
      WHERE id = ?
    `;

    await this.db.prepare(query).bind(
      status,
      http_status_code,
      JSON.stringify(response_body),
      JSON.stringify(response_headers),
      delivery_id
    ).run();
  }

  /**
   * Delivery Management and Retry Logic
   */
  async retryFailedDeliveries(): Promise<number> {
    const failedDeliveries = await this.db.prepare(`
      SELECT wd.*, we.event_type, we.event_data, wep.url, wep.secret_key, wep.max_retries
      FROM webhook_deliveries wd
      JOIN webhook_events we ON wd.webhook_event_id = we.id
      JOIN webhook_endpoints wep ON wd.webhook_endpoint_id = wep.id
      WHERE wd.status = 'pending' 
      AND wd.next_retry_at IS NOT NULL 
      AND wd.next_retry_at <= CURRENT_TIMESTAMP
      AND wd.attempt_count < wep.max_retries
    `).all();

    let retried = 0;

    for (const delivery of failedDeliveries.results) {
      const success = await this.deliverWebhook(delivery);
      if (success) retried++;
    }

    return retried;
  }

  async getWebhookDeliveries(endpoint_id?: number, status?: string, limit: number = 100): Promise<WebhookDelivery[]> {
    let query = 'SELECT * FROM webhook_deliveries WHERE 1=1';
    const values = [];

    if (endpoint_id) {
      query += ' AND webhook_endpoint_id = ?';
      values.push(endpoint_id);
    }

    if (status) {
      query += ' AND status = ?';
      values.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    values.push(limit);

    const result = await this.db.prepare(query).bind(...values).all();
    
    return result.results.map((delivery: any) => ({
      ...delivery,
      response_body: delivery.response_body ? JSON.parse(delivery.response_body) : null,
      response_headers: delivery.response_headers ? JSON.parse(delivery.response_headers) : null
    }));
  }

  /**
   * Analytics and Statistics
   */
  async getWebhookStats(endpoint_id?: number, days: number = 30): Promise<WebhookStats[]> {
    const date_from = new Date();
    date_from.setDate(date_from.getDate() - days);

    let query = `
      SELECT 
        wd.webhook_endpoint_id as endpoint_id,
        COUNT(*) as total_events,
        COUNT(CASE WHEN wd.status = 'delivered' THEN 1 END) as successful_deliveries,
        COUNT(CASE WHEN wd.status = 'failed' THEN 1 END) as failed_deliveries,
        CAST(COUNT(CASE WHEN wd.status = 'delivered' THEN 1 END) * 100.0 / COUNT(*) AS INTEGER) as success_rate,
        0 as avg_response_time, -- Would calculate from response times in real implementation
        MAX(wd.delivered_at) as last_delivery
      FROM webhook_deliveries wd
      WHERE wd.created_at >= ?
    `;

    const values = [date_from.toISOString()];

    if (endpoint_id) {
      query += ' AND wd.webhook_endpoint_id = ?';
      values.push(endpoint_id);
    }

    query += ' GROUP BY wd.webhook_endpoint_id ORDER BY total_events DESC';

    const result = await this.db.prepare(query).bind(...values).all();
    return result.results as WebhookStats[];
  }

  /**
   * Event Type Management
   */
  getAvailableEventTypes(): string[] {
    return [
      // User events
      'user.created',
      'user.updated',
      'user.deleted',
      'user.login',
      'user.logout',
      
      // Job events
      'job.created',
      'job.updated',
      'job.completed',
      'job.cancelled',
      'job.bid_received',
      
      // Payment events
      'payment.created',
      'payment.completed',
      'payment.failed',
      'payment.refunded',
      
      // Booking events
      'booking.created',
      'booking.confirmed',
      'booking.cancelled',
      'booking.rescheduled',
      
      // Review events
      'review.created',
      'review.updated',
      'review.deleted',
      
      // System events
      'system.maintenance_start',
      'system.maintenance_end',
      'system.error'
    ];
  }

  /**
   * Webhook Testing
   */
  async testWebhookEndpoint(endpoint_id: number): Promise<{ success: boolean; response?: any; error?: string }> {
    const endpoint = await this.getWebhookEndpoint(endpoint_id);
    if (!endpoint) {
      return { success: false, error: 'Webhook endpoint not found' };
    }

    // Create a test event
    const testEvent = await this.createWebhookEvent({
      event_type: 'webhook.test',
      event_data: {
        message: 'This is a test webhook delivery',
        timestamp: new Date().toISOString()
      }
    });

    // Create and deliver test webhook
    const delivery = await this.createWebhookDelivery(endpoint.id!, testEvent.id!);
    const success = await this.deliverWebhook({
      ...delivery,
      event_type: testEvent.event_type,
      event_data: JSON.stringify(testEvent.event_data),
      url: endpoint.url,
      secret_key: endpoint.secret_key,
      max_retries: 1
    });

    return { success };
  }

  /**
   * Helper Methods
   */
  private generateSecretKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'whsec_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateWebhookSignature(payload: string, secret: string): string {
    // In a real implementation, this would use HMAC-SHA256
    // For this demo, we'll use a simple hash
    let hash = 0;
    const str = payload + secret;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `sha256=${Math.abs(hash).toString(16)}`;
  }

  /**
   * Webhook Verification
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateWebhookSignature(payload, secret);
    return signature === expectedSignature;
  }
}