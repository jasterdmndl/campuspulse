import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getSession()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const currentUser = session?.user ?? null

    setUser(currentUser)

    if (currentUser) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      setProfile(data)
    } else {
      setProfile(null)
    }

    setLoading(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}