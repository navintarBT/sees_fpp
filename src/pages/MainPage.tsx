import {Route, Routes, Outlet, useNavigate} from 'react-router-dom'
import './mainPage.scss'
import RegistrationRegistrationPage from '../app/apps/Registration/RegistrationRegistrationPage'
import DispatchRegistrationPage from '../app/apps/VehicleDispatch/DispatchRegistrationPage'
import VehicleInboundRegistrationPage from '../app/apps/VehicleInbound/VehicleInboundRegistrationPage'
import BundleRegistrationPage from '../app/apps/BundleRegistration/BundleRegistrationPage'
import Equipment_Distribution_Page from '../app/apps/Equipment_Distribution/Equipment_Distribution_Page'

import DeliverySlipRegistrationPage from '../app/apps/DeliverySlipRegistration/DeliverySlipRegistrationPage'
const MainPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<MainPageDetail />} />
        <Route path='set-register/*' element={<RegistrationRegistrationPage />} />
        <Route path='dispatch/*' element={<DispatchRegistrationPage />} />
        <Route path='vehicle-inbound/*' element={<VehicleInboundRegistrationPage />} />
        <Route path='bundle/*' element={<BundleRegistrationPage />} />
        <Route path='equipment-distribution/*' element={<Equipment_Distribution_Page />} />
        <Route path='deliveryslipregistration/*' element={<DeliverySlipRegistrationPage />} />
      </Route>
    </Routes>
  )
}

export default MainPage

const MainPageDetail = () => {
  const navigate = useNavigate()
  return (
    <div className='mockup-page'>
      <div className='mockup-stage'>
        <div className='mockup-frame'>
          <div className='mockup-header'>メインメニュー</div>
          <div className='mockup-body'>
            <div className='mockup-field'>
              <label className='mockup-label'>グループID</label>
              <input className='mockup-input' value='ADMIN' readOnly />
            </div>

            <div className='mockup-grid'>
              <button
                className='mockup-btn mockup-red'
                onClick={() => navigate('dispatch')}
              >
                出庫
              </button>
              <button
                className='mockup-btn mockup-blue'
                onClick={() => navigate('vehicle-inbound')}
              >
                入庫
              </button>
              <button className='mockup-btn mockup-green'
              onClick={() => navigate('deliveryslipregistration')}
              >配送伝票</button>
              <button className='mockup-btn mockup-yellow'>戻り構成</button>
              <button
                className='mockup-btn mockup-gray'
                onClick={() => navigate('set-register')}
              >
                セット登録
              </button>
              <button className='mockup-btn mockup-gray'>雑入出庫</button>
              <button className='mockup-btn mockup-orange'
              onClick={() => navigate('equipment-distribution')}
              >伝票振分</button>
              <button className='mockup-btn mockup-pink'
              onClick={() => navigate('bundle')}
              >販売セット</button>
            </div>

            <button className='mockup-exit'>終了</button>
          </div>
        </div>
      </div>
    </div>
  )
}
