import React, { useState } from 'react';
import { sqliteService } from '../../db/sqlite-service';
import { seedMedicalData } from '../../db/seedMedicalData';
import { clearExamData } from '../../db/clearExamData';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Terminal,
  Play,
  CheckCircle2,
  AlertCircle,
  Table,
  Layers,
  FileCode,
  ShieldAlert,
  Pill,
  RotateCcw,
  Trash2,
  Building2
} from 'lucide-react';

export const DatabaseSettings: React.FC = () => {
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM ho_so_kham ORDER BY id DESC LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [medicalSeedStatus, setMedicalSeedStatus] = useState<string | null>(null);
  const [examClearStatus, setExamClearStatus] = useState<string | null>(null);
  const [donViSeedStatus, setDonViSeedStatus] = useState<string | null>(null);

  const handleExportBinary = () => {
    sqliteService.exportBinaryDatabase();
  };

  const handleExportJSON = () => {
    sqliteService.exportJSONDatabase();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    if (file.name.endsWith('.sqlite') || file.name.endsWith('.db')) {
      reader.onload = async (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer;
          const u8 = new Uint8Array(buffer);
          await sqliteService.importBinaryDatabase(u8);
          setImportStatus('Đã khôi phục cơ sở dữ liệu SQLite thành công!');
        } catch (err: any) {
          setImportStatus(`Lỗi nhập tệp SQLite: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith('.json')) {
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          await sqliteService.importJSONDatabase(text);
          setImportStatus('Đã nạp dữ liệu từ tệp JSON thành công!');
        } catch (err: any) {
          setImportStatus(`Lỗi nhập tệp JSON: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Vui lòng chọn tệp .sqlite, .db hoặc .json');
    }
  };

  const handleClearExamData = () => {
    if (
      window.confirm(
        'XÁC NHẬN DỌN SẠCH DỮ LIỆU KHÁM BỆNH / BẢNG KÊ:\n\n' +
        '• Thao tác này sẽ XÓA TOÀN BỘ các ca khám bệnh và chi tiết bảng kê nháp.\n' +
        '• Bộ đếm ID tự động tăng (sqlite_sequence) sẽ được đưa về 0.\n' +
        '• KHÔNG XÓA: Bảng Cán bộ, Thẻ BHYT, Danh mục Thuốc, Vật tư, Dịch vụ kỹ thuật được giữ an toàn.\n\n' +
        'Bạn có chắc chắn muốn dọn sạch dữ liệu khám bệnh?'
      )
    ) {
      const res = clearExamData();
      if (res.success) {
        setExamClearStatus(res.message);
        setTimeout(() => setExamClearStatus(null), 8000);
      } else {
        alert(res.message);
      }
    }
  };

  const handleSeedMedicalOnly = () => {
    if (
      window.confirm(
        'Thao tác này sẽ xóa dữ liệu cũ và nạp lại toàn bộ 32 loại thuốc, 4 vật tư y tế, 3 dịch vụ kỹ thuật đã chuẩn hóa. Các hồ sơ khám và nhân sự vẫn được giữ nguyên. Bạn có muốn thực hiện?'
      )
    ) {
      const res = seedMedicalData();
      if (res.success) {
        setMedicalSeedStatus(res.message);
        setTimeout(() => setMedicalSeedStatus(null), 6000);
      } else {
        alert(res.message);
      }
    }
  };

  const handleSeedDonViOnly = () => {
    if (
      window.confirm(
        'Thao tác này sẽ chuẩn hóa danh mục Đơn vị cấp 1 đúng 6 đơn vị theo quy định:\n' +
        '1. Phòng Tham mưu Vùng\n' +
        '2. Phòng Chính trị Vùng\n' +
        '3. Phòng Hậu cần-Kỹ thuật Vùng\n' +
        '4. Tiểu đoàn 553\n' +
        '5. Tiểu đoàn 563\n' +
        '6. Tiểu đoàn Phương tiện không người lái\n\n' +
        'Bạn có muốn tiếp tục?'
      )
    ) {
      const res = sqliteService.forceResetAndSeedDonViCap1();
      if (res.success) {
        setDonViSeedStatus(res.message);
        setTimeout(() => setDonViSeedStatus(null), 6000);
      } else {
        alert(res.message);
      }
    }
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        'CẢNH BÁO: Thao tác này sẽ xóa toàn bộ dữ liệu hiện tại và nạp lại toàn bộ dữ liệu mẫu ban đầu (kể cả Bác sĩ, Cán bộ, Danh mục thuốc chuẩn). Bạn có chắc chắn không?'
      )
    ) {
      await sqliteService.resetToSeedData();
      alert('Đã khôi phục dữ liệu mẫu ban đầu thành công!');
      window.location.reload();
    }
  };

  const handleExecuteQuery = () => {
    setQueryError(null);
    try {
      const res = sqliteService.runQuery(sqlQuery);
      setQueryResult(res);
    } catch (err: any) {
      setQueryError(err.message || 'Lỗi cú pháp SQL');
      setQueryResult(null);
    }
  };

  const presets = [
    {
      label: '10 hồ sơ khám mới nhất',
      query: 'SELECT id, ma_ho_so, ngay_kham, chan_doan, tong_chi_phi FROM ho_so_kham ORDER BY id DESC LIMIT 10;'
    },
    {
      label: '6 Đơn vị cấp 1 chuẩn',
      query: 'SELECT id, ten, ghi_chu FROM don_vi_cap_1 ORDER BY id ASC;'
    },
    {
      label: '32 danh mục thuốc chuẩn',
      query: 'SELECT id, ten, ham_luong, don_vi_tinh, don_gia, ton_kho, cach_dung_mac_dinh FROM thuoc ORDER BY id ASC;'
    },
    {
      label: 'Vật tư y tế chuẩn',
      query: 'SELECT id, ten, don_vi_tinh, don_gia, ton_kho, ghi_chu FROM vat_tu ORDER BY id ASC;'
    },
    {
      label: 'Dịch vụ kỹ thuật chuẩn',
      query: 'SELECT id, ten, don_vi_tinh, don_gia, ghi_chu FROM dich_vu_kt ORDER BY id ASC;'
    },
    {
      label: 'Danh sách cán bộ & đơn vị',
      query: 'SELECT c.id, c.ho_ten, c.ma_the_bhyt, c.cap_bac, c.chuc_vu, d2.ten as ten_don_vi FROM can_bo c LEFT JOIN don_vi_cap_2 d2 ON c.id_don_vi_cap_2 = d2.id;'
    },
    {
      label: 'Cấu trúc bảng (PRAGMA)',
      query: "SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;"
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Quản Trị Cơ Sở Dữ Liệu SQLite & Dọn Dẹp / Sao Lưu
            </h3>
            <p className="text-xs text-slate-500">
              Xuất/nhập file .sqlite chạy trực tiếp với Tauri desktop app, dọn dẹp phiếu khám nháp, chuẩn hóa danh mục
            </p>
          </div>
        </div>
      </div>

      {/* Backup & Restore Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Export Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <Download className="w-4 h-4 text-sky-600" />
              <span>Sao Lưu CSDL (Export)</span>
            </div>
            <p className="text-xs text-slate-500">
              Tải về toàn bộ cơ sở dữ liệu dạng file nhị phân chuẩn <code>.sqlite</code> hoặc định dạng <code>.json</code>.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleExportBinary}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Tải Tệp phong_kham.sqlite</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <FileCode className="w-4 h-4" />
              <span>Xuất Tệp JSON Backup</span>
            </button>
          </div>
        </div>

        {/* Import Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Khôi Phục Dữ Liệu (Import)</span>
            </div>
            <p className="text-xs text-slate-500">
              Chọn tệp sao lưu <code>.sqlite</code> hoặc <code>.json</code> đã xuất trước đó để nạp vào hệ thống.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer text-center">
              <Upload className="w-4 h-4" />
              <span>Chọn Tệp SQLite / JSON Để Nạp</span>
              <input
                type="file"
                accept=".sqlite,.db,.json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
            {importStatus && (
              <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100">
                {importStatus}
              </div>
            )}
          </div>
        </div>

        {/* Maintenance & Reset Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Dọn Dẹp & Chuẩn Hóa Dữ Liệu</span>
            </div>
            <p className="text-xs text-slate-500">
              Xóa ca khám nháp, chuẩn hóa 6 Đơn vị cấp 1 hoặc nạp lại danh mục Thuốc/Vật tư.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {/* Button: Xóa dữ liệu khám bệnh nháp */}
            <button
              onClick={handleClearExamData}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Dữ Liệu Khám Bệnh Nháp</span>
            </button>

            {/* Button: Chuẩn hóa 6 Đơn vị cấp 1 */}
            <button
              onClick={handleSeedDonViOnly}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Chuẩn Hóa 6 Đơn Vị Cấp 1</span>
            </button>

            {/* Button: Nạp lại danh mục y tế */}
            <button
              onClick={handleSeedMedicalOnly}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              <span>Nạp Lại Danh Mục Y Tế Chuẩn (32 Thuốc)</span>
            </button>

            {/* Button: Cài lại toàn bộ CSDL mẫu */}
            <button
              onClick={handleResetData}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors"
            >
              <RefreshCw className="w-3 h-3 text-slate-500" />
              <span>Cài Lại Toàn Bộ Dữ Liệu Mẫu Ban Đầu</span>
            </button>

            {examClearStatus && (
              <div className="text-[11px] text-rose-800 bg-rose-50 p-2 rounded border border-rose-200 flex items-start gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span>{examClearStatus}</span>
              </div>
            )}

            {donViSeedStatus && (
              <div className="text-[11px] text-indigo-800 bg-indigo-50 p-2 rounded border border-indigo-200 flex items-start gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>{donViSeedStatus}</span>
              </div>
            )}

            {medicalSeedStatus && (
              <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 flex items-start gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{medicalSeedStatus}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SQL Query Console Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Terminal className="w-4 h-4 text-sky-600" />
            <span>Trình Thực Thi Câu Lệnh SQLite Trực Tiếp (Console)</span>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1 text-[11px]">
            <span className="text-slate-400 font-semibold mr-1">Mẫu nhanh:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSqlQuery(p.query);
                  setActivePreset(p.label);
                }}
                className={`px-2 py-1 rounded border transition-colors ${
                  activePreset === p.label
                    ? 'bg-sky-50 border-sky-300 text-sky-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Query Input Area */}
        <div className="space-y-2">
          <div className="relative">
            <textarea
              rows={3}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="Nhập câu lệnh SQL (SELECT, INSERT, UPDATE, DELETE, PRAGMA)..."
              className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-lg border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleExecuteQuery}
              className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Chạy Câu Lệnh SQL</span>
            </button>
          </div>
        </div>

        {/* Query Error */}
        {queryError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{queryError}</span>
          </div>
        )}

        {/* Query Results Table */}
        {queryResult && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600">
              Kết quả: {queryResult.length} bản ghi
            </div>

            {queryResult.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      {Object.keys(queryResult[0]).map((col) => (
                        <th key={col} className="py-2 px-3 font-bold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {queryResult.map((row, idx) => (
                      <tr key={idx} className="hover:bg-sky-50/40">
                        {Object.values(row).map((val: any, cidx) => (
                          <td key={cidx} className="py-2 px-3 whitespace-nowrap text-slate-800">
                            {val !== null && val !== undefined ? String(val) : 'NULL'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 text-center text-xs text-slate-500 rounded-lg">
                Câu lệnh thực thi thành công (0 bản ghi trả về).
              </div>
            )}
          </div>
        )}
      </div>

      {/* Schema Structure Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
          <Layers className="w-4 h-4 text-sky-600" />
          <span>Sơ Đồ Bảng SQLite Khởi Tạo Cho Tauri / Desktop</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-900">1. don_vi_cap_1 (6 Đơn vị)</div>
            <p className="text-slate-500 text-[11px]">id, ten, ghi_chu</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-900">2. don_vi_cap_2 (Cơ quan/Phòng ban)</div>
            <p className="text-slate-500 text-[11px]">id, id_don_vi_cap_1, ten, ghi_chu</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-900">3. bac_si</div>
            <p className="text-slate-500 text-[11px]">id, ho_ten, the_bhyt, ngay_sinh, gioi_tinh, id_don_vi, chuyen_mon, ghi_chu</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-900">4. can_bo (Bệnh nhân)</div>
            <p className="text-slate-500 text-[11px]">id, ho_ten, ngay_sinh, ma_the_bhyt, gioi_tinh, id_don_vi_cap_2, cap_bac, chuc_vu</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-900">5. thuoc (32 loại chuẩn)</div>
            <p className="text-slate-500 text-[11px]">id, ten, don_vi_tinh, don_gia, ton_kho, ham_luong, cach_dung_mac_dinh</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-900">6. vat_tu (4 loại chuẩn)</div>
            <p className="text-slate-500 text-[11px]">id, ten, don_vi_tinh, don_gia, ton_kho, ghi_chu</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-900">7. dich_vu_kt (3 loại chuẩn)</div>
            <p className="text-slate-500 text-[11px]">id, ten, don_vi_tinh, don_gia, ghi_chu</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-900">8. mau_benh & chi tiết</div>
            <p className="text-slate-500 text-[11px]">id, ten_benh, chan_doan_chuan, loi_dan_mac_dinh</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-900">9. ho_so_kham</div>
            <p className="text-slate-500 text-[11px]">id, ma_ho_so, id_nhan_su, id_bac_si, ngay_kham, chan_doan, trieu_chung, huyet_ap, mach, nhiet_do, tong_chi_phi</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-900">10. ho_so_kham_chi_tiet</div>
            <p className="text-slate-500 text-[11px]">id, id_ho_so, loai_muc, id_muc, ten_muc, so_luong, don_gia, thanh_tien, cach_dung</p>
          </div>
        </div>
      </div>
    </div>
  );
};
