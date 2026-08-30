const fs = require('fs');
let cm = fs.readFileSync('src/components/Catalog/CatalogManager.tsx', 'utf8');

cm = cm.replace(/const \[coQuanList, setCoQuanList\] = useState<CoQuan\[\]>\(\[\]\);/, 
`const [coQuanList, setCoQuanList] = useState<CoQuan[]>([]);
  const [donViCap1List, setDonViCap1List] = useState<any[]>([]);`);

cm = cm.replace(/setCoQuanList\(sqliteService\.getCoQuanList\(\)\);/,
`setCoQuanList(sqliteService.getCoQuanList());
    setDonViCap1List((sqliteService as any).getDonViCap1List());`);

cm = cm.replace(/<th className="py-3 px-4 font-semibold">Tên Cơ Quan \/ Phòng Ban<\/th>/,
`<th className="py-3 px-4 font-semibold">Khối (Đơn vị cấp 1)</th>
                  <th className="py-3 px-4 font-semibold">Tên Cơ Quan / Phòng Ban</th>`);

cm = cm.replace(/<td className="py-2\.5 px-4">\s*<div className="font-bold text-slate-800">\{c\.ten_co_quan\}<\/div>\s*<\/td>/,
`<td className="py-2.5 px-4 font-semibold text-slate-600">
                            {donViCap1List.find(d => d.id === c.id_don_vi_cap_1)?.ten || '---'}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-bold text-slate-800">{c.ten_co_quan}</div>
                          </td>`);

cm = cm.replace(/<div>\s*<label className="block font-semibold text-slate-700 mb-1">\s*Tên cơ quan \/ phòng ban trực thuộc <span className="text-rose-500">\*<\/span>\s*<\/label>/,
`<div>
            <label className="block font-semibold text-slate-700 mb-1">
              Khối / Đơn vị cấp 1 trực thuộc <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={editingCoQuan.id_don_vi_cap_1 || ''}
              onChange={(e) => setEditingCoQuan({ ...editingCoQuan, id_don_vi_cap_1: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white mb-4"
            >
              <option value="">-- Chọn Khối --</option>
              {donViCap1List.map(d => (
                <option key={d.id} value={d.id}>{d.ten}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên cơ quan / phòng ban trực thuộc <span className="text-rose-500">*</span>
            </label>`);

fs.writeFileSync('src/components/Catalog/CatalogManager.tsx', cm, 'utf8');
