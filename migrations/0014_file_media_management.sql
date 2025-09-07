-- Comprehensive File & Media Management System
-- Created: 2025-01-15
-- This migration creates the complete file management infrastructure

-- File Categories Table
CREATE TABLE IF NOT EXISTS file_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name TEXT NOT NULL UNIQUE,
  description TEXT,
  allowed_extensions TEXT NOT NULL, -- JSON array: ["jpg", "jpeg", "png", "pdf"]
  max_file_size INTEGER NOT NULL DEFAULT 10485760, -- 10MB in bytes
  requires_approval BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Files Table (Main file registry)
CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL UNIQUE, -- UUID-based filename
  file_extension TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_hash TEXT, -- For duplicate detection
  storage_provider TEXT NOT NULL DEFAULT 'cloudflare_r2', -- 'cloudflare_r2', 'local', etc.
  storage_path TEXT NOT NULL, -- Full path in storage
  storage_bucket TEXT, -- R2 bucket name
  cdn_url TEXT, -- Public CDN URL if available
  upload_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    upload_status IN ('pending', 'uploading', 'completed', 'failed', 'processing')
  ),
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    approval_status IN ('pending', 'approved', 'rejected', 'flagged')
  ),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (
    visibility IN ('public', 'private', 'shared')
  ),
  description TEXT,
  alt_text TEXT, -- For images
  tags TEXT, -- JSON array of tags
  metadata TEXT, -- JSON metadata (width, height, exif data, etc.)
  virus_scan_status TEXT DEFAULT 'pending' CHECK (
    virus_scan_status IN ('pending', 'clean', 'infected', 'failed')
  ),
  virus_scan_result TEXT, -- Scan details
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME, -- For temporary files
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES file_categories(id) ON DELETE RESTRICT
);

-- File Versions Table (For versioning and processing variants)
CREATE TABLE IF NOT EXISTS file_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_file_id INTEGER NOT NULL,
  version_type TEXT NOT NULL CHECK (
    version_type IN ('original', 'thumbnail', 'small', 'medium', 'large', 'compressed', 'watermarked')
  ),
  stored_filename TEXT NOT NULL UNIQUE,
  file_size INTEGER NOT NULL,
  dimensions TEXT, -- JSON: {"width": 800, "height": 600}
  storage_path TEXT NOT NULL,
  cdn_url TEXT,
  processing_status TEXT DEFAULT 'pending' CHECK (
    processing_status IN ('pending', 'processing', 'completed', 'failed')
  ),
  quality_settings TEXT, -- JSON processing parameters
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- File Shares Table (Access control and sharing)
CREATE TABLE IF NOT EXISTS file_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_id INTEGER NOT NULL,
  shared_by_user_id INTEGER NOT NULL,
  shared_with_user_id INTEGER, -- NULL for public shares
  share_token TEXT UNIQUE, -- For token-based access
  access_level TEXT NOT NULL DEFAULT 'view' CHECK (
    access_level IN ('view', 'download', 'edit', 'delete')
  ),
  is_public BOOLEAN DEFAULT FALSE,
  password_protected BOOLEAN DEFAULT FALSE,
  password_hash TEXT, -- For password-protected shares
  expires_at DATETIME,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER, -- NULL for unlimited
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- File Access Logs Table
CREATE TABLE IF NOT EXISTS file_access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_id INTEGER NOT NULL,
  user_id INTEGER, -- NULL for anonymous access
  access_type TEXT NOT NULL CHECK (
    access_type IN ('view', 'download', 'upload', 'edit', 'delete', 'share')
  ),
  ip_address TEXT,
  user_agent TEXT,
  share_token TEXT, -- If accessed via share
  access_result TEXT DEFAULT 'success' CHECK (
    access_result IN ('success', 'denied', 'error', 'not_found')
  ),
  error_message TEXT,
  accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- User File Quotas Table
CREATE TABLE IF NOT EXISTS user_file_quotas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  total_quota_bytes INTEGER NOT NULL DEFAULT 1073741824, -- 1GB default
  used_bytes INTEGER DEFAULT 0,
  file_count INTEGER DEFAULT 0,
  max_file_size INTEGER DEFAULT 10485760, -- 10MB default
  allowed_categories TEXT, -- JSON array of allowed category IDs
  quota_reset_date DATE,
  is_unlimited BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- File Processing Jobs Table
CREATE TABLE IF NOT EXISTS file_processing_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_id INTEGER NOT NULL,
  job_type TEXT NOT NULL CHECK (
    job_type IN ('resize', 'compress', 'watermark', 'convert', 'thumbnail', 'virus_scan')
  ),
  job_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    job_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')
  ),
  job_parameters TEXT, -- JSON parameters for the job
  processing_started_at DATETIME,
  processing_completed_at DATETIME,
  error_message TEXT,
  result_file_id INTEGER, -- References the output file
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  FOREIGN KEY (result_file_id) REFERENCES files(id) ON DELETE SET NULL
);

