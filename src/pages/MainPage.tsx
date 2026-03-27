import { Route, Routes, Outlet, Navigate, useNavigate } from 'react-router-dom'
import './mainPage.scss'
import { SetRegisterPage } from '../app/apps/Registration/SetRegisterPage'
import { SetRegisterHandInputPage } from '../app/apps/Registration/SetRegisterHandInputPage'
import DispatchRegistrationPage from '../app/apps/VehicleDispatch/DispatchRegistrationPage'
// kongchanß
import MiscellaneousInAndOutBound7 from '../app/apps/Function7/MiscellaneousInAndOutBound'
import SetMiscellaneousInAndOutBound7 from '../app/apps/Function7/SetMiscellaneousInAndOutBound'
import MiscellaneousInAndOutBound5 from '../app/apps/Function5/MiscellaneousInAndOutBound'
import SetMiscellaneousInAndOutBound5 from '../app/apps/Function5/SetMiscellaneousInAndOutBound'

const MainPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<MainPageDetail />} />
        <Route path='set-register' element={<SetRegisterPage />} />
        <Route path='set-register-hand' element={<SetRegisterHandInputPage />} />
        <Route path='dispatch/*' element={<DispatchRegistrationPage />} />
        {/* kongchan */}
        <Route path='MiscellaneousInAndOutBound7' element={<MiscellaneousInAndOutBound7 />} />
        <Route path='SetMiscellaneousInAndOutBound7' element={<SetMiscellaneousInAndOutBound7 />} />
        <Route path='MiscellaneousInAndOutBound5' element={<MiscellaneousInAndOutBound5 />} />
        <Route path='SetMiscellaneousInAndOutBound5' element={<SetMiscellaneousInAndOutBound5 />} />
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
              <button className='mockup-btn mockup-blue'>入庫</button>
              <button className='mockup-btn mockup-green'>配送伝票</button>
              <button className='mockup-btn mockup-yellow' onClick={()=> navigate('MiscellaneousInAndOutBound5')}>戻り構成</button>
              <button
                className='mockup-btn mockup-gray'
                onClick={() => navigate('set-register')}
              >
                セット登録
              </button>
              <button className='mockup-btn mockup-gray' onClick={() => navigate('MiscellaneousInAndOutBound7')}>雑入出庫</button>
              <button className='mockup-btn mockup-orange'>伝票振分</button>
              <button className='mockup-btn mockup-pink'>販売セット</button>
            </div>

            <button className='mockup-exit'>終了</button>
          </div>
        </div>
      </div>
    </div>
  )
}
