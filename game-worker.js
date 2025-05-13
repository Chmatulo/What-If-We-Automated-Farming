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

// Ajouter du délai qui bloque le code
  const delay = (ms) => {
    const start = Date.now();
    while (Date.now() - start < ms);
};

  // Fonction globales Pyodide (Python -> JavaScript)

  // Fonction pour faire bouger le drone
  pyodide.globals.set("move", async (direction) => {

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

  // Fonction bêcher
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

  // Fonction pouvoir bêcher
  pyodide.globals.set("canTill", async () => {
    //console.log("checking till")
    return (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 0 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0) 
  });

  // Fonction planter une graine
  pyodide.globals.set("plant", async (seed) => {

    //console.log("planting")

    delay(gameObject.plantDelay)

    if (gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0){
      if(gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 1 || gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 3){

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

  // Fonction pouvoir planter
  pyodide.globals.set("canPlant", async () => {
    //console.log("checking plant")
    return (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 1 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0) 
  });

  // Fonction récolter
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

  // Fonction pouvoir récolter
  pyodide.globals.set("canHarvest", async () => {
    //console.log("checking harvest")
    return (gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][1] >= 3)
  });

  // Fonction obtenir position du drone ou de la pomme dorée
  pyodide.globals.set("getPos", async (par) => {
    delay(50)
    let posArr = []
    if (par === "drone"){
      posArr[0] = gameObject.dronePosition[0]
      posArr[1] = gameObject.dronePosition[1]
      return posArr
    } else if (par === "goldenApple"){
      //console.log(gameObject.plantValues)
      return locateGoldenApple()
    }
  });

  // Fonction acheter
  pyodide.globals.set("buy", async (seed) => {

    //console.log("buying ", seed)
    delay(50)

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

  // Fonction pourcoir acheter
  pyodide.globals.set("canBuy", async (seed) => {
    
    //console.log("Checking canBuy")

    if (seed == "carrotSeed"){
      return(gameObject.money >= 3)
    } else if (seed == "appleSeed"){
      return(gameObject.money >= 10)
    }
    self.postMessage({ type: "gameObject", data: gameObject });
  });

  // Fonction réinitialiser le champ (effacer données du champ)
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

  // Fonction obtenir nombre d'un item ou argent
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

  // Fonction vendre item
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

  // Fonction test
  pyodide.globals.set("test", async () => {
    console.log("test");
  });

  // Fonction ajouter de l'argent (pas une fonctionalité du jeu, mais présente à des fin de débuggage)
  pyodide.globals.set("add", async (number) => {
    gameObject.money += number
    self.postMessage({ type: "gameObject", data: gameObject });
  });

  // Fonction arroser
   pyodide.globals.set("water", async () => {

    delay(gameObject.plantDelay)

    if (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 0 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][1] == 0){
      gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] = 2
      self.postMessage({ type: "soilUpdate", data: [gameObject.dronePosition[0], gameObject.dronePosition[1], 2] });
      self.postMessage({ type: "water", data: [gameObject.dronePosition[0], gameObject.dronePosition[1]] });
      self.postMessage({ type: "playsound", data: "water" });
    } else if (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 1 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][1] == 0){
      gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] = 3
      self.postMessage({ type: "soilUpdate", data: [gameObject.dronePosition[0], gameObject.dronePosition[1], 3] });
      self.postMessage({ type: "water", data: [gameObject.dronePosition[0], gameObject.dronePosition[1]] });
      self.postMessage({ type: "playsound", data: "water" });
    }
  });

  // Fonction lancer mode de jeu spécial
  pyodide.globals.set("goldenRun", async () => {

    if (gameObject.money >= 5000){

    gameObject.money = gameObject.money - 5000

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
    data = addAwaitForFunctions(data, functionList) // ajouter await
    data = addAwaitToFunctionCalls(data) // ajouter await
    codeRunning = true
    self.postMessage({ type: "codeState", data: codeRunning })
    //console.log(data)
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

    // Remplacer fonction intérieures qui font partie de la functionList et qui n'ont pas déja le await
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

  // Ajouter async à toutes les fonctions
  transformedLines = transformedLines.map(line => {
    return line.replace(/^(\s*)def /, '$1async def ');
  });

  return transformedLines.join('\n');
}


const functionList = ['move', 'harvest', 'plant', 'getPos', "canHarvest", "sell", "buy", "getNumber", "canBuy"]; // Liste des fonction auxquelles ajouter await

function addAwaitToFunctionCalls(code) {
  return code.replace(
    /(?<![\w.]\s*|await\s*)(\b\w+)\s*\(([^)]*)\)/g,
    (match, fnName, args) => {
      if (fnName === 'print') {
        return `${fnName}(${args})`;
      }
      return `await ${fnName}(${args})`;
    }
  );
}

// Fonction pour trovuer la position de la pomme dorée
function locateGoldenApple(){
  for (let y = 0; y < gameObject.plantValues.length; y++) {
        for (let x = 0; x < gameObject.plantValues[y].length; x++) {

          if (gameObject.plantValues[y][x][0] == 3 && gameObject.plantValues[y][x][1] == 4){
            return [x + 1, y + 1]
          }
        }
      }
}