const db = require('./DatabaseConnection.js')
const mysql = require('mysql2');
const raffle = require('./Raffle.js')
const accom = require('./Accommodation.js')
require('dotenv').config();

async function get_reward_name(id){

    query = `SELECT name FROM reward WHERE id = ${mysql.escape(id)}`
    result = await db.select_query(query)

    return result[0].name
}

async function get_last_winner(){

    let round = await raffle.query_last_raffle()
    console.log(round)

    let query = `SELECT raffle_winners_accom_id, raffle_winners_reward_id FROM raffle_winners WHERE raffle_winners_round = ${mysql.escape(round)}`
    let result = await db.select_query(query)

    if(result.length != 0){

        row = result[0]

        let accom_name = await accom.get_accommodation_name(row.raffle_winners_accom_id)
        let reward_id = await get_reward_name(row.raffle_winners_reward_id)

        return [accom_name, reward_id]

    } else {
      throw `This round  ${round} has no winner yet`
    }
}

module.exports = {

    get_last_winner,
    get_reward_name

}