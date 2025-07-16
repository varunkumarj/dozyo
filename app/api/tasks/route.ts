import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Helper function to generate fallback micro-tasks based on task type
function generateFallbackMicroTasks(text: string): string[] {
  const taskLower = text.toLowerCase()
  
  if (taskLower.includes("clean") || taskLower.includes("tidy") || taskLower.includes("organize")) {
    return [
      "Take a deep breath and gather your cleaning supplies",
      "Clear any obvious trash or items that don't belong",
      "Focus on one small section or surface first",
      "Take a short break if needed",
      "Move to the next small area",
      "Celebrate your progress so far"
    ]
  } else if (taskLower.includes("write") || taskLower.includes("essay") || taskLower.includes("report")) {
    return [
      "Open a document and write down the main topic",
      "List 3 key points you want to cover",
      "Write just one paragraph on the first point",
      "Take a short break if needed",
      "Write a paragraph on the second point",
      "Review what you've written so far"
    ]
  } else if (taskLower.includes("study") || taskLower.includes("learn") || taskLower.includes("read")) {
    return [
      "Prepare your study space with minimal distractions",
      "Set a timer for just 5 minutes of focused work",
      "Read or review one small section",
      "Take notes on one key concept",
      "Take a short break if needed",
      "Review what you've learned so far"
    ]
  } else {
    return [
      "Take a deep breath and prepare",
      "Break down the main task",
      "Start with the first small step",
      "Continue with steady progress",
    ]
  }
}

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

    // Generate micro-tasks using OpenAI or fallback to local generation
    let microTaskTexts: string[]
    
    // Check if we have an API key before attempting to call OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log("Attempting to use OpenAI API for task breakdown")
        // Try using OpenAI API first with a timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4.1-nano", // Fallback to a more stable model
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant that breaks down tasks into simple, 4-5 minute micro-steps suitable for someone feeling low-energy. Return only a JSON array of strings, each representing a micro-step.",
              },
              {
                role: "user",
                content: `Break the task "${originalText}" into simple, 4-5 minute steps suitable for someone feeling low-energy.`,
              },
            ],
            temperature: 0.7,
          }),
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("OpenAI API error:", response.status, errorText)
          throw new Error(`OpenAI API error: ${response.status}`)
        }

        const aiResponse = await response.json()
        if (aiResponse?.choices?.[0]?.message?.content) {
          try {
            microTaskTexts = JSON.parse(aiResponse.choices[0].message.content)
            // Validate the response is an array of strings
            if (!Array.isArray(microTaskTexts) || !microTaskTexts.every(item => typeof item === 'string')) {
              throw new Error("Invalid response format")
            }
            console.log("Successfully used OpenAI API for task breakdown")
          } catch (parseError) {
            console.error("Error parsing OpenAI response:", parseError)
            throw new Error("Failed to parse OpenAI response")
          }
        } else {
          throw new Error("Invalid OpenAI response structure")
        }
      } catch (error: any) {
        console.error("Using fallback task breakdown due to API error:", error.message)
        // Use fallback when OpenAI API fails
        microTaskTexts = generateFallbackMicroTasks(originalText)
      }
    } else {
      // No API key available, use fallback directly
      console.log("No OpenAI API key found, using fallback task breakdown")
      microTaskTexts = generateFallbackMicroTasks(originalText)
    }

    // Create micro-tasks from text array
    const microTasks = microTaskTexts.map((text) => ({ id: new ObjectId().toString(), text: text, done: false }))

    // Create task in database
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
