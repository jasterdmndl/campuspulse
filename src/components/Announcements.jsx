import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function Announcements() {
  const { profile } = useAuth()

  const [announcements, setAnnouncements] =
    useState([])

  const [title, setTitle] =
    useState('')

  const [content, setContent] =
    useState('')

  async function fetchAnnouncements() {
    const { data, error } =
      await supabase
        .from('announcements')
        .select('*')
        .order('created_at', {
          ascending: false,
        })

    if (error) {
      console.log(error)
      return
    }

    setAnnouncements(data)
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function createAnnouncement() {
    if (!title || !content) {
      toast.error('Fill all fields')
      return
    }

    const { error } =
      await supabase
        .from('announcements')
        .insert([
          {
            title,
            content,
            created_by: profile.id,
          },
        ])

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success(
      'Announcement posted'
    )

    setTitle('')
    setContent('')

    fetchAnnouncements()
  }

  async function deleteAnnouncement(id) {
    const confirmDelete =
      window.confirm(
        'Delete announcement?'
      )

    if (!confirmDelete) return

    const { error } =
      await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success(
      'Announcement deleted'
    )

    fetchAnnouncements()
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">

      <h2 className="text-2xl font-bold mb-6">
        📢 Announcements
      </h2>

      {profile?.role === 'admin' && (
        <div className="space-y-3 mb-8">

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="w-full border rounded-xl p-3"
          />

          <textarea
            placeholder="Announcement..."
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
            className="w-full border rounded-xl p-3 h-28"
          />

          <button
            onClick={
              createAnnouncement
            }
            className="bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            Post Announcement
          </button>

        </div>
      )}

      <div className="space-y-4">

        {announcements.map(
          (announcement) => (
            <div
              key={announcement.id}
              className="border rounded-2xl p-4"
            >

              <div className="flex justify-between">

                <h3 className="font-bold text-lg">
                  {announcement.title}
                </h3>

                {profile?.role ===
                  'admin' && (
                  <button
                    onClick={() =>
                      deleteAnnouncement(
                        announcement.id
                      )
                    }
                    className="text-red-500"
                  >
                    Delete
                  </button>
                )}
              </div>

              <p className="mt-2 text-gray-700">
                {
                  announcement.content
                }
              </p>

              <p className="text-xs text-gray-500 mt-3">
                {new Date(
                  announcement.created_at
                ).toLocaleString()}
              </p>

            </div>
          )
        )}
      </div>
    </div>
  )
}

export default Announcements