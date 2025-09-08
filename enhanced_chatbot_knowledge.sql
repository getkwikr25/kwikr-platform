-- Enhanced Chatbot Knowledge Base - More Comprehensive Kwikr Information
-- Clear existing knowledge and add comprehensive responses

DELETE FROM chatbot_knowledge;

-- FINDING CONTRACTORS & SERVICE PROVIDERS
INSERT INTO chatbot_knowledge (category, keywords, question_patterns, response, priority) VALUES
('finding_contractors', 
 '["find contractor", "find service provider", "search workers", "hire someone", "get help", "need services", "looking for"]',
 '["how do i find a contractor", "how to find service providers", "find workers on kwikr", "search for contractors", "how to hire someone", "need to find help"]',
 'Finding contractors on Kwikr is easy! Here''s how: 1️⃣ **Post a Job** - Click "Post a Job" and describe what you need done 2️⃣ **Get Bids** - Qualified contractors will submit bids with their quotes and proposals 3️⃣ **Review Profiles** - Check ratings, reviews, portfolios, and certifications 4️⃣ **Compare & Choose** - Select the best contractor based on price, experience, and reviews 5️⃣ **Hire & Pay Securely** - Use our escrow system for safe payment. You can also browse our directory of verified contractors by category and location!',
 10),

('browsing_contractors', 
 '["browse contractors", "directory", "search directory", "find by category", "contractor profiles", "worker profiles"]',
 '["browse contractor directory", "search by category", "find contractors near me", "see all contractors", "worker profiles"]',
 'You can browse our contractor directory in several ways: 🔍 **By Category** - Home Services, Business Services, Technology, Creative, etc. 📍 **By Location** - Search contractors in your city or province 🌟 **By Rating** - Filter by top-rated professionals ✅ **By Verification** - See only background-checked and licensed contractors 💼 **By Specialization** - Find experts in specific skills. Each profile shows ratings, reviews, portfolio samples, certifications, and pricing information.',
 9),

-- PLATFORM OVERVIEW & CORE CONCEPTS
('platform_overview', 
 '["kwikr", "platform", "what is", "about", "overview", "how does it work", "concept"]',
 '["what is kwikr", "tell me about kwikr", "what does kwikr do", "kwikr platform", "how does kwikr work"]',
 'Kwikr is Canada''s premier marketplace connecting clients with skilled service providers across 50+ categories. Think of it as the "Uber for services" - whether you need a plumber, web designer, house cleaner, or business consultant, Kwikr makes it simple to find, hire, and pay professionals. We handle everything: job matching, secure payments, reviews, and dispute resolution. Over 100,000+ verified service providers serve all major Canadian cities.',
 10),

-- CLIENT-SPECIFIC GUIDANCE
('client_signup', 
 '["client signup", "customer account", "register as client", "join as customer", "create account", "sign up client"]',
 '["how to sign up as client", "create client account", "register as customer", "join kwikr as client"]',
 'Signing up as a client is FREE and takes 2 minutes: 1️⃣ **Visit** kwikr.ca and click "Sign Up" 2️⃣ **Choose** "I need services" 3️⃣ **Enter** your email, name, and location 4️⃣ **Verify** your email address 5️⃣ **Complete** your profile with photo and details ✅ **Start** posting jobs immediately! No subscription fees - you only pay when you hire someone.',
 9),

('posting_jobs_detailed', 
 '["post job", "create job", "job posting", "hire workers", "submit project", "create project"]',
 '["how to post a job", "create job posting", "post project", "hire workers", "submit work request"]',
 'Posting jobs on Kwikr gets you multiple competitive bids: 📝 **Job Details** - Describe your project clearly with scope, timeline, and budget 📸 **Add Photos** - Include reference images or project site photos 📍 **Set Location** - Specify if it''s on-site, remote, or hybrid 💰 **Budget Range** - Set your expected budget (helps attract right contractors) ⏰ **Timeline** - When do you need it completed? 🔍 **Requirements** - Any special skills, licenses, or certifications needed. You''ll start receiving bids within hours!',
 9),

