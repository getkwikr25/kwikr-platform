/**
 * Rate Limiting Service
 * Handles API and action rate limits, abuse prevention, and quota management
 */

export interface RateLimitRule {
  id?: number;
  rule_name: string;
  endpoint_pattern: string; // Regex pattern for matching endpoints
  method_types: string[]; // HTTP methods this rule applies to
  limit_per_minute?: number;
  limit_per_hour?: number;
  limit_per_day?: number;
  burst_limit?: number; // Allow short bursts
  user_type_restrictions?: Record<string, {
    limit_per_minute?: number;
    limit_per_hour?: number;
    limit_per_day?: number;
  }>;
  ip_whitelist?: string[];
  ip_blacklist?: string[];
  is_active: boolean;
  priority: number; // Higher priority rules checked first
  created_at?: string;
  updated_at?: string;
}

export interface RateLimitTracking {
  id?: number;
  identifier: string; // IP address, user ID, or API key
  identifier_type: 'ip' | 'user' | 'api_key';
  endpoint: string;
  method: string;
  rule_id: number;
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  last_request_at?: string;
  minute_window_start?: string;
  hour_window_start?: string;
  day_window_start?: string;
  violations_count: number;
  last_violation_at?: string;
  is_blocked: boolean;
  block_expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RateLimitViolation {
  id?: number;
  tracking_id: number;
  identifier: string;
  endpoint: string;
  method: string;
  exceeded_limit: 'minute' | 'hour' | 'day' | 'burst';
  limit_value: number;
  actual_requests: number;
  violation_severity: 'warning' | 'block' | 'escalate';
  action_taken?: any;
  user_agent?: string;
  ip_address?: string;
  request_headers?: Record<string, string>;
  violation_at?: string;
  resolved_at?: string;
  created_at?: string;
}

export interface RateLimitCheck {
  allowed: boolean;
  rule_matched?: RateLimitRule;
  current_usage: {
    minute: number;
    hour: number;
    day: number;
  };
  limits: {
    minute?: number;
    hour?: number;
    day?: number;
    burst?: number;
  };
  time_until_reset: {
    minute: number;
    hour: number;
    day: number;
  };
  violation_info?: {
    exceeded_limit: string;
    retry_after: number; // seconds
    block_expires_at?: string;
  };
}

export interface RateLimitRequest {
  identifier: string;
  identifier_type: 'ip' | 'user' | 'api_key';
  endpoint: string;
  method: string;
  user_type?: string;
  ip_address?: string;
  user_agent?: string;
  headers?: Record<string, string>;
}

export class RateLimitingService {
  private db: D1Database;
  private cache: Map<string, any> = new Map(); // Simple in-memory cache for performance

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Rate Limit Rule Management
   */
  async createRule(rule: Omit<RateLimitRule, 'id' | 'created_at' | 'updated_at'>): Promise<RateLimitRule> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO rate_limit_rules 
        (rule_name, endpoint_pattern, method_types, limit_per_minute, limit_per_hour, 
         limit_per_day, burst_limit, user_type_restrictions, ip_whitelist, ip_blacklist, 
         is_active, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        rule.rule_name,
        rule.endpoint_pattern,
        JSON.stringify(rule.method_types),
        rule.limit_per_minute || null,
        rule.limit_per_hour || null,
        rule.limit_per_day || null,
        rule.burst_limit || null,
        rule.user_type_restrictions ? JSON.stringify(rule.user_type_restrictions) : null,
        rule.ip_whitelist ? JSON.stringify(rule.ip_whitelist) : null,
        rule.ip_blacklist ? JSON.stringify(rule.ip_blacklist) : null,
        rule.is_active ? 1 : 0,
        rule.priority
      ).run();

      if (!result.success) {
        throw new Error('Failed to create rate limit rule');
      }

      // Clear cache to force reload of rules
      this.cache.clear();

