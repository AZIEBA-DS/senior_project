const socket = io();

// DOM Elements
const openCreateRoomBox = document.getElementById("open-create-room-box");
const openJoinRoomBox = document.getElementById("open-join-room-box");
const createRoomBox = document.getElementById("create-room-box");
const roomIdInput = document.getElementById("room-id");
const cancelCreateActionBtn = document.getElementById("cancel-create-action");
const gameplayChoices = document.getElementById("gameplay-choices");
const createRoomBtn = document.getElementById("create-room-btn");
const multiplayerScreen = document.querySelector(".multiplayer-screen");
const startScreen = document.querySelector(".start-screen");
const cancelJoinActionBtn = document.getElementById("cancel-join-action");
const joinBoxRoom = document.getElementById("join-room-box");
const joinRoomBtn = document.getElementById("join-room-btn");
const joinRoomInput = document.getElementById("join-room-input");
const joinRandomBtn = document.getElementById("join-random");
const joinRoomError = document.getElementById("join-room-error-message");
const createRoomError = document.getElementById("create-room-error-message");
const playerOne = document.getElementById("player-1");
const playerTwo = document.getElementById("player-2");
const waitMessage = document.getElementById("wait-message");
const rock = document.getElementById("rock");
const paper = document.getElementById("paper");
const scissor = document.getElementById("scissor");
const myScore = document.getElementById('my-score');
const enemyScore = document.getElementById('enemy-score');
const playerOneTag = document.getElementById("player-1-tag");
const playerTwoTag = document.getElementById("player-2-tag");
const winMessage = document.getElementById("win-message");
const openLoginBox = document.getElementById("open-login-box");
const openRegisterBox = document.getElementById("open-register-box");
const registerBox = document.getElementById("register-box");
const loginBox = document.getElementById("login-box");
const registerBtn = document.getElementById("confirm-register-btn");
const loginBtn = document.getElementById("confirm-login-btn");
const registerCancelBtn = document.getElementById("register-cancel-btn");
const loginCancelBtn = document.getElementById("login-cancel-btn");
const authenticationChoices = document.getElementById("authentication-choices");
const loginScreen = document.querySelector(".login-screen");
const modeScreen = document.querySelector(".mode-screen");
const multiPlayerBtn = document.getElementById("multiplayer-btn");
const loginError = document.getElementById("login-error");
const registerError = document.getElementById("register-error");
const multiplayerGameResult = document.getElementById('multiplayer-game-result');
const gameplayChoicesBackBtn = document.getElementById('gameplay-choices-back-btn');
const statsScreen = document.querySelector('.stats-screen');
const statsBtn = document.getElementById('stats-btn');
const welcomeMessage = document.getElementById('welcome-message');
const statsContent = document.getElementById('stats-content');
const statsLeaveBtn = document.getElementById('stats-leave-btn');

// singleplayer
const singlePlayerScreen = document.querySelector(".singleplayer-screen");
const singlePlayerBtn = document.getElementById("singleplayer-btn");
const singleplayerWinMessage = document.getElementById("singleplayer-win-message");
const singleplayerRock = document.getElementById("singleplayer-rock");
const singleplayerPaper = document.getElementById("singleplayer-paper");
const singleplayerScissor = document.getElementById("singleplayer-scissor");
const singleplayerMyScore = document.getElementById('singleplayer-my-score');
const singleplayerEnemyScore = document.getElementById('singleplayer-enemy-score');
const singleplayerGameResult = document.getElementById('singleplayer-game-result');
const singleplayerPlayAgain = document.getElementById('singleplayer-playagain-btn');
const singleplayerLeave = document.getElementById('singleplayer-leave-btn');
const singleplayerExit = document.getElementById('singleplayer-exit-btn');

//  Game variables
let canChoose = false;
let playerOneConnected = false;
let playerTwoIsConnected = false;
let playerId = 0;
let myChoice = "";
let enemyChoice = "";
let roomId = "";
let myScorePoints = 0;
let enemyScorePoints = 0;
let gameMode = "";
let gameResult = "";
let isGameOver = false;
let user = "";

statsLeaveBtn.addEventListener("click", function () {
  statsScreen.style.display = "none";
  modeScreen.style.display = "block";
  statsContent.innerHTML = "";
})

statsBtn.addEventListener("click", function () {
  statsScreen.style.display = "block";
  modeScreen.style.display = "none";
  socket.emit("get.user.stats", user.id);
})

gameplayChoicesBackBtn.addEventListener("click", function () {
  modeScreen.style.display = "block";
  startScreen.style.display = "none";
})

openLoginBox.addEventListener("click", function () {
  authenticationChoices.style.display = "none";
  loginBox.style.display = "block";
})

openRegisterBox.addEventListener("click", function () {
  authenticationChoices.style.display = "none";
  registerBox.style.display = "block";
})

