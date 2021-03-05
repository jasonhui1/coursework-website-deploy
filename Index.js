// JavaScript Document

console.log("Hello NODE")
const express = require('express');
const mysql = require('mysql2');
const path = require("path");
const fs   = require('fs');
require('dotenv').config();

//route to different files
const app = express();
const file_router = require('./FileConnection.js');
app.use(file_router);

const trash = require('./Trash.js');
app.use(trash)

const leaderboard_router = require('./Leaderboard.js');
app.use(leaderboard_router)

const submission = require('./Submission.js');
app.use(submission);

//Can request data correctly
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
//important!!!!!!! to get request
app.use(express.json({ limit: '3mb' }));

//change port depend on local or website
const port = process.env.PORT|| 3000
app.listen(port, () => console.log(`listening at ${port}`));

//folder name
// app.use(express.static('Website'));
app.use('/static', express.static('Website'));

//other files
const user = require('./User.js')
const accom = require('./Accommodation.js')

//CHECK LOGIN
app.post('/login_user', user.login_in_user, (request, response) => {

  //Log username entered
  console.log( "HELLO " + mysql.escape(request.body.user_name))

  response.json({
    status: 'success'
  })

})

//Register user
app.post('/register_user', async (request, response) => {

  request.body.accommodation_id = await accom.get_accommodation_id(request.body.accommodation)
  await user.register_user(request,response)
  
  // response.json({
  //   status: 'success'
  // })
})



