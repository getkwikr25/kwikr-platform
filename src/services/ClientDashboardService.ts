/**
 * ClientDashboardService - Comprehensive Client Dashboard Management
 * 
 * Handles all client dashboard operations including:
 * - Client Profile Management - Account settings and preferences
 * - Job Management Dashboard - Posted jobs tracking and management
 * - Favorite Workers - Save and manage preferred service providers
 * - Payment Methods - Credit cards and payment options management
 * - Service History - Complete booking and service history tracking
 * - Notification Preferences - Email/SMS settings and communication preferences
 */

export interface ClientProfile {
  id?: number;
  userId: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredLanguage: string;
  timezone: string;
  communicationPreference: 'email' | 'sms' | 'both' | 'none';
  defaultServiceRadius: number;
  preferredServiceTimes?: string;
  specialInstructions?: string;
  accessibilityRequirements?: string;
  accountStatus: 'active' | 'suspended' | 'deleted' | 'pending_verification';
  privacyLevel: 'public' | 'standard' | 'private';
  marketingConsent: boolean;
  dataSharingConsent: boolean;
  identityVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface FavoriteWorker {
  id?: number;
  clientId: number;
  workerId: number;
  nickname?: string;
  favoriteCategory: string;
  notes?: string;
  priorityLevel: number;
  timesHired: number;
  lastHiredDate?: string;
  averageRating: number;
  totalSpent: number;
  isActive: boolean;
  autoInvite: boolean;
  workerName?: string;
  workerImage?: string;
}

export interface PaymentMethod {
  id?: number;
  clientId: number;
  paymentType: 'credit_card' | 'debit_card' | 'bank_account' | 'paypal' | 'apple_pay' | 'google_pay';
  provider: string;
  maskedNumber: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
  stripePaymentMethodId?: string;
  billingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country: string;
  };
  isDefault: boolean;
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'failed';
}

export interface ServiceHistoryItem {
  id?: number;
  clientId: number;
  bookingId: number;
  workerId: number;
  serviceCategory: string;
  serviceDescription?: string;
  serviceDate: string;
  durationMinutes?: number;
  quotedAmount?: number;
  finalAmount?: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'disputed';
  completionStatus: 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  clientSatisfactionScore?: number;
  wouldRehire?: boolean;
  reviewSubmitted: boolean;
  workerName?: string;
  workerImage?: string;
}

export interface NotificationPreferences {
  id?: number;
  clientId: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  
  // Job and Booking Related
  newBidNotifications: boolean;
  bookingConfirmations: boolean;
  bookingReminders: boolean;
  bookingCancellations: boolean;
  scheduleChanges: boolean;
  
  // Worker Communication
  workerMessages: boolean;
  workerUpdates: boolean;
  emergencycommunications: boolean;
  
  // Reviews and Feedback
  reviewRequests: boolean;
  reviewResponses: boolean;
  
  // Payment and Billing
  paymentConfirmations: boolean;
  paymentReminders: boolean;
  invoiceNotifications: boolean;
  refundNotifications: boolean;
  
  // Marketing and Promotions
  promotionalEmails: boolean;
  serviceRecommendations: boolean;
  seasonalOffers: boolean;
  newsletter: boolean;
  
  // System and Security
  securityAlerts: boolean;
  accountUpdates: boolean;
  policyChanges: boolean;
  systemMaintenance: boolean;
  
  // Settings
  digestFrequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  quietHoursStart: string;
  quietHoursEnd: string;
  notificationEmail?: string;
  notificationPhone?: string;
}

export interface JobPost {
  id?: number;
  clientId: number;
  jobId: number;
  postStatus: 'draft' | 'active' | 'paused' | 'closed' | 'cancelled';
  visibility: 'public' | 'private' | 'invited_only';
  priorityLevel: number;
  totalBids: number;
  activeBids: number;
  shortlistedBids: number;
  applicationDeadline?: string;
  preferredStartDate?: string;
  estimatedDurationDays?: number;
  viewsCount: number;
  inquiriesCount: number;
  applicationsCount: number;
  selectedWorkerId?: number;
  completionStatus?: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  jobTitle?: string;
  jobDescription?: string;
  budgetMin?: number;
  budgetMax?: number;
}

