import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useQuery } from '@tanstack/react-query'
import {
  Upload, Camera, Cloud, Thermometer, Droplets, Wind,
  Sun, AlertTriangle, CheckCircle2, ChevronRight, X, Brain, Shield,
  Sprout, BarChart2, Calendar, Info, MapPin, Globe, Loader2, Sparkles, Check
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../lib/translations'
import api from '../lib/api'
import { getSeverityColor, formatDate } from '../lib/utils'

// ─── High-Fidelity Vector Line-Art SVGs ─────────────────────────────

const ElegantWheatStalk = () => (
  <svg className="w-36 h-36 text-[#D0E9D4]/40 absolute right-4 bottom-0 pointer-events-none select-none overflow-visible" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M20 100 C 35 75, 48 50, 52 15" />
    <path d="M52 15 C 50 13, 45 17, 42 21 C 45 25, 50 23, 52 15" fill="currentColor" fillOpacity="0.05" />
    <path d="M52 20 C 54 18, 59 22, 62 26 C 59 30, 54 28, 52 20" fill="currentColor" fillOpacity="0.05" />
    <path d="M50 29 C 47 26, 42 30, 39 35 C 42 39, 47 37, 50 29" fill="currentColor" fillOpacity="0.05" />
    <path d="M51 35 C 53 32, 59 36, 61 41 C 58 45, 53 43, 51 35" fill="currentColor" fillOpacity="0.05" />
    <path d="M48 45 C 45 42, 40 46, 37 51 C 40 55, 45 53, 48 45" fill="currentColor" fillOpacity="0.05" />
    <path d="M49 51 C 51 48, 57 52, 59 57 C 56 61, 51 59, 49 51" fill="currentColor" fillOpacity="0.05" />
    <path d="M46 61 C 43 58, 38 62, 35 67 C 38 71, 43 69, 46 61" fill="currentColor" fillOpacity="0.05" />
    <path d="M47 67 C 49 64, 55 68, 57 73 C 54 77, 49 75, 47 67" fill="currentColor" fillOpacity="0.05" />
  </svg>
)

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-[#2D6A47]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
)

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-[#2D6A47]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.905 0-5.54-1.03-7.598-2.74M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const ThinUploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-[#2D6A47]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
)

const MicroscopeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#7A9080]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6M12 3v12M12 15a3 3 0 1 1-6 0c0-3 3-3 3-6v9M12 9a4 4 0 0 1 8 0M6 21h12" />
  </svg>
)

const WeatherSunCloudIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-white/25">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V17.25c0-.621-.504-1.125-1.125-1.125h-12.75c-.621 0-1.125.504-1.125 1.125V18Z" opacity="0.7" />
  </svg>
)

// ─── Weather Count-Up Numerical Counter ───────────────────────────
function TempCounter({ targetTemp }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = Math.round(targetTemp) || 28
    if (end <= 0) {
      setCount(end)
      return
    }
    const duration = 600
    const step = Math.ceil(end / (duration / 16)) // ~60fps
    
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [targetTemp])

  return <span className="font-mono font-bold text-5xl tracking-tight text-white">{count}</span>
}

