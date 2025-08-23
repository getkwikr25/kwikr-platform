import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

export const adminRoutes = new Hono<{ Bindings: Bindings }>()

// Middleware to verify admin authentication
const requireAdmin = async (c: any, next: any) => {
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!sessionToken) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  const session = await c.env.DB.prepare(`
    SELECT s.user_id, u.role
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = 1 AND u.role = 'admin'
  `).bind(sessionToken).first()
  
  if (!session) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  
  c.set('user', session)
  await next()
}

// Dashboard metrics
adminRoutes.get('/dashboard', requireAdmin, async (c) => {
  try {
    // Total users by role
    const userStats = await c.env.DB.prepare(`
      SELECT role, COUNT(*) as count, 
             COUNT(CASE WHEN is_verified = 1 THEN 1 END) as verified_count
      FROM users 
      WHERE is_active = 1
      GROUP BY role
    `).all()
    
    // Jobs statistics
    const jobStats = await c.env.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM jobs
      GROUP BY status
    `).all()
    
    // Revenue statistics (placeholder - would integrate with actual payment data)
    const revenueStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_transaction
      FROM transactions
      WHERE status = 'completed' AND transaction_type = 'platform_fee'
    `).first()
    
    // Recent activity
    const recentJobs = await c.env.DB.prepare(`
      SELECT j.id, j.title, j.status, j.created_at,
             u.first_name, u.last_name, c.name as category_name
      FROM jobs j
      JOIN users u ON j.client_id = u.id
      JOIN job_categories c ON j.category_id = c.id
      ORDER BY j.created_at DESC
      LIMIT 10
    `).all()
    
    // Pending compliance reviews
    const pendingCompliance = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM worker_compliance
      WHERE compliance_status = 'pending'
    `).first()
    
    // Active disputes
    const activeDisputes = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM disputes
      WHERE status IN ('open', 'investigating')
    `).first()
    
    return c.json({
      userStats: userStats.results,
      jobStats: jobStats.results,
      revenueStats,
      recentJobs: recentJobs.results,
      pendingCompliance: pendingCompliance?.count || 0,
      activeDisputes: activeDisputes?.count || 0
    })
    
  } catch (error) {
    console.error('Error fetching admin dashboard:', error)
    return c.json({ error: 'Failed to fetch dashboard data' }, 500)
  }
})

