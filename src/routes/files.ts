import { Hono } from 'hono'
import { FileManagementService } from '../services/FileManagementService'

type Bindings = {
  DB: D1Database
  R2?: R2Bucket
}

const files = new Hono<{ Bindings: Bindings }>()

// Initialize service
let fileService: FileManagementService

files.use('*', async (c, next) => {
  fileService = new FileManagementService(c.env.DB, c.env.R2)
  await next()
})

// ===============================
// File Upload & Management
// ===============================

// Upload a file
files.post('/upload', async (c) => {
  try {
    // In a real implementation, you'd get userId from authentication
    const userId = parseInt(c.req.header('X-User-ID') || '1')
    
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const categoryId = parseInt(formData.get('categoryId') as string || '1')
    const description = formData.get('description') as string || undefined
    const altText = formData.get('altText') as string || undefined
    const visibility = formData.get('visibility') as 'public' | 'private' | 'shared' || 'private'
    const generateThumbnail = formData.get('generateThumbnail') === 'true'
    const compress = formData.get('compress') === 'true'
    const watermark = formData.get('watermark') === 'true'

    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    const tags = formData.get('tags') as string
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : undefined

    const result = await fileService.uploadFile(userId, file, {
      categoryId,
      description,
      altText,
      tags: parsedTags,
      visibility,
      generateThumbnail,
      compress,
      watermark
    })

    if (result.error) {
      return c.json({ error: result.error }, 400)
    }

    return c.json({
      success: true,
      fileId: result.fileId,
      url: result.url,
      message: 'File uploaded successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Upload failed' }, 500)
  }
})

// Get user's files
files.get('/user/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const requestingUserId = parseInt(c.req.header('X-User-ID') || '0')

    // Check authorization - users can only see their own files (unless admin)
    if (userId !== requestingUserId) {
      return c.json({ error: 'Access denied' }, 403)
    }

    const categoryId = c.req.query('categoryId') ? parseInt(c.req.query('categoryId')) : undefined
    const uploadStatus = c.req.query('uploadStatus') || undefined
    const approvalStatus = c.req.query('approvalStatus') || undefined
    const visibility = c.req.query('visibility') || undefined
    const tags = c.req.query('tags') ? c.req.query('tags').split(',') : undefined
    const dateFrom = c.req.query('dateFrom') || undefined
    const dateTo = c.req.query('dateTo') || undefined
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')) : 50
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')) : 0
    const sortBy = c.req.query('sortBy') as 'created_at' | 'file_size' | 'filename' || 'created_at'
    const sortOrder = c.req.query('sortOrder') as 'asc' | 'desc' || 'desc'

    const files = await fileService.getUserFiles(userId, {
      categoryId,
      uploadStatus,
      approvalStatus,
      visibility,
      tags,
      dateFrom,
      dateTo,
      limit,
      offset,
      sortBy,
      sortOrder
    })

    return c.json({
      success: true,
      files,
      pagination: {
        limit,
        offset,
        count: files.length,
        hasMore: files.length === limit
      }
    })

  } catch (error) {
    console.error('Get user files error:', error)
    return c.json({ error: 'Failed to retrieve files' }, 500)
  }
})

// Get file details
files.get('/:fileId', async (c) => {
  try {
    const fileId = parseInt(c.req.param('fileId'))
    const userId = parseInt(c.req.header('X-User-ID') || '0')
    const shareToken = c.req.query('token') || undefined

    const file = await fileService.getFileById(fileId)
    if (!file) {
      return c.json({ error: 'File not found' }, 404)
    }

    // Check access permissions
    const accessCheck = await fileService['checkFileAccess'](fileId, userId, 'view', shareToken)
    if (!accessCheck.allowed) {
      return c.json({ error: 'Access denied' }, 403)
    }

    return c.json({
      success: true,
      file: {
        id: file.id,
        originalFilename: file.original_filename,
        fileSize: file.file_size,
        mimeType: file.mime_type,
        visibility: file.visibility,
        description: file.description,
        altText: file.alt_text,
        tags: file.tags ? JSON.parse(file.tags) : [],
        metadata: file.metadata ? JSON.parse(file.metadata) : {},
        uploadStatus: file.upload_status,
        approvalStatus: file.approval_status,
        cdnUrl: file.cdn_url,
        createdAt: file.created_at,
        category: {
          id: file.category_id,
          name: file.category_name
        }
      }
    })

  } catch (error) {
    console.error('Get file details error:', error)
    return c.json({ error: 'Failed to retrieve file details' }, 500)
  }
})

