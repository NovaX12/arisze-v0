"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// TODO: Connect to MongoDB API. Using placeholder data for now.
const feedPosts = [
  {
    id: 1,
    author: {
      name: "Emma Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      university: "KTU",
    },
    content:
      "Just had the most amazing board game night at Cozy Corner Cafe! Met so many awesome people and discovered my new favorite game. The atmosphere was perfect for making new friends. Highly recommend checking out their events! 🎲",
    timestamp: "2 hours ago",
    likes: 12,
    comments: 3,
    shares: 1,
    liked: false,
  },
  {
    id: 2,
    author: {
      name: "Marcus Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      university: "VMU",
    },
    content:
      "Study group session at Academic Grounds was incredibly productive today. We tackled some challenging programming concepts and everyone was so supportive. Love how this community brings students together for learning! 📚",
    timestamp: "4 hours ago",
    likes: 8,
    comments: 5,
    shares: 2,
    liked: true,
  },
  {
    id: 3,
    author: {
      name: "Sofia Andersson",
      avatar: "/placeholder.svg?height=40&width=40",
      university: "LSMU",
    },
    content:
      "The acoustic night at Melody Lounge was absolutely magical! Local student artists performed and the talent was incredible. There's something special about live music in an intimate setting. Can't wait for the next one! 🎵",
    timestamp: "6 hours ago",
    likes: 15,
    comments: 7,
    shares: 3,
    liked: false,
  },
  {
    id: 4,
    author: {
      name: "David Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      university: "KTU",
    },
    content:
      "Shoutout to everyone who joined the networking mixer yesterday! Made some great connections and learned about exciting startup opportunities in Kaunas. This community is amazing for professional growth! 🚀",
    timestamp: "1 day ago",
    likes: 20,
    comments: 9,
    shares: 5,
    liked: false,
  },
  {
    id: 5,
    author: {
      name: "Lisa Petrov",
      avatar: "/placeholder.svg?height=40&width=40",
      university: "VMU",
    },
    content:
      "Art workshop at Creative Beans was so inspiring! Learned new techniques and created something I'm actually proud of. The instructor was fantastic and the other participants were so encouraging. Art therapy at its finest! 🎨",
    timestamp: "2 days ago",
    likes: 11,
    comments: 4,
    shares: 2,
    liked: true,
  },
]

export function CommunityFeed() {
  const [posts, setPosts] = useState(feedPosts)
  const [visiblePosts, setVisiblePosts] = useState<number[]>([])

  useEffect(() => {
    // Animate posts in as they become visible
    const timer = setTimeout(() => {
      setVisiblePosts(posts.map((_, index) => index))
    }, 300)

    return () => clearTimeout(timer)
  }, [posts])

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
          }
        }
        return post
      }),
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 30 }}
          animate={visiblePosts.includes(index) ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="p-6 glassmorphism border-0 hover:glow-effect transition-all duration-300">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white font-semibold">
                    {post.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{post.author.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {post.author.university} • {post.timestamp}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/10">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="leading-relaxed">{post.content}</p>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex gap-6">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                    post.liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"
                  }`}
                >
                  <motion.div
                    animate={post.liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`} />
                  </motion.div>
                  <span>{post.likes}</span>
                </motion.button>

                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments}</span>
                </button>

                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
                  <Share className="h-4 w-4" />
                  <span>{post.shares}</span>
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}

      {/* Load More */}
      <div className="text-center pt-8">
        <Button
          variant="ghost"
          className="rounded-full border border-accent/30 hover:border-accent hover:glow-effect transition-all duration-300"
        >
          Load More Posts
        </Button>
      </div>
    </div>
  )
}
