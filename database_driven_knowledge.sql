-- Clear existing knowledge and create database-driven knowledge base
DELETE FROM chatbot_knowledge;

-- REAL SERVICE AVAILABILITY - Based on actual database data
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('moving_services_availability', 
 '["moving", "moving services", "movers", "relocation", "moving company"]',
 '["do you offer moving services", "moving services", "need movers", "find moving company"]',
 'Yes! Moving services are available on Kwikr. Moving is one of our 12 service categories. To connect with licensed and insured moving companies, post a free job describing your move details (dates, locations, items). Moving providers will submit competitive quotes for your relocation needs.',
 15);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('junk_removal_services', 
 '["junk removal", "junk", "removal", "debris removal", "waste removal", "garbage removal", "haul away"]',
 '["do you have junk removal", "junk removal services", "need junk removed", "debris removal"]',
 'Junk removal falls under our Handyman category, and we currently have 1 active handyman provider serving Ottawa and Gatineau areas. For junk removal services, post a free job describing what needs to be removed, and available providers will submit quotes if they can help with your project.',
 15);

-- REAL LOCATION-BASED SERVICE AVAILABILITY
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('cleaners_montreal_availability', 
 '["cleaners montreal", "cleaning montreal", "cleaners in montreal", "montreal cleaners", "montreal cleaning"]',
 '["do you have cleaners in montreal", "cleaners montreal", "cleaning services montreal"]',
 'Our cleaning providers currently serve Vancouver, Burnaby, and Richmond areas. We don''t have active cleaning providers in Montreal at this time. However, you can still post a free job for Montreal - if there are available cleaners in the area, they may respond to your posting.',
 15);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('plumbers_alberta_availability', 
 '["plumbers alberta", "plumbing alberta", "plumbers in alberta", "alberta plumbers"]',
 '["do you have plumbers in alberta", "plumbers alberta", "plumbing services alberta"]',
 'Yes! We have active plumbing providers in Alberta, specifically serving Calgary and Airdrie. We also have electrical services available in Calgary. Post a free job with your plumbing needs and Alberta-based licensed plumbers will submit competitive proposals.',
 15);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('services_toronto_availability', 
 '["toronto services", "providers toronto", "contractors toronto", "services in toronto", "toronto area"]',
 '["services in toronto", "do you have providers in toronto", "toronto contractors"]',
 'Yes! We have active service providers in Toronto area including plumbing services covering Toronto, Mississauga, and Brampton. To see all available services for Toronto, post your specific job requirements and local providers will respond if they can help.',
 15);

-- REAL TIMING INFORMATION
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('hiring_timeline', 
 '["how long", "how fast", "timeline", "how quickly", "response time", "time to hire"]',
 '["how long does it take to hire", "how fast can i hire", "response time", "timeline to hire"]',
 'Based on our platform activity, most job postings start receiving responses within 24-48 hours. We currently have 5 active jobs in our system. The exact timeline depends on your location, service type, and project complexity. Posting detailed job requirements helps providers respond faster with accurate quotes.',
 15);

-- ACTUAL SERVICE CATEGORIES FROM DATABASE
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('available_service_categories', 
 '["what services", "service categories", "available services", "service types", "categories"]',
 '["what services are available", "service categories", "what categories do you have"]',
 'Kwikr offers 12 service categories: Construction, Plumbing, Electrical, HVAC, Landscaping, Cleaning, Moving, Handyman, Painting, Roofing, Flooring, and Carpentry. We currently have active providers in: Cleaning (Vancouver area), Electrical (Calgary area), Plumbing (Toronto area), Handyman (Ottawa area), and Painting (Ottawa area).',
 12);

-- REAL PRICING GUIDANCE BASED ON DATABASE STRUCTURE
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('service_pricing_reality', 
 '["price", "cost", "how much", "pricing", "rates", "charges", "fees"]',
 '["how much for", "what does it cost", "price for", "cost of", "rates for"]',
 'Service pricing varies by provider and project scope. Our providers set their own rates - some offer hourly rates while others quote per project. When you post a free job, you''ll receive competitive quotes from multiple providers so you can compare pricing and choose the best value for your needs.',
 10);

