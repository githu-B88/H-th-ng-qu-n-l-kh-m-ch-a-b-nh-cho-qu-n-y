import React from 'react';
import { HoSoKham } from '../../types';
import { SinglePrintTemplate } from './PrintTemplate';

interface BatchPrintTemplateProps {
  records?: HoSoKham[];
  data?: HoSoKham[];
}

/**
 * Component in hàng loạt: Tái sử dụng 100% Component in đơn lẻ (SinglePrintTemplate)
 * Duyệt qua mảng dữ liệu bằng array.map() và bọc mỗi bản in đơn lẻ bằng div có class 'page-break-container'
 */
export const BatchPrintTemplate: React.FC<BatchPrintTemplateProps> = ({ records, data }) => {
  const items = records || data || [];
  if (items.length === 0) return null;

  return (
    <div id="print-area" className="hidden print:block w-full">
      {items.map((item) => (
        <div key={item.id} className="page-break-container">
          <SinglePrintTemplate record={item} data={item} />
        </div>
      ))}
    </div>
  );
};

export default BatchPrintTemplate;
