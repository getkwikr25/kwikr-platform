import { D1Database } from '@cloudflare/workers-types'

export interface ImageProcessingOptions {
  resize?: {
    width?: number
    height?: number
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
    quality?: number
    format?: 'jpg' | 'png' | 'webp' | 'avif'
  }
  compress?: {
    quality?: number
    progressive?: boolean
    format?: 'jpg' | 'png' | 'webp' | 'avif'
  }
  watermark?: {
    text?: string
    imageUrl?: string
    position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center'
    opacity?: number
    fontSize?: number
    fontColor?: string
  }
  crop?: {
    x: number
    y: number
    width: number
    height: number
  }
  filters?: {
    brightness?: number // -100 to 100
    contrast?: number   // -100 to 100
    saturation?: number // -100 to 100
    blur?: number      // 0 to 100
    sharpen?: boolean
    grayscale?: boolean
    sepia?: boolean
    vintage?: boolean
  }
}

export interface ProcessingResult {
  success: boolean
  processedImageBuffer?: ArrayBuffer
  metadata?: {
    width: number
    height: number
    format: string
    size: number
    quality?: number
  }
  error?: string
}

export interface ThumbnailOptions {
  width: number
  height: number
  fit?: 'cover' | 'contain'
  quality?: number
  format?: 'jpg' | 'png' | 'webp'
}

export class ImageProcessingService {
  constructor(private db: D1Database, private r2?: R2Bucket) {}

  // ===============================
  // Core Image Processing Methods
  // ===============================

  async processImage(
    imageBuffer: ArrayBuffer, 
    options: ImageProcessingOptions
  ): Promise<ProcessingResult> {
    try {
      // For Cloudflare Workers, we'll use Cloudflare Images API or Canvas API
      // This is a simplified implementation - in production you'd use:
      // 1. Cloudflare Images API for server-side processing
      // 2. Canvas API for client-side processing
      // 3. External image processing services like ImageMagick or Sharp (via serverless functions)

      let processedBuffer = imageBuffer
      let metadata = await this.getImageMetadata(imageBuffer)

      // Resize operation
      if (options.resize) {
        const resizeResult = await this.resizeImage(processedBuffer, options.resize)
        if (resizeResult.success && resizeResult.processedImageBuffer) {
          processedBuffer = resizeResult.processedImageBuffer
          metadata = resizeResult.metadata || metadata
        }
      }

      // Compression
      if (options.compress) {
        const compressResult = await this.compressImage(processedBuffer, options.compress)
        if (compressResult.success && compressResult.processedImageBuffer) {
          processedBuffer = compressResult.processedImageBuffer
          metadata = compressResult.metadata || metadata
        }
      }

      // Watermark
      if (options.watermark) {
        const watermarkResult = await this.addWatermark(processedBuffer, options.watermark)
        if (watermarkResult.success && watermarkResult.processedImageBuffer) {
          processedBuffer = watermarkResult.processedImageBuffer
        }
      }

      // Filters
      if (options.filters) {
        const filterResult = await this.applyFilters(processedBuffer, options.filters)
        if (filterResult.success && filterResult.processedImageBuffer) {
          processedBuffer = filterResult.processedImageBuffer
        }
      }

      // Crop
      if (options.crop) {
        const cropResult = await this.cropImage(processedBuffer, options.crop)
        if (cropResult.success && cropResult.processedImageBuffer) {
          processedBuffer = cropResult.processedImageBuffer
          metadata = cropResult.metadata || metadata
        }
      }

      return {
        success: true,
        processedImageBuffer: processedBuffer,
        metadata
      }

    } catch (error) {
      console.error('Image processing error:', error)
      return {
        success: false,
        error: error.message || 'Image processing failed'
      }
    }
  }

