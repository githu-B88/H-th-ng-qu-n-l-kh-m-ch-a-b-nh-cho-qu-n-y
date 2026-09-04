/**
 * Helper in ấn tài liệu trực tiếp thông qua hidden iframe chuẩn hóa font và định dạng A4
 */
export const printElement = (
  elementId: string,
  options: {
    title?: string;
    orientation?: 'landscape' | 'portrait';
  } = {}
) => {
  const { title = 'In Bảng kê chi phí KCB Quân nhân', orientation = 'landscape' } = options;
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.warn(`Print element not found: #${elementId}. Falling back to window.print()`);
    window.focus();
    window.print();
    return;
  }

  // Tạo iframe ẩn độc lập để in không bị ảnh hưởng bởi modal hay layout cha
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    window.focus();
    window.print();
    return;
  }

  const pageRule =
    orientation === 'landscape'
      ? `@page {
          size: A4 landscape;
          margin: 15mm 15mm 5mm 25mm;
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
        }`
      : `@page {
          size: A4 portrait;
          margin: 15mm 15mm 5mm 20mm;
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
        }`;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          ${pageRule}
          *, *::before, *::after {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 12pt;
            line-height: 1.25;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            margin-bottom: 4px;
          }
          th, td {
            color: #000000;
          }
          .print-table, table.border-collapse, table {
            width: 100%;
            border-collapse: collapse;
          }
          .print-table th, .print-table td,
          table.border-collapse th, table.border-collapse td,
          th.border, td.border, th, td {
            border: 1px solid #000000 !important;
            padding: 0.5px 3px !important;
            font-size: 11pt;
            height: 16px !important;
            line-height: 1.18;
          }
          .border-none, .border-none th, .border-none td {
            border: none !important;
          }
          .flex { display: flex; }
          .items-start { align-items: flex-start; }
          .items-center { align-items: center; }
          .items-baseline { align-items: baseline; }
          .justify-between { justify-content: space-between; }
          .justify-center { justify-content: center; }
          .justify-end { justify-content: flex-end; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .font-bold { font-weight: bold; }
          .font-normal { font-weight: normal; }
          .font-semibold { font-weight: 600; }
          .italic { font-style: italic; }
          .uppercase { text-transform: uppercase; }
          .font-mono { font-family: monospace, Courier, monospace; }
          .font-serif { font-family: 'Times New Roman', Times, serif; }
          .w-full { width: 100%; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .space-y-1 > * + * { margin-top: 4px; }
          .space-y-2 > * + * { margin-top: 8px; }
          .space-y-3 > * + * { margin-top: 12px; }
          .space-y-4 > * + * { margin-top: 16px; }
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 12px; }
          .mb-4 { margin-bottom: 16px; }
          .mb-6 { margin-bottom: 24px; }
          .mt-1 { margin-top: 4px; }
          .mt-2 { margin-top: 8px; }
          .mt-3 { margin-top: 12px; }
          .mt-4 { margin-top: 16px; }
          .p-0 { padding: 0; }
          .p-4 { padding: 16px; }
          .p-6 { padding: 24px; }
          .p-8 { padding: 32px; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .gap-2 { gap: 8px; }
          .gap-3 { gap: 12px; }
          .gap-4 { gap: 16px; }
          .gap-6 { gap: 24px; }
          .border-b { border-bottom: 1px solid #000; }
          .border-b-2 { border-bottom: 2px solid #000; }
          .border-t { border-top: 1px solid #000; }
          .border-black { border-color: #000; }
          .border-slate-800 { border-color: #1e293b; }
          .border-slate-300 { border-color: #cbd5e1; }
          .border-slate-200 { border-color: #e2e8f0; }
          .w-\\[250px\\] { width: 250px; }
          .w-\\[110px\\] { width: 110px; }
          .w-\\[140px\\] { width: 140px; }
          .w-1\\/3 { width: 33.333333%; }
          .w-1\\/2 { width: 50%; }
          .w-2\\/3 { width: 66.666667%; }
          .text-\\[10pt\\] { font-size: 10pt; }
          .text-\\[11pt\\] { font-size: 11pt; }
          .text-\\[11\\.5pt\\] { font-size: 11.5pt; }
          .text-\\[12pt\\] { font-size: 12pt; }
          .text-\\[12\\.5pt\\] { font-size: 12.5pt; }
          .text-\\[13pt\\] { font-size: 13pt; }
          .text-\\[14pt\\] { font-size: 14pt; }
          .leading-tight { line-height: 1.25; }
          .leading-snug { line-height: 1.375; }
          .leading-\\[1\\.35\\] { line-height: 1.35; }
          .tracking-wide { letter-spacing: 0.025em; }
          .tracking-wider { letter-spacing: 0.05em; }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
  doc.close();

  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn('Iframe print failed, falling back to window.print():', err);
      window.focus();
      window.print();
    } finally {
      setTimeout(() => {
        try {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        } catch {
          // ignore
        }
      }, 1000);
    }
  };

  // Đợi tài liệu trong iframe sẵn sàng rồi gọi lệnh in
  setTimeout(triggerPrint, 100);
};
