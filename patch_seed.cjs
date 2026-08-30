const fs = require('fs');
let seed = fs.readFileSync('src/db/seed-data.ts', 'utf8');

// We will add SEED_DON_VI_CAP_1
const cap1 = `
export const SEED_DON_VI_CAP_1 = [
  { id: 1, ten: 'Khối Cơ quan', ghi_chu: 'Các phòng ban trung tâm' },
  { id: 2, ten: 'Khối Đơn vị cơ sở', ghi_chu: 'Các đơn vị trực thuộc' },
  { id: 3, ten: 'Khối Sự nghiệp', ghi_chu: 'Các trung tâm, ban quản lý' }
];
`;

seed = seed.replace(/export const SEED_CO_QUAN: Omit<CoQuan, 'created_at'>\[\] = \[\s*\{ id: 1, id_don_vi_cap_1: 1, ten: 'Ban Lãnh Đạo Cơ Quan', ghi_chu: 'Khối điều hành & chỉ huy trực tiếp' \},\s*\{ id: 2, id_don_vi_cap_1: 1, ten: 'Phòng Kế Hoạch - Tổng Hợp', ghi_chu: 'Tham mưu chiến lược, hành chính' \},\s*\{ id: 3, id_don_vi_cap_1: 1, ten: 'Phòng Tổ Chức - Cán Bộ', ghi_chu: 'Quản lý nhân sự và chế độ chính sách' \},\s*\{ id: 4, id_don_vi_cap_1: 1, ten: 'Phòng Hậu Cần - Kỹ Thuật', ghi_chu: 'Quản lý trang thiết bị & hậu cần' \},\s*\{ id: 5, id_don_vi_cap_1: 1, ten: 'Phòng Tài Chính - Kế Toán', ghi_chu: 'Quản lý tài chính ngân sách' \},\s*\{ id: 6, id_don_vi_cap_1: 1, ten: 'Trung Tâm Công Nghệ & Thông Tin', ghi_chu: 'Hạ tầng mạng & chuyển đổi số' \},\s*\{ id: 7, id_don_vi_cap_1: 1, ten: 'Đội Xe & Bảo Vệ Mục Tiêu', ghi_chu: 'Lực lượng cơ động, tuần tra bảo vệ' \}\s*\];/, 
`export const SEED_DON_VI_CAP_1 = [
  { id: 1, ten: 'Khối Cơ quan', ghi_chu: 'Các phòng ban trung tâm' },
  { id: 2, ten: 'Khối Đơn vị cơ sở', ghi_chu: 'Các đơn vị trực thuộc' },
  { id: 3, ten: 'Khối Sự nghiệp', ghi_chu: 'Các trung tâm, ban quản lý' }
];

export const SEED_CO_QUAN: Omit<CoQuan, 'created_at'>[] = [
  { id: 1, id_don_vi_cap_1: 1, ten: 'Ban Chỉ Huy Cơ Quan', ghi_chu: 'Khối điều hành & chỉ huy trực tiếp' },
  { id: 2, id_don_vi_cap_1: 1, ten: 'Phòng Chính Trị', ghi_chu: 'Công tác Đảng, chính trị' },
  { id: 3, id_don_vi_cap_1: 1, ten: 'Phòng Tổ Chức - Cán Bộ', ghi_chu: 'Quản lý nhân sự và chế độ chính sách' },
  { id: 4, id_don_vi_cap_1: 1, ten: 'Phòng Hậu Cần - Kỹ Thuật', ghi_chu: 'Quản lý trang thiết bị & hậu cần' },
  { id: 5, id_don_vi_cap_1: 1, ten: 'Phòng Tài Chính - Kế Toán', ghi_chu: 'Quản lý tài chính ngân sách' },
  { id: 6, id_don_vi_cap_1: 1, ten: 'Phòng Kế Hoạch - Tổng Hợp', ghi_chu: 'Tham mưu chiến lược, hành chính' },
  { id: 7, id_don_vi_cap_1: 2, ten: 'Đội Công Tác Cơ Sở 1', ghi_chu: 'Đơn vị trực thuộc số 1' },
  { id: 8, id_don_vi_cap_1: 2, ten: 'Đội Công Tác Cơ Sở 2', ghi_chu: 'Đơn vị trực thuộc số 2' },
  { id: 9, id_don_vi_cap_1: 3, ten: 'Trung Tâm Công Nghệ & Thông Tin', ghi_chu: 'Hạ tầng mạng & chuyển đổi số' },
  { id: 10, id_don_vi_cap_1: 3, ten: 'Trung Tâm Huấn Luyện', ghi_chu: 'Đào tạo & Huấn luyện' }
];`);

fs.writeFileSync('src/db/seed-data.ts', seed, 'utf8');
