const questions = [
  { animal:"ライオン", face:"", answer:"おにく", food:"", choices:["おにく","バナナ"] },
  { animal:"うさぎ", face:"", answer:"にんじん", food:"", choices:["にんじん","さかな"] },
  { animal:"ねこ", face:"", answer:"さかな", food:"", choices:["バナナ","さかな"] },
  { animal:"いぬ", face:"", answer:"ほね", food:"", choices:["ほね","はっぱ"] },
  { animal:"さる", face:"", answer:"バナナ", food:"", choices:["バナナ","おにく"] },
  { animal:"パンダ", face:"", answer:"たけ", food:"", choices:["たけ","チーズ"] },
  { animal:"ぞう", face:"", answer:"りんご", food:"", choices:["りんご","さかな"] },
  { animal:"きょうりゅう", face:"", answer:"おにく", food:"", choices:["おにく","にんじん"] },
  { animal:"ひよこ", face:"", answer:"まめ", food:"", choices:["まめ","ほね"] },
  { animal:"こあら", face:"", answer:"はっぱ", food:"", choices:["はっぱ","さかな"] },
  { animal:"ぶた", face:"", answer:"りんご", food:"", choices:["りんご","たけ"] },
  { animal:"かえる", face:"", answer:"むし", food:"", choices:["むし","バナナ"] },
  { animal:"ぺんぎん", face:"", answer:"さかな", food:"", choices:["さかな","にんじん"] },
  { animal:"りす", face:"", answer:"どんぐり", food:"", choices:["どんぐり","おにく"] },
  { animal:"うし", face:"", answer:"くさ", food:"", choices:["くさ","さかな"] },
  { animal:"うま", face:"", answer:"にんじん", food:"", choices:["にんじん","むし"] },
  { animal:"くま", face:"", answer:"はちみつ", food:"", choices:["はちみつ","たけ"] },
  { animal:"にわとり", face:"", answer:"まめ", food:"", choices:["まめ","ほね"] },
  { animal:"きりん", face:"", answer:"はっぱ", food:"", choices:["はっぱ","さかな"] },
  { animal:"とら", face:"", answer:"おにく", food:"", choices:["おにく","バナナ"] }
];

const comboWords = {
  2: "いいね！✨",
  3: "すごい！",
  4: "ナイス！",
  5: "天才！",
  6: "やばい！⚡",
  7: "プロ！",
  8: "レジェンド！",
  9: "バケモン！",
  10: "神！！！✨"
};

let index = 0;
let score = 0;
let combo = 0;
let locked = false;
let audioCtx = null;
let audioUnlocked = false;
let started = false;

const game = document.getElementById("game");
const animal = document.getElementById("animal");
const qAnimal = document.getElementById("qAnimal");
const message = document.getElementById("message");
const comboMessage = document.getElementById("comboMessage");
const choices = document.getElementById("choices");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const foodFly = document.getElementById("foodFly");
const eatText = document.getElementById("eatText");
const sparkles = document.getElementById("sparkles");
const nextBtn = document.getElementById("nextBtn");
const final = document.getElementById("final");
const continueBtn = document.getElementById("continueBtn");
const startBtn = document.getElementById("startBtn") || document.querySelector(".startBtn, .start button, button");
const startScreen = document.getElementById("start") || document.getElementById("startScreen") || document.querySelector(".start, .startScreen, .intro");

const htmlSoundCache = {};
let audioUnlockedAt = 0;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) audioCtx = new AudioContextClass();
  return audioCtx;
}

function makeWavDataUrl(freq = 880, duration = 0.18, volume = 0.28) {
  const sampleRate = 22050;
  const length = Math.max(1, Math.floor(sampleRate * duration));
  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);
  function writeString(offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const fade = Math.min(1, i / 400, (length - i) / 900);
    const sample = Math.sin(2 * Math.PI * freq * t) * volume * fade;
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * 32767, true);
  }
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(binary);
}

function getHtmlSound(name, freq, duration, volume) {
  if (!htmlSoundCache[name]) {
    const a = new Audio(makeWavDataUrl(freq, duration, volume));
    a.preload = 'auto';
    a.playsInline = true;
    htmlSoundCache[name] = a;
  }
  return htmlSoundCache[name];
}

function playHtmlSound(name, freq, duration = 0.18, volume = 0.28, delay = 0) {
  setTimeout(() => {
    try {
      const base = getHtmlSound(name, freq, duration, volume);
      const a = base.cloneNode(true);
      a.volume = Math.max(0, Math.min(1, volume * 3));
      a.currentTime = 0;
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }, delay);
}

function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    try {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.03);
    } catch (e) {}
  }
  try {
    const a = getHtmlSound('unlock', 1000, 0.05, 0.01);
    a.currentTime = 0;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
  try {
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
      const u = new SpeechSynthesisUtterance(' ');
      u.lang = 'ja-JP';
      u.volume = 0.01;
      speechSynthesis.speak(u);
    }
  } catch (e) {}
  audioUnlocked = true;
  audioUnlockedAt = Date.now();
}

function keepAudioAlive() {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
}

['pointerdown', 'touchstart', 'mousedown', 'keydown', 'click'].forEach(type => {
  document.addEventListener(type, () => {
    unlockAudio();
    keepAudioAlive();
  }, { passive: true });
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) keepAudioAlive();
});

function tone(freq, start, duration, type = 'sine', gainValue = 0.18) {
  playHtmlSound('html_' + freq + '_' + Math.round(duration * 100), freq, duration, gainValue, start * 1000);
  const ctx = getAudioContext();
  if (!ctx) return;
  keepAudioAlive();
  const now = ctx.currentTime;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + start);
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + duration + 0.04);
  } catch (e) {}
}

