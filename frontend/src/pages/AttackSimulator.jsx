import React, { useState } from 'react'
import { ShieldAlert, Play, AlertTriangle, ShieldCheck, Download, ServerCrash } from 'lucide-react'
import axios from 'axios'
import WorldMap from '../components/WorldMap'

export default function AttackSimulator() {
  const [loading, setLoading] = useState(false)
  const [activeAttack, setActiveAttack] = useState(null)
  const [result, setResult] = useState(null)

  const attacksList = [
    { id: 'MITM', name: 'Man-In-The-Middle (MITM) Intercept', category: 'CLASSICAL', desc: 'Sniffing packet headers to compromise transit keys.' },
    { id: 'Replay', name: 'Replay Signature Injection', category: 'CLASSICAL', desc: 'Resending historical handshakes to hijack auth sessions.' },
    { id: 'Malware', name: 'Binary Malware Payload Attach', category: 'CLASSICAL', desc: 'Executing packaged Trojans or backdoors via file uploads.' },
    { id: 'Steganography', name: 'LSB Steganographic Trailing Data', category: 'CLASSICAL', desc: 'Hiding command files inside image pixel boundaries.' },
    { id: 'XSS', name: 'Reflected XSS Chat Injection', category: 'WEBSITE', desc: 'Injecting Javascript scripts into chat forms.' },
    { id: 'SQLi', name: 'SQL Query Bypass Parameter', category: 'WEBSITE', desc: 'Triggering raw query bypass strings like UNION SELECT.' },
    { id: 'DDoS', name: 'Volumetric IP DDoS Flood', category: 'WEBSITE', desc: 'Saturating gateway ports with fake packet loops.' },
    { id: 'Eavesdrop', name: 'QKD BB84 Optical Sniffer Probe', category: 'QUANTUM', desc: 'Interrogating transmission fibers to read photon polarities.' },
    { id: 'Grover', name: 'Grover Qubit Cipher Brute Force', category: 'QUANTUM', desc: 'Quantum database amplitude search to crack 128-bit keys.' },
    { id: 'Shor', name: 'Shor Qubit RSA Prime Factorizer', category: 'QUANTUM', desc: 'Solving modular prime exponents to crack classical public keys.' }
  ]

  const handleTriggerAttack = async (attack) => {
    setLoading(true)
    setResult(null)
    setActiveAttack(attack)

    try {
      const formData = new FormData()
      formData.append('attack_type', attack.id)

      const res = await axios.post('/api/simulate-attack', formData)
      
      // Keep displaying the attack telemetry briefly
      setResult(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = () => {
    if (!result) return
    
    // Construct download url with query parameters
    const params = new URLSearchParams({
      threat_type: result.attack_type + " ATTACK VECTOR",
      severity: result.severity,
      layer: result.layer,
      desc: result.desc,
      ip: result.ip,
      coords: result.coords,
      block_index: result.blockchain_block,
      block_hash: result.blockchain_hash,
      previous_hash: result.previous_hash || 'N/A',
      timestamp: result.timestamp
    })

    window.open(`/api/threat-report/download?${params.toString()}`)
  }

  return (
    <div className="font-mono-military flex flex-col gap-6 text-xs relative z-10">
      
      {/* HEADER SECTION */}
      <div className="bg-army-panel border border-army-border p-4 rounded flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-army-threatRed/20 border border-red-500 flex items-center justify-center text-red-500 glow-red">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-widest">
            SIMULATED RED-TEAM THREATS INJECTOR
          </h2>
          <p className="text-[10px] text-gray-500">
            AUDIT PENETRATION SHIELD PIPELINE ACCORDING TO NSA STANDARDS
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: LIST OF ATTACKS */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-panel p-4 rounded border border-army-border flex-1 flex flex-col min-h-[400px]">
            <h3 className="text-army-gold font-bold mb-4 border-b border-army-border pb-1">
              PENETRATION THREAT MATRICES
            </h3>

            <div className="flex-1 overflow-y-auto max-h-[380px] flex flex-col gap-3 pr-1">
              {attacksList.map((attack) => (
                <div 
                  key={attack.id}
                  className="bg-black/40 border border-army-border p-3 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] px-1 rounded font-bold ${
                        attack.category === 'QUANTUM' ? 'bg-purple-950/20 border border-purple-500 text-purple-400' :
                        attack.category === 'WEBSITE' ? 'bg-blue-950/20 border border-blue-500 text-blue-400' :
                        'bg-gray-800 border border-gray-600 text-gray-400'
                      }`}>
                        {attack.category}
                      </span>
                      <span className="font-bold text-gray-300">{attack.name}</span>
                    </div>
                    <p className="text-[9px] text-gray-500 mt-1 leading-4">{attack.desc}</p>
                  </div>
                  
                  <button
                    onClick={() => handleTriggerAttack(attack)}
                    disabled={loading}
                    className="bg-army-threatRed/20 hover:bg-red-950 border border-red-500 text-red-400 px-3 py-2 rounded font-bold tracking-widest text-[9px] flex items-center gap-1.5 glow-red self-start sm:self-center"
                  >
                    <Play className="w-3 h-3 text-red-500 fill-red-500" /> LAUNCH
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RADAR MAP & INTRUSION RESULT */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* RADAR MAP */}
          <div className="glass-panel p-4 rounded border border-army-border">
            <h3 className="text-army-gold font-bold mb-3 border-b border-army-border pb-1">
              TACTICAL RADAR VECTOR INTRUSIONS
            </h3>
            <WorldMap activeAttack={result} showHeatmap={result !== null} />
          </div>

          {/* TELEMETRY ALERT RESULT */}
          <div className="glass-panel p-5 rounded border border-army-border flex-1 flex flex-col min-h-[180px]">
            <h3 className="text-army-gold font-bold mb-4 border-b border-army-border pb-1">
              DIAGNOSTIC BLOCK ANALYSIS
            </h3>

            {!result ? (
              <div className="text-gray-600 italic text-center my-auto flex flex-col items-center gap-2">
                <ServerCrash className="w-12 h-12 text-gray-700 animate-pulse" />
                <span>LAUNCH A THREAT VECTOR FROM THE INJECTOR PANELS TO MEASURE RESPONSIVENESS</span>
              </div>
            ) : loading ? (
              <div className="text-red-400 italic text-center my-auto flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin"></div>
                <div className="animate-pulse">ANALYZING ATTACK STACK FLOOD PATTERNS...</div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                
                {/* Attack Block Seal */}
                <div className="bg-red-950/20 border border-red-800 p-3.5 rounded flex items-center justify-between text-red-400 font-bold glow-red animate-pulse">
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    STATUS: ATTACK INTERCEPTED & IP LOGGED IN BLACKLIST
                  </span>
                  <span className="text-[8px] bg-red-900/40 px-1 border border-red-500">BLOCKED</span>
                </div>

                {/* Details list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/60 p-4 rounded border border-army-border text-[10px]">
                  <div>
                    <div className="text-gray-500 font-bold">ATTACK CLASSIFICATION</div>
                    <div className="text-white font-bold mt-0.5">{result.attack_type} INTRUSION</div>
                  </div>
                  <div>
                    <div className="text-gray-500 font-bold">INTERCEPTING SHIELD LAYER</div>
                    <div className="text-army-gold font-bold mt-0.5">{result.layer}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 font-bold">ATTACKER IP TELEMETRY</div>
                    <div className="text-white mt-0.5">{result.ip} ({result.coords})</div>
                  </div>
                  <div>
                    <div className="text-gray-500 font-bold">BLOCKCHAIN BLOCK LOG</div>
                    <div className="text-army-brightGreen font-bold mt-0.5">BLOCK #{result.blockchain_block}</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleDownloadPdf}
                    className="flex-1 bg-army-gold text-black font-bold py-2 rounded hover:bg-army-goldLight transition-colors flex items-center justify-center gap-2 glow-gold text-xs font-mono-military"
                  >
                    <Download className="w-4 h-4 text-black" />
                    DOWNLOAD DECLASSIFIED THREAT PDF REPORT
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
