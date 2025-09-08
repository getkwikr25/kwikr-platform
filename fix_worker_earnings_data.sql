-- Add sample data to existing worker_earnings table structure

INSERT OR IGNORE INTO worker_earnings (worker_id, job_id, bid_id, earning_type, gross_amount, platform_fee, net_amount, hours_worked, hourly_rate, payment_status, tax_year) VALUES
(1, 101, 1001, 'job_completion', 450.00, 45.00, 405.00, 8.0, 56.25, 'paid', 2024),
(1, 102, 1002, 'job_completion', 650.00, 65.00, 585.00, 12.0, 54.17, 'paid', 2024),
(1, 103, 1003, 'job_completion', 300.00, 30.00, 270.00, 6.0, 50.00, 'pending', 2024),
(2, 104, 1004, 'job_completion', 800.00, 80.00, 720.00, 16.0, 50.00, 'paid', 2024),
(2, 105, 1005, 'job_completion', 520.00, 52.00, 468.00, 10.0, 52.00, 'paid', 2024),
(1, 106, 1006, 'job_completion', 750.00, 75.00, 675.00, 14.0, 53.57, 'paid', 2024),
(2, 107, 1007, 'job_completion', 420.00, 42.00, 378.00, 8.0, 52.50, 'processing', 2024);