('choosing_contractors', 
 '["choose contractor", "select worker", "pick service provider", "evaluate bids", "compare quotes", "how to choose"]',
 '["how to choose contractor", "select best bid", "evaluate service providers", "compare contractors", "pick the right worker"]',
 'Choosing the right contractor is crucial - here''s what to look for: ⭐ **Ratings & Reviews** - Check overall rating and read detailed client feedback 📋 **Portfolio** - Review past work samples and project photos 🛡️ **Verification Status** - Look for background checks, license verification, insurance 💬 **Communication** - How quickly and professionally do they respond? 💰 **Value Proposition** - Not always cheapest, but best value for quality 📅 **Availability** - Can they meet your timeline? 🏆 **Kwikr Badges** - Top Performer, Verified Pro, Background Checked badges',
 8),

-- SERVICE PROVIDER GUIDANCE  
('worker_signup', 
 '["worker signup", "contractor signup", "service provider signup", "freelancer account", "join as contractor"]',
 '["sign up as contractor", "become service provider", "join as worker", "contractor account", "freelancer registration"]',
 'Join Kwikr''s network of successful service providers: 1️⃣ **Sign Up** - Choose "I provide services" and complete your professional profile 2️⃣ **Verification** - Upload ID, licenses, certifications, and insurance documents 3️⃣ **Portfolio** - Add photos of your best work and client testimonials 4️⃣ **Service Areas** - Set your coverage area and travel preferences 5️⃣ **Pricing** - Set your rates and service packages 6️⃣ **Get Approved** - Our team reviews applications within 24-48 hours ✅ **Start Bidding** - Begin earning with our 95% contractor satisfaction rate!',
 9),

('bidding_process', 
 '["bidding", "submit bid", "proposal", "quote", "how to bid", "win jobs"]',
 '["how to bid on jobs", "submit proposal", "win more projects", "bidding strategy", "get hired"]',
 'Winning bids on Kwikr requires strategy: 🎯 **Quick Response** - Bid within first few hours for 3x better chances 💡 **Detailed Proposal** - Explain your approach, timeline, and what''s included 📸 **Show Examples** - Include relevant portfolio samples 💰 **Competitive Pricing** - Research market rates, offer good value 🤝 **Professional Tone** - Be friendly, confident, and ask clarifying questions 📅 **Clear Timeline** - When can you start and finish? 🛡️ **Highlight Credentials** - Mention relevant experience, certifications, insurance ⭐ **Leverage Reviews** - Past 5-star ratings help significantly',
 8),

-- PAYMENTS & PRICING
('payment_detailed', 
 '["payment", "escrow", "how to pay", "secure payment", "billing", "money", "cost breakdown"]',
 '["how does payment work", "payment process", "escrow system", "how to pay contractors", "billing process"]',
 'Kwikr uses secure escrow for all transactions: 💳 **Client Funds Project** - Money is held safely in escrow when job starts 🔒 **Protected Funds** - Contractor can''t access until work is approved 📋 **Milestone Payments** - For larger projects, pay in phases as work progresses ✅ **Approve & Release** - Client approves completed work, payment releases automatically 🛡️ **Dispute Protection** - If issues arise, our resolution team mediates 💰 **Payment Methods** - Credit cards, bank transfers, PayPal accepted 📧 **Automatic Receipts** - All transactions tracked and receipts emailed',
 9),

