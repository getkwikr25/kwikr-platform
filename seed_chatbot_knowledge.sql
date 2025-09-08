-- Seed chatbot knowledge base with Kwikr platform information

-- Platform Overview
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('platform_overview', 
 '["kwikr", "platform", "what is", "about", "overview"]',
 '["what is kwikr", "tell me about kwikr", "what does kwikr do", "kwikr platform"]',
 'Kwikr is Canada''s premier platform connecting clients with skilled service providers across various industries. We make it easy to find, hire, and manage professional services from plumbing and electrical work to consulting and creative services.',
 10),

('how_it_works', 
 '["how", "works", "process", "get started", "use"]',
 '["how does kwikr work", "how to use kwikr", "getting started", "what is the process"]',
 'Using Kwikr is simple: 1) Clients post jobs describing their needs, 2) Service providers browse and bid on relevant projects, 3) Clients review profiles and select their preferred provider, 4) Work is completed with secure payment processing, 5) Both parties leave reviews to build trust in our community.',
 10),

-- For Clients
('client_signup', 
 '["client", "customer", "signup", "register", "join", "account"]',
 '["how to sign up as client", "create client account", "register as customer"]',
 'To join as a client: Click "Sign Up" → Select "I need services" → Fill out your profile → Verify your email → Start posting jobs! You can post unlimited jobs and browse our network of verified service providers.',
 8),

('posting_jobs', 
 '["post job", "hire", "find workers", "create job", "job posting"]',
 '["how to post a job", "how to hire workers", "create job posting", "find service providers"]',
 'To post a job: 1) Go to your client dashboard, 2) Click "Post New Job", 3) Describe your project, set budget and timeline, 4) Add location and requirements, 5) Publish your job. You''ll receive bids from qualified service providers within hours!',
 9),

-- For Service Providers
('worker_signup', 
 '["worker", "provider", "contractor", "freelancer", "service provider", "join as worker"]',
 '["sign up as worker", "become service provider", "join as contractor", "work on kwikr"]',
 'To join as a service provider: Click "Sign Up" → Select "I provide services" → Complete your professional profile → Upload certifications and portfolio → Get verified → Start bidding on jobs! Build your reputation and grow your business with Kwikr.',
 8),

('finding_work', 
 '["find work", "get jobs", "find projects", "bidding", "proposals"]',
 '["how to find work", "get jobs on kwikr", "find projects", "submit bids"]',
 'Finding work is easy: 1) Browse available jobs in your category, 2) Filter by location, budget, and requirements, 3) Submit competitive bids with your proposal, 4) Communicate with clients through our messaging system, 5) Get hired and complete great work!',
 9),

-- Payments & Pricing
('pricing', 
 '["cost", "price", "fees", "commission", "charges", "payment"]',
 '["how much does kwikr cost", "what are the fees", "pricing structure", "commission rates"]',
 'Kwikr charges a small service fee only when you successfully complete work: 5% for service providers on completed projects. Clients post jobs for free. We also offer premium subscriptions with additional benefits like priority listing and advanced analytics.',
 8),

('payment_process', 
 '["payment", "pay", "escrow", "secure", "money", "billing"]',
 '["how does payment work", "payment process", "escrow system", "when do I get paid"]',
 'Kwikr uses secure escrow payments: 1) Client funds the project upfront, 2) Money is held safely in escrow, 3) Service provider completes the work, 4) Client approves completion, 5) Payment is automatically released. This protects both parties and ensures fair transactions.',
 9),

-- Safety & Trust
('safety', 
 '["safe", "secure", "trust", "verification", "background check", "insurance"]',
 '["is kwikr safe", "background checks", "verification process", "insurance coverage"]',
 'Your safety is our priority: All service providers undergo verification including ID checks, license verification, and background screening. We offer insurance coverage on eligible jobs, secure messaging, and 24/7 customer support. Our review system helps you make informed decisions.',
 7),

('support', 
 '["help", "support", "contact", "customer service", "assistance", "problem"]',
 '["need help", "customer support", "contact support", "having problems", "get assistance"]',
 'We''re here to help! Contact our support team: 📧 Email: support@kwikr.ca 📞 Phone: 1-800-KWIKR (1-800-594-5737) 💬 Live chat available 24/7 🕐 Business hours: Monday-Friday 8AM-8PM EST. You can also visit our Help Center for instant answers.',
 6),

-- Categories & Services
('services', 
 '["services", "categories", "types", "what services", "available"]',
 '["what services available", "types of work", "categories", "what can I find"]',
 'Kwikr offers services across 50+ categories including: 🔧 Home Services (plumbing, electrical, HVAC), 🏗️ Construction & Renovation, 💻 Technology & IT, 📊 Business & Consulting, 🎨 Creative & Design, 🚚 Moving & Delivery, 🧹 Cleaning & Maintenance, and many more!',
 7),

-- Technical Support
('technical', 
 '["technical", "bug", "error", "website", "app", "not working"]',
 '["technical problems", "website not working", "app issues", "error message", "bug report"]',
 'Experiencing technical issues? Try these steps: 1) Refresh your browser/restart the app, 2) Clear cache and cookies, 3) Check your internet connection, 4) Try a different browser. Still having problems? Contact our technical support team with details about the issue.',
 5),

-- Reviews & Ratings
('reviews', 
 '["reviews", "ratings", "feedback", "reputation", "trust score"]',
 '["how do reviews work", "rating system", "leave feedback", "trust scores"]',
 'Our review system builds trust: Both clients and service providers rate each other after job completion (1-5 stars). Reviews include overall rating, work quality, communication, and timeliness. High-rated providers get priority in search results and earn trust badges.',
 6),

-- Location & Coverage
('location', 
 '["location", "areas", "coverage", "available", "cities", "provinces"]',
 '["what areas covered", "available locations", "cities served", "provincial coverage"]',
 'Kwikr serves all major Canadian cities and provinces: 🍁 Ontario, Quebec, British Columbia, Alberta, Saskatchewan, Manitoba, Nova Scotia, New Brunswick, Newfoundland, and PEI. We''re rapidly expanding to serve rural areas too!',
 7);

-- Update timestamps for all records
UPDATE chatbot_knowledge SET updated_at = CURRENT_TIMESTAMP WHERE id > 0;