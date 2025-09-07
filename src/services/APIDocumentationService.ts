/**
 * API Documentation Service
 * Manages API documentation, developer portal, and documentation analytics
 */

export interface APIEndpoint {
  id?: number;
  endpoint_path: string;
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  title: string;
  description?: string;
  request_schema?: string; // JSON schema
  response_schema?: string; // JSON schema
  examples?: string; // JSON examples
  tags?: string; // Comma-separated tags
  deprecated?: boolean;
  version?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DeveloperPortalUser {
  id?: number;
  email: string;
  name: string;
  company?: string;
  api_key: string;
  api_secret: string;
  status?: 'active' | 'suspended' | 'pending';
  rate_limit_tier?: 'free' | 'basic' | 'premium' | 'enterprise';
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}

export interface APIUsageStats {
  documentation_id: number;
  access_count: number;
  unique_developers: number;
  last_accessed: string;
}

export interface DeveloperAPIUsage {
  developer_id: number;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time: number;
  most_used_endpoints: Array<{
    endpoint: string;
    count: number;
  }>;
}

export class APIDocumentationService {
  constructor(private db: D1Database) {}

  /**
   * API Documentation Management
   */
  async createAPIEndpoint(endpoint: Omit<APIEndpoint, 'id' | 'created_at' | 'updated_at'>): Promise<APIEndpoint> {
    const query = `
      INSERT INTO api_documentation (
        endpoint_path, http_method, title, description, request_schema, 
        response_schema, examples, tags, deprecated, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `;

    const result = await this.db.prepare(query).bind(
      endpoint.endpoint_path,
      endpoint.http_method,
      endpoint.title,
      endpoint.description || null,
      endpoint.request_schema || null,
      endpoint.response_schema || null,
      endpoint.examples || null,
      endpoint.tags || null,
      endpoint.deprecated || false,
      endpoint.version || 'v1'
    ).first();

    return result as APIEndpoint;
  }

