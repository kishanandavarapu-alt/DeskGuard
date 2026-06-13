import type { Desk } from '../types/desk'
import { STATUS_LABELS } from '../types/desk'
import { formatCountdown } from '../data/desks'

interface DeskModalProps {
  desk: Desk
  sessionEndsAt?: number
  awayEndsAt?: number
  now: number
  stillHere: { deskId: number; endsAt: number } | null
  onClose: () => void
  onCheckIn: () => void
  onAway: () => void
  onImBack: () => void
  onStillHereYes: () => void
  onStillHereNo: () => void
}

function DeskModal({
  desk,
  sessionEndsAt,
  awayEndsAt,
  now,
  stillHere,
  onClose,
  onCheckIn,
  onAway,
  onImBack,
  onStillHereYes,
  onStillHereNo,
}: DeskModalProps) {
  const showStillHere = stillHere?.deskId === desk.id
  const sessionCountdown =
    desk.status === 'occupied' && sessionEndsAt ? formatCountdown(sessionEndsAt, now) : null
  const awayCountdown =
    desk.status === 'away' && awayEndsAt ? formatCountdown(awayEndsAt, now) : null
  const responseCountdown = showStillHere
    ? formatCountdown(stillHere.endsAt, now)
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="desk-modal-title"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 id="desk-modal-title" className="text-xl font-bold text-slate-900">
              Desk {desk.id}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Status:{' '}
              <span className="font-medium text-slate-700">{STATUS_LABELS[desk.status]}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {showStillHere ? (
          <div className="space-y-4">
            <p className="text-center text-lg font-semibold text-slate-800">Still here?</p>
            <p className="text-center text-sm text-slate-500">
              Respond within{' '}
              <span className="font-mono font-medium text-slate-700">{responseCountdown}</span>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onStillHereYes}
                className="flex-1 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={onStillHereNo}
                className="flex-1 rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300"
              >
                No
              </button>
            </div>
          </div>
        ) : desk.status === 'free' ? (
          <button
            type="button"
            onClick={onCheckIn}
            className="w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-600"
          >
            Check In
          </button>
        ) : desk.status === 'occupied' ? (
          <div className="space-y-4">
            {sessionCountdown && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-center ring-1 ring-red-100">
                <p className="text-xs font-medium uppercase tracking-wide text-red-600">
                  Session ends in
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-red-700">
                  {sessionCountdown}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={onAway}
              className="w-full rounded-xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-yellow-600"
            >
              Away
            </button>
          </div>
        ) : desk.status === 'away' ? (
          <div className="space-y-4">
            {awayCountdown && (
              <div className="rounded-xl bg-yellow-50 px-4 py-3 text-center ring-1 ring-yellow-100">
                <p className="text-xs font-medium uppercase tracking-wide text-yellow-700">
                  Away until
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-yellow-800">
                  {awayCountdown}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={onImBack}
              className="w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600"
            >
              I&apos;m Back
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-slate-600">
            This desk is abandoned. Please contact the librarian.
          </p>
        )}
      </div>
    </div>
  )
}

export default DeskModal
