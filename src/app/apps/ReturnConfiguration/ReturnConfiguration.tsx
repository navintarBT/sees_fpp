import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import { ScaleToFit } from '../../components/ScaleToFit/ScaleToFit'

const TERMINAL_ID = 'ABCDEFGHIJ'

const ReturnConfiguration = () => {
  const navigate = useNavigate()
  const location = useLocation()
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

  return (
    <div className='mockup-page'>
      <ScaleToFit active designWidth={1920} designHeight={1200}>
      <div className='mockup-stage mockup-stage-dark mockup-stage-landscape'>
        <div className='mockup-frame'>
          <>
            <div className='set-header-landscape'>
              <span className='set-header-title'>セット戻り構成手入力</span>
              <span className='set-header-terminal-id'>端末ID：{TERMINAL_ID}</span>
            </div>
            <div className='set-body-landscape set-body-landscape-3row'>
              <div className='set-form-landscape'>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape' style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label style={{ width: 220, flexShrink: 0 }}>品目No.(親)</label>
                    <input autoFocus style={{ boxSizing: 'content-box', width: '25ch', flex: '0 0 auto' }} />
                  </div>
                  <div className='set-field-landscape' style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label style={{ width: 220, flexShrink: 0 }}>シリアル(親)</label>
                    <input style={{ boxSizing: 'content-box', width: '25ch', flex: '0 0 auto' }} />
                  </div>
                </div>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape' style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label style={{ width: 220, flexShrink: 0 }}>数量</label>
                    <input type='number' value={quantity} style={{ boxSizing: 'content-box', width: '15ch', flex: '0 0 auto', textAlign: 'right' }} onChange={(e) => setQuantity(e.target.value)} />
                  </div>
                  <div className='set-field-landscape' style={{ flex: '1 1 0', minWidth: 0 }}>
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
                  <div className='set-field-landscape' style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label style={{ width: 220, flexShrink: 0 }}>品目No.</label>
                    <input style={{ boxSizing: 'content-box', width: '25ch', flex: '0 0 auto', backgroundColor: '#fff', color: '#000' }} />
                  </div>
                  <div style={{ flex: '1 1 0', minWidth: 0 }} />
                </div>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape' style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label style={{ width: 220, flexShrink: 0 }}>ロット</label>
                    <input style={{ boxSizing: 'content-box', width: '30ch', flex: '0 0 auto', backgroundColor: '#fff', color: '#000' }} />
                  </div>
                  <div className='set-field-landscape' style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label style={{ width: 220, flexShrink: 0 }}>シリアル</label>
                    <input style={{ boxSizing: 'content-box', width: '25ch', flex: '0 0 auto', backgroundColor: '#fff', color: '#000' }} />
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
                        navigate('/factory/set-return-configuration')
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
