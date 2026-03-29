require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

// Security imports
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');

const app = express();
const port = process.env.PORT || 3000;

// === CYBER SECURITY MIDDLEWARE ===
app.use(helmet({
    contentSecurityPolicy: false, // Prevents breaking inline scripts and GSAP CDN
})); // Set secure HTTP headers
app.use(xss());    // Prevent cross-site scripting in req bodies

// Anti-DDoS / Anti-spam rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, // 100 req per IP per 15 min window
    message: { error: 'Too many requests from this IP. Please wait 15 minutes before trying again.' },
    standardHeaders: true, 
    legacyHeaders: false,
});
app.use('/api', limiter); // Lock down all API routes

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// DB Connection
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) console.error("Database connection error:", err.message);
});

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// === API ENDPOINTS ===

// 1. Profile
app.get('/api/profile', (req, res) => {
    db.get(`SELECT * FROM profile WHERE id = 1`, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// 2. Projects
app.get('/api/projects', (req, res) => {
    db.all(`SELECT * FROM projects`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Admin: Add Project
app.post('/api/projects', (req, res) => {
    const { name, tags, description, hue } = req.body;
    db.run(`INSERT INTO projects (name, tags, description, hue) VALUES (?, ?, ?, ?)`,
        [name, tags, description, hue], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, name, tags, description, hue });
        });
});

// Admin: Update Project
app.put('/api/projects/:id', (req, res) => {
    const { name, tags, description, hue } = req.body;
    db.run(`UPDATE projects SET name = ?, tags = ?, description = ?, hue = ? WHERE id = ?`,
        [name, tags, description, hue, req.params.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Updated successfully", changes: this.changes });
        });
});

// Admin: Delete Project
app.delete('/api/projects/:id', (req, res) => {
    db.run(`DELETE FROM projects WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted successfully", changes: this.changes });
    });
});

// 3. Skills
app.get('/api/skills', (req, res) => {
    db.all(`SELECT * FROM skills`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 4. Contact / Messages
app.post('/api/messages', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
    }
    
    db.run(`INSERT INTO messages (name, email, message) VALUES (?, ?, ?)`,
        [name, email, message], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Respond IMMEDIATELY to make the UI fast
            res.status(201).json({ success: true, message: "Message received successfully!" });
            
            // Dispatch email notification asynchronously
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER, // Send to your own email address
                replyTo: email,             // Set "reply-to" to the user's email
                subject: `New Portfolio Message from ${name}`,
                text: `You received a new message from your portfolio contact form.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
            };

            transporter.sendMail(mailOptions, (mailErr, info) => {
                if (mailErr) {
                    console.error("Nodemailer Error:", mailErr);
                } else {
                    console.log("Email notification sent successfully!");
                }
            });
        });
});

// Catch-all route to serve the SPA frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`Endpoints:`);
    console.log(`- GET  /api/profile`);
    console.log(`- GET  /api/projects`);
    console.log(`- GET  /api/skills`);
    console.log(`- POST /api/messages`);
});
