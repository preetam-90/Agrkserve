-- Migration: Seed Platform Knowledge
-- Description: Seeds initial platform identity, founder information, mission/vision,
--              and placeholder legal documents
-- Created: 2026-02-21
-- Depends on: 036_platform_knowledge_base.sql

-- ============================================================================
-- 1. Platform Info
-- ============================================================================
INSERT INTO platform_knowledge (category, key, data, description, is_active, version) VALUES
(
  'platform_info',
  'platform_metadata',
  '{
    "platform_name": "AgriRental",
    "platform_type": "Agricultural equipment rental marketplace",
    "country": "India",
    "target_users": ["Farmers", "Equipment owners", "Agricultural contractors"],
    "business_model": "Peer-to-peer equipment rental with platform mediation",
    "primary_goal": "Reduce farming costs and increase access to mechanization",
    "platform_domain": "AgriRental AI and AgriRental platform ecosystem",
    "website": "https://agrirental.vercel.app",
    "established_year": 2026
  }'::jsonb,
  'Core platform identity and metadata',
  true,
  '1.0.0'
) ON CONFLICT (category, key) DO NOTHING;

-- ============================================================================
-- 2. Founder Information
-- ============================================================================
INSERT INTO platform_knowledge (category, key, data, description, is_active, version) VALUES
(
  'founder',
  'founder_details',
  '{
    "founder_name": "Preetam Kumar Singh",
    "founder_role": "Founder and Lead Developer",
    "founder_background": "Computer Science Engineering student, full-stack developer, AI systems builder",
    "founder_origin": "Banka district, Bihar, India",
    "project_visionary": true,
    "location": "New Delhi, India",
    "github": "https://github.com/preetam-90"
  }'::jsonb,
  'Founder and creator information',
  true,
  '1.0.0'
) ON CONFLICT (category, key) DO NOTHING;

-- ============================================================================
-- 3. Mission & Vision
-- ============================================================================
INSERT INTO platform_knowledge (category, key, data, description, is_active, version) VALUES
(
  'mission',
  'mission_statement',
  '{
    "mission": "Democratize access to agricultural machinery for farmers in India",
    "vision": "Build India''s largest decentralized agricultural equipment network and AI-powered agri-services platform",
    "values": [
      "Empowering farmers with affordable technology",
      "Building sustainable agricultural communities",
      "Transparency and trust in every transaction",
      "Innovation through AI and modern technology"
    ]
  }'::jsonb,
  'Platform mission, vision, and core values',
  true,
  '1.0.0'
) ON CONFLICT (category, key) DO NOTHING;

-- ============================================================================
-- 4. FAQs (Structured)
-- ============================================================================
INSERT INTO platform_knowledge (category, key, data, description, is_active, version) VALUES
(
  'faq',
  'general_faqs',
  '{
    "what_is_agrirental": "AgriRental is an agricultural equipment and labor rental marketplace connecting farmers with equipment owners across India.",
    "how_it_works": "Farmers browse available equipment/labor, request booking, pay through secure gateway, and complete rental. Equipment owners list their machinery and earn from idle assets.",
    "who_can_use": "Farmers, equipment owners, agricultural contractors, and laborers can register and use the platform.",
    "is_it_free": "Using AgriRental is free for farmers. Equipment owners pay a small service fee on completed rentals.",
    "payment_methods": "We support UPI, debit/credit cards, net banking through Razorpay payment gateway.",
    "is_it_safe": "Yes. We verify user identities, use secure payments, and have a review system to build trust.",
    "support_contact": "Email: support@agrirental.com, Phone: +91 XXXXXXXXXX"
  }'::jsonb,
  'Frequently asked questions about the platform',
  true,
  '1.0.0'
) ON CONFLICT (category, key) DO NOTHING;

