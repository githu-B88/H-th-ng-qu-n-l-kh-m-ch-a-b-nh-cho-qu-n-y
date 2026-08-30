const fs = require('fs');
let s = fs.readFileSync('src/db/sqlite-service.ts', 'utf8');

// Insert a migration right after this.createTables() in init()
s = s.replace(/this\.createTables\(\);/,
`this.createTables();
        
        // Migration: ensure don_vi_cap_1 is seeded if it has old hardcoded data
        const check = this.db.exec("SELECT COUNT(*) as count FROM don_vi_cap_1");
        if (check.length > 0 && Number(check[0].values[0][0]) < 3) {
           this.db.run("DELETE FROM don_vi_cap_1");
           this.db.run("DELETE FROM don_vi_cap_2");
           for (const cap1 of SEED_DON_VI_CAP_1) {
             this.db.run("INSERT OR IGNORE INTO don_vi_cap_1 (id, ten, ghi_chu) VALUES (?, ?, ?)",
               [cap1.id, cap1.ten, cap1.ghi_chu || '']
             );
           }
           for (const cq of SEED_CO_QUAN) {
             this.db.run("INSERT OR IGNORE INTO don_vi_cap_2 (id, id_don_vi_cap_1, ten, ghi_chu) VALUES (?, ?, ?, ?)",
               [cq.id, cq.id_don_vi_cap_1 || 1, cq.ten, cq.ghi_chu || '']
             );
           }
        }
`);

fs.writeFileSync('src/db/sqlite-service.ts', s, 'utf8');
