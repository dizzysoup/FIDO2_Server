USE fidodb;

CREATE TABLE credentials (
  username VARCHAR(255),
  id VARCHAR(255),
  publicKey TEXT,
  algo VARCHAR(50),
  PRIMARY KEY (id, username),
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE
);