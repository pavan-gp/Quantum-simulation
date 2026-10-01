import React, { useState, useEffect } from 'react'
import { Activity, ShieldAlert, Cpu, BarChart3, Database, KeySquare } from 'lucide-react'
import axios from 'axios'

export default function SecurityMetrics() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/metrics')
      setMetrics(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !metrics) {
    return (
      <div className="font-mono-military text-center py-20 text-army-gold animate-pulse text-xs">
        RETRIEVING SECURITY SHIELD PERFORMANCE TELEMETRY...
      </div>
    )
  }

  return (
    <div className="font-mono-military flex flex-col gap-6 text-xs relative z-10">
      
      {/* HEADER SECTION */}
      <div className="bg-army-panel border border-army-border p-4 rounded flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-army-green border border-army-brightGreen flex items-center justify-center text-army-brightGreen glow-green">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-widest">
            SYSTEM CRYPTO & THREAT SPECTROSCOPY
          </h2>
          <p className="text-[10px] text-gray-500">
            PERFORMANCE GAUGES // ALGORITHM SPEED & COMPROMISE RATIOS
          </p>
        </div>
      </div>

      {/* CORE GAUGES GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "SHIELD SCORE", value: `${metrics.website_security_score}%`, desc: "Active WAF policies", color: "text-army-brightGreen" },
          { label: "QBER ERROR RATIO", value: `${metrics.qber}%`, desc: "BB84 photons sift", color: "text-army-gold" },
          { label: "KEY ENTROPY", value: `${metrics.key_entropy}`, desc: "QRNG generated density", color: "text-army-brightGreen" },
          { label: "DL FILTER ACCURACY", value: `${metrics.deep_learning_accuracy}%`, desc: "Heuristics verification", color: "text-army-gold" }
        ].map((gauge, idx) => (
          <div key={idx} className="glass-panel p-4 rounded border border-army-border text-center">
            <span className="text-gray-500 block font-bold text-[8px] tracking-wider">{gauge.label}</span>
            <div className={`text-2xl font-black my-1 ${gauge.color}`}>{gauge.value}</div>
            <span className="text-[8px] text-gray-400 block">{gauge.desc}</span>
          </div>
        ))}
      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CHART 1: ATTACKS OVER TIME (Custom SVG Line Graph) */}
        <div className="glass-panel p-5 rounded border border-army-border">
          <h3 className="text-army-gold font-bold mb-4 border-b border-army-border pb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            ATTACKS BLOCKED OVER TIME (SECTOR LOGS)
          </h3>
          <div className="bg-black/60 rounded border border-army-border p-4 h-[180px] flex items-end justify-center relative">
            
            {/* Grid background lines */}
            <div className="absolute inset-x-4 top-10 border-t border-army-border/30"></div>
            <div className="absolute inset-x-4 top-20 border-t border-army-border/30"></div>
            <div className="absolute inset-x-4 top-30 border-t border-army-border/30"></div>

            {/* Custom SVG line plot */}
            <svg viewBox="0 0 400 150" className="w-full h-full absolute inset-0 z-10 p-2">
              <path 
                d="M 50 120 L 110 100 L 170 80 L 230 90 L 290 60 L 350 40" 
                fill="none" 
                stroke="#F87171" 
                strokeWidth="2.5" 
                className="glow-red"
              />
              {/* Dot plots */}
              {[
                {x: 50, y: 120, label: "M1"},
                {x: 110, y: 100, label: "M2"},
                {x: 170, y: 80, label: "M3"},
                {x: 230, y: 90, label: "M4"},
                {x: 290, y: 60, label: "M5"},
                {x: 350, y: 40, label: "M6"}
              ].map((dot, dIdx) => (
                <g key={dIdx}>
                  <circle cx={dot.x} cy={dot.y} r="4" fill="#C5A059" />
                  <text x={dot.x - 8} y="145" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">{dot.label}</text>
                </g>
              ))}
            </svg>
            <div className="absolute bottom-2 left-2 text-[8px] text-gray-500">M1 to M6: Audit intervals</div>
          </div>
        </div>

        {/* CHART 2: ENCRYPTION SPEEDS COMPARISON (Custom SVG Bar Plot) */}
        <div className="glass-panel p-5 rounded border border-army-border">
          <h3 className="text-army-gold font-bold mb-4 border-b border-army-border pb-1 flex items-center gap-1.5">
            <KeySquare className="w-4 h-4 text-army-gold" />
            LATENCY COMPARISONS (SPEED MS)
          </h3>
          <div className="bg-black/60 rounded border border-army-border p-4 h-[180px] flex items-end justify-around font-mono-military relative">
            {[
              { name: "QRNG GENERATOR", ms: metrics.layer_performance_ms.qng, max: 20, fill: "bg-army-green" },
              { name: "QKD COHERENCY", ms: metrics.layer_performance_ms.qkd, max: 20, fill: "bg-purple-950/40 border border-purple-500 text-purple-400" },
              { name: "KYBER-768 KEM", ms: metrics.layer_performance_ms.kyber, max: 20, fill: "bg-army-gold/30 border border-army-gold" },
              { name: "DILITHIUM SIG", ms: metrics.layer_performance_ms.dilithium, max: 20, fill: "bg-army-gold/30 border border-army-gold" },
              { name: "AES-256 GCM", ms: metrics.layer_performance_ms.aes_gcm, max: 20, fill: "bg-army-green" }
            ].map((bar, bIdx) => (
              <div key={bIdx} className="flex flex-col items-center w-12 text-center z-10">
                <span className="text-[8px] text-white font-bold mb-1">{bar.ms}ms</span>
                {/* Bar fill */}
                <div 
                  className={`w-4 rounded-t transition-all ${bar.fill}`}
                  style={{ height: `${(bar.ms / bar.max) * 100}px` }}
                ></div>
                <span className="text-[6px] text-gray-500 mt-2 truncate w-14" title={bar.name}>{bar.name}</span>
              </div>
            ))}
            
            {/* Background grids */}
            <div className="absolute inset-x-4 top-10 border-t border-army-border/30"></div>
            <div className="absolute inset-x-4 top-20 border-t border-army-border/30"></div>
            <div className="absolute inset-x-4 top-30 border-t border-army-border/30"></div>
          </div>
        </div>

      </div>

      {/* ALGORITHM COMPARISON LIST */}
      <div className="glass-panel p-5 rounded border border-army-border">
        <h3 className="text-army-gold font-bold mb-4 border-b border-army-border pb-1">
          CRYPTOGRAPHIC COMPARATIVE AUDIT MATRIX
        </h3>
        
        <table className="w-full text-center bg-black/40 border border-army-border rounded">
          <thead>
            <tr className="bg-army-panel border-b border-army-border text-gray-400 font-bold text-[9px]">
              <th className="p-2 text-left">ALGORITHM FAMILY</th>
              <th className="p-2">KEY SIZE (BITS)</th>
              <th className="p-2">CLASSICAL SECURITY</th>
              <th className="p-2">SHOR QUANTUM PROTECTION</th>
              <th className="p-2">TRANSMISSION DELAY</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "RSA-2048", size: "2048", classical: "112 bits", quantum: "❌ CRACKED (SHOR)", delay: "0.2ms", color: "text-red-400" },
              { name: "ECDH-256", size: "256", classical: "128 bits", quantum: "❌ CRACKED (SHOR)", delay: "0.1ms", color: "text-red-400" },
              { name: "AES-256-GCM", size: "256", classical: "256 bits", quantum: "✅ SECURE (GROVER SAFE)", delay: "0.01ms", color: "text-army-brightGreen" },
              { name: "Crystals-Kyber-768", size: "768", classical: "192 bits", quantum: "✅ SECURE (LATTICE SAFE)", delay: "8ms", color: "text-army-brightGreen" },
              { name: "Crystals-Dilithium-IV", size: "1160", classical: "128 bits", quantum: "✅ SECURE (LATTICE SAFE)", delay: "12ms", color: "text-army-brightGreen" }
            ].map((alg, idx) => (
              <tr key={idx} className="border-b border-army-border/40 text-[10px]">
                <td className="p-2 text-left font-bold text-gray-300">{alg.name}</td>
                <td className="p-2 text-gray-500">{alg.size}</td>
                <td className="p-2 text-gray-500">{alg.classical}</td>
                <td className={`p-2 font-bold ${alg.color}`}>{alg.quantum}</td>
                <td className="p-2 text-gray-500">{alg.delay}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
