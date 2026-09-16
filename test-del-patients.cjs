const initSqlJs = require('sql.js');

async function run() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  
  db.run(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS can_bo (id INTEGER PRIMARY KEY AUTOINCREMENT, ho_ten TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS ho_so_kham (id INTEGER PRIMARY KEY AUTOINCREMENT, id_nhan_su INTEGER NOT NULL, FOREIGN KEY (id_nhan_su) REFERENCES can_bo(id) ON UPDATE CASCADE ON DELETE RESTRICT);
    CREATE TABLE IF NOT EXISTS ho_so_kham_chi_tiet (id INTEGER PRIMARY KEY AUTOINCREMENT, id_ho_so INTEGER NOT NULL);

    INSERT INTO can_bo (id, ho_ten) VALUES (1, 'Bệnh nhân 1');
    INSERT INTO ho_so_kham (id, id_nhan_su) VALUES (10, 1);
    INSERT INTO ho_so_kham_chi_tiet (id, id_ho_so) VALUES (100, 10);
  `);
  
  try {
    db.run("BEGIN TRANSACTION;");
    db.run("DELETE FROM ho_so_kham_chi_tiet WHERE id_ho_so IN (SELECT id FROM ho_so_kham WHERE id_nhan_su = ?);", [1]);
    db.run("DELETE FROM ho_so_kham WHERE id_nhan_su = ?;", [1]);
    db.run("DELETE FROM can_bo WHERE id = ?;", [1]);
    db.run("COMMIT;");
    console.log("Success deleting patient!");
  } catch (e) {
    db.run("ROLLBACK;");
    console.error("Failed patient:", e.message);
  }

  // test clearAllPatients
  db.run(`
    INSERT INTO can_bo (id, ho_ten) VALUES (2, 'Bệnh nhân 2');
    INSERT INTO ho_so_kham (id, id_nhan_su) VALUES (20, 2);
  `);
  
  try {
    db.run("BEGIN TRANSACTION;");
    db.run("DELETE FROM ho_so_kham_chi_tiet;");
    db.run("DELETE FROM ho_so_kham;");
    db.run("DELETE FROM can_bo;");
    db.run("COMMIT;");
    console.log("Success clear all!");
  } catch(e) {
    db.run("ROLLBACK;");
    console.error("Failed clear all:", e.message);
  }
}
run();
