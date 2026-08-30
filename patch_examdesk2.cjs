const fs = require('fs');
let ed = fs.readFileSync('src/components/Examination/ExamDesk.tsx', 'utf8');

const regexInputs = /<div>\s*<label className="block font-semibold text-slate-700 mb-1">Số điện thoại<\/label>\s*<input\s*type="text"\s*placeholder="VD: 0912345678"\s*value=\{newPatient\.so_dien_thoai \|\| ''\}\s*onChange=\{\(e\) => setNewPatient\(\{ \.\.\.newPatient, so_dien_thoai: e\.target\.value \}\)\}\s*className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"\s*\/>\s*<\/div>/;

ed = ed.replace(regexInputs, '');

const regexInputs2 = /<div className="mb-3">\s*<label className="block font-semibold text-slate-700 mb-1">Địa chỉ<\/label>\s*<input\s*type="text"\s*placeholder="VD: Khu tập thể\.\.\."\s*value=\{newPatient\.dia_chi \|\| ''\}\s*onChange=\{\(e\) => setNewPatient\(\{ \.\.\.newPatient, dia_chi: e\.target\.value \}\)\}\s*className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"\s*\/>\s*<\/div>/;

ed = ed.replace(regexInputs2, '');

fs.writeFileSync('src/components/Examination/ExamDesk.tsx', ed, 'utf8');
