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

