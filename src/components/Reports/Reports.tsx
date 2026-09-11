import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Filter,
  Search,
  Download,
  Printer,
  RefreshCw,
  Building,
  Building2,
  Shield,
  User,
  Pill,
  Stethoscope,
  Syringe,
  DollarSign,
  TrendingUp,
  Activity,
  Layers,
  ChevronDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { sqliteService } from '../../db/sqlite-service';
import { CoQuan, DonViCap1, DonViCap2 } from '../../types';

type TimeframeType = 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';
type TabType = 'chi_phi_can_bo' | 'thanh_toan_danh_muc';
type LoaiMucFilter = 'all' | 'thuoc' | 'vat_tu' | 'dich_vu_kt';

export const Reports: React.FC = () => {
  // Tab control
  const [activeTab, setActiveTab] = useState<TabType>('chi_phi_can_bo');

  // Timeframe and date filters
  const [timeframe, setTimeframe] = useState<TimeframeType>('month');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Search & secondary filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDonViCap1Id, setSelectedDonViCap1Id] = useState<string>('all');
  const [selectedDonViCap2Id, setSelectedDonViCap2Id] = useState<string>('all');
  const [selectedLoaiMuc, setSelectedLoaiMuc] = useState<LoaiMucFilter>('all');

  // Master data
  const [donViCap1List, setDonViCap1List] = useState<DonViCap1[]>([]);
  const [donViCap2List, setDonViCap2List] = useState<DonViCap2[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Raw data from SQLite
  const [rawExamsData, setRawExamsData] = useState<any[]>([]);
  const [rawItemsData, setRawItemsData] = useState<any[]>([]);

  // Calculate start and end dates based on timeframe preset
  const calculateDateRange = (preset: TimeframeType) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'all') {
      return { start: '', end: '' };
    }

    if (preset === 'week') {
      // Monday of this week
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      return {
        start: monday.toISOString().split('T')[0],
        end: todayStr
      };
    }

    if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: firstDay.toISOString().split('T')[0],
        end: todayStr
      };
    }

    if (preset === 'quarter') {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      const firstDay = new Date(now.getFullYear(), quarterMonth, 1);
      return {
        start: firstDay.toISOString().split('T')[0],
        end: todayStr
      };
    }

    if (preset === 'year') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      return {
        start: firstDay.toISOString().split('T')[0],
        end: todayStr
      };
    }

    return { start: fromDate, end: toDate };
  };

  // Set default timeframe date range on mount or preset change
  useEffect(() => {
    if (timeframe !== 'custom') {
      const range = calculateDateRange(timeframe);
      setFromDate(range.start);
      setToDate(range.end);
    }
  }, [timeframe]);

  // Load master data (Đơn vị cấp 1 & Cấp 2)
  useEffect(() => {
    try {
      setDonViCap1List((sqliteService as any).getDonViCap1List() || []);
      setDonViCap2List((sqliteService as any).getDonViCap2List() || []);
    } catch (e) {
      console.error('Error loading don vi lists:', e);
    }
  }, []);

  // Fetch report data from SQLite
  const loadReportData = () => {
    setIsRefreshing(true);
    try {
      // 1. Load exams for Part 1
      const exams = sqliteService.getBaoCaoChiPhiKhamBenh({
        tuNgay: fromDate || undefined,
        denNgay: toDate || undefined,
        idDonViCap1: selectedDonViCap1Id !== 'all' ? Number(selectedDonViCap1Id) : undefined,
        idDonVi: selectedDonViCap2Id !== 'all' ? Number(selectedDonViCap2Id) : undefined,
        search: searchTerm.trim() || undefined
      });
      setRawExamsData(exams);

      // 2. Load item usage for Part 2
      const items = sqliteService.getBaoCaoChiTietDanhMucRaw({
        tuNgay: fromDate || undefined,
        denNgay: toDate || undefined
      });
      setRawItemsData(items);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 200);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [fromDate, toDate, selectedDonViCap1Id, selectedDonViCap2Id, searchTerm, refreshTrigger]);

  // Listen to SQLite database changes
  useEffect(() => {
    const unsub = sqliteService.subscribe(() => {
      setRefreshTrigger((prev) => prev + 1);
    });
    return unsub;
  }, []);

  // Format currency VND
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // ==========================================
  // PART 1: BẢNG KÊ CHI PHÍ KHÁM CÁN BỘ
  // ==========================================
  const totalCostExams = useMemo(() => {
    return rawExamsData.reduce((acc, curr) => acc + (curr.tong_chi_phi || 0), 0);
  }, [rawExamsData]);

  // ==========================================
  // PART 2: GOM NHÓM DANH MỤC THUỐC / VẬT TƯ / DỊCH VỤ KT (GROUP BY LOGIC)
  // ==========================================
  const groupedItems = useMemo(() => {
    // 1. Filter items by search term and selected category
    let filtered = rawItemsData;

    if (selectedLoaiMuc !== 'all') {
      filtered = filtered.filter((it) => it.loai_muc === selectedLoaiMuc);
    }

    if (searchTerm.trim()) {
      const s = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (it) =>
          it.ten_muc.toLowerCase().includes(s) ||
          (it.ten_nhan_su && it.ten_nhan_su.toLowerCase().includes(s)) ||
          (it.ten_don_vi && it.ten_don_vi.toLowerCase().includes(s))
      );
    }

    // 2. Group by: `loai_muc` + `id_muc` + `ten_muc` + `don_gia`
    const groupMap = new Map<string, {
      loai_muc: string;
      id_muc: number;
      ten_muc: string;
      don_vi_tinh: string;
      don_gia: number;
      tong_so_luong: number;
      tong_thanh_tien: number;
      so_luot_dung: number;
    }>();

    filtered.forEach((item) => {
      const key = `${item.loai_muc}_${item.id_muc}_${item.ten_muc}_${item.don_gia}`;
      const existing = groupMap.get(key);

      if (existing) {
        existing.tong_so_luong += item.so_luong || 0;
        existing.tong_thanh_tien += item.thanh_tien || (item.so_luong * item.don_gia) || 0;
        existing.so_luot_dung += 1;
      } else {
        groupMap.set(key, {
          loai_muc: item.loai_muc,
          id_muc: item.id_muc,
          ten_muc: item.ten_muc,
          don_vi_tinh: item.don_vi_tinh || 'Lượt',
          don_gia: item.don_gia || 0,
          tong_so_luong: item.so_luong || 0,
          tong_thanh_tien: item.thanh_tien || (item.so_luong * item.don_gia) || 0,
          so_luot_dung: 1
        });
      }
    });

    // Convert to array and sort by category and total amount descending
    const result = Array.from(groupMap.values());
    result.sort((a, b) => {
      if (a.loai_muc !== b.loai_muc) {
        const order: Record<string, number> = { thuoc: 1, vat_tu: 2, dich_vu_kt: 3 };
        return (order[a.loai_muc] || 99) - (order[b.loai_muc] || 99);
      }
      return b.tong_thanh_tien - a.tong_thanh_tien;
    });

    return result;
  }, [rawItemsData, selectedLoaiMuc, searchTerm]);

  // Aggregate totals for Part 2
  const statsPart2 = useMemo(() => {
    let totalAll = 0;
    let totalThuoc = 0;
    let totalVatTu = 0;
    let totalDichVu = 0;
    let countThuoc = 0;
    let countVatTu = 0;
    let countDichVu = 0;

    groupedItems.forEach((item) => {
      totalAll += item.tong_thanh_tien;
      if (item.loai_muc === 'thuoc') {
        totalThuoc += item.tong_thanh_tien;
        countThuoc++;
      } else if (item.loai_muc === 'vat_tu') {
        totalVatTu += item.tong_thanh_tien;
        countVatTu++;
      } else if (item.loai_muc === 'dich_vu_kt') {
        totalDichVu += item.tong_thanh_tien;
        countDichVu++;
      }
    });

    return {
      totalAll,
      totalThuoc,
      totalVatTu,
      totalDichVu,
      countThuoc,
      countVatTu,
      countDichVu
    };
  }, [groupedItems]);

  // Export CSV Helper (With UTF-8 BOM and full officer/patient information)
  const handleExportCSV = () => {
    const BOM = '\uFEFF';
    let csvString = '';

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      const cleanVal = String(val).replace(/"/g, '""');
      return `"${cleanVal}"`;
    };

    if (activeTab === 'chi_phi_can_bo') {
      const headers = [
        'STT',
        'Tên bệnh nhân',
        'Đơn vị',
        'Thẻ bảo hiểm',
        'Ngày khám',
        'Chẩn đoán',
        'Ghi chú'
      ];
      csvString += headers.map(escapeCSV).join(',') + '\r\n';

      rawExamsData.forEach((row, idx) => {
        const theBHYT = row.ma_the_bhyt || '';
        const chanDoan = row.chan_doan || '';
        const donVi = row.ten_don_vi_cap_1 || '';
        
        let formattedDate = row.ngay_kham || '';
        if (formattedDate.includes('-')) {
          const parts = formattedDate.split('-');
          if (parts.length === 3) {
            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }

        const lineData = [
          idx + 1,
          row.ten_nhan_su || '',
          donVi,
          theBHYT,
          formattedDate,
          chanDoan,
          '' // Ghi chú mặc định trống
        ];

        csvString += lineData.map(escapeCSV).join(',') + '\r\n';
      });
    } else {
      const headers = [
        'STT',
        'Tên Danh Mục Y Tế',
        'Phân Loại',
        'Đơn Vị Tính',
        'Số Lượng Đã Dùng',
        'Đơn Giá (VND)',
        'Thành Tiền (VND)',
        'Tỷ Trọng (%)'
      ];
      csvString += headers.map(escapeCSV).join(',') + '\r\n';

      groupedItems.forEach((row, idx) => {
        const loaiLabel =
          row.loai_muc === 'thuoc'
            ? 'Thuốc tân dược'
            : row.loai_muc === 'vat_tu'
            ? 'Vật tư y tế'
            : 'Dịch vụ kỹ thuật';
        const percentage =
          statsPart2.totalAll > 0
            ? Math.round((row.tong_thanh_tien / statsPart2.totalAll) * 100)
            : 0;

        const lineData = [
          idx + 1,
          row.ten_muc || '',
          loaiLabel,
          row.don_vi_tinh || '',
          row.tong_so_luong || 0,
          row.don_gia || 0,
          row.tong_thanh_tien || 0,
          `${percentage}%`
        ];
        csvString += lineData.map(escapeCSV).join(',') + '\r\n';
      });

      const summaryLine = [
        'TỔNG CỘNG',
        '',
        `${groupedItems.length} danh mục`,
        '',
        '',
        '',
        statsPart2.totalAll,
        '100%'
      ];
      csvString += summaryLine.map(escapeCSV).join(',') + '\r\n';
    }

    const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName =
      activeTab === 'chi_phi_can_bo'
        ? `Bao_Cao_Chi_Phi_Kham_Can_Bo_${dateStr}.csv`
        : `Bao_Cao_Thanh_Toan_Thuoc_Vat_Tu_${dateStr}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const timeframeLabels: Record<TimeframeType, string> = {
    week: 'Tuần Này',
    month: 'Tháng Này',
    quarter: 'Quý Này',
    year: 'Năm Nay',
    all: 'Tất Cả Thời Gian',
    custom: 'Tùy Chọn Ngày'
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Báo Cáo Thống Kê & Thanh Quyết Toán Y Tế
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Bảng kê chi phí khám chữa bệnh của cán bộ và thanh toán thuốc, vật tư y tế tiêu hao nội bộ
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            title="Tải lại dữ liệu mới nhất"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
            <span>Làm Mới</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-emerald-600/20 transition-all cursor-pointer"
            title="Xuất bảng kê ra file CSV (UTF-8 Excel)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sky-600/20 transition-all cursor-pointer"
            title="In biểu mẫu báo cáo thống kê"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap sm:flex-nowrap gap-1">
        <button
          onClick={() => setActiveTab('chi_phi_can_bo')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'chi_phi_can_bo'
              ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>PHẦN 1: BẢNG KÊ CHI PHÍ KHÁM CHỮA BỆNH CỦA CÁN BỘ</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'chi_phi_can_bo'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {rawExamsData.length} ca
          </span>
        </button>

        <button
          onClick={() => setActiveTab('thanh_toan_danh_muc')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'thanh_toan_danh_muc'
              ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>PHẦN 2: BÁO CÁO THANH TOÁN THUỐC, VẬT TƯ & DỊCH VỤ KT</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'thanh_toan_danh_muc'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {groupedItems.length} mục
          </span>
        </button>
      </div>

      {/* Unified Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Preset Buttons for Timeframe */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>Khoảng Thời Gian Báo Cáo</span>
            </label>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              {(['week', 'month', 'quarter', 'year', 'all'] as TimeframeType[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    timeframe === tf
                      ? 'bg-white text-sky-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf === 'week'
                    ? 'Tuần'
                    : tf === 'month'
                    ? 'Tháng'
                    : tf === 'quarter'
                    ? 'Quý'
                    : tf === 'year'
                    ? 'Năm'
                    : 'Tất cả'}
                </button>
              ))}
            </div>
          </div>

          {/* Date range pickers */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Từ Ngày:
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setTimeframe('custom');
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Đến Ngày:
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setTimeframe('custom');
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={
                activeTab === 'chi_phi_can_bo'
                  ? 'Tìm tên cán bộ, mã hồ sơ, chẩn đoán...'
                  : 'Tìm tên thuốc, vật tư, dịch vụ kỹ thuật...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Department filter (Only in Tab 1) */}
          {activeTab === 'chi_phi_can_bo' && (
            <>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedDonViCap1Id}
                  onChange={(e) => {
                    setSelectedDonViCap1Id(e.target.value);
                    setSelectedDonViCap2Id('all');
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                >
                  <option value="all">-- Tất cả Đơn vị cấp 1 --</option>
                  {donViCap1List.map((d1) => (
                    <option key={d1.id} value={d1.id}>
                      {d1.ten}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedDonViCap2Id}
                  onChange={(e) => setSelectedDonViCap2Id(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                >
                  <option value="all">-- Tất cả Đơn vị cấp 2 --</option>
                  {(selectedDonViCap1Id !== 'all'
                    ? donViCap2List.filter((d) => d.id_don_vi_cap_1 === Number(selectedDonViCap1Id))
                    : donViCap2List
                  ).map((d2) => (
                    <option key={d2.id} value={d2.id}>
                      {d2.ten}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Category Filter (Only in Tab 2) */}
          {activeTab === 'thanh_toan_danh_muc' && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedLoaiMuc}
                onChange={(e) => setSelectedLoaiMuc(e.target.value as LoaiMucFilter)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              >
                <option value="all">-- Tất cả phân loại danh mục --</option>
                <option value="thuoc">Thuốc tân dược</option>
                <option value="vat_tu">Vật tư y tế tiêu hao</option>
                <option value="dich_vu_kt">Dịch vụ kỹ thuật</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end text-xs text-slate-500 font-medium sm:col-span-2 lg:col-span-1">
            <span>
              Bộ lọc: <strong className="text-slate-800">{timeframeLabels[timeframe]}</strong>
              {fromDate && toDate ? ` (${fromDate} → ${toDate})` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHẦN 1: BẢNG KÊ CHI PHÍ KHÁM CHỮA BỆNH CỦA CÁN BỘ                         */}
      {/* ========================================================================= */}
      {activeTab === 'chi_phi_can_bo' && (
        <div className="space-y-4">
          {/* Summary KPI Cards for Tab 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tổng Số Lượt Khám
                </span>
                <div className="mt-1 text-2xl font-black text-slate-800">
                  {rawExamsData.length}
                </div>
                <div className="text-[11px] text-sky-600 font-semibold mt-0.5">
                  Lượt cán bộ đến khám
                </div>
              </div>
              <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tổng Chi Phí KCB
                </span>
                <div className="mt-1 text-2xl font-black text-emerald-700">
                  {formatVND(totalCostExams)}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  Kinh phí cấp phát thực tế
                </div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Chi Phí Trung Bình / Lượt
                </span>
                <div className="mt-1 text-2xl font-black text-indigo-700">
                  {formatVND(
                    rawExamsData.length > 0
                      ? Math.round(totalCostExams / rawExamsData.length)
                      : 0
                  )}
                </div>
                <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                  Bình quân một ca khám
                </div>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Main Table for Part 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-600" />
                  Bảng Kê Chi Tiết Chi Phí Khám Bệnh Của Quân Nhân
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dữ liệu trích xuất từ bảng <code className="text-sky-700 font-mono">ho_so_kham</code> kết hợp với bảng <code className="text-sky-700 font-mono">can_bo</code> và cơ cấu <code className="text-sky-700 font-mono">don_vi_cap_1 / don_vi_cap_2</code>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 uppercase font-bold border-b border-slate-200 text-[11px]">
                    <th className="py-3 px-3 text-center w-12">STT</th>
                    <th className="py-3 px-3 w-28">Mã Hồ Sơ</th>
                    <th className="py-3 px-4">Họ Tên Cán Bộ</th>
                    <th className="py-3 px-4">Đơn Vị Trực Thuộc (Cấp 2)</th>
                    <th className="py-3 px-3 text-center w-28">Ngày Khám</th>
                    <th className="py-3 px-4">Chẩn Đoán Bệnh</th>
                    <th className="py-3 px-3 w-32">Bác Sĩ Khám</th>
                    <th className="py-3 px-4 text-right w-36">Tổng Chi Phí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rawExamsData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="w-6 h-6 text-slate-300" />
                          <span className="text-xs">
                            Không có hồ sơ khám bệnh nào trong khoảng thời gian hoặc điều kiện lọc này.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      // Group by Level 1 Unit (Đơn vị cấp 1)
                      const grouped = rawExamsData.reduce((acc, row) => {
                        const donViCap1 = row.ten_don_vi_cap_1 || 'Khối Cơ quan / Chưa phân bổ';
                        if (!acc[donViCap1]) acc[donViCap1] = [];
                        acc[donViCap1].push(row);
                        return acc;
                      }, {} as Record<string, typeof rawExamsData>);
                      
                      let globalIdx = 1;
                      return Object.entries(grouped).map(([donViCap1, rows]) => {
                        const subTotal = (rows as typeof rawExamsData).reduce(
                          (sum, r) => sum + (r.tong_chi_phi || 0),
                          0
                        );
                        return (
                          <React.Fragment key={donViCap1}>
                            <tr className="bg-sky-50/70 border-y border-sky-200">
                              <td colSpan={8} className="py-2.5 px-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-sky-700" />
                                    <span className="font-bold text-sky-950 text-xs uppercase tracking-wide">
                                      {donViCap1}
                                    </span>
                                    <span className="text-[10px] font-semibold text-sky-800 bg-white px-2.5 py-0.5 rounded-full border border-sky-200 shadow-2xs">
                                      {(rows as typeof rawExamsData).length} lượt khám
                                    </span>
                                  </div>
                                  <div className="text-xs font-semibold text-slate-700">
                                    Tổng chi phí: <span className="font-mono font-bold text-emerald-700">{formatVND(subTotal)}</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                            {(rows as typeof rawExamsData).map((row) => {
                              const currentIdx = globalIdx++;
                              return (
                                <tr
                                  key={row.id}
                                  className="hover:bg-sky-50/40 transition-colors group"
                                >
                                  <td className="py-3 px-3 text-center text-slate-400 font-semibold font-mono">
                                    {currentIdx}
                                  </td>
                                  <td className="py-3 px-3 font-mono font-bold text-sky-700">
                                    {row.ma_ho_so}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-slate-800 text-xs">
                                      {row.ten_nhan_su}
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                      {[row.cap_bac_nhan_su, row.chuc_vu_nhan_su].filter(Boolean).length > 0 && (
                                        <span className="text-slate-600 font-medium">
                                          {[row.cap_bac_nhan_su, row.chuc_vu_nhan_su].filter(Boolean).join(' - ')}
                                        </span>
                                      )}
                                      {row.gioi_tinh_nhan_su && (
                                        <>
                                          <span>•</span>
                                          <span>{row.gioi_tinh_nhan_su}</span>
                                        </>
                                      )}
                                      {row.ma_the_bhyt && (
                                        <>
                                          <span>•</span>
                                          <span className="font-mono text-slate-600">
                                            BHYT: {row.ma_the_bhyt}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                                      {row.ten_don_vi_cap_2 || row.ten_don_vi || '---'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-center font-mono text-slate-600 font-medium">
                                    {row.ngay_kham}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="font-semibold text-slate-800">
                                      {row.chan_doan}
                                    </div>
                                    {row.trieu_chung && (
                                      <div className="text-[10px] text-slate-400 truncate max-w-xs">
                                        TC: {row.trieu_chung}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-slate-600 font-medium">
                                    {row.ten_bac_si}
                                  </td>
                                  <td className="py-3 px-4 text-right font-black text-emerald-700 font-mono text-xs">
                                    {formatVND(row.tong_chi_phi)}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      });
                    })()
                  )}
                </tbody>
                {/* DÒNG TỔNG CỘNG Ở CUỐI BẢNG */}
                {rawExamsData.length > 0 && (
                  <tfoot className="bg-sky-50/80 border-t-2 border-sky-200 text-xs font-bold text-slate-800">
                    <tr>
                      <td colSpan={3} className="py-3.5 px-4 uppercase text-slate-700 tracking-wider">
                        TỔNG CỘNG TOÀN BỘ ({rawExamsData.length} LƯỢT KHÁM):
                      </td>
                      <td colSpan={4} className="py-3.5 px-4 text-right text-slate-600 font-medium">
                        Tổng giá trị thanh toán thuốc & kỹ thuật:
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-sm text-emerald-800 font-mono">
                        {formatVND(totalCostExams)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHẦN 2: BÁO CÁO THANH TOÁN THUỐC, VẬT TƯ & DỊCH VỤ KT (GROUPED)          */}
      {/* ========================================================================= */}
      {activeTab === 'thanh_toan_danh_muc' && (
        <div className="space-y-4">
          {/* Summary KPI Cards for Tab 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Tổng Kinh Phí Cấp Phát
                </span>
                <div className="mt-1 text-xl font-black text-emerald-700">
                  {formatVND(statsPart2.totalAll)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {groupedItems.length} danh mục đã dùng
                </div>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Thuốc Tân Dược
                </span>
                <div className="mt-1 text-xl font-black text-sky-700">
                  {formatVND(statsPart2.totalThuoc)}
                </div>
                <div className="text-[10px] text-sky-600 font-semibold mt-0.5">
                  {statsPart2.countThuoc} loại thuốc
                </div>
              </div>
              <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
                <Pill className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Vật Tư Y Tế Tiêu Hao
                </span>
                <div className="mt-1 text-xl font-black text-amber-700">
                  {formatVND(statsPart2.totalVatTu)}
                </div>
                <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                  {statsPart2.countVatTu} loại vật tư
                </div>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Syringe className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Dịch Vụ Kỹ Thuật
                </span>
                <div className="mt-1 text-xl font-black text-indigo-700">
                  {formatVND(statsPart2.totalDichVu)}
                </div>
                <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                  {statsPart2.countDichVu} loại dịch vụ
                </div>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Stethoscope className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Main Table for Part 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-600" />
                  Bảng Tổng Hợp Tiêu Hao & Thanh Toán Thuốc, Vật Tư, Dịch Vụ Kỹ Thuật
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đã tự động gom nhóm (Group By) và tính tổng số lượng cùng thành tiền trong kỳ báo cáo
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Tổng số mục:</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                  {groupedItems.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 uppercase font-bold border-b border-slate-200 text-[11px]">
                    <th className="py-3 px-3 text-center w-12">STT</th>
                    <th className="py-3 px-4">Tên Danh Mục Y Tế</th>
                    <th className="py-3 px-3 text-center w-36">Phân Loại</th>
                    <th className="py-3 px-3 text-center w-24">ĐVT</th>
                    <th className="py-3 px-3 text-center w-28">Số Lượng Đã Dùng</th>
                    <th className="py-3 px-4 text-right w-32">Đơn Giá</th>
                    <th className="py-3 px-4 text-right w-36">Thành Tiền</th>
                    <th className="py-3 px-3 text-center w-24">Tỷ Trọng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groupedItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="w-6 h-6 text-slate-300" />
                          <span className="text-xs">
                            Không có dữ liệu thuốc, vật tư hoặc dịch vụ nào trong kỳ báo cáo này.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    groupedItems.map((item, idx) => {
                      const percentage =
                        statsPart2.totalAll > 0
                          ? Math.round((item.tong_thanh_tien / statsPart2.totalAll) * 100)
                          : 0;

                      return (
                        <tr
                          key={idx}
                          className="hover:bg-sky-50/40 transition-colors group"
                        >
                          <td className="py-3 px-3 text-center text-slate-400 font-semibold font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800 text-xs">
                              {item.ten_muc}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Xuất trong {item.so_luot_dung} đơn thuốc / chỉ định
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {item.loai_muc === 'thuoc' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                                <Pill className="w-3 h-3" />
                                <span>Thuốc tân dược</span>
                              </span>
                            )}
                            {item.loai_muc === 'vat_tu' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Syringe className="w-3 h-3" />
                                <span>Vật tư y tế</span>
                              </span>
                            )}
                            {item.loai_muc === 'dich_vu_kt' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <Stethoscope className="w-3 h-3" />
                                <span>Dịch vụ KT</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-medium text-slate-600">
                            {item.don_vi_tinh}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-black text-sky-700 text-xs bg-slate-50/60 rounded-md">
                            {item.tong_so_luong.toLocaleString('vi-VN')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-600 font-medium">
                            {formatVND(item.don_gia)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-xs">
                            {formatVND(item.tong_thanh_tien)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-block px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700">
                              {percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {/* DÒNG TỔNG CỘNG Ở CUỐI BẢNG */}
                {groupedItems.length > 0 && (
                  <tfoot className="bg-sky-50/80 border-t-2 border-sky-200 text-xs font-bold text-slate-800">
                    <tr>
                      <td colSpan={3} className="py-3.5 px-4 uppercase text-slate-700 tracking-wider">
                        TỔNG CỘNG KINH PHÍ TIÊU HAO:
                      </td>
                      <td colSpan={3} className="py-3.5 px-4 text-right text-slate-600 font-medium">
                        Tổng thanh toán thuốc, vật tư & dịch vụ:
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-sm text-emerald-800 font-mono">
                        {formatVND(statsPart2.totalAll)}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-700 font-mono">
                        100%
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KHU VỰC IN BÁO CÁO CHUẨN A4 NGANG (PRINT AREA FOR WINDOW.PRINT())        */}
      {/* ========================================================================= */}
      <div
        id="print-area"
        className="hidden print:block text-black font-serif text-[11pt] leading-normal w-full bg-white p-0 m-0"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        <style>{`
          @page {
            size: A4 landscape;
            margin: 2cm 1.5cm 2cm 3cm; /* Căn lề: Top 2cm, Right 1.5cm, Bottom 2cm, Left 3cm */
            @top-center {
              content: counter(page);
              font-size: 11pt;
              font-family: "Times New Roman", serif;
            }
          }
          @page :first {
            @top-center {
              content: "";
            }
          }
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body * {
              visibility: hidden !important;
            }
            #print-area, #print-area * {
              visibility: visible !important;
            }
            #print-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              display: block !important;
              font-family: 'Times New Roman', Times, serif !important;
            }
            .print-table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin-top: 10px !important;
            }
            .print-table th, .print-table td {
              border: 1px solid #000000 !important;
              padding: 4px 6px !important;
              font-size: 10pt !important;
            }
            .print-table th {
              background-color: #f8fafc !important;
              font-weight: bold !important;
              text-align: center !important;
            }
          }
        `}</style>

        {/* Header Quốc hiệu / Đơn vị */}
        <div className="flex justify-between items-start mb-3">
          <div className="text-center w-[250px]" style={{ fontSize: '13pt' }}>
            <div className="font-normal uppercase tracking-wide">BTL VÙNG 5 HQ</div>
            <div className="font-bold uppercase tracking-wide">PHÒNG THAM MƯU</div>
            <div
              className="w-[110px] border-b-[1.25px] border-black mx-auto relative -top-[3px]"
              style={{ marginTop: '2px' }}
            ></div>
          </div>

          <div
            className="text-right"
            style={{ fontFamily: "'Times New Roman', serif", fontSize: '11px' }}
          >
            <div>Mẫu số 08: Bảng kê chi phí KCB theo ngày</div>
          </div>
        </div>

        {/* Tiêu đề Báo Cáo */}
        <div className="text-center my-3 w-full">
          <h1
            className="font-bold uppercase leading-snug whitespace-nowrap"
            style={{ fontSize: '14pt', whiteSpace: 'nowrap' }}
          >
            {activeTab === 'chi_phi_can_bo'
              ? 'BẢNG KÊ CHI PHÍ KHÁM BỆNH, CHỮA BỆNH CỦA CÁN BỘ QUÂN NHÂN'
              : 'BÁO CÁO THANH TOÁN THUỐC, VẬT TƯ & DỊCH VỤ KỸ THUẬT'}
          </h1>
          <div className="text-[11pt] italic mt-1 font-serif">
            {fromDate || toDate
              ? `(Thời gian báo cáo: ${fromDate ? 'Từ ' + fromDate : ''} ${toDate ? 'đến ' + toDate : ''})`
              : '(Tất cả thời gian)'}
          </div>
        </div>

        {/* Bảng In - Phần 1: Chi phí cán bộ */}
        {activeTab === 'chi_phi_can_bo' ? (
          <table className="print-table w-full text-left">
            <thead>
              <tr>
                <th className="w-8 text-center">STT</th>
                <th className="w-20 text-center">Mã HS</th>
                <th className="w-20 text-center">Mã CB</th>
                <th>Họ Và Tên Cán Bộ</th>
                <th className="w-20 text-center">Ngày Sinh</th>
                <th className="w-14 text-center">Giới Tính</th>
                <th className="w-28 text-center">Mã Thẻ BHYT</th>
                <th className="w-28">Cấp Bậc - Chức Vụ</th>
                <th>Đơn Vị Trực Thuộc</th>
                <th className="w-20 text-center">Ngày Khám</th>
                <th>Chẩn Đoán Bệnh</th>
                <th className="w-28">Bác Sĩ</th>
                <th className="w-28 text-right">Tổng Chi Phí</th>
              </tr>
            </thead>
            <tbody>
              {rawExamsData.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-4 italic">
                    Không có dữ liệu trong kỳ báo cáo.
                  </td>
                </tr>
              ) : (
                rawExamsData.map((row, idx) => (
                  <tr key={row.id || idx}>
                    <td className="text-center font-mono">{idx + 1}</td>
                    <td className="text-center font-mono font-bold">{row.ma_ho_so}</td>
                    <td className="text-center font-mono">{row.id_nhan_su ? `CB-${String(row.id_nhan_su).padStart(4, '0')}` : '---'}</td>
                    <td className="font-bold">{row.ten_nhan_su}</td>
                    <td className="text-center font-mono">{row.ngay_sinh_nhan_su || row.ngay_sinh || '---'}</td>
                    <td className="text-center">{row.gioi_tinh_nhan_su || row.gioi_tinh || '---'}</td>
                    <td className="text-center font-mono">{row.ma_the_bhyt || '---'}</td>
                    <td>{[row.cap_bac_nhan_su, row.chuc_vu_nhan_su].filter(Boolean).join(' - ') || '---'}</td>
                    <td>{row.ten_don_vi_cap_2 || row.ten_don_vi || '---'}</td>
                    <td className="text-center font-mono">{row.ngay_kham}</td>
                    <td>{row.chan_doan}</td>
                    <td>{row.ten_bac_si}</td>
                    <td className="text-right font-bold font-mono">{formatVND(row.tong_chi_phi)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {rawExamsData.length > 0 && (
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={12} className="text-right uppercase py-2">TỔNG CỘNG ({rawExamsData.length} lượt khám):</td>
                  <td className="text-right font-mono text-base py-2">{formatVND(totalCostExams)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        ) : (
          /* Bảng In - Phần 2: Thanh toán danh mục */
          <table className="print-table w-full text-left">
            <thead>
              <tr>
                <th className="w-10 text-center">STT</th>
                <th>Tên Danh Mục Y Tế</th>
                <th className="w-32 text-center">Phân Loại</th>
                <th className="w-20 text-center">ĐVT</th>
                <th className="w-24 text-center">Số Lượng</th>
                <th className="w-28 text-right">Đơn Giá</th>
                <th className="w-32 text-right">Thành Tiền</th>
                <th className="w-20 text-center">Tỷ Trọng</th>
              </tr>
            </thead>
            <tbody>
              {groupedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 italic">
                    Không có dữ liệu danh mục trong kỳ báo cáo.
                  </td>
                </tr>
              ) : (
                groupedItems.map((item, idx) => {
                  const percentage =
                    statsPart2.totalAll > 0
                      ? Math.round((item.tong_thanh_tien / statsPart2.totalAll) * 100)
                      : 0;
                  const loaiLabel =
                    item.loai_muc === 'thuoc'
                      ? 'Thuốc tân dược'
                      : item.loai_muc === 'vat_tu'
                      ? 'Vật tư y tế'
                      : 'Dịch vụ kỹ thuật';
                  return (
                    <tr key={idx}>
                      <td className="text-center font-mono">{idx + 1}</td>
                      <td className="font-bold">{item.ten_muc}</td>
                      <td className="text-center">{loaiLabel}</td>
                      <td className="text-center">{item.don_vi_tinh}</td>
                      <td className="text-center font-mono font-bold">{item.tong_so_luong.toLocaleString('vi-VN')}</td>
                      <td className="text-right font-mono">{formatVND(item.don_gia)}</td>
                      <td className="text-right font-mono font-bold">{formatVND(item.tong_thanh_tien)}</td>
                      <td className="text-center font-mono">{percentage}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {groupedItems.length > 0 && (
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={6} className="text-right uppercase py-2">TỔNG CỘNG:</td>
                  <td className="text-right font-mono text-base py-2">{formatVND(statsPart2.totalAll)}</td>
                  <td className="text-center font-mono">100%</td>
                </tr>
              </tfoot>
            )}
          </table>
        )}

        {/* Chữ ký xác nhận */}
        <div className="mt-8 pt-4 flex justify-between text-center font-serif text-[11pt] break-inside-avoid">
          <div className="w-1/3">
            <div className="font-bold uppercase">NGƯỜI LẬP BẢNG</div>
            <div className="text-xs italic text-slate-500">(Ký, ghi rõ họ tên)</div>
          </div>
          <div className="w-1/3">
            <div className="font-bold uppercase">Y BÁC SĨ KHÁM BỆNH</div>
            <div className="text-xs italic text-slate-500">(Ký, ghi rõ họ tên)</div>
          </div>
          <div className="w-1/3">
            <div className="italic mb-1">
              ..., ngày {new Date().getDate().toString().padStart(2, '0')} tháng {(new Date().getMonth() + 1).toString().padStart(2, '0')} năm {new Date().getFullYear()}
            </div>
            <div className="font-bold uppercase">CHỦ TÀI / TRƯỞNG PHÒNG</div>
            <div className="text-xs italic text-slate-500">(Ký, đóng dấu)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
