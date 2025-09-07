-- =============================================================================
-- REVIEW & RATING SYSTEM DATABASE SCHEMA
-- =============================================================================
-- This migration creates comprehensive review and rating system with:
-- 1. Mutual reviews (clients rate workers, workers rate clients)
-- 2. Review moderation and approval system
-- 3. Review responses and conversations
-- 4. Rating analytics and trend tracking
-- 5. Review verification (only verified bookings can be reviewed)
-- 6. Comprehensive audit trails and reporting
-- =============================================================================

-- Reviews Table (Main review storage)
-- Supports both client-to-worker and worker-to-client reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL, -- User who writes the review
    reviewee_id INTEGER NOT NULL, -- User being reviewed
    reviewer_type TEXT NOT NULL CHECK (reviewer_type IN ('client', 'worker')), -- Type of reviewer
    reviewee_type TEXT NOT NULL CHECK (reviewee_type IN ('client', 'worker')), -- Type of person being reviewed
    
    -- Rating and Content
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    
    review_title TEXT NOT NULL,
    review_content TEXT NOT NULL,
    review_images TEXT, -- JSON array of image URLs
    
    -- Verification and Status
    is_verified BOOLEAN DEFAULT FALSE, -- Verified purchase review
    verification_token TEXT, -- Token for email verification
    verification_date DATETIME,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden', 'flagged')),
    
    -- Moderation
    moderation_reason TEXT,
    moderated_by INTEGER, -- Admin user ID who moderated
    moderated_at DATETIME,
    
    -- Flags and Reports
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_count INTEGER DEFAULT 0,
    flag_reasons TEXT, -- JSON array of flag reasons
    
    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    -- Foreign keys
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewee_id) REFERENCES users(id),
    FOREIGN KEY (moderated_by) REFERENCES users(id)
);

-- Review Responses (Workers/Clients can respond to reviews)
CREATE TABLE IF NOT EXISTS review_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL,
    responder_id INTEGER NOT NULL, -- User responding to the review
    response_content TEXT NOT NULL,
    
    -- Status and Moderation
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
    moderation_reason TEXT,
    moderated_by INTEGER,
    moderated_at DATETIME,
    
    -- Flags
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_count INTEGER DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id),
    FOREIGN KEY (responder_id) REFERENCES users(id),
    FOREIGN KEY (moderated_by) REFERENCES users(id)
);

-- Review Flags/Reports (Users can report inappropriate reviews)
CREATE TABLE IF NOT EXISTS review_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER,
    response_id INTEGER, -- Can flag reviews OR responses
    flagger_id INTEGER NOT NULL,
    flag_reason TEXT NOT NULL CHECK (flag_reason IN ('inappropriate', 'spam', 'fake', 'offensive', 'harassment', 'other')),
    flag_description TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'upheld')),
    reviewed_by INTEGER,
    reviewed_at DATETIME,
    resolution_notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id),
    FOREIGN KEY (response_id) REFERENCES review_responses(id),
    FOREIGN KEY (flagger_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Review Helpfulness (Users can mark reviews as helpful/unhelpful)
CREATE TABLE IF NOT EXISTS review_helpfulness (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    is_helpful BOOLEAN NOT NULL, -- TRUE = helpful, FALSE = not helpful
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    
    -- Prevent duplicate votes from same user
    UNIQUE(review_id, user_id)
);

-- Rating Analytics (Pre-computed rating statistics)
CREATE TABLE IF NOT EXISTS rating_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('client', 'worker')),
    
    -- Overall Stats
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    overall_rating_sum INTEGER DEFAULT 0,
    
    -- Detailed Rating Breakdown
    quality_average DECIMAL(3,2) DEFAULT 0.00,
    communication_average DECIMAL(3,2) DEFAULT 0.00,
    punctuality_average DECIMAL(3,2) DEFAULT 0.00,
    professionalism_average DECIMAL(3,2) DEFAULT 0.00,
    value_average DECIMAL(3,2) DEFAULT 0.00,
    
    -- Rating Distribution (1-5 stars)
    rating_1_count INTEGER DEFAULT 0,
    rating_2_count INTEGER DEFAULT 0,
    rating_3_count INTEGER DEFAULT 0,
    rating_4_count INTEGER DEFAULT 0,
    rating_5_count INTEGER DEFAULT 0,
    
    -- Time-based Analytics
    last_30_days_reviews INTEGER DEFAULT 0,
    last_30_days_average DECIMAL(3,2) DEFAULT 0.00,
    trend_direction TEXT CHECK (trend_direction IN ('up', 'down', 'stable', 'new')),
    trend_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Verification Stats
    verified_reviews_count INTEGER DEFAULT 0,
    verified_reviews_average DECIMAL(3,2) DEFAULT 0.00,
    
    last_calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    
    -- One analytics record per user per type
    UNIQUE(user_id, user_type)
);

