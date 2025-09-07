/**
 * Business Intelligence Service - Revenue tracking and growth analytics
 * 
 * This service handles:
 * - Revenue metrics calculation and tracking
 * - Growth analytics and KPI monitoring
 * - Marketing channel performance analysis
 * - Customer lifetime value calculations
 * - Revenue forecasting and trend analysis
 */

import { Logger } from '../utils/logger'

export interface RevenueMetrics {
  metricDate: string
  metricType: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  totalRevenue: number
  subscriptionRevenue: number
  commissionRevenue: number
  oneTimePaymentRevenue: number
  refundsAmount: number
  netRevenue: number
  transactionCount: number
  payingUsersCount: number
  newPayingUsers: number
  churnedPayingUsers: number
  averageOrderValue: number
  customerLifetimeValue: number
  monthlyRecurringRevenue: number
  annualRecurringRevenue: number
}

export interface GrowthMetrics {
  metricDate: string
  metricType: 'daily' | 'weekly' | 'monthly'
  totalUsers: number
  newUsers: number
  activeUsers: number
  returningUsers: number
  userRetentionRate: number
  userChurnRate: number
  jobsPosted: number
  jobsCompleted: number
  jobSuccessRate: number
  platformUtilizationRate: number
  userAcquisitionCost: number
  conversionRate: number
}

export interface MarketingChannelMetrics {
  metricDate: string
  channelName: string
  channelSource?: string
  visitors: number
  newUsers: number
  conversions: number
  conversionRate: number
  cost: number
  revenue: number
  roi: number
  customerAcquisitionCost: number
}

export interface RevenueAnalysis {
  period: string
  revenue: RevenueMetrics[]
  growth: GrowthMetrics[]
  trends: any[]
  forecasts: any[]
}

export interface CustomerSegment {
  segmentName: string
  userCount: number
  averageRevenue: number
  lifetimeValue: number
  acquisitionCost: number
  profitability: number
}

export class BusinessIntelligenceService {
  private db: D1Database
  private logger: Logger

  constructor(database: D1Database) {
    this.db = database
    this.logger = new Logger('BusinessIntelligenceService')
  }