function pickJapaneseVoice() {
  try {
    const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    return voices.find(v => /ja|japan|kyoko|otoya/i.test((v.lang || '') + ' ' + (v.name || ''))) || null;
  } catch (e) { return null; }
}

function speak(text) {
  if (!text) return;
  if (text.includes('どっち') || text.includes('すご')) playHtmlSound('voice_notice', 1175, 0.12, 0.22, 0);
  if (!window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ja-JP';
    utter.rate = 0.82;
    utter.pitch = 1.45;
    utter.volume = 1;
    const v = pickJapaneseVoice();
    if (v) utter.voice = v;
    setTimeout(() => { try { window.speechSynthesis.speak(utter); } catch (e) {} }, 60);
  } catch (e) {}
}

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => { try { speechSynthesis.getVoices(); } catch(e) {} };
}

function correctSound(level) {
  unlockAudio();
  tone(660, 0, .16, "triangle", .24);
  tone(880, .10, .18, "triangle", .25);
  tone(1320, .22, .22, "sine", .20);
  if (level >= 3) {
    tone(1560, .33, .18, "sine", .15);
    tone(1760, .42, .18, "sine", .13);
  }
  if (level >= 5) {
    tone(440, 0, .12, "square", .10);
    tone(990, .05, .25, "triangle", .16);
  }
}

function wrongSound() {
  unlockAudio();
  tone(240, 0, .16, "sawtooth", .09);
  tone(180, .12, .18, "sawtooth", .07);
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function currentQuestion() {
  return questions[index % questions.length];
}

function renderQuestion() {
  locked = false;
  const q = currentQuestion();
  if (animal) animal.textContent = q.face;
  if (qAnimal) qAnimal.textContent = `${q.animal} の`;
  if (message) message.textContent = "えらんでね";
  if (comboMessage) {
    comboMessage.textContent = "";
    comboMessage.classList.remove("show");
  }
  if (foodFly) foodFly.textContent = q.food;
  if (choices) {
    choices.innerHTML = "";
    shuffle(q.choices).forEach(choice => {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.type = "button";
      btn.textContent = `${choiceEmoji(choice)}${choice}`;
      btn.addEventListener("pointerdown", unlockAudio);
      btn.addEventListener("touchstart", unlockAudio, { passive: true });
      btn.addEventListener("click", () => choose(choice, btn));
      choices.appendChild(btn);
    });
  }
  if (started) setTimeout(() => speak("どっちが好き？"), 120);
}

function choiceEmoji(word) {
  const map = {
    "おにく":"", "にんじん":"", "さかな":"", "ほね":"", "バナナ":"",
    "たけ":"", "りんご":"", "まめ":"", "はっぱ":"", "むし":"",
    "どんぐり":"", "くさ":"", "はちみつ":"", "チーズ":""
  };
  return map[word] || "";
}

function resetAnim(el, className) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

function choose(choice, btn) {
  unlockAudio();
  keepAudioAlive();
  if (locked) return;
  locked = true;
  const q = currentQuestion();

  if (choice === q.answer) {
    score++;
    combo++;
    if (scoreEl) scoreEl.textContent = score;
    if (comboEl) comboEl.textContent = `コンボ ${combo}`;
    const level = Math.min(combo, 10);
    correctSound(level);
    if (message) message.textContent = "やったー！";
    if (btn) btn.classList.add("correctFlash");
    if (game) game.classList.add("flash");
    resetAnim(animal, level >= 5 ? "superJump" : "jump");
    resetAnim(foodFly, level >= 5 ? "megaFly" : "fly");
    resetAnim(eatText, "show");
    resetAnim(sparkles, "show");

    if (comboMessage && comboWords[level]) {
      comboMessage.textContent = comboWords[level];
      resetAnim(comboMessage, "show");
    }

    setTimeout(() => { if (game) game.classList.remove("flash"); }, 420);

    if (combo >= 10) {
      setTimeout(() => {
        speak("すごーい。10問できたね。");
        if (final) final.classList.add("show");
      }, 620);
      return;
    }

    setTimeout(nextQuestion, 950);
  } else {
    combo = 0;
    if (comboEl) comboEl.textContent = "コンボ 0";
    if (message) message.textContent = "もういっかい！";
    wrongSound();
    if (btn) btn.classList.add("wrongShake");
    if (animal) animal.classList.add("jump");
    setTimeout(() => {
      if (btn) btn.classList.remove("wrongShake");
      if (animal) animal.classList.remove("jump");
      locked = false;
    }, 520);
  }
}

function nextQuestion() {
  index++;
  renderQuestion();
}

function startGame() {
  unlockAudio();
  keepAudioAlive();
  started = true;
  if (startScreen) startScreen.style.display = "none";
  tone(880, 0, .16, "triangle", .28);
  tone(1175, .14, .16, "triangle", .24);
  speak("どっちかなぁ？");
  setTimeout(() => speak("どっちが好き？"), 900);
}

if (nextBtn) {
  nextBtn.addEventListener("pointerdown", unlockAudio);
  nextBtn.addEventListener("click", nextQuestion);
}

if (continueBtn) {
  continueBtn.addEventListener("pointerdown", unlockAudio);
  continueBtn.addEventListener("click", () => {
    unlockAudio();
    if (final) final.classList.remove("show");
    combo = 0;
    if (comboEl) comboEl.textContent = "コンボ 0";
    nextQuestion();
  });
}

if (startBtn) {
  startBtn.addEventListener("pointerdown", unlockAudio);
  startBtn.addEventListener("touchstart", unlockAudio, { passive: true });
  startBtn.addEventListener("click", startGame);
} else {
  started = true;
}

renderQuestion();
