const fs = require('fs');

// Patch PatientManager
let pm = fs.readFileSync('src/components/Patients/PatientManager.tsx', 'utf8');

pm = pm.replace(/const tenDonVi = p\.ten_don_vi \|\| donViCap2List\.find\(d => d\.id === \(p\.id_don_vi_cap_2 \|\| \(p as any\)\.id_don_vi\)\)\?\.ten;/,
`const d2 = donViCap2List.find(d => d.id === (p.id_don_vi_cap_2 || (p as any).id_don_vi));
const d1 = donViCap1List.find(d => d.id === d2?.id_don_vi_cap_1);
const tenDonViCap1 = p.ten_don_vi_cap_1 || d1?.ten;
const tenDonViCap2 = p.ten_don_vi || d2?.ten;
let fullDonVi = 'Chưa phân bổ';
if (tenDonViCap1 && tenDonViCap2) fullDonVi = \`\${tenDonViCap2} - \${tenDonViCap1}\`;
else if (tenDonViCap2) fullDonVi = tenDonViCap2;
else if (tenDonViCap1) fullDonVi = tenDonViCap1;`);

pm = pm.replace(/<span className="truncate">\{tenDonVi \|\| 'Chưa phân bổ'\}<\/span>/, 
`<span className="truncate" title={fullDonVi}>{fullDonVi}</span>`);

fs.writeFileSync('src/components/Patients/PatientManager.tsx', pm, 'utf8');

// Patch DoctorManager
let dm = fs.readFileSync('src/components/Doctors/DoctorManager.tsx', 'utf8');

dm = dm.replace(/<span>Đơn vị: <strong className="text-slate-800">\{bs\.ten_don_vi \|\| 'Cơ quan'\}<\/strong><\/span>/,
`<span>Đơn vị: <strong className="text-slate-800">{bs.ten_don_vi ? \`\${bs.ten_don_vi}\${bs.ten_don_vi_cap_1 ? \` - \${bs.ten_don_vi_cap_1}\` : ''}\` : 'Cơ quan'}</strong></span>`);

fs.writeFileSync('src/components/Doctors/DoctorManager.tsx', dm, 'utf8');
