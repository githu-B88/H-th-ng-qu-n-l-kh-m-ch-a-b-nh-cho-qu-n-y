import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  Stethoscope,
  AlertCircle,
  HardDrive,
  KeyRound
} from 'lucide-react';
import { sqliteService } from '../../db/sqlite-service';
import { NguoiDung } from '../../types';

interface LoginProps {
  onLoginSuccess: (user: NguoiDung) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [tenDangNhap, setTenDangNhap] = useState('ban_quan_y');
  const [matKhau, setMatKhau] = useState('Giang@9999');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!tenDangNhap.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập!');
      return;
    }
    if (!matKhau.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      try {
        const user = sqliteService.authenticate(tenDangNhap, matKhau);
        if (user) {
          onLoginSuccess(user);
        } else {
          setErrorMsg('Tên đăng nhập hoặc mật khẩu không chính xác!');
        }
      } catch (err) {
        console.error('Login error:', err);
        setErrorMsg('Lỗi xác thực cơ sở dữ liệu SQLite!');
      } finally {
        setIsLoading(false);
      }
    }, 200);
  };

  const handleFillAdmin = () => {
    setTenDangNhap('ban_quan_y');
    setMatKhau('Giang@9999');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background Subtle Gradient & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Main Login Card - Centered */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 transition-all duration-300">
        {/* Top Military Medical Header Accent */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-sky-800 p-6 text-white text-center relative">
          <div className="mx-auto w-14 h-14 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/20 flex items-center justify-center shadow-inner mb-3">
            <Stethoscope className="w-8 h-8 text-emerald-100" />
          </div>
          <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white uppercase leading-snug">
            Hệ Thống Quản Lý Khám, Chữa Bệnh Tại Đơn Vị Quân Y
          </h1>
          <p className="text-xs text-emerald-100/90 mt-1 font-medium">
            Quản lý Y bạ, Khám bệnh, Kê đơn & Cấp phát thuốc Quân y
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-300/30 text-[11px] text-emerald-200 font-medium">
            <HardDrive className="w-3 h-3 text-emerald-400" />
            <span>SQLite Offline Storage (Cục bộ & An toàn)</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="text-center">
            <h2 className="text-base font-bold text-slate-800">Đăng Nhập Ban Quân Y</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Xác thực quyền quản trị để truy cập dữ liệu y tế đơn vị
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Tài khoản quản trị
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-username-input"
                  type="text"
                  value={tenDangNhap}
                  onChange={(e) => setTenDangNhap(e.target.value)}
                  placeholder="Nhập tài khoản ban_quan_y..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">Mật khẩu</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xác thực tài khoản...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Đăng Nhập Ban Quân Y</span>
                </>
              )}
            </button>
          </form>

          {/* Single Admin Account Info / Quick fill */}
          <div className="pt-3 border-t border-slate-100">
            <div
              onClick={handleFillAdmin}
              className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 hover:bg-emerald-100/70 transition-all cursor-pointer flex items-center justify-between"
              title="Click để tự động điền tài khoản Ban Quân y"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <span>Tài khoản Quản trị:</span>
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300 text-emerald-800 text-[11px]">
                      ban_quan_y
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700/90 mt-0.5 font-medium">
                    Mật khẩu: <span className="font-mono font-semibold">Giang@9999</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-1 rounded-md border border-emerald-200 shadow-2xs">
                Admin
              </span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Bảo mật quân y:</strong> Dữ liệu sức khỏe quân nhân và hồ sơ bệnh tật được lưu trữ cục bộ, tuyệt đối bảo mật và hoạt động độc lập không cần Internet.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
