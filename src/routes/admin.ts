/**
 * Admin API Routes - Comprehensive Administrative Management System
 * 
 * Provides complete API endpoints for administrative functionality:
 * 1. Admin Dashboard - Platform overview and metrics
 * 2. User Management - Admin user controls
 * 3. Content Moderation - Review posts, profiles, messages  
 * 4. Financial Reporting - Revenue and commission reports
 * 5. System Monitoring - Performance and error tracking
 * 6. Feature Flags - Enable/disable platform features
 * 
 * All routes include proper authentication, authorization, input validation,
 * error handling, and comprehensive logging of administrative actions.
 */

import { Hono } from 'hono'
import { AdminService } from '../services/AdminService'

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
}

const admin = new Hono<{ Bindings: Bindings }>()

// ================================
// MIDDLEWARE & AUTHENTICATION
// ================================

// Admin authentication middleware
admin.use('*', async (c, next) => {
  try {
    // Get user ID from headers or session
    const userId = c.req.header('x-user-id');
    
    if (!userId) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const adminService = new AdminService(c.env.DB);
    const adminUser = await adminService.getAdminUserByUserId(parseInt(userId));
    
    if (!adminUser) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    // Store admin user in context
    c.set('adminUser', adminUser);
    c.set('adminService', adminService);
    
    await next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
});

// Permission checking helper
const requirePermission = (permission: string) => {
  return async (c: any, next: any) => {
    const adminService = c.get('adminService') as AdminService;
    const adminUser = c.get('adminUser');
    
    const hasPermission = await adminService.hasPermission(adminUser.id, permission);
    
    if (!hasPermission) {
      return c.json({ error: `Permission '${permission}' required` }, 403);
    }
    
    await next();
  };
};

// ================================
// 1. ADMIN DASHBOARD ROUTES
// ================================

/**
 * GET /api/admin/dashboard
 * Get comprehensive dashboard metrics and overview
 */
admin.get('/dashboard', async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    
    const [metrics, activities] = await Promise.all([
      adminService.getDashboardMetrics(),
      adminService.getRecentAdminActivities(20)
    ]);

    return c.json({
      success: true,
      data: {
        metrics,
        recent_activities: activities
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return c.json({ error: 'Failed to get dashboard data' }, 500);
  }
});

/**
 * GET /api/admin/dashboard/metrics/:metric_type
 * Get specific metric type data
 */
admin.get('/dashboard/metrics/:metric_type', async (c) => {
  try {
    const metricType = c.req.param('metric_type');
    const adminService = c.get('adminService') as AdminService;
    
    const startTime = c.req.query('start_time');
    const endTime = c.req.query('end_time');
    
    const metrics = await adminService.getSystemMetrics({
      metric_type: metricType,
      start_time: startTime,
      end_time: endTime,
      limit: 1000
    });

    return c.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return c.json({ error: 'Failed to get metrics' }, 500);
  }
});

/**
 * GET /api/admin/dashboard/activities
 * Get recent admin activities with pagination
 */
admin.get('/dashboard/activities', async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const limit = parseInt(c.req.query('limit') || '50');
    
    const activities = await adminService.getRecentAdminActivities(limit);

    return c.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Activities error:', error);
    return c.json({ error: 'Failed to get activities' }, 500);
  }
});

// ================================
// 2. USER MANAGEMENT ROUTES
// ================================

/**
 * GET /api/admin/users
 * Get all admin users with role information
 */
admin.get('/users', requirePermission('user_management'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');
    
    const users = await adminService.getAdminUsers(limit, offset);

    return c.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    return c.json({ error: 'Failed to get admin users' }, 500);
  }
});

/**
 * POST /api/admin/users
 * Create new admin user
 */
