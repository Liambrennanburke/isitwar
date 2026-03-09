const ROUNDS_PER_GAME = 10;

let state = {
  currentRound: 0,
  score: 0,
  conflicts: [],
  history: [],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}

function buildDeck() {
  const wars = shuffle(CONFLICTS.filter((c) => c.isWar)).slice(0, 3);
  const notWars = shuffle(CONFLICTS.filter((c) => !c.isWar)).slice(0, 7);
  return shuffle([...wars, ...notWars]);
}

function startGame() {
  state = {
    currentRound: 0,
    score: 0,
    conflicts: buildDeck(),
    history: [],
  };

  showScreen("screen-game");
  renderRound();
}

function renderRound() {
  const c = state.conflicts[state.currentRound];

  document.getElementById("round-indicator").textContent =
    `${state.currentRound + 1} / ${ROUNDS_PER_GAME}`;
  document.getElementById("score-display").textContent = state.score;
  document.getElementById("progress-bar").style.width =
    `${(state.currentRound / ROUNDS_PER_GAME) * 100}%`;

  const imgWrap = document.getElementById("conflict-image-wrap");
  const img = document.getElementById("conflict-image");
  if (c.image) {
    img.src = c.image;
    img.alt = c.name;
    imgWrap.classList.remove("hidden");
  } else {
    imgWrap.classList.add("hidden");
    img.src = "";
  }

  document.getElementById("conflict-name").textContent = c.name;
  document.getElementById("years-text").textContent = c.years;
  document.getElementById("president-text").textContent = c.president;
  document.getElementById("casualties-text").textContent = c.casualties;
  document.getElementById("troops-text").textContent = c.troopsDeployed;
  document.getElementById("region-text").textContent = c.region;
  document.getElementById("conflict-description").textContent = c.description;

  document.getElementById("choice-section").style.display = "";
  document.getElementById("result-section").classList.add("hidden");

  document.getElementById("btn-war").disabled = false;
  document.getElementById("btn-not-war").disabled = false;
  document.getElementById("btn-war").classList.remove("shake", "pulse");
  document.getElementById("btn-not-war").classList.remove("shake", "pulse");

  const card = document.getElementById("conflict-card");
  card.style.animation = "none";
  card.offsetHeight;
  card.style.animation = "";

  document.getElementById("btn-next").textContent =
    state.currentRound + 1 === ROUNDS_PER_GAME ? "See Results" : "Continue";
}

function handleGuess(guessedWar) {
  if (document.getElementById("btn-war").disabled) return;

  const conflict = state.conflicts[state.currentRound];
  const isCorrect = guessedWar === conflict.isWar;

  document.getElementById("btn-war").disabled = true;
  document.getElementById("btn-not-war").disabled = true;

  if (isCorrect) {
    state.score++;
    document.getElementById("score-display").textContent = state.score;
    (guessedWar
      ? document.getElementById("btn-war")
      : document.getElementById("btn-not-war")
    ).classList.add("pulse");
  } else {
    (guessedWar
      ? document.getElementById("btn-war")
      : document.getElementById("btn-not-war")
    ).classList.add("shake");
  }

  state.history.push({
    conflict: conflict.name,
    guessedWar,
    isWar: conflict.isWar,
    correct: isCorrect,
  });

  setTimeout(() => showResult(conflict, isCorrect), 350);
}

function showResult(conflict, isCorrect) {
  document.getElementById("choice-section").style.display = "none";
  document.getElementById("result-section").classList.remove("hidden");

  const banner = document.getElementById("result-banner");
  banner.className = `result-banner ${isCorrect ? "correct" : "incorrect"}`;

  document.getElementById("result-verdict").textContent = isCorrect
    ? "Correct"
    : "Wrong";

  document.getElementById("result-correct").textContent = conflict.isWar
    ? "This was officially a declared war."
    : "This was not officially a declared war.";

  const badge = document.getElementById("classification-badge");
  badge.textContent = conflict.officialClassification;
  badge.className = `classification-stamp ${conflict.isWar ? "war" : "not-war"}`;

  document.getElementById("result-reveal-text").textContent = conflict.reveal;
}

