const fs = require('fs');

let pm = fs.readFileSync('src/components/Patients/PatientManager.tsx', 'utf8');

// Header
pm = pm.replace(/<th className="py-3 px-4 font-semibold text-sm">Thông tin liên hệ<\/th>\n/, '');

// Td
const tdRegex = /<td className="py-3 px-4">\s*<div className="flex flex-col gap-1">\s*\{p\.so_dien_thoai \? \([\s\S]*?<\/td>\n/;
pm = pm.replace(tdRegex, '');

// Inputs
const inputsRegex = /<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">\s*<div>\s*<label className="block font-semibold text-slate-700 mb-1">Số điện thoại<\/label>[\s\S]*?<\/div>\s*<\/div>\s*<div className="mb-4">\s*<label className="block font-semibold text-slate-700 mb-1">Địa chỉ thường trú<\/label>[\s\S]*?<\/div>\n/;
pm = pm.replace(inputsRegex, '');

// Filter text
pm = pm.replace(/Tên, SĐT, Mã thẻ BHYT/, 'Tên, Mã thẻ BHYT');

fs.writeFileSync('src/components/Patients/PatientManager.tsx', pm, 'utf8');
