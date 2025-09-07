import { Hono } from 'hono'
import { ClientDashboardService } from '../services/ClientDashboardService'

type Bindings = {
  DB: D1Database
}

const clientDashboard = new Hono<{ Bindings: Bindings }>()

// Initialize service
const getService = (db: D1Database) => new ClientDashboardService(db)

/**
 * CLIENT PROFILE MANAGEMENT ROUTES
 */

// Get client profile
clientDashboard.get('/profile/:clientId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    if (isNaN(clientId)) {
      return c.json({ error: 'Invalid client ID' }, 400)
    }

    const service = getService(c.env.DB)
    const profile = await service.getClientProfile(clientId)
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404)
    }

    return c.json(profile)
  } catch (error) {
    console.error('Error fetching client profile:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update client profile
clientDashboard.patch('/profile/:clientId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    if (isNaN(clientId)) {
      return c.json({ error: 'Invalid client ID' }, 400)
    }

    const profileData = await c.req.json()
    const service = getService(c.env.DB)
    const updated = await service.updateClientProfile(clientId, profileData)
    
    return c.json(updated)
  } catch (error) {
    console.error('Error updating client profile:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * JOB MANAGEMENT DASHBOARD ROUTES
 */

// Get client job posts
clientDashboard.get('/jobs/:clientId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    if (isNaN(clientId)) {
      return c.json({ error: 'Invalid client ID' }, 400)
    }

    const url = new URL(c.req.url)
    const options = {
      status: url.searchParams.get('status') || undefined,
      limit: parseInt(url.searchParams.get('limit') || '20'),
      offset: parseInt(url.searchParams.get('offset') || '0'),
      sortBy: url.searchParams.get('sortBy') as 'created_at' | 'updated_at' | 'budget' || 'created_at',
      sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'
    }

    const service = getService(c.env.DB)
    const jobs = await service.getJobPosts(clientId, options)
    
    return c.json(jobs)
  } catch (error) {
    console.error('Error fetching client jobs:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create new job post
clientDashboard.post('/jobs/:clientId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    if (isNaN(clientId)) {
      return c.json({ error: 'Invalid client ID' }, 400)
    }

    const jobData = await c.req.json()
    const service = getService(c.env.DB)
    const job = await service.createJobPost(clientId, jobData)
    
    return c.json(job, 201)
  } catch (error) {
    console.error('Error creating job post:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update job post
clientDashboard.patch('/jobs/:clientId/:jobId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    const jobId = parseInt(c.req.param('jobId'))
    
    if (isNaN(clientId) || isNaN(jobId)) {
      return c.json({ error: 'Invalid client ID or job ID' }, 400)
    }

    const jobData = await c.req.json()
    const service = getService(c.env.DB)
    const updated = await service.updateJobPost(jobId, jobData)
    
    return c.json(updated)
  } catch (error) {
    console.error('Error updating job post:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete job post
clientDashboard.delete('/jobs/:clientId/:jobId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    const jobId = parseInt(c.req.param('jobId'))
    
    if (isNaN(clientId) || isNaN(jobId)) {
      return c.json({ error: 'Invalid client ID or job ID' }, 400)
    }

    const service = getService(c.env.DB)
    const success = await service.deleteJobPost(jobId)
    
    if (!success) {
      return c.json({ error: 'Job not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting job post:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * FAVORITE WORKERS ROUTES
 */

// Get favorite workers
clientDashboard.get('/favorites/:clientId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    if (isNaN(clientId)) {
      return c.json({ error: 'Invalid client ID' }, 400)
    }

    const service = getService(c.env.DB)
    const favorites = await service.getFavoriteWorkers(clientId)
    
    return c.json(favorites)
  } catch (error) {
    console.error('Error fetching favorite workers:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Add favorite worker
clientDashboard.post('/favorites/:clientId/:workerId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    const workerId = parseInt(c.req.param('workerId'))
    
    if (isNaN(clientId) || isNaN(workerId)) {
      return c.json({ error: 'Invalid client ID or worker ID' }, 400)
    }

    const { notes } = await c.req.json().catch(() => ({}))
    
    const service = getService(c.env.DB)
    const favorite = await service.addFavoriteWorker(clientId, workerId, notes)
    
    return c.json(favorite, 201)
  } catch (error) {
    console.error('Error adding favorite worker:', error)
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return c.json({ error: 'Worker is already in favorites' }, 409)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Remove favorite worker
clientDashboard.delete('/favorites/:clientId/:workerId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    const workerId = parseInt(c.req.param('workerId'))
    
    if (isNaN(clientId) || isNaN(workerId)) {
      return c.json({ error: 'Invalid client ID or worker ID' }, 400)
    }

    const service = getService(c.env.DB)
    const success = await service.removeFavoriteWorker(clientId, workerId)
    
    if (!success) {
      return c.json({ error: 'Favorite not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error removing favorite worker:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * PAYMENT METHODS ROUTES
 */

// Get payment methods
clientDashboard.get('/payment-methods/:clientId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    if (isNaN(clientId)) {
      return c.json({ error: 'Invalid client ID' }, 400)
    }

    const service = getService(c.env.DB)
    const methods = await service.getPaymentMethods(clientId)
    
    return c.json(methods)
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Add payment method
clientDashboard.post('/payment-methods/:clientId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    if (isNaN(clientId)) {
      return c.json({ error: 'Invalid client ID' }, 400)
    }

    const paymentData = await c.req.json()
    
    // Validate required fields
    if (!paymentData.type || !paymentData.card_last_four || !paymentData.card_brand) {
      return c.json({ error: 'Missing required payment method fields' }, 400)
    }

    const service = getService(c.env.DB)
    const method = await service.addPaymentMethod(clientId, paymentData)
    
    return c.json(method, 201)
  } catch (error) {
    console.error('Error adding payment method:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update payment method
clientDashboard.patch('/payment-methods/:clientId/:methodId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    const methodId = parseInt(c.req.param('methodId'))
    
    if (isNaN(clientId) || isNaN(methodId)) {
      return c.json({ error: 'Invalid client ID or method ID' }, 400)
    }

    const updateData = await c.req.json()
    const service = getService(c.env.DB)
    const updated = await service.updatePaymentMethod(methodId, updateData)
    
    return c.json(updated)
  } catch (error) {
    console.error('Error updating payment method:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Set default payment method
clientDashboard.patch('/payment-methods/:clientId/:methodId/default', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    const methodId = parseInt(c.req.param('methodId'))
    
    if (isNaN(clientId) || isNaN(methodId)) {
      return c.json({ error: 'Invalid client ID or method ID' }, 400)
    }

    const service = getService(c.env.DB)
    const success = await service.setDefaultPaymentMethod(clientId, methodId)
    
    if (!success) {
      return c.json({ error: 'Payment method not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error setting default payment method:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete payment method
clientDashboard.delete('/payment-methods/:clientId/:methodId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    const methodId = parseInt(c.req.param('methodId'))
    
    if (isNaN(clientId) || isNaN(methodId)) {
      return c.json({ error: 'Invalid client ID or method ID' }, 400)
    }

    const service = getService(c.env.DB)
    const success = await service.deletePaymentMethod(methodId)
    
    if (!success) {
      return c.json({ error: 'Payment method not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment method:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * SERVICE HISTORY ROUTES
 */

// Get service history
clientDashboard.get('/history/:clientId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    if (isNaN(clientId)) {
      return c.json({ error: 'Invalid client ID' }, 400)
    }

    const url = new URL(c.req.url)
    const options = {
      status: url.searchParams.get('status') || undefined,
      serviceType: url.searchParams.get('serviceType') || undefined,
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
      limit: parseInt(url.searchParams.get('limit') || '20'),
      offset: parseInt(url.searchParams.get('offset') || '0'),
      sortBy: url.searchParams.get('sortBy') as 'service_date' | 'created_at' | 'cost' || 'service_date',
      sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'
    }

    const service = getService(c.env.DB)
    const history = await service.getServiceHistory(clientId, options)
    
    return c.json(history)
  } catch (error) {
    console.error('Error fetching service history:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * NOTIFICATION PREFERENCES ROUTES
 */

// Get notification preferences
clientDashboard.get('/notifications/:clientId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    if (isNaN(clientId)) {
      return c.json({ error: 'Invalid client ID' }, 400)
    }

    const service = getService(c.env.DB)
    const preferences = await service.getNotificationPreferences(clientId)
    
    return c.json(preferences)
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update notification preferences
clientDashboard.patch('/notifications/:clientId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    if (isNaN(clientId)) {
      return c.json({ error: 'Invalid client ID' }, 400)
    }

    const preferencesData = await c.req.json()
    const service = getService(c.env.DB)
    const updated = await service.updateNotificationPreferences(clientId, preferencesData)
    
    return c.json(updated)
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * DASHBOARD ANALYTICS & SUMMARY ROUTES
 */

// Get dashboard analytics
clientDashboard.get('/analytics/:clientId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    if (isNaN(clientId)) {
      return c.json({ error: 'Invalid client ID' }, 400)
    }

    const service = getService(c.env.DB)
    const analytics = await service.getDashboardAnalytics(clientId)
    
    return c.json(analytics)
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get dashboard summary
clientDashboard.get('/summary/:clientId', async (c) => {
  try {
    const clientId = parseInt(c.req.param('clientId'))
    if (isNaN(clientId)) {
      return c.json({ error: 'Invalid client ID' }, 400)
    }

    const service = getService(c.env.DB)
    const summary = await service.getClientDashboardSummary(clientId)
    
    return c.json(summary)
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default clientDashboard