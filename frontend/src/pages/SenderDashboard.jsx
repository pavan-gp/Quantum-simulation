import React, { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Send, User, ShieldAlert, FileText, Image as ImageIcon, Trash2, Clock, CheckCircle } from 'lucide-react'
import axios from 'axios'
import { SecurityContext } from '../App'
import WorldMap from '../components/WorldMap'
import RealTimePipeline from '../components/RealTimePipeline'

export default function SenderDashboard() {
  const { 
    user, 
    activeTransmissionLogs, 
    pipelineStatus, 
    setPipelineStatus,
    blockedReport,
    setBlockedReport,
    triggerMockPipelineReset
  } = useContext(SecurityContext)

  const [usersList, setUsersList] = useState([])
  const [receiverId, setReceiverId] = useState('')
  const [msgType, setMsgType] = useState('text') // 'text', 'image', 'file'
  const [textVal, setTextVal] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  
  // Custom toggles
  const [selfDestructSec, setSelfDestructSec] = useState(0)
  const [watermarkImg, setWatermarkImg] = useState(false)

  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTransmissions, setActiveTransmissions] = useState([])

  useEffect(() => {
    fetchUsers()
    fetchHistory()
    triggerMockPipelineReset()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users')
      // Show only Country B users for sending
      const receivers = res.data.filter(u => u.country === 'Country B' || u.role === 'receiver')
      setUsersList(receivers)
      if (receivers.length > 0) setReceiverId(receivers[0].id)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/messages/history')
      setHistory(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!receiverId) return

    setLoading(true)
    triggerMockPipelineReset()
    setPipelineStatus('running')
    
    // Set dynamic transmission line animation on map
    setActiveTransmissions([{ status: 'delivered' }])

    try {
      const formData = new FormData()
      formData.append('sender_id', user.id)
      formData.append('receiver_id', receiverId)
      formData.append('message_type', msgType)
      formData.append('self_destruct', selfDestructSec)
      formData.append('watermark', watermarkImg)

      if (msgType === 'text') {
        formData.append('text_content', textVal)
      } else if (selectedFile) {
        formData.append('upload_file', selectedFile)
      }

      const res = await axios.post('/api/transmit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      fetchHistory()
      
      if (res.data.status === 'blocked') {
        setBlockedReport(res.data)
      }

    } catch (err) {
      console.error(err)
      setPipelineStatus('BLOCKED')
    } finally {
      setLoading(false)
      // clear map animation after brief delay
      setTimeout(() => {
        setActiveTransmissions([])
      }, 4000)
    }
  }

  return (
    <div className="font-mono-military flex flex-col gap-6 text-xs relative z-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-army-panel border border-army-border p-4 rounded">
        <div>
          <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
            <Shield className="w-5 h-5 text-army-gold" />
            SECURE NODE A TRANSMISSION CONSOLE
          </h2>
          <p className="text-[10px] text-gray-500 mt-1">
            OPERATING COUNTRY NODE: {user.country.toUpperCase()} // KEY ACCESS LEVEL: LEVEL 4 CLASS-A
          </p>
        </div>
        
        {/* Security Indicator */}
        <div className="flex items-center gap-3">
          <div className="bg-black/60 px-3 py-1.5 rounded border border-army-border text-center">
            <span className="text-gray-500 block text-[8px] uppercase">WAF DEFENSE STATUS</span>
            <span className="text-army-brightGreen font-bold tracking-wider">SECURE // ACTIVE</span>
          </div>
          <div className="bg-black/60 px-3 py-1.5 rounded border border-army-border text-center">
            <span className="text-gray-500 block text-[8px] uppercase">LOCAL QBER RATIO</span>
            <span className="text-army-gold font-bold tracking-wider">1.25% (NOMINAL)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CONTROLS & MAP */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* TACTICAL MAP */}
          <div className="glass-panel p-4 rounded border border-army-border">
            <h3 className="text-army-gold font-bold mb-3 border-b border-army-border pb-1">
              SATELLITE TELEMETRY ROUTING
            </h3>
            <WorldMap transmissions={activeTransmissions} />
          </div>

          {/* INPUT FORMS */}
          <div className="glass-panel p-5 rounded border border-army-border">
            <h3 className="text-army-gold font-bold mb-4 border-b border-army-border pb-1">
              ENVELOPE DATA GENERATION
            </h3>

            <form onSubmit={handleSend} className="flex flex-col gap-4">
              {/* Select Receiver */}
              <div>
                <label className="block text-gray-400 mb-1">SELECT INTEL TARGET RECEIVER (NODE B)</label>
                <select 
                  value={receiverId} 
                  onChange={(e) => setReceiverId(e.target.value)}
                  className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none focus:border-army-gold"
                  required
                >
                  <option value="" disabled>-- Choose Recipient Officer --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.army_id}) - {u.country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Msg Type Selector */}
              <div>
                <label className="block text-gray-400 mb-1">MESSAGE ENVELOPE STRUCT</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'text', label: 'MILITARY TEXT', icon: FileText },
                    { id: 'image', label: 'FORENSIC IMAGE', icon: ImageIcon },
                    { id: 'file', label: 'DOCUMENT FILE', icon: Shield }
                  ].map((t) => {
                    const Icon = t.icon
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setMsgType(t.id)
                          setSelectedFile(null)
                        }}
                        className={`py-2 rounded border flex flex-col items-center gap-1.5 transition-all ${
                          msgType === t.id ? 'bg-army-green/20 border-army-brightGreen text-army-brightGreen font-bold glow-green' : 'bg-black/40 border-army-border text-gray-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[9px]">{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Data Content Box */}
              {msgType === 'text' ? (
                <div>
                  <label className="block text-gray-400 mb-1">CLASSIFIED COMMAND DATA</label>
                  <textarea
                    required
                    rows="3"
                    value={textVal}
                    onChange={(e) => setTextVal(e.target.value)}
                    className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none focus:border-army-gold"
                    placeholder="Enter message text... (NLP scanning parses coordinates, SQLi, and secret words)"
                    id="message-textarea"
                  />
                </div>
              ) : (
                <div className="bg-black/40 p-4 rounded border border-dashed border-army-border text-center flex flex-col items-center gap-2">
                  <input
                    type="file"
                    required
                    onChange={handleFileChange}
                    className="w-full text-center text-gray-400"
                    id="file-uploader"
                  />
                  <span className="text-[9px] text-gray-500">
                    Max size: 10MB. {msgType === 'image' ? 'Accepts .jpg, .png. Performs pixel entropy scan.' : 'Accepts binary documents. Performs headers malware audit.'}
                  </span>
                </div>
              )}

              {/* Advanced cryptographic filters */}
              <div className="border-t border-army-border/40 pt-3 mt-1 grid grid-cols-2 gap-4">
                
                {/* Self destruct */}
                <div>
                  <label className="block text-gray-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-army-gold" />
                    SELF-DESTRUCT COUNTER
                  </label>
                  <select 
                    value={selfDestructSec} 
                    onChange={(e) => setSelfDestructSec(parseInt(e.target.value))}
                    className="w-full bg-black/60 border border-army-border rounded p-1.5 text-[10px] text-white focus:outline-none focus:border-army-gold"
                  >
                    <option value="0">Disabled (Persistent)</option>
                    <option value="10">10 Seconds</option>
                    <option value="30">30 Seconds</option>
                    <option value="60">60 Seconds</option>
                  </select>
                </div>

                {/* Watermarking (only for images) */}
                <div>
                  <label className="block text-gray-400 mb-1 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-army-gold" />
                    PIXEL WATERMARKING
                  </label>
                  <button
                    type="button"
                    disabled={msgType !== 'image'}
                    onClick={() => setWatermarkImg(!watermarkImg)}
                    className={`w-full py-1.5 rounded border text-[10px] font-bold transition-all ${
                      watermarkImg && msgType === 'image' ? 'bg-army-gold/20 border-army-gold text-army-gold glow-gold' : 'bg-black/40 border-army-border text-gray-500'
                    }`}
                  >
                    {watermarkImg && msgType === 'image' ? 'WATERMARK APPLIED' : 'WATERMARK DISABLED'}
                  </button>
                </div>

              </div>

              {/* Submit Transmit Button */}
              <button
                type="submit"
                disabled={loading || !receiverId}
                className="w-full bg-army-green hover:bg-green-950 text-white font-bold py-2.5 rounded border border-army-brightGreen/50 tracking-widest text-xs flex items-center justify-center gap-2 glow-green disabled:opacity-50"
                id="send-securely-btn"
              >
                <Send className="w-4 h-4" />
                SEND SECURELY VIA POST-QUANTUM SHIELD
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: PIPELINE VIEW & LOGS HISTORY */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* REAL TIME PIPELINE */}
          <RealTimePipeline logs={activeTransmissionLogs} status={pipelineStatus} />

          {/* DETECTED THREAT ALERT BOX */}
          {pipelineStatus === 'BLOCKED' && blockedReport && (
            <div className="bg-red-950/20 border border-red-800 p-4 rounded flex flex-col gap-2 font-mono-military glow-red">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                DANGER: TRANSMISSION INJECTION THREAT INTERCEPTED!
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                The security firewall WAF has detected dangerous payload signatures. Transaction block recorded in SQLite blockchain log.
              </p>
              <div className="flex gap-4 text-[10px] mt-2">
                <Link 
                  to={`/threat-report?type=${blockedReport.threats?.join(',')}&sev=${blockedReport.severity}&layer=${blockedReport.layer_blocked}`} 
                  className="text-army-gold underline font-bold"
                >
                  [VIEW IMMUTABLE THREAT REPORT DIAGNOSTICS]
                </Link>
              </div>
            </div>
          )}

          {/* HISTORICAL SENT LOG */}
          <div className="glass-panel p-4 rounded border border-army-border flex-1 flex flex-col min-h-[180px]">
            <h3 className="text-army-gold font-bold mb-3 border-b border-army-border pb-1">
              SENT TRANSMISSIONS AUDIT RECORD
            </h3>

            <div className="flex-1 overflow-y-auto max-h-[220px] flex flex-col gap-2 pr-1">
              {history.filter(h => h.sender_name.includes(user.full_name.substring(0, 5))).length === 0 ? (
                <div className="text-gray-600 italic text-center my-auto">NO TRANSITIONS ON RECORD FOR THIS NODE</div>
              ) : (
                history
                  .filter(h => h.sender_name.includes(user.full_name.substring(0, 5)))
                  .map((h) => (
                    <div key={h.id} className="bg-black/40 border border-army-border p-2.5 rounded flex items-center justify-between text-[10px]">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className={`w-1.5 h-1.5 rounded-full ${h.status === 'delivered' ? 'bg-army-brightGreen' : 'bg-red-500'}`}></span>
                          <span className="text-gray-300">TO: {h.receiver_name}</span>
                          <span className="text-[8px] bg-army-border px-1 text-gray-500">{h.receiver_country}</span>
                        </div>
                        <div className="text-gray-500 text-[8px] mt-1">
                          DATE: {h.created_at.substring(0, 19)} // TYPE: {h.file_name ? 'BINARY' : 'TEXT'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${h.status === 'delivered' ? 'text-army-brightGreen' : 'text-red-400'}`}>
                          {h.status.toUpperCase()}
                        </span>
                        <div className="text-[8px] text-gray-600 truncate max-w-[120px]">{h.blockchain_hash ? `BLOCK: ${h.blockchain_hash.substring(0,10)}...` : ''}</div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
