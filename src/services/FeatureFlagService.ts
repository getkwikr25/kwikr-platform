/**
 * FeatureFlagService - Dynamic Platform Feature Management
 * 
 * Provides comprehensive feature flag functionality:
 * - Dynamic feature enabling/disabling without deployments
 * - Gradual rollout and A/B testing capabilities
 * - User targeting and segmentation
 * - Environment-specific configurations
 * - Real-time flag evaluation with caching
 * - Analytics and usage tracking
 * - Rollback and safety mechanisms
 * 
 * Features:
 * - Boolean, string, number, and JSON flag types
 * - Percentage-based rollouts with consistent user assignment
 * - User targeting by ID, attributes, or custom conditions
 * - Environment separation (development, staging, production)
 * - Flag dependency management and prerequisites
 * - Evaluation analytics and performance metrics
 * - Webhook notifications for flag changes
 * - Audit trail and change history
 */

export interface FeatureFlag {
  id: number;
  flag_key: string;
  name: string;
  description?: string;
  flag_type: 'boolean' | 'string' | 'number' | 'json';
  default_value: string;
  environment: 'development' | 'staging' | 'production';
  status: 'active' | 'inactive' | 'archived';
  rollout_percentage: number;
  target_users?: number[];
  target_conditions?: any;
  prerequisites?: string[]; // Other flags that must be enabled
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface FlagEvaluation {
  flag_key: string;
  user_id?: number;
  value: any;
  reason: 'default' | 'targeted' | 'rollout' | 'prerequisite_failed' | 'flag_disabled';
  evaluation_context?: any;
  timestamp: string;
}

export interface FlagAnalytics {
  flag_key: string;
  total_evaluations: number;
  unique_users: number;
  evaluations_by_value: Record<string, number>;
  evaluations_by_reason: Record<string, number>;
  time_period: string;
}

export interface UserContext {
  user_id?: number;
  user_attributes?: Record<string, any>;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  custom_attributes?: Record<string, any>;
}

export interface FlagUpdateEvent {
  flag_key: string;
  previous_value?: any;
  new_value: any;
  updated_by: number;
  change_reason?: string;
  timestamp: string;
}

export class FeatureFlagService {
  private db: D1Database;
  private cache: Map<string, { flag: FeatureFlag; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private webhookCallbacks: Map<string, (event: FlagUpdateEvent) => void> = new Map();

  constructor(db: D1Database) {
    this.db = db;
  }

  // ================================
  // FLAG MANAGEMENT METHODS
  // ================================

  /**
   * Create a new feature flag
   */
  async createFlag(data: {
    flag_key: string;
    name: string;
    description?: string;
    flag_type?: 'boolean' | 'string' | 'number' | 'json';
    default_value: string;
    environment?: string;
    rollout_percentage?: number;
    target_users?: number[];
    target_conditions?: any;
    prerequisites?: string[];
    created_by: number;
  }): Promise<FeatureFlag> {
    try {
      // Validate flag key format
      if (!/^[a-z0-9_]+$/.test(data.flag_key)) {
        throw new Error('Flag key must contain only lowercase letters, numbers, and underscores');
      }

      // Check if flag key already exists
      const existing = await this.db.prepare(`
        SELECT id FROM feature_flags WHERE flag_key = ?
      `).bind(data.flag_key).first();

      if (existing) {
        throw new Error('Flag key already exists');
      }

      // Validate prerequisites
      if (data.prerequisites && data.prerequisites.length > 0) {
        await this.validatePrerequisites(data.prerequisites);
      }

      const result = await this.db.prepare(`
        INSERT INTO feature_flags 
        (flag_key, name, description, flag_type, default_value, environment, 
         rollout_percentage, target_users, target_conditions, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        data.flag_key,
        data.name,
        data.description || null,
        data.flag_type || 'boolean',
        data.default_value,
        data.environment || 'production',
        data.rollout_percentage || 0,
        data.target_users ? JSON.stringify(data.target_users) : null,
        data.target_conditions ? JSON.stringify(data.target_conditions) : null,
        data.created_by
      ).run();

      // Record flag creation in history
      await this.recordFlagHistory(
        result.meta.last_row_id as number,
        data.created_by,
        'created',
        null,
        data.default_value,
        'Flag created'
      );

      const flag = await this.getFlagById(result.meta.last_row_id as number);
      
      // Trigger webhook
      this.triggerWebhooks({
        flag_key: data.flag_key,
        new_value: data.default_value,
        updated_by: data.created_by,
        change_reason: 'Flag created',
        timestamp: new Date().toISOString()
      });

      return flag;
    } catch (error) {
      console.error('Error creating feature flag:', error);
      throw error;
    }
  }

  /**
   * Update an existing feature flag
   */
  async updateFlag(flagId: number, data: {
    name?: string;
    description?: string;
    default_value?: string;
    status?: 'active' | 'inactive' | 'archived';
    rollout_percentage?: number;
    target_users?: number[];
    target_conditions?: any;
    prerequisites?: string[];
    updated_by: number;
    change_reason?: string;
  }): Promise<FeatureFlag> {
    try {
      // Get current flag for comparison
      const currentFlag = await this.getFlagById(flagId);
      if (!currentFlag) {
        throw new Error('Flag not found');
      }

      // Validate prerequisites if provided
      if (data.prerequisites && data.prerequisites.length > 0) {
        await this.validatePrerequisites(data.prerequisites);
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) {
        updates.push('name = ?');
        values.push(data.name);
      }
      if (data.description !== undefined) {
        updates.push('description = ?');
        values.push(data.description);
      }
      if (data.default_value !== undefined) {
        updates.push('default_value = ?');
        values.push(data.default_value);
      }
      if (data.status !== undefined) {
        updates.push('status = ?');
        values.push(data.status);
      }
      if (data.rollout_percentage !== undefined) {
        updates.push('rollout_percentage = ?');
        values.push(data.rollout_percentage);
      }
      if (data.target_users !== undefined) {
        updates.push('target_users = ?');
        values.push(JSON.stringify(data.target_users));
      }
      if (data.target_conditions !== undefined) {
        updates.push('target_conditions = ?');
        values.push(JSON.stringify(data.target_conditions));
      }

      updates.push('updated_by = ?');
      values.push(data.updated_by);

      if (updates.length === 1) { // Only updated_by
        throw new Error('No updates provided');
      }

      values.push(flagId);

      await this.db.prepare(`
        UPDATE feature_flags 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(...values).run();

      // Record change in history
      await this.recordFlagHistory(
        flagId,
        data.updated_by,
        'updated',
        currentFlag.default_value,
        data.default_value || currentFlag.default_value,
        data.change_reason || 'Flag updated',
        data.rollout_percentage
      );

      // Clear cache for this flag
      this.cache.delete(currentFlag.flag_key);

      const updatedFlag = await this.getFlagById(flagId);

      // Trigger webhook
      this.triggerWebhooks({
        flag_key: currentFlag.flag_key,
        previous_value: currentFlag.default_value,
        new_value: updatedFlag.default_value,
        updated_by: data.updated_by,
        change_reason: data.change_reason || 'Flag updated',
        timestamp: new Date().toISOString()
      });

      return updatedFlag;
    } catch (error) {
      console.error('Error updating feature flag:', error);
      throw error;
    }
  }

  /**
   * Get all feature flags with optional filtering
   */
  async getFlags(filters: {
    environment?: string;
    status?: string;
    created_by?: number;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<FeatureFlag[]> {
    try {
      let whereClause = 'WHERE 1=1';
      const values: any[] = [];

      if (filters.environment) {
        whereClause += ' AND environment = ?';
        values.push(filters.environment);
      }
      if (filters.status) {
        whereClause += ' AND status = ?';
        values.push(filters.status);
      }
      if (filters.created_by) {
        whereClause += ' AND created_by = ?';
        values.push(filters.created_by);
      }
      if (filters.search) {
        whereClause += ' AND (flag_key LIKE ? OR name LIKE ? OR description LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        values.push(searchTerm, searchTerm, searchTerm);
      }

      const limit = filters.limit || 100;
      const offset = filters.offset || 0;
      values.push(limit, offset);

      const result = await this.db.prepare(`
        SELECT * FROM feature_flags 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).bind(...values).all();

      return result.results.map((row: any) => ({
        ...row,
        target_users: row.target_users ? JSON.parse(row.target_users) : null,
        target_conditions: row.target_conditions ? JSON.parse(row.target_conditions) : null
      }));
    } catch (error) {
      console.error('Error getting feature flags:', error);
      throw new Error('Failed to get feature flags');
    }
  }

  // ================================
  // FLAG EVALUATION METHODS
  // ================================

  /**
   * Evaluate a feature flag for a user
   */
  async evaluateFlag(
    flagKey: string, 
    userContext?: UserContext,
    environment: string = 'production'
  ): Promise<FlagEvaluation> {
    try {
      const flag = await this.getFlagByKey(flagKey, environment);
      
      if (!flag) {
        return {
          flag_key: flagKey,
          user_id: userContext?.user_id,
          value: null,
          reason: 'flag_disabled',
          evaluation_context: userContext,
          timestamp: new Date().toISOString()
        };
      }

      if (flag.status !== 'active') {
        return {
          flag_key: flagKey,
          user_id: userContext?.user_id,
          value: this.parseValue(flag.default_value, flag.flag_type),
          reason: 'flag_disabled',
          evaluation_context: userContext,
          timestamp: new Date().toISOString()
        };
      }

      // Check prerequisites
      if (flag.prerequisites && flag.prerequisites.length > 0) {
        const prerequisitesMet = await this.checkPrerequisites(flag.prerequisites, userContext, environment);
        if (!prerequisitesMet) {
          return {
            flag_key: flagKey,
            user_id: userContext?.user_id,
            value: this.parseValue(flag.default_value, flag.flag_type),
            reason: 'prerequisite_failed',
            evaluation_context: userContext,
            timestamp: new Date().toISOString()
          };
        }
      }

      // Check target users
      if (flag.target_users && flag.target_users.length > 0 && userContext?.user_id) {
        if (flag.target_users.includes(userContext.user_id)) {
          const evaluation = {
            flag_key: flagKey,
            user_id: userContext.user_id,
            value: this.parseValue(flag.default_value, flag.flag_type),
            reason: 'targeted' as const,
            evaluation_context: userContext,
            timestamp: new Date().toISOString()
          };
          
          await this.recordEvaluation(evaluation);
          return evaluation;
        }
      }

      // Check target conditions
      if (flag.target_conditions && userContext) {
        const conditionsMet = this.evaluateConditions(flag.target_conditions, userContext);
        if (conditionsMet) {
          const evaluation = {
            flag_key: flagKey,
            user_id: userContext.user_id,
            value: this.parseValue(flag.default_value, flag.flag_type),
            reason: 'targeted' as const,
            evaluation_context: userContext,
            timestamp: new Date().toISOString()
          };
          
          await this.recordEvaluation(evaluation);
          return evaluation;
        }
      }

      // Check rollout percentage
      if (flag.rollout_percentage > 0 && userContext?.user_id) {
        const userHash = this.getUserHash(userContext.user_id, flagKey);
        if (userHash <= flag.rollout_percentage) {
          const evaluation = {
            flag_key: flagKey,
            user_id: userContext.user_id,
            value: this.parseValue(flag.default_value, flag.flag_type),
            reason: 'rollout' as const,
            evaluation_context: userContext,
            timestamp: new Date().toISOString()
          };
          
          await this.recordEvaluation(evaluation);
          return evaluation;
        }
      }

      // Default case
      const defaultEvaluation = {
        flag_key: flagKey,
        user_id: userContext?.user_id,
        value: flag.flag_type === 'boolean' ? false : null,
        reason: 'default' as const,
        evaluation_context: userContext,
        timestamp: new Date().toISOString()
      };

      await this.recordEvaluation(defaultEvaluation);
      return defaultEvaluation;
    } catch (error) {
      console.error('Error evaluating feature flag:', error);
      
      // Return safe default on error
      return {
        flag_key: flagKey,
        user_id: userContext?.user_id,
        value: null,
        reason: 'flag_disabled',
        evaluation_context: userContext,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Evaluate multiple flags at once
   */
  async evaluateFlags(
    flagKeys: string[],
    userContext?: UserContext,
    environment: string = 'production'
  ): Promise<Record<string, any>> {
    try {
      const evaluations = await Promise.all(
        flagKeys.map(key => this.evaluateFlag(key, userContext, environment))
      );

      return evaluations.reduce((acc, evaluation) => {
        acc[evaluation.flag_key] = evaluation.value;
        return acc;
      }, {} as Record<string, any>);
    } catch (error) {
      console.error('Error evaluating multiple feature flags:', error);
      
      // Return safe defaults for all flags
      return flagKeys.reduce((acc, key) => {
        acc[key] = null;
        return acc;
      }, {} as Record<string, any>);
    }
  }

  // ================================
  // ANALYTICS AND REPORTING METHODS
  // ================================

  /**
   * Get flag analytics
   */
  async getFlagAnalytics(
    flagKey: string,
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<FlagAnalytics> {
    try {
      const timeCondition = this.getTimeCondition(timeRange);

      const [totalEvaluations, uniqueUsers, valueBreakdown, reasonBreakdown] = await Promise.all([
        // Total evaluations
        this.db.prepare(`
          SELECT COUNT(*) as count FROM feature_flag_evaluations 
          WHERE flag_id = (SELECT id FROM feature_flags WHERE flag_key = ?) 
            AND timestamp > ${timeCondition}
        `).bind(flagKey).first(),

        // Unique users
        this.db.prepare(`
          SELECT COUNT(DISTINCT user_id) as count FROM feature_flag_evaluations 
          WHERE flag_id = (SELECT id FROM feature_flags WHERE flag_key = ?) 
            AND timestamp > ${timeCondition} 
            AND user_id IS NOT NULL
        `).bind(flagKey).first(),

        // Evaluations by value
        this.db.prepare(`
          SELECT evaluated_value, COUNT(*) as count 
          FROM feature_flag_evaluations 
          WHERE flag_id = (SELECT id FROM feature_flags WHERE flag_key = ?) 
            AND timestamp > ${timeCondition}
          GROUP BY evaluated_value
        `).bind(flagKey).all(),

        // Evaluations by reason (would need to add reason column to track this)
        Promise.resolve({ results: [] })
      ]);

      const evaluationsByValue = valueBreakdown.results.reduce((acc: any, row: any) => {
        acc[row.evaluated_value] = row.count;
        return acc;
      }, {});

      const evaluationsByReason = reasonBreakdown.results.reduce((acc: any, row: any) => {
        acc[row.reason || 'unknown'] = row.count;
        return acc;
      }, {});

      return {
        flag_key: flagKey,
        total_evaluations: totalEvaluations?.count || 0,
        unique_users: uniqueUsers?.count || 0,
        evaluations_by_value: evaluationsByValue,
        evaluations_by_reason: evaluationsByReason,
        time_period: timeRange
      };
    } catch (error) {
      console.error('Error getting flag analytics:', error);
      throw new Error('Failed to get flag analytics');
    }
  }

  /**
   * Get flag usage trends
   */
  async getFlagUsageTrends(
    flagKey: string,
    timeRange: '24h' | '7d' | '30d' = '24h',
    interval: 'hour' | 'day' = 'hour'
  ): Promise<any[]> {
    try {
      const timeCondition = this.getTimeCondition(timeRange);
      const timeFormat = this.getTimeFormat(interval);

      const result = await this.db.prepare(`
        SELECT 
          ${timeFormat} as time_bucket,
          COUNT(*) as total_evaluations,
          COUNT(DISTINCT user_id) as unique_users
        FROM feature_flag_evaluations 
        WHERE flag_id = (SELECT id FROM feature_flags WHERE flag_key = ?) 
          AND timestamp > ${timeCondition}
        GROUP BY ${timeFormat}
        ORDER BY time_bucket ASC
      `).bind(flagKey).all();

      return result.results;
    } catch (error) {
      console.error('Error getting flag usage trends:', error);
      throw new Error('Failed to get flag usage trends');
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  private async getFlagById(id: number): Promise<FeatureFlag> {
    const result = await this.db.prepare(`
      SELECT * FROM feature_flags WHERE id = ?
    `).bind(id).first();

    if (!result) {
      throw new Error('Flag not found');
    }

    return {
      ...result,
      target_users: result.target_users ? JSON.parse(result.target_users) : null,
      target_conditions: result.target_conditions ? JSON.parse(result.target_conditions) : null
    } as FeatureFlag;
  }

  private async getFlagByKey(flagKey: string, environment: string): Promise<FeatureFlag | null> {
    // Check cache first
    const cacheKey = `${flagKey}:${environment}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.flag;
    }

    // Fetch from database
    const result = await this.db.prepare(`
      SELECT * FROM feature_flags 
      WHERE flag_key = ? AND environment = ?
    `).bind(flagKey, environment).first();

    if (!result) {
      return null;
    }

    const flag: FeatureFlag = {
      ...result,
      target_users: result.target_users ? JSON.parse(result.target_users) : null,
      target_conditions: result.target_conditions ? JSON.parse(result.target_conditions) : null
    } as FeatureFlag;

    // Cache the flag
    this.cache.set(cacheKey, {
      flag,
      timestamp: Date.now()
    });

    return flag;
  }

  private parseValue(value: string, type: string): any {
    switch (type) {
      case 'boolean':
        return value === 'true';
      case 'number':
        return parseFloat(value);
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      default:
        return value;
    }
  }

  private getUserHash(userId: number, salt: string): number {
    // Simple hash function for consistent user assignment
    const str = `${userId}-${salt}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  private evaluateConditions(conditions: any, userContext: UserContext): boolean {
    try {
      // Simple condition evaluation - can be extended for complex rules
      if (!conditions || typeof conditions !== 'object') {
        return false;
      }

      // Example: { "user_attributes.premium": true, "user_attributes.region": "US" }
      for (const [key, expectedValue] of Object.entries(conditions)) {
        const actualValue = this.getNestedValue(userContext, key);
        if (actualValue !== expectedValue) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error evaluating conditions:', error);
      return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async validatePrerequisites(prerequisites: string[]): Promise<void> {
    for (const prereqKey of prerequisites) {
      const exists = await this.db.prepare(`
        SELECT id FROM feature_flags WHERE flag_key = ?
      `).bind(prereqKey).first();

      if (!exists) {
        throw new Error(`Prerequisite flag '${prereqKey}' does not exist`);
      }
    }
  }

  private async checkPrerequisites(
    prerequisites: string[],
    userContext?: UserContext,
    environment: string = 'production'
  ): Promise<boolean> {
    for (const prereqKey of prerequisites) {
      const evaluation = await this.evaluateFlag(prereqKey, userContext, environment);
      if (!evaluation.value) {
        return false;
      }
    }
    return true;
  }

  private async recordEvaluation(evaluation: FlagEvaluation): Promise<void> {
    try {
      const flag = await this.getFlagByKey(evaluation.flag_key, 'production');
      if (!flag) return;

      await this.db.prepare(`
        INSERT INTO feature_flag_evaluations (flag_id, user_id, evaluated_value, evaluation_context)
        VALUES (?, ?, ?, ?)
      `).bind(
        flag.id,
        evaluation.user_id || null,
        String(evaluation.value),
        evaluation.evaluation_context ? JSON.stringify(evaluation.evaluation_context) : null
      ).run();
    } catch (error) {
      console.error('Error recording flag evaluation:', error);
      // Don't throw - evaluation recording shouldn't break flag evaluation
    }
  }

  private async recordFlagHistory(
    flagId: number,
    adminUserId: number,
    action: string,
    previousValue?: string,
    newValue?: string,
    changeReason?: string,
    rolloutPercentage?: number
  ): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO feature_flag_history 
        (flag_id, admin_user_id, action, previous_value, new_value, change_reason, rollout_percentage)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        flagId,
        adminUserId,
        action,
        previousValue || null,
        newValue || null,
        changeReason || null,
        rolloutPercentage || null
      ).run();
    } catch (error) {
      console.error('Error recording flag history:', error);
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
      'hour': "datetime(timestamp, 'start of day', '+' || strftime('%H', timestamp) || ' hours')",
      'day': "date(timestamp)"
    };
    return formats[interval] || formats['hour'];
  }

  private triggerWebhooks(event: FlagUpdateEvent): void {
    this.webhookCallbacks.forEach((callback, key) => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in webhook callback ${key}:`, error);
      }
    });
  }

  /**
   * Register webhook callback for flag changes
   */
  public registerWebhook(key: string, callback: (event: FlagUpdateEvent) => void): void {
    this.webhookCallbacks.set(key, callback);
  }

  /**
   * Unregister webhook callback
   */
  public unregisterWebhook(key: string): void {
    this.webhookCallbacks.delete(key);
  }

  /**
   * Clear flag cache
   */
  public clearCache(flagKey?: string): void {
    if (flagKey) {
      // Clear specific flag from all environments
      for (const key of this.cache.keys()) {
        if (key.startsWith(flagKey + ':')) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}