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

type InternalLabelPreset = {
  shipmentQty: string
  storage: string
  office: string
  lot: string
}

type SelectedRowPayload = {
  woNumber: string
  partNumber: string
  reqNumber: string
}

const INTERNAL_LABEL_PRESETS: Record<string, InternalLabelPreset> = {
  '部品001 LOT0130': {
    shipmentQty: '8',
    storage: 'LOC-001',
    office: 'Fxxx',
    lot: 'LOT-0130',
  },
  '部品001 LOT-0202': {
    shipmentQty: '2',
    storage: 'LOC-001',
    office: 'Fxxx',
    lot: '*',
  },
}

const initialRows: Row[] = [
  {
    id: 1,
    woNumber: 'WO-001',
    partNumber: '部品001',
    reqNumber: '10',
    storage: 'LOC-001',
    lot: '',
    numOfShipments: '',
    office: '',
  },
  {
    id: 2,
    woNumber: 'WO-001',
    partNumber: '部品002',
    reqNumber: '10',
    storage: 'LOC-002',
    lot: '',
    numOfShipments: '',
    office: '',
  },
    {
    id: 13,
    woNumber: 'WO-002',
    partNumber: '部品002',
    reqNumber: '10',
    storage: 'LOC-002',
    lot: '',
    numOfShipments: '',
    office: '',
  },
  {
    id: 3,
    woNumber: 'WO-003',
    partNumber: '部品003',
    reqNumber: '10',
    storage: 'LOC-003',
    lot: '',
    numOfShipments: '',
    office: '',
  },
  {
    id: 4,
    woNumber: 'WO-004',
    partNumber: '部品004',
    reqNumber: '10',
    storage: 'LOC-004',
    lot: '',
    numOfShipments: '',
    office: '',
  },
  {
    id: 5,
    woNumber: 'WO-005',
    partNumber: '部品005',
    reqNumber: '10',
    storage: 'LOC-005',
    lot: '',
    numOfShipments: '',
    office: '',
  },
  {
    id: 6,
    woNumber: 'WO-006',
    partNumber: '部品006',
    reqNumber: '10',
    storage: 'LOC-006',
    lot: '',
    numOfShipments: '',
    office: '',
  },
  {
    id: 7,
    woNumber: 'WO-007',
    partNumber: '部品007',
    reqNumber: '10',
    storage: 'LOC-007',
    lot: '',
    numOfShipments: '',
    office: '',
  },
  {
    id: 8,
    woNumber: 'WO-008',
    partNumber: '部品008',
    reqNumber: '10',
    storage: 'LOC-008',
    lot: '',
    numOfShipments: '',
    office: '',
  },
  {
    id: 9,
    woNumber: 'WO-009',
    partNumber: '部品009',
    reqNumber: '10',
    storage: 'LOC-009',
    lot: '',
    numOfShipments: '',
    office: '',
  },
  {
    id: 10,
    woNumber: 'WO-010',
    partNumber: '部品010',
    reqNumber: '10',
    storage: 'LOC-010',
    lot: '',
    numOfShipments: '',
    office: '',
  },
  {
    id: 11,
    woNumber: 'WO-011',
    partNumber: '部品011',
    reqNumber: '10',
    storage: 'LOC-011',
    lot: '',
    numOfShipments: '',
    office: '',
  },
  {
    id: 12,
    woNumber: 'WO-012',
    partNumber: '部品012',
    reqNumber: '10',
    storage: 'LOC-012',
    lot: '',
    numOfShipments: '',
    office: '',
  },
]

