/**
 * ReviewService - Comprehensive Review and Rating System
 * 
 * Handles all review operations including:
 * - Client reviews for workers after service
 * - Worker reviews for clients (mutual rating)
 * - Review validation and verification
 * - Rating analytics calculations
 * - Review moderation workflows
 */

export interface ReviewData {
  bookingId: number;
  reviewerId: number;
  revieweeId: number;
  reviewerType: 'client' | 'worker';
  revieweeType: 'client' | 'worker';
  overallRating: number;
  qualityRating?: number;
  communicationRating?: number;
  punctualityRating?: number;
  professionalismRating?: number;
  valueRating?: number;
  reviewTitle: string;
  reviewContent: string;
  reviewImages?: string[];
}

export interface Review {
  id: number;
  bookingId: number;
  reviewerId: number;
  revieweeId: number;
  reviewerType: 'client' | 'worker';
  revieweeType: 'client' | 'worker';
  overallRating: number;
  qualityRating?: number;
  communicationRating?: number;
  punctualityRating?: number;
  professionalismRating?: number;
  valueRating?: number;
  reviewTitle: string;
  reviewContent: string;
  reviewImages?: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'hidden' | 'flagged';
  moderationReason?: string;
  moderatedBy?: number;
  moderatedAt?: string;
  isFlagged: boolean;
  flagCount: number;
  flagReasons?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ReviewAnalytics {
  userId: number;
  userType: 'client' | 'worker';
  totalReviews: number;
  averageRating: number;
  overallRatingSum: number;
  qualityAverage?: number;
  communicationAverage?: number;
  punctualityAverage?: number;
  professionalismAverage?: number;
  valueAverage?: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
  last30DaysReviews: number;
  last30DaysAverage: number;
  trendDirection?: 'up' | 'down' | 'stable' | 'new';
  trendPercentage?: number;
  verifiedReviewsCount: number;
  verifiedReviewsAverage: number;
  lastCalculatedAt: string;
}

export interface ReviewTemplate {
  id: number;
  templateName: string;
  templateCategory: 'positive' | 'negative' | 'neutral';
  reviewerType: 'client' | 'worker' | 'both';
  serviceCategory?: string;
  suggestedRating: number;
  templateTitle: string;
  templateContent: string;
  usageCount: number;
  isActive: boolean;
}

export interface ReviewValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ReviewService {
  constructor(private db: D1Database) {}

