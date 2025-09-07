import { Logger } from '../utils/logger'

export interface PromotionalCampaign {
  id: number
  campaign_name: string
  description?: string
  campaign_type: 'discount_percent' | 'discount_fixed' | 'free_service' | 'bogo'
  discount_type: 'percent' | 'fixed_amount' | 'free_service'
  discount_value: number
  minimum_order_amount: number
  maximum_discount_amount?: number
  usage_limit_total?: number
  usage_limit_per_user: number
  valid_from: string
  valid_until: string
  applicable_services?: string // JSON array of service category IDs
  target_user_type: 'all' | 'new_users' | 'existing_users' | 'specific_segment'
  is_active: boolean
  created_by?: number
}

export interface PromotionalCode {
  id: number
  campaign_id: number
  code: string
  usage_count: number
  is_active: boolean
  created_at: string
}

export interface PromoCodeUsage {
  id: number
  code_id: number
  user_id: number
  job_id?: number
  booking_id?: number
  discount_amount: number
  original_amount: number
  final_amount: number
  usage_date: string
}

export interface CodeValidationResult {
  valid: boolean
  campaign?: PromotionalCampaign
  code?: PromotionalCode
  discount_amount?: number
  error?: string
}

export interface DiscountCalculation {
  original_amount: number
  discount_amount: number
  final_amount: number
  discount_type: string
  discount_value: number
}

export class PromotionalCodesService {
  private db: D1Database
  private logger: Logger

  constructor(db: D1Database) {
    this.db = db
    this.logger = new Logger('PromotionalCodesService')
  }

  // ===========================================================================
  // PROMOTIONAL CAMPAIGN MANAGEMENT
  // ===========================================================================

  async createPromotionalCampaign(campaignData: Omit<PromotionalCampaign, 'id'>): Promise<{ success: boolean; campaign?: PromotionalCampaign; error?: string }> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO promotional_campaigns (
          campaign_name, description, campaign_type, discount_type, discount_value,
          minimum_order_amount, maximum_discount_amount, usage_limit_total, 
          usage_limit_per_user, valid_from, valid_until, applicable_services,
          target_user_type, is_active, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        campaignData.campaign_name,
        campaignData.description,
        campaignData.campaign_type,
        campaignData.discount_type,
        campaignData.discount_value,
        campaignData.minimum_order_amount,
        campaignData.maximum_discount_amount,
        campaignData.usage_limit_total,
        campaignData.usage_limit_per_user,
        campaignData.valid_from,
        campaignData.valid_until,
        campaignData.applicable_services,
        campaignData.target_user_type,
        campaignData.is_active,
        campaignData.created_by
      ).run()

      const campaign = await this.getPromotionalCampaign(result.meta.last_row_id as number)
      
