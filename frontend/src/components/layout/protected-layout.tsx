'use client'

import { useAuth } from '@/hooks/useAuth'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'
import { Breadcrumbs } from './breadcrumbs'
import { Loader2 } from 'lucide-react'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isLoading } = useAuth(true)

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Sidebar />
      
      <main className="lg:ml-64 pt-16 min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <Breadcrumbs />
          {children}
        </div>
      </main>
    </div>
  )
}