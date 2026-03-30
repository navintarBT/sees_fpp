import { Route, Routes, Outlet, Navigate, useNavigate } from 'react-router-dom'
import './mainPage.scss'
import { SetRegisterPage } from '../app/apps/Registration/SetRegisterPage'
import { SetRegisterHandInputPage } from '../app/apps/Registration/SetRegisterHandInputPage'
import DispatchRegistrationPage from '../app/apps/VehicleDispatch/DispatchRegistrationPage'
import RegistrationRegistrationPage from '../app/apps/Registration/RegistrationRegistrationPage'
import VehicleInboundRegistrationPage from '../app/apps/VehicleInbound/VehicleInboundRegistrationPage'
import BundleRegistrationPage from '../app/apps/BundleRegistration/BundleRegistrationPage'
// kongchanß
import { ReturnConfiguration } from '../app/apps/ReturnConfiguration/ReturnConfiguration'
import { SetReturnConfiguration } from '../app/apps/ReturnConfiguration/SetReturnConfiguration'
import { MiscellaneousInAndOutBound } from '../app/apps/MiscellaneousInAndOutBound/MiscellaneousInAndOutBound'
import { SetMiscellaneousInAndOutBound } from '../app/apps/MiscellaneousInAndOutBound/SetMiscellaneousInAndOutBound'

const MainPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<MainPageDetail />} />
        <Route path='set-register' element={<SetRegisterPage />} />
        <Route path='set-register-hand' element={<SetRegisterHandInputPage />} />
        <Route path='dispatch/*' element={<DispatchRegistrationPage />} />
        <Route path='set-register/*' element={<RegistrationRegistrationPage />} />
        <Route path='dispatch/*' element={<DispatchRegistrationPage />} />
        <Route path='vehicle-inbound/*' element={<VehicleInboundRegistrationPage />} />
        <Route path='bundle/*' element={<BundleRegistrationPage />} />
        {/* kongchan */}
        <Route path='return-configuration/*' element={<ReturnConfiguration />} />
        <Route path='setReturnConfiguration/*' element={<SetReturnConfiguration />} />
        <Route path='miscellaneousInAndOutBound/*' element={<MiscellaneousInAndOutBound />} />
        <Route path='setMiscellaneousInAndOutBound/*' element={<SetMiscellaneousInAndOutBound />} />
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
              <button className='mockup-btn mockup-green'>配送伝票</button>
              <button className='mockup-btn mockup-yellow' onClick={() => navigate('return-configuration')}>戻り構成</button>
              <button
                className='mockup-btn mockup-gray'
                onClick={() => navigate('set-register')}
              >
                セット登録
              </button>
              <button className='mockup-btn mockup-gray' onClick={() => navigate('miscellaneousInAndOutBound')}>雑入出庫</button>
              <button className='mockup-btn mockup-orange'>伝票振分</button>
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
