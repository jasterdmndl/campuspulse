import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import RequestList from '../components/RequestList'
import CreateRequest from './CreateRequest'

function Dashboard() {
  const { user } = useAuth()

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div>
      <h1>CampusPulse Dashboard</h1>

      <p>Logged in as: {user?.email}</p>

      <button onClick={handleLogout}>
        Logout
      </button>
        <CreateRequest />
        <RequestList />
    </div>
    
  )
}

export default Dashboard