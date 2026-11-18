import { Flame, Star, Truck, ShieldCheck } from 'lucide-react';

const ITEMS = [
  { icon: Flame, text: "TATO'S TABACARIA" },
  { icon: Star, text: 'PRODUTOS SELECIONADOS' },
  { icon: ShieldCheck, text: 'QUALIDADE GARANTIDA' },
  { icon: Truck, text: 'ENTREGA RÁPIDA' },
];

function MarqueeItem({ icon: Icon, text }: { icon: typeof Flame; text: string }) {
  return (
    <span className="inline-flex items-center gap-3 mx-6 md:mx-10 shrink-0">
      <Icon className="h-4 w-4 text-white/80" />
      <span className="text-white font-black text-sm md:text-base uppercase tracking-[0.2em]">
        {text}
      </span>
    </span>
  );
}

export function MarqueeStrip() {
  // Renderiza itens suficientes para cobrir a tela sem gaps durante o loop
  const renderItems = () => {
    const repeated = Array.from({ length: 6 }, (_, i) =>
      ITEMS.map((item, j) => <MarqueeItem key={`${i}-${j}`} {...item} />)
    );
    return repeated.flat();
  };

  return (
    <div className="relative bg-primary py-3 md:py-4 border-y border-primary/20 group cursor-default overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Scrolling track */}
      <div className="animate-marquee whitespace-nowrap flex items-center will-change-transform group-hover:[animation-play-state:paused]">
        {renderItems()}
        {renderItems()}
      </div>
    </div>
  );
}