  /**
   * Submit a new client review for a worker after service completion
   */
  async submitClientReview(reviewData: ReviewData): Promise<{ success: boolean; reviewId?: number; error?: string; needsVerification?: boolean }> {
    try {
      // 1. Validate the review data
      const validation = await this.validateReview(reviewData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // 2. Check if booking exists and is completed
      const booking = await this.db.prepare(`
        SELECT id, status, client_id, user_id as worker_id 
        FROM bookings 
        WHERE id = ? AND status IN ('completed', 'paid')
      `).bind(reviewData.bookingId).first();

      if (!booking) {
        return { success: false, error: 'Booking not found or not eligible for review' };
      }

      // 3. Verify reviewer is the client for this booking
      if (reviewData.reviewerType === 'client' && booking.client_id !== reviewData.reviewerId) {
        return { success: false, error: 'You can only review your own bookings' };
      }

      // 4. Check if review already exists for this booking and reviewer
      const existingReview = await this.db.prepare(`
        SELECT id FROM reviews 
        WHERE booking_id = ? AND reviewer_id = ? AND reviewer_type = ?
      `).bind(reviewData.bookingId, reviewData.reviewerId, reviewData.reviewerType).first();

      if (existingReview) {
        return { success: false, error: 'You have already reviewed this booking' };
      }

      // 5. Generate verification token for email verification
      const verificationToken = this.generateVerificationToken();

      // 6. Insert the review
      const result = await this.db.prepare(`
        INSERT INTO reviews (
          booking_id, reviewer_id, reviewee_id, reviewer_type, reviewee_type,
          overall_rating, quality_rating, communication_rating, punctuality_rating, 
          professionalism_rating, value_rating, review_title, review_content, 
          review_images, verification_token, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `).bind(
        reviewData.bookingId,
        reviewData.reviewerId,
        reviewData.revieweeId,
        reviewData.reviewerType,
        reviewData.revieweeType,
        reviewData.overallRating,
        reviewData.qualityRating || null,
        reviewData.communicationRating || null,
        reviewData.punctualityRating || null,
        reviewData.professionalismRating || null,
        reviewData.valueRating || null,
        reviewData.reviewTitle,
        reviewData.reviewContent,
        reviewData.reviewImages ? JSON.stringify(reviewData.reviewImages) : null,
        verificationToken
      ).run();

      if (!result.success) {
        return { success: false, error: 'Failed to submit review' };
      }

      const reviewId = result.meta.last_row_id as number;

      // 7. Create verification token record
      await this.createVerificationToken(reviewId, verificationToken, reviewData.reviewerId);

      // 8. Add to moderation queue (this will be handled by database trigger)
      
      // 9. Send verification email (TODO: implement email service)
      // await this.sendVerificationEmail(reviewId, verificationToken, reviewData.reviewerId);

      return { 
        success: true, 
        reviewId, 
        needsVerification: true 
      };

    } catch (error) {
      console.error('Error submitting client review:', error);
      return { success: false, error: 'Failed to submit review due to server error' };
    }
  }

  /**
   * Validate review data before submission
   */
  private async validateReview(reviewData: ReviewData): Promise<ReviewValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!reviewData.bookingId) errors.push('Booking ID is required');
    if (!reviewData.reviewerId) errors.push('Reviewer ID is required');
    if (!reviewData.revieweeId) errors.push('Reviewee ID is required');
    if (!reviewData.reviewerType || !['client', 'worker'].includes(reviewData.reviewerType)) {
      errors.push('Valid reviewer type is required');
    }
    if (!reviewData.revieweeType || !['client', 'worker'].includes(reviewData.revieweeType)) {
      errors.push('Valid reviewee type is required');
    }

    // Rating validation
    if (!reviewData.overallRating || reviewData.overallRating < 1 || reviewData.overallRating > 5) {
      errors.push('Overall rating must be between 1 and 5');
    }

    // Optional rating validation
    const ratingFields = ['qualityRating', 'communicationRating', 'punctualityRating', 'professionalismRating', 'valueRating'];
    for (const field of ratingFields) {
      const rating = reviewData[field as keyof ReviewData] as number;
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        errors.push(`${field} must be between 1 and 5`);
      }
    }

    // Content validation
    if (!reviewData.reviewTitle || reviewData.reviewTitle.trim().length < 5) {
      errors.push('Review title must be at least 5 characters');
    }
    if (!reviewData.reviewContent || reviewData.reviewContent.trim().length < 10) {
      errors.push('Review content must be at least 10 characters');
    }

    // Content length limits
    if (reviewData.reviewTitle && reviewData.reviewTitle.length > 200) {
      errors.push('Review title cannot exceed 200 characters');
    }
    if (reviewData.reviewContent && reviewData.reviewContent.length > 5000) {
      errors.push('Review content cannot exceed 5000 characters');
    }

    // Content quality checks (warnings)
    if (reviewData.reviewContent && reviewData.reviewContent.length < 50) {
      warnings.push('Consider adding more detail to your review');
    }

