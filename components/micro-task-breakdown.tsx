"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Check, ChevronRight, Clock, Trophy, Star, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Confetti } from "@/components/confetti"

interface MicroTask {
  id: string
  text: string
  done: boolean
}

interface MicroTaskBreakdownProps {
  task: {
    _id: string
    originalText: string
    microTasks: MicroTask[]
  }
  onMicroTaskToggle: (microTaskId: string, isDone: boolean) => void
}

export function MicroTaskBreakdown({ 
  task, 
  onMicroTaskToggle 
}: MicroTaskBreakdownProps) {
  const { _id: taskId, originalText, microTasks } = task
  
  // Debug: Check for duplicate or missing IDs in microTasks
  console.log("MicroTaskBreakdown - Task ID:", taskId)
  console.log("MicroTaskBreakdown - MicroTasks:", microTasks)
  
  // Verify all microTasks have unique IDs
  const microTaskIds = microTasks.map(mt => mt.id)
  const uniqueIds = new Set(microTaskIds)
  if (uniqueIds.size !== microTasks.length) {
    console.warn("Duplicate microTask IDs detected:", 
      microTaskIds.filter((id, index) => microTaskIds.indexOf(id) !== index))
  }
  
  // Check for undefined or null IDs
  const missingIds = microTasks.filter(mt => !mt.id).length
  if (missingIds > 0) {
    console.warn(`${missingIds} microTasks have missing IDs`)  
  }
  const [showConfetti, setShowConfetti] = useState(false)
  const [currentTaskIndex, setCurrentTaskIndex] = useState(
    microTasks.findIndex((mt: MicroTask) => !mt.done)
  )
  const [animateProgress, setAnimateProgress] = useState(false)
  const [hoverTaskId, setHoverTaskId] = useState<string | null>(null)
  
  useEffect(() => {
    // Trigger progress bar animation when component mounts
    setAnimateProgress(true)
  }, [])
  
  const handleCompleteTask = (microTaskId: string) => {
    onMicroTaskToggle(microTaskId, true)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
    
    // Find next incomplete task
    const nextIndex = microTasks.findIndex((task: MicroTask, index: number) => 
      index > currentTaskIndex && !task.done
    )
    setCurrentTaskIndex(nextIndex !== -1 ? nextIndex : currentTaskIndex)
  }

  // Get the current active micro-task
  const currentTask = currentTaskIndex !== -1 ? microTasks[currentTaskIndex] : null
  
  // Calculate progress
  const completedCount = microTasks.filter((task: MicroTask) => task.done).length
  const progressPercentage = Math.round((completedCount / microTasks.length) * 100)
  const allCompleted = progressPercentage === 100
  
  // Get motivational messages based on progress
  const getMotivationalMessage = () => {
    if (progressPercentage === 0) return "Ready to start? You've got this! ✨"
    if (progressPercentage < 30) return "Great start! Keep going! 🌱"
    if (progressPercentage < 70) return "You're making excellent progress! 🚀"
    if (progressPercentage < 100) return "Almost there! You're doing amazing! 🌟"
    return "Fantastic job! You completed everything! 🎉"
  }

  return (
    <div className="space-y-6">
      {showConfetti && <Confetti pieces={150} duration={4} />}
      
      {/* Progress indicator */}
      <div className="space-y-3 bg-gradient-to-br from-background to-muted/30 p-4 rounded-xl border border-primary/10 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {allCompleted ? (
              <Trophy className="h-5 w-5 text-warning" />
            ) : (
              <Star className="h-5 w-5 text-primary" />
            )}
            <h3 className="font-medium text-base">
              {allCompleted ? "Task Completed!" : "Your Progress"}
            </h3>
          </div>
          <motion.span 
            className="text-sm font-medium px-2 py-1 bg-primary/10 rounded-md"
            initial={{ scale: 0.9 }}
            animate={{ scale: animateProgress ? 1.1 : 0.9 }}
            transition={{ duration: 0.5 }}
          >
            {completedCount}/{microTasks.length}
          </motion.span>
        </div>
        
        <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className={`h-full rounded-full ${allCompleted ? 'bg-gradient-to-r from-warning to-primary' : 'bg-gradient-to-r from-primary/80 to-primary'}`}
            initial={{ width: 0 }}
            animate={{ width: animateProgress ? `${progressPercentage}%` : 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        
        <motion.p 
          className="text-sm font-medium text-center py-1 px-2 rounded-lg bg-background/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {getMotivationalMessage()}
        </motion.p>
      </div>
      
      {/* Current micro-task */}
      {currentTask && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary/60 to-primary"></div>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-start gap-4">
                <motion.div 
                  className="bg-gradient-to-br from-primary/20 to-secondary/20 p-3 rounded-full shadow-sm"
                  whileHover={{ rotate: 10, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight className="h-5 w-5 text-primary" />
                </motion.div>
                <div className="space-y-3 flex-1">
                  <h3 className="font-medium text-lg">Next step:</h3>
                  <p className="text-lg leading-relaxed">{currentTask.text}</p>
                  <div className="pt-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={() => handleCompleteTask(currentTask.id)}
                        className="w-full group text-base py-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                      >
                        <Check className="mr-2 h-5 w-5 group-hover:scale-125 transition-transform" />
                        Mark as Complete
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* All micro-tasks */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-base">All steps:</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
        </div>
        
        <AnimatePresence mode="wait">
          {microTasks.map((task: MicroTask, index: number) => (
            <motion.div
              key={task.id ? task.id : `task-${taskId}-${index}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              onHoverStart={() => setHoverTaskId(task.id)}
              onHoverEnd={() => setHoverTaskId(null)}
              className="relative"
            >
              <motion.div 
                className={`flex items-center gap-3 p-4 rounded-xl border shadow-sm ${task.id === hoverTaskId ? 'shadow-md' : ''} ${
                  task.done 
                    ? "bg-gradient-to-r from-green-50 to-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50" 
                    : index === currentTaskIndex 
                      ? "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30" 
                      : "bg-gradient-to-r from-background to-muted/20 border-muted/50"
                }`}
                whileHover={{ y: -2, x: 0 }}
                animate={{ scale: task.id === hoverTaskId ? 1.01 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                    task.done 
                      ? "bg-gradient-to-br from-green-500 to-green-600 text-white" 
                      : "bg-gradient-to-br from-muted/50 to-muted border border-muted-foreground/20"
                  }`}
                  whileHover={{ scale: 1.1, rotate: task.done ? 10 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {task.done ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </motion.div>
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </motion.div>
                
                <span 
                  className={`flex-1 ${task.done ? "line-through text-muted-foreground" : ""}`}
                >
                  {task.text}
                </span>
                
                {!task.done && index !== currentTaskIndex && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentTaskIndex(index)}
                      className="ml-auto border-primary/20 hover:bg-primary/5 hover:text-primary"
                    >
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      Focus
                    </Button>
                  </motion.div>
                )}
                
                {task.done && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/30 rounded-md">
                      Completed
                    </span>
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMicroTaskToggle(task.id, false);
                        }}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5"
                      >
                        Undo
                      </Button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {microTasks.length === 0 && (
          <motion.div 
            className="p-8 text-center text-muted-foreground border border-dashed rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            No steps defined yet
          </motion.div>
        )}
      </div>
    </div>
  )
}
