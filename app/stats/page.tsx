"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, CheckCircle, Target, TrendingUp, Clock, Zap, Award, BarChart3 } from "lucide-react"

import { NewHeader } from "@/components/new-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

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

interface StatsData {
  totalTasks: number
  completedTasks: number
  totalMicroTasks: number
  completedMicroTasks: number
  currentStreak: number
  longestStreak: number
  tasksThisWeek: number
  tasksThisMonth: number
  averageTaskCompletion: number
  mostProductiveDay: string
  recentActivity: Array<{
    date: string
    tasksCompleted: number
    microTasksCompleted: number
  }>
}

export default function StatsPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<StatsData>({
    totalTasks: 0,
    completedTasks: 0,
    totalMicroTasks: 0,
    completedMicroTasks: 0,
    currentStreak: 0,
    longestStreak: 0,
    tasksThisWeek: 0,
    tasksThisMonth: 0,
    averageTaskCompletion: 0,
    mostProductiveDay: "N/A",
    recentActivity: []
  })
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/signin")
    }
  }, [status])

  // Fetch stats data
  useEffect(() => {
    if (status === "authenticated") {
      fetchStats()
    }
  }, [status])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const [tasksResponse, streakResponse] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/streak")
      ])

      if (tasksResponse.ok && streakResponse.ok) {
        const tasksData = await tasksResponse.json()
        const streakData = await streakResponse.json()
        
        const tasks: Task[] = Array.isArray(tasksData.tasks) ? tasksData.tasks : []
        
        // Calculate comprehensive stats
        const totalTasks = tasks.length
        const completedTasks = tasks.filter(task => 
          task.microTasks.every(mt => mt.done) && task.microTasks.length > 0
        ).length
        
        const totalMicroTasks = tasks.reduce((sum, task) => sum + task.microTasks.length, 0)
        const completedMicroTasks = tasks.reduce((sum, task) => 
          sum + task.microTasks.filter(mt => mt.done).length, 0
        )

        // Calculate time-based stats
        const now = new Date()
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const tasksThisWeek = tasks.filter(task => 
          new Date(task.createdAt) >= oneWeekAgo
        ).length

        const tasksThisMonth = tasks.filter(task => 
          new Date(task.createdAt) >= oneMonthAgo
        ).length

        // Calculate average completion rate
        const averageTaskCompletion = totalTasks > 0 
          ? Math.round((completedMicroTasks / totalMicroTasks) * 100) 
          : 0

        // Find most productive day (simplified - could be enhanced with more data)
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const tasksByDay = tasks.reduce((acc, task) => {
          const day = dayNames[new Date(task.createdAt).getDay()]
          acc[day] = (acc[day] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const mostProductiveDay = Object.entries(tasksByDay).length > 0
          ? Object.entries(tasksByDay).reduce((a, b) => a[1] > b[1] ? a : b)[0]
          : "N/A"

        // Generate recent activity (last 7 days)
        const recentActivity = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const dayTasks = tasks.filter(task => {
            const taskDate = new Date(task.createdAt)
            return taskDate.toDateString() === date.toDateString()
          })
          
          return {
            date: date.toLocaleDateString(),
            tasksCompleted: dayTasks.filter(task => 
              task.microTasks.every(mt => mt.done) && task.microTasks.length > 0
            ).length,
            microTasksCompleted: dayTasks.reduce((sum, task) => 
              sum + task.microTasks.filter(mt => mt.done).length, 0
            )
          }
        }).reverse()

        setStats({
          totalTasks,
          completedTasks,
          totalMicroTasks,
          completedMicroTasks,
          currentStreak: streakData.currentStreak || 0,
          longestStreak: streakData.longestStreak || 0,
          tasksThisWeek,
          tasksThisMonth,
          averageTaskCompletion,
          mostProductiveDay,
          recentActivity
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0
  const microTaskCompletionRate = stats.totalMicroTasks > 0 ? (stats.completedMicroTasks / stats.totalMicroTasks) * 100 : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NewHeader />
        <main className="w-full px-4 py-6">
          <div className="w-full max-w-screen-xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your stats...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NewHeader />
      
      <main className="w-full px-4 py-6">
        <div className="w-full max-w-screen-xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Progress Stats</h1>
            <p className="text-muted-foreground">Track your productivity journey and celebrate your achievements</p>
          </motion.div>

          {/* Key Metrics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Total Tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedTasks} completed
                </p>
              </CardContent>
            </Card>

            {/* Current Streak */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.currentStreak}</div>
                <p className="text-xs text-muted-foreground">
                  Best: {stats.longestStreak} days
                </p>
              </CardContent>
            </Card>

            {/* This Week */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tasksThisWeek}</div>
                <p className="text-xs text-muted-foreground">
                  tasks created
                </p>
              </CardContent>
            </Card>

            {/* Completion Rate */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
                <p className="text-xs text-muted-foreground">
                  task completion
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Progress Overview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Progress Overview
                  </CardTitle>
                  <CardDescription>Your overall productivity metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Task Completion</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.completedTasks}/{stats.totalTasks}
                      </span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Micro-task Completion</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.completedMicroTasks}/{stats.totalMicroTasks}
                      </span>
                    </div>
                    <Progress value={microTaskCompletionRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.tasksThisMonth}</div>
                      <div className="text-xs text-muted-foreground">This Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.averageTaskCompletion}%</div>
                      <div className="text-xs text-muted-foreground">Avg Completion</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Insights & Achievements
                  </CardTitle>
                  <CardDescription>Your productivity patterns and milestones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">Most Productive Day</div>
                      <div className="text-sm text-muted-foreground">{stats.mostProductiveDay}</div>
                    </div>
                    <Badge variant="secondary">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Peak
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">Longest Streak</div>
                      <div className="text-sm text-muted-foreground">{stats.longestStreak} days</div>
                    </div>
                    <Badge variant="secondary">
                      <Zap className="h-3 w-3 mr-1" />
                      Record
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">Total Micro-tasks</div>
                      <div className="text-sm text-muted-foreground">{stats.totalMicroTasks} steps taken</div>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Steps
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your productivity over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentActivity.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">{day.date}</div>
                        <div className="flex gap-2">
                          {day.tasksCompleted > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {day.tasksCompleted} tasks
                            </Badge>
                          )}
                          {day.microTasksCompleted > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {day.microTasksCompleted} steps
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {day.tasksCompleted > 0 || day.microTasksCompleted > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/20" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
