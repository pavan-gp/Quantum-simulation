import React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ShieldAlert, AlertTriangle, ShieldCheck, Download, ChevronLeft, MapPin } from 'lucide-react'

export default function ThreatReport() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const type = searchParams.get('type') || 'Steganography Intrusion Anomaly'
  const severity = searchParams.get('sev') || 'HIGH'
  const layer = searchParams.get('layer') || 'AI Image Forensics Entropy Scan'
  const description = searchParams.get('desc') || 'Unusual LSB parity noise density exceeding 0.99 threshold. Steganographic file payload container suspected in image pixels.'
  
  // Custom mock location details
  const mockIp = "185.228.168.10"
  const mockCoords = "55.7558° N, 37.6173° E (Moscow Node)"

  const handleDownloadPdf = () => {
    const params = new URLSearchParams({
      threat_type: type,
      severity: severity,
      layer: layer,
      desc: description,
      ip: mockIp,
      coords: mockCoords,
      block_index: 24, // sample index
      block_hash: "0000abc1237e19273f1293817abedcf109283f12893abc92138ebfa212abdf3e",
      previous_hash: "0000fbc9871e98273f1293817abedcf109283f12893abc92138ebfa212abdf11",
      timestamp: String(new Date())
    })
    window.open(`/api/threat-report/download?${params.toString()}`)
  }

  return (
    <div className="font-mono-military flex flex-col gap-6 text-xs relative z-10">
      
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex justify-between items-center bg-army-panel border border-army-border p-4 rounded">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1.5 rounded border border-army-border hover:bg-black/40 text-army-gold"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
              TOP SECRET // AUDIT SECURITY DIAGNOSTIC REPORT
            </h2>
            <p className="text-[10px] text-gray-500 mt-1">
              REPORT REF SN-99824-SHIELD // QUARANTINE SEGMENT LOCKDOWN
            </p>
          </div>
        </div>

        <button 
          onClick={handleDownloadPdf}
          className="bg-army-gold hover:bg-army-goldLight text-black font-bold px-4 py-2 rounded flex items-center gap-2 tracking-widest text-[10px]"
        >
          <Download className="w-3.5 h-3.5" /> DOWNLOAD SIGNED PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CRITICAL THREAT STATS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-panel p-5 rounded border border-army-border flex flex-col gap-5">
            <h3 className="text-army-gold font-bold text-sm border-b border-army-border pb-2">
              DIAGNOSTIC DETAILED TELEMETRY
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/60 p-4 rounded border border-army-border">
                <span className="text-gray-500 block font-bold text-[8px]">THREAT VECTOR TYPE</span>
                <span className="text-white font-bold text-sm tracking-wider block mt-1">{type.toUpperCase()}</span>
              </div>
              <div className="bg-black/60 p-4 rounded border border-army-border">
                <span className="text-gray-500 block font-bold text-[8px]">SEVERITY ASSESSED CODE</span>
                <span className={`font-black text-sm tracking-wider block mt-1 ${
                  severity === 'CRITICAL' || severity === 'HIGH' ? 'text-red-500 animate-pulse' : 'text-army-gold'
                }`}>{severity}</span>
              </div>
              <div className="bg-black/60 p-4 rounded border border-army-border">
                <span className="text-gray-500 block font-bold text-[8px]">INTERCEPTING GATEWAY SHIELD</span>
                <span className="text-army-brightGreen font-bold text-sm block mt-1">{layer}</span>
              </div>
              <div className="bg-black/60 p-4 rounded border border-army-border">
                <span className="text-gray-500 block font-bold text-[8px]">ACTION CODE EXECUTED</span>
                <span className="text-red-400 font-bold text-sm block mt-1">QUARANTINE BLOCKED</span>
              </div>
            </div>

            <div>
              <h4 className="text-gray-400 font-bold uppercase mb-2">Detailed Payload Analysis & Signature Match</h4>
              <div className="bg-black/80 rounded border border-army-border p-4 text-[11px] leading-relaxed text-gray-300">
                {description}
              </div>
            </div>

            <div className="bg-army-panel p-3 rounded border border-army-border flex flex-col gap-2">
              <span className="text-army-gold font-bold">RECOMMENDED SYSTEM SHIELD ACTIONS:</span>
              <ul className="list-disc pl-4 flex flex-col gap-1 text-gray-400">
                <li>Deploy hardware firewall filters targeting IP subnet <b>{mockIp}</b>.</li>
                <li>Execute full-system host quarantine diagnostics at target Country Node coordinates.</li>
                <li>Verify next-block hash on mutable ledger sequence blocks to audit tamper states.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ATTACKER ORIGIN COORDINATES */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-5 rounded border border-army-border flex flex-col gap-4">
            <h3 className="text-army-gold font-bold text-sm border-b border-army-border pb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-army-gold" />
              INTRUDER TELEMETRY
            </h3>
            
            <div className="bg-black/60 p-4 rounded border border-army-border text-center">
              <div className="text-[10px] text-gray-500 font-bold">ATTACK ORIGIN COORDINATE</div>
              <div className="text-red-400 font-bold text-sm mt-1">{mockCoords}</div>
            </div>

            <div className="bg-black/60 p-4 rounded border border-army-border text-center">
              <div className="text-[10px] text-gray-500 font-bold">ATTACK SOURCE ROUTE IP</div>
              <div className="text-red-400 font-bold text-sm mt-1">{mockIp}</div>
            </div>

            <div className="bg-army-panel border border-army-border p-3.5 rounded text-[10px] text-gray-500">
              <b>Tactical Sync Note</b>: WAF modules have shared this telemetry configuration with secondary routers. All connections originating from coordinate grid segment blocked for 24 hours.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
