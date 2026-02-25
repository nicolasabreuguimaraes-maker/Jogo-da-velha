const statusText = document.getElementById("status");
const cells = Array.from(document.querySelectorAll(".cell"));
const modeSelect = document.getElementById("mode");
const resetRoundButton = document.getElementById("reset-round");
const resetScoreButton = document.getElementById("reset-score");
const scoreXText = document.getElementById("score-x");
const scoreOText = document.getElementById("score-o");
const scoreDrawText = document.getElementById("score-draw");

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let score = { X: 0, O: 0, draw: 0 };
let aiTurnTimeoutId = null;
let isAiThinking = false;

function isAiMode() {
  return modeSelect.value === "ai";
}

function clearPendingAiTurn() {
  if (aiTurnTimeoutId !== null) {
    window.clearTimeout(aiTurnTimeoutId);
    aiTurnTimeoutId = null;
  }
  isAiThinking = false;
}

function updateStatus() {
  if (isAiMode()) {
    if (isAiThinking) {
      statusText.textContent = "Computador está pensando...";
      return;
    }

    statusText.textContent = currentPlayer === "X" ? "Sua vez (X)" : "Vez do computador (O)";
    return;
  }

  statusText.textContent = `Vez do jogador ${currentPlayer}`;
}

function updateBoardAvailability() {
  cells.forEach((cell, index) => {
    cell.disabled = gameOver || isAiThinking || board[index] !== "";
  });
}

function updateScore() {
  scoreXText.textContent = `X: ${score.X}`;
  scoreOText.textContent = `O: ${score.O}`;
  scoreDrawText.textContent = `Empates: ${score.draw}`;
}

function clearBoardVisual() {
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.style.background = "";
    cell.style.borderColor = "";
  });
}

function startRound() {
  clearPendingAiTurn();
  board = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;
  clearBoardVisual();
  updateStatus();
  updateBoardAvailability();
}

function checkWinner() {
  return winningLines.find(([a, b, c]) => board[a] && board[a] === board[b] && board[b] === board[c]);
}

function checkDraw() {
  return board.every((value) => value !== "");
}

function finishGame(result, winnerLine) {
  clearPendingAiTurn();
  gameOver = true;

  if (result === "draw") {
    score.draw += 1;
    statusText.textContent = "Empate! 🤝";
  } else {
    score[result] += 1;
    if (isAiMode() && result === "O") {
      statusText.textContent = "🤖 Computador venceu!";
    } else {
      statusText.textContent = `🎉 ${result} venceu!`;
    }
  }

  updateScore();

  cells.forEach((cell, index) => {
    if (winnerLine && winnerLine.includes(index)) {
      cell.style.background = "#dcfce7";
      cell.style.borderColor = "#16a34a";
    }
  });

  updateBoardAvailability();
}

function applyMove(index, player) {
  if (gameOver || board[index] || currentPlayer !== player) {
    return false;
  }

  board[index] = player;
  cells[index].textContent = player;

  const winnerLine = checkWinner();
  if (winnerLine) {
    finishGame(player, winnerLine);
    return true;
  }

  if (checkDraw()) {
    finishGame("draw");
    return true;
  }

  currentPlayer = player === "X" ? "O" : "X";
  updateStatus();
  updateBoardAvailability();
  return true;
}

function getBestMove() {
  const emptyIndexes = board.map((value, index) => (value === "" ? index : -1)).filter((i) => i !== -1);

  for (const index of emptyIndexes) {
    board[index] = "O";
    const wins = checkWinner();
    board[index] = "";
    if (wins) return index;
  }

  for (const index of emptyIndexes) {
    board[index] = "X";
    const blocks = checkWinner();
    board[index] = "";
    if (blocks) return index;
  }

  if (board[4] === "") return 4;

  const corners = [0, 2, 6, 8].filter((index) => board[index] === "");
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  return emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
}

function runAiTurn() {
  isAiThinking = true;
  updateStatus();
  updateBoardAvailability();

  aiTurnTimeoutId = window.setTimeout(() => {
    aiTurnTimeoutId = null;
    isAiThinking = false;

    if (!gameOver && isAiMode() && currentPlayer === "O") {
      applyMove(getBestMove(), "O");
    }

    updateStatus();
    updateBoardAvailability();
  }, 250);
}

function handleCellClick(event) {
  const index = Number(event.currentTarget.dataset.index);

  if (isAiMode()) {
    const played = applyMove(index, "X");
    if (!played || gameOver || currentPlayer !== "O") {
      return;
    }

    runAiTurn();
    return;
  }

  applyMove(index, currentPlayer);
}

function resetScore() {
  score = { X: 0, O: 0, draw: 0 };
  updateScore();
  startRound();
}

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
modeSelect.addEventListener("change", startRound);
resetRoundButton.addEventListener("click", startRound);
resetScoreButton.addEventListener("click", resetScore);

updateScore();
startRound();
