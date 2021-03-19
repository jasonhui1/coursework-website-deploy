const db = require('./DatabaseConnection.js')
const mysql = require('mysql2');

const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: false}));
router.use(express.json({ limit: '3mb' }));

const {get_current_raffle,query_last_raffle,query_current_raffle} = require('./Raffle.js')

const session = require('express-session');
require('dotenv').config();

router.use(session({
    secret: process.env.SECURE_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        // secure: true 
      }
}))

const {auth_user} = require('./User.js')


// async function get_trash_type_id (type){

//     let query = `SELECT id FROM trash_type WHERE type = ${mysql.escape(type)} LIMIT 1`
//     let result = await db.select_query(query)
    
//     if(result.length != 0){
//         let trash_type_id = result[0].id;
//         return trash_type_id;
//     } 
// }

// async function get_trash_type_name(id){

//     let query = `SELECT type FROM trash_type WHERE id = ${mysql.escape(id)} LIMIT 1`
//     let result = await db.select_query(query)

//     if(result.length != 0){
//         let name = result[0].type;
//         return name;

//         }
// }

router.post('/update_trash_entry', auth_user, async (request, response) => {
    let id = request.body.id
    let weight = request.body.new_weight
    let query = `UPDATE trash SET weight = ? WHERE id = ?`
    let inserts = [weight, id]
    await db.update_query(mysql.format(query, inserts))

    response.json ({
        status : "success"
    })
})

router.post('/remove_trash_entry', auth_user, async (request, response) => {
    let id = request.body.id
    let query = `DELETE FROM trash WHERE id = ${mysql.escape(id)}`
    await db.delete_query(query)

    response.json ({
        status : "success"
    })
})

module.exports = router;
