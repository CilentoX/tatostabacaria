import { useEffect, useState } from 'react';
import { api, type Product, type SaleStats } from '../../lib/api';
import { Package, Image as ImageIcon, Video, AlertCircle, DollarSign, ShoppingCart, TrendingUp, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function getAssetUrl(src: string): string {
  if (src.startsWith('/uploads/')) return src;
  return src;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<SaleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.getAllProducts(),
      api.getSaleStats(),
    ])
      .then(([prodsRes, saleStats]) => {
        const prods = Array.isArray(prodsRes) ? prodsRes : (prodsRes as any).items ?? [];
        setProducts(prods);
        setStats(saleStats);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-muted-foreground text-sm animate-pulse">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    );
  }

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const imageProducts = products.filter((p) => p.type === 'image').length;
  const videoProducts = products.filter((p) => p.type === 'video').length;

  const financialStats = [
    { label: 'Receita Total', value: formatCurrency(stats?.totalRevenue ?? 0), icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Receita do Mês', value: formatCurrency(stats?.monthRevenue ?? 0), icon: TrendingUp, color: 'text-green-400' },
    { label: 'Vendas Totais', value: stats?.totalSales ?? 0, icon: ShoppingCart, color: 'text-blue-400' },
    { label: 'Vendas do Mês', value: stats?.monthSales ?? 0, icon: Calendar, color: 'text-amber-400' },
  ];

  const catalogStats = [
    { label: 'Total de Produtos', value: totalProducts, icon: Package, color: 'text-primary' },
    { label: 'Produtos Ativos', value: activeProducts, icon: Package, color: 'text-green-400' },
    { label: 'Imagens', value: imageProducts, icon: ImageIcon, color: 'text-blue-400' },
    { label: 'Vídeos', value: videoProducts, icon: Video, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral de vendas e catálogo</p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Financeiro</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {financialStats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-sm p-5 flex flex-col gap-3">
              <div className={`p-2 rounded-sm bg-background w-fit ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Catálogo</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {catalogStats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-sm p-5 flex flex-col gap-3">
              <div className={`p-2 rounded-sm bg-background w-fit ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Ìltimos Produtos</h2>
        {products.length === 0 ? (
          <div className="bg-card border border-border rounded-sm p-8 text-center">
            <Package className="h8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum produto cadastrado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 8).map((product) => (
              <div key={product.id} className="bg-card border border-border rounded-sm overflow-hidden">
                <div className="aspect-square bg-secondary relative">
                  {product.type === 'image' ? (
                    <img src={getAssetUrl(product.src)} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <video src={getAssetUrl(product.src)} preload="metadata" className="w-full h-full object-cover" />
                  )}
                  {!product.active && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Inativo</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase mt-0.5">{product.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

