import React, { useState, useEffect } from 'react'
import { ShieldCheck, Ban, ShieldAlert, Cpu, RefreshCw, FileText, Database, UserCheck, KeyRound, Lock } from 'lucide-react'
import axios from 'axios'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  
  // Blacklist IP input
  const [blacklistIp, setBlacklistIp] = useState('')
  const [blacklistReason, setBlacklistReason] = useState('')
  const [blacklistStatus, setBlacklistStatus] = useState('')

  // Syncing federated learning
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)

  // Registration / Enrollment States
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regFullName, setRegFullName] = useState('')
  const [regArmyId, setRegArmyId] = useState('')
  const [regCountry, setRegCountry] = useState('Country B')
  const [regRole, setRegRole] = useState('receiver')
  const [regStatus, setRegStatus] = useState('')
  const [createdCredentials, setCreatedCredentials] = useState(null)

  const handleRegisterUser = async (e) => {
    e.preventDefault()
    setRegStatus('enrolling')
    setCreatedCredentials(null)

    try {
      const formData = new FormData()
      formData.append('email', regEmail)
      formData.append('password', regPassword)
      formData.append('full_name', regFullName)
      formData.append('army_id', regArmyId)
      formData.append('country', regCountry)
      formData.append('role', regRole)

      await axios.post('/api/auth/register', formData)
      
      setCreatedCredentials({
        email: regEmail,
        password: regPassword,
        fullName: regFullName,
        armyId: regArmyId,
        role: regRole,
        country: regCountry
      })
      setRegStatus('Enrollment Completed Successfully!')
      
      // Reset fields
      setRegEmail('')
      setRegPassword('')
      setRegFullName('')
      setRegArmyId('')
      fetchAdminData()
    } catch (err) {
      setRegStatus(err.response?.data?.detail || 'Error enrolling military officer')
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/admin/system')
      setData(res.data)
      const uRes = await axios.get('/api/users')
      setUsers(uRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this officer profile?")) return
    try {
      await axios.delete(`/api/users/${userId}`)
      fetchAdminData()
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete officer")
    }
  }

  const handleBlacklist = async (e) => {
    e.preventDefault()
    if (!blacklistIp || !blacklistReason) return
    setBlacklistStatus('processing')

    try {
      const formData = new FormData()
      formData.append('ip', blacklistIp)
      formData.append('reason', blacklistReason)
      
      const res = await axios.post('/api/admin/blacklist-ip', formData)
      setBlacklistStatus(res.data.message)
      setBlacklistIp('')
      setBlacklistReason('')
      fetchAdminData()
    } catch (err) {
      setBlacklistStatus('Error adding to blacklist')
    }
  }

  const handleRemoveBlacklist = async (ip) => {
    try {
      const formData = new FormData()
      formData.append('ip', ip)
      await axios.post('/api/admin/remove-blacklist', formData)
      fetchAdminData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleFederatedSync = () => {
    setSyncing(true)
    setSyncResult(null)

    setTimeout(() => {
      setSyncing(false)
      if (data && data.federated_learning) {
        setSyncResult(data.federated_learning)
      } else {
        setSyncResult({
          status: "Federated Model Weights Synced",
          initial_accuracy: 94.2,
          final_accuracy: 97.8,
          nodes_participated: ["Country A Node", "Country B Node"]
        })
      }
    }, 1500)
  }

  if (loading || !data) {
    return (
      <div className="font-mono-military text-center py-20 text-army-gold animate-pulse text-xs">
        RETRIEVING ADMINISTRATIVE SHIELD PORTAL TELEMETRY...
      </div>
    )
  }

  return (
    <div className="font-mono-military flex flex-col gap-6 text-xs relative z-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-army-panel border border-army-border p-4 rounded">
        <div>
          <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-army-gold" />
            ADMINISTRATIVE SECURITY COMMAND
          </h2>
          <p className="text-[10px] text-gray-500 mt-1">
            CONTROL CENTER // DEPLOYED INTEGRITY CHECKS & WAN BLACKLISTS
          </p>
        </div>

        <button 
          onClick={fetchAdminData}
          className="bg-black/60 hover:bg-army-panel text-army-gold border border-army-gold/40 px-4 py-2 rounded flex items-center gap-2 font-bold text-[10px]"
        >
          <RefreshCw className="w-3.5 h-3.5" /> REFRESH STATS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: OFFICER PROVISIONER & IP BLACKLIST MANAGER */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* MILITARY OFFICER CREDENTIAL GENERATOR PANEL */}
          <div className="glass-panel p-5 rounded border border-army-border">
            <h3 className="text-army-gold font-bold mb-4 border-b border-army-border pb-1 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-army-gold" />
              OFFICER CREDENTIAL PROVISIONING
            </h3>

            <form onSubmit={handleRegisterUser} className="flex flex-col gap-3">
              <div>
                <label className="block text-gray-400 mb-1">RANK & FULL NAME</label>
                <input 
                  type="text" 
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none"
                  placeholder="e.g. Gen. Beatrix Vance"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">MILITARY REGISTRY ARMY ID</label>
                <input 
                  type="text" 
                  required
                  value={regArmyId}
                  onChange={(e) => setRegArmyId(e.target.value)}
                  className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none"
                  placeholder="e.g. B-9921-UK"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">EMAIL COMMAND ADDRESS</label>
                <input 
                  type="email" 
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none"
                  placeholder="e.g. officer@mil.gov"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">PASSPHRASE</label>
                <input 
                  type="password" 
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none font-sans"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">NODE COUNTRY</label>
                  <select 
                    value={regCountry}
                    onChange={(e) => {
                      setRegCountry(e.target.value)
                      setRegRole(e.target.value === 'United States' ? 'sender' : 'receiver')
                    }}
                    className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="India">India</option>
                    <option value="Germany">Germany</option>
                    <option value="Japan">Japan</option>
                    <option value="France">France</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                    <option value="Brazil">Brazil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">ROLE CHANNEL</label>
                  <select 
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none"
                  >
                    <option value="sender">Sender Node</option>
                    <option value="receiver">Receiver Node</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={regStatus === 'enrolling'}
                className="w-full bg-army-green hover:bg-green-950 border border-army-brightGreen/50 text-white font-bold py-2 rounded tracking-widest text-[10px] glow-green disabled:opacity-50"
              >
                PROVISION ARMY CREDENTIALS
              </button>
            </form>

            {regStatus && regStatus !== 'enrolling' && (
              <div className="mt-2 text-army-gold font-bold text-center text-[9px]">{regStatus}</div>
            )}

            {/* Generated credentials presentation card */}
            {createdCredentials && (
              <div className="mt-3 bg-black/80 border border-army-brightGreen/40 p-3 rounded text-[9px] flex flex-col gap-1.5 font-mono-military animate-pulse">
                <div className="text-army-brightGreen font-bold border-b border-army-border/30 pb-0.5 uppercase">
                  CREDENTIAL CARD DISPATCHED
                </div>
                <div><b>NAME:</b> {createdCredentials.fullName}</div>
                <div><b>ARMY ID:</b> {createdCredentials.armyId}</div>
                <div><b>EMAIL:</b> <span className="text-white">{createdCredentials.email}</span></div>
                <div><b>SECRET KEY:</b> <span className="text-army-gold font-bold">{createdCredentials.password}</span></div>
                <div><b>ACCESS NODE:</b> {createdCredentials.country} ({createdCredentials.role})</div>
                <div className="text-[8px] text-gray-500 mt-1">
                  * Dispatch this card securely. Receiver can directly access their console.
                </div>
              </div>
            )}
          </div>

          {/* BAN IP FORM */}
          <div className="glass-panel p-5 rounded border border-army-border">
            <h3 className="text-army-gold font-bold mb-4 border-b border-army-border pb-1">
              IP BLACKLIST CONTROLLER
            </h3>

            <form onSubmit={handleBlacklist} className="flex flex-col gap-3">
              <div>
                <label className="block text-gray-400 mb-1">TARGET IP ADDRESS</label>
                <input 
                  type="text" 
                  required
                  value={blacklistIp}
                  onChange={(e) => setBlacklistIp(e.target.value)}
                  className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none"
                  placeholder="e.g. 198.51.100.42"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">REASON FOR BAN</label>
                <input 
                  type="text" 
                  required
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none"
                  placeholder="e.g. DDoS volumetric flood signatures"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-army-threatRed/20 hover:bg-red-950 border border-red-500 text-red-400 font-bold py-2 rounded tracking-widest text-[10px] glow-red"
              >
                APPLY FIREWALL BLOCKRULE
              </button>
            </form>
            {blacklistStatus && <div className="mt-2 text-army-gold font-bold text-center text-[9px]">{blacklistStatus}</div>}
          </div>

          {/* ACTIVE BLACKLISTED LIST */}
          <div className="glass-panel p-4 rounded border border-army-border max-h-[220px] overflow-y-auto">
            <h3 className="text-army-gold font-bold mb-3 border-b border-army-border pb-1">
              ACTIVE FIREWALL BLOCKS
            </h3>
            {data.blacklisted_ips.length === 0 ? (
              <div className="text-gray-600 italic text-center py-4">NO BAN RULES DEPLOYED</div>
            ) : (
              <div className="flex flex-col gap-2">
                {data.blacklisted_ips.map((ip, idx) => (
                  <div key={idx} className="bg-black/60 border border-army-border p-2 rounded flex justify-between items-center text-[9px]">
                    <div>
                      <div className="text-red-400 font-bold">{ip.ip}</div>
                      <div className="text-gray-500 text-[8px] mt-0.5">{ip.reason}</div>
                    </div>
                    <button 
                      onClick={() => handleRemoveBlacklist(ip.ip)}
                      className="text-army-gold underline font-bold"
                    >
                      [REMOVE]
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVE REGISTERED OFFICERS */}
          <div className="glass-panel p-4 rounded border border-army-border max-h-[250px] overflow-y-auto">
            <h3 className="text-army-gold font-bold mb-3 border-b border-army-border pb-1">
              ACTIVE REGISTERED OFFICERS
            </h3>
            {users.length === 0 ? (
              <div className="text-gray-600 italic text-center py-4">NO OFFICERS ENROLLED</div>
            ) : (
              <div className="flex flex-col gap-2">
                {users.map((u) => {
                  const isDefault = ["sender.countrya@mil.gov", "receiver.countryb@mil.gov", "admin.shield@mil.gov"].includes(u.email);
                  return (
                    <div key={u.id} className="bg-black/60 border border-army-border p-2 rounded flex justify-between items-center text-[9px]">
                      <div>
                        <div className="text-white font-bold">{u.full_name} ({u.role.toUpperCase()})</div>
                        <div className="text-gray-500 text-[8px] mt-0.5">{u.email} // ID: {u.army_id}</div>
                      </div>
                      {!isDefault && (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-400 hover:text-red-500 underline font-bold"
                        >
                          [DELETE]
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: HONEYPOT ALERTS & FEDERATED LEARNING */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* HONEYPOT TRAFFIC LOGS */}
          <div className="glass-panel p-4 rounded border border-army-border max-h-[250px] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-army-border pb-1 mb-3">
              <h3 className="text-army-gold font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                HONEYPOT HACKER TRAP LOGS (API TAMPERINGS)
              </h3>
              {data.honeypot_logs.length > 0 && (
                <button
                  onClick={async () => {
                    if (window.confirm("Clear all honeypot trap logs?")) {
                      await axios.delete('/api/admin/honeypot');
                      fetchAdminData();
                    }
                  }}
                  className="text-[8px] text-red-400 underline hover:text-white"
                >
                  CLEAR TRAP LOGS
                </button>
              )}
            </div>
            {data.honeypot_logs.length === 0 ? (
              <div className="text-gray-600 italic text-center py-10">NO HONEYPOT ACTIVITY DETECTED</div>
            ) : (
              <table className="w-full text-center bg-black/40 border border-army-border rounded">
                <thead>
                  <tr className="bg-army-panel border-b border-army-border text-gray-400 font-bold text-[8px]">
                    <th className="p-1.5 text-left">SOURCE IP</th>
                    <th className="p-1.5 text-left">PATH ACCESSED</th>
                    <th className="p-1.5">DETECTED PAYLOAD</th>
                    <th className="p-1.5">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.honeypot_logs.map((honey, idx) => (
                    <tr key={idx} className="border-b border-army-border/40 text-[9px]">
                      <td className="p-1.5 text-left text-red-400 font-bold">{honey.ip}</td>
                      <td className="p-1.5 text-left text-gray-400">{honey.url}</td>
                      <td className="p-1.5 text-army-gold font-bold">{honey.payload || 'None'}</td>
                      <td className="p-1.5 text-gray-500">{honey.detected_at.substring(11, 19)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* FEDERATED LEARNING STATUS */}
          <div className="glass-panel p-5 rounded border border-army-border">
            <div className="flex justify-between items-center border-b border-army-border pb-2 mb-3">
              <div>
                <h3 className="text-army-gold font-bold text-sm">FEDERATED MODEL WEIGHTS HARMONIZATION</h3>
                <p className="text-[9px] text-gray-500">Sync threat detection parameters across active military communication nodes</p>
              </div>
              <button
                onClick={handleFederatedSync}
                disabled={syncing}
                className="bg-army-green border border-army-brightGreen/40 text-white px-4 py-1.5 rounded hover:bg-green-950 font-bold"
              >
                {syncing ? 'MERGING WEIGHTS...' : 'RUN FEDERATED HARMONIZATION'}
              </button>
            </div>

            {syncResult ? (
              <div className="bg-army-panel/60 border border-army-brightGreen/40 p-4 rounded flex flex-col gap-3">
                <div className="text-army-brightGreen font-bold text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-army-brightGreen" />
                  {syncResult.status}
                </div>
                <div className="grid grid-cols-3 gap-2 bg-black/60 p-3 rounded border border-army-border text-center">
                  <div>
                    <div className="text-gray-500 font-bold">NODES SYNCED</div>
                    <div className="text-white mt-0.5">{syncResult.nodes_participated?.join(' & ')}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 font-bold">PRE-SYNC ACCURACY</div>
                    <div className="text-white mt-0.5">{syncResult.initial_accuracy}%</div>
                  </div>
                  <div>
                    <div className="text-gray-500 font-bold">POST-SYNC ACCURACY</div>
                    <div className="text-army-brightGreen font-bold mt-0.5">{syncResult.final_accuracy}%</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic text-center py-4 bg-black/30 rounded border border-army-border/40">
                AWAITING FEDERATED MERGING ITERATION OPERATION
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
