"use client"

import { motion } from "framer-motion"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { CreatePostComponent } from "@/components/sections/create-post"
import { CommunityFeed } from "@/components/sections/community-feed"

export default function CommunityPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen"
    >
      <Header />
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold gradient-text mb-4">Community</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with fellow students, share your experiences, and discover what's happening around campus
            </p>
          </motion.div>

          <div className="space-y-8">
            <CreatePostComponent />
            <CommunityFeed />
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  )
}
