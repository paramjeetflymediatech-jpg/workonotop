'use client'

import { useState, useEffect } from 'react'
import { useAdminTheme } from '../layout'

export default function SettingsPage() {
    const { isDarkMode } = useAdminTheme()
    const [activeTab, setActiveTab] = useState('general')
    const [settings, setSettings] = useState({
        default_commission: ''
    })
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings')
            const data = await res.json()
            if (data.success) {
                setSettings(prev => ({ ...prev, ...data.settings }))
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const saveSetting = async (key, value) => {
        setSaving(true)
        setMessage(null)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin', // Ensure cookies are sent
                body: JSON.stringify({ key, value })
            })
            const data = await res.json()
            if (data.success) {
                setMessage({ type: 'success', text: 'Setting updated successfully' })
                setIsEditing(false)
                setTimeout(() => setMessage(null), 3000)
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update setting' })
                console.error('Save error:', data)
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Connection error: ' + error.message })
        } finally {
            setSaving(false)
        }
    }

    const tabs = [
        { id: 'general', name: 'General', icon: '⚙️' },
        { id: 'notifications', name: 'Notifications', icon: '🔔' },
        { id: 'security', name: 'Security', icon: '🔒' },
        { id: 'account', name: 'Account', icon: '👤' }
    ]

    const cardBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    const textMain = isDarkMode ? 'text-white' : 'text-slate-900'
    const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500'

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className={`text-2xl font-bold ${textMain}`}>Settings</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Tabs */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className={`rounded-xl border ${cardBg} overflow-hidden`}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === tab.id
                                    ? 'bg-teal-500 text-white'
                                    : isDarkMode
                                        ? 'text-slate-300 hover:bg-slate-700'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                <span className="font-medium">{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className={`p-6 rounded-xl border ${cardBg}`}>
                        {activeTab === 'general' ? (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className={`text-lg font-semibold ${textMain}`}>General Settings</h2>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-3 py-1.5 bg-teal-500/10 text-teal-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-teal-500/20 transition-colors"
                                        >
                                            ✏️ Edit Settings
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className={`p-4 rounded-xl border ${isEditing ? 'border-teal-500 bg-teal-500/5' : isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
                                        <div className="flex flex-col gap-2">
                                            <label className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                                Default Commission (%)
                                            </label>
                                            <p className={`text-xs ${textMuted} mb-4`}>
                                                This commission will be applied automatically to all new job posts.
                                                You can still override this manually on specific bookings.
                                            </p>

                                            {loading ? (
                                                <div className="h-12 w-32 bg-slate-200 animate-pulse rounded-xl" />
                                            ) : isEditing ? (
                                                <div className="flex flex-wrap gap-3 items-center">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={settings.default_commission}
                                                            onChange={(e) => setSettings({ ...settings, default_commission: e.target.value })}
                                                            className={`w-32 px-4 py-2.5 rounded-xl border transition-all outline-none ${isDarkMode
                                                                    ? 'bg-slate-900 border-slate-700 text-white focus:border-teal-500'
                                                                    : 'bg-white border-slate-200 text-slate-900 focus:border-teal-500 shadow-sm'
                                                                }`}
                                                            min="0"
                                                            max="100"
                                                            autoFocus
                                                        />
                                                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${textMuted}`}>%</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => { setIsEditing(false); fetchSettings(); }}
                                                            className={`px-4 py-2.5 rounded-xl border ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'} font-semibold hover:bg-slate-100 transition-all`}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => saveSetting('default_commission', settings.default_commission)}
                                                            disabled={saving || loading}
                                                            className={`px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold transition-all shadow-md shadow-teal-500/20 disabled:opacity-50`}
                                                        >
                                                            {saving ? 'Saving...' : 'Save Changes'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-4">
                                                    <div className={`px-5 py-3 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm inline-flex items-center gap-2`}>
                                                        <span className="text-2xl font-black text-teal-500">{settings.default_commission || '0'}%</span>
                                                        <span className={`text-xs font-bold uppercase tracking-widest ${textMuted}`}>Active Rate</span>
                                                    </div>
                                                </div>
                                            )}

                                            {message && (
                                                <p className={`text-sm mt-3 font-medium ${message.type === 'success' ? 'text-teal-500' : 'text-rose-500'}`}>
                                                    {message.type === 'success' ? '✓ ' : '✕ '} {message.text}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mb-4">
                                    <span className="text-3xl">🛠️</span>
                                </div>
                                <h3 className={`text-lg font-semibold mb-2 ${textMain}`}>Coming Soon</h3>
                                <p className={`${textMuted} max-w-xs`}>
                                    This settings panel is currently under development.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
