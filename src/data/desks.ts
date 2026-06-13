import type { Desk } from '../types/desk'

export const INITIAL_DESKS: Desk[] = [
  { id: 1, status: 'free', checkInTime: null, awayUntil: null },
  { id: 2, status: 'occupied', checkInTime: '2026-06-13T08:30:00', awayUntil: null },
  { id: 3, status: 'away', checkInTime: '2026-06-13T09:00:00', awayUntil: '2026-06-13T11:00:00' },
  { id: 4, status: 'abandoned', checkInTime: '2026-06-13T07:15:00', awayUntil: null },
  { id: 5, status: 'occupied', checkInTime: '2026-06-13T09:45:00', awayUntil: null },
  { id: 6, status: 'free', checkInTime: null, awayUntil: null },
  { id: 7, status: 'away', checkInTime: '2026-06-13T10:00:00', awayUntil: '2026-06-13T12:30:00' },
  { id: 8, status: 'free', checkInTime: null, awayUntil: null },
  { id: 9, status: 'abandoned', checkInTime: '2026-06-13T06:50:00', awayUntil: null },
  { id: 10, status: 'occupied', checkInTime: '2026-06-13T08:00:00', awayUntil: null },
  { id: 11, status: 'free', checkInTime: null, awayUntil: null },
  { id: 12, status: 'away', checkInTime: '2026-06-13T09:30:00', awayUntil: '2026-06-13T10:30:00' },
  { id: 13, status: 'occupied', checkInTime: '2026-06-13T07:45:00', awayUntil: null },
  { id: 14, status: 'abandoned', checkInTime: '2026-06-13T07:00:00', awayUntil: null },
  { id: 15, status: 'away', checkInTime: '2026-06-13T08:15:00', awayUntil: '2026-06-13T09:45:00' },
  { id: 16, status: 'free', checkInTime: null, awayUntil: null },
]

export const SESSION_DURATION_MS = 30_000
export const AWAY_DURATION_MS = 10_000
export const STILL_HERE_RESPONSE_MS = 5_000

export const DESK_COUNT = INITIAL_DESKS.length

export function getDeskQrValue(deskId: number): string {
  return `desk-${deskId}`
}

export function parseDeskQrValue(text: string): number | null {
  const match = text.trim().match(/^desk-(\d+)$/i)
  if (!match) return null
  const id = Number.parseInt(match[1], 10)
  if (Number.isNaN(id) || id < 1 || id > DESK_COUNT) return null
  return id
}

export function formatCountdown(endsAt: number, now: number): string {
  const seconds = Math.max(0, Math.ceil((endsAt - now) / 1000))
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
