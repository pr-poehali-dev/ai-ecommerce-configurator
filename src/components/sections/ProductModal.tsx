import Icon from '@/components/ui/icon';
import { CATEGORIES, type Product } from '@/data/products';
import { SOFTWARE_COMPATIBILITY } from '@/data/products';
import { useCartStore } from '@/store/cart';
import { useState } from 'react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onCompare: (id: string) => void;
  inCompare: boolean;
}

const TABS = ['Характеристики', 'Совместимость', 'Бенчмарки'] as const;
type Tab = typeof TABS[number];

const BENCHMARKS: Record<string, { label: string; score: number; max: number }[]> = {
  'ws-001': [
    { label: 'Cinebench R24 Multi', score: 8200, max: 10000 },
    { label: 'Blender BMW (сек)', score: 92, max: 300 },
    { label: 'SPECworkstation 4', score: 9.8, max: 12 },
    { label: 'DaVinci 4K Realtime', score: 100, max: 100 },
  ],
  'ws-002': [
    { label: 'Cinebench R24 Multi', score: 4800, max: 10000 },
    { label: 'SolidWorks RX', score: 9.1, max: 12 },
    { label: 'SPECworkstation 4', score: 7.2, max: 12 },
    { label: 'AutoCAD FPS', score: 180, max: 300 },
  ],
};

export default function ProductModal({ product, onClose, onCompare, inCompare }: ProductModalProps) {
  const [tab, setTab] = useState<Tab>('Характеристики');
  const addItem = useCartStore(s => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const compatSoftware = Object.entries(SOFTWARE_COMPATIBILITY).filter(([sw]) =>
    product.software.includes(sw)
  );

  const benchmarks = BENCHMARKS[product.id] ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/70"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl h-screen bg-background overflow-y-auto animate-slide-in-right shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-foreground text-white z-10 px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/30 mb-1">
              {CATEGORIES.find(c => c.id === product.category)?.label} / {product.id.toUpperCase()}
            </div>
            <h2 className="text-lg font-bold">{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors mt-0.5 flex-shrink-0"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Price & actions */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4 bg-secondary">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Стоимость</div>
            <div className="text-2xl font-bold font-mono">{product.price.toLocaleString('ru-RU')} ₽</div>
            <div className={`text-xs mt-1 font-medium ${
              product.stock === 'in_stock' ? 'text-green-600' :
              product.stock === 'order' ? 'text-amber-600' : 'text-red-500'
            }`}>
              {product.stock === 'in_stock' ? '● В наличии' : product.stock === 'order' ? '● Под заказ (2-3 нед.)' : '● Нет в наличии'}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleAdd}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                added ? 'bg-green-600 text-white' : 'btn-primary'
              }`}
            >
              <Icon name={added ? 'Check' : 'ShoppingCart'} size={14} />
              {added ? 'Добавлено' : 'В корзину'}
            </button>
            <button
              onClick={() => onCompare(product.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide border transition-colors ${
                inCompare
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
              }`}
            >
              <Icon name="BarChart2" size={14} />
              {inCompare ? 'В сравнении' : 'Сравнить'}
            </button>
          </div>
        </div>

        {/* Short desc */}
        <div className="px-6 py-4 border-b border-border">
          <p className="text-sm text-muted-foreground">{product.shortDesc}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-xs font-medium uppercase tracking-wider border-b-2 transition-colors ${
                tab === t
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 px-6 py-5">
          {tab === 'Характеристики' && (
            <div>
              <table className="w-full">
                <tbody>
                  {Object.entries(product.specs).map(([key, val], i) => (
                    <tr key={key} className={i % 2 === 0 ? 'bg-secondary' : ''}>
                      <td className="py-3 px-3 text-xs text-muted-foreground w-40">{key}</td>
                      <td className="py-3 px-3 text-xs font-mono">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'Совместимость' && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground mb-4">
                Рекомендованное программное обеспечение для данной конфигурации:
              </p>
              {product.software.map(sw => {
                const compat = SOFTWARE_COMPATIBILITY[sw];
                return (
                  <div key={sw} className="border border-border p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="category-pill">{sw}</span>
                      <div className="flex-1 h-px bg-border" />
                      <Icon name="CheckCircle" size={14} className="text-green-600" />
                    </div>
                    {compat && (
                      <div className="space-y-2 text-xs">
                        <div className="flex gap-2">
                          <span className="text-muted-foreground w-20 flex-shrink-0">CPU:</span>
                          <span className="font-mono">{compat.cpu}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-muted-foreground w-20 flex-shrink-0">GPU:</span>
                          <span className="font-mono">{compat.gpu}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-muted-foreground w-20 flex-shrink-0">RAM:</span>
                          <span className="font-mono">{compat.ram}</span>
                        </div>
                        <div className="mt-3 bg-accent/5 border border-accent/20 p-3 text-muted-foreground leading-relaxed">
                          <Icon name="Info" size={11} className="inline mr-1 text-accent" />
                          {compat.note}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {compatSoftware.length === 0 && (
                <div className="text-sm text-muted-foreground">Данные совместимости не указаны.</div>
              )}
            </div>
          )}

          {tab === 'Бенчмарки' && (
            <div>
              {benchmarks ? (
                <div className="space-y-5">
                  <p className="text-xs text-muted-foreground mb-4">
                    Результаты тестирования (демо-данные, актуальны для базовой конфигурации):
                  </p>
                  {benchmarks.map(b => (
                    <div key={b.label}>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-mono text-muted-foreground">{b.label}</span>
                        <span className="font-bold font-mono">{b.score}</span>
                      </div>
                      <div className="h-2 bg-secondary w-full">
                        <div
                          className="h-2 bg-accent transition-all"
                          style={{ width: `${(b.score / b.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="BarChart" size={32} className="text-border mx-auto mb-3" />
                  <div className="text-sm text-muted-foreground">
                    Бенчмарки для данной модели будут добавлены.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer ask AI */}
        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4">
          <button className="w-full border border-accent/30 text-accent text-xs font-medium uppercase tracking-wider py-2.5 hover:bg-accent/5 transition-colors flex items-center justify-center gap-2">
            <Icon name="Sparkles" size={13} />
            Спросить AI об этом товаре
          </button>
        </div>
      </div>
    </div>
  );
}
