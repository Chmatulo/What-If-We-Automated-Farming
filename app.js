
// Indentation

const code_input = document.getElementById("code-input");
const code_highlight = document.getElementById("code-highlight");

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
    }
});

const IDE_Container = document.getElementById("IDE-container");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

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
// Mouse move: Dragging logic
document.addEventListener("mousemove", (event) => {
  if (isDragging) {
    // Update the textarea's position
    IDE_Container.style.left = event.clientX - offsetX + "px";
    IDE_Container.style.top = event.clientY - offsetY - 56 + "px";
  }

  code_highlight.style.height = code_input.style.height
  code_highlight.style.width = code_input.style.width


});
// Mouse up: Stop dragging
document.addEventListener("mouseup", () => {

  if (code_input.clientHeight == 0){
    IDE_Container.style.resize = "none"
  }

  isDragging = false;
});

code_input.addEventListener("input", updateHighlight);

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

const functionColor = '#fddd5c';
const nativeToolsColor = '#f5b00f';
const numbersColor = '#fac039';
const commentColor = '#9b9b9b';

const palette = {};

// Group keys by their associated color
const functionKeys = ["ping"];
const nativeToolKeys = ["def", "if", "else", "for", "in", "while", "and", "return", "break", "print"];

const keywords = [...functionKeys, ...nativeToolKeys]

functionKeys.forEach(i => palette[i] = functionColor);

nativeToolKeys.forEach(i => palette[i] = nativeToolsColor);


function highlightKeywords(inputString, keywords) {
  // Escape special characters in keywords for RegExp
  const escapedKeywords = keywords.map(keyword => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  
  // Create a regex pattern for keywords
  const keywordPattern = new RegExp(`\\b(${escapedKeywords.join('|')})\\b`, 'gi');
  
  // Create a regex pattern for all numbers
  const numberPattern = /-?\b\d+(\.\d+)?\b/g;

  const linePattern = /#.*$/gm;

  // Replace matched comment lines with a styled span
    inputString = inputString.replace(linePattern, (match) => {
    return `<span class="IDE-text" style="color: ${commentColor};">${match}</span>`;
  });

  // Replace matched keywords with a styled span
  inputString = inputString.replace(keywordPattern, (match) => {
    const color = palette[match]
    return `<span class="IDE-text" style="color: ${color};">${match}</span>`;
  });

  // Replace matched numbers with a styled span
 inputString = inputString.replace(numberPattern, (match) => {
    return `<span class="IDE-text" style="color: ${numbersColor};">${match}</span>`;
  });


return inputString

}
updateHighlight()

let beforeWidth = 350;
let beforeHeight = 200;

function minimize(){

let IDE_Container = document.getElementById("IDE-container")

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
}