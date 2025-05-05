const defaultGameObject = {

  dronePosition : [1, 1, 0],

  // 0 = "normal" 1 = "tilled" 2 = "normal_wet" 3 = "tilled_wet"
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
    [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],
    [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],
    [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],
    [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],
    [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],
    [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],
    [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]]
  ],

  money: 1000,
  wheat: 1000,
  carrot: 1000,
  apple: 1000,

  wheatSeeds: "∞",
  carrotSeeds: 1000,
  appleSeeds: 1000,

  tillLevel: 1,
  harvestLevel: 1,
  plantLevel: 1,
  moveLevel: 1,

  tillDelay: 1000,
  harvestDelay: 1000,
  plantDelay: 1000,
  moveDelay: 1000,

  musicVolume: 0,
  autresVolume: 0.125,
  droneVolume: 0.125,

}

var gameObject = defaultGameObject

// Variables Web Worker état
let game_worker, plant_worker = null;
var game_receivingAllowed, plant_receivingAllowed = true;
let game_codeRunning, plant_codeRunning = false;


// Fonction lancer le worker
function runWorker(){

  // Game Worker
  if (!game_worker) {
    game_worker = new Worker("game-worker.js");
    console.log("game worker created")
  }

  game_worker.onmessage = (event) => {
    const { type, data } = event.data;

    if (game_receivingAllowed){
      if (type === "soilUpdate") {
        let array = JSON.parse(JSON.stringify(data));
        gameObject.soilValues[array[1]-1][array[0]-1] = array[2];

      } else if (type === "plantUpdate") {
        let array = JSON.parse(JSON.stringify(data));
        gameObject.plantValues[array[1]-1][array[0]-1][0] = array[2];
        gameObject.plantValues[array[1]-1][array[0]-1][1] = array[3];
        game_worker.postMessage({ type: "gameObject", data: gameObject });

      } else if (type == "codeState"){
        game_codeRunning = data;
      } else if (type == "gameObject"){
        gameObject = JSON.parse(JSON.stringify(data));
      } else if (type == "move"){
        gameObject.dronePosition = data;
      } else if (type === "plant") {
        plant_worker.postMessage({ type: "gameObject", data: gameObject });
        plant_worker.postMessage({ type: "plant", data: data });
      } else if (type === "seedUpdate"){
        gameObject.carrotSeeds = data[0]
        gameObject.appleSeeds = data[1]
      } else if (type === "harvest"){

        if (data[2] == 1){
            gameObject.wheat = gameObject.wheat + 1
        } else if (data[2] == 2){
            gameObject.carrot = gameObject.carrot + 1
        } else if (data[2] == 3){
            gameObject.apple = gameObject.apple + 1
        }

        gameObject.plantValues[data[1]-1][data[0]-1][0] = 0
        gameObject.plantValues[data[1]-1][data[0]-1][1] = 0
        gameObject.soilValues[data[1]-1][data[0]-1] = 0

      } else if (type == "playsound"){
        playSound(data)
      } else if (type === "clear"){
        plant_worker.postMessage({ type: "stopGrowing", data : "" });
      } 
      
      else {
        console.log("fin");
      }
      game_worker.postMessage({ type: "gameObject", data: gameObject });
      updateAll();
    }
  };

  game_worker.onerror = (error) => {
    console.error("Game Worker error:", error);
  };

  game_worker.postMessage({ type: "gameObject", data: gameObject });

  // Plant Worker
  if (!plant_worker) {
    plant_worker = new Worker("plant-worker.js");
    console.log("Plant worker created")
  }

  plant_worker.onmessage = (event) => {
    const { type, data } = event.data;

    if (plant_receivingAllowed){
      if (type === "gameObject"){
        plant_worker.postMessage({ type: "gameObject", data: gameObject });
      } else if (type === "plantUpdate") {
        let array = JSON.parse(JSON.stringify(data));
        gameObject.plantValues[array[1]-1][array[0]-1][0] = array[2];
        gameObject.plantValues[array[1]-1][array[0]-1][1] = array[3];
        game_worker.postMessage({ type: "gameObject", data: gameObject });
      } else if (type === "test"){
      } else {
        //console.log("fin");
      }
    }
  };

  plant_worker.onerror = (error) => {
    console.error("Plant Worker error:", error);
  };

  plant_worker.postMessage({ type: "gameObject", data: gameObject });
}


