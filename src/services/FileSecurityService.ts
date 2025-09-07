import { D1Database } from '@cloudflare/workers-types'

export interface SecurityScanResult {
  safe: boolean
  threats?: string[]
  scanEngine?: string
  scanTime?: number
  details?: {
    fileType: string
    fileSize: number
    hashSHA256: string
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    scanResults: {
      virusCheck: boolean
      malwareCheck: boolean
      suspiciousPatterns: string[]
      fileIntegrityCheck: boolean
    }
  }
}

export interface AccessControlRule {
  id?: number
  userId: number
  fileId: number
  accessType: 'read' | 'write' | 'delete' | 'share' | 'admin'
  permission: 'allow' | 'deny'
  condition?: string // JSON conditions
  expiresAt?: string
  createdAt?: string
}

export interface EncryptionOptions {
  algorithm: 'AES-256-GCM' | 'AES-192-GCM' | 'AES-128-GCM'
  keyDerivation: 'PBKDF2' | 'scrypt'
  saltSize: number
  iterations: number
}

export interface FileEncryption {
  encrypted: boolean
  algorithm?: string
  keyId?: string
  iv?: string
  salt?: string
  authTag?: string
}

export class FileSecurityService {
  private readonly SUSPICIOUS_PATTERNS = [
    // Executable patterns
    /\x4D\x5A/, // PE header (EXE/DLL)
    /\x7F\x45\x4C\x46/, // ELF header (Linux executables)
    /\xCA\xFE\xBA\xBE/, // Java class file
    
    // Script patterns
    /<script[^>]*>/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i, // Event handlers
    
    // Malicious file patterns
    /\x50\x4B\x03\x04.*\.exe$/i, // EXE in ZIP
    /autorun\.inf/i,
    /\.scr$/i, // Screensaver executable
    /\.pif$/i, // Program information file
    /\.cmd$/i, // Command file
    /\.bat$/i, // Batch file
    /\.vbs$/i, // VBScript
    /\.js$/i,  // JavaScript (in certain contexts)
    
    // Suspicious content patterns
    /eval\s*\(/i,
    /exec\s*\(/i,
    /system\s*\(/i,
    /shell_exec/i,
    /passthru/i,
    /base64_decode/i,
    /gzinflate/i,
    /str_rot13/i
  ]

  private readonly ALLOWED_FILE_TYPES = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    presentations: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    text: ['text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript'],
    archives: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/quicktime'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac']
  }

  private readonly BLOCKED_EXTENSIONS = [
    'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
    'app', 'deb', 'pkg', 'rpm', 'dmg', 'iso', 'msi', 'run',
    'action', 'apk', 'bin', 'command', 'csh', 'inf', 'ipa',
    'osx', 'out', 'prg', 'ps1', 'reg', 'service', 'sh', 'workflow'
  ]

  constructor(private db: D1Database) {}

  // ===============================
  // File Scanning & Validation
  // ===============================

  async scanFile(
    fileBuffer: ArrayBuffer,
    filename: string,
    mimeType: string
  ): Promise<SecurityScanResult> {
    try {
      const scanStartTime = Date.now()
      
      // Basic file validation
      const basicValidation = this.validateFileBasics(filename, mimeType, fileBuffer.byteLength)
      if (!basicValidation.safe) {
        return {
          safe: false,
          threats: basicValidation.threats,
          scanEngine: 'basic-validation',
          scanTime: Date.now() - scanStartTime
        }
      }

      // Calculate file hash
      const hashSHA256 = await this.calculateFileHash(fileBuffer)

      // Check against known threat database
      const threatCheck = await this.checkThreatDatabase(hashSHA256)
      if (!threatCheck.safe) {
        return {
          safe: false,
          threats: threatCheck.threats,
          scanEngine: 'threat-database',
          scanTime: Date.now() - scanStartTime,
          details: {
            fileType: mimeType,
            fileSize: fileBuffer.byteLength,
            hashSHA256,
            riskLevel: 'critical',
            scanResults: {
              virusCheck: false,
              malwareCheck: false,
              suspiciousPatterns: threatCheck.threats || [],
              fileIntegrityCheck: true
            }
          }
        }
      }

      // Content analysis
      const contentAnalysis = this.analyzeFileContent(fileBuffer, filename, mimeType)
      
      // Determine overall risk level
      const riskLevel = this.calculateRiskLevel(contentAnalysis, filename, mimeType)

      const scanTime = Date.now() - scanStartTime

      return {
        safe: contentAnalysis.suspiciousPatterns.length === 0 && riskLevel !== 'critical',
        threats: contentAnalysis.suspiciousPatterns.length > 0 ? contentAnalysis.suspiciousPatterns : undefined,
        scanEngine: 'comprehensive-scan',
        scanTime,
        details: {
          fileType: mimeType,
          fileSize: fileBuffer.byteLength,
          hashSHA256,
          riskLevel,
          scanResults: {
            virusCheck: contentAnalysis.suspiciousPatterns.length === 0,
            malwareCheck: !contentAnalysis.hasMaliciousPatterns,
            suspiciousPatterns: contentAnalysis.suspiciousPatterns,
            fileIntegrityCheck: contentAnalysis.integrityValid
          }
        }
      }

    } catch (error) {
      console.error('File scanning error:', error)
      return {
        safe: false,
        threats: ['Scan failed: ' + error.message],
        scanEngine: 'error',
        scanTime: 0
      }
    }
  }

  private validateFileBasics(
    filename: string,
    mimeType: string,
    fileSize: number
  ): { safe: boolean; threats?: string[] } {
    const threats: string[] = []

    // Check file extension
    const extension = filename.split('.').pop()?.toLowerCase()
    if (extension && this.BLOCKED_EXTENSIONS.includes(extension)) {
      threats.push(`Blocked file extension: .${extension}`)
    }

    // Check MIME type
    const isAllowedMimeType = Object.values(this.ALLOWED_FILE_TYPES)
      .flat()
      .includes(mimeType.toLowerCase())
    
    if (!isAllowedMimeType) {
      threats.push(`Potentially unsafe MIME type: ${mimeType}`)
    }

    // Check file size (max 100MB)
    const maxFileSize = 100 * 1024 * 1024
    if (fileSize > maxFileSize) {
      threats.push(`File too large: ${fileSize} bytes (max: ${maxFileSize})`)
    }

    // Check for double extensions
    if (filename.split('.').length > 2) {
      threats.push('Multiple file extensions detected (possible obfuscation)')
    }

    // Check for suspicious filenames
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(filename)) {
      threats.push('Reserved system filename detected')
    }

    return {
      safe: threats.length === 0,
      threats: threats.length > 0 ? threats : undefined
    }
  }

