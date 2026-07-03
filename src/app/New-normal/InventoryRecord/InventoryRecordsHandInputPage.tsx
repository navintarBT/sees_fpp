import {useEffect, useRef, useState} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'

const WAREHOUSE_BY_ORDER: Record<string, string> = {
  '12345678': 'A倉庫',
  'OT-12345678': 'C事業所',
  'MB-12345678123456': 'D事業所',
}

const InventoryRecordsHandInputPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const orderNo = (location.state as {orderNo?: string} | null)?.orderNo ?? ''
  const isMB = orderNo === 'MB-12345678123456'

  const defaultWarehouse = WAREHOUSE_BY_ORDER[orderNo] ?? 'A倉庫'

  const [warehouse, setWarehouse] = useState(defaultWarehouse)
  const [moveStorage, setMoveStorage] = useState('')
  const [qty, setQty] = useState('1')
  const [itemNo, setItemNo] = useState('')
  const [lot, setLot] = useState('')
  const [serial, setSerial] = useState('')
  const [expiry, setExpiry] = useState('')

  const [showItemNoConfirm, setShowItemNoConfirm] = useState(false)
  const [showLotSerialConfirm, setShowLotSerialConfirm] = useState(false)
  const [showExpiryConfirm, setShowExpiryConfirm] = useState(false)
  const [showReadConfirm, setShowReadConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const moveStorageRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    moveStorageRef.current?.focus()
  }, [])

  const handleRead = () => {
    if (!itemNo.trim()) {
      setShowItemNoConfirm(true)
      return
    }
    if (!isMB && !lot.trim() && !serial.trim()) {
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
          <div className='set-header'>入庫実績登録手入力</div>
          <div className='hand-body'>
            <div className='hand-row'>
              <label>倉庫</label>
              <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} style={{textAlign: 'center'}}>
                <option value='A倉庫'>A倉庫</option>
                <option value='B倉庫'>B倉庫</option>
                <option value='C事業所'>C事業所</option>
                <option value='D事業所'>D事業所</option>
              </select>
            </div>
            <div className='hand-row'>
              <label>保管場所</label>
              <input
                ref={moveStorageRef}
                value={moveStorage}
                onChange={(e) => setMoveStorage(e.target.value)}
                style={{textAlign: 'center'}}
              />
            </div>
            <div className='hand-row'>
              <label>ロット状況</label>
              <select disabled style={{textAlign: 'center'}}>
                <option value=''></option>
                <option value='検査中'>検査中</option>
              </select>
            </div>
            <div className='hand-row'>
              <label>数量</label>
              <input value={qty} onChange={(e) => setQty(e.target.value)} style={{textAlign: 'center'}} />
            </div>
            <div className='hand-row'>
              <label>品目No.</label>
              <input value={itemNo} onChange={(e) => setItemNo(e.target.value)} style={{textAlign: 'center'}} />
            </div>
            <div className='hand-row'>
              <label>ロット</label>
              <input
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                disabled={isMB}
                style={{textAlign: 'center'}}
              />
            </div>
            <div className='hand-row'>
              <label>シリアル</label>
              <input
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                disabled={isMB}
                style={{textAlign: 'center'}}
              />
            </div>
            <div className='hand-row'>
              <label>有効期限（yymm）</label>
              <input value={expiry} onChange={(e) => setExpiry(e.target.value)} style={{textAlign: 'center'}} />
            </div>

            <ActionFooter columns={4}>
              <button className='set-btn set-danger' style={{visibility: 'hidden'}}>破棄</button>
              <button className='set-btn set-primary' onClick={handleRead}>読込</button>
              <button className='set-btn set-success' style={{visibility: 'hidden'}}>解除</button>
              <button className='set-btn set-success' onClick={() => setShowBackConfirm(true)}>戻る</button>
            </ActionFooter>

            {showItemNoConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>品目No.を入力して下さい。</div>
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
                  <div className='set-modal-body'>ロットシリアルを入力して下さい。</div>
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
                  <div className='set-modal-body'>入力内容で読込を完了しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowReadConfirm(false)
                        sessionStorage.setItem(
                          'inventory-hand-input-result',
                          JSON.stringify({itemNo, lot, qty}),
                        )
                        navigate('/factory/inventory-records')
                      }}
                    >
                      YES
                    </button>
                    <button className='set-modal-btn set-modal-no' onClick={() => setShowReadConfirm(false)}>
                      NO
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showBackConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>手入力ダイアログを閉じますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory/inventory-records')
                      }}
                    >
                      YES
                    </button>
                    <button className='set-modal-btn set-modal-no' onClick={() => setShowBackConfirm(false)}>
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

export {InventoryRecordsHandInputPage}
