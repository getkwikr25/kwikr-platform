/**
 * License Verification Service
 * Handles professional license validation for workers across different jurisdictions
 */

export interface LicenseAuthority {
  id?: number;
  name: string;
  jurisdiction: string; // State, country, or region
  license_types: string[]; // Types of licenses they issue
  verification_endpoint?: string;
  verification_method: 'api' | 'website_scraping' | 'manual';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProfessionalLicense {
  id?: number;
  user_id: number;
  authority_id: number;
  license_number: string;
  license_type: string; // 'contractor', 'electrical', 'plumbing', 'hvac', 'real_estate', etc.
  license_category?: string; // Additional categorization
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  verification_status: 'pending' | 'verified' | 'failed' | 'expired';
  verification_date?: string;
  verification_reference?: string;
  license_document?: {
    filename: string;
    url: string;
    uploaded_at: string;
    file_size: number;
    mime_type: string;
  };
  renewal_required: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LicenseVerificationRequest {
  user_id: number;
  authority_name: string;
  license_number: string;
  license_type: string;
  license_category?: string;
  issue_date: string;
  expiry_date: string;
  license_document?: {
    filename: string;
    content: ArrayBuffer;
    mime_type: string;
  };
}

export interface LicenseRequirement {
  license_type: string;
  required_for_job_types: string[];
  jurisdiction_requirements: Record<string, {
    authority_name: string;
    renewal_frequency: number; // months
    continuing_education?: boolean;
    additional_requirements?: string[];
  }>;
}

export interface LicenseComplianceStatus {
  user_id: number;
  overall_status: 'compliant' | 'partial' | 'non_compliant' | 'pending';
  active_licenses: number;
  expired_licenses: number;
  pending_verification: number;
  license_gaps: string[];
  expiring_soon: ProfessionalLicense[];
  jurisdiction_coverage: string[];
  recommendations: string[];
  last_updated: string;
}

export class LicenseVerificationService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * License Authority Management
   */
  async createAuthority(authority: Omit<LicenseAuthority, 'id' | 'created_at' | 'updated_at'>): Promise<LicenseAuthority> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO license_authorities 
        (name, jurisdiction, license_types, verification_endpoint, verification_method, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        authority.name,
        authority.jurisdiction,
        JSON.stringify(authority.license_types),
        authority.verification_endpoint || null,
        authority.verification_method,
        authority.is_active ? 1 : 0
      ).run();

      if (!result.success) {
        throw new Error('Failed to create license authority');
      }

      return await this.getAuthorityById(result.meta.last_row_id as number);
    } catch (error) {
      console.error('Error creating license authority:', error);
      throw error;
    }
  }

  async getAuthorities(active_only: boolean = true): Promise<LicenseAuthority[]> {
    try {
      const query = active_only 
        ? `SELECT * FROM license_authorities WHERE is_active = 1 ORDER BY jurisdiction, name`
        : `SELECT * FROM license_authorities ORDER BY jurisdiction, name`;
      
      const result = await this.db.prepare(query).all();
      
      return result.results.map(row => ({
        ...row,
        is_active: row.is_active === 1,
        license_types: JSON.parse(row.license_types as string)
      })) as LicenseAuthority[];
    } catch (error) {
      console.error('Error fetching license authorities:', error);
      throw error;
    }
  }

  async getAuthorityById(id: number): Promise<LicenseAuthority> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM license_authorities WHERE id = ?
      `).bind(id).first();

      if (!result) {
        throw new Error('License authority not found');
      }

      return {
        ...result,
        is_active: result.is_active === 1,
        license_types: JSON.parse(result.license_types as string)
      } as LicenseAuthority;
    } catch (error) {
      console.error('Error fetching license authority:', error);
      throw error;
    }
  }

  async getAuthorityByName(name: string, jurisdiction?: string): Promise<LicenseAuthority> {
    try {
      let query = `SELECT * FROM license_authorities WHERE name = ? AND is_active = 1`;
      const bindings: any[] = [name];
      
      if (jurisdiction) {
        query += ` AND jurisdiction = ?`;
        bindings.push(jurisdiction);
      }
      
      const result = await this.db.prepare(query).bind(...bindings).first();

      if (!result) {
        throw new Error('License authority not found');
      }

      return {
        ...result,
        is_active: result.is_active === 1,
        license_types: JSON.parse(result.license_types as string)
      } as LicenseAuthority;
    } catch (error) {
      console.error('Error fetching license authority by name:', error);
      throw error;
    }
  }

  async getAuthoritiesByJurisdiction(jurisdiction: string): Promise<LicenseAuthority[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM license_authorities WHERE jurisdiction = ? AND is_active = 1 ORDER BY name
      `).bind(jurisdiction).all();
      
      return result.results.map(row => ({
        ...row,
        is_active: row.is_active === 1,
        license_types: JSON.parse(row.license_types as string)
      })) as LicenseAuthority[];
    } catch (error) {
      console.error('Error fetching license authorities by jurisdiction:', error);
      throw error;
    }
  }

  /**
   * Professional License Management
   */
  async addLicense(request: LicenseVerificationRequest): Promise<ProfessionalLicense> {
    try {
      const authority = await this.getAuthorityByName(request.authority_name);
      
      // Validate license type is supported by authority
      if (!authority.license_types.includes(request.license_type)) {
        throw new Error(`Authority ${authority.name} does not issue ${request.license_type} licenses`);
      }

      // Store license document if provided
      let license_document = null;
      
      if (request.license_document) {
        // In a real implementation, this would upload to R2 or external storage
        const document_url = `/licenses/${Date.now()}_${request.license_document.filename}`;
        license_document = {
          filename: request.license_document.filename,
          url: document_url,
          uploaded_at: new Date().toISOString(),
          file_size: request.license_document.content.byteLength,
          mime_type: request.license_document.mime_type
        };
      }

      // Determine initial status based on dates
      const now = new Date();
      const expiry = new Date(request.expiry_date);
      const initial_status = expiry > now ? 'active' : 'expired';

      const result = await this.db.prepare(`
        INSERT INTO professional_licenses 
        (user_id, authority_id, license_number, license_type, license_category, 
         issue_date, expiry_date, status, verification_status, license_document, renewal_required)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        request.user_id,
        authority.id,
        request.license_number,
        request.license_type,
        request.license_category || null,
        request.issue_date,
        request.expiry_date,
        initial_status,
        'pending',
        license_document ? JSON.stringify(license_document) : null,
        1 // renewal_required defaults to true
      ).run();

      if (!result.success) {
        throw new Error('Failed to add professional license');
      }

      const license = await this.getLicenseById(result.meta.last_row_id as number);
      
      // Initiate verification process
      await this.initiateVerification(license, authority);
      
      return license;
    } catch (error) {
      console.error('Error adding professional license:', error);
      throw error;
    }
  }

  async getLicenseById(id: number): Promise<ProfessionalLicense> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM professional_licenses WHERE id = ?
      `).bind(id).first();

      if (!result) {
        throw new Error('Professional license not found');
      }

      return {
        ...result,
        renewal_required: result.renewal_required === 1,
        license_document: result.license_document ? JSON.parse(result.license_document as string) : undefined
      } as ProfessionalLicense;
    } catch (error) {
      console.error('Error fetching professional license:', error);
      throw error;
    }
  }

  async getUserLicenses(user_id: number, active_only: boolean = true): Promise<ProfessionalLicense[]> {
    try {
      const query = active_only
        ? `SELECT pl.*, la.name as authority_name, la.jurisdiction 
           FROM professional_licenses pl
           JOIN license_authorities la ON pl.authority_id = la.id
           WHERE pl.user_id = ? AND pl.status = 'active' 
           ORDER BY pl.expiry_date ASC`
        : `SELECT pl.*, la.name as authority_name, la.jurisdiction 
           FROM professional_licenses pl
           JOIN license_authorities la ON pl.authority_id = la.id
           WHERE pl.user_id = ? 
           ORDER BY pl.expiry_date ASC`;
      
      const result = await this.db.prepare(query).bind(user_id).all();
      
      return result.results.map(row => ({
        ...row,
        renewal_required: row.renewal_required === 1,
        license_document: row.license_document ? JSON.parse(row.license_document as string) : undefined
      })) as ProfessionalLicense[];
    } catch (error) {
      console.error('Error fetching user professional licenses:', error);
      throw error;
    }
  }

  async getLicensesByType(license_type: string, jurisdiction?: string): Promise<ProfessionalLicense[]> {
    try {
      let query = `
        SELECT pl.*, la.name as authority_name, la.jurisdiction 
        FROM professional_licenses pl
        JOIN license_authorities la ON pl.authority_id = la.id
        WHERE pl.license_type = ? AND pl.status = 'active'
      `;
      const bindings: any[] = [license_type];

      if (jurisdiction) {
        query += ` AND la.jurisdiction = ?`;
        bindings.push(jurisdiction);
      }

      query += ` ORDER BY pl.expiry_date ASC`;
      
      const result = await this.db.prepare(query).bind(...bindings).all();
      
      return result.results.map(row => ({
        ...row,
        renewal_required: row.renewal_required === 1,
        license_document: row.license_document ? JSON.parse(row.license_document as string) : undefined
      })) as ProfessionalLicense[];
    } catch (error) {
      console.error('Error fetching professional licenses by type:', error);
      throw error;
    }
  }

  async updateLicenseStatus(license_id: number, status: string, verification_status?: string, verification_reference?: string): Promise<ProfessionalLicense> {
    try {
      const updates: string[] = [];
      const bindings: any[] = [];

      updates.push('status = ?');
      bindings.push(status);

      updates.push('updated_at = datetime(\'now\')');

      if (verification_status) {
        updates.push('verification_status = ?');
        bindings.push(verification_status);
        
        if (verification_status === 'verified') {
          updates.push('verification_date = datetime(\'now\')');
        }
      }

      if (verification_reference) {
        updates.push('verification_reference = ?');
        bindings.push(verification_reference);
      }

      bindings.push(license_id);

      const result = await this.db.prepare(`
        UPDATE professional_licenses 
        SET ${updates.join(', ')}
        WHERE id = ?
      `).bind(...bindings).run();

      if (!result.success) {
        throw new Error('Failed to update professional license status');
      }

      return await this.getLicenseById(license_id);
    } catch (error) {
      console.error('Error updating professional license status:', error);
      throw error;
    }
  }

  /**
   * License Verification
   */
  async verifyLicense(license_id: number): Promise<{
    verification_status: 'verified' | 'failed';
    verification_details: any;
  }> {
    try {
      const license = await this.getLicenseById(license_id);
      const authority = await this.getAuthorityById(license.authority_id);

      let verification_result;
      
      switch (authority.verification_method) {
        case 'api':
          verification_result = await this.verifyLicenseViaAPI(license, authority);
          break;
        case 'website_scraping':
          verification_result = await this.verifyLicenseViaWebsite(license, authority);
          break;
        case 'manual':
        default:
          verification_result = await this.verifyLicenseManually(license, authority);
          break;
      }

      // Update license with verification result
      await this.updateLicenseStatus(
        license_id, 
        license.status, 
        verification_result.verification_status,
        verification_result.verification_details.reference_number
      );

      return verification_result;
    } catch (error) {
      console.error('Error verifying professional license:', error);
      await this.updateLicenseStatus(license_id, license.status, 'failed');
      throw error;
    }
  }

  async getExpiringLicenses(days_ahead: number = 30): Promise<ProfessionalLicense[]> {
    try {
      const target_date = new Date();
      target_date.setDate(target_date.getDate() + days_ahead);
      
      const result = await this.db.prepare(`
        SELECT pl.*, la.name as authority_name, la.jurisdiction 
        FROM professional_licenses pl
        JOIN license_authorities la ON pl.authority_id = la.id
        WHERE pl.status = 'active' AND pl.expiry_date <= ?
        ORDER BY pl.expiry_date ASC
      `).bind(target_date.toISOString().split('T')[0]).all();
      
      return result.results.map(row => ({
        ...row,
        renewal_required: row.renewal_required === 1,
        license_document: row.license_document ? JSON.parse(row.license_document as string) : undefined
      })) as ProfessionalLicense[];
    } catch (error) {
      console.error('Error fetching expiring professional licenses:', error);
      throw error;
    }
  }

  /**
   * License Compliance Analysis
   */
  async getUserComplianceStatus(user_id: number, job_type?: string, jurisdiction?: string): Promise<LicenseComplianceStatus> {
    try {
      const licenses = await this.getUserLicenses(user_id, false); // Get all licenses
      const requirements = await this.getLicenseRequirements(job_type, jurisdiction);

      const active_licenses = licenses.filter(l => l.status === 'active').length;
      const expired_licenses = licenses.filter(l => l.status === 'expired').length;
      const pending_verification = licenses.filter(l => l.verification_status === 'pending').length;

      // Check license gaps
      const license_gaps: string[] = [];
      for (const requirement of requirements) {
        const matching_licenses = licenses.filter(l => 
          l.license_type === requirement.license_type && 
          l.status === 'active' &&
          l.verification_status === 'verified'
        );

        if (matching_licenses.length === 0) {
          license_gaps.push(`Missing ${requirement.license_type} license`);
        }
      }

      // Find expiring licenses
      const expiring_soon = await this.getExpiringLicenses(30);
      const user_expiring = expiring_soon.filter(l => l.user_id === user_id);

      // Get jurisdiction coverage
      const jurisdiction_coverage = [...new Set(
        licenses
          .filter(l => l.status === 'active' && l.verification_status === 'verified')
          .map((l: any) => l.jurisdiction)
      )];

      // Determine overall status
      let overall_status: 'compliant' | 'partial' | 'non_compliant' | 'pending';
      if (pending_verification > 0) {
        overall_status = 'pending';
      } else if (license_gaps.length === 0 && user_expiring.length === 0) {
        overall_status = 'compliant';
      } else if (license_gaps.length > 0 && active_licenses === 0) {
        overall_status = 'non_compliant';
      } else {
        overall_status = 'partial';
      }

      // Generate recommendations
      const recommendations: string[] = [];
      if (pending_verification > 0) {
        recommendations.push('Complete pending license verifications');
      }
      if (license_gaps.length > 0) {
        recommendations.push('Obtain required professional licenses');
      }
      if (user_expiring.length > 0) {
        recommendations.push('Renew expiring professional licenses');
      }
      if (expired_licenses > 0) {
        recommendations.push('Update or renew expired licenses');
      }
      if (jurisdiction && !jurisdiction_coverage.includes(jurisdiction)) {
        recommendations.push(`Obtain licenses for ${jurisdiction} jurisdiction`);
      }

      return {
        user_id,
        overall_status,
        active_licenses,
        expired_licenses,
        pending_verification,
        license_gaps,
        expiring_soon: user_expiring,
        jurisdiction_coverage,
        recommendations,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating license compliance status:', error);
      throw error;
    }
  }

  async getLicenseReport(start_date: string, end_date: string): Promise<{
    total_licenses: number;
    active_licenses: number;
    verified_licenses: number;
    pending_verification: number;
    expired_licenses: number;
    licenses_by_type: Record<string, number>;
    licenses_by_jurisdiction: Record<string, number>;
    verification_success_rate: number;
    expiring_within_30_days: number;
    renewal_compliance_rate: number;
  }> {
    try {
      // Get all licenses in date range
      const licensesResult = await this.db.prepare(`
        SELECT pl.*, la.name as authority_name, la.jurisdiction
        FROM professional_licenses pl
        JOIN license_authorities la ON pl.authority_id = la.id
        WHERE pl.created_at BETWEEN ? AND ?
      `).bind(start_date, end_date).all();

      const licenses = licensesResult.results;
      
      // Calculate basic stats
      const total_licenses = licenses.length;
      const active_licenses = licenses.filter((l: any) => l.status === 'active').length;
      const verified_licenses = licenses.filter((l: any) => l.verification_status === 'verified').length;
      const pending_verification = licenses.filter((l: any) => l.verification_status === 'pending').length;
      const expired_licenses = licenses.filter((l: any) => l.status === 'expired').length;

      // Licenses by type
      const licenses_by_type: Record<string, number> = {};
      licenses.forEach((l: any) => {
        if (l.status === 'active') {
          licenses_by_type[l.license_type] = (licenses_by_type[l.license_type] || 0) + 1;
        }
      });

      // Licenses by jurisdiction
      const licenses_by_jurisdiction: Record<string, number> = {};
      licenses.forEach((l: any) => {
        if (l.status === 'active') {
          const jurisdiction = l.jurisdiction;
          licenses_by_jurisdiction[jurisdiction] = (licenses_by_jurisdiction[jurisdiction] || 0) + 1;
        }
      });

      // Verification success rate
      const verification_attempts = licenses.filter((l: any) => 
        ['verified', 'failed'].includes(l.verification_status)
      ).length;
      const verification_success_rate = verification_attempts > 0 
        ? (verified_licenses / verification_attempts) * 100 
        : 0;

      // Expiring within 30 days
      const thirty_days_from_now = new Date();
      thirty_days_from_now.setDate(thirty_days_from_now.getDate() + 30);
      const expiring_within_30_days = licenses.filter((l: any) => 
        l.status === 'active' && new Date(l.expiry_date) <= thirty_days_from_now
      ).length;

      // Renewal compliance rate (licenses renewed before expiry)
      const renewal_eligible = licenses.filter((l: any) => 
        l.renewal_required === 1 && new Date(l.expiry_date) < new Date()
      ).length;
      const renewed_on_time = licenses.filter((l: any) => 
        l.renewal_required === 1 && l.status === 'active' && new Date(l.expiry_date) > new Date()
      ).length;
      const renewal_compliance_rate = renewal_eligible > 0 
        ? (renewed_on_time / (renewed_on_time + renewal_eligible)) * 100 
        : 100;

      return {
        total_licenses,
        active_licenses,
        verified_licenses,
        pending_verification,
        expired_licenses,
        licenses_by_type,
        licenses_by_jurisdiction,
        verification_success_rate,
        expiring_within_30_days,
        renewal_compliance_rate
      };
    } catch (error) {
      console.error('Error generating license report:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async initiateVerification(license: ProfessionalLicense, authority: LicenseAuthority): Promise<void> {
    try {
      // This would integrate with actual verification methods in production
      // For now, we'll simulate the verification process
      
      setTimeout(async () => {
        try {
          const verification_result = await this.verifyLicense(license.id!);
          console.log('License verification completed:', verification_result);
        } catch (error) {
          console.error('Error in background verification:', error);
        }
      }, 3000); // Simulate 3 second verification delay
      
    } catch (error) {
      console.error('Error initiating license verification:', error);
    }
  }

  private async verifyLicenseViaAPI(license: ProfessionalLicense, authority: LicenseAuthority): Promise<{
    verification_status: 'verified' | 'failed';
    verification_details: any;
  }> {
    try {
      // Simulate API verification
      // In real implementation, this would call the licensing authority's API
      
      const success = Math.random() > 0.15; // 85% success rate for simulation
      
      if (success) {
        return {
          verification_status: 'verified',
          verification_details: {
            method: 'api',
            verified_at: new Date().toISOString(),
            authority_response: {
              license_active: true,
              license_number_confirmed: license.license_number,
              issue_date_confirmed: license.issue_date,
              expiry_date_confirmed: license.expiry_date,
              license_type_confirmed: license.license_type,
              disciplinary_actions: []
            },
            reference_number: `API_${authority.jurisdiction}_${Date.now()}_${license.id}`,
            authority_name: authority.name,
            jurisdiction: authority.jurisdiction
          }
        };
      } else {
        return {
          verification_status: 'failed',
          verification_details: {
            method: 'api',
            error: 'License not found in authority database',
            attempted_at: new Date().toISOString(),
            authority_name: authority.name,
            jurisdiction: authority.jurisdiction
          }
        };
      }
    } catch (error) {
      return {
        verification_status: 'failed',
        verification_details: {
          method: 'api',
          error: error.message,
          attempted_at: new Date().toISOString(),
          authority_name: authority.name
        }
      };
    }
  }

  private async verifyLicenseViaWebsite(license: ProfessionalLicense, authority: LicenseAuthority): Promise<{
    verification_status: 'verified' | 'failed';
    verification_details: any;
  }> {
    try {
      // Simulate website scraping verification
      // In real implementation, this would scrape the authority's website
      
      const success = Math.random() > 0.2; // 80% success rate for simulation
      
      if (success) {
        return {
          verification_status: 'verified',
          verification_details: {
            method: 'website_scraping',
            verified_at: new Date().toISOString(),
            website_data: {
              license_found: true,
              status: 'Active',
              license_holder_name: 'Verified',
              expiration_date: license.expiry_date,
              license_class: license.license_category || 'Standard'
            },
            reference_number: `WEB_${authority.jurisdiction}_${Date.now()}_${license.id}`,
            authority_name: authority.name,
            jurisdiction: authority.jurisdiction,
            verification_url: authority.verification_endpoint
          }
        };
      } else {
        return {
          verification_status: 'failed',
          verification_details: {
            method: 'website_scraping',
            error: 'License information not accessible on authority website',
            attempted_at: new Date().toISOString(),
            authority_name: authority.name,
            jurisdiction: authority.jurisdiction
          }
        };
      }
    } catch (error) {
      return {
        verification_status: 'failed',
        verification_details: {
          method: 'website_scraping',
          error: error.message,
          attempted_at: new Date().toISOString(),
          authority_name: authority.name
        }
      };
    }
  }

  private async verifyLicenseManually(license: ProfessionalLicense, authority: LicenseAuthority): Promise<{
    verification_status: 'verified' | 'failed';
    verification_details: any;
  }> {
    try {
      // For manual verification, we'll simulate a successful manual review process
      // In a real system, this would create a task for manual review by staff
      
      return {
        verification_status: 'verified',
        verification_details: {
          method: 'manual',
          verified_at: new Date().toISOString(),
          manual_review: {
            reviewer_notes: 'License verified through manual review process',
            contact_verification: 'Authority contacted and confirmed license validity',
            document_review: license.license_document ? 'License document reviewed and validated' : 'No document provided',
            verification_steps: [
              'License number validated with authority records',
              'Expiration date confirmed',
              'License holder identity verified',
              'No disciplinary actions found'
            ]
          },
          reference_number: `MANUAL_${authority.jurisdiction}_${Date.now()}_${license.id}`,
          authority_name: authority.name,
          jurisdiction: authority.jurisdiction
        }
      };
    } catch (error) {
      return {
        verification_status: 'failed',
        verification_details: {
          method: 'manual',
          error: error.message,
          attempted_at: new Date().toISOString(),
          authority_name: authority.name
        }
      };
    }
  }

  private async getLicenseRequirements(job_type?: string, jurisdiction?: string): Promise<LicenseRequirement[]> {
    // In a real implementation, this would be stored in the database
    // For now, we'll return some standard requirements based on common professions
    
    const standard_requirements: LicenseRequirement[] = [
      {
        license_type: 'contractor',
        required_for_job_types: ['general_contractor', 'construction', 'remodeling'],
        jurisdiction_requirements: {
          'California': {
            authority_name: 'California Contractors State License Board',
            renewal_frequency: 24,
            continuing_education: true,
            additional_requirements: ['Bond required', 'Workers compensation insurance']
          },
          'Texas': {
            authority_name: 'Texas Department of Licensing and Regulation',
            renewal_frequency: 12,
            continuing_education: false
          },
          'Florida': {
            authority_name: 'Florida Department of Business and Professional Regulation',
            renewal_frequency: 24,
            continuing_education: true
          }
        }
      },
      {
        license_type: 'electrical',
        required_for_job_types: ['electrician', 'electrical_contractor', 'electrical_work'],
        jurisdiction_requirements: {
          'California': {
            authority_name: 'California Department of Industrial Relations',
            renewal_frequency: 36,
            continuing_education: true
          },
          'Texas': {
            authority_name: 'Texas Department of Licensing and Regulation',
            renewal_frequency: 12,
            continuing_education: true
          },
          'New York': {
            authority_name: 'New York State Department of Labor',
            renewal_frequency: 36,
            continuing_education: true
          }
        }
      },
      {
        license_type: 'plumbing',
        required_for_job_types: ['plumber', 'plumbing_contractor', 'plumbing_work'],
        jurisdiction_requirements: {
          'California': {
            authority_name: 'California Department of Consumer Affairs',
            renewal_frequency: 24,
            continuing_education: true
          },
          'Texas': {
            authority_name: 'Texas State Board of Plumbing Examiners',
            renewal_frequency: 12,
            continuing_education: true
          }
        }
      },
      {
        license_type: 'hvac',
        required_for_job_types: ['hvac_technician', 'hvac_contractor', 'hvac_work'],
        jurisdiction_requirements: {
          'California': {
            authority_name: 'California Contractors State License Board',
            renewal_frequency: 24,
            continuing_education: true
          },
          'Florida': {
            authority_name: 'Florida Department of Business and Professional Regulation',
            renewal_frequency: 24,
            continuing_education: true
          }
        }
      }
    ];

    let filtered_requirements = standard_requirements;

    if (job_type) {
      filtered_requirements = filtered_requirements.filter(req => 
        req.required_for_job_types.includes(job_type)
      );
    }

    if (jurisdiction) {
      filtered_requirements = filtered_requirements.filter(req =>
        req.jurisdiction_requirements.hasOwnProperty(jurisdiction)
      );
    }

    return filtered_requirements;
  }
}