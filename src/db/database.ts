/**
 * DATABASE SERVICE CHUYÊN XỬ LÝ CSDL (TƯƠNG THÍCH ĐA NỀN TẢNG)
 * 
 * Lưu ý môi trường: Vì ứng dụng hiện đang chạy trên nền tảng Web Preview (trình duyệt sandbox),
 * thư viện `@tauri-apps/plugin-sql` hoặc SQLite Native của Node.js sẽ không hoạt động.
 * Vì vậy, service này sử dụng `sql.js` (WebAssembly SQLite) - Một Engine SQLite 100% thực tế 
 * chạy trong trình duyệt và lưu trữ vật lý qua IndexedDB (mô phỏng file `.sqlite`).
 * 
 * KHI BẠN ĐÓNG GÓI RA TAURI (DESKTOP APP):
 * Bạn chỉ cần thay thế phần `this.db.run` thành:
 * import Database from '@tauri-apps/plugin-sql';
 * const db = await Database.load('sqlite:phongkham.sqlite');
 * await db.execute('INSERT INTO ...');
 */

import { sqliteService } from './sqlite-service';

// Export instance đã được thiết kế sẵn (thực thi SQL thuần).
export const database = sqliteService;
export default database;
