-- Sample Communication Data for Testing

-- Sample conversations
INSERT OR IGNORE INTO chat_conversations (id, title, type, job_id, created_by, created_at, is_active) VALUES
(1, 'House Cleaning Project Discussion', 'job_related', 1, 1, '2024-01-15 10:00:00', 1),
(2, 'General Service Inquiry', 'direct', NULL, 2, '2024-01-14 14:30:00', 1),
(3, 'Plumbing Emergency', 'direct', NULL, 3, '2024-01-13 09:15:00', 1);

-- Sample conversation participants
INSERT OR IGNORE INTO chat_participants (conversation_id, user_id, role, joined_at, is_active) VALUES
(1, 1, 'participant', '2024-01-15 10:00:00', 1),
(1, 2, 'participant', '2024-01-15 10:00:00', 1),
(2, 2, 'participant', '2024-01-14 14:30:00', 1),
(2, 3, 'participant', '2024-01-14 14:30:00', 1),
(3, 3, 'participant', '2024-01-13 09:15:00', 1),
(3, 4, 'participant', '2024-01-13 09:15:00', 1);

-- Sample messages
INSERT OR IGNORE INTO chat_messages (id, conversation_id, sender_id, content, message_type, created_at) VALUES
(1, 1, 1, 'Hi Sarah! I saw your cleaning service profile. I need a deep clean for my 3-bedroom house. Are you available next week?', 'text', '2024-01-15 10:05:00'),
(2, 1, 2, 'Hello! Yes, I have availability next week. Can you tell me more about the size and specific areas you need cleaned?', 'text', '2024-01-15 10:15:00'),
(3, 1, 1, 'It''s about 2000 sq ft. I need all rooms, 2 bathrooms, kitchen, and living areas. Also wondering about pricing.', 'text', '2024-01-15 10:20:00'),
(4, 1, 2, 'For a 2000 sq ft deep clean, my rate is $45/hour and it typically takes 6-8 hours depending on condition. Would you like to schedule an estimate visit?', 'text', '2024-01-15 10:25:00'),
(5, 2, 2, 'Hello Mike! I found your plumbing services through Kwikr. Do you handle emergency calls?', 'text', '2024-01-14 14:35:00'),
(6, 2, 3, 'Yes, I do provide 24/7 emergency services. What type of plumbing issue are you experiencing?', 'text', '2024-01-14 14:40:00'),
(7, 3, 3, 'Hi David, I need an electrician for some outlet installations. Are you licensed for residential work?', 'text', '2024-01-13 09:20:00'),
(8, 3, 4, 'Yes, I''m a licensed residential electrician. How many outlets are we looking at and what rooms?', 'text', '2024-01-13 09:30:00');

-- Sample message status (read/unread)
INSERT OR IGNORE INTO chat_message_status (message_id, user_id, status, timestamp) VALUES
(1, 2, 'read', '2024-01-15 10:16:00'),
(2, 1, 'read', '2024-01-15 10:16:00'),
(3, 2, 'read', '2024-01-15 10:21:00'),
(4, 1, 'delivered', '2024-01-15 10:25:00'),
(5, 3, 'read', '2024-01-14 14:41:00'),
(6, 2, 'read', '2024-01-14 14:41:00'),
(7, 4, 'read', '2024-01-13 09:31:00'),
(8, 3, 'delivered', '2024-01-13 09:30:00');

-- Sample bulk message campaign
INSERT OR IGNORE INTO chat_bulk_messages (id, sender_id, title, content, target_criteria, status, total_recipients, successful_sends, created_at) VALUES
(1, 1, 'New Year Promotion', 'Happy New Year! We''re offering 15% off all cleaning services booked in January. Contact me for your free quote!', '{"categories": ["Cleaning"], "locations": ["ON"], "verified_only": true}', 'sent', 25, 23, '2024-01-01 08:00:00');

-- Sample notification preferences
INSERT OR IGNORE INTO chat_notification_preferences (user_id, email_notifications, push_notifications, desktop_notifications) VALUES
(1, 1, 1, 1),
(2, 1, 1, 0),
(3, 0, 1, 1),
(4, 1, 0, 1);