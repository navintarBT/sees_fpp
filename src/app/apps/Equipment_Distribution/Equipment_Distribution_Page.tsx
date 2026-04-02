import {Navigate, Route, Routes} from 'react-router-dom'
import {SetRegisterHandInputPage} from './Equipment_Distribution_Manual'
import { Equipment_Distribution } from './Equipment_Distribution'

const Equipment_Distribution_Page = () => {
  return (
    <Routes>
      <Route index element={<Equipment_Distribution />} />
      <Route path='manual-input' element={<SetRegisterHandInputPage />} />
      <Route path='*' element={<Navigate to='/factory/equipment-distribution' replace />} />
    </Routes>
  )
}

export default Equipment_Distribution_Page
