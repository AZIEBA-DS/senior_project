const express = require("express");
const session = require("express-session");
const mysql = require("mysql");
const fs = require("fs");
const bcrypt = require("bcryptjs")

const port = 8080;
const usernameRegEx = /^[a-zA-Z0-9]+([a-zA-Z0-9](_|-| )[a-zA-Z0-9])*[a-zA-Z0-9]+$/;
const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passwordRegEx = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?\W).*$/;

const app = express();

const dbInfo = {
  host: "localhost",
  user: "root",
  password: "",
  database: "ProjectDb"
};

const sessionOptions = {
  secret: "senior project",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 600000
  }
};
app.use(session(sessionOptions));

const connection = mysql.createConnection(dbInfo);
connection.connect(function(err) {
  if (err) throw err;
});

app.get("/", serveIndex);
app.get("/whoIsLoggedIn", whoIsLoggedIn);
app.get("/register", register);

app.listen(port, "localhost", startHandler());

function startHandler() {
  console.log(`Server listening on port ${port}`);
}

function serveIndex(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/html"
  });
  let index = fs.readFileSync("index.html");
  res.end(index);
}

function register(req, res) {
  let email = getEmail(req);
  let username = getUsername(req);

  if(!validateUsername(req.query.username)) {
    writeResult(res, {
      error: "Please enter a username."
    });
    return;
  }

  if (!validateEmail(email)) {
    writeResult(res, {
      error: "Email is not valid."
    });
    return;
  }

  if (!validatePassword(req.query.password)) {
    writeResult(res, {
      error: "Password must contain at least one upper-case letter, one number, and one special character."
    });
    return;
  }

  let password = bcrypt.hashSync(req.query.password, 12);

  connection.query("INSERT INTO Users (Email, Password, Username) VALUES (?, ?, ?)", [email, password, username], function(err, dbResult) {
    if (err)
      writeResult(res, {
        error: "Error creating user: " + err.message
      });
    else {
      connection.query("SELECT Id, Email, Username FROM Users WHERE Email = ?", [email], function(err, dbResult) {
        if (err)
          writeResult(res, {
            error: err.message
          });
        else {
          req.session.user = buildUser(dbResult[0]);
          writeResult(res, {
            user: req.session.user
          });
        }
      });
    }
  });
}

function validateUsername(username){
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

function getUsername(req) {
  return String(req.query.username);
}

function getEmail(req) {
  return String(req.query.email).toLowerCase();
}

function buildUser(dbObject) {
  return {
    id: dbObject.Id,
    email: dbObject.Email,
    username: dbObject.Username
  };
}

function whoIsLoggedIn(req, res) {
  if (req.session.user == undefined)
    writeResult(res, {
      error: "Please log in to continue."
    });
  else
    writeResult(res, {
      user: req.session.user
    });
}

function writeResult(res, result) {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  res.end(JSON.stringify(result));
}

function handleError(e) {
  console.log(e.stack);
  return {
    error: e.message
  };
}
