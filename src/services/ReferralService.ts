import { Logger } from '../utils/logger'

export interface ReferralProgram {
  id: number
  name: string
  description?: string
  referrer_reward_type: 'credit' | 'cash' | 'discount'
  referrer_reward_amount: number
  referee_reward_type: 'credit' | 'cash' | 'discount'
  referee_reward_amount: number
  minimum_referee_spend: number
  maximum_referrals_per_user?: number
  program_start_date: string
  program_end_date?: string
  is_active: boolean
}

export interface UserReferral {
  id: number
  referral_code: string
  referrer_id: number
  referee_id?: number
  program_id: number
  referral_status: 'pending' | 'completed' | 'rewarded' | 'cancelled'
  referee_signup_date?: string
  referee_first_purchase_date?: string
  referee_first_purchase_amount: number
  referrer_reward_given: boolean
  referee_reward_given: boolean
}

export interface ReferralReward {
  id: number
  user_id: number
  referral_id: number
  reward_type: 'credit' | 'cash' | 'discount'
  reward_amount: number
  currency: string
  reward_status: 'pending' | 'processed' | 'paid' | 'cancelled'
  transaction_id?: number
}

export interface ReferralStats {
  total_referrals: number
  successful_referrals: number
  pending_referrals: number
  total_rewards_earned: number
  total_rewards_paid: number
  conversion_rate: number
  top_referrers: Array<{
    user_id: number
    username: string
    referral_count: number
    rewards_earned: number
  }>
}

export class ReferralService {
  private db: D1Database
  private logger: Logger

  constructor(db: D1Database) {
    this.db = db
    this.logger = new Logger('ReferralService')
  }

  // ===========================================================================
  // REFERRAL PROGRAM MANAGEMENT
  // ===========================================================================

  async createReferralProgram(programData: Omit<ReferralProgram, 'id'>): Promise<{ success: boolean; program?: ReferralProgram; error?: string }> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO referral_programs (
          name, description, referrer_reward_type, referrer_reward_amount,
          referee_reward_type, referee_reward_amount, minimum_referee_spend,
          maximum_referrals_per_user, program_start_date, program_end_date, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        programData.name,
        programData.description,
        programData.referrer_reward_type,
        programData.referrer_reward_amount,
        programData.referee_reward_type,
        programData.referee_reward_amount,
        programData.minimum_referee_spend,
        programData.maximum_referrals_per_user,
        programData.program_start_date,
        programData.program_end_date,
        programData.is_active
      ).run()

      const program = await this.getReferralProgram(result.meta.last_row_id as number)
      
