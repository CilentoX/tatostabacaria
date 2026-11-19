import { useEffect, useState, useRef, type FormEvent } from 'react';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api, type Product } from '../../lib/api';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, Image as ImageIcon, AlertCircle, Check, GripVertical, Edit3, X, Save } from 'lucide-react';
import { Pagination } from '../../components/Pagination';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function getAssetUrl(src: string): string {
  if (src.startsWith('/uploads/')) return src;
  return src;
}
}


function SortableProduct({ product, onToggle, onDelete, onEdit, onStockChange }: { product: Product; onToggle: (p: Product) => void; onDelete: (id: number, name: string) => void; onEdit: (p: Product) => void; onStockChange: (p: Product, stock: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-card border rounded-sm overflow-hidden transition-colors ${product.active ? 'border-border' : 'border-red-500/30 opacity-60'}`}>
      <div className="aspect-square bg-secondary relative group">
        {product.type === 'image' ? (
          <img src={getAssetUrl(product.src)} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <video src={getAssetUrl(product.src)} preload="metadata" className="w-full h-full object-cover" />
        )}
        <div {...attributes} {...listeners} className="absolute top-2 left-2 p-1 rounded bg-black/50 text-white cursor-grab active:cursor-grabbing hover:bg-black/70 transition-colors">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button onClick={() => onToggle(product)} className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors ${product.active ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>
            {product.active ? 'Desativar' : 'Ativar'}
          </button>
          <button onClick={() => onEdit(product)} className="px-3 py-1.5 rounded-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs font-bold uppercase tracking-wider transition-colors">
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(product.id, product.name)} className="px-3 py-1.5 rounded-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-bold uppercase tracking-wider transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {!product.active && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-red-500/90 text-[9px] font-bold uppercase text-white">Inativo</div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground uppercase">{product.type}</p>
          {product.price != null && (
            <span className="text-[10px] font-bold text-primary">R$ {Number(product.price).toFixed(2).replace('.', ',')}</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[10px] text-muted-foreground">Estoque:</span>
          <input
            type="number"
            min="0"
            value={product.stock ?? 0}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 0) onStockChange(product, val);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-14 bg-background border border-border rounded px-1 py-0.5 text-[10px] text-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

    </div>
  );
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [editName, setEditName] = useState('');
	const [editType, setEditType] = useState<'image' | 'video'>('image');
	const [editPrice, setEditPrice] = useState('');
	const [editDescription, setEditDescription] = useState('');
	const [editStock, setEditStock] = useState('');
	const [savingEdit, setSavingEdit] = useState(false);

  // Drag and drop state
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    const newProducts = arrayMove(products, oldIndex, newIndex);
    setProducts(newProducts);

    try {
      await api.reorderProducts(newProducts.map((p) => p.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reordenar');
    }
  }

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [price, setPrice] = useState('');
 const [description, setDescription] = useState('');
 const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await api.getAllProducts();
      setProducts(res.items);
      setNextCursor(res.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    try {
      setLoadingMore(true);
      const res = await api.getAllProducts({ cursor: nextCursor, limit: 20 });
      setProducts((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar mais produtos');
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || !name) return;

    setUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('type', type);
      formData.append('file', file);
 if (price) formData.append('price', price);
 if (description) formData.append('description', description);

      await api.createProduct(formData);
      setSuccessMsg('Produto criado com sucesso!');
      setName('');
      setFile(null);
      setType('image');
 setPrice('');
 setDescription('');
      setShowForm(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadProducts();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar produto');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number, productName: string) {
    if (!confirm(`Tem certeza que deseja deletar "${productName}"?`)) return;

    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar produto');
    }
  }

  async function toggleActive(product: Product) {
    try {
      const updated = await api.updateProduct(product.id, { active: !product.active });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar produto');
    }
  }


	function openEdit(product: Product) {
		setEditingProduct(product);
		setEditName(product.name);
		setEditType(product.type);
		setEditPrice(product.price != null ? String(product.price) : '');
		setEditDescription(product.description || '');
		setEditStock(product.stock != null ? String(product.stock) : '0');
	}

	function closeEdit() {
		setEditingProduct(null);
		setEditName('');
		setEditType('image');
		setEditPrice('');
		setEditDescription('');
		setEditStock('');
	}

	async function handleEditSubmit(e: FormEvent) {
		e.preventDefault();
		if (!editingProduct) return;

		setSavingEdit(true);
		try {
			const updateData: Partial<Product> = {
				name: editName,
				type: editType,
				price: editPrice ? parseFloat(editPrice) : undefined,
				description: editDescription || undefined,
				stock: editStock ? parseInt(editStock, 10) : undefined,
			};
			const updated = await api.updateProduct(editingProduct.id, updateData);
			setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
			toast.success('Produto atualizado!');
			closeEdit();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Erro ao atualizar produto');
		} finally {
			setSavingEdit(false);
		}
	}

	async function quickUpdateStock(product: Product, newStock: number) {
		try {
			const updated = await api.updateProduct(product.id, { stock: newStock });
			setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
			toast.success(`Estoque atualizado: ${newStock}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Erro ao atualizar estoque');
		}
	}

  if (loading) {
    return <div className="text-muted-foreground text-sm animate-pulse">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} produtos cadastrados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors"
        >
          {showForm ? 'Cancelar' : <><Plus className="h-4 w-4" /> Novo Produto</>}
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

      {/* Upload form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-sm p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Adicionar Produto</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="Nome do produto"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'image' | 'video')}
                className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              >
                <option value="image">Imagem</option>
                <option value="video">Vídeo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="0,00 (opcional)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="Breve descrição do produto (opcional)"
                maxLength={300}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Arquivo</label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                required
                accept={type === 'image' ? 'image/*' : 'video/*'}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground file:mr-3 file:px-3 file:py-1 file:rounded-sm file:bg-primary file:text-primary-foreground file:text-xs file:font-bold file:uppercase file:border-0 file:cursor-pointer focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            {file && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <div className="aspect-video bg-secondary rounded-sm overflow-hidden border border-border">
                  {type === 'image' ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(file)}
                      controls
                      preload="metadata"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading || !file || !name}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>Carregando...</>
            ) : (
              <><Upload className="h-3.5 w-3.5" /> Salvar Produto</>
            )}
          </button>
        </form>
      )}

      {/* Products list */}
      {products.length === 0 ? (
        <div className="bg-card border border-border rounded-sm p-12 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum produto cadastrado.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Clique em "Novo Produto" para adicionar.</p>
        </div>
      ) : (
        <>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <SortableProduct key={product.id} product={product} onToggle={toggleActive} onDelete={handleDelete} onEdit={openEdit} onStockChange={quickUpdateStock} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

          <Pagination hasNext={!!nextCursor} loading={loadingMore} onLoadMore={loadMore} />
        </>

      )}


      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-sm w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Editar Produto</h2>
              <button onClick={closeEdit} className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome</label>
                  <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo</label>
                  <select value={editType} onChange={(e) => setEditType(e.target.value as 'image' | 'video')}
                    className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                    <option value="image">Imagem</option>
                    <option value="video">Vídeo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preço (R$)</label>
                  <input type="number" step="0.01" min="0" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="0,00" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estoque</label>
                  <input type="number" min="0" value={editStock} onChange={(e) => setEditStock(e.target.value)}
                    className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                  <div className="flex items-center h-[42px]">
                    <span className={`text-xs font-bold uppercase tracking-wider ${editingProduct.active ? 'text-green-400' : 'text-red-400'}`}>
                      {editingProduct.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} maxLength={500}
                  className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Breve descrição do produto (opcional)" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={closeEdit}
                  className="px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={savingEdit || !editName.trim()}
                  className="px-6 py-2 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {savingEdit ? 'Salvando...' : <><Save className="h-3.5 w-3.5" /> Salvar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

