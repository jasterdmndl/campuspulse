import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function RequestList({ refreshKey }) {
  const [requests, setRequests] = useState([])

  useEffect(() => {
    fetchRequests()
  }, [refreshKey])

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Campus Requests
        </h2>

        <p className="text-sm text-gray-500">
          {requests.length} requests
        </p>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition bg-white"
          >
            <div className="flex items-start justify-between mb-4">
              
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
            </p>

            <div className="flex items-center justify-between">
              
              <div className="flex gap-2">
                <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                  {request.category}
                </span>
              </div>

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
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RequestList