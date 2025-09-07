import { D1Database } from '@cloudflare/workers-types'
import { StripePaymentService } from './stripe-payment-service'
import { EscrowService } from './escrow-service'

export interface PaymentWorkflowParams {
  booking_id: number
  client_id: number
  worker_id: number
  amount_cents: number
  platform_fee_percentage: number
  auto_release_days: number
  payment_method_id?: string
  currency?: string
  description?: string
}

export interface PaymentWorkflowResult {
  success: boolean
  payment_intent_id?: string
  escrow_account_id?: number
  client_secret?: string
  error?: string
  workflow_status?: 'payment_created' | 'payment_confirmed' | 'escrow_funded' | 'failed'
}

export interface WorkflowStatusUpdate {
  booking_id: number
  status: 'payment_pending' | 'payment_confirmed' | 'escrow_funded' | 'ready_for_work' | 'work_completed' | 'payment_released' | 'disputed' | 'refunded'
  updated_by?: string
  notes?: string
}

/**
 * Complete payment workflow that handles:
 * 1. Creating Stripe payment intent
 * 2. Creating escrow account
 * 3. Processing payment confirmation
 * 4. Funding escrow
 * 5. Managing payment lifecycle
 */
export class PaymentWorkflow {
  private db: D1Database
  private stripeService: StripePaymentService
  private escrowService: EscrowService

  constructor(db: D1Database, env?: any) {
    this.db = db
    this.stripeService = new StripePaymentService(env)
    this.escrowService = new EscrowService(db, this.stripeService)
  }

  /**
   * Step 1: Initialize payment workflow
   * Creates payment intent and escrow account
   */
  async initializePayment(params: PaymentWorkflowParams): Promise<PaymentWorkflowResult> {
    try {
      const {
        booking_id,
        client_id,
        amount_cents,
        platform_fee_percentage,
        auto_release_days,
        currency = 'cad',
        description
      } = params

      // 1. Create escrow account first
      const escrowResult = await this.escrowService.createEscrowAccount({
        booking_id,
        total_amount_cents: amount_cents,
        platform_fee_percentage,
        auto_release_days
      })

      if (!escrowResult.success || !escrowResult.escrow_account) {
        return {
          success: false,
          error: 'Failed to create escrow account',
          workflow_status: 'failed'
        }
      }

      // 2. Create Stripe payment intent
      const paymentResult = await this.stripeService.createPaymentIntent({
        amount_cents,
        client_id,
        booking_id,
        currency
      })

      if (!paymentResult.success || !paymentResult.payment_intent) {
        return {
          success: false,
          error: 'Failed to create payment intent',
          workflow_status: 'failed'
        }
      }

      // 3. Link payment intent to escrow account
      await this.db
        .prepare(`
          UPDATE escrow_accounts 
          SET stripe_payment_intent_id = ?, description = ?
          WHERE id = ?
        `)
        .bind(
          paymentResult.payment_intent.id,
          description || `Payment for booking ${booking_id}`,
          escrowResult.escrow_account.id
        )
        .run()

      // 4. Update booking status
      await this.updateBookingPaymentStatus({
        booking_id,
        status: 'payment_pending',
        notes: 'Payment workflow initialized'
      })

      return {
        success: true,
        payment_intent_id: paymentResult.payment_intent.id,
        escrow_account_id: escrowResult.escrow_account.id,
        client_secret: paymentResult.payment_intent.client_secret,
        workflow_status: 'payment_created'
      }
    } catch (error) {
      console.error('Error initializing payment workflow:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment workflow initialization failed',
        workflow_status: 'failed'
      }
    }
  }

