class Gui {
  col0 = color("#333");
  col1 = color("#c00");
  colDisabled = color("#999");
  colRatio = 0;
  colVel = exp(-3 / fps / animTime);
  isOutlined = 1;
  isMuted = 0;
  setPos = (x, y) => ((this.x = x), (this.y = y));
  setColor(isPausing) {
    if (this.isMuted) fill(this.colDisabled);
    else {
      const v = isPausing ? 0 : this.colVel;
      fill(lerpColor(this.col0, this.col1, this.colRatio));
      this.colRatio = lerp(0, this.colRatio, v);
    }
    if (this.isOutlined) stroke(255);
    else noStroke();
  }
  light() {
    this.colRatio = 1;
    updateTime = getTime();
    loop();
  }
}

class Button extends Gui {
  constructor({ txt, i, x, y, r }) {
    super();
    [this.i, this.x, this.y, this.r] = [i, x, y, r];
    this.txt = txt || (!isNaN(parseInt(i)) ? i.toString() : void 0);
  }
  show(isPausing) {
    const x = width * this.x;
    const y = height * (1 - this.y);
    const r = height * this.r;
    this.setColor(isPausing);
    circle(x, y, 2 * r);
    textSize(max(12, round(r))).textAlign(CENTER, CENTER);
    if (this.txt) fill(255).text(this.txt, x, y);
  }
  contains(ix, iy) {
    const x = width * this.x;
    const y = height * (1 - this.y);
    const r = height * this.r;
    return dist(ix, iy, x, y) < r;
  }
}

class Percussion extends Button {
  nx;
  ny;
  nr;
  posVel = exp(-7 / fps / animTime);
  constructor(settings) {
    super(settings);
    this.isOutlined = 0;
  }
  updatePos(isPausing) {
    const v = isPausing ? 0 : this.posVel;
    this.x = lerp(this.nx, this.x, v);
    this.y = lerp(this.ny, this.y, v);
    this.r = lerp(this.nr, this.r, v);
  }
  strike() {
    if (editMode == 0) {
      if (!this.isMuted) playSound(this.i);
    } else {
      if (this.isOutlined) [this.isOutlined, this.isMuted] = [0, 1];
      else if (this.isMuted) this.isMuted = 0;
      else this.isOutlined = 1;
    }
  }
}

class Rectangle extends Gui {
  constructor(x, y, w, h) {
    super();
    [this.x, this.y, this.w, this.h] = [x, y, w, h];
  }
  contains(px, py) {
    const x = width * this.x;
    const w = width * this.w;
    if (px < x - w / 2) return;
    if (px > x + w / 2) return;
    const y = height * (1 - this.y);
    const h = height * this.h;
    if (py < y - h / 2) return;
    if (py > y + h / 2) return;
    return 1;
  }
  showRect(isPausing) {
    const x = width * this.x;
    const y = height * (1 - this.y);
    const w = width * this.w;
    const h = height * this.h;
    this.setColor(isPausing);
    rectMode(CENTER);
    rect(x, y, w, h);
  }
}

class Slider extends Rectangle {
  value = 0;
  isActive = 0;
  touchId = -1;
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.circle = new Button({ x, y, r: h / 3 });
    this.circle.col0 = color(255);
    this.callback = sliderCallback;
  }
  update(px) {
    const x = width * this.x;
    const w = width * this.w;
    const v = map(px, x - w / 2, x + w / 2, -1, +1);
    this.value = constrain(v, -1, +1);
    this.circle.x = this.x + this.value * (this.w / 2);
    this.callback(this.value);
  }
  show(isPausing) {
    this.showRect(isPausing);
    line(width * this.x, height * (1 - this.h), width * this.x, height);
    this.circle.show();
  }
}
