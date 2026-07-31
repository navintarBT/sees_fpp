import {useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
const BundleHandInputPage = () => {
  const navigate = useNavigate()
  const [fromWarehouse, setFromWarehouse] = useState('')
  const [toWarehouse, setToWarehouse] = useState('')
  const [parentItem, setParentItem] = useState('')
  const [parentSerial, setParentSerial] = useState('')
  const [moveStorage, setMoveStorage] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [showReadConfirm, setShowReadConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [quantityRange, setQuantityRange] = useState<'from' | 'to'>('from')
  const itemNoInputRef = useRef<HTMLInputElement | null>(null)
  const isEnabled = fromWarehouse && toWarehouse && parentItem && parentSerial

  const handleBackNoClick = () => {
    setShowBackConfirm(false)
    setTimeout(() => {
      itemNoInputRef.current?.focus()
      itemNoInputRef.current?.select()
    }, 0)
  }

  const handleReadNoClick = () => {
    setShowReadConfirm(false)
    setTimeout(() => {
      itemNoInputRef.current?.focus()
      itemNoInputRef.current?.select()
    }, 0)
  }

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>販売セット手入力</div>
          <div className='hand-body'>
            <div className={`hand-form ${isEnabled ? '' : 'hand-form-disabled-a'}`}>
              <div className='hand-row'>
                <label>FR倉庫</label>
                <select value={fromWarehouse} onChange={(e) => setFromWarehouse(e.target.value)}>
                  <option value=''></option>
                  <option value='羽田製品倉庫：W0040'>羽田製品倉庫：W0040</option>
                  <option value='羽田製品倉庫：W0041'>羽田製品倉庫：W0041</option>
                  <option value='羽田製品倉庫：W0042'>羽田製品倉庫：W0042</option>
                </select>
              </div>
              <div className='hand-row'>
                <label>TO倉庫</label>
                <select value={toWarehouse} onChange={(e) => setToWarehouse(e.target.value)}>
                  <option value=''></option>
                  <option value='羽田製品補充倉庫：W0040'>羽田製品補充倉庫：W0040</option>
                  <option value='羽田製品補充倉庫：W0041'>羽田製品補充倉庫：W0041</option>
                  <option value='羽田製品補充倉庫：W0042'>羽田製品補充倉庫：W0042</option>
                </select>
              </div>
              <div className='hand-row'>
                <label>保管場所</label>
                <input value={parentItem} onChange={(e) => setParentItem(e.target.value)} />
              </div>
              <div className='hand-row'>
                <label>数量</label>
                <input value={quantity}  onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div className='hand-row'>
                <label>品目No</label>
                <input ref={itemNoInputRef} value={moveStorage} onChange={(e) => setMoveStorage(e.target.value)} />
              </div>
              <div className='hand-row hand-row-always'>
                <label>ロットシリアル</label>
                <input value={parentSerial} onChange={(e) => setParentSerial(e.target.value)} />
              </div>
              <div className='set-row'>
              <div className='set-radio-group bundle-group'>
                  <label className='set-radio'>
                    <input
                      type='radio'
                      name='quantityRange'
                      value='from'
                      checked={quantityRange === 'from'}
                      onChange={() => setQuantityRange('from')}
                    />
                    From
                  </label>
                  <label className='set-radio'>
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
              <div className='hand-row hand-row-always'>
                <label>有効日付(yymm)</label>
                <input placeholder=' ' />
              </div>
            </div>
            <ActionFooter columns={4}>
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
                  <div className='set-modal-body'>{'\u5165\u529b\u5185\u5bb9\u3067\u8aad\u8fbc\u3092\n\u5b8c\u4e86\u3057\u307e\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => setShowReadConfirm(false)}
                    >
                      YES
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={handleReadNoClick}
                    >
                      NO
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showBackConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>{'\u624b\u5165\u529b\u30c0\u30a4\u30a2\u30ed\u30b0\u3092\n\u9589\u3058\u307e\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory/bundle-page')
                      }}
                    >
                      YES
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={handleBackNoClick}
                    >
                      NO
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

export {BundleHandInputPage}
