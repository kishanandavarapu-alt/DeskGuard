export type DeskStatus = 'free' | 'occupied' | 'away' | 'abandoned'

export interface Desk {
  id: number
  status: DeskStatus
  checkInTime: string | null
  awayUntil: string | null
}

export const STATUS_COLORS: Record<DeskStatus, string> = {
  free: '#22c55e',
  occupied: '#ef4444',
  away: '#eab308',
  abandoned: '#9ca3af',
}

export const STATUS_LABELS: Record<DeskStatus, string> = {
  free: 'Free',
  occupied: 'Occupied',
  away: 'Away',
  abandoned: 'Abandoned',
}

