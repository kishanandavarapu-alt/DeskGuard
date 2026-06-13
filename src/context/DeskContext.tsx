import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  AWAY_DURATION_MS,
  INITIAL_DESKS,
  SESSION_DURATION_MS,
  STILL_HERE_RESPONSE_MS,
} from '../data/desks'
import type { Desk } from '../types/desk'

interface StillHereState {
  deskId: number
  endsAt: number
}

interface DeskContextValue {
  desks: Desk[]
  now: number
  sessionEndsAt: Record<number, number>
  awayEndsAt: Record<number, number>
  stillHere: StillHereState | null
  updateDesk: (deskId: number, updates: Partial<Desk>) => void
  abandonDesk: (deskId: number) => void
  resetDesk: (deskId: number) => void
  startSessionTimer: (deskId: number) => void
  startAwayTimer: (deskId: number, awayUntilIso: string) => void
  clearStillHere: () => void
  setStillHere: (state: StillHereState | null) => void
  extendSession: (deskId: number) => void
  onSessionExpired: (deskId: number) => void
}

const DeskContext = createContext<DeskContextValue | null>(null)

export function DeskProvider({ children }: { children: ReactNode }) {
  const [desks, setDesks] = useState<Desk[]>(INITIAL_DESKS)
  const [sessionEndsAt, setSessionEndsAt] = useState<Record<number, number>>({})
  const [awayEndsAt, setAwayEndsAt] = useState<Record<number, number>>({})
  const [stillHere, setStillHere] = useState<StillHereState | null>(null)
  const [now, setNow] = useState(Date.now())

  const updateDesk = useCallback((deskId: number, updates: Partial<Desk>) => {
    setDesks((prev) =>
      prev.map((desk) => (desk.id === deskId ? { ...desk, ...updates } : desk)),
    )
  }, [])

  const clearDeskTimers = useCallback((deskId: number) => {
    setSessionEndsAt((prev) => {
      const next = { ...prev }
      delete next[deskId]
      return next
    })
    setAwayEndsAt((prev) => {
      const next = { ...prev }
      delete next[deskId]
      return next
    })
    setStillHere((prev) => (prev?.deskId === deskId ? null : prev))
  }, [])

  const abandonDesk = useCallback(
    (deskId: number) => {
      updateDesk(deskId, { status: 'abandoned', awayUntil: null })
      clearDeskTimers(deskId)
    },
    [updateDesk, clearDeskTimers],
  )

  const resetDesk = useCallback(
    (deskId: number) => {
      updateDesk(deskId, { status: 'free', checkInTime: null, awayUntil: null })
      clearDeskTimers(deskId)
    },
    [updateDesk, clearDeskTimers],
  )

  const startSessionTimer = useCallback((deskId: number) => {
    setSessionEndsAt((prev) => ({
      ...prev,
      [deskId]: Date.now() + SESSION_DURATION_MS,
    }))
    setAwayEndsAt((prev) => {
      const next = { ...prev }
      delete next[deskId]
      return next
    })
  }, [])

  const startAwayTimer = useCallback((deskId: number, awayUntilIso: string) => {
    const parsed = Date.parse(awayUntilIso)
    const endsAt =
      !Number.isNaN(parsed) && parsed > Date.now()
        ? parsed
        : Date.now() + AWAY_DURATION_MS
    setAwayEndsAt((prev) => ({ ...prev, [deskId]: endsAt }))
    setSessionEndsAt((prev) => {
      const next = { ...prev }
      delete next[deskId]
      return next
    })
  }, [])

  const extendSession = useCallback((deskId: number) => {
    setSessionEndsAt((prev) => ({
      ...prev,
      [deskId]: Date.now() + SESSION_DURATION_MS,
    }))
    setStillHere(null)
  }, [])

  const onSessionExpired = useCallback((deskId: number) => {
    setStillHere({ deskId, endsAt: Date.now() + STILL_HERE_RESPONSE_MS })
  }, [])

  const clearStillHere = useCallback(() => {
    setStillHere(null)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    for (const [idStr, endsAt] of Object.entries(sessionEndsAt)) {
      const deskId = Number(idStr)
      const desk = desks.find((d) => d.id === deskId)
      if (
        desk?.status === 'occupied' &&
        now >= endsAt &&
        (!stillHere || stillHere.deskId !== deskId)
      ) {
        onSessionExpired(deskId)
        return
      }
    }

    for (const [idStr, endsAt] of Object.entries(awayEndsAt)) {
      const deskId = Number(idStr)
      const desk = desks.find((d) => d.id === deskId)
      if (desk?.status === 'away' && now >= endsAt) {
        abandonDesk(deskId)
        return
      }
    }

    if (stillHere && now >= stillHere.endsAt) {
      abandonDesk(stillHere.deskId)
    }
  }, [now, desks, sessionEndsAt, awayEndsAt, stillHere, abandonDesk, onSessionExpired])

  const value = useMemo(
    () => ({
      desks,
      now,
      sessionEndsAt,
      awayEndsAt,
      stillHere,
      updateDesk,
      abandonDesk,
      resetDesk,
      startSessionTimer,
      startAwayTimer,
      clearStillHere,
      setStillHere,
      extendSession,
      onSessionExpired,
    }),
    [
      desks,
      now,
      sessionEndsAt,
      awayEndsAt,
      stillHere,
      updateDesk,
      abandonDesk,
      resetDesk,
      startSessionTimer,
      startAwayTimer,
      clearStillHere,
      extendSession,
      onSessionExpired,
    ],
  )

  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>
}

export function useDesks() {
  const context = useContext(DeskContext)
  if (!context) {
    throw new Error('useDesks must be used within a DeskProvider')
  }
  return context
}
