"use client"

import { useEffect, useRef } from "react"

export function BlobAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const size = Math.min(400, window.innerWidth * 0.4)
      canvas.width = size
      canvas.height = size
    }

    let time = 0

    const drawBlob = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const baseRadius = Math.min(canvas.width, canvas.height) * 0.3

      // Create gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 1.5)
      gradient.addColorStop(0, "rgba(138, 63, 252, 0.8)") // Primary purple
      gradient.addColorStop(0.5, "rgba(162, 89, 255, 0.6)") // Glow color
      gradient.addColorStop(1, "rgba(255, 77, 109, 0.4)") // Secondary red

      // Create blob shape using multiple sine waves
      ctx.beginPath()
      const points = 8
      const angleStep = (Math.PI * 2) / points

      for (let i = 0; i <= points; i++) {
        const angle = i * angleStep
        const radiusVariation = Math.sin(time * 0.02 + angle * 3) * 0.3 + Math.cos(time * 0.015 + angle * 2) * 0.2
        const radius = baseRadius * (1 + radiusVariation)

        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          // Use quadratic curves for smooth blob shape
          const prevAngle = (i - 1) * angleStep
          const prevRadiusVariation =
            Math.sin(time * 0.02 + prevAngle * 3) * 0.3 + Math.cos(time * 0.015 + prevAngle * 2) * 0.2
          const prevRadius = baseRadius * (1 + prevRadiusVariation)
          const prevX = centerX + Math.cos(prevAngle) * prevRadius
          const prevY = centerY + Math.sin(prevAngle) * prevRadius

          const cpX = (prevX + x) / 2 + Math.sin(time * 0.01 + angle) * 20
          const cpY = (prevY + y) / 2 + Math.cos(time * 0.01 + angle) * 20

          ctx.quadraticCurveTo(cpX, cpY, x, y)
        }
      }

      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // Add inner glow
      const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 0.8)
      innerGradient.addColorStop(0, "rgba(255, 255, 255, 0.1)")
      innerGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

      ctx.fillStyle = innerGradient
      ctx.fill()

      // Add outer glow effect
      ctx.shadowColor = "rgba(162, 89, 255, 0.5)"
      ctx.shadowBlur = 30
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      time += 1
    }

    const animate = () => {
      drawBlob()
      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    animate()

    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="flex items-center justify-center p-8">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto filter drop-shadow-lg"
        style={{
          background: "transparent",
        }}
      />
    </div>
  )
}
