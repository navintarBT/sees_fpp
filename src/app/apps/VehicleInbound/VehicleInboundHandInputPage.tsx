import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import './VehicleInboundHandInputPage.css'


const VehicleInboundHandInputPage = () => {
const navigate = useNavigate()
  const [parentWarehouse, setParentWarehouse] = useState('')
  const [parentItem, setParentItem] = useState('')
  const [parentSerial, setParentSerial] = useState('1')
  const [moveStorage, setMoveStorage] = useState('')
  const [quantity, setQuantity] = useState('')
  const isEnabled = parentWarehouse && parentItem && parentSerial

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>セット構成登録手入力</div>
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
                <label>ロット状況</label>
                <select value={parentWarehouse} onChange={(e) => setParentWarehouse(e.target.value)}>
                  <option value=''></option>
                  <option value='羽田製品倉庫：W0040'>羽田製品倉庫：W0040</option>
                  <option value='羽田製品倉庫：W0041'>羽田製品倉庫：W0041</option>
                  <option value='羽田製品倉庫：W0042'>羽田製品倉庫：W0042</option>
                </select>
              </div>
              <div className='hand-row hand-row-always'>
                <label>数量</label>
                <input value={parentSerial} onChange={(e) => setParentSerial(e.target.value)} />
              </div>
              <div className='hand-row hand-row-always'>
                <label>品目No.</label>
                <input value={moveStorage} onChange={(e) => setMoveStorage(e.target.value)} readOnly={!isEnabled} />
              </div>
              <div className='hand-row hand-row-always'>
                <label>ロット</label>
                <input value={quantity} onChange={(e) => setQuantity(e.target.value)} readOnly={!isEnabled} />
              </div>
              <div className='hand-row hand-row-always'>
                <label>シリアル</label>
                <input readOnly={!isEnabled} placeholder=' ' />
              </div>
              <div className='hand-row hand-row-always'>
                <label>有効期限(yymm)</label>
                <input readOnly={!isEnabled} placeholder=' ' />
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
                onClick={() => navigate('/apps/vehicle-registration')}
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

export {VehicleInboundHandInputPage}
