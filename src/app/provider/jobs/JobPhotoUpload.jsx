// // app/provider/jobs/JobPhotoUpload.jsx - FIXED with cookie auth
// 'use client'

// import { useState } from 'react'

// export default function JobPhotoUpload({ bookingId, photoType, onUploadComplete }) {
//   const [uploading, setUploading] = useState(false)
//   const [photos, setPhotos] = useState([])
//   const [error, setError] = useState('')
//   const [previews, setPreviews] = useState([])

//   // No token function needed - cookies are sent automatically

//   const handleFileSelect = (e) => {
//     const files = Array.from(e.target.files)
    
//     // Validate files
//     const validFiles = files.filter(file => {
//       if (!file.type.startsWith('image/')) {
//         setError('Please upload only image files')
//         return false
//       }
//       if (file.size > 10 * 1024 * 1024) {
//         setError('File size exceeds 10MB')
//         return false
//       }
//       return true
//     })

//     setPhotos(validFiles)
    
//     // Create previews
//     const newPreviews = validFiles.map(file => URL.createObjectURL(file))
//     setPreviews(newPreviews)
//     setError('')
//   }

//   const uploadPhotos = async () => {
//     if (photos.length === 0) {
//       setError('Please select photos to upload')
//       return
//     }

//     setUploading(true)
//     setError('')

//     try {
//       const uploadedUrls = []

//       for (const photo of photos) {
//         const formData = new FormData()
//         formData.append('file', photo)

//         // Upload to server
//         const uploadRes = await fetch('/api/upload', {
//           method: 'POST',
//           body: formData
//         })

//         const uploadData = await uploadRes.json()
        
//         if (!uploadData.success) {
//           throw new Error(uploadData.message || 'Upload failed')
//         }

//         uploadedUrls.push(uploadData.url)

//         // Save to database - cookies handle auth
//         const saveRes = await fetch('/api/provider/jobs/photos', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//             // No Authorization header needed
//           },
//           body: JSON.stringify({
//             booking_id: bookingId,
//             photo_url: uploadData.url,
//             photo_type: photoType
//           })
//         })

//         const saveData = await saveRes.json()
        
//         if (!saveData.success) {
//           throw new Error(saveData.message || 'Failed to save photo')
//         }
//       }

//       // Clear previews
//       previews.forEach(preview => URL.revokeObjectURL(preview))
      
//       onUploadComplete?.(uploadedUrls)
//       setPhotos([])
//       setPreviews([])
      
//     } catch (err) {
//       setError(err.message || 'Upload failed')
//     } finally {
//       setUploading(false)
//     }
//   }

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 p-4">
//       <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//         <span>📸</span> {photoType === 'before' ? 'Before Work' : 'After Work'} Photos
//       </h3>

//       {/* Preview Grid */}
//       {previews.length > 0 && (
//         <div className="grid grid-cols-3 gap-2 mb-3">
//           {previews.map((preview, index) => (
//             <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
//               <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
//             </div>
//           ))}
//         </div>
//       )}

//       {/* File Input */}
//       <div className="mb-3">
//         <label className="block">
//           <span className="sr-only">Choose photos</span>
//           <input
//             type="file"
//             accept="image/*"
//             multiple
//             onChange={handleFileSelect}
//             disabled={uploading}
//             className="block w-full text-sm text-gray-500
//               file:mr-4 file:py-2 file:px-4
//               file:rounded-lg file:border-0
//               file:text-sm file:font-semibold
//               file:bg-green-50 file:text-green-700
//               hover:file:bg-green-100
//               disabled:opacity-50"
//           />
//         </label>
//         <p className="text-xs text-gray-400 mt-1">
//           You can upload multiple photos (max 10MB each)
//         </p>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
//           {error}
//         </div>
//       )}

//       {/* Upload Button */}
//       <button
//         onClick={uploadPhotos}
//         disabled={photos.length === 0 || uploading}
//         className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
//       >
//         {uploading ? (
//           <>
//             <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//             Uploading...
//           </>
//         ) : (
//           <>
//             <span>📤</span> Upload {photoType === 'before' ? 'Before' : 'After'} Photos
//           </>
//         )}
//       </button>
//     </div>
//   )
// }
















// app/provider/jobs/JobPhotoUpload.jsx
'use client'

import { useState } from 'react'

export default function JobPhotoUpload({ bookingId, photoType, onUploadComplete, existingCount = 0 }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previews, setPreviews] = useState([])

  const MAX_PHOTOS = 10

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const totalExpected = files.length + existingCount
    if (totalExpected > MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos allowed (you have ${existingCount} uploaded and ${files.length} selected)`)
      e.target.value = ''
      return
    }

    const validFiles = []
    const newErrors = []

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        newErrors.push(`${file.name} is not an image`)
      } else if (file.size > 10 * 1024 * 1024) {
        newErrors.push(`${file.name} exceeds 10MB`)
      } else {
        validFiles.push(file)
      }
    })

    if (newErrors.length > 0) {
      setError(newErrors.join(', '))
    }

    if (validFiles.length > 0) {
      const newPreviews = validFiles.map(file => URL.createObjectURL(file))
      setPreviews(newPreviews)
      setError('')
      
      await uploadFiles(validFiles, newPreviews)
    }

    e.target.value = ''
  }

  const uploadFiles = async (filesToUpload, currentPreviews) => {
    setUploading(true)
    setError('')

    try {
      const uploadedUrls = []

      for (const photo of filesToUpload) {
        const formData = new FormData()
        formData.append('file', photo)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        const uploadData = await uploadRes.json()
        if (!uploadData.success) throw new Error(uploadData.message || 'Upload failed')

        uploadedUrls.push(uploadData.url)

        const saveRes = await fetch('/api/provider/jobs/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: bookingId,
            photo_url: uploadData.url,
            photo_type: photoType
          })
        })
        const saveData = await saveRes.json()
        if (!saveData.success) throw new Error(saveData.message || 'Failed to save photo')
      }

      currentPreviews.forEach(preview => URL.revokeObjectURL(preview))
      onUploadComplete?.(uploadedUrls)
      setPreviews([])

    } catch (err) {
      setError(err.message || 'Upload failed')
      setPreviews([]) // clear previews on error so they try again
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span>📸</span> {photoType === 'before' ? 'Before Work' : 'After Work'} Photos
      </h3>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
              <img src={preview} alt={`Preview ${index + 1}`} className={`w-full h-full object-cover ${uploading ? 'opacity-50' : ''}`} />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mb-3">
        <label className={`flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed rounded-xl cursor-pointer transition 
          ${uploading ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' : 'border-green-300 bg-green-50/30 hover:bg-green-50 hover:border-green-400'}`}>
          <div className="flex flex-col items-center justify-center py-5 text-center px-4">
            <div className="w-10 h-10 mb-3 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
            </div>
            <p className="mb-1 text-sm font-bold text-green-700">Click to upload {photoType} photos</p>
            <p className="text-xs text-gray-500 font-medium">Up to {MAX_PHOTOS} photos total ({Math.max(0, MAX_PHOTOS - existingCount)} remaining)</p>
            <p className="text-[10px] text-gray-400 mt-1">max 10MB each</p>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}