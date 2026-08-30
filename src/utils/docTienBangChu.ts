/**
 * Chuyển đổi số tiền thành chữ Tiếng Việt chuẩn hóa dùng cho hóa đơn, chứng từ kế toán và bệnh án y tế.
 * Ví dụ: 288500 -> "Hai trăm tám mươi tám nghìn năm trăm đồng"
 */

const CHU_SO = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const DON_VI_TIEN = 'đồng';

function docNhomBaChuSo(baChuSo: number, docKhongTram: boolean): string {
  const tram = Math.floor(baChuSo / 100);
  const chuc = Math.floor((baChuSo % 100) / 10);
  const donVi = baChuSo % 10;
  let ketQua = '';

  if (tram > 0 || docKhongTram) {
    ketQua += `${CHU_SO[tram]} trăm `;
  }

  if (chuc > 1) {
    ketQua += `${CHU_SO[chuc]} mươi `;
    if (donVi === 1) {
      ketQua += 'mốt ';
    } else if (donVi === 5) {
      ketQua += 'lăm ';
    } else if (donVi > 0) {
      ketQua += `${CHU_SO[donVi]} `;
    }
  } else if (chuc === 1) {
    ketQua += 'mười ';
    if (donVi === 1) {
      ketQua += 'một ';
    } else if (donVi === 5) {
      ketQua += 'lăm ';
    } else if (donVi > 0) {
      ketQua += `${CHU_SO[donVi]} `;
    }
  } else if (chuc === 0) {
    if (donVi > 0) {
      if (tram > 0 || docKhongTram) {
        ketQua += `linh ${CHU_SO[donVi]} `;
      } else {
        ketQua += `${CHU_SO[donVi]} `;
      }
    }
  }

  return ketQua.trim();
}

export function docTienBangChu(soTien: number | string | null | undefined): string {
  if (soTien === null || soTien === undefined) return 'Không đồng';
  
  const num = typeof soTien === 'string' ? parseFloat(soTien.replace(/,/g, '')) : soTien;
  if (isNaN(num) || num === 0) return 'Không đồng';

  let n = Math.abs(Math.round(num));
  if (n === 0) return 'Không đồng';

  const cacLop: string[] = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const nhomBa: number[] = [];

  while (n > 0) {
    nhomBa.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  let chuoiDoc = '';
  for (let i = nhomBa.length - 1; i >= 0; i--) {
    const giaTriNhom = nhomBa[i];
    if (giaTriNhom > 0) {
      // Chỉ đọc "không trăm" nếu không phải nhóm cao nhất (đầu tiên)
      const docKhongTram = i < nhomBa.length - 1;
      const chuoiNhom = docNhomBaChuSo(giaTriNhom, docKhongTram);
      chuoiDoc += `${chuoiNhom} ${cacLop[i]} `;
    }
  }

  chuoiDoc = chuoiDoc.trim().replace(/\s+/g, ' ');
  if (!chuoiDoc) return 'Không đồng';

  // Viết hoa chữ cái đầu tiên và thêm đơn vị "đồng"
  const ketQuaCuoi = chuoiDoc.charAt(0).toUpperCase() + chuoiDoc.slice(1) + ` ${DON_VI_TIEN}`;
  return ketQuaCuoi;
}

/**
 * Đảm bảo chuỗi luôn kết thúc bằng dấu chấm "."
 */
export function ensureTrailingDot(text?: string | null): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (!trimmed) return '';
  return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
}

