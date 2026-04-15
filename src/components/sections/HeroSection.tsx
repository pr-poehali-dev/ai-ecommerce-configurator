import Icon from '@/components/ui/icon';

interface HeroProps {
  onNav: (section: string) => void;
}

const STATS = [
  { value: '2 400+', label: 'Конфигураций поставлено' },
  { value: '98%', label: 'Клиентов довольны выбором' },
  { value: '14 лет', label: 'На рынке B2B' },
  { value: '3 года', label: 'Гарантия на всё оборудование' },
];

export default function HeroSection({ onNav }: HeroProps) {
  return (
    <section className="pt-14 min-h-screen flex flex-col bg-foreground text-primary-foreground relative overflow-hidden">
      {/* Grid dots bg */}
      <div
        className="absolute inset-0 opacity-[0.04] bg-blue-500"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Accent vertical line */}
      <div className="absolute left-0 top-14 bottom-0 w-1 bg-transparent" />

      <div className="relative flex-1 flex flex-col max-w-screen-2xl mx-auto w-full px-8 md:px-16 bg-transparent">

        {/* Top meta row */}
        <div className="flex items-center gap-6 pt-16 pb-8 border-b border-white/10">
          <span className="section-label text-white/30">Профессиональное IT-оборудование</span>
          <div className="flex-1 h-px bg-white/10" />
          <span className="font-mono text-xs text-white/30">EST. 2010 / MOSCOW</span>
        </div>

        {/* Main hero content */}
        <div className="flex flex-col lg:flex-row gap-16 pt-12 pb-12 flex-1">
          {/* Left: Headline */}
          <div className="flex-1 animate-fade-in">
            <div className="text-xs font-mono uppercase tracking-[0.3em] text-accent mb-6">
              B2B / Рабочие станции · NAS · Серверы
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-white mb-8 text-left">Железо для тех,
кто знает что делает</h1>
            <p className="text-white/50 text-base leading-relaxed max-w-md mb-10">
              Профессиональные рабочие станции, NAS-хранилища и серверы для студий, архитектурных бюро и инженерных компаний. AI-конфигуратор подберёт оптимальное решение под ваши задачи.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onNav('configurator')}
                className="btn-accent flex items-center gap-2"
              >
                <Icon name="Sparkles" size={16} />
                AI Конфигуратор
              </button>
              <button
                onClick={() => onNav('catalog')}
                className="btn-outline text-white border-white/30 hover:bg-white hover:text-foreground flex items-center gap-2"
              >
                <Icon name="LayoutGrid" size={16} />
                Каталог
              </button>
            </div>
          </div>

          {/* Right: Featured product */}
          <div className="lg:w-96 animate-fade-in" style={{ animationDelay: '0.15s', opacity: 0 }}>
            <div className="bg-white/5 border border-white/10 p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <span className="category-pill">Топ продаж</span>
                <span className="font-mono text-xs text-white/30">WS-001</span>
              </div>

              {/* Visual placeholder */}
              <div className="flex-1 bg-white/5 border border-white/10 mb-6 flex items-center justify-center min-h-40 relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto mb-3">
                    <Icon name="Monitor" size={32} className="text-accent" />
                  </div>
                  <div className="text-xs font-mono text-white/30">ProStation X1 Ultra</div>
                </div>
                <div className="absolute top-3 right-3 font-mono text-[10px] text-white/20">
                  TECHPRO/2025
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {[
                  ['Процессор', 'Threadripper PRO 7985WX'],
                  ['ОЗУ', '256 GB DDR5 ECC'],
                  ['GPU', 'RTX 4090 24 GB'],
                ].map(([key, val]) => (
                  <div key={key} className="spec-row border-white/10">
                    <span className="text-white/40 text-xs">{key}</span>
                    <span className="text-white text-xs font-mono text-right">{val}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-white/30 mb-1">Стоимость от</div>
                  <div className="text-2xl font-bold text-white">
                    {(485000).toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <button className="btn-accent text-xs">
                  В каталог
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/10 animate-stagger">
          {STATS.map((s) => (
            <div key={s.value} className="py-6 px-4 border-r border-white/10 last:border-r-0">
              <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}