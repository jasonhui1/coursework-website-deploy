const accom = require('./Accommodation.js')
const express = require('express');
const router = express.Router()
const mysql = require('mysql2');

const session = require('express-session');

require('dotenv').config();

router.use(session({
    secret: process.env.SECURE_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        // maxAge: 20
        // secure: true 
    }
}))

const {auth_user} = require('./User.js')

//initialise
let ranking_current = []
let ranking_previous = []
let last_update = next_update = ""

//refresh leaderboard every 12 hours (req 5.3)
const refresh_leaderboard_time = 12*3600*1000
setInterval(calculate_current_leaderboard, refresh_leaderboard_time)

start()
async function start(){
    //map the accommodation id and name into an array
    await accom.initialise()
    ranking_current = accom.get_ranking_current();
    get_last_next_update_time()
    ranking_previous = accom.get_ranking_previous();
    
}

async function calculate_current_leaderboard(){
    //map the accommodation id and name into an array
    await accom.calculate_current_leaderboard();
    get_last_next_update_time()
    ranking_current = accom.get_ranking_current();
}

function get_last_next_update_time(){
    let date = new Date()
    let am_pm_c = 'am'
    let am_pm_p = 'pm'

    if (date.getHours() >= 12){
        am_pm_c = 'pm'
        am_pm_p = 'am'

    } else {
        am_pm_c = 'am'
        am_pm_p = 'pm'

    }

    last_update = date.getHours() + am_pm_c;
    next_update = date.getHours() + am_pm_p;

}

//Send leaderboard data
router.get('/Main/get_leaderboard_data_current', auth_user, (request, response) => {

    response.json({
        "ranking": ranking_current.slice(0,3),
        "last_update": last_update,
        "next_update": next_update
    })

})
  
router.get('/Main/get_leaderboard_data_previous', auth_user, (request, response) => {
  
    response.json({
        "ranking": ranking_previous.slice(0,3),
    })

})


router.get('/Main/get_my_accommodation_ranking_current', auth_user, (request, response) => {

    let data = accom.get_my_accommodation_ranking(request.session.user.accommodation_id, time = 'current')

    response.json({
        "ranking": data[0],
        "position": data[1],
    })
})

router.get('/Main/get_my_accommodation_ranking_previous', auth_user, (request, response) => {

    let data = accom.get_my_accommodation_ranking(request.session.user.accommodation_id, time = 'previous')

    response.json({
        "ranking": data[0],
        "position": data[1],
    })
})

module.exports = router