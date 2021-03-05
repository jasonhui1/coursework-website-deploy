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
    // cookie: { secure: true }
}))


async function get_trash_type_id (type){

    let query = `SELECT id FROM trash_type WHERE type = ${mysql.escape(type)} LIMIT 1`
    let result = await db.select_query(query)
    
    if(result.length != 0){
        let trash_type_id = result[0].id;
        return trash_type_id;
    } 
}

async function get_trash_type_name(id){

    let query = `SELECT type FROM trash_type WHERE id = ${mysql.escape(id)} LIMIT 1`
    let result = await db.select_query(query)

    if(result.length != 0){
        let name = result[0].type;
        return name;

        }
}


//I comment it coz I think it is easier to update with just knowing the trash_id

// async function get_trash_id (request, response, next){

//     let raffle_round = request.body.raffle_round;
//     //!!!TO DO: Use this: let accomm_id = request.session.user.accommodation_id;
//     //51 is for testing
//     let accomm_id = 51;
//     let trash_type_id = request.body.trash_type_id;
//     let date_time = request.body.date_time;

//     //Get id of trash entry to edit
//     let query = `SELECT id FROM trash WHERE trash_round = ${raffle_round} AND trash_accommodation_id = ${accomm_id} AND trash_type_id = ${trash_type_id} AND time_added = '${date_time}' ORDER BY time_added DESC LIMIT 1`;

//     try{
//         const result = await conn.query(query) 

//         if(result.length != 0){
//             request.body.trash_id = result[0].id;
//             next()
//             return
    
//         }

//     } catch {
//         console.log("trash type name query failed")
//         console.log(`Possible reason: trash id ${trash_type_id} with accommodation id ${accommodation_id} with date_added ${date_time} not found!!!`)


//     } finally {
//         conn.release();
//     }
// }

  //Edit trash entry for user (can be general or recyclable, must specify type)
  //Not yet connected to front end
// router.post('/edit_trash_entry', get_trash_type_id, get_current_raffle, get_trash_id, (request, response) => {
//     let weight = request.body.weight;
//     let date_time = request.body.date_time
//     // let user_id = users[0];
  
//     pool.getConnection((err, conn) => {
//       if (err){
//         conn.release()
//         throw err;
//       }
    
//       //Get trash type id from type provided
//       let trash_type_id = request.body.trash_type_id;
//       let trash_id = request.body.trash_id;
  
//       //Perform edit on existing entry
//       let edit_query = `UPDATE trash SET weight = ${weight} WHERE id = ${trash_id} AND trash_type_id = ${trash_type_id}`;
//       conn.query(edit_query, function(err, result) {
//         conn.release();
  
//         if (err) {
//           response.json({
//             status: 'fail'
//           })
  
//           throw err;
//         }
//         else {
//           response.json({
//             status: 'success'
//           })
  
//           console.log("Edit entry success")
//         }
//       })
//     })
// })

module.exports = router;
