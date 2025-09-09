"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, Check, X, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface FormData {
  fullName: string
  email: string
  subject: string
  message: string
}

interface FormErrors {
  fullName?: string
  email?: string
  subject?: string
  message?: string
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case "fullName":
        return value.trim().length < 6 ? "Full name must be at least 6 characters" : undefined
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return !emailRegex.test(value) ? "Please enter a valid email address" : undefined
      case "subject":
        return value.trim().length < 5 ? "Subject must be at least 5 characters" : undefined
      case "message":
        return value.trim().length < 10 ? "Message must be at least 10 characters" : undefined
      default:
        return undefined
    }
  }

  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData({ ...formData, [name]: value })

    // Real-time validation
    const error = validateField(name, value)
    setErrors({ ...errors, [name]: error })
  }

  const isFieldValid = (name: keyof FormData): boolean => {
    return formData[name].trim() !== "" && !errors[name]
  }

  const isFormValid = (): boolean => {
    const requiredFields: (keyof FormData)[] = ["fullName", "email", "subject", "message"]
    return requiredFields.every((field) => isFieldValid(field))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: FormErrors = {}
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof FormData
      const error = validateField(fieldName, formData[fieldName])
      if (error) newErrors[fieldName] = error
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({
          fullName: "",
          email: "",
          subject: "",
          message: "",
        })
      } else {
        // Handle API validation errors
        if (result.error) {
          if (result.error.includes('Full name')) {
            setErrors({ fullName: result.error })
          } else {
            console.error("API Error:", result.error)
          }
        } else {
          throw new Error("Failed to send message")
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setErrors({ message: "Failed to send message. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 glassmorphism border-0 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 glow-effect"
          >
            <Check className="h-8 w-8 text-white" />
          </motion.div>
          <h3 className="text-2xl font-serif font-bold gradient-text mb-4">Message Sent Successfully!</h3>
          <p className="text-muted-foreground mb-6">
            Thank you for reaching out! We'll get back to you as soon as possible.
          </p>
          <Button
            onClick={() => setIsSubmitted(false)}
            className="rounded-full bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:glow-effect transition-all duration-300"
          >
            Send Another Message
          </Button>
        </Card>
      </motion.div>
    )
  }

  return (
    <Card className="p-8 glassmorphism border-0">
      <h2 className="text-2xl font-serif font-bold gradient-text mb-6">Get In Touch</h2>

      <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium mb-2 block">
              Full Name *
            </Label>
            <div className="relative">
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className={`rounded-full pr-10 transition-all duration-300 ${
                  formData.fullName
                    ? isFieldValid("fullName")
                      ? "border-green-500 focus:border-green-500"
                      : "border-red-500 focus:border-red-500"
                    : "border-accent/30 focus:border-accent"
                } focus:glow-effect`}
                placeholder="Enter your full name (min 6 characters)"
                data-testid="contact-name"
              />
              {formData.fullName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isFieldValid("fullName") ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {errors.fullName && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 mt-1"
              >
                {errors.fullName}
              </motion.p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium mb-2 block">
              Email Address *
            </Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`rounded-full pr-10 transition-all duration-300 ${
                  formData.email
                    ? isFieldValid("email")
                      ? "border-green-500 focus:border-green-500"
                      : "border-red-500 focus:border-red-500"
                    : "border-accent/30 focus:border-accent"
                } focus:glow-effect`}
                placeholder="your.email@university.edu"
                data-testid="contact-email"
              />
              {formData.email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isFieldValid("email") ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 mt-1"
              >
                {errors.email}
              </motion.p>
            )}
          </div>
        </div>

        {/* Subject Field */}
        <div>
          <Label htmlFor="subject" className="text-sm font-medium mb-2 block">
            Subject *
          </Label>
          <div className="relative">
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              className={`rounded-full pr-10 transition-all duration-300 ${
                formData.subject
                  ? isFieldValid("subject")
                    ? "border-green-500 focus:border-green-500"
                    : "border-red-500 focus:border-red-500"
                  : "border-accent/30 focus:border-accent"
              } focus:glow-effect`}
              placeholder="What's this about?"
              data-testid="contact-subject"
            />
            {formData.subject && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isFieldValid("subject") ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            )}
          </div>
          {errors.subject && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400 mt-1"
            >
              {errors.subject}
            </motion.p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <Label htmlFor="message" className="text-sm font-medium mb-2 block">
            Message *
          </Label>
          <div className="relative">
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              className={`rounded-2xl min-h-[120px] resize-none transition-all duration-300 ${
                formData.message
                  ? isFieldValid("message")
                    ? "border-green-500 focus:border-green-500"
                    : "border-red-500 focus:border-red-500"
                  : "border-accent/30 focus:border-accent"
              } focus:glow-effect`}
              placeholder="Tell us more about your inquiry..."
              data-testid="contact-message"
            />
            {formData.message && (
              <div className="absolute right-3 top-3">
                {isFieldValid("message") ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            )}
          </div>
          {errors.message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400 mt-1"
            >
              {errors.message}
            </motion.p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className="w-full rounded-full bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:glow-effect transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          size="lg"
          data-testid="contact-submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}
