import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * EmptyState Component
 * UX: Provides clear feedback when no data is available
 * Accessibility: Includes proper semantic HTML and ARIA labels
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div 
      className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div className="mb-4 text-gray-400" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        {title}
      </h3>
      {description && (
        <p className="mb-6 text-sm text-gray-600 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
