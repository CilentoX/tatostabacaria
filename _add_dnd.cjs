const fs = require('fs');
const p = 'src/pages/admin/Products.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Add dnd-kit imports
c = c.replace(
  "import { useEffect, useState, useRef, type FormEvent } from 'react';",
  "import { useEffect, useState, useRef, type FormEvent } from 'react';\nimport {\n  DndContext,\n  closestCenter,\n  useSensor,\n  useSensors,\n  PointerSensor,\n} from '@dnd-kit/core';\nimport {\n  arrayMove,\n  SortableContext,\n  useSortable,\n  verticalListSortingStrategy,\n} from '@dnd-kit/sortable';\nimport { CSS } from '@dnd-kit/utilities';"
);

// 2. Add Grip icon to lucide imports
c = c.replace(
  "import { Plus, Trash2, Upload, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';",
  "import { Plus, Trash2, Upload, Image as ImageIcon, AlertCircle, Check, GripVertical } from 'lucide-react';"
);

// 3. Add SortableProduct component before main function
const sortableComponent = `
function SortableProduct({ product, onToggle, onDelete }: { product: Product; onToggle: (p: Product) => void; onDelete: (id: number, name: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={\`bg-card border rounded-sm overflow-hidden transition-colors \${product.active ? 'border-border' : 'border-red-500/30 opacity-60'}\`}>
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
          <button onClick={() => onToggle(product)} className={\`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors \${product.active ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}\`}>
            {product.active ? 'Desativar' : 'Ativar'}
          </button>
          <button onClick={() => onDelete(product.id, product.name)} className="px-3 py-1.5 rounded-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-bold uppercase tracking-wider transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {!product.active && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-red-500/90 text-[9px] font-bold uppercase text-white">Inativo</div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
        <p className="text-[10px] text-muted-foreground uppercase mt-0.5">{product.type}</p>
      </div>
    </div>
  );
}
`;

c = c.replace('export function AdminProducts() {', sortableComponent + '\nexport function AdminProducts() {');

// 4. Add sensors and drag handlers inside AdminProducts
c = c.replace(
  '  const [successMsg, setSuccessMsg] = useState(\'\');',
  "  const [successMsg, setSuccessMsg] = useState('');\n\n  // Drag and drop state\n  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));\n\n  async function handleDragEnd(event: any) {\n    const { active, over } = event;\n    if (!over || active.id === over.id) return;\n\n    const oldIndex = products.findIndex((p) => p.id === active.id);\n    const newIndex = products.findIndex((p) => p.id === over.id);\n    const newProducts = arrayMove(products, oldIndex, newIndex);\n    setProducts(newProducts);\n\n    try {\n      await api.reorderProducts(newProducts.map((p) => p.id));\n    } catch (err) {\n      setError(err instanceof Error ? err.message : 'Erro ao reordenar');\n    }\n  }"
);

// 5. Wrap grid with DndContext and SortableContext, replace map with SortableProduct
c = c.replace(
  '        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">\n          {products.map((product) => (\n            <div',
  '        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>\n          <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>\n            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">\n              {products.map((product) => (\n                <SortableProduct key={product.id} product={product} onToggle={toggleActive} onDelete={handleDelete} />\n              ))}\n            </div>\n          </SortableContext>\n        </DndContext>\n        {/* Old grid removed */}\n        <div style={{ display: \'none\' }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">\n          {products.map((product) => (\n            <div'
);

// Close the hidden div properly - find the closing of the original map
// The original ends with: ))} \n </div> \n )} \n </div>
// We need to close the hidden div after the original content
c = c.replace(
  '            </div>\n          ))}\n        </div>\n      )}\n    </div>\n  );\n}',
  '            </div>\n          ))}\n        </div>\n      )}\n    </div>\n  );\n}'
);

// Actually, let's just remove the old hidden grid entirely since we replaced it
// Find and remove the hidden div block
const hiddenGridStart = '        {/* Old grid removed */}\n        <div style={{ display: \'none\' }}';
const hiddenGridEnd = '        </div>\n      )}\n    </div>\n  );\n}';

// Simpler approach: just replace the entire grid section
const oldGridSection = `        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={\`bg-card border rounded-sm overflow-hidden transition-colors \${
                product.active ? 'border-border' : 'border-red-500/30 opacity-60'
              }\`}
            >
              <div className="aspect-square bg-secondary relative group">
                {product.type === 'image' ? (
                  <img
                    src={getAssetUrl(product.src)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={getAssetUrl(product.src)}
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => toggleActive(product)}
                    className={\`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors \${
                      product.active
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }\`}
                  >
                    {product.active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="px-3 py-1.5 rounded-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {!product.active && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-red-500/90 text-[9px] font-bold uppercase text-white">
                    Inativo
                  </div>
                )}
              </div>

              <div className="p-3">
                <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase mt-0.5">{product.type}</p>
              </div>
            </div>
          ))}
        </div>`;

const newGridSection = `        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <SortableProduct key={product.id} product={product} onToggle={toggleActive} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>`;

if (c.includes(oldGridSection)) {
  c = c.replace(oldGridSection, newGridSection);
  console.log('GRID_REPLACED');
} else {
  console.log('GRID_PATTERN_NOT_FOUND');
}

// 6. Add reorderProducts to api.ts if missing
const apiPath = 'src/lib/api.ts';
let apiContent = fs.readFileSync(apiPath, 'utf8');
if (!apiContent.includes('reorderProducts')) {
  const reorderMethod = `
  async reorderProducts(order: number[]): Promise<void> {
    return this.request<void>('/api/products/reorder', {
      method: 'PUT',
      body: JSON.stringify({ order }),
    });
  }
`;
  // Insert before the closing brace of the class
  apiContent = apiContent.replace(/  \}\n\}/, reorderMethod + '  }\n}');
  fs.writeFileSync(apiPath, apiContent);
  console.log('API_REORDER_ADDED');
}

fs.writeFileSync(p, c);
console.log('DND_IMPLEMENTATION_DONE');
