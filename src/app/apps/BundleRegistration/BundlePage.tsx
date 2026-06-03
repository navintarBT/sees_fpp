import {useEffect, useRef, useState, type ReactNode} from 'react'
import {useNavigate} from 'react-router-dom'
import {FaPlay} from 'react-icons/fa'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {TableSection, type TableColumn as TFTableColumn} from '../../components/TableSection/TableSection'

type Row = {
  id: number;
  error: string;
  fromTo: string;
  item: string;
  lot: string;
  quantity: number;
  warehouse: string;
  storage: string;
  productName: string;
};

const initialRows: Row[] = [
  {
    id: 1,
    error: "",
    fromTo: "F",
    item: "A01",
    lot: "L01",
    quantity: 1,
    warehouse: "W0020",
    storage: "W0045",
    productName: "品目1",
  },
  {
    id: 2,
    error: "",
    fromTo: "T",
    item: "B02",
    lot: "L02",
    quantity: 2,
    warehouse: "W0021",
    storage: "W0046",
    productName: "品目2",
  },
  {
    id: 3,
    error: "",
    fromTo: "F",
    item: "C03",
    lot: "L03",
    quantity: 3,
    warehouse: "W0022",
    storage: "W0047",
    productName: "品目3",
  },
  {
    id: 4,
    error: "",
    fromTo: "F",
    item: "D04",
    lot: "L04",
    quantity: 4,
    warehouse: "W0023",
    storage: "W0048",
    productName: "品目4",
  },
  {
    id: 5,
    error: "E",
    fromTo: "T",
    item: "E05",
    lot: "L05",
    quantity: 5,
    warehouse: "W0024",
    storage: "W0049",
    productName: "品目5",
  },
  {
    id: 6,
    error: "",
    fromTo: "T",
    item: "F06",
    lot: "L06",
    quantity: 6,
    warehouse: "W0025",
    storage: "W0050",
    productName: "品目6",
  },
  {
    id: 7,
    error: "E",
    fromTo: "F",
    item: "G07",
    lot: "L07",
    quantity: 7,
    warehouse: "W0026",
    storage: "W0051",
    productName: "品目7",
  },
  {
    id: 8,
    error: "",
    fromTo: "T",
    item: "H08",
    lot: "L08",
    quantity: 8,
    warehouse: "W0027",
    storage: "W0052",
    productName: "品目8",
  },
  {
    id: 9,
    error: "",
    fromTo: "T",
    item: "I09",
    lot: "L09",
    quantity: 9,
    warehouse: "W0028",
    storage: "W0053",
    productName: "品目9",
  },
  {
    id: 10,
    error: "E",
    fromTo: "F",
    item: "J10",
    lot: "L10",
    quantity: 10,
    warehouse: "W0029",
    storage: "W0054",
    productName: "品目10",
  },
  {
    id: 11,
    error: "E",
    fromTo: "F",
    item: "J10",
    lot: "L10",
    quantity: 11,
    warehouse: "W0030",
    storage: "W0055",
    productName: "品目11",
  },
  {
    id: 12,
    error: "E",
    fromTo: "F",
    item: "J10",
    lot: "L10",
    quantity: 12,
    warehouse: "W0031",
    storage: "W0056",
    productName: "品目12",
  },
]


