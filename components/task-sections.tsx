"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Circle, Clock, ListTodo, CheckSquare, ChevronDown, ChevronUp, Search, SortAsc, Square } from "lucide-react"
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
}

export function TaskSections({ tasks, onTaskSelect, selectedTaskId, onMicroTaskToggle }: TaskSectionsProps) {
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
  
  const filteredTasks = filterText.length > 0
    ? tasks.filter(task => {
        if (!task || typeof task !== 'object') {
          console.error("Invalid task object:", task)
          return false
        }
        return task.originalText?.toLowerCase().includes(filterText.toLowerCase()) ||
          task.microTasks?.some(mt => mt.text?.toLowerCase().includes(filterText.toLowerCase()))
      })
    : tasks
  
  console.log("Filtered tasks:", filteredTasks)

  // Separate tasks into todo and completed
  const todoTasks = filteredTasks.filter(task => {
    if (!task || !Array.isArray(task.microTasks)) {
      console.error("Task has invalid microTasks:", task)
      return false
    }
    return task.microTasks.some(mt => !mt.done)
  })
  
  console.log("Todo tasks:", todoTasks)
  
  const completedTasks = filteredTasks.filter(task => {
    if (!task || !Array.isArray(task.microTasks) || task.microTasks.length === 0) {
      console.error("Task has invalid microTasks for completed check:", task)
      return false
    }
    return task.microTasks.every(mt => mt.done)
  })
  
  console.log("Completed tasks:", completedTasks)
  
  // Sort tasks based on selected option
  const sortTasks = (tasksToSort: Task[]) => {
    if (!Array.isArray(tasksToSort) || tasksToSort.length === 0) {
      return []
    }
    
    try {
      switch (sortOption) {
        case "newest":
          return [...tasksToSort].sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          })
        case "oldest":
          return [...tasksToSort].sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          })
        case "progress":
          return [...tasksToSort].sort((a, b) => calculateProgress(b) - calculateProgress(a))
        default:
          return tasksToSort
      }
    } catch (error) {
      console.error("Error sorting tasks:", error)
      return tasksToSort
    }
  }
  
  const sortedTodoTasks = sortTasks(todoTasks)
  const sortedCompletedTasks = sortTasks(completedTasks)

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }))
  }

  // Calculate progress for a task
  const calculateProgress = (task: Task) => {
    if (!task || !Array.isArray(task.microTasks)) {
      console.error("Invalid task in calculateProgress:", task)
      return 0
    }
    
    const total = task.microTasks.length
    if (total === 0) return 0
    
    const completed = task.microTasks.filter(mt => mt && typeof mt === 'object' && mt.done).length
    return Math.round((completed / total) * 100)
  }

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
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
    console.log("Rendering task:", task)
    if (!task || typeof task !== 'object' || !task._id) {
      console.error("Invalid task object in renderTask:", task)
      return null
    }
    console.log("Rendering task ID:", task._id)
    const progress = calculateProgress(task)
    const isExpanded = expandedTasks[task._id]
    const isSelected = selectedTaskId === task._id

    return (
      <div
        className={cn(
          "rounded-lg border p-3 transition-all",
          isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          isExpanded ? "shadow-md" : "shadow-sm"
        )}
      >
        <div 
          className="flex items-start justify-between cursor-pointer"
          onClick={() => onTaskSelect(task._id)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                progress === 100 ? "bg-success" : "bg-primary"
              )} />
              <p className="font-medium truncate">{task.originalText}</p>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    progress === 100 
                      ? "bg-success" 
                      : progress > 50
                        ? "bg-primary" 
                        : progress > 0
                          ? "bg-primary/70"
                          : "bg-muted"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-medium",
                  progress === 100 
                    ? "bg-success/10 text-success border-success/20" 
                    : "bg-primary/10 text-primary border-primary/20"
                )}
              >
                {progress}%
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatRelativeTime(task.createdAt)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <ListTodo className="h-3 w-3" />
                <span>{task.microTasks.length} steps</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                <span>{task.microTasks.filter(mt => mt.done).length} completed</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-7 w-7 rounded-full",
                isExpanded ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
              )}
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
          </div>
        </div>
        
        <AnimatePresence initial={false} mode="sync">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, type: "tween" }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t border-dashed">
                <ul className="space-y-2">
                  {task.microTasks.map((microTask, index) => (
                    <li 
                      key={microTask.id ? microTask.id : `${task._id}-micro-${index}`} 
                      className="flex items-center gap-2 text-sm justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {microTask.done ? (
                          <div className="bg-success/10 p-0.5 rounded">
                            <CheckSquare className="h-4 w-4 text-success flex-shrink-0" />
                          </div>
                        ) : (
                          <div className="bg-muted/50 p-0.5 rounded">
                            <Square className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        )}
                        <span className={cn(
                          "transition-all",
                          microTask.done ? "line-through text-muted-foreground" : ""
                        )}>
                          {microTask.text}
                        </span>
                      </div>
                      {microTask.done && onMicroTaskToggle && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onMicroTaskToggle(task._id, microTask.id, false);
                          }} 
                          className="h-6 px-2 py-0 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5"
                        >
                          Undo
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 sticky top-0 bg-card z-10 border-b">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            Your Tasks
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10">
              {tasks.length} Total
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="todo" className="w-full">
          <TabsList className="grid grid-cols-2 mx-4 mt-2 mb-2">
            <TabsTrigger value="todo" className="flex items-center gap-1.5">
              <Circle className="h-4 w-4" />
              To Do
              <Badge variant="outline" className="ml-1 text-xs">
                {todoTasks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" />
              Completed
              <Badge variant="outline" className="ml-1 text-xs">
                {completedTasks.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          {/* Filter and Sort Controls */}
          <div className="flex flex-col gap-2 px-4 pb-2 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter tasks..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as "newest" | "oldest" | "progress")}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="progress">By progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            <TabsContent value="todo" className="mt-0 px-4 py-2">
              {sortedTodoTasks && sortedTodoTasks.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {sortedTodoTasks.map((task) => (
                      task && task._id ? (
                        <motion.div 
                          key={task._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {renderTask(task)}
                        </motion.div>
                      ) : null
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {filterText ? "No matching tasks found" : "No tasks to do"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filterText ? "Try a different search term" : "Add a new task to get started"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0 px-4 py-2">
              {sortedCompletedTasks && sortedCompletedTasks.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {sortedCompletedTasks.map((task) => (
                      task && task._id ? (
                        <motion.div 
                          key={task._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {renderTask(task)}
                        </motion.div>
                      ) : null
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {filterText ? "No matching completed tasks" : "No completed tasks yet"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filterText ? "Try a different search term" : "Complete tasks to see them here"}
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
