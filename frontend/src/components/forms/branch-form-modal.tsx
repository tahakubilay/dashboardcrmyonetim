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
import { Brand } from '@/types'

interface BranchFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  branch?: any
}

export function BranchFormModal({
  open,
  onClose,
  onSuccess,
  branch,
}: BranchFormModalProps) {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [formData, setFormData] = useState({
    name: branch?.name || '',
    brand: branch?.brand?.id || branch?.brand || '',
    address: branch?.address || '',
    phone: branch?.phone || '',
    email: branch?.email || '',
    sgk_number: branch?.sgk_number || '',
  })

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const data = await api.get<{ results: Brand[] }>('/brands/')
      setBrands(data.results || data as any)
    } catch (err) {
      console.error('Failed to fetch brands:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (branch) {
        await api.put(`/branches/${branch.id}/`, formData)
        success('Şube başarıyla güncellendi')
      } else {
        await api.post('/branches/', formData)
        success('Şube başarıyla oluşturuldu')
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
            {branch ? 'Şubeyi Düzenle' : 'Yeni Şube Ekle'}
          </DialogTitle>
          <DialogDescription>
            Şube bilgilerini doldurun ve kaydedin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Şube Adı *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Merkez Şube"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marka *</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, brand: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Marka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adres *</Label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Tam adres..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+90 212 555 0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="sube@sirket.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sgk_number">SGK Numarası</Label>
                <Input
                  id="sgk_number"
                  name="sgk_number"
                  value={formData.sgk_number}
                  onChange={handleChange}
                  placeholder="SGK-001"
                />
              </div>
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