import { Logger } from '../utils/logger'

export interface SocialPlatform {
  id: number
  platform_name: string
  platform_display_name: string
  client_id?: string
  client_secret?: string
  api_endpoints?: string // JSON configuration
  is_login_enabled: boolean
  is_sharing_enabled: boolean
  login_redirect_url?: string
  sharing_api_url?: string
  icon_class?: string
  sort_order: number
  is_active: boolean
}

export interface UserSocialAccount {
  id: number
  user_id: number
  platform_id: number
  social_user_id: string
  social_username?: string
  social_email?: string
  social_profile_data?: string // JSON data from social platform
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  connection_status: 'active' | 'expired' | 'revoked' | 'disconnected'
  first_connected_date: string
  last_activity_date: string
}

export interface SocialShare {
  id: number
  user_id?: number
  platform_id: number
  content_type: 'job_listing' | 'worker_profile' | 'service' | 'general'
  content_id?: number
  share_url: string
  share_title?: string
  share_description?: string
  share_image_url?: string
  share_date: string
  click_count: number
  engagement_data?: string // JSON for platform-specific metrics
}

export interface SocialLoginResult {
  success: boolean
  user_id?: number
  social_account?: UserSocialAccount
  is_new_user?: boolean
  error?: string
}

export interface ShareableContent {
  title: string
  description: string
  url: string
  image_url?: string
  hashtags?: string[]
}

export interface SocialEngagementStats {
  total_shares: number
  total_clicks: number
  platform_breakdown: Array<{
    platform_name: string
    share_count: number
    click_count: number
    engagement_rate: number
  }>
  popular_content: Array<{
    content_type: string
    content_id: number
    share_count: number
    click_count: number
    title?: string
  }>
}

export class SocialMediaService {
  private db: D1Database
  private logger: Logger

  constructor(db: D1Database) {
    this.db = db
    this.logger = new Logger('SocialMediaService')
  }

  // ===========================================================================
  // PLATFORM MANAGEMENT
  // ===========================================================================

  async createSocialPlatform(platformData: Omit<SocialPlatform, 'id'>): Promise<{ success: boolean; platform?: SocialPlatform; error?: string }> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO social_platforms (
          platform_name, platform_display_name, client_id, client_secret,
          api_endpoints, is_login_enabled, is_sharing_enabled,
          login_redirect_url, sharing_api_url, icon_class, sort_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        platformData.platform_name,
        platformData.platform_display_name,
        platformData.client_id,
        platformData.client_secret,
        platformData.api_endpoints,
        platformData.is_login_enabled,
        platformData.is_sharing_enabled,
        platformData.login_redirect_url,
        platformData.sharing_api_url,
        platformData.icon_class,
        platformData.sort_order,
        platformData.is_active
      ).run()

      const platform = await this.getSocialPlatform(result.meta.last_row_id as number)
      
