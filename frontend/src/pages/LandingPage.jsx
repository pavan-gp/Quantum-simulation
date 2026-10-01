import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Lock, Cpu, Globe2, ChevronRight, Activity, Database, CheckCircle2 } from 'lucide-react'
import ParticleBackground from '../components/ParticleBackground'
import WorldMap from '../components/WorldMap'
import { SecurityContext } from '../App'

export default function LandingPage() {
  const { user } = useContext(SecurityContext)
  const navigate = useNavigate()
  const [activeTransmissions, setActiveTransmissions] = useState([])

  // Redirect if logged in already
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin')
      else if (user.country === 'Country A') navigate('/sender')
      else navigate('/receiver')
    }
  }, [user, navigate])

  // Mock a dynamic transmission line pulse on the world map occasionally
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
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center py-6 font-mono-military">
      {/* Dynamic Animated Particles background */}
      <ParticleBackground />

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 relative">
        {/* LEFT COLUMN: INTRO & BADGES */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex items-center gap-2 bg-army-green/20 border border-army-green text-army-brightGreen text-[10px] py-1 px-3 rounded-full w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-army-brightGreen animate-ping"></span>
            DEFENSE-GRADE QUANTUM COMMAND SYSTEM ACTIVE
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight font-sans">
            POST-QUANTUM <br />
            <span className="text-army-gold">SECURE COMMAND PORTAL</span>
          </h1>

          <p className="text-xs text-gray-400 leading-relaxed font-sans max-w-xl">
            SHIELD is a cross-country military communication pipeline. Utilizing modular 
            LWE-based Crystals-Kyber encryption, Crystals-Dilithium digital signatures, 
            and quantum-simulated BB84 key distribution protocols to counter threat vectors, 
            including Grover-brute force and Shor-factoring quantum algorithms.
          </p>

          {/* QUICK LINKS / CTAs */}
          <div className="flex flex-wrap gap-4 mt-2">
            <Link 
              to="/login" 
              className="bg-army-green text-white border border-army-brightGreen/50 px-6 py-3 rounded text-xs font-bold hover:bg-green-900 transition-all flex items-center gap-2 glow-green"
              id="portal-login-btn"
            >
              ACCESS SECURE MILITARY PORTAL <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* SECURE TRUST BADGES */}
          <div className="border-t border-army-border/60 pt-6 mt-4">
            <div className="text-[10px] text-gray-500 mb-3 tracking-widest uppercase font-bold">
              SYSTEM SECURITY CREDENTIALS
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "PQC AES-256", desc: "Modular LWE Sealed" },
                { name: "BB84 QKD SIM", desc: "Software Photons" },
                { name: "BLOCKCHAIN AUDIT", desc: "Tamper Proof Ledger" },
                { name: "WAF PROTECTED", desc: "AI Threat Filter" }
              ].map((badge, idx) => (
                <div key={idx} className="bg-army-panel/60 border border-army-border p-2 rounded flex flex-col gap-0.5">
                  <span className="text-army-gold text-[10px] font-bold">{badge.name}</span>
                  <span className="text-gray-500 text-[8px]">{badge.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WORLD MAP HUB */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-army-panel border border-army-border rounded p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-bold flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-army-gold" /> LIVE MILITARY TRANSMISSION LINK
              </span>
              <span className="text-gray-500 text-[10px]">PING INTERVAL: 3.2ms</span>
            </div>

            {/* Tactical satellite map widget */}
            <WorldMap transmissions={activeTransmissions} />

            {/* Map Statistics bar */}
            <div className="grid grid-cols-3 gap-2 bg-black/60 p-3 rounded border border-army-border text-center text-[10px]">
              <div>
                <div className="text-gray-500 font-bold">NODE A GRID</div>
                <div className="text-army-brightGreen font-bold mt-0.5">SENDER</div>
              </div>
              <div>
                <div className="text-gray-500 font-bold">NODE B GRID</div>
                <div className="text-army-brightGreen font-bold mt-0.5">RECEIVER</div>
              </div>
              <div>
                <div className="text-gray-500 font-bold">LINK INTEGRITY</div>
                <div className="text-army-gold font-bold mt-0.5">100% IMMUTABLE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
