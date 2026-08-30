const fs = require('fs');

let seed = fs.readFileSync('src/db/seed-data.ts', 'utf8');

// Undo ho_id_don_vi_cap_1: 1, ten: back to ho_ten:
seed = seed.replace(/ho_id_don_vi_cap_1: 1, ten/g, 'ho_ten');

// Undo id_don_vi_cap_1: 1, ten: back to ten: for everything EXCEPT SEED_CO_QUAN
// Since I already manually fixed SEED_CO_QUAN in fix_final.cjs (I replaced the whole block),
// Any other id_don_vi_cap_1: 1, ten: must be wrong!
seed = seed.replace(/id_don_vi_cap_1: 1, ten/g, 'ten');

// Wait, the block I replaced for SEED_CO_QUAN had id_don_vi_cap_1: 1, ten: ...
// If I replace it globally, I will break SEED_CO_QUAN again.
// Let's replace globally and then explicitly fix SEED_CO_QUAN again.

fs.writeFileSync('src/db/seed-data.ts', seed, 'utf8');
