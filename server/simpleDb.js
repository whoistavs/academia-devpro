import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createCollection = (fileName) => {
    const filePath = path.join(__dirname, fileName);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
    }

    return {
        findOne: (query, callback) => {
            try {
                const data = fs.readFileSync(filePath);
                const items = JSON.parse(data);

                const item = items.find(u => {
                    for (let key in query) {
                        if (u[key] !== query[key]) return false;
                    }
                    return true;
                });

                callback(null, item);
            } catch (err) {
                callback(err, null);
            }
        },
        insert: (item, callback) => {
            try {
                const data = fs.readFileSync(filePath);
                const items = JSON.parse(data);

                item._id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
                item.createdAt = new Date().toISOString();
                items.push(item);

                fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
                callback(null, item);
            } catch (err) {
                callback(err, null);
            }
        },
        update: (query, updateObj, options, callback) => {
            try {
                const data = fs.readFileSync(filePath);
                let items = JSON.parse(data);
                let numReplaced = 0;

                items = items.map(u => {
                    let match = true;
                    for (let key in query) {
                        if (u[key] !== query[key]) match = false;
                    }
                    if (match) {
                        if (updateObj.$set) {
                            u = { ...u, ...updateObj.$set };
                        }
                        numReplaced++;
                        return u;
                    }
                    return u;
                });

                fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
                callback(null, numReplaced);
            } catch (err) {
                callback(err, null);
            }
        },
        remove: (query, callback) => {
            try {
                const data = fs.readFileSync(filePath);
                let items = JSON.parse(data);

                const initialLength = items.length;
                items = items.filter(u => {
                    for (let key in query) {
                        if (u[key] !== query[key]) return true;
                    }
                    return false;
                });

                fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
                callback(null, items.length < initialLength);
            } catch (err) {
                callback(err, null);
            }
        },
        find: (query, callback) => {
            try {
                const data = fs.readFileSync(filePath);
                const items = JSON.parse(data);

                const results = items.filter(u => {
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
    };
};

const db = {
    users: createCollection('users.json'),
    messages: createCollection('messages.json')
};

export default db;
