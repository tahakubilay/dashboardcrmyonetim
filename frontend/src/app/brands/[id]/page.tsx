'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { Brand, Branch } from '@/types'
import { Loader2, Edit, Trash2, Briefcase, MapPin, Building2 } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'

export default function BrandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error } = useToast()
  const [brand, setBrand] = useState<any>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBrandDetail()
    fetchBranches()
  }, [params.id])

  const fetchBrandDetail = async () => {
    try {
      const data = await api.get<any>(`/brands/${params.id}/`)
      setBrand(data)
    } catch (err) {
      error('Marka bilgileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const data = await api.get<{ results: Branch[] }>(`/brands/${params.id}/branches/`)
      setBranches(data.results || data as any)
    } catch (err) {
      console.error('Failed to fetch branches:', err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu markayı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.delete(`/brands/${params.id}/`)
      success('Marka başarıyla silindi')
      router.push('/brands')
    } catch (err) {
      error('Marka silinirken hata oluştu')
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

  if (!brand) {
    return (
      <ProtectedLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Marka bulunamadı</h2>
          <Button onClick={() => router.push('/brands')}>
            Markalara Dön
          </Button>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{brand.name}</h1>
              <p className="text-muted-foreground mt-1">
                Şirket: {brand.company?.title || brand.company_name}
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
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Şubeler</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(brand.branch_count)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Toplam şube sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Şirket</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">
                {brand.company?.title || brand.company_name}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Bağlı olduğu şirket
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">İletişim</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="truncate">{brand.email || 'E-posta yok'}</p>
                <p className="text-muted-foreground">{brand.phone || 'Telefon yok'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="branches">Şubeler ({branches.length})</TabsTrigger>
            <TabsTrigger value="stats">İstatistikler</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Marka Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Marka Adı</label>
                    <p className="font-medium">{brand.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Şirket</label>
                    <p className="font-medium">{brand.company?.title || brand.company_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">E-posta</label>
                    <p className="font-medium">{brand.email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Telefon</label>
                    <p className="font-medium">{brand.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Vergi No</label>
                    <p className="font-medium font-mono">{brand.tax_number || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Oluşturma Tarihi</label>
                    <p className="font-medium">{formatDate(brand.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branches" className="space-y-4 mt-4">
            {branches.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Henüz şube eklenmemiş
                  </p>
                  <Button asChild>
                    <Link href={`/branches?action=create&brand_id=${brand.id}`}>
                      İlk Şubeyi Ekle
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {branches.map((branch) => (
                  <Card key={branch.id} className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        {branch.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Adres: </span>
                          <span className="font-medium">{branch.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Telefon</span>
                          <span className="font-medium">{branch.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">E-posta</span>
                          <span className="font-medium">{branch.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Çalışan</span>
                          <span className="font-medium">{branch.employee_count || 0}</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4" asChild>
                        <Link href={`/branches/${branch.id}`}>
                          Detayları Gör
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  Detaylı istatistikler yakında eklenecek
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}