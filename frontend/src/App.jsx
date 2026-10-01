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

// Create Security Context
export const SecurityContext = createContext(null)

function Navigation() {
  const navigate = useNavigate()
  const { user, setUser } = React.useContext(SecurityContext)

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    navigate('/')
  }

  if (!user) return null

  return (
    <nav className="bg-army-panel border-b border-army-border text-xs text-gray-300 font-mono-military relative z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-12">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 text-army-gold font-bold">
          <Shield className="w-5 h-5" />
          <span className="tracking-widest">SHIELD v1.0 // MILITARY PORTAL</span>
        </Link>

        {/* LINKS */}
        <div className="hidden lg:flex items-center gap-6">
          <Link to="/sender" className="hover:text-army-gold flex items-center gap-1.5 py-1">
            <Radio className="w-3.5 h-3.5" /> COMMS PORTAL
          </Link>
          <Link to="/quantum" className="hover:text-army-gold flex items-center gap-1.5 py-1">
            <Cpu className="w-3.5 h-3.5" /> QUANTUM LAB
          </Link>
          <Link to="/attacks" className="hover:text-army-gold flex items-center gap-1.5 py-1">
            <ShieldAlert className="w-3.5 h-3.5" /> ATTACK SIM
          </Link>
          <Link to="/blockchain" className="hover:text-army-gold flex items-center gap-1.5 py-1">
            <Database className="w-3.5 h-3.5" /> LEDGER
          </Link>
          <Link to="/metrics" className="hover:text-army-gold flex items-center gap-1.5 py-1">
            <Activity className="w-3.5 h-3.5" /> METRICS
          </Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="hover:text-army-gold flex items-center gap-1.5 py-1 text-army-gold">
              <Settings className="w-3.5 h-3.5" /> ADMIN
            </Link>
          )}
          <Link to="/logs" className="hover:text-army-gold flex items-center gap-1.5 py-1">
            <ScrollText className="w-3.5 h-3.5" /> AUDIT LOGS
          </Link>
        </div>

        {/* USER PROFILE INFO & LOGOUT */}
        <div className="flex items-center gap-4">
          <div className="bg-black/40 px-2 py-1 rounded border border-army-border/60 text-[10px] text-right">
            <div className="text-army-brightGreen font-bold">{user.full_name}</div>
            <div className="text-gray-500 font-mono text-[8px]">{user.army_id} // {user.country.toUpperCase()}</div>
          </div>
          <button 
            onClick={handleLogout} 
            className="hover:text-red-400 p-1.5 text-gray-400 border border-transparent hover:border-army-border/60 rounded"
            title="Log Out Security Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  )
}

function MainLayout({ children }) {
  const { user } = React.useContext(SecurityContext)
  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {user && (
        <div className="bg-army-panel text-[10px] text-army-gold border-b border-army-border py-1 px-4 flex justify-between font-mono-military z-40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-army-brightGreen animate-pulse"></span>
            <span>SECURE CRYPTO HANDSHAKE (AES-256 + KYBER-768) ACTIVE</span>
          </div>
          <div>REMOTE HOST: CLOUD_SHIELD_NODE_OK</div>
        </div>
      )}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full z-10">
        {children}
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
              element={user ? <CommsDashboard /> : <Navigate to="/" />} 
            />
            <Route 
              path="/receiver" 
              element={user ? <CommsDashboard /> : <Navigate to="/" />} 
            />
            {/* Modules */}
            <Route path="/quantum" element={user ? <QuantumVisuals /> : <Navigate to="/" />} />
            <Route path="/attacks" element={user ? <AttackSimulator /> : <Navigate to="/" />} />
            <Route path="/threat-report" element={user ? <ThreatReport /> : <Navigate to="/" />} />
            <Route path="/blockchain" element={user ? <BlockchainTrail /> : <Navigate to="/" />} />
            <Route path="/metrics" element={user ? <SecurityMetrics /> : <Navigate to="/" />} />
            <Route path="/logs" element={user ? <LogsPage /> : <Navigate to="/" />} />
            <Route 
              path="/admin" 
              element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MainLayout>
      </Router>
    </SecurityContext.Provider>
  )
}
