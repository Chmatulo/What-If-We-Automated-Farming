const options_menu = document.getElementById('options-container')

let isDragging = false;
let offsetX, offsetY;

// Mouse down: Start dragging
options_menu.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - options_menu.offsetLeft;
  offsetY = e.clientY - options_menu.offsetTop;
});

// Mouse move: Update position if dragging
window.addEventListener("mousemove", (e) => {
  if (isDragging) {
    options_menu.style.left = e.clientX - offsetX + "px";
    options_menu.style.top = e.clientY - offsetY + "px";
  }
});

// Mouse up: Stop dragging
window.addEventListener("mouseup", () => {
  isDragging = false;
});

var options_menu_bool = false
var load_menu_bool = false

function optionsUpdate(){
    options_menu_bool = !options_menu_bool

    if (options_menu_bool){
        options_menu.style.display = "flex"
    } else {
        options_menu.style.display = "none"
    }
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        if (load_menu_bool){
            updateSaves()
        } else {
            optionsUpdate()
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
  

function test(){
    console.log("clicked")
}

var saveNumber = 0

function createSave(){

    if (saveNumber <= 4){

    saveNumber++

    const right_load = document.getElementById("right-load");

    let load_container = document.createElement("div");
    load_container.classList.add("load-container")

    let load_button = document.createElement("button");
    load_button.classList.add("load-editable", "load-button");
    load_button.setAttribute("data-id", "1");
    load_button.onclick = function() {
        dataTEST.age = 1
    };
    load_button.textContent = "New Save";
    load_container.appendChild(load_button)

    let edit_button = document.createElement("div");
    edit_button.classList.add("edit-button");
    edit_button.onclick = function() {
        load_button.contentEditable = true;
        load_button.focus();
        let range = document.createRange();
        let selection = window.getSelection();
    
            range.selectNodeContents(load_button); // Selects all content inside
            range.collapse(false); // Moves the cursor to the end

            selection.removeAllRanges(); // Clear existing selection
            selection.addRange(range); // Apply new selection

        load_button.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                load_button.contentEditable = false;
                event.preventDefault(); 
            }
        });
    
        load_button.addEventListener("blur", function() {
            load_button.contentEditable = false;
        });
    };
    load_container.appendChild(edit_button)

    let edit_icon = document.createElement("i");
    edit_icon.classList.add("fa-solid", "fa-pen", "edit-icon");
    edit_button.appendChild(edit_icon)

    let delete_button = document.createElement("div");
    delete_button.classList.add("edit-button")
    delete_button.onclick = function() {
        saveNumber = saveNumber - 1 
        load_container.remove();
    };
    load_container.appendChild(delete_button)

    let delete_icon = document.createElement("i");
    delete_icon.classList.add("fa-solid", "fa-trash", "edit-icon");
    delete_button.appendChild(delete_icon)

    right_load.appendChild(load_container)
    }
}


function enableEditing() {
    let buttonText = document.getElementById("editableButton");
    buttonText.contentEditable = true;
    buttonText.focus();

    buttonText.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            buttonText.contentEditable = false;
            event.preventDefault(); 
        }
    });

    buttonText.addEventListener("blur", function() {
        buttonText.contentEditable = false;
    });
}