-- ============================================================================
-- 5. Platform Policies (Structured)
-- ============================================================================
INSERT INTO platform_knowledge (category, key, data, description, is_active, version) VALUES
(
  'policy',
  'platform_rules',
  '{
    "booking_policy": "Bookings are confirmed after payment. Cancellation policies vary by provider. Refunds processed within 5-7 business days.",
    "equipment_condition": "All equipment must be in safe working condition. Providers must accurately describe specifications and maintenance history.",
    "user_conduct": "Users must provide accurate information, treat others respectfully, and not misuse the platform. Violations may result in suspension.",
    "dispute_resolution": "Disputes are handled through the platform support team. Evidence (photos, messages) should be submitted within 48 hours of issue.",
    "equipment_responsibility": "Equipment owner responsible for delivery/pickup. Renter responsible for safe operation and returning in good condition.",
    "damage_liability": "Damage during rental period is renter''s responsibility unless covered by insurance. Normal wear and tear excluded."
  }'::jsonb,
  'Platform rules and user policies',
  true,
  '1.0.0'
) ON CONFLICT (category, key) DO NOTHING;

-- ============================================================================
-- 6. Metadata
-- ============================================================================
INSERT INTO platform_knowledge (category, key, data, description, is_active, version) VALUES
(
  'metadata',
  'system_info',
  '{
    "knowledge_base_version": "1.0.0",
    "last_seeded": "2026-02-21",
    "embedding_dimensions": 768,
    "embedding_model": "Cloudflare bge-base-en-v1.5",
    "ai_model": "Groq Llama 3.1",
    "database": "Supabase PostgreSQL with pgvector"
  }'::jsonb,
  'System metadata and configuration',
  true,
  '1.0.0'
) ON CONFLICT (category, key) DO NOTHING;

-- ============================================================================
-- 7. Placeholder Legal Documents (in platform_documents)
-- ============================================================================
INSERT INTO platform_documents (document_type, title, content, metadata, is_active, version) VALUES
(
  'privacy_policy',
  'Privacy Policy',
  'PRIVACY POLICY
==============

Last Updated: February 21, 2026

1. INFORMATION WE COLLECT
-------------------------
We collect the following information:
- Account information (name, email, phone number)
- Profile information (location, bio, profile picture)
- Equipment and listing data
- Booking and transaction records
- Chat and communication logs
- Usage analytics

2. HOW WE USE YOUR INFORMATION
-----------------------------
We use your information to:
- Operate and maintain the platform
- Process bookings and payments
- Match farmers with equipment providers
- Send notifications and updates
- Improve our services
- Comply with legal obligations

3. INFORMATION SHARING
----------------------
We do not sell your personal information. We share data only:
- With other users as necessary for bookings (limited info)
- With service providers (payment processors, cloud hosting)
- When required by law or to protect our rights
- With your consent

4. DATA SECURITY
---------------
We implement industry-standard security measures:
- Encrypted data transmission (HTTPS)
- Secure authentication (Supabase Auth)
- Access controls and audit logs
- Regular security assessments

5. YOUR RIGHTS
--------------
You have the right to:
- Access your personal data
- Correct inaccurate information
- Delete your account and data
- Opt out of marketing communications
- Data portability

6. DATA RETENTION
----------------
We retain your data only as long as necessary:
- Active accounts: until deletion request
- Deleted accounts: anonymized after 90 days
- Transaction records: retained for legal compliance (7 years)

7. THIRD-PARTY SERVICES
-----------------------
We use trusted third parties:
- Supabase (backend & database)
- Cloudinary (image hosting)
- Razorpay (payment processing)
- Groq AI (AI assistant)
- Vercel (hosting)

Each has its own privacy policy.

8. COOKIES AND TRACKING
-----------------------
We use minimal tracking:
- Essential cookies for authentication
- Umami analytics (privacy-focused, no PII)
- No third-party advertising trackers

9. CHANGES TO THIS POLICY
-------------------------
We may update this policy periodically. Continued use after changes constitutes acceptance. We will notify users of material changes via email or platform notification.

10. CONTACT US
--------------
For privacy concerns:
Email: privacy@agrirental.com
Address: [Your Company Address]
'::text,
  '{
    "category": "legal",
    "tags": ["privacy", "data_protection", "gdpr", "ccpa"],
    "version": "1.0.0"
  }'::jsonb,
  true,
  '1.0.0'
) ON CONFLICT DO NOTHING;

