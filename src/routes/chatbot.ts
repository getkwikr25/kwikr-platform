import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

const chatbot = new Hono<{ Bindings: Bindings }>()

// Chatbot service class
class ChatbotService {
  constructor(private db: D1Database) {}

  // Check if chatbot is enabled
  async isChatbotEnabled(): Promise<boolean> {
    try {
      const result = await this.db.prepare(`
        SELECT default_value, is_active 
        FROM feature_flags 
        WHERE flag_key = ?
      `).bind('chatbot_enabled').first()
      
      return result?.is_active === 1 && result?.default_value === 'true'
    } catch (error) {
      console.error('Error checking chatbot status:', error)
      return false
    }
  }

  // Generate session ID
  generateSessionId(): string {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(7)
  }

  // Find matching response from knowledge base with intelligent scoring
  async findResponse(question: string): Promise<string> {
    try {
      const normalizedQuestion = question.toLowerCase().trim()
      
      // Get all active knowledge entries
      const entries = await this.db.prepare(`
        SELECT * FROM chatbot_knowledge 
        WHERE is_active = 1 
        ORDER BY priority DESC, id ASC
      `).all()

      let bestMatch = null
      let highestScore = 0

      // Score each entry for relevance
      for (const entry of entries.results || []) {
        const keywords = JSON.parse(entry.keywords as string)
        const patterns = JSON.parse(entry.question_patterns as string)
        
        let score = 0

        // Keyword matching with scoring
        for (const keyword of keywords) {
          const keywordLower = keyword.toLowerCase()
          if (normalizedQuestion.includes(keywordLower)) {
            // Exact phrase matches score higher
            if (normalizedQuestion.includes(keywordLower)) {
              score += keywordLower.split(' ').length * 2
            }
            // Individual word matches
            const words = keywordLower.split(' ')
            for (const word of words) {
              if (normalizedQuestion.includes(word)) {
                score += 1
              }
            }
          }
        }

        // Pattern matching with higher scoring
        for (const pattern of patterns) {
          const patternLower = pattern.toLowerCase()
          if (normalizedQuestion.includes(patternLower)) {
            score += patternLower.split(' ').length * 3 // Patterns score higher
          } else {
            // Check for partial pattern matches
            const patternWords = patternLower.split(' ')
            const matchingWords = patternWords.filter(word => 
              normalizedQuestion.includes(word) && word.length > 2
            )
            score += matchingWords.length
          }
        }

        // Boost score based on priority
        score += (entry.priority as number) * 0.1

        // Track best match
        if (score > highestScore) {
          highestScore = score
          bestMatch = entry
        }
      }

      // Return best match if score is sufficient
      if (bestMatch && highestScore >= 2) {
        return bestMatch.response as string
      }

      // Intelligent fallback responses - accurate and helpful without overpromising
      const questionWords = normalizedQuestion.split(' ')
      
      // Pricing questions - provide helpful guidance without specific numbers
      if (normalizedQuestion.includes('price') || normalizedQuestion.includes('cost') || normalizedQuestion.includes('rate') || normalizedQuestion.includes('charge')) {
        // Check if asking about platform fees
        if (normalizedQuestion.includes('kwikr') || normalizedQuestion.includes('platform') || normalizedQuestion.includes('fee')) {
          return "Kwikr is completely free for clients. You can post jobs, browse contractors, and communicate with service providers at no cost. You only pay the agreed project amount directly to your chosen contractor. There are no platform fees or hidden charges for clients."
        } else {
          // General pricing question about services
          return "Pricing varies significantly based on project scope, location, materials, and timing. Rather than providing potentially outdated averages, we recommend posting a free job to get current competitive quotes from qualified professionals in your area. This ensures you get accurate pricing specific to your project requirements and local market conditions."
        }
      }
      
      // Location-based service inquiries - never assume location, only respond when explicitly mentioned
      if (normalizedQuestion.includes(' in ') || normalizedQuestion.includes('near me') || normalizedQuestion.includes('area')) {
        const cities = ['toronto', 'vancouver', 'montreal', 'calgary', 'edmonton', 'ottawa', 'winnipeg', 'quebec', 'halifax', 'london', 'hamilton', 'kitchener', 'windsor', 'oshawa', 'saskatoon', 'regina', 'barrie', 'kelowna', 'abbotsford', 'kingston']
        const mentionedCity = cities.find(city => normalizedQuestion.includes(city.toLowerCase()))
        
        if (mentionedCity) {
          return `To check service availability in ${mentionedCity.charAt(0).toUpperCase() + mentionedCity.slice(1)}, post a free job describing your project requirements. Local service providers who can help will submit proposals, giving you current information about availability and competitive pricing for your specific area and project type.`
        } else if (normalizedQuestion.includes('near me') || normalizedQuestion.includes('my area')) {
          return "To find service providers in your area, post a free job describing your project. Local professionals will respond if they can help, providing accurate information about availability and pricing specific to your location."
        } else {
          return "Kwikr operates across Canada. To check availability for your specific location and project type, post a free job with your requirements. Local service providers will respond if they're available to help."
        }
      }
      
      // General service inquiries
      if (normalizedQuestion.includes('find') || normalizedQuestion.includes('search') || normalizedQuestion.includes('get') || normalizedQuestion.includes('hire')) {
        return "The most effective way to connect with qualified service providers is to post a free job describing your project. This allows local professionals to review your requirements and submit competitive proposals if they can help. You can then compare their profiles, ratings, and pricing to make an informed decision."
      }
      
      // Safety and trust questions
      if (normalizedQuestion.includes('safe') || normalizedQuestion.includes('trust') || normalizedQuestion.includes('secure') || normalizedQuestion.includes('verify')) {
        return "We implement several safety measures including service provider verification, secure payment processing, and a review system based on actual client experiences. We encourage reviewing provider profiles, checking ratings and reviews, and communicating through our platform before making hiring decisions."
      }

      // Service category questions - be general, don't overpromise about availability
      if (normalizedQuestion.includes('clean') || normalizedQuestion.includes('plumb') || normalizedQuestion.includes('electric') || normalizedQuestion.includes('paint') || normalizedQuestion.includes('repair')) {
        return "Kwikr connects clients with service providers across various categories. To find contractors for your specific project, post a free job describing your requirements. Qualified local professionals can then submit proposals if they're available and interested in your project."
      }

      // Default response - helpful but accurate about what we can guarantee
      return "I can help you understand how Kwikr works. Our platform allows you to post job descriptions and connect with interested service providers. To get started, post a free job describing your project requirements, and local professionals can submit proposals if they're available and interested. This lets you compare options and make informed decisions. What questions do you have about using our platform?"
    } catch (error) {
      console.error('Error finding response:', error)
      return "I apologize, but I'm experiencing technical difficulties. Please try again in a moment or contact our support team for immediate assistance."
    }
  }

