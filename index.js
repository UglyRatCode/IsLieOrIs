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
var timeOutDuration = 600000;
var activeplayers = [];
var activegames = [];
var sessionHitList = [];

//session middleware
io.use((socket,next)=>
    {  
        let authPlayer = socket.handshake.auth.player;
        //if session doesnt exist, send back a session id in an error
        if (!authPlayer.sessionID || !getSessionIndex(authPlayer.sessionID)){
            console.log('1');
            const err = new Error("missing session");
            err.data = {sessionID: newSessionID(), nameNeeded: !authPlayer.username};
            socket.player = new player(err.data.sessionID,null,null,true);
            activeplayers.push(socket.player); 
            next(err);
        } else {
            let roomPassBack = getRoomIndex(authPlayer.roomID) || false;
            socket.player = new player(authPlayer.sessionID, authPlayer.username, roomPassBack,true);
            removeFromHitList(socket.player.sessionID);
            activeplayers[getSessionIndex(authPlayer.sessionID)] = socket.player;
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
        if(getRoomIndex(room)){
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
    socket.on('disconnect',() => {
        activeplayers[getSessionIndex(socket.player.sessionID)].hitListIndex = sessionHitList.push(setTimeout(()=>killSession(socket.player.sessionID),timeOutDuration));
    });
});

//functions

function killSession(sessionID){
    activeplayers.splice(getSessionIndex(sessionID),1);
};

function removeFromHitList(sessionID){
    let hitIndex = activeplayers[getSessionIndex(sessionID)].hitListIndex;
    if(hitIndex > -1) {
        console.log("saved ur life");
        clearTimeout(sessionHitList[hitIndex]);
        sessionHitList.splice(hitIndex,1);
    }
};

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

function getSessionIndex(id){
    for (let i=0;i<activeplayers.length;i++){
        if (activeplayers[i].sessionID == id)
            return i;
    }
    return false;
}

function getRoomIndex(id){
    for (let i=0;i<activegames.length;i++){
        if (activegames[i].roomID == id)
            return i;
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
    constructor(sessionID, username, roomID, hitListIndex = -1){
        this.sessionID = sessionID;
        this.username = username;
        this.roomID = roomID;
        this.hitListIndex = hitListIndex;
    }
};

const teams = {"TeamA":1,"TeamB":2};
