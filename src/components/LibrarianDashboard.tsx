import { useMemo, useState } from 'react'
import { useDesks } from '../context/DeskContext'
import { formatCountdown } from '../data/desks'
import { STATUS_COLORS, STATUS_LABELS, type Desk, type DeskStatus } from '../types/desk'

type FilterMode = 'all' | 'abandoned'

function StatusBadge({ status }: { status: DeskStatus }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
      style={{ backgroundColor: STATUS_COLORS[status] }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

function getTimeRemaining(
  desk: Desk,
  now: number,
  sessionEndsAt: Record<number, number>,
  awayEndsAt: Record<number, number>,
  stillHere: { deskId: number; endsAt: number } | null,
): string {
  if (stillHere?.deskId === desk.id) {
    return `Respond: ${formatCountdown(stillHere.endsAt, now)}`
  }
  if (desk.status === 'occupied' && sessionEndsAt[desk.id]) {
    return formatCountdown(sessionEndsAt[desk.id], now)
  }
  if (desk.status === 'away' && awayEndsAt[desk.id]) {
    return formatCountdown(awayEndsAt[desk.id], now)
  }
  return '—'
}

function LibrarianDashboard() {
  const { desks, now, sessionEndsAt, awayEndsAt, stillHere, resetDesk } = useDesks()
  const [filter, setFilter] = useState<FilterMode>('all')

  const filteredDesks = useMemo(() => {
    if (filter === 'abandoned') {
      return desks.filter((desk) => desk.status === 'abandoned')
    }
    return desks
  }, [desks, filter])

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Librarian Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor and manage all library desks</p>
        </header>

        <div className="mb-6 inline-flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Desks
          </button>
          <button
            type="button"
            onClick={() => setFilter('abandoned')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'abandoned'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Abandoned Only
          </button>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-700">Desk ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Time Remaining</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDesks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No abandoned desks found.
                    </td>
                  </tr>
                ) : (
                  filteredDesks.map((desk) => (
                    <tr key={desk.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">Desk {desk.id}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={desk.status} />
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {getTimeRemaining(desk, now, sessionEndsAt, awayEndsAt, stillHere)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => resetDesk(desk.id)}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                        >
                          Reset
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400 sm:hidden">
          Swipe horizontally to see all columns
        </p>
      </div>
    </div>
  )
}

export default LibrarianDashboard
