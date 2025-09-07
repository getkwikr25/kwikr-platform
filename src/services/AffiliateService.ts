import { Logger } from '../utils/logger'

export interface AffiliateProgram {
  id: number
  program_name: string
  description?: string
  commission_type: 'percentage' | 'fixed_amount' | 'tiered'
  commission_rate: number
  commission_tiers?: string // JSON for tiered commission structure
  cookie_duration_days: number
  minimum_payout_amount: number
  payment_schedule: 'weekly' | 'monthly' | 'quarterly'
  program_terms?: string
  approval_required: boolean
  is_active: boolean
}

export interface Affiliate {
  id: number
  user_id?: number
  affiliate_code: string
  company_name?: string
  contact_person: string
  contact_email: string
  contact_phone?: string
  website_url?: string
  social_media_urls?: string // JSON of social profiles
  promotional_methods?: string
  target_audience?: string
  application_status: 'pending' | 'approved' | 'rejected' | 'suspended'
  approval_date?: string
  program_id: number
  payment_details?: string // JSON with payment info
  tax_information?: string // JSON with tax details
  performance_tier: 'standard' | 'silver' | 'gold' | 'platinum'
  total_referrals: number
  total_commissions_earned: number
  total_commissions_paid: number
  last_activity_date?: string
}

export interface AffiliateReferral {
  id: number
  affiliate_id: number
  referred_user_id?: number
  referral_code: string
  source_url?: string
  landing_page_url?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  ip_address?: string
  user_agent?: string
  referral_status: 'click' | 'signup' | 'conversion' | 'paid'
  click_date: string
  signup_date?: string
  conversion_date?: string
  conversion_amount: number
  commission_amount: number
  commission_paid_date?: string
}

export interface AffiliatePayment {
  id: number
  affiliate_id: number
  payment_period_start: string
  payment_period_end: string
  total_referrals: number
  total_commission_amount: number
  payment_amount: number
  payment_method: 'bank_transfer' | 'paypal' | 'check' | 'stripe'
  payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled'
  payment_reference?: string
  payment_date?: string
  payment_notes?: string
}

export interface AffiliateStats {
  total_affiliates: number
  active_affiliates: number
  pending_applications: number
  total_referrals: number
  total_conversions: number
  total_commissions_earned: number
  total_commissions_paid: number
  average_conversion_rate: number
  top_performers: Array<{
    affiliate_id: number
    company_name: string
    referral_count: number
    conversion_rate: number
    commissions_earned: number
  }>
}

export class AffiliateService {
  private db: D1Database
  private logger: Logger

  constructor(db: D1Database) {
    this.db = db
    this.logger = new Logger('AffiliateService')
  }

  // ===========================================================================
  // AFFILIATE PROGRAM MANAGEMENT
  // ===========================================================================

  async createAffiliateProgram(programData: Omit<AffiliateProgram, 'id'>): Promise<{ success: boolean; program?: AffiliateProgram; error?: string }> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO affiliate_programs (
          program_name, description, commission_type, commission_rate,
          commission_tiers, cookie_duration_days, minimum_payout_amount,
          payment_schedule, program_terms, approval_required, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        programData.program_name,
        programData.description,
        programData.commission_type,
        programData.commission_rate,
        programData.commission_tiers,
        programData.cookie_duration_days,
        programData.minimum_payout_amount,
        programData.payment_schedule,
        programData.program_terms,
        programData.approval_required,
        programData.is_active
      ).run()

      const program = await this.getAffiliateProgram(result.meta.last_row_id as number)
      
