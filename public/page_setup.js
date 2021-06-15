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
        let colourButton = document.createElement("BUTTON");
        colourButton.setAttribute("id", `clr-${key}`);
        colourButton.addEventListener("click", ()=> changeStrokeColour(key));
        colourButton.style.background = value;
        document.getElementById("colour-buttons").appendChild(colourButton);
    }
}

function strokeWidthButtonSetup(){
    for (const[key] of Object.entries(thicnesses)) {
        let widthButton = document.createElement("BUTTON");
        widthButton.setAttribute("id", `thc-${key}`);
        widthButton.addEventListener("click", ()=> changeStrokeThiccness(key));
        widthButton.textContent = key;
        document.getElementById("thc-buttons").appendChild(widthButton);
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

//General function for quickly creating multiple elements from array.
function generateElementsFromArray(inputArray, elementToCreate, createdIDName, parentElementID){
    if(inputArray == null || elementToCreate == null || createdIDName == null || parentElementID == null){return;};

    for (let i = 0; i < inputArray.length; i++){
        let newElement = document.createElement(elementToCreate);
        newElement.setAttribute("id", `${createdIDName}-${i + 1}`);
        document.getElementById(parentElementID).appendChild(newElement);
    }
}

main();
