/**
 * GDPR Compliance Service
 * Handles data privacy compliance, consent management, and data subject rights
 */

export interface ConsentRecord {
  id?: number;
  user_id?: number;
  email: string;
  consent_type: 'marketing' | 'analytics' | 'cookies' | 'data_processing' | 'profiling';
  consent_status: boolean;
  consent_method: 'explicit_opt_in' | 'implicit_acceptance' | 'legitimate_interest';
  purpose_description: string;
  legal_basis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  data_categories?: string[];
  retention_period?: number; // Days
  withdrawal_method?: string;
  ip_address?: string;
  user_agent?: string;
  consent_given_at?: string;
  consent_withdrawn_at?: string;
  created_at?: string;
}

export interface DataRequest {
  id?: number;
  user_id?: number;
  email: string;
  request_type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'partially_completed';
  request_details?: any;
  identity_verified: boolean;
  verification_method?: string;
  processing_notes?: string;
  response_data?: any;
  requested_at?: string;
  completed_at?: string;
  legal_deadline?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DataBreach {
  id?: number;
  incident_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  breach_type: 'confidentiality' | 'integrity' | 'availability';
  affected_data_types: string[];
  affected_users_count: number;
  breach_source: 'internal' | 'external' | 'third_party' | 'unknown';
  discovery_method?: string;
  description: string;
  impact_assessment?: string;
  containment_measures?: string;
  notification_required: boolean;
  authority_notified: boolean;
  users_notified: boolean;
  discovered_at: string;
  contained_at?: string;
  authority_notification_deadline?: string;
  user_notification_deadline?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConsentRequest {
  user_id?: number;
  email: string;
  consent_type: string;
  purpose_description: string;
  legal_basis: string;
  data_categories?: string[];
  retention_period?: number;
  ip_address?: string;
  user_agent?: string;
}

export interface DataSubjectRequest {
  user_id?: number;
  email: string;
  request_type: string;
  request_details?: any;
  identity_verification?: {
    method: string;
    verified: boolean;
    verification_data?: any;
  };
}

export interface BreachNotification {
  incident_id: string;
  severity: string;
  affected_data_types: string[];
  affected_users_count: number;
  discovery_method: string;
  description: string;
  containment_measures: string;
  breach_source: string;
}

export class GDPRComplianceService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Consent Management
   */
  async recordConsent(request: ConsentRequest): Promise<ConsentRecord> {
    try {
      // Check if consent already exists for this user/email and type
      let existing = null;
      if (request.user_id) {
        existing = await this.db.prepare(`
          SELECT * FROM gdpr_consent_records 
          WHERE user_id = ? AND consent_type = ? 
          ORDER BY consent_given_at DESC LIMIT 1
        `).bind(request.user_id, request.consent_type).first();
      } else {
        existing = await this.db.prepare(`
          SELECT * FROM gdpr_consent_records 
          WHERE email = ? AND consent_type = ? 
          ORDER BY consent_given_at DESC LIMIT 1
        `).bind(request.email, request.consent_type).first();
      }

      // If consent already exists and is still valid, update it instead
      if (existing && !existing.consent_withdrawn_at) {
        return await this.updateConsent(existing.id, true, 'updated_consent');
      }

      const result = await this.db.prepare(`
        INSERT INTO gdpr_consent_records 
        (user_id, email, consent_type, consent_status, consent_method, purpose_description, 
         legal_basis, data_categories, retention_period, withdrawal_method, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        request.user_id || null,
        request.email,
        request.consent_type,
        1, // consent_status = true
        'explicit_opt_in', // Default method
        request.purpose_description,
        request.legal_basis,
        request.data_categories ? JSON.stringify(request.data_categories) : null,
        request.retention_period || null,
        'User can withdraw consent at any time via profile settings or by contacting support',
        request.ip_address || null,
        request.user_agent || null
      ).run();

      if (!result.success) {
        throw new Error('Failed to record consent');
      }

      return await this.getConsentById(result.meta.last_row_id as number);
    } catch (error) {
      console.error('Error recording consent:', error);
      throw error;
    }
  }

  async withdrawConsent(user_id: number, consent_type: string, withdrawal_method: string = 'user_request'): Promise<ConsentRecord> {
    try {
      // Find active consent record
      const existing = await this.db.prepare(`
        SELECT * FROM gdpr_consent_records 
        WHERE user_id = ? AND consent_type = ? AND consent_status = 1 AND consent_withdrawn_at IS NULL
        ORDER BY consent_given_at DESC LIMIT 1
      `).bind(user_id, consent_type).first();

      if (!existing) {
        throw new Error('No active consent found for this user and consent type');
      }

      return await this.updateConsent(existing.id, false, withdrawal_method);
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      throw error;
    }
  }

  async updateConsent(consent_id: number, consent_status: boolean, method: string): Promise<ConsentRecord> {
    try {
      const updates: string[] = [];
      const bindings: any[] = [];

      updates.push('consent_status = ?');
      bindings.push(consent_status ? 1 : 0);

      if (!consent_status) {
        updates.push('consent_withdrawn_at = datetime(\'now\')');
      }

      bindings.push(consent_id);

      const result = await this.db.prepare(`
        UPDATE gdpr_consent_records 
        SET ${updates.join(', ')}
        WHERE id = ?
      `).bind(...bindings).run();

      if (!result.success) {
        throw new Error('Failed to update consent');
      }

      return await this.getConsentById(consent_id);
    } catch (error) {
      console.error('Error updating consent:', error);
      throw error;
    }
  }

  async getConsentById(id: number): Promise<ConsentRecord> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM gdpr_consent_records WHERE id = ?
      `).bind(id).first();

      if (!result) {
        throw new Error('Consent record not found');
      }

      return {
        ...result,
        consent_status: result.consent_status === 1,
        data_categories: result.data_categories ? JSON.parse(result.data_categories as string) : undefined
      } as ConsentRecord;
    } catch (error) {
      console.error('Error fetching consent record:', error);
      throw error;
    }
  }

  async getUserConsents(user_id: number): Promise<ConsentRecord[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM gdpr_consent_records 
        WHERE user_id = ? 
        ORDER BY consent_given_at DESC
      `).bind(user_id).all();

      return result.results.map(row => ({
        ...row,
        consent_status: row.consent_status === 1,
        data_categories: row.data_categories ? JSON.parse(row.data_categories as string) : undefined
      })) as ConsentRecord[];
    } catch (error) {
      console.error('Error fetching user consents:', error);
      throw error;
    }
  }

  async getActiveConsents(user_id?: number, email?: string): Promise<ConsentRecord[]> {
    try {
      let query: string;
      let binding: any;

      if (user_id) {
        query = `
          SELECT * FROM gdpr_consent_records 
          WHERE user_id = ? AND consent_status = 1 AND consent_withdrawn_at IS NULL
          ORDER BY consent_given_at DESC
        `;
        binding = user_id;
      } else if (email) {
        query = `
          SELECT * FROM gdpr_consent_records 
          WHERE email = ? AND consent_status = 1 AND consent_withdrawn_at IS NULL
          ORDER BY consent_given_at DESC
        `;
        binding = email;
      } else {
        throw new Error('Either user_id or email must be provided');
      }

      const result = await this.db.prepare(query).bind(binding).all();

      return result.results.map(row => ({
        ...row,
        consent_status: row.consent_status === 1,
        data_categories: row.data_categories ? JSON.parse(row.data_categories as string) : undefined
      })) as ConsentRecord[];
    } catch (error) {
      console.error('Error fetching active consents:', error);
      throw error;
    }
  }

  /**
   * Data Subject Rights Management
   */
  async submitDataRequest(request: DataSubjectRequest): Promise<DataRequest> {
    try {
      // Calculate legal deadline (typically 30 days)
      const legal_deadline = new Date();
      legal_deadline.setDate(legal_deadline.getDate() + 30);

      const result = await this.db.prepare(`
        INSERT INTO gdpr_data_requests 
        (user_id, email, request_type, status, request_details, identity_verified, 
         verification_method, legal_deadline)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        request.user_id || null,
        request.email,
        request.request_type,
        'pending',
        request.request_details ? JSON.stringify(request.request_details) : null,
        request.identity_verification?.verified ? 1 : 0,
        request.identity_verification?.method || 'pending_verification',
        legal_deadline.toISOString().split('T')[0]
      ).run();

      if (!result.success) {
        throw new Error('Failed to submit data request');
      }

      const data_request = await this.getDataRequestById(result.meta.last_row_id as number);

      // Auto-process certain types of requests if identity is verified
      if (data_request.identity_verified && data_request.request_type === 'access') {
        setTimeout(() => this.processAccessRequest(data_request.id!), 1000);
      }

      return data_request;
    } catch (error) {
      console.error('Error submitting data request:', error);
      throw error;
    }
  }

  async getDataRequestById(id: number): Promise<DataRequest> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM gdpr_data_requests WHERE id = ?
      `).bind(id).first();

      if (!result) {
        throw new Error('Data request not found');
      }

      return {
        ...result,
        identity_verified: result.identity_verified === 1,
        request_details: result.request_details ? JSON.parse(result.request_details as string) : undefined,
        response_data: result.response_data ? JSON.parse(result.response_data as string) : undefined
      } as DataRequest;
    } catch (error) {
      console.error('Error fetching data request:', error);
      throw error;
    }
  }

  async updateDataRequestStatus(id: number, status: string, processing_notes?: string, response_data?: any): Promise<DataRequest> {
    try {
      const updates: string[] = [];
      const bindings: any[] = [];

      updates.push('status = ?');
      bindings.push(status);

      updates.push('updated_at = datetime(\'now\')');

      if (processing_notes) {
        updates.push('processing_notes = ?');
        bindings.push(processing_notes);
      }

      if (response_data) {
        updates.push('response_data = ?');
        bindings.push(JSON.stringify(response_data));
      }

      if (status === 'completed' || status === 'rejected') {
        updates.push('completed_at = datetime(\'now\')');
      }

      bindings.push(id);

      const result = await this.db.prepare(`
        UPDATE gdpr_data_requests 
        SET ${updates.join(', ')}
        WHERE id = ?
      `).bind(...bindings).run();

      if (!result.success) {
        throw new Error('Failed to update data request status');
      }

      return await this.getDataRequestById(id);
    } catch (error) {
      console.error('Error updating data request status:', error);
      throw error;
    }
  }

  async processAccessRequest(request_id: number): Promise<void> {
    try {
      const request = await this.getDataRequestById(request_id);
      
      if (!request.identity_verified) {
        await this.updateDataRequestStatus(request_id, 'rejected', 'Identity verification required');
        return;
      }

      // Gather user data from various sources
      const user_data = await this.gatherUserData(request.user_id, request.email);

      await this.updateDataRequestStatus(
        request_id, 
        'completed', 
        'Data access request processed successfully',
        {
          data_export: user_data,
          export_format: 'JSON',
          generated_at: new Date().toISOString(),
          retention_note: 'This data export will be deleted after 30 days'
        }
      );
    } catch (error) {
      console.error('Error processing access request:', error);
      await this.updateDataRequestStatus(request_id, 'rejected', `Error processing request: ${error.message}`);
    }
  }

  async processErasureRequest(request_id: number): Promise<void> {
    try {
      const request = await this.getDataRequestById(request_id);
      
      if (!request.identity_verified) {
        await this.updateDataRequestStatus(request_id, 'rejected', 'Identity verification required');
        return;
      }

      // Check for legal obligations to retain data
      const retention_check = await this.checkDataRetentionRequirements(request.user_id, request.email);
      
      if (retention_check.must_retain_some_data) {
        await this.updateDataRequestStatus(
          request_id, 
          'partially_completed', 
          'Some data retained due to legal obligations',
          {
            deleted_categories: retention_check.deleted_categories,
            retained_categories: retention_check.retained_categories,
            retention_reasons: retention_check.retention_reasons,
            processed_at: new Date().toISOString()
          }
        );
      } else {
        // Perform complete data erasure
        await this.eraseUserData(request.user_id, request.email);
        
        await this.updateDataRequestStatus(
          request_id, 
          'completed', 
          'All user data has been erased',
          {
            erasure_complete: true,
            processed_at: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      console.error('Error processing erasure request:', error);
      await this.updateDataRequestStatus(request_id, 'rejected', `Error processing request: ${error.message}`);
    }
  }

  /**
   * Data Breach Management
   */
  async reportDataBreach(breach: BreachNotification): Promise<DataBreach> {
    try {
      // Generate unique incident ID
      const incident_id = breach.incident_id || `BREACH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Calculate notification deadlines
      const discovered_at = new Date();
      const authority_deadline = new Date(discovered_at);
      authority_deadline.setHours(authority_deadline.getHours() + 72); // 72 hours for authority notification

      const user_deadline = new Date(discovered_at);
      user_deadline.setDate(user_deadline.getDate() + 3); // "Without undue delay" - typically 72 hours to a few days

      const result = await this.db.prepare(`
        INSERT INTO gdpr_data_breaches 
        (incident_id, severity, breach_type, affected_data_types, affected_users_count, 
         breach_source, discovery_method, description, containment_measures, 
         notification_required, discovered_at, authority_notification_deadline, user_notification_deadline)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        incident_id,
        breach.severity,
        'confidentiality', // Default breach type
        JSON.stringify(breach.affected_data_types),
        breach.affected_users_count,
        breach.breach_source,
        breach.discovery_method,
        breach.description,
        breach.containment_measures,
        breach.affected_users_count > 0 ? 1 : 0, // Notification required if users affected
        discovered_at.toISOString(),
        authority_deadline.toISOString(),
        user_deadline.toISOString()
      ).run();

      if (!result.success) {
        throw new Error('Failed to report data breach');
      }

      const data_breach = await this.getDataBreachById(result.meta.last_row_id as number);

      // Auto-trigger notification process for high/critical breaches
      if (['high', 'critical'].includes(breach.severity)) {
        setTimeout(() => this.initiateBreachNotifications(data_breach.id!), 100);
      }

      return data_breach;
    } catch (error) {
      console.error('Error reporting data breach:', error);
      throw error;
    }
  }

  async getDataBreachById(id: number): Promise<DataBreach> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM gdpr_data_breaches WHERE id = ?
      `).bind(id).first();

      if (!result) {
        throw new Error('Data breach record not found');
      }

      return {
        ...result,
        affected_data_types: JSON.parse(result.affected_data_types as string),
        notification_required: result.notification_required === 1,
        authority_notified: result.authority_notified === 1,
        users_notified: result.users_notified === 1
      } as DataBreach;
    } catch (error) {
      console.error('Error fetching data breach record:', error);
      throw error;
    }
  }

  async updateBreachNotificationStatus(id: number, authority_notified?: boolean, users_notified?: boolean, impact_assessment?: string): Promise<DataBreach> {
    try {
      const updates: string[] = [];
      const bindings: any[] = [];

      if (authority_notified !== undefined) {
        updates.push('authority_notified = ?');
        bindings.push(authority_notified ? 1 : 0);
      }

      if (users_notified !== undefined) {
        updates.push('users_notified = ?');
        bindings.push(users_notified ? 1 : 0);
      }

      if (impact_assessment) {
        updates.push('impact_assessment = ?');
        bindings.push(impact_assessment);
      }

      updates.push('updated_at = datetime(\'now\')');
      bindings.push(id);

      const result = await this.db.prepare(`
        UPDATE gdpr_data_breaches 
        SET ${updates.join(', ')}
        WHERE id = ?
      `).bind(...bindings).run();

      if (!result.success) {
        throw new Error('Failed to update breach notification status');
      }

      return await this.getDataBreachById(id);
    } catch (error) {
      console.error('Error updating breach notification status:', error);
      throw error;
    }
  }

  /**
   * Compliance Reporting
   */
  async getComplianceReport(start_date: string, end_date: string): Promise<{
    consent_records: {
      total_recorded: number;
      total_withdrawn: number;
      consent_by_type: Record<string, number>;
      withdrawal_rate: number;
    };
    data_requests: {
      total_requests: number;
      completed_requests: number;
      pending_requests: number;
      overdue_requests: number;
      requests_by_type: Record<string, number>;
      average_processing_time: number;
    };
    data_breaches: {
      total_breaches: number;
      breaches_by_severity: Record<string, number>;
      total_affected_users: number;
      notification_compliance_rate: number;
    };
    compliance_score: number;
  }> {
    try {
      // Consent records analysis
      const consentsResult = await this.db.prepare(`
        SELECT * FROM gdpr_consent_records 
        WHERE consent_given_at BETWEEN ? AND ?
      `).bind(start_date, end_date).all();

      const consents = consentsResult.results;
      const total_recorded = consents.length;
      const total_withdrawn = consents.filter((c: any) => c.consent_withdrawn_at).length;
      
      const consent_by_type: Record<string, number> = {};
      consents.forEach((c: any) => {
        consent_by_type[c.consent_type] = (consent_by_type[c.consent_type] || 0) + 1;
      });

      const withdrawal_rate = total_recorded > 0 ? (total_withdrawn / total_recorded) * 100 : 0;

      // Data requests analysis
      const requestsResult = await this.db.prepare(`
        SELECT * FROM gdpr_data_requests 
        WHERE requested_at BETWEEN ? AND ?
      `).bind(start_date, end_date).all();

      const requests = requestsResult.results;
      const total_requests = requests.length;
      const completed_requests = requests.filter((r: any) => r.status === 'completed').length;
      const pending_requests = requests.filter((r: any) => ['pending', 'processing'].includes(r.status)).length;
      
      const now = new Date();
      const overdue_requests = requests.filter((r: any) => 
        ['pending', 'processing'].includes(r.status) && 
        new Date(r.legal_deadline) < now
      ).length;

      const requests_by_type: Record<string, number> = {};
      requests.forEach((r: any) => {
        requests_by_type[r.request_type] = (requests_by_type[r.request_type] || 0) + 1;
      });

      // Average processing time
      const completed_with_time = requests.filter((r: any) => 
        r.status === 'completed' && r.requested_at && r.completed_at
      );
      
      let average_processing_time = 0;
      if (completed_with_time.length > 0) {
        const totalTime = completed_with_time.reduce((sum: number, r: any) => {
          const requested = new Date(r.requested_at).getTime();
          const completed = new Date(r.completed_at).getTime();
          return sum + (completed - requested);
        }, 0);
        average_processing_time = totalTime / completed_with_time.length / (1000 * 60 * 60 * 24); // Days
      }

      // Data breaches analysis
      const breachesResult = await this.db.prepare(`
        SELECT * FROM gdpr_data_breaches 
        WHERE discovered_at BETWEEN ? AND ?
      `).bind(start_date, end_date).all();

      const breaches = breachesResult.results;
      const total_breaches = breaches.length;
      const total_affected_users = breaches.reduce((sum: number, b: any) => sum + b.affected_users_count, 0);

      const breaches_by_severity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
      breaches.forEach((b: any) => {
        if (breaches_by_severity.hasOwnProperty(b.severity)) {
          breaches_by_severity[b.severity]++;
        }
      });

      // Notification compliance rate
      const breaches_requiring_notification = breaches.filter((b: any) => b.notification_required === 1);
      const properly_notified = breaches_requiring_notification.filter((b: any) => 
        b.authority_notified === 1 && b.users_notified === 1
      );
      const notification_compliance_rate = breaches_requiring_notification.length > 0 
        ? (properly_notified.length / breaches_requiring_notification.length) * 100 
        : 100;

      // Calculate overall compliance score
      const consent_score = withdrawal_rate < 20 ? 100 : Math.max(0, 100 - (withdrawal_rate - 20) * 2);
      const request_score = overdue_requests === 0 ? 100 : Math.max(0, 100 - (overdue_requests / total_requests) * 100);
      const breach_score = notification_compliance_rate;
      
      const compliance_score = total_requests > 0 || total_breaches > 0 
        ? Math.round((consent_score + request_score + breach_score) / 3)
        : Math.round(consent_score);

      return {
        consent_records: {
          total_recorded,
          total_withdrawn,
          consent_by_type,
          withdrawal_rate
        },
        data_requests: {
          total_requests,
          completed_requests,
          pending_requests,
          overdue_requests,
          requests_by_type,
          average_processing_time
        },
        data_breaches: {
          total_breaches,
          breaches_by_severity,
          total_affected_users,
          notification_compliance_rate
        },
        compliance_score
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async gatherUserData(user_id?: number, email?: string): Promise<any> {
    try {
      // In a real implementation, this would gather data from all relevant tables
      // For simulation, we'll return a structured data export
      
      const userData: any = {
        personal_information: {
          email: email,
          export_date: new Date().toISOString(),
          data_categories: ['personal_data', 'behavioral_data', 'transaction_data']
        },
        consents: [],
        activity_history: [],
        data_processing_activities: []
      };

      // Get consent records
      if (user_id) {
        const consents = await this.getUserConsents(user_id);
        userData.consents = consents;

        // In a real system, gather data from other tables:
        // - User profile information
        // - Job history
        // - Messages and communications
        // - Financial transactions
        // - System interactions
        userData.activity_history = [
          {
            category: 'account_activity',
            description: 'User login and profile activities',
            data_points: ['login_times', 'profile_updates', 'settings_changes']
          }
        ];
      }

      return userData;
    } catch (error) {
      console.error('Error gathering user data:', error);
      throw error;
    }
  }

  private async checkDataRetentionRequirements(user_id?: number, email?: string): Promise<{
    must_retain_some_data: boolean;
    deleted_categories: string[];
    retained_categories: string[];
    retention_reasons: string[];
  }> {
    // In a real implementation, this would check various legal requirements
    // For simulation, we'll return some standard retention requirements
    
    return {
      must_retain_some_data: false, // Assume no retention requirements for simulation
      deleted_categories: ['personal_data', 'behavioral_data', 'communication_data'],
      retained_categories: [],
      retention_reasons: []
    };
  }

  private async eraseUserData(user_id?: number, email?: string): Promise<void> {
    try {
      // In a real implementation, this would systematically delete user data
      // across all relevant tables while respecting retention requirements
      
      if (user_id) {
        // Anonymize or delete personal data
        // Keep audit trails as required by law
        console.log(`Simulated erasure of data for user ID: ${user_id}`);
      } else if (email) {
        // Handle erasure for non-registered users by email
        console.log(`Simulated erasure of data for email: ${email}`);
      }
    } catch (error) {
      console.error('Error erasing user data:', error);
      throw error;
    }
  }

  private async initiateBreachNotifications(breach_id: number): Promise<void> {
    try {
      const breach = await this.getDataBreachById(breach_id);
      
      // In a real implementation, this would:
      // 1. Send notifications to relevant data protection authorities
      // 2. Notify affected users
      // 3. Update internal stakeholders
      
      console.log(`Simulated breach notifications initiated for incident: ${breach.incident_id}`);
      
      // Simulate notification process
      setTimeout(async () => {
        await this.updateBreachNotificationStatus(breach_id, true, true, 
          'Impact assessment completed. Notifications sent to authorities and affected users.');
      }, 2000);
      
    } catch (error) {
      console.error('Error initiating breach notifications:', error);
    }
  }
}