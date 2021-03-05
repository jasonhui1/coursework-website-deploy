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

async function get_accommodation_name(id){

  let query = `SELECT name FROM accommodation WHERE id = ${id} LIMIT 1`;
  let result = await db.select_query(query)

  if(result.length == 0){
      console.log("id: " + id)
      return "None"

  } else {
    return result[0].name;
  }
}

async function get_accommodation_id(name){

  console.log(name)
  let query = `SELECT id FROM accommodation WHERE name = '${name}' LIMIT 1`;
  let result = await db.select_query(query)

  // initialise
  let accommodation_id = 0

  //accommdation name doesn't exist
  //NEED TO DO: also check if email/ user_name existed already 

  if(result.length == 0){
        //nned to add name to database
      
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
  }
}

let ranking_current = []
let ranking_previous = []

let accommodation_trash_current = [];
let accommodation_trash_previous = []


async function query_sum_accom_trash(_round, array){

  let query = "";
  let round = _round;

  // if(_round != 'all'){
  //   round = _round;

  // } else {
  //   round = find_last_round();
  // }

  query = `SELECT trash_accommodation_id, trash_type_id, weight FROM trash WHERE trash_round = ${round}`
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
    }

  }
}

//sum the amount of trash of all accommodations, stored in the accommodation_trash_current array
async function sum_trash(){

  let round = await query_current_raffle()
  await query_sum_accom_trash(round, accommodation_trash_current)
  let last_round = await query_last_raffle()
  await query_sum_accom_trash(last_round, accommodation_trash_previous)

}

//calculate the rank of all accommodations and saved in the ranking array
function rank_accommodation(array, save_array){

  for (i = 0; i < array.length; i++){

    curr_accom = array[i]
    let accom_id = i*10 + 1
    let accom_name = accom_id_name_map[i]

    if((curr_accom.recyclable + curr_accom.general) != 0){

      save_array.push({"id": accom_id, "name": accom_name, "percentage": curr_accom.recyclable / (curr_accom.recyclable + curr_accom.general)})
    } else {
      save_array.push({"id": accom_id, "name": accom_name, "percentage": 0})
    }

  }
  //sort by percentage, descending order
  save_array.sort((a,b) => b.percentage - a.percentage)
}

//get ranking of the current user
function get_my_accommodation_ranking(id, time = 'current'){

  let array = []
  if (time == 'current'){
    array = ranking_current

  } else if (time == 'previous') {
    array = ranking_previous
  }

  let position = 0
  let last_percentage = 10000

  for (row of array){

    if(row.percentage < last_percentage){
      position += 1
    } 

    if(row.id == id){

      row.position = position
      return row;
    }

    last_percentage = row.percentage
  }
}

//run these functions when the server starts
async function initialise_accommodation(){

  await get_accommodation_id_name_map()
  accommodation_trash_current = Array(accom_id_name_map.length).fill().map(x => new Accommodation_trash(0,0))
  accommodation_trash_previous = Array(accom_id_name_map.length).fill().map(x => new Accommodation_trash(0,0))
  await sum_trash()

  rank_accommodation(accommodation_trash_current, ranking_current);
  rank_accommodation(accommodation_trash_previous, ranking_previous);

}

function get_ranking_current(){

  return ranking_current;
}

function get_ranking_previous(){

  return ranking_previous;
}

module.exports = {
    
    initialise_accommodation,
    get_accommodation_name,
    get_accommodation_id,
    get_ranking_current,
    get_ranking_previous,
    get_my_accommodation_ranking
}