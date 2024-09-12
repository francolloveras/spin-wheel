const $canvas = document.querySelector("canvas");
const $list = document.querySelector("ul");
const $input = document.querySelector("input");

class Wheel {
  constructor({ $list, $canvas, wheelRadius, initialSpinSpeed = 1 }) {
    this.$list = $list;
    this.$canvas = $canvas;
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
    this.$list.removeChild(element);
    this.draw();
  }

  draw() {
    for (let i = 0; i < this.options.length; i++) {
      const context = $canvas.getContext("2d");
      const startAngle = this.currentAngle + i * this.sliceAngle;
      const endAngle = startAngle + this.sliceAngle;

      // Draw the slice
      context.beginPath();
      context.moveTo(this.$canvas.width / 2, this.$canvas.height / 2);
      context.arc(this.$canvas.width / 2, this.$canvas.height / 2, this.wheelRadius, startAngle, endAngle);
      context.closePath();

      // Alternate colors for the slices
      context.fillStyle = i % 2 === 0 ? "#FFDD57" : "#FF8C42";
      context.fill();

      // Draw the text
      context.save();
      context.translate(this.$canvas.width / 2, this.$canvas.height / 2);
      context.rotate((startAngle + endAngle) / 2);
      context.textAlign = "center";
      context.fillStyle = "#000";
      context.font = "18px Arial";
      context.fillText(this.options[i], this.wheelRadius / 2, 10);
      context.restore();
    }
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
      ((2 * Math.PI - (this.currentAngle % (2 * Math.PI))) / wheel.sliceAngle) % wheel.options.length
    );
    alert(`Result: ${wheel.options[winningIndex]}`);
  }
}

const wheel = new Wheel({ $list, $canvas, wheelRadius: 300 });
wheel.draw();

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
