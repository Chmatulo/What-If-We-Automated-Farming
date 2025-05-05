let currentSaveArray = [["main", "#Hello", 0 , 100], ["code 1", "#Hello", 100, 0]]
let currentSave = 1

function save(save){

  if (currentSave > 0){

  switch (save){
    case 1 :
      localStorage.setItem("gameObject1", JSON.stringify(gameObject));
      localStorage.setItem("saveArray1", JSON.stringify(currentSaveArray));
      break;
    
    case 2 :
      localStorage.setItem("gameObject2", JSON.stringify(gameObject));
      break;

    case 3 :
      localStorage.setItem("gameObject3", JSON.stringify(gameObject));
      break;

    case 4 :
      localStorage.setItem("gameObject4", JSON.stringify(gameObject));
      break;

    case 5 :
      localStorage.setItem("gameObject5", JSON.stringify(gameObject));
      break;
    }
  }

}

let savedMusicVolume = 0.1

let volumeTemp = Number(localStorage.getItem('musicVolume'));

if (volumeTemp != null){
  savedMusicVolume = Number(localStorage.getItem('musicVolume'));
} else {
  localStorage.setItem('musicVolume', savedMusicVolume.toString());
}

console.log("music volume",savedMusicVolume)


function load(load){

  switch (load){
    case 1 :
      console.log("loaded 1")
      gameObject = JSON.parse(localStorage.getItem('gameObject1'));
      currentSaveArray = JSON.parse(localStorage.getItem('saveArray1'));
      console.log(gameObject)
      break;
     
    case 2 :
      gameObject = JSON.parse(localStorage.getItem('gameObject2'));
      break;

    case 3 :
      gameObject = JSON.parse(localStorage.getItem('gameObject3'));
      break;

    case 4 :
      gameObject = JSON.parse(localStorage.getItem('gameObject4'));
      break;

    case 5 :
      gameObject = JSON.parse(localStorage.getItem('gameObject5'));
      break;
  }

  currentSave = load

  musicSlider.value = savedMusicVolume * 500
  musicValue.textContent = musicSlider.value + "%";

  updateVolume()

  game_worker.postMessage({ type: "gameObject", data: gameObject });
  plant_worker.postMessage({ type: "gameObject", data: gameObject });
  updateAll()
}

load()