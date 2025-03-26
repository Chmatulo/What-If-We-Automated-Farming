// Variables Web Worker etat
let worker = null;
var receivingAllowed = true;
let codeRunning = false;


// Fonction lancer le worker
function runWorker(){
  if (!worker){
    worker = new Worker("pyodide-worker.js");
  }

// Recevoir message
  worker.onmessage = (event) => {
   
    const { type, data } = event.data;

    if (receivingAllowed){

      
    if (type === "progress") {
      console.log(data)
    } else if (type === "result") {
      console.log(data)
    } else if (type == "codeState"){
      codeRunning = data
    } else if (type == "gameObject"){ // Recevoir changement gameObject

      gameObject = JSON.parse(JSON.stringify(data));
      
      updateAll()

    } else if (type == "move"){
      direction = data
      console.log("moved", direction)
    } else {
    console.log("fin")
    }
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

var gameObject = {

  dronePosition : [1, 1, 0],

  // 0 = "normal" 1 = "tilled" 2 = "normal_wet" 3 ="tilled_wet"
  soilValues : [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
  ],

  // 0 = nothing, 1 = "wheat", 2 = "carrot", 3 ="golden_apple"
  plantValues : [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
  ],

  money: 20,

}


function updateAll(){
  document.getElementById("money").innerHTML = gameObject.money
  console.log(gameObject, "till")
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

const textureSheet = document.getElementById("textureSheet");
const textureSheet_context = textureSheet.getContext("2d");

  // Create an Image object
  const img = new Image();
  img.src = "data/textures/textures.png"; // Replace with your image path

  // Draw the image when it loads
  img.onload = function () {
    textureSheet.height = img.height;
    textureSheet.width = img.width;
    textureSheet_context.drawImage(img, 0,0, img.width, img.height);// (x, y, width, height)

    draw()
  };

let cellSize = 32

function draw(){
  

  field_context.clearRect(0, 0, field.width, field.height);

  drawField()
  drawPlant()
  drawDrone()

}

// 0 = "normal" 1 = "tilled" 2 = "normal_wet" 3 ="tilled_wet"
let soilTextures = [
  [2*cellSize, 0*cellSize],
  [2*cellSize, 1*cellSize],
  [2*cellSize, 2*cellSize],
  [2*cellSize, 3*cellSize]
]

// 0 = nothing, 1 = "wheat", 2 = "carrot", 3 ="golden_apple"
let plantTextures = [
  [-1, -1]
  [6*cellSize, 0],
  [3*cellSize, 0 * cellSize],
  [4*cellSize, 0],
  [5 * cellSize, 0]
  
]

function drawField(){

  let topLeftCorner = textureSheet_context.getImageData(32, 0, cellSize, cellSize);
  let topRightCorner = textureSheet_context.getImageData(32, 64, cellSize, cellSize);
  let bottomRightCorner = textureSheet_context.getImageData(32, 96, cellSize, cellSize);
  let bottomLeftCorner = textureSheet_context.getImageData(32, 32, cellSize, cellSize);

  field_context.putImageData(topLeftCorner, 0, 0);
  field_context.putImageData(topRightCorner, 256, 0);
  field_context.putImageData(bottomRightCorner, 256, 256);
  field_context.putImageData(bottomLeftCorner, 0, 256);

  let topBorder = textureSheet_context.getImageData(0, 0, cellSize, cellSize);
  let rightBorder = textureSheet_context.getImageData(0, 64, cellSize, cellSize);
  let bottomBorder = textureSheet_context.getImageData(0, 96, cellSize, cellSize);
  let leftBorder = textureSheet_context.getImageData(0, 32, cellSize, cellSize);

  for (let i = 1 ; i < 8 ; i++){
    field_context.putImageData(topBorder, cellSize * i, 0);
    field_context.putImageData(rightBorder, 8*cellSize, cellSize * i);
    field_context.putImageData(bottomBorder, cellSize * i, 8*cellSize);
    field_context.putImageData(leftBorder, 0, cellSize * i);
  }
  
}

function drawPlant(){

  for (let y = 1 ; y < 8 ; y++){  
    for (let x = 1 ; x < 8 ; x++){

      // Drawing soil
      let soilType = gameObject.soilValues[y-1][x-1]
      let finalTexture = textureSheet_context.getImageData(soilTextures[soilType][0], soilTextures[soilType][1], cellSize, cellSize);

      // Drawing Plants
      let plantType = gameObject.plantValues[y-1][x-1]
      if (plantTextures[plantType][0] >= 0){

        let plantTexture = textureSheet_context.getImageData(plantTextures[plantType][0], plantTextures[plantType][1], cellSize, cellSize);

        for (let xImg = 0 ; xImg < (cellSize * cellSize * 4) ; xImg = xImg + 4){
          if (plantTexture.data[xImg] != 0 || plantTexture.data[xImg+1] != 0 || plantTexture.data[xImg+2] != 0){
            finalTexture.data[xImg] = plantTexture.data[xImg]
            finalTexture.data[xImg + 1] = plantTexture.data[xImg + 1]
            finalTexture.data[xImg + 2] = plantTexture.data[xImg + 2]
            finalTexture.data[xImg + 3] = plantTexture.data[xImg + 3]
          }
        }

      }
      field_context.putImageData(finalTexture, x*cellSize, y*cellSize);
    }
  }
}

function drawDrone(){
  let droneTexture = textureSheet_context.getImageData(7*cellSize, gameObject.dronePosition[2]*cellSize, cellSize, cellSize); 
  let finalTexture = field_context.getImageData(gameObject.dronePosition[0] * cellSize, gameObject.dronePosition[1] * cellSize - 10, cellSize, cellSize)

  for (let xImg = 0 ; xImg < (cellSize * cellSize * 4) ; xImg = xImg + 4){
    if (droneTexture.data[xImg] != 0 || droneTexture.data[xImg+1] != 0 || droneTexture.data[xImg+2] != 0){
      finalTexture.data[xImg] = droneTexture.data[xImg]
      finalTexture.data[xImg + 1] = droneTexture.data[xImg + 1]
      finalTexture.data[xImg + 2] = droneTexture.data[xImg + 2]
      finalTexture.data[xImg + 3] = droneTexture.data[xImg + 3]
    }
  }

  field_context.putImageData(finalTexture, gameObject.dronePosition[0]*cellSize, gameObject.dronePosition[1]*cellSize - 10);
  gameObject.dronePosition[2]++
  gameObject.dronePosition[2] = gameObject.dronePosition[2] % 4
}

setInterval(draw, 75)

function save(){
  localStorage.setItem("gameObject1", JSON.stringify(gameObject));
}

function load(){
  let gameObjectLoaded = JSON.parse(localStorage.getItem("gameObject1"));
  gameObject = gameObjectLoaded;
  worker.postMessage({ type: "gameObject", data : gameObjectLoaded });
}