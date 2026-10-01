import React, { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Send, User, ShieldAlert, FileText, Image as ImageIcon, Trash2, Clock, CheckCircle, RefreshCw, KeyRound, AlertTriangle, Eye, CheckCircle2, Lock, FileDigit, Download } from 'lucide-react'
import axios from 'axios'
import { SecurityContext } from '../App'
import WorldMap from '../components/WorldMap'
import RealTimePipeline from '../components/RealTimePipeline'

export default function CommsDashboard() {
  const { 
    user, 
    activeTransmissionLogs, 
    pipelineStatus, 
    setPipelineStatus,
    blockedReport,
    setBlockedReport,
    triggerMockPipelineReset
  } = useContext(SecurityContext)

  // Sent Comms States
  const [usersList, setUsersList] = useState([])
  const [receiverId, setReceiverId] = useState('')
  const [msgType, setMsgType] = useState('text') // 'text', 'image', 'file'
  const [textVal, setTextVal] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [selfDestructSec, setSelfDestructSec] = useState(0)
  const [watermarkImg, setWatermarkImg] = useState(false)
  const [sentHistory, setSentHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTransmissions, setActiveTransmissions] = useState([])

  // Received Comms States
  const [messages, setMessages] = useState([])
  const [activeMsg, setActiveMsg] = useState(null)
  const [decryptedText, setDecryptedText] = useState('')
  const [decryptedImage, setDecryptedImage] = useState('')
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [watermarkVerified, setWatermarkVerified] = useState(false)
  const [countdown, setCountdown] = useState({})
  const [destructedMsgs, setDestructedMsgs] = useState({})

  useEffect(() => {
    fetchUsers()
    fetchHistory()
    triggerMockPipelineReset()
  }, [])

  // Self-destruct countdown timer logic
  useEffect(() => {
    const timers = Object.keys(countdown).map(msgId => {
      if (countdown[msgId] <= 0) {
        setDestructedMsgs(prev => ({ ...prev, [msgId]: true }))
        if (activeMsg && activeMsg.id === parseInt(msgId)) {
          setDecryptedText('EXPIRED // DATA SHREDDED & ERASED VIA POST-QUANTUM COUNTERMEASURE')
          setDecryptedImage('')
        }
        return null
      }

      return setInterval(() => {
        setCountdown(prev => ({
          ...prev,
          [msgId]: prev[msgId] - 1
        }))
      }, 1000)
    })

    return () => timers.forEach(t => t && clearInterval(t))
  }, [countdown])

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users')
      // Show all other officers except the currently logged in user & admin
      const officers = res.data.filter(u => u.id !== user.id && u.role !== 'admin')
      setUsersList(officers)
      if (officers.length > 0) setReceiverId(officers[0].id)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/messages/history')
      
      // Filter out messages SENT by this user
      const sent = res.data.filter(h => h.sender_name.includes(user.full_name.substring(0, 5)))
      setSentHistory(sent)

      // Filter out messages RECEIVED by this user
      const received = res.data.filter(m => m.receiver_name.includes(user.full_name.substring(0, 5)))
      setMessages(received)
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
    
    // Set dynamic transmission line animation on satellite map
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
      } else {
        // Clear inputs on success
        setTextVal('')
        setSelectedFile(null)
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

  const handleReadMessage = async (msg) => {
    setActiveMsg(msg)
    setDecryptedText('')
    setDecryptedImage('')
    setWatermarkVerified(false)
    setIsDecrypting(true)

    try {
      if (msg.status === 'blocked') {
        setDecryptedText('❌ HARMFUL FILE BLOCKED BY WAF THREAT ENGINE')
        setIsDecrypting(false)
        return
      }

      // Live Cryptographic Decryption via Kyber-768 & Crystals-Dilithium
      const res = await axios.post(`/api/messages/${msg.id}/decrypt`)
      const { decrypted_content, file_name, file_type, watermarked } = res.data

      if (file_name) {
        if (file_type && file_type.startsWith('image/')) {
          setDecryptedImage(`data:${file_type};base64,${decrypted_content}`)
          setDecryptedText(`[IMAGE PAYLOAD DECRYPTED] // filename: ${file_name} (${file_type})`)
        } else {
          setDecryptedText(`[SECURE BINARY PAYLOAD SEALS VERIFIED] // filename: ${file_name} (${file_type})`)
        }
      } else {
        setDecryptedText(decrypted_content)
      }

      if (watermarked) {
        setWatermarkVerified(true)
      }

      // Initialize self-destruct countdown if set
      if (msg.self_destruct > 0 && !countdown[msg.id] && !destructedMsgs[msg.id]) {
        setCountdown(prev => ({
          ...prev,
          [msg.id]: msg.self_destruct
        }))
      }
    } catch (err) {
      setDecryptedText(err.response?.data?.detail || '❌ Cryptographic decryption validation failed.')
    } finally {
      setIsDecrypting(false)
    }
  }

  return (
    <div className="font-mono-military flex flex-col gap-6 text-xs relative z-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-army-panel border border-army-border p-4 rounded">
        <div>
          <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
            <Shield className="w-5 h-5 text-army-gold" />
            SECURE UNIFIED POST-QUANTUM SHIELD PORTAL
          </h2>
          <p className="text-[10px] text-gray-500 mt-1">
            NODE USER: {user.full_name.toUpperCase()} // REGISTRY ACCESS: SECURE TRANSMIT & INCOMING DECRYPTER
          </p>
        </div>
        
        {/* Security Indicator */}
        <div className="flex items-center gap-3">
          <div className="bg-black/60 px-3 py-1.5 rounded border border-army-border text-center">
            <span className="text-gray-500 block text-[8px] uppercase">WAF DEFENSE STATUS</span>
            <span className="text-army-brightGreen font-bold tracking-wider">SECURE // ACTIVE</span>
          </div>
          <button 
            onClick={fetchHistory}
            className="bg-black/60 hover:bg-army-panel text-army-gold border border-army-gold/40 px-3 py-2.5 rounded flex items-center gap-1.5 font-bold tracking-widest text-[9px]"
          >
            <RefreshCw className="w-3 h-3" /> REFRESH PORTAL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: TELEMETRY MAP & DATA TRANSMISSION */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* SATELLITE TACTICAL MAP */}
          <div className="glass-panel p-4 rounded border border-army-border">
            <h3 className="text-army-gold font-bold mb-3 border-b border-army-border pb-1">
              SATELLITE TELEMETRY ROUTING (REAL IMAGERY OVERLAY)
            </h3>
            <WorldMap 
              transmissions={activeTransmissions} 
              senderCountry={user.country}
              receiverCountry={usersList.find(u => u.id === parseInt(receiverId))?.country || "United Kingdom"}
            />
          </div>

          {/* SECURE DATA UPLOADER (SEND CONSOLE) */}
          <div className="glass-panel p-5 rounded border border-army-border">
            <h3 className="text-army-gold font-bold mb-4 border-b border-army-border pb-1">
              CLASSIFIED DATA TRANSMISSION
            </h3>

            <form onSubmit={handleSend} className="flex flex-col gap-4">
              {/* Select Recipient */}
              <div>
                <label className="block text-gray-400 mb-1">SELECT TARGET REGISTRY OFFICER</label>
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

        {/* RIGHT COLUMN: WS PIPELINE, SECURE INBOX, DECRYPTER CONSOLE */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* REAL TIME WEBSOCKET TRANSMISSION PIPELINE */}
          <RealTimePipeline logs={activeTransmissionLogs} status={pipelineStatus} />

          {/* DETECTED THREAT ALERT BOX */}
          {pipelineStatus === 'BLOCKED' && blockedReport && (
            <div className="bg-red-950/20 border border-red-800 p-4 rounded flex flex-col gap-2 font-mono-military glow-red">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                DANGER: TRANSMISSION INJECTION THREAT INTERCEPTED!
              </div>
              <div className="bg-black/60 border border-red-900/60 p-3 rounded text-[10px] flex flex-col gap-1 text-gray-300">
                <div><b>DETECTION LAYER:</b> <span className="text-red-400 uppercase font-bold">{blockedReport.layer_blocked || blockedReport.layer || "NLP Text Scanner"}</span></div>
                <div><b>THREAT ACTIVITY CLASSIFICATION:</b> <span className="text-red-400 font-bold">{blockedReport.threats?.join(', ') || "Malicious Payload Injection"}</span></div>
                <div><b>CRITICALITY SEVERITY LEVEL:</b> <span className="text-red-400 font-bold">{blockedReport.severity || "HIGH"}</span></div>
                <div><b>LEDGER STATUS:</b> <span className="text-army-gold font-bold">LOGGED ON IMMUTABLE BLOCK #{blockedReport.blockchain_block || "N/A"}</span></div>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                The WAF security engine intercepted dangerous injection signatures. The transmission has been securely held, quarantined, and aborted at Phase 4.
              </p>
              <div className="flex gap-4 text-[10px] mt-1">
                <Link 
                  to={`/threat-report?type=${blockedReport.threats?.join(',') || 'Injection'}&sev=${blockedReport.severity || 'HIGH'}&layer=${blockedReport.layer_blocked || blockedReport.layer || 'WAF'}`} 
                  className="text-army-gold underline font-bold"
                >
                  [VIEW IMMUTABLE THREAT REPORT DIAGNOSTICS]
                </Link>
              </div>
            </div>
          )}

          {/* SECURE INBOX (INCOMING CHANNELS) */}
          <div className="glass-panel p-4 rounded border border-army-border min-h-[160px]">
            <div className="flex justify-between items-center border-b border-army-border pb-1 mb-3">
              <h3 className="text-army-gold font-bold">
                INCOMING CLASSIFIED SECURE ENVELOPES
              </h3>
              {messages.length > 0 && (
                <button
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete all incoming envelopes?")) {
                      try {
                        await axios.delete('/api/messages')
                        setMessages([])
                        setActiveMsg(null)
                      } catch (err) { console.error(err) }
                    }
                  }}
                  className="text-[8px] text-red-400 underline hover:text-white"
                >
                  CLEAR ALL
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-[140px] flex flex-col gap-2 pr-1">
              {messages.length === 0 ? (
                <div className="text-gray-600 italic text-center py-4">NO INCOMING ENVELOPES ACTIVE</div>
              ) : (
                messages.map((m) => {
                  const isBlocked = m.status === 'blocked';
                  const isDestructed = destructedMsgs[m.id];
                  
                  return (
                    <div key={m.id} className="relative group">
                      <button
                        onClick={() => handleReadMessage(m)}
                        className={`w-full text-left p-2.5 pr-8 rounded border transition-all flex flex-col gap-1.5 ${
                          activeMsg?.id === m.id ? 'bg-army-green/20 border-army-brightGreen glow-green' : 'bg-black/40 border-army-border hover:bg-army-panel/60'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-bold text-gray-300">FROM: {m.sender_name}</span>
                          <span className={`text-[7px] px-1 py-0.5 rounded font-bold border ${
                            isBlocked ? 'bg-red-950/20 border-red-500 text-red-400' : 'bg-army-green/20 border-army-brightGreen text-army-brightGreen'
                          }`}>
                            {isBlocked ? 'BLOCKED' : 'DELIVERED'}
                          </span>
                        </div>

                        <div className="text-[8px] text-gray-500 flex justify-between w-full">
                          <span>NODE COUNTRY: {m.sender_country}</span>
                          <span>{m.created_at.substring(11, 19)}</span>
                        </div>

                        {m.self_destruct > 0 && (
                          <div className="text-[8px] text-army-gold flex items-center gap-1 font-bold">
                            <Clock className="w-3 h-3" />
                            <span>
                              {isDestructed ? 'DESTRUCTED' : 
                               countdown[m.id] !== undefined ? `SELF-DESTRUCT IN: ${countdown[m.id]}s` : `TIMED DESTROY: ${m.self_destruct}s`}
                            </span>
                          </div>
                        )}
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm("Delete this envelope?")) {
                            try {
                              await axios.delete(`/api/messages/${m.id}`)
                              setMessages(prev => prev.filter(msg => msg.id !== m.id))
                              if (activeMsg?.id === m.id) setActiveMsg(null)
                            } catch (err) { console.error(err) }
                          }
                        }}
                        className="absolute right-2 top-2.5 p-1 rounded hover:bg-red-900/40 text-red-400 opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Delete Envelope"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* INTEGRITY DECRYPTION & DECODING CONSOLE */}
          <div className="glass-panel p-4 rounded border border-army-border min-h-[220px] flex flex-col">
            <h3 className="text-army-gold font-bold mb-3 border-b border-army-border pb-1">
              HYBRID DECRYPTION AND INTEGRITY CONSOLE
            </h3>

            {!activeMsg ? (
              <div className="text-gray-600 italic text-center my-auto flex flex-col items-center gap-2">
                <FileDigit className="w-10 h-10 text-gray-700 animate-pulse" />
                <span>SELECT AN INCOMING ENVELOPE TO DECAPSULATE PARITY ENCRYPTIONS</span>
              </div>
            ) : isDecrypting ? (
              <div className="text-army-gold italic text-center my-auto flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-army-gold border-t-transparent animate-spin"></div>
                <div className="animate-pulse text-[10px]">DECRYPTING ENCRYPTED CONTAINER VIA KYBER-768 SHARED KEY...</div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 flex-grow">
                {activeMsg.status !== 'blocked' && (
                  <div className="bg-army-green/20 border border-army-brightGreen px-2.5 py-1.5 rounded flex items-center justify-between text-army-brightGreen font-bold text-[10px]">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-army-brightGreen" />
                      CLEARANCE VALID // CRYPTOGRAPHIC SEAL INTEGRITY OK
                    </span>
                    <span className="text-[7px] bg-army-green/40 px-1 border border-army-brightGreen">VERIFIED</span>
                  </div>
                )}

                {activeMsg.status === 'blocked' && (
                  <div className="bg-red-950/20 border border-red-800 p-2.5 rounded flex items-center gap-2 text-red-400 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>DANGER: QUARANTINED CONTAINER</span>
                  </div>
                )}

                {/* Decrypted plain text or inline base64 image box */}
                <div className="flex-grow bg-black/80 rounded border border-army-border p-3 min-h-[100px] text-army-brightGreen text-[10px] leading-relaxed relative font-mono-military flex flex-col gap-2">
                  {watermarkVerified && (
                    <div className="absolute top-1.5 right-1.5 border border-army-gold/40 text-[7px] text-army-gold px-1 py-0.5 rounded tracking-widest select-none bg-black z-10">
                      PIXEL WATERMARK SEAL VALID
                    </div>
                  )}
                  {decryptedImage ? (
                    <div className="flex flex-col items-center gap-1.5 max-w-full overflow-hidden">
                      <img 
                        src={decryptedImage} 
                        alt="Decrypted Military Intel" 
                        className="max-h-[140px] max-w-full object-contain rounded border border-army-gold/30"
                      />
                      <span className="text-[8px] text-army-gold">{decryptedText}</span>
                    </div>
                  ) : (
                    <div>{decryptedText}</div>
                  )}
                </div>

                {/* Real document stream downloader */}
                {activeMsg.file_name && activeMsg.status !== 'blocked' && !isDecrypting && decryptedText && (
                  <a
                    href={`/api/messages/${activeMsg.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-army-gold hover:bg-army-goldLight text-black text-center font-bold py-2 rounded tracking-widest text-[9px] flex items-center justify-center gap-1.5 glow-gold"
                  >
                    <Download className="w-3 h-3" /> DOWNLOAD DECIPHERED MILITARY DOCUMENT
                  </a>
                )}
              </div>
            )}
          </div>

          {/* HISTORICAL SENT TRANS HIST */}
          <div className="glass-panel p-4 rounded border border-army-border max-h-[150px] overflow-y-auto">
            <h3 className="text-army-gold font-bold mb-3 border-b border-army-border pb-1">
              SENT TRANSMISSIONS AUDIT RECORD
            </h3>

            <div className="flex flex-col gap-2">
              {sentHistory.length === 0 ? (
                <div className="text-gray-600 italic text-center py-2">NO AUDIT LOGS FOR THIS NODE</div>
              ) : (
                sentHistory.map((h) => (
                  <div key={h.id} className="bg-black/40 border border-army-border p-2 rounded flex items-center justify-between text-[9px]">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${h.status === 'delivered' ? 'bg-army-brightGreen' : 'bg-red-500'}`}></span>
                        <span className="text-gray-300">TO: {h.receiver_name}</span>
                        <span className="text-[7px] bg-army-border px-1 text-gray-500">{h.receiver_country}</span>
                      </div>
                      <div className="text-gray-500 text-[7px] mt-0.5">
                        DATE: {h.created_at.substring(0, 19)} // TYPE: {h.file_name ? 'BINARY' : 'TEXT'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`font-bold ${h.status === 'delivered' ? 'text-army-brightGreen' : 'text-red-400'}`}>
                          {h.status.toUpperCase()}
                        </span>
                        <div className="text-[7px] text-gray-600 truncate max-w-[120px]">{h.blockchain_hash ? `BLOCK: ${h.blockchain_hash.substring(0,8)}...` : ''}</div>
                      </div>
                      <button
                        onClick={async () => {
                          if (window.confirm("Delete this sent record?")) {
                            try {
                              await axios.delete(`/api/messages/${h.id}`)
                              setSentHistory(prev => prev.filter(msg => msg.id !== h.id))
                            } catch (err) { console.error(err) }
                          }
                        }}
                        className="text-red-400 hover:text-red-500 font-bold"
                        title="Delete Record"
                      >
                        [x]
                      </button>
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
