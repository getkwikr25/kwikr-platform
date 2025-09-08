-- Real Kwikr Users Import

INSERT OR IGNORE INTO users (
    id, email, password_hash, role, first_name, last_name, 
    phone, province, city, is_verified, is_active, created_at
) VALUES (
    1000, 
    'plumbingambulanceca@gmail.com',
    '6f217ca350a4b64c6056884d0cdbe856c0a38571ecbeaaab0399147949604a61',
    'worker',
    'Plumbing',
    'Ambulance Inc',
    '6475679102',
    'Ontario',
    'Mississauga',
    1,
    1,
    datetime('now')
);

INSERT OR IGNORE INTO users (
    id, email, password_hash, role, first_name, last_name, 
    phone, province, city, is_verified, is_active, created_at
) VALUES (
    1001, 
    'info.kodiakplumbing@gmail.com',
    'c9c15170b83fb79f706459defeaf713025f412f79ff6f320e7386147dd8608ad',
    'worker',
    'Kodiak',
    'Plumbing',
