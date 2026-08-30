const fs = require('fs');
let code = fs.readFileSync('src/db/sqlite-service.ts', 'utf8');

const oldSave = `public saveNhanSu(ns: Partial<NhanSu>): number | null {`;
const start = code.indexOf(oldSave);
if(start !== -1) {
  // Find the end of this function
  const end = code.indexOf('public deleteNhanSu(id: number): boolean {');
  
  const newSave = `
  public saveNhanSu(ns: any): number | null {
    if (!this.db) return null;
    try {
      // 1. Insert/Update the_bhyt first if provided
      if (ns.ma_the_bhyt) {
        const existingBhyt = this.query("SELECT * FROM the_bhyt WHERE ma_the_bhyt = ?", [ns.ma_the_bhyt]);
        if (existingBhyt.length > 0) {
          this.run("UPDATE the_bhyt SET tu_ngay = ?, den_ngay = ? WHERE ma_the_bhyt = ?", [ns.tu_ngay || null, ns.den_ngay || null, ns.ma_the_bhyt]);
        } else {
          this.run("INSERT INTO the_bhyt (ma_the_bhyt, tu_ngay, den_ngay) VALUES (?, ?, ?)", [ns.ma_the_bhyt, ns.tu_ngay || null, ns.den_ngay || null]);
        }
      }

      let res;
      // 2. Insert/Update can_bo
      if (ns.id) {
        res = this.run(
        \`UPDATE can_bo SET 
          ho_ten = ?, ngay_sinh = ?, ma_the_bhyt = ?, gioi_tinh = ?, dia_chi = ?, so_dien_thoai = ?, id_don_vi_cap_2 = ?, cap_bac = ?, chuc_vu = ?
         WHERE id = ?\`,
        [
          ns.ho_ten || '', ns.ngay_sinh || null, ns.ma_the_bhyt || null, ns.gioi_tinh || 'Nam', ns.dia_chi || '', ns.so_dien_thoai || '',
          ns.id_don_vi_cap_2 || ns.id_don_vi || null, ns.cap_bac || '', ns.chuc_vu || '', ns.id
        ]);
        if (res.success) {
          this.persistDatabase();
          this.notifyListeners();
          return ns.id;
        }
      } else {
        res = this.run(
        \`INSERT INTO can_bo (ho_ten, ngay_sinh, ma_the_bhyt, gioi_tinh, dia_chi, so_dien_thoai, id_don_vi_cap_2, cap_bac, chuc_vu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
        [
          ns.ho_ten || '', ns.ngay_sinh || null, ns.ma_the_bhyt || null, ns.gioi_tinh || 'Nam', ns.dia_chi || '', ns.so_dien_thoai || '',
          ns.id_don_vi_cap_2 || ns.id_don_vi || null, ns.cap_bac || '', ns.chuc_vu || ''
        ]);
        if (res.success) {
          this.persistDatabase();
          this.notifyListeners();
          return Number(res.lastInsertRowId);
        }
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  `;
  
  code = code.substring(0, start) + newSave + code.substring(end);
}

fs.writeFileSync('src/db/sqlite-service.ts', code, 'utf8');
