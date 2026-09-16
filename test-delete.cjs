const fs = require('fs');
const initSqlJs = require('sql.js');

async function test() {
  const SQL = await initSqlJs();
  const dbData = fs.readFileSync('database.sqlite');
  const db = new SQL.Database(dbData);
  
  try {
    const remainingDocs = [];
    const stmt = db.prepare("SELECT id FROM bac_si WHERE id != ?");
    stmt.bind([1]);
    while (stmt.step()) remainingDocs.push(stmt.getAsObject());
    stmt.free();

    const fallbackDocId = remainingDocs[0].id;

    db.run("PRAGMA foreign_keys = OFF;");
    db.run("UPDATE ho_so_kham SET id_bac_si = ? WHERE id_bac_si = ?", [fallbackDocId, 1]);
    db.run("UPDATE nguoi_dung SET id_bac_si = NULL WHERE id_bac_si = ?", [1]);
    db.run("DELETE FROM bac_si WHERE id = ?", [1]);
    db.run("PRAGMA foreign_keys = ON;");
    console.log("Success");
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
