const fs = require('fs');
let schema = fs.readFileSync('src/db/schema.sql', 'utf8');

schema = schema.replace(
  /CREATE TABLE IF NOT EXISTS bac_si \(\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    ho_ten TEXT NOT NULL,\n    the_bhyt TEXT,\n    ngay_sinh TEXT,\n    gioi_tinh TEXT DEFAULT 'Nam' CHECK\(gioi_tinh IN \('Nam', 'Nữ', 'Khác'\)\),\n    id_don_vi INTEGER,/,
  `CREATE TABLE IF NOT EXISTS bac_si (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ho_ten TEXT NOT NULL,
    the_bhyt TEXT,
    ngay_sinh TEXT,
    gioi_tinh TEXT DEFAULT 'Nam' CHECK(gioi_tinh IN ('Nam', 'Nữ', 'Khác')),
    dia_chi TEXT,
    id_don_vi INTEGER,`
);

fs.writeFileSync('src/db/schema.sql', schema, 'utf8');

let service = fs.readFileSync('src/db/sqlite-service.ts', 'utf8');
service = service.replace(
  /CREATE TABLE IF NOT EXISTS bac_si \(\n\s*id INTEGER PRIMARY KEY AUTOINCREMENT,\n\s*ho_ten TEXT NOT NULL,\n\s*the_bhyt TEXT,\n\s*ngay_sinh TEXT,\n\s*gioi_tinh TEXT DEFAULT 'Nam' CHECK\(gioi_tinh IN \('Nam', 'Nữ', 'Khác'\)\),\n\s*id_don_vi INTEGER,/g,
  `CREATE TABLE IF NOT EXISTS bac_si (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ho_ten TEXT NOT NULL,
    the_bhyt TEXT,
    ngay_sinh TEXT,
    gioi_tinh TEXT DEFAULT 'Nam' CHECK(gioi_tinh IN ('Nam', 'Nữ', 'Khác')),
    dia_chi TEXT,
    id_don_vi INTEGER,`
);

fs.writeFileSync('src/db/sqlite-service.ts', service, 'utf8');
