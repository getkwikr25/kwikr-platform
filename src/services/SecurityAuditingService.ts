/**
 * Security Auditing Service
 * Handles security monitoring, logging, threat detection, and audit reporting
 */

export interface SecurityAuditEvent {
  id?: number;
  event_type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'data_access' | 'api_call' | 'admin_action';
  severity: 'info' | 'warning' | 'error' | 'critical';
  user_id?: number;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  endpoint?: string;
  method?: string;
  request_data?: any;
  response_status?: number;
  event_details?: any;
  risk_score?: number;
  threat_indicators?: string[];
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  timestamp?: string;
  processed_at?: string;
  created_at?: string;
}

export interface ThreatDetection {
  id?: number;
  threat_type: 'brute_force' | 'sql_injection' | 'xss' | 'csrf' | 'suspicious_pattern' | 'data_exfiltration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source_ip: string;
  user_id?: number;
  detection_method: 'pattern_matching' | 'ml_model' | 'rate_limiting' | 'manual_review';
  threat_indicators: string[];
  affected_endpoints?: string[];
  attack_pattern?: string;
  mitigation_applied?: any;
  status: 'detected' | 'investigating' | 'mitigated' | 'false_positive';
  confidence_score: number;
  first_detected_at?: string;
  last_seen_at?: string;
  resolved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuditReport {
  id?: number;
  report_type: 'daily' | 'weekly' | 'monthly' | 'incident' | 'compliance';
  period_start: string;
  period_end: string;
  total_events: number;
  security_incidents: number;
  threat_detections: number;
  compliance_issues: number;
  risk_summary?: any;
  recommendations?: string[];
  generated_by?: number;
  report_data?: any;
  status: 'generated' | 'reviewed' | 'archived';
  generated_at?: string;
  reviewed_at?: string;
  created_at?: string;
}

export interface SecurityMetrics {
  period_start: string;
  period_end: string;
  total_events: number;
  events_by_type: Record<string, number>;
  events_by_severity: Record<string, number>;
  threat_detections: number;
  threats_by_type: Record<string, number>;
  unique_ips: number;
  suspicious_ips: string[];
  risk_score_distribution: Record<string, number>;
  top_endpoints: Array<{ endpoint: string; count: number; risk_score: number }>;
  authentication_failures: number;
  data_access_events: number;
  admin_actions: number;
}

export class SecurityAuditingService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Security Event Logging
   */
  async logSecurityEvent(event: Omit<SecurityAuditEvent, 'id' | 'timestamp' | 'processed_at' | 'created_at'>): Promise<SecurityAuditEvent> {
    try {
      // Calculate risk score based on event type and details
      const risk_score = this.calculateRiskScore(event);

      // Extract threat indicators
      const threat_indicators = this.extractThreatIndicators(event);

      // Enhance with geolocation (simulated)
      const geolocation = await this.getGeolocation(event.ip_address);

      const result = await this.db.prepare(`
        INSERT INTO security_audit_events 
        (event_type, severity, user_id, session_id, ip_address, user_agent, endpoint, method,
         request_data, response_status, event_details, risk_score, threat_indicators, geolocation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        event.event_type,
        event.severity,
        event.user_id || null,
        event.session_id || null,
        event.ip_address || null,
        event.user_agent || null,
        event.endpoint || null,
        event.method || null,
        event.request_data ? JSON.stringify(event.request_data) : null,
        event.response_status || null,
        event.event_details ? JSON.stringify(event.event_details) : null,
        risk_score,
        threat_indicators.length > 0 ? JSON.stringify(threat_indicators) : null,
        geolocation ? JSON.stringify(geolocation) : null
      ).run();

      if (!result.success) {
        throw new Error('Failed to log security event');
      }

      const logged_event = await this.getSecurityEventById(result.meta.last_row_id as number);

      // Process event for threat detection
      if (risk_score > 50 || threat_indicators.length > 0) {
        setTimeout(() => this.processEventForThreats(logged_event), 100);
      }

      return logged_event;
    } catch (error) {
      console.error('Error logging security event:', error);
      throw error;
    }
  }

  async getSecurityEventById(id: number): Promise<SecurityAuditEvent> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM security_audit_events WHERE id = ?
      `).bind(id).first();

      if (!result) {
        throw new Error('Security event not found');
      }

      return {
        ...result,
        request_data: result.request_data ? JSON.parse(result.request_data as string) : undefined,
        event_details: result.event_details ? JSON.parse(result.event_details as string) : undefined,
        threat_indicators: result.threat_indicators ? JSON.parse(result.threat_indicators as string) : undefined,
        geolocation: result.geolocation ? JSON.parse(result.geolocation as string) : undefined
      } as SecurityAuditEvent;
    } catch (error) {
      console.error('Error fetching security event:', error);
      throw error;
    }
  }

