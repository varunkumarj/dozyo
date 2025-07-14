"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Bell, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Header } from "@/components/header"
import { useToast } from "@/hooks/use-toast"

export default function Settings() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [nudgeStart, setNudgeStart] = useState("15:00")
  const [nudgeEnd, setNudgeEnd] = useState("18:00")
  const { toast } = useToast()

  useEffect(() => {
    // Check if notifications are supported and enabled
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted")
    }
  }, [])

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!("Notification" in window)) {
      toast({
        title: "Not Supported",
        description: "Notifications are not supported in this browser.",
        variant: "destructive",
      })
      return
    }

    if (enabled) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setNotificationsEnabled(true)
        toast({
          title: "Notifications Enabled",
          description: "You'll receive gentle reminders during your preferred hours.",
        })
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        })
      }
    } else {
      setNotificationsEnabled(false)
      toast({
        title: "Notifications Disabled",
        description: "You won't receive any more reminders.",
      })
    }
  }

  const handleSaveNudgeHours = () => {
    // In a real app, you'd save this to the database
    toast({
      title: "Settings Saved",
      description: `Nudge hours updated: ${nudgeStart} - ${nudgeEnd}`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <h1 className="text-3xl font-bold">Settings</h1>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                Appearance
              </CardTitle>
              <CardDescription>Choose your preferred theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your gentle reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive gentle reminders to work on your tasks</p>
                </div>
                <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={handleNotificationToggle} />
              </div>
            </CardContent>
          </Card>

          {/* Nudge Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Preferred Nudge Hours</CardTitle>
              <CardDescription>Set when you'd like to receive gentle reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nudge-start">Start Time</Label>
                  <input
                    id="nudge-start"
                    type="time"
                    value={nudgeStart}
                    onChange={(e) => setNudgeStart(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
                <div>
                  <Label htmlFor="nudge-end">End Time</Label>
                  <input
                    id="nudge-end"
                    type="time"
                    value={nudgeEnd}
                    onChange={(e) => setNudgeEnd(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
              </div>
              <Button onClick={handleSaveNudgeHours} className="w-full">
                Save Nudge Hours
              </Button>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label>Name</Label>
                <p className="text-sm text-muted-foreground">{session?.user?.name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
