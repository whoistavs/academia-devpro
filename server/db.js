const Datastore = require('nedb');
const path = require('path');

const db = new Datastore({
    filename: path.join(__dirname, 'users.db'),
    autoload: true
});


db.persistence.setAutocompactionInterval(15 * 60 * 1000);

module.exports = db;
