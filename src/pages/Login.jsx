import { useLocation, useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/mainPage'

  const handleLogin = () => {
    localStorage.setItem('auth', 'true')
    navigate(from, { replace: true })
  }

  return (
    <section style={{ padding: 24 }}>
      <h1>Login</h1>
      <p>Press the button to simulate a login.</p>
      <button type="button" onClick={handleLogin}>
        Log in
      </button>
    </section>
  )
}

export default Login
