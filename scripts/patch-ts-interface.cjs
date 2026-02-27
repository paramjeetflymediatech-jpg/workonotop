const fs = require('fs');
const path = require('path');

// ensure util.js exists for ts-interface-checker
const targetDir = path.join(__dirname, '..', 'node_modules', 'ts-interface-checker', 'dist');
const utilPath = path.join(targetDir, 'util.js');

if (!fs.existsSync(targetDir)) {
  console.warn('ts-interface-checker not installed, skipping patch');
  process.exit(0);
}

if (fs.existsSync(utilPath)) {
  // nothing to do
  process.exit(0);
}

console.log('⚙️  patching ts-interface-checker/util.js');
const content = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// minimal no-op context used by the generated checker code
class NoopContext {
  fail() {
    // return false to indicate failure but no error tracking
    return false;
  }
}
exports.NoopContext = NoopContext;
`;
fs.writeFileSync(utilPath, content);
