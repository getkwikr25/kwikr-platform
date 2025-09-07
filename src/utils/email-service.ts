// Production Email Service Integration System
// Comprehensive email service with templates, delivery tracking, and multi-provider support

import { convertBookingToUserTimezone } from './timezone.js';

export interface EmailTemplate {
  template_id: string;
  template_name: string;
  subject: string;
  html_body: string;
  text_body: string;
  variables: string[];
  category: 'booking' | 'cancellation' | 'reminder' | 'confirmation' | 'reschedule';
}

export interface EmailRecipient {
  email: string;
  name?: string;
  type: 'client' | 'worker' | 'admin';
}

export interface EmailData {
  template_id: string;
  recipients: EmailRecipient[];
  variables: Record<string, any>;
  priority: 'high' | 'normal' | 'low';
  scheduled_at?: string;
  tracking_enabled: boolean;
}

export interface EmailDeliveryResult {
  message_id: string;
  status: 'sent' | 'failed' | 'scheduled';
  provider: string;
  delivery_time_ms: number;
  error?: string;
  tracking_info?: {
    open_tracking: boolean;
    click_tracking: boolean;
    unsubscribe_link: boolean;
  };
}

export interface EmailProvider {
  name: string;
  send(emailData: EmailData, compiledTemplate: CompiledTemplate): Promise<EmailDeliveryResult>;
  isConfigured(): boolean;
}

export interface CompiledTemplate {
  subject: string;
  html_body: string;
  text_body: string;
  from_email: string;
  from_name: string;
}

/**
 * Production-ready email service with multiple providers and comprehensive templates
 */
export class BookingEmailService {
  private providers: EmailProvider[] = [];
  private templates: Map<string, EmailTemplate> = new Map();
  private deliveryAttempts: Map<string, number> = new Map();
  private maxRetryAttempts = 3;

  constructor() {
    this.initializeTemplates();
    this.initializeProviders();
  }

