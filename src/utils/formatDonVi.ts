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
