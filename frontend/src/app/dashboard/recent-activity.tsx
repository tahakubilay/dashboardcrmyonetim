'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { Activity, FileText, Building2, Users } from 'lucide-react'

interface AuditLog {
  id: string
  actor_name: string
  action: string
  object_type: string
  timestamp: string
}

const iconMap: Record<string, any> = {
  Company: Building2,
  Brand: Building2,
  Branch: Building2,
  Person: Users,
  Report: FileText,
}

const actionMap: Record<string, string> = {
  create: 'oluşturdu',
  update: 'güncelledi',
  delete: 'sildi',
}

export function RecentActivity() {
  const [activities, setActivities] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const data = await api.get<AuditLog[]>('/dashboard/recent-activity/')
      setActivities(data)
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Son Aktiviteler
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Yükleniyor...
          </div>
        ) : activities.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Henüz aktivite bulunmuyor
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = iconMap[activity.object_type] || Activity
              const action = actionMap[activity.action] || activity.action

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.actor_name}</span>{' '}
                      {action}{' '}
                      <span className="text-muted-foreground">
                        {activity.object_type}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}