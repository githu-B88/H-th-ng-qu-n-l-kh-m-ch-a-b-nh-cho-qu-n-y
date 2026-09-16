const initSqlJs = require('sql.js');
async function run() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE can_bo (id INTEGER PRIMARY KEY);
    CREATE TABLE ho_so_kham (id INTEGER PRIMARY KEY, id_nhan_su INTEGER);
    CREATE TABLE ho_so_kham_chi_tiet (id INTEGER PRIMARY KEY, id_ho_so INTEGER);
    INSERT INTO can_bo VALUES (1);
  `);
  try {
    db.run("BEGIN TRANSACTION;");
    db.run("DELETE FROM ho_so_kham_chi_tiet WHERE id_ho_so IN (SELECT id FROM ho_so_kham WHERE id_nhan_su = ?);", [1]);
    db.run("DELETE FROM ho_so_kham WHERE id_nhan_su = ?;", [1]);
    db.run("DELETE FROM can_bo WHERE id = ?;", [1]);
    db.run("COMMIT;");
    console.log("Patient deleted");
  } catch(e) { console.error("Error: ", e.message); }
}
run();
