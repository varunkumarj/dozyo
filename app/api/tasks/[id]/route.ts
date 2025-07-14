import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Get task
    const task = await db.collection("tasks").findOne({
      _id: new ObjectId(params.id),
      userId: user._id,
    })

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Get task error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { microTaskIndex, done } = await request.json()

    const { db } = await connectToDatabase()

    // Get user
    const user = await db.collection("users").findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Update micro-task
    const result = await db.collection("tasks").updateOne(
      {
        _id: new ObjectId(params.id),
        userId: user._id,
      },
      {
        $set: {
          [`microTasks.${microTaskIndex}.done`]: done,
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    // Get updated task
    const updatedTask = await db.collection("tasks").findOne({
      _id: new ObjectId(params.id),
      userId: user._id,
    })

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