('pricing_structure', 
 '["fees", "commission", "cost", "pricing", "charges", "how much", "rates"]',
 '["what are the fees", "how much does kwikr cost", "commission rates", "pricing structure", "service charges"]',
 'Kwikr''s transparent pricing structure: 👥 **Clients**: ✅ FREE to post jobs ✅ FREE to browse contractors ✅ FREE messaging and communication ✅ Only pay the agreed project amount (no platform fees for clients!) 🔨 **Service Providers**: ✅ FREE to create profile ✅ FREE to submit bids ✅ 5% service fee only on completed, paid projects ✅ Premium memberships available with benefits like priority listing, advanced analytics, and lower fees 💎 **Premium Features**: Enhanced profiles, priority support, marketing tools available',
 8),

-- SAFETY & TRUST
('safety_detailed', 
 '["safety", "security", "trust", "verification", "background check", "insurance", "protection", "safe"]',
 '["is kwikr safe", "background checks", "verification process", "insurance coverage", "safety measures"]',
 'Your safety is our top priority with multiple protection layers: 🛡️ **Contractor Screening**: ID verification, background checks, license validation, reference checks 📄 **Insurance Coverage**: $1M+ liability coverage on eligible projects 💳 **Secure Payments**: Bank-level encryption, escrow protection, fraud monitoring 💬 **Safe Communication**: All messages through platform (never share personal contact initially) ⭐ **Review System**: Verified reviews from real clients help you choose 🚨 **24/7 Support**: Emergency support line and dispute resolution team 📱 **Safety Tips**: In-app guidance for meeting contractors safely',
 8),

-- TECHNICAL SUPPORT
('technical_support', 
 '["help", "support", "contact", "customer service", "technical issues", "problems", "assistance"]',
 '["need help", "customer support", "technical problems", "having issues", "contact support"]',
 'Get help when you need it: 📞 **Phone Support**: 1-800-KWIKR (1-800-594-5737) 💬 **Live Chat**: Available 24/7 in bottom-right corner 📧 **Email**: support@kwikr.ca (response within 2 hours) 🎫 **Help Center**: Instant answers to common questions 📱 **Mobile App**: Download iOS/Android apps for on-the-go support 🕐 **Business Hours**: Phone support Mon-Fri 8AM-8PM EST, emergency line 24/7 🎯 **Specialized Teams**: Technical issues, payment disputes, safety concerns all have dedicated specialists',
 7),

-- CATEGORIES & SERVICES  
('services_categories', 
 '["services", "categories", "types of work", "what services", "available services", "service types"]',
 '["what services available", "types of work", "service categories", "what can I find on kwikr"]',
 'Kwikr offers 50+ service categories: 🏠 **Home Services**: Plumbing, electrical, HVAC, roofing, flooring, painting, landscaping 🔨 **Construction**: Renovations, additions, decks, fencing, concrete, drywall 💻 **Technology**: Web design, app development, IT support, cybersecurity, data recovery 📊 **Business Services**: Accounting, legal, marketing, consulting, virtual assistants 🎨 **Creative**: Graphic design, photography, videography, copywriting, branding 🚚 **Moving & Logistics**: Local moving, long-distance, packing, storage, delivery 🧹 **Cleaning**: House cleaning, office cleaning, carpet cleaning, post-construction cleanup ⚡ **And Many More**: Auto services, pet care, tutoring, fitness, event planning',
 8),

-- LOCATION COVERAGE
('coverage_areas', 
 '["coverage", "areas served", "locations", "cities", "provinces", "where available", "service areas"]',
 '["what areas covered", "cities served", "available locations", "service coverage", "where does kwikr work"]',
 'Kwikr serves all of Canada with strongest coverage in major cities: 🇨🇦 **Provinces**: All 10 provinces and 3 territories covered 🏙️ **Major Cities**: Toronto, Vancouver, Montreal, Calgary, Edmonton, Ottawa, Winnipeg, Quebec City, Halifax 🌆 **Metro Areas**: Greater Toronto Area (GTA), Greater Vancouver, Greater Montreal 🏘️ **Suburban Coverage**: Most suburban communities within 50km of major cities 🌲 **Rural Service**: Growing rural coverage, many contractors travel to smaller communities 📍 **Service Radius**: Most contractors specify their travel radius (typically 25-100km) 🚗 **Remote Services**: Many digital/consulting services available nationwide',
 7),

