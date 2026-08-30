const fs = require('fs');
let ed = fs.readFileSync('src/components/Examination/ExamDesk.tsx', 'utf8');

// We need to fetch donViCap1List and donViCap2List instead of just coQuanList.
ed = ed.replace(/const \[coQuanList, setCoQuanList\] = useState<CoQuan\[\]>\(\[\]\);/,
`const [donViCap1List, setDonViCap1List] = useState<any[]>([]);
  const [donViCap2List, setDonViCap2List] = useState<any[]>([]);`);

ed = ed.replace(/setCoQuanList\(sqliteService\.getCoQuanList\(\)\);/,
`setDonViCap1List((sqliteService as any).getDonViCap1List());
    setDonViCap2List((sqliteService as any).getDonViCap2List());`);

// Let's modify the newPatient state to include tu_ngay, den_ngay, id_don_vi_cap_1.
ed = ed.replace(/const \[newPatient, setNewPatient\] = useState<Partial<CanBo>>\(\{/g,
`const [newPatient, setNewPatient] = useState<Partial<CanBo & { id_don_vi_cap_1?: number, tu_ngay?: string, den_ngay?: string }>>({`);

// The newPatient structure in handleSubmit: we need to pass tu_ngay and den_ngay so that saveNhanSu can save BHYT dates.
// saveNhanSu handles tu_ngay and den_ngay properly.

const quickAddFormRegex = /<form onSubmit=\{handleQuickAddPatient\} className="space-y-4 text-xs">[\s\S]*?<\/form>/;

const newForm = `<form onSubmit={handleQuickAddPatient} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Họ và tên cán bộ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Văn Nam"
              value={newPatient.ho_ten || ''}
              onChange={(e) => setNewPatient({ ...newPatient, ho_ten: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày sinh</label>
              <input
                type="date"
                value={newPatient.ngay_sinh || ''}
                onChange={(e) => setNewPatient({ ...newPatient, ngay_sinh: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giới tính</label>
              <select
                value={newPatient.gioi_tinh || 'Nam'}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, gioi_tinh: e.target.value as 'Nam' | 'Nữ' | 'Khác' })
                }
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đơn vị cấp 1</label>
              <select
                value={newPatient.id_don_vi_cap_1 || ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  setNewPatient({ ...newPatient, id_don_vi_cap_1: val, id_don_vi: undefined, id_don_vi_cap_2: undefined });
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
                disabled={!newPatient.id_don_vi_cap_1}
                value={newPatient.id_don_vi_cap_2 || newPatient.id_don_vi || ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  setNewPatient({
                    ...newPatient,
                    id_don_vi_cap_2: val,
                    id_don_vi: val
                  });
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white disabled:opacity-50"
              >
                <option value="">-- Chọn đơn vị cấp 2 --</option>
                {donViCap2List
                  .filter(cq => cq.id_don_vi_cap_1 === newPatient.id_don_vi_cap_1)
                  .map((cq) => (
                    <option key={cq.id} value={cq.id}>
                      {cq.ten}
                    </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 mt-2">
            <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Thông tin thẻ BHYT
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã thẻ BHYT</label>
                <input
                  type="text"
                  placeholder="VD: HC40102..."
                  value={newPatient.ma_the_bhyt || newPatient.the_bhyt || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, ma_the_bhyt: e.target.value.toUpperCase(), the_bhyt: e.target.value.toUpperCase() })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono focus:bg-white uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Từ ngày</label>
                <input
                  type="date"
                  value={newPatient.tu_ngay || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, tu_ngay: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={newPatient.den_ngay || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, den_ngay: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddPatientModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold"
            >
              Lưu & Chọn Khám Ngay
            </button>
          </div>
        </form>`;

ed = ed.replace(quickAddFormRegex, newForm);
fs.writeFileSync('src/components/Examination/ExamDesk.tsx', ed, 'utf8');
