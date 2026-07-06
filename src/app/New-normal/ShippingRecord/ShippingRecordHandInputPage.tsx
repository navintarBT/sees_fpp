import {useEffect, useRef, useState} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'

const ShippingRecordHandInputPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as {moveWarehouse?: string; moveStorage?: string} | null

  const [warehouse, setWarehouse] = useState(state?.moveWarehouse ?? 'A倉庫')
  const [storage, setStorage] = useState(state?.moveStorage ?? '')
  const [qty, setQty] = useState('1')
  const [itemNo, setItemNo] = useState('')
  const [lotSerial, setLotSerial] = useState('')
  const [expiry, setExpiry] = useState('')

  const itemNoRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    itemNoRef.current?.focus()
  }, [])

  const [showItemNoConfirm, setShowItemNoConfirm] = useState(false)
  const [showLotSerialConfirm, setShowLotSerialConfirm] = useState(false)
  const [showExpiryConfirm, setShowExpiryConfirm] = useState(false)
  const [showReadConfirm, setShowReadConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const handleRead = () => {
    if (!itemNo.trim()) {
      setShowItemNoConfirm(true)
      return
    }
    if (!lotSerial.trim()) {
      setShowLotSerialConfirm(true)
      return
    }
    if (expiry.trim() && !/^\d{4}$/.test(expiry.trim())) {
      setShowExpiryConfirm(true)
      return
    }
    setShowReadConfirm(true)
  }

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>出庫実績登録手入力</div>
          <div className='hand-body'>
              <div className='hand-row'>
                <label>倉庫／工場</label>
                <select
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  style={{textAlign: 'center'}}
                >
                  <option value='A倉庫'>A倉庫</option>
                  <option value='B倉庫'>B倉庫</option>
                  <option value='C工場'>C工場</option>
                  <option value='D工場'>D工場</option>
                </select>
              </div>
              <div className='hand-row'>
                <label>保管場所</label>
                <input value={storage} onChange={(e) => setStorage(e.target.value)} style={{textAlign: 'center'}} />
              </div>
              <div className='hand-row'>
                <label>数量</label>
                <input value={qty} onChange={(e) => setQty(e.target.value)} style={{textAlign: 'center'}} />
              </div>
              <div className='hand-row'>
                <label>品目No.</label>
                <input ref={itemNoRef} value={itemNo} onChange={(e) => setItemNo(e.target.value)} style={{textAlign: 'center'}} />
              </div>
              <div className='hand-row'>
                <label>ロットシリアル</label>
                <input value={lotSerial} onChange={(e) => setLotSerial(e.target.value)} style={{textAlign: 'center'}} />
              </div>
              <div className='hand-row'>
                <label>有効期限(yymm)</label>
                <input value={expiry} onChange={(e) => setExpiry(e.target.value)} style={{textAlign: 'center'}} />
              </div>

            <ActionFooter columns={4}>
              <button
                className='set-btn set-danger'
                style={{ visibility: 'hidden' }}
              >
                破棄
              </button>
              <button className='set-btn set-primary' onClick={handleRead}>読込</button>
              <button
                className='set-btn set-success'
                style={{ visibility: 'hidden' }}
              >
                解除
              </button>
              <button
                className='set-btn set-success'
                onClick={() => setShowBackConfirm(true)}
              >
                戻る
              </button>
            </ActionFooter>

            {showItemNoConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>品目No.を入力してください。</div>
                  <div className='set-modal-actions'>
                    <button className='set-modal-btn set-modal-yes' onClick={() => setShowItemNoConfirm(false)}>
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showLotSerialConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>ロットシリアルを入力してください。</div>
                  <div className='set-modal-actions'>
                    <button className='set-modal-btn set-modal-yes' onClick={() => setShowLotSerialConfirm(false)}>
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showExpiryConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>有効期限が不正です。</div>
                  <div className='set-modal-actions'>
                    <button className='set-modal-btn set-modal-yes' onClick={() => setShowExpiryConfirm(false)}>
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showReadConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>{'入力内容で読込を\n完了しますか？'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowReadConfirm(false)
                        sessionStorage.setItem(
                          'shipping-hand-input-result',
                          JSON.stringify({itemNo, lotSerial, qty, storage}),
                        )
                        navigate('/factory/shipping-records')
                      }}
                    >
                      はい
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowReadConfirm(false)}
                    >
                      いいえ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showBackConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>{'手入力ダイアログを\n閉じますか？'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory/shipping-records')
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
      </div>
    </div>
  )
}

export {ShippingRecordHandInputPage}
