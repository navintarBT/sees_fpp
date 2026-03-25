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
      <p>กดปุ่มเพื่อจำลองการล็อกอิน</p>
      <button type="button" onClick={handleLogin}>
        เข้าสู่ระบบ
      </button>
    </section>
  )
}

export default Login
