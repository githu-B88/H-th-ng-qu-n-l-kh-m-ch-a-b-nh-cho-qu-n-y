const fs = require('fs');

let schema = fs.readFileSync('src/db/schema.sql', 'utf8');
schema = schema.replace(/\s*dia_chi TEXT,/g, '');
schema = schema.replace(/\s*so_dien_thoai TEXT,/g, '');
fs.writeFileSync('src/db/schema.sql', schema, 'utf8');

let service = fs.readFileSync('src/db/sqlite-service.ts', 'utf8');
service = service.replace(/\s*dia_chi TEXT,/g, '');
service = service.replace(/\s*so_dien_thoai TEXT,/g, '');

service = service.replace(
  /this\.db\.run\("INSERT OR IGNORE INTO can_bo \(id, ho_ten, ngay_sinh, gioi_tinh, dia_chi, so_dien_thoai, id_don_vi_cap_2, ma_the_bhyt, cap_bac, chuc_vu\) VALUES \(\?, \?, \?, \?, \?, \?, \?, \?, \?, \?\)",\n\s*\[ns\.id, ns\.ho_ten, ns\.ngay_sinh \|\| null, ns\.gioi_tinh \|\| 'Nam', ns\.dia_chi \|\| null, ns\.so_dien_thoai \|\| null, ns\.id_don_vi_cap_2 \|\| null, ns\.ma_the_bhyt \|\| null, ns\.cap_bac \|\| null, ns\.chuc_vu \|\| null\]\n\s*\);/,
  `this.db.run("INSERT OR IGNORE INTO can_bo (id, ho_ten, ngay_sinh, gioi_tinh, id_don_vi_cap_2, ma_the_bhyt, cap_bac, chuc_vu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [ns.id, ns.ho_ten, ns.ngay_sinh || null, ns.gioi_tinh || 'Nam', ns.id_don_vi_cap_2 || null, ns.ma_the_bhyt || null, ns.cap_bac || null, ns.chuc_vu || null]
      );`
);

service = service.replace(
  /OR LOWER\(ns\.so_dien_thoai\) LIKE \? /g,
  ''
);

service = service.replace(
  /\[term, term, term, term\]/g,
  `[term, term, term]`
);

service = service.replace(
  /c\.dia_chi, c\.so_dien_thoai, /g,
  ''
);

service = service.replace(
  /ho_ten = \?, ngay_sinh = \?, ma_the_bhyt = \?, gioi_tinh = \?, dia_chi = \?, so_dien_thoai = \?, id_don_vi_cap_2 = \?, cap_bac = \?, chuc_vu = \?/,
  'ho_ten = ?, ngay_sinh = ?, ma_the_bhyt = ?, gioi_tinh = ?, id_don_vi_cap_2 = ?, cap_bac = ?, chuc_vu = ?'
);

service = service.replace(
  /ns\.ho_ten \|\| '', ns\.ngay_sinh \|\| null, ns\.ma_the_bhyt \|\| null, ns\.gioi_tinh \|\| 'Nam', ns\.dia_chi \|\| '', ns\.so_dien_thoai \|\| '',/g,
  `ns.ho_ten || '', ns.ngay_sinh || null, ns.ma_the_bhyt || null, ns.gioi_tinh || 'Nam',`
);

service = service.replace(
  /INSERT OR IGNORE INTO can_bo \(ho_ten, ngay_sinh, ma_the_bhyt, gioi_tinh, dia_chi, so_dien_thoai, id_don_vi_cap_2, cap_bac, chuc_vu\)/g,
  `INSERT OR IGNORE INTO can_bo (ho_ten, ngay_sinh, ma_the_bhyt, gioi_tinh, id_don_vi_cap_2, cap_bac, chuc_vu)`
);

service = service.replace(/\s*ns\.so_dien_thoai as so_dien_thoai_nhan_su,/g, '');
service = service.replace(/\s*ns\.dia_chi as dia_chi_nhan_su,/g, '');
service = service.replace(/\s*so_dien_thoai: string;/g, '');
service = service.replace(/\s*ns\.so_dien_thoai,/g, '');

// Also remove `dia_chi` and `so_dien_thoai` from schema inside `createTables()` in sqlite-service.ts
let schemaInsideService = fs.readFileSync('src/db/schema.sql', 'utf8');
service = service.replace(
  /private createTables\(\) \{\n\s*if \(!this\.db\) return;\n\s*const schema = `[\s\S]*?`;/,
  `private createTables() {\n    if (!this.db) return;\n    const schema = \`\n${schemaInsideService.replace(/`/g, '\\`')}\n\`;`
);


fs.writeFileSync('src/db/sqlite-service.ts', service, 'utf8');
