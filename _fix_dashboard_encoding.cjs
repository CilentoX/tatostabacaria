const fs = require('fs');
const p = 'C:/Users/LucasCilento/Desktop/tatostabacaria/src/pages/admin/Dashboard.tsx';
let c = fs.readFileSync(p, 'utf8');
c = c.replace('R' + String.fromCharCode(0xFDFD) + 's', 'Receita do M\u00eas');
c = c.replace('V' + String.fromCharCode(0xFDFD) + 'deos', 'V\u00ideos');
c = c.replace('\u00clltimos Produtos', '\u00d1timos Produtos');
fs.writeFileSync(p, c, 'utf8');
console.log('DASHROARD_ENCODING_FIXED');
