/**
 * Chuẩn hóa chuỗi để so sánh (chuyển chữ thường, bỏ dấu tiếng Việt, chuẩn hóa khoảng trắng)
 */
const normalizeText = (str: string): string => {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Kiểm tra xem Đơn vị cấp 1 có thuộc 1 trong 3 phòng Vùng:
 * 1. Phòng Tham mưu (hoặc Phòng Tham mưu vùng)
 * 2. Phòng Chính trị (hoặc Phòng Chính trị vùng)
 * 3. Phòng Hậu cần - Kỹ thuật / Phòng HC-KT (hoặc Phòng HC-KT vùng)
 */
export const isPhongVung = (tenCap1?: string | null): boolean => {
  if (!tenCap1) return false;
  const norm = normalizeText(tenCap1);
  if (!norm) return false;

  // 1. Phòng Tham mưu (hoặc Phòng Tham mưu vùng)
  const isThamMuu =
    norm.includes('tham muu') ||
    norm === 'phong tm' ||
    norm === 'phong tm vung';

  // 2. Phòng Chính trị (hoặc Phòng Chính trị vùng)
  const isChinhTri =
    norm.includes('chinh tri') ||
    norm === 'phong ct' ||
    norm === 'phong ct vung';

  // 3. Phòng Hậu cần - Kỹ thuật / Phòng HC-KT (hoặc Phòng HC-KT vùng)
  const isHauCanKyThuat =
    norm.includes('hau can') ||
    norm.includes('ky thuat') ||
    norm.includes('hc kt') ||
    norm.includes('hckt') ||
    norm.includes('phong hc');

  return isThamMuu || isChinhTri || isHauCanKyThuat;
};

/**
 * Kiểm tra xem Đơn vị có thuộc Phòng Tham mưu (hoặc Phòng Tham mưu Vùng) không
 */
export const isThamMuuUnit = (tenDonVi?: string | null): boolean => {
  if (!tenDonVi) return false;
  const norm = normalizeText(tenDonVi);
  return (
    norm.includes('tham muu') ||
    norm === 'phong tm' ||
    norm === 'phong tm vung' ||
    norm.includes('tac chien') ||
    norm.includes('quan luc') ||
    norm.includes('quan huan')
  );
};

/**
 * Kiểm tra xem Bác sĩ có thuộc Phòng Tham mưu Vùng hay không
 */
export const isThamMuuDoctor = (doc: any): boolean => {
  if (!doc) return false;
  const cap1Id = Number(doc.id_don_vi_cap_1 || 0);
  if (cap1Id === 1) return true;
  if (isThamMuuUnit(doc.ten_don_vi_cap_1)) return true;
  if (isThamMuuUnit(doc.ten_don_vi)) return true;
  return false;
};

/**
 * Tinh chỉnh tên Đơn vị cấp 1 của Bác sĩ khám hiển thị dưới dòng "BTL VÙNG 5 HQ":
 * - Chỉ thay đổi nếu đơn vị nào có từ "Vùng" / "vùng" ở sau cùng (ví dụ "Phòng Tham mưu Vùng" -> "PHÒNG THAM MƯU", "Phòng Chính trị Vùng" -> "PHÒNG CHÍNH TRỊ", "Phòng Hậu cần-Kỹ thuật Vùng" -> "PHÒNG HẬU CẦN-KỸ THUẬT")
 * - Các đơn vị khác (Tiểu đoàn 553, Tiểu đoàn 563, Tiểu đoàn Phương tiện không người lái, v.v.) giữ nguyên (ví dụ "TIỂU ĐOÀN 553").
 */
export const formatDonViCap1BacSiHeader = (rawUnit?: string | null): string => {
  if (!rawUnit || !rawUnit.trim()) {
    return 'PHÒNG THAM MƯU';
  }
  let unit = rawUnit.trim();
  // Nếu có từ "vùng" / "Vùng" / "VÙNG" ở cuối chuỗi thì bỏ từ đó đi
  unit = unit.replace(/\s+Vùng$/i, '').trim();
  return unit.toUpperCase();
};

/**
 * Hàm helper xử lý chuỗi đơn vị hiển thị tại phần "I. Hành chính" của Bảng kê:
 * - Nếu tenCap1 thuộc 1 trong 3 phòng Vùng (Phòng Tham mưu, Phòng Chính trị, Phòng HC-KT):
 *   Trả về DUY NHẤT tên Đơn vị cấp 1 (Không hiển thị Đơn vị cấp 2).
 * - Ngược lại:
 *   Hiển thị dạng "[Đơn vị cấp 2], [Đơn vị cấp 1]" hoặc fallback.
 */
export const getFormattedDonVi = (
  tenCap1?: string | null,
  tenCap2?: string | null,
  fallbackDonVi?: string | null
): string => {
  const cap1 = (tenCap1 || '').trim();
  const cap2 = (tenCap2 || '').trim();

  // Nếu thuộc 3 phòng Vùng -> Trả về DUY NHẤT tên Đơn vị cấp 1
  if (cap1 && isPhongVung(cap1)) {
    return cap1;
  }

  // Đối với các đơn vị còn lại (Tiểu đoàn, Lữ đoàn, Trung đoàn, v.v.)
  const parts = [cap2, cap1].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(', ');
  }

  if (fallbackDonVi && fallbackDonVi.trim()) {
    return fallbackDonVi.trim();
  }

  return 'Phòng Tham mưu, BTL Vùng 5 HQ';
};
