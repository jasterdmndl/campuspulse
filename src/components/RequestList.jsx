import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

function RequestList({ refreshKey }) {
  const [requests, setRequests] = useState([])
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
  fetchRequests()

  const channel = supabase
    .channel('requests-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'requests',
      },
      () => {
        fetchRequests()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])

  async function fetchRequests() {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    setRequests(data)
  }

  async function updateStatus(id, newStatus) {
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      console.log(error)
      return
    }

    // Insert activity log
    const { error: logError } = await supabase
      .from('request_logs')
      .insert([
        {
          request_id: id,
          user_id: profile.id,
          action: `changed status to ${newStatus}`,
        },
      ])

    if (logError) {
      console.log(logError)
    }

    fetchRequests()
}
  function getStatusColor(status) {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-700'

      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700'

      default:
        return 'bg-gray-100 text-gray-700'
    }
  }
  const filteredRequests = requests.filter((request) => {
  const matchesSearch =
      request.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      request.location
        .toLowerCase()
        .includes(search.toLowerCase())

  const matchesFilter =
      filter === 'all' ||
      request.status === filter

    return matchesSearch && matchesFilter
  })

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Campus Requests
          </h2>

          <p className="text-sm text-gray-500">
            {filteredRequests.length} requests
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">

          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">
              In Progress
            </option>
            <option value="resolved">Resolved</option>
          </select>

        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition bg-white"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {request.title}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {request.location}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
              >
                {request.status}
              </span>
            </div>

            <p className="text-gray-600 mb-4">
              {request.description}
              {request.image_url && (
                <img
                  src={request.image_url}
                  alt="Request"
                  onClick={() =>
                    setSelectedImage(request.image_url)
                  }
                  className="w-full h-48 sm:h-64 object-cover rounded-xl mb-4 cursor-pointer hover:opacity-90 transition"
                />
              )}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              
              <div className="flex gap-2">
                <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                  {request.category}
                </span>
              </div>
              {profile?.role === 'admin' && (
              <select
                value={request.status}
                onChange={(e) =>
                  updateStatus(request.id, e.target.value)
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">
                  Pending
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="resolved">
                  Resolved
                </option>
              </select>
              )}
            </div>
          </div>
        ))}
      </div>
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-full rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  )
}

export default RequestList