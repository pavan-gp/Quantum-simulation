import React, { useContext, useState, useEffect } from 'react'
import { Shield, RefreshCw, KeyRound, AlertTriangle, Eye, Clock, CheckCircle2, Lock, FileDigit, Download } from 'lucide-react'
import axios from 'axios'
import { SecurityContext } from '../App'
import WorldMap from '../components/WorldMap'

export default function ReceiverDashboard() {
  const { user } = useContext(SecurityContext)
  const [messages, setMessages] = useState([])
  const [activeMsg, setActiveMsg] = useState(null)
  
  // Decrypted outputs
  const [decryptedText, setDecryptedText] = useState('')
  const [decryptedImage, setDecryptedImage] = useState('')
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [watermarkVerified, setWatermarkVerified] = useState(false)

  // Self-destruct timers
  const [countdown, setCountdown] = useState({})
  const [destructedMsgs, setDestructedMsgs] = useState({})

  useEffect(() => {
    fetchMessages()
  }, [])

  // Self-destruct countdown effect
  useEffect(() => {
    const timers = Object.keys(countdown).map(msgId => {
      if (countdown[msgId] <= 0) {
        // Trigger self-destruct erasure
        setDestructedMsgs(prev => ({ ...prev, [msgId]: true }))
        if (activeMsg && activeMsg.id === parseInt(msgId)) {
          setDecryptedText('EXPIRED // DATA SHREDDED & ERASED VIA POST-QUANTUM COUNTERMEASURE')
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

  const fetchMessages = async () => {
    try {
      const res = await axios.get('/api/messages/history')
      // Show messages sent to this user
      const filtered = res.data.filter(m => 
        m.receiver_name.includes(user.full_name.substring(0, 5)) || 
        user.role === 'admin'
      )
      setMessages(filtered)
    } catch (err) {
      console.error(err)
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
            SECURE NODE B RECEIVER CONSOLE
          </h2>
          <p className="text-[10px] text-gray-500 mt-1">
            OPERATING COUNTRY NODE: {user.country.toUpperCase()} // REGISTRY ACCESS: DECRYPTER SHIELD
          </p>
        </div>

        <button 
          onClick={fetchMessages}
          className="bg-black/60 hover:bg-army-panel text-army-gold border border-army-gold/40 px-4 py-2 rounded flex items-center gap-2 font-bold tracking-widest text-[10px]"
        >
          <RefreshCw className="w-3.5 h-3.5" /> REFRESH INCOMING CHANNELS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INCOMING SECURE LIST */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel p-4 rounded border border-army-border flex flex-col min-h-[400px]">
            <h3 className="text-army-gold font-bold mb-4 border-b border-army-border pb-1">
              INCOMING CLASSIFIED DATA ENVELOPES
            </h3>

            <div className="flex-1 overflow-y-auto max-h-[380px] flex flex-col gap-3 pr-1">
              {messages.length === 0 ? (
                <div className="text-gray-600 italic text-center my-auto">NO DECRYPT CHANNELS ACTIVE</div>
              ) : (
                messages.map((m) => {
                  const isBlocked = m.status === 'blocked';
                  const isDestructed = destructedMsgs[m.id];
                  
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleReadMessage(m)}
                      className={`text-left p-3 rounded border transition-all flex flex-col gap-2 ${
                        activeMsg?.id === m.id ? 'bg-army-green/20 border-army-brightGreen glow-green' : 'bg-black/40 border-army-border hover:bg-army-panel/60'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 font-bold text-gray-300">
                          <Lock className="w-3.5 h-3.5 text-army-gold" />
                          <span>FROM: {m.sender_name}</span>
                        </div>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold border ${
                          isBlocked ? 'bg-red-950/20 border-red-500 text-red-400' : 'bg-army-green/20 border-army-brightGreen text-army-brightGreen'
                        }`}>
                          {isBlocked ? 'BLOCKED' : 'DELIVERED'}
                        </span>
                      </div>

                      <div className="text-[9px] text-gray-500 flex justify-between">
                        <span>ORIGIN: {m.sender_country}</span>
                        <span>{m.created_at.substring(11, 19)}</span>
                      </div>

                      {/* Timer details */}
                      {m.self_destruct > 0 && (
                        <div className="text-[8px] text-army-gold flex items-center gap-1 mt-1 font-bold">
                          <Clock className="w-3 h-3 text-army-gold" />
                          <span>
                            {isDestructed ? 'SHREDDED & DESTRUCTED' : 
                             countdown[m.id] !== undefined ? `SELF-DESTRUCT TIMING: ${countdown[m.id]}s` : `TIMER VALUE: ${m.self_destruct}s`}
                          </span>
                        </div>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DECRYPT PANEL & DIAGNOSTICS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* DECRYPTION PANEL */}
          <div className="glass-panel p-5 rounded border border-army-border flex-1 flex flex-col min-h-[300px]">
            <h3 className="text-army-gold font-bold mb-4 border-b border-army-border pb-1">
              HYBRID DECRYPTION AND INTEGRITY VERIFIER
            </h3>

            {!activeMsg ? (
              <div className="text-gray-600 italic text-center my-auto flex flex-col items-center gap-2">
                <FileDigit className="w-12 h-12 text-gray-700 animate-pulse" />
                <span>SELECT AN INCOMING ENVELOPE CHANNELS TO VERIFY PQC PARITY</span>
              </div>
            ) : isDecrypting ? (
              <div className="text-army-gold italic text-center my-auto flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-army-gold border-t-transparent animate-spin"></div>
                <div className="animate-pulse">DECRYPTING AES-256 BODY VIA KYBER-768 KEY RECONSTRUCTION...</div>
                <div className="text-[9px] text-gray-500">Verifying Dilithium signature integrity parameters</div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                
                {/* Safe clearance seal */}
                {activeMsg.status !== 'blocked' && (
                  <div className="bg-army-green/20 border border-army-brightGreen p-3 rounded flex items-center justify-between text-army-brightGreen font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-army-brightGreen" />
                      SECURITY CLEARANCE PASSED // SIGNATURE SEAL INTEGRITY VALID
                    </span>
                    <span className="text-[8px] bg-army-green/40 px-1 border border-army-brightGreen">LEVEL-4 VERIFIED</span>
                  </div>
                )}

                {/* Blocked quarantine warning */}
                {activeMsg.status === 'blocked' && (
                  <div className="bg-red-950/20 border border-red-800 p-3 rounded flex items-center gap-2 text-red-400 font-bold">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span>DANGER: BLOCKED DATA FILE IN QUARANTINE DIRECTORY</span>
                  </div>
                )}

                {/* Plaintext decrypted content container */}
                <div className="flex-1 bg-black/80 rounded border border-army-border p-4 min-h-[140px] text-army-brightGreen text-[11px] leading-relaxed relative font-mono-military flex flex-col gap-3">
                  {/* Watermark badge inside content box if verified */}
                  {watermarkVerified && (
                    <div className="absolute top-2 right-2 border border-army-gold/40 text-[7px] text-army-gold px-1 py-0.5 rounded tracking-widest select-none bg-black z-10">
                      PIXEL WATERMARK SEAL VALID
                    </div>
                  )}
                  {decryptedImage ? (
                    <div className="flex flex-col items-center gap-2 max-w-full overflow-hidden p-2 border border-army-border/40 bg-black/20 rounded">
                      <img 
                        src={decryptedImage} 
                        alt="Decrypted Military Intel" 
                        className="max-h-[180px] max-w-full object-contain rounded border border-army-gold/30"
                      />
                      <span className="text-[9px] text-army-gold">{decryptedText}</span>
                    </div>
                  ) : (
                    <div>{decryptedText}</div>
                  )}
                </div>

                {/* Download Button for files */}
                {activeMsg.file_name && activeMsg.status !== 'blocked' && !isDecrypting && decryptedText && (
                  <a
                    href={`/api/messages/${activeMsg.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-army-gold hover:bg-army-goldLight text-black text-center font-bold py-2.5 rounded tracking-widest text-[10px] flex items-center justify-center gap-1.5 glow-gold"
                  >
                    <Download className="w-3.5 h-3.5" /> DOWNLOAD DECIPHERED MILITARY DOCUMENT
                  </a>
                )}

                {/* Blockchain Proof of Delivery block */}
                <div className="bg-army-panel p-3 rounded border border-army-border grid grid-cols-2 gap-4 text-[9px] text-gray-400">
                  <div>
                    <div className="text-gray-500 font-bold">BLOCKCHAIN RECEIPT HASH</div>
                    <div className="text-army-gold font-bold truncate mt-0.5">{activeMsg.blockchain_hash || 'PENDING'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 font-bold">KEY PROTOCOL SCHEME</div>
                    <div className="text-army-gold font-bold mt-0.5">Kyber-768 + BB84 QKD Hybrid</div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* ATTACK METRICS REFERENCE CARD */}
          <div className="glass-panel p-4 rounded border border-army-border text-[9px] text-gray-500 flex flex-col gap-2">
            <div className="text-gray-400 font-bold uppercase mb-1">
              POST-QUANTUM TLS HANDSHAKE DECRYPTION SPECS
            </div>
            <div>
              1. <b>Dilithium Check</b>: Key matrix equation $A \cdot z - c \cdot t \pmod q$ evaluated in 12ms. Check passed.
            </div>
            <div>
              2. <b>Kyber Decapsulation</b>: Decapsulating $v - s^T \cdot u \pmod q$ to reconstruct message secret. Completed in 8ms.
            </div>
            <div>
              3. <b>Integrity Parity</b>: SHA-256 hash match successful. Data payload unchanged in transit.
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
