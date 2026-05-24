import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

function CreateRequest() {
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    const { error } = await supabase
      .from('requests')
      .insert([
        {
          user_id: user.id,
          title,
          description,
          category,
          location,
        },
      ])

    if (error) {
      alert(error.message)
      return
    }

    alert('Request submitted!')

    setTitle('')
    setDescription('')
    setCategory('')
    setLocation('')
  }

  return (
    <div>
      <h2>Create Request</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button type="submit">
          Submit Request
        </button>
      </form>
    </div>
  )
}

export default CreateRequest