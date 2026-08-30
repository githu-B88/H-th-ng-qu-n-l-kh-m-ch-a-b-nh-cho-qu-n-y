const fs = require('fs');
let s = fs.readFileSync('src/components/Patients/PatientManager.tsx', 'utf8');

s = s.replace(/if \(sqliteService\.saveNhanSu\(editingPatient\)\) \{/,
`const savedId = sqliteService.saveNhanSu(editingPatient);
    if (savedId) {
      await (sqliteService as any).persistDatabase?.() || await Promise.resolve();`);

fs.writeFileSync('src/components/Patients/PatientManager.tsx', s, 'utf8');

let s2 = fs.readFileSync('src/components/Doctors/DoctorManager.tsx', 'utf8');
s2 = s2.replace(/const handleSaveDoctor = \(e: React\.FormEvent\) => \{/,
`const handleSaveDoctor = async (e: React.FormEvent) => {`);

s2 = s2.replace(/if \(sqliteService\.saveBacSi\(editingDoctor\)\) \{/,
`if (sqliteService.saveBacSi(editingDoctor)) {
      await (sqliteService as any).persistDatabase?.() || await Promise.resolve();`);

fs.writeFileSync('src/components/Doctors/DoctorManager.tsx', s2, 'utf8');