  async getSecurityEvents(
    start_date: string, 
    end_date: string, 
    event_type?: string, 
    severity?: string,
    limit: number = 100
  ): Promise<SecurityAuditEvent[]> {
    try {
      let query = `
        SELECT * FROM security_audit_events 
        WHERE timestamp BETWEEN ? AND ?
      `;
      const bindings: any[] = [start_date, end_date];

      if (event_type) {
        query += ` AND event_type = ?`;
        bindings.push(event_type);
      }

      if (severity) {
        query += ` AND severity = ?`;
        bindings.push(severity);
      }

      query += ` ORDER BY timestamp DESC LIMIT ?`;
      bindings.push(limit);

      const result = await this.db.prepare(query).bind(...bindings).all();

      return result.results.map(row => ({
        ...row,
        request_data: row.request_data ? JSON.parse(row.request_data as string) : undefined,
        event_details: row.event_details ? JSON.parse(row.event_details as string) : undefined,
        threat_indicators: row.threat_indicators ? JSON.parse(row.threat_indicators as string) : undefined,
        geolocation: row.geolocation ? JSON.parse(row.geolocation as string) : undefined
      })) as SecurityAuditEvent[];
    } catch (error) {
      console.error('Error fetching security events:', error);
      throw error;
    }
  }

  async getUserSecurityEvents(user_id: number, limit: number = 50): Promise<SecurityAuditEvent[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM security_audit_events 
        WHERE user_id = ? 
        ORDER BY timestamp DESC 
        LIMIT ?
      `).bind(user_id, limit).all();

      return result.results.map(row => ({
        ...row,
        request_data: row.request_data ? JSON.parse(row.request_data as string) : undefined,
        event_details: row.event_details ? JSON.parse(row.event_details as string) : undefined,
        threat_indicators: row.threat_indicators ? JSON.parse(row.threat_indicators as string) : undefined,
        geolocation: row.geolocation ? JSON.parse(row.geolocation as string) : undefined
      })) as SecurityAuditEvent[];
    } catch (error) {
      console.error('Error fetching user security events:', error);
      throw error;
    }
  }

  /**
   * Threat Detection
   */
  async detectThreat(threat: Omit<ThreatDetection, 'id' | 'first_detected_at' | 'last_seen_at' | 'created_at' | 'updated_at'>): Promise<ThreatDetection> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO security_threat_detection 
        (threat_type, severity, source_ip, user_id, detection_method, threat_indicators,
         affected_endpoints, attack_pattern, mitigation_applied, status, confidence_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        threat.threat_type,
        threat.severity,
        threat.source_ip,
        threat.user_id || null,
        threat.detection_method,
        JSON.stringify(threat.threat_indicators),
        threat.affected_endpoints ? JSON.stringify(threat.affected_endpoints) : null,
        threat.attack_pattern || null,
        threat.mitigation_applied ? JSON.stringify(threat.mitigation_applied) : null,
        threat.status,
        threat.confidence_score
      ).run();

      if (!result.success) {
        throw new Error('Failed to record threat detection');
      }

      const threat_detection = await this.getThreatDetectionById(result.meta.last_row_id as number);

      // Auto-apply mitigation for high-confidence, high-severity threats
      if (threat.confidence_score > 80 && ['high', 'critical'].includes(threat.severity)) {
        setTimeout(() => this.applyThreatMitigation(threat_detection.id!), 100);
      }

      return threat_detection;
    } catch (error) {
      console.error('Error detecting threat:', error);
      throw error;
    }
  }

  async getThreatDetectionById(id: number): Promise<ThreatDetection> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM security_threat_detection WHERE id = ?
      `).bind(id).first();

      if (!result) {
        throw new Error('Threat detection not found');
      }

