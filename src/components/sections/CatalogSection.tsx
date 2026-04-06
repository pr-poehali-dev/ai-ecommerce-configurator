import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { PRODUCTS, CATEGORIES, SOFTWARE_COMPATIBILITY, type Category, type Product } from '@/data/products';
import { useCartStore } from '@/store/cart';

const SOFTWARE_LIST = Object.keys(SOFTWARE_COMPATIBILITY);

interface CatalogProps {
  onProduct: (product: Product) => void;
  compareIds: string[];
  onCompare: (id: string) => void;
}

const STOCK_LABEL: Record<string, { label: string; color: string }> = {
  in_stock: { label: 'В наличии', color: 'text-green-600' },
  order: { label: 'Под заказ', color: 'text-amber-600' },
  out: { label: 'Нет в наличии', color: 'text-red-500' },
};

export default function CatalogSection({ onProduct, compareIds, onCompare }: CatalogProps) {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'name'>('name');
  const [softwareFilter, setSoftwareFilter] = useState<string[]>([]);
  const [showSoftwareFilter, setShowSoftwareFilter] = useState(false);
  const addItem = useCartStore(s => s.addItem);
  const [added, setAdded] = useState<string | null>(null);

  const toggleSoftware = (sw: string) => {
    setSoftwareFilter(prev => prev.includes(sw) ? prev.filter(s => s !== sw) : [...prev, sw]);
  };

  const filtered = PRODUCTS
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .filter(p => softwareFilter.length === 0 || softwareFilter.every(sw => p.software.includes(sw)))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

  const handleAdd = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(p);
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-border">
          <div>
            <div className="section-label mb-2">Ассортимент</div>
            <h2 className="text-3xl font-bold">Каталог оборудования</h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {/* Software filter */}
            <div className="relative">
              <button
                onClick={() => setShowSoftwareFilter(v => !v)}
                className={`flex items-center gap-2 text-xs px-3 py-1.5 border transition-colors ${
                  softwareFilter.length > 0
                    ? 'bg-accent text-white border-accent'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Filter" size={12} />
                Совместимость с ПО
                {softwareFilter.length > 0 && <span className="bg-white text-accent rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">{softwareFilter.length}</span>}
              </button>
              {showSoftwareFilter && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border shadow-lg p-3 min-w-[200px]">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Фильтр по ПО</div>
                  <div className="space-y-1.5">
                    {SOFTWARE_LIST.map(sw => (
                      <label key={sw} className="flex items-center gap-2 cursor-pointer text-xs hover:text-foreground text-muted-foreground">
                        <div
                          onClick={() => toggleSoftware(sw)}
                          className={`w-3.5 h-3.5 border flex items-center justify-center flex-shrink-0 cursor-pointer ${softwareFilter.includes(sw) ? 'bg-accent border-accent' : 'border-border'}`}
                        >
                          {softwareFilter.includes(sw) && <Icon name="Check" size={9} className="text-white" />}
                        </div>
                        <span onClick={() => toggleSoftware(sw)}>{sw}</span>
                      </label>
                    ))}
                  </div>
                  {softwareFilter.length > 0 && (
                    <button onClick={() => setSoftwareFilter([])} className="mt-2 text-[10px] text-muted-foreground hover:text-foreground underline">Сбросить</button>
                  )}
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Сортировка:</span>
            {([
              ['name', 'По названию'],
              ['price_asc', 'Дешевле'],
              ['price_desc', 'Дороже'],
            ] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSortBy(val)}
                className={`text-xs px-3 py-1.5 border transition-colors ${
                  sortBy === val
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider border transition-colors ${
              activeCategory === 'all'
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
            }`}
          >
            <Icon name="Layers" size={13} />
            Все категории
            <span className="font-mono text-[10px] opacity-60">({PRODUCTS.length})</span>
          </button>
          {CATEGORIES.map(cat => {
            const cnt = PRODUCTS.filter(p => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as Category)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider border transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                <Icon name={cat.icon} size={13} />
                {cat.label}
                <span className="font-mono text-[10px] opacity-60">({cnt})</span>
              </button>
            );
          })}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-stagger">
          {filtered.map(product => {
            const stockInfo = STOCK_LABEL[product.stock];
            const inCompare = compareIds.includes(product.id);
            const isAdded = added === product.id;

            return (
              <div
                key={product.id}
                className="product-card flex flex-col"
                onClick={() => onProduct(product)}
              >
                {/* Card top */}
                <div className="p-5 flex-1">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {product.badge && (
                        <span className="category-pill mb-2 block w-fit">{product.badge}</span>
                      )}
                      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                        {CATEGORIES.find(c => c.id === product.category)?.label}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onCompare(product.id); }}
                      className={`w-7 h-7 flex items-center justify-center border transition-colors ${
                        inCompare
                          ? 'bg-foreground text-background border-foreground'
                          : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                      }`}
                      title={inCompare ? 'Убрать из сравнения' : 'Добавить в сравнение'}
                    >
                      <Icon name="BarChart2" size={12} />
                    </button>
                  </div>

                  {/* Product icon */}
                  <div className="h-20 bg-secondary flex items-center justify-center mb-4 border border-border">
                    <Icon
                      name={CATEGORIES.find(c => c.id === product.category)?.icon ?? 'Package'}
                      size={36}
                      className="text-muted-foreground/40"
                    />
                  </div>

                  <h3 className="font-semibold text-sm mb-1 group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {product.shortDesc}
                  </p>

                  {/* Key specs */}
                  <div className="space-y-1.5">
                    {Object.entries(product.specs).slice(0, 3).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-mono text-right ml-2 text-foreground/80 truncate max-w-[55%]">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card bottom */}
                <div className="border-t border-border p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className={`text-[10px] font-medium ${stockInfo.color} mb-0.5`}>
                      {stockInfo.label}
                    </div>
                    <div className="text-lg font-bold font-mono">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleAdd(product, e)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                      isAdded
                        ? 'bg-green-600 text-white'
                        : 'bg-foreground text-background hover:bg-accent hover:text-white'
                    }`}
                  >
                    <Icon name={isAdded ? 'Check' : 'Plus'} size={13} />
                    {isAdded ? 'Добавлено' : 'В корзину'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}