import React, { createContext, useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { Shield, Radio, ShieldAlert, Cpu, Activity, Database, KeyRound, ScrollText, Settings, LogOut } from 'lucide-react'

// Import Pages (will create these next)
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import CommsDashboard from './pages/CommsDashboard'
import QuantumVisuals from './pages/QuantumVisuals'
import AttackSimulator from './pages/AttackSimulator'
import ThreatReport from './pages/ThreatReport'
import BlockchainTrail from './pages/BlockchainTrail'
import SecurityMetrics from './pages/SecurityMetrics'
import AdminDashboard from './pages/AdminDashboard'
import LogsPage from './pages/LogsPage'
import Footer from './components/Footer'

// Create Security Context
export const SecurityContext = createContext(null)

function Navigation() {
  const navigate = useNavigate()
  const { user, setUser } = React.useContext(SecurityContext)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <header className="bg-army-panel/95 backdrop-blur-md border-b border-army-border text-xs text-gray-300 font-mono-military sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-14">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5 text-army-gold font-bold group">
          <div className="w-8 h-8 rounded bg-army-green/40 border border-army-gold/40 flex items-center justify-center text-army-gold group-hover:border-army-brightGreen transition-all glow-gold">
            <Shield className="w-4 h-4 text-army-gold group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="tracking-widest font-black text-white text-xs">SHIELD // PORTAL</span>
            <span className="text-[9px] text-army-brightGreen font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-army-brightGreen animate-pulse"></span>
              PQC DEFENSE GRID v1.0
            </span>
          </div>
        </Link>

        {/* DESKTOP LINKS */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link to="/" className="px-3 py-1.5 rounded hover:text-white hover:bg-army-border/40 transition-colors">
            HOME
          </Link>
          <Link to="/sender" className="px-3 py-1.5 rounded hover:text-white hover:bg-army-border/40 transition-colors flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-army-gold" /> COMMS PORTAL
          </Link>
          <Link to="/quantum" className="px-3 py-1.5 rounded hover:text-white hover:bg-army-border/40 transition-colors flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-400" /> QUANTUM LAB
          </Link>
          <Link to="/attacks" className="px-3 py-1.5 rounded hover:text-white hover:bg-army-border/40 transition-colors flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> ATTACK SIM
          </Link>
          <Link to="/blockchain" className="px-3 py-1.5 rounded hover:text-white hover:bg-army-border/40 transition-colors flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-400" /> LEDGER
          </Link>
          <Link to="/metrics" className="px-3 py-1.5 rounded hover:text-white hover:bg-army-border/40 transition-colors flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-army-brightGreen" /> METRICS
          </Link>
          {user && (
            <Link to="/logs" className="px-3 py-1.5 rounded hover:text-white hover:bg-army-border/40 transition-colors flex items-center gap-1.5">
              <ScrollText className="w-3.5 h-3.5 text-gray-400" /> AUDIT LOGS
            </Link>
          )}
          {user && user.role === 'admin' && (
            <Link to="/admin" className="px-3 py-1.5 rounded text-army-gold bg-army-gold/10 border border-army-gold/30 hover:bg-army-gold/20 transition-colors flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" /> ADMIN
            </Link>
          )}
        </nav>

        {/* AUTH ACTION / USER PROFILE */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="bg-black/60 px-3 py-1 rounded border border-army-border/70 text-right">
                <div className="text-army-brightGreen font-bold flex items-center justify-end gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-army-brightGreen"></span>
                  {user.full_name}
                </div>
                <div className="text-gray-400 text-[9px] tracking-wider uppercase">
                  {user.army_id} // {user.country} ({user.role})
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="hover:text-red-400 p-2 text-gray-400 border border-army-border hover:border-red-500/50 rounded transition-colors"
                title="Log Out Security Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="bg-army-green hover:bg-green-800 text-white border border-army-brightGreen/50 px-4 py-1.5 rounded text-[11px] font-bold tracking-wider flex items-center gap-1.5 transition-all glow-green"
              id="header-login-btn"
            >
              <KeyRound className="w-3.5 h-3.5 text-army-gold" />
              <span>ACCESS PORTAL</span>
            </Link>
          )}

          {/* MOBILE MENU TOGGLE BUTTON */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden p-2 text-army-gold border border-army-border rounded"
          >
            <div className="w-4 h-3 flex flex-col justify-between">
              <span className="w-full h-0.5 bg-army-gold"></span>
              <span className="w-full h-0.5 bg-army-gold"></span>
              <span className="w-full h-0.5 bg-army-gold"></span>
            </div>
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDED MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-army-panel border-t border-army-border p-4 flex flex-col gap-2">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-3 rounded hover:bg-army-border/40">
            HOME
          </Link>
          <Link to="/sender" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-3 rounded hover:bg-army-border/40">
            COMMS PORTAL
          </Link>
          <Link to="/quantum" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-3 rounded hover:bg-army-border/40">
            QUANTUM LAB
          </Link>
          <Link to="/attacks" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-3 rounded hover:bg-army-border/40">
            ATTACK SIMULATOR
          </Link>
          <Link to="/blockchain" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-3 rounded hover:bg-army-border/40">
            BLOCKCHAIN LEDGER
          </Link>
          <Link to="/metrics" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-3 rounded hover:bg-army-border/40">
            SECURITY METRICS
          </Link>
          {user && (
            <Link to="/logs" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-3 rounded hover:bg-army-border/40">
              AUDIT LOGS
            </Link>
          )}
          {user && user.role === 'admin' && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-3 rounded text-army-gold hover:bg-army-border/40">
              ADMIN DASHBOARD
            </Link>
          )}
        </div>
      )}
    </header>
  )
}

