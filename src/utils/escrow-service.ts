import { D1Database } from '@cloudflare/workers-types'
import { StripePaymentService } from './stripe-payment-service'

export interface EscrowAccount {
  id: number
  booking_id: number
  total_amount_cents: number
  platform_fee_cents: number
  worker_amount_cents: number
  status: 'pending' | 'held' | 'released' | 'disputed' | 'refunded'
  created_at: string
  release_date?: string
  conditions_met: boolean
  auto_release_date: string
}

export interface EscrowEvent {
  id: number
  escrow_account_id: number
  event_type: 'created' | 'funded' | 'hold_extended' | 'conditions_met' | 'released' | 'disputed' | 'refunded'
  description: string
  created_by_user_id?: number
  metadata?: any
  created_at: string
}

export interface CreateEscrowParams {
  booking_id: number
  total_amount_cents: number
  platform_fee_percentage: number
  auto_release_days: number
  release_conditions?: string[]
}

export interface EscrowReleaseParams {
  escrow_account_id: number
  released_by_user_id: number
  reason?: string
  force_release?: boolean
}

export interface EscrowDisputeParams {
  escrow_account_id: number
  disputed_by_user_id: number
  dispute_reason: string
  evidence?: string
}

export class EscrowService {
  private db: D1Database
  private stripeService: StripePaymentService

  constructor(db: D1Database, stripeService: StripePaymentService) {
    this.db = db
    this.stripeService = stripeService
  }

  /**
   * Create a new escrow account for a booking
   */
  async createEscrowAccount(params: CreateEscrowParams): Promise<{
    success: boolean
    escrow_account?: EscrowAccount
    error?: string
  }> {
    try {
      const {
        booking_id,
        total_amount_cents,
        platform_fee_percentage,
        auto_release_days,
        release_conditions = []
      } = params

      // Calculate platform fee and worker amount
      const platform_fee_cents = Math.round((total_amount_cents * platform_fee_percentage) / 100)
      const worker_amount_cents = total_amount_cents - platform_fee_cents

      // Calculate auto-release date
      const auto_release_date = new Date()
      auto_release_date.setDate(auto_release_date.getDate() + auto_release_days)

      // Create escrow account
      const escrowResult = await this.db
        .prepare(`
          INSERT INTO escrow_accounts (
            booking_id, total_amount_cents, platform_fee_cents, worker_amount_cents,
            status, conditions_met, auto_release_date, release_conditions
          ) VALUES (?, ?, ?, ?, 'pending', false, ?, ?)
          RETURNING *
        `)
        .bind(
          booking_id,
          total_amount_cents,
          platform_fee_cents,
          worker_amount_cents,
          auto_release_date.toISOString(),
          JSON.stringify(release_conditions)
        )
        .first() as EscrowAccount

      // Log escrow creation event
      await this.logEscrowEvent({
        escrow_account_id: escrowResult.id,
        event_type: 'created',
        description: `Escrow account created for booking ${booking_id}`,
        metadata: {
          total_amount_cents,
          platform_fee_cents,
          worker_amount_cents,
          auto_release_days,
          release_conditions
        }
      })

      return {
        success: true,
        escrow_account: escrowResult
      }
    } catch (error) {
      console.error('Error creating escrow account:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create escrow account'
      }
    }
  }

