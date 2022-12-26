const banks = [];
const voices = [];
let currentBank;
let audioCtx;
let maxVoices = 8;
let voiceCount = 0;

const programs = [];
programs[0] = { fs: 12e3, f0: 200, fm: 2, a: 0.01, d: 0.5 };
programs[1] = { fs: 24e3, f0: 400, fm: 3.14, a: 0.01, d: 1.0 };
programs[2] = { fs: 12e3, f0: 200, fm: 1, a: 0.1, h: 0.3, d: 0.2, vb: 7 };

let programIdx = 0;
let currentProgram = programs[programIdx];

function changeProgram() {
  programIdx = ++programIdx % programs.length;
  currentProgram = programs[programIdx];
  maxVoices = currentProgram.h ? 4 : 8;
  createSoundBank();
}

function render(idx, cols, { fs, f0, fm, a, h = 0, d, vb }) {
  const { sin, exp, min } = Math;
  const fc = f0 * 2 ** (idx / cols);
  const dur = a + h + d;
  const amp = 0.2;
  const amp0 = min(1, 400 / fc);
  const amp1 = 100 / fc / fm;
  const delay = floor(0.03 * fs);

  currentBank[idx] = audioCtx.createBuffer(1, fs * dur, fs);
  const buff = currentBank[idx].getChannelData(0);

  for (let i = 0, t = 0; t < dur; t = ++i / fs) {
    const p = TAU * fc * t + (vb ? sin(TAU * vb * t) : 0);
    const mod1 = 2.0 * amp1 * exp(-150 * t) * sin(3.1415926 * p);
    const mod0 = 1.0 * amp1 * exp(-15 * +t) * sin(fm * p + mod1);
    const car0 = amp * amp0 * sin(p + mod0);
    const envelope = min(t / a, 1, ((dur - t) / d) ** 2);
    buff[i] = envelope * (car0 + 0.35 * buff.at(i - delay));
  }
}

function createSoundBank() {
  if (!audioCtx) return;

  const { cols, rows } = layout;

  if (!banks[cols]) banks[cols] = [];
  if (!banks[cols][programIdx]) banks[cols][programIdx] = [];

  currentBank = banks[cols][programIdx];

  if (cols * rows < currentBank.length) return;

  for (let i = currentBank.length; i < cols * rows; i++) {
    render(i, cols, currentProgram);
  }
}

let detuneOct = 0;
const sliderCallback = (v) => (detuneOct = 1.0 * v);

function playSound(idx = 0) {
  if (!audioCtx) return;

  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();

  const t = audioCtx.currentTime;
  const voiceIdx = voiceCount++ % maxVoices;
  const v = voices[voiceIdx];
  if (v) {
    v.gain.gain.exponentialRampToValueAtTime(1e-5, t + 0.05);
    v.source.stop(t + 0.05);
    v.source = source;
    v.gain = gain;
  } else voices[voiceIdx] = { source, gain };

  source.detune.value = 1200 * detuneOct;
  source.buffer = currentBank[idx];
  source.connect(gain).connect(audioCtx.destination);
  source.start();

  percussions[idx].light();
}
