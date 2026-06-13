import { Html5Qrcode } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'

const SCANNER_ELEMENT_ID = 'qr-reader'
const CAMERA_ERROR_MESSAGE = 'Please allow camera access to scan QR codes.'

interface QRScannerModalProps {
  onClose: () => void
  onScan: (decodedText: string) => 'success' | 'invalid'
}

function QRScannerModal({ onClose, onScan }: QRScannerModalProps) {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const hasScannedRef = useRef(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [loadingCamera, setLoadingCamera] = useState(false)
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)

  const startCameraWithId = async (cameraId: string) => {
    setLoadingCamera(true)
    setStarted(true)

    try {
      const html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID)
      html5QrCodeRef.current = html5QrCode

      await html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
        (decodedText) => {
          if (hasScannedRef.current) return

          const result = onScan(decodedText)
          if (result === 'invalid') {
            setScanError('Invalid QR code')
            return
          }

          hasScannedRef.current = true
          setScanError(null)
          html5QrCode
            .stop()
            .then(() => html5QrCode.clear())
            .then(onClose)
            .catch(onClose)
        },
        () => {},
      )
      setLoadingCamera(false)
    } catch {
      setCameraError(CAMERA_ERROR_MESSAGE)
      setStarted(false)
      setLoadingCamera(false)
    }
  }

  const requestCameraAndStart = async () => {
    setCameraError(null)
    setScanError(null)
    hasScannedRef.current = false
    setLoadingCamera(true)

    try {
      // This call triggers the browser's camera permission prompt
      const devices = await Html5Qrcode.getCameras()

      if (!devices || devices.length === 0) {
        setCameraError(CAMERA_ERROR_MESSAGE)
        setLoadingCamera(false)
        return
      }

      setCameras(devices)

      // Prefer the back/environment camera by default
      const backCamera = devices.find((d) =>
        /back|rear|environment/i.test(d.label),
      )
      const defaultCamera = backCamera ?? devices[0]
      setSelectedCameraId(defaultCamera.id)

      await startCameraWithId(defaultCamera.id)
    } catch {
      setCameraError(CAMERA_ERROR_MESSAGE)
      setLoadingCamera(false)
    }
  }

  const switchCamera = async (cameraId: string) => {
    setSelectedCameraId(cameraId)
    setLoadingCamera(true)
    setStarted(false)

    const current = html5QrCodeRef.current
    if (current) {
      try {
        await current.stop()
        await current.clear()
      } catch {
        // ignore cleanup errors
      }
    }

    await startCameraWithId(cameraId)
  }

  useEffect(() => {
    return () => {
      html5QrCodeRef.current
        ?.stop()
        .then(() => html5QrCodeRef.current?.clear())
        .catch(() => {})
    }
  }, [])

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {cameraError ? (
          <div className="rounded-xl bg-red-50 px-4 py-6 text-center ring-1 ring-red-100">
            <p className="text-sm font-medium text-red-700">{cameraError}</p>
            <p className="mt-2 text-xs text-red-600">
              Check your browser's site settings to allow camera access, then try again.
            </p>
            <button
              type="button"
              onClick={requestCameraAndStart}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        ) : !started ? (
          <div className="rounded-xl bg-slate-50 px-4 py-8 text-center ring-1 ring-slate-100">
            <p className="mb-4 text-sm text-slate-600">
              Tap below, then allow camera access when your browser asks
            </p>
            <button
              type="button"
              onClick={requestCameraAndStart}
              disabled={loadingCamera}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loadingCamera ? 'Starting camera...' : 'Allow Camera & Start Scanning'}
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-700">Point at a desk QR code</p>

              {cameras.length > 1 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="camera-select" className="text-xs font-medium text-slate-500">
                    Camera:
                  </label>
                  <select
                    id="camera-select"
                    value={selectedCameraId ?? ''}
                    onChange={(e) => switchCamera(e.target.value)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                  >
                    {cameras.map((cam) => (
                      <option key={cam.id} value={cam.id}>
                        {cam.label || cam.id}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {loadingCamera && (
              <div className="mb-2 flex items-center justify-center rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-100">
                Starting camera...
              </div>
            )}

            <div
              id={SCANNER_ELEMENT_ID}
              className="overflow-hidden rounded-xl [&_img]:rounded-lg [&_button]:rounded-lg"
            />
          </div>
        )}

        {scanError && (
          <p className="mt-4 text-center text-sm font-medium text-red-600">{scanError}</p>
        )}
      </div>
    </div>
  )
}

export default QRScannerModal