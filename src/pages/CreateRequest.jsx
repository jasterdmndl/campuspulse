import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function CreateRequest() {
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [image, setImage] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    let imageUrl = ''

    if (image) {
      const fileName = `${Date.now()}-${image.name}`

      const { error: uploadError } = await supabase
        .storage
        .from('request-images')
        .upload(fileName, image)

      if (uploadError) {
        toast.alert(uploadError.message)
        return
      }

      const {
        data: { publicUrl },
      } = supabase
        .storage
        .from('request-images')
        .getPublicUrl(fileName)

      imageUrl = publicUrl
    }
    
    const { error } = await supabase
      .from('requests')
      .insert([
        {
          user_id: user.id,
          title,
          description,
          category,
          location,
          image_url: imageUrl,
        },
      ])
  .select()
  .single()
    if (error) {
      toast.error(error.message)
      return
    }
    await supabase
    .from('request_logs')
    .insert([
      {
        request_id: data.id,
        user_id: user.id,
        action: 'created request',
      },
    ])

    setTitle('')
    setDescription('')
    setCategory('')
    setLocation('')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Create Request
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>

          <input
            type="text"
            placeholder="Broken chair in Room 203"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>

          <textarea
            placeholder="Describe the issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            <option value="Facilities">Facilities</option>
            <option value="Academic">Academic</option>
            <option value="Services">Services</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>

          <input
            type="text"
            placeholder="Room 203"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Submit Request
        </button>
      </form>
    </div>
  )
}

export default CreateRequest