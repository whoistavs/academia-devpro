const Datastore = require('nedb');
const path = require('path');

const db = new Datastore({
    filename: path.join(__dirname, 'users.db'),
    autoload: true
});

// Compact the database automatically every 15 minutes
db.persistence.setAutocompactionInterval(15 * 60 * 1000);

module.exports = db;
