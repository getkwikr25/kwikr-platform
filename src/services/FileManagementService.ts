import { D1Database } from '@cloudflare/workers-types'

export interface FileUploadOptions {
  categoryId: number
  description?: string
  altText?: string
  tags?: string[]
  visibility?: 'public' | 'private' | 'shared'
  expiresAt?: string
  generateThumbnail?: boolean
  compress?: boolean
  watermark?: boolean
}

export interface FileMetadata {
  width?: number
  height?: number
  format?: string
  size?: number
  exifData?: Record<string, any>
  colorProfile?: string
  hasAlpha?: boolean
}

export interface ProcessingOptions {
  resize?: {
    width?: number
    height?: number
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
    quality?: number
  }
  compress?: {
    quality?: number
    format?: 'jpg' | 'png' | 'webp'
  }
  watermark?: {
    text?: string
    image?: string
    position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center'
    opacity?: number
  }
}

export interface FileSearchOptions {
  categoryId?: number
  uploadStatus?: string
  approvalStatus?: string
  visibility?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'file_size' | 'filename'
  sortOrder?: 'asc' | 'desc'
}

export interface ShareOptions {
  accessLevel?: 'view' | 'download' | 'edit' | 'delete'
  isPublic?: boolean
  password?: string
  expiresAt?: string
  maxDownloads?: number
}

export class FileManagementService {
  constructor(private db: D1Database, private r2?: R2Bucket) {}

  // ===============================
  // Core File Operations
  // ===============================

