import { Hono } from 'hono'
import { NotificationService } from '../services/NotificationService'

type Bindings = {
  DB: D1Database
}

const notifications = new Hono<{ Bindings: Bindings }>()

// Initialize service
let notificationService: NotificationService

notifications.use('*', async (c, next) => {
  notificationService = new NotificationService(c.env.DB)
  await next()
})

// ===============================
// In-App Notifications
// ===============================

// Get user's in-app notifications
notifications.get('/in-app/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const unreadOnly = c.req.query('unread_only') === 'true'
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = parseInt(c.req.query('offset') || '0')

    const notifications = await notificationService.getUserInAppNotifications(userId, {
      unreadOnly,
      limit,
      offset
    })

    const unreadCount = await notificationService.getUnreadNotificationCount(userId)

    return c.json({
      notifications,
      unread_count: unreadCount,
      pagination: {
        limit,
        offset,
        has_more: notifications.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching in-app notifications:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Mark notification as read
notifications.put('/in-app/:notificationId/read', async (c) => {
  try {
    const notificationId = parseInt(c.req.param('notificationId'))
    const { user_id } = await c.req.json()

    const success = await notificationService.markInAppNotificationAsRead(notificationId, user_id)
    
    if (success) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Failed to mark notification as read' }, 400)
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Archive notification
notifications.put('/in-app/:notificationId/archive', async (c) => {
  try {
    const notificationId = parseInt(c.req.param('notificationId'))
    const { user_id } = await c.req.json()

    const success = await notificationService.archiveInAppNotification(notificationId, user_id)
    
    if (success) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Failed to archive notification' }, 400)
    }
  } catch (error) {
    console.error('Error archiving notification:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get unread notification count
notifications.get('/in-app/:userId/count', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const count = await notificationService.getUnreadNotificationCount(userId)
    
    return c.json({ unread_count: count })
  } catch (error) {
    console.error('Error fetching notification count:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create test in-app notification
notifications.post('/in-app/:userId/test', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const { title, message, category } = await c.req.json()

    const notificationId = await notificationService.createInAppNotification({
      user_id: userId,
      category: category || 'system',
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      icon_class: 'fas fa-bell',
      is_read: false,
      is_archived: false,
      priority_level: 'normal'
    })

    if (notificationId) {
      return c.json({ success: true, notification_id: notificationId })
    } else {
      return c.json({ error: 'Failed to create notification' }, 400)
    }
  } catch (error) {
    console.error('Error creating test notification:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ===============================
// Push Notifications
// ===============================

// Save push notification subscription
notifications.post('/push/subscribe', async (c) => {
  try {
    const { user_id, endpoint, keys, user_agent, device_type } = await c.req.json()

    const success = await notificationService.savePushSubscription({
      user_id,
      endpoint,
      p256dh_key: keys.p256dh,
      auth_key: keys.auth,
      user_agent,
      device_type,
      is_active: true
    })

    if (success) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Failed to save subscription' }, 400)
    }
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Remove push notification subscription
notifications.delete('/push/unsubscribe', async (c) => {
  try {
    const { endpoint } = await c.req.json()

    const success = await notificationService.removePushSubscription(endpoint)
    
    if (success) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Failed to remove subscription' }, 400)
    }
  } catch (error) {
    console.error('Error removing push subscription:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get user's push subscriptions
notifications.get('/push/:userId/subscriptions', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const subscriptions = await notificationService.getUserPushSubscriptions(userId)
    
    return c.json({ subscriptions })
  } catch (error) {
    console.error('Error fetching push subscriptions:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Send test push notification
notifications.post('/push/:userId/test', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const { title, message } = await c.req.json()

    // This would integrate with actual push service (like FCM, APNS, Web Push API)
    // For now, we'll just queue it
    const success = await notificationService.sendTemplatedNotification(
      userId,
      'new_job_match_push',
      { job_title: title || 'Test Push', location: 'Test Location', budget: '100' }
    )

    return c.json({ success })
  } catch (error) {
    console.error('Error sending test push notification:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ===============================
// User Preferences
// ===============================

// Get user notification preferences
notifications.get('/preferences/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const preferences = await notificationService.getUserPreferences(userId)
    
    return c.json({ preferences })
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update user notification preference
notifications.put('/preferences/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const { preference_type, category, ...updates } = await c.req.json()

    const success = await notificationService.updateUserPreference(userId, preference_type, category, updates)
    
    if (success) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Failed to update preference' }, 400)
    }
  } catch (error) {
    console.error('Error updating user preference:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ===============================
// Notification History
// ===============================

// Get user notification history
notifications.get('/history/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const type = c.req.query('type')
    const category = c.req.query('category')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')

    const history = await notificationService.getUserNotificationHistory(userId, {
      type,
      category,
      limit,
      offset
    })

    return c.json({
      history,
      pagination: {
        limit,
        offset,
        has_more: history.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching notification history:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ===============================
// Templates Management
// ===============================

// Get notification templates
notifications.get('/templates', async (c) => {
  try {
    const type = c.req.query('type')
    const category = c.req.query('category')

    const templates = await notificationService.getTemplates(type, category)
    
    return c.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get specific template
notifications.get('/templates/:templateName', async (c) => {
  try {
    const templateName = c.req.param('templateName')
    const template = await notificationService.getTemplate(templateName)
    
    if (template) {
      return c.json({ template })
    } else {
      return c.json({ error: 'Template not found' }, 404)
    }
  } catch (error) {
    console.error('Error fetching template:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ===============================
// Event Processing
// ===============================

// Trigger notification event (for testing or manual triggers)
notifications.post('/events', async (c) => {
  try {
    const eventData = await c.req.json()
    
    await notificationService.processNotificationEvent(eventData)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Error processing notification event:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Send templated notification
notifications.post('/send', async (c) => {
  try {
    const { user_id, template_name, data } = await c.req.json()

    const success = await notificationService.sendTemplatedNotification(user_id, template_name, data)
    
    return c.json({ success })
  } catch (error) {
    console.error('Error sending templated notification:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ===============================
// Admin Settings
// ===============================

// Get admin notification settings
notifications.get('/admin/settings', async (c) => {
  try {
    // Get all admin settings (in a real app, add authentication check)
    const result = await c.env.DB.prepare(`
      SELECT setting_key, setting_value, setting_type, description, category
      FROM admin_notification_settings
      ORDER BY category, setting_key
    `).all()

    const settings = (result.results || []).reduce((acc: any, setting: any) => {
      const value = setting.setting_type === 'boolean' ? setting.setting_value === 'true' :
                   setting.setting_type === 'number' ? parseFloat(setting.setting_value) :
                   setting.setting_type === 'json' ? JSON.parse(setting.setting_value) :
                   setting.setting_value

      acc[setting.setting_key] = {
        value,
        type: setting.setting_type,
        description: setting.description,
        category: setting.category
      }
      return acc
    }, {})
    
    return c.json({ settings })
  } catch (error) {
    console.error('Error fetching admin settings:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update admin notification setting
notifications.put('/admin/settings/:key', async (c) => {
  try {
    const key = c.req.param('key')
    const { value, type } = await c.req.json()

    const success = await notificationService.setAdminSetting(key, value, type)
    
    if (success) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Failed to update setting' }, 400)
    }
  } catch (error) {
    console.error('Error updating admin setting:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ===============================
// Analytics
// ===============================

// Get notification analytics
notifications.get('/analytics', async (c) => {
  try {
    const startDate = c.req.query('start_date') || new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]
    const endDate = c.req.query('end_date') || new Date().toISOString().split('T')[0]

    const analytics = await notificationService.getNotificationAnalytics(startDate, endDate)
    
    return c.json({ analytics, period: { start_date: startDate, end_date: endDate } })
  } catch (error) {
    console.error('Error fetching notification analytics:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get notification queue status
notifications.get('/queue/status', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT status, COUNT(*) as count 
      FROM notifications_queue 
      GROUP BY status
    `).all()

    const queueStatus = (result.results || []).reduce((acc: any, item: any) => {
      acc[item.status] = item.count
      return acc
    }, {})
    
    return c.json({ queue_status: queueStatus })
  } catch (error) {
    console.error('Error fetching queue status:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ===============================
// Email and SMS Simulation
// ===============================

// Simulate sending email (for testing without actual email service)
notifications.post('/simulate/email', async (c) => {
  try {
    const { user_id, template_name, data } = await c.req.json()

    // Get user email
    const user = await c.env.DB.prepare('SELECT email, first_name, last_name FROM users WHERE id = ?').bind(user_id).first() as any
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Get template
    const template = await notificationService.getTemplate(template_name)
    if (!template || template.template_type !== 'email') {
      return c.json({ error: 'Email template not found' }, 404)
    }

    // Render template
    const renderTemplate = (template: string, data: Record<string, any>) => {
      let rendered = template
      for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        rendered = rendered.replace(regex, String(value || ''))
      }
      return rendered
    }

    const renderedSubject = renderTemplate(template.subject_template || '', data)
    const renderedBody = renderTemplate(template.body_template, data)
    const renderedHtml = template.html_template ? renderTemplate(template.html_template, data) : null

    // Save to history
    await notificationService.saveNotificationHistory({
      user_id,
      notification_type: 'email',
      category: template.category,
      subject: renderedSubject,
      message_body: renderedBody,
      recipient_info: user.email,
      status: 'sent',
      delivery_details: JSON.stringify({ simulated: true })
    })

    return c.json({
      success: true,
      simulated_email: {
        to: user.email,
        subject: renderedSubject,
        body: renderedBody,
        html: renderedHtml,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error simulating email:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Simulate sending SMS (for testing without actual SMS service)
notifications.post('/simulate/sms', async (c) => {
  try {
    const { user_id, template_name, data } = await c.req.json()

    // Get user phone
    const user = await c.env.DB.prepare('SELECT phone, first_name, last_name FROM users WHERE id = ?').bind(user_id).first() as any
    
    if (!user || !user.phone) {
      return c.json({ error: 'User not found or phone number not available' }, 404)
    }

    // Get template
    const template = await notificationService.getTemplate(template_name)
    if (!template || template.template_type !== 'sms') {
      return c.json({ error: 'SMS template not found' }, 404)
    }

    // Render template
    const renderTemplate = (template: string, data: Record<string, any>) => {
      let rendered = template
      for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        rendered = rendered.replace(regex, String(value || ''))
      }
      return rendered
    }

    const renderedBody = renderTemplate(template.body_template, data)

    // Save to history
    await notificationService.saveNotificationHistory({
      user_id,
      notification_type: 'sms',
      category: template.category,
      message_body: renderedBody,
      recipient_info: user.phone,
      status: 'sent',
      delivery_details: JSON.stringify({ simulated: true })
    })

    return c.json({
      success: true,
      simulated_sms: {
        to: user.phone,
        message: renderedBody,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error simulating SMS:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default notifications