-- File Collections Table (Albums, portfolios, etc.)
CREATE TABLE IF NOT EXISTS file_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  collection_name TEXT NOT NULL,
  collection_type TEXT NOT NULL CHECK (
    collection_type IN ('portfolio', 'album', 'document_set', 'gallery', 'archive')
  ),
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  cover_file_id INTEGER, -- Featured image
  sort_order INTEGER DEFAULT 0,
  metadata TEXT, -- JSON metadata
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cover_file_id) REFERENCES files(id) ON DELETE SET NULL
);

-- File Collection Items Table (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS file_collection_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER NOT NULL,
  file_id INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  caption TEXT,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(collection_id, file_id),
  FOREIGN KEY (collection_id) REFERENCES file_collections(id) ON DELETE CASCADE,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- Insert default file categories
INSERT OR IGNORE INTO file_categories (category_name, description, allowed_extensions, max_file_size, requires_approval) VALUES
('profile_pictures', 'User profile avatars and photos', '["jpg", "jpeg", "png", "gif", "webp"]', 5242880, FALSE), -- 5MB
('documents', 'Licenses, certifications, insurance documents', '["pdf", "doc", "docx", "jpg", "jpeg", "png"]', 10485760, TRUE), -- 10MB, requires approval
('portfolio_images', 'Work samples and project galleries', '["jpg", "jpeg", "png", "gif", "webp"]', 10485760, FALSE), -- 10MB
('portfolio_documents', 'Project documentation and reports', '["pdf", "doc", "docx"]', 10485760, FALSE), -- 10MB
('compliance_docs', 'Legal and compliance documentation', '["pdf", "doc", "docx", "jpg", "jpeg", "png"]', 10485760, TRUE), -- 10MB, requires approval
('temp_uploads', 'Temporary file uploads', '["jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx"]', 52428800, FALSE); -- 50MB

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_category_id ON files(category_id);
CREATE INDEX IF NOT EXISTS idx_files_upload_status ON files(upload_status);
CREATE INDEX IF NOT EXISTS idx_files_approval_status ON files(approval_status);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
CREATE INDEX IF NOT EXISTS idx_files_file_hash ON files(file_hash);
CREATE INDEX IF NOT EXISTS idx_files_storage_path ON files(storage_path);

CREATE INDEX IF NOT EXISTS idx_file_versions_parent_file_id ON file_versions(parent_file_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_version_type ON file_versions(version_type);

CREATE INDEX IF NOT EXISTS idx_file_shares_file_id ON file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_share_token ON file_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_with_user_id ON file_shares(shared_with_user_id);

CREATE INDEX IF NOT EXISTS idx_file_access_logs_file_id ON file_access_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_file_access_logs_user_id ON file_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_file_access_logs_accessed_at ON file_access_logs(accessed_at);

CREATE INDEX IF NOT EXISTS idx_user_file_quotas_user_id ON user_file_quotas(user_id);

CREATE INDEX IF NOT EXISTS idx_file_processing_jobs_file_id ON file_processing_jobs(file_id);
CREATE INDEX IF NOT EXISTS idx_file_processing_jobs_job_status ON file_processing_jobs(job_status);

CREATE INDEX IF NOT EXISTS idx_file_collections_user_id ON file_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_file_collection_items_collection_id ON file_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_file_collection_items_file_id ON file_collection_items(file_id);

-- Triggers for automatic updates
CREATE TRIGGER IF NOT EXISTS update_files_timestamp 
AFTER UPDATE ON files
BEGIN
  UPDATE files SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_quota_on_file_insert
AFTER INSERT ON files
WHEN NEW.upload_status = 'completed'
BEGIN
  INSERT OR REPLACE INTO user_file_quotas (user_id, used_bytes, file_count, created_at, updated_at)
  VALUES (
    NEW.user_id,
    COALESCE((SELECT used_bytes FROM user_file_quotas WHERE user_id = NEW.user_id), 0) + NEW.file_size,
    COALESCE((SELECT file_count FROM user_file_quotas WHERE user_id = NEW.user_id), 0) + 1,
    COALESCE((SELECT created_at FROM user_file_quotas WHERE user_id = NEW.user_id), CURRENT_TIMESTAMP),
    CURRENT_TIMESTAMP
  );
END;

CREATE TRIGGER IF NOT EXISTS update_user_quota_on_file_delete
AFTER DELETE ON files
WHEN OLD.upload_status = 'completed'
BEGIN
  UPDATE user_file_quotas 
  SET used_bytes = used_bytes - OLD.file_size,
      file_count = file_count - 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE user_id = OLD.user_id;
END;

CREATE TRIGGER IF NOT EXISTS log_file_access_on_download
AFTER UPDATE ON file_shares
WHEN NEW.download_count > OLD.download_count
BEGIN
  INSERT INTO file_access_logs (file_id, access_type, share_token, accessed_at)
  VALUES (NEW.file_id, 'download', NEW.share_token, CURRENT_TIMESTAMP);
END;

-- Update file collections timestamp
CREATE TRIGGER IF NOT EXISTS update_file_collections_timestamp 
AFTER UPDATE ON file_collections
BEGIN
  UPDATE file_collections SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;