import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { PRODUCTS, SOFTWARE_COMPATIBILITY } from '@/data/products';
import { useCartStore } from '@/store/cart';
import { useAIStore } from '@/store/ai';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'ai' | 'system';
  text: string;
  config?: AIConfig;
}

interface AIConfig {
  workstations: typeof PRODUCTS;
  nas?: (typeof PRODUCTS)[0] | null;
  server?: (typeof PRODUCTS)[0] | null;
  peripherals: typeof PRODUCTS;
  explanation: string;
  total: number;
}

const SUGGESTIONS = [
  '3D-анимация в Blender, команда 4 человека, бюджет 2 млн',
  'Архитектурное бюро, AutoCAD + Revit, 8 рабочих мест',
  'Видеопроизводство DaVinci Resolve, 1 монтажёр, бюджет 500К',
  'SolidWorks для машиностроения, 2 инженера',
];

function generateConfig(userText: string): AIConfig {
  const lower = userText.toLowerCase();

  const hasBlender = lower.includes('blender') || lower.includes('3d') || lower.includes('рендер');
  const hasSolidworks = lower.includes('solidworks') || lower.includes('сапр') || lower.includes('машиностроен');
  const hasDavinci = lower.includes('davinci') || lower.includes('монтаж') || lower.includes('видео');
  const hasAutoCAD = lower.includes('autocad') || lower.includes('архитект') || lower.includes('autocad');
  const hasPhotoshop = lower.includes('photoshop') || lower.includes('дизайн');

  const budgetMatch = lower.match(/(\d[\d\s]*)(к|тыс|млн|000)/);
  let budget = 500000;
  if (budgetMatch) {
    const num = parseInt(budgetMatch[1].replace(/\s/g, ''));
    budget = lower.includes('млн') ? num * 1000000 : num > 1000 ? num : num * 1000;
  }

  const teamMatch = lower.match(/(\d+)\s*(человек|места|польз|рабоч)/);
  const teamSize = teamMatch ? parseInt(teamMatch[1]) : 1;

  let workstations = [];
  let explanation = '';

  if (hasBlender || hasDavinci) {
    if (budget >= 400000) {
      workstations = PRODUCTS.filter(p => p.id === 'ws-001').slice(0, Math.min(teamSize, 3));
    } else {
      workstations = PRODUCTS.filter(p => p.id === 'ws-003');
    }
    explanation = `Для задач ${hasBlender ? 'Blender (GPU-рендеринг)' : 'DaVinci Resolve (видеомонтаж)'} критически важен мощный GPU. ${SOFTWARE_COMPATIBILITY[hasBlender ? 'Blender' : 'DaVinci Resolve'].note}`;
  } else if (hasSolidworks || hasAutoCAD) {
    workstations = PRODUCTS.filter(p => p.id === 'ws-002').slice(0, Math.min(teamSize, 3));
    explanation = `Для инженерного ПО важна тактовая частота CPU и сертифицированный GPU. ${SOFTWARE_COMPATIBILITY[hasSolidworks ? 'SolidWorks' : 'AutoCAD'].note}`;
  } else if (hasPhotoshop) {
    workstations = PRODUCTS.filter(p => p.id === 'ws-003');
    explanation = `Для графического дизайна рекомендуем сбалансированную конфигурацию. ${SOFTWARE_COMPATIBILITY['Photoshop'].note}`;
  } else {
    workstations = budget >= 300000
      ? PRODUCTS.filter(p => p.id === 'ws-002')
      : PRODUCTS.filter(p => p.id === 'ws-003');
    explanation = 'На основе вашего бюджета подобрана оптимальная конфигурация рабочей станции.';
  }

  const needsNas = teamSize >= 2 || hasBlender || hasDavinci;
  const nas = needsNas
    ? PRODUCTS.find(p => p.id === (teamSize >= 4 ? 'nas-001' : 'nas-002')) ?? null
    : null;

  const needsServer = teamSize > 3;
  const server = needsServer
    ? PRODUCTS.find(p => p.id === (hasBlender ? 'srv-001' : 'srv-002')) ?? null
    : null;

  const peripherals = [];
  if (hasDavinci || hasBlender) {
    const monitor = PRODUCTS.find(p => p.id === 'per-002');
    if (monitor) peripherals.push(monitor);
  }

  const total =
    workstations.reduce((s, p) => s + p.price, 0) +
    (nas?.price ?? 0) +
    (server?.price ?? 0) +
    peripherals.reduce((s, p) => s + p.price, 0);

  return { workstations, nas, server, peripherals, explanation, total };
}

