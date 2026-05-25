import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function StatsCards() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  })

  useEffect(() => {
    fetchStats()

    const channel = supabase
      .channel('stats-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
        },
        () => {
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchStats() {
    const { data, error } = await supabase
      .from('requests')
      .select('status')

    if (error) {
      console.log(error)
      return
    }

    const total = data.length

    const pending = data.filter(
      item => item.status === 'pending'
    ).length

    const inProgress = data.filter(
      item => item.status === 'in_progress'
    ).length

    const resolved = data.filter(
      item => item.status === 'resolved'
    ).length

    setStats({
      total,
      pending,
      inProgress,
      resolved,
    })
  }

  const cards = [
    {
      title: 'Total Requests',
      value: stats.total,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending',
      value: stats.pending,
      color: 'bg-gray-500',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      color: 'bg-yellow-500',
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      color: 'bg-green-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100"
        >
          <div
            className={`w-3 h-3 rounded-full ${card.color} mb-4`}
          />

          <h3 className="text-sm text-gray-500">
            {card.title}
          </h3>

          <p className="text-3xl font-bold text-gray-800 mt-2">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export default StatsCards