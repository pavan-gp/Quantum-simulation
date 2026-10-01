import React from 'react'

export default function RealTimePipeline({ logs = [], status = 'idle' }) {
  // Ordered sequence of steps in our secure cryptographic pipeline
  const pipelineSteps = [
    { id: 1, name: 'User Authentication & MFA Check', desc: 'Validating cryptographic session signature' },
    { id: 2, name: 'Anti-CSRF & WAF Check', desc: 'Analyzing IP and blocking attack payloads' },
    { id: 3, name: 'Input & Media Scan (NLP / Stego / Malware)', desc: 'AI threat classification and heuristic checks' },
    { id: 4, name: 'QRNG Key Generation', desc: 'True random entropy seeding' },
    { id: 5, name: 'QKD BB84 Key Agreement', desc: 'Exchanging quantum states and measuring QBER' },
    { id: 6, name: 'Crystals-Kyber PQC Encapsulation', desc: 'LWE post-quantum symmetric key encryption' },
    { id: 7, name: 'Crystals-Dilithium Digital Signature', desc: 'Signing transmission to secure integrity' },
    { id: 8, name: 'AES-256-GCM Payload Cipher Seal', desc: 'Final hybrid key block cipher encryption' },
    { id: 9, name: 'Blockchain Immutable Audit Sync', desc: 'Sealing block hashes on decentralized node' }
  ]

  // Map backend logs to our pipeline checks
  const getStepStatus = (stepIndex) => {
    if (status === 'idle') return 'pending'
    
    // Calculate mapping
    // Backend logs increments steps
    const currentLogCount = logs.length
    
    // We group logs to match the 9 pipeline stages
    // 1-3: Website security checks
    // 4: NLP / image / file scan
    // 5-6: QRNG / QKD
    // 7-8: Kyber / Dilithium / SHA3
    // 9: Blockchain
    let targetLogIndex = 0
    if (stepIndex === 0) targetLogIndex = 0 // Auth check
    else if (stepIndex === 1) targetLogIndex = 1 // CSRF / WAF
    else if (stepIndex === 2) targetLogIndex = 3 // NLP scan
    else if (stepIndex === 3) targetLogIndex = 5 // Checksum/QRNG
    else if (stepIndex === 4) targetLogIndex = 6 // QKD
    else if (stepIndex === 5) targetLogIndex = 7 // Kyber
    else if (stepIndex === 6) targetLogIndex = 8 // Dilithium
    else if (stepIndex === 7) targetLogIndex = 10 // SHA3/AES
    else if (stepIndex === 8) targetLogIndex = 13 // Blockchain

    if (currentLogCount > targetLogIndex) {
      // Check if this step failed or succeeded
      const matchedLog = logs.find(l => l.step.includes(pipelineSteps[stepIndex].name.substring(0, 10)) || logs[targetLogIndex])
      if (matchedLog && matchedLog.status === 'FAILED') return 'failed'
      
      // If overall pipeline blocked at this step
      if (status === 'BLOCKED' && currentLogCount <= targetLogIndex + 2) {
        return 'failed'
      }
      return 'success'
    } else if (currentLogCount === targetLogIndex || (currentLogCount > 0 && currentLogCount < targetLogIndex)) {
      if (status === 'BLOCKED') return 'skipped'
      return 'running'
    }
    return 'pending'
  }

  return (
    <div className="glass-panel p-6 rounded border border-army-border font-mono-military crt-effect relative">
      <div className="absolute inset-0 military-grid pointer-events-none opacity-10"></div>
      
      <div className="flex justify-between items-center border-b border-army-border pb-3 mb-4">
        <h3 className="text-army-gold text-sm font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-army-gold animate-pulse"></span>
          REAL-TIME CRYPTOGRAPHIC SHIELD PIPELINE
        </h3>
        <span className={`text-[10px] px-2 py-0.5 rounded border ${
          status === 'DELIVERED' ? 'bg-army-green/20 border-army-brightGreen text-army-brightGreen' :
          status === 'BLOCKED' ? 'bg-army-threatRed/20 border-red-500 text-red-400' :
          status === 'running' ? 'bg-army-gold/10 border-army-gold text-army-gold animate-pulse' :
          'bg-gray-800/40 border-gray-600 text-gray-400'
        }`}>
          STATUS: {status.toUpperCase()}
        </span>
      </div>

      {/* Grid of Checklist steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {pipelineSteps.map((step, idx) => {
          const stepStatus = getStepStatus(idx)
          
          return (
            <div 
              key={step.id} 
              className={`p-3 rounded border flex items-start gap-3 transition-colors ${
                stepStatus === 'success' ? 'bg-army-green/10 border-army-green/40' :
                stepStatus === 'failed' ? 'bg-red-950/20 border-red-800/60' :
                stepStatus === 'running' ? 'bg-army-gold/10 border-army-gold/50' :
                'bg-black/30 border-army-border/30 opacity-60'
              }`}
            >
              {/* Status Circle Indicator */}
              <div className="mt-0.5">
                {stepStatus === 'success' && (
                  <div className="w-4 h-4 rounded-full bg-army-brightGreen text-black flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                )}
                {stepStatus === 'failed' && (
                  <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold animate-ping">
                    ✗
                  </div>
                )}
                {stepStatus === 'running' && (
                  <div className="w-4 h-4 rounded-full border-2 border-army-gold border-t-transparent animate-spin"></div>
                )}
                {stepStatus === 'pending' && (
                  <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-[9px] text-gray-500 font-bold">
                    {step.id}
                  </div>
                )}
                {stepStatus === 'skipped' && (
                  <div className="w-4 h-4 rounded-full bg-gray-800 text-gray-500 flex items-center justify-center text-[10px] font-bold">
                    -
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-bold ${
                  stepStatus === 'success' ? 'text-army-brightGreen' :
                  stepStatus === 'failed' ? 'text-red-400' :
                  stepStatus === 'running' ? 'text-army-goldLight' : 'text-gray-400'
                }`}>
                  {step.name}
                </div>
                <div className="text-[10px] text-gray-500 truncate">{step.desc}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Terminal log panel */}
      <div className="bg-black/80 rounded border border-army-border p-3 h-[120px] overflow-y-auto text-[10px] text-army-brightGreen flex flex-col gap-1.5 scroll-smooth">
        <div className="text-army-gold border-b border-army-border/40 pb-1 mb-1 font-bold">
          SECURE SHELL TELEMETRY STDOUT LOG
        </div>
        {logs.length === 0 && (
          <div className="text-gray-600 italic">SYSTEM IDLE // AWAITING MESSAGE TRANSMISSION INITIATION...</div>
        )}
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-2 items-start leading-4">
            <span className="text-army-gold">[{log.timestamp.substring(11, 19)}]</span>
            <span className={log.status === 'FAILED' ? 'text-red-400 font-bold' : ''}>
              {log.step}: {log.details}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
