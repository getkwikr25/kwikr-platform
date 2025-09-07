/**
 * Review System API Routes
 * 
 * Handles all review-related API endpoints including:
 * - Client reviews for workers after service
 * - Review submission and validation
 * - Review verification
 * - Review analytics and templates
 * - Review eligibility checks
 */

import { Hono } from 'hono';
import { ReviewService, ReviewData } from '../services/ReviewService';

type Bindings = {
  DB: D1Database;
}

const reviewRoutes = new Hono<{ Bindings: Bindings }>();

/**
 * POST /api/reviews - Submit a new review (client reviewing worker)
 */
reviewRoutes.post('/', async (c) => {
  try {
    const reviewService = new ReviewService(c.env.DB);
    const reviewData: ReviewData = await c.req.json();

    // Validate required fields
    if (!reviewData.bookingId || !reviewData.reviewerId || !reviewData.revieweeId) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields: bookingId, reviewerId, revieweeId' 
      }, 400);
    }

    // Submit the review
    const result = await reviewService.submitClientReview(reviewData);

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    return c.json({
      success: true,
      message: 'Review submitted successfully',
      reviewId: result.reviewId,
      needsVerification: result.needsVerification
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to submit review' 
    }, 500);
  }
});

/**
 * GET /api/reviews/eligibility/:bookingId - Check if user can review a booking
 */
reviewRoutes.get('/eligibility/:bookingId', async (c) => {
  try {
    const reviewService = new ReviewService(c.env.DB);
    const bookingId = parseInt(c.req.param('bookingId'));
    const userId = parseInt(c.req.query('userId') || '0');
    const userType = c.req.query('userType') as 'client' | 'worker';

    if (!bookingId || !userId || !userType) {
      return c.json({ 
        success: false, 
        error: 'Missing required parameters: bookingId, userId, userType' 
      }, 400);
    }

    const eligibility = await reviewService.canUserReviewBooking(bookingId, userId, userType);

    return c.json({
      success: true,
      ...eligibility
    });

  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to check review eligibility' 
    }, 500);
  }
});

/**
 * GET /api/reviews/user/:userId - Get reviews for a specific user
 */
reviewRoutes.get('/user/:userId', async (c) => {
  try {
    const reviewService = new ReviewService(c.env.DB);
    const userId = parseInt(c.req.param('userId'));
    const userType = c.req.query('userType') as 'client' | 'worker';
    const status = c.req.query('status') || 'approved';
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');
    const includeResponses = c.req.query('includeResponses') === 'true';

    if (!userId || !userType) {
      return c.json({ 
        success: false, 
        error: 'Missing required parameters: userId, userType' 
      }, 400);
    }

    const reviews = await reviewService.getReviewsForUser(userId, userType, {
      status,
      limit,
      offset,
      includeResponses
    });

    return c.json({
      success: true,
      reviews,
      pagination: {
        limit,
        offset,
        hasMore: reviews.length === limit
      }
    });

  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch reviews' 
    }, 500);
  }
});

/**
 * GET /api/reviews/analytics/:userId - Get rating analytics for a user
 */
reviewRoutes.get('/analytics/:userId', async (c) => {
  try {
    const reviewService = new ReviewService(c.env.DB);
    const userId = parseInt(c.req.param('userId'));
    const userType = c.req.query('userType') as 'client' | 'worker';

    if (!userId || !userType) {
      return c.json({ 
        success: false, 
        error: 'Missing required parameters: userId, userType' 
      }, 400);
    }

    const analytics = await reviewService.getRatingAnalytics(userId, userType);

    if (!analytics) {
      // If no analytics exist, create default empty analytics
      await reviewService.updateRatingAnalytics(userId, userType);
      const newAnalytics = await reviewService.getRatingAnalytics(userId, userType);
      
      return c.json({
        success: true,
        analytics: newAnalytics || {
          userId,
          userType,
          totalReviews: 0,
          averageRating: 0,
          rating1Count: 0,
          rating2Count: 0,
          rating3Count: 0,
          rating4Count: 0,
          rating5Count: 0,
          verifiedReviewsCount: 0,
          verifiedReviewsAverage: 0
        }
      });
    }

    return c.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching rating analytics:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch rating analytics' 
    }, 500);
  }
});