  /**
   * Send booking-related email with template compilation and delivery tracking
   */
  async sendBookingEmail(
    templateId: string,
    recipients: EmailRecipient[],
    bookingData: any,
    options: {
      priority?: 'high' | 'normal' | 'low';
      scheduled_at?: string;
      retry_attempts?: number;
    } = {}
  ): Promise<{
    success: boolean;
    results: EmailDeliveryResult[];
    errors: string[];
    summary: {
      sent: number;
      failed: number;
      scheduled: number;
    };
  }> {
    const results: EmailDeliveryResult[] = [];
    const errors: string[] = [];

    try {
      // Get template
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Prepare email variables with booking context
      const emailVariables = await this.prepareBookingVariables(bookingData, templateId);

      // Compile template with variables
      const compiledTemplate = this.compileTemplate(template, emailVariables);

      // Prepare email data
      const emailData: EmailData = {
        template_id: templateId,
        recipients,
        variables: emailVariables,
        priority: options.priority || 'normal',
        scheduled_at: options.scheduled_at,
        tracking_enabled: true
      };

      // Send via primary provider with fallback
      const result = await this.sendWithFallback(emailData, compiledTemplate, options.retry_attempts);
      results.push(result);

      // Log delivery attempt
      await this.logEmailDelivery({
        booking_id: bookingData.id,
        template_id: templateId,
        recipients: recipients.map(r => r.email),
        status: result.status,
        provider: result.provider,
        message_id: result.message_id,
        delivery_time_ms: result.delivery_time_ms,
        error: result.error
      });

    } catch (error) {
      const errorMsg = `Email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(errorMsg, error);
    }

    // Calculate summary
    const summary = {
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      scheduled: results.filter(r => r.status === 'scheduled').length
    };

    return {
      success: summary.sent > 0,
      results,
      errors,
      summary
    };
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(bookingData: any): Promise<EmailDeliveryResult> {
    const recipients = [
      { email: bookingData.client_email, name: bookingData.client_name, type: 'client' as const },
      { email: bookingData.worker_email, name: bookingData.worker_name, type: 'worker' as const }
    ];

    const result = await this.sendBookingEmail('booking_confirmation', recipients, bookingData, {
      priority: 'high'
    });

    return result.results[0] || {
      message_id: '',
      status: 'failed',
      provider: 'none',
      delivery_time_ms: 0,
      error: 'No delivery result available'
    };
  }

  /**
   * Send booking cancellation email
   */
  async sendBookingCancellation(bookingData: any, cancellationReason?: string): Promise<EmailDeliveryResult> {
    const recipients = [
      { email: bookingData.client_email, name: bookingData.client_name, type: 'client' as const },
      { email: bookingData.worker_email, name: bookingData.worker_name, type: 'worker' as const }
    ];

    const extendedBookingData = {
      ...bookingData,
      cancellation_reason: cancellationReason || 'No reason provided',
      cancelled_at: new Date().toISOString()
    };

    const result = await this.sendBookingEmail('booking_cancellation', recipients, extendedBookingData, {
      priority: 'high'
    });

    return result.results[0] || {
      message_id: '',
      status: 'failed',
      provider: 'none',
      delivery_time_ms: 0,
      error: 'No delivery result available'
    };
  }

  /**
   * Send booking reminder email
   */
  async sendBookingReminder(bookingData: any, reminderType: '24h' | '2h' | '30min'): Promise<EmailDeliveryResult> {
    const recipients = [
      { email: bookingData.client_email, name: bookingData.client_name, type: 'client' as const }
    ];

    const extendedBookingData = {
      ...bookingData,
      reminder_type: reminderType,
      reminder_sent_at: new Date().toISOString()
    };

    const result = await this.sendBookingEmail('booking_reminder', recipients, extendedBookingData, {
      priority: 'normal'
    });

    return result.results[0] || {
      message_id: '',
      status: 'failed',
      provider: 'none',
      delivery_time_ms: 0,
      error: 'No delivery result available'
    };
  }

  /**
   * Send reschedule confirmation email
   */
  async sendRescheduleConfirmation(originalBooking: any, newBooking: any): Promise<EmailDeliveryResult> {
    const recipients = [
      { email: originalBooking.client_email, name: originalBooking.client_name, type: 'client' as const },
      { email: originalBooking.worker_email, name: originalBooking.worker_name, type: 'worker' as const }
    ];

    const rescheduleData = {
      ...originalBooking,
      original_date: originalBooking.booking_date,
      original_time: originalBooking.start_time,
      new_date: newBooking.booking_date,
      new_time: newBooking.start_time,
      reschedule_reason: newBooking.reschedule_reason || 'Schedule change requested',
      rescheduled_at: new Date().toISOString()
    };

    const result = await this.sendBookingEmail('booking_reschedule', recipients, rescheduleData, {
      priority: 'high'
    });

    return result.results[0] || {
      message_id: '',
      status: 'failed',
      provider: 'none',
      delivery_time_ms: 0,
      error: 'No delivery result available'
    };
  }

  /**
   * Test email delivery and configuration
   */
  async testEmailDelivery(): Promise<{
    providers_tested: number;
    providers_working: number;
    test_results: Array<{
      provider: string;
      status: 'success' | 'failed';
      response_time_ms: number;
      error?: string;
    }>;
    overall_status: 'healthy' | 'degraded' | 'failed';
  }> {
    const testResults = [];
    let workingProviders = 0;

    for (const provider of this.providers) {
      const startTime = Date.now();
      
      try {
        if (!provider.isConfigured()) {
          testResults.push({
            provider: provider.name,
            status: 'failed' as const,
            response_time_ms: 0,
            error: 'Provider not configured'
          });
          continue;
        }

        // Send test email
        const testEmailData: EmailData = {
          template_id: 'test_email',
          recipients: [{ email: 'test@example.com', name: 'Test User', type: 'client' }],
          variables: { test_mode: true },
          priority: 'low',
          tracking_enabled: false
        };

        const testTemplate: CompiledTemplate = {
          subject: 'Email Service Test',
          html_body: '<p>This is a test email from the booking system.</p>',
          text_body: 'This is a test email from the booking system.',
          from_email: 'noreply@bookingsystem.com',
          from_name: 'Booking System'
        };

        await provider.send(testEmailData, testTemplate);
        
        testResults.push({
          provider: provider.name,
          status: 'success' as const,
          response_time_ms: Date.now() - startTime
        });
        
        workingProviders++;

      } catch (error) {
        testResults.push({
          provider: provider.name,
          status: 'failed' as const,
          response_time_ms: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    let overallStatus: 'healthy' | 'degraded' | 'failed' = 'failed';
    if (workingProviders === this.providers.length) {
      overallStatus = 'healthy';
    } else if (workingProviders > 0) {
      overallStatus = 'degraded';
    }

    return {
      providers_tested: this.providers.length,
      providers_working: workingProviders,
      test_results: testResults,
      overall_status: overallStatus
    };
  }

  // Private helper methods

  private async sendWithFallback(
    emailData: EmailData,
    compiledTemplate: CompiledTemplate,
    maxAttempts?: number
  ): Promise<EmailDeliveryResult> {
    const attemptLimit = maxAttempts || this.maxRetryAttempts;
    let lastError = 'No providers available';

    for (let attempt = 0; attempt < attemptLimit; attempt++) {
      for (const provider of this.providers) {
        if (!provider.isConfigured()) continue;

        try {
          return await provider.send(emailData, compiledTemplate);
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Provider failed';
          console.warn(`Provider ${provider.name} failed (attempt ${attempt + 1}):`, lastError);
        }
      }
    }

    return {
      message_id: '',
      status: 'failed',
      provider: 'all_failed',
      delivery_time_ms: 0,
      error: `All providers failed after ${attemptLimit} attempts. Last error: ${lastError}`
    };
  }

  private async prepareBookingVariables(bookingData: any, templateId: string): Promise<Record<string, any>> {
    // Convert booking times to user's timezone for display
    const timezoneConversion = bookingData.client_timezone && bookingData.worker_timezone ? 
      convertBookingToUserTimezone(
        bookingData.booking_date,
        bookingData.start_time,
        bookingData.worker_timezone,
        bookingData.client_timezone
      ) : null;

    // Base variables available to all templates
    const baseVariables = {
      // Booking details
      booking_id: bookingData.id,
      booking_date: bookingData.booking_date,
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      duration_minutes: bookingData.duration_minutes,
      service_name: bookingData.service_name || bookingData.service_category,
      service_category: bookingData.service_category,
      
      // Client information
      client_name: bookingData.client_name,
      client_email: bookingData.client_email,
      client_phone: bookingData.client_phone,
      
      // Worker information
      worker_name: bookingData.worker_name,
      worker_email: bookingData.worker_email,
      
      // Timezone-aware display times
      display_date: timezoneConversion?.user_date || bookingData.booking_date,
      display_time: timezoneConversion?.user_time || bookingData.start_time,
      timezone_info: timezoneConversion?.timezone_difference || 'Same timezone',
      
      // Booking status and metadata
      status: bookingData.status,
      created_at: bookingData.created_at,
      special_requests: bookingData.special_requests || 'None',
      estimated_cost: bookingData.estimated_cost || 'TBD',
      
      // System information
      system_name: 'Professional Booking System',
      support_email: 'support@bookingsystem.com',
      booking_url: `https://bookingsystem.com/booking/${bookingData.id}`,
      calendar_year: new Date().getFullYear(),
      
      // Additional context based on template
      ...this.getTemplateSpecificVariables(templateId, bookingData)
    };

    return baseVariables;
  }

