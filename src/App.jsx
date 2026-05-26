import Dashboard from './pages/Dashboard'
import { useAuth } from './context/AuthContext'
import Auth from './pages/Auth'

function App() {
  const { user } = useAuth()

  return (
    <>
      {user ? <Dashboard /> : <Auth />}
    </>
  )
}

export default App