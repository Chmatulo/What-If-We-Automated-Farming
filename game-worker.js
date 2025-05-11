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

  goldenAppleValue : 0,

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

  pyodide.globals.set("move", async (direction) => {

    delay(gameObject.moveDelay)
    //console.log("moving")

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

  pyodide.globals.set("till", async () => {

    //console.log("tilling")

    delay(gameObject.tillDelay)

    if (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 0 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0){
      gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] = 1
      self.postMessage({ type: "soilUpdate", data: [gameObject.dronePosition[0], gameObject.dronePosition[1], 1] });
      self.postMessage({ type: "playsound", data: "till" });
    } else if (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 2 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0){
      gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] = 3
      self.postMessage({ type: "soilUpdate", data: [gameObject.dronePosition[0], gameObject.dronePosition[1], 3] });
      self.postMessage({ type: "playsound", data: "till" });
    }
  });

  pyodide.globals.set("canTill", async () => {
    //console.log("checking till")
    return (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 0 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0) 
  });

  pyodide.globals.set("plant", async (seed) => {

    //console.log("planting")

    delay(gameObject.plantDelay)

    if (gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0){
      if(gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 1 || gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 3){

    //console.log("planting")

    switch (seed) {
      case "wheat":
        self.postMessage({ type: "plant", data: seed });
        self.postMessage({ type: "playsound", data: "plant" });
        break;
      case "carrot":
        if (gameObject.carrotSeeds > 0){
          gameObject.carrotSeeds = gameObject.carrotSeeds - 1
          self.postMessage({ type: "plant", data: seed });
          self.postMessage({ type: "playsound", data: "plant" });
        }

        break;
      case "apple":
        if (gameObject.appleSeeds > 0){
          gameObject.appleSeeds = gameObject.appleSeeds - 1
          self.postMessage({ type: "plant", data: seed });
          self.postMessage({ type: "playsound", data: "plant" });
        }

        break;
      default:
        //console.log(`Sorry, we are out of ${seed}s.`);
    }

    self.postMessage({ type: "seedUpdate", data: [gameObject.carrotSeeds, gameObject.appleSeeds] });
      }
    }
  });

  pyodide.globals.set("canPlant", async () => {
    //console.log("checking plant")
    return (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 1 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0) 
  });

  pyodide.globals.set("harvest", async () => {

    delay(gameObject.harvestDelay)

    //console.log("harvesting")

      if (gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][1] == 3){
        self.postMessage({ type: "harvest", data: [gameObject.dronePosition[0], gameObject.dronePosition[1], gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0]] });
        self.postMessage({ type: "playsound", data: "plant" });
      } else if (gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][1] == 4){
        self.postMessage({ type: "harvest", data: [gameObject.dronePosition[0], gameObject.dronePosition[1], gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][1]] });
        self.postMessage({ type: "playsound", data: "plant" });
      }

  });

  pyodide.globals.set("canHarvest", async () => {
    //console.log("checking harvest")
    return (gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][1] >= 3)
  });

  pyodide.globals.set("getPos", async (par) => {
    let posArr = []
    if (par === "drone"){
      posArr[0] = gameObject.dronePosition[0]
      posArr[1] = gameObject.dronePosition[1]
      return posArr
    } else if (par === "goldenApple"){
      console.log(gameObject.plantValues)
      return locateGoldenApple()
    }
  });

  pyodide.globals.set("buy", async (seed) => {

    //console.log("buying ", seed)

    if (seed == "carrotSeed" && gameObject.money >= 3){
      gameObject.money = gameObject.money - 3
      gameObject.carrotSeeds = gameObject.carrotSeeds + 1
    } else if (seed == "appleSeed" && gameObject.money >= 10){
      gameObject.money = gameObject.money - 10
      gameObject.appleSeeds = gameObject.appleSeeds + 1
      self.postMessage({ type: "playsound", data: "plant" });
    }
    self.postMessage({ type: "gameObject", data: gameObject });
  });

  pyodide.globals.set("canBuy", async (seed) => {
    
    //console.log("Checking canBuy")

    if (seed == "carrotSeed"){
      return(gameObject.money >= 3)
    } else if (seed == "appleSeed"){
      return(gameObject.money >= 10)
    }
    self.postMessage({ type: "gameObject", data: gameObject });
  });

  pyodide.globals.set("clear", async () => {

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
    ],

    self.postMessage({ type: "clear", data: "" });
    self.postMessage({ type: "gameObject", data: gameObject });
  });

  pyodide.globals.set("getNumber", async (item) => {

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

  pyodide.globals.set("sell", async (plant) => {

    delay(50)

    switch (plant){
      case "wheat" : 
         if (gameObject.wheat > 0){
          gameObject.wheat = gameObject.wheat - 1
          gameObject.money = gameObject.money + 1
          self.postMessage({ type: "playsound", data: "coin" });
         }
        break;

      case "carrot" : 
         if (gameObject.carrot > 0){
          gameObject.carrot = gameObject.carrot - 1
          gameObject.money = gameObject.money + 5
          self.postMessage({ type: "playsound", data: "coin" });
         }
        break;

      case "apple" : 
        if (gameObject.apple > 0){
         gameObject.apple = gameObject.apple - 1
         gameObject.money = gameObject.money + 20
         self.postMessage({ type: "playsound", data: "coin" });
        }
       break;
    }

    self.postMessage({ type: "gameObject", data: gameObject });
  });

  pyodide.globals.set("test", async () => {
    console.log("test");
  });

  pyodide.globals.set("add", async (number) => {
    gameObject.money += number
    self.postMessage({ type: "gameObject", data: gameObject });
  });

   pyodide.globals.set("water", async () => {

    delay(gameObject.plantDelay)

    if (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 0 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][1] <= 1){
      gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] = 2
      self.postMessage({ type: "soilUpdate", data: [gameObject.dronePosition[0], gameObject.dronePosition[1], 2] });
      self.postMessage({ type: "water", data: [gameObject.dronePosition[0], gameObject.dronePosition[1]] });
      self.postMessage({ type: "playsound", data: "water" });
    } else if (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 1 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][1] <= 0){
      gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] = 3
      self.postMessage({ type: "soilUpdate", data: [gameObject.dronePosition[0], gameObject.dronePosition[1], 3] });
      self.postMessage({ type: "water", data: [gameObject.dronePosition[0], gameObject.dronePosition[1]] });
      self.postMessage({ type: "playsound", data: "water" });
    }
  });

  pyodide.globals.set("goldenRun", async () => {

    if (gameObject.money >= 250){

    gameObject.money = gameObject.money - 250

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

    self.postMessage({ type: "clear", data: "" });
    self.postMessage({ type: "gameObject", data: gameObject });
    self.postMessage({ type: "goldenApple", data: "" });
    }
    
  });


  try {
    // Execution du code Python
    data = "import asyncio\n" + data // ajouter module time
    data = addAwaitForFunctions(data, functionList)
    data = addAwaitToFunctionCalls(data)
    codeRunning = true
    self.postMessage({ type: "codeState", data: codeRunning })
    console.log(data)
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
   // console.log(" gameObject received to game-worker")
    gameObject = JSON.parse(JSON.stringify(data));
  }


};