  /**
   * Step 2: Confirm payment and fund escrow
   * Called after client completes payment on frontend
   */
  async confirmPayment(payment_intent_id: string, payment_method_id?: string): Promise<PaymentWorkflowResult> {
    try {
      // 1. Confirm payment with Stripe
      let confirmResult
      if (payment_method_id) {
        confirmResult = await this.stripeService.confirmPaymentIntent(payment_intent_id, payment_method_id)
      } else {
        // Check if payment is already confirmed
        confirmResult = await this.stripeService.getPaymentIntentStatus(payment_intent_id)
      }

      if (!confirmResult.success) {
        return {
          success: false,
          error: 'Payment confirmation failed',
          workflow_status: 'failed'
        }
      }

      // 2. Get escrow account by payment intent ID
      const escrowAccount = await this.db
        .prepare('SELECT * FROM escrow_accounts WHERE stripe_payment_intent_id = ?')
        .bind(payment_intent_id)
        .first() as any

      if (!escrowAccount) {
        return {
          success: false,
          error: 'Escrow account not found',
          workflow_status: 'failed'
        }
      }

      // 3. Fund the escrow account
      const fundResult = await this.escrowService.fundEscrowAccount(
        escrowAccount.id,
        payment_intent_id
      )

      if (!fundResult.success) {
        return {
          success: false,
          error: 'Failed to fund escrow account',
          workflow_status: 'failed'
        }
      }

      // 4. Update booking status
      await this.updateBookingPaymentStatus({
        booking_id: escrowAccount.booking_id,
        status: 'payment_confirmed',
        notes: 'Payment confirmed and escrow funded'
      })

      // 5. Create payment record
      await this.createPaymentRecord({
        booking_id: escrowAccount.booking_id,
        escrow_account_id: escrowAccount.id,
        payment_intent_id,
        amount_cents: escrowAccount.total_amount_cents,
        status: 'completed'
      })

      return {
        success: true,
        payment_intent_id,
        escrow_account_id: escrowAccount.id,
        workflow_status: 'escrow_funded'
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment confirmation failed',
        workflow_status: 'failed'
      }
    }
  }

  /**
   * Step 3: Mark work as completed (triggers release conditions check)
   */
  async markWorkCompleted(booking_id: number, completed_by_user_id: number): Promise<PaymentWorkflowResult> {
    try {
      // 1. Get escrow account
      const escrowResult = await this.escrowService.getEscrowsByBooking(booking_id)
      
      if (!escrowResult.success || !escrowResult.escrows || escrowResult.escrows.length === 0) {
        return {
          success: false,
          error: 'No escrow account found for booking'
        }
      }

      const escrowAccount = escrowResult.escrows[0]

      // 2. Update release conditions to met
      const conditionsResult = await this.escrowService.updateReleaseConditions(
        escrowAccount.id,
        true // conditions met
      )

      if (!conditionsResult.success) {
        return {
          success: false,
          error: 'Failed to update release conditions'
        }
      }

      // 3. Update booking status
      await this.updateBookingPaymentStatus({
        booking_id,
        status: 'work_completed',
        updated_by: `user_${completed_by_user_id}`,
        notes: 'Work marked as completed, payment release triggered'
      })

      return {
        success: true,
        escrow_account_id: escrowAccount.id,
        workflow_status: conditionsResult.auto_release_triggered ? 'payment_released' : 'ready_for_work'
      }
    } catch (error) {
      console.error('Error marking work completed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark work completed'
      }
    }
  }

  /**
   * Step 4: Manual payment release (admin or client action)
   */
  async releasePayment(escrow_account_id: number, released_by_user_id: number, reason?: string): Promise<PaymentWorkflowResult> {
    try {
      const releaseResult = await this.escrowService.releaseEscrowFunds({
        escrow_account_id,
        released_by_user_id,
        reason: reason || 'Manual payment release'
      })

      if (!releaseResult.success) {
        return {
          success: false,
          error: 'Failed to release payment'
        }
      }

      // Get booking ID for status update
      const escrow = await this.db
        .prepare('SELECT booking_id FROM escrow_accounts WHERE id = ?')
        .bind(escrow_account_id)
        .first() as any

      if (escrow) {
        await this.updateBookingPaymentStatus({
          booking_id: escrow.booking_id,
          status: 'payment_released',
          updated_by: `user_${released_by_user_id}`,
          notes: reason || 'Payment released to worker'
        })
      }

      return {
        success: true,
        escrow_account_id,
        workflow_status: 'payment_released'
      }
    } catch (error) {
      console.error('Error releasing payment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release payment'
      }
    }
  }

  /**
   * Handle payment disputes
   */
  async disputePayment(escrow_account_id: number, disputed_by_user_id: number, reason: string): Promise<PaymentWorkflowResult> {
    try {
      const disputeResult = await this.escrowService.disputeEscrow({
        escrow_account_id,
        disputed_by_user_id,
        dispute_reason: reason
      })

      if (!disputeResult.success) {
        return {
          success: false,
          error: 'Failed to dispute payment'
        }
      }

      // Get booking ID for status update
      const escrow = await this.db
        .prepare('SELECT booking_id FROM escrow_accounts WHERE id = ?')
        .bind(escrow_account_id)
        .first() as any

      if (escrow) {
        await this.updateBookingPaymentStatus({
          booking_id: escrow.booking_id,
          status: 'disputed',
          updated_by: `user_${disputed_by_user_id}`,
          notes: `Payment disputed: ${reason}`
        })
      }

      return {
        success: true,
        escrow_account_id,
        workflow_status: 'failed'
      }
    } catch (error) {
      console.error('Error disputing payment:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to dispute payment'
      }
    }
  }

