"use client"

import { useEffect, useState } from "react"

export function Crown3D() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-[400px] max-w-md mx-auto flex items-center justify-center">
        <div className="w-48 h-32 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 shadow-2xl rounded-t-full"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-[400px] max-w-md mx-auto flex items-center justify-center perspective-1200" data-testid="crown-animation">
      <div 
        className="relative w-64 h-64 transform-gpu preserve-3d animate-crown-spin"
        style={{
          transformStyle: 'preserve-3d',
          animation: 'crownSpin 10s linear infinite'
        }}
        data-testid="crown-3d-model"
      >
        {/* Crown Base Band */}
        <div 
          className="absolute w-full h-16 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-lg shadow-2xl"
          style={{
            top: '60%',
            left: '0%',
            transform: 'rotateX(0deg) translateZ(0px)',
            background: 'linear-gradient(45deg, #fbbf24, #f59e0b, #d97706, #fbbf24)',
            boxShadow: '0 10px 30px rgba(251, 191, 36, 0.3)'
          }}
        >
          {/* Gold texture effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent rounded-lg"></div>
        </div>

        {/* Crown Spikes/Points */}
        
        {/* Center Tall Spike */}
        <div 
          className="absolute w-12 h-20 bg-gradient-to-t from-yellow-500 to-yellow-300"
          style={{
            top: '25%',
            left: '50%',
            transform: 'translateX(-50%) rotateX(0deg) translateZ(80px)',
            clipPath: 'polygon(50% 0%, 20% 100%, 80% 100%)',
            background: 'linear-gradient(to top, #f59e0b, #fbbf24, #fef3c7)',
            filter: 'drop-shadow(0 5px 15px rgba(251, 191, 36, 0.4))'
          }}
        >
          {/* Spike highlight */}
          <div 
            className="absolute w-2 h-16 bg-gradient-to-t from-transparent to-white/40 left-1/2 transform -translate-x-1/2"
            style={{ top: '10%' }}
          ></div>
        </div>

        {/* Left Tall Spike */}
        <div 
          className="absolute w-10 h-16 bg-gradient-to-t from-yellow-500 to-yellow-300"
          style={{
            top: '35%',
            left: '25%',
            transform: 'translateX(-50%) rotateY(-30deg) translateZ(70px)',
            clipPath: 'polygon(50% 0%, 25% 100%, 75% 100%)',
            background: 'linear-gradient(to top, #f59e0b, #fbbf24, #fef3c7)',
            filter: 'drop-shadow(0 5px 15px rgba(251, 191, 36, 0.4))'
          }}
        >
          <div className="absolute w-1.5 h-12 bg-gradient-to-t from-transparent to-white/30 left-1/2 transform -translate-x-1/2 top-2"></div>
        </div>

        {/* Right Tall Spike */}
        <div 
          className="absolute w-10 h-16 bg-gradient-to-t from-yellow-500 to-yellow-300"
          style={{
            top: '35%',
            right: '25%',
            transform: 'translateX(50%) rotateY(30deg) translateZ(70px)',
            clipPath: 'polygon(50% 0%, 25% 100%, 75% 100%)',
            background: 'linear-gradient(to top, #f59e0b, #fbbf24, #fef3c7)',
            filter: 'drop-shadow(0 5px 15px rgba(251, 191, 36, 0.4))'
          }}
        >
          <div className="absolute w-1.5 h-12 bg-gradient-to-t from-transparent to-white/30 left-1/2 transform -translate-x-1/2 top-2"></div>
        </div>

        {/* Smaller Side Spikes */}
        <div 
          className="absolute w-8 h-12 bg-gradient-to-t from-yellow-600 to-yellow-400"
          style={{
            top: '45%',
            left: '10%',
            transform: 'translateX(-50%) rotateY(-60deg) translateZ(50px)',
            clipPath: 'polygon(50% 0%, 30% 100%, 70% 100%)',
            background: 'linear-gradient(to top, #d97706, #f59e0b, #fbbf24)'
          }}
        ></div>

        <div 
          className="absolute w-8 h-12 bg-gradient-to-t from-yellow-600 to-yellow-400"
          style={{
            top: '45%',
            right: '10%',
            transform: 'translateX(50%) rotateY(60deg) translateZ(50px)',
            clipPath: 'polygon(50% 0%, 30% 100%, 70% 100%)',
            background: 'linear-gradient(to top, #d97706, #f59e0b, #fbbf24)'
          }}
        ></div>

        {/* Back Spikes */}
        <div 
          className="absolute w-10 h-14 bg-gradient-to-t from-yellow-600 to-yellow-400"
          style={{
            top: '40%',
            left: '35%',
            transform: 'translateX(-50%) rotateY(-150deg) translateZ(60px)',
            clipPath: 'polygon(50% 0%, 25% 100%, 75% 100%)',
            background: 'linear-gradient(to top, #d97706, #f59e0b, #fbbf24)'
          }}
        ></div>

        <div 
          className="absolute w-10 h-14 bg-gradient-to-t from-yellow-600 to-yellow-400"
          style={{
            top: '40%',
            right: '35%',
            transform: 'translateX(50%) rotateY(150deg) translateZ(60px)',
            clipPath: 'polygon(50% 0%, 25% 100%, 75% 100%)',
            background: 'linear-gradient(to top, #d97706, #f59e0b, #fbbf24)'
          }}
        ></div>

        {/* Jewels/Gems on Crown */}
        
        {/* Center Ruby */}
        <div 
          className="absolute w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) translateZ(85px)',
            background: 'radial-gradient(circle at 30% 30%, #fca5a5, #ef4444, #dc2626)',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.6), inset -2px -2px 4px rgba(0,0,0,0.3)',
            animation: 'gemSparkle 2s ease-in-out infinite alternate'
          }}
        >
          <div className="absolute w-2 h-2 bg-white/60 rounded-full top-1 left-1"></div>
        </div>

        {/* Side Emeralds */}
        <div 
          className="absolute w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full"
          style={{
            top: '55%',
            left: '30%',
            transform: 'translate(-50%, -50%) rotateY(-30deg) translateZ(75px)',
            background: 'radial-gradient(circle at 30% 30%, #6ee7b7, #10b981, #059669)',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)',
            animationDelay: '0.5s'
          }}
        >
          <div className="absolute w-1 h-1 bg-white/50 rounded-full top-0.5 left-0.5"></div>
        </div>

        <div 
          className="absolute w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full"
          style={{
            top: '55%',
            right: '30%',
            transform: 'translate(50%, -50%) rotateY(30deg) translateZ(75px)',
            background: 'radial-gradient(circle at 30% 30%, #6ee7b7, #10b981, #059669)',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)',
            animationDelay: '1s'
          }}
        >
          <div className="absolute w-1 h-1 bg-white/50 rounded-full top-0.5 left-0.5"></div>
        </div>

        {/* Small Sapphires */}
        <div 
          className="absolute w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"
          style={{
            top: '58%',
            left: '20%',
            transform: 'translate(-50%, -50%) rotateY(-45deg) translateZ(65px)',
            background: 'radial-gradient(circle at 30% 30%, #93c5fd, #3b82f6, #1d4ed8)',
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)'
          }}
        ></div>

        <div 
          className="absolute w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"
          style={{
            top: '58%',
            right: '20%',
            transform: 'translate(50%, -50%) rotateY(45deg) translateZ(65px)',
            background: 'radial-gradient(circle at 30% 30%, #93c5fd, #3b82f6, #1d4ed8)',
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)'
          }}
        ></div>

        {/* Golden Sparkles */}
        <div 
          className="absolute w-2 h-2 bg-yellow-200 rounded-full animate-ping"
          style={{
            top: '30%',
            left: '40%',
            transform: 'translateZ(90px)',
            animationDelay: '0s',
            animationDuration: '3s'
          }}
        ></div>
        <div 
          className="absolute w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping"
          style={{
            top: '70%',
            right: '35%',
            transform: 'translateZ(90px)',
            animationDelay: '1s',
            animationDuration: '2.5s'
          }}
        ></div>
        <div 
          className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
          style={{
            top: '40%',
            right: '45%',
            transform: 'translateZ(90px)',
            animationDelay: '2s',
            animationDuration: '2.8s'
          }}
        ></div>

        {/* Crown Shadow/Reflection */}
        <div 
          className="absolute w-full h-4 bg-gradient-to-r from-transparent via-yellow-900/20 to-transparent rounded-full blur-md"
          style={{
            bottom: '-10%',
            left: '0%',
            transform: 'rotateX(90deg) translateZ(-20px)'
          }}
        ></div>
      </div>

      {/* Royal Glow */}
      <div 
        className="absolute w-80 h-80 bg-gradient-to-r from-yellow-400/20 via-amber-500/20 to-yellow-600/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '4s' }}
      ></div>

      {/* Floating Royal Particles */}
      <div 
        className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-float"
        style={{
          top: '15%',
          left: '20%',
          animationDelay: '0s',
          animationDuration: '4s'
        }}
      ></div>
      <div 
        className="absolute w-1 h-1 bg-amber-400 rounded-full animate-float"
        style={{
          bottom: '20%',
          right: '25%',
          animationDelay: '1.5s',
          animationDuration: '3.5s'
        }}
      ></div>
      <div 
        className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-float"
        style={{
          top: '25%',
          right: '15%',
          animationDelay: '3s',
          animationDuration: '4.5s'
        }}
      ></div>

      <style jsx>{`
        .perspective-1200 {
          perspective: 1200px;
        }
        
        .preserve-3d {
          transform-style: preserve-3d;
        }
        
        @keyframes crownSpin {
          0% {
            transform: rotateX(10deg) rotateY(0deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(10deg) rotateY(360deg) rotateZ(360deg);
          }
        }
        
        @keyframes gemSparkle {
          0% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.6), inset -2px -2px 4px rgba(0,0,0,0.3);
          }
          100% {
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.9), inset -2px -2px 4px rgba(0,0,0,0.3), 0 0 40px rgba(255, 255, 255, 0.3);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        .animate-crown-spin {
          animation: crownSpin 10s linear infinite;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
