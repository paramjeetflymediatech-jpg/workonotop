// app/provider/jobs/JobPhotoUpload.jsx

'use client'

import { useState } from 'react'

export default function JobPhotoUpload({ bookingId, photoType, onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState([])
  const [error, setError] = useState('')
  const [previews, setPreviews] = useState([])

  const token = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('providerToken')
    }
    return null
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Please upload only image files')
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB')
        return false
      }
      return true
    })

    setPhotos(validFiles)
    
    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    setPreviews(newPreviews)
    setError('')
  }

  const uploadPhotos = async () => {
    if (photos.length === 0) {
      setError('Please select photos to upload')
      return
    }

    setUploading(true)
    setError('')

    try {
      const uploadedUrls = []

      for (const photo of photos) {
        const formData = new FormData()
        formData.append('file', photo)

        // Upload to server
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const uploadData = await uploadRes.json()
        
        if (!uploadData.success) {
          throw new Error(uploadData.message || 'Upload failed')
        }

        uploadedUrls.push(uploadData.url)

        // Save to database
        const saveRes = await fetch('/api/provider/jobs/photos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token()}`
          },
          body: JSON.stringify({
            booking_id: bookingId,
            photo_url: uploadData.url,
            photo_type: photoType
          })
        })

        const saveData = await saveRes.json()
        
        if (!saveData.success) {
          throw new Error(saveData.message || 'Failed to save photo')
        }
      }

      // Clear previews
      previews.forEach(preview => URL.revokeObjectURL(preview))
      
      onUploadComplete?.(uploadedUrls)
      setPhotos([])
      setPreviews([])
      
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span>📸</span> {photoType === 'before' ? 'Before Work' : 'After Work'} Photos
      </h3>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {previews.map((preview, index) => (
            <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* File Input */}
      <div className="mb-3">
        <label className="block">
          <span className="sr-only">Choose photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100
              disabled:opacity-50"
          />
        </label>
        <p className="text-xs text-gray-400 mt-1">
          You can upload multiple photos (max 10MB each)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={uploadPhotos}
        disabled={photos.length === 0 || uploading}
        className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <span>📤</span> Upload {photoType === 'before' ? 'Before' : 'After'} Photos
          </>
        )}
      </button>
    </div>
  )
}