const fs = require('fs');

// 1. Fix seed-data.ts
let seed = fs.readFileSync('src/db/seed-data.ts', 'utf8');
seed = seed.replace(/id_don_vi:/g, 'id_don_vi_cap_2:');

// Replace SEED_CO_QUAN array with mapped don vi cap 2
// Since the error says missing id_don_vi_cap_1, we just add it to all SEED_CO_QUAN items
seed = seed.replace(/ten:/g, 'id_don_vi_cap_1: 1, ten:');
// But wait, the BacSi error says ma_the_bhyt does not exist on BacSi. Let's revert ma_the_bhyt for BacSi
seed = seed.replace(/ma_the_bhyt: 'BS/g, 'the_bhyt: \'BS');
fs.writeFileSync('src/db/seed-data.ts', seed, 'utf8');

// 2. Fix PatientManager.tsx
let patient = fs.readFileSync('src/components/Patients/PatientManager.tsx', 'utf8');
patient = patient.replace(/\(sqliteService as any\)\.notifyListeners\(\)/g, 'sqliteService.notifyListeners()');
patient = patient.replace(/sqliteService\.notifyListeners\(\)/g, 'sqliteService.notifyListeners()');
fs.writeFileSync('src/components/Patients/PatientManager.tsx', patient, 'utf8');

// 3. Fix sqlite-service.ts
let sqlite = fs.readFileSync('src/db/sqlite-service.ts', 'utf8');
sqlite = sqlite.replace(/private notifyListeners = \(\) => \{/g, 'public notifyListeners = () => {');
sqlite = sqlite.replace(/private notifyListeners\(\) \{/g, 'public notifyListeners() {');
fs.writeFileSync('src/db/sqlite-service.ts', sqlite, 'utf8');

