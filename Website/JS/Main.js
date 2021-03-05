// const { parse } = require("dotenv/types");

//display weights in submission box
let disp_weight = function(type, callback) {

    $.ajax({
        url: "/get_weight",   //url location of request handler
        type: "POST",   //Type of request
        data: { trash_type : type },
        dataType: "json",
        success: response => {  //If a response is received from server
            callback(response.weight);
        }
    });

}

//trash percentage
let get_percentage = function() {

    let g_weight = parseFloat(document.getElementById("gw_value").innerHTML);
    let r_weight = parseFloat(document.getElementById("rw_value").innerHTML);

    console.log(g_weight, r_weight);
    document.getElementById("percentage").innerHTML = (r_weight/(r_weight + g_weight)*100).toFixed(2).toString() + '%';

}

//display general waste
disp_weight(1, function(weight) {
    document.getElementById("gw_value").innerHTML = weight;
});

//display recyclable waste
disp_weight(2, function(weight) {
    document.getElementById("rw_value").innerHTML = weight;

    get_percentage();
});

//add entry for general waste
let add_g_weight = function() {

    let g_weight = parseFloat(document.getElementById("input_add_gw").value);
    
    $.ajax({
        url: "/add_trash_entry",
        type: "POST",
        data: { weight : g_weight , trash_type : 1 },
        dataType: "json",
        success: response => {  
            if(response.status == "success"){
                window.location.href = "Main.html";
            }
        }
    });
    
}

//add entry for recyclable waste
let add_r_weight = function() {

    let r_weight = parseFloat(document.getElementById("input_add_rw").value);

    $.ajax({
        url: "/add_trash_entry",
        type: "POST",
        data: { weight : r_weight , trash_type : 2 },
        dataType: "json",
        success: response => {  
            if(response.status == "success"){
                window.location.href = "Main.html";
            }
        }
    });

}

$(document).ready(function () {
    get_leaderboard_data(time = 'current');
    get_leaderboard_data(time = 'previous');

    get_my_accommodation_data(time = 'current');
    get_my_accommodation_data(time = 'previous');

});

async function get_leaderboard_data(time = 'current'){

    let table;
    let response;

    if(time == 'current'){
        response = await fetch('/Main/get_leaderboard_data_current');
        table = $('#current_leader_board');

    } else if (time == 'previous') {
        response = await fetch('/Main/get_leaderboard_data_previous');
        table = $('#previous_leader_board');

    }

    let res = await response.json()
    let html = ""
    let position = 0
    let last_percentage = 10000
    let ticket_award = 110


    for (row of res.ranking){

        if(row.percentage < last_percentage){
            if(ticket_award >= 0){
                ticket_award -= 10
            }
            position += 1
        }

        html += `<tr>\
        <td> ${position}</td>\
        <td> ${ticket_award}</td>\
        <td> ${row.name}</td>\
        <td> ${(row.percentage*100).toFixed(2)}% </td>\
        <td> ?? </td>\
        </tr>`

        last_percentage = row.percentage

    }
    //Delete existing rows
    table.find('tbody tr').remove();
    //Add the rows
    table.find("tbody").after(html);

}

async function get_my_accommodation_data(){

    let table;
    let response;

    if(time == 'current'){
        response = await fetch('/Main/get_my_accommodation_ranking_current');
        table = $('#current_leader_board');

    } else if (time == 'previous') {
        response = await fetch('/Main/get_my_accommodation_ranking_previous');
        table = $('#previous_leader_board');

    }

    let res = await response.json()

    let html = ""
    let rank = res.ranking
    let position = rank.position
    ticket_award = 100 - (position - 1) *10


    html += `<tr style= "background-color: white; color: #000;">\
    <td> ${position}</td>\
    <td> ${ticket_award}</td>\
    <td> ${rank.name}</td>\
    <td> ${(rank.percentage*100).toFixed(2)}% </td>\
    <td> ?? </td>\
    </tr>`

    //add after the last row
    table.find("tr:last").after(html);
}



function add(number, element){
	
	element.text(parseFloat(element.text()) + parseFloat(number));

}

function replace(number, element){
	
	element.text(parseFloat(number));

}


//show measure value in the table
$('#gw_button').on('click', function(){

    $('#gw_value_modal').text($("#gw_value").text() + $("#gw_unit").text());
});


$('#rw_button').on('click', function(){

    $('#rw_value_modal').text($("#rw_value").text() + $("#rw_unit").text());
});