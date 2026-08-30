const fs = require('fs');
let code = fs.readFileSync('src/components/Patients/PatientManager.tsx', 'utf8');

// The original file uses `editingPatient` of type `Partial<NhanSu>`.
// Our new NhanSu type has `ma_the_bhyt`, `id_don_vi_cap_2`... oh wait, if I aliased it, I might need to add tu_ngay, den_ngay to editingPatient temporarily.
// Let's add them to the state. We can use a separate state or just put it in editingPatient.
// Instead of messing with string replacements for a complex UI, I will replace the entire Modal content.

const oldFormStart = '<form onSubmit={handleSavePatient} className="flex flex-col h-full">';
const oldFormEnd = '</form>';

const startIndex = code.indexOf(oldFormStart);
const endIndex = code.indexOf(oldFormEnd, startIndex) + oldFormEnd.length;

const newForm = `
        <form onSubmit={handleSavePatient} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="col-span-1 md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ và tên cán bộ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ và tên đầy đủ..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                  value={editingPatient.ho_ten || ''}
                  onChange={(e) =>
                    setEditingPatient({ ...editingPatient, ho_ten: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ngày sinh</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  value={editingPatient.ngay_sinh || ''}
                  onChange={(e) =>
                    setEditingPatient({ ...editingPatient, ngay_sinh: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Giới tính</label>
                <select
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  value={editingPatient.gioi_tinh || 'Nam'}
                  onChange={(e) =>
                    setEditingPatient({
                      ...editingPatient,
                      gioi_tinh: e.target.value as 'Nam' | 'Nữ' | 'Khác'
                    })
                  }
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100 space-y-4">
                  <h4 className="font-semibold text-sky-800 text-sm flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Đơn vị công tác
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-sm">Đơn vị cấp 1</label>
                      <select
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                        value={(editingPatient as any).id_don_vi_cap_1 || ''}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : '';
                          setEditingPatient({ ...editingPatient, id_don_vi_cap_1: val, id_don_vi: '' } as any);
                        }}
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
                      <label className="block font-semibold text-slate-700 mb-1 text-sm">Đơn vị cấp 2</label>
                      <select
                        disabled={!(editingPatient as any).id_don_vi_cap_1}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all disabled:opacity-50 disabled:bg-slate-100"
                        value={editingPatient.id_don_vi || ''}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            id_don_vi: e.target.value ? Number(e.target.value) : undefined
                          })
                        }
                      >
                        <option value="">-- Chọn đơn vị cấp 2 --</option>
                        {donViCap2List
                          .filter(cq => cq.id_don_vi_cap_1 === (editingPatient as any).id_don_vi_cap_1)
                          .map((cq) => (
                            <option key={cq.id} value={cq.id}>
                              {cq.ten}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cấp bậc</label>
                <input
                  type="text"
                  placeholder="VD: Thượng úy, Thiếu tá..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  value={editingPatient.cap_bac || ''}
                  onChange={(e) =>
                    setEditingPatient({ ...editingPatient, cap_bac: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chức vụ</label>
                <input
                  type="text"
                  placeholder="VD: Phó phòng, Chuyên viên..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  value={editingPatient.chuc_vu || ''}
                  onChange={(e) =>
                    setEditingPatient({ ...editingPatient, chuc_vu: e.target.value })
                  }
                />
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-4">
                  <h4 className="font-semibold text-emerald-800 text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Thông tin thẻ BHYT
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-sm">Mã thẻ BHYT</label>
                      <input
                        type="text"
                        placeholder="VD: HC40102..."
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                        value={editingPatient.the_bhyt || ''}
                        onChange={(e) =>
                          setEditingPatient({ ...editingPatient, the_bhyt: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-sm">Từ ngày</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        value={(editingPatient as any).tu_ngay || ''}
                        onChange={(e) =>
                          setEditingPatient({ ...editingPatient, tu_ngay: e.target.value } as any)
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-sm">Đến ngày</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        value={(editingPatient as any).den_ngay || ''}
                        onChange={(e) =>
                          setEditingPatient({ ...editingPatient, den_ngay: e.target.value } as any)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  placeholder="VD: 0912345678"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  value={editingPatient.so_dien_thoai || ''}
                  onChange={(e) =>
                    setEditingPatient({ ...editingPatient, so_dien_thoai: e.target.value })
                  }
                />
              </div>

            </div>

            <div className="mb-4">
              <label className="block font-semibold text-slate-700 mb-1">Địa chỉ thường trú</label>
              <input
                type="text"
                placeholder="VD: Khu tập thể cơ quan..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                value={editingPatient.dia_chi || ''}
                onChange={(e) =>
                  setEditingPatient({ ...editingPatient, dia_chi: e.target.value })
                }
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors shadow-sm"
            >
              Lưu Thông Tin
            </button>
          </div>
        </form>`;

code = code.substring(0, startIndex) + newForm + code.substring(endIndex);

// Let's modify handleSavePatient
const oldSave = `const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (sqliteService.saveNhanSu(editingPatient)) {
      setIsModalOpen(false);
      loadData();
    } else {
      alert('Có lỗi xảy ra khi lưu thông tin bệnh nhân!');
    }
  };`;

const newSave = `const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert old editingPatient mapping to new CanBo schema logic
    const payload = {
      ...editingPatient,
      id_don_vi_cap_2: editingPatient.id_don_vi,
      ma_the_bhyt: editingPatient.the_bhyt
    };
    
    // Let sqliteService.saveNhanSu handle the transaction of inserting the_bhyt first, then can_bo.
    // Our updated saveNhanSu handles ma_the_bhyt, tu_ngay, den_ngay natively!
    if (sqliteService.saveNhanSu(payload)) {
      setIsModalOpen(false);
      loadData();
    } else {
      alert('Có lỗi xảy ra khi lưu thông tin cán bộ!');
    }
  };`;

code = code.replace(oldSave, newSave);

// Let's modify handleEditPatient to load the BHYT dates and id_don_vi_cap_1
// When editing, we should fetch BHYT from DB to get tu_ngay, den_ngay.
// But sqliteService doesn't have an async fetch for this. Wait! It is sync.
const oldEdit = `const handleEditPatient = (p: NhanSu) => {
    setEditingPatient({ ...p });
    setIsModalOpen(true);
  };`;

const newEdit = `const handleEditPatient = (p: NhanSu) => {
    // Need to find id_don_vi_cap_1 from donViCap2List based on p.id_don_vi
    const cq = donViCap2List.find(d => d.id === p.id_don_vi);
    const id_don_vi_cap_1 = cq ? cq.id_don_vi_cap_1 : undefined;

    let tu_ngay = '';
    let den_ngay = '';
    if (p.the_bhyt) {
      const bhytInfo = (sqliteService as any).getTheBHYT(p.the_bhyt);
      if (bhytInfo) {
        tu_ngay = bhytInfo.tu_ngay;
        den_ngay = bhytInfo.den_ngay;
      }
    }

    setEditingPatient({ 
      ...p, 
      id_don_vi_cap_1,
      tu_ngay,
      den_ngay
    } as any);
    setIsModalOpen(true);
  };`;

code = code.replace(oldEdit, newEdit);

fs.writeFileSync('src/components/Patients/PatientManager.tsx', code, 'utf8');
