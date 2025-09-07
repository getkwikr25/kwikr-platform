import { Hono } from 'hono'
import { Logger } from '../utils/logger'
import { ReferralService } from '../services/ReferralService'
import { PromotionalCodesService } from '../services/PromotionalCodesService'
import { EmailMarketingService } from '../services/EmailMarketingService'
import { SocialMediaService } from '../services/SocialMediaService'
import { AffiliateService } from '../services/AffiliateService'

type Bindings = {
  DB: D1Database;
}

const marketingRoutes = new Hono<{ Bindings: Bindings }>()
const logger = new Logger('MarketingRoutes')

// ===========================================================================
// REFERRAL SYSTEM ROUTES
// ===========================================================================

// Get user's referral information and stats
marketingRoutes.get('/referrals/my-stats/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const referralService = new ReferralService(c.env.DB)
    
    const stats = await referralService.getUserReferralStats(userId)
    const referralCode = await referralService.getUserReferralCode(userId)
    
    return c.json({
      success: true,
      referral_code: referralCode,
      stats
    })
  } catch (error) {
    logger.error('Error getting user referral stats', error)
    return c.json({ success: false, error: 'Failed to get referral stats' }, 500)
  }
})

// Generate referral code for user
marketingRoutes.post('/referrals/generate-code', async (c) => {
  try {
    const { user_id, program_id } = await c.req.json()
    const referralService = new ReferralService(c.env.DB)
    
    const result = await referralService.generateReferralCode(user_id, program_id)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error generating referral code', error)
    return c.json({ success: false, error: 'Failed to generate referral code' }, 500)
  }
})

// Validate and process referral signup
marketingRoutes.post('/referrals/signup', async (c) => {
  try {
    const { referral_code, new_user_id } = await c.req.json()
    const referralService = new ReferralService(c.env.DB)
    
    const result = await referralService.processReferralSignup(referral_code, new_user_id)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error processing referral signup', error)
    return c.json({ success: false, error: 'Failed to process referral signup' }, 500)
  }
})

// Process referral conversion (purchase/booking)
marketingRoutes.post('/referrals/conversion', async (c) => {
  try {
    const { user_id, conversion_amount } = await c.req.json()
    const referralService = new ReferralService(c.env.DB)
    
    const result = await referralService.processReferralConversion(user_id, conversion_amount)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error processing referral conversion', error)
    return c.json({ success: false, error: 'Failed to process referral conversion' }, 500)
  }
})

// Validate referral code
marketingRoutes.get('/referrals/validate/:code', async (c) => {
  try {
    const code = c.req.param('code')
    const referralService = new ReferralService(c.env.DB)
    
    const result = await referralService.validateReferralCode(code)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error validating referral code', error)
    return c.json({ valid: false, error: 'Failed to validate referral code' }, 500)
  }
})

// Get referral program stats (admin)
marketingRoutes.get('/referrals/program-stats/:programId', async (c) => {
  try {
    const programId = parseInt(c.req.param('programId'))
    const dateRange = c.req.query('start') && c.req.query('end') 
      ? { start: c.req.query('start')!, end: c.req.query('end')! } 
      : undefined
    
    const referralService = new ReferralService(c.env.DB)
    const stats = await referralService.getReferralProgramStats(programId, dateRange)
    
    return c.json({ success: true, stats })
  } catch (error) {
    logger.error('Error getting referral program stats', error)
    return c.json({ success: false, error: 'Failed to get program stats' }, 500)
  }
})

// Get user rewards
marketingRoutes.get('/referrals/rewards/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const status = c.req.query('status')
    const referralService = new ReferralService(c.env.DB)
    
    const rewards = await referralService.getUserRewards(userId, status)
    
    return c.json({ success: true, rewards })
  } catch (error) {
    logger.error('Error getting user rewards', error)
    return c.json({ success: false, error: 'Failed to get rewards' }, 500)
  }
})