runWorker()

function stopWorker(){
  game_codeRunning = false;
  game_receivingAllowed = false;

  if (game_worker){
    game_worker.terminate()
    game_worker = null;

    console.log("Worker Terminated")
  } else {
    console.log("No workers to terminate")
  }

  runWorker()

}


function runCode(code){

  game_receivingAllowed = true;

if (!game_codeRunning){
  console.log("game worker not running")
}

    if (game_worker && !game_codeRunning){
      game_codeRunning = true;
      game_worker.postMessage({ type: "code", data : code });
    } else {
      console.log("No worker, restarting", game_worker, plant_worker)
      runWorker()
    }

}

function formatNumber(num) {
  if (num >= 1_000_000) {
    return (Math.floor(num / 100_000) / 10).toString().replace(/\.0$/, '') + 'M';
  } else if (num >= 1_000) {
    return (Math.floor(num / 100) / 10).toString().replace(/\.0$/, '') + 'k';
  } else {
    return num.toString();
  }
}


const baseCost = 50
const growthRate = 1.5

function updateAll(){
  document.getElementById("money").innerHTML = formatNumber(gameObject.money) + " CHF"

  document.getElementById("wheat").innerHTML = formatNumber(gameObject.wheat)
  document.getElementById("carrot").innerHTML = formatNumber(gameObject.carrot)
  document.getElementById("apple").innerHTML = formatNumber(gameObject.apple)

  document.getElementById("wheatSeeds").innerHTML = formatNumber(gameObject.wheatSeeds)
  document.getElementById("carrotSeeds").innerHTML = formatNumber(gameObject.carrotSeeds)
  document.getElementById("appleSeeds").innerHTML = formatNumber(gameObject.appleSeeds)

  let levels = document.getElementsByClassName("upgrade-level")

  levels[0].innerHTML = "Niveau : " + gameObject.tillLevel
  levels[1].innerHTML = "Niveau : " + gameObject.harvestLevel
  levels[2].innerHTML = "Niveau : " + gameObject.plantLevel
  levels[3].innerHTML = "Niveau : " + gameObject.moveLevel

  let prices = document.getElementsByClassName("upgrade-cost")

  let tillUpgradeCost = Math.floor(baseCost * (growthRate ** (gameObject.tillLevel - 1)))
  let harvestUpgradeCost = Math.floor(baseCost * (growthRate ** (gameObject.harvestLevel - 1)))
  let plantUpgradeCost = Math.floor(baseCost * (growthRate ** (gameObject.plantLevel - 1)))
  let moveUpgradeCost = Math.floor(baseCost * (growthRate ** (gameObject.moveLevel - 1)))

  prices[0].innerHTML = "Coût : " + tillUpgradeCost + " CHF"
  prices[1].innerHTML = "Coût : " + harvestUpgradeCost + " CHF"
  prices[2].innerHTML = "Coût : " + plantUpgradeCost + " CHF"
  prices[3].innerHTML = "Coût : " + moveUpgradeCost + " CHF"

  let logos = document.getElementsByClassName("upgrade-logo")
  if (tillUpgradeCost <= gameObject.money){
    logos[0].style.color = "rgb(138, 160, 43)"
    logos[0].classList.add("upgrade-logo-available")
  } else {
    logos[0].style.color = "rgb(86, 86, 86)"
    logos[0].classList.remove("upgrade-logo-available")
  }

  if (harvestUpgradeCost <= gameObject.money){
    logos[1].style.color = "rgb(138, 160, 43)"
    logos[1].classList.add("upgrade-logo-available")
  } else {
    logos[1].style.color = "rgb(86, 86, 86)"
    logos[1].classList.remove("upgrade-logo-available")
  }

  if (plantUpgradeCost <= gameObject.money){
    logos[2].style.color = "rgb(138, 160, 43)"
    logos[2].classList.add("upgrade-logo-available")
  } else {
    logos[2].style.color = "rgb(86, 86, 86)"
    logos[2].classList.remove("upgrade-logo-available")
  }

  if (moveUpgradeCost <= gameObject.money){
    logos[3].style.color = "rgb(138, 160, 43)"
    logos[3].classList.add("upgrade-logo-available")
  } else {
    logos[3].style.color = "rgb(86, 86, 86)"
    logos[3].classList.remove("upgrade-logo-available")
  }

  if (gameObject.tillLevel == 10){

    levels[0].innerHTML = "Niveau Maximum"
    prices[0].innerHTML = "Coût : Aucun "
    logos[0].style.color = "rgb(86, 86, 86)"
    logos[0].classList.remove("upgrade-logo-available")

  } 

  if (gameObject.harvestLevel == 10){

    levels[1].innerHTML = "Niveau Maximum"
    prices[1].innerHTML = "Coût : Aucun "
    logos[1].style.color = "rgb(86, 86, 86)"
    logos[1].classList.remove("upgrade-logo-available")

  } 

  if (gameObject.plantLevel == 10){

    levels[2].innerHTML = "Niveau Maximum"
    prices[2].innerHTML = "Coût : Aucun "
    logos[2].style.color = "rgb(86, 86, 86)"
    logos[2].classList.remove("upgrade-logo-available")

  } 
  
  if (gameObject.moveLevel == 10){

    levels[3].innerHTML = "Niveau Maximum"
    prices[3].innerHTML = "Coût : Aucun "
    logos[3].style.color = "rgb(86, 86, 86)"
    logos[3].classList.remove("upgrade-logo-available")

  }
}

