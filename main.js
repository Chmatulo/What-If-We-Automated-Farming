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