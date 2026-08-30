const fs = require('fs');
let pm = fs.readFileSync('src/components/Patients/PatientManager.tsx', 'utf8');

const regexInputs = /<div>\s*<label className="block font-semibold text-slate-700 mb-1">Số điện thoại<\/label>\s*<input\s*type="text"\s*placeholder="VD: 0912345678"\s*className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500\/20 focus:border-sky-500 transition-all"\s*value=\{editingPatient\.so_dien_thoai \|\| ''\}\s*onChange=\{\(e\) =>\s*setEditingPatient\(\{ \.\.\.editingPatient, so_dien_thoai: e\.target\.value \}\)\s*\}\s*\/>\s*<\/div>/;

pm = pm.replace(regexInputs, '');

const regexInputs2 = /<div className="mb-4">\s*<label className="block font-semibold text-slate-700 mb-1">Địa chỉ thường trú<\/label>\s*<input\s*type="text"\s*placeholder="VD: Khu tập thể cơ quan\.\.\."\s*className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500\/20 focus:border-sky-500 transition-all"\s*value=\{editingPatient\.dia_chi \|\| ''\}\s*onChange=\{\(e\) =>\s*setEditingPatient\(\{ \.\.\.editingPatient, dia_chi: e\.target\.value \}\)\s*\}\s*\/>\s*<\/div>/;

pm = pm.replace(regexInputs2, '');

fs.writeFileSync('src/components/Patients/PatientManager.tsx', pm, 'utf8');
