import { CoQuan, BacSi, NhanSu, Thuoc, VatTu, DichVuKT, MauBenh } from '../types';

export const SEED_DON_VI_CAP_1 = [
  { id: 1, ten: 'Phòng Tham mưu Vùng', ghi_chu: 'Cơ quan tham mưu tác chiến, quân huấn, quân lực Vùng 5 Hải quân' },
  { id: 2, ten: 'Phòng Chính trị Vùng', ghi_chu: 'Cơ quan công tác Đảng, công tác chính trị Vùng 5 Hải quân' },
  { id: 3, ten: 'Phòng Hậu cần-Kỹ thuật Vùng', ghi_chu: 'Cơ quan bảo đảm Hậu cần - Kỹ thuật, quân y Vùng 5 Hải quân' },
  { id: 4, ten: 'Tiểu đoàn 553', ghi_chu: 'Tiểu đoàn 553 phòng vệ trực thuộc Vùng' },
  { id: 5, ten: 'Tiểu đoàn 563', ghi_chu: 'Tiểu đoàn bộ binh / phòng thủ đảo 563' },
  { id: 6, ten: 'Tiểu đoàn Phương tiện không người lái', ghi_chu: 'Tiểu đoàn phương tiện bay không người lái (UAV)' }
];

export const SEED_CO_QUAN: Omit<CoQuan, 'created_at'>[] = [
  // 1. Phòng Tham mưu Vùng (id_don_vi_cap_1: 1)
  { id: 1, id_don_vi_cap_1: 1, ten: 'Ban Tác chiến', ghi_chu: 'Kế hoạch & tác chiến' },
  { id: 2, id_don_vi_cap_1: 1, ten: 'Ban Quân lực', ghi_chu: 'Quân số & tổ chức biên chế' },
  { id: 3, id_don_vi_cap_1: 1, ten: 'Ban Quân huấn', ghi_chu: 'Huấn luyện chiến đấu' },
  { id: 4, id_don_vi_cap_1: 1, ten: 'Ban Thông tin', ghi_chu: 'Bảo đảm thông tin liên lạc' },
  { id: 5, id_don_vi_cap_1: 1, ten: 'Ban Trinh sát', ghi_chu: 'Quân báo - Trinh sát' },
  { id: 6, id_don_vi_cap_1: 1, ten: 'Ban Cơ yếu', ghi_chu: 'Mã dịch & cơ mật' },
  { id: 7, id_don_vi_cap_1: 1, ten: 'Ban Hành chính', ghi_chu: 'Hành chính cơ quan' },

  // 2. Phòng Chính trị Vùng (id_don_vi_cap_1: 2)
  { id: 8, id_don_vi_cap_1: 2, ten: 'Ban Tuyên huấn', ghi_chu: 'Tuyên truyền & giáo dục chính trị' },
  { id: 9, id_don_vi_cap_1: 2, ten: 'Ban Cán bộ', ghi_chu: 'Công tác quản lý cán bộ' },
  { id: 10, id_don_vi_cap_1: 2, ten: 'Ban Tổ chức', ghi_chu: 'Xây dựng tổ chức Đảng' },
  { id: 11, id_don_vi_cap_1: 2, ten: 'Ban Bảo vệ an ninh', ghi_chu: 'An ninh quân đội' },
  { id: 12, id_don_vi_cap_1: 2, ten: 'Ban Chính sách', ghi_chu: 'Chính sách hậu phương quân đội' },
  { id: 13, id_don_vi_cap_1: 2, ten: 'Ban Dân vận', ghi_chu: 'Vận động quần chúng' },

  // 3. Phòng Hậu cần-Kỹ thuật Vùng (id_don_vi_cap_1: 3)
  { id: 14, id_don_vi_cap_1: 3, ten: 'Ban Quân y', ghi_chu: 'Chăm sóc sức khỏe, phòng chống dịch' },
  { id: 15, id_don_vi_cap_1: 3, ten: 'Bệnh xá Vùng 5', ghi_chu: 'Khám chữa bệnh tuyến cơ sở' },
  { id: 16, id_don_vi_cap_1: 3, ten: 'Ban Quân nhu', ghi_chu: 'Lương thực, thực phẩm, quân trang' },
  { id: 17, id_don_vi_cap_1: 3, ten: 'Ban Doanh trại', ghi_chu: 'Nhà ở, công trình doanh trại' },
  { id: 18, id_don_vi_cap_1: 3, ten: 'Ban Xăng dầu', ghi_chu: 'Nhiên liệu & dầu nhờn' },
  { id: 19, id_don_vi_cap_1: 3, ten: 'Ban Vận tải', ghi_chu: 'Vận chuyển hậu cần kỹ thuật' },
  { id: 20, id_don_vi_cap_1: 3, ten: 'Ban Xe - Máy', ghi_chu: 'Bảo đảm kỹ thuật xe máy' },
  { id: 21, id_don_vi_cap_1: 3, ten: 'Ban Vũ khí - Đạn', ghi_chu: 'Quản lý khí tài vũ khí đạn' },
  { id: 22, id_don_vi_cap_1: 3, ten: 'Trạm Sửa chữa Kỹ thuật', ghi_chu: 'Bảo dưỡng sửa chữa trang bị' },

  // 4. Tiểu đoàn 553 (id_don_vi_cap_1: 4)
  { id: 23, id_don_vi_cap_1: 4, ten: 'Ban Chỉ huy Tiểu đoàn 553', ghi_chu: 'Chỉ huy & Cơ quan tiểu đoàn' },
  { id: 24, id_don_vi_cap_1: 4, ten: 'Đại đội 1', ghi_chu: 'Đại đội bộ binh 1' },
  { id: 25, id_don_vi_cap_1: 4, ten: 'Đại đội 2', ghi_chu: 'Đại đội bộ binh 2' },
  { id: 26, id_don_vi_cap_1: 4, ten: 'Đại đội Hỏa lực', ghi_chu: 'Hỏa lực phòng vệ' },
  { id: 27, id_don_vi_cap_1: 4, ten: 'Trung đội Thông tin - Quân y', ghi_chu: 'Thông tin & Quân y tiểu đoàn' },

  // 5. Tiểu đoàn 563 (id_don_vi_cap_1: 5)
  { id: 28, id_don_vi_cap_1: 5, ten: 'Ban Chỉ huy Tiểu đoàn 563', ghi_chu: 'Chỉ huy & Cơ quan tiểu đoàn' },
  { id: 29, id_don_vi_cap_1: 5, ten: 'Đại đội 1', ghi_chu: 'Đại đội bộ binh 1' },
  { id: 30, id_don_vi_cap_1: 5, ten: 'Đại đội 2', ghi_chu: 'Đại đội bộ binh 2' },
  { id: 31, id_don_vi_cap_1: 5, ten: 'Đại đội 3', ghi_chu: 'Đại đội bộ binh 3' },
  { id: 32, id_don_vi_cap_1: 5, ten: 'Đại đội Hỏa lực', ghi_chu: 'Hỏa lực cối, súng máy' },
  { id: 33, id_don_vi_cap_1: 5, ten: 'Trung đội Thông tin', ghi_chu: 'Thông tin liên lạc' },
  { id: 34, id_don_vi_cap_1: 5, ten: 'Trung đội Quân y', ghi_chu: 'Cứu thương & điều trị tuyến d' },

  // 6. Tiểu đoàn Phương tiện không người lái (id_don_vi_cap_1: 6)
  { id: 35, id_don_vi_cap_1: 6, ten: 'Ban Chỉ huy Tiểu đoàn Phương tiện không người lái', ghi_chu: 'Chỉ huy & Điều hành bay' },
  { id: 36, id_don_vi_cap_1: 6, ten: 'Đại đội Bay - Điều khiển 1', ghi_chu: 'Phi đội UAV trinh sát 1' },
  { id: 37, id_don_vi_cap_1: 6, ten: 'Đại đội Bay - Điều khiển 2', ghi_chu: 'Phi đội UAV trinh sát 2' },
  { id: 38, id_don_vi_cap_1: 6, ten: 'Đại đội Kỹ thuật - Bảo dưỡng', ghi_chu: 'Bảo đảm khí tài bay & cảm biến' },
  { id: 39, id_don_vi_cap_1: 6, ten: 'Trung đội Thông tin - Dẫn đường', ghi_chu: 'Thu nhận dữ liệu & truyền dẫn' }
];

