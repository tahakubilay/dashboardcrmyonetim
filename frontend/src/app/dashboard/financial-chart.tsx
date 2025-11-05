'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { api } from '@/lib/api'
import { TrendingUp } from 'lucide-react'

interface ChartData {
  month: string
  income: number
  expense: number
  profit: number
}

export function FinancialChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [])

  const fetchChartData = async () => {
    try {
      const response = await api.get<any[]>('/financial-records/chart-data/')
      
      // Transform data for chart
      const chartData: ChartData[] = response.map((item) => ({
        month: new Date(item.month).toLocaleDateString('tr-TR', { month: 'short' }),
        income: item.type === 'income' ? item.total : 0,
        expense: item.type === 'expense' ? item.total : 0,
        profit: 0,
      }))

      setData(chartData)
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
      // Mock data for demo
      setData([
        { month: 'Oca', income: 45000, expense: 28000, profit: 17000 },
        { month: 'Şub', income: 52000, expense: 31000, profit: 21000 },
        { month: 'Mar', income: 48000, expense: 29000, profit: 19000 },
        { month: 'Nis', income: 61000, expense: 35000, profit: 26000 },
        { month: 'May', income: 55000, expense: 32000, profit: 23000 },
        { month: 'Haz', income: 67000, expense: 38000, profit: 29000 },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Mali Durum
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="line" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="line">Trend</TabsTrigger>
            <TabsTrigger value="bar">Karşılaştırma</TabsTrigger>
          </TabsList>
          
          <TabsContent value="line" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a26" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2521',
                    border: '1px solid #1f2a26',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Gelir"
                  stroke="#00c896"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Gider"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="bar" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a26" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2521',
                    border: '1px solid #1f2a26',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="income" name="Gelir" fill="#00c896" />
                <Bar dataKey="expense" name="Gider" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}