-- REVIEWS & RATINGS
('reviews_system', 
 '["reviews", "ratings", "feedback", "testimonials", "reputation", "trust score", "rating system"]',
 '["how do reviews work", "rating system", "leave feedback", "check ratings", "trust scores"]',
 'Our comprehensive review system builds trust: ⭐ **5-Star System**: Overall rating plus specific categories (quality, communication, timeliness, value) 📝 **Detailed Reviews**: Written feedback from verified clients only 📸 **Photo Reviews**: Clients can upload before/after photos 🛡️ **Verified Reviews**: Only clients who paid for services can leave reviews 📊 **Response System**: Contractors can respond professionally to feedback 🏆 **Badges & Recognition**: Top performers earn special badges and priority listing 📈 **Rating Impact**: Higher ratings = more visibility in search results + higher bid acceptance rates',
 7),

-- BUSINESS FEATURES
('business_features', 
 '["business account", "enterprise", "bulk projects", "business services", "company account", "commercial"]',
 '["business account features", "enterprise solutions", "bulk hiring", "company services", "commercial projects"]',
 'Kwikr Business offers enterprise solutions: 🏢 **Business Accounts**: Dedicated account managers, bulk project management, team collaboration 📊 **Advanced Analytics**: Project tracking, spending analysis, contractor performance metrics 💼 **Volume Discounts**: Reduced fees for high-volume clients, enterprise pricing tiers 👥 **Team Management**: Multiple users, approval workflows, budget controls 📋 **Preferred Contractors**: Build relationships with trusted contractors for ongoing work 🔄 **Recurring Services**: Set up regular cleaning, maintenance, or consulting services ⚡ **Priority Support**: Dedicated business support line, faster dispute resolution 📈 **Growth Tools**: Marketing support, referral programs, partnership opportunities',
 6),

-- MOBILE APP
('mobile_app', 
 '["mobile app", "app download", "smartphone", "ios", "android", "mobile version"]',
 '["mobile app features", "download app", "smartphone app", "mobile kwikr", "app store"]',
 'Download the Kwikr mobile app for convenience: 📱 **Available On**: iOS App Store, Google Play Store, both free downloads 📸 **Photo Integration**: Easy photo upload for projects and portfolios 📍 **GPS Integration**: Find contractors near your current location 💬 **Push Notifications**: Instant alerts for new bids, messages, job updates ⚡ **Offline Mode**: View contractor profiles and project details without internet 💳 **Mobile Payments**: Secure payment processing optimized for mobile 📞 **Quick Contact**: One-tap calling and messaging 🔔 **Real-time Updates**: Live project status, payment confirmations, review alerts',
 6),

-- DISPUTE RESOLUTION
('disputes', 
 '["dispute", "problem", "issue", "complaint", "refund", "disagreement", "conflict"]',
 '["having problems", "dispute resolution", "contractor issues", "refund request", "complaint process"]',
 'We help resolve any project issues: 🎯 **Prevention First**: Clear project agreements, milestone payments, regular communication 📞 **Direct Resolution**: We encourage direct communication between clients and contractors first 🛡️ **Mediation Service**: Our trained mediators help find mutually acceptable solutions 📋 **Evidence Review**: We examine project details, communications, photos, and agreements 💰 **Escrow Protection**: Funds remain protected during dispute resolution process ⚖️ **Fair Outcomes**: Refunds, partial payments, re-work arrangements, or contractor replacement 🕐 **Timeline**: Most disputes resolved within 3-5 business days 📞 **Escalation**: Complex cases reviewed by senior resolution specialists',
 6);

-- Update timestamps
UPDATE chatbot_knowledge SET updated_at = CURRENT_TIMESTAMP WHERE id > 0;