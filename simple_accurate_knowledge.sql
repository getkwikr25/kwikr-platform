DELETE FROM chatbot_knowledge;

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('office_cleaning_pricing', 
 '["average price", "cost", "office cleaner", "office cleaning"]',
 '["average price for office cleaner", "cost of office cleaning"]',
 'Office cleaning prices vary significantly based on factors like office size, frequency, location, and specific services needed. To get accurate pricing for your office, post a free job with your requirements and local cleaners will provide competitive quotes tailored to your needs.',
 10);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('general_pricing_questions', 
 '["average price", "typical cost", "price range", "how much does"]',
 '["average price for", "typical cost of", "price range for"]',
 'Pricing varies significantly based on project scope, location, materials, and timing. Rather than providing potentially outdated averages, we recommend posting a free job to get current competitive quotes from qualified professionals in your area.',
 9);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('general_cleaners', 
 '["cleaners", "cleaning services", "housekeeping"]',
 '["cleaners available", "cleaning services", "find cleaners"]',
 'Yes, cleaning services are available through our platform across Canada. To find available cleaners in your specific area, post a free job describing your cleaning needs, and local professionals will submit competitive bids.',
 9);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('finding_contractors', 
 '["find contractor", "find service provider", "search workers"]',
 '["how do i find a contractor", "how to find service providers"]',
 'The most effective way to find qualified contractors is to post a free job describing your project. This allows local professionals to review your requirements and submit competitive proposals.',
 10);

INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('platform_overview', 
 '["kwikr", "platform", "what is", "about"]',
 '["what is kwikr", "tell me about kwikr"]',
 'Kwikr is a Canadian marketplace that connects clients with service providers across multiple categories. Our platform allows you to post jobs for free and receive competitive bids from verified professionals in your area.',
 10);

UPDATE chatbot_knowledge SET updated_at = CURRENT_TIMESTAMP WHERE id > 0;