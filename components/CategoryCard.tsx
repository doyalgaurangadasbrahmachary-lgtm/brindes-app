'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CategoryCard({ tag, slug }: { tag: string, slug: string }) {
  const router = useRouter()
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isClicked) return
    setIsClicked(true)
    
    // Retraso para mostrar la animación pop-up y el color sólido
    setTimeout(() => {
      router.push(`/categoria/${slug}`)
    }, 350)
  }

  return (
    <Link 
      href={`/categoria/${slug}`}
      prefetch={true}
      onClick={handleClick}
      className={`group border border-[#2f9c94] rounded p-6 flex flex-col items-center justify-center text-center h-[90px] transition-all duration-300 transform ${
        isClicked 
          ? 'bg-[#2f9c94] scale-[1.05] shadow-lg shadow-[#2f9c94]/40 z-10 relative' 
          : 'bg-transparent hover:bg-[#2f9c94] shadow-none hover:-translate-y-1'
      }`}
    >
      <h3 className={`text-xs sm:text-[13px] font-semibold tracking-wider transition-colors duration-300 uppercase ${
        isClicked ? 'text-white' : 'text-gray-200 group-hover:text-white'
      }`}>
        {tag}
      </h3>
    </Link>
  )
}