  private analyzeFileContent(
    fileBuffer: ArrayBuffer,
    filename: string,
    mimeType: string
  ): {
    suspiciousPatterns: string[]
    hasMaliciousPatterns: boolean
    integrityValid: boolean
  } {
    const suspiciousPatterns: string[] = []
    const uint8Array = new Uint8Array(fileBuffer)

    // Convert to string for pattern matching (first 4KB)
    const sampleSize = Math.min(4096, uint8Array.length)
    const textContent = new TextDecoder('utf-8', { fatal: false })
      .decode(uint8Array.slice(0, sampleSize))

    // Check for suspicious patterns
    this.SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
      if (pattern instanceof RegExp) {
        if (pattern.test(textContent)) {
          suspiciousPatterns.push(`Suspicious pattern ${index + 1} detected`)
        }
      } else {
        // Binary pattern matching
        if (this.searchBinaryPattern(uint8Array, pattern as any)) {
          suspiciousPatterns.push(`Binary pattern ${index + 1} detected`)
        }
      }
    })

    // Check file header integrity
    const integrityValid = this.validateFileHeader(uint8Array, mimeType)
    if (!integrityValid) {
      suspiciousPatterns.push('File header does not match MIME type')
    }

    // Check for embedded executables
    if (this.containsEmbeddedExecutable(uint8Array)) {
      suspiciousPatterns.push('Embedded executable detected')
    }

    // Check for suspicious metadata
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      suspiciousPatterns.push('Path traversal attempt in filename')
    }

    return {
      suspiciousPatterns,
      hasMaliciousPatterns: suspiciousPatterns.length > 0,
      integrityValid
    }
  }

  private validateFileHeader(uint8Array: Uint8Array, mimeType: string): boolean {
    if (uint8Array.length < 4) return false

    const header = uint8Array.slice(0, 16)
    const headerHex = Array.from(header).map(b => b.toString(16).padStart(2, '0')).join('')

    // Common file signatures
    const signatures: Record<string, string[]> = {
      'image/jpeg': ['ffd8ff'],
      'image/png': ['89504e47'],
      'image/gif': ['474946383761', '474946383961'],
      'image/webp': ['52494646'],
      'image/bmp': ['424d'],
      'application/pdf': ['255044462d'],
      'application/zip': ['504b0304', '504b0506', '504b0708'],
      'video/mp4': ['66747970'],
      'audio/mp3': ['494433', 'fffa', 'fffb'],
      'text/plain': [], // No signature required
    }

    const expectedSignatures = signatures[mimeType.toLowerCase()]
    if (!expectedSignatures || expectedSignatures.length === 0) {
      return true // No signature to validate
    }

    return expectedSignatures.some(sig => headerHex.startsWith(sig))
  }

  private containsEmbeddedExecutable(uint8Array: Uint8Array): boolean {
    // Look for PE header (Windows executable) within the file
    const peHeader = new Uint8Array([0x4D, 0x5A]) // "MZ"
    
    for (let i = 512; i < uint8Array.length - 2; i++) { // Skip first 512 bytes (normal headers)
      if (uint8Array[i] === peHeader[0] && uint8Array[i + 1] === peHeader[1]) {
        return true
      }
    }

    return false
  }

  private searchBinaryPattern(haystack: Uint8Array, needle: Uint8Array): boolean {
    for (let i = 0; i <= haystack.length - needle.length; i++) {
      let match = true
      for (let j = 0; j < needle.length; j++) {
        if (haystack[i + j] !== needle[j]) {
          match = false
          break
        }
      }
      if (match) return true
    }
    return false
  }

  private calculateRiskLevel(
    contentAnalysis: any,
    filename: string,
    mimeType: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0

    // Base risk by file type
    if (mimeType.startsWith('application/')) riskScore += 1
    if (mimeType.includes('script') || mimeType.includes('executable')) riskScore += 3

    // Risk by patterns found
    riskScore += contentAnalysis.suspiciousPatterns.length

    // Risk by file characteristics
    if (!contentAnalysis.integrityValid) riskScore += 2
    if (contentAnalysis.hasMaliciousPatterns) riskScore += 3

    // Filename risks
    const extension = filename.split('.').pop()?.toLowerCase()
    if (extension && this.BLOCKED_EXTENSIONS.includes(extension)) riskScore += 5

    if (riskScore >= 5) return 'critical'
    if (riskScore >= 3) return 'high'
    if (riskScore >= 1) return 'medium'
    return 'low'
  }

  private async calculateFileHash(fileBuffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async checkThreatDatabase(fileHash: string): Promise<{ safe: boolean; threats?: string[] }> {
    try {
      // Check against local threat database
      const threat = await this.db.prepare(`
        SELECT * FROM file_threat_database WHERE file_hash = ?
      `).bind(fileHash).first()

      if (threat) {
        return {
          safe: false,
          threats: [`Known threat: ${threat.threat_type} - ${threat.description}`]
        }
      }

      // In a real implementation, you might also check against external APIs
      // like VirusTotal, but that requires API keys and external requests

      return { safe: true }

    } catch (error) {
      console.error('Threat database check failed:', error)
      return { safe: true } // Fail open rather than blocking legitimate files
    }
  }

  // ===============================
  // Access Control System
  // ===============================

  async checkFileAccess(
    userId: number,
    fileId: number,
    accessType: 'read' | 'write' | 'delete' | 'share' | 'admin',
    context?: {
      ipAddress?: string
      userAgent?: string
      shareToken?: string
    }
  ): Promise<{ allowed: boolean; reason?: string; conditions?: any }> {
    try {
      // Check file ownership first
      const file = await this.db.prepare(`
        SELECT user_id, visibility, approval_status FROM files WHERE id = ?
      `).bind(fileId).first()

      if (!file) {
        return { allowed: false, reason: 'File not found' }
      }

      // Owner always has full access
      if (file.user_id === userId) {
        return { allowed: true }
      }

      // Check explicit access control rules
      const accessRule = await this.db.prepare(`
        SELECT * FROM file_access_rules 
        WHERE user_id = ? AND file_id = ? AND access_type = ? 
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        ORDER BY created_at DESC LIMIT 1
      `).bind(userId, fileId, accessType).first()

      if (accessRule) {
        if (accessRule.permission === 'deny') {
          return { allowed: false, reason: 'Access explicitly denied' }
        }
        
        // Check conditions if any
        if (accessRule.condition) {
          const conditions = JSON.parse(accessRule.condition)
          const conditionCheck = this.evaluateAccessConditions(conditions, context)
          if (!conditionCheck.passed) {
            return { allowed: false, reason: conditionCheck.reason }
          }
        }
        
        return { allowed: true, conditions: accessRule.condition }
      }

      // Check public file access for read operations
      if (accessType === 'read' && file.visibility === 'public') {
        return { allowed: true }
      }

      // Check share token access
      if (context?.shareToken) {
        const shareAccess = await this.checkShareTokenAccess(
          context.shareToken,
          fileId,
          accessType
        )
        return shareAccess
      }

      // Check role-based access
      const roleAccess = await this.checkRoleBasedAccess(userId, fileId, accessType)
      if (roleAccess.allowed) {
        return roleAccess
      }

      return { allowed: false, reason: 'No access permissions found' }

    } catch (error) {
      console.error('Access check error:', error)
      return { allowed: false, reason: 'Access check failed' }
    }
  }

  private async checkShareTokenAccess(
    shareToken: string,
    fileId: number,
    accessType: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const share = await this.db.prepare(`
        SELECT * FROM file_shares 
        WHERE share_token = ? AND file_id = ? AND is_active = TRUE
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        AND (max_downloads IS NULL OR download_count < max_downloads)
      `).bind(shareToken, fileId).first()

      if (!share) {
        return { allowed: false, reason: 'Invalid or expired share token' }
      }

      // Check access level permissions
      const accessLevels = ['view', 'download', 'edit', 'delete']
      const requiredLevel = accessLevels.indexOf(accessType)
      const shareLevel = accessLevels.indexOf(share.access_level)

      if (shareLevel >= requiredLevel) {
        return { allowed: true }
      }

      return { allowed: false, reason: 'Insufficient share permissions' }

    } catch (error) {
      console.error('Share token check error:', error)
      return { allowed: false, reason: 'Share token validation failed' }
    }
  }

  private async checkRoleBasedAccess(
    userId: number,
    fileId: number,
    accessType: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Get user role
      const user = await this.db.prepare(`
        SELECT role FROM users WHERE id = ?
      `).bind(userId).first()

      if (!user) {
        return { allowed: false, reason: 'User not found' }
      }

      // Admin users have full access
      if (user.role === 'admin') {
        return { allowed: true }
      }

      // Moderator users have read/write access
      if (user.role === 'moderator' && ['read', 'write'].includes(accessType)) {
        return { allowed: true }
      }

      return { allowed: false, reason: 'Insufficient role permissions' }

    } catch (error) {
      console.error('Role-based access check error:', error)
      return { allowed: false, reason: 'Role check failed' }
    }
  }

  private evaluateAccessConditions(
    conditions: any,
    context?: {
      ipAddress?: string
      userAgent?: string
      shareToken?: string
    }
  ): { passed: boolean; reason?: string } {
    try {
      // IP address restrictions
      if (conditions.allowedIPs && context?.ipAddress) {
        const allowedIPs = Array.isArray(conditions.allowedIPs) 
          ? conditions.allowedIPs 
          : [conditions.allowedIPs]
        
        if (!allowedIPs.includes(context.ipAddress)) {
          return { passed: false, reason: 'IP address not allowed' }
        }
      }

      // Time-based restrictions
      if (conditions.timeRestriction) {
        const now = new Date()
        const currentHour = now.getHours()
        
        if (conditions.timeRestriction.startHour && currentHour < conditions.timeRestriction.startHour) {
          return { passed: false, reason: 'Access not allowed at this time' }
        }
        
        if (conditions.timeRestriction.endHour && currentHour > conditions.timeRestriction.endHour) {
          return { passed: false, reason: 'Access not allowed at this time' }
        }
      }

      // Geographic restrictions (would require IP geolocation)
      if (conditions.geoRestriction) {
        // Implementation would depend on geolocation service
      }

      return { passed: true }

    } catch (error) {
      console.error('Condition evaluation error:', error)
      return { passed: false, reason: 'Condition evaluation failed' }
    }
  }

  // ===============================
  // File Encryption
  // ===============================

  async encryptFile(
    fileBuffer: ArrayBuffer,
    password: string,
    options: EncryptionOptions = {
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2',
      saltSize: 32,
      iterations: 100000
    }
  ): Promise<{
    success: boolean
    encryptedBuffer?: ArrayBuffer
    encryptionInfo?: FileEncryption
    error?: string
  }> {
    try {
      // Generate random salt
      const salt = crypto.getRandomValues(new Uint8Array(options.saltSize))
      
      // Derive key from password
      const keyMaterial = await this.deriveKeyFromPassword(password, salt, options)
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12)) // 96 bits for GCM
      
      // Encrypt the file
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        keyMaterial,
        fileBuffer
      )

      // Combine salt + iv + encrypted data
      const saltArray = Array.from(salt)
      const ivArray = Array.from(iv)
      const encryptedArray = Array.from(new Uint8Array(encryptedData))
      
      const combinedBuffer = new ArrayBuffer(
        salt.length + iv.length + encryptedData.byteLength
      )
      
      const combinedView = new Uint8Array(combinedBuffer)
      combinedView.set(salt, 0)
      combinedView.set(iv, salt.length)
      combinedView.set(new Uint8Array(encryptedData), salt.length + iv.length)

      const encryptionInfo: FileEncryption = {
        encrypted: true,
        algorithm: options.algorithm,
        keyId: await this.generateKeyId(keyMaterial),
        iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
        salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
      }

      return {
        success: true,
        encryptedBuffer: combinedBuffer,
        encryptionInfo
      }

    } catch (error) {
      console.error('File encryption error:', error)
      return {
        success: false,
        error: error.message || 'Encryption failed'
      }
    }
  }

  async decryptFile(
    encryptedBuffer: ArrayBuffer,
    password: string,
    encryptionInfo: FileEncryption
  ): Promise<{
    success: boolean
    decryptedBuffer?: ArrayBuffer
    error?: string
  }> {
    try {
      const encryptedView = new Uint8Array(encryptedBuffer)
      
      // Extract salt, IV, and encrypted data
      const saltSize = 32 // Assuming 32 bytes salt
      const ivSize = 12   // Assuming 12 bytes IV for GCM
      
      const salt = encryptedView.slice(0, saltSize)
      const iv = encryptedView.slice(saltSize, saltSize + ivSize)
      const encryptedData = encryptedView.slice(saltSize + ivSize)

      // Derive key from password using same parameters
      const keyMaterial = await this.deriveKeyFromPassword(password, salt, {
        algorithm: 'AES-256-GCM',
        keyDerivation: 'PBKDF2',
        saltSize: 32,
        iterations: 100000
      })

      // Decrypt the file
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        keyMaterial,
        encryptedData
      )

      return {
        success: true,
        decryptedBuffer: decryptedData
      }

    } catch (error) {
      console.error('File decryption error:', error)
      return {
        success: false,
        error: error.message || 'Decryption failed'
      }
    }
  }

  private async deriveKeyFromPassword(
    password: string,
    salt: Uint8Array,
    options: EncryptionOptions
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    )

    // Derive actual encryption key
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: options.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256 // 256 bits for AES-256
      },
      false,
      ['encrypt', 'decrypt']
    )

    return key
  }

  private async generateKeyId(key: CryptoKey): Promise<string> {
    // Export key to get a consistent identifier
    const exported = await crypto.subtle.exportKey('raw', key)
    const hash = await crypto.subtle.digest('SHA-256', exported)
    const hashArray = Array.from(new Uint8Array(hash))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
  }

  // ===============================
  // Audit Logging
  // ===============================

  async logSecurityEvent(
    event: {
      userId?: number
      fileId?: number
      eventType: 'scan' | 'access_denied' | 'access_granted' | 'encryption' | 'decryption' | 'threat_detected'
      severity: 'info' | 'warning' | 'error' | 'critical'
      description: string
      metadata?: any
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO file_security_logs (
          user_id, file_id, event_type, severity, description, 
          metadata, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        event.userId,
        event.fileId,
        event.eventType,
        event.severity,
        event.description,
        event.metadata ? JSON.stringify(event.metadata) : null,
        event.ipAddress,
        event.userAgent
      ).run()

    } catch (error) {
      console.error('Security event logging error:', error)
    }
  }

  async getSecurityEvents(
    filters: {
      userId?: number
      fileId?: number
      eventType?: string
      severity?: string
      dateFrom?: string
      dateTo?: string
      limit?: number
      offset?: number
    } = {}
  ): Promise<any[]> {
    try {
      let query = `
        SELECT fsl.*, u.first_name, u.last_name, f.original_filename
        FROM file_security_logs fsl
        LEFT JOIN users u ON fsl.user_id = u.id
        LEFT JOIN files f ON fsl.file_id = f.id
        WHERE 1=1
      `
      const params: any[] = []

      if (filters.userId) {
        query += ' AND fsl.user_id = ?'
        params.push(filters.userId)
      }

      if (filters.fileId) {
        query += ' AND fsl.file_id = ?'
        params.push(filters.fileId)
      }

      if (filters.eventType) {
        query += ' AND fsl.event_type = ?'
        params.push(filters.eventType)
      }

      if (filters.severity) {
        query += ' AND fsl.severity = ?'
        params.push(filters.severity)
      }

      if (filters.dateFrom) {
        query += ' AND fsl.created_at >= ?'
        params.push(filters.dateFrom)
      }

      if (filters.dateTo) {
        query += ' AND fsl.created_at <= ?'
        params.push(filters.dateTo)
      }

      query += ' ORDER BY fsl.created_at DESC'

      const limit = Math.min(filters.limit || 100, 1000)
      const offset = filters.offset || 0
      query += ' LIMIT ? OFFSET ?'
      params.push(limit, offset)

      const result = await this.db.prepare(query).bind(...params).all()
      return result.results || []

    } catch (error) {
      console.error('Get security events error:', error)
      return []
    }
  }

  // ===============================
  // Quarantine Management
  // ===============================

  async quarantineFile(
    fileId: number,
    reason: string,
    quarantinedBy: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Move file to quarantine status
      await this.db.prepare(`
        UPDATE files 
        SET upload_status = 'quarantined', 
            virus_scan_status = 'infected',
            virus_scan_result = ?
        WHERE id = ?
      `).bind(reason, fileId).run()

      // Log quarantine event
      await this.logSecurityEvent({
        userId: quarantinedBy,
        fileId,
        eventType: 'threat_detected',
        severity: 'critical',
        description: `File quarantined: ${reason}`
      })

      return { success: true }

    } catch (error) {
      console.error('Quarantine file error:', error)
      return { 
        success: false, 
        error: error.message || 'Quarantine operation failed' 
      }
    }
  }

  async releaseFromQuarantine(
    fileId: number,
    releasedBy: number,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Release file from quarantine
      await this.db.prepare(`
        UPDATE files 
        SET upload_status = 'completed', 
            virus_scan_status = 'clean',
            virus_scan_result = ?
        WHERE id = ?
      `).bind(reason, fileId).run()

      // Log release event
      await this.logSecurityEvent({
        userId: releasedBy,
        fileId,
        eventType: 'scan',
        severity: 'info',
        description: `File released from quarantine: ${reason}`
      })

      return { success: true }

    } catch (error) {
      console.error('Release from quarantine error:', error)
      return { 
        success: false, 
        error: error.message || 'Release operation failed' 
      }
    }
  }
}