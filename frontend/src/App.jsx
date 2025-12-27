import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CharacterGrid from './pages/CharacterGrid.jsx'
import ChatPage from './pages/ChatPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CharacterGrid />} />
        <Route path="/chat/:id" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  )
}


