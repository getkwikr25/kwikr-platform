// Comprehensive Notification Service
// Handles Email, SMS, Push, and In-App notifications

interface NotificationTemplate {
  id: number
  template_name: string
  template_type: 'email' | 'sms' | 'push' | 'in_app' | 'webhook'
  category: 'job_alert' | 'payment' | 'booking' | 'system' | 'marketing' | 'security'
  subject_template?: string
  body_template: string
  html_template?: string
  variables?: string
  is_active: boolean
  priority_level: 'low' | 'normal' | 'high' | 'urgent'
}

interface NotificationPreference {
  id: number
  user_id: number
  preference_type: 'email' | 'sms' | 'push' | 'in_app'
  category: 'job_alert' | 'payment' | 'booking' | 'system' | 'marketing' | 'security'
  is_enabled: boolean
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'never'
  quiet_hours_start?: string
  quiet_hours_end?: string
  timezone: string
  contact_info?: string
}

interface NotificationQueue {
  id?: number
  user_id: number
  template_id: number
  notification_type: 'email' | 'sms' | 'push' | 'in_app' | 'webhook'
  category: 'job_alert' | 'payment' | 'booking' | 'system' | 'marketing' | 'security'
  priority_level: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'processing' | 'sent' | 'delivered' | 'failed' | 'cancelled'
  recipient_info: string
  subject?: string
  message_body: string
  html_body?: string
  metadata?: string
  scheduled_for?: string
  retry_count: number
  max_retries: number
}

interface InAppNotification {
  id?: number
  user_id: number
  category: 'job_alert' | 'payment' | 'booking' | 'system' | 'marketing' | 'security'
  title: string
  message: string
  action_url?: string
  action_label?: string
  icon_class: string
  is_read: boolean
  is_archived: boolean
  priority_level: 'low' | 'normal' | 'high' | 'urgent'
  expires_at?: string
  metadata?: string
}

interface PushSubscription {
  id?: number
  user_id: number
  endpoint: string
  p256dh_key: string
  auth_key: string
  user_agent?: string
  device_type?: 'desktop' | 'mobile' | 'tablet'
  is_active: boolean
}

interface NotificationEvent {
  event_type: string
  event_data: Record<string, any>
  user_id?: number
  triggered_by_user_id?: number
}

export class NotificationService {
  constructor(private db: D1Database) {}

  // Template Management
  async getTemplates(type?: string, category?: string): Promise<NotificationTemplate[]> {
    let query = 'SELECT * FROM notification_templates WHERE is_active = 1'
    const params: any[] = []

    if (type) {
      query += ' AND template_type = ?'
      params.push(type)
    }

    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }

    query += ' ORDER BY template_name'

