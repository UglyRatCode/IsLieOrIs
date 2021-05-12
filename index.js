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

io.on('connection', (socket)=>{
    socket.on('join',(room)=>{console.log(room)});
    socket.on('new', (response) => {
        let id = newID();
        if (id == "err") response({status: 404});
        else{
            activesessions.push(id);
            socket.join(id);
            response({status:200, code:id});
    }});
});

function newID(){
    let randID = Math.random().toString(36).slice(2,8);
    if(activesessions.indexOf(randID) > -1)
        newID();
    else if (activesessions.length > 10000)
        return "err";
    else return randID();
};