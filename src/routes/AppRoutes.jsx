import { Navigate, Route, Routes } from 'react-router-dom'
import Login from '../pages/Login.jsx'
import MainPage from '../pages/MainPage.tsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/factory" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/factory/*" element={<MainPage />} />
      <Route path="*" element={<Navigate to="/factory" replace />} />
    </Routes>
  )
}

export default AppRoutes
