/**
 * Predictive Analytics Service - Demand forecasting and trend prediction
 * 
 * This service handles:
 * - Demand forecasting for jobs and users
 * - Trend analysis and pattern detection
 * - Predictive model management and performance tracking
 * - Real-time prediction caching
 * - Statistical analysis and machine learning insights
 */

import { Logger } from '../utils/logger'

export interface DemandForecast {
  forecastId: string
  forecastType: 'job_demand' | 'user_growth' | 'revenue' | 'seasonal'
  category?: string
  forecastPeriod: 'daily' | 'weekly' | 'monthly'
  forecastDate: string
  predictedValue: number
  confidenceIntervalLower?: number
  confidenceIntervalUpper?: number
  confidenceScore: number // 0-1
  modelVersion: string
  modelAccuracy: number
  trainingDataPeriodStart: string
  trainingDataPeriodEnd: string
  factorsConsidered: Record<string, any>
  seasonalAdjustments?: Record<string, any>
  trendDirection: 'increasing' | 'decreasing' | 'stable'
  trendStrength: number // 0-1
}

export interface TrendAnalysis {
  analysisId: string
  analysisType: 'user_behavior' | 'job_patterns' | 'revenue_trends'
  metricName: string
  timePeriod: 'hourly' | 'daily' | 'weekly' | 'monthly'
  trendStartDate: string
  trendEndDate: string
  trendType: 'linear' | 'exponential' | 'seasonal' | 'cyclic'
  trendSlope?: number
  correlationStrength: number
  statisticalSignificance: number
  seasonalPattern?: Record<string, any>
  anomaliesDetected: number
  patternDescription: string
  businessImpact: string
  recommendedActions: string[]
}

export interface ModelPerformance {
  modelId: string
  modelName: string
  modelType: 'regression' | 'classification' | 'time_series'
  version: string
  trainingDate: string
  validationAccuracy: number
  testAccuracy: number
  precisionScore?: number
  recallScore?: number
  f1Score?: number
  meanAbsoluteError?: number
  rootMeanSquareError?: number
  trainingDataSize: number
  featureCount: number
  hyperparameters: Record<string, any>
  featureImportance: Record<string, number>
  isActive: boolean
  performanceNotes?: string
}

export interface PredictionCache {
  cacheKey: string
  modelId: string
  inputFeatures: Record<string, any>
  predictionResult: any
  confidenceScore: number
  computationTimeMs: number
  cacheExpiry: string
  hitCount: number
}

export class PredictiveAnalyticsService {
  private db: D1Database
  private logger: Logger

  constructor(database: D1Database) {
    this.db = database
    this.logger = new Logger('PredictiveAnalyticsService')
  }

