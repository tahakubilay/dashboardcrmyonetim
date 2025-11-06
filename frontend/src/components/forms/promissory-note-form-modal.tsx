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

interface PromissoryNoteFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PromissoryNoteFormModal({ open, onClose, onSuccess }: PromissoryNoteFormModalProps) {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [people, setPeople] = useState<Person[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    due_date: '',
    related_person_id: '',
    payment_status: 'pending',
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
      await api.post('/promissory-notes/', formData)
      success('Senet başarıyla oluşturuldu')
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
          <DialogTitle>Yeni Senet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Başlık *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                placeholder="Yatırım Senedi"
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
                <Label>Tutar *</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label>Vade Tarihi *</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  required
                />
              </div>
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