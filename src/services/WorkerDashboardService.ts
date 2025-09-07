// Worker Dashboard Service
// Comprehensive service layer for worker dashboard functionality
// Features: Job Applications, Earnings, Customers, Analytics, Availability, Portfolio

export interface JobApplication {
  id: number;
  worker_id: number;
  job_id: number;
  application_status: 'applied' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  bid_amount?: number;
  estimated_duration_hours?: number;
  proposed_start_date?: string;
  cover_letter?: string;
  portfolio_items?: string;
  certifications?: string;
  applied_at: string;
  reviewed_at?: string;
  status_changed_at: string;
  client_message?: string;
  worker_response?: string;
  last_communication_at?: string;
  application_source: string;
  is_urgent: boolean;
  priority_score: number;
  created_at: string;
  updated_at: string;
}

export interface Earnings {
  id: number;
  worker_id: number;
  transaction_type: 'job_payment' | 'bonus' | 'tip' | 'subscription_fee' | 'penalty' | 'refund' | 'adjustment';
  amount: number;
  currency: string;
  job_id?: number;
  client_id?: number;
  booking_id?: number;
  gross_amount: number;
  platform_fee: number;
  tax_amount: number;
  net_amount: number;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'disputed';
  payment_method?: string;
  payment_reference?: string;
  earned_date: string;
  paid_date?: string;
  due_date?: string;
  description?: string;
  notes?: string;
  tax_year?: number;
  is_taxable: boolean;
  tax_category?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  worker_id: number;
  client_id: number;
  relationship_status: 'active' | 'inactive' | 'blocked' | 'preferred';
  first_contact_date: string;
  last_service_date?: string;
  total_jobs_completed: number;
  total_revenue: number;
  average_job_value: number;
  average_rating?: number;
  total_reviews: number;
  preferred_service_types?: string;
  communication_preference: string;
  scheduling_preferences?: string;
  customer_notes?: string;
  tags?: string;
  typical_payment_method?: string;
  payment_terms?: string;
  credit_status: 'excellent' | 'good' | 'fair' | 'poor' | 'blocked';
  referral_source?: string;
  lifetime_value: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceAnalytics {
  id: number;
  worker_id: number;
  period_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  period_start_date: string;
  period_end_date: string;
  jobs_applied: number;
  jobs_won: number;
  jobs_completed: number;
  jobs_cancelled: number;
  win_rate: number;
  total_revenue: number;
  average_job_value: number;
  total_hours_worked: number;
  hourly_rate_average: number;
  new_customers: number;
  repeat_customers: number;
  customer_retention_rate: number;
  average_rating?: number;
  total_reviews: number;
  five_star_reviews: number;
  completion_rate: number;
  response_time_average?: number;
  turnaround_time_average?: number;
  profile_views: number;
  contact_requests: number;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
}

export interface WorkerAvailability {
  id: number;
  worker_id: number;
  availability_type: 'regular_hours' | 'time_off' | 'busy' | 'available' | 'emergency_only';
  day_of_week?: number; // 0=Sunday, 1=Monday, etc.
  specific_date?: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  is_recurring: boolean;
  recurrence_pattern?: string;
  recurrence_end_date?: string;
  max_bookings_per_slot: number;
  buffer_time_minutes: number;
  advance_booking_hours: number;
  service_types?: string;
  location_restrictions?: string;
  is_active: boolean;
  reason?: string;
  emergency_available: boolean;
  emergency_rate_multiplier: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: number;
  worker_id: number;
  item_type: 'work_sample' | 'certification' | 'license' | 'insurance' | 'testimonial' | 'before_after' | 'video' | 'document';
  title: string;
  description?: string;
  image_url?: string;
  thumbnail_url?: string;
  video_url?: string;
  document_url?: string;
  project_date?: string;
  client_name?: string;
  service_type?: string;
  project_duration_hours?: number;
  project_cost?: number;
  issuing_organization?: string;
  certification_number?: string;
  issue_date?: string;
  expiry_date?: string;
  verification_url?: string;
  is_featured: boolean;
  display_order: number;
  is_public: boolean;
  show_on_profile: boolean;
  tags?: string;
  categories?: string;
  client_permission_granted: boolean;
  client_permission_date?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  view_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardSettings {
  id: number;
  worker_id: number;
  default_view: 'overview' | 'jobs' | 'earnings' | 'customers' | 'analytics' | 'availability' | 'portfolio';
  email_new_jobs: boolean;
  email_job_updates: boolean;
  email_payments: boolean;
  email_reviews: boolean;
  sms_urgent_jobs: boolean;
  sms_payment_alerts: boolean;
  push_new_jobs: boolean;
  push_job_updates: boolean;
  push_payments: boolean;
  auto_respond_enabled: boolean;
  auto_response_message?: string;
  auto_response_delay_minutes: number;
  business_hours_start: string;
  business_hours_end: string;
  timezone: string;
  default_rate?: number;
  emergency_rate_multiplier: number;
  minimum_job_value?: number;
  allow_profile_promotion: boolean;
  accept_emergency_jobs: boolean;
  travel_radius_km: number;
  created_at: string;
  updated_at: string;
}

export interface PerformanceGoal {
  id: number;
  worker_id: number;
  goal_type: 'monthly_revenue' | 'jobs_completed' | 'new_customers' | 'rating_improvement' | 'hours_worked' | 'custom';
  goal_title: string;
  target_value: number;
  current_value: number;
  period_start: string;
  period_end: string;
  is_active: boolean;
  is_achieved: boolean;
  achievement_date?: string;
  last_calculated_at?: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardSummary {
  // Overview Stats
  totalEarnings: number;
  monthlyEarnings: number;
  pendingEarnings: number;
  totalJobs: number;
  activeApplications: number;
  completedJobs: number;
  averageRating: number;
  totalCustomers: number;
  
  // Recent Activity
  recentApplications: JobApplication[];
  recentEarnings: Earnings[];
  recentCustomers: Customer[];
  
  // Performance Metrics
  winRate: number;
  responseTime: number;
  customerSatisfaction: number;
  
  // Goals Progress
  activeGoals: PerformanceGoal[];
}

export class WorkerDashboardService {
  private db: D1Database;

