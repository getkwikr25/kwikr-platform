-- ============================================================================
-- PAYMENT & FINANCIAL SYSTEM - Complete Database Schema
-- 9 Core Features: Payment Processing, Escrow, Invoicing, History, Refunds, 
-- Commission Tracking, Payouts, Tax Reporting, Payment Methods
-- ============================================================================

-- ============================================================================
-- 1. PAYMENT PROCESSING TABLES
-- ============================================================================

-- Payment Methods (Credit Cards, Bank Accounts, etc.)
CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit_card', 'debit_card', 'bank_account', 'paypal', 'apple_pay', 'google_pay')),
    
    -- Stripe Integration Fields
    stripe_payment_method_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    
    -- Card Information (encrypted/tokenized)
    card_last_four TEXT,
    card_brand TEXT, -- visa, mastercard, amex, etc.
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    card_fingerprint TEXT,
    
    -- Bank Account Information
    bank_name TEXT,
    account_type TEXT, -- checking, savings
    account_last_four TEXT,
    routing_number_last_four TEXT,
    
    -- Status and Metadata
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_method TEXT, -- micro_deposits, instant, manual
    verification_date DATETIME,
    
    -- Address for Card Verification
    billing_address_line1 TEXT,
    billing_address_line2 TEXT,
    billing_city TEXT,
    billing_province TEXT,
    billing_postal_code TEXT,
    billing_country TEXT DEFAULT 'CA',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payment Transactions (All payment activity)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Transaction Identification
    transaction_id TEXT UNIQUE NOT NULL, -- Internal transaction ID
    stripe_payment_intent_id TEXT UNIQUE, -- Stripe Payment Intent ID
    stripe_charge_id TEXT, -- Stripe Charge ID
    
    -- Transaction Parties
    payer_id INTEGER NOT NULL, -- Client making payment
    payee_id INTEGER, -- Worker receiving payment (NULL for platform fees)
    booking_id INTEGER, -- Associated booking
    invoice_id INTEGER, -- Associated invoice
    
    -- Transaction Details
    type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'payout', 'fee', 'chargeback', 'dispute')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'disputed', 'refunded')),
    
    -- Financial Amounts (in cents to avoid floating point issues)
    amount_total INTEGER NOT NULL, -- Total amount in cents
    amount_subtotal INTEGER NOT NULL, -- Subtotal before fees
    platform_fee INTEGER NOT NULL DEFAULT 0, -- Platform commission
    stripe_fee INTEGER NOT NULL DEFAULT 0, -- Stripe processing fee
    tax_amount INTEGER NOT NULL DEFAULT 0, -- Applicable taxes
    
    -- Currency and Geography
    currency TEXT NOT NULL DEFAULT 'CAD',
    exchange_rate DECIMAL(10,6) DEFAULT 1.0,
    
    -- Payment Method Used
    payment_method_id INTEGER,
    payment_method_type TEXT,
    
    -- Timing
    initiated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    completed_at DATETIME,
    failed_at DATETIME,
    
    -- Failure and Error Handling
    failure_code TEXT,
    failure_message TEXT,
    stripe_error_code TEXT,
    
    -- Metadata
    description TEXT,
    metadata TEXT, -- JSON metadata
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (payer_id) REFERENCES users(id),
    FOREIGN KEY (payee_id) REFERENCES users(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);

-- ============================================================================
-- 2. ESCROW SYSTEM TABLES
-- ============================================================================

