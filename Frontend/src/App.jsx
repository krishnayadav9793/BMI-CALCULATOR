
import './App.css'
import React from 'react'
import { Route,Routes } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
function App() {
  

  return (
    <Routes>
      <Route element={ <LandingPage/> } path='/'/>
    </Routes>
  )
}

export default App
