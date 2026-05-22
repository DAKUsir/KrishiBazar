import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useQuery } from '@tanstack/react-query'
import {
  Upload, Camera, Cloud, Thermometer, Droplets, Wind,
  Sun, AlertTriangle, CheckCircle2, Leaf, TrendingUp,
  Activity, ChevronRight, X, Brain, Shield, Zap,
  Sprout, BarChart2, Calendar, Info
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { getSeverityColor, formatDate } from '../lib/utils'

// ─── Disease Upload ─────────────────────────────────────────────
function DiseaseUploadSection({ onScanComplete }) {
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError]       = useState(null)
  const [done, setDone]         = useState(false)

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
    setFile(null); setPreview(null); setError(null); setDone(false)
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
    <div className="dashboard-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Leaf className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 font-display">Crop Disease Detection</h3>
          <p className="text-sm text-gray-500">Upload a photo, then click Detect Disease</p>
        </div>
      </div>

      {/* Drop zone — shown when no image selected */}
      {!preview && (
        <div
          {...getRootProps()}
          className={`upload-zone text-center ${isDragActive ? 'drag-over' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-green-500" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">
            {isDragActive ? 'Drop your image here' : 'Drag & drop a crop photo'}
          </p>
          <p className="text-gray-400 text-sm mb-4">or click to browse</p>
          <div className="flex justify-center gap-3">
            <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-lg">JPG</span>
            <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-lg">PNG</span>
            <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-lg">WEBP</span>
          </div>
        </div>
      )}

      {/* Image preview + action buttons */}
      {preview && (
        <div className="space-y-4">
          <div className="relative">
            <img src={preview} alt="Crop preview" className="w-full h-56 object-cover rounded-2xl" />

            {/* Busy overlay */}
            {isBusy && (
              <div className="absolute inset-0 bg-black/55 rounded-2xl flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="font-semibold text-sm">
                    {uploading ? 'Uploading image...' : '🤖 AI Analyzing...'}
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    {analyzing ? 'HuggingFace model running' : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Done badge */}
            {done && !isBusy && (
              <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Analysis Complete
              </div>
            )}

            {/* Clear button */}
            {!isBusy && (
              <button
                onClick={reset}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {!done ? (
              <motion.button
                id="detect-disease-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDetect}
                disabled={isBusy}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isBusy ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {uploading ? 'Uploading...' : 'Analyzing...'}
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Detect Disease
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={reset}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4" />
                Scan Another Image
              </motion.button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Disease Result ──────────────────────────────────────────────
function DiseaseResult({ scan }) {
  if (!scan) return null

  const severityColor = getSeverityColor(scan.severity)
  const isHealthy = scan.severity === 'None' || scan.severity === 'Healthy'

  const severityBg = isHealthy
    ? 'bg-green-50'
    : scan.severity === 'Low' ? 'bg-green-50'
    : scan.severity === 'Medium' ? 'bg-yellow-50'
    : 'bg-red-50'

  const severityText = isHealthy
    ? 'text-green-700'
    : scan.severity === 'Low' ? 'text-green-700'
    : scan.severity === 'Medium' ? 'text-yellow-700'
    : 'text-red-700'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-card p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 ${isHealthy ? 'bg-green-100' : 'bg-red-100'} rounded-xl flex items-center justify-center`}>
          {isHealthy
            ? <CheckCircle2 className="w-5 h-5 text-green-500" />
            : <AlertTriangle className="w-5 h-5 text-red-500" />}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 font-display">Detection Result</h3>
          {scan.model && (
            <p className="text-xs text-gray-400 mt-0.5">🤖 HuggingFace · MobileNetV2</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <img src={`http://localhost:5000${scan.imageUrl}`} alt="scan" className="w-20 h-20 rounded-xl object-cover border border-gray-100" />
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-lg">{scan.diseaseName}</h4>
          <p className="text-gray-500 text-sm mb-2">Detected in {scan.cropName}</p>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${severityColor}`}>
            <Shield className="w-3 h-3" />
            {isHealthy ? '✅ Healthy Plant' : `${scan.severity} Severity`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-700">{scan.confidence?.toFixed(1)}%</div>
          <div className="text-xs text-blue-500 font-medium">AI Confidence</div>
          <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${scan.confidence}%` }} />
          </div>
        </div>
        <div className={`rounded-xl p-3 text-center ${severityBg}`}>
          <div className={`text-2xl font-bold ${severityText}`}>
            {isHealthy ? '✓' : scan.severity}
          </div>
          <div className={`text-xs font-medium ${severityText}`}>
            {isHealthy ? 'No Disease Found' : 'Severity Level'}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── AI Analysis ─────────────────────────────────────────────────
function AIAnalysisPanel({ scan }) {
  const [expanded, setExpanded] = useState(true)
  if (!scan?.aiAnalysis) return null
  const a = scan.aiAnalysis

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="dashboard-card overflow-hidden"
    >
      <div
        className="flex items-center justify-between p-6 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 font-display">AI Disease Analysis</h3>
            <p className="text-sm text-gray-500">Complete treatment & prevention plan</p>
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-1 flex items-center gap-2"><Info className="w-4 h-4" /> Explanation</h4>
                <p className="text-blue-700 text-sm leading-relaxed">{a.explanation}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-xl p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">⚠️ Causes</h4>
                  <ul className="space-y-1">
                    {a.causes?.map((c, i) => <li key={i} className="text-orange-700 text-sm flex gap-2"><span>•</span>{c}</li>)}
                  </ul>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-semibold text-green-900 mb-2">💊 Treatment</h4>
                  <ul className="space-y-1">
                    {a.treatment?.map((t, i) => <li key={i} className="text-green-700 text-sm flex gap-2"><span>✓</span>{t}</li>)}
                  </ul>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-teal-50 rounded-xl p-4">
                  <h4 className="font-semibold text-teal-900 mb-2">🛡️ Prevention</h4>
                  <ul className="space-y-1">
                    {a.prevention?.map((p, i) => <li key={i} className="text-teal-700 text-sm flex gap-2"><span>•</span>{p}</li>)}
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-semibold text-purple-900 mb-1">🧪 Pesticides</h4>
                    <div className="flex flex-wrap gap-2">
                      {a.pesticides?.map((p, i) => <span key={i} className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full">{p}</span>)}
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <h4 className="font-semibold text-yellow-900 mb-1">🌱 Fertilizers</h4>
                    <div className="flex flex-wrap gap-2">
                      {a.fertilizers?.map((f, i) => <span key={i} className="bg-yellow-100 text-yellow-700 text-xs px-2.5 py-1 rounded-full">{f}</span>)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-cyan-50 rounded-xl p-4">
                  <h4 className="font-semibold text-cyan-900 mb-1">💧 Irrigation</h4>
                  <p className="text-cyan-700 text-sm">{a.irrigation}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <h4 className="font-semibold text-red-900 mb-1">📉 Yield Impact</h4>
                  <p className="text-red-700 text-sm">{a.yieldImpact}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Weather Widget ───────────────────────────────────────────────
function WeatherWidget({ weather }) {
  if (!weather) return (
    <div className="dashboard-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
          <Cloud className="w-5 h-5 text-sky-500" />
        </div>
        <h3 className="font-bold text-gray-900 font-display">Weather</h3>
      </div>
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="skeleton h-10 w-full" />)}
      </div>
    </div>
  )

  const { current, agriculture, season, forecast } = weather

  return (
    <div className="dashboard-card overflow-hidden">
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sky-200 text-sm">{weather.location?.city || weather.location?.state}</p>
            <div className="text-5xl font-bold mt-1">{Math.round(current.temperature)}°C</div>
            <p className="text-sky-100 mt-1">{current.condition}</p>
          </div>
          <Cloud className="w-16 h-16 text-white/30" />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <Droplets className="w-4 h-4 mx-auto mb-1 text-sky-200" />
            <div className="text-lg font-bold">{current.humidity}%</div>
            <div className="text-xs text-sky-200">Humidity</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <Wind className="w-4 h-4 mx-auto mb-1 text-sky-200" />
            <div className="text-lg font-bold">{Math.round(current.windSpeed)}</div>
            <div className="text-xs text-sky-200">km/h Wind</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <Sun className="w-4 h-4 mx-auto mb-1 text-sky-200" />
            <div className="text-lg font-bold">{current.uvIndex}</div>
            <div className="text-xs text-sky-200">UV Index</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className={`rounded-xl p-3 border flex items-start gap-3 ${agriculture?.diseaseRisk === 'High' ? 'bg-red-50 border-red-200' : agriculture?.diseaseRisk === 'Medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
          <AlertTriangle className={`w-4 h-4 mt-0.5 ${agriculture?.diseaseRisk === 'High' ? 'text-red-500' : agriculture?.diseaseRisk === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`} />
          <div>
            <p className="text-xs font-semibold text-gray-700">Disease Risk: {agriculture?.diseaseRisk}</p>
            <p className="text-xs text-gray-500">{agriculture?.diseaseRiskReason}</p>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 border border-green-200 flex items-start gap-3">
          <Droplets className="w-4 h-4 mt-0.5 text-green-500" />
          <p className="text-xs text-green-700">{agriculture?.irrigationRecommendation}</p>
        </div>
      </div>

      {/* 7-day forecast */}
      <div className="px-4 pb-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">7-Day Forecast</p>
        <div className="grid grid-cols-7 gap-1">
          {forecast?.daily?.slice(0, 7).map((day, i) => (
            <div key={i} className="text-center">
              <p className="text-xs text-gray-400">{['S','M','T','W','T','F','S'][(new Date(day.date).getDay())]}</p>
              <p className="text-xs font-bold text-gray-700 mt-1">{Math.round(day.high)}°</p>
              {day.rainfall > 0 && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mx-auto mt-1" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── AI Recommendations ──────────────────────────────────────────
function AIRecommendations({ user }) {
  const recommendations = [
    { icon: '🌧️', title: 'Heavy rain expected in 2 days', desc: 'Delay pesticide application. Ensure field drainage.', type: 'warning' },
    { icon: '🌡️', title: 'High temperature alert', desc: 'Increase irrigation frequency for your tomatoes.', type: 'info' },
    { icon: '🦠', title: 'Fungal risk: Medium', desc: 'Humidity is high. Apply preventive copper spray.', type: 'alert' },
    { icon: '💰', title: 'Market opportunity', desc: 'Tomato prices rising 15% this week. Good time to sell.', type: 'success' },
  ]

  const typeStyles = {
    warning: 'border-yellow-200 bg-yellow-50',
    info: 'border-blue-200 bg-blue-50',
    alert: 'border-orange-200 bg-orange-50',
    success: 'border-green-200 bg-green-50',
  }

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 font-display">AI Recommendations</h3>
          <p className="text-sm text-gray-500">Daily advice for your farm</p>
        </div>
      </div>
      <div className="space-y-3">
        {recommendations.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-start gap-3 p-3 rounded-xl border ${typeStyles[r.type]}`}
          >
            <span className="text-xl">{r.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{r.title}</p>
              <p className="text-xs text-gray-600 mt-0.5">{r.desc}</p>
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
    health: Math.floor(Math.random() * 30 + 65),
    risk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    price: `₹${Math.floor(Math.random() * 30 + 15)}/kg`,
  }))

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Sprout className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 font-display">Your Crops</h3>
          <p className="text-sm text-gray-500">Current health status</p>
        </div>
      </div>

      <div className="space-y-4">
        {cropData.map((crop) => (
          <div key={crop.name} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg">
              🌱
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-gray-900 text-sm">{crop.name}</span>
                <span className="text-xs font-medium text-gray-500">{crop.health}% health</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${crop.health > 80 ? 'bg-green-500' : crop.health > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${crop.health}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className={`text-xs font-medium ${crop.risk === 'Low' ? 'text-green-600' : crop.risk === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                  {crop.risk} risk
                </span>
                <span className="text-xs text-gray-500">{crop.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Scan History ────────────────────────────────────────────────
function ScanHistory() {
  const { data } = useQuery({
    queryKey: ['scan-history'],
    queryFn: () => api.get('/disease/history').then(r => r.data.scans),
  })

  if (!data?.length) return null

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-gray-600" />
          </div>
          <h3 className="font-bold text-gray-900 font-display">Scan History</h3>
        </div>
      </div>
      <div className="space-y-3">
        {data.slice(0, 5).map(scan => (
          <div key={scan._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className={`w-2 h-2 rounded-full ${scan.severity === 'Low' ? 'bg-green-500' : scan.severity === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{scan.diseaseName || 'Processing...'}</p>
              <p className="text-xs text-gray-500">{scan.cropName} · {formatDate(scan.createdAt)}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(scan.severity)}`}>{scan.severity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────
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
    <div className="p-6 space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-green-200"
      >
        <div>
          <h2 className="text-2xl font-bold font-display">Namaste, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-green-100 mt-1">
            {user?.crops?.length ? `Monitoring: ${user.crops.slice(0, 3).join(', ')}` : 'Start by scanning a crop image'}
          </p>
          <div className="flex gap-2 mt-3">
            <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
              📍 {user?.farmDetails?.state || 'India'}
            </span>
            <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
              🌍 {user?.language || 'English'}
            </span>
          </div>
        </div>
        <div className="hidden md:block text-6xl">🌾</div>
      </motion.div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <DiseaseUploadSection onScanComplete={setCurrentScan} />
          {currentScan && <DiseaseResult scan={currentScan} />}
          {currentScan && <AIAnalysisPanel scan={currentScan} />}
          <ScanHistory />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <WeatherWidget weather={weatherData} />
          <CropHealthWidget user={user} />
          <AIRecommendations user={user} />
        </div>
      </div>
    </div>
  )
}
