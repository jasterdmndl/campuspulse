import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function RequestList() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] =
    useState(true)

  const [search, setSearch] =
    useState('')

  const [filter, setFilter] =
    useState('all')

  const [categoryFilter,
    setCategoryFilter] =
    useState('all')

  const [showFilters,
    setShowFilters] =
    useState(false)

  const [selectedImage,
    setSelectedImage] =
    useState(null)

  const [selectedRequest,
    setSelectedRequest] =
    useState(null)

  const [logs, setLogs] =
    useState([])

  const { profile } = useAuth()

  // =========================
  // FETCH REQUESTS
  // =========================
  async function fetchRequests() {
    setLoading(true)

    const { data, error } =
      await supabase
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

  // =========================
  // FETCH LOGS
  // =========================
  async function fetchLogs(requestId) {
    const { data, error } =
      await supabase
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

  // =========================
  // REALTIME
  // =========================
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

          if (selectedRequest) {
            const { data } =
              await supabase
                .from('requests')
                .select('*')
                .eq(
                  'id',
                  selectedRequest.id
                )
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

  // =========================
  // UPDATE STATUS
  // =========================
  async function updateStatus(
    id,
    newStatus
  ) {
    const { error } =
      await supabase
        .from('requests')
        .update({
          status: newStatus,
        })
        .eq('id', id)

    if (error) {
      toast.error(error.message)
      return
    }

    const request = requests.find(
      (r) => r.id === id
    )

    await supabase
      .from('request_logs')
      .insert([
        {
          request_id: id,
          user_id: profile.id,
          recipient_id: profile.id,
          action: `You changed status to ${newStatus}`,
        },

        {
          request_id: id,
          user_id: profile.id,
          recipient_id:
            request.user_id,
          action: `Your request "${request.title}" is now ${newStatus}`,
        },
      ])

    toast.success(
      'Status updated'
    )
  }

  // =========================
  // DELETE REQUEST
  // =========================
  async function deleteRequest(id) {
    const confirmDelete =
      window.confirm(
        'Delete this request?'
      )

    if (!confirmDelete) return

    const { error } =
      await supabase
        .from('requests')
        .delete()
        .eq('id', id)

    if (error) {
      console.log(error)
      return
    }

    toast.success(
      'Request deleted'
    )

    if (selectedRequest?.id === id) {
      setSelectedRequest(null)
    }
  }

  // =========================
  // STATUS COLORS
  // =========================
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

  // =========================
  // FILTERS
  // =========================
  const filteredRequests =
    requests.filter((request) => {
      const matchesSearch =
        request.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        request.location
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )

      const matchesFilter =
        filter === 'all' ||
        request.status === filter

      const matchesCategory =
        categoryFilter ===
          'all' ||
        request.category
          ?.toLowerCase()
          .trim() ===
          categoryFilter.toLowerCase()

      return (
        matchesSearch &&
        matchesFilter &&
        matchesCategory
      )
    })

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Campus Requests
          </h2>

          <p className="text-sm text-gray-500">
            {
              filteredRequests.length
            }{' '}
            requests
          </p>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-wrap gap-3">

          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="border border-gray-300 rounded-2xl px-4 py-3 min-w-[250px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() =>
              setShowFilters(true)
            }
            className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition"
          >
            ⚙️

            <span className="font-medium">
              All Filters
            </span>

            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
              2
            </span>
          </button>
        </div>
      </div>

      {/* REQUESTS */}
      <div className="space-y-4">

        {/* LOADING */}
        {loading && (
          <>
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse"
                >
                  <div className="h-5 w-40 bg-gray-200 rounded mb-3"></div>

                  <div className="h-4 w-24 bg-gray-200 rounded mb-6"></div>

                  <div className="h-32 bg-gray-200 rounded-2xl"></div>
                </div>
              )
            )}
          </>
        )}

        {/* EMPTY */}
        {!loading &&
          filteredRequests.length ===
            0 && (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">

              <div className="text-5xl mb-4">
                📭
              </div>

              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Requests Found
              </h3>

              <p className="text-gray-500">
                Try adjusting your
                filters.
              </p>
            </div>
          )}

        {/* REQUESTS */}
        {!loading &&
          filteredRequests.map(
            (request) => (
              <div
                key={request.id}
                onClick={async () => {
                  setSelectedRequest(
                    request
                  )

                  await fetchLogs(
                    request.id
                  )
                }}
                className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition bg-white cursor-pointer"
              >

                {/* TOP */}
                <div className="flex justify-between gap-4 mb-4">

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {request.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {
                        request.location
                      }
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium h-fit ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </div>

                {/* DESCRIPTION */}
                <p className="text-gray-600 mb-4">
                  {
                    request.description
                  }
                </p>

                {/* IMAGE */}
                {request.image_url && (
                  <img
                    src={
                      request.image_url
                    }
                    alt="Request"
                    onClick={(e) => {
                      e.stopPropagation()

                      setSelectedImage(
                        request.image_url
                      )
                    }}
                    className="w-full h-60 object-cover rounded-2xl mb-4"
                  />
                )}

                {/* FOOTER */}
                <div className="flex flex-wrap justify-between items-center gap-3">

                  <div className="flex gap-2 flex-wrap">

                    <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                      {
                        request.category
                      }
                    </span>

                    {(profile?.role ===
                      'admin' ||
                      profile?.id ===
                        request.user_id) && (
                      <button
                        onClick={(
                          e
                        ) => {
                          e.stopPropagation()

                          deleteRequest(
                            request.id
                          )
                        }}
                        className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs hover:bg-red-200"
                      >
                        DELETE
                      </button>
                    )}
                  </div>

                  {profile?.role ===
                    'admin' && (
                    <select
                      value={
                        request.status
                      }
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                      onChange={(e) =>
                        updateStatus(
                          request.id,
                          e.target.value
                        )
                      }
                      className="border border-gray-300 rounded-xl px-3 py-2"
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
            )
          )}
      </div>

      {/* FILTER MODAL */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">

            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b">

              <h2 className="text-2xl font-bold">
                All Filters
              </h2>

              <button
                onClick={() =>
                  setShowFilters(
                    false
                  )
                }
                className="text-2xl text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-6">

              {/* STATUS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>

                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3"
                >
                  <option value="all">
                    All Status
                  </option>

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

              {/* CATEGORY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>

                <select
                  value={
                    categoryFilter
                  }
                  onChange={(e) =>
                    setCategoryFilter(
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3"
                >
                  <option value="all">
                    All Categories
                  </option>

                  <option value="facilities">
                    Facilities
                  </option>

                  <option value="academic">
                    Academic
                  </option>

                  <option value="services">
                    Services
                  </option>

                  <option value="emergency">
                    Emergency
                  </option>
                </select>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 p-6 border-t">

              <button
                onClick={() => {
                  setFilter('all')

                  setCategoryFilter(
                    'all'
                  )
                }}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
              >
                Clear All
              </button>

              <button
                onClick={() =>
                  setShowFilters(
                    false
                  )
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST MODAL */}
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

            <div className="flex justify-between mb-6">

              <div>
                <h2 className="text-2xl font-bold">
                  {
                    selectedRequest.title
                  }
                </h2>

                <p className="text-gray-500">
                  {
                    selectedRequest.location
                  }
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedRequest(
                    null
                  )
                }
                className="text-xl"
              >
                ✕
              </button>
            </div>

            {selectedRequest.image_url && (
              <img
                src={
                  selectedRequest.image_url
                }
                alt="Request"
                className="w-full h-72 object-cover rounded-2xl mb-6"
              />
            )}

            <div className="space-y-4 mb-8">

              <div>
                <h3 className="font-semibold">
                  Description
                </h3>

                <p className="text-gray-600">
                  {
                    selectedRequest.description
                  }
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">

                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {
                    selectedRequest.category
                  }
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                    selectedRequest.status
                  )}`}
                >
                  {
                    selectedRequest.status
                  }
                </span>
              </div>
            </div>

            {/* TIMELINE */}
            <div>
              <h3 className="text-lg font-bold mb-4">
                Activity Timeline
              </h3>

              <div className="space-y-4">

                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <p className="font-medium">
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
