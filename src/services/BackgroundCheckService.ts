/**
 * Background Check Integration Service
 * Handles worker verification through third-party background check providers
 */

export interface BackgroundCheckProvider {
  id?: number;
  name: string;
  api_endpoint: string;
  api_key_name: string;
  is_active: boolean;
  supported_check_types: string[];
  response_time_sla: number;
  created_at?: string;
  updated_at?: string;
}

export interface BackgroundCheck {
  id?: number;
  user_id: number;
  provider_id: number;
  check_type: 'criminal' | 'employment' | 'education' | 'reference' | 'identity';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
  external_check_id?: string;
  request_data?: any;
  result_data?: any;
  verification_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  expiry_date?: string;
  requested_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BackgroundCheckRequest {
  user_id: number;
  provider_name: string;
  check_types: string[];
  personal_info: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    ssn?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip_code: string;
    };
  };
  employment_history?: any[];
  education_history?: any[];
  references?: any[];
}

export interface BackgroundCheckResult {
  check_id: number;
  overall_status: 'pass' | 'fail' | 'conditional' | 'pending';
  verification_score: number;
  risk_level: string;
  individual_checks: {
    type: string;
    status: string;
    details: any;
    flags: string[];
  }[];
  recommendations: string[];
  expiry_date: string;
}

