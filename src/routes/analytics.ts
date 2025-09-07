/**
 * Analytics API Routes - Comprehensive analytics and reporting endpoints
 * 
 * This module provides API endpoints for:
 * - Analytics event tracking and user analytics
 * - Business intelligence and revenue analytics
 * - Performance metrics and satisfaction tracking
 * - Custom reports generation and management
 * - Predictive analytics and forecasting
 * - Real-time dashboards and data export
 */

import { Hono } from 'hono'
import { AnalyticsService } from '../services/AnalyticsService'
import { BusinessIntelligenceService } from '../services/BusinessIntelligenceService'
import { PerformanceMetricsService } from '../services/PerformanceMetricsService'
import { ReportingService } from '../services/ReportingService'
import { PredictiveAnalyticsService } from '../services/PredictiveAnalyticsService'

type Bindings = {
  DB: D1Database
}

const analytics = new Hono<{ Bindings: Bindings }>()

// ================================================================================================
// ANALYTICS EVENT TRACKING
// ================================================================================================

/**
 * Track a single analytics event
 * POST /api/analytics/events
 */
analytics.post('/events', async (c) => {
  try {
    const analyticsService = new AnalyticsService(c.env.DB)
    const eventData = await c.req.json()

    const result = await analyticsService.trackEvent(eventData)
    
    if (result.success) {
      return c.json({ 
        success: true, 
        eventId: result.eventId,
        message: 'Event tracked successfully' 
      })
    } else {
      return c.json({ 
        success: false, 
        error: 'Failed to track event' 
      }, 500)
    }

  } catch (error) {
    console.error('Error tracking event:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Track multiple events in batch
 * POST /api/analytics/events/batch
 */
analytics.post('/events/batch', async (c) => {
  try {
    const analyticsService = new AnalyticsService(c.env.DB)
    const { events } = await c.req.json()

    const result = await analyticsService.trackEventsBatch(events)
    
    return c.json({
      success: result.success,
      trackedCount: result.trackedCount,
      totalEvents: events.length
    })

  } catch (error) {
    console.error('Error tracking batch events:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get analytics events with filters
 * GET /api/analytics/events
 */
analytics.get('/events', async (c) => {
  try {
    const analyticsService = new AnalyticsService(c.env.DB)
    
    const query = {
      startDate: c.req.query('startDate'),
      endDate: c.req.query('endDate'),
      userId: c.req.query('userId') ? parseInt(c.req.query('userId')!) : undefined,
      eventType: c.req.query('eventType'),
      eventCategory: c.req.query('eventCategory'),
      limit: c.req.query('limit') ? parseInt(c.req.query('limit')!) : 100,
      offset: c.req.query('offset') ? parseInt(c.req.query('offset')!) : 0
    }

    const events = await analyticsService.getEvents(query)
    
    return c.json({
      success: true,
      events,
      count: events.length
    })

  } catch (error) {
    console.error('Error getting analytics events:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get user engagement summary
 * GET /api/analytics/users/:userId/engagement
 */
analytics.get('/users/:userId/engagement', async (c) => {
  try {
    const analyticsService = new AnalyticsService(c.env.DB)
    const userId = parseInt(c.req.param('userId'))
    const days = c.req.query('days') ? parseInt(c.req.query('days')!) : 30

    const summary = await analyticsService.getUserEngagementSummary(userId, days)
    
    return c.json({
      success: true,
      engagement: summary
    })

  } catch (error) {
    console.error('Error getting user engagement:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get registration funnel analytics
 * GET /api/analytics/funnel/registration
 */
analytics.get('/funnel/registration', async (c) => {
  try {
    const analyticsService = new AnalyticsService(c.env.DB)
    const days = c.req.query('days') ? parseInt(c.req.query('days')!) : 30

    const funnelData = await analyticsService.getRegistrationFunnelAnalytics(days)
    
    return c.json({
      success: true,
      funnel: funnelData
    })

  } catch (error) {
    console.error('Error getting registration funnel:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

// ================================================================================================
// BUSINESS INTELLIGENCE
// ================================================================================================

/**
 * Calculate revenue metrics for a specific date
 * POST /api/analytics/business/revenue/calculate
 */
analytics.post('/business/revenue/calculate', async (c) => {
  try {
    const biService = new BusinessIntelligenceService(c.env.DB)
    const { date } = await c.req.json()

    const result = await biService.calculateDailyRevenueMetrics(date)
    
    return c.json({
      success: result.success,
      metrics: result.metrics
    })

  } catch (error) {
    console.error('Error calculating revenue metrics:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Calculate growth metrics for a specific date
 * POST /api/analytics/business/growth/calculate
 */
analytics.post('/business/growth/calculate', async (c) => {
  try {
    const biService = new BusinessIntelligenceService(c.env.DB)
    const { date } = await c.req.json()

    const result = await biService.calculateDailyGrowthMetrics(date)
    
    return c.json({
      success: result.success,
      metrics: result.metrics
    })

  } catch (error) {
    console.error('Error calculating growth metrics:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get revenue analytics for date range
 * GET /api/analytics/business/revenue
 */
analytics.get('/business/revenue', async (c) => {
  try {
    const biService = new BusinessIntelligenceService(c.env.DB)
    const startDate = c.req.query('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = c.req.query('endDate') || new Date().toISOString().split('T')[0]
    const metricType = c.req.query('metricType') as 'daily' | 'weekly' | 'monthly' || 'daily'

    const analytics = await biService.getRevenueAnalytics(startDate, endDate, metricType)
    
    return c.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Error getting revenue analytics:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get KPI dashboard data
 * GET /api/analytics/business/kpi
 */
analytics.get('/business/kpi', async (c) => {
  try {
    const biService = new BusinessIntelligenceService(c.env.DB)
    const days = c.req.query('days') ? parseInt(c.req.query('days')!) : 30

    const dashboard = await biService.getKPIDashboard(days)
    
    return c.json({
      success: true,
      dashboard
    })

  } catch (error) {
    console.error('Error getting KPI dashboard:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get customer segments analysis
 * GET /api/analytics/business/segments
 */
analytics.get('/business/segments', async (c) => {
  try {
    const biService = new BusinessIntelligenceService(c.env.DB)

    const segments = await biService.getCustomerSegments()
    
    return c.json({
      success: true,
      segments
    })

  } catch (error) {
    console.error('Error getting customer segments:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

// ================================================================================================
// PERFORMANCE METRICS
// ================================================================================================

/**
 * Calculate job performance metrics
 * POST /api/analytics/performance/jobs/calculate
 */
analytics.post('/performance/jobs/calculate', async (c) => {
  try {
    const performanceService = new PerformanceMetricsService(c.env.DB)
    const { date, category, subcategory } = await c.req.json()

    const result = await performanceService.calculateJobPerformanceMetrics(date, category, subcategory)
    
    return c.json({
      success: result.success,
      metrics: result.metrics
    })

  } catch (error) {
    console.error('Error calculating job performance metrics:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Record platform performance metrics
 * POST /api/analytics/performance/platform
 */
analytics.post('/performance/platform', async (c) => {
  try {
    const performanceService = new PerformanceMetricsService(c.env.DB)
    const metrics = await c.req.json()

    const result = await performanceService.recordPlatformPerformanceMetrics(metrics)
    
    return c.json({
      success: result.success
    })

  } catch (error) {
    console.error('Error recording platform performance metrics:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Submit satisfaction survey
 * POST /api/analytics/performance/satisfaction
 */
analytics.post('/performance/satisfaction', async (c) => {
  try {
    const performanceService = new PerformanceMetricsService(c.env.DB)
    const survey = await c.req.json()

    const result = await performanceService.submitSatisfactionSurvey(survey)
    
    return c.json({
      success: result.success,
      surveyId: result.surveyId
    })

  } catch (error) {
    console.error('Error submitting satisfaction survey:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get performance dashboard
 * GET /api/analytics/performance/dashboard
 */
analytics.get('/performance/dashboard', async (c) => {
  try {
    const performanceService = new PerformanceMetricsService(c.env.DB)
    const hours = c.req.query('hours') ? parseInt(c.req.query('hours')!) : 24

    const dashboard = await performanceService.getPerformanceDashboard(hours)
    
    return c.json({
      success: true,
      dashboard
    })

  } catch (error) {
    console.error('Error getting performance dashboard:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get job category performance
 * GET /api/analytics/performance/categories
 */
analytics.get('/performance/categories', async (c) => {
  try {
    const performanceService = new PerformanceMetricsService(c.env.DB)
    const days = c.req.query('days') ? parseInt(c.req.query('days')!) : 30

    const performance = await performanceService.getJobCategoryPerformance(days)
    
    return c.json({
      success: true,
      performance
    })

  } catch (error) {
    console.error('Error getting job category performance:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get satisfaction analytics
 * GET /api/analytics/performance/satisfaction
 */
analytics.get('/performance/satisfaction', async (c) => {
  try {
    const performanceService = new PerformanceMetricsService(c.env.DB)
    const days = c.req.query('days') ? parseInt(c.req.query('days')!) : 30

    const analytics = await performanceService.getSatisfactionAnalytics(days)
    
    return c.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Error getting satisfaction analytics:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

// ================================================================================================
// CUSTOM REPORTS
// ================================================================================================

/**
 * Create custom report
 * POST /api/analytics/reports
 */
analytics.post('/reports', async (c) => {
  try {
    const reportingService = new ReportingService(c.env.DB)
    const reportData = await c.req.json()

    const result = await reportingService.createCustomReport(reportData)
    
    return c.json({
      success: result.success,
      reportId: result.reportId
    })

  } catch (error) {
    console.error('Error creating custom report:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Generate report from definition
 * POST /api/analytics/reports/:reportId/generate
 */
analytics.post('/reports/:reportId/generate', async (c) => {
  try {
    const reportingService = new ReportingService(c.env.DB)
    const reportId = c.req.param('reportId')
    const { parameters, userId } = await c.req.json()

    const result = await reportingService.generateReport(reportId, parameters, userId)
    
    return c.json({
      success: result.success,
      reportInstanceId: result.reportInstanceId,
      data: result.data
    })

  } catch (error) {
    console.error('Error generating report:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Export report to CSV
 * GET /api/analytics/reports/:instanceId/export/csv
 */
analytics.get('/reports/:instanceId/export/csv', async (c) => {
  try {
    const reportingService = new ReportingService(c.env.DB)
    const instanceId = c.req.param('instanceId')

    const result = await reportingService.exportReportToCSV(instanceId)
    
    if (result.success) {
      c.header('Content-Type', 'text/csv')
      c.header('Content-Disposition', `attachment; filename="report_${instanceId}.csv"`)
      return c.text(result.csvData || '')
    } else {
      return c.json({ 
        success: false, 
        error: 'Failed to export report' 
      }, 500)
    }

  } catch (error) {
    console.error('Error exporting report:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get report templates
 * GET /api/analytics/reports/templates
 */
analytics.get('/reports/templates', async (c) => {
  try {
    const reportingService = new ReportingService(c.env.DB)

    const templates = await reportingService.getReportTemplates()
    
    return c.json({
      success: true,
      templates
    })

  } catch (error) {
    console.error('Error getting report templates:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get user reports
 * GET /api/analytics/reports/user/:userId
 */
analytics.get('/reports/user/:userId', async (c) => {
  try {
    const reportingService = new ReportingService(c.env.DB)
    const userId = parseInt(c.req.param('userId'))
    const includePublic = c.req.query('includePublic') !== 'false'

    const reports = await reportingService.getUserReports(userId, includePublic)
    
    return c.json({
      success: true,
      reports
    })

  } catch (error) {
    console.error('Error getting user reports:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Generate standard user analytics report
 * POST /api/analytics/reports/standard/user-analytics
 */
analytics.post('/reports/standard/user-analytics', async (c) => {
  try {
    const reportingService = new ReportingService(c.env.DB)
    const { dateRange } = await c.req.json()

    const result = await reportingService.generateUserAnalyticsReport(dateRange)
    
    return c.json({
      success: result.success,
      data: result.data
    })

  } catch (error) {
    console.error('Error generating user analytics report:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Generate standard revenue report
 * POST /api/analytics/reports/standard/revenue
 */
analytics.post('/reports/standard/revenue', async (c) => {
  try {
    const reportingService = new ReportingService(c.env.DB)
    const { dateRange } = await c.req.json()

    const result = await reportingService.generateRevenueReport(dateRange)
    
    return c.json({
      success: result.success,
      data: result.data
    })

  } catch (error) {
    console.error('Error generating revenue report:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

// ================================================================================================
// PREDICTIVE ANALYTICS
// ================================================================================================

/**
 * Generate job demand forecast
 * POST /api/analytics/forecast/job-demand
 */
analytics.post('/forecast/job-demand', async (c) => {
  try {
    const predictiveService = new PredictiveAnalyticsService(c.env.DB)
    const { category, days } = await c.req.json()

    const result = await predictiveService.generateJobDemandForecast(category, days)
    
    return c.json({
      success: result.success,
      forecasts: result.forecasts
    })

  } catch (error) {
    console.error('Error generating job demand forecast:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Generate user growth forecast
 * POST /api/analytics/forecast/user-growth
 */
analytics.post('/forecast/user-growth', async (c) => {
  try {
    const predictiveService = new PredictiveAnalyticsService(c.env.DB)
    const { days } = await c.req.json()

    const result = await predictiveService.generateUserGrowthForecast(days)
    
    return c.json({
      success: result.success,
      forecasts: result.forecasts
    })

  } catch (error) {
    console.error('Error generating user growth forecast:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Analyze trends
 * POST /api/analytics/trends/analyze
 */
analytics.post('/trends/analyze', async (c) => {
  try {
    const predictiveService = new PredictiveAnalyticsService(c.env.DB)
    const { metricName, analysisType, days } = await c.req.json()

    const result = await predictiveService.analyzeTrends(metricName, analysisType, days)
    
    return c.json({
      success: result.success,
      analysis: result.analysis
    })

  } catch (error) {
    console.error('Error analyzing trends:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get demand forecasts
 * GET /api/analytics/forecast/:forecastType
 */
analytics.get('/forecast/:forecastType', async (c) => {
  try {
    const predictiveService = new PredictiveAnalyticsService(c.env.DB)
    const forecastType = c.req.param('forecastType')
    const category = c.req.query('category')
    const days = c.req.query('days') ? parseInt(c.req.query('days')!) : 7

    const forecasts = await predictiveService.getDemandForecasts(forecastType, category, days)
    
    return c.json({
      success: true,
      forecasts
    })

  } catch (error) {
    console.error('Error getting demand forecasts:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get trend analyses
 * GET /api/analytics/trends
 */
analytics.get('/trends', async (c) => {
  try {
    const predictiveService = new PredictiveAnalyticsService(c.env.DB)
    const analysisType = c.req.query('analysisType')
    const days = c.req.query('days') ? parseInt(c.req.query('days')!) : 30

    const analyses = await predictiveService.getTrendAnalyses(analysisType, days)
    
    return c.json({
      success: true,
      analyses
    })

  } catch (error) {
    console.error('Error getting trend analyses:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get prediction with caching
 * POST /api/analytics/predict
 */
analytics.post('/predict', async (c) => {
  try {
    const predictiveService = new PredictiveAnalyticsService(c.env.DB)
    const { modelId, inputFeatures } = await c.req.json()

    const result = await predictiveService.getPrediction(modelId, inputFeatures)
    
    return c.json({
      success: result.success,
      prediction: result.prediction,
      fromCache: result.fromCache
    })

  } catch (error) {
    console.error('Error getting prediction:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

// ================================================================================================
// REAL-TIME DASHBOARD
// ================================================================================================

/**
 * Get real-time dashboard data
 * GET /api/analytics/dashboard/realtime
 */
analytics.get('/dashboard/realtime', async (c) => {
  try {
    const analyticsService = new AnalyticsService(c.env.DB)

    const dashboard = await analyticsService.getRealTimeDashboard()
    
    return c.json({
      success: true,
      dashboard
    })

  } catch (error) {
    console.error('Error getting real-time dashboard:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

/**
 * Get performance trends
 * GET /api/analytics/dashboard/trends
 */
analytics.get('/dashboard/trends', async (c) => {
  try {
    const performanceService = new PerformanceMetricsService(c.env.DB)
    const days = c.req.query('days') ? parseInt(c.req.query('days')!) : 30

    const trends = await performanceService.getPerformanceTrends(days)
    
    return c.json({
      success: true,
      trends
    })

  } catch (error) {
    console.error('Error getting performance trends:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

// ================================================================================================
// UTILITY ENDPOINTS
// ================================================================================================

/**
 * Health check endpoint
 * GET /api/analytics/health
 */
analytics.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'analytics',
    timestamp: new Date().toISOString()
  })
})

/**
 * Cleanup old data
 * POST /api/analytics/cleanup
 */
analytics.post('/cleanup', async (c) => {
  try {
    const { retentionDays } = await c.req.json()
    const analyticsService = new AnalyticsService(c.env.DB)
    const performanceService = new PerformanceMetricsService(c.env.DB)
    const reportingService = new ReportingService(c.env.DB)

    const analyticsCleanup = await analyticsService.cleanupOldData(retentionDays)
    const performanceCleanup = await performanceService.cleanupOldPerformanceData(retentionDays)
    const reportsCleanup = await reportingService.cleanupExpiredReports()

    return c.json({
      success: true,
      cleanup: {
        analytics: analyticsCleanup,
        performance: performanceCleanup,
        reports: reportsCleanup
      }
    })

  } catch (error) {
    console.error('Error during cleanup:', error)
    return c.json({ 
      success: false, 
      error: 'Internal server error' 
    }, 500)
  }
})

export default analytics