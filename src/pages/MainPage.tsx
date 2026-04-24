import { Route, Routes, Outlet, Navigate, useNavigate } from 'react-router-dom'
import './mainPage.scss'
import { SetRegisterPage } from '../app/apps/Registration/SetRegisterPage'
import { SetRegisterHandInputPage } from '../app/apps/Registration/SetRegisterHandInputPage'
import { DispatchPage } from '../app/apps/VehicleDispatch/DispatchPage'
import { DispatchHandInputPage } from '../app/apps/VehicleDispatch/DispatchHandInputPage'
import { VehicleInboundPage } from '../app/apps/VehicleInbound/VehicleInboundPage'
import { VehicleInboundHandInputPage } from '../app/apps/VehicleInbound/VehicleInboundHandInputPage'
import { DeliverySlipRegistration } from '../app/apps/DeliverySlipRegistration/DeliverySlipRegistration'
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
        <Route path='set-register/hand-input' element={<SetRegisterHandInputPage />} />
        <Route path='dispatch' element={<DispatchPage />} />
        <Route path='dispatch/hand-input' element={<DispatchHandInputPage />} />
        <Route path='inbound' element={<VehicleInboundPage />} />
        <Route path='inbound/hand-input' element={<VehicleInboundHandInputPage />} />
        <Route path='delivery-slip-registration' element={<DeliverySlipRegistration />} />
        <Route path='return-configuration' element={<ReturnConfiguration />} />
        <Route path='set-return-configuration' element={<SetReturnConfiguration />} />
        <Route path='miscellaneous-in-and-out-bound' element={<MiscellaneousInAndOutBound />} />
        <Route path='set-miscellaneous-in-and-out-bound' element={<SetMiscellaneousInAndOutBound />} />
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
                onClick={() => navigate('inbound')}
              >
                入庫
              </button>
              <button
                className='mockup-btn mockup-green'
                onClick={() => navigate('delivery-slip-registration')}
              >
                配送伝票
              </button>
              <button
                className='mockup-btn mockup-yellow'
                onClick={() => navigate('set-return-configuration')}
              >
                戻り構成
              </button>
              <button
                className='mockup-btn mockup-gray'
                onClick={() => navigate('set-register')}
              >
                セット登録
              </button>
              <button
                className='mockup-btn mockup-gray'
                onClick={() => navigate('set-miscellaneous-in-and-out-bound')}
              >
                雑入出庫
              </button>
              <button
                className='mockup-btn mockup-orange'
                onClick={() => navigate('')}
              >
                伝票振分
              </button>
              <button className='mockup-btn mockup-pink'
                onClick={() => navigate('')}
              >販売セット</button>
            </div>

            <button className='mockup-exit'>終了</button>
          </div>
        </div>
      </div>
    </div>
  )
}
