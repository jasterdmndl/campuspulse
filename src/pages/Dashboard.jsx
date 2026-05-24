import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import CreateRequest from './CreateRequest'
import RequestList from '../components/RequestList'
import { useState } from 'react'


function Dashboard() {
  const { user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              CampusPulse
            </h1>

            <p className="text-sm text-gray-500">
              Campus Operations System
            </p>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              {user?.email}
            </p>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 grid md:grid-cols-3 gap-6">

        {/* Request Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <CreateRequest
                onRequestCreated={() =>
                    setRefreshKey(prev => prev + 1)
                }
                />
          </div>
        </div>

        {/* Request Feed */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <RequestList refreshKey={refreshKey} />
          </div>
        </div>

      </main>
    </div>
  )
}

export default Dashboard