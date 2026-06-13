import { QRCodeSVG } from 'qrcode.react'
import { DESK_COUNT, getDeskQrValue, INITIAL_DESKS } from '../data/desks'

function DeskQRCodes() {
  const deskIds = INITIAL_DESKS.map((desk) => desk.id)

  return (
    <div className="px-4 py-8 print:py-4">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Desk QR Codes</h1>
            <p className="mt-1 text-sm text-slate-500">
              Print and place these codes on physical desks for check-in
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 print:hidden"
          >
            Print QR Codes
          </button>
        </header>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 print:grid-cols-4 print:gap-3">
          {deskIds.map((deskId) => {
            const value = getDeskQrValue(deskId)
            return (
              <div
                key={deskId}
                className="flex flex-col items-center rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 print:break-inside-avoid print:shadow-none print:ring-slate-300"
              >
                <QRCodeSVG value={value} size={120} level="M" includeMargin />
                <p className="mt-3 text-sm font-semibold text-slate-900">Desk {deskId}</p>
                <p className="mt-0.5 font-mono text-xs text-slate-400">{value}</p>
              </div>
            )
          })}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 print:hidden">
          {DESK_COUNT} desk codes generated
        </p>
      </div>
    </div>
  )
}

export default DeskQRCodes
