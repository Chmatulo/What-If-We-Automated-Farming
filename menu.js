// Récupérer les menus du DOM
const options_menu = document.getElementById('options-container')
const explanation_menu = document.getElementById('explanation-container')
const upgrade_menu = document.getElementById('upgrade-container')
const credits_menu = document.getElementById('credits-container')

// Récupérer les containers de jeu et de menu depuis le DOM
const game_container = document.getElementById('main-game-container')
const home_container = document.getElementById('main-home-container')

// Variables menus
var options_menu_bool = false
var load_menu_bool = false
var explanation_menu_bool = false
var upgrade_menu_bool = false
var credits_menu_bool = false

// Fonction pour afficher/cacher les menus
function menuToggle(menu){

  // Cacher tous les menus
  options_menu.style.display = "none"
  explanation_menu.style.display = "none"
  upgrade_menu.style.display = "none"
  credits_menu.style.display = "none"

  // Activer l'interaction avec les game et home containers
  game_container.style.pointerEvents = "auto"
  home_container.style.pointerEvents = "auto"

  // Enlever le flou du home container
  home_container.style.filter = "blur(0px)"
  if (sceneVar % 2 == 1){
    game_container.style.filter = "blur(0px)"
  }

  // Détecter le cas lorsqu'on veut ouvrir le menu d'options avec échap
  if(!options_menu_bool && !load_menu_bool && !explanation_menu_bool && !upgrade_menu_bool && !credits_menu_bool && menu == "escape"){
    menu = "settings"
  }

  // Modifier toutes les variables de menu et les mettre en false
  options_menu_bool = false
  load_menu_bool = false
  explanation_menu_bool = false
  upgrade_menu_bool = false
  credits_menu_bool = false

  // Choix du menu à afficher
  switch(menu) {

    case "settings":

    options_menu_bool = true

    // Retirer tous les boutons de sauvegarde dans le menu
    const saveButtons = document.querySelectorAll(".saveButtonLoad");
    saveButtons.forEach(button => button.remove());

    // Animation css pour l'affichage du menu d'options
    game_container.style.transition= "0.6s"
    home_container.style.transition= "0.6s"
    game_container.style.filter = "blur(10px)"
    home_container.style.filter = "blur(10px)"
    game_container.style.pointerEvents = "none"
    home_container.style.pointerEvents = "none"

    document.getElementById("createSaveMenu").style.display = "none"

    // Afficher ou non les sauvegardes selon l'état de la partie
    if (sceneVar%2 == 1 ){
        document.getElementById("saveAs").style.display = "inline"
        if (currentSave === 0){
          document.getElementById("saveCurrent").style.display = "none"
        } else {
          document.getElementById("saveCurrent").style.display = "inline"
        }
      } else {
        document.getElementById("saveAs").style.display = "none"
      }

      setTimeout(() => {
          options_menu.style.display = "flex"
      }, 100);

      break;

    // Afficher menu d'explications
    case "explanations":
      explanation_menu_bool = true
      explanation_menu.style.display = "block"

      break;

    // Afficher menu d'améliorations
    case "upgrade":
      upgrade_menu_bool = true
      upgrade_menu.style.display = "block"

      break;

    // Afficher menu crédits
    case "credits":
      credits_menu_bool = true
      
      game_container.style.transition= "0.6s"
      home_container.style.transition= "0.6s"

      game_container.style.filter = "blur(10px)"
      home_container.style.filter = "blur(10px)"

      game_container.style.pointerEvents = "none"
      home_container.style.pointerEvents = "none"

      setTimeout(() => {
          credits_menu.style.display = "block"
      }, 100);
      break;

    default:
  }

}

// Afficher/cacher menu en appuyant sur échap
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        if (load_menu_bool){
            updateSaves()
        } else {
            menuToggle("escape")
        }
    }
  });

// Afficher sauvegardes page d'accueil
function updateSaves(){

    const right_default = document.getElementById("right-default")
    const right_saves = document.getElementById("right-load")

    load_menu_bool = !load_menu_bool

    if (load_menu_bool){
        right_default.style.display = "none"
        right_saves.style.display = "block"
    } else {
        right_saves.style.display = "none"
        right_default.style.display = "block"
    }

    loadSaveLabels()
  }
  
let sceneVar = 0;

// Fonction passer de la scène de jeu à la page d'accueil et vice-versa
function changeScene(){

  stopWorker()

  let home_container = document.getElementById("main-home-container")
  let game_container = document.getElementById("main-game-container")

  if (sceneVar %2 == 0){
    home_container.style.transform = "scale(10)"
    game_container.style.transform = "scale(1)"
    game_container.style.filter = "blur(0px)"

    document.getElementById("saveSectionOptions").style.display = "block"

    setTimeout(() => {
      home_container.style.display = "none"
    }, 1300);
  } else {
    home_container.style.transition= "0s"
    home_container.style.display = "flex"
    home_container.style.transform = "scale(10)"

    document.getElementById("saveSectionOptions").style.display = "none"

    setTimeout(() => {
      home_container.style.transition= "1.2s"
      home_container.style.transform = "scale(1)"
      game_container.style.transform = "scale(0.3)"
      game_container.style.filter = "blur(10px)"
    }, 0);

  }

  sceneVar++
}

var hoverBox = document.getElementById("hoverBox"); // Division dans laquelle on afficher le texte informatif
var items = document.querySelectorAll('.items-container'); // Récupérer les items dans le DOM

// Ajouter aux items un eventListener pour afficher le nom des items lorsqu'on passe la souris par-dessus
items.forEach(item => {
  item.addEventListener('mousemove', (e) => {
    hoverBox.style.display = 'block';
    hoverBox.textContent = item.getAttribute('data-name');
    hoverBox.style.left = e.pageX + 10 + 'px';
    hoverBox.style.top = e.pageY + 10 + 'px';
  });

// Cacher la hoverBox lorsqu'on n'est plus sur la box des items
  item.addEventListener('mouseleave', () => {
    hoverBox.style.display = 'none';
  });
});

// Ajouter aux boutons un eventListener pour afficher le nom des items lorsqu'on passe la souris par-dessus
var boutons = document.querySelectorAll('.navbar-hover-background'); 
let hoverTimeout;
let mouseX = 0, mouseY = 0;

// La même qu'en haut mais avec un délai d'une seconde
boutons.forEach(bouton => {
  bouton.addEventListener('mousemove', (e) => {
    mouseX = e.pageX;
    mouseY = e.pageY;
    if (hoverBox.style.display === 'block') {
      hoverBox.style.left = mouseX + 10 + 'px';
      hoverBox.style.top = mouseY + 10 + 'px';
    }
  });

  bouton.addEventListener('mouseenter', () => {
    hoverTimeout = setTimeout(() => {
      hoverBox.style.left = mouseX + 10 + 'px';
      hoverBox.style.top = mouseY + 10 + 'px';
      hoverBox.textContent = bouton.getAttribute('data-name');
      hoverBox.style.display = 'block';
    }, 1000); // délai 1 seconde
  });

  bouton.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimeout);
    hoverBox.style.display = 'none';
  });
});