// Variables Web Worker état
let game_worker, plant_worker = null;
var game_receivingAllowed, plant_receivingAllowed = true;
let game_codeRunning, plant_codeRunning = false;


// Fonction lancer le worker
function runWorker(){

  // Game Worker
  if (!game_worker) {
    game_worker = new Worker("game-worker.js");
  }


  // Recevoir messages
  game_worker.onmessage = (event) => {

    const { type, data } = event.data;

    if (game_receivingAllowed){

      if (type === "soilUpdate") { // Modification sol
        let array = JSON.parse(JSON.stringify(data));
        gameObject.soilValues[array[1]-1][array[0]-1] = array[2];

      } else if (type === "plantUpdate") { // Modification plante
        let array = JSON.parse(JSON.stringify(data));
        gameObject.plantValues[array[1]-1][array[0]-1][0] = array[2];
        gameObject.plantValues[array[1]-1][array[0]-1][1] = array[3];
        game_worker.postMessage({ type: "gameObject", data: gameObject });

      } else if (type == "codeState"){ // Etat code
        game_codeRunning = data;
      } else if (type == "gameObject"){ // Recevoir modification object gameObject
        gameObject = JSON.parse(JSON.stringify(data));
      } else if (type == "move"){ // bouger drone
        gameObject.dronePosition = data;
      } else if (type === "plant") { // transfer plant au plantworker
        plant_worker.postMessage({ type: "gameObject", data: gameObject });
        plant_worker.postMessage({ type: "plant", data: data });
      } else if (type === "seedUpdate"){ // modifications graines
        gameObject.carrotSeeds = data[0]
        gameObject.appleSeeds = data[1]
      } else if (type === "harvest"){ // Récolter

        if (data[2] == 1){
            gameObject.wheat = gameObject.wheat + 1
        } else if (data[2] == 2){
            gameObject.carrot = gameObject.carrot + 1
        } else if (data[2] == 3){
            gameObject.apple = gameObject.apple + 1
        } else if (data[2] == 4){
          //console.log("apple")
            gameObject.money = gameObject.money + gameObject.goldenAppleValue
            playSound("coin")
            spawnApple()
        }

        gameObject.plantValues[data[1]-1][data[0]-1][0] = 0
        gameObject.plantValues[data[1]-1][data[0]-1][1] = 0
        gameObject.soilValues[data[1]-1][data[0]-1] = 0

      } else if (type === "water"){ // Arroser
        let array = JSON.parse(JSON.stringify(data));
        if (gameObject.plantValues[array[1]-1][array[0]-1][0] > 0 && gameObject.plantValues[array[1]-1][array[0]-1][1] == 0){
            plant_worker.postMessage({ type: "water", data: [gameObject.dronePosition[0], gameObject.dronePosition[1], gameObject.plantValues[array[1]-1][array[0]-1][0],gameObject.dronePosition[1], gameObject.plantValues[array[1]-1][array[0]-1][1]] });
        }
      } else if (type === "playsound"){ // Jouer un son
        playSound(data)
      } else if (type === "clear"){ // Réinitialiser le champ
        plant_worker.postMessage({ type: "stopGrowing", data : "" });
      } else if (type === "goldenRun"){ // Mode de jeu spécial
        plant_worker.postMessage({ type: "stopGrowing", data : "" });
      } else if (type === "goldenApple"){ // faire apparaître première pomme dorée
        spawnApple()
      } else if (type === "test"){ // test
        game_worker.postMessage({ type: "gameObject", data: gameObject });
      } else {
        console.log("fin");
      }
      game_worker.postMessage({ type: "gameObject", data: gameObject });
      updateAll();
    }
  };

  // Gestion erreur
  game_worker.onerror = (error) => { 
    console.error("Game Worker error:", error);
  };

  // Envoyer gameObject au gameworker
  game_worker.postMessage({ type: "gameObject", data: gameObject });

  // Plant Worker
  if (!plant_worker) {
    plant_worker = new Worker("plant-worker.js");
  }

  // Recevoir messages du plantworker
  plant_worker.onmessage = (event) => {

    const { type, data } = event.data;

    if (plant_receivingAllowed){

      if (type === "gameObject"){ // Actualiser gameObject
        plant_worker.postMessage({ type: "gameObject", data: gameObject });
      } else if (type === "plantUpdate") { // Actualiser état plante
        let array = JSON.parse(JSON.stringify(data));
        gameObject.plantValues[array[1]-1][array[0]-1][0] = array[2];
        gameObject.plantValues[array[1]-1][array[0]-1][1] = array[3];

        if (array[3] == 3){
          gameObject.soilValues[array[1]-1][array[0]-1] = 1
        }

        game_worker.postMessage({ type: "gameObject", data: gameObject });
      } else if (type === "test"){ // test
        game_worker.postMessage({ type: "gameObject", data: gameObject });
      }
    }
  };

  // GEstion erreur
  plant_worker.onerror = (error) => {
    console.error("Plant Worker error:", error);
  };

  // Actualiser gameObject
  plant_worker.postMessage({ type: "gameObject", data: gameObject });
}

