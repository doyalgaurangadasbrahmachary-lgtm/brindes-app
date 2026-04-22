'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import QuickSendCard from './QuickSendCard'
import { useNotepad } from '@/context/NotepadContext'

export type Product = {
  id: string
  name: string
  image: string
  tags: string[]
  colors?: string[]
}

const COLOR_MAP: Record<string, string> = {
  'PRETO': '#000000',
  'BRANCO': '#FFFFFF',
  'AZUL': '#0000FF',
  'AZUL MARINHO': '#000080',
  'AZUL CLARO': '#ADD8E6',
  'AZUL ROYAL': '#4169E1',
  'VERMELHO': '#FF0000',
  'VERDE': '#228B22',
  'VERDE CLARO': '#90EE90',
  'VERDE ÁGUA': '#7FFFD4',
  'AMARELO': '#FFD700',
  'LARANJA': '#FFA500',
  'ROSA': '#FF69B4',
  'ROSA CLARO': '#FFB6C1',
  'PINK': '#FF1493',
  'ROXO': '#800080',
  'VIOLETA': '#EE82EE',
  'LILAS': '#D8BFD8',
  'CINZA': '#808080',
  'CINZA CLARO': '#D3D3D3',
  'CINZA ESCURO': '#A9A9A9',
  'GRAFITE': '#404040',
  'PRATA': '#C0C0C0',
  'DOURADO': '#DAA520',
  'OURO': '#FFD700',
  'MARROM': '#8B4513',
  'BEGE': '#F5F5DC',
  'BORDO': '#800000',
  'VINHO': '#800000',
  'NATURAL': '#DEB887',
  'MADEIRA': '#8B4513',
  'TRANSPARENTE': 'transparent',
  'A ESCOLHER': 'conic-gradient(from 0deg, red, orange, yellow, green, blue, indigo, violet, red)'
}

function getHexColor(colorName: string): string {
  const upper = colorName.toUpperCase().trim()
  if (COLOR_MAP[upper]) return COLOR_MAP[upper]
  
  // Búsqueda por coincidencia parcial si el color tiene nombre compuesto
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (upper.includes(key)) return hex
  }
  return '#cccccc' // Fallback gris
}

