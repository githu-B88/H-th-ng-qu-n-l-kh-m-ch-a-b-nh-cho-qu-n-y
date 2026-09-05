const fs = require('fs');
let serverTs = fs.readFileSync('server.ts', 'utf-8');
const schemaSql = fs.readFileSync('full_schema.sql', 'utf-8')
    .replace(/const schema = `/g, '')
    .replace(/`;/g, '');

const startMarker = "const schema = `";
const endMarker = "  db.exec(schema);";
const startIndex = serverTs.indexOf(startMarker);
const endIndex = serverTs.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const newServerTs = serverTs.slice(0, startIndex) + "const schema = `" + schemaSql + "`\n" + serverTs.slice(endIndex);
    fs.writeFileSync('server.ts', newServerTs);
    console.log("Patched server.ts with full schema.");
} else {
    console.error("Markers not found in server.ts");
}
