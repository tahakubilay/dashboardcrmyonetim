'use client'

import { useState, useEffect } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { DataTable } from '@/components/tables/data-table'
import { PersonFormModal } from '@/components/forms/person-form-modal'
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
import { Person, Role } from '@/types'
import { Plus, Search, Download, Filter } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    fetchPeople()
    fetchRoles()
  }, [])

  const fetchPeople = async () => {
    try {
      const data = await api.get<{ results: Person[] }>('/people/')
      setPeople(data.results || data as any)
    } catch (err) {
      error('Kişiler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const data = await api.get<{ results: Role[] }>('/roles/')
      setRoles(data.results || data as any)
    } catch (err) {
      console.error('Failed to fetch roles:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kişiyi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.delete(`/people/${id}/`)
      setPeople(prev => prev.filter(p => p.id !== id))
      success('Kişi başarıyla silindi')
    } catch (err) {
      error('Kişi silinirken hata oluştu')
    }
  }

  const filteredPeople = people.filter(person => {
    const matchesSearch = 
      person.full_name.toLowerCase().includes(search.toLowerCase()) ||
      person.email?.toLowerCase().includes(search.toLowerCase()) ||
      person.phone?.includes(search)

    const matchesRole = roleFilter === 'all' || person.role_name === roleFilter

    return matchesSearch && matchesRole
  })

  const columns = [
    {
      header: 'Ad Soyad',
      accessorKey: 'full_name',
      cell: (row: Person) => (
        <Link
          href={`/people/${row.id}`}
          className="font-medium hover:text-primary"
        >
          {row.full_name}
        </Link>
      ),
    },
    {
      header: 'Rol',
      accessorKey: 'role_name',
      cell: (row: Person) => (
        <Badge variant="outline">{row.role_name}</Badge>
      ),
    },
    {
      header: 'TC Kimlik',
      accessorKey: 'masked_national_id',
      cell: (row: Person) => (
        <span className="font-mono text-sm">
          {row.masked_national_id || '-'}
        </span>
      ),
    },
    {
      header: 'Telefon',
      accessorKey: 'phone',
      cell: (row: Person) => row.phone || '-',
    },
    {
      header: 'E-posta',
      accessorKey: 'email',
      cell: (row: Person) => row.email || '-',
    },
    {
      header: 'Şube',
      accessorKey: 'branch_name',
    },
    {
      header: 'Durum',
      accessorKey: 'is_active',
      cell: (row: Person) => (
        <Badge variant={row.is_active ? 'default' : 'secondary'}>
          {row.is_active ? 'Aktif' : 'Pasif'}
        </Badge>
      ),
    },
    {
      header: 'Oluşturma',
      accessorKey: 'created_at',
      cell: (row: Person) => formatDate(row.created_at),
    },
  ]

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Kişiler</h1>
            <p className="text-muted-foreground mt-1">
              Çalışan, yatırımcı ve ortakları yönetin
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kişi
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="İsim, e-posta veya telefon ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Rol filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Roller</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.display_name}>
                  {role.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground">Toplam Kişi</p>
            <p className="text-2xl font-bold mt-1">{people.length}</p>
          </div>
          {roles.slice(0, 3).map((role) => (
            <div key={role.id} className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">{role.display_name}</p>
              <p className="text-2xl font-bold mt-1">
                {people.filter(p => p.role_name === role.display_name).length}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredPeople}
          loading={loading}
          onDelete={handleDelete}
        />

        {/* Create Modal */}
        {showCreateModal && (
          <PersonFormModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false)
              fetchPeople()
            }}
          />
        )}
      </div>
    </ProtectedLayout>
  )
}