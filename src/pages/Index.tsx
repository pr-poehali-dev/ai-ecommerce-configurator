import { useState, useRef } from 'react';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/sections/HeroSection';
import CatalogSection from '@/components/sections/CatalogSection';
import AIConfiguratorSection from '@/components/sections/AIConfiguratorSection';
import CompareSection from '@/components/sections/CompareSection';
import CartSection from '@/components/sections/CartSection';
import ContactsSection from '@/components/sections/ContactsSection';
import ProductModal from '@/components/sections/ProductModal';
import type { Product } from '@/data/products';

export default function Index() {
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const refs = {
    hero: useRef<HTMLDivElement>(null),
    catalog: useRef<HTMLDivElement>(null),
    configurator: useRef<HTMLDivElement>(null),
    compare: useRef<HTMLDivElement>(null),
    cart: useRef<HTMLDivElement>(null),
    contacts: useRef<HTMLDivElement>(null),
  };

  const scrollTo = (section: string) => {
    setActiveSection(section);
    const ref = refs[section as keyof typeof refs];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen">
      <Header activeSection={activeSection} onNav={scrollTo} />

      <div ref={refs.hero}>
        <HeroSection onNav={scrollTo} />
      </div>

      <div ref={refs.catalog}>
        <CatalogSection
          onProduct={setSelectedProduct}
          compareIds={compareIds}
          onCompare={handleCompare}
        />
      </div>

      <div ref={refs.configurator}>
        <AIConfiguratorSection />
      </div>

      <div ref={refs.compare}>
        <CompareSection
          compareIds={compareIds}
          onRemove={id => setCompareIds(prev => prev.filter(i => i !== id))}
          onNav={scrollTo}
        />
      </div>

      <div ref={refs.cart}>
        <CartSection />
      </div>

      <div ref={refs.contacts}>
        <ContactsSection />
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onCompare={handleCompare}
          inCompare={compareIds.includes(selectedProduct.id)}
        />
      )}

      {compareIds.length > 0 && (
        <button
          onClick={() => scrollTo('compare')}
          className="fixed bottom-6 left-6 z-40 bg-foreground text-background flex items-center gap-3 px-4 py-3 shadow-xl hover:bg-accent transition-colors animate-fade-in"
        >
          <span className="text-xs font-semibold uppercase tracking-wider">Сравнить</span>
          <span className="bg-accent text-white w-5 h-5 flex items-center justify-center text-xs font-bold">
            {compareIds.length}
          </span>
        </button>
      )}
    </div>
  );
}