  constructor(database: D1Database) {
    this.db = database;
  }

  /**
   * JOB APPLICATIONS TRACKING METHODS
   */

  async getJobApplications(workerId: number, options: {
    status?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'applied_at' | 'status_changed_at' | 'bid_amount';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<JobApplication[]> {
    const {
      status,
      limit = 20,
      offset = 0,
      sortBy = 'applied_at',
      sortOrder = 'desc'
    } = options;

    let query = `
      SELECT * FROM worker_job_applications
      WHERE worker_id = ?
    `;
    const params: any[] = [workerId];

    if (status) {
      query += ` AND application_status = ?`;
      params.push(status);
    }

    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await this.db.prepare(query).bind(...params).all();
    return result.results as JobApplication[];
  }

  async getJobApplicationById(workerId: number, applicationId: number): Promise<JobApplication | null> {
    const result = await this.db.prepare(`
      SELECT * FROM worker_job_applications
      WHERE id = ? AND worker_id = ?
    `).bind(applicationId, workerId).first();

    return result as JobApplication | null;
  }

  async createJobApplication(workerId: number, applicationData: Partial<JobApplication>): Promise<JobApplication> {
    const {
      job_id,
      bid_amount,
      estimated_duration_hours,
      proposed_start_date,
      cover_letter,
      portfolio_items,
      certifications,
      application_source = 'direct'
    } = applicationData;

    const result = await this.db.prepare(`
      INSERT INTO worker_job_applications (
        worker_id, job_id, bid_amount, estimated_duration_hours,
        proposed_start_date, cover_letter, portfolio_items, certifications,
        application_source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      workerId, job_id, bid_amount, estimated_duration_hours,
      proposed_start_date, cover_letter, portfolio_items, certifications,
      application_source
    ).run();

    if (result.success && result.meta.last_row_id) {
      return await this.getJobApplicationById(workerId, result.meta.last_row_id as number) as JobApplication;
    }

    throw new Error('Failed to create job application');
  }

  async updateJobApplication(applicationId: number, applicationData: Partial<JobApplication>): Promise<JobApplication> {
    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(applicationData)) {
      if (value !== undefined && key !== 'id' && key !== 'worker_id' && key !== 'created_at') {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    params.push(applicationId);

    await this.db.prepare(`
      UPDATE worker_job_applications
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...params).run();

    const result = await this.db.prepare(`
      SELECT * FROM worker_job_applications WHERE id = ?
    `).bind(applicationId).first();

    return result as JobApplication;
  }

  async withdrawJobApplication(workerId: number, applicationId: number): Promise<boolean> {
    const result = await this.db.prepare(`
      UPDATE worker_job_applications
      SET application_status = 'withdrawn'
      WHERE id = ? AND worker_id = ?
    `).bind(applicationId, workerId).run();

    return result.success;
  }

  /**
   * EARNINGS DASHBOARD METHODS
   */

  async getEarnings(workerId: number, options: {
    transactionType?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Earnings[]> {
    const {
      transactionType,
      paymentStatus,
      startDate,
      endDate,
      limit = 50,
      offset = 0
    } = options;

    let query = `
      SELECT * FROM worker_earnings
      WHERE worker_id = ?
    `;
    const params: any[] = [workerId];

    if (transactionType) {
      query += ` AND transaction_type = ?`;
      params.push(transactionType);
    }

    if (paymentStatus) {
      query += ` AND payment_status = ?`;
      params.push(paymentStatus);
    }

    if (startDate) {
      query += ` AND earned_date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND earned_date <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY earned_date DESC, created_at DESC`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await this.db.prepare(query).bind(...params).all();
    return result.results as Earnings[];
  }

  async getEarningsSummary(workerId: number, period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<{
    totalEarnings: number;
    totalPaid: number;
    totalPending: number;
    averageJobValue: number;
    platformFees: number;
    taxes: number;
    transactionCount: number;
  }> {
    let dateFilter = '';
    const now = new Date();
    
    switch (period) {
      case 'daily':
        dateFilter = `AND earned_date >= date('now', '-1 day')`;
        break;
      case 'weekly':
        dateFilter = `AND earned_date >= date('now', '-7 days')`;
        break;
      case 'monthly':
        dateFilter = `AND earned_date >= date('now', '-30 days')`;
        break;
      case 'yearly':
        dateFilter = `AND earned_date >= date('now', '-365 days')`;
        break;
    }

    const result = await this.db.prepare(`
      SELECT
        COALESCE(SUM(gross_amount), 0) as totalEarnings,
        COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN net_amount ELSE 0 END), 0) as totalPaid,
        COALESCE(SUM(CASE WHEN payment_status IN ('pending', 'processing') THEN net_amount ELSE 0 END), 0) as totalPending,
        COALESCE(AVG(gross_amount), 0) as averageJobValue,
        COALESCE(SUM(platform_fee), 0) as platformFees,
        COALESCE(SUM(tax_amount), 0) as taxes,
        COUNT(*) as transactionCount
      FROM worker_earnings
      WHERE worker_id = ? ${dateFilter}
    `).bind(workerId).first();

    return result as any;
  }

  async createEarningRecord(workerId: number, earningData: Partial<Earnings>): Promise<Earnings> {
    const {
      transaction_type,
      amount,
      job_id,
      client_id,
      booking_id,
      gross_amount,
      platform_fee = 0,
      tax_amount = 0,
      net_amount,
      earned_date,
      description,
      payment_method,
      currency = 'CAD'
    } = earningData;

    const result = await this.db.prepare(`
      INSERT INTO worker_earnings (
        worker_id, transaction_type, amount, job_id, client_id, booking_id,
        gross_amount, platform_fee, tax_amount, net_amount, earned_date,
        description, payment_method, currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      workerId, transaction_type, amount, job_id, client_id, booking_id,
      gross_amount, platform_fee, tax_amount, net_amount, earned_date,
      description, payment_method, currency
    ).run();

    if (result.success && result.meta.last_row_id) {
      const earning = await this.db.prepare(`
        SELECT * FROM worker_earnings WHERE id = ?
      `).bind(result.meta.last_row_id).first();
      
      return earning as Earnings;
    }

    throw new Error('Failed to create earning record');
  }

  /**
   * CUSTOMER MANAGEMENT METHODS
   */

  async getCustomers(workerId: number, options: {
    relationshipStatus?: string;
    sortBy?: 'last_service_date' | 'total_revenue' | 'total_jobs_completed';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  } = {}): Promise<Customer[]> {
    const {
      relationshipStatus,
      sortBy = 'total_revenue',
      sortOrder = 'desc',
      limit = 50,
      offset = 0
    } = options;

    let query = `
      SELECT * FROM worker_customers
      WHERE worker_id = ?
    `;
    const params: any[] = [workerId];

    if (relationshipStatus) {
      query += ` AND relationship_status = ?`;
      params.push(relationshipStatus);
    }

    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await this.db.prepare(query).bind(...params).all();
    return result.results as Customer[];
  }

  async getCustomerById(workerId: number, customerId: number): Promise<Customer | null> {
    const result = await this.db.prepare(`
      SELECT * FROM worker_customers
      WHERE id = ? AND worker_id = ?
    `).bind(customerId, workerId).first();

    return result as Customer | null;
  }

  async updateCustomer(customerId: number, customerData: Partial<Customer>): Promise<Customer> {
    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(customerData)) {
      if (value !== undefined && key !== 'id' && key !== 'worker_id' && key !== 'created_at') {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    params.push(customerId);

    await this.db.prepare(`
      UPDATE worker_customers
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...params).run();

    const result = await this.db.prepare(`
      SELECT * FROM worker_customers WHERE id = ?
    `).bind(customerId).first();

    return result as Customer;
  }

  async getTopCustomers(workerId: number, limit: number = 10): Promise<Customer[]> {
    const result = await this.db.prepare(`
      SELECT * FROM worker_customers
      WHERE worker_id = ?
      ORDER BY total_revenue DESC
      LIMIT ?
    `).bind(workerId, limit).all();

    return result.results as Customer[];
  }

  /**
   * SERVICE ANALYTICS METHODS
   */

  async getServiceAnalytics(workerId: number, options: {
    periodType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ServiceAnalytics[]> {
    const { periodType, startDate, endDate } = options;

    let query = `
      SELECT * FROM worker_service_analytics
      WHERE worker_id = ?
    `;
    const params: any[] = [workerId];

    if (periodType) {
      query += ` AND period_type = ?`;
      params.push(periodType);
    }

    if (startDate) {
      query += ` AND period_start_date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND period_end_date <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY period_start_date DESC`;

    const result = await this.db.prepare(query).bind(...params).all();
    return result.results as ServiceAnalytics[];
  }

  async getPerformanceMetrics(workerId: number): Promise<{
    winRate: number;
    completionRate: number;
    averageRating: number;
    responseTime: number;
    customerRetentionRate: number;
    revenueGrowth: number;
  }> {
    // Get latest monthly analytics
    const analytics = await this.db.prepare(`
      SELECT * FROM worker_service_analytics
      WHERE worker_id = ? AND period_type = 'monthly'
      ORDER BY period_start_date DESC
      LIMIT 2
    `).bind(workerId).all();

    const currentMonth = analytics.results[0] as ServiceAnalytics;
    const previousMonth = analytics.results[1] as ServiceAnalytics;

    const revenueGrowth = previousMonth 
      ? ((currentMonth?.total_revenue || 0) - previousMonth.total_revenue) / previousMonth.total_revenue * 100
      : 0;

    return {
      winRate: currentMonth?.win_rate || 0,
      completionRate: currentMonth?.completion_rate || 0,
      averageRating: currentMonth?.average_rating || 0,
      responseTime: currentMonth?.response_time_average || 0,
      customerRetentionRate: currentMonth?.customer_retention_rate || 0,
      revenueGrowth
    };
  }

  /**
   * AVAILABILITY MANAGEMENT METHODS
   */

  async getAvailability(workerId: number, options: {
    availabilityType?: string;
    startDate?: string;
    endDate?: string;
    includeInactive?: boolean;
  } = {}): Promise<WorkerAvailability[]> {
    const { availabilityType, startDate, endDate, includeInactive = false } = options;

    let query = `
      SELECT * FROM worker_availability
      WHERE worker_id = ?
    `;
    const params: any[] = [workerId];

    if (!includeInactive) {
      query += ` AND is_active = 1`;
    }

    if (availabilityType) {
      query += ` AND availability_type = ?`;
      params.push(availabilityType);
    }

    if (startDate || endDate) {
      query += ` AND (`;
      if (startDate) {
        query += `specific_date >= ?`;
        params.push(startDate);
      }
      if (endDate) {
        if (startDate) query += ` AND `;
        query += `specific_date <= ?`;
        params.push(endDate);
      }
      query += ` OR specific_date IS NULL)`;
    }

    query += ` ORDER BY day_of_week ASC, specific_date ASC, start_time ASC`;

    const result = await this.db.prepare(query).bind(...params).all();
    return result.results as WorkerAvailability[];
  }

  async createAvailability(workerId: number, availabilityData: Partial<WorkerAvailability>): Promise<WorkerAvailability> {
    const {
      availability_type,
      day_of_week,
      specific_date,
      start_time,
      end_time,
      is_all_day = false,
      is_recurring = true,
      max_bookings_per_slot = 1,
      buffer_time_minutes = 0,
      advance_booking_hours = 24,
      reason
    } = availabilityData;

    const result = await this.db.prepare(`
      INSERT INTO worker_availability (
        worker_id, availability_type, day_of_week, specific_date,
        start_time, end_time, is_all_day, is_recurring,
        max_bookings_per_slot, buffer_time_minutes, advance_booking_hours, reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      workerId, availability_type, day_of_week, specific_date,
      start_time, end_time, is_all_day, is_recurring,
      max_bookings_per_slot, buffer_time_minutes, advance_booking_hours, reason
    ).run();

    if (result.success && result.meta.last_row_id) {
      const availability = await this.db.prepare(`
        SELECT * FROM worker_availability WHERE id = ?
      `).bind(result.meta.last_row_id).first();
      
      return availability as WorkerAvailability;
    }

    throw new Error('Failed to create availability');
  }

  async updateAvailability(availabilityId: number, availabilityData: Partial<WorkerAvailability>): Promise<WorkerAvailability> {
    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(availabilityData)) {
      if (value !== undefined && key !== 'id' && key !== 'worker_id' && key !== 'created_at') {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    params.push(availabilityId);

    await this.db.prepare(`
      UPDATE worker_availability
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...params).run();

    const result = await this.db.prepare(`
      SELECT * FROM worker_availability WHERE id = ?
    `).bind(availabilityId).first();

    return result as WorkerAvailability;
  }

  async deleteAvailability(workerId: number, availabilityId: number): Promise<boolean> {
    const result = await this.db.prepare(`
      DELETE FROM worker_availability
      WHERE id = ? AND worker_id = ?
    `).bind(availabilityId, workerId).run();

    return result.success;
  }

  /**
   * PORTFOLIO MANAGEMENT METHODS
   */

  async getPortfolioItems(workerId: number, options: {
    itemType?: string;
    isPublic?: boolean;
    isFeatured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<PortfolioItem[]> {
    const { itemType, isPublic, isFeatured, limit = 50, offset = 0 } = options;

    let query = `
      SELECT * FROM worker_portfolio
      WHERE worker_id = ?
    `;
    const params: any[] = [workerId];

    if (itemType) {
      query += ` AND item_type = ?`;
      params.push(itemType);
    }

    if (isPublic !== undefined) {
      query += ` AND is_public = ?`;
      params.push(isPublic ? 1 : 0);
    }

    if (isFeatured !== undefined) {
      query += ` AND is_featured = ?`;
      params.push(isFeatured ? 1 : 0);
    }

    query += ` ORDER BY is_featured DESC, display_order ASC, created_at DESC`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await this.db.prepare(query).bind(...params).all();
    return result.results as PortfolioItem[];
  }

  async createPortfolioItem(workerId: number, portfolioData: Partial<PortfolioItem>): Promise<PortfolioItem> {
    const {
      item_type,
      title,
      description,
      image_url,
      video_url,
      document_url,
      service_type,
      project_date,
      issuing_organization,
      certification_number,
      issue_date,
      expiry_date,
      is_featured = false,
      is_public = true,
      show_on_profile = true
    } = portfolioData;

    const result = await this.db.prepare(`
      INSERT INTO worker_portfolio (
        worker_id, item_type, title, description, image_url, video_url,
        document_url, service_type, project_date, issuing_organization,
        certification_number, issue_date, expiry_date, is_featured,
        is_public, show_on_profile
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      workerId, item_type, title, description, image_url, video_url,
      document_url, service_type, project_date, issuing_organization,
      certification_number, issue_date, expiry_date, is_featured ? 1 : 0,
      is_public ? 1 : 0, show_on_profile ? 1 : 0
    ).run();

    if (result.success && result.meta.last_row_id) {
      const portfolio = await this.db.prepare(`
        SELECT * FROM worker_portfolio WHERE id = ?
      `).bind(result.meta.last_row_id).first();
      
      return portfolio as PortfolioItem;
    }

    throw new Error('Failed to create portfolio item');
  }

  async updatePortfolioItem(portfolioId: number, portfolioData: Partial<PortfolioItem>): Promise<PortfolioItem> {
    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(portfolioData)) {
      if (value !== undefined && key !== 'id' && key !== 'worker_id' && key !== 'created_at') {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    params.push(portfolioId);

    await this.db.prepare(`
      UPDATE worker_portfolio
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...params).run();

    const result = await this.db.prepare(`
      SELECT * FROM worker_portfolio WHERE id = ?
    `).bind(portfolioId).first();

    return result as PortfolioItem;
  }

  async deletePortfolioItem(workerId: number, portfolioId: number): Promise<boolean> {
    const result = await this.db.prepare(`
      DELETE FROM worker_portfolio
      WHERE id = ? AND worker_id = ?
    `).bind(portfolioId, workerId).run();

    return result.success;
  }

  /**
   * DASHBOARD SETTINGS METHODS
   */

  async getDashboardSettings(workerId: number): Promise<DashboardSettings | null> {
    const result = await this.db.prepare(`
      SELECT * FROM worker_dashboard_settings
      WHERE worker_id = ?
    `).bind(workerId).first();

    return result as DashboardSettings | null;
  }

  async updateDashboardSettings(workerId: number, settings: Partial<DashboardSettings>): Promise<DashboardSettings> {
    // First try to update existing settings
    const existing = await this.getDashboardSettings(workerId);
    
    if (existing) {
      const updates = [];
      const params = [];

      for (const [key, value] of Object.entries(settings)) {
        if (value !== undefined && key !== 'id' && key !== 'worker_id' && key !== 'created_at') {
          updates.push(`${key} = ?`);
          params.push(value);
        }
      }

      if (updates.length > 0) {
        params.push(workerId);
        await this.db.prepare(`
          UPDATE worker_dashboard_settings
          SET ${updates.join(', ')}
          WHERE worker_id = ?
        `).bind(...params).run();
      }
    } else {
      // Create new settings
      await this.db.prepare(`
        INSERT INTO worker_dashboard_settings (worker_id) VALUES (?)
      `).bind(workerId).run();
    }

    return await this.getDashboardSettings(workerId) as DashboardSettings;
  }

  /**
   * PERFORMANCE GOALS METHODS
   */

  async getPerformanceGoals(workerId: number, isActive: boolean = true): Promise<PerformanceGoal[]> {
    let query = `
      SELECT * FROM worker_performance_goals
      WHERE worker_id = ?
    `;
    const params: any[] = [workerId];

    if (isActive !== undefined) {
      query += ` AND is_active = ?`;
      params.push(isActive ? 1 : 0);
    }

    query += ` ORDER BY period_start DESC`;

    const result = await this.db.prepare(query).bind(...params).all();
    return result.results as PerformanceGoal[];
  }

  async createPerformanceGoal(workerId: number, goalData: Partial<PerformanceGoal>): Promise<PerformanceGoal> {
    const {
      goal_type,
      goal_title,
      target_value,
      period_start,
      period_end
    } = goalData;

    const result = await this.db.prepare(`
      INSERT INTO worker_performance_goals (
        worker_id, goal_type, goal_title, target_value, period_start, period_end
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(workerId, goal_type, goal_title, target_value, period_start, period_end).run();

    if (result.success && result.meta.last_row_id) {
      const goal = await this.db.prepare(`
        SELECT * FROM worker_performance_goals WHERE id = ?
      `).bind(result.meta.last_row_id).first();
      
      return goal as PerformanceGoal;
    }

    throw new Error('Failed to create performance goal');
  }

  /**
   * COMPREHENSIVE DASHBOARD SUMMARY
   */

  async getWorkerDashboardSummary(workerId: number): Promise<DashboardSummary> {
    // Get earnings summary
    const earningsSum = await this.getEarningsSummary(workerId, 'monthly');
    
    // Get job applications stats
    const applications = await this.getJobApplications(workerId, { limit: 5 });
    const activeApplications = applications.filter(app => 
      ['applied', 'under_review', 'shortlisted'].includes(app.application_status)
    );
    
    // Get recent earnings
    const recentEarnings = await this.getEarnings(workerId, { limit: 5 });
    
    // Get customers
    const customers = await this.getCustomers(workerId, { limit: 5 });
    
    // Get performance metrics
    const metrics = await this.getPerformanceMetrics(workerId);
    
    // Get active goals
    const goals = await this.getPerformanceGoals(workerId, true);

    return {
      // Overview Stats
      totalEarnings: earningsSum.totalEarnings,
      monthlyEarnings: earningsSum.totalPaid,
      pendingEarnings: earningsSum.totalPending,
      totalJobs: earningsSum.transactionCount,
      activeApplications: activeApplications.length,
      completedJobs: applications.filter(app => app.application_status === 'accepted').length,
      averageRating: metrics.averageRating,
      totalCustomers: customers.length,
      
      // Recent Activity
      recentApplications: applications.slice(0, 3),
      recentEarnings: recentEarnings.slice(0, 3),
      recentCustomers: customers.slice(0, 3),
      
      // Performance Metrics
      winRate: metrics.winRate,
      responseTime: metrics.responseTime,
      customerSatisfaction: metrics.averageRating,
      
      // Goals Progress
      activeGoals: goals.slice(0, 3)
    };
  }
}