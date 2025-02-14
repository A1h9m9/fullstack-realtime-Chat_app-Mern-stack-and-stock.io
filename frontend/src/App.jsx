import React from 'react'
import Navbar from './components/Navbar';
import { Routes, Route, Navigate } from 'react-router-dom'
import Homepage from './pages/HomePage'
import Signup from './pages/SignUp'
import Login from './pages/Login'
import Settings from './pages/Settings'
import ProfilePage from './pages/ProfilePage'
import { useAuthStore } from './store/useAthStore';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';


export const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  console.log({onlineUsers})
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser })

  // Check if the authentication status is being checked and there is no authenticated user

  if (isCheckingAuth && !authUser) {
    // If true, return a loading screen with a centered loader component

    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-span" />
      </div>
    )
  }
  return (
    <div >

      <Navbar />

      <Routes>

        <Route path='/' element={authUser ? <Homepage /> : <Navigate to="/login" />} />
        <Route path='/signup' element={!authUser ? <Signup /> : <Navigate to="/login" />} />
        <Route path='/login' element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path='/settings' element={authUser ? <Settings /> : <Navigate to="/setting" />} />
        <Route path="/ProfilePage" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />


    </div>
  )
}

export default App