INSERT INTO platform_documents (document_type, title, content, metadata, is_active, version) VALUES
(
  'terms_of_service',
  'Terms of Service',
  'TERMS OF SERVICE
================

Last Updated: February 21, 2026

1. ACCEPTANCE OF TERMS
---------------------
By accessing or using AgriRental, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.

2. ELIGIBILITY
------------
You must be:
- At least 18 years old
- Capable of forming legally binding contracts
- Not prohibited from using the service under applicable law

3. USER ACCOUNTS
---------------
- You are responsible for maintaining account security
- Provide accurate and complete information
- Notify us immediately of unauthorized access
- One account per person/entity

4. PLATFORM SERVICES
-------------------
AgriRental provides:
- Equipment and labor rental marketplace
- Online booking and payment processing
- Messaging and communication tools
- Review and rating system

We are not a party to actual rental agreements between users.

5. USER RESPONSIBILITIES
-----------------------
Equipment Providers:
- List accurate equipment details and pricing
- Maintain equipment in safe working condition
- Deliver as described in booking terms
- Hold valid ownership or permission to rent

Renters:
- Provide accurate booking information
- Use equipment as intended and safely
- Return equipment in agreed condition
- Pay as committed

All Users:
- Treat others with respect
- Not engage in fraud or abuse
- Not use platform for illegal purposes
- Comply with applicable laws

6. PROHIBITED ACTIVITIES
-----------------------
- Creating false or misleading listings
- Circumventing platform fees
- Harassment or abuse of other users
- Uploading malicious content
- Reverse engineering platform technology
- Automated access (bots, scrapers) without permission

7. PAYMENT TERMS
---------------
- All prices in Indian Rupees (₹)
- Payments processed via Razorpay
- Service fees apply to equipment providers (10% of rental value)
- Refunds subject to cancellation policy
- Chargebacks must be justified per payment processor rules

8. INTELLECTUAL PROPERTY
-----------------------
- Platform content and technology © AgriRental
- User-generated content remains yours but grants us license to operate the service
- Feedback and suggestions may be used without compensation

9. DISCLAIMERS
-------------
THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES:
- Not guaranteed to be error-free or uninterrupted
- No warranty of fitness for particular purpose
- Not liable for user conduct or equipment quality
- Not responsible for accidents or damages from rentals

10. LIMITATION OF LIABILITY
--------------------------
TO THE MAXIMUM EXTENT PERMITTED BY LAW, AGRIRENTAL SHALL NOT BE LIABLE FOR:
- Indirect, incidental, or consequential damages
- Loss of profits or data
- Platform downtime
- User disputes or misconduct
- Total liability capped to amount paid by user in past 12 months

11. INDEMNIFICATION
-----------------
You agree to indemnify and hold harmless AgriRental from claims arising from:
- Your use of the platform
- Your violation of these terms
- Your equipment listings or rentals
- Your interactions with other users

12. DISPUTE RESOLUTION
---------------------
- Informal negotiation first (30 days)
- If unresolved, arbitration under Indian Arbitration Act
- Class action waiver: disputes must be individual
- Governing law: Indian law, venue: New Delhi, India

13. TERMINATION
--------------
We may suspend or terminate your access for:
- Violation of these terms
- Fraud or illegal activity
- Extended inactivity (12+ months)

Upon termination, all rights terminate, but surviving provisions remain.

14. CHANGES TO TERMS
-------------------
We may modify these terms. Continued use after changes constitutes acceptance. We will notify users of material changes via email or platform notification.

15. CONTACT INFORMATION
---------------------
For legal notices:
Email: legal@agrirental.com
Address: [Your Company Address]
'::text,
  '{
    "category": "legal",
    "tags": ["terms", "tos", "legal", "contract"],
    "version": "1.0.0"
  }'::jsonb,
  true,
  '1.0.0'
) ON CONFLICT DO NOTHING;