  /**
   * Generate demand forecast for jobs by category
   */
  async generateJobDemandForecast(category: string, days: number = 30): Promise<{ success: boolean; forecasts?: DemandForecast[] }> {
    try {
      // Get historical data for the category
      const historicalData = await this.getHistoricalJobData(category, 90)
      
      if (historicalData.length < 7) {
        this.logger.warn(`Insufficient data for forecasting category: ${category}`)
        return { success: false }
      }

      const forecasts: DemandForecast[] = []

      // Simple linear regression forecasting (in production, use more sophisticated models)
      const trend = this.calculateTrend(historicalData.map(d => d.jobs_posted))
      const baseValue = historicalData[historicalData.length - 1].jobs_posted

      for (let i = 1; i <= days; i++) {
        const forecastDate = new Date()
        forecastDate.setDate(forecastDate.getDate() + i)
        const forecastDateStr = forecastDate.toISOString().split('T')[0]

        // Apply trend and seasonal adjustments
        const seasonalMultiplier = this.getSeasonalMultiplier(forecastDate, category)
        const predictedValue = Math.max(0, Math.round((baseValue + (trend.slope * i)) * seasonalMultiplier))
        
        const confidenceScore = Math.max(0.1, 0.9 - (i / days) * 0.4) // Decreasing confidence over time
        const confidenceInterval = predictedValue * 0.2 * (1 - confidenceScore)

        const forecast: DemandForecast = {
          forecastId: this.generateForecastId(),
          forecastType: 'job_demand',
          category,
          forecastPeriod: 'daily',
          forecastDate: forecastDateStr,
          predictedValue,
          confidenceIntervalLower: Math.max(0, Math.round(predictedValue - confidenceInterval)),
          confidenceIntervalUpper: Math.round(predictedValue + confidenceInterval),
          confidenceScore,
          modelVersion: 'linear_regression_v1.0',
          modelAccuracy: trend.correlation * 0.8, // Simplified accuracy estimate
          trainingDataPeriodStart: historicalData[0].metric_date,
          trainingDataPeriodEnd: historicalData[historicalData.length - 1].metric_date,
          factorsConsidered: {
            historical_trend: trend.slope,
            seasonal_pattern: seasonalMultiplier,
            data_points: historicalData.length
          },
          seasonalAdjustments: {
            multiplier: seasonalMultiplier,
            day_of_week: forecastDate.getDay(),
            month: forecastDate.getMonth() + 1
          },
          trendDirection: trend.slope > 0.1 ? 'increasing' : trend.slope < -0.1 ? 'decreasing' : 'stable',
          trendStrength: Math.min(1, Math.abs(trend.slope) * 0.1)
        }

        forecasts.push(forecast)

        // Store forecast in database
        await this.storeDemandForecast(forecast)
      }

      this.logger.info(`Generated ${forecasts.length} job demand forecasts for category: ${category}`)
      return { success: true, forecasts }

    } catch (error) {
      this.logger.error('Error generating job demand forecast:', error)
      return { success: false }
    }
  }

  /**
   * Generate user growth forecast
   */
  async generateUserGrowthForecast(days: number = 30): Promise<{ success: boolean; forecasts?: DemandForecast[] }> {
    try {
      // Get historical user growth data
      const historicalData = await this.db.prepare(`
        SELECT metric_date, new_users, total_users
        FROM growth_metrics
        WHERE metric_type = 'daily'
        AND metric_date >= DATE('now', '-90 days')
        ORDER BY metric_date
      `).all()

      if (!historicalData.results || historicalData.results.length < 7) {
        this.logger.warn('Insufficient data for user growth forecasting')
        return { success: false }
      }

      const data = historicalData.results
      const forecasts: DemandForecast[] = []

      // Calculate trend for new users
      const newUsersTrend = this.calculateTrend(data.map((d: any) => d.new_users))
      const baseNewUsers = data[data.length - 1].new_users

      // Calculate trend for total users
      const totalUsersTrend = this.calculateTrend(data.map((d: any) => d.total_users))
      let baseTotalUsers = data[data.length - 1].total_users

      for (let i = 1; i <= days; i++) {
        const forecastDate = new Date()
        forecastDate.setDate(forecastDate.getDate() + i)
        const forecastDateStr = forecastDate.toISOString().split('T')[0]

        // Forecast new users
        const predictedNewUsers = Math.max(0, Math.round(baseNewUsers + (newUsersTrend.slope * i)))
        baseTotalUsers += predictedNewUsers // Accumulate total users

        const confidenceScore = Math.max(0.2, 0.85 - (i / days) * 0.3)

        const newUsersForecast: DemandForecast = {
          forecastId: this.generateForecastId(),
          forecastType: 'user_growth',
          category: 'new_users',
          forecastPeriod: 'daily',
          forecastDate: forecastDateStr,
          predictedValue: predictedNewUsers,
          confidenceScore,
          modelVersion: 'linear_regression_v1.0',
          modelAccuracy: newUsersTrend.correlation * 0.75,
          trainingDataPeriodStart: data[0].metric_date,
          trainingDataPeriodEnd: data[data.length - 1].metric_date,
          factorsConsidered: {
            trend_slope: newUsersTrend.slope,
            correlation: newUsersTrend.correlation,
            seasonal_factors: this.getSeasonalMultiplier(forecastDate, 'users')
          },
          trendDirection: newUsersTrend.slope > 0.5 ? 'increasing' : newUsersTrend.slope < -0.5 ? 'decreasing' : 'stable',
          trendStrength: Math.min(1, Math.abs(newUsersTrend.slope) * 0.05)
        }

        const totalUsersForecast: DemandForecast = {
          forecastId: this.generateForecastId(),
          forecastType: 'user_growth',
          category: 'total_users',
          forecastPeriod: 'daily',
          forecastDate: forecastDateStr,
          predictedValue: baseTotalUsers,
          confidenceScore: confidenceScore * 0.95, // Slightly more confident in cumulative totals
          modelVersion: 'cumulative_growth_v1.0',
          modelAccuracy: totalUsersTrend.correlation * 0.8,
          trainingDataPeriodStart: data[0].metric_date,
          trainingDataPeriodEnd: data[data.length - 1].metric_date,
          factorsConsidered: {
            base_total: data[data.length - 1].total_users,
            daily_growth: predictedNewUsers
          },
          trendDirection: 'increasing', // Total users should always increase
          trendStrength: Math.min(1, predictedNewUsers / Math.max(baseTotalUsers, 1))
        }

        forecasts.push(newUsersForecast, totalUsersForecast)

        // Store forecasts
        await this.storeDemandForecast(newUsersForecast)
        await this.storeDemandForecast(totalUsersForecast)
      }

      this.logger.info(`Generated ${forecasts.length} user growth forecasts`)
      return { success: true, forecasts }

    } catch (error) {
      this.logger.error('Error generating user growth forecast:', error)
      return { success: false }
    }
  }

