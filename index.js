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
var activesessions = [];
var activegames = [];
var sessionHitList = [];

//session middleware
io.use((socket,next)=>
    {  
        let authPlayer = socket.handshake.auth.player;
        //if session doesnt exist, send back a session id in an error
        if (!authPlayer.sessionID || !getSessionIndex(authPlayer.sessionID)){
            const err = new Error("missing session");
            err.data = {sessionID: newSessionID(), nameNeeded: !authPlayer.username};
            socket.player = new player(err.data.sessionID,null,null);
            let sessionpacket = {sessionID: socket.player.sessionID, hitListIndex: -1};
            activesessions.push(sessionpacket);
            next(err);
        } else {
            let roomPassBack = getRoomIndex(authPlayer.roomID) > -1 ? authPlayer.roomID : false;     
            socket.player = new player(authPlayer.sessionID, authPlayer.username, roomPassBack);
            removeFromHitList(socket.player.sessionID);
            next();
        } 
        
    }
);

//socket handler
io.on('connection', (socket)=>{
    console.log('connected');
    socket.emit('session_connected',socket.player);
    if(!socket.player.username) io.to(socket.id).emit('username_needed');
    socket.on('update username',(username) => {
        socket.player.username = username;
    });
    socket.on('join',(room,response)=>{
        if(getRoomIndex(room) >-1){
            socket.join(room);
            socket.player.roomID = room;
            if(activegames[getRoomIndex(room)].getPlayerIndex(socket.player.sessionID)>-1) //if reconnecting just update
                activegames[getRoomIndex(room)].connectionUpdatePlayer(socket.player.sessionID,true); 
            else activegames[getRoomIndex(room)].players.push(socket.player);
            io.to(room).emit('player_list',activegames[getRoomIndex(room)].players);
            response({status: 200});
        } else response({status: 404});
    });
    socket.on('new', (response) => {
        let id = newRoomID();
        if (id == "err") response({status: 404});
        else{
            socket.player.isHost = true;
            let newgame = new game(id,[],socket.player.sessionID,0);
            let newGameIndex = activegames.push(newgame) -1;
            activegames[newGameIndex].players.push(socket.player);
            socket.join(newgame.roomID);
            socket.player.roomID = id;
            response({status:200, code:newgame.roomID});
            io.to(socket.player.roomID).emit('player_list',activegames[getRoomIndex(socket.player.roomID)].players);
    }});
    socket.on('broadcast_image', (imgData)=>{
        if (getRoomIndex(socket.player.roomID)>-1){
            socket.to(socket.player.roomID).emit('image_stream',(imgData));
        }
    });
    socket.on('disconnect',() => {
        let roomIndex = getRoomIndex(socket.player.roomID);
        console.log('attempting to disconnect, roomindex '+ roomIndex);
        if(roomIndex > -1){
            let playerIndex = activegames[roomIndex].getPlayerIndex(socket.player.sessionID);
            activegames[roomIndex].connectionUpdatePlayer(socket.player.sessionID, false);
            console.log('ishost '+ socket.player.isHost + ' lenthg' + activegames[roomIndex].players.length);
            if (activegames[roomIndex].players[playerIndex].isHost && activegames[roomIndex].players.length > 1) 
                activegames[roomIndex].changeHost(true);
            io.to(socket.player.roomID).emit('player_list',activegames[roomIndex].players);
        }
        activesessions[getSessionIndex(socket.player.sessionID)].hitListIndex = sessionHitList.push(setTimeout(()=>killSession(socket.player.sessionID),timeOutDuration));
    });
});



//timemethod, pls pass function
function testTime(func){
    let t0 = performance.now();
    func();
    let t1 = performance.now();
    console.log('Function took ' + t1-t0 + 'ms to execute');
}

//functions

function killSession(sessionID){
    activegames[getRoomIndex(sessionID)].removePlayer(sessionID);
    if (activegames[getRoomIndex(sessionID)].players.length < 1) activegames.splice(getRoomIndex(sessionID),1);
    activesessions.splice(getSessionIndex(sessionID),1);
};

function removeFromHitList(sessionID){
    let hitIndex = activesessions[getSessionIndex(sessionID)].hitListIndex;
    if(hitIndex > -1) {
        clearTimeout(sessionHitList[hitIndex]);
        sessionHitList.splice(hitIndex,1);
        activesessions[getSessionIndex(sessionID)].hitListIndex = -1;
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
    for (let i = 0; i < activesessions.length; i++){
        if (activesessions[i].sessionID == randID) {
            inUse = true;
            break;
        };
    };
    if (activesessions.length > 100000)
        return "err";
    else if(inUse)
        newSessionID(); 
    else return randID;
};

function getSessionIndex(id){
    for (let i=0;i<activesessions.length;i++){
        if (activesessions[i].sessionID == id)
            return i;
    }
    return false;
}

function getRoomIndex(id){
    for (let i=0;i<activegames.length;i++){
        if (activegames[i].roomID == id)
            return i;
    }
    return -1;
}

class game {
    constructor(roomID,players,host,gameState){
        this.roomID = roomID;
        this.players= players;
        this.host = host;
        this.gameState = gameState;
    };
    
    connectionUpdatePlayer(seshID,isConnected){
        for(let i = 0; i < this.players.length; i++){
            if (this.players[i].sessionID == seshID){
                this.players[i].isConnected = isConnected;
                break;
            }
        }
    };

    removePlayer(seshID){
        for(let i = 0; i < this.players.length; i++){
            if (this.players[i].sessionID == seshID){
                thisplayers.splice(i,1);
                break;
            }
        }
    };
    getPlayerIndex(seshID){
        for(let i = 0; i < this.players.length; i++){
            if (this.players[i].sessionID == seshID){
                return i;
            }
        }
        return -1;
    }
    changeHost(useFirstAvailable, newHostSeshID = ''){
        console.log('attempting to change host');
        let curHost = this.host;
        if (!useFirstAvailable){
            for(let i = 0; i < this.players.length; i++){
                if(this.players[i].sessionID == newHostSeshID){
                    this.players[i].isHost = true;
                    this.host = newHostSeshID;
                }
            }
            
        } else {
            for(let i = 0; i<this.players.length; i++){
                if (this.players[i].isConnected && this.players[i].sessionID != curHost){
                    this.players[i].isHost = true;
                    this.host = this.players[i].sessionID;
                    break;
                }
            }
            console.log('didnt find anyone');
        }
        if(this.host != curHost){ //if still same then we failed to reset
            for(let i = 0; i < this.players.length; i++){
                if(this.players[i].sessionID == curHost){
                    this.players[i].isHost = false;
                }
            }
        }
    }
};

class player {
    constructor(sessionID, username, roomID, team = teams.None, isHost = false,isTurn = false, isConnected = true, hitListIndex = -1){
        this.sessionID = sessionID;
        this.username = username;
        this.roomID = roomID;
        this.team = teams
        this.isHost = isHost;
        this.isConnected = isConnected;
        this.hitListIndex = hitListIndex;
    }
};

const teams = {"None": 0, "TeamA":1,"TeamB":2};

const roundTypes = {"TextLies":0, "Possession":1,"ThisIsMy":2, "Location":3};