-- Escrow Accounts (Hold funds until job completion)
CREATE TABLE IF NOT EXISTS escrow_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Escrow Identification
    escrow_id TEXT UNIQUE NOT NULL,
    
    -- Parties Involved
    client_id INTEGER NOT NULL,
    worker_id INTEGER NOT NULL,
    booking_id INTEGER NOT NULL,
    
    -- Financial Details
    total_amount INTEGER NOT NULL, -- Total escrow amount in cents
    service_amount INTEGER NOT NULL, -- Amount for service
    platform_fee INTEGER NOT NULL, -- Platform commission
    processing_fee INTEGER NOT NULL, -- Payment processing fee
    
    -- Escrow Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'funded', 'released', 'disputed', 'refunded', 'expired')),
    
    -- Timing Controls
    funded_at DATETIME,
    release_scheduled_at DATETIME, -- Auto-release date
    released_at DATETIME,
    disputed_at DATETIME,
    
    -- Release Conditions
    auto_release_days INTEGER DEFAULT 7, -- Auto-release after N days
    requires_client_approval BOOLEAN DEFAULT TRUE,
    requires_worker_confirmation BOOLEAN DEFAULT TRUE,
    
    -- Approval Status
    client_approved BOOLEAN DEFAULT FALSE,
    client_approved_at DATETIME,
    worker_confirmed BOOLEAN DEFAULT FALSE,
    worker_confirmed_at DATETIME,
    admin_override BOOLEAN DEFAULT FALSE,
    admin_override_by INTEGER,
    admin_override_at DATETIME,
    
    -- Associated Transactions
    funding_transaction_id INTEGER,
    release_transaction_id INTEGER,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES users(id),
    FOREIGN KEY (worker_id) REFERENCES users(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (funding_transaction_id) REFERENCES payment_transactions(id),
    FOREIGN KEY (release_transaction_id) REFERENCES payment_transactions(id)
);

-- Escrow Events (Detailed escrow activity log)
CREATE TABLE IF NOT EXISTS escrow_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    escrow_id INTEGER NOT NULL,
    
    event_type TEXT NOT NULL CHECK (event_type IN ('created', 'funded', 'release_requested', 'released', 'disputed', 'refunded', 'auto_released', 'admin_override')),
    initiated_by INTEGER, -- User who initiated the event
    
    -- Event Details
    amount_cents INTEGER,
    previous_status TEXT,
    new_status TEXT,
    reason TEXT,
    notes TEXT,
    
    -- Automated Event Info
    is_automated BOOLEAN DEFAULT FALSE,
    automation_trigger TEXT, -- 'schedule', 'completion', 'dispute_resolution'
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (escrow_id) REFERENCES escrow_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (initiated_by) REFERENCES users(id)
);

-- ============================================================================
-- 3. INVOICE SYSTEM TABLES
-- ============================================================================

-- Invoices (Automated invoice generation)
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Invoice Identification
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_type TEXT NOT NULL DEFAULT 'service' CHECK (invoice_type IN ('service', 'platform_fee', 'subscription', 'refund', 'adjustment')),
    
    -- Invoice Parties
    client_id INTEGER NOT NULL,
    worker_id INTEGER,
    booking_id INTEGER,
    
    -- Financial Details
    subtotal_cents INTEGER NOT NULL,
    tax_rate DECIMAL(5,4) DEFAULT 0.13, -- Canadian HST/GST rate
    tax_amount_cents INTEGER NOT NULL DEFAULT 0,
    platform_fee_cents INTEGER NOT NULL DEFAULT 0,
    total_amount_cents INTEGER NOT NULL,
    
    currency TEXT NOT NULL DEFAULT 'CAD',
    
    -- Invoice Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded')),
    
    -- Timing
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    sent_date DATE,
    viewed_date DATE,
    paid_date DATE,
    
    -- Invoice Content
    description TEXT NOT NULL,
    line_items TEXT, -- JSON array of line items
    notes TEXT,
    terms TEXT,
    
    -- Payment Information
    payment_method TEXT,
    payment_transaction_id INTEGER,
    
    -- Tax Information (Canadian Requirements)
    business_number TEXT, -- CRA Business Number
    gst_hst_number TEXT, -- GST/HST Registration Number
    tax_classification TEXT, -- 'gst', 'hst', 'pst', 'exempt'
    
    -- Address Information
    billing_address TEXT, -- JSON billing address
    service_address TEXT, -- JSON service address
    
    -- File Storage
    pdf_url TEXT, -- Generated PDF URL
    pdf_generated_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES users(id),
    FOREIGN KEY (worker_id) REFERENCES users(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id)
);

