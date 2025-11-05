'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { useSidebarStore } from '@/lib/store'
import {
  Building2,
  Briefcase,
  MapPin,
  Users,
  FileText,
  FileCheck,
  Receipt,
  Wallet,
  LayoutDashboard,
  Settings,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Şirketler',
    href: '/companies',
    icon: Building2,
  },
  {
    title: 'Markalar',
    href: '/brands',
    icon: Briefcase,
  },
  {
    title: 'Şubeler',
    href: '/branches',
    icon: MapPin,
  },
  {
    title: 'Kişiler',
    href: '/people',
    icon: Users,
  },
  {
    title: 'Raporlar',
    href: '/reports',
    icon: FileText,
  },
  {
    title: 'Sözleşmeler',
    href: '/contracts',
    icon: FileCheck,
  },
  {
    title: 'Senetler',
    href: '/promissory-notes',
    icon: Receipt,
  },
  {
    title: 'Mali Kayıtlar',
    href: '/financials',
    icon: Wallet,
  },
  {
    title: 'Ayarlar',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, close } = useSidebarStore()

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close Button (Mobile) */}
        <div className="flex justify-end p-2 lg:hidden">
          <Button variant="ghost" size="icon" onClick={close}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-full px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      close()
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    'hover:bg-primary/10 hover:text-primary',
                    isActive
                      ? 'bg-primary text-white hover:bg-primary hover:text-white'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Quick Stats Widget */}
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h4 className="text-sm font-semibold mb-2">Hızlı İstatistikler</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Aktif Şirketler</span>
                <span className="font-semibold text-foreground">12</span>
              </div>
              <div className="flex justify-between">
                <span>Toplam Çalışan</span>
                <span className="font-semibold text-foreground">245</span>
              </div>
              <div className="flex justify-between">
                <span>Bu Ay Rapor</span>
                <span className="font-semibold text-foreground">18</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 px-3 text-xs text-muted-foreground">
            <p>Versiyon 1.0.0</p>
            <p className="mt-1">© 2024 Tüm hakları saklıdır.</p>
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}
