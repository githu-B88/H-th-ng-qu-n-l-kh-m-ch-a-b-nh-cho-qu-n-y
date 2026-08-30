const fs = require('fs');
let s = fs.readFileSync('src/db/sqlite-service.ts', 'utf8');

s = s.replace(/SELECT bs\.\*, cq\.ten as ten_don_vi \n\s*FROM bac_si bs \n\s*LEFT JOIN don_vi_cap_2 cq ON bs\.id_don_vi = cq\.id \n\s*ORDER BY bs\.id ASC/,
`SELECT bs.*, d2.ten as ten_don_vi, d1.ten as ten_don_vi_cap_1 
      FROM bac_si bs 
      LEFT JOIN don_vi_cap_2 d2 ON bs.id_don_vi = d2.id 
      LEFT JOIN don_vi_cap_1 d1 ON d2.id_don_vi_cap_1 = d1.id
      ORDER BY bs.id ASC`);

s = s.replace(/SELECT ns\.\*, cq\.ten as ten_don_vi \n\s*FROM can_bo ns \n\s*LEFT JOIN don_vi_cap_2 cq ON ns\.id_don_vi_cap_2 = cq\.id \n\s*ORDER BY ns\.id DESC/,
`SELECT ns.*, d2.ten as ten_don_vi, d1.ten as ten_don_vi_cap_1 
      FROM can_bo ns 
      LEFT JOIN don_vi_cap_2 d2 ON ns.id_don_vi_cap_2 = d2.id 
      LEFT JOIN don_vi_cap_1 d1 ON d2.id_don_vi_cap_1 = d1.id
      ORDER BY ns.id DESC`);

s = s.replace(/SELECT c\.id, c\.ho_ten, c\.ngay_sinh, c\.gioi_tinh, c\.id_don_vi_cap_2 as id_don_vi, c\.ma_the_bhyt as the_bhyt, c\.cap_bac, c\.chuc_vu, d2\.ten as ten_don_vi, d1\.id as id_don_vi_cap_1, t\.tu_ngay, t\.den_ngay/,
`SELECT c.id, c.ho_ten, c.ngay_sinh, c.gioi_tinh, c.id_don_vi_cap_2 as id_don_vi, c.ma_the_bhyt as the_bhyt, c.cap_bac, c.chuc_vu, d2.ten as ten_don_vi, d1.id as id_don_vi_cap_1, d1.ten as ten_don_vi_cap_1, t.tu_ngay, t.den_ngay`);

fs.writeFileSync('src/db/sqlite-service.ts', s, 'utf8');
