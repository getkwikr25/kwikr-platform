import { Logger } from '../utils/logger'

export interface EmailCampaign {
  id: number
  campaign_name: string
  subject: string
  sender_name: string
  sender_email: string
  template_id?: number
  campaign_type: 'newsletter' | 'promotional' | 'transactional' | 'welcome' | 'follow_up'
  target_audience: 'all' | 'subscribers' | 'customers' | 'workers' | 'custom_segment'
  audience_filters?: string // JSON filters for custom segments
  scheduled_date?: string
  sent_date?: string
  campaign_status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  total_recipients: number
  sent_count: number
  delivered_count: number
  opened_count: number
  clicked_count: number
  unsubscribed_count: number
  bounced_count: number
  created_by?: number
}

export interface EmailTemplate {
  id: number
  template_name: string
  template_type: 'welcome' | 'newsletter' | 'promotional' | 'transactional'
  subject_template: string
  html_content: string
  text_content?: string
  variables?: string // JSON array of available variables
  is_active: boolean
  created_by?: number
}

export interface EmailSubscriber {
  id: number
  user_id?: number
  email: string
  first_name?: string
  last_name?: string
  subscription_source: 'website' | 'signup' | 'import' | 'api'
  subscriber_type: 'general' | 'worker' | 'client' | 'partner'
  subscription_status: 'active' | 'unsubscribed' | 'bounced'
  email_preferences?: string // JSON of email type preferences
  subscribed_date: string
  unsubscribed_date?: string
  last_activity_date: string
}

export interface EmailDelivery {
  id: number
  campaign_id: number
  subscriber_id: number
  email_address: string
  delivery_status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed'
  sent_date?: string
  delivered_date?: string
  opened_date?: string
  last_clicked_date?: string
  click_count: number
  unsubscribed_date?: string
  bounce_reason?: string
}

export interface CampaignStats {
  delivery_rate: number
  open_rate: number
  click_rate: number
  unsubscribe_rate: number
  bounce_rate: number
  engagement_score: number
}

export interface AudienceSegment {
  name: string
  filters: any
  estimated_size: number
}

export class EmailMarketingService {
  private db: D1Database
  private logger: Logger

  constructor(db: D1Database) {
    this.db = db
    this.logger = new Logger('EmailMarketingService')
  }

  // ===========================================================================
  // EMAIL TEMPLATE MANAGEMENT
  // ===========================================================================

  async createEmailTemplate(templateData: Omit<EmailTemplate, 'id'>): Promise<{ success: boolean; template?: EmailTemplate; error?: string }> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO email_templates (
          template_name, template_type, subject_template, html_content,
          text_content, variables, is_active, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        templateData.template_name,
        templateData.template_type,
        templateData.subject_template,
        templateData.html_content,
        templateData.text_content,
        templateData.variables,
        templateData.is_active,
        templateData.created_by
      ).run()

      const template = await this.getEmailTemplate(result.meta.last_row_id as number)
      
