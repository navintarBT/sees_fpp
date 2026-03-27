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
  const [qty, setQty] = useState(1);

  const isEnabled = parentWarehouse && parentItem && parentSerial

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='hand-header'>手入力</div>
          <div className='hand-body'>
            <div className={`hand-form ${isEnabled ? '' : 'hand-form-disabled'}`}>
              <div className='rlr-row'>
                <label>品目No.(親)</label>
                <input  />
              </div>
              <div className='rlr-row'>
                <label>シリアル(親)</label>
                <input value={parentItem} onChange={(e) => setParentItem(e.target.value)} />
              </div>
              <div className='rlr-row'>
                <label>数量</label>
                <input />
              </div>
              <div className='rlr-row2'>
                <label>状態</label>
                <div className="rlr-qty-group badioBtnFun10">
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="中"
                      checked={qty === 1}
                      onChange={() => setQty(1)}
                    />
                    正常
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="済"
                      checked={qty === 2}
                      onChange={() => setQty(2)}
                    />
                    調査中
                  </label>
                </div>
              </div>
              <div className='rlr-row'>
                <label>品目No.</label>
                <input />
              </div>
              <div className='rlr-row'>
                <label>ロット</label>
                <input />
              </div>
              <div className='rlr-row'>
                <label>シリアル</label>
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
