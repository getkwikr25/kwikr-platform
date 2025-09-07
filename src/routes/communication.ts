import { Hono } from 'hono'
import type { Context } from 'hono'

// Communication System - Complete implementation of all 6 features
// Features: Real-time Messaging, Message History, File Sharing, 
// Message Notifications, Message Status, Bulk Messaging

// Types for the communication system
interface Message {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  reply_to?: number
  created_at: string
  updated_at: string
  edited_at?: string
  is_deleted: boolean
}

interface Conversation {
  id: number
  title?: string
  type: 'direct' | 'group' | 'job_related'
  job_id?: number
  created_by: number
  created_at: string
  updated_at: string
  is_active: boolean
}

interface ConversationParticipant {
  id: number
  conversation_id: number
  user_id: number
  role: 'participant' | 'admin' | 'moderator'
  joined_at: string
  left_at?: string
  is_active: boolean
  notifications_enabled: boolean
}

interface MessageAttachment {
  id: number
  message_id: number
  filename: string
  original_filename: string
  file_type: string
  file_size: number
  file_url: string
  mime_type: string
  uploaded_at: string
}

interface BulkMessage {
  id: number
  sender_id: number
  title: string
  content: string
  message_type: string
  target_criteria: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  scheduled_at?: string
  sent_at?: string
  total_recipients: number
  successful_sends: number
  failed_sends: number
  created_at: string
  updated_at: string
}

const communicationRoutes = new Hono()

// ============================================================================
// FEATURE 1: REAL-TIME MESSAGING - Client-worker chat
// ============================================================================

