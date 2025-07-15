"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, Clock, Calendar, Info } from "lucide-react"
import { motion } from "framer-motion"
import { useNotifications } from "@/hooks/use-notifications"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function NotificationSettings() {
  const { 
    isSupported, 
    isPermissionGranted, 
    isLoading,
    preferences, 
    requestPermission,
    updatePreferences,
    sendNudge
  } = useNotifications()
  
  const [startHour, setStartHour] = useState(preferences.nudgeStartHour)
  const [endHour, setEndHour] = useState(preferences.nudgeEndHour)
  const [weekendsEnabled, setWeekendsEnabled] = useState(preferences.weekendsEnabled)
  const [notificationsEnabled, setNotificationsEnabled] = useState(preferences.enabled)
  
  // Update local state when preferences are loaded
  useEffect(() => {
    if (!isLoading) {
      setStartHour(preferences.nudgeStartHour)
      setEndHour(preferences.nudgeEndHour)
      setWeekendsEnabled(preferences.weekendsEnabled)
      setNotificationsEnabled(preferences.enabled)
    }
  }, [isLoading, preferences])
  
  // Format hour for display (convert 24h to 12h format)
  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM"
    if (hour === 12) return "12 PM"
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
  }
  
  // Handle notification toggle
  const handleNotificationToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled)
    
    if (enabled && !isPermissionGranted) {
      const granted = await requestPermission()
      if (!granted) {
        setNotificationsEnabled(false)
        return
      }
    }
    
    updatePreferences({ enabled })
  }
  
  // Handle weekend toggle
  const handleWeekendToggle = (enabled: boolean) => {
    setWeekendsEnabled(enabled)
    updatePreferences({ weekendsEnabled: enabled })
  }
  
  // Handle time range change
  const handleTimeRangeChange = () => {
    // Ensure start hour is before end hour
    if (startHour >= endHour) {
      const newEndHour = Math.min(startHour + 1, 23)
      setEndHour(newEndHour)
      updatePreferences({ 
        nudgeStartHour: startHour, 
        nudgeEndHour: newEndHour 
      })
    } else {
      updatePreferences({ 
        nudgeStartHour: startHour, 
        nudgeEndHour: endHour 
      })
    }
  }
  
  // Test notification
  const handleTestNotification = () => {
    sendNudge()
  }
  
  if (isLoading) {
    return (
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Smart Nudges
          </CardTitle>
          <CardDescription>Loading notification settings...</CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          {notificationsEnabled ? (
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <Bell className="h-5 w-5 text-primary" />
            </motion.div>
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          Smart Nudges
        </CardTitle>
        <CardDescription>
          Get gentle reminders to help you stay on track
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isSupported ? (
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-sm font-medium">
              Your browser doesn't support notifications.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try using a modern browser like Chrome, Firefox, or Edge.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="font-medium">Enable nudges</span>
              </div>
              <Switch 
                checked={notificationsEnabled} 
                onCheckedChange={handleNotificationToggle}
                disabled={!isSupported}
              />
            </div>
            
            <div className={notificationsEnabled ? "opacity-100" : "opacity-50 pointer-events-none"}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">Nudge hours</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatHour(startHour)} - {formatHour(endHour)}
                    </span>
                  </div>
                  
                  <div className="pt-4 px-1">
                    <div className="flex justify-between mb-2 text-xs text-muted-foreground">
                      <span>12 AM</span>
                      <span>6 AM</span>
                      <span>12 PM</span>
                      <span>6 PM</span>
                      <span>12 AM</span>
                    </div>
                    <div className="relative">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted rounded-full -translate-y-1/2" />
                      <div 
                        className="absolute top-1/2 h-1 bg-primary rounded-full -translate-y-1/2"
                        style={{
                          left: `${(startHour / 24) * 100}%`,
                          right: `${100 - (endHour / 24) * 100}%`
                        }}
                      />
                      <div className="relative">
                        <Slider
                          value={[startHour]}
                          min={0}
                          max={23}
                          step={1}
                          onValueChange={(value) => setStartHour(value[0])}
                          onValueCommit={handleTimeRangeChange}
                          className="mb-4"
                        />
                        <Slider
                          value={[endHour]}
                          min={0}
                          max={23}
                          step={1}
                          onValueChange={(value) => setEndHour(value[0])}
                          onValueCommit={handleTimeRangeChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">Include weekends</span>
                  </div>
                  <Switch 
                    checked={weekendsEnabled} 
                    onCheckedChange={handleWeekendToggle}
                    disabled={!notificationsEnabled}
                  />
                </div>
                
                <div className="pt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={handleTestNotification}
                          disabled={!notificationsEnabled || !isPermissionGranted}
                        >
                          <Bell className="h-4 w-4 mr-2" />
                          Test notification
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Send a test nudge notification</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            
            {notificationsEnabled && !isPermissionGranted && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-warning/10 border border-warning/20 mt-2"
              >
                <div className="flex gap-2 text-sm">
                  <Info className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-warning">Permission required</p>
                    <p className="text-xs mt-1">Please allow notifications when prompted by your browser.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
