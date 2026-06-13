import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'

const SCANNER_ELEMENT_ID = 'qr-reader'
const CAMERA_ERROR_MESSAGE = 'Please allow camera access to scan QR codes.'

interface QRScannerModalProps {
  onClose: () => void
  onScan: (decodedText: string) => 'success' | 'invalid'
}

function QRScannerModal({ onClose, onScan }: QRScannerModalProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const hasScannedRef = useRef(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)

  useEffect(() => {
    hasScannedRef.current = false
    setCameraError(null)
    setScanError(null)

    let cancelled = false
    let scanner: Html5QrcodeScanner | null = null

    const initScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras()
        if (cancelled) return

        if (cameras.length === 0) {
          setCameraError(CAMERA_ERROR_MESSAGE)
          return
        }

        scanner = new Html5QrcodeScanner(
          SCANNER_ELEMENT_ID,
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
          false,
        )
        scannerRef.current = scanner

        scanner.render(
          (decodedText) => {
            if (hasScannedRef.current) return

            const result = onScan(decodedText)
            if (result === 'invalid') {
              setScanError('Invalid QR code')
              return
            }

            hasScannedRef.current = true
            setScanError(null)
            scanner
              ?.clear()
              .then(onClose)
              .catch(onClose)
          },
          () => {},
        )
      } catch {
        if (!cancelled) {
          setCameraError(CAMERA_ERROR_MESSAGE)
        }
      }
    }

    initScanner()

    return () => {
      cancelled = true
      scannerRef.current = null
      scanner?.clear().catch(() => {})
    }
  }, [onClose, onScan])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-scanner-title"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 id="qr-scanner-title" className="text-xl font-bold text-slate-900">
              Scan QR to Check In
            </h2>
            <p className="mt-1 text-sm text-slate-500">Point your camera at a desk QR code</p>
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

        {cameraError ? (
          <div className="rounded-xl bg-red-50 px-4 py-6 text-center ring-1 ring-red-100">
            <p className="text-sm font-medium text-red-700">{cameraError}</p>
            <p className="mt-2 text-xs text-red-600">
              Check your browser settings and reload the page to try again.
            </p>
          </div>
        ) : (
          <div
            id={SCANNER_ELEMENT_ID}
            className="overflow-hidden rounded-xl [&_img]:rounded-lg [&_button]:rounded-lg"
          />
        )}

        {scanError && (
          <p className="mt-4 text-center text-sm font-medium text-red-600">{scanError}</p>
        )}
      </div>
    </div>
  )
}

export default QRScannerModal
