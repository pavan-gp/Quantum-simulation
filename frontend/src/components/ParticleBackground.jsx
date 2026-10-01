import React, { useEffect, useRef } from 'react'

export default function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Particles configuration
    const particles = []
    const particleCount = 60
    const connectionDistance = 120

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 2 + 1
        this.color = Math.random() > 0.85 ? '#C5A059' : '#2A4D25' // Gold or Green
        this.spin = Math.random() * Math.PI
        this.spinSpeed = (Math.random() - 0.5) * 0.02
        // Represents qubit states |0>, |1>, |+>, |->
        const states = ['|0⟩', '|1⟩', '|✈⟩', '|✦⟩']
        this.stateLabel = states[Math.floor(Math.random() * states.length)]
      }

      draw() {
        // Draw particle node
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.shadowBlur = 8
        ctx.shadowColor = this.color
        ctx.fill()
        ctx.shadowBlur = 0 // reset

        // Draw quantum state symbol nearby in tiny letters occasionally
        if (this.size > 2.0) {
          ctx.fillStyle = 'rgba(74, 222, 128, 0.25)'
          ctx.font = '9px monospace'
          ctx.fillText(this.stateLabel, this.x + 8, this.y + 3)
        }
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.spin += this.spinSpeed

        // Bounce walls
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Animation Loop
    const drawLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        p1.update()
        p1.draw()

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            
            // Connection opacity based on proximity
            const opacity = (1 - dist / connectionDistance) * 0.15
            ctx.strokeStyle = p1.color === '#C5A059' ? `rgba(197, 160, 89, ${opacity})` : `rgba(42, 77, 37, ${opacity})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(drawLoop)
    }

    drawLoop()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40" 
    />
  )
}
