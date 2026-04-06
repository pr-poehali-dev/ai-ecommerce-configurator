import { useState } from 'react';
import { PRODUCTS, SOFTWARE_COMPATIBILITY } from '@/data/products';
import { useAIStore, type AIConfig } from '@/store/ai';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

const SOFTWARE_LIST = Object.keys(SOFTWARE_COMPATIBILITY);

const STEPS = [
  { id: 1, label: 'ПО', icon: 'Monitor' },
  { id: 2, label: 'Бюджет', icon: 'Wallet' },
  { id: 3, label: 'Команда', icon: 'Users' },
  { id: 4, label: 'Результат', icon: 'Cpu' },
] as const;

function generateConfig(software: string[], budget: number, users: number): AIConfig {
  const hasBlender = software.includes('Blender');
  const hasSolidworks = software.includes('SolidWorks');
  const hasDavinci = software.includes('DaVinci Resolve');
  const hasAutoCAD = software.includes('AutoCAD');
  const hasPhotoshop = software.includes('Photoshop');
  const hasAfterEffects = software.includes('After Effects');

  let workstationId = 'ws-003';
  let explanation = '';

  if (hasBlender || hasDavinci) {
    workstationId = budget / users >= 400000 ? 'ws-001' : 'ws-003';
    explanation = `Для ${[hasBlender && 'Blender', hasDavinci && 'DaVinci Resolve'].filter(Boolean).join(' и ')} критически важен мощный GPU. ${SOFTWARE_COMPATIBILITY[hasBlender ? 'Blender' : 'DaVinci Resolve'].note}`;
  } else if (hasSolidworks || hasAutoCAD) {
    workstationId = 'ws-002';
    explanation = `Для инженерного ПО важны сертифицированный GPU и высокая тактовая частота CPU. ${SOFTWARE_COMPATIBILITY[hasSolidworks ? 'SolidWorks' : 'AutoCAD'].note}`;
  } else if (hasAfterEffects || hasPhotoshop) {
    workstationId = budget / users >= 200000 ? 'ws-002' : 'ws-003';
    explanation = `Для творческих задач приоритет — объём RAM и CPU. ${SOFTWARE_COMPATIBILITY[hasAfterEffects ? 'After Effects' : 'Photoshop'].note}`;
  } else {
    workstationId = budget / users >= 300000 ? 'ws-002' : 'ws-003';
    explanation = 'На основе бюджета и количества пользователей подобрана оптимальная конфигурация.';
  }

  const ws = PRODUCTS.find((p) => p.id === workstationId)!;
  const workstations = Array.from({ length: Math.min(users, 4) }, () => ws);

  const needsNas = users >= 2 || hasBlender || hasDavinci;
  const nas = needsNas
    ? PRODUCTS.find((p) => p.id === (users >= 4 ? 'nas-001' : 'nas-002')) ?? null
    : null;

  const needsServer = users > 3 && hasBlender;
  const server = needsServer ? PRODUCTS.find((p) => p.id === 'srv-001') ?? null : null;

  const peripherals = [];
  if (hasDavinci || hasBlender) {
    const monitor = PRODUCTS.find((p) => p.id === 'per-002');
    if (monitor) peripherals.push(...Array.from({ length: Math.min(users, 2) }, () => monitor));
  }

  const total =
    workstations.reduce((s, p) => s + p.price, 0) +
    (nas?.price ?? 0) +
    (server?.price ?? 0) +
    peripherals.reduce((s, p) => s + p.price, 0);

  return { workstations, nas, server, peripherals, explanation, total };
}

