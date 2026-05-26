import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useAuth } from './context/AuthContext'
import Register from './pages/Register'

function App() {
  const { user } = useAuth()

  return (
    <>
      {user ? <Dashboard /> : <Login />}
    </>
  )
}

export default App