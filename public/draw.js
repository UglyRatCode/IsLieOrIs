//file for handling drawing logic
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var isDrawing = false;
var lineWidth = 5;
var pos = {
    x: 0,
    y: 0
};
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

//Arrays for remembering user strokes to allow undo/redo functionality
var undo_array = [];
var redo_array = [];

//Sets up button functions - pulls by button class, sets property by button ID.
let clrButtons = document.querySelectorAll(".clrButton");
let thcButtons = document.querySelectorAll(".thcButton");

clrButtons.forEach(function(elem) {
    elem.addEventListener("click", function() {
        changeStrokeColour(elem.id.split("-").pop());
    });
});

thcButtons.forEach(function(elem) {
    elem.addEventListener("click", function() {
        changeStrokeThiccness(elem.id.split("-").pop());
    });
});

resize();

//add event listeners
window.addEventListener('resize', resize);
canvas.addEventListener('mousemove', draw, {
    passive: true
});
canvas.addEventListener('touchmove', draw, {
    passive: true
});
canvas.addEventListener('mousedown', startDraw, {
    passive: true
});
canvas.addEventListener('touchstart', startDraw, {
    passive: true
});
window.addEventListener('mouseup', stopDraw, {
    passive: true
});
canvas.addEventListener('touchstart', stopDraw, {
    passive: true
});

//beware, functions below

//resize canvas to half window size
function resize() {
    ctx.canvas.width = window.innerWidth / 2;
    ctx.canvas.height = window.innerHeight / 2;
}

function getPosition(e) {
    pos = {
        x: e.clientX - canvas.offsetLeft,
        y: e.clientY - canvas.offsetTop
    }
}

function draw(e) {
    if (!isDrawing) return;
    ctx.lineCap = 'round';
    ctx.strokeStyle = strokeColour;
    ctx.lineWidth = strokeThiccness;

    getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}

function startDraw(e) {
    getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    saveState(canvas);
    isDrawing = true;
    draw(e);
}

function stopDraw(e) {
    if (isDrawing) isDrawing = false;
}

function changeStrokeColour(colour) {
    strokeColour = colours[colour];
}

function changeStrokeThiccness(thiccness) {
    strokeThiccness = thicnesses[thiccness];
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveState() {
    undo_array.push(canvas.toDataURL());
}

function undoStroke() {
    restoreState(undo_array);
}

function restoreState(pop) {
    if (pop.length) {
        var restore_state = pop.pop();
        clearCanvas();
        var myImage = new Image(canvas.width, canvas.height);
        myImage.src = restore_state;
        myImage.onload = function() {
            ctx.drawImage(myImage, 0, 0, canvas.width, canvas.height);
        }
    }
}