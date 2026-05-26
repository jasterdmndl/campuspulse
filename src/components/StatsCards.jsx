import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

function StatsCards() {
  const { profile, user } = useAuth()

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
}, [profile])

  async function fetchStats() {

    // ADMIN VIEW
    if (profile?.role === 'admin') {

      const { count: total } = await supabase
        .from('requests')
        .select('*', {
          count: 'exact',
          head: true,
        })

      const { count: pending } =
        await supabase
          .from('requests')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .eq('status', 'pending')

      const { count: inProgress } =
        await supabase
          .from('requests')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .eq('status', 'in_progress')

      const { count: resolved } =
        await supabase
          .from('requests')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .eq('status', 'resolved')

      setStats({
        total: total || 0,
        pending: pending || 0,
        inProgress: inProgress || 0,
        resolved: resolved || 0,
      })

    } else {

      // STUDENT VIEW
      const { count: total } = await supabase
        .from('requests')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq('user_id', profile.id)

      const { count: resolved } =
        await supabase
          .from('requests')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .eq('user_id', profile.id)
          .eq('status', 'resolved')

      setStats({
        total: total || 0,
        resolved: resolved || 0,
      })
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-lg">

      {/* TOP */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h2 className="text-2xl font-bold">
            Welcome,
            {' '}
            {profile?.role === 'admin'
              ? 'Administrator'
              : 'Student'}
          </h2>

          <p className="text-blue-100 mt-1">
            {user?.email}
          </p>
        </div>

        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
          {user?.email
            ?.charAt(0)
            .toUpperCase()}
        </div>
      </div>

      {/* ADMIN STATS */}
      {profile?.role === 'admin' ? (

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-sm text-blue-100">
              Total Requests
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {stats.total}
            </h3>
          </div>

          <div className="bg-yellow-400/20 rounded-2xl p-4">
            <p className="text-sm text-yellow-100">
              Pending
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {stats.pending}
            </h3>
          </div>

          <div className="bg-blue-400/20 rounded-2xl p-4">
            <p className="text-sm text-blue-100">
              In Progress
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {stats.inProgress}
            </h3>
          </div>

          <div className="bg-green-400/20 rounded-2xl p-4">
            <p className="text-sm text-green-100">
              Resolved
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {stats.resolved}
            </h3>
          </div>

        </div>

      ) : (

        // STUDENT STATS
        <div className="grid grid-cols-2 gap-4">

          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-sm text-blue-100">
              My Requests
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {stats.total}
            </h3>
          </div>

          <div className="bg-green-400/20 rounded-2xl p-4">
            <p className="text-sm text-green-100">
              Resolved
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {stats.resolved}
            </h3>
          </div>

        </div>

      )}
    </div>
  )
}

export default StatsCards