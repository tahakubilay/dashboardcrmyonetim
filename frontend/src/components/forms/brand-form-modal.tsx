'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { Loader2 } from 'lucide-react'
import { Company } from '@/types'

interface BrandFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  brand?: any
}

export function BrandFormModal({
  open,
  onClose,
  onSuccess,
  brand,
}: BrandFormModalProps) {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [formData, setFormData] = useState({
    name: brand?.name || '',
    company: brand?.company?.id || brand?.company || '',
    tax_number: brand?.tax_number || '',
    email: brand?.email || '',
    phone: brand?.phone || '',
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const data = await api.get<{ results: Company[] }>('/companies/')
      setCompanies(data.results || data as any)
    } catch (err) {
      console.error('Failed to fetch companies:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (brand) {
        await api.put(`/brands/${brand.id}/`, formData)
        success('Marka başarıyla güncellendi')
      } else {
        await api.post('/brands/', formData)
        success('Marka başarıyla oluşturuldu')
      }
      onSuccess()
    } catch (err: any) {
      error(err.response?.data?.detail || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {brand ? 'Markayı Düzenle' : 'Yeni Marka Ekle'}
          </DialogTitle>
          <DialogDescription>
            Marka bilgilerini doldurun ve kaydedin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Marka Adı *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="ABC Yazılım"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Şirket *</Label>
                <Select
                  value={formData.company}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, company: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Şirket seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="marka@sirket.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+90 212 555 0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_number">Vergi Numarası</Label>
              <Input
                id="tax_number"
                name="tax_number"
                value={formData.tax_number}
                onChange={handleChange}
                maxLength={10}
                placeholder="1234567890"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}