  async updateAPIEndpoint(id: number, updates: Partial<APIEndpoint>): Promise<APIEndpoint> {
    const updateFields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE api_documentation 
      SET ${updateFields.join(', ')}
      WHERE id = ?
      RETURNING *
    `;

    const result = await this.db.prepare(query).bind(...values).first();
    if (!result) {
      throw new Error('API endpoint not found');
    }

    return result as APIEndpoint;
  }

  async getAPIEndpoints(filters?: {
    method?: string;
    version?: string;
    tags?: string[];
    deprecated?: boolean;
  }): Promise<APIEndpoint[]> {
    let query = 'SELECT * FROM api_documentation WHERE 1=1';
    const values = [];

    if (filters?.method) {
      query += ' AND http_method = ?';
      values.push(filters.method);
    }

    if (filters?.version) {
      query += ' AND version = ?';
      values.push(filters.version);
    }

    if (filters?.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags.map(() => 'tags LIKE ?').join(' OR ');
      query += ` AND (${tagConditions})`;
      filters.tags.forEach(tag => values.push(`%${tag}%`));
    }

    if (filters?.deprecated !== undefined) {
      query += ' AND deprecated = ?';
      values.push(filters.deprecated);
    }

    query += ' ORDER BY endpoint_path, http_method';

    const result = await this.db.prepare(query).bind(...values).all();
    return result.results as APIEndpoint[];
  }

  async getAPIEndpoint(id: number): Promise<APIEndpoint | null> {
    const result = await this.db.prepare('SELECT * FROM api_documentation WHERE id = ?').bind(id).first();
    return result as APIEndpoint | null;
  }

  async deleteAPIEndpoint(id: number): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM api_documentation WHERE id = ?').bind(id).run();
    return result.changes > 0;
  }

  /**
   * Developer Portal Management
   */
  async createDeveloper(developer: Omit<DeveloperPortalUser, 'id' | 'api_key' | 'api_secret' | 'created_at' | 'updated_at'>): Promise<DeveloperPortalUser> {
    const api_key = this.generateAPIKey();
    const api_secret = this.generateAPISecret();

    const query = `
      INSERT INTO developer_portal_users (
        email, name, company, api_key, api_secret, status, rate_limit_tier
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `;

    const result = await this.db.prepare(query).bind(
      developer.email,
      developer.name,
      developer.company || null,
      api_key,
      api_secret,
      developer.status || 'active',
      developer.rate_limit_tier || 'free'
    ).first();

    return result as DeveloperPortalUser;
  }

  async getDeveloperByAPIKey(api_key: string): Promise<DeveloperPortalUser | null> {
    const result = await this.db.prepare('SELECT * FROM developer_portal_users WHERE api_key = ?').bind(api_key).first();
    return result as DeveloperPortalUser | null;
  }

  async updateDeveloperLastLogin(developer_id: number): Promise<void> {
    await this.db.prepare('UPDATE developer_portal_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(developer_id).run();
  }

  async getDevelopers(): Promise<DeveloperPortalUser[]> {
    const result = await this.db.prepare('SELECT * FROM developer_portal_users ORDER BY created_at DESC').all();
    return result.results as DeveloperPortalUser[];
  }

  async updateDeveloperStatus(developer_id: number, status: 'active' | 'suspended' | 'pending'): Promise<DeveloperPortalUser> {
    const query = `
      UPDATE developer_portal_users 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? 
      RETURNING *
    `;

    const result = await this.db.prepare(query).bind(status, developer_id).first();
    if (!result) {
      throw new Error('Developer not found');
    }

    return result as DeveloperPortalUser;
  }

  async regenerateAPICredentials(developer_id: number): Promise<{ api_key: string; api_secret: string }> {
    const new_api_key = this.generateAPIKey();
    const new_api_secret = this.generateAPISecret();

    const query = `
      UPDATE developer_portal_users 
      SET api_key = ?, api_secret = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    await this.db.prepare(query).bind(new_api_key, new_api_secret, developer_id).run();

    return { api_key: new_api_key, api_secret: new_api_secret };
  }

  /**
   * Documentation Usage Tracking
   */
  async trackDocumentationUsage(
    documentation_id: number, 
    developer_id?: number, 
    user_agent?: string, 
    ip_address?: string
  ): Promise<void> {
    const query = `
      INSERT INTO api_documentation_usage (
        documentation_id, developer_id, user_agent, ip_address
      ) VALUES (?, ?, ?, ?)
    `;

    await this.db.prepare(query).bind(
      documentation_id,
      developer_id || null,
      user_agent || null,
      ip_address || null
    ).run();
  }

  async getDocumentationUsageStats(documentation_id?: number): Promise<APIUsageStats[]> {
    let query = `
      SELECT 
        documentation_id,
        COUNT(*) as access_count,
        COUNT(DISTINCT developer_id) as unique_developers,
        MAX(accessed_at) as last_accessed
      FROM api_documentation_usage
    `;

    const values = [];

    if (documentation_id) {
      query += ' WHERE documentation_id = ?';
      values.push(documentation_id);
    }

    query += ' GROUP BY documentation_id ORDER BY access_count DESC';

    const result = await this.db.prepare(query).bind(...values).all();
    return result.results as APIUsageStats[];
  }

  /**
   * Developer API Usage Analytics
   */
  async trackAPIRequest(
    developer_id: number,
    endpoint: string,
    method: string,
    status_code: number,
    response_time: number,
    request_size?: number,
    response_size?: number,
    ip_address?: string,
    user_agent?: string
  ): Promise<void> {
    const query = `
      INSERT INTO api_requests (
        developer_id, endpoint, method, status_code, response_time,
        request_size, response_size, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.prepare(query).bind(
      developer_id,
      endpoint,
      method,
      status_code,
      response_time,
      request_size || null,
      response_size || null,
      ip_address || null,
      user_agent || null
    ).run();
  }

  async getDeveloperAPIUsage(developer_id: number, days: number = 30): Promise<DeveloperAPIUsage> {
    const date_from = new Date();
    date_from.setDate(date_from.getDate() - days);

    // Get overall stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status_code < 400 THEN 1 END) as successful_requests,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as failed_requests,
        AVG(response_time) as avg_response_time
      FROM api_requests 
      WHERE developer_id = ? AND created_at >= ?
    `;

    const statsResult = await this.db.prepare(statsQuery).bind(developer_id, date_from.toISOString()).first();

    // Get most used endpoints
    const endpointsQuery = `
      SELECT endpoint, COUNT(*) as count
      FROM api_requests 
      WHERE developer_id = ? AND created_at >= ?
      GROUP BY endpoint 
      ORDER BY count DESC 
      LIMIT 10
    `;

    const endpointsResult = await this.db.prepare(endpointsQuery).bind(developer_id, date_from.toISOString()).all();

    return {
      developer_id,
      total_requests: statsResult?.total_requests || 0,
      successful_requests: statsResult?.successful_requests || 0,
      failed_requests: statsResult?.failed_requests || 0,
      avg_response_time: Math.round(statsResult?.avg_response_time || 0),
      most_used_endpoints: endpointsResult.results as Array<{ endpoint: string; count: number }>
    };
  }

  /**
   * OpenAPI/Swagger Documentation Generation
   */
  async generateOpenAPISpec(version: string = 'v1'): Promise<object> {
    const endpoints = await this.getAPIEndpoints({ version });

    const openApiSpec = {
      openapi: '3.0.3',
      info: {
        title: 'Kwikr API',
        description: 'Comprehensive API for the Kwikr platform',
        version: version,
        contact: {
          name: 'Kwikr Support',
          email: 'api-support@kwikr.directory'
        }
      },
      servers: [
        {
          url: 'https://api.kwikr.directory',
          description: 'Production server'
        },
        {
          url: 'https://staging-api.kwikr.directory',
          description: 'Staging server'
        }
      ],
      paths: {},
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
          }
        }
      },
      security: [
        {
          ApiKeyAuth: []
        }
      ]
    };

