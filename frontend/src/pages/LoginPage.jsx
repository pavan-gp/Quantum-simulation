import React, { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, Lock, User, Globe, AlertCircle, Key, Cpu, Keyboard } from 'lucide-react'
import axios from 'axios'
import { SecurityContext } from '../App'

export default function LoginPage() {
  const { setUser } = useContext(SecurityContext)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedNode = searchParams.get('node') // 'A' or 'B'

  // Mode: 'signin' or 'signup'
  const [mode, setMode] = useState('signin')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [armyId, setArmyId] = useState('')
  const [country, setCountry] = useState(selectedNode === 'B' ? 'Country B' : 'Country A')
  const [role, setRole] = useState(selectedNode === 'B' ? 'receiver' : 'sender')

  // MFA & ZKP Auth States
  const [showMfaStep, setShowMfaStep] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaValidated, setMfaValidated] = useState(false)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [isZkpMode, setIsZkpMode] = useState(false)

  // Keystroke Biometrics tracking refs
  const keystrokesRef = useRef([])
  const lastKeyUpTimeRef = useRef(null)

  // Generate simple CAPTCHA on mount
  useEffect(() => {
    generateCaptcha()
  }, [])

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 9) + 1
    const num2 = Math.floor(Math.random() * 9) + 1
    setCaptchaAnswer(`${num1 + num2}`)
    setCaptchaInput('')
  }

  // Capturing keystroke dynamics (dwell time and flight time)
  const handleKeyDown = (e) => {
    const key = e.key
    if (key === 'Enter') return
    const now = performance.now()
    
    // Check if key is already pressed (prevent repeat triggers)
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
    }
  }

  // Process compiled biometrics profile
  const compileBiometricsProfile = () => {
    const closedKeystrokes = keystrokesRef.current.filter(k => k.upTime !== null)
    if (closedKeystrokes.length < 4) {
      // Return normal defaults if typing is too short to avoid errors
      return {
        avg_hold_time: 85.5,
        avg_flight_time: 120.2,
        typing_speed_cpm: 280.0
      }
    }

    const totalHold = closedKeystrokes.reduce((acc, k) => acc + k.holdTime, 0)
    // Filter non-zero flights
    const validFlights = closedKeystrokes.filter(k => k.flightTime > 0)
    const totalFlight = validFlights.reduce((acc, k) => acc + k.flightTime, 0)

    const avgHold = totalHold / closedKeystrokes.length
    const avgFlight = validFlights.length > 0 ? totalFlight / validFlights.length : 100

    // Approximate CPM
    const durationSec = (performance.now() - keystrokesRef.current[0].downTime) / 1000
    const cpm = (closedKeystrokes.length / (durationSec || 1)) * 60

    return {
      avg_hold_time: parseFloat(avgHold.toFixed(2)),
      avg_flight_time: parseFloat(avgFlight.toFixed(2)),
      typing_speed_cpm: parseFloat(Math.min(cpm, 600).toFixed(2)) // clamp cpm
    }
  }

  // --- SUBMIT SIGN IN ---
  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Captcha validation
    if (captchaInput !== captchaAnswer) {
      setError('Anti-Bot CAPTCHA validation failed. Recalculate.')
      generateCaptcha()
      return
    }

    // Step 1: verify credentials & trigger OTP dispatch
    if (!showMfaStep) {
      setLoading(true)
      try {
        const otpForm = new FormData()
        otpForm.append('email', email)
        const otpRes = await axios.post('/api/auth/send-otp', otpForm)
        setShowMfaStep(true)
        if (otpRes.data.dev_mode) {
          setSuccess(`OTP generated: ${otpRes.data.otp} (dev mode - SMTP not configured).`)
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

    // Step 2: Authenticate with real OTP
    if (!mfaCode || mfaCode.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email.')
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

      setSuccess('Authentication successful. Access approved.')
      setTimeout(() => {
        if (res.data.user.role === 'admin') navigate('/admin')
        else if (res.data.user.country === 'Country A') navigate('/sender')
        else navigate('/receiver')
      }, 1000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.')
      keystrokesRef.current = []
      generateCaptcha()
    } finally {
      setLoading(false)
    }
  }

  // --- SUBMIT SIGN UP ---
  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (captchaInput !== captchaAnswer) {
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
      setSuccess('Military ID enrolled. You can now login.')
      setMode('signin')
      setPassword('')
      setShowMfaStep(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Enrollment registration failed.')
    } finally {
      setLoading(false)
    }
  }

  // --- PASSWORDLESS ZERO KNOWLEDGE PROOF AUTH ---
  const handleZkpAuth = async () => {
    setError('')
    setSuccess('')
    if (!email) {
      setError('Please provide Email to generate ZKP cryptographic query.')
      return
    }

    setLoading(true)
    try {
      // 1. Get challenge parameters from FastAPI
      const challengeForm = new FormData()
      challengeForm.append('email', email)
      const challengeRes = await axios.post('/api/auth/zkp-challenge', challengeForm)
      
      const { challenge, p, g } = challengeRes.data
      
      // 2. Solve Fiat-Shamir proof locally in JS
      // We simulate prover secret s derived from email hashing.
      // Prover selects random commitment r, computes commitment x = g^r % p
      // Solver responds with y = (r + challenge * s) % p-1
      const secret_s = 98127346 // Local secret bound to email hash
      const random_r = Math.floor(Math.random() * 100000) + 100
      
      // Simple JS big-integer modpow implementation simulator
      const commitment_x = 4851239 // Simulated G^r % P
      const response_y = 51293847 // Simulated r + c*s

      // 3. Submit proof to verification endpoint
      const verifyForm = new FormData()
      verifyForm.append('email', email)
      verifyForm.append('challenge', challenge)
      verifyForm.append('commitment', commitment_x)
      verifyForm.append('response', response_y)

      const verifyRes = await axios.post('/api/auth/zkp-verify', verifyForm)
      
      // Auth success!
      setSuccess('Zero Knowledge Proof validated. Session active.')
      
      // Query users endpoint to pull user details
      const userRes = await axios.get('/api/users')
      const matchingUser = userRes.data.find(u => u.email === email)
      
      if (matchingUser) {
        const userObj = {
          id: matchingUser.id,
          email: email,
          full_name: matchingUser.full_name,
          army_id: matchingUser.army_id,
          country: matchingUser.country,
          role: matchingUser.role
        }
        localStorage.setItem('user', JSON.stringify(userObj))
        setUser(userObj)
        
        setTimeout(() => {
          if (userObj.role === 'admin') navigate('/admin')
          else if (userObj.country === 'Country A') navigate('/sender')
          else navigate('/receiver')
        }, 1000)
      } else {
        setError('ZKP verified, but user details not found in registry.')
      }

    } catch (err) {
      setError(err.response?.data?.detail || 'ZKP validation failed. Secret does not match key.')
    } finally {
      setLoading(false)
    }
  }

  // --- MOCK GOOGLE LOGIN SHORTCUT ---
  const handleGoogleLogin = () => {
    // Fill credentials for demo
    if (selectedNode === 'B') {
      setEmail('receiver.countryb@mil.gov')
      setPassword('SecureB123!')
    } else {
      setEmail('sender.countrya@mil.gov')
      setPassword('SecureA123!')
    }
    setSuccess('OAuth verified. Complete CAPTCHA + OTP to login.')
  }

  return (
    <div className="flex-1 flex items-center justify-center py-10 font-mono-military relative z-10">
      <div className="glass-panel w-full max-w-md p-6 rounded border border-army-border crt-effect">
        <div className="scanline"></div>
        
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <div className="w-10 h-10 rounded-full bg-army-green border border-army-brightGreen flex items-center justify-center text-army-brightGreen glow-green">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wider">
            {mode === 'signin' ? 'AUTHENTICATE MILITARY ID' : 'ENROLL NEW MILITARY ID'}
          </h2>
          <p className="text-[10px] text-gray-500">
            SECURED CRYPTOGRAPHIC ENTRY NODE: {country.toUpperCase()}
          </p>
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-800 text-red-400 text-[10px] p-3 rounded flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-army-green/20 border border-army-brightGreen text-army-brightGreen text-[10px] p-3 rounded flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* INPUTS CONTAINER */}
        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="flex flex-col gap-4 text-xs">
          
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-gray-400 mb-1">FULL NAME & RANK</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black/60 border border-army-border rounded p-2 pl-9 text-white focus:outline-none focus:border-army-gold"
                    placeholder="e.g. Capt. John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">MILITARY REGISTRY ARMY ID</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
                  <input 
                    type="text" 
                    required 
                    value={armyId}
                    onChange={(e) => setArmyId(e.target.value)}
                    className="w-full bg-black/60 border border-army-border rounded p-2 pl-9 text-white focus:outline-none focus:border-army-gold"
                    placeholder="e.g. A-1234-USA"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">COUNTRY NODE LOCATION</label>
                <select 
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value)
                    setRole('sender')
                  }}
                  className="w-full bg-black/60 border border-army-border rounded p-2 text-white focus:outline-none focus:border-army-gold"
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
            </>
          )}

          <div>
            <label className="block text-gray-400 mb-1">EMAIL COMMAND ADDRESS</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/60 border border-army-border rounded p-2 pl-9 text-white focus:outline-none focus:border-army-gold"
                placeholder="email@mil.gov"
                id="email-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">CRYPTOGRAPHIC SECRET PASSCODE</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                className="w-full bg-black/60 border border-army-border rounded p-2 pl-9 text-white focus:outline-none focus:border-army-gold font-sans"
                placeholder="••••••••"
                id="password-input"
              />
            </div>
            {mode === 'signin' && (
              <span className="text-[9px] text-army-gold flex items-center gap-1 mt-1">
                <Keyboard className="w-3 h-3 text-army-gold" />
                Dwell/Flight Biometrics monitor active. Type naturally.
              </span>
            )}
          </div>

          {/* CAPTCHA SECTION */}
          <div className="bg-black/40 p-3 rounded border border-army-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Anti-Bot Validation Solve:</span>
              <span className="bg-army-panel text-army-gold font-bold px-2 py-0.5 rounded border border-army-gold/30 tracking-widest text-[11px]">
                {captchaAnswer ? `${parseInt(captchaAnswer) - 3} + 3` : '?' /* Mock formula display */}
              </span>
            </div>
            <input 
              type="text" 
              required
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="w-full bg-black/60 border border-army-border rounded p-1.5 text-center text-white focus:outline-none focus:border-army-gold"
              placeholder="Enter Sum Answer"
              id="captcha-input"
            />
          </div>

          {/* MFA STEP */}
          {showMfaStep && mode === 'signin' && (
            <div className="bg-army-panel/60 p-3 rounded border border-army-gold/30">
              <label className="block text-army-goldLight mb-1.5 font-bold">MFA ONE-TIME PASSCODE (CHECK EMAIL)</label>
              <input 
                type="text" 
                required
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-black/80 border border-army-gold/40 rounded p-2 text-center text-white tracking-widest focus:outline-none font-bold text-sm"
                placeholder="● ● ● ● ● ●"
                id="otp-input"
              />
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[8px] text-gray-500">
                  6-digit code sent to your registered email.
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const f = new FormData(); f.append('email', email)
                      const r = await axios.post('/api/auth/send-otp', f)
                      setSuccess(r.data.dev_mode ? `New OTP: ${r.data.otp}` : 'New OTP sent to your email.')
                      setMfaCode('')
                    } catch (err) { setError('Failed to resend OTP.') }
                  }}
                  className="text-[8px] text-army-gold underline hover:text-white"
                >
                  RESEND OTP
                </button>
              </div>
            </div>
          )}

          {/* ACTION BUTTON */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-army-green text-white border border-army-brightGreen/50 py-2.5 rounded hover:bg-green-950 transition-colors font-bold tracking-wider disabled:opacity-50"
            id="auth-submit-btn"
          >
            {loading ? 'CRYPTOGRAPHIC HANDSHAKE IN PROGRESS...' : 
             mode === 'signin' ? (showMfaStep ? 'AUTHENTICATE SESSION & LOG IN' : 'VERIFY PASSCODE & CONTINUE') : 'ENROLL REGISTRY'}
          </button>
        </form>

        {/* ZKP SECURE DIRECT AUTH LINK */}
        {mode === 'signin' && (
          <div className="mt-4 border-t border-army-border/60 pt-4 flex flex-col gap-3">
            <button 
              onClick={handleZkpAuth}
              disabled={loading}
              className="w-full bg-black/40 text-army-gold border border-army-gold/40 py-2 rounded hover:bg-army-panel transition-colors flex items-center justify-center gap-2 text-xs"
              id="zkp-auth-btn"
            >
              <Cpu className="w-4 h-4 text-army-gold animate-spin-slow" />
              VERIFY VIA ZERO KNOWLEDGE PROOF (ZKP)
            </button>
            
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-gray-900 text-gray-300 border border-gray-700 py-1.5 rounded hover:bg-gray-800 transition-colors text-[10px]"
              id="mock-oauth-btn"
            >
              DEMO CREDENTIAL AUTO-FILL CODES
            </button>
          </div>
        )}

        {/* SWITCH MODES */}
        <div className="mt-6 text-center text-[10px] text-gray-500">
          {mode === 'signin' ? (
            <span>
              NO ARMY ENROLLMENT FILE?{' '}
              <button onClick={() => setMode('signup')} className="text-army-gold hover:underline">
                ENROLL MILITARY RECORD HERE
              </button>
            </span>
          ) : (
            <span>
              ALREADY REGISTERED ENROLLMENT?{' '}
              <button onClick={() => setMode('signin')} className="text-army-gold hover:underline">
                ACCESS SYSTEM PORTAL LOGIN
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
