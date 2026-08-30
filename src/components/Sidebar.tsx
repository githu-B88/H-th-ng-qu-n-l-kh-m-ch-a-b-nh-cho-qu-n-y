import React, { useState } from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  FileText,
  Users,
  BookmarkCheck,
  Package,
  UserCheck,
  BarChart3,
  Database,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType | string;
  onTabChange?: (tab: TabType) => void;
  onSelectTab?: (tab: string) => void;
  examCountToday?: number;
  lowStockCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onSelectTab,
  examCountToday = 0,
  lowStockCount = 0
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleSelect = (tabId: string) => {
    if (onTabChange) onTabChange(tabId as TabType);
    if (onSelectTab) onSelectTab(tabId);
  };

  const menuItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Tổng Quan & Báo Cáo',
      description: 'Thống kê, cảnh báo',
      icon: LayoutDashboard
    },
    {
      id: 'kham_benh' as TabType,
      label: 'Bàn Khám Bệnh',
      description: 'Khám & kê đơn',
      icon: Stethoscope,
      badge: examCountToday > 0 ? `${examCountToday} hôm nay` : undefined,
      badgeColor: 'bg-emerald-500'
    },
    {
      id: 'ho_so_kham' as TabType,
      label: 'Hồ Sơ Y Bạ',
      description: 'Lịch sử khám & đơn thuốc',
      icon: FileText
    },
    {
      id: 'benh_nhan' as TabType,
      label: 'Cán Bộ / Bệnh Nhân',
      description: 'Nhân sự, thẻ BHYT',
      icon: Users
    },
    {
      id: 'mau_benh' as TabType,
      label: 'Mẫu Bệnh & Phác Đồ',
      description: 'Kê đơn 1-click',
      icon: BookmarkCheck
    },
    {
      id: 'danh_muc' as TabType,
      label: 'Danh Mục Y Tế',
      description: 'Thuốc, vật tư',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} sắp hết` : undefined,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'bac_si' as TabType,
      label: 'Bác Sĩ & Y Sĩ',
      description: 'Danh sách nhân sự',
      icon: UserCheck
    },
    {
      id: 'bao_cao' as TabType,
      label: 'Báo Cáo Thống Kê',
      description: 'Tình hình bệnh tật',
      icon: BarChart3
    },
    {
      id: 'co_so_du_lieu' as TabType,
      label: 'Cơ Sở Dữ Liệu',
      description: 'SQLite & Backup',
      icon: Database
    }
  ];

  return (
    <aside
      id="app-sidebar"
      className={`bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 select-none shadow-xl transition-all duration-300 ease-in-out relative ${
        isOpen ? 'w-72' : 'w-[80px]'
      }`}
    >
      {/* Toggle Collapse Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-6 bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white p-1 rounded-full shadow-lg z-50 border border-slate-700 hover:border-sky-500 transition-all cursor-pointer flex items-center justify-center h-6 w-6"
        title={isOpen ? 'Thu gọn menu' : 'Mở rộng menu'}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Brand Header */}
      <div className={`p-5 border-b border-slate-800/80 bg-slate-950/40 flex items-center transition-all duration-300 ${isOpen ? 'gap-3' : 'justify-center px-0'}`}>
        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-900/30">
          <Stethoscope className="w-6 h-6" />
        </div>
        <div
          className={`whitespace-nowrap overflow-hidden transition-all duration-300 flex flex-col justify-center ${
            isOpen ? 'opacity-100 w-full' : 'opacity-0 w-0'
          }`}
        >
          <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 leading-snug">
            Quản Lý Quân Y
          </h1>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            Khám, chữa bệnh Offline
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-3 flex-1 overflow-y-auto space-y-1 overflow-x-hidden custom-scrollbar">
        <div
          className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 transition-all duration-300 overflow-hidden whitespace-nowrap ${
            isOpen ? 'opacity-100 h-6' : 'opacity-0 h-0 py-0'
          }`}
        >
          Chức Năng Chính
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleSelect(item.id)}
              title={!isOpen ? item.label : undefined}
              className={`w-full text-left flex items-center py-3 rounded-lg text-sm font-medium transition-all group relative cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              } ${isOpen ? 'px-3.5 justify-between' : 'px-0 justify-center'}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-sky-400 group-hover:text-sky-300'
                  }`}
                />
                <div
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                  }`}
                >
                  <div className="text-sm truncate">{item.label}</div>
                  <div
                    className={`text-[10px] truncate mt-0.5 ${
                      isActive ? 'text-sky-100' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </div>

              {/* Badge for Expanded State */}
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  isOpen && item.badge ? 'opacity-100 w-auto ml-2' : 'opacity-0 w-0'
                }`}
              >
                <span
                  className={`text-[10px] text-white px-1.5 py-0.5 rounded font-semibold whitespace-nowrap ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              </div>

              {/* Dot Indicator for Collapsed State */}
              {!isOpen && item.badge && (
                <span
                  className={`absolute top-2 right-2 w-2 h-2 rounded-full shadow-sm ${item.badgeColor}`}
                ></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Offline Security Footer Card */}
      <div
        className={`border-t border-slate-800/80 bg-slate-950/60 overflow-hidden transition-all duration-300 ${
          isOpen ? 'p-4 opacity-100 h-auto' : 'p-0 opacity-0 h-0 border-transparent'
        }`}
      >
        <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300 whitespace-nowrap">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 overflow-hidden">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5 truncate">
              <span>Dữ liệu an toàn 100%</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed truncate">
              Lưu nội bộ qua SQLite engine.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

