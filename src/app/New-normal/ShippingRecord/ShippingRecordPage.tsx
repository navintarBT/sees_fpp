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
  build: number
  release: number
  move: string
  moveStorage: string
  name: string
  moveStorage2?: string
}

const SESSION_KEY = 'shippingRecordPageState'

const MOCK_SHIPPING: Record<string, {moveWarehouse: string; moveStorage: string; qty: string; janCode: string; rows: Row[]}> = {
  '3019': {
    moveWarehouse: '千葉工場：F0200',
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
        build: 2,
        release: 10,
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
        build: 7,
        release: 10,
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
        build: 3,
        release: 10,
        move: '',
        moveStorage: 'A-01-01',
        name: 'サンプル品名',
      },
    ],
  },
}

const ShippingRecordPage = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [form, setForm] = useState({
    parentWarehouse: '',
    parentItemNo: '',
    moveWarehouse: '',
    moveStorage: '',
    qty: '',
    janCode: '',
  })
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showRowClickConfirm, setShowRowClickConfirm] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const [activeRowId, setActiveRowId] = useState<number | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) {
      try {
        const state = JSON.parse(saved)
        setForm(state.form)
        setRows(state.rows)
        setIsLoaded(state.isLoaded)
        setActiveRowId(state.activeRowId)
      } catch {}
      sessionStorage.removeItem(SESSION_KEY)
    }
  }, [])

  const activeRow = rows.find((row) => row.id === activeRowId) ?? null
  const pressedKeysRef = useRef<{f1: boolean; f8: boolean}>({f1: false, f8: false})
  const isAnyModalOpen =
    showHandInputConfirm ||
    showClearConfirm ||
    showCompleteConfirm ||
    showRowClickConfirm ||
    showBackConfirm

  const closeAllModals = () => {
    setShowHandInputConfirm(false)
    setShowClearConfirm(false)
    setShowCompleteConfirm(false)
    setShowRowClickConfirm(false)
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
      setForm((prev) => ({...prev, moveWarehouse: '', moveStorage: '', qty: '', janCode: ''}))
      setRows([])
      setIsLoaded(false)
    }
  }

  const clearRows = () => setRows([])
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
    setIsLoaded(false)
    sessionStorage.removeItem(SESSION_KEY)
    resetTableScroll()
  }

  const saveStateToSession = () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({form, rows, isLoaded, activeRowId}))
  }

  const handleRowClick = (rowId: number) => {
    setActiveRowId((prev) => (prev === rowId ? null : rowId))
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
        return
      }

      if (event.key === 'Enter' && activeRow) {
        event.preventDefault()
        closeAllModals()
        setShowRowClickConfirm(true)
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
    {key: 'status', headClassName: 'col-status', cellClassName: 'col-status', header: '基本保管場所|', render: (row) => row.status},
    {key: 'build', headClassName: 'col-num', cellClassName: 'col-num', header: '指示', render: (row) => row.build},
    {key: 'release', headClassName: 'col-num', cellClassName: 'col-num', header: '数量', render: (row) => row.release},
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
                <div className='set-row'>
                <label>出荷指示No.</label>
                <input
                  style={{textAlign: 'center'}}
                  value={form.parentItemNo}
                  onChange={(e) => {
                    setForm({...form, parentItemNo: e.target.value, moveWarehouse: '', moveStorage: '', qty: '', janCode: ''})
                    setIsLoaded(false)
                    setRows([])
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch()
                  }}
                />
              </div>
              <div className='set-row'>
                <label>倉庫/工場</label>
                <select
                  value={form.moveWarehouse}
                  onChange={(e) => setForm({...form, moveWarehouse: e.target.value})}
                  style={{textAlign: 'center'}}
                  disabled={!isLoaded}
                >
                  <option value=''></option>
                  <option value='千葉倉庫（WMS）：W002'>千葉工場：F0200</option>
                  <option value='千葉倉庫（WMS）：W003'>千葉工場：F0201</option>
                  <option value='千葉倉庫（WMS）：W004'>千葉工場：F0202</option>
                </select>
              </div>
              <div className='set-row'>
                <label>保管場所</label>
                <input
                  style={{textAlign: 'center'}}
                  value={form.moveStorage}
                  onChange={(e) => setForm({...form, moveStorage: e.target.value})}
                  disabled={!isLoaded}
                />
              </div>

              <div className='set-row'>
                <label>数量</label>
                <input
                  style={{textAlign: 'center'}}
                  value={form.qty}
                  onChange={(e) => setForm({...form, qty: e.target.value})}
                  className='set-small'
                  disabled={!isLoaded}
                />
              </div>

              <div className='set-row'>
                <label>品目No</label>
                <input
                  style={{textAlign: 'center'}}
                  value={form.janCode}
                  onChange={(e) => setForm({...form, janCode: e.target.value})}
                  disabled={!isLoaded}
                />
              </div>
              <div className='set-row'>
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
                onClick={() => setShowCompleteConfirm(true)}
              >
                完了
              </button>     
              <button
                className='set-btn set-primary'
                onClick={() => setShowHandInputConfirm(true)}
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
                        sessionStorage.setItem(SESSION_KEY, JSON.stringify({form, rows, isLoaded, activeRowId}))
                        navigate('/factory/shipping-hand-input')
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

            {showRowClickConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>選択行の読込内容を表示しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        sessionStorage.setItem(SESSION_KEY, JSON.stringify({form, rows, isLoaded, activeRowId}))
                        setShowRowClickConfirm(false)
                        navigate('/factory/shipping-detail')
                      }}
                    >
                      はい
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => {
                        setShowRowClickConfirm(false)
                      }}
                    >
                      いいえ
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