    // Check for potential spam/fake content patterns
    const spamPatterns = [
      /(.)\1{10,}/, // Repeated characters
      /^[A-Z\s!]{50,}$/, // All caps
      /(fake|spam|bot|scam)/i // Spam keywords
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(reviewData.reviewContent)) {
        warnings.push('Review may be flagged for manual review due to content patterns');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get reviews for a specific user (worker or client)
   */
  async getReviewsForUser(userId: number, userType: 'client' | 'worker', options: {
    status?: string;
    limit?: number;
    offset?: number;
    includeResponses?: boolean;
  } = {}): Promise<Review[]> {
    try {
      const { status = 'approved', limit = 20, offset = 0, includeResponses = false } = options;

      let query = `
        SELECT 
          r.*,
          reviewer.first_name || ' ' || reviewer.last_name as reviewer_name,
          b.service_category,
          b.created_at as booking_date
        FROM reviews r
        JOIN users reviewer ON r.reviewer_id = reviewer.id
        JOIN bookings b ON r.booking_id = b.id
        WHERE r.reviewee_id = ? AND r.reviewee_type = ? AND r.status = ? 
        AND r.deleted_at IS NULL
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const reviews = await this.db.prepare(query)
        .bind(userId, userType, status, limit, offset)
        .all();

      if (!reviews.success) {
        return [];
      }

      const reviewsWithResponses = reviews.results as any[];

      // If responses are requested, fetch them for each review
      if (includeResponses && reviewsWithResponses.length > 0) {
        const reviewIds = reviewsWithResponses.map(r => r.id);
        const responses = await this.db.prepare(`
          SELECT 
            rr.*,
            responder.first_name || ' ' || responder.last_name as responder_name
          FROM review_responses rr
          JOIN users responder ON rr.responder_id = responder.id
          WHERE rr.review_id IN (${reviewIds.map(() => '?').join(',')}) 
          AND rr.status = 'approved'
          ORDER BY rr.created_at ASC
        `).bind(...reviewIds).all();

        if (responses.success) {
          // Group responses by review_id
          const responsesByReview = responses.results.reduce((acc: any, response: any) => {
            if (!acc[response.review_id]) acc[response.review_id] = [];
            acc[response.review_id].push(response);
            return acc;
          }, {});

          // Add responses to reviews
          reviewsWithResponses.forEach(review => {
            review.responses = responsesByReview[review.id] || [];
          });
        }
      }

      return reviewsWithResponses as Review[];
    } catch (error) {
      console.error('Error fetching reviews for user:', error);
      return [];
    }
  }

  /**
   * Get rating analytics for a user
   */
  async getRatingAnalytics(userId: number, userType: 'client' | 'worker'): Promise<ReviewAnalytics | null> {
    try {
      const analytics = await this.db.prepare(`
        SELECT * FROM rating_analytics 
        WHERE user_id = ? AND user_type = ?
      `).bind(userId, userType).first();

      return analytics as ReviewAnalytics || null;
    } catch (error) {
      console.error('Error fetching rating analytics:', error);
      return null;
    }
  }

  /**
   * Update rating analytics for a user (called after new reviews)
   */
  async updateRatingAnalytics(userId: number, userType: 'client' | 'worker'): Promise<boolean> {
    try {
      // Calculate fresh analytics from all approved reviews
      const stats = await this.db.prepare(`
        SELECT 
          COUNT(*) as total_reviews,
          AVG(CAST(overall_rating as FLOAT)) as average_rating,
          SUM(overall_rating) as overall_rating_sum,
          AVG(CAST(quality_rating as FLOAT)) as quality_average,
          AVG(CAST(communication_rating as FLOAT)) as communication_average,
          AVG(CAST(punctuality_rating as FLOAT)) as punctuality_average,
          AVG(CAST(professionalism_rating as FLOAT)) as professionalism_average,
          AVG(CAST(value_rating as FLOAT)) as value_average,
          SUM(CASE WHEN overall_rating = 1 THEN 1 ELSE 0 END) as rating_1_count,
          SUM(CASE WHEN overall_rating = 2 THEN 1 ELSE 0 END) as rating_2_count,
          SUM(CASE WHEN overall_rating = 3 THEN 1 ELSE 0 END) as rating_3_count,
          SUM(CASE WHEN overall_rating = 4 THEN 1 ELSE 0 END) as rating_4_count,
          SUM(CASE WHEN overall_rating = 5 THEN 1 ELSE 0 END) as rating_5_count,
          SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified_reviews_count,
          AVG(CASE WHEN is_verified = 1 THEN CAST(overall_rating as FLOAT) ELSE NULL END) as verified_reviews_average
        FROM reviews 
        WHERE reviewee_id = ? AND reviewee_type = ? AND status = 'approved' AND deleted_at IS NULL
      `).bind(userId, userType).first();

      if (!stats) {
        return false;
      }

      // Calculate last 30 days stats
      const last30Days = await this.db.prepare(`
        SELECT 
          COUNT(*) as last_30_days_reviews,
          AVG(CAST(overall_rating as FLOAT)) as last_30_days_average
        FROM reviews 
        WHERE reviewee_id = ? AND reviewee_type = ? AND status = 'approved' 
        AND deleted_at IS NULL
        AND created_at >= datetime('now', '-30 days')
      `).bind(userId, userType).first();

      // Insert or update analytics
      await this.db.prepare(`
        INSERT OR REPLACE INTO rating_analytics (
          user_id, user_type, total_reviews, average_rating, overall_rating_sum,
          quality_average, communication_average, punctuality_average, 
          professionalism_average, value_average,
          rating_1_count, rating_2_count, rating_3_count, rating_4_count, rating_5_count,
          last_30_days_reviews, last_30_days_average,
          verified_reviews_count, verified_reviews_average, 
          last_calculated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        userId,
        userType,
        stats.total_reviews || 0,
        Math.round((stats.average_rating || 0) * 100) / 100,
        stats.overall_rating_sum || 0,
        Math.round((stats.quality_average || 0) * 100) / 100,
        Math.round((stats.communication_average || 0) * 100) / 100,
        Math.round((stats.punctuality_average || 0) * 100) / 100,
        Math.round((stats.professionalism_average || 0) * 100) / 100,
        Math.round((stats.value_average || 0) * 100) / 100,
        stats.rating_1_count || 0,
        stats.rating_2_count || 0,
        stats.rating_3_count || 0,
        stats.rating_4_count || 0,
        stats.rating_5_count || 0,
        last30Days?.last_30_days_reviews || 0,
        Math.round((last30Days?.last_30_days_average || 0) * 100) / 100,
        stats.verified_reviews_count || 0,
        Math.round((stats.verified_reviews_average || 0) * 100) / 100
      ).run();

      return true;
    } catch (error) {
      console.error('Error updating rating analytics:', error);
      return false;
    }
  }

  /**
   * Get review templates for UI
   */
  async getReviewTemplates(reviewerType: 'client' | 'worker' | 'both', category?: string): Promise<ReviewTemplate[]> {
    try {
      let query = `
        SELECT * FROM review_templates 
        WHERE (reviewer_type = ? OR reviewer_type = 'both') 
        AND is_active = 1
      `;
      const params: any[] = [reviewerType];

      if (category) {
        query += ` AND template_category = ?`;
        params.push(category);
      }

      query += ` ORDER BY usage_count DESC, template_name ASC`;

      const templates = await this.db.prepare(query).bind(...params).all();
      
      return templates.success ? templates.results as ReviewTemplate[] : [];
    } catch (error) {
      console.error('Error fetching review templates:', error);
      return [];
    }
  }

  /**
   * Verify a review via email token
   */
  async verifyReview(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find the verification token
      const verificationToken = await this.db.prepare(`
        SELECT * FROM review_verification_tokens 
        WHERE token = ? AND verified_at IS NULL AND expires_at > CURRENT_TIMESTAMP
      `).bind(token).first();

      if (!verificationToken) {
        return { success: false, error: 'Invalid or expired verification token' };
      }

      // Update review as verified
      await this.db.prepare(`
        UPDATE reviews 
        SET is_verified = 1, verification_date = CURRENT_TIMESTAMP, status = 'approved'
        WHERE id = ?
      `).bind(verificationToken.review_id).run();

      // Mark token as used
      await this.db.prepare(`
        UPDATE review_verification_tokens 
        SET verified_at = CURRENT_TIMESTAMP 
        WHERE token = ?
      `).bind(token).run();

      // Update analytics
      const review = await this.db.prepare(`
        SELECT reviewee_id, reviewee_type FROM reviews WHERE id = ?
      `).bind(verificationToken.review_id).first();

      if (review) {
        await this.updateRatingAnalytics(review.reviewee_id, review.reviewee_type);
      }

      return { success: true };
    } catch (error) {
      console.error('Error verifying review:', error);
      return { success: false, error: 'Failed to verify review' };
    }
  }

