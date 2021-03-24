const db = require('./DatabaseConnection.js')
const mysql = require('mysql2');
require('dotenv').config();

async function query_current_raffle(){

    let date = new Date();
    //format the date yyyy-mm-dd
    let formatDate = date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);

    let query = `SELECT round FROM raffle WHERE (start_date < ${mysql.escape(formatDate)} AND end_date >= ${mysql.escape(formatDate)})`
    let result = await db.select_query(query)

    if(result.length != 0){
      return result[0].round

    } else {
      throw `current date ${formatDate} is not in a round yet`
    }
}

async function query_last_raffle(){

  let date = new Date();
  //format the date yyyy-mm-dd
  let formatDate = date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);

  let query = `SELECT round FROM raffle WHERE (start_date < ${mysql.escape(formatDate)})`
  let result = await db.select_query(query)

  if(!result.length <= 2){
    return result[result.length-2].round

  } else {
    return null

  }
}

async function get_current_raffle (request, response, next){

    request.body.raffle_round = await query_current_raffle();
    next();
}

module.exports = {
    get_current_raffle, query_last_raffle, query_current_raffle,
}