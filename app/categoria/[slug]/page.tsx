import React, { Suspense } from 'react'
import fs from 'fs'
import path from 'path'
import { slugify } from '@/utils/slugify'
import { Product } from '@/components/ProductCard'
import ProductGrid from '@/components/ProductGrid'

export async function generateStaticParams() {
  try {
    const tagsSet = new Set<string>()
    const maestraPath = path.join(process.cwd(), 'src', 'data', 'maestra.json')
    if (fs.existsSync(maestraPath)) {
      const fileData = await fs.promises.readFile(maestraPath, 'utf8')
      const products: Product[] = JSON.parse(fileData)
      products.forEach(p => {
        if (p.tags && Array.isArray(p.tags)) {
          p.tags.forEach(t => tagsSet.add(slugify(t)))
        }
      })
    }

    const categoriesPath = path.join(process.cwd(), 'public', 'assets', 'data', 'categories.json')
    if (fs.existsSync(categoriesPath)) {
      const catData = await fs.promises.readFile(categoriesPath, 'utf8')
      const jsonObj = JSON.parse(catData)
      if (jsonObj.az) jsonObj.az.forEach((c: any) => tagsSet.add(slugify(c.title)))
      if (jsonObj.segmentos) jsonObj.segmentos.forEach((c: any) => tagsSet.add(slugify(c.title)))
      if (jsonObj.especiais) jsonObj.especiais.forEach((c: any) => tagsSet.add(slugify(c.title)))
    }

    // FORZAMOS LÍNEA VITAL: Inyectar el slug "brindes" pase lo que pase como comodín para atrapar URLs de respaldo.
    tagsSet.add('brindes')

    return Array.from(tagsSet).map(slug => ({ slug: slug }))
  } catch (e) {
    console.error("Error generating static params", e)
    return []
  }
}

export default async function CategoriaPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  let filteredProducts: Product[] = []
  let originalCategoryName = params.slug.replace(/-/g, ' ').replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))

  try {
    const maestraPath = path.join(process.cwd(), 'src', 'data', 'maestra.json')
    const categoriesPath = path.join(process.cwd(), 'public', 'assets', 'data', 'categories.json')

    if (fs.existsSync(maestraPath) && fs.existsSync(categoriesPath)) {
      const productsData = await fs.promises.readFile(maestraPath, 'utf8')
      const catDataRaw = await fs.promises.readFile(categoriesPath, 'utf8')
      
      const products: Product[] = JSON.parse(productsData)
      const catData = JSON.parse(catDataRaw)

      // 1. Obtener el NOMBRE REAL de la categoría desde el Source of Truth (categories.json)
      const allCategories = [
        ...(catData.az || []),
        ...(catData.segmentos || []),
        ...(catData.especiais || [])
      ]

      const currentCategory = allCategories.find(c => slugify(c.title) === params.slug)
      const officialTitle = currentCategory ? currentCategory.title : null

      if (officialTitle) {
        originalCategoryName = officialTitle
        // 2. FILTRADO QUIRÚRGICO: Coincidencia exacta de etiqueta
        filteredProducts = products.filter(p =>
          p.tags && Array.isArray(p.tags) && p.tags.includes(officialTitle)
        )
      } else {
        // Fallback: si no está en el menú, buscamos cualquier tag que slugifique exactamente igual
        filteredProducts = products.filter(p =>
          p.tags && Array.isArray(p.tags) && p.tags.some(t => slugify(t) === params.slug)
        )
      }
    }
  } catch (e) {
    console.error("Error reading JSON", e)
  }

  return (
    <Suspense fallback={<div className="p-10 text-center">Carregando categoria...</div>}>
      <ProductGrid initialData={filteredProducts} title={originalCategoryName} />
    </Suspense>
  )
}