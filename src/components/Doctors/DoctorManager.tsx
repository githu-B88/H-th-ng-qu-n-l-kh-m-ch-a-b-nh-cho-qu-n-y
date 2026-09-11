import React, { useState, useEffect } from 'react';
import { BacSi, CoQuan, DonViCap1, DonViCap2 } from '../../types';
import { sqliteService } from '../../db/sqlite-service';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Search,
  Stethoscope,
  Building,
  CreditCard,
  Phone,
  Mail,
  Award
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

export const DoctorManager: React.FC = () => {
  const [bacSiList, setBacSiList] = useState<BacSi[]>([]);
  const [donViCap1List, setDonViCap1List] = useState<DonViCap1[]>([]);
  const [donViCap2List, setDonViCap2List] = useState<DonViCap2[]>([]);
  const [search, setSearch] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Partial<BacSi & { id_don_vi_cap_1?: number }>>({
    gioi_tinh: 'Nam'
  });

  const loadData = () => {
    setBacSiList(sqliteService.getBacSiList());
    setDonViCap1List((sqliteService as any).getDonViCap1List());
    setDonViCap2List((sqliteService as any).getDonViCap2List());
  };

  useEffect(() => {
    loadData();
    const unsub = sqliteService.subscribe(loadData);
    return unsub;
  }, []);

  const handleOpenAdd = () => {
    setEditingDoctor({
      gioi_tinh: 'Nam'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bs: BacSi) => {
    let id_don_vi_cap_1 = (bs as any).id_don_vi_cap_1;
    if (!id_don_vi_cap_1) {
      let cq = donViCap2List.find(d => d.id === bs.id_don_vi);
      id_don_vi_cap_1 = cq ? cq.id_don_vi_cap_1 : undefined;
    }
    setEditingDoctor({ ...bs, id_don_vi_cap_1 });
    setIsModalOpen(true);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor.ho_ten?.trim()) return;

    try {
      const res = sqliteService.saveBacSi(editingDoctor);
      if (res && !res.success) {
        alert(res.error || 'Không thể lưu bác sĩ. Vui lòng kiểm tra lại thông tin.');
        return;
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert('Lỗi: ' + (err.message || err));
    }
  };

  const handleDeleteDoctor = (id: number) => {
    if (bacSiList.length <= 1) {
      alert('Phòng khám cần tối thiểu ít nhất 1 Bác sĩ / Y sĩ!');
      return;
    }
    const docToDelete = bacSiList.find(b => b.id === id);
    const name = docToDelete ? docToDelete.ho_ten : 'Bác sĩ này';
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${name}"? Các hồ sơ khám liên quan sẽ được tự động chuyển giao an toàn cho bác sĩ khác.`)) {
      const res = sqliteService.deleteBacSi(id);
      if (res && !res.success) {
        alert(res.error || 'Không thể xóa bác sĩ!');
        return;
      }
      loadData();
    }
  };

  const filtered = bacSiList.filter((b) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      b.ho_ten.toLowerCase().includes(term) ||
      (b.chuyen_mon && b.chuyen_mon.toLowerCase().includes(term)) ||
      (b.the_bhyt && b.the_bhyt.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Danh Sách Bác Sĩ & Y Sĩ Phòng Khám ({bacSiList.length} nhân sự)
            </h3>
            <p className="text-xs text-slate-500">
              Quản lý bác sĩ khám, chuyên khoa y tế, chữ ký đơn thuốc và mã hành nghề
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm Bác Sĩ Mới</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Tìm bác sĩ theo tên, chuyên môn, số thẻ BHYT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:bg-white"
        />
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((bs) => (
          <div
            key={bs.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
                    {bs.ho_ten.replace('BS. ', '').replace('ThS. ', '').replace('Y sĩ ', '').charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{bs.ho_ten}</h4>
                    <span className="text-xs text-sky-700 font-semibold flex items-center gap-1 mt-0.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      {bs.chuyen_mon || 'Bác sĩ Đa khoa'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Đơn vị: <strong className="text-slate-800">{bs.ten_don_vi ? `${bs.ten_don_vi}${bs.ten_don_vi_cap_1 ? ` - ${bs.ten_don_vi_cap_1}` : ''}` : 'Cơ quan'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Mã thẻ BHYT: <strong className="font-mono text-slate-800">{bs.the_bhyt || 'Chưa cập nhật'}</strong></span>
                </div>
                
                {bs.ghi_chu && (
                  <div className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded">
                    "{bs.ghi_chu}"
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleOpenEdit(bs)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Sửa</span>
              </button>
              <button
                onClick={() => handleDeleteDoctor(bs.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoctor.id ? 'Chỉnh Sửa Thông Tin Bác Sĩ' : 'Thêm Mới Bác Sĩ / Y Sĩ'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveDoctor} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Họ và tên bác sĩ / chức danh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: BS. CKI Nguyễn Văn A"
              value={editingDoctor.ho_ten || ''}
              onChange={(e) => setEditingDoctor({ ...editingDoctor, ho_ten: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chuyên môn</label>
              <input
                type="text"
                placeholder="VD: Bác sĩ Nội Đa Khoa..."
                value={editingDoctor.chuyen_mon || ''}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, chuyen_mon: e.target.value })
                }
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giới tính</label>
              <select
                value={editingDoctor.gioi_tinh || 'Nam'}
                onChange={(e) =>
                  setEditingDoctor({
                    ...editingDoctor,
                    gioi_tinh: e.target.value as 'Nam' | 'Nữ'
                  })
                }
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số thẻ BHYT</label>
              <input
                type="text"
                placeholder="VD: DN4010..."
                value={editingDoctor.the_bhyt || ''}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, the_bhyt: e.target.value })
                }
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày sinh</label>
              <input
                type="date"
                value={editingDoctor.ngay_sinh || ''}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, ngay_sinh: e.target.value })
                }
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ghi chú</label>
            <textarea
              rows={2}
              placeholder="Kinh nghiệm, ca trực..."
              value={editingDoctor.ghi_chu || ''}
              onChange={(e) =>
                setEditingDoctor({ ...editingDoctor, ghi_chu: e.target.value })
              }
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold"
            >
              {editingDoctor.id ? 'Cập Nhật' : 'Lưu Bác Sĩ'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
