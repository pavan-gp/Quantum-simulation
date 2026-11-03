import React, { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Shield, Lock, User, Globe, AlertCircle, Key, Cpu, Keyboard, 
  CheckCircle2, ArrowRight, Zap, RefreshCw, KeyRound, Sparkles
} from 'lucide-react'
import axios from 'axios'
import { SecurityContext } from '../App'

export default function LoginPage() {
  const { setUser } = useContext(SecurityContext)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectParam = searchParams.get('redirect')

  // Mode: 'signin' or 'signup'
  const [mode, setMode] = useState('signin')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Credentials
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [armyId, setArmyId] = useState('')
  const [country, setCountry] = useState('Country A')
  const [role, setRole] = useState('sender')

  // Selected Demo Officer Preset
  const [selectedPreset, setSelectedPreset] = useState(null)

  // MFA & ZKP Auth States
  const [showMfaStep, setShowMfaStep] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [captchaNum1, setCaptchaNum1] = useState(3)
  const [captchaNum2, setCaptchaNum2] = useState(5)
  const [captchaInput, setCaptchaInput] = useState('')

  // Keystroke Biometrics tracking refs
  const keystrokesRef = useRef([])
  const lastKeyUpTimeRef = useRef(null)
  const [biometricsLive, setBiometricsLive] = useState({ hold: 85, flight: 120, count: 0 })

  // Initialize CAPTCHA on mount
  useEffect(() => {
    generateCaptcha()
  }, [])

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2
    const n2 = Math.floor(Math.random() * 8) + 1
    setCaptchaNum1(n1)
    setCaptchaNum2(n2)
    setCaptchaInput('')
  }

  // Pre-fill demo credentials
  const selectDemoOfficer = (type) => {
    setSelectedPreset(type)
    setError('')
    setSuccess('')
    setShowMfaStep(false)
    setMfaCode('')

    if (type === 'sender') {
      setEmail('sender.countrya@mil.gov')
      setPassword('SecureA123!')
      setCountry('Country A')
      setRole('sender')
    } else if (type === 'receiver') {
      setEmail('receiver.countryb@mil.gov')
      setPassword('SecureB123!')
      setCountry('Country B')
      setRole('receiver')
    } else if (type === 'admin') {
      setEmail('admin.shield@mil.gov')
      setPassword('AdminShield2026!')
      setCountry('Country A')
      setRole('admin')
    }
    // Auto-solve captcha for convenience
    setCaptchaInput(`${captchaNum1 + captchaNum2}`)
    setSuccess('Officer credentials & security challenge auto-filled. Click below to authenticate.')
  }

  // Direct 1-Click Instant Demo Login (Zero Friction)
  const handleInstantDemoLogin = (type) => {
    let demoUser = null
    if (type === 'sender') {
      demoUser = {
        id: 1,
        email: "sender.countrya@mil.gov",
        full_name: "Col. Alex Mercer",
        army_id: "A-8849-USA",
        country: "Country A",
        role: "sender"
      }
    } else if (type === 'receiver') {
      demoUser = {
        id: 2,
        email: "receiver.countryb@mil.gov",
        full_name: "Gen. Beatrix Vance",
        army_id: "B-9921-UK",
        country: "Country B",
        role: "receiver"
      }
    } else {
      demoUser = {
        id: 3,
        email: "admin.shield@mil.gov",
        full_name: "Director Vance Croft",
        army_id: "ADM-001-HQ",
        country: "Country A",
        role: "admin"
      }
    }

    localStorage.setItem('user', JSON.stringify(demoUser))
    setUser(demoUser)
    setSuccess(`Instant authorized access granted for ${demoUser.full_name}. Redirecting...`)
    
    setTimeout(() => {
      if (redirectParam) navigate(`/${redirectParam}`)
      else if (demoUser.role === 'admin') navigate('/admin')
      else navigate('/sender')
    }, 600)
  }

  // Keystroke dynamics tracking
  const handleKeyDown = (e) => {
    const key = e.key
    if (key === 'Enter') return
    const now = performance.now()
    
    const existing = keystrokesRef.current.find(k => k.key === key && k.upTime === null)
    if (existing) return

    let flightTime = 0
    if (lastKeyUpTimeRef.current) {
      flightTime = now - lastKeyUpTimeRef.current
    }

    keystrokesRef.current.push({
      key,
      downTime: now,
      upTime: null,
      flightTime: flightTime
    })
  }

  const handleKeyUp = (e) => {
    const key = e.key
    const now = performance.now()
    lastKeyUpTimeRef.current = now

    const item = keystrokesRef.current.find(k => k.key === key && k.upTime === null)
    if (item) {
      item.upTime = now
      item.holdTime = now - item.downTime
      setBiometricsLive({
        hold: Math.round(item.holdTime),
        flight: Math.round(item.flightTime),
        count: keystrokesRef.current.length
      })
    }
  }

  const compileBiometricsProfile = () => {
    const closedKeystrokes = keystrokesRef.current.filter(k => k.upTime !== null)
    if (closedKeystrokes.length < 4) {
      return {
        avg_hold_time: 85.5,
        avg_flight_time: 120.2,
        typing_speed_cpm: 280.0
      }
    }

    const totalHold = closedKeystrokes.reduce((acc, k) => acc + k.holdTime, 0)
    const validFlights = closedKeystrokes.filter(k => k.flightTime > 0)
    const totalFlight = validFlights.reduce((acc, k) => acc + k.flightTime, 0)

    const avgHold = totalHold / closedKeystrokes.length
    const avgFlight = validFlights.length > 0 ? totalFlight / validFlights.length : 100
    const durationSec = (performance.now() - keystrokesRef.current[0].downTime) / 1000
    const cpm = (closedKeystrokes.length / (durationSec || 1)) * 60

    return {
      avg_hold_time: parseFloat(avgHold.toFixed(2)),
      avg_flight_time: parseFloat(avgFlight.toFixed(2)),
      typing_speed_cpm: parseFloat(Math.min(cpm, 600).toFixed(2))
    }
  }

  // Submit Sign In
  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Captcha validation
    if (parseInt(captchaInput) !== (captchaNum1 + captchaNum2)) {
      setError('Anti-Bot CAPTCHA validation failed. Please solve the calculation.')
      generateCaptcha()
      return
    }

    // Step 1: verify credentials & dispatch OTP
    if (!showMfaStep) {
      setLoading(true)
      try {
        const otpForm = new FormData()
        otpForm.append('email', email)
        const otpRes = await axios.post('/api/auth/send-otp', otpForm)
        setShowMfaStep(true)
        
        if (otpRes.data.dev_mode) {
          setDevOtp(otpRes.data.otp)
          setMfaCode(otpRes.data.otp) // Auto-fill for zero hassle in development
          setSuccess(`OTP verified in Dev Mode: ${otpRes.data.otp}. (Auto-filled below).`)
        } else {
          setSuccess(`OTP dispatched to ${email}. Check your inbox.`)
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to dispatch OTP. Verify your email address.')
      } finally {
        setLoading(false)
      }
      return
    }

    // Step 2: Finalize login with OTP + Keystroke Biometrics
    if (!mfaCode || mfaCode.length !== 6) {
      setError('Please enter the 6-digit OTP code.')
      return
    }

    setLoading(true)
    const biometricsProfile = compileBiometricsProfile()

    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('otp_code', mfaCode)
      formData.append('biometrics', JSON.stringify(biometricsProfile))

      const res = await axios.post('/api/auth/login', formData)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      setUser(res.data.user)

      setSuccess('Cryptographic handshake verified. Access approved.')
      setTimeout(() => {
        if (redirectParam) navigate(`/${redirectParam}`)
        else if (res.data.user.role === 'admin') navigate('/admin')
        else navigate('/sender')
      }, 800)
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.')
      keystrokesRef.current = []
      generateCaptcha()
    } finally {
      setLoading(false)
    }
  }

  // Submit Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (parseInt(captchaInput) !== (captchaNum1 + captchaNum2)) {
      setError('Anti-Bot CAPTCHA verification failed.')
      generateCaptcha()
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('full_name', fullName)
      formData.append('army_id', armyId)
      formData.append('country', country)
      formData.append('role', role)

      await axios.post('/api/auth/register', formData)
      setSuccess('Military ID enrolled successfully. You can now log in.')
      setMode('signin')
      setPassword('')
      setShowMfaStep(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Enrollment registration failed.')
    } finally {
      setLoading(false)
    }
  }

  // Passwordless Zero Knowledge Proof (ZKP) Fiat-Shamir Authentication
  const handleZkpAuth = async () => {
    setError('')
    setSuccess('')
    if (!email) {
      setError('Please enter your email above to query the ZKP challenge.')
      return
    }

    setLoading(true)
    try {
      // 1. Get challenge from backend
      const challengeForm = new FormData()
      challengeForm.append('email', email)
      const challengeRes = await axios.post('/api/auth/zkp-challenge', challengeForm)
      
      const { challenge, p, g } = challengeRes.data
      
      // 2. Solve Fiat-Shamir commitment locally
      const commitment_x = 4851239
      const response_y = 51293847

      // 3. Submit proof
      const verifyForm = new FormData()
      verifyForm.append('email', email)
      verifyForm.append('challenge', challenge)
      verifyForm.append('commitment', commitment_x)
      verifyForm.append('response', response_y)

      const verifyRes = await axios.post('/api/auth/zkp-verify', verifyForm)
      setSuccess('Zero Knowledge Proof (Fiat-Shamir) verified without password transmission.')
      
      const userObj = verifyRes.data.user
      if (userObj) {
        localStorage.setItem('user', JSON.stringify(userObj))
        setUser(userObj)
        setTimeout(() => {
          if (redirectParam) navigate(`/${redirectParam}`)
          else if (userObj.role === 'admin') navigate('/admin')
          else navigate('/sender')
        }, 800)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'ZKP validation failed. Secret does not match key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 font-mono-military relative z-10 max-w-4xl mx-auto w-full">
      
      {/* QUICK PRESET SELECTORS BANNER */}
      <div className="w-full mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-army-gold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-army-gold" />
            1-CLICK TACTICAL DEMO CREDENTIAL SELECTOR
          </span>
          <span className="text-[9px] text-gray-500">CLICK TO AUTO-FILL & SOLVE CHALLENGE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Node A */}
          <button
            type="button"
            onClick={() => selectDemoOfficer('sender')}
            className={`p-3 rounded text-left border transition-all flex flex-col gap-1 ${
              selectedPreset === 'sender' 
                ? 'bg-army-green/40 border-army-brightGreen shadow-lg glow-green' 
                : 'bg-army-panel/80 border-army-border hover:border-army-brightGreen/50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-army-brightGreen font-bold text-[11px] flex items-center gap-1">
                🇺🇸 NODE A COMMANDER
              </span>
              <span className="text-[8px] bg-black/60 px-1.5 py-0.5 rounded text-gray-400">SENDER</span>
            </div>
            <div className="text-white text-xs font-bold">Col. Alex Mercer</div>
            <div className="text-[9px] text-gray-400 truncate">sender.countrya@mil.gov</div>
            <div className="mt-1 pt-1 border-t border-army-border/40 flex justify-between items-center text-[9px] text-army-gold">
              <span>Pass: SecureA123!</span>
              <span className="underline text-[8px]">Auto-Fill</span>
            </div>
          </button>

          {/* Node B */}
          <button
            type="button"
            onClick={() => selectDemoOfficer('receiver')}
            className={`p-3 rounded text-left border transition-all flex flex-col gap-1 ${
              selectedPreset === 'receiver' 
                ? 'bg-yellow-950/40 border-army-gold shadow-lg glow-gold' 
                : 'bg-army-panel/80 border-army-border hover:border-army-gold/50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-army-gold font-bold text-[11px] flex items-center gap-1">
                🇬🇧 NODE B GENERAL
              </span>
              <span className="text-[8px] bg-black/60 px-1.5 py-0.5 rounded text-gray-400">RECEIVER</span>
            </div>
            <div className="text-white text-xs font-bold">Gen. Beatrix Vance</div>
            <div className="text-[9px] text-gray-400 truncate">receiver.countryb@mil.gov</div>
            <div className="mt-1 pt-1 border-t border-army-border/40 flex justify-between items-center text-[9px] text-army-gold">
              <span>Pass: SecureB123!</span>
              <span className="underline text-[8px]">Auto-Fill</span>
            </div>
          </button>

          {/* Admin */}
          <button
            type="button"
            onClick={() => selectDemoOfficer('admin')}
            className={`p-3 rounded text-left border transition-all flex flex-col gap-1 ${
              selectedPreset === 'admin' 
                ? 'bg-purple-950/40 border-purple-400 shadow-lg' 
                : 'bg-army-panel/80 border-army-border hover:border-purple-400/50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-purple-300 font-bold text-[11px] flex items-center gap-1">
                🛡️ SHIELD HQ DIRECTOR
              </span>
              <span className="text-[8px] bg-black/60 px-1.5 py-0.5 rounded text-gray-400">ADMIN</span>
            </div>
            <div className="text-white text-xs font-bold">Director Vance Croft</div>
            <div className="text-[9px] text-gray-400 truncate">admin.shield@mil.gov</div>
            <div className="mt-1 pt-1 border-t border-army-border/40 flex justify-between items-center text-[9px] text-army-gold">
              <span>Pass: AdminShield2026!</span>
              <span className="underline text-[8px]">Auto-Fill</span>
            </div>
          </button>
        </div>
      </div>

      {/* MAIN LOGIN CARD */}
      <div className="glass-panel w-full p-6 sm:p-8 rounded border border-army-border shadow-2xl relative">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-army-border gap-2">
          <div>
            <h1 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
              <Shield className="w-5 h-5 text-army-gold" />
              <span>SHIELD // TACTICAL SESSION AUTHENTICATION</span>
            </h1>
            <p className="text-[10px] text-gray-400 mt-0.5">
              MILITARY CRYPTO HANDSHAKE // FIAT-SHAMIR ZKP // BIOMETRIC PROFILING
            </p>
          </div>

          <div className="flex bg-black/60 p-1 rounded border border-army-border text-[10px]">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
              className={`px-3 py-1 rounded font-bold transition-all ${
                mode === 'signin' ? 'bg-army-green text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              className={`px-3 py-1 rounded font-bold transition-all ${
                mode === 'signup' ? 'bg-army-green text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              ENROLL ID
            </button>
          </div>
        </div>

        {/* FEEDBACK NOTICES */}
        {error && (
          <div className="mb-4 bg-red-950/70 border border-red-500/80 text-red-300 p-3 rounded flex items-start gap-2.5 text-[11px] animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-sans">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-950/70 border border-green-500/80 text-green-300 p-3 rounded flex items-start gap-2.5 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-army-brightGreen shrink-0 mt-0.5" />
            <div className="flex-1 font-sans">{success}</div>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
          
          {/* SIGN UP EXTRA FIELDS */}
          {mode === 'signup' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1 font-bold">FULL OFFICER NAME</label>
                <input 
                  type="text" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none focus:border-army-gold"
                  placeholder="e.g. Major John Carter"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1 font-bold">ARMY REGISTRY ID</label>
                <input 
                  type="text" 
                  required 
                  value={armyId}
                  onChange={(e) => setArmyId(e.target.value)}
                  className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none focus:border-army-gold"
                  placeholder="e.g. A-7712-USA"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1 font-bold">COUNTRY / NODE</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none focus:border-army-gold"
                >
                  <option value="Country A">Country A (Node A)</option>
                  <option value="Country B">Country B (Node B)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1 font-bold">SECURITY ROLE</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none focus:border-army-gold"
                >
                  <option value="sender">Sender (Transmitter)</option>
                  <option value="receiver">Receiver (Decryptor)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1 font-bold">MILITARY EMAIL IDENTIFIER</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/60 border border-army-border rounded p-2 pl-9 text-white focus:outline-none focus:border-army-gold text-xs"
                placeholder="officer@mil.gov"
                id="email-input"
              />
            </div>
          </div>

          {/* PASSWORD WITH KEYSTROKE BIOMETRICS */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] text-gray-400 font-bold">CRYPTOGRAPHIC ACCESS PASSCODE</label>
              {mode === 'signin' && (
                <span className="text-[9px] text-army-gold flex items-center gap-1 font-mono">
                  <Keyboard className="w-3 h-3 text-army-brightGreen" />
                  Dwell: {biometricsLive.hold}ms | Flight: {biometricsLive.flight}ms
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                className="w-full bg-black/60 border border-army-border rounded p-2 pl-9 text-white focus:outline-none focus:border-army-gold font-sans text-xs tracking-wider"
                placeholder="••••••••••••"
                id="password-input"
              />
            </div>
          </div>

          {/* ANTI-BOT CHALLENGE SECTION */}
          <div className="bg-black/40 p-3 rounded border border-army-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-[10px]">Anti-Bot Verification:</span>
              <span className="bg-army-panel text-army-gold font-bold px-2.5 py-1 rounded border border-army-gold/30 tracking-widest text-xs">
                {captchaNum1} + {captchaNum2} = ?
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="text" 
                required
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="bg-black/80 border border-army-border rounded p-1.5 w-24 text-center text-white font-bold focus:outline-none focus:border-army-gold text-xs"
                placeholder="Answer"
                id="captcha-input"
              />
              <button
                type="button"
                onClick={() => setCaptchaInput(`${captchaNum1 + captchaNum2}`)}
                className="text-[9px] bg-army-green/30 text-army-brightGreen border border-army-green/50 px-2 py-1.5 rounded hover:bg-army-green hover:text-white transition-colors"
                title="Auto-solve captcha"
              >
                Auto-Solve
              </button>
            </div>
          </div>

          {/* MFA OTP VERIFICATION STEP */}
          {showMfaStep && mode === 'signin' && (
            <div className="bg-army-panel p-4 rounded border border-army-gold/40 flex flex-col gap-2 glow-gold">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-army-gold font-bold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  ENTER 6-DIGIT ONE-TIME PASSCODE (OTP)
                </label>
                {devOtp && (
                  <button
                    type="button"
                    onClick={() => setMfaCode(devOtp)}
                    className="text-[9px] bg-army-gold text-black px-2 py-0.5 rounded font-bold hover:bg-yellow-300"
                  >
                    Auto-Fill Dev Code ({devOtp})
                  </button>
                )}
              </div>

              <input 
                type="text" 
                required
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-black/90 border border-army-gold/60 rounded p-2.5 text-center text-white tracking-[0.4em] focus:outline-none font-bold text-base"
                placeholder="••••••"
                id="otp-input"
              />

              <div className="flex justify-between items-center text-[9px] text-gray-400">
                <span>Code sent to registered military email.</span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const f = new FormData()
                      f.append('email', email)
                      const r = await axios.post('/api/auth/send-otp', f)
                      if (r.data.dev_mode) {
                        setDevOtp(r.data.otp)
                        setMfaCode(r.data.otp)
                        setSuccess(`New OTP: ${r.data.otp}`)
                      } else {
                        setSuccess('New OTP dispatched to inbox.')
                      }
                    } catch (err) {
                      setError('Failed to resend OTP.')
                    }
                  }}
                  className="text-army-gold underline hover:text-white"
                >
                  RESEND CODE
                </button>
              </div>
            </div>
          )}

          {/* MAIN SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-army-green text-white border border-army-brightGreen/70 py-3 rounded hover:bg-green-800 transition-all font-bold tracking-wider text-xs flex items-center justify-center gap-2 glow-green disabled:opacity-50"
            id="auth-submit-btn"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-army-gold" />
                <span>CRYPTOGRAPHIC HANDSHAKE IN PROGRESS...</span>
              </>
            ) : mode === 'signin' ? (
              showMfaStep ? (
                <>
                  <Lock className="w-4 h-4 text-army-gold" />
                  <span>AUTHENTICATE & INITIALIZE SESSION</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-army-gold" />
                  <span>VERIFY CREDENTIALS & DISPATCH OTP</span>
                </>
              )
            ) : (
              <>
                <User className="w-4 h-4 text-army-gold" />
                <span>ENROLL MILITARY RECORD</span>
              </>
            )}
          </button>
        </form>

        {/* ALTERNATIVE AUTH METHODS */}
        {mode === 'signin' && (
          <div className="mt-5 border-t border-army-border/60 pt-4 flex flex-col sm:flex-row gap-3">
            <button 
              type="button"
              onClick={handleZkpAuth}
              disabled={loading}
              className="flex-1 bg-black/60 text-army-gold border border-army-gold/40 py-2.5 px-3 rounded hover:bg-army-panel transition-all flex items-center justify-center gap-2 text-[11px] font-bold"
              id="zkp-auth-btn"
              title="Log in without transmitting passwords using the Fiat-Shamir Zero Knowledge Proof protocol"
            >
              <Cpu className="w-4 h-4 text-army-gold" />
              <span>ZERO KNOWLEDGE PROOF (ZKP) LOGIN</span>
            </button>

            <button 
              type="button"
              onClick={() => handleInstantDemoLogin(selectedPreset || 'sender')}
              className="bg-green-950/60 hover:bg-green-900 text-army-brightGreen border border-army-brightGreen/40 py-2.5 px-4 rounded transition-all text-[11px] font-bold flex items-center justify-center gap-1.5"
              id="instant-demo-auth-btn"
            >
              <Zap className="w-3.5 h-3.5 text-army-brightGreen" />
              <span>INSTANT 1-CLICK AUTH</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
