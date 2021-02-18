// JavaScript Document

console.log("Hello NODE")
const express = require('express');
//const mysql = require('mysql');
//const sqlite3 = require('sqlite3');
const app = express();

//change port
const port = process.env.PORT || 3000
app.listen(3000, () => console.log('listening at 3000'));

//folder name
app.use(express.static('public'));

//sqlite code
//const db = new sqlite3.Database('database.db');
//
//db.all("SELECT first_name, last_name FROM User", (error, rows) => {
//    rows.forEach((row) => {
//        console.log(row.first_name + " " + row.last_name);
//    })
//});

//change
//var database = mysql.createConnection({
//  host: "127.0.0.1",
//  user: "root",
//  password: "jason",
//  database: "test"
//});

//insert
//database.connect(function(err) {
//  if (err) throw err;
//  console.log("Connected!");
//  let sql = "INSERT INTO raffle (start_date, end_date) VALUES (15500145,11154889)";
//  database.query(sql, function (err, result) {
//    if (err) throw err;
//    console.log("1 record inserted");
//  });
//});

//app.get('/get_raffle_data', (request, response) => {
//	
//	console.log("raffle data request");
//	
//	let s = 4
//	
//	let sql = `SELECT start_date, end_date FROM ?? WHERE ?? = ${s} LIMIT 1`;
//	let inserts = ['raffle', 'round'];
//	sql = mysql.format(sql, inserts);
//	
//  	database.query(sql, function (err, result, fields) {
//		
//		if (err) throw err;
//	
//		for (rows of result) {
//			console.log(rows.start_date)
//			console.log(rows.end_date)		
//		}
//		
//		//return
//		response.json(result);
//  	});
//});