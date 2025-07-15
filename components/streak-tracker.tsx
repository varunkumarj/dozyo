"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Trophy, Star, Calendar, Award, Zap, Target, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StreakTrackerProps {
  currentStreak: number
  longestStreak: number
  todayCompleted: boolean
  streakHistory?: Array<{ date: Date; completed: boolean }>
}

export function StreakTracker({ 
  currentStreak = 0, 
  longestStreak = 0, 
  todayCompleted = false,
  streakHistory = []
}: StreakTrackerProps) {
  const [animate, setAnimate] = useState(false)
  const [hoverDay, setHoverDay] = useState<number | null>(null)
  const [showBadges, setShowBadges] = useState(false)
  
  useEffect(() => {
    // Trigger animation when streak changes
    setAnimate(true)
    const timer = setTimeout(() => setAnimate(false), 1000)
    return () => clearTimeout(timer)
  }, [currentStreak])
  
  // Define badges based on achievements
  const badges = [
    {
      id: "first-step",
      name: "First Step",
      icon: <Zap className="h-4 w-4 text-sky-400" />,
      description: "Completed your first micro-task",
      unlocked: currentStreak > 0 || todayCompleted
    },
    {
      id: "three-day",
      name: "3-Day Streak",
      icon: <Flame className="h-4 w-4 text-warning" />,
      description: "Maintained a 3-day streak",
      unlocked: currentStreak >= 3
    },
    {
      id: "week-warrior",
      name: "Week Warrior",
      icon: <Award className="h-4 w-4 text-amber-500" />,
      description: "Maintained a 7-day streak",
      unlocked: currentStreak >= 7
    },
    {
      id: "consistency",
      name: "Consistency King",
      icon: <Trophy className="h-4 w-4 text-amber-600" />,
      description: "Maintained a 14-day streak",
      unlocked: currentStreak >= 14
    },
    {
      id: "master",
      name: "Habit Master",
      icon: <Sparkles className="h-4 w-4 text-purple-500" />,
      description: "Maintained a 30-day streak",
      unlocked: currentStreak >= 30
    }
  ]

  // Generate last 7 days activity
  const generateWeekActivity = () => {
    const today = new Date()
    const days = []
    
    // Use a deterministic pattern for activity instead of random
    // This prevents hydration mismatch between server and client
    const activityPattern = [true, false, true, true, false, true, false]
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(today.getDate() - i)
      
      // Use deterministic activity pattern for past days
      // Today's activity is based on todayCompleted prop
      const isActive = i === 0 ? todayCompleted : activityPattern[i]
      
      days.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isActive
      })
    }
    
    return days
  }
  
  const weekActivity = generateWeekActivity()

  // Count unlocked badges
  const unlockedBadges = badges.filter(badge => badge.unlocked).length
  
  return (
    <Card className="border-2 border-primary/20 shadow-lg task-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2 font-semibold">
            <motion.div
              initial={{ rotate: 0, scale: 1 }}
              animate={animate ? { rotate: 15, scale: 1.2 } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.5, repeat: animate ? 1 : 0, repeatType: "reverse" }}
            >
              <Flame className="h-6 w-6 text-warning" />
            </motion.div>
            Your Streak
          </CardTitle>
          {currentStreak >= 3 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="gap-1.5 border-warning/30 bg-warning/10 text-warning px-3 py-1.5 text-sm font-medium">
                <Trophy className="h-4 w-4" /> {currentStreak} Day Streak
              </Badge>
            </motion.div>
          )}
        </div>
        <CardDescription className="text-base">
          Keep your momentum going with daily progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-6">
          {/* Streak counter */}
          <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-br from-background to-muted/50 border border-primary/10">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Current Streak</div>
              <motion.div 
                className="text-4xl font-bold flex items-center gap-2"
                animate={animate ? { scale: 1.2 } : { scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                {currentStreak}
                <motion.div
                  initial={{ rotate: 0, scale: 1 }}
                  animate={currentStreak > 0 ? { 
                    rotate: animate ? 10 : 0,
                    scale: animate ? 1.2 : 1
                  } : { rotate: 0, scale: 1 }}
                  transition={{ duration: 0.7, repeat: animate ? 1 : 0, repeatType: "reverse" }}
                >
                  <Flame className={`h-7 w-7 ${currentStreak > 0 ? 'text-warning' : 'text-muted'}`} />
                </motion.div>
              </motion.div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Longest Streak</div>
              <div className="text-4xl font-bold flex items-center gap-2">
                {longestStreak}
                <Trophy className={`h-7 w-7 ${longestStreak > 0 ? 'text-amber-500' : 'text-muted'}`} />
              </div>
            </div>
          </div>
          
          {/* Badges section */}
          <div className="rounded-xl p-4 border border-primary/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Award className="h-4 w-4 text-primary" />
                <span>Your Badges</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {unlockedBadges}/{badges.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              <TooltipProvider delayDuration={200}>
                {badges.map((badge) => (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                      <motion.div 
                        className={`flex flex-col items-center justify-center p-2 rounded-lg ${badge.unlocked ? 'bg-primary/10' : 'bg-muted/50 opacity-40'}`}
                        whileHover={badge.unlocked ? { y: -2, scale: 1.05 } : {}}
                        animate={badge.unlocked && animate ? { scale: 1.2 } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${badge.unlocked ? 'bg-background' : 'bg-muted'} mb-1`}>
                          {badge.icon}
                        </div>
                        <span className="text-xs font-medium truncate w-full text-center">{badge.name}</span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-sm font-medium">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                      {!badge.unlocked && <p className="text-xs mt-1 text-primary">Keep going to unlock!</p>}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
          
          {/* Week activity */}
          <div className="rounded-xl p-4 border border-primary/10">
            <div className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>This Week's Activity</span>
            </div>
            <div className="flex justify-between">
              {weekActivity.map((day, index) => (
                <motion.div 
                  key={index} 
                  className="flex flex-col items-center"
                  onMouseEnter={() => setHoverDay(index)}
                  onMouseLeave={() => setHoverDay(null)}
                  whileHover={{ y: -2 }}
                >
                  <div className="text-xs font-medium">{day.dayName}</div>
                  <motion.div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center mt-1.5 transition-colors ${
                      day.isActive 
                        ? index === 6 ? 'bg-warning text-white' : 'bg-primary/80 text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    animate={hoverDay === index ? { y: -2 } : { y: 0 }}
                    transition={{ duration: 0.5, repeat: hoverDay === index ? Infinity : 0 }}
                  >
                    {day.isActive ? (
                      <Star className="h-5 w-5" />
                    ) : (
                      <div className="h-4 w-4 opacity-60">
                        <Calendar className="h-4 w-4" />
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Motivational message */}
          <motion.div 
            className="text-sm text-center py-2 px-4 rounded-lg bg-muted/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {!todayCompleted ? (
              <p className="font-medium">Complete at least one micro-task today to keep your streak alive! 🔥</p>
            ) : currentStreak === 0 ? (
              <p className="font-medium">Great job today! Start your streak by coming back tomorrow. ✨</p>
            ) : (
              <p className="font-medium">Amazing! You've been consistent for {currentStreak} day{currentStreak !== 1 ? 's' : ''}! 🎉</p>
            )}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
