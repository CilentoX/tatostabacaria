import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-2">
        404
      </p>
      <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-4">
        Página não encontrada
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-all duration-300 glow-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o início
      </Link>
    </section>
  );
}