  /**
   * Calculate and store daily revenue metrics
   */
  async calculateDailyRevenueMetrics(date?: string): Promise<{ success: boolean; metrics?: RevenueMetrics }> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0]

      // Calculate revenue components
      const revenueData = await this.db.prepare(`
        SELECT 
          COALESCE(SUM(CASE WHEN payment_type = 'subscription' THEN amount ELSE 0 END), 0) as subscription_revenue,
          COALESCE(SUM(CASE WHEN payment_type = 'commission' THEN amount ELSE 0 END), 0) as commission_revenue,
          COALESCE(SUM(CASE WHEN payment_type = 'one_time' THEN amount ELSE 0 END), 0) as one_time_revenue,
          COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END), 0) as refunds_amount,
          COUNT(*) as transaction_count
        FROM payments 
        WHERE DATE(created_at) = ? AND status IN ('completed', 'refunded')
      `).bind(targetDate).first()

      if (!revenueData) {
        throw new Error('Failed to fetch revenue data')
      }

      const totalRevenue = revenueData.subscription_revenue + revenueData.commission_revenue + revenueData.one_time_revenue
      const netRevenue = totalRevenue - revenueData.refunds_amount

      // Calculate user metrics
      const userMetrics = await this.db.prepare(`
        SELECT 
          COUNT(DISTINCT p.user_id) as paying_users_count,
          COUNT(DISTINCT CASE WHEN u.created_at >= ? THEN p.user_id END) as new_paying_users
        FROM payments p
        JOIN users u ON p.user_id = u.id
        WHERE DATE(p.created_at) = ? AND p.status = 'completed'
      `).bind(targetDate, targetDate).first()

      // Calculate churned users (users who had payments before but none in recent period)
      const churnedUsers = await this.db.prepare(`
        SELECT COUNT(DISTINCT user_id) as churned_count
        FROM payments 
        WHERE user_id NOT IN (
          SELECT DISTINCT user_id FROM payments 
          WHERE DATE(created_at) >= DATE(?, '-30 days') AND status = 'completed'
        )
        AND DATE(created_at) < DATE(?, '-30 days')
        AND status = 'completed'
      `).bind(targetDate, targetDate).first()

      // Calculate average order value
      const avgOrderValue = revenueData.transaction_count > 0 ? totalRevenue / revenueData.transaction_count : 0

      // Calculate MRR and ARR
      const mrrData = await this.db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as mrr
        FROM payments 
        WHERE payment_type = 'subscription' 
        AND status = 'completed'
        AND DATE(created_at) = ?
      `).bind(targetDate).first()

      const mrr = mrrData?.mrr || 0
      const arr = mrr * 12

      // Calculate CLV (simplified)
      const clvData = await this.db.prepare(`
        SELECT AVG(total_spent / GREATEST(days_active, 1) * 365) as avg_clv
        FROM (
          SELECT 
            p.user_id,
            SUM(p.amount) as total_spent,
            JULIANDAY('now') - JULIANDAY(MIN(p.created_at)) as days_active
          FROM payments p
          WHERE p.status = 'completed'
          GROUP BY p.user_id
          HAVING days_active >= 30
        )
      `).first()

      const customerLifetimeValue = clvData?.avg_clv || 0

      const metrics: RevenueMetrics = {
        metricDate: targetDate,
        metricType: 'daily',
        totalRevenue,
        subscriptionRevenue: revenueData.subscription_revenue,
        commissionRevenue: revenueData.commission_revenue,
        oneTimePaymentRevenue: revenueData.one_time_revenue,
        refundsAmount: revenueData.refunds_amount,
        netRevenue,
        transactionCount: revenueData.transaction_count,
        payingUsersCount: userMetrics?.paying_users_count || 0,
        newPayingUsers: userMetrics?.new_paying_users || 0,
        churnedPayingUsers: churnedUsers?.churned_count || 0,
        averageOrderValue: avgOrderValue,
        customerLifetimeValue,
        monthlyRecurringRevenue: mrr,
        annualRecurringRevenue: arr
      }

      // Store metrics
      await this.db.prepare(`
        INSERT OR REPLACE INTO revenue_metrics (
          metric_date, metric_type, total_revenue, subscription_revenue, commission_revenue,
          one_time_payment_revenue, refunds_amount, net_revenue, transaction_count,
          paying_users_count, new_paying_users, churned_paying_users, average_order_value,
          customer_lifetime_value, monthly_recurring_revenue, annual_recurring_revenue
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        metrics.metricDate,
        metrics.metricType,
        metrics.totalRevenue,
        metrics.subscriptionRevenue,
        metrics.commissionRevenue,
        metrics.oneTimePaymentRevenue,
        metrics.refundsAmount,
        metrics.netRevenue,
        metrics.transactionCount,
        metrics.payingUsersCount,
        metrics.newPayingUsers,
        metrics.churnedPayingUsers,
        metrics.averageOrderValue,
        metrics.customerLifetimeValue,
        metrics.monthlyRecurringRevenue,
        metrics.annualRecurringRevenue
      ).run()

      this.logger.info(`Revenue metrics calculated for ${targetDate}`)
      return { success: true, metrics }

    } catch (error) {
      this.logger.error('Error calculating revenue metrics:', error)
      return { success: false }
    }
  }

  /**
   * Calculate and store daily growth metrics
   */
  async calculateDailyGrowthMetrics(date?: string): Promise<{ success: boolean; metrics?: GrowthMetrics }> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0]

      // Calculate user growth metrics
      const userGrowthData = await this.db.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE DATE(created_at) <= ?) as total_users,
          (SELECT COUNT(*) FROM users WHERE DATE(created_at) = ?) as new_users,
          (SELECT COUNT(DISTINCT user_id) FROM analytics_events 
           WHERE DATE(created_at) = ? AND user_id IS NOT NULL) as active_users,
          (SELECT COUNT(DISTINCT ae.user_id) FROM analytics_events ae
           JOIN users u ON ae.user_id = u.id
           WHERE DATE(ae.created_at) = ? 
           AND DATE(u.created_at) < ?
           AND ae.user_id IS NOT NULL) as returning_users
      `).bind(targetDate, targetDate, targetDate, targetDate, targetDate).first()

      // Calculate job metrics
      const jobMetrics = await this.db.prepare(`
        SELECT 
          COUNT(CASE WHEN DATE(created_at) = ? THEN 1 END) as jobs_posted,
          COUNT(CASE WHEN DATE(completed_at) = ? THEN 1 END) as jobs_completed
        FROM jobs
      `).bind(targetDate, targetDate).first()

      // Calculate success rate
      const jobsPosted = jobMetrics?.jobs_posted || 0
      const jobsCompleted = jobMetrics?.jobs_completed || 0
      const jobSuccessRate = jobsPosted > 0 ? (jobsCompleted / jobsPosted) * 100 : 0

      // Calculate retention rate (30-day retention)
      const retentionData = await this.db.prepare(`
        SELECT 
          COUNT(DISTINCT u1.id) as users_30_days_ago,
          COUNT(DISTINCT ae.user_id) as retained_users
        FROM users u1
        LEFT JOIN analytics_events ae ON u1.id = ae.user_id 
          AND ae.created_at >= ? 
          AND ae.created_at < DATE(?, '+1 day')
        WHERE DATE(u1.created_at) = DATE(?, '-30 days')
      `).bind(targetDate, targetDate, targetDate).first()

      const userRetentionRate = retentionData && retentionData.users_30_days_ago > 0 
        ? (retentionData.retained_users / retentionData.users_30_days_ago) * 100 
        : 0

      const userChurnRate = 100 - userRetentionRate

      // Calculate platform utilization (active users / total users)
      const totalUsers = userGrowthData?.total_users || 0
      const activeUsers = userGrowthData?.active_users || 0
      const platformUtilizationRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0

      // Calculate conversion rate (new paying users / new users)
      const newUsers = userGrowthData?.new_users || 0
      const newPayingUsers = await this.db.prepare(`
        SELECT COUNT(DISTINCT p.user_id) as count
        FROM payments p
        JOIN users u ON p.user_id = u.id
        WHERE DATE(u.created_at) = ? AND DATE(p.created_at) = ? AND p.status = 'completed'
      `).bind(targetDate, targetDate).first()

      const conversionRate = newUsers > 0 ? ((newPayingUsers?.count || 0) / newUsers) * 100 : 0

      const metrics: GrowthMetrics = {
        metricDate: targetDate,
        metricType: 'daily',
        totalUsers,
        newUsers,
        activeUsers,
        returningUsers: userGrowthData?.returning_users || 0,
        userRetentionRate,
        userChurnRate,
        jobsPosted,
        jobsCompleted,
        jobSuccessRate,
        platformUtilizationRate,
        userAcquisitionCost: 0, // Would need marketing spend data
        conversionRate
      }

      // Store metrics
      await this.db.prepare(`
        INSERT OR REPLACE INTO growth_metrics (
          metric_date, metric_type, total_users, new_users, active_users, returning_users,
          user_retention_rate, user_churn_rate, jobs_posted, jobs_completed, job_success_rate,
          platform_utilization_rate, user_acquisition_cost, conversion_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        metrics.metricDate,
        metrics.metricType,
        metrics.totalUsers,
        metrics.newUsers,
        metrics.activeUsers,
        metrics.returningUsers,
        metrics.userRetentionRate,
        metrics.userChurnRate,
        metrics.jobsPosted,
        metrics.jobsCompleted,
        metrics.jobSuccessRate,
        metrics.platformUtilizationRate,
        metrics.userAcquisitionCost,
        metrics.conversionRate
      ).run()

      this.logger.info(`Growth metrics calculated for ${targetDate}`)
      return { success: true, metrics }

    } catch (error) {
      this.logger.error('Error calculating growth metrics:', error)
      return { success: false }
    }
  }

  /**
   * Get revenue analytics for a date range
   */
  async getRevenueAnalytics(startDate: string, endDate: string, metricType: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<RevenueAnalysis> {
    try {
      const revenue = await this.db.prepare(`
        SELECT * FROM revenue_metrics 
        WHERE metric_date >= ? AND metric_date <= ? AND metric_type = ?
        ORDER BY metric_date
      `).bind(startDate, endDate, metricType).all()

      const growth = await this.db.prepare(`
        SELECT * FROM growth_metrics 
        WHERE metric_date >= ? AND metric_date <= ? AND metric_type = ?
        ORDER BY metric_date
      `).bind(startDate, endDate, metricType).all()

      return {
        period: `${startDate}_${endDate}`,
        revenue: revenue.results || [],
        growth: growth.results || [],
        trends: [], // Would be calculated from the data
        forecasts: [] // Would come from predictive analytics
      }

    } catch (error) {
      this.logger.error('Error getting revenue analytics:', error)
      return {
        period: '',
        revenue: [],
        growth: [],
        trends: [],
        forecasts: []
      }
    }
  }

  /**
   * Calculate marketing channel performance
   */
  async calculateMarketingChannelMetrics(date: string): Promise<{ success: boolean }> {
    try {
      // This would typically integrate with marketing attribution data
      // For now, we'll use referrer data from analytics events
      
      const channelData = await this.db.prepare(`
        SELECT 
          CASE 
            WHEN referrer_url IS NULL OR referrer_url = '' THEN 'direct'
            WHEN referrer_url LIKE '%google%' THEN 'organic_search'
            WHEN referrer_url LIKE '%facebook%' OR referrer_url LIKE '%twitter%' THEN 'social'
            WHEN referrer_url LIKE '%email%' THEN 'email'
            ELSE 'referral'
          END as channel_name,
          COUNT(DISTINCT session_id) as visitors,
          COUNT(DISTINCT CASE WHEN event_type = 'registration' THEN user_id END) as conversions
        FROM analytics_events
        WHERE DATE(created_at) = ?
        GROUP BY channel_name
      `).bind(date).all()

      for (const channel of (channelData.results || [])) {
        const conversionRate = channel.visitors > 0 ? (channel.conversions / channel.visitors) * 100 : 0

        await this.db.prepare(`
          INSERT OR REPLACE INTO marketing_channel_metrics (
            metric_date, channel_name, visitors, new_users, conversions, conversion_rate,
            cost, revenue, roi, customer_acquisition_cost
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          date,
          channel.channel_name,
          channel.visitors,
          channel.conversions, // Assuming new users = conversions for simplicity
          channel.conversions,
          conversionRate,
          0, // Cost would need to be provided separately
          0, // Revenue would need to be calculated from conversions
          0, // ROI calculation
          0  // CAC calculation
        ).run()
      }

      return { success: true }

    } catch (error) {
      this.logger.error('Error calculating marketing channel metrics:', error)
      return { success: false }
    }
  }

  /**
   * Get customer segments analysis
   */
  async getCustomerSegments(): Promise<CustomerSegment[]> {
    try {
      const segments = await this.db.prepare(`
        SELECT 
          CASE 
            WHEN total_spent >= 1000 THEN 'high_value'
            WHEN total_spent >= 100 THEN 'medium_value'
            WHEN total_spent > 0 THEN 'low_value'
            ELSE 'non_paying'
          END as segment_name,
          COUNT(*) as user_count,
          AVG(total_spent) as average_revenue,
          AVG(total_spent / GREATEST(days_active, 1) * 365) as lifetime_value
        FROM (
          SELECT 
            u.id,
            COALESCE(SUM(p.amount), 0) as total_spent,
            GREATEST(JULIANDAY('now') - JULIANDAY(u.created_at), 1) as days_active
          FROM users u
          LEFT JOIN payments p ON u.id = p.user_id AND p.status = 'completed'
          GROUP BY u.id
        )
        GROUP BY segment_name
        ORDER BY average_revenue DESC
      `).all()

      return (segments.results || []).map((segment: any) => ({
        segmentName: segment.segment_name,
        userCount: segment.user_count,
        averageRevenue: segment.average_revenue || 0,
        lifetimeValue: segment.lifetime_value || 0,
        acquisitionCost: 0, // Would need marketing data
        profitability: (segment.lifetime_value || 0) - 0 // LTV - CAC
      }))

    } catch (error) {
      this.logger.error('Error getting customer segments:', error)
      return []
    }
  }

  /**
   * Get KPI dashboard data
   */
  async getKPIDashboard(days: number = 30): Promise<any> {
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString().split('T')[0]

      // Get latest revenue metrics
      const revenueMetrics = await this.db.prepare(`
        SELECT * FROM revenue_metrics 
        WHERE metric_type = 'daily' AND metric_date >= ?
        ORDER BY metric_date DESC
        LIMIT ?
      `).bind(startDateStr, days).all()

      // Get latest growth metrics
      const growthMetrics = await this.db.prepare(`
        SELECT * FROM growth_metrics 
        WHERE metric_type = 'daily' AND metric_date >= ?
        ORDER BY metric_date DESC
        LIMIT ?
      `).bind(startDateStr, days).all()

      // Calculate totals and averages
      const revenueData = revenueMetrics.results || []
      const growthData = growthMetrics.results || []

      const totalRevenue = revenueData.reduce((sum, day) => sum + day.total_revenue, 0)
      const totalUsers = growthData.length > 0 ? growthData[0].total_users : 0
      const avgConversionRate = growthData.reduce((sum, day) => sum + day.conversion_rate, 0) / Math.max(growthData.length, 1)

      return {
        period: { start: startDateStr, end: endDate, days },
        revenue: {
          total: totalRevenue,
          daily_average: totalRevenue / Math.max(revenueData.length, 1),
          growth_rate: this.calculateGrowthRate(revenueData.map(d => d.total_revenue))
        },
        users: {
          total: totalUsers,
          new_users: growthData.reduce((sum, day) => sum + day.new_users, 0),
          conversion_rate: avgConversionRate
        },
        jobs: {
          posted: growthData.reduce((sum, day) => sum + day.jobs_posted, 0),
          completed: growthData.reduce((sum, day) => sum + day.jobs_completed, 0),
          success_rate: growthData.reduce((sum, day) => sum + day.job_success_rate, 0) / Math.max(growthData.length, 1)
        },
        trends: {
          revenue: revenueData.slice(-7).map(d => ({ date: d.metric_date, value: d.total_revenue })),
          users: growthData.slice(-7).map(d => ({ date: d.metric_date, value: d.new_users }))
        }
      }

    } catch (error) {
      this.logger.error('Error getting KPI dashboard:', error)
      return null
    }
  }

  /**
   * Calculate growth rate from array of values
   */
  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0
    
    const first = values[values.length - 1] // Most recent (end of period)
    const last = values[0] // Oldest (start of period)
    
    if (last === 0) return 0
    
    return ((first - last) / last) * 100
  }

  /**
   * Generate monthly revenue summary
   */
  async generateMonthlyRevenueSummary(year: number, month: number): Promise<any> {
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
      const endDate = new Date(year, month, 0).toISOString().split('T')[0] // Last day of month

      const summary = await this.db.prepare(`
        SELECT 
          SUM(total_revenue) as total_revenue,
          SUM(net_revenue) as net_revenue,
          SUM(subscription_revenue) as subscription_revenue,
          SUM(commission_revenue) as commission_revenue,
          SUM(transaction_count) as total_transactions,
          AVG(paying_users_count) as avg_paying_users,
          SUM(new_paying_users) as new_paying_users,
          AVG(customer_lifetime_value) as avg_customer_lifetime_value
        FROM revenue_metrics
        WHERE metric_date >= ? AND metric_date <= ? AND metric_type = 'daily'
      `).bind(startDate, endDate).first()

      return {
        period: { year, month, startDate, endDate },
        summary: summary || {},
        generated_at: new Date().toISOString()
      }

    } catch (error) {
      this.logger.error('Error generating monthly revenue summary:', error)
      return null
    }
  }
}