      this.logger.log('Created social platform', { platformId: result.meta.last_row_id })
      return { success: true, platform: platform! }
    } catch (error) {
      this.logger.error('Error creating social platform', error)
      return { success: false, error: 'Failed to create social platform' }
    }
  }

  async getSocialPlatform(platformId: number): Promise<SocialPlatform | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM social_platforms WHERE id = ?
      `).bind(platformId).first()

      return result as SocialPlatform || null
    } catch (error) {
      this.logger.error('Error getting social platform', error)
      return null
    }
  }

  async getSocialPlatforms(enabledOnly = false): Promise<SocialPlatform[]> {
    try {
      let query = 'SELECT * FROM social_platforms'
      
      if (enabledOnly) {
        query += ' WHERE is_active = TRUE'
      }
      
      query += ' ORDER BY sort_order ASC'

      const result = await this.db.prepare(query).all()
      return result.results as SocialPlatform[]
    } catch (error) {
      this.logger.error('Error getting social platforms', error)
      return []
    }
  }

  async getLoginEnabledPlatforms(): Promise<SocialPlatform[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM social_platforms 
        WHERE is_active = TRUE AND is_login_enabled = TRUE 
        ORDER BY sort_order ASC
      `).all()

      return result.results as SocialPlatform[]
    } catch (error) {
      this.logger.error('Error getting login enabled platforms', error)
      return []
    }
  }

  async getSharingEnabledPlatforms(): Promise<SocialPlatform[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM social_platforms 
        WHERE is_active = TRUE AND is_sharing_enabled = TRUE 
        ORDER BY sort_order ASC
      `).all()

      return result.results as SocialPlatform[]
    } catch (error) {
      this.logger.error('Error getting sharing enabled platforms', error)
      return []
    }
  }

  async updateSocialPlatform(platformId: number, updates: Partial<SocialPlatform>): Promise<{ success: boolean; error?: string }> {
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ')
      const values = Object.values(updates)
      
      await this.db.prepare(`
        UPDATE social_platforms 
        SET ${setClause}, updated_at = datetime('now')
        WHERE id = ?
      `).bind(...values, platformId).run()

      this.logger.log('Updated social platform', { platformId, updates })
      return { success: true }
    } catch (error) {
      this.logger.error('Error updating social platform', error)
      return { success: false, error: 'Failed to update social platform' }
    }
  }

  // ===========================================================================
  // SOCIAL LOGIN INTEGRATION
  // ===========================================================================

  async processocialLogin(
    platformId: number, 
    socialUserId: string, 
    socialData: {
      username?: string
      email?: string
      profile_data?: any
      access_token?: string
      refresh_token?: string
      token_expires_at?: string
    }
  ): Promise<SocialLoginResult> {
    try {
      // Check if social account already exists
      const existingAccount = await this.db.prepare(`
        SELECT usa.*, u.id as user_id, u.email, u.first_name, u.last_name
        FROM user_social_accounts usa
        LEFT JOIN users u ON usa.user_id = u.id
        WHERE usa.platform_id = ? AND usa.social_user_id = ?
      `).bind(platformId, socialUserId).first() as any

      if (existingAccount) {
        // Update existing account with new tokens
        await this.updateSocialAccount(existingAccount.id, {
          access_token: socialData.access_token,
          refresh_token: socialData.refresh_token,
          token_expires_at: socialData.token_expires_at,
          connection_status: 'active',
          last_activity_date: new Date().toISOString()
        })

        return {
          success: true,
          user_id: existingAccount.user_id,
          social_account: existingAccount,
          is_new_user: false
        }
      }

      // Check if user exists by email
      let userId: number | null = null
      let isNewUser = false

      if (socialData.email) {
        const existingUser = await this.db.prepare(`
          SELECT id FROM users WHERE email = ?
        `).bind(socialData.email).first() as any

        if (existingUser) {
          userId = existingUser.id
        }
      }

      // Create new user if none exists
      if (!userId && socialData.email) {
        const userResult = await this.db.prepare(`
          INSERT INTO users (email, first_name, last_name, registration_source, email_verified)
          VALUES (?, ?, ?, 'social_login', TRUE)
        `).bind(
          socialData.email,
          socialData.profile_data?.first_name || '',
          socialData.profile_data?.last_name || '',
        ).run()

        userId = userResult.meta.last_row_id as number
        isNewUser = true
      }

      if (!userId) {
        return { success: false, error: 'Unable to create or find user account' }
      }

      // Create social account link
      const accountResult = await this.db.prepare(`
        INSERT INTO user_social_accounts (
          user_id, platform_id, social_user_id, social_username, social_email,
          social_profile_data, access_token, refresh_token, token_expires_at,
          connection_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `).bind(
        userId,
        platformId,
        socialUserId,
        socialData.username,
        socialData.email,
        JSON.stringify(socialData.profile_data),
        socialData.access_token,
        socialData.refresh_token,
        socialData.token_expires_at
      ).run()

      const socialAccount = await this.getUserSocialAccount(accountResult.meta.last_row_id as number)

      this.logger.log('Processed social login', { 
        platformId, socialUserId, userId, isNewUser, accountId: accountResult.meta.last_row_id 
      })

      return {
        success: true,
        user_id: userId,
        social_account: socialAccount!,
        is_new_user: isNewUser
      }
    } catch (error) {
      this.logger.error('Error processing social login', error)
      return { success: false, error: 'Failed to process social login' }
    }
  }

  async linkSocialAccount(userId: number, platformId: number, socialAccountData: {
    social_user_id: string
    social_username?: string
    social_email?: string
    social_profile_data?: any
    access_token?: string
    refresh_token?: string
    token_expires_at?: string
  }): Promise<{ success: boolean; account?: UserSocialAccount; error?: string }> {
    try {
      // Check if account is already linked
      const existing = await this.db.prepare(`
        SELECT id FROM user_social_accounts 
        WHERE user_id = ? AND platform_id = ?
      `).bind(userId, platformId).first()

      if (existing) {
        return { success: false, error: 'Account already linked to this platform' }
      }

      // Check if social account is linked to another user
      const conflicting = await this.db.prepare(`
        SELECT user_id FROM user_social_accounts 
        WHERE platform_id = ? AND social_user_id = ?
      `).bind(platformId, socialAccountData.social_user_id).first() as any

      if (conflicting && conflicting.user_id !== userId) {
        return { success: false, error: 'Social account is already linked to another user' }
      }

      // Create link
      const result = await this.db.prepare(`
        INSERT INTO user_social_accounts (
          user_id, platform_id, social_user_id, social_username, social_email,
          social_profile_data, access_token, refresh_token, token_expires_at,
          connection_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `).bind(
        userId,
        platformId,
        socialAccountData.social_user_id,
        socialAccountData.social_username,
        socialAccountData.social_email,
        JSON.stringify(socialAccountData.social_profile_data),
        socialAccountData.access_token,
        socialAccountData.refresh_token,
        socialAccountData.token_expires_at
      ).run()

      const account = await this.getUserSocialAccount(result.meta.last_row_id as number)
      
      this.logger.log('Linked social account', { userId, platformId, accountId: result.meta.last_row_id })
      return { success: true, account: account! }
    } catch (error) {
      this.logger.error('Error linking social account', error)
      return { success: false, error: 'Failed to link social account' }
    }
  }

  async unlinkSocialAccount(userId: number, platformId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.db.prepare(`
        UPDATE user_social_accounts 
        SET connection_status = 'disconnected', last_activity_date = datetime('now')
        WHERE user_id = ? AND platform_id = ?
      `).bind(userId, platformId).run()

      if (result.changes === 0) {
        return { success: false, error: 'Social account not found' }
      }

      this.logger.log('Unlinked social account', { userId, platformId })
      return { success: true }
    } catch (error) {
      this.logger.error('Error unlinking social account', error)
      return { success: false, error: 'Failed to unlink social account' }
    }
  }

  async getUserSocialAccounts(userId: number): Promise<UserSocialAccount[]> {
    try {
      const result = await this.db.prepare(`
        SELECT usa.*, sp.platform_display_name, sp.icon_class
        FROM user_social_accounts usa
        JOIN social_platforms sp ON usa.platform_id = sp.id
        WHERE usa.user_id = ? AND usa.connection_status = 'active'
        ORDER BY usa.first_connected_date ASC
      `).bind(userId).all()

      return result.results as any[]
    } catch (error) {
      this.logger.error('Error getting user social accounts', error)
      return []
    }
  }

  async getUserSocialAccount(accountId: number): Promise<UserSocialAccount | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM user_social_accounts WHERE id = ?
      `).bind(accountId).first()

      return result as UserSocialAccount || null
    } catch (error) {
      this.logger.error('Error getting user social account', error)
      return null
    }
  }

  async updateSocialAccount(accountId: number, updates: Partial<UserSocialAccount>): Promise<{ success: boolean; error?: string }> {
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ')
      const values = Object.values(updates)
      
      await this.db.prepare(`
        UPDATE user_social_accounts 
        SET ${setClause}
        WHERE id = ?
      `).bind(...values, accountId).run()

      this.logger.log('Updated social account', { accountId, updates })
      return { success: true }
    } catch (error) {
      this.logger.error('Error updating social account', error)
      return { success: false, error: 'Failed to update social account' }
    }
  }

  // ===========================================================================
  // SOCIAL SHARING FUNCTIONALITY
  // ===========================================================================

  async createSocialShare(shareData: Omit<SocialShare, 'id' | 'share_date' | 'click_count'>): Promise<{ success: boolean; share?: SocialShare; error?: string }> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO social_shares (
          user_id, platform_id, content_type, content_id, share_url,
          share_title, share_description, share_image_url, engagement_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        shareData.user_id,
        shareData.platform_id,
        shareData.content_type,
        shareData.content_id,
        shareData.share_url,
        shareData.share_title,
        shareData.share_description,
        shareData.share_image_url,
        shareData.engagement_data
      ).run()

      const share = await this.getSocialShare(result.meta.last_row_id as number)
      
      // Create attribution for the share
      if (shareData.user_id) {
        await this.createSocialShareAttribution(shareData.user_id, result.meta.last_row_id as number, shareData.platform_id)
      }
      
      this.logger.log('Created social share', { shareId: result.meta.last_row_id })
      return { success: true, share: share! }
    } catch (error) {
      this.logger.error('Error creating social share', error)
      return { success: false, error: 'Failed to create social share' }
    }
  }

  private async createSocialShareAttribution(userId: number, shareId: number, platformId: number): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO marketing_attributions (
          user_id, attribution_type, source_campaign_id, conversion_event,
          conversion_date, source_details
        ) VALUES (?, 'social_share', ?, 'share', datetime('now'), ?)
      `).bind(
        userId,
        shareId,
        JSON.stringify({ share_id: shareId, platform_id: platformId })
      ).run()
    } catch (error) {
      this.logger.error('Error creating social share attribution', error)
    }
  }

  async trackSocialShareClick(shareId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.db.prepare(`
        UPDATE social_shares 
        SET click_count = click_count + 1
        WHERE id = ?
      `).bind(shareId).run()

      this.logger.log('Tracked social share click', { shareId })
      return { success: true }
    } catch (error) {
      this.logger.error('Error tracking social share click', error)
      return { success: false, error: 'Failed to track social share click' }
    }
  }

  async getSocialShare(shareId: number): Promise<SocialShare | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM social_shares WHERE id = ?
      `).bind(shareId).first()

      return result as SocialShare || null
    } catch (error) {
      this.logger.error('Error getting social share', error)
      return null
    }
  }

  async getUserSocialShares(userId: number, limit = 50, offset = 0): Promise<{ shares: SocialShare[]; total: number }> {
    try {
      const sharesResult = await this.db.prepare(`
        SELECT ss.*, sp.platform_display_name, sp.icon_class
        FROM social_shares ss
        JOIN social_platforms sp ON ss.platform_id = sp.id
        WHERE ss.user_id = ?
        ORDER BY ss.share_date DESC
        LIMIT ? OFFSET ?
      `).bind(userId, limit, offset).all()

      const countResult = await this.db.prepare(`
        SELECT COUNT(*) as total FROM social_shares WHERE user_id = ?
      `).bind(userId).first() as any

      return {
        shares: sharesResult.results as any[],
        total: countResult.total || 0
      }
    } catch (error) {
      this.logger.error('Error getting user social shares', error)
      return { shares: [], total: 0 }
    }
  }

  // ===========================================================================
  // CONTENT SHARING HELPERS
  // ===========================================================================

  generateShareableContent(contentType: string, contentId: number, additionalData?: any): ShareableContent {
    const baseUrl = 'https://kwikr.directory' // In production, get from environment

    switch (contentType) {
      case 'job_listing':
        return {
          title: `Job Opportunity: ${additionalData?.title || 'Service Required'}`,
          description: `Check out this job opportunity on getKwikr. ${additionalData?.description || ''}`,
          url: `${baseUrl}/jobs/${contentId}`,
          image_url: additionalData?.image_url,
          hashtags: ['KwikrDirectory', 'Jobs', 'ServiceProviders']
        }

      case 'worker_profile':
        return {
          title: `${additionalData?.name || 'Service Provider'} - Professional Services`,
          description: `Connect with ${additionalData?.name || 'this professional'} on getKwikr for quality service solutions.`,
          url: `${baseUrl}/profile/${contentId}`,
          image_url: additionalData?.profile_image_url,
          hashtags: ['KwikrDirectory', 'ServiceProvider', 'Professional']
        }

      case 'service':
        return {
          title: `${additionalData?.service_name || 'Professional Service'} Available`,
          description: `Quality ${additionalData?.service_name || 'professional service'} available on getKwikr.`,
          url: `${baseUrl}/services/${contentId}`,
          image_url: additionalData?.service_image_url,
          hashtags: ['KwikrDirectory', 'Services', 'Professional']
        }

      default:
        return {
          title: 'getKwikr - Connect with Service Providers',
          description: 'Find trusted service providers in your area on getKwikr.',
          url: baseUrl,
          hashtags: ['KwikrDirectory', 'Services', 'LocalBusiness']
        }
    }
  }

  generateSocialShareUrl(platform: string, content: ShareableContent): string {
    const encodedUrl = encodeURIComponent(content.url)
    const encodedTitle = encodeURIComponent(content.title)
    const encodedDescription = encodeURIComponent(content.description)
    const hashtags = content.hashtags?.join(',') || ''

    switch (platform.toLowerCase()) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`

      case 'twitter':
      case 'x':
        const twitterText = `${content.title} ${content.url} ${hashtags ? '#' + hashtags.replace(/,/g, ' #') : ''}`
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`

      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`

      case 'whatsapp':
        const whatsappText = `${content.title}\n${content.description}\n${content.url}`
        return `https://wa.me/?text=${encodeURIComponent(whatsappText)}`

      case 'telegram':
        const telegramText = `${content.title}\n${content.description}\n${content.url}`
        return `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(telegramText)}`

      default:
        return content.url
    }
  }

  // ===========================================================================
  // ANALYTICS AND REPORTING
  // ===========================================================================

  async getSocialEngagementStats(dateRange?: { start: string; end: string }): Promise<SocialEngagementStats> {
    try {
      let dateCondition = ''
      const binds: any[] = []

      if (dateRange) {
        dateCondition = ' WHERE share_date BETWEEN ? AND ?'
        binds.push(dateRange.start, dateRange.end)
      }

      // Get overall stats
      const overallStats = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_shares,
          SUM(click_count) as total_clicks
        FROM social_shares${dateCondition}
      `).bind(...binds).first() as any

      // Get platform breakdown
      const platformBreakdown = await this.db.prepare(`
        SELECT 
          sp.platform_display_name as platform_name,
          COUNT(ss.id) as share_count,
          SUM(ss.click_count) as click_count,
          CASE 
            WHEN COUNT(ss.id) > 0 THEN (SUM(ss.click_count) * 100.0 / COUNT(ss.id))
            ELSE 0 
          END as engagement_rate
        FROM social_shares ss
        JOIN social_platforms sp ON ss.platform_id = sp.id${dateCondition}
        GROUP BY sp.id, sp.platform_display_name
        ORDER BY share_count DESC
      `).bind(...binds).all()

      // Get popular content
      const popularContent = await this.db.prepare(`
        SELECT 
          content_type,
          content_id,
          COUNT(*) as share_count,
          SUM(click_count) as click_count,
          share_title as title
        FROM social_shares${dateCondition}
        GROUP BY content_type, content_id
        ORDER BY share_count DESC, click_count DESC
        LIMIT 10
      `).bind(...binds).all()

      return {
        total_shares: overallStats.total_shares || 0,
        total_clicks: overallStats.total_clicks || 0,
        platform_breakdown: platformBreakdown.results as any[],
        popular_content: popularContent.results as any[]
      }
    } catch (error) {
      this.logger.error('Error getting social engagement stats', error)
      return {
        total_shares: 0,
        total_clicks: 0,
        platform_breakdown: [],
        popular_content: []
      }
    }
  }

  async getUserSocialStats(userId: number): Promise<{
    total_shares: number
    total_clicks: number
    most_shared_platform: string
    recent_shares: SocialShare[]
  }> {
    try {
      // Get user's overall stats
      const userStats = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_shares,
          SUM(click_count) as total_clicks
        FROM social_shares 
        WHERE user_id = ?
      `).bind(userId).first() as any

      // Get most shared platform
      const platformStats = await this.db.prepare(`
        SELECT sp.platform_display_name, COUNT(*) as share_count
        FROM social_shares ss
        JOIN social_platforms sp ON ss.platform_id = sp.id
        WHERE ss.user_id = ?
        GROUP BY sp.id, sp.platform_display_name
        ORDER BY share_count DESC
        LIMIT 1
      `).bind(userId).first() as any

      // Get recent shares
      const recentShares = await this.db.prepare(`
        SELECT ss.*, sp.platform_display_name
        FROM social_shares ss
        JOIN social_platforms sp ON ss.platform_id = sp.id
        WHERE ss.user_id = ?
        ORDER BY ss.share_date DESC
        LIMIT 5
      `).bind(userId).all()

      return {
        total_shares: userStats.total_shares || 0,
        total_clicks: userStats.total_clicks || 0,
        most_shared_platform: platformStats?.platform_display_name || 'None',
        recent_shares: recentShares.results as any[]
      }
    } catch (error) {
      this.logger.error('Error getting user social stats', error)
      return {
        total_shares: 0,
        total_clicks: 0,
        most_shared_platform: 'None',
        recent_shares: []
      }
    }
  }

  // ===========================================================================
  // AUTHENTICATION HELPERS
  // ===========================================================================

  generateSocialLoginUrl(platformName: string, redirectUri?: string): string {
    // This would generate OAuth URLs for different platforms
    // In a real implementation, you'd use the platform's OAuth configuration
    const baseUrl = 'https://kwikr.directory'
    const defaultRedirectUri = `${baseUrl}/auth/social/callback/${platformName}`
    const finalRedirectUri = redirectUri || defaultRedirectUri

    switch (platformName.toLowerCase()) {
      case 'facebook':
        return `https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_FACEBOOK_APP_ID&redirect_uri=${encodeURIComponent(finalRedirectUri)}&scope=email,public_profile`

      case 'google':
        return `https://accounts.google.com/oauth/authorize?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=${encodeURIComponent(finalRedirectUri)}&scope=openid%20profile%20email&response_type=code`

      case 'linkedin':
        return `https://www.linkedin.com/oauth/v2/authorization?client_id=YOUR_LINKEDIN_CLIENT_ID&redirect_uri=${encodeURIComponent(finalRedirectUri)}&scope=r_liteprofile%20r_emailaddress&response_type=code`

      default:
        return finalRedirectUri
    }
  }

  async refreshAccessToken(accountId: number): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, you would call the platform's token refresh endpoint
      // For now, we'll just update the last activity date
      await this.updateSocialAccount(accountId, {
        last_activity_date: new Date().toISOString()
      })

      this.logger.log('Refreshed access token', { accountId })
      return { success: true }
    } catch (error) {
      this.logger.error('Error refreshing access token', error)
      return { success: false, error: 'Failed to refresh access token' }
    }
  }
}