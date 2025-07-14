import { type NextRequest, NextResponse } from "next/server"
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

    // Get tasks
    const tasks = await db.collection("tasks").find({ userId: user._id }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { originalText } = await request.json()
    if (!originalText) {
      return NextResponse.json({ message: "Task text is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get user
    const user = await db.collection("users").findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Generate micro-tasks using OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that breaks down tasks into simple, 1-2 minute micro-steps suitable for someone feeling low-energy. Return only a JSON array of strings, each representing a micro-step.",
          },
          {
            role: "user",
            content: `Break the task "${originalText}" into simple, 1–2 minute steps suitable for someone feeling low-energy.`,
          },
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error("OpenAI API error")
    }

    const aiResponse = await response.json()
    let microTaskTexts: string[]

    try {
      microTaskTexts = JSON.parse(aiResponse.choices[0].message.content)
    } catch {
      // Fallback if JSON parsing fails
      microTaskTexts = [
        "Take a deep breath and prepare",
        "Break down the main task",
        "Start with the first small step",
        "Continue with steady progress",
      ]
    }

    const microTasks = microTaskTexts.map((text) => ({ text, done: false }))

    // Create task
    const result = await db.collection("tasks").insertOne({
      userId: user._id,
      originalText,
      microTasks,
      createdAt: new Date(),
    })

    const newTask = await db.collection("tasks").findOne({ _id: result.insertedId })

    return NextResponse.json({ task: newTask }, { status: 201 })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
