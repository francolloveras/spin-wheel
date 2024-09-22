const $canvas = document.querySelector("canvas");
const $list = document.querySelector("ul");
const $input = document.querySelector("input");
const $dialog = document.querySelector("dialog");

const jsConfetti = new JSConfetti();

class Wheel {
  constructor({ $list, $canvas, $dialog, wheelRadius, initialSpinSpeed = 1 }) {
    this.$list = $list;
    this.$canvas = $canvas;
    this.$dialog = $dialog;
    this.wheelRadius = wheelRadius;
    this.initialSpinSpeed = initialSpinSpeed;
    this.currentAngle = 0;
    this.spinSpeed = 0;
    this.isSpinning = false;
  }

  get options() {
    return Array.from(this.$list.children).map(({ textContent }) => textContent);
  }

  get sliceAngle() {
    return (2 * Math.PI) / this.options.length;
  }

  addOption(text) {
    const $item = document.createElement("li");
    const $button = document.createElement("button");
    const deleteSVG = `
    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
       <path
          d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
       />
     </svg>
   `;

    $item.textContent = text;

    $button.innerHTML = deleteSVG;
    $button.title = "Delete option";

    $item.appendChild($button);
    this.$list.appendChild($item);

    $button.addEventListener("click", () => this.deleteOption($item));
    this.draw();
  }

  deleteOption(element) {
    console.log(element);

    this.$list.removeChild(element);
    this.draw();
  }

  draw() {
    const context = $canvas.getContext("2d");

    for (let i = 0; i < this.options.length; i++) {
      const startAngle = this.currentAngle + i * this.sliceAngle;
      const endAngle = startAngle + this.sliceAngle;

      // Draw the slice
      context.beginPath();
      context.moveTo(this.$canvas.width / 2, this.$canvas.height / 2);
      context.arc(this.$canvas.width / 2, this.$canvas.height / 2, this.wheelRadius, startAngle, endAngle);
      context.closePath();

      // Alternate colors for the slices
      context.fillStyle = getColor(i);
      context.fill();

      // Draw the text
      context.save();
      context.translate(this.$canvas.width / 2, this.$canvas.height / 2);
      context.rotate((startAngle + endAngle) / 2);
      context.textAlign = "left";
      context.fillStyle = "#000";
      context.font = "500 26px rubik";
      context.fillText(this.options[i], this.wheelRadius / 2, 10);
      context.restore();
    }

    // Draw a small circle in the center of the wheel with a pointer.
    context.beginPath();
    context.arc(this.$canvas.width / 2, this.$canvas.height / 2, this.wheelRadius / 4, 0, 2 * Math.PI);
    context.fillStyle = "#000";
    context.fill();
  }

  spin() {
    // Prevent restarting the spin if already spinning
    if (this.isSpinning) return;

    this.isSpinning = true;
    // Set an initial spin speed
    this.spinSpeed = Math.random() * 0.1 + this.initialSpinSpeed;

    const spinLoop = () => {
      if (!this.isSpinning) return;

      this.currentAngle += this.spinSpeed;
      // Slow down gradually
      this.spinSpeed *= 0.99;

      // Stop the wheel if speed is very low
      if (this.spinSpeed < 0.001) {
        this.isSpinning = false;
        this.determineResult();
      }

      this.draw();
      requestAnimationFrame(spinLoop);
    };

    // Start the spin loop
    spinLoop();
  }

  determineResult() {
    const winningIndex = Math.floor(
      ((2 * Math.PI - (this.currentAngle % (2 * Math.PI))) / this.sliceAngle) % this.options.length
    );
    const winningOption = this.$list.children[winningIndex];

    // Create the dialog content if don't have children.
    if ($dialog.children.length === 0) {
      const $header = document.createElement("header");
      const $paragraph = document.createElement("p");
      const $heading = document.createElement("h1");

      $paragraph.textContent = "🥁 And the winner is...";

      $header.appendChild($paragraph);
      $header.appendChild($heading);

      const $footer = document.createElement("footer");
      const $deleteButton = document.createElement("button");
      const $closeButton = document.createElement("button");

      $deleteButton.classList.add("error");
      $closeButton.classList.add("done");

      $deleteButton.textContent = "Delete";
      $closeButton.textContent = "Close";

      $footer.appendChild($deleteButton);
      $footer.appendChild($closeButton);

      $closeButton.addEventListener("click", () => {
        this.$dialog.close();
      });

      this.$dialog.appendChild($header);
      this.$dialog.appendChild($footer);
    }

    const $deleteButton = $dialog.querySelector("button.error");
    const deleteOption = () => {
      this.deleteOption(winningOption);
      this.$dialog.close();
      $deleteButton.removeEventListener("click", deleteOption);
    };
    $deleteButton.addEventListener("click", deleteOption);

    // Get the heading element and display the winning option.
    const $heading = $dialog.querySelector("h1");
    $heading.textContent = `${wheel.options[winningIndex].trim()}!`;

    jsConfetti.addConfetti();
    this.$dialog.showModal();
  }
}

const wheel = new Wheel({ $list, $canvas, $dialog, wheelRadius: 300 });
wheel.draw();

// Create initial options.
Array.from({ length: 12 }).forEach((_, index) => {
  wheel.addOption(`Option ${index + 1}`);
});

$canvas.addEventListener("click", () => {
  // Spin the wheel when the canvas is clicked.
  wheel.spin();
});

$input.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    // Prevent default behavior.
    event.preventDefault();

    // Add new options with the input value and clear the input.
    wheel.addOption(event.currentTarget.value);
    event.currentTarget.value = "";
  }
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
