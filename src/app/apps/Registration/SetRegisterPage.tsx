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
  status: string
  build: number
  release: number
  move: string
  moveStorage: string
  name: string
  moveStorage2?: string
}

type TableColumn = {
  key: string
  headClassName: string
  cellClassName: string
  header: ReactNode
  render: (row: Row) => ReactNode
}

const initialRows: Row[] = [
  {
    id: 1,
    error: '',
    item: 'A01',
    lot: 'L01',
    status: '追加',
    build: 2,
    release: 1,
    move: 'W001',
    moveStorage: '',
    name: '品目1',
    moveStorage2: '棚A',
  },
  {
    id: 2,
    error: '',
    item: 'B02',
    lot: 'L02',
    status: '解除',
    build: 1,
    release: 0,
    move: 'W002',
    moveStorage: '',
    name: '品目2',
    moveStorage2: '棚B',
  },
  {
    id: 3,
    error: '',
    item: 'C03',
    lot: 'L03',
    status: 'OV対応要',
    build: 3,
    release: 2,
    move: 'W003',
    moveStorage: '',
    name: '品目3',
    moveStorage2: '棚C',
  },
  {
    id: 4,
    error: '',
    item: 'D04',
    lot: 'L04',
    status: '構成中',
    build: 4,
    release: 1,
    move: 'W004',
    moveStorage: '',
    name: '品目4',
    moveStorage2: '棚D',
  },
  {
    id: 5,
    error: 'E',
    item: 'E05',
    lot: 'L05',
    status: '構成中',
    build: 2,
    release: 0,
    move: 'W005',
    moveStorage: '',
    name: '品目5',
    moveStorage2: '棚E',
  },
  {
    id: 6,
    error: '',
    item: 'F06',
    lot: 'L06',
    status: '構成中',
    build: 5,
    release: 3,
    move: 'W006',
    moveStorage: '',
    name: '品目6',
    moveStorage2: '棚F',
  },
  {
    id: 7,
    error: 'E',
    item: 'G07',
    lot: 'L07',
    status: '構成中',
    build: 1,
    release: 0,
    move: 'W007',
    moveStorage: '',
    name: '品目7',
    moveStorage2: '棚G',
  },
  {
    id: 8,
    error: '',
    item: 'H08',
    lot: 'L08',
    status: '構成中',
    build: 3,
    release: 1,
    move: 'W008',
    moveStorage: '',
    name: '品目8',
    moveStorage2: '棚H',
  },
  {
    id: 9,
    error: '',
    item: 'I09',
    lot: 'L09',
    status: '構成中',
    build: 2,
    release: 2,
    move: 'W009',
    moveStorage: '',
    name: '品目9',
    moveStorage2: '棚I',
  },
  {
    id: 10,
    error: 'E',
    item: 'J10',
    lot: 'L10',
    status: '構成中',
    build: 6,
    release: 2,
    move: 'W010',
    moveStorage: '',
    name: '品目10',
    moveStorage2: '棚J',
  },
]

const MOCK_PARENT_ITEM_NO_LENGTH = 7
const MOCK_JAN_LENGTHS = [8, 13] as const
const MOCK_SET_SERIAL_MIN_LENGTH = 3
const MOCK_PARENT_PASS_CODE = '0123456789012AB'
const MOCK_SCAN_JAN_LENGTH = 13
const MOCK_SCAN_PASS_CODE = '0123456789012BC'

const initialForm = {
  parentWarehouse: '',
  parentItemNo: '',
  moveWarehouse: '',
  moveStorage: '',
  qty: '1',
  janCode: '',
}

