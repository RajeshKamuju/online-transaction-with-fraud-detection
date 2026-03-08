import Database from "better-sqlite3";
const db = new Database("shieldpay.db");
const count = db.prepare("SELECT COUNT(*) as count FROM contacts").get();
console.log("Total contacts:", count);
const users = db.prepare("SELECT id, email FROM users").all();
console.log("Users:", users);
users.forEach(u => {
  const userContacts = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE user_id = ?").get(u.id);
  console.log(`User ${u.email} has ${userContacts.count} contacts`);
});
