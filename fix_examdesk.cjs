const fs = require('fs');
let s = fs.readFileSync('src/components/Examination/ExamDesk.tsx', 'utf8');

s = s.replace(/if \(shouldPrint && fullRecord\) \{\n        \/\/ Đợi 1 chút để DOM render PrintTemplate trước khi gọi lệnh in\n        setTimeout\(\(\) => \{\n          handlePrintAction\(fullRecord\);\n          setTimeout\(\(\) => \{\n            window\.print\(\);\n          \}, 100\);\n        \}, 100\);\n      \} else if \(shouldPrint\) \{\n        window\.print\(\);\n      \}\n        handlePrintAction\(fullRecord\);\n      \}/,
`if (shouldPrint && fullRecord) {
        // Đợi 1 chút để DOM render PrintTemplate trước khi gọi lệnh in
        setTimeout(() => {
          handlePrintAction(fullRecord);
          setTimeout(() => {
            window.print();
          }, 100);
        }, 100);
      }`);

fs.writeFileSync('src/components/Examination/ExamDesk.tsx', s, 'utf8');
