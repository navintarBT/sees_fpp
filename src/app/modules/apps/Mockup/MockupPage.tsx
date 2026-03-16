import {Route, Routes, Outlet, Navigate, useNavigate} from 'react-router-dom'
import './MockupPage.scss'
import {SetRegisterPage} from './SetRegisterPage'
import {SetRegisterHandInputPage} from './SetRegisterHandInputPage'
import {FaWifi, FaSignal} from "react-icons/fa"
import {BsBatteryHalf} from "react-icons/bs"

const MockupPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path='mockups' element={<MockupMain />} />
        <Route path='set-register' element={<SetRegisterPage />} />
        <Route path='set-register-hand' element={<SetRegisterHandInputPage />} />
      </Route>
      <Route index element={<Navigate to='/apps/mockup/mockups' />} />
    </Routes>
  )
}

export default MockupPage

const MockupMain = () => {
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
              <button className='mockup-btn mockup-red'>出庫</button>
              <button className='mockup-btn mockup-blue'>入庫</button>
              <button className='mockup-btn mockup-green'>配送伝票</button>
              <button className='mockup-btn mockup-yellow'>戻り構成</button>
              <button
                className='mockup-btn mockup-gray'
                onClick={() => navigate('/apps/mockup/set-register')}
              >
                セット登録
              </button>
              <button className='mockup-btn mockup-gray'>雑入出庫</button>
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
