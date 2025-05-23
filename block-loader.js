// Charger IDE depuis la sauvegarde
function loadCreateIDE(){
  for (let k = 0 ; k < currentSaveArray.length ; k++){
    createIDE(currentSaveArray[k][0], currentSaveArray[k][1], currentSaveArray[k][2], currentSaveArray[k][3], currentSaveArray[k][4], currentSaveArray[k][5], currentSaveArray[k][6])
  }
}

// Cree un IDE sur commande de l'utilisateur
function createIDEUser(){
  let id = currentSaveArray.length
  currentSaveArray.push([id, "code " + id, "#Write your code here:", 124, 128, 350, 200])
  createIDE(id, "code " + id, "#Write your code here:", 124, 128, 350, 200)
}

// Fonction creer IDE
function createIDE(id, name, code, x, y, w, h){

  const functionColor = '#fddd5c';
  const nativeToolsColor = '#f5b00f';
  const numbersColor = '#fac039';
  const commentColor = '#9b9b9b';

  let beforeWidth = w;
  let beforeHeight = h;

  const palette = {};

  // Grouper selon couleur
  const functionKeys = ["move", "harvest", "plant", "canPlant", "canHarvest", "harvest", "canTill", "till", "buy", "canBuy", "getNumber", "sell", "clear", "water", "getPos", "goldenRun"];
  const nativeToolKeys = ["def", "if", "else", "for", "in", "while", "and", "return", "break", "print"];


  const keywords = [...functionKeys, ...nativeToolKeys]

  functionKeys.forEach(i => palette[i] = functionColor);

  nativeToolKeys.forEach(i => palette[i] = nativeToolsColor);

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  let main_container = document.getElementById("main-game-container")

  // Main Container
  let IDE_Container = document.createElement('div');
  IDE_Container.id = id
  IDE_Container.classList.add("IDE-container")
  IDE_Container.style.height = h + "px"
  IDE_Container.style.width = w + "px"

  addResizeListener(IDE_Container, function (e) {
      console.log(IDE_Container.id, currentSaveArray)
      currentSaveArray[IDE_Container.id][5] = e.contentRect.width
      currentSaveArray[IDE_Container.id][6] = e.contentRect.height
  });


  IDE_Container.addEventListener("mousedown", (event) => {
    // Verifie si le click est en dehors de la zone de contenu mais pas dans le coin
    const rect = IDE_Container.getBoundingClientRect();
    const isResizeArea = event.clientY > rect.top + 32;
    // Deplace la division si ce n'est pas dans le coin
    if (!isResizeArea) {
      isDragging = true;
      // Offset
      offsetX = event.clientX - IDE_Container.offsetLeft;
      offsetY = event.clientY - IDE_Container.offsetTop;
    }
  });

  // Textarea pour le code
  let code_input = document.createElement('textarea');
  code_input.classList.add("IDE", "code-input")
  code_input.value = code;
  code_input.id = "code_input" + id
  code_input.style.color = "transparent"
  code_input.setAttribute('spellcheck', false)
  code_input.addEventListener("input", updateHighlight)
  code_input.addEventListener("keydown", (e) => {

    if (e.key === "Tab") {

        e.preventDefault();

        const start = code_input.selectionStart;
        const end = code_input.selectionEnd;

        // Ajouter 4 espaces 
        const value = code_input.value;
        code_input.value = value.substring(0, start) + "    " + value.substring(end);

        // Deplacer le cursor
        code_input.selectionStart = code_input.selectionEnd = start + 4;
        updateHighlight()
    }
});

// Ecouter entree utilisateur pour ecrire le code en couleur
code_input.addEventListener("input", (event) => {

  const textcontent = code_input.value;
  currentSaveArray[IDE_Container.id][2] = textcontent

  let newText = highlightKeywords(textcontent, keywords)

  code_highlight.innerHTML = newText;

  const spans = code_highlight.querySelectorAll("span");

spans.forEach((span) => {

if (span.parentElement.tagName === "SPAN") {
  span.style.color = '#9b9b9b'
}

  });
});

IDE_Container.style.left = x + "px"
IDE_Container.style.top = y + "px"

main_container.addEventListener("mousemove", (event) => {
  if (isDragging) {
    // Actualiser la position du textarea
    IDE_Container.style.left = event.clientX - offsetX + "px";
    IDE_Container.style.top = event.clientY - offsetY + "px";

    currentSaveArray[IDE_Container.id][3] = event.clientX - offsetX
    currentSaveArray[IDE_Container.id][4] = event.clientY - offsetY

  }

  code_highlight.style.height = code_input.style.height
  code_highlight.style.width = code_input.style.width

});

main_container.addEventListener("mouseup", () => {

  if (code_input.clientHeight == 0){
    IDE_Container.style.resize = "none"
  }

  isDragging = false;
});

  IDE_Container.appendChild(code_input)

  // Highlight Area for colors
  let code_highlight = document.createElement('div');
  code_highlight.classList.add("IDE");
  code_highlight.style.pointerEvents = "none"
  code_highlight.style.backgroundColor = "transparent"
  code_highlight.style.color = "white"
  code_highlight.style.userSelect = "none"
  code_highlight.style.paddingLeft = "5px"
  code_highlight.innerText = code;
  IDE_Container.appendChild(code_highlight)

  // Header IDE
  let IDE_Header = document.createElement('div');
  IDE_Header.classList.add("ide-header")
  IDE_Container.appendChild(IDE_Header)

  // Left Header IDE
  let left_Header = document.createElement('div');
  left_Header.classList.add("left", "header")
  IDE_Header.appendChild(left_Header)

  // Run Button
  let run_button = document.createElement('div');
  run_button.classList.add("code-button", "run-button")
  left_Header.appendChild(run_button)

  // Run Icon
  let run_icon = document.createElement('i');
  run_icon.classList.add("fa-solid", "fa-play", "icon")
  run_button.appendChild(run_icon)

  // Stop Button
  let stop_button = document.createElement('div');
  stop_button.classList.add("code-button", "stop-button")
  left_Header.appendChild(stop_button)

  // Stop Icon
  let stop_icon = document.createElement('i');
  stop_icon.classList.add("fa-solid", "fa-stop", "icon")
  stop_button.appendChild(stop_icon)

  // Central Header IDE
  let center_Header = document.createElement('div');
  center_Header.classList.add("center", "header")
  IDE_Header.appendChild(center_Header)

  // IDE name input
  let IDE_name = document.createElement('input');
  IDE_name.type = "text"
  IDE_name.maxLength = 10
  IDE_name.autocomplete = "off"
  IDE_name.classList.add("ide-name")
  IDE_name.value = name

  IDE_name.addEventListener('input', function (event) {
    currentSaveArray[IDE_Container.id][1] = IDE_name.value
  });

  center_Header.appendChild(IDE_name)

  // Right Header
  let right_Header = document.createElement('div');
  right_Header.classList.add("right", "header")
  IDE_Header.appendChild(right_Header)

  // Minimize Button
  let minimize_button = document.createElement('div');
  minimize_button.classList.add("code-button", "run-button")
  right_Header.appendChild(minimize_button)
  minimize_button.addEventListener('click', function() {

    if (IDE_Container.clientHeight > 32){
    
      beforeHeight = IDE_Container.clientHeight
      beforeWidth = IDE_Container.clientWidth
    
      IDE_Container.style.height = 32 + "px"
      IDE_Container.style.width = 350  + "px"
    
      IDE_Container.style.resize = "none"
    
    } else {
    
      if (beforeHeight < 62){
        beforeHeight = 62
      }
    
      IDE_Container.style.resize = "both"
    
      IDE_Container.style.height = beforeHeight + "px"
      IDE_Container.style.width = beforeWidth + "px"
    
      }
  });

  // Minimize Icon
  let minimize_icon = document.createElement('i');
  minimize_icon.classList.add("fa-solid", "fa-minus", "icon")
  minimize_button.appendChild(minimize_icon)

  // Close Button
  let close_button = document.createElement('div');
  close_button.classList.add("code-button", "close-button")
  close_button.addEventListener("click", function () {
      currentSaveArray.splice(IDE_Container.id, 1)
      reorganize()
      IDE_Container.remove();
  });
  right_Header.appendChild(close_button)

  // Close Icon
  let close_icon = document.createElement('i');
  close_icon.classList.add("fa-solid", "fa-xmark", "icon")
  close_button.appendChild(close_icon)

  main_container.appendChild(IDE_Container)


function updateHighlight() {
  const textcontent = code_input.value;

  let newText = highlightKeywords(textcontent, keywords)

  code_highlight.innerHTML = newText;

  const spans = code_highlight.querySelectorAll("span");

spans.forEach((span) => {

if (span.parentElement.tagName === "SPAN") {
  span.style.color = '#9b9b9b'
   }

  });
  
}

updateHighlight()

function highlightKeywords(inputString, keywords) {

  // Caractères spéciaux Regex 
  const escapedKeywords = keywords.map(keyword => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  
  // Pattern Regex pour les keywords
  const keywordPattern = new RegExp(`\\b(${escapedKeywords.join('|')})\\b`, 'gi');
  
  // Pattern Regex pour les nombres
  const numberPattern = /-?\b\d+(\.\d+)?\b/g;

  const linePattern = /#.*$/gm; // Comentaires python

  // Remplacer mots par un span stylisé
    inputString = inputString.replace(linePattern, (match) => {
    return `<span class="IDE-text" style="color: ${commentColor};">${match}</span>`;
  });

  // Remplacer mots par un span stylisé
  inputString = inputString.replace(keywordPattern, (match) => {
    const color = palette[match]
    return `<span class="IDE-text" style="color: ${color};">${match}</span>`;
  });

  // Remplacer mots par un span stylisé
 inputString = inputString.replace(numberPattern, (match) => {
    return `<span class="IDE-text" style="color: ${numbersColor};">${match}</span>`;
  });


return inputString

  }

  run_button.addEventListener('click', function() {
    runCode(code_input.value)
  });

  stop_button.addEventListener("click", stopWorker);

}

// Reorganise le tableau pour que chaque element ait le bon index
function reorganize(){
  for (let i = 0 ; i < currentSaveArray.length ; i++){
    currentSaveArray[i][0] = i
  }
}

// Fonction qui supprime tous les blocks de code
function clearCodeBlocks(){
  let codeBlocks = document.getElementsByClassName("IDE-container")
  Array.from(codeBlocks).forEach(el => el.remove());
}

// Fonction qui ajoute un eventlistener pour le changement de taille
function addResizeListener(el, callback) {
  const observer = new ResizeObserver(entries => {
    for (let entry of entries) {
      callback(entry);
    }
  });
  observer.observe(el);
  return observer;
}

// Creer les labels de sauvegarde
function loadSaveLabels(){

document.querySelectorAll('.load-container').forEach(el => el.remove());

createdSavesData = JSON.parse(localStorage.getItem("saveLabels"));

  for (let k = 0; k < 5 ; k++){
    if (createdSavesData[k] != ""){
      createSave("loaded", k)
    }
  }

}

// Fonction qui retorune vrai ou faux selon si l'on peut creer une nouvelle save
function canCreateSave(){
  for (let k = 0; k < 5 ; k++){
    if (createdSavesData[k] === ""){
      return true
    }
  }
  return false
}

// Retourne l'index du premier emplacement disponible
function firstAvailable(){
  for (let k = 0; k < 5 ; k++){
    if (createdSavesData[k] === ""){
      return k
    }
  }
}

// Creer un label de sauvegarde
function createSave(type, num){

    if (canCreateSave() || type === "loaded"){

    const right_load = document.getElementById("right-load");

    let load_container = document.createElement("div");
    load_container.classList.add("load-container")

    if (type === "default"){
      load_container.id = firstAvailable()
    } else {
      load_container.id = num
    }

    let load_button = document.createElement("button");
    load_button.classList.add("load-editable", "load-button");
    load_button.setAttribute("data-id", "1");
    load_button.onclick = function() {
      updateSaves()
      changeScene()
      load(+load_container.id + 1)
    };

    if (type === "default"){
      load_button.textContent = "New Save";
      createdSavesData[firstAvailable()] = "New Save"
    } else {
      load_button.textContent = createdSavesData[num];
    }

    load_container.appendChild(load_button)

    let edit_button = document.createElement("div");
    edit_button.classList.add("edit-button");
    edit_button.onclick = function() {
        load_button.contentEditable = true;
        load_button.focus();
        let range = document.createRange();
        let selection = window.getSelection();
    
            range.selectNodeContents(load_button); // Selectionne tout le contenu
            range.collapse(false); // Deplace le cursor a la fin

            selection.removeAllRanges(); // Supprime la seletion
            selection.addRange(range); // Appliquer la nouvelle selection

        function onChange(e) {
          createdSavesData[load_container.id] = e.target.textContent
          localStorage.setItem("saveLabels", JSON.stringify(createdSavesData))
         }

        load_button.addEventListener("input", onChange);

        load_button.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                load_button.contentEditable = false;
                event.preventDefault(); 
                load_button.removeEventListener("input", onChange);
            }

            if (event.code === "Space") {
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

        createdSavesData[load_container.id] = ""
        localStorage.setItem("saveLabels", JSON.stringify(createdSavesData))
        load_container.remove();
    };
    load_container.appendChild(delete_button)

    let delete_icon = document.createElement("i");
    delete_icon.classList.add("fa-solid", "fa-trash", "edit-icon");
    delete_button.appendChild(delete_icon)

    right_load.appendChild(load_container)

    localStorage.setItem("saveLabels", JSON.stringify(createdSavesData))
    }
}

// Fonction qui active la possibilite de modifier le nom de la sauvegarde
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

// Fonction affiche menu sauvegarder sous
function saveAs(){

  const saveButtons = document.querySelectorAll(".saveButtonLoad");
  saveButtons.forEach(button => button.remove());

    document.getElementById("saveAs").style.display = "none"
    document.getElementById("saveCurrent").style.display = "none"
    document.getElementById("createSaveMenu").style.display = "flex"

    loadMenuSaves()
}

// Charge lessauvegardes dans le menu 
function loadMenuSaves(){

  let saveButtonsContainer = document.getElementById("loadingSaves");
  let saveLabels = JSON.parse(localStorage.getItem("saveLabels"));

  for (let i = 0; i < saveLabels.length; i++) {
    if (saveLabels[i] !== "") {

      let saveButton = document.createElement("div");
      saveButton.innerText = saveLabels[i];
      saveButton.classList.add("saveButtonLoad");
      saveButton.onclick = function (event) {
        save("specific", i + 1);
      };
  
      saveButtonsContainer.appendChild(saveButton);
    }
  }
}

// Ajouter nouveau label de sauvegarde
function addNewSaveMenu(){
  
  let saveButtonsContainer = document.getElementById("loadingSaves");
  let saveLabels = JSON.parse(localStorage.getItem("saveLabels"));

  for (let i = 0; i < saveLabels.length; i++) {
    if (saveLabels[i] == "") {

      let saveButton = document.createElement("div");
      saveButton.innerText = "New Save";
      saveButton.classList.add("saveButtonLoad");
      saveLabels[i] = "New Save"
      localStorage.setItem("saveLabels", JSON.stringify(saveLabels))
      saveButton.onclick = function () {
        save("specific", i + 1);
      };

      saveButtonsContainer.appendChild(saveButton);

      break;
    }
  }
}