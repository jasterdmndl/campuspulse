import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

function Notifications() {
  const { profile } = useAuth()
  const [notifications, setNotifications] =
    useState([])
  

  useEffect(() => {
    fetchNotifications()

    const channel = supabase
        .channel('logs-realtime')
        .on(
        'postgres_changes',
        {
            event: 'INSERT',
            schema: 'public',
            table: 'request_logs',
        },
        () => {
            fetchNotifications()
        }
        )
        .subscribe()

    return () => {
        supabase.removeChannel(channel)
    }
    }, [profile])
    async function fetchNotifications() {
    let query = supabase
        .from('request_logs')
        .select(`
        *,
        requests (
            user_id
        )
        `)
        .order('created_at', {
        ascending: false,
        })
        .limit(5)

    // Students only see own notifications
    if (profile?.role !== 'admin') {
        query = query.eq(
        'requests.user_id',
        profile.id
        )
    }

    const { data, error } = await query

    console.log(data)
    console.log(error)

    if (error) {
        console.log(error)
        return
    }

    setNotifications(data)
    }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
      
      <div className="flex items-center justify-between mb-4">
        
        <h2 className="text-lg font-bold text-gray-800">
          Notifications
        </h2>

        <span className="text-sm text-gray-500">
          Live
        </span>
      </div>

      <div className="space-y-3">

        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="border border-gray-100 rounded-xl p-3"
          >
            <p className="text-sm font-medium text-gray-800">
              {notification.action}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {new Date(
                notification.created_at
              ).toLocaleString()}
            </p>
          </div>
        ))}

      </div>
    </div>
  )
}

export default Notifications