import React from 'react';
import { HoSoKham } from '../../types';
import { docTienBangChu, ensureTrailingDot } from '../../utils/docTienBangChu';
import { getTreatmentDateRange } from '../../utils/treatmentDate';
import { getFormattedDonVi, formatDonViCap1BacSiHeader } from '../../utils/formatDonVi';

export { docTienBangChu };

interface PrintTemplateProps {
  record: HoSoKham;
}

export const PrintTemplate: React.FC<PrintTemplateProps> = ({ record }) => {
  // Format date helper: YYYY-MM-DD -> DD/MM/YYYY
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

  // Format currency: 288500 -> 288.500
  const formatNumberVN = (amount: number | string | null | undefined) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  // Treatment date range (5 days) & footer date parts from ngay_kham
  const { tuNgay, denNgay, day, month, year } = getTreatmentDateRange(record.ngay_kham);

  // Split details into categories
  const medicineItems = record.chi_tiet?.filter((item) => item.loai_muc === 'thuoc') || [];
  const supplyItems = record.chi_tiet?.filter((item) => item.loai_muc === 'vat_tu') || [];
  const serviceItems = record.chi_tiet?.filter((item) => item.loai_muc === 'dich_vu_kt' || item.loai_muc === 'dich_vu' || item.loai_muc === 'dich_vu_ky_thuat') || [];

  // Helper to extract item display name
  const getItemName = (item: any) => {
    return item.ten_muc || item.ten_thuoc || item.ten_vat_tu || item.ten_dich_vu || (item.id_muc ? `Mục #${item.id_muc}` : '');
  };

  // Units formatting
  const donViDisplay = getFormattedDonVi(
    record.ten_don_vi_cap_1,
    record.ten_don_vi_cap_2,
    record.ten_don_vi_nhan_su
  );

  // Doctor Level 1 Unit (Tiêu ngữ góc trái biến động theo bác sĩ đang khám, bỏ từ Vùng ở cuối nếu có)
  const donViCap1BacSi = formatDonViCap1BacSiHeader(
    (record as any).doctor?.level1Unit ||
    (record as any).ten_don_vi_cap_1_bac_si ||
    record.ten_don_vi_cap_1
  );

  // Signer names formatting: Chỉ binding duy nhất họ và tên (fullName), loại bỏ cấp bậc/chức vụ
  const tenNguoiBenhKy = record.ten_nhan_su || '';
  const tenBacSiKy = record.ten_bac_si || '';

  // BHYT card
  const maTheBHYT = record.ma_the_bhyt || record.the_bhyt || 'Chưa cập nhật';

  // Total cost & Diagnosis with period
  const tongChiPhi = record.tong_chi_phi || 0;
  const tongTienBangChu = ensureTrailingDot(docTienBangChu(tongChiPhi));
  const chanDoanDisplay = ensureTrailingDot(record.chan_doan) || 'Khám chữa bệnh theo chế độ.';

  return (
    <div
      id="print-area"
      className="hidden print:block bg-white text-black font-serif text-[12pt] leading-[1.3] p-0 m-0 w-full"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        @page {
          size: A4 landscape;
          margin: 1.3cm 1.5cm 0cm 2.5cm;
          @top-center {
            content: counter(page);
            font-size: 11pt;
            font-family: "Times New Roman", serif;
          }
        }
        @page :first {
          @top-center {
            content: "";
          }
        }
        .print-table th, .print-table td {
          padding: 0.5px 3px !important;
          height: 16px !important;
          line-height: 1.18 !important;
        }
      `}</style>

      {/* PHẦN 1: TIÊU ĐỀ (HEADER) */}
      <div className="flex justify-between items-start mb-2">
        {/* Góc trên cùng bên trái: căn giữa 2 dòng, font 13pt chuẩn */}
        <div className="text-center w-[250px]" style={{ fontSize: '13pt' }}>
          <div className="font-normal uppercase tracking-wide leading-tight">BTL VÙNG 5 HQ</div>
          <div className="font-bold uppercase tracking-wide leading-[1.05] mt-0.5" style={{ lineHeight: '1.05' }}>{donViCap1BacSi}</div>
          <div
            className="w-[110px] border-b border-black mx-auto relative -top-[3px]"
            style={{ marginTop: '2px' }}
          ></div>
        </div>

        {/* Góc trên cùng bên phải */}
        <div
          className="text-right"
          style={{ fontFamily: "'Times New Roman', serif", fontSize: '11pt' }}
        >
          <div>Mẫu số 08: Bảng kê chi phí KCB theo ngày</div>
        </div>
      </div>

      {/* Tiêu đề chính: Căn giữa trang, in đậm, chữ 14pt chuẩn */}
      <div className="text-center my-2 w-full">
        <h1
          className="font-bold uppercase leading-snug whitespace-nowrap"
          style={{ fontSize: '14pt', whiteSpace: 'nowrap' }}
        >
          BẢNG KÊ CHI PHÍ KHÁM BỆNH, CHỮA BỆNH CỦA QUÂN NHÂN TẠI QUÂN Y ĐƠN VỊ
        </h1>
      </div>

      {/* PHẦN 2: I. HÀNH CHÍNH (IN ĐẬM - 11pt) - Giảm font size đi 1 đơn vị theo yêu cầu */}
      <div className="mb-1.5 text-[11pt] space-y-[1px] leading-[1.15]">
        <div className="font-bold text-[11pt] mb-0.5">I. Hành chính</div>

        {/* Dòng 1: Họ tên, Ngày sinh, Giới tính */}
        <div className="flex items-baseline justify-between">
          <div>
            <span>Họ tên người bệnh: </span>
            <span className="font-bold uppercase text-[11pt]">
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

        {/* Dòng 2: Đơn vị */}
        <div>
          <span>Đơn vị: </span>
          <span>{donViDisplay}</span>
        </div>

        {/* Dòng 3: Mã thẻ BHYT */}
        <div>
          <span>Mã thẻ BHYT: </span>
          <span className="font-mono font-semibold">{maTheBHYT}</span>
        </div>

        {/* Dòng 4: Đến khám và điều trị (Thời hạn điều trị 5 ngày) */}
        <div>
          <span>Đến khám và điều trị: </span>
          <span>{tuNgay}</span>
          <span> đến ngày </span>
          <span>{denNgay}</span>
        </div>

        {/* Dòng 5: Chẩn đoán */}
        <div>
          <span>Chẩn đoán: </span>
          <span className="font-semibold">{chanDoanDisplay}</span>
        </div>
      </div>

      {/* PHẦN 3: II. CHI PHÍ KHÁM, CHỮA BỆNH (IN ĐẬM - 12pt, Bảng tăng 1 đơn vị lên 11pt) */}
      <div className="mb-1.5 text-[12pt]">
        <div className="font-bold text-[12pt] mb-0.5">II. Chi phí khám, chữa bệnh</div>

        {/* Bảng viền đen border-collapse: collapse - Font 11pt, row height 16px */}
        <table
          className="print-table w-full text-[11pt] border-collapse border border-black leading-none"
          style={{ borderCollapse: 'collapse', borderColor: '#000' }}
        >
          <thead>
            <tr className="bg-slate-100/50">
              <th className="border border-black px-1 py-0 text-center font-bold w-[45px] h-[18px]">STT</th>
              <th className="border border-black px-1 py-0 text-center font-bold h-[18px]">Nội dung</th>
              <th className="border border-black px-1 py-0 text-center font-bold w-[85px] h-[18px]">Đơn vị tính</th>
              <th className="border border-black px-1 py-0 text-center font-bold w-[65px] h-[18px]">Số lượng</th>
              <th className="border border-black px-1 py-0 text-center font-bold w-[105px] h-[18px]">Đơn giá (đồng)</th>
              <th className="border border-black px-1 py-0 text-center font-bold w-[115px] h-[18px]">Thành tiền (đồng)</th>
              <th className="border border-black px-1 py-0 text-center font-bold w-[95px] h-[18px]">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {/* Nhóm I. Thuốc */}
            <tr>
              <td className="border border-black px-1 py-0 text-center font-bold h-[16px]">I</td>
              <td className="border border-black px-1 py-0 font-bold h-[16px]" colSpan={6}>
                Thuốc
              </td>
            </tr>
            {medicineItems.length > 0 ? (
              medicineItems.map((item, idx) => (
                <tr key={`med-${idx}`}>
                  <td className="border border-black px-1 py-0 text-center h-[16px]">{idx + 1}</td>
                  <td className="border border-black px-1 py-0 h-[16px]">{getItemName(item)}</td>
                  <td className="border border-black px-1 py-0 text-center h-[16px]">{item.don_vi_tinh}</td>
                  <td className="border border-black px-1 py-0 text-center font-semibold h-[16px]">{item.so_luong}</td>
                  <td className="border border-black px-1 py-0 text-right h-[16px]">{formatNumberVN(item.don_gia)}</td>
                  <td className="border border-black px-1 py-0 text-right font-semibold h-[16px]">
                    {formatNumberVN(item.thanh_tien || item.so_luong * item.don_gia)}
                  </td>
                  <td className="border border-black px-1 py-0 text-center text-[10pt] h-[16px]">{item.ghi_chu || ''}</td>
                </tr>
              ))
            ) : (
              [1, 2, 3].map((rowNum) => (
                <tr key={`empty-med-${rowNum}`}>
                  <td className="border border-black px-1 py-0 text-center h-[16px]">{rowNum}</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                </tr>
              ))
            )}

            {/* Nhóm II. Vật tư y tế */}
            <tr>
              <td className="border border-black px-1 py-0 text-center font-bold h-[16px]">II</td>
              <td className="border border-black px-1 py-0 font-bold h-[16px]" colSpan={6}>
                Vật tư y tế
              </td>
            </tr>
            {supplyItems.length > 0 ? (
              supplyItems.map((item, idx) => (
                <tr key={`sup-${idx}`}>
                  <td className="border border-black px-1 py-0 text-center h-[16px]">{idx + 1}</td>
                  <td className="border border-black px-1 py-0 h-[16px]">{getItemName(item)}</td>
                  <td className="border border-black px-1 py-0 text-center h-[16px]">{item.don_vi_tinh}</td>
                  <td className="border border-black px-1 py-0 text-center font-semibold h-[16px]">{item.so_luong}</td>
                  <td className="border border-black px-1 py-0 text-right h-[16px]">{formatNumberVN(item.don_gia)}</td>
                  <td className="border border-black px-1 py-0 text-right font-semibold h-[16px]">
                    {formatNumberVN(item.thanh_tien || item.so_luong * item.don_gia)}
                  </td>
                  <td className="border border-black px-1 py-0 text-center text-[10pt] h-[16px]">{item.ghi_chu || ''}</td>
                </tr>
              ))
            ) : (
              [1, 2, 3].map((rowNum) => (
                <tr key={`empty-sup-${rowNum}`}>
                  <td className="border border-black px-1 py-0 text-center h-[16px]">{rowNum}</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                </tr>
              ))
            )}

            {/* Nhóm III. Dịch vụ kỹ thuật (ĐỂ TRỐNG 2 DÒNG NẾU KHÔNG CÓ DỊCH VỤ NÀO) */}
            <tr>
              <td className="border border-black px-1 py-0 text-center font-bold h-[16px]">III</td>
              <td className="border border-black px-1 py-0 font-bold h-[16px]" colSpan={6}>
                Dịch vụ kỹ thuật
              </td>
            </tr>
            {serviceItems.length > 0 ? (
              serviceItems.map((item, idx) => (
                <tr key={`srv-${idx}`}>
                  <td className="border border-black px-1 py-0 text-center h-[16px]">{idx + 1}</td>
                  <td className="border border-black px-1 py-0 h-[16px]">{getItemName(item)}</td>
                  <td className="border border-black px-1 py-0 text-center h-[16px]">{item.don_vi_tinh}</td>
                  <td className="border border-black px-1 py-0 text-center font-semibold h-[16px]">{item.so_luong}</td>
                  <td className="border border-black px-1 py-0 text-right h-[16px]">{formatNumberVN(item.don_gia)}</td>
                  <td className="border border-black px-1 py-0 text-right font-semibold h-[16px]">
                    {formatNumberVN(item.thanh_tien || item.so_luong * item.don_gia)}
                  </td>
                  <td className="border border-black px-1 py-0 text-center text-[10pt] h-[16px]">{item.ghi_chu || ''}</td>
                </tr>
              ))
            ) : (
              [1, 2].map((rowNum) => (
                <tr key={`empty-srv-${rowNum}`}>
                  <td className="border border-black px-1 py-0 text-center h-[16px]">{rowNum}</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                  <td className="border border-black px-1 py-0 h-[16px]">&nbsp;</td>
                </tr>
              ))
            )}

            {/* Dòng cuối cùng của bảng: Tổng cộng và [tong_chi_phi] */}
            <tr className="font-bold">
              <td className="border border-black px-1 py-0 text-center h-[18px]" colSpan={2}>
                Tổng cộng
              </td>
              <td className="border border-black px-1 py-0 text-center h-[18px]" colSpan={3}></td>
              <td className="border border-black px-1 py-0 text-right text-[11pt] h-[18px]">
                {formatNumberVN(tongChiPhi)}
              </td>
              <td className="border border-black px-1 py-0 h-[18px]"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PHẦN 4: SỐ TIỀN BẰNG CHỮ (12pt) */}
      <div className="text-[12pt] mb-0" style={{ marginBottom: '0px', lineHeight: '1.2' }}>
        <span>Số tiền (viết bằng chữ): </span>
        <span className="font-bold italic">{tongTienBangChu}</span>
      </div>

      {/* PHẦN 5: CHỮ KÝ (FOOTER) - 55pt KHOẢNG TRỐNG CHỮ KÝ - Khoảng cách trên chính xác 5px */}
      <div
        className="text-[12pt] leading-normal"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '5px',
          pageBreakInside: 'avoid'
        }}
      >
        {/* Cột 1: NGƯỜI LẬP BẢNG KÊ */}
        <div style={{ width: '33.33%', textAlign: 'center' }}>
          <div style={{ visibility: 'hidden', marginBottom: '6px' }}>&nbsp;</div>
          <div style={{ fontWeight: 'bold' }}>NGƯỜI LẬP BẢNG KÊ</div>
          <div style={{ marginTop: '55pt', fontWeight: 'bold', fontSize: '12pt' }}>
            {record.ten_bac_si || ''}
          </div>
        </div>

        {/* Cột 2: XÁC NHẬN CỦA NGƯỜI BỆNH */}
        <div style={{ width: '33.33%', textAlign: 'center' }}>
          <div style={{ visibility: 'hidden', marginBottom: '6px' }}>&nbsp;</div>
          <div style={{ fontWeight: 'bold' }}>XÁC NHẬN CỦA NGƯỜI BỆNH</div>
          <div style={{ marginTop: '55pt', fontWeight: 'bold', fontSize: '12pt' }}>
            {record.ten_nhan_su || ''}
          </div>
        </div>

        {/* Cột 3: Ngày ... tháng ... năm ... & PHỤ TRÁCH QUÂN Y ĐƠN VỊ */}
        <div style={{ width: '33.33%', textAlign: 'center' }}>
          <div style={{ fontStyle: 'italic', marginBottom: '6px' }}>
            Ngày {day} tháng {month} năm {year}
          </div>
          <div style={{ fontWeight: 'bold' }}>PHỤ TRÁCH QUÂN Y ĐƠN VỊ</div>
          <div style={{ marginTop: '55pt', fontWeight: 'bold', fontSize: '12pt' }}>
            {record.ten_bac_si || ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintTemplate;
