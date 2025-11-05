'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { Contract, PromissoryNote } from '@/types'
import { 
  Loader2, Edit, Trash2, User, FileText, Receipt, 
  Wallet, Mail, Phone, MapPin 
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'

export default function PersonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error } = useToast()
  const [person, setPerson] = useState<any>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [notes, setNotes] = useState<PromissoryNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPersonDetail()
    fetchContracts()
    fetchNotes()
  }, [params.id])

  const fetchPersonDetail = async () => {
    try {
      const data = await api.get<any>(`/people/${params.id}/`)
      setPerson(data)
    } catch (err) {
      error('Kişi bilgileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchContracts = async () => {
    try {
      const data = await api.get<Contract[]>(`/people/${params.id}/contracts/`)
      setContracts(data)
    } catch (err) {
      console.error('Failed to fetch contracts:', err)
    }
  }

  const fetchNotes = async () => {
    try {
      const data = await api.get<PromissoryNote[]>(`/people/${params.id}/promissory-notes/`)
      setNotes(data)
    } catch (err) {
      console.error('Failed to fetch notes:', err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu kişiyi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await api.delete(`/people/${params.id}/`)
      success('Kişi başarıyla silindi')
      router.push('/people')
    } catch (err) {
      error('Kişi silinirken hata oluştu')
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

  if (!person) {
    return (
      <ProtectedLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Kişi bulunamadı</h2>
          <Button onClick={() => router.push('/people')}>
            Kişilere Dön
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
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{person.full_name}</h1>
                <Badge variant={person.is_active ? 'default' : 'secondary'}>
                  {person.is_active ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {person.role?.display_name} • {person.branch?.name}
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
              <CardTitle className="text-sm font-medium">Sözleşmeler</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{person.contracts_count || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Senetler</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{person.promissory_notes_count || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mali Kayıtlar</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{person.financial_records_count || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="contracts">Sözleşmeler ({contracts.length})</TabsTrigger>
            <TabsTrigger value="notes">Senetler ({notes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Kişisel Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Ad Soyad</label>
                    <p className="font-medium">{person.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Rol</label>
                    <p className="font-medium">{person.role?.display_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">TC Kimlik No</label>
                    <p className="font-medium font-mono">{person.masked_national_id || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">IBAN</label>
                    <p className="font-medium font-mono text-sm">{person.masked_iban || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>İletişim Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {person.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                  {person.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{person.email}</span>
                    </div>
                  )}
                  {person.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <span>{person.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organizasyon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Şube</span>
                  <Link href={`/branches/${person.branch?.id}`} className="font-medium hover:text-primary">
                    {person.branch?.name}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marka</span>
                  <span className="font-medium">{person.branch?.brand?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Şirket</span>
                  <span className="font-medium">{person.company_name}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="mt-4">
            {contracts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    Henüz sözleşme bulunmuyor
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <Card key={contract.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{contract.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {contract.contract_number}
                          </p>
                        </div>
                        <Badge>{contract.status_display}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Başlangıç: </span>
                          <span>{formatDate(contract.start_date)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bitiş: </span>
                          <span>{contract.end_date ? formatDate(contract.end_date) : '-'}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                        <Link href={`/contracts/${contract.id}`}>
                          Detayları Gör
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            {notes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    Henüz senet bulunmuyor
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <Card key={note.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{note.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {note.note_number}
                          </p>
                        </div>
                        <Badge variant={note.is_overdue ? 'destructive' : 'default'}>
                          {note.payment_status_display}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tutar: </span>
                          <span className="font-medium">{formatCurrency(note.amount)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Vade: </span>
                          <span>{formatDate(note.due_date)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}