-- Invoice Line Items (Detailed billing items)
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    
    -- Line Item Details
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit_price_cents INTEGER NOT NULL,
    total_price_cents INTEGER NOT NULL,
    
    -- Service/Product Information
    service_category TEXT,
    booking_date DATE,
    hours_worked DECIMAL(5,2),
    
    -- Tax Information
    is_taxable BOOLEAN DEFAULT TRUE,
    tax_rate DECIMAL(5,4),
    tax_amount_cents INTEGER DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- ============================================================================
-- 4. REFUND MANAGEMENT TABLES
-- ============================================================================

-- Refunds (Handle disputes and refunds)
CREATE TABLE IF NOT EXISTS refunds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Refund Identification
    refund_id TEXT UNIQUE NOT NULL,
    stripe_refund_id TEXT UNIQUE,
    
    -- Associated Records
    original_transaction_id INTEGER NOT NULL,
    booking_id INTEGER,
    invoice_id INTEGER,
    
    -- Refund Details
    refund_amount_cents INTEGER NOT NULL,
    refund_reason TEXT NOT NULL CHECK (refund_reason IN ('cancelled_by_client', 'cancelled_by_worker', 'service_not_provided', 'quality_issue', 'duplicate_charge', 'fraud', 'admin_adjustment', 'other')),
    
    -- Status Tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled')),
    
    -- Refund Processing
    refund_method TEXT, -- 'original_payment_method', 'store_credit', 'manual'
    processing_fee_cents INTEGER DEFAULT 0,
    net_refund_cents INTEGER NOT NULL,
    
    -- Dispute Information
    is_dispute BOOLEAN DEFAULT FALSE,
    dispute_id TEXT,
    chargeback_id TEXT,
    
    -- Approval Workflow
    requires_approval BOOLEAN DEFAULT FALSE,
    requested_by INTEGER NOT NULL,
    approved_by INTEGER,
    approved_at DATETIME,
    
    -- Timing
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    completed_at DATETIME,
    
    -- Documentation
    reason_description TEXT,
    admin_notes TEXT,
    attachments TEXT, -- JSON array of file URLs
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (original_transaction_id) REFERENCES payment_transactions(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- ============================================================================
-- 5. COMMISSION AND FEE TRACKING TABLES
-- ============================================================================

-- Platform Fee Configuration
CREATE TABLE IF NOT EXISTS platform_fee_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Fee Structure
    fee_name TEXT NOT NULL,
    fee_type TEXT NOT NULL CHECK (fee_type IN ('percentage', 'fixed', 'tiered', 'subscription')),
    
    -- Percentage Fees
    percentage_rate DECIMAL(5,4), -- e.g., 0.0350 for 3.5%
    
    -- Fixed Fees
    fixed_amount_cents INTEGER,
    
    -- Tiered Fees (JSON structure)
    tier_structure TEXT, -- JSON: [{"min": 0, "max": 10000, "rate": 0.05}, ...]
    
    -- Applicability
    applies_to TEXT NOT NULL CHECK (applies_to IN ('all', 'clients', 'workers', 'bookings', 'transactions')),
    service_categories TEXT, -- JSON array of applicable categories
    user_tiers TEXT, -- JSON array of applicable subscription tiers
    
    -- Geographic Restrictions
    provinces TEXT, -- JSON array of applicable provinces
    
    -- Timing
    effective_date DATE NOT NULL,
    expiry_date DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Commission Records (Track all platform fees)
CREATE TABLE IF NOT EXISTS commission_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Associated Transaction
    transaction_id INTEGER NOT NULL,
    booking_id INTEGER,
    user_id INTEGER NOT NULL,
    
    -- Commission Details
    commission_type TEXT NOT NULL CHECK (commission_type IN ('booking_fee', 'payment_processing', 'subscription_fee', 'success_fee', 'listing_fee')),
    
    -- Calculation Details
    base_amount_cents INTEGER NOT NULL,
    commission_rate DECIMAL(5,4),
    commission_amount_cents INTEGER NOT NULL,
    
    -- Fee Configuration Used
    fee_config_id INTEGER,
    fee_calculation_method TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'calculated' CHECK (status IN ('calculated', 'collected', 'pending', 'waived', 'disputed')),
    
    collected_at DATETIME,
    waived_at DATETIME,
    waived_reason TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (fee_config_id) REFERENCES platform_fee_config(id)
);

