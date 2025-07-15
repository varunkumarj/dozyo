import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; microTaskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { done } = await request.json()
    if (typeof done !== "boolean") {
      return NextResponse.json(
        { message: "Done status must be a boolean" },
        { status: 400 }
      )
    }

    const { id, microTaskId } = params
    if (!id || !microTaskId) {
      return NextResponse.json(
        { message: "Task ID and micro-task ID are required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Get user
    const user = await db.collection("users").findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if task exists and belongs to user
    const task = await db.collection("tasks").findOne({
      _id: new ObjectId(id),
      userId: user._id,
    })

    if (!task) {
      return NextResponse.json(
        { message: "Task not found or unauthorized" },
        { status: 404 }
      )
    }

    // Update the specific micro-task
    const result = await db.collection("tasks").updateOne(
      { 
        _id: new ObjectId(id),
        "microTasks.id": microTaskId 
      },
      { 
        $set: { "microTasks.$.done": done } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Micro-task not found" },
        { status: 404 }
      )
    }

    // Check if this completion marks the first task completion of the day
    // and update streak if needed
    if (done) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const userStreak = await db.collection("streaks").findOne({ userId: user._id })
      
      if (userStreak) {
        const lastCompletionDate = new Date(userStreak.lastCompletionDate)
        lastCompletionDate.setHours(0, 0, 0, 0)
        
        const todayCompleted = lastCompletionDate.getTime() === today.getTime()
        
        if (!todayCompleted) {
          // Check if the last completion was yesterday
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          
          const wasYesterday = lastCompletionDate.getTime() === yesterday.getTime()
          
          // Update streak
          await db.collection("streaks").updateOne(
            { userId: user._id },
            { 
              $set: { 
                lastCompletionDate: new Date(),
                todayCompleted: true,
                // If last completion was yesterday, increment streak, otherwise reset to 1
                currentStreak: wasYesterday ? userStreak.currentStreak + 1 : 1,
                // Update longest streak if current is now longer
                longestStreak: wasYesterday && userStreak.currentStreak + 1 > userStreak.longestStreak 
                  ? userStreak.currentStreak + 1 
                  : userStreak.longestStreak
              } 
            }
          )
        }
      } else {
        // Create new streak record
        await db.collection("streaks").insertOne({
          userId: user._id,
          currentStreak: 1,
          longestStreak: 1,
          lastCompletionDate: new Date(),
          todayCompleted: true
        })
      }
    }

    // Get the updated task
    const updatedTask = await db.collection("tasks").findOne({
      _id: new ObjectId(id),
    })

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error("Update micro-task error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
