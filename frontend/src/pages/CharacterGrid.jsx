import React from 'react'
import axios from 'axios'
import CharacterCard from '../components/CharacterCard.jsx'

export default function CharacterGrid() {
  const [characters, setCharacters] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const res = await axios.get('/characters')
        if (mounted) setCharacters(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        if (mounted) setError('Failed to load characters')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="p-6 text-brand-800">Loading...</div>
  if (error) return <div className="p-6 text-brand-600">{error}</div>

  return (
    <div className="min-h-screen bg-brand-100">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-brand-900">Choose a Character</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {characters.map((c) => (
            <CharacterCard key={c.id} character={c} />
          ))}
        </div>
      </div>
    </div>
  )
}


