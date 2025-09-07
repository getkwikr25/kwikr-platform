/**
 * Analytics Service - Core analytics data collection and processing
 * 
 * This service handles:
 * - Event tracking and collection
 * - User analytics and engagement metrics
 * - Session management and user behavior analysis
 * - Registration funnel tracking
 * - Real-time analytics aggregation
 */

import { Logger } from '../utils/logger'

export interface AnalyticsEvent {
  eventId?: string
  userId?: number
  sessionId?: string
  eventType: string // 'page_view', 'click', 'registration', 'job_post', 'job_apply', etc.
  eventCategory: string // 'user', 'job', 'payment', 'system', 'engagement'
  eventAction: string
  eventLabel?: string
  eventValue?: number
  pageUrl?: string
  referrerUrl?: string
  userAgent?: string
  ipAddress?: string
  deviceType?: string
  browserName?: string
  osName?: string
  country?: string
  city?: string
  properties?: Record<string, any>
}

export interface UserEngagementMetrics {
  userId: number
  metricDate: string
  pageViews: number
  sessionDuration: number
  sessionsCount: number
  clicksCount: number
  jobsViewed: number
  jobsApplied: number
  messagesSent: number
  profileUpdates: number
  loginCount: number
  lastActivityTime?: string
  engagementScore: number
}

export interface RegistrationFunnelStep {
  sessionId: string
  funnelStep: string // 'landing', 'signup_start', 'email_entered', 'completed', 'verified'
  userId?: number
  referrerSource?: string
  landingPage?: string
  deviceType?: string
  conversionTime?: number
  droppedOut?: boolean
}

export interface UserLifecycleStage {
  userId: number
  stage: string // 'new', 'active', 'engaged', 'power_user', 'at_risk', 'churned'
  previousStage?: string
  stageDuration?: number
  stageMetadata?: Record<string, any>
}

export interface AnalyticsQuery {
  startDate?: string
  endDate?: string
  userId?: number
  eventType?: string
  eventCategory?: string
  groupBy?: string[]
  metrics?: string[]
  filters?: Record<string, any>
  limit?: number
  offset?: number
}

export class AnalyticsService {
  private db: D1Database
  private logger: Logger

  constructor(database: D1Database) {
    this.db = database
    this.logger = new Logger('AnalyticsService')
  }

