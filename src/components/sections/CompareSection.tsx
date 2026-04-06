import Icon from '@/components/ui/icon';
import { PRODUCTS, CATEGORIES } from '@/data/products';

interface CompareSectionProps {
  compareIds: string[];
  onRemove: (id: string) => void;
  onNav: (section: string) => void;
}

export default function CompareSection({ compareIds, onRemove, onNav }: CompareSectionProps) {
  const products = PRODUCTS.filter(p => compareIds.includes(p.id));

  if (compareIds.length === 0) {
    return (
      <section className="py-16 bg-background border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="section-label mb-2">Таблица</div>
          <h2 className="text-3xl font-bold mb-10">Сравнение товаров</h2>
          <div className="border border-dashed border-border p-16 text-center">
            <Icon name="BarChart2" size={40} className="text-border mx-auto mb-4" />
            <div className="text-muted-foreground text-sm mb-4">
              Добавьте товары для сравнения через иконку <Icon name="BarChart2" size={13} className="inline" /> в карточке каталога
            </div>
            <button onClick={() => onNav('catalog')} className="btn-outline">
              Перейти в каталог
            </button>
          </div>
        </div>
      </section>
    );
  }

  const allSpecKeys = Array.from(
    new Set(products.flatMap(p => Object.keys(p.specs)))
  );

  return (
    <section className="py-16 bg-background border-t border-border">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="section-label mb-2">Таблица</div>
            <h2 className="text-3xl font-bold">Сравнение товаров</h2>
          </div>
          {compareIds.length < 4 && (
            <button onClick={() => onNav('catalog')} className="btn-outline flex items-center gap-2">
              <Icon name="Plus" size={14} />
              Добавить товар ({compareIds.length}/4)
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="table-header text-left w-48 border-r border-border">Характеристика</th>
                {products.map(p => (
                  <th key={p.id} className="table-header border-r border-border last:border-r-0 min-w-52">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-left">
                        <div className="font-mono text-[10px] text-muted-foreground mb-1">
                          {CATEGORIES.find(c => c.id === p.category)?.label}
                        </div>
                        <div className="font-semibold text-foreground text-sm">{p.name}</div>
                      </div>
                      <button
                        onClick={() => onRemove(p.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 mt-0.5"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price row */}
              <tr className="bg-foreground/5">
                <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-r border-border text-foreground">
                  Цена
                </td>
                {products.map(p => (
                  <td key={p.id} className="px-4 py-3 text-sm font-mono font-bold border-r border-border last:border-r-0">
                    {p.price.toLocaleString('ru-RU')} ₽
                  </td>
                ))}
              </tr>

              {/* Spec rows */}
              {allSpecKeys.map((key, idx) => (
                <tr key={key} className={idx % 2 === 0 ? 'bg-card' : 'bg-background'}>
                  <td className="px-4 py-3 text-xs text-muted-foreground border-r border-border">{key}</td>
                  {products.map(p => (
                    <td key={p.id} className="px-4 py-3 text-xs font-mono border-r border-border last:border-r-0">
                      {p.specs[key] ?? <span className="text-muted-foreground/30">—</span>}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Software row */}
              <tr className="bg-foreground/5">
                <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-r border-border">ПО</td>
                {products.map(p => (
                  <td key={p.id} className="px-4 py-3 border-r border-border last:border-r-0">
                    <div className="flex flex-wrap gap-1">
                      {p.software.map(sw => (
                        <span key={sw} className="text-[10px] font-mono px-1.5 py-0.5 bg-accent/10 text-accent border border-accent/20">
                          {sw}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Stock row */}
              <tr>
                <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-r border-border">Наличие</td>
                {products.map(p => (
                  <td key={p.id} className="px-4 py-3 border-r border-border last:border-r-0">
                    <span className={`text-xs font-medium ${
                      p.stock === 'in_stock' ? 'text-green-600' :
                      p.stock === 'order' ? 'text-amber-600' : 'text-red-500'
                    }`}>
                      {p.stock === 'in_stock' ? 'В наличии' : p.stock === 'order' ? 'Под заказ' : 'Нет'}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
