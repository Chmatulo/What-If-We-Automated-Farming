const options_menu = document.getElementById('options-container')
var options_menu_bool = false

function optionsUpdate(){
    console.log("updated")
    options_menu_bool = !options_menu_bool

    if (options_menu_bool){
        options_menu.style.display = "flex"
    } else {
        options_menu.style.display = "none"
    }
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      optionsUpdate()
    }
  });
  