      this.logger.log('Created affiliate program', { programId: result.meta.last_row_id })
      return { success: true, program: program! }
    } catch (error) {
      this.logger.error('Error creating affiliate program', error)
      return { success: false, error: 'Failed to create affiliate program' }
    }
  }

  async getAffiliateProgram(programId: number): Promise<AffiliateProgram | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM affiliate_programs WHERE id = ?
      `).bind(programId).first()

      return result as AffiliateProgram || null
    } catch (error) {
      this.logger.error('Error getting affiliate program', error)
      return null
    }
  }

  async getActiveAffiliatePrograms(): Promise<AffiliateProgram[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM affiliate_programs 
        WHERE is_active = TRUE 
        ORDER BY created_at DESC
      `).all()

      return result.results as AffiliateProgram[]
    } catch (error) {
      this.logger.error('Error getting active affiliate programs', error)
      return []
    }
  }

  async updateAffiliateProgram(programId: number, updates: Partial<AffiliateProgram>): Promise<{ success: boolean; error?: string }> {
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ')
      const values = Object.values(updates)
      
      await this.db.prepare(`
        UPDATE affiliate_programs 
        SET ${setClause}, updated_at = datetime('now')
        WHERE id = ?
      `).bind(...values, programId).run()

      this.logger.log('Updated affiliate program', { programId, updates })
      return { success: true }
    } catch (error) {
      this.logger.error('Error updating affiliate program', error)
      return { success: false, error: 'Failed to update affiliate program' }
    }
  }

  // ===========================================================================
  // AFFILIATE REGISTRATION AND MANAGEMENT
  // ===========================================================================

  async applyForAffiliateProgram(applicationData: Omit<Affiliate, 'id' | 'application_status' | 'total_referrals' | 'total_commissions_earned' | 'total_commissions_paid' | 'performance_tier'>): Promise<{ success: boolean; affiliate?: Affiliate; error?: string }> {
    try {
      // Check if email already exists
      const existing = await this.db.prepare(`
        SELECT id FROM affiliates WHERE contact_email = ?
      `).bind(applicationData.contact_email).first()

      if (existing) {
        return { success: false, error: 'An application with this email already exists' }
      }

      // Generate unique affiliate code
      const affiliateCode = await this.generateUniqueAffiliateCode()

      const result = await this.db.prepare(`
        INSERT INTO affiliates (
          user_id, affiliate_code, company_name, contact_person, contact_email,
          contact_phone, website_url, social_media_urls, promotional_methods,
          target_audience, program_id, payment_details, tax_information,
          application_status, performance_tier, total_referrals,
          total_commissions_earned, total_commissions_paid
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'standard', 0, 0.00, 0.00)
      `).bind(
        applicationData.user_id,
        affiliateCode,
        applicationData.company_name,
        applicationData.contact_person,
        applicationData.contact_email,
        applicationData.contact_phone,
        applicationData.website_url,
        applicationData.social_media_urls,
        applicationData.promotional_methods,
        applicationData.target_audience,
        applicationData.program_id,
        applicationData.payment_details,
        applicationData.tax_information
      ).run()

      const affiliate = await this.getAffiliate(result.meta.last_row_id as number)
      
      this.logger.log('Created affiliate application', { affiliateId: result.meta.last_row_id })
      return { success: true, affiliate: affiliate! }
    } catch (error) {
      this.logger.error('Error applying for affiliate program', error)
      return { success: false, error: 'Failed to submit affiliate application' }
    }
  }

  private async generateUniqueAffiliateCode(): Promise<string> {
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const code = this.createAffiliateCode()
      
      const existing = await this.db.prepare(`
        SELECT id FROM affiliates WHERE affiliate_code = ?
      `).bind(code).first()

      if (!existing) {
        return code
      }
      attempts++
    }

    throw new Error('Failed to generate unique affiliate code after maximum attempts')
  }

  private createAffiliateCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = 'AFF-'
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  async getAffiliate(affiliateId: number): Promise<Affiliate | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM affiliates WHERE id = ?
      `).bind(affiliateId).first()

      return result as Affiliate || null
    } catch (error) {
      this.logger.error('Error getting affiliate', error)
      return null
    }
  }

  async getAffiliateByCode(affiliateCode: string): Promise<Affiliate | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM affiliates WHERE affiliate_code = ?
      `).bind(affiliateCode).first()

      return result as Affiliate || null
    } catch (error) {
      this.logger.error('Error getting affiliate by code', error)
      return null
    }
  }

  async getAffiliateByEmail(email: string): Promise<Affiliate | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM affiliates WHERE contact_email = ?
      `).bind(email).first()

      return result as Affiliate || null
    } catch (error) {
      this.logger.error('Error getting affiliate by email', error)
      return null
    }
  }

  async getAffiliates(filters?: {
    status?: string
    program_id?: number
    performance_tier?: string
    limit?: number
    offset?: number
  }): Promise<{ affiliates: Affiliate[]; total: number }> {
    try {
      let whereClause = 'WHERE 1=1'
      const binds: any[] = []

      if (filters?.status) {
        whereClause += ' AND application_status = ?'
        binds.push(filters.status)
      }

      if (filters?.program_id) {
        whereClause += ' AND program_id = ?'
        binds.push(filters.program_id)
      }

      if (filters?.performance_tier) {
        whereClause += ' AND performance_tier = ?'
        binds.push(filters.performance_tier)
      }

      // Get total count
      const countResult = await this.db.prepare(`
        SELECT COUNT(*) as total FROM affiliates ${whereClause}
      `).bind(...binds).first() as any

      // Get affiliates with pagination
      let query = `SELECT * FROM affiliates ${whereClause} ORDER BY created_at DESC`
      
      if (filters?.limit) {
        query += ' LIMIT ?'
        binds.push(filters.limit)
        
        if (filters?.offset) {
          query += ' OFFSET ?'
          binds.push(filters.offset)
        }
      }

      const result = await this.db.prepare(query).bind(...binds).all()

      return {
        affiliates: result.results as Affiliate[],
        total: countResult.total || 0
      }
    } catch (error) {
      this.logger.error('Error getting affiliates', error)
      return { affiliates: [], total: 0 }
    }
  }

  async approveAffiliate(affiliateId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.db.prepare(`
        UPDATE affiliates 
        SET application_status = 'approved', approval_date = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `).bind(affiliateId).run()

      this.logger.log('Approved affiliate', { affiliateId })
      return { success: true }
    } catch (error) {
      this.logger.error('Error approving affiliate', error)
      return { success: false, error: 'Failed to approve affiliate' }
    }
  }

  async rejectAffiliate(affiliateId: number, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.db.prepare(`
        UPDATE affiliates 
        SET application_status = 'rejected', updated_at = datetime('now')
        WHERE id = ?
      `).bind(affiliateId).run()

      this.logger.log('Rejected affiliate', { affiliateId, reason })
      return { success: true }
    } catch (error) {
      this.logger.error('Error rejecting affiliate', error)
      return { success: false, error: 'Failed to reject affiliate' }
    }
  }

  async suspendAffiliate(affiliateId: number, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.db.prepare(`
        UPDATE affiliates 
        SET application_status = 'suspended', updated_at = datetime('now')
        WHERE id = ?
      `).bind(affiliateId).run()

      this.logger.log('Suspended affiliate', { affiliateId, reason })
      return { success: true }
    } catch (error) {
      this.logger.error('Error suspending affiliate', error)
      return { success: false, error: 'Failed to suspend affiliate' }
    }
  }

  async updateAffiliate(affiliateId: number, updates: Partial<Affiliate>): Promise<{ success: boolean; error?: string }> {
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ')
      const values = Object.values(updates)
      
      await this.db.prepare(`
        UPDATE affiliates 
        SET ${setClause}, updated_at = datetime('now')
        WHERE id = ?
      `).bind(...values, affiliateId).run()

      this.logger.log('Updated affiliate', { affiliateId, updates })
      return { success: true }
    } catch (error) {
      this.logger.error('Error updating affiliate', error)
      return { success: false, error: 'Failed to update affiliate' }
    }
  }

  // ===========================================================================
  // REFERRAL TRACKING AND PROCESSING
  // ===========================================================================

  async trackAffiliateClick(
    affiliateCode: string,
    trackingData: {
      source_url?: string
      landing_page_url?: string
      utm_source?: string
      utm_medium?: string
      utm_campaign?: string
      ip_address?: string
      user_agent?: string
    }
  ): Promise<{ success: boolean; referral?: AffiliateReferral; error?: string }> {
    try {
      const affiliate = await this.getAffiliateByCode(affiliateCode)
      if (!affiliate) {
        return { success: false, error: 'Invalid affiliate code' }
      }

      if (affiliate.application_status !== 'approved') {
        return { success: false, error: 'Affiliate not approved' }
      }

      // Create referral record
      const result = await this.db.prepare(`
        INSERT INTO affiliate_referrals (
          affiliate_id, referral_code, source_url, landing_page_url,
          utm_source, utm_medium, utm_campaign, ip_address, user_agent,
          referral_status, conversion_amount, commission_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'click', 0.00, 0.00)
      `).bind(
        affiliate.id,
        affiliateCode,
        trackingData.source_url,
        trackingData.landing_page_url,
        trackingData.utm_source,
        trackingData.utm_medium,
        trackingData.utm_campaign,
        trackingData.ip_address,
        trackingData.user_agent
      ).run()

      const referral = await this.getAffiliateReferral(result.meta.last_row_id as number)
      
      this.logger.log('Tracked affiliate click', { affiliateId: affiliate.id, referralId: result.meta.last_row_id })
      return { success: true, referral: referral! }
    } catch (error) {
      this.logger.error('Error tracking affiliate click', error)
      return { success: false, error: 'Failed to track affiliate click' }
    }
  }

  async processAffiliateSignup(referralId: number, userId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.db.prepare(`
        UPDATE affiliate_referrals 
        SET referred_user_id = ?, referral_status = 'signup', 
            signup_date = datetime('now')
        WHERE id = ? AND referral_status = 'click'
      `).bind(userId, referralId).run()

      // Create attribution record
      await this.createAffiliateAttribution(userId, referralId, 'signup')

      this.logger.log('Processed affiliate signup', { referralId, userId })
      return { success: true }
    } catch (error) {
      this.logger.error('Error processing affiliate signup', error)
      return { success: false, error: 'Failed to process affiliate signup' }
    }
  }

  async processAffiliateConversion(
    userId: number,
    conversionAmount: number,
    transactionId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Find active referral for this user (within cookie duration)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 30) // Default 30 days, should use program cookie duration

      const referral = await this.db.prepare(`
        SELECT ar.*, a.program_id, ap.commission_type, ap.commission_rate, ap.commission_tiers
        FROM affiliate_referrals ar
        JOIN affiliates a ON ar.affiliate_id = a.id
        JOIN affiliate_programs ap ON a.program_id = ap.id
        WHERE ar.referred_user_id = ? 
        AND ar.referral_status IN ('click', 'signup')
        AND ar.click_date > ?
        ORDER BY ar.click_date DESC
        LIMIT 1
      `).bind(userId, cutoffDate.toISOString()).first() as any

      if (!referral) {
        return { success: true } // No referral to process, but not an error
      }

      // Calculate commission
      const commissionAmount = this.calculateCommission(
        referral.commission_type,
        referral.commission_rate,
        conversionAmount,
        referral.commission_tiers
      )

      // Update referral record
      await this.db.prepare(`
        UPDATE affiliate_referrals 
        SET referral_status = 'conversion', conversion_date = datetime('now'),
            conversion_amount = ?, commission_amount = ?
        WHERE id = ?
      `).bind(conversionAmount, commissionAmount, referral.id).run()

      // Update affiliate totals
      await this.db.prepare(`
        UPDATE affiliates 
        SET total_referrals = total_referrals + 1,
            total_commissions_earned = total_commissions_earned + ?,
            last_activity_date = datetime('now')
        WHERE id = ?
      `).bind(commissionAmount, referral.affiliate_id).run()

      // Create attribution record
      await this.createAffiliateAttribution(userId, referral.id, 'conversion', conversionAmount)

      this.logger.log('Processed affiliate conversion', { 
        userId, conversionAmount, commissionAmount, referralId: referral.id 
      })
      return { success: true }
    } catch (error) {
      this.logger.error('Error processing affiliate conversion', error)
      return { success: false, error: 'Failed to process affiliate conversion' }
    }
  }

  private calculateCommission(
    commissionType: string,
    commissionRate: number,
    conversionAmount: number,
    commissionTiers?: string
  ): number {
    switch (commissionType) {
      case 'percentage':
        return (conversionAmount * commissionRate) / 100

      case 'fixed_amount':
        return commissionRate

      case 'tiered':
        if (commissionTiers) {
          const tiers = JSON.parse(commissionTiers)
          // Find appropriate tier based on conversion amount
          for (const tier of tiers.sort((a: any, b: any) => b.threshold - a.threshold)) {
            if (conversionAmount >= tier.threshold) {
              return tier.type === 'percentage' 
                ? (conversionAmount * tier.rate) / 100 
                : tier.rate
            }
          }
        }
        return 0

      default:
        return 0
    }
  }

  private async createAffiliateAttribution(userId: number, referralId: number, event: string, value?: number): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO marketing_attributions (
          user_id, attribution_type, source_campaign_id, conversion_event,
          conversion_date, conversion_value, source_details
        ) VALUES (?, 'affiliate', ?, ?, datetime('now'), ?, ?)
      `).bind(
        userId,
        referralId,
        event,
        value || 0,
        JSON.stringify({ referral_id: referralId, event_type: event })
      ).run()
    } catch (error) {
      this.logger.error('Error creating affiliate attribution', error)
    }
  }

  async getAffiliateReferral(referralId: number): Promise<AffiliateReferral | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM affiliate_referrals WHERE id = ?
      `).bind(referralId).first()

      return result as AffiliateReferral || null
    } catch (error) {
      this.logger.error('Error getting affiliate referral', error)
      return null
    }
  }

  async getAffiliateReferrals(affiliateId: number, status?: string): Promise<AffiliateReferral[]> {
    try {
      let query = 'SELECT * FROM affiliate_referrals WHERE affiliate_id = ?'
      const binds = [affiliateId]

      if (status) {
        query += ' AND referral_status = ?'
        binds.push(status)
      }

      query += ' ORDER BY click_date DESC'

      const result = await this.db.prepare(query).bind(...binds).all()
      return result.results as AffiliateReferral[]
    } catch (error) {
      this.logger.error('Error getting affiliate referrals', error)
      return []
    }
  }

  // ===========================================================================
  // PAYMENT MANAGEMENT
  // ===========================================================================

  async generateAffiliatePayment(
    affiliateId: number,
    periodStart: string,
    periodEnd: string
  ): Promise<{ success: boolean; payment?: AffiliatePayment; error?: string }> {
    try {
      const affiliate = await this.getAffiliate(affiliateId)
      if (!affiliate) {
        return { success: false, error: 'Affiliate not found' }
      }

      // Get unpaid conversions in the period
      const conversions = await this.db.prepare(`
        SELECT * FROM affiliate_referrals 
        WHERE affiliate_id = ? 
        AND referral_status = 'conversion'
        AND commission_paid_date IS NULL
        AND conversion_date BETWEEN ? AND ?
      `).bind(affiliateId, periodStart, periodEnd).all()

      if (conversions.results.length === 0) {
        return { success: false, error: 'No unpaid conversions found for this period' }
      }

      const totalCommission = conversions.results.reduce((sum: number, conv: any) => 
        sum + (conv.commission_amount || 0), 0
      )

      const program = await this.getAffiliateProgram(affiliate.program_id)
      if (!program) {
        return { success: false, error: 'Affiliate program not found' }
      }

      // Check minimum payout amount
      if (totalCommission < program.minimum_payout_amount) {
        return { 
          success: false, 
          error: `Commission amount ($${totalCommission}) is below minimum payout threshold ($${program.minimum_payout_amount})` 
        }
      }

      // Create payment record
      const result = await this.db.prepare(`
        INSERT INTO affiliate_payments (
          affiliate_id, payment_period_start, payment_period_end,
          total_referrals, total_commission_amount, payment_amount,
          payment_method, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, 'paypal', 'pending')
      `).bind(
        affiliateId,
        periodStart,
        periodEnd,
        conversions.results.length,
        totalCommission,
        totalCommission
      ).run()

      const payment = await this.getAffiliatePayment(result.meta.last_row_id as number)
      
      this.logger.log('Generated affiliate payment', { 
        affiliateId, paymentId: result.meta.last_row_id, amount: totalCommission 
      })
      return { success: true, payment: payment! }
    } catch (error) {
      this.logger.error('Error generating affiliate payment', error)
      return { success: false, error: 'Failed to generate affiliate payment' }
    }
  }

  async processAffiliatePayment(
    paymentId: number,
    paymentReference?: string,
    paymentNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const payment = await this.getAffiliatePayment(paymentId)
      if (!payment) {
        return { success: false, error: 'Payment not found' }
      }

      // Update payment status
      await this.db.prepare(`
        UPDATE affiliate_payments 
        SET payment_status = 'paid', payment_date = datetime('now'),
            payment_reference = ?, payment_notes = ?
        WHERE id = ?
      `).bind(paymentReference, paymentNotes, paymentId).run()

      // Mark referrals as paid
      await this.db.prepare(`
        UPDATE affiliate_referrals 
        SET commission_paid_date = datetime('now')
        WHERE affiliate_id = ? 
        AND conversion_date BETWEEN ? AND ?
        AND commission_paid_date IS NULL
      `).bind(payment.affiliate_id, payment.payment_period_start, payment.payment_period_end).run()

      // Update affiliate totals
      await this.db.prepare(`
        UPDATE affiliates 
        SET total_commissions_paid = total_commissions_paid + ?
        WHERE id = ?
      `).bind(payment.payment_amount, payment.affiliate_id).run()

      this.logger.log('Processed affiliate payment', { paymentId, paymentReference })
      return { success: true }
    } catch (error) {
      this.logger.error('Error processing affiliate payment', error)
      return { success: false, error: 'Failed to process affiliate payment' }
    }
  }

  async getAffiliatePayment(paymentId: number): Promise<AffiliatePayment | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM affiliate_payments WHERE id = ?
      `).bind(paymentId).first()

      return result as AffiliatePayment || null
    } catch (error) {
      this.logger.error('Error getting affiliate payment', error)
      return null
    }
  }

  async getAffiliatePayments(affiliateId: number): Promise<AffiliatePayment[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM affiliate_payments 
        WHERE affiliate_id = ? 
        ORDER BY payment_period_end DESC
      `).bind(affiliateId).all()

      return result.results as AffiliatePayment[]
    } catch (error) {
      this.logger.error('Error getting affiliate payments', error)
      return []
    }
  }

  async getPendingPayments(): Promise<AffiliatePayment[]> {
    try {
      const result = await this.db.prepare(`
        SELECT ap.*, a.company_name, a.contact_email
        FROM affiliate_payments ap
        JOIN affiliates a ON ap.affiliate_id = a.id
        WHERE ap.payment_status = 'pending'
        ORDER BY ap.created_at ASC
      `).all()

      return result.results as any[]
    } catch (error) {
      this.logger.error('Error getting pending payments', error)
      return []
    }
  }

  // ===========================================================================
  // ANALYTICS AND REPORTING
  // ===========================================================================

  async getAffiliateStats(affiliateId: number, dateRange?: { start: string; end: string }): Promise<{
    total_clicks: number
    total_signups: number
    total_conversions: number
    total_commissions_earned: number
    total_commissions_paid: number
    conversion_rate: number
    average_commission: number
    recent_referrals: AffiliateReferral[]
  }> {
    try {
      let dateCondition = ''
      const binds = [affiliateId]

      if (dateRange) {
        dateCondition = ' AND click_date BETWEEN ? AND ?'
        binds.push(dateRange.start, dateRange.end)
      }

      // Get referral stats
      const stats = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_clicks,
          SUM(CASE WHEN referral_status IN ('signup', 'conversion') THEN 1 ELSE 0 END) as total_signups,
          SUM(CASE WHEN referral_status = 'conversion' THEN 1 ELSE 0 END) as total_conversions,
          COALESCE(SUM(commission_amount), 0) as total_commissions_earned
        FROM affiliate_referrals 
        WHERE affiliate_id = ?${dateCondition}
      `).bind(...binds).first() as any

      // Get commission payment stats
      const paymentStats = await this.db.prepare(`
        SELECT COALESCE(SUM(payment_amount), 0) as total_commissions_paid
        FROM affiliate_payments 
        WHERE affiliate_id = ? AND payment_status = 'paid'
      `).bind(affiliateId).first() as any

      // Get recent referrals
      const recentReferrals = await this.db.prepare(`
        SELECT * FROM affiliate_referrals 
        WHERE affiliate_id = ? 
        ORDER BY click_date DESC 
        LIMIT 10
      `).bind(affiliateId).all()

      const conversionRate = stats.total_clicks > 0 
        ? (stats.total_conversions / stats.total_clicks) * 100 
        : 0

      const averageCommission = stats.total_conversions > 0 
        ? stats.total_commissions_earned / stats.total_conversions 
        : 0

      return {
        total_clicks: stats.total_clicks || 0,
        total_signups: stats.total_signups || 0,
        total_conversions: stats.total_conversions || 0,
        total_commissions_earned: stats.total_commissions_earned || 0,
        total_commissions_paid: paymentStats.total_commissions_paid || 0,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        average_commission: Math.round(averageCommission * 100) / 100,
        recent_referrals: recentReferrals.results as AffiliateReferral[]
      }
    } catch (error) {
      this.logger.error('Error getting affiliate stats', error)
      return {
        total_clicks: 0,
        total_signups: 0,
        total_conversions: 0,
        total_commissions_earned: 0,
        total_commissions_paid: 0,
        conversion_rate: 0,
        average_commission: 0,
        recent_referrals: []
      }
    }
  }

  async getOverallAffiliateStats(): Promise<AffiliateStats> {
    try {
      // Get affiliate counts
      const affiliateCounts = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_affiliates,
          SUM(CASE WHEN application_status = 'approved' THEN 1 ELSE 0 END) as active_affiliates,
          SUM(CASE WHEN application_status = 'pending' THEN 1 ELSE 0 END) as pending_applications
        FROM affiliates
      `).first() as any

      // Get referral stats
      const referralStats = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_referrals,
          SUM(CASE WHEN referral_status = 'conversion' THEN 1 ELSE 0 END) as total_conversions,
          COALESCE(SUM(commission_amount), 0) as total_commissions_earned
        FROM affiliate_referrals
      `).first() as any

      // Get payment stats
      const paymentStats = await this.db.prepare(`
        SELECT COALESCE(SUM(payment_amount), 0) as total_commissions_paid
        FROM affiliate_payments 
        WHERE payment_status = 'paid'
      `).first() as any

      // Get top performers
      const topPerformers = await this.db.prepare(`
        SELECT 
          a.id as affiliate_id,
          a.company_name,
          a.total_referrals as referral_count,
          CASE 
            WHEN COUNT(ar.id) > 0 THEN (SUM(CASE WHEN ar.referral_status = 'conversion' THEN 1 ELSE 0 END) * 100.0 / COUNT(ar.id))
            ELSE 0 
          END as conversion_rate,
          a.total_commissions_earned as commissions_earned
        FROM affiliates a
        LEFT JOIN affiliate_referrals ar ON a.id = ar.affiliate_id
        WHERE a.application_status = 'approved'
        GROUP BY a.id, a.company_name, a.total_referrals, a.total_commissions_earned
        ORDER BY commissions_earned DESC, referral_count DESC
        LIMIT 10
      `).all()

      const averageConversionRate = referralStats.total_referrals > 0 
        ? (referralStats.total_conversions / referralStats.total_referrals) * 100 
        : 0

      return {
        total_affiliates: affiliateCounts.total_affiliates || 0,
        active_affiliates: affiliateCounts.active_affiliates || 0,
        pending_applications: affiliateCounts.pending_applications || 0,
        total_referrals: referralStats.total_referrals || 0,
        total_conversions: referralStats.total_conversions || 0,
        total_commissions_earned: referralStats.total_commissions_earned || 0,
        total_commissions_paid: paymentStats.total_commissions_paid || 0,
        average_conversion_rate: Math.round(averageConversionRate * 100) / 100,
        top_performers: topPerformers.results as any[]
      }
    } catch (error) {
      this.logger.error('Error getting overall affiliate stats', error)
      return {
        total_affiliates: 0,
        active_affiliates: 0,
        pending_applications: 0,
        total_referrals: 0,
        total_conversions: 0,
        total_commissions_earned: 0,
        total_commissions_paid: 0,
        average_conversion_rate: 0,
        top_performers: []
      }
    }
  }
}