      this.logger.log('Created promotional campaign', { campaignId: result.meta.last_row_id })
      return { success: true, campaign: campaign! }
    } catch (error) {
      this.logger.error('Error creating promotional campaign', error)
      return { success: false, error: 'Failed to create promotional campaign' }
    }
  }

  async getPromotionalCampaign(campaignId: number): Promise<PromotionalCampaign | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM promotional_campaigns WHERE id = ?
      `).bind(campaignId).first()

      return result as PromotionalCampaign || null
    } catch (error) {
      this.logger.error('Error getting promotional campaign', error)
      return null
    }
  }

  async getActiveCampaigns(): Promise<PromotionalCampaign[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM promotional_campaigns 
        WHERE is_active = TRUE 
        AND valid_from <= datetime('now')
        AND valid_until > datetime('now')
        ORDER BY created_at DESC
      `).all()

      return result.results as PromotionalCampaign[]
    } catch (error) {
      this.logger.error('Error getting active campaigns', error)
      return []
    }
  }

  async updatePromotionalCampaign(campaignId: number, updates: Partial<PromotionalCampaign>): Promise<{ success: boolean; error?: string }> {
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ')
      const values = Object.values(updates)
      
      await this.db.prepare(`
        UPDATE promotional_campaigns 
        SET ${setClause}, updated_at = datetime('now')
        WHERE id = ?
      `).bind(...values, campaignId).run()

      this.logger.log('Updated promotional campaign', { campaignId, updates })
      return { success: true }
    } catch (error) {
      this.logger.error('Error updating promotional campaign', error)
      return { success: false, error: 'Failed to update promotional campaign' }
    }
  }

  async deactivateCampaign(campaignId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.db.prepare(`
        UPDATE promotional_campaigns 
        SET is_active = FALSE, updated_at = datetime('now')
        WHERE id = ?
      `).bind(campaignId).run()

      // Also deactivate all codes for this campaign
      await this.db.prepare(`
        UPDATE promotional_codes 
        SET is_active = FALSE 
        WHERE campaign_id = ?
      `).bind(campaignId).run()

      this.logger.log('Deactivated promotional campaign', { campaignId })
      return { success: true }
    } catch (error) {
      this.logger.error('Error deactivating campaign', error)
      return { success: false, error: 'Failed to deactivate campaign' }
    }
  }

  // ===========================================================================
  // PROMOTIONAL CODE GENERATION AND MANAGEMENT
  // ===========================================================================

  async generatePromotionalCodes(campaignId: number, count: number, prefix?: string): Promise<{ success: boolean; codes?: string[]; error?: string }> {
    try {
      const campaign = await this.getPromotionalCampaign(campaignId)
      if (!campaign) {
        return { success: false, error: 'Campaign not found' }
      }

      const codes: string[] = []
      const batchSize = 100 // Process in batches to avoid memory issues

      for (let i = 0; i < count; i += batchSize) {
        const batchCodes = []
        const currentBatchSize = Math.min(batchSize, count - i)

        for (let j = 0; j < currentBatchSize; j++) {
          const code = await this.generateUniqueCode(prefix)
          batchCodes.push(code)
          codes.push(code)
        }

        // Insert batch of codes
        const placeholders = batchCodes.map(() => '(?, ?)').join(', ')
        const values = batchCodes.flatMap(code => [campaignId, code])
        
        await this.db.prepare(`
          INSERT INTO promotional_codes (campaign_id, code) 
          VALUES ${placeholders}
        `).bind(...values).run()
      }

      this.logger.log('Generated promotional codes', { campaignId, count, codesGenerated: codes.length })
      return { success: true, codes }
    } catch (error) {
      this.logger.error('Error generating promotional codes', error)
      return { success: false, error: 'Failed to generate promotional codes' }
    }
  }

  async createCustomPromotionalCode(campaignId: number, customCode: string): Promise<{ success: boolean; code?: PromotionalCode; error?: string }> {
    try {
      // Check if code already exists
      const existing = await this.db.prepare(`
        SELECT id FROM promotional_codes WHERE code = ?
      `).bind(customCode.toUpperCase()).first()

      if (existing) {
        return { success: false, error: 'Code already exists' }
      }

      const result = await this.db.prepare(`
        INSERT INTO promotional_codes (campaign_id, code)
        VALUES (?, ?)
      `).bind(campaignId, customCode.toUpperCase()).run()

      const code = await this.getPromotionalCode(result.meta.last_row_id as number)
      
      this.logger.log('Created custom promotional code', { campaignId, customCode })
      return { success: true, code: code! }
    } catch (error) {
      this.logger.error('Error creating custom promotional code', error)
      return { success: false, error: 'Failed to create custom promotional code' }
    }
  }

  private async generateUniqueCode(prefix?: string): Promise<string> {
    let attempts = 0
    const maxAttempts = 20

    while (attempts < maxAttempts) {
      const code = this.createRandomCode(prefix)
      
      const existing = await this.db.prepare(`
        SELECT id FROM promotional_codes WHERE code = ?
      `).bind(code).first()

      if (!existing) {
        return code
      }
      attempts++
    }

    throw new Error('Failed to generate unique promotional code after maximum attempts')
  }

  private createRandomCode(prefix?: string): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = prefix || ''
    const remainingLength = 8 - code.length

    for (let i = 0; i < remainingLength; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    return code.toUpperCase()
  }

  async getPromotionalCode(codeId: number): Promise<PromotionalCode | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM promotional_codes WHERE id = ?
      `).bind(codeId).first()

      return result as PromotionalCode || null
    } catch (error) {
      this.logger.error('Error getting promotional code', error)
      return null
    }
  }

  async getCampaignCodes(campaignId: number, limit = 100, offset = 0): Promise<{ codes: PromotionalCode[]; total: number }> {
    try {
      const codesResult = await this.db.prepare(`
        SELECT * FROM promotional_codes 
        WHERE campaign_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `).bind(campaignId, limit, offset).all()

      const countResult = await this.db.prepare(`
        SELECT COUNT(*) as total FROM promotional_codes WHERE campaign_id = ?
      `).bind(campaignId).first() as any

      return {
        codes: codesResult.results as PromotionalCode[],
        total: countResult.total || 0
      }
    } catch (error) {
      this.logger.error('Error getting campaign codes', error)
      return { codes: [], total: 0 }
    }
  }

  // ===========================================================================
  // CODE VALIDATION AND DISCOUNT CALCULATION
  // ===========================================================================

  async validatePromotionalCode(
    code: string, 
    userId: number, 
    orderAmount: number, 
    serviceCategories?: number[]
  ): Promise<CodeValidationResult> {
    try {
      // Get code and campaign details
      const result = await this.db.prepare(`
        SELECT pc.*, pcam.*
        FROM promotional_codes pc
        JOIN promotional_campaigns pcam ON pc.campaign_id = pcam.id
        WHERE pc.code = ? AND pc.is_active = TRUE AND pcam.is_active = TRUE
      `).bind(code.toUpperCase()).first() as any

      if (!result) {
        return { valid: false, error: 'Invalid promotional code' }
      }

      const promoCode: PromotionalCode = {
        id: result.id,
        campaign_id: result.campaign_id,
        code: result.code,
        usage_count: result.usage_count,
        is_active: result.is_active,
        created_at: result.created_at
      }

      const campaign: PromotionalCampaign = {
        id: result.campaign_id,
        campaign_name: result.campaign_name,
        description: result.description,
        campaign_type: result.campaign_type,
        discount_type: result.discount_type,
        discount_value: result.discount_value,
        minimum_order_amount: result.minimum_order_amount,
        maximum_discount_amount: result.maximum_discount_amount,
        usage_limit_total: result.usage_limit_total,
        usage_limit_per_user: result.usage_limit_per_user,
        valid_from: result.valid_from,
        valid_until: result.valid_until,
        applicable_services: result.applicable_services,
        target_user_type: result.target_user_type,
        is_active: result.is_active,
        created_by: result.created_by
      }

      // Validate date range
      const now = new Date().toISOString()
      if (campaign.valid_from > now) {
        return { valid: false, error: 'Promotional code is not yet valid' }
      }
      if (campaign.valid_until <= now) {
        return { valid: false, error: 'Promotional code has expired' }
      }

      // Check minimum order amount
      if (orderAmount < campaign.minimum_order_amount) {
        return { 
          valid: false, 
          error: `Minimum order amount of $${campaign.minimum_order_amount} required` 
        }
      }

      // Check total usage limit
      if (campaign.usage_limit_total && promoCode.usage_count >= campaign.usage_limit_total) {
        return { valid: false, error: 'Promotional code usage limit exceeded' }
      }

      // Check user-specific usage limit
      const userUsageCount = await this.getUserCodeUsageCount(userId, promoCode.id)
      if (userUsageCount >= campaign.usage_limit_per_user) {
        return { valid: false, error: 'You have already used this promotional code' }
      }

      // Check user type restrictions
      const userValidation = await this.validateUserType(userId, campaign.target_user_type)
      if (!userValidation.valid) {
        return { valid: false, error: userValidation.error }
      }

      // Check applicable services
      if (campaign.applicable_services && serviceCategories) {
        const applicableServices = JSON.parse(campaign.applicable_services)
        const hasApplicableService = serviceCategories.some(cat => 
          applicableServices.includes(cat.toString())
        )
        
        if (!hasApplicableService) {
          return { valid: false, error: 'Promotional code not applicable to selected services' }
        }
      }

      // Calculate discount amount
      const discountCalculation = this.calculateDiscount(campaign, orderAmount)

      return {
        valid: true,
        campaign,
        code: promoCode,
        discount_amount: discountCalculation.discount_amount
      }
    } catch (error) {
      this.logger.error('Error validating promotional code', error)
      return { valid: false, error: 'Failed to validate promotional code' }
    }
  }

  private async getUserCodeUsageCount(userId: number, codeId: number): Promise<number> {
    try {
      const result = await this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM promotional_code_usage 
        WHERE user_id = ? AND code_id = ?
      `).bind(userId, codeId).first() as any

      return result.count || 0
    } catch (error) {
      this.logger.error('Error getting user code usage count', error)
      return 0
    }
  }

  private async validateUserType(userId: number, targetUserType: string): Promise<{ valid: boolean; error?: string }> {
    if (targetUserType === 'all') {
      return { valid: true }
    }

    try {
      if (targetUserType === 'new_users') {
        // Check if user has any completed bookings
        const bookingCount = await this.db.prepare(`
          SELECT COUNT(*) as count 
          FROM bookings 
          WHERE client_id = ? AND booking_status = 'completed'
        `).bind(userId).first() as any

        if (bookingCount.count > 0) {
          return { valid: false, error: 'This promotion is only for new users' }
        }
      } else if (targetUserType === 'existing_users') {
        // Check if user has at least one completed booking
        const bookingCount = await this.db.prepare(`
          SELECT COUNT(*) as count 
          FROM bookings 
          WHERE client_id = ? AND booking_status = 'completed'
        `).bind(userId).first() as any

        if (bookingCount.count === 0) {
          return { valid: false, error: 'This promotion is only for existing customers' }
        }
      }

      return { valid: true }
    } catch (error) {
      this.logger.error('Error validating user type', error)
      return { valid: false, error: 'Failed to validate user eligibility' }
    }
  }

  calculateDiscount(campaign: PromotionalCampaign, orderAmount: number): DiscountCalculation {
    let discountAmount = 0

    switch (campaign.discount_type) {
      case 'percent':
        discountAmount = (orderAmount * campaign.discount_value) / 100
        break
      case 'fixed_amount':
        discountAmount = campaign.discount_value
        break
      case 'free_service':
        discountAmount = orderAmount // Full discount for free service
        break
      default:
        discountAmount = 0
    }

    // Apply maximum discount limit if set
    if (campaign.maximum_discount_amount && discountAmount > campaign.maximum_discount_amount) {
      discountAmount = campaign.maximum_discount_amount
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmount)
    
    const finalAmount = Math.max(0, orderAmount - discountAmount)

    return {
      original_amount: orderAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      discount_type: campaign.discount_type,
      discount_value: campaign.discount_value
    }
  }

  // ===========================================================================
  // CODE USAGE TRACKING
  // ===========================================================================

  async applyPromotionalCode(
    codeId: number,
    userId: number,
    orderAmount: number,
    discountAmount: number,
    jobId?: number,
    bookingId?: number
  ): Promise<{ success: boolean; usage?: PromoCodeUsage; error?: string }> {
    try {
      const finalAmount = orderAmount - discountAmount

      // Record the usage
      const result = await this.db.prepare(`
        INSERT INTO promotional_code_usage (
          code_id, user_id, job_id, booking_id, 
          discount_amount, original_amount, final_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        codeId, userId, jobId, bookingId,
        discountAmount, orderAmount, finalAmount
      ).run()

      // Update code usage count
      await this.db.prepare(`
        UPDATE promotional_codes 
        SET usage_count = usage_count + 1
        WHERE id = ?
      `).bind(codeId).run()

      // Create marketing attribution
      await this.createPromoCodeAttribution(userId, codeId, orderAmount, discountAmount)

      const usage = await this.getCodeUsage(result.meta.last_row_id as number)
      
      this.logger.log('Applied promotional code', { 
        codeId, userId, discountAmount, finalAmount, usageId: result.meta.last_row_id 
      })
      
      return { success: true, usage: usage! }
    } catch (error) {
      this.logger.error('Error applying promotional code', error)
      return { success: false, error: 'Failed to apply promotional code' }
    }
  }

  private async createPromoCodeAttribution(userId: number, codeId: number, orderAmount: number, discountAmount: number): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO marketing_attributions (
          user_id, attribution_type, source_campaign_id, conversion_event,
          conversion_date, conversion_value, source_details
        ) VALUES (?, 'promo_code', ?, 'purchase', datetime('now'), ?, ?)
      `).bind(
        userId,
        codeId,
        orderAmount,
        JSON.stringify({ 
          code_id: codeId, 
          discount_amount: discountAmount,
          original_amount: orderAmount 
        })
      ).run()
    } catch (error) {
      this.logger.error('Error creating promo code attribution', error)
    }
  }

  async getCodeUsage(usageId: number): Promise<PromoCodeUsage | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM promotional_code_usage WHERE id = ?
      `).bind(usageId).first()

      return result as PromoCodeUsage || null
    } catch (error) {
      this.logger.error('Error getting code usage', error)
      return null
    }
  }

  async getUserCodeUsages(userId: number): Promise<PromoCodeUsage[]> {
    try {
      const result = await this.db.prepare(`
        SELECT pcu.*, pc.code, pcam.campaign_name
        FROM promotional_code_usage pcu
        JOIN promotional_codes pc ON pcu.code_id = pc.id
        JOIN promotional_campaigns pcam ON pc.campaign_id = pcam.id
        WHERE pcu.user_id = ?
        ORDER BY pcu.usage_date DESC
      `).bind(userId).all()

      return result.results as any[]
    } catch (error) {
      this.logger.error('Error getting user code usages', error)
      return []
    }
  }

  // ===========================================================================
  // CAMPAIGN ANALYTICS AND REPORTING
  // ===========================================================================

  async getCampaignStats(campaignId: number, dateRange?: { start: string; end: string }): Promise<{
    total_codes: number
    codes_used: number
    unique_users: number
    total_discount_given: number
    total_revenue: number
    usage_rate: number
    avg_discount_per_use: number
    top_codes: Array<{ code: string; usage_count: number; total_discount: number }>
  }> {
    try {
      let dateCondition = ''
      const binds = [campaignId]

      if (dateRange) {
        dateCondition = ' AND pcu.usage_date BETWEEN ? AND ?'
        binds.push(dateRange.start, dateRange.end)
      }

      // Get basic campaign stats
      const basicStats = await this.db.prepare(`
        SELECT 
          COUNT(DISTINCT pc.id) as total_codes,
          COUNT(DISTINCT pcu.id) as codes_used,
          COUNT(DISTINCT pcu.user_id) as unique_users,
          COALESCE(SUM(pcu.discount_amount), 0) as total_discount_given,
          COALESCE(SUM(pcu.final_amount), 0) as total_revenue
        FROM promotional_codes pc
        LEFT JOIN promotional_code_usage pcu ON pc.id = pcu.code_id${dateCondition}
        WHERE pc.campaign_id = ?
      `).bind(...binds.slice(dateRange ? 2 : 0), campaignId).first() as any

      // Get top performing codes
      const topCodes = await this.db.prepare(`
        SELECT 
          pc.code,
          COUNT(pcu.id) as usage_count,
          COALESCE(SUM(pcu.discount_amount), 0) as total_discount
        FROM promotional_codes pc
        LEFT JOIN promotional_code_usage pcu ON pc.id = pcu.code_id${dateCondition}
        WHERE pc.campaign_id = ?
        GROUP BY pc.id, pc.code
        ORDER BY usage_count DESC, total_discount DESC
        LIMIT 10
      `).bind(...binds.slice(dateRange ? 2 : 0), campaignId).all()

      const usageRate = basicStats.total_codes > 0 
        ? (basicStats.codes_used / basicStats.total_codes) * 100 
        : 0

      const avgDiscountPerUse = basicStats.codes_used > 0 
        ? basicStats.total_discount_given / basicStats.codes_used 
        : 0

      return {
        total_codes: basicStats.total_codes || 0,
        codes_used: basicStats.codes_used || 0,
        unique_users: basicStats.unique_users || 0,
        total_discount_given: basicStats.total_discount_given || 0,
        total_revenue: basicStats.total_revenue || 0,
        usage_rate: Math.round(usageRate * 100) / 100,
        avg_discount_per_use: Math.round(avgDiscountPerUse * 100) / 100,
        top_codes: topCodes.results as any[]
      }
    } catch (error) {
      this.logger.error('Error getting campaign stats', error)
      return {
        total_codes: 0,
        codes_used: 0,
        unique_users: 0,
        total_discount_given: 0,
        total_revenue: 0,
        usage_rate: 0,
        avg_discount_per_use: 0,
        top_codes: []
      }
    }
  }

  async getPromotionalCodesByCode(codes: string[]): Promise<PromotionalCode[]> {
    try {
      const placeholders = codes.map(() => '?').join(', ')
      const upperCodes = codes.map(code => code.toUpperCase())
      
      const result = await this.db.prepare(`
        SELECT * FROM promotional_codes 
        WHERE code IN (${placeholders})
      `).bind(...upperCodes).all()

      return result.results as PromotionalCode[]
    } catch (error) {
      this.logger.error('Error getting promotional codes by code', error)
      return []
    }
  }

  async deactivatePromotionalCode(codeId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.db.prepare(`
        UPDATE promotional_codes 
        SET is_active = FALSE
        WHERE id = ?
      `).bind(codeId).run()

      this.logger.log('Deactivated promotional code', { codeId })
      return { success: true }
    } catch (error) {
      this.logger.error('Error deactivating promotional code', error)
      return { success: false, error: 'Failed to deactivate promotional code' }
    }
  }

  // ===========================================================================
  // BULK OPERATIONS
  // ===========================================================================

  async bulkDeactivateCodes(codeIds: number[]): Promise<{ success: boolean; deactivated: number; error?: string }> {
    try {
      if (codeIds.length === 0) {
        return { success: true, deactivated: 0 }
      }

      const placeholders = codeIds.map(() => '?').join(', ')
      const result = await this.db.prepare(`
        UPDATE promotional_codes 
        SET is_active = FALSE
        WHERE id IN (${placeholders})
      `).bind(...codeIds).run()

      this.logger.log('Bulk deactivated promotional codes', { count: codeIds.length })
      return { success: true, deactivated: result.changes || 0 }
    } catch (error) {
      this.logger.error('Error bulk deactivating promotional codes', error)
      return { success: false, deactivated: 0, error: 'Failed to deactivate codes' }
    }
  }
}