// Chat interface page
communicationRoutes.get('/chat', async (c) => {
  try {
    // Get user session (mock for now)
    const currentUserId = 1 // In production, get from session/JWT
    const db = c.env.DB

    // Get user's active conversations
    const conversationsResult = await db.prepare(`
      SELECT DISTINCT c.*, 
             u.first_name, u.last_name, u.email, p.profile_image_url,
             COUNT(CASE WHEN ms.status != 'read' AND m.sender_id != ? THEN 1 END) as unread_count,
             m_last.content as last_message,
             m_last.created_at as last_message_time,
             m_last.message_type as last_message_type
      FROM chat_conversations c
      JOIN chat_participants cp ON c.id = cp.conversation_id
      LEFT JOIN chat_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id != ?
      LEFT JOIN users u ON cp2.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN chat_messages m ON c.id = m.conversation_id
      LEFT JOIN chat_message_status ms ON m.id = ms.message_id AND ms.user_id = ?
      LEFT JOIN (
        SELECT conversation_id, content, created_at, message_type,
               ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY created_at DESC) as rn
        FROM chat_messages WHERE is_deleted = 0
      ) m_last ON c.id = m_last.conversation_id AND m_last.rn = 1
      WHERE cp.user_id = ? AND cp.is_active = 1 AND c.is_active = 1
      GROUP BY c.id, u.first_name, u.last_name, u.email, p.profile_image_url
      ORDER BY m_last.created_at DESC
    `).bind(currentUserId, currentUserId, currentUserId, currentUserId).all()

    const conversations = conversationsResult.results || []

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Messages - Kwikr</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'kwikr-green': '#00C881'
                  }
                }
              }
            }
          </script>
          <style>
            .chat-container { height: calc(100vh - 120px); }
            .messages-container { height: calc(100% - 80px); }
            .message-bubble {
              max-width: 70%;
              word-wrap: break-word;
            }
            .message-input {
              resize: none;
              min-height: 44px;
              max-height: 120px;
            }
            .unread-indicator {
              animation: pulse 2s infinite;
            }
          </style>
      </head>
      <body class="bg-gray-100">
          <!-- Navigation -->
          <nav class="bg-white shadow-sm border-b border-gray-200">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center h-16">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green">
                              <i class="fas fa-bolt mr-2"></i>Kwikr
                          </a>
                          <span class="ml-4 text-xl text-gray-600">Messages</span>
                      </div>
                      <div class="flex items-center space-x-4">
                          <button onclick="startNewConversation()" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                              <i class="fas fa-plus mr-2"></i>New Chat
                          </button>
                          <a href="/dashboard" class="text-gray-700 hover:text-kwikr-green">
                              <i class="fas fa-dashboard mr-1"></i>Dashboard
                          </a>
                      </div>
                  </div>
              </div>
          </nav>

          <div class="chat-container flex">
              <!-- Conversations Sidebar -->
              <div class="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                  <!-- Sidebar Header -->
                  <div class="p-4 border-b border-gray-200">
                      <div class="flex items-center justify-between">
                          <h2 class="text-lg font-semibold text-gray-800">Conversations</h2>
                          <span class="text-sm text-gray-500">${conversations.length} active</span>
                      </div>
                      <!-- Search conversations -->
                      <div class="mt-3 relative">
                          <input type="text" placeholder="Search conversations..." 
                                 class="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green">
                          <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                      </div>
                  </div>

                  <!-- Conversations List -->
                  <div class="flex-1 overflow-y-auto">
                      ${conversations.length > 0 ? conversations.map((conv: any) => {
                        const displayName = conv.first_name && conv.last_name 
                          ? `${conv.first_name} ${conv.last_name}` 
                          : conv.email || 'Unknown User'
                        
                        const lastMessage = conv.last_message || 'No messages yet'
                        const unreadCount = conv.unread_count || 0
                        const lastMessageTime = conv.last_message_time 
                          ? new Date(conv.last_message_time).toLocaleString()
                          : ''

                        return `
                          <div class="conversation-item p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${unreadCount > 0 ? 'bg-blue-50' : ''}" 
                               onclick="openConversation(${conv.id}, '${displayName}')">
                              <div class="flex items-center">
                                  <!-- Profile Image -->
                                  <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                                      ${conv.profile_image_url ? 
                                        `<img src="${conv.profile_image_url}" alt="${displayName}" class="w-full h-full object-cover">` :
                                        `<span class="text-white font-bold">${displayName.charAt(0).toUpperCase()}</span>`
                                      }
                                  </div>
                                  
                                  <div class="ml-3 flex-1">
                                      <div class="flex items-center justify-between">
                                          <h3 class="font-medium text-gray-900">${displayName}</h3>
                                          <div class="flex items-center space-x-2">
                                              ${unreadCount > 0 ? `<span class="unread-indicator bg-kwikr-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">${unreadCount}</span>` : ''}
                                              <span class="text-xs text-gray-500">${lastMessageTime}</span>
                                          </div>
                                      </div>
                                      <p class="text-sm text-gray-600 truncate mt-1">
                                          ${conv.last_message_type === 'file' ? '📎 File attachment' : 
                                            conv.last_message_type === 'image' ? '🖼️ Image' : lastMessage}
                                      </p>
                                  </div>
                              </div>
                          </div>
                        `
                      }).join('') : `
                        <div class="p-8 text-center text-gray-500">
                            <i class="fas fa-comments text-4xl mb-4"></i>
                            <p>No conversations yet</p>
                            <p class="text-sm mt-2">Start messaging workers or clients!</p>
                        </div>
                      `}
                  </div>
              </div>

              <!-- Chat Area -->
              <div class="flex-1 flex flex-col">
                  <!-- Chat Header -->
                  <div id="chat-header" class="p-4 border-b border-gray-200 bg-white hidden">
                      <div class="flex items-center justify-between">
                          <div class="flex items-center">
                              <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                                  <span id="chat-avatar" class="text-white font-bold"></span>
                              </div>
                              <div>
                                  <h3 id="chat-name" class="font-semibold text-gray-900"></h3>
                                  <p class="text-sm text-gray-500">
                                      <span id="chat-status" class="text-green-500">● Online</span>
                                      <span class="ml-2">Last seen recently</span>
                                  </p>
                              </div>
                          </div>
                          <div class="flex items-center space-x-3">
                              <button onclick="toggleFileSharing()" class="text-gray-600 hover:text-kwikr-green" title="Share Files">
                                  <i class="fas fa-paperclip text-lg"></i>
                              </button>
                              <button onclick="showConversationInfo()" class="text-gray-600 hover:text-kwikr-green" title="Conversation Info">
                                  <i class="fas fa-info-circle text-lg"></i>
                              </button>
                          </div>
                      </div>
                  </div>

                  <!-- Messages Area -->
                  <div id="messages-container" class="messages-container overflow-y-auto p-4 bg-gray-50">
                      <!-- Default state -->
                      <div id="no-chat-selected" class="h-full flex items-center justify-center text-gray-500">
                          <div class="text-center">
                              <i class="fas fa-comments text-6xl mb-4"></i>
                              <h3 class="text-xl font-semibold mb-2">Welcome to Kwikr Messages</h3>
                              <p>Select a conversation to start messaging</p>
                              <button onclick="startNewConversation()" class="mt-4 bg-kwikr-green text-white px-6 py-2 rounded-lg hover:bg-green-600">
                                  <i class="fas fa-plus mr-2"></i>Start New Conversation
                              </button>
                          </div>
                      </div>
                      
                      <!-- Messages will be loaded here -->
                      <div id="messages-list" class="hidden space-y-4">
                          <!-- Messages populated by JavaScript -->
                      </div>
                  </div>

                  <!-- Message Input Area -->
                  <div id="message-input-area" class="p-4 bg-white border-t border-gray-200 hidden">
                      <div class="flex items-end space-x-3">
                          <!-- File Attachment Button -->
                          <button onclick="openFileDialog()" class="text-gray-600 hover:text-kwikr-green p-2">
                              <i class="fas fa-plus-circle text-xl"></i>
                          </button>
                          
                          <!-- Hidden file input -->
                          <input type="file" id="fileInput" class="hidden" multiple 
                                 accept="image/*,application/pdf,.doc,.docx,.txt" 
                                 onchange="handleFileSelect(event)">
                          
                          <!-- Message Input -->
                          <div class="flex-1 relative">
                              <textarea id="messageInput" 
                                        class="message-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green resize-none"
                                        placeholder="Type your message..." 
                                        onkeypress="handleKeyPress(event)"
                                        oninput="autoResize(this)"></textarea>
                              
                              <!-- Typing indicator -->
                              <div id="typing-indicator" class="absolute -top-8 left-0 text-sm text-gray-500 hidden">
                                  <i class="fas fa-circle text-xs animate-pulse mr-1"></i>
                                  Someone is typing...
                              </div>
                          </div>
                          
                          <!-- Send Button -->
                          <button onclick="sendMessage()" class="bg-kwikr-green text-white p-2 rounded-lg hover:bg-green-600">
                              <i class="fas fa-paper-plane"></i>
                          </button>
                      </div>
                      
                      <!-- File Preview Area -->
                      <div id="file-preview" class="mt-3 hidden">
                          <div class="bg-gray-100 rounded-lg p-3">
                              <div class="flex items-center justify-between mb-2">
                                  <span class="text-sm font-medium text-gray-700">Attachments:</span>
                                  <button onclick="clearFilePreview()" class="text-red-500 hover:text-red-700">
                                      <i class="fas fa-times"></i>
                                  </button>
                              </div>
                              <div id="file-list" class="space-y-2">
                                  <!-- File previews will be added here -->
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <script src="/static/communication.js"></script>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading chat interface:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load chat interface</p>
          <a href="/dashboard" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Return to Dashboard</a>
        </div>
      </div>
    `, 500)
  }
})

// API endpoint to get conversation messages
communicationRoutes.get('/api/conversations/:id/messages', async (c) => {
  try {
    const db = c.env.DB
    const conversationId = c.req.param('id')
    const currentUserId = 1 // Get from session in production
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = (page - 1) * limit

    // Get messages with sender information
    const messagesResult = await db.prepare(`
      SELECT m.*, u.first_name, u.last_name, u.email, p.profile_image_url,
             GROUP_CONCAT(ma.filename || '|' || ma.file_url || '|' || ma.file_type) as attachments
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN chat_attachments ma ON m.id = ma.message_id
      WHERE m.conversation_id = ? AND m.is_deleted = 0
      GROUP BY m.id
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(conversationId, limit, offset).all()

    const messages = (messagesResult.results || []).reverse() // Reverse to show oldest first

    // Mark messages as read for current user
    await db.prepare(`
      INSERT OR REPLACE INTO chat_message_status (message_id, user_id, status, timestamp)
      SELECT id, ?, 'read', CURRENT_TIMESTAMP
      FROM chat_messages 
      WHERE conversation_id = ? AND sender_id != ? AND is_deleted = 0
    `).bind(currentUserId, conversationId, currentUserId).run()

    return c.json({
      success: true,
      messages: messages.map((msg: any) => ({
        ...msg,
        attachments: msg.attachments ? msg.attachments.split(',').map((att: string) => {
          const [filename, file_url, file_type] = att.split('|')
          return { filename, file_url, file_type }
        }) : []
      })),
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch messages'
    }, 500)
  }
})

