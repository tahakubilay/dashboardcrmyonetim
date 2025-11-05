'use client'

import { useEffect, useState } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { OverdueNotes } from '@/components/dashboard/overdue-notes'
import { FinancialChart } from '@/components/dashboard/financial-chart'
import { api } from '@/lib/api'
import { DashboardStats } from '@/types'
import { Loader2 } from 'lucide-react'
import {
  Building2,
  Briefcase,
  MapPin,
  Users,
  FileText,
  TrendingUp,
} from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await api.get<DashboardStats>('/dashboard/stats/')
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
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

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Kurumsal yönetim panelinize hoş geldiniz
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Şirketler"
            value={stats?.companies_count || 0}
            icon={Building2}
            href="/companies"
            change={+5.2}
          />
          <StatsCard
            title="Markalar"
            value={stats?.brands_count || 0}
            icon={Briefcase}
            href="/brands"
            change={+2.1}
          />
          <StatsCard
            title="Şubeler"
            value={stats?.branches_count || 0}
            icon={MapPin}
            href="/branches"
            change={+8.3}
          />
          <StatsCard
            title="Kişiler"
            value={stats?.people_count || 0}
            icon={Users}
            href="/people"
            change={+12.5}
          />
          <StatsCard
            title="Raporlar"
            value={stats?.reports_count || 0}
            icon={FileText}
            href="/reports"
            change={+3.2}
          />
          <StatsCard
            title="Mali Kayıtlar"
            value={stats?.financial_records_count || 0}
            icon={TrendingUp}
            href="/financials"
            change={+15.8}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Chart */}
            <FinancialChart />

            {/* Recent Activity */}
            <RecentActivity />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions />

            {/* Overdue Notes */}
            <OverdueNotes notes={stats?.overdue_notes || []} />
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}