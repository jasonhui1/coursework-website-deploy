// JavaScript Document

console.log("Hello NODE")
const express = require('express');
//const mysql = require('mysql');
//const sqlite3 = require('sqlite3');
const app = express();

//change port
// const port = || 2000

app.listen(process.env.PORT , () => console.log(`listening at ${process.env.PORT }`));

//folder name
app.use(express.static('public'));

