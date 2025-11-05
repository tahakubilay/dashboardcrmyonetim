export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_superuser: boolean
  date_joined?: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface Company {
  id: string
  title: string
  tax_number: string
  email: string
  iban?: string
  description?: string
  is_active: boolean
  brand_count: number
  total_branches: number
  total_people: number
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  name: string
  tax_number?: string
  phone?: string
  email?: string
  branch_count: number
  company: string
  company_id?: string
  company_name: string
  created_at: string
}

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  email: string
  sgk_number?: string
  brand_name: string
  company_name: string
  employee_count: number
  brand?: {
    id: string
    name: string
  }
  created_at: string
}

export interface Role {
  id: string
  name: string
  display_name: string
  description?: string
  permissions?: Record<string, any>
}

export interface Person {
  id: string
  full_name: string
  masked_national_id?: string
  national_id?: string
  phone?: string
  email?: string
  role_name: string
  branch_name: string
  company_name: string
  is_active: boolean
  role?: Role
  branch?: Branch
  address?: string
  iban?: string
  masked_iban?: string
  contracts_count?: number
  promissory_notes_count?: number
  financial_records_count?: number
  created_at: string
}

export interface Report {
  id: string
  title: string
  report_type: string
  report_type_display: string
  scope: string
  scope_display: string
  report_date: string
  file?: string
  tags?: string[]
  created_by_name: string
  created_at: string
}

export interface Contract {
  id: string
  title: string
  contract_number: string
  status: string
  status_display: string
  start_date: string
  end_date?: string
  is_active: boolean
  related_entity: string
  created_at: string
}

export interface PromissoryNote {
  id: string
  title: string
  note_number: string
  amount: number
  due_date: string
  payment_status: string
  payment_status_display: string
  is_overdue: boolean
  related_entity: string
  created_at: string
}

export interface FinancialRecord {
  id: string
  title: string
  type: string
  type_display: string
  amount: number
  currency: string
  currency_display: string
  date: string
  created_at: string
}

export interface DashboardStats {
  companies_count: number
  brands_count: number
  branches_count: number
  people_count: number
  reports_count: number
  contracts_count: number
  promissory_notes_count: number
  financial_records_count: number
  recent_companies: Company[]
  recent_reports: Report[]
  overdue_notes: PromissoryNote[]
}

export interface ApiResponse<T> {
  count?: number
  next?: string
  previous?: string
  results?: T[]
  data?: T
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}