  /**
   * Check if a user can review a specific booking
   */
  async canUserReviewBooking(bookingId: number, userId: number, userType: 'client' | 'worker'): Promise<{
    canReview: boolean;
    reason?: string;
    bookingDetails?: any;
  }> {
    try {
      // Check if booking exists and is eligible for review
      const booking = await this.db.prepare(`
        SELECT 
          id, status, client_id, user_id as worker_id, 
          service_category, created_at, updated_at
        FROM bookings 
        WHERE id = ?
      `).bind(bookingId).first();

      if (!booking) {
        return { canReview: false, reason: 'Booking not found' };
      }

      // Check if booking is completed
      if (!['completed', 'paid'].includes(booking.status)) {
        return { 
          canReview: false, 
          reason: 'Booking must be completed before it can be reviewed',
          bookingDetails: booking 
        };
      }

      // Check if user is authorized to review this booking
      const isClient = userType === 'client' && booking.client_id === userId;
      const isWorker = userType === 'worker' && booking.worker_id === userId;

      if (!isClient && !isWorker) {
        return { 
          canReview: false, 
          reason: 'You are not authorized to review this booking',
          bookingDetails: booking 
        };
      }

      // Check if review already exists
      const existingReview = await this.db.prepare(`
        SELECT id FROM reviews 
        WHERE booking_id = ? AND reviewer_id = ? AND reviewer_type = ?
      `).bind(bookingId, userId, userType).first();

      if (existingReview) {
        return { 
          canReview: false, 
          reason: 'You have already reviewed this booking',
          bookingDetails: booking 
        };
      }

      return { 
        canReview: true, 
        bookingDetails: booking 
      };
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      return { canReview: false, reason: 'Error checking review eligibility' };
    }
  }

