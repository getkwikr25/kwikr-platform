-- Business-Focused Chatbot Knowledge Base - Sales & Action Oriented
-- Clear existing knowledge and add business-focused responses

DELETE FROM chatbot_knowledge;

-- LOCATION-BASED SERVICE AVAILABILITY
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('service_availability_toronto', 
 '["cleaners in toronto", "toronto cleaners", "cleaning services toronto", "housekeeping toronto", "maid service toronto"]',
 '["do you have cleaners in toronto", "cleaners available in toronto", "toronto cleaning services", "find cleaners toronto"]',
 'Yes, we have hundreds of verified cleaners in Toronto and the Greater Toronto Area! You can get multiple competitive quotes by posting your cleaning job for free. Simply describe what you need cleaned, your budget, and timeline. Our Toronto cleaners will submit bids within hours, and you can choose the best match based on ratings, reviews, and pricing. Post your free job now to get started.',
 10),

('service_availability_vancouver', 
 '["cleaners in vancouver", "vancouver cleaners", "cleaning services vancouver", "housekeeping vancouver"]',
 '["do you have cleaners in vancouver", "cleaners available in vancouver", "vancouver cleaning services"]',
 'Absolutely! We have a large network of professional cleaners throughout Vancouver and the Lower Mainland. Post your cleaning job for free and receive multiple bids from background-checked cleaners in your area. You can compare rates, read reviews, and choose the perfect cleaner for your needs. Start by posting your job - it only takes 2 minutes.',
 10),

('service_availability_montreal', 
 '["cleaners in montreal", "montreal cleaners", "cleaning services montreal", "housekeeping montreal"]',
 '["do you have cleaners in montreal", "cleaners available in montreal", "montreal cleaning services"]',
 'Yes, we have many experienced cleaners serving Montreal and surrounding areas. Our platform makes it easy to find the right cleaner for your budget. Post a free job describing your cleaning needs, and our Montreal-based cleaners will send you competitive quotes. You can review their profiles, ratings, and previous work before making your choice.',
 10),

('service_availability_calgary', 
 '["cleaners in calgary", "calgary cleaners", "cleaning services calgary", "housekeeping calgary"]',
 '["do you have cleaners in calgary", "cleaners available in calgary", "calgary cleaning services"]',
 'Yes, we have qualified cleaners throughout Calgary and Alberta. Post your cleaning job for free to receive bids from local, verified cleaners. Our platform lets you compare prices, read customer reviews, and hire with confidence using our secure payment system. Get started by posting your job today.',
 10),

('general_location_services', 
 '["services in", "contractors in", "workers in", "providers in", "available in", "do you have", "any cleaners", "any contractors"]',
 '["do you have services in", "contractors available in", "workers in my area", "services near me"]',
 'Yes, Kwikr serves all major Canadian cities and most towns across all provinces. We have thousands of verified service providers ready to help with your project. The best way to find available contractors in your specific area is to post a free job. Simply describe what you need done, and local service providers will submit competitive bids. You can then compare their profiles, ratings, and pricing to choose the perfect match.',
 9),

-- FINDING CONTRACTORS - SALES FOCUSED
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('finding_contractors', 
 '["find contractor", "find service provider", "search workers", "hire someone", "get help", "need services", "looking for"]',
 '["how do i find a contractor", "how to find service providers", "find workers on kwikr", "search for contractors"]',
 'Finding the right contractor is simple on Kwikr. You have two options: 1. Post a Free Job - Describe your project and receive multiple competitive bids from qualified contractors. This is the most effective way to find great value and compare options. 2. Browse Our Directory - Search by category, location, and ratings to find contractors directly. Most clients prefer posting jobs because contractors compete for your business, resulting in better pricing and faster responses. Would you like to post your job now?',
 10),

('browsing_contractors', 
 '["browse contractors", "directory", "search directory", "find by category", "contractor profiles"]',
 '["browse contractor directory", "search by category", "find contractors near me", "see all contractors"]',
 'Our contractor directory includes thousands of verified professionals across Canada. You can search by category (home services, business services, technology, etc.), filter by location, and sort by ratings. However, posting a free job typically gets better results because contractors compete for your project with competitive pricing. Browse the directory to get familiar with available services, then post your job to receive personalized quotes.',
 8),

-- PLATFORM OVERVIEW - BUSINESS FOCUSED
('platform_overview', 
 '["kwikr", "platform", "what is", "about", "overview", "how does it work"]',
 '["what is kwikr", "tell me about kwikr", "what does kwikr do", "how does kwikr work"]',
 'Kwikr is Canada''s largest marketplace connecting clients with skilled service providers. We serve over 50 service categories from home improvement to business consulting. Our platform makes it easy to post jobs for free, receive competitive bids, and hire with confidence using secure payments and verified reviews. With over 100,000 service providers nationwide, we help you find the right professional at the right price. Ready to post your first job?',
 10),

-- CLIENT ACTIONS - CONVERSION FOCUSED
('client_signup', 
 '["client signup", "customer account", "register as client", "join as customer", "create account"]',
 '["how to sign up as client", "create client account", "register as customer", "join kwikr"]',
 'Signing up takes just 2 minutes and is completely free. Visit kwikr.ca, click "Sign Up", choose "I need services", and complete your basic profile. Once registered, you can immediately start posting jobs and receiving bids from qualified contractors. There are no subscription fees for clients - you only pay for successful projects. Sign up now to access Canada\'s largest network of service providers.',
 9),

