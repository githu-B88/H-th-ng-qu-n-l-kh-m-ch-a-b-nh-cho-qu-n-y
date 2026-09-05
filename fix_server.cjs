const fs = require('fs');

let sqliteSrc = fs.readFileSync('src/db/sqlite-service.ts', 'utf-8');
const schemaStart = sqliteSrc.indexOf('const schema = `');
const schemaEnd = sqliteSrc.indexOf('`;', schemaStart);
const theSchema = sqliteSrc.slice(schemaStart + 16, schemaEnd);

let serverSrc = fs.readFileSync('server.ts', 'utf-8');
const serverStart = serverSrc.indexOf('const schema = `');
const serverEnd = serverSrc.indexOf('  db.exec(schema);');
const newServer = serverSrc.slice(0, serverStart) + "const schema = `" + theSchema + "`;\n" + serverSrc.slice(serverEnd);

fs.writeFileSync('server.ts', newServer);
console.log('Fixed server.ts schema');