      this.logger.log('Created email template', { templateId: result.meta.last_row_id })
      return { success: true, template: template! }
    } catch (error) {
      this.logger.error('Error creating email template', error)
      return { success: false, error: 'Failed to create email template' }
    }
  }

  async getEmailTemplate(templateId: number): Promise<EmailTemplate | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM email_templates WHERE id = ?
      `).bind(templateId).first()

      return result as EmailTemplate || null
    } catch (error) {
      this.logger.error('Error getting email template', error)
      return null
    }
  }

  async getEmailTemplates(templateType?: string): Promise<EmailTemplate[]> {
    try {
      let query = 'SELECT * FROM email_templates WHERE is_active = TRUE'
      const binds: any[] = []

      if (templateType) {
        query += ' AND template_type = ?'
        binds.push(templateType)
      }

      query += ' ORDER BY created_at DESC'

      const result = await this.db.prepare(query).bind(...binds).all()
      return result.results as EmailTemplate[]
    } catch (error) {
      this.logger.error('Error getting email templates', error)
      return []
    }
  }

  async updateEmailTemplate(templateId: number, updates: Partial<EmailTemplate>): Promise<{ success: boolean; error?: string }> {
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ')
      const values = Object.values(updates)
      
      await this.db.prepare(`
        UPDATE email_templates 
        SET ${setClause}, updated_at = datetime('now')
        WHERE id = ?
      `).bind(...values, templateId).run()

      this.logger.log('Updated email template', { templateId, updates })
      return { success: true }
    } catch (error) {
      this.logger.error('Error updating email template', error)
      return { success: false, error: 'Failed to update email template' }
    }
  }

  async renderTemplate(templateId: number, variables: Record<string, any>): Promise<{ subject: string; html: string; text?: string } | null> {
    try {
      const template = await this.getEmailTemplate(templateId)
      if (!template) return null

      // Simple variable substitution - in production, use a proper template engine
      let subject = template.subject_template
      let html = template.html_content
      let text = template.text_content

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`
        subject = subject.replace(new RegExp(placeholder, 'g'), String(value))
        html = html.replace(new RegExp(placeholder, 'g'), String(value))
        if (text) {
          text = text.replace(new RegExp(placeholder, 'g'), String(value))
        }
      })

      return { subject, html, text }
    } catch (error) {
      this.logger.error('Error rendering template', error)
      return null
    }
  }

  // ===========================================================================
  // SUBSCRIBER MANAGEMENT
  // ===========================================================================

  async subscribeEmail(subscriberData: Omit<EmailSubscriber, 'id' | 'subscribed_date' | 'last_activity_date'>): Promise<{ success: boolean; subscriber?: EmailSubscriber; error?: string }> {
    try {
      // Check if email already exists
      const existing = await this.db.prepare(`
        SELECT * FROM email_subscribers WHERE email = ?
      `).bind(subscriberData.email).first() as EmailSubscriber

      if (existing) {
        // If previously unsubscribed, resubscribe
        if (existing.subscription_status === 'unsubscribed') {
          await this.db.prepare(`
            UPDATE email_subscribers 
            SET subscription_status = 'active', 
                unsubscribed_date = NULL,
                last_activity_date = datetime('now')
            WHERE id = ?
          `).bind(existing.id).run()

          const updated = await this.getEmailSubscriber(existing.id)
          return { success: true, subscriber: updated! }
        }
        return { success: true, subscriber: existing }
      }

      // Create new subscriber
      const result = await this.db.prepare(`
        INSERT INTO email_subscribers (
          user_id, email, first_name, last_name, subscription_source,
          subscriber_type, subscription_status, email_preferences
        ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
      `).bind(
        subscriberData.user_id,
        subscriberData.email,
        subscriberData.first_name,
        subscriberData.last_name,
        subscriberData.subscription_source,
        subscriberData.subscriber_type,
        subscriberData.email_preferences
      ).run()

      const subscriber = await this.getEmailSubscriber(result.meta.last_row_id as number)
      
      this.logger.log('Created email subscriber', { subscriberId: result.meta.last_row_id, email: subscriberData.email })
      return { success: true, subscriber: subscriber! }
    } catch (error) {
      this.logger.error('Error subscribing email', error)
      return { success: false, error: 'Failed to subscribe email' }
    }
  }

  async unsubscribeEmail(email: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.db.prepare(`
        UPDATE email_subscribers 
        SET subscription_status = 'unsubscribed', 
            unsubscribed_date = datetime('now'),
            last_activity_date = datetime('now')
        WHERE email = ? AND subscription_status = 'active'
      `).bind(email).run()

      if (result.changes === 0) {
        return { success: false, error: 'Email not found or already unsubscribed' }
      }

      this.logger.log('Unsubscribed email', { email, reason })
      return { success: true }
    } catch (error) {
      this.logger.error('Error unsubscribing email', error)
      return { success: false, error: 'Failed to unsubscribe email' }
    }
  }

  async getEmailSubscriber(subscriberId: number): Promise<EmailSubscriber | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM email_subscribers WHERE id = ?
      `).bind(subscriberId).first()

      return result as EmailSubscriber || null
    } catch (error) {
      this.logger.error('Error getting email subscriber', error)
      return null
    }
  }

  async getSubscriberByEmail(email: string): Promise<EmailSubscriber | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM email_subscribers WHERE email = ?
      `).bind(email).first()

      return result as EmailSubscriber || null
    } catch (error) {
      this.logger.error('Error getting subscriber by email', error)
      return null
    }
  }

  async getSubscribers(filters?: {
    status?: string
    type?: string
    source?: string
    limit?: number
    offset?: number
  }): Promise<{ subscribers: EmailSubscriber[]; total: number }> {
    try {
      let whereClause = 'WHERE 1=1'
      const binds: any[] = []

      if (filters?.status) {
        whereClause += ' AND subscription_status = ?'
        binds.push(filters.status)
      }

      if (filters?.type) {
        whereClause += ' AND subscriber_type = ?'
        binds.push(filters.type)
      }

      if (filters?.source) {
        whereClause += ' AND subscription_source = ?'
        binds.push(filters.source)
      }

      // Get total count
      const countResult = await this.db.prepare(`
        SELECT COUNT(*) as total FROM email_subscribers ${whereClause}
      `).bind(...binds).first() as any

      // Get subscribers with pagination
      let query = `SELECT * FROM email_subscribers ${whereClause} ORDER BY subscribed_date DESC`
      
      if (filters?.limit) {
        query += ' LIMIT ?'
        binds.push(filters.limit)
        
        if (filters?.offset) {
          query += ' OFFSET ?'
          binds.push(filters.offset)
        }
      }

      const result = await this.db.prepare(query).bind(...binds).all()

      return {
        subscribers: result.results as EmailSubscriber[],
        total: countResult.total || 0
      }
    } catch (error) {
      this.logger.error('Error getting subscribers', error)
      return { subscribers: [], total: 0 }
    }
  }

  // ===========================================================================
  // CAMPAIGN MANAGEMENT
  // ===========================================================================

  async createEmailCampaign(campaignData: Omit<EmailCampaign, 'id' | 'total_recipients' | 'sent_count' | 'delivered_count' | 'opened_count' | 'clicked_count' | 'unsubscribed_count' | 'bounced_count'>): Promise<{ success: boolean; campaign?: EmailCampaign; error?: string }> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO email_campaigns (
          campaign_name, subject, sender_name, sender_email, template_id,
          campaign_type, target_audience, audience_filters, scheduled_date,
          campaign_status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        campaignData.campaign_name,
        campaignData.subject,
        campaignData.sender_name,
        campaignData.sender_email,
        campaignData.template_id,
        campaignData.campaign_type,
        campaignData.target_audience,
        campaignData.audience_filters,
        campaignData.scheduled_date,
        campaignData.campaign_status,
        campaignData.created_by
      ).run()

      const campaign = await this.getEmailCampaign(result.meta.last_row_id as number)
      
      this.logger.log('Created email campaign', { campaignId: result.meta.last_row_id })
      return { success: true, campaign: campaign! }
    } catch (error) {
      this.logger.error('Error creating email campaign', error)
      return { success: false, error: 'Failed to create email campaign' }
    }
  }

  async getEmailCampaign(campaignId: number): Promise<EmailCampaign | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM email_campaigns WHERE id = ?
      `).bind(campaignId).first()

      return result as EmailCampaign || null
    } catch (error) {
      this.logger.error('Error getting email campaign', error)
      return null
    }
  }

  async getEmailCampaigns(filters?: {
    status?: string
    type?: string
    limit?: number
    offset?: number
  }): Promise<{ campaigns: EmailCampaign[]; total: number }> {
    try {
      let whereClause = 'WHERE 1=1'
      const binds: any[] = []

      if (filters?.status) {
        whereClause += ' AND campaign_status = ?'
        binds.push(filters.status)
      }

      if (filters?.type) {
        whereClause += ' AND campaign_type = ?'
        binds.push(filters.type)
      }

      // Get total count
      const countResult = await this.db.prepare(`
        SELECT COUNT(*) as total FROM email_campaigns ${whereClause}
      `).bind(...binds).first() as any

      // Get campaigns with pagination
      let query = `SELECT * FROM email_campaigns ${whereClause} ORDER BY created_at DESC`
      
      if (filters?.limit) {
        query += ' LIMIT ?'
        binds.push(filters.limit)
        
        if (filters?.offset) {
          query += ' OFFSET ?'
          binds.push(filters.offset)
        }
      }

      const result = await this.db.prepare(query).bind(...binds).all()

      return {
        campaigns: result.results as EmailCampaign[],
        total: countResult.total || 0
      }
    } catch (error) {
      this.logger.error('Error getting email campaigns', error)
      return { campaigns: [], total: 0 }
    }
  }

  async updateEmailCampaign(campaignId: number, updates: Partial<EmailCampaign>): Promise<{ success: boolean; error?: string }> {
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ')
      const values = Object.values(updates)
      
      await this.db.prepare(`
        UPDATE email_campaigns 
        SET ${setClause}, updated_at = datetime('now')
        WHERE id = ?
      `).bind(...values, campaignId).run()

      this.logger.log('Updated email campaign', { campaignId, updates })
      return { success: true }
    } catch (error) {
      this.logger.error('Error updating email campaign', error)
      return { success: false, error: 'Failed to update email campaign' }
    }
  }

  // ===========================================================================
  // AUDIENCE SEGMENTATION
  // ===========================================================================

  async getAudienceSize(targetAudience: string, audienceFilters?: string): Promise<number> {
    try {
      let query = 'SELECT COUNT(*) as count FROM email_subscribers WHERE subscription_status = "active"'
      const binds: any[] = []

      switch (targetAudience) {
        case 'subscribers':
          // Already filtered by subscription_status = 'active'
          break
        case 'customers':
          query += ' AND user_id IN (SELECT DISTINCT client_id FROM bookings WHERE booking_status = "completed")'
          break
        case 'workers':
          query += ' AND subscriber_type = "worker"'
          break
        case 'custom_segment':
          if (audienceFilters) {
            const filters = JSON.parse(audienceFilters)
            // Apply custom filters - simplified implementation
            if (filters.subscriber_type) {
              query += ' AND subscriber_type = ?'
              binds.push(filters.subscriber_type)
            }
            if (filters.subscription_source) {
              query += ' AND subscription_source = ?'
              binds.push(filters.subscription_source)
            }
          }
          break
      }

      const result = await this.db.prepare(query).bind(...binds).first() as any
      return result.count || 0
    } catch (error) {
      this.logger.error('Error getting audience size', error)
      return 0
    }
  }

  async getAudienceRecipients(targetAudience: string, audienceFilters?: string): Promise<EmailSubscriber[]> {
    try {
      let query = 'SELECT * FROM email_subscribers WHERE subscription_status = "active"'
      const binds: any[] = []

      switch (targetAudience) {
        case 'subscribers':
          // Already filtered by subscription_status = 'active'
          break
        case 'customers':
          query += ' AND user_id IN (SELECT DISTINCT client_id FROM bookings WHERE booking_status = "completed")'
          break
        case 'workers':
          query += ' AND subscriber_type = "worker"'
          break
        case 'custom_segment':
          if (audienceFilters) {
            const filters = JSON.parse(audienceFilters)
            if (filters.subscriber_type) {
              query += ' AND subscriber_type = ?'
              binds.push(filters.subscriber_type)
            }
            if (filters.subscription_source) {
              query += ' AND subscription_source = ?'
              binds.push(filters.subscription_source)
            }
          }
          break
      }

      const result = await this.db.prepare(query).bind(...binds).all()
      return result.results as EmailSubscriber[]
    } catch (error) {
      this.logger.error('Error getting audience recipients', error)
      return []
    }
  }

  // ===========================================================================
  // CAMPAIGN SENDING (SIMULATION)
  // ===========================================================================

  async sendEmailCampaign(campaignId: number): Promise<{ success: boolean; sent_count?: number; error?: string }> {
    try {
      const campaign = await this.getEmailCampaign(campaignId)
      if (!campaign) {
        return { success: false, error: 'Campaign not found' }
      }

      if (campaign.campaign_status !== 'draft' && campaign.campaign_status !== 'scheduled') {
        return { success: false, error: 'Campaign cannot be sent in current status' }
      }

      // Get recipients
      const recipients = await this.getAudienceRecipients(campaign.target_audience, campaign.audience_filters)
      
      if (recipients.length === 0) {
        return { success: false, error: 'No recipients found for this campaign' }
      }

      // Update campaign status
      await this.updateEmailCampaign(campaignId, {
        campaign_status: 'sending',
        sent_date: new Date().toISOString(),
        total_recipients: recipients.length
      })

      // Create delivery records (simulation)
      let sentCount = 0
      const batchSize = 100

      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize)
        
        for (const recipient of batch) {
          await this.createDeliveryRecord(campaignId, recipient)
          sentCount++
        }
      }

      // Update campaign with final stats
      await this.updateEmailCampaign(campaignId, {
        campaign_status: 'sent',
        sent_count: sentCount
      })

      this.logger.log('Sent email campaign', { campaignId, sentCount })
      return { success: true, sent_count: sentCount }
    } catch (error) {
      this.logger.error('Error sending email campaign', error)
      return { success: false, error: 'Failed to send email campaign' }
    }
  }

  private async createDeliveryRecord(campaignId: number, recipient: EmailSubscriber): Promise<void> {
    try {
      // Simulate delivery status (in real implementation, integrate with email service)
      const deliveryStatus = Math.random() > 0.05 ? 'delivered' : 'bounced' // 95% delivery rate
      
      await this.db.prepare(`
        INSERT INTO email_deliveries (
          campaign_id, subscriber_id, email_address, delivery_status,
          sent_date, delivered_date
        ) VALUES (?, ?, ?, ?, datetime('now'), ?)
      `).bind(
        campaignId,
        recipient.id,
        recipient.email,
        deliveryStatus,
        deliveryStatus === 'delivered' ? new Date().toISOString() : null
      ).run()
    } catch (error) {
      this.logger.error('Error creating delivery record', error)
    }
  }

  // ===========================================================================
  // ENGAGEMENT TRACKING (SIMULATION)
  // ===========================================================================

  async trackEmailOpen(campaignId: number, subscriberId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.db.prepare(`
        UPDATE email_deliveries 
        SET opened_date = datetime('now')
        WHERE campaign_id = ? AND subscriber_id = ? AND opened_date IS NULL
      `).bind(campaignId, subscriberId).run()

      // Update campaign open count
      await this.db.prepare(`
        UPDATE email_campaigns 
        SET opened_count = (
          SELECT COUNT(*) FROM email_deliveries 
          WHERE campaign_id = ? AND opened_date IS NOT NULL
        )
        WHERE id = ?
      `).bind(campaignId, campaignId).run()

      return { success: true }
    } catch (error) {
      this.logger.error('Error tracking email open', error)
      return { success: false, error: 'Failed to track email open' }
    }
  }

  async trackEmailClick(campaignId: number, subscriberId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.db.prepare(`
        UPDATE email_deliveries 
        SET last_clicked_date = datetime('now'), click_count = click_count + 1
        WHERE campaign_id = ? AND subscriber_id = ?
      `).bind(campaignId, subscriberId).run()

      // Update campaign click count
      await this.db.prepare(`
        UPDATE email_campaigns 
        SET clicked_count = (
          SELECT COUNT(DISTINCT subscriber_id) FROM email_deliveries 
          WHERE campaign_id = ? AND click_count > 0
        )
        WHERE id = ?
      `).bind(campaignId, campaignId).run()

      return { success: true }
    } catch (error) {
      this.logger.error('Error tracking email click', error)
      return { success: false, error: 'Failed to track email click' }
    }
  }

  // ===========================================================================
  // CAMPAIGN ANALYTICS
  // ===========================================================================

  async getCampaignStats(campaignId: number): Promise<CampaignStats> {
    try {
      const campaign = await this.getEmailCampaign(campaignId)
      if (!campaign) {
        return {
          delivery_rate: 0,
          open_rate: 0,
          click_rate: 0,
          unsubscribe_rate: 0,
          bounce_rate: 0,
          engagement_score: 0
        }
      }

      const deliveryRate = campaign.total_recipients > 0 ? (campaign.delivered_count / campaign.total_recipients) * 100 : 0
      const openRate = campaign.delivered_count > 0 ? (campaign.opened_count / campaign.delivered_count) * 100 : 0
      const clickRate = campaign.delivered_count > 0 ? (campaign.clicked_count / campaign.delivered_count) * 100 : 0
      const unsubscribeRate = campaign.delivered_count > 0 ? (campaign.unsubscribed_count / campaign.delivered_count) * 100 : 0
      const bounceRate = campaign.total_recipients > 0 ? (campaign.bounced_count / campaign.total_recipients) * 100 : 0

      // Calculate engagement score (weighted average of open and click rates)
      const engagementScore = (openRate * 0.3) + (clickRate * 0.7)

      return {
        delivery_rate: Math.round(deliveryRate * 100) / 100,
        open_rate: Math.round(openRate * 100) / 100,
        click_rate: Math.round(clickRate * 100) / 100,
        unsubscribe_rate: Math.round(unsubscribeRate * 100) / 100,
        bounce_rate: Math.round(bounceRate * 100) / 100,
        engagement_score: Math.round(engagementScore * 100) / 100
      }
    } catch (error) {
      this.logger.error('Error getting campaign stats', error)
      return {
        delivery_rate: 0,
        open_rate: 0,
        click_rate: 0,
        unsubscribe_rate: 0,
        bounce_rate: 0,
        engagement_score: 0
      }
    }
  }

  async getOverallEmailStats(dateRange?: { start: string; end: string }): Promise<{
    total_campaigns: number
    total_subscribers: number
    active_subscribers: number
    average_open_rate: number
    average_click_rate: number
    total_emails_sent: number
    recent_campaigns: EmailCampaign[]
  }> {
    try {
      let dateCondition = ''
      const binds: any[] = []

      if (dateRange) {
        dateCondition = ' WHERE created_at BETWEEN ? AND ?'
        binds.push(dateRange.start, dateRange.end)
      }

      // Get campaign stats
      const campaignStats = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_campaigns,
          AVG(CASE WHEN delivered_count > 0 THEN (opened_count * 100.0 / delivered_count) ELSE 0 END) as avg_open_rate,
          AVG(CASE WHEN delivered_count > 0 THEN (clicked_count * 100.0 / delivered_count) ELSE 0 END) as avg_click_rate,
          SUM(sent_count) as total_emails_sent
        FROM email_campaigns${dateCondition}
      `).bind(...binds).first() as any

      // Get subscriber stats
      const subscriberStats = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_subscribers,
          SUM(CASE WHEN subscription_status = 'active' THEN 1 ELSE 0 END) as active_subscribers
        FROM email_subscribers
      `).all()

      // Get recent campaigns
      const recentCampaigns = await this.db.prepare(`
        SELECT * FROM email_campaigns 
        ORDER BY created_at DESC 
        LIMIT 5
      `).all()

      return {
        total_campaigns: campaignStats.total_campaigns || 0,
        total_subscribers: (subscriberStats.results[0] as any)?.total_subscribers || 0,
        active_subscribers: (subscriberStats.results[0] as any)?.active_subscribers || 0,
        average_open_rate: Math.round((campaignStats.avg_open_rate || 0) * 100) / 100,
        average_click_rate: Math.round((campaignStats.avg_click_rate || 0) * 100) / 100,
        total_emails_sent: campaignStats.total_emails_sent || 0,
        recent_campaigns: recentCampaigns.results as EmailCampaign[]
      }
    } catch (error) {
      this.logger.error('Error getting overall email stats', error)
      return {
        total_campaigns: 0,
        total_subscribers: 0,
        active_subscribers: 0,
        average_open_rate: 0,
        average_click_rate: 0,
        total_emails_sent: 0,
        recent_campaigns: []
      }
    }
  }
}