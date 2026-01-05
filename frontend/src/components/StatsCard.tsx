import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  color?: string
  subtitle?: string
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, color = 'primary', subtitle }: StatsCardProps) {
  const colorClasses = {
    primary: 'from-blue-50 to-blue-100 text-blue-600',
    success: 'from-green-50 to-green-100 text-green-600',
    warning: 'from-amber-50 to-amber-100 text-amber-600',
    danger: 'from-red-50 to-red-100 text-red-600',
    info: 'from-purple-50 to-purple-100 text-purple-600',
  }

  const trendColorClasses = trendUp 
    ? 'text-green-600 bg-green-50' 
    : 'text-red-600 bg-red-50'

  return (
    <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-gray-100">
      <CardContent className="p-7">
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
            <p className="text-4xl font-bold text-gray-900 mb-3">{value}</p>
            {trend && (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${trendColorClasses}`}>
                  {trendUp ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span className="text-xs font-semibold">{trend}</span>
                </div>
                {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
              <Icon className="h-7 w-7" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
