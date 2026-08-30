const fs = require('fs');

let pm = fs.readFileSync('src/components/Patients/PatientManager.tsx', 'utf8');
pm = pm.replace(/\s*\(p\.so_dien_thoai \|\| ''\)\.includes\(term\);/g, '');

const regexPhoneAddressCols = /<th className="py-4 px-4 font-semibold">SĐT<\/th>\s*<th className="py-4 px-4 font-semibold">Địa chỉ<\/th>/g;
pm = pm.replace(regexPhoneAddressCols, '');

const regexPhoneAddressTd = /<td className="py-3 px-4">[\s\S]*?<\/td>\s*<td className="py-3 px-4 text-slate-600 truncate max-w-\[150px\]">[\s\S]*?<\/td>/;
pm = pm.replace(regexPhoneAddressTd, '');

const regexPhoneAddressInputs = /<div>\s*<label className="block text-sm font-semibold text-slate-700 mb-2">Số điện thoại<\/label>[\s\S]*?<\/div>\s*<div>\s*<label className="block text-sm font-semibold text-slate-700 mb-2">Địa chỉ<\/label>[\s\S]*?<\/div>/;
pm = pm.replace(regexPhoneAddressInputs, '');

fs.writeFileSync('src/components/Patients/PatientManager.tsx', pm, 'utf8');
