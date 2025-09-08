import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Emergency data import endpoint for production
app.post('/import-test-data', async (c) => {
  try {
    const { DB } = c.env
    
    // Check if we already have data
    const existingCount = await DB.prepare(`
      SELECT COUNT(*) as count FROM users WHERE role = 'worker'
    `).first()
    
    if (existingCount && existingCount.count > 0) {
      return c.json({ 
        success: false, 
        message: `Database already has ${existingCount.count} workers. Use force=true to overwrite.` 
      })
    }
    
    // Insert test workers
    const workers = [
      {
        first_name: 'John', last_name: 'Smith', email: 'john@landscaping.ca', 
        phone: '4161234567', city: 'Toronto', province: 'ON',
        company: 'Smith Landscaping Services', service: 'Landscaping', rate: 65
      },
      {
        first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@cleaning.ca',
        phone: '4169876543', city: 'Mississauga', province: 'ON', 
        company: 'Crystal Clean Services', service: 'Cleaning Services', rate: 45
      },
      {
        first_name: 'Mike', last_name: 'Wilson', email: 'mike@plumbing.ca',
        phone: '4165551234', city: 'Brampton', province: 'ON',
        company: 'Wilson Plumbing', service: 'Plumbers', rate: 85
      },
      {
        first_name: 'David', last_name: 'Brown', email: 'david@electric.ca',
        phone: '4035551234', city: 'Calgary', province: 'AB',
        company: 'Brown Electric', service: 'Electricians', rate: 95
      },
      {
        first_name: 'Lisa', last_name: 'Green', email: 'lisa@gardenworks.ca',
        phone: '6045551234', city: 'Vancouver', province: 'BC',
        company: 'Green Thumb Landscaping', service: 'Landscaping', rate: 70
      }
    ]
    
    let imported = 0
    
    for (const worker of workers) {
      // Insert user
      const userResult = await DB.prepare(`
        INSERT INTO users (first_name, last_name, email, phone, city, province, role, is_active, is_verified, password_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'worker', 1, 1, 'temp_hash', datetime('now'))
      `).bind(
        worker.first_name, worker.last_name, worker.email, 
        worker.phone, worker.city, worker.province
      ).run()
      
      const userId = userResult.meta.last_row_id
      
      // Insert profile
      await DB.prepare(`
        INSERT INTO user_profiles (user_id, company_name, bio, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `).bind(
        userId, worker.company, `Professional ${worker.service} provider in ${worker.city}, ${worker.province}`
      ).run()
      
      // Insert service
      await DB.prepare(`
        INSERT INTO worker_services (user_id, service_name, service_category, description, hourly_rate, is_available, created_at)
        VALUES (?, ?, ?, ?, ?, 1, datetime('now'))
      `).bind(
        userId, worker.service, worker.service, `Professional ${worker.service} services`, worker.rate
      ).run()
      
      imported++
    }
    
    return c.json({
      success: true,
      message: `Successfully imported ${imported} test workers`,
      workers: imported
    })
    
  } catch (error) {
    console.error('Import error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Import failed'
    }, 500)
  }
})

export default app