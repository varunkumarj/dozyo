// Notification utility functions for Dozyo
// Handles web push notifications and user preferences

export interface NotificationPreferences {
  enabled: boolean
  nudgeStartHour: number // 0-23 format
  nudgeEndHour: number // 0-23 format
  weekendsEnabled: boolean
}

// Default notification preferences
export const defaultNotificationPreferences: NotificationPreferences = {
  enabled: true,
  nudgeStartHour: 9, // 9 AM
  nudgeEndHour: 18, // 6 PM
  weekendsEnabled: false
}

// Check if browser supports notifications
export function browserSupportsNotifications(): boolean {
  return 'Notification' in window
}

// Request notification permissions
export async function requestNotificationPermission(): Promise<boolean> {
  if (!browserSupportsNotifications()) {
    return false
  }
  
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Check if notifications are currently allowed
export function notificationsAllowed(): boolean {
  if (!browserSupportsNotifications()) {
    return false
  }
  
  return Notification.permission === 'granted'
}

// Check if current time is within nudge hours
export function isWithinNudgeHours(prefs: NotificationPreferences): boolean {
  const now = new Date()
  const currentHour = now.getHours()
  const isWeekend = now.getDay() === 0 || now.getDay() === 6 // 0 is Sunday, 6 is Saturday
  
  // Don't send on weekends if weekends are disabled
  if (isWeekend && !prefs.weekendsEnabled) {
    return false
  }
  
  return currentHour >= prefs.nudgeStartHour && currentHour <= prefs.nudgeEndHour
}

// Send a notification if allowed and within nudge hours
export function sendNotification(
  title: string, 
  body: string, 
  icon: string = '/logo.png',
  prefs: NotificationPreferences = defaultNotificationPreferences
): boolean {
  // Check if notifications are enabled in user preferences
  if (!prefs.enabled) {
    return false
  }
  
  // Check if notifications are allowed by browser and within nudge hours
  if (!notificationsAllowed() || !isWithinNudgeHours(prefs)) {
    return false
  }
  
  try {
    const notification = new Notification(title, {
      body,
      icon,
      badge: '/badge.png',
      tag: 'dozyo-nudge',
      requireInteraction: false
    })
    
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
    
    return true
  } catch (error) {
    console.error('Failed to send notification:', error)
    return false
  }
}

// Generate a motivational micro-prompt
export function generateMotivationalPrompt(taskTitle?: string): string {
  const genericPrompts = [
    "Ready for a tiny win today?",
    "One small step can change your day.",
    "What's the smallest step you can take right now?",
    "Progress happens one micro-task at a time.",
    "Even 2 minutes of focus can build momentum.",
    "Small actions lead to big results.",
    "What's one tiny thing you can complete today?",
    "Remember: progress over perfection.",
    "You don't need motivation, just start small.",
    "One micro-task can break the procrastination cycle."
  ]
  
  const taskSpecificPrompts = [
    `Ready to make progress on "${taskTitle}"?`,
    `What's the smallest step you can take on "${taskTitle}"?`,
    `"${taskTitle}" is waiting for just 2 minutes of your focus.`,
    `Break "${taskTitle}" into a tiny first step.`,
    `One micro-step on "${taskTitle}" can build momentum.`
  ]
  
  if (taskTitle) {
    // 70% chance of task-specific prompt, 30% chance of generic prompt
    return Math.random() < 0.7
      ? taskSpecificPrompts[Math.floor(Math.random() * taskSpecificPrompts.length)]
      : genericPrompts[Math.floor(Math.random() * genericPrompts.length)]
  }
  
  return genericPrompts[Math.floor(Math.random() * genericPrompts.length)]
}
