import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function RequestList() {
  const [requests, setRequests] = useState([])

  useEffect(() => {
    fetchRequests()
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

    fetchRequests()
    }
  return (
    <div>
      <h2>Campus Requests</h2>

      {requests.map((request) => (
        <div
          key={request.id}
          style={{
            border: '1px solid gray',
            padding: '10px',
            marginBottom: '10px',
          }}
        >
          <h3>{request.title}</h3>

          <p>{request.description}</p>

          <p>
            <strong>Category:</strong> {request.category}
          </p>

          <p>
            <strong>Location:</strong> {request.location}
          </p>

          <p>
            <strong>Status:</strong> {request.status}
            <select
            value={request.status}
            onChange={(e) =>
                updateStatus(request.id, e.target.value)
            }
            >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            </select>
          </p>
        </div>
      ))}
    </div>
  )
}

export default RequestList