function startAudio() {
  audioCtx = new AudioContext();
  updateTime = -1e6;
  createSoundBank();
  loop();
  removeEventListener("mouseup", startAudio);
  removeEventListener("touchend", startAudio);
}

let touchedNutList = [];
let touchedNutListTmp = [];

function updateTouchedNutList(e) {
  touchedNutListTmp.length = 0;
  for (let t of e.touches) {
    const nutIdx = handlePercussionEvents(t.clientX, t.clientY);
    if (nutIdx !== undefined) touchedNutListTmp.push(nutIdx);
  }
  touchedNutList.length = 0;
  for (const v of touchedNutListTmp) touchedNutList.push(v);
}

function handlePercussionEvents(x, y) {
  for (const p of percussions) {
    if (!p.contains(x, y)) continue;
    if (!touchedNutList.includes(p.i)) p.strike();
    return p.i;
  }
}

let editMode = 0;
function handleButtonEvents(x, y) {
  if (configButton.contains(x, y)) {
    configButton.light();
    config();
  } else if (editButton.contains(x, y)) {
    editButton.light();
    editMode ^= 1;
  } else if (programButton.contains(x, y)) {
    programButton.light();
    changeProgram();
  }
}

let isResettingSlider = 0;
function handleSliderEvents(e, type = e.type) {
  if (!slider.isActive) {
    if (type != "touchstart") return;
    for (const t of e.changedTouches) {
      if (!slider.contains(t.clientX, t.clientY)) continue;
      slider.isActive = true;
      slider.touchId = t.identifier;
      slider.light();
    }
  } else if (type == "touchstart") {
    for (const t of e.changedTouches) {
      if (!slider.contains(t.clientX, t.clientY)) continue;
      if (t.identifier != slider.touchId) isResettingSlider = 1; // 2 fingers to reset
    }
  } else if (type == "touchmove") {
    for (const t of e.changedTouches)
      if (t.identifier == slider.touchId) slider.update(t.clientX), loop();
  } else {
    for (const t of e.changedTouches) {
      if (t.identifier != slider.touchId) continue;
      slider.isActive = false;
      if (isResettingSlider) {
        slider.update(width / 2);
        isResettingSlider = 0;
        slider.light();
      } else loop();
    }
  }
}

// touch
function touchStarted(e) {
  e.preventDefault();
  updateTouchedNutList(e);
  handleSliderEvents(e);
  for (const t of e.changedTouches) handleButtonEvents(t.clientX, t.clientY);
}

function touchMoved(e) {
  updateTouchedNutList(e);
  handleSliderEvents(e);
}

function touchEnded(e) {
  updateTouchedNutList(e);
  handleSliderEvents(e);
}

// mouse
const touchMimic = () => ({
  clientX: mouseX,
  clientY: mouseY,
  identifier: -1,
});

function mousePressed(e) {
  e.preventDefault();
  e.touches = e.changedTouches = [touchMimic()];

  updateTouchedNutList(e);
  handleButtonEvents(mouseX, mouseY);
  handleSliderEvents(e, "touchstart");
}

function mouseDragged(e) {
  e.touches = e.changedTouches = [touchMimic()];

  updateTouchedNutList(e);
  handleSliderEvents(e, "touchmove");
}

function mouseReleased(e) {
  e.touches = [];
  e.changedTouches = [touchMimic()];

  updateTouchedNutList(e);
  handleSliderEvents(e);
}

function mouseMoved(e) {}

function doubleClicked(e) {
  if (slider.contains(mouseX, mouseY)) slider.update(width / 2), loop();
}
