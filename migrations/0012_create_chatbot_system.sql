-- Create chatbot system tables

-- Chatbot conversations table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  user_id INTEGER,
  user_question TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chatbot knowledge base
CREATE TABLE IF NOT EXISTS chatbot_knowledge (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  keywords TEXT NOT NULL, -- JSON array of keywords
  question_patterns TEXT NOT NULL, -- JSON array of question patterns
  response TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  priority INTEGER DEFAULT 1, -- Higher priority responses shown first
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add chatbot feature flag to feature_flags table if not exists
INSERT OR IGNORE INTO feature_flags (flag_key, name, description, default_value, is_active) 
VALUES ('chatbot_enabled', 'Chatbot Enabled', 'Enable/disable the customer support chatbot', 'true', 1);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_created ON chatbot_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_category ON chatbot_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_active ON chatbot_knowledge(is_active);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_priority ON chatbot_knowledge(priority);