  /**
   * Track a new analytics event
   */
  async trackEvent(event: AnalyticsEvent): Promise<{ success: boolean; eventId: string }> {
    try {
      const eventId = event.eventId || this.generateEventId()
      
      // Insert main event
      await this.db.prepare(`
        INSERT INTO analytics_events (
          event_id, user_id, session_id, event_type, event_category, event_action,
          event_label, event_value, page_url, referrer_url, user_agent, ip_address,
          device_type, browser_name, os_name, country, city, properties
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        eventId,
        event.userId || null,
        event.sessionId || null,
        event.eventType,
        event.eventCategory,
        event.eventAction,
        event.eventLabel || null,
        event.eventValue || null,
        event.pageUrl || null,
        event.referrerUrl || null,
        event.userAgent || null,
        event.ipAddress || null,
        event.deviceType || null,
        event.browserName || null,
        event.osName || null,
        event.country || null,
        event.city || null,
        event.properties ? JSON.stringify(event.properties) : null
      ).run()

      // Insert event properties if any
      if (event.properties) {
        for (const [key, value] of Object.entries(event.properties)) {
          await this.db.prepare(`
            INSERT INTO analytics_event_properties (event_id, property_key, property_value, property_type)
            VALUES (?, ?, ?, ?)
          `).bind(
            eventId,
            key,
            JSON.stringify(value),
            typeof value
          ).run()
        }
      }

      // Update user engagement metrics if user is identified
      if (event.userId && event.eventCategory === 'engagement') {
        await this.updateUserEngagementMetrics(event.userId, event.eventType, event.eventValue)
      }

      this.logger.info(`Event tracked successfully: ${eventId}`)
      return { success: true, eventId }

    } catch (error) {
      this.logger.error('Error tracking event:', error)
      return { success: false, eventId: '' }
    }
  }

  /**
   * Track multiple events in batch
   */
  async trackEventsBatch(events: AnalyticsEvent[]): Promise<{ success: boolean; trackedCount: number }> {
    try {
      let trackedCount = 0

      for (const event of events) {
        const result = await this.trackEvent(event)
        if (result.success) {
          trackedCount++
        }
      }

      return { success: true, trackedCount }

    } catch (error) {
      this.logger.error('Error tracking batch events:', error)
      return { success: false, trackedCount: 0 }
    }
  }

  /**
   * Update user engagement metrics
   */
  async updateUserEngagementMetrics(userId: number, eventType: string, eventValue?: number): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Get or create today's metrics
      const existing = await this.db.prepare(`
        SELECT * FROM user_engagement_metrics 
        WHERE user_id = ? AND metric_date = ?
      `).bind(userId, today).first()

      if (existing) {
        // Update existing metrics
        let updateFields = []
        let updateValues = []

        switch (eventType) {
          case 'page_view':
            updateFields.push('page_views = page_views + 1')
            break
          case 'session_start':
            updateFields.push('sessions_count = sessions_count + 1')
            break
          case 'session_end':
            if (eventValue) {
              updateFields.push('session_duration = session_duration + ?')
              updateValues.push(eventValue)
            }
            break
          case 'click':
            updateFields.push('clicks_count = clicks_count + 1')
            break
          case 'job_view':
            updateFields.push('jobs_viewed = jobs_viewed + 1')
            break
          case 'job_apply':
            updateFields.push('jobs_applied = jobs_applied + 1')
            break
          case 'message_sent':
            updateFields.push('messages_sent = messages_sent + 1')
            break
          case 'profile_update':
            updateFields.push('profile_updates = profile_updates + 1')
            break
          case 'login':
            updateFields.push('login_count = login_count + 1')
            break
        }

        if (updateFields.length > 0) {
          updateFields.push('last_activity_time = CURRENT_TIMESTAMP')
          updateFields.push('updated_at = CURRENT_TIMESTAMP')

          await this.db.prepare(`
            UPDATE user_engagement_metrics 
            SET ${updateFields.join(', ')}
            WHERE user_id = ? AND metric_date = ?
          `).bind(...updateValues, userId, today).run()
        }

      } else {
        // Create new metrics record
        const metrics: Partial<UserEngagementMetrics> = {
          userId,
          metricDate: today,
          pageViews: eventType === 'page_view' ? 1 : 0,
          sessionDuration: (eventType === 'session_end' && eventValue) ? eventValue : 0,
          sessionsCount: eventType === 'session_start' ? 1 : 0,
          clicksCount: eventType === 'click' ? 1 : 0,
          jobsViewed: eventType === 'job_view' ? 1 : 0,
          jobsApplied: eventType === 'job_apply' ? 1 : 0,
          messagesSent: eventType === 'message_sent' ? 1 : 0,
          profileUpdates: eventType === 'profile_update' ? 1 : 0,
          loginCount: eventType === 'login' ? 1 : 0,
          engagementScore: 0
        }

        await this.db.prepare(`
          INSERT INTO user_engagement_metrics (
            user_id, metric_date, page_views, session_duration, sessions_count,
            clicks_count, jobs_viewed, jobs_applied, messages_sent, profile_updates,
            login_count, engagement_score, last_activity_time
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(
          metrics.userId,
          metrics.metricDate,
          metrics.pageViews,
          metrics.sessionDuration,
          metrics.sessionsCount,
          metrics.clicksCount,
          metrics.jobsViewed,
          metrics.jobsApplied,
          metrics.messagesSent,
          metrics.profileUpdates,
          metrics.loginCount,
          metrics.engagementScore
        ).run()
      }

      // Calculate and update engagement score
      await this.calculateEngagementScore(userId, today)

    } catch (error) {
      this.logger.error('Error updating user engagement metrics:', error)
    }
  }

  /**
   * Calculate user engagement score based on activities
   */
  async calculateEngagementScore(userId: number, date: string): Promise<void> {
    try {
      const metrics = await this.db.prepare(`
        SELECT * FROM user_engagement_metrics 
        WHERE user_id = ? AND metric_date = ?
      `).bind(userId, date).first() as UserEngagementMetrics

      if (!metrics) return

      // Weighted engagement score calculation
      const weights = {
        pageViews: 0.1,
        sessionDuration: 0.002, // Per second
        sessionsCount: 2.0,
        clicksCount: 0.5,
        jobsViewed: 1.5,
        jobsApplied: 5.0,
        messagesSent: 3.0,
        profileUpdates: 4.0,
        loginCount: 2.5
      }

      const score = 
        (metrics.pageViews * weights.pageViews) +
        (metrics.sessionDuration * weights.sessionDuration) +
        (metrics.sessionsCount * weights.sessionsCount) +
        (metrics.clicksCount * weights.clicksCount) +
        (metrics.jobsViewed * weights.jobsViewed) +
        (metrics.jobsApplied * weights.jobsApplied) +
        (metrics.messagesSent * weights.messagesSent) +
        (metrics.profileUpdates * weights.profileUpdates) +
        (metrics.loginCount * weights.loginCount)

      await this.db.prepare(`
        UPDATE user_engagement_metrics 
        SET engagement_score = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND metric_date = ?
      `).bind(Math.round(score * 100) / 100, userId, date).run()

    } catch (error) {
      this.logger.error('Error calculating engagement score:', error)
    }
  }

  /**
   * Track registration funnel step
   */
  async trackRegistrationFunnel(step: RegistrationFunnelStep): Promise<{ success: boolean }> {
    try {
      await this.db.prepare(`
        INSERT INTO registration_funnel (
          session_id, funnel_step, user_id, referrer_source, landing_page,
          device_type, conversion_time, dropped_out
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        step.sessionId,
        step.funnelStep,
        step.userId || null,
        step.referrerSource || null,
        step.landingPage || null,
        step.deviceType || null,
        step.conversionTime || null,
        step.droppedOut ? 1 : 0
      ).run()

      return { success: true }

    } catch (error) {
      this.logger.error('Error tracking registration funnel:', error)
      return { success: false }
    }
  }

  /**
   * Update user lifecycle stage
   */
  async updateUserLifecycleStage(stageData: UserLifecycleStage): Promise<{ success: boolean }> {
    try {
      // Get current stage
      const currentStage = await this.db.prepare(`
        SELECT * FROM user_lifecycle_stages 
        WHERE user_id = ? 
        ORDER BY stage_entered_at DESC 
        LIMIT 1
      `).bind(stageData.userId).first()

      // Only insert if stage is different
      if (!currentStage || currentStage.stage !== stageData.stage) {
        await this.db.prepare(`
          INSERT INTO user_lifecycle_stages (
            user_id, stage, previous_stage, stage_duration, stage_metadata
          ) VALUES (?, ?, ?, ?, ?)
        `).bind(
          stageData.userId,
          stageData.stage,
          currentStage?.stage || null,
          stageData.stageDuration || null,
          stageData.stageMetadata ? JSON.stringify(stageData.stageMetadata) : null
        ).run()
      }

      return { success: true }

    } catch (error) {
      this.logger.error('Error updating user lifecycle stage:', error)
      return { success: false }
    }
  }

  /**
   * Get user engagement summary
   */
  async getUserEngagementSummary(userId: number, days: number = 30): Promise<any> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString().split('T')[0]

      const summary = await this.db.prepare(`
        SELECT 
          u.id,
          u.email,
          u.user_type,
          u.created_at,
          COALESCE(SUM(uem.page_views), 0) as total_page_views,
          COALESCE(SUM(uem.session_duration), 0) as total_session_duration,
          COALESCE(AVG(uem.engagement_score), 0) as avg_engagement_score,
          COUNT(DISTINCT uem.metric_date) as active_days,
          MAX(uem.last_activity_time) as last_activity,
          uls.stage as current_lifecycle_stage
        FROM users u
        LEFT JOIN user_engagement_metrics uem ON u.id = uem.user_id 
          AND uem.metric_date >= ?
        LEFT JOIN user_lifecycle_stages uls ON u.id = uls.user_id 
          AND uls.id = (
            SELECT id FROM user_lifecycle_stages 
            WHERE user_id = u.id 
            ORDER BY stage_entered_at DESC 
            LIMIT 1
          )
        WHERE u.id = ?
        GROUP BY u.id, u.email, u.user_type, u.created_at, uls.stage
      `).bind(startDateStr, userId).first()

      return summary

    } catch (error) {
      this.logger.error('Error getting user engagement summary:', error)
      return null
    }
  }

  /**
   * Get analytics events with filters
   */
  async getEvents(query: AnalyticsQuery): Promise<any[]> {
    try {
      let sql = `
        SELECT ae.*, aep.property_key, aep.property_value, aep.property_type
        FROM analytics_events ae
        LEFT JOIN analytics_event_properties aep ON ae.event_id = aep.event_id
        WHERE 1=1
      `
      const params: any[] = []

      // Apply filters
      if (query.startDate) {
        sql += ` AND ae.created_at >= ?`
        params.push(query.startDate)
      }

      if (query.endDate) {
        sql += ` AND ae.created_at <= ?`
        params.push(query.endDate)
      }

      if (query.userId) {
        sql += ` AND ae.user_id = ?`
        params.push(query.userId)
      }

      if (query.eventType) {
        sql += ` AND ae.event_type = ?`
        params.push(query.eventType)
      }

      if (query.eventCategory) {
        sql += ` AND ae.event_category = ?`
        params.push(query.eventCategory)
      }

      sql += ` ORDER BY ae.created_at DESC`

      if (query.limit) {
        sql += ` LIMIT ?`
        params.push(query.limit)
      }

      if (query.offset) {
        sql += ` OFFSET ?`
        params.push(query.offset)
      }

      const results = await this.db.prepare(sql).bind(...params).all()
      return results.results || []

    } catch (error) {
      this.logger.error('Error getting analytics events:', error)
      return []
    }
  }

  /**
   * Get registration funnel analytics
   */
  async getRegistrationFunnelAnalytics(days: number = 30): Promise<any> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString().split('T')[0]

      const funnelData = await this.db.prepare(`
        SELECT 
          funnel_step,
          COUNT(*) as step_count,
          COUNT(DISTINCT session_id) as unique_sessions,
          AVG(conversion_time) as avg_conversion_time,
          SUM(CASE WHEN dropped_out = 1 THEN 1 ELSE 0 END) as dropout_count
        FROM registration_funnel
        WHERE step_timestamp >= ?
        GROUP BY funnel_step
        ORDER BY 
          CASE funnel_step
            WHEN 'landing' THEN 1
            WHEN 'signup_start' THEN 2
            WHEN 'email_entered' THEN 3
            WHEN 'completed' THEN 4
            WHEN 'verified' THEN 5
            ELSE 6
          END
      `).bind(startDateStr).all()

      // Calculate conversion rates
      const results = funnelData.results || []
      const landing = results.find((r: any) => r.funnel_step === 'landing')
      const landingCount = landing ? landing.unique_sessions : 1

      return results.map((step: any) => ({
        ...step,
        conversion_rate: landingCount > 0 ? (step.unique_sessions / landingCount) * 100 : 0,
        dropout_rate: step.step_count > 0 ? (step.dropout_count / step.step_count) * 100 : 0
      }))

    } catch (error) {
      this.logger.error('Error getting registration funnel analytics:', error)
      return []
    }
  }

  /**
   * Get real-time dashboard data
   */
  async getRealTimeDashboard(): Promise<any> {
    try {
      // Get basic metrics
      const metrics = await this.db.prepare(`
        SELECT * FROM realtime_dashboard_metrics
      `).all()

      // Get recent events
      const recentEvents = await this.db.prepare(`
        SELECT event_type, event_category, COUNT(*) as count
        FROM analytics_events 
        WHERE created_at >= datetime('now', '-1 hour')
        GROUP BY event_type, event_category
        ORDER BY count DESC
        LIMIT 10
      `).all()

      // Get active users
      const activeUsers = await this.db.prepare(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM analytics_events 
        WHERE created_at >= datetime('now', '-15 minutes')
        AND user_id IS NOT NULL
      `).first()

      return {
        metrics: metrics.results || [],
        recentEvents: recentEvents.results || [],
        activeUsers: activeUsers?.count || 0,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      this.logger.error('Error getting real-time dashboard data:', error)
      return null
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * Clean up old analytics data
   */
  async cleanupOldData(retentionDays: number = 365): Promise<{ success: boolean; deletedCount: number }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
      const cutoffDateStr = cutoffDate.toISOString()

      // Delete old events
      const eventsResult = await this.db.prepare(`
        DELETE FROM analytics_events WHERE created_at < ?
      `).bind(cutoffDateStr).run()

      // Delete old engagement metrics
      const metricsResult = await this.db.prepare(`
        DELETE FROM user_engagement_metrics WHERE created_at < ?
      `).bind(cutoffDateStr).run()

      const totalDeleted = (eventsResult.changes || 0) + (metricsResult.changes || 0)

      this.logger.info(`Cleaned up ${totalDeleted} old analytics records`)
      return { success: true, deletedCount: totalDeleted }

    } catch (error) {
      this.logger.error('Error cleaning up old analytics data:', error)
      return { success: false, deletedCount: 0 }
    }
  }
}