const options_menu = document.getElementById('options-container')
const explanation_menu = document.getElementById('explanation-container')
const upgrade_menu = document.getElementById('upgrade-container')
const credits_menu = document.getElementById('credits-container')

const game_container = document.getElementById('main-game-container')
const home_container = document.getElementById('main-home-container')

var options_menu_bool = false
var load_menu_bool = false
var explanation_menu_bool = false
var upgrade_menu_bool = false
var credits_menu_bool = false

var canPlay = false


function menuToggle(menu){

  if (!canPlay){
    canPlay = true
    playMusic()
  }

  options_menu.style.display = "none"
  explanation_menu.style.display = "none"
  upgrade_menu.style.display = "none"
  credits_menu.style.display = "none"

  game_container.style.pointerEvents = "auto"
  home_container.style.pointerEvents = "auto"

  home_container.style.filter = "blur(0px)"
  if (sceneVar % 2 == 1){
    game_container.style.filter = "blur(0px)"
  }

  // Détecter le cas lorsqu'on veut ouvrir le menu d'options avec echap
  if(!options_menu_bool && !load_menu_bool && !explanation_menu_bool && !upgrade_menu_bool && !credits_menu_bool && menu == "escape"){
    menu = "settings"
  }

  options_menu_bool = false
  load_menu_bool = false
  explanation_menu_bool = false
  upgrade_menu_bool = false
  credits_menu_bool = false

  switch(menu) {

    case "settings":

    options_menu_bool = true

      game_container.style.transition= "0.6s"
      home_container.style.transition= "0.6s"

      game_container.style.filter = "blur(10px)"
      home_container.style.filter = "blur(10px)"

      game_container.style.pointerEvents = "none"
      home_container.style.pointerEvents = "none"

      setTimeout(() => {
          options_menu.style.display = "flex"
      }, 100);

      break;

    case "explanations":
      explanation_menu_bool = true
      explanation_menu.style.display = "block"

      break;

    case "upgrade":
      upgrade_menu_bool = true
      upgrade_menu.style.display = "block"

      break;

    case "loading":
      explanation_menu_bool = true
      explanation_menu.style.display = "block"
  
      break;

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

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        if (load_menu_bool){
            updateSaves()
        } else {
            menuToggle("escape")
        }
    }
  });

function updateSaves(){

  if (!canPlay){
    canPlay = true
    playMusic()
  }


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
    
  }
  
let sceneVar = 0;

function changeScene(){

  if (!canPlay){
    canPlay = true
    playMusic()
  }


  let home_container = document.getElementById("main-home-container")
  let game_container = document.getElementById("main-game-container")

  if (sceneVar %2 == 0){
    home_container.style.transform = "scale(10)"
    game_container.style.transform = "scale(1)"
    game_container.style.filter = "blur(0px)"

    setTimeout(() => {
      home_container.style.display = "none"
    }, 1300);
  } else {
    home_container.style.transition= "0s"
    home_container.style.display = "flex"
    home_container.style.transform = "scale(10)"

    setTimeout(() => {
      home_container.style.transition= "1.2s"
      home_container.style.transform = "scale(1)"
      game_container.style.transform = "scale(0.3)"
      game_container.style.filter = "blur(10px)"
    }, 0);

  }

  sceneVar++
}

var hoverBox = document.getElementById("hoverBox");
var items = document.querySelectorAll('.items-container');


items.forEach(item => {
  item.addEventListener('mousemove', (e) => {
    hoverBox.style.display = 'block';
    hoverBox.textContent = item.getAttribute('data-name');
    hoverBox.style.left = e.pageX + 10 + 'px';
    hoverBox.style.top = e.pageY + 10 + 'px';
  });

  item.addEventListener('mouseleave', () => {
    hoverBox.style.display = 'none';
  });
});

var boutons = document.querySelectorAll('.navbar-hover-background'); 
let hoverTimeout;
let mouseX = 0, mouseY = 0;

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
    }, 1000); // 1 second delay
  });

  bouton.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimeout);
    hoverBox.style.display = 'none';
  });
});