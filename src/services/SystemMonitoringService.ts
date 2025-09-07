/**
 * SystemMonitoringService - Advanced System Performance & Error Tracking
 * 
 * Provides comprehensive system monitoring capabilities:
 * - Real-time performance metrics collection
 * - Error tracking and analysis
 * - System alerts and notifications
 * - Performance trend analysis
 * - Automated health checks
 * - Resource usage monitoring
 * - Custom metrics tracking
 * 
 * Features:
 * - Automated metric collection with configurable intervals
 * - Error aggregation and deduplication
 * - Performance threshold monitoring with alerts
 * - Historical trend analysis and reporting
 * - Integration with admin dashboard
 * - Custom metric support for business logic
 * - Real-time alerting system
 */

export interface SystemAlert {
  id: number;
  alert_type: 'performance' | 'security' | 'error' | 'maintenance';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  threshold_value?: number;
  current_value?: number;
  auto_generated: boolean;
  acknowledged_by?: number;
  acknowledged_at?: string;
  resolved_by?: number;
  resolved_at?: string;
  resolution_notes?: string;
  metadata?: any;
  created_at: string;
}

export interface PerformanceMetric {
  metric_type: string;
  metric_value: number;
  unit: string;
  timestamp: string;
  source?: string;
  metadata?: any;
}

export interface SystemHealthReport {
  overall_status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  metrics: {
    response_time: { value: number; status: string; threshold: number };
    error_rate: { value: number; status: string; threshold: number };
    memory_usage: { value: number; status: string; threshold: number };
    storage_usage: { value: number; status: string; threshold: number };
    active_connections: { value: number; status: string; threshold: number };
  };
  alerts: SystemAlert[];
  recommendations: string[];
}

export interface MetricThreshold {
  metric_type: string;
  warning_threshold: number;
  critical_threshold: number;
  comparison_operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  check_interval_minutes: number;
  enabled: boolean;
}

export class SystemMonitoringService {
  private db: D1Database;
  private alertCallbacks: Map<string, (alert: SystemAlert) => void> = new Map();

  // Default performance thresholds
  private defaultThresholds: MetricThreshold[] = [
    {
      metric_type: 'response_time',
      warning_threshold: 500,
      critical_threshold: 1000,
      comparison_operator: 'gt',
      check_interval_minutes: 5,
      enabled: true
    },
    {
      metric_type: 'error_rate',
      warning_threshold: 5,
      critical_threshold: 10,
      comparison_operator: 'gt',
      check_interval_minutes: 5,
      enabled: true
    },
    {
      metric_type: 'memory_usage',
      warning_threshold: 80,
      critical_threshold: 95,
      comparison_operator: 'gt',
      check_interval_minutes: 10,
      enabled: true
    },
    {
      metric_type: 'storage_usage',
      warning_threshold: 85,
      critical_threshold: 95,
      comparison_operator: 'gt',
      check_interval_minutes: 30,
      enabled: true
    }
  ];

  constructor(db: D1Database) {
    this.db = db;
  }

  // ================================
  // METRIC COLLECTION METHODS
  // ================================

