import {useEffect, useRef, useState, type ReactNode} from 'react'
import {useNavigate} from 'react-router-dom'
import {FaPlay} from 'react-icons/fa'
import {ActionFooter} from '../../components/ActionFooter/ActionFooter'
import {TableSection, type TableColumn as TFTableColumn} from '../../components/TableSection/TableSection'

type Row = {
  id: number
  woNumber: string
  partNumber: string
  reqNumber: string
  lot: string
  numOfShipments: string
  office: string
  storage: string
}

const initialRows: Row[] = [
  {
    id: 1,
    woNumber: 'WO-001',
    partNumber: '部品001',
    reqNumber: '10',
    storage: 'LOC-001',
    lot: 'LOT-0130',
    numOfShipments: '000000000001',
    office: 'Fxxxxxxxx',
  },
  {
    id: 2,
    woNumber: 'WO-001',
    partNumber: '部品002',
    reqNumber: '10',
    storage: 'LOC-002',
    lot: 'LOT-0131',
    numOfShipments: '000000000002',
    office: 'Fxxxxxxxx',
  },
    {
    id: 2,
    woNumber: 'WO-002',
    partNumber: '部品002',
    reqNumber: '10',
    storage: 'LOC-002',
    lot: 'LOT-0131',
    numOfShipments: '000000000002',
    office: 'Fxxxxxxxx',
  },
  {
    id: 3,
    woNumber: 'WO-003',
    partNumber: '部品003',
    reqNumber: '10',
    storage: 'LOC-003',
    lot: 'LOT-0132',
    numOfShipments: '000000000003',
    office: 'Fxxxxxxxx',
  },
  {
    id: 4,
    woNumber: 'WO-004',
    partNumber: '部品004',
    reqNumber: '10',
    storage: 'LOC-004',
    lot: 'LOT-0134',
    numOfShipments: '000000000004',
    office: 'Fxxxxxxxx',
  },
  {
    id: 5,
    woNumber: 'WO-005',
    partNumber: '部品005',
    reqNumber: '10',
    storage: 'LOC-005',
    lot: 'LOT-0135',
    numOfShipments: '000000000005',
    office: 'Fxxxxxxxx',
  },
  {
    id: 6,
    woNumber: 'WO-006',
    partNumber: '部品006',
    reqNumber: '10',
    storage: 'LOC-006',
    lot: 'LOT-0136',
    numOfShipments: '000000000006',
    office: 'Fxxxxxxxx',
  },
  {
    id: 7,
    woNumber: 'WO-007',
    partNumber: '部品007',
    reqNumber: '10',
    storage: 'LOC-007',
    lot: 'LOT-0137',
    numOfShipments: '000000000007',
    office: 'Fxxxxxxxx',
  },
  {
    id: 8,
    woNumber: 'WO-008',
    partNumber: '部品008',
    reqNumber: '10',
    storage: 'LOC-008',
    lot: 'LOT-0138',
    numOfShipments: '000000000008',
    office: 'Fxxxxxxxx',
  },
  {
    id: 9,
    woNumber: 'WO-009',
    partNumber: '部品009',
    reqNumber: '10',
    storage: 'LOC-009',
    lot: 'LOT-0139',
    numOfShipments: '000000000009',
    office: 'Fxxxxxxxx',
  },
  {
    id: 10,
    woNumber: 'WO-010',
    partNumber: '部品010',
    reqNumber: '10',
    storage: 'LOC-010',
    lot: 'LOT-0140',
    numOfShipments: '000000000010',
    office: 'Fxxxxxxxx',
  },
  {
    id: 11,
    woNumber: 'WO-011',
    partNumber: '部品011',
    reqNumber: '10',
    storage: 'LOC-011',
    lot: 'LOT-0141',
    numOfShipments: '000000000011',
    office: 'Fxxxxxxxx',
  },
  {
    id: 12,
    woNumber: 'WO-012',
    partNumber: '部品012',
    reqNumber: '10',
    storage: 'LOC-012',
    lot: 'LOT-0142',
    numOfShipments: '000000000012',
    office: 'Fxxxxxxxx',
  },
]

