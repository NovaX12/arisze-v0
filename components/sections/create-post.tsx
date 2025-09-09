"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ImageIcon, Smile, Send } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// TODO: Connect to user data from MongoDB API
const currentUser = {
  name: "Alex Petrov",
  avatar: "/placeholder.svg?height=40&width=40",
}

export function CreatePostComponent() {
  const [postContent, setPostContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  const handlePost = async () => {
    if (!postContent.trim()) return

    setIsPosting(true)
    // TODO: Connect to API to create post
    console.log("Creating post:", postContent)

    // Simulate API call
    setTimeout(() => {
      setPostContent("")
      setIsPosting(false)
    }, 1000)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="p-6 glassmorphism border-0">
        <div className="flex gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
            <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white font-semibold">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="Share what's on your mind..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[100px] rounded-2xl border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300 resize-none"
            />

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full hover:bg-accent/10 hover:text-accent transition-all duration-300"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Photo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full hover:bg-accent/10 hover:text-accent transition-all duration-300"
                >
                  <Smile className="h-4 w-4 mr-2" />
                  Emoji
                </Button>
              </div>

              <Button
                onClick={handlePost}
                disabled={!postContent.trim() || isPosting}
                className="rounded-full bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:glow-effect transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPosting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Send className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