  /**
   * Fund escrow account after successful payment
   */
  async fundEscrowAccount(escrow_account_id: number, payment_intent_id: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // Update escrow status to 'held'
      await this.db
        .prepare(`
          UPDATE escrow_accounts 
          SET status = 'held', stripe_payment_intent_id = ? 
          WHERE id = ?
        `)
        .bind(payment_intent_id, escrow_account_id)
        .run()

      // Log funding event
      await this.logEscrowEvent({
        escrow_account_id,
        event_type: 'funded',
        description: 'Escrow account funded via Stripe payment',
        metadata: { payment_intent_id }
      })

      return { success: true }
    } catch (error) {
      console.error('Error funding escrow account:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fund escrow account'
      }
    }
  }

  /**
   * Check and update release conditions
   */
  async updateReleaseConditions(escrow_account_id: number, conditions_met: boolean): Promise<{
    success: boolean
    auto_release_triggered?: boolean
    error?: string
  }> {
    try {
      const escrow = await this.db
        .prepare('SELECT * FROM escrow_accounts WHERE id = ?')
        .bind(escrow_account_id)
        .first() as EscrowAccount

      if (!escrow) {
        return { success: false, error: 'Escrow account not found' }
      }

      if (escrow.status !== 'held') {
        return { success: false, error: 'Escrow account is not in held status' }
      }

      // Update conditions
      await this.db
        .prepare(`
          UPDATE escrow_accounts 
          SET conditions_met = ? 
          WHERE id = ?
        `)
        .bind(conditions_met, escrow_account_id)
        .run()

      let auto_release_triggered = false

      // If conditions are met, trigger automatic release
      if (conditions_met) {
        const releaseResult = await this.releaseEscrowFunds({
          escrow_account_id,
          released_by_user_id: 0, // System release
          reason: 'Automatic release - conditions met'
        })

        auto_release_triggered = releaseResult.success
      }

      // Log event
      await this.logEscrowEvent({
        escrow_account_id,
        event_type: 'conditions_met',
        description: conditions_met 
          ? 'Release conditions have been met'
          : 'Release conditions updated',
        metadata: { conditions_met, auto_release_triggered }
      })

      return {
        success: true,
        auto_release_triggered
      }
    } catch (error) {
      console.error('Error updating release conditions:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update release conditions'
      }
    }
  }

  /**
   * Release escrow funds to worker
   */
  async releaseEscrowFunds(params: EscrowReleaseParams): Promise<{
    success: boolean
    payout_created?: boolean
    error?: string
  }> {
    try {
      const { escrow_account_id, released_by_user_id, reason, force_release = false } = params

      const escrow = await this.db
        .prepare('SELECT * FROM escrow_accounts WHERE id = ?')
        .bind(escrow_account_id)
        .first() as EscrowAccount

      if (!escrow) {
        return { success: false, error: 'Escrow account not found' }
      }

      if (escrow.status !== 'held') {
        return { success: false, error: 'Escrow account is not in held status' }
      }

      // Check if conditions are met (unless force release)
      if (!force_release && !escrow.conditions_met) {
        return { success: false, error: 'Release conditions have not been met' }
      }

      // Update escrow status
      await this.db
        .prepare(`
          UPDATE escrow_accounts 
          SET status = 'released', release_date = CURRENT_TIMESTAMP, released_by_user_id = ?
          WHERE id = ?
        `)
        .bind(released_by_user_id, escrow_account_id)
        .run()

      // Create payout record for worker
      const booking = await this.db
        .prepare('SELECT worker_id FROM bookings WHERE id = ?')
        .bind(escrow.booking_id)
        .first() as { worker_id: number }

      let payout_created = false
      if (booking?.worker_id) {
        const payoutResult = await this.createWorkerPayout({
          worker_id: booking.worker_id,
          escrow_account_id,
          amount_cents: escrow.worker_amount_cents,
          description: `Payment release for booking ${escrow.booking_id}`
        })
        payout_created = payoutResult.success
      }

      // Log release event
      await this.logEscrowEvent({
        escrow_account_id,
        event_type: 'released',
        description: reason || 'Escrow funds released to worker',
        created_by_user_id: released_by_user_id > 0 ? released_by_user_id : undefined,
        metadata: {
          released_amount_cents: escrow.worker_amount_cents,
          platform_fee_cents: escrow.platform_fee_cents,
          force_release,
          payout_created
        }
      })

      return {
        success: true,
        payout_created
      }
    } catch (error) {
      console.error('Error releasing escrow funds:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release escrow funds'
      }
    }
  }

  /**
   * Handle escrow dispute
   */
  async disputeEscrow(params: EscrowDisputeParams): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { escrow_account_id, disputed_by_user_id, dispute_reason, evidence } = params

      const escrow = await this.db
        .prepare('SELECT * FROM escrow_accounts WHERE id = ?')
        .bind(escrow_account_id)
        .first() as EscrowAccount

      if (!escrow) {
        return { success: false, error: 'Escrow account not found' }
      }

      if (!['held', 'released'].includes(escrow.status)) {
        return { success: false, error: 'Escrow account cannot be disputed in current status' }
      }

      // Update escrow status to disputed
      await this.db
        .prepare(`
          UPDATE escrow_accounts 
          SET status = 'disputed' 
          WHERE id = ?
        `)
        .bind(escrow_account_id)
        .run()

      // Log dispute event
      await this.logEscrowEvent({
        escrow_account_id,
        event_type: 'disputed',
        description: dispute_reason,
        created_by_user_id: disputed_by_user_id,
        metadata: {
          evidence,
          original_status: escrow.status
        }
      })

      return { success: true }
    } catch (error) {
      console.error('Error disputing escrow:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to dispute escrow'
      }
    }
  }

  /**
   * Process escrow refund
   */
  async refundEscrow(escrow_account_id: number, refunded_by_user_id: number, reason?: string): Promise<{
    success: boolean
    refund_id?: string
    error?: string
  }> {
    try {
      const escrow = await this.db
        .prepare('SELECT * FROM escrow_accounts WHERE id = ?')
        .bind(escrow_account_id)
        .first() as EscrowAccount

      if (!escrow) {
        return { success: false, error: 'Escrow account not found' }
      }

      if (!['held', 'disputed'].includes(escrow.status)) {
        return { success: false, error: 'Escrow account cannot be refunded in current status' }
      }

      // Process Stripe refund if payment intent exists
      let refund_id: string | undefined
      if (escrow.stripe_payment_intent_id) {
        const refundResult = await this.stripeService.createRefund({
          payment_intent_id: escrow.stripe_payment_intent_id
        })

        if (!refundResult.success) {
          return { success: false, error: 'Failed to process Stripe refund' }
        }

        refund_id = refundResult.refund_id
      }

      // Update escrow status
      await this.db
        .prepare(`
          UPDATE escrow_accounts 
          SET status = 'refunded', refunded_by_user_id = ?
          WHERE id = ?
        `)
        .bind(refunded_by_user_id, escrow_account_id)
        .run()

      // Log refund event
      await this.logEscrowEvent({
        escrow_account_id,
        event_type: 'refunded',
        description: reason || 'Escrow refunded to client',
        created_by_user_id: refunded_by_user_id,
        metadata: {
          refund_amount_cents: escrow.total_amount_cents,
          stripe_refund_id: refund_id
        }
      })

      return {
        success: true,
        refund_id
      }
    } catch (error) {
      console.error('Error processing escrow refund:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process escrow refund'
      }
    }
  }

  /**
   * Process automatic releases for eligible escrow accounts
   */
  async processAutoReleases(): Promise<{
    success: boolean
    processed_count: number
    error?: string
  }> {
    try {
      // Find escrow accounts eligible for auto-release
      const eligibleEscrows = await this.db
        .prepare(`
          SELECT * FROM escrow_accounts 
          WHERE status = 'held' 
          AND conditions_met = true 
          AND auto_release_date <= CURRENT_TIMESTAMP
        `)
        .all() as { results: EscrowAccount[] }

      let processed_count = 0

      for (const escrow of eligibleEscrows.results) {
        const releaseResult = await this.releaseEscrowFunds({
          escrow_account_id: escrow.id,
          released_by_user_id: 0, // System release
          reason: 'Automatic release - auto-release date reached'
        })

        if (releaseResult.success) {
          processed_count++
        }
      }

      return {
        success: true,
        processed_count
      }
    } catch (error) {
      console.error('Error processing auto releases:', error)
      return {
        success: false,
        processed_count: 0,
        error: error instanceof Error ? error.message : 'Failed to process auto releases'
      }
    }
  }

  /**
   * Get escrow account details
   */
  async getEscrowAccount(escrow_account_id: number): Promise<{
    success: boolean
    escrow?: EscrowAccount & { events: EscrowEvent[] }
    error?: string
  }> {
    try {
      const escrow = await this.db
        .prepare('SELECT * FROM escrow_accounts WHERE id = ?')
        .bind(escrow_account_id)
        .first() as EscrowAccount

      if (!escrow) {
        return { success: false, error: 'Escrow account not found' }
      }

      // Get escrow events
      const events = await this.db
        .prepare(`
          SELECT * FROM escrow_events 
          WHERE escrow_account_id = ? 
          ORDER BY created_at DESC
        `)
        .bind(escrow_account_id)
        .all() as { results: EscrowEvent[] }

      return {
        success: true,
        escrow: {
          ...escrow,
          events: events.results
        }
      }
    } catch (error) {
      console.error('Error getting escrow account:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get escrow account'
      }
    }
  }

  /**
   * Get escrow accounts by booking
   */
  async getEscrowsByBooking(booking_id: number): Promise<{
    success: boolean
    escrows?: EscrowAccount[]
    error?: string
  }> {
    try {
      const escrows = await this.db
        .prepare('SELECT * FROM escrow_accounts WHERE booking_id = ? ORDER BY created_at DESC')
        .bind(booking_id)
        .all() as { results: EscrowAccount[] }

      return {
        success: true,
        escrows: escrows.results
      }
    } catch (error) {
      console.error('Error getting escrows by booking:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get escrows by booking'
      }
    }
  }

  /**
   * Create worker payout record
   */
  private async createWorkerPayout(params: {
    worker_id: number
    escrow_account_id: number
    amount_cents: number
    description: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { worker_id, escrow_account_id, amount_cents, description } = params

      await this.db
        .prepare(`
          INSERT INTO payouts (
            worker_id, escrow_account_id, amount_cents, status, description
          ) VALUES (?, ?, ?, 'pending', ?)
        `)
        .bind(worker_id, escrow_account_id, amount_cents, description)
        .run()

      return { success: true }
    } catch (error) {
      console.error('Error creating worker payout:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create worker payout'
      }
    }
  }

  /**
   * Log escrow event
   */
  private async logEscrowEvent(params: {
    escrow_account_id: number
    event_type: EscrowEvent['event_type']
    description: string
    created_by_user_id?: number
    metadata?: any
  }): Promise<void> {
    try {
      const { escrow_account_id, event_type, description, created_by_user_id, metadata } = params

      await this.db
        .prepare(`
          INSERT INTO escrow_events (
            escrow_account_id, event_type, description, created_by_user_id, metadata
          ) VALUES (?, ?, ?, ?, ?)
        `)
        .bind(
          escrow_account_id,
          event_type,
          description,
          created_by_user_id || null,
          metadata ? JSON.stringify(metadata) : null
        )
        .run()
    } catch (error) {
      console.error('Error logging escrow event:', error)
    }
  }
}