registerCancelBtn.addEventListener("click", function () {
  authenticationChoices.style.display = "block";
  registerBox.style.display = "none";
  $(".error").empty();
})

loginCancelBtn.addEventListener("click", function () {
  authenticationChoices.style.display = "block";
  loginBox.style.display = "none";
  $(".error").empty();
})

multiPlayerBtn.addEventListener("click", function () {
  modeScreen.style.display = "none";
  startScreen.style.display = "block";
  gamemode = "multiplayer";
})

singlePlayerBtn.addEventListener("click", function () {
  modeScreen.style.display = "none";
  singlePlayerScreen.style.display = "block";

  gamemode = "singleplayer";
  canChoose = true;
})

registerBtn.addEventListener("click", function () {
  let username = $("#register-username").val();
  let email = $("#register-email").val();
  let password = $("#register-password").val();

  let registerInfo = { username: username, email: email, password: password };

  socket.emit("user.create", registerInfo);
})

loginBtn.addEventListener("click", function () {
  let email = $("#login-email").val();
  let password = $("#login-password").val();

  let loginInfo = { email: email, password: password };

  socket.emit("user.login", loginInfo);
})

openCreateRoomBox.addEventListener("click", function () {
  gameplayChoices.style.display = "none";
  createRoomBox.style.display = "block";

  createRoomError.innerHTML = "";
  createRoomError.style.display = "none";
})

cancelCreateActionBtn.addEventListener("click", function () {
  gameplayChoices.style.display = "block";
  createRoomBox.style.display = "none";
})

createRoomBtn.addEventListener("click", function () {
  let id = roomIdInput.value;
  socket.emit("create-room", id);
})

openJoinRoomBox.addEventListener("click", function () {
  gameplayChoices.style.display = "none";
  joinBoxRoom.style.display = "block";

  joinRoomError.innerHTML = "";
  joinRoomError.style.display = "none";
})

cancelJoinActionBtn.addEventListener("click", function () {
  gameplayChoices.style.display = "block";
  joinBoxRoom.style.display = "none";
})

joinRoomBtn.addEventListener("click", function () {
  let id = joinRoomInput.value;
  socket.emit("join-room", id);
})

joinRandomBtn.addEventListener("click", function () {
  joinRoomError.innerHTML = "";
  joinRoomError.style.display = "none";
  socket.emit("join-random");
})

rock.addEventListener("click", function () {
  if (canChoose && myChoice === "" && playerOneConnected && playerTwoIsConnected) {
    myChoice = "rock";
    choose(myChoice);
    socket.emit("make-move-multiplayer", { playerId, myChoice, roomId });
  }
})

paper.addEventListener("click", function () {
  if (canChoose && myChoice === "" && playerOneConnected && playerTwoIsConnected) {
    myChoice = "paper";
    choose(myChoice);
    socket.emit("make-move-multiplayer", { playerId, myChoice, roomId });
  }
})

scissor.addEventListener("click", function () {
  if (canChoose && myChoice === "" && playerOneConnected && playerTwoIsConnected) {
    myChoice = "scissor";
    choose(myChoice);
    socket.emit("make-move-multiplayer", { playerId, myChoice, roomId });
  }
})

//Singleplayer
singleplayerRock.addEventListener("click", function () {
  if (canChoose && myChoice === "") {
    myChoice = "rock";
    singleplayerMove(myChoice);
  }
})

singleplayerPaper.addEventListener("click", function () {
  if (canChoose && myChoice === "") {
    myChoice = "paper";
    singleplayerMove(myChoice);
  }
})

singleplayerScissor.addEventListener("click", function () {
  if (canChoose && myChoice === "") {
    myChoice = "scissor";
    singleplayerMove(myChoice);
  }
})

singleplayerPlayAgain.addEventListener("click", function () {
  enemyScorePoints = 0;
  myScorePoints = 0;
  isGameOver = false;
  gameResult = "";
  singleplayerRock.classList.remove('my-choice');
  singleplayerPaper.classList.remove('my-choice');
  singleplayerScissor.classList.remove('my-choice');
  singleplayerWinMessage.innerHTML = "";
  displayScore();
  $("#singleplayer-modal").modal("hide");
})

singleplayerLeave.addEventListener("click", function () {
  exitSingleplayer();
})

singleplayerExit.addEventListener("click", function () {
  exitSingleplayer();
})

// Socket
socket.on("display-create-error", error => {
  createRoomError.style.display = "block";
  createRoomError.innerHTML = "";

  let p = document.createElement("p");
  p.innerHTML = error;

  createRoomError.append(p);
})

socket.on("display-join-error", error => {
  joinRoomError.style.display = "block";
  joinRoomError.innerHTML = "";

  let p = document.createElement("p");
  p.innerHTML = error;

  joinRoomError.append(p);
})

