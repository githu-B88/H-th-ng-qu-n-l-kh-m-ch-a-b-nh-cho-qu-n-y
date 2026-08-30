const fs = require('fs');
let ed = fs.readFileSync('src/components/Examination/ExamDesk.tsx', 'utf8');

const regexInputs = /<div>\s*<label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1\.5">\s*<MapPin className="w-3\.5 h-3\.5 text-sky-600" \/>\s*<span>Địa chỉ thường trú<\/span>\s*<\/label>\s*<input\s*type="text"\s*placeholder="VD: Số 123 Đường ABC, Phường X, Quận Y\.\.\."\s*value=\{newPatient\.dia_chi \|\| ''\}\s*onChange=\{\(e\) => setNewPatient\(\{ \.\.\.newPatient, dia_chi: e\.target\.value \}\)\}\s*className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-xs text-slate-800"\s*\/>\s*<\/div>/;

ed = ed.replace(regexInputs, '');

fs.writeFileSync('src/components/Examination/ExamDesk.tsx', ed, 'utf8');
