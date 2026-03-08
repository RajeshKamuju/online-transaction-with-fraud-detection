import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("shieldpay.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
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

  CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    upi_id TEXT,
    avatar TEXT,
    last_transaction TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
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

  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    transaction_id TEXT,
    user_id TEXT,
    risk_score REAL,
    reason_codes TEXT,
    timestamp INTEGER,
    FOREIGN KEY(transaction_id) REFERENCES transactions(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed Mock Data
const seedContactsForUser = (userId: string) => {
  const insertContact = db.prepare(`INSERT OR IGNORE INTO contacts (id, user_id, name, upi_id, avatar) VALUES (?, ?, ?, ?, ?)`);
  const names = [
    "John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", "Charlie Davis", 
    "Eve Wilson", "Frank Moore", "Grace Taylor", "Hank Anderson", "Ivy Thomas", 
    "Jack White", "Kelly Green", "Liam Black", "Mia Grey", "Noah Blue", 
    "Olivia Red", "Peter Pink", "Quinn Gold", "Rose Silver", "Sam Bronze", 
    "Tina Lead", "Uma Zinc", "Victor Iron", "Wendy Steel", "Xander Copper", 
    "Yara Brass", "Zane Nickel", "Amy Quartz", "Ben Flint", "Cora Jade",
    "David Miller", "Emma Wilson", "Felix Wright", "Gina Hall", "Harry Potter",
    "Isla Fisher", "Kevin Hart", "Luna Lovegood", "Miles Morales", "Nora Jones",
    "Oscar Wilde", "Penny Lane", "Riley Reid", "Stella Artois", "Tony Stark",
    "Ursula Corbero", "Vince Vaughn", "Will Smith", "Xena Warrior", "Yoda Master",
    "Zelda Legend", "Arthur Morgan", "Bruce Wayne", "Clark Kent", "Diana Prince",
    "Edward Norton", "Frodo Baggins", "Gandalf Grey", "Hermione Granger", "Indiana Jones"
  ];
  names.forEach((name, i) => {
    const contactId = `c_${userId}_${i}`;
    insertContact.run(contactId, userId, name, `${name.toLowerCase().replace(/\s+/g, ".")}@upi`, `https://picsum.photos/seed/${name}/200`);
  });
};

const seedTransactionsForUser = (userId: string) => {
  const txCount = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE user_id = ?").get(userId) as { count: number };
  if (txCount.count === 0) {
    const insertTx = db.prepare(`
      INSERT INTO transactions (id, user_id, recipient_name, amount, timestamp, type, status, risk_score, reason_codes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const transactions = [
      { name: "John Doe", amount: 500, status: "SAFE" },
      { name: "Alice Johnson", amount: 1200, status: "SAFE" },
      { name: "Unknown Merchant", amount: 15000, status: "FLAGGED", reasons: "ANOMALOUS_AMOUNT" },
      { name: "Suspicious Account", amount: 5000, status: "BLOCKED", reasons: "VELOCITY_ATTACK" },
      { name: "Zelda Legend", amount: 250, status: "SAFE" },
      { name: "Tony Stark", amount: 9999, status: "SAFE" },
    ];

    transactions.forEach((tx, i) => {
      const id = `tx_seed_${userId}_${i}`;
      const timestamp = Date.now() - (i * 86400000); // One day apart
      insertTx.run(id, userId, tx.name, tx.amount, timestamp, 'TRANSFER', tx.status, tx.status === 'SAFE' ? 5 : 85, tx.reasons || "");
    });
  }
};

const seedData = () => {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password, money_password, average_spend_baseline, last_lat, last_lng, last_timestamp, kyc_status, balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const userId = "user_1";
    insertUser.run(userId, "Rajesh Kamuju", "rajesh.kamuju93@gmail.com", "pass123", "123456", 1000, 19.076, 72.877, Date.now() - 3600000, "verified", 42850);
  }
  seedContactsForUser("user_1");
  seedTransactionsForUser("user_1");
};
seedData();

class FraudDetector {
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static analyze(transaction: any, user: any, recentTransactions: any[], typingSpeed?: number) {
    let riskScore = 0;
    const reasons: string[] = [];

    // 1. Velocity Check: > 3 transactions in 60s
    const oneMinuteAgo = Date.now() - 60000;
    const velocityCount = recentTransactions.filter(t => t.timestamp > oneMinuteAgo).length;
    if (velocityCount >= 3) {
      riskScore += 40;
      reasons.push("VELOCITY_ATTACK");
    }

    // 2. Geo-Divergence: > 500km from last location in 1h
    if (user.last_lat && user.last_lng) {
      const distance = this.calculateDistance(transaction.lat, transaction.lng, user.last_lat, user.last_lng);
      const timeDiffHours = (transaction.timestamp - user.last_timestamp) / 3600000;
      if (distance > 500 && timeDiffHours < 1) {
        riskScore += 50;
        reasons.push("LOCATION_JUMP");
      }
    }

    // 3. Anomalous Amount: 5x higher than baseline
    if (transaction.amount > user.average_spend_baseline * 5) {
      riskScore += 30;
      reasons.push("ANOMALOUS_AMOUNT");
    }

    // 4. Behavioral Analysis: Bot detection (typing speed too fast)
    if (typingSpeed && typingSpeed < 100) {
      riskScore += 60;
      reasons.push("BOT_DETECTION_TYPING");
    }

    // 5. Kaggle Pattern: Balance Emptying
    if (transaction.amount > user.balance * 0.9) {
      riskScore += 45;
      reasons.push("BALANCE_EMPTYING");
    }

    return {
      riskScore: Math.min(riskScore, 100),
      reasons
    };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Auth Endpoints
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      seedContactsForUser(user.id);
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, moneyPassword } = req.body;
    try {
      const id = `user_${Date.now()}`;
      db.prepare("INSERT INTO users (id, name, email, password, money_password) VALUES (?, ?, ?, ?, ?)")
        .run(id, name, email, password, moneyPassword);
      seedContactsForUser(id);
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
      res.json(user);
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/onboarding-complete", (req, res) => {
    const { userId } = req.body;
    db.prepare("UPDATE users SET has_onboarding = 1 WHERE id = ?").run(userId);
    res.json({ success: true });
  });

  // User & Contacts
  app.get("/api/user/:id", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    res.json(user);
  });

  app.post("/api/user/:id/add-funds", (req, res) => {
    const { amount } = req.body;
    db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(amount, req.params.id);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    res.json(user);
  });

  app.get("/api/contacts/:userId", (req, res) => {
    const contacts = db.prepare("SELECT * FROM contacts WHERE user_id = ?").all(req.params.userId);
    res.json(contacts);
  });

  // Payment & Fraud
  app.post("/api/predict", (req, res) => {
    const { userId, amount, lat, lng, ipAddress, recipientName, moneyPassword, typingSpeed } = req.body;
    const timestamp = Date.now();
    
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
    
    // Verify PIN
    if (user.money_password !== moneyPassword) {
      return res.status(403).json({ error: "Invalid Transaction PIN" });
    }

    const recentTransactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10").all(userId);
    
    const transaction = { userId, amount, lat, lng, timestamp };
    const verdict = FraudDetector.analyze(transaction, user, recentTransactions, typingSpeed);

    const status = verdict.riskScore > 80 ? 'BLOCKED' : (verdict.riskScore > 40 ? 'FLAGGED' : 'SAFE');
    const transId = `tx_${Date.now()}`;

    // Save transaction
    db.prepare(`
      INSERT INTO transactions (id, user_id, recipient_name, amount, timestamp, type, status, risk_score, reason_codes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(transId, userId, recipientName, amount, timestamp, 'TRANSFER', status, verdict.riskScore, verdict.reasons.join(","));

    if (status !== 'BLOCKED') {
      db.prepare("UPDATE users SET balance = balance - ?, last_lat = ?, last_lng = ?, last_timestamp = ? WHERE id = ?")
        .run(amount, lat, lng, timestamp, userId);
    } else {
      const alertId = `alt_${Date.now()}`;
      db.prepare(`
        INSERT INTO alerts (id, transaction_id, user_id, risk_score, reason_codes, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(alertId, transId, userId, verdict.riskScore, verdict.reasons.join(","), timestamp);
    }

    res.json({
      transactionId: transId,
      status,
      ...verdict
    });
  });

  app.get("/api/history/:userId", (req, res) => {
    const history = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC").all(req.params.userId);
    res.json(history);
  });

  app.get("/api/alerts/:userId", (req, res) => {
    const alerts = db.prepare("SELECT * FROM alerts WHERE user_id = ? ORDER BY timestamp DESC").all(req.params.userId);
    res.json(alerts);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ShieldPay Server running on http://localhost:${PORT}`);
  });
}

startServer();
