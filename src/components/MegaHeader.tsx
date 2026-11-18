import { useEffect, useState } from 'react';
import { ArrowDown, ShoppingBag } from 'lucide-react';

/* ── Partículas flutuantes douradas (otimizado: 8 partículas, valores fixos) ── */
const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
 id: i,
 left: `${10 + i * 12}%`,
 delay: `${i * 0.7}s`,
 duration: `${8 + (i % 3) * 3}s`,
 size: `${2 + (i % 3)}px`,
 opacity: 0.2 + (i % 3) * 0.1,
}));

function GoldParticles() {
 return (
 <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
 {PARTICLES.map((p) => (
 <div
 key={p.id}
 className="absolute rounded-full bg-primary animate-particle-float"
 style={{
 left: p.left,
 bottom: '-10px',
 width: p.size,
 height: p.size,
 opacity: p.opacity,
 animationDelay: p.delay,
 animationDuration: p.duration,
 }}
 />
 ))}
 </div>
 );
}

export function MegaHeader() {
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
 setMounted(true);
 }, []);

 return (
 <header className="relative min-h-screen w-full overflow-hidden bg-background flex flex-col">
 {/* ── Fundo simplificado ── */}
 <div className="absolute inset-0 bg-background" />
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,_rgba(201,165,90,0.06)_0%,_transparent_50%)]" />

 {/* ── Partículas ── */}
 <GoldParticles />

 {/* ── Conteúdo principal ── */}
 <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-10">

 {/* Logo com glow sutil */}
 <div className={`relative mb-10 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
 <div className="relative inline-block">
 {/* Glow atrás do logo */}
 <div className="absolute inset-0 rounded-full bg-primary/10 blur-[60px] scale-[2]" />
 {/* Anel único */}
 <div className="absolute inset-[-12px] rounded-full border border-primary/10 animate-ring-pulse" />
 <img
 src="/logo.jpeg"
 alt="Tatos Tabacaria"
 className="relative w-36 h-36 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full border-2 border-primary/40 object-cover shadow-[0_0_30px_rgba(201,165,90,0.15)]"
 />
 </div>
 </div>

 {/* Título */}
 <div className={`relative mb-3 transition-all duration-700 delay-200 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
 <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight leading-none text-center">
 <span className="block text-foreground">TATO'S</span>
 </h1>
 </div>

 {/* Linha decorativa sob o título */}
 <div className={`h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mb-6 transition-all duration-700 delay-300 ease-out ${mounted ? 'w-32 md:w-48 opacity-100' : 'w-0 opacity-0'}`} />

 {/* Tagline */}
 <p
 className={`text-sm md:text-base font-medium text-muted-foreground tracking-[0.3em] uppercase mb-12 transition-all duration-700 delay-300 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
 >
 Tabacaria & Headshop
 </p>

 {/* CTA button */}
 <div className={`transition-all duration-500 delay-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
 <a
 href="#catalogo"
 className="group relative inline-flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider rounded-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,165,90,0.3)] hover:scale-105 active:scale-[0.98]"
 >
 <ShoppingBag className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
 <span>Ver Produtos</span>
 </a>
 </div>
 </div>

 {/* ── Scroll indicator ── */}
 <div className={`relative z-10 pb-10 flex justify-center transition-all duration-500 delay-700 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
 <a
 href="#catalogo"
 className="flex flex-col items-center gap-3 group"
 aria-label="Ver catálogo"
 >
 <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 group-hover:text-primary transition-colors duration-300">
 Explorar
 </span>
 <ArrowDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300 animate-bounce-smooth" />
 </a>
 </div>
 </header>
 );
}