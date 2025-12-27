import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function CharacterCard({ character }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/chat/${character.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left border border-brand-100 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white hover:bg-brand-100"
    >
      <div className="text-lg font-semibold text-brand-900">{character.name}</div>
      <div className="text-sm text-brand-600">{character.tagline}</div>
    </button>
  )
}


