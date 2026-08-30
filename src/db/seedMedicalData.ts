import { sqliteService } from './sqlite-service';

export interface RawThuocSeed {
  ten: string;
  dvt: string;
  gia: number;
  ton_kho: number;
  ham_luong: string;
  cach_dung: string;
  ghi_chu?: string;
}

export interface RawVatTuSeed {
  ten: string;
  dvt: string;
  gia: number;
  ton_kho: number;
  ghi_chu: string;
}

export interface RawDichVuSeed {
  ten: string;
  dvt: string;
  gia: number;
  ghi_chu: string;
}

// 1. DATA THUỐC (Đủ 32 loại đã chuẩn hóa)
export const listThuoc: RawThuocSeed[] = [
  { ten: 'Amoxilin 500 mg', dvt: 'Viên', gia: 2000, ton_kho: 500, ham_luong: '500mg', cach_dung: 'Uống sau ăn' },
  { ten: 'Alphachymotrypsin Choay 21microka', dvt: 'Viên', gia: 2400, ton_kho: 500, ham_luong: '21 microkatal', cach_dung: 'Ngậm dưới lưỡi hoặc uống' },
  { ten: 'Acyclovir 800mg', dvt: 'Viên', gia: 3500, ton_kho: 500, ham_luong: '800mg', cach_dung: 'Uống sau ăn' },
  { ten: 'Enterogermina', dvt: 'Gói', gia: 8500, ton_kho: 500, ham_luong: '2 tỷ bào tử', cach_dung: 'Uống trước hoặc sau ăn' },
  { ten: 'Beroca', dvt: 'Viên', gia: 7800, ton_kho: 500, ham_luong: '', cach_dung: 'Hòa tan vào nước, uống sáng' },
  { ten: 'Berberin 100mg (VN)', dvt: 'Viên', gia: 680, ton_kho: 500, ham_luong: '100mg', cach_dung: 'Uống sau ăn' },
  { ten: 'Azithromycin 500mg', dvt: 'Viên', gia: 7200, ton_kho: 500, ham_luong: '500mg', cach_dung: 'Uống 1 giờ trước ăn hoặc 2 giờ sau ăn' },
  { ten: 'Amlodipine 10mg', dvt: 'Viên', gia: 1800, ton_kho: 500, ham_luong: '10mg', cach_dung: 'Uống hàng ngày' },
  { ten: 'Loratadin 10mg', dvt: 'Viên', gia: 650, ton_kho: 500, ham_luong: '10mg', cach_dung: 'Uống 1 lần/ngày' },
  { ten: 'Cefadroxil 500mg', dvt: 'Viên', gia: 2500, ton_kho: 500, ham_luong: '500mg', cach_dung: 'Uống sau ăn' },
  { ten: 'Esomeprazol HV 40 mg', dvt: 'Viên', gia: 4000, ton_kho: 500, ham_luong: '40mg', cach_dung: 'Uống trước ăn 30 phút' },
  { ten: 'SOSLac G3', dvt: 'tube', gia: 29000, ton_kho: 500, ham_luong: '', cach_dung: 'Bôi ngoài da' },
  { ten: 'Silymarin 140mg', dvt: 'Viên', gia: 1700, ton_kho: 500, ham_luong: '140mg', cach_dung: 'Uống sau ăn' },
  { ten: 'Klamentin 875/125 mg', dvt: 'Viên', gia: 8800, ton_kho: 500, ham_luong: '875mg/125mg', cach_dung: 'Uống ngay trước bữa ăn' },
  { ten: 'Medrol 16mg', dvt: 'Viên', gia: 4600, ton_kho: 500, ham_luong: '16mg', cach_dung: 'Uống sau ăn sáng' },
  { ten: 'Yumangel', dvt: 'Gói', gia: 5250, ton_kho: 500, ham_luong: '', cach_dung: 'Uống sau ăn 1-2h hoặc khi đau' },
  { ten: 'Telfast HD 180 mg', dvt: 'Viên', gia: 8500, ton_kho: 500, ham_luong: '180mg', cach_dung: 'Uống trước bữa ăn' },
  { ten: 'Tobramycin', dvt: 'Lọ', gia: 16000, ton_kho: 500, ham_luong: '0.3%', cach_dung: 'Nhỏ mắt' },
  { ten: 'Panadol Extra', dvt: 'Viên', gia: 1500, ton_kho: 500, ham_luong: '500mg/65mg', cach_dung: 'Uống sau ăn' },
  { ten: 'Hapacol sủi', dvt: 'Viên', gia: 2200, ton_kho: 500, ham_luong: '500mg', cach_dung: 'Hòa tan vào nước' },
  { ten: 'Cefalexin 500 mg', dvt: 'Viên', gia: 3000, ton_kho: 500, ham_luong: '500mg', cach_dung: 'Uống trước bữa ăn' },
  { ten: 'Cefuroxim 500 mg', dvt: 'Viên', gia: 5000, ton_kho: 500, ham_luong: '500mg', cach_dung: 'Uống sau ăn' },
  { ten: 'Pharmaton Energy', dvt: 'Viên', gia: 2800, ton_kho: 500, ham_luong: '', cach_dung: 'Uống vào buổi sáng với thức ăn' },
  { ten: 'Vastarel MR 35mg', dvt: 'Viên', gia: 3500, ton_kho: 500, ham_luong: '35mg', cach_dung: 'Uống cùng bữa ăn' },
  { ten: 'No-Spa 40mg', dvt: 'Viên', gia: 1200, ton_kho: 500, ham_luong: '40mg', cach_dung: 'Uống' },
  { ten: 'Fluconazol 150 mg', dvt: 'Viên', gia: 8000, ton_kho: 500, ham_luong: '150mg', cach_dung: 'Uống' },
  { ten: 'Silkeron 10mg', dvt: 'Tuýp', gia: 19000, ton_kho: 500, ham_luong: '10mg', cach_dung: 'Bôi ngoài da' },
  { ten: 'Voltaren 75 mg', dvt: 'Viên', gia: 7000, ton_kho: 500, ham_luong: '75mg', cach_dung: 'Uống sau ăn' },
  { ten: 'Nexium 40 mg', dvt: 'Viên', gia: 25500, ton_kho: 500, ham_luong: '40mg', cach_dung: 'Uống trước bữa ăn' },
  { ten: 'Augmentin 625 mg', dvt: 'Viên', gia: 13000, ton_kho: 500, ham_luong: '500mg/125mg', cach_dung: 'Uống lúc bắt đầu bữa ăn' },
  { ten: 'Auclatyl 1g', dvt: 'Viên', gia: 11500, ton_kho: 500, ham_luong: '875mg/125mg', cach_dung: 'Uống ngay trước bữa ăn', ghi_chu: 'Kháng sinh Amoxicillin + Acid Clavulanic' },
  { ten: 'Shinphagel', dvt: 'Gói', gia: 4500, ton_kho: 500, ham_luong: 'Nhôm phosphat gel', cach_dung: 'Uống sau ăn 1-2h hoặc khi đau', ghi_chu: 'Kháng acid bảo vệ niêm mạc dạ dày' },
  { ten: 'Gaviscon', dvt: 'Gói', gia: 7000, ton_kho: 500, ham_luong: '', cach_dung: 'Uống sau bữa ăn và lúc đi ngủ' },
  { ten: 'Homtamin Ginseng', dvt: 'Viên', gia: 2300, ton_kho: 500, ham_luong: '', cach_dung: 'Uống 1 viên/ngày sau ăn' }
];
export const thuocData = listThuoc;

