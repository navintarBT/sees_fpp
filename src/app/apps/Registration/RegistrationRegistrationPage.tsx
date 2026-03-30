import {Navigate, Route, Routes} from 'react-router-dom'
import {SetRegisterHandInputPage} from './SetRegisterHandInputPage'
import {SetRegisterPage} from './SetRegisterPage'

const RegistrationRegistrationPage = () => {
  return (
    <Routes>
      <Route index element={<SetRegisterPage />} />
      <Route path='hand-input' element={<SetRegisterHandInputPage />} />
      <Route path='*' element={<Navigate to='/factory/set-register' replace />} />
    </Routes>
  )
}

export default RegistrationRegistrationPage
