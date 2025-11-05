'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { Company, Brand } from '@/types'
import { Loader2, Edit, Trash2, Building2, TrendingUp, Users } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error } = useToast()
  const [company, setCompany] = useState<Company | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanyDetail()
    fetchBrands()
  }, [params.id])

  const fetchCompanyDetail = async () => {
    try {
      const data = await api.get<Company>(`/companies/${params.id}/`)
      setCompany(data)
    } catch (err) {
      error('Şirket bilgileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchBrands = async () => {
    try {
      const data = await api.get<{ results: Brand[] }>(`/companies/${params.id}/brands/`)
      setBrands(data.results || data as any)
    } catch (err) {
      console.error('Failed to fetch brands:', err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu şirketi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.delete(`/companies/${params.id}/`)
      success('Şirket başarıyla silindi')
      router.push('/companies')
    } catch (err) {
      error('Şirket silinirken hata oluştu')
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

  if (!company) {
    return (
      <ProtectedLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Şirket bulunamadı</h2>
          <Button onClick={() => router.push('/companies')}>
            Şirketlere Dön
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
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{company.title}</h1>
              <p className="text-muted-foreground mt-1">
                Vergi No: {company.tax_number}
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
              <CardTitle className="text-sm font-medium">Markalar</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(company.brand_count)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Toplam marka sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Şubeler</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(company.total_branches)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Toplam şube sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Çalışanlar</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(company.total_people)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Toplam kişi sayısı
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="brands">Markalar ({brands.length})</TabsTrigger>
            <TabsTrigger value="financials">Mali Durum</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Şirket Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Şirket Ünvanı
                    </label>
                    <p className="font-medium">{company.title}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Vergi Numarası
                    </label>
                    <p className="font-medium font-mono">{company.tax_number}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      E-posta
                    </label>
                    <p className="font-medium">{company.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      IBAN
                    </label>
                    <p className="font-medium font-mono text-sm">
                      {company.iban || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Durum
                    </label>
                    <div className="mt-1">
                      <Badge variant={company.is_active ? 'default' : 'secondary'}>
                        {company.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Oluşturma Tarihi
                    </label>
                    <p className="font-medium">{formatDate(company.created_at)}</p>
                  </div>
                </div>
                {company.description && (
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Açıklama
                    </label>
                    <p className="mt-1">{company.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="brands" className="space-y-4 mt-4">
            {brands.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Henüz marka eklenmemiş
                  </p>
                  <Button asChild>
                    <Link href="/brands?action=create&company_id=">
                      İlk Markayı Ekle
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {brands.map((brand) => (
                  <Card key={brand.id} className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">{brand.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Şube Sayısı</span>
                          <span className="font-medium">{brand.branch_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">E-posta</span>
                          <span className="font-medium">{brand.email || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Telefon</span>
                          <span className="font-medium">{brand.phone || '-'}</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4" asChild>
                        <Link href={`/brands/${brand.id}`}>
                          Detayları Gör
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="financials" className="mt-4">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  Mali durum özeti yakında eklenecek
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}