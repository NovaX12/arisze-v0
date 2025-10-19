"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Camera, Edit3, Save, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { getBadgeById } from "@/lib/badges"

export function ProfileSection() {
  const { data: session, status, update } = useSession()
  const { toast } = useToast()
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    year: "",
    major: "",
    bio: "",
    avatar: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(userData)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [showcaseBadges, setShowcaseBadges] = useState<string[]>([])  // User's selected badges for display

  // Update userData when session loads and fetch latest profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/users/profile')
          if (response.ok) {
            const result = await response.json()
            const newUserData = {
              name: result.user.name || "",
              email: result.user.email || "",
              year: result.user.year || "",
              major: result.user.major || "",
              bio: result.user.bio || "",
              avatar: result.user.avatar || session.user.image || "",
            }
            setUserData(newUserData)
            setEditData(newUserData)
            // Set showcase badges (first 3 earned badges or from user's selection)
            setShowcaseBadges(result.user.showcaseBadges || result.user.earnedBadges?.slice(0, 3) || [])
          } else {
            // Fallback to session data if API fails
            const newUserData = {
              name: session.user.name || "",
              email: session.user.email || "",
              year: "",
              major: "",
              bio: "",
              avatar: session.user.image || "",
            }
            setUserData(newUserData)
            setEditData(newUserData)
          }
        } catch (error) {
          console.error('Error fetching profile data:', error)
          // Fallback to session data
          const newUserData = {
            name: session.user.name || "",
            email: session.user.email || "",
            year: "",
            major: "",
            bio: "",
            avatar: session.user.image || "",
          }
          setUserData(newUserData)
          setEditData(newUserData)
        }
      }
    }

    fetchProfileData()
  }, [session])

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="space-y-8">
        <Card className="p-8 glassmorphism border-0">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-muted/20 animate-pulse"></div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-muted/20 rounded animate-pulse"></div>
              <div className="h-4 bg-muted/20 rounded animate-pulse"></div>
              <div className="h-4 bg-muted/20 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Calculate profile completion
  const calculateCompletion = () => {
    const fields = [userData.name, userData.email, userData.year, userData.major, userData.bio]
    const completedFields = fields.filter((field) => field && field.trim() !== "").length
    return Math.round((completedFields / fields.length) * 100)
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editData.name,
          year: editData.year,
          major: editData.major,
          bio: editData.bio,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setUserData(editData)
        setIsEditing(false)
        
        // Update session to reflect name changes in navbar
        if (editData.name !== userData.name) {
          await update({
            ...session,
            user: {
              ...session?.user,
              name: editData.name
            }
          })
        }
        
        // Show success toast
        toast({
          title: "Profile Updated!",
          description: "Your profile information has been saved successfully.",
          variant: "default",
        })
      } else {
        console.error('Failed to update profile:', result.error)
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update profile. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Network Error",
        description: "Unable to update profile. Please check your connection and try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setEditData(userData)
    setIsEditing(false)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF, etc.).",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 5MB. Please choose a smaller image.",
        variant: "destructive",
      })
      return
    }

    setIsUploadingAvatar(true)

    try {
      // Convert file to base64 for simple upload (in production, use cloud storage)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        
        try {
          const response = await fetch('/api/users/avatar-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              avatarUrl: base64String, // In production, this would be the cloud storage URL
            }),
          })

          const result = await response.json()

          if (response.ok) {
            // Update local state
            const newUserData = { ...userData, avatar: base64String }
            setUserData(newUserData)
            setEditData(newUserData)
            
            // Trigger session update to sync header avatar
            await update({
              ...session,
              user: {
                ...session?.user,
                image: base64String,
              }
            })
            
            toast({
              title: "Avatar Updated!",
              description: "Your profile picture has been updated successfully.",
              variant: "default",
            })
          } else {
            console.error('Failed to update avatar:', result.error)
            toast({
              title: "Upload Failed",
              description: result.error || "Failed to update avatar. Please try again.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error('Error uploading avatar:', error)
          toast({
            title: "Upload Error",
            description: "Error uploading avatar. Please try again.",
            variant: "destructive",
          })
        } finally {
          setIsUploadingAvatar(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing file:', error)
      toast({
        title: "Processing Error",
        description: "Error processing file. Please try again.",
        variant: "destructive",
      })
      setIsUploadingAvatar(false)
    }
  }

  const completion = calculateCompletion()

  return (
    <div className="space-y-8" data-testid="user-profile">
      {/* Profile Header */}
      <Card className="p-8 glassmorphism border-0" data-testid="profile-section">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Profile Picture with Progress Ring */}
          <div className="relative flex flex-col items-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Progress Ring - Perfectly centered */}
              <svg 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-90 w-32 h-32" 
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-muted/20"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="url(#progress-gradient)"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - completion / 100)}`}
                  className="transition-all duration-500 glow-effect"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8a3ffc" />
                    <stop offset="100%" stopColor="#ff4d6d" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Avatar - Perfectly centered */}
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary text-white">
                    {userData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                {/* Camera Button with File Input */}
                <div className="absolute -bottom-1 -right-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isUploadingAvatar}
                    id="avatar-upload"
                  />
                  <label 
                    htmlFor="avatar-upload"
                    className={`block p-2 bg-accent rounded-full hover:glow-effect transition-all duration-300 hover:scale-110 cursor-pointer ${
                      isUploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    data-testid="avatar-upload-button"
                  >
                    {isUploadingAvatar ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="h-4 w-4 text-white" />
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Completion Percentage */}
            <div className="text-center mt-4">
              <div className="text-2xl font-bold gradient-text">{completion}%</div>
              <div className="text-sm text-muted-foreground">Profile Complete</div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <h2 className="text-3xl font-serif font-bold gradient-text" data-testid="user-name">{userData.name}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-full hover:glow-effect transition-all duration-300"
                data-testid="edit-profile"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Showcase Badges */}
            {showcaseBadges.length > 0 && (
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                {showcaseBadges.slice(0, 3).map((badgeId) => {
                  const badge = getBadgeById(badgeId)
                  if (!badge) return null
                  
                  return (
                    <div
                      key={badgeId}
                      className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-accent/30"
                      title={badge.description}
                    >
                      <span className="text-sm">{badge.icon}</span>
                      <span className="text-xs font-medium text-accent">{badge.name}</span>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="space-y-2 text-muted-foreground">
              <p>
                {userData.year} • {userData.major}
              </p>
              <p className="text-sm" data-testid="user-email">{userData.email}</p>
            </div>

            <p className="mt-4 text-foreground leading-relaxed">{userData.bio}</p>
          </div>
        </div>
      </Card>

      {/* User Statistics */}
      <Card className="p-6 glassmorphism border-0" data-testid="user-stats">
        <h3 className="text-xl font-serif font-bold gradient-text mb-4">Your Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">0</div>
            <div className="text-sm text-muted-foreground">Events Attended</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">0</div>
            <div className="text-sm text-muted-foreground">Badges Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">0</div>
            <div className="text-sm text-muted-foreground">Connections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{completion}%</div>
            <div className="text-sm text-muted-foreground">Profile Complete</div>
          </div>
        </div>
      </Card>

      {/* Editable Profile Form */}
      {isEditing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="p-8 glassmorphism border-0" data-testid="profile-form">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-serif font-bold gradient-text">Edit Profile</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="rounded-full border border-accent/30 hover:border-accent hover:glow-effect transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="rounded-full bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:glow-effect transition-all duration-300"
                  data-testid="profile-update-button"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="rounded-full border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="rounded-full border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="year">Academic Year</Label>
                  <Input
                    id="year"
                    value={editData.year}
                    onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                    className="rounded-full border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300"
                    data-testid="year-input"
                  />
                </div>

                <div>
                  <Label htmlFor="major">Major</Label>
                  <Input
                    id="major"
                    value={editData.major}
                    onChange={(e) => setEditData({ ...editData, major: e.target.value })}
                    className="rounded-full border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300"
                    data-testid="major-input"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="rounded-2xl border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300 resize-none"
                    rows={3}
                    data-testid="bio-input"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
