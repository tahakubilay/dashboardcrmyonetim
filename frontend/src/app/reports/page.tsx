'use client'

import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { DataTable } from '@/components/tables/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api'
import { Report } from '@/types'
import { Plus, Search, Download, FileText, Filter } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [scopeFilter, setScopeFilter] = useState<string>('all')
  const { success, error } = useToast()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const data = await api.get<{ results: Report[] }>('/reports/')
      setReports(data.results || data as any)
    } catch (err) {
      error('Raporlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.delete(`/reports/${id}/`)
      setReports(prev => prev.filter(r => r.id !== id))
      success('Rapor başarıyla silindi')
    } catch (err) {
      error('Rapor silinirken hata oluştu')
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || report.report_type === typeFilter
    const matchesScope = scopeFilter === 'all' || report.scope === scopeFilter
    return matchesSearch && matchesType && matchesScope
  })

  const columns = [
    {
      header: 'Başlık',
      accessorKey: 'title',
      cell: (row: Report) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.title}</span>
        </div>
      ),
    },
    {
      header: 'Tür',
      accessorKey: 'report_type_display',
      cell: (row: Report) => (
        <Badge variant="outline">{row.report_type_display}</Badge>
      ),
    },
    {
      header: 'Kapsam',
      accessorKey: 'scope_display',
      cell: (row: Report) => (
        <Badge variant="secondary">{row.scope_display}</Badge>
      ),
    },
    {
      header: 'Rapor Tarihi',
      accessorKey: 'report_date',
      cell: (row: Report) => formatDate(row.report_date),
    },
    {
      header: 'Oluşturan',
      accessorKey: 'created_by_name',
    },
    {
      header: 'Dosya',
      accessorKey: 'file',
      cell: (row: Report) => (
        row.file ? (
          <Button variant="ghost" size="sm" asChild>
            <a href={row.file} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )
      ),
    },
    {
      header: 'Oluşturma',
      accessorKey: 'created_at',
      cell: (row: Report) => formatDate(row.created_at),
    },
  ] as const;

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Raporlar</h1>
            <p className="text-muted-foreground mt-1">
              Tüm raporlarınızı görüntüleyin ve oluşturun
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Rapor
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rapor ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              <SelectItem value="daily">Günlük</SelectItem>
              <SelectItem value="weekly">Haftalık</SelectItem>
              <SelectItem value="monthly">Aylık</SelectItem>
              <SelectItem value="yearly">Yıllık</SelectItem>
              <SelectItem value="custom">Özel</SelectItem>
            </SelectContent>
          </Select>

          <Select value={scopeFilter} onValueChange={setScopeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kapsam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kapsamlar</SelectItem>
              <SelectItem value="company">Şirket</SelectItem>
              <SelectItem value="brand">Marka</SelectItem>
              <SelectItem value="branch">Şube</SelectItem>
              <SelectItem value="person">Kişi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <DataTable
          columns={[...columns]}
          data={filteredReports}
          loading={loading}
          onDelete={handleDelete}
        />
      </div>
    </ProtectedLayout>
  )
}