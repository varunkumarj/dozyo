"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ConfettiProps {
  show: boolean
}

export function Confetti({ show }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; color: string; size: number; delay: number }>>([])

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#FFD6E0', '#FFACC7', '#FFC3A0', '#A0E7E5', '#B4F8C8', '#FBE7C6'][
          Math.floor(Math.random() * 6)
        ],
        size: Math.random() * 8 + 4,
        delay: Math.random() * 0.5,
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [show])

  if (!show || particles.length === 0) return null

  return (
    <div className="celebration">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          initial={{ 
            top: "-20px", 
            left: `${particle.x}vw`,
            opacity: 1,
            scale: 0
          }}
          animate={{ 
            top: "120vh", 
            opacity: [1, 1, 0],
            rotate: Math.random() * 720 - 360,
            scale: 1
          }}
          transition={{ 
            duration: 3 + Math.random() * 2,
            delay: particle.delay,
            ease: "easeOut" 
          }}
          style={{
            width: particle.size,
            height: particle.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            backgroundColor: particle.color,
          }}
        />
      ))}
    </div>
  )
}