// ===========================================================================
// PROMOTIONAL CODES ROUTES
// ===========================================================================

// Validate promotional code
marketingRoutes.post('/promo-codes/validate', async (c) => {
  try {
    const { code, user_id, order_amount, service_categories } = await c.req.json()
    const promoService = new PromotionalCodesService(c.env.DB)
    
    const result = await promoService.validatePromotionalCode(code, user_id, order_amount, service_categories)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error validating promotional code', error)
    return c.json({ valid: false, error: 'Failed to validate promotional code' }, 500)
  }
})

// Apply promotional code
marketingRoutes.post('/promo-codes/apply', async (c) => {
  try {
    const { code_id, user_id, order_amount, discount_amount, job_id, booking_id } = await c.req.json()
    const promoService = new PromotionalCodesService(c.env.DB)
    
    const result = await promoService.applyPromotionalCode(code_id, user_id, order_amount, discount_amount, job_id, booking_id)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error applying promotional code', error)
    return c.json({ success: false, error: 'Failed to apply promotional code' }, 500)
  }
})

// Get user's promotional code usage history
marketingRoutes.get('/promo-codes/usage/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const promoService = new PromotionalCodesService(c.env.DB)
    
    const usages = await promoService.getUserCodeUsages(userId)
    
    return c.json({ success: true, usages })
  } catch (error) {
    logger.error('Error getting user code usages', error)
    return c.json({ success: false, error: 'Failed to get code usages' }, 500)
  }
})

// Get active promotional campaigns (public)
marketingRoutes.get('/promo-codes/campaigns', async (c) => {
  try {
    const promoService = new PromotionalCodesService(c.env.DB)
    
    const campaigns = await promoService.getActiveCampaigns()
    
    return c.json({ success: true, campaigns })
  } catch (error) {
    logger.error('Error getting active campaigns', error)
    return c.json({ success: false, error: 'Failed to get campaigns' }, 500)
  }
})

// Admin: Create promotional campaign
marketingRoutes.post('/promo-codes/campaigns', async (c) => {
  try {
    const campaignData = await c.req.json()
    const promoService = new PromotionalCodesService(c.env.DB)
    
    const result = await promoService.createPromotionalCampaign(campaignData)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error creating promotional campaign', error)
    return c.json({ success: false, error: 'Failed to create campaign' }, 500)
  }
})

// Admin: Generate promotional codes
marketingRoutes.post('/promo-codes/generate', async (c) => {
  try {
    const { campaign_id, count, prefix } = await c.req.json()
    const promoService = new PromotionalCodesService(c.env.DB)
    
    const result = await promoService.generatePromotionalCodes(campaign_id, count, prefix)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error generating promotional codes', error)
    return c.json({ success: false, error: 'Failed to generate codes' }, 500)
  }
})

// Admin: Get campaign statistics
marketingRoutes.get('/promo-codes/campaigns/:campaignId/stats', async (c) => {
  try {
    const campaignId = parseInt(c.req.param('campaignId'))
    const dateRange = c.req.query('start') && c.req.query('end') 
      ? { start: c.req.query('start')!, end: c.req.query('end')! } 
      : undefined
    
    const promoService = new PromotionalCodesService(c.env.DB)
    const stats = await promoService.getCampaignStats(campaignId, dateRange)
    
    return c.json({ success: true, stats })
  } catch (error) {
    logger.error('Error getting campaign stats', error)
    return c.json({ success: false, error: 'Failed to get campaign stats' }, 500)
  }
})

// ===========================================================================
// EMAIL MARKETING ROUTES
// ===========================================================================

// Subscribe to email list
marketingRoutes.post('/email/subscribe', async (c) => {
  try {
    const subscriberData = await c.req.json()
    const emailService = new EmailMarketingService(c.env.DB)
    
    const result = await emailService.subscribeEmail(subscriberData)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error subscribing email', error)
    return c.json({ success: false, error: 'Failed to subscribe email' }, 500)
  }
})

