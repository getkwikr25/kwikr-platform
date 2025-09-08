/**
 * AdminService - Comprehensive Administrative Management System
 * 
 * Provides complete administrative functionality for the platform:
 * 1. Admin Dashboard - Platform overview and metrics
 * 2. User Management - Admin user controls
 * 3. Content Moderation - Review posts, profiles, messages  
 * 4. Financial Reporting - Revenue and commission reports
 * 5. System Monitoring - Performance and error tracking
 * 6. Feature Flags - Enable/disable platform features
 * 
 * Features:
 * - Role-based access control with hierarchical permissions
 * - Real-time dashboard metrics and analytics
 * - Comprehensive content moderation workflow
 * - Advanced financial reporting and revenue tracking
 * - System performance monitoring and error tracking
 * - Dynamic feature flag management with targeting
 * - Audit logging for all administrative actions
 * - Security controls and access restrictions
 */

export interface AdminUser {
  id: number;
  user_id: number;
  admin_role_id: number;
  status: 'active' | 'suspended' | 'inactive';
  assigned_by?: number;
  assigned_at: string;
  last_login?: string;
  login_count: number;
  two_factor_enabled: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  role_name?: string;
  role_permissions?: string[];
  user_email?: string;
  user_name?: string;
}

export interface AdminRole {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
  hierarchy_level: number;
  created_at: string;
  updated_at: string;
}

export interface ModerationItem {
  id: number;
  content_type: 'post' | 'profile' | 'message' | 'file' | 'comment';
  content_id: number;
  reported_by?: number;
  auto_flagged: boolean;
  flag_reasons: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  assigned_to?: number;
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
  action_taken?: string;
  escalation_reason?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  reporter_name?: string;
  assignee_name?: string;
  reviewer_name?: string;
  content_preview?: string;
}

export interface RevenueRecord {
  id: number;
  transaction_type: 'subscription' | 'commission' | 'fee' | 'refund';
  user_id?: number;
  amount: number;
  currency: string;
  payment_method?: string;
  transaction_id?: string;
  commission_rate?: number;
  platform_fee: number;
  net_amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  processed_at?: string;
  category?: string;
  description?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

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
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface SystemMetric {
  id: number;
  metric_type: string;
  metric_value: number;
  unit: string;
  timestamp: string;
  source?: string;
  metadata?: any;
}

export interface ErrorLog {
  id: number;
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
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'ignored';
  assigned_to?: number;
  resolution_notes?: string;
  resolved_at?: string;
  occurrence_count: number;
  first_seen: string;
  last_seen: string;
  created_at: string;
}

export interface DashboardMetrics {
  total_users: { value: number; change: number; period: string };
  active_users: { value: number; change: number; period: string };
  new_users_today: { value: number; change: number; period: string };
  total_revenue: { value: number; change: number; period: string };
  monthly_revenue: { value: number; change: number; period: string };
  revenue_growth: { value: number; change: number; period: string };
  total_files: { value: number; change: number; period: string };
  storage_used: { value: number; change: number; period: string };
  moderation_queue: { value: number; change: number; period: string };
  pending_reviews: { value: number; change: number; period: string };
  error_rate: { value: number; change: number; period: string };
  response_time: { value: number; change: number; period: string };
  system_alerts: { value: number; change: number; period: string };
  active_flags: { value: number; change: number; period: string };
}

export interface FinancialReport {
  report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  report_date: string;
  total_revenue: number;
  total_commissions: number;
  total_fees: number;
  total_refunds: number;
  net_profit: number;
  transaction_count: number;
  active_users: number;
  new_users: number;
  report_data: any;
  generated_at: string;
}

export class AdminService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  // ================================
  // 1. ADMIN DASHBOARD METHODS
  // ================================

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Check cache first
      const cached = await this.db.prepare(`
        SELECT metric_value FROM dashboard_metrics 
        WHERE metric_key = 'dashboard_overview' 
          AND expires_at > datetime('now')
      `).first();

      if (cached) {
        return JSON.parse(cached.metric_value as string);
      }

      // Calculate fresh metrics
      const [
        userStats,
        revenueStats,
        fileStats,
        moderationStats,
        systemStats,
        flagStats
      ] = await Promise.all([
        this.calculateUserMetrics(),
        this.calculateRevenueMetrics(),
        this.calculateFileMetrics(),
        this.calculateModerationMetrics(),
        this.calculateSystemMetrics(),
        this.calculateFeatureFlagMetrics()
      ]);

      const metrics: DashboardMetrics = {
        ...userStats,
        ...revenueStats,
        ...fileStats,
        ...moderationStats,
        ...systemStats,
        ...flagStats
      };

      // Cache for 5 minutes
      await this.db.prepare(`
        INSERT OR REPLACE INTO dashboard_metrics (metric_key, metric_value, expires_at)
        VALUES ('dashboard_overview', ?, datetime('now', '+5 minutes'))
      `).bind(JSON.stringify(metrics)).run();

