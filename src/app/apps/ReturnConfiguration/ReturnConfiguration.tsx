import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import { ScaleToFit } from '../../components/ScaleToFit/ScaleToFit'
import { useOrientation, orientationState } from '../../hooks/useOrientation'

const ORIENTATION_KEY = 'returnConfigurationOrientation'
const TERMINAL_ID = 'ABCDEFGHIJ'

const ReturnConfiguration = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isLandscape = useOrientation(ORIENTATION_KEY)
  const [parentWarehouse, setParentWarehouse] = useState('')
  const [parentItem, setParentItem] = useState('')
  const [parentSerial, setParentSerial] = useState('')
  const [moveStorage, setMoveStorage] = useState('')

  useEffect(() => {
    const state = location.state as { parentItemNo?: string } | null
    if (state?.parentItemNo) {
      setMoveStorage(state.parentItemNo)
    }
  }, [location.state])
  const [quantity, setQuantity] = useState('1')
  const [showReadConfirm, setShowReadConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [qty, setQty] = useState(1);
  const isEnabled = parentWarehouse && parentItem && parentSerial

  return (
    <div className='mockup-page'>
      <ScaleToFit active={isLandscape} designWidth={1920} designHeight={1200}>
      <div className={isLandscape ? 'mockup-stage mockup-stage-dark mockup-stage-landscape' : 'mockup-stage mockup-stage-dark'}>
        <div className='mockup-frame'>
          {isLandscape ? (
            <>
              <div className='set-header-landscape'>
                <span className='set-header-title'>セット戻り構成手入力</span>
                <span className='set-header-terminal-id'>端末ID：{TERMINAL_ID}</span>
              </div>
              <div className='set-body-landscape set-body-landscape-3row'>
                <div className='set-form-landscape'>
                  <div className='set-form-landscape-row'>
                    <div className='set-field-landscape'>
                      <label style={{ width: 220, flexShrink: 0 }}>品目No.(親)</label>
                      <input autoFocus style={{ width: 635 }} />
                    </div>
                    <div className='set-field-landscape'>
                      <label style={{ width: 220, flexShrink: 0 }}>シリアル(親)</label>
                      <input style={{ width: 635 }} />
                    </div>
                  </div>
                  <div className='set-form-landscape-row'>
                    <div className='set-field-landscape'>
                      <label style={{ width: 220, flexShrink: 0 }}>数量</label>
                      <input type='number' style={{ width: 635, textAlign: 'right' }} onChange={(e) => setQuantity(e.target.value)} />
                    </div>
                    <div className='set-field-landscape'>
                      <label style={{ width: 220, flexShrink: 0 }}>状態</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 25, whiteSpace: 'nowrap' }}>
                          <input
                            type='radio'
                            name='status-landscape'
                            checked={qty === 1}
                            onChange={() => setQty(1)}
                            style={{ width: 28, height: 28 }}
                          />
                          正常
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 25, whiteSpace: 'nowrap' }}>
                          <input
                            type='radio'
                            name='status-landscape'
                            checked={qty === 2}
                            onChange={() => setQty(2)}
                            style={{ width: 28, height: 28 }}
                          />
                          調査中
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className='set-form-landscape-row'>
                    <div className='set-field-landscape'>
                      <label style={{ width: 220, flexShrink: 0 }}>品目No.</label>
                      <input style={{ width: 635, backgroundColor: '#fff', color: '#000' }} />
                    </div>
                    <div className='set-field-landscape'>
                      <label style={{ width: 220, flexShrink: 0 }}>ロット</label>
                      <input style={{ width: 635, backgroundColor: '#fff', color: '#000' }} />
                    </div>
                  </div>
                  <div className='set-form-landscape-row'>
                    <div className='set-field-landscape'>
                      <label style={{ width: 220, flexShrink: 0 }}>シリアル</label>
                      <input style={{ width: 635, backgroundColor: '#fff', color: '#000' }} />
                    </div>
                  </div>
                </div>

                <div />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
                  <button
                    className='set-btn set-btn-landscape set-warning'
                    style={{ width: 280 }}
                    onClick={() => setShowBackConfirm(true)}
                  >
                    戻る
                  </button>
                  <button
                    className='set-btn set-btn-landscape set-primary'
                    style={{ width: 280 }}
                    onClick={() => setShowReadConfirm(true)}
                  >
                    読込
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
          <div className='set-header'>セット戻り構成手入力</div>
          <div className='hand-body'>
            <div className={`hand-form ${isEnabled ? '' : 'hand-form-disabled'}`}>
              <div className='set-row'>
                <label>品目No.(親)</label>
                <input  autoFocus />
              </div>
              <div className='set-row'>
                <label>シリアル(親)</label>
                <input  />
              </div>
              <div className='set-row'>
                <label >数量</label>
                <input type='number' 
                    onChange={(e) => setQuantity(e.target.value)}
                />
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
                      style={{ marginLeft: '25px' }}
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
              <div className='set-row'>
                <label>品目No.</label>
                <input style={{ backgroundColor: '#fff', color: '#000' }} />
              </div>
              <div className='set-row'>
                <label>ロット</label>
                <input style={{ backgroundColor: '#fff', color: '#000' }} />
              </div>
              <div className='set-row' >
                <label >シリアル</label>
                <input style={{ backgroundColor: '#fff', color: '#000' }} />
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
                      onClick={() => {
                        setShowReadConfirm(false)
                      }}
                    >
                      YES
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowReadConfirm(false)}
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
                        navigate('/factory/set-return-configuration', orientationState(isLandscape))
                      }}
                    >
                      YES
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowBackConfirm(false)}
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
    </div >
  )
}

export { ReturnConfiguration }