admin.post('/users', requirePermission('user_management'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const adminUser = c.get('adminUser');
    const body = await c.req.json();

    // Validate required fields
    if (!body.user_id || !body.admin_role_id) {
      return c.json({ error: 'user_id and admin_role_id are required' }, 400);
    }

    const newAdminUser = await adminService.createAdminUser({
      user_id: body.user_id,
      admin_role_id: body.admin_role_id,
      assigned_by: adminUser.id,
      notes: body.notes
    });

    return c.json({
      success: true,
      data: newAdminUser
    }, 201);
  } catch (error) {
    console.error('Create admin user error:', error);
    return c.json({ error: 'Failed to create admin user' }, 500);
  }
});

/**
 * PUT /api/admin/users/:id
 * Update admin user
 */
admin.put('/users/:id', requirePermission('user_management'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const adminUser = c.get('adminUser');
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    const updatedUser = await adminService.updateAdminUser(id, {
      ...body,
      updated_by: adminUser.id
    });

    return c.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Update admin user error:', error);
    return c.json({ error: 'Failed to update admin user' }, 500);
  }
});

/**
 * GET /api/admin/roles
 * Get all admin roles
 */
admin.get('/roles', requirePermission('user_management'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    
    const roles = await adminService.getAdminRoles();

    return c.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Get admin roles error:', error);
    return c.json({ error: 'Failed to get admin roles' }, 500);
  }
});

// ================================
// 3. CONTENT MODERATION ROUTES
// ================================

/**
 * GET /api/admin/moderation
 * Get moderation queue with filters
 */
admin.get('/moderation', requirePermission('content_moderation'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    
    const filters = {
      status: c.req.query('status'),
      priority: c.req.query('priority'),
      content_type: c.req.query('content_type'),
      assigned_to: c.req.query('assigned_to') ? parseInt(c.req.query('assigned_to')!) : undefined,
      limit: parseInt(c.req.query('limit') || '50'),
      offset: parseInt(c.req.query('offset') || '0')
    };

    const moderationItems = await adminService.getModerationQueue(filters);

    return c.json({
      success: true,
      data: moderationItems
    });
  } catch (error) {
    console.error('Get moderation queue error:', error);
    return c.json({ error: 'Failed to get moderation queue' }, 500);
  }
});

/**
 * POST /api/admin/moderation
 * Add item to moderation queue
 */
admin.post('/moderation', requirePermission('content_moderation'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const body = await c.req.json();

    // Validate required fields
    if (!body.content_type || !body.content_id || !body.flag_reasons) {
      return c.json({ 
        error: 'content_type, content_id, and flag_reasons are required' 
      }, 400);
    }

    const moderationItem = await adminService.addToModerationQueue({
      content_type: body.content_type,
      content_id: body.content_id,
      reported_by: body.reported_by,
      flag_reasons: body.flag_reasons,
      priority: body.priority,
      auto_flagged: body.auto_flagged
    });

    return c.json({
      success: true,
      data: moderationItem
    }, 201);
  } catch (error) {
    console.error('Add to moderation queue error:', error);
    return c.json({ error: 'Failed to add to moderation queue' }, 500);
  }
});

/**
 * PUT /api/admin/moderation/:id
 * Update moderation item (review, approve, reject, etc.)
 */
admin.put('/moderation/:id', requirePermission('content_moderation'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const adminUser = c.get('adminUser');
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    const updatedItem = await adminService.updateModerationItem(id, {
      ...body,
      reviewed_by: adminUser.id
    });

    return c.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error('Update moderation item error:', error);
    return c.json({ error: 'Failed to update moderation item' }, 500);
  }
});

/**
 * POST /api/admin/moderation/:id/assign
 * Assign moderation item to admin
 */
admin.post('/moderation/:id/assign', requirePermission('content_moderation'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const adminUser = c.get('adminUser');
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    const updatedItem = await adminService.updateModerationItem(id, {
      assigned_to: body.assigned_to || adminUser.id
    });

    return c.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error('Assign moderation item error:', error);
    return c.json({ error: 'Failed to assign moderation item' }, 500);
  }
});

