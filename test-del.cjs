const initSqlJs = require('sql.js');

async function run() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  
  // create schema
  db.run(`
    CREATE TABLE IF NOT EXISTS bac_si (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ho_ten TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ho_so_kham (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_bac_si INTEGER NOT NULL,
        FOREIGN KEY (id_bac_si) REFERENCES bac_si(id) ON UPDATE CASCADE ON DELETE RESTRICT
    );
    INSERT INTO bac_si (id, ho_ten) VALUES (1, 'A');
    INSERT INTO bac_si (id, ho_ten) VALUES (2, 'B');
    INSERT INTO ho_so_kham (id, id_bac_si) VALUES (10, 1);
  `);
  
  try {
    db.run("PRAGMA foreign_keys = OFF;");
    db.run("UPDATE ho_so_kham SET id_bac_si = ? WHERE id_bac_si = ?", [2, 1]);
    db.run("DELETE FROM bac_si WHERE id = ?", [1]);
    db.run("PRAGMA foreign_keys = ON;");
    console.log("Success deleting via sql.js!");
  } catch (e) {
    console.error("Failed:", e.message);
  }
}
run();