      return metrics;
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      throw new Error('Failed to get dashboard metrics');
    }
  }

  private async calculateUserMetrics() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const [totalUsers, activeUsers, newUsersToday, newUsersYesterday] = await Promise.all([
      this.db.prepare('SELECT COUNT(*) as count FROM users').first(),
      this.db.prepare(`
        SELECT COUNT(*) as count FROM users 
        WHERE last_login > datetime('now', '-24 hours')
      `).first(),
      this.db.prepare(`
        SELECT COUNT(*) as count FROM users 
        WHERE DATE(created_at) = ?
      `).bind(today).first(),
      this.db.prepare(`
        SELECT COUNT(*) as count FROM users 
        WHERE DATE(created_at) = ?
      `).bind(yesterday).first()
    ]);

    const newTodayCount = newUsersToday?.count || 0;
    const newYesterdayCount = newUsersYesterday?.count || 0;
    const newUserChange = newYesterdayCount > 0 
      ? ((newTodayCount - newYesterdayCount) / newYesterdayCount * 100)
      : newTodayCount > 0 ? 100 : 0;

    return {
      total_users: { value: totalUsers?.count || 0, change: 0, period: '24h' },
      active_users: { value: activeUsers?.count || 0, change: 0, period: '24h' },
      new_users_today: { value: newTodayCount, change: newUserChange, period: '24h' }
    };
  }

  private async calculateRevenueMetrics() {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const [totalRevenue, monthlyRevenue] = await Promise.all([
      this.db.prepare(`
        SELECT COALESCE(SUM(net_amount), 0) as total 
        FROM revenue_records 
        WHERE status = 'completed'
      `).first(),
      this.db.prepare(`
        SELECT COALESCE(SUM(net_amount), 0) as total 
        FROM revenue_records 
        WHERE status = 'completed' AND DATE(created_at) LIKE ?
      `).bind(`${thisMonth}%`).first()
    ]);

    return {
      total_revenue: { value: totalRevenue?.total || 0, change: 0, period: 'all' },
      monthly_revenue: { value: monthlyRevenue?.total || 0, change: 0, period: 'month' },
      revenue_growth: { value: 0, change: 0, period: 'month' }
    };
  }

  private async calculateFileMetrics() {
    // Return default values since files table doesn't exist yet
    // TODO: Create files table when file upload feature is implemented
    return {
      total_files: { value: 0, change: 0, period: '24h' },
      storage_used: { value: 0, change: 0, period: '24h' } // MB
    };
  }

  private async calculateModerationMetrics() {
    const [queueCount, pendingReviews] = await Promise.all([
      this.db.prepare(`SELECT COUNT(*) as count FROM moderation_queue WHERE status = 'pending'`).first(),
      this.db.prepare(`SELECT COUNT(*) as count FROM moderation_queue WHERE status IN ('pending', 'escalated')`).first()
    ]);

    return {
      moderation_queue: { value: queueCount?.count || 0, change: 0, period: '24h' },
      pending_reviews: { value: pendingReviews?.count || 0, change: 0, period: '24h' }
    };
  }

  private async calculateSystemMetrics() {
    const errorCount = await this.db.prepare(`
      SELECT COUNT(*) as count FROM error_logs 
      WHERE created_at > datetime('now', '-24 hours') AND severity IN ('high', 'critical')
    `).first();

    return {
      error_rate: { value: errorCount?.count || 0, change: 0, period: '24h' },
      response_time: { value: 0, change: 0, period: '24h' },
      system_alerts: { value: 0, change: 0, period: '24h' } // TODO: Create system_alerts table when needed
    };
  }

  private async calculateFeatureFlagMetrics() {
    const activeFlags = await this.db.prepare(`
      SELECT COUNT(*) as count FROM feature_flags WHERE status = 'active'
    `).first();

    return {
      active_flags: { value: activeFlags?.count || 0, change: 0, period: '24h' }
    };
  }

  /**
   * Get recent admin activities
   */
  async getRecentAdminActivities(limit: number = 50): Promise<any[]> {
    try {
      const result = await this.db.prepare(`
        SELECT 
          aa.*,
          au.user_id,
          (u.first_name || ' ' || u.last_name) as admin_name,
          u.email as admin_email
        FROM admin_activities aa
        LEFT JOIN admin_users au ON aa.admin_user_id = au.id
        LEFT JOIN users u ON au.user_id = u.id
        ORDER BY aa.created_at DESC
        LIMIT ?
      `).bind(limit).all();

      return result.results.map((row: any) => ({
        ...row,
        details: row.details ? JSON.parse(row.details) : null
      }));
    } catch (error) {
      console.error('Error getting recent admin activities:', error);
      throw new Error('Failed to get admin activities');
    }
  }

  // ================================
  // 2. USER MANAGEMENT METHODS
  // ================================

  /**
   * Get all admin users with role information
   */
  async getAdminUsers(limit: number = 100, offset: number = 0): Promise<AdminUser[]> {
    try {
      const result = await this.db.prepare(`
        SELECT 
          au.*,
          ar.role_name as role_name,
          ar.permissions,
          (u.first_name || ' ' || u.last_name) as user_name,
          u.email as user_email
        FROM admin_users au
        LEFT JOIN admin_roles ar ON au.admin_role_id = ar.id
        LEFT JOIN users u ON au.user_id = u.id
        ORDER BY au.created_at DESC
        LIMIT ? OFFSET ?
      `).bind(limit, offset).all();

      return result.results.map((row: any) => ({
        ...row,
        role_permissions: row.permissions ? JSON.parse(row.permissions) : []
      }));
    } catch (error) {
      console.error('Error getting admin users:', error);
      throw new Error('Failed to get admin users');
    }
  }

  /**
   * Create new admin user
   */
  async createAdminUser(data: {
    user_id: number;
    admin_role_id: number;
    assigned_by: number;
    notes?: string;
  }): Promise<AdminUser> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO admin_users (user_id, admin_role_id, assigned_by, notes)
        VALUES (?, ?, ?, ?)
      `).bind(data.user_id, data.admin_role_id, data.assigned_by, data.notes || null).run();

      // Log the action
      await this.logAdminActivity(data.assigned_by, 'admin_user_created', 'admin_user', result.meta.last_row_id, {
        target_user_id: data.user_id,
        role_id: data.admin_role_id
      });

      // Get the created admin user
      const adminUser = await this.db.prepare(`
        SELECT 
          au.*,
          ar.role_name as role_name,
          ar.permissions,
          (u.first_name || ' ' || u.last_name) as user_name,
          u.email as user_email
        FROM admin_users au
        LEFT JOIN admin_roles ar ON au.admin_role_id = ar.id
        LEFT JOIN users u ON au.user_id = u.id
        WHERE au.id = ?
      `).bind(result.meta.last_row_id).first();

      return {
        ...adminUser,
        role_permissions: adminUser.permissions ? JSON.parse(adminUser.permissions) : []
      } as AdminUser;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw new Error('Failed to create admin user');
    }
  }

  /**
   * Update admin user
   */
  async updateAdminUser(id: number, data: {
    admin_role_id?: number;
    status?: 'active' | 'suspended' | 'inactive';
    notes?: string;
    updated_by: number;
  }): Promise<AdminUser> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.admin_role_id !== undefined) {
        updates.push('admin_role_id = ?');
        values.push(data.admin_role_id);
      }
      if (data.status !== undefined) {
        updates.push('status = ?');
        values.push(data.status);
      }
      if (data.notes !== undefined) {
        updates.push('notes = ?');
        values.push(data.notes);
      }

      if (updates.length === 0) {
        throw new Error('No updates provided');
      }

      values.push(id);

      await this.db.prepare(`
        UPDATE admin_users 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(...values).run();

      // Log the action
      await this.logAdminActivity(data.updated_by, 'admin_user_updated', 'admin_user', id, data);

      // Return updated admin user
      const adminUser = await this.db.prepare(`
        SELECT 
          au.*,
          ar.role_name as role_name,
          ar.permissions,
          (u.first_name || ' ' || u.last_name) as user_name,
          u.email as user_email
        FROM admin_users au
        LEFT JOIN admin_roles ar ON au.admin_role_id = ar.id
        LEFT JOIN users u ON au.user_id = u.id
        WHERE au.id = ?
      `).bind(id).first();

      return {
        ...adminUser,
        role_permissions: adminUser.permissions ? JSON.parse(adminUser.permissions) : []
      } as AdminUser;
    } catch (error) {
      console.error('Error updating admin user:', error);
      throw new Error('Failed to update admin user');
    }
  }

  /**
   * Get all admin roles
   */
  async getAdminRoles(): Promise<AdminRole[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM admin_roles ORDER BY hierarchy_level DESC
      `).all();

      return result.results.map((row: any) => ({
        ...row,
        permissions: JSON.parse(row.permissions)
      }));
    } catch (error) {
      console.error('Error getting admin roles:', error);
      throw new Error('Failed to get admin roles');
    }
  }

  // ================================
  // 3. CONTENT MODERATION METHODS
  // ================================

  /**
   * Get moderation queue items
   */
  async getModerationQueue(filters: {
    status?: string;
    priority?: string;
    content_type?: string;
    assigned_to?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<ModerationItem[]> {
    try {
      let whereClause = 'WHERE 1=1';
      const values: any[] = [];

      if (filters.status) {
        whereClause += ' AND mq.status = ?';
        values.push(filters.status);
      }
      if (filters.priority) {
        whereClause += ' AND mq.priority = ?';
        values.push(filters.priority);
      }
      if (filters.content_type) {
        whereClause += ' AND mq.content_type = ?';
        values.push(filters.content_type);
      }
      if (filters.assigned_to) {
        whereClause += ' AND mq.assigned_to = ?';
        values.push(filters.assigned_to);
      }

      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      values.push(limit, offset);

      const result = await this.db.prepare(`
        SELECT 
          mq.*,
          ru.name as reporter_name,
          au.name as assignee_name,
          reu.name as reviewer_name
        FROM moderation_queue mq
        LEFT JOIN users ru ON mq.reported_by = ru.id
        LEFT JOIN admin_users aa ON mq.assigned_to = aa.id
        LEFT JOIN users au ON aa.user_id = au.id
        LEFT JOIN admin_users ra ON mq.reviewed_by = ra.id
        LEFT JOIN users reu ON ra.user_id = reu.id
        ${whereClause}
        ORDER BY 
          CASE mq.priority 
            WHEN 'urgent' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'medium' THEN 3 
            WHEN 'low' THEN 4 
          END,
          mq.created_at ASC
        LIMIT ? OFFSET ?
      `).bind(...values).all();

      return result.results.map((row: any) => ({
        ...row,
        flag_reasons: row.flag_reasons ? JSON.parse(row.flag_reasons) : []
      }));
    } catch (error) {
      console.error('Error getting moderation queue:', error);
      throw new Error('Failed to get moderation queue');
    }
  }

  /**
   * Add item to moderation queue
   */
  async addToModerationQueue(data: {
    content_type: 'post' | 'profile' | 'message' | 'file' | 'comment';
    content_id: number;
    reported_by?: number;
    flag_reasons: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    auto_flagged?: boolean;
  }): Promise<ModerationItem> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO moderation_queue 
        (content_type, content_id, reported_by, flag_reasons, priority, auto_flagged)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        data.content_type,
        data.content_id,
        data.reported_by || null,
        JSON.stringify(data.flag_reasons),
        data.priority || 'medium',
        data.auto_flagged || false
      ).run();

      return this.getModerationItem(result.meta.last_row_id as number);
    } catch (error) {
      console.error('Error adding to moderation queue:', error);
      throw new Error('Failed to add to moderation queue');
    }
  }

  /**
   * Update moderation item
   */
  async updateModerationItem(id: number, data: {
    status?: 'pending' | 'approved' | 'rejected' | 'escalated';
    assigned_to?: number;
    reviewed_by?: number;
    review_notes?: string;
    action_taken?: string;
    escalation_reason?: string;
  }): Promise<ModerationItem> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.status !== undefined) {
        updates.push('status = ?');
        values.push(data.status);
        if (data.status !== 'pending') {
          updates.push('reviewed_at = CURRENT_TIMESTAMP');
        }
      }
      if (data.assigned_to !== undefined) {
        updates.push('assigned_to = ?');
        values.push(data.assigned_to);
      }
      if (data.reviewed_by !== undefined) {
        updates.push('reviewed_by = ?');
        values.push(data.reviewed_by);
      }
      if (data.review_notes !== undefined) {
        updates.push('review_notes = ?');
        values.push(data.review_notes);
      }
      if (data.action_taken !== undefined) {
        updates.push('action_taken = ?');
        values.push(data.action_taken);
      }
      if (data.escalation_reason !== undefined) {
        updates.push('escalation_reason = ?');
        values.push(data.escalation_reason);
      }

      if (updates.length === 0) {
        throw new Error('No updates provided');
      }

      values.push(id);

      await this.db.prepare(`
        UPDATE moderation_queue 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(...values).run();

      // Add to moderation history
      if (data.reviewed_by) {
        await this.db.prepare(`
          INSERT INTO moderation_history (queue_id, admin_user_id, action, new_status, notes)
          VALUES (?, ?, 'status_updated', ?, ?)
        `).bind(id, data.reviewed_by, data.status || 'updated', data.review_notes || '').run();
      }

      return this.getModerationItem(id);
    } catch (error) {
      console.error('Error updating moderation item:', error);
      throw new Error('Failed to update moderation item');
    }
  }

  private async getModerationItem(id: number): Promise<ModerationItem> {
    const result = await this.db.prepare(`
      SELECT 
        mq.*,
        ru.name as reporter_name,
        au.name as assignee_name,
        reu.name as reviewer_name
      FROM moderation_queue mq
      LEFT JOIN users ru ON mq.reported_by = ru.id
      LEFT JOIN admin_users aa ON mq.assigned_to = aa.id
      LEFT JOIN users au ON aa.user_id = au.id
      LEFT JOIN admin_users ra ON mq.reviewed_by = ra.id
      LEFT JOIN users reu ON ra.user_id = reu.id
      WHERE mq.id = ?
    `).bind(id).first();

    return {
      ...result,
      flag_reasons: result.flag_reasons ? JSON.parse(result.flag_reasons) : []
    } as ModerationItem;
  }

  // ================================
  // 4. FINANCIAL REPORTING METHODS
  // ================================

  /**
   * Get financial reports
   */
  async getFinancialReports(filters: {
    report_type?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    start_date?: string;
    end_date?: string;
    limit?: number;
  } = {}): Promise<FinancialReport[]> {
    try {
      let whereClause = 'WHERE 1=1';
      const values: any[] = [];

      if (filters.report_type) {
        whereClause += ' AND report_type = ?';
        values.push(filters.report_type);
      }
      if (filters.start_date) {
        whereClause += ' AND report_date >= ?';
        values.push(filters.start_date);
      }
      if (filters.end_date) {
        whereClause += ' AND report_date <= ?';
        values.push(filters.end_date);
      }

      const limit = filters.limit || 100;
      values.push(limit);

      const result = await this.db.prepare(`
        SELECT * FROM financial_reports 
        ${whereClause}
        ORDER BY report_date DESC
        LIMIT ?
      `).bind(...values).all();

      return result.results.map((row: any) => ({
        ...row,
        report_data: row.report_data ? JSON.parse(row.report_data) : null
      }));
    } catch (error) {
      console.error('Error getting financial reports:', error);
      throw new Error('Failed to get financial reports');
    }
  }

  /**
   * Generate financial report
   */
  async generateFinancialReport(
    report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    report_date: string,
    generated_by: number
  ): Promise<FinancialReport> {
    try {
      let dateFilter = '';
      let startDate = '';
      let endDate = '';

      // Calculate date ranges based on report type
      const reportDateObj = new Date(report_date);
      
      switch (report_type) {
        case 'daily':
          startDate = report_date;
          endDate = report_date;
          dateFilter = `DATE(created_at) = '${report_date}'`;
          break;
        case 'weekly':
          // Get start of week (Monday)
          const weekStart = new Date(reportDateObj);
          weekStart.setDate(reportDateObj.getDate() - reportDateObj.getDay() + 1);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          startDate = weekStart.toISOString().split('T')[0];
          endDate = weekEnd.toISOString().split('T')[0];
          dateFilter = `DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'`;
          break;
        case 'monthly':
          const year = reportDateObj.getFullYear();
          const month = reportDateObj.getMonth();
          startDate = new Date(year, month, 1).toISOString().split('T')[0];
          endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
          dateFilter = `DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'`;
          break;
        // Add quarterly and yearly logic as needed
      }

      // Calculate revenue metrics
      const revenueData = await this.db.prepare(`
        SELECT 
          transaction_type,
          COUNT(*) as transaction_count,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(SUM(platform_fee), 0) as total_fees,
          COALESCE(SUM(net_amount), 0) as net_amount
        FROM revenue_records 
        WHERE ${dateFilter} AND status = 'completed'
        GROUP BY transaction_type
      `).all();

      // Calculate totals
      let total_revenue = 0;
      let total_commissions = 0;
      let total_fees = 0;
      let total_refunds = 0;
      let transaction_count = 0;

      revenueData.results.forEach((row: any) => {
        transaction_count += row.transaction_count;
        total_fees += row.total_fees;
        
        if (row.transaction_type === 'refund') {
          total_refunds += row.total_amount;
        } else {
          total_revenue += row.total_amount;
          if (row.transaction_type === 'commission') {
            total_commissions += row.total_amount;
          }
        }
      });

      const net_profit = total_revenue - total_refunds - total_fees;

      // Get user metrics
      const userMetrics = await this.db.prepare(`
        SELECT 
          COUNT(*) as active_users,
          COUNT(CASE WHEN ${dateFilter.replace('created_at', 'u.created_at')} THEN 1 END) as new_users
        FROM users u
        WHERE u.created_at <= '${endDate} 23:59:59'
      `).first();

      const report_data = {
        date_range: { start: startDate, end: endDate },
        revenue_breakdown: revenueData.results,
        user_metrics: userMetrics,
        calculations: {
          total_revenue,
          total_commissions,
          total_fees,
          total_refunds,
          net_profit,
          transaction_count
        }
      };

      // Insert/update report
      await this.db.prepare(`
        INSERT OR REPLACE INTO financial_reports 
        (report_type, report_date, total_revenue, total_commissions, total_fees, 
         total_refunds, net_profit, transaction_count, active_users, new_users, 
         report_data, generated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        report_type,
        report_date,
        total_revenue,
        total_commissions,
        total_fees,
        total_refunds,
        net_profit,
        transaction_count,
        userMetrics?.active_users || 0,
        userMetrics?.new_users || 0,
        JSON.stringify(report_data),
        generated_by
      ).run();

      return {
        report_type,
        report_date,
        total_revenue,
        total_commissions,
        total_fees,
        total_refunds,
        net_profit,
        transaction_count,
        active_users: userMetrics?.active_users || 0,
        new_users: userMetrics?.new_users || 0,
        report_data,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating financial report:', error);
      throw new Error('Failed to generate financial report');
    }
  }

  /**
   * Add revenue record
   */
  async addRevenueRecord(data: {
    transaction_type: 'subscription' | 'commission' | 'fee' | 'refund';
    user_id?: number;
    amount: number;
    currency?: string;
    payment_method?: string;
    transaction_id?: string;
    commission_rate?: number;
    platform_fee?: number;
    category?: string;
    description?: string;
    metadata?: any;
  }): Promise<RevenueRecord> {
    try {
      const platform_fee = data.platform_fee || 0;
      const net_amount = data.amount - platform_fee;

      const result = await this.db.prepare(`
        INSERT INTO revenue_records 
        (transaction_type, user_id, amount, currency, payment_method, transaction_id,
         commission_rate, platform_fee, net_amount, category, description, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        data.transaction_type,
        data.user_id || null,
        data.amount,
        data.currency || 'USD',
        data.payment_method || null,
        data.transaction_id || null,
        data.commission_rate || null,
        platform_fee,
        net_amount,
        data.category || null,
        data.description || null,
        data.metadata ? JSON.stringify(data.metadata) : null
      ).run();

      const record = await this.db.prepare(`
        SELECT * FROM revenue_records WHERE id = ?
      `).bind(result.meta.last_row_id).first();

      return {
        ...record,
        metadata: record.metadata ? JSON.parse(record.metadata) : null
      } as RevenueRecord;
    } catch (error) {
      console.error('Error adding revenue record:', error);
      throw new Error('Failed to add revenue record');
    }
  }

  // ================================
  // 5. FEATURE FLAG METHODS
  // ================================

  /**
   * Get all feature flags
   */
  async getFeatureFlags(environment?: string): Promise<FeatureFlag[]> {
    try {
      let whereClause = 'WHERE 1=1';
      const values: any[] = [];

      if (environment) {
        whereClause += ' AND environment = ?';
        values.push(environment);
      }

      const result = await this.db.prepare(`
        SELECT * FROM feature_flags 
        ${whereClause}
        ORDER BY created_at DESC
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

  /**
   * Create feature flag
   */
  async createFeatureFlag(data: {
    flag_key: string;
    name: string;
    description?: string;
    flag_type?: 'boolean' | 'string' | 'number' | 'json';
    default_value: string;
    environment?: string;
    rollout_percentage?: number;
    target_users?: number[];
    target_conditions?: any;
    created_by: number;
  }): Promise<FeatureFlag> {
    try {
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

      // Log the action
      await this.logAdminActivity(data.created_by, 'feature_flag_created', 'feature_flag', result.meta.last_row_id, {
        flag_key: data.flag_key,
        default_value: data.default_value
      });

      const flag = await this.db.prepare(`
        SELECT * FROM feature_flags WHERE id = ?
      `).bind(result.meta.last_row_id).first();

      return {
        ...flag,
        target_users: flag.target_users ? JSON.parse(flag.target_users) : null,
        target_conditions: flag.target_conditions ? JSON.parse(flag.target_conditions) : null
      } as FeatureFlag;
    } catch (error) {
      console.error('Error creating feature flag:', error);
      throw new Error('Failed to create feature flag');
    }
  }

  /**
   * Update feature flag
   */
  async updateFeatureFlag(id: number, data: {
    name?: string;
    description?: string;
    default_value?: string;
    is_active?: boolean;
    rollout_percentage?: number;
    target_users?: number[];
    target_conditions?: any;
    updated_by: number;
  }): Promise<FeatureFlag> {
    try {
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
      if (data.is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(data.is_active ? 1 : 0);
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

      values.push(id);

      await this.db.prepare(`
        UPDATE feature_flags 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(...values).run();

      // Log the action
      await this.logAdminActivity(data.updated_by, 'feature_flag_updated', 'feature_flag', id, data);

      const flag = await this.db.prepare(`
        SELECT * FROM feature_flags WHERE id = ?
      `).bind(id).first();

      return {
        ...flag,
        target_users: flag.target_users ? JSON.parse(flag.target_users) : null,
        target_conditions: flag.target_conditions ? JSON.parse(flag.target_conditions) : null
      } as FeatureFlag;
    } catch (error) {
      console.error('Error updating feature flag:', error);
      throw new Error('Failed to update feature flag');
    }
  }

  /**
   * Evaluate feature flag for user
   */
  async evaluateFeatureFlag(flag_key: string, user_id?: number, context?: any): Promise<any> {
    try {
      const flag = await this.db.prepare(`
        SELECT * FROM feature_flags 
        WHERE flag_key = ? AND status = 'active'
      `).bind(flag_key).first();

      if (!flag) {
        return null;
      }

      let evaluatedValue = flag.default_value;

      // Check rollout percentage
      if (flag.rollout_percentage < 100 && user_id) {
        const userHash = this.hashUserId(user_id, flag_key);
        if (userHash > flag.rollout_percentage) {
          evaluatedValue = flag.flag_type === 'boolean' ? 'false' : '';
        }
      }

      // Check target users
      if (flag.target_users && user_id) {
        const targetUsers = JSON.parse(flag.target_users);
        if (Array.isArray(targetUsers) && targetUsers.includes(user_id)) {
          evaluatedValue = flag.default_value;
        }
      }

      // Log evaluation
      await this.db.prepare(`
        INSERT INTO feature_flag_evaluations (flag_id, user_id, evaluated_value, evaluation_context)
        VALUES (?, ?, ?, ?)
      `).bind(
        flag.id,
        user_id || null,
        evaluatedValue,
        context ? JSON.stringify(context) : null
      ).run();

      // Convert to appropriate type
      switch (flag.flag_type) {
        case 'boolean':
          return evaluatedValue === 'true';
        case 'number':
          return parseFloat(evaluatedValue);
        case 'json':
          return JSON.parse(evaluatedValue);
        default:
          return evaluatedValue;
      }
    } catch (error) {
      console.error('Error evaluating feature flag:', error);
      return null;
    }
  }

  private hashUserId(user_id: number, salt: string): number {
    // Simple hash function for rollout percentage
    const str = `${user_id}-${salt}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  // ================================
  // 6. SYSTEM MONITORING METHODS
  // ================================

  /**
   * Log system metric
   */
  async logSystemMetric(data: {
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
        data.source || null,
        data.metadata ? JSON.stringify(data.metadata) : null
      ).run();
    } catch (error) {
      console.error('Error logging system metric:', error);
    }
  }

  /**
   * Log error
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
  }): Promise<ErrorLog> {
    try {
      const result = await this.db.prepare(`
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

      const errorLog = await this.db.prepare(`
        SELECT * FROM error_logs WHERE id = ?
      `).bind(result.meta.last_row_id).first();

      return errorLog as ErrorLog;
    } catch (error) {
      console.error('Error logging error:', error);
      throw new Error('Failed to log error');
    }
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(filters: {
    metric_type?: string;
    start_time?: string;
    end_time?: string;
    limit?: number;
  } = {}): Promise<SystemMetric[]> {
    try {
      let whereClause = 'WHERE 1=1';
      const values: any[] = [];

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

      const limit = filters.limit || 1000;
      values.push(limit);

      const result = await this.db.prepare(`
        SELECT * FROM system_metrics 
        ${whereClause}
        ORDER BY timestamp DESC
        LIMIT ?
      `).bind(...values).all();

      return result.results.map((row: any) => ({
        ...row,
        metadata: row.metadata ? JSON.parse(row.metadata) : null
      }));
    } catch (error) {
      console.error('Error getting system metrics:', error);
      throw new Error('Failed to get system metrics');
    }
  }

  /**
   * Get error logs
   */
  async getErrorLogs(filters: {
    error_type?: string;
    severity?: string;
    status?: string;
    start_time?: string;
    end_time?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ErrorLog[]> {
    try {
      let whereClause = 'WHERE 1=1';
      const values: any[] = [];

      if (filters.error_type) {
        whereClause += ' AND error_type = ?';
        values.push(filters.error_type);
      }
      if (filters.severity) {
        whereClause += ' AND severity = ?';
        values.push(filters.severity);
      }
      if (filters.status) {
        whereClause += ' AND status = ?';
        values.push(filters.status);
      }
      if (filters.start_time) {
        whereClause += ' AND created_at >= ?';
        values.push(filters.start_time);
      }
      if (filters.end_time) {
        whereClause += ' AND created_at <= ?';
        values.push(filters.end_time);
      }

      const limit = filters.limit || 100;
      const offset = filters.offset || 0;
      values.push(limit, offset);

      const result = await this.db.prepare(`
        SELECT * FROM error_logs 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).bind(...values).all();

      return result.results as ErrorLog[];
    } catch (error) {
      console.error('Error getting error logs:', error);
      throw new Error('Failed to get error logs');
    }
  }

  // ================================
  // 7. UTILITY METHODS
  // ================================

  /**
   * Log admin activity
   */
  async logAdminActivity(
    admin_user_id: number,
    action: string,
    target_type?: string,
    target_id?: number,
    details?: any,
    ip_address?: string,
    user_agent?: string
  ): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO admin_activity_logs 
        (admin_user_id, action, target_type, target_id, details, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        admin_user_id,
        action,
        target_type || null,
        target_id || null,
        details ? JSON.stringify(details) : null,
        ip_address || null,
        user_agent || null
      ).run();
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }

  /**
   * Check admin permissions
   */
  async hasPermission(admin_user_id: number, permission: string): Promise<boolean> {
    try {
      const result = await this.db.prepare(`
        SELECT ar.permissions 
        FROM admin_users au
        JOIN admin_roles ar ON au.admin_role_id = ar.id
        WHERE au.id = ? AND au.status = 'active'
      `).bind(admin_user_id).first();

      if (!result) {
        return false;
      }

      const permissions = JSON.parse(result.permissions);
      return permissions.includes('*') || permissions.includes(permission);
    } catch (error) {
      console.error('Error checking admin permissions:', error);
      return false;
    }
  }

  /**
   * Get admin user by user ID
   */
  async getAdminUserByUserId(user_id: number): Promise<AdminUser | null> {
    try {
      const result = await this.db.prepare(`
        SELECT 
          au.*,
          ar.role_name as role_name,
          ar.permissions,
          (u.first_name || ' ' || u.last_name) as user_name,
          u.email as user_email
        FROM admin_users au
        LEFT JOIN admin_roles ar ON au.admin_role_id = ar.id
        LEFT JOIN users u ON au.user_id = u.id
        WHERE au.user_id = ? AND au.status = 'active'
      `).bind(user_id).first();

      if (!result) {
        return null;
      }

      return {
        ...result,
        role_permissions: result.permissions ? JSON.parse(result.permissions) : []
      } as AdminUser;
    } catch (error) {
      console.error('Error getting admin user by user ID:', error);
      return null;
    }
  }

  // ================================
  // PLATFORM USER MANAGEMENT
  // ================================

  /**
   * Get all platform users (clients, workers, admin)
   */
  async getAllPlatformUsers(filters: {
    role?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      const {
        role,
        status,
        search,
        limit = 50,
        offset = 0
      } = filters;

      // Simplified query to avoid complex JOINs that might be causing issues
      let query = `
        SELECT 
          u.*,
          (u.first_name || ' ' || u.last_name) as full_name
        FROM users u
        WHERE 1=1
      `;

      const bindings: any[] = [];

      if (role) {
        query += ` AND u.role = ?`;
        bindings.push(role);
      }

      if (status) {
        query += ` AND u.is_active = ?`;
        bindings.push(status === 'active' ? 1 : 0);
      }

      if (search) {
        query += ` AND (
          u.first_name LIKE ? OR 
          u.last_name LIKE ? OR 
          u.email LIKE ? OR
          u.phone LIKE ?
        )`;
        const searchPattern = `%${search}%`;
        bindings.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      query += `
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `;
      bindings.push(limit, offset);

      const result = await this.db.prepare(query).bind(...bindings).all();
      
      // Add job and review counts as separate queries for each user if needed
      const users = result.results || [];
      
      // For now, let's return basic user data - we can add stats later
      return users.map((user: any) => ({
        ...user,
        active_jobs: 0,
        completed_jobs: 0,
        average_rating: null,
        total_reviews: 0
      }));
    } catch (error) {
      console.error('Error getting platform users:', error);
      throw error;
    }
  }

  /**
   * Get detailed user profile with all related data
   */
  async getUserDetails(userId: number) {
    try {
      // Get user basic info
      const user = await this.db.prepare(`
        SELECT * FROM users WHERE id = ?
      `).bind(userId).first();

      if (!user) {
        throw new Error('User not found');
      }

      // Get user jobs (simplified query with error handling)
      let jobResults = [];
      try {
        const jobsQuery = await this.db.prepare(`
          SELECT * FROM jobs 
          WHERE client_id = ? OR worker_id = ? 
          ORDER BY created_at DESC LIMIT 10
        `).bind(userId, userId).all();
        jobResults = jobsQuery.results || [];
      } catch (error) {
        console.log('Error fetching jobs:', error.message);
        jobResults = [];
      }

      // Get user reviews (simplified query with error handling)
      let reviewResults = [];
      try {
        const reviewsQuery = await this.db.prepare(`
          SELECT * FROM reviews 
          WHERE reviewer_id = ? OR worker_id = ? 
          ORDER BY created_at DESC LIMIT 10
        `).bind(userId, userId).all();
        reviewResults = reviewsQuery.results || [];
      } catch (error) {
        console.log('Error fetching reviews:', error.message);
        reviewResults = [];
      }

      // Get worker profile if applicable (simplified)
      let workerProfile = null;
      if (user.role === 'worker') {
        try {
          workerProfile = await this.db.prepare(`
            SELECT * FROM user_profiles WHERE user_id = ?
          `).bind(userId).first();
        } catch (error) {
          console.log('Error fetching worker profile:', error.message);
          workerProfile = null;
        }
      }

      return {
        user: {
          ...user,
          full_name: ((user.first_name || '') + ' ' + (user.last_name || '')).trim()
        },
        jobs: jobResults,
        reviews: reviewResults,
        worker_profile: workerProfile,
        stats: {
          total_jobs: jobResults.length,
          active_jobs: jobResults.filter((j: any) => j.status === 'active').length,
          completed_jobs: jobResults.filter((j: any) => j.status === 'completed').length,
          total_reviews: reviewResults.length,
          average_rating: reviewResults.length > 0 ? 
            reviewResults.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewResults.length : 0
        }
      };
    } catch (error) {
      console.error('Error getting user details:', error);
      throw error;
    }
  }

  /**
   * Update user account status and details
   */
  async updateUserAccount(userId: number, updates: {
    is_active?: boolean;
    is_verified?: boolean;
    email_verified?: boolean;
    notes?: string;
    admin_action?: string;
  }, adminUserId: number) {
    try {
      const updateFields: string[] = [];
      const bindings: any[] = [];

      if (updates.is_active !== undefined) {
        updateFields.push('is_active = ?');
        bindings.push(updates.is_active ? 1 : 0);
      }

      if (updates.is_verified !== undefined) {
        updateFields.push('is_verified = ?');
        bindings.push(updates.is_verified ? 1 : 0);
      }

      if (updates.email_verified !== undefined) {
        updateFields.push('email_verified = ?');
        bindings.push(updates.email_verified ? 1 : 0);
      }

      if (updateFields.length === 0) {
        throw new Error('No valid updates provided');
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      bindings.push(userId);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      await this.db.prepare(query).bind(...bindings).run();

      // Log admin activity
      await this.logAdminActivity(
        adminUserId,
        updates.admin_action || 'user_account_updated',
        'user',
        userId,
        JSON.stringify(updates)
      );

      return { success: true, message: 'User account updated successfully' };
    } catch (error) {
      console.error('Error updating user account:', error);
      throw error;
    }
  }

  // ================================
  // JOB MANAGEMENT
  // ================================

  /**
   * Get all jobs with filtering and search
   */
  async getAllJobs(filters: {
    status?: string;
    category_id?: number;
    client_id?: number;
    worker_id?: number;
    search?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      const {
        status,
        category_id,
        client_id,
        worker_id,
        search,
        date_from,
        date_to,
        limit = 50,
        offset = 0
      } = filters;

      // Simplified query
      let query = `
        SELECT 
          j.*,
          jc.name as category_name,
          (u_client.first_name || ' ' || u_client.last_name) as client_name,
          u_client.email as client_email,
          (u_worker.first_name || ' ' || u_worker.last_name) as worker_name,
          u_worker.email as worker_email
        FROM jobs j
        LEFT JOIN job_categories jc ON j.category_id = jc.id
        LEFT JOIN users u_client ON j.client_id = u_client.id
        LEFT JOIN users u_worker ON j.assigned_worker_id = u_worker.id
        WHERE 1=1
      `;

      const bindings: any[] = [];

      if (status) {
        query += ` AND j.status = ?`;
        bindings.push(status);
      }

      if (category_id) {
        query += ` AND j.category_id = ?`;
        bindings.push(category_id);
      }

      if (client_id) {
        query += ` AND j.client_id = ?`;
        bindings.push(client_id);
      }

      if (worker_id) {
        query += ` AND j.assigned_worker_id = ?`;
        bindings.push(worker_id);
      }

      if (search) {
        query += ` AND (
          j.title LIKE ? OR 
          j.description LIKE ?
        )`;
        const searchPattern = `%${search}%`;
        bindings.push(searchPattern, searchPattern);
      }

      if (date_from) {
        query += ` AND j.created_at >= ?`;
        bindings.push(date_from);
      }

      if (date_to) {
        query += ` AND j.created_at <= ?`;
        bindings.push(date_to);
      }

      query += `
        ORDER BY j.created_at DESC
        LIMIT ? OFFSET ?
      `;
      bindings.push(limit, offset);

      const result = await this.db.prepare(query).bind(...bindings).all();
      
      // Add basic counts as placeholder
      return (result.results || []).map((job: any) => ({
        ...job,
        application_count: 0,
        job_rating: null,
        location: `${job.location_city || ''}, ${job.location_province || ''}`.trim().replace(/^,\s*/, '')
      }));
    } catch (error) {
      console.error('Error getting jobs:', error);
      throw error;
    }
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats() {
    try {
      const stats = await Promise.all([
        // Total users by role
        this.db.prepare(`SELECT role, COUNT(*) as count FROM users GROUP BY role`).all(),
        
        // Jobs by status
        this.db.prepare(`SELECT status, COUNT(*) as count FROM jobs GROUP BY status`).all(),
        
        // Recent activity counts (last 7 days)
        this.db.prepare(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as new_users
          FROM users 
          WHERE created_at >= datetime('now', '-7 days')
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `).all(),
        
        this.db.prepare(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as new_jobs
          FROM jobs 
          WHERE created_at >= datetime('now', '-7 days')
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `).all()
      ]);

      return {
        users_by_role: stats[0].results || [],
        jobs_by_status: stats[1].results || [],
        daily_new_users: stats[2].results || [],
        daily_new_jobs: stats[3].results || []
      };
    } catch (error) {
      console.error('Error getting platform stats:', error);
      throw error;
    }
  }
}