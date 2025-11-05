'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const actions = [
  { label: 'Yeni Şirket', href: '/companies?action=create' },
  { label: 'Yeni Marka', href: '/brands?action=create' },
  { label: 'Yeni Şube', href: '/branches?action=create' },
  { label: 'Yeni Kişi', href: '/people?action=create' },
  { label: 'Yeni Rapor', href: '/reports?action=create' },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="w-full justify-start"
            asChild
          >
            <a href={action.href}>
              <Plus className="h-4 w-4 mr-2" />
              {action.label}
            </a>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