function MainLayout({ children }) {
  const { user } = React.useContext(SecurityContext)
  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div className="bg-black/80 text-[10px] text-army-gold border-b border-army-border/80 py-1.5 px-4 flex flex-wrap justify-between items-center font-mono-military z-40 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-army-brightGreen animate-pulse"></span>
          <span className="text-white font-bold">CRYPTO ENGINE:</span>
          <span className="text-army-brightGreen">CRYSTALS-KYBER-768 + DILITHIUM-IV + AES-256-GCM READY</span>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <span>QKD BB84: <strong className="text-army-gold">QBER &lt; 11%</strong></span>
          <span>NODE LINK: <strong className="text-army-brightGreen">ONLINE</strong></span>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto flex flex-col z-10">
        <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [socket, setSocket] = useState(null)
  const [activeTransmissionLogs, setActiveTransmissionLogs] = useState([])
  const [pipelineStatus, setPipelineStatus] = useState('idle')
  const [blockedReport, setBlockedReport] = useState(null)

  // Establish real-time WebSocket connection to backend
  useEffect(() => {
    // Only connect if user authenticated
    if (!user) return
    
    const wsUrl = `ws://${window.location.host}/ws/transmission`
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log("WebSocket connected to military pipeline.")
      setSocket(ws)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'pipeline_update') {
          setActiveTransmissionLogs(data.logs)
          setPipelineStatus('running')
        } else if (data.type === 'transmission_complete') {
          if (data.status === 'DELIVERED') {
            setPipelineStatus('DELIVERED')
          } else if (data.status === 'BLOCKED') {
            setPipelineStatus('BLOCKED')
            setBlockedReport(data.threat_report)
          }
        }
      } catch (err) {
        console.error("WS parsing error:", err)
      }
    }

    ws.onclose = () => {
      console.log("WebSocket connection closed.")
      setSocket(null)
    }

    return () => {
      ws.close()
    }
  }, [user])

  const triggerMockPipelineReset = () => {
    setActiveTransmissionLogs([])
    setPipelineStatus('idle')
    setBlockedReport(null)
  }

  return (
    <SecurityContext.Provider value={{ 
      user, 
      setUser, 
      activeTransmissionLogs, 
      setActiveTransmissionLogs,
      pipelineStatus, 
      setPipelineStatus,
      blockedReport,
      setBlockedReport,
      triggerMockPipelineReset
    }}>
      <Router>
        <Navigation />
        <MainLayout>
          <Routes>
            {/* Landing page handles Auth logic for Country A and Country B */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Unified Comms Dashboard */}
            <Route 
              path="/sender" 
              element={user ? <CommsDashboard /> : <Navigate to="/login?redirect=sender" />} 
            />
            <Route 
              path="/receiver" 
              element={user ? <CommsDashboard /> : <Navigate to="/login?redirect=receiver" />} 
            />
            {/* Interactive Defense Modules */}
            <Route path="/quantum" element={<QuantumVisuals />} />
            <Route path="/attacks" element={<AttackSimulator />} />
            <Route path="/threat-report" element={<ThreatReport />} />
            <Route path="/blockchain" element={<BlockchainTrail />} />
            <Route path="/metrics" element={<SecurityMetrics />} />
            <Route path="/logs" element={user ? <LogsPage /> : <Navigate to="/login?redirect=logs" />} />
            <Route 
              path="/admin" 
              element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login?redirect=admin" />} 
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MainLayout>
      </Router>
    </SecurityContext.Provider>
  )
}