  /**
   * Record a performance metric
   */
  async recordMetric(data: {
    metric_type: string;
    metric_value: number;
    unit: string;
    source?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO system_metrics (metric_type, metric_value, unit, source, metadata)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        data.metric_type,
        data.metric_value,
        data.unit,
        data.source || 'system',
        data.metadata ? JSON.stringify(data.metadata) : null
      ).run();

      // Check thresholds after recording
      await this.checkThresholds(data.metric_type, data.metric_value);
    } catch (error) {
      console.error('Error recording metric:', error);
    }
  }

  /**
   * Record multiple metrics in batch
   */
  async recordMetricsBatch(metrics: Array<{
    metric_type: string;
    metric_value: number;
    unit: string;
    source?: string;
    metadata?: any;
  }>): Promise<void> {
    try {
      // Use transaction for batch insert
      const statements = metrics.map(metric => ({
        stmt: this.db.prepare(`
          INSERT INTO system_metrics (metric_type, metric_value, unit, source, metadata)
          VALUES (?, ?, ?, ?, ?)
        `),
        params: [
          metric.metric_type,
          metric.metric_value,
          metric.unit,
          metric.source || 'system',
          metric.metadata ? JSON.stringify(metric.metadata) : null
        ]
      }));

      await this.db.batch(statements.map(s => s.stmt.bind(...s.params)));

      // Check thresholds for all metrics
      for (const metric of metrics) {
        await this.checkThresholds(metric.metric_type, metric.metric_value);
      }
    } catch (error) {
      console.error('Error recording metrics batch:', error);
    }
  }

  /**
   * Get system metrics with filtering and aggregation
   */
  async getMetrics(filters: {
    metric_type?: string;
    start_time?: string;
    end_time?: string;
    source?: string;
    aggregation?: 'avg' | 'min' | 'max' | 'sum' | 'count';
    interval?: 'minute' | 'hour' | 'day';
    limit?: number;
  } = {}): Promise<PerformanceMetric[]> {
    try {
      let query = 'SELECT ';
      let whereClause = 'WHERE 1=1';
      let orderClause = 'ORDER BY timestamp DESC';
      const values: any[] = [];

      // Build SELECT clause based on aggregation
      if (filters.aggregation && filters.interval) {
        const timeFormat = this.getTimeFormat(filters.interval);
        query += `
          ${timeFormat} as time_bucket,
          metric_type,
          ${filters.aggregation.toUpperCase()}(metric_value) as metric_value,
          unit,
          source,
          COUNT(*) as data_points
        `;
      } else {
        query += 'metric_type, metric_value, unit, timestamp, source, metadata';
      }

      query += ' FROM system_metrics ';

      // Build WHERE clause
      if (filters.metric_type) {
        whereClause += ' AND metric_type = ?';
        values.push(filters.metric_type);
      }
      if (filters.start_time) {
        whereClause += ' AND timestamp >= ?';
        values.push(filters.start_time);
      }
      if (filters.end_time) {
        whereClause += ' AND timestamp <= ?';
        values.push(filters.end_time);
      }
      if (filters.source) {
        whereClause += ' AND source = ?';
        values.push(filters.source);
      }

      // Add GROUP BY for aggregation
      if (filters.aggregation && filters.interval) {
        const timeFormat = this.getTimeFormat(filters.interval);
        query += whereClause + ` GROUP BY ${timeFormat}, metric_type, unit, source`;
        orderClause = `ORDER BY time_bucket DESC`;
      } else {
        query += whereClause;
      }

      // Add ORDER BY and LIMIT
      query += ` ${orderClause}`;
      if (filters.limit) {
        query += ' LIMIT ?';
        values.push(filters.limit);
      }

      const result = await this.db.prepare(query).bind(...values).all();

      return result.results.map((row: any) => ({
        ...row,
        metadata: row.metadata ? JSON.parse(row.metadata) : null
      }));
    } catch (error) {
      console.error('Error getting metrics:', error);
      throw new Error('Failed to get metrics');
    }
  }

  /**
   * Get real-time system health report
   */
  async getSystemHealthReport(): Promise<SystemHealthReport> {
    try {
      const [responseTime, errorRate, memoryUsage, storageUsage, activeConnections, activeAlerts] = await Promise.all([
        this.getLatestMetric('response_time'),
        this.getLatestMetric('error_rate'),
        this.getLatestMetric('memory_usage'),
        this.getLatestMetric('storage_usage'),
        this.getLatestMetric('active_connections'),
        this.getActiveAlerts()
      ]);

      const metrics = {
        response_time: this.evaluateMetricHealth(responseTime, 'response_time'),
        error_rate: this.evaluateMetricHealth(errorRate, 'error_rate'),
        memory_usage: this.evaluateMetricHealth(memoryUsage, 'memory_usage'),
        storage_usage: this.evaluateMetricHealth(storageUsage, 'storage_usage'),
        active_connections: this.evaluateMetricHealth(activeConnections, 'active_connections')
      };

      // Determine overall status
      const statuses = Object.values(metrics).map(m => m.status);
      const overallStatus = statuses.includes('critical') ? 'critical' :
                          statuses.includes('warning') ? 'warning' : 'healthy';

      // Generate recommendations
      const recommendations = this.generateRecommendations(metrics, activeAlerts);

      return {
        overall_status: overallStatus as any,
        timestamp: new Date().toISOString(),
        metrics,
        alerts: activeAlerts,
        recommendations
      };
    } catch (error) {
      console.error('Error getting system health report:', error);
      throw new Error('Failed to get system health report');
    }
  }

  // ================================
  // ERROR TRACKING METHODS
  // ================================

  /**
   * Log an error with automatic deduplication
   */
  async logError(data: {
    error_type: 'javascript' | 'server' | 'database' | 'network';
    error_code?: string;
    error_message: string;
    stack_trace?: string;
    user_id?: number;
    user_agent?: string;
    ip_address?: string;
    url?: string;
    request_method?: string;
    request_body?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    try {
      // Check for existing similar error
      const existingError = await this.db.prepare(`
        SELECT id, occurrence_count FROM error_logs 
        WHERE error_type = ? AND error_message = ? AND status = 'open'
        ORDER BY created_at DESC LIMIT 1
      `).bind(data.error_type, data.error_message).first();

      if (existingError) {
        // Update existing error
        await this.db.prepare(`
          UPDATE error_logs 
          SET occurrence_count = occurrence_count + 1, 
              last_seen = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(existingError.id).run();
      } else {
        // Insert new error
        await this.db.prepare(`
          INSERT INTO error_logs 
          (error_type, error_code, error_message, stack_trace, user_id, 
           user_agent, ip_address, url, request_method, request_body, severity)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          data.error_type,
          data.error_code || null,
          data.error_message,
          data.stack_trace || null,
          data.user_id || null,
          data.user_agent || null,
          data.ip_address || null,
          data.url || null,
          data.request_method || null,
          data.request_body || null,
          data.severity || 'medium'
        ).run();
      }

      // Create alert for high/critical severity errors
      if (data.severity && ['high', 'critical'].includes(data.severity)) {
        await this.createAlert({
          alert_type: 'error',
          title: `${data.severity.toUpperCase()} Error Detected`,
          message: `${data.error_type} error: ${data.error_message}`,
          severity: data.severity as any,
          auto_generated: true,
          metadata: {
            error_type: data.error_type,
            url: data.url,
            user_agent: data.user_agent
          }
        });
      }
    } catch (error) {
      console.error('Error logging error:', error);
    }
  }

  /**
   * Get error statistics and trends
   */
  async getErrorStats(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<any> {
    try {
      const timeCondition = this.getTimeCondition(timeRange);
      
      const [totalErrors, errorsByType, errorsBySeverity, topErrors] = await Promise.all([
        // Total errors
        this.db.prepare(`
          SELECT COUNT(*) as count FROM error_logs 
          WHERE created_at > ${timeCondition}
        `).first(),

        // Errors by type
        this.db.prepare(`
          SELECT error_type, COUNT(*) as count, SUM(occurrence_count) as total_occurrences
          FROM error_logs 
          WHERE created_at > ${timeCondition}
          GROUP BY error_type
          ORDER BY count DESC
        `).all(),

        // Errors by severity
        this.db.prepare(`
          SELECT severity, COUNT(*) as count, SUM(occurrence_count) as total_occurrences
          FROM error_logs 
          WHERE created_at > ${timeCondition}
          GROUP BY severity
          ORDER BY 
            CASE severity 
              WHEN 'critical' THEN 1 
              WHEN 'high' THEN 2 
              WHEN 'medium' THEN 3 
              WHEN 'low' THEN 4 
            END
        `).all(),

        // Top recurring errors
        this.db.prepare(`
          SELECT error_message, error_type, severity, occurrence_count, last_seen
          FROM error_logs 
          WHERE created_at > ${timeCondition}
          ORDER BY occurrence_count DESC
          LIMIT 10
        `).all()
      ]);

      return {
        total_errors: totalErrors?.count || 0,
        errors_by_type: errorsByType.results,
        errors_by_severity: errorsBySeverity.results,
        top_errors: topErrors.results,
        time_range: timeRange
      };
    } catch (error) {
      console.error('Error getting error stats:', error);
      throw new Error('Failed to get error statistics');
    }
  }

  // ================================
  // ALERT MANAGEMENT METHODS
  // ================================

  /**
   * Create a system alert
   */
  async createAlert(data: {
    alert_type: 'performance' | 'security' | 'error' | 'maintenance';
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    auto_generated?: boolean;
    threshold_value?: number;
    current_value?: number;
    metadata?: any;
  }): Promise<SystemAlert> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO system_alerts 
        (alert_type, title, message, severity, auto_generated, threshold_value, current_value, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        data.alert_type,
        data.title,
        data.message,
        data.severity,
        data.auto_generated || false,
        data.threshold_value || null,
        data.current_value || null,
        data.metadata ? JSON.stringify(data.metadata) : null
      ).run();

      const alert = await this.db.prepare(`
        SELECT * FROM system_alerts WHERE id = ?
      `).bind(result.meta.last_row_id).first();

      // Trigger alert callbacks
      this.triggerAlertCallbacks(alert as SystemAlert);

      return {
        ...alert,
        metadata: alert.metadata ? JSON.parse(alert.metadata) : null
      } as SystemAlert;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw new Error('Failed to create alert');
    }
  }

  /**
   * Get active system alerts
   */
  async getActiveAlerts(): Promise<SystemAlert[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM system_alerts 
        WHERE status = 'active' 
        ORDER BY 
          CASE severity 
            WHEN 'critical' THEN 1 
            WHEN 'error' THEN 2 
            WHEN 'warning' THEN 3 
            WHEN 'info' THEN 4 
          END,
          created_at DESC
      `).all();

      return result.results.map((row: any) => ({
        ...row,
        metadata: row.metadata ? JSON.parse(row.metadata) : null
      }));
    } catch (error) {
      console.error('Error getting active alerts:', error);
      throw new Error('Failed to get active alerts');
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: number, acknowledgedBy: number, notes?: string): Promise<void> {
    try {
      await this.db.prepare(`
        UPDATE system_alerts 
        SET status = 'acknowledged', 
            acknowledged_by = ?, 
            acknowledged_at = CURRENT_TIMESTAMP,
            resolution_notes = ?
        WHERE id = ?
      `).bind(acknowledgedBy, notes || null, alertId).run();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw new Error('Failed to acknowledge alert');
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: number, resolvedBy: number, notes?: string): Promise<void> {
    try {
      await this.db.prepare(`
        UPDATE system_alerts 
        SET status = 'resolved', 
            resolved_by = ?, 
            resolved_at = CURRENT_TIMESTAMP,
            resolution_notes = ?
        WHERE id = ?
      `).bind(resolvedBy, notes || null, alertId).run();
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw new Error('Failed to resolve alert');
    }
  }

  // ================================
  // PERFORMANCE MONITORING METHODS
  // ================================

  /**
   * Record request performance
   */
  async recordRequestPerformance(data: {
    url: string;
    method: string;
    response_time: number;
    status_code: number;
    user_id?: number;
    user_agent?: string;
    ip_address?: string;
  }): Promise<void> {
    try {
      await this.recordMetric({
        metric_type: 'response_time',
        metric_value: data.response_time,
        unit: 'ms',
        source: 'request',
        metadata: {
          url: data.url,
          method: data.method,
          status_code: data.status_code,
          user_id: data.user_id,
          user_agent: data.user_agent,
          ip_address: data.ip_address
        }
      });

      // Record error rate if status indicates error
      if (data.status_code >= 400) {
        await this.recordMetric({
          metric_type: 'error_rate',
          metric_value: 1,
          unit: 'count',
          source: 'request',
          metadata: {
            url: data.url,
            method: data.method,
            status_code: data.status_code
          }
        });
      }
    } catch (error) {
      console.error('Error recording request performance:', error);
    }
  }

  /**
   * Record database performance
   */
  async recordDatabasePerformance(data: {
    query: string;
    execution_time: number;
    rows_affected?: number;
    success: boolean;
  }): Promise<void> {
    try {
      await this.recordMetric({
        metric_type: 'db_query_time',
        metric_value: data.execution_time,
        unit: 'ms',
        source: 'database',
        metadata: {
          query: data.query,
          rows_affected: data.rows_affected,
          success: data.success
        }
      });

      if (!data.success) {
        await this.recordMetric({
          metric_type: 'db_error_rate',
          metric_value: 1,
          unit: 'count',
          source: 'database',
          metadata: { query: data.query }
        });
      }
    } catch (error) {
      console.error('Error recording database performance:', error);
    }
  }

  /**
   * Get performance trends
   */
  async getPerformanceTrends(
    metricType: string, 
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h',
    interval: 'minute' | 'hour' | 'day' = 'hour'
  ): Promise<any[]> {
    try {
      const timeCondition = this.getTimeCondition(timeRange);
      const timeFormat = this.getTimeFormat(interval);

      const result = await this.db.prepare(`
        SELECT 
          ${timeFormat} as time_bucket,
          AVG(metric_value) as avg_value,
          MIN(metric_value) as min_value,
          MAX(metric_value) as max_value,
          COUNT(*) as data_points
        FROM system_metrics 
        WHERE metric_type = ? AND timestamp > ${timeCondition}
        GROUP BY ${timeFormat}
        ORDER BY time_bucket ASC
      `).bind(metricType).all();

      return result.results;
    } catch (error) {
      console.error('Error getting performance trends:', error);
      throw new Error('Failed to get performance trends');
    }
  }

  // ================================
  // THRESHOLD MONITORING METHODS
  // ================================

  /**
   * Check metric against thresholds
   */
  private async checkThresholds(metricType: string, value: number): Promise<void> {
    try {
      const threshold = this.defaultThresholds.find(t => t.metric_type === metricType);
      if (!threshold || !threshold.enabled) return;

      const isWarning = this.compareValue(value, threshold.warning_threshold, threshold.comparison_operator);
      const isCritical = this.compareValue(value, threshold.critical_threshold, threshold.comparison_operator);

      if (isCritical) {
        await this.createAlert({
          alert_type: 'performance',
          title: `Critical ${metricType} threshold exceeded`,
          message: `${metricType} value ${value} exceeded critical threshold ${threshold.critical_threshold}`,
          severity: 'critical',
          auto_generated: true,
          threshold_value: threshold.critical_threshold,
          current_value: value,
          metadata: { metric_type: metricType }
        });
      } else if (isWarning) {
        await this.createAlert({
          alert_type: 'performance',
          title: `Warning ${metricType} threshold exceeded`,
          message: `${metricType} value ${value} exceeded warning threshold ${threshold.warning_threshold}`,
          severity: 'warning',
          auto_generated: true,
          threshold_value: threshold.warning_threshold,
          current_value: value,
          metadata: { metric_type: metricType }
        });
      }
    } catch (error) {
      console.error('Error checking thresholds:', error);
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  private compareValue(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'gte': return value >= threshold;
      case 'lt': return value < threshold;
      case 'lte': return value <= threshold;
      case 'eq': return value === threshold;
      default: return false;
    }
  }

  private getTimeCondition(timeRange: string): string {
    const conditions = {
      '1h': "datetime('now', '-1 hours')",
      '24h': "datetime('now', '-24 hours')",
      '7d': "datetime('now', '-7 days')",
      '30d': "datetime('now', '-30 days')"
    };
    return conditions[timeRange] || conditions['24h'];
  }

  private getTimeFormat(interval: string): string {
    const formats = {
      'minute': "datetime(timestamp, 'start of day', '+' || (strftime('%H', timestamp) * 60 + strftime('%M', timestamp)) || ' minutes')",
      'hour': "datetime(timestamp, 'start of day', '+' || strftime('%H', timestamp) || ' hours')",
      'day': "date(timestamp)"
    };
    return formats[interval] || formats['hour'];
  }

  private async getLatestMetric(metricType: string): Promise<PerformanceMetric | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM system_metrics 
        WHERE metric_type = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
      `).bind(metricType).first();

      return result ? {
        ...result,
        metadata: result.metadata ? JSON.parse(result.metadata) : null
      } as PerformanceMetric : null;
    } catch (error) {
      console.error('Error getting latest metric:', error);
      return null;
    }
  }

  private evaluateMetricHealth(metric: PerformanceMetric | null, metricType: string): any {
    if (!metric) {
      return { value: 0, status: 'unknown', threshold: 0 };
    }

    const threshold = this.defaultThresholds.find(t => t.metric_type === metricType);
    if (!threshold) {
      return { value: metric.metric_value, status: 'healthy', threshold: 0 };
    }

    const isWarning = this.compareValue(metric.metric_value, threshold.warning_threshold, threshold.comparison_operator);
    const isCritical = this.compareValue(metric.metric_value, threshold.critical_threshold, threshold.comparison_operator);

    const status = isCritical ? 'critical' : isWarning ? 'warning' : 'healthy';

    return {
      value: metric.metric_value,
      status,
      threshold: isCritical ? threshold.critical_threshold : threshold.warning_threshold
    };
  }

  private generateRecommendations(metrics: any, alerts: SystemAlert[]): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (metrics.response_time.status === 'critical') {
      recommendations.push('Consider optimizing slow database queries and adding caching');
    }
    if (metrics.error_rate.status === 'warning') {
      recommendations.push('Review recent error logs and implement error handling improvements');
    }
    if (metrics.memory_usage.status === 'critical') {
      recommendations.push('Investigate memory leaks and optimize memory usage');
    }
    if (metrics.storage_usage.status === 'warning') {
      recommendations.push('Clean up old logs and files, consider storage expansion');
    }

    // Alert-based recommendations
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    if (criticalAlerts > 0) {
      recommendations.push(`Address ${criticalAlerts} critical alerts immediately`);
    }

    if (recommendations.length === 0) {
      recommendations.push('System is running optimally, continue regular monitoring');
    }

    return recommendations;
  }

  private triggerAlertCallbacks(alert: SystemAlert): void {
    this.alertCallbacks.forEach((callback, key) => {
      try {
        callback(alert);
      } catch (error) {
        console.error(`Error in alert callback ${key}:`, error);
      }
    });
  }

  /**
   * Register alert callback
   */
  public registerAlertCallback(key: string, callback: (alert: SystemAlert) => void): void {
    this.alertCallbacks.set(key, callback);
  }

  /**
   * Unregister alert callback
   */
  public unregisterAlertCallback(key: string): void {
    this.alertCallbacks.delete(key);
  }
}