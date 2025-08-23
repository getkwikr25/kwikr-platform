import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

export const jobRoutes = new Hono<{ Bindings: Bindings }>()

// Middleware to verify authentication
const requireAuth = async (c: any, next: any) => {
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!sessionToken) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  const session = await c.env.DB.prepare(`
    SELECT s.user_id, u.role
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = 1
  `).bind(sessionToken).first()
  
  if (!session) {
    return c.json({ error: 'Invalid or expired session' }, 401)
  }
  
  c.set('user', session)
  await next()
}

// Get job categories
jobRoutes.get('/categories', async (c) => {
  try {
    const categories = await c.env.DB.prepare(`
      SELECT id, name, description, requires_license, requires_insurance, icon_class
      FROM job_categories
      WHERE is_active = 1
      ORDER BY name
    `).all()
    
    return c.json({ categories: categories.results })
    
  } catch (error) {
    console.error('Error fetching categories:', error)
    return c.json({ error: 'Failed to fetch categories' }, 500)
  }
})

// Get jobs (with filters)
jobRoutes.get('/', async (c) => {
  try {
    const { province, city, category, minBudget, maxBudget, status, page = '1', limit = '20' } = c.req.query()
    
    let query = `
      SELECT j.*, u.first_name, u.last_name, u.city as client_city, u.province as client_province,
             c.name as category_name, c.icon_class,
             (SELECT COUNT(*) FROM bids WHERE job_id = j.id AND status = 'pending') as bid_count
      FROM jobs j
      JOIN users u ON j.client_id = u.id
      JOIN job_categories c ON j.category_id = c.id
      WHERE 1=1
    `
    
    const params: any[] = []
    
    if (province) {
      query += ` AND j.location_province = ?`
      params.push(province)
    }
    
    if (city) {
      query += ` AND j.location_city LIKE ?`
      params.push(`%${city}%`)
    }
    
    if (category) {
      query += ` AND j.category_id = ?`
      params.push(category)
    }
    
    if (minBudget) {
      query += ` AND j.budget_max >= ?`
      params.push(parseFloat(minBudget))
    }
    
    if (maxBudget) {
      query += ` AND j.budget_min <= ?`
      params.push(parseFloat(maxBudget))
    }
    
    if (status) {
      query += ` AND j.status = ?`
      params.push(status)
    } else {
      query += ` AND j.status IN ('posted', 'assigned')`
    }
    
    query += ` ORDER BY j.created_at DESC`
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit)
    query += ` LIMIT ? OFFSET ?`
    params.push(parseInt(limit), offset)
    
    const jobs = await c.env.DB.prepare(query).bind(...params).all()
    
    return c.json({ 
      jobs: jobs.results,
      page: parseInt(page),
      limit: parseInt(limit)
    })
    
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return c.json({ error: 'Failed to fetch jobs' }, 500)
  }
})

// Get specific job with details
jobRoutes.get('/:id', async (c) => {
  try {
    const jobId = c.req.param('id')
    
    const job = await c.env.DB.prepare(`
      SELECT j.*, u.first_name, u.last_name, u.email, u.city as client_city, u.province as client_province,
             c.name as category_name, c.icon_class, c.requires_license, c.requires_insurance,
             w.first_name as worker_first_name, w.last_name as worker_last_name
      FROM jobs j
      JOIN users u ON j.client_id = u.id
      JOIN job_categories c ON j.category_id = c.id
      LEFT JOIN users w ON j.assigned_worker_id = w.id
      WHERE j.id = ?
    `).bind(jobId).first()
    
    if (!job) {
      return c.json({ error: 'Job not found' }, 404)
    }
    
    // Get bids for this job
    const bids = await c.env.DB.prepare(`
      SELECT b.*, u.first_name, u.last_name, u.city, u.province,
             (SELECT AVG(rating) FROM reviews WHERE reviewee_id = b.worker_id) as avg_rating,
             (SELECT COUNT(*) FROM reviews WHERE reviewee_id = b.worker_id) as review_count
      FROM bids b
      JOIN users u ON b.worker_id = u.id
      WHERE b.job_id = ?
      ORDER BY b.submitted_at ASC
    `).bind(jobId).all()
    
    return c.json({ 
      job,
      bids: bids.results
    })
    
  } catch (error) {
    console.error('Error fetching job:', error)
    return c.json({ error: 'Failed to fetch job' }, 500)
  }
})

// Create new job (clients only)
jobRoutes.post('/', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    
    if (user.role !== 'client') {
      return c.json({ error: 'Only clients can create jobs' }, 403)
    }
    
    const { title, description, categoryId, budgetMin, budgetMax, urgency, locationAddress, startDate, expectedCompletion } = await c.req.json()
    
    if (!title || !description || !categoryId || !budgetMin || !budgetMax) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // Get client's location
    const client = await c.env.DB.prepare(`
      SELECT province, city FROM users WHERE id = ?
    `).bind(user.user_id).first()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO jobs (
        client_id, title, description, category_id, budget_min, budget_max, 
        urgency, location_province, location_city, location_address, 
        start_date, expected_completion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.user_id, title, description, categoryId, budgetMin, budgetMax,
      urgency || 'normal', client.province, client.city, locationAddress,
      startDate, expectedCompletion
    ).run()
    
    if (!result.success) {
      return c.json({ error: 'Failed to create job' }, 500)
    }
    
    return c.json({ 
      message: 'Job created successfully',
      jobId: result.meta.last_row_id
    })
    
  } catch (error) {
    console.error('Error creating job:', error)
    return c.json({ error: 'Failed to create job' }, 500)
  }
})

