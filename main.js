let worker = null;
var receivingAllowed = true;

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

function runCode(){

  receivingAllowed = true;


    if (worker){
      console.log("running code")
      const code = document.getElementById("code-input").value
      worker.postMessage({ type: "code", data : code });
    } else {
      console.log("No worker, restarting")
      runWorker()
    }

}

document.getElementById("run-button").addEventListener("click", runCode);
document.getElementById("stop-button").addEventListener("click", stopWorker);

var objectTest = {
  title : "titre",
  age : 1,
  bite : "longue"
}

function send(){
  console.log("envoyé")
  worker.postMessage({type : "gameObject", data : objectTest })
}