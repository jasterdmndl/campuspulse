import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'


function RequestList() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedImage, setSelectedImage] =
    useState(null)
  const [selectedRequest, setSelectedRequest] =
    useState(null)
  const [logs, setLogs] = useState([])

  const { profile } = useAuth()

  // FETCH REQUESTS
  async function fetchRequests() {

    setLoading(true)

    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.log(error)
      setLoading(false)
      return
    }

    setRequests(data)

    setLoading(false)
}

  // FETCH LOGS
  async function fetchLogs(requestId) {
    const { data, error } = await supabase
      .from('request_logs')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', {
        ascending: true,
      })

    if (error) {
      console.log(error)
      return
    }

    setLogs(data)
  }

  // REALTIME
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
        async () => {
          await fetchRequests()

          // Refresh selected modal request
          if (selectedRequest) {
            const { data } = await supabase
              .from('requests')
              .select('*')
              .eq('id', selectedRequest.id)
              .single()

            if (data) {
              setSelectedRequest(data)
            }
          }
        }
      )

      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedRequest])

  // UPDATE STATUS
  async function updateStatus(id, newStatus) {
    const { error } = await supabase
      .from('requests')
      .update({
        status: newStatus,
      })
      .eq('id', id)

    if (error) {
      toast.alert(error.message)
      console.log(error)
      return
    }

    // Insert activity log
    const request = requests.find(
  (r) => r.id === id
)

  const { error: logError } = await supabase
    .from('request_logs')
    .insert([
      // Admin activity log
      {
        request_id: id,
        user_id: profile.id,
        recipient_id: profile.id,
        action: `You changed status to ${newStatus}`,
      },

      // Student notification
      {
        request_id: id,
        user_id: profile.id,
        recipient_id: request.user_id,
        action: `Your request "${request.title}" is now ${newStatus}`,
      },
    ])
  }

  // DELETE REQUEST
  async function deleteRequest(id) {
    const confirmDelete = window.confirm(
      'Delete this request?'
    )

    if (!confirmDelete) return

    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.log(error)
      return
    }

    // Close modal if deleted request is open
    if (selectedRequest?.id === id) {
      setSelectedRequest(null)
    }
  }

  // STATUS COLORS
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

  // FILTERS
  const filteredRequests = requests.filter(
    (request) => {
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
    }
  )

  return (
    <div>
      {/* HEADER */}
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
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
            className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
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

        </div>
      </div>

      {/* REQUESTS */}
      <div className="space-y-4">
      
          {loading && (
      <>
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse"
          >

            <div className="flex justify-between mb-4">

              <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-200 rounded-lg"></div>
                <div className="h-4 w-24 bg-gray-200 rounded-lg"></div>
              </div>

              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded-lg"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded-lg"></div>
            </div>

            <div className="h-40 bg-gray-200 rounded-2xl mb-4"></div>

            <div className="flex justify-between items-center">

              <div className="h-6 w-24 bg-gray-200 rounded-full"></div>

              <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>

            </div>
          </div>
        ))}
      </>
    )}

      {!loading && filteredRequests.length === 0 ? (
        
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">

          <div className="text-5xl mb-4">
            📭
          </div>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Requests Found
          </h3>

          <p className="text-gray-500">
            Try adjusting your search or filters.
          </p>

        </div>

      ) : (
    
    !loading &&
    filteredRequests.map((request) => (
          <div
            key={request.id}
            onClick={async () => {
              setSelectedRequest(request)
              await fetchLogs(request.id)
            }}
            className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition bg-white cursor-pointer"
          >

            {/* TOP */}
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
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  request.status
                )}`}
              >
                {request.status}
              </span>
            </div>

            {/* DESCRIPTION */}
            <p className="text-gray-600 mb-4">
              {request.description}
            </p>

            {/* IMAGE */}
            {request.image_url && (
              <img
                src={request.image_url}
                alt="Request"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage(
                    request.image_url
                  )
                }}
                className="w-full h-48 sm:h-64 object-cover rounded-xl mb-4 cursor-pointer hover:opacity-90 transition"
              />
            )}

            {/* FOOTER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div className="flex gap-2 flex-wrap">

                <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                  {request.category}
                </span>

                {(profile?.role === 'admin' ||
                  profile?.id ===
                    request.user_id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteRequest(request.id)
                    }}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs hover:bg-red-200 transition"
                  >
                    DELETE
                  </button>
                )}
              </div>

              {/* ADMIN STATUS */}
              {profile?.role === 'admin' && (
                <select
                  value={request.status}
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                  onChange={(e) =>
                    updateStatus(
                      request.id,
                      e.target.value
                    )
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
        ))
        )}
      </div>

      {/* MODAL */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() =>
            setSelectedRequest(null)
          }
        >

          <div
            className="bg-white w-full max-w-3xl rounded-3xl p-6 overflow-y-auto max-h-[90vh]"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="flex items-start justify-between mb-6">

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedRequest.title}
                </h2>

                <p className="text-gray-500 mt-1">
                  {selectedRequest.location}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedRequest(null)
                }
                className="text-gray-500 text-xl"
              >
                ✕
              </button>
            </div>

            {selectedRequest.image_url && (
              <img
                src={selectedRequest.image_url}
                alt="Request"
                className="w-full h-72 object-cover rounded-2xl mb-6"
              />
            )}

            <div className="space-y-4 mb-8">

              <div>
                <h3 className="font-semibold text-gray-700">
                  Description
                </h3>

                <p className="text-gray-600 mt-1">
                  {selectedRequest.description}
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">

                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {selectedRequest.category}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                    selectedRequest.status
                  )}`}
                >
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            {/* TIMELINE */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Activity Timeline
              </h3>

              <div className="space-y-4">

                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <p className="text-gray-800 font-medium">
                      {log.action}
                    </p>

                    <p className="text-sm text-gray-500">
                      {new Date(
                        log.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() =>
            setSelectedImage(null)
          }
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