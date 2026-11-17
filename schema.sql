-- One table holds everything in the studio. Each row is one saved item.
CREATE TABLE IF NOT EXISTS items (
  owner   TEXT NOT NULL,
  id      TEXT NOT NULL,
  kind    TEXT NOT NULL,
  body    TEXT NOT NULL,
  updated INTEGER,
  PRIMARY KEY (owner, id)
);
