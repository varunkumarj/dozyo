import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get user
    const user = await db.collection("users").findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get streak data
    const streakData = await db.collection("streaks").findOne({ userId: user._id })
    
    if (!streakData) {
      // Return default values if no streak data exists yet
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        todayCompleted: false,
        lastCompletionDate: null
      })
    }
    
    // Check if the streak data needs to be updated
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastCompletionDate = new Date(streakData.lastCompletionDate)
    lastCompletionDate.setHours(0, 0, 0, 0)
    
    // Check if today is already marked as completed
    const todayCompleted = lastCompletionDate.getTime() === today.getTime()
    
    // If the last completion was more than 1 day ago and not today, reset streak
    if (!todayCompleted) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const wasYesterday = lastCompletionDate.getTime() === yesterday.getTime()
      
      if (!wasYesterday && streakData.currentStreak > 0) {
        // More than 1 day has passed, reset streak
        await db.collection("streaks").updateOne(
          { userId: user._id },
          { $set: { currentStreak: 0, todayCompleted: false } }
        )
        
        // Return updated streak data
        return NextResponse.json({
          currentStreak: 0,
          longestStreak: streakData.longestStreak,
          todayCompleted: false,
          lastCompletionDate: streakData.lastCompletionDate
        })
      }
    }
    
    // Return streak data
    return NextResponse.json({
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      todayCompleted: streakData.todayCompleted || false,
      lastCompletionDate: streakData.lastCompletionDate
    })
  } catch (error) {
    console.error("Get streak error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
