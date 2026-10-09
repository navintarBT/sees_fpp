import { Navigate, Outlet, useLocation } from 'react-router-dom'

function PrivateRoute() {
  const location = useLocation()
  const isAuthed = localStorage.getItem('auth') === 'true'
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

export default PrivateRoute
