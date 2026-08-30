const fs = require('fs');
let content = fs.readFileSync('src/db/sqlite-service.ts', 'utf8');

// replace saveBacSi update query
content = content.replace(
  /UPDATE bac_si SET\s*ho_ten = \?, the_bhyt = \?, ngay_sinh = \?, gioi_tinh = \?, dia_chi = \?,\s*id_don_vi = \?, chuyen_mon = \?, ghi_chu = \?\s*WHERE id = \?`,\s*\[\s*bs\.ho_ten \|\| '',\s*bs\.the_bhyt \|\| '',\s*bs\.ngay_sinh \|\| '',\s*bs\.gioi_tinh \|\| 'Nam',\s*bs\.dia_chi \|\| '',\s*bs\.id_don_vi \|\| null,\s*bs\.chuyen_mon \|\| '',\s*bs\.ghi_chu \|\| '',\s*bs\.id\s*\]/m,
  `UPDATE bac_si SET
           ho_ten = ?, the_bhyt = ?, ngay_sinh = ?, gioi_tinh = ?,
           id_don_vi = ?, chuyen_mon = ?, ghi_chu = ?
         WHERE id = ?\`,
        [
          bs.ho_ten || '',
          bs.the_bhyt || '',
          bs.ngay_sinh || '',
          bs.gioi_tinh || 'Nam',
          bs.id_don_vi || null,
          bs.chuyen_mon || '',
          bs.ghi_chu || '',
          bs.id
        ]`
);

// replace saveBacSi insert query
content = content.replace(
  /INSERT OR IGNORE INTO bac_si \(ho_ten, the_bhyt, ngay_sinh, gioi_tinh, dia_chi, id_don_vi, chuyen_mon, ghi_chu\)\s*VALUES \(\?, \?, \?, \?, \?, \?, \?, \?\)`,\s*\[\s*bs\.ho_ten \|\| '',\s*bs\.the_bhyt \|\| '',\s*bs\.ngay_sinh \|\| '',\s*bs\.gioi_tinh \|\| 'Nam',\s*bs\.dia_chi \|\| '',\s*bs\.id_don_vi \|\| null,\s*bs\.chuyen_mon \|\| '',\s*bs\.ghi_chu \|\| ''\s*\]/m,
  `INSERT OR IGNORE INTO bac_si (ho_ten, the_bhyt, ngay_sinh, gioi_tinh, id_don_vi, chuyen_mon, ghi_chu)
         VALUES (?, ?, ?, ?, ?, ?, ?)\`,
        [
          bs.ho_ten || '',
          bs.the_bhyt || '',
          bs.ngay_sinh || '',
          bs.gioi_tinh || 'Nam',
          bs.id_don_vi || null,
          bs.chuyen_mon || '',
          bs.ghi_chu || ''
        ]`
);

// replace initialization insert query
content = content.replace(
  /INSERT OR IGNORE INTO bac_si \(id, ho_ten, the_bhyt, ngay_sinh, gioi_tinh, dia_chi, id_don_vi, chuyen_mon, ghi_chu\) VALUES \(\?, \?, \?, \?, \?, \?, \?, \?, \?\)",\s*\[bs\.id, bs\.ho_ten, bs\.the_bhyt \|\| null, bs\.ngay_sinh \|\| null, bs\.gioi_tinh \|\| 'Nam', bs\.dia_chi \|\| null, bs\.id_don_vi \|\| null, bs\.chuyen_mon \|\| null, bs\.ghi_chu \|\| null\]/m,
  `INSERT OR IGNORE INTO bac_si (id, ho_ten, the_bhyt, ngay_sinh, gioi_tinh, id_don_vi, chuyen_mon, ghi_chu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [bs.id, bs.ho_ten, bs.the_bhyt || null, bs.ngay_sinh || null, bs.gioi_tinh || 'Nam', bs.id_don_vi || null, bs.chuyen_mon || null, bs.ghi_chu || null]`
);

// replace schema in createTables()
content = content.replace(
  /CREATE TABLE IF NOT EXISTS bac_si \(\s*id INTEGER PRIMARY KEY AUTOINCREMENT,\s*ho_ten TEXT NOT NULL,\s*the_bhyt TEXT,\s*ngay_sinh TEXT,\s*gioi_tinh TEXT DEFAULT 'Nam' CHECK\(gioi_tinh IN \('Nam', 'Nữ', 'Khác'\)\),\s*dia_chi TEXT,\s*id_don_vi INTEGER,/m,
  `CREATE TABLE IF NOT EXISTS bac_si (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ho_ten TEXT NOT NULL,
    the_bhyt TEXT,
    ngay_sinh TEXT,
    gioi_tinh TEXT DEFAULT 'Nam' CHECK(gioi_tinh IN ('Nam', 'Nữ', 'Khác')),
    id_don_vi INTEGER,`
);

fs.writeFileSync('src/db/sqlite-service.ts', content, 'utf8');

let schema = fs.readFileSync('src/db/schema.sql', 'utf8');
schema = schema.replace(
  /CREATE TABLE IF NOT EXISTS bac_si \(\s*id INTEGER PRIMARY KEY AUTOINCREMENT,\s*ho_ten TEXT NOT NULL,\s*the_bhyt TEXT,\s*ngay_sinh TEXT,\s*gioi_tinh TEXT DEFAULT 'Nam' CHECK\(gioi_tinh IN \('Nam', 'Nữ', 'Khác'\)\),\s*dia_chi TEXT,\s*id_don_vi INTEGER,/m,
  `CREATE TABLE IF NOT EXISTS bac_si (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ho_ten TEXT NOT NULL,
    the_bhyt TEXT,
    ngay_sinh TEXT,
    gioi_tinh TEXT DEFAULT 'Nam' CHECK(gioi_tinh IN ('Nam', 'Nữ', 'Khác')),
    id_don_vi INTEGER,`
);
fs.writeFileSync('src/db/schema.sql', schema, 'utf8');

let types = fs.readFileSync('src/types.ts', 'utf8');
types = types.replace(/\s*dia_chi\?: string;/g, '');
fs.writeFileSync('src/types.ts', types, 'utf8');