export class BackgroundCheckService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Provider Management
   */
  async createProvider(provider: Omit<BackgroundCheckProvider, 'id' | 'created_at' | 'updated_at'>): Promise<BackgroundCheckProvider> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO background_check_providers 
        (name, api_endpoint, api_key_name, is_active, supported_check_types, response_time_sla)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        provider.name,
        provider.api_endpoint,
        provider.api_key_name,
        provider.is_active ? 1 : 0,
        JSON.stringify(provider.supported_check_types),
        provider.response_time_sla
      ).run();

      if (!result.success) {
        throw new Error('Failed to create background check provider');
      }

      return await this.getProviderById(result.meta.last_row_id as number);
    } catch (error) {
      console.error('Error creating background check provider:', error);
      throw error;
    }
  }

  async getProviders(active_only: boolean = true): Promise<BackgroundCheckProvider[]> {
    try {
      const query = active_only 
        ? `SELECT * FROM background_check_providers WHERE is_active = 1 ORDER BY name`
        : `SELECT * FROM background_check_providers ORDER BY name`;
      
      const result = await this.db.prepare(query).all();
      
      return result.results.map(row => ({
        ...row,
        is_active: row.is_active === 1,
        supported_check_types: JSON.parse(row.supported_check_types as string)
      })) as BackgroundCheckProvider[];
    } catch (error) {
      console.error('Error fetching background check providers:', error);
      throw error;
    }
  }

  async getProviderById(id: number): Promise<BackgroundCheckProvider> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM background_check_providers WHERE id = ?
      `).bind(id).first();

      if (!result) {
        throw new Error('Background check provider not found');
      }

      return {
        ...result,
        is_active: result.is_active === 1,
        supported_check_types: JSON.parse(result.supported_check_types as string)
      } as BackgroundCheckProvider;
    } catch (error) {
      console.error('Error fetching background check provider:', error);
      throw error;
    }
  }

  async getProviderByName(name: string): Promise<BackgroundCheckProvider> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM background_check_providers WHERE name = ? AND is_active = 1
      `).bind(name).first();

      if (!result) {
        throw new Error('Background check provider not found');
      }

      return {
        ...result,
        is_active: result.is_active === 1,
        supported_check_types: JSON.parse(result.supported_check_types as string)
      } as BackgroundCheckProvider;
    } catch (error) {
      console.error('Error fetching background check provider by name:', error);
      throw error;
    }
  }

  /**
   * Background Check Management
   */
  async requestBackgroundCheck(request: BackgroundCheckRequest): Promise<BackgroundCheck[]> {
    try {
      const provider = await this.getProviderByName(request.provider_name);
      const checks: BackgroundCheck[] = [];

      // Create individual background check records for each type
      for (const checkType of request.check_types) {
        if (!provider.supported_check_types.includes(checkType)) {
          throw new Error(`Provider ${provider.name} does not support ${checkType} checks`);
        }

        const result = await this.db.prepare(`
          INSERT INTO background_checks 
          (user_id, provider_id, check_type, status, request_data, requested_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          request.user_id,
          provider.id,
          checkType,
          'pending',
          JSON.stringify({
            personal_info: request.personal_info,
            employment_history: request.employment_history || [],
            education_history: request.education_history || [],
            references: request.references || []
          })
        ).run();

        if (!result.success) {
          throw new Error(`Failed to create ${checkType} background check`);
        }

        const check = await this.getBackgroundCheckById(result.meta.last_row_id as number);
        checks.push(check);

        // Initiate actual background check with provider (would be async in real implementation)
        this.initiateProviderCheck(check, provider, request);
      }

      return checks;
    } catch (error) {
      console.error('Error requesting background checks:', error);
      throw error;
    }
  }

  async getBackgroundCheckById(id: number): Promise<BackgroundCheck> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM background_checks WHERE id = ?
      `).bind(id).first();

      if (!result) {
        throw new Error('Background check not found');
      }

      return {
        ...result,
        request_data: result.request_data ? JSON.parse(result.request_data as string) : null,
        result_data: result.result_data ? JSON.parse(result.result_data as string) : null
      } as BackgroundCheck;
    } catch (error) {
      console.error('Error fetching background check:', error);
      throw error;
    }
  }

  async getUserBackgroundChecks(user_id: number, active_only: boolean = true): Promise<BackgroundCheck[]> {
    try {
      const query = active_only
        ? `SELECT * FROM background_checks WHERE user_id = ? AND status != 'expired' ORDER BY requested_at DESC`
        : `SELECT * FROM background_checks WHERE user_id = ? ORDER BY requested_at DESC`;
      
      const result = await this.db.prepare(query).bind(user_id).all();
      
      return result.results.map(row => ({
        ...row,
        request_data: row.request_data ? JSON.parse(row.request_data as string) : null,
        result_data: row.result_data ? JSON.parse(row.result_data as string) : null
      })) as BackgroundCheck[];
    } catch (error) {
      console.error('Error fetching user background checks:', error);
      throw error;
    }
  }

  async getChecksByStatus(status: string): Promise<BackgroundCheck[]> {
    try {
      const result = await this.db.prepare(`
        SELECT bc.*, bcp.name as provider_name 
        FROM background_checks bc
        JOIN background_check_providers bcp ON bc.provider_id = bcp.id
        WHERE bc.status = ?
        ORDER BY bc.requested_at DESC
      `).bind(status).all();
      
      return result.results.map(row => ({
        ...row,
        request_data: row.request_data ? JSON.parse(row.request_data as string) : null,
        result_data: row.result_data ? JSON.parse(row.result_data as string) : null
      })) as BackgroundCheck[];
    } catch (error) {
      console.error('Error fetching background checks by status:', error);
      throw error;
    }
  }

  async updateCheckStatus(check_id: number, status: string, result_data?: any, external_check_id?: string): Promise<BackgroundCheck> {
    try {
      const updates: string[] = [];
      const bindings: any[] = [];

      updates.push('status = ?');
      bindings.push(status);

      updates.push('updated_at = datetime(\'now\')');

      if (result_data) {
        updates.push('result_data = ?');
        bindings.push(JSON.stringify(result_data));

        if (result_data.verification_score) {
          updates.push('verification_score = ?');
          bindings.push(result_data.verification_score);
        }

        if (result_data.risk_level) {
          updates.push('risk_level = ?');
          bindings.push(result_data.risk_level);
        }

        if (result_data.expiry_date) {
          updates.push('expiry_date = ?');
          bindings.push(result_data.expiry_date);
        }
      }

      if (external_check_id) {
        updates.push('external_check_id = ?');
        bindings.push(external_check_id);
      }

      if (status === 'completed') {
        updates.push('completed_at = datetime(\'now\')');
      }

      bindings.push(check_id);

      const result = await this.db.prepare(`
        UPDATE background_checks 
        SET ${updates.join(', ')}
        WHERE id = ?
      `).bind(...bindings).run();

      if (!result.success) {
        throw new Error('Failed to update background check status');
      }

      return await this.getBackgroundCheckById(check_id);
    } catch (error) {
      console.error('Error updating background check status:', error);
      throw error;
    }
  }

  /**
   * Background Check Analysis
   */
  async getUserComplianceStatus(user_id: number): Promise<{
    overall_status: 'compliant' | 'partial' | 'non_compliant' | 'pending';
    checks_completed: number;
    checks_pending: number;
    checks_failed: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    expiring_soon: BackgroundCheck[];
    recommendations: string[];
  }> {
    try {
      const checks = await this.getUserBackgroundChecks(user_id, true);
      
      const stats = {
        completed: checks.filter(c => c.status === 'completed').length,
        pending: checks.filter(c => ['pending', 'in_progress'].includes(c.status)).length,
        failed: checks.filter(c => c.status === 'failed').length
      };

      // Calculate overall status
      let overall_status: 'compliant' | 'partial' | 'non_compliant' | 'pending';
      if (stats.pending > 0) {
        overall_status = 'pending';
      } else if (stats.failed > 0) {
        overall_status = 'non_compliant';
      } else if (stats.completed === 0) {
        overall_status = 'pending';
      } else if (stats.completed >= 3) { // Assume 3+ checks for full compliance
        overall_status = 'compliant';
      } else {
        overall_status = 'partial';
      }

      // Calculate risk level
      const riskScores = checks
        .filter(c => c.verification_score)
        .map(c => c.verification_score!);
      
      let risk_level: 'low' | 'medium' | 'high' | 'critical';
      if (riskScores.length === 0) {
        risk_level = 'medium';
      } else {
        const avgScore = riskScores.reduce((a, b) => a + b, 0) / riskScores.length;
        if (avgScore >= 80) risk_level = 'low';
        else if (avgScore >= 60) risk_level = 'medium';
        else if (avgScore >= 40) risk_level = 'high';
        else risk_level = 'critical';
      }

      // Find expiring checks (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const expiring_soon = checks.filter(c => 
        c.expiry_date && new Date(c.expiry_date) <= thirtyDaysFromNow
      );

      // Generate recommendations
      const recommendations: string[] = [];
      if (stats.pending > 0) {
        recommendations.push('Complete pending background checks');
      }
      if (stats.failed > 0) {
        recommendations.push('Address failed background checks');
      }
      if (expiring_soon.length > 0) {
        recommendations.push('Renew expiring background checks');
      }
      if (stats.completed < 3) {
        recommendations.push('Consider additional background check types for better compliance');
      }

      return {
        overall_status,
        checks_completed: stats.completed,
        checks_pending: stats.pending,
        checks_failed: stats.failed,
        risk_level,
        expiring_soon,
        recommendations
      };
    } catch (error) {
      console.error('Error calculating user compliance status:', error);
      throw error;
    }
  }

  async getComplianceReport(start_date: string, end_date: string): Promise<{
    total_checks: number;
    completed_checks: number;
    pending_checks: number;
    failed_checks: number;
    average_completion_time: number;
    risk_distribution: Record<string, number>;
    provider_performance: Array<{
      provider_name: string;
      total_checks: number;
      success_rate: number;
      average_response_time: number;
    }>;
  }> {
    try {
      // Get all checks in date range
      const checksResult = await this.db.prepare(`
        SELECT bc.*, bcp.name as provider_name
        FROM background_checks bc
        JOIN background_check_providers bcp ON bc.provider_id = bcp.id
        WHERE bc.requested_at BETWEEN ? AND ?
      `).bind(start_date, end_date).all();

      const checks = checksResult.results;
      
      // Calculate basic stats
      const total_checks = checks.length;
      const completed_checks = checks.filter((c: any) => c.status === 'completed').length;
      const pending_checks = checks.filter((c: any) => ['pending', 'in_progress'].includes(c.status)).length;
      const failed_checks = checks.filter((c: any) => c.status === 'failed').length;

      // Calculate average completion time
      const completedWithTime = checks.filter((c: any) => 
        c.status === 'completed' && c.requested_at && c.completed_at
      );
      
      let average_completion_time = 0;
      if (completedWithTime.length > 0) {
        const totalTime = completedWithTime.reduce((sum: number, c: any) => {
          const requested = new Date(c.requested_at).getTime();
          const completed = new Date(c.completed_at).getTime();
          return sum + (completed - requested);
        }, 0);
        average_completion_time = totalTime / completedWithTime.length / (1000 * 60 * 60); // Convert to hours
      }

      // Risk distribution
      const risk_distribution: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
      checks.forEach((c: any) => {
        if (c.risk_level && risk_distribution.hasOwnProperty(c.risk_level)) {
          risk_distribution[c.risk_level]++;
        }
      });

      // Provider performance
      const providerStats: Record<string, any> = {};
      checks.forEach((c: any) => {
        const provider = c.provider_name;
        if (!providerStats[provider]) {
          providerStats[provider] = {
            total: 0,
            completed: 0,
            total_time: 0,
            completed_with_time: 0
          };
        }
        
        providerStats[provider].total++;
        if (c.status === 'completed') {
          providerStats[provider].completed++;
          
          if (c.requested_at && c.completed_at) {
            const requested = new Date(c.requested_at).getTime();
            const completed = new Date(c.completed_at).getTime();
            providerStats[provider].total_time += (completed - requested);
            providerStats[provider].completed_with_time++;
          }
        }
      });

      const provider_performance = Object.entries(providerStats).map(([name, stats]: [string, any]) => ({
        provider_name: name,
        total_checks: stats.total,
        success_rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
        average_response_time: stats.completed_with_time > 0 
          ? stats.total_time / stats.completed_with_time / (1000 * 60 * 60) // Hours
          : 0
      }));

      return {
        total_checks,
        completed_checks,
        pending_checks,
        failed_checks,
        average_completion_time,
        risk_distribution,
        provider_performance
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async initiateProviderCheck(check: BackgroundCheck, provider: BackgroundCheckProvider, request: BackgroundCheckRequest): Promise<void> {
    try {
      // This would integrate with actual third-party APIs in production
      // For now, we'll simulate the process and update status
      
      // Update status to in_progress
      await this.updateCheckStatus(check.id!, 'in_progress', undefined, `ext_${Date.now()}_${check.id}`);
      
      // Simulate async processing (in real implementation, this would be actual API calls)
      setTimeout(async () => {
        try {
          // Simulate check results
          const simulatedResult = this.generateSimulatedResult(check.check_type);
          await this.updateCheckStatus(check.id!, 'completed', simulatedResult);
        } catch (error) {
          console.error('Error processing background check:', error);
          await this.updateCheckStatus(check.id!, 'failed', { error: error.message });
        }
      }, 1000); // Simulate 1 second processing time
      
    } catch (error) {
      console.error('Error initiating provider check:', error);
      await this.updateCheckStatus(check.id!, 'failed', { error: error.message });
    }
  }

  private generateSimulatedResult(checkType: string): any {
    // Simulate different results for different check types
    const baseScore = 70 + Math.random() * 25; // 70-95 score range
    
    const riskLevel = baseScore >= 85 ? 'low' : 
                     baseScore >= 70 ? 'medium' : 
                     baseScore >= 50 ? 'high' : 'critical';

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year expiry

    return {
      verification_score: Math.round(baseScore),
      risk_level: riskLevel,
      expiry_date: expiryDate.toISOString(),
      details: {
        check_type: checkType,
        records_found: Math.floor(Math.random() * 5),
        flags: baseScore < 70 ? ['Minor violation found'] : [],
        verification_date: new Date().toISOString(),
        certifying_authority: `${checkType.toUpperCase()} Check Authority`,
        reference_number: `REF_${Date.now()}_${checkType.toUpperCase()}`
      }
    };
  }
}