export default function AIConfiguratorSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'ai',
      text: 'Здравствуйте! Я AI-конфигуратор TECHPRO. Опишите ваши задачи, используемое ПО, количество пользователей и бюджет — подберу оптимальное оборудование с обоснованием.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore(s => s.addItem);
  const [addedAll, setAddedAll] = useState<string | null>(null);
  const { saveConfig, addLog } = useAIStore();
  const [saveDialog, setSaveDialog] = useState<{ open: boolean; msgId: string; config: AIConfig | null; query: string }>({
    open: false, msgId: '', config: null, query: '',
  });
  const [configName, setConfigName] = useState('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const start = Date.now();
    await new Promise(r => setTimeout(r, 1200));

    const config = generateConfig(text);
    const ms = Date.now() - start;
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      text: `Анализ завершён. На основе ваших задач подобрана конфигурация на сумму **${config.total.toLocaleString('ru-RU')} ₽**.`,
      config,
    };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);

    addLog({
      query: text,
      responseMs: ms,
      total: config.total,
      itemCount: config.workstations.length + (config.nas ? 1 : 0) + (config.server ? 1 : 0) + config.peripherals.length,
    });
  };

  const handleAddAll = (config: AIConfig, msgId: string) => {
    config.workstations.forEach(p => addItem(p));
    if (config.nas) addItem(config.nas);
    if (config.server) addItem(config.server);
    config.peripherals.forEach(p => addItem(p));
    setAddedAll(msgId);
    setTimeout(() => setAddedAll(null), 2000);
  };

  const handleSaveConfig = () => {
    if (!saveDialog.config || !configName.trim()) return;
    saveConfig(configName.trim(), saveDialog.query, saveDialog.config);
    setSaveDialog(s => ({ ...s, open: false }));
    setConfigName('');
  };

  return (
    <>
    <section className="py-16 bg-secondary border-t border-border">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left: Info */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="section-label mb-3">Интеллектуальный подбор</div>
            <h2 className="text-3xl font-bold mb-4">AI Конфигуратор</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Опишите задачи в свободной форме — система проанализирует требования и подберёт рабочие станции, NAS и серверы с обоснованием каждого выбора.
            </p>

            {/* Matrix info */}
            <div className="border border-border bg-card p-4 mb-6">
              <div className="text-xs font-semibold uppercase tracking-wider mb-3">Матрица совместимости</div>
              <div className="space-y-2">
                {Object.keys(SOFTWARE_COMPATIBILITY).map(sw => (
                  <div key={sw} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 bg-accent flex-shrink-0" />
                    <span className="font-mono">{sw}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="section-label mb-3">Примеры запросов</div>
            <div className="space-y-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left text-xs text-muted-foreground border border-border bg-card p-3 hover:border-foreground hover:text-foreground transition-colors leading-relaxed"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>

          {/* Right: Chat */}
          <div className="flex-1 flex flex-col">
            <div className="bg-card border border-border flex flex-col" style={{ height: '600px' }}>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-[#000000]">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-xs font-mono font-medium text-white uppercase tracking-wider">TECHPRO AI / Конфигуратор</span>
                <div className="ml-auto flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                      <div className="space-y-3 max-w-full">
                        {/* AI text */}
                        <div className="chat-bubble-ai">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="Sparkles" size={12} className="text-accent" />
                            <span className="text-[10px] font-mono uppercase tracking-wider text-accent">TECHPRO AI</span>
                          </div>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>

                        {/* Config result */}
                        {msg.config && (
                          <div className="border border-border bg-background p-4 space-y-4 w-full">
                            <div className="text-xs font-semibold uppercase tracking-wider border-b border-border pb-2">
                              Рекомендованная конфигурация
                            </div>

                            {/* Explanation */}
                            <div className="text-xs text-muted-foreground bg-accent/5 border border-accent/20 p-3 leading-relaxed">
                              <Icon name="Info" size={12} className="inline mr-1 text-accent" />
                              {msg.config.explanation}
                            </div>

                            {/* Workstations */}
                            {msg.config.workstations.length > 0 && (
                              <div>
                                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                                  Рабочие станции × {msg.config.workstations.length}
                                </div>
                                {msg.config.workstations.slice(0, 1).map(p => (
                                  <div key={p.id} className="flex items-center justify-between border border-border p-3">
                                    <div>
                                      <div className="text-sm font-semibold">{p.name}</div>
                                      <div className="text-xs text-muted-foreground">{p.shortDesc}</div>
                                    </div>
                                    <div className="text-sm font-mono font-bold">
                                      {(p.price * msg.config!.workstations.length).toLocaleString('ru-RU')} ₽
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* NAS */}
                            {msg.config.nas && (
                              <div>
                                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">NAS-хранилище</div>
                                <div className="flex items-center justify-between border border-border p-3">
                                  <div>
                                    <div className="text-sm font-semibold">{msg.config.nas.name}</div>
                                    <div className="text-xs text-muted-foreground">{msg.config.nas.shortDesc}</div>
                                  </div>
                                  <div className="text-sm font-mono font-bold">{msg.config.nas.price.toLocaleString('ru-RU')} ₽</div>
                                </div>
                              </div>
                            )}

                            {/* Server */}
                            {msg.config.server && (
                              <div>
                                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Сервер</div>
                                <div className="flex items-center justify-between border border-border p-3">
                                  <div>
                                    <div className="text-sm font-semibold">{msg.config.server.name}</div>
                                    <div className="text-xs text-muted-foreground">{msg.config.server.shortDesc}</div>
                                  </div>
                                  <div className="text-sm font-mono font-bold">{msg.config.server.price.toLocaleString('ru-RU')} ₽</div>
                                </div>
                              </div>
                            )}

                            {/* Peripherals */}
                            {msg.config.peripherals.length > 0 && (
                              <div>
                                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Периферия</div>
                                {msg.config.peripherals.map(p => (
                                  <div key={p.id} className="flex items-center justify-between border border-border p-3">
                                    <div>
                                      <div className="text-sm font-semibold">{p.name}</div>
                                      <div className="text-xs text-muted-foreground">{p.shortDesc}</div>
                                    </div>
                                    <div className="text-sm font-mono font-bold">{p.price.toLocaleString('ru-RU')} ₽</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Total + Add all */}
                            <div className="pt-2 border-t border-border space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs text-muted-foreground">Итого конфигурация</div>
                                  <div className="text-xl font-bold font-mono">
                                    {msg.config.total.toLocaleString('ru-RU')} ₽
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleAddAll(msg.config!, msg.id)}
                                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                                    addedAll === msg.id
                                      ? 'bg-green-600 text-white'
                                      : 'btn-accent'
                                  }`}
                                >
                                  <Icon name={addedAll === msg.id ? 'Check' : 'ShoppingCart'} size={14} />
                                  {addedAll === msg.id ? 'Добавлено в корзину' : 'В корзину'}
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  const userQ = messages.slice().reverse().find(m => m.role === 'user')?.text ?? '';
                                  setSaveDialog({ open: true, msgId: msg.id, config: msg.config!, query: userQ });
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2 text-xs border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                              >
                                <Icon name="BookmarkPlus" size={12} />
                                Сохранить конфигурацию в кабинете
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {msg.role === 'user' && (
                      <div className="chat-bubble-user">
                        {msg.text}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="chat-bubble-ai">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="Sparkles" size={12} className="text-accent animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-accent">Анализирую запрос...</span>
                      </div>
                      <div className="flex gap-1.5 py-1">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-3">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                    placeholder="Опишите задачи, ПО, кол-во пользователей, бюджет..."
                    className="flex-1 bg-background border border-border px-4 py-2.5 text-sm outline-none focus:border-foreground placeholder:text-muted-foreground/50 transition-colors"
                    disabled={loading}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={loading || !input.trim()}
                    className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Icon name="Send" size={15} />
                    <span className="hidden sm:inline">Отправить</span>
                  </button>
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground/50 font-mono">
                  Enter — отправить · Shift+Enter — новая строка
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Dialog open={saveDialog.open} onOpenChange={(v) => setSaveDialog(s => ({ ...s, open: v }))}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Сохранить конфигурацию</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Input
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="Например: Команда 3D-аниматоров"
            onKeyDown={(e) => e.key === 'Enter' && handleSaveConfig()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSaveDialog(s => ({ ...s, open: false }))}>Отмена</Button>
          <Button onClick={handleSaveConfig} disabled={!configName.trim()}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}