import {useEffect, useRef, useState, type ReactNode} from 'react'
import {useNavigate} from 'react-router-dom'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {TableSection, type TableColumn as TFTableColumn} from '../../components/TableSection/TableSection'

type Row = {
  id: number
  office: string
  storage: string
  numOfShipments: string
  Interior: string
  lot: string
}

type TableColumn = {
  key: string
  headClassName: string
  cellClassName: string
  header: ReactNode
  render: (row: Row) => ReactNode
}

const WOPartsIssuanceDetail = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      Interior: '部品001',
      office:'Fxxxxx', 
      storage: 'LOC-012',
      numOfShipments: '8',
      lot: 'LOT-012',
    },
    {
      id: 2,
      Interior: '部品002',
      office:'Fxxxxx', 
      storage: 'LOC-013',
      numOfShipments: '2',
      lot: 'LOT-013',
    },
    {
      id: 3,
      Interior: '部品003',
      office:'Fxxxxx', 
      storage: 'LOC-014',
      numOfShipments: '3',
      lot: 'LOT-014',
    },
    {
      id: 4,
      Interior: '部品004',
      office:'Fxxxxx', 
      storage: 'LOC-015',
      numOfShipments: '4',
      lot: 'LOT-015',
    },
    {
      id: 5,
      Interior: '部品005',
      office:'Fxxxxx', 
      storage: 'LOC-016',
      numOfShipments: '5',
      lot: 'LOT-016',
    },
    {
      id: 6,
      Interior: '部品006',
      office:'Fxxxxx', 
      storage: 'LOC-017',
      numOfShipments: '6',
      lot: 'LOT-017',
    },
    {
      id: 7,
      Interior: '部品007',
      office:'Fxxxxx', 
      storage: 'LOC-018',
      numOfShipments: '7',
      lot: 'LOT-018',
    },
    {
      id: 8,
      Interior: '部品008',
      office:'Fxxxxx', 
      storage: 'LOC-019',
      numOfShipments: '8',
      lot: 'LOT-019',
    },
    {
      id: 9,
      Interior: '部品009',
      office:'Fxxxxx', 
      storage: 'LOC-020',
      numOfShipments: '9',
      lot: 'LOT-020',
    },
    {
      id: 13,
      Interior: '部品010',
      office:'Fxxxxx', 
      storage: 'LOC-021',
      numOfShipments: '10',
      lot: 'LOT-021',
    },
    {
      id: 11,
      Interior: '部品011',
      office:'Fxxxxx', 
      storage: 'LOC-022',
      numOfShipments: '11',
      lot: 'LOT-022',
    },
    {
      id: 12,
      Interior: '部品012',
      office:'Fxxxxx', 
      storage: 'LOC-023',
      numOfShipments: '12',
      lot: 'LOT-023',
    },
     {
      id: 14,
      Interior: '部品010',
      office:'Fxxxxx', 
      storage: 'LOC-021',
      numOfShipments: '10',
      lot: 'LOT-021',
    },
     {
      id: 10,
      Interior: '部品010',
      office:'Fxxxxx', 
      storage: 'LOC-021',
      numOfShipments: '10',
      lot: 'LOT-021',
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
  const [parentItem, setParentItem] = useState('部品001')
  const [parentSerial, setParentSerial] = useState('WO-001')
  const [moveStorage, setMoveStorage] = useState('10')
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showDetailConfirm, setShowDetailConfirm] = useState(false)
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
    showDetailConfirm ||
    showBackConfirm

  const closeAllModals = () => {
    setShowHandInputConfirm(false)
    setShowDeleteConfirm(false)
    setShowNoSelectionConfirm(false)
    setShowClearConfirm(false)
    setShowCompleteConfirm(false)
    setShowDetailConfirm(false)
    setShowBackConfirm(false)
  }

  const clearRows = () => {
    setRows([])
    setCheckedRowIds([])
  }

  const deleteCheckedRows = () => {
    setRows((prev) => prev.filter((row) => !checkedRowIds.includes(row.id)))
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
    {key: 'Interior', headClassName: 'col-Interior', cellClassName: 'col-Interior', header: '保管場所', render: (row) => row.Interior},
    {key: 'lot', headClassName: 'col-lot', cellClassName: 'col-lot', header: 'LOT', render: (row) => row.lot},
    {key: 'numOfShipments', headClassName: 'col-numOfShipments', cellClassName: 'col-numOfShipments', header: '出庫数', render: (row) => row.numOfShipments},
    {key: 'office', headClassName: 'col-office', cellClassName: 'col-office', header: '事業所', render: (row) => row.office},
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>投入明細確認画面</div>
          <div className='set-body'>
                <div className='set-form'>
                  <div className='set-row'>
                    <label>WO番号</label>
                    <input
                      value={parentSerial}
 
                      readOnly
                    />
                  </div>
                    <div className='set-row'>
                    <label>品番</label>
                    <input
                      value={parentItem}

                      readOnly
                    />
                  </div>
                  <div className='set-row'>
                    <label>必要数</label>
                    <input
                      value={moveStorage}
                      readOnly
                    />
                  </div>
                </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              gridClassName='woPartsIssuanceDetail-table'
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              onRowActivate={(rowKey) => handleRowClick(Number(rowKey))}
            />

            <ActionFooter columns={5}>
              <button
                className='set-btn set-primary'
                onClick={() => setShowCompleteConfirm(true)}
                style={{ visibility: 'hidden' }}
              >
                出庫登録
              </button>
              <button
                className='set-btn set-danger'
                onClick={() => {
                  if (checkedRowIds.length === 0) {
                    setShowNoSelectionConfirm(true)
                  } else {
                    setShowDeleteConfirm(true)
                  }
                }}
              >
                削除
              </button>   
              <button
                className='set-btn set-primary set-success'
                onClick={() => handleReleaseClick({forceHandInput: true})}
                style={{ visibility: 'hidden' }}
              >
                出庫票印刷
              </button>
              <button
                className='set-btn set-primary set-hand-input-btn'
                onClick={() => setShowDetailConfirm(true)}
                style={{ visibility: 'hidden' }}

              >
                明細確認
              </button>
              <button
                className='set-btn set-success'
                onClick={() => setShowBackConfirm(true)}
              >
                戻る

              </button>
            </ActionFooter>
       </div>

            {showDeleteConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>選択した行を削除しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        deleteCheckedRows()
                      }}
                    >
                      はい
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowDeleteConfirm(false)}
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
                  <div className='set-modal-body'>{'\u30e1\u30cb\u30e5\u30fc\u306b\u623b\u308a\u307e\u3059\u3002'}<br />{'\u8aad\u8fbc\u30c7\u30fc\u30bf\u3092\u7834\u68c4\u3057\u307e\u3059\u304b\uff1f'}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory/wo-parts-issuance')
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

export {WOPartsIssuanceDetail}
