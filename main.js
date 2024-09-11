const $canvas = document.querySelector("canvas");
const $list = document.querySelector("ul");
const $input = document.querySelector("input");

const context = $canvas.getContext("2d");
const deleteSVG = `
 <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
    <path
       d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
    />
  </svg>
`;

const wheelRadius = 300;
const options = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5", "Option 6"];
const sliceAngle = (2 * Math.PI) / options.length;

let currentAngle = 0; // Starting angle
let spinSpeed = 0; // Speed of spinning
let isSpinning = false;

// Draw the wheel
function drawWheel() {
  for (let i = 0; i < options.length; i++) {
    const startAngle = currentAngle + i * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    // Draw the slice
    context.beginPath();
    context.moveTo($canvas.width / 2, $canvas.height / 2);
    context.arc($canvas.width / 2, $canvas.height / 2, wheelRadius, startAngle, endAngle);
    context.closePath();

    // Alternate colors for the slices
    context.fillStyle = i % 2 === 0 ? "#FFDD57" : "#FF8C42";
    context.fill();

    // Draw the text
    context.save();
    context.translate($canvas.width / 2, $canvas.height / 2);
    context.rotate((startAngle + endAngle) / 2); // Rotate to align text
    context.textAlign = "center";
    context.fillStyle = "#000";
    context.font = "18px Arial";
    context.fillText(options[i], wheelRadius / 2, 10);
    context.restore();
  }
}

// Spin logic
function spinWheel() {
  if (!isSpinning) return;
  currentAngle += spinSpeed;
  spinSpeed *= 0.99; // Slow down gradually
  if (spinSpeed < 0.01) {
    // Stop the wheel if speed is very low
    isSpinning = false;
    determineResult();
  }
  drawWheel();
  requestAnimationFrame(spinWheel);
}

// Determine the result after spinning stops
function determineResult() {
  const winningIndex = Math.floor(((2 * Math.PI - (currentAngle % (2 * Math.PI))) / sliceAngle) % options.length);
  alert(`Result: ${options[winningIndex]}`);
}

// Start spinning when the button is clicked
$canvas.addEventListener("click", () => {
  if (!isSpinning) {
    spinSpeed = Math.random() * 0.2 + 0.1; // Set random spin speed
    isSpinning = true;
    spinWheel();
  }
});

drawWheel();

function createOption(text) {
  const $item = document.createElement("li");
  const $button = document.createElement("button");

  $item.textContent = text;

  $button.innerHTML = deleteSVG;
  $button.title = "Delete option";

  $item.appendChild($button);
  $list.appendChild($item);

  $button.addEventListener("click", () => deleteOption($item));
}

function deleteOption(element) {
  $list.removeChild(element);
}

$input.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    createOption($input.value);
    $input.value = "";
  }
});
