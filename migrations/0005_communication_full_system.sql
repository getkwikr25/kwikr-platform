-- Complete Communication System Tables

-- Chat notifications preferences
CREATE TABLE IF NOT EXISTS chat_notification_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  conversation_id INTEGER,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sound_notifications BOOLEAN DEFAULT TRUE,
  desktop_notifications BOOLEAN DEFAULT TRUE,
  notification_schedule TEXT DEFAULT 'always',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bulk messaging system
CREATE TABLE IF NOT EXISTS chat_bulk_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_criteria TEXT,
  status TEXT DEFAULT 'draft',
  total_recipients INTEGER DEFAULT 0,
  successful_sends INTEGER DEFAULT 0,
  failed_sends INTEGER DEFAULT 0,
  scheduled_at DATETIME,
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bulk message recipients tracking
CREATE TABLE IF NOT EXISTS chat_bulk_message_recipients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bulk_message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at DATETIME,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notification logs
CREATE TABLE IF NOT EXISTS chat_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  conversation_id INTEGER,
  message_id INTEGER,
  notification_type TEXT NOT NULL,
  title TEXT,
  content TEXT,
  status TEXT DEFAULT 'pending',
  sent_at DATETIME,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_conversation_id ON chat_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_status_message_id ON chat_message_status(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_status_user_id ON chat_message_status(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_message_id ON chat_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_notification_preferences_user_id ON chat_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_bulk_messages_sender_id ON chat_bulk_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_bulk_message_recipients_bulk_message_id ON chat_bulk_message_recipients(bulk_message_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_user_id ON chat_notifications(user_id);