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
})
