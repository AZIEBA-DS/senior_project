DROP DATABASE IF EXISTS ProjectDb;

CREATE DATABASE ProjectDb;
USE ProjectDb;

CREATE TABLE Users (
  Id INTEGER NOT NULL AUTO_INCREMENT,
  Email varchar(255) UNIQUE NOT NULL,
  Password varchar(60) NOT NULL,
  Username varchar(255) NOT NULL,
  PRIMARY KEY(Id)
);
