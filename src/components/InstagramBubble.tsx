import { useSettings } from '../hooks/useSettings';

export function InstagramBubble() {
 const { settings } = useSettings();
 const instagramUrl = settings.instagram_url || 'https://ig.me/m/tato.tabacaria_';

 // Converter URL do perfil para link direto de DM se necessário
 const dmUrl = instagramUrl.includes('instagram.com/') && !instagramUrl.includes('ig.me')
 ? instagramUrl.replace('instagram.com/', 'ig.me/m/')
 : instagramUrl;

 return (
 <a
 href={dmUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="fixed bottom-6 right-6 z-50 group animate-bubble-float"
 aria-label="Falar no Instagram"
 >
 {/* Glow effect behind */}
 <div className="absolute inset-0 rounded-full bg-[#E1306C]/40 blur-xl scale-150 group-hover:bg-[#E1306C]/60 transition-all duration-300" />

 {/* Bubble container - Instagram gradient feel */}
 <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-[0_0_30px_rgba(225,48,108,0.6)] transition-all duration-300 group-hover:scale-110">
 {/* Instagram icon - white */}
 <svg
 viewBox="0 0 24 24"
 fill="none"
 stroke="#ffffff"
 strokeWidth="1.8"
 strokeLinecap="round"
 strokeLinejoin="round"
 className="w-7 h-7 md:w-8 md:h-8"
 >
 <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
 <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
 <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
 </svg>
 </div>

 {/* Tooltip on hover */}
 <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 bg-card border border-border rounded-md text-xs font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
 Fale conosco
 <div className="absolute top-full right-5 w-2 h-2 bg-card border-r border-b border-border rotate-45 -translate-y-1/2" />
 </div>
 </a>
 );
}