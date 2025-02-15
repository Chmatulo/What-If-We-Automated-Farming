const options_menu = document.getElementById('options-container')

let isDragging2 = false;
let offsetX2, offsetY2;

// Mouse down: Start dragging
options_menu.addEventListener("mousedown", (e) => {
  isDragging2 = true;
  offsetX2 = e.clientX - options_menu.offsetLeft;
  offsetY2 = e.clientY - options_menu.offsetTop;
});

// Mouse move: Update position if dragging
window.addEventListener("mousemove", (e) => {
  if (isDragging2) {
    options_menu.style.left = e.clientX - offsetX2 + "px";
    options_menu.style.top = e.clientY - offsetY2 + "px";
  }
});

// Mouse up: Stop dragging
window.addEventListener("mouseup", () => {
  isDragging2 = false;
});

var options_menu_bool = false
var load_menu_bool = false

function menuUpdate(){
    options_menu_bool = !options_menu_bool

    let game_container = document.getElementById("main-game-container")
    let home_container = document.getElementById("main-home-container")

    if (options_menu_bool){

        game_container.style.transition= "0.6s"
        home_container.style.transition= "0.6s"

        game_container.style.filter = "blur(10px)"
        home_container.style.filter = "blur(10px)"

        game_container.style.pointerEvents = "none"
        home_container.style.pointerEvents = "none"

        setTimeout(() => {
            options_menu.style.display = "flex"
        }, 100);

    } else {

      if (sceneVar % 2 == 1){
          game_container.style.filter = "blur(0px)"
      }

        home_container.style.filter = "blur(0px)"

        setTimeout(() => {
            game_container.style.transition= "1.2s"
            home_container.style.transition= "1.2s"
            options_menu.style.display = "none"

            game_container.style.pointerEvents = "auto"
            home_container.style.pointerEvents = "auto"
        }, 100);

    }
}


document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        if (load_menu_bool){
            updateSaves()
        } else {
            menuUpdate()
        }
    }
  });

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
    
  }
  
let sceneVar = 0;

function changeScene(){

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