var socket = io();

//set up elements

var join  = document.getElementById('joinSesh');
var news  = document.getElementById('newSesh');
var roomInput = document.getElementById('roomcode');
var testDiv = document.getElementById('teststuff');

//set up other variables

var myRoom;

//set up DOM bits
var roomDisplay = document.createElement('p');
roomDisplay.innerHTML = 'Room Code: ';
testDiv.appendChild(roomDisplay);

join.addEventListener('click', () => {socket.emit('join',roomInput.value,(response) => {
    if(response.status == 404) alert('No room found');
});
});
news.addEventListener('click',() => {socket.emit('new',(response) => {
    if (response.status == 404) alert ('Room could not be created');
    else{ 
        myRoom = response.code;
        roomDisplay.innerHTML = 'Room Code: ' + myRoom;
    }
});
});
