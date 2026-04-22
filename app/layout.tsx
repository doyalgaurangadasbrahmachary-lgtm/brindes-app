import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Notepad from '@/components/Notepad'
import { NotepadProvider } from '@/context/NotepadContext'

export const metadata: Metadata = {
  title: 'Motta Brindes | O Seu Parceiro Estratégico',
  description: 'Catálogo oficial da Motta Brindes. Entregamos compromisso e soluções práticas para o sucesso do seu negócio.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <NotepadProvider>
          <Header />
          <main className="brindes-container">
            {children}
          </main>
          {/* Notepad flotante — disponible en todas las rutas */}
          <Notepad />
        </NotepadProvider>
      </body>
    </html>
  )
}
