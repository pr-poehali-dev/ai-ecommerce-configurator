import Icon from '@/components/ui/icon';

const CONTACTS = [
  { icon: 'Phone', label: 'Телефон', value: '+7 (495) 123-45-67', sub: 'Пн–Пт, 9:00–18:00 МСК' },
  { icon: 'Mail', label: 'Email', value: 'sales@techpro.ru', sub: 'Ответ в течение 2 часов' },
  { icon: 'MapPin', label: 'Офис', value: 'Москва, Пресненская наб. 10', sub: 'Башня Федерация, 45 этаж' },
  { icon: 'Clock', label: 'Режим работы', value: 'Пн–Пт: 9:00–18:00', sub: 'Сб–Вс: выходной' },
];

const CERTS = [
  'Авторизованный партнёр NVIDIA',
  'Партнёр Intel Technology Provider',
  'Дистрибьютор Synology',
  'Сертифицированный партнёр AMD',
];

export default function ContactsSection() {
  return (
    <section className="py-16 bg-foreground text-primary-foreground border-t border-white/10">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30 mb-3">О компании</div>
            <h2 className="text-3xl font-bold text-white mb-6">Контакты<br />и реквизиты</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-md">
              TECHPRO — специализированный поставщик профессионального IT-оборудования для B2B сегмента. Работаем с юридическими лицами, предоставляем официальные гарантийные документы, счета-фактуры и акты.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {CONTACTS.map(c => (
                <div key={c.label} className="border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name={c.icon} fallback="Info" size={14} className="text-accent" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">{c.label}</span>
                  </div>
                  <div className="text-sm font-medium text-white mb-0.5">{c.value}</div>
                  <div className="text-xs text-white/30">{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="border-t border-white/10 pt-6">
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/30 mb-3">Сертификаты и партнёрства</div>
              <div className="space-y-2">
                {CERTS.map(c => (
                  <div key={c} className="flex items-center gap-2 text-xs text-white/50">
                    <div className="w-1 h-1 bg-accent flex-shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Quick inquiry */}
          <div>
            <div className="border border-white/10 p-8">
              <div className="text-sm font-semibold uppercase tracking-wider text-white mb-6 pb-4 border-b border-white/10">
                Быстрая консультация
              </div>
              <div className="space-y-4">
                {['Имя и компания', 'Телефон или Email', 'Вопрос или задача'].map((label, i) => (
                  <div key={label}>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/30 mb-1 block">
                      {label}
                    </label>
                    {i === 2 ? (
                      <textarea
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-accent transition-colors resize-none"
                        placeholder="Опишите задачу..."
                      />
                    ) : (
                      <input
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-accent transition-colors"
                        placeholder={i === 0 ? 'ООО «Ваша компания»' : '+7 (___) ___-__-__'}
                      />
                    )}
                  </div>
                ))}
                <button className="btn-accent w-full flex items-center justify-center gap-2">
                  <Icon name="Send" size={15} />
                  Отправить запрос
                </button>
              </div>
            </div>

            {/* Requisites */}
            <div className="border border-white/10 p-6 mt-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/30 mb-4">Реквизиты</div>
              <div className="space-y-2">
                {[
                  ['Компания', 'ООО «ТЕХПРО»'],
                  ['ИНН', '7709123456'],
                  ['КПП', '770901001'],
                  ['ОГРН', '1027739123456'],
                ].map(([key, val]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-white/30">{key}</span>
                    <span className="font-mono text-white/60">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-white/20 font-mono">
            © 2025 TECHPRO. Все права защищены. Цены указаны без НДС.
          </div>
          <div className="flex gap-6">
            {['Политика конфиденциальности', 'Условия поставки', 'Гарантия'].map(l => (
              <a key={l} href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}