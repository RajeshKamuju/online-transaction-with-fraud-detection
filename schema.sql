-- ShieldPay Advanced Database Schema
-- Optimized for Real-Time Fraud Detection

-- Users Table: Stores core user profile and behavioral baselines
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    money_password TEXT,
    average_spend_baseline REAL DEFAULT 1000,
    last_lat REAL,
    last_lng REAL,
    last_timestamp INTEGER,
    kyc_status TEXT DEFAULT 'verified',
    has_onboarding INTEGER DEFAULT 0,
    balance REAL DEFAULT 50000
);

-- Contacts Table: User's contact list
CREATE TABLE contacts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    upi_id TEXT,
    avatar TEXT,
    last_transaction TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Transactions Table: High-volume transaction ledger
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    recipient_name TEXT,
    amount REAL,
    timestamp INTEGER,
    type TEXT,
    status TEXT,
    risk_score REAL,
    reason_codes TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE INDEX idx_transaction_user_time ON transactions(user_id, timestamp);

-- Fraud Alerts Table: Logs detected suspicious patterns
CREATE TABLE alerts (
    id TEXT PRIMARY KEY,
    transaction_id TEXT,
    user_id TEXT,
    risk_score REAL,
    reason_codes TEXT,
    timestamp INTEGER,
    FOREIGN KEY(transaction_id) REFERENCES transactions(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Normalization Note:
-- The schema is normalized to 3NF to ensure data integrity.
-- Indexing on (user_id, timestamp) in the transactions table is critical 
-- for the Fraud Engine to perform "Velocity Checks" in O(log n) time.