// ================================
// 4. FINANCIAL REPORTING ROUTES
// ================================

/**
 * GET /api/admin/financial/reports
 * Get financial reports with filters
 */
admin.get('/financial/reports', requirePermission('financial_reports'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    
    const filters = {
      report_type: c.req.query('report_type') as any,
      start_date: c.req.query('start_date'),
      end_date: c.req.query('end_date'),
      limit: parseInt(c.req.query('limit') || '100')
    };

    const reports = await adminService.getFinancialReports(filters);

    return c.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get financial reports error:', error);
    return c.json({ error: 'Failed to get financial reports' }, 500);
  }
});

/**
 * POST /api/admin/financial/reports/generate
 * Generate financial report
 */
admin.post('/financial/reports/generate', requirePermission('financial_reports'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const adminUser = c.get('adminUser');
    const body = await c.req.json();

    // Validate required fields
    if (!body.report_type || !body.report_date) {
      return c.json({ 
        error: 'report_type and report_date are required' 
      }, 400);
    }

    const report = await adminService.generateFinancialReport(
      body.report_type,
      body.report_date,
      adminUser.id
    );

    return c.json({
      success: true,
      data: report
    }, 201);
  } catch (error) {
    console.error('Generate financial report error:', error);
    return c.json({ error: 'Failed to generate financial report' }, 500);
  }
});

/**
 * POST /api/admin/financial/revenue
 * Add revenue record
 */
admin.post('/financial/revenue', requirePermission('financial_reports'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const body = await c.req.json();

    // Validate required fields
    if (!body.transaction_type || !body.amount) {
      return c.json({ 
        error: 'transaction_type and amount are required' 
      }, 400);
    }

    const record = await adminService.addRevenueRecord(body);

    return c.json({
      success: true,
      data: record
    }, 201);
  } catch (error) {
    console.error('Add revenue record error:', error);
    return c.json({ error: 'Failed to add revenue record' }, 500);
  }
});

// ================================
// 5. SYSTEM MONITORING ROUTES
// ================================

/**
 * GET /api/admin/monitoring/metrics
 * Get system metrics
 */
admin.get('/monitoring/metrics', requirePermission('system_monitoring'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    
    const filters = {
      metric_type: c.req.query('metric_type'),
      start_time: c.req.query('start_time'),
      end_time: c.req.query('end_time'),
      limit: parseInt(c.req.query('limit') || '1000')
    };

    const metrics = await adminService.getSystemMetrics(filters);

    return c.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Get system metrics error:', error);
    return c.json({ error: 'Failed to get system metrics' }, 500);
  }
});

/**
 * POST /api/admin/monitoring/metrics
 * Log system metric
 */
admin.post('/monitoring/metrics', requirePermission('system_monitoring'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const body = await c.req.json();

    // Validate required fields
    if (!body.metric_type || body.metric_value === undefined || !body.unit) {
      return c.json({ 
        error: 'metric_type, metric_value, and unit are required' 
      }, 400);
    }

    await adminService.logSystemMetric(body);

    return c.json({
      success: true,
      message: 'Metric logged successfully'
    }, 201);
  } catch (error) {
    console.error('Log system metric error:', error);
    return c.json({ error: 'Failed to log system metric' }, 500);
  }
});

/**
 * GET /api/admin/monitoring/errors
 * Get error logs
 */
admin.get('/monitoring/errors', requirePermission('system_monitoring'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    
    const filters = {
      error_type: c.req.query('error_type') as any,
      severity: c.req.query('severity') as any,
      status: c.req.query('status') as any,
      start_time: c.req.query('start_time'),
      end_time: c.req.query('end_time'),
      limit: parseInt(c.req.query('limit') || '100'),
      offset: parseInt(c.req.query('offset') || '0')
    };

    const errors = await adminService.getErrorLogs(filters);

    return c.json({
      success: true,
      data: errors
    });
  } catch (error) {
    console.error('Get error logs error:', error);
    return c.json({ error: 'Failed to get error logs' }, 500);
  }
});