// Unsubscribe from email list
marketingRoutes.post('/email/unsubscribe', async (c) => {
  try {
    const { email, reason } = await c.req.json()
    const emailService = new EmailMarketingService(c.env.DB)
    
    const result = await emailService.unsubscribeEmail(email, reason)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error unsubscribing email', error)
    return c.json({ success: false, error: 'Failed to unsubscribe email' }, 500)
  }
})

// Get email templates
marketingRoutes.get('/email/templates', async (c) => {
  try {
    const templateType = c.req.query('type')
    const emailService = new EmailMarketingService(c.env.DB)
    
    const templates = await emailService.getEmailTemplates(templateType)
    
    return c.json({ success: true, templates })
  } catch (error) {
    logger.error('Error getting email templates', error)
    return c.json({ success: false, error: 'Failed to get templates' }, 500)
  }
})

// Admin: Create email campaign
marketingRoutes.post('/email/campaigns', async (c) => {
  try {
    const campaignData = await c.req.json()
    const emailService = new EmailMarketingService(c.env.DB)
    
    const result = await emailService.createEmailCampaign(campaignData)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error creating email campaign', error)
    return c.json({ success: false, error: 'Failed to create campaign' }, 500)
  }
})

// Admin: Send email campaign
marketingRoutes.post('/email/campaigns/:campaignId/send', async (c) => {
  try {
    const campaignId = parseInt(c.req.param('campaignId'))
    const emailService = new EmailMarketingService(c.env.DB)
    
    const result = await emailService.sendEmailCampaign(campaignId)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error sending email campaign', error)
    return c.json({ success: false, error: 'Failed to send campaign' }, 500)
  }
})

// Admin: Get email campaigns
marketingRoutes.get('/email/campaigns', async (c) => {
  try {
    const status = c.req.query('status')
    const type = c.req.query('type')
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!) : undefined
    
    const emailService = new EmailMarketingService(c.env.DB)
    const result = await emailService.getEmailCampaigns({ status, type, limit, offset })
    
    return c.json({ success: true, ...result })
  } catch (error) {
    logger.error('Error getting email campaigns', error)
    return c.json({ success: false, error: 'Failed to get campaigns' }, 500)
  }
})

// Admin: Get campaign statistics
marketingRoutes.get('/email/campaigns/:campaignId/stats', async (c) => {
  try {
    const campaignId = parseInt(c.req.param('campaignId'))
    const emailService = new EmailMarketingService(c.env.DB)
    
    const stats = await emailService.getCampaignStats(campaignId)
    
    return c.json({ success: true, stats })
  } catch (error) {
    logger.error('Error getting campaign stats', error)
    return c.json({ success: false, error: 'Failed to get campaign stats' }, 500)
  }
})

// Track email open (tracking pixel endpoint)
marketingRoutes.get('/email/track/open/:campaignId/:subscriberId', async (c) => {
  try {
    const campaignId = parseInt(c.req.param('campaignId'))
    const subscriberId = parseInt(c.req.param('subscriberId'))
    const emailService = new EmailMarketingService(c.env.DB)
    
    await emailService.trackEmailOpen(campaignId, subscriberId)
    
    // Return transparent 1x1 pixel
    const pixel = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 
      0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00, 
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3B
    ])
    
    return new Response(pixel, {
      headers: { 'Content-Type': 'image/gif' }
    })
  } catch (error) {
    logger.error('Error tracking email open', error)
    return c.text('Error', 500)
  }
})

