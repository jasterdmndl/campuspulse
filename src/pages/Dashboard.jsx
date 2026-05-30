import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import CreateRequest from './CreateRequest'
import RequestList from '../components/RequestList'
import StatsCards from '../components/StatsCards'
import Notifications from '../components/Notifications'
import toast from 'react-hot-toast'
import { useState } from 'react'
import ChatBot from '../components/ChatBot'
import Reports from '../components/Reports'
import Announcements from '../components/Announcements'


function Dashboard() {
  const { user, profile } = useAuth()
  const [showCreate, setShowCreate] =
    useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">

        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">

          {/* TITLE */}
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              CICS Hub
            </h1>

            <p className="text-sm text-gray-500">
              Campus request system
            </p>
          </div>

          {/* NAVIGATION */}
          <div className="flex flex-wrap items-center gap-3">


            <p className="text-sm text-gray-500 hidden sm:block">
              {user?.email}
            </p>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto p-6">

        {/* STATS */}
        <section id="dashboard" className="mb-6">
          <StatsCards />
        </section>

        <section className="mb-6">
          <Announcements />
        </section>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="space-y-6">
            {/* STUDENT CREATE REQUEST */}
            {profile?.role !== 'admin' && (

              <div className="space-y-4">

                {/* TOGGLE BUTTON */}
                <button
                  onClick={() =>
                    setShowCreate(!showCreate)
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-medium transition"
                >
                  {showCreate
                    ? 'Hide Request Form'
                    : '+ Create Request'}
                </button>

                {/* FORM */}
                {showCreate && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 animate-in fade-in duration-300">
                    <CreateRequest />
                  </div>
                )}

              </div>
            )}

            {/* NOTIFICATIONS */}
            <section id="notifications">
              <Notifications />
            </section>

            {/* REPORTS */}
            {profile?.role === 'admin' && (
              <div className="mt-6">
                <Reports />
              </div>
            )}

          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-2">

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <section id="requests">
                <RequestList />
              </section>
            </div>

          </div>
        </div>
      </main>

      <ChatBot />

    </div>
  )
}

export default Dashboard