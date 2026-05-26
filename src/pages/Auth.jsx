import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

function Auth() {
  const [isLogin, setIsLogin] =
    useState(true)

  const [fullName, setFullName] =
    useState('')

  const [email, setEmail] = useState('')

  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    setLoading(true)

    // LOGIN
    if (isLogin) {

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      toast.success('Welcome back!')

    } else {

      // REGISTER
      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
        })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      const user = data.user

      await supabase.from('profiles').insert([
        {
          id: user.id,
          full_name: fullName,
        },
      ])

      toast.success(
        'Registration successful!'
      )

      setIsLogin(true)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        {/* HEADER */}
        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-blue-600">
            CICS Hub
          </h1>

          <p className="text-gray-500 mt-2">
            Campus request system
          </p>
        </div>

        {/* TABS */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">

          <button
            onClick={() =>
              setIsLogin(true)
            }
            className={`flex-1 py-2 rounded-xl font-medium transition ${
              isLogin
                ? 'bg-white shadow text-blue-600'
                : 'text-gray-500'
            }`}
          >
            Login
          </button>

          <button
            onClick={() =>
              setIsLogin(false)
            }
            className={`flex-1 py-2 rounded-xl font-medium transition ${
              !isLogin
                ? 'bg-white shadow text-blue-600'
                : 'text-gray-500'
            }`}
          >
            Register
          </button>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) =>
                setFullName(
                  e.target.value
                )
              }
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-medium transition"
          >
            {loading
              ? 'Please wait...'
              : isLogin
              ? 'Login'
              : 'Create Account'}
          </button>

        </form>

        {/* FOOTER */}
        <p className="text-center text-sm text-gray-500 mt-6">

          {isLogin
            ? "Don't have an account?"
            : 'Already have an account?'}

          <button
            onClick={() =>
              setIsLogin(!isLogin)
            }
            className="text-blue-600 font-medium ml-1"
          >
            {isLogin
              ? 'Register'
              : 'Login'}
          </button>

        </p>
      </div>
    </div>
  )
}

export default Auth