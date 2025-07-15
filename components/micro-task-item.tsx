"use client"

import { useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { CheckCircle2, Circle, ChevronRight, Sparkles, Focus, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface MicroTaskItemProps {
  microTask: {
    title: string
    done: boolean
  }
  index: number
  taskId: string
  onToggle: (done: boolean) => void
  delay?: number
}

export function MicroTaskItem({ microTask, index, taskId, onToggle, delay = 0 }: MicroTaskItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showSparkle, setShowSparkle] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const sparkleAnimation = useAnimation()
  const itemAnimation = useAnimation()
  
  // Handle completion animation
  useEffect(() => {
    if (microTask.done) {
      setShowSparkle(true)
      sparkleAnimation.start({
        scale: [0, 1.2, 0],
        opacity: [0, 1, 0],
        transition: { duration: 1.5 }
      }).then(() => {
        setShowSparkle(false)
      })
    }
  }, [microTask.done])
  
  // Periodic subtle animation for incomplete tasks
  useEffect(() => {
    if (!microTask.done && !isHovered) {
      const interval = setInterval(() => {
        itemAnimation.start({
          y: [-1, 1, -1],
          transition: { duration: 2 }
        })
      }, 10000) // Every 10 seconds
      
      return () => clearInterval(interval)
    }
  }, [microTask.done, isHovered])
  
  const handleToggle = () => {
    if (!microTask.done) {
      // Animate before toggling
      itemAnimation.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.3 }
      }).then(() => {
        onToggle(!microTask.done)
      })
    } else {
      onToggle(!microTask.done)
    }
  }
  
  const handleFocusClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFocused(!isFocused)
    
    // Animate the focus effect
    itemAnimation.start({
      backgroundColor: isFocused ? "rgba(0,0,0,0)" : "rgba(59, 130, 246, 0.08)",
      borderColor: isFocused ? "rgba(0,0,0,0)" : "rgba(59, 130, 246, 0.3)",
      transition: { duration: 0.3 }
    })
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      className={cn(
        "group flex items-center gap-3 rounded-lg p-3 transition-all relative",
        microTask.done ? "bg-success/10 border-success/20" : "hover:bg-primary/5",
        "border-2",
        isFocused ? "border-primary/30 bg-primary/5" : "border-transparent",
        isHovered && !microTask.done && !isFocused && "border-primary/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
    >
      {/* Completion checkbox */}
      <button
        onClick={handleToggle}
        className={cn(
          "checkbox-container flex h-6 w-6 items-center justify-center rounded-full transition-all",
          !microTask.done && "hover:scale-110"
        )}
        aria-label={microTask.done ? "Mark as incomplete" : "Mark as complete"}
      >
        {microTask.done ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, 0] }}
            className="text-success"
          >
            <CheckCircle2 className="h-6 w-6 fill-success text-white" />
          </motion.div>
        ) : (
          <motion.div
            animate={{ 
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? [0, 5, -5, 0] : 0 
            }}
            transition={{ duration: 0.3 }}
          >
            <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
          </motion.div>
        )}
      </button>
      
      {/* Task title */}
      <motion.span
        className={cn(
          "flex-1 text-base transition-all font-medium",
          microTask.done && "text-muted-foreground line-through decoration-2",
          isFocused && !microTask.done && "text-primary"
        )}
        animate={{
          opacity: microTask.done ? 0.7 : 1,
        }}
      >
        {microTask.title}
      </motion.span>
      
      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* Focus button - only show when not completed */}
        {!microTask.done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: isHovered || isFocused ? 1 : 0,
              scale: isHovered || isFocused ? 1 : 0.8,
              x: isHovered || isFocused ? 0 : 10
            }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-7 w-7 rounded-full",
                isFocused ? "bg-primary/20 text-primary" : "text-muted-foreground"
              )}
              onClick={handleFocusClick}
            >
              <Focus className="h-4 w-4" />
              <span className="sr-only">{isFocused ? "Remove focus" : "Focus on this step"}</span>
            </Button>
          </motion.div>
        )}
        
        {/* Next indicator */}
        <motion.div
          animate={{ 
            x: isHovered && !microTask.done ? 0 : -5,
            opacity: isHovered && !microTask.done ? 1 : 0 
          }}
          className="text-primary"
        >
          <ChevronRight className="h-5 w-5" />
        </motion.div>
      </div>
      
      {/* Sparkle effect on completion */}
      {showSparkle && (
        <motion.div 
          className="absolute inset-0 pointer-events-none overflow-hidden"
          animate={sparkleAnimation}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Sparkles className="h-12 w-12 text-yellow-400 opacity-70" />
          </div>
        </motion.div>
      )}
      
      {/* Focus indicator */}
      {isFocused && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
      )}
    </motion.div>
  )
}