-- Review Templates (Pre-made review templates for common scenarios)
CREATE TABLE IF NOT EXISTS review_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT NOT NULL,
    template_category TEXT NOT NULL, -- 'positive', 'negative', 'neutral'
    reviewer_type TEXT NOT NULL CHECK (reviewer_type IN ('client', 'worker', 'both')),
    service_category TEXT, -- Optional: specific to service type
    
    suggested_rating INTEGER CHECK (suggested_rating >= 1 AND suggested_rating <= 5),
    template_title TEXT NOT NULL,
    template_content TEXT NOT NULL,
    
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER, -- Admin who created template
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Review Moderation Queue (Track moderation workflow)
CREATE TABLE IF NOT EXISTS review_moderation_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER,
    response_id INTEGER, -- Can moderate reviews OR responses
    queue_type TEXT NOT NULL CHECK (queue_type IN ('new_review', 'new_response', 'flagged_review', 'flagged_response', 'appeal')),
    
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    assigned_moderator_id INTEGER,
    
    -- Queue Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed', 'escalated')),
    escalation_reason TEXT,
    
    -- Timing
    assigned_at DATETIME,
    review_started_at DATETIME,
    completed_at DATETIME,
    
    -- Notes
    moderator_notes TEXT,
    automated_flags TEXT, -- JSON of automated flag reasons
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id),
    FOREIGN KEY (response_id) REFERENCES review_responses(id),
    FOREIGN KEY (assigned_moderator_id) REFERENCES users(id)
);

-- Review Reminders (Track review invitation/reminder campaigns)
CREATE TABLE IF NOT EXISTS review_reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL, -- User who should write the review
    user_type TEXT NOT NULL CHECK (user_type IN ('client', 'worker')),
    
    -- Reminder Status
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('initial', 'followup_1', 'followup_2', 'final')),
    sent_at DATETIME,
    opened_at DATETIME,
    clicked_at DATETIME,
    
    -- Email/Notification Details
    email_subject TEXT,
    email_template TEXT,
    reminder_token TEXT, -- Unique token for tracking
    
    -- Results
    resulted_in_review BOOLEAN DEFAULT FALSE,
    review_id INTEGER,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (review_id) REFERENCES reviews(id)
);

-- Review Verification Tokens (For email verification of reviews)
CREATE TABLE IF NOT EXISTS review_verification_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    email_sent_to TEXT NOT NULL,
    
    expires_at DATETIME NOT NULL,
    verified_at DATETIME,
    verification_ip TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_overall_rating ON reviews(overall_rating);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(is_verified);
CREATE INDEX IF NOT EXISTS idx_reviews_flagged ON reviews(is_flagged);

