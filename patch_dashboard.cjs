const fs = require('fs');

function patch(file) {
  if (fs.existsSync(file)) {
    let dash = fs.readFileSync(file, 'utf8');
    const regex = /\{item\.so_dien_thoai && \(\s*<span className="flex items-center gap-1 text-slate-400">\s*<Phone className="w-3 h-3" \/>\s*\{item\.so_dien_thoai\}\s*<\/span>\s*\)\}/g;
    dash = dash.replace(regex, '');
    fs.writeFileSync(file, dash, 'utf8');
  }
}

patch('src/components/Dashboard/Dashboard.tsx');
patch('src/components/Dashboard/Dashboard.jsx');
