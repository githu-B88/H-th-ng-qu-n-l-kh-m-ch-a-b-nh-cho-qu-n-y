import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  PageOrientation,
  convertMillimetersToTwip,
  VerticalAlign,
  ShadingType,
  Header,
  PageNumber,
} from 'docx';
import { saveAs } from 'file-saver';
import { HoSoKham } from '../types';
import { docTienBangChu, ensureTrailingDot } from './docTienBangChu';
import { getTreatmentDateRange } from './treatmentDate';
import { getFormattedDonVi, formatDonViCap1BacSiHeader } from './formatDonVi';

// Helpers
const formatDateVN = (dateStr?: string) => {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr;
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const formatNumberVN = (amount: number | string | null | undefined) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  return new Intl.NumberFormat('vi-VN').format(num);
};

// Clean string for filename
const sanitizeFileName = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_');
};

const FONT_FAMILY = 'Times New Roman';

const tableBorder = {
  top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
};

const noBorder = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

export async function exportBangKeToDocx(record: HoSoKham) {
  // Treatment date range (5 days) & footer date parts from ngay_kham
  const { tuNgay, denNgay, day, month, year } = getTreatmentDateRange(record.ngay_kham);

  // Group items
  const medicineItems = record.chi_tiet?.filter((item) => item.loai_muc === 'thuoc') || [];
  const supplyItems = record.chi_tiet?.filter((item) => item.loai_muc === 'vat_tu') || [];
  const serviceItems = record.chi_tiet?.filter((item) => item.loai_muc === 'dich_vu_kt' || item.loai_muc === 'dich_vu' || item.loai_muc === 'dich_vu_ky_thuat') || [];

  // Helper to extract item display name
  const getItemName = (item: any) => {
    return item.ten_muc || item.ten_thuoc || item.ten_vat_tu || item.ten_dich_vu || (item.id_muc ? `Mục #${item.id_muc}` : '');
  };

  // Units formatting
  const donViDisplay = getFormattedDonVi(
    record.ten_don_vi_cap_1,
    record.ten_don_vi_cap_2,
    record.ten_don_vi_nhan_su
  );

  // Doctor Level 1 Unit (Tiêu ngữ góc trái biến động theo bác sĩ đang khám, bỏ từ Vùng ở cuối nếu có)
  const donViCap1BacSi = formatDonViCap1BacSiHeader(
    (record as any).doctor?.level1Unit ||
    (record as any).doctor?.ten_don_vi_cap_1 ||
    (record as any).ten_don_vi_cap_1_bac_si ||
    record.ten_don_vi_cap_1
  );

  // Signer names formatting: Chỉ binding duy nhất họ và tên (fullName), loại bỏ cấp bậc/chức vụ
  const tenNguoiBenhKy = record.ten_nhan_su || '';
  const tenBacSiKy = record.ten_bac_si || '';

  const maTheBHYT = record.ma_the_bhyt || record.the_bhyt || 'Chưa cập nhật';
  const tongChiPhi = record.tong_chi_phi || 0;
  const tongTienBangChu = ensureTrailingDot(docTienBangChu(tongChiPhi));
  const chanDoanDisplay = ensureTrailingDot(record.chan_doan) || 'Khám chữa bệnh theo chế độ.';

  // Column width constants (Total = 14500 dxa ~ 100% of printable area: 25.7cm = 14570 dxa)
  const colWidths = [700, 5200, 1400, 1100, 2000, 2400, 1700];

  // Helper to build table cell with padding and 11pt font size
  const createTableCell = (
    text: string,
    width: number,
    align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
    isBold: boolean = false,
    colSpan: number = 1,
    shadingColor?: string
  ) => {
    return new TableCell({
      width: { size: width, type: WidthType.DXA },
      columnSpan: colSpan > 1 ? colSpan : undefined,
      borders: tableBorder,
      verticalAlign: VerticalAlign.CENTER,
      shading: shadingColor ? { fill: shadingColor, type: ShadingType.CLEAR } : undefined,
      margins: {
        top: convertMillimetersToTwip(0.35), // Chiều cao hàng tăng thêm 1px
        bottom: convertMillimetersToTwip(0.35),
        left: convertMillimetersToTwip(1.2),
        right: convertMillimetersToTwip(1.2),
      },
      children: [
        new Paragraph({
          alignment: align,
          spacing: { before: 0, after: 0, line: 200 },
          children: [
            new TextRun({
              text,
              font: FONT_FAMILY,
              size: 22, // 11pt (tăng 1 đơn vị theo yêu cầu)
              bold: isBold,
            }),
          ],
        }),
      ],
    });
  };

  // Header Table (2 columns: Left = BTL VÙNG 5 HQ / [doctor.level1Unit], Right = Mẫu số 08)
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0, line: 220 },
                children: [
                  new TextRun({
                    text: 'BTL VÙNG 5 HQ',
                    font: FONT_FAMILY,
                    size: 26, // 13pt
                    bold: false,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0, line: 200 }, // Giảm khoảng cách khi xuống dòng
                children: [
                  new TextRun({
                    text: donViCap1BacSi,
                    font: FONT_FAMILY,
                    size: 26, // 13pt
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0, line: 100 },
                children: [
                  new TextRun({
                    text: '─────────',
                    font: FONT_FAMILY,
                    size: 16,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 0, line: 240 },
                children: [
                  new TextRun({
                    text: 'Mẫu số 08: Bảng kê chi phí KCB theo ngày',
                    font: FONT_FAMILY,
                    size: 22, // 11pt chuẩn theo yêu cầu
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Table rows for Chi phí khám, chữa bệnh
  const tableRows: TableRow[] = [];

  // Table Header Row
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: [
        createTableCell('STT', colWidths[0], AlignmentType.CENTER, true, 1, 'F1F5F9'),
        createTableCell('Nội dung', colWidths[1], AlignmentType.CENTER, true, 1, 'F1F5F9'),
        createTableCell('Đơn vị tính', colWidths[2], AlignmentType.CENTER, true, 1, 'F1F5F9'),
        createTableCell('Số lượng', colWidths[3], AlignmentType.CENTER, true, 1, 'F1F5F9'),
        createTableCell('Đơn giá (đồng)', colWidths[4], AlignmentType.CENTER, true, 1, 'F1F5F9'),
        createTableCell('Thành tiền (đồng)', colWidths[5], AlignmentType.CENTER, true, 1, 'F1F5F9'),
        createTableCell('Ghi chú', colWidths[6], AlignmentType.CENTER, true, 1, 'F1F5F9'),
      ],
    })
  );

  // Group I: Thuốc
  tableRows.push(
    new TableRow({
      children: [
        createTableCell('I', colWidths[0], AlignmentType.CENTER, true),
        createTableCell('Thuốc', colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6], AlignmentType.LEFT, true, 6),
      ],
    })
  );

  if (medicineItems.length > 0) {
    medicineItems.forEach((item, idx) => {
      tableRows.push(
        new TableRow({
          children: [
            createTableCell(String(idx + 1), colWidths[0], AlignmentType.CENTER),
            createTableCell(getItemName(item), colWidths[1], AlignmentType.LEFT),
            createTableCell(item.don_vi_tinh, colWidths[2], AlignmentType.CENTER),
            createTableCell(String(item.so_luong), colWidths[3], AlignmentType.CENTER),
            createTableCell(formatNumberVN(item.don_gia), colWidths[4], AlignmentType.RIGHT),
            createTableCell(formatNumberVN(item.thanh_tien || item.so_luong * item.don_gia), colWidths[5], AlignmentType.RIGHT),
            createTableCell(item.ghi_chu || '', colWidths[6], AlignmentType.CENTER),
          ],
        })
      );
    });
  } else {
    // 3 empty rows for medicine if none
    [1, 2, 3].forEach((num) => {
      tableRows.push(
        new TableRow({
          children: [
            createTableCell(String(num), colWidths[0], AlignmentType.CENTER),
            createTableCell('', colWidths[1]),
            createTableCell('', colWidths[2]),
            createTableCell('', colWidths[3]),
            createTableCell('', colWidths[4]),
            createTableCell('', colWidths[5]),
            createTableCell('', colWidths[6]),
          ],
        })
      );
    });
  }

  // Group II: Vật tư y tế
  tableRows.push(
    new TableRow({
      children: [
        createTableCell('II', colWidths[0], AlignmentType.CENTER, true),
        createTableCell('Vật tư y tế', colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6], AlignmentType.LEFT, true, 6),
      ],
    })
  );

  if (supplyItems.length > 0) {
    supplyItems.forEach((item, idx) => {
      tableRows.push(
        new TableRow({
          children: [
            createTableCell(String(idx + 1), colWidths[0], AlignmentType.CENTER),
            createTableCell(getItemName(item), colWidths[1], AlignmentType.LEFT),
            createTableCell(item.don_vi_tinh, colWidths[2], AlignmentType.CENTER),
            createTableCell(String(item.so_luong), colWidths[3], AlignmentType.CENTER),
            createTableCell(formatNumberVN(item.don_gia), colWidths[4], AlignmentType.RIGHT),
            createTableCell(formatNumberVN(item.thanh_tien || item.so_luong * item.don_gia), colWidths[5], AlignmentType.RIGHT),
            createTableCell(item.ghi_chu || '', colWidths[6], AlignmentType.CENTER),
          ],
        })
      );
    });
  } else {
    // 3 empty rows for supplies if empty
    [1, 2, 3].forEach((num) => {
      tableRows.push(
        new TableRow({
          children: [
            createTableCell(String(num), colWidths[0], AlignmentType.CENTER),
            createTableCell('', colWidths[1]),
            createTableCell('', colWidths[2]),
            createTableCell('', colWidths[3]),
            createTableCell('', colWidths[4]),
            createTableCell('', colWidths[5]),
            createTableCell('', colWidths[6]),
          ],
        })
      );
    });
  }

  // Group III: Dịch vụ kỹ thuật (ĐỂ TRỐNG 2 DÒNG NẾU KHÔNG CÓ DỊCH VỤ NÀO THEO YÊU CẦU)
  tableRows.push(
    new TableRow({
      children: [
        createTableCell('III', colWidths[0], AlignmentType.CENTER, true),
        createTableCell('Dịch vụ kỹ thuật', colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6], AlignmentType.LEFT, true, 6),
      ],
    })
  );

  if (serviceItems.length > 0) {
    serviceItems.forEach((item, idx) => {
      tableRows.push(
        new TableRow({
          children: [
            createTableCell(String(idx + 1), colWidths[0], AlignmentType.CENTER),
            createTableCell(getItemName(item), colWidths[1], AlignmentType.LEFT),
            createTableCell(item.don_vi_tinh, colWidths[2], AlignmentType.CENTER),
            createTableCell(String(item.so_luong), colWidths[3], AlignmentType.CENTER),
            createTableCell(formatNumberVN(item.don_gia), colWidths[4], AlignmentType.RIGHT),
            createTableCell(formatNumberVN(item.thanh_tien || item.so_luong * item.don_gia), colWidths[5], AlignmentType.RIGHT),
            createTableCell(item.ghi_chu || '', colWidths[6], AlignmentType.CENTER),
          ],
        })
      );
    });
  } else {
    // Để trống chính xác 2 dòng theo yêu cầu người dùng
    [1, 2].forEach((num) => {
      tableRows.push(
        new TableRow({
          children: [
            createTableCell(String(num), colWidths[0], AlignmentType.CENTER),
            createTableCell('', colWidths[1]),
            createTableCell('', colWidths[2]),
            createTableCell('', colWidths[3]),
            createTableCell('', colWidths[4]),
            createTableCell('', colWidths[5]),
            createTableCell('', colWidths[6]),
          ],
        })
      );
    });
  }

  // Row Tổng cộng
  tableRows.push(
    new TableRow({
      children: [
        createTableCell('Tổng cộng', colWidths[0] + colWidths[1], AlignmentType.CENTER, true, 2),
        createTableCell('', colWidths[2] + colWidths[3] + colWidths[4], AlignmentType.CENTER, false, 3),
        createTableCell(formatNumberVN(tongChiPhi), colWidths[5], AlignmentType.RIGHT, true, 1),
        createTableCell('', colWidths[6], AlignmentType.CENTER, false, 1),
      ],
    })
  );

  const mainTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorder,
    rows: tableRows,
  });

  // Footer Signature Table: 1 row with 3 equal columns (33.3% each) WITHOUT ANY BORDERS
  // 60pt khoảng trống chữ ký (1200 twips) theo yêu cầu
  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          // Cột 1: NGƯỜI LẬP BẢNG KÊ (In đậm)
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: ' ',
                    font: FONT_FAMILY,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: 'NGƯỜI LẬP BẢNG KÊ',
                    font: FONT_FAMILY,
                    size: 24, // 12pt
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 1200, after: 0 }, // 60pt khoảng trống ký tay theo yêu cầu
                children: [
                  new TextRun({
                    text: tenBacSiKy,
                    font: FONT_FAMILY,
                    size: 24, // 12pt (fullName only)
                    bold: true,
                  }),
                ],
              }),
            ],
          }),

          // Cột 2: XÁC NHẬN CỦA NGƯỜI BỆNH (In đậm)
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: ' ',
                    font: FONT_FAMILY,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: 'XÁC NHẬN CỦA NGƯỜI BỆNH',
                    font: FONT_FAMILY,
                    size: 24, // 12pt
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 1200, after: 0 }, // 60pt khoảng trống ký tay theo yêu cầu
                children: [
                  new TextRun({
                    text: tenNguoiBenhKy,
                    font: FONT_FAMILY,
                    size: 24, // 12pt (fullName only)
                    bold: true,
                  }),
                ],
              }),
            ],
          }),

          // Cột 3: Dòng 1 "Ngày ... tháng ... năm ..." (In nghiêng) -> Dòng 2 "PHỤ TRÁCH QUÂN Y ĐƠN VỊ" (In đậm)
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: `Ngày ${day} tháng ${month} năm ${year}`,
                    font: FONT_FAMILY,
                    size: 24, // 12pt
                    italics: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: 'PHỤ TRÁCH QUÂN Y ĐƠN VỊ',
                    font: FONT_FAMILY,
                    size: 24, // 12pt
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 1200, after: 0 }, // 60pt khoảng trống ký tay theo yêu cầu
                children: [
                  new TextRun({
                    text: tenBacSiKy,
                    font: FONT_FAMILY,
                    size: 24, // 12pt (fullName only)
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Build the complete docx document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
              width: convertMillimetersToTwip(297),
              height: convertMillimetersToTwip(210),
            },
            margin: {
              top: convertMillimetersToTwip(13), // 1.3cm theo yêu cầu
              bottom: convertMillimetersToTwip(3), // 0.3cm theo yêu cầu
              left: convertMillimetersToTwip(25), // 2.5cm
              right: convertMillimetersToTwip(15), // 1.5cm
            },
            pageNumbers: {
              start: 1,
            },
          },
          titlePage: true,
        },
        headers: {
          first: new Header({
            children: [],
          }),
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 120, line: 240 },
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_FAMILY,
                    size: 22, // 11pt
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Header Table (No borders)
          headerTable,

          // Spacing
          new Paragraph({ spacing: { before: 20, after: 20 } }),

          // Tiêu đề chính
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 100, line: 260 },
            children: [
              new TextRun({
                text: 'BẢNG KÊ CHI PHÍ KHÁM BỆNH, CHỮA BỆNH CỦA QUÂN NHÂN TẠI QUÂN Y ĐƠN VỊ',
                font: FONT_FAMILY,
                size: 28, // 14pt
                bold: true,
              }),
            ],
          }),

          // I. Hành chính (11pt theo yêu cầu - giảm 1 đơn vị)
          new Paragraph({
            spacing: { before: 40, after: 20, line: 200 },
            children: [
              new TextRun({
                text: 'I. Hành chính',
                font: FONT_FAMILY,
                size: 22, // 11pt (giảm 1 đơn vị)
                bold: true,
              }),
            ],
          }),

          // Dòng 1: Họ tên, Ngày sinh, Giới tính (11pt)
          new Paragraph({
            spacing: { before: 10, after: 10, line: 200 },
            children: [
              new TextRun({ text: 'Họ tên người bệnh: ', font: FONT_FAMILY, size: 22 }),
              new TextRun({
                text: (record.ten_nhan_su || '...................................................').toUpperCase(),
                font: FONT_FAMILY,
                size: 22,
                bold: true,
              }),
              new TextRun({ text: '           Ngày sinh: ', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: formatDateVN(record.ngay_sinh_nhan_su) || '................', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: '           Giới tính: ', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: record.gioi_tinh_nhan_su || 'Nam', font: FONT_FAMILY, size: 22 }),
            ],
          }),

          // Dòng 2: Đơn vị (11pt)
          new Paragraph({
            spacing: { before: 10, after: 10, line: 200 },
            children: [
              new TextRun({ text: 'Đơn vị: ', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: donViDisplay, font: FONT_FAMILY, size: 22 }),
            ],
          }),

          // Dòng 3: Mã thẻ BHYT (11pt)
          new Paragraph({
            spacing: { before: 10, after: 10, line: 200 },
            children: [
              new TextRun({ text: 'Mã thẻ BHYT: ', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: maTheBHYT, font: FONT_FAMILY, size: 22, bold: true }),
            ],
          }),

          // Dòng 4: Đến khám và điều trị (11pt)
          new Paragraph({
            spacing: { before: 10, after: 10, line: 200 },
            children: [
              new TextRun({ text: 'Đến khám và điều trị: ', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: tuNgay, font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: ' đến ngày ', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: denNgay, font: FONT_FAMILY, size: 22 }),
            ],
          }),

          // Dòng 5: Chẩn đoán (11pt)
          new Paragraph({
            spacing: { before: 10, after: 40, line: 200 },
            children: [
              new TextRun({ text: 'Chẩn đoán: ', font: FONT_FAMILY, size: 22 }),
              new TextRun({
                text: chanDoanDisplay,
                font: FONT_FAMILY,
                size: 22,
                bold: true,
              }),
            ],
          }),

          // II. Chi phí khám, chữa bệnh (12pt tiêu đề mục)
          new Paragraph({
            spacing: { before: 40, after: 20, line: 200 },
            children: [
              new TextRun({
                text: 'II. Chi phí khám, chữa bệnh',
                font: FONT_FAMILY,
                size: 24, // 12pt chuẩn
                bold: true,
              }),
            ],
          }),

          // Main Table (Borders fully visible)
          mainTable,

          // Phần 4: Số tiền bằng chữ (12pt chuẩn) - Giảm khoảng cách đến bảng chữ ký còn 0 theo yêu cầu
          new Paragraph({
            spacing: { before: 0, after: 0, line: 100 },
            children: [
              new TextRun({ text: 'Số tiền (viết bằng chữ): ', font: FONT_FAMILY, size: 24 }),
              new TextRun({
                text: tongTienBangChu,
                font: FONT_FAMILY,
                size: 24,
                bold: true,
                italics: true,
              }),
            ],
          }),

          // Phần 5: Chân trang (Footer Chữ ký - 60pt khoảng trống)
          signatureTable,
        ],
      },
    ],
  });

  // Pack and trigger download
  const blob = await Packer.toBlob(doc);
  const tenCanBoFormatted = sanitizeFileName(record.ten_nhan_su || 'QuanNhan');
  const ngayKhamFormatted = (record.ngay_kham || new Date().toISOString().split('T')[0]).replace(/-/g, '');
  const fileName = `BangKe_${tenCanBoFormatted}_${ngayKhamFormatted}.docx`;

  saveAs(blob, fileName);
}
