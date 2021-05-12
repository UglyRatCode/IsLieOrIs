var socket = io();

//set up elements
var canvas = document.getElementById('canvas');
var join  = document.getElementById('joinSesh');
var news  = document.getElementById('newSesh');
var roomInput = document.getElementById('roomcode');
var ctx = canvas.getContext('2d');



resize();

//set up other variables
var isDrawing = false;
var lineWidth = 5;
var pos= {x:0,y:0};

//add event listeners

window.addEventListener('resize',resize);
document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', startDraw);
document.addEventListener('mouseup', stopDraw);
join.addEventListener('click', () => {socket.emit('join',roomInput.value)});
news.addEventListener('click',() => {socket.emit('new')});


//beware, functions below

//resize canvas to half window size
function resize (){
    ctx.canvas.width = window.innerWidth/2;
    ctx.canvas.height = window.innerHeight/2;
}
function getPosition(e){
    pos = {x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop}
}
function draw (e) {
    if (!isDrawing) return;
    ctx.lineCap = 'round'
    getPosition(e);
    ctx.lineTo(pos.x,pos.y);
    ctx.stroke();
}
function startDraw (e) {
    isDrawing = true;
    ctx.lineWidth = 2;
    getPosition(e);
    ctx.moveTo(pos.x,pos.y);
    draw(e);
}
function stopDraw (e) {
    getPosition(e);
    isDrawing = false;
}
