const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath); // Reset for demonstration

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Error opening db", err);
    else console.log("Database connected.");
});

db.serialize(() => {
    // Create Profile Table
    db.run(`CREATE TABLE profile (
        id INTEGER PRIMARY KEY,
        name TEXT,
        title TEXT,
        about_text TEXT,
        projects_shipped INTEGER,
        years_experience INTEGER,
        satisfaction_pct INTEGER
    )`);

    // Create Projects Table
    db.run(`CREATE TABLE projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        tags TEXT, 
        description TEXT,
        hue INTEGER
    )`);

    // Create Skills Table
    db.run(`CREATE TABLE skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        category TEXT
    )`);

    // Create Messages Table
    db.run(`CREATE TABLE messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Seed Profile
    db.run(`INSERT INTO profile (id, name, title, about_text, projects_shipped, years_experience, satisfaction_pct) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [1, "Aarav Kumar", "Creative Developer & Designer", "I'm a full-stack creative developer with 6+ years of experience building exceptional digital products. I bridge the gap between stunning design and robust engineering — because great work demands both.", 60, 6, 98]);

    // Seed Projects
    const projects = [
        ["Luminary — 3D Config", "3D,WebGL,React", "Interactive 3D product configurator with real-time physics simulation.", 60],
        ["NeuralDraft AI", "AI,Design", "AI-powered design system generator that creates consistent UI components.", 260],
        ["Kinetic Studio", "Motion,GSAP", "Award-winning creative agency website with scroll storytelling.", 15],
        ["MetaVault NFT", "Web3,Canvas", "NFT marketplace with generative art engine.", 175],
        ["PulseMetrics", "SaaS,Dashboard", "Real-time analytics dashboard with live data visualizations.", 320]
    ];
    let insertProj = db.prepare(`INSERT INTO projects (name, tags, description, hue) VALUES (?, ?, ?, ?)`);
    for (let p of projects) insertProj.run(p);
    insertProj.finalize();

    // Seed Skills
    const skills = [
        ["HTML", "Frontend"],
        ["CSS", "Frontend"],
        ["JavaScript", "Frontend"],
        ["React", "Frontend"],
        ["Node.js", "Backend"],
        ["MongoDB", "Backend"],
        ["Figma", "Design"]
    ];
    let insertSkill = db.prepare(`INSERT INTO skills (name, category) VALUES (?, ?)`);
    for (let s of skills) insertSkill.run(s);
    insertSkill.finalize();

    console.log("Database seeded successfully.");
});

db.close();