// Track email click
marketingRoutes.get('/email/track/click/:campaignId/:subscriberId', async (c) => {
  try {
    const campaignId = parseInt(c.req.param('campaignId'))
    const subscriberId = parseInt(c.req.param('subscriberId'))
    const redirectUrl = c.req.query('url')
    
    const emailService = new EmailMarketingService(c.env.DB)
    await emailService.trackEmailClick(campaignId, subscriberId)
    
    if (redirectUrl) {
      return c.redirect(decodeURIComponent(redirectUrl))
    }
    
    return c.text('Click tracked', 200)
  } catch (error) {
    logger.error('Error tracking email click', error)
    return c.text('Error', 500)
  }
})

// Get overall email marketing stats
marketingRoutes.get('/email/stats', async (c) => {
  try {
    const dateRange = c.req.query('start') && c.req.query('end') 
      ? { start: c.req.query('start')!, end: c.req.query('end')! } 
      : undefined
    
    const emailService = new EmailMarketingService(c.env.DB)
    const stats = await emailService.getOverallEmailStats(dateRange)
    
    return c.json({ success: true, stats })
  } catch (error) {
    logger.error('Error getting email stats', error)
    return c.json({ success: false, error: 'Failed to get email stats' }, 500)
  }
})

// ===========================================================================
// SOCIAL MEDIA ROUTES
// ===========================================================================

// Get available social platforms for login/sharing
marketingRoutes.get('/social/platforms', async (c) => {
  try {
    const socialService = new SocialMediaService(c.env.DB)
    
    const loginPlatforms = await socialService.getLoginEnabledPlatforms()
    const sharingPlatforms = await socialService.getSharingEnabledPlatforms()
    
    return c.json({ 
      success: true, 
      login_platforms: loginPlatforms,
      sharing_platforms: sharingPlatforms
    })
  } catch (error) {
    logger.error('Error getting social platforms', error)
    return c.json({ success: false, error: 'Failed to get social platforms' }, 500)
  }
})

// Generate social login URL
marketingRoutes.get('/social/login-url/:platform', async (c) => {
  try {
    const platform = c.req.param('platform')
    const redirectUri = c.req.query('redirect_uri')
    
    const socialService = new SocialMediaService(c.env.DB)
    const loginUrl = socialService.generateSocialLoginUrl(platform, redirectUri)
    
    return c.json({ success: true, login_url: loginUrl })
  } catch (error) {
    logger.error('Error generating social login URL', error)
    return c.json({ success: false, error: 'Failed to generate login URL' }, 500)
  }
})

// Process social login callback
marketingRoutes.post('/social/login', async (c) => {
  try {
    const { platform_id, social_user_id, social_data } = await c.req.json()
    const socialService = new SocialMediaService(c.env.DB)
    
    const result = await socialService.processocialLogin(platform_id, social_user_id, social_data)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error processing social login', error)
    return c.json({ success: false, error: 'Failed to process social login' }, 500)
  }
})

// Link social account to existing user
marketingRoutes.post('/social/link', async (c) => {
  try {
    const { user_id, platform_id, social_account_data } = await c.req.json()
    const socialService = new SocialMediaService(c.env.DB)
    
    const result = await socialService.linkSocialAccount(user_id, platform_id, social_account_data)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error linking social account', error)
    return c.json({ success: false, error: 'Failed to link social account' }, 500)
  }
})

// Unlink social account
marketingRoutes.delete('/social/unlink/:userId/:platformId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const platformId = parseInt(c.req.param('platformId'))
    const socialService = new SocialMediaService(c.env.DB)
    
    const result = await socialService.unlinkSocialAccount(userId, platformId)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error unlinking social account', error)
    return c.json({ success: false, error: 'Failed to unlink social account' }, 500)
  }
})

// Get user's connected social accounts
marketingRoutes.get('/social/accounts/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const socialService = new SocialMediaService(c.env.DB)
    
    const accounts = await socialService.getUserSocialAccounts(userId)
    
    return c.json({ success: true, accounts })
  } catch (error) {
    logger.error('Error getting user social accounts', error)
    return c.json({ success: false, error: 'Failed to get social accounts' }, 500)
  }
})