export const SEED_BAC_SI: BacSi[] = [
  {
    id: 1,
    ho_ten: 'BS. CKI Nguyễn Văn An',
    the_bhyt: 'DN4010123456789',
    ngay_sinh: '1982-05-14',
    gioi_tinh: 'Nam',
    id_don_vi: 15,
    chuyen_mon: 'Bác sĩ Đa khoa - Chuyên khoa Nội',
    ghi_chu: 'Bệnh xá Vùng 5 Hải quân, kinh nghiệm 18 năm'
  },
  {
    id: 2,
    ho_ten: 'ThS. BS Trần Thị Bích Loan',
    the_bhyt: 'DN4010198765432',
    ngay_sinh: '1988-11-20',
    gioi_tinh: 'Nữ',
    id_don_vi: 15,
    chuyen_mon: 'Bác sĩ Nội Tim Mạch & Hô Hấp',
    ghi_chu: 'Phụ trách chuyên môn khám và cấp phát thuốc BHYT'
  },
  {
    id: 3,
    ho_ten: 'Y sĩ YHCT Phạm Hoàng Minh',
    the_bhyt: 'DN4010156789123',
    ngay_sinh: '1993-08-09',
    gioi_tinh: 'Nam',
    id_don_vi: 15,
    chuyen_mon: 'Y học cổ truyền & Phục hồi chức năng',
    ghi_chu: 'Phụ trách xoa bóp, châm cứu, vật lý trị liệu Bệnh xá Vùng'
  }
];

