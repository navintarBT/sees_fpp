import {useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
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
  // Changed: support multiple selected row IDs
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set())
  const [message, setMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [showCompleteNotice, setShowCompleteNotice] = useState(false)

  // Derived: rows currently checked
  const selectedRows = rows.filter((row) => selectedRowIds.has(row.id))
  const allChecked = rows.length > 0 && rows.every((row) => selectedRowIds.has(row.id))
  const someChecked = rows.some((row) => selectedRowIds.has(row.id))

  const resetTableScroll = () => {
    const el = tableScrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = 0
      el.scrollLeft = 0
    })
  }

  const clearScreen = () => {
    setShipmentNo('')
    setDeliverySlipNo('')
    setRows([])
    setSelectedRowIds(new Set())
    setMessage('')
    nextRowIdRef.current = 1
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
    setSelectedRowIds(new Set())
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
        setSelectedRowIds(new Set([existingRow.id]))
        setMessage('')
      } else {
        setSelectedRowIds(new Set([existingRow.id]))
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
    setSelectedRowIds(new Set([newRow.id]))
    setDeliverySlipNo('')
    setMessage('')

    requestAnimationFrame(() => {
      const el = tableScrollRef.current
      if (!el) return
      el.scrollTop = el.scrollHeight
    })
  }

  // Toggle a single row checkbox
  const toggleRowCheckbox = (id: number) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Toggle all rows (header checkbox)
  const toggleAllCheckboxes = () => {
    if (allChecked) {
      setSelectedRowIds(new Set())
    } else {
      setSelectedRowIds(new Set(rows.map((row) => row.id)))
    }
  }

  const handleDelete = () => {
    if (selectedRows.length === 0) {
      setShowNoSelectionConfirm(true)
      return
    }
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (selectedRows.length === 0) {
      setShowDeleteConfirm(false)
      return
    }

    setRows((prevRows) => {
      let updated = [...prevRows]
      for (const activeRow of selectedRows) {
        if (activeRow.status === '追加') {
          // Remove newly added rows entirely
          updated = updated.filter((row) => row.id !== activeRow.id)
        } else if (activeRow.status === '') {
          // Mark existing rows as 削除
          updated = updated.map((row) =>
            row.id === activeRow.id ? {...row, status: '削除'} : row
          )
        }
      }
      return updated
    })

    setSelectedRowIds(new Set())
    setMessage('')
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
      .map((row) => ({...row, status: '' as DeliverySlipStatus}))

    setRows(committedRows)
    setSelectedRowIds(new Set(committedRows[0]?.id != null ? [committedRows[0].id] : []))
    setMessage('')
    setShowCompleteNotice(true)
    resetTableScroll()
  }

  // Build delete confirmation message based on selected rows
  const deleteConfirmMessage = () => {
    const hasAdded = selectedRows.some((r) => r.status === '追加')
    const hasExisting = selectedRows.some((r) => r.status === '')
    if (hasAdded && hasExisting) {
      return '選択した配送伝票No.を削除（追加行は完全削除、既存行は削除予定）しますか？'
    }
    if (hasAdded) {
      return '追加した配送伝票No.を削除しますか？'
    }
    return '選択した配送伝票No.を削除予定にしますか？'
  }

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header-de'>配送伝票登録</div>
          <div className='set-body-de'>
            <div className='set-form-de'>
              <div className='set-row-de'>
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

              <div className='set-row-de'>
                <label htmlFor='deliverySlipNo'>配送伝票No.</label>
                <input
                  className='set-input-2-de'
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

              {message ? <div className='delivery-slip-message-de'>{message}</div> : null}
            </div>

            <div className='set-table-wrap-de delivery-slip-table-wrap-de'>
              <div className='set-table-de'>
                <div
                  ref={tableScrollRef}
                  className={rows.length === 0 ? 'set-table-scroll-de set-table-scroll-empty-de' : 'set-table-scroll-de'}
                >
                  {/* Header with select-all checkbox */}
                  <div className='set-table-head-de delivery-slip-table-head-de'>
                    <span className='col-checkbox-head-de' style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '52px', minWidth: '52px', boxSizing: 'border-box'}}>
                      <input
                        type='checkbox'
                        aria-label='すべて選択'
                        checked={allChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = someChecked && !allChecked
                        }}
                        onChange={toggleAllCheckboxes}
                        style={{width: '30px', height: '30px', cursor: 'pointer', accentColor: '#1976d2'}}
                      />
                    </span>
                    <span className='col-status-delivery-de'>状態</span>
                    <span className='col-slip-delivery-de set-row-left'>配送伝票No.</span>
                  </div>

                  <div className='set-table-body-de'>
                    {rows.length === 0 ? (
                      <div className='set-empty-de'>表示する配送伝票No.がありません。</div>
                    ) : (
                      rows.map((row) => {
                        const isChecked = selectedRowIds.has(row.id)
                        return (
                          <div
                            className={`set-table-row-de delivery-slip-row-de${isChecked ? ' is-active-de' : ''}`}
                            key={row.id}
                            role='button'
                            tabIndex={0}
                            onClick={() => toggleRowCheckbox(row.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                toggleRowCheckbox(row.id)
                              }
                            }}
                            style={{
                              minHeight: '44px',
                              backgroundColor: isChecked ? '#e3f2fd' : '#ffffff',
                              boxShadow: isChecked ? 'inset 3px 0 0 #1976d2' : 'none',
                              color: isChecked ? '#1565c0' : 'inherit',
                              cursor: 'pointer',
                              transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
                            }}
                          >
                            <span className='col-checkbox-de' style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '52px', minWidth: '52px', boxSizing: 'border-box'}}>
                              <input
                                type='checkbox'
                                aria-label={`行 ${row.slipNo} を選択`}
                                checked={isChecked}
                                onChange={() => toggleRowCheckbox(row.id)}
                                onClick={(e) => e.stopPropagation()}
                                style={{width: '30px', height: '30px', cursor: 'pointer', accentColor: '#1976d2'}}
                              />
                            </span>
                            <span className='col-status-delivery-de'>{row.status}</span>
                            <span className='col-slip-delivery-de'>{row.slipNo}</span>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className='set-actions-de set-actions-row-de'>
              <button className='set-btn-de set-danger-de' onClick={() => {
                setShowDeleteConfirm(false)
                setShowNoSelectionConfirm(false)
                setShowBackConfirm(false)
                setShowCompleteNotice(false)
                setShowClearConfirm(true)
              }}>
                破棄
              </button>
              <button className='set-btn-de set-primary-de' onClick={handleComplete}>
                完了
              </button>
              <button className='set-btn-de set-success-de' onClick={handleDelete}>
                削除
              </button>
              <button className='set-btn-de set-warning-de' onClick={() => {
                setShowDeleteConfirm(false)
                setShowNoSelectionConfirm(false)
                setShowClearConfirm(false)
                setShowCompleteNotice(false)
                setShowBackConfirm(true)
              }}>
                戻る
              </button>
            </div>

            {showDeleteConfirm && (
              <div className='set-modal-backdrop-de' role='presentation'>
                <div className='set-modal-de' role='dialog' aria-modal='true'>
                  <div className='set-modal-header-de'>確認</div>
                  <div className='set-modal-body-de'>{deleteConfirmMessage()}</div>
                  <div className='set-modal-actions-de'>
                    <button className='set-modal-btn-de set-modal-yes-de' onClick={confirmDelete}>
                      はい
                    </button>
                    <button className='set-modal-btn-de set-modal-no-de' onClick={() => setShowDeleteConfirm(false)}>
                      いいえ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showNoSelectionConfirm && (
              <div className='set-modal-backdrop-de' role='presentation'>
                <div className='set-modal-de' role='dialog' aria-modal='true'>
                  <div className='set-modal-header-de'>確認</div>
                  <div className='set-modal-body-de'>削除する行を選択してください。</div>
                  <div className='set-modal-actions-de'>
                    <button className='set-modal-btn-de set-modal-yes-de' onClick={() => setShowNoSelectionConfirm(false)}>
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showClearConfirm && (
              <div className='set-modal-backdrop-de' role='presentation'>
                <div className='set-modal-de' role='dialog' aria-modal='true'>
                  <div className='set-modal-header-de'>確認</div>
                  <div className='set-modal-body-de'>
                    読込データをクリアして
                    <br />
                    画面を初期化しますか？
                  </div>
                  <div className='set-modal-actions-de'>
                    <button
                      className='set-modal-btn-de set-modal-yes-de'
                      onClick={() => {
                        setShowClearConfirm(false)
                        clearScreen()
                      }}
                    >
                      はい
                    </button>
                    <button className='set-modal-btn-de set-modal-no-de' onClick={() => setShowClearConfirm(false)}>
                      いいえ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showCompleteNotice && (
              <div className='set-modal-backdrop-de' role='presentation'>
                <div className='set-modal-de' role='dialog' aria-modal='true'>
                  <div className='set-modal-header-de'>確認</div>
                  <div className='set-modal-body-de'>配送伝票No.を登録しました。</div>
                  <div className='set-modal-actions-de'>
                    <button className='set-modal-btn-de set-modal-yes-de' onClick={() => setShowCompleteNotice(false)}>
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showBackConfirm && (
              <div className='set-modal-backdrop-de' role='presentation'>
                <div className='set-modal-de' role='dialog' aria-modal='true'>
                  <div className='set-modal-header-de'>確認</div>
                  <div className='set-modal-body-de'>
                    メインメニューに戻ります。
                    <br />
                    読込データをクリアしますか？
                  </div>
                  <div className='set-modal-actions-de delivery-slip-back-actions-de'>
                    <button
                      className='set-modal-btn-de set-modal-yes-de'
                      onClick={() => {
                        clearScreen()
                        setShowBackConfirm(false)
                        navigate('/factory')
                      }}
                    >
                      クリアして戻る
                    </button>
                    <button
                      className='set-modal-btn-de set-modal-no-de'
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