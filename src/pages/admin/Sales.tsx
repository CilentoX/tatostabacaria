import { useEffect, useState, type FormEvent } from 'react';
import { api, type Sale, type Product, type Customer, type CreateSaleInput } from '../../lib/api';
import { Plus, ShoppingCart, AlertCircle, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from '../../components/Pagination';

export function AdminSales() {
 const [sales, setSales] = useState<Sale[]>([]);
 const [nextCursor, setNextCursor] = useState<string | null>(null);
 const [loadingMore, setLoadingMore] = useState(false);
 const [products, setProducts] = useState<Product[]>([]);
 const [customers, setCustomers] = useState<Customer[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [showForm, setShowForm] = useState(false);

 // Form state
 const [customerId, setCustomerId] = useState('');
 const [items, setItems] = useState<{ productId: number; quantity: number; unitPrice: number }[]>([]);
 const [selectedProductId, setSelectedProductId] = useState('');

 useEffect(() => { loadData(); }, []);

 async function loadData() {
 try {
 setLoading(true);
 const [salesRes, productsRes, customersRes] = await Promise.all([
 api.getSales(),
 api.getAllProducts(),
 api.getCustomers(),
 ]);
 setSales(salesRes.items);
 setNextCursor(salesRes.nextCursor);
 setProducts(productsRes.items.filter((p) => p.active));
 setCustomers(customersRes.items);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
 } finally {
 setLoading(false);
 }
 }

 async function loadMore() {
 if (!nextCursor || loadingMore) return;
 try {
 setLoadingMore(true);
 const res = await api.getSales({ cursor: nextCursor, limit: '20' });
 setSales((prev) => [...prev, ...res.items]);
 setNextCursor(res.nextCursor);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Erro ao carregar mais vendas');
 } finally {
 setLoadingMore(false);
 }
 }

 function addItem() {
 if (!selectedProductId) return;
 const product = products.find((p) => p.id === Number(selectedProductId));
 if (!product) return;

 const existing = items.find((i) => i.productId === product.id);
 if (existing) {
 setItems(items.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
 } else {
 setItems([...items, { productId: product.id, quantity: 1, unitPrice: product.price || 0 }]);
 }
 setSelectedProductId('');
 }

 function removeItem(productId: number) {
 setItems(items.filter((i) => i.productId !== productId));
 }

 function updateItemQty(productId: number, qty: number) {
 if (qty < 1) return;
 setItems(items.map((i) => i.productId === productId ? { ...i, quantity: qty } : i));
 }

 function updateItemPrice(productId: number, price: number) {
 setItems(items.map((i) => i.productId === productId ? { ...i, unitPrice: price } : i));
 }

 const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

 async function handleSubmit(e: FormEvent) {
 e.preventDefault();
 if (items.length === 0) { toast.error('Adicione pelo menos um item'); return; }

 try {
 const input: CreateSaleInput = {
 customerId: customerId || null,
 status: 'completed',
 items,
 };
 await api.createSale(input);
 toast.success('Venda registrada!');
 setItems([]); setCustomerId(''); setShowForm(false);
 await loadData();
 } catch (err) {
 toast.error(err instanceof Error ? err.message : 'Erro ao registrar venda');
 }
 }

 async function handleCancel(id: string) {
 if (!confirm('Tem certeza que deseja cancelar esta venda? O estoque será devolvido.')) return;
 try {
 await api.cancelSale(id);
 toast.success('Venda cancelada e estoque devolvido!');
 await loadData();
 } catch (err) {
 toast.error(err instanceof Error ? err.message : 'Erro ao cancelar venda');
 }
 }

 function formatDate(dateStr: string) {
 return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
 }

 function formatCurrency(value: number) {
 return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
 }

 if (loading) return <div className="text-muted-foreground text-sm animate-pulse">Carregando...</div>;

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-black text-foreground tracking-tight">Vendas</h1>
 <p className="text-sm text-muted-foreground mt-1">{sales.length} vendas registradas</p>
 </div>
 <button onClick={() => setShowForm(!showForm)}
 className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors">
 {showForm ? 'Cancelar' : <><Plus className="h-4 w-4" /> Nova Venda</>}
 </button>
 </div>

 {error && (
 <div className="flex items-center gap-2 p-3 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
 <AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span>
 </div>
 )}

 {showForm && (
 <form onSubmit={handleSubmit} className="bg-card border border-border rounded-sm p-6 space-y-4">
 <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Registrar Venda</h2>

 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cliente (opcional)</label>
 <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
 className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
 <option value="">Sem cliente</option>
 {customers.map((c) => <option key={c.id} value={c.id}>{c.name}{c.instagram ? ` (${c.instagram})` : ''}</option>)}
 </select>
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Adicionar Produto</label>
 <div className="flex gap-2">
 <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
 className="flex-1 bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
 <option value="">Selecione um produto...</option>
 {products.map((p) => <option key={p.id} value={p.id}>{p.name} — Estoque: {p.stock ?? 0}{p.price != null ? ` — ${formatCurrency(p.price)}` : ''}</option>)}
 </select>
 <button type="button" onClick={addItem} disabled={!selectedProductId}
 className="px-4 py-2.5 bg-secondary text-foreground font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-secondary/80 transition-colors disabled:opacity-50">
 <Plus className="h-4 w-4" />
 </button>
 </div>
 </div>

 {items.length > 0 && (
 <div className="border border-border rounded-sm overflow-hidden">
 <table className="w-full text-left text-sm">
 <thead className="bg-secondary/50 border-b border-border">
 <tr>
 <th className="px-3 py-2 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Produto</th>
 <th className="px-3 py-2 font-bold uppercase tracking-wider text-[10px] text-muted-foreground w-20">Qtd</th>
 <th className="px-3 py-2 font-bold uppercase tracking-wider text-[10px] text-muted-foreground w-28">Preço Unit.</th>
 <th className="px-3 py-2 font-bold uppercase tracking-wider text-[10px] text-muted-foreground w-24 text-right">Subtotal</th>
 <th className="px-3 py-2 w-10"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {items.map((item) => {
 const product = products.find((p) => p.id === item.productId);
 return (
 <tr key={item.productId}>
 <td className="px-3 py-2 text-foreground">{product?.name || 'Desconhecido'}</td>
 <td className="px-3 py-2">
 <input type="number" min="1" value={item.quantity} onChange={(e) => updateItemQty(item.productId, parseInt(e.target.value) || 1)}
 className="w-16 bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary" />
 </td>
 <td className="px-3 py-2">
 <input type="number" step="0.01" min="0" value={item.unitPrice} onChange={(e) => updateItemPrice(item.productId, parseFloat(e.target.value) || 0)}
 className="w-24 bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary" />
 </td>
 <td className="px-3 py-2 text-right text-foreground font-medium">{formatCurrency(item.unitPrice * item.quantity)}</td>
 <td className="px-3 py-2 text-right">
 <button type="button" onClick={() => removeItem(item.productId)}
 className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
 <X className="h-3.5 w-3.5" />
 </button>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 <div className="px-3 py-3 bg-secondary/30 border-t border-border flex justify-between items-center">
 <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</span>
 <span className="text-lg font-black text-primary">{formatCurrency(total)}</span>
 </div>
 </div>
 )}

 <button type="submit" disabled={items.length === 0}
 className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
 <Check className="h-3.5 w-3.5" /> Confirmar Venda
 </button>
 </form>
 )}

 {sales.length === 0 ? (
 <div className="bg-card border border-border rounded-sm p-12 text-center">
 <ShoppingCart className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
 <p className="text-sm text-muted-foreground">Nenhuma venda registrada.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {sales.map((sale) => (
 <div key={sale.id} className={`bg-card border rounded-sm p-4 transition-colors ${sale.status === 'cancelled' ? 'border-red-500/30 opacity-60' : 'border-border'}`}>
 <div className="flex items-start justify-between mb-3">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="text-xs font-bold text-foreground">#{sale.id.slice(0, 8)}</span>
 <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
 sale.status === 'completed' ? 'bg-green-500/10 text-green-400' :
 sale.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
 'bg-red-500/10 text-red-400'
 }`}>{sale.status === 'completed' ? 'Concluída' : sale.status === 'pending' ? 'Pendente' : 'Cancelada'}</span>
 </div>
 <p className="text-xs text-muted-foreground">{formatDate(sale.createdAt)}</p>
 {sale.customer && <p className="text-xs text-muted-foreground mt-0.5">Cliente: <span className="text-foreground">{sale.customer.name}</span></p>}
 </div>
 <div className="text-right">
 <p className="text-lg font-black text-primary">{formatCurrency(sale.total)}</p>
 {sale.status !== 'cancelled' && (
 <button onClick={() => handleCancel(sale.id)}
 className="mt-1 text-[10px] text-red-400 hover:text-red-300 uppercase tracking-wider font-bold transition-colors">
 Cancelar
 </button>
 )}
 </div>
 </div>
 <div className="border-t border-border pt-2 space-y-1">
 {sale.items.map((item) => (
 <div key={item.id} className="flex justify-between text-xs">
 <span className="text-muted-foreground">{item.product?.name || 'Produto removido'} x{item.quantity}</span>
 <span className="text-foreground">{formatCurrency(item.unitPrice * item.quantity)}</span>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 )}

 <Pagination hasNext={!!nextCursor} loading={loadingMore} onLoadMore={loadMore} />
 </div>
 );
}