'use client'

import { useState, useEffect } from 'react'

export default function TimeTracker({
  bookingId,
  onStart,
  onComplete,
  standardDuration = 60,
  overtimeRate = 0,
  hasBeforePhotos = false,
  hasAfterPhotos = false
}) {
  const [timerStatus, setTimerStatus] = useState('not_started')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  // Completion form
  const [workSummary, setWorkSummary] = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [formError, setFormError] = useState('')

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

  useEffect(() => {
    if (hasAfterPhotos && error.includes('after')) setError('')
  }, [hasAfterPhotos])

  useEffect(() => {
    if (hasBeforePhotos && error.includes('before')) setError('')
  }, [hasBeforePhotos])

  const loadTimerStatus = async () => {
    try {
      const res = await fetch(`/api/provider/jobs/time-tracking?booking_id=${bookingId}`)
      const data = await res.json()
      if (data.success) {
        const status = data.data.job_timer_status || 'not_started'
        setTimerStatus(status)
        if (data.data.start_time && status === 'running') {
          setStartTime(data.data.start_time)
          const elapsed = Math.floor((Date.now() - new Date(data.data.start_time).getTime()) / 1000)
          setElapsedTime(elapsed)
        }
      }
    } catch (err) {
      console.error('Failed to load timer status:', err)
    }
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0 && m > 0) return `${h}h ${m}m`
    if (h > 0) return `${h}h`
    return `${m} min`
  }

  const elapsedMinutes = Math.floor(elapsedTime / 60)
  const overtimeMinutes = Math.max(0, elapsedMinutes - standardDuration)
  const overtimeEarnings = (overtimeMinutes / 60) * overtimeRate
  const isOvertime = elapsedMinutes > standardDuration

  const handleAction = async (action) => {
    if (action === 'start' && !hasBeforePhotos) {
      setError('Please upload before photos first')
      return
    }
    if (action === 'stop') {
      if (!hasAfterPhotos) {
        setError('Please upload after photos before completing the job')
        return
      }
      setShowConfirm(true)
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/provider/jobs/time-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, action })
      })
      const data = await res.json()

      if (data.success) {
        if (action === 'start') {
          setTimerStatus('running')
          setStartTime(new Date().toISOString())
          setElapsedTime(0)
          onStart?.()
        } else if (action === 'pause') {
          setTimerStatus('paused')
        } else if (action === 'resume') {
          setTimerStatus('running')
          const adjustedStart = new Date(Date.now() - elapsedTime * 1000).toISOString()
          setStartTime(adjustedStart)
        }
      } else {
        setError(data.message || 'Action failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteSubmit = async () => {
    if (!workSummary.trim()) {
      setFormError('Work Summary is required')
      return
    }
    setFormError('')
    setLoading(true)

    try {
      const res = await fetch('/api/provider/jobs/time-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          action: 'stop',
          work_summary: workSummary.trim(),
          recommendations: recommendations.trim()
        })
      })
      const data = await res.json()

      if (data.success) {
        setTimerStatus('completed')
        setShowConfirm(false)
        onComplete?.(data.data)
      } else {
        setFormError(data.message || 'Failed to complete job')
      }
    } catch {
      setFormError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Completion Form ──────────────────────────────────────────────────────────
  if (showConfirm) {
    return (
      <div className="space-y-4">
        {/* Timer summary strip */}
        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between border border-gray-200">
          <div>
            <p className="text-xs text-gray-400">Time Elapsed</p>
            <p className="text-xl font-bold text-gray-900 font-mono">{formatTime(elapsedTime)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Standard</p>
            <p className="text-sm font-semibold text-gray-700">{formatDuration(standardDuration)}</p>
          </div>
          {isOvertime && overtimeRate > 0 && (
            <div className="text-right">
              <p className="text-xs text-purple-500">Overtime</p>
              <p className="text-sm font-semibold text-purple-600">+{formatDuration(overtimeMinutes)}</p>
            </div>
          )}
        </div>

        {/* Work Summary */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Work Summary <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">Describe exactly what was done</p>
          <textarea
            value={workSummary}
            onChange={(e) => { setWorkSummary(e.target.value); setFormError('') }}
            placeholder="e.g. Replaced the kitchen faucet and fixed a small leak under the sink..."
            rows={4}
            maxLength={1000}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-300"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-300">Required</span>
            <span className="text-xs text-gray-400">{workSummary.length}/1000</span>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Recommendations <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">Future work the customer should consider</p>
          <textarea
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            placeholder="e.g. The main pipe is old and might need replacing in 6 months..."
            rows={3}
            maxLength={500}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-300"
          />
          <div className="text-right mt-1">
            <span className="text-xs text-gray-400">{recommendations.length}/500</span>
          </div>
        </div>

        {formError && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2">
            {formError}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => { setShowConfirm(false); setFormError('') }}
            disabled={loading}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCompleteSubmit}
            disabled={loading || !workSummary.trim()}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              '✓ Submit Job'
            )}
          </button>
        </div>
      </div>
    )
  }

  // ── Timer UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {timerStatus !== 'not_started' && (
        <div className={`rounded-2xl p-4 text-center ${isOvertime ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 border border-gray-200'}`}>
          <div className={`text-4xl font-bold font-mono tracking-tight mb-1 ${isOvertime ? 'text-purple-700' : 'text-gray-900'}`}>
            {formatTime(elapsedTime)}
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-500">
            <span>Standard: {formatDuration(standardDuration)}</span>
            {isOvertime && overtimeRate > 0 && (
              <span className="text-purple-600 font-semibold">
                +{formatDuration(overtimeMinutes)} overtime (+$${overtimeEarnings.toFixed(2)})
              </span>
            )}
          </div>
          {timerStatus === 'paused' && (
            <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              ⏸ Paused
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {timerStatus === 'not_started' && (
          <button
            onClick={() => handleAction('start')}
            disabled={loading || !hasBeforePhotos}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <>▶ Start Job</>
            }
          </button>
        )}

        {timerStatus === 'running' && (
          <>
            <button
              onClick={() => handleAction('pause')}
              disabled={loading}
              className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>⏸ Pause</>
              }
            </button>
            <button
              onClick={() => handleAction('stop')}
              disabled={loading}
              className="flex-1 py-3 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition disabled:opacity-50"
            >
              ✓ Finish Job
            </button>
          </>
        )}

        {timerStatus === 'paused' && (
          <>
            <button
              onClick={() => handleAction('resume')}
              disabled={loading}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>▶ Resume</>
              }
            </button>
            <button
              onClick={() => handleAction('stop')}
              disabled={loading}
              className="flex-1 py-3 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition disabled:opacity-50"
            >
              ✓ Finish Job
            </button>
          </>
        )}
      </div>

      {timerStatus === 'not_started' && !hasBeforePhotos && (
        <p className="text-xs text-center text-amber-600 bg-amber-50 py-2 px-3 rounded-lg">
          ⚠ Upload before photos above to enable Start - Click on view details
        </p>
      )}
      {(timerStatus === 'running' || timerStatus === 'paused') && !hasAfterPhotos && (
        <p className="text-xs text-center text-amber-600 bg-amber-50 py-2 px-3 rounded-lg">
          📸 Upload after photos below before finishing
        </p>
      )}
    </div>
  )
}