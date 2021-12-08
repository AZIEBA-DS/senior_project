const express = require("express");
const session = require("express-session");
const http = require("http");
const path = require("path");
const bcrypt = require("bcryptjs");
const mysql = require("mysql");
const socketio = require("socket.io");
const crypto = require("crypto");

const usernameRegEx = /^[a-zA-Z0-9]+([a-zA-Z0-9](_|-| )[a-zA-Z0-9])*[a-zA-Z0-9]+$/;
const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passwordRegEx = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?\W).*$/;
const notEmptyRegEx = /.*\S.*/;

global.userSessions = {};

const app = express();

const sessionOptions = {
  secret: "rock paper scissors",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 600000
  }
};
app.use(session(sessionOptions));
app.use(express.static(path.join(__dirname, "public")));

const dbInfo = {
  host: "localhost",
  user: "root",
  password: "",
  database: "SeniorProjectDb"
};

const connection = mysql.createConnection(dbInfo);
connection.connect(function (err) {
  if (err) throw err;
});

const { userConnected, connectedUsers, initializeChoices, moves, makeMove, choices } = require("./util/users");
const { createRoom, joinRoom, exitRoom, rooms } = require("./util/rooms");
const { createSecureServer } = require("http2");

const server = http.createServer(app);
server.listen(5000, () => console.log("Server started on port 5000..."));

// Socket Functions
const io = socketio(server);


io.on("connection", socket => {
  socket.on("create-room", (roomId) => {
    if (rooms[roomId]) {
      let error = "This room already exists";
      socket.emit("display-create-error", error);
    } else if (!notEmptyRegEx.test(roomId)) {
      let error = "Please enter a name for the room";
      socket.emit("display-create-error", error);
    } else {
      userConnected(socket.client.id);
      createRoom(roomId, socket.client.id);
      socket.emit("room-created", roomId);
      socket.emit("player-1-connected");
      socket.join(roomId);
    }
  })

  socket.on("join-room", roomId => {
    if (!rooms[roomId]) {
      let error = "This room doen't exist";
      socket.emit("display-join-error", error);
    } else {
      userConnected(socket.client.id);
      joinRoom(roomId, socket.client.id);
      socket.join(roomId);

      socket.emit("room-joined", roomId);
      socket.emit("player-2-connected");
      socket.broadcast.to(roomId).emit("player-2-connected");
      initializeChoices(roomId);
    }
  })

  socket.on("join-random", () => {
    let roomId = "";

    for (let id in rooms) {
      if (rooms[id][1] === "") {
        roomId = id;
        break;
      }
    }

    if (roomId === "") {
      let error = "All rooms are full or none exists";
      socket.emit("display-join-error", error);
    } else {
      userConnected(socket.client.id);
      joinRoom(roomId, socket.client.id);
      socket.join(roomId);

      socket.emit("room-joined", roomId);
      socket.emit("player-2-connected");
      socket.broadcast.to(roomId).emit("player-2-connected");
      initializeChoices(roomId);
    }
  });

  socket.on("make-move-multiplayer", ({ playerId, myChoice, roomId }) => {
    makeMove(roomId, playerId, myChoice);

    if (choices[roomId][0] !== "" && choices[roomId][1] !== "") {
      let playerOneChoice = choices[roomId][0];
      let playerTwoChoice = choices[roomId][1];

      if (playerOneChoice === playerTwoChoice) {
        let message = "Both of you chose " + playerOneChoice + ". Nobody gets a point.";
        io.to(roomId).emit("draw", message);

      } else if (moves[playerOneChoice] === playerTwoChoice) {
        io.to(roomId).emit("player-1-wins", { playerOneChoice, playerTwoChoice });
      } else {
        io.to(roomId).emit("player-2-wins", { playerOneChoice, playerTwoChoice });
      }
      choices[roomId] = ["", ""];
    }
  });

  socket.on("disconnect", () => {
    if (connectedUsers[socket.client.id]) {
      let player;
      let roomId;

      for (let id in rooms) {
        if (rooms[id][0] === socket.client.id ||
          rooms[id][1] === socket.client.id) {
          if (rooms[id][0] === socket.client.id) {
            player = 1;
          } else {
            player = 2;
          }

          roomId = id;
          break;
        }
      }

      exitRoom(roomId, player);

      if (player === 1) {
        io.to(roomId).emit("player-1-disconnected");
      } else {
        io.to(roomId).emit("player-2-disconnected");
      }
    }
  })

  socket.on("exit-room", () => {
    if (connectedUsers[socket.client.id]) {
      let player;
      let roomId;

      for (let id in rooms) {
        if (rooms[id][0] === socket.client.id ||
          rooms[id][1] === socket.client.id) {
          if (rooms[id][0] === socket.client.id) {
            player = 1;
          } else {
            player = 2;
          }

          roomId = id;
          break;
        }
      }

      exitRoom(roomId, player);

      if (player === 1) {
        io.to(roomId).emit("player-1-disconnected");
      } else {
        io.to(roomId).emit("player-2-disconnected");
      }
    }
  })

  socket.on("user.get", function (token) {
    getUser(socket, token);
  })

  socket.on("user.create", function (data) {
    createUser(socket, data);
  })

  socket.on("user.login", function (data) {
    authenticateUser(socket, data);
  })

  socket.on("user.logout", function (token) {
    delete userSessions[token];
  })

  socket.on("get.user.stats", function (userId) {
    getUserStats(socket, userId);
  })

  socket.on("save-game", function (userId, gameInfo) {
    saveGame(socket, userId, gameInfo)
  })
})

