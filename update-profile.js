const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Update the profile table's first record
    db.run(`UPDATE profile SET name = ?, title = ? WHERE id = 1`, 
        ["Viraj Sawant", "Creative Full-Stack Developer"], 
        function(err) {
            if (err) {
                console.error("Error updating profile:", err);
            } else {
                console.log("Profile updated to Viraj Sawant securely.");
            }
        });
});

db.close();
