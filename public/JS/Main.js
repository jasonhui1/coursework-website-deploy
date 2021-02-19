
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