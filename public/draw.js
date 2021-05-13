//file for handling drawing logic

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var isDrawing = false;
var lineWidth = 5;
var pos= {x:0,y:0};
var strokeColour = "#FF0000";
var strokeThiccness = 6;


//Any changes to colour / stroke width to be made in dictionaries below. 
const colours = {
    "Black": "#000000",
    "Red": "#FF0000",
    "Blue": "#0000FF",
    "Green": "#00FF00",
};

const thicnesses = {
    "Small": 2,
    "Normal": 4,
    "Large": 8,
    "XL": 16,
    "2XL": 32
};

resize();

//Sets up button functions - pulls by button class.
let clrButtons = document.querySelectorAll(".clrButton");
let thcButtons = document.querySelectorAll(".thcButton");

clrButtons.forEach(function (elem) {
    elem.addEventListener("click", function() {changeStrokeColour(elem.id.split("-").pop());
    });
});

thcButtons.forEach(function (elem) {
    elem.addEventListener("click", function() {changeStrokeThiccness(elem.id.split("-").pop());
    });
});

//add event listeners

window.addEventListener('resize',resize);
document.addEventListener('mousemove', draw);
document.addEventListener('touchmove', draw);
document.addEventListener('mousedown', startDraw);
document.addEventListener('touchstart', startDraw);
document.addEventListener('mouseup', stopDraw);
document.addEventListener('touchstart', stopDraw);

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
    ctx.lineCap = 'round';
    ctx.strokeStyle = strokeColour;
    ctx.lineWidth = strokeThiccness;
    getPosition(e);
    ctx.lineTo(pos.x,pos.y);
    ctx.stroke();
}

function startDraw (e) {
    ctx.beginPath();
    isDrawing = true;
    getPosition(e);
    ctx.moveTo(pos.x,pos.y);
    draw(e);
}
function stopDraw (e) {
    getPosition(e);
    isDrawing = false;
}

function changeStrokeColour(colour) {
    isDrawing = false;
    strokeColour = colours[colour];
    console.log(`Colour changed to: ${colour} (${strokeColour})`);
}

function changeStrokeThiccness(thiccness) {
    isDrawing = false;
    strokeThiccness = thicnesses[thiccness];
    console.log(`Stroke width changed to ${thiccness} (Value: ${strokeThiccness})`)
}