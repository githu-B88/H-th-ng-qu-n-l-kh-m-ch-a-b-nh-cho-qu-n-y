const fs = require('fs');
let content = fs.readFileSync('src/db/sqlite-service.ts', 'utf-8');

const runStart = content.indexOf('public run(sql: string, params: SqlValue[] = []): {');
const runEnd = content.indexOf('// ===================== CRUD CO QUAN & DON VI =====================', runStart);
if (runStart !== -1 && runEnd !== -1) {
    const newRun = `public run(sql: string, params: SqlValue[] = []): { success: boolean; lastInsertRowId?: number; changes?: number } {
    if (!this.db) return { success: false };
    try {
      this.db.run(sql, params); // This will trigger the auto-sync via monkey patch
      
      let lastInsertRowId = undefined;
      let changes = undefined;
      try {
        const lastIdRes = this.db.exec("SELECT last_insert_rowid() as id, changes() as ch");
        lastInsertRowId = lastIdRes[0]?.values[0]?.[0] as number | undefined;
        changes = lastIdRes[0]?.values[0]?.[1] as number | undefined;
      } catch (e) {}

      this.notify();
      return { success: true, lastInsertRowId, changes };
    } catch (err) {
      console.error('SQL run error:', sql, err);
      return { success: false };
    }
  }

  `;
    content = content.slice(0, runStart) + newRun + content.slice(runEnd);
}

fs.writeFileSync('src/db/sqlite-service.ts', content);
console.log('Patched public run in sqlite-service.ts');
