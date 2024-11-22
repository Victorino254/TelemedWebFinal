//import
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Test the connection
const promisePool = pool.promise();

promisePool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        console.log('Connected to database:', process.env.DB_NAME);
        connection.release();
    })
    .catch(error => {
        console.error('Database connection failed:', error.message);
        console.error('Error code:', error.code);
        console.error('Error stack:', error.stack);
    });

module.exports = promisePool;

