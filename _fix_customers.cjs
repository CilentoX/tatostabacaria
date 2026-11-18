const fs = require('fs');
const p = 'C:/Users/LucasCilento/Desktop/tatostabacaria/src/pages/admin/Customers.tsx';
let c = fs.readFileSync(p, 'utf8');
// 1. Adicionar import do Pagination
c = c.replace(
  "import { toast } from 'sonner';",
  "import { toast } from 'sonner';\nimport { Pagination } from '../../components/Pagination';"
);
// 2. Adicionar estados nextCursor e loadingMore
c = c.replace(
  "const [customers, setCustomers] = useState<Customer[]>([]);",
  "const [customers, setCustomers] = useState<Customer[]>([]);\n const [nextCursor, setNextCursor] = useState<string | null>(null);\n const [loadingMore, setLoadingMore] = useState(false);"
);
// 3. Salvar nextCursor no loadCustomers
c = c.replace(
  "setCustomers(res.items);",
  "setCustomers(res.items);\n setNextCursor(res.nextCursor);"
);
// 4. Adicionar função loadMore antes de resetForm
const loadMoreFn = `\n async function loadMore() {\n   if (!nextCursor || loadingMore) return;\n   try {\n    setLoadingMore(true);\n    const res = await api.getCustomers({ cursor: nextCursor, limit: 20 });\n    setCustomers((prev) => [...prev, ...res.items]);\n    setNextCursor(res.nextCursor);\n   } catch (err) {\n     setError(err instanceof Error ? err.message : 'Erro ao carregar mais clientes');\n   } finally {\n    setLoadingMore(false);\n   }\n }\n`;
c = c.replace(" function resetForm()", loadMoreFn + " function resetForm()");
// 5. Inserir <Pagination /> antes do fechamento final
const paginationTag = '\n        <Pagination hasNext={!!nextCursor} loading={loadingMore} onLoadMore={loadMore} />';
const endMarker = '\n      </div>\n    );\n}';
if (c.includes(endMarker)) {
  c = c.replace(endMarker, paginationTag + endMarker);
}
fs.writeFileSync(p, c, 'utf8');
console.log('CUSTOMERS_PAGINATION_OK');
