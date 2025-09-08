-- Business-Focused Chatbot Knowledge Base - Fixed SQL
DELETE FROM chatbot_knowledge;

-- LOCATION-BASED SERVICE AVAILABILITY
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('service_availability_toronto', 
 '["cleaners in toronto", "toronto cleaners", "cleaning services toronto"]',
 '["do you have cleaners in toronto", "cleaners available in toronto"]',
 'Yes, we have hundreds of verified cleaners in Toronto and the Greater Toronto Area! You can get multiple competitive quotes by posting your cleaning job for free. Simply describe what you need cleaned, your budget, and timeline. Our Toronto cleaners will submit bids within hours, and you can choose the best match based on ratings, reviews, and pricing.',
 10);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('general_location_services', 
 '["services in", "contractors in", "workers in", "do you have", "any cleaners"]',
 '["do you have services in", "contractors available in", "workers in my area"]',
 'Yes, Kwikr serves all major Canadian cities and most towns across all provinces. We have thousands of verified service providers ready to help with your project. The best way to find available contractors in your specific area is to post a free job. Simply describe what you need done, and local service providers will submit competitive bids.',
 9);

-- FINDING CONTRACTORS
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('finding_contractors', 
 '["find contractor", "find service provider", "search workers", "hire someone"]',
 '["how do i find a contractor", "how to find service providers", "search for contractors"]',
 'Finding the right contractor is simple on Kwikr. You have two options: 1. Post a Free Job - Describe your project and receive multiple competitive bids from qualified contractors. 2. Browse Our Directory - Search by category, location, and ratings. Most clients prefer posting jobs because contractors compete for your business, resulting in better pricing and faster responses.',
 10);

-- PLATFORM OVERVIEW
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('platform_overview', 
 '["kwikr", "platform", "what is", "about", "overview"]',
 '["what is kwikr", "tell me about kwikr", "what does kwikr do"]',
 'Kwikr is Canada''s largest marketplace connecting clients with skilled service providers. We serve over 50 service categories from home improvement to business consulting. Our platform makes it easy to post jobs for free, receive competitive bids, and hire with confidence using secure payments and verified reviews.',
 10);

-- CLIENT ACTIONS
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('posting_jobs', 
 '["post job", "create job", "job posting", "hire workers"]',
 '["how to post a job", "create job posting", "post project"]',
 'Posting a job is free and takes just minutes. Click "Post a Job", describe your project with clear details, set your budget range, and specify your timeline. Most jobs receive their first bid within 30 minutes. You can post unlimited jobs at no cost - you only pay when you hire someone.',
 9);

-- PRICING
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('pricing_structure', 
 '["fees", "commission", "cost", "pricing", "charges", "how much"]',
 '["what are the fees", "how much does kwikr cost", "commission rates"]',
 'Kwikr is completely free for clients. You can post unlimited jobs, browse contractors, communicate with service providers, and use our secure payment system at no cost. Service providers pay a small 5% fee only on completed projects, which helps us maintain the platform and keep it free for clients.',
 9);

-- SAFETY
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('safety_verification', 
 '["safety", "security", "trust", "verification", "background check"]',
 '["is kwikr safe", "background checks", "verification process"]',
 'Safety and trust are our foundation. All contractors undergo ID verification, background checks, and license validation where applicable. Our review system features only verified reviews from real clients, and our secure messaging system protects your privacy. With our escrow payment system, you are protected throughout the entire process.',
 8);

UPDATE chatbot_knowledge SET updated_at = CURRENT_TIMESTAMP WHERE id > 0;