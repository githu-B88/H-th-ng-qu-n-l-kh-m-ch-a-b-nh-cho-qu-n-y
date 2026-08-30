const fs = require('fs');

let seed = fs.readFileSync('src/db/seed-data.ts', 'utf8');

// The errors say:
// 1. 'id_don_vi_cap_2' does not exist in type 'BacSi'.
// Let's change id_don_vi_cap_2 back to id_don_vi for BacSi.
// Actually, SEED_BAC_SI is declared around line 13.
const bacSiStart = seed.indexOf('export const SEED_BAC_SI');
const bacSiEnd = seed.indexOf('export const SEED_NHAN_SU');
let bacSiBlock = seed.substring(bacSiStart, bacSiEnd);
bacSiBlock = bacSiBlock.replace(/id_don_vi_cap_2:/g, 'id_don_vi:');
seed = seed.substring(0, bacSiStart) + bacSiBlock + seed.substring(bacSiEnd);

// 2. 'the_bhyt' does not exist in type 'CanBo'.
// CanBo needs ma_the_bhyt instead of the_bhyt.
const canBoStart = seed.indexOf('export const SEED_NHAN_SU');
const canBoEnd = seed.indexOf('export const SEED_THUOC');
let canBoBlock = seed.substring(canBoStart, canBoEnd);
canBoBlock = canBoBlock.replace(/the_bhyt:/g, 'ma_the_bhyt:');
seed = seed.substring(0, canBoStart) + canBoBlock + seed.substring(canBoEnd);

// There is MORE_NHAN_SU at the end of the file.
const moreNhanSuStart = seed.indexOf('export const MORE_NHAN_SU');
if (moreNhanSuStart !== -1) {
  const moreNhanSuEnd = seed.indexOf('export const MORE_THUOC', moreNhanSuStart);
  let moreBlock = seed.substring(moreNhanSuStart, moreNhanSuEnd > -1 ? moreNhanSuEnd : seed.length);
  moreBlock = moreBlock.replace(/the_bhyt:/g, 'ma_the_bhyt:');
  seed = seed.substring(0, moreNhanSuStart) + moreBlock + (moreNhanSuEnd > -1 ? seed.substring(moreNhanSuEnd) : '');
}

fs.writeFileSync('src/db/seed-data.ts', seed, 'utf8');
