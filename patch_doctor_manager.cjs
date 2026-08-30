const fs = require('fs');
let dm = fs.readFileSync('src/components/Doctors/DoctorManager.tsx', 'utf8');

dm = dm.replace(/import \{ BacSi, CoQuan \} from '\.\.\/\.\.\/types';/, "import { BacSi, CoQuan, DonViCap1, DonViCap2 } from '../../types';");

dm = dm.replace(/const \[coQuanList, setCoQuanList\] = useState<CoQuan\[\]>\(\[\]\);/, 
`const [donViCap1List, setDonViCap1List] = useState<DonViCap1[]>([]);
  const [donViCap2List, setDonViCap2List] = useState<DonViCap2[]>([]);`);

dm = dm.replace(/setCoQuanList\(sqliteService\.getCoQuanList\(\)\);/g, 
`setDonViCap1List((sqliteService as any).getDonViCap1List());
    setDonViCap2List((sqliteService as any).getDonViCap2List());`);

// When editing doctor, we need id_don_vi_cap_1 mapped from id_don_vi (which maps to id_don_vi_cap_2).
dm = dm.replace(/const \[editingDoctor, setEditingDoctor\] = useState<Partial<BacSi>>\(\{/g, 
`const [editingDoctor, setEditingDoctor] = useState<Partial<BacSi & { id_don_vi_cap_1?: number }>>({`);

dm = dm.replace(/const handleOpenEdit = \(bs: BacSi\) => \{\n\s*setEditingDoctor\(bs\);\n\s*setIsModalOpen\(true\);\n\s*\};/, 
`const handleOpenEdit = (bs: BacSi) => {
    let cq = donViCap2List.find(d => d.id === bs.id_don_vi);
    const id_don_vi_cap_1 = cq ? cq.id_don_vi_cap_1 : undefined;
    setEditingDoctor({ ...bs, id_don_vi_cap_1 });
    setIsModalOpen(true);
  };`);

// Remove dia_chi rendering in list
dm = dm.replace(/\{bs\.dia_chi && \(\s*<div className="text-\[11px\] text-slate-500 truncate">\s*Địa chỉ: \{bs\.dia_chi\}\s*<\/div>\s*\)\}/, '');

// Replace dia chi input and co quan select with Cap 1 and Cap 2 selects
dm = dm.replace(/<div>\s*<label className="block font-semibold text-slate-700 mb-1">Đơn vị trực thuộc<\/label>\s*<select\s*value=\{editingDoctor\.id_don_vi \|\| ''\}\s*onChange=\{\(e\) =>\s*setEditingDoctor\(\{\s*\.\.\.editingDoctor,\s*id_don_vi: e\.target\.value \? Number\(e\.target\.value\) : undefined\s*\}\)\s*\}\s*className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"\s*>\s*<option value="">-- Chọn đơn vị \/ phòng ban --<\/option>\s*\{coQuanList\.map\(\(cq\) => \(\s*<option key=\{cq\.id\} value=\{cq\.id\}>\s*\{cq\.ten_co_quan\}\s*<\/option>\s*\)\)\}\s*<\/select>\s*<\/div>\s*<div>\s*<label className="block font-semibold text-slate-700 mb-1">Địa chỉ<\/label>\s*<input\s*type="text"\s*placeholder="Địa chỉ liên hệ\.\.\."\s*value=\{editingDoctor\.dia_chi \|\| ''\}\s*onChange=\{\(e\) =>\s*setEditingDoctor\(\{ \.\.\.editingDoctor, dia_chi: e\.target\.value \}\)\s*\}\s*className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"\s*\/>\s*<\/div>/, 
`<div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đơn vị cấp 1</label>
              <select
                value={editingDoctor.id_don_vi_cap_1 || ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  setEditingDoctor({ ...editingDoctor, id_don_vi_cap_1: val, id_don_vi: undefined });
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              >
                <option value="">-- Chọn đơn vị cấp 1 --</option>
                {donViCap1List.map((cq) => (
                  <option key={cq.id} value={cq.id}>
                    {cq.ten}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đơn vị cấp 2</label>
              <select
                disabled={!editingDoctor.id_don_vi_cap_1}
                value={editingDoctor.id_don_vi || ''}
                onChange={(e) =>
                  setEditingDoctor({
                    ...editingDoctor,
                    id_don_vi: e.target.value ? Number(e.target.value) : undefined
                  })
                }
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white disabled:opacity-50"
              >
                <option value="">-- Chọn đơn vị cấp 2 --</option>
                {donViCap2List
                  .filter(cq => cq.id_don_vi_cap_1 === editingDoctor.id_don_vi_cap_1)
                  .map((cq) => (
                    <option key={cq.id} value={cq.id}>
                      {cq.ten}
                    </option>
                ))}
              </select>
            </div>
          </div>`);

fs.writeFileSync('src/components/Doctors/DoctorManager.tsx', dm, 'utf8');
