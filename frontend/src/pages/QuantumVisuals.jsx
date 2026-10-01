import React, { useState } from 'react'
import { Cpu, HelpCircle, Network, Layers, RotateCw, Activity } from 'lucide-react'
import BlochSphere from '../components/BlochSphere'

export default function QuantumVisuals() {
  const [activeTab, setActiveTab] = useState('qkd')
  const [qkdBases, setQkdBases] = useState([])
  const [qkdQber, setQkdQber] = useState(0.0)
  const [qkdEavesdropped, setQkdEavesdropped] = useState(false)
  const [qkdLoading, setQkdLoading] = useState(false)

  // Grover parameters
  const [groverQubits, setGroverQubits] = useState(4)
  const [groverTarget, setGroverTarget] = useState(5)
  const [groverStep, setGroverStep] = useState(0)
  const [groverAmplitudes, setGroverAmplitudes] = useState(new Array(16).fill(1 / 4))

  // Run simulated QKD bases agreement
  const runQkdSimulation = (eavesdrop) => {
    setQkdLoading(true)
    setQkdEavesdropped(eavesdrop)
    
    setTimeout(() => {
      setQkdLoading(false)
      const numBits = 10
      const bases = ['+', 'x']
      const simulatedBases = []
      let errors = 0
      
      for (let i = 0; i < numBits; i++) {
        const aliceBase = bases[Math.floor(Math.random() * 2)]
        const aliceBit = Math.random() > 0.5 ? 1 : 0
        const bobBase = bases[Math.floor(Math.random() * 2)]
        
        let eveBase = ''
        let eveBit = -1
        let bobBit = aliceBit
        
        if (eavesdrop) {
          eveBase = bases[Math.floor(Math.random() * 2)]
          eveBit = eveBase === aliceBase ? aliceBit : (Math.random() > 0.5 ? 1 : 0)
          bobBit = bobBase === eveBase ? eveBit : (Math.random() > 0.5 ? 1 : 0)
        } else {
          bobBit = bobBase === aliceBase ? aliceBit : (Math.random() > 0.5 ? 1 : 0)
        }
        
        const matched = aliceBase === bobBase
        if (matched && aliceBit !== bobBit) {
          errors++
        }

        simulatedBases.push({
          idx: i,
          aliceBit,
          aliceBase,
          bobBase,
          bobBit,
          eveBase,
          eveBit,
          matched
        })
      }
      
      setQkdBases(simulatedBases)
      const errorRate = (errors / simulatedBases.filter(b => b.matched).length) * 100
      setQkdQber(isNaN(errorRate) ? 0 : parseFloat(errorRate.toFixed(1)))
    }, 1000)
  }

  // Update Grover iterations amplitude simulator
  const handleGroverIteration = () => {
    const N = Math.pow(2, groverQubits)
    const iterationsMax = Math.floor(Math.PI / 4 * Math.sqrt(N))
    
    let newStep = groverStep + 1
    if (newStep > iterationsMax) {
      newStep = 0 // loop reset
    }
    setGroverStep(newStep)

    // Calculate simulated amplitude growth
    // Starting with uniform superposition (1 / sqrt(N))
    const startAmp = 1 / Math.sqrt(N)
    const targetAmp = startAmp + (newStep * (0.8 - startAmp) / (iterationsMax || 1))
    const otherAmp = Math.sqrt((1 - targetAmp * targetAmp) / (N - 1))
    
    const amps = []
    for (let i = 0; i < N; i++) {
      amps.push(i === groverTarget ? targetAmp : otherAmp)
    }
    setGroverAmplitudes(amps)
  }

  return (
    <div className="font-mono-military flex flex-col gap-6 text-xs relative z-10">
      
      {/* HEADER SECTION */}
      <div className="bg-army-panel border border-army-border p-4 rounded flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-army-green border border-army-brightGreen flex items-center justify-center text-army-brightGreen glow-green">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-widest">
            QUANTUM SIMULATION LAB ARCHIVE
          </h2>
          <p className="text-[10px] text-gray-500">
            CRYPTOGRAPHIC CIRCUITS // QUBIT BEHAVIOR VISUALIZATIONS
          </p>
        </div>
      </div>

      {/* TABS CONTROLLER */}
      <div className="flex gap-2 border-b border-army-border pb-1">
        {[
          { id: 'qkd', label: 'QKD BB84 ENTAGLEMENT', icon: Network },
          { id: 'bloch', label: '3D BLOCH SPHERE QUBIT', icon: RotateCw },
          { id: 'grover', label: 'GROVER SEARCH SPEEDUP', icon: Layers },
          { id: 'shor', label: 'SHOR PERIOD FACTORING', icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 border rounded-t transition-all flex items-center gap-1.5 ${
                activeTab === tab.id ? 'bg-army-panel border-army-gold text-army-gold font-bold border-b-transparent' : 'bg-transparent border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          
          {/* TAB 1: QKD SIMULATION */}
          {activeTab === 'qkd' && (
            <div className="glass-panel p-5 rounded border border-army-border flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-army-border pb-2">
                <div>
                  <h3 className="text-army-gold font-bold text-sm">BB84 QUANTUM KEY AGREEMENT ENGINE</h3>
                  <p className="text-[9px] text-gray-500">Simulate photon state exchanges and calculate QBER eavesdropping thresholds</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => runQkdSimulation(false)}
                    disabled={qkdLoading}
                    className="bg-army-green text-white px-3 py-1.5 rounded border border-army-brightGreen/40 hover:bg-green-950 font-bold"
                  >
                    RUN SECURE CHANNEL
                  </button>
                  <button 
                    onClick={() => runQkdSimulation(true)}
                    disabled={qkdLoading}
                    className="bg-army-threatRed text-white px-3 py-1.5 rounded border border-red-500/40 hover:bg-red-950 font-bold"
                  >
                    RUN EAVESDROP CHANNEL (EVE ATTEMPT)
                  </button>
                </div>
              </div>

              {qkdLoading ? (
                <div className="py-20 text-center text-army-gold animate-pulse text-sm">
                  POLARIZING PHOTON STREAMS & MEASURING BASES...
                </div>
              ) : qkdBases.length === 0 ? (
                <div className="py-20 text-center text-gray-600 italic">
                  AWAITING TRANSMISSION INITIATION... CHOOSE SIMULATED CHANNEL ABOVE
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Visual Photons display */}
                  <div className="bg-black/60 border border-army-border rounded p-4 flex flex-col gap-4 overflow-x-auto">
                    <div className="grid grid-cols-11 gap-1 text-center font-bold pb-2 border-b border-army-border/40 text-[9px] text-gray-400">
                      <div>QUBIT #</div>
                      {qkdBases.map(b => <div key={b.idx}>{b.idx + 1}</div>)}
                    </div>
                    {/* Alice input */}
                    <div className="grid grid-cols-11 gap-1 text-center items-center text-[10px]">
                      <div className="text-army-gold font-bold text-left">ALICE BIT:</div>
                      {qkdBases.map(b => <div key={b.idx} className="text-gray-300 font-sans">{b.aliceBit}</div>)}
                    </div>
                    <div className="grid grid-cols-11 gap-1 text-center items-center text-[10px]">
                      <div className="text-army-gold font-bold text-left">ALICE BASIS:</div>
                      {qkdBases.map(b => <div key={b.idx} className="text-army-gold">{b.aliceBase}</div>)}
                    </div>
                    {/* EVE INTERCEPT */}
                    {qkdEavesdropped && (
                      <>
                        <div className="grid grid-cols-11 gap-1 text-center items-center text-[10px] bg-red-950/20 py-1 border-y border-red-900/40">
                          <div className="text-red-400 font-bold text-left">EVE MEASURE:</div>
                          {qkdBases.map(b => <div key={b.idx} className="text-red-400">{b.eveBase}</div>)}
                        </div>
                        <div className="grid grid-cols-11 gap-1 text-center items-center text-[10px] bg-red-950/20 py-1">
                          <div className="text-red-400 font-bold text-left">EVE BIT:</div>
                          {qkdBases.map(b => <div key={b.idx} className="text-red-300 font-sans">{b.eveBit}</div>)}
                        </div>
                      </>
                    )}
                    {/* Bob output */}
                    <div className="grid grid-cols-11 gap-1 text-center items-center text-[10px]">
                      <div className="text-army-gold font-bold text-left">BOB BASIS:</div>
                      {qkdBases.map(b => <div key={b.idx} className="text-army-gold">{b.bobBase}</div>)}
                    </div>
                    <div className="grid grid-cols-11 gap-1 text-center items-center text-[10px] border-t border-army-border/40 pt-2">
                      <div className="text-army-gold font-bold text-left">BOB BIT:</div>
                      {qkdBases.map(b => <div key={b.idx} className="text-gray-300 font-sans">{b.bobBit}</div>)}
                    </div>
                    <div className="grid grid-cols-11 gap-1 text-center items-center text-[10px]">
                      <div className="text-army-gold font-bold text-left">BASIS AGREEMENT:</div>
                      {qkdBases.map(b => <div key={b.idx} className={b.matched ? "text-army-brightGreen font-bold" : "text-gray-600"}>{b.matched ? 'MATCH' : 'DISCARD'}</div>)}
                    </div>
                  </div>

                  {/* QBER Results stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/40 p-4 rounded border border-army-border text-center">
                      <div className="text-gray-500 font-bold">MEASURED BIT ERROR RATE (QBER)</div>
                      <div className={`text-2xl font-black mt-1 ${qkdQber > 11.0 ? 'text-red-500' : 'text-army-brightGreen'}`}>
                        {qkdQber}%
                      </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded border border-army-border text-center">
                      <div className="text-gray-500 font-bold">EAVESDROP PROBABILITY STATE</div>
                      <div className={`text-2xl font-black mt-1 ${qkdQber > 11.0 ? 'text-red-500 animate-pulse' : 'text-army-brightGreen'}`}>
                        {qkdQber > 11.0 ? 'DETECTION ALARM HIGH' : 'NOMINAL // CLEAR'}
                      </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded border border-army-border text-center">
                      <div className="text-gray-500 font-bold">SHARED PARITY KEY LENGTH</div>
                      <div className="text-2xl font-black text-army-gold mt-1">
                        {qkdBases.filter(b => b.matched && b.aliceBit === b.bobBit).length} QUBITS
                      </div>
                    </div>
                  </div>

                  <div className="bg-army-panel p-3.5 rounded border border-army-border leading-relaxed text-gray-400">
                    <b>BB84 Security Mechanism</b>: When Eve measures a photon, she collapses its superposition. 
                    If Alice sent diagonal but Bob measures rectilinear, Eve's measurement forces a 50% error rate on Bob's sifted key calculations. 
                    If overall QBER threshold exceeds 11%, the channel is compromised, the key is shredded, and alert protocol executes.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BLOCH SPHERE */}
          {activeTab === 'bloch' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BlochSphere />
              <div className="glass-panel p-6 rounded border border-army-border flex flex-col gap-4">
                <h3 className="text-army-gold font-bold text-sm border-b border-army-border pb-2">
                  THE BLOCH SPHERE EXPLAINED
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Unlike classical bits that are strictly 0 or 1, a quantum qubit exists in a superposition of both states:
                </p>
                <div className="bg-black/60 p-3 rounded border border-army-border text-center text-army-brightGreen font-bold my-2">
                  |&psi;⟩ = cos(&theta;/2)|0⟩ + e^(i&phi;)sin(&theta;/2)|1⟩
                </div>
                <p className="text-gray-400 leading-relaxed">
                  The Bloch Sphere maps this superposition vector onto a 3D unit sphere.
                </p>
                <ul className="list-disc pl-4 flex flex-col gap-2 text-gray-500">
                  <li><b>North Pole (|0⟩)</b>: Represents the classical ground state 0.</li>
                  <li><b>South Pole (|1⟩)</b>: Represents the classical excited state 1.</li>
                  <li><b>Equator</b>: Maximum superposition states (e.g. |+⟩, |i⟩) with equal 50% probability amplitudes but different phase rotations.</li>
                  <li><b>Phase Rotation (&phi;)</b>: Rotating around the Z-axis represents the quantum phase parameter.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: GROVER SEARCH */}
          {activeTab === 'grover' && (
            <div className="glass-panel p-5 rounded border border-army-border flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-army-border pb-2">
                <div>
                  <h3 className="text-army-gold font-bold text-sm">GROVER'S QUANTUM AMPLITUDE AMPLIFICATION</h3>
                  <p className="text-[9px] text-gray-500">Increment oracle iterations to flip and amplify target search index state</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-bold">GROVER STEP: {groverStep}</span>
                  <button 
                    onClick={handleGroverIteration}
                    className="bg-army-green border border-army-brightGreen/40 text-white px-4 py-1.5 rounded hover:bg-green-950 font-bold"
                  >
                    RUN GROVER ITERATION STEP
                  </button>
                </div>
              </div>

              {/* SVG visualizer amplitudes */}
              <div className="bg-black/60 p-6 rounded border border-army-border flex flex-col gap-2">
                <div className="text-[9px] text-army-gold font-bold mb-3">STATE AMPLITUDE VALUES // Target index: {groverTarget}</div>
                <div className="flex justify-between items-end h-[160px] border-b border-army-border/40 pb-2">
                  {groverAmplitudes.map((amp, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1">
                      {/* Amplitude fill */}
                      <div 
                        className={`w-4 transition-all duration-300 rounded-t ${idx === groverTarget ? 'bg-army-gold glow-gold' : 'bg-army-green'}`}
                        style={{ height: `${Math.max(5, amp * 120)}px` }}
                      ></div>
                      <span className="text-[8px] text-gray-600 mt-2 font-mono">{idx}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-gray-500 mt-2">
                  <span>TARGET STATE PROBABILITY: {parseFloat((groverAmplitudes[groverTarget] * groverAmplitudes[groverTarget] * 100).toFixed(1))}%</span>
                  <span>NORMAL SUPERPOSITION HEIGHT: {(1 / Math.sqrt(Math.pow(2, groverQubits))).toFixed(3)}</span>
                </div>
              </div>

              <p className="text-gray-400 leading-relaxed mt-2">
                <b>Grover's Quantum Search</b> runs database queries in $O(\sqrt{N})$ compared to classical $O(N)$ searches. 
                Our secure pipeline counters Grover attacks by doubling symmetric cipher key bit-lengths (AES-256), preserving security against quantum brute-force searches.
              </p>
            </div>
          )}

          {/* TAB 4: SHOR PERIOD FINDING */}
          {activeTab === 'shor' && (
            <div className="glass-panel p-5 rounded border border-army-border flex flex-col gap-4">
              <h3 className="text-army-gold font-bold text-sm border-b border-army-border pb-2">
                SHOR'S PERIOD FINDING ALGORITHM (FACTORING 15 = 3 * 5)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="flex flex-col gap-3">
                  <div className="text-xs text-gray-400 leading-relaxed">
                    Shor's algorithm factors integers in polynomial time $O(\log N)$, threatening classical RSA key exchanges. 
                    Shor finds the repeating cycle (period $r$) of:
                  </div>
                  <div className="bg-black/60 p-3 rounded border border-army-border text-center text-army-gold font-bold font-mono">
                    f(x) = a^x mod N
                  </div>
                  <div className="text-xs text-gray-500">
                    For N = 15, we choose coprime a = 7:
                  </div>
                  <table className="w-full bg-black/40 border border-army-border rounded text-[10px] text-center">
                    <thead>
                      <tr className="border-b border-army-border bg-army-panel text-gray-400">
                        <th className="p-1">x</th>
                        <th className="p-1">f(x) = 7^x mod 15</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {x: 0, y: 1},
                        {x: 1, y: 7},
                        {x: 2, y: 4},
                        {x: 3, y: 13},
                        {x: 4, y: 1},
                        {x: 5, y: 7},
                      ].map((row) => (
                        <tr key={row.x} className="border-b border-army-border/40">
                          <td className="p-1 text-army-gold">{row.x}</td>
                          <td className="p-1 font-bold text-army-brightGreen">{row.y}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-[10px] text-army-goldLight font-bold">
                    Cycle repeats at x=4. Period r = 4.
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-army-panel border border-army-border p-4 rounded flex flex-col gap-3 text-[10px]">
                    <div className="text-army-gold font-bold uppercase border-b border-army-border/40 pb-1">
                      Quantum Math Period Solver:
                    </div>
                    <div>
                      1. Check $r$ is even: <b>r = 4 (Even, valid)</b>
                    </div>
                    <div>
                      2. Solve $a^{r/2} \pm 1 \pmod N$:
                      <div className="pl-4 mt-1 text-gray-400">
                        $7^{4/2} - 1 = 49 - 1 = 48$ <br />
                        $7^{4/2} + 1 = 49 + 1 = 50$
                      </div>
                    </div>
                    <div>
                      3. Compute Greatest Common Divisors:
                      <div className="pl-4 mt-1 text-army-brightGreen font-bold">
                        $\text{gcd}(48, 15) = 3$ <br />
                        $\text{gcd}(50, 15) = 5$
                      </div>
                    </div>
                    <div className="border-t border-army-border/40 pt-2 text-[9px] text-gray-500 font-bold">
                      Factors successfully extracted: 3 and 5. RSA private key decoded.
                    </div>
                  </div>
                  
                  <div className="bg-army-threatRed/10 border border-red-900/40 p-3 rounded text-[10px] text-red-400">
                    <b>PQC Mitigation</b>: crystals-Kyber relies on the hardness of modular Lattice problems (Learning with Errors), which Shor's algorithm cannot solve in polynomial time.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