      return {
        ...result,
        threat_indicators: JSON.parse(result.threat_indicators as string),
        affected_endpoints: result.affected_endpoints ? JSON.parse(result.affected_endpoints as string) : undefined,
        mitigation_applied: result.mitigation_applied ? JSON.parse(result.mitigation_applied as string) : undefined
      } as ThreatDetection;
    } catch (error) {
      console.error('Error fetching threat detection:', error);
      throw error;
    }
  }

  async updateThreatStatus(id: number, status: string, mitigation?: any): Promise<ThreatDetection> {
    try {
      const updates: string[] = [];
      const bindings: any[] = [];

      updates.push('status = ?');
      bindings.push(status);

      updates.push('updated_at = datetime(\'now\')');

      if (mitigation) {
        updates.push('mitigation_applied = ?');
        bindings.push(JSON.stringify(mitigation));
      }

      if (status === 'mitigated' || status === 'false_positive') {
        updates.push('resolved_at = datetime(\'now\')');
      }

      bindings.push(id);

      const result = await this.db.prepare(`
        UPDATE security_threat_detection 
        SET ${updates.join(', ')}
        WHERE id = ?
      `).bind(...bindings).run();

      if (!result.success) {
        throw new Error('Failed to update threat status');
      }

      return await this.getThreatDetectionById(id);
    } catch (error) {
      console.error('Error updating threat status:', error);
      throw error;
    }
  }

  async getActiveThreat(source_ip: string, threat_type: string): Promise<ThreatDetection | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM security_threat_detection 
        WHERE source_ip = ? AND threat_type = ? AND status IN ('detected', 'investigating')
        ORDER BY first_detected_at DESC LIMIT 1
      `).bind(source_ip, threat_type).first();

      if (!result) {
        return null;
      }

      return {
        ...result,
        threat_indicators: JSON.parse(result.threat_indicators as string),
        affected_endpoints: result.affected_endpoints ? JSON.parse(result.affected_endpoints as string) : undefined,
        mitigation_applied: result.mitigation_applied ? JSON.parse(result.mitigation_applied as string) : undefined
      } as ThreatDetection;
    } catch (error) {
      console.error('Error fetching active threat:', error);
      throw error;
    }
  }

  /**
   * Security Metrics and Reporting
   */
  async getSecurityMetrics(start_date: string, end_date: string): Promise<SecurityMetrics> {
    try {
      // Get all events in the date range
      const eventsResult = await this.db.prepare(`
        SELECT * FROM security_audit_events 
        WHERE timestamp BETWEEN ? AND ?
      `).bind(start_date, end_date).all();

      const events = eventsResult.results;
      const total_events = events.length;

      // Events by type
      const events_by_type: Record<string, number> = {};
      events.forEach((e: any) => {
        events_by_type[e.event_type] = (events_by_type[e.event_type] || 0) + 1;
      });

      // Events by severity
      const events_by_severity: Record<string, number> = { info: 0, warning: 0, error: 0, critical: 0 };
      events.forEach((e: any) => {
        if (events_by_severity.hasOwnProperty(e.severity)) {
          events_by_severity[e.severity]++;
        }
      });

      // Get threat detections
      const threatsResult = await this.db.prepare(`
        SELECT * FROM security_threat_detection 
        WHERE first_detected_at BETWEEN ? AND ?
      `).bind(start_date, end_date).all();

      const threats = threatsResult.results;
      const threat_detections = threats.length;

      // Threats by type
      const threats_by_type: Record<string, number> = {};
      threats.forEach((t: any) => {
        threats_by_type[t.threat_type] = (threats_by_type[t.threat_type] || 0) + 1;
      });

      // Unique IPs
      const unique_ips = [...new Set(events.map((e: any) => e.ip_address).filter(Boolean))].length;

      // Suspicious IPs (IPs with multiple high-risk events or threat detections)
      const ip_risk_scores: Record<string, number> = {};
      events.forEach((e: any) => {
        if (e.ip_address && e.risk_score) {
          ip_risk_scores[e.ip_address] = Math.max(ip_risk_scores[e.ip_address] || 0, e.risk_score);
        }
      });

      const suspicious_ips = Object.entries(ip_risk_scores)
        .filter(([ip, score]) => score > 70)
        .map(([ip, score]) => ip);

      // Risk score distribution
      const risk_score_distribution: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
      events.forEach((e: any) => {
        if (e.risk_score) {
          if (e.risk_score < 30) risk_score_distribution.low++;
          else if (e.risk_score < 60) risk_score_distribution.medium++;
          else if (e.risk_score < 80) risk_score_distribution.high++;
          else risk_score_distribution.critical++;
        }
      });

      // Top endpoints by access count and risk
      const endpoint_stats: Record<string, { count: number; total_risk: number }> = {};
      events.forEach((e: any) => {
        if (e.endpoint) {
          if (!endpoint_stats[e.endpoint]) {
            endpoint_stats[e.endpoint] = { count: 0, total_risk: 0 };
          }
          endpoint_stats[e.endpoint].count++;
          endpoint_stats[e.endpoint].total_risk += e.risk_score || 0;
        }
      });

      const top_endpoints = Object.entries(endpoint_stats)
        .map(([endpoint, stats]) => ({
          endpoint,
          count: stats.count,
          risk_score: stats.count > 0 ? Math.round(stats.total_risk / stats.count) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Specific event counts
      const authentication_failures = events.filter((e: any) => e.event_type === 'failed_login').length;
      const data_access_events = events.filter((e: any) => e.event_type === 'data_access').length;
      const admin_actions = events.filter((e: any) => e.event_type === 'admin_action').length;

      return {
        period_start: start_date,
        period_end: end_date,
        total_events,
        events_by_type,
        events_by_severity,
        threat_detections,
        threats_by_type,
        unique_ips,
        suspicious_ips,
        risk_score_distribution,
        top_endpoints,
        authentication_failures,
        data_access_events,
        admin_actions
      };
    } catch (error) {
      console.error('Error generating security metrics:', error);
      throw error;
    }
  }

  async generateAuditReport(
    report_type: string, 
    period_start: string, 
    period_end: string, 
    generated_by?: number
  ): Promise<AuditReport> {
    try {
      // Get security metrics for the period
      const metrics = await this.getSecurityMetrics(period_start, period_end);

      // Get compliance issues (events with high risk scores)
      const compliance_issues = await this.db.prepare(`
        SELECT COUNT(*) as count FROM security_audit_events 
        WHERE timestamp BETWEEN ? AND ? AND risk_score > 80
      `).bind(period_start, period_end).first();

      // Generate risk summary and recommendations
      const risk_summary = this.generateRiskSummary(metrics);
      const recommendations = this.generateSecurityRecommendations(metrics);

      const report_data = {
        metrics,
        risk_analysis: risk_summary,
        compliance_status: {
          total_issues: compliance_issues?.count || 0,
          critical_events: metrics.events_by_severity.critical,
          threat_response_rate: metrics.threat_detections > 0 ? 
            ((metrics.threat_detections - Object.values(metrics.threats_by_type).reduce((a, b) => a + b, 0)) / metrics.threat_detections) * 100 : 100
        }
      };

      const result = await this.db.prepare(`
        INSERT INTO security_audit_reports 
        (report_type, period_start, period_end, total_events, security_incidents, 
         threat_detections, compliance_issues, risk_summary, recommendations, 
         generated_by, report_data, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        report_type,
        period_start,
        period_end,
        metrics.total_events,
        metrics.events_by_severity.error + metrics.events_by_severity.critical,
        metrics.threat_detections,
        compliance_issues?.count || 0,
        JSON.stringify(risk_summary),
        JSON.stringify(recommendations),
        generated_by || null,
        JSON.stringify(report_data),
        'generated'
      ).run();

      if (!result.success) {
        throw new Error('Failed to generate audit report');
      }

      return await this.getAuditReportById(result.meta.last_row_id as number);
    } catch (error) {
      console.error('Error generating audit report:', error);
      throw error;
    }
  }

  async getAuditReportById(id: number): Promise<AuditReport> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM security_audit_reports WHERE id = ?
      `).bind(id).first();

      if (!result) {
        throw new Error('Audit report not found');
      }

      return {
        ...result,
        risk_summary: result.risk_summary ? JSON.parse(result.risk_summary as string) : undefined,
        recommendations: result.recommendations ? JSON.parse(result.recommendations as string) : undefined,
        report_data: result.report_data ? JSON.parse(result.report_data as string) : undefined
      } as AuditReport;
    } catch (error) {
      console.error('Error fetching audit report:', error);
      throw error;
    }
  }

  /**
   * Real-time Security Monitoring
   */
  async analyzeIncomingRequest(
    ip_address: string,
    endpoint: string,
    method: string,
    headers: Record<string, string>,
    user_agent?: string,
    user_id?: number
  ): Promise<{
    risk_score: number;
    threat_indicators: string[];
    recommended_action: 'allow' | 'monitor' | 'block' | 'challenge';
    mitigation_suggestions: string[];
  }> {
    try {
      let risk_score = 0;
      const threat_indicators: string[] = [];
      const mitigation_suggestions: string[] = [];

      // Check for known threat patterns
      if (this.detectSQLInjectionPattern(endpoint, headers)) {
        risk_score += 80;
        threat_indicators.push('sql_injection_pattern');
        mitigation_suggestions.push('Apply SQL injection filters');
      }

      if (this.detectXSSPattern(endpoint, headers)) {
        risk_score += 70;
        threat_indicators.push('xss_pattern');
        mitigation_suggestions.push('Sanitize input parameters');
      }

      if (this.detectCSRFPattern(method, headers)) {
        risk_score += 60;
        threat_indicators.push('csrf_pattern');
        mitigation_suggestions.push('Validate CSRF tokens');
      }

      // Check request frequency for brute force
      const recent_requests = await this.getRecentRequestsByIP(ip_address, 300); // Last 5 minutes
      if (recent_requests > 100) {
        risk_score += 50;
        threat_indicators.push('high_request_frequency');
        mitigation_suggestions.push('Apply rate limiting');
      }

      // Check for suspicious user agent
      if (user_agent && this.detectSuspiciousUserAgent(user_agent)) {
        risk_score += 30;
        threat_indicators.push('suspicious_user_agent');
        mitigation_suggestions.push('Monitor automated tool usage');
      }

      // Check geolocation anomalies for authenticated users
      if (user_id) {
        const location_anomaly = await this.checkLocationAnomaly(user_id, ip_address);
        if (location_anomaly) {
          risk_score += 40;
          threat_indicators.push('location_anomaly');
          mitigation_suggestions.push('Require additional authentication');
        }
      }

      // Determine recommended action
      let recommended_action: 'allow' | 'monitor' | 'block' | 'challenge';
      if (risk_score >= 90) {
        recommended_action = 'block';
      } else if (risk_score >= 70) {
        recommended_action = 'challenge';
      } else if (risk_score >= 40) {
        recommended_action = 'monitor';
      } else {
        recommended_action = 'allow';
      }

      return {
        risk_score: Math.min(100, risk_score),
        threat_indicators,
        recommended_action,
        mitigation_suggestions
      };
    } catch (error) {
      console.error('Error analyzing incoming request:', error);
      // Default to safe monitoring on error
      return {
        risk_score: 50,
        threat_indicators: ['analysis_error'],
        recommended_action: 'monitor',
        mitigation_suggestions: ['Manual review required due to analysis error']
      };
    }
  }

  /**
   * Private helper methods
   */
  private calculateRiskScore(event: Omit<SecurityAuditEvent, 'id' | 'timestamp' | 'processed_at' | 'created_at'>): number {
    let score = 0;

    // Base score by event type
    const event_type_scores: Record<string, number> = {
      'login': 10,
      'logout': 5,
      'failed_login': 30,
      'password_change': 20,
      'data_access': 25,
      'api_call': 15,
      'admin_action': 40
    };

    score += event_type_scores[event.event_type] || 15;

    // Severity multiplier
    const severity_multipliers: Record<string, number> = {
      'info': 1,
      'warning': 1.5,
      'error': 2,
      'critical': 3
    };

    score *= severity_multipliers[event.severity] || 1;

    // Additional factors
    if (event.response_status && event.response_status >= 400) {
      score += 20;
    }

    if (event.event_details && typeof event.event_details === 'object') {
      // Check for suspicious patterns in event details
      const details_str = JSON.stringify(event.event_details).toLowerCase();
      if (details_str.includes('error') || details_str.includes('fail')) {
        score += 10;
      }
    }

    return Math.min(100, Math.round(score));
  }

  private extractThreatIndicators(event: Omit<SecurityAuditEvent, 'id' | 'timestamp' | 'processed_at' | 'created_at'>): string[] {
    const indicators: string[] = [];

    // Check for failed authentication patterns
    if (event.event_type === 'failed_login') {
      indicators.push('authentication_failure');
    }

    // Check for suspicious endpoints
    if (event.endpoint) {
      if (event.endpoint.includes('admin') || event.endpoint.includes('config')) {
        indicators.push('sensitive_endpoint_access');
      }
      if (event.endpoint.includes('..') || event.endpoint.includes('%2e%2e')) {
        indicators.push('path_traversal_attempt');
      }
    }

    // Check for error responses
    if (event.response_status && event.response_status >= 500) {
      indicators.push('server_error_response');
    }

    // Check user agent for automated tools
    if (event.user_agent && this.detectSuspiciousUserAgent(event.user_agent)) {
      indicators.push('automated_tool_detection');
    }

    return indicators;
  }

  private async getGeolocation(ip_address?: string): Promise<any | null> {
    if (!ip_address || ip_address === '127.0.0.1' || ip_address.startsWith('192.168.')) {
      return null; // Skip local/private IPs
    }

    // Simulate geolocation lookup
    // In real implementation, this would use a geolocation service
    return {
      country: 'US',
      region: 'California',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194
    };
  }

  private async processEventForThreats(event: SecurityAuditEvent): Promise<void> {
    try {
      if (!event.ip_address) return;

      // Check for brute force patterns
      if (event.event_type === 'failed_login') {
        await this.checkBruteForcePattern(event);
      }

      // Check for data exfiltration patterns
      if (event.event_type === 'data_access' && event.risk_score && event.risk_score > 60) {
        await this.checkDataExfiltrationPattern(event);
      }

      // Check for suspicious admin actions
      if (event.event_type === 'admin_action' && event.severity === 'critical') {
        await this.checkSuspiciousAdminPattern(event);
      }
    } catch (error) {
      console.error('Error processing event for threats:', error);
    }
  }

  private async checkBruteForcePattern(event: SecurityAuditEvent): Promise<void> {
    try {
      const failed_attempts = await this.db.prepare(`
        SELECT COUNT(*) as count FROM security_audit_events 
        WHERE ip_address = ? AND event_type = 'failed_login' 
        AND timestamp > datetime('now', '-1 hour')
      `).bind(event.ip_address).first();

      if (failed_attempts && failed_attempts.count >= 10) {
        await this.detectThreat({
          threat_type: 'brute_force',
          severity: 'high',
          source_ip: event.ip_address!,
          user_id: event.user_id,
          detection_method: 'pattern_matching',
          threat_indicators: ['multiple_failed_logins', 'short_time_window'],
          attack_pattern: `${failed_attempts.count} failed login attempts from ${event.ip_address} in the last hour`,
          status: 'detected',
          confidence_score: 90
        });
      }
    } catch (error) {
      console.error('Error checking brute force pattern:', error);
    }
  }

  private async checkDataExfiltrationPattern(event: SecurityAuditEvent): Promise<void> {
    try {
      const data_access_count = await this.db.prepare(`
        SELECT COUNT(*) as count FROM security_audit_events 
        WHERE ip_address = ? AND event_type = 'data_access' 
        AND timestamp > datetime('now', '-30 minutes')
      `).bind(event.ip_address).first();

      if (data_access_count && data_access_count.count >= 50) {
        await this.detectThreat({
          threat_type: 'data_exfiltration',
          severity: 'critical',
          source_ip: event.ip_address!,
          user_id: event.user_id,
          detection_method: 'pattern_matching',
          threat_indicators: ['high_volume_data_access', 'short_time_window'],
          attack_pattern: `${data_access_count.count} data access attempts from ${event.ip_address} in 30 minutes`,
          status: 'detected',
          confidence_score: 85
        });
      }
    } catch (error) {
      console.error('Error checking data exfiltration pattern:', error);
    }
  }

  private async checkSuspiciousAdminPattern(event: SecurityAuditEvent): Promise<void> {
    try {
      await this.detectThreat({
        threat_type: 'suspicious_pattern',
        severity: 'medium',
        source_ip: event.ip_address!,
        user_id: event.user_id,
        detection_method: 'manual_review',
        threat_indicators: ['critical_admin_action'],
        attack_pattern: `Critical admin action performed: ${event.endpoint}`,
        status: 'detected',
        confidence_score: 70
      });
    } catch (error) {
      console.error('Error checking suspicious admin pattern:', error);
    }
  }

  private async applyThreatMitigation(threat_id: number): Promise<void> {
    try {
      const threat = await this.getThreatDetectionById(threat_id);
      
      const mitigation = {
        action: 'ip_block',
        duration: '1 hour',
        applied_at: new Date().toISOString(),
        automatic: true
      };

      await this.updateThreatStatus(threat_id, 'mitigated', mitigation);
    } catch (error) {
      console.error('Error applying threat mitigation:', error);
    }
  }

  private detectSQLInjectionPattern(endpoint: string, headers: Record<string, string>): boolean {
    const sql_patterns = [
      /('|\'|;|--|\/\*|\*\/|select|insert|update|delete|drop|create|alter|exec|union|script)/i
    ];
    
    const test_string = endpoint + JSON.stringify(headers);
    return sql_patterns.some(pattern => pattern.test(test_string));
  }

  private detectXSSPattern(endpoint: string, headers: Record<string, string>): boolean {
    const xss_patterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i
    ];
    
    const test_string = endpoint + JSON.stringify(headers);
    return xss_patterns.some(pattern => pattern.test(test_string));
  }

  private detectCSRFPattern(method: string, headers: Record<string, string>): boolean {
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      return !headers['x-csrf-token'] && !headers['x-requested-with'];
    }
    return false;
  }

  private detectSuspiciousUserAgent(user_agent: string): boolean {
    const suspicious_patterns = [
      /bot|crawler|spider|scraper/i,
      /curl|wget|python|requests/i,
      /scanner|vulnerability|exploit/i
    ];
    
    return suspicious_patterns.some(pattern => pattern.test(user_agent));
  }

  private async getRecentRequestsByIP(ip_address: string, seconds: number): Promise<number> {
    try {
      const cutoff = new Date();
      cutoff.setSeconds(cutoff.getSeconds() - seconds);
      
      const result = await this.db.prepare(`
        SELECT COUNT(*) as count FROM security_audit_events 
        WHERE ip_address = ? AND timestamp > ?
      `).bind(ip_address, cutoff.toISOString()).first();

      return result?.count || 0;
    } catch (error) {
      console.error('Error getting recent requests by IP:', error);
      return 0;
    }
  }

  private async checkLocationAnomaly(user_id: number, ip_address: string): Promise<boolean> {
    try {
      // Get user's recent locations
      const recent_locations = await this.db.prepare(`
        SELECT DISTINCT geolocation FROM security_audit_events 
        WHERE user_id = ? AND geolocation IS NOT NULL 
        AND timestamp > datetime('now', '-7 days')
        LIMIT 10
      `).bind(user_id).all();

      // In a real implementation, this would compare the current IP's geolocation
      // with the user's historical locations to detect anomalies
      // For simulation, we'll return false (no anomaly)
      return false;
    } catch (error) {
      console.error('Error checking location anomaly:', error);
      return false;
    }
  }

  private generateRiskSummary(metrics: SecurityMetrics): any {
    const total_high_risk = metrics.risk_score_distribution.high + metrics.risk_score_distribution.critical;
    const risk_percentage = metrics.total_events > 0 ? (total_high_risk / metrics.total_events) * 100 : 0;

    return {
      overall_risk_level: risk_percentage > 20 ? 'high' : risk_percentage > 10 ? 'medium' : 'low',
      risk_percentage: Math.round(risk_percentage),
      key_concerns: [
        ...(metrics.threat_detections > 0 ? [`${metrics.threat_detections} threat detections`] : []),
        ...(metrics.authentication_failures > 10 ? [`${metrics.authentication_failures} authentication failures`] : []),
        ...(metrics.suspicious_ips.length > 0 ? [`${metrics.suspicious_ips.length} suspicious IP addresses`] : [])
      ],
      trend_analysis: 'Risk levels appear stable compared to baseline' // Placeholder for trend analysis
    };
  }

  private generateSecurityRecommendations(metrics: SecurityMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.authentication_failures > 20) {
      recommendations.push('Implement stronger password policies and account lockout mechanisms');
    }

    if (metrics.threat_detections > 5) {
      recommendations.push('Review and enhance threat detection rules');
    }

    if (metrics.suspicious_ips.length > 3) {
      recommendations.push('Consider implementing IP reputation filtering');
    }

    if (metrics.events_by_severity.critical > 0) {
      recommendations.push('Immediate review of critical security events required');
    }

    if (metrics.admin_actions > 50) {
      recommendations.push('Audit administrative access patterns and implement additional oversight');
    }

    if (recommendations.length === 0) {
      recommendations.push('Security posture appears healthy - maintain current monitoring practices');
    }

    return recommendations;
  }
}