// Download file
files.get('/:fileId/download', async (c) => {
  try {
    const fileId = parseInt(c.req.param('fileId'))
    const userId = parseInt(c.req.header('X-User-ID') || '0') || undefined
    const shareToken = c.req.query('token') || undefined

    const result = await fileService.downloadFile(fileId, userId, shareToken)

    if (!result.success) {
      return c.json({ error: result.error }, result.error === 'File not found' ? 404 : 403)
    }

    // Return file with appropriate headers
    return new Response(result.file, {
      headers: {
        'Content-Type': result.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': result.file?.byteLength.toString() || '0'
      }
    })

  } catch (error) {
    console.error('Download file error:', error)
    return c.json({ error: 'Download failed' }, 500)
  }
})

// Update file metadata
files.patch('/:fileId', async (c) => {
  try {
    const fileId = parseInt(c.req.param('fileId'))
    const userId = parseInt(c.req.header('X-User-ID') || '0')
    
    const body = await c.req.json()
    const { description, altText, tags, visibility } = body

    // Check if user can edit this file
    const accessCheck = await fileService['checkFileAccess'](fileId, userId, 'edit')
    if (!accessCheck.allowed) {
      return c.json({ error: 'Access denied' }, 403)
    }

    // Update file metadata
    await fileService['db'].prepare(`
      UPDATE files 
      SET description = ?, alt_text = ?, tags = ?, visibility = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      description || null,
      altText || null,
      tags ? JSON.stringify(tags) : null,
      visibility || 'private',
      fileId
    ).run()

    return c.json({
      success: true,
      message: 'File updated successfully'
    })

  } catch (error) {
    console.error('Update file error:', error)
    return c.json({ error: 'Update failed' }, 500)
  }
})

// Delete file
files.delete('/:fileId', async (c) => {
  try {
    const fileId = parseInt(c.req.param('fileId'))
    const userId = parseInt(c.req.header('X-User-ID') || '0')

    const result = await fileService.deleteFile(fileId, userId)

    if (!result.success) {
      return c.json({ error: result.error }, 400)
    }

    return c.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Delete file error:', error)
    return c.json({ error: 'Deletion failed' }, 500)
  }
})

// ===============================
// File Processing
// ===============================

// Generate thumbnail
files.post('/:fileId/thumbnail', async (c) => {
  try {
    const fileId = parseInt(c.req.param('fileId'))
    const userId = parseInt(c.req.header('X-User-ID') || '0')
    const body = await c.req.json()
    const { width = 300, height = 300 } = body

    // Check access
    const accessCheck = await fileService['checkFileAccess'](fileId, userId, 'edit')
    if (!accessCheck.allowed) {
      return c.json({ error: 'Access denied' }, 403)
    }

    const result = await fileService.generateThumbnail(fileId, width, height)

    if (!result.success) {
      return c.json({ error: result.error }, 400)
    }

    return c.json({
      success: true,
      message: 'Thumbnail generation started',
      thumbnailFileId: result.thumbnailFileId
    })

  } catch (error) {
    console.error('Thumbnail generation error:', error)
    return c.json({ error: 'Thumbnail generation failed' }, 500)
  }
})

// Process image (resize, compress, watermark)
files.post('/:fileId/process', async (c) => {
  try {
    const fileId = parseInt(c.req.param('fileId'))
    const userId = parseInt(c.req.header('X-User-ID') || '0')
    const body = await c.req.json()

    // Check access
    const accessCheck = await fileService['checkFileAccess'](fileId, userId, 'edit')
    if (!accessCheck.allowed) {
      return c.json({ error: 'Access denied' }, 403)
    }

    const result = await fileService.processImage(fileId, body)

    if (!result.success) {
      return c.json({ error: result.error }, 400)
    }

    return c.json({
      success: true,
      message: 'Image processing started',
      resultFileId: result.resultFileId
    })

  } catch (error) {
    console.error('Image processing error:', error)
    return c.json({ error: 'Image processing failed' }, 500)
  }
})

// ===============================
// File Sharing
// ===============================

// Create file share
files.post('/:fileId/share', async (c) => {
  try {
    const fileId = parseInt(c.req.param('fileId'))
    const userId = parseInt(c.req.header('X-User-ID') || '0')
    const body = await c.req.json()

    const result = await fileService.createFileShare(fileId, userId, body)

    if (!result.success) {
      return c.json({ error: result.error }, 400)
    }

    return c.json({
      success: true,
      shareToken: result.shareToken,
      shareUrl: result.shareUrl,
      message: 'File share created successfully'
    })

  } catch (error) {
    console.error('Create file share error:', error)
    return c.json({ error: 'Share creation failed' }, 500)
  }
})

// Get shared file (public access)
files.get('/shared/:shareToken', async (c) => {
  try {
    const shareToken = c.req.param('shareToken')
    const password = c.req.query('password') || undefined

    // Get share details
    const share = await fileService['db'].prepare(`
      SELECT fs.*, f.id as file_id, f.original_filename, f.mime_type, f.file_size, f.description
      FROM file_shares fs
      JOIN files f ON fs.file_id = f.id
      WHERE fs.share_token = ? AND fs.is_active = TRUE
      AND (fs.expires_at IS NULL OR fs.expires_at > CURRENT_TIMESTAMP)
      AND (fs.max_downloads IS NULL OR fs.download_count < fs.max_downloads)
    `).bind(shareToken).first()

    if (!share) {
      return c.json({ error: 'Share not found or expired' }, 404)
    }

    // Check password if required
    if (share.password_protected) {
      if (!password) {
        return c.json({ 
          error: 'Password required',
          passwordRequired: true 
        }, 401)
      }

      const hashedPassword = await fileService['hashPassword'](password)
      if (hashedPassword !== share.password_hash) {
        return c.json({ error: 'Invalid password' }, 401)
      }
    }

    return c.json({
      success: true,
      share: {
        fileId: share.file_id,
        filename: share.original_filename,
        mimeType: share.mime_type,
        fileSize: share.file_size,
        description: share.description,
        accessLevel: share.access_level,
        downloadCount: share.download_count,
        maxDownloads: share.max_downloads,
        expiresAt: share.expires_at
      }
    })

  } catch (error) {
    console.error('Get shared file error:', error)
    return c.json({ error: 'Failed to access shared file' }, 500)
  }
})

// Download shared file
files.get('/shared/:shareToken/download', async (c) => {
  try {
    const shareToken = c.req.param('shareToken')
    const password = c.req.query('password') || undefined

    // Verify share and password (similar to above)
    const share = await fileService['db'].prepare(`
      SELECT fs.*, f.id as file_id
      FROM file_shares fs
      JOIN files f ON fs.file_id = f.id
      WHERE fs.share_token = ? AND fs.is_active = TRUE
      AND (fs.expires_at IS NULL OR fs.expires_at > CURRENT_TIMESTAMP)
      AND (fs.max_downloads IS NULL OR fs.download_count < fs.max_downloads)
    `).bind(shareToken).first()

    if (!share) {
      return c.json({ error: 'Share not found or expired' }, 404)
    }

    if (share.password_protected && password) {
      const hashedPassword = await fileService['hashPassword'](password)
      if (hashedPassword !== share.password_hash) {
        return c.json({ error: 'Invalid password' }, 401)
      }
    }

    // Check access level
    if (!['download', 'edit', 'delete'].includes(share.access_level)) {
      return c.json({ error: 'Download not permitted' }, 403)
    }

    const result = await fileService.downloadFile(share.file_id, undefined, shareToken)

    if (!result.success) {
      return c.json({ error: result.error }, 400)
    }

    return new Response(result.file, {
      headers: {
        'Content-Type': result.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': result.file?.byteLength.toString() || '0'
      }
    })

  } catch (error) {
    console.error('Download shared file error:', error)
    return c.json({ error: 'Download failed' }, 500)
  }
})

// Revoke file share
files.delete('/shares/:shareToken', async (c) => {
  try {
    const shareToken = c.req.param('shareToken')
    const userId = parseInt(c.req.header('X-User-ID') || '0')

    const result = await fileService.revokeFileShare(shareToken, userId)

    if (!result.success) {
      return c.json({ error: result.error }, 400)
    }

    return c.json({
      success: true,
      message: 'Share revoked successfully'
    })

  } catch (error) {
    console.error('Revoke share error:', error)
    return c.json({ error: 'Share revocation failed' }, 500)
  }
})

// ===============================
// Collections & Portfolios
// ===============================

// Create file collection
files.post('/collections', async (c) => {
  try {
    const userId = parseInt(c.req.header('X-User-ID') || '0')
    const body = await c.req.json()
    const { name, type, description, isPublic = false } = body

    if (!name || !type) {
      return c.json({ error: 'Name and type are required' }, 400)
    }

    const result = await fileService.createFileCollection(userId, name, type, description, isPublic)

    if (result.error) {
      return c.json({ error: result.error }, 400)
    }

    return c.json({
      success: true,
      collectionId: result.collectionId,
      message: 'Collection created successfully'
    })

  } catch (error) {
    console.error('Create collection error:', error)
    return c.json({ error: 'Collection creation failed' }, 500)
  }
})

// Get user's collections
files.get('/collections/user/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const requestingUserId = parseInt(c.req.header('X-User-ID') || '0')

    // Check authorization
    if (userId !== requestingUserId) {
      return c.json({ error: 'Access denied' }, 403)
    }

    const collections = await fileService['db'].prepare(`
      SELECT fc.*, 
             COUNT(fci.file_id) as file_count,
             f.original_filename as cover_filename,
             f.cdn_url as cover_url
      FROM file_collections fc
      LEFT JOIN file_collection_items fci ON fc.id = fci.collection_id
      LEFT JOIN files f ON fc.cover_file_id = f.id
      WHERE fc.user_id = ?
      GROUP BY fc.id
      ORDER BY fc.updated_at DESC
    `).bind(userId).all()

    return c.json({
      success: true,
      collections: collections.results || []
    })

  } catch (error) {
    console.error('Get collections error:', error)
    return c.json({ error: 'Failed to retrieve collections' }, 500)
  }
})

// Add file to collection
files.post('/collections/:collectionId/files', async (c) => {
  try {
    const collectionId = parseInt(c.req.param('collectionId'))
    const userId = parseInt(c.req.header('X-User-ID') || '0')
    const body = await c.req.json()
    const { fileId, caption, displayOrder = 0 } = body

    if (!fileId) {
      return c.json({ error: 'File ID is required' }, 400)
    }

    const result = await fileService.addFileToCollection(collectionId, fileId, userId, caption, displayOrder)

    if (!result.success) {
      return c.json({ error: result.error }, 400)
    }

    return c.json({
      success: true,
      message: 'File added to collection successfully'
    })

  } catch (error) {
    console.error('Add to collection error:', error)
    return c.json({ error: 'Failed to add file to collection' }, 500)
  }
})

// ===============================
// Utility Endpoints
// ===============================

// Get file categories
files.get('/categories', async (c) => {
  try {
    const categories = await fileService.getFileCategories()

    return c.json({
      success: true,
      categories
    })

  } catch (error) {
    console.error('Get categories error:', error)
    return c.json({ error: 'Failed to retrieve categories' }, 500)
  }
})

// Get user file quota
files.get('/quota/user/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const requestingUserId = parseInt(c.req.header('X-User-ID') || '0')

    // Check authorization
    if (userId !== requestingUserId) {
      return c.json({ error: 'Access denied' }, 403)
    }

    const quota = await fileService.getUserFileQuota(userId)

    return c.json({
      success: true,
      quota: {
        totalQuota: quota.totalQuota,
        usedBytes: quota.usedBytes,
        fileCount: quota.fileCount,
        availableBytes: quota.availableBytes,
        percentUsed: quota.percentUsed,
        totalQuotaFormatted: fileService['formatBytes'](quota.totalQuota),
        usedBytesFormatted: fileService['formatBytes'](quota.usedBytes),
        availableBytesFormatted: fileService['formatBytes'](quota.availableBytes)
      }
    })

  } catch (error) {
    console.error('Get quota error:', error)
    return c.json({ error: 'Failed to retrieve quota' }, 500)
  }
})

// Get file access logs (admin only)
files.get('/:fileId/logs', async (c) => {
  try {
    const fileId = parseInt(c.req.param('fileId'))
    const userId = parseInt(c.req.header('X-User-ID') || '0')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')

    // Check if user owns the file
    const accessCheck = await fileService['checkFileAccess'](fileId, userId, 'view')
    if (!accessCheck.allowed) {
      return c.json({ error: 'Access denied' }, 403)
    }

    const logs = await fileService['db'].prepare(`
      SELECT fal.*, u.first_name, u.last_name
      FROM file_access_logs fal
      LEFT JOIN users u ON fal.user_id = u.id
      WHERE fal.file_id = ?
      ORDER BY fal.accessed_at DESC
      LIMIT ? OFFSET ?
    `).bind(fileId, limit, offset).all()

    return c.json({
      success: true,
      logs: logs.results || [],
      pagination: {
        limit,
        offset,
        count: logs.results?.length || 0
      }
    })

  } catch (error) {
    console.error('Get access logs error:', error)
    return c.json({ error: 'Failed to retrieve access logs' }, 500)
  }
})

export default files