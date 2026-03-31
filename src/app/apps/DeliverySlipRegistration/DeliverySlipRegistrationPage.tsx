import {Navigate, Route, Routes} from 'react-router-dom'

import { DeliverySlipRegistration } from './DeliverySlipRegistration'

const DeliverySlipRegistrationPage = () => {
  return (
    <Routes>
      <Route index element={<DeliverySlipRegistration />} />
      {/* <Route path='manual-input' element={<SetRegisterHandInputPage />} /> */}
      <Route path='*' element={<Navigate to='/factory/deliveryslipregistration' replace />} />
    </Routes>
  )
}

export default DeliverySlipRegistrationPage