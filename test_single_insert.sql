INSERT INTO worker_profiles_new (
  company, description, address, country, province, city, postal_code,
  email, filename, google_place_id, latitude, longitude, phone,
  profile_photo, category, subscription_type, user_id, website,
  hours_of_operation, hourly_rate, price_range, services_provided
) VALUES (
  'Test Company',
  'Test description',
  'Test address',
  'Canada',
  'ON',
  'Test City',
  'T1T 1T1',
  'test@example.com',
  'test-filename',
  NULL,
  43.6532,
  -79.3832,
  '4161234567',
  NULL,
  'Plumbing',
  'Pay-as-you-go',
  9999,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
);
