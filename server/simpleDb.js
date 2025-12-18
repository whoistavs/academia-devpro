const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'users.json');

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

const db = {
    users: {
        findOne: (query, callback) => {
            try {
                const data = fs.readFileSync(DB_FILE);
                const users = JSON.parse(data);

                const user = users.find(u => { // Simple query matching
                    for (let key in query) {
                        if (u[key] !== query[key]) return false;
                    }
                    return true;
                });

                callback(null, user);
            } catch (err) {
                callback(err, null);
            }
        },
        insert: (user, callback) => {
            try {
                const data = fs.readFileSync(DB_FILE);
                const users = JSON.parse(data);

                user._id = Date.now().toString();
                users.push(user);

                fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
                callback(null, user);
            } catch (err) {
                callback(err, null);
            }
        },
        remove: (query, callback) => {
            try {
                const data = fs.readFileSync(DB_FILE);
                let users = JSON.parse(data);

                const initialLength = users.length;
                users = users.filter(u => {
                    for (let key in query) {
                        if (u[key] !== query[key]) return true; // Keep if mismatch
                    }
                    return false; // Remove if match
                });

                if (users.length === initialLength) {
                    // No user found to delete
                }

                fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
                callback(null, users.length < initialLength); // Return true if deleted
            } catch (err) {
                callback(err, null);
            }
        },
        find: (query, callback) => {
            try {
                const data = fs.readFileSync(DB_FILE);
                const users = JSON.parse(data);

                const results = users.filter(u => {
                    for (let key in query) {
                        if (u[key] !== query[key]) return false;
                    }
                    return true;
                });

                callback(null, results);
            } catch (err) {
                callback(err, null);
            }
        }
    }
};

module.exports = db;
