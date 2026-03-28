const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("DROP TABLE IF EXISTS skills");
    db.run("CREATE TABLE skills (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, category TEXT)");
    
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
    
    console.log("Skills updated securely without dropping the database.");
});

db.close();
