import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useCartStore } from '@/store/cart';

interface HeaderProps {
  activeSection: string;
  onNav: (section: string) => void;
}

const NAV = [
  { id: 'catalog', label: 'Каталог' },
  { id: 'configurator', label: 'AI Конфигуратор' },
  { id: 'compare', label: 'Сравнение' },
  { id: 'contacts', label: 'Контакты' },
];

export default function Header({ activeSection, onNav }: HeaderProps) {
  const count = useCartStore(s => s.count());
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-foreground text-primary-foreground">
      <div className="flex items-center justify-between px-6 h-14 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <button
          onClick={() => onNav('hero')}
          className="flex items-center gap-3 group"
        >
          <div className="w-8 h-8 bg-accent flex items-center justify-center">
            <Icon name="Server" size={16} className="text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold tracking-[0.15em] uppercase leading-none text-white">TECHPRO</div>
            <div className="text-[9px] font-mono tracking-[0.1em] text-white/50 leading-none mt-0.5">IT EQUIPMENT</div>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`text-xs font-medium uppercase tracking-[0.15em] transition-colors duration-150 ${
                activeSection === item.id
                  ? 'text-accent'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <a
            href="/admin"
            className="hidden md:flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors uppercase tracking-wider"
          >
            <Icon name="Settings" size={15} />
            <span>Админ</span>
          </a>

          <button
            onClick={() => onNav('cart')}
            className="relative flex items-center gap-2 bg-accent px-3 py-1.5 text-white hover:opacity-90 transition-opacity"
          >
            <Icon name="ShoppingCart" size={15} />
            <span className="text-xs font-semibold hidden md:inline">Корзина</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-accent text-[10px] font-bold flex items-center justify-center rounded-full">
                {count}
              </span>
            )}
          </button>

          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white/70 hover:text-white"
          >
            <Icon name={menuOpen ? 'X' : 'Menu'} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-foreground border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => { onNav(item.id); setMenuOpen(false); }}
              className="text-xs font-medium uppercase tracking-[0.15em] text-white/60 hover:text-white text-left"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}