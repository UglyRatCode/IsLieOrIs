'use strict';

const express = require('express');
const app = express();
const glblPort = process.env.PORT || 1337;

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

var server = app.listen(glblPort, () => { console.log('the server is now running on port ', glblPort) });

var io = require('socket.io')(server);
var activeplayers = [];
var activegames = [];

//session middleware
io.use((socket,next)=>
    {  
        let authPlayer = socket.handshake.auth.player; 
        //if session doesnt exist, send back a session id in an error
        if (!authPlayer.sessionID){
            console.log('1');
            const err = new Error("missing session");
            err.data = {sessionID: newSessionID(), nameNeeded: !authPlayer.username};
            socket.player = new player(err.data.sessionID,null,null);
            activeplayers.push(socket.player); 
            next(err);
        } else {
            socket.player = new player(authPlayer.sessionID, authPlayer.username, authPlayer.roomID);
            console.log('userneeded? ' + (authPlayer.username || false));
            next();
        } 
        
    }
);

//socket handler
io.on('connection', (socket)=>{
    socket.emit('session_connected',socket.player);
    if(!socket.player.username) io.to(socket.id).emit('username_needed');
    console.log('connected');
    socket.on('update username',(username) => {
        socket.player.username = username;
    });
    socket.on('join',(room,response)=>{
        if(roomExists(room)){
            socket.join(room);
            socket.player.roomID = room;
            io.to(room).emit('new_connection');
            response({status: 200});
        } else response({status: 404});
    });
    socket.on('new', (response) => {
        let id = newRoomID();
        if (id == "err") response({status: 404});
        else{
            let newgame = new game(id,socket.player.sessionID,socket.player.sessionID,0);
            activegames.push(newgame);
            socket.join(newgame.roomID);
            socket.player.roomID = id;
            response({status:200, code:newgame.roomID});
    }});
});

//functions
function newRoomID(){
    let randID = Math.random().toString(36).slice(2,8);
    if(activegames.indexOf(randID) > -1)
        newID();
    else if (activegames.length > 10000)
        return "err";
    else return randID;
};
function newSessionID(){
    let randID = Math.random().toString(36).slice(2,12);
    let inUse = false;
    for (let i = 0; i < activeplayers.size; i++){
        if (activeplayers[i].sessionID == randID) {
            inUse = true;
            break;
        };
    };
    if (activeplayers.size > 100000)
        return "err";
    else if(inUse)
        newSessionID(); 
    else return randID;
};

function roomExists(id){
    for (let i=0;i<activegames.length;i++){
        if (activegames[i].roomID == id)
            return true;
    }
    return false;
}

class game {
    constructor(roomID,players,host,gameState){
        this.roomID = roomID;
        this.players = players;
        this.host = host;
        this.gameState = gameState;
    }
    
    addPlayer(player){
        this.players.push(player);
    }
    removePlayer(player){

    }
};

class player {
    constructor(sessionID, username, roomID){
        this.sessionID = sessionID;
        this.username = username;
        this.roomID = roomID;
    }
};
