"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ConfettiProps {
  duration?: number;
  pieces?: number;
}

export function Confetti({ duration = 4, pieces = 100 }: ConfettiProps) {
  const [isActive, setIsActive] = useState(true)
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    rotation: number;
    shape: 'circle' | 'square' | 'triangle' | 'star';
    delay: number;
    duration: number;
  }>>([]);

  const colors = [
    '#FF5252', // red
    '#FF9E80', // deep orange
    '#FFCA28', // amber
    '#66BB6A', // green
    '#29B6F6', // light blue
    '#7C4DFF', // deep purple
    '#EC407A', // pink
    '#FFAB40', // orange
  ];

  const shapes = ['circle', 'square', 'triangle', 'star'];

  useEffect(() => {
    // Generate confetti particles with varied properties
    const newParticles = Array.from({ length: pieces }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // random horizontal position
      y: -10 - Math.random() * 10, // start above the viewport
      size: 5 + Math.random() * 10, // random size between 5-15px
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360, // random initial rotation
      shape: shapes[Math.floor(Math.random() * shapes.length)] as 'circle' | 'square' | 'triangle' | 'star',
      delay: Math.random() * 2, // random delay up to 2s
      duration: 1 + Math.random() * 3, // random duration between 1-4s
    }));
    
    setParticles(newParticles);
    
    // Auto-cleanup after duration
    const timer = setTimeout(() => {
      setIsActive(false);
    }, duration * 1000);
    
    return () => clearTimeout(timer);
  }, [duration, pieces]);

  // Helper function to render different shapes
  const renderShape = (shape: string, size: number, color: string, rotation: number) => {
    switch(shape) {
      case 'square':
        return (
          <div 
            style={{ 
              width: `${size}px`, 
              height: `${size}px`, 
              backgroundColor: color,
              transform: `rotate(${rotation}deg)`
            }} 
          />
        );
      case 'triangle':
        return (
          <div 
            style={{ 
              width: 0,
              height: 0,
              borderLeft: `${size/2}px solid transparent`,
              borderRight: `${size/2}px solid transparent`,
              borderBottom: `${size}px solid ${color}`,
              transform: `rotate(${rotation}deg)`
            }} 
          />
        );
      case 'star':
        return (
          <div className="star-shape" style={{ 
            width: `${size}px`, 
            height: `${size}px`,
            backgroundColor: color,
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            transform: `rotate(${rotation}deg)`
          }} />
        );
      case 'circle':
      default:
        return (
          <div 
            style={{ 
              width: `${size}px`, 
              height: `${size}px`, 
              backgroundColor: color,
              borderRadius: '50%'
            }} 
          />
        );
    }
  };

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute"  
              initial={{ 
                x: `${particle.x}vw`, 
                y: `${particle.y}vh`,
                rotate: particle.rotation,
                opacity: 1
              }}
              animate={{ 
                y: '110vh', 
                x: `calc(${particle.x}vw + ${(Math.random() * 20) - 10}vw)`,
                rotate: particle.rotation + (Math.random() * 360),
                opacity: [1, 1, 0.8, 0]
              }}
              transition={{ 
                duration: particle.duration, 
                delay: particle.delay,
                ease: 'easeOut'
              }}
            >
              {renderShape(particle.shape, particle.size, particle.color, particle.rotation)}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
