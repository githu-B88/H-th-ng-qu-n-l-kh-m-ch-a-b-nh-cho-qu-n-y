import React, { useState, useEffect } from 'react';
import { Thuoc, VatTu, DichVuKT, CoQuan } from '../../types';
import { sqliteService } from '../../db/sqlite-service';
import {
  Package,
  Pill,
  Syringe,
  Stethoscope,
  Building,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { forceResetAndSeedData, seedMedicalData, listThuoc as defaultListThuoc, listVatTu as defaultListVatTu, listDichVu as defaultListDichVu } from '../../db/seedMedicalData';

export const CatalogManager: React.FC = () => {
  const [activeCatalogTab, setActiveCatalogTab] = useState<'thuoc' | 'vat_tu' | 'dich_vu' | 'co_quan'>('thuoc');
  
  // YÊU CẦU 3: State lưu danh mục hiển thị
  const [listThuoc, setListThuoc] = useState<Thuoc[]>([]);
  const [listVatTu, setListVatTu] = useState<VatTu[]>([]);
  const [listDichVu, setListDichVu] = useState<DichVuKT[]>([]);
  const [coQuanList, setCoQuanList] = useState<CoQuan[]>([]);
  const [donViCap1List, setDonViCap1List] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  // Alias for backward compatibility
  const thuocList = listThuoc;
  const vatTuList = listVatTu;
  const dichVuList = listDichVu;

  // Modals
  const [isThuocModalOpen, setIsThuocModalOpen] = useState(false);
  const [editingThuoc, setEditingThuoc] = useState<Partial<Thuoc>>({});

  const [isVatTuModalOpen, setIsVatTuModalOpen] = useState(false);
  const [editingVatTu, setEditingVatTu] = useState<Partial<VatTu>>({});

  const [isDichVuModalOpen, setIsDichVuModalOpen] = useState(false);
  const [editingDichVu, setEditingDichVu] = useState<Partial<DichVuKT>>({});

  const [isCoQuanModalOpen, setIsCoQuanModalOpen] = useState(false);
  const [editingCoQuan, setEditingCoQuan] = useState<Partial<CoQuan>>({});
  const [isSeedConfirmModalOpen, setIsSeedConfirmModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const loadData = () => {
    const freshThuoc = sqliteService.getThuocList();
    const freshVatTu = sqliteService.getVatTuList();
    const freshDichVu = sqliteService.getDichVuKTList();
    
    setListThuoc(freshThuoc);
    setListVatTu(freshVatTu);
    setListDichVu(freshDichVu);
    setCoQuanList(sqliteService.getCoQuanList());
    setDonViCap1List((sqliteService as any).getDonViCap1List());
  };

  useEffect(() => {
    loadData();
    const unsub = sqliteService.subscribe(loadData);
    return unsub;
  }, []);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Handlers for Thuoc
  const handleSaveThuoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingThuoc.ten?.trim()) return;
    sqliteService.saveThuoc(editingThuoc);
    setIsThuocModalOpen(false);
    loadData();
  };

  const handleDeleteThuoc = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thuốc này khỏi danh mục?')) {
      sqliteService.deleteThuoc(id);
      loadData();
    }
  };

  // Handlers for Vat Tu
  const handleSaveVatTu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVatTu.ten?.trim()) return;
    sqliteService.saveVatTu(editingVatTu);
    setIsVatTuModalOpen(false);
    loadData();
  };

  const handleDeleteVatTu = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vật tư này?')) {
      sqliteService.deleteVatTu(id);
      loadData();
    }
  };

  // Handlers for Dich Vu
  const handleSaveDichVu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDichVu.ten?.trim()) return;
    sqliteService.saveDichVuKT(editingDichVu);
    setIsDichVuModalOpen(false);
    loadData();
  };

  const handleDeleteDichVu = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ kỹ thuật này?')) {
      sqliteService.deleteDichVuKT(id);
      loadData();
    }
  };

  // Handlers for Co Quan
  const handleSaveCoQuan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoQuan.ten_co_quan?.trim()) return;
    sqliteService.saveCoQuan(editingCoQuan);
    setIsCoQuanModalOpen(false);
    loadData();
  };

  const handleDeleteCoQuan = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cơ quan/phòng ban này?')) {
      sqliteService.deleteCoQuan(id);
      loadData();
    }
  };

  const handleSeedMedicalCatalog = () => {
    setIsSeedConfirmModalOpen(true);
  };

  const handleConfirmSeedMedical = () => {
    setIsSeeding(true);
    try {
      const res = forceResetAndSeedData();
      if (res.success) {
        setSeedMessage(res.message);
        setListThuoc(res.listThuoc);
        setListVatTu(res.listVatTu);
        setListDichVu(res.listDichVu);
        loadData();
        setTimeout(() => setSeedMessage(null), 6000);
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert('Lỗi cập nhật danh mục: ' + (e.message || String(e)));
    } finally {
      setIsSeeding(false);
      setIsSeedConfirmModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Quản Lý Danh Mục Y Tế & Cơ Quan
            </h3>
            <p className="text-xs text-slate-500">
              Cơ số thuốc điều trị, vật tư tiêu hao, dịch vụ kỹ thuật và danh sách phòng ban
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => {
              setActiveCatalogTab('thuoc');
              setSearch('');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeCatalogTab === 'thuoc'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Thuốc ({thuocList.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveCatalogTab('vat_tu');
              setSearch('');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeCatalogTab === 'vat_tu'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>Vật Tư ({vatTuList.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveCatalogTab('dich_vu');
              setSearch('');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeCatalogTab === 'dich_vu'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Dịch Vụ KT ({dichVuList.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveCatalogTab('co_quan');
              setSearch('');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeCatalogTab === 'co_quan'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Cơ Quan ({coQuanList.length})</span>
          </button>
        </div>
      </div>

      {seedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{seedMessage}</span>
          </div>
          <button
            onClick={() => setSeedMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={`Tìm kiếm trong danh mục ${
              activeCatalogTab === 'thuoc'
                ? 'thuốc'
                : activeCatalogTab === 'vat_tu'
                ? 'vật tư'
                : activeCatalogTab === 'dich_vu'
                ? 'dịch vụ kỹ thuật'
                : 'cơ quan'
            }...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {activeCatalogTab !== 'co_quan' && (
            <button
              onClick={handleSeedMedicalCatalog}
              title="Khôi phục danh mục gốc mặc định: 34 loại thuốc, 4 vật tư, 3 dịch vụ kỹ thuật"
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              <span>Nạp lại danh mục mặc định</span>
            </button>
          )}

          {activeCatalogTab === 'thuoc' && (
            <button
              onClick={() => {
                setEditingThuoc({ don_vi_tinh: 'Viên', ton_kho: 100 });
                setIsThuocModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Thuốc Mới</span>
            </button>
          )}

          {activeCatalogTab === 'vat_tu' && (
            <button
              onClick={() => {
                setEditingVatTu({ don_vi_tinh: 'Cái', ton_kho: 50 });
                setIsVatTuModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Vật Tư Mới</span>
            </button>
          )}

          {activeCatalogTab === 'dich_vu' && (
            <button
              onClick={() => {
                setEditingDichVu({ don_vi_tinh: 'Lần' });
                setIsDichVuModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Dịch Vụ Mới</span>
            </button>
          )}

          {activeCatalogTab === 'co_quan' && (
            <button
              onClick={() => {
                setEditingCoQuan({});
                setIsCoQuanModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Cơ Quan / Phòng Ban</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= THUOC TAB ================= */}
      {activeCatalogTab === 'thuoc' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold w-12 text-center">STT</th>
                  <th className="py-3 px-4 font-semibold">Tên Thuốc & Hoạt Chất</th>
                  <th className="py-3 px-4 font-semibold">Hàm Lượng</th>
                  <th className="py-3 px-4 font-semibold">ĐVT</th>
                  <th className="py-3 px-4 font-semibold text-right">Đơn Giá</th>
                  <th className="py-3 px-4 font-semibold text-center">Tồn Kho</th>
                  <th className="py-3 px-4 font-semibold">Cách Dùng Mặc Định</th>
                  <th className="py-3 px-4 font-semibold text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {thuocList
                  .filter((t) => {
                    if (!search.trim()) return true;
                    return (
                      t.ten.toLowerCase().includes(search.toLowerCase()) ||
                      (t.ham_luong && t.ham_luong.toLowerCase().includes(search.toLowerCase()))
                    );
                  })
                  .map((t, idx) => (
                    <tr key={t.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{t.ten}</div>
                        {t.ghi_chu && (
                          <div className="text-[11px] text-slate-500">{t.ghi_chu}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {t.ham_luong || '---'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{t.don_vi_tinh}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatVND(t.don_gia)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${
                            (t.ton_kho || 0) <= 20
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {t.ton_kho || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 italic text-[11px] max-w-xs">
                        {t.cach_dung_mac_dinh || '---'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingThuoc(t);
                              setIsThuocModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteThuoc(t.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= VAT TU TAB ================= */}
      {activeCatalogTab === 'vat_tu' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold w-12 text-center">STT</th>
                  <th className="py-3 px-4 font-semibold">Tên Vật Tư Tiêu Hao</th>
                  <th className="py-3 px-4 font-semibold">Đơn Vị Tính</th>
                  <th className="py-3 px-4 font-semibold text-right">Đơn Giá</th>
                  <th className="py-3 px-4 font-semibold text-center">Tồn Kho</th>
                  <th className="py-3 px-4 font-semibold">Ghi Chú</th>
                  <th className="py-3 px-4 font-semibold text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vatTuList
                  .filter((v) => {
                    if (!search.trim()) return true;
                    return v.ten.toLowerCase().includes(search.toLowerCase());
                  })
                  .map((v, idx) => (
                    <tr key={v.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 text-center font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{v.ten}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{v.don_vi_tinh}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatVND(v.don_gia)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        {v.ton_kho || 0}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{v.ghi_chu || '---'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingVatTu(v);
                              setIsVatTuModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVatTu(v.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= DICH VU TAB ================= */}
      {activeCatalogTab === 'dich_vu' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold w-12 text-center">STT</th>
                  <th className="py-3 px-4 font-semibold">Tên Dịch Vụ Kỹ Thuật / Thủ Thuật</th>
                  <th className="py-3 px-4 font-semibold">Đơn Vị Tính</th>
                  <th className="py-3 px-4 font-semibold text-right">Đơn Giá</th>
                  <th className="py-3 px-4 font-semibold">Ghi Chú</th>
                  <th className="py-3 px-4 font-semibold text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dichVuList
                  .filter((d) => {
                    if (!search.trim()) return true;
                    return d.ten.toLowerCase().includes(search.toLowerCase());
                  })
                  .map((d, idx) => (
                    <tr key={d.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 text-center font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{d.ten}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{d.don_vi_tinh}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatVND(d.don_gia)}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{d.ghi_chu || '---'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingDichVu(d);
                              setIsDichVuModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDichVu(d.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= CO QUAN TAB ================= */}
      {activeCatalogTab === 'co_quan' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold w-12 text-center">STT</th>
                  <th className="py-3 px-4 font-semibold">Khối (Đơn vị cấp 1)</th>
                  <th className="py-3 px-4 font-semibold">Tên Cơ Quan / Phòng Ban</th>
                  <th className="py-3 px-4 font-semibold">Ghi Chú Chức Năng</th>
                  <th className="py-3 px-4 font-semibold text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coQuanList
                  .filter((c) => {
                    if (!search.trim()) return true;
                    const d1 = donViCap1List.find(d => d.id === c.id_don_vi_cap_1);
                    return c.ten_co_quan.toLowerCase().includes(search.toLowerCase()) || (d1 && d1.ten.toLowerCase().includes(search.toLowerCase()));
                  })
                  .map((c, idx) => {
                    const d1 = donViCap1List.find(d => d.id === c.id_don_vi_cap_1);
                    return (
                      <tr key={c.id} className="hover:bg-sky-50/40 transition-colors">
                        <td className="py-3 px-4 text-slate-400 text-center font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-semibold text-sky-800">{d1?.ten || '---'}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{c.ten_co_quan}</td>
                        <td className="py-3 px-4 text-slate-600">{c.ghi_chu || '---'}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingCoQuan(c);
                                setIsCoQuanModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoQuan(c.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Thuoc */}
      <Modal
        isOpen={isThuocModalOpen}
        onClose={() => setIsThuocModalOpen(false)}
        title={editingThuoc.id ? 'Sửa Thông Tin Thuốc' : 'Thêm Thuốc Mới Vào Danh Mục'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveThuoc} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên thuốc & Biệt dược <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Paracetamol 500mg (Panadol)..."
              value={editingThuoc.ten || ''}
              onChange={(e) => setEditingThuoc({ ...editingThuoc, ten: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hàm lượng</label>
              <input
                type="text"
                placeholder="VD: 500mg, 10mg/5ml..."
                value={editingThuoc.ham_luong || ''}
                onChange={(e) => setEditingThuoc({ ...editingThuoc, ham_luong: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đơn vị tính</label>
              <input
                type="text"
                required
                placeholder="Viên, Gói, Chai, Lọ, Ống..."
                value={editingThuoc.don_vi_tinh || 'Viên'}
                onChange={(e) => setEditingThuoc({ ...editingThuoc, don_vi_tinh: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đơn giá (VNĐ)</label>
              <input
                type="number"
                min={0}
                required
                value={editingThuoc.don_gia || 0}
                onChange={(e) =>
                  setEditingThuoc({
                    ...editingThuoc,
                    don_gia: parseFloat(e.target.value) || 0
                  })
                }
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tồn kho ban đầu</label>
              <input
                type="number"
                min={0}
                value={editingThuoc.ton_kho || 0}
                onChange={(e) =>
                  setEditingThuoc({
                    ...editingThuoc,
                    ton_kho: parseInt(e.target.value, 10) || 0
                  })
                }
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Cách dùng mặc định (khi kê đơn)
            </label>
            <input
              type="text"
              placeholder="VD: Uống 1 viên x 2 lần/ngày sau bữa ăn..."
              value={editingThuoc.cach_dung_mac_dinh || ''}
              onChange={(e) =>
                setEditingThuoc({ ...editingThuoc, cach_dung_mac_dinh: e.target.value })
              }
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ghi chú tác dụng</label>
            <input
              type="text"
              placeholder="VD: Hạ sốt, giảm đau..."
              value={editingThuoc.ghi_chu || ''}
              onChange={(e) => setEditingThuoc({ ...editingThuoc, ghi_chu: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsThuocModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold"
            >
              Lưu Thuốc
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Add/Edit Vat Tu */}
      <Modal
        isOpen={isVatTuModalOpen}
        onClose={() => setIsVatTuModalOpen(false)}
        title={editingVatTu.id ? 'Sửa Thông Tin Vật Tư' : 'Thêm Vật Tư Mới'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveVatTu} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên vật tư y tế <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Băng gạc tiệt trùng..."
              value={editingVatTu.ten || ''}
              onChange={(e) => setEditingVatTu({ ...editingVatTu, ten: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đơn vị tính</label>
              <input
                type="text"
                required
                placeholder="Cái, Cuộn, Gói, Hộp..."
                value={editingVatTu.don_vi_tinh || 'Cái'}
                onChange={(e) => setEditingVatTu({ ...editingVatTu, don_vi_tinh: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đơn giá (VNĐ)</label>
              <input
                type="number"
                min={0}
                required
                value={editingVatTu.don_gia || 0}
                onChange={(e) =>
                  setEditingVatTu({
                    ...editingVatTu,
                    don_gia: parseFloat(e.target.value) || 0
                  })
                }
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tồn kho</label>
            <input
              type="number"
              min={0}
              value={editingVatTu.ton_kho || 0}
              onChange={(e) =>
                setEditingVatTu({
                  ...editingVatTu,
                  ton_kho: parseInt(e.target.value, 10) || 0
                })
              }
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ghi chú</label>
            <input
              type="text"
              placeholder="Quy cách, bảo quản..."
              value={editingVatTu.ghi_chu || ''}
              onChange={(e) => setEditingVatTu({ ...editingVatTu, ghi_chu: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsVatTuModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold"
            >
              Lưu Vật Tư
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Add/Edit Dich Vu */}
      <Modal
        isOpen={isDichVuModalOpen}
        onClose={() => setIsDichVuModalOpen(false)}
        title={editingDichVu.id ? 'Sửa Dịch Vụ Kỹ Thuật' : 'Thêm Dịch Vụ Kỹ Thuật Mới'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveDichVu} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên dịch vụ / thủ thuật <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Đo điện tim ECG 12 cần..."
              value={editingDichVu.ten || ''}
              onChange={(e) => setEditingDichVu({ ...editingDichVu, ten: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đơn vị tính</label>
              <input
                type="text"
                required
                placeholder="Lần, Lượt, Ca..."
                value={editingDichVu.don_vi_tinh || 'Lần'}
                onChange={(e) => setEditingDichVu({ ...editingDichVu, don_vi_tinh: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đơn giá (VNĐ)</label>
              <input
                type="number"
                min={0}
                required
                value={editingDichVu.don_gia || 0}
                onChange={(e) =>
                  setEditingDichVu({
                    ...editingDichVu,
                    don_gia: parseFloat(e.target.value) || 0
                  })
                }
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ghi chú thủ thuật</label>
            <input
              type="text"
              placeholder="Mô tả kỹ thuật..."
              value={editingDichVu.ghi_chu || ''}
              onChange={(e) => setEditingDichVu({ ...editingDichVu, ghi_chu: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDichVuModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold"
            >
              Lưu Dịch Vụ
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Add/Edit Co Quan */}
      <Modal
        isOpen={isCoQuanModalOpen}
        onClose={() => setIsCoQuanModalOpen(false)}
        title={editingCoQuan.id ? 'Sửa Cơ Quan / Đơn Vị' : 'Thêm Cơ Quan / Đơn Vị Mới'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveCoQuan} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Khối / Đơn vị cấp 1 trực thuộc <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={editingCoQuan.id_don_vi_cap_1 || ''}
              onChange={(e) => setEditingCoQuan({ ...editingCoQuan, id_don_vi_cap_1: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white mb-4"
            >
              <option value="">-- Chọn Khối --</option>
              {donViCap1List.map(d => (
                <option key={d.id} value={d.id}>{d.ten}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên cơ quan / phòng ban trực thuộc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Phòng Tham Mưu..."
              value={editingCoQuan.ten_co_quan || ''}
              onChange={(e) => setEditingCoQuan({ ...editingCoQuan, ten_co_quan: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ghi chú chức năng</label>
            <textarea
              rows={3}
              placeholder="Chức năng nhiệm vụ hoặc vị trí..."
              value={editingCoQuan.ghi_chu || ''}
              onChange={(e) => setEditingCoQuan({ ...editingCoQuan, ghi_chu: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCoQuanModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold"
            >
              Lưu Cơ Quan
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Xác Nhận Cập Nhật / Nạp Lại Danh Mục Mặc Định */}
      <Modal
        isOpen={isSeedConfirmModalOpen}
        onClose={() => !isSeeding && setIsSeedConfirmModalOpen(false)}
        title="Xác Nhận Cập Nhật Danh Mục Y Tế Gốc"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-2">
              <p className="font-bold text-sm text-amber-950">
                Bạn có chắc chắn muốn nạp và cập nhật lại danh mục mặc định?
              </p>
              <p>
                Thao tác này sẽ đặt lại danh mục thuốc, vật tư và dịch vụ kỹ thuật về danh sách gốc chuẩn hóa từ file <span className="font-mono font-bold">defaultData.json</span>:
              </p>
              <ul className="list-disc pl-4 space-y-1 font-semibold text-amber-800">
                <li>34 loại thuốc chuẩn (cơ số điều trị)</li>
                <li>4 danh mục vật tư y tế tiêu hao</li>
                <li>3 dịch vụ kỹ thuật y tế</li>
              </ul>
              <p className="text-[11px] text-amber-700 italic">
                * Lưu ý: Hồ sơ khám bệnh và danh sách nhân sự hiện tại sẽ được bảo lưu an toàn.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSeeding}
              onClick={() => setIsSeedConfirmModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={isSeeding}
              onClick={handleConfirmSeedMedical}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSeeding ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xác Nhận Cập Nhật Lại</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
