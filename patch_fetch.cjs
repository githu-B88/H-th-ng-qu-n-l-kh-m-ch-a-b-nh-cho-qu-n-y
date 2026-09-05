const fs = require('fs');
let content = fs.readFileSync('src/db/sqlite-service.ts', 'utf-8');

content = content.replace(
    "const response = await fetch('/api/db-download');",
    "const response = await fetch('/api/db-download?_t=' + Date.now());"
);

fs.writeFileSync('src/db/sqlite-service.ts', content);
console.log('Patched fetch to avoid caching');
