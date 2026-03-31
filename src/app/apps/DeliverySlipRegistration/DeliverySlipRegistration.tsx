import {useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {FaPlay} from 'react-icons/fa'
import './DeliverySlipRegistration.css'

type DeliverySlipStatus = '' | '追加' | '削除'

type DeliverySlipRow = {
  id: number
  slipNo: string
  status: DeliverySlipStatus
}

type DeliverySlipMockRow = Omit<DeliverySlipRow, 'id'>

const MOCK_REGISTERED_ROWS: Record<string, DeliverySlipMockRow[]> = {
  '12345678': [
    {slipNo: '202603310000000000000000000001', status: ''},
    {slipNo: '202603310000000000000000000002', status: ''},
    {slipNo: '202603310000000000000000000003', status: ''},
    {slipNo: '202603310000000000000000000004', status: ''},
    {slipNo: '202603310000000000000000000005', status: ''},
    {slipNo: '202603310000000000000000000006', status: ''},
    {slipNo: '202603310000000000000000000007', status: ''},
    {slipNo: '202603310000000000000000000008', status: ''},
    {slipNo: '202603310000000000000000000009', status: ''},
    {slipNo: '202603310000000000000000000010', status: ''},
    {slipNo: '202603310000000000000000000011', status: ''},
    {slipNo: '202603310000000000000000000012', status: ''},
    {slipNo: '202603310000000000000000000013', status: ''},
  ],
  '87654321': [
    {slipNo: '202603310000000000000000000101', status: ''},
    {slipNo: '202603310000000000000000000102', status: ''},
    {slipNo: '202603310000000000000000000103', status: ''},
    {slipNo: '202603310000000000000000000104', status: ''},
    {slipNo: '202603310000000000000000000105', status: ''},
    {slipNo: '202603310000000000000000000106', status: ''},
    {slipNo: '202603310000000000000000000107', status: ''},
    {slipNo: '202603310000000000000000000108', status: ''},
    {slipNo: '202603310000000000000000000109', status: ''},
    {slipNo: '202603310000000000000000000110', status: ''},
    {slipNo: '202603310000000000000000000111', status: ''},
    {slipNo: '202603310000000000000000000112', status: ''},
    {slipNo: '202603310000000000000000000113', status: ''},
  ],
}

const DEFAULT_SHIPMENT_NO = '12345678'

const buildRegisteredRows = (shipmentNo: string): DeliverySlipRow[] =>
  (MOCK_REGISTERED_ROWS[shipmentNo] ?? []).map((row, index) => ({
    id: index + 1,
    slipNo: row.slipNo,
    status: row.status,
  }))

const isValidDigits = (value: string, length: number) => new RegExp(`^\\d{${length}}$`).test(value)

const DeliverySlipRegistration = () => {
  const navigate = useNavigate()
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const deliverySlipInputRef = useRef<HTMLInputElement | null>(null)
  const initialRows = buildRegisteredRows(DEFAULT_SHIPMENT_NO)
  const nextRowIdRef = useRef(initialRows.length + 1)

  const [shipmentNo, setShipmentNo] = useState(DEFAULT_SHIPMENT_NO)
  const [deliverySlipNo, setDeliverySlipNo] = useState('')
  const [rows, setRows] = useState<DeliverySlipRow[]>(initialRows)
  const [activeRowId, setActiveRowId] = useState<number | null>(initialRows[0]?.id ?? null)
  const [message, setMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [showCompleteNotice, setShowCompleteNotice] = useState(false)

  const activeRow = rows.find((row) => row.id === activeRowId) ?? null

  const resetTableScroll = () => {
    const el = tableScrollRef.current
    if (!el) return

    requestAnimationFrame(() => {
      el.scrollTop = 0
      el.scrollLeft = 0
    })
  }

  const clearScreen = () => {
    const restoredRows = buildRegisteredRows(DEFAULT_SHIPMENT_NO)
    setShipmentNo(DEFAULT_SHIPMENT_NO)
    setDeliverySlipNo('')
    setRows(restoredRows)
    setActiveRowId(restoredRows[0]?.id ?? null)
    setMessage('')
    nextRowIdRef.current = restoredRows.length + 1
    resetTableScroll()
  }

  const loadShipment = () => {
    if (!isValidDigits(shipmentNo, 8)) {
      setMessage('出荷No.は8桁の数字で入力してください。')
      return
    }

    const registeredRows = buildRegisteredRows(shipmentNo)
    nextRowIdRef.current = registeredRows.length + 1
    setRows(registeredRows)
    setActiveRowId(registeredRows[0]?.id ?? null)
    setDeliverySlipNo('')
    setMessage('')
    resetTableScroll()

    requestAnimationFrame(() => {
      deliverySlipInputRef.current?.focus()
    })
  }

  const addDeliverySlip = () => {
    if (!isValidDigits(shipmentNo, 8)) {
      setMessage('先に8桁の出荷No.を入力してください。')
      return
    }

    if (!isValidDigits(deliverySlipNo, 30)) {
      setMessage('配送伝票No.は30桁の数字で入力してください。')
      return
    }

    const existingRow = rows.find((row) => row.slipNo === deliverySlipNo)
    if (existingRow) {
      if (existingRow.status === '削除') {
        setRows((prevRows) =>
          prevRows.map((row) => (row.id === existingRow.id ? {...row, status: ''} : row))
        )
        setActiveRowId(existingRow.id)
        setMessage('')
      } else {
        setActiveRowId(existingRow.id)
        setMessage('')
      }
      setDeliverySlipNo('')
      return
    }

    const newRow: DeliverySlipRow = {
      id: nextRowIdRef.current,
      slipNo: deliverySlipNo,
      status: '追加',
    }

    nextRowIdRef.current += 1
    setRows((prevRows) => [...prevRows, newRow])
    setActiveRowId(newRow.id)
    setDeliverySlipNo('')
    setMessage('')

    requestAnimationFrame(() => {
      const el = tableScrollRef.current
      if (!el) return
      el.scrollTop = el.scrollHeight
    })
  }

  const handleDelete = () => {
    if (!activeRow) {
      setShowNoSelectionConfirm(true)
      return
    }

    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (!activeRow) {
      setShowDeleteConfirm(false)
      return
    }

    if (activeRow.status === '追加') {
      setRows((prevRows) => prevRows.filter((row) => row.id !== activeRow.id))
      setActiveRowId(null)
      setMessage('')
    } else if (activeRow.status === '') {
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === activeRow.id ? {...row, status: '削除'} : row))
      )
      setMessage('')
    } else {
      setMessage('')
    }

    setShowDeleteConfirm(false)
  }

  const handleComplete = () => {
    if (!isValidDigits(shipmentNo, 8)) {
      setMessage('出荷No.は8桁の数字で入力してください。')
      return
    }

    if (rows.length === 0) {
      setMessage('登録対象の配送伝票No.がありません。')
      return
    }

    const committedRows = rows
      .filter((row) => row.status !== '削除')
      .map((row) => ({...row, status: ''}))

    setRows(committedRows)
    setActiveRowId(committedRows[0]?.id ?? null)
    setMessage('')
    setShowCompleteNotice(true)
    resetTableScroll()
  }

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>配送伝票登録</div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row'>
                <label htmlFor='shipmentNo'>出荷No.</label>
                <input
                  id='shipmentNo'
                  value={shipmentNo}
                  inputMode='numeric'
                  maxLength={8}
                  placeholder='8桁'
                  onChange={(e) => setShipmentNo(e.target.value.slice(0, 8))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      loadShipment()
                    }
                  }}
                />
              </div>

              <div className='set-row'>
                <label htmlFor='deliverySlipNo'>配送伝票No.</label>
                <input
                  id='deliverySlipNo'
                  ref={deliverySlipInputRef}
                  value={deliverySlipNo}
                  inputMode='numeric'
                  maxLength={30}
                  placeholder='30桁'
                  onChange={(e) => setDeliverySlipNo(e.target.value.slice(0, 30))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addDeliverySlip()
                    }
                  }}
                />
              </div>

              {message ? <div className='delivery-slip-message'>{message}</div> : null}
            </div>

            <div className='set-table-wrap delivery-slip-table-wrap'>
              <div className='set-table'>
                <div
                  ref={tableScrollRef}
                  className={rows.length === 0 ? 'set-table-scroll set-table-scroll-empty' : 'set-table-scroll'}
                >
                  <div className='set-table-head delivery-slip-table-head'>
                    <span className='col-arrow-head'></span>
                    <span className='col-status-delivery'>状態</span>
                    <span className='col-slip-delivery'>配送伝票No.</span>
                  </div>

                  <div className='set-table-body'>
                    {rows.length === 0 ? (
                      <div className='set-empty'>表示する配送伝票No.がありません。</div>
                    ) : (
                      rows.map((row) => (
                        <div
                          className={`set-table-row delivery-slip-row${activeRowId === row.id ? ' is-active' : ''}`}
                          key={row.id}
                          role='button'
                          tabIndex={0}
                          onClick={() => setActiveRowId(row.id)}
                          onFocus={() => setActiveRowId(row.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setActiveRowId(row.id)
                            }
                          }}
                        >
                          <span className='col-arrow'>
                            {activeRowId === row.id ? <FaPlay className='col-row-arrow' /> : null}
                          </span>
                          <span className='col-status-delivery'>{row.status}</span>
                          <span className='col-slip-delivery'>{row.slipNo}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className='set-actions set-actions-row'>
              <button className='set-btn set-danger' onClick={() => setShowClearConfirm(true)}>
                破棄
              </button>
              <button className='set-btn set-primary' onClick={handleComplete}>
                完了
              </button>
              <button className='set-btn set-success' onClick={handleDelete}>
                削除
              </button>
              <button className='set-btn set-warning' onClick={() => setShowBackConfirm(true)}>
                戻る
              </button>
            </div>

            {showDeleteConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>
                    {activeRow?.status === '追加'
                      ? '追加した配送伝票No.を削除しますか？'
                      : '選択した配送伝票No.を削除予定にしますか？'}
                  </div>
                  <div className='set-modal-actions'>
                    <button className='set-modal-btn set-modal-yes' onClick={confirmDelete}>
                      はい
                    </button>
                    <button className='set-modal-btn set-modal-no' onClick={() => setShowDeleteConfirm(false)}>
                      いいえ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showNoSelectionConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>削除する行を選択してください。</div>
                  <div className='set-modal-actions'>
                    <button className='set-modal-btn set-modal-yes' onClick={() => setShowNoSelectionConfirm(false)}>
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showClearConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>
                    読込データをクリアして
                    <br />
                    画面を初期化しますか？
                  </div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowClearConfirm(false)
                        clearScreen()
                      }}
                    >
                      はい
                    </button>
                    <button className='set-modal-btn set-modal-no' onClick={() => setShowClearConfirm(false)}>
                      いいえ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showCompleteNotice && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>配送伝票No.を登録しました。</div>
                  <div className='set-modal-actions'>
                    <button className='set-modal-btn set-modal-yes' onClick={() => setShowCompleteNotice(false)}>
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
                  <div className='set-modal-body'>
                    メインメニューに戻ります。
                    <br />
                    読込データをクリアしますか？
                  </div>
                  <div className='set-modal-actions delivery-slip-back-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        clearScreen()
                        setShowBackConfirm(false)
                        navigate('/factory')
                      }}
                    >
                      クリアして戻る
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory')
                      }}
                    >
                      残して戻る
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

export {DeliverySlipRegistration}
