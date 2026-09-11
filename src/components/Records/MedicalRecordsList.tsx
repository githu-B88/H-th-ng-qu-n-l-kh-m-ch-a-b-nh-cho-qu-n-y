import React, { useState, useEffect } from 'react';
import { HoSoKham, CoQuan, DonViCap1, DonViCap2 } from '../../types';
import { sqliteService } from '../../db/sqlite-service';
import {
  Search,
  Calendar,
  Filter,
  Eye,
  Printer,
  Trash2,
  FileText,
  ShieldCheck,
  User,
  Activity,
  Plus,
  AlertTriangle,
  CheckCircle2,
  FileDown,
  Loader2
} from 'lucide-react';
import { exportBangKeToDocx } from '../../utils/exportBangKeDocx';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface MedicalRecordsListProps {
  onPrintRecord: (record: HoSoKham) => void;
  onBatchPrint?: (records: HoSoKham[]) => void;
  onNewExam: () => void;
}

export const MedicalRecordsList: React.FC<MedicalRecordsListProps> = ({
  onPrintRecord,
  onBatchPrint,
  onNewExam
}) => {
  const [records, setRecords] = useState<HoSoKham[]>([]);
  const [donViCap1List, setDonViCap1List] = useState<DonViCap1[]>([]);
  const [donViCap2List, setDonViCap2List] = useState<DonViCap2[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDonViCap1, setSelectedDonViCap1] = useState<number | ''>('');
  const [selectedDonViCap2, setSelectedDonViCap2] = useState<number | ''>('');
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');
  const [trangThai, setTrangThai] = useState('');

  // View Details Modal
  const [viewRecord, setViewRecord] = useState<HoSoKham | null>(null);

  // Delete Confirm Modal State
  const [recordToDelete, setRecordToDelete] = useState<HoSoKham | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadRecords = () => {
    setRecords(
      sqliteService.getHoSoKhamList({
        search: search || undefined,
        idDonViCap1: selectedDonViCap1 ? Number(selectedDonViCap1) : undefined,
        idDonVi: selectedDonViCap2 ? Number(selectedDonViCap2) : undefined,
        tuNgay: tuNgay || undefined,
        denNgay: denNgay || undefined,
        trangThai: trangThai || undefined
      })
    );
    try {
      setDonViCap1List((sqliteService as any).getDonViCap1List() || []);
      setDonViCap2List((sqliteService as any).getDonViCap2List() || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRecords();
    const unsub = sqliteService.subscribe(loadRecords);
    return unsub;
  }, [search, selectedDonViCap1, selectedDonViCap2, tuNgay, denNgay, trangThai]);

  const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [exportingId, setExportingId] = useState<number | null>(null);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRecordIds(records.map(r => r.id));
    } else {
      setSelectedRecordIds([]);
    }
  };

  const handleSelectRecord = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRecordIds(prev => [...prev, id]);
    } else {
      setSelectedRecordIds(prev => prev.filter(rId => rId !== id));
    }
  };

  const fetchBatchRecords = async () => {
    try {
      const fullList: HoSoKham[] = [];
      for (const id of selectedRecordIds) {
        const localRecord = sqliteService.getHoSoKhamById(id);
        if (localRecord) {
          fullList.push(localRecord as HoSoKham);
        }
      }
      return fullList;
    } catch (e) {
      console.error('Lỗi khi tải chi tiết hồ sơ in hàng loạt:', e);
      return [];
    }
  };

  const handleBatchExportWord = async () => {
    if (selectedRecordIds.length === 0) return;
    setIsBatchProcessing(true);
    try {
      const fullRecords = await fetchBatchRecords();
      if (fullRecords && fullRecords.length > 0) {
        await exportBangKeToDocx(fullRecords);
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Lỗi khi xuất Word hàng loạt!' });
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleBatchPrint = async () => {
    if (selectedRecordIds.length === 0 || !onBatchPrint) return;
    setIsBatchProcessing(true);
    try {
      const fullRecords = await fetchBatchRecords();
      if (fullRecords && fullRecords.length > 0) {
        onBatchPrint(fullRecords);
        // Đợi component render DOM xong rồi gọi printElement
        setTimeout(() => {
          import('../../utils/printHelper').then(({ printElement }) => {
            printElement('printable-batch-sheet', {
              title: `Bang_Ke_KCB_Hang_Loat`,
              orientation: 'landscape',
            });
            setIsBatchProcessing(false);
            // Có thể giữ hoặc xoá onBatchPrint([]) tùy logic, 
            // nhưng thường printElement sẽ mở dialog in chặn trình duyệt,
            // sau khi xong (khoảng 1s) ta clear data để đóng chế độ in nền.
            setTimeout(() => onBatchPrint([]), 1500);
          });
        }, 500);
      } else {
        setIsBatchProcessing(false);
        setFeedback({ type: 'error', text: 'Không tìm thấy dữ liệu chi tiết của các hồ sơ đã chọn!' });
      }
    } catch (err) {
      console.error('Lỗi khi in hàng loạt:', err);
      setIsBatchProcessing(false);
      setFeedback({ type: 'error', text: 'Đã xảy ra lỗi khi chuẩn bị dữ liệu in hàng loạt!' });
    }
  };

  const handleExportWord = async (recordOrId: HoSoKham | number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const full = typeof recordOrId === 'number'
      ? sqliteService.getHoSoKhamById(recordOrId)
      : sqliteService.getHoSoKhamById(recordOrId.id) || recordOrId;

    if (full) {
      try {
        setExportingId(full.id);
        await exportBangKeToDocx(full);
      } catch (err) {
        console.error('Lỗi khi xuất file Word:', err);
      } finally {
        setExportingId(null);
      }
    }
  };

  const handlePrintRecord = (recordOrId: HoSoKham | number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const full = typeof recordOrId === 'number'
      ? sqliteService.getHoSoKhamById(recordOrId)
      : sqliteService.getHoSoKhamById(recordOrId.id) || recordOrId;

    if (full) {
      onPrintRecord(full);
    }
  };

  const handleConfirmDelete = () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      const success = sqliteService.deleteHoSoKham(recordToDelete.id);
      if (success) {
        setFeedback({
          type: 'success',
          text: `Đã xóa thành công phiếu khám ${recordToDelete.ma_ho_so} của bệnh nhân ${recordToDelete.ten_nhan_su}!`
        });
        loadRecords();
        if (viewRecord?.id === recordToDelete.id) {
          setViewRecord(null);
        }
      } else {
        setFeedback({
          type: 'error',
          text: 'Không thể xóa phiếu khám khỏi cơ sở dữ liệu!'
        });
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      setFeedback({
        type: 'error',
        text: 'Có lỗi xảy ra trong quá trình xóa dữ liệu!'
      });
    } finally {
      setIsDeleting(false);
      setRecordToDelete(null);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleConfirmClearAll = () => {
    setIsDeleting(true);
    try {
      const result = sqliteService.clearExamRecords();
      if (result.success) {
        setFeedback({
          type: 'success',
          text: result.message
        });
        loadRecords();
        setViewRecord(null);
        setIsClearAllModalOpen(false);
      } else {
        setFeedback({
          type: 'error',
          text: result.message || 'Không thể dọn sạch dữ liệu lịch sử khám!'
        });
      }
    } catch (err: any) {
      console.error('Error clearing all exam records:', err);
      setFeedback({
        type: 'error',
        text: 'Có lỗi xảy ra khi thực hiện xóa lịch sử khám!'
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleOpenDetail = (id: number) => {
    const full = sqliteService.getHoSoKhamById(id);
    if (full) setViewRecord(full);
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-sm transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-2 py-0.5"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Search & Filter Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-800 text-base">
              Hồ Sơ Y Bạ & Lịch Sử Khám Bệnh ({records.length} hồ sơ)
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedRecordIds.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleBatchPrint}
                  disabled={isBatchProcessing}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  title="In hàng loạt các hồ sơ đã chọn"
                >
                  {isBatchProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                  <span>In hàng loạt ({selectedRecordIds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={handleBatchExportWord}
                  disabled={isBatchProcessing}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  title="Xuất Word (.docx) hàng loạt các hồ sơ đã chọn"
                >
                  {isBatchProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  <span>Xuất Word ({selectedRecordIds.length})</span>
                </button>
              </>
            )}

            {records.length > 0 && (
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                title="Dọn sạch toàn bộ lịch sử khám bệnh và đơn thuốc"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Dọn Sạch Lịch Sử</span>
              </button>
            )}

            <button
              onClick={onNewExam}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Khám Bệnh Mới</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên cán bộ, mã hồ sơ, BHYT, chẩn đoán..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-xs"
            />
          </div>

          <div>
            <select
              value={selectedDonViCap1}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : '';
                setSelectedDonViCap1(val);
                setSelectedDonViCap2('');
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white"
            >
              <option value="">-- Tất cả Đơn vị cấp 1 --</option>
              {donViCap1List.map((d1) => (
                <option key={d1.id} value={d1.id}>
                  {d1.ten}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDonViCap2}
              onChange={(e) => setSelectedDonViCap2(e.target.value ? Number(e.target.value) : '')}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white"
            >
              <option value="">-- Tất cả Đơn vị cấp 2 --</option>
              {(selectedDonViCap1
                ? donViCap2List.filter(d => d.id_don_vi_cap_1 === selectedDonViCap1)
                : donViCap2List
              ).map((d2) => (
                <option key={d2.id} value={d2.id}>
                  {d2.ten}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2">
            <span className="text-slate-400 text-[11px] shrink-0">Từ:</span>
            <input
              type="date"
              value={tuNgay}
              onChange={(e) => setTuNgay(e.target.value)}
              className="w-full py-1.5 bg-transparent text-xs text-slate-800 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2">
            <span className="text-slate-400 text-[11px] shrink-0">Đến:</span>
            <input
              type="date"
              value={denNgay}
              onChange={(e) => setDenNgay(e.target.value)}
              className="w-full py-1.5 bg-transparent text-xs text-slate-800 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    checked={records.length > 0 && selectedRecordIds.length === records.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="py-3 px-4 font-semibold">Mã Hồ Sơ</th>
                <th className="py-3 px-4 font-semibold">Ngày Khám</th>
                <th className="py-3 px-4 font-semibold">Cán Bộ / Bệnh Nhân</th>
                <th className="py-3 px-4 font-semibold">Đơn Vị & Chức Vụ</th>
                <th className="py-3 px-4 font-semibold">Chẩn Đoán Bệnh</th>
                <th className="py-3 px-4 font-semibold">Bác Sĩ Khám</th>
                <th className="py-3 px-4 font-semibold text-right">Tổng Tiền</th>
                <th className="py-3 px-4 font-semibold text-center">Chế Độ</th>
                <th className="py-3 px-4 font-semibold text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-sky-50/50 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                        checked={selectedRecordIds.includes(r.id)}
                        onChange={(e) => handleSelectRecord(r.id, e.target.checked)}
                      />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sky-700">
                      {r.ma_ho_so}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {r.ngay_kham}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{r.ten_nhan_su}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        BHYT: {r.the_bhyt || 'Không'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {r.ten_don_vi_cap_2 ? (
                          <>
                            <span>{r.ten_don_vi_cap_2}</span>
                            {r.ten_don_vi_cap_1 && (
                              <span className="text-slate-500 font-normal"> - {r.ten_don_vi_cap_1}</span>
                            )}
                          </>
                        ) : (
                          r.ten_don_vi_nhan_su || '---'
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {[r.cap_bac_nhan_su, r.chuc_vu_nhan_su].filter(Boolean).join(' - ')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 max-w-xs truncate">
                        {r.chan_doan}
                      </div>
                      {r.ten_mau_benh && (
                        <div className="text-[11px] text-sky-600 italic">
                          Mẫu: {r.ten_mau_benh}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {r.ten_bac_si || '---'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatVND(r.tong_chi_phi)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          r.trang_thai_bhyt === 1
                            ? 'success'
                            : r.trang_thai_bhyt === 2
                            ? 'info'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {r.trang_thai_bhyt === 1
                          ? 'BHYT'
                          : r.trang_thai_bhyt === 2
                          ? 'Miễn phí'
                          : 'Tự túc'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(r.id)}
                          title="Xem chi tiết hồ sơ"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleExportWord(r, e)}
                          disabled={exportingId === r.id}
                          title="Tải File Word (.docx) Bảng Kê Chi Phí"
                          className="cursor-pointer p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          {exportingId === r.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          ) : (
                            <FileDown className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handlePrintRecord(r, e)}
                          title="In phiếu khám / đơn thuốc"
                          className="cursor-pointer p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRecordToDelete(r)}
                          title="Xóa hồ sơ"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-500">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
                      <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-700 text-sm">
                          {search || selectedDonViCap1 || selectedDonViCap2 || tuNgay || denNgay || trangThai
                            ? 'Không tìm thấy hồ sơ khám bệnh nào phù hợp với bộ lọc.'
                            : 'Chưa có hồ sơ khám bệnh / đơn thuốc nào trong cơ sở dữ liệu.'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {search || selectedDonViCap1 || selectedDonViCap2 || tuNgay || denNgay || trangThai
                            ? 'Vui lòng thử điều chỉnh lại từ khóa tìm kiếm hoặc bỏ các tiêu chí lọc.'
                            : 'Cơ sở dữ liệu y bạ đang sạch. Nhấn nút "Khám Bệnh Mới" để bắt đầu lượt khám đầu tiên.'}
                        </p>
                      </div>
                      <div className="pt-2 flex gap-2">
                        {(search || selectedDonViCap1 || selectedDonViCap2 || tuNgay || denNgay || trangThai) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearch('');
                              setSelectedDonViCap1('');
                              setSelectedDonViCap2('');
                              setTuNgay('');
                              setDenNgay('');
                              setTrangThai('');
                            }}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Xóa bộ lọc
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={onNewExam}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Khám Bệnh Mới</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Details Modal */}
      <Modal
        isOpen={!!viewRecord}
        onClose={() => setViewRecord(null)}
        title={`Chi Tiết Hồ Sơ Khám: ${viewRecord?.ma_ho_so || ''}`}
        maxWidth="4xl"
      >
        {viewRecord && (
          <div className="space-y-5 text-xs">
            {/* Header info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500">Cán bộ:</span>
                <div className="font-bold text-slate-900 text-sm">
                  {viewRecord.ten_nhan_su}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Ngày sinh / Giới tính:</span>
                <div className="font-medium text-slate-800">
                  {viewRecord.ngay_sinh_nhan_su || '---'} ({viewRecord.gioi_tinh_nhan_su})
                </div>
              </div>
              <div>
                <span className="text-slate-500">Đơn vị / Chức vụ:</span>
                <div className="font-medium text-slate-800">
                  {viewRecord.ten_don_vi_nhan_su || '---'} (
                  {viewRecord.chuc_vu_nhan_su || viewRecord.cap_bac_nhan_su || 'Cán bộ'})
                </div>
              </div>
              <div>
                <span className="text-slate-500">Số BHYT:</span>
                <div className="font-mono font-bold text-sky-700">
                  {viewRecord.the_bhyt || 'Không'}
                </div>
              </div>
            </div>

            {/* Vitals & Clinical */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-sky-50/60 p-3.5 rounded-lg border border-sky-100 space-y-2">
                <div className="font-bold text-sky-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span>Chỉ số sinh hiệu</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>Huyết áp: <strong>{viewRecord.huyet_ap || '---'}</strong></div>
                  <div>Mạch: <strong>{viewRecord.mach ? `${viewRecord.mach} ck/p` : '---'}</strong></div>
                  <div>Nhiệt độ: <strong>{viewRecord.nhiet_do ? `${viewRecord.nhiet_do}°C` : '---'}</strong></div>
                  <div>Nhịp thở: <strong>{viewRecord.nhip_tho ? `${viewRecord.nhip_tho} l/p` : '---'}</strong></div>
                  <div>Cân nặng: <strong>{viewRecord.can_nang ? `${viewRecord.can_nang} kg` : '---'}</strong></div>
                  <div>Chiều cao: <strong>{viewRecord.chieu_cao ? `${viewRecord.chieu_cao} cm` : '---'}</strong></div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-500">Triệu chứng:</span>
                  <div className="font-medium text-slate-800">
                    {viewRecord.trieu_chung || 'Khám sức khỏe'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Chẩn đoán:</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {viewRecord.chan_doan}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Bác sĩ khám:</span>
                  <div className="font-semibold text-slate-800">
                    {viewRecord.ten_bac_si}
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <div className="font-bold text-slate-800 mb-2">
                Đơn thuốc & Dịch vụ chỉ định ({viewRecord.chi_tiet?.length || 0} mục):
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="py-2 px-3">STT</th>
                      <th className="py-2 px-3">Tên Mục</th>
                      <th className="py-2 px-3">Loại</th>
                      <th className="py-2 px-3 text-center">Số Lượng</th>
                      <th className="py-2 px-3 text-right">Đơn Giá</th>
                      <th className="py-2 px-3 text-right">Thành Tiền</th>
                      <th className="py-2 px-3">Cách Dùng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewRecord.chi_tiet?.map((ct, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {ct.ten_muc || ct.ten_thuoc || ct.ten_vat_tu || ct.ten_dich_vu || (ct.id_muc ? `Mục #${ct.id_muc}` : '')}
                        </td>
                        <td className="py-2 px-3">
                          <span className="capitalize text-slate-500">
                            {ct.loai_muc === 'thuoc'
                              ? 'Thuốc'
                              : ct.loai_muc === 'vat_tu'
                              ? 'Vật tư'
                              : 'Dịch vụ'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-bold">
                          {ct.so_luong} {ct.don_vi_tinh}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-600">
                          {formatVND(ct.don_gia)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          {formatVND(ct.thanh_tien)}
                        </td>
                        <td className="py-2 px-3 text-slate-600 italic">
                          {ct.cach_dung || '---'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Advice & Total */}
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500">Lời dặn:</span>{' '}
                <span className="font-medium text-slate-800 italic">
                  {viewRecord.loi_dan || 'Theo dõi và tái khám khi có bất thường.'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Tổng tiền:</span>{' '}
                <strong className="text-base font-bold text-sky-700">
                  {formatVND(viewRecord.tong_chi_phi)}
                </strong>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={(e) => {
                  handlePrintRecord(viewRecord, e);
                  setViewRecord(null);
                }}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Xem / In Biểu Mẫu</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleExportWord(viewRecord, e)}
                disabled={exportingId === viewRecord.id}
                className="cursor-pointer flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white rounded-lg font-bold shadow-md shadow-blue-900/20 transition-all hover:scale-[1.02]"
              >
                {exportingId === viewRecord.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang Tạo File Word...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>Tải File Word (.docx)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        title="Xác Nhận Xóa Phiếu Khám"
        maxWidth="md"
      >
        {recordToDelete && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-rose-800">
                  Bạn có chắc chắn muốn xóa phiếu khám này không?
                </p>
                <p className="text-rose-700 leading-relaxed">
                  Hành động này không thể hoàn tác. Mọi thông tin thuốc và dịch vụ chỉ định liên quan sẽ bị xóa khỏi cơ sở dữ liệu.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã hồ sơ:</span>
                <strong className="font-mono font-bold text-sky-700">{recordToDelete.ma_ho_so}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cán bộ / Bệnh nhân:</span>
                <strong className="text-slate-900">{recordToDelete.ten_nhan_su}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày khám:</span>
                <span className="font-medium text-slate-800">{recordToDelete.ngay_kham}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chẩn đoán:</span>
                <span className="font-semibold text-slate-800 italic max-w-[240px] truncate">
                  {recordToDelete.chan_doan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng chi phí:</span>
                <span className="font-bold text-slate-900">{formatVND(recordToDelete.tong_chi_phi)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Đang xóa...' : 'Đồng ý / Xóa'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
      {/* Clear All Exam Records Confirmation Modal */}
      <Modal
        isOpen={isClearAllModalOpen}
        onClose={() => !isDeleting && setIsClearAllModalOpen(false)}
        title="Xác Nhận Dọn Sạch Lịch Sử Khám & Đơn Thuốc"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-rose-900">
                Bạn có chắc chắn muốn dọn sạch toàn bộ hồ sơ y bạ?
              </p>
              <p className="text-rose-700 leading-relaxed">
                Hành động này sẽ xóa toàn bộ {records.length} hồ sơ khám bệnh và chi tiết đơn thuốc liên quan trong cơ sở dữ liệu SQLite.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dữ liệu được bảo vệ an toàn:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-700">
              <li>Danh sách Quân nhân / Cán bộ và thẻ BHYT giữ nguyên 100%</li>
              <li>Danh mục thuốc, vật tư và dịch vụ kỹ thuật giữ nguyên 100%</li>
              <li>Mẫu bệnh án, đơn vị cấp 1 & cấp 2 giữ nguyên 100%</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setIsClearAllModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmClearAll}
              className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Đang dọn sạch...' : 'Xác nhận dọn sạch'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