-- ============================================================================
-- 6. PAYOUT SYSTEM TABLES
-- ============================================================================

-- Worker Payout Accounts (Bank accounts for earnings)
CREATE TABLE IF NOT EXISTS payout_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    
    -- Account Type
    account_type TEXT NOT NULL CHECK (account_type IN ('bank_account', 'paypal', 'stripe_express')),
    
    -- Stripe Connect Integration
    stripe_account_id TEXT UNIQUE,
    stripe_account_status TEXT, -- 'pending', 'active', 'restricted', 'inactive'
    
    -- Bank Account Details (Canada)
    bank_name TEXT,
    institution_number TEXT, -- 3-digit institution number
    transit_number TEXT, -- 5-digit transit number
    account_number TEXT, -- Encrypted account number
    account_holder_name TEXT,
    
    -- Address Verification
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'CA',
    
    -- Verification Status
    is_verified BOOLEAN DEFAULT FALSE,
    verification_method TEXT,
    verification_documents TEXT, -- JSON array
    verified_at DATETIME,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payouts (Worker earnings distribution)
CREATE TABLE IF NOT EXISTS payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Payout Identification
    payout_id TEXT UNIQUE NOT NULL,
    stripe_payout_id TEXT UNIQUE,
    
    -- Payout Details
    worker_id INTEGER NOT NULL,
    payout_account_id INTEGER NOT NULL,
    
    -- Financial Information
    gross_earnings_cents INTEGER NOT NULL, -- Total earnings before deductions
    platform_fees_cents INTEGER NOT NULL, -- Platform commission
    processing_fees_cents INTEGER NOT NULL, -- Payment processing fees
    tax_withholding_cents INTEGER DEFAULT 0, -- Tax withholding (if applicable)
    net_payout_cents INTEGER NOT NULL, -- Final payout amount
    
    currency TEXT NOT NULL DEFAULT 'CAD',
    
    -- Payout Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Status Tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'paid', 'failed', 'cancelled')),
    
    -- Timing
    scheduled_date DATE NOT NULL,
    initiated_at DATETIME,
    completed_at DATETIME,
    failed_at DATETIME,
    
    -- Failure Handling
    failure_code TEXT,
    failure_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Transaction Breakdown
    included_transactions TEXT, -- JSON array of transaction IDs
    excluded_transactions TEXT, -- JSON array of excluded transaction IDs
    
    -- Documentation
    description TEXT,
    admin_notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (worker_id) REFERENCES users(id),
    FOREIGN KEY (payout_account_id) REFERENCES payout_accounts(id)
);

