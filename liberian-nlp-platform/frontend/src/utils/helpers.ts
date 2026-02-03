/**
 * Format numbers with locale-specific formatting
 */
export function formatNumber(num: number): string {
  return num.toLocaleString()
}

/**
 * Format text by replacing underscores with spaces and capitalizing
 */
export function formatText(text: string): string {
  return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Get status color classes based on status type
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    safe: 'bg-green-100 text-green-800',
    vulnerable: 'bg-yellow-100 text-yellow-800',
    endangered: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800'
  }
  
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = window.setTimeout(() => func(...args), wait)
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}