export function ProductCard({ product }: { product: Product }) {
  const [showQuickSend, setShowQuickSend] = useState(false)
  const { addItem, openNotepad } = useNotepad()

  // Estados para el carrusel horizontal de colores
  const [colorsExpanded, setColorsExpanded] = useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Handlers para deslizar (Drag to Scroll) Desktop
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }
  const onMouseLeave = () => setIsDragging(false)
  const onMouseUp = () => setIsDragging(false)
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    e.stopPropagation()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2 // Velocidad de arrastre
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleAddToList = () => {
    addItem(product.id)
    openNotepad()
  }

  return (
    <div
      id={product.id}
      className="product-card group relative bg-white border border-gray-200 rounded overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
    >

      {/* Container de imagem — posição relativa para o overlay */}
      <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden p-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* QuickSendCard — centrado, anclado al bottom de la imagen */}
        {showQuickSend && (
          <QuickSendCard sku={product.id} onClose={() => setShowQuickSend(false)} />
        )}

        {/* Botones — bottom-left, fila horizontal, visible en hover (SOLO DESKTOP) */}
        <div className="hidden md:flex absolute bottom-2 left-2 z-20 flex-row gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

          {/* Botão A: Envio Rápido (QuickSend) */}
          <button
            id={`btn-send-${product.id}`}
            onClick={() => setShowQuickSend(true)}
            title="Envio rápido WhatsApp"
            className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:bg-[#1ebe57] transition-colors active:scale-90"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 512 512">
              <path d="M481.508,210.336L68.414,38.926c-17.403-7.222-37.064-4.045-51.309,8.287C2.86,59.547-3.098,78.551,1.558,96.808 L38.327,241h180.026c8.284,0,15.001,6.716,15.001,15.001c0,8.284-6.716,15.001-15.001,15.001H38.327L1.558,415.193 c-4.656,18.258,1.301,37.262,15.547,49.595c14.274,12.357,33.937,15.495,51.31,8.287l413.094-171.409 C500.317,293.862,512,276.364,512,256.001C512,235.638,500.317,218.139,481.508,210.336z" />
            </svg>
          </button>

          {/* Botão B: Adicionar à Lista */}
          <button
            id={`btn-add-${product.id}`}
            onClick={handleAddToList}
            title="Adicionar à lista de orçamento"
            className="w-8 h-8 rounded-full bg-[#2f9c94] text-white flex items-center justify-center shadow-lg hover:bg-[#27847d] transition-colors active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Colores — Menú Deslizable (Top Right) */}
        {product.colors && product.colors.length > 0 && (
          <div className="absolute top-2 right-2 z-30 flex flex-row-reverse items-center justify-end max-w-[90%] pointer-events-auto">
            
            {/* Botón Trigger Arcoíris */}
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setColorsExpanded(!colorsExpanded); }}
              title="Cores Disponíveis"
              className="relative z-40 flex-shrink-0 flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300 border border-black/5"
            >
               {colorsExpanded ? (
                 <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold text-gray-500 bg-gray-100 rounded-full">✕</span>
               ) : (
                 <div className="w-3.5 h-3.5 rounded-full shadow-inner border border-black/10" style={{ background: COLOR_MAP['A ESCOLHER'] }} />
               )}
               <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">Cores</span>
            </button>

            {/* Carrusel Deslizable Horizontal */}
            <div 
               className={`relative z-30 transition-all duration-500 ease-out flex items-center overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm border-y border-l border-black/5 rounded-l-full mr-[-15px] ${
                  colorsExpanded ? 'max-w-[200px] opacity-100 pr-[18px] pl-2.5 py-1.5' : 'max-w-0 opacity-0 border-transparent shadow-none'
               }`}
            >
               <div 
                  ref={scrollRef}
                  onMouseDown={onMouseDown}
                  onMouseLeave={onMouseLeave}
                  onMouseUp={onMouseUp}
                  onMouseMove={onMouseMove}
                  onTouchStart={() => setIsDragging(true)}
                  onTouchEnd={() => setIsDragging(false)}
                  className="flex flex-row gap-1.5 items-center overflow-x-auto cursor-grab active:cursor-grabbing snap-x"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
               >
                  {/* Pseudo-elemento global para Safari no-scrollbar */}
                  <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
                  
                  {product.colors.map((color, idx) => {
                    const hexOrGradient = getHexColor(color);
                    return (
                      <div 
                        key={idx} 
                        title={color}
                        className="flex-shrink-0 w-4 h-4 rounded-full border border-black/15 shadow-inner snap-center transition-transform hover:scale-110" 
                        style={{ background: hexOrGradient }} 
                      />
                    )
                  })}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Info del producto */}
      <div className="p-4 flex flex-col items-center justify-center text-center">
        <h2 className="text-sm font-semibold text-gray-700 h-10 line-clamp-2" title={product.name}>
          {product.name}
        </h2>
        <div className="flex items-center justify-center gap-3 mt-2 w-full">
          {/* Botão A: Envio Rápido (QuickSend) SOLO MÓVIL */}
          <button
            id={`btn-send-mob-${product.id}`}
            onClick={() => setShowQuickSend(true)}
            title="Envio rápido WhatsApp"
            className="md:hidden w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md hover:bg-[#1ebe57] transition-colors active:scale-90 shrink-0"
          >
            <svg className="w-4 h-4 fill-current ml-[1px]" viewBox="0 0 512 512">
              <path d="M481.508,210.336L68.414,38.926c-17.403-7.222-37.064-4.045-51.309,8.287C2.86,59.547-3.098,78.551,1.558,96.808 L38.327,241h180.026c8.284,0,15.001,6.716,15.001,15.001c0,8.284-6.716,15.001-15.001,15.001H38.327L1.558,415.193 c-4.656,18.258,1.301,37.262,15.547,49.595c14.274,12.357,33.937,15.495,51.31,8.287l413.094-171.409 C500.317,293.862,512,276.364,512,256.001C512,235.638,500.317,218.139,481.508,210.336z" />
            </svg>
          </button>

          <div className="text-xl text-[#2f9c94] font-bold uppercase tracking-tighter shrink-0">
            {product.id}
          </div>

          {/* Botão B: Adicionar à Lista SOLO MÓVIL */}
          <button
            id={`btn-add-mob-${product.id}`}
            onClick={handleAddToList}
            title="Adicionar à lista de orçamento"
            className="md:hidden w-8 h-8 rounded-full bg-[#2f9c94] text-white flex items-center justify-center shadow-md hover:bg-[#27847d] transition-colors active:scale-90 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
