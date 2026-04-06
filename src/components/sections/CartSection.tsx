import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useCartStore } from '@/store/cart';

export default function CartSection() {
  const { items, removeItem, updateQty, total, clearCart } = useCartStore();
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', comment: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      clearCart();
      setForm({ name: '', company: '', phone: '', email: '', comment: '' });
    }, 4000);
  };

  if (items.length === 0 && !submitted) {
    return (
      <section className="py-16 bg-background border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="section-label mb-2">Заказ</div>
          <h2 className="text-3xl font-bold mb-10">Корзина</h2>
          <div className="border border-dashed border-border p-16 text-center">
            <Icon name="ShoppingCart" size={40} className="text-border mx-auto mb-4" />
            <div className="text-muted-foreground text-sm">Корзина пуста. Добавьте товары из каталога.</div>
          </div>
        </div>
      </section>
    );
  }

  if (submitted) {
    return (
      <section className="py-16 bg-background border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="border border-green-200 bg-green-50 p-10 text-center max-w-lg mx-auto">
            <Icon name="CheckCircle" size={40} className="text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Заявка отправлена!</h3>
            <p className="text-sm text-muted-foreground">
              Наш менеджер свяжется с вами в течение 2 рабочих часов для уточнения деталей и выставления счёта.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background border-t border-border">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="section-label mb-2">Заказ</div>
        <h2 className="text-3xl font-bold mb-10">Корзина</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="border border-border">
              <div className="grid grid-cols-12 table-header border-b border-border">
                <div className="col-span-6">Товар</div>
                <div className="col-span-2 text-center">Кол-во</div>
                <div className="col-span-3 text-right">Сумма</div>
                <div className="col-span-1" />
              </div>
              {items.map(({ product, qty }) => (
                <div key={product.id} className="grid grid-cols-12 items-center px-4 py-4 border-b border-border last:border-b-0 gap-2">
                  <div className="col-span-6">
                    <div className="font-semibold text-sm">{product.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                      {product.price.toLocaleString('ru-RU')} ₽ / шт.
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-1">
                    <button
                      onClick={() => updateQty(product.id, qty - 1)}
                      className="w-6 h-6 border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                    >
                      <Icon name="Minus" size={11} />
                    </button>
                    <span className="w-8 text-center text-sm font-mono">{qty}</span>
                    <button
                      onClick={() => updateQty(product.id, qty + 1)}
                      className="w-6 h-6 border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                    >
                      <Icon name="Plus" size={11} />
                    </button>
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-sm">
                    {(product.price * qty).toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="px-4 py-4 bg-secondary flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider">Итого</span>
                <span className="text-xl font-bold font-mono">{total().toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>

          {/* Order form */}
          <div>
            <div className="border border-border bg-card p-6">
              <div className="text-sm font-semibold uppercase tracking-wider mb-5 pb-4 border-b border-border">
                Оформление заявки
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {([
                  ['name', 'Контактное лицо', 'text', true],
                  ['company', 'Компания', 'text', true],
                  ['phone', 'Телефон', 'tel', true],
                  ['email', 'Email', 'email', true],
                ] as const).map(([field, label, type, required]) => (
                  <div key={field}>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
                      {label} {required && <span className="text-accent">*</span>}
                    </label>
                    <input
                      type={type}
                      required={required}
                      value={form[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
                    Комментарий
                  </label>
                  <textarea
                    value={form.comment}
                    onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                    rows={3}
                    className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground transition-colors resize-none"
                    placeholder="Дополнительные требования..."
                  />
                </div>
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  После отправки заявки менеджер свяжется для согласования условий поставки и выставления счёта.
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Icon name="Send" size={15} />
                  Отправить заявку
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