const WOPartsIssuance = () => {
  const navigate = useNavigate()
  const initialForm = {
    parentWarehouse: '羽田製品倉庫：W0040',
    parentItemNo: '0193090',
    moveWarehouse: '千葉倉庫（WMS）：W002',
    woNumber: '',
    internalLabel: '',
    shipmentQty: '',
    storage: '',
    office: '',
    janCode: '',
  }
  const [rows, setRows] = useState<Row[]>([])
  const [form, setForm] = useState(initialForm)
  const [showDetailConfirm, setShowDetailConfirm] = useState(false)
  const [showNoSelectionAlert, setShowNoSelectionAlert] = useState(false)
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [showPrinting, setShowPrinting] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showRegistrationComplete, setShowRegistrationComplete] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const woNumberInputRef = useRef<HTMLInputElement | null>(null)
  const internalLabelInputRef = useRef<HTMLInputElement | null>(null)
  const shipmentQtyInputRef = useRef<HTMLInputElement | null>(null)
  const [isInternalLabelLocked, setIsInternalLabelLocked] = useState(true)
  const [isIssueDetailLocked, setIsIssueDetailLocked] = useState(true)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const sourceRowsRef = useRef<Row[]>(initialRows)
  const pressedKeysRef = useRef<{f1: boolean; f8: boolean}>({f1: false, f8: false})
  const isAnyModalOpen =
    showHandInputConfirm ||
    showRegistration ||
    showPrinting ||
    showClearConfirm ||
    showCompleteConfirm ||
    showRegistrationComplete ||
    showBackConfirm

  const closeAllModals = () => {
    setShowHandInputConfirm(false)
    setShowRegistration(false)
    setShowPrinting(false)
    setShowClearConfirm(false)
    setShowCompleteConfirm(false)
    setShowRegistrationComplete(false)
    setShowBackConfirm(false)
    setShowDetailConfirm(false)
    setShowNoSelectionAlert(false)

  }


  const clearRows = () => setRows([])
  const resetToInitialDisplay = () => {
    closeAllModals()
    setRows([])
    setForm(initialForm)
    setIsInternalLabelLocked(true)
    setIsIssueDetailLocked(true)
    setActiveRowId(null)
    resetTableScroll()
    requestAnimationFrame(() => {
      woNumberInputRef.current?.focus()
    })
  }
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

  const handleSearchWoNumber = () => {
    const keywords = form.woNumber
      .split(/[,\.\u3001]+/)
      .map((v) => v.trim().toUpperCase())
      .filter((v) => v.length > 0)

    if (keywords.length === 0) {
      return
    }

    const keywordSet = new Set(keywords)
    const matchedRows = sourceRowsRef.current
      .filter((row) => keywordSet.has(row.woNumber.toUpperCase()))

    if (matchedRows.length === 0) {
      return
    }

    setRows(matchedRows)
    setIsInternalLabelLocked(false)
    setActiveRowId(null)
    requestAnimationFrame(() => {
      internalLabelInputRef.current?.focus()
    })
  }

  const handleReleaseClick = (options?: {forceRelease?: boolean; forceHandInput?: boolean}) => {
    if (isAnyModalOpen) return
    if (options?.forceHandInput) {
      closeAllModals()
      setShowHandInputConfirm(true)
      return
    }
  }

  const applyDecide = () => {
    const shipmentQty = form.shipmentQty.trim()
    const storage = form.storage.trim()
    const office = form.office.trim()
    const lot = INTERNAL_LABEL_PRESETS[form.internalLabel.trim()]?.lot

    if (!shipmentQty || !storage || !office) {
      return
    }

    const qtyToAdd = Number(shipmentQty)
    if (!Number.isFinite(qtyToAdd)) {
      return
    }

    const woKeywords = form.woNumber
      .split(/[,\.\u3001]+/)
      .map((v) => v.trim().toUpperCase())
      .filter((v) => v.length > 0)

    setRows((prev) => {
      const targetIndex = prev.findIndex(
        (row) =>
          row.storage.trim().toUpperCase() === storage.toUpperCase() &&
          (woKeywords.length === 0 || woKeywords.includes(row.woNumber.toUpperCase())),
      )

      if (targetIndex === -1) {
        return prev
      }

      const targetRow = prev[targetIndex]
      const currentQty = Number(targetRow.numOfShipments || '0')
      const nextQty = (Number.isFinite(currentQty) ? currentQty : 0) + qtyToAdd

      const updatedRow: Row = {
        ...targetRow,
        lot: lot ?? targetRow.lot,
        numOfShipments: String(nextQty),
        office,
      }

      const nextRows = [...prev]
      nextRows[targetIndex] = updatedRow
      return nextRows
    })

    setForm((prev) => ({
      ...prev,
      internalLabel: '',
      shipmentQty: '',
      storage: '',
      office: '',
    }))
    setIsIssueDetailLocked(true)
    requestAnimationFrame(() => {
      internalLabelInputRef.current?.focus()
    })
  }

  const handleDecide = () => {
    if (isAnyModalOpen) return
    closeAllModals()
    setShowHandInputConfirm(true)
  }

  const selectedRowPayload: SelectedRowPayload | null = (() => {
    if (activeRowId == null) return null
    const row = rows.find((item) => item.id === activeRowId)
    if (!row) return null
    return {
      woNumber: row.woNumber,
      partNumber: row.partNumber,
      reqNumber: row.reqNumber,
    }
  })()

  const handleInternalLabelEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    const preset = INTERNAL_LABEL_PRESETS[form.internalLabel.trim()]
    if (!preset) {
      return
    }
    setForm((prev) => ({
      ...prev,
      shipmentQty: preset.shipmentQty,
      storage: preset.storage,
      office: preset.office,
    }))
    setIsIssueDetailLocked(false)
    requestAnimationFrame(() => {
      shipmentQtyInputRef.current?.focus()
    })
  }


  useEffect(() => {
    woNumberInputRef.current?.focus()
  }, [])

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
          <div className='set-header'>WO部品出庫　WO別</div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row set-row-wo'>
                <label>WO番号</label>
                <input
                  ref={woNumberInputRef}
                  style={{textAlign: 'center'}}
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
                <label>庫内ラベル</label>
                <input
                  ref={internalLabelInputRef}
                  disabled={isInternalLabelLocked}
                  value={form.internalLabel}
                  onChange={(e) => setForm({...form, internalLabel: e.target.value})}
                  onKeyDown={handleInternalLabelEnter}
                  style={{textAlign: 'center'}}
                />
              </div>
              <div className='set-row'>
                <label>出庫数</label>
                <input
                  ref={shipmentQtyInputRef}
                  disabled={isIssueDetailLocked}
                  value={form.shipmentQty}
                  onChange={(e) => setForm({...form, shipmentQty: e.target.value})}
                  style={{textAlign: 'center'}}
                />
              </div>
              <div className='set-row'>
                <label>保管場所</label>
                <input
                  disabled={isIssueDetailLocked}
                  value={form.storage}
                  onChange={(e) => setForm({...form, storage: e.target.value})}
                  style={{textAlign: 'center'}}
                />
              </div>
              <div className='set-row'>
                <label>事業所</label>
                <input
                  disabled={isIssueDetailLocked}
                  style={{textAlign: 'center'}}
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
                setActiveRowId((prev) => (prev === selectedRow.id ? null : selectedRow.id))
              }}
            />

            <ActionFooter columns={5}>
              <button
                className='set-btn set-primary set-success'
                onClick={handleDecide}
              >
                決定
              </button>
              <button
                className='set-btn set-danger'
                onClick={() => setShowRegistration(true)}
              >
                出庫登録
              </button>
              <button
                className='set-btn set-primary'
                onClick={() => setShowPrinting(true)}
                style={{fontSize: '35px'}}
              >
                出庫票印刷
              </button>   
              <button
                className='set-btn set-primary set-hand-input-btn'
                onClick={() => {
                  if (activeRowId == null) {
                    setShowNoSelectionAlert(true)
                    return
                  }
                  setShowDetailConfirm(true)
                }}
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
                  <div className='set-modal-body'>登録しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        applyDecide()
                        setShowHandInputConfirm(false)
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

            {showRegistration && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>登録しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowRegistration(false)
                        setShowRegistrationComplete(true)
                      }}
                    >
                      {'\u306f\u3044'}
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowRegistration(false)}
                    >
                      {'\u3044\u3044\u3048'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showRegistrationComplete && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>登録しました。</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={resetToInitialDisplay}
                    >
                      OK
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
                      onClick={() => {
                        setShowPrinting(false)
                      }}
                    >
                      {'\u306f\u3044'}
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowPrinting(false)}
                    >
                      {'\u3044\u3044\u3048'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showNoSelectionAlert && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>選択行がありません</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => setShowNoSelectionAlert(false)}
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showDetailConfirm && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>明細を確認しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowDetailConfirm(false)
                        navigate('/factory/wo-parts-issuance-detail', {
                          state: selectedRowPayload,
                        })
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
                  <div className='set-modal-header'>{'\u78ba\u8a8d'}</div>
                  <div className='set-modal-body'>メニューに戻ります。<br /> 読込データを破棄しますか？</div>
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
                      onClick={() => {
                        setShowBackConfirm(false)
                        navigate('/factory/button-access')
                      }}
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