// ─── Crop Disease Detection Card ─────────────────────────────────
function DiseaseUploadSection({ onScanComplete }) {
  const { t } = useTranslation()
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError]       = useState(null)
  const [done, setDone]         = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)

  const onDrop = useCallback((files) => {
    if (!files.length) return
    setFile(files[0])
    setPreview(URL.createObjectURL(files[0]))
    setError(null)
    setDone(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1,
    disabled: uploading || analyzing,
  })

  const reset = () => {
    setFile(null); setPreview(null); setError(null); setDone(false); stopCamera()
  }

  const startCamera = async () => {
    setCameraActive(true)
    setError(null)
    setFile(null)
    setPreview(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Could not access camera. Please check permissions.')
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setStream(null)
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    canvas.toBlob((blob) => {
      if (blob) {
        const capturedFile = new File([blob], `crop_scan_${Date.now()}.jpg`, { type: 'image/jpeg' })
        setFile(capturedFile)
        setPreview(URL.createObjectURL(capturedFile))
        stopCamera()
      }
    }, 'image/jpeg', 0.95)
  }

  const handleDetect = async () => {
    if (!file) return
    setError(null)
    setUploading(true)

    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data: uploadData } = await api.post('/disease/upload', fd)
      setUploading(false)
      setAnalyzing(true)

      const { data: result } = await api.post('/disease/analyze', {
        scanId: uploadData.scanId,
      })
      setDone(true)
      onScanComplete(result.scan)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Detection failed'
      setError(msg)
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const isBusy = uploading || analyzing

  return (
    <div className="bg-white border border-[#DDE8DC] rounded-[20px] p-7 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-5 border-b border-[#DDE8DC]/60 pb-3">
        <div>
          <h4 className="text-[10px] font-bold text-[#7A9080] uppercase tracking-[0.12em] font-sans">{t('Crop Disease Detection')}</h4>
          <p className="text-xs text-[#3A4D3D] mt-0.5 font-medium">{t('Diagnose infections and get precise agricultural advice.')}</p>
        </div>
      </div>

      {/* Camera Live Stream Window */}
      {cameraActive && (
        <div className="space-y-4 mb-4">
          <div className="relative overflow-hidden rounded-xl bg-black aspect-video border border-gray-800">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <button
              onClick={stopCamera}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={capturePhoto}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            <Camera className="w-4 h-4 text-white" />
            {t('Capture Crop Photo')}
          </button>
        </div>
      )}

      {/* Drop zone */}
      {!preview && !cameraActive && (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border border-dashed border-[#DDE8DC] rounded-xl p-8 text-center bg-[#EEF3E8] cursor-pointer select-none transition-all duration-300 hover:border-[#2D6A47] hover:bg-[#D0E9D4]/30 hover:shadow-inner`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 bg-white border border-[#DDE8DC] rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-105">
              <ThinUploadIcon />
            </div>
            <p className="font-display font-semibold text-lg text-[#111D14] mb-1">
              {isDragActive ? 'Drop files here' : 'Drag & drop a crop photo'}
            </p>
            <p className="text-[#7A9080] text-xs mb-5">or click to browse local files</p>
            <div className="flex justify-center gap-2">
              <span className="border border-[#DDE8DC] bg-white text-[#7A9080] font-mono text-[10px] font-bold px-2.5 py-1 rounded">JPG</span>
              <span className="border border-[#DDE8DC] bg-white text-[#7A9080] font-mono text-[10px] font-bold px-2.5 py-1 rounded">PNG</span>
              <span className="border border-[#DDE8DC] bg-white text-[#7A9080] font-mono text-[10px] font-bold px-2.5 py-1 rounded">WEBP</span>
            </div>
          </div>
          <button
            onClick={startCamera}
            className="w-full py-3 bg-[#EEF3E8] hover:bg-[#D0E9D4]/40 text-[#2D6A47] border border-[#DDE8DC] font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Camera className="w-4 h-4 text-[#2D6A47]" />
            {t('Take Photo with Camera')}
          </button>
        </div>
      )}

      {/* Image preview */}
      {preview && !cameraActive && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl">
            <img src={preview} alt="Crop preview" className="w-full h-56 object-cover" />

            {/* Loading/Analyzing state */}
            {isBusy && (
              <div className="absolute inset-0 bg-[#111D14]/65 flex items-center justify-center backdrop-blur-xs">
                <div className="text-center text-white p-6">
                  <Loader2 className="w-10 h-10 text-[#3DB268] animate-spin mx-auto mb-3" />
                  <p className="font-semibold text-sm">
                    {uploading ? 'Uploading crop image...' : 'Executing AI Model...'}
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    {analyzing ? 'Processing agricultural classification parameters' : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Scan completed overlay badge */}
            {done && !isBusy && (
              <div className="absolute top-3 left-3 bg-[#3DB268] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> Scan Finished
              </div>
            )}

            {/* Reset button */}
            {!isBusy && (
              <button
                onClick={reset}
                className="absolute top-3 right-3 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#C0392B] mt-0.5 flex-shrink-0" />
              <p className="text-[#C0392B] text-xs font-semibold">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            {!done ? (
              <button
                onClick={handleDetect}
                disabled={isBusy}
                className="flex-1 bg-[#2D6A47] hover:bg-[#1A3D2B] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 text-white" />
                    Detect Disease
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={reset}
                className="flex-1 bg-[#EEF3E8] hover:bg-[#D0E9D4]/40 text-[#2D6A47] border border-[#DDE8DC] font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Upload className="w-4 h-4" />
                Scan Another Image
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Disease Result Card ─────────────────────────────────────────
function DiseaseResult({ scan }) {
  if (!scan) return null

  const [farmerNote, setFarmerNote] = useState('')
  const [posting, setPosting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const severityColor = getSeverityColor(scan.severity)
  const isHealthy = scan.severity === 'None' || scan.severity === 'Healthy'

  const severityBg = isHealthy
    ? 'bg-[#EEF3E8]'
    : scan.severity === 'Low' ? 'bg-[#EEF3E8]'
    : scan.severity === 'Medium' ? 'bg-amber-50'
    : 'bg-red-50'

  const severityTextColor = isHealthy
    ? 'text-[#2D6A47]'
    : scan.severity === 'Low' ? 'text-[#2D6A47]'
    : scan.severity === 'Medium' ? 'text-[#E8A020]'
    : 'text-[#C0392B]'

  const handleAutomatedPost = async () => {
    if (posting) return
    setPosting(true)
    setError(null)
    try {
      await api.post('/community/create-automated-post', {
        scanId: scan._id,
        farmerNote,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate community post')
    } finally {
      setPosting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#DDE8DC] rounded-[20px] p-6 shadow-sm border-l-4 border-l-[#2D6A47]"
    >
      <div className="flex items-center justify-between mb-5 border-b border-[#DDE8DC]/60 pb-3">
        <div>
          <h4 className="text-[10px] font-bold text-[#7A9080] uppercase tracking-[0.12em] font-sans">Detection Analysis</h4>
          <p className="text-xs text-[#3A4D3D] mt-0.5 font-medium">Model output details and community publication.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <img
          src={`http://localhost:5000${scan.imageUrl}`}
          alt="scan"
          className="w-20 h-20 rounded-xl object-cover border border-[#DDE8DC]"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-lg text-[#111D14] leading-tight truncate">{scan.diseaseName}</h4>
          <p className="text-xs text-[#7A9080] mt-0.5">Detected on <span className="font-semibold text-[#3DB268]">{scan.cropName}</span></p>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mt-2.5 ${severityColor}`}>
            <Shield className="w-3 h-3" />
            {isHealthy ? 'Healthy Plant' : `${scan.severity} Severity`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#EEF3E8] border border-[#DDE8DC] rounded-xl p-3.5 text-center">
          <div className="text-2xl font-bold font-mono text-[#2D6A47]">{scan.confidence?.toFixed(1)}%</div>
          <div className="text-[10px] text-[#7A9080] font-bold uppercase tracking-wider mt-1">AI Confidence</div>
          <div className="w-full bg-[#DDE8DC] rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="bg-[#2D6A47] h-full" style={{ width: `${scan.confidence}%` }} />
          </div>
        </div>
        <div className={`rounded-xl p-3.5 text-center border border-[#DDE8DC] ${severityBg}`}>
          <div className={`text-2xl font-bold ${severityTextColor}`}>
            {isHealthy ? '✓' : scan.severity}
          </div>
          <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${severityTextColor}`}>
            {isHealthy ? 'No Infection' : 'Severity Rank'}
          </div>
        </div>
      </div>

      {/* AI Community Publisher Section */}
      <div className="mt-5 pt-5 border-t border-[#DDE8DC]/60">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-[#2D6A47] animate-pulse" />
          <h4 className="text-xs font-bold text-[#111D14] uppercase tracking-wider font-sans">Share on Krishi Forum (AI Post)</h4>
        </div>
        
        {!success ? (
          <div className="space-y-3">
            <p className="text-[11px] text-[#7A9080] leading-relaxed">
              Generate a high-end structured community request combining your detection results, treatment data, and optional farmer comments.
            </p>
            <textarea
              value={farmerNote}
              onChange={(e) => setFarmerNote(e.target.value)}
              placeholder="Add details (e.g. My leaves are drying and yellow. Fungal sprays aren't working. Need help!)"
              rows="2.5"
              disabled={posting}
              className="w-full p-3.5 text-xs rounded-xl border border-[#DDE8DC] focus:outline-none focus:border-[#2D6A47] focus:ring-1 focus:ring-[#2D6A47]/30 bg-[#EEF3E8]/40 resize-none transition-all font-sans"
            />
            {error && (
              <div className="text-xs text-[#C0392B] bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-start gap-1">
                <span>⚠️</span> <span className="flex-1">{error}</span>
              </div>
            )}
            <button
              onClick={handleAutomatedPost}
              disabled={posting}
              className="w-full bg-[#1A3D2B] hover:bg-[#2D6A47] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-sm transition-all active:scale-95 disabled:opacity-60"
            >
              {posting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Generating AI Post...
                </>
              ) : (
                <>
                  🚀 Auto-Generate & Share on Forum
                </>
              )}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#EEF3E8] border border-[#DDE8DC] rounded-xl p-4 text-center space-y-2"
          >
            <div className="w-8 h-8 bg-[#D0E9D4] rounded-full flex items-center justify-center mx-auto text-[#2D6A47]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-[#111D14] text-xs">Post Shared Successfully</h5>
            <p className="text-[11px] text-[#7A9080] leading-relaxed">
              AI has synthesized a community request combining your detection results and personal observations.
            </p>
            <div className="pt-1.5">
              <a
                href="/community"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#2D6A47] hover:text-[#1A3D2B] hover:underline transition-colors"
              >
                Go to Community Forum <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ─── AI Disease Analysis Panel ───────────────────────────────────
function AIAnalysisPanel({ scan }) {
  const [expanded, setExpanded] = useState(true)
  if (!scan?.aiAnalysis) return null
  const a = scan.aiAnalysis

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white border border-[#DDE8DC] rounded-[20px] overflow-hidden shadow-sm"
    >
      <div
        className="flex items-center justify-between p-6 cursor-pointer border-b border-[#DDE8DC]/60"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#EEF3E8] border border-[#DDE8DC] rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-[#2D6A47]" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-[#7A9080] uppercase tracking-[0.12em] font-sans">AI Disease Analysis</h4>
            <p className="text-xs text-[#3A4D3D] mt-0.5 font-medium">Complete treatment, prevention, and resource plan.</p>
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-[#7A9080] transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-5">
              <div className="bg-[#EEF3E8] border border-[#DDE8DC] rounded-xl p-4">
                <h4 className="font-semibold text-xs text-[#111D14] mb-1.5 flex items-center gap-1.5 font-sans"><Info className="w-4 h-4 text-[#2D6A47]" /> Explanation</h4>
                <p className="text-[#3A4D3D] text-xs leading-relaxed">{a.explanation}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-4">
                  <h4 className="font-bold text-xs text-[#E8A020] mb-2 uppercase tracking-wider font-sans">⚠️ Causes</h4>
                  <ul className="space-y-1.5">
                    {a.causes?.map((c, i) => <li key={i} className="text-[#3A4D3D] text-xs flex gap-2"><span>•</span>{c}</li>)}
                  </ul>
                </div>

                <div className="bg-[#EEF3E8] border border-[#DDE8DC] rounded-xl p-4">
                  <h4 className="font-bold text-xs text-[#2D6A47] mb-2 uppercase tracking-wider font-sans">💊 Treatment</h4>
                  <ul className="space-y-1.5">
                    {a.treatment?.map((t, i) => <li key={i} className="text-[#3A4D3D] text-xs flex gap-2"><span>✓</span>{t}</li>)}
                  </ul>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[#EEF3E8]/80 border border-[#DDE8DC] rounded-xl p-4">
                  <h4 className="font-bold text-xs text-[#2D6A47] mb-2 uppercase tracking-wider font-sans">🛡️ Prevention</h4>
                  <ul className="space-y-1.5">
                    {a.prevention?.map((p, i) => <li key={i} className="text-[#3A4D3D] text-xs flex gap-2"><span>•</span>{p}</li>)}
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="bg-white border border-[#DDE8DC] rounded-xl p-4">
                    <h4 className="font-bold text-xs text-[#111D14] mb-1.5 uppercase tracking-wider font-sans">🧪 Recommended Pesticides</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {a.pesticides?.map((p, i) => <span key={i} className="border border-[#DDE8DC] text-[#3A4D3D] text-[10px] px-2.5 py-1 rounded bg-[#EEF3E8] font-semibold">{p}</span>)}
                    </div>
                  </div>
                  <div className="bg-white border border-[#DDE8DC] rounded-xl p-4">
                    <h4 className="font-bold text-xs text-[#111D14] mb-1.5 uppercase tracking-wider font-sans">🌱 Recommended Fertilizers</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {a.fertilizers?.map((f, i) => <span key={i} className="border border-[#DDE8DC] text-[#3A4D3D] text-[10px] px-2.5 py-1 rounded bg-[#EEF3E8] font-semibold">{f}</span>)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[#EEF3E8]/40 border border-[#DDE8DC] rounded-xl p-4">
                  <h4 className="font-bold text-xs text-[#111D14] mb-1 uppercase tracking-wider font-sans">💧 Irrigation Tip</h4>
                  <p className="text-[#3A4D3D] text-xs leading-relaxed">{a.irrigation}</p>
                </div>
                <div className="bg-red-50/40 border border-red-200/50 rounded-xl p-4">
                  <h4 className="font-bold text-xs text-[#C0392B] mb-1 uppercase tracking-wider font-sans">📉 Expected Yield Impact</h4>
                  <p className="text-[#3A4D3D] text-xs leading-relaxed">{a.yieldImpact}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Weather Panel Redesign ──────────────────────────────────────
function WeatherWidget({ weather }) {
  if (!weather) return (
    <div className="bg-white border border-[#DDE8DC] rounded-[20px] p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-[#EEF3E8] rounded-xl flex items-center justify-center border border-[#DDE8DC]">
          <Cloud className="w-5 h-5 text-[#2D6A47]" />
        </div>
        <h3 className="font-bold text-[#111D14] font-display">Weather Forecast</h3>
      </div>
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-10 bg-[#EEF3E8] animate-pulse rounded-lg w-full" />)}
      </div>
    </div>
  )

  const { current, agriculture, forecast } = weather

  return (
    <div className="bg-white border border-[#DDE8DC] rounded-[20px] overflow-hidden shadow-sm">
      {/* Dark Navy Premium weather panel header */}
      <div className="bg-gradient-to-br from-[#243F6A] to-[#1C3A5E] p-6 text-white relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{weather.location?.city || weather.location?.state}</p>
            <div className="flex items-baseline mt-1">
              <TempCounter targetTemp={current.temperature} />
              <span className="font-mono text-3xl font-bold text-[#4A90C4] ml-1">°C</span>
            </div>
            <p className="text-white/70 text-xs mt-1 font-medium">{current.condition}</p>
          </div>
          <WeatherSunCloudIcon />
        </div>

        <div className="grid grid-cols-3 gap-2.5 mt-5 border-t border-white/10 pt-4 relative z-10">
          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
            <Droplets className="w-4 h-4 mx-auto mb-1 text-[#4A90C4]" />
            <div className="text-sm font-bold font-mono">{current.humidity}%</div>
            <div className="text-[9px] text-white/50 font-bold uppercase tracking-wider mt-0.5">Humidity</div>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
            <Wind className="w-4 h-4 mx-auto mb-1 text-[#4A90C4]" />
            <div className="text-sm font-bold font-mono">{Math.round(current.windSpeed)}</div>
            <div className="text-[9px] text-white/50 font-bold uppercase tracking-wider mt-0.5">km/h Wind</div>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
            <Sun className="w-4 h-4 mx-auto mb-1 text-[#4A90C4]" />
            <div className="text-sm font-bold font-mono">{current.uvIndex}</div>
            <div className="text-[9px] text-white/50 font-bold uppercase tracking-wider mt-0.5">UV Index</div>
          </div>
        </div>
      </div>

      {/* Advisory Cards with left borders */}
      <div className="p-5 space-y-3.5">
        <div className={`rounded-xl p-3.5 border border-[#DDE8DC] border-l-3 bg-[#EEF3E8] flex items-start gap-3
          ${agriculture?.diseaseRisk === 'High' ? 'border-l-[#C0392B]' : agriculture?.diseaseRisk === 'Medium' ? 'border-l-[#E8A020]' : 'border-l-[#2D6A47]'}`}>
          <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5
            ${agriculture?.diseaseRisk === 'High' ? 'text-[#C0392B]' : agriculture?.diseaseRisk === 'Medium' ? 'text-[#E8A020]' : 'text-[#2D6A47]'}`} />
          <div>
            <p className="text-[10px] font-bold text-[#7A9080] uppercase tracking-wider">Disease Risk Assessment</p>
            <p className="text-xs font-semibold text-[#111D14] mt-0.5">Risk Rank: {agriculture?.diseaseRisk}</p>
            <p className="text-[11px] text-[#3A4D3D] leading-normal mt-0.5 font-medium">{agriculture?.diseaseRiskReason}</p>
          </div>
        </div>
        
        <div className="bg-[#EEF3E8] border border-[#DDE8DC] border-l-3 border-l-[#2D6A47] rounded-xl p-3.5 flex items-start gap-3">
          <Droplets className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#2D6A47]" />
          <div>
            <p className="text-[10px] font-bold text-[#7A9080] uppercase tracking-wider">Irrigation Directive</p>
            <p className="text-[11px] text-[#3A4D3D] leading-normal mt-1 font-medium">{agriculture?.irrigationRecommendation}</p>
          </div>
        </div>
      </div>

      {/* 7-day forecast with horizontal mini-bars */}
      <div className="px-5 pb-5">
        <p className="text-[10px] font-bold text-[#7A9080] uppercase tracking-wider mb-3 font-sans">7-Day Forecast</p>
        <div className="space-y-2">
          {forecast?.daily?.slice(0, 5).map((day, i) => {
            const highTemp = Math.round(day.high)
            const lowTemp = Math.round(day.low || day.high - 6)
            // Percentage maps temperature typically from 5C to 45C
            const pctMin = Math.max(0, Math.min(100, ((lowTemp - 5) / 40) * 100))
            const pctMax = Math.max(0, Math.min(100, ((highTemp - 5) / 40) * 100))

            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-7 text-[11px] text-[#7A9080] font-bold font-sans">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][(new Date(day.date).getDay())]}
                </span>
                <span className="w-7 text-[11px] text-[#3A4D3D] font-bold font-mono text-right">{lowTemp}°</span>
                <div className="flex-1 bg-[#EEF3E8] h-1.5 rounded-full relative overflow-hidden">
                  <div
                    className="absolute bg-[#2D6A47] h-full rounded-full"
                    style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
                  />
                </div>
                <span className="w-7 text-[11px] text-[#111D14] font-bold font-mono">{highTemp}°</span>
                <div className="w-3.5 flex justify-center">
                  {day.rainfall > 0 ? <span className="w-1.5 h-1.5 rounded-full bg-[#4A90C4]" title="Rain forecast" /> : <span className="w-1.5 h-1.5" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── AI Farm Recommendations ─────────────────────────────────────
function AIRecommendations({ user }) {
  const recommendations = [
    { title: 'Pesticide Application Warning', desc: 'Heavy rain expected in 2 days. Delay sprays to avoid soil wash-off.', type: 'warning' },
    { title: 'Crop Hydration Alert', desc: 'Average temperatures spiking. Increase drip frequency for crops.', type: 'info' },
    { title: 'Preventive Spore Control', desc: 'High moisture detected. Fungal risk is medium. Administer preventive treatments.', type: 'alert' },
    { title: 'Dynamic Mandi Advantage', desc: 'Commodity modal rates rising 12% in state APMCs. High time to arrange market delivery.', type: 'success' },
  ]

  const typeStyles = {
    warning: 'border-l-[#E8A020] bg-amber-50/20 border-amber-100',
    info: 'border-l-[#4A90C4] bg-blue-50/20 border-blue-100',
    alert: 'border-l-[#C0392B] bg-red-50/10 border-red-100',
    success: 'border-l-[#2D6A47] bg-[#EEF3E8]/50 border-[#DDE8DC]',
  }

  return (
    <div className="bg-white border border-[#DDE8DC] rounded-[20px] p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-[#EEF3E8] border border-[#DDE8DC] rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-[#2D6A47]" />
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-[#7A9080] uppercase tracking-[0.12em] font-sans">AI Directives</h4>
          <p className="text-xs text-[#3A4D3D] mt-0.5 font-medium">Daily advisory packages synthesized for your land.</p>
        </div>
      </div>
      <div className="space-y-3">
        {recommendations.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex items-start gap-3 p-3.5 rounded-xl border border-l-3 ${typeStyles[r.type]}`}
          >
            <div className="flex-1">
              <p className="text-xs font-bold text-[#111D14] font-sans">{r.title}</p>
              <p className="text-[11px] text-[#3A4D3D] mt-1 font-medium leading-relaxed">{r.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Crop Health Widget ──────────────────────────────────────────
function CropHealthWidget({ user }) {
  const crops = user?.crops?.slice(0, 3) || ['Tomato', 'Rice', 'Wheat']

  const cropData = crops.map(crop => ({
    name: crop,
    health: Math.floor(Math.random() * 20 + 75),
    risk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 2)],
    price: `₹${Math.floor(Math.random() * 15 + 20)}/kg`,
  }))

  return (
    <div className="bg-white border border-[#DDE8DC] rounded-[20px] p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-[#EEF3E8] border border-[#DDE8DC] rounded-xl flex items-center justify-center">
          <Sprout className="w-5 h-5 text-[#2D6A47]" />
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-[#7A9080] uppercase tracking-[0.12em] font-sans">Crop Performance</h4>
          <p className="text-xs text-[#3A4D3D] mt-0.5 font-medium">Yield indicators and local marketplace value.</p>
        </div>
      </div>

      <div className="space-y-4">
        {cropData.map((crop) => (
          <div key={crop.name} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#EEF3E8] border border-[#DDE8DC] rounded-xl flex items-center justify-center font-bold text-xs text-[#2D6A47] font-sans uppercase">
              {crop.name.slice(0,2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-[#111D14] text-xs">{crop.name}</span>
                <span className="text-[10px] font-bold font-mono text-[#7A9080]">{crop.health}% health</span>
              </div>
              <div className="w-full bg-[#EEF3E8] rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${crop.health > 82 ? 'bg-[#2D6A47]' : 'bg-[#E8A020]'}`}
                  style={{ width: `${crop.health}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${crop.risk === 'Low' ? 'text-[#2D6A47]' : 'text-[#E8A020]'}`}>
                  {crop.risk} Risk
                </span>
                <span className="text-[10px] font-mono font-bold text-[#7A9080]">{crop.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Scan History Section ────────────────────────────────────────
function ScanHistory() {
  const { data } = useQuery({
    queryKey: ['scan-history'],
    queryFn: () => api.get('/disease/history').then(r => r.data.scans),
  })

  if (!data?.length) return null

  return (
    <div className="bg-white border border-[#DDE8DC] rounded-[20px] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#DDE8DC]/60">
        <div className="flex items-center gap-2 flex-1">
          <MicroscopeIcon />
          <h4 className="text-[10px] font-bold text-[#7A9080] uppercase tracking-[0.12em] font-sans">Scan History</h4>
          <div className="h-px bg-[#DDE8DC] flex-1 ml-3" />
        </div>
      </div>
      
      <div className="space-y-3">
        {data.slice(0, 5).map((scan, i) => {
          const isHealthy = scan.severity === 'None' || scan.severity === 'Healthy'
          const borderStyle = isHealthy ? 'border-[#3DB268] text-[#3DB268]' : scan.severity === 'Low' ? 'border-[#3DB268] text-[#3DB268]' : scan.severity === 'Medium' ? 'border-[#E8A020] text-[#E8A020]' : 'border-[#C0392B] text-[#C0392B]'

          return (
            <motion.div
              key={scan._id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3.5 p-3 rounded-xl border border-[#DDE8DC] hover:bg-[#EEF3E8]/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#D0E9D4]/40 border border-[#DDE8DC] flex items-center justify-center text-xs font-bold text-[#2D6A47] font-sans uppercase">
                {(scan.cropName || 'Crop').slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-[#111D14] truncate">{scan.diseaseName || 'Processing...'}</p>
                <p className="text-[10px] text-[#7A9080] mt-0.5 font-medium">{scan.cropName || 'Crop'} · {formatDate(scan.createdAt)}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-white ${borderStyle}`}>
                {scan.severity}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Krishi AI Smart Copilot ─────────────────────────────────────
function KrishiCopilot({ user }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState(0)
  const [audit, setAudit] = useState(null)
  const [scheduledTasks, setScheduledTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState({})
  const [successStatus, setSuccessStatus] = useState({}) // item1: 'drafted', item2: 'scheduled'

  const STAGES = [
    t('Reading plot profile & experience layers...'),
    t('Auditing live district weather trends...'),
    t('Interrogating official APMC Mandi price APIs...'),
    t('Running AI multi-layer auto-optimization...')
  ]

  useEffect(() => {
    let timer
    if (loading && loadingStage < STAGES.length - 1) {
      timer = setTimeout(() => {
        setLoadingStage(prev => prev + 1)
      }, 1500)
    }
    return () => clearTimeout(timer)
  }, [loading, loadingStage])

  const triggerAudit = async () => {
    setLoading(true)
    setLoadingStage(0)
    setAudit(null)
    try {
      // Simulate stages progression for premium visual feel
      await new Promise(resolve => setTimeout(resolve, 6000))
      const res = await api.post('/ai/farm-audit')
      if (res.data.success) {
        setAudit(res.data.audit)
      }
    } catch (err) {
      console.error('Farm audit error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoDraftListing = async (item) => {
    const itemId = item.id
    setSuccessStatus(prev => ({ ...prev, [itemId]: 'loading' }))
    try {
      const payload = item.payload
      // Draft listing to database
      await api.post('/market/sell-yield', {
        crop: payload.commodity,
        quantity: user?.farmDetails?.farmArea * 15 || 30,
        unit: 'Quintal',
        pricePerUnit: payload.price,
        description: payload.description,
        location: {
          state: user?.farmDetails?.state || 'Karnataka',
          district: user?.farmDetails?.district || 'Bengaluru'
        },
        contact: '9988776655',
        quality: 'A',
        availableFrom: new Date().toISOString().split('T')[0],
        availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      setSuccessStatus(prev => ({ ...prev, [itemId]: 'drafted' }))
    } catch (err) {
      console.error('Error drafting listing:', err)
      setSuccessStatus(prev => ({ ...prev, [itemId]: 'error' }))
    }
  }

  const handleAutoScheduleTasks = (item) => {
    const itemId = item.id
    setSuccessStatus(prev => ({ ...prev, [itemId]: 'scheduled' }))
    if (item.payload?.tasks) {
      setScheduledTasks(prev => {
        // Prevent duplicate lists
        const filtered = prev.filter(t => !item.payload.tasks.includes(t))
        return [...filtered, ...item.payload.tasks]
      })
    }
  }

  const toggleTask = (task) => {
    setCompletedTasks(prev => ({ ...prev, [task]: !prev[task] }))
  }

  return (
    <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-[#DDE8DC] rounded-3xl p-8 shadow-sm transition-all mb-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-[#DDE8DC]/60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md shadow-green-500/20">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-lg font-display text-[#111D14] flex items-center gap-2">
              {t('Krishi AI Smart Copilot')}
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black tracking-widest uppercase">
                Active
              </span>
            </h3>
            <p className="text-xs text-[#7A9080] font-medium mt-0.5">
              {t('Predict your crop yield using advanced machine learning models')}
            </p>
          </div>
        </div>

        {!loading && !audit && (
          <button
            onClick={triggerAudit}
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-green-600/10 group"
          >
            <Sparkles className="w-4 h-4 text-green-200 group-hover:rotate-12 transition-transform" />
            {t('Run 1-Click Farm Audit & Optimization')}
          </button>
        )}
      </div>

      {/* ─── LOADING STATE ─── */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-[#111D14] transition-all">
              {STAGES[loadingStage]}
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
              Krishi AI is aggregating live Mandi price telemetry and cloud cover patterns
            </p>
          </div>
          <div className="w-48 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${(loadingStage + 1) * 25}%` }}
            />
          </div>
        </div>
      )}

      {/* ─── AUDIT REPORT RENDER ─── */}
      {audit && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Executive Overview Section */}
          <div className="flex flex-col md:flex-row gap-6 items-center bg-green-50/40 border border-[#DDE8DC]/80 rounded-2xl p-6">
            {/* Health Score Dial */}
            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#EEF3E8" strokeWidth="6" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#2D6A47"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={251}
                  strokeDashoffset={251 - (251 * audit.healthScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-black text-2xl text-[#111D14]">{audit.healthScore}</span>
                <span className="text-[8px] font-black text-green-700 tracking-wider uppercase">Score</span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h4 className="font-bold text-xs uppercase tracking-widest text-green-700 mb-1">
                {t('Farm Health Score')}
              </h4>
              <p className="text-sm text-[#3A4D3D] leading-relaxed font-semibold">
                {audit.summary}
              </p>
            </div>
            
            <button
              onClick={triggerAudit}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-[#DDE8DC] text-[10px] font-bold text-green-700 rounded-xl transition-all shadow-xs shrink-0"
            >
              Re-Audit
            </button>
          </div>

          {/* Action Items List */}
          <div className="grid md:grid-cols-3 gap-5">
            {audit.actionItems.map((item) => {
              const status = successStatus[item.id]
              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#DDE8DC] hover:border-green-300 rounded-2xl p-5 flex flex-col justify-between transition-all group"
                >
                  <div className="mb-4">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                      {item.type.replace('_', ' ')}
                    </span>
                    <h5 className="font-bold text-sm text-[#111D14] mt-2 group-hover:text-green-700 transition-colors">
                      {item.title}
                    </h5>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Nutrient specifics inside Prescription */}
                    {item.type === 'SOIL_PRESCRIPTION' && item.payload?.nutrients && (
                      <div className="grid grid-cols-3 gap-2 mt-4 bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center font-mono">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block">N</span>
                          <span className="text-xs font-bold text-green-700">{item.payload.nutrients.N}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block">P</span>
                          <span className="text-xs font-bold text-orange-700">{item.payload.nutrients.P}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold block">K</span>
                          <span className="text-xs font-bold text-purple-700">{item.payload.nutrients.K}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Action Buttons */}
                  <div className="mt-auto">
                    {item.type === 'MANDI_ARBITRAGE' && (
                      <button
                        onClick={() => handleAutoDraftListing(item)}
                        disabled={status === 'drafted' || status === 'loading'}
                        className={`w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                          status === 'drafted'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-[#1A3D2B] hover:bg-[#2D6A47] text-white active:scale-95'
                        }`}
                      >
                        {status === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {status === 'drafted' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            {t('Marketplace Listing Published!')}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            {t('1-Click Auto-Draft Sale Listing')}
                          </>
                        )}
                      </button>
                    )}

                    {item.type === 'WEATHER_WARNING' && (
                      <button
                        onClick={() => handleAutoScheduleTasks(item)}
                        disabled={status === 'scheduled'}
                        className={`w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                          status === 'scheduled'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-[#1A3D2B] hover:bg-[#2D6A47] text-white active:scale-95'
                        }`}
                      >
                        {status === 'scheduled' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            {t('Prevention Tasks Scheduled!')}
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3.5 h-3.5" />
                            {t('Auto-Schedule Prevention Tasks')}
                          </>
                        )}
                      </button>
                    )}

                    {item.type === 'SOIL_PRESCRIPTION' && (
                      <div className="text-[10px] text-center text-green-700 font-bold border border-green-200/50 bg-green-50/50 py-2 rounded-xl">
                        ✓ Optimal Nutrition Confirmed
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Active Copilot Scheduled Checklist */}
          {scheduledTasks.length > 0 && (
            <div className="bg-white border border-[#DDE8DC] rounded-2xl p-6">
              <h5 className="font-bold text-xs uppercase tracking-widest text-[#7A9080] mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-700" />
                {t('Active Copilot Tasks')}
              </h5>
              <div className="space-y-2.5">
                {scheduledTasks.map((task, idx) => {
                  const isDone = !!completedTasks[task]
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleTask(task)}
                      className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-[#EEF3E8]/30 transition-all cursor-pointer ${
                        isDone ? 'bg-[#EEF3E8]/30 opacity-70' : 'bg-white shadow-xs'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isDone ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isDone && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs font-semibold ${isDone ? 'line-through text-gray-400' : 'text-[#111D14]'}`}>
                        {task}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

// ─── Main Dashboard Redesign ─────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const [currentScan, setCurrentScan] = useState(null)

  const { data: weatherData } = useQuery({
    queryKey: ['weather', user?.farmDetails?.state],
    queryFn: () => api.get('/weather', {
      params: { state: user?.farmDetails?.state }
    }).then(r => r.data.weather),
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  })

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#F6F8F4]">
      {/* 3-column Greeting section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center relative bg-white border border-[#DDE8DC] rounded-[20px] p-8 shadow-sm overflow-hidden"
      >
        <div className="relative z-10">
          <motion.h2
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.04 }
              }
            }}
            className="text-3xl font-bold font-display text-[#111D14] leading-tight"
          >
            <span className="italic font-normal mr-2">Namaste,</span>
            {user?.name?.split(' ')[0]}
          </motion.h2>
          
          <p className="text-sm text-[#7A9080] mt-1.5 font-medium">
            Active crop intelligence target: <span className="text-[#3DB268] font-semibold">{user?.crops?.length ? user.crops.slice(0, 3).join(', ') : 'Tomato'}</span>
          </p>

          <div className="flex gap-2.5 mt-4">
            <span className="flex items-center gap-1.5 border border-[#DDE8DC] bg-[#EEF3E8]/80 text-[#2D6A47] text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs">
              <PinIcon />
              {user?.farmDetails?.state || 'Bihar'}
            </span>
            <span className="flex items-center gap-1.5 border border-[#DDE8DC] bg-[#EEF3E8]/80 text-[#2D6A47] text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs">
              <GlobeIcon />
              {user?.language || 'English'}
            </span>
          </div>
        </div>

        <div className="hidden md:block flex-1" />

        <ElegantWheatStalk />
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Columns */}
        <div className="lg:col-span-2 space-y-8">
          <KrishiCopilot user={user} />
          <DiseaseUploadSection onScanComplete={setCurrentScan} />
          {currentScan && <DiseaseResult scan={currentScan} />}
          {currentScan && <AIAnalysisPanel scan={currentScan} />}
          <ScanHistory />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <WeatherWidget weather={weatherData} />
          <CropHealthWidget user={user} />
          <AIRecommendations user={user} />
        </div>
      </div>
    </div>
  )
}
