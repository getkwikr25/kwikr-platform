/**
 * Performance Metrics Service - Job completion rates and satisfaction tracking
 * 
 * This service handles:
 * - Job performance analytics and completion tracking
 * - Platform performance monitoring
 * - User satisfaction surveys and feedback analysis
 * - Service quality metrics and KPIs
 * - Performance trend analysis and alerts
 */

import { Logger } from '../utils/logger'

export interface JobPerformanceMetrics {
  metricDate: string
  jobCategory?: string
  jobSubcategory?: string
  jobsPosted: number
  jobsWithApplications: number
  jobsCompleted: number
  jobsCancelled: number
  avgTimeToFirstApplication: number // Hours
  avgTimeToCompletion: number // Hours
  avgApplicationsPerJob: number
  completionRate: number
  clientSatisfactionAvg: number
  workerSatisfactionAvg: number
  avgJobValue: number
  disputeRate: number
}

export interface PlatformPerformanceMetrics {
  metricTimestamp: string
  responseTimeAvg: number // ms
  responseTimeP95: number // ms
  errorRate: number // percentage
  uptimePercentage: number
  concurrentUsers: number
  pageLoadTimeAvg: number // ms
  databaseQueryTimeAvg: number // ms
  memoryUsagePercentage: number
  cpuUsagePercentage: number
  requestCount: number
  uniqueVisitors: number
  bounceRate: number
}

export interface SatisfactionSurvey {
  surveyId: string
  userId?: number
  jobId?: number
  surveyType: 'job_completion' | 'platform_experience' | 'nps'
  overallRating?: number
  npsScore?: number
  feedbackText?: string
  satisfactionCategories?: Record<string, number>
  improvementSuggestions?: string
}

export interface PerformanceAlert {
  alertType: 'performance_degradation' | 'high_error_rate' | 'low_satisfaction' | 'completion_rate_drop'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  metrics: Record<string, number>
  threshold: number
  currentValue: number
}

export class PerformanceMetricsService {
  private db: D1Database
  private logger: Logger

  constructor(database: D1Database) {
    this.db = database
    this.logger = new Logger('PerformanceMetricsService')
  }