  /**
   * Analyze trends in platform metrics
   */
  async analyzeTrends(metricName: string, analysisType: string, days: number = 30): Promise<{ success: boolean; analysis?: TrendAnalysis }> {
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString().split('T')[0]

      // Get data based on analysis type
      let data: any[] = []
      let queryResult

      switch (analysisType) {
        case 'user_behavior':
          queryResult = await this.db.prepare(`
            SELECT metric_date, SUM(page_views) as value
            FROM user_engagement_metrics
            WHERE metric_date >= ? AND metric_date <= ?
            GROUP BY metric_date
            ORDER BY metric_date
          `).bind(startDateStr, endDate).all()
          break

        case 'job_patterns':
          queryResult = await this.db.prepare(`
            SELECT metric_date, SUM(jobs_posted) as value
            FROM job_performance_metrics
            WHERE metric_date >= ? AND metric_date <= ?
            GROUP BY metric_date
            ORDER BY metric_date
          `).bind(startDateStr, endDate).all()
          break

        case 'revenue_trends':
          queryResult = await this.db.prepare(`
            SELECT metric_date, total_revenue as value
            FROM revenue_metrics
            WHERE metric_date >= ? AND metric_date <= ? AND metric_type = 'daily'
            ORDER BY metric_date
          `).bind(startDateStr, endDate).all()
          break

        default:
          throw new Error(`Unknown analysis type: ${analysisType}`)
      }

      data = queryResult?.results || []

      if (data.length < 7) {
        this.logger.warn(`Insufficient data for trend analysis: ${analysisType}`)
        return { success: false }
      }

      // Calculate trend statistics
      const values = data.map((d: any) => d.value)
      const trend = this.calculateTrend(values)
      const anomalies = this.detectAnomalies(values)
      const seasonality = this.detectSeasonality(values)

      // Determine trend type
      let trendType: 'linear' | 'exponential' | 'seasonal' | 'cyclic' = 'linear'
      if (seasonality.isSignificant) {
        trendType = seasonality.period <= 7 ? 'cyclic' : 'seasonal'
      } else if (Math.abs(trend.slope) > trend.intercept * 0.1) {
        trendType = 'exponential'
      }

      const analysis: TrendAnalysis = {
        analysisId: this.generateAnalysisId(),
        analysisType: analysisType as any,
        metricName,
        timePeriod: 'daily',
        trendStartDate: startDateStr,
        trendEndDate: endDate,
        trendType,
        trendSlope: trend.slope,
        correlationStrength: trend.correlation,
        statisticalSignificance: this.calculateSignificance(trend.correlation, data.length),
        seasonalPattern: seasonality.isSignificant ? seasonality.pattern : undefined,
        anomaliesDetected: anomalies.length,
        patternDescription: this.generatePatternDescription(trend, seasonality, anomalies),
        businessImpact: this.assessBusinessImpact(analysisType, trend, anomalies),
        recommendedActions: this.generateRecommendations(analysisType, trend, seasonality, anomalies)
      }

      // Store analysis
      await this.storeTrendAnalysis(analysis)

      this.logger.info(`Trend analysis completed: ${analysis.analysisId}`)
      return { success: true, analysis }

    } catch (error) {
      this.logger.error('Error analyzing trends:', error)
      return { success: false }
    }
  }

  /**
   * Get cached prediction or compute new one
   */
  async getPrediction(modelId: string, inputFeatures: Record<string, any>): Promise<{ success: boolean; prediction?: any; fromCache?: boolean }> {
    try {
      const cacheKey = this.generateCacheKey(modelId, inputFeatures)

      // Check cache first
      const cached = await this.db.prepare(`
        SELECT * FROM prediction_cache 
        WHERE cache_key = ? AND cache_expiry > CURRENT_TIMESTAMP
      `).bind(cacheKey).first()

      if (cached) {
        // Update hit count
        await this.db.prepare(`
          UPDATE prediction_cache 
          SET hit_count = hit_count + 1, last_accessed_at = CURRENT_TIMESTAMP 
          WHERE cache_key = ?
        `).bind(cacheKey).run()

        return {
          success: true,
          prediction: JSON.parse(cached.prediction_result),
          fromCache: true
        }
      }

      // Compute new prediction (simplified - would use actual ML model)
      const startTime = Date.now()
      const prediction = await this.computePrediction(modelId, inputFeatures)
      const computationTime = Date.now() - startTime

      // Cache the result
      await this.db.prepare(`
        INSERT OR REPLACE INTO prediction_cache (
          cache_key, model_id, input_features, prediction_result,
          confidence_score, computation_time_ms, cache_expiry, hit_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        cacheKey,
        modelId,
        JSON.stringify(inputFeatures),
        JSON.stringify(prediction),
        prediction.confidence || 0.5,
        computationTime,
        this.calculateCacheExpiry(),
        0
      ).run()

      return {
        success: true,
        prediction,
        fromCache: false
      }

    } catch (error) {
      this.logger.error('Error getting prediction:', error)
      return { success: false }
    }
  }

  /**
   * Get demand forecasts
   */
  async getDemandForecasts(forecastType: string, category?: string, days: number = 7): Promise<DemandForecast[]> {
    try {
      let sql = `
        SELECT * FROM demand_forecasts 
        WHERE forecast_type = ? 
        AND forecast_date >= DATE('now')
        AND forecast_date <= DATE('now', '+' || ? || ' days')
      `
      const params: any[] = [forecastType, days]

      if (category) {
        sql += ` AND category = ?`
        params.push(category)
      }

      sql += ` ORDER BY forecast_date`

      const forecasts = await this.db.prepare(sql).bind(...params).all()

      return (forecasts.results || []).map(this.mapDbForecastToModel)

    } catch (error) {
      this.logger.error('Error getting demand forecasts:', error)
      return []
    }
  }

  /**
   * Get trend analyses
   */
  async getTrendAnalyses(analysisType?: string, days: number = 30): Promise<TrendAnalysis[]> {
    try {
      let sql = `
        SELECT * FROM trend_analysis 
        WHERE trend_start_date >= DATE('now', '-' || ? || ' days')
      `
      const params: any[] = [days]

      if (analysisType) {
        sql += ` AND analysis_type = ?`
        params.push(analysisType)
      }

      sql += ` ORDER BY trend_start_date DESC`

      const analyses = await this.db.prepare(sql).bind(...params).all()

      return (analyses.results || []).map(this.mapDbAnalysisToModel)

    } catch (error) {
      this.logger.error('Error getting trend analyses:', error)
      return []
    }
  }

  /**
   * Store demand forecast
   */
  private async storeDemandForecast(forecast: DemandForecast): Promise<void> {
    await this.db.prepare(`
      INSERT OR REPLACE INTO demand_forecasts (
        forecast_id, forecast_type, category, forecast_period, forecast_date,
        predicted_value, confidence_interval_lower, confidence_interval_upper,
        confidence_score, model_version, model_accuracy, training_data_period_start,
        training_data_period_end, factors_considered, seasonal_adjustments,
        trend_direction, trend_strength
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      forecast.forecastId,
      forecast.forecastType,
      forecast.category || null,
      forecast.forecastPeriod,
      forecast.forecastDate,
      forecast.predictedValue,
      forecast.confidenceIntervalLower || null,
      forecast.confidenceIntervalUpper || null,
      forecast.confidenceScore,
      forecast.modelVersion,
      forecast.modelAccuracy,
      forecast.trainingDataPeriodStart,
      forecast.trainingDataPeriodEnd,
      JSON.stringify(forecast.factorsConsidered),
      forecast.seasonalAdjustments ? JSON.stringify(forecast.seasonalAdjustments) : null,
      forecast.trendDirection,
      forecast.trendStrength
    ).run()
  }

  /**
   * Store trend analysis
   */
  private async storeTrendAnalysis(analysis: TrendAnalysis): Promise<void> {
    await this.db.prepare(`
      INSERT INTO trend_analysis (
        analysis_id, analysis_type, metric_name, time_period, trend_start_date,
        trend_end_date, trend_type, trend_slope, correlation_strength,
        statistical_significance, seasonal_pattern, anomalies_detected,
        pattern_description, business_impact, recommended_actions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      analysis.analysisId,
      analysis.analysisType,
      analysis.metricName,
      analysis.timePeriod,
      analysis.trendStartDate,
      analysis.trendEndDate,
      analysis.trendType,
      analysis.trendSlope || null,
      analysis.correlationStrength,
      analysis.statisticalSignificance,
      analysis.seasonalPattern ? JSON.stringify(analysis.seasonalPattern) : null,
      analysis.anomaliesDetected,
      analysis.patternDescription,
      analysis.businessImpact,
      JSON.stringify(analysis.recommendedActions)
    ).run()
  }

  /**
   * Get historical job data for forecasting
   */
  private async getHistoricalJobData(category: string, days: number): Promise<any[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    const result = await this.db.prepare(`
      SELECT metric_date, jobs_posted, jobs_completed
      FROM job_performance_metrics
      WHERE job_category = ? AND metric_date >= ?
      ORDER BY metric_date
    `).bind(category, startDateStr).all()

    return result.results || []
  }

  /**
   * Calculate linear trend from data points
   */
  private calculateTrend(values: number[]): { slope: number; intercept: number; correlation: number } {
    const n = values.length
    if (n < 2) return { slope: 0, intercept: 0, correlation: 0 }

    const indices = Array.from({ length: n }, (_, i) => i)
    
    const sumX = indices.reduce((a, b) => a + b, 0)
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0)
    const sumXX = indices.reduce((sum, x) => sum + x * x, 0)
    const sumYY = values.reduce((sum, y) => sum + y * y, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calculate correlation coefficient
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))
    const correlation = denominator === 0 ? 0 : numerator / denominator

    return { slope, intercept, correlation: Math.abs(correlation) }
  }

  /**
   * Get seasonal multiplier based on date and category
   */
  private getSeasonalMultiplier(date: Date, category: string): number {
    const dayOfWeek = date.getDay()
    const month = date.getMonth() + 1

    // Simplified seasonal adjustments
    let multiplier = 1.0

    // Weekend effect (lower activity on weekends for most categories)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      multiplier *= category === 'entertainment' ? 1.2 : 0.7
    }

    // Monthly seasonality (simplified)
    if (month >= 11 || month <= 1) { // Holiday season
      multiplier *= category === 'retail' ? 1.5 : 0.9
    } else if (month >= 6 && month <= 8) { // Summer
      multiplier *= category === 'tourism' ? 1.3 : 1.0
    }

    return multiplier
  }

  /**
   * Detect anomalies in data series
   */
  private detectAnomalies(values: number[]): number[] {
    if (values.length < 3) return []

    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const stdDev = Math.sqrt(values.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / values.length)

    const anomalies: number[] = []
    const threshold = 2.5 // Standard deviations

    values.forEach((value, index) => {
      if (Math.abs(value - mean) > threshold * stdDev) {
        anomalies.push(index)
      }
    })

    return anomalies
  }

  /**
   * Detect seasonality in data series
   */
  private detectSeasonality(values: number[]): { isSignificant: boolean; period?: number; pattern?: Record<string, number> } {
    if (values.length < 14) return { isSignificant: false }

    // Simple autocorrelation for weekly pattern (7 days)
    const weeklyCorrelation = this.calculateAutocorrelation(values, 7)
    
    if (weeklyCorrelation > 0.3) {
      return {
        isSignificant: true,
        period: 7,
        pattern: { weekly_correlation: weeklyCorrelation }
      }
    }

    return { isSignificant: false }
  }

  /**
   * Calculate autocorrelation for given lag
   */
  private calculateAutocorrelation(values: number[], lag: number): number {
    if (values.length <= lag) return 0

    const n = values.length - lag
    const mean = values.reduce((a, b) => a + b, 0) / values.length

    let numerator = 0
    let denominator = 0

    for (let i = 0; i < n; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean)
    }

    for (const value of values) {
      denominator += Math.pow(value - mean, 2)
    }

    return denominator === 0 ? 0 : numerator / denominator
  }

  /**
   * Calculate statistical significance
   */
  private calculateSignificance(correlation: number, sampleSize: number): number {
    // Simplified significance calculation
    const tStat = correlation * Math.sqrt((sampleSize - 2) / (1 - correlation * correlation))
    return Math.min(0.99, Math.max(0.01, 1 - Math.abs(tStat) / 10))
  }

  /**
   * Generate pattern description
   */
  private generatePatternDescription(trend: any, seasonality: any, anomalies: number[]): string {
    const parts = []

    if (Math.abs(trend.slope) > 0.1) {
      parts.push(`${trend.slope > 0 ? 'Increasing' : 'Decreasing'} trend detected (slope: ${trend.slope.toFixed(3)})`)
    } else {
      parts.push('Stable pattern with minimal trend')
    }

    if (seasonality.isSignificant) {
      parts.push(`Seasonal pattern with ${seasonality.period}-day cycle`)
    }

    if (anomalies.length > 0) {
      parts.push(`${anomalies.length} anomalies detected`)
    }

    return parts.join('. ')
  }

  /**
   * Assess business impact
   */
  private assessBusinessImpact(analysisType: string, trend: any, anomalies: number[]): string {
    const impacts = []

    if (trend.slope > 0.5) {
      impacts.push(`Positive ${analysisType} growth indicates healthy platform expansion`)
    } else if (trend.slope < -0.5) {
      impacts.push(`Declining ${analysisType} trend requires attention and intervention`)
    }

    if (anomalies.length > 2) {
      impacts.push('High anomaly count suggests irregular patterns that may need investigation')
    }

    return impacts.join('. ') || 'Stable metrics with normal variation'
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(analysisType: string, trend: any, seasonality: any, anomalies: number[]): string[] {
    const recommendations = []

    if (trend.slope < -0.3) {
      recommendations.push(`Investigate causes of declining ${analysisType}`)
      recommendations.push('Consider promotional campaigns or product improvements')
    }

    if (seasonality.isSignificant) {
      recommendations.push('Plan resource allocation based on seasonal patterns')
      recommendations.push('Optimize marketing spend during peak periods')
    }

    if (anomalies.length > 1) {
      recommendations.push('Review operational changes during anomaly periods')
      recommendations.push('Implement monitoring alerts for unusual patterns')
    }

    return recommendations.length > 0 ? recommendations : ['Continue monitoring current trends']
  }

  /**
   * Compute prediction (simplified placeholder)
   */
  private async computePrediction(modelId: string, inputFeatures: Record<string, any>): Promise<any> {
    // This would integrate with actual ML models in production
    return {
      prediction: Math.random() * 100,
      confidence: 0.8,
      model_used: modelId,
      computation_time: Date.now()
    }
  }

  /**
   * Generate cache key for predictions
   */
  private generateCacheKey(modelId: string, inputFeatures: Record<string, any>): string {
    const featuresStr = JSON.stringify(inputFeatures)
    return `${modelId}_${Buffer.from(featuresStr).toString('base64').substring(0, 20)}`
  }

  /**
   * Calculate cache expiry (1 hour from now)
   */
  private calculateCacheExpiry(): string {
    const date = new Date()
    date.setHours(date.getHours() + 1)
    return date.toISOString()
  }

  /**
   * Generate forecast ID
   */
  private generateForecastId(): string {
    return `forecast_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * Generate analysis ID
   */
  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * Map database forecast to model
   */
  private mapDbForecastToModel(dbForecast: any): DemandForecast {
    return {
      forecastId: dbForecast.forecast_id,
      forecastType: dbForecast.forecast_type,
      category: dbForecast.category,
      forecastPeriod: dbForecast.forecast_period,
      forecastDate: dbForecast.forecast_date,
      predictedValue: dbForecast.predicted_value,
      confidenceIntervalLower: dbForecast.confidence_interval_lower,
      confidenceIntervalUpper: dbForecast.confidence_interval_upper,
      confidenceScore: dbForecast.confidence_score,
      modelVersion: dbForecast.model_version,
      modelAccuracy: dbForecast.model_accuracy,
      trainingDataPeriodStart: dbForecast.training_data_period_start,
      trainingDataPeriodEnd: dbForecast.training_data_period_end,
      factorsConsidered: JSON.parse(dbForecast.factors_considered || '{}'),
      seasonalAdjustments: dbForecast.seasonal_adjustments ? JSON.parse(dbForecast.seasonal_adjustments) : undefined,
      trendDirection: dbForecast.trend_direction,
      trendStrength: dbForecast.trend_strength
    }
  }

  /**
   * Map database analysis to model
   */
  private mapDbAnalysisToModel(dbAnalysis: any): TrendAnalysis {
    return {
      analysisId: dbAnalysis.analysis_id,
      analysisType: dbAnalysis.analysis_type,
      metricName: dbAnalysis.metric_name,
      timePeriod: dbAnalysis.time_period,
      trendStartDate: dbAnalysis.trend_start_date,
      trendEndDate: dbAnalysis.trend_end_date,
      trendType: dbAnalysis.trend_type,
      trendSlope: dbAnalysis.trend_slope,
      correlationStrength: dbAnalysis.correlation_strength,
      statisticalSignificance: dbAnalysis.statistical_significance,
      seasonalPattern: dbAnalysis.seasonal_pattern ? JSON.parse(dbAnalysis.seasonal_pattern) : undefined,
      anomaliesDetected: dbAnalysis.anomalies_detected,
      patternDescription: dbAnalysis.pattern_description,
      businessImpact: dbAnalysis.business_impact,
      recommendedActions: JSON.parse(dbAnalysis.recommended_actions || '[]')
    }
  }
}