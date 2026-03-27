import {Navigate, Route, Routes} from 'react-router-dom'
import {BundleHandInputPage} from './BundleHandInputPage'
import {BundlePage} from './BundlePage'

const BundleRegistrationPage = () => {
  return (
    <Routes>
      <Route index element={<BundlePage />} />
      <Route path='hand-input' element={<BundleHandInputPage />} />
      <Route path='*' element={<Navigate to='/factory/bundle' replace />} />
    </Routes>
  )
}

export default BundleRegistrationPage
