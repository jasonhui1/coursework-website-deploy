$(document).ready(async function () {
    //Leaderboard
    await get_leaderboard_data(time = 'current');
    await get_leaderboard_data(time = 'previous');
    await get_last_winner() 
    await get_my_accommodation_data(time = 'current');
    await get_my_accommodation_data(time = 'previous');

    //Show waste amount and percentage
    await disp_weight(1)
    await disp_weight(2)

    //Get data for edit table
    await get_trash_data(1);
    await get_trash_data(2);


});

//display general waste
async function disp_weight(type){
    let url = '/get_weight/' + type
    response = await fetch(url);
    let res = await response.json();

    weight = parseFloat(res.weight)

    if(type == 1){
        document.getElementById("gw_value").innerHTML = weight;
    } else{
        document.getElementById("rw_value").innerHTML = weight;
    }

    r_weight = parseInt($('#rw_value').text());
    g_weight = parseInt($('#gw_value').text());

    $("#percentage").html((r_weight/(r_weight + g_weight)*100).toFixed(2).toString() + '%');

}

//add entry for general waste
async function add_weight(ele, type) {

    let weight = ele.val()
    
    $.ajax({
        url: "/add_trash_entry",
        type: "POST",
        data: { weight : parseFloat(weight) , trash_type : type },
        dataType: "json"})
        .done(async response => {  
            if(response.status == "success"){
                // window.location.href = "Main.html";
                await get_trash_data(type);
                await disp_weight(type)
                ele.val('')

            }
        })
}

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

    for (row of res.ranking){

        html += `<tr>\
        <td> ${row.position}</td>\
        <td> ${row.ticket_award}</td>\
        <td> ${row.name}</td>\
        <td> ${(row.percentage*100).toFixed(2)}% </td>\
        <td> ${row.has_ticket} </td>\
        </tr>`
        last_percentage = row.percentage

    }
    //Delete existing rows
    table.find('tbody tr').remove();
    //Add the rows
    table.find("tbody").append(html);

    if(time == 'current'){
        $('#last_update_leaderboard').html(res.last_update)
        $('#next_update_leaderboard').html(res.next_update)
    }

}

async function get_last_winner(){

    let response = await fetch('/Main/get_last_winner')
    let res = await response.json()
    $('#last_winner').html(res.accom_id)
    $('#last_prize').html(res.reward)

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
    let positions = res.ranking

    //have last position
    for (row of positions){

        console.log(row.position, res.position)
        if(row.position == res.position){
            html += `<tr style= "background-color: white; color: #000;">`


        } else {
            html += `<tr style= "background-color: orange; color: #000;">`
 
        }

        html += `
        <td> ${row.position}</td>\
        <td> ${row.ticket_award}</td>\
        <td> ${row.name}</td>\
        <td> ${(row.percentage*100).toFixed(2)}% </td>\
        <td> ${row.has_ticket} </td>\
        </tr>`
    }

    //add after the last row
    table.find("tr:last").after(html);
}


function open_edit(ele){
    //current row
    let weight_td = $(ele).closest('tr')
    //Make a new row, with a input field, save and cancel button
    let html = "<tr>"
    html += `<td><input style='width: 70px' type="number" placeholder = ${weight_td.find('td:eq(0)').text()}></input></td>`
    html += `<td class='d-none'>${weight_td.find('td:eq(1)').text()}</td>`
    html += `<td>${weight_td.find('td:eq(2)').text()}</td>`
    html += `<td class='d-none'>${weight_td.find('td:eq(3)').text()}</td>`
    html += `<td><button id="pop-up-edit" onclick="save_edit(this)"> Save </button></td>`
    html += `<td><button id="pop-up-delete" onclick="cancel_edit(this)"> Cancel </button></td>`
    html += "</tr>"

    weight_td.after(html)

    //focus the input
    weight_td.next().find('td:eq(0)').find('input').focus()

    //Hide the current row
    weight_td.addClass('d-none')
}

function cancel_edit(ele){

    let weight_td = $(ele).closest('tr')
    let prev_weight_td = weight_td.prev()

    prev_weight_td.removeClass('d-none')
    weight_td.remove()

}

//1 is general
//2 is recyclable
//Show data when loaded the percentage, call this function at document.ready (top)
async function get_trash_data(type){

    let url = '/get_trash_data/' + type
    response = await fetch(url);

    if(type == 1){
        table = $('#edit_gw_table');
    } else {
        table = $('#edit_rw_table');
    }

    let res = await response.json()
    let html = ""

    for (row of res.result){
        
        let weight = row.weight
        let type = row.trash_type_id
        let temp = new Date(row.time_added)
        let time = temp.toDateString()
        let trash_id = row.id

        html += `<tr>\
        <td> ${weight}</td>\
        <td class = 'd-none'> ${type}</td>\
        <td> ${time}</td>\
        <td class = 'd-none'>${trash_id}</td>\
        <td><button id="pop-up-edit" onclick="open_edit(this)"> Edit </button></td>
        <td><button id="pop-up-delete" onclick="delete_row(this)"> Remove </button></td>
        </tr>`
    }
    //Delete existing rows
    table.find('tbody').html("")
    //Add the rows
    table.find("tbody").append(html);

}

//update the entered new value
async function save_edit(ele){

    //the row of this cell
    let weight_td = $(ele).closest('tr')
    let weight = weight_td.find('td:eq(0)').find('input').val()
    //'General'/'Recyclable'
    let type =  weight_td.find('td:eq(1)').text()
    let trash_id = parseInt(weight_td.find('td:eq(3)').text())

    if(weight == ''){
        alert('no weight entered')
    } else {

    $.ajax({
        url: "/update_trash_entry",
        type: "POST",
        data: { id : trash_id , new_weight : parseInt(weight) },
        dataType: "json"})
        .done(async response => { 
            if(response.status == "success"){
                // window.location.href = "Main.html";
                get_trash_data(type)
                disp_weight(type);

            }
        })

    }

}

let delete_row = function(ele) {
    let weight_td = $(ele).closest('tr')
    let trash_id = parseInt(weight_td.find('td:eq(3 )').text())


    $.ajax({
        url: "/remove_trash_entry",
        type: "POST",
        data: { id : trash_id },
        dataType: "json",
        success: response => {  
            if(response.status == "success"){
                // window.location.href = "Main.html";
                let type =  weight_td.find('td:eq(1)').text()
                if(type == 1){
                    table = $('#edit_gw_table');
                } else {
                    table = $('#edit_rw_table');
                }
                table.find('tbody tr').remove();

                setTimeout(function(){
                    get_trash_data(type)
                    disp_weight(type);
                },200)

            }
        }
    });
}



$("#log-out").on('click', async function(event) {
    event.preventDefault();
    window.location = "../Site/Login.html";
    await fetch('/logout_user');

});