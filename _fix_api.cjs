const fs = require('fs');
const p = 'C:/Users/LucasCilento/Desktop/tatostabacaria/src/lib/api.ts';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(
  '    return this.request<PaginatedResponse<Product>>(`/api/products/all`);',
  '    return this.request<PaginatedResponse<Product>>(`/api/products/all${q ? \'?\' + q : \'\'};b);'
);
c = c.replace(
  '    return this.request<PaginatedResponse<Customer>>(`/api/customers`);',
  '    return this.request<PaginatedResponse<Customer>>(`/api/customers${q ? \'?\' + q : \'\'};b);'
);
fs.writeFileSync(p, c, 'utf8');
console.log('API_FIX_OK');
