import {useEffect, useRef, useState, type ReactNode} from 'react'
import {useNavigate} from 'react-router-dom'
import {FaPlay} from 'react-icons/fa'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {TableSection, type TableColumn as TFTableColumn} from '../../components/TableSection/TableSection'

type Row = {
  id: number
  error: string
  item: string
  lot: string
  lot2: string
  status: string
  build: string
  release: string
  move: string
  moveStorage: string
  name: string
  moveStorage2?: string
}

const EMPTY_ROW: Row = {
  id: 1,
  error: '',
  item: '',
  lot: '',
  lot2: '',
  status: '',
  build: '',
  release: '',
  move: '',
  moveStorage: '',
  name: '',
}

const SESSION_KEY = 'shippingRecordPageState'
const HAND_INPUT_RESULT_KEY = 'shipping-hand-input-result'

const MOCK_JAN_CODE: Record<string, number> = {
  '1234567890123': 1,
}

const MOCK_SHIPPING: Record<string, {moveWarehouse: string; moveStorage: string; qty: string; janCode: string; rows: Row[]}> = {
  '10000001': {
    moveWarehouse: 'A倉庫',
    moveStorage: 'JDE基本保管場所',
    qty: '1',
    janCode: '',
    rows: [
      {
        id: 1,
        error: '',
        item: '1001',
        lot: '001',
        lot2: '',
        status: 'JDE基本保管場所',
        build: '1',
        release: '0',
        move: '',
        moveStorage: '',
        name: '品名1',
      },
      {
        id: 2,
        error: '',
        item: '1002',
        lot: '002',
        lot2: '*',
        status: 'JDE基本保管場所',
        build: '2',
        release: '2',
        move: '',
        moveStorage: '保管場所B',
        name: '品名2',
      },
      {
        id: 3,
        error: 'E',
        item: '1003',
        lot: '003',
        lot2: '',
        status: 'JDE基本保管場所',
        build: '3',
        release: '3',
        move: '',
        moveStorage: '保管場所C',
        name: '品名3',
      },
    ],
  },
  '3019': {
    moveWarehouse: 'A倉庫',
    moveStorage: 'F0200',
    qty: '1',
    janCode: '',
    rows: [
      {
        id: 1,
        error: '',
        item: '1197101',
        lot: '',
        lot2: '*',
        status: '3',
        build: '2',
        release: '10',
        move: '',
        moveStorage: 'A-01-01',
        name: 'サンプル品名',
      },
            {
        id: 2,
        error: '',
        item: '1197102',
        lot: '',
        lot2: '*',
        status: '5',
        build: '7',
        release: '10',
        move: '',
        moveStorage: 'A-01-01',
        name: 'サンプル品名',
      },
                  {
        id: 3,
        error: '',
        item: '1197103',
        lot: '',
        lot2: '*',
        status: '6',
        build: '3',
        release: '10',
        move: '',
        moveStorage: 'A-01-01',
        name: 'サンプル品名',
      },
    ],
  },
}

