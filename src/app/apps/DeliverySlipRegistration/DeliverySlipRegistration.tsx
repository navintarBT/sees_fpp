import {useEffect, useRef, useState, type ReactNode} from 'react'
import {useNavigate} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {TableSection, type TableColumn as TFTableColumn} from '../../components/TableSection/TableSection'

type Row = {
  id: number
  error: string
  item: string

}

type TableColumn = {
  key: string
  headClassName: string
  cellClassName: string
  header: ReactNode
  render: (row: Row) => ReactNode
}

const DeliverySlipRegistration = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      error: '',
      item: '202603310000000000000000000001', // 品目No.
    },
    {
      id: 2,
      error: '',
      item: '202603310000000000000000000002', // 品目No.
    },
    {
      id: 3,
      error: '',
      item: '202603310000000000000000000003', // 品目No.
    },
    {
      id: 4,
      error: '',
      item: '202603310000000000000000000004', // 品目No.
    },
    {
      id: 5,
      error: '',
      item: '202603310000000000000000000005', // 品目No.
    },
    {
      id: 6,
      error: '',
      item: '202603310000000000000000000006', // 品目No.
    },
    {
      id: 7,
      error: '',
      item: '202603310000000000000000000007', // 品目No.
    },
    {
      id: 8,
      error: '',
      item: '202603310000000000000000000008', // 品目No.
    },
    {
      id: 9,
      error: '',
      item: '202603310000000000000000000009', // 品目No.
    },
    {
      id: 10,
      error: '',
      item: '202603310000000000000000000010', // 品目No.
    },
  ])
  const [form, setForm] = useState({
    parentWarehouse: '羽田製品倉庫：W0040',
    parentItemNo: '0193090',
    moveWarehouse: '千葉倉庫（WMS）：W002',
    moveStorage: '',
    qty: '1',
    janCode: '',
  })
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([])
  const activeRow = rows.find((row) => row.id === activeRowId) ?? null
  const pressedKeysRef = useRef<{f1: boolean; f8: boolean}>({f1: false, f8: false})
  const isAnyModalOpen =
    showHandInputConfirm ||
    showDeleteConfirm ||
    showNoSelectionConfirm ||
    showClearConfirm ||
    showCompleteConfirm ||
    showBackConfirm

  const closeAllModals = () => {
    setShowHandInputConfirm(false)
    setShowDeleteConfirm(false)
    setShowNoSelectionConfirm(false)
    setShowClearConfirm(false)
    setShowCompleteConfirm(false)
    setShowBackConfirm(false)
  }

  const clearRows = () => {
    setRows([])
    setCheckedRowIds([])
  }
  const clearForm = () =>
    setForm({
      parentWarehouse: '',
      parentItemNo: '',
      moveWarehouse: '',
      moveStorage: '',
      qty: '',
      janCode: '',
    })

  const resetTableScroll = () => {
    const el = tableScrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = 0
      el.scrollLeft = 0
      requestAnimationFrame(() => {
        el.scrollTop = 0
        el.scrollLeft = 0
      })
    })
  }

  const clearFormAndRows = () => {
    clearForm()
    clearRows()
    resetTableScroll()
  }

  const handleRowClick = (rowId: number) => {
    setActiveRowId(rowId)
    setCheckedRowIds((prev) => (prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]))
  }

  const isAllChecked = rows.length > 0 && rows.every((row) => checkedRowIds.includes(row.id))

  const toggleAllChecked = (checked: boolean) => {
    if (checked) {
      setCheckedRowIds(rows.map((row) => row.id))
      return
    }
    setCheckedRowIds([])
  }

  const toggleRowChecked = (rowId: number, checked: boolean) => {
    setCheckedRowIds((prev) => {
      if (checked) {
        return prev.includes(rowId) ? prev : [...prev, rowId]
      }
      return prev.filter((id) => id !== rowId)
    })
  }

  const handleReleaseClick = (options?: {forceRelease?: boolean; forceHandInput?: boolean}) => {
    if (isAnyModalOpen) return
    if (options?.forceHandInput) {
      closeAllModals()
      setShowHandInputConfirm(true)
      return
    }
    if (!activeRow) {
      closeAllModals()
      setShowNoSelectionConfirm(true)
      return
    }
  }


  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isAnyModalOpen) {
        return
      }
      if (event.key === 'F1') {
        pressedKeysRef.current.f1 = true
      }
      if (event.key === 'F8') {
        pressedKeysRef.current.f8 = true
      }
      if (pressedKeysRef.current.f1 && pressedKeysRef.current.f8) {
        event.preventDefault()
        handleReleaseClick({forceHandInput: true})
        return
      }

      if (event.key === 'F1') {
        event.preventDefault()
        closeAllModals()
        setShowClearConfirm(true)
        return
      }

      if (event.key === 'F2') {
        event.preventDefault()
        closeAllModals()
        setShowCompleteConfirm(true)
        return
      }

      if (event.key === 'F3') {
        event.preventDefault()
        handleReleaseClick({forceRelease: true})
        return
      }

      if (event.key === 'F4') {
        event.preventDefault()
        closeAllModals()
        setShowBackConfirm(true)
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        pressedKeysRef.current.f1 = false
      }
      if (event.key === 'F8') {
        pressedKeysRef.current.f8 = false
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [activeRow, isAnyModalOpen])

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'check',
      headClassName: 'col-check',
      cellClassName: 'col-check',
      header: (
        <input
          type='checkbox'
          className='tf-tableCheckbox'
          checked={isAllChecked}
          onChange={(e) => toggleAllChecked(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          aria-label='Select all rows'
        />
      ),
      render: (row) => (
        <input
          type='checkbox'
          className='tf-tableCheckbox'
          checked={checkedRowIds.includes(row.id)}
          onChange={(e) => toggleRowChecked(row.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select row ${row.id}`}
        />
      ),
    },
    {key: 'error', headClassName: 'col-error', cellClassName: 'col-error', header: '状態', render: (row) => row.error},
    {key: 'item', headClassName: 'col-item', cellClassName: 'col-item', header: '品目No.', render: (row) => row.item},
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>セット構成登録</div>
          <div className='set-body'>
                <div className='set-form'>
                  <div className='set-row'>
                    <label>出荷No.</label>
                    <input
                      value={form.parentItemNo}
                      onChange={(e) => setForm({...form, parentItemNo: e.target.value})}
                    />
                  </div>
                    <div className='set-row'>
                    <label>配送伝票No.</label>
                    <input
                      value={form.parentItemNo}
                      onChange={(e) => setForm({...form, parentItemNo: e.target.value})}
                    />
                  </div>
                </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              onRowActivate={(rowKey) => handleRowClick(Number(rowKey))}
            />

            <ActionFooter columns={4}>
              <button
                className='set-btn set-danger'
                onClick={() => setShowClearConfirm(true)}
              >
                破棄
              </button>
              <button
                className='set-btn set-primary'
                onClick={() => setShowCompleteConfirm(true)}
              >
                完了
              </button>     
              <button
                className='set-btn set-primary set-success'
                onClick={() => handleReleaseClick({forceHandInput: true})}
              >
                手入力
              </button>
              <button
                className='set-btn set-warning'
                onClick={() => setShowBackConfirm(true)}
              >
                戻る
              </button>
            </ActionFooter>
       </div>
            {showHandInputConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>品目情報を手入力しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowHandInputConfirm(false)
                        navigate('')
                      }}
                    >
                      はい
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => {
                        setShowHandInputConfirm(false)
                      }}
                    >
                      いいえ
                    </button>
                  </div>
                </div>
              </div>
            )}


            {showDeleteConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowDeleteConfirm(false)
                      }}
                    >
                      {'\u306f\u3044'}
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      {'\u3044\u3044\u3048'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showNoSelectionConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>{'\u9078\u629e\u884c\u304c\u3042\u308a\u307e\u305b\u3093\u3002'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => setShowNoSelectionConfirm(false)}
                    >
                      {'\u004f\u004b'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showClearConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>{'\u8aad\u8fbc\u30c7\u30fc\u30bf\u3092\u7834\u68c4\u3057\u307e\u3059\u3002'}<br />{'\u5b9c\u3057\u3044\u3067\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowClearConfirm(false)
                        clearFormAndRows()
                      }}
                    >
                      {'\u306f\u3044'}
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowClearConfirm(false)}
                    >
                      {'\u3044\u3044\u3048'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showCompleteConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>{'\u30bb\u30c3\u30c8\u69cb\u6210\u3092\u767b\u9332\u3057\u307e\u3057\u305f\u3002'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => setShowCompleteConfirm(false)}
                    >
                      {'\u004f\u004b'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showBackConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>{'\u30e1\u30cb\u30e5\u30fc\u306b\u623b\u308a\u307e\u3059\u3002'}<br />{'\u8aad\u8fbc\u30c7\u30fc\u30bf\u3092\u7834\u68c4\u3057\u307e\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory')
                      }}
                    >
                      {'\u306f\u3044'}
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowBackConfirm(false)}
                    >
                      {'\u3044\u3044\u3048'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  )
}

export {DeliverySlipRegistration}
