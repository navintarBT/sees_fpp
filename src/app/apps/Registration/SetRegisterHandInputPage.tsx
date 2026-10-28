import {useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {ScaleToFit} from '../../components/ScaleToFit/ScaleToFit'

const TERMINAL_ID = 'ABCDEFGHIJ'

const SetRegisterHandInputPage = () => {
  const navigate = useNavigate()
  const [parentWarehouse, setParentWarehouse] = useState('')
  const [parentItem, setParentItem] = useState('')
  const [parentSerial, setParentSerial] = useState('')
  const [moveStorage, setMoveStorage] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [showReadConfirm, setShowReadConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const itemNoInputRef = useRef<HTMLInputElement | null>(null)

  const handleNoClick = (closeModal: () => void) => {
    closeModal()
    setTimeout(() => {
      itemNoInputRef.current?.focus()
      itemNoInputRef.current?.select()
    }, 0)
  }

  return (
    <div className='mockup-page'>
      <ScaleToFit active designWidth={1920} designHeight={1200}>
      <div className='mockup-stage mockup-stage-dark mockup-stage-landscape'>
        <div className='mockup-frame'>
          <>
            <div className='set-header-landscape'>
              <span className='set-header-title'>セット構成手入力</span>
              <span className='set-header-terminal-id'>端末ID：{TERMINAL_ID}</span>
            </div>
            <div className='set-body-landscape set-body-landscape-3row'>
              <div className='set-form-landscape'>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                    <label style={{width: 210, flexShrink: 0}}>倉庫（親）</label>
                    <select autoFocus style={{boxSizing: 'content-box', width: 'calc(42ch + 30px)', flex: '0 0 auto'}} value={parentWarehouse} onChange={(e) => setParentWarehouse(e.target.value)}>
                      <option value=''></option>
                      <option value='羽田製品倉庫：W0040'>羽田製品倉庫：W0040</option>
                      <option value='羽田製品倉庫：W0041'>羽田製品倉庫：W0041</option>
                      <option value='羽田製品倉庫：W0042'>羽田製品倉庫：W0042</option>
                    </select>
                  </div>
                  <div style={{flex: '1 1 0', minWidth: 0}} />
                </div>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                    <label style={{width: 210, flexShrink: 0}}>品目No.(親)</label>
                    <input style={{boxSizing: 'content-box', width: '25ch', flex: '0 0 auto'}} value={parentItem} onChange={(e) => setParentItem(e.target.value)} />
                  </div>
                  <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                    <label style={{width: 210, flexShrink: 0}}>シリアル(親)</label>
                    <input style={{boxSizing: 'content-box', width: '25ch', flex: '0 0 auto'}} value={parentSerial} onChange={(e) => setParentSerial(e.target.value)} />
                  </div>
                </div>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                    <label style={{width: 210, flexShrink: 0}}>移動倉庫</label>
                    <select style={{boxSizing: 'content-box', width: 'calc(42ch + 30px)', flex: '0 0 auto'}}>
                      <option value=''></option>
                      <option>千葉倉庫（WMS）：W002</option>
                      <option>千葉倉庫（WMS）：W003</option>
                      <option>千葉倉庫（WMS）：W004</option>
                    </select>
                  </div>
                  <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                    <label style={{width: 210, flexShrink: 0}}>移動保管場所</label>
                    <input style={{boxSizing: 'content-box', width: '20ch', flex: '0 0 auto'}} value={moveStorage} onChange={(e) => setMoveStorage(e.target.value)} />
                  </div>
                </div>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                    <label style={{width: 210, flexShrink: 0}}>数量</label>
                    <input style={{boxSizing: 'content-box', width: '15ch', flex: '0 0 auto', textAlign: 'right'}} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                  </div>
                  <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                    <label style={{width: 210, flexShrink: 0}}>品目No.</label>
                    <input ref={itemNoInputRef} placeholder=' ' style={{boxSizing: 'content-box', width: '25ch', flex: '0 0 auto'}} />
                  </div>
                </div>
                <div className='set-form-landscape-row'>
                  <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                    <label style={{width: 210, flexShrink: 0}}>ロット</label>
                    <input placeholder=' ' style={{boxSizing: 'content-box', width: '30ch', flex: '0 0 auto'}} />
                  </div>
                  <div className='set-field-landscape' style={{flex: '1 1 0', minWidth: 0}}>
                    <label style={{width: 210, flexShrink: 0}}>シリアル</label>
                    <input placeholder=' ' style={{boxSizing: 'content-box', width: '25ch', flex: '0 0 auto'}} />
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
                      onClick={() => handleNoClick(() => setShowReadConfirm(false))}
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
                        navigate('/factory/set-register')
                      }}
                    >
                      YES
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => handleNoClick(() => setShowBackConfirm(false))}
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

export {SetRegisterHandInputPage}
