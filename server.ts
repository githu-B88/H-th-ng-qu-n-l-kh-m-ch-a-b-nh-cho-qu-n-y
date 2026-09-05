import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer as createViteServer } from 'vite';
import {
  SEED_DON_VI_CAP_1,
  SEED_CO_QUAN,
  SEED_BAC_SI,
  SEED_NHAN_SU,
  MORE_NHAN_SU,
  SEED_NGUOI_DUNG
} from './src/db/seed-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Health check endpoints for platform and dev server detection
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 1. Khai báo Đường dẫn Lưu trữ Vật lý Cố định (Physical File Storage)
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'phongkham_data.sqlite');

// Khởi tạo kết nối SQLite
const db = new Database(dbPath);

// 2. Khóa Logic Khởi Tạo & Seed Dữ Liệu
const initDatabase = () => {
  // Bật foreign keys
  db.pragma('foreign_keys = ON');

  // CREATE TABLES (thay thế DROP TABLE bằng CREATE TABLE IF NOT EXISTS)
  const schema = `
-- =========================================================================
-- PHÒNG KHÁM NỘI BỘ CƠ QUAN - HỆ THỐNG CƠ SỞ DỮ LIỆU SQLITE (OFFLINE 100%)
-- Tương thích hoàn toàn với Tauri / Electron & WebAssembly SQLite engine
-- =========================================================================

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

-- View bí danh tương thích cho bảng vật tư & dịch vụ
CREATE VIEW IF NOT EXISTS vat_tu_y_te AS SELECT id, ten, don_vi_tinh, don_gia, ghi_chu, ton_kho FROM vat_tu;
CREATE VIEW IF NOT EXISTS dich_vu_ky_thuat AS SELECT id, ten, don_vi_tinh, don_gia, ghi_chu FROM dich_vu_kt;

-- Trigger hỗ trợ DELETE/INSERT qua view tương thích
CREATE TRIGGER IF NOT EXISTS trg_del_vat_tu_y_te INSTEAD OF DELETE ON vat_tu_y_te
BEGIN
    DELETE FROM vat_tu WHERE id = OLD.id OR OLD.id IS NULL;
END;

CREATE TRIGGER IF NOT EXISTS trg_del_dich_vu_ky_thuat INSTEAD OF DELETE ON dich_vu_ky_thuat
BEGIN
    DELETE FROM dich_vu_kt WHERE id = OLD.id OR OLD.id IS NULL;
END;

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

-- TRIGGERS TO EMULATE CASCADE DELETE/UPDATE FOR POLYMORPHIC RELATION
CREATE TRIGGER IF NOT EXISTS trg_cascade_delete_thuoc
AFTER DELETE ON thuoc
BEGIN
  DELETE FROM mau_benh_chi_tiet WHERE loai_muc = 'thuoc' AND id_muc = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_cascade_update_thuoc
AFTER UPDATE OF id ON thuoc
BEGIN
  UPDATE mau_benh_chi_tiet SET id_muc = NEW.id WHERE loai_muc = 'thuoc' AND id_muc = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_cascade_delete_vat_tu
AFTER DELETE ON vat_tu
BEGIN
  DELETE FROM mau_benh_chi_tiet WHERE loai_muc = 'vat_tu' AND id_muc = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_cascade_update_vat_tu
AFTER UPDATE OF id ON vat_tu
BEGIN
  UPDATE mau_benh_chi_tiet SET id_muc = NEW.id WHERE loai_muc = 'vat_tu' AND id_muc = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_cascade_delete_dich_vu
AFTER DELETE ON dich_vu_kt
BEGIN
  DELETE FROM mau_benh_chi_tiet WHERE loai_muc = 'dich_vu_kt' AND id_muc = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_cascade_update_dich_vu
AFTER UPDATE OF id ON dich_vu_kt
BEGIN
  UPDATE mau_benh_chi_tiet SET id_muc = NEW.id WHERE loai_muc = 'dich_vu_kt' AND id_muc = OLD.id;
END;

-- CÁC CHỈ MỤC TỐI ƯU HÓA TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_can_bo_ten ON can_bo(ho_ten);
CREATE INDEX IF NOT EXISTS idx_can_bo_donvi ON can_bo(id_don_vi_cap_2);
CREATE INDEX IF NOT EXISTS idx_ho_so_ngay ON ho_so_kham(ngay_kham);
CREATE INDEX IF NOT EXISTS idx_ho_so_nhan_su ON ho_so_kham(id_nhan_su);
CREATE INDEX IF NOT EXISTS idx_ho_so_ma ON ho_so_kham(ma_ho_so);
CREATE INDEX IF NOT EXISTS idx_ho_so_chi_tiet_hoso ON ho_so_kham_chi_tiet(id_ho_so);

`;
  db.exec(schema);

  // SEED DEFAULT DATA
  // 1. Check and seed 'don_vi_cap_1'
  const countDv1 = db.prepare('SELECT COUNT(*) as count FROM don_vi_cap_1').get() as { count: number };
  if (countDv1.count === 0) {
    console.log("Seeding don_vi_cap_1...");
    const insert = db.prepare('INSERT OR IGNORE INTO don_vi_cap_1 (id, ten, ghi_chu) VALUES (?, ?, ?)');
    for (const cap1 of SEED_DON_VI_CAP_1) {
      insert.run(cap1.id, cap1.ten, cap1.ghi_chu || '');
    }
  }

  // 2. Check and seed 'don_vi_cap_2'
  const countDv2 = db.prepare('SELECT COUNT(*) as count FROM don_vi_cap_2').get() as { count: number };
  if (countDv2.count === 0) {
    console.log("Seeding don_vi_cap_2...");
    const insert = db.prepare('INSERT OR IGNORE INTO don_vi_cap_2 (id, id_don_vi_cap_1, ten, ghi_chu) VALUES (?, ?, ?, ?)');
    for (const cq of SEED_CO_QUAN) {
      insert.run(cq.id, cq.id_don_vi_cap_1 || 1, cq.ten, cq.ghi_chu || '');
    }
  }

  // 3. Check and seed 'bac_si'
  const countBs = db.prepare('SELECT COUNT(*) as count FROM bac_si').get() as { count: number };
  if (countBs.count === 0) {
    console.log("Seeding bac_si...");
    const insert = db.prepare('INSERT OR IGNORE INTO bac_si (id, ho_ten, the_bhyt, ngay_sinh, gioi_tinh, id_don_vi, chuyen_mon, ghi_chu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const bs of SEED_BAC_SI) {
      insert.run(bs.id, bs.ho_ten, bs.the_bhyt || null, bs.ngay_sinh || null, bs.gioi_tinh || 'Nam', bs.id_don_vi || null, bs.chuyen_mon || null, bs.ghi_chu || null);
    }
  }

  // 4. Check and seed 'can_bo' and 'the_bhyt'
  const countCb = db.prepare('SELECT COUNT(*) as count FROM can_bo').get() as { count: number };
  if (countCb.count === 0) {
    console.log("Seeding can_bo and the_bhyt...");
    const insertThe = db.prepare('INSERT OR IGNORE INTO the_bhyt (ma_the_bhyt, tu_ngay, den_ngay) VALUES (?, ?, ?)');
    const insertCb = db.prepare('INSERT OR IGNORE INTO can_bo (id, ho_ten, ngay_sinh, gioi_tinh, id_don_vi_cap_2, ma_the_bhyt, cap_bac, chuc_vu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const ns of [...SEED_NHAN_SU, ...MORE_NHAN_SU]) {
      if (ns.ma_the_bhyt) {
        insertThe.run(ns.ma_the_bhyt, '2023-01-01', '2025-12-31');
      }
      insertCb.run(ns.id, ns.ho_ten, ns.ngay_sinh || null, ns.gioi_tinh || 'Nam', ns.id_don_vi_cap_2 || null, ns.ma_the_bhyt || null, ns.cap_bac || null, ns.chuc_vu || null);
    }
  }

  // 5. Check and seed 'nguoi_dung' (Login accounts)
  const countNd = db.prepare('SELECT COUNT(*) as count FROM nguoi_dung').get() as { count: number };
  if (countNd.count === 0) {
    console.log("Seeding nguoi_dung (accounts)...");
    const insertNd = db.prepare('INSERT OR IGNORE INTO nguoi_dung (id, ten_dang_nhap, mat_khau, ho_ten, vai_tro, id_bac_si, trang_thai) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const u of SEED_NGUOI_DUNG) {
      insertNd.run(u.id, u.ten_dang_nhap, u.mat_khau, u.ho_ten, u.vai_tro || 'admin', u.id_bac_si || null, u.trang_thai ?? 1);
    }
    // Also ensure admin alias exists
    insertNd.run(2, 'admin', 'Giang@9999', 'Quản trị viên', 'admin', 1, 1);
  }

  // 6. Check and seed Catalog items (thuoc, vat_tu, dich_vu_kt)
  try {
    const defaultDataPath = path.join(process.cwd(), 'src/db/defaultData.json');
    if (fs.existsSync(defaultDataPath)) {
      const defaultData = JSON.parse(fs.readFileSync(defaultDataPath, 'utf8'));

      const countThuoc = db.prepare('SELECT COUNT(*) as count FROM thuoc').get() as { count: number };
      if (countThuoc.count === 0 && defaultData.thuoc) {
        console.log("Seeding thuoc...");
        const insertThuoc = db.prepare('INSERT OR IGNORE INTO thuoc (ten, don_vi_tinh, don_gia, ghi_chu, ton_kho, ham_luong, cach_dung_mac_dinh) VALUES (?, ?, ?, ?, ?, ?, ?)');
        for (const t of defaultData.thuoc) {
          insertThuoc.run(t.ten, t.dvt, t.gia, t.ghi_chu || '', t.ton_kho, t.ham_luong || '', t.cach_dung || '');
        }
      }

      const countVt = db.prepare('SELECT COUNT(*) as count FROM vat_tu').get() as { count: number };
      if (countVt.count === 0 && defaultData.vat_tu) {
        console.log("Seeding vat_tu...");
        const insertVt = db.prepare('INSERT OR IGNORE INTO vat_tu (ten, don_vi_tinh, don_gia, ghi_chu, ton_kho) VALUES (?, ?, ?, ?, ?)');
        for (const vt of defaultData.vat_tu) {
          insertVt.run(vt.ten, vt.dvt, vt.gia, vt.ghi_chu || '', vt.ton_kho);
        }
      }

      const countDv = db.prepare('SELECT COUNT(*) as count FROM dich_vu_kt').get() as { count: number };
      if (countDv.count === 0 && defaultData.dich_vu) {
        console.log("Seeding dich_vu_kt...");
        const insertDv = db.prepare('INSERT OR IGNORE INTO dich_vu_kt (ten, don_vi_tinh, don_gia, ghi_chu) VALUES (?, ?, ?, ?)');
        for (const dv of defaultData.dich_vu) {
          insertDv.run(dv.ten, dv.dvt, dv.gia, dv.ghi_chu || '');
        }
      }
    }
  } catch (seedErr) {
    console.warn("Seeding catalog note:", seedErr);
  }
};

initDatabase();

// 4. API Endpoint để Frontend đồng bộ (Download nguyên file SQLite)
app.get('/api/db-download', (req, res) => {
  res.sendFile(dbPath);
});

// API Endpoint để thực thi SQL từ Frontend
app.post('/api/query', (req, res) => {
  const { sql, params } = req.body;
  try {
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
    if (isSelect) {
      const stmt = db.prepare(sql);
      const result = stmt.all(params || []);
      res.json({ success: true, data: result });
    } else {
      const stmt = db.prepare(sql);
      const info = stmt.run(params || []);
      res.json({ success: true, changes: info.changes, lastInsertRowid: info.lastInsertRowid });
    }
  } catch (error: any) {
    console.error('SQL Execution Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload SQL Dump to replace the DB (optional utility)
app.post('/api/upload-dump', (req, res) => {
  const { sqlText } = req.body;
  try {
    db.exec(sqlText);
    res.json({ success: true });
  } catch(e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
