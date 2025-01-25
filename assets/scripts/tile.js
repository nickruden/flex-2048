export class Tile {
    constructor(gridElement, value = getRandomValue()) {
        this.tileElement = document.createElement("div");
        this.tileElement.classList.add("tile");
        gridElement.append(this.tileElement);

        this.setValue(value);
    }

    setValue(value) {
        this.value = value;
        this.tileElement.textContent = value;
        this.tileElement.setAttribute("data-value", value);
    }
  
    setX(x) {
      this.x = x;
      this.tileElement.style.setProperty("--x", x);
    }
  
    setY(y) {
      this.y = y;
      this.tileElement.style.setProperty("--y", y);
    }
  
    removeFromDOM() {
      this.tileElement.remove();
    }
  
    waitForTransitionEnd() {
      return new Promise(resolve => {
        this.tileElement.addEventListener(
          "transitionend", resolve, { once: true });
      });
    }
  
    waitForAnimationEnd() {
      return new Promise(resolve => {
        this.tileElement.addEventListener(
          "animationend", resolve, { once: true });
      });
    }
  }
  
  function getRandomValue() {
    return Math.random() > 0.2 ? 2 : 4;
  };