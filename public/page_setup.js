//File for HTML page setup outside of HTML file.

//TODO - improve
function setupButtons(){

    //Sets up button functions - pulls by button class, sets property by button ID.
    let clrButtons = document.querySelectorAll(".clrButton");
    let thcButtons = document.querySelectorAll(".thcButton");
    let undoButton = document.getElementById("undoStroke");
    let clearButton = document.getElementById("clearCanvas");

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

    undoButton.addEventListener("click", function() {undoStroke()});
    clearButton.addEventListener("click", function() {clearCanvas()});
}

function setupGeneralListeners(){
    window.addEventListener('resize', resize);
    window.addEventListener('mouseup', stopDraw, {passive: true});
    canvas.addEventListener('mousemove', draw, {passive: true});
    canvas.addEventListener('touchmove', draw, {passive: true});
    canvas.addEventListener('mousedown', startDraw, {passive: true});
    canvas.addEventListener('touchstart', startDraw, {passive: true});
    canvas.addEventListener('touchstart', stopDraw, {passive: true});
}

setupButtons();
setupGeneralListeners();


