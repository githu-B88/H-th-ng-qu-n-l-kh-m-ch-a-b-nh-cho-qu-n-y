const fs = require('fs');
let s = fs.readFileSync('src/components/Records/MedicalRecordsList.tsx', 'utf8');

s = s.replace(/onPrintRecord\(viewRecord\);\n\s*setViewRecord\(null\);/,
`onPrintRecord(viewRecord);
                  setViewRecord(null);
                  setTimeout(() => {
                    window.print();
                  }, 200);`);

s = s.replace(/onPrintRecord\(record\);/,
`onPrintRecord(record);
                            setTimeout(() => {
                              window.print();
                            }, 200);`);

fs.writeFileSync('src/components/Records/MedicalRecordsList.tsx', s, 'utf8');