    // Build paths from endpoints
    endpoints.forEach(endpoint => {
      if (!openApiSpec.paths[endpoint.endpoint_path]) {
        openApiSpec.paths[endpoint.endpoint_path] = {};
      }

      const methodLower = endpoint.http_method.toLowerCase();
      openApiSpec.paths[endpoint.endpoint_path][methodLower] = {
        summary: endpoint.title,
        description: endpoint.description,
        tags: endpoint.tags ? endpoint.tags.split(',').map(t => t.trim()) : [],
        deprecated: endpoint.deprecated || false,
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: endpoint.response_schema ? JSON.parse(endpoint.response_schema) : { type: 'object' }
              }
            }
          }
        }
      };

      // Add request body for POST, PUT, PATCH
      if (['POST', 'PUT', 'PATCH'].includes(endpoint.http_method) && endpoint.request_schema) {
        openApiSpec.paths[endpoint.endpoint_path][methodLower].requestBody = {
          required: true,
          content: {
            'application/json': {
              schema: JSON.parse(endpoint.request_schema)
            }
          }
        };
      }

      // Add examples if available
      if (endpoint.examples) {
        try {
          const examples = JSON.parse(endpoint.examples);
          if (examples.request && openApiSpec.paths[endpoint.endpoint_path][methodLower].requestBody) {
            openApiSpec.paths[endpoint.endpoint_path][methodLower].requestBody.content['application/json'].example = examples.request;
          }
          if (examples.response) {
            openApiSpec.paths[endpoint.endpoint_path][methodLower].responses['200'].content['application/json'].example = examples.response;
          }
        } catch (e) {
          // Ignore invalid JSON examples
        }
      }
    });

    return openApiSpec;
  }

  /**
   * Helper Methods
   */
  private generateAPIKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'kwikr_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateAPISecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Auto-discovery of API Endpoints
   */
  async autoDiscoverEndpoints(routes: Array<{ path: string; method: string; handler: string }>): Promise<number> {
    let created = 0;

    for (const route of routes) {
      // Check if endpoint already exists
      const existing = await this.db.prepare(
        'SELECT id FROM api_documentation WHERE endpoint_path = ? AND http_method = ?'
      ).bind(route.path, route.method.toUpperCase()).first();

      if (!existing) {
        await this.createAPIEndpoint({
          endpoint_path: route.path,
          http_method: route.method.toUpperCase() as any,
          title: this.generateTitleFromPath(route.path, route.method),
          description: `Auto-discovered endpoint from ${route.handler}`,
          version: 'v1',
          tags: this.generateTagsFromPath(route.path)
        });
        created++;
      }
    }

    return created;
  }

  private generateTitleFromPath(path: string, method: string): string {
    const cleanPath = path.replace(/^\/api\//, '').replace(/\/:\w+/g, '');
    const parts = cleanPath.split('/');
    const resource = parts[parts.length - 1] || 'root';
    
    const methodMap = {
      'GET': 'Get',
      'POST': 'Create',
      'PUT': 'Update',
      'DELETE': 'Delete',
      'PATCH': 'Patch'
    };

    return `${methodMap[method.toUpperCase()] || method} ${resource}`;
  }

  private generateTagsFromPath(path: string): string {
    const parts = path.replace(/^\/api\//, '').split('/');
    return parts.slice(0, 2).join(',');
  }
}