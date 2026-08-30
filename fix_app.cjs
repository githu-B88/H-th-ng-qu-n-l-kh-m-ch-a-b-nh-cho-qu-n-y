const fs = require('fs');
let s = fs.readFileSync('src/App.tsx', 'utf8');

// The wrapper is missing a closing div
s = s.replace(/<div className="print:hidden"><Header/, '<div className="print:hidden">\n        <Header');
s = s.replace(/onLogout=\{handleLogout\}\n\s*\/>\n\s*<div className="flex-1 flex overflow-hidden">/,
`onLogout={handleLogout}
      />
      </div>
      <div className="flex-1 flex overflow-hidden print:hidden">`);

s = s.replace(/<div className="flex-1 flex overflow-hidden print:hidden">\n\s*<Sidebar/,
`<Sidebar`);

fs.writeFileSync('src/App.tsx', s, 'utf8');