// Submit bid (workers only)
jobRoutes.post('/:id/bids', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const jobId = c.req.param('id')
    
    if (user.role !== 'worker') {
      return c.json({ error: 'Only workers can submit bids' }, 403)
    }
    
    const { bidAmount, coverMessage, estimatedTimeline } = await c.req.json()
    
    if (!bidAmount) {
      return c.json({ error: 'Bid amount is required' }, 400)
    }
    
    // Check if job exists and is available for bidding
    const job = await c.env.DB.prepare(`
      SELECT id, status FROM jobs WHERE id = ? AND status = 'posted'
    `).bind(jobId).first()
    
    if (!job) {
      return c.json({ error: 'Job not found or not available for bidding' }, 404)
    }
    
    // Check if worker already submitted a bid
    const existingBid = await c.env.DB.prepare(`
      SELECT id FROM bids WHERE job_id = ? AND worker_id = ?
    `).bind(jobId, user.user_id).first()
    
    if (existingBid) {
      return c.json({ error: 'You have already submitted a bid for this job' }, 409)
    }
    
    const result = await c.env.DB.prepare(`
      INSERT INTO bids (job_id, worker_id, bid_amount, cover_message, estimated_timeline)
      VALUES (?, ?, ?, ?, ?)
    `).bind(jobId, user.user_id, bidAmount, coverMessage, estimatedTimeline).run()
    
    if (!result.success) {
      return c.json({ error: 'Failed to submit bid' }, 500)
    }
    
    return c.json({ 
      message: 'Bid submitted successfully',
      bidId: result.meta.last_row_id
    })
    
  } catch (error) {
    console.error('Error submitting bid:', error)
    return c.json({ error: 'Failed to submit bid' }, 500)
  }
})

// Accept bid (clients only)
jobRoutes.post('/:jobId/bids/:bidId/accept', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    const jobId = c.req.param('jobId')
    const bidId = c.req.param('bidId')
    
    if (user.role !== 'client') {
      return c.json({ error: 'Only clients can accept bids' }, 403)
    }
    
    // Verify job belongs to client
    const job = await c.env.DB.prepare(`
      SELECT id, status FROM jobs WHERE id = ? AND client_id = ? AND status = 'posted'
    `).bind(jobId, user.user_id).first()
    
    if (!job) {
      return c.json({ error: 'Job not found or not owned by you' }, 404)
    }
    
    // Get bid details
    const bid = await c.env.DB.prepare(`
      SELECT worker_id, bid_amount FROM bids WHERE id = ? AND job_id = ? AND status = 'pending'
    `).bind(bidId, jobId).first()
    
    if (!bid) {
      return c.json({ error: 'Bid not found' }, 404)
    }
    
    // Update job status and assign worker
    await c.env.DB.prepare(`
      UPDATE jobs SET status = 'assigned', assigned_worker_id = ?, escrow_amount = ?
      WHERE id = ?
    `).bind(bid.worker_id, bid.bid_amount, jobId).run()
    
    // Update bid status
    await c.env.DB.prepare(`
      UPDATE bids SET status = 'accepted', responded_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(bidId).run()
    
    // Reject other bids
    await c.env.DB.prepare(`
      UPDATE bids SET status = 'rejected', responded_at = CURRENT_TIMESTAMP
      WHERE job_id = ? AND id != ?
    `).bind(jobId, bidId).run()
    
    return c.json({ message: 'Bid accepted successfully' })
    
  } catch (error) {
    console.error('Error accepting bid:', error)
    return c.json({ error: 'Failed to accept bid' }, 500)
  }
})

// Get user's jobs
jobRoutes.get('/user/my-jobs', requireAuth, async (c) => {
  try {
    const user = c.get('user')
    
    let query
    if (user.role === 'client') {
      query = `
        SELECT j.*, c.name as category_name, c.icon_class,
               w.first_name as worker_first_name, w.last_name as worker_last_name,
               (SELECT COUNT(*) FROM bids WHERE job_id = j.id AND status = 'pending') as bid_count
        FROM jobs j
        JOIN job_categories c ON j.category_id = c.id
        LEFT JOIN users w ON j.assigned_worker_id = w.id
        WHERE j.client_id = ?
        ORDER BY j.created_at DESC
      `
    } else {
      query = `
        SELECT j.*, c.name as category_name, c.icon_class,
               u.first_name as client_first_name, u.last_name as client_last_name,
               b.bid_amount, b.status as bid_status, b.submitted_at as bid_submitted_at
        FROM jobs j
        JOIN job_categories c ON j.category_id = c.id
        JOIN users u ON j.client_id = u.id
        JOIN bids b ON j.id = b.job_id
        WHERE b.worker_id = ?
        ORDER BY j.created_at DESC
      `
    }
    
    const jobs = await c.env.DB.prepare(query).bind(user.user_id).all()
    
    return c.json({ jobs: jobs.results })
    
  } catch (error) {
    console.error('Error fetching user jobs:', error)
    return c.json({ error: 'Failed to fetch jobs' }, 500)
  }
})