-- Payout Transaction Details (Breakdown of individual transactions in payout)
CREATE TABLE IF NOT EXISTS payout_transaction_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payout_id INTEGER NOT NULL,
    transaction_id INTEGER NOT NULL,
    
    -- Financial Breakdown
    transaction_amount_cents INTEGER NOT NULL,
    platform_fee_cents INTEGER NOT NULL,
    net_amount_cents INTEGER NOT NULL,
    
    -- Transaction Info
    booking_id INTEGER,
    service_date DATE,
    service_description TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (payout_id) REFERENCES payouts(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- ============================================================================
-- 7. CANADIAN TAX REPORTING TABLES (CRA Compliance)
-- ============================================================================

-- Tax Information (Worker tax details)
CREATE TABLE IF NOT EXISTS tax_information (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL UNIQUE,
    
    -- Canadian Tax Identification
    sin TEXT, -- Social Insurance Number (encrypted)
    business_number TEXT, -- CRA Business Number (if applicable)
    gst_hst_number TEXT, -- GST/HST Registration Number
    
    -- Worker Classification
    worker_classification TEXT NOT NULL CHECK (worker_classification IN ('employee', 'contractor', 'self_employed', 'corporation')),
    
    -- Tax Residency
    is_canadian_resident BOOLEAN DEFAULT TRUE,
    province_of_residence TEXT,
    
    -- Business Information
    business_name TEXT,
    business_type TEXT, -- 'sole_proprietorship', 'partnership', 'corporation', 'cooperative'
    incorporation_date DATE,
    
    -- Address for Tax Purposes
    tax_address_line1 TEXT,
    tax_address_line2 TEXT,
    tax_city TEXT,
    tax_province TEXT,
    tax_postal_code TEXT,
    
    -- Tax Elections and Status
    gst_hst_registered BOOLEAN DEFAULT FALSE,
    gst_hst_registration_date DATE,
    quarterly_remitter BOOLEAN DEFAULT FALSE,
    
    -- Withholding Information
    tax_withholding_rate DECIMAL(5,4) DEFAULT 0.0,
    backup_withholding BOOLEAN DEFAULT FALSE,
    
    -- Verification
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
    verified_at DATETIME,
    verification_documents TEXT, -- JSON array
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tax Year Records (Annual tax calculations)
CREATE TABLE IF NOT EXISTS tax_year_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    tax_year INTEGER NOT NULL,
    
    -- Annual Totals
    total_earnings_cents INTEGER NOT NULL DEFAULT 0,
    total_platform_fees_cents INTEGER NOT NULL DEFAULT 0,
    total_expenses_cents INTEGER NOT NULL DEFAULT 0, -- If we track expenses
    net_earnings_cents INTEGER NOT NULL DEFAULT 0,
    
    -- Tax Calculations
    gst_hst_collected_cents INTEGER DEFAULT 0,
    gst_hst_paid_cents INTEGER DEFAULT 0,
    income_tax_withheld_cents INTEGER DEFAULT 0,
    cpp_contributions_cents INTEGER DEFAULT 0,
    ei_contributions_cents INTEGER DEFAULT 0,
    
    -- Filing Status
    t4a_required BOOLEAN DEFAULT FALSE, -- Statement of Pension, Retirement, Annuity, and Other Income
    t4a_generated BOOLEAN DEFAULT FALSE,
    t4a_generated_at DATETIME,
    t4a_file_url TEXT,
    
    -- Record Keeping
    record_finalized BOOLEAN DEFAULT FALSE,
    finalized_at DATETIME,
    finalized_by INTEGER,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (worker_id) REFERENCES users(id),
    UNIQUE(worker_id, tax_year)
);

-- T4A Generation (Canadian tax slips)
CREATE TABLE IF NOT EXISTS t4a_slips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    tax_year INTEGER NOT NULL,
    
    -- T4A Identification
    slip_number TEXT UNIQUE NOT NULL,
    
    -- Recipient Information
    recipient_sin TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_address TEXT NOT NULL, -- JSON formatted address
    
    -- Payer Information (Platform)
    payer_business_number TEXT NOT NULL,
    payer_name TEXT NOT NULL,
    payer_address TEXT NOT NULL,
    
    -- T4A Boxes (amounts in cents)
    box_028_other_income INTEGER DEFAULT 0, -- Other income
    box_020_self_employed_commissions INTEGER DEFAULT 0,
    box_048_fees_services INTEGER DEFAULT 0, -- Fees for services
    
    -- Additional Information
    province_of_employment TEXT,
    
    -- Filing Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'filed', 'corrected', 'cancelled')),
    
    -- File Generation
    pdf_generated BOOLEAN DEFAULT FALSE,
    pdf_file_url TEXT,
    xml_file_url TEXT, -- For CRA electronic filing
    
    -- Filing Dates
    generated_at DATETIME,
    filed_at DATETIME,
    due_date DATE, -- Last day of February following tax year
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (worker_id) REFERENCES users(id),
    UNIQUE(worker_id, tax_year)
);

-- ============================================================================
-- 8. PAYMENT SYSTEM CONFIGURATION TABLES
-- ============================================================================

