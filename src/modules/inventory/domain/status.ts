import type { ExpirySeverity, ExpiryStatus } from './types'

interface AlertInfo {
  severity: ExpirySeverity
  status: 'open' | 'dismissed'
}

export function getExpiryStatus(alerts: AlertInfo[]): ExpiryStatus {
  const openAlerts = alerts.filter((alert) => alert.status === 'open')
  if (openAlerts.length === 0) return 'ok'
  if (openAlerts.some((alert) => alert.severity === 'critical')) return 'critical'
  return 'warning'
}
