import { useState } from 'react'
import { DeskProvider } from './context/DeskContext'
import DeskQRCodes from './components/DeskQRCodes'
import LibrarianDashboard from './components/LibrarianDashboard'
import LibraryMap from './components/LibraryMap'

type View = 'student' | 'librarian' | 'qr-codes'

function App() {
  const [view, setView] = useState<View>('student')

  return (
    <DeskProvider>
      <div className="min-h-svh bg-slate-50">
        <nav className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-lg font-bold text-slate-900">DeskGuard</span>
            <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setView('student')}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                  view === 'student'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student View
              </button>
              <button
                type="button"
                onClick={() => setView('librarian')}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                  view === 'librarian'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Librarian Dashboard
              </button>
              <button
                type="button"
                onClick={() => setView('qr-codes')}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                  view === 'qr-codes'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Desk QR Codes
              </button>
            </div>
          </div>
        </nav>

        {view === 'student' && <LibraryMap />}
        {view === 'librarian' && <LibrarianDashboard />}
        {view === 'qr-codes' && <DeskQRCodes />}
      </div>
    </DeskProvider>
  )
}

export default App
