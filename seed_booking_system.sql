-- Sample Booking & Scheduling Data for Testing

-- Sample timezone definitions
INSERT OR IGNORE INTO timezone_definitions (timezone_code, timezone_name, country_code, region, utc_offset_standard, utc_offset_dst, dst_start_rule, dst_end_rule, is_active) VALUES
('America/Toronto', 'Eastern Time', 'CA', 'Ontario', -300, -240, '2nd Sunday March', '1st Sunday November', 1),
('America/Vancouver', 'Pacific Time', 'CA', 'British Columbia', -480, -420, '2nd Sunday March', '1st Sunday November', 1),
('America/Halifax', 'Atlantic Time', 'CA', 'Nova Scotia', -240, -180, '2nd Sunday March', '1st Sunday November', 1),
('America/Winnipeg', 'Central Time', 'CA', 'Manitoba', -360, -300, '2nd Sunday March', '1st Sunday November', 1);

-- Sample user timezone preferences
INSERT OR IGNORE INTO user_timezone_preferences (user_id, timezone, auto_detect_timezone, display_format_24h) VALUES
(1, 'America/Toronto', 1, 0),  -- Demo Client
(2, 'America/Toronto', 1, 0),  -- Jennifer Lopez (Worker)
(3, 'America/Vancouver', 1, 1), -- Mike Wilson (Worker)
(4, 'America/Halifax', 1, 0);   -- David Johnson (Worker)