  /**
   * Generate a secure verification token
   */
  private generateVerificationToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Create verification token record
   */
  private async createVerificationToken(reviewId: number, token: string, userId: number): Promise<void> {
    try {
      // Get user email
      const user = await this.db.prepare(`
        SELECT email FROM users WHERE id = ?
      `).bind(userId).first();

      if (!user) {
        throw new Error('User not found');
      }

      // Create token with 24 hour expiry
      await this.db.prepare(`
        INSERT INTO review_verification_tokens (
          review_id, token, email_sent_to, expires_at
        ) VALUES (?, ?, ?, datetime('now', '+24 hours'))
      `).bind(reviewId, token, user.email).run();
    } catch (error) {
      console.error('Error creating verification token:', error);
      throw error;
    }
  }

  /**
   * Get reviews requiring client attention (for dashboard)
   */
  async getReviewsRequiringClientAttention(clientId: number): Promise<{
    pendingReviews: any[];
    recentResponses: any[];
  }> {
    try {
      // Get bookings that are completed but not yet reviewed by client
      const pendingReviews = await this.db.prepare(`
        SELECT 
          b.id as booking_id,
          b.service_category,
          b.booking_date,
          b.user_id as worker_id,
          u.first_name || ' ' || u.last_name as worker_name,
          up.profile_image_url as worker_image
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN reviews r ON (b.id = r.booking_id AND r.reviewer_id = ? AND r.reviewer_type = 'client')
        WHERE b.client_id = ? 
        AND b.status IN ('completed', 'paid')
        AND r.id IS NULL
        ORDER BY b.updated_at DESC
        LIMIT 10
      `).bind(clientId, clientId).all();

      // Get recent responses to client's reviews
      const recentResponses = await this.db.prepare(`
        SELECT 
          rr.*,
          r.review_title,
          r.overall_rating,
          responder.first_name || ' ' || responder.last_name as responder_name,
          b.service_category
        FROM review_responses rr
        JOIN reviews r ON rr.review_id = r.id
        JOIN users responder ON rr.responder_id = responder.id
        JOIN bookings b ON r.booking_id = b.id
        WHERE r.reviewer_id = ? AND r.reviewer_type = 'client'
        AND rr.status = 'approved'
        AND rr.created_at > datetime('now', '-30 days')
        ORDER BY rr.created_at DESC
        LIMIT 5
      `).bind(clientId).all();

      return {
        pendingReviews: pendingReviews.success ? pendingReviews.results : [],
        recentResponses: recentResponses.success ? recentResponses.results : []
      };
    } catch (error) {
      console.error('Error fetching reviews requiring client attention:', error);
      return {
        pendingReviews: [],
        recentResponses: []
      };
    }
  }
}