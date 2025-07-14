"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Plus, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { MotivationalQuote } from "@/components/motivational-quote"
import { Header } from "@/components/header"

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

export default function Dashboard() {
  const { data: session } = useSession()
  const [taskInput, setTaskInput] = useState("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskInput.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalText: taskInput }),
      })

      if (response.ok) {
        const data = await response.json()
        setTasks([data.task, ...tasks])
        setTaskInput("")
        toast({
          title: "Success!",
          description: "Your task has been broken down into micro-steps.",
        })
      } else {
        throw new Error("Failed to create task")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate micro-tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getCompletedCount = (microTasks: MicroTask[]) => {
    return microTasks.filter((task) => task.done).length
  }

  const getProgressPercentage = (microTasks: MicroTask[]) => {
    if (microTasks.length === 0) return 0
    return Math.round((getCompletedCount(microTasks) / microTasks.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Motivational Quote */}
          <MotivationalQuote />

          {/* Task Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                What would you like to accomplish?
              </CardTitle>
              <CardDescription>
                Describe any task, and I'll break it down into simple, manageable steps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="e.g., Clean my room, Write a report, Learn to cook..."
                  className="flex-1"
                  disabled={isGenerating}
                />
                <Button type="submit" disabled={isGenerating || !taskInput.trim()}>
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Suggest micro-tasks
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Current Tasks */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Tasks</h2>
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks yet. Add your first task above to get started!</p>
                </CardContent>
              </Card>
            ) : (
              tasks.map((task) => (
                <Card key={task._id} className="overflow-hidden">
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-left text-lg">{task.originalText}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">
                                {getCompletedCount(task.microTasks)}/{task.microTasks.length} completed
                              </Badge>
                              <span className="text-sm">{getProgressPercentage(task.microTasks)}% done</span>
                            </CardDescription>
                          </div>
                          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage(task.microTasks)}%` }}
                          />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {task.microTasks.map((microTask, index) => (
                            <div
                              key={index}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                microTask.done
                                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                  : "bg-background border-border"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  microTask.done ? "bg-green-500 border-green-500" : "border-muted-foreground"
                                }`}
                              >
                                {microTask.done && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                              <span className={`flex-1 ${microTask.done ? "line-through text-muted-foreground" : ""}`}>
                                {microTask.text}
                              </span>
                            </div>
                          ))}
                          <div className="pt-4">
                            <Link href={`/tasks/${task._id}`}>
                              <Button className="w-full">
                                <ChevronRight className="h-4 w-4 mr-2" />
                                Start Working on This Task
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
