"use client"

import { useState, useEffect } from 'react'
import { 
  browserSupportsNotifications, 
  requestNotificationPermission,
  notificationsAllowed,
  sendNotification,
  type NotificationPreferences,
  defaultNotificationPreferences,
  generateMotivationalPrompt
} from '@/lib/notifications'

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize notification state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = browserSupportsNotifications()
      setIsSupported(supported)
      
      if (supported) {
        setIsPermissionGranted(notificationsAllowed())
      }
      
      // Load user preferences from localStorage
      try {
        const savedPrefs = localStorage.getItem('dozyo-notification-preferences')
        if (savedPrefs) {
          setPreferences(JSON.parse(savedPrefs))
        }
      } catch (error) {
        console.error('Failed to load notification preferences:', error)
      }
      
      setIsLoading(false)
    }
  }, [])

  // Request permission to show notifications
  const requestPermission = async () => {
    const granted = await requestNotificationPermission()
    setIsPermissionGranted(granted)
    return granted
  }

  // Update notification preferences
  const updatePreferences = (newPrefs: Partial<NotificationPreferences>) => {
    const updatedPrefs = { ...preferences, ...newPrefs }
    setPreferences(updatedPrefs)
    
    // Save to localStorage
    try {
      localStorage.setItem('dozyo-notification-preferences', JSON.stringify(updatedPrefs))
    } catch (error) {
      console.error('Failed to save notification preferences:', error)
    }
    
    return updatedPrefs
  }

  // Send a nudge notification
  const sendNudge = (taskTitle?: string) => {
    const prompt = generateMotivationalPrompt(taskTitle)
    return sendNotification('Dozyo Nudge', prompt, '/logo.png', preferences)
  }

  // Schedule a nudge for later (within nudge hours)
  const scheduleNudge = (delayMinutes: number = 30, taskTitle?: string) => {
    if (!isSupported || !isPermissionGranted || !preferences.enabled) {
      return false
    }
    
    const nudgeId = `dozyo-scheduled-nudge-${Date.now()}`
    
    try {
      // Store the scheduled nudge in localStorage
      const scheduledTime = Date.now() + (delayMinutes * 60 * 1000)
      const nudge = {
        id: nudgeId,
        scheduledTime,
        taskTitle
      }
      
      // Get existing scheduled nudges
      const scheduledNudgesJson = localStorage.getItem('dozyo-scheduled-nudges') || '[]'
      const scheduledNudges = JSON.parse(scheduledNudgesJson)
      
      // Add new nudge
      scheduledNudges.push(nudge)
      
      // Save back to localStorage
      localStorage.setItem('dozyo-scheduled-nudges', JSON.stringify(scheduledNudges))
      
      return true
    } catch (error) {
      console.error('Failed to schedule nudge:', error)
      return false
    }
  }

  return {
    isSupported,
    isPermissionGranted,
    isLoading,
    preferences,
    requestPermission,
    updatePreferences,
    sendNudge,
    scheduleNudge
  }
}
