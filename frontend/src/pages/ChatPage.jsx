import React from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

export default function ChatPage() {
  const { id } = useParams()
  const [character, setCharacter] = React.useState(null)
  const [messages, setMessages] = React.useState([])
  const [input, setInput] = React.useState('')
  const [imagePrompt, setImagePrompt] = React.useState('')
  const [images, setImages] = React.useState([])
  const [storedImages, setStoredImages] = React.useState([])
  const [loadingChat, setLoadingChat] = React.useState(false)
  const [loadingImage, setLoadingImage] = React.useState(false)
  const [error, setError] = React.useState('')

  async function fetchChatHistory() {
    try {
      const res = await axios.get(`/chat/${id}/history`)
      const history = Array.isArray(res.data) ? res.data : []
      const msgs = []
      for (const h of history) {
        if (h.user) msgs.push({ role: 'user', content: h.user })
        if (h.assistant) msgs.push({ role: 'assistant', content: h.assistant })
      }
      setMessages(msgs)
    } catch (_e) {}
  }

  async function clearAndRefresh() {
    try {
      await axios.delete(`/chat/${id}/history`)
      setMessages([])
      await fetchChatHistory()
    } catch (_e) {}
  }

  React.useEffect(() => {
    let mounted = true
    async function loadCharacter() {
      try {
        const res = await axios.get('/characters')
        const list = Array.isArray(res.data) ? res.data : []
        const found = list.find((c) => String(c.id) === String(id)) || null
        if (mounted) setCharacter(found)
      } catch (err) {
        if (mounted) setError('Failed to load character')
      }
    }
    async function loadImageHistory() {
      try {
        const res = await axios.get(`/image/${id}/history`)
        const list = Array.isArray(res.data) ? res.data : []
        if (mounted) setStoredImages(list)
      } catch (_e) {}
    }
    loadCharacter()
    fetchChatHistory()
    loadImageHistory()
    return () => { mounted = false }
  }, [id])

  async function sendMessage() {
    if (!input.trim()) return
    const next = [...messages, { role: 'user', content: input }]
    setMessages(next)
    setInput('')
    setLoadingChat(true)
    setError('')
    try {
      const res = await axios.post(`/chat/${id}`, { messages: next })
      const reply = res?.data?.reply || res?.data?.choices?.[0]?.message?.content || '...'
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])

      // If backend generated an image as part of chat, reflect it
      const chatImage = res?.data?.image || null
      if (chatImage) {
        const imgs = Array.isArray(chatImage.images) ? chatImage.images : []
        const urls = Array.isArray(chatImage.urls) ? chatImage.urls : []
        if (imgs.length > 0) {
          setImages(imgs)
        }
        if (urls.length > 0) {
          setStoredImages((prev) => [
            ...urls.map((u) => ({ url: u, timestamp: new Date().toISOString() })),
            ...prev,
          ])
        }
      }
    } catch (err) {
      setError('Chat failed')
    } finally {
      setLoadingChat(false)
    }
  }

  async function generateImage() {
    if (!imagePrompt.trim()) return
    setLoadingImage(true)
    setError('')
    try {
      const res = await axios.post(`/image/${id}`, { prompt: imagePrompt })
      const imgs = Array.isArray(res?.data?.images) ? res.data.images : []
      const urls = Array.isArray(res?.data?.urls) ? res.data.urls : []
      setImages(imgs)
      // Also reflect saved URLs in stored list immediately
      if (urls.length > 0) {
        setStoredImages((prev) => [
          ...urls.map((u) => ({ url: u, timestamp: new Date().toISOString() })),
          ...prev,
        ])
      }
    } catch (err) {
      setError('Image generation failed')
    } finally {
      setLoadingImage(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-100">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link to="/" className="text-brand-800 hover:underline">← Back</Link>
            <div className="text-xl font-semibold">{character?.name || 'Chat'}</div>
            <div className="text-sm text-brand-600">{character?.tagline}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 text-sm border border-brand-400 rounded hover:bg-brand-100"
              onClick={clearAndRefresh}
            >
              Refresh (Clear & Reload)
            </button>
          </div>
        </div>

        {error && <div className="mb-3 text-brand-600">{error}</div>}

        <div className="bg-white rounded-lg border border-brand-100 p-4 h-[50vh] overflow-y-auto mb-4">
          {messages.length === 0 && (
            <div className="text-brand-600">Say hi to start the conversation.</div>
          )}
          {messages.map((m, idx) => (
            <div key={idx} className="mb-3">
              <div className={m.role === 'user' ? 'font-semibold' : 'text-brand-800'}>
                {m.role === 'user' ? 'You' : (character?.name || 'Assistant')}
              </div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
          {loadingChat && <div className="text-brand-600">Thinking…</div>}
        </div>

        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 border rounded px-3 py-2 border-brand-400"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
          />
          <button
            className="btn-primary px-4 py-2 rounded disabled:opacity-50"
            onClick={sendMessage}
            disabled={loadingChat}
          >
            Send
          </button>
        </div>

        <div className="bg-white rounded-lg border border-brand-100 p-4 mb-4">
          <div className="font-semibold mb-2">Generate Image</div>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-2 border-brand-400"
              placeholder="Image prompt..."
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') generateImage() }}
            />
            <button
              className="btn-secondary px-4 py-2 rounded disabled:opacity-50"
              onClick={generateImage}
              disabled={loadingImage}
            >
              Generate Image
            </button>
          </div>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {images.map((img, i) => (
                <img key={i} src={`data:image/png;base64,${img}`} alt="Generated" className="rounded" />
              ))}
            </div>
          )}
          {storedImages.length > 0 && (
            <div className="mt-6">
              <div className="font-semibold mb-2">Saved Images</div>
              <div className="grid grid-cols-2 gap-3">
                {storedImages.map((it, i) => (
                  <a key={i} href={it.url} target="_blank" rel="noreferrer">
                    <img src={it.url} alt="Saved" className="rounded" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


