import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

// TypeScript interfaces for booking system
interface Booking {
  id?: number
  client_id: number
  user_id: number // worker/service provider
  job_id?: number
  service_category: string
  booking_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  status: string
  client_name: string
  client_email: string
  client_phone?: string
  client_address?: string
  client_timezone: string
  service_description?: string
  special_instructions?: string
  estimated_cost?: number
  booking_source: string
  is_recurring: boolean
  recurring_booking_id?: number
}

interface WorkerAvailability {
  id?: number
  user_id: number
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
  break_start_time?: string
  break_end_time?: string
}

interface RecurringBooking {
  id?: number
  client_id: number
  user_id: number
  pattern_type: string
  frequency: number
  days_of_week?: string
  day_of_month?: number
  start_time: string
  duration_minutes: number
  timezone: string
  service_category: string
  service_description?: string
  estimated_cost?: number
  start_date: string
  end_date?: string
  max_occurrences?: number
  status: string
  auto_confirm: boolean
}

// Initialize booking routes
const bookingRoutes = new Hono()

// ============================================================================
// FEATURE 1: Calendar Integration - Worker availability calendar
// ============================================================================

// Worker calendar view - shows availability and bookings
bookingRoutes.get('/calendar/:workerId?', async (c) => {
  try {
    const db = c.env.DB
    const workerId = c.req.param('workerId') || '2' // Default to worker 2 for demo
    const month = c.req.query('month') || new Date().toISOString().slice(0, 7) // YYYY-MM format
    
    // Get worker info
    const worker = await db.prepare(`
      SELECT u.*, p.profile_image_url, p.bio 
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ? AND u.role = 'worker'
    `).bind(workerId).first()

    if (!worker) {
      return c.html(`
        <div class="min-h-screen bg-gray-100 flex items-center justify-center">
          <div class="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 class="text-2xl font-bold text-red-600 mb-4">Worker Not Found</h2>
            <p class="text-gray-600 mb-4">The requested service provider could not be found.</p>
            <a href="/booking/calendar" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Browse Workers</a>
          </div>
        </div>
      `, 404)
    }

    // Get worker availability schedule
    const availability = await db.prepare(`
      SELECT * FROM worker_availability 
      WHERE user_id = ? 
      ORDER BY day_of_week, start_time
    `).bind(workerId).all()

    // Get service time slots
    const timeSlots = await db.prepare(`
      SELECT * FROM service_time_slots 
      WHERE user_id = ? 
      ORDER BY service_category
    `).bind(workerId).all()

    // Get bookings for the month
    const startDate = `${month}-01`
    const endDate = `${month}-31`
    const bookings = await db.prepare(`
      SELECT * FROM bookings 
      WHERE user_id = ? 
      AND booking_date BETWEEN ? AND ?
      AND status NOT IN ('cancelled')
      ORDER BY booking_date, start_time
    `).bind(workerId, startDate, endDate).all()

    // Get availability overrides for the month
    const overrides = await db.prepare(`
      SELECT * FROM availability_overrides 
      WHERE user_id = ? 
      AND override_date BETWEEN ? AND ?
      ORDER BY override_date
    `).bind(workerId, startDate, endDate).all()

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Calendar - ${worker.first_name} ${worker.last_name} - Kwikr</title>
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
            .calendar-day {
              height: 120px;
              border: 1px solid #e5e7eb;
              cursor: pointer;
              transition: all 0.2s;
            }
            .calendar-day:hover {
              background-color: #f9fafb;
            }
            .calendar-day.available {
              background-color: #ecfdf5;
            }
            .calendar-day.booked {
              background-color: #fef2f2;
            }
            .calendar-day.partially-booked {
              background-color: #fffbeb;
            }
            .time-slot {
              font-size: 0.75rem;
              padding: 2px 4px;
              margin: 1px 0;
              border-radius: 4px;
            }
            .booking-slot {
              background-color: #ef4444;
              color: white;
            }
            .available-slot {
              background-color: #10b981;
              color: white;
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
                          <span class="ml-4 text-xl text-gray-600">Calendar</span>
                      </div>
                      <div class="flex items-center space-x-4">
                          <a href="/booking/schedule" class="text-gray-700 hover:text-kwikr-green">
                              <i class="fas fa-clock mr-1"></i>Book Appointment
                          </a>
                          <a href="/booking/manage" class="text-gray-700 hover:text-kwikr-green">
                              <i class="fas fa-calendar-check mr-1"></i>Manage Bookings
                          </a>
                      </div>
                  </div>
              </div>
          </nav>

          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <!-- Worker Profile Header -->
              <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div class="flex items-center space-x-6">
                      <div class="flex-shrink-0">
                          <img class="h-20 w-20 rounded-full object-cover" 
                               src="${worker.profile_image_url || '/static/default-avatar.png'}" 
                               alt="${worker.first_name} ${worker.last_name}">
                      </div>
                      <div class="flex-1">
                          <h1 class="text-3xl font-bold text-gray-900">${worker.first_name} ${worker.last_name}</h1>
                          <p class="text-lg text-gray-600">${worker.email}</p>
                          <p class="text-gray-500 mt-2">${worker.bio || 'Professional service provider'}</p>
                      </div>
                      <div class="flex space-x-3">
                          <button onclick="bookAppointment('${workerId}')" class="bg-kwikr-green text-white px-6 py-3 rounded-lg hover:bg-green-600 font-medium">
                              <i class="fas fa-calendar-plus mr-2"></i>Book Appointment
                          </button>
                          <button onclick="viewAvailability()" class="border border-kwikr-green text-kwikr-green px-6 py-3 rounded-lg hover:bg-green-50 font-medium">
                              <i class="fas fa-eye mr-2"></i>View Availability
                          </button>
                      </div>
                  </div>
              </div>

              <!-- Calendar Controls -->
              <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div class="flex items-center justify-between">
                      <h2 class="text-2xl font-bold text-gray-900">
                          <i class="fas fa-calendar mr-2 text-kwikr-green"></i>
                          ${new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h2>
                      <div class="flex items-center space-x-4">
                          <button onclick="changeMonth(-1)" class="p-2 text-gray-600 hover:text-kwikr-green">
                              <i class="fas fa-chevron-left"></i>
                          </button>
                          <button onclick="changeMonth(1)" class="p-2 text-gray-600 hover:text-kwikr-green">
                              <i class="fas fa-chevron-right"></i>
                          </button>
                          <select onchange="viewWorker(this.value)" class="px-3 py-2 border border-gray-300 rounded-lg">
                              <option value="${workerId}">Current Worker</option>
                              <option value="2">Jennifer Lopez (Cleaning)</option>
                              <option value="3">Mike Wilson (Plumbing)</option>
                              <option value="4">David Johnson (Electrical)</option>
                          </select>
                      </div>
                  </div>
                  
                  <!-- Legend -->
                  <div class="mt-4 flex items-center space-x-6 text-sm">
                      <div class="flex items-center">
                          <div class="w-4 h-4 bg-green-200 rounded mr-2"></div>
                          <span>Available</span>
                      </div>
                      <div class="flex items-center">
                          <div class="w-4 h-4 bg-yellow-200 rounded mr-2"></div>
                          <span>Partially Booked</span>
                      </div>
                      <div class="flex items-center">
                          <div class="w-4 h-4 bg-red-200 rounded mr-2"></div>
                          <span>Fully Booked</span>
                      </div>
                      <div class="flex items-center">
                          <div class="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                          <span>Unavailable</span>
                      </div>
                  </div>
              </div>

              <!-- Calendar Grid -->
              <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                  <!-- Calendar Header -->
                  <div class="grid grid-cols-7 bg-gray-50 border-b">
                      <div class="p-4 text-center font-semibold text-gray-700">Sunday</div>
                      <div class="p-4 text-center font-semibold text-gray-700">Monday</div>
                      <div class="p-4 text-center font-semibold text-gray-700">Tuesday</div>
                      <div class="p-4 text-center font-semibold text-gray-700">Wednesday</div>
                      <div class="p-4 text-center font-semibold text-gray-700">Thursday</div>
                      <div class="p-4 text-center font-semibold text-gray-700">Friday</div>
                      <div class="p-4 text-center font-semibold text-gray-700">Saturday</div>
                  </div>
                  
                  <!-- Calendar Body -->
                  <div class="grid grid-cols-7" id="calendar-grid">
                      <!-- Calendar days will be populated by JavaScript -->
                  </div>
              </div>

              <!-- Service Information -->
              <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <!-- Weekly Availability -->
                  <div class="bg-white rounded-lg shadow-sm p-6">
                      <h3 class="text-xl font-bold text-gray-900 mb-4">
                          <i class="fas fa-clock text-kwikr-green mr-2"></i>Weekly Availability
                      </h3>
                      <div class="space-y-3">
                          ${(availability.results || []).map((slot: any) => {
                            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                            return `
                              <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                  <span class="font-medium">${dayNames[slot.day_of_week]}</span>
                                  <span class="text-gray-600">
                                      ${slot.is_available ? 
                                        `${slot.start_time} - ${slot.end_time}` + 
                                        (slot.break_start_time ? ` (Break: ${slot.break_start_time}-${slot.break_end_time})` : '') 
                                        : 'Unavailable'
                                      }
                                  </span>
                              </div>
                            `
                          }).join('')}
                      </div>
                  </div>

                  <!-- Service Categories -->
                  <div class="bg-white rounded-lg shadow-sm p-6">
                      <h3 class="text-xl font-bold text-gray-900 mb-4">
                          <i class="fas fa-tools text-kwikr-green mr-2"></i>Services & Duration
                      </h3>
                      <div class="space-y-3">
                          ${(timeSlots.results || []).map((service: any) => `
                            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <span class="font-medium block">${service.service_category}</span>
                                    <span class="text-sm text-gray-500">Max ${service.max_bookings_per_day} bookings/day</span>
                                </div>
                                <div class="text-right">
                                    <span class="font-medium text-kwikr-green">${service.duration_minutes} mins</span>
                                    <span class="text-sm text-gray-500 block">+${service.buffer_before_minutes}/${service.buffer_after_minutes}min buffer</span>
                                </div>
                            </div>
                          `).join('')}
                      </div>
                  </div>
              </div>
          </div>

          <script>
            const currentMonth = '${month}'
            const workerId = '${workerId}'
            const availability = ${JSON.stringify(availability.results || [])}
            const bookings = ${JSON.stringify(bookings.results || [])}
            const overrides = ${JSON.stringify(overrides.results || [])}

            function generateCalendar() {
              const [year, monthNum] = currentMonth.split('-').map(Number)
              const firstDay = new Date(year, monthNum - 1, 1)
              const lastDay = new Date(year, monthNum, 0)
              const startDate = new Date(firstDay)
              startDate.setDate(startDate.getDate() - firstDay.getDay())

              const calendarGrid = document.getElementById('calendar-grid')
              calendarGrid.innerHTML = ''

              for (let i = 0; i < 42; i++) {
                const currentDate = new Date(startDate)
                currentDate.setDate(startDate.getDate() + i)
                
                const dayElement = createDayElement(currentDate, monthNum)
                calendarGrid.appendChild(dayElement)
              }
            }

            function createDayElement(date, currentMonth) {
              const dayElement = document.createElement('div')
              const dateStr = date.toISOString().slice(0, 10)
              const dayOfWeek = date.getDay()
              const dayOfMonth = date.getDate()
              const isCurrentMonth = date.getMonth() + 1 === currentMonth

              dayElement.className = 'calendar-day p-2'
              if (!isCurrentMonth) {
                dayElement.classList.add('text-gray-400', 'bg-gray-50')
              }

              // Check availability for this day
              const dayAvailability = availability.find(a => a.day_of_week === dayOfWeek)
              const dayBookings = bookings.filter(b => b.booking_date === dateStr)
              const dayOverride = overrides.find(o => o.override_date === dateStr)

              // Determine day status
              let dayStatus = 'unavailable'
              if (dayOverride) {
                dayStatus = dayOverride.override_type === 'unavailable' ? 'unavailable' : 'available'
              } else if (dayAvailability && dayAvailability.is_available) {
                if (dayBookings.length === 0) {
                  dayStatus = 'available'
                } else {
                  // Check if fully booked or partially booked
                  dayStatus = dayBookings.length >= 4 ? 'booked' : 'partially-booked'
                }
              }

              if (dayStatus === 'available') dayElement.classList.add('available')
              else if (dayStatus === 'partially-booked') dayElement.classList.add('partially-booked')
              else if (dayStatus === 'booked') dayElement.classList.add('booked')

              // Day number
              const dayNumber = document.createElement('div')
              dayNumber.className = 'font-semibold text-lg mb-1'
              dayNumber.textContent = dayOfMonth

              // Bookings for the day
              const bookingsContainer = document.createElement('div')
              bookingsContainer.className = 'space-y-1'
              
              dayBookings.forEach(booking => {
                const bookingElement = document.createElement('div')
                bookingElement.className = 'time-slot booking-slot'
                bookingElement.textContent = \`\${booking.start_time.slice(0,5)} \${booking.service_category.slice(0,8)}\`
                bookingElement.title = \`\${booking.client_name} - \${booking.service_category}\`
                bookingsContainer.appendChild(bookingElement)
              })

              dayElement.appendChild(dayNumber)
              dayElement.appendChild(bookingsContainer)

              // Click handler
              dayElement.addEventListener('click', () => {
                if (isCurrentMonth && dayStatus !== 'unavailable') {
                  showDayDetails(dateStr, dayAvailability, dayBookings, dayOverride)
                }
              })

              return dayElement
            }

            function showDayDetails(date, availability, bookings, override) {
              const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })

              alert(\`Day Details: \${formattedDate}\\n\\nBookings: \${bookings.length}\\nAvailability: \${availability ? 'Available' : 'Not available'}\\n\\nClick "Book Appointment" to schedule a new appointment.\`)
            }

            function changeMonth(delta) {
              const [year, month] = currentMonth.split('-').map(Number)
              const newDate = new Date(year, month - 1 + delta, 1)
              const newMonth = newDate.toISOString().slice(0, 7)
              window.location.href = \`/booking/calendar/\${workerId}?month=\${newMonth}\`
            }

            function viewWorker(newWorkerId) {
              if (newWorkerId !== workerId) {
                window.location.href = \`/booking/calendar/\${newWorkerId}?month=\${currentMonth}\`
              }
            }

            function bookAppointment(workerId) {
              window.location.href = \`/booking/schedule?worker=\${workerId}\`
            }

            function viewAvailability() {
              alert('Availability details shown in the sidebar. Use the calendar to see specific dates and times.')
            }

            // Initialize calendar
            generateCalendar()
          </script>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading calendar:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load calendar</p>
          <a href="/booking/calendar" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Try Again</a>
        </div>
      </div>
    `, 500)
  }
})

// ============================================================================
// FEATURE 2: Appointment Booking - Clients book time slots
// ============================================================================

// Booking form interface
bookingRoutes.get('/schedule', async (c) => {
  try {
    const db = c.env.DB
    const selectedWorker = c.req.query('worker')
    const selectedDate = c.req.query('date') || new Date().toISOString().slice(0, 10)
    
    // Get available workers
    const workersResult = await db.prepare(`
      SELECT u.id, u.first_name, u.last_name, u.email, p.profile_image_url
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.role = 'worker' AND u.is_active = 1
      ORDER BY u.first_name, u.last_name
    `).all()

    const workers = workersResult.results || []

    // Get service categories
    const servicesResult = await db.prepare(`
      SELECT DISTINCT service_category, duration_minutes 
      FROM service_time_slots 
      ORDER BY service_category
    `).all()

    const services = servicesResult.results || []

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Book Appointment - Kwikr</title>
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
                          <span class="ml-4 text-xl text-gray-600">Book Appointment</span>
                      </div>
                      <div class="flex items-center space-x-4">
                          <a href="/booking/calendar" class="text-gray-700 hover:text-kwikr-green">
                              <i class="fas fa-calendar mr-1"></i>View Calendar
                          </a>
                          <a href="/booking/manage" class="text-gray-700 hover:text-kwikr-green">
                              <i class="fas fa-list mr-1"></i>My Bookings
                          </a>
                      </div>
                  </div>
              </div>
          </nav>

          <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div class="bg-white rounded-lg shadow-sm p-8">
                  <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">
                      <i class="fas fa-calendar-plus text-kwikr-green mr-3"></i>
                      Book Your Appointment
                  </h1>

                  <form id="bookingForm" class="space-y-8">
                      <!-- Step 1: Service Selection -->
                      <div class="bg-gray-50 p-6 rounded-lg">
                          <h2 class="text-xl font-semibold text-gray-900 mb-4">
                              <span class="bg-kwikr-green text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">1</span>
                              Select Service
                          </h2>
                          
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
                                  <select id="serviceCategory" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green" onchange="updateServiceDetails()">
                                      <option value="">Choose a service...</option>
                                      ${services.map((service: any) => `
                                        <option value="${service.service_category}" data-duration="${service.duration_minutes}">
                                          ${service.service_category} (${service.duration_minutes} mins)
                                        </option>
                                      `).join('')}
                                  </select>
                              </div>

                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Service Provider</label>
                                  <select id="serviceProvider" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green" onchange="loadAvailableSlots()">
                                      <option value="">Choose a provider...</option>
                                      ${workers.map((worker: any) => `
                                        <option value="${worker.id}" ${selectedWorker === worker.id.toString() ? 'selected' : ''}>
                                          ${worker.first_name} ${worker.last_name}
                                        </option>
                                      `).join('')}
                                  </select>
                              </div>
                          </div>

                          <div class="mt-4">
                              <label class="block text-sm font-medium text-gray-700 mb-2">Service Description</label>
                              <textarea id="serviceDescription" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green" 
                                        placeholder="Describe what you need done..."></textarea>
                          </div>
                      </div>

                      <!-- Step 2: Date & Time Selection -->
                      <div class="bg-gray-50 p-6 rounded-lg">
                          <h2 class="text-xl font-semibold text-gray-900 mb-4">
                              <span class="bg-kwikr-green text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">2</span>
                              Choose Date & Time
                          </h2>
                          
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                                  <input type="date" id="bookingDate" value="${selectedDate}" required 
                                         min="${new Date().toISOString().slice(0, 10)}" 
                                         max="${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}"
                                         class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green"
                                         onchange="loadAvailableSlots()">
                              </div>

                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                                  <div id="timeSlots" class="grid grid-cols-2 gap-2 min-h-[120px] p-3 border border-gray-300 rounded-lg bg-white">
                                      <div class="col-span-2 text-center text-gray-500 py-8">
                                          Select a service and provider first
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- Step 3: Client Information -->
                      <div class="bg-gray-50 p-6 rounded-lg">
                          <h2 class="text-xl font-semibold text-gray-900 mb-4">
                              <span class="bg-kwikr-green text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">3</span>
                              Your Information
                          </h2>
                          
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                  <input type="text" id="clientName" required 
                                         class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green"
                                         placeholder="Your full name">
                              </div>

                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                  <input type="email" id="clientEmail" required 
                                         class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green"
                                         placeholder="your.email@example.com">
                              </div>

                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                  <input type="tel" id="clientPhone" 
                                         class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green"
                                         placeholder="+1 (416) 555-0100">
                              </div>

                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                                  <select id="clientTimezone" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green">
                                      <option value="America/Toronto">Eastern Time (Toronto)</option>
                                      <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                                      <option value="America/Halifax">Atlantic Time (Halifax)</option>
                                      <option value="America/Winnipeg">Central Time (Winnipeg)</option>
                                  </select>
                              </div>
                          </div>

                          <div class="mt-4">
                              <label class="block text-sm font-medium text-gray-700 mb-2">Service Address</label>
                              <textarea id="clientAddress" rows="2" 
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green" 
                                        placeholder="Street address where service will be provided"></textarea>
                          </div>

                          <div class="mt-4">
                              <label class="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                              <textarea id="specialInstructions" rows="3" 
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-kwikr-green focus:border-kwikr-green" 
                                        placeholder="Any special requirements, access instructions, or notes for the service provider..."></textarea>
                          </div>
                      </div>

                      <!-- Booking Summary & Submit -->
                      <div class="bg-kwikr-green bg-opacity-10 p-6 rounded-lg">
                          <h2 class="text-xl font-semibold text-gray-900 mb-4">
                              <i class="fas fa-receipt text-kwikr-green mr-2"></i>
                              Booking Summary
                          </h2>
                          
                          <div id="bookingSummary" class="space-y-2 text-gray-700 mb-6">
                              <div id="summaryService" class="hidden">
                                  <strong>Service:</strong> <span></span>
                              </div>
                              <div id="summaryProvider" class="hidden">
                                  <strong>Provider:</strong> <span></span>
                              </div>
                              <div id="summaryDateTime" class="hidden">
                                  <strong>Date & Time:</strong> <span></span>
                              </div>
                              <div id="summaryDuration" class="hidden">
                                  <strong>Duration:</strong> <span></span>
                              </div>
                              <div id="summaryCost" class="hidden">
                                  <strong>Estimated Cost:</strong> <span class="text-kwikr-green font-semibold"></span>
                              </div>
                          </div>

                          <div class="flex items-center space-x-4">
                              <button type="submit" id="submitBooking" disabled 
                                      class="flex-1 bg-kwikr-green text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                                  <i class="fas fa-calendar-check mr-2"></i>
                                  Book Appointment
                              </button>
                              
                              <label class="flex items-center">
                                  <input type="checkbox" id="recurringBooking" class="mr-2">
                                  <span class="text-sm text-gray-600">Make this a recurring appointment</span>
                              </label>
                          </div>
                      </div>
                  </form>
              </div>
          </div>

          <script src="/static/booking.js"></script>
          <script>
            // Global variables
            let selectedTimeSlot = null
            let selectedDuration = 0
            let selectedCost = 0

            // Update service details when service category changes
            function updateServiceDetails() {
              const select = document.getElementById('serviceCategory')
              const option = select.options[select.selectedIndex]
              
              if (option.value) {
                selectedDuration = parseInt(option.dataset.duration) || 0
                selectedCost = parseFloat(option.dataset.cost) || 0
                updateBookingSummary()
                loadAvailableSlots()
              }
            }

            // Load available time slots
            async function loadAvailableSlots() {
              const serviceCategory = document.getElementById('serviceCategory').value
              const serviceProvider = document.getElementById('serviceProvider').value
              const bookingDate = document.getElementById('bookingDate').value

              const timeSlotsContainer = document.getElementById('timeSlots')

              if (!serviceCategory || !serviceProvider || !bookingDate) {
                timeSlotsContainer.innerHTML = '<div class="col-span-2 text-center text-gray-500 py-8">Please select service, provider, and date</div>'
                return
              }

              timeSlotsContainer.innerHTML = '<div class="col-span-2 text-center text-gray-500 py-8">Loading available slots...</div>'

              try {
                const response = await fetch(\`/booking/api/available-slots?worker=\${serviceProvider}&date=\${bookingDate}&service=\${encodeURIComponent(serviceCategory)}\`)
                const data = await response.json()

                if (data.success && data.slots.length > 0) {
                  timeSlotsContainer.innerHTML = data.slots.map(slot => \`
                    <button type="button" class="time-slot-btn p-3 text-center border border-gray-300 rounded-lg hover:border-kwikr-green hover:bg-green-50 transition-colors \${slot.available ? '' : 'opacity-50 cursor-not-allowed'}" 
                            onclick="selectTimeSlot('\${slot.start_time}', '\${slot.end_time}')" 
                            \${slot.available ? '' : 'disabled'}>
                      <div class="font-medium">\${slot.start_time}</div>
                      <div class="text-sm text-gray-500">\${slot.duration}min</div>
                    </button>
                  \`).join('')
                } else {
                  timeSlotsContainer.innerHTML = '<div class="col-span-2 text-center text-gray-500 py-8">No available slots for this date</div>'
                }
              } catch (error) {
                console.error('Error loading slots:', error)
                timeSlotsContainer.innerHTML = '<div class="col-span-2 text-center text-red-500 py-8">Error loading available slots</div>'
              }
            }

            // Select a time slot
            function selectTimeSlot(startTime, endTime) {
              // Remove previous selection
              document.querySelectorAll('.time-slot-btn').forEach(btn => {
                btn.classList.remove('border-kwikr-green', 'bg-green-100', 'selected')
              })

              // Mark new selection
              event.target.closest('.time-slot-btn').classList.add('border-kwikr-green', 'bg-green-100', 'selected')
              
              selectedTimeSlot = { start: startTime, end: endTime }
              updateBookingSummary()
            }

            // Update booking summary
            function updateBookingSummary() {
              const serviceCategory = document.getElementById('serviceCategory').value
              const serviceProvider = document.getElementById('serviceProvider')
              const bookingDate = document.getElementById('bookingDate').value

              // Service
              const summaryService = document.getElementById('summaryService')
              if (serviceCategory) {
                summaryService.querySelector('span').textContent = serviceCategory
                summaryService.classList.remove('hidden')
              } else {
                summaryService.classList.add('hidden')
              }

              // Provider
              const summaryProvider = document.getElementById('summaryProvider')
              if (serviceProvider.value) {
                summaryProvider.querySelector('span').textContent = serviceProvider.options[serviceProvider.selectedIndex].text
                summaryProvider.classList.remove('hidden')
              } else {
                summaryProvider.classList.add('hidden')
              }

              // Date & Time
              const summaryDateTime = document.getElementById('summaryDateTime')
              if (bookingDate && selectedTimeSlot) {
                const formattedDate = new Date(bookingDate + 'T00:00:00').toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })
                summaryDateTime.querySelector('span').textContent = \`\${formattedDate} at \${selectedTimeSlot.start}\`
                summaryDateTime.classList.remove('hidden')
              } else {
                summaryDateTime.classList.add('hidden')
              }

              // Duration
              const summaryDuration = document.getElementById('summaryDuration')
              if (selectedDuration > 0) {
                const hours = Math.floor(selectedDuration / 60)
                const minutes = selectedDuration % 60
                const durationText = hours > 0 ? \`\${hours}h \${minutes}min\` : \`\${minutes} minutes\`
                summaryDuration.querySelector('span').textContent = durationText
                summaryDuration.classList.remove('hidden')
              } else {
                summaryDuration.classList.add('hidden')
              }

              // Cost
              const summaryCost = document.getElementById('summaryCost')
              if (selectedCost > 0) {
                summaryCost.querySelector('span').textContent = \`$\${selectedCost.toFixed(2)}\`
                summaryCost.classList.remove('hidden')
              } else {
                summaryCost.classList.add('hidden')
              }

              // Enable/disable submit button
              const submitBtn = document.getElementById('submitBooking')
              const isComplete = serviceCategory && serviceProvider.value && bookingDate && selectedTimeSlot && 
                               document.getElementById('clientName').value && document.getElementById('clientEmail').value
              
              submitBtn.disabled = !isComplete
            }

            // Form validation
            document.addEventListener('input', updateBookingSummary)

            // Form submission
            document.getElementById('bookingForm').addEventListener('submit', async (e) => {
              e.preventDefault()
              
              const submitBtn = document.getElementById('submitBooking')
              const originalText = submitBtn.innerHTML
              submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...'
              submitBtn.disabled = true

              try {
                const formData = {
                  user_id: parseInt(document.getElementById('serviceProvider').value),
                  service_category: document.getElementById('serviceCategory').value,
                  booking_date: document.getElementById('bookingDate').value,
                  start_time: selectedTimeSlot.start,
                  end_time: selectedTimeSlot.end,
                  duration_minutes: selectedDuration,
                  client_name: document.getElementById('clientName').value,
                  client_email: document.getElementById('clientEmail').value,
                  client_phone: document.getElementById('clientPhone').value,
                  client_address: document.getElementById('clientAddress').value,
                  client_timezone: document.getElementById('clientTimezone').value,
                  service_description: document.getElementById('serviceDescription').value,
                  special_instructions: document.getElementById('specialInstructions').value,
                  estimated_cost: selectedCost,
                  is_recurring: document.getElementById('recurringBooking').checked,
                  booking_source: 'web'
                }

                const response = await fetch('/booking/api/book', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formData)
                })

                const result = await response.json()

                if (result.success) {
                  alert('Booking successful! You will receive a confirmation email shortly.')
                  window.location.href = \`/booking/confirmation/\${result.booking.id}\`
                } else {
                  throw new Error(result.error || 'Booking failed')
                }
              } catch (error) {
                console.error('Booking error:', error)
                alert('Booking failed: ' + error.message)
              } finally {
                submitBtn.innerHTML = originalText
                submitBtn.disabled = false
              }
            })

            // Initialize
            if (document.getElementById('serviceProvider').value) {
              loadAvailableSlots()
            }
          </script>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading booking form:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load booking form</p>
          <a href="/booking/calendar" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Back to Calendar</a>
        </div>
      </div>
    `, 500)
  }
})

// Import and mount API routes
import { bookingApiRoutes } from './booking-api'
bookingRoutes.route('/', bookingApiRoutes)

// ============================================================================
// FEATURE 3: Booking Confirmation - Pages
// ============================================================================

// Booking confirmation page
bookingRoutes.get('/confirmation/:bookingId', async (c) => {
  try {
    const db = c.env.DB
    const bookingId = c.req.param('bookingId')

    const booking = await db.prepare(`
      SELECT b.*, u.first_name as worker_first_name, u.last_name as worker_last_name, u.email as worker_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `).bind(bookingId).first()

    if (!booking) {
      return c.html(`
        <div class="min-h-screen bg-gray-100 flex items-center justify-center">
          <div class="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 class="text-2xl font-bold text-red-600 mb-4">Booking Not Found</h2>
            <p class="text-gray-600 mb-4">The requested booking could not be found.</p>
            <a href="/booking/schedule" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Book New Appointment</a>
          </div>
        </div>
      `, 404)
    }

    const formattedDate = new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation - Kwikr</title>
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
                          <span class="ml-4 text-xl text-gray-600">Booking Confirmed</span>
                      </div>
                      <div class="flex items-center space-x-4">
                          <a href="/booking/manage" class="text-gray-700 hover:text-kwikr-green">
                              <i class="fas fa-list mr-1"></i>My Bookings
                          </a>
                      </div>
                  </div>
              </div>
          </nav>

          <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <!-- Success Message -->
              <div class="text-center mb-12">
                  <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                      <i class="fas fa-check text-2xl text-green-600"></i>
                  </div>
                  <h1 class="text-4xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
                  <p class="text-xl text-gray-600">Your appointment has been successfully scheduled</p>
              </div>

              <!-- Booking Details Card -->
              <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div class="bg-kwikr-green text-white p-6">
                      <h2 class="text-2xl font-bold mb-2">Booking Details</h2>
                      <p class="text-green-100">Confirmation #${booking.id}</p>
                  </div>

                  <div class="p-8">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <!-- Service Information -->
                          <div>
                              <h3 class="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
                              <div class="space-y-3">
                                  <div class="flex justify-between">
                                      <span class="text-gray-600">Service:</span>
                                      <span class="font-medium">${booking.service_category}</span>
                                  </div>
                                  <div class="flex justify-between">
                                      <span class="text-gray-600">Duration:</span>
                                      <span class="font-medium">${booking.duration_minutes} minutes</span>
                                  </div>
                                  <div class="flex justify-between">
                                      <span class="text-gray-600">Date:</span>
                                      <span class="font-medium">${formattedDate}</span>
                                  </div>
                                  <div class="flex justify-between">
                                      <span class="text-gray-600">Time:</span>
                                      <span class="font-medium">${booking.start_time.slice(0,5)} - ${booking.end_time.slice(0,5)}</span>
                                  </div>
                                  ${booking.estimated_cost ? `
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Estimated Cost:</span>
                                        <span class="font-medium text-kwikr-green">$${parseFloat(booking.estimated_cost).toFixed(2)}</span>
                                    </div>
                                  ` : ''}
                              </div>
                          </div>

                          <!-- Provider Information -->
                          <div>
                              <h3 class="text-lg font-semibold text-gray-900 mb-4">Service Provider</h3>
                              <div class="space-y-3">
                                  <div class="flex justify-between">
                                      <span class="text-gray-600">Name:</span>
                                      <span class="font-medium">${booking.worker_first_name} ${booking.worker_last_name}</span>
                                  </div>
                                  <div class="flex justify-between">
                                      <span class="text-gray-600">Email:</span>
                                      <span class="font-medium">${booking.worker_email}</span>
                                  </div>
                                  <div class="flex justify-between">
                                      <span class="text-gray-600">Status:</span>
                                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }">
                                          ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- Service Description -->
                      ${booking.service_description || booking.special_instructions ? `
                        <div class="mt-8 pt-8 border-t border-gray-200">
                            ${booking.service_description ? `
                              <div class="mb-4">
                                  <h4 class="font-semibold text-gray-900 mb-2">Service Description:</h4>
                                  <p class="text-gray-600">${booking.service_description}</p>
                              </div>
                            ` : ''}
                            ${booking.special_instructions ? `
                              <div>
                                  <h4 class="font-semibold text-gray-900 mb-2">Special Instructions:</h4>
                                  <p class="text-gray-600">${booking.special_instructions}</p>
                              </div>
                            ` : ''}
                        </div>
                      ` : ''}

                      <!-- Client Information -->
                      <div class="mt-8 pt-8 border-t border-gray-200">
                          <h3 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <span class="text-gray-600">Name:</span>
                                  <span class="font-medium ml-2">${booking.client_name}</span>
                              </div>
                              <div>
                                  <span class="text-gray-600">Email:</span>
                                  <span class="font-medium ml-2">${booking.client_email}</span>
                              </div>
                              ${booking.client_phone ? `
                                <div>
                                    <span class="text-gray-600">Phone:</span>
                                    <span class="font-medium ml-2">${booking.client_phone}</span>
                                </div>
                              ` : ''}
                              <div>
                                  <span class="text-gray-600">Timezone:</span>
                                  <span class="font-medium ml-2">${booking.client_timezone}</span>
                              </div>
                          </div>
                          ${booking.client_address ? `
                            <div class="mt-4">
                                <span class="text-gray-600">Service Address:</span>
                                <p class="font-medium mt-1">${booking.client_address}</p>
                            </div>
                          ` : ''}
                      </div>

                      <!-- Action Buttons -->
                      <div class="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                          <button onclick="rescheduleBooking(${booking.id})" class="flex-1 bg-yellow-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                              <i class="fas fa-calendar-alt mr-2"></i>Reschedule
                          </button>
                          <button onclick="cancelBooking(${booking.id})" class="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-colors">
                              <i class="fas fa-times mr-2"></i>Cancel Booking
                          </button>
                          <a href="/booking/manage" class="flex-1 bg-kwikr-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors text-center">
                              <i class="fas fa-list mr-2"></i>View All Bookings
                          </a>
                      </div>

                      <!-- Important Information -->
                      <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 class="font-semibold text-blue-900 mb-2">
                              <i class="fas fa-info-circle mr-2"></i>Important Information
                          </h4>
                          <ul class="text-blue-800 text-sm space-y-1">
                              <li>• You will receive email confirmation and reminders</li>
                              <li>• Please be available at the scheduled time</li>
                              <li>• Contact the service provider if you need to make changes</li>
                              <li>• Cancellation policies may apply for short-notice changes</li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>

          <script>
            function rescheduleBooking(bookingId) {
              if (confirm('Would you like to reschedule this booking?')) {
                window.location.href = '/booking/reschedule/' + bookingId
              }
            }

            function cancelBooking(bookingId) {
              if (confirm('Are you sure you want to cancel this booking? Cancellation fees may apply.')) {
                window.location.href = '/booking/cancel/' + bookingId
              }
            }
          </script>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading booking confirmation:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load booking confirmation</p>
          <a href="/booking/schedule" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Book New Appointment</a>
        </div>
      </div>
    `, 500)
  }
})

// ============================================================================
// FEATURE 4: Reschedule/Cancel - Pages
// ============================================================================

// Booking management page
bookingRoutes.get('/manage', async (c) => {
  try {
    const db = c.env.DB
    const currentUserId = 1 // Get from session in production

    // Get user's bookings
    const bookings = await db.prepare(`
      SELECT b.*, u.first_name as worker_first_name, u.last_name as worker_last_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.client_id = ?
      ORDER BY b.booking_date DESC, b.start_time DESC
    `).bind(currentUserId).all()

    // Get recurring bookings
    const recurringBookings = await db.prepare(`
      SELECT rb.*, u.first_name as worker_first_name, u.last_name as worker_last_name
      FROM recurring_bookings rb
      JOIN users u ON rb.user_id = u.id
      WHERE rb.client_id = ?
      ORDER BY rb.created_at DESC
    `).bind(currentUserId).all()

    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Manage Bookings - Kwikr</title>
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
                          <span class="ml-4 text-xl text-gray-600">My Bookings</span>
                      </div>
                      <div class="flex items-center space-x-4">
                          <a href="/booking/schedule" class="bg-kwikr-green text-white px-4 py-2 rounded-lg hover:bg-green-600">
                              <i class="fas fa-plus mr-1"></i>New Booking
                          </a>
                      </div>
                  </div>
              </div>
          </nav>

          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <!-- Booking Stats -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div class="bg-white rounded-lg shadow-sm p-6">
                      <div class="flex items-center">
                          <div class="flex-shrink-0">
                              <i class="fas fa-calendar-check text-2xl text-blue-600"></i>
                          </div>
                          <div class="ml-4">
                              <div class="text-2xl font-bold text-gray-900">${(bookings.results || []).filter((b: any) => b.status === 'confirmed').length}</div>
                              <div class="text-gray-600">Confirmed</div>
                          </div>
                      </div>
                  </div>
                  
                  <div class="bg-white rounded-lg shadow-sm p-6">
                      <div class="flex items-center">
                          <div class="flex-shrink-0">
                              <i class="fas fa-clock text-2xl text-yellow-600"></i>
                          </div>
                          <div class="ml-4">
                              <div class="text-2xl font-bold text-gray-900">${(bookings.results || []).filter((b: any) => b.status === 'pending').length}</div>
                              <div class="text-gray-600">Pending</div>
                          </div>
                      </div>
                  </div>
                  
                  <div class="bg-white rounded-lg shadow-sm p-6">
                      <div class="flex items-center">
                          <div class="flex-shrink-0">
                              <i class="fas fa-check-circle text-2xl text-green-600"></i>
                          </div>
                          <div class="ml-4">
                              <div class="text-2xl font-bold text-gray-900">${(bookings.results || []).filter((b: any) => b.status === 'completed').length}</div>
                              <div class="text-gray-600">Completed</div>
                          </div>
                      </div>
                  </div>
                  
                  <div class="bg-white rounded-lg shadow-sm p-6">
                      <div class="flex items-center">
                          <div class="flex-shrink-0">
                              <i class="fas fa-redo text-2xl text-purple-600"></i>
                          </div>
                          <div class="ml-4">
                              <div class="text-2xl font-bold text-gray-900">${(recurringBookings.results || []).filter((rb: any) => rb.status === 'active').length}</div>
                              <div class="text-gray-600">Recurring</div>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Bookings List -->
              <div class="bg-white rounded-lg shadow-sm">
                  <div class="p-6 border-b border-gray-200">
                      <div class="flex items-center justify-between">
                          <h2 class="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                          <div class="flex items-center space-x-3">
                              <select class="px-3 py-2 border border-gray-300 rounded-lg">
                                  <option value="all">All Statuses</option>
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                              </select>
                              <button class="text-gray-600 hover:text-gray-900">
                                  <i class="fas fa-filter"></i>
                              </button>
                          </div>
                      </div>
                  </div>

                  <div class="divide-y divide-gray-200">
                      ${(bookings.results || []).length > 0 ? (bookings.results || []).map((booking: any) => {
                        const statusColors = {
                          'pending': 'bg-yellow-100 text-yellow-800',
                          'confirmed': 'bg-green-100 text-green-800',
                          'completed': 'bg-blue-100 text-blue-800',
                          'cancelled': 'bg-red-100 text-red-800'
                        }
                        
                        const statusColor = statusColors[booking.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                        const bookingDate = new Date(booking.booking_date + 'T00:00:00').toLocaleDateString()
                        const canModify = booking.status === 'pending' || booking.status === 'confirmed'

                        return `
                          <div class="p-6 hover:bg-gray-50">
                              <div class="flex items-center justify-between">
                                  <div class="flex-1">
                                      <div class="flex items-center space-x-3 mb-2">
                                          <h3 class="text-lg font-medium text-gray-900">${booking.service_category}</h3>
                                          <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColor}">
                                              ${booking.status.toUpperCase()}
                                          </span>
                                      </div>
                                      <p class="text-gray-600 mb-3">with ${booking.worker_first_name} ${booking.worker_last_name}</p>
                                      <div class="flex items-center space-x-6 text-sm text-gray-500">
                                          <span><i class="fas fa-calendar mr-1"></i>${bookingDate}</span>
                                          <span><i class="fas fa-clock mr-1"></i>${booking.start_time.slice(0,5)} - ${booking.end_time.slice(0,5)}</span>
                                          <span><i class="fas fa-hourglass-half mr-1"></i>${booking.duration_minutes} mins</span>
                                          ${booking.estimated_cost ? `<span><i class="fas fa-dollar-sign mr-1"></i>$${parseFloat(booking.estimated_cost).toFixed(2)}</span>` : ''}
                                      </div>
                                  </div>
                                  
                                  <div class="flex items-center space-x-2 ml-4">
                                      <button onclick="viewBooking(${booking.id})" class="text-blue-600 hover:text-blue-800">
                                          <i class="fas fa-eye" title="View Details"></i>
                                      </button>
                                      ${canModify ? `
                                          <button onclick="rescheduleBooking(${booking.id})" class="text-yellow-600 hover:text-yellow-800">
                                              <i class="fas fa-calendar-alt" title="Reschedule"></i>
                                          </button>
                                          <button onclick="cancelBooking(${booking.id})" class="text-red-600 hover:text-red-800">
                                              <i class="fas fa-times" title="Cancel"></i>
                                          </button>
                                      ` : ''}
                                  </div>
                              </div>
                          </div>
                        `
                      }).join('') : `
                        <div class="p-12 text-center text-gray-500">
                            <i class="fas fa-calendar text-5xl mb-4"></i>
                            <h3 class="text-xl font-medium mb-2">No bookings yet</h3>
                            <p class="mb-4">Book your first appointment to get started</p>
                            <a href="/booking/schedule" class="bg-kwikr-green text-white px-6 py-2 rounded-lg hover:bg-green-600">
                                <i class="fas fa-plus mr-2"></i>Book Appointment
                            </a>
                        </div>
                      `}
                  </div>
              </div>

              <!-- Recurring Bookings Section -->
              ${(recurringBookings.results || []).length > 0 ? `
                <div class="mt-8 bg-white rounded-lg shadow-sm">
                    <div class="p-6 border-b border-gray-200">
                        <h2 class="text-lg font-semibold text-gray-900">Recurring Bookings</h2>
                    </div>
                    <div class="divide-y divide-gray-200">
                        ${(recurringBookings.results || []).map((recurring: any) => `
                          <div class="p-6 hover:bg-gray-50">
                              <div class="flex items-center justify-between">
                                  <div class="flex-1">
                                      <h3 class="text-lg font-medium text-gray-900">${recurring.service_category}</h3>
                                      <p class="text-gray-600 mb-2">with ${recurring.worker_first_name} ${recurring.worker_last_name}</p>
                                      <div class="flex items-center space-x-6 text-sm text-gray-500">
                                          <span><i class="fas fa-redo mr-1"></i>${recurring.pattern_type} pattern</span>
                                          <span><i class="fas fa-calendar-check mr-1"></i>Every ${recurring.frequency} ${recurring.pattern_type}(s)</span>
                                          <span><i class="fas fa-clock mr-1"></i>${recurring.start_time.slice(0,5)}</span>
                                          <span class="px-2 py-1 text-xs font-medium rounded-full ${recurring.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                              ${recurring.status.toUpperCase()}
                                          </span>
                                      </div>
                                  </div>
                                  <div class="flex items-center space-x-2 ml-4">
                                      <button onclick="viewRecurringBooking(${recurring.id})" class="text-blue-600 hover:text-blue-800">
                                          <i class="fas fa-eye" title="View Pattern"></i>
                                      </button>
                                      ${recurring.status === 'active' ? `
                                          <button onclick="pauseRecurringBooking(${recurring.id})" class="text-yellow-600 hover:text-yellow-800">
                                              <i class="fas fa-pause" title="Pause"></i>
                                          </button>
                                          <button onclick="cancelRecurringBooking(${recurring.id})" class="text-red-600 hover:text-red-800">
                                              <i class="fas fa-stop" title="Cancel Pattern"></i>
                                          </button>
                                      ` : ''}
                                  </div>
                              </div>
                          </div>
                        `).join('')}
                    </div>
                </div>
              ` : ''}
          </div>

          <script>
            function viewBooking(bookingId) {
              window.location.href = '/booking/confirmation/' + bookingId
            }

            function rescheduleBooking(bookingId) {
              window.location.href = '/booking/reschedule/' + bookingId
            }

            function cancelBooking(bookingId) {
              if (confirm('Are you sure you want to cancel this booking? Cancellation fees may apply.')) {
                window.location.href = '/booking/cancel/' + bookingId
              }
            }

            function viewRecurringBooking(recurringId) {
              window.location.href = '/booking/recurring/' + recurringId
            }

            function pauseRecurringBooking(recurringId) {
              if (confirm('Pause this recurring booking pattern?')) {
                // API call to pause recurring booking
                console.log('Pause recurring booking:', recurringId)
              }
            }

            function cancelRecurringBooking(recurringId) {
              if (confirm('Cancel this recurring booking pattern? This will stop all future bookings.')) {
                // API call to cancel recurring booking
                console.log('Cancel recurring booking:', recurringId)
              }
            }
          </script>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading booking management:', error)
    return c.html(`
      <div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p class="text-gray-600 mb-4">Failed to load booking management</p>
          <a href="/booking/schedule" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Book Appointment</a>
        </div>
      </div>
    `, 500)
  }
})

export { bookingRoutes }