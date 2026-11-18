import { useEffect, useState, type FormEvent } from 'react';
import { api, type Customer } from '../../lib/api';
import { Plus, Trash2, Edit3, UserCircle, AlertCircle, Check, Instagram, Phone, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Pagination } from '../../components/Pagination';

export function AdminCustomers() {
 const [customers, setCustomers] = useState<Customer[]>([]);
 const [nextCursor, setNextCursor] = useState<string | null>(null);
 const [loadingMore, setLoadingMore] = useState(false);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [showForm, setShowForm] = useState(false);
 const [editingId, setEditingId] = useState<string | null>(null);

 // Form state
 const [name, setName] = useState('');
 const [instagram, setInstagram] = useState('');
 const [phone, setPhone] = useState('');
 const [notes, setNotes] = useState('');

 useEffect(() => { loadCustomers(); }, []);

 async function loadCustomers() {
 try {
 setLoading(true);
 const res = await api.getCustomers();
 setCustomers(res.items);
 setNextCursor(res.nextCursor);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
 } finally {
 setLoading(false);
 }
 }


 async function loadMore() {
   if (!nextCursor || loadingMore) return;
   try {
    setLoadingMore(true);
    const res = await api.getCustomers({ cursor: nextCursor, limit: 20 });
    setCustomers((prev) => [...prev, ...res.items]);
    setNextCursor(res.nextCursor);
   } catch (err) {
     setError(err instanceof Error ? err.message : 'Erro ao carregar mais clientes');
   } finally {
    setLoadingMore(false);
   }
 }
 function resetForm() {
 setName(''); setInstagram(''); setPhone(''); setNotes('');
 setEditingId(null); setShowForm(false);
 }

 async function handleSubmit(e: FormEvent) {
 e.preventDefault();
 if (!name.trim()) return;

 try {
 if (editingId) {
 await api.updateCustomer(editingId, { name, instagram: instagram || null, phone: phone || null, notes: notes || null });
 toast.success('Cliente atualizado!');
 } else {
 await api.createCustomer({ name, instagram: instagram || null, phone: phone || null, notes: notes || null });
 toast.success('Cliente cadastrado!');
 }
 resetForm();
 await loadCustomers();
 } catch (err) {
 toast.error(err instanceof Error ? err.message : 'Erro ao salvar cliente');
 }
 }

 function startEdit(customer: Customer) {
 setName(customer.name);
 setInstagram(customer.instagram || '');
 setPhone(customer.phone || '');
 setNotes(customer.notes || '');
 setEditingId(customer.id);
 setShowForm(true);
 }

 async function handleDelete(id: string, customerName: string) {
 if (!confirm(`Tem certeza que deseja remover "${customerName}"?`)) return;
 try {
 await api.deleteCustomer(id);
 setCustomers((prev) => prev.filter((c) => c.id !== id));
 toast.success('Cliente removido!');
 } catch (err) {
 toast.error(err instanceof Error ? err.message : 'Erro ao remover cliente');
 }
 }

 if (loading) return <div className="text-muted-foreground text-sm animate-pulse">Carregando...</div>;

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-black text-foreground tracking-tight">Clientes</h1>
 <p className="text-sm text-muted-foreground mt-1">{customers.length} clientes cadastrados</p>
 </div>
 <button onClick={() => { resetForm(); setShowForm(!showForm); }}
 className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors">
 {showForm ? 'Cancelar' : <><Plus className="h-4 w-4" /> Novo Cliente</>}
 </button>
 </div>

 {error && (
 <div className="flex items-center gap-2 p-3 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
 <AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span>
 </div>
 )}

 {showForm && (
 <form onSubmit={handleSubmit} className="bg-card border border-border rounded-sm p-6 space-y-4">
 <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
 {editingId ? 'Editar Cliente' : 'Novo Cliente'}
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome *</label>
 <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
 className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
 placeholder="Nome do cliente" />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Instagram className="h-3 w-3" /> Instagram</label>
 <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)}
 className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
 placeholder="@usuario" />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Telefone</label>
 <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
 className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
 placeholder="(11) 99999-9999" />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> Observações</label>
 <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
 className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
 placeholder="Preferências, alergias, etc." maxLength={500} />
 </div>
 </div>
 <button type="submit" disabled={!name.trim()}
 className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
 <Check className="h-3.5 w-3.5" /> {editingId ? 'Salvar Alterações' : 'Cadastrar Cliente'}
 </button>
 </form>
 )}

 {customers.length === 0 ? (
 <div className="bg-card border border-border rounded-sm p-12 text-center">
 <UserCircle className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
 <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado.</p>
 </div>
 ) : (
 <div className="bg-card border border-border rounded-sm overflow-hidden">
 <table className="w-full text-left text-sm">
 <thead className="bg-secondary/50 border-b border-border">
 <tr>
 <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-muted-foreground">Nome</th>
 <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-muted-foreground">Instagram</th>
 <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-muted-foreground">Telefone</th>
 <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-muted-foreground">Vendas</th>
 <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-muted-foreground text-right">Ações</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {customers.map((customer) => (
 <tr key={customer.id} className="hover:bg-secondary/30 transition-colors">
 <td className="px-4 py-3 font-medium text-foreground">{customer.name}</td>
 <td className="px-4 py-3 text-muted-foreground">{customer.instagram || '—'}</td>
 <td className="px-4 py-3 text-muted-foreground">{customer.phone || '—'}</td>
 <td className="px-4 py-3 text-muted-foreground">{customer._count?.sales ?? 0}</td>
 <td className="px-4 py-3 text-right">
 <div className="flex items-center justify-end gap-1">
 <button onClick={() => startEdit(customer)}
 className="p-1.5 rounded-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
 <Edit3 className="h-3.5 w-3.5" />
 </button>
 <button onClick={() => handleDelete(customer.id, customer.name)}
 className="p-1.5 rounded-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
 <Trash2 className="h-3.5 w-3.5" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 <Pagination hasNext={!!nextCursor} loading={loadingMore} onLoadMore={loadMore} />
 </div>
 );
}