export interface DashboardAnalytics {
  clientId: number;
  daysSinceSignup: number;
  totalJobsPosted: number;
  totalServicesReceived: number;
  totalAmountSpent: number;
  recentJobsPosted: number;
  recentServicesReceived: number;
  recentAmountSpent: number;
  recentLogins: number;
  totalWorkersHired: number;
  favoriteWorkersCount: number;
  repeatHireRate: number;
  mostUsedServiceCategory?: string;
  serviceCategoriesUsed: number;
  averageSatisfactionRating: number;
  reviewsSubmitted: number;
  profileCompletionPercentage: number;
  lastActivityDate?: string;
  preferredBookingDay?: string;
  preferredBookingTime?: string;
  averageProjectBudget: number;
}

export class ClientDashboardService {
  constructor(private db: D1Database) {}

  // ========================================
  // CLIENT PROFILE MANAGEMENT
  // ========================================

  /**
   * Get client profile with complete information
   */
  async getClientProfile(clientId: number): Promise<ClientProfile | null> {
    try {
      const profile = await this.db.prepare(`
        SELECT 
          cp.*,
          u.first_name,
          u.last_name,
          u.email,
          u.phone
        FROM client_profiles cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.user_id = ?
      `).bind(clientId).first();

      return profile as ClientProfile || null;
    } catch (error) {
      console.error('Error fetching client profile:', error);
      return null;
    }
  }

  /**
   * Update client profile information
   */
  async updateClientProfile(clientId: number, profileData: Partial<ClientProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      // Build dynamic update query
      const fields: string[] = [];
      const values: any[] = [];

      const allowedFields = [
        'date_of_birth', 'gender', 'emergency_contact_name', 'emergency_contact_phone',
        'preferred_language', 'timezone', 'communication_preference', 'default_service_radius',
        'preferred_service_times', 'special_instructions', 'accessibility_requirements',
        'privacy_level', 'marketing_consent', 'data_sharing_consent', 'two_factor_enabled'
      ];

      for (const [key, value] of Object.entries(profileData)) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (allowedFields.includes(dbField)) {
          fields.push(`${dbField} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) {
        return { success: false, error: 'No valid fields to update' };
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(clientId);

      const query = `
        UPDATE client_profiles 
        SET ${fields.join(', ')}
        WHERE user_id = ?
      `;

      const result = await this.db.prepare(query).bind(...values).run();

      if (!result.success) {
        return { success: false, error: 'Failed to update profile' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating client profile:', error);
      return { success: false, error: 'Server error while updating profile' };
    }
  }

  // ========================================
  // FAVORITE WORKERS MANAGEMENT
  // ========================================

  /**
   * Get all favorite workers for a client
   */
  async getFavoriteWorkers(clientId: number): Promise<FavoriteWorker[]> {
    try {
      const favorites = await this.db.prepare(`
        SELECT 
          cfw.*,
          u.first_name || ' ' || u.last_name as worker_name,
          up.profile_image_url as worker_image,
          up.company_name
        FROM client_favorite_workers cfw
        JOIN users u ON cfw.worker_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE cfw.client_id = ? AND cfw.is_active = 1
        ORDER BY cfw.priority_level ASC, cfw.times_hired DESC
      `).bind(clientId).all();

      return favorites.success ? favorites.results as FavoriteWorker[] : [];
    } catch (error) {
      console.error('Error fetching favorite workers:', error);
      return [];
    }
  }

  /**
   * Add a worker to favorites
   */
  async addFavoriteWorker(clientId: number, workerId: number, favoriteData: Partial<FavoriteWorker>): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if already favorited
      const existing = await this.db.prepare(`
        SELECT id FROM client_favorite_workers 
        WHERE client_id = ? AND worker_id = ?
      `).bind(clientId, workerId).first();

      if (existing) {
        return { success: false, error: 'Worker is already in favorites' };
      }

      const result = await this.db.prepare(`
        INSERT INTO client_favorite_workers (
          client_id, worker_id, nickname, favorite_category, notes, 
          priority_level, auto_invite
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        clientId,
        workerId,
        favoriteData.nickname || null,
        favoriteData.favoriteCategory || 'quality',
        favoriteData.notes || null,
        favoriteData.priorityLevel || 1,
        favoriteData.autoInvite || false
      ).run();

      if (!result.success) {
        return { success: false, error: 'Failed to add favorite worker' };
      }

      // Update analytics
      await this.updateFavoriteWorkersCount(clientId);

      return { success: true };
    } catch (error) {
      console.error('Error adding favorite worker:', error);
      return { success: false, error: 'Server error while adding favorite' };
    }
  }

  /**
   * Remove a worker from favorites
   */
  async removeFavoriteWorker(clientId: number, workerId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.db.prepare(`
        UPDATE client_favorite_workers 
        SET is_active = 0, updated_at = CURRENT_TIMESTAMP
        WHERE client_id = ? AND worker_id = ?
      `).bind(clientId, workerId).run();

      if (!result.success) {
        return { success: false, error: 'Failed to remove favorite worker' };
      }

      // Update analytics
      await this.updateFavoriteWorkersCount(clientId);

      return { success: true };
    } catch (error) {
      console.error('Error removing favorite worker:', error);
      return { success: false, error: 'Server error while removing favorite' };
    }
  }