// Create social share
marketingRoutes.post('/social/share', async (c) => {
  try {
    const shareData = await c.req.json()
    const socialService = new SocialMediaService(c.env.DB)
    
    const result = await socialService.createSocialShare(shareData)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error creating social share', error)
    return c.json({ success: false, error: 'Failed to create social share' }, 500)
  }
})

// Track social share click
marketingRoutes.post('/social/share/:shareId/click', async (c) => {
  try {
    const shareId = parseInt(c.req.param('shareId'))
    const socialService = new SocialMediaService(c.env.DB)
    
    const result = await socialService.trackSocialShareClick(shareId)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error tracking social share click', error)
    return c.json({ success: false, error: 'Failed to track share click' }, 500)
  }
})

// Generate shareable content for different content types
marketingRoutes.post('/social/generate-share-content', async (c) => {
  try {
    const { content_type, content_id, additional_data } = await c.req.json()
    const socialService = new SocialMediaService(c.env.DB)
    
    const shareableContent = socialService.generateShareableContent(content_type, content_id, additional_data)
    
    return c.json({ success: true, content: shareableContent })
  } catch (error) {
    logger.error('Error generating shareable content', error)
    return c.json({ success: false, error: 'Failed to generate shareable content' }, 500)
  }
})

// Get social engagement statistics
marketingRoutes.get('/social/stats', async (c) => {
  try {
    const dateRange = c.req.query('start') && c.req.query('end') 
      ? { start: c.req.query('start')!, end: c.req.query('end')! } 
      : undefined
    
    const socialService = new SocialMediaService(c.env.DB)
    const stats = await socialService.getSocialEngagementStats(dateRange)
    
    return c.json({ success: true, stats })
  } catch (error) {
    logger.error('Error getting social engagement stats', error)
    return c.json({ success: false, error: 'Failed to get social stats' }, 500)
  }
})

// Get user's social sharing statistics
marketingRoutes.get('/social/user-stats/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const socialService = new SocialMediaService(c.env.DB)
    
    const stats = await socialService.getUserSocialStats(userId)
    
    return c.json({ success: true, stats })
  } catch (error) {
    logger.error('Error getting user social stats', error)
    return c.json({ success: false, error: 'Failed to get user social stats' }, 500)
  }
})

// ===========================================================================
// AFFILIATE PROGRAM ROUTES
// ===========================================================================

// Apply for affiliate program
marketingRoutes.post('/affiliate/apply', async (c) => {
  try {
    const applicationData = await c.req.json()
    const affiliateService = new AffiliateService(c.env.DB)
    
    const result = await affiliateService.applyForAffiliateProgram(applicationData)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error applying for affiliate program', error)
    return c.json({ success: false, error: 'Failed to submit affiliate application' }, 500)
  }
})

// Get affiliate by code (for validation)
marketingRoutes.get('/affiliate/by-code/:code', async (c) => {
  try {
    const code = c.req.param('code')
    const affiliateService = new AffiliateService(c.env.DB)
    
    const affiliate = await affiliateService.getAffiliateByCode(code)
    
    if (affiliate && affiliate.application_status === 'approved') {
      return c.json({ 
        success: true, 
        affiliate: {
          id: affiliate.id,
          company_name: affiliate.company_name,
          affiliate_code: affiliate.affiliate_code
        }
      })
    } else {
      return c.json({ success: false, error: 'Invalid or inactive affiliate code' }, 404)
    }
  } catch (error) {
    logger.error('Error getting affiliate by code', error)
    return c.json({ success: false, error: 'Failed to get affiliate' }, 500)
  }
})

// Track affiliate click (public endpoint)
marketingRoutes.post('/affiliate/track/click', async (c) => {
  try {
    const { affiliate_code, tracking_data } = await c.req.json()
    const affiliateService = new AffiliateService(c.env.DB)
    
    const result = await affiliateService.trackAffiliateClick(affiliate_code, tracking_data)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error tracking affiliate click', error)
    return c.json({ success: false, error: 'Failed to track affiliate click' }, 500)
  }
})

