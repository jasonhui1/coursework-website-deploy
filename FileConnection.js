const fs   = require('fs');
const path = require("path");
const express = require('express');
const router = express.Router()

router.get('/', (request, response) => {
	
    response.sendFile(path.join(__dirname,'Website/index.html'));
})


// router.get('/:filepath', (request, response) => {

// 	let param = request.params.filepath;
// 	if(!param.endsWith(".html")){
// 		param += '.html';
// 	}

// 	let p = __dirname + '/Website/Site/' + param ;

// 	if(fs.existsSync(p)){
// 		response.sendFile(p)
		
// 	} else{
// 		response.sendFile(__dirname + '/Website/Site/' + '404.html')
// 	}
	
// })

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