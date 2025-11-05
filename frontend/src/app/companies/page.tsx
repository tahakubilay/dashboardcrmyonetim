'use client'

import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { DataTable } from '@/components/tables/data-table'
import { CompanyFormModal } from '@/components/forms/company-form-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { Company } from '@/types'
import { Plus, Search, Download } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const data = await api.get<{ results: Company[] }>('/companies/')
      setCompanies(data.results || data as any)
    } catch (err) {
      error('Şirketler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu şirketi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.delete(`/companies/${id}/`)
      setCompanies(prev => prev.filter(c => c.id !== id))
      success('Şirket başarıyla silindi')
    } catch (err) {
      error('Şirket silinirken hata oluştu')
    }
  }

  const handleExport = () => {
    // TODO: Implement export
    success('Export özelliği yakında eklenecek')
  }

  const filteredCompanies = companies.filter(company =>
    company.title.toLowerCase().includes(search.toLowerCase()) ||
    company.tax_number.includes(search)
  )

  const columns = [
    {
      header: 'Şirket Ünvanı',
      accessorKey: 'title',
      cell: (row: Company) => (
        <Link
          href={`/companies/${row.id}`}
          className="font-medium hover:text-primary"
        >
          {row.title}
        </Link>
      ),
    },
    {
      header: 'Vergi No',
      accessorKey: 'tax_number',
    },
    {
      header: 'E-posta',
      accessorKey: 'email',
    },
    {
      header: 'IBAN',
      accessorKey: 'iban',
      cell: (row: Company) => (
        <span className="font-mono text-xs">
          {row.iban || '-'}
        </span>
      ),
    },
    {
      header: 'Marka Sayısı',
      accessorKey: 'brand_count',
      cell: (row: Company) => (
        <span className="text-center">{formatNumber(row.brand_count)}</span>
      ),
    },
    {
      header: 'Durum',
      accessorKey: 'is_active',
      cell: (row: Company) => (
        <Badge variant={row.is_active ? 'default' : 'secondary'}>
          {row.is_active ? 'Aktif' : 'Pasif'}
        </Badge>
      ),
    },
    {
      header: 'Oluşturma',
      accessorKey: 'created_at',
      cell: (row: Company) => formatDate(row.created_at),
    },
  ] as const;

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Şirketler</h1>
            <p className="text-muted-foreground mt-1">
              Tüm şirketlerinizi görüntüleyin ve yönetin
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Şirket
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Şirket ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <DataTable
          columns={[...columns]}
          data={filteredCompanies}
          loading={loading}
          onDelete={handleDelete}
        />

        {/* Create Modal */}
        {showCreateModal && (
          <CompanyFormModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false)
              fetchCompanies()
            }}
          />
        )}
      </div>
    </ProtectedLayout>
  )
}