// Process affiliate signup
marketingRoutes.post('/affiliate/signup', async (c) => {
  try {
    const { referral_id, user_id } = await c.req.json()
    const affiliateService = new AffiliateService(c.env.DB)
    
    const result = await affiliateService.processAffiliateSignup(referral_id, user_id)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error processing affiliate signup', error)
    return c.json({ success: false, error: 'Failed to process affiliate signup' }, 500)
  }
})

// Process affiliate conversion
marketingRoutes.post('/affiliate/conversion', async (c) => {
  try {
    const { user_id, conversion_amount, transaction_id } = await c.req.json()
    const affiliateService = new AffiliateService(c.env.DB)
    
    const result = await affiliateService.processAffiliateConversion(user_id, conversion_amount, transaction_id)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error processing affiliate conversion', error)
    return c.json({ success: false, error: 'Failed to process affiliate conversion' }, 500)
  }
})

// Get affiliate's dashboard stats
marketingRoutes.get('/affiliate/stats/:affiliateId', async (c) => {
  try {
    const affiliateId = parseInt(c.req.param('affiliateId'))
    const dateRange = c.req.query('start') && c.req.query('end') 
      ? { start: c.req.query('start')!, end: c.req.query('end')! } 
      : undefined
    
    const affiliateService = new AffiliateService(c.env.DB)
    const stats = await affiliateService.getAffiliateStats(affiliateId, dateRange)
    
    return c.json({ success: true, stats })
  } catch (error) {
    logger.error('Error getting affiliate stats', error)
    return c.json({ success: false, error: 'Failed to get affiliate stats' }, 500)
  }
})

// Get affiliate's referrals
marketingRoutes.get('/affiliate/referrals/:affiliateId', async (c) => {
  try {
    const affiliateId = parseInt(c.req.param('affiliateId'))
    const status = c.req.query('status')
    const affiliateService = new AffiliateService(c.env.DB)
    
    const referrals = await affiliateService.getAffiliateReferrals(affiliateId, status)
    
    return c.json({ success: true, referrals })
  } catch (error) {
    logger.error('Error getting affiliate referrals', error)
    return c.json({ success: false, error: 'Failed to get affiliate referrals' }, 500)
  }
})

// Get affiliate's payment history
marketingRoutes.get('/affiliate/payments/:affiliateId', async (c) => {
  try {
    const affiliateId = parseInt(c.req.param('affiliateId'))
    const affiliateService = new AffiliateService(c.env.DB)
    
    const payments = await affiliateService.getAffiliatePayments(affiliateId)
    
    return c.json({ success: true, payments })
  } catch (error) {
    logger.error('Error getting affiliate payments', error)
    return c.json({ success: false, error: 'Failed to get affiliate payments' }, 500)
  }
})

// Admin: Get overall affiliate program statistics
marketingRoutes.get('/affiliate/overall-stats', async (c) => {
  try {
    const affiliateService = new AffiliateService(c.env.DB)
    const stats = await affiliateService.getOverallAffiliateStats()
    
    return c.json({ success: true, stats })
  } catch (error) {
    logger.error('Error getting overall affiliate stats', error)
    return c.json({ success: false, error: 'Failed to get overall affiliate stats' }, 500)
  }
})

// Admin: Get affiliate applications
marketingRoutes.get('/affiliate/applications', async (c) => {
  try {
    const status = c.req.query('status')
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!) : undefined
    
    const affiliateService = new AffiliateService(c.env.DB)
    const result = await affiliateService.getAffiliates({ status, limit, offset })
    
    return c.json({ success: true, ...result })
  } catch (error) {
    logger.error('Error getting affiliate applications', error)
    return c.json({ success: false, error: 'Failed to get affiliate applications' }, 500)
  }
})