// API endpoint to send a message
communicationRoutes.post('/api/conversations/:id/messages', async (c) => {
  try {
    const db = c.env.DB
    const conversationId = c.req.param('id')
    const currentUserId = 1 // Get from session in production
    const { content, message_type = 'text', reply_to } = await c.req.json()

    // Insert the message
    const messageResult = await db.prepare(`
      INSERT INTO chat_messages (conversation_id, sender_id, content, message_type, reply_to)
      VALUES (?, ?, ?, ?, ?)
    `).bind(conversationId, currentUserId, content, message_type, reply_to || null).run()

    const messageId = messageResult.meta.last_row_id

    // Update conversation timestamp
    await db.prepare(`
      UPDATE chat_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(conversationId).run()

    // Get the complete message with sender info
    const newMessageResult = await db.prepare(`
      SELECT m.*, u.first_name, u.last_name, u.email, p.profile_image_url
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE m.id = ?
    `).bind(messageId).first()

    return c.json({
      success: true,
      message: newMessageResult
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return c.json({
      success: false,
      error: 'Failed to send message'
    }, 500)
  }
})

// ============================================================================
// FEATURE 2: MESSAGE HISTORY - Conversation archives
// ============================================================================

// Conversation history page
communicationRoutes.get('/history', async (c) => {
  try {
    const db = c.env.DB
    const currentUserId = 1 // Get from session in production
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const search = c.req.query('search') || ''
    const filter = c.req.query('filter') || 'all' // all, archived, active
    
    let whereClause = 'WHERE cp.user_id = ? AND c.is_active = 1'
    let params = [currentUserId]

    if (search) {
      whereClause += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR c.title LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (filter === 'archived') {
      whereClause += ' AND cp.is_active = 0'
    } else if (filter === 'active') {
      whereClause += ' AND cp.is_active = 1'
    }

    // Get conversation history with statistics
    const historyResult = await db.prepare(`
      SELECT c.*, u.first_name, u.last_name, u.email, p.profile_image_url,
             COUNT(m.id) as total_messages,
             COUNT(CASE WHEN m.sender_id = ? THEN 1 END) as sent_messages,
             COUNT(CASE WHEN m.sender_id != ? THEN 1 END) as received_messages,
             MAX(m.created_at) as last_activity,
             cp.is_active as participant_active,
             cp.joined_at, cp.left_at
      FROM chat_conversations c
      JOIN chat_participants cp ON c.id = cp.conversation_id
      LEFT JOIN chat_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id != ?
      LEFT JOIN users u ON cp2.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN chat_messages m ON c.id = m.conversation_id AND m.is_deleted = 0
      ${whereClause}
      GROUP BY c.id
      ORDER BY last_activity DESC
      LIMIT ? OFFSET ?
    `).bind(currentUserId, currentUserId, currentUserId, ...params, limit, (page - 1) * limit).all()

    const conversations = historyResult.results || []

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Message History - Kwikr</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'kwikr-green': '#00C881'
                  }
                }
              }
            }
          </script>
      </head>
      <body class="bg-gray-100">
          <!-- Navigation -->
          <nav class="bg-white shadow-sm border-b border-gray-200">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center h-16">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green">
                              <i class="fas fa-bolt mr-2"></i>Kwikr
                          </a>
                          <span class="ml-4 text-xl text-gray-600">Message History</span>
                      </div>
                      <div class="flex items-center space-x-4">
                          <a href="/communication/chat" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                              <i class="fas fa-comments mr-2"></i>Back to Chat
                          </a>
                      </div>
                  </div>
              </div>
          </nav>

          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <!-- Filters and Search -->
              <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                      <div class="flex items-center space-x-4">
                          <h1 class="text-2xl font-bold text-gray-900">Message History</h1>
                          <span class="bg-kwikr-green text-white px-3 py-1 rounded-full text-sm">${conversations.length} conversations</span>
                      </div>
                      
                      <div class="flex items-center space-x-4">
                          <!-- Search -->
                          <div class="relative">
                              <input type="text" id="searchInput" placeholder="Search conversations..." 
                                     value="${search}"
                                     class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green">
                              <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                          </div>
                          
                          <!-- Filter -->
                          <select id="filterSelect" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green">
                              <option value="all" ${filter === 'all' ? 'selected' : ''}>All Conversations</option>
                              <option value="active" ${filter === 'active' ? 'selected' : ''}>Active</option>
                              <option value="archived" ${filter === 'archived' ? 'selected' : ''}>Archived</option>
                          </select>
                          
                          <!-- Export -->
                          <button onclick="exportHistory()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                              <i class="fas fa-download mr-2"></i>Export
                          </button>
                      </div>
                  </div>
              </div>

              <!-- Conversation History -->
              <div class="bg-white rounded-lg shadow-sm">
                  <div class="p-6 border-b border-gray-200">
                      <h2 class="text-lg font-semibold text-gray-900">Conversation Archive</h2>
                  </div>
                  
                  <div class="divide-y divide-gray-200">
                      ${conversations.length > 0 ? conversations.map((conv: any) => {
                        const displayName = conv.first_name && conv.last_name 
                          ? `${conv.first_name} ${conv.last_name}` 
                          : conv.email || 'Unknown User'
                        
                        const lastActivity = conv.last_activity 
                          ? new Date(conv.last_activity).toLocaleDateString()
                          : 'No activity'
                        
                        const joinedDate = new Date(conv.joined_at).toLocaleDateString()
                        const isActive = conv.participant_active

                        return `
                          <div class="p-6 hover:bg-gray-50 ${!isActive ? 'opacity-60' : ''}">
                              <div class="flex items-center justify-between">
                                  <div class="flex items-center">
                                      <!-- Profile Image -->
                                      <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                                          ${conv.profile_image_url ? 
                                            `<img src="${conv.profile_image_url}" alt="${displayName}" class="w-full h-full object-cover">` :
                                            `<span class="text-white font-bold">${displayName.charAt(0).toUpperCase()}</span>`
                                          }
                                      </div>
                                      
                                      <div class="ml-4">
                                          <h3 class="text-lg font-medium text-gray-900 flex items-center">
                                              ${displayName}
                                              ${!isActive ? '<i class="fas fa-archive text-gray-500 ml-2" title="Archived"></i>' : ''}
                                          </h3>
                                          <p class="text-sm text-gray-500">
                                              ${conv.type === 'job_related' ? `Job-related conversation • ` : ''}
                                              Joined ${joinedDate}
                                          </p>
                                      </div>
                                  </div>
                                  
                                  <div class="flex items-center space-x-6">
                                      <!-- Statistics -->
                                      <div class="text-center">
                                          <div class="text-lg font-bold text-kwikr-green">${conv.total_messages || 0}</div>
                                          <div class="text-xs text-gray-500">Total Messages</div>
                                      </div>
                                      <div class="text-center">
                                          <div class="text-lg font-bold text-blue-600">${conv.sent_messages || 0}</div>
                                          <div class="text-xs text-gray-500">Sent</div>
                                      </div>
                                      <div class="text-center">
                                          <div class="text-lg font-bold text-green-600">${conv.received_messages || 0}</div>
                                          <div class="text-xs text-gray-500">Received</div>
                                      </div>
                                      <div class="text-center">
                                          <div class="text-sm text-gray-600">${lastActivity}</div>
                                          <div class="text-xs text-gray-500">Last Activity</div>
                                      </div>
                                      
                                      <!-- Actions -->
                                      <div class="flex items-center space-x-2">
                                          <button onclick="viewConversation(${conv.id})" class="text-blue-600 hover:text-blue-800">
                                              <i class="fas fa-eye" title="View Conversation"></i>
                                          </button>
                                          ${isActive ? 
                                            `<button onclick="archiveConversation(${conv.id})" class="text-orange-600 hover:text-orange-800">
                                              <i class="fas fa-archive" title="Archive"></i>
                                             </button>` :
                                            `<button onclick="unarchiveConversation(${conv.id})" class="text-green-600 hover:text-green-800">
                                              <i class="fas fa-undo" title="Unarchive"></i>
                                             </button>`
                                          }
                                          <button onclick="exportConversation(${conv.id})" class="text-gray-600 hover:text-gray-800">
                                              <i class="fas fa-download" title="Export"></i>
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                        `
                      }).join('') : `
                        <div class="p-12 text-center text-gray-500">
                            <i class="fas fa-history text-5xl mb-4"></i>
                            <h3 class="text-xl font-medium mb-2">No conversation history</h3>
                            <p>Your message history will appear here</p>
                        </div>
                      `}
                  </div>
                  
                  <!-- Pagination -->
                  ${conversations.length >= limit ? `
                    <div class="p-6 border-t border-gray-200">
                        <div class="flex items-center justify-between">
                            <button onclick="loadPage(${page - 1})" ${page <= 1 ? 'disabled class="opacity-50 cursor-not-allowed"' : ''} 
                                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                <i class="fas fa-chevron-left mr-2"></i>Previous
                            </button>
                            <span class="text-gray-600">Page ${page}</span>
                            <button onclick="loadPage(${page + 1})" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Next<i class="fas fa-chevron-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                  ` : ''}
              </div>
          </div>

          <script>
            // Search and filter functionality
            document.getElementById('searchInput').addEventListener('input', function() {
              const search = this.value;
              const filter = document.getElementById('filterSelect').value;
              const url = new URL(window.location);
              url.searchParams.set('search', search);
              url.searchParams.set('filter', filter);
              url.searchParams.set('page', '1');
              window.location.href = url.toString();
            });

            document.getElementById('filterSelect').addEventListener('change', function() {
              const filter = this.value;
              const search = document.getElementById('searchInput').value;
              const url = new URL(window.location);
              url.searchParams.set('filter', filter);
              url.searchParams.set('search', search);
              url.searchParams.set('page', '1');
              window.location.href = url.toString();
            });

            function loadPage(page) {
              const url = new URL(window.location);
              url.searchParams.set('page', page);
              window.location.href = url.toString();
            }

            function viewConversation(conversationId) {
              window.location.href = '/communication/chat?conversation=' + conversationId;
            }

            function archiveConversation(conversationId) {
              if (confirm('Are you sure you want to archive this conversation?')) {
                // API call to archive conversation
                fetch('/communication/api/conversations/' + conversationId + '/archive', {
                  method: 'POST'
                }).then(() => {
                  location.reload();
                });
              }
            }

            function unarchiveConversation(conversationId) {
              // API call to unarchive conversation
              fetch('/communication/api/conversations/' + conversationId + '/unarchive', {
                method: 'POST'
              }).then(() => {
                location.reload();
              });
            }

            function exportConversation(conversationId) {
              window.open('/communication/api/conversations/' + conversationId + '/export', '_blank');
            }

            function exportHistory() {
              window.open('/communication/api/history/export', '_blank');
            }
          </script>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading message history:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load message history</p>
          <a href="/communication/chat" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Back to Chat</a>
        </div>
      </div>
    `, 500)
  }
})

// API endpoint to archive/unarchive conversations
communicationRoutes.post('/api/conversations/:id/archive', async (c) => {
  try {
    const db = c.env.DB
    const conversationId = c.req.param('id')
    const currentUserId = 1 // Get from session in production

    await db.prepare(`
      UPDATE conversation_participants 
      SET is_active = 0, left_at = CURRENT_TIMESTAMP 
      WHERE conversation_id = ? AND user_id = ?
    `).bind(conversationId, currentUserId).run()

    return c.json({ success: true, message: 'Conversation archived' })
  } catch (error) {
    console.error('Error archiving conversation:', error)
    return c.json({ success: false, error: 'Failed to archive conversation' }, 500)
  }
})

communicationRoutes.post('/api/conversations/:id/unarchive', async (c) => {
  try {
    const db = c.env.DB
    const conversationId = c.req.param('id')
    const currentUserId = 1 // Get from session in production

    await db.prepare(`
      UPDATE conversation_participants 
      SET is_active = 1, left_at = NULL 
      WHERE conversation_id = ? AND user_id = ?
    `).bind(conversationId, currentUserId).run()

    return c.json({ success: true, message: 'Conversation unarchived' })
  } catch (error) {
    console.error('Error unarchiving conversation:', error)
    return c.json({ success: false, error: 'Failed to unarchive conversation' }, 500)
  }
})

// ============================================================================
// FEATURE 3: FILE SHARING - Share documents/images in messages  
// ============================================================================

// File upload endpoint
communicationRoutes.post('/api/upload', async (c) => {
  try {
    // In production, implement actual file upload to R2/storage
    // For now, simulate file upload
    const body = await c.req.formData()
    const file = body.get('file') as File
    const conversationId = body.get('conversation_id') as string

    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400)
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: false, error: 'File type not allowed' }, 400)
    }

    if (file.size > maxSize) {
      return c.json({ success: false, error: 'File too large (max 10MB)' }, 400)
    }

    // Simulate file storage (in production, upload to R2)
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const fileUrl = `/uploads/${filename}` // Mock URL
    const fileType = getFileTypeFromMime(file.type)

    // Save file attachment to database
    const db = c.env.DB
    const attachmentResult = await db.prepare(`
      INSERT INTO message_attachments (message_id, filename, original_filename, file_type, file_size, file_url, mime_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(0, filename, file.name, fileType, file.size, fileUrl, file.type).run() // message_id will be updated when message is created

    return c.json({
      success: true,
      file: {
        id: attachmentResult.meta.last_row_id,
        filename,
        original_filename: file.name,
        file_type: fileType,
        file_size: file.size,
        file_url: fileUrl,
        mime_type: file.type
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return c.json({ success: false, error: 'Upload failed' }, 500)
  }
})

function getFileTypeFromMime(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.includes('pdf')) return 'document'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document'
  if (mimeType.includes('text')) return 'text'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'file'
}

// ============================================================================
// FEATURE 4: MESSAGE NOTIFICATIONS - Email/push notifications
// ============================================================================

// Get user notification preferences
communicationRoutes.get('/api/preferences', async (c) => {
  try {
    const db = c.env.DB
    const currentUserId = 1 // Get from session in production

    const preferences = await db.prepare(`
      SELECT * FROM chat_notification_preferences 
      WHERE user_id = ? AND conversation_id IS NULL
    `).bind(currentUserId).first()

    return c.json({
      success: true,
      preferences: preferences || {
        email_notifications: true,
        push_notifications: true,
        sound_notifications: true,
        desktop_notifications: true,
        notification_schedule: 'always'
      }
    })
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return c.json({ success: false, error: 'Failed to fetch preferences' }, 500)
  }
})

// Update notification preferences
communicationRoutes.post('/api/preferences', async (c) => {
  try {
    const db = c.env.DB
    const currentUserId = 1 // Get from session in production
    const { email_notifications, push_notifications, sound_notifications, desktop_notifications, notification_schedule } = await c.req.json()

    await db.prepare(`
      INSERT OR REPLACE INTO chat_notification_preferences 
      (user_id, email_notifications, push_notifications, sound_notifications, desktop_notifications, notification_schedule)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(currentUserId, email_notifications, push_notifications, sound_notifications, desktop_notifications, notification_schedule).run()

    return c.json({ success: true, message: 'Preferences updated' })
  } catch (error) {
    console.error('Error updating preferences:', error)
    return c.json({ success: false, error: 'Failed to update preferences' }, 500)
  }
})

// Send email notification (mock implementation)
async function sendEmailNotification(recipientEmail: string, senderName: string, message: string) {
  // In production, integrate with email service (SendGrid, etc.)
  console.log(`Email notification to ${recipientEmail}: New message from ${senderName}: ${message}`)
  
  // Mock email sending
  return {
    success: true,
    messageId: `email_${Date.now()}`
  }
}

// ============================================================================
// FEATURE 5: MESSAGE STATUS - Read/unread indicators
// ============================================================================

// Mark messages as read
communicationRoutes.post('/api/conversations/:id/read', async (c) => {
  try {
    const db = c.env.DB
    const conversationId = c.req.param('id')
    const currentUserId = 1 // Get from session in production
    const { message_ids } = await c.req.json()

    if (message_ids && message_ids.length > 0) {
      // Mark specific messages as read
      const placeholders = message_ids.map(() => '?').join(',')
      await db.prepare(`
        INSERT OR REPLACE INTO chat_message_status (message_id, user_id, status, timestamp)
        SELECT id, ?, 'read', CURRENT_TIMESTAMP
        FROM chat_messages 
        WHERE id IN (${placeholders}) AND sender_id != ?
      `).bind(currentUserId, ...message_ids, currentUserId).run()
    } else {
      // Mark all messages in conversation as read
      await db.prepare(`
        INSERT OR REPLACE INTO chat_message_status (message_id, user_id, status, timestamp)
        SELECT id, ?, 'read', CURRENT_TIMESTAMP
        FROM chat_messages 
        WHERE conversation_id = ? AND sender_id != ?
      `).bind(currentUserId, conversationId, currentUserId).run()
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return c.json({ success: false, error: 'Failed to mark as read' }, 500)
  }
})

// Get message status for a conversation
communicationRoutes.get('/api/conversations/:id/status', async (c) => {
  try {
    const db = c.env.DB
    const conversationId = c.req.param('id')
    const currentUserId = 1 // Get from session in production

    const statusResult = await db.prepare(`
      SELECT m.id, m.sender_id, ms.status, ms.timestamp
      FROM chat_messages m
      LEFT JOIN chat_message_status ms ON m.id = ms.message_id AND ms.user_id = ?
      WHERE m.conversation_id = ? AND m.is_deleted = 0
      ORDER BY m.created_at DESC
    `).bind(currentUserId, conversationId).all()

    return c.json({
      success: true,
      status: statusResult.results || []
    })
  } catch (error) {
    console.error('Error fetching message status:', error)
    return c.json({ success: false, error: 'Failed to fetch status' }, 500)
  }
})

// Typing indicator endpoint
communicationRoutes.post('/api/conversations/:id/typing', async (c) => {
  try {
    const conversationId = c.req.param('id')
    const currentUserId = 1 // Get from session in production
    const { typing } = await c.req.json()

    // In production, implement real-time typing indicators using WebSockets
    console.log(`User ${currentUserId} ${typing ? 'started' : 'stopped'} typing in conversation ${conversationId}`)

    return c.json({ success: true })
  } catch (error) {
    console.error('Error updating typing status:', error)
    return c.json({ success: false, error: 'Failed to update typing status' }, 500)
  }
})

// ============================================================================
// FEATURE 6: BULK MESSAGING - Send to multiple workers
// ============================================================================

// Bulk messaging interface
communicationRoutes.get('/bulk', async (c) => {
  try {
    const db = c.env.DB
    const currentUserId = 1 // Get from session in production

    // Get user's bulk message campaigns
    const campaignsResult = await db.prepare(`
      SELECT * FROM chat_bulk_messages 
      WHERE sender_id = ? 
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(currentUserId).all()

    const campaigns = campaignsResult.results || []

    // Get available worker categories for targeting
    const categoriesResult = await db.prepare(`
      SELECT id, name, description FROM job_categories 
      WHERE is_active = 1 
      ORDER BY name
    `).all()

    const categories = categoriesResult.results || []

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bulk Messaging - Kwikr</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'kwikr-green': '#00C881'
                  }
                }
              }
            }
          </script>
      </head>
      <body class="bg-gray-100">
          <!-- Navigation -->
          <nav class="bg-white shadow-sm border-b border-gray-200">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center h-16">
                      <div class="flex items-center">
                          <a href="/" class="text-2xl font-bold text-kwikr-green">
                              <i class="fas fa-bolt mr-2"></i>Kwikr
                          </a>
                          <span class="ml-4 text-xl text-gray-600">Bulk Messaging</span>
                      </div>
                      <div class="flex items-center space-x-4">
                          <a href="/communication/chat" class="text-gray-700 hover:text-kwikr-green">
                              <i class="fas fa-comments mr-1"></i>Regular Chat
                          </a>
                          <button onclick="createNewCampaign()" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                              <i class="fas fa-plus mr-2"></i>New Campaign
                          </button>
                      </div>
                  </div>
              </div>
          </nav>

          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <!-- Campaign Statistics -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div class="bg-white rounded-lg shadow-sm p-6">
                      <div class="flex items-center">
                          <div class="flex-shrink-0">
                              <i class="fas fa-bullhorn text-2xl text-blue-600"></i>
                          </div>
                          <div class="ml-4">
                              <div class="text-2xl font-bold text-gray-900">${campaigns.length}</div>
                              <div class="text-gray-600">Total Campaigns</div>
                          </div>
                      </div>
                  </div>
                  
                  <div class="bg-white rounded-lg shadow-sm p-6">
                      <div class="flex items-center">
                          <div class="flex-shrink-0">
                              <i class="fas fa-paper-plane text-2xl text-green-600"></i>
                          </div>
                          <div class="ml-4">
                              <div class="text-2xl font-bold text-gray-900">${campaigns.filter((c: any) => c.status === 'sent').length}</div>
                              <div class="text-gray-600">Sent Campaigns</div>
                          </div>
                      </div>
                  </div>
                  
                  <div class="bg-white rounded-lg shadow-sm p-6">
                      <div class="flex items-center">
                          <div class="flex-shrink-0">
                              <i class="fas fa-users text-2xl text-kwikr-green"></i>
                          </div>
                          <div class="ml-4">
                              <div class="text-2xl font-bold text-gray-900">${campaigns.reduce((sum: number, c: any) => sum + (c.total_recipients || 0), 0)}</div>
                              <div class="text-gray-600">Total Recipients</div>
                          </div>
                      </div>
                  </div>
                  
                  <div class="bg-white rounded-lg shadow-sm p-6">
                      <div class="flex items-center">
                          <div class="flex-shrink-0">
                              <i class="fas fa-chart-line text-2xl text-purple-600"></i>
                          </div>
                          <div class="ml-4">
                              <div class="text-2xl font-bold text-gray-900">${Math.round(campaigns.reduce((sum: number, c: any) => sum + (c.successful_sends || 0), 0) / Math.max(campaigns.reduce((sum: number, c: any) => sum + (c.total_recipients || 0), 0), 1) * 100)}%</div>
                              <div class="text-gray-600">Success Rate</div>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Campaigns List -->
              <div class="bg-white rounded-lg shadow-sm">
                  <div class="p-6 border-b border-gray-200">
                      <div class="flex items-center justify-between">
                          <h2 class="text-lg font-semibold text-gray-900">Bulk Message Campaigns</h2>
                          <div class="flex items-center space-x-3">
                              <select class="px-3 py-2 border border-gray-300 rounded-lg">
                                  <option value="all">All Statuses</option>
                                  <option value="draft">Draft</option>
                                  <option value="scheduled">Scheduled</option>
                                  <option value="sending">Sending</option>
                                  <option value="sent">Sent</option>
                                  <option value="cancelled">Cancelled</option>
                              </select>
                          </div>
                      </div>
                  </div>

                  <div class="divide-y divide-gray-200">
                      ${campaigns.length > 0 ? campaigns.map((campaign: any) => {
                        const statusColors = {
                          'draft': 'bg-gray-100 text-gray-800',
                          'scheduled': 'bg-blue-100 text-blue-800',
                          'sending': 'bg-yellow-100 text-yellow-800',
                          'sent': 'bg-green-100 text-green-800',
                          'cancelled': 'bg-red-100 text-red-800'
                        }
                        
                        const statusColor = statusColors[campaign.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                        const createdDate = new Date(campaign.created_at).toLocaleDateString()
                        const sentDate = campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : 'Not sent'

                        return `
                          <div class="p-6 hover:bg-gray-50">
                              <div class="flex items-center justify-between">
                                  <div class="flex-1">
                                      <div class="flex items-center space-x-3 mb-2">
                                          <h3 class="text-lg font-medium text-gray-900">${campaign.title}</h3>
                                          <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColor}">
                                              ${campaign.status.toUpperCase()}
                                          </span>
                                      </div>
                                      <p class="text-gray-600 mb-3">${campaign.content.substring(0, 150)}${campaign.content.length > 150 ? '...' : ''}</p>
                                      <div class="flex items-center space-x-6 text-sm text-gray-500">
                                          <span><i class="fas fa-calendar mr-1"></i>Created: ${createdDate}</span>
                                          <span><i class="fas fa-users mr-1"></i>Recipients: ${campaign.total_recipients}</span>
                                          <span><i class="fas fa-check-circle mr-1"></i>Successful: ${campaign.successful_sends}</span>
                                          <span><i class="fas fa-times-circle mr-1"></i>Failed: ${campaign.failed_sends}</span>
                                          ${campaign.sent_at ? `<span><i class="fas fa-paper-plane mr-1"></i>Sent: ${sentDate}</span>` : ''}
                                      </div>
                                  </div>
                                  
                                  <div class="flex items-center space-x-2 ml-4">
                                      ${campaign.status === 'draft' ? `
                                          <button onclick="editCampaign(${campaign.id})" class="text-blue-600 hover:text-blue-800">
                                              <i class="fas fa-edit" title="Edit"></i>
                                          </button>
                                          <button onclick="sendCampaign(${campaign.id})" class="text-green-600 hover:text-green-800">
                                              <i class="fas fa-paper-plane" title="Send Now"></i>
                                          </button>
                                      ` : ''}
                                      <button onclick="viewCampaignDetails(${campaign.id})" class="text-gray-600 hover:text-gray-800">
                                          <i class="fas fa-eye" title="View Details"></i>
                                      </button>
                                      <button onclick="duplicateCampaign(${campaign.id})" class="text-purple-600 hover:text-purple-800">
                                          <i class="fas fa-copy" title="Duplicate"></i>
                                      </button>
                                      ${campaign.status === 'draft' || campaign.status === 'scheduled' ? `
                                          <button onclick="deleteCampaign(${campaign.id})" class="text-red-600 hover:text-red-800">
                                              <i class="fas fa-trash" title="Delete"></i>
                                          </button>
                                      ` : ''}
                                  </div>
                              </div>
                          </div>
                        `
                      }).join('') : `
                        <div class="p-12 text-center text-gray-500">
                            <i class="fas fa-bullhorn text-5xl mb-4"></i>
                            <h3 class="text-xl font-medium mb-2">No bulk campaigns yet</h3>
                            <p class="mb-4">Create your first bulk message campaign to reach multiple workers at once</p>
                            <button onclick="createNewCampaign()" class="bg-kwikr-green text-white px-6 py-2 rounded-lg hover:bg-green-600">
                                <i class="fas fa-plus mr-2"></i>Create First Campaign
                            </button>
                        </div>
                      `}
                  </div>
              </div>
          </div>

          <script>
            function createNewCampaign() {
              window.location.href = '/communication/bulk/create';
            }

            function editCampaign(campaignId) {
              window.location.href = '/communication/bulk/edit/' + campaignId;
            }

            function sendCampaign(campaignId) {
              if (confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
                fetch('/communication/api/bulk/send/' + campaignId, {
                  method: 'POST'
                }).then(response => response.json()).then(data => {
                  if (data.success) {
                    location.reload();
                  } else {
                    alert('Failed to send campaign: ' + data.error);
                  }
                });
              }
            }

            function viewCampaignDetails(campaignId) {
              window.location.href = '/communication/bulk/details/' + campaignId;
            }

            function duplicateCampaign(campaignId) {
              fetch('/communication/api/bulk/duplicate/' + campaignId, {
                method: 'POST'
              }).then(response => response.json()).then(data => {
                if (data.success) {
                  location.reload();
                }
              });
            }

            function deleteCampaign(campaignId) {
              if (confirm('Are you sure you want to delete this campaign?')) {
                fetch('/communication/api/bulk/delete/' + campaignId, {
                  method: 'DELETE'
                }).then(() => location.reload());
              }
            }
          </script>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading bulk messaging interface:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load bulk messaging interface</p>
          <a href="/communication/chat" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Back to Chat</a>
        </div>
      </div>
    `, 500)
  }
})

// Create new bulk message campaign
communicationRoutes.post('/api/bulk/create', async (c) => {
  try {
    const db = c.env.DB
    const currentUserId = 1 // Get from session in production
    const { title, content, target_criteria, scheduled_at } = await c.req.json()

    // Validate input
    if (!title || !content) {
      return c.json({ success: false, error: 'Title and content are required' }, 400)
    }

    // Create bulk message campaign
    const campaignResult = await db.prepare(`
      INSERT INTO chat_bulk_messages (sender_id, title, content, target_criteria, status, scheduled_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(currentUserId, title, content, JSON.stringify(target_criteria), scheduled_at ? 'scheduled' : 'draft', scheduled_at).run()

    const campaignId = campaignResult.meta.last_row_id

    // If not scheduled, calculate recipients immediately
    if (!scheduled_at) {
      const recipients = await calculateRecipients(db, target_criteria)
      
      // Update recipient count
      await db.prepare(`
        UPDATE chat_bulk_messages SET total_recipients = ? WHERE id = ?
      `).bind(recipients.length, campaignId).run()

      // Insert recipients
      for (const recipient of recipients) {
        await db.prepare(`
          INSERT INTO chat_bulk_message_recipients (bulk_message_id, user_id, status)
          VALUES (?, ?, 'pending')
        `).bind(campaignId, recipient.id).run()
      }
    }

    return c.json({
      success: true,
      campaign: {
        id: campaignId,
        title,
        content,
        target_criteria,
        status: scheduled_at ? 'scheduled' : 'draft'
      }
    })
  } catch (error) {
    console.error('Error creating bulk campaign:', error)
    return c.json({ success: false, error: 'Failed to create campaign' }, 500)
  }
})

// Send bulk message campaign
communicationRoutes.post('/api/bulk/send/:id', async (c) => {
  try {
    const db = c.env.DB
    const campaignId = c.req.param('id')
    const currentUserId = 1 // Get from session in production

    // Get campaign details
    const campaign = await db.prepare(`
      SELECT * FROM chat_bulk_messages WHERE id = ? AND sender_id = ?
    `).bind(campaignId, currentUserId).first() as BulkMessage

    if (!campaign) {
      return c.json({ success: false, error: 'Campaign not found' }, 404)
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return c.json({ success: false, error: 'Campaign cannot be sent' }, 400)
    }

    // Update status to sending
    await db.prepare(`
      UPDATE chat_bulk_messages SET status = 'sending', sent_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(campaignId).run()

    // Get recipients
    const recipientsResult = await db.prepare(`
      SELECT bmr.*, u.email, u.first_name, u.last_name
      FROM chat_bulk_message_recipients bmr
      JOIN users u ON bmr.user_id = u.id
      WHERE bmr.bulk_message_id = ? AND bmr.status = 'pending'
    `).bind(campaignId).all()

    const recipients = recipientsResult.results || []
    let successCount = 0
    let failCount = 0

    // Send messages to each recipient
    for (const recipient of recipients) {
      try {
        // Create individual conversation and message
        const conversationResult = await db.prepare(`
          INSERT INTO chat_conversations (type, created_by, title)
          VALUES ('direct', ?, ?)
        `).bind(currentUserId, `Bulk: ${campaign.title}`).run()

        const conversationId = conversationResult.meta.last_row_id

        // Add participants
        await db.prepare(`
          INSERT INTO chat_participants (conversation_id, user_id, role)
          VALUES (?, ?, 'participant'), (?, ?, 'participant')
        `).bind(conversationId, currentUserId, conversationId, recipient.user_id).run()

        // Send message
        await db.prepare(`
          INSERT INTO chat_messages (conversation_id, sender_id, content, message_type)
          VALUES (?, ?, ?, 'text')
        `).bind(conversationId, currentUserId, campaign.content).run()

        // Update recipient status
        await db.prepare(`
          UPDATE chat_bulk_message_recipients 
          SET status = 'sent', sent_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).bind(recipient.id).run()

        // Send email notification if enabled
        await sendEmailNotification(
          recipient.email,
          'Kwikr Platform',
          campaign.content
        )

        successCount++
      } catch (error) {
        console.error(`Error sending to recipient ${recipient.user_id}:`, error)
        
        // Update recipient status to failed
        await db.prepare(`
          UPDATE chat_bulk_message_recipients 
          SET status = 'failed', error_message = ? 
          WHERE id = ?
        `).bind(String(error), recipient.id).run()

        failCount++
      }
    }

    // Update campaign with final results
    await db.prepare(`
      UPDATE chat_bulk_messages 
      SET status = 'sent', successful_sends = ?, failed_sends = ? 
      WHERE id = ?
    `).bind(successCount, failCount, campaignId).run()

    return c.json({
      success: true,
      results: {
        total: recipients.length,
        successful: successCount,
        failed: failCount
      }
    })
  } catch (error) {
    console.error('Error sending bulk campaign:', error)
    return c.json({ success: false, error: 'Failed to send campaign' }, 500)
  }
})

// Helper function to calculate recipients based on criteria
async function calculateRecipients(db: any, criteria: any) {
  let query = `SELECT DISTINCT u.id, u.email, u.first_name, u.last_name FROM users u`
  let whereConditions = [`u.role = 'worker'`, `u.is_active = 1`]
  let params: any[] = []

  if (criteria.categories && criteria.categories.length > 0) {
    query += ` JOIN worker_services ws ON u.id = ws.user_id`
    whereConditions.push(`ws.service_category IN (${criteria.categories.map(() => '?').join(',')})`)
    params.push(...criteria.categories)
  }

  if (criteria.locations && criteria.locations.length > 0) {
    whereConditions.push(`u.province IN (${criteria.locations.map(() => '?').join(',')})`)
    params.push(...criteria.locations)
  }

  if (criteria.subscription_tiers && criteria.subscription_tiers.length > 0) {
    whereConditions.push(`u.subscription_tier IN (${criteria.subscription_tiers.map(() => '?').join(',')})`)
    params.push(...criteria.subscription_tiers)
  }

  if (criteria.verified_only) {
    whereConditions.push(`u.is_verified = 1`)
  }

  query += ` WHERE ${whereConditions.join(' AND ')}`
  
  if (criteria.limit) {
    query += ` LIMIT ?`
    params.push(criteria.limit)
  }

  const result = await db.prepare(query).bind(...params).all()
  return result.results || []
}

// ============================================================================
// ADDITIONAL API ENDPOINTS
// ============================================================================

// Create new conversation
communicationRoutes.post('/api/conversations/create', async (c) => {
  try {
    const db = c.env.DB
    const currentUserId = 1 // Get from session in production
    const { participant_id, type = 'direct', title, job_id } = await c.req.json()

    // Create conversation
    const conversationResult = await db.prepare(`
      INSERT INTO chat_conversations (type, created_by, title, job_id)
      VALUES (?, ?, ?, ?)
    `).bind(type, currentUserId, title, job_id).run()

    const conversationId = conversationResult.meta.last_row_id

    // Add participants
    await db.prepare(`
      INSERT INTO chat_participants (conversation_id, user_id, role)
      VALUES (?, ?, 'participant'), (?, ?, 'participant')
    `).bind(conversationId, currentUserId, conversationId, participant_id).run()

    return c.json({
      success: true,
      conversation: {
        id: conversationId,
        type,
        title,
        job_id,
        created_by: currentUserId
      }
    })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return c.json({ success: false, error: 'Failed to create conversation' }, 500)
  }
})

// Search users for new conversations
communicationRoutes.get('/api/users/search', async (c) => {
  try {
    const db = c.env.DB
    const query = c.req.query('q') || ''
    const currentUserId = 1 // Get from session in production

    if (query.length < 2) {
      return c.json({ success: true, users: [] })
    }

    const usersResult = await db.prepare(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.role, p.profile_image_url
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id != ? AND u.is_active = 1 
      AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)
      LIMIT 20
    `).bind(currentUserId, `%${query}%`, `%${query}%`, `%${query}%`).all()

    const users = (usersResult.results || []).map((user: any) => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role,
      profile_image_url: user.profile_image_url
    }))

    return c.json({ success: true, users })
  } catch (error) {
    console.error('Error searching users:', error)
    return c.json({ success: false, error: 'Search failed' }, 500)
  }
})

export { communicationRoutes }