socket.on("room-created", id => {
  playerId = 1;
  roomId = id;

  setPlayerTag(1);

  startScreen.style.display = "none";
  multiplayerScreen.style.display = "block";
})

socket.on("room-joined", id => {
  playerId = 2;
  roomId = id;

  playerOneConnected = true;
  playerJoinTheGame(1)
  setPlayerTag(2);
  setWaitMessage(false);

  startScreen.style.display = "none";
  multiplayerScreen.style.display = "block";
})

socket.on("player-1-connected", () => {
  playerJoinTheGame(1);
  playerOneConnected = true;
})

socket.on("player-2-connected", () => {
  playerJoinTheGame(2)
  playerTwoIsConnected = true
  canChoose = true;
  setWaitMessage(false);
});

socket.on("player-1-disconnected", () => {
  reset()
})

socket.on("player-2-disconnected", () => {
  canChoose = false;
  playerTwoLeftTheGame()
  setWaitMessage(true);
  enemyScorePoints = 0
  myScorePoints = 0
  displayScore()
})

socket.on("draw", message => {
  setWinningMessage(message);
})

socket.on("player-1-wins", ({ playerOneChoice, playerTwoChoice }) => {
  if (playerId == 1) {
    let message = "You picked " + playerOneChoice + " and the enemy picked " + playerTwoChoice + ". You gain one point.";
    myScorePoints++;

    if (myScorePoints == 3) {
      isGameOver = true;
      gameResult = "win";
    }
    setWinningMessage(message);
  } else {
    let message = "You picked " + playerTwoChoice + " and the enemy picked " + playerOneChoice + ". Enemy gains one point.";
    enemyScorePoints++;

    if (enemyScorePoints == 3) {
      isGameOver = true;
      gameResult = "lose";
    }
    setWinningMessage(message);
  }

  displayScore()
})

socket.on("player-2-wins", ({ playerOneChoice, playerTwoChoice }) => {
  if (playerId == 2) {
    let message = "You picked " + playerTwoChoice + " and the enemy picked " + playerOneChoice + ". You gain one point.";
    myScorePoints++;

    if (myScorePoints == 3) {
      isGameOver = true;
      gameResult = "win";
    }
    setWinningMessage(message);
  } else {
    let message = "You picked " + playerOneChoice + " and the enemy picked " + playerTwoChoice + ". Enemy gains one point.";
    enemyScorePoints++;

    if (enemyScorePoints == 3) {
     isGameOver = true;
     gameResult = "lose";
    }
    setWinningMessage(message);
  }

  displayScore()
})

socket.on("user.get.success", ({ profile }) => {
  user = profile;

  modeScreen.style.display = "block";
  loginScreen.style.display = "none";
  welcomeMessage.innerHTML = `Welcome, ${user.username}`;
})

socket.on("user.get.error", () => {
  loginScreen.style.display = "block";
  startScreen.style.display = "none";
})

socket.on('user.create.error', ({ error }) => {
  registerError.innerHTML = error;
})

socket.on('user.login.error', ({ error }) => {
  loginError.innerHTML = error;
})

socket.on('user.stats.success', ({ stats }) => {
  let entry = `<tr><td>${stats[0].totalGames}</td><td>${stats[0].singleplayerWins}</td><td>${stats[0].singleplayerLosses}</td><td>${stats[0].multiplayerWins}</td><td>${stats[0].multiplayerLosses}</td></tr>`
  statsContent.innerHTML = entry;
})

// Functions
function exitSingleplayer() {
  singlePlayerScreen.style.display = "none";
  gamemode = "";
  gameResult = "";
  enemyScorePoints = 0;
  myScorePoints = 0;
  isGameOver = false;
  displayScore();
  modeScreen.style.display = "block";
  $("#singleplayer-modal").modal("hide");
}

function setPlayerTag(playerId) {
  if (playerId === 1) {
    playerOneTag.innerText = "You (Player 1)";
    playerTwoTag.innerText = "Enemy (Player 2)";
  } else {
    playerOneTag.innerText = "Enemy (Player 2)";
    playerTwoTag.innerText = "You (Player 1)";
  }
}

function playerJoinTheGame(playerId) {
  if (playerId === 1) {
    playerOne.classList.add("connected");
  } else {
    playerTwo.classList.add("connected");
  }
}

function setWaitMessage(display) {
  if (display) {
    let p = document.createElement("p");
    p.innerText = "Waiting for another player to join...";
    waitMessage.appendChild(p)
  } else {
    waitMessage.innerHTML = "";
  }
}

