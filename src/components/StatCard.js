'use client'

export default function StatCard({ title, value, gradient, icon }) {
  return (
    <div className="glass-effect rounded-xl p-6 card-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-4 rounded-xl ${gradient}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}