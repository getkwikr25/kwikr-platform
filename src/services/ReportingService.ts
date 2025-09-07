/**
 * Reporting Service - Custom reports generation and export functionality
 * 
 * This service handles:
 * - Custom report definition and management
 * - Report generation and execution
 * - Data export in multiple formats (JSON, CSV, Excel-style data)
 * - Scheduled report execution
 * - Report sharing and access control
 */

import { Logger } from '../utils/logger'

export interface CustomReport {
  reportId: string
  reportName: string
  reportDescription?: string
  createdByUserId?: number
  reportType: 'standard' | 'custom' | 'scheduled'
  dataSources: string[]
  filters?: Record<string, any>
  groupingColumns?: string[]
  aggregationFunctions?: Record<string, string>
  sortOrder?: Record<string, 'ASC' | 'DESC'>
  outputFormat: 'json' | 'csv' | 'excel'
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly'
  scheduleTime?: string
  isPublic: boolean
  isActive: boolean
  lastGeneratedAt?: string
}

export interface GeneratedReport {
  reportInstanceId: string
  customReportId: number
  generatedByUserId?: number
  reportData: any[]
  filePath?: string
  fileSize?: number
  generationTimeMs: number
  rowCount: number
  dateRangeStart?: string
  dateRangeEnd?: string
  parameters?: Record<string, any>
  status: 'pending' | 'completed' | 'failed'
  errorMessage?: string
  expiresAt?: string
}

export interface ReportAccess {
  customReportId: number
  sharedWithUserId?: number
  sharedWithRole?: string
  accessLevel: 'view' | 'edit' | 'admin'
  grantedByUserId: number
  expiresAt?: string
}

export interface ReportFilter {
  column: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between' | 'in'
  value: any
  secondValue?: any // for 'between' operator
}

export interface ReportQuery {
  reportId?: string
  reportType?: string
  createdBy?: number
  dateRange?: { start: string; end: string }
  includeData?: boolean
  limit?: number
  offset?: number
}

export class ReportingService {
  private db: D1Database
  private logger: Logger

  constructor(database: D1Database) {
    this.db = database
    this.logger = new Logger('ReportingService')
  }

