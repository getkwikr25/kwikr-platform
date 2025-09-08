-- Accurate and Intelligent Chatbot Knowledge Base
DELETE FROM chatbot_knowledge;

-- PRICING QUESTIONS - HELPFUL BUT NOT SPECIFIC
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('office_cleaning_pricing', 
 '["average price", "cost", "office cleaner", "office cleaning", "cleaning price", "how much", "price range"]',
 '["average price for office cleaner", "cost of office cleaning", "office cleaning rates", "how much office cleaning"]',
 'Office cleaning prices vary significantly based on factors like office size, frequency, location, and specific services needed. To get accurate pricing for your office, post a free job with your requirements and local cleaners will provide competitive quotes tailored to your needs. This ensures you get current market rates for your specific situation rather than outdated averages.',
 10),

('general_pricing_questions', 
 '["average price", "typical cost", "price range", "how much does", "what does it cost", "pricing"]',
 '["average price for", "typical cost of", "price range for", "how much does it cost"]',
 'Pricing varies significantly based on project scope, location, materials, and timing. Rather than providing potentially outdated averages, we recommend posting a free job to get current competitive quotes from qualified professionals in your area. This way you get accurate pricing specific to your project requirements and local market conditions.',
 9),

-- GENERAL SERVICE AVAILABILITY - NO FALSE CLAIMS
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('general_cleaners', 
 '["cleaners", "cleaning services", "housekeeping", "maid service", "janitorial"]',
 '["cleaners available", "cleaning services", "find cleaners", "housekeeping services"]',
 'Yes, cleaning services are available through our platform across Canada. We work with professional cleaners who offer various services including residential cleaning, office cleaning, and specialized cleaning. To find available cleaners in your specific area, post a free job describing your cleaning needs, and local professionals will submit competitive bids.',
 9),

('service_availability_general', 
 '["do you have", "available", "services available", "contractors available"]',
 '["do you have services", "contractors available", "services in my area"]',
 'Kwikr connects you with service providers across Canada in over 50 categories. Service availability depends on your location and specific needs. The most accurate way to check availability in your area is to post a free job describing what you need. Local professionals will respond if they can help with your project.',
 8),

-- FINDING CONTRACTORS - ACCURATE AND HELPFUL
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('finding_contractors', 
 '["find contractor", "find service provider", "search workers", "hire someone"]',
 '["how do i find a contractor", "how to find service providers", "search for contractors"]',
 'The most effective way to find qualified contractors is to post a free job describing your project. This allows local professionals to review your requirements and submit competitive proposals. You can then compare their profiles, ratings, and pricing to choose the best fit for your needs.',
 10),

-- PLATFORM OVERVIEW - ACCURATE
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('platform_overview', 
 '["kwikr", "platform", "what is", "about", "overview"]',
 '["what is kwikr", "tell me about kwikr", "what does kwikr do"]',
 'Kwikr is a Canadian marketplace that connects clients with service providers across multiple categories including home services, business services, and professional consulting. Our platform allows you to post jobs for free and receive competitive bids from verified professionals in your area.',
 10),

-- JOB POSTING PROCESS
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('posting_jobs', 
 '["post job", "create job", "job posting", "hire workers"]',
 '["how to post a job", "create job posting", "post project"]',
 'Posting a job is straightforward and free. Describe your project requirements, set your preferred timeline, and indicate your budget range if you have one. Local service providers will review your job and submit proposals. You can then compare their qualifications and pricing to make an informed decision.',
 9),

-- PRICING STRUCTURE - CLEAR AND ACCURATE
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('platform_pricing', 
 '["fees", "commission", "cost to use", "platform charges", "kwikr fees"]',
 '["what are the fees", "how much does kwikr cost", "platform charges"]',
 'Kwikr is free for clients to use. You can post jobs, communicate with service providers, and manage your projects at no cost. Service providers pay a small percentage fee only on completed and paid projects. This keeps the platform free for clients while ensuring quality service providers.',
 9),

-- SAFETY AND VERIFICATION - REALISTIC
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('safety_verification', 
 '["safety", "security", "trust", "verification", "background check"]',
 '["is kwikr safe", "background checks", "verification process"]',
 'We implement several safety measures including service provider verification, secure payment processing, and a review system based on actual client experiences. We encourage clients to review provider profiles, check ratings and reviews, and communicate through our platform before making hiring decisions.',
 8),

-- REVIEWS AND RATINGS
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('reviews_system', 
 '["reviews", "ratings", "feedback", "testimonials"]',
 '["how do reviews work", "rating system", "check ratings"]',
 'Our review system allows clients who have completed projects to rate and review their service providers. This helps future clients make informed decisions when choosing contractors. You can view ratings and read detailed reviews on each service provider''s profile.',
 7),

-- CUSTOMER SUPPORT
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('customer_support', 
 '["help", "support", "contact", "customer service", "assistance"]',
 '["need help", "customer support", "contact support"]',
 'Our support team is available to help with questions about using the platform, managing projects, or resolving any issues. You can reach us through the help center, email support, or contact form. We aim to provide helpful assistance for both clients and service providers.',
 6);

UPDATE chatbot_knowledge SET updated_at = CURRENT_TIMESTAMP WHERE id > 0;