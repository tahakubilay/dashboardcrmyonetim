'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { Loader2 } from 'lucide-react'
import { Person } from '@/types'

interface ContractFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ContractFormModal({ open, onClose, onSuccess }: ContractFormModalProps) {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [people, setPeople] = useState<Person[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    related_person_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'draft',
  })

  useEffect(() => {
    fetchPeople()
  }, [])

  const fetchPeople = async () => {
    try {
      const data = await api.get<{ results: Person[] }>('/people/')
      setPeople(data.results || data as any)
    } catch (err) {
      console.error('Failed to fetch people:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/contracts/', formData)
      success('Sözleşme başarıyla oluşturuldu')
      onSuccess()
    } catch (err: any) {
      error(err.response?.data?.detail || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Sözleşme</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Başlık *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                placeholder="İş Sözleşmesi"
              />
            </div>
            <div className="space-y-2">
              <Label>Kişi *</Label>
              <Select
                value={formData.related_person_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, related_person_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kişi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Başlangıç *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Bitiş</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Taslak</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="expired">Süresi Dolmuş</SelectItem>
                  <SelectItem value="terminated">Feshedilmiş</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Kaydediliyor...</> : 'Kaydet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}