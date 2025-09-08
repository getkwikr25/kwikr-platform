-- Clear existing knowledge and create comprehensive service-specific responses
DELETE FROM chatbot_knowledge;

-- Service-specific responses for major categories
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

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('carpentry_services', 
 '["carpenter", "carpentry", "woodwork", "cabinet maker", "furniture repair", "custom carpentry"]',
 '["need carpenter", "find carpenter", "carpentry services", "woodwork"]',
 'Carpentry services are available through our platform. To connect with skilled carpenters, post a free job describing your woodwork project - whether it''s custom furniture, repairs, or construction. Include project details and materials for the best responses.',
 10);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('painting_services', 
 '["painter", "painting", "paint job", "interior painting", "exterior painting", "house painting"]',
 '["need painter", "find painter", "painting services", "paint job"]',
 'Painting services are available through Kwikr. To find qualified painters for interior or exterior work, post a free job describing your painting project. Include room sizes, surface types, and timeline so local painters can provide competitive quotes.',
 10);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('handyman_services', 
 '["handyman", "handyperson", "general repairs", "home repairs", "maintenance", "fix"]',
 '["need handyman", "find handyman", "handyman services", "general repairs", "home maintenance"]',
 'Handyman services are available through our platform. To find skilled handymen for repairs and maintenance, post a free job describing what needs to be fixed or maintained. Local handymen will review your project and submit proposals if they can help.',
 10);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('roofing_services', 
 '["roofer", "roofing", "roof repair", "roof replacement", "roof maintenance", "roof leak"]',
 '["need roofer", "find roofer", "roofing services", "roof repair"]',
 'Roofing services are available through Kwikr. To connect with licensed roofers, post a free job describing your roofing needs - repair, replacement, or maintenance. Include roof type and any visible issues so qualified roofing contractors can provide accurate estimates.',
 10);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('hvac_services', 
 '["hvac", "heating", "cooling", "air conditioning", "furnace", "hvac technician", "hvac repair"]',
 '["need hvac", "find hvac technician", "heating services", "cooling services", "hvac repair"]',
 'HVAC services are available through our platform. To find qualified heating and cooling technicians, post a free job describing your HVAC needs - installation, repair, or maintenance. Include system type and any issues for the best responses from certified professionals.',
 10);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('flooring_services', 
 '["flooring", "floor installation", "hardwood", "tile", "carpet", "laminate", "flooring contractor"]',
 '["need flooring", "find flooring contractor", "floor installation", "flooring services"]',
 'Flooring services are available through Kwikr. To connect with flooring specialists, post a free job describing your flooring project - installation, repair, or refinishing. Include room sizes, flooring type preferences, and timeline for competitive proposals.',
 10);

-- General service finding (lower priority than specific services)
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('finding_contractors', 
 '["find contractor", "find service provider", "search workers", "hire", "looking for"]',
 '["how do i find a contractor", "how to find service providers", "looking for", "need to hire"]',
 'The most effective way to find qualified contractors is to post a free job describing your project. This allows local professionals to review your requirements and submit competitive proposals.',
 8);

-- Platform information
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('platform_overview', 
 '["kwikr", "platform", "what is", "about", "how does", "how it works"]',
 '["what is kwikr", "tell me about kwikr", "how does kwikr work"]',
 'Kwikr is a Canadian marketplace that connects clients with service providers across multiple categories. Our platform allows you to post jobs for free and receive competitive bids from verified professionals in your area.',
 9);

-- Pricing questions (general)
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('general_pricing_questions', 
 '["average price", "typical cost", "price range", "how much does", "what does it cost", "pricing"]',
 '["average price for", "typical cost of", "price range for", "how much does it cost"]',
 'Pricing varies significantly based on project scope, location, materials, and timing. Rather than providing potentially outdated averages, we recommend posting a free job to get current competitive quotes from qualified professionals in your area.',
 7);

UPDATE chatbot_knowledge SET updated_at = CURRENT_TIMESTAMP WHERE id > 0;