// User Authentication Functions
function authenticateUser(socket, data) {
  email = data.email;
  password = data.password;

  if (!validateEmail(email) && !validatePassword(password)) {
    socket.emit('user.login.error', { error: "Please enter your email and password." });
    return;
  } else if (!password) {
    socket.emit('user.login.error', { error: "Password is required." });
    return;
  } else if (!email) {
    socket.emit('user.login.error', { error: "Email is required." });
    return;
  }

  connection.query("SELECT Id, Email, Username, Password FROM Users WHERE Email = ?", [email], function (err, dbResult) {
    if (err)
      console.log(err.message);
    else {
      if (dbResult.length == 1 && bcrypt.compareSync(password, dbResult[0].Password)) {
        data = { id: dbResult[0].Id, email: dbResult[0].Email, username: dbResult[0].Username };
        return loginUser(socket, data);
      }
      else {
        return socket.emit('user.login.error', { error: "Invalid email or password." });
      }
    }
  });
}

function getUser(socket, token) {
  if (!userSessions[token]) {
    return socket.emit('user.get.error', { message: 'This user is not authenticated' });
  }
  return socket.emit('user.get.success', { profile: userSessions[token], token: token });
}

function saveGame(socket, gameInfo) {
  connection.query("INSERT INTO Games (UserId, Gamemode, PointsScored) VALUES (?, ?, ?)", [gameInfo.userId, gameInfo.gameMode, gameInfo.pointsScored], function (err) {
    if (err) {
      console.log(err);
    } else {
      return socket.emit('game-saved');
    }
  })
}

function getUserStats(socket, userId) {
  connection.query("SELECT COUNT(Id) as totalGames, COUNT(CASE PointsScored = 3 AND Gamemode = 'singleplayer' WHEN true THEN 1 ELSE NULL END) AS singleplayerWins, COUNT(CASE PointsScored < 3 AND Gamemode = 'singleplayer' WHEN true THEN 1 ELSE NULL END) as singleplayerLosses, COUNT(CASE PointsScored = 3 AND Gamemode = 'multiplayer' WHEN true THEN 1 ELSE NULL END) AS multiplayerWins, COUNT(CASE PointsScored < 3 AND Gamemode = 'multiplayer' WHEN true THEN 1 ELSE NULL END) as multiplayerLosses FROM Games WHERE UserId = ?", [userId], function (err, dbResult) {
    if (err) {
      console.log(err);
      return socket.emit('user.stats.error', { message: err });
    } else {
      return socket.emit('user.stats.success', { stats: dbResult });
    }
  })
}

function createUser(socket, data) {
  username = data.username;
  email = data.email;
  password = data.password;

  if (!validateUsername(username)) {
    return socket.emit('user.create.error', { error: "Username is not valid." });
  }

  if (!validateEmail(email)) {
    return socket.emit('user.create.error', { error: "Email is not valid." });
  }

  if (!validatePassword(password)) {
    return socket.emit('user.create.error', { error: "Password must contain one upper-case letter, one number, and one special character." });
  }

  password = bcrypt.hashSync(password, 12);

  connection.query("INSERT INTO Users (Username, Email, Password) VALUES (?,?,?)", [username, email, password], function (err) {
    if (err) {
      console.log(err.message);
      return socket.emit('user.create.error', { error: "User with this email or username already exists." });
    } else {
      connection.query("SELECT Id, Username, Email FROM Users WHERE Username = ?", [username], function (err, dbResult) {
        if (err) {
          console.log(err.message);
        } else {
          let loginInfo = { id: dbResult[0].Id, email: dbResult[0].Email, username: dbResult[0].Username };
          return loginUser(socket, loginInfo);
        }
      })
    }
  })
}

function loginUser(socket, user) {
  var token = crypto.randomBytes(64).toString('base64');

  userSessions[token] = user;

  return getUser(socket, token);
}

function validateUsername(username) {
  if (!username) return false;
  return usernameRegEx.test(username);
}

function validateEmail(email) {
  if (!email) return false;
  return emailRegEx.test(email.toLowerCase());
}

function validatePassword(password) {
  if (!password) return false;
  return passwordRegEx.test(password);
}
