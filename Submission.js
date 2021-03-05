//Files
const db = require('./DatabaseConnection.js')
const raffle = require('./Raffle.js')
//const users = require('./User.js')
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
    // cookie: { secure: true }
}))

//get weights to display in submission box
router.post('/get_weight', async (request, response) => {
    let accom_id = request.session.user.accommodation_id;
    let round = await raffle.query_current_raffle();
    let trash_type = parseInt(request.body.trash_type);
    
    let query = `SELECT weight FROM trash WHERE trash_round = (${round}) AND trash_accommodation_id = (${accom_id}) AND trash_type_id = (${trash_type})`;
    result = await db.select_query(query);

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
router.post('/add_trash_entry', async (request, response) => {

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
      
module.exports = router;