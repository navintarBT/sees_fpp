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

const allRowsData: Row[] = [
  { id: 1, error: '', item: 'A01', lot: 'L01', status: 'W0020', build: 'W0023', release: 1, move: '品目1', moveStorage: 'S1', name: '部品A', moveStorage2: '棚A' },
  { id: 2, error: '', item: 'B02', lot: 'L02', status: 'W0021', build: 'W0023', release: 3, move: '品目2', moveStorage: 'S2', name: '部品B', moveStorage2: '棚B' },
  { id: 3, error: '', item: 'C03', lot: 'L03', status: 'W0022', build: 'W0023', release: 2, move: '品目3', moveStorage: 'S3', name: '部品C', moveStorage2: '棚C' },
  { id: 4, error: '', item: 'D04', lot: 'L04', status: 'W0023', build: 'W0023', release: 1, move: '品目4', moveStorage: 'S4', name: '部品D', moveStorage2: '棚D' },
  { id: 6, error: '', item: 'F06', lot: 'L06', status: 'W0025', build: 'W0023', release: 2, move: '品目6', moveStorage: 'S6', name: '部品F', moveStorage2: '棚F' },
  { id: 8, error: '', item: 'H08', lot: 'L08', status: 'W0027', build: 'W0023', release: 1, move: '品目8', moveStorage: 'S8', name: '部品H', moveStorage2: '棚H' },
  { id: 9, error: '', item: 'I09', lot: 'L09', status: 'W0028', build: 'W0023', release: 1, move: '品目9', moveStorage: 'S9', name: '部品I', moveStorage2: '棚I' },
  { id: 10, error: '', item: 'J10', lot: 'L10', status: 'W0029', build: 'W0023', release: 1, move: '品目10', moveStorage: 'S10', name: '部品J', moveStorage2: '棚J' },
]