      return await this.getRuleById(result.meta.last_row_id as number);
    } catch (error) {
      console.error('Error creating rate limit rule:', error);
      throw error;
    }
  }

  async getRuleById(id: number): Promise<RateLimitRule> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM rate_limit_rules WHERE id = ?
      `).bind(id).first();

      if (!result) {
        throw new Error('Rate limit rule not found');
      }

      return {
        ...result,
        method_types: JSON.parse(result.method_types as string),
        user_type_restrictions: result.user_type_restrictions ? JSON.parse(result.user_type_restrictions as string) : undefined,
        ip_whitelist: result.ip_whitelist ? JSON.parse(result.ip_whitelist as string) : undefined,
        ip_blacklist: result.ip_blacklist ? JSON.parse(result.ip_blacklist as string) : undefined,
        is_active: result.is_active === 1
      } as RateLimitRule;
    } catch (error) {
      console.error('Error fetching rate limit rule:', error);
      throw error;
    }
  }

  async getRules(active_only: boolean = true): Promise<RateLimitRule[]> {
    try {
      const cache_key = `rules_${active_only}`;
      if (this.cache.has(cache_key)) {
        return this.cache.get(cache_key);
      }

      const query = active_only 
        ? `SELECT * FROM rate_limit_rules WHERE is_active = 1 ORDER BY priority DESC, id ASC`
        : `SELECT * FROM rate_limit_rules ORDER BY priority DESC, id ASC`;
      
      const result = await this.db.prepare(query).all();
      
      const rules = result.results.map(row => ({
        ...row,
        method_types: JSON.parse(row.method_types as string),
        user_type_restrictions: row.user_type_restrictions ? JSON.parse(row.user_type_restrictions as string) : undefined,
        ip_whitelist: row.ip_whitelist ? JSON.parse(row.ip_whitelist as string) : undefined,
        ip_blacklist: row.ip_blacklist ? JSON.parse(row.ip_blacklist as string) : undefined,
        is_active: row.is_active === 1
      })) as RateLimitRule[];

      // Cache for 5 minutes
      this.cache.set(cache_key, rules);
      setTimeout(() => this.cache.delete(cache_key), 5 * 60 * 1000);

      return rules;
    } catch (error) {
      console.error('Error fetching rate limit rules:', error);
      throw error;
    }
  }

  async updateRule(id: number, updates: Partial<RateLimitRule>): Promise<RateLimitRule> {
    try {
      const updateFields: string[] = [];
      const bindings: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && value !== undefined) {
          updateFields.push(`${key} = ?`);
          
          if (typeof value === 'object' && value !== null) {
            bindings.push(JSON.stringify(value));
          } else if (typeof value === 'boolean') {
            bindings.push(value ? 1 : 0);
          } else {
            bindings.push(value);
          }
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateFields.push('updated_at = datetime(\'now\')');
      bindings.push(id);

      const result = await this.db.prepare(`
        UPDATE rate_limit_rules 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `).bind(...bindings).run();

      if (!result.success) {
        throw new Error('Failed to update rate limit rule');
      }

      // Clear cache
      this.cache.clear();

      return await this.getRuleById(id);
    } catch (error) {
      console.error('Error updating rate limit rule:', error);
      throw error;
    }
  }

  /**
   * Rate Limit Checking
   */
  async checkRateLimit(request: RateLimitRequest): Promise<RateLimitCheck> {
    try {
      // Get matching rule
      const rule = await this.findMatchingRule(request.endpoint, request.method, request.user_type, request.ip_address);
      
      if (!rule) {
        // No rule matches - allow by default
        return {
          allowed: true,
          current_usage: { minute: 0, hour: 0, day: 0 },
          limits: {},
          time_until_reset: { minute: 0, hour: 0, day: 0 }
        };
      }

      // Check if IP is blacklisted
      if (rule.ip_blacklist && request.ip_address && rule.ip_blacklist.includes(request.ip_address)) {
        return {
          allowed: false,
          rule_matched: rule,
          current_usage: { minute: 0, hour: 0, day: 0 },
          limits: this.getEffectiveLimits(rule, request.user_type),
          time_until_reset: { minute: 0, hour: 0, day: 0 },
          violation_info: {
            exceeded_limit: 'blacklist',
            retry_after: 86400 // 24 hours
          }
        };
      }

      // Check if IP is whitelisted (bypass limits)
      if (rule.ip_whitelist && request.ip_address && rule.ip_whitelist.includes(request.ip_address)) {
        return {
          allowed: true,
          rule_matched: rule,
          current_usage: { minute: 0, hour: 0, day: 0 },
          limits: this.getEffectiveLimits(rule, request.user_type),
          time_until_reset: { minute: 0, hour: 0, day: 0 }
        };
      }

      // Get or create tracking record
      const tracking = await this.getOrCreateTracking(request, rule);

      // Check if currently blocked
      if (tracking.is_blocked && tracking.block_expires_at) {
        const block_expires = new Date(tracking.block_expires_at);
        if (block_expires > new Date()) {
          const retry_after = Math.ceil((block_expires.getTime() - Date.now()) / 1000);
          return {
            allowed: false,
            rule_matched: rule,
            current_usage: {
              minute: tracking.requests_per_minute,
              hour: tracking.requests_per_hour,
              day: tracking.requests_per_day
            },
            limits: this.getEffectiveLimits(rule, request.user_type),
            time_until_reset: this.calculateTimeUntilReset(tracking),
            violation_info: {
              exceeded_limit: 'blocked',
              retry_after,
              block_expires_at: tracking.block_expires_at
            }
          };
        } else {
          // Block expired, unblock
          await this.unblockIdentifier(tracking.id!);
          tracking.is_blocked = false;
        }
      }

      // Update tracking windows
      const updated_tracking = await this.updateTrackingWindows(tracking);

      // Check limits
      const limits = this.getEffectiveLimits(rule, request.user_type);
      const violation = this.checkLimitViolation(updated_tracking, limits);

      if (violation) {
        // Record violation
        await this.recordViolation(updated_tracking, violation, request);
        
        // Apply enforcement action
        if (violation.severity === 'block') {
          await this.blockIdentifier(updated_tracking.id!, violation.duration);
        }

        return {
          allowed: false,
          rule_matched: rule,
          current_usage: {
            minute: updated_tracking.requests_per_minute,
            hour: updated_tracking.requests_per_hour,
            day: updated_tracking.requests_per_day
          },
          limits,
          time_until_reset: this.calculateTimeUntilReset(updated_tracking),
          violation_info: {
            exceeded_limit: violation.type,
            retry_after: violation.retry_after
          }
        };
      }

      // Increment counters for allowed request
      await this.incrementCounters(updated_tracking);

      return {
        allowed: true,
        rule_matched: rule,
        current_usage: {
          minute: updated_tracking.requests_per_minute + 1,
          hour: updated_tracking.requests_per_hour + 1,
          day: updated_tracking.requests_per_day + 1
        },
        limits,
        time_until_reset: this.calculateTimeUntilReset(updated_tracking)
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // On error, allow request but log for investigation
      return {
        allowed: true,
        current_usage: { minute: 0, hour: 0, day: 0 },
        limits: {},
        time_until_reset: { minute: 0, hour: 0, day: 0 }
      };
    }
  }

  /**
   * Rate Limit Analytics
   */
  async getRateLimitMetrics(start_date: string, end_date: string): Promise<{
    total_requests_tracked: number;
    total_violations: number;
    violations_by_type: Record<string, number>;
    blocked_identifiers: number;
    top_violating_ips: Array<{ ip: string; violations: number }>;
    top_violating_endpoints: Array<{ endpoint: string; violations: number }>;
    enforcement_actions: Record<string, number>;
    rules_performance: Array<{
      rule_name: string;
      requests_matched: number;
      violations_triggered: number;
      effectiveness_score: number;
    }>;
  }> {
    try {
      // Total requests tracked
      const totalRequestsResult = await this.db.prepare(`
        SELECT COUNT(*) as count FROM rate_limit_tracking 
        WHERE last_request_at BETWEEN ? AND ?
      `).bind(start_date, end_date).first();

      const total_requests_tracked = totalRequestsResult?.count || 0;

      // Total violations
      const totalViolationsResult = await this.db.prepare(`
        SELECT COUNT(*) as count FROM rate_limit_violations 
        WHERE violation_at BETWEEN ? AND ?
      `).bind(start_date, end_date).first();

      const total_violations = totalViolationsResult?.count || 0;

      // Violations by type
      const violationsByTypeResult = await this.db.prepare(`
        SELECT exceeded_limit, COUNT(*) as count FROM rate_limit_violations 
        WHERE violation_at BETWEEN ? AND ?
        GROUP BY exceeded_limit
      `).bind(start_date, end_date).all();

      const violations_by_type: Record<string, number> = {};
      violationsByTypeResult.results.forEach((row: any) => {
        violations_by_type[row.exceeded_limit] = row.count;
      });

      // Blocked identifiers
      const blockedResult = await this.db.prepare(`
        SELECT COUNT(DISTINCT identifier) as count FROM rate_limit_tracking 
        WHERE is_blocked = 1 AND updated_at BETWEEN ? AND ?
      `).bind(start_date, end_date).first();

      const blocked_identifiers = blockedResult?.count || 0;

      // Top violating IPs
      const topIPsResult = await this.db.prepare(`
        SELECT ip_address, COUNT(*) as violations 
        FROM rate_limit_violations 
        WHERE violation_at BETWEEN ? AND ? AND ip_address IS NOT NULL
        GROUP BY ip_address 
        ORDER BY violations DESC 
        LIMIT 10
      `).bind(start_date, end_date).all();

      const top_violating_ips = topIPsResult.results.map((row: any) => ({
        ip: row.ip_address,
        violations: row.violations
      }));

      // Top violating endpoints
      const topEndpointsResult = await this.db.prepare(`
        SELECT endpoint, COUNT(*) as violations 
        FROM rate_limit_violations 
        WHERE violation_at BETWEEN ? AND ?
        GROUP BY endpoint 
        ORDER BY violations DESC 
        LIMIT 10
      `).bind(start_date, end_date).all();

      const top_violating_endpoints = topEndpointsResult.results.map((row: any) => ({
        endpoint: row.endpoint,
        violations: row.violations
      }));

      // Enforcement actions
      const enforcementResult = await this.db.prepare(`
        SELECT violation_severity, COUNT(*) as count 
        FROM rate_limit_violations 
        WHERE violation_at BETWEEN ? AND ?
        GROUP BY violation_severity
      `).bind(start_date, end_date).all();

      const enforcement_actions: Record<string, number> = {};
      enforcementResult.results.forEach((row: any) => {
        enforcement_actions[row.violation_severity] = row.count;
      });

      // Rules performance
      const rulesResult = await this.db.prepare(`
        SELECT 
          rlr.rule_name,
          COUNT(rlt.id) as requests_matched,
          COUNT(rlv.id) as violations_triggered
        FROM rate_limit_rules rlr
        LEFT JOIN rate_limit_tracking rlt ON rlr.id = rlt.rule_id 
          AND rlt.last_request_at BETWEEN ? AND ?
        LEFT JOIN rate_limit_violations rlv ON rlt.id = rlv.tracking_id 
          AND rlv.violation_at BETWEEN ? AND ?
        WHERE rlr.is_active = 1
        GROUP BY rlr.id, rlr.rule_name
      `).bind(start_date, end_date, start_date, end_date).all();

      const rules_performance = rulesResult.results.map((row: any) => ({
        rule_name: row.rule_name,
        requests_matched: row.requests_matched || 0,
        violations_triggered: row.violations_triggered || 0,
        effectiveness_score: row.requests_matched > 0 
          ? Math.round((1 - (row.violations_triggered / row.requests_matched)) * 100)
          : 100
      }));

      return {
        total_requests_tracked,
        total_violations,
        violations_by_type,
        blocked_identifiers,
        top_violating_ips,
        top_violating_endpoints,
        enforcement_actions,
        rules_performance
      };
    } catch (error) {
      console.error('Error generating rate limit metrics:', error);
      throw error;
    }
  }

  /**
   * Management Operations
   */
  async unblockIdentifier(tracking_id: number): Promise<void> {
    try {
      await this.db.prepare(`
        UPDATE rate_limit_tracking 
        SET is_blocked = 0, block_expires_at = NULL, updated_at = datetime('now')
        WHERE id = ?
      `).bind(tracking_id).run();
    } catch (error) {
      console.error('Error unblocking identifier:', error);
      throw error;
    }
  }

  async resetCounters(identifier: string, identifier_type: string): Promise<void> {
    try {
      await this.db.prepare(`
        UPDATE rate_limit_tracking 
        SET requests_per_minute = 0, requests_per_hour = 0, requests_per_day = 0,
            minute_window_start = datetime('now'), 
            hour_window_start = datetime('now'),
            day_window_start = datetime('now'),
            updated_at = datetime('now')
        WHERE identifier = ? AND identifier_type = ?
      `).bind(identifier, identifier_type).run();
    } catch (error) {
      console.error('Error resetting counters:', error);
      throw error;
    }
  }

  async getViolationHistory(identifier: string, limit: number = 50): Promise<RateLimitViolation[]> {
    try {
      const result = await this.db.prepare(`
        SELECT rlv.* FROM rate_limit_violations rlv
        JOIN rate_limit_tracking rlt ON rlv.tracking_id = rlt.id
        WHERE rlt.identifier = ?
        ORDER BY rlv.violation_at DESC
        LIMIT ?
      `).bind(identifier, limit).all();

      return result.results.map(row => ({
        ...row,
        action_taken: row.action_taken ? JSON.parse(row.action_taken as string) : undefined,
        request_headers: row.request_headers ? JSON.parse(row.request_headers as string) : undefined
      })) as RateLimitViolation[];
    } catch (error) {
      console.error('Error fetching violation history:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async findMatchingRule(endpoint: string, method: string, user_type?: string, ip_address?: string): Promise<RateLimitRule | null> {
    try {
      const rules = await this.getRules(true);
      
      for (const rule of rules) {
        // Check method match
        if (!rule.method_types.includes(method) && !rule.method_types.includes('*')) {
          continue;
        }

        // Check endpoint pattern match
        const pattern = new RegExp(rule.endpoint_pattern);
        if (!pattern.test(endpoint)) {
          continue;
        }

        // Rule matches
        return rule;
      }

      return null;
    } catch (error) {
      console.error('Error finding matching rule:', error);
      return null;
    }
  }

  private getEffectiveLimits(rule: RateLimitRule, user_type?: string): {
    minute?: number;
    hour?: number;
    day?: number;
    burst?: number;
  } {
    // Check for user type specific limits
    if (user_type && rule.user_type_restrictions?.[user_type]) {
      const userLimits = rule.user_type_restrictions[user_type];
      return {
        minute: userLimits.limit_per_minute || rule.limit_per_minute,
        hour: userLimits.limit_per_hour || rule.limit_per_hour,
        day: userLimits.limit_per_day || rule.limit_per_day,
        burst: rule.burst_limit
      };
    }

    return {
      minute: rule.limit_per_minute,
      hour: rule.limit_per_hour,
      day: rule.limit_per_day,
      burst: rule.burst_limit
    };
  }

  private async getOrCreateTracking(request: RateLimitRequest, rule: RateLimitRule): Promise<RateLimitTracking> {
    try {
      // Try to find existing tracking record
      let existing = await this.db.prepare(`
        SELECT * FROM rate_limit_tracking 
        WHERE identifier = ? AND identifier_type = ? AND endpoint = ? AND method = ? AND rule_id = ?
      `).bind(request.identifier, request.identifier_type, request.endpoint, request.method, rule.id).first();

      if (existing) {
        return {
          ...existing,
          is_blocked: existing.is_blocked === 1
        } as RateLimitTracking;
      }

      // Create new tracking record
      const now = new Date().toISOString();
      const result = await this.db.prepare(`
        INSERT INTO rate_limit_tracking 
        (identifier, identifier_type, endpoint, method, rule_id, requests_per_minute, 
         requests_per_hour, requests_per_day, last_request_at, minute_window_start, 
         hour_window_start, day_window_start, violations_count, is_blocked)
        VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?, 0, 0)
      `).bind(
        request.identifier,
        request.identifier_type,
        request.endpoint,
        request.method,
        rule.id,
        now,
        now,
        now,
        now
      ).run();

      if (!result.success) {
        throw new Error('Failed to create tracking record');
      }

      return {
        id: result.meta.last_row_id as number,
        identifier: request.identifier,
        identifier_type: request.identifier_type,
        endpoint: request.endpoint,
        method: request.method,
        rule_id: rule.id!,
        requests_per_minute: 0,
        requests_per_hour: 0,
        requests_per_day: 0,
        last_request_at: now,
        minute_window_start: now,
        hour_window_start: now,
        day_window_start: now,
        violations_count: 0,
        is_blocked: false
      };
    } catch (error) {
      console.error('Error getting or creating tracking record:', error);
      throw error;
    }
  }

  private async updateTrackingWindows(tracking: RateLimitTracking): Promise<RateLimitTracking> {
    try {
      const now = new Date();
      const minuteStart = new Date(tracking.minute_window_start!);
      const hourStart = new Date(tracking.hour_window_start!);
      const dayStart = new Date(tracking.day_window_start!);

      let needsUpdate = false;
      const updates: any = { ...tracking };

      // Reset minute window if needed
      if (now.getTime() - minuteStart.getTime() >= 60000) { // 1 minute
        updates.requests_per_minute = 0;
        updates.minute_window_start = now.toISOString();
        needsUpdate = true;
      }

      // Reset hour window if needed
      if (now.getTime() - hourStart.getTime() >= 3600000) { // 1 hour
        updates.requests_per_hour = 0;
        updates.hour_window_start = now.toISOString();
        needsUpdate = true;
      }

      // Reset day window if needed
      if (now.getTime() - dayStart.getTime() >= 86400000) { // 1 day
        updates.requests_per_day = 0;
        updates.day_window_start = now.toISOString();
        needsUpdate = true;
      }

      if (needsUpdate) {
        await this.db.prepare(`
          UPDATE rate_limit_tracking 
          SET requests_per_minute = ?, requests_per_hour = ?, requests_per_day = ?,
              minute_window_start = ?, hour_window_start = ?, day_window_start = ?,
              updated_at = datetime('now')
          WHERE id = ?
        `).bind(
          updates.requests_per_minute,
          updates.requests_per_hour,
          updates.requests_per_day,
          updates.minute_window_start,
          updates.hour_window_start,
          updates.day_window_start,
          tracking.id
        ).run();
      }

      return updates;
    } catch (error) {
      console.error('Error updating tracking windows:', error);
      throw error;
    }
  }

  private checkLimitViolation(tracking: RateLimitTracking, limits: any): {
    type: 'minute' | 'hour' | 'day' | 'burst';
    severity: 'warning' | 'block' | 'escalate';
    duration: number;
    retry_after: number;
  } | null {
    // Check minute limit
    if (limits.minute && tracking.requests_per_minute >= limits.minute) {
      return {
        type: 'minute',
        severity: 'block',
        duration: 60, // 1 minute
        retry_after: 60
      };
    }

    // Check hour limit
    if (limits.hour && tracking.requests_per_hour >= limits.hour) {
      return {
        type: 'hour',
        severity: 'block',
        duration: 3600, // 1 hour
        retry_after: 3600
      };
    }

    // Check day limit
    if (limits.day && tracking.requests_per_day >= limits.day) {
      return {
        type: 'day',
        severity: 'escalate',
        duration: 86400, // 1 day
        retry_after: 86400
      };
    }

    // Check burst limit (based on requests in last 10 seconds)
    if (limits.burst) {
      // This would require more granular tracking in a real implementation
      // For now, we'll approximate based on minute counter
      const estimated_burst = Math.round(tracking.requests_per_minute / 6); // Rough estimate
      if (estimated_burst >= limits.burst) {
        return {
          type: 'burst',
          severity: 'warning',
          duration: 10, // 10 seconds
          retry_after: 10
        };
      }
    }

    return null;
  }

  private async recordViolation(tracking: RateLimitTracking, violation: any, request: RateLimitRequest): Promise<void> {
    try {
      const action_taken = {
        type: violation.severity,
        duration: violation.duration,
        timestamp: new Date().toISOString(),
        automatic: true
      };

      await this.db.prepare(`
        INSERT INTO rate_limit_violations 
        (tracking_id, identifier, endpoint, method, exceeded_limit, limit_value, 
         actual_requests, violation_severity, action_taken, user_agent, ip_address, request_headers)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        tracking.id,
        tracking.identifier,
        tracking.endpoint,
        tracking.method,
        violation.type,
        this.getLimitValue(violation.type, tracking),
        this.getCurrentCount(violation.type, tracking),
        violation.severity,
        JSON.stringify(action_taken),
        request.user_agent || null,
        request.ip_address || null,
        request.headers ? JSON.stringify(request.headers) : null
      ).run();

      // Update violation count
      await this.db.prepare(`
        UPDATE rate_limit_tracking 
        SET violations_count = violations_count + 1, last_violation_at = datetime('now')
        WHERE id = ?
      `).bind(tracking.id).run();
    } catch (error) {
      console.error('Error recording violation:', error);
    }
  }

  private async blockIdentifier(tracking_id: number, duration_seconds: number): Promise<void> {
    try {
      const block_expires = new Date();
      block_expires.setSeconds(block_expires.getSeconds() + duration_seconds);

      await this.db.prepare(`
        UPDATE rate_limit_tracking 
        SET is_blocked = 1, block_expires_at = ?, updated_at = datetime('now')
        WHERE id = ?
      `).bind(block_expires.toISOString(), tracking_id).run();
    } catch (error) {
      console.error('Error blocking identifier:', error);
    }
  }

  private async incrementCounters(tracking: RateLimitTracking): Promise<void> {
    try {
      await this.db.prepare(`
        UPDATE rate_limit_tracking 
        SET requests_per_minute = requests_per_minute + 1,
            requests_per_hour = requests_per_hour + 1,
            requests_per_day = requests_per_day + 1,
            last_request_at = datetime('now'),
            updated_at = datetime('now')
        WHERE id = ?
      `).bind(tracking.id).run();
    } catch (error) {
      console.error('Error incrementing counters:', error);
    }
  }

  private calculateTimeUntilReset(tracking: RateLimitTracking): {
    minute: number;
    hour: number;
    day: number;
  } {
    const now = new Date().getTime();
    const minuteStart = new Date(tracking.minute_window_start!).getTime();
    const hourStart = new Date(tracking.hour_window_start!).getTime();
    const dayStart = new Date(tracking.day_window_start!).getTime();

    return {
      minute: Math.max(0, 60 - Math.floor((now - minuteStart) / 1000)),
      hour: Math.max(0, 3600 - Math.floor((now - hourStart) / 1000)),
      day: Math.max(0, 86400 - Math.floor((now - dayStart) / 1000))
    };
  }

  private getLimitValue(type: string, tracking: RateLimitTracking): number {
    // This would need access to the rule to get actual limit values
    // For now, return a placeholder
    switch (type) {
      case 'minute': return 60;
      case 'hour': return 3600;
      case 'day': return 86400;
      case 'burst': return 10;
      default: return 0;
    }
  }

  private getCurrentCount(type: string, tracking: RateLimitTracking): number {
    switch (type) {
      case 'minute': return tracking.requests_per_minute;
      case 'hour': return tracking.requests_per_hour;
      case 'day': return tracking.requests_per_day;
      case 'burst': return Math.round(tracking.requests_per_minute / 6);
      default: return 0;
    }
  }
}