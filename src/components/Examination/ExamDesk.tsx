import React, { useState, useEffect } from 'react';
import {
  NhanSu,
  BacSi,
  Thuoc,
  VatTu,
  DichVuKT,
  MauBenh,
  HoSoKhamChiTiet,
  HoSoKham,
  CoQuan
} from '../../types';
import { sqliteService } from '../../db/sqlite-service';
import {
  User,
  Activity,
  Stethoscope,
  Plus,
  Trash2,
  BookmarkCheck,
  Printer,
  Save,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  FileText,
  UserPlus,
  Pill,
  Syringe,
  Sparkles,
  MapPin,
  Building,
  CreditCard,
  FileDown,
  Loader2
} from 'lucide-react';
import { exportBangKeToDocx } from '../../utils/exportBangKeDocx';
import { isThamMuuDoctor, isPhongVung } from '../../utils/formatDonVi';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

interface ExamDeskProps {
  bacSiList?: BacSi[];
  selectedBacSiId?: number;
  currentDoctor?: BacSi | null;
  onSavedAndPrint?: (record: HoSoKham) => void;
  onPrintRecord?: (record: HoSoKham) => void;
  onViewHistoryPatient?: (patientId: number) => void;
  preSelectedPatientId?: number | null;
}

export const ExamDesk: React.FC<ExamDeskProps> = ({
  bacSiList = [],
  selectedBacSiId,
  currentDoctor,
  onSavedAndPrint,
  onPrintRecord,
  onViewHistoryPatient,
  preSelectedPatientId
}) => {
  const activeDoctorId = selectedBacSiId || currentDoctor?.id || (bacSiList[0]?.id ?? 1);
  const handlePrintAction = onSavedAndPrint || onPrintRecord || (() => {});
  // Master data state
  const [nhanSuList, setNhanSuList] = useState<NhanSu[]>([]);
  const [donViCap1List, setDonViCap1List] = useState<any[]>([]);
  const [donViCap2List, setDonViCap2List] = useState<any[]>([]);
  const [thuocList, setThuocList] = useState<Thuoc[]>([]);
  const [vatTuList, setVatTuList] = useState<VatTu[]>([]);
  const [dichVuList, setDichVuList] = useState<DichVuKT[]>([]);
  const [mauBenhList, setMauBenhList] = useState<MauBenh[]>([]);

  // Selected Patient
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');
  const [patientSearch, setPatientSearch] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

  // Quick Add Patient Modal
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState<Partial<NhanSu & { id_don_vi_cap_1?: number; id_don_vi_cap_2?: number; tu_ngay?: string; den_ngay?: string; cap_bac?: string; chuc_vu?: string }>>({
    gioi_tinh: 'Nam'
  });

  // Clinical Examination State
  const [ngayKham, setNgayKham] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [trieuChung, setTrieuChung] = useState('');
  const [mach, setMach] = useState<string>('');
  const [nhietDo, setNhietDo] = useState<string>('37.0');
  const [huyetAp, setHuyetAp] = useState<string>('120/80');
  const [nhipTho, setNhipTho] = useState<string>('18');
  const [canNang, setCanNang] = useState<string>('');
  const [chieuCao, setChieuCao] = useState<string>('');
  const [chanDoan, setChanDoan] = useState('');
  const [selectedMauBenhId, setSelectedMauBenhId] = useState<number | ''>('');
  const [loiDan, setLoiDan] = useState('');
  const [ngayTaiKham, setNgayTaiKham] = useState('');
  const [trangThaiBHYT, setTrangThaiBHYT] = useState<number>(1);
  const [trangThaiKham, setTrangThaiKham] = useState<'dang_kham' | 'hoan_thanh' | 'chuyen_tuyen'>('hoan_thanh');

  // Prescription / Items details
  const [items, setItems] = useState<HoSoKhamChiTiet[]>([]);

  // Item selector modal / inline helper
  const [addItemType, setAddItemType] = useState<'thuoc' | 'vat_tu' | 'dich_vu_kt'>('thuoc');
  const [selectedItemId, setSelectedItemId] = useState<number | ''>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemUsage, setItemUsage] = useState<string>('');

  // Notification / Success Feedback
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExportingWord, setIsExportingWord] = useState(false);

  const activeDoctor = currentDoctor || bacSiList.find((b) => b.id === activeDoctorId) || (bacSiList.length > 0 ? bacSiList[0] : null);
  const isCurrentDoctorThamMuu = isThamMuuDoctor(activeDoctor);

  const availableDonViCap1List = donViCap1List.filter((cq) => {
    if (!activeDoctor) return true;
    if (isCurrentDoctorThamMuu) {
      return (
        cq.id === 1 ||
        cq.id === 2 ||
        cq.id === 3 ||
        isPhongVung(cq.ten) ||
        /tham\s*mưu|tham\s*muu|chính\s*trị|chinh\s*tri|hậu\s*cần|hau\s*can|kỹ\s*thuật|ky\s*thuat/i.test(cq.ten)
      );
    }
    const docCap1Id =
      (activeDoctor as any)?.id_don_vi_cap_1 ||
      (activeDoctor?.id_don_vi
        ? donViCap2List.find((d) => d.id === activeDoctor.id_don_vi)?.id_don_vi_cap_1
        : undefined);
    if (docCap1Id) {
      return cq.id === docCap1Id;
    }
    return true;
  });

  const loadMasterData = () => {
    const currentDoc = currentDoctor || bacSiList.find((b) => b.id === activeDoctorId) || (bacSiList.length > 0 ? bacSiList[0] : null);
    if (currentDoc?.id) {
      setNhanSuList(sqliteService.getNhanSuByBacSi(currentDoc.id));
    } else {
      setNhanSuList(sqliteService.getNhanSuList());
    }
    setDonViCap1List((sqliteService as any).getDonViCap1List());
    setDonViCap2List((sqliteService as any).getDonViCap2List());
    setThuocList(sqliteService.getThuocList());
    setVatTuList(sqliteService.getVatTuList());
    setDichVuList(sqliteService.getDichVuKTList());
    setMauBenhList(sqliteService.getMauBenhList());
  };

  useEffect(() => {
    loadMasterData();
    const unsubscribe = sqliteService.subscribe(() => {
      loadMasterData();
    });
    return unsubscribe;
  }, [activeDoctorId, currentDoctor?.id, (currentDoctor as any)?.id_don_vi_cap_1]);

  useEffect(() => {
    if (preSelectedPatientId) {
      setSelectedPatientId(preSelectedPatientId);
    }
  }, [preSelectedPatientId]);

  const selectedPatient = nhanSuList.find((p) => p.id === Number(selectedPatientId));

  // Patient history count
  const patientHistory = selectedPatientId
    ? sqliteService.getLichSuKhamNhanSu(Number(selectedPatientId))
    : [];

  // Filtered patient list for autocomplete
  const filteredPatients = nhanSuList.filter((p) => {
    if (!patientSearch.trim()) return true;
    const term = patientSearch.toLowerCase();
    return (
      p.ho_ten.toLowerCase().includes(term) ||
      (p.the_bhyt && p.the_bhyt.toLowerCase().includes(term)) ||
      (p.ten_don_vi && p.ten_don_vi.toLowerCase().includes(term))
    );
  });

  // Handle Disease Template (Mẫu Bệnh) 1-Click Application
  const handleApplyMauBenh = (templateId: number | '') => {
    setSelectedMauBenhId(templateId);
    if (!templateId) return;

    const idNum = Number(templateId);
    let currentMauList = mauBenhList;
    if (currentMauList.length === 0) {
      currentMauList = sqliteService.getMauBenhList();
      setMauBenhList(currentMauList);
    }

    let template = currentMauList.find((m) => Number(m.id) === idNum);
    if (!template) {
      const freshList = sqliteService.getMauBenhList();
      setMauBenhList(freshList);
      template = freshList.find((m) => Number(m.id) === idNum);
    }
    if (!template) return;

    // Autofill diagnosis and doctor's advice
    if (template.chan_doan_chuan) {
      setChanDoan(template.chan_doan_chuan);
    }
    if (template.loi_dan_mac_dinh) {
      setLoiDan(template.loi_dan_mac_dinh);
    }

    // Always fetch fresh details directly from SQLite
    let templateDetails = sqliteService.getMauBenhChiTiet(idNum);
    if (templateDetails.length === 0 && template.chi_tiet && template.chi_tiet.length > 0) {
      templateDetails = template.chi_tiet;
    }

    const freshThuoc = sqliteService.getThuocList();
    const freshVatTu = sqliteService.getVatTuList();
    const freshDichVu = sqliteService.getDichVuKTList();

    const newItems: HoSoKhamChiTiet[] = templateDetails.map((ct: any) => {
      let donGia = Number(ct.don_gia) || 0;
      let ten = ct.ten_muc || ct.ten_thuoc || ct.ten_vat_tu || ct.ten_dich_vu;
      let dvt = ct.don_vi_tinh;
      const itemId = Number(ct.id_muc || ct.thuoc_id || ct.vat_tu_id || ct.dich_vu_id);
      let loai = String(ct.loai_muc || 'thuoc').toLowerCase();
      if (loai === 'dich_vu' || loai === 'dich_vu_ky_thuat') loai = 'dich_vu_kt';
      if (loai !== 'thuoc' && loai !== 'vat_tu') loai = 'dich_vu_kt';

      // Always resolve catalog item for accurate name, unit, and price
      let item: any = null;
      if (loai === 'thuoc') {
        item = freshThuoc.find((t) => Number(t.id) === itemId);
      } else if (loai === 'vat_tu') {
        item = freshVatTu.find((v) => Number(v.id) === itemId);
      } else {
        item = freshDichVu.find((d) => Number(d.id) === itemId);
      }

      if (!item) {
        item =
          freshThuoc.find((t) => Number(t.id) === itemId) ||
          freshVatTu.find((v) => Number(v.id) === itemId) ||
          freshDichVu.find((d) => Number(d.id) === itemId);
      }

      if (item) {
        if (!ten || ten.startsWith('Mục #')) ten = item.ten;
        if (!dvt || dvt === 'Lượt') dvt = item.don_vi_tinh;
        if (!donGia) donGia = item.don_gia || 0;
      }

      const sl = Number(ct.so_luong) > 0 ? Number(ct.so_luong) : 1;
      return {
        loai_muc: loai as any,
        id_muc: itemId,
        ten_muc: ten || `Mục y tế #${itemId}`,
        don_vi_tinh: dvt || 'Viên',
        so_luong: sl,
        don_gia: donGia,
        thanh_tien: donGia * sl,
        cach_dung: ct.cach_dung || (item?.cach_dung_mac_dinh || ''),
        ghi_chu: ct.ghi_chu || ''
      };
    });

    setItems(newItems);
    setFeedbackMessage({
      type: 'success',
      text: `Đã áp dụng mẫu bệnh: "${template.ten_benh}" (${newItems.length} mục đơn thuốc & chỉ định)`
    });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Add Item to table
  const handleAddItem = () => {
    if (!selectedItemId) return;

    let ten_muc = '';
    let don_vi_tinh = '';
    let don_gia = 0;
    let defaultUsage = itemUsage;

    if (addItemType === 'thuoc') {
      const t = thuocList.find((x) => x.id === Number(selectedItemId));
      if (t) {
        ten_muc = t.ten;
        don_vi_tinh = t.don_vi_tinh;
        don_gia = t.don_gia;
        if (!defaultUsage && t.cach_dung_mac_dinh) {
          defaultUsage = t.cach_dung_mac_dinh;
        }
      }
    } else if (addItemType === 'vat_tu') {
      const v = vatTuList.find((x) => x.id === Number(selectedItemId));
      if (v) {
        ten_muc = v.ten;
        don_vi_tinh = v.don_vi_tinh;
        don_gia = v.don_gia;
      }
    } else if (addItemType === 'dich_vu_kt') {
      const d = dichVuList.find((x) => x.id === Number(selectedItemId));
      if (d) {
        ten_muc = d.ten;
        don_vi_tinh = d.don_vi_tinh;
        don_gia = d.don_gia;
      }
    }

    if (!ten_muc) return;

    // Check if already exists in table
    const existingIndex = items.findIndex(
      (it) => it.loai_muc === addItemType && it.id_muc === Number(selectedItemId)
    );

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].so_luong += itemQuantity;
      updated[existingIndex].thanh_tien =
        updated[existingIndex].so_luong * updated[existingIndex].don_gia;
      if (defaultUsage) updated[existingIndex].cach_dung = defaultUsage;
      setItems(updated);
    } else {
      const newItem: HoSoKhamChiTiet = {
        loai_muc: addItemType,
        id_muc: Number(selectedItemId),
        ten_muc,
        don_vi_tinh,
        so_luong: itemQuantity,
        don_gia,
        thanh_tien: don_gia * itemQuantity,
        cach_dung: defaultUsage
      };
      setItems([...items, newItem]);
    }

    // Reset item selector input
    setSelectedItemId('');
    setItemQuantity(1);
    setItemUsage('');
  };

  // Update item in table
  const handleUpdateItemQuantity = (index: number, qty: number) => {
    const validQty = Math.max(1, qty);
    const updated = [...items];
    updated[index].so_luong = validQty;
    updated[index].thanh_tien = validQty * updated[index].don_gia;
    setItems(updated);
  };

  const handleUpdateItemUsage = (index: number, usage: string) => {
    const updated = [...items];
    updated[index].cach_dung = usage;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculate Total Cost
  const totalCost = items.reduce((acc, curr) => acc + curr.thanh_tien, 0);

  // Save Examination Record
  const handleSaveExam = async (shouldPrint = false) => {
    if (!selectedPatientId) {
      setFeedbackMessage({
        type: 'error',
        text: 'Vui lòng chọn cán bộ / bệnh nhân khám bệnh!'
      });
      return;
    }

    // Kiểm tra phân quyền khám bệnh theo quy định:
    // Bác sĩ đơn vị cấp 1 nào chỉ được khám cho đơn vị cấp 1 của quân nhân đó.
    // Riêng bác sĩ Phòng Tham mưu Vùng được khám cho cả 3 phòng: Tham mưu, Chính trị, Hậu cần-Kỹ thuật Vùng.
    if (activeDoctor && selectedPatient) {
      const isDocThamMuu = isThamMuuDoctor(activeDoctor);
      const patientCap1Id =
        (selectedPatient as any).id_don_vi_cap_1 ||
        (selectedPatient.id_don_vi_cap_2
          ? donViCap2List.find((d) => d.id === selectedPatient.id_don_vi_cap_2)?.id_don_vi_cap_1
          : undefined);
      const isPatient3Rooms =
        patientCap1Id === 1 ||
        patientCap1Id === 2 ||
        patientCap1Id === 3 ||
        isPhongVung((selectedPatient as any).ten_don_vi_cap_1);
      const docCap1Id =
        (activeDoctor as any)?.id_don_vi_cap_1 ||
        (activeDoctor?.id_don_vi
          ? donViCap2List.find((d) => d.id === activeDoctor.id_don_vi)?.id_don_vi_cap_1
          : undefined);
      const docCap1Name =
        (activeDoctor as any)?.ten_don_vi_cap_1 ||
        (docCap1Id ? donViCap1List.find((d) => d.id === docCap1Id)?.ten : '');

      if (isDocThamMuu) {
        if (!isPatient3Rooms) {
          setFeedbackMessage({
            type: 'error',
            text: `Bác sĩ Phòng Tham mưu Vùng chỉ được khám cho quân nhân thuộc 3 phòng (Tham mưu, Chính trị, Hậu cần-Kỹ thuật Vùng). Quân nhân này thuộc: ${(selectedPatient as any).ten_don_vi_cap_1 || 'Đơn vị khác'}!`
          });
          return;
        }
      } else if (docCap1Id && patientCap1Id && docCap1Id !== patientCap1Id) {
        setFeedbackMessage({
          type: 'error',
          text: `Bác sĩ thuộc đơn vị "${docCap1Name || 'này'}" chỉ được khám cho quân nhân cùng đơn vị cấp 1. Quân nhân này thuộc "${(selectedPatient as any).ten_don_vi_cap_1 || 'Đơn vị khác'}"!`
        });
        return;
      }
    }

    if (!chanDoan.trim()) {
      setFeedbackMessage({
        type: 'error',
        text: 'Vui lòng nhập chẩn đoán bệnh!'
      });
      return;
    }

    const examData: Partial<HoSoKham> = {
      id_nhan_su: Number(selectedPatientId),
      ngay_kham: ngayKham,
      trieu_chung: trieuChung.trim(),
      mach: mach ? parseInt(mach, 10) : undefined,
      nhiet_do: nhietDo ? parseFloat(nhietDo) : undefined,
      huyet_ap: huyetAp.trim(),
      nhip_tho: nhipTho ? parseInt(nhipTho, 10) : undefined,
      can_nang: canNang ? parseFloat(canNang) : undefined,
      chieu_cao: chieuCao ? parseFloat(chieuCao) : undefined,
      chan_doan: chanDoan.trim(),
      id_mau_benh: selectedMauBenhId ? Number(selectedMauBenhId) : undefined,
      id_bac_si: activeDoctorId,
      loi_dan: loiDan.trim(),
      tong_chi_phi: totalCost,
      trang_thai_bhyt: trangThaiBHYT,
      ngay_tai_kham: ngayTaiKham,
      trang_thai_kham: trangThaiKham
    };

    const savedId = sqliteService.saveHoSoKham(examData, items, true);
    // Bất đồng bộ: Đợi ghi xuống file/IndexedDB hoàn tất trước khi in
    if (savedId) {
      await (sqliteService as any).persistDatabase?.() || await Promise.resolve();
    }

    if (savedId) {
      const fullRecord = sqliteService.getHoSoKhamById(savedId);
      setFeedbackMessage({
        type: 'success',
        text: `Đã lưu thành công hồ sơ khám ${fullRecord?.ma_ho_so || ''}!`
      });

      if (shouldPrint && fullRecord) {
        try {
          setIsExportingWord(true);
          await exportBangKeToDocx(fullRecord);
        } catch (err) {
          console.error('Lỗi khi xuất file Word:', err);
        } finally {
          setIsExportingWord(false);
        }
        handlePrintAction(fullRecord);
      } else {
        // Reset desk
        handleResetDesk();
      }
    } else {
      setFeedbackMessage({
        type: 'error',
        text: 'Lỗi khi lưu dữ liệu vào SQLite!'
      });
    }
  };

  const handleResetDesk = () => {
    setSelectedPatientId('');
    setPatientSearch('');
    setNgayKham(new Date().toISOString().split('T')[0]);
    setTrieuChung('');
    setMach('');
    setNhietDo('37.0');
    setHuyetAp('120/80');
    setNhipTho('18');
    setCanNang('');
    setChieuCao('');
    setChanDoan('');
    setSelectedMauBenhId('');
    setLoiDan('');
    setNgayTaiKham('');
    setItems([]);
  };

  // Quick Add Patient Handler
  const handleQuickAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.ho_ten?.trim()) return;

    const payload = {
      ...newPatient,
      id_don_vi_cap_2: newPatient.id_don_vi_cap_2 || (newPatient as any).id_don_vi || undefined,
      cap_bac: newPatient.cap_bac?.trim() || '',
      chuc_vu: newPatient.chuc_vu?.trim() || '',
      ma_the_bhyt: (newPatient.ma_the_bhyt || (newPatient as any).the_bhyt || '').trim().toUpperCase()
    };

    const newId = sqliteService.saveNhanSu(payload);
    if (newId) {
      await sqliteService.persistDatabase();
      loadMasterData();
      setSelectedPatientId(newId);
      setIsAddPatientModalOpen(false);
      setNewPatient({ gioi_tinh: 'Nam' });
      setFeedbackMessage({
        type: 'success',
        text: `Đã thêm mới và chọn cán bộ: ${payload.ho_ten}`
      });
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(num);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Feedback */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-sm transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs'
              : 'bg-rose-50 text-rose-800 border-rose-200 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid: Left Column (Patient & Vitals & Clinical) + Right Column (1-Click Templates & Prescription Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: PATIENT & VITALS & DIAGNOSIS ================= */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 1: Patient Selection Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <User className="w-4 h-4 text-sky-600" />
                <span>Thông Tin Cán Bộ / Bệnh Nhân</span>
              </div>
              <button
                type="button"
                id="quick-add-patient-btn"
                onClick={() => {
                  const currentDoc = currentDoctor || bacSiList.find((b) => b.id === activeDoctorId) || (bacSiList.length > 0 ? bacSiList[0] : null);
                  const docCap1Id = (currentDoc as any)?.id_don_vi_cap_1 || (currentDoc?.id_don_vi ? donViCap2List.find(d => d.id === currentDoc.id_don_vi)?.id_don_vi_cap_1 : undefined);
                  setNewPatient({
                    gioi_tinh: 'Nam',
                    id_don_vi_cap_1: docCap1Id
                  });
                  setIsAddPatientModalOpen(true);
                }}
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Thêm nhanh</span>
              </button>
            </div>

            {/* Active Doctor Unit Filtering Banner */}
            {activeDoctor && (
              <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-slate-600 gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>Đơn vị cấp 1 Bác sĩ:</span>
                  <strong className="text-slate-800 uppercase font-semibold">
                    {activeDoctor.ten_don_vi_cap_1 || (activeDoctor.id_don_vi ? donViCap2List.find(d => d.id === activeDoctor.id_don_vi)?.ten_don_vi_cap_1 : '') || 'Phòng Tham mưu'}
                  </strong>
                  {isCurrentDoctorThamMuu && (
                    <span className="text-[11px] text-sky-700 bg-sky-100/80 border border-sky-200 rounded px-1.5 py-0.5 font-medium">
                      Khám cả 3 Phòng: Tham mưu, Chính trị, Hậu cần - Kỹ thuật
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                  (Lọc {filteredPatients.length} cán bộ)
                </span>
              </div>
            )}

            {/* Smart Search / Dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tìm kiếm cán bộ (Tên, BHYT, Phòng ban, SĐT)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="patient-search-input"
                  type="text"
                  placeholder="Nhập tên hoặc quét/gõ mã BHYT..."
                  value={patientSearch}
                  onFocus={() => setIsPatientDropdownOpen(true)}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setIsPatientDropdownOpen(true);
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
                {patientSearch && (
                  <button
                    onClick={() => {
                      setPatientSearch('');
                      setSelectedPatientId('');
                    }}
                    className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {isPatientDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          setPatientSearch(patient.ho_ten);
                          setIsPatientDropdownOpen(false);
                        }}
                        className="w-full text-left p-3 hover:bg-sky-50 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-sm text-slate-800">
                            {patient.ho_ten}{' '}
                            <span className="text-xs font-normal text-slate-500">
                              ({patient.gioi_tinh}, {patient.ngay_sinh ? `${new Date(patient.ngay_sinh).getFullYear()}` : '---'})
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="text-sky-700 font-medium">{patient.ten_don_vi || 'Cơ quan'}</span>
                            <span>•</span>
                            <span>{patient.chuc_vu || patient.cap_bac || 'Cán bộ'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {patient.the_bhyt || 'Không BHYT'}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-center text-slate-400">
                      Không tìm thấy cán bộ phù hợp.{' '}
                      <button
                        onClick={() => {
                          setIsPatientDropdownOpen(false);
                          setIsAddPatientModalOpen(true);
                        }}
                        className="text-sky-600 font-semibold underline"
                      >
                        Thêm mới cán bộ?
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Patient Details Card */}
            {selectedPatient && (
              <div className="bg-sky-50/70 border border-sky-100 rounded-lg p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-bold text-slate-900 uppercase">
                      {selectedPatient.ho_ten}
                    </div>
                    <div className="text-sky-800 font-medium">
                      {selectedPatient.ten_don_vi || 'Cán bộ nội bộ'} - {selectedPatient.chuc_vu || selectedPatient.cap_bac || 'Nhân viên'}
                    </div>
                  </div>
                  <Badge variant="primary">
                    BHYT: {selectedPatient.the_bhyt || 'Chưa cập nhật'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-sky-200/60">
                  <div>Ngày sinh: <strong className="text-slate-800">{selectedPatient.ngay_sinh || '---'}</strong></div>
                  <div>Giới tính: <strong className="text-slate-800">{selectedPatient.gioi_tinh}</strong></div>
                  
                </div>

                {/* History consultations pill button */}
                <div className="pt-2 flex justify-between items-center border-t border-sky-200/60">
                  <span className="text-slate-600 font-medium">
                    Lịch sử khám: <strong>{patientHistory.length} lần</strong>
                  </span>
                  {patientHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onViewHistoryPatient(selectedPatient.id)}
                      className="text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 underline"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Xem lịch sử y bạ</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Vital Signs (Sinh hiệu) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>Chỉ Số Sinh Hiệu Lâm Sàng</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Huyết áp (mmHg)
                </label>
                <input
                  id="vitals-bp"
                  type="text"
                  placeholder="120/80"
                  value={huyetAp}
                  onChange={(e) => setHuyetAp(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mạch (nhịp/phút)
                </label>
                <input
                  id="vitals-pulse"
                  type="number"
                  placeholder="75"
                  value={mach}
                  onChange={(e) => setMach(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nhiệt độ (°C)
                </label>
                <input
                  id="vitals-temp"
                  type="number"
                  step="0.1"
                  placeholder="37.0"
                  value={nhietDo}
                  onChange={(e) => setNhietDo(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nhịp thở (lần/phút)
                </label>
                <input
                  id="vitals-respiration"
                  type="number"
                  placeholder="18"
                  value={nhipTho}
                  onChange={(e) => setNhipTho(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cân nặng (kg)
                </label>
                <input
                  id="vitals-weight"
                  type="number"
                  step="0.5"
                  placeholder="65"
                  value={canNang}
                  onChange={(e) => setCanNang(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chiều cao (cm)
                </label>
                <input
                  id="vitals-height"
                  type="number"
                  placeholder="170"
                  value={chieuCao}
                  onChange={(e) => setChieuCao(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Symptoms & Diagnosis */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
              <Stethoscope className="w-4 h-4 text-sky-600" />
              <span>Khám Lâm Sàng & Chẩn Đoán</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Triệu chứng / Lý do khám
                </label>
                <textarea
                  id="exam-symptoms"
                  rows={2}
                  placeholder="Mô tả triệu chứng bệnh nhân khai: sốt, ho, đau họng, đau bụng..."
                  value={trieuChung}
                  onChange={(e) => setTrieuChung(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chẩn đoán xác định <span className="text-rose-500">*</span>
                </label>
                <input
                  id="exam-diagnosis"
                  type="text"
                  placeholder="VD: Cảm cúm thông thường cấp tính (J00) / Viêm họng cấp..."
                  value={chanDoan}
                  onChange={(e) => setChanDoan(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:bg-white text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lời dặn của bác sĩ & Chế độ sinh hoạt
                </label>
                <textarea
                  id="exam-advice"
                  rows={2}
                  placeholder="Uống nhiều nước ấm, nghỉ ngơi, kiêng đồ cay nóng..."
                  value={loiDan}
                  onChange={(e) => setLoiDan(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Chế độ BHYT / Thanh toán
                  </label>
                  <select
                    id="exam-insurance-status"
                    value={trangThaiBHYT}
                    onChange={(e) => setTrangThaiBHYT(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white"
                  >
                    <option value={1}>1. Hưởng chế độ BHYT</option>
                    <option value={2}>2. Cơ quan cấp miễn phí</option>
                    <option value={0}>0. Tự chi trả viện phí</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ngày khám <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="exam-date"
                    type="date"
                    value={ngayKham}
                    onChange={(e) => setNgayKham(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hẹn ngày tái khám (nếu có)
                  </label>
                  <input
                    id="exam-revisit-date"
                    type="date"
                    value={ngayTaiKham}
                    onChange={(e) => setNgayTaiKham(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: 1-CLICK TEMPLATES & PRESCRIPTION TABLE ================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* Fast Template Selector (Mẫu Bệnh 1-Click) */}
          <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-sky-200">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Kê Đơn Tốc Độ Cao Bằng Mẫu Bệnh (Phác Đồ)</span>
              </div>
              <span className="text-[11px] text-sky-300">Tự động nạp đơn & chẩn đoán</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                id="disease-template-select"
                value={selectedMauBenhId}
                onChange={(e) => handleApplyMauBenh(e.target.value ? Number(e.target.value) : '')}
                className="flex-1 bg-slate-800/90 text-white border border-sky-500/40 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-400 font-medium"
              >
                <option value="">-- Chọn phác đồ mẫu bệnh thường gặp --</option>
                {mauBenhList.map((mb) => (
                  <option key={mb.id} value={mb.id}>
                    ⚡ {mb.ten_benh}
                  </option>
                ))}
              </select>

              {selectedMauBenhId && (
                <button
                  type="button"
                  onClick={() => handleApplyMauBenh(selectedMauBenhId)}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
                >
                  Nạp lại
                </button>
              )}
            </div>
          </div>

          {/* Add Item Box (Thuốc / Vật tư / Dịch vụ) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Pill className="w-4 h-4 text-sky-600" />
                <span>Thêm Thuốc, Vật Tư & Dịch Vụ Vào Đơn</span>
              </div>

              {/* Type Switcher Tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAddItemType('thuoc');
                    setSelectedItemId('');
                  }}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    addItemType === 'thuoc'
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Thuốc ({thuocList.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddItemType('vat_tu');
                    setSelectedItemId('');
                  }}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    addItemType === 'vat_tu'
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Vật Tư ({vatTuList.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddItemType('dich_vu_kt');
                    setSelectedItemId('');
                  }}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    addItemType === 'dich_vu_kt'
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dịch Vụ ({dichVuList.length})
                </button>
              </div>
            </div>

            {/* Input Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end text-xs">
              <div className="md:col-span-6">
                <label className="block font-semibold text-slate-700 mb-1">
                  Chọn {addItemType === 'thuoc' ? 'thuốc điều trị' : addItemType === 'vat_tu' ? 'vật tư y tế' : 'dịch vụ kỹ thuật'}
                </label>
                <select
                  id="add-item-select"
                  value={selectedItemId}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : '';
                    setSelectedItemId(id);
                    if (addItemType === 'thuoc' && id) {
                      const t = thuocList.find((x) => x.id === id);
                      if (t?.cach_dung_mac_dinh) setItemUsage(t.cach_dung_mac_dinh);
                    }
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:bg-white text-xs"
                >
                  <option value="">-- Chọn từ danh mục --</option>
                  {addItemType === 'thuoc' &&
                    thuocList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.ten} (Tồn: {t.ton_kho} {t.don_vi_tinh} - {formatVND(t.don_gia)})
                      </option>
                    ))}
                  {addItemType === 'vat_tu' &&
                    vatTuList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.ten} (Tồn: {v.ton_kho} {v.don_vi_tinh} - {formatVND(v.don_gia)})
                      </option>
                    ))}
                  {addItemType === 'dich_vu_kt' &&
                    dichVuList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.ten} ({formatVND(d.don_gia)} / {d.don_vi_tinh})
                      </option>
                    ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Số lượng</label>
                <input
                  id="add-item-qty"
                  type="number"
                  min={1}
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-800 focus:bg-white text-xs"
                />
              </div>

              <div className="md:col-span-4">
                <button
                  type="button"
                  id="add-item-btn"
                  disabled={!selectedItemId}
                  onClick={handleAddItem}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Vào Đơn</span>
                </button>
              </div>

              {/* Optional instruction line */}
              {addItemType === 'thuoc' && (
                <div className="md:col-span-12">
                  <input
                    id="add-item-usage"
                    type="text"
                    placeholder="Hướng dẫn liều lượng và cách dùng chi tiết..."
                    value={itemUsage}
                    onChange={(e) => setItemUsage(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs italic text-slate-700 focus:bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Current Prescription Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <span className="font-bold text-slate-800 text-sm">
                  Chi Tiết Đơn Thuốc & Chỉ Định ({items.length} mục)
                </span>
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setItems([])}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-semibold w-10">STT</th>
                      <th className="py-2.5 px-3 font-semibold">Tên Thuốc / Vật Tư / Dịch Vụ</th>
                      <th className="py-2.5 px-3 font-semibold w-24 text-center">Số Lượng</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Đơn Giá</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Thành Tiền</th>
                      <th className="py-2.5 px-3 font-semibold w-10 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-center">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-800">{item.ten_muc}</div>
                          <div className="mt-1">
                            <input
                              type="text"
                              placeholder="Cách dùng..."
                              value={item.cach_dung || ''}
                              onChange={(e) => handleUpdateItemUsage(idx, e.target.value)}
                              className="w-full text-[11px] p-1 bg-slate-50 border border-slate-200 rounded focus:bg-white text-slate-700 italic"
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min={1}
                              value={item.so_luong}
                              onChange={(e) =>
                                handleUpdateItemQuantity(
                                  idx,
                                  parseInt(e.target.value, 10) || 1
                                )
                              }
                              className="w-14 p-1 text-center font-bold bg-slate-50 border border-slate-200 rounded focus:bg-white"
                            />
                            <span className="text-slate-500 font-medium text-[11px]">
                              {item.don_vi_tinh}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                          {formatVND(item.don_gia)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatVND(item.thanh_tien)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg space-y-2">
                <Pill className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">
                  Chưa có thuốc hoặc dịch vụ nào trong đơn khám.
                </p>
                <p className="text-[11px] text-sky-600 font-medium">
                  Hãy chọn một mẫu bệnh ở trên hoặc thêm từng loại thuốc vào đơn.
                </p>
              </div>
            )}

            {/* Total Cost Summary Bar */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-700 text-sm">
                Tổng Chi Phí Đơn Thuốc / Dịch Vụ:
              </span>
              <span className="text-lg font-black text-sky-700">
                {formatVND(totalCost)}
              </span>
            </div>
          </div>

          {/* Action Buttons (Save, Print, Reset) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              id="reset-desk-btn"
              onClick={handleResetDesk}
              className="flex items-center gap-1.5 px-4 py-2.5 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm Mới Bàn Khám</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                id="save-exam-btn"
                onClick={() => handleSaveExam(false)}
                className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Hồ Sơ</span>
              </button>

              <button
                type="button"
                id="save-and-export-word-btn"
                onClick={() => handleSaveExam(true)}
                disabled={isExportingWord}
                className="cursor-pointer flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-900/20 transition-all hover:scale-[1.02]"
              >
                {isExportingWord ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang Tạo File Word...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>Lưu & Tải File Word (.docx)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Patient Modal */}
      <Modal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        title="Thêm Nhanh Cán Bộ / Bệnh Nhân"
        maxWidth="2xl"
      >
        <form onSubmit={handleQuickAddPatient} className="space-y-4 text-xs">
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
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày sinh</label>
              <input
                type="date"
                value={newPatient.ngay_sinh || ''}
                onChange={(e) => setNewPatient({ ...newPatient, ngay_sinh: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giới tính</label>
              <select
                value={newPatient.gioi_tinh || 'Nam'}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, gioi_tinh: e.target.value as 'Nam' | 'Nữ' | 'Khác' })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          {/* Đơn vị công tác */}
          <div className="p-3.5 bg-sky-50/50 rounded-xl border border-sky-100 space-y-3">
            <h4 className="font-semibold text-sky-800 text-xs flex items-center gap-1.5">
              <Building className="w-4 h-4 text-sky-600" />
              <span>Đơn vị công tác</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Đơn vị cấp 1</label>
                <select
                  value={newPatient.id_don_vi_cap_1 || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    setNewPatient({
                      ...newPatient,
                      id_don_vi_cap_1: val,
                      id_don_vi: undefined,
                      id_don_vi_cap_2: undefined
                    });
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                >
                  <option value="">-- Chọn đơn vị cấp 1 --</option>
                  {availableDonViCap1List.map((cq) => (
                    <option key={cq.id} value={cq.id}>
                      {cq.ten}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Đơn vị cấp 2</label>
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
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all disabled:opacity-50 disabled:bg-slate-100"
                >
                  <option value="">-- Chọn đơn vị cấp 2 --</option>
                  {donViCap2List
                    .filter((cq) => cq.id_don_vi_cap_1 === newPatient.id_don_vi_cap_1)
                    .map((cq) => (
                      <option key={cq.id} value={cq.id}>
                        {cq.ten}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cấp bậc & Chức vụ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cấp bậc</label>
              <input
                type="text"
                placeholder="VD: Thượng úy, Thiếu tá..."
                value={newPatient.cap_bac || ''}
                onChange={(e) => setNewPatient({ ...newPatient, cap_bac: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chức vụ</label>
              <input
                type="text"
                placeholder="VD: Phó phòng, Chuyên viên..."
                value={newPatient.chuc_vu || ''}
                onChange={(e) => setNewPatient({ ...newPatient, chuc_vu: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          {/* BHYT */}
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-3">
            <h4 className="font-semibold text-emerald-800 text-xs flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Thông tin thẻ BHYT</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Mã thẻ BHYT</label>
                <input
                  type="text"
                  placeholder="VD: HC40102..."
                  value={newPatient.ma_the_bhyt || newPatient.the_bhyt || ''}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      ma_the_bhyt: e.target.value.toUpperCase(),
                      the_bhyt: e.target.value.toUpperCase()
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Từ ngày</label>
                <input
                  type="date"
                  value={newPatient.tu_ngay || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, tu_ngay: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Đến ngày</label>
                <input
                  type="date"
                  value={newPatient.den_ngay || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, den_ngay: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddPatientModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold shadow-xs transition-colors"
            >
              Lưu & Chọn Khám Ngay
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
