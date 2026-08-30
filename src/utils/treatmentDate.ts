export interface TreatmentDateInfo {
  tuNgay: string; // DD/MM/YYYY
  denNgay: string; // DD/MM/YYYY (+4 days from tuNgay, total 5 days)
  day: string; // DD (padded 2 digits)
  month: string; // MM (padded 2 digits)
  year: string; // YYYY
}

/**
 * Tính toán khoảng thời gian điều trị 5 ngày (từ ngày khám + 4 ngày)
 * và tách ngày/tháng/năm của ngày khám để hiển thị phần chữ ký.
 */
export const getTreatmentDateRange = (ngayKhamStr?: string): TreatmentDateInfo => {
  let startYear = new Date().getFullYear();
  let startMonth = new Date().getMonth(); // 0-indexed
  let startDay = new Date().getDate();

  if (ngayKhamStr) {
    if (ngayKhamStr.includes('-')) {
      const parts = ngayKhamStr.split('T')[0].split('-');
      if (parts.length >= 3) {
        startYear = parseInt(parts[0], 10);
        startMonth = parseInt(parts[1], 10) - 1;
        startDay = parseInt(parts[2], 10);
      }
    } else if (ngayKhamStr.includes('/')) {
      const parts = ngayKhamStr.split('/');
      if (parts.length >= 3) {
        startDay = parseInt(parts[0], 10);
        startMonth = parseInt(parts[1], 10) - 1;
        startYear = parseInt(parts[2], 10);
      }
    } else {
      const parsed = new Date(ngayKhamStr);
      if (!isNaN(parsed.getTime())) {
        startYear = parsed.getFullYear();
        startMonth = parsed.getMonth();
        startDay = parsed.getDate();
      }
    }
  }

  const startDate = new Date(startYear, startMonth, startDay);
  const endDate = new Date(startYear, startMonth, startDay + 4);

  const pad = (n: number) => String(n).padStart(2, '0');

  const tuNgayFormatted = `${pad(startDate.getDate())}/${pad(startDate.getMonth() + 1)}/${startDate.getFullYear()}`;
  const denNgayFormatted = `${pad(endDate.getDate())}/${pad(endDate.getMonth() + 1)}/${endDate.getFullYear()}`;

  return {
    tuNgay: tuNgayFormatted,
    denNgay: denNgayFormatted,
    day: pad(startDate.getDate()),
    month: pad(startDate.getMonth() + 1),
    year: String(startDate.getFullYear())
  };
};
