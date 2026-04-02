import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import './Equipment_Distribution_Manual.css'

const SetRegisterHandInputPage = () => {
  const navigate = useNavigate()
  const [parentWarehouse, setParentWarehouse] = useState('')
  const [toWarehouse, setToWarehouse] = useState('')
  const [parentItem, setParentItem] = useState('')
  const [parentSerial, setParentSerial] = useState('')
  const [moveStorage, setMoveStorage] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [expirationDate, setExpirationDate] = useState('')
  const [showReadConfirm, setShowReadConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [quantityRange, setQuantityRange] = useState<'from' | 'to'>('from')
    const [form, setForm] = useState({
      parentWarehouse: '羽田製品倉庫：W0040',
      parentItemNo: '0193090',
      moveWarehouse: '千葉倉庫（WMS）：W002',
      moveStorage: '',
      qty: '1',
      janCode: '',
    })

  const isEnabled = parentWarehouse && parentItem && parentSerial

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='hand-header-eq-mn'>備品振分手入力</div>
          <div className='hand-body-eq-mn'>
            <div className={`hand-form-eq-mn ${isEnabled ? '' : 'hand-form-disabled-eq-mn'}`}>
              <div className='hand-row-eq-mn'>
                <label> FR倉庫 </label>
                <select value={toWarehouse} onChange={(e) => setToWarehouse(e.target.value)}>
                  <option value=''></option>
                  <option value='羽田製品倉庫：W0040'>羽田製品倉庫：W0040</option>
                  <option value='羽田製品倉庫：W0041'>羽田製品倉庫：W0041</option>
                  <option value='羽田製品倉庫：W0042'>羽田製品倉庫：W0042</option>
                </select>
              </div>
                  <div className='hand-row-eq-mn'>
                <label> TO倉庫 </label>
                <select value={parentWarehouse} onChange={(e) => setParentWarehouse(e.target.value)}>
                  <option value=''></option>
                  <option value='羽田製品倉庫：W0040'>羽田製品倉庫：W0040</option>
                  <option value='羽田製品倉庫：W0041'>羽田製品倉庫：W0041</option>
                  <option value='羽田製品倉庫：W0042'>羽田製品倉庫：W0042</option>
                </select>
              </div>
                
              <div className='hand-row-eq-mn'>
                <label> 保管場所 </label>
                <input value={moveStorage} onChange={(e) => setMoveStorage(e.target.value)} />
              </div>
                     <div className='hand-row-eq-mn equipment-distribution-manual__clear-input-row-eq-mn'>
                <label> 数量 </label>
                <input value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
                          <div className='hand-row-eq-mn equipment-distribution-manual__clear-input-row-eq-mn'>
                <label> 品目No. </label>
                <input value={parentSerial} onChange={(e) => setParentSerial(e.target.value)} />
              </div>
                  <div className='hand-row-eq-mn equipment-distribution-manual__clear-input-row-eq-mn'>
                <label> ロットシリアル </label>
                <input value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
              </div>
              
       <div className='set-radio-group-eq-mn bundle-group-eq-mn equipment-distribution-manual__quantity-range-eq-mn'>
                  <label className='set-radio-eq-mn center-eq-mn'>
                    
                    <input
                      type='radio'
                      name='quantityRange'
                      value='from'
                      checked={quantityRange === 'from'}
                      onChange={() => setQuantityRange('from')}
                    />
                    From
                  </label>
                  <label className='set-radio-eq-mn'>
                    <input
                      type='radio'
                      name='quantityRange'
                      value='to'
                      checked={quantityRange === 'to'}
                      onChange={() => setQuantityRange('to')}
                    />
                    To
                  </label>
                </div>
    
            </div>
            <div className='hand-row-eq-mn'>
                <label> 有効日付(yymm)  </label>
                <input value={parentItem} onChange={(e) => setParentItem(e.target.value)} />
              </div>
            <div className='set-actions-eq-mn set-actions-row-eq-mn'>
              <button
                className='set-btn-eq-mn set-danger-eq-mn'
                style={{ visibility: 'hidden' }}
              >
                {'\u7834\u68C4'}
              </button>
              <button className='set-btn-eq-mn set-primary-eq-mn' onClick={() => setShowReadConfirm(true)}>{'\u8AAD\u8FBC'}</button>
              <button
                className='set-btn-eq-mn set-success-eq-mn'
                style={{ visibility: 'hidden' }}
              >
                {'\u89E3\u9664'}
              </button>
              <button
                className='set-btn-eq-mn set-warning-eq-mn'
                onClick={() => setShowBackConfirm(true)}
              >
                {'\u623B\u308B'}
              </button>
            </div>

            {showReadConfirm && (
              <div className='set-modal-backdrop-eq-mn' role='presentation'>
                <div className='set-modal-eq-mn' role='dialog' aria-modal='true'>
                  <div className='set-modal-header-eq-mn'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body-eq-mn'>{'\u5165\u529b\u5185\u5bb9\u3067\u8aad\u8fbc\u3092'}<br />{'\u5b8c\u4e86\u3057\u307e\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions-eq-mn'>
                    <button
                      className='set-modal-btn-eq-mn set-modal-yes-eq-mn'
                      onClick={() => setShowReadConfirm(false)}
                    >
                      {'\u306f\u3044'}
                    </button>
                    <button
                      className='set-modal-btn-eq-mn set-modal-no-eq-mn'
                      onClick={() => setShowReadConfirm(false)}
                    >
                      {'\u3044\u3044\u3048'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showBackConfirm && (
              <div className='set-modal-backdrop-eq-mn' role='presentation'>
                <div className='set-modal-eq-mn' role='dialog' aria-modal='true'>
                  <div className='set-modal-header-eq-mn'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body-eq-mn'>{'\u624b\u5165\u529b\u30c0\u30a4\u30a2\u30ed\u30b0\u3092'}<br />{'\u9589\u3058\u307e\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions-eq-mn'>
                    <button
                      className='set-modal-btn-eq-mn set-modal-yes-eq-mn'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory/equipment-distribution')
                      }}
                    >
                      {'\u306f\u3044'}
                    </button>
                    <button
                      className='set-modal-btn-eq-mn set-modal-no-eq-mn'
                      onClick={() => setShowBackConfirm(false)}
                    >
                      {'\u3044\u3044\u3048'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export {SetRegisterHandInputPage}