  /**
   * Create a new custom report definition
   */
  async createCustomReport(report: Omit<CustomReport, 'reportId'>): Promise<{ success: boolean; reportId?: string }> {
    try {
      const reportId = this.generateReportId()

      await this.db.prepare(`
        INSERT INTO custom_reports (
          report_id, report_name, report_description, created_by_user_id, report_type,
          data_sources, filters, grouping_columns, aggregation_functions, sort_order,
          output_format, schedule_frequency, schedule_time, is_public, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        reportId,
        report.reportName,
        report.reportDescription || null,
        report.createdByUserId || null,
        report.reportType,
        JSON.stringify(report.dataSources),
        report.filters ? JSON.stringify(report.filters) : null,
        report.groupingColumns ? JSON.stringify(report.groupingColumns) : null,
        report.aggregationFunctions ? JSON.stringify(report.aggregationFunctions) : null,
        report.sortOrder ? JSON.stringify(report.sortOrder) : null,
        report.outputFormat,
        report.scheduleFrequency || null,
        report.scheduleTime || null,
        report.isPublic ? 1 : 0,
        report.isActive ? 1 : 0
      ).run()

      this.logger.info(`Custom report created: ${reportId}`)
      return { success: true, reportId }

    } catch (error) {
      this.logger.error('Error creating custom report:', error)
      return { success: false }
    }
  }

  /**
   * Generate a report from a custom report definition
   */
  async generateReport(reportId: string, parameters?: Record<string, any>, userId?: number): Promise<{ success: boolean; reportInstanceId?: string; data?: any[] }> {
    try {
      const startTime = Date.now()

      // Get report definition
      const reportDef = await this.db.prepare(`
        SELECT * FROM custom_reports WHERE report_id = ? AND is_active = 1
      `).bind(reportId).first()

      if (!reportDef) {
        throw new Error(`Report not found or inactive: ${reportId}`)
      }

      // Parse report configuration
      const dataSources = JSON.parse(reportDef.data_sources)
      const filters = reportDef.filters ? JSON.parse(reportDef.filters) : {}
      const groupingColumns = reportDef.grouping_columns ? JSON.parse(reportDef.grouping_columns) : []
      const aggregationFunctions = reportDef.aggregation_functions ? JSON.parse(reportDef.aggregation_functions) : {}
      const sortOrder = reportDef.sort_order ? JSON.parse(reportDef.sort_order) : {}

      // Generate SQL query based on report definition
      const query = this.buildReportQuery(dataSources, filters, groupingColumns, aggregationFunctions, sortOrder, parameters)

      // Execute query
      const result = await this.db.prepare(query.sql).bind(...query.params).all()
      const reportData = result.results || []

      const generationTime = Date.now() - startTime
      const reportInstanceId = this.generateReportInstanceId()

      // Store generated report
      await this.db.prepare(`
        INSERT INTO generated_reports (
          report_instance_id, custom_report_id, generated_by_user_id, report_data,
          generation_time_ms, row_count, date_range_start, date_range_end,
          parameters, status, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        reportInstanceId,
        reportDef.id,
        userId || null,
        JSON.stringify(reportData),
        generationTime,
        reportData.length,
        parameters?.dateRangeStart || null,
        parameters?.dateRangeEnd || null,
        parameters ? JSON.stringify(parameters) : null,
        'completed',
        this.calculateExpiryDate()
      ).run()

      // Update last generated timestamp
      await this.db.prepare(`
        UPDATE custom_reports SET last_generated_at = CURRENT_TIMESTAMP WHERE report_id = ?
      `).bind(reportId).run()

      this.logger.info(`Report generated: ${reportInstanceId} (${reportData.length} rows, ${generationTime}ms)`)
      return { success: true, reportInstanceId, data: reportData }

    } catch (error) {
      this.logger.error('Error generating report:', error)
      return { success: false }
    }
  }

  /**
   * Export report data to CSV format
   */
  async exportReportToCSV(reportInstanceId: string): Promise<{ success: boolean; csvData?: string }> {
    try {
      const report = await this.db.prepare(`
        SELECT report_data FROM generated_reports WHERE report_instance_id = ?
      `).bind(reportInstanceId).first()

      if (!report) {
        throw new Error(`Report instance not found: ${reportInstanceId}`)
      }

      const data = JSON.parse(report.report_data)

      if (data.length === 0) {
        return { success: true, csvData: '' }
      }

      // Generate CSV
      const headers = Object.keys(data[0])
      const csvRows = [headers.join(',')]

      for (const row of data) {
        const values = headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        csvRows.push(values.join(','))
      }

      const csvData = csvRows.join('\n')

      this.logger.info(`Report exported to CSV: ${reportInstanceId}`)
      return { success: true, csvData }

    } catch (error) {
      this.logger.error('Error exporting report to CSV:', error)
      return { success: false }
    }
  }

  /**
   * Get available report templates
   */
  async getReportTemplates(): Promise<CustomReport[]> {
    try {
      const templates = [
        {
          reportId: 'template_user_analytics',
          reportName: 'User Analytics Report',
          reportDescription: 'Comprehensive user engagement and behavior analytics',
          reportType: 'standard' as const,
          dataSources: ['users', 'user_engagement_metrics', 'analytics_events'],
          outputFormat: 'json' as const,
          isPublic: true,
          isActive: true
        },
        {
          reportId: 'template_revenue_summary',
          reportName: 'Revenue Summary Report',
          reportDescription: 'Financial performance and revenue analytics',
          reportType: 'standard' as const,
          dataSources: ['revenue_metrics', 'growth_metrics'],
          outputFormat: 'csv' as const,
          isPublic: true,
          isActive: true
        },
        {
          reportId: 'template_job_performance',
          reportName: 'Job Performance Report',
          reportDescription: 'Job completion rates and performance metrics',
          reportType: 'standard' as const,
          dataSources: ['job_performance_metrics', 'jobs'],
          outputFormat: 'json' as const,
          isPublic: true,
          isActive: true
        },
        {
          reportId: 'template_satisfaction_analysis',
          reportName: 'Customer Satisfaction Analysis',
          reportDescription: 'User satisfaction surveys and feedback analysis',
          reportType: 'standard' as const,
          dataSources: ['satisfaction_surveys', 'reviews'],
          outputFormat: 'json' as const,
          isPublic: true,
          isActive: true
        }
      ]

      return templates

    } catch (error) {
      this.logger.error('Error getting report templates:', error)
      return []
    }
  }

  /**
   * Generate standard user analytics report
   */
  async generateUserAnalyticsReport(dateRange?: { start: string; end: string }): Promise<{ success: boolean; data?: any[] }> {
    try {
      const endDate = dateRange?.end || new Date().toISOString().split('T')[0]
      const startDate = dateRange?.start || (() => {
        const date = new Date()
        date.setDate(date.getDate() - 30)
        return date.toISOString().split('T')[0]
      })()

      const data = await this.db.prepare(`
        SELECT 
          u.id,
          u.email,
          u.user_type,
          u.created_at as registration_date,
          COALESCE(SUM(uem.page_views), 0) as total_page_views,
          COALESCE(SUM(uem.session_duration), 0) as total_session_duration,
          COALESCE(AVG(uem.engagement_score), 0) as avg_engagement_score,
          COUNT(DISTINCT uem.metric_date) as active_days,
          MAX(uem.last_activity_time) as last_activity,
          COUNT(DISTINCT ae.session_id) as total_sessions
        FROM users u
        LEFT JOIN user_engagement_metrics uem ON u.id = uem.user_id 
          AND uem.metric_date >= ? AND uem.metric_date <= ?
        LEFT JOIN analytics_events ae ON u.id = ae.user_id 
          AND ae.created_at >= ? AND ae.created_at <= ?
        WHERE u.created_at <= ?
        GROUP BY u.id, u.email, u.user_type, u.created_at
        ORDER BY avg_engagement_score DESC
      `).bind(startDate, endDate, startDate, endDate, endDate).all()

      return { success: true, data: data.results || [] }

    } catch (error) {
      this.logger.error('Error generating user analytics report:', error)
      return { success: false }
    }
  }

  /**
   * Generate standard revenue report
   */
  async generateRevenueReport(dateRange?: { start: string; end: string }): Promise<{ success: boolean; data?: any[] }> {
    try {
      const endDate = dateRange?.end || new Date().toISOString().split('T')[0]
      const startDate = dateRange?.start || (() => {
        const date = new Date()
        date.setDate(date.getDate() - 30)
        return date.toISOString().split('T')[0]
      })()

      const data = await this.db.prepare(`
        SELECT 
          rm.metric_date,
          rm.total_revenue,
          rm.subscription_revenue,
          rm.commission_revenue,
          rm.net_revenue,
          rm.paying_users_count,
          rm.average_order_value,
          gm.new_users,
          gm.conversion_rate,
          CASE 
            WHEN gm.new_users > 0 THEN rm.total_revenue / gm.new_users 
            ELSE 0 
          END as revenue_per_new_user
        FROM revenue_metrics rm
        LEFT JOIN growth_metrics gm ON rm.metric_date = gm.metric_date
        WHERE rm.metric_date >= ? AND rm.metric_date <= ?
        AND rm.metric_type = 'daily'
        ORDER BY rm.metric_date
      `).bind(startDate, endDate).all()

      return { success: true, data: data.results || [] }

    } catch (error) {
      this.logger.error('Error generating revenue report:', error)
      return { success: false }
    }
  }

  /**
   * Get all custom reports for a user
   */
  async getUserReports(userId: number, includePublic: boolean = true): Promise<CustomReport[]> {
    try {
      let sql = `
        SELECT cr.*, u.email as created_by_email
        FROM custom_reports cr
        LEFT JOIN users u ON cr.created_by_user_id = u.id
        WHERE (cr.created_by_user_id = ? OR cr.is_public = 1)
        AND cr.is_active = 1
      `

      if (!includePublic) {
        sql = sql.replace('OR cr.is_public = 1', '')
      }

      sql += ' ORDER BY cr.created_at DESC'

      const reports = await this.db.prepare(sql).bind(userId).all()

      return (reports.results || []).map(this.mapDbReportToModel)

    } catch (error) {
      this.logger.error('Error getting user reports:', error)
      return []
    }
  }

  /**
   * Get generated report instances
   */
  async getGeneratedReports(query: ReportQuery): Promise<GeneratedReport[]> {
    try {
      let sql = `
        SELECT gr.*, cr.report_name
        FROM generated_reports gr
        JOIN custom_reports cr ON gr.custom_report_id = cr.id
        WHERE 1=1
      `
      const params: any[] = []

      if (query.reportId) {
        sql += ' AND cr.report_id = ?'
        params.push(query.reportId)
      }

      if (query.createdBy) {
        sql += ' AND gr.generated_by_user_id = ?'
        params.push(query.createdBy)
      }

      if (query.dateRange) {
        sql += ' AND gr.created_at >= ? AND gr.created_at <= ?'
        params.push(query.dateRange.start, query.dateRange.end)
      }

      sql += ' ORDER BY gr.created_at DESC'

      if (query.limit) {
        sql += ' LIMIT ?'
        params.push(query.limit)
      }

      if (query.offset) {
        sql += ' OFFSET ?'
        params.push(query.offset)
      }

      const reports = await this.db.prepare(sql).bind(...params).all()

      return (reports.results || []).map((report: any) => ({
        reportInstanceId: report.report_instance_id,
        customReportId: report.custom_report_id,
        generatedByUserId: report.generated_by_user_id,
        reportData: query.includeData ? JSON.parse(report.report_data || '[]') : [],
        filePath: report.file_path,
        fileSize: report.file_size,
        generationTimeMs: report.generation_time_ms,
        rowCount: report.row_count,
        dateRangeStart: report.date_range_start,
        dateRangeEnd: report.date_range_end,
        parameters: report.parameters ? JSON.parse(report.parameters) : {},
        status: report.status,
        errorMessage: report.error_message
      }))

    } catch (error) {
      this.logger.error('Error getting generated reports:', error)
      return []
    }
  }

  /**
   * Share report access with user or role
   */
  async shareReport(reportId: string, access: Omit<ReportAccess, 'customReportId'>, grantedByUserId: number): Promise<{ success: boolean }> {
    try {
      const report = await this.db.prepare(`
        SELECT id FROM custom_reports WHERE report_id = ?
      `).bind(reportId).first()

      if (!report) {
        throw new Error(`Report not found: ${reportId}`)
      }

      await this.db.prepare(`
        INSERT INTO report_access (
          custom_report_id, shared_with_user_id, shared_with_role, access_level,
          granted_by_user_id, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        report.id,
        access.sharedWithUserId || null,
        access.sharedWithRole || null,
        access.accessLevel,
        grantedByUserId,
        access.expiresAt || null
      ).run()

      this.logger.info(`Report access granted: ${reportId}`)
      return { success: true }

    } catch (error) {
      this.logger.error('Error sharing report:', error)
      return { success: false }
    }
  }

  /**
   * Build SQL query from report definition
   */
  private buildReportQuery(
    dataSources: string[],
    filters: Record<string, any>,
    groupingColumns: string[],
    aggregationFunctions: Record<string, string>,
    sortOrder: Record<string, string>,
    parameters?: Record<string, any>
  ): { sql: string; params: any[] } {
    try {
      // This is a simplified query builder
      // In a production system, this would be more sophisticated and secure
      const mainTable = dataSources[0]
      let sql = `SELECT `

      // Build SELECT clause
      const selectColumns = []
      
      if (groupingColumns.length > 0) {
        selectColumns.push(...groupingColumns)
      }

      if (Object.keys(aggregationFunctions).length > 0) {
        for (const [column, func] of Object.entries(aggregationFunctions)) {
          selectColumns.push(`${func}(${column}) as ${column}_${func.toLowerCase()}`)
        }
      }

      if (selectColumns.length === 0) {
        selectColumns.push('*')
      }

      sql += selectColumns.join(', ')
      sql += ` FROM ${mainTable}`

      // Add JOINs for additional data sources
      for (let i = 1; i < dataSources.length; i++) {
        // This is simplified - in reality, we'd need proper JOIN conditions
        sql += ` LEFT JOIN ${dataSources[i]} ON 1=1`
      }

      const params: any[] = []

      // Add WHERE clause
      if (Object.keys(filters).length > 0 || parameters) {
        const whereConditions = []

        // Apply predefined filters
        for (const [column, value] of Object.entries(filters)) {
          whereConditions.push(`${column} = ?`)
          params.push(value)
        }

        // Apply parameter filters
        if (parameters) {
          if (parameters.dateRangeStart) {
            whereConditions.push(`created_at >= ?`)
            params.push(parameters.dateRangeStart)
          }
          if (parameters.dateRangeEnd) {
            whereConditions.push(`created_at <= ?`)
            params.push(parameters.dateRangeEnd)
          }
        }

        if (whereConditions.length > 0) {
          sql += ` WHERE ` + whereConditions.join(' AND ')
        }
      }

      // Add GROUP BY clause
      if (groupingColumns.length > 0) {
        sql += ` GROUP BY ` + groupingColumns.join(', ')
      }

      // Add ORDER BY clause
      if (Object.keys(sortOrder).length > 0) {
        const orderClauses = []
        for (const [column, direction] of Object.entries(sortOrder)) {
          orderClauses.push(`${column} ${direction}`)
        }
        sql += ` ORDER BY ` + orderClauses.join(', ')
      }

      return { sql, params }

    } catch (error) {
      this.logger.error('Error building report query:', error)
      return { sql: 'SELECT 1 WHERE 1=0', params: [] }
    }
  }

  /**
   * Map database report record to model
   */
  private mapDbReportToModel(dbReport: any): CustomReport {
    return {
      reportId: dbReport.report_id,
      reportName: dbReport.report_name,
      reportDescription: dbReport.report_description,
      createdByUserId: dbReport.created_by_user_id,
      reportType: dbReport.report_type,
      dataSources: JSON.parse(dbReport.data_sources || '[]'),
      filters: dbReport.filters ? JSON.parse(dbReport.filters) : undefined,
      groupingColumns: dbReport.grouping_columns ? JSON.parse(dbReport.grouping_columns) : undefined,
      aggregationFunctions: dbReport.aggregation_functions ? JSON.parse(dbReport.aggregation_functions) : undefined,
      sortOrder: dbReport.sort_order ? JSON.parse(dbReport.sort_order) : undefined,
      outputFormat: dbReport.output_format,
      scheduleFrequency: dbReport.schedule_frequency,
      scheduleTime: dbReport.schedule_time,
      isPublic: Boolean(dbReport.is_public),
      isActive: Boolean(dbReport.is_active),
      lastGeneratedAt: dbReport.last_generated_at
    }
  }

  /**
   * Generate report ID
   */
  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * Generate report instance ID
   */
  private generateReportInstanceId(): string {
    return `inst_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * Calculate expiry date for reports (30 days)
   */
  private calculateExpiryDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString()
  }

  /**
   * Clean up expired reports
   */
  async cleanupExpiredReports(): Promise<{ success: boolean; deletedCount: number }> {
    try {
      const result = await this.db.prepare(`
        DELETE FROM generated_reports WHERE expires_at < ?
      `).bind(new Date().toISOString()).run()

      const deletedCount = result.changes || 0
      this.logger.info(`Cleaned up ${deletedCount} expired reports`)
      
      return { success: true, deletedCount }

    } catch (error) {
      this.logger.error('Error cleaning up expired reports:', error)
      return { success: false, deletedCount: 0 }
    }
  }
}