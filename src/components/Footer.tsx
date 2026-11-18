import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

export function Footer() {
 const { settings } = useSettings();

 const instagramUrl = settings.instagram_url || 'https://www.instagram.com/tato.tabacaria_';

 // Extrair username da URL do Instagram para exibição
 const instagramHandle = instagramUrl.includes('instagram.com/')
 ? '@' + instagramUrl.split('instagram.com/')[1]?.replace(/[/?].*$/, '') || '@tato.tabacaria_'
 : '@tato.tabacaria_';

 return (
 <footer className="border-t border-border py-12 px-6 mt-8">
 <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
 {/* Logo and name */}
 <div className="flex items-center gap-3 group">
 <img src="/logo.jpeg" alt="" className="w-8 h-8 rounded-full object-cover" />
 <span className="font-bold text-xl text-foreground tracking-tight group-hover:text-primary transition-colors">TATO'S</span>
 </div>

 {/* Social link */}
 <a
 href={instagramUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
 >
 <Instagram className="h-4 w-4 group-hover:scale-110 transition-transform" />
 <span>{instagramHandle}</span>
 </a>

 {/* Legal links */}
 <div className="flex items-center gap-4 text-xs text-muted-foreground">
 <Link to="/termos" className="hover:text-primary transition-colors">
 Termos de Uso
 </Link>
 <span className="text-border">·</span>
 <Link to="/privacidade" className="hover:text-primary transition-colors">
 Política de Privacidade
 </Link>
 </div>

 {/* Divider */}
 <div className="w-16 h-[1px] bg-border" />

 {/* Legal notice */}
 <p className="text-[11px] text-muted-foreground/60">
 © {new Date().getFullYear()} Tatos Tabacaria · Venda proibida para menores de 18 anos
 </p>
 </div>
 </footer>
 );
}