('posting_jobs', 
 '["post job", "create job", "job posting", "hire workers", "submit project"]',
 '["how to post a job", "create job posting", "post project", "hire workers"]',
 'Posting a job is free and takes just minutes. Click "Post a Job", describe your project with clear details, set your budget range, and specify your timeline. The more details you provide, the more accurate bids you\'ll receive. Most jobs receive their first bid within 30 minutes. You can post unlimited jobs at no cost - you only pay when you hire someone. Ready to get started?',
 9),

-- PRICING - EMPHASIZE VALUE
('pricing_structure', 
 '["fees", "commission", "cost", "pricing", "charges", "how much", "rates", "free"]',
 '["what are the fees", "how much does kwikr cost", "commission rates", "pricing structure"]',
 'Kwikr is completely free for clients. You can post unlimited jobs, browse contractors, communicate with service providers, and use our secure payment system at no cost. Service providers pay a small 5% fee only on completed projects, which helps us maintain the platform and keep it free for clients like you. This means you get access to thousands of contractors without any upfront costs or membership fees.',
 9),

('payment_process', 
 '["payment", "escrow", "how to pay", "secure payment", "billing"]',
 '["how does payment work", "payment process", "escrow system", "how to pay contractors"]',
 'Our secure escrow system protects both you and your contractor. When you hire someone, funds are safely held in escrow until the work is completed to your satisfaction. This gives you complete control - the contractor only gets paid when you approve the finished work. We accept all major payment methods, and there are no processing fees for clients. This system has facilitated millions in successful transactions.',
 8),

-- SAFETY & TRUST - BUILD CONFIDENCE
('safety_verification', 
 '["safety", "security", "trust", "verification", "background check", "insurance", "safe"]',
 '["is kwikr safe", "background checks", "verification process", "safety measures"]',
 'Safety and trust are our foundation. All contractors undergo ID verification, background checks, and license validation where applicable. Many carry liability insurance, which is clearly displayed on their profiles. Our review system features only verified reviews from real clients, and our secure messaging system protects your privacy. With our escrow payment system, you\'re protected throughout the entire process.',
 8),

-- SERVICE CATEGORIES - DRIVE ENGAGEMENT  
('services_categories', 
 '["services", "categories", "types of work", "what services", "available services"]',
 '["what services available", "types of work", "service categories", "what can I find"]',
 'Kwikr covers over 50 service categories including home services (plumbing, electrical, cleaning, landscaping), construction and renovation, technology services (web design, IT support), business services (accounting, marketing, consulting), creative services (design, photography), and much more. The fastest way to see what\'s available in your area is to post your specific job. This will show you exactly which qualified contractors are ready to help with your project.',
 8),

-- REVIEWS SYSTEM - BUILD TRUST
('reviews_system', 
 '["reviews", "ratings", "feedback", "testimonials", "reputation", "trust score"]',
 '["how do reviews work", "rating system", "leave feedback", "check ratings"]',
 'Our review system helps you make informed decisions. Only clients who have paid for completed work can leave reviews, ensuring all feedback is genuine. Reviews include overall ratings plus specific scores for quality, communication, timeliness, and value. Many reviews include photos of completed work. High-rated contractors get priority placement, so our best performers are easy to find.',
 7),

-- BUSINESS SOLUTIONS - UPSELL OPPORTUNITY
('business_features', 
 '["business account", "enterprise", "bulk projects", "business services", "company account"]',
 '["business account features", "enterprise solutions", "bulk hiring", "company services"]',
 'Kwikr Business offers solutions for companies with ongoing service needs. Features include dedicated account management, bulk project posting, team collaboration tools, advanced analytics, and volume discounts. Business clients often save 15-25% through preferred contractor relationships and streamlined processes. If you have regular service needs or multiple projects, a business account could provide significant value.',
 6),

-- MOBILE APP - INCREASE ENGAGEMENT
('mobile_app', 
 '["mobile app", "app download", "smartphone", "ios", "android"]',
 '["mobile app features", "download app", "smartphone app", "mobile kwikr"]',
 'Download our free mobile app from the App Store or Google Play for convenient project management on the go. The app includes photo upload for projects, GPS-based contractor search, push notifications for new bids, and secure mobile payments. Mobile users often receive faster responses from contractors and can manage their projects more efficiently.',
 6),

-- SUPPORT - REDUCE FRICTION
('customer_support', 
 '["help", "support", "contact", "customer service", "assistance", "problems"]',
 '["need help", "customer support", "having problems", "get assistance"]',
 'Our support team is here to help you succeed. Contact us at 1-800-KWIKR or support@kwikr.ca. We offer live chat support, a comprehensive help center, and dedicated assistance for project management, payments, and contractor selection. Our goal is to make your experience smooth and successful so you can focus on getting great work done.',
 6),

-- CONTRACTOR SIGNUP - SUPPLY SIDE
('contractor_signup', 
 '["become contractor", "join as contractor", "service provider signup", "worker account"]',
 '["how to become contractor", "join as service provider", "contractor registration"]',
 'Join thousands of successful contractors earning through Kwikr. The registration process includes profile creation, skill verification, background checks, and portfolio setup. Top contractors on our platform report 30-50% increases in business within the first year. We provide marketing tools, client management features, and secure payment processing. Ready to grow your business with us?',
 5);

-- Update timestamps
UPDATE chatbot_knowledge SET updated_at = CURRENT_TIMESTAMP WHERE id > 0;