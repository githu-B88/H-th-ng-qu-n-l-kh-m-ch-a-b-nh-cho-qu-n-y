import React, { useState } from 'react';
import { Reports } from './Reports';
import { sqliteService } from '../../db/sqlite-service';
import {
  BarChart3,
  TrendingUp,
  Users,
  Pill,
  DollarSign,
  Building,
  Activity,
  FileSpreadsheet
} from 'lucide-react';

export const ClinicReports: React.FC = () => {
  const [viewMode, setViewMode] = useState<'tables' | 'overview'>('tables');
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    setStats(sqliteService.getClinicStatistics());
    const unsub = sqliteService.subscribe(() => {
      setStats(sqliteService.getClinicStatistics());
    });
    return unsub;
  }, []);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* View Switcher Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            onClick={() => setViewMode('tables')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              viewMode === 'tables'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bảng Kê Chi Phí & Quyết Toán Danh Mục</span>
          </button>

          <button
            onClick={() => setViewMode('overview')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              viewMode === 'overview'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Biểu Đồ Mô Hình Bệnh Tật & Cơ Cấu</span>
          </button>
        </div>
      </div>

      {viewMode === 'tables' ? (
        <Reports />
      ) : (
        stats && (
          <div className="space-y-6">
            {/* Top 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Tổng Lượt Khám</div>
                  <div className="text-2xl font-black text-slate-800">{stats.totalExams}</div>
                  <div className="text-[11px] text-sky-600 font-medium mt-0.5">
                    Hồ sơ y bạ lưu trữ
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Cán Bộ Quản Lý</div>
                  <div className="text-2xl font-black text-slate-800">{stats.totalPatients}</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    Cán bộ có thẻ y bạ
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Cơ Số Thuốc</div>
                  <div className="text-2xl font-black text-slate-800">{stats.totalMedicines}</div>
                  <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
                    {stats.lowStockCount > 0 ? `${stats.lowStockCount} loại sắp hết` : 'Kho ổn định'}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Tổng Chi Phí Cấp Phát</div>
                  <div className="text-xl font-black text-slate-800">
                    {formatVND(stats.totalCost)}
                  </div>
                  <div className="text-[11px] text-amber-600 font-medium mt-0.5">
                    Kinh phí thuốc & dịch vụ
                  </div>
                </div>
              </div>
            </div>

            {/* Grid: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Diagnosed Diseases */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                  <span>Mô Hình Bệnh Tật Phổ Biến Trong Cơ Quan</span>
                </div>

                {stats.topDiagnoses && stats.topDiagnoses.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topDiagnoses.map((item: any, idx: number) => {
                      const percentage = Math.round(
                        (item.count / (stats.totalExams || 1)) * 100
                      );
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-800 font-semibold truncate max-w-xs">
                              {idx + 1}. {item.chan_doan}
                            </span>
                            <span className="text-sky-700 font-bold shrink-0 ml-2">
                              {item.count} lượt ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-sky-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(8, percentage)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Chưa có đủ dữ liệu thống kê bệnh tật.
                  </div>
                )}
              </div>

              {/* Top Dispensed Medicines */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>Thuốc Cấp Phát Nhiều Nhất</span>
                </div>

                {stats.topMedicines && stats.topMedicines.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <th className="py-2 px-3">Tên Thuốc</th>
                          <th className="py-2 px-3 text-center">Tổng SL Xuất</th>
                          <th className="py-2 px-3 text-right">Tổng Tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats.topMedicines.map((m: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {idx + 1}. {m.ten_muc}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-700 font-mono">
                              {m.tong_so_luong}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                              {formatVND(m.tong_tien)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Chưa có dữ liệu cấp phát thuốc.
                  </div>
                )}
              </div>
            </div>

            {/* Examinations by Department */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
                <Building className="w-4 h-4 text-sky-600" />
                <span>Thống Kê Khám Bệnh Theo Từng Cơ Quan / Phòng Ban Trực Thuộc</span>
              </div>

              {stats.byDepartment && stats.byDepartment.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="py-3 px-4 font-semibold">Tên Cơ Quan / Phòng Ban</th>
                        <th className="py-3 px-4 font-semibold text-center">Số Lượt Khám</th>
                        <th className="py-3 px-4 font-semibold text-right">Tổng Kinh Phí</th>
                        <th className="py-3 px-4 font-semibold text-center">Tỷ Lệ Lượt Khám</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.byDepartment.map((dept: any, idx: number) => {
                        const pct = Math.round(
                          (dept.so_luot_kham / (stats.totalExams || 1)) * 100
                        );
                        return (
                          <tr key={idx} className="hover:bg-sky-50/40 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-800">
                              {dept.ten_co_quan}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-sky-700 font-mono">
                              {dept.so_luot_kham} lượt
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900">
                              {formatVND(dept.tong_tien)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                {pct}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  Chưa có dữ liệu thống kê theo cơ quan.
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ClinicReports;
