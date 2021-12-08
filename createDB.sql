DROP DATABASE IF EXISTS SeniorProjectDb;

CREATE DATABASE SeniorProjectDb;
USE SeniorProjectDb;

CREATE TABLE Users (
  Id INTEGER NOT NULL AUTO_INCREMENT,
  Email varchar(255) UNIQUE NOT NULL,
  Password varchar(60) NOT NULL,
  Username varchar(255) UNIQUE NOT NULL,
  PRIMARY KEY(Id)
);

CREATE TABLE Games (
  Id INTEGER NOT NULL AUTO_INCREMENT,
  UserId INTEGER NOT NULL REFERENCES Users(Id),
  Gamemode varchar(60) NOT NULL,
  PointsScored INTEGER NOT NULL,
  GameTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(Id)
);