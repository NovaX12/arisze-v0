"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  label?: string
  placeholder?: string
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  label = "Event Image",
  placeholder = "Upload an image for your event"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string>(value || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    setIsUploading(true)

    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append('file', file)

      // Upload to your API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      const imageUrl = data.url

      setPreview(imageUrl)
      onChange(imageUrl)
      toast.success("Image uploaded successfully!")
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview("")
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      
      <div className="relative">
        {preview ? (
          <div className="relative group">
            <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-accent/20">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                  className="rounded-full"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className={`
              w-full h-48 rounded-2xl border-2 border-dashed border-accent/30 
              flex flex-col items-center justify-center gap-3 
              transition-all duration-300 cursor-pointer
              ${!disabled ? 'hover:border-accent hover:bg-accent/5' : 'opacity-50 cursor-not-allowed'}
              ${isUploading ? 'animate-pulse' : ''}
            `}
          >
            <div className="p-3 rounded-full bg-accent/10">
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              ) : (
                <ImageIcon className="h-8 w-8 text-accent" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {isUploading ? "Uploading..." : "Click to upload image"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {placeholder}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />
      </div>

      {!preview && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className="w-full rounded-full border-accent/30 hover:border-accent hover:glow-effect transition-all duration-300"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Uploading..." : "Choose Image"}
        </Button>
      )}
    </div>
  )
}