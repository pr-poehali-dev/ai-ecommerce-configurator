import { useState } from 'react';
import { useAdminStore, type CompatEntry } from '@/store/admin';
import type { Product, Category } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

const STOCK_LABELS: Record<string, string> = {
  in_stock: 'В наличии',
  order: 'Под заказ',
  out: 'Нет в наличии',
};

const CATEGORY_LABELS: Record<string, string> = {
  workstation: 'Рабочие станции',
  laptop: 'Ноутбуки',
  nas: 'NAS-хранилища',
  server: 'Серверы',
  peripheral: 'Периферия',
};

const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  name: '',
  category: 'workstation',
  price: 0,
  badge: '',
  shortDesc: '',
  specs: {},
  software: [],
  stock: 'in_stock',
};

const EMPTY_COMPAT: CompatEntry = {
  cpu: '',
  gpu: '',
  ram: '',
  nas: false,
  server: false,
  note: '',
};

function generateId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
}

export default function Admin() {
  const { products, compatibility, addProduct, updateProduct, deleteProduct, addSoftware, updateSoftware, deleteSoftware } = useAdminStore();

  const [productDialog, setProductDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; id?: string; data: Omit<Product, 'id'> }>({
    open: false, mode: 'add', data: { ...EMPTY_PRODUCT },
  });

  const [compatDialog, setCompatDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; name: string; data: CompatEntry }>({
    open: false, mode: 'add', name: '', data: { ...EMPTY_COMPAT },
  });

  const [specsRaw, setSpecsRaw] = useState('');
  const [softwareRaw, setSoftwareRaw] = useState('');
  const [compatNameInput, setCompatNameInput] = useState('');

  const openAddProduct = () => {
    setProductDialog({ open: true, mode: 'add', data: { ...EMPTY_PRODUCT } });
    setSpecsRaw('');
    setSoftwareRaw('');
  };

  const openEditProduct = (p: Product) => {
    setProductDialog({ open: true, mode: 'edit', id: p.id, data: { ...p } });
    setSpecsRaw(Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join('\n'));
    setSoftwareRaw(p.software.join(', '));
  };

  const parseSpecs = (raw: string): Record<string, string> => {
    const result: Record<string, string> = {};
    raw.split('\n').forEach((line) => {
      const idx = line.indexOf(':');
      if (idx > 0) {
        result[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
    });
    return result;
  };

  const saveProduct = () => {
    const specs = parseSpecs(specsRaw);
    const software = softwareRaw.split(',').map((s) => s.trim()).filter(Boolean);
    const data = { ...productDialog.data, specs, software, badge: productDialog.data.badge || undefined };

    if (productDialog.mode === 'add') {
      addProduct({ ...data, id: generateId(data.name) });
    } else if (productDialog.id) {
      updateProduct(productDialog.id, data);
    }
    setProductDialog((s) => ({ ...s, open: false }));
  };

  const openAddCompat = () => {
    setCompatDialog({ open: true, mode: 'add', name: '', data: { ...EMPTY_COMPAT } });
    setCompatNameInput('');
  };

  const openEditCompat = (name: string) => {
    setCompatDialog({ open: true, mode: 'edit', name, data: { ...compatibility[name] } });
    setCompatNameInput(name);
  };

  const saveCompat = () => {
    const name = compatNameInput.trim();
    if (!name) return;
    if (compatDialog.mode === 'add') {
      addSoftware(name, compatDialog.data);
    } else {
      if (compatDialog.name !== name) {
        deleteSoftware(compatDialog.name);
        addSoftware(name, compatDialog.data);
      } else {
        updateSoftware(name, compatDialog.data);
      }
    }
    setCompatDialog((s) => ({ ...s, open: false }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="Settings" size={20} className="text-accent" />
          <span className="font-mono font-semibold tracking-wider uppercase text-sm">Админ-панель</span>
        </div>
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
          <Icon name="ArrowLeft" size={14} />
          На сайт
        </a>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products" className="gap-2">
              <Icon name="Package" size={14} />
              Товары ({products.length})
            </TabsTrigger>
            <TabsTrigger value="compatibility" className="gap-2">
              <Icon name="CheckSquare" size={14} />
              Совместимость ПО ({Object.keys(compatibility).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Каталог товаров</h2>
              <Button size="sm" onClick={openAddProduct} className="gap-2">
                <Icon name="Plus" size={14} />
                Добавить товар
              </Button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Название</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Категория</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Цена</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Статус</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Бейдж</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{CATEGORY_LABELS[p.category]}</td>
                      <td className="px-4 py-3 font-mono">{p.price.toLocaleString('ru-RU')} ₽</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          p.stock === 'in_stock' ? 'bg-green-500/10 text-green-500' :
                          p.stock === 'order' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {STOCK_LABELS[p.stock]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.badge && <Badge variant="outline" className="text-xs">{p.badge}</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => openEditProduct(p)}>
                            <Icon name="Pencil" size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => deleteProduct(p.id)}>
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="compatibility">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Матрица совместимости ПО</h2>
              <Button size="sm" onClick={openAddCompat} className="gap-2">
                <Icon name="Plus" size={14} />
                Добавить ПО
              </Button>
            </div>

            <div className="grid gap-3">
              {Object.entries(compatibility).map(([name, entry]) => (
                <div key={name} className="border border-border rounded-lg px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{name}</span>
                      <div className="flex gap-1">
                        {entry.nas && <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded">NAS</span>}
                        {entry.server && <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded">Сервер</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                      <span><span className="text-foreground/60">CPU:</span> {entry.cpu}</span>
                      <span><span className="text-foreground/60">GPU:</span> {entry.gpu}</span>
                      <span><span className="text-foreground/60">RAM:</span> {entry.ram}</span>
                    </div>
                    {entry.note && <p className="text-xs text-muted-foreground mt-2 italic">{entry.note}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEditCompat(name)}>
                      <Icon name="Pencil" size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => deleteSoftware(name)}>
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Dialog */}
      <Dialog open={productDialog.open} onOpenChange={(v) => setProductDialog((s) => ({ ...s, open: v }))}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{productDialog.mode === 'add' ? 'Новый товар' : 'Редактировать товар'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Название</Label>
              <Input value={productDialog.data.name} onChange={(e) => setProductDialog((s) => ({ ...s, data: { ...s.data, name: e.target.value } }))} placeholder="ProStation X1 Ultra" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Категория</Label>
                <Select value={productDialog.data.category} onValueChange={(v) => setProductDialog((s) => ({ ...s, data: { ...s.data, category: v as Category } }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label>Статус наличия</Label>
                <Select value={productDialog.data.stock} onValueChange={(v) => setProductDialog((s) => ({ ...s, data: { ...s.data, stock: v as Product['stock'] } }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STOCK_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Цена (₽)</Label>
                <Input type="number" value={productDialog.data.price} onChange={(e) => setProductDialog((s) => ({ ...s, data: { ...s.data, price: Number(e.target.value) } }))} placeholder="150000" />
              </div>
              <div className="grid gap-1.5">
                <Label>Бейдж (необязательно)</Label>
                <Input value={productDialog.data.badge || ''} onChange={(e) => setProductDialog((s) => ({ ...s, data: { ...s.data, badge: e.target.value } }))} placeholder="Новинка" />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Краткое описание</Label>
              <Input value={productDialog.data.shortDesc} onChange={(e) => setProductDialog((s) => ({ ...s, data: { ...s.data, shortDesc: e.target.value } }))} placeholder="Флагманская рабочая станция..." />
            </div>

            <div className="grid gap-1.5">
              <Label>Характеристики <span className="text-muted-foreground font-normal">(по одной на строку: Ключ: Значение)</span></Label>
              <Textarea
                value={specsRaw}
                onChange={(e) => setSpecsRaw(e.target.value)}
                rows={5}
                placeholder={"Процессор: Intel Core i9\nОЗУ: 64 GB DDR5\nGPU: RTX 4090"}
                className="font-mono text-xs"
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Совместимое ПО <span className="text-muted-foreground font-normal">(через запятую)</span></Label>
              <Input value={softwareRaw} onChange={(e) => setSoftwareRaw(e.target.value)} placeholder="Blender, AutoCAD, Photoshop" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialog((s) => ({ ...s, open: false }))}>Отмена</Button>
            <Button onClick={saveProduct} disabled={!productDialog.data.name}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compat Dialog */}
      <Dialog open={compatDialog.open} onOpenChange={(v) => setCompatDialog((s) => ({ ...s, open: v }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{compatDialog.mode === 'add' ? 'Новое ПО' : 'Редактировать ПО'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Название программы</Label>
              <Input value={compatNameInput} onChange={(e) => setCompatNameInput(e.target.value)} placeholder="Blender" />
            </div>

            <div className="grid gap-1.5">
              <Label>Рекомендуемый CPU</Label>
              <Input value={compatDialog.data.cpu} onChange={(e) => setCompatDialog((s) => ({ ...s, data: { ...s.data, cpu: e.target.value } }))} placeholder="AMD Threadripper PRO / EPYC" />
            </div>

            <div className="grid gap-1.5">
              <Label>Рекомендуемый GPU</Label>
              <Input value={compatDialog.data.gpu} onChange={(e) => setCompatDialog((s) => ({ ...s, data: { ...s.data, gpu: e.target.value } }))} placeholder="NVIDIA RTX 4080+ (CUDA)" />
            </div>

            <div className="grid gap-1.5">
              <Label>Минимум RAM</Label>
              <Input value={compatDialog.data.ram} onChange={(e) => setCompatDialog((s) => ({ ...s, data: { ...s.data, ram: e.target.value } }))} placeholder="от 64 GB ECC" />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={compatDialog.data.nas} onCheckedChange={(v) => setCompatDialog((s) => ({ ...s, data: { ...s.data, nas: v } }))} />
                <Label>Поддержка NAS</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={compatDialog.data.server} onCheckedChange={(v) => setCompatDialog((s) => ({ ...s, data: { ...s.data, server: v } }))} />
                <Label>Поддержка сервера</Label>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Примечание</Label>
              <Textarea value={compatDialog.data.note} onChange={(e) => setCompatDialog((s) => ({ ...s, data: { ...s.data, note: e.target.value } }))} rows={2} placeholder="GPU-рендеринг критичен. Рекомендуем максимум VRAM." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCompatDialog((s) => ({ ...s, open: false }))}>Отмена</Button>
            <Button onClick={saveCompat} disabled={!compatNameInput.trim()}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
