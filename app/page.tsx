import { Suspense } from 'react'
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { slugify } from '@/utils/slugify'
import CategoryCard from '@/components/CategoryCard'
import { Product } from '@/components/ProductCard'

export default async function Home() {
  let groupedCategories: Record<string, string[]> = {}
  
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'maestra.json')
    if (fs.existsSync(filePath)) {
      const fileData = await fs.promises.readFile(filePath, 'utf8')
      const products: Product[] = JSON.parse(fileData)
      
      const tagsSet = new Set<string>()
      products.forEach(p => {
        if (p.tags && Array.isArray(p.tags)) {
          p.tags.forEach(t => tagsSet.add(t))
        }
      })
      
      const uniqueTags = Array.from(tagsSet).sort()
      
      // Agrupar por la letra inicial de forma estricta para forzar saltos
      groupedCategories = uniqueTags.reduce((acc, tag) => {
        // Normalizar para remover acentos al clasificar (Á -> A, Ó -> O)
        const normalized = tag.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let firstLetter = normalized.charAt(0).toUpperCase();
        
        // Si no es una letra (número, símbolo), se va al grupo '#'
        if (!firstLetter.match(/[A-Z]/)) firstLetter = '#';
        
        if (!acc[firstLetter]) acc[firstLetter] = []
        acc[firstLetter].push(tag)
        return acc
      }, {} as Record<string, string[]>)
    }
  } catch(e) {
    console.error("Error reading JSON", e)
  }

  // Ordenar las letras alfabéticamente
  const letters = Object.keys(groupedCategories).sort()

  return (
    <Suspense fallback={<div className="p-10 text-center text-white bg-[#0d0f10] min-h-screen pt-40">Carregando catálogo...</div>}>
      
      {/* 
        ==============================
        HERO SECTION (Video Ping-Pong Background)
        ==============================
      */}
      <div className="w-[100vw] min-h-[450px] relative left-1/2 -translate-x-1/2 bg-[#04080a] overflow-hidden flex items-center pt-32 pb-16">
        {/* Video en bucle nativo */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          poster="/assets/hero_poster.webp"
          className="absolute inset-0 w-full h-full object-cover opacity-80 object-[55%_center] animate-pan-video md:object-center md:animate-none"
        >
          {/* WebM primero: 3MB vs 32MB del MP4 — el navegador elige el primero que soporta */}
          <source src="/assets/hero_pingpong.webm" type="video/webm" />
          <source src="/assets/hero_pingpong.mp4" type="video/mp4" />
        </video>
        
        {/* Capa de oscurecimiento (Gradient Overlay) para asegurar contraste del texto */}
        <div className="absolute inset-0 bg-black/20 md:bg-black/40 bg-gradient-to-r from-black/60 md:from-black/90 to-black/10 md:to-transparent pointer-events-none" />
        
        {/* Degrade inferior para tapar marca de agua y fundir suavemente con la sección de categorías */}
        <div className="absolute bottom-0 left-0 right-0 h-32 md:h-48 bg-gradient-to-t from-[#0d0f10] via-[#0d0f10]/80 to-transparent pointer-events-none" />
        
        <div className="brindes-container relative z-10 px-4 w-full">
          <div className="max-w-xl pl-4 md:pl-16">
            <h1 className="text-white text-3xl md:text-5xl font-serif mb-4 leading-tight tracking-wide">
              Nosso orgulho é entregar{' '}
              <br className="hidden md:block" />
              mais que <span className="text-[#2f9c94]">brindes</span>
            </h1>
            <p className="text-gray-300 text-sm max-w-lg mb-8 leading-relaxed font-light">
              Entregamos compromisso. Facilitamos sua jornada com soluções{' '}
              <br className="hidden md:block" />
              práticas, atendimento imediato e entrega no prazo com a agilidade{' '}
              <br className="hidden md:block" />
              de quem entende e valoriza o sucesso do seu negócio.
            </p>
            <a 
              href="https://wa.me/5535998869018?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento." 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-transparent border-2 border-[#2f9c94] !text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-[#25D366] hover:border-[#25D366] transition-all duration-300 shadow-lg"
            >
              SOLICITAR ORÇAMENTO AGORA
            </a>
          </div>
        </div>
      </div>

      {/* 
        ==============================
        CATEGORIAS (Lista A-Z con Grid)
        ==============================
      */}
      <div id="catalogo" className="w-[100vw] min-h-screen bg-[#0d0f10] relative left-1/2 -translate-x-1/2 pt-16 pb-32">
        <div className="brindes-container px-4">
          
          <div className="mb-14 px-4 md:px-16 flex items-center justify-between w-full">
            <div className="flex-shrink-0 relative flex items-center justify-center w-[93px] h-[93px] ml-4 md:hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%] w-[101%] h-[101%] bg-white rounded-full -z-10 shadow-md" />
              <img src="/assets/LOGOS/motta (1).png" alt="Motta Logo" className="w-full h-full object-contain relative translate-x-[1px] translate-y-[0.5px] drop-shadow-md" />
            </div>
            <div className="hidden md:block flex-shrink-0 w-16 h-16"></div>
            <span className="text-gray-100 tracking-[0.2em] uppercase text-base md:text-xl font-semibold inline-block">
               CATEGORIAS
            </span>
          </div>

          {letters.length === 0 ? (
            <p className="text-gray-500 py-10 pl-4 md:pl-16">Nenhuma categoria encontrada.</p>
          ) : (
             <div className="flex flex-col gap-12 w-full max-w-[1200px] mx-auto px-4 md:px-16">
               {letters.map(letter => (
                 <div key={letter} className="w-full">
                    {/* Letra Azul Fija */}
                    <h2 className="text-[#2f9c94] text-xl font-bold mb-4 font-serif tracking-wide">
                      {letter === '#' ? 'Datas Especiais' : letter}
                    </h2>

                    {/* Grilla Incompleta Respetada (4 Columnas) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {groupedCategories[letter].map(tag => (
                        <CategoryCard 
                          key={tag} 
                          tag={tag} 
                          slug={slugify(tag)} 
                        />
                      ))}
                    </div>
                 </div>
               ))}
             </div>
          )}
          
        </div>
      </div>

    </Suspense>
  )
}

