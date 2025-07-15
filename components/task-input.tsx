"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2, Lightbulb, Smile, ArrowRight, Brain, Wand2 } from "lucide-react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

interface TaskInputProps {
  onTaskCreated: (task: any) => void
}

export function TaskInput({ onTaskCreated }: TaskInputProps) {
  const { data: session, status } = useSession()
  const [taskInput, setTaskInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [showTip, setShowTip] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const sparklesAnimation = useAnimation()
  const { toast } = useToast()
  
  const placeholders = [
    "Write my research paper...",
    "Clean my apartment...",
    "Study for my exam...",
    "Prepare for job interview...",
    "Plan my weekend trip...",
    "Organize my digital files...",
    "Learn to play guitar...",
    "Start a workout routine...",
    "Create a content calendar...",
    "Develop a new habit...",
    "Redesign my personal website...",
  ]
  
  const tips = [
    "Be specific about what you want to accomplish",
    "Break down large tasks into smaller ones",
    "Start with the task that feels most doable",
    "It's okay to take small steps forward",
    "Focus on progress, not perfection",
    "Remember your 'why' behind each task",
    "Celebrate small wins along the way",
    "Try timeboxing to make progress"
  ]
  
  // Animate sparkles icon periodically
  useEffect(() => {
    const animateSparkles = async () => {
      await sparklesAnimation.start({
        rotate: [0, 15, -15, 0],
        scale: [1, 1.2, 1],
        transition: { duration: 1.5 }
      })
      setTimeout(animateSparkles, 7000)
    }
    animateSparkles()
  }, [])
  
  // Rotate placeholders every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])
  
  // Show random tip after 3 seconds of inactivity
  useEffect(() => {
    if (taskInput.length === 0) {
      const tipTimer = setTimeout(() => {
        setShowTip(true)
      }, 3000)
      return () => clearTimeout(tipTimer)
    } else {
      setShowTip(false)
    }
  }, [taskInput])
  
  // Focus input when clicking on card
  const focusInput = () => {
    inputRef.current?.focus()
  }

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    await createTask()
  }
  
  // Direct API call function to create a task
  const createTask = async () => {
    console.log('Creating task with text:', taskInput)
    if (!taskInput.trim()) return
    
    // Check authentication status
    if (status !== "authenticated") {
      console.error('User not authenticated')
      toast({
        title: "Authentication required",
        description: "Please sign in to create tasks.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    
    try {
      console.log('Making API call to create task...', session?.user)
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalText: taskInput }),
      })
      console.log('API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`API error: ${response.status}`)
      }

      if (response.ok) {
        const data = await response.json()
        onTaskCreated(data.task)
        setTaskInput("")
        toast({
          title: "✨ Task created!",
          description: "Your task has been broken down into achievable micro-steps.",
          variant: "default",
        })
      } else {
        throw new Error("Failed to create task")
      }
    } catch (error) {
      toast({
        title: "Oops!",
        description: "We couldn't create your task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const currentPlaceholder = placeholders[placeholderIndex]
  const randomTipIndex = Math.floor(Math.random() * tips.length)
  
  return (
    <Card 
      className="border-2 border-primary/20 shadow-lg overflow-hidden task-card"
      onClick={focusInput}
    >
      {/* Decorative top bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary"></div>
      
      <CardHeader className="pb-3 pt-5">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <motion.div
            animate={sparklesAnimation}
            className="p-1.5 rounded-full bg-primary/10"
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </motion.div>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            What would you like to accomplish?
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Tell me what you want to do, and I'll break it down into tiny, achievable steps.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 group">
            <motion.div 
              className={`absolute inset-0 rounded-md border-2 ${isInputFocused ? 'border-primary' : 'border-muted-foreground/20'} transition-colors`}
              initial={false}
              animate={{
                boxShadow: isInputFocused ? '0 0 0 2px rgba(var(--primary), 0.2)' : 'none'
              }}
              transition={{ duration: 0.2 }}
            />
            <Input
              ref={inputRef}
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder={currentPlaceholder}
              className="pr-20 border-2 h-12 text-base bg-transparent relative z-10 border-transparent focus:border-transparent focus:ring-0 focus:outline-none"
              disabled={isGenerating}
              autoComplete="off"
            />
            <AnimatePresence mode="wait">
              {taskInput.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium px-2 py-1 rounded-full bg-primary/10 text-primary"
                >
                  {taskInput.length}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              type="button" 
              onClick={() => {
                console.log('Button clicked, creating task...');
                createTask();
              }}
              disabled={isGenerating || !taskInput.trim()}
              className="h-12 px-6 text-base font-medium transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Brain className="h-5 w-5" />
                  </motion.div>
                  <span>Breaking down...</span>
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  <span>Create Task</span>
                </>
              )}
            </Button>
          </motion.div>
        </form>
        
        <AnimatePresence mode="wait">
          {showTip && !isGenerating && taskInput.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-4 flex items-center gap-2 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 text-sm shadow-sm"
            >
              <motion.div 
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                className="bg-warning/10 p-1.5 rounded-full"
              >
                <Lightbulb className="h-4 w-4 text-warning" />
              </motion.div>
              <span className="font-medium">{tips[randomTipIndex]}</span>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 text-sm text-muted-foreground flex items-center gap-2 p-2"
            >
              <Smile className="h-4 w-4 text-secondary" />
              <p>Try to be specific about what you want to accomplish.</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 w-12 h-12 rounded-full bg-primary/5 -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 rounded-full bg-secondary/5 translate-x-1/2 translate-y-1/2 blur-xl"></div>
      </CardContent>
    </Card>
  )
}