function addAwaitForFunctions(text, functionList) {
  const lines = text.split('\n');
  let transformedLines = [];

  const innerCallRegex = /\b(\w+)\s*\(([^()]*)\)/g;

  lines.forEach(line => {
    const indentation = line.match(/^(\s*)/)[0];
    let modifiedLine = line;

    // Replace inner function calls that are in functionList and not already awaited
    modifiedLine = modifiedLine.replace(innerCallRegex, (match, fnName, args, offset, fullText) => {
      const before = fullText.slice(0, offset);
      const isAlreadyAwaited = /\bawait\s*$/.test(before);
      if (functionList.includes(fnName) && !isAlreadyAwaited) {
        return `await ${fnName}(${args})`;
      }
      return match;
    });

    transformedLines.push(modifiedLine);
  });

  // Add async to all function definitions
  transformedLines = transformedLines.map(line => {
    return line.replace(/^(\s*)def /, '$1async def ');
  });

  return transformedLines.join('\n');
}


const functionList = ['move', 'harvest', 'plant', 'getPos', "canHarvest"]; // List of functions that should be awaited

function addAwaitToFunctionCalls(code) {
  return code.replace(
    /(?<![\w.]\s*|await\s*)(\b\w+)\s*\(([^)]*)\)/g,
    (match, fnName, args) => {
      if (fnName === 'print') {
        return `${fnName}(${args})`; // Leave print untouched
      }
      return `await ${fnName}(${args})`;
    }
  );
}

function locateGoldenApple(){
  for (let y = 0; y < gameObject.plantValues.length; y++) {
        for (let x = 0; x < gameObject.plantValues[y].length; x++) {

          if (gameObject.plantValues[y][x][0] == 3 && gameObject.plantValues[y][x][1] == 4){
            return [x + 1, y + 1]
          }

        }
      }
}