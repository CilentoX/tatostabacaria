const fs = require('fs');
const p = 'C:/Users/LucasCilento/Desktop/tatostabacaria/src/pages/admin/Sales.tsx';
let lines = fs.readFileSync(p, 'utf8').split('\n');
// Encontrar a linha do ); final e inseriar Pagination antes do </div> que o precede
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === );' && i > 0 && lines[i - 1].trim() === '</div>') {
    lines.splice(i - 1, 0, '', '        <Pagination hasNext={!!nextCursor} loading={loadingMore} onLoadMore={loadMore} />');
    break;
  }
}
fs.writeFileSync(p, lines.join('\n'), 'utf8');
console.log('SALES_PAGINATION_FIXED');
