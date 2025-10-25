"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { DashboardSidebar } from "@/components/sections/dashboard-sidebar"
import { ProfileSection } from "@/components/sections/profile-section"
import { BadgesSection } from "@/components/sections/badges-section"
import { MyEventsSection } from "@/components/sections/my-events-section"

type DashboardTab = "profile" | "badges" | "events"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<DashboardTab>("profile")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard")
    }
  }, [status, router])

  // Show loading state while checking authentication
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {status === "loading" ? "Loading your dashboard..." : "Redirecting to login..."}
          </p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection />
      case "badges":
        return <BadgesSection />
      case "events":
        return <MyEventsSection />
      default:
        return <ProfileSection />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen"
    >
      <Header />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold gradient-text mb-4" data-testid="dashboard-title">Dashboard</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Manage your profile, track your achievements, and view your events
            </p>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300"
              data-testid="logout-button"
            >
              Logout
            </button>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-3"
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  )
}