function upgrade(upgradeOption){

  let tillUpgradeCost = Math.floor(baseCost * (growthRate ** (gameObject.tillLevel - 1)))
  let harvestUpgradeCost = Math.floor(baseCost * (growthRate ** (gameObject.harvestLevel - 1)))
  let plantUpgradeCost = Math.floor(baseCost * (growthRate ** (gameObject.plantLevel - 1)))
  let moveUpgradeCost = Math.floor(baseCost * (growthRate ** (gameObject.moveLevel - 1)))

  if (upgradeOption === "till" && tillUpgradeCost <= gameObject.money && gameObject.tillLevel < 10){

    gameObject.money = gameObject.money - tillUpgradeCost
    gameObject.tillLevel = gameObject.tillLevel + 1
    gameObject.tillDelay = gameObject.tillDelay - 100 

  } else if (upgradeOption === 'harvest' && harvestUpgradeCost <= gameObject.money && gameObject.harvestLevel < 10){

    gameObject.money = gameObject.money - harvestUpgradeCost
    gameObject.harvestLevel = gameObject.harvestLevel + 1
    gameObject.harvestDelay = gameObject.harvestDelay - 100 

  } else if (upgradeOption === 'plant' && plantUpgradeCost <= gameObject.money && gameObject.plantLevel < 10){

    gameObject.money = gameObject.money - plantUpgradeCost
    gameObject.plantLevel = gameObject.plantLevel + 1
    gameObject.plantDelay = gameObject.plantDelay - 100 

  } else if (upgradeOption === 'move' && moveUpgradeCost <= gameObject.money && gameObject.moveLevel < 10){

    gameObject.money = gameObject.money - moveUpgradeCost
    gameObject.moveLevel = gameObject.moveLevel + 1
    gameObject.moveDelay = gameObject.moveDelay - 100 

  }
  game_worker.postMessage({ type: "gameObject", data: gameObject });
  updateAll()
}

updateAll()

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
      let plantType = gameObject.plantValues[y-1][x-1][0]
      let plantGrowth = gameObject.plantValues[y-1][x-1][1]
      if (plantTextures[plantType][0] >= 0){

        let plantTexture = textureSheet_context.getImageData(plantTextures[plantType][0], plantTextures[plantType][1] + plantGrowth * 32, cellSize, cellSize);

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

























function testC(){
  let inputs = document.getElementsByClassName("code-input")
  console.log(inputs.length)
  createSave()
}










function stopGrowing(){
  plant_worker.postMessage({ type: "stopGrowing", data : "" });
}
