import {useEffect, useRef, useState, type ReactNode} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {FaPlay} from 'react-icons/fa'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {TableSection, type TableColumn as TFTableColumn} from '../../components/TableSection/TableSection'

const TERMINAL_ID = 'ABCDEFGHIJKLMNOPQRST'
const ORIENTATION_KEY = 'inventoryRecordsOrientation'

type Row = {
  id: number
  error: string
  item: string
  lot: string
  lot2: string
  inspection: string
  rowNo: string
  instruct: string
  Load: string
  productName: string
}

const EMPTY_ROW: Row = {
  id: 1,
  error: '',
  item: '',
  lot: '',
  lot2: '',
  inspection: '',
  rowNo: '',
  instruct: '',
  Load: '' ,
  productName: '',
}

const MOCK_INVENTORY: Record<string, {parentWarehouse: string; moveStorage: string; qty: string; janCode: string; janCodeDisabled?: boolean; rows: Row[]}> = {
  '12345678': {
    parentWarehouse: 'A倉庫',
    moveStorage: 'JDE基本保管場所',
    qty: '1',
    janCode: '',
    rows: [
      {
        id: 1,
        error: '',
        item: '1001',
        lot: 'Lot001',
        lot2: '',
        inspection: '',
        rowNo: '',
        instruct: '3',
        Load: '0',
        productName: '品名001',
      },
      {
        id: 2,
        error: '',
        item: '1002',
        lot: 'Lot002',
        lot2: '*',
        inspection: '',
        rowNo: '',
        instruct: '2',
        Load: '2',
        productName: '品名002',
      },
      {
        id: 3,
        error: 'E',
        item: '1003',
        lot: 'Lot003',
        lot2: '*',
        inspection: '〇',
        rowNo: '',
        instruct: '15',
        Load: '15',
        productName: '品名003',
      },
    ],
  },
  'OT-12345678': {
    parentWarehouse: 'C事業所',
    moveStorage: '工場基本保管場所',
    qty: '1',
    janCode: '',
    rows: [
      {
        id: 1,
        error: '',
        item: '1001',
        lot: 'Lot001',
        lot2: '',
        inspection: '',
        rowNo: '',
        instruct: '3',
        Load: '0',
        productName: '品名001',
      },
      {
        id: 2,
        error: '',
        item: '1002',
        lot: 'Lot002',
        lot2: '*',
        inspection: '',
        rowNo: '',
        instruct: '2',
        Load: '2',
        productName: '品名002',
      },
      {
        id: 3,
        error: 'E',
        item: '1003',
        lot: 'Lot003',
        lot2: '*',
        inspection: '○',
        rowNo: '',
        instruct: '15',
        Load: '15',
        productName: '品名003',
      },
    ],
  },
  '12345678MB123456': {
    parentWarehouse: 'D事業所',
    moveStorage: '工場基本保管場所',
    qty: '3',
    janCode: '1005',
    janCodeDisabled: true,
    rows: [
      {
        id: 1,
        error: '',
        item: '1005',
        lot: '',
        lot2: '',
        inspection: '',
        rowNo: '123456',
        instruct: '3',
        Load: '3',
        productName: '品名005',
      },
    ],
  },
}

const MOCK_JAN_CODE: Record<string, number> = {
  '987654321': 1,
}

const MOCK_JAN_INSPECTION: Record<string, number> = {
  '987654321': 3,
}

const MOCK_ITEM_NAMES: Record<string, string> = {
  '1001': '品名001',
  '1002': '品名002',
  '1003': '品名003',
  '1004': '品名004',
  '1005': '品名005',
}

const InventoryRecordsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLandscape] = useState(() => {
    const navOrientation = (location.state as {orientation?: 'portrait' | 'landscape'} | null)?.orientation
    if (navOrientation) {
      sessionStorage.setItem(ORIENTATION_KEY, navOrientation)
      return navOrientation === 'landscape'
    }
    return sessionStorage.getItem(ORIENTATION_KEY) === 'landscape'
  })
  const [printerDest, setPrinterDest] = useState('')
  const [rows, setRows] = useState<Row[]>([EMPTY_ROW])
  const [isLoaded, setIsLoaded] = useState(false)
  const [form, setForm] = useState({
    parentWarehouse: 'A倉庫',
    parentItemNo: '',
    moveWarehouse: '',
    moveStorage: '',
    qty: '1',
    janCode: '',
    source: '',
  })
  const [janCodeDisabled, setJanCodeDisabled] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showNoOrderConfirm, setShowNoOrderConfirm] = useState(false)
  const [showQtyEmptyConfirm, setShowQtyEmptyConfirm] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const parentItemNoRef = useRef<HTMLInputElement | null>(null)
  const janCodeRef = useRef<HTMLInputElement | null>(null)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const activeRow = rows.find((row) => row.id === activeRowId) ?? null
  const pressedKeysRef = useRef<{f1: boolean; f8: boolean}>({f1: false, f8: false})
  const isAnyModalOpen =
    showClearConfirm ||
    showNoOrderConfirm ||
    showQtyEmptyConfirm ||
    showBackConfirm

  const closeAllModals = () => {
    setShowClearConfirm(false)
    setShowQtyEmptyConfirm(false)
    setShowBackConfirm(false)
  }


  useEffect(() => {
    const saved = sessionStorage.getItem('inventory-records-state')
    const handResult = sessionStorage.getItem('inventory-hand-input-result')
    if (saved) {
      const {form: f, rows: r, isLoaded: l, janCodeDisabled: jcd} = JSON.parse(saved)
      setForm(f)
      setIsLoaded(l)
      setJanCodeDisabled(jcd ?? false)
      setActiveRowId(null)
      if (handResult) {
        sessionStorage.removeItem('inventory-hand-input-result')
        const {itemNo, lot, qty} = JSON.parse(handResult)
        const nextId = Math.max(...(r as Row[]).map((row) => row.id), 0) + 1
        const newRow: Row = {
          id: nextId,
          error: '',
          item: itemNo,
          lot: lot,
          lot2: '',
          inspection: '',
          rowNo: '',
          instruct: qty,
          Load: qty,
          productName: MOCK_ITEM_NAMES[itemNo] ?? '',
        }
        setRows([...(r as Row[]), newRow])
      } else {
        setRows(r)
      }
      sessionStorage.removeItem('inventory-records-state')
    }
  }, [])

  useEffect(() => {
    parentItemNoRef.current?.focus()
  }, [])

  useEffect(() => {
    if (isLoaded) janCodeRef.current?.focus()
  }, [isLoaded])

  const handleSearch = () => {
    const data = MOCK_INVENTORY[form.parentItemNo]
    if (data) {
      const {rows: mockRows, janCodeDisabled: jcd, ...formData} = data
      setForm((prev) => ({...prev, ...formData, moveWarehouse: ''}))
      setJanCodeDisabled(jcd ?? false)
      setRows(mockRows)
      setIsLoaded(true)
    } else {
      setForm((prev) => ({...prev, parentWarehouse: 'A倉庫', moveStorage: '', qty: '1', moveWarehouse: '', janCode: ''}))
      setJanCodeDisabled(false)
      setRows([])
      setIsLoaded(false)
    }
  }

  const clearRows = () => setRows([EMPTY_ROW])
  const clearForm = () =>
    setForm({
      parentWarehouse: 'A倉庫',
      parentItemNo: '',
      moveWarehouse: '',
      moveStorage: '',
      qty: '1',
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
    setJanCodeDisabled(false)
    resetTableScroll()
    sessionStorage.removeItem('inventory-records-state')
  }

  const saveStateToSession = () => {
    sessionStorage.setItem(
      'inventory-records-state',
      JSON.stringify({form, rows, isLoaded, activeRowId, janCodeDisabled}),
    )
  }

  const handleJanCodeScan = () => {
    const janCode = form.janCode.trim()
    const loadRowId = MOCK_JAN_CODE[janCode]
    const inspectionRowId = MOCK_JAN_INSPECTION[janCode]
    setRows((prev) =>
      prev.map((row) => {
        let updated = row
        if (loadRowId != null && row.id === loadRowId) updated = {...updated, Load: form.qty}
        if (inspectionRowId != null && row.id === inspectionRowId) updated = {...updated, inspection: '○'}
        return updated
      }),
    )
    janCodeRef.current?.focus()
  }

  const handleRowClick = (rowId: number) => {
    const isActivating = activeRowId !== rowId
    setActiveRowId((prev) => (prev === rowId ? null : rowId))
    if (isActivating) {
      saveStateToSession()
      navigate('/factory/inventory-detail', {state: {activeRowId: rowId, orderNo: form.parentItemNo, orientation: isLandscape ? 'landscape' : 'portrait'}})
    }
  }

  const handleReflect = () => {
    if (!form.qty.trim()) {
      setShowQtyEmptyConfirm(true)
      return
    }
    setRows((prev) => prev.map((row, index) => (index === 0 ? {...row, Load: form.qty} : row)))
  }

  const handleReleaseClick = (options?: {forceRelease?: boolean; forceHandInput?: boolean}) => {
    if (isAnyModalOpen) return
    if (options?.forceHandInput) {
      closeAllModals()
      if (!form.parentItemNo) {
        setShowNoOrderConfirm(true)
        return
      }
      saveStateToSession()
      navigate('/factory/inventory-hand-input', {state: {orderNo: form.parentItemNo, orientation: isLandscape ? 'landscape' : 'portrait'}})
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
        if (!isLoaded) {
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
    {key: 'rowNo', headClassName: 'col-rowNo', cellClassName: 'col-rowNo', header: '行番号', render: (row) => row.rowNo},
  ]

  const landscapeTableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'detail',
      headClassName: 'col-detail',
      cellClassName: 'col-detail',
      header: '',
      render: () => <button className='inbound-detail-btn set-primary'>詳細</button>,
    },
    ...tableColumns,
  ]

  return (
    <div className='mockup-page' style={{textAlign: 'center'}}>
      <div className={isLandscape ? 'mockup-stage mockup-stage-dark mockup-stage-landscape' : 'mockup-stage mockup-stage-dark'}>
        <div className='mockup-frame'>
          {isLandscape ? (
            <>
              <div className='set-header-landscape'>
                <span className='set-header-title'>入庫実績登録</span>
                <span className='set-header-terminal-id'>端末ID：{TERMINAL_ID}</span>
              </div>
              <div className='set-body-landscape'>
                <div className='set-form-landscape'>
                  <div className='set-form-landscape-row'>
                    <div className='set-field-landscape'>
                      <label style={{width: 279, flexShrink: 0}}>出荷No.／発注No.</label>
                      <input
                        ref={parentItemNoRef}
                        style={{width: 370}}
                        value={form.parentItemNo}
                        disabled={isLoaded}
                        onChange={(e) => {
                          setForm({...form, parentItemNo: e.target.value, parentWarehouse: 'A倉庫', moveStorage: '', qty: '1', moveWarehouse: '', janCode: ''})
                          setIsLoaded(false)
                          setJanCodeDisabled(false)
                          setRows([EMPTY_ROW])
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSearch()
                        }}
                      />
                    </div>
                  </div>
                  <div className='set-form-landscape-row'>
                    <div className='set-field-landscape'>
                      <label style={{width: 279, flexShrink: 0}}>倉庫</label>
                      <select
                        style={{width: 370}}
                        value={form.parentWarehouse}
                        onChange={(e) => setForm({...form, parentWarehouse: e.target.value})}
                        disabled={!isLoaded}
                      >
                        <option value='A倉庫'>A倉庫</option>
                        <option value='B倉庫'>B倉庫</option>
                        <option value='C事業所'>C事業所</option>
                        <option value='D事業所'>D事業所</option>
                      </select>
                    </div>
                    <div className='set-field-landscape'>
                      <label style={{width: 370, flexShrink: 0}}>保管場所</label>
                      <input
                        style={{width: 226}}
                        value={form.moveStorage}
                        onChange={(e) => setForm({...form, moveStorage: e.target.value})}
                        disabled={!isLoaded}
                      />
                    </div>
                    <div className='set-field-landscape'>
                      <label style={{width: 250, flexShrink: 0}}>ロット状況</label>
                      <select
                        style={{width: 240}}
                        value={form.moveWarehouse}
                        onChange={(e) => setForm({...form, moveWarehouse: e.target.value})}
                        disabled
                      >
                        <option value=''></option>
                        <option value='検査中'>検査中</option>
                      </select>
                    </div>
                  </div>
                  <div className='set-form-landscape-row'>
                    <div className='set-field-landscape'>
                      <label style={{width: 279, flexShrink: 0}}>数量</label>
                      <div style={{display: 'flex', alignItems: 'center', gap: 14, width: 370, flexShrink: 0}}>
                        <input
                          style={{flex: 1, minWidth: 0}}
                          value={form.qty}
                          onChange={(e) => setForm({...form, qty: e.target.value})}
                          disabled={!isLoaded}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              janCodeRef.current?.focus()
                            }
                          }}
                        />
                        <button
                          className='set-search-btn set-success'
                          disabled={!isLoaded}
                          onClick={handleReflect}
                          style={!isLoaded ? {background: '#d9d9d9', color: '#666'} : undefined}
                        >
                          反映
                        </button>
                      </div>
                    </div>
                    <div className='set-field-landscape'>
                      <label style={{width: 370, flexShrink: 0}}>JANコード／品目コード</label>
                      <input
                        ref={janCodeRef}
                        style={{width: 226}}
                        value={form.janCode}
                        onChange={(e) => setForm({...form, janCode: e.target.value})}
                        disabled={!isLoaded || janCodeDisabled}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleJanCodeScan()
                          }
                        }}
                      />
                    </div>
                    <div className='set-field-landscape'>
                      <label style={{width: 250, flexShrink: 0}}>移動元（移動先）</label>
                      <input
                        style={{width: 240}}
                        value={form.source}
                        onChange={(e) => setForm({...form, source: e.target.value})}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <TableSection
                  columns={landscapeTableColumns}
                  rows={rows}
                  scrollRef={tableScrollRef}
                  gridClassName='inventory-table inbound-table-landscape'
                  gridStyle={{gridTemplateColumns: '90px 50px 50px minmax(110px, 1fr) minmax(150px, 1.2fr) 50px minmax(90px, 0.7fr) minmax(90px, 0.7fr) minmax(160px, 1.4fr) minmax(100px, 0.7fr) minmax(110px, 0.8fr)'}}
                  getRowKey={(row) => row.id}
                  activeRowKey={activeRowId}
                  onRowActivate={(rowKey) => handleRowClick(Number(rowKey))}
                />

                <div className='set-printer-row-landscape'>
                  <label>出力先プリンター</label>
                  <select
                    value={printerDest}
                    onChange={(e) => setPrinterDest(e.target.value)}
                  >
                    <option value=''></option>
                    <option value='プリンター1'>プリンター1</option>
                    <option value='プリンター2'>プリンター2</option>
                    <option value='Printer-3-ABCDE12345'>Printer-3-ABCDE12345</option>
                  </select>
                </div>

                <ActionFooter columns={5}>
                  <button
                    className='set-btn set-btn-landscape set-danger'
                    onClick={() => setShowClearConfirm(true)}
                  >
                    破棄
                  </button>
                  <button
                    className='set-btn set-btn-landscape set-primary'
                    onClick={() => {
                      if (!form.parentItemNo) {
                        setShowNoOrderConfirm(true)
                        return
                      }
                      saveStateToSession()
                      navigate('/factory/inventory-hand-input', {state: {orderNo: form.parentItemNo, orientation: 'landscape'}})
                    }}
                  >
                    手入力
                  </button>
                  <button
                    className='set-btn set-btn-landscape set-success'
                    onClick={() => setShowBackConfirm(true)}
                  >
                    戻る
                  </button>
                  <div aria-hidden='true' />
                  <button
                    className='set-btn set-btn-landscape set-warning'
                    onClick={() => {
                      if (!isLoaded) {
                        setShowNoOrderConfirm(true)
                      } else {
                        clearFormAndRows()
                      }
                    }}
                  >
                    完了
                  </button>
                </ActionFooter>
              </div>
            </>
          ) : (
            <>
              <div className='set-header'>入庫実績登録</div>
              <div className='set-body'>
                <div className='set-form inventory-records-form'>
                  <div className='set-row'>
                    <label>出荷No.／発注No.</label>
                    <input
                      ref={parentItemNoRef}
                      value={form.parentItemNo}
                      disabled={isLoaded}
                      onChange={(e) => {
                        setForm({...form, parentItemNo: e.target.value, parentWarehouse: 'A倉庫', moveStorage: '', qty: '1', moveWarehouse: '', janCode: ''})
                        setIsLoaded(false)
                        setJanCodeDisabled(false)
                        setRows([EMPTY_ROW])
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
                      <option value='A倉庫'>A倉庫</option>
                      <option value='B倉庫'>B倉庫</option>
                      <option value='C事業所'>C事業所</option>
                      <option value='D事業所'>D事業所</option>
                    </select>
                  </div>
                  <div className='set-row'>
                    <label>保管場所</label>
                    <input
                      value={form.moveStorage}
                      onChange={(e) => setForm({...form, moveStorage: e.target.value})}
                      disabled={!isLoaded}
                    />
                  </div>
                  <div className='set-row'>
                    <label>ロット状況</label>
                    <select
                      value={form.moveWarehouse}
                      onChange={(e) => setForm({...form, moveWarehouse: e.target.value})}
                      disabled
                    >
                      <option value=''></option>
                      <option value='検査中'>検査中</option>
                    </select>
                  </div>
                  <div className='set-row set-row-wo'>
                    <label>数量</label>
                    <input
                      value={form.qty}
                      onChange={(e) => setForm({...form, qty: e.target.value})}
                      className='set-small'
                      disabled={!isLoaded}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          janCodeRef.current?.focus()
                        }
                      }}
                    />
                    <button
                      className='set-search-btn set-success'
                      disabled={!isLoaded}
                      onClick={handleReflect}
                      style={!isLoaded ? {background: '#d9d9d9', color: '#666'} : undefined}
                    >
                      反映
                    </button>
                  </div>
                  <div className='set-row'>
                    <label>JANコード ／品目コード</label>
                    <input
                      ref={janCodeRef}
                      value={form.janCode}
                      onChange={(e) => setForm({...form, janCode: e.target.value})}
                      disabled={!isLoaded || janCodeDisabled}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleJanCodeScan()
                        }
                      }}
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
                    onClick={() => {
                      if (!isLoaded) {
                        setShowNoOrderConfirm(true)
                      } else {
                        clearFormAndRows()
                      }
                    }}
                  >
                    完了
                  </button>
                  <button
                    className='set-btn set-primary '
                    onClick={() => {
                      if (!form.parentItemNo) {
                        setShowNoOrderConfirm(true)
                        return
                      }
                      saveStateToSession()
                      navigate('/factory/inventory-hand-input', {state: {orderNo: form.parentItemNo, orientation: 'portrait'}})
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
            </>
          )}

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
                  <div className='set-modal-body'>オーダーNo.を入力して下さい。</div>
                  <div className='set-modal-actions'>
                    <button className='set-modal-btn set-modal-yes' onClick={() => setShowNoOrderConfirm(false)}>
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showQtyEmptyConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>数量を入力してください。</div>
                  <div className='set-modal-actions'>
                    <button className='set-modal-btn set-modal-yes' onClick={() => setShowQtyEmptyConfirm(false)}>
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
                  <div className='set-modal-body'>{'メニューに戻ります。\n読込データを破棄しますか？'}</div>
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

export {InventoryRecordsPage}