INSERT INTO platform_documents (document_type, title, content, metadata, is_active, version) VALUES
(
  'legal_disclaimer',
  'Legal Disclaimer',
  'LEGAL DISCLAIMER
================

The information provided on AgriRental is for general informational purposes only and does not constitute legal, financial, or professional advice.

1. NO ATTORNEY-CLIENT RELATIONSHIP
----------------------------------
- Using this platform does not create an attorney-client relationship
- We are not lawyers and cannot provide legal advice
- For legal matters, consult a qualified legal professional

2. EQUIPMENT RENTAL DISCLAIMER
------------------------------
- Equipment condition is the responsibility of the provider
- Renters should inspect equipment before use
- Safety is the renter''s responsibility during operation
- AgriRental is not liable for equipment failures, accidents, or injuries

3. FINANCIAL TRANSACTIONS
------------------------
- Prices and fees may change without notice
- Payment processing handled by third-party providers
- AgriRental not responsible for payment processor errors
- Refunds subject to terms of the cancellation policy

4. AI ASSISTANT LIMITATIONS
---------------------------
- The AgriRental AI assistant provides information based on available platform data
- AI responses may occasionally contain inaccuracies
- For critical decisions, verify information directly with platform support
- Do not rely solely on AI for financial or legal decisions

5.no WARRANTY
-------------
THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

6. GOVERNING LAW
---------------
These terms are governed by Indian law. Any disputes shall be resolved in courts of New Delhi, India.

7. UPDATES
---------
We reserve the right to update this disclaimer at any time without notice.
'::text,
  '{
    "category": "legal",
    "tags": ["disclaimer", "liability", "waiver"],
    "version": "1.0.0"
  }'::jsonb,
  true,
  '1.0.0'
) ON CONFLICT DO NOTHING;

INSERT INTO platform_documents (document_type, title, content, metadata, is_active, version) VALUES
(
  'about_platform',
  'About AgriRental',
  'About AgriRental
================

AgriRental is India''s leading agricultural equipment and labor rental marketplace, connecting farmers with equipment owners and skilled laborers across the country.

OUR MISSION
----------
To democratize access to agricultural machinery and reduce farming costs for Indian farmers. We believe every farmer should have access to modern equipment regardless of their financial situation.

THE PROBLEM WE SOLVE
-------------------
Indian agriculture faces critical challenges:
- Small farmers cannot afford expensive machinery (tractors cost ₹5-20 lakhs)
- Equipment sits idle 90% of the time on owners'' fields
- Finding reliable labor is difficult and time-consuming
- Rental processes are fragmented and offline, wasting time

HOW AGRIRENTAL HELPS
-------------------
✅ For Farmers:
   - Access premium equipment without huge investment
   - Compare prices and book in minutes
   - Find skilled laborers for harvesting, planting, etc.
   - Transparent pricing and secure payments

✅ For Equipment Owners:
   - Earn income from idle machinery
   - Set your own rental rates and schedule
   - Safe transactions with guaranteed payment
   - Build reputation through reviews

✅ For Laborers:
   - Find work opportunities nearby
   - Set your daily rates and availability
   - Get paid securely through the platform
   - Build a professional profile with ratings

TECHNOLOGY POWERING AGRIRENTAL
-----------------------------
- Modern Next.js 16 frontend with TypeScript
- Supabase backend with PostGIS geospatial search
- AI assistant for instant support and recommendations
- Real-time chat and notifications
- Cloud-based media storage (Cloudinary)
- Secure payment gateway (Razorpay)

Our platform is designed to be:
🌾 farmer-friendly: Simple interface, Hindi support, mobile-first
🔒 secure: Encrypted transactions, verified users, audit logs
⚡ fast: Edge-optimized, minimal latency
♿ accessible: WCAG 2.1 AA compliant

Join thousands of farmers across India who are already benefiting from AgriRental.

Get started at https://agrirental.vercel.app
'::text,
  '{
    "category": "platform_info",
    "tags": ["about", "mission", "platform_overview"],
    "version": "1.0.0"
  }'::jsonb,
  true,
  '1.0.0'
) ON CONFLICT DO NOTHING;

