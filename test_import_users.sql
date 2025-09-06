-- Import Worker Users
-- Generated from kwikr_sample.xls


INSERT OR IGNORE INTO users (
    id, email, password_hash, password_salt, role, first_name, last_name, 
    province, city, is_verified, is_active, created_at
) VALUES (
    1000, 
    'sales@drainmastertrenchless.com',
    '1271cc75b41b92a48cd059e690437ff057b0812954a7747a9f11c2eae61732fd',
    'dd48dfc1d437db52f8b49564883c1ac8',
    'worker',
    'Drain',
    'Master',
    'BC',
    'Burnaby',
    1,
    1,
    datetime('now')
);

INSERT OR IGNORE INTO users (
    id, email, password_hash, password_salt, role, first_name, last_name, 
    province, city, is_verified, is_active, created_at
) VALUES (
    1001, 
    'Dylan@epicplumbingandheating.ca',
    '58a49ba21de5f6e19c1145c1465589dc2216d8c67d386bdcfc10092fd687f214',
    'a2c93f0f8c4925e00e981ffc9027f4af',
    'worker',
    'Epic',
    'and',
    'BC',
    'Parksville',
    1,
    1,
    datetime('now')
);

INSERT OR IGNORE INTO users (
    id, email, password_hash, password_salt, role, first_name, last_name, 
    province, city, is_verified, is_active, created_at
) VALUES (
    1002, 
    'sales@randbplumbing.ca',
    'dc93d18230056893c6ad22765d0db63317cc4531653ec41a876b79ea90710fe2',
    'fa0ec857a3cb4753f1706d23c29bcf45',
    'worker',
    'R',
