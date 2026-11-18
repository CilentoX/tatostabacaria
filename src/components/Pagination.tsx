import { ChevronRight } from 'lucide-react';

interface PaginationProps {
  hasNext: boolean;
  loading: boolean;
  onLoadMore: () => void;
  label?: string;
}

export function Pagination({ hasNext, loading, onLoadMore, label = 'Carregar mais' }: PaginationProps) {
  if (!hasNext) return null;

  return (
    <div className="flex justify-center pt-6">
      <button
        onClick={onLoadMore}
        disabled={loading}
        className={"px-6 py-2.5 bg-secondary text-secondary-foreground font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-border"}
      >
        {loading ? (
          <>Carregando...</>
        ) : (
          <>{label} <ChevronRight className="h-3.5 w-3.5" /></>
        )}
      </button>
    </div>
  );
}