-- Compound indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_status ON reviews(reviewee_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_type_status ON reviews(reviewee_id, reviewee_type, status);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_reviewer ON reviews(booking_id, reviewer_id);

-- Review responses indexes
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_responder_id ON review_responses(responder_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_status ON review_responses(status);

-- Review flags indexes
CREATE INDEX IF NOT EXISTS idx_review_flags_review_id ON review_flags(review_id);
CREATE INDEX IF NOT EXISTS idx_review_flags_flagger_id ON review_flags(flagger_id);
CREATE INDEX IF NOT EXISTS idx_review_flags_status ON review_flags(status);

-- Rating analytics indexes
CREATE INDEX IF NOT EXISTS idx_rating_analytics_user_id ON rating_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_rating_analytics_user_type ON rating_analytics(user_type);
CREATE INDEX IF NOT EXISTS idx_rating_analytics_average_rating ON rating_analytics(average_rating);

-- Review moderation queue indexes
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON review_moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_priority ON review_moderation_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_assigned ON review_moderation_queue(assigned_moderator_id);

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert sample review templates
INSERT OR IGNORE INTO review_templates (template_name, template_category, reviewer_type, template_title, template_content, suggested_rating) VALUES
('Excellent Service - Client', 'positive', 'client', 'Outstanding Work!', 'The service provider did an excellent job. Professional, punctual, and delivered exactly what was promised. Highly recommended!', 5),
('Good Service - Client', 'positive', 'client', 'Very Satisfied', 'Great work overall. The service was completed on time and to a high standard. Would hire again.', 4),
('Average Service - Client', 'neutral', 'client', 'Decent Work', 'The job was completed as requested. Nothing exceptional but no major issues either.', 3),
('Poor Service - Client', 'negative', 'client', 'Disappointed', 'The work did not meet expectations. There were issues with quality and communication.', 2),

('Great Client - Worker', 'positive', 'worker', 'Wonderful Client!', 'Client was clear about requirements, respectful, and paid promptly. A pleasure to work with!', 5),
('Good Client - Worker', 'positive', 'worker', 'Professional Client', 'Client communicated well and was understanding. Easy to work with.', 4),
('Difficult Client - Worker', 'negative', 'worker', 'Challenging Experience', 'Client was demanding and changed requirements frequently. Communication could have been better.', 2);

-- Initialize rating analytics for existing users (if any)
-- This would typically be run as a data migration
-- INSERT INTO rating_analytics (user_id, user_type) 
-- SELECT id, role FROM users WHERE role IN ('client', 'worker');

-- =============================================================================
-- VIEWS FOR EASY QUERYING
-- =============================================================================

-- View for approved reviews with reviewer information
CREATE VIEW IF NOT EXISTS approved_reviews_view AS
SELECT 
    r.*,
    reviewer.first_name || ' ' || reviewer.last_name AS reviewer_name,
    reviewer.profile_image_url AS reviewer_image,
    reviewee.first_name || ' ' || reviewee.last_name AS reviewee_name,
    b.service_category,
    b.created_at AS booking_date,
    COUNT(rh.id) AS helpfulness_votes,
    SUM(CASE WHEN rh.is_helpful = 1 THEN 1 ELSE 0 END) AS helpful_votes,
    resp.response_content AS response_content,
    resp.created_at AS response_date
FROM reviews r
JOIN users reviewer ON r.reviewer_id = reviewer.id
JOIN users reviewee ON r.reviewee_id = reviewee.id
JOIN bookings b ON r.booking_id = b.id
LEFT JOIN review_helpfulness rh ON r.id = rh.review_id
LEFT JOIN review_responses resp ON r.id = resp.review_id AND resp.status = 'approved'
WHERE r.status = 'approved' AND r.deleted_at IS NULL
GROUP BY r.id;

-- View for moderation queue with priority scoring
CREATE VIEW IF NOT EXISTS moderation_queue_view AS
SELECT 
    mq.*,
    r.overall_rating,
    r.review_content,
    r.flag_count,
    r.created_at AS review_created,
    reviewer.first_name || ' ' || reviewer.last_name AS reviewer_name,
    reviewee.first_name || ' ' || reviewee.last_name AS reviewee_name,
    CASE 
        WHEN r.flag_count > 5 THEN mq.priority + 50
        WHEN r.overall_rating = 1 THEN mq.priority + 20
        WHEN r.is_verified = 0 THEN mq.priority + 10
        ELSE mq.priority
    END AS calculated_priority
FROM review_moderation_queue mq
LEFT JOIN reviews r ON mq.review_id = r.id
LEFT JOIN users reviewer ON r.reviewer_id = reviewer.id
LEFT JOIN users reviewee ON r.reviewee_id = reviewee.id
WHERE mq.status IN ('pending', 'in_review');

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Trigger to update rating analytics when reviews are added/updated
CREATE TRIGGER IF NOT EXISTS update_rating_analytics_on_review_change
AFTER INSERT ON reviews
WHEN NEW.status = 'approved'
BEGIN
    -- Update analytics for the reviewee (person being reviewed)
    INSERT OR REPLACE INTO rating_analytics (
        user_id, user_type, total_reviews, average_rating, overall_rating_sum,
        quality_average, communication_average, punctuality_average, 
        professionalism_average, value_average,
        rating_1_count, rating_2_count, rating_3_count, rating_4_count, rating_5_count,
        verified_reviews_count, verified_reviews_average, last_calculated_at
    )
    SELECT 
        NEW.reviewee_id,
        NEW.reviewee_type,
        COUNT(*) as total_reviews,
        ROUND(AVG(CAST(overall_rating as FLOAT)), 2) as average_rating,
        SUM(overall_rating) as overall_rating_sum,
        ROUND(AVG(CAST(quality_rating as FLOAT)), 2) as quality_average,
        ROUND(AVG(CAST(communication_rating as FLOAT)), 2) as communication_average,
        ROUND(AVG(CAST(punctuality_rating as FLOAT)), 2) as punctuality_average,
        ROUND(AVG(CAST(professionalism_rating as FLOAT)), 2) as professionalism_average,
        ROUND(AVG(CAST(value_rating as FLOAT)), 2) as value_average,
        SUM(CASE WHEN overall_rating = 1 THEN 1 ELSE 0 END) as rating_1_count,
        SUM(CASE WHEN overall_rating = 2 THEN 1 ELSE 0 END) as rating_2_count,
        SUM(CASE WHEN overall_rating = 3 THEN 1 ELSE 0 END) as rating_3_count,
        SUM(CASE WHEN overall_rating = 4 THEN 1 ELSE 0 END) as rating_4_count,
        SUM(CASE WHEN overall_rating = 5 THEN 1 ELSE 0 END) as rating_5_count,
        SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified_reviews_count,
        ROUND(AVG(CASE WHEN is_verified = 1 THEN CAST(overall_rating as FLOAT) ELSE NULL END), 2) as verified_reviews_average,
        CURRENT_TIMESTAMP
    FROM reviews 
    WHERE reviewee_id = NEW.reviewee_id 
    AND reviewee_type = NEW.reviewee_type 
    AND status = 'approved' 
    AND deleted_at IS NULL;
END;

-- Trigger to add new reviews to moderation queue
CREATE TRIGGER IF NOT EXISTS add_review_to_moderation_queue
AFTER INSERT ON reviews
BEGIN
    INSERT INTO review_moderation_queue (
        review_id, queue_type, priority, automated_flags
    ) VALUES (
        NEW.id, 
        'new_review',
        CASE 
            WHEN NEW.overall_rating <= 2 THEN 20  -- Higher priority for low ratings
            WHEN NEW.is_verified = 0 THEN 10      -- Medium priority for unverified
            ELSE 0                                -- Normal priority
        END,
        CASE 
            WHEN LENGTH(NEW.review_content) < 10 THEN '["short_content"]'
            WHEN NEW.review_content LIKE '%spam%' OR NEW.review_content LIKE '%fake%' THEN '["potential_spam"]'
            ELSE '[]'
        END
    );
END;

-- =============================================================================
-- SCHEMA COMPLETE
-- =============================================================================