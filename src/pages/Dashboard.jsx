import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import CreateRequest from './CreateRequest'
import RequestList from '../components/RequestList'
import { useState } from 'react'
import StatsCards from '../components/StatsCards'
import { Menu, X } from 'lucide-react'


function Dashboard() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
    
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-lg rounded-xl p-3"
          >
            <Menu size={28} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              CICS Hub
            </h1>

            <p className="text-sm text-gray-500">
              Campus request system
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-0 z-50 md:hidden transition ${
            sidebarOpen
              ? 'visible'
              : 'invisible'
          }`}
        >
          
          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity ${
              sidebarOpen
                ? 'opacity-100'
                : 'opacity-0'
            }`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div
            className={`absolute top-0 left-0 h-full w-64 bg-white shadow-xl p-6 transform transition-transform ${
              sidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full'
            }`}
          >
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-blue-600">
                CICS Pulse
              </h2>

              <button
                onClick={() => setSidebarOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <nav className="space-y-4">
              
              <button
                onClick={() => {
                  document
                    .getElementById('dashboard')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                    })

                  setSidebarOpen(false)
                }}
                className="block w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100"
              >
                Dashboard
              </button>

              <button
                onClick={() => {
                  document
                    .getElementById('requests')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                    })

                  setSidebarOpen(false)
                }}
                className="block w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100"
              >
                Requests
              </button>

              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-50"
              >
                Logout
              </button>

            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Stats Cards */}
        <section id="dashboard">
          <StatsCards />
        </section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Request Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <CreateRequest />
          </div>
        </div>

        {/* Request Feed */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <section id="requests">
              <RequestList />
            </section>
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}

export default Dashboard