const fs = require('fs');
let s = fs.readFileSync('src/components/Examination/ExamDesk.tsx', 'utf8');

s = s.replace(/const handleSaveExam = \(shouldPrint = false\) => \{/,
`const handleSaveExam = async (shouldPrint = false) => {`);

s = s.replace(/const savedId = sqliteService\.saveHoSoKham\(examData, items, true\);/,
`const savedId = sqliteService.saveHoSoKham(examData, items, true);
    // Bất đồng bộ: Đợi ghi xuống file/IndexedDB hoàn tất trước khi in
    if (savedId) {
      await (sqliteService as any).persistDatabase?.() || await Promise.resolve();
    }`);

s = s.replace(/if \(shouldPrint && fullRecord\) \{/,
`if (shouldPrint && fullRecord) {
        // Đợi 1 chút để DOM render PrintTemplate trước khi gọi lệnh in
        setTimeout(() => {
          handlePrintAction(fullRecord);
          setTimeout(() => {
            window.print();
          }, 100);
        }, 100);
      } else if (shouldPrint) {
        window.print();
      }`);

fs.writeFileSync('src/components/Examination/ExamDesk.tsx', s, 'utf8');