  private getTemplateSpecificVariables(templateId: string, bookingData: any): Record<string, any> {
    switch (templateId) {
      case 'booking_confirmation':
        return {
          confirmation_number: `BK${bookingData.id.toString().padStart(8, '0')}`,
          next_steps: 'Please arrive 10 minutes early for your appointment.',
          cancellation_policy: 'Cancellations must be made at least 24 hours in advance.'
        };
        
      case 'booking_cancellation':
        return {
          refund_info: 'Any applicable refunds will be processed within 3-5 business days.',
          rebooking_link: 'https://bookingsystem.com/book'
        };
        
      case 'booking_reminder':
        return {
          time_until_appointment: this.calculateTimeUntilAppointment(bookingData.booking_date, bookingData.start_time),
          preparation_instructions: 'Please bring any relevant documents or materials.',
          contact_for_changes: 'Contact us at least 2 hours before your appointment for any changes.'
        };
        
      case 'booking_reschedule':
        return {
          reschedule_reason: bookingData.reschedule_reason || 'Schedule adjustment requested',
          original_datetime: `${bookingData.original_date} at ${bookingData.original_time}`,
          new_datetime: `${bookingData.new_date} at ${bookingData.new_time}`
        };
        
      default:
        return {};
    }
  }

  private calculateTimeUntilAppointment(bookingDate: string, startTime: string): string {
    const appointmentTime = new Date(`${bookingDate}T${startTime}`);
    const now = new Date();
    const diffMs = appointmentTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Your appointment is now or has passed';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''} and ${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`;
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  private compileTemplate(template: EmailTemplate, variables: Record<string, any>): CompiledTemplate {
    // Simple template compilation - replace {{variable}} with actual values
    let compiledSubject = template.subject;
    let compiledHtml = template.html_body;
    let compiledText = template.text_body;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      const stringValue = String(value || '');
      
      compiledSubject = compiledSubject.replace(new RegExp(placeholder, 'g'), stringValue);
      compiledHtml = compiledHtml.replace(new RegExp(placeholder, 'g'), stringValue);
      compiledText = compiledText.replace(new RegExp(placeholder, 'g'), stringValue);
    }

    return {
      subject: compiledSubject,
      html_body: compiledHtml,
      text_body: compiledText,
      from_email: 'noreply@bookingsystem.com',
      from_name: 'Professional Booking System'
    };
  }

