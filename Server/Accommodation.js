const db = require('./DatabaseConnection.js')
const mysql = require('mysql2');
const session = require('express-session');
require('dotenv').config();

//Use for sessions
const express = require('express');
const app = express()
app.use(session({
    secret: process.env.SECURE_KEY,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}))
app.use(express.json({ limit: '3mb' }));

const {get_current_raffle,query_last_raffle,query_current_raffle} = require('./Raffle.js')

let accom_id_name_map = [];

//map id and name into an array
async function get_accommodation_id_name_map(){

  let query = `SELECT * FROM accommodation`;
  let result = await db.select_query(query)

  if (result != null){
    // print(result)
    let last_id = result[result.length - 1].id
    accom_id_name_map = Array((last_id-1)/10).fill(null)

    for (row of result){

        accom_id_name_map[(row.id - 1)/10] = row.name
    }
  }

}

function get_accommodation_name(id){

    return accom_id_name_map[(id-1)/10]
}

async function get_accommodation_id(name){

  let query = `SELECT id FROM accommodation WHERE name = ${mysql.escape(name)} LIMIT 1`;
  let result = await db.select_query(query)

  // initialise
  let accommodation_id = 0

  //accommdation name doesn't exist
  //NEED TO DO: also check if user_name existed already 
  if(result.length == 0){
        //nned to add this accommodation name to database
      throw `Accommation name '${name}' not added into the database yet`
      return 'fail: Accommodation name not found'

    } else {
      accommodation_id = result[0].id
      return accommodation_id;

    }

}

class Accommodation_trash {
  constructor(general, recyclable) {
    this.general = general;
    this.recyclable = recyclable;
    this.percentage = 0
    this.ticket_amount = 0;
  }
}

let ranking_current = []
let ranking_previous = []

let accommodation_trash_current = [];
let accommodation_trash_previous = []


async function query_sum_accom_trash(round, array){

  let query = `SELECT trash_accommodation_id, trash_type_id, weight FROM trash WHERE trash_round = ${mysql.escape(round)}`
  let result = await db.select_query(query)

  if(result.length == 0){
    console.log("No result")
    return

  } else {
    
    for (row of result){
      let accom_id = row.trash_accommodation_id

      if(row.trash_type_id == 1){
        array[(accom_id - 1) / 10].general += parseInt(row.weight)

      } else{
        array[(accom_id - 1) / 10].recyclable += parseInt(row.weight)
      }

      array[(accom_id - 1) / 10].ticket_amount = await get_ticket_amount(round, accom_id, array)

    }

  }
}

async function get_ticket_amount(round, accom_id, array){

  let query = `SELECT amount FROM ticket WHERE ticket_round = ${mysql.escape(round)} AND ticket_accom_id = ${mysql.escape(accom_id)} `
  let result = await db.select_query(query)

  if(result.length == 0){
    query = 'INSERT INTO ticket (ticket_round, ticket_accom_id, amount) VALUES (?,?,?)';
    let inserts = [round, accom_id, 0];
    db.insert_query(query, inserts) 
    return 0

  } else {
    return result[0].amount
  }
}



//sum the amount of trash of all accommodations, stored in the accommodation_trash_current array
async function sum_trash(time){

  if (time == 'current'){
    let round = await query_current_raffle()
    await query_sum_accom_trash(round, accommodation_trash_current)
  } else {
    let last_round = await query_last_raffle()
    await query_sum_accom_trash(last_round, accommodation_trash_previous)
  }

}

//calculate the rank of all accommodations and saved in the ranking array
function rank_accommodation(array, save_array){

  for (i = 0; i < array.length; i++){

    curr_accom = array[i]
    let accom_id = i*10 + 1
    let accom_name = accom_id_name_map[i]

    if((curr_accom.recyclable + curr_accom.general) != 0){

      save_array.push({"id": accom_id, "name": accom_name, "percentage": curr_accom.recyclable / (curr_accom.recyclable + curr_accom.general), 'has_ticket': curr_accom.ticket_amount})
    } else {
      save_array.push({"id": accom_id, "name": accom_name, "percentage": 0, 'has_ticket': curr_accom.ticket_amount})
      // console.log(save_array)
    }

  }
  //sort by percentage, descending order
  save_array.sort((a,b) => b.percentage - a.percentage)
  caluclate_position_ticket_award(save_array)
}

function caluclate_position_ticket_award(array){

  let position = 1
  let last_percentage = array[0].percentage
  let base_ta = (1/(Math.pow(2, 1.3)) * 100 + 1/(Math.pow(2,0.5)) * 100)
  let ticket_award = base_ta

  for (accom of array){

    if (accom.percentage < last_percentage){
      position += 1
      last_percentage = accom.percentage

    }
    if (accom.percentage != 0){
      ticket_award = Math.round((1/(Math.pow(position + 1, 1.3)) * 100 + 1/(Math.pow(position + 1,0.5)) * 100) / base_ta * 100)

    } else {
      ticket_award = 0
    }

    accom.position = position
    accom.ticket_award = ticket_award

  }
}

//get ranking of the current user
function get_my_accommodation_ranking(id, time = 'current'){

  let array = []
  if (time == 'current'){
    array = ranking_current

  } else if (time == 'previous') {
    array = ranking_previous
  }

  for (i = 0; i < array.length; i++){
    row = array[i]

    if(row.id == id){
      //Show before and after your accommodation
      return [array.slice(Math.max(0,i-1), Math.min(i+2, array.length)),row.position];
    }
  }
}


//run these functions when the server starts
async function initialise(){
    await get_accommodation_id_name_map()
    await calculate_current_leaderboard()
    await calculate_previous_leaderboard()

}

async function calculate_current_leaderboard(){
  ranking_current = []
  accommodation_trash_current = Array(accom_id_name_map.length).fill().map(x => new Accommodation_trash(0,0))
  await sum_trash('current')

  rank_accommodation(accommodation_trash_current, ranking_current);
}

async function calculate_previous_leaderboard(){

  accommodation_trash_previous = Array(accom_id_name_map.length).fill().map(x => new Accommodation_trash(0,0))
  await sum_trash('previous')

  rank_accommodation(accommodation_trash_previous, ranking_previous);

}

function get_ranking_current(){

  return ranking_current;
}

function get_ranking_previous(){

  return ranking_previous;
}


module.exports = {

    initialise,
    calculate_current_leaderboard,
    calculate_previous_leaderboard,
    get_accommodation_name,
    get_accommodation_id,
    get_ranking_current,
    get_ranking_previous,
    get_my_accommodation_ranking
}