import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'

const MiscellaneousInAndOutBound = () => {
  const navigate = useNavigate()
  const [parentWarehouse, setParentWarehouse] = useState('')
  const [parentItem, setParentItem] = useState('')
  const [parentSerial, setParentSerial] = useState('')
  const [showReadConfirm, setShowReadConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const isEnabled = parentWarehouse && parentItem && parentSerial
  const [quantity, setQuantity] = useState('1')

  const warehouseRef = useRef<HTMLSelectElement>(null)
  const locationRef = useRef<HTMLInputElement>(null)
  const qtyRef = useRef<HTMLInputElement>(null)
  const itemNoRef = useRef<HTMLInputElement>(null)
  const lotRef = useRef<HTMLInputElement>(null)
  const serialRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, nextRef: React.RefObject<HTMLElement | null>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      nextRef.current?.focus()
    }
  }

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>予定なし入出庫登録手入力</div>
          <div className='hand-body'>
            <div className={`hand-form ${isEnabled ? '' : 'hand-form-disabled'}`}>
              <div className='hand-row'>
                <label>倉庫</label>
                <select defaultValue='倉庫A:W0040' ref={warehouseRef} onKeyDown={(e) => handleKeyDown(e, locationRef)}>
                  <option value=''></option>
                  <option value='倉庫A:W0040'>倉庫A:W0040</option>
                  <option value='倉庫B:W0041'>倉庫B:W0041</option>
                  <option value='倉庫C:W0042'>倉庫C:W0042</option>
                </select>
              </div>
              <div className='hand-row'>
                <label>保管場所</label>
                <input autoFocus placeholder=' ' ref={locationRef} onKeyDown={(e) => handleKeyDown(e, qtyRef)} />
              </div>
              <div className='hand-row'>
                <label >引当数</label>
                <div className='pg-sign-group'>
                  <select className='pg-sign-select' style={{ backgroundColor: 'transparent' }} >
                    <option value='+'>+</option>
                    <option value='-'>-</option>
                  </select>
                  <input value={quantity}
                    ref={qtyRef}
                    onKeyDown={(e) => handleKeyDown(e, itemNoRef)}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div className='hand-row'>
                <label>品目No.</label>
                <input style={{ backgroundColor: 'transparent' }} ref={itemNoRef} onKeyDown={(e) => handleKeyDown(e, lotRef)} />
              </div>

              <div className='hand-row'>
                <label>ロット</label>
                <input value={parentSerial} onChange={(e) => setParentSerial(e.target.value)} style={{ backgroundColor: 'transparent' }} ref={lotRef} onKeyDown={(e) => handleKeyDown(e, serialRef)} />
              </div>
              <div className='hand-row'>
                <label>シリアル</label>
                <input style={{ backgroundColor: 'transparent' }} ref={serialRef} onKeyDown={(e) => handleKeyDown(e, dateRef)} />
              </div>
              <div className='hand-row' >
                <label>有効期限(yymm)</label>
                <div className='hand-date-field'>
                  <input
                    type='text'
                    ref={dateRef}
                    style={{ backgroundColor: 'transparent', cursor: 'pointer', width: '100%' }}
                  />
                </div>
              </div>
            </div>

            <ActionFooter columns={5}>
              <button
                className='set-btn set-danger'
                style={{ visibility: 'hidden' }}
              >
                {'\u7834\u68C4'}
              </button>
              <button className='set-btn set-primary' onClick={() => setShowReadConfirm(true)}>{'\u8AAD\u8FBC'}</button>
              <button
                className='set-btn set-success'
                style={{ visibility: 'hidden' }}
              >
                {'\u89E3\u9664'}
              </button>
              <button
                className='set-btn set-primary'
                style={{ visibility: 'hidden' }}
              >
                {'\u624b\u5165\u529b'}
              </button>
              <button
                className='set-btn set-warning'
                onClick={() => setShowBackConfirm(true)}
              >
                {'\u623B\u308B'}
              </button>
            </ActionFooter>

            {showReadConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>{'\u5165\u529b\u5185\u5bb9\u3067\u8aad\u8fbc\u3092'}<br />{'\u5b8c\u4e86\u3057\u307e\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => setShowReadConfirm(false)}
                    >
                      {'\u306f\u3044'}
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowReadConfirm(false)}
                    >
                      {'\u3044\u3044\u3048'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showBackConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>{'\u624b\u5165\u529b\u30c0\u30a4\u30a2\u30ed\u30b0\u3092'}<br />{'\u9589\u3058\u307e\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory/set-miscellaneous-in-and-out-bound')
                      }}
                    >
                      {'\u306f\u3044'}
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
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

export { MiscellaneousInAndOutBound }
