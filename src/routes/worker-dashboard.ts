import { Hono } from 'hono'
import { WorkerDashboardService } from '../services/WorkerDashboardService'

type Bindings = {
  DB: D1Database
}

const workerDashboard = new Hono<{ Bindings: Bindings }>()

// Initialize service
const getService = (db: D1Database) => new WorkerDashboardService(db)

/**
 * JOB APPLICATIONS TRACKING ROUTES
 */

// Get worker job applications
workerDashboard.get('/applications/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const url = new URL(c.req.url)
    const options = {
      status: url.searchParams.get('status') || undefined,
      limit: parseInt(url.searchParams.get('limit') || '20'),
      offset: parseInt(url.searchParams.get('offset') || '0'),
      sortBy: url.searchParams.get('sortBy') as 'applied_at' | 'status_changed_at' | 'bid_amount' || 'applied_at',
      sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'
    }

    const service = getService(c.env.DB)
    const applications = await service.getJobApplications(workerId, options)
    
    return c.json(applications)
  } catch (error) {
    console.error('Error fetching job applications:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create job application
workerDashboard.post('/applications/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const applicationData = await c.req.json()
    const service = getService(c.env.DB)
    const application = await service.createJobApplication(workerId, applicationData)
    
    return c.json(application, 201)
  } catch (error) {
    console.error('Error creating job application:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update job application
workerDashboard.patch('/applications/:workerId/:applicationId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    const applicationId = parseInt(c.req.param('applicationId'))
    
    if (isNaN(workerId) || isNaN(applicationId)) {
      return c.json({ error: 'Invalid worker ID or application ID' }, 400)
    }

    const applicationData = await c.req.json()
    const service = getService(c.env.DB)
    const updated = await service.updateJobApplication(applicationId, applicationData)
    
    return c.json(updated)
  } catch (error) {
    console.error('Error updating job application:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Withdraw job application
workerDashboard.patch('/applications/:workerId/:applicationId/withdraw', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    const applicationId = parseInt(c.req.param('applicationId'))
    
    if (isNaN(workerId) || isNaN(applicationId)) {
      return c.json({ error: 'Invalid worker ID or application ID' }, 400)
    }

    const service = getService(c.env.DB)
    const success = await service.withdrawJobApplication(workerId, applicationId)
    
    if (!success) {
      return c.json({ error: 'Application not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error withdrawing job application:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * EARNINGS DASHBOARD ROUTES
 */

// Get worker earnings
workerDashboard.get('/earnings/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const url = new URL(c.req.url)
    const options = {
      transactionType: url.searchParams.get('transactionType') || undefined,
      paymentStatus: url.searchParams.get('paymentStatus') || undefined,
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
      limit: parseInt(url.searchParams.get('limit') || '50'),
      offset: parseInt(url.searchParams.get('offset') || '0')
    }

    const service = getService(c.env.DB)
    const earnings = await service.getEarnings(workerId, options)
    
    return c.json(earnings)
  } catch (error) {
    console.error('Error fetching earnings:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get earnings summary
workerDashboard.get('/earnings/:workerId/summary', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const period = c.req.query('period') as 'daily' | 'weekly' | 'monthly' | 'yearly' || 'monthly'
    
    const service = getService(c.env.DB)
    const summary = await service.getEarningsSummary(workerId, period)
    
    return c.json(summary)
  } catch (error) {
    console.error('Error fetching earnings summary:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create earning record
workerDashboard.post('/earnings/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const earningData = await c.req.json()
    const service = getService(c.env.DB)
    const earning = await service.createEarningRecord(workerId, earningData)
    
    return c.json(earning, 201)
  } catch (error) {
    console.error('Error creating earning record:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * CUSTOMER MANAGEMENT ROUTES
 */

// Get worker customers
workerDashboard.get('/customers/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const url = new URL(c.req.url)
    const options = {
      relationshipStatus: url.searchParams.get('relationshipStatus') || undefined,
      sortBy: url.searchParams.get('sortBy') as 'last_service_date' | 'total_revenue' | 'total_jobs_completed' || 'total_revenue',
      sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
      limit: parseInt(url.searchParams.get('limit') || '50'),
      offset: parseInt(url.searchParams.get('offset') || '0')
    }

    const service = getService(c.env.DB)
    const customers = await service.getCustomers(workerId, options)
    
    return c.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get top customers
workerDashboard.get('/customers/:workerId/top', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const limit = parseInt(c.req.query('limit') || '10')
    
    const service = getService(c.env.DB)
    const customers = await service.getTopCustomers(workerId, limit)
    
    return c.json(customers)
  } catch (error) {
    console.error('Error fetching top customers:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update customer
workerDashboard.patch('/customers/:workerId/:customerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    const customerId = parseInt(c.req.param('customerId'))
    
    if (isNaN(workerId) || isNaN(customerId)) {
      return c.json({ error: 'Invalid worker ID or customer ID' }, 400)
    }

    const customerData = await c.req.json()
    const service = getService(c.env.DB)
    const updated = await service.updateCustomer(customerId, customerData)
    
    return c.json(updated)
  } catch (error) {
    console.error('Error updating customer:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * SERVICE ANALYTICS ROUTES
 */

// Get service analytics
workerDashboard.get('/analytics/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const url = new URL(c.req.url)
    const options = {
      periodType: url.searchParams.get('periodType') as 'daily' | 'weekly' | 'monthly' | 'yearly' || undefined,
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined
    }

    const service = getService(c.env.DB)
    const analytics = await service.getServiceAnalytics(workerId, options)
    
    return c.json(analytics)
  } catch (error) {
    console.error('Error fetching service analytics:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get performance metrics
workerDashboard.get('/analytics/:workerId/performance', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const service = getService(c.env.DB)
    const metrics = await service.getPerformanceMetrics(workerId)
    
    return c.json(metrics)
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * AVAILABILITY MANAGEMENT ROUTES
 */

// Get worker availability
workerDashboard.get('/availability/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const url = new URL(c.req.url)
    const options = {
      availabilityType: url.searchParams.get('availabilityType') || undefined,
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
      includeInactive: url.searchParams.get('includeInactive') === 'true'
    }

    const service = getService(c.env.DB)
    const availability = await service.getAvailability(workerId, options)
    
    return c.json(availability)
  } catch (error) {
    console.error('Error fetching availability:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create availability
workerDashboard.post('/availability/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const availabilityData = await c.req.json()
    const service = getService(c.env.DB)
    const availability = await service.createAvailability(workerId, availabilityData)
    
    return c.json(availability, 201)
  } catch (error) {
    console.error('Error creating availability:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update availability
workerDashboard.patch('/availability/:workerId/:availabilityId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    const availabilityId = parseInt(c.req.param('availabilityId'))
    
    if (isNaN(workerId) || isNaN(availabilityId)) {
      return c.json({ error: 'Invalid worker ID or availability ID' }, 400)
    }

    const availabilityData = await c.req.json()
    const service = getService(c.env.DB)
    const updated = await service.updateAvailability(availabilityId, availabilityData)
    
    return c.json(updated)
  } catch (error) {
    console.error('Error updating availability:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete availability
workerDashboard.delete('/availability/:workerId/:availabilityId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    const availabilityId = parseInt(c.req.param('availabilityId'))
    
    if (isNaN(workerId) || isNaN(availabilityId)) {
      return c.json({ error: 'Invalid worker ID or availability ID' }, 400)
    }

    const service = getService(c.env.DB)
    const success = await service.deleteAvailability(workerId, availabilityId)
    
    if (!success) {
      return c.json({ error: 'Availability not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting availability:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * PORTFOLIO MANAGEMENT ROUTES
 */

// Get portfolio items
workerDashboard.get('/portfolio/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const url = new URL(c.req.url)
    const options = {
      itemType: url.searchParams.get('itemType') || undefined,
      isPublic: url.searchParams.get('isPublic') ? url.searchParams.get('isPublic') === 'true' : undefined,
      isFeatured: url.searchParams.get('isFeatured') ? url.searchParams.get('isFeatured') === 'true' : undefined,
      limit: parseInt(url.searchParams.get('limit') || '50'),
      offset: parseInt(url.searchParams.get('offset') || '0')
    }

    const service = getService(c.env.DB)
    const portfolio = await service.getPortfolioItems(workerId, options)
    
    return c.json(portfolio)
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create portfolio item
workerDashboard.post('/portfolio/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const portfolioData = await c.req.json()
    const service = getService(c.env.DB)
    const portfolio = await service.createPortfolioItem(workerId, portfolioData)
    
    return c.json(portfolio, 201)
  } catch (error) {
    console.error('Error creating portfolio item:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update portfolio item
workerDashboard.patch('/portfolio/:workerId/:portfolioId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    const portfolioId = parseInt(c.req.param('portfolioId'))
    
    if (isNaN(workerId) || isNaN(portfolioId)) {
      return c.json({ error: 'Invalid worker ID or portfolio ID' }, 400)
    }

    const portfolioData = await c.req.json()
    const service = getService(c.env.DB)
    const updated = await service.updatePortfolioItem(portfolioId, portfolioData)
    
    return c.json(updated)
  } catch (error) {
    console.error('Error updating portfolio item:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete portfolio item
workerDashboard.delete('/portfolio/:workerId/:portfolioId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    const portfolioId = parseInt(c.req.param('portfolioId'))
    
    if (isNaN(workerId) || isNaN(portfolioId)) {
      return c.json({ error: 'Invalid worker ID or portfolio ID' }, 400)
    }

    const service = getService(c.env.DB)
    const success = await service.deletePortfolioItem(workerId, portfolioId)
    
    if (!success) {
      return c.json({ error: 'Portfolio item not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting portfolio item:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * DASHBOARD SETTINGS ROUTES
 */

// Get dashboard settings
workerDashboard.get('/settings/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const service = getService(c.env.DB)
    const settings = await service.getDashboardSettings(workerId)
    
    return c.json(settings)
  } catch (error) {
    console.error('Error fetching dashboard settings:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update dashboard settings
workerDashboard.patch('/settings/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const settingsData = await c.req.json()
    const service = getService(c.env.DB)
    const updated = await service.updateDashboardSettings(workerId, settingsData)
    
    return c.json(updated)
  } catch (error) {
    console.error('Error updating dashboard settings:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * PERFORMANCE GOALS ROUTES
 */

// Get performance goals
workerDashboard.get('/goals/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const isActive = c.req.query('isActive') !== 'false'
    
    const service = getService(c.env.DB)
    const goals = await service.getPerformanceGoals(workerId, isActive)
    
    return c.json(goals)
  } catch (error) {
    console.error('Error fetching performance goals:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create performance goal
workerDashboard.post('/goals/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const goalData = await c.req.json()
    const service = getService(c.env.DB)
    const goal = await service.createPerformanceGoal(workerId, goalData)
    
    return c.json(goal, 201)
  } catch (error) {
    console.error('Error creating performance goal:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * DASHBOARD SUMMARY ROUTE
 */

// Get comprehensive dashboard summary
workerDashboard.get('/summary/:workerId', async (c) => {
  try {
    const workerId = parseInt(c.req.param('workerId'))
    if (isNaN(workerId)) {
      return c.json({ error: 'Invalid worker ID' }, 400)
    }

    const service = getService(c.env.DB)
    const summary = await service.getWorkerDashboardSummary(workerId)
    
    return c.json(summary)
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default workerDashboard