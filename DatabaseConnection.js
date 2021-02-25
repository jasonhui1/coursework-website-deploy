const mysql = require('mysql');
require('dotenv').config();

//CleanDB connection
//use connection pooling to improve the performance of MySQL and not overload the MySQL server with too many connections.
// https://codeforgeek.com/nodejs-mysql-tutorial/

let getDatabase = mysql.createPool({
    connectionLimit : 10, 
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

module.exports = getDatabase;