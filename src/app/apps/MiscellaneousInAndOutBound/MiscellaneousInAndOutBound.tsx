import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import { ScaleToFit } from '../../components/ScaleToFit/ScaleToFit'

const TERMINAL_ID = 'ABCDEFGHIJ'

const MiscellaneousInAndOutBound = () => {
  const navigate = useNavigate()
  const [showReadConfirm, setShowReadConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [quantity, setQuantity] = useState('1')
  const dateRef = useRef<HTMLInputElement>(null)

  return (
    <div className='mockup-page page-miscellaneous-in-and-out-bound'>
      <ScaleToFit active designWidth={1920} designHeight={1200}>
      <div className='mockup-stage mockup-stage-dark mockup-stage-landscape'>
        <div className='mockup-frame'>
          <>
            <div className='set-header-landscape'>
              <span className='set-header-title'>予定なし入出庫手入力</span>
              <span className='set-header-terminal-id'>端末ID：{TERMINAL_ID}</span>
            </div>
            <div className='set-body-landscape set-body-landscape-3row'>
              <div className='set-form-landscape'>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape set-field-fill'>
                    <label>倉庫</label>
                    <select autoFocus className='field-warehouse' style={{ appearance: 'auto' }}>
                      <option value=''></option>
                      <option value='倉庫A:W0040'>倉庫A:W0040</option>
                      <option value='倉庫B:W0041'>倉庫B:W0041</option>
                      <option value='倉庫C:W0042'>倉庫C:W0042</option>
                    </select>
                  </div>
                  <div className='set-field-landscape set-field-fill'>
                    <label>保管場所</label>
                    <input className='field-storage' />
                  </div>
                </div>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape set-field-fill'>
                    <label>引当数</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <select className='field-alloc-sign' style={{ appearance: 'auto', padding: '0 8px' }}>
                        <option value='+'>+</option>
                        <option value='-'>-</option>
                      </select>
                      <input
                        value={quantity}
                        type='number'
                        className='field-alloc-qty' style={{ textAlign: 'right' }}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className='set-field-landscape set-field-fill'>
                    <label>品目No.</label>
                    <input className='field-item-no' />
                  </div>
                </div>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape set-field-fill'>
                    <label>ロット</label>
                    <input className='field-lot' />
                  </div>
                  <div className='set-field-landscape set-field-fill'>
                    <label>シリアル</label>
                    <input className='field-serial' />
                  </div>
                </div>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape set-field-fill'>
                    <label>有効期限(yymm)</label>
                    <input type='text' ref={dateRef} className='field-expiry' />
                  </div>
                  <div style={{ flex: '1 1 0', minWidth: 0 }} />
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
                        navigate('/factory/set-miscellaneous-in-and-out-bound')
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

export { MiscellaneousInAndOutBound }
