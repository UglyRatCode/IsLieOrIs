var socket = io();

//set up elements

var join  = document.getElementById('joinSesh');
var news  = document.getElementById('newSesh');
var roomInput = document.getElementById('roomcode');

//set up other variables

var myRoom;


join.addEventListener('click', () => {socket.emit('join',roomInput.value,(response) => {
    if(response.status == 404) alert('No room found');
});
});
news.addEventListener('click',() => {socket.emit('new',(response) => {
    if (response.status == 404) alert ('Room could not be created');
    else myRoom = response.code;
});
});