function nextRound() {
  state.currentRound++;
  if (state.currentRound >= ROUNDS_PER_GAME) {
    endGame();
  } else {
    renderRound();
  }
}

function endGame() {
  document.getElementById("progress-bar").style.width = "100%";
  showScreen("screen-end");

  const score = state.score;
  document.getElementById("end-score").textContent = score;

  let title, message;
  if (score === 10) {
    title = "Perfect";
    message =
      "You know your unconstitutional military history better than most of Congress.";
  } else if (score >= 8) {
    title = "Well done";
    message =
      "You clearly understand how blurry the line is between war and 'not war.'";
  } else if (score >= 6) {
    title = "Not bad";
    message =
      "You got more right than most people would. The classifications are genuinely absurd.";
  } else if (score >= 4) {
    title = "Tricky, right?";
    message =
      "Don't feel bad \u2014 the whole point is that the classifications make no sense. The Korean War killed 36,000 Americans and it wasn't a 'war.'";
  } else {
    title = "Exactly the point";
    message =
      "Your score proves the thesis: the US classification system for war is completely ridiculous. Nobody can tell the difference because there is no logic to it.";
  }

  document.getElementById("end-title").textContent = title;
  document.getElementById("end-message").textContent = message;

  const recap = document.getElementById("end-recap");
  recap.innerHTML = state.history.map((h, i) => {
    const c = state.conflicts[i];
    const icon = h.correct ? "&#10003;" : "&#10007;";
    const cls = h.correct ? "recap-correct" : "recap-wrong";
    const actual = c.isWar ? "War" : c.officialClassification;
    return `<div class="recap-row ${cls}">
      <span class="recap-icon">${icon}</span>
      <span class="recap-name">${c.name}</span>
      <span class="recap-class">${actual}</span>
    </div>`;
  }).join("");
}

function shareResults() {
  const score = state.score;
  const grid = state.history.map((h) => (h.correct ? "\u2713" : "\u2717")).join(" ");

  const text = `Is It War? \u2014 ${score}/10\n\n${grid}\n\nYou won't believe what the US has classified as "not a war."\nhttps://isitwar.com`;

  if (navigator.share) {
    navigator.share({ title: "Is It War?", text }).catch(() => copyToClipboard(text));
  } else {
    copyToClipboard(text);
  }
}

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const btn = document.getElementById("btn-share");
      const original = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(() => { btn.textContent = original; }, 2000);
    })
    .catch(() => {
      prompt("Copy this:", text);
    });
}

const HOOKS = [
  "58,220 Americans died in Vietnam.<br>Congress never called it a war.",
  "The US invaded Russia with 13,000 troops.<br>Congress didn't even know.",
  "The deadliest conflict in US history<br>was legally just 'putting down a rebellion.'",
  "The Korean War killed 36,574 Americans.<br>Officially, it was a 'police action.'",
  "The US bombed Yugoslavia for 78 days.<br>Congress voted against authorizing it.",
  "We overthrew Panama's government<br>and called it a 'military operation.'",
  "241 Marines died in Beirut.<br>It was classified as 'peacekeeping.'",
];

document.querySelector(".start-hook").innerHTML =
  HOOKS[Math.floor(Math.random() * HOOKS.length)];

document.getElementById("btn-start").addEventListener("click", startGame);

document.addEventListener("keydown", (e) => {
  const game = document.getElementById("screen-game");
  const start = document.getElementById("screen-start");
  const end = document.getElementById("screen-end");

  if (game.classList.contains("active")) {
    const choosing = document.getElementById("choice-section").style.display !== "none";
    const reviewing = !document.getElementById("result-section").classList.contains("hidden");

    if (choosing) {
      if (e.key === "1" || e.key === "ArrowLeft") handleGuess(true);
      if (e.key === "2" || e.key === "ArrowRight") handleGuess(false);
    } else if (reviewing) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        nextRound();
      }
    }
    return;
  }

  if ((start.classList.contains("active") || end.classList.contains("active")) &&
      (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    startGame();
  }
});
