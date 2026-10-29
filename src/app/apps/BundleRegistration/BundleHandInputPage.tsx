import {useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {ScaleToFit} from '../../components/ScaleToFit/ScaleToFit'

const TERMINAL_ID = 'ABCDEFGHIJ'

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
    <div className='mockup-page page-bundle-hand-input'>
      <ScaleToFit active designWidth={1920} designHeight={1200}>
      <div className='mockup-stage mockup-stage-dark mockup-stage-landscape'>
        <div className='mockup-frame'>
          <>
            <div className='set-header-landscape'>
              <span className='set-header-title'>販売セット登録手入力</span>
              <span className='set-header-terminal-id'>端末ID：{TERMINAL_ID}</span>
            </div>
            <div className='set-body-landscape set-body-landscape-3row'>
              <div className='set-form-landscape'>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape set-field-fill'>
                    <label>FR倉庫</label>
                    <select autoFocus className='field-from-warehouse' value={fromWarehouse} onChange={(e) => setFromWarehouse(e.target.value)}>
                      <option value=''></option>
                      <option value='羽田製品倉庫：W0040'>羽田製品倉庫：W0040</option>
                      <option value='羽田製品倉庫：W0041'>羽田製品倉庫：W0041</option>
                      <option value='羽田製品倉庫：W0042'>羽田製品倉庫：W0042</option>
                    </select>
                  </div>
                  <div className='set-field-landscape set-field-fill'>
                    <label>TO倉庫</label>
                    <select className='field-to-warehouse' value={toWarehouse} onChange={(e) => setToWarehouse(e.target.value)}>
                      <option value=''></option>
                      <option value='羽田製品補充倉庫：W0040'>羽田製品補充倉庫：W0040</option>
                      <option value='羽田製品補充倉庫：W0041'>羽田製品補充倉庫：W0041</option>
                      <option value='羽田製品補充倉庫：W0042'>羽田製品補充倉庫：W0042</option>
                    </select>
                  </div>
                </div>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape set-field-fill'>
                    <label>保管場所</label>
                    <input className='field-storage' value={parentItem} onChange={(e) => setParentItem(e.target.value)} />
                  </div>
                  <div className='set-field-landscape set-field-fill'>
                    <label>数量</label>
                    <input className='field-qty' style={{textAlign: 'right'}} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                  </div>
                </div>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape set-field-fill'>
                    <label>品目No.</label>
                    <input ref={itemNoInputRef} className='field-item-no' value={moveStorage} onChange={(e) => setMoveStorage(e.target.value)} />
                  </div>
                  <div className='set-field-landscape set-field-fill'>
                    <label>ロットシリアル</label>
                    <input className='field-lot-serial' value={parentSerial} onChange={(e) => setParentSerial(e.target.value)} />
                  </div>
                </div>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape set-field-fill'>
                    <div style={{display: 'flex', alignItems: 'center', gap: 40, paddingLeft: 240}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 25, whiteSpace: 'nowrap'}}>
                        <input
                          type='radio'
                          name='quantityRange-landscape'
                          checked={quantityRange === 'from'}
                          onChange={() => setQuantityRange('from')}
                          className='field-radio'
                        />
                        From
                      </label>
                      <label style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 25, whiteSpace: 'nowrap'}}>
                        <input
                          type='radio'
                          name='quantityRange-landscape'
                          checked={quantityRange === 'to'}
                          onChange={() => setQuantityRange('to')}
                          className='field-radio'
                        />
                        To
                      </label>
                    </div>
                  </div>
                  <div className='set-field-landscape set-field-fill'>
                    <label>有効日付(yymm)</label>
                    <input placeholder=' ' className='field-expiry' />
                  </div>
                </div>
              </div>

              <div />

              <ActionFooter columns={5} gapX={50} className='set-actionfooter-landscape-offset'>
                <button
                  className='set-btn set-btn-landscape set-success'
                  onClick={() => setShowBackConfirm(true)}
                >
                  戻る
                </button>
                <div aria-hidden='true' />
                <div aria-hidden='true' />
                <div aria-hidden='true' />
                <button
                  className='set-btn set-btn-landscape set-primary'
                  onClick={() => setShowReadConfirm(true)}
                >
                  読込
                </button>
              </ActionFooter>
            </div>
          </>

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
      </ScaleToFit>
    </div>
  )
}

export {BundleHandInputPage}
