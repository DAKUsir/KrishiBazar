import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scan, Zap, CheckCircle2, AlertTriangle, Camera, Upload } from 'lucide-react'

const diseases = [
  { name: 'Early Blight', crop: 'Tomato', severity: 'Medium', confidence: 94, colorText: 'text-amber-600', colorBg: 'bg-amber-50', colorBorder: 'border-amber-200', remedy: 'Apply copper-based fungicide. Remove affected leaves. Avoid overhead watering.', icon: '🍅' },
  { name: 'Leaf Rust', crop: 'Wheat', severity: 'High', confidence: 97, colorText: 'text-red-600', colorBg: 'bg-red-50', colorBorder: 'border-red-200', remedy: 'Use propiconazole fungicide. Apply within 7 days for best results.', icon: '🌾' },
  { name: 'Powdery Mildew', crop: 'Cucumber', severity: 'Low', confidence: 91, colorText: 'text-green-700', colorBg: 'bg-green-50', colorBorder: 'border-green-200', remedy: 'Spray potassium bicarbonate solution. Ensure proper air circulation.', icon: '🥒' },
]

export default function DiseaseDetectionSection() {
  const [active, setActive] = useState(0)
  const [scanning, setScanning] = useState(false)

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => { setScanning(false); setActive(p => (p + 1) % diseases.length) }, 2500)
  }

  const d = diseases[active]

  return (
    <section id="ai-detection" className="py-28 px-6 md:px-12 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.05)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-100 rounded-full px-4 py-1.5 text-cyan-700 text-sm font-semibold mb-5">
            <Zap className="w-3.5 h-3.5" />
            Powered by AI Vision
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-display mb-4">
            AI{' '}
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Disease Detection
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Point your camera at any crop. Our AI identifies 50+ diseases with 95%+ accuracy in seconds.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="relative w-64 h-[520px] bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] border-4 border-zinc-700 shadow-2xl shadow-cyan-100 overflow-hidden">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-full z-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-green-50/40 to-green-100/60">
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="relative w-44 h-44 mb-4">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
                      <div className="absolute inset-4 rounded-xl bg-green-200/40 flex items-center justify-center text-6xl">{d.icon}</div>
                      {scanning && (
                        <motion.div
                          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                          initial={{ top: '0%' }}
                          animate={{ top: '100%' }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        />
                      )}
                    </div>
                    <AnimatePresence mode="wait">
                      {scanning ? (
                        <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-cyan-600 text-sm">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />Analyzing crop...
                        </motion.div>
                      ) : (
                        <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                          <div className="text-gray-500 text-xs mb-1">Disease detected</div>
                          <div className="text-gray-900 font-bold">{d.name}</div>
                          <div className={`text-xs mt-1 ${d.colorText}`}>{d.confidence}% confidence</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 items-center z-10">
                  <button className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center"><Upload className="w-4 h-4 text-gray-600" /></button>
                  <button onClick={handleScan} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white/60 active:scale-95 transition-transform">
                    <Camera className="w-7 h-7 text-zinc-700" />
                  </button>
                  <div className="w-10 h-10" />
                </div>
              </div>

              {/* Floating AI card */}
              <AnimatePresence>
                {!scanning && (
                  <motion.div
                    key={d.name}
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    className={`absolute -right-8 top-16 w-52 ${d.colorBg} border ${d.colorBorder} rounded-2xl p-4 shadow-xl`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-4 h-4 ${d.colorText}`} />
                      <span className={`text-xs font-bold ${d.colorText}`}>{d.severity} Risk</span>
                    </div>
                    <div className="text-gray-900 font-semibold text-sm mb-1">{d.name}</div>
                    <div className="text-gray-500 text-xs">{d.crop} · {d.confidence}% accurate</div>
                    <div className="mt-2 text-gray-600 text-xs leading-relaxed">{d.remedy}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -left-6 bottom-20 bg-white border border-green-100 rounded-xl p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="text-gray-700 text-xs font-semibold">AI Accuracy</div>
                    <div className="text-green-600 font-bold text-lg">95.3%</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-bold text-gray-900 font-display mb-4">
              Diagnose crop diseases in{' '}
              <span className="text-cyan-600">3 seconds</span>
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Our AI model, trained on 2M+ crop images, detects diseases early — before visible symptoms spread across your field.
            </p>

            <div className="space-y-4 mb-8">
              {[['🔬', '50+ diseases detected'], ['💊', 'Instant treatment plans'], ['📱', 'Works offline on phone'], ['🗣️', 'Local language support']].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xl">{icon}</span>
                  <span className="text-gray-700 font-medium">{label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-8">
              {diseases.map((dis, i) => (
                <button
                  key={dis.name}
                  onClick={() => { setActive(i); handleScan() }}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                    active === i ? `${dis.colorBg} ${dis.colorBorder}` : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{dis.icon}</span>
                      <div>
                        <span className="text-gray-900 font-medium text-sm">{dis.name}</span>
                        <span className="text-gray-400 text-xs ml-2">· {dis.crop}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${dis.colorBg} ${dis.colorText} border ${dis.colorBorder}`}>
                      {dis.confidence}%
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleScan}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-105"
            >
              <Scan className="w-4 h-4" />
              Try Live Demo
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
