import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { CanBo, DonViCap1, DonViCap2, HoSoKham } from '../../types';
import { sqliteService } from '../../db/sqlite-service';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  History,
  Phone,
  CreditCard,
  Building,
  UserCheck,
  Stethoscope,
  X,
  FileDown,
  Loader2,
  Upload,
  Eye
} from 'lucide-react';
import { exportBangKeToDocx } from '../../utils/exportBangKeDocx';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

interface PatientManagerProps {
  onStartExamForPatient: (patientId: number) => void;
  initialSelectedPatientIdForHistory?: number | null;
}

export const PatientManager: React.FC<PatientManagerProps> = ({
  onStartExamForPatient,
  initialSelectedPatientIdForHistory
}) => {
  const [patients, setPatients] = useState<CanBo[]>([]);
  const [donViCap1List, setDonViCap1List] = useState<DonViCap1[]>([]);
  const [donViCap2List, setDonViCap2List] = useState<DonViCap2[]>([]);
  const [search, setSearch] = useState('');
  const [filterDonViCap1, setFilterDonViCap1] = useState<number | ''>('');
  const [filterDonViCap2, setFilterDonViCap2] = useState<number | ''>('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Partial<CanBo & { id_don_vi_cap_1?: number, tu_ngay?: string, den_ngay?: string }>>({
    gioi_tinh: 'Nam'
  });

  // History Modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyPatient, setHistoryPatient] = useState<CanBo | null>(null);
  const [patientHistory, setPatientHistory] = useState<HoSoKham[]>([]);

  // Excel Import State
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadData();
    const fetchDonVi = async () => {
      try {
        const list1 = await (sqliteService as any).getDonViCap1List();
        setDonViCap1List(list1);
        const list2 = await (sqliteService as any).getDonViCap2List();
        setDonViCap2List(list2);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDonVi();

    const unsubscribe = sqliteService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (initialSelectedPatientIdForHistory) {
      const p = sqliteService.getNhanSuList().find(x => x.id === initialSelectedPatientIdForHistory);
      if (p) {
        handleViewHistory(p);
      }
    }
  }, [initialSelectedPatientIdForHistory]);

  const loadData = () => {
    setPatients(sqliteService.getNhanSuList());
    setDonViCap1List(sqliteService.getDonViCap1List());
    setDonViCap2List(sqliteService.getDonViCap2List());
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const savedId = sqliteService.saveNhanSu(editingPatient);
    if (savedId) {
      await sqliteService.persistDatabase();
      setIsModalOpen(false);
      loadData();
    } else {
      alert('Có lỗi xảy ra khi lưu thông tin cán bộ!');
    }
  };

  const handleEditPatient = (p: CanBo) => {
    let cq = donViCap2List.find(d => d.id === p.id_don_vi_cap_2);
    // Backward compatibility for id_don_vi
    if (!cq && (p as any).id_don_vi) {
        cq = donViCap2List.find(d => d.id === (p as any).id_don_vi);
    }
    const id_don_vi_cap_1 = cq ? cq.id_don_vi_cap_1 : undefined;

    let tu_ngay = '';
    let den_ngay = '';
    if (p.ma_the_bhyt) {
      const bhytInfo = (sqliteService as any).getTheBHYT(p.ma_the_bhyt);
      if (bhytInfo) {
        tu_ngay = bhytInfo.tu_ngay;
        den_ngay = bhytInfo.den_ngay;
      }
    } else if ((p as any).the_bhyt) {
      const bhytInfo = (sqliteService as any).getTheBHYT((p as any).the_bhyt);
      if (bhytInfo) {
        tu_ngay = bhytInfo.tu_ngay;
        den_ngay = bhytInfo.den_ngay;
      }
    }

    setEditingPatient({ 
      ...p, 
      id_don_vi_cap_1,
      id_don_vi_cap_2: cq?.id,
      ma_the_bhyt: p.ma_the_bhyt || (p as any).the_bhyt,
      tu_ngay,
      den_ngay
    });
    setIsModalOpen(true);
  };

  const handleDeletePatient = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cán bộ này? Không thể khôi phục.')) {
      if ((sqliteService as any).run("DELETE FROM can_bo WHERE id = ?", [id]).success) {
        (sqliteService as any).notify();
        loadData();
      } else {
        alert('Không thể xóa cán bộ do có dữ liệu liên quan (Hồ sơ khám).');
      }
    }
  };

  const handleViewHistory = (p: CanBo) => {
    setHistoryPatient(p);
    const hs = sqliteService.getHoSoKhamList().filter(h => h.id_nhan_su === p.id);
    setPatientHistory(hs);
    setIsHistoryModalOpen(true);
  };

  const handleDownloadTemplate = () => {
    const header = ['STT', 'Họ tên', 'Ngày sinh (DD/MM/YYYY)', 'Giới tính', 'Cấp bậc', 'Chức vụ', 'Đơn vị cấp 1', 'Đơn vị cấp 2', 'Mã thẻ BHYT', 'BHYT Từ ngày (DD/MM/YYYY)', 'BHYT Đến ngày (DD/MM/YYYY)'];
    const data = [
      [1, 'Nguyễn Văn A', '15/05/1990', 'Nam', 'Thượng úy', 'Trợ lý', 'Phòng Tham mưu Vùng', 'Ban Tác chiến', 'HC4010212345678', '01/01/2026', '31/12/2026']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CanBo");
    XLSX.writeFile(wb, "Mau_Import_Can_Bo.xlsx");
  };

  const parseDateToYMD = (dateStr?: string) => {
    if (!dateStr) return null;
    const str = dateStr.toString().trim();
    const parts = str.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return null;
  };

  const parseExcelDate = (excelDate: any) => {
    if (excelDate === null || excelDate === undefined || excelDate === '') return null;
    if (typeof excelDate === 'number') {
      const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
      return date.toISOString().split('T')[0];
    }
    return parseDateToYMD(excelDate);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      if (rows.length <= 1) {
        alert('File không có dữ liệu');
        setIsImporting(false);
        e.target.value = '';
        return;
      }

      let successCount = 0;
      
      const cap1List = await (sqliteService as any).getDonViCap1List();
      const cap2List = await (sqliteService as any).getDonViCap2List();
      const existingPatients = sqliteService.getNhanSuList();

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || !row[1]) continue; 

        const hoTen = row[1]?.toString().trim();
        const ngaySinh = parseExcelDate(row[2]);
        const gioiTinh = row[3]?.toString().trim() === 'Nữ' ? 'Nữ' : 'Nam';
        const capBac = row[4]?.toString().trim() || '';
        const chucVu = row[5]?.toString().trim() || '';
        const donViCap1Ten = row[6]?.toString().trim() || 'Phòng Tham mưu Vùng';
        const donViCap2Ten = row[7]?.toString().trim() || 'Ban Tác chiến';
        const maTheBhyt = row[8]?.toString().trim() || '';
        const tuNgay = parseExcelDate(row[9]);
        const denNgay = parseExcelDate(row[10]);

        let idCap1 = cap1List.find((x: any) => x.ten?.toLowerCase() === donViCap1Ten.toLowerCase())?.id;
        if (!idCap1) {
          const res1 = (sqliteService as any).run("INSERT INTO don_vi_cap_1 (ten) VALUES (?)", [donViCap1Ten]);
          idCap1 = res1.lastInsertRowId;
          cap1List.push({ id: idCap1, ten: donViCap1Ten });
        }

        let idCap2 = cap2List.find((x: any) => x.ten?.toLowerCase() === donViCap2Ten.toLowerCase() && x.id_don_vi_cap_1 === idCap1)?.id;
        if (!idCap2) {
          const res2 = (sqliteService as any).run("INSERT INTO don_vi_cap_2 (id_don_vi_cap_1, ten) VALUES (?, ?)", [idCap1, donViCap2Ten]);
          idCap2 = res2.lastInsertRowId;
          cap2List.push({ id: idCap2, id_don_vi_cap_1: idCap1, ten: donViCap2Ten });
        }

        let existingPatient = null;
        if (maTheBhyt) {
          existingPatient = existingPatients.find((p: any) => p.ma_the_bhyt === maTheBhyt || p.the_bhyt === maTheBhyt);
        }

        const patientData = {
          id: existingPatient?.id,
          ho_ten: hoTen,
          ngay_sinh: ngaySinh,
          gioi_tinh: gioiTinh,
          id_don_vi_cap_2: idCap2,
          ma_the_bhyt: maTheBhyt,
          cap_bac: capBac,
          chuc_vu: chucVu,
          tu_ngay: tuNgay,
          den_ngay: denNgay
        };

        const savedId = sqliteService.saveNhanSu(patientData);
        if (savedId) {
          successCount++;
          if (!existingPatient) {
            existingPatients.push({ ...patientData, id: savedId } as any);
          }
        }
      }

      await (sqliteService as any).persistDatabase?.() || await Promise.resolve();
      alert(`Nhập thành công ${successCount} cán bộ!`);
      loadData();
      
      const list1 = await (sqliteService as any).getDonViCap1List();
      setDonViCap1List(list1);
      const list2 = await (sqliteService as any).getDonViCap2List();
      setDonViCap2List(list2);

    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng file.');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const filteredPatients = patients.filter((p) => {
    const term = search.toLowerCase().trim();
    const theBhyt = (p.ma_the_bhyt || (p as any).the_bhyt || '').toLowerCase();
    const hoTen = (p.ho_ten || '').toLowerCase();
    const capBac = (p.cap_bac || '').toLowerCase();
    const chucVu = (p.chuc_vu || '').toLowerCase();
    
    const d2 = donViCap2List.find(d => d.id === (p.id_don_vi_cap_2 || (p as any).id_don_vi));
    const d1 = donViCap1List.find(d => d.id === (d2?.id_don_vi_cap_1 || (p as any).id_don_vi_cap_1));
    const tenD2 = (p.ten_don_vi || d2?.ten || '').toLowerCase();
    const tenD1 = (p.ten_don_vi_cap_1 || d1?.ten || '').toLowerCase();

    const matchesSearch = !term ||
      hoTen.includes(term) ||
      theBhyt.includes(term) ||
      capBac.includes(term) ||
      chucVu.includes(term) ||
      tenD2.includes(term) ||
      tenD1.includes(term);

    // Filter Level 1
    const pCap1Id = d2?.id_don_vi_cap_1 || (p as any).id_don_vi_cap_1;
    const matchesCap1 = filterDonViCap1 === '' || pCap1Id === filterDonViCap1;

    // Filter Level 2
    const pCap2Id = p.id_don_vi_cap_2 || (p as any).id_don_vi;
    const matchesCap2 = filterDonViCap2 === '' || pCap2Id === filterDonViCap2;

    return matchesSearch && matchesCap1 && matchesCap2;
  });

  const availableDonViCap2ForFilter = filterDonViCap1
    ? donViCap2List.filter(d => d.id_don_vi_cap_1 === filterDonViCap1)
    : donViCap2List;

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <div className="flex-none bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-sky-600" />
              Quản lý Cán bộ
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Quản lý thông tin, thẻ BHYT và tra cứu lịch sử khám bệnh.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors shadow-sm font-semibold text-sm cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              Tải File Mẫu
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-semibold text-sm cursor-pointer">
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isImporting ? 'Đang xử lý...' : 'Nhập từ Excel'}
              <input type="file" accept=".xlsx, .xls" hidden onChange={handleImportExcel} disabled={isImporting} />
            </label>
            <button
              onClick={() => {
                setEditingPatient({ gioi_tinh: 'Nam' });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors shadow-sm font-semibold text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm Mới
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="relative sm:col-span-6">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên, Mã thẻ BHYT, Cấp bậc, Đơn vị..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-700 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="sm:col-span-3">
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-700 text-sm"
              value={filterDonViCap1}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : '';
                setFilterDonViCap1(val);
                setFilterDonViCap2('');
              }}
            >
              <option value="">-- Tất cả Đơn vị cấp 1 --</option>
              {donViCap1List.map((d1) => (
                <option key={d1.id} value={d1.id}>
                  {d1.ten}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-700 text-sm"
              value={filterDonViCap2}
              onChange={(e) => setFilterDonViCap2(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">-- Tất cả Đơn vị cấp 2 --</option>
              {availableDonViCap2ForFilter.map((d2) => (
                <option key={d2.id} value={d2.id}>
                  {d2.ten}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-semibold text-sm">Họ và tên</th>
                  <th className="py-3 px-4 font-semibold text-sm">Thẻ BHYT</th>
                                    <th className="py-3 px-4 font-semibold text-sm">Đơn vị công tác</th>
                  <th className="py-3 px-4 font-semibold text-sm text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Users className="w-12 h-12 mb-3 text-slate-300" />
                        <p className="text-base font-medium">Không tìm thấy cán bộ nào.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => {
                    const theBhyt = p.ma_the_bhyt || (p as any).the_bhyt;
                    const d2 = donViCap2List.find(d => d.id === (p.id_don_vi_cap_2 || (p as any).id_don_vi));
const d1 = donViCap1List.find(d => d.id === d2?.id_don_vi_cap_1);
const tenDonViCap1 = p.ten_don_vi_cap_1 || d1?.ten;
const tenDonViCap2 = p.ten_don_vi || d2?.ten;
let fullDonVi = 'Chưa phân bổ';
if (tenDonViCap1 && tenDonViCap2) fullDonVi = `${tenDonViCap2} - ${tenDonViCap1}`;
else if (tenDonViCap2) fullDonVi = tenDonViCap2;
else if (tenDonViCap1) fullDonVi = tenDonViCap1;
                    return (
                    <tr key={p.id} className="hover:bg-sky-50/40 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          {p.ho_ten}
                          {p.gioi_tinh === 'Nữ' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-pink-100 text-pink-700 font-semibold">Nữ</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <span>{p.ngay_sinh || '---'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {theBhyt ? (
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                            <span className="font-mono font-bold text-slate-700">{theBhyt}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-sm">Không có thẻ</span>
                        )}
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 text-sm">
                          {fullDonVi || '---'}
                        </div>
                        {(p.chuc_vu || p.cap_bac) && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {[p.cap_bac, p.chuc_vu].filter(Boolean).join(' - ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity">
                          <button
                            onClick={() => onStartExamForPatient(p.id)}
                            className="p-1.5 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                            title="Bắt đầu khám"
                          >
                            <Stethoscope className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewHistory(p)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                            title="Lịch sử khám"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditPatient(p)}
                            className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                            title="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePatient(p.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPatient.id ? 'Cập Nhật Thông Tin Cán Bộ' : 'Thêm Mới Cán Bộ'}
        className="max-w-2xl"
      >
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
                        value={editingPatient.id_don_vi_cap_1 || ''}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : '';
                          setEditingPatient({ ...editingPatient, id_don_vi_cap_1: val, id_don_vi_cap_2: undefined });
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
                        disabled={!editingPatient.id_don_vi_cap_1}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all disabled:opacity-50 disabled:bg-slate-100"
                        value={editingPatient.id_don_vi_cap_2 || ''}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            id_don_vi_cap_2: e.target.value ? Number(e.target.value) : undefined
                          })
                        }
                      >
                        <option value="">-- Chọn đơn vị cấp 2 --</option>
                        {donViCap2List
                          .filter(cq => cq.id_don_vi_cap_1 === editingPatient.id_don_vi_cap_1)
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
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono uppercase"
                        value={editingPatient.ma_the_bhyt || ''}
                        onChange={(e) =>
                          setEditingPatient({ ...editingPatient, ma_the_bhyt: e.target.value.toUpperCase() })
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-sm">Từ ngày</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        value={editingPatient.tu_ngay || ''}
                        onChange={(e) =>
                          setEditingPatient({ ...editingPatient, tu_ngay: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-sm">Đến ngày</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        value={editingPatient.den_ngay || ''}
                        onChange={(e) =>
                          setEditingPatient({ ...editingPatient, den_ngay: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              

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
        </form>
      </Modal>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Lịch sử khám bệnh"
        className="max-w-4xl"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 p-4 bg-sky-50 rounded-xl">
            <div className="p-3 bg-sky-100 text-sky-600 rounded-full">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{historyPatient?.ho_ten}</h3>
              <p className="text-sm text-slate-600">
                Mã thẻ BHYT: <span className="font-mono font-bold text-slate-700">{historyPatient?.ma_the_bhyt || (historyPatient as any)?.the_bhyt || 'Không có'}</span>
              </p>
            </div>
          </div>

          {patientHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center">
              <History className="w-12 h-12 mb-3 text-slate-300" />
              <p>Chưa có lịch sử khám bệnh nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patientHistory.map((hs) => (
                <div key={hs.id} className="border border-slate-200 rounded-xl p-4 hover:border-sky-200 transition-colors bg-white">
                  <div className="flex flex-wrap gap-4 items-start justify-between mb-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="font-bold text-slate-800 mb-1">{hs.chan_doan}</div>
                      <div className="text-sm text-slate-500">Mã HS: <span className="font-mono">{hs.ma_ho_so}</span></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="success">Hoàn thành</Badge>
                      <div className="text-sm font-semibold text-slate-600">{hs.ngay_kham}</div>
                      <button
                        type="button"
                        onClick={async () => {
                          const full = sqliteService.getHoSoKhamById(hs.id) || hs;
                          await exportBangKeToDocx(full);
                        }}
                        title="Tải File Word (.docx) Bảng Kê Chi Phí"
                        className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition-colors"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Tải Word</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-600 space-y-1">
                    <p><span className="font-medium text-slate-700">Triệu chứng:</span> {hs.trieu_chung}</p>
                    <p><span className="font-medium text-slate-700">Bác sĩ khám:</span> {hs.ten_bac_si}</p>
                    {hs.loi_dan && (
                      <p><span className="font-medium text-slate-700">Lời dặn:</span> {hs.loi_dan}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
