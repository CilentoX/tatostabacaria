import { useEffect, useState, type FormEvent } from 'react';
import { api, type User } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Trash2, Shield, User as UserIcon, AlertCircle, Check } from 'lucide-react';

export function AdminUsers() {
 const { isMaster, user: currentUser } = useAuth();
 const [users, setUsers] = useState<User[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [showForm, setShowForm] = useState(false);
 const [successMsg, setSuccessMsg] = useState('');

 // Form state
 const [name, setName] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [role, setRole] = useState<'admin' | 'master'>('admin');

 useEffect(() => {
 if (!isMaster) return;
 loadUsers();
 }, [isMaster]);

 async function loadUsers() {
 try {
 setLoading(true);
 const data = await api.getUsers();
 setUsers(data);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
 } finally {
 setLoading(false);
 }
 }

 async function handleSubmit(e: FormEvent) {
 e.preventDefault();
 if (!name || !email || !password) return;

 setError('');
 setSuccessMsg('');

 try {
 await api.createUser({ name, email, password, role });
 setSuccessMsg('Usuário criado com sucesso!');
 setName('');
 setEmail('');
 setPassword('');
 setRole('admin');
 setShowForm(false);
 await loadUsers();
 setTimeout(() => setSuccessMsg(''), 3000);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
 }
 }

 async function handleDelete(userId: string, userName: string) {
 if (!confirm(`Tem certeza que deseja deletar o usuário "${userName}"?`)) return;

 try {
 await api.deleteUser(userId);
 setUsers((prev) => prev.filter((u) => u.id !== userId));
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Erro ao deletar usuário');
 }
 }

 if (!isMaster) {
 return (
 <div className="flex flex-col items-center justify-center py-20 text-center">
 <Shield className="h-12 w-12 text-muted-foreground/20 mb-4" />
 <h2 className="text-lg font-bold text-foreground">Acesso Restrito</h2>
 <p className="text-sm text-muted-foreground mt-1">
 Apenas usuários master podem gerenciar outros usuários.
 </p>
 </div>
 );
 }

 if (loading) {
 return <div className="text-muted-foreground text-sm animate-pulse">Carregando...</div>;
 }

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-black text-foreground tracking-tight">Usuários</h1>
 <p className="text-sm text-muted-foreground mt-1">{users.length} usuários cadastrados</p>
 </div>
 <button
 onClick={() => setShowForm(!showForm)}
 className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors"
 >
 {showForm ? 'Cancelar' : <><Plus className="h-4 w-4" /> Novo Usuário</>}
 </button>
 </div>

 {/* Messages */}
 {error && (
 <div className="flex items-center gap-2 p-3 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
 <AlertCircle className="h-4 w-4 shrink-0" />
 <span>{error}</span>
 </div>
 )}
 {successMsg && (
 <div className="flex items-center gap-2 p-3 rounded-sm bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
 <Check className="h-4 w-4 shrink-0" />
 <span>{successMsg}</span>
 </div>
 )}

 {/* Create form */}
 {showForm && (
 <form onSubmit={handleSubmit} className="bg-card border border-border rounded-sm p-6 space-y-4">
 <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Criar Novo Usuário</h2>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome</label>
 <input
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
 placeholder="Nome completo"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
 <input
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
 placeholder="usuario@email.com"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Senha</label>
 <input
 type="password"
 required
 minLength={8}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
 placeholder="Mínimo 8 caracteres"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Função</label>
 <select
 value={role}
 onChange={(e) => setRole(e.target.value as 'admin' | 'master')}
 className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
 >
 <option value="admin">Admin</option>
 <option value="master">Master</option>
 </select>
 </div>
 </div>

 <button
 type="submit"
 disabled={!name || !email || !password}
 className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Criar Usuário
 </button>
 </form>
 )}

 {/* Users list */}
 <div className="space-y-2">
 {users.map((user) => (
 <div
 key={user.id}
 className="bg-card border border-border rounded-sm p-4 flex items-center justify-between group"
 >
 <div className="flex items-center gap-4">
 <div className={`p-2.5 rounded-sm ${user.role === 'master' ? 'bg-primary/10 text-primary' : 'bg-card border border-border text-muted-foreground'}`}>
 {user.role === 'master' ? <Shield className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
 </div>
 <div>
 <p className="text-sm font-medium text-foreground">{user.name}</p>
 <p className="text-xs text-muted-foreground">{user.email}</p>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
 user.role === 'master'
 ? 'bg-primary/10 text-primary'
 : 'bg-card border border-border text-muted-foreground'
 }`}>
 {user.role}
 </span>

 {currentUser?.id !== user.id && (
 <button
 onClick={() => handleDelete(user.id, user.name)}
 className="p-2 rounded-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
 title="Deletar usuário"
 >
 <Trash2 className="h-4 w-4" />
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}