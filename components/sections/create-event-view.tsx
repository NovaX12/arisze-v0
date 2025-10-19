"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Plus, X, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

const eventCategories = [
  "Board Games",
  "Study Group", 
  "Music",
  "Social",
  "Academic",
  "Sports",
  "Art & Culture",
  "Food & Drinks",
  "Networking",
  "Workshop",
  "Other"
]

const universities = [
  "Kaunas University of Technology",
  "Vytautas Magnus University", 
  "Lithuanian University of Health Sciences",
  "Vilnius University",
  "Vilnius Gediminas Technical University",
  "Other"
]

export function CreateEventView() {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    address: "",
    university: "",
    maxAttendees: "",
    contact: "",
    image: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag) && selectedTags.length < 5) {
      setSelectedTags(prev => [...prev, tag])
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔵 [EVENT CREATION] Form submission started')
    console.log('📋 [EVENT CREATION] Current form data:', formData)
    console.log('🏷️ [EVENT CREATION] Selected tags:', selectedTags)
    
    if (!session) {
      console.error('❌ [EVENT CREATION] No session found')
      toast.error("Please log in to create an event")
      return
    }

    console.log('✅ [EVENT CREATION] Session validated:', {
      userId: session.user?.id,
      userEmail: session.user?.email,
      userName: session.user?.name
    })

    // Validate all required fields per API requirements
    if (!formData.title || !formData.description || !formData.date || !formData.time || 
        !formData.venue || !formData.university || !formData.contact || !formData.address) {
      console.error('❌ [EVENT CREATION] Validation failed - missing fields:', {
        title: !!formData.title,
        description: !!formData.description,
        date: !!formData.date,
        time: !!formData.time,
        venue: !!formData.venue,
        university: !!formData.university,
        contact: !!formData.contact,
        address: !!formData.address
      })
      toast.error("Please fill in all required fields (title, description, date, time, venue, university, contact, and address)")
      return
    }

    console.log('✅ [EVENT CREATION] All required fields validated')

    setIsSubmitting(true)

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        cafe: formData.venue, // API expects 'cafe' field, not 'venue'
        venue: formData.venue, // Also send 'venue' for compatibility
        university: formData.university,
        contact: formData.contact,
        address: formData.address,
        image: formData.image || '/default-event-image.jpg',
        tags: selectedTags,
        maxAttendees: parseInt(formData.maxAttendees) || 10,
        isPublic: true
      }

      console.log('📦 [EVENT CREATION] Prepared event data:', eventData)
      console.log('📤 [EVENT CREATION] Sending POST request to /api/events')

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      console.log('📥 [EVENT CREATION] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const responseText = await response.text()
      console.log('📄 [EVENT CREATION] Raw response text:', responseText)

      let result
      try {
        result = JSON.parse(responseText)
        console.log('📋 [EVENT CREATION] Parsed response data:', result)
      } catch (parseError) {
        console.error('❌ [EVENT CREATION] Failed to parse response JSON:', parseError)
        console.error('❌ [EVENT CREATION] Response was:', responseText)
        throw new Error('Invalid JSON response from server')
      }

      if (!response.ok) {
        console.error('❌ [EVENT CREATION] Server returned error:', {
          status: response.status,
          error: result.error,
          details: result.details
        })
        throw new Error(result.error || result.details || "Failed to create event")
      }
      
      console.log('✅ [EVENT CREATION] Event created successfully!', result)
      setIsSuccess(true)
      toast.success("Event created successfully!")
      
      // Reset form after success
      setTimeout(() => {
        console.log('🔄 [EVENT CREATION] Resetting form')
        setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          venue: "",
          address: "",
          university: "",
          maxAttendees: "",
          contact: "",
          image: ""
        })
        setSelectedTags([])
        setIsSuccess(false)
      }, 2000)

    } catch (error) {
      console.error('❌ [EVENT CREATION] Error caught:', error)
      console.error('❌ [EVENT CREATION] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
        error: error
      })
      toast.error(error instanceof Error ? error.message : "Failed to create event")
    } finally {
      setIsSubmitting(false)
      console.log('🏁 [EVENT CREATION] Form submission completed')
    }
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center glassmorphism border-0">
          <h2 className="text-2xl font-bold mb-4">Create Your Event</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to create and manage events for the university community.
          </p>
          <Button 
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-all duration-300"
          >
            Log In to Continue
          </Button>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="p-8 text-center glassmorphism border-0">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Event Created Successfully!</h2>
          <p className="text-muted-foreground mb-6">
            Your event has been created and is now available for booking. You can manage it from your dashboard.
          </p>
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-all duration-300"
          >
            View in Dashboard
          </Button>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glassmorphism border-0 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold gradient-text mb-2">Create Your Event</h2>
            <p className="text-muted-foreground">
              Bring the university community together with your amazing event
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Event Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter event title"
                className="glassmorphism border-0"
                required
              />
            </div>

            {/* Event Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your event..."
                className="glassmorphism border-0 min-h-[100px]"
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="glassmorphism border-0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time *
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className="glassmorphism border-0"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Venue *
              </Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => handleInputChange("venue", e.target.value)}
                  placeholder="Cafe or venue name"
                  className="glassmorphism border-0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Address *
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Full address"
                  className="glassmorphism border-0"
                  required
                />
              </div>
            </div>

            {/* University and Max Attendees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university" className="text-sm font-medium">
                  University *
                </Label>
                <Select value={formData.university} onValueChange={(value) => handleInputChange("university", value)} required>
                  <SelectTrigger className="glassmorphism border-0">
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni} value={uni}>
                        {uni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAttendees" className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Max Participants
                </Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxAttendees}
                  onChange={(e) => handleInputChange("maxAttendees", e.target.value)}
                  placeholder="10"
                  className="glassmorphism border-0"
                />
              </div>
            </div>

            {/* Contact and Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-sm font-medium">
                  Contact Info *
                </Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => handleInputChange("contact", e.target.value)}
                  placeholder="Email or phone"
                  className="glassmorphism border-0"
                  required
                />
              </div>
              <div className="space-y-2">
                <ImageUpload
                  value={formData.image}
                  onChange={(value) => handleInputChange("image", value)}
                  label="Event Thumbnail"
                  placeholder="Upload a beautiful image for your event"
                />
              </div>
            </div>

            {/* Event Categories */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Event Categories</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {eventCategories.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(category)}
                    disabled={selectedTags.includes(category)}
                    className="glassmorphism border-0 hover:bg-primary/20"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {category}
                  </Button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-primary/20 text-primary cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:glow-effect transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Event...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </>
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}