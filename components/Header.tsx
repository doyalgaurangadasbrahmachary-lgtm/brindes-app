'use client'

import React, { useEffect, useState } from 'react'
import SearchBar from './SearchBar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NavDropdowns from './NavDropdowns'

export default function Header() {
  const [scrolled, setScrolled] = useState(true) // default true = cristal blanco
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Solo activar la transición transparente→cristal en la Home (que tiene hero oscuro)
    const isHomePage = pathname === '/'

    const handleScroll = () => {
      if (isHomePage) {
        setScrolled(window.scrollY > 300)
      } else {
        // Fuera de home, SIEMPRE versión cristal blanca
        setScrolled(true)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check on mount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  return (
    <header className="fixed top-0 left-0 right-0 z-[999] pointer-events-none pt-4 pb-4">
      <div className="brindes-container flex items-start justify-between">
        
        {/* Logo Motta Independiente (Izquierda) ESTÁTICO PERMANENTE (Oculto en móvil) */}
        <div className="pointer-events-auto relative hidden md:flex items-center justify-center w-[97px] h-[97px] shrink-0">
          {/* Círculo de fondo blanco siempre visible y estático */}
          <div className="absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%] w-[110%] h-[110%] bg-white rounded-full -z-10 shadow-md" />
          {/* Logo original siempre igual */}
          <img 
            src="/assets/LOGOS/motta (1).png" 
            alt="Logo Motta" 
            className="w-full h-full object-contain relative translate-x-[1px] translate-y-[0.5px] drop-shadow-md"
          />
        </div>

        {/* Contenedor del Home, Search y la Cápsula (Derecha/Centro) */}
        <div className="pointer-events-auto mt-2 w-full md:w-auto px-3 md:px-0 md:mr-2 flex items-center justify-center md:justify-end gap-3 shrink-0">
          <div className="hidden lg:block w-48 mr-2">
            <SearchBar isScrolled={pathname === '/' ? false : scrolled} />
          </div>
          
          {/* Botón Home: Desktop (Externo) */}
          <Link 
            href="/" 
            className={`hidden md:flex p-2 rounded-full items-center justify-center cursor-pointer transition-all duration-300 ${
              scrolled 
                ? 'text-[#3a3a3a] bg-white/85 backdrop-blur-md border-2 border-[#2f9c94] hover:bg-white hover:backdrop-blur-none hover:scale-110' 
                : 'text-white bg-white/10 backdrop-blur-md border-2 border-white/50 hover:bg-white hover:text-[#2f9c94] hover:backdrop-blur-none hover:scale-110'
            }`}
            title="Ir ao Início"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </Link>

          {/* Contenedor Relativo para Cápsula y Buscador Móvil */}
          <div className="relative w-full max-w-[345px] md:max-w-none md:w-auto flex flex-col items-center">
            {/* Header Cápsula */}
            <div 
              className={`flex items-center justify-between gap-3 px-5 md:pl-6 md:pr-10 py-1.5 rounded-full w-full md:w-[380px] transition-all duration-500 ${
                scrolled 
                  ? 'backdrop-blur-xl shadow-lg border-2 border-[#2f9c94]'
                  : 'backdrop-blur-sm border-2 border-white/40 shadow-none'
              }`}
              style={{ 
                backgroundColor: scrolled 
                  ? 'rgba(255, 255, 255, 0.45)' 
                  : 'rgba(255, 255, 255, 0.05)' ,
                backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(4px)',
                WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(4px)',
              }}
            >
              {/* Contenedor Izquierdo: Icono Home (solo móvil) + Logo Motta */}
              <div className="flex items-center gap-2 md:gap-0">
                {/* Botón Home Mobile: Sin fondo circular, directo en cápsula */}
                <Link 
                  href="/" 
                  className={`flex md:hidden items-center justify-center transition-colors duration-300 ${
                    scrolled ? '!text-black hover:!text-[#2f9c94]' : '!text-white hover:!text-[#2f9c94]'
                  }`}
                  title="Ir ao Início"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                </Link>

                {/* Logo en cápsula con máscara para rescatar el color teal en estado transparente */}
                <div className="flex-shrink-0 relative h-6 md:h-7 scale-[1.15] origin-left">
                  {/* Logo Base: invertido (blanco) sobre el hero, normal al scrollear */}
                  <img 
                    src="/assets/LOGOS/motta.png" 
                    alt="Motta Brindes" 
                    className={`h-6 md:h-7 w-auto object-contain transition-all duration-500 ${
                      scrolled ? '' : 'brightness-0 invert'
                    }`}
                  />
                  {/* Capa Duplicada (Parche): Se muestra SOLO sobre el hero para rescatar el badge.
                      Usa clip-path para mostrar solo el 48% derecho (donde asume que está "brindes") */}
                  {!scrolled && (
                    <img 
                      src="/assets/LOGOS/motta.png" 
                      alt="Badge parche" 
                      className="absolute inset-0 h-6 md:h-7 w-auto object-contain pointer-events-none"
                      style={{ clipPath: 'inset(0 0 0 52%)' }} 
                    />
                  )}
                </div>
              </div>
              
              {/* PRODUTOS y LUPA MÓVIL */}
              <div className="flex items-center gap-2 md:gap-0 shrink-0">
                <NavDropdowns forceWhiteText={!scrolled} />
                
                {/* Botón Lupa (Solo Móvil) */}
                <button 
                  onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                  className={`flex md:hidden items-center justify-center p-1.5 shrink-0 transition-colors duration-300 ${
                    scrolled ? '!text-black hover:!text-[#2f9c94]' : '!text-white hover:!text-[#2f9c94]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Buscador Desplegable Móvil */}
            {isMobileSearchOpen && (
              <div className="absolute top-[calc(100%+8px)] w-full md:hidden z-50 pointer-events-auto shadow-2xl">
                <SearchBar isScrolled={pathname === '/' ? false : scrolled} />
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}