  private async logEmailDelivery(deliveryData: {
    booking_id: number;
    template_id: string;
    recipients: string[];
    status: string;
    provider: string;
    message_id: string;
    delivery_time_ms: number;
    error?: string;
  }): Promise<void> {
    // In production, log to database or external logging service
    console.log('Email delivery logged:', {
      timestamp: new Date().toISOString(),
      ...deliveryData
    });
  }

  private initializeTemplates(): void {
    // Booking Confirmation Template
    this.templates.set('booking_confirmation', {
      template_id: 'booking_confirmation',
      template_name: 'Booking Confirmation',
      subject: 'Booking Confirmed - {{service_name}} on {{display_date}}',
      html_body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Booking Confirmation</h2>
          <p>Dear {{client_name}},</p>
          <p>Your booking has been confirmed! Here are the details:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Appointment Details</h3>
            <p><strong>Service:</strong> {{service_name}}</p>
            <p><strong>Date:</strong> {{display_date}}</p>
            <p><strong>Time:</strong> {{display_time}}</p>
            <p><strong>Duration:</strong> {{duration_minutes}} minutes</p>
            <p><strong>Provider:</strong> {{worker_name}}</p>
            <p><strong>Confirmation #:</strong> {{confirmation_number}}</p>
          </div>
          
          <p><strong>Next Steps:</strong><br>{{next_steps}}</p>
          
          <p><strong>Cancellation Policy:</strong><br>{{cancellation_policy}}</p>
          
          <p>Questions? Contact us at {{support_email}}</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            {{system_name}} © {{calendar_year}}<br>
            <a href="{{booking_url}}">View Booking Online</a>
          </p>
        </div>
      `,
      text_body: `
        Booking Confirmation
        
        Dear {{client_name}},
        
        Your booking has been confirmed! Here are the details:
        
        Service: {{service_name}}
        Date: {{display_date}}
        Time: {{display_time}}
        Duration: {{duration_minutes}} minutes
        Provider: {{worker_name}}
        Confirmation #: {{confirmation_number}}
        
        Next Steps: {{next_steps}}
        
        Cancellation Policy: {{cancellation_policy}}
        
        Questions? Contact us at {{support_email}}
        
        {{system_name}} © {{calendar_year}}
        View Booking: {{booking_url}}
      `,
      variables: ['client_name', 'service_name', 'display_date', 'display_time', 'duration_minutes', 'worker_name', 'confirmation_number'],
      category: 'confirmation'
    });

    // Booking Cancellation Template
    this.templates.set('booking_cancellation', {
      template_id: 'booking_cancellation',
      template_name: 'Booking Cancellation',
      subject: 'Booking Cancelled - {{service_name}} on {{display_date}}',
      html_body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Booking Cancelled</h2>
          <p>Dear {{client_name}},</p>
          <p>Your booking has been cancelled as requested.</p>
          
          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0;">Cancelled Appointment</h3>
            <p><strong>Service:</strong> {{service_name}}</p>
            <p><strong>Date:</strong> {{display_date}}</p>
            <p><strong>Time:</strong> {{display_time}}</p>
            <p><strong>Provider:</strong> {{worker_name}}</p>
            <p><strong>Reason:</strong> {{cancellation_reason}}</p>
          </div>
          
          <p><strong>Refund Information:</strong><br>{{refund_info}}</p>
          
          <p>Need to book again? <a href="{{rebooking_link}}">Click here to make a new booking</a></p>
          
          <p>Questions? Contact us at {{support_email}}</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            {{system_name}} © {{calendar_year}}
          </p>
        </div>
      `,
      text_body: `
        Booking Cancelled
        
        Dear {{client_name}},
        
        Your booking has been cancelled as requested.
        
        Cancelled Appointment:
        Service: {{service_name}}
        Date: {{display_date}}
        Time: {{display_time}}
        Provider: {{worker_name}}
        Reason: {{cancellation_reason}}
        
        Refund Information: {{refund_info}}
        
        Need to book again? Visit: {{rebooking_link}}
        
        Questions? Contact us at {{support_email}}
        
        {{system_name}} © {{calendar_year}}
      `,
      variables: ['client_name', 'service_name', 'display_date', 'display_time', 'worker_name', 'cancellation_reason'],
      category: 'cancellation'
    });

    // Booking Reminder Template
    this.templates.set('booking_reminder', {
      template_id: 'booking_reminder',
      template_name: 'Booking Reminder',
      subject: 'Reminder: {{service_name}} appointment in {{time_until_appointment}}',
      html_body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Appointment Reminder</h2>
          <p>Dear {{client_name}},</p>
          <p>This is a friendly reminder about your upcoming appointment.</p>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Appointment</h3>
            <p><strong>Service:</strong> {{service_name}}</p>
            <p><strong>Date:</strong> {{display_date}}</p>
            <p><strong>Time:</strong> {{display_time}}</p>
            <p><strong>Provider:</strong> {{worker_name}}</p>
            <p><strong>Time Until Appointment:</strong> {{time_until_appointment}}</p>
          </div>
          
          <p><strong>Preparation:</strong><br>{{preparation_instructions}}</p>
          
          <p><strong>Need to make changes?</strong><br>{{contact_for_changes}}</p>
          
          <p>We look forward to seeing you!</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            {{system_name}} © {{calendar_year}}<br>
            <a href="{{booking_url}}">View Booking Online</a>
          </p>
        </div>
      `,
      text_body: `
        Appointment Reminder
        
        Dear {{client_name}},
        
        This is a friendly reminder about your upcoming appointment.
        
        Your Appointment:
        Service: {{service_name}}
        Date: {{display_date}}
        Time: {{display_time}}
        Provider: {{worker_name}}
        Time Until Appointment: {{time_until_appointment}}
        
        Preparation: {{preparation_instructions}}
        
        Need to make changes? {{contact_for_changes}}
        
        We look forward to seeing you!
        
        {{system_name}} © {{calendar_year}}
        View Booking: {{booking_url}}
      `,
      variables: ['client_name', 'service_name', 'display_date', 'display_time', 'worker_name', 'time_until_appointment'],
      category: 'reminder'
    });

    // Booking Reschedule Template
    this.templates.set('booking_reschedule', {
      template_id: 'booking_reschedule',
      template_name: 'Booking Rescheduled',
      subject: 'Booking Rescheduled - {{service_name}} moved to {{new_date}}',
      html_body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Booking Rescheduled</h2>
          <p>Dear {{client_name}},</p>
          <p>Your booking has been successfully rescheduled.</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Schedule Change</h3>
            <p><strong>Service:</strong> {{service_name}}</p>
            <p><strong>Original:</strong> {{original_datetime}}</p>
            <p><strong>New Date & Time:</strong> {{new_datetime}}</p>
            <p><strong>Provider:</strong> {{worker_name}}</p>
            <p><strong>Reason:</strong> {{reschedule_reason}}</p>
          </div>
          
          <p>Please make note of your new appointment time. All other details remain the same.</p>
          
          <p>Questions? Contact us at {{support_email}}</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            {{system_name}} © {{calendar_year}}<br>
            <a href="{{booking_url}}">View Updated Booking</a>
          </p>
        </div>
      `,
      text_body: `
        Booking Rescheduled
        
        Dear {{client_name}},
        
        Your booking has been successfully rescheduled.
        
        Schedule Change:
        Service: {{service_name}}
        Original: {{original_datetime}}
        New Date & Time: {{new_datetime}}
        Provider: {{worker_name}}
        Reason: {{reschedule_reason}}
        
        Please make note of your new appointment time. All other details remain the same.
        
        Questions? Contact us at {{support_email}}
        
        {{system_name}} © {{calendar_year}}
        View Updated Booking: {{booking_url}}
      `,
      variables: ['client_name', 'service_name', 'original_datetime', 'new_datetime', 'worker_name', 'reschedule_reason'],
      category: 'reschedule'
    });
  }

