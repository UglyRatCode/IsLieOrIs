//get the socket, don't autoconnect though because we need cookies first mmm cookies
var socket = io({autoConnect: false});


//TODO CHANGE ALL session storage to local storage
//get cookie mmmm
var player = {sessionID: sessionStorage.getItem('sessionID'), username: sessionStorage.getItem('username'), roomID: sessionStorage.getItem('roomID')};
socket.auth = {player};
socket.connect();

//get DOM Elements
var submitUserForm = document.getElementById('submitName');
var newRoomBtn = document.getElementById('newRoom');
var joinRoomBtn = document.getElementById('joinRoom');
var roomForm = document.getElementById('roomForm');
var confirmJoinRoom = document.getElementById('confirmJoinRoom');
var roomCodeDisplay = document.getElementById('RoomCodeDisplay');
var membersList = document.getElementById('MembersList');


var promptUserDiv = document.getElementById('PromptUsername');
var joinRoomDiv = document.getElementById('PromptRoom');
var lobbyDiv = document.getElementById('Lobby');



//set up local variables

var myRoom;


//event listeners
submitUserForm.addEventListener('click',()=>setUsername(document.getElementById('nameInput').value));

joinRoomBtn.addEventListener('click', () => {
    if(roomForm.style.display =='none') roomForm.style.display = 'block';
    else roomForm.style.display = 'none';
});

confirmJoinRoom.addEventListener('click', (e)=> {e.preventDefault(),joinRoom(document.getElementById('roomInput').value);});

newRoomBtn.addEventListener('click',() => { 
    socket.emit('new',(response) => {
        if (response.status == 404) alert ('Room could not be created');
        else setRoom(response.code);
    });
});

//socket listeners
socket.on('connect_error', (err) =>{
    console.log(err.message);
    if(err.message == 'missing session'){
        player.sessionID = err.data.sessionID;
        socket.auth = {player};
        sessionStorage.setItem('sessionID',err.data.sessionID);
        console.log(err.data.nameNeeded);
        if(err.data.nameNeeded) displayUserPrompt(); 
    }
});

socket.on('session_connected',(sessionDetails) => {
    player = sessionDetails;
    socket.auth = {player};
    if(sessionDetails.roomID) {joinRoom(sessionDetails.roomID);};
});
socket.on('username_needed',()=>{
    displayUserPrompt();
});

socket.on('player_list',(players)=>{
    membersList.innerHTML = '';
    for (let i = 0; i < players.length; i++){
        let member = document.createElement('li');
        member.innerHTML = players[i].username + (players[i].isHost ? ' (Host)' : '') + (players[i].isConnected ? '' : ' (dc\'d)');
        membersList.appendChild(member);
    }
});

socket.on('image_stream',(img)=>{
    renderImage(img);
});


//logic
//displayRoomPrompt();


// action functions



function setUsername(username){
    player.username = username;
    socket.auth = {player};
    sessionStorage.setItem('username', player.username);
    socket.emit('update username', player.username);
};

function setRoom(roomCode){
    player.roomID = roomCode;
    socket.auth = {player};
    roomCodeDisplay.innerHTML = 'Room Code: ' + roomCode;
    sessionStorage.setItem('roomID',roomCode);
    displayLobby();
};

function joinRoom(roomCode){
    if (!roomCode) return;
    socket.emit('join',roomCode,(response) => {
        if(response.status == 404) alert('No room found');  //try to change to nice alert instead of AAAH BROWSER POPUP
        else {
            setRoom(roomCode);
            displayLobby();
        }
    });
};

//dom functiosn

function displayUserPrompt(){
    promptUserDiv.style.display = "block";
    joinRoomDiv.style.display = "none";
    lobbyDiv.style.display = "none";
};
function displayRoomPrompt(){
    promptUserDiv.style.display = "none";
    joinRoomDiv.style.display = "block";
    lobbyDiv.style.display = "none";
};
function displayLobby(){
    promptUserDiv.style.display = "none";
    joinRoomDiv.style.display = "none";
    lobbyDiv.style.display = "block";
};

