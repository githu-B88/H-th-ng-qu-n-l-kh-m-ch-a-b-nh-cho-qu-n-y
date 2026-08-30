const fs = require('fs');

let seed = fs.readFileSync('src/db/seed-data.ts', 'utf8');
// Fix SEED_CO_QUAN
seed = seed.replace(/export const SEED_CO_QUAN: Omit<CoQuan, 'created_at'>\[\] = \[[\s\S]*?\];/, `export const SEED_CO_QUAN: Omit<CoQuan, 'created_at'>[] = [
  { id: 1, id_don_vi_cap_1: 1, ten: 'Ban Lãnh Đạo Cơ Quan', ghi_chu: 'Khối điều hành & chỉ huy trực tiếp' },
  { id: 2, id_don_vi_cap_1: 1, ten: 'Phòng Kế Hoạch - Tổng Hợp', ghi_chu: 'Tham mưu chiến lược, hành chính' },
  { id: 3, id_don_vi_cap_1: 1, ten: 'Phòng Tổ Chức - Cán Bộ', ghi_chu: 'Quản lý nhân sự và chế độ chính sách' },
  { id: 4, id_don_vi_cap_1: 1, ten: 'Phòng Hậu Cần - Kỹ Thuật', ghi_chu: 'Quản lý trang thiết bị & hậu cần' },
  { id: 5, id_don_vi_cap_1: 1, ten: 'Phòng Tài Chính - Kế Toán', ghi_chu: 'Quản lý tài chính ngân sách' },
  { id: 6, id_don_vi_cap_1: 1, ten: 'Trung Tâm Công Nghệ & Thông Tin', ghi_chu: 'Hạ tầng mạng & chuyển đổi số' },
  { id: 7, id_don_vi_cap_1: 1, ten: 'Đội Xe & Bảo Vệ Mục Tiêu', ghi_chu: 'Lực lượng cơ động, tuần tra bảo vệ' }
];`);

fs.writeFileSync('src/db/seed-data.ts', seed, 'utf8');
