//Handles user related
//Connect to the database
const db = require('./DatabaseConnection.js')
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
const users = []
require('dotenv').config();

//Use for sessions
const express = require('express');
const app = express()
app.use(session({
    secret: process.env.SECURE_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { 
      // secure: true 
    }
}))

app.use(express.json({ limit: '3mb' }));

//middleware for auth user
function auth_user(request, response, next){

  if(request.session.user != undefined){

    let user_id = request.session.user.id
    let user_name = request.session.user.user_name

    for (user of users){
      if(user.id === user_id && user.user_name === user_name){
        return next()
      }
    }

    response.redirect('../Site/Login.html')
  }

  response.redirect('../Site/Login.html')
}

//function to check if user is logged in
function auth_user_bool(user_id, user_name){

  if (typeof user_id !== 'undefined' && typeof user_name !== 'underfined'){
    for (user of users){
      if(user.id === user_id && user.user_name === user_name){
        return true
      }
    }
  }
  return false
}

async function register_user(request, response, next){

  let accommodation_id = request.body.accommodation_id
  let user_name = request.body.user_name
  let email = request.body.email
  let password = bcrypt.hashSync(request.body.password, 10);

  let query = "INSERT INTO user (user_name, password, email, user_accommodation_id) VALUES (?,?,?,?)";
  let inserts = [user_name, password, email, accommodation_id];

  let _result = await db.insert_query(query, inserts)
  let result = _result[0]
  let insertId = _result[1]

  if(result == 'success'){
  //add into session
    user = {"id": insertId, "user_name": user_name, "accommodation_id": accommodation_id};
    users.push(user)
    request.session.user = user
    console.log("finished registed user" + user_name)
          
    response.json({
        status: 'success'
    })
    console.log("Successfully added user " + request.body.user_name)

  } else {
    response.json({
      status: 'fail'
    })
  }
  
};
 

async function login_in_user(request, response, next){

  let query = `SELECT id, user_name, password, user_accommodation_id FROM user WHERE user_name = ${mysql.escape(request.body.user_name)} LIMIT 1`;
  let result = await db.select_query(query)
  //username doesnt exist
  if(result[0].length == 0){
      console.log("length = " + result[0].length + "QUERY : " + query)
      response.json({
      status: 'fail'
      })
      return;
  }

  //check if password matches or not
  if(await bcrypt.compare(request.body.password, result[0].password)){
      console.log("RIGHT")

      user = {"id": result[0].id, "user_name": result[0].user_name, "accommodation_id": result[0].user_accommodation_id};
      users.push(user)

      request.session.user = user

      //req 1.3, session expires in 15 mins (after login in)
      let expire_time = 1000*60*15
      request.session.cookie.maxAge = expire_time
      console.log()

      next()
      return

  } else {
      console.log("WRONG")
      response.json({
      status: 'fail'
      })
      return
  }
}

function logout_user(current_user){


    for (i = 0; i < users.length; i++){
      user = users[i]
      console.log(current_user)
      if (current_user.id == user.id && current_user.user_name == user.user_name){
        users.pop(i)
        return true
      }
    }

    return false
}
  

module.exports = {

    users,
    auth_user,
    auth_user_bool,
    register_user,
    login_in_user,
    logout_user
}