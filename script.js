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

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) audioCtx = new AudioContextClass();
  return audioCtx;
}

function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx) {
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    try {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.025);
    } catch (e) {}
  }
  audioUnlocked = true;
}

function keepAudioAlive() {
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
}

["pointerdown", "touchstart", "mousedown", "keydown", "click"].forEach(type => {
  document.addEventListener(type, () => {
    unlockAudio();
    keepAudioAlive();
  }, { passive: true });
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) keepAudioAlive();
});

function tone(freq, start, duration, type = "sine", gainValue = 0.18) {
  const ctx = getAudioContext();
  if (!ctx) return;
  keepAudioAlive();
  const now = ctx.currentTime;
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
}

function speak(text) {
  if (!window.speechSynthesis || !text) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ja-JP";
    utter.rate = 0.86;
    utter.pitch = 1.55;
    utter.volume = 1;
    window.speechSynthesis.speak(utter);
  } catch (e) {}
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
