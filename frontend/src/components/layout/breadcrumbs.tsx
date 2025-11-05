'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href: string
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  companies: 'Şirketler',
  brands: 'Markalar',
  branches: 'Şubeler',
  people: 'Kişiler',
  reports: 'Raporlar',
  contracts: 'Sözleşmeler',
  'promissory-notes': 'Senetler',
  financials: 'Mali Kayıtlar',
  settings: 'Ayarlar',
}

export function Breadcrumbs() {
  const pathname = usePathname()
  
  const paths = pathname.split('/').filter(Boolean)
  
  const breadcrumbs: BreadcrumbItem[] = paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/')
    const label = routeLabels[path] || path
    
    return { label, href }
  })

  if (breadcrumbs.length === 0 || pathname === '/dashboard') {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link
        href="/dashboard"
        className="hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((breadcrumb, index) => (
        <Fragment key={breadcrumb.href}>
          <ChevronRight className="h-4 w-4" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              href={breadcrumb.href}
              className="hover:text-foreground transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  )
}