// Admin: Approve affiliate application
marketingRoutes.post('/affiliate/approve/:affiliateId', async (c) => {
  try {
    const affiliateId = parseInt(c.req.param('affiliateId'))
    const affiliateService = new AffiliateService(c.env.DB)
    
    const result = await affiliateService.approveAffiliate(affiliateId)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error approving affiliate', error)
    return c.json({ success: false, error: 'Failed to approve affiliate' }, 500)
  }
})

// Admin: Reject affiliate application
marketingRoutes.post('/affiliate/reject/:affiliateId', async (c) => {
  try {
    const affiliateId = parseInt(c.req.param('affiliateId'))
    const { reason } = await c.req.json()
    const affiliateService = new AffiliateService(c.env.DB)
    
    const result = await affiliateService.rejectAffiliate(affiliateId, reason)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error rejecting affiliate', error)
    return c.json({ success: false, error: 'Failed to reject affiliate' }, 500)
  }
})

// Admin: Generate affiliate payment
marketingRoutes.post('/affiliate/generate-payment', async (c) => {
  try {
    const { affiliate_id, period_start, period_end } = await c.req.json()
    const affiliateService = new AffiliateService(c.env.DB)
    
    const result = await affiliateService.generateAffiliatePayment(affiliate_id, period_start, period_end)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error generating affiliate payment', error)
    return c.json({ success: false, error: 'Failed to generate affiliate payment' }, 500)
  }
})

// Admin: Process affiliate payment
marketingRoutes.post('/affiliate/process-payment/:paymentId', async (c) => {
  try {
    const paymentId = parseInt(c.req.param('paymentId'))
    const { payment_reference, payment_notes } = await c.req.json()
    const affiliateService = new AffiliateService(c.env.DB)
    
    const result = await affiliateService.processAffiliatePayment(paymentId, payment_reference, payment_notes)
    
    return c.json(result)
  } catch (error) {
    logger.error('Error processing affiliate payment', error)
    return c.json({ success: false, error: 'Failed to process affiliate payment' }, 500)
  }
})

// Admin: Get pending affiliate payments
marketingRoutes.get('/affiliate/pending-payments', async (c) => {
  try {
    const affiliateService = new AffiliateService(c.env.DB)
    const payments = await affiliateService.getPendingPayments()
    
    return c.json({ success: true, payments })
  } catch (error) {
    logger.error('Error getting pending affiliate payments', error)
    return c.json({ success: false, error: 'Failed to get pending payments' }, 500)
  }
})

// ===========================================================================
// OVERALL MARKETING ANALYTICS
// ===========================================================================

// Get comprehensive marketing dashboard stats
marketingRoutes.get('/analytics/dashboard', async (c) => {
  try {
    const dateRange = c.req.query('start') && c.req.query('end') 
      ? { start: c.req.query('start')!, end: c.req.query('end')! } 
      : undefined

    // Initialize all services
    const referralService = new ReferralService(c.env.DB)
    const promoService = new PromotionalCodesService(c.env.DB)
    const emailService = new EmailMarketingService(c.env.DB)
    const socialService = new SocialMediaService(c.env.DB)
    const affiliateService = new AffiliateService(c.env.DB)

    // Get stats from all services (parallel execution)
    const [
      emailStats,
      socialStats,
      affiliateStats
    ] = await Promise.all([
      emailService.getOverallEmailStats(dateRange),
      socialService.getSocialEngagementStats(dateRange),
      affiliateService.getOverallAffiliateStats()
    ])

    return c.json({
      success: true,
      dashboard: {
        email_marketing: emailStats,
        social_media: socialStats,
        affiliate_program: affiliateStats,
        last_updated: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.error('Error getting marketing dashboard stats', error)
    return c.json({ success: false, error: 'Failed to get marketing dashboard stats' }, 500)
  }
})

export default marketingRoutes