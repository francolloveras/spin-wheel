const $canvas = document.querySelector("canvas");
const $textarea = document.querySelector("textarea");
const $dialog = document.querySelector("dialog");
const $winningText = document.querySelector("#winning-text");
const $deleteButton = document.querySelector("#delete");
const $closeButton = document.querySelector("#close");
const $probability = document.querySelector("#probability");

const jsConfetti = new JSConfetti();

const wheelRadius = 350;
const initialSpinSpeed = 1;

let options = Array.from({ length: 12 }).map((_, index) => `Option ${index + 1}`);
let sliceAngle = (2 * Math.PI) / options.length;

let isSpinning = false;
let currentAngle = 0;
let spinSpeed = 0;

function drawWheel() {
  const context = $canvas.getContext("2d");

  for (let i = 0; i < options.length; i++) {
    const startAngle = currentAngle + i * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    // Draw the slice
    context.beginPath();
    context.moveTo($canvas.width / 2, $canvas.height / 2);
    context.arc($canvas.width / 2, $canvas.height / 2, wheelRadius, startAngle, endAngle);
    context.closePath();

    // Alternate colors for the slices
    context.fillStyle = getColor(i);
    context.fill();

    // Draw the text
    context.save();
    context.translate($canvas.width / 2, $canvas.height / 2);
    context.rotate((startAngle + endAngle) / 2);
    context.textAlign = "left";
    context.fillStyle = "#000";
    context.font = "500 26px rubik";
    context.fillText(options[i], wheelRadius / 2, 10);
    context.restore();
  }

  // Draw a small circle in the center of the wheel with a pointer.
  context.beginPath();
  context.arc($canvas.width / 2, $canvas.height / 2, wheelRadius / 4, 0, 2 * Math.PI);
  context.fillStyle = "#000";
  context.fill();
}

function spinWheel() {
  // Prevent restarting the spin if already spinning
  if (isSpinning) return;

  isSpinning = true;
  // Set an initial spin speed
  spinSpeed = Math.random() * 0.1 + initialSpinSpeed;

  const spinLoop = () => {
    if (!isSpinning) return;

    currentAngle += spinSpeed;
    // Slow down gradually
    spinSpeed *= 0.99;

    // Stop the wheel if speed is very low
    if (spinSpeed < 0.001) {
      isSpinning = false;
      determineResult();
    }

    drawWheel();
    requestAnimationFrame(spinLoop);
  };

  // Start the spin loop
  spinLoop();
}

function determineResult() {
  const winningIndex = Math.floor(((2 * Math.PI - (currentAngle % (2 * Math.PI))) / sliceAngle) % options.length);

  jsConfetti.addConfetti();
  $winningText.textContent = options[winningIndex];
  $probability.textContent = `${(100 / options.length).toFixed(2)}%`;

  $dialog.showModal();
}

function updateOptions() {
  options = $textarea.value.split("\n").filter((option) => option.trim() !== "");
  sliceAngle = (2 * Math.PI) / options.length;
  drawWheel();
}

drawWheel();

$canvas.addEventListener("click", () => {
  // Spin the wheel when the canvas is clicked.
  spinWheel();
});

$textarea.value = options.join("\n");

$textarea.addEventListener("keyup", (event) => {
  // Prevent default behavior and update the options.
  event.preventDefault();
  updateOptions();
});

$closeButton.addEventListener("click", () => {
  $dialog.close();
});

function getColor(sliceIndex) {
  const colors = [
    "#f87171",
    "#fb923c",
    "#fbbf24",
    "#facc15",
    "#4ade80",
    "#34d399",
    "#22d3ee",
    "#60a5fa",
    "#818cf8",
    "#c084fc",
    "#e879f9",
    "#f472b6",
  ];

  return colors[sliceIndex % colors.length];
}
