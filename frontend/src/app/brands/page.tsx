'use client'

import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { DataTable } from '@/components/tables/data-table'
import { BrandFormModal } from '@/components/forms/brand-form-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { Brand } from '@/types'
import { Plus, Search, Download } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const data = await api.get<{ results: Brand[] }>('/brands/')
      setBrands(data.results || data as any)
    } catch (err) {
      error('Markalar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu markayı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.delete(`/brands/${id}/`)
      setBrands(prev => prev.filter(b => b.id !== id))
      success('Marka başarıyla silindi')
    } catch (err) {
      error('Marka silinirken hata oluştu')
    }
  }

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(search.toLowerCase()) ||
    brand.company_name.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      header: 'Marka Adı',
      accessorKey: 'name',
      cell: (row: Brand) => (
        <Link
          href={`/brands/${row.id}`}
          className="font-medium hover:text-primary"
        >
          {row.name}
        </Link>
      ),
    },
    {
      header: 'Şirket',
      accessorKey: 'company_name',
      cell: (row: Brand) => (
        <Link
          href={`/companies/${row.company_id}`}
          className="text-muted-foreground hover:text-primary"
        >
          {row.company_name}
        </Link>
      ),
    },
    {
      header: 'E-posta',
      accessorKey: 'email',
      cell: (row: Brand) => row.email || '-',
    },
    {
      header: 'Telefon',
      accessorKey: 'phone',
      cell: (row: Brand) => row.phone || '-',
    },
    {
      header: 'Şube Sayısı',
      accessorKey: 'branch_count',
      cell: (row: Brand) => (
        <span className="text-center inline-block w-full">
          {formatNumber(row.branch_count)}
        </span>
      ),
    },
    {
      header: 'Oluşturma',
      accessorKey: 'created_at',
      cell: (row: Brand) => formatDate(row.created_at),
    },
  ]

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Markalar</h1>
            <p className="text-muted-foreground mt-1">
              Tüm markalarınızı görüntüleyin ve yönetin
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Marka
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Marka veya şirket ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredBrands}
          loading={loading}
          onDelete={handleDelete}
        />

        {/* Create Modal */}
        {showCreateModal && (
          <BrandFormModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false)
              fetchBrands()
            }}
          />
        )}
      </div>
    </ProtectedLayout>
  )
}

