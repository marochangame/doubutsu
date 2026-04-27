const questions = [
  { animal:"ライオン", face:"🦁", answer:"おにく", food:"🍖", choices:["おにく","にんじん"] },
  { animal:"うさぎ", face:"🐰", answer:"にんじん", food:"🥕", choices:["にんじん","さかな"] },
  { animal:"ねこ", face:"🐱", answer:"さかな", food:"🐟", choices:["バナナ","さかな"] },
  { animal:"いぬ", face:"🐶", answer:"ほね", food:"🦴", choices:["ほね","はっぱ"] },
  { animal:"さる", face:"🐵", answer:"バナナ", food:"🍌", choices:["バナナ","おにく"] },
  { animal:"パンダ", face:"🐼", answer:"たけ", food:"🎋", choices:["たけ","チーズ"] },
  { animal:"ぞう", face:"🐘", answer:"りんご", food:"🍎", choices:["りんご","さかな"] },
  { animal:"きょうりゅう", face:"🦖", answer:"おにく", food:"🍖", choices:["おにく","にんじん"] },
  { animal:"ひよこ", face:"🐥", answer:"まめ", food:"🫘", choices:["まめ","ほね"] },
  { animal:"こあら", face:"🐨", answer:"はっぱ", food:"🌿", choices:["はっぱ","さかな"] },
  { animal:"ぶた", face:"🐷", answer:"りんご", food:"🍎", choices:["りんご","たけ"] },
  { animal:"かえる", face:"🐸", answer:"むし", food:"🪲", choices:["むし","バナナ"] },
  { animal:"ぺんぎん", face:"🐧", answer:"さかな", food:"🐟", choices:["さかな","にんじん"] },
  { animal:"りす", face:"🐿️", answer:"どんぐり", food:"🌰", choices:["どんぐり","おにく"] },
  { animal:"うし", face:"🐮", answer:"くさ", food:"🌱", choices:["くさ","さかな"] },
  { animal:"うま", face:"🐴", answer:"にんじん", food:"🥕", choices:["にんじん","むし"] },
  { animal:"くま", face:"🐻", answer:"はちみつ", food:"🍯", choices:["はちみつ","たけ"] },
  { animal:"にわとり", face:"🐔", answer:"まめ", food:"🫘", choices:["まめ","ほね"] },
  { animal:"きりん", face:"🦒", answer:"はっぱ", food:"🌿", choices:["はっぱ","さかな"] },
  { animal:"とら", face:"🐯", answer:"おにく", food:"🍖", choices:["おにく","バナナ"] }
];

const comboWords = {
  2: "いいね！✨",
  3: "すごい！🔥",
  4: "ナイス！🎯",
  5: "天才！👑",
  6: "やばい！⚡",
  7: "プロ！🎮",
  8: "レジェンド！🌟",
  9: "バケモン！💥",
  10: "神！！！👑✨"
};

let index = 0;
let score = 0;
let combo = 0;
let locked = false;

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

let audioCtx;

function audio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone(freq, start, duration, type="sine", gain=.18) {
  const ctx = audio();
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  vol.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  vol.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  vol.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(vol);
  vol.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.03);
}

function correctSound(level) {
  tone(660, 0, .16, "triangle", .18);
  tone(880, .10, .18, "triangle", .20);
  tone(1320, .22, .22, "sine", .16);
  if (level >= 3) {
    tone(1560, .33, .18, "sine", .12);
    tone(1760, .42, .18, "sine", .10);
  }
  if (level >= 5) {
    tone(440, 0, .12, "square", .08);
    tone(990, .05, .25, "triangle", .13);
  }
}

function wrongSound() {
  tone(240, 0, .16, "sawtooth", .08);
  tone(180, .12, .18, "sawtooth", .06);
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
  animal.textContent = q.face;
  qAnimal.textContent = `${q.animal}の`;
  message.textContent = "えらんでね";
  comboMessage.textContent = "";
  comboMessage.classList.remove("show");
  foodFly.textContent = q.food;
  choices.innerHTML = "";

  shuffle(q.choices).forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.type = "button";
    btn.innerHTML = `<span class="emoji">${choice === q.answer ? q.food : choiceEmoji(choice)}</span>${choice}`;
    btn.addEventListener("click", () => choose(choice, btn));
    choices.appendChild(btn);
  });
}

function choiceEmoji(word) {
  const map = {
    "おにく":"🍖","にんじん":"🥕","さかな":"🐟","ほね":"🦴","バナナ":"🍌",
    "たけ":"🎋","りんご":"🍎","まめ":"🫘","はっぱ":"🌿","むし":"🪲",
    "どんぐり":"🌰","くさ":"🌱","はちみつ":"🍯","チーズ":"🧀"
  };
  return map[word] || "🍽️";
}

function resetAnim(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

function choose(choice, btn) {
  if (locked) return;
  locked = true;

  const q = currentQuestion();
  if (choice === q.answer) {
    score++;
    combo++;
    scoreEl.textContent = score;
    comboEl.textContent = `コンボ ${combo}`;

    const level = Math.min(combo, 10);
    correctSound(level);

    message.textContent = "やったー！";
    btn.classList.add("correctFlash");
    game.classList.add("flash");

    resetAnim(animal, level >= 5 ? "superJump" : "jump");
    resetAnim(foodFly, level >= 5 ? "megaFly" : "fly");
    resetAnim(eatText, "show");
    resetAnim(sparkles, "show");

    if (comboWords[level]) {
      comboMessage.textContent = comboWords[level];
      resetAnim(comboMessage, "show");
    }

    setTimeout(() => game.classList.remove("flash"), 420);

    if (combo >= 10) {
      setTimeout(() => {
        final.classList.add("show");
      }, 620);
      return;
    }

    setTimeout(nextQuestion, 950);
  } else {
    combo = 0;
    comboEl.textContent = "コンボ 0";
    message.textContent = "もういっかい！";
    wrongSound();
    btn.classList.add("wrongShake");
    animal.classList.add("jump");
    setTimeout(() => {
      btn.classList.remove("wrongShake");
      animal.classList.remove("jump");
      locked = false;
    }, 520);
  }
}

function nextQuestion() {
  index++;
  renderQuestion();
}

nextBtn.addEventListener("click", nextQuestion);
continueBtn.addEventListener("click", () => {
  final.classList.remove("show");
  combo = 0;
  comboEl.textContent = "コンボ 0";
  nextQuestion();
});

renderQuestion();
