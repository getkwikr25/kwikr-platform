// Stripe Payment Processing Integration
// Production-ready payment processing with Canadian support
import Stripe from 'stripe'

export interface StripePaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
  };
  billing_details: {
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string; // Province in Canada
      postal_code: string;
      country: string;
    };
    email: string;
    name: string;
    phone?: string;
  };
}

export interface PaymentIntent {
  id: string;
  amount: number; // in cents
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  client_secret: string;
  payment_method?: string;
  charges?: {
    data: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      payment_method_details: any;
    }>;
  };
}

export interface StripeError {
  type: string;
  code: string;
  message: string;
  param?: string;
  decline_code?: string;
}

export interface PaymentProcessingResult {
  success: boolean;
  payment_intent?: PaymentIntent;
  transaction_id?: string;
  error?: StripeError;
  requires_action?: boolean;
  client_secret?: string;
}

/**
 * Production Stripe Payment Service with Canadian Support
 */
export class StripePaymentService {
  private stripePublishableKey: string;
  private stripeSecretKey: string;
  private webhookSecret: string;
  private stripe: Stripe;

  constructor(env?: any) {
    // Get environment variables from Cloudflare Workers env or process.env
    this.stripePublishableKey = env?.STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_not_configured';
    this.stripeSecretKey = env?.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || 'sk_test_not_configured';
    this.webhookSecret = env?.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || 'whsec_not_configured';
    
    // Initialize Stripe SDK
    this.stripe = new Stripe(this.stripeSecretKey, {
      apiVersion: '2024-06-20', // Latest Stripe API version
      typescript: true
    });
  }