-- Sample worker availability (weekly schedules)
-- Jennifer Lopez (Cleaning Services) - user_id: 2
INSERT OR IGNORE INTO worker_availability (user_id, day_of_week, start_time, end_time, is_available, break_start_time, break_end_time) VALUES
(2, 1, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Monday
(2, 2, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Tuesday
(2, 3, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Wednesday
(2, 4, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Thursday
(2, 5, '08:00:00', '15:00:00', 1, '12:00:00', '13:00:00'), -- Friday
(2, 6, '09:00:00', '14:00:00', 1, NULL, NULL); -- Saturday

-- Mike Wilson (Plumbing) - user_id: 3
INSERT OR IGNORE INTO worker_availability (user_id, day_of_week, start_time, end_time, is_available, break_start_time, break_end_time) VALUES
(3, 1, '07:00:00', '18:00:00', 1, '12:00:00', '13:00:00'), -- Monday
(3, 2, '07:00:00', '18:00:00', 1, '12:00:00', '13:00:00'), -- Tuesday
(3, 3, '07:00:00', '18:00:00', 1, '12:00:00', '13:00:00'), -- Wednesday
(3, 4, '07:00:00', '18:00:00', 1, '12:00:00', '13:00:00'), -- Thursday
(3, 5, '07:00:00', '18:00:00', 1, '12:00:00', '13:00:00'), -- Friday
(3, 6, '08:00:00', '16:00:00', 1, NULL, NULL), -- Saturday (Emergency only)
(3, 0, '08:00:00', '16:00:00', 1, NULL, NULL); -- Sunday (Emergency only)

-- David Johnson (Electrical) - user_id: 4
INSERT OR IGNORE INTO worker_availability (user_id, day_of_week, start_time, end_time, is_available, break_start_time, break_end_time) VALUES
(4, 1, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Monday
(4, 2, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Tuesday
(4, 3, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Wednesday
(4, 4, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Thursday
(4, 5, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'); -- Friday

-- Sample availability overrides (holidays and special dates)
INSERT OR IGNORE INTO availability_overrides (user_id, override_date, override_type, start_time, end_time, reason) VALUES
(2, '2024-12-25', 'unavailable', NULL, NULL, 'Christmas Day'),
(2, '2024-01-01', 'unavailable', NULL, NULL, 'New Year Day'),
(2, '2024-07-01', 'custom_hours', '10:00:00', '14:00:00', 'Canada Day - Limited Hours'),
(3, '2024-12-25', 'unavailable', NULL, NULL, 'Christmas Day'),
(3, '2024-01-01', 'unavailable', NULL, NULL, 'New Year Day'),
(4, '2024-12-25', 'unavailable', NULL, NULL, 'Christmas Day'),
(4, '2024-01-01', 'unavailable', NULL, NULL, 'New Year Day');

-- Sample service time slot configurations
INSERT OR IGNORE INTO service_time_slots (user_id, service_category, duration_minutes, buffer_before_minutes, buffer_after_minutes, max_bookings_per_day, advance_booking_days, same_day_booking) VALUES
(2, 'House Cleaning', 120, 15, 15, 4, 14, 0), -- 2 hours for house cleaning
(2, 'Office Cleaning', 180, 30, 15, 3, 21, 0), -- 3 hours for office cleaning
(2, 'Deep Cleaning', 240, 30, 30, 2, 7, 0),   -- 4 hours for deep cleaning
(3, 'Plumbing Repair', 90, 15, 15, 6, 7, 1),  -- 1.5 hours for repairs
(3, 'Plumbing Installation', 180, 30, 30, 3, 14, 0), -- 3 hours for installations
(3, 'Emergency Plumbing', 60, 0, 15, 8, 1, 1), -- 1 hour for emergency
(4, 'Electrical Repair', 120, 15, 15, 4, 7, 1), -- 2 hours for repairs
(4, 'Electrical Installation', 240, 30, 30, 2, 14, 0), -- 4 hours for installations
(4, 'Electrical Inspection', 60, 15, 15, 6, 3, 1); -- 1 hour for inspections

-- Sample bookings
INSERT OR IGNORE INTO bookings (id, client_id, user_id, job_id, service_category, booking_date, start_time, end_time, duration_minutes, status, client_name, client_email, client_phone, client_address, client_timezone, service_description, special_instructions, estimated_cost, booking_source, is_recurring, recurring_booking_id) VALUES
(1, 1, 2, 1, 'House Cleaning', '2024-01-20', '09:00:00', '11:00:00', 120, 'confirmed', 'Demo Client', 'demo.client@kwikr.ca', '+1-416-555-0100', '123 Main St, Toronto, ON M5V 1A1', 'America/Toronto', 'Deep clean 3-bedroom house', 'Please focus on kitchen and bathrooms. Pet-friendly products only.', 180.00, 'web', 0, NULL),
(2, 1, 3, NULL, 'Plumbing Repair', '2024-01-18', '14:00:00', '15:30:00', 90, 'completed', 'Demo Client', 'demo.client@kwikr.ca', '+1-416-555-0100', '123 Main St, Toronto, ON M5V 1A1', 'America/Toronto', 'Fix leaky kitchen faucet', 'Faucet has been dripping for 2 weeks. Located under sink.', 95.00, 'web', 0, NULL),
(3, 5, 4, NULL, 'Electrical Repair', '2024-01-22', '10:00:00', '12:00:00', 120, 'pending', 'Sarah Thompson', 'sarah.thompson@email.com', '+1-902-555-0200', '456 Oak Ave, Halifax, NS B3H 1T5', 'America/Halifax', 'Replace electrical outlets', 'Need 3 outlets replaced in living room. Old outlets not grounded.', 150.00, 'web', 0, NULL),
(4, 6, 2, NULL, 'Office Cleaning', '2024-01-25', '18:00:00', '21:00:00', 180, 'confirmed', 'Toronto Business Center', 'facilities@torontobiz.ca', '+1-416-555-0300', '789 Business Blvd, Toronto, ON M4W 2B8', 'America/Toronto', 'Weekly office cleaning', 'After-hours cleaning for 5000 sq ft office space.', 275.00, 'web', 1, 1);

-- Sample recurring booking pattern
INSERT OR IGNORE INTO recurring_bookings (id, client_id, user_id, pattern_type, frequency, days_of_week, day_of_month, start_time, duration_minutes, timezone, service_category, service_description, estimated_cost, start_date, end_date, max_occurrences, status, auto_confirm, last_generated_date, next_booking_date, total_bookings_generated) VALUES
(1, 6, 2, 'weekly', 1, '[4]', NULL, '18:00:00', 180, 'America/Toronto', 'Office Cleaning', 'Weekly office cleaning service', 275.00, '2024-01-25', '2024-12-31', 50, 'active', 1, '2024-01-25', '2024-02-01', 1);

-- Sample booking policies
INSERT OR IGNORE INTO booking_policies (user_id, policy_type, minimum_notice_hours, same_day_changes_allowed, cancellation_fee_type, cancellation_fee_amount, reschedule_fee_type, reschedule_fee_amount, max_reschedules_per_booking, blackout_dates, is_active) VALUES
(2, 'cancellation', 24, 0, 'none', 0.00, 'none', 0.00, 2, '["2024-12-25", "2024-01-01"]', 1),
(2, 'reschedule', 12, 1, 'none', 0.00, 'none', 0.00, 2, '["2024-12-25", "2024-01-01"]', 1),
(3, 'cancellation', 4, 1, 'fixed', 25.00, 'none', 0.00, 1, '["2024-12-25", "2024-01-01"]', 1),
(3, 'reschedule', 2, 1, 'none', 0.00, 'fixed', 15.00, 3, '["2024-12-25", "2024-01-01"]', 1),
(4, 'cancellation', 24, 0, 'percentage', 50.00, 'none', 0.00, 1, '["2024-12-25", "2024-01-01"]', 1),
(4, 'reschedule', 24, 0, 'none', 0.00, 'fixed', 20.00, 2, '["2024-12-25", "2024-01-01"]', 1);

-- Sample confirmation templates
INSERT OR IGNORE INTO confirmation_templates (template_name, template_type, subject_template, content_template, variables, is_active) VALUES
('booking_confirmation', 'booking_confirmation', 
'Booking Confirmed - {{service_category}} on {{booking_date}}',
'Dear {{client_name}},\n\nYour booking has been confirmed!\n\nService: {{service_category}}\nDate: {{booking_date}}\nTime: {{start_time}} - {{end_time}}\nProvider: {{worker_name}}\nEstimated Cost: ${{estimated_cost}}\n\nAddress: {{client_address}}\n\nSpecial Instructions: {{special_instructions}}\n\nIf you need to reschedule or cancel, please contact us at least {{minimum_notice_hours}} hours in advance.\n\nThank you for choosing Kwikr!\n\nBest regards,\nKwikr Team',
'["client_name", "service_category", "booking_date", "start_time", "end_time", "worker_name", "estimated_cost", "client_address", "special_instructions", "minimum_notice_hours"]', 1),

('booking_reminder', 'reminder',
'Reminder - {{service_category}} appointment tomorrow',
'Dear {{client_name}},\n\nThis is a friendly reminder about your upcoming appointment:\n\nService: {{service_category}}\nDate: {{booking_date}}\nTime: {{start_time}} - {{end_time}}\nProvider: {{worker_name}}\n\nAddress: {{client_address}}\n\nPlease ensure someone is available at the scheduled time. If you need to make any changes, please contact us as soon as possible.\n\nThank you!\nKwikr Team',
'["client_name", "service_category", "booking_date", "start_time", "end_time", "worker_name", "client_address"]', 1),

('booking_cancellation', 'cancellation',
'Booking Cancelled - {{service_category}} on {{booking_date}}',
'Dear {{client_name}},\n\nYour booking has been cancelled as requested.\n\nCancelled Service: {{service_category}}\nOriginal Date: {{booking_date}}\nOriginal Time: {{start_time}} - {{end_time}}\n\nCancellation Fee: ${{cancellation_fee}}\nRefund Amount: ${{refund_amount}}\n\nIf you have any questions about this cancellation or would like to book a new appointment, please contact us.\n\nThank you,\nKwikr Team',
'["client_name", "service_category", "booking_date", "start_time", "end_time", "cancellation_fee", "refund_amount"]', 1);

-- Sample booking confirmations
INSERT OR IGNORE INTO booking_confirmations (booking_id, confirmation_type, confirmation_method, recipient_type, subject, message_content, template_used, sent_at, delivered_at, status, scheduled_for, retry_count) VALUES
(1, 'initial', 'email', 'client', 'Booking Confirmed - House Cleaning on 2024-01-20', 'Dear Demo Client, Your booking has been confirmed! Service: House Cleaning...', 'booking_confirmation', '2024-01-15 10:30:00', '2024-01-15 10:31:00', 'delivered', NULL, 0),
(1, 'reminder', 'email', 'client', 'Reminder - House Cleaning appointment tomorrow', 'Dear Demo Client, This is a friendly reminder about your upcoming appointment...', 'booking_reminder', NULL, NULL, 'pending', '2024-01-19 18:00:00', 0),
(2, 'initial', 'email', 'client', 'Booking Confirmed - Plumbing Repair on 2024-01-18', 'Dear Demo Client, Your booking has been confirmed! Service: Plumbing Repair...', 'booking_confirmation', '2024-01-16 09:15:00', '2024-01-16 09:16:00', 'delivered', NULL, 0),
(3, 'initial', 'email', 'client', 'Booking Confirmed - Electrical Repair on 2024-01-22', 'Dear Sarah Thompson, Your booking has been confirmed! Service: Electrical Repair...', 'booking_confirmation', NULL, NULL, 'pending', '2024-01-20 10:00:00', 0);