const $canvas = document.querySelector("canvas");
const $textarea = document.querySelector("textarea");
const $dialog = document.querySelector("dialog");
const $winningText = document.querySelector("#winning-text");
const $removeButton = document.querySelector("#remove");
const $closeButton = document.querySelector("#close");
const $probability = document.querySelector("#probability");

const jsConfetti = new JSConfetti();

const wheelRadius = 350;
const initialSpinSpeed = 0.3;

const ticSound = new Audio("./tic-sound.wav");
const winningSound = new Audio("./win-sound.wav");

let options = Array.from({ length: 12 }).map((_, index) => `Option ${index + 1}`);
let sliceAngle = (2 * Math.PI) / options.length;

let isSpinning = false;
let currentAngle = 0;
let spinSpeed = 0;
let lastSlicePassed = null;

function drawWheel() {
  const context = $canvas.getContext("2d");

  // Clear the canvas before drawing the wheel.
  context.clearRect(0, 0, $canvas.width, $canvas.height);

  const centerX = $canvas.width / 2;
  const centerY = $canvas.height / 2;

  // If the options length is 0, draw a white wheel.
  if (options.length === 0) {
    context.beginPath();
    context.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI);
    context.fillStyle = "#fff";
    context.fill();
  }

  for (let i = 0; i < options.length; i++) {
    if (options.length === 0) return;

    const startAngle = currentAngle + i * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    // Draw the slice.
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
    context.closePath();

    // Alternate colors for the slices.
    context.fillStyle = getColor(i);
    context.fill();

    // Draw the text.
    context.save();
    context.translate(centerX, centerY);
    context.rotate((startAngle + endAngle) / 2);
    context.textAlign = "left";
    context.fillStyle = "#0a0a0a";
    context.font = "500 26px rubik";
    context.fillText(options[i], wheelRadius / 2, 10);
    context.restore();
  }

  // Draw the wheel border.
  context.beginPath();
  context.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI, false);
  context.arc(centerX, centerY, wheelRadius - 15, 0, 2 * Math.PI, true);
  context.fillStyle = "rgba(0, 0, 0, 0.1)";
  context.fill();

  // Draw the arrow pointer.
  const arrowSize = 25;
  const middleY = centerY - arrowSize * 2;

  context.beginPath();
  context.moveTo(centerX - arrowSize, middleY);
  context.lineTo(centerX + arrowSize, middleY);
  context.lineTo(centerX, middleY - arrowSize);
  context.closePath();
  context.fillStyle = "#0a0a0a";
  context.fill();

  // Draw a small circle in the center of the wheel with a pointer.
  context.beginPath();
  context.arc(centerX, centerY, wheelRadius / 6, 0, 2 * Math.PI);
  context.fillStyle = "#0a0a0a";
  context.fill();
}

function spinWheel() {
  // Prevent restarting the spin if already spinning.
  if (isSpinning || options.length === 0) return;

  isSpinning = true;
  // Set an initial spin speed.
  spinSpeed = Math.random() * 0.9 + initialSpinSpeed;

  const spinLoop = () => {
    if (!isSpinning) return;

    currentAngle += spinSpeed;
    // Slow down gradually.
    spinSpeed *= 0.99;

    // Calculate the current slice under the arrow.
    const arrowAngle = Math.PI;
    const adjustedAngle = (currentAngle + arrowAngle) % (2 * Math.PI);
    const currentSlice = Math.floor(((2 * Math.PI - adjustedAngle) / sliceAngle) % options.length);

    // Play sound when a new slice passes the arrow.
    if (currentSlice !== lastSlicePassed) {
      ticSound.play();
      lastSlicePassed = currentSlice;
    }

    // Stop the wheel if speed is very low.
    if (spinSpeed < 0.001) {
      isSpinning = false;
      determineResult();
    }

    drawWheel();
    requestAnimationFrame(spinLoop);
  };

  // Start the spin loop.
  spinLoop();
}

function standByAnimation() {
  const standByAnimationLoop = () => {
    // If the wheel is spinning, cancel the stand by animation loop.
    if (isSpinning) {
      cancelAnimationFrame(standByAnimationLoop);
      return;
    }

    currentAngle += 0.005;
    drawWheel();
    requestAnimationFrame(standByAnimationLoop);
  };

  // Start the stand by animation loop if the wheel is not spinning.
  if (!isSpinning) {
    standByAnimationLoop();
  }
}

function determineResult() {
  const adjustedAngle = (currentAngle + Math.PI / 2) % (2 * Math.PI);
  const winningIndex = Math.floor(((2 * Math.PI - adjustedAngle) / sliceAngle) % options.length);

  jsConfetti.addConfetti();
  $winningText.textContent = options[winningIndex];
  $probability.textContent = `${(100 / options.length).toFixed(2)}%`;

  $removeButton.addEventListener("click", () => {
    removeOption(winningIndex);
    closeDialog();
  });

  winningSound.play();
  $dialog.showModal();
}

function updateOptions() {
  options = $textarea.value.split("\n").filter((option) => option.trim() !== "");

  if (options.length === 0) {
    $canvas.style.cursor = "not-allowed";
    $canvas.title = "Please add at least one option";
  } else {
    $canvas.style.cursor = "pointer";
    $canvas.title = "";
  }

  sliceAngle = (2 * Math.PI) / options.length;
  drawWheel();
}

function removeOption(index) {
  $textarea.value = $textarea.value
    .split("\n")
    .filter((_, i) => i !== index)
    .join("\n");
  updateOptions();
}

drawWheel();
standByAnimation();

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
  closeDialog();
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

function closeDialog() {
  $dialog.close();
  setTimeout(() => {
    standByAnimation();
  }, 3000);
}