      this.logger.log('Created referral program', { programId: result.meta.last_row_id })
      return { success: true, program: program! }
    } catch (error) {
      this.logger.error('Error creating referral program', error)
      return { success: false, error: 'Failed to create referral program' }
    }
  }

  async getReferralProgram(programId: number): Promise<ReferralProgram | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM referral_programs WHERE id = ?
      `).bind(programId).first()

      return result as ReferralProgram || null
    } catch (error) {
      this.logger.error('Error getting referral program', error)
      return null
    }
  }

  async getActiveReferralPrograms(): Promise<ReferralProgram[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM referral_programs 
        WHERE is_active = TRUE 
        AND program_start_date <= datetime('now')
        AND (program_end_date IS NULL OR program_end_date > datetime('now'))
        ORDER BY program_start_date DESC
      `).all()

      return result.results as ReferralProgram[]
    } catch (error) {
      this.logger.error('Error getting active referral programs', error)
      return []
    }
  }

  async updateReferralProgram(programId: number, updates: Partial<ReferralProgram>): Promise<{ success: boolean; error?: string }> {
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ')
      const values = Object.values(updates)
      
      await this.db.prepare(`
        UPDATE referral_programs 
        SET ${setClause}, updated_at = datetime('now')
        WHERE id = ?
      `).bind(...values, programId).run()

      this.logger.log('Updated referral program', { programId, updates })
      return { success: true }
    } catch (error) {
      this.logger.error('Error updating referral program', error)
      return { success: false, error: 'Failed to update referral program' }
    }
  }

  // ===========================================================================
  // REFERRAL CODE GENERATION AND MANAGEMENT
  // ===========================================================================

  async generateReferralCode(userId: number, programId?: number): Promise<{ success: boolean; referralCode?: string; error?: string }> {
    try {
      // Get default program if none specified
      if (!programId) {
        const activePrograms = await this.getActiveReferralPrograms()
        if (activePrograms.length === 0) {
          return { success: false, error: 'No active referral program available' }
        }
        programId = activePrograms[0].id
      }

      // Check if user already has a referral code for this program
      const existingReferral = await this.db.prepare(`
        SELECT referral_code FROM user_referrals 
        WHERE referrer_id = ? AND program_id = ?
      `).bind(userId, programId).first()

      if (existingReferral) {
        return { success: true, referralCode: existingReferral.referral_code as string }
      }

      // Generate unique referral code
      const referralCode = await this.generateUniqueReferralCode()

      // Create new referral entry
      await this.db.prepare(`
        INSERT INTO user_referrals (
          referral_code, referrer_id, program_id, referral_status
        ) VALUES (?, ?, ?, 'pending')
      `).bind(referralCode, userId, programId).run()

      this.logger.log('Generated referral code', { userId, programId, referralCode })
      return { success: true, referralCode }
    } catch (error) {
      this.logger.error('Error generating referral code', error)
      return { success: false, error: 'Failed to generate referral code' }
    }
  }

  private async generateUniqueReferralCode(): Promise<string> {
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const code = this.createReferralCode()
      
      const existing = await this.db.prepare(`
        SELECT id FROM user_referrals WHERE referral_code = ?
      `).bind(code).first()

      if (!existing) {
        return code
      }
      attempts++
    }

    throw new Error('Failed to generate unique referral code after maximum attempts')
  }

  private createReferralCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  async getUserReferralCode(userId: number, programId?: number): Promise<string | null> {
    try {
      let query = `
        SELECT referral_code FROM user_referrals 
        WHERE referrer_id = ?
      `
      const binds = [userId]

      if (programId) {
        query += ' AND program_id = ?'
        binds.push(programId)
      }

      query += ' ORDER BY created_at DESC LIMIT 1'

      const result = await this.db.prepare(query).bind(...binds).first()
      return result ? result.referral_code as string : null
    } catch (error) {
      this.logger.error('Error getting user referral code', error)
      return null
    }
  }

  // ===========================================================================
  // REFERRAL PROCESSING AND TRACKING
  // ===========================================================================

  async processReferralSignup(referralCode: string, newUserId: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Find the referral record
      const referral = await this.db.prepare(`
        SELECT * FROM user_referrals WHERE referral_code = ? AND referral_status = 'pending'
      `).bind(referralCode).first() as UserReferral

      if (!referral) {
        return { success: false, error: 'Invalid or expired referral code' }
      }

      // Update referral with referee information
      await this.db.prepare(`
        UPDATE user_referrals 
        SET referee_id = ?, referee_signup_date = datetime('now'), 
            referral_status = 'completed', updated_at = datetime('now')
        WHERE id = ?
      `).bind(newUserId, referral.id).run()

      // Create attribution record
      await this.createReferralAttribution(newUserId, referral.id, 'signup')

      this.logger.log('Processed referral signup', { referralCode, newUserId, referralId: referral.id })
      return { success: true }
    } catch (error) {
      this.logger.error('Error processing referral signup', error)
      return { success: false, error: 'Failed to process referral signup' }
    }
  }

  async processReferralConversion(userId: number, conversionAmount: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Find completed referral where this user is the referee
      const referral = await this.db.prepare(`
        SELECT * FROM user_referrals 
        WHERE referee_id = ? AND referral_status = 'completed'
        AND referrer_reward_given = FALSE
        ORDER BY referee_signup_date DESC LIMIT 1
      `).bind(userId).first() as UserReferral

      if (!referral) {
        return { success: true } // No referral to process, but not an error
      }

      // Get program details
      const program = await this.getReferralProgram(referral.program_id)
      if (!program) {
        return { success: false, error: 'Referral program not found' }
      }

      // Check if conversion meets minimum spend requirement
      if (conversionAmount < program.minimum_referee_spend) {
        return { success: true } // Conversion doesn't meet minimum, but track it
      }

      // Update referral with conversion information
      await this.db.prepare(`
        UPDATE user_referrals 
        SET referee_first_purchase_date = datetime('now'),
            referee_first_purchase_amount = ?,
            referral_status = 'rewarded',
            updated_at = datetime('now')
        WHERE id = ?
      `).bind(conversionAmount, referral.id).run()

      // Process rewards for both referrer and referee
      await this.processReferrerReward(referral, program)
      await this.processRefereeReward(referral, program)

      // Create conversion attribution
      await this.createReferralAttribution(userId, referral.id, 'conversion', conversionAmount)

      this.logger.log('Processed referral conversion', { userId, conversionAmount, referralId: referral.id })
      return { success: true }
    } catch (error) {
      this.logger.error('Error processing referral conversion', error)
      return { success: false, error: 'Failed to process referral conversion' }
    }
  }

  private async processReferrerReward(referral: UserReferral, program: ReferralProgram): Promise<void> {
    const rewardAmount = program.referrer_reward_amount

    await this.db.prepare(`
      INSERT INTO referral_rewards (
        user_id, referral_id, reward_type, reward_amount, reward_status
      ) VALUES (?, ?, ?, ?, 'pending')
    `).bind(
      referral.referrer_id,
      referral.id,
      program.referrer_reward_type,
      rewardAmount
    ).run()

    await this.db.prepare(`
      UPDATE user_referrals 
      SET referrer_reward_given = TRUE, referrer_reward_date = datetime('now')
      WHERE id = ?
    `).bind(referral.id).run()
  }

  private async processRefereeReward(referral: UserReferral, program: ReferralProgram): Promise<void> {
    if (!referral.referee_id) return

    const rewardAmount = program.referee_reward_amount

    await this.db.prepare(`
      INSERT INTO referral_rewards (
        user_id, referral_id, reward_type, reward_amount, reward_status
      ) VALUES (?, ?, ?, ?, 'pending')
    `).bind(
      referral.referee_id,
      referral.id,
      program.referee_reward_type,
      rewardAmount
    ).run()

    await this.db.prepare(`
      UPDATE user_referrals 
      SET referee_reward_given = TRUE, referee_reward_date = datetime('now')
      WHERE id = ?
    `).bind(referral.id).run()
  }

  private async createReferralAttribution(userId: number, referralId: number, event: string, value?: number): Promise<void> {
    await this.db.prepare(`
      INSERT INTO marketing_attributions (
        user_id, attribution_type, source_campaign_id, conversion_event,
        conversion_date, conversion_value, source_details
      ) VALUES (?, 'referral', ?, ?, datetime('now'), ?, ?)
    `).bind(
      userId,
      referralId,
      event,
      value || 0,
      JSON.stringify({ referral_id: referralId, event_type: event })
    ).run()
  }

  // ===========================================================================
  // REFERRAL ANALYTICS AND REPORTING
  // ===========================================================================

  async getUserReferralStats(userId: number): Promise<{
    total_referrals: number
    successful_referrals: number
    pending_referrals: number
    total_rewards_earned: number
    conversion_rate: number
    recent_referrals: UserReferral[]
  }> {
    try {
      // Get referral counts
      const stats = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_referrals,
          SUM(CASE WHEN referral_status IN ('completed', 'rewarded') THEN 1 ELSE 0 END) as successful_referrals,
          SUM(CASE WHEN referral_status = 'pending' THEN 1 ELSE 0 END) as pending_referrals
        FROM user_referrals 
        WHERE referrer_id = ?
      `).bind(userId).first() as any

      // Get total rewards earned
      const rewards = await this.db.prepare(`
        SELECT COALESCE(SUM(reward_amount), 0) as total_rewards
        FROM referral_rewards 
        WHERE user_id = ? AND reward_status != 'cancelled'
      `).bind(userId).first() as any

      // Get recent referrals
      const recentReferrals = await this.db.prepare(`
        SELECT * FROM user_referrals 
        WHERE referrer_id = ? 
        ORDER BY created_at DESC 
        LIMIT 10
      `).bind(userId).all()

      const conversionRate = stats.total_referrals > 0 
        ? (stats.successful_referrals / stats.total_referrals) * 100 
        : 0

      return {
        total_referrals: stats.total_referrals || 0,
        successful_referrals: stats.successful_referrals || 0,
        pending_referrals: stats.pending_referrals || 0,
        total_rewards_earned: rewards.total_rewards || 0,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        recent_referrals: recentReferrals.results as UserReferral[]
      }
    } catch (error) {
      this.logger.error('Error getting user referral stats', error)
      return {
        total_referrals: 0,
        successful_referrals: 0,
        pending_referrals: 0,
        total_rewards_earned: 0,
        conversion_rate: 0,
        recent_referrals: []
      }
    }
  }

  async getReferralProgramStats(programId: number, dateRange?: { start: string; end: string }): Promise<ReferralStats> {
    try {
      let dateCondition = ''
      const binds = [programId]

      if (dateRange) {
        dateCondition = ' AND created_at BETWEEN ? AND ?'
        binds.push(dateRange.start, dateRange.end)
      }

      // Get basic stats
      const stats = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_referrals,
          SUM(CASE WHEN referral_status IN ('completed', 'rewarded') THEN 1 ELSE 0 END) as successful_referrals,
          SUM(CASE WHEN referral_status = 'pending' THEN 1 ELSE 0 END) as pending_referrals
        FROM user_referrals 
        WHERE program_id = ?${dateCondition}
      `).bind(...binds).first() as any

      // Get reward totals
      const rewardStats = await this.db.prepare(`
        SELECT 
          COALESCE(SUM(CASE WHEN reward_status != 'cancelled' THEN reward_amount ELSE 0 END), 0) as total_rewards_earned,
          COALESCE(SUM(CASE WHEN reward_status = 'paid' THEN reward_amount ELSE 0 END), 0) as total_rewards_paid
        FROM referral_rewards rr
        JOIN user_referrals ur ON rr.referral_id = ur.id
        WHERE ur.program_id = ?${dateCondition}
      `).bind(...binds).first() as any

      // Get top referrers
      const topReferrers = await this.db.prepare(`
        SELECT 
          ur.referrer_id as user_id,
          u.email as username,
          COUNT(*) as referral_count,
          COALESCE(SUM(rr.reward_amount), 0) as rewards_earned
        FROM user_referrals ur
        LEFT JOIN users u ON ur.referrer_id = u.id
        LEFT JOIN referral_rewards rr ON rr.referral_id = ur.id AND rr.reward_status != 'cancelled'
        WHERE ur.program_id = ?${dateCondition}
        GROUP BY ur.referrer_id, u.email
        ORDER BY referral_count DESC
        LIMIT 10
      `).bind(...binds).all()

      const conversionRate = stats.total_referrals > 0 
        ? (stats.successful_referrals / stats.total_referrals) * 100 
        : 0

      return {
        total_referrals: stats.total_referrals || 0,
        successful_referrals: stats.successful_referrals || 0,
        pending_referrals: stats.pending_referrals || 0,
        total_rewards_earned: rewardStats.total_rewards_earned || 0,
        total_rewards_paid: rewardStats.total_rewards_paid || 0,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        top_referrers: topReferrers.results as any[]
      }
    } catch (error) {
      this.logger.error('Error getting referral program stats', error)
      return {
        total_referrals: 0,
        successful_referrals: 0,
        pending_referrals: 0,
        total_rewards_earned: 0,
        total_rewards_paid: 0,
        conversion_rate: 0,
        top_referrers: []
      }
    }
  }

  // ===========================================================================
  // REWARD MANAGEMENT
  // ===========================================================================

  async getUserRewards(userId: number, status?: string): Promise<ReferralReward[]> {
    try {
      let query = 'SELECT * FROM referral_rewards WHERE user_id = ?'
      const binds = [userId]

      if (status) {
        query += ' AND reward_status = ?'
        binds.push(status)
      }

      query += ' ORDER BY created_at DESC'

      const result = await this.db.prepare(query).bind(...binds).all()
      return result.results as ReferralReward[]
    } catch (error) {
      this.logger.error('Error getting user rewards', error)
      return []
    }
  }

  async processRewardPayment(rewardId: number, transactionId?: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.db.prepare(`
        UPDATE referral_rewards 
        SET reward_status = 'paid', transaction_id = ?, processed_date = datetime('now')
        WHERE id = ?
      `).bind(transactionId, rewardId).run()

      this.logger.log('Processed reward payment', { rewardId, transactionId })
      return { success: true }
    } catch (error) {
      this.logger.error('Error processing reward payment', error)
      return { success: false, error: 'Failed to process reward payment' }
    }
  }

  async getPendingRewards(): Promise<ReferralReward[]> {
    try {
      const result = await this.db.prepare(`
        SELECT rr.*, u.email, u.first_name, u.last_name
        FROM referral_rewards rr
        JOIN users u ON rr.user_id = u.id
        WHERE rr.reward_status = 'pending'
        ORDER BY rr.created_at ASC
      `).all()

      return result.results as any[]
    } catch (error) {
      this.logger.error('Error getting pending rewards', error)
      return []
    }
  }

  // ===========================================================================
  // REFERRAL CODE VALIDATION
  // ===========================================================================

  async validateReferralCode(code: string): Promise<{ valid: boolean; program?: ReferralProgram; error?: string }> {
    try {
      const referral = await this.db.prepare(`
        SELECT ur.*, rp.* 
        FROM user_referrals ur
        JOIN referral_programs rp ON ur.program_id = rp.id
        WHERE ur.referral_code = ? AND ur.referral_status = 'pending'
      `).bind(code).first() as any

      if (!referral) {
        return { valid: false, error: 'Invalid or expired referral code' }
      }

      const program = {
        id: referral.program_id,
        name: referral.name,
        description: referral.description,
        referrer_reward_type: referral.referrer_reward_type,
        referrer_reward_amount: referral.referrer_reward_amount,
        referee_reward_type: referral.referee_reward_type,
        referee_reward_amount: referral.referee_reward_amount,
        minimum_referee_spend: referral.minimum_referee_spend,
        maximum_referrals_per_user: referral.maximum_referrals_per_user,
        program_start_date: referral.program_start_date,
        program_end_date: referral.program_end_date,
        is_active: referral.is_active
      } as ReferralProgram

      // Check if program is still active and within date range
      if (!program.is_active) {
        return { valid: false, error: 'Referral program is no longer active' }
      }

      const now = new Date().toISOString()
      if (program.program_start_date > now) {
        return { valid: false, error: 'Referral program has not started yet' }
      }

      if (program.program_end_date && program.program_end_date < now) {
        return { valid: false, error: 'Referral program has expired' }
      }

      return { valid: true, program }
    } catch (error) {
      this.logger.error('Error validating referral code', error)
      return { valid: false, error: 'Failed to validate referral code' }
    }
  }
}