// Démarrer les workers
runWorker()

// Fonction arrêter le game worker
function stopWorker(){

  game_codeRunning = false;
  game_receivingAllowed = false;

  if (game_worker){
    game_worker.terminate()
    game_worker = null;

  } 

  runWorker()

}

// Fonction lancer l'exécution du code
function runCode(code){

  game_receivingAllowed = true;

  let codes = document.getElementsByClassName("code-input")
  let extractedFunction = [] // tableau code complet

// Extraire le code de tous les blocks
for (let i = 0 ; i < codes.length ; i++){
  if (codes[i].value == code){
    continue
  } else {
    extractedFunction.push(codes[i].value)
  }
}

if (game_worker && !game_codeRunning){
    game_codeRunning = true;
    code = extractPythonFunctions(extractedFunction) + "\n" + "\n" + code // Extraire les fonctions
    game_worker.postMessage({ type: "code", data : code }); // Poster le code
} else {
    runWorker()
  }
}

// Fonction pour extraire toutes les fonctions
function extractPythonFunctions(codeStrings) {
  const allFunctions = [];

  for (const code of codeStrings) {
    const lines = code.split('\n');
    let currentFunc = [];
    let collecting = false;
    let indentLevel = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Start collecting if we find a decorator or a function definition
      if (line.trim().startsWith('@') || line.trim().startsWith('def ')) {
        if (!collecting) {
          collecting = true;
          currentFunc = [];
          indentLevel = null;
        }
      }

      if (collecting) {
        currentFunc.push(line);

        // If it's the def line, set indent level
        if (line.trim().startsWith('def ') && indentLevel === null) {
          indentLevel = line.match(/^(\s*)/)[1].length;
        }

        // Determine if we should stop collecting
        const nextLine = lines[i + 1];
        if (nextLine !== undefined) {
          const nextIndent = nextLine.match(/^(\s*)/)[1].length;
          if (nextLine.trim() && indentLevel !== null && nextIndent <= indentLevel && !nextLine.trim().startsWith('@')) {
            collecting = false;
            allFunctions.push(currentFunc.join('\n'));
            currentFunc = [];
          }
        } else {
          // End of file
          collecting = false;
          allFunctions.push(currentFunc.join('\n'));
        }
      }
    }
  }

  return allFunctions.join('\n\n');
}

// Fonction formatter un nombre 
function formatNumber(num) {
  if (num >= 1_000_000) {
    return (Math.floor(num / 100_000) / 10).toString().replace(/\.0$/, '') + 'M';
  } else if (num >= 1_000) {
    return (Math.floor(num / 100) / 10).toString().replace(/\.0$/, '') + 'k';
  } else {
    return num.toString();
  }
}


const baseCost = 50 // Cout de base pour les améliorations
const growthRate = 1.5 // Facteur d'augmentation des prix

