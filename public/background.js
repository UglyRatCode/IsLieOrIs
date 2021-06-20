var canvas = document.getElementById('lines');
var canvasW = canvas.width = window.innerWidth;
var canvasH = canvas.height = window.innerHeight;
var ctx = canvas.getContext("2d");
var raf;

var active_lines = [];
var maxDist = 35;
var minDist = 10;
var lineSpeed = 10;
var max_lines = 50;
var starter_lines = 1;
var lineWidth = 5;
var directions = [
    [0,1],
    [1,0],
    [0,-1],
    [-1,0],
    [.7,.7],
    [.7,-.7],
    [-.7,-.7],
    [-.7,.7],
]
var first_line = {

    //starting coords (center of screen as standard)
    x: canvasW / 2,
    y: canvasH / 2,

    //velocity values
    vx: 0,
    vy: 0,
    width: 5,

};

function createLine(line_template) {

    this.x = line_template.x;
    this.y = line_template.y;
    this.width = line_template.width / 2;

    do {
        var direction = directions[ (Math.random() * directions.length) | 0];
        this.vx = direction[0];
        this.vy = direction[1];
    } while (
        (this.vx === -line_template.vx && this.vy === -line_template.vy) || (this.vx === line_template.vx && this.vy === line_template.vy));


    this.vx *= lineSpeed;
    this.vy *= lineSpeed;
    this.dist = (Math.random() * (maxDist - minDist) + minDist);
}

createLine.prototype.step = function () {
    var dead = false;

    var prevX = this.x;
    var prevY = this.y;

    this.x += this.vx;
    this.y += this.vy;

    --this.dist;

    if (this.x < 0 || this.x > canvasW || this.y < 0 || this.y > canvasH)
        dead = true;

    if (this.dist <= 0) {
        this.dist = (Math.random() * (maxDist - minDist) + minDist);
        if (active_lines.length < max_lines) {
            active_lines.push(new createLine(this));
        }
        if (Math.random() < .5) {
            dead = true;
        }
    }

    ctx.beginPath();
    ctx.lineWidth = this.width;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(prevX, prevY);
    ctx.stroke();

    if (dead) {
        return true;
    }
}

function init() {
    active_lines.length = 0;
    for (var i = 0; i < starter_lines; ++i) {
        active_lines.push(new createLine(first_line));
    }
}

function animate(){
    window.requestAnimationFrame(animate);


    for (var i = 0; i < active_lines.length; ++i) {
        if (active_lines[ i ].step()) {
            active_lines.splice(i, 1);
            --i;
        }
    }

    if (active_lines.length < max_lines) {
        active_lines.push(new createLine(first_line));
        ctx.beginPath();
        ctx.arc(first_line.x, first_line.y, first_line.width, 0, Math.PI * 2);
        ctx.fill();
    }
}

canvas.addEventListener('mouseover', function(e) {
    raf = window.requestAnimationFrame(animate);
});

init();
animate();



