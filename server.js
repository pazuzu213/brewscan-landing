const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3939;

// DB setup
const db = new sqlite3.Database('./waitlist.db');
db.run(`CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.use(express.json());
app.use(express.static('public'));

// Waitlist signup
app.post('/api/waitlist', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' });

  db.run('INSERT OR IGNORE INTO waitlist (email) VALUES (?)', [email.toLowerCase().trim()], function(err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (this.changes === 0) return res.json({ status: 'already_on_list' });
    res.json({ status: 'success', position: this.lastID });
  });
});

// Count
app.get('/api/waitlist/count', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM waitlist', (err, row) => {
    res.json({ count: row?.count || 0 });
  });
});

app.listen(PORT, () => console.log(`BrewScan landing on port ${PORT}`));
