const layout = {
  cols: 5,
  rows: 3,
  update(t, c, r) {
    updateTime = t;
    this.cols = c;
    this.rows = r;
  },
};

const { SQRT1_2, log2 } = Math;
function drawBackground(left, right) {
  const cellSize = max(0.01, (right - left) / 12);
  const offset = width * cellSize * (1 - ((left / cellSize) % 1));
  const num = 1 / cellSize;
  const w = width * cellSize;
  const h = height * cellSize;
  rectMode(CORNER);
  blendMode(BLEND);
  noStroke();
  const fillPos = (x, y, mx = max(0, x)) =>
    fill(
      0x99 * (0 + mx / width) ** 0.5,
      0x99 * (1 - mx / width) ** 0.5,
      0x66 * (1 - y / height)
    );
  for (let x = 0; x < num + 1; x++) {
    const px = w * x - offset;
    fillPos(px, 0);
    rect(px, 0, w + 1, height / 2 + 1);
  }
  const posOvertone = (i) => left + (log2(i) - log2(8)) * (right - left);
  for (let i = 1; i < 17; i++) {
    const x = i == +1 ? 0 : posOvertone(i);
    const w = i == 16 ? width : posOvertone(i + 1) - x;
    if (x < 0 && x + w < 0) continue;
    const px = x * width;
    fillPos(px, height / 2);
    rect(px, height / 2, w * width + 1, height / 2);
  }
  bgImage = get();
}

function resetPercussionPos() {
  const { cols, rows } = layout;
  const w = 0.75;
  const diaW = (aspect * w) / cols;
  const diaH = w / rows;
  const dia = min(11 < cols ? aspect / cols : diaW, diaH);
  const leftmostNutX = (1 - (dia / aspect) * (cols - 1)) / 2;
  const octFromLeftNutX = leftmostNutX + cols * (dia / aspect);
  const bottom = (1 - dia * (rows - 1)) / 2;
  for (const p of percussions) {
    const c = p.i % cols;
    const r = floor(p.i / cols);
    p.nx = leftmostNutX + c * (dia / aspect);
    p.ny = bottom + dia * r;
    p.nr = dia / 2;
  }
  drawBackground(leftmostNutX, octFromLeftNutX);

  const x = (i) => [(0.08 + 0.13 * i) / aspect];
  const y = 0.92;
  configButton.setPos(x(0), y);
  editButton.setPos(x(1), y);
  programButton.setPos(x(2), y);
  updateTime = getTime();
  loop();
}

function resetPercussions() {
  const { cols, rows } = layout;
  const length = cols * rows;
  const pLength = percussions.length;
  if (length < pLength) percussions.length = length;
  else {
    for (let i = pLength; i < length; i++) {
      const options = { i, x: 0.5, y: 0.1, r: 0 };
      percussions[i] = new Percussion(options);
    }
  }
  for (const p of percussions) p.isMuted = 0;
  for (const p of percussions) p.isOutlined = 0;
  resetPercussionPos();
  createSoundBank();
}
