import {useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {ScaleToFit} from '../../components/ScaleToFit/ScaleToFit'
import {useOrientation, orientationState} from '../../hooks/useOrientation'

const ORIENTATION_KEY = 'bundlePageOrientation'
const TERMINAL_ID = 'ABCDEFGHIJ'

const BundleHandInputPage = () => {
  const navigate = useNavigate()
  const isLandscape = useOrientation(ORIENTATION_KEY)
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
      <ScaleToFit active={isLandscape} designWidth={1920} designHeight={1200}>
      <div className={isLandscape ? 'mockup-stage mockup-stage-dark mockup-stage-landscape' : 'mockup-stage mockup-stage-dark'}>
        <div className='mockup-frame'>
          {isLandscape ? (
            <>
              <div className='set-header-landscape'>
                <span className='set-header-title'>販売セット手入力</span>
                <span className='set-header-terminal-id'>端末ID：{TERMINAL_ID}</span>
              </div>
              <div className='set-body-landscape set-body-landscape-3row'>
                <div className='set-form-landscape'>
                  <div className='set-form-landscape-row'>
                    <div className='set-field-landscape'>
                      <label style={{width: 220, flexShrink: 0}}>FR倉庫</label>
                      <select autoFocus style={{width: 635}} value={fromWarehouse} onChange={(e) => setFromWarehouse(e.target.value)}>
                        <option value=''></option>
                        <option value='羽田製品倉庫：W0040'>羽田製品倉庫：W0040</option>
                        <option value='羽田製品倉庫：W0041'>羽田製品倉庫：W0041</option>
                        <option value='羽田製品倉庫：W0042'>羽田製品倉庫：W0042</option>
                      </select>
                    </div>
                    <div className='set-field-landscape'>
                      <label style={{width: 220, flexShrink: 0}}>TO倉庫</label>
                      <select style={{width: 635}} value={toWarehouse} onChange={(e) => setToWarehouse(e.target.value)}>
                        <option value=''></option>
                        <option value='羽田製品補充倉庫：W0040'>羽田製品補充倉庫：W0040</option>
                        <option value='羽田製品補充倉庫：W0041'>羽田製品補充倉庫：W0041</option>
                        <option value='羽田製品補充倉庫：W0042'>羽田製品補充倉庫：W0042</option>
                      </select>
                    </div>
                  </div>
                  <div className='set-form-landscape-row'>
                    <div className='set-field-landscape'>
                      <label style={{width: 220, flexShrink: 0}}>保管場所</label>
                      <input style={{width: 635}} value={parentItem} onChange={(e) => setParentItem(e.target.value)} />
                    </div>
                    <div className='set-field-landscape'>
                      <label style={{width: 220, flexShrink: 0}}>数量</label>
                      <input style={{width: 635, textAlign: 'right'}} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    </div>
                  </div>
                  <div className='set-form-landscape-row'>
                    <div className='set-field-landscape'>
                      <label style={{width: 220, flexShrink: 0}}>品目No</label>
                      <input ref={itemNoInputRef} style={{width: 635}} value={moveStorage} onChange={(e) => setMoveStorage(e.target.value)} />
                    </div>
                    <div className='set-field-landscape'>
                      <label style={{width: 220, flexShrink: 0}}>ロットシリアル</label>
                      <input style={{width: 635}} value={parentSerial} onChange={(e) => setParentSerial(e.target.value)} />
                    </div>
                  </div>
                  <div className='set-form-landscape-row'>
                    <div className='set-field-landscape'>
                      <label style={{width: 220, flexShrink: 0}}>移動数</label>
                      <div style={{display: 'flex', alignItems: 'center', gap: 40, width: 635}}>
                        <label style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 25, whiteSpace: 'nowrap'}}>
                          <input
                            type='radio'
                            name='quantityRange-landscape'
                            checked={quantityRange === 'from'}
                            onChange={() => setQuantityRange('from')}
                            style={{width: 28, height: 28}}
                          />
                          From
                        </label>
                        <label style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 25, whiteSpace: 'nowrap'}}>
                          <input
                            type='radio'
                            name='quantityRange-landscape'
                            checked={quantityRange === 'to'}
                            onChange={() => setQuantityRange('to')}
                            style={{width: 28, height: 28}}
                          />
                          To
                        </label>
                      </div>
                    </div>
                    <div className='set-field-landscape'>
                      <label style={{width: 220, flexShrink: 0}}>有効日付(yymm)</label>
                      <input placeholder=' ' style={{width: 635}} />
                    </div>
                  </div>
                </div>

                <div />

                <ActionFooter columns={5} gapX={50} className='set-actionfooter-landscape-offset'>
                  <div aria-hidden='true' />
                  <div aria-hidden='true' />
                  <button
                    className='set-btn set-btn-landscape set-warning'
                    onClick={() => setShowBackConfirm(true)}
                  >
                    戻る
                  </button>
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
          ) : (
            <>
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
          </div>
            </>
          )}

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
                        navigate('/factory/bundle-page', orientationState(isLandscape))
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
