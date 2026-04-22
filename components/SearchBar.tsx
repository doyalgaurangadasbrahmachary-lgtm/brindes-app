'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useNotepad } from '@/context/NotepadContext';
import { slugify } from '@/utils/slugify';

interface Product {
  id: string;
  name: string;
  tags?: string[];
}

interface SearchBarProps {
  isScrolled: boolean;
}

export default function SearchBar({ isScrolled }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const { openNotepad } = useNotepad();
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fechar busca ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtro inteligente Server-Side (Debounced)
  useEffect(() => {
    if (query.length > 1) {
      const fetchResults = async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data);
          }
        } catch (e) {
          console.error("Erro na busca:", e);
        }
      };

      const debounceTimeout = setTimeout(fetchResults, 300);
      return () => clearTimeout(debounceTimeout);
    } else {
      setResults([]);
    }
  }, [query]);

  const jumpToProduct = (id: string, productTags?: string[]) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add('highlight-product');
          setTimeout(() => el.classList.remove('highlight-product'), 3000);
          observer.disconnect();
        }
      }, { rootMargin: "-20% 0px -20% 0px", threshold: 0 }); 
      
      observer.observe(el);
      
      // Failsafe absoluto
      setTimeout(() => {
        el.classList.add('highlight-product');
        setTimeout(() => el.classList.remove('highlight-product'), 3000);
        observer.disconnect();
      }, 1800);
    } else {
      if (productTags && productTags.length > 0) {
        const slug = slugify(productTags[0]);
        router.push(`/categoria/${slug}?target=${id}`);
      } else {
        alert('Produto não localizado no catálogo.');
      }
    }
    setQuery('');
    setResults([]);
  };

  return (
    <div className={`relative w-full transition-all duration-500`} ref={searchRef}>
      <div className={`flex items-center backdrop-blur-md rounded-full px-3 py-1.5 transition-all ${
        isScrolled 
          ? 'bg-black/5 border-2 border-[#2f9c94]' 
          : 'bg-white/10 border border-white/30 focus-within:border-[#2f9c94]'
      }`}>
        <svg className={`w-4 h-4 shrink-0 transition-colors ${isScrolled ? 'text-black' : 'text-white/80'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          className={`bg-transparent border-none text-[11px] ml-2 w-full outline-none transition-colors ${
            isScrolled ? 'text-black placeholder:text-black/30' : 'text-white placeholder:text-white/50'
          }`}
        />
      </div>

      {/* Lista de Sugestões Google Style */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-[#1a1a1a] border border-[#333] rounded-2xl mt-2 max-h-[60vh] overflow-y-auto overscroll-contain shadow-2xl z-[1000] animate-in fade-in slide-in-from-top-2">
          {results.map(p => (
            <button 
              key={p.id}
              onClick={() => jumpToProduct(p.id, p.tags)}
              className="w-full flex items-center justify-between p-3 hover:bg-[#2f9c94]/20 border-b border-[#333] last:border-none transition-colors text-left"
            >
              <div className="flex flex-col items-start flex-1 min-w-0 pr-2">
                <span className="text-[#2f9c94] font-black text-xs shrink-0">{p.id}</span>
                <span className="text-white/70 text-[10px] uppercase truncate w-full">{p.name}</span>
              </div>
              <span className="text-[8px] bg-white/5 px-2 py-1 rounded text-white/40 uppercase shrink-0 max-w-[90px] truncate text-right">
                {p.tags && p.tags.length > 0 ? p.tags[0] : 'Brindes'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}