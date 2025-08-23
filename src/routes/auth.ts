import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

export const authRoutes = new Hono<{ Bindings: Bindings }>()

// Register new user
authRoutes.post('/register', async (c) => {
  try {
    const { email, password, role, firstName, lastName, province, city } = await c.req.json()
    
    // Validate required fields
    if (!email || !password || !role || !firstName || !lastName || !province || !city) {
      return c.json({ error: 'All fields are required' }, 400)
    }
    
    // Validate role
    if (!['client', 'worker'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400)
    }
    
    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()
    
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 409)
    }
    
    // Simple password hashing (in production, use proper bcrypt)
    const passwordHash = btoa(password) // Basic encoding - replace with proper hashing
    
    // Insert new user
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, province, city)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(email, passwordHash, role, firstName, lastName, province, city).run()
    
    if (!result.success) {
      return c.json({ error: 'Failed to create user' }, 500)
    }
    
    // Create user profile
    await c.env.DB.prepare(`
      INSERT INTO user_profiles (user_id) VALUES (?)
    `).bind(result.meta.last_row_id).run()
    
    // Create default subscription
    await c.env.DB.prepare(`
      INSERT INTO subscriptions (user_id, plan_type, status, monthly_fee, per_job_fee)
      VALUES (?, 'pay_as_you_go', 'active', 0.00, 12.00)
    `).bind(result.meta.last_row_id).run()
    
    return c.json({ 
      message: 'User created successfully',
      userId: result.meta.last_row_id,
      role: role
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Login user
authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }
    
    // Find user
    const user = await c.env.DB.prepare(`
      SELECT id, email, password_hash, role, first_name, last_name, province, city, is_verified, is_active
      FROM users WHERE email = ?
    `).bind(email).first()
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // Verify password (basic check - replace with proper bcrypt verification)
    const expectedHash = btoa(password)
    if (user.password_hash !== expectedHash) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    if (!user.is_active) {
      return c.json({ error: 'Account is disabled' }, 401)
    }
    
    // Update last login
    await c.env.DB.prepare(`
      UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(user.id).run()
    
    // Create session token (simple approach - in production use JWT or secure sessions)
    const sessionToken = btoa(`${user.id}:${Date.now()}:${Math.random()}`)
    
    // Store session
    await c.env.DB.prepare(`
      INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address)
      VALUES (?, ?, datetime('now', '+7 days'), ?)
    `).bind(user.id, sessionToken, c.req.header('cf-connecting-ip') || 'unknown').run()
    
    return c.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        province: user.province,
        city: user.city,
        isVerified: user.is_verified
      },
      sessionToken
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Logout user
authRoutes.post('/logout', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (sessionToken) {
      // Delete session
      await c.env.DB.prepare(`
        DELETE FROM user_sessions WHERE session_token = ?
      `).bind(sessionToken).run()
    }
    
    return c.json({ message: 'Logged out successfully' })
    
  } catch (error) {
    console.error('Logout error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Verify session and get current user
authRoutes.get('/me', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ error: 'No session token provided' }, 401)
    }
    
    // Verify session
    const session = await c.env.DB.prepare(`
      SELECT s.user_id, u.email, u.role, u.first_name, u.last_name, u.province, u.city, u.is_verified
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = 1
    `).bind(sessionToken).first()
    
    if (!session) {
      return c.json({ error: 'Invalid or expired session' }, 401)
    }
    
    return c.json({
      user: {
        id: session.user_id,
        email: session.email,
        role: session.role,
        firstName: session.first_name,
        lastName: session.last_name,
        province: session.province,
        city: session.city,
        isVerified: session.is_verified
      }
    })
    
  } catch (error) {
    console.error('Session verification error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})