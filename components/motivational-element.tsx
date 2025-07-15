"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Coffee, Sun, Star } from "lucide-react"
import { motion } from "framer-motion"

const motivationalQuotes = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela"
  },
  {
    text: "Small steps, big impact.",
    author: "Dozyo"
  },
  {
    text: "The journey of a thousand miles begins with a single step.",
    author: "Lao Tzu"
  },
  {
    text: "Progress is progress, no matter how small.",
    author: "Unknown"
  },
  {
    text: "Focus on the step in front of you, not the whole staircase.",
    author: "Dozyo"
  },
  {
    text: "Celebrate the small wins. They add up to big victories.",
    author: "Dozyo"
  },
  {
    text: "Tiny consistent efforts create massive results over time.",
    author: "Unknown"
  },
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker"
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar"
  }
]

const timeBasedGreetings = [
  { hours: [5, 6, 7, 8, 9], message: "Good morning! Ready for a productive day?", icon: Sun },
  { hours: [10, 11, 12], message: "Having a good day? Let's keep the momentum going!", icon: Coffee },
  { hours: [13, 14, 15, 16], message: "Afternoon slump? Let's break it down into tiny steps.", icon: Coffee },
  { hours: [17, 18, 19], message: "Evening's here! Finish strong with just one small step.", icon: Star },
  { hours: [20, 21, 22, 23, 0, 1, 2, 3, 4], message: "One small step before you wrap up?", icon: Star }
]

export function MotivationalElement() {
  const [quote, setQuote] = useState(motivationalQuotes[0])
  const [greeting, setGreeting] = useState({ message: "", icon: Sun })
  const [isVisible, setIsVisible] = useState(true)
  const [iconAnimate, setIconAnimate] = useState(false)

  useEffect(() => {
    // Set time-based greeting
    const hour = new Date().getHours()
    const currentGreeting = timeBasedGreetings.find(g => g.hours.includes(hour)) || 
      { message: "Welcome back! Ready to make progress?", icon: Sparkles }
    setGreeting(currentGreeting)
    
    // Randomly select a quote
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    setQuote(randomQuote)
    
    // Animate icon occasionally
    const iconAnimationInterval = setInterval(() => {
      setIconAnimate(true)
      setTimeout(() => setIconAnimate(false), 2000)
    }, 30000) // Every 30 seconds
    
    // Refresh quote every 2 hours
    const quoteInterval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        const newQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
        setQuote(prev => {
          // Ensure we don't get the same quote twice in a row
          if (prev.text === newQuote.text) {
            const nextIndex = (motivationalQuotes.findIndex(q => q.text === prev.text) + 1) % motivationalQuotes.length
            return motivationalQuotes[nextIndex]
          }
          return newQuote
        })
        setIsVisible(true)
      }, 500)
    }, 2 * 60 * 60 * 1000) // Every 2 hours
    
    return () => {
      clearInterval(quoteInterval)
      clearInterval(iconAnimationInterval)
    }
  }, [])

  const GreetingIcon = greeting.icon

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-2 border-primary/20 shadow-md overflow-hidden">
      <CardContent className="p-6 relative">
        {/* Background subtle pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full -ml-8 -mb-8"></div>
        </div>
        
        <div className="flex items-center gap-5 relative z-10">
          <motion.div 
            className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full p-3 shadow-md"
            animate={iconAnimate ? {
              scale: [1, 1.15, 1],
              rotate: [0, 5, -5, 0],
              boxShadow: [
                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              ]
            } : {}}
            transition={{ duration: 1.5 }}
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <GreetingIcon className="h-6 w-6 text-primary" />
          </motion.div>
          
          <div className="flex-1">
            <motion.h3 
              className="font-medium text-xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {greeting.message}
            </motion.h3>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
              transition={{ duration: 0.5 }}
              className="text-sm text-muted-foreground mt-2 font-medium"
            >
              <span className="text-primary/80 pr-1">"“</span>
              {quote.text}
              <span className="text-primary/80 pl-1">”</span>
              <span className="block mt-1 text-xs italic text-right pr-4">— {quote.author}</span>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
