const fs = require('fs');
let code = fs.readFileSync('src/db/sqlite-service.ts', 'utf8');

const regex = /\/\/ Insert Co Quan[\s\S]*?\/\/ Insert Thuoc/;
const newSeed = `
    // Bỏ qua dữ liệu cũ, chèn cứng
    this.db.run("INSERT INTO don_vi_cap_1 (id, ten, ghi_chu) VALUES (1, 'Cơ quan trung tâm', '')");
    this.db.run("INSERT INTO don_vi_cap_1 (id, ten, ghi_chu) VALUES (2, 'Khối cơ sở', '')");

    this.db.run("INSERT INTO don_vi_cap_2 (id, id_don_vi_cap_1, ten, ghi_chu) VALUES (1, 1, 'Ban Lãnh Đạo', '')");
    this.db.run("INSERT INTO don_vi_cap_2 (id, id_don_vi_cap_1, ten, ghi_chu) VALUES (2, 1, 'Phòng Kế Hoạch', '')");
    this.db.run("INSERT INTO don_vi_cap_2 (id, id_don_vi_cap_1, ten, ghi_chu) VALUES (3, 2, 'Phòng Kỹ Thuật', '')");

    this.db.run("INSERT INTO the_bhyt (ma_the_bhyt, tu_ngay, den_ngay) VALUES ('HC4010219837482', '2023-01-01', '2025-12-31')");
    this.db.run("INSERT INTO can_bo (id, ho_ten, ngay_sinh, gioi_tinh, dia_chi, so_dien_thoai, id_don_vi_cap_2, ma_the_bhyt, cap_bac, chuc_vu) VALUES (1, 'Đặng Quốc Hưng', '1979-03-12', 'Nam', 'Hà Nội', '0912345678', 1, 'HC4010219837482', 'Thượng tá', 'Phó Giám Đốc')");
    // Insert Thuoc
`;

code = code.replace(regex, newSeed);

// Also look for oldSaveNhanSu at 706. Let's see what is at 706.
fs.writeFileSync('src/db/sqlite-service.ts', code, 'utf8');
