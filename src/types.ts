export interface DonViCap1 {
  id: number;
  ten: string;
  ghi_chu?: string;
  created_at?: string;
}

export interface DonViCap2 {
  id: number;
  id_don_vi_cap_1: number;
  ten: string;
  ghi_chu?: string;
  created_at?: string;
}

export interface TheBHYT {
  ma_the_bhyt: string;
  tu_ngay: string;
  den_ngay: string;
}

export interface BacSi {
  id: number;
  ho_ten: string;
  the_bhyt?: string;
  ngay_sinh?: string;
  gioi_tinh: 'Nam' | 'Nữ' | 'Khác';
  id_don_vi?: number;
  ten_don_vi?: string;
  ten_don_vi_cap_1?: string;
  chuyen_mon?: string;
  ghi_chu?: string;
}

export interface CanBo {
  id: number;
  ho_ten: string;
  ngay_sinh?: string;
  ma_the_bhyt?: string;
  gioi_tinh: 'Nam' | 'Nữ' | 'Khác';
  id_don_vi_cap_2?: number;
  ten_don_vi?: string;
  cap_bac?: string;
  chuc_vu?: string;
}
export type NhanSu = CanBo; // Alias for backward compatibility if needed, though we will try to replace it.
export type CoQuan = DonViCap2; // Alias for backward compatibility.


export interface Thuoc {
  id: number;
  ten: string;
  don_vi_tinh: string;
  don_gia: number;
  ghi_chu?: string;
  ton_kho?: number;
  ham_luong?: string;
  cach_dung_mac_dinh?: string;
}

export interface VatTu {
  id: number;
  ten: string;
  don_vi_tinh: string;
  don_gia: number;
  ghi_chu?: string;
  ton_kho?: number;
}

export interface DichVuKT {
  id: number;
  ten: string;
  don_vi_tinh: string;
  don_gia: number;
  ghi_chu?: string;
}

export interface MauBenhChiTiet {
  id?: number;
  id_mau_benh?: number;
  loai_muc: 'thuoc' | 'vat_tu' | 'dich_vu_kt' | string;
  id_muc: number;
  ten_muc?: string;
  don_vi_tinh?: string;
  don_gia?: number;
  so_luong: number;
  thanh_tien?: number;
  cach_dung?: string;
  ghi_chu?: string;
  thuoc_id?: number;
  vat_tu_id?: number;
  dich_vu_id?: number;
  ten_thuoc?: string;
  ten_vat_tu?: string;
  ten_dich_vu?: string;
}

export interface MauBenh {
  id: number;
  ten_benh: string;
  chan_doan_chuan?: string;
  loi_dan_mac_dinh?: string;
  ghi_chu?: string;
  chi_tiet?: MauBenhChiTiet[];
}

export interface HoSoKhamChiTiet {
  id?: number;
  id_ho_so?: number;
  loai_muc: 'thuoc' | 'vat_tu' | 'dich_vu_kt' | string;
  id_muc: number;
  ten_muc: string;
  don_vi_tinh: string;
  so_luong: number;
  don_gia: number;
  thanh_tien: number;
  cach_dung?: string;
  ghi_chu?: string;
  thuoc_id?: number;
  vat_tu_id?: number;
  dich_vu_id?: number;
  ten_thuoc?: string;
  ten_vat_tu?: string;
  ten_dich_vu?: string;
}

export interface HoSoKham {
  id: number;
  ma_ho_so: string;
  id_nhan_su: number;
  ten_nhan_su?: string;
  the_bhyt?: string;
  ngay_sinh_nhan_su?: string;
  gioi_tinh_nhan_su?: string;
  ten_don_vi_nhan_su?: string;
  ten_don_vi_cap_1?: string;
  ten_don_vi_cap_2?: string;
  cap_bac_nhan_su?: string;
  chuc_vu_nhan_su?: string;
  ma_the_bhyt?: string;
  ngay_kham: string;
  trieu_chung: string;
  mach?: number;
  nhiet_do?: number;
  huyet_ap?: string;
  nhip_tho?: number;
  can_nang?: number;
  chieu_cao?: number;
  chan_doan: string;
  id_mau_benh?: number;
  ten_mau_benh?: string;
  id_bac_si: number;
  ten_bac_si?: string;
  loi_dan?: string;
  tong_chi_phi: number;
  trang_thai_bhyt: number; // 0: Tự chi trả, 1: Hưởng BHYT (80-100%), 2: Cơ quan cấp miễn phí
  ngay_tai_kham?: string;
  trang_thai_kham: 'dang_kham' | 'hoan_thanh' | 'chuyen_tuyen';
  chi_tiet?: HoSoKhamChiTiet[];
}

export interface NguoiDung {
  id: number;
  ten_dang_nhap: string;
  mat_khau?: string;
  ho_ten: string;
  vai_tro: 'admin' | 'bac_si' | 'y_si' | 'duoc_si';
  id_bac_si?: number;
  trang_thai?: number;
  created_at?: string;
}

export type TabType = 
  | 'dashboard'
  | 'kham_benh'
  | 'ho_so_kham'
  | 'benh_nhan'
  | 'mau_benh'
  | 'danh_muc'
  | 'bac_si'
  | 'bao_cao'
  | 'co_so_du_lieu';
