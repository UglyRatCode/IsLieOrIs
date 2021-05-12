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
var activesessions = [];
var activegames = [];

//session middleware
io.use((socket,next)=>
    {
        //if none, give it a session ID
        if (!socket.handshake.auth.seshID){
            socket.seshID = newSessionID();
            activegames.push(socket.seshID);
        } else socket.seshID = socket.handshake.auth.seshID;
        next();
    }
);

//socket handler
io.on('connection', (socket)=>{
    socket.emit('session',socket.seshID);
    socket.on('join',(room,response)=>{
        if(roomExists(room)){
            socket.join(room);
            io.to(room).emit('new connection');
            response({status: 200});
        } else response({status: 404});
    });
    socket.on('new', (response) => {
        let id = newRoomID();
        if (id == "err") response({status: 404});
        else{
            let newgame = new game(id,socket,socket,0);
            activegames.push(newgame);
            socket.join(newgame.roomID);
            response({status:200, code:newgame.roomID});
    }});
});

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
    if(activesessions.indexOf(randID) > -1)
        newID();
    else if (activesessions.length > 10000)
        return "err";
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
    constructor(sessionID, username){
        this.sessionID = sessionID;
        this.username = username;
    }
};
