import { useCallback, useEffect, useRef, useState } from 'react'
import { useDesks } from '../context/DeskContext'
import { AWAY_DURATION_MS, parseDeskQrValue } from '../data/desks'
import { STATUS_COLORS, STATUS_LABELS, type Desk, type DeskStatus } from '../types/desk'
import DeskModal from './DeskModal'
import QRScannerModal from './QRScannerModal'

const LEGEND_ITEMS: { status: DeskStatus; label: string }[] = [
  { status: 'free', label: STATUS_LABELS.free },
  { status: 'occupied', label: STATUS_LABELS.occupied },
  { status: 'away', label: STATUS_LABELS.away },
  { status: 'abandoned', label: STATUS_LABELS.abandoned },
]

function LibraryMap() {
  const {
    desks,
    now,
    sessionEndsAt,
    awayEndsAt,
    stillHere,
    updateDesk,
    abandonDesk,
    startSessionTimer,
    startAwayTimer,
    extendSession,
    clearStillHere,
  } = useDesks()

  const [selectedDeskId, setSelectedDeskId] = useState<number | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const selectedDesk = desks.find((d) => d.id === selectedDeskId) ?? null

  const checkInDesk = useCallback(
    (deskId: number) => {
      updateDesk(deskId, {
        status: 'occupied',
        checkInTime: new Date().toISOString(),
        awayUntil: null,
      })
      startSessionTimer(deskId)
      clearStillHere()
    },
    [updateDesk, startSessionTimer, clearStillHere],
  )

  const closeScanner = useCallback(() => setShowScanner(false), [])

  const handleQrScan = useCallback(
    (decodedText: string): 'success' | 'invalid' => {
      const deskId = parseDeskQrValue(decodedText)
      if (deskId === null || !desks.some((d) => d.id === deskId)) {
        return 'invalid'
      }
      checkInDesk(deskId)
      return 'success'
    },
    [desks, checkInDesk],
  )

  useEffect(() => {
    if (stillHere) {
      setSelectedDeskId(stillHere.deskId)
    }
  }, [stillHere])

  const prevStatusRef = useRef<DeskStatus | null>(null)
  useEffect(() => {
    if (!selectedDesk) {
      prevStatusRef.current = null
      return
    }
    if (
      prevStatusRef.current !== null &&
      prevStatusRef.current !== 'abandoned' &&
      selectedDesk.status === 'abandoned'
    ) {
      setSelectedDeskId(null)
    }
    prevStatusRef.current = selectedDesk.status
  }, [selectedDesk])

  const handleDeskClick = (desk: Desk) => {
    setSelectedDeskId(desk.id)

    if (desk.status === 'occupied' && !sessionEndsAt[desk.id]) {
      startSessionTimer(desk.id)
    }

    if (desk.status === 'away' && !awayEndsAt[desk.id]) {
      const awayUntil =
        desk.awayUntil ?? new Date(Date.now() + AWAY_DURATION_MS).toISOString()
      startAwayTimer(desk.id, awayUntil)
    }
  }

  const handleCheckIn = () => {
    if (!selectedDeskId) return
    checkInDesk(selectedDeskId)
  }

  const handleAway = () => {
    if (!selectedDeskId) return
    const awayUntil = new Date(Date.now() + AWAY_DURATION_MS).toISOString()
    updateDesk(selectedDeskId, { status: 'away', awayUntil })
    startAwayTimer(selectedDeskId, awayUntil)
    clearStillHere()
  }

  const handleImBack = () => {
    if (!selectedDeskId) return
    updateDesk(selectedDeskId, { status: 'occupied', awayUntil: null })
    startSessionTimer(selectedDeskId)
    clearStillHere()
  }

  const handleStillHereYes = () => {
    if (!stillHere) return
    extendSession(stillHere.deskId)
  }

  const handleStillHereNo = () => {
    if (!stillHere) return
    abandonDesk(stillHere.deskId)
    setSelectedDeskId(null)
  }

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            DeskGuard
          </h1>
          <p className="mt-2 text-sm text-slate-500">Library desk availability map</p>
        </header>

        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-slate-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m14 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          Scan QR to Check In
        </button>

        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {desks.map((desk) => (
            <button
              key={desk.id}
              type="button"
              onClick={() => handleDeskClick(desk)}
              className="aspect-square rounded-xl text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              style={{ backgroundColor: STATUS_COLORS[desk.status] }}
            >
              Desk {desk.id}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200">
          {LEGEND_ITEMS.map(({ status, label }) => (
            <div key={status} className="flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-md"
                style={{ backgroundColor: STATUS_COLORS[status] }}
              />
              <span className="text-sm text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedDesk && (
        <DeskModal
          desk={selectedDesk}
          sessionEndsAt={sessionEndsAt[selectedDesk.id]}
          awayEndsAt={awayEndsAt[selectedDesk.id]}
          now={now}
          stillHere={stillHere}
          onClose={() => setSelectedDeskId(null)}
          onCheckIn={handleCheckIn}
          onAway={handleAway}
          onImBack={handleImBack}
          onStillHereYes={handleStillHereYes}
          onStillHereNo={handleStillHereNo}
        />
      )}

      {showScanner && <QRScannerModal onClose={closeScanner} onScan={handleQrScan} />}
    </div>
  )
}

export default LibraryMap
