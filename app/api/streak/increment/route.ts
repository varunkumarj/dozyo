import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST() {
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

    // Get current date (reset to start of day for comparison)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Get streak data
    const streakData = await db.collection("streaks").findOne({ userId: user._id })
    
    if (!streakData) {
      // Create new streak record if none exists
      const newStreakData = {
        userId: user._id,
        currentStreak: 1,
        longestStreak: 1,
        todayCompleted: true,
        lastCompletionDate: new Date(),
        streakHistory: [{ date: new Date(), completed: true }]
      }
      
      await db.collection("streaks").insertOne(newStreakData)
      
      return NextResponse.json({
        currentStreak: 1,
        longestStreak: 1,
        todayCompleted: true,
        lastCompletionDate: new Date()
      })
    }
    
    // Check if today is already marked as completed
    const lastCompletionDate = new Date(streakData.lastCompletionDate)
    lastCompletionDate.setHours(0, 0, 0, 0)
    
    if (lastCompletionDate.getTime() === today.getTime()) {
      // Already completed today, no change to streak
      return NextResponse.json({
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        todayCompleted: true,
        lastCompletionDate: streakData.lastCompletionDate
      })
    }
    
    // Calculate new streak value
    let newCurrentStreak = 1 // Default to 1 if streak is broken
    
    // Check if the last completion was yesterday
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (lastCompletionDate.getTime() === yesterday.getTime()) {
      // Continuing the streak
      newCurrentStreak = streakData.currentStreak + 1
    }
    
    // Calculate new longest streak
    const newLongestStreak = Math.max(newCurrentStreak, streakData.longestStreak || 0)
    
    // Update streak data
    const updatedStreakData = {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      todayCompleted: true,
      lastCompletionDate: new Date()
    }
    
    // First update the basic streak data
    await db.collection("streaks").updateOne(
      { userId: user._id },
      { $set: updatedStreakData }
    )
    
    // Then update the streak history separately
    await db.collection("streaks").updateOne(
      { userId: user._id },
      { $push: { streakHistory: { date: new Date(), completed: true } } as any }
    )
    
    return NextResponse.json(updatedStreakData)
  } catch (error) {
    console.error("Increment streak error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
