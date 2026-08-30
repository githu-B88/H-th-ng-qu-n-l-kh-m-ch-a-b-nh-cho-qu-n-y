import React, { useState } from 'react';
import { HoSoKham } from '../../types';
import { Printer, ArrowLeft, FileText, CheckCircle2, ShieldCheck, FileDown, Loader2 } from 'lucide-react';
import { docTienBangChu, ensureTrailingDot } from '../../utils/docTienBangChu';
import { exportBangKeToDocx } from '../../utils/exportBangKeDocx';
import { getTreatmentDateRange } from '../../utils/treatmentDate';
import { getFormattedDonVi } from '../../utils/formatDonVi';
import { printElement } from '../../utils/printHelper';

interface PrescriptionPrintProps {
  record: HoSoKham;
  onBack?: () => void;
  onClose?: () => void;
}

export const PrescriptionPrint: React.FC<PrescriptionPrintProps> = ({
  record,
  onBack,
  onClose
}) => {
  const [templateType, setTemplateType] = useState<'quan_y_a4' | 'don_thuoc_rx'>('quan_y_a4');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportWord = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      setIsExporting(true);
      await exportBangKeToDocx(record);
    } catch (err) {
      console.error('Lỗi khi xuất file Word:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (templateType === 'quan_y_a4') {
      printElement('printable-bang-ke-sheet', {
        title: `Bang_Ke_KCB_${record.ma_ho_so || 'A4'}`,
        orientation: 'landscape',
      });
    } else {
      printElement('printable-prescription-sheet', {
        title: `Don_Thuoc_Rx_${record.ma_ho_so || 'A4'}`,
        orientation: 'portrait',
      });
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onClose) onClose();
    else if (onBack) onBack();
  };

  const formatDateVN = (dateStr?: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatNumberVN = (amount: number | string | null | undefined) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return '';
    try {
      const birthYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      return `${currentYear - birthYear} tuổi`;
    } catch {
      return '';
    }
  };

  // Treatment date range (5 days) & footer date parts from ngay_kham
  const { tuNgay, denNgay, day, month, year } = getTreatmentDateRange(record.ngay_kham);

  const medicineItems = record.chi_tiet?.filter((item) => item.loai_muc === 'thuoc') || [];
  const supplyItems = record.chi_tiet?.filter((item) => item.loai_muc === 'vat_tu') || [];
  const serviceItems = record.chi_tiet?.filter((item) => item.loai_muc === 'dich_vu_kt' || item.loai_muc === 'dich_vu' || item.loai_muc === 'dich_vu_ky_thuat') || [];

  const getItemName = (item: any) => {
    return item.ten_muc || item.ten_thuoc || item.ten_vat_tu || item.ten_dich_vu || (item.id_muc ? `Mục #${item.id_muc}` : '');
  };

  const donViDisplay = getFormattedDonVi(
    record.ten_don_vi_cap_1,
    record.ten_don_vi_cap_2,
    record.ten_don_vi_nhan_su
  );

  // Signer names formatting: [Cấp bậc] [Họ và tên]
  const tenNguoiBenhKy = [record.cap_bac_nhan_su, record.ten_nhan_su].filter(Boolean).join(' ') || record.ten_nhan_su || '';
  const tenBacSiKy = record.ten_bac_si || '';

  const ngayKhamDisplay = formatDateVN(record.ngay_kham) || `${day}/${month}/${year}`;
  const ngayKetThucDisplay = record.ngay_tai_kham
    ? formatDateVN(record.ngay_tai_kham)
    : ngayKhamDisplay;

  const maTheBHYT = record.ma_the_bhyt || record.the_bhyt || 'Chưa cập nhật';
  const tongChiPhi = record.tong_chi_phi || 0;
  const tongTienBangChu = ensureTrailingDot(docTienBangChu(tongChiPhi));
  const chanDoanDisplay = ensureTrailingDot(record.chan_doan) || 'Khám chữa bệnh theo chế độ.';

  return (
    <div className="space-y-4">
      {/* Top Toolbar (Hidden when printing) */}
      <div className="print:hidden relative z-20 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs pointer-events-auto">
        <button
          type="button"
          id="print-back-btn"
          onClick={handleClose}
          className="cursor-pointer relative z-10 flex items-center gap-2 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        {/* Template Selector Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold relative z-10">
          <button
            type="button"
            onClick={() => setTemplateType('quan_y_a4')}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              templateType === 'quan_y_a4'
                ? 'bg-white text-sky-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Mẫu 1: Bảng kê KCB Quân nhân (A4 Ngang)</span>
          </button>
          <button
            type="button"
            onClick={() => setTemplateType('don_thuoc_rx')}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              templateType === 'don_thuoc_rx'
                ? 'bg-white text-sky-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mẫu 2: Đơn thuốc & Phiếu khám (Rx)</span>
          </button>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            id="print-browser-btn"
            onClick={handlePrint}
            className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg text-xs font-semibold transition-colors"
            title="In trực tiếp qua máy in trình duyệt"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In Trực Tiếp</span>
          </button>

          <button
            type="button"
            id="download-word-btn"
            onClick={handleExportWord}
            disabled={isExporting}
            className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-900/20 transition-all hover:scale-[1.02]"
          >
            {isExporting ? (
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

      {/* Screen Preview Container */}
      <div className="bg-slate-100/70 p-4 sm:p-6 rounded-2xl border border-slate-200 print:bg-transparent print:p-0 print:border-none">
        {/* ======================= MẪU 1: BẢNG KÊ QUÂN NHÂN (CHÍNH THỨC) ======================= */}
        {templateType === 'quan_y_a4' && (
          <div
            id="printable-bang-ke-sheet"
            className="bg-white p-8 sm:p-12 rounded-xl border border-slate-300 shadow-sm max-w-5xl mx-auto text-black font-serif text-[12pt] leading-[1.35] print:border-none print:shadow-none print:p-0 print:m-0"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            {/* Phần 1: Tiêu đề */}
            <div className="flex justify-between items-start mb-3">
              <div className="text-center w-[250px]" style={{ fontSize: '13pt' }}>
                <div className="font-normal uppercase tracking-wide">BTL VÙNG 5 HQ</div>
                <div className="font-bold uppercase tracking-wide">
                  {(
                    (record as any).doctor?.level1Unit ||
                    (record as any).ten_don_vi_cap_1_bac_si ||
                    record.ten_don_vi_cap_1 ||
                    'PHÒNG THAM MƯU'
                  ).toUpperCase()}
                </div>
                <div
                  className="w-[110px] border-b border-black mx-auto relative -top-[3px]"
                  style={{ marginTop: '2px' }}
                ></div>
              </div>
              <div
                className="text-right"
                style={{ fontFamily: "'Times New Roman', serif", fontSize: '11pt' }}
              >
                <div>Mẫu số 08: Bảng kê chi phí KCB theo ngày</div>
              </div>
            </div>

            <div className="text-center my-3 w-full">
              <h1
                className="font-bold uppercase leading-snug whitespace-nowrap"
                style={{ fontSize: '14pt', whiteSpace: 'nowrap' }}
              >
                BẢNG KÊ CHI PHÍ KHÁM BỆNH, CHỮA BỆNH CỦA QUÂN NHÂN TẠI QUÂN Y ĐƠN VỊ
              </h1>
            </div>

            {/* Phần 2: I. Hành chính (12pt theo yêu cầu) */}
            <div className="mb-3 text-[12pt] space-y-1">
              <div className="font-bold text-[12pt]">I. Hành chính</div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span>Họ tên người bệnh: </span>
                  <span className="font-bold uppercase text-[12pt]">
                    {record.ten_nhan_su || '...................................................'}
                  </span>
                </div>
                <div>
                  <span>Ngày sinh: </span>
                  <span>{formatDateVN(record.ngay_sinh_nhan_su) || '................'}</span>
                </div>
                <div>
                  <span>Giới tính: </span>
                  <span>{record.gioi_tinh_nhan_su || 'Nam'}</span>
                </div>
              </div>

              <div>
                <span>Đơn vị: </span>
                <span>{donViDisplay}</span>
              </div>

              <div>
                <span>Mã thẻ BHYT: </span>
                <span className="font-mono font-semibold">{maTheBHYT}</span>
              </div>

              {/* Dòng 4: Đến khám và điều trị */}
              <div>
                <span>Đến khám và điều trị: </span>
                <span>{tuNgay}</span>
                <span> đến ngày </span>
                <span>{denNgay}</span>
              </div>

              <div>
                <span>Chẩn đoán: </span>
                <span className="font-semibold">{chanDoanDisplay}</span>
              </div>
            </div>

            {/* Phần 3: II. Chi phí khám, chữa bệnh (12pt) */}
            <div className="mb-2.5 text-[12pt]">
              <div className="font-bold text-[12pt] mb-1.5">II. Chi phí khám, chữa bệnh</div>
              <table className="w-full text-[11pt] border-collapse border border-black">
                <thead>
                  <tr className="bg-slate-100/50">
                    <th className="border border-black px-2 py-0.5 text-center font-bold w-[45px]">STT</th>
                    <th className="border border-black px-2 py-0.5 text-center font-bold">Nội dung</th>
                    <th className="border border-black px-2 py-0.5 text-center font-bold w-[85px]">Đơn vị tính</th>
                    <th className="border border-black px-2 py-0.5 text-center font-bold w-[65px]">Số lượng</th>
                    <th className="border border-black px-2 py-0.5 text-center font-bold w-[105px]">Đơn giá (đồng)</th>
                    <th className="border border-black px-2 py-0.5 text-center font-bold w-[115px]">Thành tiền (đồng)</th>
                    <th className="border border-black px-2 py-0.5 text-center font-bold w-[95px]">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Nhóm I. Thuốc */}
                  <tr>
                    <td className="border border-black px-2 py-0.5 text-center font-bold">I</td>
                    <td className="border border-black px-2 py-0.5 font-bold" colSpan={6}>
                      Thuốc
                    </td>
                  </tr>
                  {medicineItems.length > 0 ? (
                    medicineItems.map((item, idx) => (
                      <tr key={`m1-med-${idx}`}>
                        <td className="border border-black px-2 py-0.5 text-center">{idx + 1}</td>
                        <td className="border border-black px-2 py-0.5">{getItemName(item)}</td>
                        <td className="border border-black px-2 py-0.5 text-center">{item.don_vi_tinh}</td>
                        <td className="border border-black px-2 py-0.5 text-center font-semibold">{item.so_luong}</td>
                        <td className="border border-black px-2 py-0.5 text-right">{formatNumberVN(item.don_gia)}</td>
                        <td className="border border-black px-2 py-0.5 text-right font-semibold">
                          {formatNumberVN(item.thanh_tien || item.so_luong * item.don_gia)}
                        </td>
                        <td className="border border-black px-2 py-0.5 text-center text-[10pt]">{item.ghi_chu || ''}</td>
                      </tr>
                    ))
                  ) : (
                    [1, 2, 3].map((rowNum) => (
                      <tr key={`m1-empty-med-${rowNum}`}>
                        <td className="border border-black px-2 py-0.5 text-center">{rowNum}</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                      </tr>
                    ))
                  )}

                  {/* Nhóm II. Vật tư y tế */}
                  <tr>
                    <td className="border border-black px-2 py-0.5 text-center font-bold">II</td>
                    <td className="border border-black px-2 py-0.5 font-bold" colSpan={6}>
                      Vật tư y tế
                    </td>
                  </tr>
                  {supplyItems.length > 0 ? (
                    supplyItems.map((item, idx) => (
                      <tr key={`m1-sup-${idx}`}>
                        <td className="border border-black px-2 py-0.5 text-center">{idx + 1}</td>
                        <td className="border border-black px-2 py-0.5">{getItemName(item)}</td>
                        <td className="border border-black px-2 py-0.5 text-center">{item.don_vi_tinh}</td>
                        <td className="border border-black px-2 py-0.5 text-center font-semibold">{item.so_luong}</td>
                        <td className="border border-black px-2 py-0.5 text-right">{formatNumberVN(item.don_gia)}</td>
                        <td className="border border-black px-2 py-0.5 text-right font-semibold">
                          {formatNumberVN(item.thanh_tien || item.so_luong * item.don_gia)}
                        </td>
                        <td className="border border-black px-2 py-0.5 text-center text-[10pt]">{item.ghi_chu || ''}</td>
                      </tr>
                    ))
                  ) : (
                    [1, 2, 3].map((rowNum) => (
                      <tr key={`m1-empty-sup-${rowNum}`}>
                        <td className="border border-black px-2 py-0.5 text-center">{rowNum}</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                      </tr>
                    ))
                  )}

                  {/* Nhóm III. Dịch vụ kỹ thuật (ĐỂ TRỐNG 2 DÒNG NẾU KHÔNG CÓ DỊCH VỤ NÀO) */}
                  <tr>
                    <td className="border border-black px-2 py-0.5 text-center font-bold">III</td>
                    <td className="border border-black px-2 py-0.5 font-bold" colSpan={6}>
                      Dịch vụ kỹ thuật
                    </td>
                  </tr>
                  {serviceItems.length > 0 ? (
                    serviceItems.map((item, idx) => (
                      <tr key={`m1-srv-${idx}`}>
                        <td className="border border-black px-2 py-0.5 text-center">{idx + 1}</td>
                        <td className="border border-black px-2 py-0.5">{getItemName(item)}</td>
                        <td className="border border-black px-2 py-0.5 text-center">{item.don_vi_tinh}</td>
                        <td className="border border-black px-2 py-0.5 text-center font-semibold">{item.so_luong}</td>
                        <td className="border border-black px-2 py-0.5 text-right">{formatNumberVN(item.don_gia)}</td>
                        <td className="border border-black px-2 py-0.5 text-right font-semibold">
                          {formatNumberVN(item.thanh_tien || item.so_luong * item.don_gia)}
                        </td>
                        <td className="border border-black px-2 py-0.5 text-center text-[10pt]">{item.ghi_chu || ''}</td>
                      </tr>
                    ))
                  ) : (
                    [1, 2].map((rowNum) => (
                      <tr key={`m1-empty-srv-${rowNum}`}>
                        <td className="border border-black px-2 py-0.5 text-center">{rowNum}</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                        <td className="border border-black px-2 py-0.5">&nbsp;</td>
                      </tr>
                    ))
                  )}

                  {/* Dòng cuối cùng của bảng: Tổng cộng và [tong_chi_phi] */}
                  <tr className="font-bold">
                    <td className="border border-black px-2 py-1 text-center" colSpan={2}>
                      Tổng cộng
                    </td>
                    <td className="border border-black px-2 py-1 text-center" colSpan={3}></td>
                    <td className="border border-black px-2 py-1 text-right text-[12pt]">
                      {formatNumberVN(tongChiPhi)}
                    </td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Phần 4: Số tiền bằng chữ (12pt) */}
            <div className="mb-4 text-[12pt]">
              <span>Số tiền (viết bằng chữ): </span>
              <span className="font-bold italic">{tongTienBangChu}</span>
            </div>

            {/* Phần 5: Chữ ký (Footer) - 60pt khoảng trống chữ ký */}
            <div
              className="text-[12pt] leading-normal"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '24px'
              }}
            >
              <div style={{ width: '33.33%', textAlign: 'center' }}>
                <div style={{ visibility: 'hidden', marginBottom: '6px' }}>&nbsp;</div>
                <div style={{ fontWeight: 'bold' }}>NGƯỜI LẬP BẢNG KÊ</div>
                <div style={{ marginTop: '60pt', fontWeight: 'bold', fontSize: '12pt' }}>
                  {record.ten_bac_si || ''}
                </div>
              </div>

              <div style={{ width: '33.33%', textAlign: 'center' }}>
                <div style={{ visibility: 'hidden', marginBottom: '6px' }}>&nbsp;</div>
                <div style={{ fontWeight: 'bold' }}>XÁC NHẬN CỦA NGƯỜI BỆNH</div>
                <div style={{ marginTop: '60pt', fontWeight: 'bold', fontSize: '12pt' }}>
                  {record.ten_nhan_su || ''}
                </div>
              </div>

              <div style={{ width: '33.33%', textAlign: 'center' }}>
                <div style={{ fontStyle: 'italic', marginBottom: '6px' }}>
                  Ngày {day} tháng {month} năm {year}
                </div>
                <div style={{ fontWeight: 'bold' }}>PHỤ TRÁCH QUÂN Y ĐƠN VỊ</div>
                <div style={{ marginTop: '60pt', fontWeight: 'bold', fontSize: '12pt' }}>
                  {record.ten_bac_si || ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= MẪU 2: ĐƠN THUỐC & PHIẾU KHÁM LÂM SÀNG (MẪU RX) ======================= */}
        {templateType === 'don_thuoc_rx' && (
          <div
            id="printable-prescription-sheet"
            className="bg-white p-8 sm:p-12 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto text-slate-900"
          >
            {/* Header Unit Info */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  BTL VÙNG 5 HẢI QUÂN
                </div>
                <div className="text-sm font-black uppercase text-sky-800 tracking-wide">
                  BỘ PHẬN QUÂN Y - PHÒNG THAM MƯU
                </div>
                <div className="text-xs text-slate-600">
                  Đơn vị: {donViDisplay}
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-xs font-mono font-bold text-slate-800">
                  Mã hồ sơ: <span className="text-sky-700">{record.ma_ho_so}</span>
                </div>
                <div className="text-xs text-slate-600">
                  Ngày khám: {ngayKhamDisplay}
                </div>
                <div className="text-xs text-emerald-700 font-semibold flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {record.trang_thai_bhyt === 1
                    ? 'Hưởng quyền lợi BHYT'
                    : record.trang_thai_bhyt === 2
                    ? 'Cơ quan cấp miễn phí'
                    : 'Tự chi trả viện phí'}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center my-4 space-y-1">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-900">
                ĐƠN THUỐC VÀ PHIẾU KHÁM BỆNH
              </h1>
              <p className="text-xs italic text-slate-500">
                (Lưu hành nội bộ theo quy chế y tế quân y đơn vị)
              </p>
            </div>

            {/* Patient Profile Box */}
            <div className="bg-slate-50/80 rounded-lg p-4 border border-slate-200 text-sm space-y-2 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-4">
                <div>
                  <span className="text-slate-500">Họ và tên:</span>{' '}
                  <strong className="text-slate-900 uppercase font-bold">
                    {record.ten_nhan_su}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Ngày sinh:</span>{' '}
                  <span className="font-medium">
                    {formatDateVN(record.ngay_sinh_nhan_su) || '---'} {record.ngay_sinh_nhan_su && `(${calculateAge(record.ngay_sinh_nhan_su)})`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Giới tính:</span>{' '}
                  <span className="font-medium">{record.gioi_tinh_nhan_su || '---'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-4">
                <div>
                  <span className="text-slate-500">Đơn vị:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {donViDisplay}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Cấp bậc / Chức vụ:</span>{' '}
                  <span className="font-medium">
                    {[record.cap_bac_nhan_su, record.chuc_vu_nhan_su].filter(Boolean).join(' - ') || '---'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Mã thẻ BHYT:</span>{' '}
                  <span className="font-mono font-semibold text-slate-800">
                    {maTheBHYT}
                  </span>
                </div>
              </div>
            </div>

            {/* Clinical Exam & Vitals */}
            <div className="mb-6 space-y-3">
              {(record.mach || record.nhiet_do || record.huyet_ap || record.nhip_tho || record.can_nang) && (
                <div className="flex flex-wrap items-center gap-4 bg-sky-50/60 p-2.5 rounded-lg border border-sky-100 text-xs">
                  <span className="font-bold text-sky-900 uppercase">Sinh hiệu:</span>
                  {record.huyet_ap && (
                    <span>
                      Huyết áp: <strong>{record.huyet_ap}</strong> mmHg
                    </span>
                  )}
                  {record.mach && (
                    <span>
                      Mạch: <strong>{record.mach}</strong> ck/phút
                    </span>
                  )}
                  {record.nhiet_do && (
                    <span>
                      Thân nhiệt: <strong>{record.nhiet_do}</strong> °C
                    </span>
                  )}
                  {record.nhip_tho && (
                    <span>
                      Nhịp thở: <strong>{record.nhip_tho}</strong> l/phút
                    </span>
                  )}
                  {record.can_nang && (
                    <span>
                      Cân nặng: <strong>{record.can_nang}</strong> kg
                    </span>
                  )}
                </div>
              )}

              <div className="text-sm space-y-1.5">
                <div>
                  <span className="font-bold text-slate-700">Triệu chứng lâm sàng:</span>{' '}
                  <span className="text-slate-900">{record.trieu_chung || 'Khám sức khỏe định kỳ'}</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  <span className="text-sky-800">Chẩn đoán:</span> {chanDoanDisplay}
                </div>
              </div>
            </div>

            {/* Prescribed Medicines */}
            <div className="mb-6 space-y-4">
              <div className="font-bold text-sm uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 flex justify-between items-center">
                <span>I. CHỈ ĐỊNH THUỐC ĐIỀU TRỊ (Rx)</span>
                <span className="text-xs font-normal lowercase text-slate-500">
                  ({medicineItems.length} loại thuốc)
                </span>
              </div>

              {medicineItems.length > 0 ? (
                <div className="space-y-3">
                  {medicineItems.map((item, idx) => (
                    <div key={`m2-med-${idx}`} className="text-sm pl-2 border-l-2 border-sky-400">
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <div>
                          <span>{idx + 1}. {item.ten_muc}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span>
                            SL: {item.so_luong} {item.don_vi_tinh}
                          </span>
                        </div>
                      </div>
                      {item.cach_dung && (
                        <div className="text-xs text-slate-700 italic mt-0.5 pl-4">
                          ↳ Cách dùng: {item.cach_dung}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs italic text-slate-500 pl-2">
                  Không chỉ định dùng thuốc.
                </div>
              )}

              {/* Supplies & Services */}
              {(supplyItems.length > 0 || serviceItems.length > 0) && (
                <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    II. VẬT TƯ & DỊCH VỤ KỸ THUẬT THỰC HIỆN
                  </div>
                  <ul className="text-xs list-disc list-inside space-y-1 text-slate-800 pl-2">
                    {serviceItems.map((sv, idx) => (
                      <li key={`m2-sv-${idx}`}>
                        Dịch vụ: <strong>{sv.ten_muc}</strong> (SL: {sv.so_luong} {sv.don_vi_tinh})
                      </li>
                    ))}
                    {supplyItems.map((vt, idx) => (
                      <li key={`m2-vt-${idx}`}>
                        Vật tư: <strong>{vt.ten_muc}</strong> (SL: {vt.so_luong} {vt.don_vi_tinh})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Advice & Revisit */}
            <div className="bg-amber-50/50 rounded-lg p-3.5 border border-amber-200/60 text-sm space-y-2 mb-8">
              <div>
                <span className="font-bold text-slate-800">Lời dặn của bác sĩ:</span>{' '}
                <span className="text-slate-800 italic">
                  {record.loi_dan || 'Uống thuốc đúng giờ, đúng liều lượng. Nếu có dấu hiệu bất thường báo ngay cho Trạm Y tế.'}
                </span>
              </div>
              {record.ngay_tai_kham && (
                <div className="text-xs font-semibold text-rose-700">
                  Hẹn tái khám ngày: {formatDateVN(record.ngay_tai_kham)}
                </div>
              )}
            </div>

            {/* Cost Summary */}
            <div className="flex justify-between items-center text-xs text-slate-600 border-t border-slate-200 pt-2 mb-8">
              <span>Tổng giá trị đơn thuốc/dịch vụ: <strong className="text-slate-800">{formatNumberVN(record.tong_chi_phi)} đ</strong></span>
              <span>Chế độ: <strong className="text-slate-800">{record.trang_thai_bhyt === 1 ? 'Thanh toán theo diện BHYT' : record.trang_thai_bhyt === 2 ? 'Miễn phí nội bộ' : 'Tự túc'}</strong></span>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 text-center text-sm pt-2">
              <div className="space-y-16">
                <div>
                  <div className="font-bold text-slate-800 uppercase">NGƯỜI NHẬN THUỐC</div>
                  <div className="text-xs italic text-slate-500">(Ký và ghi rõ họ tên)</div>
                </div>
                <div className="font-semibold text-slate-900">{record.ten_nhan_su}</div>
              </div>

              <div className="space-y-16">
                <div>
                  <div className="text-xs italic text-slate-600 mb-1">
                    Ngày {day} tháng {month} năm {year}
                  </div>
                  <div className="font-bold text-slate-800 uppercase">BÁC SĨ / Y SĨ KHÁM BỆNH</div>
                  <div className="text-xs italic text-slate-500">(Ký và ghi rõ họ tên)</div>
                </div>
                <div className="font-bold text-sky-900">{record.ten_bac_si || 'Bác sĩ phụ trách'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
