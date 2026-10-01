import React, { useState, useEffect } from 'react'
import { ScrollText, Filter, RefreshCw } from 'lucide-react'
import axios from 'axios'

export default function LogsPage() {
  const [logs, setLogs] = useState([])
  const [filterType, setFilterType] = useState('ALL')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/admin/system')
      setLogs(res.data.audit_logs || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = filterType === 'ALL' 
    ? logs 
    : logs.filter(log => log.event.toUpperCase().includes(filterType))

  return (
    <div className="font-mono-military flex flex-col gap-6 text-xs relative z-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-army-panel border border-army-border p-4 rounded">
        <div>
          <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-army-gold" />
            MILITARY GENERAL AUDIT LOGS
          </h2>
          <p className="text-[10px] text-gray-500 mt-1">
            STDOUT HISTORY AUDIT RECORDS // USER SESSIONS & SHIELD SIGNATURES
          </p>
        </div>

        <div className="flex gap-2">
          {/* Filter dropdown */}
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border border-army-border">
            <Filter className="w-3.5 h-3.5 text-army-gold" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">ALL SECURITY EVENTS</option>
              <option value="LOGIN">LOGIN SESSIONS</option>
              <option value="TRANSMISSION">DATA PATHS</option>
              <option value="THREAT">BLOCKED THREATS</option>
              <option value="BLACKLIST">FIREWALL BLACKLISTS</option>
            </select>
          </div>
          
          <button 
            onClick={fetchLogs}
            disabled={loading}
            className="bg-black/60 text-army-gold border border-army-gold/40 px-4 py-2 rounded hover:bg-army-panel flex items-center gap-2 font-bold text-[10px]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> REFRESH RECORDS
          </button>

          <button 
            onClick={async () => {
              if (window.confirm("Are you sure you want to clear all military audit logs?")) {
                setLoading(true)
                try {
                  await axios.delete('/api/admin/audit-logs')
                  setLogs([])
                } catch (err) { console.error(err) }
                finally { setLoading(false) }
              }
            }}
            disabled={loading}
            className="bg-red-950/40 text-red-400 border border-red-800/40 px-4 py-2 rounded hover:bg-red-900/20 flex items-center gap-2 font-bold text-[10px]"
          >
            CLEAR ALL LOGS
          </button>
        </div>
      </div>

      {/* LOGS TABLE DISPLAY */}
      <div className="glass-panel p-4 rounded border border-army-border flex-1 flex flex-col min-h-[300px]">
        {loading ? (
          <div className="text-center py-20 text-army-gold animate-pulse text-sm">
            QUERYING AUDIT TELEMETRY DATABASE LOGS...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 text-gray-600 italic">
            NO LOG RECORDS DETECTED MATCHING FILTER TYPE
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredLogs.map((log, idx) => {
              const typeLower = log.event.toLowerCase();
              const isFail = typeLower.includes('fail') || typeLower.includes('block') || typeLower.includes('compromise');
              const isSuccess = typeLower.includes('success') || typeLower.includes('verify') || typeLower.includes('register');
              const isData = typeLower.includes('transmit') || typeLower.includes('send');

              return (
                <div 
                  key={log.id || idx} 
                  className={`p-3 rounded border flex items-start justify-between gap-4 text-[10px] transition-colors bg-black/40 hover:bg-black/70 ${
                    isFail ? 'border-red-900/60 bg-red-950/5' : 
                    isSuccess ? 'border-army-green/40 bg-army-green/5' : 
                    isData ? 'border-army-gold/30' : 'border-army-border/40'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <span className="text-army-gold font-bold flex-shrink-0">[{log.timestamp.substring(0, 19).replace('T', ' ')}]</span>
                    <div className="flex-1">
                      <span className={`font-bold tracking-wider mr-2 uppercase ${
                        isFail ? 'text-red-400' : 
                        isSuccess ? 'text-army-brightGreen' : 'text-army-goldLight'
                      }`}>
                        {log.event.replace('_', ' ')}:
                      </span>
                      <span className="text-gray-300 font-sans">{log.details}</span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (log.id) {
                        try {
                          await axios.delete(`/api/admin/audit-logs/${log.id}`)
                          setLogs(prev => prev.filter(l => l.id !== log.id))
                        } catch (err) { console.error(err) }
                      }
                    }}
                    className="text-red-400 hover:text-red-500 font-bold ml-2 text-[9px]"
                    title="Delete log entry"
                  >
                    [x]
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