// 2. DATA VẬT TƯ (Đủ 4 mục đã chuẩn hóa)
export const listVatTu: RawVatTuSeed[] = [
  { ten: 'Băng thun 3 móc', dvt: 'Cuộn', gia: 18000, ton_kho: 300, ghi_chu: 'Dùng cố định khớp, vết thương' },
  { ten: 'Gạc vô khuẩn', dvt: 'Miếng', gia: 8500, ton_kho: 300, ghi_chu: 'Băng bó vết thương hở' },
  { ten: 'NaCL 0,9% 500ml HD', dvt: 'Chai', gia: 13000, ton_kho: 300, ghi_chu: 'Dùng để rửa vết thương, tiêm truyền' },
  { ten: 'Povidin chai 10% 90ml', dvt: 'Chai', gia: 22000, ton_kho: 300, ghi_chu: 'Sát khuẩn vết thương ngoài da' }
];
export const vattuData = listVatTu;

// 3. DATA DỊCH VỤ KỸ THUẬT (Đủ 3 mục đã chuẩn hóa)
export const listDichVu: RawDichVuSeed[] = [
  { ten: 'Xoa bóp cục bộ bằng tay', dvt: 'Lần', gia: 51300, ghi_chu: 'Điều trị vật lý trị liệu' },
  { ten: 'Chiếu đèn hồng ngoại', dvt: 'Lần', gia: 40900, ghi_chu: 'Giảm đau, giãn cơ' },
  { ten: 'Khí dung mũi họng', dvt: 'Lần', gia: 0, ghi_chu: 'Điều trị bệnh lý đường hô hấp' }
];
export const dichvuData = listDichVu;

/**
 * Hàm nạp toàn bộ danh mục chuẩn hóa Thuốc, Vật tư y tế và Dịch vụ kỹ thuật
 * Yêu cầu 1: Xóa dữ liệu cũ (Reset các bảng danh mục)
 * Yêu cầu 2 & 3: Insert dữ liệu mới theo vòng lặp, ánh xạ đúng tên trường trong CSDL SQLite
 * Yêu cầu 4: Giữ nguyên cấu trúc trường của CSDL (ten, don_vi_tinh, don_gia, ton_kho, ham_luong, cach_dung_mac_dinh, ghi_chu)
 */
export function forceResetAndSeedData() {
  return sqliteService.forceResetAndSeedData();
}

export function seedMedicalData() {
  return sqliteService.forceResetAndSeedData();
}