export const SEED_NHAN_SU: NhanSu[] = [
  {
    id: 1,
    ho_ten: 'Đặng Quốc Hưng',
    ngay_sinh: '1979-03-12',
    ma_the_bhyt: 'HC4010219837482',
    gioi_tinh: 'Nam',
    id_don_vi_cap_2: 1,
    cap_bac: 'Thượng tá',
    chuc_vu: 'Phó Trưởng ban Tác chiến'
  },
  {
    id: 2,
    ho_ten: 'Lê Thu Trang',
    ngay_sinh: '1992-09-25',
    ma_the_bhyt: 'HC4010273849102',
    gioi_tinh: 'Nữ',
    id_don_vi_cap_2: 8,
    cap_bac: 'Đại úy',
    chuc_vu: 'Trợ lý Tuyên huấn'
  },
  {
    id: 3,
    ho_ten: 'Vũ Đức Thành',
    ngay_sinh: '1985-12-04',
    ma_the_bhyt: 'HC4010245678901',
    gioi_tinh: 'Nam',
    id_don_vi_cap_2: 14,
    cap_bac: 'Thiếu tá',
    chuc_vu: 'Trợ lý Quân y'
  },
  {
    id: 4,
    ho_ten: 'Nguyễn Thị Mai Phương',
    ngay_sinh: '1996-06-18',
    ma_the_bhyt: 'HC4010299887766',
    gioi_tinh: 'Nữ',
    id_don_vi_cap_2: 4,
    cap_bac: 'Thượng úy',
    chuc_vu: 'Nhân viên Báo vụ'
  },
  {
    id: 5,
    ho_ten: 'Hoàng Văn Cường',
    ngay_sinh: '1999-01-30',
    ma_the_bhyt: 'HC4010266554433',
    gioi_tinh: 'Nam',
    id_don_vi_cap_2: 24,
    cap_bac: 'Trung úy',
    chuc_vu: 'Trưởng ngành Hàng hải Tàu HQ-251'
  }
];

export const SEED_THUOC: Thuoc[] = [
  {
    id: 1,
    ten: 'Paracetamol 500mg (Hapacol/Panadol)',
    don_vi_tinh: 'Viên',
    don_gia: 1200,
    ham_luong: '500mg',
    ton_kho: 450,
    cach_dung_mac_dinh: 'Uống 1-2 viên/lần khi sốt trên 38.5°C hoặc đau, cách 4-6 giờ',
    ghi_chu: 'Hạ sốt, giảm đau thông thường'
  },
  {
    id: 2,
    ten: 'Amoxicillin + Acid Clavulanic 625mg (Augmentin)',
    don_vi_tinh: 'Viên',
    don_gia: 8500,
    ham_luong: '500mg/125mg',
    ton_kho: 180,
    cach_dung_mac_dinh: 'Uống 1 viên x 2 lần/ngày, sau ăn, dùng 5-7 ngày',
    ghi_chu: 'Kháng sinh điều trị nhiễm khuẩn đường hô hấp, tai mũi họng'
  },
  {
    id: 3,
    ten: 'Cefuroxime Axetil 500mg (Zinnat)',
    don_vi_tinh: 'Viên',
    don_gia: 11500,
    ham_luong: '500mg',
    ton_kho: 120,
    cach_dung_mac_dinh: 'Uống 1 viên x 2 lần/ngày, sau bữa ăn',
    ghi_chu: 'Kháng sinh Cephalosporin thế hệ 2'
  },
  {
    id: 4,
    ten: 'Ibuprofen 400mg',
    don_vi_tinh: 'Viên',
    don_gia: 2200,
    ham_luong: '400mg',
    ton_kho: 200,
    cach_dung_mac_dinh: 'Uống 1 viên x 2-3 lần/ngày, sau ăn no',
    ghi_chu: 'Kháng viêm, giảm đau cơ xương khớp'
  },
  {
    id: 5,
    ten: 'Omeprazole 20mg',
    don_vi_tinh: 'Viên',
    don_gia: 2500,
    ham_luong: '20mg',
    ton_kho: 260,
    cach_dung_mac_dinh: 'Uống 1 viên/ngày trước bữa ăn sáng 30 phút',
    ghi_chu: 'Ức chế bơm proton, bảo vệ niêm mạc dạ dày'
  },
  {
    id: 6,
    ten: 'Phosphalugel (Thuốc chữ P dạ dày)',
    don_vi_tinh: 'Gói',
    don_gia: 4800,
    ham_luong: '20g',
    ton_kho: 150,
    cach_dung_mac_dinh: 'Uống 1 gói khi có cơn đau rát thượng vị hoặc sau ăn 1-2h',
    ghi_chu: 'Trung hòa acid dịch vị'
  },
  {
    id: 7,
    ten: 'Berberin 100mg',
    don_vi_tinh: 'Viên',
    don_gia: 600,
    ham_luong: '100mg',
    ton_kho: 500,
    cach_dung_mac_dinh: 'Uống 4-6 viên x 2 lần/ngày, trước bữa ăn',
    ghi_chu: 'Kháng khuẩn đường ruột, tiêu chảy, viêm đại tràng'
  },
  {
    id: 8,
    ten: 'Smecta (Diosmectite 3g)',
    don_vi_tinh: 'Gói',
    don_gia: 3900,
    ham_luong: '3g',
    ton_kho: 140,
    cach_dung_mac_dinh: 'Pha 1 gói với 50ml nước ấm, uống 2-3 gói/ngày',
    ghi_chu: 'Bao phủ niêm mạc ruột, cầm tiêu chảy cấp'
  },
  {
    id: 9,
    ten: 'Oresol 245 pha 200ml (Bù nước điện giải)',
    don_vi_tinh: 'Gói',
    don_gia: 2000,
    ham_luong: '4.1g',
    ton_kho: 300,
    cach_dung_mac_dinh: 'Pha chuẩn 1 gói với đúng 200ml nước đun sôi để nguội, uống rải rác',
    ghi_chu: 'Bù nước và điện giải trong tiêu chảy, sốt cao'
  },
  {
    id: 10,
    ten: 'Loratadine 10mg (Chống dị ứng)',
    don_vi_tinh: 'Viên',
    don_gia: 1500,
    ham_luong: '10mg',
    ton_kho: 220,
    cach_dung_mac_dinh: 'Uống 1 viên/ngày vào buổi tối',
    ghi_chu: 'Kháng histamin H1 thế hệ 2, chống viêm mũi dị ứng, mề đay'
  },
  {
    id: 11,
    ten: 'Acetylcystein 200mg (Long đờm)',
    don_vi_tinh: 'Gói',
    don_gia: 2100,
    ham_luong: '200mg',
    ton_kho: 190,
    cach_dung_mac_dinh: 'Pha 1 gói với nước, uống 2-3 lần/ngày',
    ghi_chu: 'Tiêu nhầy, loãng đờm đường hô hấp'
  },
  {
    id: 12,
    ten: 'Amlodipine 5mg (Hạ huyết áp)',
    don_vi_tinh: 'Viên',
    don_gia: 1800,
    ham_luong: '5mg',
    ton_kho: 160,
    cach_dung_mac_dinh: 'Uống 1 viên vào 8h sáng hàng ngày',
    ghi_chu: 'Chẹn kênh canxi, điều trị tăng huyết áp vô căn'
  },
  {
    id: 13,
    ten: 'Vitamin C 500mg (Tăng đề kháng)',
    don_vi_tinh: 'Viên',
    don_gia: 1000,
    ham_luong: '500mg',
    ton_kho: 400,
    cach_dung_mac_dinh: 'Uống 1 viên sau ăn sáng',
    ghi_chu: 'Bổ sung vitamin, tăng sức đề kháng cơ thể'
  },
  {
    id: 14,
    ten: 'Panadol Extra Đỏ (Paracetamol + Caffeine)',
    don_vi_tinh: 'Viên',
    don_gia: 1800,
    ham_luong: '500mg/65mg',
    ton_kho: 250,
    cach_dung_mac_dinh: 'Uống 1-2 viên/lần khi đau đầu căng thẳng, cách 6 giờ',
    ghi_chu: 'Giảm đau đầu, đau nửa đầu hiệu quả nhanh'
  },
  {
    id: 15,
    ten: 'Dầu Gió Xanh Thiên Thảo / Con Ó',
    don_vi_tinh: 'Chai',
    don_gia: 35000,
    ham_luong: '12ml',
    ton_kho: 45,
    cach_dung_mac_dinh: 'Thoa ngoài da vùng thái dương, cổ, ngực, bụng khi lạnh bụng/chóng mặt',
    ghi_chu: 'Thoa ngoài xoa bóp'
  }
];

