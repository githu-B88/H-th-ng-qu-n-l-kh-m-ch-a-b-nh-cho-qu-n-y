const fs = require('fs');
let pp = fs.readFileSync('src/components/Examination/PrescriptionPrint.tsx', 'utf8');

const regex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 pt-1 border-t border-slate-200\/60 print:border-slate-200">\s*<div>\s*<span className="text-slate-500">Điện thoại:<\/span>\{' '\}\s*<span>\{record\.so_dien_thoai_nhan_su \|\| '---\'}<\/span>\s*<\/div>\s*<div>\s*<span className="text-slate-500">Địa chỉ:<\/span>\{' '\}\s*<span>\{record\.dia_chi_nhan_su \|\| 'Cơ quan'\}<\/span>\s*<\/div>\s*<\/div>/;

pp = pp.replace(regex, '');
fs.writeFileSync('src/components/Examination/PrescriptionPrint.tsx', pp, 'utf8');