  async uploadFile(
    userId: number,
    file: File,
    options: FileUploadOptions
  ): Promise<{ fileId: number; url?: string; error?: string }> {
    try {
      // Validate file category
      const category = await this.getFileCategory(options.categoryId)
      if (!category) {
        return { fileId: 0, error: 'Invalid file category' }
      }

      // Check file extension
      const fileExtension = this.getFileExtension(file.name)
      const allowedExtensions = JSON.parse(category.allowed_extensions)
      if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
        return { fileId: 0, error: `File type .${fileExtension} not allowed for this category` }
      }

      // Check file size
      if (file.size > category.max_file_size) {
        return { fileId: 0, error: `File size exceeds limit of ${this.formatBytes(category.max_file_size)}` }
      }

      // Check user quota
      const quotaCheck = await this.checkUserQuota(userId, file.size)
      if (!quotaCheck.allowed) {
        return { fileId: 0, error: quotaCheck.message }
      }

      // Generate unique filename
      const storedFilename = this.generateUniqueFilename(fileExtension)
      const storagePath = `files/${userId}/${options.categoryId}/${storedFilename}`

      // Calculate file hash
      const fileBuffer = await file.arrayBuffer()
      const fileHash = await this.calculateFileHash(fileBuffer)

      // Check for duplicates
      const existingFile = await this.findFileByHash(userId, fileHash)
      if (existingFile) {
        return { fileId: existingFile.id, url: existingFile.cdn_url, error: 'File already exists' }
      }

      // Extract metadata
      const metadata = await this.extractFileMetadata(file, fileBuffer)

      // Create file record
      const fileId = await this.createFileRecord(userId, {
        categoryId: options.categoryId,
        originalFilename: file.name,
        storedFilename,
        fileExtension,
        mimeType: file.type,
        fileSize: file.size,
        fileHash,
        storagePath,
        visibility: options.visibility || 'private',
        description: options.description,
        altText: options.altText,
        tags: options.tags ? JSON.stringify(options.tags) : null,
        metadata: JSON.stringify(metadata),
        expiresAt: options.expiresAt,
        approvalStatus: category.requires_approval ? 'pending' : 'approved'
      })

      // Upload to R2 if available
      let cdnUrl: string | undefined
      if (this.r2) {
        try {
          await this.r2.put(storagePath, fileBuffer, {
            httpMetadata: {
              contentType: file.type,
              contentDisposition: `attachment; filename="${file.name}"`
            }
          })

          // Update upload status
          await this.updateFileStatus(fileId, 'completed')
          
          // Generate CDN URL (you'll need to configure this based on your R2 setup)
          cdnUrl = `https://your-r2-domain.com/${storagePath}`
          await this.updateFileCdnUrl(fileId, cdnUrl)

        } catch (uploadError) {
          console.error('R2 upload failed:', uploadError)
          await this.updateFileStatus(fileId, 'failed')
          return { fileId, error: 'Upload to storage failed' }
        }
      }

      // Schedule post-processing jobs
      if (this.isImageFile(file.type)) {
        if (options.generateThumbnail) {
          await this.scheduleProcessingJob(fileId, 'thumbnail', {
            width: 300,
            height: 300,
            fit: 'cover'
          })
        }

        if (options.compress) {
          await this.scheduleProcessingJob(fileId, 'compress', {
            quality: 80,
            format: 'webp'
          })
        }

        if (options.watermark) {
          await this.scheduleProcessingJob(fileId, 'watermark', {
            text: 'getKwikr',
            position: 'bottomRight',
            opacity: 0.7
          })
        }
      }

      // Log access
      await this.logFileAccess(fileId, userId, 'upload', 'success')

      return { fileId, url: cdnUrl }

    } catch (error) {
      console.error('File upload error:', error)
      return { fileId: 0, error: 'Upload failed' }
    }
  }

  async downloadFile(fileId: number, userId?: number, shareToken?: string): Promise<{
    success: boolean
    file?: ArrayBuffer
    filename?: string
    mimeType?: string
    error?: string
  }> {
    try {
      // Get file record
      const file = await this.getFileById(fileId)
      if (!file) {
        return { success: false, error: 'File not found' }
      }

      // Check access permissions
      const accessCheck = await this.checkFileAccess(fileId, userId, 'download', shareToken)
      if (!accessCheck.allowed) {
        await this.logFileAccess(fileId, userId, 'download', 'denied')
        return { success: false, error: accessCheck.message }
      }

      // Download from R2
      if (this.r2 && file.storage_provider === 'cloudflare_r2') {
        const object = await this.r2.get(file.storage_path)
        if (!object) {
          return { success: false, error: 'File not found in storage' }
        }

        const fileBuffer = await object.arrayBuffer()

        // Update download count if accessed via share
        if (shareToken) {
          await this.incrementShareDownloadCount(shareToken)
        }

        // Log successful access
        await this.logFileAccess(fileId, userId, 'download', 'success', shareToken)

        return {
          success: true,
          file: fileBuffer,
          filename: file.original_filename,
          mimeType: file.mime_type
        }
      }

      return { success: false, error: 'Storage provider not configured' }

    } catch (error) {
      console.error('File download error:', error)
      await this.logFileAccess(fileId, userId, 'download', 'error')
      return { success: false, error: 'Download failed' }
    }
  }

  async deleteFile(fileId: number, userId: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Get file record
      const file = await this.getFileById(fileId)
      if (!file) {
        return { success: false, error: 'File not found' }
      }

      // Check ownership or admin permissions
      const accessCheck = await this.checkFileAccess(fileId, userId, 'delete')
      if (!accessCheck.allowed) {
        return { success: false, error: accessCheck.message }
      }

      // Delete from R2
      if (this.r2 && file.storage_provider === 'cloudflare_r2') {
        try {
          await this.r2.delete(file.storage_path)

          // Delete versions
          const versions = await this.getFileVersions(fileId)
          for (const version of versions) {
            await this.r2.delete(version.storage_path)
          }
        } catch (r2Error) {
          console.error('R2 deletion failed:', r2Error)
          // Continue with database cleanup even if R2 deletion fails
        }
      }

      // Delete from database (CASCADE will handle related records)
      await this.db.prepare('DELETE FROM files WHERE id = ?').bind(fileId).run()

      // Log access
      await this.logFileAccess(fileId, userId, 'delete', 'success')

      return { success: true }

    } catch (error) {
      console.error('File deletion error:', error)
      return { success: false, error: 'Deletion failed' }
    }
  }

  // ===============================
  // File Processing
  // ===============================

  async processImage(
    fileId: number,
    options: ProcessingOptions
  ): Promise<{ success: boolean; resultFileId?: number; error?: string }> {
    try {
      // This is a placeholder for image processing
      // In a real implementation, you would use libraries like sharp or ImageMagick
      // For Cloudflare Workers, you might use Cloudflare Images API

      const processingJobId = await this.scheduleProcessingJob(fileId, 'resize', options.resize)
      
      // Simulate processing (in real implementation, this would be async)
      setTimeout(async () => {
        try {
          // Mark job as completed
          await this.updateProcessingJobStatus(processingJobId, 'completed')
          
          // Create result file version
          // This would contain the actual processed image
          
        } catch (error) {
          await this.updateProcessingJobStatus(processingJobId, 'failed', error.message)
        }
      }, 1000)

      return { success: true }

    } catch (error) {
      console.error('Image processing error:', error)
      return { success: false, error: 'Processing failed' }
    }
  }

  async generateThumbnail(fileId: number, width: number = 300, height: number = 300): Promise<{
    success: boolean
    thumbnailFileId?: number
    error?: string
  }> {
    try {
      const file = await this.getFileById(fileId)
      if (!file || !this.isImageFile(file.mime_type)) {
        return { success: false, error: 'File is not an image' }
      }

      // Schedule thumbnail generation
      const jobId = await this.scheduleProcessingJob(fileId, 'thumbnail', {
        width,
        height,
        fit: 'cover'
      })

      return { success: true }

    } catch (error) {
      console.error('Thumbnail generation error:', error)
      return { success: false, error: 'Thumbnail generation failed' }
    }
  }

  // ===============================
  // File Sharing & Access Control
  // ===============================

  async createFileShare(
    fileId: number,
    userId: number,
    options: ShareOptions = {}
  ): Promise<{ success: boolean; shareToken?: string; shareUrl?: string; error?: string }> {
    try {
      const file = await this.getFileById(fileId)
      if (!file) {
        return { success: false, error: 'File not found' }
      }

      // Check if user can share this file
      const accessCheck = await this.checkFileAccess(fileId, userId, 'share')
      if (!accessCheck.allowed) {
        return { success: false, error: accessCheck.message }
      }

      // Generate share token
      const shareToken = this.generateShareToken()
      
      // Hash password if provided
      let passwordHash: string | null = null
      if (options.password) {
        passwordHash = await this.hashPassword(options.password)
      }

      // Create share record
      const result = await this.db.prepare(`
        INSERT INTO file_shares (
          file_id, shared_by_user_id, share_token, access_level, is_public,
          password_protected, password_hash, expires_at, max_downloads
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        fileId,
        userId,
        shareToken,
        options.accessLevel || 'view',
        options.isPublic || false,
        !!options.password,
        passwordHash,
        options.expiresAt,
        options.maxDownloads
      ).run()

      const shareUrl = `${this.getBaseUrl()}/shared/${shareToken}`

      return {
        success: true,
        shareToken,
        shareUrl
      }

    } catch (error) {
      console.error('File share creation error:', error)
      return { success: false, error: 'Share creation failed' }
    }
  }

  async revokeFileShare(shareToken: string, userId: number): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // Check if user owns this share
      const share = await this.db.prepare(`
        SELECT * FROM file_shares WHERE share_token = ? AND shared_by_user_id = ?
      `).bind(shareToken, userId).first()

      if (!share) {
        return { success: false, error: 'Share not found or access denied' }
      }

      // Deactivate share
      await this.db.prepare(`
        UPDATE file_shares SET is_active = FALSE WHERE share_token = ?
      `).bind(shareToken).run()

      return { success: true }

    } catch (error) {
      console.error('Share revocation error:', error)
      return { success: false, error: 'Share revocation failed' }
    }
  }

  // ===============================
  // Collections & Portfolios
  // ===============================

  async createFileCollection(
    userId: number,
    name: string,
    type: 'portfolio' | 'album' | 'document_set' | 'gallery' | 'archive',
    description?: string,
    isPublic: boolean = false
  ): Promise<{ collectionId: number; error?: string }> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO file_collections (user_id, collection_name, collection_type, description, is_public)
        VALUES (?, ?, ?, ?, ?)
      `).bind(userId, name, type, description, isPublic).run()

      return { collectionId: result.meta.last_row_id as number }

    } catch (error) {
      console.error('Collection creation error:', error)
      return { collectionId: 0, error: 'Collection creation failed' }
    }
  }

  async addFileToCollection(
    collectionId: number,
    fileId: number,
    userId: number,
    caption?: string,
    displayOrder: number = 0
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user owns the collection
      const collection = await this.db.prepare(`
        SELECT * FROM file_collections WHERE id = ? AND user_id = ?
      `).bind(collectionId, userId).first()

      if (!collection) {
        return { success: false, error: 'Collection not found or access denied' }
      }

      // Check if user has access to the file
      const accessCheck = await this.checkFileAccess(fileId, userId, 'view')
      if (!accessCheck.allowed) {
        return { success: false, error: 'File access denied' }
      }

      // Add file to collection
      await this.db.prepare(`
        INSERT OR REPLACE INTO file_collection_items (collection_id, file_id, display_order, caption)
        VALUES (?, ?, ?, ?)
      `).bind(collectionId, fileId, displayOrder, caption).run()

      return { success: true }

    } catch (error) {
      console.error('Add to collection error:', error)
      return { success: false, error: 'Failed to add file to collection' }
    }
  }

  // ===============================
  // Query Methods
  // ===============================

  async getUserFiles(userId: number, options: FileSearchOptions = {}): Promise<any[]> {
    try {
      let query = `
        SELECT f.*, fc.category_name, fc.description as category_description
        FROM files f
        JOIN file_categories fc ON f.category_id = fc.id
        WHERE f.user_id = ?
      `
      const params: any[] = [userId]

      // Apply filters
      if (options.categoryId) {
        query += ' AND f.category_id = ?'
        params.push(options.categoryId)
      }

      if (options.uploadStatus) {
        query += ' AND f.upload_status = ?'
        params.push(options.uploadStatus)
      }

      if (options.approvalStatus) {
        query += ' AND f.approval_status = ?'
        params.push(options.approvalStatus)
      }

      if (options.visibility) {
        query += ' AND f.visibility = ?'
        params.push(options.visibility)
      }

      if (options.dateFrom) {
        query += ' AND f.created_at >= ?'
        params.push(options.dateFrom)
      }

      if (options.dateTo) {
        query += ' AND f.created_at <= ?'
        params.push(options.dateTo)
      }

      // Add sorting
      const sortBy = options.sortBy || 'created_at'
      const sortOrder = options.sortOrder || 'desc'
      query += ` ORDER BY f.${sortBy} ${sortOrder}`

      // Add pagination
      const limit = Math.min(options.limit || 50, 100)
      const offset = options.offset || 0
      query += ' LIMIT ? OFFSET ?'
      params.push(limit, offset)

      const result = await this.db.prepare(query).bind(...params).all()
      return result.results || []

    } catch (error) {
      console.error('Get user files error:', error)
      return []
    }
  }

  async getFileById(fileId: number): Promise<any | null> {
    try {
      const result = await this.db.prepare(`
        SELECT f.*, fc.category_name
        FROM files f
        JOIN file_categories fc ON f.category_id = fc.id
        WHERE f.id = ?
      `).bind(fileId).first()

      return result || null

    } catch (error) {
      console.error('Get file by ID error:', error)
      return null
    }
  }

  async getFileCategories(): Promise<any[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM file_categories WHERE is_active = TRUE ORDER BY category_name
      `).all()

      return result.results || []

    } catch (error) {
      console.error('Get file categories error:', error)
      return []
    }
  }

  async getUserFileQuota(userId: number): Promise<{
    totalQuota: number
    usedBytes: number
    fileCount: number
    availableBytes: number
    percentUsed: number
  }> {
    try {
      let quota = await this.db.prepare(`
        SELECT * FROM user_file_quotas WHERE user_id = ?
      `).bind(userId).first()

      if (!quota) {
        // Create default quota
        await this.db.prepare(`
          INSERT INTO user_file_quotas (user_id, total_quota_bytes, used_bytes, file_count)
          VALUES (?, 1073741824, 0, 0)
        `).bind(userId).run()

        quota = {
          total_quota_bytes: 1073741824, // 1GB
          used_bytes: 0,
          file_count: 0
        }
      }

      const availableBytes = Math.max(0, quota.total_quota_bytes - quota.used_bytes)
      const percentUsed = quota.total_quota_bytes > 0 
        ? (quota.used_bytes / quota.total_quota_bytes) * 100 
        : 0

      return {
        totalQuota: quota.total_quota_bytes,
        usedBytes: quota.used_bytes,
        fileCount: quota.file_count,
        availableBytes,
        percentUsed: Math.round(percentUsed * 100) / 100
      }

    } catch (error) {
      console.error('Get user quota error:', error)
      return {
        totalQuota: 1073741824,
        usedBytes: 0,
        fileCount: 0,
        availableBytes: 1073741824,
        percentUsed: 0
      }
    }
  }

  // ===============================
  // Helper Methods
  // ===============================

  private async getFileCategory(categoryId: number): Promise<any | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM file_categories WHERE id = ? AND is_active = TRUE
      `).bind(categoryId).first()

      return result || null
    } catch (error) {
      return null
    }
  }

  private async checkUserQuota(userId: number, fileSize: number): Promise<{
    allowed: boolean
    message?: string
  }> {
    try {
      const quota = await this.getUserFileQuota(userId)
      
      if (quota.availableBytes < fileSize) {
        return {
          allowed: false,
          message: `Insufficient storage space. Need ${this.formatBytes(fileSize)}, available ${this.formatBytes(quota.availableBytes)}`
        }
      }

      return { allowed: true }

    } catch (error) {
      return { allowed: false, message: 'Quota check failed' }
    }
  }

  private async checkFileAccess(
    fileId: number, 
    userId?: number, 
    accessType: string = 'view',
    shareToken?: string
  ): Promise<{ allowed: boolean; message?: string }> {
    try {
      const file = await this.getFileById(fileId)
      if (!file) {
        return { allowed: false, message: 'File not found' }
      }

      // Check via share token
      if (shareToken) {
        const share = await this.db.prepare(`
          SELECT * FROM file_shares 
          WHERE share_token = ? AND file_id = ? AND is_active = TRUE
          AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
          AND (max_downloads IS NULL OR download_count < max_downloads)
        `).bind(shareToken, fileId).first()

        if (share) {
          // Check access level
          const accessLevels = ['view', 'download', 'edit', 'delete']
          const requiredLevel = accessLevels.indexOf(accessType)
          const shareLevel = accessLevels.indexOf(share.access_level)
          
          if (shareLevel >= requiredLevel) {
            return { allowed: true }
          }
        }
      }

      // Check direct ownership
      if (userId) {
        if (file.user_id === userId) {
          return { allowed: true }
        }

        // Check public files for view access
        if (file.visibility === 'public' && accessType === 'view') {
          return { allowed: true }
        }
      }

      return { allowed: false, message: 'Access denied' }

    } catch (error) {
      return { allowed: false, message: 'Access check failed' }
    }
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  private generateUniqueFilename(extension: string): string {
    const uuid = crypto.randomUUID()
    return `${uuid}.${extension}`
  }

  private async calculateFileHash(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async extractFileMetadata(file: File, buffer: ArrayBuffer): Promise<FileMetadata> {
    const metadata: FileMetadata = {
      size: file.size,
      format: file.type
    }

    // For images, we could extract dimensions using Canvas API
    // This is a simplified version
    if (this.isImageFile(file.type)) {
      // In a real implementation, you'd use proper image processing
      metadata.width = 0
      metadata.height = 0
    }

    return metadata
  }

  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private async createFileRecord(userId: number, fileData: any): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO files (
        user_id, category_id, original_filename, stored_filename, file_extension,
        mime_type, file_size, file_hash, storage_provider, storage_path,
        visibility, description, alt_text, tags, metadata, expires_at, approval_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      fileData.categoryId,
      fileData.originalFilename,
      fileData.storedFilename,
      fileData.fileExtension,
      fileData.mimeType,
      fileData.fileSize,
      fileData.fileHash,
      'cloudflare_r2',
      fileData.storagePath,
      fileData.visibility,
      fileData.description,
      fileData.altText,
      fileData.tags,
      fileData.metadata,
      fileData.expiresAt,
      fileData.approvalStatus
    ).run()

    return result.meta.last_row_id as number
  }

  private async updateFileStatus(fileId: number, status: string): Promise<void> {
    await this.db.prepare(`
      UPDATE files SET upload_status = ? WHERE id = ?
    `).bind(status, fileId).run()
  }

  private async updateFileCdnUrl(fileId: number, cdnUrl: string): Promise<void> {
    await this.db.prepare(`
      UPDATE files SET cdn_url = ? WHERE id = ?
    `).bind(cdnUrl, fileId).run()
  }

  private async findFileByHash(userId: number, hash: string): Promise<any | null> {
    const result = await this.db.prepare(`
      SELECT * FROM files WHERE user_id = ? AND file_hash = ? AND upload_status = 'completed'
    `).bind(userId, hash).first()

    return result || null
  }

  private async scheduleProcessingJob(
    fileId: number, 
    jobType: string, 
    parameters?: any
  ): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO file_processing_jobs (file_id, job_type, job_parameters)
      VALUES (?, ?, ?)
    `).bind(fileId, jobType, JSON.stringify(parameters)).run()

    return result.meta.last_row_id as number
  }

  private async updateProcessingJobStatus(
    jobId: number, 
    status: string, 
    errorMessage?: string
  ): Promise<void> {
    await this.db.prepare(`
      UPDATE file_processing_jobs 
      SET job_status = ?, error_message = ?, 
          processing_completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE processing_completed_at END
      WHERE id = ?
    `).bind(status, errorMessage, status, jobId).run()
  }

  private async logFileAccess(
    fileId: number,
    userId?: number,
    accessType: string = 'view',
    result: string = 'success',
    shareToken?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO file_access_logs (
          file_id, user_id, access_type, ip_address, user_agent, 
          share_token, access_result
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(fileId, userId, accessType, ipAddress, userAgent, shareToken, result).run()
    } catch (error) {
      console.error('Failed to log file access:', error)
    }
  }

  private generateShareToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async incrementShareDownloadCount(shareToken: string): Promise<void> {
    await this.db.prepare(`
      UPDATE file_shares SET download_count = download_count + 1 WHERE share_token = ?
    `).bind(shareToken).run()
  }

  private getBaseUrl(): string {
    // This should be configured based on your environment
    return 'https://your-domain.com'
  }

  private async getFileVersions(fileId: number): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT * FROM file_versions WHERE parent_file_id = ?
    `).bind(fileId).all()

    return result.results || []
  }
}