  // ========================================
  // PAYMENT METHODS MANAGEMENT
  // ========================================

  /**
   * Get all payment methods for a client
   */
  async getPaymentMethods(clientId: number): Promise<PaymentMethod[]> {
    try {
      const methods = await this.db.prepare(`
        SELECT * FROM client_payment_methods 
        WHERE client_id = ? AND is_active = 1
        ORDER BY is_default DESC, created_at ASC
      `).bind(clientId).all();

      return methods.success ? methods.results.map(method => ({
        ...method,
        billingAddress: {
          line1: method.billing_address_line1,
          line2: method.billing_address_line2,
          city: method.billing_city,
          province: method.billing_province,
          postalCode: method.billing_postal_code,
          country: method.billing_country
        }
      })) as PaymentMethod[] : [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(clientId: number, paymentData: Partial<PaymentMethod>): Promise<{ success: boolean; error?: string; paymentMethodId?: number }> {
    try {
      // If this is set as default, unset others
      if (paymentData.isDefault) {
        await this.db.prepare(`
          UPDATE client_payment_methods 
          SET is_default = 0 
          WHERE client_id = ? AND is_active = 1
        `).bind(clientId).run();
      }

      const result = await this.db.prepare(`
        INSERT INTO client_payment_methods (
          client_id, payment_type, provider, masked_number, expiry_month, expiry_year,
          cardholder_name, billing_address_line1, billing_address_line2, billing_city,
          billing_province, billing_postal_code, billing_country, is_default, 
          stripe_payment_method_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        clientId,
        paymentData.paymentType,
        paymentData.provider,
        paymentData.maskedNumber,
        paymentData.expiryMonth || null,
        paymentData.expiryYear || null,
        paymentData.cardholderName || null,
        paymentData.billingAddress?.line1 || null,
        paymentData.billingAddress?.line2 || null,
        paymentData.billingAddress?.city || null,
        paymentData.billingAddress?.province || null,
        paymentData.billingAddress?.postalCode || null,
        paymentData.billingAddress?.country || 'CA',
        paymentData.isDefault || false,
        paymentData.stripePaymentMethodId || null
      ).run();

      if (!result.success) {
        return { success: false, error: 'Failed to add payment method' };
      }

      return { success: true, paymentMethodId: result.meta.last_row_id as number };
    } catch (error) {
      console.error('Error adding payment method:', error);
      return { success: false, error: 'Server error while adding payment method' };
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(clientId: number, paymentMethodId: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Unset all defaults first
      await this.db.prepare(`
        UPDATE client_payment_methods 
        SET is_default = 0 
        WHERE client_id = ? AND is_active = 1
      `).bind(clientId).run();

      // Set new default
      const result = await this.db.prepare(`
        UPDATE client_payment_methods 
        SET is_default = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND client_id = ? AND is_active = 1
      `).bind(paymentMethodId, clientId).run();

      if (!result.success) {
        return { success: false, error: 'Failed to set default payment method' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      return { success: false, error: 'Server error while setting default payment method' };
    }
  }

  // ========================================
  // SERVICE HISTORY MANAGEMENT
  // ========================================

  /**
   * Get service history for a client
   */
  async getServiceHistory(clientId: number, options: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    serviceCategory?: string;
  } = {}): Promise<ServiceHistoryItem[]> {
    try {
      const { limit = 20, offset = 0, startDate, endDate, serviceCategory } = options;
      
      let query = `
        SELECT 
          csh.*,
          u.first_name || ' ' || u.last_name as worker_name,
          up.profile_image_url as worker_image
        FROM client_service_history csh
        JOIN users u ON csh.worker_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE csh.client_id = ?
      `;
      
      const params: any[] = [clientId];

      if (startDate) {
        query += ` AND csh.service_date >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND csh.service_date <= ?`;
        params.push(endDate);
      }

      if (serviceCategory) {
        query += ` AND csh.service_category = ?`;
        params.push(serviceCategory);
      }

      query += ` ORDER BY csh.service_date DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const history = await this.db.prepare(query).bind(...params).all();

      return history.success ? history.results as ServiceHistoryItem[] : [];
    } catch (error) {
      console.error('Error fetching service history:', error);
      return [];
    }
  }

  // ========================================
  // NOTIFICATION PREFERENCES MANAGEMENT
  // ========================================

  /**
   * Get notification preferences for a client
   */
  async getNotificationPreferences(clientId: number): Promise<NotificationPreferences | null> {
    try {
      const prefs = await this.db.prepare(`
        SELECT * FROM client_notification_preferences 
        WHERE client_id = ?
      `).bind(clientId).first();

      return prefs as NotificationPreferences || null;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(clientId: number, preferences: Partial<NotificationPreferences>): Promise<{ success: boolean; error?: string }> {
    try {
      // Build dynamic update query
      const fields: string[] = [];
      const values: any[] = [];

      const booleanFields = [
        'email_notifications', 'sms_notifications', 'push_notifications', 'in_app_notifications',
        'new_bid_notifications', 'booking_confirmations', 'booking_reminders', 'booking_cancellations',
        'schedule_changes', 'worker_messages', 'worker_updates', 'emergency_communications',
        'review_requests', 'review_responses', 'payment_confirmations', 'payment_reminders',
        'invoice_notifications', 'refund_notifications', 'promotional_emails', 'service_recommendations',
        'seasonal_offers', 'newsletter', 'security_alerts', 'account_updates', 'policy_changes',
        'system_maintenance'
      ];

      const otherFields = [
        'digest_frequency', 'quiet_hours_start', 'quiet_hours_end', 'notification_email', 'notification_phone'
      ];

      for (const [key, value] of Object.entries(preferences)) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (booleanFields.includes(dbField) || otherFields.includes(dbField)) {
          fields.push(`${dbField} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) {
        return { success: false, error: 'No valid fields to update' };
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(clientId);

      const query = `
        UPDATE client_notification_preferences 
        SET ${fields.join(', ')}
        WHERE client_id = ?
      `;

      const result = await this.db.prepare(query).bind(...values).run();

      if (!result.success) {
        return { success: false, error: 'Failed to update notification preferences' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return { success: false, error: 'Server error while updating preferences' };
    }
  }

  // ========================================
  // JOB MANAGEMENT DASHBOARD
  // ========================================

  /**
   * Get job posts for a client
   */
  async getJobPosts(clientId: number, options: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<JobPost[]> {
    try {
      const { status, limit = 20, offset = 0 } = options;
      
      let query = `
        SELECT 
          cjp.*,
          j.title as job_title,
          j.description as job_description,
          j.budget_min,
          j.budget_max,
          j.location,
          j.created_at as job_created_at,
          COUNT(DISTINCT b.id) as total_bids
        FROM client_job_posts cjp
        JOIN jobs j ON cjp.job_id = j.id
        LEFT JOIN bids b ON j.id = b.job_id
        WHERE cjp.client_id = ?
      `;
      
      const params: any[] = [clientId];

      if (status) {
        query += ` AND cjp.post_status = ?`;
        params.push(status);
      }

      query += ` GROUP BY cjp.id ORDER BY cjp.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const posts = await this.db.prepare(query).bind(...params).all();

      return posts.success ? posts.results as JobPost[] : [];
    } catch (error) {
      console.error('Error fetching job posts:', error);
      return [];
    }
  }

  // ========================================
  // DASHBOARD ANALYTICS
  // ========================================

  /**
   * Get dashboard analytics for a client
   */
  async getDashboardAnalytics(clientId: number): Promise<DashboardAnalytics | null> {
    try {
      const analytics = await this.db.prepare(`
        SELECT * FROM client_dashboard_analytics 
        WHERE client_id = ?
      `).bind(clientId).first();

      return analytics as DashboardAnalytics || null;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      return null;
    }
  }

  /**
   * Update dashboard analytics (refresh calculations)
   */
  async updateDashboardAnalytics(clientId: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Calculate fresh analytics
      const stats = await this.db.prepare(`
        SELECT 
          COUNT(DISTINCT j.id) as total_jobs_posted,
          COUNT(DISTINCT csh.id) as total_services_received,
          COALESCE(SUM(csh.final_amount), 0) as total_amount_spent,
          COUNT(DISTINCT csh.worker_id) as total_workers_hired,
          AVG(CAST(csh.client_satisfaction_score as FLOAT)) as avg_satisfaction
        FROM users u
        LEFT JOIN jobs j ON u.id = j.client_id
        LEFT JOIN client_service_history csh ON u.id = csh.client_id
        WHERE u.id = ?
      `).bind(clientId).first();

      // Calculate recent stats (last 30 days)
      const recentStats = await this.db.prepare(`
        SELECT 
          COUNT(DISTINCT j.id) as recent_jobs_posted,
          COUNT(DISTINCT csh.id) as recent_services_received,
          COALESCE(SUM(csh.final_amount), 0) as recent_amount_spent
        FROM users u
        LEFT JOIN jobs j ON u.id = j.client_id AND j.created_at >= datetime('now', '-30 days')
        LEFT JOIN client_service_history csh ON u.id = csh.client_id AND csh.service_date >= date('now', '-30 days')
        WHERE u.id = ?
      `).bind(clientId).first();

      // Get favorite workers count
      const favoritesCount = await this.db.prepare(`
        SELECT COUNT(*) as count FROM client_favorite_workers 
        WHERE client_id = ? AND is_active = 1
      `).bind(clientId).first();

      // Update analytics record
      await this.db.prepare(`
        UPDATE client_dashboard_analytics 
        SET 
          total_jobs_posted = ?,
          total_services_received = ?,
          total_amount_spent = ?,
          recent_jobs_posted = ?,
          recent_services_received = ?,
          recent_amount_spent = ?,
          total_workers_hired = ?,
          favorite_workers_count = ?,
          average_satisfaction_rating = ?,
          last_calculated_at = CURRENT_TIMESTAMP
        WHERE client_id = ?
      `).bind(
        stats?.total_jobs_posted || 0,
        stats?.total_services_received || 0,
        stats?.total_amount_spent || 0,
        recentStats?.recent_jobs_posted || 0,
        recentStats?.recent_services_received || 0,
        recentStats?.recent_amount_spent || 0,
        stats?.total_workers_hired || 0,
        favoritesCount?.count || 0,
        Math.round((stats?.avg_satisfaction || 0) * 100) / 100,
        clientId
      ).run();

      return { success: true };
    } catch (error) {
      console.error('Error updating dashboard analytics:', error);
      return { success: false, error: 'Failed to update analytics' };
    }
  }

  /**
   * Get complete dashboard summary for a client
   */
  async getClientDashboardSummary(clientId: number): Promise<{
    profile: ClientProfile | null;
    analytics: DashboardAnalytics | null;
    recentHistory: ServiceHistoryItem[];
    activeJobs: JobPost[];
    favoriteWorkers: FavoriteWorker[];
    paymentMethods: PaymentMethod[];
    notifications: NotificationPreferences | null;
  }> {
    try {
      const [
        profile,
        analytics,
        recentHistory,
        activeJobs,
        favoriteWorkers,
        paymentMethods,
        notifications
      ] = await Promise.all([
        this.getClientProfile(clientId),
        this.getDashboardAnalytics(clientId),
        this.getServiceHistory(clientId, { limit: 5 }),
        this.getJobPosts(clientId, { status: 'active', limit: 5 }),
        this.getFavoriteWorkers(clientId),
        this.getPaymentMethods(clientId),
        this.getNotificationPreferences(clientId)
      ]);

      return {
        profile,
        analytics,
        recentHistory,
        activeJobs,
        favoriteWorkers,
        paymentMethods,
        notifications
      };
    } catch (error) {
      console.error('Error fetching client dashboard summary:', error);
      return {
        profile: null,
        analytics: null,
        recentHistory: [],
        activeJobs: [],
        favoriteWorkers: [],
        paymentMethods: [],
        notifications: null
      };
    }
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  /**
   * Update favorite workers count in analytics
   */
  private async updateFavoriteWorkersCount(clientId: number): Promise<void> {
    try {
      const count = await this.db.prepare(`
        SELECT COUNT(*) as count FROM client_favorite_workers 
        WHERE client_id = ? AND is_active = 1
      `).bind(clientId).first();

      await this.db.prepare(`
        UPDATE client_dashboard_analytics 
        SET favorite_workers_count = ?, last_calculated_at = CURRENT_TIMESTAMP
        WHERE client_id = ?
      `).bind(count?.count || 0, clientId).run();
    } catch (error) {
      console.error('Error updating favorite workers count:', error);
    }
  }
}