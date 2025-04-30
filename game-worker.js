self.importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"); // importer script Pyodide

let pyodideReady = false; // variable chargement librairie
let pyodide; // librairie Pyodide

// chargement librairie Pyodide
async function loadPyodideAndPackages() {
  pyodide = await loadPyodide();
  pyodideReady = true;
  console.log("Pyodide loaded");
  self.postMessage({ type: "test", data: "loaded" })
}

loadPyodideAndPackages(); // lancer le chargement

// Variables Générales

var codeRunning = false

// création objet gameObject
var gameObject = {

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

  money: 0,
  wheat: 0,
  carrot: 0,
  apple: 0,

  wheatSeeds: "∞",
  carrotSeeds: 0,
  appleSeeds: 0,

  tillLevel: 1,
  harvestLevel: 1,
  plantLevel: 1,
  moveLevel: 1,

  tillDelay: 1000,
  harvestDelay: 1000,
  plantDelay: 1000,
  moveDelay: 1000,

}


// fonction recevoir message du main.js
self.onmessage = async (event) => {

  let { type, data } = event.data; // recevoir code Python

  if (type == "code"){

// gestion Pyodide non chargée
  if (!pyodideReady) {
    self.postMessage({ type: "result", data: "Pyodide is still loading. Please wait..." });
    return;
  }

// Ajouter du délai
  const delay = (ms) => {
    const start = Date.now();
    while (Date.now() - start < ms);
};

  // Fonction globales Pyodide (Python -> JavaScript)

  pyodide.globals.set("move", (direction) => {

    delay(gameObject.moveDelay)

    switch(direction) {

      case "North":
      gameObject.dronePosition[1] = gameObject.dronePosition[1] - 1 
        if (gameObject.dronePosition[1] === 0){
           gameObject.dronePosition[1] = 7
          }
        break;

      case "South":
        gameObject.dronePosition[1] = gameObject.dronePosition[1] % 7 + 1
        break;

      case "East":
        gameObject.dronePosition[0] = gameObject.dronePosition[0] % 7 + 1
        break;

      case "West":
        gameObject.dronePosition[0] = gameObject.dronePosition[0] - 1 
        if (gameObject.dronePosition[0] === 0){
           gameObject.dronePosition[0] = 7
          }
          break;
      default:
        console.log("error")
    }

    self.postMessage({ type: "move", data: gameObject.dronePosition });
  });

  pyodide.globals.set("till", () => {

    delay(gameObject.tillDelay)

    if (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 0 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0){
      gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] = 1
      //console.log("tilled")
      self.postMessage({ type: "soilUpdate", data: [gameObject.dronePosition[0], gameObject.dronePosition[1], 1] });
    }
  });

  pyodide.globals.set("canTill", () => {
    //console.log("checking till")
    return (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 0 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0) 
  });

  pyodide.globals.set("plant", (seed) => {

    delay(gameObject.plantDelay)

    if (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 1 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0 ){

    //console.log("planting")

    switch (seed) {
      case "wheat":
        self.postMessage({ type: "plant", data: seed });
        break;
      case "carrot":
        if (gameObject.carrotSeeds > 0){
          gameObject.carrotSeeds = gameObject.carrotSeeds - 1
          self.postMessage({ type: "plant", data: seed });
        }

        break;
      case "apple":
        if (gameObject.appleSeeds > 0){
          gameObject.appleSeeds = gameObject.appleSeeds - 1
          self.postMessage({ type: "plant", data: seed });
        }

        break;
      default:
        console.log(`Sorry, we are out of ${seed}s.`);
    }

    self.postMessage({ type: "seedUpdate", data: [gameObject.carrotSeeds, gameObject.appleSeeds] });
    }
  });

  pyodide.globals.set("canPlant", () => {
    //console.log("checking plant")
    return (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 1 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0) 
  });

  pyodide.globals.set("harvest", () => {

    delay(gameObject.harvestDelay)

    //console.log("harvesting")

      if (gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][1] == 3){
        self.postMessage({ type: "harvest", data: [gameObject.dronePosition[0], gameObject.dronePosition[1], gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0]] });
      }

  });

  pyodide.globals.set("canHarvest", () => {
    //console.log("checking harvest")
    return (gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][1] == 3)
  });

  pyodide.globals.set("getPos", () => {
    let posArr = []
    posArr[0] = gameObject.dronePosition[0]
    posArr[1] = gameObject.dronePosition[1]
    return posArr
  });

  pyodide.globals.set("buy", (seed) => {

    console.log("buying ", seed)

    if (seed == "carrotSeed" && gameObject.money >= 3){
      gameObject.money = gameObject.money - 3
      gameObject.carrotSeeds = gameObject.carrotSeeds + 1
    } else if (seed == "appleSeed" && gameObject.money >= 10){
      gameObject.money = gameObject.money - 10
      gameObject.appleSeeds = gameObject.appleSeeds + 1
    }
    self.postMessage({ type: "gameObject", data: gameObject });
  });

  pyodide.globals.set("canBuy", (seed) => {
    
    console.log("Checking canBuy")

    if (seed == "carrotSeed"){
      return(gameObject.money >= 3)
    } else if (seed == "appleSeed"){
      return(gameObject.money >= 10)
    }
    self.postMessage({ type: "gameObject", data: gameObject });
  });

  pyodide.globals.set("clear", () => {

    gameObject.dronePosition = [1, 1, 0]

    gameObject.soilValues = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],  
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0]
    ]

    gameObject.plantValues = [
      [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],
      [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],
      [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],
      [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],
      [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],
      [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]],
      [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]]
    ]

    self.postMessage({ type: "gameObject", data: gameObject });
  });

  pyodide.globals.set("getNumber", (item) => {
    console.log("getting Number of ", item);

    switch (item){
      case "wheat" :
        return gameObject.wheat
      case "wheatSeed" :
        return gameObject.wheatSeeds
      case "carrot" :
        return gameObject.carrot
      case "carrotSeed" :
        return gameObject.carrotSeeds
      case "apple" :
        return gameObject.apple
      case "appleSeed" :
        return gameObject.appleSeeds
      case "money" : 
        return gameObject.money
    }
  });

  pyodide.globals.set("sell", (plant) => {

    delay(50)

    switch (plant){
      case "wheat" : 
         if (gameObject.wheat > 0){
          gameObject.wheat = gameObject.wheat - 1
          gameObject.money = gameObject.money + 1
         }
        break;

      case "carrot" : 
         if (gameObject.carrot > 0){
          gameObject.carrot = gameObject.carrot - 1
          gameObject.money = gameObject.money + 5
         }
        break;

      case "apple" : 
        if (gameObject.apple > 0){
         gameObject.apple = gameObject.apple - 1
         gameObject.money = gameObject.money + 20
        }
       break;
    }

    self.postMessage({ type: "gameObject", data: gameObject });
  });

  pyodide.globals.set("test", () => {
    console.log("test");
  });

  pyodide.globals.set("add", (number) => {
    gameObject.money += number
    self.postMessage({ type: "gameObject", data: gameObject });
  });

  try {
    // Execution du code Python
    data = "import asyncio\n" + data // ajouter module time
    data = addAwaitSleep(data, functionList)
    console.log(data)
    codeRunning = true
    self.postMessage({ type: "codeState", data: codeRunning })
    const result = await pyodide.runPythonAsync(data); // Exécuter
    codeRunning = false
    self.postMessage({ type: "codeState", data: codeRunning })
    self.postMessage({ type: "result", data: result }); // Poster le résultat final (inutile mdr)
  } catch (error) {
    // Gestion erreur
    codeRunning = false
    self.postMessage({ type: "codeState", data: codeRunning })
    self.postMessage({ type: "result", data: `Error: ${error.message}` });
  } finally {

    }

  } else if (type == "gameObject"){
    console.log(" gameObject received to game-worker")
    gameObject = JSON.parse(JSON.stringify(data));
  } 


};


function addAwaitSleep(text, functionList) {
  const lines = text.split('\n');
  let transformedLines = [];
  let previousIndentation = '';

  lines.forEach(line => {
      // Extract indentation and trim the line
      const indentation = line.match(/^(\s*)/)[0];
      const trimmedLine = line.trim();

      // Check if the line contains a function call and is in the list of functions
      const functionName = trimmedLine.split('(')[0].trim();
      if (functionList.includes(functionName) && trimmedLine.includes('(') && trimmedLine.includes(')')) {
          transformedLines.push(line); // Add the function call line
          transformedLines.push(`${indentation}await asyncio.sleep(0)`); // Add await line with correct indentation
      } else {
          transformedLines.push(line); // For non-function call lines, just add the line
      }
  });

  return transformedLines.join('\n');
}

const functionList = ['harvest', 'plant', 'move']; // List of functions to detect
