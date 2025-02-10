
var IDE_number = -1

function createIDE(){

  IDE_number++

  const functionColor = '#fddd5c';
  const nativeToolsColor = '#f5b00f';
  const numbersColor = '#fac039';
  const commentColor = '#9b9b9b';

  let beforeWidth = 350;
  let beforeHeight = 200;

  const palette = {};

  // Grouper selon couleur
  const functionKeys = ["ping", "move", "harvest", "plant", "canPlant", "canHarvest", "harvest", "canTill", "till"];
  const nativeToolKeys = ["def", "if", "else", "for", "in", "while", "and", "return", "break", "print"];


  const keywords = [...functionKeys, ...nativeToolKeys]

  functionKeys.forEach(i => palette[i] = functionColor);

  nativeToolKeys.forEach(i => palette[i] = nativeToolsColor);

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  let main_container = document.getElementById("main-container")

  // Main Container
  let IDE_Container = document.createElement('div');
  IDE_Container.classList.add("IDE-container")
  IDE_Container.addEventListener("mousedown", (event) => {
    // Check if the click is outside the content area but not on the resize corner
    const rect = IDE_Container.getBoundingClientRect();
    const isResizeArea = event.clientY > rect.top + 32;
    // Start dragging if the click is not on the resize corner
    if (!isResizeArea) {
      isDragging = true;
      // Calculate the offset
      offsetX = event.clientX - IDE_Container.offsetLeft;
      offsetY = event.clientY - IDE_Container.offsetTop;
    }
  });

  // Textarea for code
  let code_input = document.createElement('textarea');
  code_input.classList.add("IDE", "code-input")
  code_input.value = '# Write your code here:';
  code_input.style.color = "transparent"
  code_input.setAttribute('spellcheck', false)
  code_input.addEventListener("input", updateHighlight)
  code_input.addEventListener("keydown", (e) => {

    if (e.key === "Tab") {

        e.preventDefault();

        const start = code_input.selectionStart;
        const end = code_input.selectionEnd;

        // Insert four spaces at the cursor position
        const value = code_input.value;
        code_input.value = value.substring(0, start) + "    " + value.substring(end);

        // Move the cursor after the inserted spaces
        code_input.selectionStart = code_input.selectionEnd = start + 4;
        updateHighlight()
    }
});

code_input.addEventListener("input", (event) => {
  const textcontent = code_input.value;

  let newText = highlightKeywords(textcontent, keywords)

  code_highlight.innerHTML = newText;

  const spans = code_highlight.querySelectorAll("span");

spans.forEach((span) => {

if (span.parentElement.tagName === "SPAN") {
  span.style.color = '#9b9b9b'
}

  });
});

main_container.addEventListener("mousemove", (event) => {
  if (isDragging) {
    // Update the textarea's position
    IDE_Container.style.left = event.clientX - offsetX + "px";
    IDE_Container.style.top = event.clientY - offsetY + "px";
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
  code_highlight.innerText = '# Write your code here:';
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
  if (IDE_number == 0){
    IDE_name.value = "main"
  } else {
    IDE_name.value = "code " + IDE_number
  }
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

  const linePattern = /#.*$/gm;

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

createIDE()

/*
let personne = {}
personne.name = "Pierre"
personne.age = 18

console.log(personne.name)


function save(){
    localStorage.setItem("user", JSON.stringify(personne));
}

function load(){
    let storedUser = JSON.parse(localStorage.getItem("user"));
    console.log(storedUser.name)
}
*/