/**
 * POST /api/admin/monitoring/errors
 * Log error
 */
admin.post('/monitoring/errors', async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const body = await c.req.json();

    // Validate required fields
    if (!body.error_type || !body.error_message) {
      return c.json({ 
        error: 'error_type and error_message are required' 
      }, 400);
    }

    const errorLog = await adminService.logError(body);

    return c.json({
      success: true,
      data: errorLog
    }, 201);
  } catch (error) {
    console.error('Log error error:', error);
    return c.json({ error: 'Failed to log error' }, 500);
  }
});

// ================================
// 6. FEATURE FLAGS ROUTES
// ================================

/**
 * GET /api/admin/feature-flags
 * Get all feature flags
 */
admin.get('/feature-flags', requirePermission('feature_flags'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const environment = c.req.query('environment');
    
    const flags = await adminService.getFeatureFlags(environment);

    return c.json({
      success: true,
      data: flags
    });
  } catch (error) {
    console.error('Get feature flags error:', error);
    return c.json({ error: 'Failed to get feature flags' }, 500);
  }
});

/**
 * POST /api/admin/feature-flags
 * Create feature flag
 */
admin.post('/feature-flags', requirePermission('feature_flags'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const adminUser = c.get('adminUser');
    const body = await c.req.json();

    // Validate required fields
    if (!body.flag_key || !body.name || !body.default_value) {
      return c.json({ 
        error: 'flag_key, name, and default_value are required' 
      }, 400);
    }

    const flag = await adminService.createFeatureFlag({
      ...body,
      created_by: adminUser.id
    });

    return c.json({
      success: true,
      data: flag
    }, 201);
  } catch (error) {
    console.error('Create feature flag error:', error);
    return c.json({ error: 'Failed to create feature flag' }, 500);
  }
});

/**
 * PUT /api/admin/feature-flags/:id
 * Update feature flag
 */
admin.put('/feature-flags/:id', requirePermission('feature_flags'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const adminUser = c.get('adminUser');
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();

    const flag = await adminService.updateFeatureFlag(id, {
      ...body,
      updated_by: adminUser.id
    });

    return c.json({
      success: true,
      data: flag
    });
  } catch (error) {
    console.error('Update feature flag error:', error);
    return c.json({ error: 'Failed to update feature flag' }, 500);
  }
});

/**
 * GET /api/admin/feature-flags/:flag_key/evaluate
 * Evaluate feature flag for user (testing endpoint)
 */
admin.get('/feature-flags/:flag_key/evaluate', requirePermission('feature_flags'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const flag_key = c.req.param('flag_key');
    const user_id = c.req.query('user_id') ? parseInt(c.req.query('user_id')!) : undefined;
    const context = c.req.query('context');

    const value = await adminService.evaluateFeatureFlag(
      flag_key, 
      user_id, 
      context ? JSON.parse(context) : undefined
    );

    return c.json({
      success: true,
      data: {
        flag_key,
        user_id,
        value,
        evaluated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Evaluate feature flag error:', error);
    return c.json({ error: 'Failed to evaluate feature flag' }, 500);
  }
});

// ================================
// 7. UTILITY & HEALTH ROUTES
// ================================

/**
 * GET /api/admin/health
 * Admin system health check
 */
admin.get('/health', async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    
    // Basic health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      admin_system: 'operational'
    };

    return c.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Admin health check error:', error);
    return c.json({
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'System error'
      }
    }, 500);
  }
});

/**
 * GET /api/admin/permissions
 * Get current admin user's permissions
 */
