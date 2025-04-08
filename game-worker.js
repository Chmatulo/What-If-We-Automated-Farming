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

  const delay = (ms) => {
    const start = Date.now();
    while (Date.now() - start < ms);
};

  // Fonction globales Pyodide (Py -> JS)
  pyodide.globals.set("ping", (message) => {
    self.postMessage({ type: "progress", data: message });
  });

  pyodide.globals.set("update", () => {
    self.postMessage({ type: "gameObject", data: gameObject });
  });

  pyodide.globals.set("move", (direction) => {

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
    delay(1000)
  });

  pyodide.globals.set("till", () => {
    gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] = 1
    self.postMessage({ type: "gameObject", data: gameObject });
    delay(1000)
  });

  pyodide.globals.set("canTill", () => {
    return (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 0 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0) 
  });

  pyodide.globals.set("plant", (seed) => {

    if (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 1 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0 ){

    switch (seed) {
      case "wheat":
        self.postMessage({ type: "plant", data: seed });
        console.log("planting wheat")
        break;
      case "carrot":
        gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] = 2
        break;
      case "apple":
        gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] = 3
        break;
      default:
        console.log(`Sorry, we are out of ${seed}s.`);
    }
  }
    self.postMessage({ type: "gameObject", data: gameObject });
    delay(1000)
  });

  pyodide.globals.set("canPlant", () => {
    return (gameObject.soilValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1] == 1 && gameObject.plantValues[gameObject.dronePosition[1]-1][gameObject.dronePosition[0]-1][0] == 0) 
  });

  pyodide.globals.set("add", (number) => {

    gameObject.money += number
    self.postMessage({ type: "gameObject", data: gameObject });
  });

  pyodide.globals.set("getPos", () => {
    let posArr = []
    posArr[0] = gameObject.dronePosition[0]
    posArr[1] = gameObject.dronePosition[1]
    return posArr
  });


  pyodide.globals.set("checkVar", checkVar);

  try {
    // Execution du code Python
    data = "import time\n" + data // ajouter module time
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
    //Supression globales
    pyodide.globals.delete("ping");
    pyodide.globals.delete("move");
    pyodide.globals.delete("checkVar");
    }

  } else if (type == "gameObject"){
    console.log("Received GameObject Update")
    gameObject = JSON.parse(JSON.stringify(data));
  } 


};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function moveFn(direction) {
  console.log("a")
  await sleep(3000);  // Waits for 3 seconds
}

// fonction custom

const checkVar = () => {
  return money > 5;
};