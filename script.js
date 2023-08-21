// Selecting DOM elements
const canvas = document.querySelector("canvas");
const toolOptions = document.querySelectorAll(".tools-board .tool");
const fillColorCheckbox = document.querySelector("#fill-color");
const brushSizeSlider = document.querySelector("#brush-size-slider");
const colorButtons = document.querySelectorAll(".colors .option");
const colorPicker = document.querySelector("#color-picker");
const clearCanvasBtn = document.querySelector(".clear-canvas");
const saveImgBtn = document.querySelector(".save-img");
const ctx = canvas.getContext("2d");


// Global variables for drawing
let isDrawing = false;
let brushSize = 5;
let selectedColor = "#000";
let selectedTool = "brush";
let prevMousePoint = 0;
let canvasSnapshot = null;

// Function to reset the canvas
const resetCanvas = () => {
    const doc = document.documentElement
    doc.style.setProperty('--doc-height', `${window.innerHeight}px`);
    
    const dpr = window.devicePixelRatio || 1;
    const canvasRect = canvas.getBoundingClientRect();
    canvas.width = canvasRect.width * dpr;
    canvas.height = canvasRect.height * dpr;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
}

// Function to get current mouse/touch coordinates
const currMousePoint = (e) => {
    let x = ("ontouchstart" in window ? e.touches?.[0]?.pageX : e.pageX) - canvas.offsetLeft;
    let y = ("ontouchstart" in window ? e.touches?.[0]?.pageY : e.pageY) - canvas.offsetTop;
    return { x, y };
}

// Functions to draw rectangle shape
const drawRectangle = (position) => {
    ctx.beginPath();
    const width = position.x - prevMousePoint.x;
    const height = position.y - prevMousePoint.y;
    
    ctx.rect(prevMousePoint.x, prevMousePoint.y, width, height);

    fillColorCheckbox.checked ? ctx.fill() : ctx.stroke();
    ctx.closePath();
}

// Functions to draw circle shape
const drawCircle = (position) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMousePoint.x - position.x), 2) + Math.pow((prevMousePoint.y - position.y), 2));
    ctx.arc(prevMousePoint.x, prevMousePoint.y, radius, 0, 2 * Math.PI);
    fillColorCheckbox.checked ? ctx.fill() : ctx.stroke();
}

// Functions to draw triangle shape
const drawTriangle = (position) => {
    ctx.beginPath();
    ctx.moveTo(prevMousePoint.x, prevMousePoint.y);
    ctx.lineTo(position.x, position.y);
    ctx.lineTo(prevMousePoint.x * 2 - position.x, position.y);
    ctx.closePath();
    fillColorCheckbox.checked ? ctx.fill() : ctx.stroke();
}

// Function to handle the start of drawing
const drawStart = (e) => {
    e.preventDefault();
    isDrawing = true;
    ctx.beginPath();
    ctx.lineCap = "round";
    prevMousePoint = currMousePoint(e);
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    canvasSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Function to handle drawing
const drawing = (e) => {
    if(!isDrawing) return;
    e.preventDefault();
    let position = currMousePoint(e);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(canvasSnapshot, 0, 0);
    
    if(selectedTool === "brush" || selectedTool === "eraser") {
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
    } else if(selectedTool === "rect") {
        drawRectangle(position);
    } else if(selectedTool === "circle") {
        drawCircle(position);
    } else {
        drawTriangle(position);
    }
    ctx.stroke();
}

// Function to handle the end of drawing
const drawStop = () => {
    isDrawing = false;
}

// Event listeners for tool options (brush, eraser, etc.)
toolOptions.forEach(tool => {
    tool.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        tool.classList.add("active");
        selectedTool = tool.id;
    });
});

// Event listener for brush size slider
brushSizeSlider.addEventListener("change", () => brushSize = brushSizeSlider.value);

// Event listeners for color buttons
colorButtons.forEach(button => {
    button.addEventListener("click", () => {
        document.querySelector(".colors .selected").classList.remove("selected");
        button.classList.add("selected");
        selectedColor = window.getComputedStyle(button).getPropertyValue("background-color");
    });
});

// Event listener for color picker
colorPicker.addEventListener("input", (e) => {
    colorPicker.parentElement.classList.add("active");
    colorPicker.parentElement.style.backgroundColor = e.target.value;
    colorPicker.parentElement.click();
});

// Event listener for saving image
saveImgBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${new Date().getTime()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});

// Different event listeners for drawing app
window.addEventListener("load", resetCanvas);
window.addEventListener("resize", resetCanvas);
clearCanvasBtn.addEventListener("click", resetCanvas);

canvas.addEventListener("mousedown", drawStart);
canvas.addEventListener("touchstart", drawStart);

canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("touchmove", drawing);

canvas.addEventListener("mouseup", drawStop);
canvas.addEventListener("mouseleave", drawStop);
canvas.addEventListener("touchend", drawStop);