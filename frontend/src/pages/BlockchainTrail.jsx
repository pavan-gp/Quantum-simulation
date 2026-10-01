import React, { useState, useEffect } from 'react'
import { Database, ShieldCheck, CheckCircle2, AlertOctagon, HelpCircle, RefreshCw } from 'lucide-react'
import axios from 'axios'

export default function BlockchainTrail() {
  const [chain, setChain] = useState([])
  const [loading, setLoading] = useState(false)
  const [integrityStatus, setIntegrityStatus] = useState(null)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    fetchChain()
  }, [])

  const fetchChain = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/blockchain/chain')
      setChain(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyIntegrity = async () => {
    setVerifying(true)
    setIntegrityStatus(null)
    
    try {
      const res = await axios.get('/api/blockchain/verify')
      setIntegrityStatus(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="font-mono-military flex flex-col gap-6 text-xs relative z-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-army-panel border border-army-border p-4 rounded">
        <div>
          <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
            <Database className="w-5 h-5 text-army-gold" />
            IMMUTABLE DISTRIBUTED AUDIT LEDGER
          </h2>
          <p className="text-[10px] text-gray-500 mt-1">
            TAMPER-EVIDENT CRYPTOGRAPHIC BLOCK EXPLORER NODES
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleVerifyIntegrity}
            disabled={verifying}
            className="bg-army-green text-white border border-army-brightGreen/40 px-4 py-2 rounded hover:bg-green-950 font-bold tracking-widest text-[10px]"
            id="verify-chain-btn"
          >
            {verifying ? 'COMPUTING LEDGER HASHES...' : 'AUDIT CHAIN INTEGRITY'}
          </button>
          
          <button 
            onClick={fetchChain}
            disabled={loading}
            className="bg-black/60 text-army-gold border border-army-gold/40 px-4 py-2 rounded hover:bg-army-panel font-bold text-[10px]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> REFRESH LEDGER
          </button>

          <button 
            onClick={async () => {
              if (window.confirm("Are you sure you want to completely clear and reset the blockchain ledger? (Genesis block will remain)")) {
                setLoading(true)
                try {
                  await axios.delete('/api/blockchain/chain')
                  fetchChain()
                  setIntegrityStatus(null)
                } catch (err) { console.error(err) }
                finally { setLoading(false) }
              }
            }}
            disabled={loading}
            className="bg-red-950/40 text-red-400 border border-red-800/40 px-4 py-2 rounded hover:bg-red-900/20 font-bold text-[10px]"
          >
            RESET LEDGER
          </button>
        </div>
      </div>

      {/* INTEGRITY STATUS ALERT */}
      {integrityStatus && (
        <div className={`p-4 rounded border flex items-center justify-between font-mono-military ${
          integrityStatus.is_valid ? 'bg-army-green/20 border-army-brightGreen text-army-brightGreen glow-green' : 'bg-red-950/20 border-red-800 text-red-400 glow-red'
        }`}>
          <span className="flex items-center gap-2 text-sm font-bold">
            {integrityStatus.is_valid ? <CheckCircle2 className="w-5 h-5 text-army-brightGreen" /> : <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" />}
            {integrityStatus.message}
          </span>
          <span className="text-[8px] bg-black/60 px-2 py-0.5 border border-army-border">PROOF-OF-WORK VERIFIED</span>
        </div>
      )}

      {/* BLOCKS LOG DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 flex flex-col gap-4">
          
          {loading ? (
            <div className="text-center py-20 text-army-gold animate-pulse text-sm">
              QUERYING DISTRIBUTED LEDGER SEQUENCES...
            </div>
          ) : chain.length === 0 ? (
            <div className="text-center py-20 text-gray-600 italic">
              NO BLOCKS LOGGED IN DISTRIBUTED SYSTEM NODE
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {chain.map((block) => {
                const event = block.data.event || block.data.info || 'AUDIT EVENT';
                const isAttack = event.includes('ATTACK') || event.includes('THREAT');
                const isData = event.includes('TRANSMITTED');
                
                return (
                  <div 
                    key={block.index}
                    className={`glass-panel p-4 rounded border transition-all ${
                      isAttack ? 'border-red-900/60 bg-red-950/5' : 
                      isData ? 'border-army-green/60 bg-army-green/5' : 'border-army-border'
                    }`}
                  >
                    {/* Block index and Event Name */}
                    <div className="flex justify-between items-center border-b border-army-border/40 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-army-panel text-army-gold font-bold px-2 py-0.5 rounded border border-army-gold/30">
                          BLOCK #{block.index}
                        </span>
                        <span className={`font-bold ${
                          isAttack ? 'text-red-400' :
                          isData ? 'text-army-brightGreen' : 'text-gray-300'
                        }`}>
                          {event}
                        </span>
                      </div>
                      <span className="text-gray-500 text-[8px]">
                        TIMESTAMP: {new Date(parseFloat(block.timestamp) * 1000).toLocaleString()}
                      </span>
                    </div>

                    {/* Hash block telemetry */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[9px] text-gray-500 mb-3 font-mono-military">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-600">PREVIOUS BLOCK LINK HASH:</span>
                        <span className="text-gray-400 truncate" title={block.previous_hash}>{block.previous_hash}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-600">CURRENT BLOCK HASH:</span>
                        <span className="text-army-gold font-bold truncate" title={block.hash}>{block.hash}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-600">MINING DIFFICULTY NONCE:</span>
                        <span className="text-gray-400 font-bold">{block.nonce}</span>
                      </div>
                    </div>

                    {/* Data contents block */}
                    <div className="bg-black/60 rounded border border-army-border p-3 text-[10px] text-gray-400">
                      <div className="text-army-goldLight mb-1.5 font-bold">BLOCK TRANSACTION DETAILS:</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.keys(block.data).filter(key => key !== 'event').map((key) => (
                          <div key={key}>
                            <span className="text-gray-600 font-bold uppercase block text-[8px]">{key.replace('_', ' ')}:</span>
                            <span className="text-gray-300 truncate block font-bold">{
                              typeof block.data[key] === 'object' ? JSON.stringify(block.data[key]) : String(block.data[key])
                            }</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
