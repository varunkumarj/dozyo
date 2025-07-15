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

    // Find tasks with incomplete micro-tasks
    const tasks = await db.collection("tasks")
      .find({ 
        userId: user._id
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .toArray()
      
    // Filter tasks with incomplete micro-tasks
    const tasksWithIncompleteMicroTasks = tasks.filter(task => 
      task.microTasks && task.microTasks.some((mt: any) => !mt.done)
    )

    if (!tasksWithIncompleteMicroTasks || tasksWithIncompleteMicroTasks.length === 0) {
      return NextResponse.json({ message: "No tasks with incomplete micro-tasks found" }, { status: 404 })
    }

    // Prioritization strategy:
    // 1. First, look for tasks with at least one completed micro-task (showing engagement)
    // 2. If none found, pick the newest task
    // 3. Find the first incomplete micro-task in the selected task

    // Try to find a task with some progress
    let selectedTask = tasksWithIncompleteMicroTasks.find(task => 
      task.microTasks.some((mt: any) => mt.done) && 
      task.microTasks.some((mt: any) => !mt.done)
    )

    // If no task with progress, take the newest task
    if (!selectedTask) {
      selectedTask = tasksWithIncompleteMicroTasks[0]
    }

    // Find the first incomplete micro-task
    const microTaskIndex = selectedTask.microTasks.findIndex((mt: any) => !mt.done)
    const microTask = selectedTask.microTasks[microTaskIndex]
    
    if (microTaskIndex === -1 || !microTask) {
      return NextResponse.json({ message: "No incomplete micro-tasks found" }, { status: 404 })
    }

    // Return the task with the suggested micro-task
    return NextResponse.json({
      task: {
        _id: selectedTask._id,
        originalText: selectedTask.originalText,
        microTask: microTask,
        microTaskIndex
      }
    })
  } catch (error) {
    console.error("Get suggested task error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