/**
 * GET /api/reviews/templates - Get review templates
 */
reviewRoutes.get('/templates', async (c) => {
  try {
    const reviewService = new ReviewService(c.env.DB);
    const reviewerType = c.req.query('reviewerType') as 'client' | 'worker' | 'both' || 'both';
    const category = c.req.query('category');

    const templates = await reviewService.getReviewTemplates(reviewerType, category);

    return c.json({
      success: true,
      templates
    });

  } catch (error) {
    console.error('Error fetching review templates:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch review templates' 
    }, 500);
  }
});

/**
 * POST /api/reviews/verify/:token - Verify a review via email token
 */
reviewRoutes.post('/verify/:token', async (c) => {
  try {
    const reviewService = new ReviewService(c.env.DB);
    const token = c.req.param('token');

    if (!token) {
      return c.json({ 
        success: false, 
        error: 'Verification token is required' 
      }, 400);
    }

    const result = await reviewService.verifyReview(token);

    if (!result.success) {
      return c.json({ 
        success: false, 
        error: result.error 
      }, 400);
    }

    return c.json({
      success: true,
      message: 'Review verified successfully'
    });

  } catch (error) {
    console.error('Error verifying review:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to verify review' 
    }, 500);
  }
});

/**
 * PUT /api/reviews/analytics/:userId - Refresh rating analytics for a user
 */
reviewRoutes.put('/analytics/:userId', async (c) => {
  try {
    const reviewService = new ReviewService(c.env.DB);
    const userId = parseInt(c.req.param('userId'));
    const userType = c.req.query('userType') as 'client' | 'worker';

    if (!userId || !userType) {
      return c.json({ 
        success: false, 
        error: 'Missing required parameters: userId, userType' 
      }, 400);
    }

    const updated = await reviewService.updateRatingAnalytics(userId, userType);

    if (!updated) {
      return c.json({ 
        success: false, 
        error: 'Failed to update analytics' 
      }, 500);
    }

    // Fetch updated analytics
    const analytics = await reviewService.getRatingAnalytics(userId, userType);

    return c.json({
      success: true,
      message: 'Analytics updated successfully',
      analytics
    });

  } catch (error) {
    console.error('Error updating rating analytics:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to update rating analytics' 
    }, 500);
  }
});

/**
 * GET /api/reviews/client/:clientId/dashboard - Get reviews requiring client attention
 */
reviewRoutes.get('/client/:clientId/dashboard', async (c) => {
  try {
    const reviewService = new ReviewService(c.env.DB);
    const clientId = parseInt(c.req.param('clientId'));

    if (!clientId) {
      return c.json({ 
        success: false, 
        error: 'Client ID is required' 
      }, 400);
    }

    const dashboardData = await reviewService.getReviewsRequiringClientAttention(clientId);

    return c.json({
      success: true,
      ...dashboardData
    });

  } catch (error) {
    console.error('Error fetching client review dashboard:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch client review dashboard' 
    }, 500);
  }
});

/**
 * POST /api/reviews/validate - Validate review data before submission
 */
reviewRoutes.post('/validate', async (c) => {
  try {
    const reviewService = new ReviewService(c.env.DB);
    const reviewData: ReviewData = await c.req.json();

    // Use private method through instance (we'll need to make it public or add a public wrapper)
    // For now, we'll do basic validation here
    const errors: string[] = [];

    if (!reviewData.bookingId) errors.push('Booking ID is required');
    if (!reviewData.reviewerId) errors.push('Reviewer ID is required');
    if (!reviewData.revieweeId) errors.push('Reviewee ID is required');
    if (!reviewData.overallRating || reviewData.overallRating < 1 || reviewData.overallRating > 5) {
      errors.push('Overall rating must be between 1 and 5');
    }
    if (!reviewData.reviewTitle || reviewData.reviewTitle.trim().length < 5) {
      errors.push('Review title must be at least 5 characters');
    }
    if (!reviewData.reviewContent || reviewData.reviewContent.trim().length < 10) {
      errors.push('Review content must be at least 10 characters');
    }

    return c.json({
      success: true,
      isValid: errors.length === 0,
      errors,
      warnings: []
    });

  } catch (error) {
    console.error('Error validating review data:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to validate review data' 
    }, 500);
  }
});

export { reviewRoutes };