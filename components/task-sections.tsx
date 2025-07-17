"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Circle, Clock, ListTodo, CheckSquare, ChevronDown, ChevronUp, Search, SortAsc, Square, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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

interface TaskSectionsProps {
  tasks: Task[]
  onTaskSelect: (taskId: string) => void
  selectedTaskId?: string | null
  onMicroTaskToggle?: (taskId: string, microTaskId: string, isDone: boolean) => void
  onDeleteTask?: (taskId: string) => void
  onDeleteMicroTask?: (taskId: string, microTaskId: string) => void
}

export function TaskSections({ tasks, onTaskSelect, selectedTaskId, onMicroTaskToggle, onDeleteTask, onDeleteMicroTask }: TaskSectionsProps) {
  console.log("TaskSections received tasks:", tasks)
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "progress">("newest")
  const [filterText, setFilterText] = useState("")

  // Filter tasks based on search text
  console.log("Original tasks array:", tasks)
  
  // Check if tasks is an array and has the expected structure
  if (!Array.isArray(tasks)) {
    console.error("Tasks is not an array!", tasks)
  } else if (tasks.length > 0) {
    console.log("First task structure:", tasks[0])
  }

  const filteredTasks = Array.isArray(tasks) 
    ? tasks.filter(task => 
        task.originalText.toLowerCase().includes(filterText.toLowerCase())
      )
    : []
  
  console.log("Filtered tasks:", filteredTasks)

  // Calculate task progress
  const calculateProgress = (task: Task): number => {
    if (!task.microTasks || task.microTasks.length === 0) return 0
    const completedCount = task.microTasks.filter(mt => mt.done).length
    return Math.round((completedCount / task.microTasks.length) * 100)
  }

  // Sort tasks based on selected option
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOption === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortOption === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    } else if (sortOption === "progress") {
      const progressA = calculateProgress(a)
      const progressB = calculateProgress(b)
      return progressB - progressA
    }
    return 0
  })

  // Separate completed and todo tasks
  const todoTasks = sortedTasks.filter(task => calculateProgress(task) < 100)
  const completedTasks = sortedTasks.filter(task => calculateProgress(task) === 100)
  
  console.log("Todo tasks:", todoTasks)
  console.log("Completed tasks:", completedTasks)

  // Toggle task expanded state
  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }))
  }

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    })
  }

  const renderTask = (task: Task) => {
    if (!task || !task._id) {
      console.error("Invalid task in renderTask:", task)
      return null
    }
    
    const progress = calculateProgress(task)
    const isExpanded = expandedTasks[task._id] || false
    const isSelected = selectedTaskId === task._id
    const isCompleted = progress === 100
    
    return (
      <div className="mb-3" key={task._id}>
        <Card 
          className={cn(
            "overflow-hidden transition-all duration-200",
            isSelected ? "border-primary shadow-md" : "border-border",
            isCompleted ? "bg-muted/30" : "bg-card"
          )}
        >
          <div 
            className="cursor-pointer"
            onClick={() => onTaskSelect(task._id)}
          >
            <CardHeader className="p-3 pb-0">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <CardTitle className={cn(
                    "text-base font-medium truncate",
                    isCompleted && "text-muted-foreground line-through"
                  )}>
                    {task.originalText}
                  </CardTitle>
                </div>
                
                <div className="flex items-center gap-1">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs font-normal",
                      isCompleted ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                    )}
                  >
                    {progress}%
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTaskExpanded(task._id)
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {onDeleteTask && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 ml-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm('Are you sure you want to delete this task?')) {
                          onDeleteTask(task._id)
                        }
                      }}
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-3 pt-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  {task.microTasks.filter(mt => mt.done).length} of {task.microTasks.length} steps
                </div>
                <div>
                  {formatRelativeTime(task.createdAt)}
                </div>
              </div>
            </CardContent>
          </div>
          
          {/* Expanded micro-tasks */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-1">
                  {task.microTasks.map((microTask, index) => (
                    <div 
                      key={microTask.id || `${task._id}-micro-${index}`}
                      className="flex items-center justify-between gap-2 text-sm py-1 px-2 rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-5 w-5 rounded-full p-0",
                            microTask.done ? "text-success" : "text-muted-foreground"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (onMicroTaskToggle) {
                              onMicroTaskToggle(task._id, microTask.id, !microTask.done)
                            }
                          }}
                        >
                          {microTask.done ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                        <span className={cn(
                          "transition-all",
                          microTask.done ? "line-through text-muted-foreground" : ""
                        )}>
                          {microTask.text}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {onDeleteMicroTask && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (window.confirm('Are you sure you want to delete this step?')) {
                                onDeleteMicroTask(task._id, microTask.id)
                              }
                            }}
                            title="Delete step"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="pl-8"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value as any)}
          >
            <SelectTrigger className="w-[130px]">
              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4" />
                <span>Sort by</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="todo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="todo" className="flex gap-2">
            <ListTodo className="h-4 w-4" />
            <span>To Do ({todoTasks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Completed ({completedTasks.length})</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="todo" className="mt-4 space-y-3">
          {todoTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks to do</p>
              <p className="text-sm">Create a new task to get started</p>
            </div>
          ) : (
            todoTasks.map(renderTask)
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-4 space-y-3">
          {completedTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No completed tasks</p>
              <p className="text-sm">Complete a task to see it here</p>
            </div>
          ) : (
            completedTasks.map(renderTask)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
