-- Clear existing knowledge and create accurate Kwikr-specific knowledge base
DELETE FROM chatbot_knowledge;

-- SUBSCRIPTION INFORMATION FOR SERVICE PROVIDERS
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('provider_subscription_pricing', 
 '["subscription price", "subscription cost", "how much subscription", "subscription pricing", "cost to subscribe", "provider subscription", "worker subscription", "join kwikr cost"]',
 '["how much is subscription", "what is the cost of subscription", "subscription pricing", "cost to subscribe as provider", "how much to join as worker"]',
 'Kwikr offers three subscription plans for service providers: 1) Pay-as-you-go (Free) - $0/month with $2 fee per completed booking, 2) Growth Plan - $99/month with unlimited leads and no per-job fees, 3) Pro Plan - $199/month with top search placement and premium features. Visit /subscriptions/pricing to see full details and features.',
 15);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('provider_signup_process', 
 '["signup as provider", "join as provider", "become provider", "sign up worker", "join kwikr provider", "how to become service provider", "register as contractor"]',
 '["how can i signup as provider", "how do i become a provider", "sign up as service provider", "join as contractor"]',
 'To join Kwikr as a service provider: 1) Visit /subscriptions/pricing to choose your plan, 2) Complete the registration process with your business information, 3) Get verified through our background check process, 4) Start receiving job requests from clients. All providers start with our free Pay-as-you-go plan.',
 15);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('subscription_plans_details', 
 '["subscription plans", "what plans", "plan options", "different plans", "plan features", "growth plan", "pro plan", "pay as you go"]',
 '["what subscription plans do you have", "tell me about plans", "plan features", "growth vs pro plan"]',
 'Kwikr has 3 provider plans: **Pay-as-you-go** (Free): Tier 3 search placement, 1 category, $2 per booking. **Growth Plan** ($99/month): Tier 2 placement, 5 categories, unlimited leads, no per-job fees, verified badge. **Pro Plan** ($199/month): Tier 1 placement, 10 categories, featured ribbon, magazine spotlight, AI chatbot, social media reels, premium support.',
 15);

-- CLIENT INFORMATION  
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('client_costs_fees', 
 '["client cost", "client fee", "cost for client", "client pricing", "free for client", "client subscription", "posting job cost"]',
 '["how much does it cost for clients", "is it free for clients", "client fees", "cost to post job"]',
 'Kwikr is completely FREE for clients! There are no subscription fees, posting fees, or hidden charges. Clients can post unlimited jobs, browse contractor profiles, communicate with providers, and hire professionals at no cost. You only pay the agreed project amount directly to your chosen service provider.',
 15);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('client_signup_process', 
 '["client signup", "signup as client", "create client account", "register as client", "join as client", "client registration"]',
 '["how do i signup as client", "create client account", "register as client", "sign up to hire"]',
 'Creating a client account is free and easy: 1) Visit /signup/client, 2) Fill in your basic information (name, email, location), 3) Verify your email address, 4) Start posting jobs immediately! No subscription or payment required to get started.',
 15);

-- PLATFORM FEATURES
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('how_kwikr_works', 
 '["how kwikr works", "how does it work", "platform process", "job posting process", "hiring process", "how to use kwikr"]',
 '["how does kwikr work", "how do i use kwikr", "what is the process", "how to post job", "how to hire"]',
 'Kwikr connects clients with verified service providers: 1) **Clients** post free job descriptions with their requirements, 2) **Service providers** submit competitive proposals, 3) **Clients** compare profiles, reviews, and pricing, 4) **Both parties** communicate and finalize details, 5) **Payment** happens directly between client and provider. Simple, transparent, and efficient!',
 15);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('service_categories', 
 '["what services", "service categories", "types of services", "available services", "categories offered", "service types"]',
 '["what services are available", "what categories", "types of work", "available service categories"]',
 'Kwikr covers major service categories including: Cleaning Services, Plumbing, Electrical, Carpentry, Painting, Handyman, HVAC, Flooring, Roofing, Landscaping, General Contracting, and Renovations. Each provider can be listed in multiple categories based on their subscription plan (1-10 categories).',
 12);

-- SPECIFIC SERVICE REQUESTS (keeping existing ones but updated)
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('landscaping_services', 
 '["landscaper", "landscaping", "yard work", "lawn care", "garden", "gardener", "tree service", "lawn maintenance"]',
 '["need a landscaper", "looking for landscaper", "find landscaper", "yard work", "lawn care"]',
 'Great! Landscaping services are available through Kwikr. To connect with qualified landscapers in your area, post a free job describing your project - whether it''s lawn maintenance, garden design, tree services, or yard cleanup. Local landscaping professionals will submit competitive proposals for your specific needs.',
 10);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('cleaning_services', 
 '["cleaner", "cleaning", "housekeeping", "maid", "house cleaning", "office cleaning", "commercial cleaning"]',
 '["need cleaner", "find cleaner", "cleaning services", "house cleaning", "office cleaning"]',
 'Cleaning services are available through Kwikr across Canada. To find qualified cleaners for your home or office, post a free job describing your cleaning needs, frequency, and any special requirements. Local cleaning professionals will provide competitive quotes.',
 10);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('plumbing_services', 
 '["plumber", "plumbing", "plumbing services", "pipe repair", "leak repair", "drain cleaning"]',
 '["need plumber", "find plumber", "plumbing services", "plumbing repair"]',
 'Plumbing services are available through our platform. To connect with licensed plumbers in your area, post a free job describing your plumbing issue or project. Include details about the problem, urgency level, and location for the best responses from qualified professionals.',
 10);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('electrical_services', 
 '["electrician", "electrical", "electrical services", "wiring", "electrical repair", "electrical installation"]',
 '["need electrician", "find electrician", "electrical services", "electrical work"]',
 'Electrical services are available through Kwikr. To find licensed electricians for your project, post a free job describing the electrical work needed. Include safety requirements and project scope so qualified electrical contractors can provide accurate proposals.',
 10);

-- GENERAL HELP
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('platform_overview', 
 '["kwikr", "platform", "what is", "about", "how does", "tell me about kwikr"]',
 '["what is kwikr", "tell me about kwikr", "how does kwikr work", "about kwikr"]',
 'Kwikr is Canada''s marketplace connecting clients with verified service providers. **For Clients**: Post jobs for FREE and receive competitive bids. **For Providers**: Choose from 3 subscription plans starting with free Pay-as-you-go ($2 per booking) up to Pro Plan ($199/month) with premium features.',
 8);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('general_pricing_questions', 
 '["average price", "typical cost", "price range", "how much does", "what does it cost", "pricing"]',
 '["average price for", "typical cost of", "price range for", "how much does it cost"]',
 'Service pricing varies significantly based on project scope, location, materials, and timing. Rather than providing potentially outdated averages, we recommend posting a free job to get current competitive quotes from qualified professionals in your area.',
 7);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('finding_contractors', 
 '["find contractor", "find service provider", "search workers", "hire", "looking for"]',
 '["how do i find a contractor", "how to find service providers", "looking for", "need to hire"]',
 'The most effective way to find qualified contractors is to post a free job describing your project. This allows local professionals to review your requirements and submit competitive proposals.',
 6);

UPDATE chatbot_knowledge SET updated_at = CURRENT_TIMESTAMP WHERE id > 0;