//Files
const db = require('./DatabaseConnection.js')
const mysql = require('mysql2');
const raffle = require('./Raffle.js')
require('dotenv').config();

//Express
const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: false}));
router.use(express.json({ limit: '3mb' }));

const session = require('express-session');

router.use(session({
    secret: process.env.SECURE_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { 
      maxAge: 20
      // secure: true 
    }
    // cookie: { secure: true }
}))

const {auth_user} = require('./User.js')


//get weights to display in submission box
router.get('/get_weight/:type', auth_user, async (request, response) => {

  let accom_id = request.session.user.accommodation_id;
  let round = await raffle.query_current_raffle();
  let trash_type = request.params.type;
  
  let query = `SELECT weight FROM trash WHERE trash_round = ? AND trash_accommodation_id = ? AND trash_type_id = ?`;
  let inserts = [round, accom_id, trash_type]
  result = await db.select_query(mysql.format(query, inserts));

  let sum = 0.0;

  for (x of result) {
      sum += parseFloat(x.weight);
  }

  if (result.length == 0) {
    response.json({
      "weight" : 0
    })
  }
  else {
    response.json({
      "weight" : sum
    })
  }
})

//Add trash entry for user (can be general or recyclable, must specify type)
router.post('/add_trash_entry', auth_user, async (request, response) => {

    let accom_id = request.session.user.accommodation_id;
    let round = await raffle.query_current_raffle();
    let trash_type = parseInt(request.body.trash_type);
    let weight = parseFloat(request.body.weight);

    let insert_query = 'INSERT INTO trash (trash_round, trash_accommodation_id, trash_type_id, weight) VALUES (?,?,?,?)';
    let insert_inserts = [round, accom_id, trash_type, weight];

    await db.insert_query(insert_query, insert_inserts);

    response.json({
        status : "success"
    })
})

//Get trash entry data for editing table
router.get('/get_trash_data/:type', auth_user, async (request, response) => {

  //:type is a parameter that can be entered through the path, ex. /get_trash_date/1 
  //Example: /get_trash_date/1 , gives type = 1
  //Example: /get_trash_date/0 , gives type = 0

  let trash_type = request.params.type;
  let round = await raffle.query_current_raffle();
  let accom_id = request.session.user.accommodation_id;

  let query = `SELECT id, weight, time_added, trash_type_id FROM trash WHERE trash_round = ? AND trash_accommodation_id = ? AND trash_type_id = ? ORDER BY time_added DESC LIMIT 3 `;
  let inserts = [round, accom_id, trash_type]
  let result = await db.select_query(mysql.format(query,inserts));

  response.json({
    "result" : result
  })

})
      
module.exports = router;