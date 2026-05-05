import {useEffect, useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {FaPlay} from 'react-icons/fa'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {TableSection, type TableColumn as TFTableColumn} from '../../components/TableSection/TableSection'

type Row = {
  id: number
  source_location: string
  item_no: string
  transfer_qty: string
  product_name: string
  dest_location: string
  lot_serial_no: string
}

const initialRows: Row[] = [
  {
    id: 1,
    source_location: 'WO-0001',
    item_no: '1197101',
    lot_serial_no: '001',
    transfer_qty: '10',
    product_name: 'ITE-IR11ZZ',
    dest_location: '',
  },
  {
    id: 2,
    source_location: 'WO-0001',
    item_no: '1197102',
    lot_serial_no: '002',
    transfer_qty: '20',
    product_name: 'ITE-IR12ZZ',
    dest_location: '',
  },
  {
    id: 3,
    source_location: 'WO-0002',
    item_no: '1197102',
    lot_serial_no: '002',
    transfer_qty: '30',
    product_name: 'ITE-IR12ZZ',
    dest_location: '',
  },
  {
    id: 4,
    source_location: 'WO-0003',
    item_no: '1197103',
    lot_serial_no: '003',
    transfer_qty: '40',
    product_name: 'ITE-IR13ZZ',
    dest_location: '',
  },
  {
    id: 5,
    source_location: 'WO-0004',
    item_no: '1197104',
    lot_serial_no: '004',
    transfer_qty: '50',
    product_name: 'ITE-IR14ZZ',
    dest_location: '',
  },
  {
    id: 6,
    source_location: 'WO-0005',
    item_no: '1197105',
    lot_serial_no: '005',
    transfer_qty: '60',
    product_name: 'ITE-IR15ZZ',
    dest_location: '',
  },
  {
    id: 7,
    source_location: 'WO-0006',
    item_no: '1197106',
    lot_serial_no: '006',
    transfer_qty: '70',
    product_name: 'ITE-IR16ZZ',
    dest_location: '',
  },
  {
    id: 8,
    source_location: 'WO-0007',
    item_no: '1197107',
    lot_serial_no: '007',
    transfer_qty: '80',
    product_name: 'ITE-IR17ZZ',
    dest_location: '',
  },
  {
    id: 9,
    source_location: 'WO-0008',
    item_no: '1197108',
    lot_serial_no: '008',
    transfer_qty: '90',
    product_name: 'ITE-IR18ZZ',
    dest_location: '',
  },
  {
    id: 10,
    source_location: 'WO-0009',
    item_no: '1197109',
    lot_serial_no: '009',
    transfer_qty: '100',
    product_name: 'ITE-IR19ZZ',
    dest_location: '',
  },
  {
    id: 11,
    source_location: 'WO-0010',
    item_no: '1197110',
    lot_serial_no: '010',
    transfer_qty: '110',
    product_name: 'ITE-IR20ZZ',
    dest_location: '',
  },
  {
    id: 12,
    source_location: 'WO-0011',
    item_no: '1197111',
    lot_serial_no: '011',
    transfer_qty: '120',
    product_name: 'ITE-IR21ZZ',
    dest_location: '',
  },
  {
    id: 13,
    source_location: 'WO-0012',
    item_no: '1197112',
    lot_serial_no: '012',
    transfer_qty: '130',
    product_name: 'ITE-IR22ZZ',
    dest_location: '',
  },
]

const ShelfTransfer = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([])
  const [form, setForm] = useState({
    parentWarehouse: '葉工場：F0200',  // ✅ 倉庫
    parentStorage: 'W0040',            // ✅ 保管場所 (แยกออกมา)
    parentItemNo: '0193090',
    moveWarehouse: '千葉倉庫（WMS）：W002',
    source_location: '',
    internalLabel: '',
    shipmentQty: '',
    lot_serial_no: '',
    office: '',
    transfer_qty: '',
    janCode: '',
    dest_location: '',
  })
  const [showDetailConfirm, setShowDetailConfirm] = useState(false)
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [showPrinting, setShowPrinting] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const sourceRowsRef = useRef<Row[]>(initialRows)
  const pressedKeysRef = useRef<{f1: boolean; f8: boolean}>({f1: false, f8: false})
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('')

  const isAnyModalOpen =
    showHandInputConfirm ||
    showRegistration ||
    showPrinting ||
    showClearConfirm ||
    showCompleteConfirm ||
    showBackConfirm

  useEffect(() => {
    const allRows = sourceRowsRef.current.map(row => ({
      ...row,
      dest_location: '',
    }))
    setRows(allRows)
  }, [])

  const closeAllModals = () => {
    setShowHandInputConfirm(false)
    setShowRegistration(false)
    setShowPrinting(false)
    setShowClearConfirm(false)
    setShowCompleteConfirm(false)
    setShowBackConfirm(false)
    setShowDetailConfirm(false)
  }

  const clearRows = () => setRows([])

  const clearForm = () =>
    setForm({
      parentWarehouse: '',   // ✅
      parentStorage: '',     // ✅
      parentItemNo: '',
      moveWarehouse: '',
      source_location: '',
      internalLabel: '',
      shipmentQty: '',
      lot_serial_no: '',
      office: '',
      janCode: '',
      dest_location: '',
      transfer_qty: '',
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

  // ✅ ใช้ parentStorage แทน parentWarehouse
  const handleSearchsource_location = () => {
    const selectedLocation = form.parentStorage

    if (activeRowId !== null) {
      // มีการเลือก row → ใส่ค่าให้เฉพาะ row นั้น
      setRows(prevRows =>
        prevRows.map(row =>
          row.id === activeRowId
            ? {...row, dest_location: selectedLocation}
            : row
        )
      )
    } else {
      // ไม่ได้เลือก row → ใส่ค่าให้ทุก row
      setRows(prevRows =>
        prevRows.map(row => ({...row, dest_location: selectedLocation}))
      )
    }
  }

  const handleWarehouseSelect = (warehouseValue: string) => {
    setSelectedWarehouse(warehouseValue)
    if (warehouseValue && activeRowId !== null) {
      setRows(prevRows =>
        prevRows.map(row =>
          row.id === activeRowId
            ? {...row, dest_location: warehouseValue}
            : row
        )
      )
    }
  }

  const handleRowActivate = (rowKey: string | number) => {
    const selectedRow = rows.find((row) => row.id === Number(rowKey))
    if (!selectedRow) return
    setActiveRowId(selectedRow.id)
    setForm((prev) => ({
      ...prev,
      internalLabel: selectedRow.item_no,
      shipmentQty: selectedRow.product_name,
      lot_serial_no: selectedRow.lot_serial_no,
      transfer_qty: selectedRow.transfer_qty,
      dest_location: selectedRow.dest_location,
    }))
    if (selectedRow.dest_location) {
      setSelectedWarehouse(selectedRow.dest_location)
    } else {
      setSelectedWarehouse('')
    }
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
      if (isAnyModalOpen) return

      if (event.key === 'F1') pressedKeysRef.current.f1 = true
      if (event.key === 'F8') pressedKeysRef.current.f8 = true

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
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'F1') pressedKeysRef.current.f1 = false
      if (event.key === 'F8') pressedKeysRef.current.f8 = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [isAnyModalOpen])

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'arrow',
      headClassName: 'col-arrow-head',
      cellClassName: 'col-arrow',
      header: '',
      render: (row) => (activeRowId === row.id ? <FaPlay className='col-row-arrow' /> : null),
    },
    {key: 'source_location', headClassName: 'col-woNumber', cellClassName: 'col-woNumber', header: '元保管場所', render: (row) => row.source_location},
    {key: 'item_no', headClassName: 'col-item_no', cellClassName: 'col-partNumber', header: '品目No', render: (row) => row.item_no},
    {key: 'lot_serial_no', headClassName: 'col-reqNumber', cellClassName: 'col-reqNumber', header: 'ロットシリアル', render: (row) => row.lot_serial_no},
    {key: 'transfer_qty', headClassName: 'col-storage', cellClassName: 'col-storage', header: '移動数', render: (row) => row.transfer_qty},
    {key: 'product_name', headClassName: 'col-lot', cellClassName: 'col-lot', header: '品名', render: (row) => row.product_name},
    {key: 'dest_location', headClassName: 'col-dest_location', cellClassName: 'col-dest_location', header: '先保管場所', render: (row) => row.dest_location || ''},
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>棚移動登録</div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row'>
                <label>品目No.</label>
                <input
                  value={form.internalLabel}
                  onChange={(e) => setForm({...form, internalLabel: e.target.value})}
                />
              </div>

              {/* ✅ 倉庫 — ใช้ parentWarehouse */}
              <div className='set-row'>
                <label>倉庫</label>
                <select
                  value={form.parentWarehouse}
                  onChange={(e) => setForm({...form, parentWarehouse: e.target.value})}
                >
                  <option value=''></option>
                  <option value='葉工場：F0200'>千葉工場：F0200</option>
                  <option value='葉工場：F0201'>千葉工場：F0201</option>
                  <option value='葉工場：F0202'>千葉工場：F0202</option>
                </select>
              </div>

              {/* ✅ 保管場所 — ใช้ parentStorage แยกออกมา */}
              <div className='set-row set-row-wo'>
                <label>保管場所</label>
                <select
                  value={form.parentStorage}
                  onChange={(e) => setForm({...form, parentStorage: e.target.value})}
                >
                  <option value=''></option>
                  <option value='W0040'>W0040</option>
                  <option value='W0041'>W0041</option>
                  <option value='W0042'>W0042</option>
                  <option value='W0043'>W0043</option>
                  <option value='W0044'>W0044</option>
                  <option value='W0045'>W0045</option>
                  <option value='W0046'>W0046</option>
                </select>
                <button
                  className='set-search-btn set-success'
                  onClick={handleSearchsource_location}
                >
                  一括
                </button>
              </div>

              <div className='set-row'>
                <label>品名</label>
                <input
                  value={form.shipmentQty}
                  onChange={(e) => setForm({...form, shipmentQty: e.target.value})}
                />
              </div>
              <div className='set-row'>
                <label>ロットシリアル</label>
                <input
                  value={form.lot_serial_no}
                  onChange={(e) => setForm({...form, lot_serial_no: e.target.value})}
                />
              </div>
              <div className='set-row set-row-wo'>
                <label>移動数量</label>
                <input
                  value={form.transfer_qty}
                  onChange={(e) => setForm({...form, transfer_qty: e.target.value})}
                />
                <button
                  className='set-search-btn set-primary'
                  onClick={handleSearchsource_location}
                >
                  EA
                </button>
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              gridClassName='ShelfTransfer-table'
              onRowActivate={handleRowActivate}
            />

            <ActionFooter columns={4}>
              <button
                className='set-btn set-danger'
                onClick={() => handleReleaseClick({forceHandInput: true})}
              >
                破棄
              </button>
              <button
                className='set-btn set-warning'
                onClick={() => setShowRegistration(true)}
              >
                {activeRowId === null ? '移動元登録完了' : '完了'}
              </button>
              <button
                className='set-btn set-primary'
                onClick={() => setShowPrinting(true)}
                style={{fontSize: '35px', visibility: activeRowId === null ? 'hidden' : 'visible'}}
              >
                登録
              </button>
              <button
                className='set-btn set-success'
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
                <div className='set-modal-body'>変更を確認しますか？</div>
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
                    onClick={() => setShowHandInputConfirm(false)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}

          {showRegistration && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>登録しますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowRegistration(false)}
                  >
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowRegistration(false)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPrinting && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>印刷しますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowPrinting(false)}
                  >
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowPrinting(false)}
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDetailConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>詳細を確認しますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowDetailConfirm(false)
                      navigate('/factory/wo-parts-issuance-detail')
                    }}
                  >
                    はい
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowDetailConfirm(false)}
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
                <div className='set-modal-body'>
                  メニューに戻ります。<br />読込データを破棄しますか？
                </div>
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
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowBackConfirm(false)}
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

export {ShelfTransfer}