  /**
   * Calculate and store job performance metrics
   */
  async calculateJobPerformanceMetrics(date?: string, category?: string, subcategory?: string): Promise<{ success: boolean; metrics?: JobPerformanceMetrics }> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0]

      let categoryFilter = ''
      let categoryParams: any[] = []

      if (category) {
        categoryFilter += ' AND j.category = ?'
        categoryParams.push(category)
      }

      if (subcategory) {
        categoryFilter += ' AND j.subcategory = ?'
        categoryParams.push(subcategory)
      }

      // Calculate job metrics
      const jobData = await this.db.prepare(`
        SELECT 
          COUNT(CASE WHEN DATE(j.created_at) = ? THEN 1 END) as jobs_posted,
          COUNT(CASE WHEN DATE(j.created_at) = ? AND j.id IN (
            SELECT DISTINCT job_id FROM job_applications
          ) THEN 1 END) as jobs_with_applications,
          COUNT(CASE WHEN DATE(j.completed_at) = ? THEN 1 END) as jobs_completed,
          COUNT(CASE WHEN DATE(j.updated_at) = ? AND j.status = 'cancelled' THEN 1 END) as jobs_cancelled,
          AVG(CASE 
            WHEN DATE(j.created_at) = ? AND j.id IN (SELECT DISTINCT job_id FROM job_applications) 
            THEN JULIANDAY(first_application.created_at) - JULIANDAY(j.created_at) 
          END) * 24 as avg_hours_to_first_application,
          AVG(CASE 
            WHEN DATE(j.completed_at) = ? 
            THEN JULIANDAY(j.completed_at) - JULIANDAY(j.created_at) 
          END) * 24 as avg_hours_to_completion,
          AVG(application_counts.app_count) as avg_applications_per_job,
          AVG(j.budget) as avg_job_value
        FROM jobs j
        LEFT JOIN (
          SELECT 
            job_id, 
            MIN(created_at) as created_at
          FROM job_applications 
          GROUP BY job_id
        ) first_application ON j.id = first_application.job_id
        LEFT JOIN (
          SELECT 
            job_id, 
            COUNT(*) as app_count
          FROM job_applications 
          WHERE DATE(created_at) = ?
          GROUP BY job_id
        ) application_counts ON j.id = application_counts.job_id
        WHERE 1=1 ${categoryFilter}
      `).bind(
        targetDate, targetDate, targetDate, targetDate, targetDate, targetDate, targetDate,
        ...categoryParams
      ).first()

      if (!jobData) {
        throw new Error('Failed to fetch job performance data')
      }

      // Calculate completion rate
      const jobsPosted = jobData.jobs_posted || 0
      const jobsCompleted = jobData.jobs_completed || 0
      const completionRate = jobsPosted > 0 ? (jobsCompleted / jobsPosted) * 100 : 0

      // Calculate satisfaction ratings
      const satisfactionData = await this.db.prepare(`
        SELECT 
          AVG(CASE WHEN r.reviewer_type = 'client' THEN r.rating END) as client_satisfaction,
          AVG(CASE WHEN r.reviewer_type = 'worker' THEN r.rating END) as worker_satisfaction
        FROM reviews r
        JOIN jobs j ON r.job_id = j.id
        WHERE DATE(r.created_at) = ?
        ${category ? ' AND j.category = ?' : ''}
        ${subcategory ? ' AND j.subcategory = ?' : ''}
      `).bind(targetDate, ...categoryParams).first()

      // Calculate dispute rate
      const disputeData = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_disputes,
          COUNT(DISTINCT job_id) as disputed_jobs
        FROM disputes d
        JOIN jobs j ON d.job_id = j.id
        WHERE DATE(d.created_at) = ?
        ${category ? ' AND j.category = ?' : ''}
        ${subcategory ? ' AND j.subcategory = ?' : ''}
      `).bind(targetDate, ...categoryParams).first()

      const disputeRate = jobsCompleted > 0 ? ((disputeData?.disputed_jobs || 0) / jobsCompleted) * 100 : 0

      const metrics: JobPerformanceMetrics = {
        metricDate: targetDate,
        jobCategory: category,
        jobSubcategory: subcategory,
        jobsPosted,
        jobsWithApplications: jobData.jobs_with_applications || 0,
        jobsCompleted,
        jobsCancelled: jobData.jobs_cancelled || 0,
        avgTimeToFirstApplication: jobData.avg_hours_to_first_application || 0,
        avgTimeToCompletion: jobData.avg_hours_to_completion || 0,
        avgApplicationsPerJob: jobData.avg_applications_per_job || 0,
        completionRate,
        clientSatisfactionAvg: satisfactionData?.client_satisfaction || 0,
        workerSatisfactionAvg: satisfactionData?.worker_satisfaction || 0,
        avgJobValue: jobData.avg_job_value || 0,
        disputeRate
      }

      // Store metrics
      await this.db.prepare(`
        INSERT OR REPLACE INTO job_performance_metrics (
          metric_date, job_category, job_subcategory, jobs_posted, jobs_with_applications,
          jobs_completed, jobs_cancelled, avg_time_to_first_application, avg_time_to_completion,
          avg_applications_per_job, completion_rate, client_satisfaction_avg, worker_satisfaction_avg,
          avg_job_value, dispute_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        metrics.metricDate,
        metrics.jobCategory || null,
        metrics.jobSubcategory || null,
        metrics.jobsPosted,
        metrics.jobsWithApplications,
        metrics.jobsCompleted,
        metrics.jobsCancelled,
        metrics.avgTimeToFirstApplication,
        metrics.avgTimeToCompletion,
        metrics.avgApplicationsPerJob,
        metrics.completionRate,
        metrics.clientSatisfactionAvg,
        metrics.workerSatisfactionAvg,
        metrics.avgJobValue,
        metrics.disputeRate
      ).run()

      this.logger.info(`Job performance metrics calculated for ${targetDate}`)
      return { success: true, metrics }

    } catch (error) {
      this.logger.error('Error calculating job performance metrics:', error)
      return { success: false }
    }
  }

  /**
   * Record platform performance metrics
   */
  async recordPlatformPerformanceMetrics(metrics: Partial<PlatformPerformanceMetrics>): Promise<{ success: boolean }> {
    try {
      const timestamp = metrics.metricTimestamp || new Date().toISOString()

      await this.db.prepare(`
        INSERT INTO platform_performance_metrics (
          metric_timestamp, response_time_avg, response_time_p95, error_rate,
          uptime_percentage, concurrent_users, page_load_time_avg, database_query_time_avg,
          memory_usage_percentage, cpu_usage_percentage, request_count, unique_visitors, bounce_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        timestamp,
        metrics.responseTimeAvg || 0,
        metrics.responseTimeP95 || 0,
        metrics.errorRate || 0,
        metrics.uptimePercentage || 100,
        metrics.concurrentUsers || 0,
        metrics.pageLoadTimeAvg || 0,
        metrics.databaseQueryTimeAvg || 0,
        metrics.memoryUsagePercentage || 0,
        metrics.cpuUsagePercentage || 0,
        metrics.requestCount || 0,
        metrics.uniqueVisitors || 0,
        metrics.bounceRate || 0
      ).run()

      // Check for performance alerts
      await this.checkPerformanceAlerts(metrics)

      return { success: true }

    } catch (error) {
      this.logger.error('Error recording platform performance metrics:', error)
      return { success: false }
    }
  }

  /**
   * Submit satisfaction survey
   */
  async submitSatisfactionSurvey(survey: SatisfactionSurvey): Promise<{ success: boolean; surveyId: string }> {
    try {
      const surveyId = survey.surveyId || this.generateSurveyId()

      await this.db.prepare(`
        INSERT INTO satisfaction_surveys (
          survey_id, user_id, job_id, survey_type, overall_rating, nps_score,
          feedback_text, satisfaction_categories, improvement_suggestions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        surveyId,
        survey.userId || null,
        survey.jobId || null,
        survey.surveyType,
        survey.overallRating || null,
        survey.npsScore || null,
        survey.feedbackText || null,
        survey.satisfactionCategories ? JSON.stringify(survey.satisfactionCategories) : null,
        survey.improvementSuggestions || null
      ).run()

      this.logger.info(`Satisfaction survey submitted: ${surveyId}`)
      return { success: true, surveyId }

    } catch (error) {
      this.logger.error('Error submitting satisfaction survey:', error)
      return { success: false, surveyId: '' }
    }
  }

  /**
   * Get performance dashboard data
   */
  async getPerformanceDashboard(hours: number = 24): Promise<any> {
    try {
      const startTime = new Date()
      startTime.setHours(startTime.getHours() - hours)
      const startTimeStr = startTime.toISOString()

      // Get recent platform metrics
      const platformMetrics = await this.db.prepare(`
        SELECT 
          AVG(response_time_avg) as avg_response_time,
          MAX(response_time_p95) as max_response_time_p95,
          AVG(error_rate) as avg_error_rate,
          MIN(uptime_percentage) as min_uptime,
          AVG(concurrent_users) as avg_concurrent_users,
          SUM(request_count) as total_requests
        FROM platform_performance_metrics
        WHERE metric_timestamp >= ?
      `).bind(startTimeStr).first()

      // Get recent job metrics
      const jobMetrics = await this.db.prepare(`
        SELECT 
          AVG(completion_rate) as avg_completion_rate,
          AVG(client_satisfaction_avg) as avg_client_satisfaction,
          AVG(worker_satisfaction_avg) as avg_worker_satisfaction,
          AVG(dispute_rate) as avg_dispute_rate
        FROM job_performance_metrics
        WHERE metric_date >= DATE('now', '-7 days')
      `).first()

      // Get recent satisfaction trends
      const satisfactionTrend = await this.db.prepare(`
        SELECT 
          DATE(completed_at) as date,
          AVG(overall_rating) as avg_rating,
          COUNT(*) as survey_count
        FROM satisfaction_surveys
        WHERE completed_at >= ?
        GROUP BY DATE(completed_at)
        ORDER BY date
      `).bind(startTimeStr).all()

      // Get top issues from feedback
      const topIssues = await this.db.prepare(`
        SELECT 
          feedback_text,
          COUNT(*) as frequency
        FROM satisfaction_surveys
        WHERE feedback_text IS NOT NULL 
        AND completed_at >= ?
        AND overall_rating <= 3
        GROUP BY feedback_text
        ORDER BY frequency DESC
        LIMIT 10
      `).bind(startTimeStr).all()

      return {
        period: { hours, start: startTimeStr },
        platform: platformMetrics || {},
        jobs: jobMetrics || {},
        satisfaction_trend: satisfactionTrend.results || [],
        top_issues: topIssues.results || [],
        generated_at: new Date().toISOString()
      }

    } catch (error) {
      this.logger.error('Error getting performance dashboard:', error)
      return null
    }
  }

  /**
   * Get job category performance comparison
   */
  async getJobCategoryPerformance(days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString().split('T')[0]

      const categoryPerformance = await this.db.prepare(`
        SELECT 
          COALESCE(job_category, 'uncategorized') as category,
          SUM(jobs_posted) as total_jobs_posted,
          SUM(jobs_completed) as total_jobs_completed,
          AVG(completion_rate) as avg_completion_rate,
          AVG(client_satisfaction_avg) as avg_client_satisfaction,
          AVG(worker_satisfaction_avg) as avg_worker_satisfaction,
          AVG(avg_job_value) as avg_job_value,
          AVG(dispute_rate) as avg_dispute_rate
        FROM job_performance_metrics
        WHERE metric_date >= ?
        GROUP BY job_category
        ORDER BY total_jobs_posted DESC
      `).bind(startDateStr).all()

      return categoryPerformance.results || []

    } catch (error) {
      this.logger.error('Error getting job category performance:', error)
      return []
    }
  }

  /**
   * Get satisfaction analytics
   */
  async getSatisfactionAnalytics(days: number = 30): Promise<any> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString()

      // Overall satisfaction metrics
      const overallMetrics = await this.db.prepare(`
        SELECT 
          AVG(overall_rating) as avg_overall_rating,
          AVG(nps_score) as avg_nps_score,
          COUNT(*) as total_surveys,
          COUNT(CASE WHEN overall_rating >= 4 THEN 1 END) as satisfied_count,
          COUNT(CASE WHEN nps_score >= 9 THEN 1 END) as promoters,
          COUNT(CASE WHEN nps_score <= 6 THEN 1 END) as detractors
        FROM satisfaction_surveys
        WHERE completed_at >= ?
      `).bind(startDateStr).first()

      // Satisfaction by survey type
      const byType = await this.db.prepare(`
        SELECT 
          survey_type,
          AVG(overall_rating) as avg_rating,
          AVG(nps_score) as avg_nps,
          COUNT(*) as count
        FROM satisfaction_surveys
        WHERE completed_at >= ?
        GROUP BY survey_type
      `).bind(startDateStr).all()

      // Calculate NPS
      const totalSurveys = overallMetrics?.total_surveys || 0
      const promoters = overallMetrics?.promoters || 0
      const detractors = overallMetrics?.detractors || 0
      const npsScore = totalSurveys > 0 ? ((promoters - detractors) / totalSurveys) * 100 : 0

      // Satisfaction trend
      const trend = await this.db.prepare(`
        SELECT 
          DATE(completed_at) as date,
          AVG(overall_rating) as avg_rating,
          COUNT(*) as survey_count
        FROM satisfaction_surveys
        WHERE completed_at >= ?
        GROUP BY DATE(completed_at)
        ORDER BY date
      `).bind(startDateStr).all()

      return {
        period: { days, start: startDateStr },
        overall: {
          ...overallMetrics,
          nps_score: Math.round(npsScore * 10) / 10,
          satisfaction_rate: totalSurveys > 0 ? ((overallMetrics?.satisfied_count || 0) / totalSurveys) * 100 : 0
        },
        by_type: byType.results || [],
        trend: trend.results || []
      }

    } catch (error) {
      this.logger.error('Error getting satisfaction analytics:', error)
      return null
    }
  }

  /**
   * Check for performance alerts
   */
  private async checkPerformanceAlerts(metrics: Partial<PlatformPerformanceMetrics>): Promise<void> {
    try {
      const alerts: PerformanceAlert[] = []

      // Response time alert
      if (metrics.responseTimeAvg && metrics.responseTimeAvg > 1000) {
        alerts.push({
          alertType: 'performance_degradation',
          severity: metrics.responseTimeAvg > 3000 ? 'critical' : 'high',
          message: `Average response time is ${metrics.responseTimeAvg}ms`,
          metrics: { response_time: metrics.responseTimeAvg },
          threshold: 1000,
          currentValue: metrics.responseTimeAvg
        })
      }

      // Error rate alert
      if (metrics.errorRate && metrics.errorRate > 5) {
        alerts.push({
          alertType: 'high_error_rate',
          severity: metrics.errorRate > 15 ? 'critical' : 'high',
          message: `Error rate is ${metrics.errorRate}%`,
          metrics: { error_rate: metrics.errorRate },
          threshold: 5,
          currentValue: metrics.errorRate
        })
      }

      // Uptime alert
      if (metrics.uptimePercentage && metrics.uptimePercentage < 99) {
        alerts.push({
          alertType: 'performance_degradation',
          severity: metrics.uptimePercentage < 95 ? 'critical' : 'medium',
          message: `Uptime is ${metrics.uptimePercentage}%`,
          metrics: { uptime: metrics.uptimePercentage },
          threshold: 99,
          currentValue: metrics.uptimePercentage
        })
      }

      // Log alerts (in a real system, these would trigger notifications)
      for (const alert of alerts) {
        this.logger.warn(`Performance Alert [${alert.severity}]: ${alert.message}`)
      }

    } catch (error) {
      this.logger.error('Error checking performance alerts:', error)
    }
  }

  /**
   * Generate survey ID
   */
  private generateSurveyId(): string {
    return `survey_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * Get performance trends
   */
  async getPerformanceTrends(days: number = 30): Promise<any> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString().split('T')[0]

      // Job performance trends
      const jobTrends = await this.db.prepare(`
        SELECT 
          metric_date,
          AVG(completion_rate) as completion_rate,
          AVG(client_satisfaction_avg) as client_satisfaction,
          AVG(worker_satisfaction_avg) as worker_satisfaction,
          SUM(jobs_posted) as jobs_posted,
          SUM(jobs_completed) as jobs_completed
        FROM job_performance_metrics
        WHERE metric_date >= ?
        GROUP BY metric_date
        ORDER BY metric_date
      `).bind(startDateStr).all()

      // Platform performance trends
      const platformTrends = await this.db.prepare(`
        SELECT 
          DATE(metric_timestamp) as date,
          AVG(response_time_avg) as avg_response_time,
          AVG(error_rate) as avg_error_rate,
          SUM(request_count) as total_requests
        FROM platform_performance_metrics
        WHERE metric_timestamp >= ?
        GROUP BY DATE(metric_timestamp)
        ORDER BY date
      `).bind(startDateStr).all()

      return {
        period: { days, start: startDateStr },
        job_trends: jobTrends.results || [],
        platform_trends: platformTrends.results || []
      }

    } catch (error) {
      this.logger.error('Error getting performance trends:', error)
      return null
    }
  }

  /**
   * Clean up old performance data
   */
  async cleanupOldPerformanceData(retentionDays: number = 90): Promise<{ success: boolean; deletedCount: number }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
      const cutoffDateStr = cutoffDate.toISOString()

      // Delete old platform metrics
      const platformResult = await this.db.prepare(`
        DELETE FROM platform_performance_metrics WHERE metric_timestamp < ?
      `).bind(cutoffDateStr).run()

      // Delete old satisfaction surveys
      const surveyResult = await this.db.prepare(`
        DELETE FROM satisfaction_surveys WHERE completed_at < ?
      `).bind(cutoffDateStr).run()

      const totalDeleted = (platformResult.changes || 0) + (surveyResult.changes || 0)

      this.logger.info(`Cleaned up ${totalDeleted} old performance records`)
      return { success: true, deletedCount: totalDeleted }

    } catch (error) {
      this.logger.error('Error cleaning up old performance data:', error)
      return { success: false, deletedCount: 0 }
    }
  }
}