// JavaScript Document

console.log("Hello NODE")
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require("path");
const session = require('express-session');
const bodyParser = require('body-parser');
const fs   = require('fs');




const app = express();

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true }
}))


//change port depend on local or website
 const port = process.env.PORT|| 3000

app.listen(port, () => console.log(`listening at ${port}`));

//folder name
// app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('Website'));
// app.use('/static', express.static('Website'));
app.use(express.json({ limit: '1mb' }));

//CleanDB connection
const database = mysql.createConnection({
    host: "eu-cdbr-west-03.cleardb.net",
    user: "bd35bdd40f5964",
    password: "075d8b73",
    database: "heroku_77c81211407e3c6"
  });
  
  //TEST
  database.connect(async function(err) {
    if (err) throw err;
    console.log("Connected!");

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

  });

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

  app.get('/', (request, response) => {
	
    response.sendFile(path.join(__dirname,'Website/index.html'));
  })
  

  app.get('/Main.html'), (request, response) => {
    console.log("MAIN ACCESS")
  }

  //CHECK LOGIN
  app.post('/loginTest', (request, response) => {

    console.log("HELLLOoo")

    let sql = `SELECT user_name, password FROM user WHERE user_name = ${mysql.escape(request.body.username)} LIMIT 1`;
    console.log(mysql.escape(request.body.username))

    database.query(sql, async function (err, result) {
        if (err) throw err;

        //username doesnt exist
        if(result.length == 0){
          response.json({
            status: 'fail'
          })
        }

        console.log("USERNA<E NO T EXIST")
        //password matches or not
        for (rows of result){
          if(await bcrypt.compare(request.body.password, rows.password)){
            console.log("RIGHT")
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


app.get('/:filepath', (request, response) => {

	let param = request.params.filepath;
	if(!param.endsWith(".html")){
		param += '.html';
	}

	let p = __dirname + '/Website/Site/' + param ;

	if(fs.existsSync(p)){
		response.sendFile(p)
		
	} else{
		response.sendFile(__dirname + '/Website/' + '/404.html')
	}
	
})

app.get('/Site/:filepath', (request, response) => {

	let param = request.params.filepath;
	if(!param.endsWith(".html")){
		param += '.html';
	}

	let p = __dirname + '/Website/Site/' + param ;

	if(fs.existsSync(p)){
		response.sendFile(p)
		
	} else{
		response.sendFile(__dirname + '/Website/' + '/404.html')
	}
	
})


app.get('/CSS/:filepath', (request, response) => {

	let param = request.params.filepath;
	let p = __dirname + '/CSS/Site/' + param;

	if(fs.existsSync(p)){
		response.sendFile(p)
		
	} else{
		response.body.append("NOT FOUND CSS")
	}
	
})
