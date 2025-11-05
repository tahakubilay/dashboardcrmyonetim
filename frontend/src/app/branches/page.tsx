'use client'

import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { DataTable } from '@/components/tables/data-table'
import { BranchFormModal } from '@/components/forms/branch-form-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { Branch } from '@/types'
import { Plus, Search, Download, MapPin } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const data = await api.get<{ results: Branch[] }>('/branches/')
      setBranches(data.results || data as any)
    } catch (err) {
      error('Şubeler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu şubeyi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.delete(`/branches/${id}/`)
      setBranches(prev => prev.filter(b => b.id !== id))
      success('Şube başarıyla silindi')
    } catch (err) {
      error('Şube silinirken hata oluştu')
    }
  }

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(search.toLowerCase()) ||
    branch.address.toLowerCase().includes(search.toLowerCase()) ||
    branch.brand_name.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      header: 'Şube Adı',
      accessorKey: 'name',
      cell: (row: Branch) => (
        <Link
          href={`/branches/${row.id}`}
          className="font-medium hover:text-primary flex items-center gap-2"
        >
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {row.name}
        </Link>
      ),
    },
    {
      header: 'Marka',
      accessorKey: 'brand_name',
    },
    {
      header: 'Şirket',
      accessorKey: 'company_name',
    },
    {
      header: 'Adres',
      accessorKey: 'address',
      cell: (row: Branch) => (
        <span className="text-sm text-muted-foreground truncate block max-w-xs">
          {row.address}
        </span>
      ),
    },
    {
      header: 'Telefon',
      accessorKey: 'phone',
    },
    {
      header: 'Çalışan',
      accessorKey: 'employee_count',
      cell: (row: Branch) => (
        <span className="text-center inline-block w-full">
          {formatNumber(row.employee_count || 0)}
        </span>
      ),
    },
    {
      header: 'Oluşturma',
      accessorKey: 'created_at',
      cell: (row: Branch) => formatDate(row.created_at),
    },
  ] as const;

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Şubeler</h1>
            <p className="text-muted-foreground mt-1">
              Tüm şubelerinizi görüntüleyin ve yönetin
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Şube
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Şube, marka veya adres ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <DataTable
          columns={[...columns]}
          data={filteredBranches}
          loading={loading}
          onDelete={handleDelete}
        />

        {/* Create Modal */}
        {showCreateModal && (
          <BranchFormModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false)
              fetchBranches()
            }}
          />
        )}
      </div>
    </ProtectedLayout>
  )
}
