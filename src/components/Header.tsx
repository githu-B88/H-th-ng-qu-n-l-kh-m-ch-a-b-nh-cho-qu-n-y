import React from 'react';
import {
  UserCheck,
  Calendar,
  Clock,
  HardDrive,
  RefreshCw,
  Search,
  Plus,
  Lock,
  LogOut,
  Shield
} from 'lucide-react';
import { BacSi, TabType, NguoiDung } from '../types';

interface HeaderProps {
  activeTab: TabType | string;
  bacSiList?: BacSi[];
  doctors?: BacSi[];
  selectedBacSiId?: number;
  currentDoctor?: BacSi | null;
  currentUser?: NguoiDung | null;
  onSelectBacSiId?: (id: number) => void;
  onSelectDoctor?: (doc: BacSi) => void;
  onQuickNewExam?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  bacSiList,
  doctors,
  selectedBacSiId,
  currentDoctor,
  currentUser,
  onSelectBacSiId,
  onSelectDoctor,
  onQuickNewExam,
  onLogout
}) => {
  const list = bacSiList || doctors || [];
  const currentId = selectedBacSiId || currentDoctor?.id || (list[0]?.id ?? 1);

  const getTabTitle = (tab: TabType | string) => {
    switch (tab) {
      case 'kham_benh':
        return 'Bàn Khám Bệnh & Kê Đơn Thuốc';
      case 'ho_so_kham':
      case 'ho_so_y_ba':
        return 'Hồ Sơ Y Bạ & Lịch Sử Khám Bệnh';
      case 'benh_nhan':
        return 'Quản Lý Danh Sách Cán Bộ / Bệnh Nhân';
      case 'mau_benh':
        return 'Mẫu Bệnh & Phác Đồ Điều Trị Mặc Định';
      case 'danh_muc':
        return 'Danh Mục Y Tế (Thuốc, Vật Tư, Dịch Vụ, Đơn Vị)';
      case 'bac_si':
        return 'Danh Sách Bác Sĩ / Y Sĩ Đơn Vị Quân Y';
      case 'bao_cao':
        return 'Báo Cáo Thống Kê & Tình Hình Bệnh Tật Quân Y';
      case 'co_so_du_lieu':
      case 'csdl':
        return 'Quản Trị Cơ Sở Dữ Liệu SQLite Cục Bộ';
      default:
        return 'Hệ Thống Quản Lý Khám, Chữa Bệnh Tại Đơn Vị Quân Y';
    }
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header
      id="app-header"
      className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs shrink-0 z-10"
    >
      {/* Title & Date */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            {getTabTitle(activeTab)}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span className="capitalize">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Actions & Doctor Switcher */}
      <div className="flex items-center gap-3">
        {activeTab !== 'kham_benh' && onQuickNewExam && (
          <button
            id="quick-exam-btn"
            onClick={onQuickNewExam}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Khám Bệnh Mới</span>
          </button>
        )}

        {/* Current Doctor Picker */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-400 mr-1.5">Bác sĩ trực:</span>
            <select
              id="header-doctor-select"
              value={currentId}
              onChange={(e) => {
                const id = Number(e.target.value);
                if (onSelectBacSiId) onSelectBacSiId(id);
                if (onSelectDoctor) {
                  const doc = list.find((d) => d.id === id);
                  if (doc) onSelectDoctor(doc);
                }
              }}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer text-xs"
            >
              {list.map((bs) => (
                <option key={bs.id} value={bs.id}>
                  {bs.ho_ten} ({bs.chuyen_mon || 'Đa khoa'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Role Badge & Lock Screen / Logout */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.ho_ten}
              </span>
              <span className="text-[10px] text-sky-700 font-semibold uppercase tracking-wider">
                {currentUser.vai_tro === 'admin'
                  ? 'Quản trị viên'
                  : currentUser.vai_tro === 'y_si'
                  ? 'Y sĩ cơ quan'
                  : 'Bác sĩ điều trị'}
              </span>
            </div>

            {onLogout && (
              <button
                id="header-lock-btn"
                onClick={onLogout}
                title="Khóa màn hình làm việc để bảo mật dữ liệu y bạ khi rời máy"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200 hover:border-rose-200 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Khóa Máy</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
