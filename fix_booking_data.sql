-- Fix Booking Sample Data for Correct Worker IDs

-- Clear existing booking data
DELETE FROM worker_availability;
DELETE FROM availability_overrides;
DELETE FROM service_time_slots;
DELETE FROM bookings;
DELETE FROM booking_policies;
DELETE FROM user_timezone_preferences;

-- Update user timezone preferences for existing users
INSERT OR IGNORE INTO user_timezone_preferences (user_id, timezone, auto_detect_timezone, display_format_24h) VALUES
(1, 'America/Toronto', 1, 0),  -- Demo Client
(4, 'America/Toronto', 1, 0),  -- Demo Worker
(5, 'America/Vancouver', 1, 1), -- Emma Thompson
(9, 'America/Halifax', 1, 0),   -- James Wilson
(10, 'America/Toronto', 1, 0),  -- Sarah Mitchell
(29, 'America/Vancouver', 1, 1); -- Alex Chen

-- Worker availability for existing workers
-- Demo Worker (Cleaning Services) - user_id: 4
INSERT OR IGNORE INTO worker_availability (user_id, day_of_week, start_time, end_time, is_available, break_start_time, break_end_time) VALUES
(4, 1, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Monday
(4, 2, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Tuesday
(4, 3, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Wednesday
(4, 4, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Thursday
(4, 5, '08:00:00', '15:00:00', 1, '12:00:00', '13:00:00'), -- Friday
(4, 6, '09:00:00', '14:00:00', 1, NULL, NULL); -- Saturday

-- Emma Thompson (Plumbing/General Services) - user_id: 5
INSERT OR IGNORE INTO worker_availability (user_id, day_of_week, start_time, end_time, is_available, break_start_time, break_end_time) VALUES
(5, 1, '07:00:00', '18:00:00', 1, '12:00:00', '13:00:00'), -- Monday
(5, 2, '07:00:00', '18:00:00', 1, '12:00:00', '13:00:00'), -- Tuesday
(5, 3, '07:00:00', '18:00:00', 1, '12:00:00', '13:00:00'), -- Wednesday
(5, 4, '07:00:00', '18:00:00', 1, '12:00:00', '13:00:00'), -- Thursday
(5, 5, '07:00:00', '18:00:00', 1, '12:00:00', '13:00:00'), -- Friday
(5, 6, '08:00:00', '16:00:00', 1, NULL, NULL), -- Saturday (Emergency only)
(5, 0, '08:00:00', '16:00:00', 1, NULL, NULL); -- Sunday (Emergency only)

-- James Wilson (Electrical) - user_id: 9
INSERT OR IGNORE INTO worker_availability (user_id, day_of_week, start_time, end_time, is_available, break_start_time, break_end_time) VALUES
(9, 1, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Monday
(9, 2, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Tuesday
(9, 3, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Wednesday
(9, 4, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'), -- Thursday
(9, 5, '08:00:00', '17:00:00', 1, '12:00:00', '13:00:00'); -- Friday

-- Sarah Mitchell (Home Services) - user_id: 10
INSERT OR IGNORE INTO worker_availability (user_id, day_of_week, start_time, end_time, is_available, break_start_time, break_end_time) VALUES
(10, 1, '09:00:00', '17:00:00', 1, '12:30:00', '13:30:00'), -- Monday
(10, 2, '09:00:00', '17:00:00', 1, '12:30:00', '13:30:00'), -- Tuesday
(10, 3, '09:00:00', '17:00:00', 1, '12:30:00', '13:30:00'), -- Wednesday
(10, 4, '09:00:00', '17:00:00', 1, '12:30:00', '13:30:00'), -- Thursday
(10, 5, '09:00:00', '15:00:00', 1, '12:30:00', '13:30:00'); -- Friday

-- Alex Chen (Maintenance Services) - user_id: 29
INSERT OR IGNORE INTO worker_availability (user_id, day_of_week, start_time, end_time, is_available, break_start_time, break_end_time) VALUES
(29, 1, '07:30:00', '16:30:00', 1, '12:00:00', '13:00:00'), -- Monday
(29, 2, '07:30:00', '16:30:00', 1, '12:00:00', '13:00:00'), -- Tuesday
(29, 3, '07:30:00', '16:30:00', 1, '12:00:00', '13:00:00'), -- Wednesday
(29, 4, '07:30:00', '16:30:00', 1, '12:00:00', '13:00:00'), -- Thursday
(29, 5, '07:30:00', '16:30:00', 1, '12:00:00', '13:00:00'), -- Friday
(29, 6, '08:00:00', '15:00:00', 1, NULL, NULL); -- Saturday

-- Service time slot configurations for existing workers
INSERT OR IGNORE INTO service_time_slots (user_id, service_category, duration_minutes, buffer_before_minutes, buffer_after_minutes, max_bookings_per_day, advance_booking_days, same_day_booking) VALUES
-- Demo Worker (4) - Cleaning Services
(4, 'House Cleaning', 120, 15, 15, 4, 14, 0), -- 2 hours for house cleaning
(4, 'Office Cleaning', 180, 30, 15, 3, 21, 0), -- 3 hours for office cleaning
(4, 'Deep Cleaning', 240, 30, 30, 2, 7, 0),   -- 4 hours for deep cleaning

-- Emma Thompson (5) - Plumbing/General
(5, 'Plumbing Repair', 90, 15, 15, 6, 7, 1),  -- 1.5 hours for repairs
(5, 'Plumbing Installation', 180, 30, 30, 3, 14, 0), -- 3 hours for installations
(5, 'Emergency Plumbing', 60, 0, 15, 8, 1, 1), -- 1 hour for emergency
(5, 'General Maintenance', 120, 15, 15, 5, 7, 1), -- 2 hours for maintenance

-- James Wilson (9) - Electrical
(9, 'Electrical Repair', 120, 15, 15, 4, 7, 1), -- 2 hours for repairs
(9, 'Electrical Installation', 240, 30, 30, 2, 14, 0), -- 4 hours for installations
(9, 'Electrical Inspection', 60, 15, 15, 6, 3, 1), -- 1 hour for inspections

-- Sarah Mitchell (10) - Home Services
(10, 'Home Organization', 180, 15, 30, 3, 7, 0), -- 3 hours for organization
(10, 'Interior Decoration', 240, 30, 30, 2, 14, 0), -- 4 hours for decoration
(10, 'Home Consultation', 60, 15, 15, 6, 3, 1), -- 1 hour for consultation

-- Alex Chen (29) - Maintenance
(29, 'HVAC Maintenance', 150, 30, 15, 4, 7, 1), -- 2.5 hours for HVAC
(29, 'Appliance Repair', 120, 15, 15, 5, 3, 1), -- 2 hours for appliances
(29, 'Preventive Maintenance', 90, 15, 15, 6, 7, 1); -- 1.5 hours for preventive

-- Sample availability overrides (holidays and special dates)
INSERT OR IGNORE INTO availability_overrides (user_id, override_date, override_type, start_time, end_time, reason) VALUES
(4, '2024-12-25', 'unavailable', NULL, NULL, 'Christmas Day'),
(4, '2025-01-01', 'unavailable', NULL, NULL, 'New Year Day'),
(5, '2024-12-25', 'unavailable', NULL, NULL, 'Christmas Day'),
(5, '2025-01-01', 'unavailable', NULL, NULL, 'New Year Day'),
(9, '2024-12-25', 'unavailable', NULL, NULL, 'Christmas Day'),
(10, '2024-12-25', 'unavailable', NULL, NULL, 'Christmas Day'),
(29, '2024-12-25', 'unavailable', NULL, NULL, 'Christmas Day');

-- Sample bookings with corrected worker IDs (using future dates for testing)
INSERT OR IGNORE INTO bookings (id, client_id, user_id, job_id, service_category, booking_date, start_time, end_time, duration_minutes, status, client_name, client_email, client_phone, client_address, client_timezone, service_description, special_instructions, estimated_cost, booking_source, is_recurring, recurring_booking_id) VALUES
(1, 1, 4, 1, 'House Cleaning', '2025-01-20', '09:00:00', '11:00:00', 120, 'confirmed', 'Demo Client', 'demo.client@kwikr.ca', '+1-416-555-0100', '123 Main St, Toronto, ON M5V 1A1', 'America/Toronto', 'Deep clean 3-bedroom house', 'Please focus on kitchen and bathrooms. Pet-friendly products only.', 180.00, 'web', 0, NULL),
(2, 1, 5, NULL, 'Plumbing Repair', '2025-01-18', '14:00:00', '15:30:00', 90, 'confirmed', 'Demo Client', 'demo.client@kwikr.ca', '+1-416-555-0100', '123 Main St, Toronto, ON M5V 1A1', 'America/Toronto', 'Fix leaky kitchen faucet', 'Faucet has been dripping for 2 weeks. Located under sink.', 95.00, 'web', 0, NULL),
(3, 1, 9, NULL, 'Electrical Repair', '2025-01-22', '10:00:00', '12:00:00', 120, 'pending', 'Demo Client', 'demo.client@kwikr.ca', '+1-416-555-0100', '123 Main St, Toronto, ON M5V 1A1', 'America/Toronto', 'Replace electrical outlets', 'Need 3 outlets replaced in living room. Old outlets not grounded.', 150.00, 'web', 0, NULL);

-- Sample booking policies for existing workers
INSERT OR IGNORE INTO booking_policies (user_id, policy_type, minimum_notice_hours, same_day_changes_allowed, cancellation_fee_type, cancellation_fee_amount, reschedule_fee_type, reschedule_fee_amount, max_reschedules_per_booking, blackout_dates, is_active) VALUES
(4, 'cancellation', 24, 0, 'none', 0.00, 'none', 0.00, 2, '["2024-12-25", "2025-01-01"]', 1),
(4, 'reschedule', 12, 1, 'none', 0.00, 'none', 0.00, 2, '["2024-12-25", "2025-01-01"]', 1),
(5, 'cancellation', 4, 1, 'fixed', 25.00, 'none', 0.00, 1, '["2024-12-25", "2025-01-01"]', 1),
(5, 'reschedule', 2, 1, 'none', 0.00, 'fixed', 15.00, 3, '["2024-12-25", "2025-01-01"]', 1),
(9, 'cancellation', 24, 0, 'percentage', 50.00, 'none', 0.00, 1, '["2024-12-25", "2025-01-01"]', 1),
(9, 'reschedule', 24, 0, 'none', 0.00, 'fixed', 20.00, 2, '["2024-12-25", "2025-01-01"]', 1),
(10, 'cancellation', 12, 0, 'fixed', 30.00, 'none', 0.00, 2, '["2024-12-25", "2025-01-01"]', 1),
(29, 'cancellation', 8, 1, 'none', 0.00, 'none', 0.00, 3, '["2024-12-25", "2025-01-01"]', 1);