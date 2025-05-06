const defaultGameObject = {

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
  
    money: 1000,
    wheat: 1000,
    carrot: 1000,
    apple: 1000,
  
    wheatSeeds: "∞",
    carrotSeeds: 1000,
    appleSeeds: 1000,
  
    tillLevel: 1,
    harvestLevel: 1,
    plantLevel: 1,
    moveLevel: 1,
  
    tillDelay: 1000,
    harvestDelay: 1000,
    plantDelay: 1000,
    moveDelay: 1000,
  
  }
  
  var gameObject = defaultGameObject // Objet Jeu

  let volumesArray = [0.1, 0.125, 0.125]; // Volumes (Musique, Actions, Autres)

  const musicSlider = document.getElementById('music-slider');
  const musicValue = document.getElementById('music-value');

  const droneSlider = document.getElementById('drone-slider');
  const droneValue = document.getElementById('drone-value');

  const autresSlider = document.getElementById('autres-slider');
  const autresValue = document.getElementById('autres-value');

// Tableau codes + positions sauvegardés
let currentSaveArray = [[0, "main", "#Write your code here:", 124 , 128, 350, 200]]
let currentSave = 0 // Numéro de la sauvegarde actuelle

// Sauvegardes par defaut

for (let i = 1; i <= 5; i++) {
  if (localStorage.getItem(`gameObject${i}`) === null) {
    localStorage.setItem(`gameObject${i}`, JSON.stringify(defaultGameObject));
  }
  if (localStorage.getItem(`saveArray${i}`) === null) {
    localStorage.setItem(`saveArray${i}`, JSON.stringify(currentSaveArray));
  }
}