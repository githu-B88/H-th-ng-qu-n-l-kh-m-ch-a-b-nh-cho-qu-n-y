import { sqliteService } from './sqlite-service';

/**
 * Hàm dọn sạch toàn bộ dữ liệu Khám bệnh / Bảng kê nháp (Clear Exam Data)
 * Thực thi các câu lệnh xóa:
 *  - DELETE FROM ho_so_kham_chi_tiet (chi_tiet_thuoc, chi_tiet_vat_tu, chi_tiet_dich_vu);
 *  - DELETE FROM ho_so_kham (kham_benh);
 *  - DELETE FROM sqlite_sequence WHERE name IN ('ho_so_kham', 'ho_so_kham_chi_tiet', 'kham_benh', ...);
 *
 * Giữ nguyên an toàn: Bảng Cán bộ, Thẻ BHYT, Danh mục Thuốc, Vật tư y tế, Dịch vụ kỹ thuật.
 */
export function clearExamData(): { success: boolean; message: string; deletedCount: number } {
  return sqliteService.clearExamRecords();
}
