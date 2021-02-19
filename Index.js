// JavaScript Document

console.log("Hello NODE")
const express = require('express');
//const mysql = require('mysql');
//const sqlite3 = require('sqlite3');
const app = express();

//change port
 const port = process.env.PORT|| 3000

app.listen(port, () => console.log(`listening at ${port}`));

//folder name
app.use(express.static('Website'));

