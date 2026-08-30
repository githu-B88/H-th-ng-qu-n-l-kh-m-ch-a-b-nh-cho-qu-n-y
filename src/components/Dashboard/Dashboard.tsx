import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  DollarSign,
  Users,
  Pill,
  Calendar,
  CalendarClock,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Plus,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Phone,
  Building2,
  Clock,
  FileText,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { sqliteService } from '../../db/sqlite-service';

interface DashboardProps {
  onStartExamForPatient?: (patientId: number) => void;
  onNavigateTab?: (tab: string) => void;
  onQuickNewExam?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartExamForPatient,
  onNavigateTab,
  onQuickNewExam
}) => {
  const [period, setPeriod] = useState<'day' | 'month' | 'quarter'>('day');
  const [dashboardData, setDashboardData] = useState(() => sqliteService.getDashboardData('day'));
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString('vi-VN'));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = (selectedPeriod = period) => {
    setIsRefreshing(true);
    setTimeout(() => {
      const data = sqliteService.getDashboardData(selectedPeriod);
      setDashboardData(data);
      setLastRefreshed(new Date().toLocaleTimeString('vi-VN'));
      setIsRefreshing(false);
    }, 150);
  };

  useEffect(() => {
    loadData(period);
    const unsubscribe = sqliteService.subscribe(() => {
      loadData(period);
    });
    return unsubscribe;
  }, [period]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const periodLabel = period === 'day' ? 'Hôm nay' : period === 'month' ? 'Tháng này' : 'Quý này';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Period Control */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                Tổng Quan & Thống Kê Quân Y
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi thời gian thực lượt khám, quân số điều trị, lịch tái khám và cơ số thuốc quân y đơn vị
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              id="dashboard-period-day-btn"
              onClick={() => setPeriod('day')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'day'
                  ? 'bg-white text-sky-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hôm Nay
            </button>
            <button
              id="dashboard-period-month-btn"
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'month'
                  ? 'bg-white text-sky-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tháng Này
            </button>
            <button
              id="dashboard-period-quarter-btn"
              onClick={() => setPeriod('quarter')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'quarter'
                  ? 'bg-white text-sky-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quý Này
            </button>
          </div>

          {/* Refresh Action */}
          <button
            id="dashboard-refresh-btn"
            onClick={() => loadData(period)}
            disabled={isRefreshing}
            title={`Cập nhật lúc ${lastRefreshed}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          {/* Quick Exam CTA */}
          {onQuickNewExam && (
            <button
              id="dashboard-quick-exam-btn"
              onClick={onQuickNewExam}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Bàn Khám Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Summary KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1: Total Visits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Lượt Khám {periodLabel}
            </span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl group-hover:scale-110 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {dashboardData.periodExamsCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">lượt khám</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Hôm nay:</span>
            <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
              {dashboardData.todayExamsCount} ca
            </span>
          </div>
        </div>

        {/* Widget 2: Total Cost / Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tổng Chi Phí ({periodLabel})
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">
              {formatVND(dashboardData.periodTotalCost)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Trung bình/ca:</span>
            <span className="font-bold text-slate-700">
              {dashboardData.periodExamsCount > 0
                ? formatVND(Math.round(dashboardData.periodTotalCost / dashboardData.periodExamsCount))
                : '0 đ'}
            </span>
          </div>
        </div>

        {/* Widget 3: Total Managed Personnel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hồ Sơ Cán Bộ Quản Lý
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {dashboardData.totalPatients}
            </span>
            <span className="text-xs text-slate-500 font-medium">cán bộ / bệnh nhân</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Dữ liệu y bạ:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              100% Nội bộ
            </span>
          </div>
        </div>

        {/* Widget 4: Pharmacy Stock & Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Cơ Số Dược & Vật Tư
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {dashboardData.topLowStockMedicines.filter((m) => m.ton_kho <= 20).length}
            </span>
            <span className="text-xs text-amber-600 font-bold">thuốc sắp hết</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Mức an toàn tối thiểu:</span>
            <span className="font-bold text-slate-700">&le; 20 đơn vị</span>
          </div>
        </div>
      </div>

      {/* 2 Interactive Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Weekly Visit & Prescription Frequency */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                Tần Suất Khám & Kê Đơn Theo Các Ngày Trong Tuần
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Biểu đồ cột theo dõi mật độ tiếp nhận cán bộ đến khám và đơn thuốc phát hành
              </p>
            </div>
            <div className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-lg">
              Tuần hiện tại
            </div>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 space-y-1">
                          <div className="font-bold text-sky-300 border-b border-slate-700 pb-1 mb-1">
                            {label}
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Lượt khám bệnh:</span>
                            <span className="font-bold text-white">{payload[0]?.value} ca</span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Đơn thuốc đã cấp:</span>
                            <span className="font-bold text-teal-300">{payload[1]?.value} toa</span>
                          </div>
                          {payload[0]?.payload?.chiPhi && (
                            <div className="flex justify-between gap-4 text-slate-300 pt-1 border-t border-slate-800">
                              <span>Chi phí ngày:</span>
                              <span className="font-bold text-amber-300">
                                {formatVND(payload[0].payload.chiPhi)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                <Bar name="Số lượt khám" dataKey="luotKham" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar name="Đơn thuốc cấp" dataKey="donThuoc" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: BHYT & Payment Distribution */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Tỷ Lệ Đối Tượng & BHYT
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Phân loại hình thức thanh toán & quyền lợi khám chữa bệnh
            </p>

            <div className="h-50 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.bhytDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dashboardData.bhytDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} lượt (${val}%)`, name]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400 font-semibold">Tỷ lệ BHYT</span>
                <span className="text-lg font-black text-sky-700">80%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {dashboardData.bhytDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate max-w-44">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value} ca</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2 Urgent Alert Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert 1: Patients with Re-examination appointments */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-50 to-blue-50/50 border-b border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-600 text-white rounded-xl shadow-xs">
                <CalendarClock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Lịch Tái Khám Của Cán Bộ
                </h2>
                <p className="text-[11px] text-slate-500">
                  Danh sách bệnh nhân hẹn tái khám hôm nay và sắp tới
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-sky-600 text-white rounded-full text-xs font-bold">
              {dashboardData.reExamPatients.length} cán bộ
            </span>
          </div>

          <div className="p-4 sm:p-5 flex-1 divide-y divide-slate-100">
            {dashboardData.reExamPatients.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Không có lịch hẹn tái khám nào trong danh sách.
              </div>
            ) : (
              dashboardData.reExamPatients.map((item) => (
                <div
                  key={item.id}
                  className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">
                        {item.ten_nhan_su}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-md">
                        {item.ten_co_quan || 'Nội bộ'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span>Chẩn đoán: <strong className="text-slate-700">{item.chan_doan}</strong></span>
                      
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-xs font-bold text-sky-700 flex items-center gap-1 justify-end">
                        <Calendar className="w-3 h-3" />
                        {item.ngay_tai_kham}
                      </div>
                      <div className="text-[10px] text-slate-400">BS: {item.ten_bac_si || 'Bác sĩ trực'}</div>
                    </div>

                    {onStartExamForPatient && (
                      <button
                        onClick={() => onStartExamForPatient(item.id_nhan_su)}
                        title="Mở bàn khám cho bệnh nhân này ngay"
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white rounded-lg text-xs font-bold border border-sky-200 hover:border-sky-600 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>Khám lại</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alert 2: Top 5 Low Stock Medicines */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-rose-50/50 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Cảnh Báo Top 5 Thuốc Sắp Hết Trong Kho
                </h2>
                <p className="text-[11px] text-slate-500">
                  Các loại thuốc có số lượng tồn kho thấp dưới ngưỡng quy định (&le; 20)
                </p>
              </div>
            </div>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('danh_muc')}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
              >
                <span>Nhập kho</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="p-4 sm:p-5 flex-1 divide-y divide-slate-100">
            {dashboardData.topLowStockMedicines.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Kho thuốc đủ số lượng, không có cảnh báo nào.
              </div>
            ) : (
              dashboardData.topLowStockMedicines.map((m) => {
                const isCritical = m.ton_kho <= 10;
                const percent = Math.min(100, Math.round((m.ton_kho / 50) * 100));
                return (
                  <div
                    key={m.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">
                          {m.ten}
                        </span>
                        {m.ham_luong && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.2 rounded">
                            {m.ham_luong}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Đơn giá: <span className="font-medium text-slate-600">{formatVND(m.don_gia)}</span> / {m.don_vi_tinh}
                      </div>
                    </div>

                    <div className="w-32 flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-md ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Tồn: {m.ton_kho} {m.don_vi_tinh}
                        </span>
                      </div>
                      {/* Mini visual inventory bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isCritical ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
