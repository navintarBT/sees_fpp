import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlay } from 'react-icons/fa'
import { ActionFooter } from '../../components/ActionFooter/ActionFooter'
import { TableSection, type TableColumn as TFTableColumn } from '../../components/TableSection/TableSection'

type Row = {
  id: number
  itemNo: string      // 品目No.
  lotSerial: string   // ロットシリアル
  buildQty: number    // 構成数 (from セット構成済みデータ)
  returnQty: number   // 戻り (読込データの数量)
  status: string      // 状態 (ブランク:正常, 04:調査中)
  itemName: string    // 品名
  error?: string
}

type TableColumn = {
  key: string
  headClassName: string
  cellClassName: string
  header: ReactNode
  render: (row: Row) => ReactNode
}

const SetReturnConfiguration = () => {
  const navigate = useNavigate()

  // State for loaded data (読込データ from server)
  const [loadedData, setLoadedData] = useState<Row[]>([])
  const [hasLoadedData, setHasLoadedData] = useState(false)

  // Form state
  const [parentJanCode, setParentJanCode] = useState('')
  const [parentStatus, setParentStatus] = useState('')
  const [parentQty, setParentQty] = useState(1)
  const [janCode, setJanCode] = useState('')

  const [activeRowId, setActiveRowId] = useState<number | null>(null)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const parentJanCodeInputRef = useRef<HTMLInputElement | null>(null)

  // Modal states
  const [showHandInputConfirm, setShowHandInputConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showNoSelectionConfirm, setShowNoSelectionConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showEmptyParentWarning, setShowEmptyParentWarning] = useState(false)
  const [showNormalConfirm, setShowNormalConfirm] = useState(false)
  const [showIncompleteConfirm, setShowIncompleteConfirm] = useState(false)
  const [showStatusChangeConfirm, setShowStatusChangeConfirm] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  const pressedKeysRef = useRef<{ f1: boolean; f8: boolean }>({ f1: false, f8: false })

  const isAnyModalOpen =
    showHandInputConfirm ||
    showDeleteConfirm ||
    showNoSelectionConfirm ||
    showClearConfirm ||
    showCompleteConfirm ||
    showBackConfirm ||
    showEmptyParentWarning ||
    showNormalConfirm ||
    showIncompleteConfirm ||
    showStatusChangeConfirm

  const activeRow = loadedData.find((row) => row.id === activeRowId) ?? null

  // Check if parent JAN code is editable (has loaded data)
  const isParentJanCodeEditable = true

  // Close all modals
  const closeAllModals = () => {
    setShowHandInputConfirm(false)
    setShowDeleteConfirm(false)
    setShowNoSelectionConfirm(false)
    setShowClearConfirm(false)
    setShowCompleteConfirm(false)
    setShowBackConfirm(false)
    setShowEmptyParentWarning(false)
    setShowNormalConfirm(false)
    setShowIncompleteConfirm(false)
    setShowStatusChangeConfirm(false)
  }

  // Clear all data and reset to initial state
  const clearAllData = () => {
    setLoadedData([])
    setHasLoadedData(false)
    setParentJanCode('')
    setParentStatus('')
    setParentQty(1)
    setJanCode('')
    setActiveRowId(null)
    resetTableScroll()
  }

  const resetTableScroll = () => {
    const el = tableScrollRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollTop = 0
      el.scrollLeft = 0
    })
  }

  // 完了ボタン処理 - based on document section 4
  const handleCompleteClick = () => {
    // ４－１．JANコード(親)入力チェック
    if (!hasLoadedData && !parentJanCode) {
      setShowEmptyParentWarning(true)
      return
    }

    // ４－４．読込数全量判定
    // Check if there are any rows where 構成 - 戻り > 0
    const hasUnreturnedItems = loadedData.some((row) => row.buildQty - row.returnQty > 0)

    if (hasUnreturnedItems) {
      // ４－４－１．明細．構成 - 明細．戻り ＞ 0の行がある
      setShowIncompleteConfirm(true)
    } else {
      // ４－４－２．明細．構成 - 明細．戻り ＞ 0の行がない
      setShowNormalConfirm(true)
    }
  }

  // Confirm registration
  const confirmRegistration = () => {
    setShowNormalConfirm(false)
    setShowIncompleteConfirm(false)
    // Simulate registration
    setShowCompleteConfirm(true)
    clearAllData()
  }

  // 削除ボタン処理 - based on document section 8
  const handleDeleteClick = () => {
    if (isAnyModalOpen) return

    // ８－１．明細部が存在する場合
    if (!activeRow) {
      // ８－２．明細部が存在しない場合
      setShowNoSelectionConfirm(true)
      return
    }

    // ８－３．選択行の読込数が0の場合 check (Disabled for mockup to allow deleting rows)
    // if (activeRow.returnQty === 0) {
    //   setShowNoSelectionConfirm(true)
    //   return
    // }

    // ８－４．確認メッセージ表示
    setShowDeleteConfirm(true)
  }

  // Execute delete
  const executeDelete = () => {
    if (activeRowId !== null) {
      // Remove the selected row's read data
      setLoadedData((prev) => prev.filter((row) => row.id !== activeRowId))
      setActiveRowId(null)
    }
    setShowDeleteConfirm(false)
  }

  // 破棄ボタン処理 - based on document section 5
  const handleClearClick = () => {
    if (isAnyModalOpen) return
    setShowClearConfirm(true)
  }

  const executeClear = () => {
    clearAllData()
    setShowClearConfirm(false)
  }

  // 手入力ボタン処理 - based on document section 7
  const handleHandInputClick = () => {
    if (isAnyModalOpen) return
    setShowHandInputConfirm(true)
  }

  // 戻るボタン処理 - based on document section 6
  const handleBackClick = () => {
    if (isAnyModalOpen) return
    setShowBackConfirm(true)
  }

  const executeBack = () => {
    navigate('/factory')
  }

  // Toggle status for selected row - based on document section 9
  const toggleRowStatus = () => {
    if (activeRow) {
      // Toggle between ブランク (normal) and 04 (調査中)
      const newStatus = activeRow.status === '04' ? '' : '04'
      setLoadedData((prev) =>
        prev.map((row) =>
          row.id === activeRow.id ? { ...row, status: newStatus } : row
        )
      )
    }
    setShowStatusChangeConfirm(false)
  }

  // Keyboard shortcuts - based on document section "ショートカットキー"
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isAnyModalOpen) return

      // Enter key on detail row - toggle status
      if (event.key === 'Enter' && activeRow && document.activeElement?.tagName !== 'BUTTON') {
        event.preventDefault()
        setShowStatusChangeConfirm(true)
        return
      }

      // F1 + F8 combination for hand input
      if (event.key === 'F1') {
        pressedKeysRef.current.f1 = true
      }
      if (event.key === 'F8') {
        pressedKeysRef.current.f8 = true
      }
      if (pressedKeysRef.current.f1 && pressedKeysRef.current.f8) {
        event.preventDefault()
        handleHandInputClick()
        return
      }

      // F1 - 破棄
      if (event.key === 'F1') {
        event.preventDefault()
        handleClearClick()
        return
      }

      // F2 - 完了
      if (event.key === 'F2') {
        event.preventDefault()
        handleCompleteClick()
        return
      }

      // F3 - 削除
      if (event.key === 'F3') {
        event.preventDefault()
        handleDeleteClick()
        return
      }

      // F4 - 戻る
      if (event.key === 'F4') {
        event.preventDefault()
        handleBackClick()
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

  const handleParentJanCodeSubmit = () => {
    if (parentJanCode) {
      const mockSetData: Row[] = [
        { id: 1, itemNo: 'A01', lotSerial: 'L01', buildQty: 1, returnQty: 0, status: '', itemName: '部品A' },
        { id: 2, itemNo: 'B02', lotSerial: 'L02', buildQty: 2, returnQty: 0, status: '', itemName: '部品B' },
        { id: 3, itemNo: 'C03', lotSerial: 'L03', buildQty: 1, returnQty: 0, status: '', itemName: '部品C' },
        { id: 4, itemNo: 'D04', lotSerial: 'L04', buildQty: 1, returnQty: 0, status: '', itemName: '部品D' },
        { id: 5, itemNo: 'E05', lotSerial: 'L05', buildQty: 1, returnQty: 0, status: '', itemName: '部品E', error: 'E' },
        { id: 6, itemNo: 'F06', lotSerial: 'L06', buildQty: 2, returnQty: 0, status: '', itemName: '部品F' },
        { id: 7, itemNo: 'G07', lotSerial: 'L07', buildQty: 1, returnQty: 0, status: '', itemName: '部品G', error: 'E' },
        { id: 8, itemNo: 'H08', lotSerial: 'L08', buildQty: 3, returnQty: 0, status: '', itemName: '部品H' },
        { id: 9, itemNo: 'I09', lotSerial: 'L09', buildQty: 1, returnQty: 0, status: '', itemName: '部品I' },
        { id: 10, itemNo: 'J10', lotSerial: 'L10', buildQty: 1, returnQty: 0, status: '', itemName: '部品J', error: 'E' },
        { id: 11, itemNo: 'J11', lotSerial: 'L11', buildQty: 1, returnQty: 0, status: '', itemName: '部品J', error: 'E' },
        { id: 12, itemNo: 'J12', lotSerial: 'L12', buildQty: 1, returnQty: 0, status: '', itemName: '部品J', error: 'E' },
      ]
      setLoadedData(mockSetData)
      setHasLoadedData(true)
    }
  }

  const tableColumns: Array<TFTableColumn<Row>> = [
    {
      key: 'arrow',
      headClassName: 'col-arrow-head',
      cellClassName: 'col-arrow',
      header: '',
      render: (row) => (activeRowId === row.id ? <FaPlay className='col-row-arrow' /> : null),
    },
    {
      key: 'itemNo',
      headClassName: 'col-item',
      cellClassName: 'col-item',
      header: '品目No.',
      render: (row) => row.itemNo
    },
    {
      key: 'lotSerial',
      headClassName: 'col-lot',
      cellClassName: 'col-lot',
      header: 'ロットシリアル',
      render: (row) => row.lotSerial
    },
    {
      key: 'buildQty',
      headClassName: 'col-num',
      cellClassName: 'col-num',
      header: '構成',
      render: (row) => row.buildQty
    },
    {
      key: 'returnQty',
      headClassName: 'col-num',
      cellClassName: 'col-num',
      header: '戻り',
      render: (row) => row.returnQty
    },
    {
      key: 'status',
      headClassName: 'col-status',
      cellClassName: 'col-status',
      header: '状態',
      render: (row) => row.status === '04' ? '調査中' : ''
    },
    {
      key: 'itemName',
      headClassName: 'col-move',
      cellClassName: 'col-move',
      header: '品名',
      render: (row) => row.itemName
    },
  ]

  const handleJanCodeScan = () => {
    if (!janCode) {
      setScanError('JANコードを入力して下さい。')
      return
    }

    // สำหรับทดสอบ: ถ้าพิมพ์ตัวเลขธรรมดา ให้ค้นหาจาก itemNo
    const matchedRow = loadedData.find(row =>
      row.itemNo === janCode ||
      row.lotSerial === janCode
    )

    if (!matchedRow) {
      setScanError('構成データに品目が存在しません。')
      setJanCode('')
      return
    }

    // ตรวจสอบจำนวน
    if (matchedRow.returnQty + 1 > matchedRow.buildQty) {
      setScanError('構成数を超えています。')
      setJanCode('')
      return
    }

    // อัปเดต
    setLoadedData(prev =>
      prev.map(row =>
        row.id === matchedRow.id
          ? { ...row, returnQty: row.returnQty + 1 }
          : row
      )
    )
    setJanCode('')
    setScanError(null)
  }

  // ฟังก์ชันคำนวณ Check Digit (ตามข้อ 6.補足説明)
  const validateCheckDigit = (janCode: string): boolean => {
    if (janCode.length < 13) return false

    // ดึง 13 หลักแรก (ไม่รวม check digit หลักสุดท้าย)
    const codeWithoutCheck = janCode.slice(0, 13)
    const providedCheckDigit = parseInt(janCode.slice(13), 10)

    let evenSum = 0
    let oddSum = 0

    for (let i = 0; i < codeWithoutCheck.length; i++) {
      const digit = parseInt(codeWithoutCheck[i], 10)
      if ((i + 1) % 2 === 0) {
        evenSum += digit
      } else {
        oddSum += digit
      }
    }

    const calculatedCheckDigit = (10 - ((evenSum * 3 + oddSum) % 10)) % 10
    return calculatedCheckDigit === providedCheckDigit
  }

  return (
    <div className='mockup-page'>
      <div className='mockup-stage mockup-stage-dark'>
        <div className='mockup-frame'>
          <div className='set-header'>セット戻り構成登録</div>
          <div className='set-body'>
            <div className='set-form'>
              {/* １．JANコード(親) - based on document section 2 */}
              <div className='set-row'>
                <label>JANコード(親)</label>
                <input
                  ref={parentJanCodeInputRef}
                  autoFocus
                  value={parentJanCode}
                  onChange={(e) => setParentJanCode(e.target.value)}
                  onBlur={handleParentJanCodeSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleParentJanCodeSubmit()}
                  readOnly={!isParentJanCodeEditable}
                  className={!isParentJanCodeEditable ? 'set-input-gray' : ''}
                  style={!isParentJanCodeEditable ? { backgroundColor: '#e5e7eb' } : {}}
                />
              </div>

              {/* 状態 - based on document specification */}
              <div className='rlr-row2'>
                <label>状態</label>
                <div className="rlr-qty-group badioBtnFun10">
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="normal"
                      checked={parentStatus === ''}
                      onChange={() => setParentStatus('')}
                      disabled={hasLoadedData}
                    />
                    正常
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="status"
                      value="investigating"
                      checked={parentStatus === '04'}
                      onChange={() => setParentStatus('04')}
                      disabled={hasLoadedData}
                    />
                    調査中
                  </label>
                </div>
              </div>

              {/* 数量 - fixed to 1 as per document */}
              <div className='set-row'>
                <label>数量</label>
                <input
                  value={parentQty}
                  readOnly
                  className='set-small set-input-gray'
                  style={{ backgroundColor: '#e5e7eb', outline: 'none' }}
                />
              </div>

              {/* JANコード - editable when has loaded data */}
              <div className='set-row'>
                <label>JANコード</label>
                <input
                  value={janCode}
                  onChange={(e) => {
                    setJanCode(e.target.value)
                    setScanError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleJanCodeScan()
                    }
                  }}
                  readOnly={true}
                  style={{ backgroundColor: '#e5e7eb', outline: 'none' }}
                />
              </div>
            </div>

            {/* 明細部 - based on document section "明細部" */}
            <TableSection
              columns={tableColumns}
              rows={loadedData}
              gridClassName='set-return-configuration-table'
              scrollRef={tableScrollRef}
              getRowKey={(row) => row.id}
              activeRowKey={activeRowId}
              onRowActivate={(rowKey) => setActiveRowId(Number(rowKey))}
            />

            <ActionFooter columns={5}>
              <button
                className='set-btn set-danger'
                onClick={handleClearClick}
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
                onClick={handleDeleteClick}
              >
                削除
              </button>
              <button
                className='set-btn set-primary set-hand-input-btn'
                onClick={handleHandInputClick}
              >
                手入力
              </button>
              <button
                className='set-btn set-warning'
                onClick={handleBackClick}
              >
                戻る
              </button>
            </ActionFooter>
          </div>

          {/* 手入力確認 - based on document 7-1 */}
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
                      navigate('/factory/return-configuration', { state: { parentItemNo: parentJanCode } })
                    }}
                  >
                    YES
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowHandInputConfirm(false)}
                  >
                    NO
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 削除確認 - based on document 8-4 */}
          {showDeleteConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>選択行を削除しますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={executeDelete}
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

          {/* No selection error - based on document 8-2-1 */}
          {showNoSelectionConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>エラー</div>
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

          {/* 破棄確認 - based on document 5-1 */}
          {showClearConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>読込データを破棄します。<br />宜しいですか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={executeClear}
                  >
                    YES
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowClearConfirm(false)}
                  >
                    NO
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 完了成功 - based on document 4-6-3 */}
          {showCompleteConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>レンタル戻り構成を登録しました。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowCompleteConfirm(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* JANコード(親)未入力エラー - based on document 4-1 */}
          {showEmptyParentWarning && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>エラー</div>
                <div className='set-modal-body'>JANコード(親)を入力して下さい。</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => setShowEmptyParentWarning(false)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 全量登録確認 - based on document 4-4-2 */}
          {showNormalConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>レンタル戻り構成登録を完了しますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={confirmRegistration}
                  >
                    OK
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowNormalConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 未返却あり警告 - based on document 4-4-1 */}
          {showIncompleteConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>警告</div>
                <div className='set-modal-body'>
                  戻りのない構成品は全て"調査中"として登録されます。<br />
                  完了しますか？
                </div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={confirmRegistration}
                  >
                    OK
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowIncompleteConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 状態変更確認 - based on document 9-2 */}
          {showStatusChangeConfirm && activeRow && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>
                  選択行の状態を
                  {activeRow.status === '04' ? '「正常」' : '「調査中」'}
                  に変更しますか？
                </div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={toggleRowStatus}
                  >
                    YES
                  </button>
                  <button
                    className='set-modal-btn set-modal-no'
                    onClick={() => setShowStatusChangeConfirm(false)}
                  >
                    NO
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 戻る確認 - based on document 6 */}
          {showBackConfirm && (
            <div className='set-modal-backdrop' role='presentation'>
              <div className='set-modal' role='dialog' aria-modal='true'>
                <div className='set-modal-header'>確認</div>
                <div className='set-modal-body'>メニューに戻ります。<br />読込データを破棄しますか？</div>
                <div className='set-modal-actions'>
                  <button
                    className='set-modal-btn set-modal-yes'
                    onClick={() => {
                      setShowBackConfirm(false)
                      clearAllData()
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
                      parentJanCodeInputRef.current?.focus()
                    }}
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

export { SetReturnConfiguration }