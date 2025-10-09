/**
 * Format currency in INR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(mrp: number, sellingPrice: number): number {
  if (mrp <= sellingPrice) return 0
  return Math.round(((mrp - sellingPrice) / mrp) * 100)
}

/**
 * Format stock status
 */
export function formatStockStatus(stock: number): {
  label: string
  variant: 'default' | 'destructive' | 'secondary' | 'outline'
} {
  if (stock === 0) {
    return { label: 'Out of Stock', variant: 'destructive' }
  }
  if (stock < 10) {
    return { label: `Only ${stock} left`, variant: 'secondary' }
  }
  return { label: 'In Stock', variant: 'default' }
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}
