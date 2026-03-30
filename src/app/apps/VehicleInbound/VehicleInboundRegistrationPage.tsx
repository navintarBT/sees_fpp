import {Navigate, Route, Routes} from 'react-router-dom'
import {VehicleInboundHandInputPage} from './VehicleInboundHandInputPage'
import {VehicleInboundPage} from './VehicleInboundPage'

const VehicleInboundRegistrationPage = () => {
  return (
    <Routes>
      <Route index element={<VehicleInboundPage />} />
      <Route path='vehicle-inbound-hand-input' element={<VehicleInboundHandInputPage />} />
      <Route path='*' element={<Navigate to='/factory/vehicle-inbound' replace />} />
    </Routes>
  )
}

export default VehicleInboundRegistrationPage
