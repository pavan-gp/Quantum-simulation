import React, { useState, useEffect } from 'react'

export default function BlochSphere() {
  const [theta, setTheta] = useState(45) // polar angle (0 to 180 deg)
  const [phi, setPhi] = useState(45)   // azimuthal angle (0 to 360 deg)
  const [coords, setCoords] = useState({ x: 0, y: 0, z: 0 })

  // Calculate cartesian coordinates from theta and phi
  useEffect(() => {
    const thetaRad = (theta * Math.PI) / 180
    const phiRad = (phi * Math.PI) / 180
    
    const x = Math.sin(thetaRad) * Math.cos(phiRad)
    const y = Math.sin(thetaRad) * Math.sin(phiRad)
    const z = Math.cos(thetaRad)
    
    setCoords({
      x: x.toFixed(4),
      y: y.toFixed(4),
      z: z.toFixed(4)
    })
  }, [theta, phi])

  // Simple 3D projection parameters for the SVG representation
  // Center is (150, 150), radius is 100
  const cx = 150
  const cy = 150
  const r = 100

  // 3D rotation of state vector onto 2D screen coordinates
  // We project Z upwards, X downwards-left, Y downwards-right
  const getProjectedCoords = () => {
    const thetaRad = (theta * Math.PI) / 180
    const phiRad = (phi * Math.PI) / 180
    
    const x3d = Math.sin(thetaRad) * Math.cos(phiRad)
    const y3d = Math.sin(thetaRad) * Math.sin(phiRad)
    const z3d = Math.cos(thetaRad)
    
    // Orthographic projection matrix coefficients
    const screenX = cx + r * (y3d * 0.9 - x3d * 0.4)
    const screenY = cy - r * (z3d * 0.95 - x3d * 0.25 - y3d * 0.1)
    
    return { x: screenX, y: screenY }
  }

  const vectorEnd = getProjectedCoords()

  return (
    <div className="glass-panel p-6 rounded border border-army-border font-mono-military flex flex-col items-center">
      <h3 className="text-army-gold text-sm font-bold border-b border-army-border w-full pb-2 mb-4">
        3D BLOCH SPHERE INTERACTIVE QUBIT VISUALIZER
      </h3>
      
      {/* 3D Bloch SVG */}
      <div className="relative w-[300px] h-[300px] bg-black/40 rounded border border-army-border/40 overflow-hidden mb-6">
        <svg className="w-full h-full" viewBox="0 0 300 300">
          {/* Main sphere circle */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(197, 160, 89, 0.25)" strokeWidth="1.5" />
          
          {/* Sphere equator ellipse (projection) */}
          <ellipse cx={cx} cy={cy} rx={r} ry={25} fill="none" stroke="rgba(42, 77, 37, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
          
          {/* Sphere vertical longitudinal axis */}
          <ellipse cx={cx} cy={cy} rx={25} ry={r} fill="none" stroke="rgba(42, 77, 37, 0.3)" strokeWidth="1" strokeDasharray="3,3" />

          {/* Coordinate axes */}
          {/* Z Axis (Vertical) */}
          <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="rgba(197, 160, 89, 0.3)" strokeWidth="1" />
          <text x={cx - 15} y={cy - r + 12} fill="#C5A059" fontSize="10" fontWeight="bold">|0⟩ (+Z)</text>
          <text x={cx - 15} y={cy + r - 4} fill="#C5A059" fontSize="10" fontWeight="bold">|1⟩ (-Z)</text>

          {/* Y Axis */}
          <line x1={cx - r * 0.9} y1={cy + 10} x2={cx + r * 0.9} y2={cy - 10} stroke="rgba(74, 222, 128, 0.3)" strokeWidth="1" />
          <text x={cx + r * 0.9 - 15} y={cy - 15} fill="#4ADE80" fontSize="9">|+i⟩ (+Y)</text>

          {/* X Axis */}
          <line x1={cx - r * 0.5} y1={cy - r * 0.3} x2={cx + r * 0.5} y2={cy + r * 0.3} stroke="rgba(74, 222, 128, 0.3)" strokeWidth="1" />
          <text x={cx - r * 0.5 - 20} y={cy - r * 0.3 - 5} fill="#4ADE80" fontSize="9">|+⟩ (+X)</text>

          {/* State Vector Line (The Qubit vector representation) */}
          <line 
            x1={cx} 
            y1={cy} 
            x2={vectorEnd.x} 
            y2={vectorEnd.y} 
            stroke="#4ADE80" 
            strokeWidth="3" 
            markerEnd="url(#arrow)" 
          />
          {/* Vector End glow dot */}
          <circle cx={vectorEnd.x} cy={vectorEnd.y} r="4" fill="#C5A059" />

          {/* Marker definition for the vector arrow */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#4ADE80" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Interactive Sliders */}
      <div className="w-full flex flex-col gap-4 text-xs">
        <div>
          <div className="flex justify-between text-gray-400 mb-1">
            <span>POLAR ANGLE (&theta;): {theta}&deg;</span>
            <span className="text-army-brightGreen">COS(&theta;/2) State Weight</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="180" 
            value={theta} 
            onChange={(e) => setTheta(parseInt(e.target.value))}
            className="w-full h-1 bg-army-border rounded-lg appearance-none cursor-pointer accent-army-gold" 
            id="theta-slider"
          />
        </div>

        <div>
          <div className="flex justify-between text-gray-400 mb-1">
            <span>AZIMUTHAL ANGLE (&phi;): {phi}&deg;</span>
            <span className="text-army-gold">Phase Rotation e^(i&phi;)</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="360" 
            value={phi} 
            onChange={(e) => setPhi(parseInt(e.target.value))}
            className="w-full h-1 bg-army-border rounded-lg appearance-none cursor-pointer accent-army-gold" 
            id="phi-slider"
          />
        </div>

        {/* Calculated state values */}
        <div className="bg-black/60 p-3 rounded border border-army-border text-[11px] grid grid-cols-3 gap-2 text-center mt-2">
          <div>
            <div className="text-gray-500 font-bold">X COMPONENT</div>
            <div className="text-army-brightGreen font-bold">{coords.x}</div>
          </div>
          <div>
            <div className="text-gray-500 font-bold">Y COMPONENT</div>
            <div className="text-army-brightGreen font-bold">{coords.y}</div>
          </div>
          <div>
            <div className="text-gray-500 font-bold">Z COMPONENT</div>
            <div className="text-army-brightGreen font-bold">{coords.z}</div>
          </div>
        </div>

        {/* Mathematical Qubit state bra-ket display */}
        <div className="bg-army-panel p-2.5 rounded border border-army-border text-center text-army-gold text-[10px]">
          |&psi;⟩ = {Math.cos((theta * Math.PI) / 360).toFixed(3)}|0⟩ + {Math.sin((theta * Math.PI) / 360) === 0 ? "0" : `${Math.sin((theta * Math.PI) / 360).toFixed(3)}e^(i·${phi}&deg;)`}|1⟩
        </div>
      </div>
    </div>
  )
}
