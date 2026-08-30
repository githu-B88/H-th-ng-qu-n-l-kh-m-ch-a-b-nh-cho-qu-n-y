const fs = require('fs');
let pm = fs.readFileSync('src/components/Patients/PatientManager.tsx', 'utf8');

pm = pm.replace(/theBhyt\.toLowerCase\(\)\.includes\(term\) \|\|/g, 'theBhyt.toLowerCase().includes(term);');

fs.writeFileSync('src/components/Patients/PatientManager.tsx', pm, 'utf8');