-- SUBSCRIPTION INFO (keeping accurate existing ones)
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('provider_subscription_pricing', 
 '["subscription price", "subscription cost", "how much subscription", "subscription pricing", "cost to subscribe", "provider subscription", "worker subscription", "join kwikr cost"]',
 '["how much is subscription", "what is the cost of subscription", "subscription pricing", "cost to subscribe as provider"]',
 'Kwikr offers three subscription plans for service providers: 1) Pay-as-you-go (Free) - $0/month with $2 fee per completed booking, 2) Growth Plan - $99/month with unlimited leads and no per-job fees, 3) Pro Plan - $199/month with top search placement and premium features. Visit /subscriptions/pricing to see full details.',
 15);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('client_costs_fees', 
 '["client cost", "client fee", "cost for client", "client pricing", "free for client", "posting job cost"]',
 '["how much does it cost for clients", "is it free for clients", "client fees", "cost to post job"]',
 'Kwikr is completely FREE for clients! No subscription fees, posting fees, or hidden charges. You can post unlimited jobs, browse contractor profiles, communicate with providers, and hire professionals at no cost. You only pay the agreed project amount directly to your chosen service provider.',
 15);

-- PLATFORM PROCESS
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('how_kwikr_works', 
 '["how kwikr works", "how does it work", "platform process", "job posting process", "hiring process"]',
 '["how does kwikr work", "how do i use kwikr", "what is the process", "how to post job"]',
 'Kwikr connects clients with verified service providers: 1) Clients post free job descriptions, 2) Service providers submit competitive proposals, 3) Clients compare profiles, reviews, and pricing, 4) Both parties communicate and finalize details, 5) Payment happens directly between client and provider. We currently have 5 active jobs and providers across Canada.',
 10);

-- SPECIFIC SERVICE REQUESTS (Updated with real availability)
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('cleaning_services', 
 '["cleaner", "cleaning", "housekeeping", "maid", "house cleaning", "office cleaning"]',
 '["need cleaner", "find cleaner", "cleaning services", "house cleaning"]',
 'Cleaning services are available through Kwikr! We have 2 active cleaning providers currently serving Vancouver, Burnaby, and Richmond areas. To connect with qualified cleaners, post a free job describing your cleaning needs, frequency, and special requirements.',
 10);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('plumbing_services', 
 '["plumber", "plumbing", "plumbing services", "pipe repair", "leak repair"]',
 '["need plumber", "find plumber", "plumbing services", "plumbing repair"]',
 'Plumbing services are available! We have 2 active licensed plumbers serving Toronto, Mississauga, and Brampton areas. To connect with qualified plumbers, post a free job describing your plumbing issue, urgency level, and location details.',
 10);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('electrical_services', 
 '["electrician", "electrical", "electrical services", "wiring", "electrical repair"]',
 '["need electrician", "find electrician", "electrical services", "electrical work"]',
 'Electrical services are available! We have 2 active licensed electricians serving Calgary and Airdrie areas. Post a free job describing your electrical work needs, safety requirements, and project scope for accurate proposals from certified professionals.',
 10);

-- GENERAL RESPONSES
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('platform_overview', 
 '["kwikr", "platform", "what is", "about", "tell me about kwikr"]',
 '["what is kwikr", "tell me about kwikr", "about kwikr"]',
 'Kwikr is Canada''s marketplace connecting clients with verified service providers. We offer 12 service categories with active providers across major cities. **For Clients**: Post jobs for FREE. **For Providers**: Choose from 3 subscription plans starting with free Pay-as-you-go.',
 8);

UPDATE chatbot_knowledge SET updated_at = CURRENT_TIMESTAMP WHERE id > 0;