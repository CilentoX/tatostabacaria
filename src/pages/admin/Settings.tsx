import { useEffect, useState, type FormEvent } from 'react';
import { api, type Settings as SettingsType } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Save, AlertCircle, Check, Key, MessageCircle } from 'lucide-react';

export function AdminSettings() {
 const { user } = useAuth();
 const [settings, setSettings] = useState<SettingsType>({});
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState('');
 const [successMsg, setSuccessMsg] = useState('');

 // Password change
 const [showPasswordForm, setShowPasswordForm] = useState(false);
 const [currentPassword, setCurrentPassword] = useState('');
 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');

 useEffect(() => {
 api.getSettings()
 .then(setSettings)
 .catch((err) => setError(err.message))
 .finally(() => setLoading(false));
 }, []);

 async function handleSaveSettings(e: FormEvent) {
 e.preventDefault();
 setSaving(true);
 setError('');
 setSuccessMsg('');

 try {
 await api.updateSettings(settings);
 setSuccessMsg('Configurações salvas com sucesso!');
 setTimeout(() => setSuccessMsg(''), 3000);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Erro ao salvar configurações');
 } finally {
 setSaving(false);
 }
 }

 async function handleChangePassword(e: FormEvent) {
 e.preventDefault();
 setError('');
 setSuccessMsg('');

 if (newPassword !== confirmPassword) {
 setError('As senhas não coincidem');
 return;
 }

 if (newPassword.length < 8) {
 setError('A nova senha deve ter pelo menos 8 caracteres');
 return;
 }

 try {
 await api.changePassword(currentPassword, newPassword);
 setSuccessMsg('Senha alterada com sucesso!');
 setCurrentPassword('');
 setNewPassword('');
 setConfirmPassword('');
 setShowPasswordForm(false);
 setTimeout(() => setSuccessMsg(''), 3000);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
 }
 }

 if (loading) {
 return <div className="text-muted-foreground text-sm animate-pulse">Carregando...</div>;
 }

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-2xl font-black text-foreground tracking-tight">Configurações</h1>
 <p className="text-sm text-muted-foreground mt-1">Gerencie as configurações do site</p>
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

 {/* Site settings */}
 <form onSubmit={handleSaveSettings} className="bg-card border border-border rounded-sm p-6 space-y-5">
 <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
 <MessageCircle className="h-4 w-4 text-primary" />
 Configurações do Site
 </h2>

 <div className="space-y-4">
 
 </div>

 <button
 type="submit"
 disabled={saving}
 className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {saving ? 'Salvando...' : <><Save className="h-3.5 w-3.5" /> Salvar Configurações</>}
 </button>
 </form>

 {/* Change password */}
 <div className="bg-card border border-border rounded-sm p-6 space-y-5">
 <div className="flex items-center justify-between">
 <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
 <Key className="h-4 w-4 text-primary" />
 Alterar Senha
 </h2>
 <button
 type="button"
 onClick={() => setShowPasswordForm(!showPasswordForm)}
 className="text-xs text-primary hover:text-primary/80 transition-colors"
 >
 {showPasswordForm ? 'Cancelar' : 'Alterar senha'}
 </button>
 </div>

 {showPasswordForm && (
 <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Senha Atual</label>
 <input
 type="password"
 required
 value={currentPassword}
 onChange={(e) => setCurrentPassword(e.target.value)}
 className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nova Senha</label>
 <input
 type="password"
 required
 minLength={8}
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
 placeholder="Mínimo 8 caracteres"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirmar Nova Senha</label>
 <input
 type="password"
 required
 minLength={8}
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={!currentPassword || !newPassword || !confirmPassword}
 className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Alterar Senha
 </button>
 </form>
 )}

 {!showPasswordForm && (
 <p className="text-xs text-muted-foreground">
 Logado como <strong>{user?.name}</strong> ({user?.email})
 </p>
 )}
 </div>
 </div>
 );
}