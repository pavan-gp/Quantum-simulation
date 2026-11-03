import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Cpu, Lock, Radio, Database, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-army-panel/95 border-t border-army-border text-xs text-gray-400 font-mono-military mt-auto z-40 relative">
      {/* CLASSIFIED STRIP */}
      <div className="bg-black/80 border-b border-army-border/60 py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-army-brightGreen animate-pulse"></span>
            <span className="text-army-gold font-bold tracking-wider">CLASSIFICATION:</span>
            <span className="text-gray-300">RESTRICTED // MIL-STD TACTICAL PQC PROTOCOL</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <span className="hidden sm:inline">NIST FIPS 203 / 204 COMPLIANT</span>
            <span className="text-army-border">|</span>
            <span className="text-army-brightGreen flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-army-brightGreen inline" />
              NODE GRID SYNCHRONIZED
            </span>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* BRAND & MISSION */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-army-green/40 border border-army-gold/40 flex items-center justify-center text-army-gold glow-gold">
              <Shield className="w-4 h-4 text-army-gold" />
            </div>
            <div>
              <span className="tracking-widest font-black text-white text-sm">SHIELD // DEFENSE GRID</span>
              <div className="text-[9px] text-army-brightGreen">POST-QUANTUM CRYPTOGRAPHIC MILITARY PORTAL</div>
            </div>
          </div>
          
          <p className="text-[11px] text-gray-400 leading-relaxed max-w-lg font-sans">
            Tactical secure defense communication architecture between cross-border command units (Node A &amp; Node B).
            Guarding classified payload integrity using lattice-based quantum-resistant cryptography, BB84 photon simulation, 
            and zero-tamper distributed ledger consensus.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
            <span className="bg-black/60 border border-army-border px-2 py-1 rounded text-army-brightGreen">
              KYBER-768 KEM
            </span>
            <span className="bg-black/60 border border-army-border px-2 py-1 rounded text-army-gold">
              DILITHIUM-IV
            </span>
            <span className="bg-black/60 border border-army-border px-2 py-1 rounded text-purple-400">
              BB84 QKD
            </span>
            <span className="bg-black/60 border border-army-border px-2 py-1 rounded text-blue-400">
              AES-256-GCM
            </span>
          </div>
        </div>

        {/* QUICK NAVIGATION */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-army-gold" /> TACTICAL MODULES
          </span>
          <nav className="flex flex-col gap-1.5 text-[11px]">
            <Link to="/" className="hover:text-army-gold transition-colors">Command Home</Link>
            <Link to="/sender" className="hover:text-army-gold transition-colors">Comms Portal (Node A / B)</Link>
            <Link to="/quantum" className="hover:text-army-gold transition-colors">Quantum Physics Lab</Link>
            <Link to="/attacks" className="hover:text-army-gold transition-colors">Attack Defense Simulator</Link>
            <Link to="/blockchain" className="hover:text-army-gold transition-colors">Tamper-Proof Audit Ledger</Link>
            <Link to="/metrics" className="hover:text-army-gold transition-colors">Real-Time Security Metrics</Link>
          </nav>
        </div>

        {/* COMPLIANCE & SECURITY CLEARANCE */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-army-brightGreen" /> SECURITY DIRECTIVE
          </span>
          <div className="bg-black/50 border border-army-border p-3 rounded text-[10px] leading-relaxed flex flex-col gap-2">
            <div className="text-gray-300 font-bold">MIL-SPEC 810-H COMPLIANT</div>
            <p className="text-gray-400 font-sans">
              Authorized military personnel only. Unauthorized interception or tampering attempts trigger automatic QBER alerts and cryptographic key isolation.
            </p>
            <div className="text-[9px] text-army-gold pt-1 border-t border-army-border/60">
              AUDIT HASH: SHA-256 VERIFIED
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT BAR */}
      <div className="border-t border-army-border/80 bg-black/90 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px]">
          <div className="text-gray-400 text-center sm:text-left">
            &copy; {currentYear} <strong className="text-white">SHIELD // Post-Quantum Military Defense Systems</strong>. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-[10px]">
            <span>NODE A (USA) &bull; NODE B (UK)</span>
            <span>&bull;</span>
            <span className="text-army-gold">CONFIDENTIAL // DEFENSE GRID v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
