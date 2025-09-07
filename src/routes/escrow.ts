import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { EscrowService } from '../utils/escrow-service'
import { StripePaymentService } from '../utils/stripe-payment-service'

type Bindings = {
  DB: D1Database
}

const escrow = new Hono<{ Bindings: Bindings }>()

// Initialize services
const getEscrowService = (c: any) => {
  const stripeService = new StripePaymentService(c.env)
  return new EscrowService(c.env.DB, stripeService)
}

// Create escrow account
escrow.post(
  '/create',
  validator('json', (value, c) => {
    const { booking_id, total_amount_cents, platform_fee_percentage, auto_release_days, release_conditions } = value
    
    if (!booking_id || typeof booking_id !== 'number') {
      return c.json({ error: 'Valid booking_id is required' }, 400)
    }
    if (!total_amount_cents || typeof total_amount_cents !== 'number' || total_amount_cents <= 0) {
      return c.json({ error: 'Valid total_amount_cents is required' }, 400)
    }
    if (platform_fee_percentage === undefined || typeof platform_fee_percentage !== 'number' || platform_fee_percentage < 0 || platform_fee_percentage > 100) {
      return c.json({ error: 'Valid platform_fee_percentage (0-100) is required' }, 400)
    }
    if (!auto_release_days || typeof auto_release_days !== 'number' || auto_release_days <= 0) {
      return c.json({ error: 'Valid auto_release_days is required' }, 400)
    }

    return {
      booking_id,
      total_amount_cents,
      platform_fee_percentage,
      auto_release_days,
      release_conditions: Array.isArray(release_conditions) ? release_conditions : []
    }
  }),
  async (c) => {
    try {
      const params = c.req.valid('json')
      const escrowService = getEscrowService(c)

      const result = await escrowService.createEscrowAccount(params)

      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }

      return c.json({
        success: true,
        escrow_account: result.escrow_account
      })
    } catch (error) {
      console.error('Error in escrow creation:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  }
)

// Fund escrow account
escrow.post(
  '/:escrowId/fund',
  validator('json', (value, c) => {
    const { payment_intent_id } = value
    
    if (!payment_intent_id || typeof payment_intent_id !== 'string') {
      return c.json({ error: 'Valid payment_intent_id is required' }, 400)
    }

    return { payment_intent_id }
  }),
  async (c) => {
    try {
      const escrowId = parseInt(c.req.param('escrowId'))
      const { payment_intent_id } = c.req.valid('json')
      const escrowService = getEscrowService(c)

      if (isNaN(escrowId)) {
        return c.json({ error: 'Invalid escrow ID' }, 400)
      }

      const result = await escrowService.fundEscrowAccount(escrowId, payment_intent_id)

      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }

      return c.json({ success: true })
    } catch (error) {
      console.error('Error in escrow funding:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  }
)

// Update release conditions
escrow.post(
  '/:escrowId/conditions',
  validator('json', (value, c) => {
    const { conditions_met } = value
    
    if (typeof conditions_met !== 'boolean') {
      return c.json({ error: 'conditions_met must be a boolean' }, 400)
    }

    return { conditions_met }
  }),
  async (c) => {
    try {
      const escrowId = parseInt(c.req.param('escrowId'))
      const { conditions_met } = c.req.valid('json')
      const escrowService = getEscrowService(c)

      if (isNaN(escrowId)) {
        return c.json({ error: 'Invalid escrow ID' }, 400)
      }

      const result = await escrowService.updateReleaseConditions(escrowId, conditions_met)

      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }

      return c.json({
        success: true,
        auto_release_triggered: result.auto_release_triggered
      })
    } catch (error) {
      console.error('Error updating release conditions:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  }
)

// Release escrow funds
escrow.post(
  '/:escrowId/release',
  validator('json', (value, c) => {
    const { released_by_user_id, reason, force_release } = value
    
    if (!released_by_user_id || typeof released_by_user_id !== 'number') {
      return c.json({ error: 'Valid released_by_user_id is required' }, 400)
    }

    return {
      released_by_user_id,
      reason: typeof reason === 'string' ? reason : undefined,
      force_release: typeof force_release === 'boolean' ? force_release : false
    }
  }),
  async (c) => {
    try {
      const escrowId = parseInt(c.req.param('escrowId'))
      const params = c.req.valid('json')
      const escrowService = getEscrowService(c)

      if (isNaN(escrowId)) {
        return c.json({ error: 'Invalid escrow ID' }, 400)
      }

      const result = await escrowService.releaseEscrowFunds({
        escrow_account_id: escrowId,
        ...params
      })

      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }

      return c.json({
        success: true,
        payout_created: result.payout_created
      })
    } catch (error) {
      console.error('Error releasing escrow funds:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  }
)

// Dispute escrow
escrow.post(
  '/:escrowId/dispute',
  validator('json', (value, c) => {
    const { disputed_by_user_id, dispute_reason, evidence } = value
    
    if (!disputed_by_user_id || typeof disputed_by_user_id !== 'number') {
      return c.json({ error: 'Valid disputed_by_user_id is required' }, 400)
    }
    if (!dispute_reason || typeof dispute_reason !== 'string') {
      return c.json({ error: 'Valid dispute_reason is required' }, 400)
    }

    return {
      disputed_by_user_id,
      dispute_reason,
      evidence: typeof evidence === 'string' ? evidence : undefined
    }
  }),
  async (c) => {
    try {
      const escrowId = parseInt(c.req.param('escrowId'))
      const params = c.req.valid('json')
      const escrowService = getEscrowService(c)

      if (isNaN(escrowId)) {
        return c.json({ error: 'Invalid escrow ID' }, 400)
      }

      const result = await escrowService.disputeEscrow({
        escrow_account_id: escrowId,
        ...params
      })

      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }

      return c.json({ success: true })
    } catch (error) {
      console.error('Error disputing escrow:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  }
)

// Refund escrow
escrow.post(
  '/:escrowId/refund',
  validator('json', (value, c) => {
    const { refunded_by_user_id, reason } = value
    
    if (!refunded_by_user_id || typeof refunded_by_user_id !== 'number') {
      return c.json({ error: 'Valid refunded_by_user_id is required' }, 400)
    }

    return {
      refunded_by_user_id,
      reason: typeof reason === 'string' ? reason : undefined
    }
  }),
  async (c) => {
    try {
      const escrowId = parseInt(c.req.param('escrowId'))
      const { refunded_by_user_id, reason } = c.req.valid('json')
      const escrowService = getEscrowService(c)

      if (isNaN(escrowId)) {
        return c.json({ error: 'Invalid escrow ID' }, 400)
      }

      const result = await escrowService.refundEscrow(escrowId, refunded_by_user_id, reason)

      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }

      return c.json({
        success: true,
        refund_id: result.refund_id
      })
    } catch (error) {
      console.error('Error processing escrow refund:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  }
)

// Get escrow account details
escrow.get('/:escrowId', async (c) => {
  try {
    const escrowId = parseInt(c.req.param('escrowId'))
    const escrowService = getEscrowService(c)

    if (isNaN(escrowId)) {
      return c.json({ error: 'Invalid escrow ID' }, 400)
    }

    const result = await escrowService.getEscrowAccount(escrowId)

    if (!result.success) {
      return c.json({ error: result.error }, 404)
    }

    return c.json({
      success: true,
      escrow: result.escrow
    })
  } catch (error) {
    console.error('Error getting escrow account:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get escrow accounts by booking
escrow.get('/booking/:bookingId', async (c) => {
  try {
    const bookingId = parseInt(c.req.param('bookingId'))
    const escrowService = getEscrowService(c)

    if (isNaN(bookingId)) {
      return c.json({ error: 'Invalid booking ID' }, 400)
    }

    const result = await escrowService.getEscrowsByBooking(bookingId)

    if (!result.success) {
      return c.json({ error: result.error }, 400)
    }

    return c.json({
      success: true,
      escrows: result.escrows
    })
  } catch (error) {
    console.error('Error getting escrows by booking:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Process automatic releases (admin endpoint)
escrow.post('/admin/auto-release', async (c) => {
  try {
    const escrowService = getEscrowService(c)

    const result = await escrowService.processAutoReleases()

    if (!result.success) {
      return c.json({ error: result.error }, 400)
    }

    return c.json({
      success: true,
      processed_count: result.processed_count
    })
  } catch (error) {
    console.error('Error processing auto releases:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export { escrow }