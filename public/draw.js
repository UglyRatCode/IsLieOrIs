//file for handling drawing logic
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var isDrawing = false;
var lineWidth = 5;
var pos = {
    x: 0,
    y: 0
};
var strokeColour = "#000000";
var strokeThiccness = 6;

//Any changes to colour / stroke width to be made in dictionaries below. 
const colours = {
    "Black": "#000000",
    "Red": "#FF0000",
    "Blue": "#0000FF",
    "Green": "#00FF00",
    "White": "#FFFFFF",
    "Yellow": "#FFFF00",
    "Cyan": "#00FFFF",
    "Magenta": "#FF00FF"
};

const thicnesses = {
    "Small": 2,
    "Normal": 4,
    "Large": 6,
    "XL": 8,
    "2XL": 12
};

//Arrays for remembering user strokes to allow undo/redo functionality
var undo_array = [];
var redo_array = [];

var isListening = false;

resize();

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
    isDrawing = false;
    socket.emit('broadcast_image', canvas.toDataURL());
}

function changeStrokeColour(colour) {
    strokeColour = colours[colour];
    console.log(`Trying to change colour to: ${colour}`)
}

function changeStrokeThiccness(thiccness) {
    strokeThiccness = thicnesses[thiccness];
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveState() {
    let curState = canvas.toDataURL();
    undo_array.push(curState);
}

function undoStroke() {
    restoreState(undo_array);
}

function restoreState(pop) {
    if (pop.length) {
        var restore_state = pop.pop();
        renderImage(clearCanvas);
    }
}
function renderImage(image_src){
        clearCanvas();
        var myImage = new Image(canvas.width, canvas.height);
        myImage.src = image_src;
        myImage.onload = function() {
            ctx.drawImage(myImage, 0, 0, canvas.width, canvas.height);
        }
}