const WOPartsIssuance = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([])
  const [form, setForm] = useState({
    parentWarehouse: '羽田製品倉庫：W0040',
    parentItemNo: '0193090',
    moveWarehouse: '千葉倉庫（WMS）：W002',
    woNumber: '',
    internalLabel: '',
    shipmentQty: '',
    storage: '',
    office: '',
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
  const sourceRowsRef = useRef<Row[]>(initialRows)
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
      woNumber: '',
      internalLabel: '',
      shipmentQty: '',
      storage: '',
      office: '',
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

  const handleSearchWoNumber = () => {
    const keywords = form.woNumber
      .split(/[,\.\u3001]+/)
      .map((v) => v.trim().toUpperCase())
      .filter(Boolean)

    if (keywords.length === 0) {
      setRows(sourceRowsRef.current)
      return
    }

    const keywordSet = new Set(keywords)
    const matchedRows = sourceRowsRef.current
      .filter((row) => keywordSet.has(row.woNumber.toUpperCase()))

    setRows(matchedRows)
    setActiveRowId(null)
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
  }, [isAnyModalOpen])

  const tableColumns: Array<TFTableColumn<Row>> = [
       {
      key: 'arrow',
      headClassName: 'col-arrow-head',
      cellClassName: 'col-arrow',
      header: '',
      render: (row) => (activeRowId === row.id ? <FaPlay className='col-row-arrow' /> : null),
    },
    {key: 'woNumber', headClassName: 'col-woNumber', cellClassName: 'col-woNumber', header: 'WO番号', render: (row) => row.woNumber},
    {key: 'partNumber', headClassName: 'col-partNumber', cellClassName: 'col-partNumber', header: '品番', render: (row) => row.partNumber},
    {key: 'reqNumber', headClassName: 'col-reqNumber', cellClassName: 'col-reqNumber', header: '必要数', render: (row) => row.reqNumber},
    {key: 'storage', headClassName: 'col-storage', cellClassName: 'col-storage', header: '保管場所', render: (row) => row.storage},
    {key: 'lot', headClassName: 'col-lot', cellClassName: 'col-lot', header: 'ロット', render: (row) => row.lot},
    {key: 'numOfShipments', headClassName: 'col-numOfShipments', cellClassName: 'col-numOfShipments', header: '出庫数', render: (row) => row.numOfShipments},
    {key: 'office', headClassName: 'col-office', cellClassName: 'col-office', header: '事業所', render: (row) => row.office},
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>セット構成登録</div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row set-row-wo'>
                <label>WO番号</label>
                <input
                  value={form.woNumber}
                  onChange={(e) => setForm({...form, woNumber: e.target.value})}
                  className='set-small'
                />
                <button
                className='set-search-btn set-success'
                onClick={handleSearchWoNumber}
              >
                WO部品リスト表示
              </button>
              </div>
              <div className='set-row'>
                <label>庫内ﾗﾍﾞﾙ</label>
                <input
                  value={form.internalLabel}
                  onChange={(e) => setForm({...form, internalLabel: e.target.value})}
                />
              </div>
              <div className='set-row'>
                <label>出庫数</label>
                <input
                  value={form.shipmentQty}
                  onChange={(e) => setForm({...form, shipmentQty: e.target.value})}
                />
              </div>
              <div className='set-row'>
                <label>保管場所</label>
                <input
                  value={form.storage}
                  onChange={(e) => setForm({...form, storage: e.target.value})}
                />
              </div>
              <div className='set-row'>
                <label>事業所</label>
                <input
                  value={form.office}
                  onChange={(e) => setForm({...form, office: e.target.value})}
                />
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              gridClassName='woPartsIssuance-table'
              onRowActivate={(rowKey) => {
                const selectedRow = rows.find((row) => row.id === Number(rowKey))
                if (!selectedRow) return
                setActiveRowId(selectedRow.id)
                setForm((prev) => ({
                  ...prev,
                  internalLabel: selectedRow.woNumber,
                  shipmentQty: selectedRow.reqNumber,
                  storage: selectedRow.storage,
                  office: selectedRow.office,
                }))
              }}
            />

            <ActionFooter columns={5}>
              <button
                className='set-btn set-primary set-success'

                onClick={() => handleReleaseClick({forceHandInput: true})}
              >
                決定
              </button>
              <button
                className='set-btn set-danger'
                onClick={() => setShowClearConfirm(true)}
              >
                出庫登録
              </button>
              <button
                className='set-btn set-primary'
                onClick={() => setShowCompleteConfirm(true)}
                style={{fontSize: '35px'}}
              >
                出庫票印刷
              </button>   
              <button
                className='set-btn set-primary set-hand-input-btn'
                onClick={() => navigate('/factory/wo-parts-issuance-detail')}
              >
                明細確認
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
                        navigate('/factory/button-access')
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

export {WOPartsIssuance}
