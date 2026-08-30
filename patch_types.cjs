const fs = require('fs');
let t = fs.readFileSync('src/types.ts', 'utf8');

t = t.replace(/ten_don_vi\?: string;/, 'ten_don_vi?: string;\n  ten_don_vi_cap_1?: string;');
t = t.replace(/ten_don_vi\?: string;/, 'ten_don_vi?: string;\n  ten_don_vi_cap_1?: string;');

fs.writeFileSync('src/types.ts', t, 'utf8');