const BundlePage = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([])
  const [form, setForm] = useState({
    parentWarehouse: '',
    parentItemNo: '',
    moveWarehouse: '',
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
  const janCodeInputRef = useRef<HTMLInputElement | null>(null)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [quantityRange, setQuantityRange] = useState<'from' | 'to'>('from')
  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const [shouldFocusJanCodeAfterComplete, setShouldFocusJanCodeAfterComplete] = useState(false)
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
    resetTableScroll()
  }

  const handleBackCancelClick = () => {
    setShowBackConfirm(false)
    setTimeout(() => {
      janCodeInputRef.current?.focus()
      janCodeInputRef.current?.select()
    }, 0)
  }

  const handleHandInputNoClick = () => {
    setShowHandInputConfirm(false)
    setTimeout(() => {
      janCodeInputRef.current?.focus()
      janCodeInputRef.current?.select()
    }, 0)
  }

  const handleClearNoClick = () => {
    setShowClearConfirm(false)
    setTimeout(() => {
      janCodeInputRef.current?.focus()
      janCodeInputRef.current?.select()
    }, 0)
  }

  const handleCompleteNoClick = () => {
    setShowCompleteConfirm(false)
    setTimeout(() => {
      janCodeInputRef.current?.focus()
      janCodeInputRef.current?.select()
    }, 0)
  }

  const handleCompleteYesClick = () => {
    setShowCompleteConfirm(false)
    setRows([])
    setActiveRowId(null)
    setForm((prev) => ({
      ...prev,
      moveStorage: '',
      janCode: '',
    }))
    resetTableScroll()
    setShouldFocusJanCodeAfterComplete(true)
  }

  useEffect(() => {
    if (!shouldFocusJanCodeAfterComplete || showCompleteConfirm) return
    const timer = window.setTimeout(() => {
      janCodeInputRef.current?.focus()
      janCodeInputRef.current?.select()
      setShouldFocusJanCodeAfterComplete(false)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [shouldFocusJanCodeAfterComplete, showCompleteConfirm])

  const handleReleaseClick = (options?: {forceRelease?: boolean; forceHandInput?: boolean}) => {
    if (isAnyModalOpen) return
    if (options?.forceHandInput) {
      closeAllModals()
      setShowHandInputConfirm(true)
      return
    }
  }

  const handleJanCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 14)
    setForm((prev) => ({...prev, janCode: digitsOnly}))
  }

  const handleJanCodeEnter = () => {
    if (!/^\d{1,14}$/.test(form.janCode)) return
    setRows(initialRows)
    setActiveRowId(null)
    resetTableScroll()
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
      key: "arrow",
      headClassName: "col-arrow-head",
      cellClassName: "col-arrow",
      header: "",
      render: (row) =>
        activeRowId === row.id ? <FaPlay className="col-row-arrow" /> : null,
    },
    {
      key: "error",
      headClassName: "col-error",
      cellClassName: "col-error",
      header: "",
      render: (row) => row.error,
    },
    {
      key: "fromTo",
      headClassName: "col-fromTo",
      cellClassName: "col-fromTo",
      header: "From/To",
      render: (row) => row.fromTo,
    },
    {
      key: "item",
      headClassName: "col-item",
      cellClassName: "col-item",
      header: "品目No.",
      render: (row) => row.item,
    },
    {
      key: "lot",
      headClassName: "col-lot",
      cellClassName: "col-lot",
      header: "ロットシリアル",
      render: (row) => row.lot,
    },
    {
      key: "Quantity",
      headClassName: "col-quantity",
      cellClassName: "col-quantity",
      header: "数量",
      render: (row) => row.quantity,
    },
    {
      key: "Warehouse",
      headClassName: "col-warehouse",
      cellClassName: "col-warehouse",
      header: "倉庫",
      render: (row) => row.warehouse,
    },
    {
      key: "storage",
      headClassName: "col-storage",
      cellClassName: "col-storage",
      header: "保管場所",
      render: (row) => row.storage,
    },
    {
      key: "productName",
      headClassName: "col-productName",
      cellClassName: "col-productName",
      header: "品名",
      render: (row) => row.productName,
    },
  ];

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>販売セット登録</div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row'>
                <label>FR倉庫</label>
                <select
                  value={form.parentWarehouse}
                  onChange={(e) => setForm({...form, parentWarehouse: e.target.value})}
                >
                  <option value=''></option>
                  <option value='羽田製品倉庫：W0040'>羽田製品倉庫：W0020</option>
                  <option value='羽田製品倉庫：W0041'>羽田製品倉庫：W0021</option>
                  <option value='羽田製品倉庫：W0042'>羽田製品倉庫：W0022</option>
                </select>
              </div>
              <div className='set-row'>
                <label>TO倉庫</label>
                <select
                  value={form.moveWarehouse}
                  onChange={(e) => setForm({...form, moveWarehouse: e.target.value})}
                >
                  <option value=''></option>
                  <option value='千葉倉庫（WMS）：W002'>千葉倉庫（WMS）：W002</option>
                  <option value='千葉倉庫（WMS）：W003'>千葉倉庫（WMS）：W003</option>
                  <option value='千葉倉庫（WMS）：W004'>千葉倉庫（WMS）：W004</option>
                </select>
              </div>
              <div className='set-row set-row-inline'>
                <label>保管場所</label>
                <input
                  value={form.parentItemNo}
                  onChange={(e) => setForm({...form, parentItemNo: e.target.value})}
                  className='set-small'
                />
                <span className='set-inline-label'>数量</span>
                <input
                  value={form.qty}
                  onChange={(e) => setForm({...form, qty: e.target.value})}
                />
              </div>

              <div className='set-row'>
                <div className='set-radio-group'>
                  <label className='set-radio'>
                    <input
                      type='radio'
                      name='quantityRange'
                      value='from'
                      checked={quantityRange === 'from'}
                      onChange={() => setQuantityRange('from')}
                    />
                    From
                  </label>
                  <label className='set-radio'>
                    <input
                      type='radio'
                      name='quantityRange'
                      value='to'
                      checked={quantityRange === 'to'}
                      onChange={() => setQuantityRange('to')}
                    />
                    To
                  </label>
                </div>
                <div className='set-row set-row-bundle'>
                <label>JANコード</label>
                <input
                  ref={janCodeInputRef}
                  inputMode='numeric'
                  maxLength={14}
                  value={form.janCode}
                  onChange={(e) => handleJanCodeChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return
                    e.preventDefault()
                    handleJanCodeEnter()
                  }}
                />
              </div>
              </div>
            
              <div className='set-row'>
                <label>理由</label>
                <input
                  value={form.moveStorage}
                  onChange={(e) => setForm({...form, moveStorage: e.target.value})}
                />
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName='bundle-table'
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              onRowActivate={(rowKey) => setActiveRowId(Number(rowKey))}
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
                        navigate('/factory/bundle-hand-input')
                      }}
                    >
                      YES
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={handleHandInputNoClick}
                    >
                      NO
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
                      YES
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={handleClearNoClick}
                    >
                      NO
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showCompleteConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>備品振分登録<br />を完了しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={handleCompleteYesClick}
                    >
                      YES
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={handleCompleteNoClick}
                    >
                      NO
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
                      YES
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowBackConfirm(false)}
                    >
                      NO
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={handleBackCancelClick}
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

export {BundlePage}
