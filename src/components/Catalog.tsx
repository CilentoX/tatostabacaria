import { useEffect, useState, useMemo } from 'react';
import { Send, Package, Search, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { api, type Product, type Category } from '../lib/api';

const INSTAGRAM_URL = 'https://ig.me/m/tato.tabacaria_';


function getAssetUrl(src: string): string {
 if (src.startsWith('/uploads/')) {
 const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
 return `${API_URL}${src}`;
 }
 return src;
}

export function Catalog() {
 const [products, setProducts] = useState<Product[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [categories, setCategories] = useState<Category[]>([]);
 const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
 const [search, setSearch] = useState('');
 const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

 useEffect(() => {
 Promise.all([api.getProducts(), api.getCategories()])
 .then(([prods, cats]) => {
 setProducts(prods);
 setCategories(cats);
 })
 .catch((err) => setError(err.message))
 .finally(() => setLoading(false));
 }, []);

 const filteredProducts = useMemo(() => {
 let result = products;

 if (selectedCategoryId !== null) {
 result = result.filter((p) => (p as any).categoryId === selectedCategoryId);
 }

 if (search.trim()) {
 const term = search.toLowerCase().trim();
 result = result.filter((p) => p.name.toLowerCase().includes(term));
 }

 return result;
 }, [products, selectedCategoryId, search]);



 const toggleSelect = (id: number) => {
 setSelectedIds((prev) => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 return next;
 });
 };

 const sendSelectionToInstagram = async () => {
 const selectedProducts = products.filter((p) => selectedIds.has(p.id));
 if (selectedProducts.length === 0) return;
 const list = selectedProducts.map((p) => `• ${p.name}`).join('\n');
 const message = `Olá! Tenho interesse nos seguintes produtos:\n\n${list}\n\nPoderia me passar mais informações?`;
 try {
 await navigator.clipboard.writeText(message);
 toast.success('Mensagem copiada! Cole no Instagram.', { duration: 3000 });
 } catch {
 toast.info('Copie a mensagem e cole no Instagram.', { duration: 4000 });
 }
 window.open(INSTAGRAM_URL, '_blank');
 };

 const clearSelection = () => setSelectedIds(new Set());

 return (
 <section id="catalogo" className="py-24 px-6 relative">
 <div className="max-w-7xl mx-auto">
 {/* Section header */}
 <div className="mb-12 text-center">
 <p className="text-xs font-bold text-primary uppercase tracking-[0.35em] mb-3">
 Catálogo Exclusivo
 </p>
 <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-4">
 Nossos Produtos
 </h2>
 <div className="w-16 h-0.5 bg-primary mx-auto mb-6" />
 <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
 Seleção curada dos melhores acessórios e produtos premium.
 Peça direto pelo nosso Instagram.
 </p>
 </div>

 {/* Filters and search bar */}
 {!loading && !error && products.length > 0 && (
 <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
 {/* Filter tabs */}
 <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg border border-border/50">
 {categories.map((cat) => (
 <button
 key={cat.id}
 onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
 className={'flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-300 ' + (selectedCategoryId === cat.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary')}
 >
 <Package className='h-3.5 w-3.5' />
 {cat.name}
 </button>
 ))}
 </div>

 {/* Search input */}
 <div className="relative w-full md:w-72">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Buscar produto..."
 className="w-full bg-card border border-border/50 rounded-lg pl-10 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
 />
 {search && (
 <button
 onClick={() => setSearch('')}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 )}
 </div>
 </div>
 )}

 {/* Results count when filtering/searching */}
 {!loading && !error && (selectedCategoryId !== null || search.trim()) && (
 <p className="text-xs text-muted-foreground mb-6 text-center md:text-left">
 {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
 </p>
 )}

 {/* Loading state */}
 {loading && (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {Array.from({ length: 8 }).map((_, i) => (
 <div key={i} className="rounded-xl overflow-hidden bg-card border border-border/50">
 <div className="aspect-[4/5] bg-secondary animate-pulse" />
 <div className="p-5 space-y-3">
 <div className="h-5 bg-secondary rounded animate-pulse w-2/3" />
 <div className="h-10 bg-secondary rounded-lg animate-pulse" />
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Error state */}
 {!loading && error && (
 <div className="text-center py-24">
 <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4">
 <Package className="h-6 w-6 text-red-400" />
 </div>
 <p className="text-red-400 text-sm font-medium">{error}</p>
 </div>
 )}

 {/* Empty state (no products at all) */}
 {!loading && !error && products.length === 0 && (
 <div className="flex flex-col items-center justify-center py-24 text-center">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-5">
 <Package className="h-8 w-8 text-muted-foreground/40" />
 </div>
 <p className="text-base font-medium text-foreground mb-1">Catálogo vazio</p>
 <p className="text-sm text-muted-foreground">Nenhum produto disponível no momento.</p>
 </div>
 )}

 {/* No results from filter/search */}
 {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
 <div className="flex flex-col items-center justify-center py-20 text-center">
 <Search className="h-10 w-10 text-muted-foreground/20 mb-4" />
 <p className="text-sm font-medium text-foreground mb-1">Nenhum resultado</p>
 <p className="text-xs text-muted-foreground">Tente ajustar os filtros ou o termo de busca.</p>
 <button
 onClick={() => { setSelectedCategoryId(null); setSearch(''); }}
 className="mt-4 text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-wider transition-colors"
 >
 Limpar filtros
 </button>
 </div>
 )}

 {/* Product grid */}
 {!loading && !error && filteredProducts.length > 0 && (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {filteredProducts.map((product) => (
 <div
 key={product.id}
 className="group relative rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
 >
 {/* Image container - taller aspect ratio for premium feel */}
 <div className="aspect-[4/5] overflow-hidden bg-secondary relative">
 {product.type === 'image' ? (
 <img
 src={getAssetUrl(product.src)}
 alt={product.name}
 loading="lazy"
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
 />
 ) : (
 <>
 <video
 src={getAssetUrl(product.src)}
 autoPlay
 muted
 loop
 playsInline
 preload="metadata"
 className="w-full h-full object-cover"
 />
 {/* Video play indicator */}
 <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 backdrop-blur-sm">
 <Package className='h-3 w-3 text-white fill-white' />
 </div>
 </>
 )}

 {/* Gradient overlay on hover */}
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

 {/* Selection checkbox */}
 <button
 onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelect(product.id); }}
 className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
 selectedIds.has(product.id)
 ? 'bg-primary border-primary text-primary-foreground'
 : 'border-white/70 bg-black/30 backdrop-blur-sm text-transparent hover:border-primary'
 }`}
 aria-label={selectedIds.has(product.id) ? 'Remover da seleção' : 'Adicionar à seleção'}
 >
 <Check className="h-3.5 w-3.5" />
 </button>


 {/* Hover CTA overlay */}
 <div className="absolute inset-x-0 bottom-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
 <a
 href={INSTAGRAM_URL}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-widest transition-colors duration-300 active:scale-[0.98]"
 >
 <Send className="h-3.5 w-3.5" />
 Pedir pelo Instagram
 </a>
 </div>
 </div>

 {/* Product info - always visible below image */}
 <div className="p-5">
 <div className="flex items-start justify-between gap-2 mb-1">
 <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
 {product.name}
 </p>
 {product.price != null && (
 <span className="shrink-0 text-xs font-bold text-primary whitespace-nowrap">
 R$ {Number(product.price).toFixed(2).replace('.', ',')}
 </span>
 )}
 </div>
 {product.description && (
 <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-1.5">
 {product.description}
 </p>
 )}
 <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
 {product.type === 'video' ? 'Vídeo' : 'Imagem'}
 </p>
 </div>

 {/* Subtle gold border glow on hover */}
 <div className="absolute inset-0 rounded-xl ring-1 ring-primary/0 group-hover:ring-primary/20 transition-all duration-500 pointer-events-none" />
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Floating selection bar */}
 {selectedIds.size > 0 && (
 <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 fade-in duration-300">
 <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
 <div className="flex items-center gap-2">
 <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
 {selectedIds.size}
 </div>
 <span className="text-xs font-medium text-foreground whitespace-nowrap">
 {selectedIds.size === 1 ? 'produto selecionado' : 'produtos selecionados'}
 </span>
 </div>
 <div className="w-px h-5 bg-border" />
 <button
 onClick={sendSelectionToInstagram}
 className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E1306C] hover:bg-[#C13584] text-white text-xs font-bold uppercase tracking-wider transition-colors"
 >
 <Send className="h-3 w-3" />
 Enviar no Instagram
 </button>
 <button
 onClick={clearSelection}
 className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
 aria-label="Limpar seleção"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 </div>
 </div>
 )}

 </section>
 );
}