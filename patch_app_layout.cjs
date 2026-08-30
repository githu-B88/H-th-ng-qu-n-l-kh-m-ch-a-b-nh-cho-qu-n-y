const fs = require('fs');
let s = fs.readFileSync('src/App.tsx', 'utf8');

// Remove print:hidden from the main wrapper
s = s.replace(/print:hidden"/, '"');

// Add a wrapper around the app content that has print:hidden
s = s.replace(/<Sidebar/, '<div className="flex-1 flex overflow-hidden print:hidden">\n        <Sidebar');
s = s.replace(/<\/main>\n\s*<\/div>\n\s*\{\/\* Print Template/, '</main>\n      </div>\n      </div>\n      {/* Print Template');

// Also hide the PrescriptionPrint modal on print
s = s.replace(/<PrescriptionPrint/, '<div className="print:hidden"><PrescriptionPrint');
s = s.replace(/onClose=\{.*\}\n\s*\/>\n\s*\)\}/, 'onClose={() => setPrintRecord(null)}\n        /></div>\n      )}');

// Ensure Header is inside the print:hidden wrapper
s = s.replace(/<Header/, '<div className="print:hidden"><Header');
s = s.replace(/<\/Header>/, '</Header></div>'); // wait, Header doesn't have closing tag if it's <Header />
s = s.replace(/<Header(.+?)\/>/, '<div className="print:hidden"><Header$1/></div>');

fs.writeFileSync('src/App.tsx', s, 'utf8');
