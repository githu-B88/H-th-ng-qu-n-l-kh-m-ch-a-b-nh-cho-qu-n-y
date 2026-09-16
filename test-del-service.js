import { readFileSync } from 'fs';
import initSqlJs from 'sql.js';
import { SqliteService } from './src/db/sqlite-service.ts';

// this won't work easily because sqlite-service imports things that might not work in node.
