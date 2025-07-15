"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Sparkles, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

interface JustDoOneProps {
  onTaskSelected?: (taskId: string) => void
  onCompleted?: () => void
}

export function JustDoOne({ onTaskSelected, onCompleted }: JustDoOneProps) {
  const [loading, setLoading] = useState(true)
  const [suggestedTask, setSuggestedTask] = useState<any>(null)
  const [completed, setCompleted] = useState(false)
  const { toast } = useToast()

  // Fetch a suggested micro-task on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchSuggestedTask = async () => {
      try {
        // Add a small delay to prevent immediate fetch on mount
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) return;
        
        const response = await fetch("/api/tasks/suggest")
        if (response.ok) {
          const data = await response.json()
          if (isMounted) {
            setSuggestedTask(data.task)
          }
        } else {
          // Use a more graceful fallback instead of console error
          if (isMounted) {
            setSuggestedTask(null)
          }
        }
      } catch (error) {
        // Handle error gracefully
        if (isMounted) {
          setSuggestedTask(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchSuggestedTask()
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [])

  // Handle task selection
  const handleTaskSelect = () => {
    if (suggestedTask && onTaskSelected) {
      onTaskSelected(suggestedTask._id)
    }
  }

  // Handle task completion
  const handleTaskComplete = async () => {
    if (!suggestedTask) return

    setLoading(true)
    try {
      // Update the micro-task status
      const response = await fetch(`/api/tasks/${suggestedTask._id}/microtasks/${suggestedTask.microTask.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ done: true }),
      })

      if (response.ok) {
        setCompleted(true)
        toast({
          title: "🎉 Great job!",
          description: "You've completed your one task for today!",
          variant: "default",
        })
        
        // Update streak
        await fetch("/api/streak/increment", {
          method: "POST",
        })
        
        if (onCompleted) {
          onCompleted()
        }
      } else {
        throw new Error("Failed to update task")
      }
    } catch (error) {
      console.error("Error completing task:", error)
      toast({
        title: "Oops!",
        description: "We couldn't update your task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2 border-warning/30 bg-gradient-to-br from-background to-warning/5 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 15 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
          >
            <Star className="h-5 w-5 text-warning" />
          </motion.div>
          Just Do One
        </CardTitle>
        <CardDescription>
          Complete just one micro-task to keep your streak alive
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 flex justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </motion.div>
            </motion.div>
          ) : completed ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="mb-3"
              >
                <CheckCircle className="h-12 w-12 text-success" />
              </motion.div>
              <h3 className="text-lg font-medium mb-1">Great job!</h3>
              <p className="text-sm text-muted-foreground">
                You've completed your one task for today.
              </p>
            </motion.div>
          ) : suggestedTask ? (
            <motion.div
              key="task"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-lg bg-card border border-primary/10">
                <p className="text-sm font-medium mb-1">Suggested micro-task:</p>
                <p className="text-base">{suggestedTask.microTask.text}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  From: {suggestedTask.originalText}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleTaskSelect}
                >
                  View task
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  className="flex-1 bg-warning hover:bg-warning/90 text-white"
                  onClick={handleTaskComplete}
                >
                  Mark complete
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="no-task"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 text-center"
            >
              <p className="text-sm text-muted-foreground">
                No tasks available. Create a new task to get started!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