function reset() {
  isGameOver = false;
  canChoose = false;
  playerOneConnected = false;
  playerTwoIsConnected = false;
  startScreen.style.display = "block";
  gameplayChoices.style.display = "block";
  multiplayerScreen.style.display = "none";
  joinBoxRoom.style.display = "none";
  createRoomBox.style.display = "none";
  playerTwo.classList.remove("connected");
  playerOne.classList.remove("connected");
  myScorePoints = 0
  enemyScorePoints = 0
  gameResult = "";
  displayScore()
  setWaitMessage(true);
}

function playerTwoLeftTheGame() {
  playerTwoIsConnected = false;
  playerTwo.classList.remove("connected");
}

function displayScore() {
  if (gamemode == "multiplayer") {
    myScore.innerText = myScorePoints;
    enemyScore.innerText = enemyScorePoints;
  } else {
    singleplayerMyScore.innerText = myScorePoints;
    singleplayerEnemyScore.innerText = enemyScorePoints;
  }
}

function choose(choice) {
  if (gamemode == "multiplayer") {
    if (choice === "rock") {
      rock.classList.add("my-choice");
    } else if (choice === "paper") {
      paper.classList.add("my-choice");
    } else {
      scissor.classList.add("my-choice");
    }
  } else {
    if (choice === "rock") {
      singleplayerRock.classList.add("my-choice");
    } else if (choice === "paper") {
      singleplayerPaper.classList.add("my-choice");
    } else {
      singleplayerScissor.classList.add("my-choice");
    }
  }
  canChoose = false;
}

function removeChoice(choice) {
  if (gamemode == "multiplayer") {
    if (choice === "rock") {
      rock.classList.remove("my-choice");
    } else if (choice === "paper") {
      paper.classList.remove("my-choice");
    } else {
      scissor.classList.remove("my-choice");
    }
  } else {
    if (choice === "rock") {
      singleplayerRock.classList.remove("my-choice");
    } else if (choice === "paper") {
      singleplayerPaper.classList.remove("my-choice");
    } else {
      singleplayerScissor.classList.remove("my-choice");
    }
  }

  canChoose = true;
  myChoice = "";
}

function setWinningMessage(message) {
  let p = document.createElement("p");
  p.innerText = message;

  if (gamemode == "multiplayer") {
    winMessage.appendChild(p);
    setTimeout(() => {
      removeChoice(myChoice)
      winMessage.innerHTML = "";
    }, 2000)

    if (isGameOver == true) {
      $("#multiplayer-modal").modal({ backdrop: "static", keyboard: false });
      multiplayerGameResult.innerHTML = `Gameover, you ${gameResult}!`;
      $("#multiplayer-modal").modal("show");

      let gameInfo = { userId: user.id, gameMode: gamemode, pointsScored: myScorePoints };
      socket.emit("save-game", gameInfo);

      setTimeout(() => {
        socket.emit("exit-room");
        $("#multiplayer-modal").modal("hide");
      }, 4500)
    }

  } else {
    singleplayerWinMessage.appendChild(p);

    setTimeout(() => {
      removeChoice(myChoice)
      singleplayerWinMessage.innerHTML = "";
    }, 2000)
    if (isGameOver == true) {
      $("#singleplayer-modal").modal({ backdrop: "static", keyboard: false });
      singleplayerGameResult.innerHTML = `Gameover, you ${gameResult}!`;
      $("#singleplayer-modal").modal("show");
      let gameInfo = { userId: user.id, gameMode: gamemode, pointsScored: myScorePoints };
      socket.emit("save-game", gameInfo);
    }
  }
}

function singleplayerMove(userMove) {
  choose(userMove);
  let cpuMove = "";
  let random = Math.floor(Math.random() * 3);

  if (random == 0) {
    cpuMove = "rock";
  } else if (random == 1) {
    cpuMove = "paper";
  } else {
    cpuMove = "scissor";
  }

  if (cpuMove == 'scissor' && userMove == 'scissor' || cpuMove == 'rock' && userMove == 'rock' || cpuMove == 'paper' && userMove == 'paper') {
    let message = "You picked " + userMove + " and the computer picked " + cpuMove + ". It's a tie!";
    setWinningMessage(message);
  } else if (cpuMove == 'rock' && userMove == 'scissor' || cpuMove == 'paper' && userMove == 'rock' || cpuMove == 'scissor' && userMove == 'paper') {
    let message = "You picked " + userMove + " and the computer picked " + cpuMove + ". So you lose!";
    enemyScorePoints++;
    if (enemyScorePoints == 3) {
      isGameOver = true;
      gameResult = "lose";
    }
    setWinningMessage(message);
  } else {
    let message = "You picked " + userMove + " and the computer picked " + cpuMove + " . So you win!";
    myScorePoints++;
    if (myScorePoints == 3) {
      isGameOver = true;
      gameResult = "win";
    }
    setWinningMessage(message);
  }
  displayScore();
}
