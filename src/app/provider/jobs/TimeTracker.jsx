'use client'

import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

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
  const [showConfirm, setShowConfirm] = useState(false)
  const [showStartConfirm, setShowStartConfirm] = useState(false)
  const [workerCount, setWorkerCount] = useState(1)
  const [estimatedHours, setEstimatedHours] = useState('1')
  
  // Editable finish values
  const [submittedHours, setSubmittedHours] = useState('')
  const [submittedHeadcount, setSubmittedHeadcount] = useState(1)
  const [adjustmentReason, setAdjustmentReason] = useState('')

  // Photo upload states
  const [beforeUploaded, setBeforeUploaded] = useState(hasBeforePhotos)
  const [afterUploaded, setAfterUploaded] = useState(hasAfterPhotos)

  // Completion form
  const [workSummary, setWorkSummary] = useState('')
  const [recommendations, setRecommendations] = useState('')

  useEffect(() => {
    loadTimerStatus()
  }, [bookingId])

  useEffect(() => {
    setBeforeUploaded(prev => hasBeforePhotos || prev)
  }, [hasBeforePhotos])

  useEffect(() => {
    setAfterUploaded(prev => hasAfterPhotos || prev)
  }, [hasAfterPhotos])

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

  // Removed error clear effects since we use Swal now

  const loadTimerStatus = async () => {
    try {
      const res = await fetch(`/api/provider/jobs/time-tracking?booking_id=${bookingId}&_t=${Date.now()}`)
      const data = await res.json()
      if (data.success) {
        const status = data.data.job_timer_status || 'not_started'
        setTimerStatus(status)
        setBeforeUploaded(Boolean(data.data.has_before_photos || hasBeforePhotos))
        setAfterUploaded(Boolean(data.data.has_after_photos || hasAfterPhotos))

        if (data.data.worker_count) {
          setWorkerCount(data.data.worker_count)
        }

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
    if (action === 'start') {
      if (!showStartConfirm) {
        setShowStartConfirm(true);
        return;
      }
    }

    if (action === 'stop') {
      let isAfterUploaded = afterUploaded;
      if (!isAfterUploaded) {
        try {
          const res = await fetch(`/api/provider/jobs/time-tracking?booking_id=${bookingId}&_t=${Date.now()}`);
          const data = await res.json();
          if (data.success && data.data.has_after_photos) {
            isAfterUploaded = true;
            setAfterUploaded(true);
          }
        } catch (e) {
          console.error('Check photos error:', e);
        }
      }

      if (!isAfterUploaded) {
        Swal.fire({
          icon: 'warning',
          title: 'Action Required',
          text: 'Please upload after photos before completing the job.',
          confirmButtonColor: '#16a34a'
        })
        return;
      }
      setSubmittedHours((elapsedTime / 3600).toFixed(2));
      setSubmittedHeadcount(workerCount === '5+' ? 5 : workerCount);
      setShowConfirm(true);
      return;
    }

    setLoading(true)

      try {
      const payload = { booking_id: bookingId, action }
      if (action === 'start') {
        payload.worker_count = workerCount === '5+' ? 5 : parseInt(workerCount)
        payload.estimated_hours = parseFloat(estimatedHours) || 1
      }

      const res = await fetch('/api/provider/jobs/time-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()

      if (data.success) {
        if (action === 'start') {
          setTimerStatus('running')
          setShowStartConfirm(false)
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
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: data.message || 'Action failed',
          confirmButtonColor: '#16a34a'
        })
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Please try again.',
        confirmButtonColor: '#16a34a'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteSubmit = async () => {
    if (!workSummary.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Field',
        text: 'Work Summary is required',
        confirmButtonColor: '#16a34a'
      })
      return
    }
    
    const originalHours = (elapsedTime / 3600).toFixed(2);
    const originalHeadcount = workerCount === '5+' ? 5 : workerCount;
    const isEdited = parseFloat(submittedHours) !== parseFloat(originalHours) || parseInt(submittedHeadcount) !== parseInt(originalHeadcount);
    
    if (isEdited && !adjustmentReason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Field',
        text: 'Reason for adjustment is required',
        confirmButtonColor: '#16a34a'
      })
      return
    }
    
    setLoading(true)

    try {
      const res = await fetch('/api/provider/jobs/time-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          action: 'stop',
          work_summary: workSummary.trim(),
          recommendations: recommendations.trim(),
          submitted_duration_minutes: Math.round(parseFloat(submittedHours) * 60),
          submitted_headcount: parseInt(submittedHeadcount),
          adjustment_reason: isEdited ? adjustmentReason.trim() : null
        })
      })
      const data = await res.json()

      if (data.success) {
        setTimerStatus('completed')
        setShowConfirm(false)
        onComplete?.(data.data)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: data.message || 'Failed to complete job',
          confirmButtonColor: '#16a34a'
        })
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Please try again.',
        confirmButtonColor: '#16a34a'
      })
    } finally {
      setLoading(false)
    }
  }

  // ── Start Form ───────────────────────────────────────────────────────────────
  if (showStartConfirm) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            How many people are on this job?
          </label>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, '5+'].map(num => (
              <button
                key={num}
                onClick={() => setWorkerCount(num)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border ${workerCount === num ? 'bg-green-600 text-white border-green-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
              >
                {num}
              </button>
            ))}
          </div>

          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Estimated hours
          </label>
          <input
            type="number"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g. 2.5"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowStartConfirm(false)}
            disabled={loading}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => handleAction('start')}
            disabled={loading}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition flex justify-center items-center gap-2"
          >
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '▶ Start Job'}
          </button>
        </div>
      </div>
    )
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

        {/* Editable Totals Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Final Totals</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Hours worked
              </label>
              <input
                type="number"
                step="0.01"
                value={submittedHours}
                onChange={(e) => setSubmittedHours(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                People on job
              </label>
              <input
                type="number"
                value={submittedHeadcount}
                onChange={(e) => setSubmittedHeadcount(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center border border-gray-200">
            <span className="text-sm font-semibold text-gray-600">Total billable:</span>
            <span className="text-lg font-bold text-green-600">
              {((parseFloat(submittedHours) || 0) * (parseInt(submittedHeadcount) || 1)).toFixed(2)} hrs
            </span>
          </div>

          {(parseFloat(submittedHours) !== parseFloat((elapsedTime / 3600).toFixed(2)) || parseInt(submittedHeadcount) !== parseInt(workerCount === '5+' ? 5 : workerCount)) && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Why the change? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Required since you changed the hours or headcount..."
                rows={2}
                className="w-full border border-red-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              />
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
            onChange={(e) => setWorkSummary(e.target.value)}
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

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setShowConfirm(false)}
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
        <div className="rounded-2xl p-4 text-center bg-gray-50 border border-gray-200">
          <div className="text-4xl font-bold font-mono tracking-tight mb-1 text-black">
            {formatTime(elapsedTime)}
          </div>
          <div className="flex justify-center gap-3 text-xs text-black">
            <span>Standard: {formatDuration(standardDuration)}</span>
            {isOvertime && overtimeRate > 0 && (
              <span className="font-semibold text-black">
                +{formatDuration(overtimeMinutes)} overtime (+${overtimeEarnings.toFixed(2)})
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

      {/* Error displays removed; using SweetAlert2 */}

      <div className="flex gap-2">
        {timerStatus === 'not_started' && (
          <button
            onClick={() => handleAction('start')}
            disabled={loading}
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
              className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition disabled:opacity-50"
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
              className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition disabled:opacity-50"
            >
              ✓ Finish Job
            </button>
          </>
        )}
      </div>

      {timerStatus === 'not_started' && !beforeUploaded && (
        <p className="text-xs text-center text-amber-600 bg-amber-50 py-2 px-3 rounded-lg font-medium border border-amber-200">
          ⚠️ Before photos not uploaded
        </p>
      )}
      {(timerStatus === 'running' || timerStatus === 'paused') && !afterUploaded && (
        <p className="text-xs text-center text-amber-600 bg-amber-50 py-2 px-3 rounded-lg">
          📸 Upload after photos below before finishing
        </p>
      )}
    </div>
  )
}
