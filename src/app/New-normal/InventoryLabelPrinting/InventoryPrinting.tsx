import {useEffect, useRef, useState} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'

const WAREHOUSE_BY_ORDER: Record<string, string> = {
  '12345678': 'A倉庫',
  'OT-12345678': 'C事業所',
  'MB-12345678123456': 'D事業所',
}

const InventoryPrinting = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const orderNo = (location.state as {orderNo?: string} | null)?.orderNo ?? ''
  const isMB = orderNo === 'MB-12345678123456'

  const defaultWarehouse = WAREHOUSE_BY_ORDER[orderNo] ?? 'A倉庫'

  const [warehouse, setWarehouse] = useState(defaultWarehouse)
  const [moveStorage, setMoveStorage] = useState('')
  const [qty, setQty] = useState('')
  const [itemNo, setItemNo] = useState('')
  const [lot, setLot] = useState('')
  const [serial, setSerial] = useState('')
  const [expiry, setExpiry] = useState('')

  const [showItemNoConfirm, setShowItemNoConfirm] = useState(false)
  const [showLotSerialConfirm, setShowLotSerialConfirm] = useState(false)
  const [showExpiryConfirm, setShowExpiryConfirm] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [showExecuteConfirm, setShowExecuteConfirm] = useState(false)
  const [showExecuteDoneConfirm, setShowExecuteDoneConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const [isLabelLocked, setIsLabelLocked] = useState(false)

  const moveStorageRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    moveStorageRef.current?.focus()
  }, [])

  const handleMoveStorageSubmit = () => {
    const trimmed = moveStorage.trim()
    if (!trimmed) return
    const [parsedItemNo, ...rest] = trimmed.split(/\s+/)
    setItemNo(parsedItemNo)
    setLot(rest.join(' '))
    setQty('')
    setIsLabelLocked(true)
  }

  const resetForm = () => {
    setMoveStorage('')
    setItemNo('')
    setLot('')
    setSerial('')
    setExpiry('')
    setQty('')
    setIsLabelLocked(false)
    moveStorageRef.current?.focus()
  }

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
    setShowExecuteConfirm(true)
  }

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>庫内バーコードラベル印刷</div>
          <div className='hand-body'>
            <div className='hand-row'>
              <label>庫内ラベル</label>
              <input
                ref={moveStorageRef}
                value={moveStorage}
                onChange={(e) => setMoveStorage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleMoveStorageSubmit()}
                readOnly={isLabelLocked}
                className={isLabelLocked ? 'set-input-gray' : ''}
                style={{textAlign: 'center', ...(isLabelLocked ? {backgroundColor: '#d9d9d9'} : {})}}
              />
            </div>
            <div className='hand-row'>
              <label>品　　 番 </label>
              <input
                value={itemNo}
                onChange={(e) => setItemNo(e.target.value)}
                disabled={!isLabelLocked}
                className={!isLabelLocked ? 'set-input-gray' : ''}
                style={{textAlign: 'center', ...(!isLabelLocked ? {backgroundColor: '#d9d9d9'} : {})}}
              />
            </div>
            <div className='hand-row'>
              <label>ロット/シリアル</label>
              <input
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                disabled={!isLabelLocked}
                className={!isLabelLocked ? 'set-input-gray' : ''}
                style={{textAlign: 'center', ...(!isLabelLocked ? {backgroundColor: '#d9d9d9'} : {})}}
              />
            </div>
            <div className='hand-row'>
              <label>印刷枚数</label>
              <input
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                disabled={!isLabelLocked}
                className={!isLabelLocked ? 'set-input-gray' : ''}
                style={{textAlign: 'center', ...(!isLabelLocked ? {backgroundColor: '#d9d9d9'} : {})}}
              />
            </div>
            <ActionFooter columns={4}>
              <button className='set-btn set-danger' onClick={() => setShowDiscardConfirm(true)}>破棄</button>
              <button className='set-btn set-warning' onClick={handleRead}>実行</button>
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

            {showDiscardConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>読込データを破棄します。宜しいですか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowDiscardConfirm(false)
                        resetForm()
                      }}
                    >
                      OK
                    </button>
                    <button className='set-modal-btn set-modal-no' onClick={() => setShowDiscardConfirm(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showExecuteConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>庫内ラベルの印刷を実行しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowExecuteConfirm(false)
                        setShowExecuteDoneConfirm(true)
                      }}
                    >
                      はい
                    </button>
                    <button className='set-modal-btn set-modal-no' onClick={() => setShowExecuteConfirm(false)}>
                      いいえ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showExecuteDoneConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>庫内ラベルの印刷を実行しました。</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowExecuteDoneConfirm(false)
                        resetForm()
                      }}
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showBackConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>メニューに戻ります。よろしいですか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory/factory')
                      }}
                    >
                      はい
                    </button>
                    <button className='set-modal-btn set-modal-no' onClick={() => setShowBackConfirm(false)}>
                      いいえ
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

export {InventoryPrinting}
