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
import { Branch, Role } from '@/types'

interface PersonFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  person?: any
}

export function PersonFormModal({
  open,
  onClose,
  onSuccess,
  person,
}: PersonFormModalProps) {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [branches, setBranches] = useState<Branch[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [formData, setFormData] = useState({
    full_name: person?.full_name || '',
    role: person?.role?.id || '',
    branch: person?.branch?.id || '',
    national_id: person?.national_id || '',
    phone: person?.phone || '',
    email: person?.email || '',
    iban: person?.iban || '',
    address: person?.address || '',
    is_active: person?.is_active ?? true,
  })

  useEffect(() => {
    fetchBranches()
    fetchRoles()
  }, [])

  const fetchBranches = async () => {
    try {
      const data = await api.get<{ results: Branch[] }>('/branches/')
      setBranches(data.results || data as any)
    } catch (err) {
      console.error('Failed to fetch branches:', err)
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
      if (person) {
        await api.put(`/people/${person.id}/`, formData)
        success('Kişi başarıyla güncellendi')
      } else {
        await api.post('/people/', formData)
        success('Kişi başarıyla oluşturuldu')
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {person ? 'Kişiyi Düzenle' : 'Yeni Kişi Ekle'}
          </DialogTitle>
          <DialogDescription>
            Kişi bilgilerini doldurun ve kaydedin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Ad Soyad *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Ahmet Yılmaz"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, role: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Şube *</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, branch: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Şube seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} ({branch.brand_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="national_id">TC Kimlik No</Label>
                <Input
                  id="national_id"
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleChange}
                  maxLength={11}
                  placeholder="12345678901"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+90 555 555 55 55"
                />
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
                  placeholder="ornek@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  name="iban"
                  value={formData.iban}
                  onChange={handleChange}
                  maxLength={26}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Tam adres..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, is_active: e.target.checked }))
                }
                className="rounded border-muted"
              />
              <Label htmlFor="is_active" className="font-normal cursor-pointer">
                Aktif kişi
              </Label>
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