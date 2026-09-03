/**
 * seed53MauBenh.ts
 * Khởi tạo toàn diện 53 mẫu bệnh / phác đồ điều trị ngoại trú chuẩn y khoa
 * Ánh xạ khóa ngoại (Foreign Key) chính xác bằng giải thuật String Matching
 */

export interface RawTemplateItem {
  ten: string;
  so_luong: number;
  don_vi_tinh?: string;
  don_gia?: number;
  cach_dung?: string;
  ghi_chu?: string;
}

export interface RawDiseaseTemplate {
  trang: number;
  ten_benh: string;
  icd_10: string;
  chan_doan_chuan: string;
  loi_dan_mac_dinh: string;
  ghi_chu?: string;
  thuoc?: RawTemplateItem[];
  vat_tu?: RawTemplateItem[];
  dich_vu?: RawTemplateItem[];
}

export const LIST_53_MAU_BENH: RawDiseaseTemplate[] = [
  {
    trang: 1,
    ten_benh: "ac",
    icd_10: "",
    chan_doan_chuan: "ac",
    loi_dan_mac_dinh: "Sử dụng thuốc đúng liều lượng, tái khám khi có bất thường.",
    ghi_chu: '',
    thuoc: [
      { ten: "Amoxilin 500 mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 2000 },
      { ten: "Yumangel", so_luong: 10, don_vi_tinh: "Gói", don_gia: 5250 }
    ]
  },
  {
    trang: 2,
    ten_benh: "as",
    icd_10: "",
    chan_doan_chuan: "as",
    loi_dan_mac_dinh: "Sử dụng thuốc đúng liều lượng, tái khám khi có bất thường.",
    ghi_chu: '',
    thuoc: [
      { ten: "Gaviscon", so_luong: 1, don_vi_tinh: "Gói", don_gia: 7000 },
      { ten: "Băng thun 3 móc", so_luong: 2, don_vi_tinh: "Cuộn", don_gia: 18000 }
    ],
    vat_tu: [
      { ten: "Gạc vô khuẩn", so_luong: 2, don_vi_tinh: "Miếng", don_gia: 8500 }
    ],
    dich_vu: [
      { ten: "Xoa bóp cục bộ bằng tay", so_luong: 2, don_vi_tinh: "Lần", don_gia: 51300 },
      { ten: "Chiếu đèn hồng ngoại", so_luong: 2, don_vi_tinh: "Lần", don_gia: 40900 }
    ]
  },
  {
    trang: 3,
    ten_benh: "bạnh a",
    icd_10: "",
    chan_doan_chuan: "bạnh a",
    loi_dan_mac_dinh: "Sử dụng thuốc đúng liều lượng, tái khám khi có bất thường.",
    ghi_chu: '',
    thuoc: [
      { ten: "Beroca", so_luong: 7800, don_vi_tinh: "Viên", don_gia: 0 },
      { ten: "Amlodipine 10mg", so_luong: 1800, don_vi_tinh: "Viên", don_gia: 0 }
    ]
  },
  {
    trang: 4,
    ten_benh: "bbbbb",
    icd_10: "",
    chan_doan_chuan: "bbbbb",
    loi_dan_mac_dinh: "Sử dụng thuốc đúng liều lượng, tái khám khi có bất thường.",
    ghi_chu: '',
    thuoc: [
      { ten: "Amoxicilin 500mg", so_luong: 24, don_vi_tinh: "Viên", don_gia: 2000 },
      { ten: "Cefadroxil 500mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 2500 },
      { ten: "Shinphagel", so_luong: 20, don_vi_tinh: "Gói", don_gia: 4000 },
      { ten: "Esomeprazol HV 40 mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 4000 }
    ]
  },
  {
    trang: 5,
    ten_benh: "Chấn thương gối (P)",
    icd_10: "S80.0",
    chan_doan_chuan: "Chấn thương gối (P)",
    loi_dan_mac_dinh: "Nghỉ ngơi, chườm lạnh, hạn chế vận động mạnh.",
    ghi_chu: '',
    thuoc: [
      { ten: "Klamentin 875/125 mg", so_luong: 14, don_vi_tinh: "Viên", don_gia: 8800 },
      { ten: "Hapacol sủi", so_luong: 16, don_vi_tinh: "Viên", don_gia: 2200 },
      { ten: "Alphachymotrypsin Choay 21microka", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2400 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 }
    ],
    vat_tu: [
      { ten: "Băng thun 3 móc", so_luong: 2, don_vi_tinh: "Cuộn", don_gia: 18000 }
    ]
  },
  {
    trang: 6,
    ten_benh: "Chấn thương gối (T)",
    icd_10: "S80.0",
    chan_doan_chuan: "Chấn thương gối (T)",
    loi_dan_mac_dinh: "Nghỉ ngơi, chườm lạnh, hạn chế vận động mạnh.",
    ghi_chu: '',
    thuoc: [
      { ten: "Klamentin 875/125 mg", so_luong: 14, don_vi_tinh: "Viên", don_gia: 8800 },
      { ten: "Hapacol sủi", so_luong: 16, don_vi_tinh: "Viên", don_gia: 2200 },
      { ten: "Alphachymotrypsin Choay 21microka", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2400 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 }
    ],
    vat_tu: [
      { ten: "Băng thun 3 móc", so_luong: 2, don_vi_tinh: "Cuộn", don_gia: 18000 }
    ]
  },
  {
    trang: 7,
    ten_benh: "Chấn thương mỏm khuỷu (P)",
    icd_10: "S50.0",
    chan_doan_chuan: "Chấn thương mỏm khuỷu (P)",
    loi_dan_mac_dinh: "Nghỉ ngơi, chườm lạnh, hạn chế vận động cánh tay.",
    ghi_chu: '',
    thuoc: [
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Hapacol sủi", so_luong: 16, don_vi_tinh: "Viên", don_gia: 2200 },
      { ten: "Alphachymotrypsin Choay 21microka", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2400 },
      { ten: "Klamentin 875/125 mg", so_luong: 14, don_vi_tinh: "Viên", don_gia: 8800 }
    ],
    vat_tu: [
      { ten: "Băng thun 3 móc", so_luong: 18000, don_vi_tinh: "Cuộn", don_gia: 0 }
    ]
  },
  {
    trang: 8,
    ten_benh: "Chấn thương mỏm khuỷu (T)",
    icd_10: "S50.0",
    chan_doan_chuan: "Chấn thương mỏm khuỷu (T)",
    loi_dan_mac_dinh: "Nghỉ ngơi, chườm lạnh, hạn chế vận động cánh tay.",
    ghi_chu: '',
    thuoc: [
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Hapacol sủi", so_luong: 16, don_vi_tinh: "Viên", don_gia: 2200 },
      { ten: "Alphachymotrypsin Choay 21microka", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2400 },
      { ten: "Klamentin 875/125 mg", so_luong: 14, don_vi_tinh: "Viên", don_gia: 8800 }
    ],
    vat_tu: [
      { ten: "Băng thun 3 móc", so_luong: 18000, don_vi_tinh: "Cuộn", don_gia: 0 }
    ]
  },
  {
    trang: 9,
    ten_benh: "Chấn thương vùng gối T",
    icd_10: "",
    chan_doan_chuan: "Chấn thương vùng gối T",
    loi_dan_mac_dinh: "Sử dụng thuốc đúng liều lượng, tái khám khi có bất thường.",
    ghi_chu: '',
    thuoc: [
      { ten: "Auclatyl 1g", so_luong: 14, don_vi_tinh: "Viên", don_gia: 8500 },
      { ten: "Hapacol sủi", so_luong: 16, don_vi_tinh: "Viên", don_gia: 2200 },
      { ten: "Alphachymotrypsin Choay 21microka", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2400 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 }
    ],
    vat_tu: [
      { ten: "Băng thun 3 móc", so_luong: 2, don_vi_tinh: "Cuộn", don_gia: 18000 },
      { ten: "Gạc vô khuẩn", so_luong: 3, don_vi_tinh: "Miếng", don_gia: 8500 },
      { ten: "NaCL 0,9% 500ml HD", so_luong: 1, don_vi_tinh: "Chai", don_gia: 13000 }
    ]
  },
  {
    trang: 10,
    ten_benh: "Đau cột sống thắt lưng",
    icd_10: "M54.5",
    chan_doan_chuan: "Đau cột sống thắt lưng",
    loi_dan_mac_dinh: "Nghỉ ngơi, tránh mang vác nặng, chườm ấm vùng đau.",
    ghi_chu: '',
    thuoc: [
      { ten: "Panadol Extra", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1500 },
      { ten: "Beroca", so_luong: 5, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Voltaren 75 mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7000 },
      { ten: "Esomeprazol HV 40 mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 4000 }
    ],
    dich_vu: [
      { ten: "Xoa bóp cục bộ bằng tay", so_luong: 5, don_vi_tinh: "Lần", don_gia: 51300 },
      { ten: "Chiếu đèn hồng ngoại", so_luong: 5, don_vi_tinh: "Lần", don_gia: 40900 }
    ]
  },
  {
    trang: 11,
    ten_benh: "Đau đầu, viêm mũi dị ứng",
    icd_10: "J30.4",
    chan_doan_chuan: "Đau đầu, viêm mũi dị ứng",
    loi_dan_mac_dinh: "Uống nhiều nước ấm, tránh tiếp xúc khói bụi và dị nguyên.",
    ghi_chu: '',
    thuoc: [
      { ten: "Hapacol sủi", so_luong: 16, don_vi_tinh: "Viên", don_gia: 2200 },
      { ten: "Beroca", so_luong: 5, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Medrol 16mg", so_luong: 14, don_vi_tinh: "Viên", don_gia: 4600 },
      { ten: "Telfast HD 180 mg", so_luong: 18, don_vi_tinh: "Viên", don_gia: 8500 }
    ]
  },
  {
    trang: 12,
    ten_benh: "Đau răng",
    icd_10: "K08.8",
    chan_doan_chuan: "Đau răng",
    loi_dan_mac_dinh: "Vệ sinh răng miệng sạch sẽ, tái khám nha khoa theo hẹn.",
    ghi_chu: '',
    thuoc: [
      { ten: "Amoxilin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2000 },
      { ten: "Hapacol sủi", so_luong: 12, don_vi_tinh: "Viên", don_gia: 2200 },
      { ten: "Voltaren 75 mg", so_luong: 15, don_vi_tinh: "Viên", don_gia: 7000 },
      { ten: "Pharmaton Energy", so_luong: 10, don_vi_tinh: "Viên", don_gia: 2800 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 }
    ]
  },
  {
    trang: 13,
    ten_benh: "Đau thắt cột sống, thắt lưng",
    icd_10: "M54.5",
    chan_doan_chuan: "Đau thắt cột sống, thắt lưng",
    loi_dan_mac_dinh: "Nghỉ ngơi, tránh mang vác nặng, chườm ấm vùng đau.",
    ghi_chu: '',
    thuoc: [
      { ten: "Panadol Extra", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1500 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 }
    ],
    dich_vu: [
      { ten: "Xoa bóp cục bộ bằng tay", so_luong: 3, don_vi_tinh: "Lần", don_gia: 20000 },
      { ten: "Chiếu đèn hồng ngoại", so_luong: 3, don_vi_tinh: "Lần", don_gia: 20000 }
    ]
  },
  {
    trang: 14,
    ten_benh: "Đau tủy răng",
    icd_10: "K08.8",
    chan_doan_chuan: "Đau tủy răng",
    loi_dan_mac_dinh: "Vệ sinh răng miệng sạch sẽ, tái khám nha khoa theo hẹn.",
    ghi_chu: '',
    thuoc: [
      { ten: "Amoxilin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2000 },
      { ten: "Hapacol sủi", so_luong: 12, don_vi_tinh: "Viên", don_gia: 2200 },
      { ten: "Voltaren 75 mg", so_luong: 15, don_vi_tinh: "Viên", don_gia: 7000 },
      { ten: "Pharmaton Energy", so_luong: 10, don_vi_tinh: "Viên", don_gia: 2800 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 }
    ]
  },
  {
    trang: 15,
    ten_benh: "Hội chứng ruột kích thích",
    icd_10: "K58",
    chan_doan_chuan: "Hội chứng ruột kích thích",
    loi_dan_mac_dinh: "Ăn uống đúng giờ, tránh thức ăn cay nóng, giảm căng thẳng.",
    ghi_chu: '',
    thuoc: [
      { ten: "Amoxilin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2000 },
      { ten: "Berberin 100mg (VN)", so_luong: 20, don_vi_tinh: "Viên", don_gia: 680 },
      { ten: "No-Spa 40mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1200 },
      { ten: "Yumangel", so_luong: 20, don_vi_tinh: "Gói", don_gia: 5250 },
      { ten: "Beroca", so_luong: 5, don_vi_tinh: "Viên", don_gia: 7800 }
    ]
  },
  {
    trang: 16,
    ten_benh: "Loét dạ dày - tá tràng",
    icd_10: "K27",
    chan_doan_chuan: "Loét dạ dày - tá tràng",
    loi_dan_mac_dinh: "Ăn uống đúng giờ, kiêng đồ chua cay, không thức khuya, kiêng rượu bia.",
    ghi_chu: '',
    thuoc: [
      { ten: "Amoxilin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2000 },
      { ten: "Azithromycin 500mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7200 },
      { ten: "Yumangel", so_luong: 10, don_vi_tinh: "Gói", don_gia: 5250 },
      { ten: "Esomeprazol HV 40 mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 4000 },
      { ten: "Pharmaton Energy", so_luong: 10, don_vi_tinh: "Viên", don_gia: 2800 }
    ]
  },
  {
    trang: 17,
    ten_benh: "Nấm da bội nhiễm",
    icd_10: "B35",
    chan_doan_chuan: "Nấm da bội nhiễm",
    loi_dan_mac_dinh: "Giữ vệ sinh da sạch sẽ, mặc đồ thoáng mát, bôi thuốc theo đúng chỉ định.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefalexin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 3000 },
      { ten: "Fluconazol 150 mg", so_luong: 14, don_vi_tinh: "Viên", don_gia: 8000 },
      { ten: "Silkeron 10mg", so_luong: 2, don_vi_tinh: "Tuýp", don_gia: 19000 },
      { ten: "Loratadin 10mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 650 },
      { ten: "Beroca", so_luong: 5, don_vi_tinh: "Viên", don_gia: 7800 }
    ]
  },
  {
    trang: 18,
    ten_benh: "Nấm da đầu",
    icd_10: "B35",
    chan_doan_chuan: "Nấm da đầu",
    loi_dan_mac_dinh: "Giữ vệ sinh da sạch sẽ, mặc đồ thoáng mát, bôi thuốc theo đúng chỉ định.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefalexin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 3000 },
      { ten: "Fluconazol 150 mg", so_luong: 14, don_vi_tinh: "Viên", don_gia: 8000 },
      { ten: "Silkeron 10mg", so_luong: 2, don_vi_tinh: "Tuýp", don_gia: 19000 },
      { ten: "Loratadin 10mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 650 },
      { ten: "Beroca", so_luong: 5, don_vi_tinh: "Viên", don_gia: 7800 }
    ]
  },
  {
    trang: 19,
    ten_benh: "Nấm da toàn thân",
    icd_10: "B35",
    chan_doan_chuan: "Nấm da toàn thân",
    loi_dan_mac_dinh: "Giữ vệ sinh da sạch sẽ, mặc đồ thoáng mát, bôi thuốc theo đúng chỉ định.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefalexin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 3000 },
      { ten: "Fluconazol 150 mg", so_luong: 14, don_vi_tinh: "Viên", don_gia: 8000 },
      { ten: "Silkeron 10mg", so_luong: 2, don_vi_tinh: "Tuýp", don_gia: 19000 },
      { ten: "Loratadin 10mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 650 },
      { ten: "Beroca", so_luong: 5, don_vi_tinh: "Viên", don_gia: 7800 }
    ]
  },
  {
    trang: 20,
    ten_benh: "Nấm da vùng bẹn",
    icd_10: "B35",
    chan_doan_chuan: "Nấm da vùng bẹn",
    loi_dan_mac_dinh: "Giữ vệ sinh da sạch sẽ, mặc đồ thoáng mát, bôi thuốc theo đúng chỉ định.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefalexin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 3000 },
      { ten: "Fluconazol 150 mg", so_luong: 14, don_vi_tinh: "Viên", don_gia: 8000 },
      { ten: "Silkeron 10mg", so_luong: 2, don_vi_tinh: "Tuýp", don_gia: 19000 },
      { ten: "Loratadin 10mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 650 },
      { ten: "Beroca", so_luong: 5, don_vi_tinh: "Viên", don_gia: 7800 }
    ]
  },
  {
    trang: 21,
    ten_benh: "Nấm da, Bội nhiễm",
    icd_10: "B35",
    chan_doan_chuan: "Nấm da, Bội nhiễm",
    loi_dan_mac_dinh: "Giữ vệ sinh da sạch sẽ, mặc đồ thoáng mát, bôi thuốc theo đúng chỉ định.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefalexin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 3000 },
      { ten: "Fluconazol 150 mg", so_luong: 14, don_vi_tinh: "Viên", don_gia: 8000 },
      { ten: "Silkeron 10mg", so_luong: 2, don_vi_tinh: "Tuýp", don_gia: 19000 },
      { ten: "Loratadin 10mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 650 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 }
    ]
  },
  {
    trang: 22,
    ten_benh: "Nấm ống tai",
    icd_10: "H65",
    chan_doan_chuan: "Nấm ống tai",
    loi_dan_mac_dinh: "Giữ tai khô ráo, không tự ý dùng tăm bông ngoáy sâu vào tai.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefalexin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 3000 },
      { ten: "Medrol 16mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 4600 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Panadol Extra", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1500 }
    ]
  },
  {
    trang: 23,
    ten_benh: "Rối loạn tiêu hóa",
    icd_10: "K30",
    chan_doan_chuan: "Rối loạn tiêu hóa",
    loi_dan_mac_dinh: "Ăn thức ăn chín, dễ tiêu, uống đủ nước, nghỉ ngơi hợp lý.",
    ghi_chu: '',
    thuoc: [
      { ten: "Esomeprazol HV 40 mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 4000 },
      { ten: "Enterogermina", so_luong: 10, don_vi_tinh: "Gói", don_gia: 8500 },
      { ten: "No-Spa 40mg", so_luong: 30, don_vi_tinh: "Viên", don_gia: 1200 },
      { ten: "Pharmaton Energy", so_luong: 10, don_vi_tinh: "Viên", don_gia: 2800 }
    ]
  },
  {
    trang: 24,
    ten_benh: "Suy nhược cơ thể, dạ dày",
    icd_10: "K27",
    chan_doan_chuan: "Suy nhược cơ thể, dạ dày",
    loi_dan_mac_dinh: "Ăn uống đúng giờ, kiêng đồ chua cay, không thức khuya, kiêng rượu bia.",
    ghi_chu: '',
    thuoc: [
      { ten: "Esomeprazol HV 40 mg", so_luong: 30, don_vi_tinh: "Viên", don_gia: 4000 },
      { ten: "Enterogermina", so_luong: 10, don_vi_tinh: "Gói", don_gia: 8500 },
      { ten: "Silymarin 140mg", so_luong: 30, don_vi_tinh: "Viên", don_gia: 1700 },
      { ten: "Pharmaton Energy", so_luong: 20, don_vi_tinh: "Viên", don_gia: 2800 }
    ]
  },
  {
    trang: 25,
    ten_benh: "Tăng huyết áp, tăng men gan",
    icd_10: "I10",
    chan_doan_chuan: "Tăng huyết áp, tăng men gan",
    loi_dan_mac_dinh: "Ăn nhạt, theo dõi huyết áp hàng ngày, duy trì tập thể dục nhẹ nhàng.",
    ghi_chu: '',
    thuoc: [
      { ten: "Amlodipine 10mg", so_luong: 30, don_vi_tinh: "Viên", don_gia: 1800 },
      { ten: "Silymarin 140mg", so_luong: 30, don_vi_tinh: "Viên", don_gia: 1700 },
      { ten: "Vastarel MR 35mg", so_luong: 30, don_vi_tinh: "Viên", don_gia: 3500 }
    ]
  },
  {
    trang: 26,
    ten_benh: "Tăng huyết áp",
    icd_10: "I10",
    chan_doan_chuan: "Tăng huyết áp",
    loi_dan_mac_dinh: "Ăn nhạt, theo dõi huyết áp hàng ngày, duy trì tập thể dục nhẹ nhàng.",
    ghi_chu: '',
    thuoc: [
      { ten: "Amlodipine 10mg", so_luong: 30, don_vi_tinh: "Viên", don_gia: 1800 },
      { ten: "Silymarin 140mg", so_luong: 30, don_vi_tinh: "Viên", don_gia: 1700 },
      { ten: "Vastarel MR 35mg", so_luong: 30, don_vi_tinh: "Viên", don_gia: 3500 }
    ]
  },
  {
    trang: 27,
    ten_benh: "Tiêu chảy cấp",
    icd_10: "K30",
    chan_doan_chuan: "Tiêu chảy cấp",
    loi_dan_mac_dinh: "Ăn thức ăn chín, dễ tiêu, uống đủ nước, nghỉ ngơi hợp lý.",
    ghi_chu: '',
    thuoc: [
      { ten: "Amoxilin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2000 },
      { ten: "Berberin 100mg (VN)", so_luong: 20, don_vi_tinh: "Viên", don_gia: 680 },
      { ten: "No-Spa 40mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1200 },
      { ten: "Yumangel", so_luong: 20, don_vi_tinh: "Gói", don_gia: 5250 },
      { ten: "Beroca", so_luong: 5, don_vi_tinh: "Viên", don_gia: 7800 }
    ]
  },
  {
    trang: 28,
    ten_benh: "Tiêu chảy, dạ dày",
    icd_10: "K27",
    chan_doan_chuan: "Tiêu chảy, dạ dày",
    loi_dan_mac_dinh: "Ăn uống đúng giờ, kiêng đồ chua cay, không thức khuya, kiêng rượu bia.",
    ghi_chu: '',
    thuoc: [
      { ten: "Auclatyl 1g", so_luong: 14, don_vi_tinh: "Viên", don_gia: 8500 },
      { ten: "Berberin 100mg (VN)", so_luong: 20, don_vi_tinh: "Viên", don_gia: 680 },
      { ten: "No-Spa 40mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1200 },
      { ten: "Shinphagel", so_luong: 20, don_vi_tinh: "Gói", don_gia: 4000 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 }
    ]
  },
  {
    trang: 29,
    ten_benh: "Vết thương phần mềm cẳng chân (P)",
    icd_10: "T14.1",
    chan_doan_chuan: "Vết thương phần mềm cẳng chân (P)",
    loi_dan_mac_dinh: "Rửa và thay băng vết thương hàng ngày, tránh để vết thương dính nước dơ.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefadroxil 500mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2500 },
      { ten: "Medrol 16mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 4600 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Panadol Extra", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1500 }
    ]
  },
  {
    trang: 30,
    ten_benh: "Vết thương phần mềm cẳng chân (T)",
    icd_10: "T14.1",
    chan_doan_chuan: "Vết thương phần mềm cẳng chân (T)",
    loi_dan_mac_dinh: "Rửa và thay băng vết thương hàng ngày, tránh để vết thương dính nước dơ.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefadroxil 500mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2500 },
      { ten: "Medrol 16mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 4600 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Panadol Extra", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1500 }
    ]
  },
  {
    trang: 31,
    ten_benh: "Vết thương phần mềm cẳng tay (P)",
    icd_10: "T14.1",
    chan_doan_chuan: "Vết thương phần mềm cẳng tay (P)",
    loi_dan_mac_dinh: "Rửa và thay băng vết thương hàng ngày, tránh để vết thương dính nước dơ.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefadroxil 500mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2500 },
      { ten: "Medrol 16mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 4600 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Panadol Extra", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1500 }
    ]
  },
  {
    trang: 32,
    ten_benh: "Vết thương phần mềm cẳng tay (T)",
    icd_10: "T14.1",
    chan_doan_chuan: "Vết thương phần mềm cẳng tay (T)",
    loi_dan_mac_dinh: "Rửa và thay băng vết thương hàng ngày, tránh để vết thương dính nước dơ.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefadroxil 500mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2500 },
      { ten: "Medrol 16mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 4600 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Panadol Extra", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1500 }
    ]
  },
  {
    trang: 33,
    ten_benh: "Vết thương phần mềm mặt",
    icd_10: "T14.1",
    chan_doan_chuan: "Vết thương phần mềm mặt",
    loi_dan_mac_dinh: "Rửa và thay băng vết thương hàng ngày, tránh để vết thương dính nước dơ.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefadroxil 500mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2500 },
      { ten: "Medrol 16mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 4600 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Panadol Extra", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1500 }
    ]
  },
  {
    trang: 34,
    ten_benh: "Vết thương trầy xước da",
    icd_10: "T14.1",
    chan_doan_chuan: "Vết thương trầy xước da",
    loi_dan_mac_dinh: "Rửa và thay băng vết thương hàng ngày, tránh để vết thương dính nước dơ.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefadroxil 500mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2500 },
      { ten: "Panadol Extra", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1500 },
      { ten: "Alphachymotrypsin Choay 21microka", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2400 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 }
    ],
    vat_tu: [
      { ten: "Povidin", so_luong: 10, don_vi_tinh: "chai", don_gia: 90 }
    ]
  },
  {
    trang: 35,
    ten_benh: "Viêm amydal",
    icd_10: "J03",
    chan_doan_chuan: "Viêm amydal",
    loi_dan_mac_dinh: "Súc họng bằng nước muối sinh lý ấm, giữ ấm cổ, uống đủ nước.",
    ghi_chu: '',
    thuoc: [
      { ten: "Augmentin 625 mg", so_luong: 14, don_vi_tinh: "Viên", don_gia: 13000 },
      { ten: "Voltaren 75 mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7000 },
      { ten: "Hapacol sủi", so_luong: 10, don_vi_tinh: "Viên", don_gia: 2200 },
      { ten: "Homtamin Ginseng", so_luong: 20, don_vi_tinh: "Viên", don_gia: 2300 }
    ]
  },
  {
    trang: 36,
    ten_benh: "Viêm da bội nhiễm",
    icd_10: "L23",
    chan_doan_chuan: "Viêm da bội nhiễm",
    loi_dan_mac_dinh: "Giữ da sạch, tránh gãi hoặc chà xát mạnh, dùng thuốc đều đặn.",
    ghi_chu: '',
    thuoc: [
      { ten: "SOSLac G3", so_luong: 2, don_vi_tinh: "tube", don_gia: 29000 },
      { ten: "Beroca", so_luong: 5, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Cefuroxim 500 mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 5000 },
      { ten: "Azithromycin 500mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7200 }
    ]
  },
  {
    trang: 37,
    ten_benh: "Viêm dạ dày",
    icd_10: "K27",
    chan_doan_chuan: "Viêm dạ dày",
    loi_dan_mac_dinh: "Ăn uống đúng giờ, kiêng đồ chua cay, không thức khuya, kiêng rượu bia.",
    ghi_chu: '',
    thuoc: [
      { ten: "Amoxilin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2000 },
      { ten: "Azithromycin 500mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7200 },
      { ten: "Yumangel", so_luong: 10, don_vi_tinh: "Gói", don_gia: 5250 },
      { ten: "Esomeprazol HV 40 mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 4000 },
      { ten: "Pharmaton Energy", so_luong: 10, don_vi_tinh: "Viên", don_gia: 2800 }
    ]
  },
  {
    trang: 38,
    ten_benh: "Viêm da tiếp xúc do dị ứng",
    icd_10: "L23",
    chan_doan_chuan: "Viêm da tiếp xúc do dị ứng",
    loi_dan_mac_dinh: "Giữ da sạch, tránh gãi hoặc chà xát mạnh, dùng thuốc đều đặn.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefuroxim 500 mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 5000 },
      { ten: "Azithromycin 500mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7200 },
      { ten: "Beroca", so_luong: 5, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "SOSLac G3", so_luong: 2, don_vi_tinh: "tube", don_gia: 29000 }
    ]
  },
  {
    trang: 39,
    ten_benh: "Viêm da",
    icd_10: "L23",
    chan_doan_chuan: "Viêm da",
    loi_dan_mac_dinh: "Giữ da sạch, tránh gãi hoặc chà xát mạnh, dùng thuốc đều đặn.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefuroxim 500 mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 5000 },
      { ten: "Azithromycin 500mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7200 },
      { ten: "Beroca", so_luong: 5, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "SOSLac G3", so_luong: 2, don_vi_tinh: "tube", don_gia: 29000 }
    ]
  },
  {
    trang: 40,
    ten_benh: "Viêm họng cấp",
    icd_10: "J03",
    chan_doan_chuan: "Viêm họng cấp",
    loi_dan_mac_dinh: "Súc họng bằng nước muối sinh lý ấm, giữ ấm cổ, uống đủ nước.",
    ghi_chu: '',
    thuoc: [
      { ten: "Augmentin 625 mg", so_luong: 14, don_vi_tinh: "Viên", don_gia: 13000 },
      { ten: "Voltaren 75 mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7000 },
      { ten: "Hapacol sủi", so_luong: 10, don_vi_tinh: "Viên", don_gia: 2200 },
      { ten: "Homtamin Ginseng", so_luong: 20, don_vi_tinh: "Viên", don_gia: 2300 }
    ]
  },
  {
    trang: 41,
    ten_benh: "Viêm họng, viêm dạ dày",
    icd_10: "K27",
    chan_doan_chuan: "Viêm họng, viêm dạ dày",
    loi_dan_mac_dinh: "Ăn uống đúng giờ, kiêng đồ chua cay, không thức khuya, kiêng rượu bia.",
    ghi_chu: '',
    thuoc: [
      { ten: "Auclatyl 1g", so_luong: 14, don_vi_tinh: "Viên", don_gia: 8500 },
      { ten: "Panadol Extra", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1500 },
      { ten: "No-Spa 40mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1200 },
      { ten: "Esomeprazol HV 40 mg", so_luong: 30, don_vi_tinh: "Viên", don_gia: 4000 }
    ]
  },
  {
    trang: 42,
    ten_benh: "Viêm họng,viêm dạ dày",
    icd_10: "K27",
    chan_doan_chuan: "Viêm họng,viêm dạ dày",
    loi_dan_mac_dinh: "Ăn uống đúng giờ, kiêng đồ chua cay, không thức khuya, kiêng rượu bia.",
    ghi_chu: '',
    thuoc: [
      { ten: "Klamentin 875/125 mg", so_luong: 14, don_vi_tinh: "Viên", don_gia: 8800 },
      { ten: "Panadol Extra", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1500 },
      { ten: "No-Spa 40mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1200 },
      { ten: "Esomeprazol HV 40 mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 4000 }
    ]
  },
  {
    trang: 43,
    ten_benh: "Viêm kết mạc dị ứng",
    icd_10: "H10",
    chan_doan_chuan: "Viêm kết mạc dị ứng",
    loi_dan_mac_dinh: "Đeo kính râm khi ra ngoài, nhỏ mắt thường xuyên, không dùng chung khăn mặt.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefadroxil 500mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2500 },
      { ten: "Alphachymotrypsin Choay 21microka", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2400 },
      { ten: "Telfast HD 180 mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 8500 },
      { ten: "Tobramycin", so_luong: 2, don_vi_tinh: "Lọ", don_gia: 16000 }
    ]
  },
  {
    trang: 44,
    ten_benh: "Viêm kết mạc kích ứng",
    icd_10: "H10",
    chan_doan_chuan: "Viêm kết mạc kích ứng",
    loi_dan_mac_dinh: "Đeo kính râm khi ra ngoài, nhỏ mắt thường xuyên, không dùng chung khăn mặt.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefadroxil 500mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2500 },
      { ten: "Alphachymotrypsin Choay 21microka", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2400 },
      { ten: "Telfast HD 180 mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 8500 },
      { ten: "Tobramycin", so_luong: 2, don_vi_tinh: "Lọ", don_gia: 16000 }
    ]
  },
  {
    trang: 45,
    ten_benh: "Viêm kết mạc mắt",
    icd_10: "H10",
    chan_doan_chuan: "Viêm kết mạc mắt",
    loi_dan_mac_dinh: "Đeo kính râm khi ra ngoài, nhỏ mắt thường xuyên, không dùng chung khăn mặt.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefadroxil 500mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2500 },
      { ten: "Alphachymotrypsin Choay 21microka", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2400 },
      { ten: "Telfast HD 180 mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 8500 },
      { ten: "Tobramycin", so_luong: 2, don_vi_tinh: "Lọ", don_gia: 16000 }
    ]
  },
  {
    trang: 46,
    ten_benh: "Viêm kết mạc",
    icd_10: "H10",
    chan_doan_chuan: "Viêm kết mạc",
    loi_dan_mac_dinh: "Đeo kính râm khi ra ngoài, nhỏ mắt thường xuyên, không dùng chung khăn mặt.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefadroxil 500mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2500 },
      { ten: "Alphachymotrypsin Choay 21microka", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2400 },
      { ten: "Telfast HD 180 mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 8500 },
      { ten: "Tobramycin", so_luong: 2, don_vi_tinh: "Lọ", don_gia: 16000 }
    ]
  },
  {
    trang: 47,
    ten_benh: "Viêm lợi",
    icd_10: "K05",
    chan_doan_chuan: "Viêm lợi",
    loi_dan_mac_dinh: "Đánh răng đúng cách, súc miệng nước muối thường xuyên.",
    ghi_chu: '',
    thuoc: [
      { ten: "Amoxilin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 2000 },
      { ten: "Hapacol sủi", so_luong: 12, don_vi_tinh: "Viên", don_gia: 2200 },
      { ten: "Voltaren 75 mg", so_luong: 15, don_vi_tinh: "Viên", don_gia: 7000 },
      { ten: "Pharmaton Energy", so_luong: 10, don_vi_tinh: "Viên", don_gia: 2800 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 }
    ]
  },
  {
    trang: 48,
    ten_benh: "Viêm nang lông",
    icd_10: "L73.9",
    chan_doan_chuan: "Viêm nang lông",
    loi_dan_mac_dinh: "Tắm rửa sạch sẽ, mặc đồ cotton thấm mồ hôi, không nặn mụn.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefuroxim 500 mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 5000 },
      { ten: "Azithromycin 500mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7200 },
      { ten: "Beroca", so_luong: 5, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "SOSLac G3", so_luong: 2, don_vi_tinh: "tube", don_gia: 29000 }
    ]
  },
  {
    trang: 49,
    ten_benh: "Viêm ống tai ngoài khu trú",
    icd_10: "H65",
    chan_doan_chuan: "Viêm ống tai ngoài khu trú",
    loi_dan_mac_dinh: "Giữ tai khô ráo, không tự ý dùng tăm bông ngoáy sâu vào tai.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefalexin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 3000 },
      { ten: "Medrol 16mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 4600 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Panadol Extra", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1500 }
    ]
  },
  {
    trang: 50,
    ten_benh: "Viêm ống tai",
    icd_10: "H65",
    chan_doan_chuan: "Viêm ống tai",
    loi_dan_mac_dinh: "Giữ tai khô ráo, không tự ý dùng tăm bông ngoáy sâu vào tai.",
    ghi_chu: '',
    thuoc: [
      { ten: "Cefalexin 500 mg", so_luong: 28, don_vi_tinh: "Viên", don_gia: 3000 },
      { ten: "Medrol 16mg", so_luong: 10, don_vi_tinh: "Viên", don_gia: 4600 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Panadol Extra", so_luong: 20, don_vi_tinh: "Viên", don_gia: 1500 }
    ]
  },
  {
    trang: 51,
    ten_benh: "Viêm ruột kích thích",
    icd_10: "K58",
    chan_doan_chuan: "Viêm ruột kích thích",
    loi_dan_mac_dinh: "Ăn uống đúng giờ, tránh thức ăn cay nóng, giảm căng thẳng.",
    ghi_chu: '',
    thuoc: [
      { ten: "Esomeprazol HV 40 mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 4000 },
      { ten: "Enterogermina", so_luong: 10, don_vi_tinh: "Gói", don_gia: 8500 },
      { ten: "No-Spa 40mg", so_luong: 30, don_vi_tinh: "Viên", don_gia: 1200 },
      { ten: "Pharmaton Energy", so_luong: 10, don_vi_tinh: "Viên", don_gia: 2800 }
    ]
  },
  {
    trang: 52,
    ten_benh: "Zona bội nhiễm",
    icd_10: "B35",
    chan_doan_chuan: "Zona bội nhiễm",
    loi_dan_mac_dinh: "Giữ vệ sinh da sạch sẽ, mặc đồ thoáng mát, bôi thuốc theo đúng chỉ định.",
    ghi_chu: '',
    thuoc: [
      { ten: "Acyclovir 800mg", so_luong: 30, don_vi_tinh: "Viên", don_gia: 3500 },
      { ten: "Cefuroxim 500 mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 5000 },
      { ten: "Beroca", so_luong: 5, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Loratadin 10mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 650 }
    ]
  },
  {
    trang: 53,
    ten_benh: "Zona",
    icd_10: "B35",
    chan_doan_chuan: "Zona",
    loi_dan_mac_dinh: "Giữ vệ sinh da sạch sẽ, mặc đồ thoáng mát, bôi thuốc theo đúng chỉ định.",
    ghi_chu: '',
    thuoc: [
      { ten: "Acyclovir 800mg", so_luong: 30, don_vi_tinh: "Viên", don_gia: 3500 },
      { ten: "Cefalexin 500 mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 3000 },
      { ten: "Beroca", so_luong: 10, don_vi_tinh: "Viên", don_gia: 7800 },
      { ten: "Loratadin 10mg", so_luong: 20, don_vi_tinh: "Viên", don_gia: 650 }
    ]
  },
];

/**
 * Normalizes a string for search matching
 */
export function normalizeSearchString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Mapping dictionary for common variations
 */
export const ALIAS_MAP: Record<string, string> = {
  'amoxilin': 'amoxicillin',
  'amoxicilin': 'amoxicillin',
  'vit c': 'vitamin c',
  'klamentin': 'klamentin 875/125 mg',
  'augmentin': 'augmentin 625 mg',
  'para': 'paracetamol',
  'panadol': 'panadol extra',
  'efferalgan': 'paracetamol',
  'alpha choay': 'alphachymotrypsin',
  'alphachymotrypsin choay 21microka': 'alphachymotrypsin',
  'nacl 0.9': 'nacl 0.9%',
  'nacl 0 9 500ml hd': 'nacl 0.9% 500ml',
  'gac vo khuan': 'gạc vô khuẩn',
  'bang thun': 'băng thun',
  'xoa bop cuc bo': 'xoa bóp cục bộ',
  'chieu den hong ngoai': 'chiếu đèn hồng ngoại',
  'thuoc đo h.ap': 'thuốc hạ huyết áp',
  'povidine': 'povidin',
  'povidin chai 10 90ml': 'povidine 10% 90ml',
};

type CatalogItem = { id: number; ten: string };

/**
 * Khớp tên từ Template vào Danh mục có sẵn bằng Fuzzy Matching
 */
export function matchCatalogItem(
  name: string,
  catalog: CatalogItem[]
): CatalogItem | null {
  if (!name || !catalog || catalog.length === 0) return null;

  const rawNorm = normalizeSearchString(name);
  const aliasNorm = ALIAS_MAP[rawNorm] ? normalizeSearchString(ALIAS_MAP[rawNorm]) : rawNorm;

  // 1. Khớp chính xác hoàn toàn
  for (const item of catalog) {
    const itemNorm = normalizeSearchString(item.ten);
    if (itemNorm === aliasNorm || itemNorm === rawNorm) {
      return item;
    }
  }

  // 2. Khớp theo Prefix / Substring (LIKE '%...%')
  for (const item of catalog) {
    const itemNorm = normalizeSearchString(item.ten);
    if (itemNorm.includes(aliasNorm) || aliasNorm.includes(itemNorm)) {
      return item;
    }
    // Check word intersection
    const aliasWords = aliasNorm.split(' ');
    const itemWords = itemNorm.split(' ');
    const intersection = aliasWords.filter(w => itemWords.includes(w));
    if (intersection.length >= Math.max(aliasWords.length, itemWords.length) * 0.7) {
      return item;
    }
  }

  // 3. Fallback: Levenshtein distance similarity > 75%
  let bestMatch: CatalogItem | null = null;
  let highestSim = 0;

  for (const item of catalog) {
    const itemNorm = normalizeSearchString(item.ten);
    const sim = similarity(aliasNorm, itemNorm);
    if (sim > highestSim) {
      highestSim = sim;
      bestMatch = item;
    }
  }

  if (highestSim > 0.75) {
    return bestMatch;
  }

  return null;
}

function levenshtein(a: string, b: string): number {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function similarity(s1: string, s2: string): number {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (longerLength - levenshtein(longer, shorter)) / parseFloat(longerLength.toString());
}
