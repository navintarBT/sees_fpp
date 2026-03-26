import {Navigate, Route, Routes} from 'react-router-dom'
import {DispatchHandInputPage} from './DispatchHandInputPage'
import {DispatchPage} from './DispatchPage'

const VehicleRegistrationPage = () => {
  return (
    <Routes>
      <Route index element={<DispatchPage />} />
      <Route path='hand-input' element={<DispatchHandInputPage />} />
      <Route path='*' element={<Navigate to='/factory/dispatch' replace />} />
    </Routes>
  )
}

export default VehicleRegistrationPage
