/**
 * Tiện ích định dạng ngày tháng sang chuẩn Việt Nam (dd/mm/yyyy)
 */

export const formatDateToVN = (dateVal?: string | Date | null): string => {
  if (!dateVal) return '';

  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    if (!trimmed) return '';

    // Nếu đã ở dạng dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      return trimmed;
    }

    // Nếu ở dạng d/m/yyyy -> chuẩn hóa thành dd/mm/yyyy
    const slashParts = trimmed.split('/');
    if (slashParts.length === 3 && slashParts[2].length === 4) {
      const d = slashParts[0].padStart(2, '0');
      const m = slashParts[1].padStart(2, '0');
      const y = slashParts[2];
      return `${d}/${m}/${y}`;
    }

    // Nếu ở dạng yyyy-mm-dd hoặc yyyy-mm-ddThh:mm... hoặc yyyy-mm-dd hh:mm...
    const matchHyphen = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (matchHyphen) {
      const year = matchHyphen[1];
      const month = matchHyphen[2].padStart(2, '0');
      const day = matchHyphen[3].padStart(2, '0');
      return `${day}/${month}/${year}`;
    }

    // Thử parse Date
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, '0');
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const year = parsed.getFullYear();
      return `${day}/${month}/${year}`;
    }

    return trimmed;
  }

  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    const day = String(dateVal.getDate()).padStart(2, '0');
    const month = String(dateVal.getMonth() + 1).padStart(2, '0');
    const year = dateVal.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return '';
};

/**
 * Chuyển đổi từ chuỗi ngày dd/mm/yyyy sang ISO yyyy-mm-dd để lưu trữ SQLite hoặc so sánh
 */
export const parseVNToISODate = (vnDateStr?: string | null): string => {
  if (!vnDateStr) return '';
  const trimmed = vnDateStr.trim();
  if (!trimmed) return '';

  // Đã là yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Dạng dd/mm/yyyy hoặc d/m/yyyy
  const parts = trimmed.split('/');
  if (parts.length === 3) {
    const day = parts[0].trim().padStart(2, '0');
    const month = parts[1].trim().padStart(2, '0');
    const year = parts[2].trim();
    if (year.length === 4 && Number(day) >= 1 && Number(day) <= 31 && Number(month) >= 1 && Number(month) <= 12) {
      return `${year}-${month}-${day}`;
    }
  }

  return trimmed;
};
