const fs = require('fs');
let s = fs.readFileSync('src/db/sqlite-service.ts', 'utf8');

s = s.replace(/import \{\n  MORE_NHAN_SU,/, 'import {\\n  SEED_DON_VI_CAP_1,\\n  MORE_NHAN_SU,');

fs.writeFileSync('src/db/sqlite-service.ts', s, 'utf8');