export const SEED_VAT_TU: VatTu[] = [
  { id: 1, ten: 'Băng cuộn y tế tiệt trùng 10cm x 2m', don_vi_tinh: 'Cuộn', don_gia: 4500, ton_kho: 80, ghi_chu: 'Băng bó vết thương cố định' },
  { id: 2, ten: 'Gạc tiệt trùng 8x10cm (gói 10 miếng)', don_vi_tinh: 'Gói', don_gia: 7000, ton_kho: 120, ghi_chu: 'Đắp vết thương, thấm dịch' },
  { id: 3, ten: 'Bông y tế Bạch Tuyết 100g', don_vi_tinh: 'Gói', don_gia: 14000, ton_kho: 40, ghi_chu: 'Sát khuẩn, lau rửa' },
  { id: 4, ten: 'Bơm tiêm dùng 1 lần 5ml Vinahankook', don_vi_tinh: 'Cái', don_gia: 1500, ton_kho: 200, ghi_chu: 'Tiêm bắp, tiêm tĩnh mạch' },
  { id: 5, ten: 'Cồn y tế 70 độ 500ml', don_vi_tinh: 'Chai', don_gia: 16000, ton_kho: 30, ghi_chu: 'Sát trùng da và dụng cụ' },
  { id: 6, ten: 'Dung dịch sát khuẩn Povidine 10% 20ml', don_vi_tinh: 'Lọ', don_gia: 12000, ton_kho: 50, ghi_chu: 'Sát khuẩn vết thương ngoài da' },
  { id: 7, ten: 'Găng tay y tế không bột (Hộp 100 chiếc)', don_vi_tinh: 'Hộp', don_gia: 95000, ton_kho: 25, ghi_chu: 'Khám bệnh và thủ thuật' },
  { id: 8, ten: 'Que test nhanh đường huyết On Call Plus', don_vi_tinh: 'Que', don_gia: 8000, ton_kho: 90, ghi_chu: 'Kiểm tra đường máu mao mạch tại chỗ' },
  { id: 9, ten: 'Khẩu trang y tế 4 lớp kháng khuẩn (Hộp 50 cái)', don_vi_tinh: 'Hộp', don_gia: 35000, ton_kho: 60, ghi_chu: 'Phòng dịch, ngăn giọt bắn' }
];

