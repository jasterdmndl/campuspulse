import { useState } from 'react'
import axios from 'axios'
import {
  MessageCircle,
  X,
} from 'lucide-react'

function ChatBot() {
  const [open, setOpen] = useState(false)

  const [messages, setMessages] =
    useState([
      {
        sender: 'bot',
        text: 'Hi! I am your AI assistant.',
      },
    ])

  const [input, setInput] = useState('')
  const [loading, setLoading] =
    useState(false)

  async function handleSend() {
    if (!input.trim()) return

    const userMessage = {
      sender: 'user',
      text: input,
    }

    setMessages((prev) => [
      ...prev,
      userMessage,
    ])

    setInput('')
    setLoading(true)

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
        model: 'openrouter/free',

          messages: [
            {
              role: 'system',
              content:
                'You are a helpful assistant for a campus request management system called CICS Hub.',
            },

            {
              role: 'user',
              content: input,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${
              import.meta.env
                .VITE_OPENROUTER_API_KEY
            }`,
            'Content-Type':
              'application/json',
          },
        }
      )

      const botReply =
        response.data.choices[0]
          .message.content

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
        },
      ])
    } catch (error) {
      console.log(error)

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Something went wrong.',
        },
      ])
    }

    setLoading(false)
  }

  return (
    <>
      {/* FLOAT BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl z-50"
      >
        {open ? (
          <X size={24} />
        ) : (
          <MessageCircle size={24} />
        )}
      </button>

      {/* CHAT */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden z-50">

          {/* HEADER */}
          <div className="bg-blue-600 text-white p-4">
            <h2 className="font-bold">
              AI Assistant
            </h2>

            <p className="text-sm text-blue-100">
              Powered by AI
            </p>
          </div>

          {/* MESSAGES */}
          <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-3">

            {messages.map(
              (message, index) => (
                <div
                  key={index}
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                    message.sender ===
                    'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-white border'
                  }`}
                >
                  {message.text}
                </div>
              )
            )}

            {loading && (
              <div className="bg-white border px-4 py-3 rounded-2xl text-sm w-fit">
                Thinking...
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="flex border-t">

            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend()
                }
              }}
              className="flex-1 px-4 py-3 outline-none"
            />

            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5"
            >
              Send
            </button>

          </div>
        </div>
      )}
    </>
  )
}

export default ChatBot