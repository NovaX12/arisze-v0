"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Phone, Loader2, CheckCircle } from "lucide-react"
import Image from "next/image"

interface University {
  id: number
  name: string
  thumbnail: string
  phone: string
  email: string
}

interface UniversityCardProps {
  university: University
}

export function UniversityCard({ university }: UniversityCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      router.push('/login?callbackUrl=/events')
      return
    }

    // Validate form data
    if (!formData.studentName || !formData.studentId || !formData.email) {
      alert('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/universities/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          universityId: university.id.toString(),
          universityName: university.name,
          studentName: formData.studentName,
          studentId: formData.studentId,
          universityEmail: formData.email,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setVerificationSuccess(true)
        console.log('Student verification successful:', result.message)
        
        // Show success for 3 seconds, then reset form
        setTimeout(() => {
          setVerificationSuccess(false)
          setFormData({
            studentName: "",
            studentId: "",
            email: "",
          })
        }, 3000)
      } else {
        console.error('Verification failed:', result.error)
        alert(result.error || 'Failed to verify student status. Please try again.')
      }
    } catch (error) {
      console.error('Error verifying student:', error)
      alert('Error verifying student status. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div whileHover={{ y: -5 }} className="glassmorphism rounded-2xl overflow-hidden group">
      <div className="aspect-video overflow-hidden relative">
        <Image
          src={university.thumbnail || "/placeholder.svg"}
          alt={university.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">{university.name}</h3>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span className="text-sm">{university.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{university.email}</span>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-medium text-white mb-4">Student Verification</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Student Name"
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              className="bg-background/50 border-0 placeholder:text-muted-foreground"
            />
            <Input
              placeholder="Student ID"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="bg-background/50 border-0 placeholder:text-muted-foreground"
            />
            <Input
              type="email"
              placeholder="University Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-background/50 border-0 placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                verificationSuccess 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-gradient-to-r from-primary to-secondary hover:scale-105"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : verificationSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verified Successfully!
                </>
              ) : (
                "Verify Student Status"
              )}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