export const SEED_DICH_VU_KT: DichVuKT[] = [
  { id: 1, ten: 'Khám bệnh lâm sàng Nội tổng quát', don_vi_tinh: 'Lượt', don_gia: 35000, ghi_chu: 'Đo sinh hiệu, nghe tim phổi, khám tổng thể' },
  { id: 2, ten: 'Đo điện tim 12 chuyển đạo (ECG)', don_vi_tinh: 'Lần', don_gia: 55000, ghi_chu: 'Kiểm tra nhịp tim, thiếu máu cơ tim' },
  { id: 3, ten: 'Đo đường huyết mao mạch nhanh', don_vi_tinh: 'Lần', don_gia: 20000, ghi_chu: 'Đo đường máu mao mạch đầu ngón tay' },
  { id: 4, ten: 'Rửa và chăm sóc thay băng vết thương thông thường', don_vi_tinh: 'Lần', don_gia: 40000, ghi_chu: 'Sát trùng, vô khuẩn, băng ép' },
  { id: 5, ten: 'Xông khí dung thuốc đường hô hấp', don_vi_tinh: 'Lần', don_gia: 30000, ghi_chu: 'Khí dung giãn phế quản, kháng viêm' },
  { id: 6, ten: 'Tiêm bắp / Tiêm dưới da', don_vi_tinh: 'Lần', don_gia: 15000, ghi_chu: 'Thực hiện kỹ thuật tiêm an toàn' },
  { id: 7, ten: 'Xoa bóp, bấm huyệt, cứu ngải điều trị đau vai gáy', don_vi_tinh: 'Lần', don_gia: 60000, ghi_chu: 'Y học cổ truyền phục hồi chức năng' }
];

