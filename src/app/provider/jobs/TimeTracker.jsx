// app/provider/jobs/TimeTracker.jsx - UPDATED

'use client'

import { useState, useEffect } from 'react'

export default function TimeTracker({ bookingId, onComplete, standardDuration = 60, overtimeRate = 0 }) {
  const [timerStatus, setTimerStatus] = useState('not_started')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    loadTimerStatus()
    
    let interval
    if (timerStatus === 'running' && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerStatus, startTime])

  const token = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('providerToken')
    }
    return null
  }

  const loadTimerStatus = async () => {
    try {
      const res = await fetch(`/api/provider/jobs/time-tracking?booking_id=${bookingId}`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      if (data.success) {
        setTimerStatus(data.data.job_timer_status || 'not_started')
        setStartTime(data.data.start_time)
        if (data.data.current_duration) {
          setElapsedTime(data.data.current_duration * 60)
        }
      }
    } catch (error) {
      console.error('Failed to load timer:', error)
    }
  }

  const sendAction = async (action, notes = '') => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/provider/jobs/time-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({ booking_id: bookingId, action, notes })
      })
      const data = await res.json()
      
      if (data.success) {
        if (action === 'start') {
          setTimerStatus('running')
          setStartTime(new Date().toISOString())
        } else if (action === 'pause') {
          setTimerStatus('paused')
        } else if (action === 'resume') {
          setTimerStatus('running')
        } else if (action === 'stop') {
          if (data.data) {
            onComplete?.(data.data)
          }
          setTimerStatus('completed')
        }
        
        await loadTimerStatus()
        setShowConfirm(false)
      } else {
        setError(data.message || `Failed to ${action} timer`)
      }
    } catch (error) {
      setError(`Failed to ${action} timer. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleStopClick = () => {
    setShowConfirm(true)
  }

  const confirmStop = () => {
    sendAction('stop', 'Job completed')
  }

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate potential overtime
  const elapsedMinutes = Math.floor(elapsedTime / 60)
  const overtimeMinutes = Math.max(0, elapsedMinutes - standardDuration)
  const potentialOvertimeEarnings = (overtimeMinutes / 60) * overtimeRate

  if (timerStatus === 'completed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-green-700 font-medium flex items-center gap-2">
          <span>✓</span> Job completed successfully
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span>⏱️</span> Time Tracker
      </h3>
      
      {/* Timer Display */}
      <div className="text-center mb-4">
        <div className="text-4xl font-mono font-bold text-gray-900">
          {formatTime(elapsedTime)}
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <span className="text-gray-500">Standard: {standardDuration} min</span>
          {overtimeRate > 0 && (
            <span className="text-purple-600">OT: ${overtimeRate}/hr</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {timerStatus === 'running' ? '⏺ Timer running' : 
           timerStatus === 'paused' ? '⏸ Timer paused' : 
           '⏹ Not started'}
        </p>
      </div>

      {/* Overtime Preview */}
      {timerStatus === 'running' && overtimeMinutes > 0 && (
        <div className="mb-3 p-2 bg-purple-50 rounded-lg text-xs">
          <p className="text-purple-700">
            ⏰ Overtime: {overtimeMinutes} min (+${potentialOvertimeEarnings.toFixed(2)})
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">Complete this job?</p>
          <div className="flex gap-2">
            <button
              onClick={confirmStop}
              disabled={loading}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700"
            >
              Yes, Complete
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {timerStatus === 'not_started' && (
          <button
            onClick={() => sendAction('start', 'Job started')}
            disabled={loading}
            className="col-span-2 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? 'Starting...' : '▶ Start Job'}
          </button>
        )}

        {timerStatus === 'running' && (
          <>
            <button
              onClick={() => sendAction('pause', 'Job paused')}
              disabled={loading}
              className="py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 transition"
            >
              ⏸ Pause
            </button>
            <button
              onClick={handleStopClick}
              disabled={loading}
              className="py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              ⏹ Complete
            </button>
          </>
        )}

        {timerStatus === 'paused' && (
          <>
            <button
              onClick={() => sendAction('resume', 'Job resumed')}
              disabled={loading}
              className="col-span-2 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
            >
              {loading ? 'Resuming...' : '▶ Resume Job'}
            </button>
          </>
        )}
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-400 mt-3 text-center">
        Track your time accurately to get paid for overtime
      </p>
    </div>
  )
}