const SetMiscellaneousInAndOutBound = () => {
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState('1')
  const [rows, setRows] = useState<Row[]>([])
  const [form, setForm] = useState({
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
  const [showEmptyWarning, setShowEmptyWarning] = useState(false)       // HT001-E
  const [showNormalConfirm, setShowNormalConfirm] = useState(false)     // HT002-I
  const [showStockError, setShowStockError] = useState(false)           // HT902-E
  const [showSerialError, setShowSerialError] = useState(false)         // HT901-E
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [showInvalidJanCode, setShowInvalidJanCode] = useState(false)
  const [showInvalidLotSerial, setShowInvalidLotSerial] = useState(false)
  const [showNetworkError, setShowNetworkError] = useState(false)

  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const activeRow = rows.find((row) => row.id === activeRowId) ?? null
  const pressedKeysRef = useRef<{ f1: boolean; f8: boolean }>({ f1: false, f8: false })
  const backBtnRef = useRef<HTMLButtonElement>(null)
  const isAnyModalOpen =
    showHandInputConfirm ||
    showDeleteConfirm ||
    showNoSelectionConfirm ||
    showClearConfirm ||
    showCompleteConfirm ||
    showEmptyWarning ||
    showNormalConfirm ||
    showStockError ||
    showSerialError ||
    showBackConfirm ||
    showInvalidJanCode ||
    showInvalidLotSerial

  const closeAllModals = () => {
    setShowHandInputConfirm(false)
    setShowDeleteConfirm(false)
    setShowNoSelectionConfirm(false)
    setShowClearConfirm(false)
    setShowCompleteConfirm(false)
    setShowEmptyWarning(false)
    setShowNormalConfirm(false)
    setShowStockError(false)
    setShowSerialError(false)
    setShowBackConfirm(false)
    setShowInvalidJanCode(false)
    setShowInvalidLotSerial(false)
  }

  const clearRows = () => setRows([])
  const clearForm = () => {
    setForm({
      parentItemNo: '',
      moveWarehouse: '',
      moveStorage: '',
      qty: '',
      janCode: '',
    })
    setQuantity('1')
  }

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

  // ３－１．完了ボタン処理
  const handleCompleteClick = () => {
    if (isAnyModalOpen) return

    // HT001-E: 読込データが存在しない場合
    if (rows.length === 0) {
      setShowEmptyWarning(true)
      return
    }

    // HT002-I: 確認メッセージ表示
    setShowNormalConfirm(true)
  }

  // ３－７．DBサーバから処理結果受信（シミュレーション）
  const simulateServerResponse = () => {
    setShowNormalConfirm(false)

    // Simulate: rows with id 11,12 → HT901-E (シリアル重複)
    const serialErrorIds = [11, 12]
    const hasSerialError = rows.some((row) => serialErrorIds.includes(row.id))
    const isNetworkAvailable = Math.random() < 0.99

    if (!isNetworkAvailable) {
      setShowNetworkError(true)
      return
    }

    if (hasSerialError) {
      // ３－７－２．HT901-E: シリアルが重複しています
      setRows((prev) =>
        prev.map((row) =>
          serialErrorIds.includes(row.id) ? { ...row, error: 'E' } : row
        )
      )
      setShowSerialError(true)
      return
    }

    // ３－７－３．HT901-I: 成功
    clearFormAndRows()
    setActiveRowId(null)
    setShowCompleteConfirm(true)
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

  const janCodeRef = useRef<HTMLInputElement>(null)

  const handleJanCodeEnter = () => {
    setRows(allRowsData)
    setForm({ ...form })
    setTimeout(() => {
      janCodeRef.current?.focus()
    }, 0)
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
        handleCompleteClick()
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
    { key: 'move', headClassName: 'col-move-SetMis', cellClassName: 'col-move-SetMis', header: '品名', render: (row) => row.move },
  ]

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>予定なし入出庫</div>
          <div className='set-body'>
            <div className='set-form'>
              <div className='set-row'>
                <label>倉庫</label>
                <select
                  autoFocus
                  value={form.moveWarehouse}
                  onChange={(e) => setForm({ ...form, moveWarehouse: e.target.value })}
                >
                  <option value=''></option>
                  <option value='倉庫A:W0040'>倉庫A:W0040</option>
                  <option value='倉庫B:W0041'>倉庫B:W0041</option>
                  <option value='倉庫C:W0042'>倉庫C:W0042</option>
                </select>
              </div>
              <div className='set-row'>
                <label>保管場所</label>
                <input
                  value={form.moveStorage}
                  onChange={(e) => setForm({ ...form, moveStorage: e.target.value })}
                />
              </div>

              <div className='set-row'>
                <label>引当数</label>
                <div className='pg-sign-group'>
                  <select className='pg-sign-select'>
                    <option value='+'>+</option>
                    <option value='-'>-</option>
                  </select>
                  <input
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div className='set-row'>
                <label>JANコード</label>
                <input
                  ref={janCodeRef}
                  value={form.janCode}
                  onChange={(e) => setForm({ ...form, janCode: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleJanCodeEnter()
                    }
                  }}
                />
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
                onClick={handleCompleteClick}
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
                ref={backBtnRef}
                className='set-btn set-warning'
                onClick={() => setShowBackConfirm(true)}
              >
                戻る
              </button>
            </ActionFooter>
          </div>

          {/* Modals */}
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
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>選択行を削除しますか？</div>
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
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>選択行がありません。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowNoSelectionConfirm(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {showClearConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{'読込データを破棄します。\n宜しいですか？'}</div>
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

          {/* HT001-E: 読込データなしエラー */}
          {showEmptyWarning && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>エラー</div>
                <div className='set-modal-body'>読込データがありません。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowEmptyWarning(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HT002-I: 完了確認 */}
          {showNormalConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>予定なし入出庫登録を完了しますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={simulateServerResponse}
                  >
                    YES
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowNormalConfirm(false)}
                  >
                    NO
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HT902-E: 在庫不足エラー */}
          {showStockError && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>エラー</div>
                <div className='set-modal-body'>在庫が不足しています。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowStockError(false)
                      setTimeout(() => janCodeRef.current?.focus(), 0)
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HT901-E: シリアル重複エラー */}
          {showSerialError && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>エラー</div>
                <div className='set-modal-body'>シリアルが重複しています。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowSerialError(false)
                      setTimeout(() => backBtnRef.current?.focus(), 0)
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HT901-I: 完了成功 */}
          {showCompleteConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>予定なし入出庫を登録しました。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowCompleteConfirm(false)
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {showBackConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>{'メニューに戻ります。\n読込データを破棄しますか？'}</div>
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
                    onClick={() => {
                      setShowBackConfirm(false)
                      navigate('/factory')
                    }}
                  >
                    NO
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => {
                      setShowBackConfirm(false)
                      setTimeout(() => janCodeRef.current?.focus(), 0)
                    }}
                  > 
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          {showInvalidJanCode && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>エラー</div>
                <div className='set-modal-body'>JANコードが不正です。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowInvalidJanCode(false)
                      janCodeRef.current?.focus()
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {showInvalidLotSerial && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>エラー</div>
                <div className='set-modal-body'>ロットシリアルが30桁を越えています。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowInvalidLotSerial(false)
                      janCodeRef.current?.focus()
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {showNetworkError && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>エラー</div>
                <div className='set-modal-body'>{'ネットワークに接続出来ません。\n電波の届く場所で再度実行して下さい。'}</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowNetworkError(false)
                      janCodeRef.current?.focus()
                    }}
                  >
                    OK
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