  /**
   * Create a payment intent for booking payment
   */
  async createPaymentIntent(params: {
    amount_cents: number;
    client_id: number;
    booking_id: number;
    currency?: string;
    payment_method_types?: string[];
    metadata?: Record<string, string>;
  }): Promise<PaymentProcessingResult> {
    try {
      const paymentIntentData = {
        amount: params.amount_cents,
        currency: params.currency || 'cad',
        payment_method_types: params.payment_method_types || ['card'],
        metadata: {
          client_id: params.client_id.toString(),
          booking_id: params.booking_id.toString(),
          ...params.metadata
        },
        // Canadian-specific settings
        statement_descriptor: 'BOOKING PAYMENT',
        receipt_email: null, // Will be set when payment method is attached
        setup_future_usage: 'off_session', // Allow saving for future payments
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never' // Prevent redirect-based payment methods
        }
      };

      // Create actual Stripe Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentData);

      return {
        success: true,
        payment_intent: paymentIntent,
        client_secret: paymentIntent.client_secret,
        transaction_id: paymentIntent.id
      };

    } catch (error) {
      console.error('Payment intent creation failed:', error);
      return {
        success: false,
        error: this.parseStripeError(error)
      };
    }
  }

  /**
   * Confirm payment intent with payment method
   */
  async confirmPaymentIntent(
    payment_intent_id: string,
    payment_method_id: string,
    return_url?: string
  ): Promise<PaymentProcessingResult> {
    try {
      const confirmationData = {
        payment_method: payment_method_id,
        return_url: return_url || 'https://your-app.com/payment/return',
        expand: ['charges']
      };

      const paymentIntent = await this.stripe.paymentIntents.confirm(payment_intent_id, confirmationData);

      const result: PaymentProcessingResult = {
        success: paymentIntent.status === 'succeeded',
        payment_intent: paymentIntent,
        transaction_id: payment_intent_id
      };

      // Handle different payment statuses
      if (paymentIntent.status === 'requires_action') {
        result.requires_action = true;
        result.client_secret = paymentIntent.client_secret;
      }

      return result;

    } catch (error) {
      console.error('Payment confirmation failed:', error);
      return {
        success: false,
        error: this.parseStripeError(error)
      };
    }
  }

  /**
   * Create a payment method (credit card, bank account)
   */
  async createPaymentMethod(params: {
    type: 'card' | 'us_bank_account';
    card?: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    };
    us_bank_account?: {
      routing_number: string;
      account_number: string;
      account_holder_type: 'individual' | 'company';
      account_type: 'checking' | 'savings';
    };
    billing_details: {
      address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
      };
      email: string;
      name: string;
      phone?: string;
    };
  }): Promise<{ success: boolean; payment_method?: StripePaymentMethod; error?: StripeError }> {
    try {
      // Create actual Stripe Payment Method
      const paymentMethod = await this.stripe.paymentMethods.create(params);

      return {
        success: true,
        payment_method: paymentMethod
      };

    } catch (error) {
      return {
        success: false,
        error: this.parseStripeError(error)
      };
    }
  }

  /**
   * Create a Stripe customer for recurring payments
   */
  async createCustomer(params: {
    email: string;
    name: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    metadata?: Record<string, string>;
  }): Promise<{ success: boolean; customer_id?: string; error?: StripeError }> {
    try {
      const customer = await this.stripe.customers.create(params);

      return {
        success: true,
        customer_id: customer.id
      };

    } catch (error) {
      return {
        success: false,
        error: this.parseStripeError(error)
      };
    }
  }

  /**
   * Attach payment method to customer for future use
   */
  async attachPaymentMethodToCustomer(
    payment_method_id: string,
    customer_id: string
  ): Promise<{ success: boolean; error?: StripeError }> {
    try {
      await this.stripe.paymentMethods.attach(payment_method_id, {
        customer: customer_id
      });

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: this.parseStripeError(error)
      };
    }
  }

  /**
   * Create refund for a charge
   */
  async createRefund(params: {
    charge_id?: string;
    payment_intent_id?: string;
    amount?: number; // partial refund amount in cents
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
    metadata?: Record<string, string>;
  }): Promise<{ success: boolean; refund_id?: string; error?: StripeError }> {
    try {
      const refundData = {
        ...params,
        expand: ['charge']
      };

      const refund = await this.stripe.refunds.create(refundData);

      return {
        success: true,
        refund_id: refund.id
      };

    } catch (error) {
      return {
        success: false,
        error: this.parseStripeError(error)
      };
    }
  }

  /**
   * Get payment intent details
   */
  async getPaymentIntent(payment_intent_id: string): Promise<{ success: boolean; payment_intent?: PaymentIntent; error?: StripeError }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(payment_intent_id);

      return {
        success: true,
        payment_intent: paymentIntent
      };

    } catch (error) {
      return {
        success: false,
        error: this.parseStripeError(error)
      };
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(
    payload: string,
    signature: string
  ): Promise<{ success: boolean; event?: any; error?: string }> {
    try {
      // Verify webhook signature using Stripe SDK
      const event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);

      // Process different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'charge.dispute.created':
          await this.handleChargeDispute(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePayment(event.data.object);
          break;
        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }

      return {
        success: true,
        event: event
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed'
      };
    }
  }

  /**
   * Calculate Canadian taxes (GST/HST) for a transaction
   */
  calculateCanadianTaxes(params: {
    subtotal_cents: number;
    province: string;
    service_type: string;
  }): {
    gst_rate: number;
    pst_rate: number;
    hst_rate: number;
    gst_amount_cents: number;
    pst_amount_cents: number;
    hst_amount_cents: number;
    total_tax_cents: number;
  } {
    // Canadian tax rates by province (2024)
    const taxRates: Record<string, { gst: number; pst: number; hst: number }> = {
      'AB': { gst: 0.05, pst: 0.00, hst: 0.00 }, // Alberta
      'BC': { gst: 0.05, pst: 0.07, hst: 0.00 }, // British Columbia
      'MB': { gst: 0.05, pst: 0.07, hst: 0.00 }, // Manitoba
      'NB': { gst: 0.00, pst: 0.00, hst: 0.15 }, // New Brunswick
      'NL': { gst: 0.00, pst: 0.00, hst: 0.15 }, // Newfoundland and Labrador
      'NT': { gst: 0.05, pst: 0.00, hst: 0.00 }, // Northwest Territories
      'NS': { gst: 0.00, pst: 0.00, hst: 0.15 }, // Nova Scotia
      'NU': { gst: 0.05, pst: 0.00, hst: 0.00 }, // Nunavut
      'ON': { gst: 0.00, pst: 0.00, hst: 0.13 }, // Ontario
      'PE': { gst: 0.00, pst: 0.00, hst: 0.15 }, // Prince Edward Island
      'QC': { gst: 0.05, pst: 0.09975, hst: 0.00 }, // Quebec
      'SK': { gst: 0.05, pst: 0.06, hst: 0.00 }, // Saskatchewan
      'YT': { gst: 0.05, pst: 0.00, hst: 0.00 }  // Yukon
    };

    const rates = taxRates[params.province] || taxRates['ON']; // Default to Ontario

    const gstAmount = Math.round(params.subtotal_cents * rates.gst);
    const pstAmount = Math.round(params.subtotal_cents * rates.pst);
    const hstAmount = Math.round(params.subtotal_cents * rates.hst);

    return {
      gst_rate: rates.gst,
      pst_rate: rates.pst,
      hst_rate: rates.hst,
      gst_amount_cents: gstAmount,
      pst_amount_cents: pstAmount,
      hst_amount_cents: hstAmount,
      total_tax_cents: gstAmount + pstAmount + hstAmount
    };
  }

  /**
   * Check if Stripe is properly configured
   */
  isConfigured(): boolean {
    return this.stripeSecretKey !== 'sk_test_not_configured' && 
           this.stripePublishableKey !== 'pk_test_not_configured';
  }

  /**
   * Get Stripe publishable key for frontend
   */
  getPublishableKey(): string {
    return this.stripePublishableKey;
  }

  // Private helper methods

  private parseStripeError(error: any): StripeError {
    if (error.type === 'StripeCardError' || error.type === 'card_error') {
      return {
        type: 'card_error',
        code: error.code || 'card_declined',
        message: error.message || 'Your card was declined.',
        decline_code: error.decline_code
      };
    }

    if (error.type === 'StripeInvalidRequestError') {
      return {
        type: 'invalid_request_error',
        code: error.code || 'invalid_request',
        message: error.message || 'Invalid request.',
        param: error.param
      };
    }

    return {
      type: 'api_error',
      code: error.code || 'api_error',
      message: error.message || 'An unexpected error occurred.'
    };
  }

  private async handlePaymentSucceeded(paymentIntent: PaymentIntent): Promise<void> {
    console.log('Payment succeeded:', paymentIntent.id);
    // Update database, send confirmation emails, etc.
  }

  private async handlePaymentFailed(paymentIntent: PaymentIntent): Promise<void> {
    console.log('Payment failed:', paymentIntent.id);
    // Update database, notify user, etc.
  }

  private async handleChargeDispute(dispute: any): Promise<void> {
    console.log('Charge dispute created:', dispute.id);
    // Handle dispute process
  }

  private async handleInvoicePayment(invoice: any): Promise<void> {
    console.log('Invoice payment succeeded:', invoice.id);
    // Update invoice status
  }
}

/**
 * Stripe configuration helper
 */
export class StripeConfigManager {
  static getClientConfig() {
    return {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_not_configured',
      appearance: {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#00C881', // Kwikr green
          colorBackground: '#ffffff',
          colorText: '#1a1a1a',
          colorDanger: '#df1b41',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px'
        }
      },
      locale: 'en-CA' as const // Canadian English
    };
  }

  static getPaymentElementOptions() {
    return {
      layout: {
        type: 'accordion' as const,
        defaultCollapsed: false,
        radios: false,
        spacedAccordionItems: true
      },
      paymentMethodOrder: [
        'card',
        'apple_pay',
        'google_pay'
      ],
      business: {
        name: 'Professional Booking System'
      },
      fields: {
        billingDetails: {
          name: 'auto' as const,
          email: 'auto' as const,
          phone: 'auto' as const,
          address: {
            country: 'never' as const, // Always Canada
            line1: 'auto' as const,
            line2: 'auto' as const,
            city: 'auto' as const,
            state: 'auto' as const,
            postalCode: 'auto' as const
          }
        }
      }
    };
  }
}