export const SEED_MAU_BENH: MauBenh[] = [
  {
    id: 1,
    ten_benh: 'Cảm cúm thông thường / Viêm đường hô hấp trên',
    chan_doan_chuan: 'Cảm cúm thông thường cấp tính (J00) - Theo dõi nhiễm siêu vi đường hô hấp trên',
    loi_dan_mac_dinh: 'Uống nhiều nước ấm, nghỉ ngơi tại phòng, súc họng bằng nước muối sinh lý 3 lần/ngày, ăn uống đủ chất, đeo khẩu trang tránh lây lan.',
    ghi_chu: 'Phác đồ điều trị 3 - 5 ngày cho cán bộ bị cảm lạnh, hắt hơi, sốt nhẹ, sổ mũi',
    chi_tiet: [
      { loai_muc: 'dich_vu_kt', id_muc: 1, so_luong: 1, cach_dung: 'Khám lâm sàng nội khoa' },
      { loai_muc: 'thuoc', id_muc: 1, so_luong: 10, cach_dung: 'Uống 1-2 viên khi sốt >38.5°C hoặc đau mình mẩy, cách 4-6h' },
      { loai_muc: 'thuoc', id_muc: 10, so_luong: 5, cach_dung: 'Uống 1 viên vào buổi tối trước khi đi ngủ' },
      { loai_muc: 'thuoc', id_muc: 13, so_luong: 5, cach_dung: 'Uống 1 viên sau ăn sáng để tăng đề kháng' }
    ]
  },
  {
    id: 2,
    ten_benh: 'Viêm họng cấp tính / Viêm amidan mủ nhẹ',
    chan_doan_chuan: 'Viêm họng cấp có bội nhiễm vi khuẩn (J02.9)',
    loi_dan_mac_dinh: 'Uống đủ liệu trình kháng sinh 5-7 ngày, không tự ý ngưng thuốc. Kiêng đồ ăn quá cay/lạnh, uống nước ấm, súc họng nước muối thường xuyên.',
    ghi_chu: 'Dành cho trường hợp nuốt đau, họng đỏ, có đờm mủ vàng đục',
    chi_tiet: [
      { loai_muc: 'dich_vu_kt', id_muc: 1, so_luong: 1, cach_dung: 'Khám lâm sàng họng' },
      { loai_muc: 'thuoc', id_muc: 2, so_luong: 10, cach_dung: 'Uống 1 viên x 2 lần/ngày, sáng - tối sau ăn (dùng 5 ngày)' },
      { loai_muc: 'thuoc', id_muc: 1, so_luong: 10, cach_dung: 'Uống 1 viên khi sốt hoặc đau rát họng' },
      { loai_muc: 'thuoc', id_muc: 11, so_luong: 10, cach_dung: 'Pha 1 gói với nước ấm, uống ngày 2 lần sau ăn' }
    ]
  },
  {
    id: 3,
    ten_benh: 'Viêm dạ dày cấp tính / Hội chứng trào ngược dạ dày thực quản',
    chan_doan_chuan: 'Viêm dạ dày tá tràng cấp (K29) - Trào ngược dạ dày thực quản (K21)',
    loi_dan_mac_dinh: 'Ăn đúng giờ, không bỏ bữa, kiêng rượu bia, cà phê, ớt cay, đồ chua. Tránh thức khuya và căng thẳng tâm lý.',
    ghi_chu: 'Phác đồ 7 ngày giảm tiết acid và bảo vệ niêm mạc dạ dày',
    chi_tiet: [
      { loai_muc: 'dich_vu_kt', id_muc: 1, so_luong: 1, cach_dung: 'Khám bụng và tiêu hóa' },
      { loai_muc: 'thuoc', id_muc: 5, so_luong: 7, cach_dung: 'Uống 1 viên trước ăn sáng 30 phút' },
      { loai_muc: 'thuoc', id_muc: 6, so_luong: 14, cach_dung: 'Uống 1 gói sau bữa ăn 1-2 giờ hoặc khi đau rát thượng vị' }
    ]
  },
  {
    id: 4,
    ten_benh: 'Rối loạn tiêu hóa / Tiêu chảy cấp tính',
    chan_doan_chuan: 'Viêm dạ dày ruột cấp / Tiêu chảy nhiễm khuẩn nhẹ (A09)',
    loi_dan_mac_dinh: 'Ăn cháo loãng với muối/thịt nạc, uống nhiều dung dịch Oresol bù nước. Không ăn rau sống, thức ăn ôi thiu hay uống sữa đặc khi còn tiêu chảy.',
    ghi_chu: 'Phác đồ cầm tiêu chảy, diệt khuẩn đường ruột và bù nước điện giải',
    chi_tiet: [
      { loai_muc: 'dich_vu_kt', id_muc: 1, so_luong: 1, cach_dung: 'Khám lâm sàng bụng' },
      { loai_muc: 'thuoc', id_muc: 7, so_luong: 20, cach_dung: 'Uống 4 viên x 2 lần/ngày trước bữa ăn' },
      { loai_muc: 'thuoc', id_muc: 8, so_luong: 6, cach_dung: 'Pha 1 gói với 50ml nước ấm, uống ngày 2 lần' },
      { loai_muc: 'thuoc', id_muc: 9, so_luong: 4, cach_dung: 'Pha 1 gói với đúng 200ml nước chín, uống rải rác bù nước' }
    ]
  },
  {
    id: 5,
    ten_benh: 'Đau đầu căng thẳng / Rối loạn vận mạch',
    chan_doan_chuan: 'Đau đầu căng thẳng (G44.2) - Thiểu năng tuần hoàn não nhẹ do áp lực công việc',
    loi_dan_mac_dinh: 'Bố trí thời gian nghỉ ngơi hợp lý, không làm việc liên tục quá 2 giờ trước màn hình máy tính. Đi ngủ trước 23h, massage vùng thái dương gáy.',
    ghi_chu: 'Dành cho cán bộ văn phòng, lập trình viên căng thẳng áp lực',
    chi_tiet: [
      { loai_muc: 'dich_vu_kt', id_muc: 1, so_luong: 1, cach_dung: 'Khám thần kinh và huyết áp' },
      { loai_muc: 'thuoc', id_muc: 14, so_luong: 6, cach_dung: 'Uống 1 viên khi đau đầu dữ dội, cách ít nhất 6 tiếng' },
      { loai_muc: 'thuoc', id_muc: 15, so_luong: 1, cach_dung: 'Thoa thái dương và vùng gáy khi căng thẳng' },
      { loai_muc: 'dich_vu_kt', id_muc: 7, so_luong: 1, cach_dung: 'Xoa bóp day ấn huyệt vùng vai gáy thư giãn' }
    ]
  },
  {
    id: 6,
    ten_benh: 'Đau thắt lưng cấp / Hội chứng cổ vai cánh tay do vận động',
    chan_doan_chuan: 'Đau lưng dưới cấp tính do co cứng cơ (M54.5) - Viêm cơ thắt lưng',
    loi_dan_mac_dinh: 'Hạn chế mang vác vật nặng, không xoay vặn người đột ngột. Chườm ấm vùng thắt lưng 20 phút mỗi tối. Tập các bài tập kéo giãn cơ nhẹ nhàng.',
    ghi_chu: 'Kháng viêm giảm phù nề cơ xương khớp kết hợp vật lý trị liệu',
    chi_tiet: [
      { loai_muc: 'dich_vu_kt', id_muc: 1, so_luong: 1, cach_dung: 'Khám vận động cột sống' },
      { loai_muc: 'thuoc', id_muc: 4, so_luong: 10, cach_dung: 'Uống 1 viên x 2 lần/ngày, uống sau ăn no (dùng 5 ngày)' },
      { loai_muc: 'thuoc', id_muc: 5, so_luong: 5, cach_dung: 'Uống 1 viên trước ăn sáng (bảo vệ dạ dày khi dùng giảm đau)' },
      { loai_muc: 'dich_vu_kt', id_muc: 7, so_luong: 1, cach_dung: 'Vật lý trị liệu xoa bóp giãn cơ lưng' }
    ]
  }  ,
  {
    id: 7,
    ten_benh: 'Viêm quanh khớp vai / Đau vai gáy cấp',
    chan_doan_chuan: 'Đau vai gáy (M53.1)',
    loi_dan_mac_dinh: 'Hạn chế vận động mạnh, chườm ấm vùng cổ vai, xoa bóp nhẹ nhàng. Ngồi đúng tư thế khi làm việc.',
    ghi_chu: 'Dành cho trường hợp đau mỏi cổ vai gáy do thoái hóa hoặc ngồi văn phòng',
    chi_tiet: [
      { loai_muc: 'dich_vu_kt', id_muc: 7, so_luong: 1, cach_dung: 'Xoa bóp bấm huyệt vùng cổ vai gáy' },
      { loai_muc: 'thuoc', id_muc: 4, so_luong: 10, cach_dung: 'Uống 1 viên x 2 lần/ngày sau ăn no' },
      { loai_muc: 'thuoc', id_muc: 18, so_luong: 5, cach_dung: 'Dán vào vùng đau 1 miếng/ngày' }
    ]
  },
  {
    id: 8,
    ten_benh: 'Tăng huyết áp vô căn (nguyên phát)',
    chan_doan_chuan: 'Tăng huyết áp vô căn (I10)',
    loi_dan_mac_dinh: 'Ăn nhạt, hạn chế đồ chiên xào nhiều mỡ, không uống rượu bia. Theo dõi huyết áp hàng ngày vào buổi sáng.',
    ghi_chu: 'Khám định kỳ và cấp thuốc huyết áp',
    chi_tiet: [
      { loai_muc: 'dich_vu_kt', id_muc: 1, so_luong: 1, cach_dung: 'Khám tim mạch - Huyết áp' },
      { loai_muc: 'dich_vu_kt', id_muc: 2, so_luong: 1, cach_dung: 'Đo điện tim (ECG)' },
      { loai_muc: 'thuoc', id_muc: 15, so_luong: 30, cach_dung: 'Uống 1 viên vào buổi sáng' }
    ]
  },
  {
    id: 9,
    ten_benh: 'Viêm da cơ địa / Dị ứng da',
    chan_doan_chuan: 'Viêm da tiếp xúc dị ứng (L23)',
    loi_dan_mac_dinh: 'Tránh tiếp xúc hóa chất tẩy rửa, giữ ẩm da. Không gãi mạnh gây trầy xước bội nhiễm.',
    ghi_chu: 'Phác đồ điều trị viêm da, nổi mẩn ngứa dị ứng',
    chi_tiet: [
      { loai_muc: 'dich_vu_kt', id_muc: 1, so_luong: 1, cach_dung: 'Khám lâm sàng da liễu' },
      { loai_muc: 'thuoc', id_muc: 10, so_luong: 10, cach_dung: 'Uống 1 viên vào buổi tối' },
      { loai_muc: 'thuoc', id_muc: 13, so_luong: 10, cach_dung: 'Uống 1 viên sáng, 1 viên chiều để tăng đề kháng' }
    ]
  }
];

