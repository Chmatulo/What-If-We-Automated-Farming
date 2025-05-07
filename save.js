// Sons variables par défaut

let storedVolume = localStorage.getItem('volumesArray');

if (storedVolume !== null) {
  volumesArray = JSON.parse(storedVolume);
} else {
  localStorage.setItem('volumesArray', JSON.stringify(volumesArray));
}

musicSlider.value = volumesArray[0] * 500
musicValue.textContent = musicSlider.value + "%";

droneSlider.value = volumesArray[1] * 400
droneValue.textContent = droneSlider.value + "%";

autresSlider.value = volumesArray[2] * 400
autresValue.textContent = autresSlider.value + "%";



function save(type, num){

  if (type === "specific"){
    currentSave = num
  }

  console.log("saving ", currentSave)

  switch (currentSave){
    case 1 :
      localStorage.setItem("gameObject1", JSON.stringify(gameObject));
      localStorage.setItem("saveArray1", JSON.stringify(currentSaveArray));
      break;
    
    case 2 :
      localStorage.setItem("gameObject2", JSON.stringify(gameObject));
      localStorage.setItem("saveArray2", JSON.stringify(currentSaveArray));
      break;

    case 3 :
      localStorage.setItem("gameObject3", JSON.stringify(gameObject));
      localStorage.setItem("saveArray3", JSON.stringify(currentSaveArray));
      break;

    case 4 :
      localStorage.setItem("gameObject4", JSON.stringify(gameObject));
      localStorage.setItem("saveArray4", JSON.stringify(currentSaveArray));
      break;

    case 5 :
      localStorage.setItem("gameObject5", JSON.stringify(gameObject));
      localStorage.setItem("saveArray5", JSON.stringify(currentSaveArray));
      break;
    }
}

function load(load){

  //console.log("loading ", load)

  switch (load){
    case 0 : 
      gameObject = structuredClone(defaultGameObject);
      currentSaveArray = structuredClone(defaultCurrentSave);
      changeScene()
      break;
    case 1 :
      gameObject = JSON.parse(localStorage.getItem('gameObject1'));
      currentSaveArray = JSON.parse(localStorage.getItem('saveArray1'));
      break;
     
    case 2 :
      gameObject = JSON.parse(localStorage.getItem('gameObject2'));
      currentSaveArray = JSON.parse(localStorage.getItem('saveArray2'));
      break;

    case 3 :
      gameObject = JSON.parse(localStorage.getItem('gameObject3'));
      currentSaveArray = JSON.parse(localStorage.getItem('saveArray3'));
      break;

    case 4 :
      gameObject = JSON.parse(localStorage.getItem('gameObject4'));
      currentSaveArray = JSON.parse(localStorage.getItem('saveArray4'));
      break;

    case 5 :
      gameObject = JSON.parse(localStorage.getItem('gameObject5'));
      currentSaveArray = JSON.parse(localStorage.getItem('saveArray5'));
      break;
  }

  currentSave = load

  game_worker.postMessage({ type: "gameObject", data: gameObject });
  plant_worker.postMessage({ type: "firstTimeLoading", data: gameObject });


  clearCodeBlocks()
  loadCreateIDE()

  updateAll()
}