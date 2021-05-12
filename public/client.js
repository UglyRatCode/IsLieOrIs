var socket = io({autoConnect: false});

//get cookie mmm
var sessionID = localStorage.getItem('sessionID');
if(sessionID) socket.auth = {seshID: sessionID};
socket.connect();

//set up elements

var join  = document.getElementById('joinSesh');
var news  = document.getElementById('newSesh');
var roomInput = document.getElementById('roomcode');
var testDiv = document.getElementById('teststuff');

//set up other variables

var myRoom;
console.log(JSON.stringify(socket.auth.seshID));

//set up DOM bits
var roomDisplay = document.createElement('p');
roomDisplay.innerHTML = 'Room Code: ';
testDiv.appendChild(roomDisplay);

//event listeners
join.addEventListener('click', () => {socket.emit('join',roomInput.value,(response) => {
    if(response.status == 404) alert('No room found');
    else setRoom(response.code);
});
});

news.addEventListener('click',() => {socket.emit('new',(response) => {
    if (response.status == 404) alert ('Room could not be created');
    else setRoom(response.code);
});
});

//socket listeners
socket.on('session',(sessionID) => {
    socket.auth = {seshID: sessionID};
    localStorage.setItem('sessionID',sessionID);
});

//functions

function setRoom(roomCode){
    myRoom = roomCode;
    roomDisplay.innerHTML = 'Room Code: ' + myRoom;
}