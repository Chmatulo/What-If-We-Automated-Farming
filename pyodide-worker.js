self.importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"); // importer script Pyodide

let pyodideReady = false; // variable chargement librairie
let pyodide; // librairie Pyodide

// chargement librairie Pyodide
async function loadPyodideAndPackages() {
  pyodide = await loadPyodide();
  pyodideReady = true;
  console.log("Pyodide loaded");
}

loadPyodideAndPackages(); // lancer le chargement

// Variables Générales

var gameObject = {} // créeation objet gameObject

// fonction recevoir message du main.js
self.onmessage = async (event) => {

  let { type, data } = event.data; // recevoir code Python

  if (type == "code"){

// gestion Pyodide non chargée
  if (!pyodideReady) {
    self.postMessage({ type: "result", data: "Pyodide is still loading. Please wait..." });
    return;
  }

  // Fonction globales Pyodide (Py -> JS)
  pyodide.globals.set("ping", (message) => {
    self.postMessage({ type: "progress", data: message });
  });

  pyodide.globals.set("checkVar", checkVar);

  try {
    // Execution du code Python
    data = "import time\n" + data // ajouter module time
    const result = await pyodide.runPythonAsync(data); // Exécuter
    self.postMessage({ type: "result", data: result }); // Poster le résultat final (inutile mdr)
  } catch (error) {
    // Gestion erreur
    self.postMessage({ type: "result", data: `Error: ${error.message}` });
  } finally {
    //Supression globales
    pyodide.globals.delete("ping"); // Nettoyer fonctions 
    pyodide.globals.delete("checkVar");
    }

  } else if (type == "gameObject"){
    gameObject = JSON.parse(JSON.stringify(data));
    console.log(gameObject.bite)
  } 


};


// fonction custom

var money = 10;

const checkVar = () => {
  return money > 5;
};