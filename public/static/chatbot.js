// Kwikr Chatbot - Floating Chat Widget
class KwikrChatbot {
  constructor() {
    this.sessionId = null
    this.isOpen = false
    this.isEnabled = false
    this.messages = []
    this.userId = this.getCurrentUserId()
    
    this.init()
  }

  // Initialize chatbot
  async init() {
    console.log('🤖 Kwikr Chatbot: Initializing...')
    try {
      // Check if chatbot is enabled
      console.log('🤖 Kwikr Chatbot: Checking status at /api/chatbot/status')
      const statusResponse = await fetch('/api/chatbot/status')
      const statusData = await statusResponse.json()
      console.log('🤖 Kwikr Chatbot: Status response:', statusData)
      
      if (statusData.enabled) {
        console.log('🤖 Kwikr Chatbot: Enabled! Creating UI...')
        this.isEnabled = true
        this.createChatbotUI()
        this.checkExistingSession()
        console.log('🤖 Kwikr Chatbot: UI created and session checked')
      } else {
        console.log('🤖 Kwikr Chatbot: Disabled by admin')
      }
    } catch (error) {
      console.error('🤖 Kwikr Chatbot: Initialization error:', error)
    }
  }

  // Get current user ID if logged in
  getCurrentUserId() {
    try {
      // Try to get user ID from cookie or local storage
      const cookies = document.cookie.split(';')
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'user_id') {
          return parseInt(value)
        }
      }
      return null
    } catch (error) {
      return null
    }
  }

  // Check for existing session
  checkExistingSession() {
    const savedSessionId = localStorage.getItem('kwikr_chat_session')
    if (savedSessionId) {
      this.sessionId = savedSessionId
      this.loadConversationHistory()
    }
  }

  // Create chatbot UI
  createChatbotUI() {
    console.log('🤖 Kwikr Chatbot: Creating UI elements...')
    // Create chatbot container
    const chatContainer = document.createElement('div')
    chatContainer.id = 'kwikr-chatbot'
    console.log('🤖 Kwikr Chatbot: Created chat container element')
    chatContainer.innerHTML = `
      <!-- Floating Chat Button -->
      <div id="kwikr-chat-button" class="kwikr-chat-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="kwikr-chat-badge" id="kwikr-chat-badge" style="display: none;">1</span>
      </div>

      <!-- Chat Window -->
      <div id="kwikr-chat-window" class="kwikr-chat-window" style="display: none;">
        <div class="kwikr-chat-header">
          <div class="kwikr-chat-header-content">
            <div class="kwikr-chat-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
              </svg>
            </div>
            <div class="kwikr-chat-title">
              <div class="kwikr-chat-name">Kwikr Assistant</div>
              <div class="kwikr-chat-status">Online • Usually replies instantly</div>
            </div>
          </div>
          <button id="kwikr-chat-close" class="kwikr-chat-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="kwikr-chat-messages" id="kwikr-chat-messages">
          <!-- Messages will be inserted here -->
        </div>
        
        <div class="kwikr-chat-input-container">
          <div class="kwikr-chat-input-wrapper">
            <input 
              type="text" 
              id="kwikr-chat-input" 
              placeholder="Type your message..." 
              autocomplete="off"
            />
            <button id="kwikr-chat-send" class="kwikr-chat-send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="kwikr-chat-powered">
            Powered by Kwikr AI Assistant
          </div>
        </div>
      </div>
    `

    // Add styles
    chatContainer.innerHTML += `
      <style>
        #kwikr-chatbot {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .kwikr-chat-button {
          width: 60px;
          height: 60px;
          background: #00C881;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 200, 129, 0.3);
          transition: all 0.3s ease;
          color: white;
          position: relative;
        }

        .kwikr-chat-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(0, 200, 129, 0.4);
        }

        .kwikr-chat-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4757;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
        }

        .kwikr-chat-window {
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: absolute;
          bottom: 80px;
          right: 0;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .kwikr-chat-header {
          background: #00C881;
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kwikr-chat-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .kwikr-chat-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kwikr-chat-title {
          display: flex;
          flex-direction: column;
        }

        .kwikr-chat-name {
          font-weight: 600;
          font-size: 14px;
        }

        .kwikr-chat-status {
          font-size: 12px;
          opacity: 0.8;
        }

        .kwikr-chat-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .kwikr-chat-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .kwikr-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scroll-behavior: smooth;
        }

        .kwikr-message {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .kwikr-message.user {
          flex-direction: row-reverse;
        }

        .kwikr-message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
        }

        .kwikr-message.bot .kwikr-message-content {
          background: #f1f3f4;
          color: #333;
          border-bottom-left-radius: 6px;
        }

        .kwikr-message.user .kwikr-message-content {
          background: #00C881;
          color: white;
          border-bottom-right-radius: 6px;
        }

        .kwikr-message-time {
          font-size: 11px;
          color: #999;
          margin-top: 4px;
        }

        .kwikr-chat-input-container {
          border-top: 1px solid #e5e5e5;
          padding: 16px;
        }

        .kwikr-chat-input-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8f9fa;
          border-radius: 20px;
          padding: 8px 16px;
        }

        #kwikr-chat-input {
          flex: 1;
          border: none;
          background: none;
          outline: none;
          font-size: 14px;
          padding: 8px 0;
        }

        .kwikr-chat-send {
          background: #00C881;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: background-color 0.2s;
        }

        .kwikr-chat-send:hover {
          background: #00a86b;
        }

        .kwikr-chat-send:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .kwikr-chat-powered {
          text-align: center;
          font-size: 11px;
          color: #999;
          margin-top: 8px;
        }

        .kwikr-typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
          background: #f1f3f4;
          border-radius: 18px;
          border-bottom-left-radius: 6px;
          max-width: 80%;
        }

        .kwikr-typing-dots {
          display: flex;
          gap: 2px;
        }

        .kwikr-typing-dot {
          width: 6px;
          height: 6px;
          background: #999;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .kwikr-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .kwikr-typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }

        @media (max-width: 480px) {
          #kwikr-chatbot {
            bottom: 10px;
            right: 10px;
          }
          
          .kwikr-chat-window {
            width: calc(100vw - 20px);
            height: calc(100vh - 100px);
            bottom: 70px;
            right: -10px;
          }
        }
      </style>
    `

    console.log('🤖 Kwikr Chatbot: Appending chat container to body...')
    document.body.appendChild(chatContainer)
    console.log('🤖 Kwikr Chatbot: Chat container appended! Attaching event listeners...')
    this.attachEventListeners()
    console.log('🤖 Kwikr Chatbot: Event listeners attached. Chatbot should be visible!')
  }

  // Attach event listeners
  attachEventListeners() {
    const chatButton = document.getElementById('kwikr-chat-button')
    const chatClose = document.getElementById('kwikr-chat-close')
    const chatInput = document.getElementById('kwikr-chat-input')
    const chatSend = document.getElementById('kwikr-chat-send')

    chatButton?.addEventListener('click', () => this.toggleChat())
    chatClose?.addEventListener('click', () => this.closeChat())
    chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage()
    })
    chatSend?.addEventListener('click', () => this.sendMessage())
  }

  // Toggle chat window
  async toggleChat() {
    const chatWindow = document.getElementById('kwikr-chat-window')
    const chatBadge = document.getElementById('kwikr-chat-badge')
    
    if (!this.isOpen) {
      chatWindow.style.display = 'flex'
      this.isOpen = true
      chatBadge.style.display = 'none'
      
      // Start session if not exists
      if (!this.sessionId) {
        await this.startSession()
      }
      
      // Focus input
      document.getElementById('kwikr-chat-input')?.focus()
    } else {
      this.closeChat()
    }
  }

  // Close chat window
  closeChat() {
    const chatWindow = document.getElementById('kwikr-chat-window')
    chatWindow.style.display = 'none'
    this.isOpen = false
  }

  // Start new chat session
  async startSession() {
    try {
      const response = await fetch('/api/chatbot/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (data.sessionId) {
        this.sessionId = data.sessionId
        localStorage.setItem('kwikr_chat_session', this.sessionId)
        
        // Add welcome message
        this.addMessage('bot', data.message)
      }
    } catch (error) {
      console.error('Error starting chat session:', error)
      this.addMessage('bot', "Sorry, I'm having trouble connecting. Please try again later.")
    }
  }

  // Send message
  async sendMessage() {
    const input = document.getElementById('kwikr-chat-input')
    const message = input.value.trim()
    
    if (!message || !this.sessionId) return

    // Clear input and add user message
    input.value = ''
    this.addMessage('user', message)
    
    // Show typing indicator
    this.showTypingIndicator()

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          message: message,
          userId: this.userId
        })
      })

      const data = await response.json()
      
      if (data.response) {
        // Remove typing indicator and add bot response
        this.hideTypingIndicator()
        setTimeout(() => {
          this.addMessage('bot', data.response)
        }, 500)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      this.hideTypingIndicator()
      this.addMessage('bot', "Sorry, I couldn't process your message. Please try again.")
    }
  }

  // Add message to chat
  addMessage(sender, content) {
    const messagesContainer = document.getElementById('kwikr-chat-messages')
    const messageElement = document.createElement('div')
    messageElement.className = `kwikr-message ${sender}`
    
    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    messageElement.innerHTML = `
      <div class="kwikr-message-content">
        ${content}
        <div class="kwikr-message-time">${timeString}</div>
      </div>
    `
    
    messagesContainer.appendChild(messageElement)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
    
    // Store message
    this.messages.push({ sender, content, time: now.toISOString() })
  }

  // Show typing indicator
  showTypingIndicator() {
    const messagesContainer = document.getElementById('kwikr-chat-messages')
    const typingElement = document.createElement('div')
    typingElement.className = 'kwikr-message bot'
    typingElement.id = 'kwikr-typing'
    
    typingElement.innerHTML = `
      <div class="kwikr-typing-indicator">
        <div class="kwikr-typing-dots">
          <div class="kwikr-typing-dot"></div>
          <div class="kwikr-typing-dot"></div>
          <div class="kwikr-typing-dot"></div>
        </div>
      </div>
    `
    
    messagesContainer.appendChild(typingElement)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  // Hide typing indicator
  hideTypingIndicator() {
    const typingElement = document.getElementById('kwikr-typing')
    if (typingElement) {
      typingElement.remove()
    }
  }

  // Load conversation history
  async loadConversationHistory() {
    try {
      const response = await fetch(`/api/chatbot/history/${this.sessionId}`)
      const data = await response.json()
      
      if (data.history && data.history.length > 0) {
        data.history.forEach(msg => {
          this.addMessage('user', msg.user_question)
          this.addMessage('bot', msg.bot_response)
        })
      } else {
        // Add welcome message for new session
        this.addMessage('bot', "Hi! I'm the Kwikr assistant. How can I help you today? 😊")
      }
    } catch (error) {
      console.error('Error loading conversation history:', error)
      this.addMessage('bot', "Hi! I'm the Kwikr assistant. How can I help you today? 😊")
    }
  }

  // Show notification badge
  showNotificationBadge(count = 1) {
    const badge = document.getElementById('kwikr-chat-badge')
    if (badge && !this.isOpen) {
      badge.textContent = count
      badge.style.display = 'flex'
    }
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🤖 Kwikr Chatbot: DOM Content Loaded, initializing in 1 second...')
  // Small delay to ensure page is fully loaded
  setTimeout(() => {
    console.log('🤖 Kwikr Chatbot: Creating new KwikrChatbot instance...')
    try {
      new KwikrChatbot()
      console.log('🤖 Kwikr Chatbot: Instance created successfully')
    } catch (error) {
      console.error('🤖 Kwikr Chatbot: Error creating instance:', error)
    }
  }, 1000)
})

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
  console.log('🤖 Kwikr Chatbot: Document still loading, waiting for DOMContentLoaded')
} else {
  console.log('🤖 Kwikr Chatbot: Document already loaded, initializing immediately')
  setTimeout(() => {
    console.log('🤖 Kwikr Chatbot: Fallback initialization...')
    try {
      new KwikrChatbot()
      console.log('🤖 Kwikr Chatbot: Fallback instance created successfully')
    } catch (error) {
      console.error('🤖 Kwikr Chatbot: Fallback error:', error)
    }
  }, 500)
}