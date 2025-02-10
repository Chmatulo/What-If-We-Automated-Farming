
let worker = null;
var receivingAllowed = true;
let codeRunning = false;

function runWorker(){
  if (!worker){
    worker = new Worker("pyodide-worker.js");
  }

  worker.onmessage = (event) => {
   
    const { type, data } = event.data;

    if (receivingAllowed){
      
    if (type === "progress") {
      console.log(data)
    } else if (type === "result") {
      console.log(data)
    } else if (type == "codeState"){
      codeRunning = data
    }
  } else {
    console.log("fin")
  }
} 

  worker.onerror = (error) => {
    console.error("Worker error:", error);
  };

}

runWorker()

function stopWorker(){
  codeRunning = false;
  receivingAllowed = false;

  if (worker){
    worker.terminate()
    worker = null;
    console.log("Worker Terminated")
  } else {
    console.log("No worker to terminate")
  }

  runWorker()

}
function runCode(code){

  receivingAllowed = true;


    if (worker && !codeRunning){
      console.log("running code")
      codeRunning = true;
      worker.postMessage({ type: "code", data : code });
    } else {
      console.log("No worker, restarting")
      runWorker()
    }

}

var objectTest = {
  title : "titre",
  age : 1,
  bite : "longue"
}

function send(){
  console.log("envoyé")
  worker.postMessage({type : "gameObject", data : objectTest })
}

const field = document.getElementById("field");
const field_context = field.getContext("2d");

field.height = 224; 
field.width = 224; 

let isDragging = false;
let offsetX, offsetY;

// Mouse down: Start dragging
field.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - field.offsetLeft;
  offsetY = e.clientY - field.offsetTop;
});

// Mouse move: Update position if dragging
window.addEventListener("mousemove", (e) => {
  if (isDragging) {
    field.style.left = e.clientX - offsetX + "px";
    field.style.top = e.clientY - offsetY + "px";
  }
});

// Mouse up: Stop dragging
window.addEventListener("mouseup", () => {
  isDragging = false;
});

const soil = document.getElementById("soil");
const soil_context = soil.getContext("2d");

  // Create an Image object
  const img = new Image();
  img.src = "/data/textures/soil.png"; // Replace with your image path

  // Draw the image when it loads
  img.onload = function () {
    soil.height = img.height;
    soil.width = img.width;
    soil_context.drawImage(img, 0,0, img.width, img.height);// (x, y, width, height)

    drawField()
  };

let cellSize = 32

function drawField(){

  drawDefault()

  var soil1 = soil_context.getImageData(128, 32, cellSize, cellSize);

  for (let y = 1 ; y < 6 ; y++){
    for (let x = 1 ; x < 6 ; x++){
      field_context.putImageData(soil1, x*cellSize, y*cellSize);
    }
  }
}

let soilTextures = {
  "normal" : [0,0]
}

function drawDefault(){
  let topLeftCorner = soil_context.getImageData(64, 0, cellSize, cellSize);
  field_context.putImageData(topLeftCorner, 0, 0);

  let topRightCorner = soil_context.getImageData(96, 0, cellSize, cellSize);
  field_context.putImageData(topRightCorner, 192, 0);

  let bottomLeftCorner = soil_context.getImageData(64, 32, cellSize, cellSize);
  field_context.putImageData(bottomLeftCorner, 0, 192);

  let bottomRightCorner = soil_context.getImageData(96, 32, cellSize, cellSize);
  field_context.putImageData(bottomRightCorner, 192, 192);

  let topBorder = soil_context.getImageData(0, 0, cellSize, cellSize);
  let rightBorder = soil_context.getImageData(32, 0, cellSize, cellSize);
  let bottomBorder = soil_context.getImageData(32, 32, cellSize, cellSize);
  let leftBorder = soil_context.getImageData(0, 32, cellSize, cellSize);

  for (let i = 1 ; i < 6 ; i++){
    field_context.putImageData(topBorder, i*cellSize, 0);
    field_context.putImageData(rightBorder, 192, i*cellSize);
    field_context.putImageData(bottomBorder, i*cellSize, 192);
    field_context.putImageData(leftBorder, 0, i*cellSize);
  }
}