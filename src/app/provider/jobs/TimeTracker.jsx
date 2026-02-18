// app/provider/jobs/TimeTracker.jsx - FIXED: no refresh needed

'use client'

import { useState, useEffect } from 'react'

export default function TimeTracker({ 
  bookingId, 
  onComplete, 
  standardDuration = 60, 
  overtimeRate = 0,
  hasBeforePhotos = false,
  hasAfterPhotos = false   // ✅ FIX: accept as prop, NOT internal state
}) {
  const [timerStatus, setTimerStatus] = useState('not_started')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  // ✅ FIX: Removed checkAfterPhotos() entirely — parent owns this state now
  useEffect(() => {
    loadTimerStatus()
  }, [bookingId])

  useEffect(() => {
    let interval
    if (timerStatus === 'running' && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerStatus, startTime])

  // ✅ FIX: When hasAfterPhotos becomes true (parent uploaded), clear the error immediately
  useEffect(() => {
    if (hasAfterPhotos && error.includes('after')) {
      setError('')
    }
  }, [hasAfterPhotos])

  // ✅ FIX: When hasBeforePhotos becomes true, clear that error too
  useEffect(() => {
    if (hasBeforePhotos && error.includes('before')) {
      setError('')
    }
  }, [hasBeforePhotos])

  const token = () => {
    if (typeof window !== 'undefined') return localStorage.getItem('providerToken')
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

    if (action === 'start' && !hasBeforePhotos) {
      setError('Please upload before-work photos before starting the job')
      setLoading(false)
      return
    }

    if (action === 'stop' && !hasAfterPhotos) {
      setError('Please upload after-work photos before completing the job')
      setLoading(false)
      return
    }

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
          setStartTime(new Date().toISOString())
        } else if (action === 'stop') {
          if (data.data) onComplete?.(data.data)
          setTimerStatus('completed')
        }
        await loadTimerStatus()
        setShowConfirm(false)
      } else {
        setError(data.message || `Failed to ${action} timer`)
      }
    } catch {
      setError(`Failed to ${action} timer. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const elapsedMinutes = Math.floor(elapsedTime / 60)
  const overtimeMinutes = Math.max(0, elapsedMinutes - standardDuration)

  if (timerStatus === 'completed') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <p className="text-emerald-700 font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Job completed successfully
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Timer Display */}
      <div className={`rounded-2xl p-5 text-center border ${
        timerStatus === 'running'
          ? 'bg-emerald-50 border-emerald-200'
          : timerStatus === 'paused'
          ? 'bg-amber-50 border-amber-200'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className={`text-5xl font-mono font-bold tracking-tight ${
          timerStatus === 'running' ? 'text-emerald-700'
          : timerStatus === 'paused' ? 'text-amber-600'
          : 'text-slate-400'
        }`}>
          {formatTime(elapsedTime)}
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500">
          <span>Standard: {standardDuration} min</span>
        </div>
        <p className={`text-xs mt-1 font-medium ${
          timerStatus === 'running' ? 'text-emerald-600'
          : timerStatus === 'paused' ? 'text-amber-600'
          : 'text-slate-400'
        }`}>
          {timerStatus === 'running' ? '● Recording time'
          : timerStatus === 'paused' ? '⏸ Paused'
          : 'Not started'}
        </p>
      </div>

      {/* ✅ Photo requirement status — driven purely by props, always live */}
      <div className="space-y-2">
        <StatusRow
          done={hasBeforePhotos}
          doneText="Before photos uploaded"
          pendingText="Before photos required to start"
        />
        <StatusRow
          done={hasAfterPhotos}
          doneText="After photos uploaded"
          pendingText="After photos required to complete"
          isPending={timerStatus !== 'running'}  // only show warning when relevant
        />
      </div>

      Overtime notice — duration only, no earnings shown
      {timerStatus === 'running' && overtimeMinutes > 0 && (
        <div className="px-4 py-2.5 bg-violet-50 border border-violet-200 rounded-xl text-xs text-violet-700 font-medium">
          ⏰ Overtime: {overtimeMinutes} min over standard duration
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {error}
        </div>
      )}

      {/* Confirm complete dialog */}
      {showConfirm && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <p className="text-sm font-semibold text-amber-800">Mark this job as complete?</p>
          {!hasAfterPhotos && (
            <p className="text-xs text-red-600 font-medium">
              Upload after-work photos above first — then come back to complete.
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => sendAction('stop', 'Job completed')}
              disabled={loading || !hasAfterPhotos}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
            >
              {loading ? 'Completing…' : 'Yes, Complete'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        {timerStatus === 'not_started' && (
          <button
            onClick={() => sendAction('start', 'Job started')}
            disabled={loading || !hasBeforePhotos}
            className="col-span-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-40 text-sm"
          >
            {loading ? 'Starting…' : !hasBeforePhotos ? 'Upload Before Photos to Start' : '▶  Start Job'}
          </button>
        )}

        {timerStatus === 'running' && (
          <>
            <button
              onClick={() => sendAction('pause', 'Job paused')}
              disabled={loading}
              className="py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-40 text-sm"
            >
              {loading ? '…' : '⏸  Pause'}
            </button>
            <button
              onClick={() => hasAfterPhotos ? setShowConfirm(true) : setError('Please upload after-work photos before completing the job')}
              disabled={loading}
              className={`py-3.5 rounded-xl font-semibold transition-colors text-sm ${
                hasAfterPhotos
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              ⏹  Complete
            </button>
          </>
        )}

        {timerStatus === 'paused' && (
          <button
            onClick={() => sendAction('resume', 'Job resumed')}
            disabled={loading}
            className="col-span-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-40 text-sm"
          >
            {loading ? 'Resuming…' : '▶  Resume Job'}
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Track your time accurately to get paid for overtime
      </p>
    </div>
  )
}

function StatusRow({ done, doneText, pendingText }) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium ${
      done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'
    }`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
        done ? 'bg-emerald-500' : 'bg-slate-200'
      }`}>
        {done && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        )}
      </div>
      {done ? doneText : pendingText}
    </div>
  )
}