  async generateThumbnails(
    imageBuffer: ArrayBuffer,
    sizes: ThumbnailOptions[] = [
      { width: 150, height: 150, fit: 'cover' },
      { width: 300, height: 300, fit: 'cover' },
      { width: 500, height: 500, fit: 'contain' }
    ]
  ): Promise<{ size: string; buffer: ArrayBuffer; metadata: any }[]> {
    try {
      const thumbnails = []

      for (const size of sizes) {
        const result = await this.resizeImage(imageBuffer, {
          width: size.width,
          height: size.height,
          fit: size.fit || 'cover',
          quality: size.quality || 85,
          format: size.format || 'jpg'
        })

        if (result.success && result.processedImageBuffer) {
          thumbnails.push({
            size: `${size.width}x${size.height}`,
            buffer: result.processedImageBuffer,
            metadata: result.metadata
          })
        }
      }

      return thumbnails

    } catch (error) {
      console.error('Thumbnail generation error:', error)
      return []
    }
  }

  // ===============================
  // Individual Processing Operations
  // ===============================

  private async resizeImage(
    imageBuffer: ArrayBuffer,
    options: NonNullable<ImageProcessingOptions['resize']>
  ): Promise<ProcessingResult> {
    try {
      // For Cloudflare Workers environment, we'll use Canvas API
      // In a full implementation, you'd use Cloudflare Images API or external service

      // This is a simplified canvas-based resize
      const canvas = new OffscreenCanvas(options.width || 800, options.height || 600)
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Cannot get canvas context')
      }

      // Create ImageBitmap from buffer
      const blob = new Blob([imageBuffer])
      const imageBitmap = await createImageBitmap(blob)

      // Calculate dimensions based on fit option
      const { drawWidth, drawHeight, offsetX, offsetY } = this.calculateResizeDimensions(
        imageBitmap.width,
        imageBitmap.height,
        options.width || 800,
        options.height || 600,
        options.fit || 'cover'
      )

      // Clear canvas and draw resized image
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(imageBitmap, offsetX, offsetY, drawWidth, drawHeight)

      // Convert back to buffer
      const resizedBlob = await canvas.convertToBlob({
        type: `image/${options.format || 'jpeg'}`,
        quality: (options.quality || 85) / 100
      })

      const resizedBuffer = await resizedBlob.arrayBuffer()

      return {
        success: true,
        processedImageBuffer: resizedBuffer,
        metadata: {
          width: options.width || 800,
          height: options.height || 600,
          format: options.format || 'jpeg',
          size: resizedBuffer.byteLength,
          quality: options.quality || 85
        }
      }

    } catch (error) {
      console.error('Resize error:', error)
      return {
        success: false,
        error: 'Resize operation failed'
      }
    }
  }

  private async compressImage(
    imageBuffer: ArrayBuffer,
    options: NonNullable<ImageProcessingOptions['compress']>
  ): Promise<ProcessingResult> {
    try {
      const canvas = new OffscreenCanvas(800, 600) // Will be adjusted based on actual image
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Cannot get canvas context')
      }

      const blob = new Blob([imageBuffer])
      const imageBitmap = await createImageBitmap(blob)

      // Adjust canvas size to match image
      canvas.width = imageBitmap.width
      canvas.height = imageBitmap.height

      ctx.drawImage(imageBitmap, 0, 0)

      // Convert with compression
      const compressedBlob = await canvas.convertToBlob({
        type: `image/${options.format || 'jpeg'}`,
        quality: (options.quality || 80) / 100
      })

      const compressedBuffer = await compressedBlob.arrayBuffer()

      return {
        success: true,
        processedImageBuffer: compressedBuffer,
        metadata: {
          width: imageBitmap.width,
          height: imageBitmap.height,
          format: options.format || 'jpeg',
          size: compressedBuffer.byteLength,
          quality: options.quality || 80
        }
      }

    } catch (error) {
      console.error('Compression error:', error)
      return {
        success: false,
        error: 'Compression operation failed'
      }
    }
  }

  private async addWatermark(
    imageBuffer: ArrayBuffer,
    options: NonNullable<ImageProcessingOptions['watermark']>
  ): Promise<ProcessingResult> {
    try {
      const canvas = new OffscreenCanvas(800, 600)
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Cannot get canvas context')
      }

      const blob = new Blob([imageBuffer])
      const imageBitmap = await createImageBitmap(blob)

      canvas.width = imageBitmap.width
      canvas.height = imageBitmap.height

      // Draw original image
      ctx.drawImage(imageBitmap, 0, 0)

      // Add text watermark
      if (options.text) {
        ctx.font = `${options.fontSize || 20}px Arial`
        ctx.fillStyle = options.fontColor || 'rgba(255, 255, 255, 0.7)'
        ctx.globalAlpha = options.opacity || 0.7

        const textMetrics = ctx.measureText(options.text)
        const textWidth = textMetrics.width
        const textHeight = options.fontSize || 20

        // Position watermark
        let x = 0, y = 0
        switch (options.position || 'bottomRight') {
          case 'topLeft':
            x = 10
            y = textHeight + 10
            break
          case 'topRight':
            x = canvas.width - textWidth - 10
            y = textHeight + 10
            break
          case 'bottomLeft':
            x = 10
            y = canvas.height - 10
            break
          case 'bottomRight':
            x = canvas.width - textWidth - 10
            y = canvas.height - 10
            break
          case 'center':
            x = (canvas.width - textWidth) / 2
            y = canvas.height / 2
            break
        }

        ctx.fillText(options.text, x, y)
        ctx.globalAlpha = 1
      }

      const watermarkedBlob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality: 0.9
      })

      const watermarkedBuffer = await watermarkedBlob.arrayBuffer()

      return {
        success: true,
        processedImageBuffer: watermarkedBuffer,
        metadata: {
          width: imageBitmap.width,
          height: imageBitmap.height,
          format: 'jpeg',
          size: watermarkedBuffer.byteLength
        }
      }

    } catch (error) {
      console.error('Watermark error:', error)
      return {
        success: false,
        error: 'Watermark operation failed'
      }
    }
  }

  private async applyFilters(
    imageBuffer: ArrayBuffer,
    options: NonNullable<ImageProcessingOptions['filters']>
  ): Promise<ProcessingResult> {
    try {
      const canvas = new OffscreenCanvas(800, 600)
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Cannot get canvas context')
      }

      const blob = new Blob([imageBuffer])
      const imageBitmap = await createImageBitmap(blob)

      canvas.width = imageBitmap.width
      canvas.height = imageBitmap.height

      ctx.drawImage(imageBitmap, 0, 0)

      // Apply CSS filters via canvas
      let filterString = ''

      if (options.brightness !== undefined) {
        filterString += `brightness(${100 + options.brightness}%) `
      }
      if (options.contrast !== undefined) {
        filterString += `contrast(${100 + options.contrast}%) `
      }
      if (options.saturation !== undefined) {
        filterString += `saturate(${100 + options.saturation}%) `
      }
      if (options.blur !== undefined) {
        filterString += `blur(${options.blur}px) `
      }
      if (options.grayscale) {
        filterString += `grayscale(100%) `
      }
      if (options.sepia) {
        filterString += `sepia(100%) `
      }

      if (filterString) {
        ctx.filter = filterString.trim()
        ctx.drawImage(imageBitmap, 0, 0)
      }

      const filteredBlob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality: 0.9
      })

      const filteredBuffer = await filteredBlob.arrayBuffer()

      return {
        success: true,
        processedImageBuffer: filteredBuffer,
        metadata: {
          width: imageBitmap.width,
          height: imageBitmap.height,
          format: 'jpeg',
          size: filteredBuffer.byteLength
        }
      }

    } catch (error) {
      console.error('Filter error:', error)
      return {
        success: false,
        error: 'Filter operation failed'
      }
    }
  }

  private async cropImage(
    imageBuffer: ArrayBuffer,
    options: NonNullable<ImageProcessingOptions['crop']>
  ): Promise<ProcessingResult> {
    try {
      const canvas = new OffscreenCanvas(options.width, options.height)
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Cannot get canvas context')
      }

      const blob = new Blob([imageBuffer])
      const imageBitmap = await createImageBitmap(blob)

      // Draw cropped portion
      ctx.drawImage(
        imageBitmap,
        options.x, options.y, options.width, options.height, // Source rectangle
        0, 0, options.width, options.height                   // Destination rectangle
      )

      const croppedBlob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality: 0.9
      })

      const croppedBuffer = await croppedBlob.arrayBuffer()

      return {
        success: true,
        processedImageBuffer: croppedBuffer,
        metadata: {
          width: options.width,
          height: options.height,
          format: 'jpeg',
          size: croppedBuffer.byteLength
        }
      }

    } catch (error) {
      console.error('Crop error:', error)
      return {
        success: false,
        error: 'Crop operation failed'
      }
    }
  }

  // ===============================
  // Utility Methods
  // ===============================

  private async getImageMetadata(imageBuffer: ArrayBuffer): Promise<{
    width: number
    height: number
    format: string
    size: number
  }> {
    try {
      const blob = new Blob([imageBuffer])
      const imageBitmap = await createImageBitmap(blob)

      return {
        width: imageBitmap.width,
        height: imageBitmap.height,
        format: 'unknown', // Would need additional logic to detect format
        size: imageBuffer.byteLength
      }

    } catch (error) {
      return {
        width: 0,
        height: 0,
        format: 'unknown',
        size: imageBuffer.byteLength
      }
    }
  }

  private calculateResizeDimensions(
    originalWidth: number,
    originalHeight: number,
    targetWidth: number,
    targetHeight: number,
    fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  ): { drawWidth: number; drawHeight: number; offsetX: number; offsetY: number } {
    
    const originalRatio = originalWidth / originalHeight
    const targetRatio = targetWidth / targetHeight

    let drawWidth = targetWidth
    let drawHeight = targetHeight
    let offsetX = 0
    let offsetY = 0

    switch (fit) {
      case 'cover':
        if (originalRatio > targetRatio) {
          drawWidth = targetHeight * originalRatio
          offsetX = (targetWidth - drawWidth) / 2
        } else {
          drawHeight = targetWidth / originalRatio
          offsetY = (targetHeight - drawHeight) / 2
        }
        break

      case 'contain':
        if (originalRatio > targetRatio) {
          drawHeight = targetWidth / originalRatio
          offsetY = (targetHeight - drawHeight) / 2
        } else {
          drawWidth = targetHeight * originalRatio
          offsetX = (targetWidth - drawWidth) / 2
        }
        break

      case 'fill':
        // Keep target dimensions (may distort image)
        break

      case 'inside':
        const insideScale = Math.min(targetWidth / originalWidth, targetHeight / originalHeight)
        drawWidth = originalWidth * insideScale
        drawHeight = originalHeight * insideScale
        offsetX = (targetWidth - drawWidth) / 2
        offsetY = (targetHeight - drawHeight) / 2
        break

      case 'outside':
        const outsideScale = Math.max(targetWidth / originalWidth, targetHeight / originalHeight)
        drawWidth = originalWidth * outsideScale
        drawHeight = originalHeight * outsideScale
        offsetX = (targetWidth - drawWidth) / 2
        offsetY = (targetHeight - drawHeight) / 2
        break
    }

    return { drawWidth, drawHeight, offsetX, offsetY }
  }

  // ===============================
  // Validation Methods
  // ===============================

  isValidImageFormat(mimeType: string): boolean {
    const supportedFormats = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/tiff'
    ]
    
    return supportedFormats.includes(mimeType.toLowerCase())
  }

  validateProcessingOptions(options: ImageProcessingOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate resize options
    if (options.resize) {
      if (options.resize.width && (options.resize.width < 1 || options.resize.width > 5000)) {
        errors.push('Resize width must be between 1 and 5000 pixels')
      }
      if (options.resize.height && (options.resize.height < 1 || options.resize.height > 5000)) {
        errors.push('Resize height must be between 1 and 5000 pixels')
      }
      if (options.resize.quality && (options.resize.quality < 1 || options.resize.quality > 100)) {
        errors.push('Quality must be between 1 and 100')
      }
    }

    // Validate compression options
    if (options.compress) {
      if (options.compress.quality && (options.compress.quality < 1 || options.compress.quality > 100)) {
        errors.push('Compression quality must be between 1 and 100')
      }
    }

    // Validate watermark options
    if (options.watermark) {
      if (options.watermark.opacity && (options.watermark.opacity < 0 || options.watermark.opacity > 1)) {
        errors.push('Watermark opacity must be between 0 and 1')
      }
      if (options.watermark.fontSize && (options.watermark.fontSize < 8 || options.watermark.fontSize > 100)) {
        errors.push('Watermark font size must be between 8 and 100')
      }
    }

    // Validate filter options
    if (options.filters) {
      const validateRange = (value: number | undefined, name: string, min: number, max: number) => {
        if (value !== undefined && (value < min || value > max)) {
          errors.push(`${name} must be between ${min} and ${max}`)
        }
      }

      validateRange(options.filters.brightness, 'Brightness', -100, 100)
      validateRange(options.filters.contrast, 'Contrast', -100, 100)
      validateRange(options.filters.saturation, 'Saturation', -100, 100)
      validateRange(options.filters.blur, 'Blur', 0, 100)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // ===============================
  // Format Conversion Methods
  // ===============================

  async convertFormat(
    imageBuffer: ArrayBuffer,
    targetFormat: 'jpg' | 'png' | 'webp' | 'avif',
    quality: number = 90
  ): Promise<ProcessingResult> {
    try {
      const canvas = new OffscreenCanvas(800, 600)
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Cannot get canvas context')
      }

      const blob = new Blob([imageBuffer])
      const imageBitmap = await createImageBitmap(blob)

      canvas.width = imageBitmap.width
      canvas.height = imageBitmap.height

      ctx.drawImage(imageBitmap, 0, 0)

      const mimeType = targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`
      
      const convertedBlob = await canvas.convertToBlob({
        type: mimeType,
        quality: quality / 100
      })

      const convertedBuffer = await convertedBlob.arrayBuffer()

      return {
        success: true,
        processedImageBuffer: convertedBuffer,
        metadata: {
          width: imageBitmap.width,
          height: imageBitmap.height,
          format: targetFormat,
          size: convertedBuffer.byteLength,
          quality
        }
      }

    } catch (error) {
      console.error('Format conversion error:', error)
      return {
        success: false,
        error: 'Format conversion failed'
      }
    }
  }

  // ===============================
  // Optimization Methods
  // ===============================

  async optimizeForWeb(
    imageBuffer: ArrayBuffer,
    maxWidth: number = 1920,
    quality: number = 85
  ): Promise<ProcessingResult> {
    try {
      // Get original dimensions
      const metadata = await this.getImageMetadata(imageBuffer)
      
      // Calculate new dimensions if needed
      let newWidth = metadata.width
      let newHeight = metadata.height
      
      if (metadata.width > maxWidth) {
        const ratio = maxWidth / metadata.width
        newWidth = maxWidth
        newHeight = Math.round(metadata.height * ratio)
      }

      // Process image with optimizations
      const result = await this.processImage(imageBuffer, {
        resize: {
          width: newWidth,
          height: newHeight,
          fit: 'inside',
          quality,
          format: 'jpg'
        },
        compress: {
          quality,
          progressive: true,
          format: 'jpg'
        }
      })

      return result

    } catch (error) {
      console.error('Web optimization error:', error)
      return {
        success: false,
        error: 'Web optimization failed'
      }
    }
  }
}