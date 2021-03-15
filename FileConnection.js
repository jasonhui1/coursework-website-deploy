//Handle url request
const fs   = require('fs');
const path = require("path");
const express = require('express');
const router = express.Router()
const {auth_user} = require('./Server/User.js')
const session = require('express-session');
require('dotenv').config();

router.use(session({
    secret: process.env.SECURE_KEY,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}))

router.get('/', (request, response) => {
	
    response.sendFile(path.join(__dirname,'Website/index.html'));
})

//Disallow going to Main.html if not logged in
router.get('/Site/:filepath', (request, response) => {

	//Add html to the end if not
	let param = request.params.filepath;
	if(!param.endsWith(".html")){
		param += '.html';
	}
  
	if(param == "Main.html"){
	  console.log("Main Access")
  
	//   console.log("WHEN ACCESS MAIN SESSION ")
	//   console.log(request.session)
	  //Check if this user is logged in or not
	  if(typeof request.session !== 'undefined' && typeof request.session.user !== 'undefined'){
		let logged_in = auth_user(request.session.user.id, request.session.user.user_name)
  
		if(logged_in){
		  response.sendFile(path.join(__dirname,'Website/Site/Main.html'));
		  return
  
		}
  
	  } 
	  //Not logged in
	  response.redirect('Login.html')
	  return;
	}
	//Check other url if exists
	let p = __dirname + '/Website/Site/' + param ;

	if(fs.existsSync(p)){
		response.sendFile(p)
		
	} else{
		response.sendFile(__dirname + '/Website/Site/' + '404.html')
  	}

})

router.get('/CSS/:filepath', (request, response) => {

	let param = request.params.filepath;
  // console.log(param)
	let p = __dirname + '/Website/' + 'CSS/' + param;

	if(fs.existsSync(p)){
		response.sendFile(p)
		
	} else{
		//something
	}
	
})

router.get('/JS/:filepath', (request, response) => {

	let param = request.params.filepath;
  // console.log(param)
	let p = __dirname + '/Website/' + 'JS/' + param;

	if(fs.existsSync(p)){
		response.sendFile(p)
		
	} else{
		//something
	}
})

router.get('/images/:filepath', (request, response) => {

	let param = request.params.filepath;
  // console.log(param)
	let p = __dirname + '/Website/' + 'images/' + param;

	if(fs.existsSync(p)){
		response.sendFile(p)
		
	} else{
		//do somethinf
    console.log(p)
	}
})

router.get('/:d1/:d2/"d3*', (request, response) => {

	let d1 = request.params.d1;
    let d2 = request.params.d2;
    let d3 = request.params.d3;

	let p = path.join(__dirname,"Website",d1,d2,d3)

    console.log(p)

	if(fs.existsSync(p)){
		response.sendFile(p)
		
	} else{
        //File not exist
        response.sendFile(__dirname + '/Website/Site/' + '404.html')
	}
})

module.exports = router;