"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

const quotes = [
  "Progress, not perfection. Every small step counts.",
  "You don't have to be great to get started, but you have to get started to be great.",
  "The secret of getting ahead is getting started.",
  "A journey of a thousand miles begins with a single step.",
  "Small steps daily lead to big changes yearly.",
  "Focus on progress, not perfection.",
  "Every accomplishment starts with the decision to try.",
  "You are capable of amazing things, one step at a time.",
]

export function MotivationalQuote() {
  const [currentQuote, setCurrentQuote] = useState("")

  useEffect(() => {
    // Set a random quote on component mount
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setCurrentQuote(randomQuote)

    // Rotate quotes every 30 seconds
    const interval = setInterval(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      setCurrentQuote(randomQuote)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
      <CardContent className="py-6">
        <div className="flex items-center gap-3">
          <Quote className="h-6 w-6 text-primary flex-shrink-0" />
          <p className="text-lg font-medium text-center flex-1 italic">{currentQuote}</p>
        </div>
      </CardContent>
    </Card>
  )
}
