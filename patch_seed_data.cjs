const fs = require('fs');
let data = fs.readFileSync('src/db/seed-data.ts', 'utf8');

data = data.replace(/\s*so_dien_thoai: '.*',/g, '');
// Since we only want to remove dia_chi from NHAN_SU, not BAC_SI. Let's do it carefully.
let lines = data.split('\n');
let insideNhanSu = false;
let newLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const SEED_NHAN_SU')) insideNhanSu = true;
  if (lines[i].includes('export const MORE_NHAN_SU')) insideNhanSu = true;
  if (lines[i].includes('export const SEED_THUOC')) insideNhanSu = false;

  if (insideNhanSu) {
    if (lines[i].includes('dia_chi:')) continue; // Skip dia_chi inside nhan su
  }
  newLines.push(lines[i]);
}

fs.writeFileSync('src/db/seed-data.ts', newLines.join('\n'), 'utf8');
