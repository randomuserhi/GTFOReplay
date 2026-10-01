const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, 'js3party');
fs.cpSync(source, path.join(__dirname, 'build/js3party'), {recursive:true});
