const accom = require('./Accommodation.js')
const express = require('express');
const router = express.Router()
const session = require('express-session');

require('dotenv').config();

router.use(session({
    secret: process.env.SECURE_KEY,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}))


//initialise
let ranking_current = []
let ranking_previous = []
start()
async function start(){
    //map the accommodation id and name into an array
    await accom.initialise_accommodation();
    ranking_current = accom.get_ranking_current();
    ranking_previous = accom.get_ranking_previous();
}

//Send leaderboard data
router.get('/Main/get_leaderboard_data_current',  (request, response) => {

    response.json({
        "ranking": ranking_current,
    })

})
  
router.get('/Main/get_leaderboard_data_previous',  (request, response) => {
  
    response.json({
        "ranking": ranking_previous,
    })

})


router.get('/Main/get_my_accommodation_ranking_current',  (request, response) => {

    let data = accom.get_my_accommodation_ranking(request.session.user.accommodation_id, time = 'current')

    response.json({
        "ranking": data,
    })
})

router.get('/Main/get_my_accommodation_ranking_previous',  (request, response) => {

    let data = accom.get_my_accommodation_ranking(request.session.user.accommodation_id, time = 'previous')

    response.json({
        "ranking": data,
    })
})

module.exports = router