const SetRegisterPage = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([])
  const [form, setForm] = useState(initialForm)
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showParentJanError, setShowParentJanError] = useState(false)
  const [parentJanErrorMessage, setParentJanErrorMessage] = useState('')
  const [errorFocusTarget, setErrorFocusTarget] = useState<'parentJan' | 'janCode' | null>(null)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const parentWarehouseRef = useRef<HTMLSelectElement | null>(null)
  const parentJanCodeInputRef = useRef<HTMLInputElement | null>(null)
  const janCodeInputRef = useRef<HTMLInputElement | null>(null)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [isParentConfirmed, setIsParentConfirmed] = useState(false)

  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const activeRow = rows.find((row) => row.id === activeRowId) ?? null
  const pressedKeysRef = useRef<{f1: boolean; f8: boolean}>({f1: false, f8: false})
  const isAnyModalOpen =
    showHandInputConfirm ||
    showDeleteConfirm ||
    showNoSelectionConfirm ||
    showClearConfirm ||
    showCompleteConfirm ||
    showBackConfirm ||
    showParentJanError

  const closeAllModals = () => {
    setShowHandInputConfirm(false)
    setShowDeleteConfirm(false)
    setShowNoSelectionConfirm(false)
    setShowClearConfirm(false)
    setShowCompleteConfirm(false)
    setShowBackConfirm(false)
    setShowParentJanError(false)
    setErrorFocusTarget(null)
  }

  const showParentJanErrorModal = (message: string) => {
    setParentJanErrorMessage(message)
    setErrorFocusTarget('parentJan')
    setShowParentJanError(true)
  }

  const handleParentJanValidationError = (message: string) => {
    showParentJanErrorModal(message)
    setForm((prev) => ({...prev, parentItemNo: ''}))
    setIsParentConfirmed(false)
    setRows([])
    setTimeout(() => {
      parentJanCodeInputRef.current?.focus()
    }, 0)
  }

  const handleJanCodeValidationError = (message: string) => {
    setParentJanErrorMessage(message)
    setErrorFocusTarget('janCode')
    setShowParentJanError(true)
  }

  const confirmParent = () => {
    setIsParentConfirmed(true)
    setRows(initialRows)
  }

  const calculateJanCheckDigit = (base: string) => {
    if (!/^\d+$/.test(base)) return null
    if (base.length !== MOCK_JAN_LENGTHS[0] - 1 && base.length !== MOCK_JAN_LENGTHS[1] - 1) return null

    let sum = 0
    for (let i = 0; i < base.length; i += 1) {
      const n = Number(base[i])
      sum += (i % 2 === 0 ? 1 : 3) * n
    }
    return (10 - (sum % 10)) % 10
  }

  const isValidJanCode = (value: string) => {
    if (!/^\d+$/.test(value)) return false 
    if (!MOCK_JAN_LENGTHS.includes(value.length as (typeof MOCK_JAN_LENGTHS)[number])) return false
    const base = value.slice(0, -1)
    const checkDigit = Number(value[value.length - 1])
    const calculated = calculateJanCheckDigit(base)
    return calculated !== null && calculated === checkDigit
  }

  const validateParentJanCode = () => {
    if (isParentConfirmed) return
    const value = form.parentItemNo.trim()
    if (!value) return

    if (value === MOCK_PARENT_PASS_CODE) {
      confirmParent()
      return
    }

    // Existing manual entry flow: 7-digit item No. confirms parent directly.
    if (new RegExp(`^\\d{${MOCK_PARENT_ITEM_NO_LENGTH}}$`).test(value)) {
      confirmParent()
      return
    }

    let janPart = ''
    let setSerialPart = ''
    const janLength = [...MOCK_JAN_LENGTHS].sort((a, b) => b - a).find((len) => value.length >= len)
    if (!janLength) {
      handleParentJanValidationError('JANコード(親)が不正です。')
      return
    }
    janPart = value.slice(0, janLength)
    setSerialPart = value.slice(janLength)

    if (!isValidJanCode(janPart)) {
      handleParentJanValidationError('JANコード(親)が不正です。')
      return
    }

    if (setSerialPart.trim().length < MOCK_SET_SERIAL_MIN_LENGTH) {
      handleParentJanValidationError('JANコード(親)にセットシリアルが含まれていません。')
      return
    }

    confirmParent()
    return
  }

  const validateJanCode = () => {
    if (!isParentConfirmed) return
    const value = form.janCode.trim()

    if (value === MOCK_SCAN_PASS_CODE) {
      return
    }

    if (!value) {
      handleJanCodeValidationError('JANコードが不正です。')
      return
    }

    if (!/^\d+$/.test(value) || value.length !== MOCK_SCAN_JAN_LENGTH || !isValidJanCode(value)) {
      handleJanCodeValidationError('JANコードが不正です。')
    }
  }


  const clearRows = () => setRows([])
  const clearForm = () =>
    setForm(initialForm)

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
    setIsParentConfirmed(false)
    clearForm()
    clearRows()
    setActiveRowId(null)
    resetTableScroll()
  }

  const handleCancelClick = () => {
    closeAllModals()
    clearFormAndRows()
    setTimeout(() => {
      parentJanCodeInputRef.current?.focus()
      parentJanCodeInputRef.current?.select()
    }, 0)
  }

  useEffect(() => {
    parentJanCodeInputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!isParentConfirmed) return
    setTimeout(() => {
      janCodeInputRef.current?.focus()
    }, 0)
  }, [isParentConfirmed])

  const handleRowClick = (rowId: number) => {
    setActiveRowId(rowId)
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
    if (activeRow?.status === '\u8ffd\u52a0' || activeRow?.status === '\u004f\u0056\u5bfe\u5fdc\u8981' || activeRow?.status === '\u89e3\u9664' || activeRow?.status === '\u69cb\u6210\u4e2d') {
      closeAllModals()
      setShowDeleteConfirm(true)
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
      key: 'arrow',
      headClassName: 'col-arrow-head',
      cellClassName: 'col-arrow',
      header: '',
      render: (row) => (activeRowId === row.id ? <FaPlay className='col-row-arrow' /> : null),
    },
    {key: 'error', headClassName: 'col-error', cellClassName: 'col-error', header: '', render: (row) => row.error},
    {key: 'item', headClassName: 'col-item', cellClassName: 'col-item', header: '品目No.', render: (row) => row.item},
    {key: 'lot', headClassName: 'col-lot', cellClassName: 'col-lot', header: 'ロットシリアル', render: (row) => row.lot},
    {key: 'status', headClassName: 'col-status', cellClassName: 'col-status', header: '状態', render: (row) => row.status},
    {key: 'build', headClassName: 'col-num', cellClassName: 'col-num', header: '構成数', render: (row) => row.build},
    {key: 'release', headClassName: 'col-num', cellClassName: 'col-num', header: '解除数', render: (row) => row.release},
    {key: 'move', headClassName: 'col-move', cellClassName: 'col-move', header: '移動倉庫', render: (row) => row.move},
    {
      key: 'moveStorage',
      headClassName: 'col-move',
      cellClassName: 'col-move',
      header: '移動保管場所',
      render: (row) => row.moveStorage,
    },
    {key: 'name', headClassName: 'col-name', cellClassName: 'col-name', header: '品名', render: (row) => row.name},

  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>セット登録</div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row'>
                <label>倉庫（親）</label>
                <select
                  disabled={isParentConfirmed}
                  ref={parentWarehouseRef}
                  tabIndex={isParentConfirmed ? -1 : 1}
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
                <label>{isParentConfirmed ? '品目No.(親)' : 'JANコード(親)'}</label>
                <input
                  disabled={isParentConfirmed}
                  ref={parentJanCodeInputRef}
                  tabIndex={isParentConfirmed ? -1 : 2}
                  value={form.parentItemNo}
                  onChange={(e) => setForm({...form, parentItemNo: e.target.value})}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      validateParentJanCode()
                    }
                  }}
                />
              </div>
              <div className='set-row'>
                <label>移動倉庫</label>
                <select
                  disabled={!isParentConfirmed}
                  tabIndex={isParentConfirmed ? 1 : -1}
                  value={form.moveWarehouse}
                  onChange={(e) => setForm({...form, moveWarehouse: e.target.value})}
                >
                  <option value=''></option>
                  <option value='千葉倉庫（WMS）：W002'>千葉倉庫（WMS）：W002</option>
                  <option value='千葉倉庫（WMS）：W003'>千葉倉庫（WMS）：W003</option>
                  <option value='千葉倉庫（WMS）：W004'>千葉倉庫（WMS）：W004</option>
                </select>
              </div>
              <div className='set-row'>
                <label>移動保管場所</label>
                <input
                  disabled={!isParentConfirmed}
                  tabIndex={isParentConfirmed ? 2 : -1}
                  value={form.moveStorage}
                  onChange={(e) => setForm({...form, moveStorage: e.target.value})}
                />
              </div>

              <div className='set-row'>
                <label>数量</label>
                <input
                  disabled={!isParentConfirmed}
                  tabIndex={-1}
                  value={form.qty}
                  onChange={(e) => setForm({...form, qty: e.target.value})}
                  className='set-small'
                />
              </div>

              <div className='set-row'>
                <label>JANコード</label>
                <input
                  disabled={!isParentConfirmed}
                  ref={janCodeInputRef}
                  tabIndex={isParentConfirmed ? 3 : -1}
                  value={form.janCode}
                  onChange={(e) => setForm({...form, janCode: e.target.value})}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      validateJanCode()
                    }
                  }}
                />
              </div>
            </div>

            <TableSection
              columns={tableColumns}
              rows={rows}
              rowTabIndex={isParentConfirmed ? 4 : -1}
              scrollRef={tableScrollRef}
              gridClassName='set-register-table'
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              onRowActivate={(rowKey) => setActiveRowId(Number(rowKey))}
            />

            <ActionFooter columns={5}>
              <button
                tabIndex={isParentConfirmed ? 5 : 3}
                className='set-btn set-danger'
                onClick={() => setShowClearConfirm(true)}
              >
                破棄
              </button>
              <button
                tabIndex={isParentConfirmed ? 6 : 4}
                className='set-btn set-primary'
                onClick={() => setShowCompleteConfirm(true)}
              >
                完了
              </button>     
              <button
                tabIndex={isParentConfirmed ? 7 : 5}
                className='set-btn set-success'
                onClick={() => handleReleaseClick()}
              >
                解除
              </button>
              <button
                tabIndex={-1}
                className='set-btn set-primary set-hand-input-btn'
                onClick={() => handleReleaseClick({forceHandInput: true})}
              >
                手入力
              </button>
              <button
                tabIndex={isParentConfirmed ? 8 : 6}
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
                        navigate('/factory/set-register/hand-input')
                      }}
                    >
                      YES
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => {
                        setShowHandInputConfirm(false)
                      }}
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
                  <div className='set-modal-body'>{activeRow?.status === '\u89e3\u9664' ? (<>{'\u9078\u629e\u54c1\u76ee\u306e0\u3092'}<br />{'\u53d6\u308a\u6d88\u3057\u307e\u3059\u304b\uff1f'}</>) : activeRow?.status === '\u69cb\u6210\u4e2d' ? (<>{'\u9078\u629e\u54c1\u76ee\u30921\u500b\u3001'}<br />{'\u30bb\u30c3\u30c8\u89e3\u9664\u3057\u307e\u3059\u304b\uff1f'}</>) : (<>{'\u30bb\u30c3\u30c8\u8ffd\u52a0\u54c1\u3067\u3059\u3002'}<br />{'\u524a\u9664\u3057\u307e\u3059\u304b\uff1f'}</>)}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        if (activeRowId !== null) {
                          setRows((prevRows) =>
                            prevRows.map((row) =>
                              row.id === activeRowId && row.status === '\u69cb\u6210\u4e2d'
                                ? {...row, status: '\u89e3\u9664'}
                                : row,
                            ),
                          )
                        }
                        setShowDeleteConfirm(false)
                      }}
                    >
                      YES
                    </button>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      NO
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
                  <div className='set-modal-body'>選択行を削除しましま?</div>
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
                  <div className='set-modal-body'>セット構成登録を完了しますか？</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-no'
                      onClick={() => {setShowCompleteConfirm(false)}}
                    >
                      YES
                    </button>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => setShowCompleteConfirm(false)}
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
                      onClick={handleCancelClick}
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showParentJanError && (
              <div className='set-modal-backdrop' role='presentation'>
                <div className='set-modal' role='dialog' aria-modal='true'>
                  <div className='set-modal-header'>確認</div>
                  <div className='set-modal-body'>{parentJanErrorMessage}</div>
                  <div className='set-modal-actions'>
                    <button
                      className='set-modal-btn set-modal-yes'
                      onClick={() => {
                        setShowParentJanError(false)
                        setTimeout(() => {
                          if (errorFocusTarget === 'parentJan') {
                            parentJanCodeInputRef.current?.focus()
                            parentJanCodeInputRef.current?.select()
                          }
                          if (errorFocusTarget === 'janCode') {
                            janCodeInputRef.current?.focus()
                            janCodeInputRef.current?.select()
                          }
                          setErrorFocusTarget(null)
                        }, 0)
                      }}
                    >
                      はい
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

export {SetRegisterPage}