  /**
   * Process refund
   */
  async processRefund(escrow_account_id: number, refunded_by_user_id: number, reason?: string): Promise<PaymentWorkflowResult> {
    try {
      const refundResult = await this.escrowService.refundEscrow(
        escrow_account_id,
        refunded_by_user_id,
        reason
      )

      if (!refundResult.success) {
        return {
          success: false,
          error: 'Failed to process refund'
        }
      }

      // Get booking ID for status update
      const escrow = await this.db
        .prepare('SELECT booking_id FROM escrow_accounts WHERE id = ?')
        .bind(escrow_account_id)
        .first() as any

      if (escrow) {
        await this.updateBookingPaymentStatus({
          booking_id: escrow.booking_id,
          status: 'refunded',
          updated_by: `user_${refunded_by_user_id}`,
          notes: reason || 'Payment refunded to client'
        })
      }

      return {
        success: true,
        escrow_account_id,
        workflow_status: 'failed'
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process refund'
      }
    }
  }

  /**
   * Get complete payment workflow status
   */
  async getPaymentWorkflowStatus(booking_id: number): Promise<{
    success: boolean
    workflow?: {
      booking_id: number
      current_status: string
      payment_intent_id?: string
      escrow_account?: any
      payment_records: any[]
      status_history: any[]
    }
    error?: string
  }> {
    try {
      // 1. Get escrow accounts for booking
      const escrowResult = await this.escrowService.getEscrowsByBooking(booking_id)
      
      if (!escrowResult.success) {
        return { success: false, error: 'Failed to get escrow data' }
      }

      // 2. Get payment records
      const paymentRecords = await this.db
        .prepare('SELECT * FROM payment_transactions WHERE booking_id = ? ORDER BY created_at DESC')
        .bind(booking_id)
        .all() as { results: any[] }

      // 3. Get booking payment status history
      const statusHistory = await this.db
        .prepare(`
          SELECT * FROM booking_payment_status_log 
          WHERE booking_id = ? 
          ORDER BY created_at DESC
        `)
        .bind(booking_id)
        .all() as { results: any[] }

      // 4. Get current booking status
      const currentStatus = await this.db
        .prepare('SELECT payment_status FROM bookings WHERE id = ?')
        .bind(booking_id)
        .first() as any

      return {
        success: true,
        workflow: {
          booking_id,
          current_status: currentStatus?.payment_status || 'unknown',
          payment_intent_id: escrowResult.escrows?.[0]?.stripe_payment_intent_id,
          escrow_account: escrowResult.escrows?.[0],
          payment_records: paymentRecords.results || [],
          status_history: statusHistory.results || []
        }
      }
    } catch (error) {
      console.error('Error getting payment workflow status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get workflow status'
      }
    }
  }

  /**
   * Update booking payment status with logging
   */
  private async updateBookingPaymentStatus(params: WorkflowStatusUpdate): Promise<void> {
    const { booking_id, status, updated_by = 'system', notes } = params

    try {
      // 1. Update booking table
      await this.db
        .prepare('UPDATE bookings SET payment_status = ? WHERE id = ?')
        .bind(status, booking_id)
        .run()

      // 2. Log status change
      await this.db
        .prepare(`
          INSERT INTO booking_payment_status_log (
            booking_id, status, updated_by, notes
          ) VALUES (?, ?, ?, ?)
        `)
        .bind(booking_id, status, updated_by, notes)
        .run()
    } catch (error) {
      console.error('Error updating booking payment status:', error)
    }
  }

  /**
   * Create payment record for audit trail
   */
  private async createPaymentRecord(params: {
    booking_id: number
    escrow_account_id: number
    payment_intent_id: string
    amount_cents: number
    status: string
  }): Promise<void> {
    try {
      await this.db
        .prepare(`
          INSERT INTO payment_transactions (
            booking_id, escrow_account_id, stripe_payment_intent_id, 
            amount_cents, transaction_type, status, currency
          ) VALUES (?, ?, ?, ?, 'payment', ?, 'CAD')
        `)
        .bind(
          params.booking_id,
          params.escrow_account_id,
          params.payment_intent_id,
          params.amount_cents,
          params.status
        )
        .run()
    } catch (error) {
      console.error('Error creating payment record:', error)
    }
  }
}