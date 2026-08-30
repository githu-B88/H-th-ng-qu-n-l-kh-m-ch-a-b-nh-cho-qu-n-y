const fs = require('fs');

let service = fs.readFileSync('src/db/sqlite-service.ts', 'utf8');
const schema = fs.readFileSync('src/db/schema.sql', 'utf8');

// Replace the hardcoded schema string in createTables()
service = service.replace(
  /private createTables\(\) \{[\s\S]*?const schema = `[\s\S]*?`;/,
  `private createTables() {\n    if (!this.db) return;\n    const schema = \`\n${schema.replace(/`/g, '\\`')}\n\`;`
);

fs.writeFileSync('src/db/sqlite-service.ts', service, 'utf8');
