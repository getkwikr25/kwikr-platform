import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { PaymentWorkflow } from '../utils/payment-workflow'

type Bindings = {
  DB: D1Database
}

const payment = new Hono<{ Bindings: Bindings }>()

// Initialize payment workflow service
const getPaymentWorkflow = (c: any) => {
  return new PaymentWorkflow(c.env.DB)
}

// Initialize payment workflow
payment.post(
  '/initialize',
  validator('json', (value, c) => {
    const {
      booking_id,
      client_id,
      worker_id,
      amount_cents,
      platform_fee_percentage,
      auto_release_days,
      payment_method_id,
      currency,
      description
    } = value

    if (!booking_id || typeof booking_id !== 'number') {
      return c.json({ error: 'Valid booking_id is required' }, 400)
    }
    if (!client_id || typeof client_id !== 'number') {
      return c.json({ error: 'Valid client_id is required' }, 400)
    }
    if (!worker_id || typeof worker_id !== 'number') {
      return c.json({ error: 'Valid worker_id is required' }, 400)
    }
    if (!amount_cents || typeof amount_cents !== 'number' || amount_cents <= 0) {
      return c.json({ error: 'Valid amount_cents is required' }, 400)
    }
    if (platform_fee_percentage === undefined || typeof platform_fee_percentage !== 'number' || platform_fee_percentage < 0 || platform_fee_percentage > 100) {
      return c.json({ error: 'Valid platform_fee_percentage (0-100) is required' }, 400)
    }
    if (!auto_release_days || typeof auto_release_days !== 'number' || auto_release_days <= 0) {
      return c.json({ error: 'Valid auto_release_days is required' }, 400)
    }

    return {
      booking_id,
      client_id,
      worker_id,
      amount_cents,
      platform_fee_percentage,
      auto_release_days,
      payment_method_id: typeof payment_method_id === 'string' ? payment_method_id : undefined,
      currency: typeof currency === 'string' ? currency : 'cad',
      description: typeof description === 'string' ? description : undefined
    }
  }),
  async (c) => {
    try {
      const params = c.req.valid('json')
      const workflow = getPaymentWorkflow(c)

      const result = await workflow.initializePayment(params)

      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }

      return c.json({
        success: true,
        payment_intent_id: result.payment_intent_id,
        escrow_account_id: result.escrow_account_id,
        client_secret: result.client_secret,
        workflow_status: result.workflow_status
      })
    } catch (error) {
      console.error('Error in payment initialization:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  }
)

// Confirm payment
payment.post(
  '/confirm',
  validator('json', (value, c) => {
    const { payment_intent_id, payment_method_id } = value

    if (!payment_intent_id || typeof payment_intent_id !== 'string') {
      return c.json({ error: 'Valid payment_intent_id is required' }, 400)
    }

    return {
      payment_intent_id,
      payment_method_id: typeof payment_method_id === 'string' ? payment_method_id : undefined
    }
  }),
  async (c) => {
    try {
      const { payment_intent_id, payment_method_id } = c.req.valid('json')
      const workflow = getPaymentWorkflow(c)

      const result = await workflow.confirmPayment(payment_intent_id, payment_method_id)

      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }

      return c.json({
        success: true,
        payment_intent_id: result.payment_intent_id,
        escrow_account_id: result.escrow_account_id,
        workflow_status: result.workflow_status
      })
    } catch (error) {
      console.error('Error in payment confirmation:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  }
)

// Mark work as completed
payment.post(
  '/mark-completed',
  validator('json', (value, c) => {
    const { booking_id, completed_by_user_id } = value

    if (!booking_id || typeof booking_id !== 'number') {
      return c.json({ error: 'Valid booking_id is required' }, 400)
    }
    if (!completed_by_user_id || typeof completed_by_user_id !== 'number') {
      return c.json({ error: 'Valid completed_by_user_id is required' }, 400)
    }

    return { booking_id, completed_by_user_id }
  }),
  async (c) => {
    try {
      const { booking_id, completed_by_user_id } = c.req.valid('json')
      const workflow = getPaymentWorkflow(c)

      const result = await workflow.markWorkCompleted(booking_id, completed_by_user_id)

      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }

      return c.json({
        success: true,
        escrow_account_id: result.escrow_account_id,
        workflow_status: result.workflow_status
      })
    } catch (error) {
      console.error('Error marking work completed:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  }
)

// Release payment manually
payment.post(
  '/release',
  validator('json', (value, c) => {
    const { escrow_account_id, released_by_user_id, reason } = value

    if (!escrow_account_id || typeof escrow_account_id !== 'number') {
      return c.json({ error: 'Valid escrow_account_id is required' }, 400)
    }
    if (!released_by_user_id || typeof released_by_user_id !== 'number') {
      return c.json({ error: 'Valid released_by_user_id is required' }, 400)
    }

    return {
      escrow_account_id,
      released_by_user_id,
      reason: typeof reason === 'string' ? reason : undefined
    }
  }),
  async (c) => {
    try {
      const { escrow_account_id, released_by_user_id, reason } = c.req.valid('json')
      const workflow = getPaymentWorkflow(c)

      const result = await workflow.releasePayment(escrow_account_id, released_by_user_id, reason)

      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }

      return c.json({
        success: true,
        escrow_account_id: result.escrow_account_id,
        workflow_status: result.workflow_status
      })
    } catch (error) {
      console.error('Error releasing payment:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  }
)

// Dispute payment
payment.post(
  '/dispute',
  validator('json', (value, c) => {
    const { escrow_account_id, disputed_by_user_id, reason } = value

    if (!escrow_account_id || typeof escrow_account_id !== 'number') {
      return c.json({ error: 'Valid escrow_account_id is required' }, 400)
    }
    if (!disputed_by_user_id || typeof disputed_by_user_id !== 'number') {
      return c.json({ error: 'Valid disputed_by_user_id is required' }, 400)
    }
    if (!reason || typeof reason !== 'string') {
      return c.json({ error: 'Valid reason is required' }, 400)
    }

    return { escrow_account_id, disputed_by_user_id, reason }
  }),
  async (c) => {
    try {
      const { escrow_account_id, disputed_by_user_id, reason } = c.req.valid('json')
      const workflow = getPaymentWorkflow(c)

      const result = await workflow.disputePayment(escrow_account_id, disputed_by_user_id, reason)

      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }

      return c.json({
        success: true,
        escrow_account_id: result.escrow_account_id,
        workflow_status: result.workflow_status
      })
    } catch (error) {
      console.error('Error disputing payment:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  }
)

// Process refund
payment.post(
  '/refund',
  validator('json', (value, c) => {
    const { escrow_account_id, refunded_by_user_id, reason } = value

    if (!escrow_account_id || typeof escrow_account_id !== 'number') {
      return c.json({ error: 'Valid escrow_account_id is required' }, 400)
    }
    if (!refunded_by_user_id || typeof refunded_by_user_id !== 'number') {
      return c.json({ error: 'Valid refunded_by_user_id is required' }, 400)
    }

    return {
      escrow_account_id,
      refunded_by_user_id,
      reason: typeof reason === 'string' ? reason : undefined
    }
  }),
  async (c) => {
    try {
      const { escrow_account_id, refunded_by_user_id, reason } = c.req.valid('json')
      const workflow = getPaymentWorkflow(c)

      const result = await workflow.processRefund(escrow_account_id, refunded_by_user_id, reason)

      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }

      return c.json({
        success: true,
        escrow_account_id: result.escrow_account_id,
        workflow_status: result.workflow_status
      })
    } catch (error) {
      console.error('Error processing refund:', error)
      return c.json({ error: 'Internal server error' }, 500)
    }
  }
)

// Get payment workflow status
payment.get('/status/:bookingId', async (c) => {
  try {
    const bookingId = parseInt(c.req.param('bookingId'))
    const workflow = getPaymentWorkflow(c)

    if (isNaN(bookingId)) {
      return c.json({ error: 'Invalid booking ID' }, 400)
    }

    const result = await workflow.getPaymentWorkflowStatus(bookingId)

    if (!result.success) {
      return c.json({ error: result.error }, 404)
    }

    return c.json({
      success: true,
      workflow: result.workflow
    })
  } catch (error) {
    console.error('Error getting payment workflow status:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Stripe webhook handler for payment updates
payment.post('/webhook/stripe', async (c) => {
  try {
    const body = await c.req.text()
    const signature = c.req.header('stripe-signature')

    if (!signature) {
      return c.json({ error: 'Missing Stripe signature' }, 400)
    }

    // TODO: Verify webhook signature with Stripe
    const event = JSON.parse(body)

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        const workflow = getPaymentWorkflow(c)
        
        // Automatically confirm payment when Stripe notifies us
        await workflow.confirmPayment(paymentIntent.id)
        break

      case 'payment_intent.payment_failed':
        // Handle failed payments
        console.log('Payment failed:', event.data.object.id)
        break

      default:
        console.log('Unhandled Stripe event type:', event.type)
    }

    return c.json({ received: true })
  } catch (error) {
    console.error('Error handling Stripe webhook:', error)
    return c.json({ error: 'Webhook processing failed' }, 500)
  }
})

export { payment }