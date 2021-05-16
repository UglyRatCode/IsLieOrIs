//File for HTML page setup outside of HTML file.

function main(){
    //Any DOM elements to be setup to be added below
    setupGeneralListeners();
    colourButtonSetup();
    strokeWidthButtonSetup();

    document.getElementById("undoStroke").addEventListener("click", function() {undoStroke()});
    document.getElementById("clearCanvas").addEventListener("click", function() {clearCanvas()});
}

function colourButtonSetup(){
    for (const[key, value] of Object.entries(colours)) {
        let cB = document.createElement("BUTTON");
        cB.setAttribute("id", `clr-${key}`);
        cB.addEventListener("click", ()=> changeStrokeColour(key));
        cB.style.background = value;
        document.getElementById("colour-buttons").appendChild(cB);
    }
}

function strokeWidthButtonSetup(){
    for (const[key, value] of Object.entries(thicnesses)) {
        let cB = document.createElement("BUTTON");
        cB.setAttribute("id", `thc-${key}`);
        cB.addEventListener("click", ()=> changeStrokeThiccness(key));
        cB.textContent = key;
        document.getElementById("thc-buttons").appendChild(cB);
    }
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

main();

