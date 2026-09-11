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
    <div id="printable-batch-sheet" className="w-full hidden print:block">
      {items.map((item) => (
        <SinglePrintTemplate key={item.id} record={item} data={item} className="page-break-container" />
      ))}
    </div>
  );
};

export default BatchPrintTemplate;
