"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { motion } from "framer-motion"

import { NewHeader } from "@/components/new-header"
import { TaskInput } from "@/components/task-input"
import { TaskSections } from "@/components/task-sections"
import { MicroTaskBreakdown } from "@/components/micro-task-breakdown"
import { MotivationalElement } from "@/components/motivational-element"
import { StreakTracker } from "@/components/streak-tracker"
import { JustDoOne } from "@/components/just-do-one"
import { Confetti } from "@/components/ui/confetti"
import { Toaster } from "@/components/ui/toaster"
import { useNotifications } from "@/hooks/use-notifications"

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

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [streak, setStreak] = useState({
    current: 0,
    longest: 0,
    todayCompleted: false,
    streakHistory: []
  })
  
  // Initialize notifications
  const { sendNudge } = useNotifications()

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/signin")
    }
  }, [status])

  // Fetch tasks
  useEffect(() => {
    if (status === "authenticated") {
      fetchTasks()
    }
  }, [status])

  // Fetch user streak data
  useEffect(() => {
    if (status === "authenticated") {
      fetchStreakData()
    }
  }, [status])

  const fetchTasks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tasks")
      if (response.ok) {
        const data = await response.json()
        console.log("API Response:", data)
        console.log("Tasks from API:", data.tasks)
        
        // Validate tasks data structure before setting state
        const validTasks = Array.isArray(data.tasks) 
          ? data.tasks.filter((task: any) => 
              task && 
              typeof task === 'object' && 
              task._id && 
              Array.isArray(task.microTasks)
            )
          : []
          
        console.log("Valid tasks after filtering:", validTasks)
        setTasks(validTasks)
        
        // Auto-select the first in-progress task if available
        if (validTasks.length > 0) {
          const inProgressTask = validTasks.find(
            (task: Task) => 
              task.microTasks.some(mt => !mt.done) && 
              task.microTasks.some(mt => mt.done)
          )
          
          if (inProgressTask) {
            setSelectedTaskId(inProgressTask._id)
          } else if (!selectedTaskId && validTasks.length > 0) {
            // If no in-progress task, select the first incomplete task
            const incompleteTask = validTasks.find(
              (task: Task) => task.microTasks.some(mt => !mt.done)
            )
            if (incompleteTask) {
              setSelectedTaskId(incompleteTask._id)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStreakData = async () => {
    try {
      const response = await fetch("/api/streak")
      if (response.ok) {
        const data = await response.json()
        setStreak({
          current: data.currentStreak || 0,
          longest: data.longestStreak || 0,
          todayCompleted: data.todayCompleted || false,
          streakHistory: data.streakHistory || []
        })
      }
    } catch (error) {
      console.error("Error fetching streak data:", error)
    }
  }

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev])
    setSelectedTaskId(newTask._id)
    
    // Show confetti for new task creation
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId)
  }

  const handleMicroTaskToggle = async (taskId: string, microTaskId: string, isDone: boolean) => {
    // Optimistic update
    const updatedTasks = tasks.map(task => {
      if (task._id === taskId) {
        const updatedMicroTasks = task.microTasks.map(mt => 
          mt.id === microTaskId ? { ...mt, done: isDone } : mt
        )
        return { ...task, microTasks: updatedMicroTasks }
      }
      return task
    })
    
    setTasks(updatedTasks)
    
    // Check if all micro-tasks are completed
    const currentTask = updatedTasks.find(t => t._id === taskId)
    if (currentTask && currentTask.microTasks.every(mt => mt.done)) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      
      // Update streak data
      fetchStreakData()
    }
    
    // Update in the backend
    try {
      await fetch(`/api/tasks/${taskId}/microtasks/${microTaskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ done: isDone }),
      })
    } catch (error) {
      console.error("Error updating micro-task:", error)
      // Revert on error
      fetchTasks()
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    // Optimistically update UI
    setTasks(prev => prev.filter(task => task._id !== taskId))
    
    // If the deleted task was selected, clear selection
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null)
    }
    
    // Delete in the backend
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        // Revert on error
        fetchTasks()
      }
    } catch (error) {
      console.error("Error deleting task:", error)
      // Revert on error
      fetchTasks()
    }
  }
  
  const handleDeleteMicroTask = async (taskId: string, microTaskId: string) => {
    // Optimistically update UI
    setTasks(prev => prev.map(task => {
      if (task._id === taskId) {
        return {
          ...task,
          microTasks: task.microTasks.filter(mt => mt.id !== microTaskId)
        }
      }
      return task
    }))
    
    // Delete in the backend
    try {
      const response = await fetch(`/api/tasks/${taskId}/microtasks/${microTaskId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        // Revert on error
        fetchTasks()
      }
    } catch (error) {
      console.error("Error deleting micro-task:", error)
      // Revert on error
      fetchTasks()
    }
  }

  const selectedTask = tasks.find(task => task._id === selectedTaskId)

  // Handle task completion from Just Do One component
  const handleJustDoOneCompleted = () => {
    // Refresh streak data and tasks
    fetchStreakData()
    fetchTasks()
    
    // Show confetti for completion
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
    
    // Send a motivational nudge
    sendNudge("Great job completing your task!")
  }
  
  // Handle task selection from Just Do One component
  const handleJustDoOneTaskSelected = (taskId: string) => {
    setSelectedTaskId(taskId)
  }

  return (
    <div className="min-h-screen bg-background">
      <NewHeader />
      <Toaster />
      {showConfetti && <Confetti show={showConfetti} />}
      
      <main className="w-full px-4 py-6">
        <div className="w-full max-w-screen-2xl mx-auto">
          {/* Motivational Element - Full Width */}
          <div className="mb-6">
            <MotivationalElement />
          </div>
          
          {/* Main Content - Flexible Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar - Streak and Just Do One */}
            <div className="lg:w-1/4 space-y-6">
              <StreakTracker 
                currentStreak={streak.current}
                longestStreak={streak.longest}
                todayCompleted={streak.todayCompleted}
                streakHistory={streak.streakHistory}
              />
              
              <JustDoOne
                onTaskSelected={handleJustDoOneTaskSelected}
                onCompleted={handleJustDoOneCompleted}
              />
            </div>
            
            {/* Center Content - Task Input and Breakdown */}
            <div className="lg:w-2/4 space-y-6">
              <TaskInput onTaskCreated={handleTaskCreated} />
              
              {selectedTask ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <MicroTaskBreakdown
                    task={selectedTask as any}
                    onMicroTaskToggle={(microTaskId: string, isDone: boolean) => 
                      handleMicroTaskToggle(selectedTask._id, microTaskId, isDone)
                    }
                  />
                </motion.div>
              ) : (
                <div className="h-64 flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      {tasks.length > 0 
                        ? "Select a task to see its breakdown" 
                        : "Create a task to get started"}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Sidebar - Task Sections */}
            <div className="lg:w-1/4 lg:max-h-screen lg:overflow-y-auto lg:sticky lg:top-20">
              <TaskSections 
                tasks={tasks} 
                onTaskSelect={handleTaskSelect}
                selectedTaskId={selectedTaskId}
                onMicroTaskToggle={handleMicroTaskToggle}
                onDeleteTask={handleDeleteTask}
                onDeleteMicroTask={handleDeleteMicroTask}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
