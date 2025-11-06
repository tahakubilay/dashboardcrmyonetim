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
import { Company, Brand, Branch, Person } from '@/types'

interface ReportFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ReportFormModal({ open, onClose, onSuccess }: ReportFormModalProps) {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [people, setPeople] = useState<Person[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    report_type: 'monthly',
    scope: 'company',
    report_date: new Date().toISOString().split('T')[0],
    company_id: '',
    brand_id: '',
    branch_id: '',
    person_id: '',
    content: '',
    tags: [] as string[],
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (formData.company_id) {
      fetchBrands(formData.company_id)
    }
  }, [formData.company_id])

  useEffect(() => {
    if (formData.brand_id) {
      fetchBranches(formData.brand_id)
    }
  }, [formData.brand_id])

  useEffect(() => {
    if (formData.branch_id) {
      fetchPeople(formData.branch_id)
    }
  }, [formData.branch_id])

  const fetchCompanies = async () => {
    try {
      const data = await api.get<{ results: Company[] }>('/companies/')
      setCompanies(data.results || data as any)
    } catch (err) {
      console.error('Failed to fetch companies:', err)
    }
  }

  const fetchBrands = async (companyId: string) => {
    try {
      const data = await api.get<{ results: Brand[] }>(`/companies/${companyId}/brands/`)
      setBrands(data.results || data as any)
    } catch (err) {
      console.error('Failed to fetch brands:', err)
    }
  }

  const fetchBranches = async (brandId: string) => {
    try {
      const data = await api.get<{ results: Branch[] }>(`/brands/${brandId}/branches/`)
      setBranches(data.results || data as any)
    } catch (err) {
      console.error('Failed to fetch branches:', err)
    }
  }

  const fetchPeople = async (branchId: string) => {
    try {
      const data = await api.get<{ results: Person[] }>(`/branches/${branchId}/people/`)
      setPeople(data.results || data as any)
    } catch (err) {
      console.error('Failed to fetch people:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: any = {
        title: formData.title,
        report_type: formData.report_type,
        scope: formData.scope,
        report_date: formData.report_date,
        content: formData.content,
        tags: formData.tags,
      }

      // Scope'a göre ilgili ID'yi ekle
      if (formData.scope === 'company') payload.company_id = formData.company_id
      if (formData.scope === 'brand') payload.brand_id = formData.brand_id
      if (formData.scope === 'branch') payload.branch_id = formData.branch_id
      if (formData.scope === 'person') payload.person_id = formData.person_id

      await api.post('/reports/', payload)
      success('Rapor başarıyla oluşturuldu')
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
          <DialogTitle>Yeni Rapor Oluştur</DialogTitle>
          <DialogDescription>
            Rapor bilgilerini doldurun ve kaydedin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Rapor Başlığı *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="Aylık Satış Raporu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report_date">Rapor Tarihi *</Label>
                <Input
                  id="report_date"
                  type="date"
                  value={formData.report_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, report_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report_type">Rapor Türü *</Label>
                <Select
                  value={formData.report_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, report_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Günlük</SelectItem>
                    <SelectItem value="weekly">Haftalık</SelectItem>
                    <SelectItem value="monthly">Aylık</SelectItem>
                    <SelectItem value="yearly">Yıllık</SelectItem>
                    <SelectItem value="custom">Özel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope">Kapsam *</Label>
                <Select
                  value={formData.scope}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    scope: value,
                    company_id: '',
                    brand_id: '',
                    branch_id: '',
                    person_id: ''
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Şirket</SelectItem>
                    <SelectItem value="brand">Marka</SelectItem>
                    <SelectItem value="branch">Şube</SelectItem>
                    <SelectItem value="person">Kişi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dynamic selection based on scope */}
            {formData.scope === 'company' && (
              <div className="space-y-2">
                <Label>Şirket *</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, company_id: value }))}
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
            )}

            {formData.scope === 'brand' && (
              <>
                <div className="space-y-2">
                  <Label>Şirket *</Label>
                  <Select
                    value={formData.company_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, company_id: value, brand_id: '' }))}
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
                <div className="space-y-2">
                  <Label>Marka *</Label>
                  <Select
                    value={formData.brand_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, brand_id: value }))}
                    required
                    disabled={!formData.company_id}
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
              </>
            )}

            {(formData.scope === 'branch' || formData.scope === 'person') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Şirket *</Label>
                    <Select
                      value={formData.company_id}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        company_id: value, 
                        brand_id: '',
                        branch_id: '',
                        person_id: ''
                      }))}
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
                  <div className="space-y-2">
                    <Label>Marka *</Label>
                    <Select
                      value={formData.brand_id}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        brand_id: value,
                        branch_id: '',
                        person_id: ''
                      }))}
                      required
                      disabled={!formData.company_id}
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
                  <Label>Şube *</Label>
                  <Select
                    value={formData.branch_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, branch_id: value, person_id: '' }))}
                    required
                    disabled={!formData.brand_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Şube seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {formData.scope === 'person' && (
              <div className="space-y-2">
                <Label>Kişi *</Label>
                <Select
                  value={formData.person_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, person_id: value }))}
                  required
                  disabled={!formData.branch_id}
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
            )}

            <div className="space-y-2">
              <Label htmlFor="content">İçerik</Label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Rapor içeriği veya açıklaması..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                'Rapor Oluştur'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}