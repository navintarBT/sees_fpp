import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaWifi, FaSignal } from 'react-icons/fa'
import { BsBatteryHalf } from 'react-icons/bs'
import './SetMiscellaneousInAndOutBound.css'

const SetMiscellaneousInAndOutBound = () => {
  const navigate = useNavigate()
  const [parentWarehouse, setParentWarehouse] = useState('')
  const [parentItem, setParentItem] = useState('')
  const [parentSerial, setParentSerial] = useState('')
  const [moveStorage, setMoveStorage] = useState('')
  const [quantity, setQuantity] = useState('1')

  const isEnabled = parentWarehouse && parentItem && parentSerial

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='hand-header'>手入力</div>
          <div className='hand-body'>
            <div className={`hand-form ${isEnabled ? '' : 'hand-form-disabled'}`}>
              <div className='hand-row'>
                <label>倉庫</label>
                <select value={parentWarehouse} onChange={(e) => setParentWarehouse(e.target.value)}>
                  <option value=''></option>
                  <option value='羽田製品倉庫：W0040'>羽田製品倉庫：W0040</option>
                  <option value='羽田製品倉庫：W0041'>羽田製品倉庫：W0041</option>
                  <option value='羽田製品倉庫：W0042'>羽田製品倉庫：W0042</option>
                </select>
              </div>
              <div className='hand-row'>
                <label>保管場所</label>
                <input value={parentItem} onChange={(e) => setParentItem(e.target.value)} />
              </div>
              <div className='hand-row'>
                <label>引当数</label>
                <input value={parentSerial} onChange={(e) => setParentSerial(e.target.value)} />
              </div>
              <div className='hand-row uph-nocolorbackground'>
                <label>品目No.</label>
                <input />
              </div>
              <div className='hand-row'>
                <label>ロット</label>
                <input />
              </div>
              <div className='hand-row'>
                <label>シリアル</label>
                <input />
              </div>
              <div className='hand-row lastInputDate'>
                <label>有効期限(yymm)</label>
                <input />
              </div>
            </div>

            <div className='set-actions set-actions-row'>
              <button
                className='set-btn set-danger'
                style={{ visibility: 'hidden' }}
              >
                {'\u7834\u68C4'}
              </button>
              <button className='set-btn set-primary'>{'\u8AAD\u8FBC'}</button>
              <button
                className='set-btn set-success'
                style={{ visibility: 'hidden' }}
              >
                {'\u89E3\u9664'}
              </button>
              <button
                className='set-btn set-warning'
                onClick={() => navigate('/apps/mockup/set-register')}
              >
                {'\u623B\u308B'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetMiscellaneousInAndOutBound
