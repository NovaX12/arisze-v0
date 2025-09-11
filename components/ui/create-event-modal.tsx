"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, Clock, MapPin, Users, Loader2, CheckCircle, Plus, Image as ImageIcon } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: () => void
}

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

export function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cafe: "",
    address: "",
    date: "",
    time: "",
    maxAttendees: "",
    contact: "",
    university: "",
    image: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.email) {
      toast.error("Please log in to create events")
      return
    }

    // Validation
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.maxAttendees || !formData.university || !formData.contact || !formData.address) {
      toast.error("Please fill in all required fields")
      return
    }

    if (selectedTags.length === 0) {
      toast.error("Please select at least one category")
      return
    }

    setLoading(true)

    try {
      const eventData = {
        ...formData,
        tags: selectedTags,
        maxAttendees: parseInt(formData.maxAttendees) || 50,
        cafe: formData.cafe || 'User Location'
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      setSuccess(true)
      toast.success("Event created successfully!")
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        cafe: "",
        address: "",
        date: "",
        time: "",
        maxAttendees: "",
        contact: "",
        university: "",
        image: ""
      })
      setSelectedTags([])
      
      // Notify parent component
      onEventCreated?.()
      
      // Close modal after a short delay
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1500)
      
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error("Failed to create event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setSuccess(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute right-0 top-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="pr-12">
            <h2 className="text-2xl font-bold mb-2">Create New Event</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Share your event with the community and connect with like-minded people.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Event Created Successfully!</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Your event is now live and available for others to discover and join.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Board Game Night, Study Session..."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your event, what to expect, and any special requirements..."
                      rows={3}
                      required
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cafe">Venue/Cafe Name *</Label>
                      <Input
                        id="cafe"
                        value={formData.cafe}
                        onChange={(e) => handleInputChange('cafe', e.target.value)}
                        placeholder="e.g., Cozy Corner Cafe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Street address (optional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <Label>Event Categories *</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Select categories that best describe your event
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {eventCategories.map((category) => (
                      <Badge
                        key={category}
                        variant={selectedTags.includes(category) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleTagToggle(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxAttendees">Max Attendees</Label>
                      <Input
                        id="maxAttendees"
                        type="number"
                        value={formData.maxAttendees}
                        onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                        placeholder="50"
                        min="1"
                        max="500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact">Contact Info</Label>
                      <Input
                        id="contact"
                        value={formData.contact}
                        onChange={(e) => handleInputChange('contact', e.target.value)}
                        placeholder="Phone or email (optional)"
                      />
                    </div>
                  </div>
                </div>

                {/* University */}
                <div>
                  <Label htmlFor="university">University</Label>
                  <Select value={formData.university} onValueChange={(value) => handleInputChange('university', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your university (optional)" />
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

                {/* Image URL */}
                <div>
                  <Label htmlFor="image">Event Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="https://example.com/image.jpg (optional)"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Add an image URL to make your event more attractive
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="min-w-[120px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}