// Fonction actualiser le nombre d'items et les différents niveau d'amélioration
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

// Fonction améliorer une abilité
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

// Actualiser nombre d'items et améliorations
updateAll()

const field = document.getElementById("field"); // Champ objet
const field_context = field.getContext("2d"); // Champ context

field.height = 288; // hauteur
field.width = 288; // largeur

let isDragging = false; // boolean déplacement du champ
let offsetX, offsetY; // offset en x et y

// Souris appuyer: Commencer le déplacement
field.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - field.offsetLeft;
  offsetY = e.clientY - field.offsetTop;
});

// Souris bouge: Actualiser la position du champ en fonction de la position de la souris
window.addEventListener("mousemove", (e) => {
  if (isDragging) {
    field.style.left = e.clientX - offsetX + "px";
    field.style.top = e.clientY - offsetY + "px";
  }
});

// Souris relacher click : arrêter le déplacement
window.addEventListener("mouseup", () => {
  isDragging = false;
});

const textureSheet = document.getElementById("textureSheet"); // canvas de texture (invisible)
const textureSheet_context = textureSheet.getContext("2d"); // canvas de texture context

  // Créer Objet Image
  const img = new Image();
  img.src = "data/textures/textures.png"; // Fichier de textures

  // Dessiner l'image après le chargement
  img.onload = function () {
    textureSheet.height = img.height;
    textureSheet.width = img.width;
    textureSheet_context.drawImage(img, 0,0, img.width, img.height);

    draw()
  };

let cellSize = 32 // taille d'une cellule

// Fonction dessiner le champ
function draw(){

  field_context.clearRect(0, 0, field.width, field.height); // Effacer le canvas

  drawField() // dessiner le champ vide
  drawPlant() // dessiner les plantes
  drawDrone() // dessiner le drone

}

// 0 = "normal" 1 = "tilled" 2 = "normal_wet" 3 ="tilled_wet" (tableau qui transforme le type de sol de (0,1,2,3) en coordonnées sur le canvas de textures)
let soilTextures = [
  [2*cellSize, 0*cellSize],
  [2*cellSize, 1*cellSize],
  [2*cellSize, 2*cellSize],
  [2*cellSize, 3*cellSize]
]

// 0 = nothing, 1 = "wheat", 2 = "carrot", 3 ="golden_apple" (tableau qui transforme le type de plante de (0,1,2,3) en coordonnées sur le canvas de textures)
let plantTextures = [
  [-1, -1]
  [6*cellSize, 0],
  [3*cellSize, 0 * cellSize],
  [4*cellSize, 0],
  [5 * cellSize, 0]
  
]

// Fonction dessiner le sol du champ
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

// Fonction dessiner les plantes sur le champ
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

// Dessiner le drone
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

// Redessiner toutes les 75ms
setInterval(draw, 75)

// Fonction pour faire apparaître une pomme aléatoirement
function spawnApple(){
  function generateTwoRandomNumbers() {
          const first = Math.floor(Math.random() * 7); // 0 to 6
          const second = Math.floor(Math.random() * 7); // 0 to 6
          return [first, second];
        }

        let applePositions = generateTwoRandomNumbers()

        while (applePositions[0] == gameObject.dronePosition[1]-1 && applePositions[1] == gameObject.dronePosition[0]-1){
          applePositions = generateTwoRandomNumbers()
        }

        gameObject.plantValues[applePositions[0]][applePositions[1]][0] = 3
        gameObject.plantValues[applePositions[0]][applePositions[1]][1] = 4

        playSound("plant")

        gameObject.goldenAppleValue = 5 + (Math.abs(gameObject.dronePosition[1] - 1 - applePositions[0]) * 3 + Math.abs(gameObject.dronePosition[0] - 1 - applePositions[1]) * 3);

}

// Envoi commande d'interruption de la pousse des plantes
function stopGrowing(){
  plant_worker.postMessage({ type: "stopGrowing", data : "" });
}
