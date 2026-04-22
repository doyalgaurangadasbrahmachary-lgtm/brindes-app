'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { ProductCard, Product } from './ProductCard'

export default function ProductGrid({ initialData, title }: { initialData: Product[], title?: string }) {
  const [cols, setCols] = useState(4)
  const searchParams = useSearchParams()
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  
  // Seguimiento responsivo de columnas
  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1024) setCols(4)
      else if (window.innerWidth >= 768) setCols(3)
      else setCols(2)
    }
    updateCols()
    window.addEventListener('resize', updateCols)
    return () => window.removeEventListener('resize', updateCols)
  }, [])

  // Auto-scroll al target
  useEffect(() => {
    const targetSku = searchParams.get('target')
    if (targetSku && virtuosoRef.current && initialData.length > 0 && cols > 0) {
      const idx = initialData.findIndex(p => p.id === targetSku)
      if (idx !== -1) {
        const rowIdx = Math.floor(idx / cols)
        // Pequeño delay para asegurar que Virtuoso midió el contenedor
        setTimeout(() => {
          virtuosoRef.current?.scrollToIndex({ index: rowIdx, align: 'center', behavior: 'smooth' })
          
          // Buscar el elemento una vez que Virtuoso lo inyecte en el DOM
          let attempts = 0;
          const poll = setInterval(() => {
             const el = document.getElementById(targetSku);
             if (el || attempts > 25) {
                clearInterval(poll);
                if (el) {
                   const observer = new IntersectionObserver((entries) => {
                       if (entries[0].isIntersecting) {
                           el.classList.add('highlight-product');
                           setTimeout(() => el.classList.remove('highlight-product'), 3000);
                           observer.disconnect();
                       }
                   }, { rootMargin: "-20% 0px -20% 0px", threshold: 0 });
                   observer.observe(el);
                   
                   setTimeout(() => {
                       el.classList.add('highlight-product');
                       setTimeout(() => el.classList.remove('highlight-product'), 3000);
                       observer.disconnect();
                   }, 1800);
                }
             }
             attempts++;
          }, 100);

        }, 100)
      }
    }
  }, [searchParams, initialData, cols])

  // Agrupamiento en filas para mantener el Grid responsive
  const rows = useMemo(() => {
    const result = []
    for (let i = 0; i < initialData.length; i += cols) {
      result.push(initialData.slice(i, i + cols))
    }
    return result
  }, [initialData, cols])

  const gridClass = cols === 4 ? "grid-cols-4" : cols === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className="py-8 pt-24 md:pt-20">
      <h1 className="h3 font-normal block md:inline-block mb-6 ml-0 md:ml-[180px] text-[#2f9c94] font-bold text-center md:text-left w-full md:w-auto px-4 md:px-0">
        {title 
          ? title.charAt(0).toUpperCase() + title.slice(1).toLowerCase() 
          : 'Produtos'}
      </h1>
      
      {initialData.length === 0 ? (
        <p className="text-gray-500 py-10">Nenhum produto encontrado.</p>
      ) : (
        <Virtuoso
          ref={virtuosoRef}
          useWindowScroll
          data={rows}
          itemContent={(index, rowData) => (
            <div className={`grid ${gridClass} gap-4 mb-4`} style={{ width: '100%' }}>
              {rowData.map((prod: Product) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        />
      )}
    </div>
  )
}
