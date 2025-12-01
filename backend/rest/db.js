const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'i.hate.sequels',
    database: 'streaming',
    connectionLimit: 10
});

module.exports = pool;
