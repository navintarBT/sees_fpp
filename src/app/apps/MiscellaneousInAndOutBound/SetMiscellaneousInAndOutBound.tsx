import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlay } from 'react-icons/fa'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import { TableSection, type TableColumn as TFTableColumn } from '../../components/TableSection/TableSection'

type Row = {
  id: number
  error: string
  item: string
  lot: string
  status: string
  build: string
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

const SetMiscellaneousInAndOutBound = () => {
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState('1')
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      error: '',
      item: 'A01', // 品目No.
      lot: 'L01', // ロットシリアル
      status: 'W0020', // 状態
      build: 'W0023', // 構成数
      release: 1, // 
      move: '品目1', // 移動倉
      moveStorage: 'S1', // 移動保管場所
      name: '部品A', // 品名
      moveStorage2: '棚A', // 移動保管場所
    },
    {
      id: 2,
      error: '',
      item: 'B02',
      lot: 'L02',
      status: 'W0021',
      build: 'W0023',
      release: 3,
      move: '品目2',
      moveStorage: 'S2',
      name: '部品B',
      moveStorage2: '棚B',
    },
    {
      id: 3,
      error: '',
      item: 'C03',
      lot: 'L03',
      status: 'W0022',
      build: 'W0023',
      release: 2,
      move: '品目3',
      moveStorage: 'S3',
      name: '部品C',
      moveStorage2: '棚C',
    },
    {
      id: 4,
      error: '',
      item: 'D04',
      lot: 'L04',
      status: 'W0023',
      build: 'W0023',
      release: 1,
      move: '品目4',
      moveStorage: 'S4',
      name: '部品D',
      moveStorage2: '棚D',
    },
    {
      id: 5,
      error: 'E',
      item: 'E05',
      lot: 'L05',
      status: 'W0024',
      build: 'W0023',
      release: 2,
      move: '品目5',
      moveStorage: 'S5',
      name: '部品E',
      moveStorage2: '棚E',
    },
    {
      id: 6,
      error: '',
      item: 'F06',
      lot: 'L06',
      status: 'W0025',
      build: 'W0023',
      release: 2,
      move: '品目6',
      moveStorage: 'S6',
      name: '部品F',
      moveStorage2: '棚F',
    },
    {
      id: 7,
      error: 'E',
      item: 'G07',
      lot: 'L07',
      status: 'W0026',
      build: 'W0023',
      release: 1,
      move: '品目7',
      moveStorage: 'S7',
      name: '部品G',
      moveStorage2: '棚G',
    },
    {
      id: 8,
      error: '',
      item: 'H08',
      lot: 'L08',
      status: 'W0027',
      build: 'W0023',
      release: 1,
      move: '品目8',
      moveStorage: 'S8',
      name: '部品H',
      moveStorage2: '棚H',
    },
    {
      id: 9,
      error: '',
      item: 'I09',
      lot: 'L09',
      status: 'W0028',
      build: 'W0023',
      release: 1,
      move: '品目9',
      moveStorage: 'S9',
      name: '部品I',
      moveStorage2: '棚I',
    },
    {
      id: 10,
      error: 'E',
      item: 'J10',
      lot: 'L10',
      status: 'W0029',
      build: 'W0023',
      release: 1,
      move: '品目10',
      moveStorage: 'S10',
      name: '部品J',
      moveStorage2: '棚J',
    },
    {
      id: 11,
      error: 'E',
      item: 'J11',
      lot: 'L11',
      status: 'W0030',
      build: 'W0023',
      release: 1,
      move: '品目11',
      moveStorage: 'S11',
      name: '部品J',
      moveStorage2: '棚J',
    },
    {
      id: 12,
      error: 'E',
      item: 'J12',
      lot: 'L12',
      status: 'W0031',
      build: 'W0023',
      release: 2,
      move: '品目12',
      moveStorage: 'S12',
      name: '部品J',
      moveStorage2: '棚J',
    },
  ])
  const [form, setForm] = useState({
    parentWarehouse: '羽田製品倉庫：W0040',
    parentItemNo: '0193090',
    moveWarehouse: '千葉倉庫（WMS）：W002',
    moveStorage: '',
    qty: '',
    janCode: '',
  })
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [qty, setQty] = useState(1);

  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const activeRow = rows.find((row) => row.id === activeRowId) ?? null
  const pressedKeysRef = useRef<{ f1: boolean; f8: boolean }>({ f1: false, f8: false })
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

  const handleRowClick = (rowId: number) => {
    setActiveRowId(rowId)
  }

  const handleReleaseClick = (options?: { forceRelease?: boolean; forceHandInput?: boolean }) => {
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
    closeAllModals()
    setShowDeleteConfirm(true)
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
        handleReleaseClick({ forceHandInput: true })
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
        handleReleaseClick({ forceRelease: true })
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
    { key: 'error', headClassName: 'col-error', cellClassName: 'col-error', header: '', render: (row) => row.error },
    { key: 'item', headClassName: 'col-item', cellClassName: 'col-item', header: '品目No.', render: (row) => row.item },
    { key: 'lot', headClassName: 'col-lot', cellClassName: 'col-lot', header: 'ロットシリアル', render: (row) => row.lot },
    { key: 'status', headClassName: 'col-status', cellClassName: 'col-status', header: '倉庫', render: (row) => row.status },
    { key: 'build', headClassName: 'col-num', cellClassName: 'col-num', header: '保管場所', render: (row) => row.build },
    { key: 'release', headClassName: 'col-num', cellClassName: 'col-num', header: '引当数', render: (row) => row.release },
    { key: 'move', headClassName: 'col-move', cellClassName: 'col-move', header: '品名', render: (row) => row.move },
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>予定なし入出庫登録</div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row'>
                <label>倉庫</label>
                <select
                  value={form.parentWarehouse}
                  onChange={(e) => setForm({ ...form, parentWarehouse: e.target.value })}
                >
                  <option value=''></option>
                  <option value='倉庫A:W0040'>倉庫A:W0040</option>
                  <option value='倉庫B:W0041'>倉庫B:W0041</option>
                  <option value='倉庫C:W0042'>倉庫C:W0042</option>
                </select>
              </div>
              <div className='set-row'>
                <label>保管場所</label>
                <input value={form.moveStorage}
                  onChange={(e) => setForm({ ...form, moveStorage: e.target.value })} />
              </div>

              <div className='set-row'>
                <label>引当数</label>
                <div className='pg-sign-group'>
                  <select className='pg-sign-select' >
                    <option value='+'>+</option>
                    <option value='-'>-</option>
                  </select>
                  <input value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div className='set-row '>
                <label>JANコード</label>
                <input value={form.janCode}
                  onChange={(e) => setForm({ ...form, janCode: e.target.value })} />
              </div>
            </div>
            <TableSection
              className='set-table-miscellaneous'
              columns={tableColumns}
              rows={rows}
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              onRowActivate={(rowKey) => setActiveRowId(Number(rowKey))}
            />

            <ActionFooter columns={5}>
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
                className='set-btn set-success'
                onClick={() => handleReleaseClick()}
              >
                削除
              </button>
              <button
                className='set-btn set-primary set-hand-input-btn'
                onClick={() => handleReleaseClick({ forceHandInput: true })}
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
                      navigate('/factory/miscellaneous-in-and-out-bound')
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
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>選択した行を削除します。<br />よろしいですか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      if (activeRowId !== null) {
                        setRows((prev) => prev.filter((row) => row.id !== activeRowId))
                        setActiveRowId(null)
                      }
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
                      navigate('/factory')
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

export { SetMiscellaneousInAndOutBound }