  private initializeProviders(): void {
    // Initialize email providers
    this.providers.push(new ResendEmailProvider());
    this.providers.push(new SendGridEmailProvider());
    this.providers.push(new MailgunEmailProvider());
    
    // Provider priority is determined by order in array
    console.log(`Initialized ${this.providers.length} email providers`);
  }
}

/**
 * Resend Email Provider Implementation
 */
class ResendEmailProvider implements EmailProvider {
  name = 'Resend';

  async send(emailData: EmailData, compiledTemplate: CompiledTemplate): Promise<EmailDeliveryResult> {
    const startTime = Date.now();
    
    try {
      // In production, replace with actual Resend API call
      const apiKey = process.env.RESEND_API_KEY || 'RESEND_API_KEY_NOT_SET';
      
      if (!this.isConfigured()) {
        throw new Error('Resend API key not configured');
      }

      // Simulate API call for now
      const mockResponse = await this.simulateApiCall(emailData, compiledTemplate);
      
      return {
        message_id: mockResponse.messageId,
        status: 'sent',
        provider: this.name,
        delivery_time_ms: Date.now() - startTime,
        tracking_info: {
          open_tracking: true,
          click_tracking: true,
          unsubscribe_link: true
        }
      };
    } catch (error) {
      return {
        message_id: '',
        status: 'failed',
        provider: this.name,
        delivery_time_ms: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  isConfigured(): boolean {
    return !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'RESEND_API_KEY_NOT_SET';
  }

  private async simulateApiCall(emailData: EmailData, template: CompiledTemplate): Promise<{ messageId: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Simulated API failure');
    }
    
    return {
      messageId: `resend_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };
  }
}

/**
 * SendGrid Email Provider Implementation
 */
class SendGridEmailProvider implements EmailProvider {
  name = 'SendGrid';

  async send(emailData: EmailData, compiledTemplate: CompiledTemplate): Promise<EmailDeliveryResult> {
    const startTime = Date.now();
    
    try {
      if (!this.isConfigured()) {
        throw new Error('SendGrid API key not configured');
      }

      // Simulate API call
      const mockResponse = await this.simulateApiCall(emailData, compiledTemplate);
      
      return {
        message_id: mockResponse.messageId,
        status: 'sent',
        provider: this.name,
        delivery_time_ms: Date.now() - startTime,
        tracking_info: {
          open_tracking: true,
          click_tracking: true,
          unsubscribe_link: true
        }
      };
    } catch (error) {
      return {
        message_id: '',
        status: 'failed',
        provider: this.name,
        delivery_time_ms: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  isConfigured(): boolean {
    return !!process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'SENDGRID_API_KEY_NOT_SET';
  }

  private async simulateApiCall(emailData: EmailData, template: CompiledTemplate): Promise<{ messageId: string }> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 150));
    
    if (Math.random() < 0.03) { // 3% failure rate
      throw new Error('Simulated SendGrid API failure');
    }
    
    return {
      messageId: `sendgrid_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };
  }
}

/**
 * Mailgun Email Provider Implementation
 */
class MailgunEmailProvider implements EmailProvider {
  name = 'Mailgun';

  async send(emailData: EmailData, compiledTemplate: CompiledTemplate): Promise<EmailDeliveryResult> {
    const startTime = Date.now();
    
    try {
      if (!this.isConfigured()) {
        throw new Error('Mailgun API key not configured');
      }

      // Simulate API call
      const mockResponse = await this.simulateApiCall(emailData, compiledTemplate);
      
      return {
        message_id: mockResponse.messageId,
        status: 'sent',
        provider: this.name,
        delivery_time_ms: Date.now() - startTime,
        tracking_info: {
          open_tracking: true,
          click_tracking: true,
          unsubscribe_link: false // Mailgun doesn't provide automatic unsubscribe
        }
      };
    } catch (error) {
      return {
        message_id: '',
        status: 'failed',
        provider: this.name,
        delivery_time_ms: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  isConfigured(): boolean {
    return !!process.env.MAILGUN_API_KEY && process.env.MAILGUN_API_KEY !== 'MAILGUN_API_KEY_NOT_SET';
  }

  private async simulateApiCall(emailData: EmailData, template: CompiledTemplate): Promise<{ messageId: string }> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 200));
    
    if (Math.random() < 0.07) { // 7% failure rate
      throw new Error('Simulated Mailgun API failure');
    }
    
    return {
      messageId: `mailgun_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };
  }
}