import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Shield, Cpu, Globe2, ChevronRight, 
  ShieldAlert, KeyRound
} from 'lucide-react'
import ParticleBackground from '../components/ParticleBackground'
import WorldMap from '../components/WorldMap'
import { SecurityContext } from '../App'

export default function LandingPage() {
  const { user, setUser } = useContext(SecurityContext)
  const navigate = useNavigate()
  const [activeTransmissions, setActiveTransmissions] = useState([])

  // Mock dynamic transmission line pulses on the world map
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTransmissions([{ status: 'delivered' }])
      setTimeout(() => {
        setActiveTransmissions([])
      }, 2500)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-[calc(100vh-120px)] flex flex-col justify-center py-4 font-mono-military">
      {/* Dynamic Animated Particles background */}
      <ParticleBackground />

      {/* HERO SECTION */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 relative mb-10">
        
        {/* LEFT COLUMN: HERO INTRO */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <div className="flex items-center gap-2 bg-army-green/30 border border-army-brightGreen/60 text-army-brightGreen text-[11px] py-1.5 px-3.5 rounded-full w-fit backdrop-blur-sm glow-green">
            <span className="w-2 h-2 rounded-full bg-army-brightGreen animate-ping"></span>
            <span>POST-QUANTUM HYBRID DEFENSE SHIELD ACTIVE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none font-sans">
            POST-QUANTUM <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-army-gold via-yellow-200 to-army-goldLight">
              MILITARY PORTAL
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans max-w-xl">
            A defense-grade tactical communication system between <strong>Army Node A (Country 1)</strong> and <strong>Army Node B (Country 2)</strong>. 
            Engineered with lattice-based <strong>Crystals-Kyber-768 KEM</strong>, <strong>Crystals-Dilithium-IV signatures</strong>, 
            software-simulated <strong>BB84 Quantum Key Distribution</strong>, and immutable <strong>blockchain audit logging</strong>.
          </p>

          {/* PRIMARY CTAS */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link 
              to="/login" 
              className="bg-army-green text-white border border-army-brightGreen/70 px-6 py-3 rounded text-xs font-bold hover:bg-green-800 transition-all flex items-center gap-2 glow-green shadow-lg"
              id="portal-login-btn"
            >
              <KeyRound className="w-4 h-4 text-army-gold" />
              <span>ACCESS SECURE PORTAL</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link 
              to="/quantum" 
              className="bg-black/60 hover:bg-army-panel text-army-gold border border-army-gold/40 px-5 py-3 rounded text-xs font-bold transition-all flex items-center gap-2 glow-gold"
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>EXPLORE QUANTUM LAB</span>
            </Link>

            <Link 
              to="/attacks" 
              className="bg-black/60 hover:bg-army-panel text-red-400 border border-red-500/40 px-5 py-3 rounded text-xs font-bold transition-all flex items-center gap-2 glow-red"
            >
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>ATTACK SIMULATOR</span>
            </Link>
          </div>

          {/* SYSTEM BADGES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {[
              { name: "Crystals-Kyber", desc: "Module-LWE KEM", color: "border-green-500/40 text-army-brightGreen" },
              { name: "Crystals-Dilithium", desc: "Quantum Signatures", color: "border-yellow-500/40 text-army-gold" },
              { name: "BB84 QKD Protocol", desc: "QBER Error Detection", color: "border-purple-500/40 text-purple-300" },
              { name: "Proof-of-Work Ledger", desc: "Zero-Tamper Audit", color: "border-blue-500/40 text-blue-300" }
            ].map((badge, idx) => (
              <div key={idx} className={`bg-army-panel/80 border p-2.5 rounded flex flex-col gap-0.5 backdrop-blur-sm ${badge.color}`}>
                <span className="text-[11px] font-bold">{badge.name}</span>
                <span className="text-gray-400 text-[9px]">{badge.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: WORLD MAP HUB */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="glass-panel border border-army-border rounded p-4 flex flex-col gap-3 shadow-2xl">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-200 font-bold flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-army-gold animate-spin-slow" /> 
                <span>TACTICAL CROSS-BORDER NODE TELEMETRY</span>
              </span>
              <span className="text-army-brightGreen text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-army-brightGreen animate-pulse"></span>
                LIVE SATELLITE
              </span>
            </div>

            {/* Tactical satellite map widget */}
            <WorldMap transmissions={activeTransmissions} />

            {/* Map Telemetry status */}
            <div className="grid grid-cols-3 gap-2 bg-black/70 p-3 rounded border border-army-border text-center text-[10px]">
              <div>
                <div className="text-gray-400 font-bold">NODE A (USA)</div>
                <div className="text-army-brightGreen font-bold mt-0.5">SENDER ACTIVE</div>
              </div>
              <div>
                <div className="text-gray-400 font-bold">NODE B (UK)</div>
                <div className="text-army-brightGreen font-bold mt-0.5">RECEIVER READY</div>
              </div>
              <div>
                <div className="text-gray-400 font-bold">ENCRYPTION STATE</div>
                <div className="text-army-gold font-bold mt-0.5">HYBRID QUANTUM-SAFE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
