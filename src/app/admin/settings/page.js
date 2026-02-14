'use client'

import { useState } from 'react'
import { useAdminTheme } from '../layout'

export default function SettingsPage() {
    const { isDarkMode } = useAdminTheme()
    const [activeTab, setActiveTab] = useState('general')

    const tabs = [
        { id: 'general', name: 'General', icon: '⚙️' },
        { id: 'notifications', name: 'Notifications', icon: '🔔' },
        { id: 'security', name: 'Security', icon: '🔒' },
        { id: 'account', name: 'Account', icon: '👤' }
    ]

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Tabs */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className={`rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} overflow-hidden`}>
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
                    <div className={`p-12 rounded-xl border border-dashed h-full flex flex-col items-center justify-center ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
                        }`}>
                        <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mb-4">
                            <span className="text-3xl">🛠️</span>
                        </div>
                        <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Settings Management Coming Soon</h2>
                        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-center max-w-md`}>
                            We&apos;re building a centralized settings panel where you can manage system configurations, notification preferences, and admin user profiles.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
