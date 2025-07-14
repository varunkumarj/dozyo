"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, SkipBackIcon as Skip, Sparkles, Trophy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Header } from "@/components/header"
import { Confetti } from "@/components/confetti"

interface MicroTask {
  text: string
  done: boolean
}

interface Task {
  _id: string
  originalText: string
  microTasks: MicroTask[]
  createdAt: string
}

interface MicroTaskViewProps {
  taskId: string
}

export default function MicroTaskView({ taskId }: MicroTaskViewProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchTask()
  }, [taskId])

  useEffect(() => {
    if (task) {
      const completed = task.microTasks.filter((t) => t.done).length
      setCompletedCount(completed)

      // Find next incomplete step
      const nextIncomplete = task.microTasks.findIndex((t) => !t.done)
      if (nextIncomplete !== -1) {
        setCurrentStepIndex(nextIncomplete)
      }
    }
  }, [task])

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`)
      if (response.ok) {
        const data = await response.json()
        setTask(data.task)
      }
    } catch (error) {
      console.error("Error fetching task:", error)
    }
  }

  const handleComplete = async () => {
    if (!task) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          microTaskIndex: currentStepIndex,
          done: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTask(data.task)
        setShowConfetti(true)

        toast({
          title: "🎉 Tiny win!",
          description: "Great job completing that step!",
        })

        // Hide confetti after animation
        setTimeout(() => setShowConfetti(false), 2000)

        // Move to next step
        const nextStep = data.task.microTasks.findIndex((t: MicroTask) => !t.done)
        if (nextStep !== -1) {
          setCurrentStepIndex(nextStep)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSkip = () => {
    if (!task) return

    const nextStep = task.microTasks.findIndex((t, index) => index > currentStepIndex && !t.done)
    if (nextStep !== -1) {
      setCurrentStepIndex(nextStep)
    }
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const currentStep = task.microTasks[currentStepIndex]
  const totalSteps = task.microTasks.length
  const allCompleted = task.microTasks.every((t) => t.done)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      {showConfetti && <Confetti />}

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          {/* Task Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {task.originalText}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="secondary">
                  {completedCount}/{totalSteps} completed
                </Badge>
                <span className="text-sm">{Math.round((completedCount / totalSteps) * 100)}% done</span>
              </CardDescription>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalSteps) * 100}%` }}
                />
              </div>
            </CardHeader>
          </Card>

          {/* Current Step or Completion */}
          {allCompleted ? (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CardContent className="py-8 text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-green-600" />
                <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">Congratulations! 🎉</h2>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  You've completed all the micro-steps for this task!
                </p>
                <Link href="/">
                  <Button>Back to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Step {currentStepIndex + 1} of {totalSteps}
                </CardTitle>
                <CardDescription>Take your time with this small step</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-muted/50 rounded-lg">
                  <p className="text-lg font-medium text-center">{currentStep?.text}</p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleComplete} className="flex-1" size="lg">
                    <Check className="h-4 w-4 mr-2" />
                    Complete Step
                  </Button>
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    size="lg"
                    disabled={currentStepIndex >= totalSteps - 1}
                  >
                    <Skip className="h-4 w-4 mr-2" />
                    Skip
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>💡 Remember: Progress over perfection!</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tiny Win Counter */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Tiny Wins: {completedCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
