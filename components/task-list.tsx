"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ListChecks, Clock, CheckCircle2, Sparkles, Clipboard, CheckSquare, Star, Zap } from "lucide-react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { TaskCard } from "@/components/task-card"

interface MicroTask {
  id: string
  text: string
  done: boolean
}

interface Task {
  _id: string
  originalText: string
  microTasks: MicroTask[]
  createdAt: string
}

interface TaskListProps {
  tasks: Task[]
  onTaskSelect: (taskId: string) => void
}

export function TaskList({ tasks, onTaskSelect }: TaskListProps) {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null)
  const listAnimation = useAnimation()
  
  // Animate list periodically
  useEffect(() => {
    const animateList = async () => {
      await listAnimation.start({
        scale: [1, 1.02, 1],
        transition: { duration: 1.5 }
      })
      setTimeout(animateList, 15000) // Animate every 15 seconds
    }
    setTimeout(animateList, 5000) // Start after 5 seconds
  }, [])
  
  // Function to handle micro-task toggling
  const handleMicroTaskToggle = async (taskId: string, microTaskIndex: number, done: boolean) => {
    // Here we would typically make an API call to update the micro-task status
    // For now, we'll just call onTaskSelect to notify the parent component
    onTaskSelect(taskId)
  }
  
  const getCompletedCount = (microTasks: MicroTask[]) => {
    return microTasks.filter(task => task.done).length
  }
  
  // Function to get completion percentage
  const getCompletionPercentage = (microTasks: MicroTask[]) => {
    if (microTasks.length === 0) return 0
    return Math.round((getCompletedCount(microTasks) / microTasks.length) * 100)
  }
  
  // Sort tasks: in-progress first, then by creation date
  const sortedTasks = [...tasks].sort((a, b) => {
    const aComplete = getCompletedCount(a.microTasks) === a.microTasks.length
    const bComplete = getCompletedCount(b.microTasks) === b.microTasks.length
    
    if (aComplete && !bComplete) return 1
    if (!aComplete && bComplete) return -1
    
    // If both are in the same completion state, sort by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <Card className="shadow-lg border-2 border-primary/10 overflow-hidden">
      {/* Decorative top bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary/80 via-secondary/60 to-primary/80"></div>
      
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <motion.div
              animate={listAnimation}
              className="p-1.5 bg-primary/10 rounded-full"
            >
              <Clipboard className="h-5 w-5 text-primary" />
            </motion.div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your Tasks
            </span>
          </CardTitle>
          <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium bg-primary/5 border-primary/20">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </Badge>
        </div>
        <CardDescription className="text-base">
          All your tasks broken down into manageable micro-steps
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {tasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: [0.8, 1.1, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-5 mb-5 shadow-inner"
            >
              <Sparkles className="h-10 w-10 text-primary" />
            </motion.div>
            <h3 className="font-semibold text-xl mb-3">No tasks yet</h3>
            <p className="text-muted-foreground text-base max-w-sm px-4">
              Add your first task above and we'll help you break it down into tiny, achievable steps to make progress feel effortless.
            </p>
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                variant="outline" 
                className="border-primary/20 hover:bg-primary/5 text-primary"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Zap className="mr-2 h-4 w-4" />
                Create Your First Task
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-5">
              {sortedTasks.map((task, index) => {
                // Convert MicroTask[] to the format expected by TaskCard
                const formattedMicroTasks = task.microTasks.map(mt => ({
                  title: mt.text,
                  done: mt.done
                }))
                
                // Create a task object in the format expected by TaskCard
                const formattedTask = {
                  _id: task._id,
                  title: task.originalText,
                  microTasks: formattedMicroTasks,
                  createdAt: task.createdAt
                }
                
                const completionPercentage = getCompletionPercentage(task.microTasks)
                const isComplete = completionPercentage === 100
                const isInProgress = completionPercentage > 0 && completionPercentage < 100
                
                return (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => onTaskSelect(task._id)}
                    onHoverStart={() => setHoveredTaskId(task._id)}
                    onHoverEnd={() => setHoveredTaskId(null)}
                    className="cursor-pointer relative"
                    whileHover={{ y: -3 }}
                  >
                    {/* Highlight effect on hover */}
                    {hoveredTaskId === task._id && (
                      <motion.div 
                        className="absolute inset-0 bg-primary/5 rounded-lg z-0"
                        layoutId="task-highlight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    
                    <div className="relative z-10">
                      <TaskCard
                        task={formattedTask}
                        onMicroTaskToggle={handleMicroTaskToggle}
                      />
                    </div>
                    
                    {/* Task status indicator */}
                    <div className="absolute top-3 right-3 z-20">
                      {isComplete ? (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, rotate: [0, 10, 0] }}
                          transition={{ type: "spring" }}
                          className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full"
                        >
                          <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </motion.div>
                      ) : isInProgress ? (
                        <motion.div 
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          className="bg-primary/10 p-1 rounded-full"
                        >
                          <Star className="h-4 w-4 text-primary" />
                        </motion.div>
                      ) : null}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </AnimatePresence>
        )}
        
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 w-24 h-24 rounded-full bg-primary/5 -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-secondary/5 translate-x-1/2 translate-y-1/2 blur-2xl"></div>
      </CardContent>
    </Card>
  )
}
