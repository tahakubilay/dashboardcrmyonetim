'use client'

import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { DataTable } from '@/components/tables/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { PromissoryNote } from '@/types'
import { Plus, Search, Download, AlertTriangle } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

export default function PromissoryNotesPage() {
  const [notes, setNotes] = useState<PromissoryNote[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { success, error } = useToast()

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const data = await api.get<{ results: PromissoryNote[] }>('/promissory-notes/')
      setNotes(data.results || data as any)
    } catch (err) {
      error('Senetler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu senedi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.delete(`/promissory-notes/${id}/`)
      setNotes(prev => prev.filter(n => n.id !== id))
      success('Senet başarıyla silindi')
    } catch (err) {
      error('Senet silinirken hata oluştu')
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.note_number.toLowerCase().includes(search.toLowerCase())
  )

  const overdueCount = notes.filter(n => n.is_overdue).length

  const columns = [
    {
      header: 'Senet',
      accessorKey: 'title',
      cell: (row: PromissoryNote) => (
        <div className="flex items-center gap-2">
          {row.is_overdue && <AlertTriangle className="h-4 w-4 text-destructive" />}
          <div>
            <p className="font-medium">{row.title}</p>
            <p className="text-sm text-muted-foreground">{row.note_number}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Durum',
      accessorKey: 'payment_status_display',
      cell: (row: PromissoryNote) => {
        const variants: Record<string, any> = {
          pending: 'outline',
          paid: 'default',
          overdue: 'destructive',
        }
        return (
          <Badge variant={variants[row.payment_status] || 'outline'}>
            {row.payment_status_display}
          </Badge>
        )
      },
    },
    {
      header: 'Tutar',
      accessorKey: 'amount',
      cell: (row: PromissoryNote) => (
        <span className="font-medium">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      header: 'Vade Tarihi',
      accessorKey: 'due_date',
      cell: (row: PromissoryNote) => (
        <span className={row.is_overdue ? 'text-destructive font-medium' : ''}>
          {formatDate(row.due_date)}
        </span>
      ),
    },
    {
      header: 'İlgili',
      accessorKey: 'related_entity',
      cell: (row: PromissoryNote) => (
        <span className="text-sm text-muted-foreground">{row.related_entity}</span>
      ),
    },
  ] as const;

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Senetler</h1>
            <p className="text-muted-foreground mt-1">
              Tüm senetlerinizi görüntüleyin ve yönetin
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Senet
            </Button>
          </div>
        </div>

        {/* Alert for overdue */}
        {overdueCount > 0 && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Vadesi Geçmiş Senetler
              </p>
              <p className="text-sm text-muted-foreground">
                {overdueCount} adet senetin vadesi geçmiş durumda
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Senet ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <DataTable
          columns={[...columns]}
          data={filteredNotes}
          loading={loading}
          onDelete={handleDelete}
        />
      </div>
    </ProtectedLayout>
  )
}