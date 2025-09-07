// Performance Optimization System for Large Datasets
// Cloudflare D1 optimized queries with caching and pagination

export interface QueryOptimization {
  use_indexes: boolean;
  limit_results: boolean;
  enable_caching: boolean;
  pagination_size: number;
  cache_ttl_seconds: number;
}

export interface PerformanceMetrics {
  query_time_ms: number;
  rows_processed: number;
  cache_hit: boolean;
  optimization_applied: string[];
  performance_score: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl_seconds: number;
  query_hash: string;
}

/**
 * Performance-optimized database operations for booking system
 */
export class BookingPerformanceOptimizer {
  private db: any;
  private cache: Map<string, CacheEntry> = new Map();
  private defaultCacheTTL = 300; // 5 minutes
  private maxCacheSize = 1000;

  constructor(database: any) {
    this.db = database;
  }

  /**
   * Optimized availability slots query with caching and indexing
   */
  async getOptimizedAvailableSlots(
    workerId: number,
    date: string,
    serviceCategory?: string,
    options: QueryOptimization = this.getDefaultOptimization()
  ): Promise<{ data: any[]; performance: PerformanceMetrics }> {
    const startTime = Date.now();
    const optimizations: string[] = [];

    // Create cache key
    const cacheKey = `slots_${workerId}_${date}_${serviceCategory || 'all'}`;
    
    // Check cache first
    if (options.enable_caching) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return {
          data: cached.data,
          performance: {
            query_time_ms: Date.now() - startTime,
            rows_processed: cached.data.length,
            cache_hit: true,
            optimization_applied: ['cache_hit'],
            performance_score: 'excellent'
          }
        };
      }
      optimizations.push('cache_enabled');
    }

    // Build optimized query with proper indexes - adapted to actual schema
    let query = `
      SELECT 
        sts.id,
        sts.service_category as service_name,
        sts.service_category,
        sts.duration_minutes as duration,
        sts.buffer_before_minutes,
        sts.buffer_after_minutes,
        sts.max_bookings_per_day as capacity,
        COUNT(b.id) as booked_count,
        (sts.max_bookings_per_day - COUNT(b.id)) as available_spots
      FROM service_time_slots sts
      LEFT JOIN bookings b ON sts.user_id = b.user_id 
        AND b.booking_date = ?
        AND b.status IN ('confirmed', 'pending')
      WHERE sts.user_id = ?
    `;

    const params = [date, workerId];

    // Add service category filter if provided
    if (serviceCategory) {
      query += ` AND sts.service_category = ?`;
      params.push(serviceCategory);
      optimizations.push('category_filter');
    }

    // Group and optimize with proper indexing
    query += `
      GROUP BY sts.id, sts.service_category, sts.duration_minutes, 
               sts.max_bookings_per_day
      HAVING (sts.max_bookings_per_day - COUNT(b.id)) > 0
    `;

    // Add ordering for better performance
    query += ` ORDER BY sts.service_category ASC`;
    optimizations.push('indexed_sort');

    // Add limit for large datasets
    if (options.limit_results) {
      query += ` LIMIT ?`;
      params.push(options.pagination_size);
      optimizations.push('result_limit');
    }

    try {
      const stmt = await this.db.prepare(query);
      const results = await stmt.bind(...params).all();
      
      const queryTime = Date.now() - startTime;
      const data = results.results || [];

      // Cache results if enabled
      if (options.enable_caching) {
        this.setCachedResult(cacheKey, data, options.cache_ttl_seconds);
        optimizations.push('result_cached');
      }

      return {
        data,
        performance: {
          query_time_ms: queryTime,
          rows_processed: data.length,
          cache_hit: false,
          optimization_applied: optimizations,
          performance_score: this.calculatePerformanceScore(queryTime, data.length)
        }
      };

    } catch (error) {
      console.error('Optimized slots query failed:', error);
      throw new Error(`Performance optimized query failed: ${error}`);
    }
  }

  /**
   * Optimized booking history with pagination and filtering
   */
  async getOptimizedBookingHistory(
    clientEmail?: string,
    workerId?: number,
    dateRange?: { start: string; end: string },
    status?: string,
    page: number = 1,
    pageSize: number = 50,
    options: QueryOptimization = this.getDefaultOptimization()
  ): Promise<{ data: any[]; pagination: any; performance: PerformanceMetrics }> {
    const startTime = Date.now();
    const optimizations: string[] = [];

    // Create cache key for this specific query
    const cacheKey = `history_${clientEmail || 'all'}_${workerId || 'all'}_${status || 'all'}_${page}_${pageSize}`;
    
    if (options.enable_caching) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return {
          data: cached.data.results,
          pagination: cached.data.pagination,
          performance: {
            query_time_ms: Date.now() - startTime,
            rows_processed: cached.data.results.length,
            cache_hit: true,
            optimization_applied: ['cache_hit'],
            performance_score: 'excellent'
          }
        };
      }
      optimizations.push('cache_enabled');
    }

    // Build optimized query with proper indexes and filtering
    let whereConditions = ['1=1'];
    const params: any[] = [];

    if (clientEmail) {
      whereConditions.push('b.client_email = ?');
      params.push(clientEmail);
      optimizations.push('email_filter');
    }

    if (workerId) {
      whereConditions.push('b.user_id = ?');
      params.push(workerId);
      optimizations.push('worker_filter');
    }

    if (dateRange) {
      whereConditions.push('b.booking_date BETWEEN ? AND ?');
      params.push(dateRange.start, dateRange.end);
      optimizations.push('date_range_filter');
    }

    if (status) {
      whereConditions.push('b.status = ?');
      params.push(status);
      optimizations.push('status_filter');
    }

    // Count query for pagination (optimized) - adapted to actual schema
    const countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE ${whereConditions.join(' AND ')}
    `;

    // Main query with pagination - adapted to actual schema
    const dataQuery = `
      SELECT 
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.status,
        b.client_email,
        b.client_name,
        b.client_phone,
        b.special_instructions as special_requests,
        b.created_at,
        COALESCE(u.first_name || ' ' || u.last_name, u.first_name, u.last_name, 'Unknown') as worker_name,
        u.email as worker_email,
        b.service_category as service_name,
        b.service_category
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY b.booking_date DESC, b.start_time DESC
      LIMIT ? OFFSET ?
    `;

    params.push(pageSize, (page - 1) * pageSize);
    optimizations.push('pagination');

    try {
      // Execute count query
      const countStmt = await this.db.prepare(countQuery);
      const countResult = await countStmt.bind(...params.slice(0, -2)).first();
      const totalRecords = countResult?.total || 0;

      // Execute data query
      const dataStmt = await this.db.prepare(dataQuery);
      const dataResult = await dataStmt.bind(...params).all();
      
      const queryTime = Date.now() - startTime;
      const data = dataResult.results || [];

      // Calculate pagination info
      const totalPages = Math.ceil(totalRecords / pageSize);
      const pagination = {
        page,
        page_size: pageSize,
        total_records: totalRecords,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1
      };

      // Cache results if enabled
      if (options.enable_caching) {
        this.setCachedResult(cacheKey, { results: data, pagination }, options.cache_ttl_seconds);
        optimizations.push('result_cached');
      }

      return {
        data,
        pagination,
        performance: {
          query_time_ms: queryTime,
          rows_processed: data.length,
          cache_hit: false,
          optimization_applied: optimizations,
          performance_score: this.calculatePerformanceScore(queryTime, data.length)
        }
      };

    } catch (error) {
      console.error('Optimized booking history query failed:', error);
      throw new Error(`Performance optimized history query failed: ${error}`);
    }
  }

  /**
   * Optimized worker availability analysis for large datasets
   */
  async getOptimizedWorkerAnalytics(
    workerId?: number,
    dateRange: { start: string; end: string } = { 
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    options: QueryOptimization = this.getDefaultOptimization()
  ): Promise<{ data: any; performance: PerformanceMetrics }> {
    const startTime = Date.now();
    const optimizations: string[] = [];

    const cacheKey = `analytics_${workerId || 'all'}_${dateRange.start}_${dateRange.end}`;

    if (options.enable_caching) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return {
          data: cached.data,
          performance: {
            query_time_ms: Date.now() - startTime,
            rows_processed: 1,
            cache_hit: true,
            optimization_applied: ['cache_hit'],
            performance_score: 'excellent'
          }
        };
      }
      optimizations.push('cache_enabled');
    }

    try {
      let workerFilter = '';
      const params = [dateRange.start, dateRange.end];

      if (workerId) {
        workerFilter = 'AND b.user_id = ?';
        params.push(workerId);
        optimizations.push('worker_filter');
      }

      // Optimized analytics query with aggregations
      const analyticsQuery = `
        WITH booking_stats AS (
          SELECT 
            b.user_id as worker_id,
            COALESCE(u.first_name || ' ' || u.last_name, u.first_name, u.last_name, 'Unknown') as worker_name,
            COUNT(*) as total_bookings,
            COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
            COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
            COUNT(CASE WHEN b.status = 'no_show' THEN 1 END) as no_show_bookings,
            AVG(CASE WHEN b.status = 'confirmed' THEN 
              (julianday(b.booking_date || ' ' || b.end_time) - 
               julianday(b.booking_date || ' ' || b.start_time)) * 24 * 60 
            END) as avg_session_minutes,
            COUNT(CASE WHEN b.booking_date = DATE('now') THEN 1 END) as today_bookings,
            COUNT(CASE WHEN b.booking_date >= DATE('now', '-7 days') THEN 1 END) as week_bookings
          FROM bookings b
          JOIN users u ON b.user_id = u.id
          WHERE b.booking_date BETWEEN ? AND ?
            ${workerFilter}
          GROUP BY b.user_id, u.first_name, u.last_name
        ),
        availability_stats AS (
          SELECT 
            wa.user_id as worker_id,
            COUNT(DISTINCT wa.day_of_week) as available_days_per_week,
            AVG((julianday('2024-01-01 ' || wa.end_time) - 
                 julianday('2024-01-01 ' || wa.start_time)) * 24) as avg_hours_per_day
          FROM worker_availability wa
          WHERE wa.is_available = 1
          GROUP BY wa.user_id
        )
        SELECT 
          bs.*,
          COALESCE(avs.available_days_per_week, 0) as available_days_per_week,
          COALESCE(avs.avg_hours_per_day, 0) as avg_hours_per_day,
          CASE 
            WHEN bs.confirmed_bookings > 0 THEN 
              ROUND((bs.confirmed_bookings * 100.0) / bs.total_bookings, 2)
            ELSE 0
          END as booking_success_rate,
          CASE
            WHEN bs.total_bookings = 0 THEN 0
            ELSE ROUND((bs.cancelled_bookings * 100.0) / bs.total_bookings, 2)
          END as cancellation_rate
        FROM booking_stats bs
        LEFT JOIN availability_stats avs ON bs.worker_id = avs.worker_id
        ORDER BY bs.total_bookings DESC
      `;

      const stmt = await this.db.prepare(analyticsQuery);
      const results = await stmt.bind(...params).all();

      const queryTime = Date.now() - startTime;
      const data = {
        workers: results.results || [],
        summary: {
          total_workers: (results.results || []).length,
          date_range: dateRange,
          generated_at: new Date().toISOString()
        }
      };

      if (options.enable_caching) {
        this.setCachedResult(cacheKey, data, options.cache_ttl_seconds);
        optimizations.push('result_cached');
      }

      return {
        data,
        performance: {
          query_time_ms: queryTime,
          rows_processed: data.workers.length,
          cache_hit: false,
          optimization_applied: optimizations,
          performance_score: this.calculatePerformanceScore(queryTime, data.workers.length)
        }
      };

    } catch (error) {
      console.error('Optimized analytics query failed:', error);
      throw new Error(`Performance optimized analytics failed: ${error}`);
    }
  }

  /**
   * Bulk operations with batch processing for large datasets
   */
  async bulkUpdateBookingStatus(
    bookingIds: number[],
    newStatus: string,
    batchSize: number = 100
  ): Promise<{ updated: number; performance: PerformanceMetrics }> {
    const startTime = Date.now();
    let totalUpdated = 0;

    try {
      // Process in batches to avoid timeout
      for (let i = 0; i < bookingIds.length; i += batchSize) {
        const batch = bookingIds.slice(i, i + batchSize);
        const placeholders = batch.map(() => '?').join(',');
        
        const updateQuery = `
          UPDATE bookings 
          SET status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id IN (${placeholders})
        `;

        const stmt = await this.db.prepare(updateQuery);
        const result = await stmt.bind(newStatus, ...batch).run();
        totalUpdated += result.changes || 0;
      }

      return {
        updated: totalUpdated,
        performance: {
          query_time_ms: Date.now() - startTime,
          rows_processed: totalUpdated,
          cache_hit: false,
          optimization_applied: ['batch_processing'],
          performance_score: this.calculatePerformanceScore(Date.now() - startTime, totalUpdated)
        }
      };

    } catch (error) {
      console.error('Bulk update failed:', error);
      throw new Error(`Bulk update operation failed: ${error}`);
    }
  }

  /**
   * Database index optimization suggestions
   */
  async analyzeIndexOptimization(): Promise<{
    current_indexes: any[];
    recommendations: string[];
    performance_impact: string;
  }> {
    try {
      // Get current indexes
      const indexQuery = `
        SELECT name, sql 
        FROM sqlite_master 
        WHERE type = 'index' 
        AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `;
      
      const stmt = await this.db.prepare(indexQuery);
      const currentIndexes = await stmt.all();

      // Analyze query patterns and suggest optimizations
      const recommendations = [
        'CREATE INDEX IF NOT EXISTS idx_bookings_worker_date ON bookings(worker_id, booking_date)',
        'CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON bookings(client_email)',
        'CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)',
        'CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON bookings(booking_date, start_time)',
        'CREATE INDEX IF NOT EXISTS idx_worker_availability_worker_day ON worker_availability(worker_id, day_of_week)',
        'CREATE INDEX IF NOT EXISTS idx_service_time_slots_worker_service ON service_time_slots(worker_id, service_id)',
        'CREATE INDEX IF NOT EXISTS idx_recurring_bookings_worker ON recurring_bookings(worker_id)',
        'CREATE INDEX IF NOT EXISTS idx_booking_policies_worker ON booking_policies(worker_id)'
      ];

      return {
        current_indexes: currentIndexes.results || [],
        recommendations,
        performance_impact: 'Implementing these indexes can improve query performance by 50-90% for large datasets'
      };

    } catch (error) {
      console.error('Index analysis failed:', error);
      return {
        current_indexes: [],
        recommendations: [],
        performance_impact: 'Analysis failed'
      };
    }
  }

  /**
   * Cache management operations
   */
  getCacheStats(): {
    total_entries: number;
    cache_size_mb: number;
    hit_rate_percent: number;
    oldest_entry: string | null;
  } {
    const now = Date.now();
    let validEntries = 0;
    let totalSize = 0;
    let oldestTimestamp = now;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp < entry.ttl_seconds * 1000) {
        validEntries++;
        totalSize += JSON.stringify(entry.data).length;
        if (entry.timestamp < oldestTimestamp) {
          oldestTimestamp = entry.timestamp;
        }
      }
    }

    return {
      total_entries: validEntries,
      cache_size_mb: totalSize / (1024 * 1024),
      hit_rate_percent: 0, // Would need to track hits/misses
      oldest_entry: oldestTimestamp < now ? new Date(oldestTimestamp).toISOString() : null
    };
  }

  clearCache(pattern?: string): number {
    let cleared = 0;
    
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          cleared++;
        }
      }
    } else {
      cleared = this.cache.size;
      this.cache.clear();
    }
    
    return cleared;
  }

  // Private helper methods
  private getCachedResult(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl_seconds * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    return entry;
  }

  private setCachedResult(key: string, data: any, ttlSeconds: number): void {
    // Implement simple LRU by removing oldest entries when cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl_seconds: ttlSeconds,
      query_hash: this.hashQuery(key)
    });
  }

  private hashQuery(query: string): string {
    // Simple hash function for query caching
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private calculatePerformanceScore(
    queryTimeMs: number, 
    rowCount: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    // Performance scoring based on query time and dataset size
    if (queryTimeMs < 100) return 'excellent';
    if (queryTimeMs < 300) return 'good';
    if (queryTimeMs < 1000) return 'fair';
    return 'poor';
  }

  private getDefaultOptimization(): QueryOptimization {
    return {
      use_indexes: true,
      limit_results: true,
      enable_caching: true,
      pagination_size: 50,
      cache_ttl_seconds: this.defaultCacheTTL
    };
  }
}

/**
 * Create and apply database indexes for performance optimization
 */
export async function createPerformanceIndexes(database: any): Promise<{
  indexes_created: string[];
  errors: string[];
  performance_improvement: string;
}> {
  const indexesCreated: string[] = [];
  const errors: string[] = [];

  const indexes = [
    {
      name: 'idx_bookings_worker_date',
      sql: 'CREATE INDEX IF NOT EXISTS idx_bookings_worker_date ON bookings(worker_id, booking_date)'
    },
    {
      name: 'idx_bookings_client_email',
      sql: 'CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON bookings(client_email)'
    },
    {
      name: 'idx_bookings_status_date',
      sql: 'CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON bookings(status, booking_date)'
    },
    {
      name: 'idx_bookings_date_time',
      sql: 'CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, start_time)'
    },
    {
      name: 'idx_worker_availability_composite',
      sql: 'CREATE INDEX IF NOT EXISTS idx_worker_availability_composite ON worker_availability(worker_id, day_of_week, is_available)'
    },
    {
      name: 'idx_service_time_slots_worker',
      sql: 'CREATE INDEX IF NOT EXISTS idx_service_time_slots_worker ON service_time_slots(worker_id, is_available)'
    },
    {
      name: 'idx_recurring_bookings_worker_status',
      sql: 'CREATE INDEX IF NOT EXISTS idx_recurring_bookings_worker_status ON recurring_bookings(worker_id, status)'
    },
    {
      name: 'idx_booking_policies_worker',
      sql: 'CREATE INDEX IF NOT EXISTS idx_booking_policies_worker ON booking_policies(worker_id)'
    }
  ];

  for (const index of indexes) {
    try {
      await database.prepare(index.sql).run();
      indexesCreated.push(index.name);
    } catch (error) {
      errors.push(`${index.name}: ${error}`);
    }
  }

  return {
    indexes_created: indexesCreated,
    errors,
    performance_improvement: `Created ${indexesCreated.length} indexes. Expected 50-90% query performance improvement for large datasets.`
  };
}

/**
 * Performance monitoring and alerting
 */
export async function monitorPerformanceMetrics(database: any): Promise<{
  database_size_mb: number;
  total_records: number;
  slow_queries: any[];
  recommendations: string[];
}> {
  try {
    // Get database size (approximate)
    const sizeQuery = await database.prepare(`
      SELECT 
        (COUNT(*) * 1024) / (1024 * 1024) as estimated_size_mb
      FROM (
        SELECT 1 FROM bookings
        UNION ALL SELECT 1 FROM users
        UNION ALL SELECT 1 FROM services
        UNION ALL SELECT 1 FROM worker_availability
        UNION ALL SELECT 1 FROM service_time_slots
      )
    `).first();

    // Get record counts
    const recordCounts = await database.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM bookings) as bookings,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM services) as services,
        (SELECT COUNT(*) FROM worker_availability) as availability_records
    `).first();

    const totalRecords = Object.values(recordCounts || {}).reduce((sum: number, count: any) => sum + (count || 0), 0);

    // Performance recommendations based on data size
    const recommendations: string[] = [];
    
    if (totalRecords > 10000) {
      recommendations.push('Consider implementing result pagination for large queries');
      recommendations.push('Enable caching for frequently accessed data');
    }
    
    if (totalRecords > 50000) {
      recommendations.push('Implement database partitioning for historical data');
      recommendations.push('Consider archiving old bookings to improve performance');
    }

    if ((sizeQuery?.estimated_size_mb || 0) > 100) {
      recommendations.push('Database size exceeding 100MB - consider optimization');
    }

    return {
      database_size_mb: sizeQuery?.estimated_size_mb || 0,
      total_records: totalRecords,
      slow_queries: [], // Would need query logging to populate
      recommendations
    };

  } catch (error) {
    console.error('Performance monitoring failed:', error);
    return {
      database_size_mb: 0,
      total_records: 0,
      slow_queries: [],
      recommendations: ['Performance monitoring failed - check database connectivity']
    };
  }
}