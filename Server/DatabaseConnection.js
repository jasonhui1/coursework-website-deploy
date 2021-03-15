const mysql = require('mysql2');
require('dotenv').config();

//CleanDB connection
//use connection pooling to improve the performance of MySQL and not overload the MySQL server with too many connections.
// https://codeforgeek.com/nodejs-mysql-tutorial/

let p = mysql.createPool({
    connectionLimit : 10, 
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

let pool = p.promise();

async function select_query(query){

    const conn = await pool.getConnection();

    try{
        const result = await conn.query(query)
        return result[0]

    } catch(err) {
        console.log(query)
        console.log("Failed")
        throw err

    } finally {
        conn.release();
    }

}

async function insert_query(query, inserts){

    const conn = await pool.getConnection();

    try{
        const result = await conn.query(query, inserts)
        return ['success',result[0].insertId]

    } catch(err) {
        console.log(query)
        console.log("Failed")
        throw err

    } finally {
        conn.release();
    }
}

async function update_query(query){

    const conn = await pool.getConnection();

    try{
        const result = await conn.query(query)
        return ['success']

    } catch(err) {
        console.log(query)
        console.log("Failed")
        throw err

    } finally {
        conn.release();
    }
    
}

async function delete_query(query){

    const conn = await pool.getConnection();

    try{
        await conn.query(query)
        return ['success']

    } catch(err) {
        console.log(query)
        console.log("Failed")
        throw err

    } finally {
        conn.release();
    }

}

module.exports = {pool, select_query, insert_query, update_query, delete_query};