const fs = require('fs');
let serverTs = fs.readFileSync('server.ts', 'utf-8');

serverTs = serverTs.replace(
    'const insert = db.prepare("INSERT INTO bac_si (ho_ten, chuc_vu, id_don_vi_cap_1, role) VALUES (?, ?, ?, ?)");',
    'const insert = db.prepare("INSERT INTO bac_si (ho_ten, gioi_tinh, id_don_vi, chuyen_mon) VALUES (?, ?, ?, ?)");'
).replace(
    'insert.run("Nguyễn Văn A", "Bác sĩ trưởng", 1, "ADMIN");',
    'insert.run("Nguyễn Văn A", "Nam", 1, "Bác sĩ trưởng");'
);

fs.writeFileSync('server.ts', serverTs);
console.log('Patched server seed data');
