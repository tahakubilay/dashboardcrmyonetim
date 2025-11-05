'use client'

import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { DataTable } from '@/components/tables/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { Contract } from '@/types'
import { Plus, Search, Download, FileCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { success, error } = useToast()

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      const data = await api.get<{ results: Contract[] }>('/contracts/')
      setContracts(data.results || data as any)
    } catch (err) {
      error('Sözleşmeler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu sözleşmeyi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.delete(`/contracts/${id}/`)
      setContracts(prev => prev.filter(c => c.id !== id))
      success('Sözleşme başarıyla silindi')
    } catch (err) {
      error('Sözleşme silinirken hata oluştu')
    }
  }

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(search.toLowerCase()) ||
    contract.contract_number.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      header: 'Sözleşme',
      accessorKey: 'title',
      cell: (row: Contract) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-sm text-muted-foreground">{row.contract_number}</p>
        </div>
      ),
    },
    {
      header: 'Durum',
      accessorKey: 'status_display',
      cell: (row: Contract) => {
        const variants: Record<string, any> = {
          draft: 'outline',
          active: 'default',
          expired: 'destructive',
          terminated: 'secondary',
        }
        return (
          <Badge variant={variants[row.status] || 'outline'}>
            {row.status_display}
          </Badge>
        )
      },
    },
    {
      header: 'İlgili',
      accessorKey: 'related_entity',
      cell: (row: Contract) => (
        <span className="text-sm text-muted-foreground">{row.related_entity}</span>
      ),
    },
    {
      header: 'Başlangıç',
      accessorKey: 'start_date',
      cell: (row: Contract) => formatDate(row.start_date),
    },
    {
      header: 'Bitiş',
      accessorKey: 'end_date',
      cell: (row: Contract) => row.end_date ? formatDate(row.end_date) : '-',
    },
    {
      header: 'Aktif',
      accessorKey: 'is_active',
      cell: (row: Contract) => (
        <Badge variant={row.is_active ? 'default' : 'secondary'}>
          {row.is_active ? 'Evet' : 'Hayır'}
        </Badge>
      ),
    },
  ] as const;

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Sözleşmeler</h1>
            <p className="text-muted-foreground mt-1">
              Tüm sözleşmelerinizi görüntüleyin ve yönetin
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Sözleşme
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sözleşme ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <DataTable
          columns={[...columns]}
          data={filteredContracts}
          loading={loading}
          onDelete={handleDelete}
        />
      </div>
    </ProtectedLayout>
  )
}
