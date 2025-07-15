"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { ChevronDown, ChevronUp, CheckCircle, Clock, Award, Sparkles, Star, Zap, Calendar } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MicroTaskItem } from "@/components/micro-task-item"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface TaskCardProps {
  task: {
    _id: string
    title: string
    microTasks: Array<{
      title: string
      done: boolean
    }>
    createdAt: string
  }
  onMicroTaskToggle: (taskId: string, microTaskIndex: number, done: boolean) => Promise<void>
}

export function TaskCard({ task, onMicroTaskToggle }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showSparkle, setShowSparkle] = useState(false)
  
  const progressAnimation = useAnimation()
  const sparkleAnimation = useAnimation()
  
  const completedCount = task.microTasks.filter(mt => mt.done).length
  const totalCount = task.microTasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const isCompleted = completedCount === totalCount && totalCount > 0
  const isInProgress = completedCount > 0 && !isCompleted
  
  // Animate progress bar when progress changes
  useEffect(() => {
    progressAnimation.start({
      width: `${progress}%`,
      backgroundColor: progress === 100 
        ? ['#22c55e', '#10b981', '#22c55e'] 
        : ['#3b82f6', '#8b5cf6', '#3b82f6'],
      transition: { duration: 0.8, ease: "easeOut" }
    })
    
    // Show sparkle animation when task is completed
    if (isCompleted) {
      setShowSparkle(true)
      sparkleAnimation.start({
        scale: [0, 1.2, 1],
        rotate: [0, 15, -15, 0],
        opacity: [0, 1],
        transition: { duration: 0.8 }
      })
    }
  }, [progress, isCompleted])
  
  // Format the creation date
  const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  return (
    <Card 
      className={cn(
        "task-card overflow-hidden border-2 relative",
        isCompleted ? "border-success/30 bg-success/5" : 
          isInProgress ? "border-primary/30" : "border-primary/20",
        isHovered && !isCompleted && "border-primary/40 shadow-lg"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative top bar */}
      <div className={cn(
        "h-1 w-full", 
        isCompleted ? "bg-gradient-to-r from-green-400 via-emerald-500 to-green-400" : 
        "bg-gradient-to-r from-primary/80 via-secondary/60 to-primary/80"
      )}></div>
      
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 15, 0] }}
                className="p-1.5 rounded-full bg-success/20 text-success"
              >
                <CheckCircle className="h-5 w-5" />
              </motion.div>
            ) : isInProgress ? (
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="p-1.5 rounded-full bg-primary/20 text-primary"
              >
                <Star className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div className="p-1.5 rounded-full bg-secondary/20 text-secondary">
                <Clock className="h-5 w-5" />
              </motion.div>
            )}
            <span className={cn(
              "font-medium",
              isCompleted ? "text-success" : "",
              isInProgress && "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            )}>
              {task.title}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="flex items-center gap-1 px-2 py-0.5 text-xs font-normal bg-background/80">
              <Calendar className="h-3 w-3 opacity-70" />
              <span className="text-muted-foreground">{formattedDate}</span>
            </Badge>
            
            {isCompleted && (
              <motion.div
                initial={{ scale: 0, x: 20 }}
                animate={{ scale: 1, x: 0 }}
                className="rounded-full bg-success/20 px-2.5 py-0.5 text-xs font-medium text-success flex items-center gap-1"
              >
                <CheckCircle className="h-3 w-3" />
                Completed
              </motion.div>
            )}
            
            {isInProgress && (
              <motion.div
                initial={{ scale: 0, x: 20 }}
                animate={{ scale: 1, x: 0 }}
                className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary flex items-center gap-1"
              >
                <Zap className="h-3 w-3" />
                In Progress
              </motion.div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-0">
        <div className="mb-4 mt-2">
          <div className="relative h-2.5 overflow-hidden rounded-full bg-muted/50 shadow-inner">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              initial={{ width: "0%" }}
              animate={progressAnimation}
              style={{ 
                backgroundImage: isCompleted 
                  ? "linear-gradient(to right, #22c55e, #10b981, #22c55e)" 
                  : "linear-gradient(to right, #3b82f6, #8b5cf6, #3b82f6)" 
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">
              {isCompleted ? "Completed" : isInProgress ? "In progress" : "Not started"}
            </span>
            <span className={cn(
              "font-medium",
              isCompleted ? "text-success" : "text-primary"
            )}>
              {completedCount} of {totalCount} steps
            </span>
          </div>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="space-y-2.5 overflow-hidden pb-4"
            >
              {task.microTasks.map((microTask, index) => (
                <MicroTaskItem
                  key={`${task._id}-${index}`}
                  microTask={microTask}
                  index={index}
                  taskId={task._id}
                  onToggle={(done) => onMicroTaskToggle(task._id, index, done)}
                  delay={index}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      
      <CardFooter className="flex justify-center pb-3 pt-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full gap-1.5 font-medium",
            isExpanded ? "text-muted-foreground" : 
              isCompleted ? "text-success hover:text-success/80" : 
              "text-primary hover:text-primary/80"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span>Hide steps</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>Show {totalCount} steps</span>
            </>
          )}
        </Button>
      </CardFooter>
      
      {/* Completion award badge */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/30"
        >
          <Award className="h-6 w-6" />
        </motion.div>
      )}
      
      {/* Sparkle effect on completion */}
      {showSparkle && (
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          animate={sparkleAnimation}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Sparkles className="h-16 w-16 text-yellow-400 opacity-70" />
          </div>
        </motion.div>
      )}
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-primary/5 translate-x-1/2 translate-y-1/2 blur-2xl pointer-events-none opacity-50"></div>
    </Card>
  )
}