// User management
adminRoutes.get('/users', requireAdmin, async (c) => {
  try {
    const { role, province, status, page = '1', limit = '50' } = c.req.query()
    
    let query = `
      SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.province, u.city,
             u.is_verified, u.is_active, u.created_at, u.last_login,
             p.bio, 
             (SELECT COUNT(*) FROM jobs WHERE client_id = u.id) as jobs_posted,
             (SELECT COUNT(*) FROM bids WHERE worker_id = u.id) as bids_submitted
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE 1=1
    `
    
    const params: any[] = []
    
    if (role && role !== 'all') {
      query += ` AND u.role = ?`
      params.push(role)
    }
    
    if (province) {
      query += ` AND u.province = ?`
      params.push(province)
    }
    
    if (status === 'active') {
      query += ` AND u.is_active = 1`
    } else if (status === 'inactive') {
      query += ` AND u.is_active = 0`
    }
    
    query += ` ORDER BY u.created_at DESC`
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit)
    query += ` LIMIT ? OFFSET ?`
    params.push(parseInt(limit), offset)
    
    const users = await c.env.DB.prepare(query).bind(...params).all()
    
    return c.json({ 
      users: users.results,
      page: parseInt(page),
      limit: parseInt(limit)
    })
    
  } catch (error) {
    console.error('Error fetching users:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

// Worker compliance management
adminRoutes.get('/compliance', requireAdmin, async (c) => {
  try {
    const { status = 'pending', page = '1', limit = '20' } = c.req.query()
    
    const compliance = await c.env.DB.prepare(`
      SELECT wc.*, u.first_name, u.last_name, u.email, u.province, u.city
      FROM worker_compliance wc
      JOIN users u ON wc.user_id = u.id
      WHERE wc.compliance_status = ?
      ORDER BY wc.created_at ASC
      LIMIT ? OFFSET ?
    `).bind(status, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)).all()
    
    return c.json({ 
      compliance: compliance.results,
      page: parseInt(page),
      limit: parseInt(limit)
    })
    
  } catch (error) {
    console.error('Error fetching compliance:', error)
    return c.json({ error: 'Failed to fetch compliance data' }, 500)
  }
})

// Approve/reject worker compliance
adminRoutes.put('/compliance/:id', requireAdmin, async (c) => {
  try {
    const complianceId = c.req.param('id')
    const user = c.get('user')
    const { status, rejectionReason } = await c.req.json()
    
    if (!['verified', 'rejected'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400)
    }
    
    if (status === 'rejected' && !rejectionReason) {
      return c.json({ error: 'Rejection reason is required' }, 400)
    }
    
    const updateResult = await c.env.DB.prepare(`
      UPDATE worker_compliance SET
        compliance_status = ?,
        verified_at = CASE WHEN ? = 'verified' THEN CURRENT_TIMESTAMP ELSE NULL END,
        verified_by = CASE WHEN ? = 'verified' THEN ? ELSE NULL END,
        rejection_reason = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, status, status, user.user_id, rejectionReason, complianceId).run()
    
    if (updateResult.changes === 0) {
      return c.json({ error: 'Compliance record not found' }, 404)
    }
    
    // If verified, update user verification status
    if (status === 'verified') {
      const compliance = await c.env.DB.prepare(`
        SELECT user_id FROM worker_compliance WHERE id = ?
      `).bind(complianceId).first()
      
      if (compliance) {
        await c.env.DB.prepare(`
          UPDATE users SET is_verified = 1 WHERE id = ?
        `).bind(compliance.user_id).run()
      }
    }
    
    return c.json({ message: `Compliance ${status} successfully` })
    
  } catch (error) {
    console.error('Error updating compliance:', error)
    return c.json({ error: 'Failed to update compliance' }, 500)
  }
})

// Dispute management
adminRoutes.get('/disputes', requireAdmin, async (c) => {
  try {
    const { status = 'open', page = '1', limit = '20' } = c.req.query()
    
    const disputes = await c.env.DB.prepare(`
      SELECT d.*, j.title as job_title, j.budget_min, j.budget_max,
             u1.first_name as raised_by_first_name, u1.last_name as raised_by_last_name,
             u2.first_name as client_first_name, u2.last_name as client_last_name,
             u3.first_name as worker_first_name, u3.last_name as worker_last_name
      FROM disputes d
      JOIN jobs j ON d.job_id = j.id
      JOIN users u1 ON d.raised_by = u1.id
      JOIN users u2 ON j.client_id = u2.id
      LEFT JOIN users u3 ON j.assigned_worker_id = u3.id
      WHERE d.status = ?
      ORDER BY d.created_at ASC
      LIMIT ? OFFSET ?
    `).bind(status, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)).all()
    
    return c.json({ 
      disputes: disputes.results,
      page: parseInt(page),
      limit: parseInt(limit)
    })
    
  } catch (error) {
    console.error('Error fetching disputes:', error)
    return c.json({ error: 'Failed to fetch disputes' }, 500)
  }
})

// Resolve dispute
adminRoutes.put('/disputes/:id', requireAdmin, async (c) => {
  try {
    const disputeId = c.req.param('id')
    const user = c.get('user')
    const { status, resolution } = await c.req.json()
    
    if (!['investigating', 'resolved', 'closed'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400)
    }
    
    if (status === 'resolved' && !resolution) {
      return c.json({ error: 'Resolution is required' }, 400)
    }
    
    const updateResult = await c.env.DB.prepare(`
      UPDATE disputes SET
        status = ?,
        resolution = ?,
        resolved_by = ?,
        resolved_at = CASE WHEN ? IN ('resolved', 'closed') THEN CURRENT_TIMESTAMP ELSE NULL END
      WHERE id = ?
    `).bind(status, resolution, user.user_id, status, disputeId).run()
    
    if (updateResult.changes === 0) {
      return c.json({ error: 'Dispute not found' }, 404)
    }
    
    return c.json({ message: `Dispute ${status} successfully` })
    
  } catch (error) {
    console.error('Error updating dispute:', error)
    return c.json({ error: 'Failed to update dispute' }, 500)
  }
})

// Platform settings management
adminRoutes.get('/settings', requireAdmin, async (c) => {
  try {
    // This would typically fetch from a settings table
    // For now, return hardcoded platform settings
    const settings = {
      platformFees: {
        payAsYouGo: { percentage: 10, fixedFee: 2.00 },
        growth: { monthlyFee: 199.00, percentage: 5 },
        pro: { monthlyFee: 299.00, percentage: 3 }
      },
      complianceRequirements: {
        wsibRequired: true,
        insuranceRequired: true,
        licenseRequired: ['Construction', 'Plumbing', 'Electrical', 'HVAC', 'Roofing']
      },
      systemStatus: {
        maintenanceMode: false,
        newRegistrations: true,
        paymentProcessing: true
      }
    }
    
    return c.json({ settings })
    
  } catch (error) {
    console.error('Error fetching settings:', error)
    return c.json({ error: 'Failed to fetch settings' }, 500)
  }
})

// Export data for analytics
adminRoutes.get('/exports/jobs', requireAdmin, async (c) => {
  try {
    const { startDate, endDate, format = 'json' } = c.req.query()
    
    let query = `
      SELECT j.*, u.first_name as client_first_name, u.last_name as client_last_name,
             w.first_name as worker_first_name, w.last_name as worker_last_name,
             c.name as category_name
      FROM jobs j
      JOIN users u ON j.client_id = u.id
      LEFT JOIN users w ON j.assigned_worker_id = w.id
      JOIN job_categories c ON j.category_id = c.id
      WHERE 1=1
    `
    
    const params: any[] = []
    
    if (startDate) {
      query += ` AND j.created_at >= ?`
      params.push(startDate)
    }
    
    if (endDate) {
      query += ` AND j.created_at <= ?`
      params.push(endDate)
    }
    
    query += ` ORDER BY j.created_at DESC`
    
    const jobs = await c.env.DB.prepare(query).bind(...params).all()
    
    if (format === 'csv') {
      // Convert to CSV format
      const headers = ['ID', 'Title', 'Category', 'Client', 'Worker', 'Status', 'Budget Min', 'Budget Max', 'Created At']
      const csvRows = [headers.join(',')]
      
      jobs.results.forEach((job: any) => {
        const row = [
          job.id,
          `"${job.title}"`,
          job.category_name,
          `"${job.client_first_name} ${job.client_last_name}"`,
          job.worker_first_name ? `"${job.worker_first_name} ${job.worker_last_name}"` : '',
          job.status,
          job.budget_min,
          job.budget_max,
          job.created_at
        ]
        csvRows.push(row.join(','))
      })
      
      return new Response(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="jobs_export.csv"'
        }
      })
    }
    
    return c.json({ jobs: jobs.results })
    
  } catch (error) {
    console.error('Error exporting jobs:', error)
    return c.json({ error: 'Failed to export jobs' }, 500)
  }
})