  // Save conversation to database
  async saveConversation(sessionId: string, userId: number | null, question: string, response: string, ipAddress?: string, userAgent?: string) {
    try {
      await this.db.prepare(`
        INSERT INTO chatbot_conversations (session_id, user_id, user_question, bot_response, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(sessionId, userId, question, response, ipAddress, userAgent).run()
    } catch (error) {
      console.error('Error saving conversation:', error)
    }
  }

  // Get conversation history for a session
  async getConversationHistory(sessionId: string, limit: number = 10): Promise<any[]> {
    try {
      const result = await this.db.prepare(`
        SELECT user_question, bot_response, created_at 
        FROM chatbot_conversations 
        WHERE session_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `).bind(sessionId, limit).all()

      return (result.results || []).reverse() // Return in chronological order
    } catch (error) {
      console.error('Error getting conversation history:', error)
      return []
    }
  }
}

// Check if chatbot is enabled
chatbot.get('/status', async (c) => {
  const chatbotService = new ChatbotService(c.env.DB)
  
  try {
    const isEnabled = await chatbotService.isChatbotEnabled()
    return c.json({ enabled: isEnabled, status: 'online' })
  } catch (error) {
    console.error('Error getting chatbot status:', error)
    return c.json({ error: 'Failed to get chatbot status' }, 500)
  }
})

// Start new chat session
chatbot.post('/session', async (c) => {
  const chatbotService = new ChatbotService(c.env.DB)
  
  try {
    const isEnabled = await chatbotService.isChatbotEnabled()
    if (!isEnabled) {
      return c.json({ error: 'Chatbot is currently disabled' }, 503)
    }

    const sessionId = chatbotService.generateSessionId()
    return c.json({ 
      sessionId, 
      message: 'Hello! I\'m the Kwikr assistant. I can help you understand our platform and guide you through posting jobs to connect with service providers. How can I assist you today?' 
    })
  } catch (error) {
    console.error('Error creating chat session:', error)
    return c.json({ error: 'Failed to create chat session' }, 500)
  }
})

// Send message to chatbot
chatbot.post('/message', async (c) => {
  const chatbotService = new ChatbotService(c.env.DB)
  
  try {
    const isEnabled = await chatbotService.isChatbotEnabled()
    if (!isEnabled) {
      return c.json({ error: 'Chatbot is currently disabled' }, 503)
    }

    const { sessionId, message, userId } = await c.req.json()
    
    if (!sessionId || !message) {
      return c.json({ error: 'Session ID and message are required' }, 400)
    }

    // Get client info
    const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    const userAgent = c.req.header('User-Agent') || 'unknown'

    // Generate response
    const response = await chatbotService.findResponse(message)

    // Save conversation
    await chatbotService.saveConversation(sessionId, userId || null, message, response, ipAddress, userAgent)

    return c.json({
      response,
      sessionId,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error processing message:', error)
    return c.json({ error: 'Failed to process message' }, 500)
  }
})

// Get conversation history
chatbot.get('/history/:sessionId', async (c) => {
  const chatbotService = new ChatbotService(c.env.DB)
  
  try {
    const sessionId = c.req.param('sessionId')
    const history = await chatbotService.getConversationHistory(sessionId)
    
    return c.json({ history })
  } catch (error) {
    console.error('Error getting conversation history:', error)
    return c.json({ error: 'Failed to get conversation history' }, 500)
  }
})

// Admin endpoints
chatbot.post('/admin/toggle', async (c) => {
  try {
    // Check admin authentication
    const adminUserId = c.req.header('x-user-id')
    if (!adminUserId) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401)
    }

    const { enabled } = await c.req.json()
    const newValue = enabled ? 'true' : 'false'
    
    await c.env.DB.prepare(`
      UPDATE feature_flags 
      SET default_value = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE flag_key = ?
    `).bind(newValue, 'chatbot_enabled').run()

    return c.json({ 
      success: true, 
      enabled,
      message: `Chatbot ${enabled ? 'enabled' : 'disabled'} successfully`
    })
  } catch (error) {
    console.error('Error toggling chatbot:', error)
    return c.json({ error: 'Failed to toggle chatbot' }, 500)
  }
})

// Admin: Get chatbot analytics
chatbot.get('/admin/analytics', async (c) => {
  try {
    // Check admin authentication
    const adminUserId = c.req.header('x-user-id')
    if (!adminUserId) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401)
    }

    // Get conversation stats
    const totalConversations = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM chatbot_conversations
    `).first()

    const todayConversations = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM chatbot_conversations 
      WHERE DATE(created_at) = DATE('now')
    `).first()

    const uniqueSessions = await c.env.DB.prepare(`
      SELECT COUNT(DISTINCT session_id) as count FROM chatbot_conversations
    `).first()

    const recentConversations = await c.env.DB.prepare(`
      SELECT session_id, user_question, bot_response, created_at 
      FROM chatbot_conversations 
      ORDER BY created_at DESC 
      LIMIT 20
    `).all()

    return c.json({
      totalConversations: totalConversations?.count || 0,
      todayConversations: todayConversations?.count || 0,
      uniqueSessions: uniqueSessions?.count || 0,
      recentConversations: recentConversations.results || []
    })
  } catch (error) {
    console.error('Error getting chatbot analytics:', error)
    return c.json({ error: 'Failed to get analytics' }, 500)
  }
})

export default chatbot