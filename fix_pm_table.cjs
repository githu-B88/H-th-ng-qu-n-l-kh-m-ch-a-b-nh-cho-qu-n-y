const fs = require('fs');
let pm = fs.readFileSync('src/components/Patients/PatientManager.tsx', 'utf8');

pm = pm.replace(/\{tenDonVi \|\| '\-\-\-'\}<\/div>/g, '{fullDonVi || \'---\'}</div>');
pm = pm.replace(/\{tenDonVi \|\| '\-\-\-'\}/g, '{fullDonVi || \'---\'}');

fs.writeFileSync('src/components/Patients/PatientManager.tsx', pm, 'utf8');