    const result = await this.db.prepare(query).bind(...params).all()
    return result.results as NotificationTemplate[]
  }

  async getTemplate(templateName: string): Promise<NotificationTemplate | null> {
    const result = await this.db.prepare(`
      SELECT * FROM notification_templates 
      WHERE template_name = ? AND is_active = 1
    `).bind(templateName).first()

    return result as NotificationTemplate | null
  }

  // User Preferences Management
  async getUserPreferences(userId: number): Promise<NotificationPreference[]> {
    const result = await this.db.prepare(`
      SELECT * FROM notification_preferences 
      WHERE user_id = ? 
      ORDER BY preference_type, category
    `).bind(userId).all()

    return result.results as NotificationPreference[]
  }

  async updateUserPreference(userId: number, preferenceType: string, category: string, data: Partial<NotificationPreference>): Promise<boolean> {
    try {
      const updates = []
      const params: any[] = []

      if (data.is_enabled !== undefined) {
        updates.push('is_enabled = ?')
        params.push(data.is_enabled)
      }

      if (data.frequency) {
        updates.push('frequency = ?')
        params.push(data.frequency)
      }

      if (data.quiet_hours_start) {
        updates.push('quiet_hours_start = ?')
        params.push(data.quiet_hours_start)
      }

      if (data.quiet_hours_end) {
        updates.push('quiet_hours_end = ?')
        params.push(data.quiet_hours_end)
      }

      if (data.contact_info) {
        updates.push('contact_info = ?')
        params.push(data.contact_info)
      }

      params.push(userId, preferenceType, category)

      await this.db.prepare(`
        UPDATE notification_preferences 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND preference_type = ? AND category = ?
      `).bind(...params).run()

      return true
    } catch (error) {
      console.error('Error updating user preference:', error)
      return false
    }
  }

  // Queue Management
  async queueNotification(notification: Omit<NotificationQueue, 'id' | 'retry_count' | 'status'>): Promise<boolean> {
    try {
      await this.db.prepare(`
        INSERT INTO notifications_queue (
          user_id, template_id, notification_type, category, priority_level,
          recipient_info, subject, message_body, html_body, metadata, scheduled_for,
          retry_count, max_retries, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(
        notification.user_id,
        notification.template_id,
        notification.notification_type,
        notification.category,
        notification.priority_level,
        notification.recipient_info,
        notification.subject || null,
        notification.message_body,
        notification.html_body || null,
        notification.metadata || null,
        notification.scheduled_for || null,
        notification.max_retries || 3
      ).run()

      return true
    } catch (error) {
      console.error('Error queueing notification:', error)
      return false
    }
  }

  async getPendingNotifications(limit: number = 100): Promise<NotificationQueue[]> {
    const result = await this.db.prepare(`
      SELECT * FROM notifications_queue 
      WHERE status = 'pending' 
        AND (scheduled_for IS NULL OR scheduled_for <= CURRENT_TIMESTAMP)
      ORDER BY priority_level DESC, created_at ASC
      LIMIT ?
    `).bind(limit).all()

    return result.results as NotificationQueue[]
  }

  async updateNotificationStatus(id: number, status: string, error?: string): Promise<void> {
    let query = 'UPDATE notifications_queue SET status = ?, updated_at = CURRENT_TIMESTAMP'
    const params = [status]

    if (status === 'sent') {
      query += ', sent_at = CURRENT_TIMESTAMP'
    } else if (status === 'delivered') {
      query += ', delivered_at = CURRENT_TIMESTAMP'
    } else if (status === 'failed') {
      query += ', retry_count = retry_count + 1'
      if (error) {
        query += ', last_error = ?'
        params.push(error)
      }
    }

    query += ' WHERE id = ?'
    params.push(id)

    await this.db.prepare(query).bind(...params).run()
  }

  // In-App Notifications
  async createInAppNotification(notification: Omit<InAppNotification, 'id'>): Promise<number | null> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO in_app_notifications (
          user_id, category, title, message, action_url, action_label,
          icon_class, is_read, is_archived, priority_level, expires_at, metadata,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(
        notification.user_id,
        notification.category,
        notification.title,
        notification.message,
        notification.action_url || null,
        notification.action_label || null,
        notification.icon_class,
        notification.is_read,
        notification.is_archived,
        notification.priority_level,
        notification.expires_at || null,
        notification.metadata || null
      ).run()

      return result.meta?.last_row_id as number || null
    } catch (error) {
      console.error('Error creating in-app notification:', error)
      return null
    }
  }

  async getUserInAppNotifications(userId: number, options: {
    unreadOnly?: boolean
    limit?: number
    offset?: number
  } = {}): Promise<InAppNotification[]> {
    let query = `
      SELECT * FROM in_app_notifications 
      WHERE user_id = ? AND is_archived = 0
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    `
    const params = [userId]

    if (options.unreadOnly) {
      query += ' AND is_read = 0'
    }

    query += ' ORDER BY priority_level DESC, created_at DESC'

    if (options.limit) {
      query += ' LIMIT ?'
      params.push(options.limit)
    }

    if (options.offset) {
      query += ' OFFSET ?'
      params.push(options.offset)
    }

    const result = await this.db.prepare(query).bind(...params).all()
    return result.results as InAppNotification[]
  }

  async markInAppNotificationAsRead(id: number, userId: number): Promise<boolean> {
    try {
      await this.db.prepare(`
        UPDATE in_app_notifications 
        SET is_read = 1, read_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `).bind(id, userId).run()

      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  async archiveInAppNotification(id: number, userId: number): Promise<boolean> {
    try {
      await this.db.prepare(`
        UPDATE in_app_notifications 
        SET is_archived = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `).bind(id, userId).run()

      return true
    } catch (error) {
      console.error('Error archiving notification:', error)
      return false
    }
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const result = await this.db.prepare(`
      SELECT COUNT(*) as count FROM in_app_notifications 
      WHERE user_id = ? AND is_read = 0 AND is_archived = 0
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    `).bind(userId).first()

    return (result as any)?.count || 0
  }

  // Push Notification Subscriptions
  async savePushSubscription(subscription: Omit<PushSubscription, 'id'>): Promise<boolean> {
    try {
      await this.db.prepare(`
        INSERT OR REPLACE INTO push_subscriptions (
          user_id, endpoint, p256dh_key, auth_key, user_agent, device_type,
          is_active, last_used_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(
        subscription.user_id,
        subscription.endpoint,
        subscription.p256dh_key,
        subscription.auth_key,
        subscription.user_agent || null,
        subscription.device_type || null,
        subscription.is_active
      ).run()

      return true
    } catch (error) {
      console.error('Error saving push subscription:', error)
      return false
    }
  }

  async getUserPushSubscriptions(userId: number): Promise<PushSubscription[]> {
    const result = await this.db.prepare(`
      SELECT * FROM push_subscriptions 
      WHERE user_id = ? AND is_active = 1
    `).bind(userId).all()

    return result.results as PushSubscription[]
  }

  async removePushSubscription(endpoint: string): Promise<boolean> {
    try {
      await this.db.prepare(`
        UPDATE push_subscriptions 
        SET is_active = 0, updated_at = CURRENT_TIMESTAMP
        WHERE endpoint = ?
      `).bind(endpoint).run()

      return true
    } catch (error) {
      console.error('Error removing push subscription:', error)
      return false
    }
  }

  // Notification History
  async saveNotificationHistory(notification: {
    user_id: number
    notification_type: string
    category: string
    subject?: string
    message_body: string
    recipient_info: string
    status: string
    delivery_details?: string
    cost?: number
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO notification_history (
        user_id, notification_type, category, subject, message_body,
        recipient_info, status, delivery_details, cost, sent_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      notification.user_id,
      notification.notification_type,
      notification.category,
      notification.subject || null,
      notification.message_body,
      notification.recipient_info,
      notification.status,
      notification.delivery_details || null,
      notification.cost || null
    ).run()
  }

  async getUserNotificationHistory(userId: number, options: {
    type?: string
    category?: string
    limit?: number
    offset?: number
  } = {}): Promise<any[]> {
    let query = 'SELECT * FROM notification_history WHERE user_id = ?'
    const params = [userId]

    if (options.type) {
      query += ' AND notification_type = ?'
      params.push(options.type)
    }

    if (options.category) {
      query += ' AND category = ?'
      params.push(options.category)
    }

    query += ' ORDER BY created_at DESC'

    if (options.limit) {
      query += ' LIMIT ?'
      params.push(options.limit)
    }

    if (options.offset) {
      query += ' OFFSET ?'
      params.push(options.offset)
    }

    const result = await this.db.prepare(query).bind(...params).all()
    return result.results || []
  }

  // Event Processing
  async processNotificationEvent(event: NotificationEvent): Promise<void> {
    try {
      // Store the event
      await this.db.prepare(`
        INSERT INTO notification_events (event_type, event_data, user_id, triggered_by_user_id, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        event.event_type,
        JSON.stringify(event.event_data),
        event.user_id || null,
        event.triggered_by_user_id || null
      ).run()

      // Process the event based on type
      await this.handleNotificationEvent(event)
    } catch (error) {
      console.error('Error processing notification event:', error)
    }
  }

  private async handleNotificationEvent(event: NotificationEvent): Promise<void> {
    switch (event.event_type) {
      case 'new_job_posted':
        await this.handleJobAlertEvent(event)
        break
      case 'payment_received':
        await this.handlePaymentEvent(event)
        break
      case 'booking_confirmed':
        await this.handleBookingEvent(event)
        break
      case 'user_welcome':
        await this.handleWelcomeEvent(event)
        break
      default:
        console.log(`Unknown event type: ${event.event_type}`)
    }
  }

  private async handleJobAlertEvent(event: NotificationEvent): Promise<void> {
    // Find workers who match this job and have job alert preferences enabled
    const matchingWorkers = await this.findMatchingWorkers(event.event_data)
    
    for (const worker of matchingWorkers) {
      await this.sendJobMatchNotifications(worker.user_id, event.event_data)
    }
  }

  private async handlePaymentEvent(event: NotificationEvent): Promise<void> {
    if (!event.user_id) return

    const paymentData = event.event_data
    const templates = ['payment_received_email', 'payment_received_sms', 'payment_received_push', 'payment_received_in_app']
    
    for (const templateName of templates) {
      await this.sendTemplatedNotification(event.user_id, templateName, paymentData)
    }
  }

  private async handleBookingEvent(event: NotificationEvent): Promise<void> {
    if (!event.user_id) return

    const bookingData = event.event_data
    const templates = ['booking_confirmed_email', 'booking_confirmed_sms', 'booking_confirmed_push', 'booking_confirmed_in_app']
    
    for (const templateName of templates) {
      await this.sendTemplatedNotification(event.user_id, templateName, bookingData)
    }
  }

  private async handleWelcomeEvent(event: NotificationEvent): Promise<void> {
    if (!event.user_id) return

    const userData = event.event_data
    await this.sendTemplatedNotification(event.user_id, 'welcome_email', userData)
  }

  private async findMatchingWorkers(jobData: any): Promise<any[]> {
    // This is a simplified version - in practice, you'd implement sophisticated matching logic
    const result = await this.db.prepare(`
      SELECT DISTINCT u.id as user_id, u.email, u.phone, u.first_name, u.last_name
      FROM users u
      INNER JOIN worker_services ws ON u.id = ws.user_id
      INNER JOIN notification_preferences np ON u.id = np.user_id
      WHERE u.role = 'worker' 
        AND u.is_active = 1
        AND ws.is_available = 1
        AND np.preference_type IN ('email', 'sms', 'push', 'in_app')
        AND np.category = 'job_alert'
        AND np.is_enabled = 1
      LIMIT 50
    `).all()

    return result.results || []
  }

  private async sendJobMatchNotifications(userId: number, jobData: any): Promise<void> {
    const templates = ['new_job_match_email', 'new_job_match_sms', 'new_job_match_push', 'new_job_match_in_app']
    
    for (const templateName of templates) {
      await this.sendTemplatedNotification(userId, templateName, jobData)
    }
  }

  async sendTemplatedNotification(userId: number, templateName: string, data: Record<string, any>): Promise<boolean> {
    try {
      // Get the template
      const template = await this.getTemplate(templateName)
      if (!template) {
        console.error(`Template not found: ${templateName}`)
        return false
      }

      // Check user preferences
      const preferences = await this.getUserPreferences(userId)
      const relevantPref = preferences.find(p => 
        p.preference_type === template.template_type && 
        p.category === template.category
      )

      if (!relevantPref || !relevantPref.is_enabled) {
        return false // User has disabled this type of notification
      }

      // Get user contact info
      let recipientInfo = relevantPref.contact_info
      if (!recipientInfo && template.template_type !== 'in_app') {
        const user = await this.db.prepare('SELECT email, phone FROM users WHERE id = ?').bind(userId).first()
        recipientInfo = template.template_type === 'email' ? (user as any)?.email : (user as any)?.phone
      }

      // Render the template
      const renderedSubject = this.renderTemplate(template.subject_template || '', data)
      const renderedBody = this.renderTemplate(template.body_template, data)
      const renderedHtml = template.html_template ? this.renderTemplate(template.html_template, data) : null

      if (template.template_type === 'in_app') {
        // Create in-app notification directly
        await this.createInAppNotification({
          user_id: userId,
          category: template.category,
          title: renderedSubject,
          message: renderedBody,
          action_url: data.action_url || data.job_url || null,
          action_label: data.action_label || null,
          icon_class: this.getCategoryIcon(template.category),
          is_read: false,
          is_archived: false,
          priority_level: template.priority_level
        })
        return true
      } else {
        // Queue for external delivery
        return await this.queueNotification({
          user_id: userId,
          template_id: template.id,
          notification_type: template.template_type,
          category: template.category,
          priority_level: template.priority_level,
          recipient_info: recipientInfo || '',
          subject: renderedSubject,
          message_body: renderedBody,
          html_body: renderedHtml,
          max_retries: 3
        })
      }
    } catch (error) {
      console.error('Error sending templated notification:', error)
      return false
    }
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template
    
    // Simple template variable replacement {{variable}}
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      rendered = rendered.replace(regex, String(value || ''))
    }

    return rendered
  }

  private getCategoryIcon(category: string): string {
    const icons = {
      'job_alert': 'fas fa-briefcase',
      'payment': 'fas fa-dollar-sign',
      'booking': 'fas fa-calendar-check',
      'system': 'fas fa-cog',
      'marketing': 'fas fa-bullhorn',
      'security': 'fas fa-shield-alt'
    }
    return icons[category as keyof typeof icons] || 'fas fa-bell'
  }

  // Admin Settings
  async getAdminSetting(key: string): Promise<any> {
    const result = await this.db.prepare(`
      SELECT setting_value, setting_type FROM admin_notification_settings 
      WHERE setting_key = ?
    `).bind(key).first() as any

    if (!result) return null

    // Parse the value based on type
    switch (result.setting_type) {
      case 'boolean':
        return result.setting_value === 'true'
      case 'number':
        return parseFloat(result.setting_value)
      case 'json':
        return JSON.parse(result.setting_value)
      default:
        return result.setting_value
    }
  }

  async setAdminSetting(key: string, value: any, type: string = 'string'): Promise<boolean> {
    try {
      const stringValue = type === 'json' ? JSON.stringify(value) : String(value)
      
      await this.db.prepare(`
        INSERT OR REPLACE INTO admin_notification_settings 
        (setting_key, setting_value, setting_type, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(key, stringValue, type).run()

      return true
    } catch (error) {
      console.error('Error setting admin setting:', error)
      return false
    }
  }

  // Analytics
  async getNotificationAnalytics(startDate: string, endDate: string): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT date, notification_type, category, 
             SUM(total_sent) as total_sent,
             SUM(total_delivered) as total_delivered,
             SUM(total_failed) as total_failed,
             SUM(total_opened) as total_opened,
             SUM(total_clicked) as total_clicked,
             SUM(total_cost) as total_cost
      FROM notification_analytics
      WHERE date BETWEEN ? AND ?
      GROUP BY date, notification_type, category
      ORDER BY date DESC, notification_type, category
    `).bind(startDate, endDate).all()

    return result.results || []
  }
}