export default function Configurator() {
  const [step, setStep] = useState(1);
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [budget, setBudget] = useState(500000);
  const [users, setUsers] = useState(1);
  const [result, setResult] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveDialog, setSaveDialog] = useState(false);
  const [configName, setConfigName] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  const { saveConfig, addLog } = useAIStore();
  const addItem = useCartStore((s) => s.addItem);

  const toggleSoftware = (sw: string) => {
    setSelectedSoftware((prev) =>
      prev.includes(sw) ? prev.filter((s) => s !== sw) : [...prev, sw]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 1400));
    const config = generateConfig(selectedSoftware, budget, users);
    const ms = Date.now() - start;
    setResult(config);
    setStep(4);
    setLoading(false);

    addLog({
      query: `ПО: ${selectedSoftware.join(', ')} | Бюджет: ${budget.toLocaleString('ru-RU')} ₽ | Пользователей: ${users}`,
      responseMs: ms,
      total: config.total,
      itemCount: config.workstations.length + (config.nas ? 1 : 0) + (config.server ? 1 : 0) + config.peripherals.length,
    });
  };

  const handleAddToCart = () => {
    if (!result) return;
    [...result.workstations, ...(result.nas ? [result.nas] : []), ...(result.server ? [result.server] : []), ...result.peripherals].forEach((p) => addItem(p));
    setAddedToCart(true);
  };

  const handleSave = () => {
    if (!result || !configName.trim()) return;
    const query = `ПО: ${selectedSoftware.join(', ')} | Бюджет: ${budget.toLocaleString('ru-RU')} ₽ | Пользователей: ${users}`;
    saveConfig(configName.trim(), query, result);
    setSaveDialog(false);
    setConfigName('');
  };

  const allItems = result
    ? [...result.workstations, ...(result.nas ? [result.nas] : []), ...(result.server ? [result.server] : []), ...result.peripherals]
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="Cpu" size={20} className="text-accent" />
          <span className="font-mono font-semibold tracking-wider uppercase text-sm">Конструктор конфигурации</span>
        </div>
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
          <Icon name="ArrowLeft" size={14} />
          На сайт
        </a>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                step === s.id ? 'bg-accent text-white' :
                step > s.id ? 'bg-accent/20 text-accent' :
                'bg-muted text-muted-foreground'
              }`}>
                {step > s.id ? <Icon name="Check" size={14} /> : s.id}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step === s.id ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${step > s.id ? 'bg-accent/40' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Software */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Какое ПО используете?</h2>
            <p className="text-muted-foreground text-sm mb-6">Выберите одну или несколько программ — это основа для подбора оборудования.</p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {SOFTWARE_LIST.map((sw) => {
                const active = selectedSoftware.includes(sw);
                return (
                  <button
                    key={sw}
                    onClick={() => toggleSoftware(sw)}
                    className={`flex items-center gap-3 p-4 border rounded-lg text-left transition-all ${
                      active ? 'border-accent bg-accent/5 text-foreground' : 'border-border bg-card text-muted-foreground hover:border-foreground/30'
                    }`}
                  >
                    <div className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 ${active ? 'border-accent bg-accent' : 'border-muted-foreground'}`}>
                      {active && <Icon name="Check" size={10} className="text-white" />}
                    </div>
                    <span className="font-medium text-sm">{sw}</span>
                  </button>
                );
              })}
            </div>

            <Button
              className="w-full"
              disabled={selectedSoftware.length === 0}
              onClick={() => setStep(2)}
            >
              Далее — Бюджет
              <Icon name="ArrowRight" size={15} className="ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Budget */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Бюджет на оснащение</h2>
            <p className="text-muted-foreground text-sm mb-8">Укажите общий бюджет на всё оборудование. Распределим его оптимально.</p>

            <div className="mb-8">
              <div className="flex justify-between items-baseline mb-4">
                <Label className="text-sm text-muted-foreground">Бюджет</Label>
                <span className="text-3xl font-bold font-mono">{budget.toLocaleString('ru-RU')} ₽</span>
              </div>
              <Slider
                min={100000}
                max={5000000}
                step={50000}
                value={[budget]}
                onValueChange={([v]) => setBudget(v)}
                className="mb-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>100 000 ₽</span>
                <span>5 000 000 ₽</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-8">
              {[300000, 700000, 1500000].map((b) => (
                <button
                  key={b}
                  onClick={() => setBudget(b)}
                  className={`py-2 px-3 text-xs border rounded transition-colors ${budget === b ? 'border-accent bg-accent/5 text-foreground' : 'border-border text-muted-foreground hover:border-foreground/30'}`}
                >
                  {(b / 1000).toFixed(0)}K ₽
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                <Icon name="ArrowLeft" size={15} className="mr-2" />
                Назад
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Далее — Команда
                <Icon name="ArrowRight" size={15} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Users */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Сколько пользователей?</h2>
            <p className="text-muted-foreground text-sm mb-8">Количество рабочих мест влияет на выбор NAS и сетевой инфраструктуры.</p>

            <div className="mb-8">
              <div className="flex justify-between items-baseline mb-4">
                <Label className="text-sm text-muted-foreground">Рабочих мест</Label>
                <span className="text-3xl font-bold font-mono">{users}</span>
              </div>
              <Slider
                min={1}
                max={20}
                step={1}
                value={[users]}
                onValueChange={([v]) => setUsers(v)}
                className="mb-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 человек</span>
                <span>20 человек</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 mb-8 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon name="Info" size={14} className="text-accent flex-shrink-0" />
                {users === 1 && 'Для одного пользователя — рабочая станция без NAS.'}
                {users >= 2 && users <= 3 && 'Для малой команды рекомендуем добавить компактный NAS для общего хранилища.'}
                {users >= 4 && 'Для крупной команды — профессиональный NAS с 10GbE и возможно файловый сервер.'}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>
                <Icon name="ArrowLeft" size={15} className="mr-2" />
                Назад
              </Button>
              <Button className="flex-1" onClick={handleGenerate} disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="Loader2" size={15} className="mr-2 animate-spin" />
                    Анализирую...
                  </>
                ) : (
                  <>
                    <Icon name="Sparkles" size={15} className="mr-2" />
                    Подобрать конфигурацию
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && result && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Icon name="CheckCircle" size={20} className="text-green-500" />
              <h2 className="text-2xl font-bold">Конфигурация готова</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-6">Подобрано на основе: {selectedSoftware.join(', ')} · {budget.toLocaleString('ru-RU')} ₽ · {users} {users === 1 ? 'пользователь' : 'пользователей'}</p>

            {/* Explanation */}
            <div className="bg-card border border-border rounded-lg p-4 mb-5 text-sm leading-relaxed text-muted-foreground">
              <div className="flex items-start gap-2">
                <Icon name="Sparkles" size={14} className="text-accent mt-0.5 flex-shrink-0" />
                {result.explanation}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-5">
              {allItems.map((p, i) => (
                <div key={`${p.id}-${i}`} className="flex justify-between items-center py-2.5 px-4 border border-border rounded-lg bg-card">
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{p.category}</div>
                  </div>
                  <div className="font-mono font-semibold">{p.price.toLocaleString('ru-RU')} ₽</div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-3 px-4 bg-accent/5 border border-accent/20 rounded-lg mb-6">
              <span className="font-semibold">Итого</span>
              <span className="text-xl font-bold font-mono text-accent">{result.total.toLocaleString('ru-RU')} ₽</span>
            </div>

            <div className="flex flex-col gap-3">
              {!addedToCart ? (
                <Button className="w-full gap-2" onClick={handleAddToCart}>
                  <Icon name="ShoppingCart" size={15} />
                  Добавить в корзину
                </Button>
              ) : (
                <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" asChild>
                  <a href="/#cart">
                    <Icon name="CheckCircle" size={15} />
                    Добавлено — перейти в корзину
                  </a>
                </Button>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setSaveDialog(true)}>
                  <Icon name="BookmarkPlus" size={14} />
                  Сохранить в кабинете
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => { setStep(1); setResult(null); setAddedToCart(false); setSelectedSoftware([]); }}>
                  <Icon name="RefreshCw" size={14} />
                  Новый подбор
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save dialog */}
      <Dialog open={saveDialog} onOpenChange={setSaveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Сохранить конфигурацию</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label>Название конфигурации</Label>
            <Input
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Например: Команда дизайнеров 4 чел."
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialog(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={!configName.trim()}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
