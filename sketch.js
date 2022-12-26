const animTime = 1.0;
const fps = 30;

const percussions = [];
let aspect, updateTime, bgImage;

const getTime = () => (audioCtx ? audioCtx.currentTime : millis() / 1000);

function getCanvasSize() {
  const h = min(windowHeight, windowWidth);
  const w = windowWidth;
  aspect = w / h;
  return [w, h];
}

function config() {
  let cols = parseInt(prompt("cols?", 7));
  if (!cols) return;
  let rows = parseInt(prompt("rows?", 3));
  if (!rows) return;
  rows = constrain(rows, 1, min(floor(255 / cols), 9));
  layout.update(getTime(), cols, rows);
  resetPercussions();
}

let configButton, editButton, programButton, slider, guis;
function setup() {
  createCanvas(...getCanvasSize());
  textFont("monospace");
  frameRate(fps);

  configButton = new Button({ txt: "⚙️", r: 0.05 });
  editButton = new Button({ txt: "✍", r: 0.05 });
  programButton = new Button({ txt: "🎹", r: 0.05 });
  slider = new Slider(0.5, 0.05, 1, 0.1);
  guis = [configButton, editButton, programButton, slider];

  resetPercussions();

  addEventListener("mouseup", startAudio);
  addEventListener("touchend", startAudio);
}

function windowResized() {
  resizeCanvas(...getCanvasSize());
  resetPercussionPos();
}

function draw() {
  const t = getTime();
  const isPausing = updateTime + animTime < t;
  if (isPausing) noLoop();
  if (editMode) editButton.light();

  for (const p of percussions) p.updatePos(isPausing);

  blendMode(BLEND);
  image(bgImage, 0, 0, width, height);

  blendMode(HARD_LIGHT);
  for (const p of percussions) p.show(isPausing);
  for (const e of guis) e.show(isPausing);

  blendMode(BLEND);
  const obj = {
    tuning: layout.cols + "-TET",
    instrument: programIdx,
    zero: (currentProgram.f0 * 2 ** detuneOct).toFixed(1) + "Hz",
    // sampleRate: audioCtx ? 1e-3 * audioCtx.sampleRate + "kHz" : 0,
    // baseLatency: audioCtx ? (audioCtx.baseLatency * 1e3).toFixed(3) + "ms" : 0,
    // t: isPausing ? "noLoop" : t.toFixed(3),
    // frameCount,
  };
  textSize(12).textAlign(RIGHT, TOP);
  noStroke();
  text(JSON.stringify(obj, 0, 1).replace(/[{}\",]/g, ""), width - 12, 0);
}
