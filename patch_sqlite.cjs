const fs = require('fs');
let content = fs.readFileSync('src/db/sqlite-service.ts', 'utf8');

// Fix 1: The insert into can_bo has 9 placeholders but 7 values.
content = content.replace(
  /INSERT OR IGNORE INTO can_bo \(ho_ten, ngay_sinh, ma_the_bhyt, gioi_tinh, id_don_vi_cap_2, cap_bac, chuc_vu\)\s*VALUES \(\?, \?, \?, \?, \?, \?, \?, \?, \?\)/,
  `INSERT OR IGNORE INTO can_bo (ho_ten, ngay_sinh, ma_the_bhyt, gioi_tinh, id_don_vi_cap_2, cap_bac, chuc_vu)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
);

// Fix 2: In can_bo saveNhanSu, we need to pass tu_ngay and den_ngay properly to the frontend so that it's accessible.
// Wait, the read query `SELECT c.id, c.ho_ten, c.ngay_sinh...` should also LEFT JOIN the_bhyt to return tu_ngay and den_ngay.
content = content.replace(
  /c\.ma_the_bhyt as the_bhyt, c\.cap_bac, c\.chuc_vu, d2\.ten as ten_don_vi, d1\.id as id_don_vi_cap_1\s*FROM can_bo c\s*LEFT JOIN don_vi_cap_2 d2 ON c\.id_don_vi_cap_2 = d2\.id\s*LEFT JOIN don_vi_cap_1 d1 ON d2\.id_don_vi_cap_1 = d1\.id/,
  `c.ma_the_bhyt as the_bhyt, c.cap_bac, c.chuc_vu, d2.ten as ten_don_vi, d1.id as id_don_vi_cap_1, t.tu_ngay, t.den_ngay
         FROM can_bo c
         LEFT JOIN don_vi_cap_2 d2 ON c.id_don_vi_cap_2 = d2.id
         LEFT JOIN don_vi_cap_1 d1 ON d2.id_don_vi_cap_1 = d1.id
         LEFT JOIN the_bhyt t ON c.ma_the_bhyt = t.ma_the_bhyt`
);

// We should also replace the 9 placeholders in the initialize/seed step if present.
content = content.replace(
  /INSERT OR IGNORE INTO can_bo \(id, ho_ten, ngay_sinh, gioi_tinh, id_don_vi_cap_2, ma_the_bhyt, cap_bac, chuc_vu\) VALUES \(\?, \?, \?, \?, \?, \?, \?, \?\)/,
  `INSERT OR IGNORE INTO can_bo (id, ho_ten, ngay_sinh, gioi_tinh, id_don_vi_cap_2, ma_the_bhyt, cap_bac, chuc_vu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);


fs.writeFileSync('src/db/sqlite-service.ts', content, 'utf8');
