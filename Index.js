// JavaScript Document

console.log("Hello NODE")
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require("path");
const fs   = require('fs');
const session = require('express-session');
const bodyParser = require('body-parser');

require('dotenv').config();


const app = express();
const router = require('./FileConnection.js');
app.use(router);


//change port depend on local or website
const port = process.env.PORT|| 3000
app.listen(port, () => console.log(`listening at ${port}`));

app.use(bodyParser.urlencoded({extended: false}));


//folder name
// app.use(express.static('Website'));
app.use('/static', express.static('Website'));
app.use(express.json({ limit: '3mb' }));

//Use for sessions
let users = []

app.use(session({
  secret: process.env.SECURE_KEY,
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
}))

  
//Connect to the database
const pool = require('./DatabaseConnection.js')


//OLD
// function handleDisconnect(myconnection) {
//   myconnection.on('error', function(err) {
//     console.log('Re-connecting lost connection');
//     database.destroy();
//     database = mysql.createConnection( {   
//       host: process.env.HOST,
//       user: process.env.USER,
//       password: process.env.PASSWORD,
//       database: process.env.DATABASE});
//     handleDisconnect(database);
//     database.connect();
//   });
// }

// handleDisconnect(database);


//Disallow going to Main.html if not logged in
app.get('/Site/:filepath', (request, response) => {

	let param = request.params.filepath;
	if(!param.endsWith(".html")){
		param += '.html';
	}

  console.log(param)

  if(param == "Main.html"){
    console.log("Main Access")

      if(users.includes(request.session.userId)){
          // response.redirect('Main.html')
          response.sendFile(path.join(__dirname,'Website/Site/Main.html'));
          
      } else {
          response.redirect('Login.html')
      }
  }

	let p = __dirname + '/Website/Site/' + param ;

	if(fs.existsSync(p)){
		response.sendFile(p)
		
	} else{
		response.sendFile(__dirname + '/Website/Site/' + '404.html')
	}
	
})

//Register user
app.post('/register_user', (request, response) => {

  //Can add validation before
  //Add to database
  pool.getConnection((err, conn) => {
    if(err) {
      conn.release();
      throw err;
    }

    let sql = `SELECT id FROM accommodation WHERE name = ${mysql.escape(request.body.accommodation)} LIMIT 1`;
    let accommodation_id = 0

    conn.query(sql, function(err, result) {

      if (err) {
        conn.release();
        throw err;
      }

      //accommdation name doesn't exist
      //NEED TO DO: also check if email/ user_name existed already 
      if(result.length == 0){
        
        conn.release();
        response.json({
          //later: accommodation name not found
          status: 'fail'
        })
        throw `Accommation name '${request.body.accommodation}' not added into the database yet`

      }

      for (rows of result){
        accommodation_id = rows.id

        let password = bcrypt.hashSync(request.body.password, 10);
        sql = "INSERT INTO user (user_name, password, email, user_accommodation_id) VALUES (?)";
        let inserts = [request.body.user_name, password, request.body.email, accommodation_id];

        conn.query(sql, [inserts], function(err, result) {
          conn.release();
          if (err) throw err;

          //add into session
          users.push(result.insertId)
          request.session.userId = result.insertId
          request.session.userName = request.body.user_name

          response.json({
            status: 'success'
          })
          
        });
        
      }

    })

  });
})

  //CHECK LOGIN
app.post('/login_user', (request, response) => {

  let sql = `SELECT id, user_name, password FROM user WHERE user_name = ${mysql.escape(request.body.username)} LIMIT 1`;
  //Log username entered
  console.log(mysql.escape(request.body.user_name))

  pool.getConnection((err, conn) => {
    if(err) {
      conn.release();
      throw err;
    }

    let query = 'SELECT * FROM user';   

    conn.query(query, async function(err, result) {
      conn.release();

      if (err) throw err;

      //username doesnt exist
      if(result.length == 0){
        response.json({
          status: 'fail'
        })
      }
      //password matches or not
      for (rows of result){
        if(await bcrypt.compare(request.body.password, rows.password)){
          console.log("RIGHT")

          // users.push({id: rows.id, user_name: rows.user_name})
          users.push(rows.id)
          // console.log(users)
          request.session.userId = rows.id
          request.session.userName = rows.user_name
          console.log(request.session)

          response.json({
            status: 'success'
          })

        } else {
          console.log("WRONG")
          response.json({
            status: 'fail'
          })
        }
      }
    });
  });
})


// TEST adding encrypt password using bcrypt to the database, can use this username nad testpw to login

    // let username = 'admin';
    // let testpw = 'test';

    // let password = await bcrypt.hashSync(testpw, 10);

    // let sql = "INSERT INTO user (first_name, last_name, email, permission,user_name, password) VALUES (?)";
    // let inserts = ['Group', '4', 'test@adf.com', 1, username, password];

    //  database.query(sql, [inserts], function (err, result) {
    //    if (err) throw err;
    //    console.log("1 record inserted");
    //  });


    // sql = `SELECT user_name, password FROM user WHERE user_name = ${mysql.escape(username)} LIMIT 1`;

    // database.query(sql, async function (err, result) {
    //     if (err) throw err;
    //     for (rows of result){
    //     console.log(rows.user_name);
    //     console.log(await bcrypt.compare(testpw, rows.password))
    //     }
    // });


//Get raffle data
  // app.get('/get_raffle_data', (request, response) => {
      
  //     console.log("raffle data request");
      
  //     let s = 4
      
  //     let sql = `SELECT start_date, end_date FROM ?? WHERE ?? = ${s} LIMIT 1`;
  //     let inserts = ['raffle', 'round'];
  //     sql = mysql.format(sql, inserts);
      
  //       database.query(sql, function (err, result, fields) {
          
  //         if (err) throw err;
      
  //         for (rows of result) {
  //             console.log(rows.start_date)
  //             console.log(rows.end_date)		
  //         }
          
  //         //return
  //         response.json(result);
  //       });
  // });


  // app.get('/get_raffle_data', (request, response) => {
      
  //     console.log("raffle data request");
      
  //     let s = 4
      
  //     let sql = `SELECT start_date, end_date FROM ?? WHERE ?? = ${s} LIMIT 1`;
  //     let inserts = ['raffle', 'round'];
  //     sql = mysql.format(sql, inserts);
      
  //       database.query(sql, function (err, result, fields) {
          
  //         if (err) throw err;
      
  //         for (rows of result) {
  //             console.log(rows.start_date)
  //             console.log(rows.end_date)		
  //         }
          
  //         //return
  //         response.json(result);
  //       });
  // });
  
  // app.post('/api', (request, response) => {
  
  //     console.log("GOT DATA: " + request.body);
  //     const data = request.body;
  //     console.log("GOT DATA: " + data.name);
  //     // const timestamp = Date.now();
  //     // data.timestamp = timestamp;
  //     // let sql = "INSERT INTO user (first_name) VALUES (?)";
  //     // let inserts = [data.name];
  //     // sql = mysql.format(sql, inserts);
  
  //     // database.query(sql,  (err, result) => {
  //     //     if (err) throw err;
  //     //     console.log("1 record inserted");
  //     //     // console.log(result);
  //     // });
  
  //     response.json(data);
  //   });