INSERT INTO platform_documents (document_type, title, content, metadata, is_active, version) VALUES
(
  'founder_story',
  'Founder Story',
  'Founder Story: Preetam Kumar Singh
==================================

AgriRental was founded by Preetam Kumar Singh, a Computer Science Engineering student and full-stack developer based in New Delhi, India. Born and raised in the Banka district of Bihar, Preetam has firsthand understanding of the challenges faced by Indian farmers.

THE INSPIRATION
--------------
Growing up in an agricultural region, Preetam witnessed:
- Farmers struggling with expensive equipment purchases
- Machinery sitting unused for most of the year
- Laborers searching for work while farmers searched for workers
- Outdated rental processes based on phone calls and trust

As a software engineer, Preetam realized technology could bridge these gaps. The vision: Create a decentralized network where farmers share equipment, just as neighbors have helped each other for generations—but scaled across India with trust, technology, and transparency.

THE BUILD
---------
Starting in 2025, Preetam built AgriRental as a modern web application using:
- Next.js 16 with App Router
- Supabase for backend services
- Groq AI for intelligent assistance
- Cloudinary for media management
- Tailwind CSS for responsive design

The platform was launched publicly in February 2026 and has been growing steadily through word-of-mouth in farming communities.

THE VISION
---------
Preetam''s mission: "Build India''s largest decentralized agricultural equipment network and AI-powered agri-services platform."

The goal is not just rentals—but to create an ecosystem where:
- Every farmer has access to modern machinery
- Equipment owners earn fair income
- Agricultural labor is organized and valued
- AI helps farmers make better decisions

THE FOUNDER TODAY
-----------------
When not coding, you''ll find Preetam:
- Researching AI applications in agriculture
- Visiting farming communities in Bihar and Uttar Pradesh
- Improving AgriRental based on user feedback
- Writing technical tutorials and open-source code

Connect: https://github.com/preetam-90
'::text,
  '{
    "category": "founder",
    "tags": ["founder_story", "background", "vision"],
    "version": "1.0.0"
  }'::jsonb,
  true,
  '1.0.0'
) ON CONFLICT DO NOTHING;

INSERT INTO platform_documents (document_type, title, content, metadata, is_active, version) VALUES
(
  'platform_rules',
  'Platform Rules and Community Guidelines',
  'Platform Rules and Community Guidelines
=====================================

1. USER CONDUCT
--------------
Be respectful and professional in all interactions. Harassment, discrimination, or abusive behavior will not be tolerated.

2. LISTING ACCURACY
------------------
Equipment listings must:
- Be truthful and accurate
- Include actual photos (not stock images)
- Describe true condition and specifications
- Not mislead about availability

3. BOOKING COMMITMENTS
--------------------
Once a booking is confirmed:
- Provider must make equipment available as scheduled
- Renter must complete the rental unless cancellation is approved
- Both parties should communicate promptly

4. COMMUNICATION
---------------
Use the in-app chat for booking coordination. Do not share personal contact information until trust is established.

5. PAYMENT INTEGRITY
-------------------
- Do not attempt to circumvent platform fees
- All payments must go through the platform
- Refund disputes should be raised within 7 days

6. SAFETY REQUIREMENTS
---------------------
- Equipment must be safe to operate
- Renters should have required skills/ licenses
- Report unsafe equipment immediately
- Follow all operational safety guidelines

7. EQUIPMENT CARE
---------------
Renters must:
- Return equipment in the same condition
- Report any damage immediately
- Not misuse or overload equipment
- Follow maintenance guidelines provided

8. REVIEW AUTHENTICITY
--------------------
Write honest, factual reviews. Do not post fake reviews (positive or negative) for yourself or others.

9. ACCOUNT VERIFICATION
----------------------
Provide accurate documents for KYC verification. Fake documents = permanent ban.

10. SUSPENSION AND BANS
----------------------
Violations may result in:
- Temporary suspension
- Permanent account deletion
- Forfeiture of earnings
- Legal action for severe violations

Appeals can be submitted to support@agrirental.com with justification.

11. REPORTING ISSUES
-------------------
Report suspicious activity via:
- Chat with platform support
- Email: support@agrirental.com
- Phone: +91 XXXXXXXXXX

We review all reports within 24 hours.
'::text,
  '{
    "category": "policy",
    "tags": ["rules", "community_guidelines", "user_conduct"],
    "version": "1.0.0"
  }'::jsonb,
  true,
  '1.0.0'
) ON CONFLICT DO NOTHING;

