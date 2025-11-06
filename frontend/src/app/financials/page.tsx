'use client'

import { FinancialRecordFormModal } from '@/components/forms/financial-record-form-modal'
import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { FinancialRecord } from '@/types'
import { Plus, Search, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

export default function FinancialsPage() {
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [summary, setSummary] = useState<any>(null)
  const { success, error } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  

  useEffect(() => {
    fetchRecords()
    fetchSummary()
  }, [])

  const fetchRecords = async () => {
    try {
      const data = await api.get<{ results: FinancialRecord[] }>('/financial-records/')
      setRecords(data.results || data as any)
    } catch (err) {
      error('Mali kayıtlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const data = await api.get<any>('/financial-records/summary/')
      setSummary(data)
    } catch (err) {
      console.error('Failed to fetch summary:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.delete(`/financial-records/${id}/`)
      setRecords(prev => prev.filter(r => r.id !== id))
      success('Kayıt başarıyla silindi')
      fetchSummary() // Refresh summary
    } catch (err) {
      error('Kayıt silinirken hata oluştu')
    }
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || record.type === typeFilter
    return matchesSearch && matchesType
  })

  const columns = [
    {
      header: 'Başlık',
      accessorKey: 'title',
      cell: (row: FinancialRecord) => (
        <span className="font-medium">{row.title}</span>
      ),
    },
    {
      header: 'Tür',
      accessorKey: 'type_display',
      cell: (row: FinancialRecord) => {
        const variants: Record<string, any> = {
          income: 'default',
          expense: 'destructive',
          turnover: 'secondary',
          profit_share: 'outline',
        }
        return (
          <Badge variant={variants[row.type] || 'outline'}>
            {row.type_display}
          </Badge>
        )
      },
    },
    {
      header: 'Tutar',
      accessorKey: 'amount',
      cell: (row: FinancialRecord) => (
        <span className={`font-medium ${
          row.type === 'income' || row.type === 'turnover' 
            ? 'text-green-500' 
            : row.type === 'expense' 
            ? 'text-red-500' 
            : ''
        }`}>
          {formatCurrency(row.amount, row.currency)}
        </span>
      ),
    },
    {
      header: 'Para Birimi',
      accessorKey: 'currency',
      cell: (row: FinancialRecord) => (
        <span className="font-mono text-sm">{row.currency}</span>
      ),
    },
    {
      header: 'Tarih',
      accessorKey: 'date',
      cell: (row: FinancialRecord) => formatDate(row.date),
    },
    {
      header: 'Oluşturma',
      accessorKey: 'created_at',
      cell: (row: FinancialRecord) => formatDate(row.created_at),
    },
  ] as const;

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mali Kayıtlar</h1>
            <p className="text-muted-foreground mt-1">
              Gelir, gider ve ciro kayıtlarınızı yönetin
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Senet
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(summary.total_income || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {formatCurrency(summary.total_expense || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Net Kar</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(summary.net_profit || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Toplam Ciro</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary.total_turnover || 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kayıt ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              <SelectItem value="income">Gelir</SelectItem>
              <SelectItem value="expense">Gider</SelectItem>
              <SelectItem value="turnover">Ciro</SelectItem>
              <SelectItem value="profit_share">Kar Payı</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <DataTable
          columns={[...columns]}
          data={filteredRecords}
          loading={loading}
          onDelete={handleDelete}
        />
      </div>
      {/* Create Modal */}
      {showCreateModal && (
        <FinancialRecordFormModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchRecords()
            fetchSummary()
          }}
        />
      )}

    </ProtectedLayout>
  )
}