-- Payment System Settings
CREATE TABLE IF NOT EXISTS payment_system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Configuration Key-Value
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    config_type TEXT NOT NULL CHECK (config_type IN ('string', 'integer', 'decimal', 'boolean', 'json')),
    
    -- Configuration Categories
    category TEXT NOT NULL CHECK (category IN ('stripe', 'fees', 'payouts', 'taxes', 'escrow', 'limits')),
    
    -- Description and Constraints
    description TEXT,
    validation_rules TEXT, -- JSON validation rules
    
    -- Environment
    environment TEXT NOT NULL DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production')),
    
    -- Audit Trail
    updated_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- ============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Payment Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payer ON payment_transactions(payer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payee ON payment_transactions(payee_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON payment_transactions(type);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_date ON payment_transactions(initiated_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe ON payment_transactions(stripe_payment_intent_id);

-- Escrow Accounts Indexes
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_client ON escrow_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_worker ON escrow_accounts(worker_id);
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_booking ON escrow_accounts(booking_id);
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_status ON escrow_accounts(status);
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_release_date ON escrow_accounts(release_scheduled_at);

-- Invoices Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_worker ON invoices(worker_id);
CREATE INDEX IF NOT EXISTS idx_invoices_booking ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Payouts Indexes
CREATE INDEX IF NOT EXISTS idx_payouts_worker ON payouts(worker_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_scheduled_date ON payouts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_payouts_period ON payouts(period_start, period_end);

-- Tax Records Indexes  
CREATE INDEX IF NOT EXISTS idx_tax_year_records_worker_year ON tax_year_records(worker_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_t4a_slips_worker_year ON t4a_slips(worker_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_t4a_slips_status ON t4a_slips(status);

-- Commission Records Indexes
CREATE INDEX IF NOT EXISTS idx_commission_records_transaction ON commission_records(transaction_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_user ON commission_records(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_booking ON commission_records(booking_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_type ON commission_records(commission_type);

-- ============================================================================
-- 10. SAMPLE CONFIGURATION DATA
-- ============================================================================

-- Platform Fee Configuration (Default Canadian rates)
INSERT OR IGNORE INTO platform_fee_config (fee_name, fee_type, percentage_rate, applies_to, effective_date, is_active) VALUES
('Standard Booking Fee', 'percentage', 0.0500, 'bookings', DATE('now'), TRUE),
('Payment Processing Fee', 'percentage', 0.0299, 'transactions', DATE('now'), TRUE),
('Premium Subscription Fee', 'fixed', 9900, 'workers', DATE('now'), TRUE); -- $99.00 in cents

-- Payment System Configuration
INSERT OR IGNORE INTO payment_system_config (config_key, config_value, config_type, category, description, environment) VALUES
('stripe_commission_rate', '0.029', 'decimal', 'stripe', 'Stripe processing fee rate', 'production'),
('stripe_fixed_fee_cents', '30', 'integer', 'stripe', 'Stripe fixed fee per transaction in cents', 'production'),
('default_escrow_days', '7', 'integer', 'escrow', 'Default auto-release period for escrow', 'production'),
('max_refund_days', '30', 'integer', 'fees', 'Maximum days to request refund', 'production'),
('gst_hst_rate', '0.13', 'decimal', 'taxes', 'Default GST/HST rate for Ontario', 'production'),
('payout_schedule', 'weekly', 'string', 'payouts', 'Default payout schedule', 'production'),
('minimum_payout_cents', '2000', 'integer', 'payouts', 'Minimum payout amount ($20.00)', 'production'),
('t4a_threshold_cents', '50000', 'integer', 'taxes', 'T4A generation threshold ($500.00)', 'production');

-- ============================================================================
-- PAYMENT SYSTEM SCHEMA COMPLETE
-- 14 Tables Created for Complete Financial Management:
-- 1. payment_methods - Payment method storage
-- 2. payment_transactions - All payment activity  
-- 3. escrow_accounts - Escrow fund management
-- 4. escrow_events - Escrow activity logging
-- 5. invoices - Automated invoice generation
-- 6. invoice_line_items - Invoice detail breakdown
-- 7. refunds - Refund and dispute management
-- 8. platform_fee_config - Commission configuration
-- 9. commission_records - Fee tracking
-- 10. payout_accounts - Worker bank accounts
-- 11. payouts - Earnings distribution
-- 12. payout_transaction_details - Payout breakdowns
-- 13. tax_information - Canadian tax details
-- 14. tax_year_records - Annual tax calculations
-- 15. t4a_slips - Canadian tax slip generation
-- 16. payment_system_config - System configuration
-- ============================================================================