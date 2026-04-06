import { useState } from 'react';
import { useAIStore, type SavedConfig } from '@/store/ai';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

const MOCK_ORDERS = [
  { id: 'ORD-2024-001', date: '2024-11-14', total: 765000, status: 'delivered', items: ['ProStation X1 Ultra', 'Монитор UltraColor 32 Pro'] },
  { id: 'ORD-2024-002', date: '2024-12-03', total: 280000, status: 'delivered', items: ['ProStation CAD-7'] },
  { id: 'ORD-2025-001', date: '2025-02-18', total: 485000, status: 'processing', items: ['ProStation X1 Ultra'] },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  delivered: { label: 'Доставлен', color: 'bg-green-500/10 text-green-500' },
  processing: { label: 'В обработке', color: 'bg-yellow-500/10 text-yellow-500' },
  shipped: { label: 'Отправлен', color: 'bg-blue-500/10 text-blue-500' },
  cancelled: { label: 'Отменён', color: 'bg-red-500/10 text-red-500' },
};

function ConfigCard({ cfg, onReorder }: { cfg: SavedConfig; onReorder: (cfg: SavedConfig) => void }) {
  const { deleteConfig } = useAIStore();
  const allItems = [
    ...cfg.config.workstations,
    ...(cfg.config.nas ? [cfg.config.nas] : []),
    ...(cfg.config.server ? [cfg.config.server] : []),
    ...cfg.config.peripherals,
  ];

  return (
    <div className="border border-border rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold">{cfg.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {new Date(cfg.savedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div className="font-mono font-bold text-accent">{cfg.config.total.toLocaleString('ru-RU')} ₽</div>
      </div>

      <div className="text-xs text-muted-foreground italic mb-3 border-l-2 border-border pl-3">"{cfg.query}"</div>

      <div className="space-y-1 mb-4">
        {allItems.map((p) => (
          <div key={p.id} className="flex justify-between text-xs">
            <span className="text-foreground/80">{p.name}</span>
            <span className="font-mono text-muted-foreground">{p.price.toLocaleString('ru-RU')} ₽</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1 gap-1.5" onClick={() => onReorder(cfg)}>
          <Icon name="ShoppingCart" size={13} />
          Повторить заказ
        </Button>
        <Button size="sm" variant="outline" onClick={() => deleteConfig(cfg.id)}>
          <Icon name="Trash2" size={13} />
        </Button>
      </div>
    </div>
  );
}

export default function Account() {
  const { savedConfigs } = useAIStore();
  const addItem = useCartStore((s) => s.addItem);
  const [reorderDialog, setReorderDialog] = useState<SavedConfig | null>(null);
  const [reordered, setReordered] = useState(false);

  const handleReorder = (cfg: SavedConfig) => {
    setReorderDialog(cfg);
    setReordered(false);
  };

  const confirmReorder = () => {
    if (!reorderDialog) return;
    const allItems = [
      ...reorderDialog.config.workstations,
      ...(reorderDialog.config.nas ? [reorderDialog.config.nas] : []),
      ...(reorderDialog.config.server ? [reorderDialog.config.server] : []),
      ...reorderDialog.config.peripherals,
    ];
    allItems.forEach((p) => addItem(p));
    setReordered(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="User" size={20} className="text-accent" />
          <span className="font-mono font-semibold tracking-wider uppercase text-sm">Личный кабинет</span>
        </div>
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
          <Icon name="ArrowLeft" size={14} />
          На сайт
        </a>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* User card */}
        <div className="flex items-center gap-4 mb-8 p-5 border border-border rounded-lg bg-card">
          <div className="w-14 h-14 bg-accent/10 border border-accent/30 rounded-full flex items-center justify-center">
            <Icon name="User" size={24} className="text-accent" />
          </div>
          <div>
            <div className="font-semibold text-lg">Клиент TECHPRO</div>
            <div className="text-sm text-muted-foreground">client@techpro.ru</div>
          </div>
          <div className="ml-auto flex gap-6 text-center">
            <div>
              <div className="text-2xl font-bold font-mono">{MOCK_ORDERS.length}</div>
              <div className="text-xs text-muted-foreground">заказов</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">{savedConfigs.length}</div>
              <div className="text-xs text-muted-foreground">конфигураций</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="configs">
          <TabsList className="mb-6">
            <TabsTrigger value="configs" className="gap-2">
              <Icon name="Cpu" size={14} />
              Конфигурации ИИ ({savedConfigs.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Icon name="Package" size={14} />
              История заказов ({MOCK_ORDERS.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configs">
            {savedConfigs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Icon name="Cpu" size={40} className="mx-auto mb-4 opacity-30" />
                <p className="mb-2">Сохранённых конфигураций нет</p>
                <p className="text-sm">Используйте AI-конфигуратор и сохраняйте подходящие варианты</p>
                <div className="flex gap-3 justify-center mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/#configurator">Открыть конфигуратор</a>
                  </Button>
                  <Button size="sm" asChild>
                    <a href="/configurator">Пошаговый подбор</a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {savedConfigs.map((cfg) => (
                  <ConfigCard key={cfg.id} cfg={cfg} onReorder={handleReorder} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders">
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Номер заказа</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Дата</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Состав</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Сумма</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Статус</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ORDERS.map((order, i) => (
                    <tr key={order.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                      <td className="px-4 py-3 font-mono text-xs font-medium">{order.id}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(order.date).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          {order.items.map((item) => (
                            <div key={item} className="text-xs text-muted-foreground">{item}</div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold">{order.total.toLocaleString('ru-RU')} ₽</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_MAP[order.status].color}`}>
                          {STATUS_MAP[order.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" className="text-xs gap-1">
                          <Icon name="RefreshCw" size={12} />
                          Повторить
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reorder dialog */}
      <Dialog open={!!reorderDialog} onOpenChange={(v) => !v && setReorderDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Повторить заказ?</DialogTitle>
          </DialogHeader>
          {!reordered ? (
            <>
              <p className="text-sm text-muted-foreground">
                Конфигурация <strong>«{reorderDialog?.name}»</strong> на сумму{' '}
                <strong>{reorderDialog?.config.total.toLocaleString('ru-RU')} ₽</strong> будет добавлена в корзину.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReorderDialog(null)}>Отмена</Button>
                <Button onClick={confirmReorder} className="gap-2">
                  <Icon name="ShoppingCart" size={14} />
                  Добавить в корзину
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="text-center py-4">
              <Icon name="CheckCircle" size={40} className="mx-auto mb-3 text-green-500" />
              <p className="font-semibold mb-1">Добавлено в корзину!</p>
              <p className="text-sm text-muted-foreground mb-4">Перейдите на сайт для оформления заказа</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => setReorderDialog(null)}>Закрыть</Button>
                <Button size="sm" asChild>
                  <a href="/#cart">В корзину</a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
