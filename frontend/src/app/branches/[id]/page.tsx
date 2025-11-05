'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { Person } from '@/types'
import { Loader2, Edit, Trash2, MapPin, Users, UserCheck, TrendingUp } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'

export default function BranchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error } = useToast()
  const [branch, setBranch] = useState<any>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBranchDetail()
    fetchPeople()
  }, [params.id])

  const fetchBranchDetail = async () => {
    try {
      const data = await api.get<any>(`/branches/${params.id}/`)
      setBranch(data)
    } catch (err) {
      error('Şube bilgileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchPeople = async () => {
    try {
      const data = await api.get<{ results: Person[] }>(`/branches/${params.id}/people/`)
      setPeople(data.results || data as any)
    } catch (err) {
      console.error('Failed to fetch people:', err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu şubeyi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.delete(`/branches/${params.id}/`)
      success('Şube başarıyla silindi')
      router.push('/branches')
    } catch (err) {
      error('Şube silinirken hata oluştu')
    }
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ProtectedLayout>
    )
  }

  if (!branch) {
    return (
      <ProtectedLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Şube bulunamadı</h2>
          <Button onClick={() => router.push('/branches')}>
            Şubelere Dön
          </Button>
        </div>
      </ProtectedLayout>
    )
  }

  // Group people by role
  const peopleByRole = people.reduce((acc, person) => {
    const role = person.role_name || 'Diğer'
    if (!acc[role]) acc[role] = []
    acc[role].push(person)
    return acc
  }, {} as Record<string, Person[]>)

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{branch.name}</h1>
              <p className="text-muted-foreground mt-1">
                {branch.brand?.name || branch.brand_name} • {branch.company_name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kişi</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{people.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Çalışan</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {people.filter(p => p.role_name === 'Çalışan').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Yatırımcı</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {people.filter(p => p.role_name === 'Yatırımcı').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ortak</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {people.filter(p => p.role_name === 'Ortak').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="people">Kişiler ({people.length})</TabsTrigger>
            <TabsTrigger value="documents">Dokümanlar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Şube Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Şube Adı</label>
                    <p className="font-medium">{branch.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Marka</label>
                    <p className="font-medium">{branch.brand?.name || branch.brand_name}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-muted-foreground">Adres</label>
                    <p className="font-medium">{branch.address}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Telefon</label>
                    <p className="font-medium">{branch.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">E-posta</label>
                    <p className="font-medium">{branch.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">SGK Numarası</label>
                    <p className="font-medium font-mono">{branch.sgk_number || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Oluşturma Tarihi</label>
                    <p className="font-medium">{formatDate(branch.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="people" className="space-y-4 mt-4">
            {people.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Henüz kişi eklenmemiş
                  </p>
                  <Button asChild>
                    <Link href={`/people?action=create&branch_id=${branch.id}`}>
                      İlk Kişiyi Ekle
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              Object.entries(peopleByRole).map(([role, rolePeople]) => (
                <Card key={role}>
                  <CardHeader>
                    <CardTitle className="text-lg">{role} ({rolePeople.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {rolePeople.map((person) => (
                        <Link
                          key={person.id}
                          href={`/people/${person.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border hover:border-primary transition-colors"
                        >
                          <div>
                            <p className="font-medium">{person.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {person.email || person.phone || 'İletişim bilgisi yok'}
                            </p>
                          </div>
                          <Badge variant={person.is_active ? 'default' : 'secondary'}>
                            {person.is_active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  Dokümanlar yakında eklenecek
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}
