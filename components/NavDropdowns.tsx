'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/utils/slugify'

export default function NavDropdowns({ forceWhiteText = false }: { forceWhiteText?: boolean }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveMenu(menu)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null)
      setActiveSubMenu(null)
    }, 300)
  }

  const handleSubMouseEnter = (sub: string) => {
    if (subTimeoutRef.current) clearTimeout(subTimeoutRef.current)
    setActiveSubMenu(sub)
  }

  const handleCategoryClick = (category: string) => {
    if (category === 'All') {
      router.push(`/`)
    } else {
      router.push(`/categoria/${slugify(category)}`)
    }
    setActiveMenu(null)
    setActiveSubMenu(null)
  }

  return (
    <nav className="relative" onMouseLeave={handleMouseLeave}>
      <ul className="flex items-center font-bold text-gray-700">
        <li className="relative" onMouseEnter={() => handleMouseEnter('produtos')}>
          <button 
            className={`uppercase cursor-pointer p-1 md:py-1 tracking-widest transition-colors duration-500 hover:text-[#2f9c94] ${forceWhiteText ? 'text-white' : 'text-[#3a3a3a]'}`}
            onClick={(e) => { 
              e.preventDefault(); 
              // En móvil, click abre/cierra el menú. En desktop, el hover ya lo abre.
              setActiveMenu(activeMenu === 'produtos' ? null : 'produtos');
            }}
          >
            <span className="hidden md:inline font-bold">PRODUTOS</span>
            <svg className="w-6 h-6 md:hidden" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {activeMenu === 'produtos' ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> // Icono Cerrar (X) cuando está abierto
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /> // Icono Hamburguesa cuando está cerrado
              )}
            </svg>
          </button>
          
          {/* Sub Menu Produtos (Nivel 1) */}
          {activeMenu === 'produtos' && (
            <div className="absolute top-10 right-[-10px] md:right-0 w-[240px] md:w-64 bg-[#f4f7f6] border border-gray-300 shadow-xl py-2 z-50 rounded-lg">
              <ul className="text-sm font-bold text-gray-700 flex flex-col">
                <li 
                  className={`px-6 py-3 cursor-pointer flex justify-between items-center transition-colors ${activeSubMenu === 'az' ? 'bg-teal-50 text-brand-orange border-l-4 border-brand-orange' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                  onMouseEnter={() => handleSubMouseEnter('az')}
                  onClick={(e) => { if (window.innerWidth < 768) { e.preventDefault(); handleSubMouseEnter(activeSubMenu === 'az' ? '' : 'az'); } }}
                >
                  <span>Por Categoria (A-Z)</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </li>
                <li 
                  className={`px-6 py-3 cursor-pointer flex justify-between items-center transition-colors ${activeSubMenu === 'seg' ? 'bg-teal-50 text-brand-orange border-l-4 border-brand-orange' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                  onMouseEnter={() => handleSubMouseEnter('seg')}
                  onClick={(e) => { if (window.innerWidth < 768) { e.preventDefault(); handleSubMouseEnter(activeSubMenu === 'seg' ? '' : 'seg'); } }}
                >
                  <span>Por Segmentos</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </li>
                <li 
                  className={`px-6 py-3 cursor-pointer flex justify-between items-center transition-colors ${activeSubMenu === 'esp' ? 'bg-teal-50 text-brand-orange border-l-4 border-brand-orange' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                  onMouseEnter={() => handleSubMouseEnter('esp')}
                  onClick={(e) => { if (window.innerWidth < 768) { e.preventDefault(); handleSubMouseEnter(activeSubMenu === 'esp' ? '' : 'esp'); } }}
                >
                  <span>Datas Especiais</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </li>
              </ul>

              {/* Nivel 2: A-Z POR CATEGORIA */}
              {activeSubMenu === 'az' && (
                <div className="absolute top-[100%] right-0 md:top-0 md:right-full md:mr-2 w-[280px] md:w-[350px] h-[400px] md:h-[450px] bg-[#f4f7f6] border border-gray-300 shadow-2xl p-4 md:p-6 z-50 rounded-lg">
                  <h3 className="h5 mb-4 pb-2 border-b border-[#2f9c94] text-[#2f9c94] font-bold uppercase tracking-wider text-sm md:text-base">A-Z Por Categoria</h3>
                  <div className="h-[320px] md:h-[370px] overflow-y-auto custom-scrollbar pr-2">
                    <ul className="space-y-1 text-sm font-normal">
                      {(() => {
                        const categoriesData = require('@/public/assets/data/categories.json');
                        let lastLetter = '';
                        return categoriesData.az.map((cat: any, i: number) => {
                          const currentLetter = cat.title.charAt(0).toUpperCase();
                          const isNewLetter = currentLetter !== lastLetter;
                          if (isNewLetter) lastLetter = currentLetter;
                          return (
                            <React.Fragment key={i}>
                              {isNewLetter && <li className="font-bold text-gray-800 mt-4 mb-1 text-xs uppercase tracking-widest text-brand-orange border-b border-teal-100 pb-1">{currentLetter}</li>}
                              <li className="hover:text-brand-orange hover:bg-teal-50 px-2 py-1 -ml-2 rounded cursor-pointer transition-colors" title={cat.title} onClick={() => handleCategoryClick(cat.title)}>
                                {cat.title}
                              </li>
                            </React.Fragment>
                          );
                        });
                      })()}
                    </ul>
                  </div>
                </div>
              )}

              {/* Nivel 2: POR SEGMENTOS */}
              {activeSubMenu === 'seg' && (
                <div className="absolute top-[100%] right-0 md:top-0 md:right-full md:mr-2 w-[280px] md:w-[350px] bg-[#f4f7f6] border border-gray-300 shadow-2xl p-4 md:p-6 z-50 rounded-lg max-h-[400px] overflow-y-auto">
                  <h3 className="h5 mb-4 pb-2 border-b border-[#2f9c94] text-[#2f9c94] font-bold uppercase tracking-wider text-sm md:text-base">Por Segmentos</h3>
                  <ul className="space-y-2 text-sm font-normal">
                    {(() => {
                      const categoriesData = require('@/public/assets/data/categories.json');
                      return categoriesData.segmentos.map((cat: any, i: number) => (
                        <li key={`seg-${i}`} className="hover:text-brand-orange hover:bg-teal-50 px-2 py-1 -ml-2 rounded cursor-pointer transition-colors" onClick={() => handleCategoryClick(cat.title)}>
                          {cat.title}
                        </li>
                      ));
                    })()}
                  </ul>
                </div>
              )}

              {/* Nivel 2: DATAS ESPECIAIS */}
              {activeSubMenu === 'esp' && (
                <div className="absolute top-[100%] right-0 md:top-0 md:right-full md:mr-2 w-[280px] md:w-[450px] bg-[#f4f7f6] border border-gray-300 shadow-2xl p-4 md:p-6 z-50 rounded-lg max-h-[400px] overflow-y-auto">
                  <h3 className="h5 mb-4 pb-2 border-b border-[#2f9c94] text-[#2f9c94] font-bold uppercase tracking-wider text-sm md:text-base">Datas Especiais</h3>
                  <ul className="space-y-2 text-sm font-normal grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    {(() => {
                      const categoriesData = require('@/public/assets/data/categories.json');
                      return categoriesData.especiais.map((cat: any, i: number) => (
                        <li key={`esp-${i}`} className="hover:text-brand-orange hover:bg-teal-50 px-2 py-1 -ml-2 rounded cursor-pointer transition-colors" onClick={() => handleCategoryClick(cat.title)}>
                          {cat.title}
                        </li>
                      ));
                    })()}
                  </ul>
                </div>
              )}
            </div>
          )}
        </li>
      </ul>
    </nav>
  )
}
