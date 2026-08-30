-- =========================================================================
-- PHÒNG KHÁM NỘI BỘ CƠ QUAN - HỆ THỐNG CƠ SỞ DỮ LIỆU SQLITE (OFFLINE 100%)
-- Tương thích hoàn toàn với Tauri / Electron & WebAssembly SQLite engine
-- =========================================================================

PRAGMA foreign_keys = ON;

-- 1. BẢNG CƠ QUAN / PHÒNG BAN TRỰC THUỘC
CREATE TABLE IF NOT EXISTS don_vi_cap_1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten TEXT NOT NULL,
    ghi_chu TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS don_vi_cap_2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_don_vi_cap_1 INTEGER NOT NULL,
    ten TEXT NOT NULL,
    ghi_chu TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_don_vi_cap_1) REFERENCES don_vi_cap_1(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 2. BẢNG BÁC SĨ / Y SĨ PHÒNG KHÁM
CREATE TABLE IF NOT EXISTS bac_si (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ho_ten TEXT NOT NULL,
    the_bhyt TEXT,
    ngay_sinh TEXT,
    gioi_tinh TEXT DEFAULT 'Nam' CHECK(gioi_tinh IN ('Nam', 'Nữ', 'Khác')),
    id_don_vi INTEGER,
    chuyen_mon TEXT,
    ghi_chu TEXT,
    FOREIGN KEY (id_don_vi) REFERENCES don_vi_cap_2(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- 3. BẢNG NHÂN SỰ CƠ QUAN (BỆNH NHÂN ĐẾN KHÁM)
CREATE TABLE IF NOT EXISTS the_bhyt (
    ma_the_bhyt TEXT PRIMARY KEY,
    tu_ngay TEXT,
    den_ngay TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS can_bo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ho_ten TEXT NOT NULL,
    ngay_sinh TEXT,
    gioi_tinh TEXT DEFAULT 'Nam' CHECK(gioi_tinh IN ('Nam', 'Nữ', 'Khác')),
    id_don_vi_cap_2 INTEGER,
    ma_the_bhyt TEXT,
    cap_bac TEXT,
    chuc_vu TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_don_vi_cap_2) REFERENCES don_vi_cap_2(id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (ma_the_bhyt) REFERENCES the_bhyt(ma_the_bhyt) ON UPDATE CASCADE ON DELETE SET NULL
);

-- 4. BẢNG TÀI KHOẢN ĐĂNG NHẬP & BẢO MẬT HỆ THỐNG
CREATE TABLE IF NOT EXISTS nguoi_dung (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten_dang_nhap TEXT NOT NULL UNIQUE,
    mat_khau TEXT NOT NULL,
    ho_ten TEXT NOT NULL,
    vai_tro TEXT DEFAULT 'bac_si' CHECK(vai_tro IN ('admin', 'bac_si', 'y_si', 'duoc_si')),
    id_bac_si INTEGER,
    trang_thai INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_bac_si) REFERENCES bac_si(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- 5. BẢNG DANH MỤC THUỐC
CREATE TABLE IF NOT EXISTS thuoc (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten TEXT NOT NULL,
    don_vi_tinh TEXT NOT NULL,
    don_gia REAL NOT NULL DEFAULT 0,
    ghi_chu TEXT,
    ton_kho INTEGER NOT NULL DEFAULT 0,
    ham_luong TEXT,
    cach_dung_mac_dinh TEXT
);

-- 6. BẢNG DANH MỤC VẬT TƯ Y TẾ TIÊU HAO
CREATE TABLE IF NOT EXISTS vat_tu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten TEXT NOT NULL,
    don_vi_tinh TEXT NOT NULL,
    don_gia REAL NOT NULL DEFAULT 0,
    ghi_chu TEXT,
    ton_kho INTEGER NOT NULL DEFAULT 0
);

-- 7. BẢNG DANH MỤC DỊCH VỤ KỸ THUẬT & THỦ THUẬT Y TẾ
CREATE TABLE IF NOT EXISTS dich_vu_kt (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten TEXT NOT NULL,
    don_vi_tinh TEXT NOT NULL,
    don_gia REAL NOT NULL DEFAULT 0,
    ghi_chu TEXT
);

-- 8. BẢNG MẪU BỆNH / PHÁC ĐỒ ĐIỀU TRỊ CHUẨN (1-CLICK TEMPLATE)
CREATE TABLE IF NOT EXISTS mau_benh (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten_benh TEXT NOT NULL,
    chan_doan_chuan TEXT,
    loi_dan_mac_dinh TEXT,
    ghi_chu TEXT
);

-- 9. BẢNG CHI TIẾT MẪU BỆNH (GỒM THUỐC, VẬT TƯ, DỊCH VỤ MẶC ĐỊNH)
CREATE TABLE IF NOT EXISTS mau_benh_chi_tiet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_mau_benh INTEGER NOT NULL,
    loai_muc TEXT NOT NULL CHECK(loai_muc IN ('thuoc', 'vat_tu', 'dich_vu_kt')),
    id_muc INTEGER NOT NULL,
    so_luong INTEGER NOT NULL DEFAULT 1,
    cach_dung TEXT,
    ghi_chu TEXT,
    FOREIGN KEY (id_mau_benh) REFERENCES mau_benh(id) ON DELETE CASCADE
);

-- 10. BẢNG HỒ SƠ KHÁM Y BẠ & KÊ ĐƠN ĐIỀU TRỊ
CREATE TABLE IF NOT EXISTS ho_so_kham (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_ho_so TEXT NOT NULL UNIQUE,
    id_nhan_su INTEGER NOT NULL,
    ngay_kham TEXT NOT NULL,
    trieu_chung TEXT,
    mach INTEGER,
    nhiet_do REAL,
    huyet_ap TEXT,
    nhip_tho INTEGER,
    can_nang REAL,
    chieu_cao REAL,
    chan_doan TEXT NOT NULL,
    id_mau_benh INTEGER,
    id_bac_si INTEGER NOT NULL,
    loi_dan TEXT,
    tong_chi_phi REAL NOT NULL DEFAULT 0,
    trang_thai_bhyt INTEGER NOT NULL DEFAULT 1, -- 0: Tự chi trả, 1: Hưởng BHYT, 2: Cơ quan cấp miễn phí
    ngay_tai_kham TEXT,
    trang_thai_kham TEXT NOT NULL DEFAULT 'hoan_thanh' CHECK(trang_thai_kham IN ('dang_kham', 'hoan_thanh', 'chuyen_tuyen')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nhan_su) REFERENCES can_bo(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_bac_si) REFERENCES bac_si(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_mau_benh) REFERENCES mau_benh(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- 11. BẢNG CHI TIẾT HỒ SƠ KHÁM (THUỐC, VẬT TƯ, DỊCH VỤ THỰC TẾ ĐƯỢC KÊ)
CREATE TABLE IF NOT EXISTS ho_so_kham_chi_tiet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_ho_so INTEGER NOT NULL,
    loai_muc TEXT NOT NULL CHECK(loai_muc IN ('thuoc', 'vat_tu', 'dich_vu_kt')),
    id_muc INTEGER NOT NULL,
    ten_muc TEXT NOT NULL,
    don_vi_tinh TEXT NOT NULL,
    so_luong INTEGER NOT NULL DEFAULT 1,
    don_gia REAL NOT NULL DEFAULT 0,
    thanh_tien REAL NOT NULL DEFAULT 0,
    cach_dung TEXT,
    ghi_chu TEXT,
    FOREIGN KEY (id_ho_so) REFERENCES ho_so_kham(id) ON DELETE CASCADE
);

-- CÁC CHỈ MỤC TỐI ƯU HÓA TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_can_bo_ten ON can_bo(ho_ten);
CREATE INDEX IF NOT EXISTS idx_can_bo_donvi ON can_bo(id_don_vi_cap_2);
CREATE INDEX IF NOT EXISTS idx_ho_so_ngay ON ho_so_kham(ngay_kham);
CREATE INDEX IF NOT EXISTS idx_ho_so_nhan_su ON ho_so_kham(id_nhan_su);
CREATE INDEX IF NOT EXISTS idx_ho_so_ma ON ho_so_kham(ma_ho_so);
CREATE INDEX IF NOT EXISTS idx_ho_so_chi_tiet_hoso ON ho_so_kham_chi_tiet(id_ho_so);
