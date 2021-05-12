var socket = io();

//set up elements

var join  = document.getElementById('joinSesh');
var news  = document.getElementById('newSesh');
var roomInput = document.getElementById('roomcode');

//set up other variables

var myRoom;
console.log(JSON.stringify(socket.auth));


//event listeners
join.addEventListener('click', ()=>joinRoom(roomInput.value));

news.addEventListener('click',() => {socket.emit('new',(response) => {
    if (response.status == 404) alert ('Room could not be created');
    else myRoom = response.code;
});

//socket listeners
socket.on('connected',(sessionDetails) => {
    socket.auth = {seshID: sessionDetails.seshID};
    localStorage.setItem('sessionID',sessionDetails.seshID);
    console.log(sessionDetails.roomID==true);
    console.log(sessionDetails.roomID==false);
    if(sessionDetails.roomID) {joinRoom(sessionDetails.roomID);};
});

//functions

function setRoom(roomCode){
    myRoom = roomCode;
    roomDisplay.innerHTML = 'Room Code: ' + myRoom;
}

function joinRoom(roomCode){socket.emit('join',roomCode,(response) => {
    if(response.status == 404) alert('No room found');
    else setRoom(roomCode);
});
}