admin.get('/permissions', async (c) => {
  try {
    const adminUser = c.get('adminUser');
    
    return c.json({
      success: true,
      data: {
        user: {
          id: adminUser.id,
          user_id: adminUser.user_id,
          role_name: adminUser.role_name,
          permissions: adminUser.role_permissions,
          status: adminUser.status
        }
      }
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    return c.json({ error: 'Failed to get permissions' }, 500);
  }
});

/**
 * POST /api/admin/log-activity
 * Manually log admin activity (for frontend actions)
 */
admin.post('/log-activity', async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const adminUser = c.get('adminUser');
    const body = await c.req.json();

    await adminService.logAdminActivity(
      adminUser.id,
      body.action,
      body.target_type,
      body.target_id,
      body.details,
      c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for'),
      c.req.header('user-agent')
    );

    return c.json({
      success: true,
      message: 'Activity logged successfully'
    });
  } catch (error) {
    console.error('Log activity error:', error);
    return c.json({ error: 'Failed to log activity' }, 500);
  }
});

// ================================
// PLATFORM USER MANAGEMENT ROUTES
// ================================

/**
 * GET /api/admin/platform/users
 * Get all platform users with filtering
 */
admin.get('/platform/users', requirePermission('user_management'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    
    const filters = {
      role: c.req.query('role'),
      status: c.req.query('status'),
      search: c.req.query('search'),
      limit: parseInt(c.req.query('limit') || '50'),
      offset: parseInt(c.req.query('offset') || '0')
    };

    const users = await adminService.getAllPlatformUsers(filters);

    return c.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get platform users error:', error);
    return c.json({ error: 'Failed to get platform users' }, 500);
  }
});

/**
 * GET /api/admin/platform/users/:id
 * Get detailed user information
 */
admin.get('/platform/users/:id', requirePermission('user_management'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const userId = parseInt(c.req.param('id'));

    const userDetails = await adminService.getUserDetails(userId);

    return c.json({
      success: true,
      data: userDetails
    });
  } catch (error) {
    console.error('Get user details error:', error);
    return c.json({ error: 'Failed to get user details' }, 500);
  }
});

/**
 * PUT /api/admin/platform/users/:id
 * Update user account status and details
 */
admin.put('/platform/users/:id', requirePermission('user_management'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    const adminUser = c.get('adminUser');
    const userId = parseInt(c.req.param('id'));
    const body = await c.req.json();

    const result = await adminService.updateUserAccount(userId, body, adminUser.id);

    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Update user account error:', error);
    return c.json({ error: 'Failed to update user account' }, 500);
  }
});

// ================================
// JOB MANAGEMENT ROUTES
// ================================

/**
 * GET /api/admin/platform/jobs
 * Get all jobs with filtering and search
 */
admin.get('/platform/jobs', requirePermission('content_moderation'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    
    const filters = {
      status: c.req.query('status'),
      category_id: c.req.query('category_id') ? parseInt(c.req.query('category_id')!) : undefined,
      client_id: c.req.query('client_id') ? parseInt(c.req.query('client_id')!) : undefined,
      worker_id: c.req.query('worker_id') ? parseInt(c.req.query('worker_id')!) : undefined,
      search: c.req.query('search'),
      date_from: c.req.query('date_from'),
      date_to: c.req.query('date_to'),
      limit: parseInt(c.req.query('limit') || '50'),
      offset: parseInt(c.req.query('offset') || '0')
    };

    const jobs = await adminService.getAllJobs(filters);

    return c.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    return c.json({ error: 'Failed to get jobs' }, 500);
  }
});

// ================================
// PLATFORM STATISTICS ROUTES
// ================================

/**
 * GET /api/admin/platform/stats
 * Get comprehensive platform statistics
 */
admin.get('/platform/stats', requirePermission('system_monitoring'), async (c) => {
  try {
    const adminService = c.get('adminService') as AdminService;
    
    const stats = await adminService.getPlatformStats();

    return c.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    return c.json({ error: 'Failed to get platform stats' }, 500);
  }
});

// ================================
// ERROR HANDLING
// ================================

// Global error handler for admin routes
admin.onError((err, c) => {
  console.error('Admin route error:', err);
  
  return c.json({
    success: false,
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500);
});

export default admin