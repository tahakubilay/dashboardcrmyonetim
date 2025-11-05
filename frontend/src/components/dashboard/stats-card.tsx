import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  href: string
  change?: number
}

export function StatsCard({ title, value, icon: Icon, href, change }: StatsCardProps) {
  const isPositive = change && change > 0

  return (
    <Link href={href}>
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(value)}</div>
          {change !== undefined && (
            <div className="flex items-center text-xs mt-1">
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(change)}%
              </span>
              <span className="text-muted-foreground ml-1">bu aydan</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

