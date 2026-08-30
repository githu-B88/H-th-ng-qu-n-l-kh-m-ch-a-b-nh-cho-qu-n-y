const fs = require('fs');
let s = fs.readFileSync('src/db/sqlite-service.ts', 'utf8');

// Add import SEED_DON_VI_CAP_1
s = s.replace(/import \{ SEED_CO_QUAN, SEED_BAC_SI, SEED_NHAN_SU, SEED_THUOC, SEED_VAT_TU, SEED_DICH_VU_KT, SEED_MAU_BENH, SEED_NGUOI_DUNG, MORE_NHAN_SU, MORE_THUOC, MORE_VAT_TU, MORE_DICH_VU_KT \} from '\.\/seed-data';/,
`import { SEED_DON_VI_CAP_1, SEED_CO_QUAN, SEED_BAC_SI, SEED_NHAN_SU, SEED_THUOC, SEED_VAT_TU, SEED_DICH_VU_KT, SEED_MAU_BENH, SEED_NGUOI_DUNG, MORE_NHAN_SU, MORE_THUOC, MORE_VAT_TU, MORE_DICH_VU_KT } from './seed-data';`);

s = s.replace(/this\.db\.run\("INSERT OR IGNORE INTO don_vi_cap_1 \(id, ten, ghi_chu\) VALUES \(1, 'Cơ quan trung tâm', ''\)"\);\n\s*this\.db\.run\("INSERT OR IGNORE INTO don_vi_cap_1 \(id, ten, ghi_chu\) VALUES \(2, 'Khối cơ sở', ''\)"\);/,
`for (const cap1 of SEED_DON_VI_CAP_1) {
      this.db.run("INSERT OR IGNORE INTO don_vi_cap_1 (id, ten, ghi_chu) VALUES (?, ?, ?)",
        [cap1.id, cap1.ten, cap1.ghi_chu || '']
      );
    }`);

fs.writeFileSync('src/db/sqlite-service.ts', s, 'utf8');
