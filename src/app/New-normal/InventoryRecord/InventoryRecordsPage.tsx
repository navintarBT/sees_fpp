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
  inspection: string
  instruct: string
  Load: number
  productName: string
}

const MOCK_INVENTORY: Record<string, {parentWarehouse: string; moveStorage: string; qty: string; rows: Row[]}> = {
  '3019': {
    parentWarehouse: '羽田製品倉庫：W0040',
    moveStorage: 'F0200',
    qty: '1',
    rows: [
      {
        id: 1,
        error: '',
        item: '1197101',
        lot: '',
        lot2: '*',
        inspection: '3',
        instruct: '3',
        Load: 1,
        productName: 'サンプル品名',
      },
            {
        id: 2,
        error: '',
        item: '1197102',
        lot: '',
        lot2: '*',
        inspection: '3',
        instruct: '2',
        Load: 1,
        productName: 'サンプル品名',
      },
      {
        id: 3,
        error: '',
        item: '1197103',
        lot: '',
        lot2: '*',
        inspection: '5',
        instruct: '4',
        Load: 1,
        productName: 'サンプル品名',
      },
    ],
  },
}

const InventoryRecordsPage = () => {
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
    source: '',
  })
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showRowClickConfirm, setShowRowClickConfirm] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const [activeRowId, setActiveRowId] = useState<number | null>(null)
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


  useEffect(() => {
    const saved = sessionStorage.getItem('inventory-records-state')
    if (saved) {
      const {form: f, rows: r, isLoaded: l, activeRowId: a} = JSON.parse(saved)
      setForm(f)
      setRows(r)
      setIsLoaded(l)
      setActiveRowId(a)
      sessionStorage.removeItem('inventory-records-state')
    }
  }, [])

  const handleSearch = () => {
    const data = MOCK_INVENTORY[form.parentItemNo]
    if (data) {
      const {rows: mockRows, ...formData} = data
      setForm((prev) => ({...prev, ...formData, moveWarehouse: '', janCode: ''}))
      setRows(mockRows)
      setIsLoaded(true)
    } else {
      setForm((prev) => ({...prev, parentWarehouse: '', moveStorage: '', qty: '', moveWarehouse: '', janCode: ''}))
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
      source: '',
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
    resetTableScroll()
    sessionStorage.removeItem('inventory-records-state')
  }

  const saveStateToSession = () => {
    sessionStorage.setItem(
      'inventory-records-state',
      JSON.stringify({form, rows, isLoaded, activeRowId}),
    )
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

      if (event.key === 'Enter') {
        event.preventDefault()
        if (activeRowId !== null) {
          closeAllModals()
          setShowRowClickConfirm(true)
        }
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
    {key: 'instruct', headClassName: 'col-instruct', cellClassName: 'col-instruct', header: '指示', render: (row) => row.instruct},
    {key: 'Load', headClassName: 'col-Load', cellClassName: 'col-Load', header: '読込', render: (row) => row.Load},
    {key: 'productName', headClassName: 'col-productName', cellClassName: 'col-productName', header: '品名', render: (row) => row.productName},
    {key: 'inspection', headClassName: 'col-inspection', cellClassName: 'col-inspection', header: '検査', render: (row) => row.inspection},
  ]

  return (
    <div className='mockup-page' style={{textAlign: 'center'}}>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>入庫実績登録</div>
          <div className='set-body'>
            <div className='set-form inventory-records-form'>
              <div className='set-row'>
                <label>出荷/発注No.</label>
                <input
                  value={form.parentItemNo}
                  onChange={(e) => {
                    setForm({...form, parentItemNo: e.target.value, parentWarehouse: '', moveStorage: '', qty: '', moveWarehouse: '', janCode: ''})
                    setIsLoaded(false)
                    setRows([])
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch()
                  }}
                />
              </div>
              <div className='set-row'>
                <label>倉庫</label>
                <select
                  value={form.parentWarehouse}
                  onChange={(e) => setForm({...form, parentWarehouse: e.target.value})}
                  disabled={!isLoaded}
                >
                  <option value=''></option>
                  <option value='羽田製品倉庫：W0040'>羽田製品倉庫：W0040</option>
                  <option value='千葉倉庫（WMS）：W002'>千葉倉庫（WMS）：W002</option>
                  <option value='千葉倉庫（WMS）：W003'>千葉倉庫（WMS）：W003</option>
                  <option value='千葉倉庫（WMS）：W004'>千葉倉庫（WMS）：W004</option>
                </select>
              </div>
              <div className='set-row'>
                <label>保管場所</label>
                <input
                  value={form.moveStorage}
                  onChange={(e) => setForm({...form, moveStorage: e.target.value})}
                  disabled
                />
              </div>
              <div className='set-row'>
                <label>ロット状況</label>
                <select
                  value={form.moveWarehouse}
                  onChange={(e) => setForm({...form, moveWarehouse: e.target.value})}
                  disabled={!isLoaded}
                >
                  <option value=''></option>
                  <option value='検査中'>検査中</option>
                </select>
              </div>
              <div className='set-row'>
                <label>数量</label>
                <input
                  value={form.qty}
                  onChange={(e) => setForm({...form, qty: e.target.value})}
                  className='set-small'
                  disabled={!isLoaded}
                />
              </div>
              <div className='set-row'>
                <label>JANコード ／品目コード</label>
                <input
                  value={form.janCode}
                  onChange={(e) => setForm({...form, janCode: e.target.value})}
                  disabled={!isLoaded}
                />
              </div>
              <div className='set-row'>
                <label>移動元</label>
                <input
                  value={form.source}
                  onChange={(e) => setForm({...form, source: e.target.value})}
                  disabled
                />
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              scrollRef={tableScrollRef}
              gridClassName='inventory-table'
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
                className='set-btn set-primary '
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
                  <div className='set-modal-body'>{'\u8aad\u8fbc\u30c7\u30fc\u30bf\u3092\u7834\u68c4\u3057\u307e\u3059\u3002'}<br />{'\u5b9c\u3057\u3044\u3067\u3059\u304b\uff1f'}</div>
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
                        saveStateToSession()
                        navigate('/factory/inventory-hand-input')
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
                  <div className='set-modal-body'>メニューに戻ります。<br /> 読込データを破棄しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory/factory')
                      }}
                    >
                      YES
                    </button>
                     <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
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
                        setShowRowClickConfirm(false)
                        saveStateToSession()
                        navigate('/factory/inventory-detail')
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

export {InventoryRecordsPage}
