const fs = require('fs');
let code = fs.readFileSync('src/db/sqlite-service.ts', 'utf8');

// Fix seed checks
code = code.replace(
  /SELECT COUNT\(\*\) as count FROM co_quan/,
  'SELECT COUNT(*) as count FROM don_vi_cap_2'
);

code = code.replace(
  /DELETE FROM co_quan;/g,
  'DELETE FROM the_bhyt; DELETE FROM can_bo; DELETE FROM don_vi_cap_2; DELETE FROM don_vi_cap_1;'
);

// Fix CoQuan backwards compatibility methods
code = code.replace(
  /public getCoQuanList\(\): CoQuan\[\] \{[\s\S]*?\}/,
  `public getCoQuanList(): any[] {
    return this.query<any>("SELECT id, id_don_vi_cap_1, ten as ten_co_quan, ghi_chu FROM don_vi_cap_2 ORDER BY id ASC");
  }`
);

code = code.replace(
  /public saveCoQuan\(cq: Partial<CoQuan>\): boolean \{[\s\S]*?\}/,
  `public saveCoQuan(cq: any): boolean {
    const ten = cq.ten_co_quan || cq.ten || '';
    if (cq.id) {
      return this.run("UPDATE don_vi_cap_2 SET ten = ?, ghi_chu = ? WHERE id = ?", [
        ten,
        cq.ghi_chu || '',
        cq.id
      ]).success;
    } else {
      return this.run("INSERT OR IGNORE INTO don_vi_cap_2 (id_don_vi_cap_1, ten, ghi_chu) VALUES (?, ?, ?)", [
        cq.id_don_vi_cap_1 || 1, // Defaulting to 1 for backward compatibility
        ten,
        cq.ghi_chu || ''
      ]).success;
    }
  }`
);

code = code.replace(
  /public deleteCoQuan\(id: number\): boolean \{[\s\S]*?\}/,
  `public deleteCoQuan(id: number): boolean {
    return this.run("DELETE FROM don_vi_cap_2 WHERE id = ?", [id]).success;
  }`
);

// Add missing getDonVi methods right after getCoQuanList
const missingMethods = `

  public getDonViCap1List(): any[] {
    return this.query<any>("SELECT * FROM don_vi_cap_1 ORDER BY id ASC");
  }

  public getDonViCap2List(): any[] {
    return this.query<any>("SELECT * FROM don_vi_cap_2 ORDER BY id ASC");
  }

  public getTheBHYT(ma_the: string): any {
    const res = this.query<any>("SELECT * FROM the_bhyt WHERE ma_the_bhyt = ?", [ma_the]);
    return res.length > 0 ? res[0] : null;
  }
`;

code = code.replace(
  /public getCoQuanList\(\): any\[\] \{[\s\S]*?\}/,
  (match) => match + missingMethods
);

fs.writeFileSync('src/db/sqlite-service.ts', code, 'utf8');