const ShippingRecordPage = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([EMPTY_ROW])
  const [isLoaded, setIsLoaded] = useState(false)
  const [form, setForm] = useState({
    parentWarehouse: '',
    parentItemNo: '',
    moveWarehouse: 'A倉庫',
    moveStorage: '',
    qty: '1',
    janCode: '',
  })
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showNoOrderConfirm, setShowNoOrderConfirm] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const parentItemNoRef = useRef<HTMLInputElement | null>(null)
  const janCodeRef = useRef<HTMLInputElement | null>(null)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const [activeRowId, setActiveRowId] = useState<number | null>(null)

  useEffect(() => {
    parentItemNoRef.current?.focus()
  }, [])

  useEffect(() => {
    if (isLoaded) janCodeRef.current?.focus()
  }, [isLoaded])

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY)
    const handResult = sessionStorage.getItem(HAND_INPUT_RESULT_KEY)
    if (saved) {
      try {
        const state = JSON.parse(saved)
        setForm(state.form)
        setIsLoaded(state.isLoaded)
        setActiveRowId(state.activeRowId)
        if (handResult) {
          sessionStorage.removeItem(HAND_INPUT_RESULT_KEY)
          const {itemNo, lotSerial, qty, storage} = JSON.parse(handResult)
          const rowsFromState = state.rows as Row[]
          const nextId = Math.max(...rowsFromState.map((row) => row.id), 0) + 1
          const newRow: Row = {
            ...EMPTY_ROW,
            id: nextId,
            item: itemNo,
            lot: lotSerial,
            build: qty,
            release: qty,
            moveStorage: storage,
          }
          setRows([...rowsFromState, newRow])
        } else {
          setRows(state.rows)
        }
      } catch {}
      sessionStorage.removeItem(SESSION_KEY)
    }
  }, [])

  const activeRow = rows.find((row) => row.id === activeRowId) ?? null
  const pressedKeysRef = useRef<{f1: boolean; f8: boolean}>({f1: false, f8: false})
  const isAnyModalOpen =
    showClearConfirm ||
    showNoOrderConfirm ||
    showBackConfirm

  const closeAllModals = () => {
    setShowClearConfirm(false)
    setShowNoOrderConfirm(false)
    setShowBackConfirm(false)
  }


  const handleSearch = () => {
    const data = MOCK_SHIPPING[form.parentItemNo]
    if (data) {
      const {rows: mockRows, ...formData} = data
      setForm((prev) => ({...prev, ...formData}))
      setRows(mockRows)
      setIsLoaded(true)
    } else {
      setForm((prev) => ({...prev, moveWarehouse: 'A倉庫', moveStorage: '', qty: '1', janCode: ''}))
      setRows([EMPTY_ROW])
      setIsLoaded(false)
      setActiveRowId(null)
    }
  }

  const handleJanCodeScan = () => {
    const janCode = form.janCode.trim()
    const rowId = MOCK_JAN_CODE[janCode]
    if (rowId != null) {
      setRows((prev) =>
        prev.map((row) => (row.id === rowId ? {...row, release: form.qty, moveStorage: form.moveStorage} : row)),
      )
    }
    janCodeRef.current?.focus()
  }

  const clearRows = () => setRows([EMPTY_ROW])
  const clearForm = () =>
    setForm({
      parentWarehouse: '',
      parentItemNo: '',
      moveWarehouse: 'A倉庫',
      moveStorage: '',
      qty: '1',
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
    setIsLoaded(false)
    sessionStorage.removeItem(SESSION_KEY)
    resetTableScroll()
  }

  const saveStateToSession = () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({form, rows, isLoaded, activeRowId}))
  }

  const handleRowClick = (rowId: number) => {
    const isActivating = activeRowId !== rowId
    const row = rows.find((r) => r.id === rowId) ?? null
    setActiveRowId((prev) => (prev === rowId ? null : rowId))
    if (isActivating) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({form, rows, isLoaded, activeRowId: rowId}))
      navigate('/factory/shipping-detail', {
        state: {
          name: row?.name ?? '',
          item: row?.item ?? '',
          lot: row?.lot ?? '',
          release: row?.release ?? '',
          moveStorage: row?.moveStorage ?? '',
          moveWarehouse: form.moveWarehouse,
        },
      })
    }
  }

  const handleReleaseClick = (options?: {forceRelease?: boolean; forceHandInput?: boolean}) => {
    if (isAnyModalOpen) return
    if (options?.forceHandInput) {
      closeAllModals()
      if (!form.parentItemNo.trim()) {
        setShowNoOrderConfirm(true)
        return
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({form, rows, isLoaded, activeRowId}))
      navigate('/factory/shipping-hand-input', {
        state: {moveWarehouse: form.moveWarehouse, moveStorage: form.moveStorage},
      })
      return
    }
    if (!activeRow) {
      closeAllModals()
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
        if (!form.parentItemNo.trim()) {
          setShowNoOrderConfirm(true)
        } else {
          clearFormAndRows()
        }
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
        return
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
      key: 'arrow',
      headClassName: 'col-arrow-head',
      cellClassName: 'col-arrow',
      header: '',
      render: (row) => (activeRowId === row.id ? <FaPlay className='col-row-arrow' /> : null),
    },
    {key: 'error', headClassName: 'col-error', cellClassName: 'col-error', header: '', render: (row) => row.error},
    {key: 'item', headClassName: 'col-item', cellClassName: 'col-item', header: '品目No.', render: (row) => row.item},
    {key: 'lot', headClassName: 'col-lot', cellClassName: 'col-lot', header: 'ロットシリアル', render: (row) => row.lot},
    {key: 'lot2', headClassName: 'col-lot2', cellClassName: 'col-lot2', header: '', render: (row) => row.lot2},
    {key: 'status', headClassName: 'col-status', cellClassName: 'col-status', header: '基本保管場所', render: (row) => row.status},
    {key: 'build', headClassName: 'col-num', cellClassName: 'col-num', header: '指示', render: (row) => row.build},
    {key: 'release', headClassName: 'col-num', cellClassName: 'col-num', header: '読込', render: (row) => row.release},
    {key: 'name', headClassName: 'col-num', cellClassName: 'col-num', header: '品名', render: (row) => row.name},
    {key: 'moveStorage', headClassName: 'col-num', cellClassName: 'col-num', header: '保管場所', render: (row) => row.moveStorage},

  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>出庫実績登録</div>
          <div className='set-body'>
            <div className='set-form'>
                <div className='set-row set-row-shipping-record'>
                <label>出荷指示No.</label>
                <input
                  ref={parentItemNoRef}
                  style={{textAlign: 'center'}}
                  value={form.parentItemNo}
                  disabled={isLoaded}
                  onChange={(e) => {
                    setForm({...form, parentItemNo: e.target.value, moveWarehouse: 'A倉庫', moveStorage: '', qty: '1', janCode: ''})
                    setIsLoaded(false)
                    setRows([EMPTY_ROW])
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation()
                      handleSearch()
                    }
                  }}
                />
              </div>
              <div className='set-row set-row-shipping-record'>
                <label>倉庫／工場</label>
                <select
                  value={form.moveWarehouse}
                  onChange={(e) => setForm({...form, moveWarehouse: e.target.value})}
                  style={{textAlign: 'center'}}
                  disabled={!isLoaded}
                >
                  <option value='A倉庫'>A倉庫</option>
                  <option value='B倉庫'>B倉庫</option>
                  <option value='C工場'>C工場</option>
                  <option value='D工場'>D工場</option>
                </select>
              </div>
              <div className='set-row set-row-shipping-record'>
                <label>保管場所</label>
                <input
                  style={{textAlign: 'center'}}
                  value={form.moveStorage}
                  onChange={(e) => setForm({...form, moveStorage: e.target.value})}
                  disabled={!isLoaded}
                />
              </div>

              <div className='set-row set-row-shipping-record'>
                <label>数量</label>
                <input
                  style={{textAlign: 'center'}}
                  value={form.qty}
                  onChange={(e) => setForm({...form, qty: e.target.value})}
                  className='set-small'
                  disabled={!isLoaded}
                />
              </div>

              <div className='set-row set-row-shipping-record'>
                <label>JANコード／品目コード</label>
                <input
                  ref={janCodeRef}
                  style={{textAlign: 'center'}}
                  value={form.janCode}
                  onChange={(e) => setForm({...form, janCode: e.target.value})}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation()
                      handleJanCodeScan()
                    }
                  }}
                  disabled={!isLoaded}
                />
              </div>
              <div className='set-row set-row-shipping-record'>
                <label>移動先</label>
                <input
                  style={{textAlign: 'center'}}
                  value={form.parentWarehouse}
                  onChange={(e) => setForm({...form, parentWarehouse: e.target.value})}
                  disabled
                />
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              scrollRef={tableScrollRef}
              gridClassName='shipping-table'
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
                className='set-btn set-warning'
                onClick={() => {
                  if (!form.parentItemNo.trim()) {
                    setShowNoOrderConfirm(true)
                    return
                  }
                  clearFormAndRows()
                }}
              >
                完了
              </button>
              <button
                className='set-btn set-primary'
                onClick={() => {
                  if (!form.parentItemNo.trim()) {
                    setShowNoOrderConfirm(true)
                    return
                  }
                  sessionStorage.setItem(SESSION_KEY, JSON.stringify({form, rows, isLoaded, activeRowId}))
                  navigate('/factory/shipping-hand-input', {
                    state: {moveWarehouse: form.moveWarehouse, moveStorage: form.moveStorage},
                  })
                }}
              >
                手入力
              </button>
              <button
                className='set-btn set-success'
                onClick={() => setShowBackConfirm(true)}
              >
                戻る
              </button>
            </ActionFooter>
       </div>

            {showClearConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>{'\u8aad\u8fbc\u30c7\u30fc\u30bf\u3092\u7834\u68c4\u3057\u307e\u3059\u3002\n\u5b9c\u3057\u3044\u3067\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowClearConfirm(false)
                        clearFormAndRows()
                      }}
                    >
                    OK
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowClearConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showNoOrderConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>出荷Noを入力してください。</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowNoOrderConfirm(false)
                        parentItemNoRef.current?.focus()
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
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>{'\u30e1\u30cb\u30e5\u30fc\u306b\u623b\u308a\u307e\u3059\u3002\n\u8aad\u8fbc\u30c7\u30fc\u30bf\u3092\u7834\u68c4\u3057\u307e\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowBackConfirm(false)
                        clearFormAndRows()
                        navigate('/factory/factory')
                      }}
                    >
                      YES
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => {
                        saveStateToSession()
                        setShowBackConfirm(false)
                        navigate('/factory/factory')
                      }}
                    >
                      NO
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowBackConfirm(false)}
                    >
                      取消
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

export {ShippingRecordPage}
