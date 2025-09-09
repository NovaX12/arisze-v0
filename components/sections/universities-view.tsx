"use client"

import { motion } from "framer-motion"
import { UniversityCard } from "@/components/ui/university-card"
import { useUniversities } from "@/hooks/use-api"
import { University } from "@/lib/models"

export function UniversitiesView() {
  const { data: universities, loading, error } = useUniversities()

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glassmorphism rounded-2xl p-6 animate-pulse">
            <div className="h-48 bg-muted rounded-lg mb-4"></div>
            <div className="h-6 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded mb-1"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading universities: {error}</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {universities?.map((university: University, index: number) => (
        <motion.div
          key={university._id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <UniversityCard 
            university={{
              id: university._id || '',
              name: university.name,
              thumbnail: university.thumbnail,
              phone: university.phone,
              email: university.email
            }} 
          />
        </motion.div>
      ))}
    </div>
  )
}
