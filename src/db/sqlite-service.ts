import initSqlJs, { Database, SqlValue } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import {
  CoQuan,
  BacSi,
  NhanSu,
  Thuoc,
  VatTu,
  DichVuKT,
  MauBenh,
  MauBenhChiTiet,
  HoSoKham,
  HoSoKhamChiTiet,
  NguoiDung
} from '../types';
import {
  SEED_DON_VI_CAP_1,
  MORE_NHAN_SU,
  MORE_THUOC,
  MORE_VAT_TU,
  MORE_DICH_VU_KT,
  SEED_CO_QUAN,
  SEED_BAC_SI,
  SEED_NHAN_SU,
  SEED_THUOC,
  SEED_VAT_TU,
  SEED_DICH_VU_KT,
  SEED_MAU_BENH,
  SEED_NGUOI_DUNG
} from './seed-data';
import defaultData from './defaultData.json';
import { matchCatalogItem } from './seed53MauBenh';

const DB_STORAGE_KEY = 'phong_kham_sqlite_db_v5';
const DB_INDEXED_DB_NAME = 'PhongKhamOfflineDB_v5';
const DB_STORE_NAME = 'sqlite_binary';

class SqliteService {
  private db: Database | null = null;
  private isInitialized = false;
  private listeners: (() => void)[] = [];
  private idbInstance: IDBDatabase | null = null;
  private isSaving = false;
  private saveQueued = false;
  private saveResolveQueue: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushSyncBackup();
      });
      window.addEventListener('pagehide', () => {
        this.flushSyncBackup();
      });
    }
  }

  private notifyTimeout: any = null;

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public notify() {
    if (this.notifyTimeout) return;
    this.notifyTimeout = setTimeout(() => {
      this.notifyTimeout = null;
      this.listeners.forEach((l) => {
        try {
          l();
        } catch (e) {
          console.error('Listener notification error:', e);
        }
      });
    }, 16);
  }

  private flushSyncBackup(): void {
    if (!this.db) return;
    try {
      const data = this.db.export();
      if (data && data.length > 0 && data.length < 4800000) {
        let binaryStr = '';
        const chunkSize = 8192;
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.subarray(i, i + chunkSize);
          binaryStr += String.fromCharCode.apply(null, chunk as any);
        }
        localStorage.setItem(DB_STORAGE_KEY, btoa(binaryStr));
      }
    } catch {
      // Ignore during page teardown
    }
  }

  // Save database binary to IndexedDB with queueing / mutex without blocking localStorage conversion
  public async persistDatabase(): Promise<void> {
    // No longer persisting to IndexedDB locally.
    // Writes are synced directly to backend via monkey-patched db.run()
    return;
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    if (this.idbInstance) {
      try {
        if (this.idbInstance.objectStoreNames.contains(DB_STORE_NAME)) {
          return this.idbInstance;
        }
      } catch {
        this.idbInstance = null;
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_INDEXED_DB_NAME, 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
            db.createObjectStore(DB_STORE_NAME);
          }
        };
        request.onsuccess = () => {
          this.idbInstance = request.result;
          this.idbInstance.onclose = () => {
            this.idbInstance = null;
          };
          this.idbInstance.onerror = () => {
            this.idbInstance = null;
          };
          resolve(request.result);
        };
        request.onerror = () => {
          this.idbInstance = null;
          reject(request.error);
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  private async saveToIndexedDB(data: Uint8Array): Promise<void> {
    // 1. IndexedDB primary save (fast, non-blocking, handles large binary)
    let idbSuccess = false;
    try {
      const idb = await this.openIndexedDB();
      await new Promise<void>((resolve, reject) => {
        const tx = idb.transaction(DB_STORE_NAME, 'readwrite');
        const store = tx.objectStore(DB_STORE_NAME);
        const req = store.put(data, 'main_db');
        req.onsuccess = () => {
          idbSuccess = true;
          resolve();
        };
        req.onerror = () => reject(req.error);
        tx.onabort = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('IndexedDB write warning:', err);
    }

    // 2. localStorage secondary fallback ONLY if IndexedDB failed
    if (!idbSuccess) {
      try {
        if (data.length < 4800000) {
          let binaryStr = '';
          const chunkSize = 8192;
          for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.subarray(i, i + chunkSize);
            binaryStr += String.fromCharCode.apply(null, chunk as any);
          }
          localStorage.setItem(DB_STORAGE_KEY, btoa(binaryStr));
        }
      } catch (e) {
        console.warn('Fallback localStorage storage error:', e);
      }
    }
  }

  private async loadFromIndexedDB(): Promise<Uint8Array | null> {
    // 1. Try IndexedDB first
    try {
      const idb = await this.openIndexedDB();
      const res = await new Promise<Uint8Array | null>((resolve) => {
        const tx = idb.transaction(DB_STORE_NAME, 'readonly');
        const store = tx.objectStore(DB_STORE_NAME);
        const req = store.get('main_db');
        req.onsuccess = () => {
          const val = req.result;
          if (!val) {
            resolve(null);
            return;
          }
          if (val instanceof Uint8Array && val.length > 0) {
            resolve(val);
          } else if (val instanceof ArrayBuffer && val.byteLength > 0) {
            resolve(new Uint8Array(val));
          } else if (val.buffer instanceof ArrayBuffer && val.buffer.byteLength > 0) {
            resolve(new Uint8Array(val.buffer));
          } else if (Array.isArray(val) && val.length > 0) {
            resolve(new Uint8Array(val));
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
      if (res && res.length > 100) {
        return res;
      }
    } catch (e) {
      console.warn('IndexedDB read error:', e);
    }

    // 2. Fallback to localStorage
    try {
      const stored = localStorage.getItem(DB_STORAGE_KEY);
      if (stored) {
        const binaryStr = atob(stored);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        if (bytes.length > 100) {
          return bytes;
        }
      }
    } catch (e) {
      console.warn('Fallback localStorage read error:', e);
    }
    return null;
  }

  private async getSqlJs(): Promise<any> {
    const initSql = (initSqlJs as any)?.default || initSqlJs;

    // Use the bundled Vite wasm URL via locateFile so sql.js fetches it correctly
    try {
      return await initSql({
        locateFile: () => sqlWasmUrl
      });
    } catch (e) {
      console.warn('Bundled WASM failed, falling back to CDN...', e);
      return await initSql({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
      });
    }
  }

  public async init(): Promise<void> {
    if (this.isInitialized && this.db) return;
    try {
      const SQL = await this.getSqlJs();
      
      console.log('Downloading master SQLite DB from backend...');
      try {
        const response = await fetch('/api/db-download?_t=' + Date.now());
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          this.db = new SQL.Database(new Uint8Array(arrayBuffer));
          console.log('Downloaded and initialized SQLite from backend successfully.');
        } else {
          console.warn('Failed to download DB from backend (Not OK), creating empty.');
          this.db = new SQL.Database();
          this.createTables();
          this.seedInitialData(false);
        }
      } catch (err) {
        console.warn('Backend /api/db-download failed, creating empty.', err);
        this.db = new SQL.Database();
        this.createTables();
        this.seedInitialData(false);
      }

      // Check if accounts exist, if empty seed initial data
      try {
        const userCheck = this.db.exec("SELECT COUNT(*) as count FROM nguoi_dung");
        const userCount = userCheck.length > 0 && userCheck[0].values.length > 0 ? Number(userCheck[0].values[0][0]) : 0;
        if (userCount === 0) {
          console.log('nguoi_dung is empty, seeding initial data on client...');
          this.seedInitialData(false);
        }
      } catch (checkErr) {
        console.warn('Initial data verification note:', checkErr);
        try {
          this.createTables();
          this.seedInitialData(false);
        } catch (createErr) {
          console.error('Failed to create tables or seed fallback:', createErr);
        }
      }

      // Monkey patch this.db.run to auto-sync to backend
      const originalRun = this.db.run.bind(this.db);
      this.db.run = (sql: string, params?: any[]) => {
          const result = originalRun(sql, params);
          // Sync to backend (fire and forget)
          if (!sql.toUpperCase().includes('PRAGMA ')) {
             fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql, params: params || [] })
             }).catch(e => console.error("Sync error:", e));
          }
          return result;
      };

      // MIGRATION: Bổ sung cột id_don_vi_cap_1 cho bac_si và can_bo nếu chưa có
      try {
        originalRun("ALTER TABLE bac_si ADD COLUMN id_don_vi_cap_1 INTEGER;");
      } catch {}
      try {
        originalRun("ALTER TABLE can_bo ADD COLUMN id_don_vi_cap_1 INTEGER;");
      } catch {}
      try {
        originalRun(`
          UPDATE bac_si 
          SET id_don_vi_cap_1 = (SELECT id_don_vi_cap_1 FROM don_vi_cap_2 WHERE don_vi_cap_2.id = bac_si.id_don_vi)
          WHERE id_don_vi_cap_1 IS NULL AND id_don_vi IS NOT NULL;
        `);
        originalRun(`
          UPDATE can_bo 
          SET id_don_vi_cap_1 = (SELECT id_don_vi_cap_1 FROM don_vi_cap_2 WHERE don_vi_cap_2.id = can_bo.id_don_vi_cap_2)
          WHERE id_don_vi_cap_1 IS NULL AND id_don_vi_cap_2 IS NOT NULL;
        `);
      } catch {}

      this.isInitialized = true;
      this.notify();
    } catch (error) {
      console.error('Failed to initialize SQLite with sql.js:', error);
      throw error;
    }
  }

  private createTables() {
    if (!this.db) return;
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
    id_don_vi_cap_1 INTEGER,
    id_don_vi INTEGER,
    chuyen_mon TEXT,
    ghi_chu TEXT,
    FOREIGN KEY (id_don_vi_cap_1) REFERENCES don_vi_cap_1(id) ON UPDATE CASCADE ON DELETE SET NULL,
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
    id_don_vi_cap_1 INTEGER,
    id_don_vi_cap_2 INTEGER,
    ma_the_bhyt TEXT,
    cap_bac TEXT,
    chuc_vu TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_don_vi_cap_1) REFERENCES don_vi_cap_1(id) ON UPDATE CASCADE ON DELETE SET NULL,
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

    this.db.run(schema);
  }

  public seedInitialData(force = false) {
    if (!this.db) return;

    this.db.run("PRAGMA foreign_keys = OFF;");

    if (!force) {
      const check = this.db.exec("SELECT COUNT(*) as count FROM don_vi_cap_2");
      if (check.length > 0 && Number(check[0].values[0][0]) > 0) {
        this.db.run("PRAGMA foreign_keys = ON;");
        return; // already initialized
      }
    } else {
      // Clear all tables
      this.db.run(`
        DELETE FROM ho_so_kham_chi_tiet;
        DELETE FROM ho_so_kham;
        DELETE FROM mau_benh_chi_tiet;
        DELETE FROM mau_benh;
        DELETE FROM dich_vu_kt;
        DELETE FROM vat_tu;
        DELETE FROM thuoc;
        DELETE FROM can_bo;
        DELETE FROM bac_si;
        DELETE FROM the_bhyt; DELETE FROM can_bo; DELETE FROM don_vi_cap_2; DELETE FROM don_vi_cap_1;
      `);
    }

    
    // Bỏ qua dữ liệu cũ, chèn cứng
    
    for (const cap1 of SEED_DON_VI_CAP_1) {
      this.db.run("INSERT OR IGNORE INTO don_vi_cap_1 (id, ten, ghi_chu) VALUES (?, ?, ?)",
        [cap1.id, cap1.ten, cap1.ghi_chu || '']
      );
    }

    for (const cq of SEED_CO_QUAN) {
      this.db.run("INSERT OR IGNORE INTO don_vi_cap_2 (id, id_don_vi_cap_1, ten, ghi_chu) VALUES (?, ?, ?, ?)",
        [cq.id, cq.id_don_vi_cap_1 || 1, cq.ten, cq.ghi_chu || '']
      );
    }

    for (const bs of SEED_BAC_SI) {
      this.db.run("INSERT OR IGNORE INTO bac_si (id, ho_ten, the_bhyt, ngay_sinh, gioi_tinh, id_don_vi, chuyen_mon, ghi_chu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [bs.id, bs.ho_ten, bs.the_bhyt || null, bs.ngay_sinh || null, bs.gioi_tinh || 'Nam', bs.id_don_vi || null, bs.chuyen_mon || null, bs.ghi_chu || null]
      );
    }

    for (const ns of [...SEED_NHAN_SU, ...MORE_NHAN_SU]) {
      if (ns.ma_the_bhyt) {
        this.db.run("INSERT OR IGNORE INTO the_bhyt (ma_the_bhyt, tu_ngay, den_ngay) VALUES (?, ?, ?)",
          [ns.ma_the_bhyt, '2023-01-01', '2025-12-31']
        );
      }
      this.db.run("INSERT OR IGNORE INTO can_bo (id, ho_ten, ngay_sinh, gioi_tinh, id_don_vi_cap_2, ma_the_bhyt, cap_bac, chuc_vu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [ns.id, ns.ho_ten, ns.ngay_sinh || null, ns.gioi_tinh || 'Nam', ns.id_don_vi_cap_2 || null, ns.ma_the_bhyt || null, ns.cap_bac || null, ns.chuc_vu || null]
      );
    }

    for (const u of SEED_NGUOI_DUNG) {
      this.db.run("INSERT OR IGNORE INTO nguoi_dung (id, ten_dang_nhap, mat_khau, ho_ten, vai_tro, id_bac_si, trang_thai) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [u.id, u.ten_dang_nhap, u.mat_khau, u.ho_ten, u.vai_tro || 'bac_si', u.id_bac_si || null, u.trang_thai ?? 1]
      );
    }

    // Insert Thuoc
    for (const t of defaultData.thuoc) {
      this.db.run(
        `INSERT OR IGNORE INTO thuoc (ten, don_vi_tinh, don_gia, ghi_chu, ton_kho, ham_luong, cach_dung_mac_dinh)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          t.ten,
          t.dvt,
          t.gia,
          t.ghi_chu || '',
          t.ton_kho,
          t.ham_luong || '',
          t.cach_dung || ''
        ]
      );
    }

    // Insert Vat Tu
    for (const vt of defaultData.vat_tu) {
      this.db.run(
        `INSERT OR IGNORE INTO vat_tu (ten, don_vi_tinh, don_gia, ghi_chu, ton_kho)
         VALUES (?, ?, ?, ?, ?)`,
        [vt.ten, vt.dvt, vt.gia, vt.ghi_chu || '', vt.ton_kho]
      );
    }

    // Insert Dich Vu KT
    for (const dv of defaultData.dich_vu) {
      this.db.run(
        `INSERT OR IGNORE INTO dich_vu_kt (ten, don_vi_tinh, don_gia, ghi_chu)
         VALUES (?, ?, ?, ?)`,
        [dv.ten, dv.dvt, dv.gia, dv.ghi_chu || '']
      );
    }

    // Insert 53 Disease Templates & Detailed Foreign Key Items
    this.seed53DiseaseTemplatesInternal();

    this.db.run("PRAGMA foreign_keys = ON;");
    this.persistDatabase();
  }

  public createSampleExamRecords() {
    if (!this.db) return;
    const now = new Date();
    
    // Generate 150 random exam records in the past 365 days
    for (let i = 1; i <= 150; i++) {
      const daysAgo = Math.floor(Math.random() * 365);
      const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const examDate = d.toISOString().split('T')[0];
      
      const userId = Math.floor(Math.random() * 25) + 1; // ID 1 to 25
      const doctorId = Math.floor(Math.random() * 3) + 1; // ID 1 to 3
      
      const diagnoses = [
        'Cảm cúm thông thường cấp tính (J00)',
        'Viêm họng cấp có bội nhiễm vi khuẩn (J02.9)',
        'Viêm dạ dày tá tràng cấp (K29)',
        'Viêm dạ dày ruột cấp / Tiêu chảy nhiễm khuẩn nhẹ (A09)',
        'Đau đầu căng thẳng (G44.2)',
        'Đau lưng dưới cấp tính do co cứng cơ (M54.5)',
        'Rối loạn tuần hoàn não',
        'Viêm khớp dạng thấp'
      ];
      const chanDoan = diagnoses[Math.floor(Math.random() * diagnoses.length)];
      
      const maHoSo = 'HS-' + d.getFullYear() + '-' + String(i).padStart(4, '0');
      
      const thuocList = [
        { id: 1, ten: 'Paracetamol 500mg', don_vi_tinh: 'Viên', don_gia: 1200 },
        { id: 2, ten: 'Augmentin 625mg', don_vi_tinh: 'Viên', don_gia: 8500 },
        { id: 4, ten: 'Ibuprofen 400mg', don_vi_tinh: 'Viên', don_gia: 2200 },
        { id: 5, ten: 'Omeprazole 20mg', don_vi_tinh: 'Viên', don_gia: 2500 },
        { id: 10, ten: 'Loratadine 10mg', don_vi_tinh: 'Viên', don_gia: 1500 },
        { id: 16, ten: 'Vitamin B Complex', don_vi_tinh: 'Viên', don_gia: 1500 },
        { id: 17, ten: 'Cefixime 200mg', don_vi_tinh: 'Viên', don_gia: 8000 }
      ];
      const vatTuList = [
        { id: 1, ten: 'Băng cuộn y tế', don_vi_tinh: 'Cuộn', don_gia: 4500 },
        { id: 4, ten: 'Bơm tiêm 5ml', don_vi_tinh: 'Cái', don_gia: 1500 },
        { id: 8, ten: 'Que test đường huyết', don_vi_tinh: 'Que', don_gia: 8000 }
      ];
      const dvktList = [
        { id: 1, ten: 'Khám Nội tổng quát', don_vi_tinh: 'Lượt', don_gia: 35000 },
        { id: 2, ten: 'Đo điện tim (ECG)', don_vi_tinh: 'Lần', don_gia: 55000 },
        { id: 3, ten: 'Đo đường huyết', don_vi_tinh: 'Lần', don_gia: 20000 },
        { id: 9, ten: 'Siêu âm ổ bụng', don_vi_tinh: 'Lần', don_gia: 150000 }
      ];
      
      // Randomly select items
      const selectedThuoc = thuocList.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
      const selectedVatTu = vatTuList.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2));
      const selectedDvkt = dvktList.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
      
      let tongChiPhi = 0;
      
      this.db.run(
        `INSERT OR IGNORE INTO ho_so_kham 
         (ma_ho_so, id_nhan_su, ngay_kham, trieu_chung, mach, nhiet_do, huyet_ap, nhip_tho, can_nang, chieu_cao, chan_doan, id_mau_benh, id_bac_si, loi_dan, tong_chi_phi, trang_thai_bhyt, ngay_tai_kham, trang_thai_kham)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          maHoSo, userId, examDate, 'Đau nhẹ, mệt mỏi', 80, 37.5, '120/80', 18, 65, 170,
          chanDoan, null, doctorId, 'Nghỉ ngơi, uống thuốc', 0, 1, '', 'hoan_thanh'
        ]
      );
      
      const hsIdRes = this.db.exec("SELECT last_insert_rowid() as id");
      const hsId = hsIdRes[0].values[0][0];
      
      const insertDetail = (loai_muc, id_muc, ten_muc, don_vi_tinh, don_gia) => {
        const so_luong = Math.floor(Math.random() * 10) + 1;
        const thanh_tien = so_luong * don_gia;
        tongChiPhi += thanh_tien;
        this.db.run(
          `INSERT OR IGNORE INTO ho_so_kham_chi_tiet (id_ho_so, loai_muc, id_muc, ten_muc, don_vi_tinh, so_luong, don_gia, thanh_tien, cach_dung)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [hsId, loai_muc, id_muc, ten_muc, don_vi_tinh, so_luong, don_gia, thanh_tien, 'Theo hướng dẫn']
        );
      };
      
      selectedThuoc.forEach(t => insertDetail('thuoc', t.id, t.ten, t.don_vi_tinh, t.don_gia));
      selectedVatTu.forEach(v => insertDetail('vat_tu', v.id, v.ten, v.don_vi_tinh, v.don_gia));
      selectedDvkt.forEach(d => insertDetail('dich_vu_kt', d.id, d.ten, d.don_vi_tinh, d.don_gia));
      
      this.db.run("UPDATE ho_so_kham SET tong_chi_phi = ? WHERE id = ?", [tongChiPhi, hsId]);
    }
  }

  // --- QUERY HELPER ---
  public query<T = any>(sql: string, params: SqlValue[] = []): T[] {
    if (!this.db) return [];
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      const results: T[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject() as unknown as T;
        results.push(row);
      }
      stmt.free();
      return results;
    } catch (err) {
      console.error('SQL query error:', sql, err);
      return [];
    }
  }

  public run(sql: string, params: SqlValue[] = []): { success: boolean; lastInsertRowId?: number; changes?: number } {
    if (!this.db) return { success: false };
    try {
      this.db.run(sql, params); // This will trigger the auto-sync via monkey patch
      
      let lastInsertRowId = undefined;
      let changes = undefined;
      try {
        const lastIdRes = this.db.exec("SELECT last_insert_rowid() as id, changes() as ch");
        lastInsertRowId = lastIdRes[0]?.values[0]?.[0] as number | undefined;
        changes = lastIdRes[0]?.values[0]?.[1] as number | undefined;
      } catch (e) {}

      this.notify();
      return { success: true, lastInsertRowId, changes };
    } catch (err) {
      console.error('SQL run error:', sql, err);
      return { success: false };
    }
  }

  // ===================== CRUD CO QUAN & DON VI =====================
  public ensureDefaultDonVi(): void {
    if (!this.db) return;
    try {
      // 1. Xóa các đơn vị cũ không còn sử dụng: Lữ đoàn 127, 175, Trung đoàn 551 và các đơn vị cấp 2 tương ứng
      this.db.run(`
        DELETE FROM don_vi_cap_2 
        WHERE LOWER(ten) LIKE '%hải đội%' 
           OR LOWER(ten) LIKE '%hai doi%' 
           OR LOWER(ten) LIKE '%127%' 
           OR LOWER(ten) LIKE '%175%' 
           OR LOWER(ten) LIKE '%551%';
      `);
      this.db.run(`
        DELETE FROM don_vi_cap_1 
        WHERE LOWER(ten) LIKE '%127%' 
           OR LOWER(ten) LIKE '%175%' 
           OR LOWER(ten) LIKE '%551%';
      `);

      // 2. Chèn / cập nhật chính xác 6 Đơn vị cấp 1
      for (const cap1 of SEED_DON_VI_CAP_1) {
        this.db.run(
          "INSERT OR IGNORE INTO don_vi_cap_1 (id, ten, ghi_chu) VALUES (?, ?, ?)",
          [cap1.id, cap1.ten, cap1.ghi_chu || '']
        );
        this.db.run(
          "UPDATE don_vi_cap_1 SET ten = ?, ghi_chu = ? WHERE id = ?",
          [cap1.ten, cap1.ghi_chu || '', cap1.id]
        );
      }

      // 3. Chèn / cập nhật các đơn vị cấp 2 trực thuộc
      for (const cq of SEED_CO_QUAN) {
        this.db.run(
          "INSERT OR IGNORE INTO don_vi_cap_2 (id, id_don_vi_cap_1, ten, ghi_chu) VALUES (?, ?, ?, ?)",
          [cq.id, cq.id_don_vi_cap_1 || 1, cq.ten, cq.ghi_chu || '']
        );
        this.db.run(
          "UPDATE don_vi_cap_2 SET id_don_vi_cap_1 = ?, ten = ?, ghi_chu = ? WHERE id = ?",
          [cq.id_don_vi_cap_1 || 1, cq.ten, cq.ghi_chu || '', cq.id]
        );
      }

      // 4. Đồng bộ lại Bác sĩ: BS 1 thuộc Phòng Tham mưu (Ban Tác chiến id 1)
      this.db.run("UPDATE bac_si SET id_don_vi = 1 WHERE id = 1 AND (id_don_vi IS NULL OR id_don_vi = 15);");
      // Bổ sung BS 4 và 5 nếu chưa có
      for (const bs of SEED_BAC_SI) {
        this.db.run(
          "INSERT OR IGNORE INTO bac_si (id, ho_ten, the_bhyt, ngay_sinh, gioi_tinh, id_don_vi, chuyen_mon, ghi_chu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [bs.id, bs.ho_ten, bs.the_bhyt || null, bs.ngay_sinh || null, bs.gioi_tinh || 'Nam', bs.id_don_vi || null, bs.chuyen_mon || null, bs.ghi_chu || null]
        );
      }
    } catch (err) {
      console.warn('ensureDefaultDonVi error:', err);
    }
  }

  public getCoQuanList(): any[] {
    return this.query<any>("SELECT id, id_don_vi_cap_1, ten as ten_co_quan, ghi_chu FROM don_vi_cap_2 ORDER BY id ASC");
  }

  public getDonViCap1List(): any[] {
    let list = this.query<any>("SELECT * FROM don_vi_cap_1 ORDER BY id ASC");
    const checkObsolete = this.query<any>("SELECT id FROM don_vi_cap_1 WHERE LOWER(ten) LIKE '%127%' OR LOWER(ten) LIKE '%175%' OR LOWER(ten) LIKE '%551%'");
    if (list.length === 0 || checkObsolete.length > 0) {
      this.ensureDefaultDonVi();
      list = this.query<any>("SELECT * FROM don_vi_cap_1 ORDER BY id ASC");
    }
    return list;
  }

  public getDonViCap2List(): any[] {
    let list = this.query<any>("SELECT * FROM don_vi_cap_2 ORDER BY id ASC");
    const checkObsolete = this.query<any>("SELECT id FROM don_vi_cap_2 WHERE LOWER(ten) LIKE '%hải đội%' OR LOWER(ten) LIKE '%hai doi%' OR LOWER(ten) LIKE '%127%' OR LOWER(ten) LIKE '%175%' OR LOWER(ten) LIKE '%551%'");
    if (list.length === 0 || checkObsolete.length > 0) {
      this.ensureDefaultDonVi();
      list = this.query<any>("SELECT * FROM don_vi_cap_2 ORDER BY id ASC");
    }
    return list;
  }

  public saveDonViCap1(d1: any): boolean {
    const ten = d1.ten || '';
    let res;
    if (d1.id) {
      res = this.run("UPDATE don_vi_cap_1 SET ten = ?, ghi_chu = ? WHERE id = ?", [
        ten,
        d1.ghi_chu || '',
        d1.id
      ]);
    } else {
      res = this.run("INSERT INTO don_vi_cap_1 (ten, ghi_chu) VALUES (?, ?)", [
        ten,
        d1.ghi_chu || ''
      ]);
    }
    if (res.success) {
      this.persistDatabase();
      this.notify();
    }
    return res.success;
  }

  public deleteDonViCap1(id: number): boolean {
    // Delete sub units first
    this.run("DELETE FROM don_vi_cap_2 WHERE id_don_vi_cap_1 = ?", [id]);
    const res = this.run("DELETE FROM don_vi_cap_1 WHERE id = ?", [id]);
    if (res.success) {
      this.persistDatabase();
      this.notify();
    }
    return res.success;
  }

  public getTheBHYT(ma_the: string): any {
    const res = this.query<any>("SELECT * FROM the_bhyt WHERE ma_the_bhyt = ?", [ma_the]);
    return res.length > 0 ? res[0] : null;
  }

  public saveCoQuan(cq: any): boolean {
    const ten = cq.ten_co_quan || cq.ten || '';
    let res;
    if (cq.id) {
      res = this.run("UPDATE don_vi_cap_2 SET id_don_vi_cap_1 = ?, ten = ?, ghi_chu = ? WHERE id = ?", [
        cq.id_don_vi_cap_1 || 1,
        ten,
        cq.ghi_chu || '',
        cq.id
      ]);
    } else {
      res = this.run("INSERT INTO don_vi_cap_2 (id_don_vi_cap_1, ten, ghi_chu) VALUES (?, ?, ?)", [
        cq.id_don_vi_cap_1 || 1,
        ten,
        cq.ghi_chu || ''
      ]);
    }
    if (res.success) {
      this.persistDatabase();
      this.notify();
    }
    return res.success;
  }

  public deleteCoQuan(id: number): boolean {
    const res = this.run("DELETE FROM don_vi_cap_2 WHERE id = ?", [id]);
    if (res.success) {
      this.persistDatabase();
      this.notify();
    }
    return res.success;
  }

  // ===================== CRUD BAC SI =====================
  public getBacSiList(): BacSi[] {
    return this.query<BacSi>(`
      SELECT 
        bs.*, 
        d2.ten as ten_don_vi, 
        COALESCE(bs.id_don_vi_cap_1, d2.id_don_vi_cap_1) as id_don_vi_cap_1, 
        COALESCE(d1_direct.ten, d1_sub.ten) as ten_don_vi_cap_1 
      FROM bac_si bs 
      LEFT JOIN don_vi_cap_2 d2 ON bs.id_don_vi = d2.id 
      LEFT JOIN don_vi_cap_1 d1_sub ON d2.id_don_vi_cap_1 = d1_sub.id
      LEFT JOIN don_vi_cap_1 d1_direct ON bs.id_don_vi_cap_1 = d1_direct.id
      ORDER BY bs.id ASC
    `);
  }

  public getBacSiById(id: number): BacSi | null {
    const list = this.query<BacSi>(`
      SELECT 
        bs.*, 
        d2.ten as ten_don_vi, 
        COALESCE(bs.id_don_vi_cap_1, d2.id_don_vi_cap_1) as id_don_vi_cap_1, 
        COALESCE(d1_direct.ten, d1_sub.ten) as ten_don_vi_cap_1 
      FROM bac_si bs 
      LEFT JOIN don_vi_cap_2 d2 ON bs.id_don_vi = d2.id 
      LEFT JOIN don_vi_cap_1 d1_sub ON d2.id_don_vi_cap_1 = d1_sub.id
      LEFT JOIN don_vi_cap_1 d1_direct ON bs.id_don_vi_cap_1 = d1_direct.id
      WHERE bs.id = ?
    `, [id]);
    return list.length > 0 ? list[0] : null;
  }

  public saveBacSi(bs: Partial<BacSi>): { success: boolean; id?: number; error?: string } {
    if (!this.db) return { success: false, error: 'Database not initialized' };
    const hoTen = (bs.ho_ten || '').trim();
    if (!hoTen) return { success: false, error: 'Họ tên bác sĩ không được để trống' };

    try {
      let cap1Id = (bs as any).id_don_vi_cap_1 ? Number((bs as any).id_don_vi_cap_1) : null;
      let cap2Id = bs.id_don_vi ? Number(bs.id_don_vi) : null;
      if (cap2Id && !cap1Id) {
        const sub = this.query<{ id_don_vi_cap_1: number }>("SELECT id_don_vi_cap_1 FROM don_vi_cap_2 WHERE id = ?", [cap2Id]);
        if (sub.length > 0) cap1Id = sub[0].id_don_vi_cap_1;
      }
      if (cap1Id && cap2Id) {
        const checkMatch = this.query<{ id: number }>("SELECT id FROM don_vi_cap_2 WHERE id = ? AND id_don_vi_cap_1 = ?", [cap2Id, cap1Id]);
        if (checkMatch.length === 0) {
          cap2Id = null;
        }
      }

      if (bs.id) {
        const res = this.run(
          `UPDATE bac_si SET
             ho_ten = ?, the_bhyt = ?, ngay_sinh = ?, gioi_tinh = ?,
             id_don_vi_cap_1 = ?, id_don_vi = ?, chuyen_mon = ?, ghi_chu = ?
           WHERE id = ?`,
          [
            hoTen,
            (bs.the_bhyt || '').trim(),
            bs.ngay_sinh || '',
            bs.gioi_tinh || 'Nam',
            cap1Id,
            cap2Id,
            (bs.chuyen_mon || '').trim(),
            (bs.ghi_chu || '').trim(),
            Number(bs.id)
          ]
        );
        this.persistDatabase();
        this.notify();
        return { success: res.success, id: Number(bs.id) };
      } else {
        const res = this.run(
          `INSERT INTO bac_si (ho_ten, the_bhyt, ngay_sinh, gioi_tinh, id_don_vi_cap_1, id_don_vi, chuyen_mon, ghi_chu)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            hoTen,
            (bs.the_bhyt || '').trim(),
            bs.ngay_sinh || '',
            bs.gioi_tinh || 'Nam',
            cap1Id,
            cap2Id,
            (bs.chuyen_mon || '').trim(),
            (bs.ghi_chu || '').trim()
          ]
        );
        this.persistDatabase();
        this.notify();
        return { success: res.success, id: res.lastInsertRowId };
      }
    } catch (err: any) {
      console.error('saveBacSi error:', err);
      return { success: false, error: err.message || 'Lỗi khi lưu thông tin Bác sĩ' };
    }
  }

  public deleteBacSi(id: number): { success: boolean; error?: string } {
    if (!this.db) return { success: false, error: 'Database not initialized' };
    try {
      const remainingDocs = this.query<{ id: number }>("SELECT id FROM bac_si WHERE id != ?", [id]);
      if (remainingDocs.length === 0) {
        return { success: false, error: 'Phòng khám cần giữ lại tối thiểu 1 Bác sĩ / Y sĩ!' };
      }
      const fallbackDocId = remainingDocs[0].id;

      // Safe deletion with Foreign Key handling
      this.db.run("PRAGMA foreign_keys = OFF;");
      this.run("UPDATE ho_so_kham SET id_bac_si = ? WHERE id_bac_si = ?", [fallbackDocId, id]);
      this.run("UPDATE nguoi_dung SET id_bac_si = NULL WHERE id_bac_si = ?", [id]);
      const res = this.run("DELETE FROM bac_si WHERE id = ?", [id]);
      this.db.run("PRAGMA foreign_keys = ON;");

      this.persistDatabase();
      this.notify();
      return { success: res.success };
    } catch (err: any) {
      console.error('deleteBacSi error:', err);
      return { success: false, error: err.message || 'Lỗi khi xóa Bác sĩ' };
    }
  }

  // ===================== CRUD NHAN SU (BENH NHAN) =====================
  public getNhanSuList(
    search = '',
    idDonViCap1?: number | number[] | null,
    tenDonViCap1?: string | string[] | null
  ): NhanSu[] {
    let sql = `
      SELECT 
        ns.*, 
        d2.ten as ten_don_vi, 
        d2.ten as ten_don_vi_cap_2, 
        COALESCE(ns.id_don_vi_cap_1, d2.id_don_vi_cap_1) as id_don_vi_cap_1, 
        COALESCE(d1_direct.ten, d1_sub.ten) as ten_don_vi_cap_1 
      FROM can_bo ns 
      LEFT JOIN don_vi_cap_2 d2 ON ns.id_don_vi_cap_2 = d2.id 
      LEFT JOIN don_vi_cap_1 d1_sub ON d2.id_don_vi_cap_1 = d1_sub.id
      LEFT JOIN don_vi_cap_1 d1_direct ON ns.id_don_vi_cap_1 = d1_direct.id
      WHERE 1=1
    `;
    const params: SqlValue[] = [];

    if (Array.isArray(idDonViCap1) && idDonViCap1.length > 0) {
      const placeholders = idDonViCap1.map(() => '?').join(', ');
      sql += ` AND (ns.id_don_vi_cap_1 IN (${placeholders}) OR d1_sub.id IN (${placeholders}) OR d2.id_don_vi_cap_1 IN (${placeholders}))`;
      params.push(...idDonViCap1.map(Number), ...idDonViCap1.map(Number), ...idDonViCap1.map(Number));
    } else if (idDonViCap1 && typeof idDonViCap1 === 'number') {
      sql += ` AND (ns.id_don_vi_cap_1 = ? OR d1_sub.id = ? OR d2.id_don_vi_cap_1 = ?)`;
      params.push(Number(idDonViCap1), Number(idDonViCap1), Number(idDonViCap1));
    } else if (Array.isArray(tenDonViCap1) && tenDonViCap1.length > 0) {
      const orClauses = tenDonViCap1
        .map(
          () => `(
        LOWER(TRIM(COALESCE(d1_direct.ten, d1_sub.ten, ''))) = LOWER(TRIM(?))
        OR LOWER(TRIM(REPLACE(COALESCE(d1_direct.ten, d1_sub.ten, ''), ' Vùng', ''))) = LOWER(TRIM(REPLACE(?, ' Vùng', '')))
        OR LOWER(TRIM(COALESCE(d1_direct.ten, d1_sub.ten, ''))) LIKE LOWER(TRIM(?))
      )`
        )
        .join(' OR ');
      sql += ` AND (${orClauses})`;
      tenDonViCap1.forEach((t) => {
        const cleanName = `%${t.trim().replace(/\s+Vùng$/i, '')}%`;
        params.push(t.trim(), t.trim(), cleanName);
      });
    } else if (tenDonViCap1 && typeof tenDonViCap1 === 'string' && tenDonViCap1.trim()) {
      sql += ` AND (
        LOWER(TRIM(COALESCE(d1_direct.ten, d1_sub.ten, ''))) = LOWER(TRIM(?))
        OR LOWER(TRIM(REPLACE(COALESCE(d1_direct.ten, d1_sub.ten, ''), ' Vùng', ''))) = LOWER(TRIM(REPLACE(?, ' Vùng', '')))
        OR LOWER(TRIM(COALESCE(d1_direct.ten, d1_sub.ten, ''))) LIKE LOWER(TRIM(?))
      )`;
      const cleanName = `%${tenDonViCap1.trim().replace(/\s+Vùng$/i, '')}%`;
      params.push(tenDonViCap1.trim(), tenDonViCap1.trim(), cleanName);
    }

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      sql += ` AND (
        LOWER(ns.ho_ten) LIKE ? 
        OR LOWER(COALESCE(ns.ma_the_bhyt, '')) LIKE ? 
        OR LOWER(COALESCE(d2.ten, '')) LIKE ? 
        OR LOWER(COALESCE(d1_direct.ten, d1_sub.ten, '')) LIKE ?
        OR LOWER(COALESCE(ns.cap_bac, '')) LIKE ?
        OR LOWER(COALESCE(ns.chuc_vu, '')) LIKE ?
      )`;
      params.push(term, term, term, term, term, term);
    }

    sql += ` ORDER BY ns.id DESC`;
    return this.query<NhanSu>(sql, params);
  }

  public getNhanSuByBacSi(idBacSi: number, search = ''): NhanSu[] {
    const doc = this.getBacSiById(idBacSi);
    if (doc) {
      const idDonViCap1 = (doc as any).id_don_vi_cap_1;
      const tenDonViCap1 = (doc as any).ten_don_vi_cap_1 || '';
      const tenDonViCap2 = (doc as any).ten_don_vi || '';

      // Tinh chỉnh quy tắc logic:
      // Nếu Bác sĩ thuộc Phòng Tham mưu Vùng -> Cho phép khám cả 3 Phòng Vùng:
      // 1. Phòng Tham mưu Vùng (hoặc Phòng Tham mưu)
      // 2. Phòng Chính trị Vùng (hoặc Phòng Chính trị)
      // 3. Phòng Hậu cần-Kỹ thuật Vùng (hoặc Phòng Hậu cần-Kỹ thuật)
      const isThamMuu =
        idDonViCap1 === 1 ||
        /tham\s*mưu|tham\s*muu/i.test(tenDonViCap1) ||
        /tham\s*mưu|tham\s*muu/i.test(tenDonViCap2) ||
        /tác\s*chiến|quan\s*lực|quân\s*lực|quân\s*huấn|thông\s*tin|trinh\s*sát|cơ\s*yếu|hành\s*chính/i.test(
          tenDonViCap2
        );

      if (isThamMuu) {
        // Lấy danh sách ID đơn vị cấp 1 của cả 3 phòng
        const cap1Rooms = this.query<{ id: number }>(`
          SELECT id FROM don_vi_cap_1 
          WHERE id IN (1, 2, 3) 
             OR LOWER(ten) LIKE '%tham mưu%' 
             OR LOWER(ten) LIKE '%tham muu%'
             OR LOWER(ten) LIKE '%chính trị%' 
             OR LOWER(ten) LIKE '%chinh tri%'
             OR LOWER(ten) LIKE '%hậu cần%'
             OR LOWER(ten) LIKE '%hau can%'
             OR LOWER(ten) LIKE '%kỹ thuật%'
             OR LOWER(ten) LIKE '%ky thuat%'
        `);
        const allowedIds = cap1Rooms.map((r) => r.id);
        const uniqueIds = Array.from(new Set([...allowedIds, 1, 2, 3]));
        return this.getNhanSuList(search, uniqueIds);
      }

      // Các Bác sĩ thuộc đơn vị khác (Tiểu đoàn 553, 563, v.v.): giữ nguyên lọc theo đúng đơn vị của bác sĩ
      if (idDonViCap1 || tenDonViCap1) {
        return this.getNhanSuList(search, idDonViCap1, tenDonViCap1);
      }
    }
    return this.getNhanSuList(search);
  }

  public getNhanSuById(id: number): NhanSu | null {
    const list = this.query<NhanSu>(
      `SELECT 
         c.id, c.ho_ten, c.ngay_sinh, c.gioi_tinh, 
         c.id_don_vi_cap_2 as id_don_vi, 
         COALESCE(c.id_don_vi_cap_1, d2.id_don_vi_cap_1) as id_don_vi_cap_1,
         c.ma_the_bhyt as the_bhyt, c.ma_the_bhyt, c.cap_bac, c.chuc_vu, 
         d2.ten as ten_don_vi, d2.ten as ten_don_vi_cap_2,
         COALESCE(d1_direct.ten, d1_sub.ten) as ten_don_vi_cap_1, 
         t.tu_ngay, t.den_ngay
       FROM can_bo c
       LEFT JOIN don_vi_cap_2 d2 ON c.id_don_vi_cap_2 = d2.id
       LEFT JOIN don_vi_cap_1 d1_sub ON d2.id_don_vi_cap_1 = d1_sub.id
       LEFT JOIN don_vi_cap_1 d1_direct ON c.id_don_vi_cap_1 = d1_direct.id
       LEFT JOIN the_bhyt t ON c.ma_the_bhyt = t.ma_the_bhyt
       WHERE c.id = ?`,
      [id]
    );
    return list.length > 0 ? list[0] : null;
  }

  
  public saveNhanSu(ns: any): number | null {
    if (!this.db) return null;
    try {
      const hoTen = (ns.ho_ten || '').trim();
      if (!hoTen) return null;

      const maThe = (ns.ma_the_bhyt || ns.the_bhyt || '').trim().toUpperCase();
      let cap1Id = (ns as any).id_don_vi_cap_1 ? Number((ns as any).id_don_vi_cap_1) : null;
      let idDonVi = ns.id_don_vi_cap_2 || ns.id_don_vi ? Number(ns.id_don_vi_cap_2 || ns.id_don_vi) : null;
      if (idDonVi && !cap1Id) {
        const sub = this.query<{ id_don_vi_cap_1: number }>("SELECT id_don_vi_cap_1 FROM don_vi_cap_2 WHERE id = ?", [idDonVi]);
        if (sub.length > 0) cap1Id = sub[0].id_don_vi_cap_1;
      }
      if (cap1Id && idDonVi) {
        const checkMatch = this.query<{ id: number }>("SELECT id FROM don_vi_cap_2 WHERE id = ? AND id_don_vi_cap_1 = ?", [idDonVi, cap1Id]);
        if (checkMatch.length === 0) {
          idDonVi = null;
        }
      }
      if (!cap1Id && !idDonVi) {
        cap1Id = 1;
      }

      // 1. Insert/Update the_bhyt first if provided
      if (maThe) {
        const tuNgay = ns.tu_ngay || '2024-01-01';
        const denNgay = ns.den_ngay || '2028-12-31';
        const existingBhyt = this.query("SELECT * FROM the_bhyt WHERE ma_the_bhyt = ?", [maThe]);
        if (existingBhyt.length > 0) {
          this.run("UPDATE the_bhyt SET tu_ngay = ?, den_ngay = ? WHERE ma_the_bhyt = ?", [
            tuNgay,
            denNgay,
            maThe
          ]);
        } else {
          this.run("INSERT OR REPLACE INTO the_bhyt (ma_the_bhyt, tu_ngay, den_ngay) VALUES (?, ?, ?)", [
            maThe,
            tuNgay,
            denNgay
          ]);
        }
      }

      let res;
      // 2. Insert/Update can_bo
      if (ns.id) {
        res = this.run(
          `UPDATE can_bo SET 
            ho_ten = ?, ngay_sinh = ?, ma_the_bhyt = ?, gioi_tinh = ?, id_don_vi_cap_1 = ?, id_don_vi_cap_2 = ?, cap_bac = ?, chuc_vu = ?
           WHERE id = ?`,
          [
            hoTen,
            ns.ngay_sinh || null,
            maThe || null,
            ns.gioi_tinh || 'Nam',
            cap1Id,
            idDonVi,
            ns.cap_bac || '',
            ns.chuc_vu || '',
            Number(ns.id)
          ]
        );
        if (res.success) {
          this.persistDatabase();
          this.notify();
          return Number(ns.id);
        }
      } else {
        res = this.run(
          `INSERT INTO can_bo (ho_ten, ngay_sinh, ma_the_bhyt, gioi_tinh, id_don_vi_cap_1, id_don_vi_cap_2, cap_bac, chuc_vu)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            hoTen,
            ns.ngay_sinh || null,
            maThe || null,
            ns.gioi_tinh || 'Nam',
            cap1Id,
            idDonVi,
            ns.cap_bac || '',
            ns.chuc_vu || ''
          ]
        );
        if (res.success && res.lastInsertRowId) {
          this.persistDatabase();
          this.notify();
          return Number(res.lastInsertRowId);
        }
      }
      return null;
    } catch (e) {
      console.error('Error in saveNhanSu:', e);
      return null;
    }
  }

  public deleteNhanSu(id: number): boolean {
    const res = this.run("DELETE FROM can_bo WHERE id = ?", [id]);
    if (res.success) {
      this.persistDatabase();
      this.notify();
    }
    return res.success;
  }

  // ===================== CRUD THUOC =====================
  public getThuocList(): Thuoc[] {
    return this.query<Thuoc>("SELECT * FROM thuoc ORDER BY ten ASC");
  }

  public saveThuoc(t: Partial<Thuoc>): boolean {
    let res;
    if (t.id) {
      res = this.run(
        `UPDATE thuoc SET 
          ten = ?, don_vi_tinh = ?, don_gia = ?, ghi_chu = ?, 
          ton_kho = ?, ham_luong = ?, cach_dung_mac_dinh = ? 
        WHERE id = ?`,
        [
          t.ten || '',
          t.don_vi_tinh || 'Viên',
          t.don_gia || 0,
          t.ghi_chu || '',
          t.ton_kho || 0,
          t.ham_luong || '',
          t.cach_dung_mac_dinh || '',
          t.id
        ]
      );
    } else {
      res = this.run(
        `INSERT OR IGNORE INTO thuoc (ten, don_vi_tinh, don_gia, ghi_chu, ton_kho, ham_luong, cach_dung_mac_dinh)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          t.ten || '',
          t.don_vi_tinh || 'Viên',
          t.don_gia || 0,
          t.ghi_chu || '',
          t.ton_kho || 100,
          t.ham_luong || '',
          t.cach_dung_mac_dinh || ''
        ]
      );
    }
    if (res.success) {
      this.persistDatabase();
      this.notify();
    }
    return res.success;
  }

  public deleteThuoc(id: number): boolean {
    const res = this.run("DELETE FROM thuoc WHERE id = ?", [id]);
    if (res.success) {
      this.persistDatabase();
      this.notify();
    }
    return res.success;
  }

  // ===================== CRUD VAT TU =====================
  public getVatTuList(): VatTu[] {
    return this.query<VatTu>("SELECT * FROM vat_tu ORDER BY ten ASC");
  }

  public saveVatTu(vt: Partial<VatTu>): boolean {
    let res;
    if (vt.id) {
      res = this.run(
        "UPDATE vat_tu SET ten = ?, don_vi_tinh = ?, don_gia = ?, ghi_chu = ?, ton_kho = ? WHERE id = ?",
        [vt.ten || '', vt.don_vi_tinh || 'Cái', vt.don_gia || 0, vt.ghi_chu || '', vt.ton_kho || 0, vt.id]
      );
    } else {
      res = this.run(
        "INSERT OR IGNORE INTO vat_tu (ten, don_vi_tinh, don_gia, ghi_chu, ton_kho) VALUES (?, ?, ?, ?, ?)",
        [vt.ten || '', vt.don_vi_tinh || 'Cái', vt.don_gia || 0, vt.ghi_chu || '', vt.ton_kho || 50]
      );
    }
    if (res.success) {
      this.persistDatabase();
      this.notify();
    }
    return res.success;
  }

  public deleteVatTu(id: number): boolean {
    const res = this.run("DELETE FROM vat_tu WHERE id = ?", [id]);
    if (res.success) {
      this.persistDatabase();
      this.notify();
    }
    return res.success;
  }

  // ===================== CRUD DICH VU KT =====================
  public getDichVuKTList(): DichVuKT[] {
    return this.query<DichVuKT>("SELECT * FROM dich_vu_kt ORDER BY ten ASC");
  }

  public saveDichVuKT(dv: Partial<DichVuKT>): boolean {
    let res;
    if (dv.id) {
      res = this.run(
        "UPDATE dich_vu_kt SET ten = ?, don_vi_tinh = ?, don_gia = ?, ghi_chu = ? WHERE id = ?",
        [dv.ten || '', dv.don_vi_tinh || 'Lần', dv.don_gia || 0, dv.ghi_chu || '', dv.id]
      );
    } else {
      res = this.run(
        "INSERT OR IGNORE INTO dich_vu_kt (ten, don_vi_tinh, don_gia, ghi_chu) VALUES (?, ?, ?, ?)",
        [dv.ten || '', dv.don_vi_tinh || 'Lần', dv.don_gia || 0, dv.ghi_chu || '']
      );
    }
    if (res.success) {
      this.persistDatabase();
      this.notify();
    }
    return res.success;
  }

  public deleteDichVuKT(id: number): boolean {
    const res = this.run("DELETE FROM dich_vu_kt WHERE id = ?", [id]);
    if (res.success) {
      this.persistDatabase();
      this.notify();
    }
    return res.success;
  }

  // ===================== KHÔI PHỤC / NẠP DANH MỤC Y TẾ CHUẨN =====================
  public forceResetAndSeedData(): {
    success: boolean;
    message: string;
    counts: { thuoc: number; vatTu: number; dichVu: number };
    listThuoc: Thuoc[];
    listVatTu: VatTu[];
    listDichVu: DichVuKT[];
  } {
    return this.seedMedicalDataCatalog();
  }

  public seedMedicalDataCatalog(): {
    success: boolean;
    message: string;
    counts: { thuoc: number; vatTu: number; dichVu: number };
    listThuoc: Thuoc[];
    listVatTu: VatTu[];
    listDichVu: DichVuKT[];
  } {
    if (!this.db) {
      return {
        success: false,
        message: 'Cơ sở dữ liệu SQLite chưa sẵn sàng.',
        counts: { thuoc: 0, vatTu: 0, dichVu: 0 },
        listThuoc: [],
        listVatTu: [],
        listDichVu: []
      };
    }

    try {
      this.db.run("PRAGMA foreign_keys = OFF;");
      // YÊU CẦU 1: XÓA DỮ LIỆU CŨ (RESET)
      this.db.run("DELETE FROM thuoc;");
      this.db.run("DELETE FROM vat_tu;");
      this.db.run("DELETE FROM dich_vu_kt;");

      try {
        this.db.run("DELETE FROM sqlite_sequence WHERE name IN ('thuoc', 'vat_tu', 'dich_vu_kt');");
      } catch (seqErr) {
        console.warn('sqlite_sequence reset note:', seqErr);
      }

      // YÊU CẦU 2 & 3: DUYỆT VÒNG LẶP VÀ CHÈN DỮ LIỆU ĐÃ CHUẨN HÓA TỪ DEFAULTDATA.JSON
      // 1. Duyệt qua defaultData.thuoc
      let thuocCount = 0;
      for (const item of defaultData.thuoc) {
        this.db.run(
          `INSERT INTO thuoc (ten, don_vi_tinh, don_gia, ton_kho, ham_luong, cach_dung_mac_dinh, ghi_chu)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.ten,
            item.dvt,
            item.gia,
            item.ton_kho,
            item.ham_luong || '',
            item.cach_dung || '',
            item.ghi_chu || ''
          ]
        );
        thuocCount++;
      }

      // 2. Duyệt qua defaultData.vat_tu
      let vatTuCount = 0;
      for (const item of defaultData.vat_tu) {
        this.db.run(
          `INSERT INTO vat_tu (ten, don_vi_tinh, don_gia, ton_kho, ghi_chu)
           VALUES (?, ?, ?, ?, ?)`,
          [
            item.ten,
            item.dvt,
            item.gia,
            item.ton_kho,
            item.ghi_chu || ''
          ]
        );
        vatTuCount++;
      }

      // 3. Duyệt qua defaultData.dich_vu
      let dichVuCount = 0;
      for (const item of defaultData.dich_vu) {
        this.db.run(
          `INSERT INTO dich_vu_kt (ten, don_vi_tinh, don_gia, ghi_chu)
           VALUES (?, ?, ?, ?)`,
          [
            item.ten,
            item.dvt,
            item.gia,
            item.ghi_chu || ''
          ]
        );
        dichVuCount++;
      }

      // Tự động kiểm tra và đồng bộ lại khóa ngoại trong mau_benh_chi_tiet nếu có
      this.cleanupMauBenhOrphans();

      this.db.run("PRAGMA foreign_keys = ON;");

      // Lưu trữ cơ sở dữ liệu và thông báo đồng bộ tất cả components
      this.persistDatabase();
      this.notify();

      const freshThuoc = this.getThuocList();
      const freshVatTu = this.getVatTuList();
      const freshDichVu = this.getDichVuKTList();

      return {
        success: true,
        message: `Đã nạp và cập nhật thành công: ${thuocCount} thuốc, ${vatTuCount} vật tư y tế, ${dichVuCount} dịch vụ kỹ thuật.`,
        counts: {
          thuoc: thuocCount,
          vatTu: vatTuCount,
          dichVu: dichVuCount
        },
        listThuoc: freshThuoc,
        listVatTu: freshVatTu,
        listDichVu: freshDichVu
      };
    } catch (err: any) {
      console.error('Lỗi khi nạp dữ liệu danh mục y tế:', err);
      try {
        this.db.run("PRAGMA foreign_keys = ON;");
      } catch (e) {}
      return {
        success: false,
        message: `Lỗi: ${err.message || 'Không thể nạp dữ liệu danh mục'}`,
        counts: { thuoc: 0, vatTu: 0, dichVu: 0 },
        listThuoc: [],
        listVatTu: [],
        listDichVu: []
      };
    }
  }

  // ===================== CRUD MAU BENH (DISEASE TEMPLATES) =====================
  public getMauBenhList(): MauBenh[] {
    if (!this.db) return [];
    const list = this.query<MauBenh>("SELECT * FROM mau_benh ORDER BY id ASC");
    if (list.length === 0) return [];

    const thuocs = this.getThuocList();
    const vatTus = this.getVatTuList();
    const dichVus = this.getDichVuKTList();

    const thuocMap = new Map(thuocs.map((t) => [Number(t.id), t]));
    const vatTuMap = new Map(vatTus.map((v) => [Number(v.id), v]));
    const dichVuMap = new Map(dichVus.map((d) => [Number(d.id), d]));

    const allDetails = this.query<any>(`
      SELECT 
        mbc.id,
        mbc.id_mau_benh,
        mbc.loai_muc,
        mbc.id_muc,
        mbc.so_luong,
        mbc.cach_dung,
        mbc.ghi_chu,
        t.ten as ten_thuoc,
        t.don_vi_tinh as dvt_thuoc,
        t.don_gia as gia_thuoc,
        v.ten as ten_vat_tu,
        v.don_vi_tinh as dvt_vat_tu,
        v.don_gia as gia_vat_tu,
        d.ten as ten_dich_vu,
        d.don_vi_tinh as dvt_dich_vu,
        d.don_gia as gia_dich_vu
      FROM mau_benh_chi_tiet mbc
      LEFT JOIN thuoc t ON mbc.id_muc = t.id AND mbc.loai_muc = 'thuoc'
      LEFT JOIN vat_tu v ON mbc.id_muc = v.id AND mbc.loai_muc = 'vat_tu'
      LEFT JOIN dich_vu_kt d ON mbc.id_muc = d.id AND mbc.loai_muc IN ('dich_vu_kt', 'dich_vu', 'dich_vu_ky_thuat')
      ORDER BY mbc.id_mau_benh ASC, mbc.id ASC
    `);

    const detailsByTemplateId = new Map<number, MauBenhChiTiet[]>();
    for (const r of allDetails) {
      const idMau = Number(r.id_mau_benh);
      const idNum = Number(r.id_muc);
      let loai = String(r.loai_muc || '').toLowerCase();
      if (loai === 'dich_vu' || loai === 'dich_vu_ky_thuat') loai = 'dich_vu_kt';

      let item: any = null;
      if (loai === 'thuoc') {
        item = thuocMap.get(idNum) || vatTuMap.get(idNum) || dichVuMap.get(idNum);
      } else if (loai === 'vat_tu') {
        item = vatTuMap.get(idNum) || thuocMap.get(idNum) || dichVuMap.get(idNum);
      } else {
        item = dichVuMap.get(idNum) || vatTuMap.get(idNum) || thuocMap.get(idNum);
      }

      const ten_muc = item ? item.ten : (r.ten_thuoc || r.ten_vat_tu || r.ten_dich_vu || `Mục #${idNum}`);
      const don_vi_tinh = item ? item.don_vi_tinh : (r.dvt_thuoc || r.dvt_vat_tu || r.dvt_dich_vu || 'Lượt');
      const don_gia = item ? (item.don_gia || 0) : (r.gia_thuoc ?? r.gia_vat_tu ?? r.gia_dich_vu ?? 0);
      const so_luong = r.so_luong || 1;
      const thanh_tien = so_luong * don_gia;

      const detailObj: MauBenhChiTiet = {
        id: r.id,
        id_mau_benh: idMau,
        loai_muc: loai as any,
        id_muc: idNum,
        so_luong,
        cach_dung: r.cach_dung || '',
        ghi_chu: r.ghi_chu || '',
        ten_muc,
        don_vi_tinh,
        don_gia,
        thanh_tien,
        thuoc_id: loai === 'thuoc' ? idNum : undefined,
        vat_tu_id: loai === 'vat_tu' ? idNum : undefined,
        dich_vu_id: loai === 'dich_vu_kt' ? idNum : undefined,
        ten_thuoc: loai === 'thuoc' ? ten_muc : undefined,
        ten_vat_tu: loai === 'vat_tu' ? ten_muc : undefined,
        ten_dich_vu: loai === 'dich_vu_kt' ? ten_muc : undefined
      };

      if (!detailsByTemplateId.has(idMau)) {
        detailsByTemplateId.set(idMau, []);
      }
      detailsByTemplateId.get(idMau)!.push(detailObj);
    }

    for (const mb of list) {
      mb.chi_tiet = detailsByTemplateId.get(Number(mb.id)) || [];
    }

    return list;
  }

  public getMauBenhById(id: number): MauBenh | null {
    const list = this.query<MauBenh>("SELECT * FROM mau_benh WHERE id = ?", [id]);
    if (list.length === 0) return null;
    const mb = list[0];
    mb.chi_tiet = this.getMauBenhChiTiet(mb.id);
    return mb;
  }

  public getMauBenhChiTiet(idMauBenh: number): MauBenhChiTiet[] {
    const idNumParam = Number(idMauBenh);
    if (!idNumParam || !this.db) return [];

    const rows = this.query<any>(
      `SELECT 
        mbc.id,
        mbc.id_mau_benh,
        mbc.loai_muc,
        mbc.id_muc,
        mbc.so_luong,
        mbc.cach_dung,
        mbc.ghi_chu,
        t.ten as ten_thuoc,
        t.don_vi_tinh as dvt_thuoc,
        t.don_gia as gia_thuoc,
        v.ten as ten_vat_tu,
        v.don_vi_tinh as dvt_vat_tu,
        v.don_gia as gia_vat_tu,
        d.ten as ten_dich_vu,
        d.don_vi_tinh as dvt_dich_vu,
        d.don_gia as gia_dich_vu
       FROM mau_benh_chi_tiet mbc
       LEFT JOIN thuoc t ON mbc.id_muc = t.id AND mbc.loai_muc = 'thuoc'
       LEFT JOIN vat_tu v ON mbc.id_muc = v.id AND mbc.loai_muc = 'vat_tu'
       LEFT JOIN dich_vu_kt d ON mbc.id_muc = d.id AND mbc.loai_muc IN ('dich_vu_kt', 'dich_vu', 'dich_vu_ky_thuat')
       WHERE mbc.id_mau_benh = ?
       ORDER BY mbc.id ASC`,
      [idNumParam]
    );

    if (rows.length === 0) return [];

    const thuocs = this.getThuocList();
    const vatTus = this.getVatTuList();
    const dichVus = this.getDichVuKTList();

    const thuocMap = new Map(thuocs.map((t) => [Number(t.id), t]));
    const vatTuMap = new Map(vatTus.map((v) => [Number(v.id), v]));
    const dichVuMap = new Map(dichVus.map((d) => [Number(d.id), d]));

    return rows.map((r) => {
      const idNum = Number(r.id_muc);
      let loai = String(r.loai_muc || '').toLowerCase();
      if (loai === 'dich_vu' || loai === 'dich_vu_ky_thuat') loai = 'dich_vu_kt';

      let item: any = null;
      if (loai === 'thuoc') {
        item = thuocMap.get(idNum) || vatTuMap.get(idNum) || dichVuMap.get(idNum);
      } else if (loai === 'vat_tu') {
        item = vatTuMap.get(idNum) || thuocMap.get(idNum) || dichVuMap.get(idNum);
      } else {
        item = dichVuMap.get(idNum) || vatTuMap.get(idNum) || thuocMap.get(idNum);
      }

      const ten_muc = item ? item.ten : (r.ten_thuoc || r.ten_vat_tu || r.ten_dich_vu || `Mục #${idNum}`);
      const don_vi_tinh = item ? item.don_vi_tinh : (r.dvt_thuoc || r.dvt_vat_tu || r.dvt_dich_vu || 'Lượt');
      const don_gia = item ? (item.don_gia || 0) : (r.gia_thuoc ?? r.gia_vat_tu ?? r.gia_dich_vu ?? 0);
      const so_luong = r.so_luong || 1;
      const thanh_tien = so_luong * don_gia;

      return {
        id: r.id,
        id_mau_benh: idNumParam,
        loai_muc: loai as any,
        id_muc: idNum,
        so_luong,
        cach_dung: r.cach_dung || '',
        ghi_chu: r.ghi_chu || '',
        ten_muc,
        don_vi_tinh,
        don_gia,
        thanh_tien,
        thuoc_id: loai === 'thuoc' ? idNum : undefined,
        vat_tu_id: loai === 'vat_tu' ? idNum : undefined,
        dich_vu_id: loai === 'dich_vu_kt' ? idNum : undefined,
        ten_thuoc: loai === 'thuoc' ? ten_muc : undefined,
        ten_vat_tu: loai === 'vat_tu' ? ten_muc : undefined,
        ten_dich_vu: loai === 'dich_vu_kt' ? ten_muc : undefined
      };
    });
  }

  public saveMauBenh(mb: Partial<MauBenh>, details: MauBenhChiTiet[] = []): boolean {
    if (!this.db) return false;

    let idMauBenh = mb.id;
    const tenBenh = (mb.ten_benh || '').trim();
    const chanDoanChuan = (mb.chan_doan_chuan && mb.chan_doan_chuan.trim()) ? mb.chan_doan_chuan.trim() : tenBenh;

    if (idMauBenh) {
      this.run(
        "UPDATE mau_benh SET ten_benh = ?, chan_doan_chuan = ?, loi_dan_mac_dinh = ?, ghi_chu = ? WHERE id = ?",
        [tenBenh, chanDoanChuan, mb.loi_dan_mac_dinh || '', mb.ghi_chu || '', idMauBenh]
      );
      this.run("DELETE FROM mau_benh_chi_tiet WHERE id_mau_benh = ?", [idMauBenh]);
    } else {
      const res = this.run(
        "INSERT OR IGNORE INTO mau_benh (ten_benh, chan_doan_chuan, loi_dan_mac_dinh, ghi_chu) VALUES (?, ?, ?, ?)",
        [tenBenh, chanDoanChuan, mb.loi_dan_mac_dinh || '', mb.ghi_chu || '']
      );
      if (!res.success || !res.lastInsertRowId) return false;
      idMauBenh = res.lastInsertRowId;
    }

    for (const ct of details) {
      let id_muc = ct.id_muc;
      let loai = String(ct.loai_muc || '').toLowerCase();
      if (loai === 'dich_vu' || loai === 'dich_vu_ky_thuat') loai = 'dich_vu_kt';
      if (loai !== 'thuoc' && loai !== 'vat_tu') loai = 'dich_vu_kt';
      
      // Auto-create missing items if id_muc is 0 or if we detect a mismatch
      if (id_muc <= 0 || (ct.ten_muc && ct.ten_muc !== `Mục #${id_muc}`)) {
        let exists = false;
        
        if (loai === 'thuoc') {
          const check = this.query("SELECT id FROM thuoc WHERE id = ?", [id_muc]);
          if (check.length > 0) exists = true;
          
          if (!exists && ct.ten_muc && ct.ten_muc !== `Mục #${id_muc}`) {
            const match = this.query("SELECT id FROM thuoc WHERE LOWER(TRIM(ten)) = LOWER(TRIM(?))", [ct.ten_muc]);
            if (match.length > 0) {
              id_muc = match[0].id as number;
            } else {
              const ins = this.run("INSERT INTO thuoc (ten, don_vi_tinh, don_gia, ton_kho, cach_dung_mac_dinh) VALUES (?, ?, ?, ?, ?)", [ct.ten_muc, ct.don_vi_tinh || 'Viên', ct.don_gia || 0, 100, ct.cach_dung || '']);
              if (ins.success && ins.lastInsertRowId) id_muc = ins.lastInsertRowId;
            }
          }
        } else if (loai === 'vat_tu') {
          const check = this.query("SELECT id FROM vat_tu WHERE id = ?", [id_muc]);
          if (check.length > 0) exists = true;
          
          if (!exists && ct.ten_muc && ct.ten_muc !== `Mục #${id_muc}`) {
            const match = this.query("SELECT id FROM vat_tu WHERE LOWER(TRIM(ten)) = LOWER(TRIM(?))", [ct.ten_muc]);
            if (match.length > 0) {
              id_muc = match[0].id as number;
            } else {
              const ins = this.run("INSERT INTO vat_tu (ten, don_vi_tinh, don_gia, ton_kho) VALUES (?, ?, ?, ?)", [ct.ten_muc, ct.don_vi_tinh || 'Cái', ct.don_gia || 0, 50]);
              if (ins.success && ins.lastInsertRowId) id_muc = ins.lastInsertRowId;
            }
          }
        } else {
          const check = this.query("SELECT id FROM dich_vu_kt WHERE id = ?", [id_muc]);
          if (check.length > 0) exists = true;
          
          if (!exists && ct.ten_muc && ct.ten_muc !== `Mục #${id_muc}`) {
            const match = this.query("SELECT id FROM dich_vu_kt WHERE LOWER(TRIM(ten)) = LOWER(TRIM(?))", [ct.ten_muc]);
            if (match.length > 0) {
              id_muc = match[0].id as number;
            } else {
              const ins = this.run("INSERT INTO dich_vu_kt (ten, don_vi_tinh, don_gia) VALUES (?, ?, ?)", [ct.ten_muc, ct.don_vi_tinh || 'Lần', ct.don_gia || 0]);
              if (ins.success && ins.lastInsertRowId) id_muc = ins.lastInsertRowId;
            }
          }
        }
      }

      this.run(
        `INSERT OR IGNORE INTO mau_benh_chi_tiet (id_mau_benh, loai_muc, id_muc, so_luong, cach_dung, ghi_chu)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [idMauBenh, loai, id_muc, ct.so_luong, ct.cach_dung || '', ct.ghi_chu || '']
      );
    }

    this.persistDatabase();
    this.notify();
    return true;
  }

  public cleanupMauBenhOrphans(): void {
    if (!this.db) return;
    try {
      this.db.run(`
        DELETE FROM mau_benh_chi_tiet 
        WHERE (loai_muc = 'thuoc' AND id_muc NOT IN (SELECT id FROM thuoc))
           OR (loai_muc = 'vat_tu' AND id_muc NOT IN (SELECT id FROM vat_tu))
           OR (loai_muc IN ('dich_vu_kt', 'dich_vu', 'dich_vu_ky_thuat') AND id_muc NOT IN (SELECT id FROM dich_vu_kt));
      `);
    } catch (e) {
      console.warn('cleanupMauBenhOrphans notice:', e);
    }
  }

  public deleteMauBenh(id: number): boolean {
    this.run("DELETE FROM mau_benh_chi_tiet WHERE id_mau_benh = ?", [id]);
    const res = this.run("DELETE FROM mau_benh WHERE id = ?", [id]);
    if (res.success) {
      this.persistDatabase();
      this.notify();
    }
    return res.success;
  }

  /**
   * Khởi tạo / Đồng bộ 53 Mẫu Bệnh Chuẩn Y Khoa với giải thuật String Matching ánh xạ Foreign Key
   */
  private seed53DiseaseTemplatesInternal(): {
    success: boolean;
    count: number;
    totalItems: number;
    message: string;
    details: any[];
  } {
    if (!this.db) {
      return { success: false, count: 0, totalItems: 0, message: 'Database chưa khởi tạo', details: [] };
    }

    try {
      this.db.run("PRAGMA foreign_keys = OFF;");
      this.db.run("DELETE FROM mau_benh_chi_tiet;");
      this.db.run("DELETE FROM mau_benh;");
      try {
        this.db.run("DELETE FROM sqlite_sequence WHERE name IN ('mau_benh', 'mau_benh_chi_tiet');");
      } catch (seqErr) {
        console.warn('sqlite_sequence reset note:', seqErr);
      }

      const thuocs = this.getThuocList();
      const vatTus = this.getVatTuList();
      const dichVus = this.getDichVuKTList();

      let templateCount = 0;
      let totalItemCount = 0;
      const results: any[] = [];

      for (const tpl of (defaultData.mau_benh as any[])) {
        const cleanTenBenh = (tpl.ten_benh || '').replace(/;+\s*$/, '').trim();
        const cleanChanDoan = cleanTenBenh;
        this.db.run(
          `INSERT INTO mau_benh (ten_benh, chan_doan_chuan, loi_dan_mac_dinh, ghi_chu)
           VALUES (?, ?, ?, ?)`,
          [
            cleanTenBenh,
            cleanChanDoan,
            tpl.loi_dan_mac_dinh || '',
            tpl.ghi_chu || ''
          ]
        );

        const idRes = this.db.exec("SELECT last_insert_rowid() as id;");
        const idMauBenh = idRes.length > 0 && idRes[0].values.length > 0 ? Number(idRes[0].values[0][0]) : null;

        if (!idMauBenh) continue;
        templateCount++;

        const mappedItems: any[] = [];

        // 1. Ánh xạ Thuốc
        if (tpl.thuoc) {
          for (const item of tpl.thuoc) {
            let matchedThuoc = matchCatalogItem(item.ten, thuocs);
            let matchedVatTu = !matchedThuoc ? matchCatalogItem(item.ten, vatTus) : null;
            let matchedDichVu = (!matchedThuoc && !matchedVatTu) ? matchCatalogItem(item.ten, dichVus) : null;

            let loaiMuc: 'thuoc' | 'vat_tu' | 'dich_vu_kt' = 'thuoc';
            let targetId: number;

            if (matchedThuoc) {
              loaiMuc = 'thuoc';
              targetId = Number(matchedThuoc.id);
            } else if (matchedVatTu) {
              loaiMuc = 'vat_tu';
              targetId = Number(matchedVatTu.id);
            } else if (matchedDichVu) {
              loaiMuc = 'dich_vu_kt';
              targetId = Number(matchedDichVu.id);
            } else {
              // Auto-create missing thuoc
              this.db.run(
                "INSERT INTO thuoc (ten, don_vi_tinh, don_gia, ton_kho, cach_dung_mac_dinh) VALUES (?, ?, ?, ?, ?)",
                [item.ten, item.don_vi_tinh || 'Viên', item.don_gia || 0, 1000, item.cach_dung || '']
              );
              const lastIdRes = this.db.exec("SELECT last_insert_rowid() as id;");
              targetId = lastIdRes.length > 0 ? Number(lastIdRes[0].values[0][0]) : 0;
              loaiMuc = 'thuoc';
              thuocs.push({ id: targetId, ten: item.ten, don_vi_tinh: item.don_vi_tinh || 'Viên', don_gia: item.don_gia || 0 } as any);
            }

            this.db.run(
              `INSERT INTO mau_benh_chi_tiet (id_mau_benh, loai_muc, id_muc, so_luong, cach_dung, ghi_chu)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [idMauBenh, loaiMuc, targetId, item.so_luong, item.cach_dung || '', item.ghi_chu || '']
            );
            totalItemCount++;
            mappedItems.push({ loai: loaiMuc, id: targetId, ten: item.ten, sl: item.so_luong });
          }
        }

        // 2. Ánh xạ Vật tư y tế
        if (tpl.vat_tu) {
          for (const item of tpl.vat_tu) {
            let matchedVatTu = matchCatalogItem(item.ten, vatTus);
            let matchedThuoc = !matchedVatTu ? matchCatalogItem(item.ten, thuocs) : null;
            let matchedDichVu = (!matchedVatTu && !matchedThuoc) ? matchCatalogItem(item.ten, dichVus) : null;

            let loaiMuc: 'thuoc' | 'vat_tu' | 'dich_vu_kt' = 'vat_tu';
            let targetId: number;

            if (matchedVatTu) {
              loaiMuc = 'vat_tu';
              targetId = Number(matchedVatTu.id);
            } else if (matchedThuoc) {
              loaiMuc = 'thuoc';
              targetId = Number(matchedThuoc.id);
            } else if (matchedDichVu) {
              loaiMuc = 'dich_vu_kt';
              targetId = Number(matchedDichVu.id);
            } else {
              this.db.run(
                "INSERT INTO vat_tu (ten, don_vi_tinh, don_gia, ton_kho) VALUES (?, ?, ?, ?)",
                [item.ten, item.don_vi_tinh || 'Cái', item.don_gia || 0, 1000]
              );
              const lastIdRes = this.db.exec("SELECT last_insert_rowid() as id;");
              targetId = lastIdRes.length > 0 ? Number(lastIdRes[0].values[0][0]) : 0;
              loaiMuc = 'vat_tu';
              vatTus.push({ id: targetId, ten: item.ten, don_vi_tinh: item.don_vi_tinh || 'Cái', don_gia: item.don_gia || 0 } as any);
            }

            this.db.run(
              `INSERT INTO mau_benh_chi_tiet (id_mau_benh, loai_muc, id_muc, so_luong, cach_dung, ghi_chu)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [idMauBenh, loaiMuc, targetId, item.so_luong, item.cach_dung || '', item.ghi_chu || '']
            );
            totalItemCount++;
            mappedItems.push({ loai: loaiMuc, id: targetId, ten: item.ten, sl: item.so_luong });
          }
        }

        // 3. Ánh xạ Dịch vụ kỹ thuật
        if (tpl.dich_vu) {
          for (const item of tpl.dich_vu) {
            let matchedDichVu = matchCatalogItem(item.ten, dichVus);
            let matchedVatTu = !matchedDichVu ? matchCatalogItem(item.ten, vatTus) : null;
            let matchedThuoc = (!matchedDichVu && !matchedVatTu) ? matchCatalogItem(item.ten, thuocs) : null;

            let loaiMuc: 'thuoc' | 'vat_tu' | 'dich_vu_kt' = 'dich_vu_kt';
            let targetId: number;

            if (matchedDichVu) {
              loaiMuc = 'dich_vu_kt';
              targetId = Number(matchedDichVu.id);
            } else if (matchedVatTu) {
              loaiMuc = 'vat_tu';
              targetId = Number(matchedVatTu.id);
            } else if (matchedThuoc) {
              loaiMuc = 'thuoc';
              targetId = Number(matchedThuoc.id);
            } else {
              this.db.run(
                "INSERT INTO dich_vu_kt (ten, don_vi_tinh, don_gia) VALUES (?, ?, ?)",
                [item.ten, item.don_vi_tinh || 'Lượt', item.don_gia || 0]
              );
              const lastIdRes = this.db.exec("SELECT last_insert_rowid() as id;");
              targetId = lastIdRes.length > 0 ? Number(lastIdRes[0].values[0][0]) : 0;
              loaiMuc = 'dich_vu_kt';
              dichVus.push({ id: targetId, ten: item.ten, don_vi_tinh: item.don_vi_tinh || 'Lượt', don_gia: item.don_gia || 0 } as any);
            }

            this.db.run(
              `INSERT INTO mau_benh_chi_tiet (id_mau_benh, loai_muc, id_muc, so_luong, cach_dung, ghi_chu)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [idMauBenh, loaiMuc, targetId, item.so_luong, item.cach_dung || '', item.ghi_chu || '']
            );
            totalItemCount++;
            mappedItems.push({ loai: loaiMuc, id: targetId, ten: item.ten, sl: item.so_luong });
          }
        }

        results.push({
          id: idMauBenh,
          ten_benh: tpl.ten_benh,
          icd_10: tpl.icd_10,
          chan_doan: tpl.chan_doan_chuan,
          items: mappedItems
        });
      }

      // Đảm bảo cập nhật 100% chan_doan_chuan = ten_benh
      this.db.run("UPDATE mau_benh SET chan_doan_chuan = ten_benh;");

      this.db.run("PRAGMA foreign_keys = ON;");
      return {
        success: true,
        count: templateCount,
        totalItems: totalItemCount,
        message: `Đã khởi tạo thành công ${templateCount} mẫu bệnh / phác đồ với ${totalItemCount} mục thuốc, vật tư và dịch vụ kỹ thuật được ánh xạ Foreign Key chuẩn xác.`,
        details: results
      };
    } catch (err: any) {
      console.error('Lỗi khi nạp 53 mẫu bệnh:', err);
      this.db.run("PRAGMA foreign_keys = ON;");
      return {
        success: false,
        count: 0,
        totalItems: 0,
        message: `Lỗi: ${err.message || 'Không thể khởi tạo mẫu bệnh'}`,
        details: []
      };
    }
  }

  public async seed53DiseaseTemplates(): Promise<{
    success: boolean;
    count: number;
    totalItems: number;
    message: string;
    details: any[];
  }> {
    const res = this.seed53DiseaseTemplatesInternal();
    await this.persistDatabase();
    this.notify();
    return res;
  }

  public async resetAndSeed53DiseaseTemplates(): Promise<{
    success: boolean;
    count: number;
    totalItems: number;
    message: string;
  }> {
    const res = await this.seed53DiseaseTemplates();
    return {
      success: res.success,
      count: res.count,
      totalItems: res.totalItems,
      message: res.message
    };
  }

  // ===================== CRUD HO SO KHAM (MEDICAL RECORDS) =====================
  public generateMaHoSo(): string {
    const year = new Date().getFullYear();
    const countRes = this.query<{ maxId: number }>("SELECT COALESCE(MAX(id), 0) as maxId FROM ho_so_kham");
    const nextNum = (countRes[0]?.maxId || 0) + 1;
    let candidate = `HS-${year}-${String(nextNum).padStart(4, '0')}`;
    let suffix = 1;
    while (this.query("SELECT id FROM ho_so_kham WHERE ma_ho_so = ?", [candidate]).length > 0) {
      candidate = `HS-${year}-${String(nextNum + suffix).padStart(4, '0')}`;
      suffix++;
    }
    return candidate;
  }

  public getHoSoKhamList(filter?: {
    search?: string;
    idDonVi?: number;
    idDonViCap1?: number;
    tuNgay?: string;
    denNgay?: string;
    trangThai?: string;
  }): HoSoKham[] {
    let sql = `
      SELECT 
        hs.*,
        ns.ho_ten as ten_nhan_su,
        COALESCE(ns.ma_the_bhyt, '') as ma_the_bhyt,
        ns.ngay_sinh as ngay_sinh_nhan_su,
        ns.gioi_tinh as gioi_tinh_nhan_su,
        ns.cap_bac as cap_bac_nhan_su,
        ns.chuc_vu as chuc_vu_nhan_su,
        cq.ten as ten_don_vi_nhan_su,
        cq.ten as ten_don_vi_cap_2,
        COALESCE(ns.id_don_vi_cap_1, cq.id_don_vi_cap_1) as id_don_vi_cap_1,
        COALESCE(dv1_ns_direct.ten, dv1.ten) as ten_don_vi_cap_1,
        bs.ho_ten as ten_bac_si,
        COALESCE(dv1_bs_direct.ten, dv1_bs.ten) as ten_don_vi_cap_1_bac_si,
        mb.ten_benh as ten_mau_benh
      FROM ho_so_kham hs
      LEFT JOIN can_bo ns ON hs.id_nhan_su = ns.id
      LEFT JOIN don_vi_cap_2 cq ON ns.id_don_vi_cap_2 = cq.id
      LEFT JOIN don_vi_cap_1 dv1 ON cq.id_don_vi_cap_1 = dv1.id
      LEFT JOIN don_vi_cap_1 dv1_ns_direct ON ns.id_don_vi_cap_1 = dv1_ns_direct.id
      LEFT JOIN bac_si bs ON hs.id_bac_si = bs.id
      LEFT JOIN don_vi_cap_2 cq_bs ON bs.id_don_vi = cq_bs.id
      LEFT JOIN don_vi_cap_1 dv1_bs ON cq_bs.id_don_vi_cap_1 = dv1_bs.id
      LEFT JOIN don_vi_cap_1 dv1_bs_direct ON bs.id_don_vi_cap_1 = dv1_bs_direct.id
      LEFT JOIN mau_benh mb ON hs.id_mau_benh = mb.id
      WHERE 1=1
    `;
    const params: SqlValue[] = [];

    if (filter?.search?.trim()) {
      const s = `%${filter.search.trim().toLowerCase()}%`;
      sql += ` AND (
        LOWER(ns.ho_ten) LIKE ? 
        OR LOWER(hs.ma_ho_so) LIKE ? 
        OR LOWER(hs.chan_doan) LIKE ? 
        OR LOWER(COALESCE(ns.ma_the_bhyt, '')) LIKE ?
        OR LOWER(COALESCE(cq.ten, '')) LIKE ?
        OR LOWER(COALESCE(dv1_ns_direct.ten, dv1.ten, '')) LIKE ?
        OR LOWER(COALESCE(ns.cap_bac, '')) LIKE ?
        OR LOWER(COALESCE(ns.chuc_vu, '')) LIKE ?
      )`;
      params.push(s, s, s, s, s, s, s, s);
    }
    if (filter?.idDonViCap1) {
      sql += ` AND (ns.id_don_vi_cap_1 = ? OR dv1.id = ? OR cq.id_don_vi_cap_1 = ?)`;
      params.push(filter.idDonViCap1, filter.idDonViCap1, filter.idDonViCap1);
    } else if (filter?.idDonVi) {
      sql += ` AND (ns.id_don_vi_cap_1 = ? OR dv1.id = ? OR cq.id = ? OR cq.id_don_vi_cap_1 = ?)`;
      params.push(filter.idDonVi, filter.idDonVi, filter.idDonVi, filter.idDonVi);
    }
    if (filter?.tuNgay) {
      sql += ` AND hs.ngay_kham >= ?`;
      params.push(filter.tuNgay);
    }
    if (filter?.denNgay) {
      sql += ` AND hs.ngay_kham <= ?`;
      params.push(filter.denNgay);
    }
    if (filter?.trangThai) {
      sql += ` AND hs.trang_thai_kham = ?`;
      params.push(filter.trangThai);
    }

    sql += ` ORDER BY hs.id DESC`;

    return this.query<HoSoKham>(sql, params);
  }

  public getChiTietByHoSoId(idHoSo: number): HoSoKhamChiTiet[] {
    const rows = this.query<any>(
      `SELECT 
        ct.id,
        ct.id_ho_so,
        ct.loai_muc,
        ct.id_muc,
        t.id as thuoc_id,
        v.id as vat_tu_id,
        d.id as dich_vu_id,
        t.ten as ten_thuoc,
        v.ten as ten_vat_tu,
        d.ten as ten_dich_vu,
        COALESCE(
          CASE 
            WHEN ct.ten_muc IS NOT NULL AND ct.ten_muc != '' AND ct.ten_muc NOT GLOB '[0-9]*' AND ct.ten_muc NOT LIKE '%#%' THEN ct.ten_muc
            ELSE NULL
          END,
          CASE 
            WHEN ct.loai_muc = 'thuoc' THEN t.ten
            WHEN ct.loai_muc = 'vat_tu' THEN v.ten
            WHEN ct.loai_muc IN ('dich_vu_kt', 'dich_vu', 'dich_vu_ky_thuat') THEN d.ten
            ELSE COALESCE(t.ten, v.ten, d.ten)
          END,
          NULLIF(ct.ten_muc, ''),
          'Mục #' || ct.id_muc
        ) as ten_muc,
        COALESCE(
          NULLIF(ct.don_vi_tinh, ''),
          CASE 
            WHEN ct.loai_muc = 'thuoc' THEN t.don_vi_tinh
            WHEN ct.loai_muc = 'vat_tu' THEN v.don_vi_tinh
            WHEN ct.loai_muc IN ('dich_vu_kt', 'dich_vu', 'dich_vu_ky_thuat') THEN d.don_vi_tinh
            ELSE COALESCE(t.don_vi_tinh, v.don_vi_tinh, d.don_vi_tinh)
          END,
          'Lượt'
        ) as don_vi_tinh,
        ct.so_luong,
        CASE 
          WHEN ct.don_gia IS NOT NULL AND ct.don_gia > 0 THEN ct.don_gia
          WHEN ct.loai_muc = 'thuoc' THEN COALESCE(t.don_gia, 0)
          WHEN ct.loai_muc = 'vat_tu' THEN COALESCE(v.don_gia, 0)
          WHEN ct.loai_muc IN ('dich_vu_kt', 'dich_vu', 'dich_vu_ky_thuat') THEN COALESCE(d.don_gia, 0)
          ELSE COALESCE(t.don_gia, v.don_gia, d.don_gia, 0)
        END as don_gia,
        CASE
          WHEN ct.thanh_tien IS NOT NULL AND ct.thanh_tien > 0 THEN ct.thanh_tien
          ELSE (ct.so_luong * (
            CASE 
              WHEN ct.don_gia IS NOT NULL AND ct.don_gia > 0 THEN ct.don_gia
              WHEN ct.loai_muc = 'thuoc' THEN COALESCE(t.don_gia, 0)
              WHEN ct.loai_muc = 'vat_tu' THEN COALESCE(v.don_gia, 0)
              WHEN ct.loai_muc IN ('dich_vu_kt', 'dich_vu', 'dich_vu_ky_thuat') THEN COALESCE(d.don_gia, 0)
              ELSE COALESCE(t.don_gia, v.don_gia, d.don_gia, 0)
            END
          ))
        END as thanh_tien,
        ct.cach_dung,
        ct.ghi_chu
      FROM ho_so_kham_chi_tiet ct
      LEFT JOIN thuoc t ON ct.id_muc = t.id
      LEFT JOIN vat_tu v ON ct.id_muc = v.id
      LEFT JOIN dich_vu_kt d ON ct.id_muc = d.id
      WHERE ct.id_ho_so = ?
      ORDER BY ct.id ASC`,
      [idHoSo]
    );

    // Fallback catalog lookup maps to guarantee correct names, prices and totals
    const thuocs = this.getThuocList();
    const vatTus = this.getVatTuList();
    const dichVus = this.getDichVuKTList();

    const thuocMap = new Map(thuocs.map((t) => [Number(t.id), t]));
    const vatTuMap = new Map(vatTus.map((v) => [Number(v.id), v]));
    const dichVuMap = new Map(dichVus.map((d) => [Number(d.id), d]));

    return rows.map((row) => {
      const idNum = Number(row.id_muc);
      const loai = String(row.loai_muc || '').toLowerCase();
      let item: any = null;

      if (loai === 'thuoc') {
        item = thuocMap.get(idNum) || vatTuMap.get(idNum) || dichVuMap.get(idNum);
      } else if (loai === 'vat_tu') {
        item = vatTuMap.get(idNum) || thuocMap.get(idNum) || dichVuMap.get(idNum);
      } else {
        item = dichVuMap.get(idNum) || vatTuMap.get(idNum) || thuocMap.get(idNum);
      }

      let ten_muc = row.ten_muc;
      if (!ten_muc || ten_muc.startsWith('Mục #') || /^\d+$/.test(String(ten_muc).trim())) {
        ten_muc = item ? item.ten : (row.ten_thuoc || row.ten_vat_tu || row.ten_dich_vu || `Mục #${idNum}`);
      }

      let don_vi_tinh = row.don_vi_tinh;
      if (!don_vi_tinh || don_vi_tinh === 'Lượt') {
        don_vi_tinh = item ? item.don_vi_tinh : (row.don_vi_tinh || 'Lượt');
      }

      let don_gia = row.don_gia;
      if (!don_gia || don_gia <= 0) {
        don_gia = item ? (item.don_gia || 0) : 0;
      }

      const so_luong = row.so_luong || 1;
      const thanh_tien = so_luong * don_gia;

      return {
        ...row,
        id_muc: idNum,
        thuoc_id: loai === 'thuoc' ? idNum : undefined,
        vat_tu_id: loai === 'vat_tu' ? idNum : undefined,
        dich_vu_id: (loai !== 'thuoc' && loai !== 'vat_tu') ? idNum : undefined,
        ten_thuoc: loai === 'thuoc' ? ten_muc : undefined,
        ten_vat_tu: loai === 'vat_tu' ? ten_muc : undefined,
        ten_dich_vu: (loai !== 'thuoc' && loai !== 'vat_tu') ? ten_muc : undefined,
        ten_muc,
        don_vi_tinh,
        so_luong,
        don_gia,
        thanh_tien,
        cach_dung: row.cach_dung || '',
        ghi_chu: row.ghi_chu || ''
      };
    });
  }

  public getHoSoKhamById(id: number): HoSoKham | null {
    const list = this.query<HoSoKham>(
      `SELECT 
        hs.*,
        ns.ho_ten as ten_nhan_su,
        COALESCE(ns.ma_the_bhyt, '') as ma_the_bhyt,
        ns.ngay_sinh as ngay_sinh_nhan_su,
        ns.gioi_tinh as gioi_tinh_nhan_su,
        ns.cap_bac as cap_bac_nhan_su,
        ns.chuc_vu as chuc_vu_nhan_su,
        cq.ten as ten_don_vi_nhan_su,
        cq.ten as ten_don_vi_cap_2,
        dv1.id as id_don_vi_cap_1,
        dv1.ten as ten_don_vi_cap_1,
        bs.ho_ten as ten_bac_si,
        dv1_bs.ten as ten_don_vi_cap_1_bac_si,
        mb.ten_benh as ten_mau_benh
      FROM ho_so_kham hs
      LEFT JOIN can_bo ns ON hs.id_nhan_su = ns.id
      LEFT JOIN don_vi_cap_2 cq ON ns.id_don_vi_cap_2 = cq.id
      LEFT JOIN don_vi_cap_1 dv1 ON cq.id_don_vi_cap_1 = dv1.id
      LEFT JOIN bac_si bs ON hs.id_bac_si = bs.id
      LEFT JOIN don_vi_cap_2 cq_bs ON bs.id_don_vi = cq_bs.id
      LEFT JOIN don_vi_cap_1 dv1_bs ON cq_bs.id_don_vi_cap_1 = dv1_bs.id
      LEFT JOIN mau_benh mb ON hs.id_mau_benh = mb.id
      WHERE hs.id = ?`,
      [id]
    );

    if (list.length === 0) return null;
    const hs = list[0];
    hs.chi_tiet = this.getChiTietByHoSoId(id);
    
    // Recalculate total cost if necessary
    if (hs.chi_tiet && hs.chi_tiet.length > 0) {
      const calculatedTotal = hs.chi_tiet.reduce((sum, item) => sum + (item.thanh_tien || 0), 0);
      if (!hs.tong_chi_phi || hs.tong_chi_phi === 0) {
        hs.tong_chi_phi = calculatedTotal;
      }
    }
    return hs;
  }

  public getLichSuKhamNhanSu(idNhanSu: number): HoSoKham[] {
    const list = this.query<HoSoKham>(
      `SELECT hs.*, bs.ho_ten as ten_bac_si, mb.ten_benh as ten_mau_benh
       FROM ho_so_kham hs
       LEFT JOIN bac_si bs ON hs.id_bac_si = bs.id
       LEFT JOIN mau_benh mb ON hs.id_mau_benh = mb.id
       WHERE hs.id_nhan_su = ?
       ORDER BY hs.ngay_kham DESC, hs.id DESC`,
      [idNhanSu]
    );

    for (const hs of list) {
      hs.chi_tiet = this.getChiTietByHoSoId(hs.id);
    }
    return list;
  }

  public saveHoSoKham(
    hs: Partial<HoSoKham>,
    chiTietList: HoSoKhamChiTiet[],
    truTonKho = true
  ): number | null {
    if (!this.db) return null;

    let idHoSo = hs.id;
    const maHoSo = hs.ma_ho_so || this.generateMaHoSo();

    // Ensure valid id_nhan_su
    let idNhanSu = hs.id_nhan_su;
    if (!idNhanSu) {
      const firstPatient = this.query<{ id: number }>("SELECT id FROM can_bo LIMIT 1");
      if (firstPatient.length > 0) {
        idNhanSu = firstPatient[0].id;
      } else {
        this.db.run("INSERT INTO can_bo (ho_ten) VALUES ('Bệnh nhân')");
        const pRes = this.db.exec("SELECT last_insert_rowid() as id;");
        idNhanSu = pRes.length > 0 ? Number(pRes[0].values[0][0]) : 1;
      }
    } else {
      const checkPatient = this.query("SELECT id FROM can_bo WHERE id = ?", [idNhanSu]);
      if (checkPatient.length === 0) {
        const firstPatient = this.query<{ id: number }>("SELECT id FROM can_bo LIMIT 1");
        if (firstPatient.length > 0) {
          idNhanSu = firstPatient[0].id;
        } else {
          this.db.run("INSERT INTO can_bo (ho_ten) VALUES ('Bệnh nhân')");
          const pRes = this.db.exec("SELECT last_insert_rowid() as id;");
          idNhanSu = pRes.length > 0 ? Number(pRes[0].values[0][0]) : 1;
        }
      }
    }

    // Ensure valid id_bac_si
    let idBacSi = hs.id_bac_si;
    if (!idBacSi) {
      const firstDoc = this.query<{ id: number }>("SELECT id FROM bac_si LIMIT 1");
      if (firstDoc.length > 0) {
        idBacSi = firstDoc[0].id;
      } else {
        this.db.run("INSERT INTO bac_si (ho_ten, chuyen_mon) VALUES ('Bác sĩ phụ trách', 'Đa khoa')");
        const docRes = this.db.exec("SELECT last_insert_rowid() as id;");
        idBacSi = docRes.length > 0 ? Number(docRes[0].values[0][0]) : 1;
      }
    } else {
      const checkDoc = this.query("SELECT id FROM bac_si WHERE id = ?", [idBacSi]);
      if (checkDoc.length === 0) {
        const firstDoc = this.query<{ id: number }>("SELECT id FROM bac_si LIMIT 1");
        if (firstDoc.length > 0) {
          idBacSi = firstDoc[0].id;
        } else {
          this.db.run("INSERT INTO bac_si (ho_ten, chuyen_mon) VALUES ('Bác sĩ phụ trách', 'Đa khoa')");
          const docRes = this.db.exec("SELECT last_insert_rowid() as id;");
          idBacSi = docRes.length > 0 ? Number(docRes[0].values[0][0]) : 1;
        }
      }
    }

    // Ensure valid id_mau_benh if provided
    let idMauBenh = hs.id_mau_benh || null;
    if (idMauBenh) {
      const checkMb = this.query("SELECT id FROM mau_benh WHERE id = ?", [idMauBenh]);
      if (checkMb.length === 0) {
        idMauBenh = null;
      }
    }

    // Ensure item catalog resolution (name, price, total)
    const thuocs = this.getThuocList();
    const vatTus = this.getVatTuList();
    const dichVus = this.getDichVuKTList();

    const thuocMap = new Map(thuocs.map((t) => [Number(t.id), t]));
    const vatTuMap = new Map(vatTus.map((v) => [Number(v.id), v]));
    const dichVuMap = new Map(dichVus.map((d) => [Number(d.id), d]));

    let calculatedTotalCost = 0;
    const processedChiTiet = chiTietList.map((ct) => {
      const idNum = Number(ct.id_muc);
      const loai = String(ct.loai_muc || '').toLowerCase();
      let item: any = null;

      if (loai === 'thuoc') {
        item = thuocMap.get(idNum) || vatTuMap.get(idNum) || dichVuMap.get(idNum);
      } else if (loai === 'vat_tu') {
        item = vatTuMap.get(idNum) || thuocMap.get(idNum) || dichVuMap.get(idNum);
      } else {
        item = dichVuMap.get(idNum) || vatTuMap.get(idNum) || thuocMap.get(idNum);
      }

      let ten_muc = ct.ten_muc;
      if (!ten_muc || ten_muc.startsWith('Mục #') || /^\d+$/.test(String(ten_muc).trim())) {
        ten_muc = item ? item.ten : (ct.ten_thuoc || ct.ten_vat_tu || ct.ten_dich_vu || `Mục #${idNum}`);
      }

      let don_vi_tinh = ct.don_vi_tinh;
      if (!don_vi_tinh || don_vi_tinh === 'Lượt') {
        don_vi_tinh = item ? item.don_vi_tinh : (ct.don_vi_tinh || 'Lượt');
      }

      let don_gia = ct.don_gia;
      if (!don_gia || don_gia <= 0) {
        don_gia = item ? (item.don_gia || 0) : 0;
      }

      const so_luong = ct.so_luong || 1;
      const thanh_tien = so_luong * don_gia;
      calculatedTotalCost += thanh_tien;

      return {
        ...ct,
        id_muc: idNum,
        ten_muc,
        don_vi_tinh,
        so_luong,
        don_gia,
        thanh_tien
      };
    });

    const finalTongChiPhi = (hs.tong_chi_phi && hs.tong_chi_phi > 0) ? hs.tong_chi_phi : calculatedTotalCost;

    if (idHoSo) {
      this.run(
        `UPDATE ho_so_kham SET 
          id_nhan_su = ?, ngay_kham = ?, trieu_chung = ?, mach = ?, nhiet_do = ?, 
          huyet_ap = ?, nhip_tho = ?, can_nang = ?, chieu_cao = ?, chan_doan = ?, 
          id_mau_benh = ?, id_bac_si = ?, loi_dan = ?, tong_chi_phi = ?, 
          trang_thai_bhyt = ?, ngay_tai_kham = ?, trang_thai_kham = ? 
        WHERE id = ?`,
        [
          idNhanSu,
          hs.ngay_kham || new Date().toISOString().split('T')[0],
          hs.trieu_chung || '',
          hs.mach || null,
          hs.nhiet_do || null,
          hs.huyet_ap || '',
          hs.nhip_tho || null,
          hs.can_nang || null,
          hs.chieu_cao || null,
          hs.chan_doan || '',
          idMauBenh,
          idBacSi,
          hs.loi_dan || '',
          finalTongChiPhi,
          hs.trang_thai_bhyt ?? 1,
          hs.ngay_tai_kham || '',
          hs.trang_thai_kham || 'hoan_thanh',
          idHoSo
        ]
      );

      this.run("DELETE FROM ho_so_kham_chi_tiet WHERE id_ho_so = ?", [idHoSo]);
    } else {
      const res = this.run(
        `INSERT OR IGNORE INTO ho_so_kham 
         (ma_ho_so, id_nhan_su, ngay_kham, trieu_chung, mach, nhiet_do, huyet_ap, nhip_tho, can_nang, chieu_cao, chan_doan, id_mau_benh, id_bac_si, loi_dan, tong_chi_phi, trang_thai_bhyt, ngay_tai_kham, trang_thai_kham)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          maHoSo,
          idNhanSu,
          hs.ngay_kham || new Date().toISOString().split('T')[0],
          hs.trieu_chung || '',
          hs.mach || null,
          hs.nhiet_do || null,
          hs.huyet_ap || '',
          hs.nhip_tho || null,
          hs.can_nang || null,
          hs.chieu_cao || null,
          hs.chan_doan || '',
          idMauBenh,
          idBacSi,
          hs.loi_dan || '',
          finalTongChiPhi,
          hs.trang_thai_bhyt ?? 1,
          hs.ngay_tai_kham || '',
          hs.trang_thai_kham || 'hoan_thanh'
        ]
      );
      if (!res.success || !res.lastInsertRowId) return null;
      idHoSo = res.lastInsertRowId;
    }

    // Insert details & deduct stock
    for (const ct of processedChiTiet) {
      this.run(
        `INSERT OR IGNORE INTO ho_so_kham_chi_tiet 
         (id_ho_so, loai_muc, id_muc, ten_muc, don_vi_tinh, so_luong, don_gia, thanh_tien, cach_dung, ghi_chu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          idHoSo,
          ct.loai_muc,
          ct.id_muc,
          ct.ten_muc,
          ct.don_vi_tinh,
          ct.so_luong,
          ct.don_gia,
          ct.thanh_tien,
          ct.cach_dung || '',
          ct.ghi_chu || ''
        ]
      );

      if (truTonKho && !hs.id) {
        if (ct.loai_muc === 'thuoc') {
          this.run("UPDATE thuoc SET ton_kho = MAX(0, ton_kho - ?) WHERE id = ?", [
            ct.so_luong,
            ct.id_muc
          ]);
        } else if (ct.loai_muc === 'vat_tu') {
          this.run("UPDATE vat_tu SET ton_kho = MAX(0, ton_kho - ?) WHERE id = ?", [
            ct.so_luong,
            ct.id_muc
          ]);
        }
      }
    }

    this.persistDatabase();
    this.notify();
    return idHoSo;
  }

  public deleteHoSoKham(id: number): boolean {
    this.run("DELETE FROM ho_so_kham_chi_tiet WHERE id_ho_so = ?", [id]);
    const res = this.run("DELETE FROM ho_so_kham WHERE id = ?", [id]);
    this.persistDatabase();
    this.notify();
    return res.success;
  }

  // ===================== STATS & REPORTS =====================
  public getClinicStatistics() {
    const totalExamsRes = this.query<{ count: number }>("SELECT COUNT(*) as count FROM ho_so_kham");
    const totalPatientsRes = this.query<{ count: number }>("SELECT COUNT(*) as count FROM can_bo");
    const totalMedicinesRes = this.query<{ count: number }>("SELECT COUNT(*) as count FROM thuoc");
    const totalLowStockRes = this.query<{ count: number }>("SELECT COUNT(*) as count FROM thuoc WHERE ton_kho <= 20");
    const totalCostRes = this.query<{ total: number }>("SELECT SUM(tong_chi_phi) as total FROM ho_so_kham");

    // Exams by department
    const byDept = this.query<{ ten_co_quan: string; so_luot_kham: number; tong_tien: number }>(`
      SELECT 
        COALESCE(cq.ten, 'Chưa xác định') as ten_co_quan,
        COUNT(hs.id) as so_luot_kham,
        SUM(hs.tong_chi_phi) as tong_tien
      FROM ho_so_kham hs
      JOIN can_bo ns ON hs.id_nhan_su = ns.id
      LEFT JOIN don_vi_cap_2 cq ON ns.id_don_vi_cap_2 = cq.id
      GROUP BY cq.id
      ORDER BY so_luot_kham DESC
    `);

    // Top diagnoses
    const topDiagnoses = this.query<{ chan_doan: string; count: number }>(`
      SELECT chan_doan, COUNT(*) as count
      FROM ho_so_kham
      GROUP BY chan_doan
      ORDER BY count DESC
      LIMIT 6
    `);

    // Top prescribed medicines
    const topMedicines = this.query<{ ten_muc: string; tong_so_luong: number; tong_tien: number }>(`
      SELECT 
        ten_muc,
        SUM(so_luong) as tong_so_luong,
        SUM(thanh_tien) as tong_tien
      FROM ho_so_kham_chi_tiet
      WHERE loai_muc = 'thuoc'
      GROUP BY id_muc, ten_muc
      ORDER BY tong_so_luong DESC
      LIMIT 8
    `);

    return {
      totalExams: totalExamsRes[0]?.count || 0,
      totalPatients: totalPatientsRes[0]?.count || 0,
      totalMedicines: totalMedicinesRes[0]?.count || 0,
      lowStockCount: totalLowStockRes[0]?.count || 0,
      totalCost: totalCostRes[0]?.total || 0,
      byDepartment: byDept,
      topDiagnoses,
      topMedicines
    };
  }

  public getDashboardData(period: 'day' | 'month' | 'quarter' = 'day') {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    let fromDate = today;
    if (period === 'month') {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      fromDate = firstDayOfMonth.toISOString().split('T')[0];
    } else if (period === 'quarter') {
      const currentQuarterMonth = Math.floor(now.getMonth() / 3) * 3;
      const firstDayOfQuarter = new Date(now.getFullYear(), currentQuarterMonth, 1);
      fromDate = firstDayOfQuarter.toISOString().split('T')[0];
    }

    // 1. Today Exams
    const todayExamsRes = this.query<{ count: number }>(
      "SELECT COUNT(*) as count FROM ho_so_kham WHERE ngay_kham = ?",
      [today]
    );

    // 2. Period Exams & Cost
    const periodExamsRes = this.query<{ count: number; totalCost: number }>(
      "SELECT COUNT(*) as count, COALESCE(SUM(tong_chi_phi), 0) as totalCost FROM ho_so_kham WHERE ngay_kham >= ?",
      [fromDate]
    );

    // Total Patients
    const totalPatientsRes = this.query<{ count: number }>("SELECT COUNT(*) as count FROM can_bo");

    // 3. Re-examination appointments today or upcoming
    const reExamPatients = this.query<{
      id: number;
      ma_ho_so: string;
      id_nhan_su: number;
      ten_nhan_su: string;
      ten_co_quan: string;
      chan_doan: string;
      ngay_kham: string;
      ngay_tai_kham: string;
      ten_bac_si: string;
    }>(`
      SELECT 
        hs.id,
        hs.ma_ho_so,
        hs.id_nhan_su,
        ns.ho_ten as ten_nhan_su,
        cq.ten,
        hs.chan_doan,
        hs.ngay_kham,
        hs.ngay_tai_kham,
        bs.ho_ten as ten_bac_si
      FROM ho_so_kham hs
      JOIN can_bo ns ON hs.id_nhan_su = ns.id
      LEFT JOIN don_vi_cap_2 cq ON ns.id_don_vi_cap_2 = cq.id
      LEFT JOIN bac_si bs ON hs.id_bac_si = bs.id
      WHERE hs.ngay_tai_kham IS NOT NULL AND hs.ngay_tai_kham != ''
      ORDER BY hs.ngay_tai_kham ASC
      LIMIT 8
    `);

    // 4. Top 5 low stock medicines
    const topLowStockMedicines = this.query<{
      id: number;
      ten: string;
      ham_luong: string;
      don_vi_tinh: string;
      don_gia: number;
      ton_kho: number;
      ghi_chu: string;
    }>(`
      SELECT id, ten, ham_luong, don_vi_tinh, don_gia, ton_kho, ghi_chu
      FROM thuoc
      ORDER BY ton_kho ASC
      LIMIT 5
    `);

    // 5. Weekly visits mockup / real data
    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
    const weeklyData = [
      { name: 'Thứ 2', luotKham: 18, donThuoc: 16, chiPhi: 2450000 },
      { name: 'Thứ 3', luotKham: 24, donThuoc: 22, chiPhi: 3120000 },
      { name: 'Thứ 4', luotKham: 15, donThuoc: 14, chiPhi: 1980000 },
      { name: 'Thứ 5', luotKham: 29, donThuoc: 26, chiPhi: 4200000 },
      { name: 'Thứ 6', luotKham: 21, donThuoc: 19, chiPhi: 2850000 },
      { name: 'Thứ 7', luotKham: 8, donThuoc: 7, chiPhi: 950000 },
      { name: 'CN', luotKham: 4, donThuoc: 4, chiPhi: 420000 }
    ];

    // If there is real count today, adjust the day of week
    const dayIndex = (now.getDay() + 6) % 7; // Mon=0, Sun=6
    if (todayExamsRes[0]?.count && todayExamsRes[0]?.count > 0) {
      weeklyData[dayIndex].luotKham = Math.max(weeklyData[dayIndex].luotKham, todayExamsRes[0].count);
      weeklyData[dayIndex].donThuoc = Math.max(weeklyData[dayIndex].donThuoc, todayExamsRes[0].count);
    }

    // 6. BHYT distribution
    const bhytCountRes = this.query<{ trang_thai_bhyt: number; count: number }>(`
      SELECT trang_thai_bhyt, COUNT(*) as count
      FROM ho_so_kham
      GROUP BY trang_thai_bhyt
    `);

    let bhytCount = 0;
    let tuChiTraCount = 0;
    let mienPhiCount = 0;

    for (const r of bhytCountRes) {
      if (r.trang_thai_bhyt === 1) bhytCount = r.count;
      else if (r.trang_thai_bhyt === 0) tuChiTraCount = r.count;
      else if (r.trang_thai_bhyt === 2) mienPhiCount = r.count;
    }

    // Default distribution mockup if total is very low
    if (bhytCount + tuChiTraCount + mienPhiCount === 0) {
      bhytCount = 48;
      tuChiTraCount = 8;
      mienPhiCount = 4;
    }

    const bhytDistribution = [
      { name: 'Khám theo BHYT (Hưởng 80-100%)', value: bhytCount, color: '#0284c7' },
      { name: 'Tự chi trả theo đơn giá', value: tuChiTraCount, color: '#f59e0b' },
      { name: 'Cơ quan cấp phát miễn phí', value: mienPhiCount, color: '#10b981' }
    ];

    return {
      todayExamsCount: todayExamsRes[0]?.count || 0,
      periodExamsCount: periodExamsRes[0]?.count || 0,
      periodTotalCost: periodExamsRes[0]?.totalCost || 0,
      totalPatients: totalPatientsRes[0]?.count || 0,
      reExamPatients,
      topLowStockMedicines,
      weeklyData,
      bhytDistribution
    };
  }

  // ===================== REPORTING METHODS =====================
  public getBaoCaoChiPhiKhamBenh(filter?: {
    tuNgay?: string;
    denNgay?: string;
    idDonVi?: number;
    idDonViCap1?: number;
    search?: string;
  }) {
    let sql = `
      SELECT 
        hs.id,
        hs.ma_ho_so,
        hs.ngay_kham,
        hs.chan_doan,
        hs.trieu_chung,
        hs.tong_chi_phi,
        hs.trang_thai_bhyt,
        hs.trang_thai_kham,
        ns.id as id_nhan_su,
        ns.ho_ten as ten_nhan_su,
        ns.ma_the_bhyt,
        ns.gioi_tinh as gioi_tinh_nhan_su,
        ns.ngay_sinh as ngay_sinh_nhan_su,
        ns.cap_bac as cap_bac_nhan_su,
        ns.chuc_vu as chuc_vu_nhan_su,
        COALESCE(cq.ten, 'Chưa phân bổ') as ten_don_vi,
        COALESCE(cq.ten, 'Chưa phân bổ') as ten_don_vi_cap_2,
        cq.id as id_don_vi_cap_2,
        dv1.id as id_don_vi_cap_1,
        COALESCE(dv1.ten, 'Khối Cơ quan / Chưa phân bổ') as ten_don_vi_cap_1,
        COALESCE(bs.ho_ten, 'Bác sĩ trực') as ten_bac_si
      FROM ho_so_kham hs
      JOIN can_bo ns ON hs.id_nhan_su = ns.id
      LEFT JOIN don_vi_cap_2 cq ON ns.id_don_vi_cap_2 = cq.id
      LEFT JOIN don_vi_cap_1 dv1 ON cq.id_don_vi_cap_1 = dv1.id
      LEFT JOIN bac_si bs ON hs.id_bac_si = bs.id
      WHERE 1=1
    `;
    const params: SqlValue[] = [];
    if (filter?.tuNgay) {
      sql += ` AND hs.ngay_kham >= ?`;
      params.push(filter.tuNgay);
    }
    if (filter?.denNgay) {
      sql += ` AND hs.ngay_kham <= ?`;
      params.push(filter.denNgay);
    }
    if (filter?.idDonViCap1) {
      sql += ` AND (dv1.id = ? OR cq.id_don_vi_cap_1 = ?)`;
      params.push(filter.idDonViCap1, filter.idDonViCap1);
    } else if (filter?.idDonVi) {
      sql += ` AND (ns.id_don_vi_cap_2 = ? OR cq.id = ?)`;
      params.push(filter.idDonVi, filter.idDonVi);
    }
    if (filter?.search?.trim()) {
      const s = `%${filter.search.trim().toLowerCase()}%`;
      sql += ` AND (
        LOWER(ns.ho_ten) LIKE ? 
        OR LOWER(hs.ma_ho_so) LIKE ? 
        OR LOWER(hs.chan_doan) LIKE ? 
        OR LOWER(COALESCE(cq.ten, '')) LIKE ? 
        OR LOWER(COALESCE(dv1.ten, '')) LIKE ?
        OR LOWER(COALESCE(ns.ma_the_bhyt, '')) LIKE ?
      )`;
      params.push(s, s, s, s, s, s);
    }
    sql += ` ORDER BY hs.ngay_kham DESC, hs.id DESC`;
    return this.query<any>(sql, params);
  }

  public getBaoCaoChiTietDanhMucRaw(filter?: {
    tuNgay?: string;
    denNgay?: string;
  }) {
    let sql = `
      SELECT 
        ct.id,
        ct.id_ho_so,
        ct.loai_muc,
        ct.id_muc,
        t.id as thuoc_id,
        v.id as vat_tu_id,
        d.id as dich_vu_id,
        t.ten as ten_thuoc,
        v.ten as ten_vat_tu,
        d.ten as ten_dich_vu,
        COALESCE(
          CASE 
            WHEN ct.ten_muc IS NOT NULL AND ct.ten_muc != '' AND ct.ten_muc NOT GLOB '[0-9]*' AND ct.ten_muc NOT LIKE '%#%' THEN ct.ten_muc
            ELSE NULL
          END,
          CASE 
            WHEN ct.loai_muc = 'thuoc' THEN t.ten
            WHEN ct.loai_muc = 'vat_tu' THEN v.ten
            WHEN ct.loai_muc IN ('dich_vu_kt', 'dich_vu', 'dich_vu_ky_thuat') THEN d.ten
            ELSE COALESCE(t.ten, v.ten, d.ten)
          END,
          NULLIF(ct.ten_muc, ''),
          'Mục #' || ct.id_muc
        ) as ten_muc,
        COALESCE(
          NULLIF(ct.don_vi_tinh, ''),
          CASE 
            WHEN ct.loai_muc = 'thuoc' THEN t.don_vi_tinh
            WHEN ct.loai_muc = 'vat_tu' THEN v.don_vi_tinh
            WHEN ct.loai_muc IN ('dich_vu_kt', 'dich_vu', 'dich_vu_ky_thuat') THEN d.don_vi_tinh
            ELSE COALESCE(t.don_vi_tinh, v.don_vi_tinh, d.don_vi_tinh)
          END,
          'Lượt'
        ) as don_vi_tinh,
        ct.so_luong,
        CASE 
          WHEN ct.don_gia IS NOT NULL AND ct.don_gia > 0 THEN ct.don_gia
          WHEN ct.loai_muc = 'thuoc' THEN COALESCE(t.don_gia, 0)
          WHEN ct.loai_muc = 'vat_tu' THEN COALESCE(v.don_gia, 0)
          WHEN ct.loai_muc IN ('dich_vu_kt', 'dich_vu', 'dich_vu_ky_thuat') THEN COALESCE(d.don_gia, 0)
          ELSE COALESCE(t.don_gia, v.don_gia, d.don_gia, 0)
        END as don_gia,
        CASE
          WHEN ct.thanh_tien IS NOT NULL AND ct.thanh_tien > 0 THEN ct.thanh_tien
          ELSE (ct.so_luong * (
            CASE 
              WHEN ct.don_gia IS NOT NULL AND ct.don_gia > 0 THEN ct.don_gia
              WHEN ct.loai_muc = 'thuoc' THEN COALESCE(t.don_gia, 0)
              WHEN ct.loai_muc = 'vat_tu' THEN COALESCE(v.don_gia, 0)
              WHEN ct.loai_muc IN ('dich_vu_kt', 'dich_vu', 'dich_vu_ky_thuat') THEN COALESCE(d.don_gia, 0)
              ELSE COALESCE(t.don_gia, v.don_gia, d.don_gia, 0)
            END
          ))
        END as thanh_tien,
        ct.cach_dung,
        hs.ngay_kham,
        hs.ma_ho_so,
        ns.ho_ten as ten_nhan_su,
        cq.ten as ten_don_vi,
        cq.ten as ten_don_vi_cap_2,
        dv1.ten as ten_don_vi_cap_1
      FROM ho_so_kham_chi_tiet ct
      JOIN ho_so_kham hs ON ct.id_ho_so = hs.id
      LEFT JOIN can_bo ns ON hs.id_nhan_su = ns.id
      LEFT JOIN don_vi_cap_2 cq ON ns.id_don_vi_cap_2 = cq.id
      LEFT JOIN don_vi_cap_1 dv1 ON cq.id_don_vi_cap_1 = dv1.id
      LEFT JOIN thuoc t ON ct.id_muc = t.id AND ct.loai_muc = 'thuoc'
      LEFT JOIN vat_tu v ON ct.id_muc = v.id AND ct.loai_muc = 'vat_tu'
      LEFT JOIN dich_vu_kt d ON ct.id_muc = d.id AND ct.loai_muc IN ('dich_vu_kt', 'dich_vu', 'dich_vu_ky_thuat')
      WHERE 1=1
    `;
    const params: SqlValue[] = [];
    if (filter?.tuNgay) {
      sql += ` AND hs.ngay_kham >= ?`;
      params.push(filter.tuNgay);
    }
    if (filter?.denNgay) {
      sql += ` AND hs.ngay_kham <= ?`;
      params.push(filter.denNgay);
    }
    sql += ` ORDER BY hs.ngay_kham DESC, ct.id ASC`;
    return this.query<any>(sql, params);
  }

  // ===================== BACKUP & RESTORE & SQL EXPORT =====================
  public exportSQLiteBinary(): Uint8Array | null {
    if (!this.db) return null;
    return this.db.export();
  }

  public exportSQLDump(): string {
    if (!this.db) return '';
    const tables = [
      'co_quan',
      'bac_si',
      'nhan_su',
      'thuoc',
      'vat_tu',
      'dich_vu_kt',
      'mau_benh',
      'mau_benh_chi_tiet',
      'ho_so_kham',
      'ho_so_kham_chi_tiet'
    ];

    let dump = `-- CLINIC OFFLINE SQLITE DUMP\n-- Export Date: ${new Date().toISOString()}\n\nBEGIN TRANSACTION;\n`;

    for (const table of tables) {
      const rows = this.query(`SELECT * FROM ${table}`);
      if (rows.length === 0) continue;

      dump += `\n-- Table: ${table}\n`;
      for (const row of rows) {
        const cols = Object.keys(row);
        const values = Object.values(row).map((v) => {
          if (v === null || v === undefined) return 'NULL';
          if (typeof v === 'number') return v;
          return `'${String(v).replace(/'/g, "''")}'`;
        });
        dump += `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${values.join(', ')});\n`;
      }
    }

    dump += `\nCOMMIT;\n`;
    return dump;
  }

  public exportJSONBackup(): string {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      co_quan: this.getCoQuanList(),
      bac_si: this.getBacSiList(),
      nhan_su: this.getNhanSuList(),
      thuoc: this.getThuocList(),
      vat_tu: this.getVatTuList(),
      dich_vu_kt: this.getDichVuKTList(),
      mau_benh: this.getMauBenhList(),
      ho_so_kham: this.query("SELECT * FROM ho_so_kham"),
      ho_so_kham_chi_tiet: this.query("SELECT * FROM ho_so_kham_chi_tiet")
    };
    return JSON.stringify(data, null, 2);
  }

  public async importSQLiteBinary(uint8Array: Uint8Array): Promise<boolean> {
    try {
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`
      });
      this.db = new SQL.Database(uint8Array);
      this.createTables();
      await this.persistDatabase();
      this.notify();
      return true;
    } catch (err) {
      console.error('Failed to import SQLite binary:', err);
      return false;
    }
  }

  public async importSQLDump(sqlText: string): Promise<boolean> {
    if (!this.db) return false;
    try {
      this.db.run(sqlText);
      await this.persistDatabase();
      this.notify();
      return true;
    } catch (err) {
      console.error('Failed to execute SQL dump:', err);
      return false;
    }
  }

  public async importJSONBackup(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (!this.db) return false;

      this.db.run(`
        DELETE FROM ho_so_kham_chi_tiet;
        DELETE FROM ho_so_kham;
        DELETE FROM mau_benh_chi_tiet;
        DELETE FROM mau_benh;
        DELETE FROM dich_vu_kt;
        DELETE FROM vat_tu;
        DELETE FROM thuoc;
        DELETE FROM can_bo;
        DELETE FROM bac_si;
        DELETE FROM the_bhyt; DELETE FROM can_bo; DELETE FROM don_vi_cap_2; DELETE FROM don_vi_cap_1;
      `);

      if (Array.isArray(data.co_quan)) {
        for (const cq of data.co_quan) this.saveCoQuan(cq);
      }
      if (Array.isArray(data.bac_si)) {
        for (const bs of data.bac_si) this.saveBacSi(bs);
      }
      if (Array.isArray(data.nhan_su)) {
        for (const ns of data.nhan_su) this.saveNhanSu(ns);
      }
      if (Array.isArray(data.thuoc)) {
        for (const t of data.thuoc) this.saveThuoc(t);
      }
      if (Array.isArray(data.vat_tu)) {
        for (const vt of data.vat_tu) this.saveVatTu(vt);
      }
      if (Array.isArray(data.dich_vu_kt)) {
        for (const dv of data.dich_vu_kt) this.saveDichVuKT(dv);
      }
      if (Array.isArray(data.mau_benh)) {
        for (const mb of data.mau_benh) {
          this.saveMauBenh(mb, mb.chi_tiet || []);
        }
      }
      if (Array.isArray(data.ho_so_kham)) {
        for (const hs of data.ho_so_kham) {
          this.db.run(
            `INSERT OR IGNORE INTO ho_so_kham (id, ma_ho_so, id_nhan_su, ngay_kham, trieu_chung, mach, nhiet_do, huyet_ap, nhip_tho, can_nang, chieu_cao, chan_doan, id_mau_benh, id_bac_si, loi_dan, tong_chi_phi, trang_thai_bhyt, ngay_tai_kham, trang_thai_kham)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              hs.id,
              hs.ma_ho_so,
              hs.id_nhan_su,
              hs.ngay_kham,
              hs.trieu_chung || '',
              hs.mach || null,
              hs.nhiet_do || null,
              hs.huyet_ap || '',
              hs.nhip_tho || null,
              hs.can_nang || null,
              hs.chieu_cao || null,
              hs.chan_doan || '',
              hs.id_mau_benh || null,
              hs.id_bac_si || 1,
              hs.loi_dan || '',
              hs.tong_chi_phi || 0,
              hs.trang_thai_bhyt ?? 1,
              hs.ngay_tai_kham || '',
              hs.trang_thai_kham || 'hoan_thanh'
            ]
          );
        }
      }
      if (Array.isArray(data.ho_so_kham_chi_tiet)) {
        for (const ct of data.ho_so_kham_chi_tiet) {
          this.db.run(
            `INSERT OR IGNORE INTO ho_so_kham_chi_tiet (id, id_ho_so, loai_muc, id_muc, ten_muc, don_vi_tinh, so_luong, don_gia, thanh_tien, cach_dung, ghi_chu)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              ct.id,
              ct.id_ho_so,
              ct.loai_muc,
              ct.id_muc,
              ct.ten_muc,
              ct.don_vi_tinh,
              ct.so_luong,
              ct.don_gia,
              ct.thanh_tien,
              ct.cach_dung || '',
              ct.ghi_chu || ''
            ]
          );
        }
      }

      await this.persistDatabase();
      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to import JSON backup:', e);
      return false;
    }
  }

  // Convenience methods for Database UI
  public exportBinaryDatabase() {
    const data = this.exportSQLiteBinary();
    if (!data) return;
    const blob = new Blob([data.buffer as ArrayBuffer], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phong_kham_${new Date().toISOString().slice(0, 10)}.sqlite`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public exportJSONDatabase() {
    const json = this.exportJSONBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phong_kham_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public async importBinaryDatabase(u8: Uint8Array): Promise<boolean> {
    return this.importSQLiteBinary(u8);
  }

  public async importJSONDatabase(jsonStr: string): Promise<boolean> {
    return this.importJSONBackup(jsonStr);
  }

  public async resetToSeedData(): Promise<void> {
    this.seedInitialData(true);
    await this.persistDatabase();
    this.notify();
  }

  /**
   * Dọn sạch toàn bộ dữ liệu Khám bệnh / Bảng kê nháp (Clear Exam Data)
   * Thực thi:
   *  1. DELETE FROM ho_so_kham_chi_tiet;
   *  2. DELETE FROM ho_so_kham;
   *  3. DELETE FROM sqlite_sequence WHERE name IN ('ho_so_kham', 'ho_so_kham_chi_tiet', 'kham_benh', 'chi_tiet_thuoc', 'chi_tiet_vat_tu', 'chi_tiet_dich_vu');
   * KHÔNG xóa bảng cán bộ, thẻ BHYT và danh mục y tế.
   */
  public clearExamRecords(): { success: boolean; message: string; deletedCount: number } {
    if (!this.db) {
      return { success: false, message: 'Cơ sở dữ liệu SQLite chưa sẵn sàng.', deletedCount: 0 };
    }

    try {
      const countBefore = this.db.exec("SELECT COUNT(*) FROM ho_so_kham");
      const count = countBefore.length > 0 ? Number(countBefore[0].values[0][0]) : 0;

      this.db.run(`
        DELETE FROM ho_so_kham_chi_tiet;
        DELETE FROM ho_so_kham;
      `);

      // Reset auto-increment sequence counter
      try {
        this.db.run(`
          DELETE FROM sqlite_sequence WHERE name IN ('ho_so_kham', 'ho_so_kham_chi_tiet', 'kham_benh', 'chi_tiet_thuoc', 'chi_tiet_vat_tu', 'chi_tiet_dich_vu');
        `);
      } catch (seqErr) {
        console.warn('sqlite_sequence reset note:', seqErr);
      }

      this.persistDatabase();
      this.notify();

      return {
        success: true,
        message: `Đã dọn sạch toàn bộ ${count} ca khám bệnh và chi tiết bảng kê. Bộ đếm ID tự động tăng đã được đặt lại về 0. Danh mục y tế, Cán bộ và Thẻ BHYT vẫn được giữ nguyên an toàn!`,
        deletedCount: count
      };
    } catch (err: any) {
      console.error('Lỗi khi xóa dữ liệu khám bệnh:', err);
      return {
        success: false,
        message: `Lỗi khi xóa dữ liệu khám bệnh: ${err.message || err}`,
        deletedCount: 0
      };
    }
  }

  /**
   * Chuẩn hóa và thiết lập cứng danh mục Đơn vị cấp 1 (CHỈ 6 ĐƠN VỊ CHUẨN)
   */
  public forceResetAndSeedDonViCap1(): {
    success: boolean;
    message: string;
    donViCap1List: any[];
    donViCap2List: any[];
  } {
    if (!this.db) {
      return {
        success: false,
        message: 'Cơ sở dữ liệu SQLite chưa sẵn sàng.',
        donViCap1List: [],
        donViCap2List: []
      };
    }

    try {
      this.db.run("PRAGMA foreign_keys = OFF;");
      this.db.run("DELETE FROM don_vi_cap_2;");
      this.db.run("DELETE FROM don_vi_cap_1;");
      try {
        this.db.run("DELETE FROM sqlite_sequence WHERE name IN ('don_vi_cap_1', 'don_vi_cap_2');");
      } catch (seqErr) {}

      // 1. Chèn cứng đúng 6 đơn vị cấp 1
      for (const cap1 of SEED_DON_VI_CAP_1) {
        this.db.run(
          "INSERT INTO don_vi_cap_1 (id, ten, ghi_chu) VALUES (?, ?, ?)",
          [cap1.id, cap1.ten, cap1.ghi_chu || '']
        );
      }

      // 2. Chèn các đơn vị cấp 2 trực thuộc
      for (const cq of SEED_CO_QUAN) {
        this.db.run(
          "INSERT INTO don_vi_cap_2 (id, id_don_vi_cap_1, ten, ghi_chu) VALUES (?, ?, ?, ?)",
          [cq.id, cq.id_don_vi_cap_1 || 1, cq.ten, cq.ghi_chu || '']
        );
      }

      // 3. Cập nhật lại cán bộ và bác sĩ trỏ về đơn vị hợp lệ
      this.db.run("UPDATE can_bo SET id_don_vi_cap_2 = 1 WHERE id_don_vi_cap_2 NOT IN (SELECT id FROM don_vi_cap_2);");
      this.db.run("UPDATE bac_si SET id_don_vi = 15 WHERE id_don_vi NOT IN (SELECT id FROM don_vi_cap_2);");

      this.db.run("PRAGMA foreign_keys = ON;");
      this.persistDatabase();
      this.notify();

      const freshCap1 = this.getDonViCap1List();
      const freshCap2 = this.getDonViCap2List();

      return {
        success: true,
        message: `Đã chuẩn hóa chính xác 6 Đơn vị cấp 1 và ${freshCap2.length} đơn vị trực thuộc.`,
        donViCap1List: freshCap1,
        donViCap2List: freshCap2
      };
    } catch (err: any) {
      console.error('Lỗi chuẩn hóa Đơn vị cấp 1:', err);
      return {
        success: false,
        message: `Lỗi: ${err.message}`,
        donViCap1List: [],
        donViCap2List: []
      };
    }
  }

  // ===================== AUTHENTICATION & USER MANAGEMENT =====================
  public authenticate(tenDangNhap: string, matKhau: string): NguoiDung | null {
    if (!this.db) return null;
    const res = this.query<NguoiDung>(
      `SELECT id, ten_dang_nhap, ho_ten, vai_tro, id_bac_si, trang_thai, created_at 
       FROM nguoi_dung 
       WHERE LOWER(ten_dang_nhap) = LOWER(?) AND mat_khau = ? AND trang_thai = 1`,
      [tenDangNhap.trim(), matKhau.trim()]
    );
    return res.length > 0 ? res[0] : null;
  }

  public getNguoiDungList(): NguoiDung[] {
    return this.query<NguoiDung>(
      `SELECT id, ten_dang_nhap, ho_ten, vai_tro, id_bac_si, trang_thai, created_at 
       FROM nguoi_dung ORDER BY id ASC`
    );
  }

  public saveNguoiDung(user: Partial<NguoiDung>): number | null {
    if (!this.db || !user.ten_dang_nhap || !user.ho_ten) return null;
    if (user.id) {
      if (user.mat_khau) {
        this.db.run(
          `UPDATE nguoi_dung 
           SET ten_dang_nhap = ?, mat_khau = ?, ho_ten = ?, vai_tro = ?, id_bac_si = ?, trang_thai = ?
           WHERE id = ?`,
          [
            user.ten_dang_nhap,
            user.mat_khau,
            user.ho_ten,
            user.vai_tro || 'bac_si',
            user.id_bac_si || null,
            user.trang_thai ?? 1,
            user.id
          ]
        );
      } else {
        this.db.run(
          `UPDATE nguoi_dung 
           SET ten_dang_nhap = ?, ho_ten = ?, vai_tro = ?, id_bac_si = ?, trang_thai = ?
           WHERE id = ?`,
          [
            user.ten_dang_nhap,
            user.ho_ten,
            user.vai_tro || 'bac_si',
            user.id_bac_si || null,
            user.trang_thai ?? 1,
            user.id
          ]
        );
      }
      this.persistDatabase();
      this.notify();
      return user.id;
    } else {
      this.db.run(
        `INSERT OR IGNORE INTO nguoi_dung (ten_dang_nhap, mat_khau, ho_ten, vai_tro, id_bac_si, trang_thai)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          user.ten_dang_nhap,
          user.mat_khau || '123456',
          user.ho_ten,
          user.vai_tro || 'bac_si',
          user.id_bac_si || null,
          user.trang_thai ?? 1
        ]
      );
      const idRes = this.db.exec('SELECT last_insert_rowid() as id');
      const newId = Number(idRes[0]?.values[0][0]);
      this.persistDatabase();
      this.notify();
      return newId;
    }
  }

  public runQuery(sql: string): any[] {
    if (!this.db) return [];
    const trimmed = sql.trim();
    if (trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('PRAGMA')) {
      return this.query(sql);
    } else {
      this.db.run(sql);
      this.persistDatabase();
      this.notify();
      return [{ message: 'Command executed successfully', timestamp: new Date().toISOString() }];
    }
  }
}

export const sqliteService = new SqliteService();

