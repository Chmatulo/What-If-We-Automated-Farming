
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

field.height = 288; 
field.width = 288; 

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
  img.src = "/data/textures/textures.png"; // Replace with your image path

  // Draw the image when it loads
  img.onload = function () {
    soil.height = img.height;
    soil.width = img.width;
    soil_context.drawImage(img, 0,0, img.width, img.height);// (x, y, width, height)

    draw()
  };

let cellSize = 32

function draw(){

  drawField()

  for (let y = 1 ; y < 8 ; y++){
    for (let x = 1 ; x < 8 ; x++){
      let soilType = fieldValues[y-1][x-1]
      var soilTexture = soil_context.getImageData(soilTextures[soilType][0], soilTextures[soilType][1], cellSize, cellSize);
      field_context.putImageData(soilTexture, x*cellSize, y*cellSize);
    }
  }
}

// 0 = "normal" 1 = "tilled" 2 = "normal_wet" 3 ="tilled_wet"
let soilTextures = [
  [2*cellSize, 0*cellSize],
  [2*cellSize, 1*cellSize],
  [2*cellSize, 2*cellSize],
  [2*cellSize, 3*cellSize]
]

function drawField(){

  let topLeftCorner = soil_context.getImageData(32, 0, cellSize, cellSize);
  let topRightCorner = soil_context.getImageData(32, 64, cellSize, cellSize);
  let bottomRightCorner = soil_context.getImageData(32, 96, cellSize, cellSize);
  let bottomLeftCorner = soil_context.getImageData(32, 32, cellSize, cellSize);

  field_context.putImageData(topLeftCorner, 0, 0);
  field_context.putImageData(topRightCorner, 256, 0);
  field_context.putImageData(bottomRightCorner, 256, 256);
  field_context.putImageData(bottomLeftCorner, 0, 256);

  let topBorder = soil_context.getImageData(0, 0, cellSize, cellSize);
  let rightBorder = soil_context.getImageData(0, 64, cellSize, cellSize);
  let bottomBorder = soil_context.getImageData(0, 96, cellSize, cellSize);
  let leftBorder = soil_context.getImageData(0, 32, cellSize, cellSize);

  for (let i = 1 ; i < 8 ; i++){
    field_context.putImageData(topBorder, cellSize * i, 0);
    field_context.putImageData(rightBorder, 8*cellSize, cellSize * i);
    field_context.putImageData(bottomBorder, cellSize * i, 8*cellSize);
    field_context.putImageData(leftBorder, 0, cellSize * i);
  }

  
}

// 0 = "normal" 1 = "tilled" 2 = "normal_wet" 3 ="tilled_wet"

let fieldValues = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 3, 1, 1],
  [1, 1, 1, 1, 1, 0, 1],
  [1, 1, 1, 2, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1]
]

function readData(){
  console.log(window.dataTEST.age)
}