export const SEED_NGUOI_DUNG = [
  {
    id: 1,
    ten_dang_nhap: 'ban_quan_y',
    mat_khau: 'Giang@9999',
    ho_ten: 'Ban Quân Y',
    vai_tro: 'admin' as const,
    id_bac_si: 1,
    trang_thai: 1
  }
];

export const MORE_NHAN_SU: NhanSu[] = [
  {
    id: 6,
    ho_ten: 'Trần Anh Tuấn',
    ngay_sinh: '1977-05-16',
    ma_the_bhyt: 'HC40106070425',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 7,
    ho_ten: 'Lý Hải Yến',
    ngay_sinh: '1971-02-18',
    ma_the_bhyt: 'HC40107398361',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 8,
    ho_ten: 'Phạm Quỳnh Anh',
    ngay_sinh: '1973-04-11',
    ma_the_bhyt: 'HC40104807149',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 9,
    ho_ten: 'Bùi Xuân Phái',
    ngay_sinh: '1975-04-17',
    ma_the_bhyt: 'HC40101291666',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 10,
    ho_ten: 'Đỗ Minh Trí',
    ngay_sinh: '1971-05-10',
    ma_the_bhyt: 'HC40105608425',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 11,
    ho_ten: 'Nguyễn Hồng Gấm',
    ngay_sinh: '1971-03-10',
    ma_the_bhyt: 'HC40106547820',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 12,
    ho_ten: 'Lê Bích Ngọc',
    ngay_sinh: '1977-05-11',
    ma_the_bhyt: 'HC40102768894',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 13,
    ho_ten: 'Vũ Quốc Bảo',
    ngay_sinh: '1975-08-13',
    ma_the_bhyt: 'HC40102843587',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 14,
    ho_ten: 'Đào Thị Lan',
    ngay_sinh: '1988-03-14',
    ma_the_bhyt: 'HC40103103387',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 15,
    ho_ten: 'Ngô Văn Mạnh',
    ngay_sinh: '1981-04-14',
    ma_the_bhyt: 'HC40105787082',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 16,
    ho_ten: 'Hồ Thanh Tùng',
    ngay_sinh: '1981-08-17',
    ma_the_bhyt: 'HC40107427003',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 17,
    ho_ten: 'Dương Bích Hà',
    ngay_sinh: '1983-04-18',
    ma_the_bhyt: 'HC40108881271',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 18,
    ho_ten: 'Mai Anh Tài',
    ngay_sinh: '1988-08-16',
    ma_the_bhyt: 'HC40107710968',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 19,
    ho_ten: 'Phan Văn Đồng',
    ngay_sinh: '1974-04-14',
    ma_the_bhyt: 'HC40101672212',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 20,
    ho_ten: 'Trịnh Thị Mỹ',
    ngay_sinh: '1970-07-12',
    ma_the_bhyt: 'HC40105393865',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 21,
    ho_ten: 'Lâm Chấn Huy',
    ngay_sinh: '1975-07-12',
    ma_the_bhyt: 'HC40102938224',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 22,
    ho_ten: 'Đinh Công Tráng',
    ngay_sinh: '1978-01-11',
    ma_the_bhyt: 'HC40103561012',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 23,
    ho_ten: 'Tô Thùy Linh',
    ngay_sinh: '1989-03-15',
    ma_the_bhyt: 'HC40103150593',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 24,
    ho_ten: 'Quách Tỉnh',
    ngay_sinh: '1981-04-18',
    ma_the_bhyt: 'HC40106067201',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  },
  {
    id: 25,
    ho_ten: 'Trương Vô Kỵ',
    ngay_sinh: '1984-09-16',
    ma_the_bhyt: 'HC40108824596',
    gioi_tinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
    id_don_vi_cap_2: Math.floor(Math.random() * 7) + 1,
    cap_bac: 'Chuyên viên',
    chuc_vu: 'Nhân viên'
  }
];

