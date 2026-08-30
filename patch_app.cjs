const fs = require('fs');
let s = fs.readFileSync('src/App.tsx', 'utf8');

// Add import for PrintTemplate
if (!s.includes('PrintTemplate')) {
  s = s.replace(/import \{ PrescriptionPrint \} from '\.\/components\/Examination\/PrescriptionPrint';/,
  `import { PrescriptionPrint } from './components/Examination/PrescriptionPrint';
import { PrintTemplate } from './components/PrintTemplate/PrintTemplate';`);
}

// Add print:hidden to the main container
s = s.replace(/<div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-sky-500 selection:text-white">/,
`<div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-sky-500 selection:text-white print:hidden">`);

// Replace PrescriptionPrint with PrintTemplate inside App.tsx or render it alongside
// Actually, PrescriptionPrint is a modal. We don't want it to be just a modal, or wait...
// The modal can stay, but we also render PrintTemplate globally when printRecord is set so it's always ready to print.
s = s.replace(/\{\/\* Printable Prescription Modal \*\/\}/,
`{/* Print Template (Hidden on screen, visible on print) */}
      {printRecord && <PrintTemplate record={printRecord} />}
      
      {/* Printable Prescription Modal */}`);

fs.writeFileSync('src/App.tsx', s, 'utf8');
