import { Hono } from 'hono'
import { runProductionValidation, BookingEdgeCaseValidator } from '../utils/edge-case-validator.js'
import { BookingPerformanceOptimizer, createPerformanceIndexes, monitorPerformanceMetrics } from '../utils/performance-optimizer.js'
import { BookingEmailService } from '../utils/email-service.js'

// ============================================================================
// BOOKING API ENDPOINTS - All 6 Features Implementation
// ============================================================================

const bookingApiRoutes = new Hono()

// ============================================================================
// FEATURE 2: Appointment Booking - API Endpoints
// ============================================================================

// PERFORMANCE-OPTIMIZED: Get available time slots for a worker on a specific date
bookingApiRoutes.get('/api/available-slots', async (c) => {
  try {
    const db = c.env.DB
    const workerId = c.req.query('worker')
    const date = c.req.query('date')
    const serviceCategory = c.req.query('service')

    if (!workerId || !date) {
      return c.json({ success: false, error: 'Missing required parameters: worker and date' }, 400)
    }

    // Initialize performance optimizer
    const optimizer = new BookingPerformanceOptimizer(db)
    
    // Get optimized available slots with caching and performance metrics
    const result = await optimizer.getOptimizedAvailableSlots(
      parseInt(workerId),
      date,
      serviceCategory
    )

    return c.json({ 
      success: true, 
      slots: result.data,
      performance: result.performance,
      cache_used: result.performance.cache_hit
    })
  } catch (error) {
    console.error('Error getting available slots:', error)
    return c.json({ 
      success: false, 
      error: 'Failed to get available slots',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Book an appointment
bookingApiRoutes.post('/api/book', async (c) => {
  try {
    const db = c.env.DB
    const currentUserId = 1 // Get from session in production
    const bookingData = await c.req.json()

    // Validate required fields
    const required = ['user_id', 'service_category', 'booking_date', 'start_time', 'end_time', 'duration_minutes', 'client_name', 'client_email']
    for (const field of required) {
      if (!bookingData[field]) {
        return c.json({ success: false, error: `Missing required field: ${field}` }, 400)
      }
    }

    // Validate time slot availability
    const isAvailable = await validateTimeSlotAvailability(db, {
      workerId: bookingData.user_id,
      date: bookingData.booking_date,
      startTime: bookingData.start_time,
      endTime: bookingData.end_time,
      serviceCategory: bookingData.service_category
    })

    if (!isAvailable.valid) {
      return c.json({ success: false, error: isAvailable.reason }, 400)
    }

    // Create booking
    const bookingResult = await db.prepare(`
      INSERT INTO bookings (
        client_id, user_id, service_category, booking_date, start_time, end_time, 
        duration_minutes, status, client_name, client_email, client_phone, 
        client_address, client_timezone, service_description, special_instructions, 
        estimated_cost, booking_source, is_recurring
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      currentUserId,
      bookingData.user_id,
      bookingData.service_category,
      bookingData.booking_date,
      bookingData.start_time,
      bookingData.end_time,
      bookingData.duration_minutes,
      'pending',
      bookingData.client_name,
      bookingData.client_email,
      bookingData.client_phone || null,
      bookingData.client_address || null,
      bookingData.client_timezone || 'America/Toronto',
      bookingData.service_description || null,
      bookingData.special_instructions || null,
      bookingData.estimated_cost || null,
      bookingData.booking_source || 'web',
      bookingData.is_recurring || false
    ).run()

    const bookingId = bookingResult.meta.last_row_id

    // Create booking confirmation record
    await createBookingConfirmation(db, bookingId, 'initial', 'email', 'client')

    // Handle recurring booking if requested
    if (bookingData.is_recurring && bookingData.recurring_pattern) {
      await createRecurringPattern(db, bookingId, bookingData.recurring_pattern)
    }

    // Get the complete booking record
    const booking = await db.prepare(`
      SELECT b.*, u.first_name as worker_first_name, u.last_name as worker_last_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `).bind(bookingId).first()

    return c.json({
      success: true,
      message: 'Booking created successfully',
      booking: booking
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return c.json({ success: false, error: 'Failed to create booking' }, 500)
  }
})

// ============================================================================
// FEATURE 3: Booking Confirmation - API Endpoints
// ============================================================================

// Get booking confirmation details
bookingApiRoutes.get('/api/bookings/:id/confirmation', async (c) => {
  try {
    const db = c.env.DB
    const bookingId = c.req.param('id')

    const booking = await db.prepare(`
      SELECT b.*, u.first_name as worker_first_name, u.last_name as worker_last_name, u.email as worker_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `).bind(bookingId).first()

    if (!booking) {
      return c.json({ success: false, error: 'Booking not found' }, 404)
    }

    const confirmations = await db.prepare(`
      SELECT * FROM booking_confirmations 
      WHERE booking_id = ? 
      ORDER BY created_at DESC
    `).bind(bookingId).all()

    return c.json({
      success: true,
      booking: booking,
      confirmations: confirmations.results || []
    })
  } catch (error) {
    console.error('Error getting booking confirmation:', error)
    return c.json({ success: false, error: 'Failed to get confirmation' }, 500)
  }
})

// Send booking confirmation
bookingApiRoutes.post('/api/bookings/:id/send-confirmation', async (c) => {
  try {
    const db = c.env.DB
    const bookingId = c.req.param('id')
    const { confirmation_type, method, recipient } = await c.req.json()

    await createBookingConfirmation(db, bookingId, confirmation_type, method, recipient)

    return c.json({ success: true, message: 'Confirmation sent successfully' })
  } catch (error) {
    console.error('Error sending confirmation:', error)
    return c.json({ success: false, error: 'Failed to send confirmation' }, 500)
  }
})

// ============================================================================
// FEATURE 4: Reschedule/Cancel - API Endpoints
// ============================================================================

// Reschedule booking
bookingApiRoutes.post('/api/bookings/:id/reschedule', async (c) => {
  try {
    const db = c.env.DB
    const bookingId = c.req.param('id')
    const currentUserId = 1 // Get from session
    const { new_date, new_start_time, new_end_time, reason } = await c.req.json()

    // Get current booking
    const booking = await db.prepare(`
      SELECT * FROM bookings WHERE id = ?
    `).bind(bookingId).first() as any

    if (!booking) {
      return c.json({ success: false, error: 'Booking not found' }, 404)
    }

    // Check reschedule policy
    const policy = await checkReschedulePolicy(db, booking.user_id, booking.booking_date, booking.start_time)
    if (!policy.allowed) {
      return c.json({ success: false, error: policy.reason }, 400)
    }

    // Validate new time slot
    const isAvailable = await validateTimeSlotAvailability(db, {
      workerId: booking.user_id,
      date: new_date,
      startTime: new_start_time,
      endTime: new_end_time,
      serviceCategory: booking.service_category,
      excludeBookingId: bookingId
    })

    if (!isAvailable.valid) {
      return c.json({ success: false, error: isAvailable.reason }, 400)
    }

    // Record modification
    await db.prepare(`
      INSERT INTO booking_modifications (
        booking_id, modification_type, modified_by_type, modified_by_id, 
        previous_values, new_values, reason
      ) VALUES (?, 'reschedule', 'client', ?, ?, ?, ?)
    `).bind(
      bookingId,
      currentUserId,
      JSON.stringify({
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time
      }),
      JSON.stringify({
        booking_date: new_date,
        start_time: new_start_time,
        end_time: new_end_time
      }),
      reason || null
    ).run()

    // Update booking
    await db.prepare(`
      UPDATE bookings 
      SET booking_date = ?, start_time = ?, end_time = ?, 
          status = 'confirmed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(new_date, new_start_time, new_end_time, bookingId).run()

    // Send confirmation
    await createBookingConfirmation(db, bookingId, 'modification', 'email', 'both')

    return c.json({ success: true, message: 'Booking rescheduled successfully' })
  } catch (error) {
    console.error('Error rescheduling booking:', error)
    return c.json({ success: false, error: 'Failed to reschedule booking' }, 500)
  }
})

// Cancel booking
bookingApiRoutes.post('/api/bookings/:id/cancel', async (c) => {
  try {
    const db = c.env.DB
    const bookingId = c.req.param('id')
    const currentUserId = 1 // Get from session
    const { reason } = await c.req.json()

    // Get current booking
    const booking = await db.prepare(`
      SELECT * FROM bookings WHERE id = ?
    `).bind(bookingId).first() as any

    if (!booking) {
      return c.json({ success: false, error: 'Booking not found' }, 404)
    }

    // Check cancellation policy
    const policy = await checkCancellationPolicy(db, booking.user_id, booking.booking_date, booking.start_time)
    
    // Calculate fees
    let cancellationFee = 0
    let refundAmount = booking.estimated_cost || 0

    if (policy.fee > 0) {
      cancellationFee = policy.fee_type === 'percentage' 
        ? (booking.estimated_cost || 0) * (policy.fee / 100)
        : policy.fee
      refundAmount = (booking.estimated_cost || 0) - cancellationFee
    }

    // Record modification
    await db.prepare(`
      INSERT INTO booking_modifications (
        booking_id, modification_type, modified_by_type, modified_by_id, 
        previous_values, reason, cancellation_fee, refund_amount
      ) VALUES (?, 'cancel', 'client', ?, ?, ?, ?, ?)
    `).bind(
      bookingId,
      currentUserId,
      JSON.stringify({ status: booking.status }),
      reason || null,
      cancellationFee,
      refundAmount
    ).run()

    // Update booking
    await db.prepare(`
      UPDATE bookings 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(bookingId).run()

    // Send cancellation confirmation
    await createBookingConfirmation(db, bookingId, 'cancellation', 'email', 'both')

    return c.json({ 
      success: true, 
      message: 'Booking cancelled successfully',
      cancellation_fee: cancellationFee,
      refund_amount: refundAmount
    })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return c.json({ success: false, error: 'Failed to cancel booking' }, 500)
  }
})

// ============================================================================
// FEATURE 5: Recurring Bookings - API Endpoints
// ============================================================================

// Create recurring booking pattern
bookingApiRoutes.post('/api/recurring-bookings', async (c) => {
  try {
    const db = c.env.DB
    const currentUserId = 1 // Get from session
    const recurringData = await c.req.json()

    // Validate required fields
    const required = ['user_id', 'pattern_type', 'start_time', 'duration_minutes', 'service_category', 'start_date']
    for (const field of required) {
      if (!recurringData[field]) {
        return c.json({ success: false, error: `Missing required field: ${field}` }, 400)
      }
    }

    // Create recurring booking pattern
    const recurringResult = await db.prepare(`
      INSERT INTO recurring_bookings (
        client_id, user_id, pattern_type, frequency, days_of_week, day_of_month,
        start_time, duration_minutes, timezone, service_category, service_description,
        estimated_cost, start_date, end_date, max_occurrences, status, auto_confirm
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `).bind(
      currentUserId,
      recurringData.user_id,
      recurringData.pattern_type,
      recurringData.frequency || 1,
      recurringData.days_of_week ? JSON.stringify(recurringData.days_of_week) : null,
      recurringData.day_of_month || null,
      recurringData.start_time,
      recurringData.duration_minutes,
      recurringData.timezone || 'America/Toronto',
      recurringData.service_category,
      recurringData.service_description || null,
      recurringData.estimated_cost || null,
      recurringData.start_date,
      recurringData.end_date || null,
      recurringData.max_occurrences || null,
      recurringData.auto_confirm || false
    ).run()

    const recurringId = recurringResult.meta.last_row_id

    // Generate initial bookings
    await generateRecurringBookings(db, recurringId)

    return c.json({
      success: true,
      message: 'Recurring booking pattern created successfully',
      recurring_id: recurringId
    })
  } catch (error) {
    console.error('Error creating recurring booking:', error)
    return c.json({ success: false, error: 'Failed to create recurring booking' }, 500)
  }
})

// Get recurring bookings
bookingApiRoutes.get('/api/recurring-bookings', async (c) => {
  try {
    const db = c.env.DB
    const currentUserId = 1 // Get from session

    const recurringBookings = await db.prepare(`
      SELECT rb.*, u.first_name as worker_first_name, u.last_name as worker_last_name,
             COUNT(b.id) as total_bookings
      FROM recurring_bookings rb
      JOIN users u ON rb.user_id = u.id
      LEFT JOIN bookings b ON rb.id = b.recurring_booking_id
      WHERE rb.client_id = ?
      GROUP BY rb.id
      ORDER BY rb.created_at DESC
    `).bind(currentUserId).all()

    return c.json({
      success: true,
      recurring_bookings: recurringBookings.results || []
    })
  } catch (error) {
    console.error('Error getting recurring bookings:', error)
    return c.json({ success: false, error: 'Failed to get recurring bookings' }, 500)
  }
})

// ============================================================================
// FEATURE 6: Time Zone Management - API Endpoints
// ============================================================================

// Get timezone information
bookingApiRoutes.get('/api/timezones', async (c) => {
  try {
    const db = c.env.DB

    const timezones = await db.prepare(`
      SELECT * FROM timezone_definitions 
      WHERE is_active = 1 
      ORDER BY timezone_name
    `).all()

    return c.json({
      success: true,
      timezones: timezones.results || []
    })
  } catch (error) {
    console.error('Error getting timezones:', error)
    return c.json({ success: false, error: 'Failed to get timezones' }, 500)
  }
})

// Convert booking time between timezones
bookingApiRoutes.post('/api/convert-timezone', async (c) => {
  try {
    const { datetime, from_timezone, to_timezone } = await c.req.json()

    // Simple timezone conversion (in production, use proper timezone library)
    const result = convertTimezone(datetime, from_timezone, to_timezone)

    return c.json({
      success: true,
      original: { datetime, timezone: from_timezone },
      converted: { datetime: result.datetime, timezone: to_timezone },
      offset_difference: result.offset_hours
    })
  } catch (error) {
    console.error('Error converting timezone:', error)
    return c.json({ success: false, error: 'Failed to convert timezone' }, 500)
  }
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Generate available time slots
function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  bufferBefore: number = 15,
  bufferAfter: number = 15,
  breakStart?: string,
  breakEnd?: string,
  existingBookings: any[] = []
): any[] {
  const slots: any[] = []
  const totalDuration = durationMinutes + bufferBefore + bufferAfter
  
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  const breakStartMin = breakStart ? timeToMinutes(breakStart) : null
  const breakEndMin = breakEnd ? timeToMinutes(breakEnd) : null

  for (let current = start; current + totalDuration <= end; current += 30) { // 30-minute intervals
    const slotStart = current + bufferBefore
    const slotEnd = slotStart + durationMinutes

    // Check if slot conflicts with break time
    if (breakStartMin && breakEndMin) {
      if (!(slotEnd <= breakStartMin || slotStart >= breakEndMin)) {
        continue
      }
    }

    // Check if slot conflicts with existing bookings
    const slotStartTime = minutesToTime(slotStart)
    const slotEndTime = minutesToTime(slotEnd)
    
    const hasConflict = existingBookings.some(booking => {
      const bookingStart = timeToMinutes(booking.start_time)
      const bookingEnd = timeToMinutes(booking.end_time)
      return !(slotEnd <= bookingStart || slotStart >= bookingEnd)
    })

    if (!hasConflict) {
      slots.push({
        start_time: slotStartTime,
        end_time: slotEndTime,
        duration: durationMinutes,
        available: true
      })
    }
  }

  return slots
}

// Convert time string to minutes since midnight
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// Convert minutes since midnight to time string
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`
}

// Validate time slot availability
async function validateTimeSlotAvailability(db: any, params: {
  workerId: number
  date: string
  startTime: string
  endTime: string
  serviceCategory: string
  excludeBookingId?: number
}): Promise<{ valid: boolean; reason?: string }> {
  // Check if worker is available on this day
  const dayOfWeek = new Date(params.date + 'T00:00:00').getDay()
  
  const availability = await db.prepare(`
    SELECT * FROM worker_availability 
    WHERE user_id = ? AND day_of_week = ? AND is_available = 1
  `).bind(params.workerId, dayOfWeek).first()

  if (!availability) {
    return { valid: false, reason: 'Worker not available on this day' }
  }

  // Check for availability overrides
  const override = await db.prepare(`
    SELECT * FROM availability_overrides 
    WHERE user_id = ? AND override_date = ? AND override_type = 'unavailable'
  `).bind(params.workerId, params.date).first()

  if (override) {
    return { valid: false, reason: 'Worker not available on this date' }
  }

  // Check for conflicting bookings
  let conflictQuery = `
    SELECT COUNT(*) as count FROM bookings 
    WHERE user_id = ? AND booking_date = ? 
    AND status NOT IN ('cancelled', 'rescheduled')
    AND NOT (end_time <= ? OR start_time >= ?)
  `
  let conflictParams = [params.workerId, params.date, params.startTime, params.endTime]

  if (params.excludeBookingId) {
    conflictQuery += ' AND id != ?'
    conflictParams.push(params.excludeBookingId)
  }

  const conflicts = await db.prepare(conflictQuery).bind(...conflictParams).first()

  if (conflicts && conflicts.count > 0) {
    return { valid: false, reason: 'Time slot not available' }
  }

  return { valid: true }
}

// Check reschedule policy
async function checkReschedulePolicy(db: any, workerId: number, bookingDate: string, startTime: string): Promise<{ allowed: boolean; reason?: string; fee?: number }> {
  const policy = await db.prepare(`
    SELECT * FROM booking_policies 
    WHERE user_id = ? AND policy_type = 'reschedule' AND is_active = 1
  `).bind(workerId).first()

  if (!policy) {
    return { allowed: true }
  }

  // Check minimum notice requirement
  const bookingDateTime = new Date(`${bookingDate}T${startTime}`)
  const now = new Date()
  const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilBooking < policy.minimum_notice_hours) {
    if (!policy.same_day_changes_allowed) {
      return { allowed: false, reason: `Reschedule requires at least ${policy.minimum_notice_hours} hours notice` }
    }
  }

  return { allowed: true, fee: policy.reschedule_fee_amount || 0 }
}

// Check cancellation policy
async function checkCancellationPolicy(db: any, workerId: number, bookingDate: string, startTime: string): Promise<{ allowed: boolean; reason?: string; fee: number; fee_type: string }> {
  const policy = await db.prepare(`
    SELECT * FROM booking_policies 
    WHERE user_id = ? AND policy_type = 'cancellation' AND is_active = 1
  `).bind(workerId).first()

  if (!policy) {
    return { allowed: true, fee: 0, fee_type: 'none' }
  }

  // Check minimum notice requirement
  const bookingDateTime = new Date(`${bookingDate}T${startTime}`)
  const now = new Date()
  const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilBooking < policy.minimum_notice_hours && !policy.same_day_changes_allowed) {
    return { 
      allowed: true, // Still allowed but with fee
      fee: policy.cancellation_fee_amount || 0,
      fee_type: policy.cancellation_fee_type || 'none'
    }
  }

  return { 
    allowed: true, 
    fee: hoursUntilBooking >= policy.minimum_notice_hours ? 0 : policy.cancellation_fee_amount || 0,
    fee_type: policy.cancellation_fee_type || 'none'
  }
}

// Create booking confirmation record
// PRODUCTION EMAIL SERVICE INTEGRATION
async function sendBookingEmailNotification(db: any, bookingId: number, emailType: 'confirmation' | 'cancellation' | 'reschedule' | 'reminder', additionalData?: any) {
  try {
    // Get booking details with worker information
    const booking = await db.prepare(`
      SELECT 
        b.*,
        COALESCE(u.first_name || ' ' || u.last_name, u.first_name, u.last_name, 'Unknown') as worker_name,
        u.email as worker_email,
        b.service_category as service_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `).bind(bookingId).first()

    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`)
    }

    // Initialize email service
    const emailService = new BookingEmailService()

    // Prepare booking data with additional context
    const bookingData = {
      ...booking,
      ...additionalData
    }

    // Send appropriate email based on type
    let emailResult
    switch (emailType) {
      case 'confirmation':
        emailResult = await emailService.sendBookingConfirmation(bookingData)
        break
      case 'cancellation':
        emailResult = await emailService.sendBookingCancellation(bookingData, additionalData?.cancellation_reason)
        break
      case 'reschedule':
        emailResult = await emailService.sendRescheduleConfirmation(bookingData, additionalData?.newBooking)
        break
      case 'reminder':
        emailResult = await emailService.sendBookingReminder(bookingData, additionalData?.reminder_type || '24h')
        break
      default:
        throw new Error(`Unknown email type: ${emailType}`)
    }

    // Log email delivery to database - adapted to actual schema
    await db.prepare(`
      INSERT INTO booking_confirmations (
        booking_id, confirmation_type, confirmation_method, recipient_type,
        subject, message_content, template_used, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      bookingId,
      emailType,
      'email',
      'client_and_worker',
      `Email sent via ${emailResult.provider}`,
      `Template: ${emailType}, Message ID: ${emailResult.message_id}, Time: ${emailResult.delivery_time_ms}ms`,
      emailType,
      emailResult.status === 'sent' ? 'delivered' : 'failed'
    ).run()

    return emailResult
  } catch (error) {
    console.error(`Email notification failed for booking ${bookingId}:`, error)
    
    // Log failure to database - adapted to actual schema
    await db.prepare(`
      INSERT INTO booking_confirmations (
        booking_id, confirmation_type, confirmation_method, recipient_type,
        subject, message_content, template_used, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'failed')
    `).bind(
      bookingId,
      emailType,
      'email',
      'system_error',
      'Email delivery failed',
      error instanceof Error ? error.message : 'Unknown error',
      'error_template'
    ).run()

    throw error
  }
}

// Legacy function for backward compatibility
async function createBookingConfirmation(db: any, bookingId: number, type: string, method: string, recipient: string) {
  // Convert legacy parameters to new email service
  const emailTypeMap: Record<string, 'confirmation' | 'cancellation' | 'reschedule'> = {
    'initial': 'confirmation',
    'modification': 'reschedule',
    'cancellation': 'cancellation'
  }

  const emailType = emailTypeMap[type]
  if (emailType && method === 'email') {
    return await sendBookingEmailNotification(db, bookingId, emailType)
  } else {
    // Fallback to basic logging for non-email methods
    await db.prepare(`
      INSERT INTO booking_confirmations (
        booking_id, confirmation_type, confirmation_method, recipient_type,
        subject, message_content, template_used, status, scheduled_for
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `).bind(
      bookingId, type, method, recipient,
      'Legacy confirmation', 'Legacy confirmation created', 'legacy_template'
    ).run()
  }
}

// Generate recurring bookings
async function generateRecurringBookings(db: any, recurringId: number) {
  // This would implement the logic to generate individual bookings based on the recurring pattern
  // For now, we'll create a placeholder implementation
  console.log(`Generating recurring bookings for pattern ${recurringId}`)
}

// ============================================================================
// EDGE CASE TESTING AND VALIDATION ENDPOINTS
// ============================================================================

// Production validation endpoint - comprehensive system validation
bookingApiRoutes.get('/api/system/validate', async (c) => {
  try {
    const db = c.env.DB
    
    // Run comprehensive edge case testing
    const validationResults = await runProductionValidation(db)
    
    return c.json({
      success: true,
      validation: validationResults,
      timestamp: new Date().toISOString(),
      environment: 'production'
    })
  } catch (error) {
    console.error('System validation failed:', error)
    return c.json({
      success: false,
      error: 'System validation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Detailed edge case testing endpoint
bookingApiRoutes.post('/api/system/test-edge-cases', async (c) => {
  try {
    const db = c.env.DB
    const validator = new BookingEdgeCaseValidator(db)
    
    // Run all edge case tests
    const results = await validator.runAllTests()
    
    return c.json({
      success: true,
      test_results: results,
      timestamp: new Date().toISOString(),
      test_environment: 'production'
    })
  } catch (error) {
    console.error('Edge case testing failed:', error)
    return c.json({
      success: false,
      error: 'Edge case testing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Health check endpoint with basic validation
bookingApiRoutes.get('/api/system/health', async (c) => {
  try {
    const db = c.env.DB
    
    // Basic database connectivity test
    const testQuery = await db.prepare('SELECT 1 as test').first()
    
    // Quick data integrity checks
    const userCount = await db.prepare('SELECT COUNT(*) as count FROM users').first()
    const bookingCount = await db.prepare('SELECT COUNT(*) as count FROM bookings').first()
    const activeBookings = await db.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = "confirmed"').first()
    
    return c.json({
      success: true,
      status: 'healthy',
      database: {
        connected: testQuery?.test === 1,
        users: userCount?.count || 0,
        total_bookings: bookingCount?.count || 0,
        active_bookings: activeBookings?.count || 0
      },
      timestamp: new Date().toISOString(),
      uptime: process?.uptime?.() || 'unknown'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return c.json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// ============================================================================
// PERFORMANCE OPTIMIZATION ENDPOINTS
// ============================================================================

// Performance-optimized booking history with pagination and caching
bookingApiRoutes.get('/api/bookings/optimized', async (c) => {
  try {
    const db = c.env.DB
    const optimizer = new BookingPerformanceOptimizer(db)
    
    // Extract query parameters
    const clientEmail = c.req.query('client_email')
    const workerId = c.req.query('worker_id') ? parseInt(c.req.query('worker_id')!) : undefined
    const status = c.req.query('status')
    const page = parseInt(c.req.query('page') || '1')
    const pageSize = Math.min(parseInt(c.req.query('page_size') || '50'), 100) // Max 100
    
    // Date range filtering
    const startDate = c.req.query('start_date')
    const endDate = c.req.query('end_date')
    const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined
    
    const result = await optimizer.getOptimizedBookingHistory(
      clientEmail,
      workerId,
      dateRange,
      status,
      page,
      pageSize
    )
    
    return c.json({
      success: true,
      bookings: result.data,
      pagination: result.pagination,
      performance: result.performance
    })
  } catch (error) {
    console.error('Optimized booking history failed:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch optimized booking history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Performance analytics for workers with large datasets
bookingApiRoutes.get('/api/analytics/performance', async (c) => {
  try {
    const db = c.env.DB
    const optimizer = new BookingPerformanceOptimizer(db)
    
    const workerId = c.req.query('worker_id') ? parseInt(c.req.query('worker_id')!) : undefined
    const startDate = c.req.query('start_date')
    const endDate = c.req.query('end_date')
    
    const dateRange = startDate && endDate ? 
      { start: startDate, end: endDate } : 
      { 
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      }
    
    const result = await optimizer.getOptimizedWorkerAnalytics(workerId, dateRange)
    
    return c.json({
      success: true,
      analytics: result.data,
      performance: result.performance
    })
  } catch (error) {
    console.error('Performance analytics failed:', error)
    return c.json({
      success: false,
      error: 'Failed to generate performance analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Bulk operations for large datasets
bookingApiRoutes.post('/api/bookings/bulk-update', async (c) => {
  try {
    const db = c.env.DB
    const optimizer = new BookingPerformanceOptimizer(db)
    
    const { booking_ids, new_status, batch_size } = await c.req.json()
    
    if (!booking_ids || !Array.isArray(booking_ids) || !new_status) {
      return c.json({
        success: false,
        error: 'Invalid request: booking_ids (array) and new_status are required'
      }, 400)
    }
    
    const result = await optimizer.bulkUpdateBookingStatus(
      booking_ids,
      new_status,
      batch_size || 100
    )
    
    return c.json({
      success: true,
      updated_count: result.updated,
      performance: result.performance
    })
  } catch (error) {
    console.error('Bulk update failed:', error)
    return c.json({
      success: false,
      error: 'Bulk update operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Database optimization and index management
bookingApiRoutes.post('/api/system/optimize-database', async (c) => {
  try {
    const db = c.env.DB
    
    // Create performance indexes
    const indexResult = await createPerformanceIndexes(db)
    
    return c.json({
      success: true,
      optimization: indexResult,
      message: 'Database optimization completed'
    })
  } catch (error) {
    console.error('Database optimization failed:', error)
    return c.json({
      success: false,
      error: 'Database optimization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Performance monitoring endpoint
bookingApiRoutes.get('/api/system/performance-monitor', async (c) => {
  try {
    const db = c.env.DB
    const optimizer = new BookingPerformanceOptimizer(db)
    
    // Get performance metrics
    const metrics = await monitorPerformanceMetrics(db)
    const cacheStats = optimizer.getCacheStats()
    
    return c.json({
      success: true,
      performance_metrics: metrics,
      cache_statistics: cacheStats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Performance monitoring failed:', error)
    return c.json({
      success: false,
      error: 'Performance monitoring failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Cache management operations
bookingApiRoutes.delete('/api/system/cache', async (c) => {
  try {
    const db = c.env.DB
    const optimizer = new BookingPerformanceOptimizer(db)
    
    const pattern = c.req.query('pattern') // Optional pattern to clear specific cache entries
    
    const cleared = optimizer.clearCache(pattern)
    
    return c.json({
      success: true,
      message: `Cleared ${cleared} cache entries`,
      pattern: pattern || 'all'
    })
  } catch (error) {
    console.error('Cache clear failed:', error)
    return c.json({
      success: false,
      error: 'Cache clear operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ============================================================================
// EMAIL SERVICE INTEGRATION ENDPOINTS
// ============================================================================

// Send manual booking email (for testing and manual operations)
bookingApiRoutes.post('/api/bookings/:id/send-email', async (c) => {
  try {
    const db = c.env.DB
    const bookingId = parseInt(c.req.param('id'))
    const { email_type, additional_data } = await c.req.json()

    if (!['confirmation', 'cancellation', 'reschedule', 'reminder'].includes(email_type)) {
      return c.json({
        success: false,
        error: 'Invalid email type. Must be: confirmation, cancellation, reschedule, or reminder'
      }, 400)
    }

    const emailResult = await sendBookingEmailNotification(db, bookingId, email_type, additional_data)

    return c.json({
      success: true,
      email_result: emailResult,
      message: `${email_type} email sent successfully`
    })
  } catch (error) {
    console.error('Manual email sending failed:', error)
    return c.json({
      success: false,
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Test email service configuration and delivery
bookingApiRoutes.post('/api/system/test-email', async (c) => {
  try {
    const emailService = new BookingEmailService()
    const testResults = await emailService.testEmailDelivery()

    return c.json({
      success: true,
      test_results: testResults,
      recommendations: [
        testResults.overall_status === 'failed' ? 'Configure at least one email provider' : null,
        testResults.overall_status === 'degraded' ? 'Some providers are not working - check configurations' : null,
        testResults.providers_working === 0 ? 'No email providers configured - emails will not be sent' : null,
        'Set environment variables: RESEND_API_KEY, SENDGRID_API_KEY, or MAILGUN_API_KEY'
      ].filter(Boolean)
    })
  } catch (error) {
    console.error('Email service test failed:', error)
    return c.json({
      success: false,
      error: 'Email service test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Send booking reminders for upcoming appointments
bookingApiRoutes.post('/api/system/send-reminders', async (c) => {
  try {
    const db = c.env.DB
    const { reminder_type, hours_ahead } = await c.req.json()

    // Default reminder configurations
    const reminderConfigs = {
      '24h': { hours: 24, type: '24h' },
      '2h': { hours: 2, type: '2h' },
      '30min': { hours: 0.5, type: '30min' }
    }

    const config = reminderConfigs[reminder_type as keyof typeof reminderConfigs] || 
                  { hours: hours_ahead || 24, type: reminder_type || '24h' }

    // Find bookings that need reminders
    const upcomingBookings = await db.prepare(`
      SELECT 
        b.*,
        COALESCE(u.first_name || ' ' || u.last_name, u.first_name, u.last_name, 'Unknown') as worker_name,
        u.email as worker_email,
        b.service_category as service_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'confirmed'
        AND datetime(b.booking_date || ' ' || b.start_time) 
            BETWEEN datetime('now') AND datetime('now', '+${config.hours} hours')
    `).all()

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      details: [] as any[]
    }

    for (const booking of upcomingBookings.results || []) {
      results.processed++

      try {
        const emailResult = await sendBookingEmailNotification(
          db, 
          booking.id, 
          'reminder', 
          { reminder_type: config.type }
        )

        if (emailResult.status === 'sent') {
          // Mark reminder as sent
          await db.prepare(`
            UPDATE bookings 
            SET reminder_sent = ?
            WHERE id = ?
          `).bind(config.type, booking.id).run()

          results.sent++
          results.details.push({
            booking_id: booking.id,
            client_email: booking.client_email,
            status: 'sent',
            provider: emailResult.provider
          })
        } else {
          results.failed++
          results.details.push({
            booking_id: booking.id,
            client_email: booking.client_email,
            status: 'failed',
            error: emailResult.error
          })
        }
      } catch (error) {
        results.failed++
        results.details.push({
          booking_id: booking.id,
          client_email: booking.client_email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return c.json({
      success: true,
      reminder_batch: {
        reminder_type: config.type,
        hours_ahead: config.hours,
        ...results
      }
    })
  } catch (error) {
    console.error('Reminder sending failed:', error)
    return c.json({
      success: false,
      error: 'Failed to send reminders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get email delivery statistics and logs
bookingApiRoutes.get('/api/system/email-stats', async (c) => {
  try {
    const db = c.env.DB
    const days = parseInt(c.req.query('days') || '7')

    // Get email delivery statistics - adapted to actual schema
    const stats = await db.prepare(`
      SELECT 
        confirmation_type as email_type,
        status,
        'system' as delivery_provider,
        COUNT(*) as count,
        0 as avg_delivery_time_ms,
        MIN(created_at) as oldest_email,
        MAX(created_at) as newest_email
      FROM booking_confirmations
      WHERE created_at >= datetime('now', '-${days} days')
        AND confirmation_method = 'email'
      GROUP BY confirmation_type, status
      ORDER BY confirmation_type, status
    `).all()

    // Get recent email logs - adapted to actual schema
    const recentEmails = await db.prepare(`
      SELECT 
        bc.*,
        b.client_email,
        b.client_name
      FROM booking_confirmations bc
      JOIN bookings b ON bc.booking_id = b.id
      WHERE bc.created_at >= datetime('now', '-24 hours')
        AND bc.confirmation_method = 'email'
      ORDER BY bc.created_at DESC
      LIMIT 50
    `).all()

    // Calculate summary metrics
    const totalEmails = (stats.results || []).reduce((sum: number, row: any) => sum + row.count, 0)
    const successfulEmails = (stats.results || [])
      .filter((row: any) => row.status === 'sent')
      .reduce((sum: number, row: any) => sum + row.count, 0)

    const deliveryRate = totalEmails > 0 ? (successfulEmails / totalEmails * 100).toFixed(2) : '0'

    return c.json({
      success: true,
      email_statistics: {
        period_days: days,
        total_emails: totalEmails,
        successful_emails: successfulEmails,
        delivery_rate_percent: parseFloat(deliveryRate),
        breakdown: stats.results || [],
        recent_emails: recentEmails.results || []
      }
    })
  } catch (error) {
    console.error('Email statistics failed:', error)
    return c.json({
      success: false,
      error: 'Failed to get email statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Email template management
bookingApiRoutes.get('/api/system/email-templates', async (c) => {
  try {
    const emailService = new BookingEmailService()
    
    return c.json({
      success: true,
      templates: [
        {
          template_id: 'booking_confirmation',
          template_name: 'Booking Confirmation',
          category: 'confirmation',
          description: 'Sent when a booking is confirmed'
        },
        {
          template_id: 'booking_cancellation',
          template_name: 'Booking Cancellation',
          category: 'cancellation',
          description: 'Sent when a booking is cancelled'
        },
        {
          template_id: 'booking_reminder',
          template_name: 'Booking Reminder',
          category: 'reminder',
          description: 'Sent as appointment reminders (24h, 2h, 30min)'
        },
        {
          template_id: 'booking_reschedule',
          template_name: 'Booking Rescheduled',
          category: 'reschedule',
          description: 'Sent when a booking time is changed'
        }
      ],
      email_providers: [
        { name: 'Resend', configured: !!process.env.RESEND_API_KEY },
        { name: 'SendGrid', configured: !!process.env.SENDGRID_API_KEY },
        { name: 'Mailgun', configured: !!process.env.MAILGUN_API_KEY }
      ]
    })
  } catch (error) {
    console.error('Email template listing failed:', error)
    return c.json({
      success: false,
      error: 'Failed to list email templates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export { bookingApiRoutes }