const fs = require('fs');
let t = fs.readFileSync('src/types.ts', 'utf8');

// replace all ten_don_vi_cap_1 with just one
t = t.replace(/ten_don_vi_cap_1\?: string;\n\s*ten_don_vi_cap_1\?: string;/g, 'ten_don_vi_cap_1?: string;');
fs.writeFileSync('src/types.ts', t, 'utf8');
