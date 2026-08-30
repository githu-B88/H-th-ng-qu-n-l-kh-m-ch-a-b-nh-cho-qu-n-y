import React, { useState, useEffect } from 'react';
import { MauBenh, MauBenhChiTiet, Thuoc, VatTu, DichVuKT } from '../../types';
import { sqliteService } from '../../db/sqlite-service';
import {
  BookmarkCheck,
  Plus,
  Edit2,
  Trash2,
  Pill,
  Sparkles,
  Search,
  CheckCircle2,
  Syringe,
  FileText,
  RotateCcw,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

export const DiseaseTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<MauBenh[]>([]);
  const [thuocList, setThuocList] = useState<Thuoc[]>([]);
  const [vatTuList, setVatTuList] = useState<VatTu[]>([]);
  const [dichVuList, setDichVuList] = useState<DichVuKT[]>([]);
  const [search, setSearch] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotification, setSeedNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<MauBenh>>({});
  const [templateDetails, setTemplateDetails] = useState<MauBenhChiTiet[]>([]);

  // Item selector inside modal
  const [itemType, setItemType] = useState<'thuoc' | 'vat_tu' | 'dich_vu_kt'>('thuoc');
  const [selectedItemId, setSelectedItemId] = useState<number | ''>('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemUsage, setItemUsage] = useState<string>('');

  const loadData = () => {
    setTemplates(sqliteService.getMauBenhList());
    setThuocList(sqliteService.getThuocList());
    setVatTuList(sqliteService.getVatTuList());
    setDichVuList(sqliteService.getDichVuKTList());
  };

  useEffect(() => {
    loadData();
    const unsub = sqliteService.subscribe(loadData);
    return unsub;
  }, []);

  const handleSeed53Templates = async () => {
    setIsSeeding(true);
    try {
      const res = await sqliteService.seed53DiseaseTemplates();
      if (res.success) {
        setSeedNotification({
          type: 'success',
          message: `Đã nạp và đồng bộ thành công ${res.count} mẫu bệnh/phác đồ y khoa với ${res.totalItems} mục được liên kết khóa ngoại (Foreign Key) chính xác.`
        });
      } else {
        setSeedNotification({
          type: 'error',
          message: res.message || 'Có lỗi xảy ra khi nạp mẫu bệnh.'
        });
      }
      loadData();
    } catch (err: any) {
      setSeedNotification({
        type: 'error',
        message: `Lỗi: ${err.message || 'Không thể nạp 53 mẫu bệnh'}`
      });
    } finally {
      setIsSeeding(false);
      setIsResetConfirmOpen(false);
      setTimeout(() => {
        setSeedNotification(null);
      }, 6000);
    }
  };

  const getItemName = (ct: any): string => {
    // If the backend already provided a valid resolved name, use it!
    if (ct.ten_muc && ct.ten_muc.trim() && !ct.ten_muc.startsWith('Mục #')) {
      return ct.ten_muc;
    }
    const idNum = Number(ct.id_muc);
    const loai = String(ct.loai_muc || '').toLowerCase();
    if (loai === 'thuoc') {
      const t = thuocList.find((x) => Number(x.id) === idNum);
      if (t) return t.ten;
    } else if (loai === 'vat_tu') {
      const v = vatTuList.find((x) => Number(x.id) === idNum);
      if (v) return v.ten;
    } else {
      const d = dichVuList.find((x) => Number(x.id) === idNum);
      if (d) return d.ten;
    }
    // Search across all catalogs as fallback
    const tFallback = thuocList.find((x) => Number(x.id) === idNum);
    if (tFallback) return tFallback.ten;
    const vFallback = vatTuList.find((x) => Number(x.id) === idNum);
    if (vFallback) return vFallback.ten;
    const dFallback = dichVuList.find((x) => Number(x.id) === idNum);
    if (dFallback) return dFallback.ten;

    return ct.ten_thuoc || ct.ten_vat_tu || ct.ten_dich_vu || ct.ten_muc || `Mục #${ct.id_muc}`;
  };

  const getItemUnit = (ct: any): string => {
    if (ct.don_vi_tinh && ct.don_vi_tinh.trim() && ct.don_vi_tinh !== 'Lượt') {
      return ct.don_vi_tinh;
    }
    const idNum = Number(ct.id_muc);
    const item =
      thuocList.find((x) => Number(x.id) === idNum) ||
      vatTuList.find((x) => Number(x.id) === idNum) ||
      dichVuList.find((x) => Number(x.id) === idNum);
    return item?.don_vi_tinh || ct.don_vi_tinh || 'Lượt';
  };

  const handleOpenAdd = () => {
    setEditingTemplate({});
    setTemplateDetails([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mb: MauBenh) => {
    setEditingTemplate(mb);
    const details = sqliteService.getMauBenhChiTiet(mb.id);
    const enrichedDetails = details.map((ct) => {
      const name = getItemName(ct);
      const unit = getItemUnit(ct);
      return {
        ...ct,
        ten_muc: name,
        don_vi_tinh: unit
      };
    });
    setTemplateDetails(enrichedDetails);
    setIsModalOpen(true);
  };

  const handleAddItemToTemplate = () => {
    if (!selectedItemId) return;

    let ten_muc = '';
    let don_vi_tinh = '';
    let don_gia = 0;
    let defaultUsage = itemUsage;

    if (itemType === 'thuoc') {
      const t = thuocList.find((x) => x.id === Number(selectedItemId));
      if (t) {
        ten_muc = t.ten;
        don_vi_tinh = t.don_vi_tinh;
        don_gia = t.don_gia;
        if (!defaultUsage && t.cach_dung_mac_dinh) defaultUsage = t.cach_dung_mac_dinh;
      }
    } else if (itemType === 'vat_tu') {
      const v = vatTuList.find((x) => x.id === Number(selectedItemId));
      if (v) {
        ten_muc = v.ten;
        don_vi_tinh = v.don_vi_tinh;
        don_gia = v.don_gia;
      }
    } else {
      const d = dichVuList.find((x) => x.id === Number(selectedItemId));
      if (d) {
        ten_muc = d.ten;
        don_vi_tinh = d.don_vi_tinh;
        don_gia = d.don_gia;
      }
    }

    const newDetail: MauBenhChiTiet = {
      loai_muc: itemType,
      id_muc: Number(selectedItemId),
      ten_muc: ten_muc || `Mục #${selectedItemId}`,
      don_vi_tinh: don_vi_tinh || 'Viên',
      don_gia,
      so_luong: itemQty,
      cach_dung: defaultUsage
    };

    setTemplateDetails([...templateDetails, newDetail]);
    setSelectedItemId('');
    setItemQty(1);
    setItemUsage('');
  };

  const handleRemoveDetail = (idx: number) => {
    setTemplateDetails(templateDetails.filter((_, i) => i !== idx));
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate.ten_benh?.trim()) return;

    sqliteService.saveMauBenh(editingTemplate, templateDetails);
    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteTemplate = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mẫu bệnh này?')) {
      sqliteService.deleteMauBenh(id);
      loadData();
    }
  };

  const filtered = templates.filter((t) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      t.ten_benh.toLowerCase().includes(s) ||
      (t.chan_doan_chuan && t.chan_doan_chuan.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Quản Lý Mẫu Bệnh & Phác Đồ Mặc Định ({templates.length} mẫu)
              {templates.length >= 50 && (
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  Chuẩn y khoa 53 phác đồ
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Thiết lập trước đơn thuốc, vật tư, chẩn đoán ICD-10 và lời dặn giúp kê đơn 1-click
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            title="Khởi tạo lại toàn bộ 53 mẫu bệnh chuẩn theo danh mục y tế"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Nạp 53 Mẫu Bệnh Chuẩn</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Mẫu Bệnh Mới</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {seedNotification && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            seedNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {seedNotification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <p className="font-bold">
              {seedNotification.type === 'success' ? 'Thành công!' : 'Thông báo lỗi:'}
            </p>
            <p className="mt-0.5">{seedNotification.message}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Tìm kiếm mẫu bệnh hoặc mã chẩn đoán..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:bg-white"
        />
      </div>

      {/* Template Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500 shadow-xs">
          <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700 text-sm">
            {search ? `Không tìm thấy mẫu bệnh nào khớp với từ khóa "${search}".` : 'Đang tải dữ liệu 53 mẫu bệnh chuẩn y khoa...'}
          </p>
          {!search && (
            <button
              onClick={handleSeed53Templates}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Nạp lại 53 mẫu bệnh chuẩn y khoa
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                    <h4 className="font-bold text-slate-900 text-sm">{t.ten_benh}</h4>
                  </div>
                  <Badge variant="primary" size="sm">
                    {t.chi_tiet?.length || 0} mục chỉ định
                  </Badge>
                </div>

                {t.chan_doan_chuan && (
                  <div className="text-xs text-slate-800 bg-sky-50/70 p-2.5 rounded-lg border border-sky-100">
                    <span className="font-bold text-sky-900">Chẩn đoán:</span> {t.chan_doan_chuan}
                  </div>
                )}

                {/* Items preview list */}
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
                    Đơn thuốc & Vật tư định sẵn:
                  </div>
                  {t.chi_tiet && t.chi_tiet.length > 0 ? (
                    <ul className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-h-36 overflow-y-auto divide-y divide-slate-100">
                      {t.chi_tiet.map((ct, idx) => {
                        const itemName = getItemName(ct);
                        const itemUnit = getItemUnit(ct);
                        return (
                          <li key={idx} className="flex justify-between items-baseline text-[11px] pt-1 first:pt-0">
                            <span className="font-medium text-slate-800">
                              • {itemName}
                            </span>
                            <span className="text-slate-500 font-mono shrink-0 ml-2">
                              SL: {ct.so_luong} {itemUnit}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-[11px] italic text-slate-400">Chưa thiết lập mục nào.</p>
                  )}
                </div>

                {t.loi_dan_mac_dinh && (
                  <div className="text-[11px] text-slate-600 italic bg-amber-50/60 p-2 rounded border border-amber-100">
                    <strong className="text-amber-800">Lời dặn:</strong> "{t.loi_dan_mac_dinh}"
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Sửa Phác Đồ</span>
                </button>
                <button
                  onClick={() => handleDeleteTemplate(t.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Template Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate.id ? 'Chỉnh Sửa Phác Đồ Mẫu Bệnh' : 'Tạo Phác Đồ Mẫu Bệnh Mới'}
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên mẫu bệnh / Hội chứng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Cảm cúm thông thường / Viêm phế quản..."
              value={editingTemplate.ten_benh || ''}
              onChange={(e) =>
                setEditingTemplate({ ...editingTemplate, ten_benh: e.target.value })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Chẩn đoán chuẩn mặc định (Mã ICD hoặc mô tả)
            </label>
            <input
              type="text"
              placeholder="VD: Cảm cúm thông thường cấp tính (J00)..."
              value={editingTemplate.chan_doan_chuan || ''}
              onChange={(e) =>
                setEditingTemplate({ ...editingTemplate, chan_doan_chuan: e.target.value })
              }
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Lời dặn và chế độ chăm sóc mặc định
            </label>
            <textarea
              rows={2}
              placeholder="Uống nhiều nước ấm, nghỉ ngơi..."
              value={editingTemplate.loi_dan_mac_dinh || ''}
              onChange={(e) =>
                setEditingTemplate({ ...editingTemplate, loi_dan_mac_dinh: e.target.value })
              }
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>

          {/* Builder Section: Add items to template */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>Đơn Thuốc & Vật Tư Định Sẵn Trong Mẫu:</span>
              <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setItemType('thuoc');
                    setSelectedItemId('');
                  }}
                  className={`px-2 py-0.5 rounded font-semibold ${
                    itemType === 'thuoc' ? 'bg-sky-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Thuốc
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItemType('vat_tu');
                    setSelectedItemId('');
                  }}
                  className={`px-2 py-0.5 rounded font-semibold ${
                    itemType === 'vat_tu' ? 'bg-sky-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Vật Tư
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItemType('dich_vu_kt');
                    setSelectedItemId('');
                  }}
                  className={`px-2 py-0.5 rounded font-semibold ${
                    itemType === 'dich_vu_kt' ? 'bg-sky-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Dịch Vụ
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Chọn mục y tế
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : '';
                    setSelectedItemId(id);
                    if (itemType === 'thuoc' && id) {
                      const t = thuocList.find((x) => x.id === id);
                      if (t?.cach_dung_mac_dinh) setItemUsage(t.cach_dung_mac_dinh);
                    }
                  }}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {itemType === 'thuoc' &&
                    thuocList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.ten} ({t.don_vi_tinh})
                      </option>
                    ))}
                  {itemType === 'vat_tu' &&
                    vatTuList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.ten} ({v.don_vi_tinh})
                      </option>
                    ))}
                  {itemType === 'dich_vu_kt' &&
                    dichVuList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.ten} ({d.don_vi_tinh})
                      </option>
                    ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Số lượng
                </label>
                <input
                  type="number"
                  min={1}
                  value={itemQty}
                  onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold"
                />
              </div>

              <div className="sm:col-span-4">
                <button
                  type="button"
                  disabled={!selectedItemId}
                  onClick={handleAddItemToTemplate}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white rounded-lg font-bold flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm Mục</span>
                </button>
              </div>

              {itemType === 'thuoc' && (
                <div className="sm:col-span-12">
                  <input
                    type="text"
                    placeholder="Cách dùng mặc định (VD: Uống 1 viên x 2 lần/ngày sau ăn)..."
                    value={itemUsage}
                    onChange={(e) => setItemUsage(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs italic text-slate-700"
                  />
                </div>
              )}
            </div>

            {/* Added Details Table */}
            {templateDetails.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white mt-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600">
                      <th className="py-2.5 px-3">Tên Mục</th>
                      <th className="py-2.5 px-3 text-center">Số Lượng</th>
                      <th className="py-2.5 px-3">Cách Dùng</th>
                      <th className="py-2.5 px-3 text-center w-10">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {templateDetails.map((ct, idx) => {
                      const name = getItemName(ct);
                      const unit = getItemUnit(ct);
                      const isThuoc = ct.loai_muc === 'thuoc';
                      const isVatTu = ct.loai_muc === 'vat_tu';

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                                  isThuoc
                                    ? 'bg-sky-100 text-sky-700 border border-sky-200'
                                    : isVatTu
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                }`}
                              >
                                {isThuoc ? 'Thuốc' : isVatTu ? 'Vật tư' : 'Dịch vụ'}
                              </span>
                              <span className="font-semibold text-slate-800">{name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                            {ct.so_luong} {unit}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 italic">
                            {ct.cach_dung || 'Theo hướng dẫn'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveDetail(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Xóa mục này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">
                Chưa có thuốc hoặc vật tư nào được gán vào mẫu này.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold"
            >
              {editingTemplate.id ? 'Cập Nhật Mẫu Bệnh' : 'Lưu Mẫu Bệnh'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal xác nhận nạp 53 mẫu bệnh */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => !isSeeding && setIsResetConfirmOpen(false)}
        title="Xác Nhận Nạp & Đồng Bộ 53 Mẫu Bệnh Chuẩn Y Khoa"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Lưu ý khi đồng bộ lại danh sách mẫu bệnh:</p>
              <p>
                Thao tác này sẽ làm mới bảng mẫu bệnh và khởi tạo lại <strong>53 phác đồ điều trị ngoại trú chuẩn</strong>.
              </p>
              <p>
                Hệ thống sẽ tự động dùng thuật toán <strong>String Matching</strong> để ánh xạ tất cả thuốc, vật tư y tế, dịch vụ kỹ thuật về chính xác ID khóa ngoại (Foreign Key) trong cơ sở dữ liệu.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
            <p className="font-semibold text-slate-800">Quy trình thực hiện:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
              <li>Xóa sạch dữ liệu mẫu bệnh cũ (`mau_benh`, `mau_benh_chi_tiet`)</li>
              <li>Tự động điền mã ICD-10 và chẩn đoán tiêu chuẩn</li>
              <li>Thiết lập lời dặn, chế độ ăn uống, sinh hoạt chuẩn y khoa cho từng bệnh</li>
              <li>Giữ nguyên danh mục gốc và hồ sơ cán bộ</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSeeding}
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              disabled={isSeeding}
              onClick={handleSeed53Templates}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs transition-colors"
            >
              {isSeeding ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý & ánh xạ FK...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Xác Nhận Nạp 53 Mẫu Bệnh</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