INSERT INTO platform_documents (document_type, title, content, metadata, is_active, version) VALUES
(
  'faq_detailed',
  'Detailed FAQs',
  'Detailed Frequently Asked Questions
==================================

SECTION: GETTING STARTED
-----------------------
Q: How do I sign up?
A: Click "Sign Up" and choose your role (Farmer, Equipment Owner, Laborer). Complete your profile with accurate details.

Q: Is there a verification process?
A: Yes. We verify your phone number and may request ID proof for security. Equipment owners may need to provide ownership documents.

Q: Can I have multiple roles?
A: Yes! You can be both a farmer and an equipment owner. Just add roles in your profile settings.

SECTION: LISTING EQUIPMENT
-------------------------
Q: What equipment can I list?
A: Any agricultural machinery: tractors, harvesters, tillers, threshers, sprayers, trucks, trailers, irrigation equipment, etc.

Q: How do I set my rental price?
A: Based on market rates, equipment age, and your location. Check similar listings for reference. You can change prices anytime.

Q: What if my equipment breaks during rental?
A: Contact support immediately. If damage is due to renter misuse, they are responsible for repair costs. Normal breakdowns are owner''s responsibility.

SECTION: BOOKING EQUIPMENT
-------------------------
Q: How do I book equipment?
A: Browse listings, select dates, submit booking request, make payment via UPI/card. Provider confirms within 24 hours.

Q: Can I cancel a booking?
A: Yes, but cancellation policy depends on provider settings. Some allow free cancellation within 24 hours; others may charge a fee.

Q: What if equipment is not as described?
A: Document the issue with photos and contact support within 24 hours for resolution or refund.

SECTION: PAYMENTS
----------------
Q: What payment methods are accepted?
A: UPI (GPay, PhonePe, Paytm), debit/credit cards, net banking via Razorpay. All payments are secure and encrypted.

Q: When do I get paid as a provider?
A: Payment is released 24 hours after rental completion, minus platform fee (10%). Direct to your bank account.

Q: Are there any hidden fees?
A: No hidden fees. Transparent pricing. Platform fee (10%) is deducted from rental price; renter pays exactly what''s listed.

SECTION: INSURANCE AND SAFETY
----------------------------
Q: Is there insurance for rentals?
A: Optional insurance available for high-value equipment. Covers accidental damage. Details in booking page.

Q: Who is responsible for accidents?
A: Renter is responsible for safe operation. Insurance may cover damages if purchased. We recommend both parties have third-party insurance.

SECTION: DISPUTES AND SUPPORTS
-----------------------------
Q: What if there is a dispute?
A: Use the dispute resolution feature in your booking. Upload evidence (photos, chat logs). Our team resolves within 48 hours.

Q: How do I contact support?
A: Email: support@agrirental.com | Phone: +91 XXXXXXXXXX | In-app chat with support (logged-in users)

Q: What is the response time?
A: We respond within 24 hours. Urgent issues (safety, fraud) are prioritized.

SECTION: TECHNICAL ISSUES
-----------------------
Q: Website not loading properly?
A: Clear cache, try another browser, or contact technical support. Mobile app coming soon!

Q: How do I report a bug?
A: Email details to support@agrirental.com with screenshots if possible.

SECTION: REFUNDS
---------------
Q: How long for a refund?
A: Refund initiated within 48 hours of approval. Bank processing 5-7 business days. UPI refunds are usually instant.

Q: Are there non-refundable deposits?
A: Some high-value equipment may require non-refundable deposit. Clearly marked in listing.

This FAQ is regularly updated. Last updated: February 21, 2026.
'::text,
  '{
    "category": "faq",
    "tags": ["detailed_faq", "help", "user_questions"],
    "version": "1.0.0"
  }'::jsonb,
  true,
  '1.0.0'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. Generate embeddings for all document contents (requires embedding service)
-- ============================================================================
-- Note: Embeddings are typically generated via the knowledge service sync functions.
-- To generate embeddings immediately, run:
--   SELECT sync_platform_documents();
-- But we''ll do that via the application layer instead using the existing
-- embedding-service.ts and knowledge-service.ts infrastructure.

COMMIT;
