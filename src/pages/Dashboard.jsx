import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import CreateRequest from './CreateRequest'
import RequestList from '../components/RequestList'
import StatsCards from '../components/StatsCards'
import Notifications from '../components/Notifications'
import toast from 'react-hot-toast'


function Dashboard() {
  const { user } = useAuth()

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

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="space-y-6">

            {/* CREATE REQUEST */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <CreateRequest />
            </div>

            {/* NOTIFICATIONS */}
            <section id="notifications">
              <Notifications />
            </section>

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
    </div>
  )
}

export default Dashboard