export const MORE_THUOC: Thuoc[] = [
  { id: 16, ten: 'Vitamin B Complex', don_vi_tinh: 'Viên', don_gia: 1500, ham_luong: 'Vừa đủ', ton_kho: 500, cach_dung_mac_dinh: 'Uống 1 viên sau ăn sáng', ghi_chu: 'Bổ sung vitamin nhóm B' },
  { id: 17, ten: 'Cefixime 200mg', don_vi_tinh: 'Viên', don_gia: 8000, ham_luong: '200mg', ton_kho: 150, cach_dung_mac_dinh: 'Uống 1 viên x 2 lần/ngày', ghi_chu: 'Kháng sinh' },
  { id: 18, ten: 'Salonpas (Cao dán)', don_vi_tinh: 'Miếng', don_gia: 1200, ham_luong: 'Vừa đủ', ton_kho: 300, cach_dung_mac_dinh: 'Dán ngoài da vùng đau nhức', ghi_chu: 'Giảm đau tại chỗ' },
  { id: 19, ten: 'Men tiêu hóa (Enterogermina)', don_vi_tinh: 'Ống', don_gia: 6500, ham_luong: '5ml', ton_kho: 200, cach_dung_mac_dinh: 'Uống 1 ống x 2 lần/ngày', ghi_chu: 'Cân bằng hệ vi sinh' },
  { id: 20, ten: 'Natri Clorid 0.9%', don_vi_tinh: 'Lọ', don_gia: 3500, ham_luong: '10ml', ton_kho: 300, cach_dung_mac_dinh: 'Nhỏ mắt, mũi', ghi_chu: 'Nước muối sinh lý' }
];

export const MORE_VAT_TU: VatTu[] = [
  { id: 10, ten: 'Băng keo y tế', don_vi_tinh: 'Cuộn', don_gia: 15000, ton_kho: 50, ghi_chu: 'Cố định gạc' },
  { id: 11, ten: 'Nước cất pha tiêm', don_vi_tinh: 'Ống', don_gia: 2000, ton_kho: 150, ghi_chu: 'Pha thuốc tiêm' },
  { id: 12, ten: 'Kim tiêm 3ml', don_vi_tinh: 'Cái', don_gia: 1000, ton_kho: 400, ghi_chu: 'Dùng tiêm thuốc' },
  { id: 13, ten: 'Bông tẩm cồn', don_vi_tinh: 'Hộp', don_gia: 25000, ton_kho: 40, ghi_chu: 'Sát khuẩn tại chỗ' },
  { id: 14, ten: 'Dây truyền dịch', don_vi_tinh: 'Bộ', don_gia: 8000, ton_kho: 80, ghi_chu: 'Truyền dịch tĩnh mạch' }
];

export const MORE_DICH_VU_KT: DichVuKT[] = [
  { id: 8, ten: 'Truyền dịch tĩnh mạch', don_vi_tinh: 'Lần', don_gia: 50000, ghi_chu: 'Truyền Ringer hoặc NaCl' },
  { id: 9, ten: 'Siêu âm ổ bụng tổng quát', don_vi_tinh: 'Lần', don_gia: 150000, ghi_chu: 'Kiểm tra gan, mật, tụy, thận' },
  { id: 10, ten: 'Chụp X-quang phổi thẳng', don_vi_tinh: 'Lần', don_gia: 80000, ghi_chu: 'Tầm soát bệnh lý hô hấp' }
];
